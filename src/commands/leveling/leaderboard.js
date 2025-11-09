const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { Level, XPSettings } = require('../../models/');
const { category } = require('../info/commands');

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
    category: 'leveling',
    async execute(interaction) {
        const serverId = interaction.guild.id;
        const limit = interaction.options.getInteger('limit') ?? 10;
        const type = interaction.options.getString('type') ?? 'classic';

        // Fetch XP settings
        const xpSettings = await XPSettings.findOne({ where: { serverId } });
        if (!xpSettings)
            return interaction.reply('XP settings are not configured for this server.');
        if (!xpSettings.enabled)
            return interaction.reply('Leveling is not enabled.');

        await interaction.deferReply();

        // Get leaderboard
        const leaderboard = await Level.findAll({
            where: { serverId },
            order: [['totalXp', 'DESC']],
            limit,
        });

        if (leaderboard.length === 0)
            return interaction.editReply('No users have XP data in this server.');

        // Compact style
        if (type === 'compact') {
            const line = leaderboard.map(
                (e, index) => `#${index + 1} <@${e.userId}> (${e.totalXp} XP)`
            ).join(' • ');

            const chunks = splitMessage(`**XP Leaderboard (Top ${limit})**\n${line}`);
            for (const chunk of chunks)
                await interaction.followUp({ content: chunk, allowedMentions: { parse: [] } });
            return;
        }

        // Classic / Embed style
        const leaderboardMessage = leaderboard.map(
            (entry, index) => `${index + 1}. <@${entry.userId}> - ${entry.totalXp} XP (Level ${entry.level})`
        ).join('\n');

        if (type === 'embed') {
            const embed = new EmbedBuilder()
                .setColor(0x00ff00)
                .setTitle(`XP Leaderboard (Top ${limit})`)
                .setAuthor({
                    name: interaction.guild.name,
                    iconURL: interaction.guild.iconURL({ dynamic: true })
                })
                .setFooter({
                    text: `Requested by ${interaction.user.username}`,
                    iconURL: interaction.user.displayAvatarURL({ dynamic: true })
                })
                .setTimestamp();

            // Split embed description if it exceeds 4096 chars
            const chunks = splitMessage(leaderboardMessage, 4096);
            embed.setDescription(chunks.shift());
            await interaction.editReply({ embeds: [embed] });

            // Send overflow chunks as follow-up embeds
            for (const chunk of chunks) {
                const overflowEmbed = new EmbedBuilder()
                    .setColor(0x00ff00)
                    .setDescription(chunk);
                await interaction.followUp({ embeds: [overflowEmbed] });
            }
            return;
        }

        // Classic
        const chunks = splitMessage(`**XP Leaderboard (Top ${limit})**\n\n${leaderboardMessage}`);
        for (const [i, chunk] of chunks.entries()) {
            if (i === 0)
                await interaction.editReply({ content: chunk, allowedMentions: { parse: [] } });
            else
                await interaction.followUp({ content: chunk, allowedMentions: { parse: [] } });
        }
    },
};

// Utility to split long messages safely
function splitMessage(text, maxLength = 2000) {
    const chunks = [];
    while (text.length > 0) {
        if (text.length <= maxLength) {
            chunks.push(text);
            break;
        }
        // Split at nearest newline to avoid mid-word cuts
        let slice = text.slice(0, maxLength);
        const lastNewline = slice.lastIndexOf('\n');
        if (lastNewline > 0) slice = slice.slice(0, lastNewline);
        chunks.push(slice);
        text = text.slice(slice.length);
    }
    return chunks;
}