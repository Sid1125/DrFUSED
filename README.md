# Dr FUSED - A Discord Moderation Bot

Welcome to **Dr FUSED**, a powerful and customizable Discord bot designed to streamline moderation tasks and provide essential server management features. This bot includes features like automated warning systems, customizable commands, and embedded information delivery for improved server management.

## Features

- **Moderation Commands**: Manage your server with ease using commands like `/warn`, `/kick`, and `/ban`.
- **Auto-Logging**: All moderation actions are automatically logged in a `mod-logs` channel.
- **Warning System**: Track user warnings and automatically kick/ban users after a predefined number of warnings.
- **Custom Embed Messages**: Send polished and customizable embedded messages for invites, ToS, and Privacy Policy.
- **Warning Reset**: Reset user warnings or schedule automatic resets if warnings remain unchanged after 10 days.
- **GitHub Actions Deployment**: The bot can be deployed directly from GitHub using GitHub Actions.

## Commands

- `/warn` - Warn a user.
- `/kick` - Kick a user from the server.
- `/ban` - Ban a user from the server.
- `/reset-warnings` - Reset warnings for a specific user.
- `/invite` - Generate an invite link to add the bot to other servers.
- `/tos` - Display the bot's Terms of Service in an embed.
- `/privacy` - Display the bot's Privacy Policy in an embed.

## Setup

### Prerequisites

1. [Node.js](https://nodejs.org/en/) (v16+)
2. [Discord Developer Account](https://discord.com/developers)
3. `discord.js` library (Install via `npm install discord.js`)

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/Sid1125/DrFUSED.git
   cd DrFUSED
   ```

2. Install the dependencies:

   ```bash
   npm install
   ```

3. Create a `.env` file in the root directory and add the following variables:

   ```
   DISCORD_TOKEN=your-bot-token
   ```

4. Start the bot locally:

   ```bash
   node bot.js
   ```

5. Deploy via GitHub Actions using the predefined workflow in `.github/workflows/deploy-bot.yml`.

## GitHub Actions

This bot uses GitHub Actions to automatically deploy and run the bot. Follow these steps:

1. Set up a repository secret named `BTOKEN` containing your Discord bot token.
2. Ensure the GitHub Actions workflow (`deploy-bot.yml`) is properly configured in `.github/workflows/`.
3. Push changes to the `main` branch to trigger an automatic deployment.

## File Structure

```
.
├── commands/                   # All bot commands
├── events/                     # Event handlers
├── .github/workflows/           # GitHub Actions workflow
├── bot.js                      # Main bot logic
├── config.json                 # Configuration settings
├── README.md                   # This file
├── package.json                # Node.js dependencies and scripts
├── privacy.html                # Privacy Policy webpage
├── tos.html                    # Terms of Service webpage
└── LICENSE                     # License information
```

## License

This repository is licensed under the [GPL-3.0 License](./LICENSE).

---
