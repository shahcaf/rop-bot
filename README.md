# Advanced Discord Utility Bot

A full-featured, modular Discord utility bot built with **discord.js v14** and **CockroachDB**.

## Features
- **40+ Slash Commands** across 7 categories.
- **Moderation**: Advanced tools with duration parsing and hierarchy checks.
- **Utility**: Information retrieval and server management tools.
- **Leveling**: Competitive XP system with leaderboards and announcements.
- **Tickets**: Robust support session system with persistent tracking.
- **Giveaways**: Reaction-based giveaway manager.
- **Security**: Integrated anti-spam, anti-link, and anti-raid features.
- **Persistence**: Powered by CockroachDB (distributed SQL).

## Structure
```
/commands    - Command files organized by category
/events      - Event listeners (ready, interactionCreate, etc.)
/handlers    - Modular loaders for commands and events
/utils       - Shared utilities (logger, embeds)
/database    - Database connection and schema management
index.js     - Main entry point
deploy-commands.js - Script to register slash commands
```

## Setup
1. Clone the repository.
2. Run `npm install`.
3. Rename `.env.example` to `.env` and fill in your credentials:
   - `DISCORD_TOKEN`: Your bot token from Discord Developer Portal.
   - `CLIENT_ID`: Your bot's Application ID.
   - `DATABASE_URL`: Your CockroachDB connection string (PostgreSQL compatible).
4. Run `node deploy-commands.js` to register commands.
5. Run `node index.js` to start the bot.

## Commands List
### Moderation
`/ban`, `/unban`, `/kick`, `/timeout`, `/untimeout`, `/warn`, `/warnings`, `/clear`, `/lock`, `/unlock`, `/slowmode`, `/nuke`, `/mute`, `/unmute`

### Utility
`/ping`, `/uptime`, `/serverinfo`, `/userinfo`, `/avatar`, `/banner`, `/roleinfo`, `/emojilist`, `/help`, `/invite`, `/botinfo`

### Welcome & Leave System
`/setwelcome`, `/setleave`, `/setautorole`, `/resetwelcome`

### Ticket System
`/ticket-setup`, `/ticket-close`, `/ticket-claim`, `/ticket-add`, `/ticket-remove`

### Leveling System
`/rank`, `/leaderboard`, `/setlevelchannel`, `/setxp`

### Giveaway System
`/giveaway-start`, `/giveaway-end`, `/giveaway-reroll`

### Configuration
`/setprefix`, `/setmodlog`, `/setverify`, `/setantispam`, `/setantilink`
