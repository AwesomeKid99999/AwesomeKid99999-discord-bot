# Bot Commands Guide

This guide provides detailed information about all available bot commands, organized by category.

**Legend:**
- `[required]` - Required parameter
- `[optional]` - Optional parameter
- Permission requirements are listed for each command

---

## 📋 Application Commands

Manage server applications and questions.

### `/application channel [channel]`
Set the channel where application responses will be sent.
- **Permission Required:** Manage Channels
- **Parameters:**
  - `[channel]` (optional) - The channel to set. Leave empty to remove.

### `/application toggle [application type]`
Open or close a specific type of application.
- **Permission Required:** Manage Server
- **Parameters:**
  - `[application type]` (required) - The type of application to toggle

### `/question add [question number] [application type] [question text/embed/image]`
Add a new question to an application type.
- **Permission Required:** Manage Server OR Staff Role
- **Parameters:**
  - `[question number]` (required) - The question number
  - `[application type]` (required) - The application type
  - At least one of: `[question text]`, `[embed]`, or `[image]` (required)
- **Note:** Embeds must be created beforehand and set to active

### `/question remove [question number] [application type]`
Remove a question from an application type.
- **Permission Required:** Manage Server OR Staff Role
- **Parameters:**
  - `[question number]` (required) - The question number to remove
  - `[application type]` (required) - The application type

### `/question change [question number] [application type] [question text/embed/image]`
Modify an existing question in an application type.
- **Permission Required:** Manage Server OR Staff Role
- **Parameters:**
  - `[question number]` (required) - The question number to change
  - `[application type]` (required) - The application type
  - At least one of: `[question text]`, `[embed]`, or `[image]` (required)

---

## 📊 Leveling Commands

Manage the XP and leveling system.

### `/xp settings change [options]`
Configure the leveling system settings.
- **Permission Required:** Manage Server
- **Required Parameters:**
  - `[min xp]` - Minimum XP gained per message
  - `[max xp]` - Maximum XP gained per message
  - `[multiplier]` - XP multiplier
  - `[enabled]` - Enable or disable the leveling system
- **Optional Parameters:**
  - `[cooldown]` - Cooldown between XP gains
  - `[effort booster]` - Enable effort-based XP boost
  - `[effort booster multiplier]` - Multiplier for effort boost
  - `[base xp]` - Base XP required for level 1
  - `[incremental xp]` - Additional XP required per level
  - `[starting level]` - Starting level for new users
  - `[level up message]` - Custom level-up message (supports placeholders)
  - `[level up channel]` - Channel for level-up announcements
  - `[level up embed]` - Embed to use for level-ups
  - `[rank message]` - Custom rank message (supports placeholders)
  - `[rank embed]` - Embed to use for rank display

### `/xp settings view`
View the current leveling system settings.
- **Permission Required:** Manage Server
- **Prerequisite:** XP settings must be configured

### `/xp add [user] [xp]`
Add XP to a user.
- **Permission Required:** Manage Server
- **Parameters:**
  - `[user]` (required) - The user to add XP to
  - `[xp]` (required) - Amount of XP to add
- **Prerequisite:** Leveling must be enabled

### `/xp remove [user] [xp]`
Remove XP from a user.
- **Permission Required:** Manage Server
- **Parameters:**
  - `[user]` (required) - The user to remove XP from
  - `[xp]` (required) - Amount of XP to remove
- **Prerequisite:** Leveling must be enabled

### `/xp set [user] [total xp]`
Set a user's total XP to a specific value.
- **Permission Required:** Manage Server
- **Parameters:**
  - `[user]` (required) - The user to set XP for
  - `[total xp]` (required) - The total XP amount
- **Prerequisite:** Leveling must be enabled

### `/xp ignored_channels add [channel]`
Add a channel to the XP ignore list.
- **Permission Required:** Manage Server
- **Parameters:**
  - `[channel]` (required) - Channel to ignore
- **Prerequisite:** Leveling must be enabled

