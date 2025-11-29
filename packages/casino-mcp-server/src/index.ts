// Casino Idle Slots - Development MCP Server
// Implements Model Context Protocol for AI-assisted development
// Tools: diagnostics, lint, type checking, component analysis, mobile testing

import fs from "node:fs";
import path from "node:path";
import { exec } from "node:child_process";
import { promisify } from "node:util";

const execAsync = promisify(exec);

type ToolHandler = (input: unknown) => Promise<{
  content: { type: "text"; text: string }[];
}>;

interface ToolDefinition {
  name: string;
  description: string;
  inputSchema: unknown;
  handler: ToolHandler;
}

const tools = new Map<string, ToolDefinition>();

function resolveRepoRoot() {
  const candidates = [
    process.cwd(),
    path.resolve(process.cwd(), ".."),
    path.resolve(process.cwd(), "..", ".."),
  ];

  for (const candidate of candidates) {
    if (fs.existsSync(path.join(candidate, "src"))) {
      return candidate;
    }
  }

  return process.cwd();
}

const repoRoot = resolveRepoRoot();

function registerTool(def: Omit<ToolDefinition, "name"> & { name: string }) {
  tools.set(def.name, def);
}

// =============================================================================
// TOOL: Run TypeScript Type Check
// =============================================================================
registerTool({
  name: "run_typecheck",
  description: "Run TypeScript compiler to check for type errors in the Casino Idle Slots codebase. Returns all type errors found.",
  inputSchema: {
    type: "object",
    properties: {},
  },
  async handler() {
    try {
      const { stdout, stderr } = await execAsync("npx tsc --noEmit --pretty false", {
        cwd: repoRoot,
        timeout: 60000,
      });
      
      const output = stdout || stderr || "No type errors found! ✓";
      return {
        content: [{ type: "text" as const, text: output }],
      };
    } catch (err: any) {
      // TypeScript exits with error code when there are type errors
      const output = err.stdout || err.stderr || String(err);
      return {
        content: [{ type: "text" as const, text: `TypeScript Errors:\n${output}` }],
      };
    }
  },
});

// =============================================================================
// TOOL: Run ESLint
// =============================================================================
registerTool({
  name: "run_lint",
  description: "Run ESLint to check for code quality issues, unused imports, and potential bugs.",
  inputSchema: {
    type: "object",
    properties: {
      fix: {
        type: "boolean",
        description: "Whether to auto-fix fixable issues",
      },
    },
  },
  async handler(input: any) {
    const fix = input?.fix ? "--fix" : "";
    try {
      const { stdout, stderr } = await execAsync(`npx eslint . ${fix}`, {
        cwd: repoRoot,
        timeout: 120000,
      });
      
      const output = stdout || stderr || "No lint errors found! ✓";
      return {
        content: [{ type: "text" as const, text: output }],
      };
    } catch (err: any) {
      const output = err.stdout || err.stderr || String(err);
      return {
        content: [{ type: "text" as const, text: `ESLint Results:\n${output}` }],
      };
    }
  },
});

// =============================================================================
// TOOL: Full Diagnostics Check
// =============================================================================
registerTool({
  name: "run_diagnostics",
  description: "Run full diagnostics: TypeScript type check + ESLint. Use this to catch all errors before deploying.",
  inputSchema: {
    type: "object",
    properties: {},
  },
  async handler() {
    const results: string[] = [];
    
    // TypeScript check
    results.push("=== TypeScript Type Check ===\n");
    try {
      const { stdout, stderr } = await execAsync("npx tsc --noEmit --pretty false", {
        cwd: repoRoot,
        timeout: 60000,
      });
      results.push(stdout || stderr || "✓ No type errors\n");
    } catch (err: any) {
      results.push(err.stdout || err.stderr || String(err));
    }
    
    // ESLint check
    results.push("\n=== ESLint Check ===\n");
    try {
      const { stdout, stderr } = await execAsync("npx eslint . --format compact", {
        cwd: repoRoot,
        timeout: 120000,
      });
      results.push(stdout || stderr || "✓ No lint errors\n");
    } catch (err: any) {
      results.push(err.stdout || err.stderr || String(err));
    }
    
    return {
      content: [{ type: "text" as const, text: results.join("") }],
    };
  },
});

