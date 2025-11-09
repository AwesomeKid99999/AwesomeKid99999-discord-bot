const { Events,  ActivityType } = require('discord.js');
const {Application, Giveaway, XPIgnoredChannels, XPSettings, Guild} = require('../../models');
const { startGiveawayChecker } = require('./giveawayChecker');
const { Op } = require('sequelize');

module.exports = {
	name: Events.ClientReady,
	once: true,
	async execute(client) {
		console.log(`Ready! Logged in as ${client.user.tag}`);


		// Set the bot's status and activity to show help hint and server count
		try {
			const pkg = require('../../../package.json');
			const version = pkg?.version ? `v${pkg.version}` : '';
			
			// Helper function to format uptime
			const formatUptime = (uptimeMs) => {
				const totalSeconds = Math.floor(uptimeMs / 1000);
				const days = Math.floor(totalSeconds / 86400);
				const hours = Math.floor((totalSeconds % 86400) / 3600);
				const minutes = Math.floor((totalSeconds % 3600) / 60);
				
				const parts = [];
				if (days > 0) parts.push(`${days}d`);
				if (hours > 0) parts.push(`${hours}h`);
				if (minutes > 0 || parts.length === 0) parts.push(`${minutes}m`);
				return parts.join(' ');
			};
			
			const guildCount = client.guilds?.cache?.size ?? 0;
			const uptime = formatUptime(client.uptime ?? 0);
			const activityText = `Hello World! • /help • in ${guildCount} server${guildCount === 1 ? '' : 's'} • uptime: ${uptime}${version ? ` • ${version}` : ''}`;
			client.user.setPresence({
				activities: [{ name: activityText, type: ActivityType.Watching }],
				status: 'online', // can be 'online', 'idle', 'dnd', or 'invisible'
			});

			// Periodic refresh every 5 minutes (300_000 ms)
			let lastActivity = activityText;
			const FIVE_MINUTES = 300_000;
			setInterval(() => {
				try {
					const currentGuildCount = client.guilds?.cache?.size ?? 0;
					const currentUptime = formatUptime(client.uptime ?? 0);
					const updatedText = `Hello World! • /help • ${currentGuildCount} server${currentGuildCount === 1 ? '' : 's'} • ${currentUptime}${version ? ` • ${version}` : ''}`;
					// Only update if it actually changed to avoid unnecessary presence edits
					if (updatedText !== lastActivity) {
						client.user.setPresence({
							activities: [{ name: updatedText, type: ActivityType.Watching }],
							status: 'online'
						});
						lastActivity = updatedText;
					}
				} catch (err) {
					console.warn('Periodic presence update failed:', err.message);
				}
			}, FIVE_MINUTES);
		} catch (e) {
			// Fallback if package.json cannot be read for any reason
			const formatUptime = (uptimeMs) => {
				const totalSeconds = Math.floor(uptimeMs / 1000);
				const days = Math.floor(totalSeconds / 86400);
				const hours = Math.floor((totalSeconds % 86400) / 3600);
				const minutes = Math.floor((totalSeconds % 3600) / 60);
				
				const parts = [];
				if (days > 0) parts.push(`${days}d`);
				if (hours > 0) parts.push(`${hours}h`);
				if (minutes > 0 || parts.length === 0) parts.push(`${minutes}m`);
				return parts.join(' ');
			};
			
			const guildCount = client.guilds?.cache?.size ?? 0;
			const uptime = formatUptime(client.uptime ?? 0);
			client.user.setPresence({
				activities: [{ name: `Hello World! • /help • ${guildCount} server${guildCount === 1 ? '' : 's'} • ${uptime}` , type: ActivityType.Watching }],
				status: 'online',
			});

			// Still set up periodic refresh in fallback (version omitted)
			let lastActivity = `Hello World! • /help • ${guildCount} server${guildCount === 1 ? '' : 's'} • ${uptime}`;
			const TEN_MINUTES = 600_000;
			setInterval(() => {
				try {
					const currentGuildCount = client.guilds?.cache?.size ?? 0;
					const currentUptime = formatUptime(client.uptime ?? 0);
					const updatedText = `Hello World! • /help • ${currentGuildCount} server${currentGuildCount === 1 ? '' : 's'} • ${currentUptime}`;
					if (updatedText !== lastActivity) {
						client.user.setPresence({
							activities: [{ name: updatedText, type: ActivityType.Watching }],
							status: 'online'
						});
						lastActivity = updatedText;
					}
				} catch (err) {
					console.warn('Periodic presence update (fallback) failed:', err.message);
				}
			}, TEN_MINUTES);
		}		// Iterate through all guilds the bot is in
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