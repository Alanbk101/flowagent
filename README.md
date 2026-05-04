# 🤖 FlowAgent

**Autonomous Financial Agent for WhatsApp — Powered by AI**

> Send crypto payments by chatting on WhatsApp. No wallets, no seed phrases, no technical knowledge required.

[![Live](https://img.shields.io/badge/Status-LIVE%2024%2F7-brightgreen)](https://github.com/Alanbk101/flowagent)
[![ETHGlobal](https://img.shields.io/badge/ETHGlobal-Open%20Agents%202026-blue)](https://ethglobal.com/events/agents)
[![License](https://img.shields.io/badge/License-MIT-yellow)](LICENSE)

---

## 🎯 What is FlowAgent?

FlowAgent is an autonomous AI agent that lives inside WhatsApp. Users interact with it using natural language in Spanish or English. The agent understands payment intent, resolves human-readable names (ENS), executes transactions onchain via KeeperHub, and remembers user preferences through 0G Storage.

**Example:**
```
User: "Manda 0.001 ETH a vitalik.eth"
FlowAgent: ✅ Pago enviado! 0.001 ETH a vitalik.eth (0xd8dA...96045)
```

---

## 🏆 ETHGlobal Open Agents 2026

Built for the ETHGlobal Open Agents hackathon (April 24 - May 6, 2026), targeting 3 prize tracks:

| Track | Sponsor | Prize | Integration |
|-------|---------|-------|-------------|
| Best Use of KeeperHub | KeeperHub | $4,500 | Webhook → ETH Transfer |
| Best Autonomous Agents | 0G Labs | $7,500 | Decentralized Memory |
| Best ENS for AI Agents | ENS | $2,500 | Name Resolution |

---

## 🏗️ Architecture

```
User (WhatsApp)
       ↓
   Baileys Bot (index.js)
       ↓
   AI Agent (flowagent.js) ←→ Memory (agentMemory.js)
       ↓
   Payment Intent Detected?
       ↓
   ENS Resolver (ens.js) → Resolve .eth names
       ↓
   KeeperHub Executor (executor.js) → Onchain TX
       ↓
   Confirmation → WhatsApp
```

---

## 📁 Project Structure

```
flowagent/
├── src/
│   ├── bot/
│   │   └── index.js              # WhatsApp bot (Baileys)
│   ├── agent/
│   │   └── flowagent.js          # AI brain (OpenRouter)
│   ├── keeper/
│   │   └── executor.js           # KeeperHub onchain executor
│   ├── memory/
│   │   └── agentMemory.js        # 0G Storage + local persistence
│   └── identity/
│       └── ens.js                # ENS name resolution
├── data/memory/                  # Local memory cache
├── .env                          # API keys (not in repo)
├── package.json
└── README.md
```

---

## 🔧 Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Messaging | WhatsApp + Baileys v6.7.16 | User interface |
| AI Engine | OpenRouter (GPT-OSS-120B) | Natural language processing |
| Execution | KeeperHub MCP | Guaranteed onchain transactions |
| Memory | 0G Storage + Local Disk | Persistent conversation history |
| Identity | ENS (flowagent.eth) | Human-readable addresses |
| Runtime | Node.js v22 + PM2 | Production 24/7 server |
| Deploy | Hostinger VPS (Ubuntu 24) | Cloud infrastructure |

---

## �� Integrations

### KeeperHub — Onchain Execution
- Webhook trigger receives JSON payload with recipient and amount
- KeeperHub wallet executes transfers on Sepolia testnet
- Native ETH transfers with automatic gas estimation
- Real-time execution status returned to WhatsApp

### 0G Labs — Decentralized Agent Memory
- Hybrid storage: local disk cache + 0G Storage (decentralized)
- Conversation history persists across bot restarts (up to 20 messages per user)
- Async sync to 0G is non-blocking
- Uses `@0glabs/0g-ts-sdk` with ethers.js

### ENS — Agent Identity & Name Resolution
- `resolveENS()` converts any .eth name to its 0x address
- Agent identity: `flowagent.eth`
- Live test: `vitalik.eth` → `0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045`

---

## 🚀 Quick Start

### Prerequisites
- Node.js v22+
- WhatsApp account
- API keys: OpenRouter, KeeperHub

### Installation

```bash
# Clone the repo
git clone https://github.com/Alanbk101/flowagent.git
cd flowagent

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env with your API keys

# Start the bot
node src/bot/index.js

# Or with PM2 for production
pm2 start src/bot/index.js --name flowagent
```

### Environment Variables

```env
OPENROUTER_API_KEY=your_openrouter_key
KEEPERHUB_API_KEY=your_keeperhub_key
KEEPERHUB_WEBHOOK=your_webhook_url
ZG_PRIVATE_KEY=your_0g_private_key
```

---

## 📊 Live Results

Production logs from May 3, 2026:

```
[FlowAgent] ENS resolved: vitalik.eth -> 0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045
[KeeperHub] Sending 0.001 ETH to 0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045
Respuesta enviada
```

KeeperHub workflow: **Run #2 — SUCCESS** (9.01s, all steps green)

---

## 🗺️ Roadmap

- [x] WhatsApp bot connected 24/7
- [x] AI agent with payment intent detection
- [x] KeeperHub webhook integration
- [x] ENS name resolution (live)
- [x] Persistent memory (local + 0G)
- [x] VPS deployment with PM2
- [ ] Multi-token support (USDC, USDT, DAI)
- [ ] Mainnet deployment (Ethereum, Arbitrum, Base)
- [ ] SPEI off-ramp for Mexico
- [ ] Telegram bot integration
- [ ] DeFi actions via WhatsApp

---

## 🌎 Why LATAM?

- 600M+ WhatsApp users in Latin America
- Less than 5% have interacted with a blockchain
- Traditional remittances charge 5-10% fees
- FlowAgent eliminates friction: just chat to pay

---

## 👤 Built By

**Alan Enriquez** (@Criptobanndit)
- 🐙 GitHub: [github.com/Alanbk101](https://github.com/Alanbk101)
- 🐦 X/Twitter: [@ACryp0b](https://x.com/ACryp0b)
- 📍 Ensenada, Baja California, Mexico

---

## 📄 License

MIT License — see [LICENSE](LICENSE) for details.

---

<p align="center">
  <b>Built with ❤️ from Ensenada, Mexico for ETHGlobal Open Agents 2026</b>
</p>