// =============================================================================
// TOOL: Analyze Component
// =============================================================================
registerTool({
  name: "analyze_component",
  description: "Analyze a React component file for potential issues: missing imports, unused variables, hook dependencies.",
  inputSchema: {
    type: "object",
    properties: {
      filepath: {
        type: "string",
        description: "Path to the component file (relative to src/)",
      },
    },
    required: ["filepath"],
  },
  async handler(input: any) {
    const filepath = input?.filepath;
    if (!filepath) {
      return {
        content: [{ type: "text" as const, text: "Error: filepath is required" }],
      };
    }

    const fullPath = path.join(repoRoot, "src", filepath);
    
    if (!fs.existsSync(fullPath)) {
      return {
        content: [{ type: "text" as const, text: `File not found: ${fullPath}` }],
      };
    }

    const content = fs.readFileSync(fullPath, "utf8");
    const analysis: string[] = [];
    
    analysis.push(`=== Analysis: ${filepath} ===\n\n`);
    
    // Check imports
    const importMatches = content.match(/import\s+{([^}]+)}\s+from/g) || [];
    const importedItems: string[] = [];
    importMatches.forEach(match => {
      const items = match.match(/{([^}]+)}/)?.[1];
      if (items) {
        items.split(',').forEach(item => {
          importedItems.push(item.trim().split(' as ')[0]);
        });
      }
    });
    
    // Check for unused imports (simple heuristic)
    const unusedImports: string[] = [];
    importedItems.forEach(item => {
      const regex = new RegExp(`\\b${item}\\b`, 'g');
      const occurrences = (content.match(regex) || []).length;
      if (occurrences <= 1) { // Only in import statement
        unusedImports.push(item);
      }
    });
    
    if (unusedImports.length > 0) {
      analysis.push(`⚠️ Potentially unused imports: ${unusedImports.join(', ')}\n`);
    } else {
      analysis.push(`✓ All imports appear to be used\n`);
    }
    
    // Check for common React issues
    const hasUseEffect = content.includes('useEffect');
    const hasUseCallback = content.includes('useCallback');
    const hasUseMemo = content.includes('useMemo');
    
    analysis.push(`\nHooks used:\n`);
    analysis.push(`- useEffect: ${hasUseEffect ? '✓' : '✗'}\n`);
    analysis.push(`- useCallback: ${hasUseCallback ? '✓' : '✗'}\n`);
    analysis.push(`- useMemo: ${hasUseMemo ? '✓' : '✗'}\n`);
    
    // Check for potential issues
    if (hasUseEffect && !content.includes('// eslint-disable')) {
      const effectsWithEmptyDeps = (content.match(/useEffect\([^)]+,\s*\[\s*\]\)/g) || []).length;
      if (effectsWithEmptyDeps > 0) {
        analysis.push(`\n⚠️ ${effectsWithEmptyDeps} useEffect(s) with empty dependency array - ensure this is intentional\n`);
      }
    }
    
    // File stats
    const lines = content.split('\n').length;
    analysis.push(`\nFile stats: ${lines} lines\n`);
    
    // Run ESLint on specific file
    analysis.push(`\n=== ESLint for this file ===\n`);
    try {
      const { stdout, stderr } = await execAsync(`npx eslint "${fullPath}" --format compact`, {
        cwd: repoRoot,
        timeout: 30000,
      });
      analysis.push(stdout || stderr || "✓ No issues\n");
    } catch (err: any) {
      analysis.push(err.stdout || err.stderr || "Could not run ESLint\n");
    }
    
    return {
      content: [{ type: "text" as const, text: analysis.join("") }],
    };
  },
});

