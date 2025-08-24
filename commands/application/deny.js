const { SlashCommandBuilder } = require('discord.js');
const { denyApplication} = require("../../helpers/applicationActions");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('deny')
        .setDescription('Deny a staff application. (STAFF ONLY)')
        .setDMPermission(false)
        .addUserOption(option => option
            .setName('user')
            .setDescription('The user whose application you want to deny.')
            .setRequired(true)
        )
        .addStringOption(option => option
                .setName('reason')
                .setDescription('Reason for denying the application.')
                .setRequired(false)
            .setMaxLength(1000)
        ),

    async execute(interaction) {
        const user = interaction.options.getUser('user');
        const reason = interaction.options.getString('reason') || 'No specific reason provided';
        const serverId = interaction.guild.id;

        await denyApplication(interaction, user.id, reason, serverId);

    },
};