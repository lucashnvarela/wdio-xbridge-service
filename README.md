# wdio-xbridge-service

[![npm](https://img.shields.io/npm/v/wdio-xbridge-service.svg)](https://www.npmjs.com/package/wdio-xbridge-service) [![CI](https://img.shields.io/github/actions/workflow/status/lucashnvarela/wdio-xbridge-service/test.yaml)](https://github.com/lucashnvarela/wdio-xbridge-service/actions/workflows/test.yaml)

#### A WebdriverIO service with a cross-platform selector API for iOS and Android automation.

**wdio-xbridge-service** maps selector node types and attributes to the correct XPath expression for each platform at runtime, removing the need for platform-specific branching.

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

## Usage

### Selectors

Selectors can target a node, an attribute, or both: `<node>`, `<attribute>="<value>"`, `<node>[<attribute>="<value>"]`

```typescript
const submit = driver.$X('button')
const input = driver.$X('input[label="Username"]')
const hint = driver.$X('[label="Username"]')
```

**Cross-platform selectors** — pass a tuple of two selectors to target both platforms, and the correct selector is resolved at runtime:

```typescript
const username = driver.$X([
  'input[label="Username"]',  // iOS
  'input[description="Username"]',   // Android
])
```

### Navigation

Navigate the element tree relative to the previous selector using `.ancestor`, `.descendant`, `.parent`, `.child`, `.previous`, and `.next`. All methods accept an optional selector and are chainable:

```typescript
driver.$X('[label="Profile"]')
  .parent()
  .descendant('text[name="Edit"]')
  .next('button')
```

**Platform scoping** — chain `.ios` or `.android` before any navigation method to apply it only on that specific platform:

```typescript
driver.$X(['[name="Settings"]', '[description="Settings"]'])
  .ios.parent('window[name="settings-row"]')
  .android.ancestor('frame[resourceId="settings-section"]')
```