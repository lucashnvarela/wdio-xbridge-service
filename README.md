# wdio-xbridge-service

[![npm](https://img.shields.io/npm/v/wdio-xbridge-service.svg)](https://www.npmjs.com/package/wdio-xbridge-service)

WebdriverIO service with a cross-platform XPath query API to locate and interact with native iOS and Android UI elements.

## Installation

To install the package, run:

```bash
npm i --save-dev wdio-xbridge-service
```

Or use your package manager of choice - pnpm, yarn, etc.

## Configuration

Add `xbridge` to your WebdriverIO configuration:

```typescript
exports.config = {
  // ...
  services: ['xbridge']
  // ...
};
```

## TypeScript

To enable type support, add `wdio-xbridge-service` to your `tsconfig.json`:

```jsonc
{
  "compilerOptions": {
    // ...
    "types": [
      "wdio-xbridge-service"
    ],
    // ...
  }
}
```