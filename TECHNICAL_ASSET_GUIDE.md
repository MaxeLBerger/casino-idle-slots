# Technical Implementation Guide

Once you have the images, here is how we will implement them.

## 1. Directory Structure
We will create a new folder structure for assets:

```
public/
  assets/
    slots/          <-- Reel symbols (cherry.webp, etc.)
    ui/             <-- UI icons (coins.webp, prestige.webp)
    backgrounds/    <-- bg_main.webp
```

## 2. Code Changes
We will update `src/constants/slot.constants.ts` to map the symbols to image paths instead of emojis.

**Example Change:**

```typescript
// Old
export const SYMBOLS = {
  CHERRY: '🍒',
  LEMON: '🍋'
}

// New
export const SYMBOLS = {
  CHERRY: '/assets/slots/symbol_cherry.webp',
  LEMON: '/assets/slots/symbol_lemon.webp'
}
```

## 3. Component Updates
We will create a reusable `<SlotSymbol />` component that takes the symbol ID and renders the `<img>` tag with the correct size and animation classes.

## 4. Capacitor Configuration
We will use the `@capacitor/assets` tool to automatically generate all the required icon sizes for iOS and Android from your single `app_icon_source.png` and `splash_screen.png`.

**Command:**
```bash
npx capacitor-assets generate
```
