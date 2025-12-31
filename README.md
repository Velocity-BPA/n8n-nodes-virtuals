# n8n-nodes-virtuals

> [Velocity BPA Licensing Notice]
>
> This n8n node is licensed under the Business Source License 1.1 (BSL 1.1).
>
> Use of this node by for-profit organizations in production environments requires a commercial license from Velocity BPA.
>
> For licensing information, visit https://velobpa.com/licensing or contact licensing@velobpa.com.

A comprehensive n8n community node for Virtuals Protocol AI agent token ecosystem. This package provides complete integration with Virtuals Protocol's G.A.M.E. (Generative Autonomous Multimodal Entities) framework, enabling management of AI agents, token trading, social integrations, and revenue tracking on the Base blockchain.

![n8n](https://img.shields.io/badge/n8n-community--node-orange)
![Version](https://img.shields.io/badge/version-1.0.0-blue)
![License](https://img.shields.io/badge/license-BSL--1.1-blue)
![Base Chain](https://img.shields.io/badge/chain-Base-0052FF)

## Features

- **Agent Management**: Create, configure, start, stop, and monitor AI agents
- **G.A.M.E. Framework**: Goals, workers, functions, and task execution
- **Token Trading**: Buy/sell agent tokens via DEX integration
- **Conversation Handling**: Send messages, manage history, configure personalities
- **Revenue Tracking**: Monitor earnings, claim revenue, view history
- **Social Integrations**: Connect Twitter, Telegram, Discord and post as agent
- **Real-time Triggers**: WebSocket-based event monitoring for price changes, trades, and more
- **Base Blockchain**: Native integration with Base mainnet and testnet

## Installation

### Community Nodes (Recommended)

1. Open your n8n instance
2. Go to **Settings** > **Community Nodes**
3. Click **Install**
4. Enter `n8n-nodes-virtuals`
5. Click **Install**

### Manual Installation

```bash
# Navigate to your n8n installation directory
cd ~/.n8n

# Install the package
npm install n8n-nodes-virtuals
```

### Development Installation

```bash
# 1. Extract/clone the repository
cd n8n-nodes-virtuals

# 2. Install dependencies
npm install

# 3. Build the project
npm run build

# 4. Create symlink to n8n custom nodes directory
# For Linux/macOS:
mkdir -p ~/.n8n/custom
ln -s $(pwd) ~/.n8n/custom/n8n-nodes-virtuals

# For Windows (run as Administrator):
# mklink /D %USERPROFILE%\.n8n\custom\n8n-nodes-virtuals %CD%

# 5. Restart n8n
n8n start
```

## Credentials Setup

### Virtuals API Credentials

| Field | Description |
|-------|-------------|
| API Key | Your Virtuals Protocol API key |
| API Secret | Your Virtuals Protocol API secret |
| Environment | Production or Testnet |
| Base URL | API base URL (default: https://api.virtuals.io) |

### Virtuals Wallet Credentials (for trading)

| Field | Description |
|-------|-------------|
| Private Key | Wallet private key for on-chain transactions |
| Network | Base Mainnet or Base Sepolia Testnet |
| RPC URL | Custom RPC URL (optional) |
| Gas Limit Override | Custom gas limit (optional) |

## Resources & Operations

### Agent Resource

| Operation | Description |
|-----------|-------------|
| List | Get all agents with filtering and pagination |
| Get | Get agent details by ID |
| Get Status | Get agent's current status |
| Get Metrics | Get agent performance metrics |
| Get Wallet | Get agent wallet balances |
| Create | Create a new AI agent |
| Configure | Update agent configuration |
| Start | Start an agent |
| Stop | Stop an agent |
| Delete | Delete an agent |

### G.A.M.E. Resource

| Operation | Description |
|-----------|-------------|
| Create Goal | Create a new goal for an agent |
| Get Goals | List agent goals |
| Configure Worker | Configure a G.A.M.E. worker |
| Get Workers | List agent workers |
| Add Function | Add a function to an agent |
| Get Functions | List agent functions |
| Execute Task | Execute a task |
| Get Execution History | View task execution history |
| Get Agent State | Get agent memory and context |
| Update Personality | Update agent personality traits |

### Token Resource

| Operation | Description |
|-----------|-------------|
| Get Price | Get current token price with optional history |
| Get Info | Get token metadata |
| Get Market Cap | Get token market capitalization |
| Get Volume | Get trading volume |
| Get Liquidity | Get liquidity pool information |
| Trade | Buy or sell tokens (on-chain) |
| Get Holders | List token holders |
| Get History | Get transaction history |

### Conversation Resource

| Operation | Description |
|-----------|-------------|
| Send Message | Send a message to an agent |
| Get Response | Get a specific response |
| Get History | Get conversation history |
| Clear Context | Clear conversation context |
| Set Personality | Set conversation personality |
| Get Personas | Get available personality personas |

### Revenue Resource

| Operation | Description |
|-----------|-------------|
| Get Stats | Get revenue statistics |
| Get Creator Earnings | Get earnings as creator |
| Get Holder Earnings | Get earnings as token holder |
| Claim Revenue | Claim available revenue |
| Get Revenue History | View claim history |

### Social Resource

| Operation | Description |
|-----------|-------------|
| Connect Twitter | Connect Twitter/X account |
| Connect Telegram | Connect Telegram account |
| Connect Discord | Connect Discord server |
| Post as Agent | Post content as the agent |
| Get Social Stats | Get social media statistics |
| Get Social History | View posting history |

## Trigger Node

The Virtuals Trigger node monitors real-time events via WebSocket.

### Agent Events
- Agent Created
- Agent Status Changed
- Agent Message Received
- Agent Task Completed

### Token Events
- Token Price Changed (with threshold)
- Large Trade Alert (with threshold)
- New Holder
- Liquidity Changed

### Revenue Events
- Revenue Generated
- Claim Available

## Usage Examples

### Create and Configure an AI Agent

```json
{
  "nodes": [
    {
      "name": "Create Agent",
      "type": "n8n-nodes-virtuals.virtuals",
      "parameters": {
        "resource": "agent",
        "operation": "create",
        "name": "TradingBot",
        "description": "An AI trading assistant",
        "personality": "trader",
        "additionalOptions": {
          "tokenSymbol": "TBOT",
          "initialSupply": "1000000000",
          "communicationStyle": "professional"
        }
      }
    }
  ]
}
```

### Execute G.A.M.E. Tasks

```json
{
  "nodes": [
    {
      "name": "Create Goal",
      "type": "n8n-nodes-virtuals.virtuals",
      "parameters": {
        "resource": "game",
        "operation": "createGoal",
        "agentId": "{{ $json.agentId }}",
        "goalName": "Market Analysis",
        "goalDescription": "Analyze market trends for top 10 tokens",
        "priority": 8,
        "successCriteria": "Generate report with price predictions"
      }
    }
  ]
}
```

### Trade Agent Tokens

```json
{
  "nodes": [
    {
      "name": "Buy Tokens",
      "type": "n8n-nodes-virtuals.virtuals",
      "parameters": {
        "resource": "token",
        "operation": "trade",
        "agentId": "agent_123",
        "tradeType": "buy",
        "amount": "100",
        "paymentToken": "VIRTUAL",
        "slippage": 2,
        "simulate": false
      }
    }
  ]
}
```

### Monitor Price Changes

```json
{
  "nodes": [
    {
      "name": "Price Alert",
      "type": "n8n-nodes-virtuals.virtualsTrigger",
      "parameters": {
        "eventCategory": "token",
        "event": "token.price",
        "agentId": "agent_123",
        "priceThreshold": 10
      }
    }
  ]
}
```

### Post to Social Media

```json
{
  "nodes": [
    {
      "name": "Social Post",
      "type": "n8n-nodes-virtuals.virtuals",
      "parameters": {
        "resource": "social",
        "operation": "postAsAgent",
        "agentId": "agent_123",
        "platforms": ["twitter", "telegram"],
        "content": "Market update: Bitcoin is trending up!",
        "scheduledTime": "2024-01-15T10:00:00Z"
      }
    }
  ]
}
```

## Virtuals Protocol Concepts

### G.A.M.E. Framework
**G**enerative **A**utonomous **M**ultimodal **E**ntities - The core AI agent architecture:
- **Goals**: High-level objectives for the agent
- **Workers**: Task executors (analyst, trader, social, researcher, executor)
- **Functions**: Specific capabilities and actions
- **State**: Agent memory and context

### VIRTUAL Token
The native platform token used for:
- Agent creation and operation fees
- Trading agent tokens
- Revenue distribution

### Agent Tokens
Each AI agent has its own token:
- Created during Initial Agent Offering (IAO)
- Tradeable on Base chain DEX
- Provides holder rewards from agent revenue

### Revenue Share
Platform revenue distribution:
- Creator earnings (agent creators)
- Holder earnings (token holders)
- Platform fees

### Cognitive Core
The AI backbone powering agent intelligence:
- Personality configuration
- Memory management
- Multi-modal capabilities

## Networks

| Network | Chain ID | Description |
|---------|----------|-------------|
| Base Mainnet | 8453 | Production environment |
| Base Sepolia | 84532 | Testnet for development |

## Error Handling

The node provides detailed error messages:

| Error Code | Description |
|------------|-------------|
| INVALID_CREDENTIALS | API key or secret is invalid |
| AGENT_NOT_FOUND | Agent ID doesn't exist |
| INSUFFICIENT_BALANCE | Not enough tokens/ETH for trade |
| RATE_LIMITED | Too many requests, retry later |
| NETWORK_ERROR | Blockchain network issue |
| SLIPPAGE_EXCEEDED | Price moved beyond slippage tolerance |

## Security Best Practices

1. **Store credentials securely** - Use n8n's credential management
2. **Use testnet first** - Test workflows on Base Sepolia before mainnet
3. **Enable simulation mode** - Simulate trades before executing
4. **Set appropriate slippage** - Protect against price manipulation
5. **Monitor gas costs** - Set gas limits for on-chain operations
6. **Backup private keys** - Never share or lose wallet keys

## Development

```bash
# Install dependencies
npm install

# Build the project
npm run build

# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Lint code
npm run lint

# Fix lint issues
npm run lint:fix

# Format code
npm run format

# Watch mode for development
npm run dev
```

## Author

**Velocity BPA**
- Website: [velobpa.com](https://velobpa.com)
- GitHub: [Velocity-BPA](https://github.com/Velocity-BPA)

## Licensing

This n8n community node is licensed under the **Business Source License 1.1**.

### Free Use
Permitted for personal, educational, research, and internal business use.

### Commercial Use
Use of this node within any SaaS, PaaS, hosted platform, managed service,
or paid automation offering requires a commercial license.

For licensing inquiries:
**licensing@velobpa.com**

See [LICENSE](LICENSE), [COMMERCIAL_LICENSE.md](COMMERCIAL_LICENSE.md), and [LICENSING_FAQ.md](LICENSING_FAQ.md) for details.

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

Please ensure:
- All tests pass
- Code is properly formatted
- Documentation is updated
- Commits follow conventional commit format

## Support

- **Documentation**: [GitHub Wiki](https://github.com/Velocity-BPA/n8n-nodes-virtuals/wiki)
- **Issues**: [GitHub Issues](https://github.com/Velocity-BPA/n8n-nodes-virtuals/issues)
- **Discussions**: [GitHub Discussions](https://github.com/Velocity-BPA/n8n-nodes-virtuals/discussions)
- **Virtuals Protocol**: [virtuals.io](https://virtuals.io)

## Acknowledgments

- [n8n](https://n8n.io) - Workflow automation platform
- [Virtuals Protocol](https://virtuals.io) - AI agent token ecosystem
- [Base](https://base.org) - Layer 2 blockchain
- [Ethers.js](https://ethers.org) - Ethereum library
