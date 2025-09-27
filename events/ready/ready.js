const { Events } = require('discord.js');
const {Application, Giveaway, XPIgnoredChannels, XPSettings, Guild} = require('../../models');
const { startGiveawayChecker } = require('./giveawayChecker');
const { Op } = require('sequelize');

module.exports = {
	name: Events.ClientReady,
	once: true,
	async execute(client) {
		console.log(`Ready! Logged in as ${client.user.tag}`);



		// Iterate through all guilds the bot is in
		for (const guild of client.guilds.cache.values()) {

			try {
				const applications = await Application.findAll({ where: { serverId: guild.id, status: 'pending', 
					channelId: {
					[Op.ne]: "SYSTEM" 
				  } } });

				for (const application of applications) {
					const channel = guild.channels.cache.get(application.channelId);

					if (!channel) {
						// If the channel does not exist, handle the orphaned application
						console.log(`Application for channel ${application.channelId} is orphaned. Cleaning up...`);

						const guild = await Guild.findOne({ where: { serverId: application.serverId } });
						if (!guild) {
						   return console.log(`Guild ${application.serverId} does not exist in the database`);
						}
						console.log(`Deleting application linked to channel: ${application.channelId}`);

                // Fetch the original message from the staff response channel
                if (!guild.applicationChannelId) {
                    console.log(`Application response channel has not been found for guild ${application.serverId}`);
                } else {
                    try {
                        const staffChannel = await client.guilds.cache.get(application.serverId).channels.fetch(guild.applicationChannelId);
                        const confirmationMessageId = application.confirmationId;
                        
                        if (confirmationMessageId) {
                            try {
                                const staffMessage = await staffChannel.messages.fetch(confirmationMessageId);
                                await staffMessage.delete();
                                console.log(`Deleted confirmation message ${confirmationMessageId} for orphaned application`);
                            } catch (error) {
                                console.log(`Could not delete confirmation message ${confirmationMessageId}:`, error.message);
                            }
                        }
                    } catch (error) {
                        console.log(`Could not fetch staff channel ${guild.applicationChannelId} for guild ${application.serverId}:`, error.message);
                    }
                }

			
			
						
						// Delete or update the application in the database
						await Application.destroy({ where: { id: application.id } }); // Or mark as 'deleted'
					}
				}
			} catch (error) {
				console.error(`Error while checking applications for guild ${guild.id}:`, error);
			}
			const xpSettings = await XPSettings.findOne({ where: { serverId: guild.id } });
				if (!xpSettings) {
					console.log(`XP settings not found for the server ${guild.name}.`);

				} else if (xpSettings.levelUpChannelId) {
					const levelUpChannel = guild.channels.cache.get(xpSettings.levelUpChannelId);
					if (!levelUpChannel) {
						console.error(`Level up channel ID ${xpSettings.levelUpChannelId} is orphaned. Cleaning up...`)
						await xpSettings.update({levelUpChannelId: null})
					}
				}


			try {
				const ignoredChannels = await XPIgnoredChannels.findAll({ where: { serverId: guild.id } });
				for (const ignoredChannel of ignoredChannels) {
					const channel = guild.channels.cache.get(ignoredChannel.channelId);

					if (!channel) {
						// If the channel does not exist, handle the orphaned ignored channel
						console.log(`Ignored XP channel ${ignoredChannel.channelId} is orphaned. Cleaning up...`);

						// Delete or update the ignored channel in the database
						await XPIgnoredChannels.destroy({ where: { channelId: ignoredChannel.channelId } }); // Or mark as 'deleted'

					}
				}
			} catch (error) {
				console.error(`Error while checking ignored XP channels for guild ${guild.id}:`, error);

			}

		}

		// Start the giveaway checker for handling long-duration giveaways
		startGiveawayChecker(client);

	},
};