### `/xp ignored_channels remove [channel]`
Remove a channel from the XP ignore list.
- **Permission Required:** Manage Server
- **Parameters:**
  - `[channel]` (required) - Channel to stop ignoring
- **Prerequisite:** Leveling must be enabled

### `/xp reset user [user]`
Reset a user's XP back to 0.
- **Permission Required:** Manage Server
- **Parameters:**
  - `[user]` (required) - The user to reset
- **Prerequisite:** Leveling must be enabled

### `/xp reset server`
Reset all users' XP in the server back to 0.
- **Permission Required:** Manage Server
- **Prerequisite:** Leveling must be enabled
- **Warning:** This action cannot be undone!

### `/rank [user]`
View your or another user's rank and XP information.
- **Permission Required:** None
- **Parameters:**
  - `[user]` (optional) - The user to check. Defaults to yourself.

### `/leaderboard [page]`
View the server's XP leaderboard.
- **Permission Required:** None
- **Parameters:**
  - `[page]` (optional) - Page number to view. Defaults to 1.

---

## 👥 Role Management Commands

Manage roles, custom roles, staff roles, and level role rewards.

### Basic Role Management

#### `/role add [user] [role]`
Add a role to a member.
- **Permission Required:** Manage Roles
- **Parameters:**
  - `[user]` (required) - The member to add the role to
  - `[role]` (required) - The role to add

#### `/role remove [user] [role]`
Remove a role from a member.
- **Permission Required:** Manage Roles
- **Parameters:**
  - `[user]` (required) - The member to remove the role from
  - `[role]` (required) - The role to remove

