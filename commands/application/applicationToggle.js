const { SlashCommandBuilder, PermissionsBitField } = require('discord.js');
const {Guild, Application} = require('../../models/')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('applicationtoggle')
        .setDescription('Open or close staff applications in the server. (STAFF ONLY)')
        .setDMPermission(false)
        .addStringOption(option =>
            option.setName('type')
                .setDescription('The type of application to toggle (single word only)')
                .setRequired(true)
                .setMaxLength(50))
        .addBooleanOption(option => option
            .setName('open')
            .setDescription('Whether or not to open applications for this type')),
    category: 'moderation',
    async execute(interaction) {
        const enable = interaction.options.getBoolean('open');
        const applicationType = interaction.options.getString('type').toLowerCase();
        const serverId = interaction.guild.id;

        // Validate that application type is a single word
        if (applicationType.includes(' ') || applicationType.includes('-') || applicationType.includes('_')) {
            return await interaction.reply({
                content: 'Application type must be a single word (no spaces, hyphens, or underscores).',
                ephemeral: true,
            });
        }

        if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageGuild)) {
            return interaction.reply(':x: You do not have permission to manage the server.');
        }

        // Find or create an application record for this server and type to store the toggle state
        const [applicationToggle] = await Application.findOrCreate({
            where: { 
                serverId: serverId, 
                applicationType: applicationType,
                userId: 'SYSTEM_TOGGLE' // Use a special system user ID for toggle records
            },
            defaults: {
                serverId: serverId,
                userId: 'SYSTEM_TOGGLE',
                channelId: 'SYSTEM',
                confirmationId: 'SYSTEM',
                applicationType: applicationType,
                response: {},
                applicationToggle: enable,
                status: 'pending'
            }
        });

        // Update the toggle state
        await applicationToggle.update({ applicationToggle: enable });

        if (!enable) {
            console.log(`${applicationType} applications disabled in ${interaction.guild.name}`);
            return await interaction.reply(`${applicationType.charAt(0).toUpperCase() + applicationType.slice(1)} applications have been **closed**.`);
        } else {
            console.log(`${applicationType} applications enabled in ${interaction.guild.name}`);
            return await interaction.reply(`${applicationType.charAt(0).toUpperCase() + applicationType.slice(1)} applications have been **opened**.`);
        }


    },
};