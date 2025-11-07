# Changelog

All notable changes to this project are documented here. Not all changes may be shown.

Format notes:
- Dates are used instead of semantic versions for historical entries. Version tags may be adopted later.
- Entries are grouped by date; recent items summarize multiple changes for that day.

*Note: Older entries may be approximate because they were reconstructed from message history. If you want to see evidence, please join my Discord server using this [link](https://discord.gg/TWNcxARR3J).*

## 2021 

- August 3, 2021 — Bot created, used for bad word detection (but the only "bad word" was a bully of mine). Written in discord.js.

- December 5, 2021 — Used JMusicBot (Java library) for playing music in voice channels.

## 2022

- June 24, 2022 — Removed bad word detection and started adding basic commands (beep, ping, server/user info, avatar, say) and also `/purge` for deleting up to 100 messages (now updated to support deleting more than 100 messages).

- June 28, 2022 — Added a fake kick command (now known as `/fakemod kick`).

- July 9, 2022 — Added other fake moderation commands (ban, warn, mute) and added a command to send a link to my YouTube channel.

- December 9, 2022 — Added help command (now called `/info`) that displayed bot information and commands.

## 2023

- May 7, 2023 — Renamed the fake moderation commands (`/kick`, `/ban`, `/mute`, `/warn`) to (`/jokekick`, `/jokeban`, `/jokemute`, `/jokewarn`).

- May 21, 2023 — Added duration to `/jokemute`.

- May 22, 2023 — Added proper permissions to moderation commands (only `/purge` so far) and added a real ban command (`/modban`).

- May 23, 2023 — Message command (`/message`).

- May 27, 2023 — Added unban command (`/modunban`).

- June 2, 2023 — Added time command (`/time`) and changed the timestamps to user's local time.

- July 23, 2023 — Fixed edge cases for `/modunban` (for when user is not banned) and `/modban` when user is not in the server (extra formatting) and made `/ping` work with initial WebSocket with already added roundtrip latency.

- July 24, 2023 — Added channel option for `/say` command.

- July 25, 2023 — Added a simple `/play` command from discord-player.js.

- July 26, 2023 — Tried to add Cadence Music Bot's commands but failed (so a different bot was running Cadence's code and moved on from JMusic Bot).

- July 28, 2023 — Added `/addrole` and `/removerole` commands (and `/shutdownmac` for testing but removed shortly after).

- July 30, 2023 — Added `/commands` command (lists all commands) and `/open` command to open apps and files, etc. (`/open` was removed shortly after) and `/website` was also added.

- July 31, 2023 — Added `/log` command to log message to console (for fun).

- September 12, 2023 — Publicly uploaded code to GitHub.

- September 19, 2023 — Changed time command from full date and time to just time with seconds.

- September 20, 2023 — Set up database with Sequelize/SQLite3 (for configuring options for a few servers).

- September 21, 2023 — Added `/muterole` command to set mute role and `/modmute` command to mute people with configured mute role and possibly added checks for whether a user is in a server when trying to `/addrole`.

- November 21, 2023 — Added `/add`, `/subtract`, `/multiply`, `/divide` commands for adding, subtracting, multiplying, dividing two numbers.

- November 22, 2023 — Implemented Cadence's commands to bot (and added more of my own filters).

- December 3, 2023 — Added `/embed` command to generate embed (now `/embed generate`).

- December 7, 2023 — Added `/welcomechannel` with hardcoded message. Also implemented ChatGPT for testing (and for fun). ChatGPT Channel was set with `/chatgptchannel`.

- December 9, 2023 — Added `/repository` command to show bot repository and created README.

- December 16, 2023 — Merged math commands into `/math operation add`, `/math operation subtract`, `/math operation multiply`, `/math operation divide`, and added `/math area rectangle`.

- December 17, 2023 — Added little content to README.

## 2024

- February 18, 2024 — Added `/chatgpttoggle` to turn on/off ChatGPT functionality.

- March 7, 2024 — Added `/math operation power` to calculate a number's exponent; added `/math area circle`, `/math area triangle1`, `/math area triangle2`.

- September 10, 2024 — Added `/convert_number` to convert numbers into different bases.

- November 24, 2024 — Added `/robloxinfo` and `/generaterobux` commands.

- December 27, 2024 — Added giveaways and a configurable welcome message (`/welcomemessage`) and a way to test welcome with `/welcometest`.

## 2025

- January 7, 2025 — Merged welcome commands together and added leave commands.

- January 7–9, 2025 — Added and tested applications (only supported one type and was meant for staff applications only); removed ChatGPT support.

- January 10, 2025 — Added custom button command `/button`.

- January 12, 2025 — Changed name from Awesome's Utility to AwesomeBot999999.

- January 13, 2025 — Added support for multiple staff roles for applications and custom role support.

