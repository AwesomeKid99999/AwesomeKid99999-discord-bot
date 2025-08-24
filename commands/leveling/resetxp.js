const { SlashCommandBuilder, PermissionsBitField} = require('discord.js');
const {Level, XPSettings} = require('../../models/');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('resetxp')
        .setDescription('Reset a user\'s XP.')
        .setDMPermission(false)
        .addUserOption(option => option
            .setName('user')
            .setDescription('The user whose XP you want to reset.')
            .setRequired(true)
        ),
    async execute(interaction) {
        const user = interaction.options.getUser('user');
        const serverId = interaction.guild.id;

        if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageGuild)) {
            return interaction.reply(':x: You do not have permission to run this command.');
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



        if (user.bot) {
            return interaction.reply({ content: `Bots cannot get their XP reset.`, ephemeral: true });
        }



        // Check if the user has an XP record
        const userXP = await Level.findOne({
            where: { userId: user.id, serverId }
        });


        if (!userXP) {
            return interaction.reply({ content: `${user.username} does not have any XP data.`, ephemeral: true });
        }

        // Reset XP to 0
        userXP.currentXp = 0;
        userXP.totalXp = 0;
        userXP.level = xpSettings.startingLevel;  // Reset to starting level

        await userXP.save();

        return interaction.reply({ content: `${user.username}'s XP has been reset to 0!`, ephemeral: true });
    },
};