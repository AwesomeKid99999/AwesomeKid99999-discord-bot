const { SlashCommandBuilder } = require('discord.js');
const {Level, XPSettings} = require('../../models')


module.exports = {
    data: new SlashCommandBuilder()
        .setName('rank')
        .setDescription('Check your rank and XP in the server.')
        .setDMPermission(false)
        .addUserOption(option => option
            .setName('user')
            .setDescription('The user to check the rank for (default is you).')
            .setRequired(false)),
    async execute(interaction) {
        const user = interaction.options.getUser('user') || interaction.user; // Use the mentioned user or the command issuer
        const serverId = interaction.guild.id;
        const userId = user.id




        const xpSettings = await XPSettings.findOne({
            where: { serverId: serverId }
        });
        if (!xpSettings) return interaction.reply(`This server doesn't have any XP settings set up.`);

        if (!xpSettings.enabled) {
            interaction.reply(`Leveling not enabled.`);
            return;
        }


        // Find the user's XP record in the database
        const userXP = await Level.findOne({
            where: { userId: user.id, serverId: serverId },
        });

        // If the user has no XP record
        if (!userXP) {
            return interaction.reply(`**${user.username}** has no XP data.`);
        }

        const usersXP = await Level.findAll({
            where: { serverId: serverId },
            order: [['totalXp', 'DESC']]
        });

        // Calculate the required XP for the current level
        const xpBase = xpSettings.baseXp;
        const xpIncrement = xpSettings.xpIncrement;
        const startingLevel = xpSettings.startingLevel;
        const currentLevel = userXP.level;
        const nextLevelXP = xpBase + (xpIncrement * (currentLevel - startingLevel));

        const rank = await usersXP.findIndex(user => user.userId === userId)+1;

        // Send a message with the user's rank, XP, and level
        return interaction.reply(`**${user.username}'s Rank** in **${interaction.guild.name}**\n**Level:** ${userXP.level}\n**Current XP:** ${userXP.currentXp}/${nextLevelXP}\n**Total XP:** ${userXP.totalXp}\n**Rank:** #${rank}
        `);
    },
};