// =============================================================================
// TOOL: Check Mobile Responsiveness
// =============================================================================
registerTool({
  name: "check_mobile_responsiveness",
  description: "Analyze components for mobile responsiveness issues: fixed widths, missing responsive classes, touch target sizes.",
  inputSchema: {
    type: "object",
    properties: {
      filepath: {
        type: "string",
        description: "Path to the component file (relative to src/), or leave empty to scan all",
      },
    },
  },
  async handler(input: any) {
    const filepath = input?.filepath;
    const results: string[] = [];
    
    const filesToCheck: string[] = [];
    
    if (filepath) {
      filesToCheck.push(path.join(repoRoot, "src", filepath));
    } else {
      // Scan key UI directories
      const dirs = ["src/components", "src/features"];
      for (const dir of dirs) {
        const fullDir = path.join(repoRoot, dir);
        if (fs.existsSync(fullDir)) {
          const files = getAllFiles(fullDir, [".tsx"]);
          filesToCheck.push(...files);
        }
      }
    }
    
    results.push(`=== Mobile Responsiveness Check ===\n`);
    results.push(`Scanning ${filesToCheck.length} file(s)...\n\n`);
    
    let issueCount = 0;
    
    for (const file of filesToCheck.slice(0, 20)) { // Limit to 20 files
      const content = fs.readFileSync(file, "utf8");
      const relativePath = path.relative(repoRoot, file);
      const issues: string[] = [];
      
      // Check for fixed pixel widths (potential responsiveness issues)
      const fixedWidths = content.match(/w-\[\d+px\]/g) || [];
      if (fixedWidths.length > 0) {
        issues.push(`  - Fixed pixel widths: ${fixedWidths.join(', ')}`);
      }
      
      // Check for missing responsive prefixes on layout classes
      const hasFlexWithoutResponsive = /className="[^"]*flex(?!-)[^"]*"/.test(content) && 
                                        !/className="[^"]*(sm:|md:|lg:)[^"]*"/.test(content);
      if (hasFlexWithoutResponsive && content.includes('grid')) {
        issues.push(`  - Consider adding responsive breakpoints (sm:, md:, lg:)`);
      }
      
      // Check for small touch targets
      const smallButtons = (content.match(/w-[1-7]\s|h-[1-7]\s|p-[0-1]\s/g) || []).length;
      if (smallButtons > 3) {
        issues.push(`  - Multiple small touch targets detected (< 44px recommended)`);
      }
      
      // Check for overflow handling
      if (content.includes('overflow-hidden') && !content.includes('overflow-y-auto') && !content.includes('ScrollArea')) {
        issues.push(`  - Has overflow-hidden without scroll handling`);
      }
      
      if (issues.length > 0) {
        results.push(`📱 ${relativePath}\n`);
        results.push(issues.join('\n') + '\n\n');
        issueCount += issues.length;
      }
    }
    
    if (issueCount === 0) {
      results.push(`✓ No obvious mobile responsiveness issues found!\n`);
    } else {
      results.push(`\nTotal: ${issueCount} potential issue(s) found.\n`);
    }
    
    return {
      content: [{ type: "text" as const, text: results.join("") }],
    };
  },
});

// =============================================================================
// TOOL: Get Build Status
// =============================================================================
registerTool({
  name: "get_build_status",
  description: "Try to build the project and report any errors.",
  inputSchema: {
    type: "object",
    properties: {
      fast: {
        type: "boolean",
        description: "Use fast build (skip type checking)",
      },
    },
  },
  async handler(input: any) {
    const fast = input?.fast;
    const cmd = fast ? "npm run build:fast" : "npm run build";
    
    try {
      const { stdout, stderr } = await execAsync(cmd, {
        cwd: repoRoot,
        timeout: 120000,
      });
      
      return {
        content: [{ type: "text" as const, text: `✓ Build successful!\n\n${stdout || stderr}` }],
      };
    } catch (err: any) {
      return {
        content: [{ type: "text" as const, text: `✗ Build failed:\n\n${err.stdout || err.stderr || String(err)}` }],
      };
    }
  },
});

