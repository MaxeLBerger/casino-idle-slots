import { spawn } from 'node:child_process';

const child = spawn('node', ['packages/casino-mcp-server/dist/index.js'], {
  stdio: ['pipe', 'pipe', 'pipe'],
});

child.stdout.on('data', (data) => {
  process.stdout.write(data);
});

child.stderr.on('data', (data) => {
  process.stderr.write(data);
});

const [, , rawMethod = 'tools/list', rawName, rawArgs] = process.argv;

let request;

if (rawMethod === 'tools/call') {
  const toolName = rawName ?? 'get_game_stats';
  const parsedArgs = rawArgs ? JSON.parse(rawArgs) : {};
  request = {
    jsonrpc: '2.0',
    id: 1,
    method: 'tools/call',
    params: {
      name: toolName,
      arguments: parsedArgs,
    },
  };
} else {
  request = {
    jsonrpc: '2.0',
    id: 1,
    method: 'tools/list',
  };
}

child.stdin.write(JSON.stringify(request) + '\n');
child.stdin.end();

setTimeout(() => {
  child.kill();
}, 500);
