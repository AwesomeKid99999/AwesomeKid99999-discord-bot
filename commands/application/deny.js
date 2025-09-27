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
        .addStringOption(option =>
            option.setName('type')
                .setDescription('The type of application to deny (single word only)')
                .setRequired(true)
                .setMaxLength(50))
        .addStringOption(option => option
                .setName('reason')
                .setDescription('Reason for denying the application.')
                .setRequired(false)
            .setMaxLength(1000)
        ),

    async execute(interaction) {
        const user = interaction.options.getUser('user');
        const reason = interaction.options.getString('reason') || 'No specific reason provided';
        const applicationType = interaction.options.getString('type').toLowerCase();
        const serverId = interaction.guild.id;

        await interaction.deferReply({ ephemeral: true });
        // Validate that application type is a single word
        if (applicationType.includes(' ') || applicationType.includes('-') || applicationType.includes('_')) {
            return await interaction.reply({
                content: 'Application type must be a single word (no spaces, hyphens, or underscores).',
                ephemeral: true,
            });
        }


        await denyApplication(interaction, user.id, reason, serverId, applicationType);

    },
};