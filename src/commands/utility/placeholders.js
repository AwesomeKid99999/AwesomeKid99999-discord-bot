const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('placeholders')
        .setDMPermission(false)
        .setDescription('View all available placeholders you can use in messages and embeds.'),
    category: 'utility',
    async execute(interaction) {
        const message = `**Available Placeholders**

**User Placeholders:**
\`{user}\` - Mentions the user
\`{username}\` - User's display name
\`{tag}\` - User's full tag (e.g., User#1234)
\`{user_avatar}\` - User's avatar URL

**Server Placeholders:**
\`{server}\` - Server name
\`{server_members}\` - Total member count
\`{server_avatar}\` - Server icon URL

**Leveling Placeholders:**
\`{level}\` - User's current level
\`{current_xp}\` - Current XP in the level
\`{total_xp}\` - Total XP earned
\`{next_level_xp}\` - XP needed for next level
\`{rank}\` - User's rank on the leaderboard

**Usage Tips:**
• Use \`\\n\` for line breaks in messages
• Leveling placeholders work in embeds and level-up messages
• Avatar placeholders can be used for embed images/thumbnails
• Use \`\\\` before text to prevent placeholder replacement

**Where to Use:**
**Welcome/Leave Messages:** User & Server placeholders
**Embeds:** All placeholders (generate, create, edit commands)
**Level-Up Messages:** All placeholders
**Rank Messages:** All placeholders`;

        await interaction.reply(message);
    },
};
