# Bot Database Setup Guide

This guide covers the initial setup and configuration of database features for the bot. For a full list of commands, see COMMANDS.md.

## Applications Setup

**Required Permissions:** Manage Channels (for channel setup), Manage Server (for toggles), Staff Role (for questions)

1. Set the application response channel using `/application channel [channel]`
2. Open/close application types using `/application toggle <application type>`
3. Configure questions for each application type using `/question add/remove/change`

**Prerequisites:**
- Staff roles must be configured first (see Custom/Staff Roles section)
- To use embeds in questions, create them beforehand and set them to active (see Embeds section)

## Leveling System Setup

**Required Permissions:** Manage Server

### Initial Configuration
1. Configure basic leveling settings using `/xp settings change <min xp> <max xp> <multiplier> <enabled>`
   - These four parameters are required to start using the leveling system
   - Optional: Configure additional settings like cooldown, effort booster, base XP, incremental XP, starting level, messages, and embeds

### Optional Features
- Set up ignored XP channels using `/xp ignored_channels add/remove <channel>`
- Configure level role rewards using `/role level create/delete <role> <level>`
- Customize level-up messages and embeds
- Customize rank messages and embeds

**View current settings:** Use `/xp settings view`

## Custom/Staff Roles Setup

**Required Permissions:** Manage Roles

### Custom Roles
Custom roles are special roles that can be assigned to members for various purposes.

1. Add roles to the custom roles list using `/role custom create <role>`
2. Assign/remove custom roles to members using `/role custom add/remove <user> <role>`

**View configured roles:** Use `/role custom list`

### Staff Roles
Staff roles grant access to staff-only commands and features (like managing applications).

1. Add roles to the staff roles list using `/role staff create <role>`
2. Assign/remove staff roles to members using `/role staff add/remove <user> <role>`

**View configured roles:** Use `/role staff list`

## Welcome/Leave Announcements Setup

**Required Permissions:** Manage Server

1. Set announcement channels:
   - Welcome: `/welcome channel [channel]`
   - Leave: `/leave channel [channel]`

2. Configure messages (at least one is required):
   - Set welcome message/embed: `/welcome message [message] [embed]`
   - Set leave message/embed: `/leave message [message] [embed]`

3. Test your configuration:
   - `/welcome test`
   - `/leave test`

**Notes:**
- You can use both a message and an embed together
- Embeds must be created beforehand and set to active
- Use placeholders to personalize messages (see Placeholders section)

## Embeds Setup

**Required Permissions:** Manage Server

Embeds are reusable message cards that can be used in welcome/leave messages, level-up notifications, and more.

1. Create an embed using `/embed create <name>` with desired fields
2. Set the embed to active (use `[active] = true` when creating)
3. Reference the embed by name in other features

**Managing Embeds:**
- Edit: `/embed edit <name>`
- Delete: `/embed delete <name>`
- View all: `/embed list`
- Preview: `/embed show <name>`

**Important:** Embeds must be set to active to be used in automated messages (welcome/leave/level-up).

## Placeholders

Placeholders are dynamic text that gets replaced with actual values in messages and embeds.

**Available Placeholders:**
- **User:** `{user}`, `{username}`, `{tag}`, `{user_avatar}`
- **Server:** `{server}`, `{server_members}`, `{server_avatar}`
- **Leveling:** `{level}`, `{current_xp}`, `{total_xp}`, `{next_level_xp}`, `{rank}`

**Usage:**
- Use `\n` for line breaks in messages
- Use `\` before text to prevent placeholder replacement
- View all placeholders anytime with `/placeholders`

## Moderation Setup

**Required Permissions:** Manage Roles (mute role), Manage Channels (message log)

### Mute Role
Configure a mute role to enable the mute/unmute commands:
- Set mute role: `/role mute [role]`
- Remove mute role: `/role mute` (leave empty)

### Message Logging
Track message edits and deletions in a dedicated channel:
- Set log channel: `/messagelogchannel [channel]`
- Remove log channel: `/messagelogchannel` (leave empty)

**Note:** The mute role must be configured before you can use mute/unmute commands.

## Giveaways Setup

**Required Permissions:** Manage Server

No initial setup required. Use `/giveaway start` to create giveaways in any channel.

**Managing Giveaways:**
- Start: `/giveaway start <prize> <winners> [days] [hours] [minutes] [seconds] [milliseconds]`
  - Posts in the channel where the command is used
  - At least one duration parameter must be greater than 0
- Edit: `/giveaway edit <message id>` - Change prize, winners, or duration
- End early: `/giveaway end <message id>`
- Reroll: `/giveaway reroll <message id>`

**Duration format:** Separate parameters for days, hours, minutes, seconds, and milliseconds. Example: 1 day and 12 hours would be `[days]: 1` and `[hours]: 12`