// =============================================================================
// TOOL: Get Game Stats (Original)
// =============================================================================
registerTool({
  name: "get_game_stats",
  description: "Read and summarize current game constants (like default state and slot configs) from the Casino Idle Slots repo.",
  inputSchema: {
    type: "object",
    properties: {},
  },
  async handler() {
    const constantsPath = path.join(repoRoot, "src", "constants", "game.constants.ts");

    let content = "";
    try {
      content = fs.readFileSync(constantsPath, "utf8");
    } catch (err) {
      return {
        content: [{ type: "text" as const, text: `Failed to read game.constants.ts: ${String(err)}` }],
      };
    }

    const lines = content.split("\n");
    const defaultStateSnippet = lines
      .filter((line) => line.includes("DEFAULT_GAME_STATE") || line.includes("DEFAULT_STATE"))
      .slice(0, 50)
      .join("\n");

    return {
      content: [{ type: "text" as const, text: "Basic game constants snippet:\n" + defaultStateSnippet }],
    };
  },
});

// =============================================================================
// TOOL: List Assets (Original)
// =============================================================================
registerTool({
  name: "list_assets",
  description: "List top-level files under public/assets for Casino Idle Slots.",
  inputSchema: {
    type: "object",
    properties: {},
  },
  async handler() {
    const assetsDir = path.join(repoRoot, "public", "assets");

    try {
      const entries = fs.readdirSync(assetsDir, { withFileTypes: true });
      const listing = entries
        .map((e) => `${e.isDirectory() ? "[dir]" : "[file]"} ${e.name}`)
        .join("\n");

      return {
        content: [{ type: "text" as const, text: listing || "No assets found." }],
      };
    } catch (err) {
      return {
        content: [{ type: "text" as const, text: `Failed to list assets: ${String(err)}` }],
      };
    }
  },
});

// =============================================================================
// TOOL: Find Unused Exports
// =============================================================================
registerTool({
  name: "find_unused_exports",
  description: "Scan the codebase for potentially unused exports that could be cleaned up.",
  inputSchema: {
    type: "object",
    properties: {},
  },
  async handler() {
    const results: string[] = [];
    results.push("=== Scanning for unused exports ===\n\n");
    
    // Get all TypeScript files
    const srcDir = path.join(repoRoot, "src");
    const files = getAllFiles(srcDir, [".ts", ".tsx"]);
    
    // Build export map
    const exports: Map<string, string[]> = new Map();
    
    for (const file of files) {
      const content = fs.readFileSync(file, "utf8");
      const relativePath = path.relative(repoRoot, file);
      
      // Find named exports
      const exportMatches = content.match(/export\s+(const|function|class|interface|type|enum)\s+(\w+)/g) || [];
      const exportedNames = exportMatches.map(m => m.split(/\s+/).pop()!);
      
      if (exportedNames.length > 0) {
        exports.set(relativePath, exportedNames);
      }
    }
    
    // Check for imports
    const allContent = files.map(f => fs.readFileSync(f, "utf8")).join("\n");
    
    let unusedCount = 0;
    exports.forEach((names, file) => {
      const unused = names.filter(name => {
        // Simple heuristic: check if it's used anywhere
        const usageRegex = new RegExp(`\\b${name}\\b`, 'g');
        const usages = (allContent.match(usageRegex) || []).length;
        
        // If only appears once or twice (definition + maybe one use), might be unused
        return usages <= 2;
      });
      
      if (unused.length > 0) {
        results.push(`${file}:\n  - ${unused.join(', ')}\n`);
        unusedCount += unused.length;
      }
    });
    
    if (unusedCount === 0) {
      results.push("✓ No obviously unused exports found.\n");
    } else {
      results.push(`\n${unusedCount} potentially unused export(s) found.\n`);
      results.push("Note: This is a heuristic - verify before removing.\n");
    }
    
    return {
      content: [{ type: "text" as const, text: results.join("") }],
    };
  },
});

