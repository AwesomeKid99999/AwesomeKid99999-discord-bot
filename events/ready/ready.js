const { Events } = require('discord.js');
const {Application, Giveaway, XPIgnoredChannels, XPSettings} = require('../../models')


module.exports = {
	name: Events.ClientReady,
	once: true,
	async execute(client) {
		console.log(`Ready! Logged in as ${client.user.tag}`);


		// Iterate through all guilds the bot is in
		for (const guild of client.guilds.cache.values()) {

			try {
				const applications = await Application.findAll({ where: { serverId: guild.id, status: 'pending' } });

				for (const application of applications) {
					const channel = guild.channels.cache.get(application.channelId);

					if (!channel) {
						// If the channel does not exist, handle the orphaned application
						console.log(`Application for channel ${application.channelId} is orphaned. Cleaning up...`);

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


		try {
			// Fetch active giveaways that haven't ended yet
			const activeGiveaways = await Giveaway.findAll({
				where: {
					active: true, // End time is in the future
				},
			});

			// If no active giveaways are found, log a message and return
			if (!activeGiveaways || activeGiveaways.length === 0) {
				console.log('No active giveaways found.');
				return;
			}

			// Iterate over active giveaways
			for (const giveaway of activeGiveaways) {

				const remainingTime = giveaway.endsAt - Date.now();



				// Schedule a setTimeout to pick winners when the giveaway ends
				setTimeout(async () => {
					try {
						const channel = await client.channels.fetch(giveaway.channelId).catch(() => null);
						if (!channel) {
							 console.error(`Channel with ID ${giveaway.channelId} not found. Marking giveaway as inactive.`);
							await giveaway.update({active: false});
							return;

						}

						const message = await channel.messages.fetch(giveaway.messageId).catch(() => null);
						if (!message) {
							 console.error(`Message with ID ${giveaway.messageId} not found. Marking as inactive.`);
							await giveaway.update({active: false});
							return;
						}

						const endsAt = await (giveaway.endsAt)





						const reaction = message.reactions.cache.get('🎉');

						if (!reaction) {
							channel.send(`No one entered the giveaway for **${giveaway.prize}**.`);
							message.edit(`🎉 **GIVEAWAY** 🎉\nPrize: **${giveaway.prize}**\nEnded: <t:${(endsAt/1000).toPrecision(10)}:R> (<t:${(endsAt/1000).toPrecision(10)}:F>)\nWinners: **None**`)
							await giveaway.update({active: false});
							return;
						}

						// Fetch all users who reacted
						const users = await reaction.users.fetch();

						// Filter bots
						const validUsers = users.filter(user =>
							(!user.bot)
						);

						if (validUsers.size === 0) {
							channel.send(`No one entered the giveaway for **${giveaway.prize}**.`);
							message.edit(`🎉 **GIVEAWAY** 🎉\nPrize: **${giveaway.prize}**\nEnded: <t:${(endsAt/1000).toPrecision(10)}:R> (<t:${(endsAt/1000).toPrecision(10)}:F>)\nWinners: **None**`)
							await giveaway.update({active: false});
							return;
						}



						// Select random winners based on the winner count
						const winnerCount = giveaway.winnerCount || 1;
						const winnersArray = validUsers.random(winnerCount);

						// If only one winner
						if (!Array.isArray(winnersArray)) {
							channel.send(`🎉 Congratulations <@${winnersArray.id}>! You won **${giveaway.prize}**!`);
							message.edit(`🎉 **GIVEAWAY** 🎉\nPrize: **${giveaway.prize}**\nEnded: <t:${(endsAt/1000).toPrecision(10)}:R> (<t:${(endsAt/1000).toPrecision(10)}:F>)\nWinner: **<@${winnersArray.id}>**`)
							await giveaway.update({active: false});
						} else if (winnersArray.length > 0) {
							// If multiple winners are picked
							const winnerMentions = winnersArray.map(winner => `<@${winner.id}>`).join(', ');
							channel.send(`🎉 Congratulations ${winnerMentions}! You won **${giveaway.prize}**!`);
							message.edit(`🎉 **GIVEAWAY** 🎉\nPrize: **${giveaway.prize}**\nEnded: <t:${(endsAt/1000).toPrecision(10)}:R> (<t:${(endsAt/1000).toPrecision(10)}:F>)\nWinners: **${winnerMentions}**`)
							await giveaway.update({active: false});
						} else {
							// Not enough participants
							channel.send(`Not enough participants entered for **${giveaway.prize}**. Giveaway ended.`);
							message.edit(`🎉 **GIVEAWAY** 🎉\nPrize: **${giveaway.prize}**\nEnded: <t:${(endsAt/1000).toPrecision(10)}:R> (<t:${(endsAt/1000).toPrecision(10)}:F>)\nWinners: **None**`)
							await giveaway.update({active: false});
						}
					} catch (error) {
						console.error(`Error handling giveaway ID ${giveaway.messageId}:`, error);
					}
				}, remainingTime);
			}
		} catch (error) {
			console.error('Error fetching active giveaways:', error);
		}




	},
};