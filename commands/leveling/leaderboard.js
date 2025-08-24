const { SlashCommandBuilder } = require('discord.js');
const {Level, XPSettings} = require('../../models/');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('leaderboard')
        .setDMPermission(false)
        .setDescription('View the leaderboard of XP for the server.'),
    async execute(interaction) {
        const serverId = interaction.guild.id;

        // Fetch the XP settings for the server
        const xpSettings = await XPSettings.findOne({ where: { serverId } });
        if (!xpSettings) {
            return interaction.reply('XP settings are not configured for this server.');
        }

        if (!xpSettings.enabled) {
            interaction.reply(`Leveling not enabled.`);
            return;
        }

        // Fetch and sort the users' XP data from the database
        const leaderboard = await Level.findAll({
            where: { serverId },
            order: [['totalXp', 'DESC']], // Sort by total XP in descending order
            limit: 10, // Display top 10 users
        });

        if (leaderboard.length === 0) {
            return interaction.reply('No users have XP data in this server.');
        }

        // Prepare the leaderboard message
        const leaderboardMessage = leaderboard.map((entry, index) => {
            return `${index + 1}. <@${entry.userId}> - ${entry.totalXp} XP (Level ${entry.level})`;
        }).join('\n');

        // Send the leaderboard message
        return interaction.reply({
            content: `**XP Leaderboard**\n\n${leaderboardMessage}`,
            allowedMentions: { parse: [] }, // Prevent @everyone, @here, and user mentions from being pinged
            ephemeral: false,
        });
    },
};