// =============================================================================
// Helper: Get all files recursively
// =============================================================================
function getAllFiles(dir: string, extensions: string[]): string[] {
  const files: string[] = [];
  
  try {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory() && !entry.name.startsWith('.') && entry.name !== 'node_modules') {
        files.push(...getAllFiles(fullPath, extensions));
      } else if (entry.isFile() && extensions.some(ext => entry.name.endsWith(ext))) {
        files.push(fullPath);
      }
    }
  } catch {
    // Ignore errors
  }
  
  return files;
}

// =============================================================================
// JSON-RPC 2.0 Server with MCP Protocol Support
// =============================================================================
interface JsonRpcRequest {
  id?: number | string | null;
  jsonrpc: "2.0";
  method: string;
  params?: unknown;
}

interface JsonRpcResponse {
  id: number | string | null;
  jsonrpc: "2.0";
  result?: unknown;
  error?: { code: number; message: string; data?: unknown };
}

// MCP Protocol version
const MCP_PROTOCOL_VERSION = "2024-11-05";

// Server capabilities
const SERVER_INFO = {
  name: "casino-dev-tools",
  version: "0.1.0",
};

function send(response: JsonRpcResponse) {
  const payload = JSON.stringify(response);
  process.stdout.write(payload + "\n");
}

process.stdin.setEncoding("utf8");
process.stdin.on("data", async (chunk) => {
  const text = typeof chunk === "string" ? chunk : chunk.toString("utf8");
  const lines = text.split(/\r?\n/).filter(Boolean);
  
  for (const line of lines) {
    let req: JsonRpcRequest;
    try {
      req = JSON.parse(line);
    } catch {
      continue;
    }

    const { id, method, params } = req;

    // MCP Initialize handshake
    if (method === "initialize") {
      send({
        id: id ?? null,
        jsonrpc: "2.0",
        result: {
          protocolVersion: MCP_PROTOCOL_VERSION,
          capabilities: {
            tools: {},
          },
          serverInfo: SERVER_INFO,
        },
      });
      continue;
    }

    // MCP Initialized notification (no response needed)
    if (method === "notifications/initialized" || method === "initialized") {
      // This is a notification, no response required
      console.error("[casino-mcp-server] Client initialized successfully");
      continue;
    }

    // Ping/pong for keep-alive
    if (method === "ping") {
      send({
        id: id ?? null,
        jsonrpc: "2.0",
        result: {},
      });
      continue;
    }

    if (method === "tools/list") {
      const toolList = Array.from(tools.values()).map((t) => ({
        name: t.name,
        description: t.description,
        inputSchema: t.inputSchema,
      }));
      send({
        id: id ?? null,
        jsonrpc: "2.0",
        result: { tools: toolList },
      });
      continue;
    }

    if (method === "tools/call") {
      const { name, arguments: toolArgs } = (params as { name?: string; arguments?: unknown }) ?? {};
      const tool = tools.get(name || "");
      if (!tool) {
        send({
          id: id ?? null,
          jsonrpc: "2.0",
          error: { code: -32601, message: `Unknown tool: ${name}` },
        });
        continue;
      }

      try {
        const result = await tool.handler(toolArgs);
        send({
          id: id ?? null,
          jsonrpc: "2.0",
          result,
        });
      } catch (err) {
        send({
          id: id ?? null,
          jsonrpc: "2.0",
          error: { code: -32000, message: String(err) },
        });
      }
      continue;
    }

    // Unknown method - log but don't error for notifications
    if (method.startsWith("notifications/")) {
      // Notifications don't require responses
      continue;
    }

    send({
      id: id ?? null,
      jsonrpc: "2.0",
      error: { code: -32601, message: `Unknown method: ${method}` },
    });
  }
});

// Log startup info to stderr (won't interfere with JSON-RPC)
console.error(`[casino-mcp-server] Started. Repo root: ${repoRoot}`);
console.error(`[casino-mcp-server] Available tools: ${Array.from(tools.keys()).join(', ')}`);