#### `/role create [name] [color] [hoisted]`
Create a new role in the server.
- **Permission Required:** Manage Roles
- **Parameters:**
  - `[name]` (required) - Name of the role
  - `[color]` (optional) - Hex color code (e.g., #ff0000)
  - `[hoisted]` (optional) - Display role separately in member list

#### `/role delete [role]`
Delete a role from the server.
- **Permission Required:** Manage Roles
- **Parameters:**
  - `[role]` (required) - The role to delete

#### `/role mute [role]`
Set or remove the mute role for the server.
- **Permission Required:** Manage Roles
- **Parameters:**
  - `[role]` (optional) - The role to set as mute role. Leave empty to remove.

### Custom Roles

#### `/role custom create [role]`
Add a role to the custom roles list.
- **Permission Required:** Manage Roles
- **Parameters:**
  - `[role]` (required) - The role to add to custom roles

#### `/role custom delete [role]`
Remove a role from the custom roles list.
- **Permission Required:** Manage Roles
- **Parameters:**
  - `[role]` (required) - The role to remove from custom roles

#### `/role custom add [user] [role]`
Assign a custom role to a member.
- **Permission Required:** Manage Roles
- **Parameters:**
  - `[user]` (required) - The member to assign the role to
  - `[role]` (required) - The custom role to assign
- **Prerequisite:** Role must be in the custom roles list

#### `/role custom remove [user] [role]`
Remove a custom role from a member.
- **Permission Required:** Manage Roles
- **Parameters:**
  - `[user]` (required) - The member to remove the role from
  - `[role]` (required) - The custom role to remove

#### `/role custom list`
List all custom roles configured in the server.
- **Permission Required:** None

### Staff Roles

#### `/role staff create [role]`
Add a role to the staff roles list.
- **Permission Required:** Manage Roles
- **Parameters:**
  - `[role]` (required) - The role to add to staff roles

#### `/role staff delete [role]`
Remove a role from the staff roles list.
- **Permission Required:** Manage Roles
- **Parameters:**
  - `[role]` (required) - The role to remove from staff roles

#### `/role staff add [user] [role]`
Assign a staff role to a member.
- **Permission Required:** Manage Roles
- **Parameters:**
  - `[user]` (required) - The member to assign the role to
  - `[role]` (required) - The staff role to assign
- **Prerequisite:** Role must be in the staff roles list

#### `/role staff remove [user] [role]`
Remove a staff role from a member.
- **Permission Required:** Manage Roles
- **Parameters:**
  - `[user]` (required) - The member to remove the role from
  - `[role]` (required) - The staff role to remove

#### `/role staff list`
List all staff roles configured in the server.
- **Permission Required:** Manage Roles

### Level Role Rewards

#### `/role level create [role] [level]`
Add a role reward for reaching a specific level.
- **Permission Required:** Manage Roles
- **Parameters:**
  - `[role]` (required) - The role to award
  - `[level]` (required) - The level required to earn the role

#### `/role level delete [level]`
Remove a level role reward.
- **Permission Required:** Manage Roles
- **Parameters:**
  - `[level]` (required) - The level to remove the reward from

#### `/role level list`
List all level role rewards configured in the server.
- **Permission Required:** None

---

## 🎉 Welcome/Leave Commands

Configure welcome and leave announcements.

### `/welcome channel [channel]`
Set the channel for welcome announcements.
- **Permission Required:** Manage Server
- **Parameters:**
  - `[channel]` (optional) - The channel to set. Leave empty to remove.

### `/welcome message [message] [embed]`
Set the welcome message and/or embed.
- **Permission Required:** Manage Server
- **Parameters:**
  - `[message]` (optional) - The message text (supports placeholders)
  - `[embed]` (optional) - The name of the embed to use
- **Note:** At least one parameter is required. Both can be used together.

### `/welcome test`
Test the welcome message configuration.
- **Permission Required:** Manage Messages
- **Prerequisite:** Welcome message or embed must be configured

### `/leave channel [channel]`
Set the channel for leave announcements.
- **Permission Required:** Manage Server
- **Parameters:**
  - `[channel]` (optional) - The channel to set. Leave empty to remove.

### `/leave message [message]`
Set the leave message.
- **Permission Required:** Manage Messages
- **Parameters:**
  - `[message]` (optional) - The message text (supports placeholders). Leave empty to remove.

### `/leave embed [name]`
Set the leave embed.
- **Permission Required:** Manage Server
- **Parameters:**
  - `[name]` (optional) - The name of the embed to use. Leave empty to remove.
- **Prerequisite:** Embed must exist and be active

### `/leave test`
Test the leave message configuration.
- **Permission Required:** Manage Messages
- **Prerequisite:** Leave message or embed must be configured

---

## 🎨 Embed Commands

Create and manage custom embeds.

### `/embed create [name] [options]`
Create a new custom embed.
- **Permission Required:** Manage Server
- **Required Parameters:**
  - `[name]` - Unique name for the embed
- **Optional Parameters:**
  - `[author text]` - Author section text (supports placeholders)
  - `[author image]` - Author section image URL
  - `[color]` - Embed color (hex code or Discord color name)
  - `[title]` - Embed title (supports placeholders)
  - `[description]` - Main embed text (supports placeholders)
  - `[thumbnail]` - Thumbnail image URL
  - `[image]` - Main image URL
  - `[footer text]` - Footer text (supports placeholders)
  - `[footer image]` - Footer image URL
  - `[timestamp]` - Show timestamp (true/false)
  - `[active]` - Set embed as active (true/false)

### `/embed edit [name] [options]`
Edit an existing embed.
- **Permission Required:** Manage Server
- **Required Parameters:**
  - `[name]` - Name of the embed to edit
- **Optional Parameters:** Same as `/embed create`

### `/embed delete [name]`
Delete an embed.
- **Permission Required:** Manage Server
- **Parameters:**
  - `[name]` (required) - Name of the embed to delete

### `/embed list`
List all embeds in the server.
- **Permission Required:** Manage Server

### `/embed show [name]`
Display a specific embed.
- **Permission Required:** Manage Server
- **Parameters:**
  - `[name]` (required) - Name of the embed to show

### `/embed generate [options]`
Generate a one-time embed (not saved to database).
- **Permission Required:** Send Messages
- **Optional Parameters:**
  - `[author text]` - Author section text (supports placeholders)
  - `[author image]` - Author section image URL
  - `[color]` - Embed color
  - `[title]` - Embed title (supports placeholders)
  - `[description]` - Main embed text (supports placeholders)
  - `[thumbnail]` - Thumbnail image URL
  - `[image]` - Main image URL
  - `[footer text]` - Footer text (supports placeholders)
  - `[footer image]` - Footer image URL
  - `[timestamp]` - Show timestamp (true/false)
  - `[channel]` - Channel to send to (defaults to current channel)

**Special Placeholder Values for Images:**
- Use `{user_avatar}` for user's avatar
- Use `{server_avatar}` for server's icon

---

## 🛡️ Moderation Commands

Moderation and server management tools.

### `/mute [user]`
Mute a member in the server.
- **Permission Required:** Manage Roles
- **Parameters:**
  - `[user]` (required) - The member to mute
- **Prerequisite:** Mute role must be configured

### `/unmute [user]`
Unmute a member in the server.
- **Permission Required:** Manage Roles
- **Parameters:**
  - `[user]` (required) - The member to unmute
- **Prerequisite:** Mute role must be configured

### `/ban [user] [reason]`
Ban a user from the server.
- **Permission Required:** Ban Members
- **Parameters:**
  - `[user]` (required) - The user to ban
  - `[reason]` (optional) - Reason for the ban

### `/unban [user] [reason]`
Unban a user from the server.
- **Permission Required:** Ban Members
- **Parameters:**
  - `[user]` (required) - The user to unban
  - `[reason]` (optional) - Reason for the unban

### `/kick [user] [reason]`
Kick a member from the server.
- **Permission Required:** Kick Members
- **Parameters:**
  - `[user]` (required) - The member to kick
  - `[reason]` (optional) - Reason for the kick

### `/purge [amount]`
Bulk delete messages in the current channel.
- **Permission Required:** Manage Messages
- **Parameters:**
  - `[amount]` (required) - Number of messages to delete (1-100)

### `/messagelogchannel [channel]`
Set the channel for logging message edits and deletions.
- **Permission Required:** Manage Channels
- **Parameters:**
  - `[channel]` (optional) - The channel to set. Leave empty to remove.

---

## 🎁 Giveaway Commands

Create and manage giveaways.

### `/giveaway start [prize] [winners] [duration options]`
Start a new giveaway.
- **Permission Required:** Manage Server
- **Required Parameters:**
  - `[prize]` - What the winners receive (max 255 characters)
  - `[winners]` - Number of winners (minimum 1)
- **Duration Parameters (at least one required):**
  - `[days]` - Duration in days (0+)
  - `[hours]` - Duration in hours (0-23)
  - `[minutes]` - Duration in minutes (0-59)
  - `[seconds]` - Duration in seconds (0-59)
  - `[milliseconds]` - Duration in milliseconds (0-999)
- **Note:** Giveaway posts in current channel. Total duration must be greater than 0.

### `/giveaway edit [message id] [options]`
Edit an active giveaway.
- **Permission Required:** Manage Server
- **Required Parameters:**
  - `[message id]` - The message ID of the giveaway
- **Optional Parameters:**
  - `[prize]` - New prize
  - `[winners]` - New number of winners (minimum 1)
  - **Set New Duration (overrides add_seconds):**
    - `[days]` - Set new duration in days (0+)
    - `[hours]` - Set new duration in hours (0-23)
    - `[minutes]` - Set new duration in minutes (0-59)
    - `[seconds]` - Set new duration in seconds (0-59)
    - `[milliseconds]` - Set new duration in milliseconds (0-999)
  - `[add_seconds]` - Add/subtract seconds to current end time (use negative to shorten)
- **Note:** At least one parameter must be provided. Duration parameters set a new end time from the giveaway's creation, while add_seconds modifies the current end time.

### `/giveaway end [message id]`
End a giveaway early.
- **Permission Required:** Manage Server
- **Parameters:**
  - `[message id]` (required) - The message ID of the giveaway

### `/giveaway reroll [message id]`
Reroll the winners of a completed giveaway.
- **Permission Required:** Manage Server
- **Parameters:**
  - `[message id]` (required) - The message ID of the giveaway

---

## 🎮 Fun Commands

Entertainment and interactive commands.

### `/beep`
Make the bot reply with "Boop!".
- **Permission Required:** None

### `/hello`
Make the bot say "Hello World!".
- **Permission Required:** None

### `/button [label] [color]`
Generate a clickable button.
- **Permission Required:** None
- **Parameters:**
  - `[label]` (required) - Text on the button (max 80 characters)
  - `[color]` (optional) - Button color (blue, gray, green, red)

### `/count [starting number] [ending number]`
Count from one number to another.
- **Permission Required:** None
- **Parameters:**
  - `[starting number]` (required) - Number to start from
  - `[ending number]` (required) - Number to count to
- **Note:** Large ranges will be sent as a file

### `/count_to_three [target]`
Countdown game - ping the bot before it reaches 3!
- **Permission Required:** None
- **Parameters:**
  - `[target]` (optional) - Member who's "in trouble"

### `/giveaway` (See Giveaway Commands section)

### `/log [input]`
Send a message to the bot's console log.
- **Permission Required:** None
- **Parameters:**
  - `[input]` (required) - Message to log (max 1912 characters)

### `/message [target] [message] [anonymous]`
Make the bot DM someone.
- **Permission Required:** None
- **Parameters:**
  - `[target]` (required) - User to message
  - `[message]` (required) - Message to send (max 1811 characters)
  - `[anonymous]` (optional) - Send anonymously (true/false)

### `/poll [question] [option1] [option2] [option3] [option4] [option5]`
Create a poll with up to 5 options.
- **Permission Required:** None
- **Parameters:**
  - `[question]` (required) - The poll question
  - `[option1]` (required) - First option
  - `[option2]` (required) - Second option
  - `[option3-5]` (optional) - Additional options

### `/say [message] [channel]`
Make the bot say something.
- **Permission Required:** Manage Messages
- **Parameters:**
  - `[message]` (required) - What to say
  - `[channel]` (optional) - Where to say it (defaults to current channel)

### `/toggle_memes [enabled]`
Enable or disable memes like "six seven ate nine" and "9+10=21".
- **Permission Required:** Manage Server
- **Parameters:**
  - `[enabled]` (optional) - true to enable, false/empty to disable

---

## 🎭 Fake Moderation Commands

Joke moderation commands (don't actually perform actions).

### `/fakemod ban [target] [reason]`
Pretend to ban someone (jokingly).
- **Permission Required:** None
- **Parameters:**
  - `[target]` (required) - User to "ban"
  - `[reason]` (optional) - Joke reason

### `/fakemod kick [target] [reason]`
Pretend to kick someone (jokingly).
- **Permission Required:** None
- **Parameters:**
  - `[target]` (required) - User to "kick"
  - `[reason]` (optional) - Joke reason

### `/fakemod mute [target] [reason] [days] [hours] [minutes] [seconds]`
Pretend to mute someone (jokingly).
- **Permission Required:** None
- **Parameters:**
  - `[target]` (required) - User to "mute"
  - `[reason]` (optional) - Joke reason
  - `[days/hours/minutes/seconds]` (optional) - Fake duration

### `/fakemod warn [target] [reason]`
Pretend to warn someone (jokingly).
- **Permission Required:** None
- **Parameters:**
  - `[target]` (required) - User to "warn"
  - `[reason]` (required) - Joke reason

---

## ℹ️ Information Commands

Get information about users, the server, and the bot.

### `/info bot`
Display information about the bot.
- **Permission Required:** None

### `/info server`
Display information about the current server.
- **Permission Required:** None

### `/info user [target]`
Display information about a user.
- **Permission Required:** None
- **Parameters:**
  - `[target]` (optional) - User to check. Defaults to yourself.

### `/commands`
View a list of available slash commands.
- **Permission Required:** None

### `/repository`
View the bot's GitHub repository.
- **Permission Required:** None

### `/website`
View the bot owner's website.
- **Permission Required:** None

---

## 🔧 Utility Commands

Helpful utility commands.

### `/avatar [target]`
Get the avatar URL of a user.
- **Permission Required:** None
- **Parameters:**
  - `[target]` (optional) - User to get avatar from. Defaults to yourself.

### `/ping`
Check the bot's latency.
- **Permission Required:** None

### `/time`
Get the current time (matches your timezone).
- **Permission Required:** None

### `/placeholders`
View all available placeholders for messages and embeds.
- **Permission Required:** None

---

## 🧮 Math Commands

Mathematical calculations and conversions.

### `/math operation [type] [first] [second]`
Perform basic math operations.
- **Permission Required:** None
- **Subcommands:**
  - `add` - Add two numbers
  - `subtract` - Subtract two numbers
  - `multiply` - Multiply two numbers
  - `divide` - Divide two numbers
  - `power` - Raise a number to a power

### `/math area [shape] [dimensions]`
Calculate the area of various shapes.
- **Permission Required:** None
- **Subcommands:**
  - `rectangle` - Area of a rectangle (length, width)
  - `square` - Area of a square (side length)
  - `circle` - Area of a circle (radius)
  - `triangle1` - Area of a triangle (base, height)
  - `triangle2` - Area of a triangle using Heron's formula (3 sides)

### `/math righttriangle [type] [sides]`
Calculate right triangle measurements.
- **Permission Required:** None
- **Subcommands:**
  - `hypotenuse` - Find hypotenuse (side1, side2)
  - `leg` - Find a leg (other leg, hypotenuse)

### `/convert_number [input base] [number] [output base]`
Convert numbers between different bases (2-36).
- **Permission Required:** None
- **Parameters:**
  - `[input base]` (required) - Base of the input (2-36)
  - `[number]` (required) - Number to convert
  - `[output base]` (required) - Desired base (2-36)

### `/convert_temperature [type] [degrees]`
Convert temperatures between Fahrenheit, Celsius, and Kelvin.
- **Permission Required:** None
- **Subcommands:**
  - `fahrenheit_to_celsius`
  - `celsius_to_fahrenheit`
  - `fahrenheit_to_kelvin`
  - `kelvin_to_fahrenheit`
  - `celsius_to_kelvin`
  - `kelvin_to_celsius`

---

## 🎮 Roblox Commands

Roblox-related commands.

### `/robloxinfo [id]`
Get information about a Roblox user.
- **Permission Required:** None
- **Parameters:**
  - `[id]` (required) - The Roblox user ID

### `/generaterobux`
Fun fake Robux generator (joke command).
- **Permission Required:** None
- **Note:** This is a joke command and doesn't actually generate Robux!

---

## 📝 Placeholders Reference

Placeholders can be used in messages, embeds, and various bot features.

### User Placeholders
- `{user}` - Mentions the user (@User)
- `{username}` - User's display name
- `{tag}` - User's full tag (User#1234)
- `{user_avatar}` - User's avatar URL

### Server Placeholders
- `{server}` - Server name
- `{server_members}` - Total member count
- `{server_avatar}` - Server icon URL

### Leveling Placeholders
- `{level}` - User's current level
- `{current_xp}` - Current XP in the level
- `{total_xp}` - Total XP earned
- `{next_level_xp}` - XP needed for next level
- `{rank}` - User's rank on the leaderboard

### Special Notes
- Use `\n` for line breaks in messages
- Use `\` before text to prevent placeholder replacement
- Avatar placeholders can be used as image URLs in embeds

---

## 🔑 Permission Requirements

**Server Permissions:**
- Manage Server
- Manage Channels
- Manage Messages
- Manage Roles
- Ban Members
- Kick Members

**Bot Permissions:**
The bot needs the same permissions it's granting to others. Ensure the bot's role is positioned correctly in the role hierarchy.

**Staff Roles:**
Some commands can be used by members with configured staff roles, even without server permissions.

---

*For setup and configuration instructions, see [SETUPGUIDE.md](SETUPGUIDE.md)*