- January 14, 2025 — Added leveling.

- January 15, 2025 — Added level role rewards. Moved `/embed` to `/embed generate` and then added custom embed support (inspired by Mimu Bot).

- January 16, 2025 — Added embed support to custom message (`/welcome embed`). Added ignored XP channel support (`/ignorexpchannel add|remove|list`).

- January 17, 2025 — Poll command.

- January 31, 2025 — Added support for rerolling giveaways (starting giveaways are now `/giveaway start` from `/giveaway`).

- February 12, 2025 — Added counting command `/count`.

- April 30, 2025 — Added ability to set message logging channel `/messagelogchannel`.

- September 21, 2025 — Count to 3 command.

- September 26, 2025 — Questions now support embeds and images and support multiple types (not only staff).

- October 7, 2025 — Added SIX SEVEN and other meme numbers for math command results.

- October 26, 2025 — Added support for level up embed and rank embed.

- October 28, 2025 — Migrated to MySQL in case bot grows in size.

- November 3, 2025 — Application response messages and the list questions command show embed name and image link.

- November 5, 2025 — Fixed channel and TTS permissions for `/say` and updated README; added docs; changed commands command and added placeholders command.

- November 6, 2025 — Documentation and structure refinements: Created comprehensive `docs/COMMANDS.md` (now covering all 110 commands) and `docs/SETUPGUIDE.md` with consistent `<required>` / `[optional]` notation; updated `/info commands` and `/info setup` to link to these docs; standardized placeholder names in docs and code references; corrected documentation for `/leaderboard` and `/poll`; aligned `/leave` command structure to match `/welcome` (single `message [message] [embed]` subcommand); refined giveaway docs (required `<prize>` and `<winners>`, and duration parameter order) and updated setup guide accordingly; moved source under `src/` and updated paths in `package.json`; performed a full audit to ensure the docs perfectly match implemented commands. Bot is now invitable to other servers.

---

### Command index snapshot (as of 2025-11-06)

This snapshot lists all currently implemented commands by category for quick reference. For full details and parameters, see `docs/COMMANDS.md`.

• Application (11): `/application apply`, `/application cancel`, `/application list`, `/application channel`, `/application toggle`, `/application accept`, `/application deny`, `/question add`, `/question remove`, `/question change`, `/question list`

• Leveling (12): `/xp settings change`, `/xp settings view`, `/xp add`, `/xp remove`, `/xp set`, `/xp ignored_channels add`, `/xp ignored_channels remove`, `/xp ignored_channels list`, `/xp reset user`, `/xp reset server`, `/rank`, `/leaderboard`

• Roles (18): `/role add`, `/role remove`, `/role create`, `/role delete`, `/role mute`, `/role custom create`, `/role custom delete`, `/role custom add`, `/role custom remove`, `/role custom list`, `/role staff create`, `/role staff delete`, `/role staff add`, `/role staff remove`, `/role staff list`, `/role level create`, `/role level delete`, `/role level list`

• Welcome/Leave (6): `/welcome channel`, `/welcome message`, `/welcome test`, `/leave channel`, `/leave message`, `/leave test`

• Embeds (6): `/embed create`, `/embed edit`, `/embed delete`, `/embed list`, `/embed show`, `/embed generate`

• Moderation (7): `/mute`, `/unmute`, `/ban`, `/unban`, `/kick`, `/purge`, `/messagelogchannel`

• Giveaways (4): `/giveaway start`, `/giveaway edit`, `/giveaway end`, `/giveaway reroll`

• Fun (10): `/beep`, `/hello`, `/button`, `/count`, `/count_to_three`, `/log`, `/message`, `/poll`, `/say`, `/toggle_memes`

• Fake Moderation (4): `/fakemod ban`, `/fakemod kick`, `/fakemod mute`, `/fakemod warn`

• Info (7): `/info bot`, `/info server`, `/info user`, `/commands`, `/repository`, `/setup`, `/website`

• Utility (4): `/avatar`, `/ping`, `/time`, `/placeholders`

• Math (19): `/math operation add`, `/math operation subtract`, `/math operation multiply`, `/math operation divide`, `/math operation power`, `/math area rectangle`, `/math area square`, `/math area circle`, `/math area triangle1`, `/math area triangle2`, `/math righttriangle hypotenuse`, `/math righttriangle leg`, `/convert_number`, `/convert_temperature fahrenheit_to_celsius`, `/convert_temperature celsius_to_fahrenheit`, `/convert_temperature fahrenheit_to_kelvin`, `/convert_temperature kelvin_to_fahrenheit`, `/convert_temperature celsius_to_kelvin`, `/convert_temperature kelvin_to_celsius`

• Roblox (2): `/robloxinfo`, `/generaterobux`