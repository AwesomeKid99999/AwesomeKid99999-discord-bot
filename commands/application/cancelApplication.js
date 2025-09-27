const { SlashCommandBuilder } = require('discord.js');
const {Application, Guild} = require('../../models/');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('cancelapplication')
        .setDescription('Cancel your application.')
        .setDMPermission(false)
        .addStringOption(option =>
            option.setName('type')
                .setDescription('The type of application you want to cancel (single word only)')
                .setRequired(true)
                .setMaxLength(50)),
    async execute(interaction) {
        const userId = interaction.user.id;
        const serverId = interaction.guild.id;
        const applicationType = interaction.options.getString('type').toLowerCase();
        
        // Validate that application type is a single word
        if (applicationType.includes(' ') || applicationType.includes('-') || applicationType.includes('_')) {
            return await interaction.reply({
                content: 'Application type must be a single word (no spaces, hyphens, or underscores).',
                ephemeral: true,
            });
        }
        
        const guild = await Guild.findOne({where: {serverId: await interaction.guild.id}});

        // Check if the user already has an application channel
        const existingChannel = interaction.guild.channels.cache.find(
            (channel) => channel.name === `application-${applicationType}-${interaction.user.username.toLowerCase()}` && channel.type === 0 // 0 = GuildText
        );


        try {
            // Find the application for the user
            const application = await Application.findOne({
                where: { userId: userId, serverId: serverId, status: 'pending', applicationType: applicationType },
            });

            if (!application && existingChannel) {
                existingChannel.delete();
                return interaction.reply({
                    content: 'Deleted in progress application with type ' + applicationType + '.',
                    ephemeral: true,
                });
            }
            if (!application) {
                return interaction.reply({
                    content: 'You do not have a pending application with type ' + applicationType + ' to cancel.',
                    ephemeral: true,
                });
            }


            // Fetch the original message from the staff response channel
            if (!guild.applicationChannelId) {
                return interaction.reply({
                    content: 'Staff response channel not found. Please contact staff for help.',
                    ephemeral: true,
                });
            }
            const staffChannel = await interaction.guild.channels.fetch(guild.applicationChannelId);


            const confirmationMessageId = application.confirmationId;
            let staffMessage;
            if (confirmationMessageId) {
                try {
                    staffMessage = await staffChannel.messages.fetch(confirmationMessageId);
                    staffMessage.delete();
                } catch {
                    console.log('Original confirmation message not found.');
                }
            }


            existingChannel.delete();


            // Delete the application record from the database
            await application.destroy();

            // Notify the user
            await interaction.reply({
                content: 'Your application with type ' + applicationType + ' has been successfully canceled.',
                ephemeral: true,
            });


        } catch (error) {
            console.error('Error canceling application:', error);
            return await interaction.reply({
                content: 'An error occurred while attempting to cancel your application. Please try again or contact the staff.',
                ephemeral: true,
            });
        }
    },
};