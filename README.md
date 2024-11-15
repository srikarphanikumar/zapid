<div align="center">

# 🚀 ZAPID

[![npm version](https://img.shields.io/npm/v/zapid.svg)](https://www.npmjs.com/package/zapid)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Downloads](https://img.shields.io/npm/dt/zapid.svg)](https://www.npmjs.com/package/zapid)

**Generate Lightning-Fast, Secure IDs with Built-in Collision Protection** 

[Installation](#installation) • [Quick Start](#quick-start) • [Features](#features) • [API](#api) • [Security](#security)

</div>

---

## ⚡️ Why ZAPID?

ZAPID isn't just another ID generator. It's your safety net for generating unique identifiers:

- 🎯 **Smart Length Detection**: Automatically suggests optimal ID lengths based on your needs
- 🛡️ **Collision Protection**: Built-in probability calculations to prevent ID conflicts
- 🔒 **Bank-Grade Security**: Uses cryptographic random number generation
- 🌐 **Universal Compatibility**: Works seamlessly in Node.js and browsers
- 📦 **Zero Dependencies**: Keep your project lean and secure
- 🚦 **Real-time Safety Alerts**: Get instant feedback about ID safety

## 🚀 Quick Start

```bash
npm install zapid
```

### 💻 Basic Usage

```typescript
import { generate } from 'zapid';

// Generate a secure 7-character ID
const id = generate();
// => "xK9p2Nt"
```

### 🛡️ Safety-First Generation

```typescript
import { generateWithInfo } from 'zapid';

const result = generateWithInfo(7);
// => {
//   id: "aB2x9qL",
//   safety: "safe",
//   collisionProbability: "0.001%",
//   recommendation: "Safe for up to 100k IDs. Total possible combinations: 3.52e12"
// }
```

## 🎯 Features In-Depth

### Intelligent Safety Checks
```typescript
// ZAPID automatically warns you when IDs might be too short
const result = generateWithInfo(6); // Not recommended for large sets
// => {
//   safety: "moderate",
//   recommendation: "Consider increasing length for large-scale use"
// }
```

### Configurable Lengths
```typescript
// Generate longer IDs for increased uniqueness
const longId = generate(16);
// => "k9NtxK2mP5vR8Js3"
```

### Cross-Platform Support
```typescript
// Works the same everywhere
import { generate } from 'zapid';

// 🌐 Browser
const browserId = generate();

// 💻 Node.js
const serverId = generate();
```

## 🔧 API

### `generate(length?: number): string`
Generate a random ID with specified length (default: 7)

### `generateWithInfo(length?: number): ZapidResult`
Generate an ID with detailed safety information

### `getCharset(): string`
Get the current character set used for generation

### `getConfig(): Readonly<Config>`
Get the current configuration settings

## 🔐 Security

ZAPID takes security seriously:

- ✅ Uses cryptographically secure random number generation
- ✅ Implements modulo bias protection
- ✅ Cross-platform secure implementations:
  - Node.js: `crypto.randomBytes()`
  - Browser: `window.crypto.getRandomValues()`

## 📈 Performance

- 🚀 Generates 1 million IDs in under 2 seconds
- 📦 Package size < 5KB gzipped
- 0️⃣ Zero dependencies

## 🤝 Contributing

We love contributions! Check out our [Contributing Guide](CONTRIBUTING.md) to get started.

## 📝 License

MIT © [Srikar Phani Kumar Marti](https://github.com/srikarphanikumar)
---
[⬆ Back to Top](#zapid)