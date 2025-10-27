const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const {Level, XPSettings} = require('../../models/');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('leaderboard')
        .setDMPermission(false)
        .setDescription('View the leaderboard of XP for the server.')
        .addStringOption(option => option
            .setName('type')
            .setDescription('The type of leaderboard to view')
            .setRequired(false)
            .addChoices(
                { name: 'classic (default)', value: 'classic' },
                { name: 'compact',          value: 'compact' },
                { name: 'embed',            value: 'embed' },
            ))
            .addIntegerOption(option => option
                .setName('limit')
                .setDescription('The number of users to display on the leaderboard')
                .setRequired(false)
                .setMinValue(1)
                .setMaxValue(100)),
    async execute(interaction) {
        const serverId = interaction.guild.id;
        const limit = interaction.options.getInteger('limit') ?? 10;

        const type = interaction.options.getString('type') ?? 'classic';
        // Fetch the XP settings for the server
        const xpSettings = await XPSettings.findOne({ where: { serverId } });
        if (!xpSettings) {
            return interaction.reply('XP settings are not configured for this server.');
        }

        if (!xpSettings.enabled) {
            interaction.reply(`Leveling not enabled.`);
            return;
        }

        await interaction.deferReply();

        // Fetch and sort the users' XP data from the database
        const leaderboard = await Level.findAll({
            where: { serverId },
            order: [['totalXp', 'DESC']], // Sort by total XP in descending order
            limit: limit, // Display top 10 users
        });

        if (leaderboard.length === 0) {
            return interaction.editReply('No users have XP data in this server.');
        }


        if (type === 'compact') {
            const line = leaderboard.map((e, index) => `#${index+1} <@${e.userId}>(${e.totalXp} XP)`).join(' • ');
            return interaction.editReply({
                content: `**XP Leaderboard (Top ${limit})**\n${line}`,
                allowedMentions: { parse: [] }
            });
        }

        // Prepare the leaderboard message
        const leaderboardMessage = leaderboard.map((entry, index) => {
            return `${index + 1}. <@${entry.userId}> - ${entry.totalXp} XP (Level ${entry.level})`;
        }).join('\n');


        if (type === 'embed') {
            const embed = new EmbedBuilder()
                .setColor(0x00ff00)
                .setTitle(`**XP Leaderboard (Top ${limit})**`)
                .setAuthor({ name: interaction.guild.name, iconURL: interaction.guild.iconURL({ dynamic: true }) })
                .setDescription(`${leaderboardMessage}`)
                .setFooter({ text: `Requested by ${interaction.user.username}`, iconURL: interaction.user.displayAvatarURL({ dynamic: true }) })
                .setTimestamp();
            return interaction.editReply({ embeds: [embed] });
        }

        // Send the leaderboard message
        return interaction.editReply({
            content: `**XP Leaderboard (Top ${limit})**\n\n${leaderboardMessage}`,
            allowedMentions: { parse: [] }, // Prevent @everyone, @here, and user mentions from being pinged
            ephemeral: false,
        });
    },
};