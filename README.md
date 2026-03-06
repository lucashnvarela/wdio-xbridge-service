# wdio-xbridge-service

[![npm](https://img.shields.io/npm/v/wdio-xbridge-service.svg)](https://www.npmjs.com/package/wdio-xbridge-service) [![CI](https://img.shields.io/github/actions/workflow/status/lucashnvarela/wdio-xbridge-service/test.yaml)](https://github.com/lucashnvarela/wdio-xbridge-service/actions/workflows/test.yaml)

A WebdriverIO service with a cross-platform selector API on top of XPath to locate and interact with native iOS and Android UI elements.

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

`XBridge` accepts selectors in three formats: `<node>`, `<node>[<attribute>="<value>"]`, or `<attribute>="<value>"`. The selector is resolved at runtime — node types and attributes are automatically mapped to the appropriate XPath for the current platform.

```typescript
const submit = driver.X('button')
const input = driver.X('input[label="Username"]')
const hint = driver.X('label="Username"')
```

**Cross-platform selectors** — pass a tuple to write a single test that runs on both platforms. Each selector targets one platform, and the correct one is picked automatically at runtime:

```typescript
const username = driver.X([
  'input[label="Username"]',  // iOS
  'input[text="Username"]',   // Android
])
```

### Actions

```typescript
await driver.X('button[name="Edit"]').click()
await driver.X('label="Username"').fill('wdio@example.com')
```

**Swipe into view** — chain `.swipe` to automatically scroll the element into the view before interacting:

```typescript
await driver.X('button').swipe.click()
```

### Navigation

Navigate the element tree using `.ancestor`, `.descendant`, `.parent`, `.child`, `.previous`, and `.next`. All methods accept an optional selector and are chainable:

```typescript
driver.X('label="Profile"')
  .parent()
  .descendant('text[name="Edit"]')
  .next('button')
```

**Platform scoping** — chain `.ios` or `.android` before any navigation method to apply it only on that specific platform:

```typescript
driver.X(['text[name="Settings"]', 'text[description="Settings"]'])
  .ios.parent('window[name="settings-row"]')
  .android.ancestor('frame[resourceId="settings-section"]')
```