# 🤖 AwesomeBot99999

A fast, feature-packed **Discord bot** built with **Node.js** and **discord.js**.  
Modular, scalable, and open source — designed for community servers that need all-in-one functionality.

Invite this bot to your server [here](https://discord.com/oauth2/authorize?client_id=872195259730386994).

📚 **New to this bot?** Check out the [Setup Guide](SETUPGUIDE.md) and [Commands Guide](COMMANDS.md)!

*Note: This bot is still in early development.*

---
## 🖥️ Tech Stack
- Node.js — Runtime environment 
- Discord.js — API wrapper for Discord bots 
- Sequelize ORM — Database abstraction 
- MySQL — Persistent data storage 
- dotenv — Configuration management 
- fs / path — Command loader system

---

## ✨ Features

### ✅ Current Features
- 🎉 **Giveaways** — Create giveaways with custom durations and prizes.
- 📝 **Applications** — Set up and manage application forms directly in Discord.
- 👋 **Welcome / Leave Messages** — Automatically greet or say goodbye to users.
- 🧱 **Embeds** — Build fully customizable embeds with ease.
- 🔨 **Moderation** — Kick, ban, or mute users (warnings coming soon).
- 🏆 **Leveling (Local)** — Reward activity with XP and levels per server.
- ⚙️ **Configurable Settings** — Per-server customization for channels, roles, and more.
- 🧩 **Modular Command Loader** — Easily add or modify commands without editing core files.

### 🚧 Planned Features
- 💰 **Economy (Local & Global)** — Earn money by chatting or working, and spend it on upgrades.
- 🎂 **Birthdays** — Set your birthday and let others celebrate with you! (Shared globally)
- 🌍 **Global Leveling System** — Leaderboards for users and servers worldwide.
- 💬 **Fully Customizable Responses** — Tailor bot output to fit your community’s tone.
- ⚠️ **Warnings** — Issue and track warnings for misbehaving members.
- 🎭 **Reaction Roles** — Assign roles via reactions.
- 🔧 **Automod** — Automatically detect and act on bad words or spam.
- 📊 **Server Stats** — Display server growth and engagement metrics.
- 🎟️ **Tickets** — Create support or help tickets directly in the server.
- ⏰ **Reminders** — Set reminders for yourself or your server.
- 📢 **Social Alerts** (maybe) — Get alerts from YouTube, Twitch, or other platforms.
- 💤 **AFK Command** — Let others know you’re away.
- 🍅 **Pomodoro Timer** — Stay focused with built-in timers.
- 📅 **Calendar (Global & Local)** — Organize upcoming events.
- 🌐 **Global Announcements** — Developer messages broadcast to all servers.
- ☁️ **Weather** — Check local forecasts anywhere in the world.
---

## 🧰 Prerequisites

- [Node.js **v22.12.0+**](https://nodejs.org/en)
- A [Discord account](https://discord.com/)
- A [MySQL](https://www.mysql.com/) database (used via Sequelize ORM)

---

## ⚙️ Installation Guide

### 1. Create a Discord Application
1. Visit [Discord Developer Portal](https://discord.com/developers/applications)
2. Click **New Application**
3. Name it, accept the TOS, and go to the **Bot** tab.
4. Customize your bot’s name and avatar.
5. Click **Reset Token**, then copy the token to a `.env` file (use `.env.example` as a template).

> 🛑 **Note:** Disable “Public Bot” if you want to limit invitations,  
> and **enable all Privileged Gateway Intents** (Presence, Server Members, Message Content).

### 2. Inviting the Bot
1.	Go to **OAuth2 → URL Generator** in your application settings. 
2. Under **Scopes**, check:
   - `bot` 
   - `applications.commands` (required for slash commands)
3. Under **Bot Permissions**, choose:
   - `Administrator` _(recommended for testing)_
4.	Copy the generated link and open it in a browser.
5.	Choose your server and invite the bot!

### 3. Initial Setup
1. Install the dependencies by running `npm install`.
2. Make a copy of the `.env.example` I provided and rename it to `.env`.
3. In the `.env` file, configure your client ID, token, and database:
   ```dotenv
   DISCORD_CLIENT_ID="your-client-id-goes-here"
   DISCORD_BOT_TOKEN="your-bot-token-goes-here"
   OWNER_WEBSITE="your-website-goes-here" # optional
   GITHUB_REPOSITORY="your-github-repository-goes-here" # optional
   DASHBOARD=""
   DATABASE_HOST="localhost" # or your remote host
   DATABASE_PORT="3306" # or your remote host's port
   DATABASE_NAME="database"
   DATABASE_USER="root" # or your remote host's username
   DATABASE_PASSWORD="your-password-goes-here"
   ```
4. Deploy commands using `npm run refreshCommands`. (Runs: `node src/deploy-commands.js`)
5. Create/sync the database using `npm run syncDatabase` (Runs: `node src/syncdb.js`) 
> 🧠 Note: The `syncDatabase` script uses `sequelize.sync({ alter: true })` to safely update your database schema without deleting data.
6. Run the bot using `npm start`. (Runs: `node src/index.js`)

### 4. Database 
---

## 💡 Contributions
Contributions are welcome!
Feel free to:

- Suggest new features 
- Submit pull requests 
- Report bugs or issues

Open an issue or join the discussions on the GitHub repository.

--- 

## ⚖️ License
This project is open source under the MIT License.
You’re free to use, modify, and share the code — just credit the original project.

---

## 📜 Credits
Developed and maintained by AwesomeKid99999.
Originally created in 2021 and continuously evolving to this day.
Some code was from the official discord.js guide.

---

## 📚 Documentation

- **[Setup Guide](SETUPGUIDE.md)** - Complete guide for configuring the bot's features
- **[Commands Guide](COMMANDS.md)** - Comprehensive list of all available commands

---

Copyright (c) 2021-2025 AwesomeKid99999 (Andy Quach). Licensed under MIT.
