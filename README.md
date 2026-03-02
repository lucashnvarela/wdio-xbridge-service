# wdio-xbridge-service

A WebdriverIO service that adds a cross-platform, XPath-based element querying API to navigate native iOS and Android UI.

## Installation

To use the service, add it to your `package.json`:

```bash
npm i --save-dev wdio-xbridge-service
```

Then add it to your `wdio.conf.ts` configuration:

```typescript
exports.config = {
  // ...
  services: ['xbridge']
  // ...
};
```