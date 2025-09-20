const { Events } = require('discord.js');
const {Application, XPIgnoredChannels, XPSettings, Guild} = require('../../models')


module.exports = {
    name: Events.ChannelDelete,
    async execute(channel) {

        console.log(`#${channel.name} at ${channel.guild.name} has been deleted `)
        const ignoredChannel = await XPIgnoredChannels.findOne({ where: { channelId: channel.id } });
        if (ignoredChannel) await ignoredChannel.destroy();

        const levelUpChannel = await XPSettings.findOne({ where: { serverId: channel.guild.id, levelUpChannelId: channel.id } });
        if (levelUpChannel) await levelUpChannel.update({levelUpChannelId: null});


        try {
            // Check if the deleted channel corresponds to an application
            const guild = await Guild.findOne({ where: { serverId: channel.guild.id } });
            if (!guild) {
               return console.log(`${interaction.guild.name} does not exist in the database`);
            }
            const application = await Application.findOne({ where: { channelId: channel.id } });

            if (!application) return;

            if (application.status === 'denied' || application.status === 'accepted') {
                console.log(`Application found for channel: ${channel.id} but has been accepted/denied. Skipping...`);
            } else if (application.status === 'pending') {
                console.log(`Deleting application linked to channel: ${channel.id}`);

                // Fetch the original message from the staff response channel
                if (!guild.applicationChannelId) {
                    return console.log(`Application response channel has not been found`);
                }
                const staffChannel = await channel.guild.channels.fetch(guild.applicationChannelId);


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

                // Delete the application record from the database
                await application.destroy();

                console.log(`Application for user ${application.userId} in server ${application.serverId} has been deleted from the database.`);
            } else {
                console.log(`No application found for channel: ${channel.id}`);
            }
        } catch (error) {
            console.error('Error while deleting application from database:', error);
        }



    },
};