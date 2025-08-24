const { SlashCommandBuilder, PermissionsBitField} = require('discord.js');
const {Level, XPSettings} = require("../../models/");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('resetallxp')
        .setDescription('Reset XP for all users in the server.')
        .setDMPermission(false),
    async execute(interaction) {
        const serverId = interaction.guild.id;

        // Check if the user has permission (for example, admin or staff role check)
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageGuild)) {
            return interaction.reply({ content: 'You do not have permission to reset XP for all users.', ephemeral: true });
        }

        const xpSettings = await XPSettings.findOne({
            where: { serverId },
        });
        if (!xpSettings) {
            interaction.reply(`XP settings not found for this server.`);
            return;
        }
        if (!xpSettings.enabled) {
            interaction.reply(`Leveling not enabled.`);
            return;
        }

        // Find all user XP records in the server and reset them
        const allUsersXP = await Level.findAll({ where: { serverId } });

        if (allUsersXP.length === 0) {
            return interaction.reply({ content: 'There are no XP records to reset.', ephemeral: true });
        }

        await interaction.deferReply();

        // Reset each user's XP
        for (const userXP of allUsersXP) {
            userXP.currentXp = 0;
            userXP.totalXp = 0;
            userXP.level = xpSettings.startingLevel;  // Reset all users to level 1
            await userXP.save();
        }

        return interaction.editReply({ content: 'XP has been reset for all users in the server.', ephemeral: true });
    },
};