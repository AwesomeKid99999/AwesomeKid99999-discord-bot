const { Events } = require('discord.js');
const  Giveaway  = require('../../models/giveaway');
const { Op } = require('sequelize'); // Import Sequelize operators

module.exports = {
	name: Events.ClientReady,
	once: true,
	async execute(client) {
		console.log(`Ready! Logged in as ${client.user.tag}`);

		try {
			// Fetch active giveaways that haven't ended yet
			const activeGiveaways = await Giveaway.findAll({
				where: {
					endsAt: { [Op.gt]: new Date() }, // End time is in the future
				},
			});

			// If no active giveaways are found, log a message and return
			if (!activeGiveaways || activeGiveaways.length === 0) {
				console.log('No active giveaways found.');
				return;
			}

			// Iterate over active giveaways
			for (const giveaway of activeGiveaways) {
				const remainingTime = new Date(giveaway.endsAt) - Date.now();

				// Skip giveaways where the remaining time is less than or equal to 0 (edge case)
				if (remainingTime <= 0) {
					console.log(`Skipping giveaway ID ${giveaway.messageId} as it has already ended.`);
					continue;
				}

				// Schedule a setTimeout to pick winners when the giveaway ends
				setTimeout(async () => {
					try {
						const channel = await client.channels.fetch(giveaway.channelId);
						if (!channel) {
							console.error(`Channel with ID ${giveaway.channelId} not found.`);
							return;
						}

						const message = await channel.messages.fetch(giveaway.messageId);
						if (!message) {
							console.error(`Message with ID ${giveaway.messageId} not found.`);
							return;
						}

						const reaction = message.reactions.cache.get('🎉');
						if (!reaction) {
							channel.send(`No one entered the giveaway for **${giveaway.prize}**.`);
							return;
						}

						const endsAtDate = await new Date(giveaway.endsAt)
						const endsAt = Math.floor(endsAtDate.getTime() / 1000);


						// Fetch all users who reacted
						const users = await reaction.users.fetch();
						const validUsers = users.filter(user => !user.bot); // Exclude bots

						if (validUsers.size === 0) {
							channel.send(`No one entered the giveaway for **${giveaway.prize}**.`);
							return;
						}

						// Select random winners based on the winner count
						const winnerCount = giveaway.winnerCount || 1;
						const winnersArray = validUsers.random(winnerCount);

						// If only one winner
						if (!Array.isArray(winnersArray)) {
							channel.send(`🎉 Congratulations <@${winnersArray.id}>! You won **${giveaway.prize}**!`);
							message.edit(`🎉 **GIVEAWAY** 🎉\nPrize: **${giveaway.prize}**\nEnded: <t:${endsAt}:R>\nWinner: **<@${winnersArray.id}>**`)
						} else if (winnersArray.length > 0) {
							// If multiple winners are picked
							const winnerMentions = winnersArray.map(winner => `<@${winner.id}>`).join(', ');
							channel.send(`🎉 Congratulations ${winnerMentions}! You won **${giveaway.prize}**!`);
							message.edit(`🎉 **GIVEAWAY** 🎉\nPrize: **${giveaway.prize}**\nEnded: <t:${endsAt}:R>\nWinners: **${winnerMentions}**`)
						} else {
							// Not enough participants
							channel.send(`Not enough participants entered for **${giveaway.prize}**. Giveaway ended.`);
							message.edit(`🎉 **GIVEAWAY** 🎉\nPrize: **${giveaway.prize}**\nEnded: <t:${endsAt}:R>\nWinners: **None**`)
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