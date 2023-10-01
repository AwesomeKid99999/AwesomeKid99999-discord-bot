const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('jokemute')
		.setDescription('Mute a user (jokingly) in this server!')
		.addUserOption(option => option.setName('target')
			.setDescription('The user to mute')
			.setRequired(true))
		.addStringOption(option => option.setName('reason')
			.setDescription('The reason for muting the user'))
		.setDMPermission(false)
		.addIntegerOption(option => option.setName('days')
			.setDescription('Number of days to mute the user'))
		.addIntegerOption(option => option.setName('hours')
			.setDescription('Number of hours to mute the user'))
		.addIntegerOption(option => option.setName('minutes')
			.setDescription('Number of hours to mute the user'))
		.addIntegerOption(option => option.setName('seconds')
			.setDescription('Number of seconds to mute the user')),
		
		category: 'fakemoderation',
		async execute(interaction) {
			const user = interaction.options.getUser('target');
			const value = interaction.options.getString('reason') ?? 'No reason provided';
			
			

			days = interaction.options.getInteger('days');
			hours = interaction.options.getInteger('hours');
			minutes = interaction.options.getInteger('minutes');
			seconds = interaction.options.getInteger('seconds');

			await interaction.deferReply();

			if (days < 0) {
				Math.abs(days);
			}

			if (hours < 0) {
				Math.abs(hours);
			}

			if (minutes < 0) {
				Math.abs(minutes);
			}

			if (seconds < 0) {
				Math.abs(seconds);
			}

			while (seconds > 60) {
				minutes += 1;
				seconds -= 60;
			}

			while (minutes > 60) {
				hours += 1;
				minutes -= 60;
			}

			while (hours > 24) {
				days += 1;
				hours -= 24;
			}
			

			if (!days && !hours && !minutes && !seconds) {
				// indefinitely
				return await interaction.editReply(`Successfully muted **${user.tag} indefinitely** ||haha jk lol||\n**Reason:** ${value} ||this didn't really mute the user lol||\nhttps://tenor.com/view/discord-mute-ancient-gods-doom-eternal-discord-mute-gif-21857683`);
			
			
			} else if (!days && !hours && !minutes) {
				// seconds only
				return await interaction.editReply(`Successfully muted **${user.tag}** for **${seconds} seconds** ||haha jk lol||\n**Reason:** ${value} ||this didn't really mute the user lol||\nhttps://tenor.com/view/discord-mute-ancient-gods-doom-eternal-discord-mute-gif-21857683`);
			} else if (!days && !hours && !seconds) {
				// minutes only
				return await interaction.editReply(`Successfully muted **${user.tag}** for **${minutes} minutes** ||haha jk lol||\n**Reason:** ${value} ||this didn't really mute the user lol||\nhttps://tenor.com/view/discord-mute-ancient-gods-doom-eternal-discord-mute-gif-21857683`);
			} else if (!days && !minutes && !seconds) {
				// hours only
				return await interaction.editReply(`Successfully muted **${user.tag}** for **${hours} hours** ||haha jk lol||\n**Reason:** ${value} ||this didn't really mute the user lol||\nhttps://tenor.com/view/discord-mute-ancient-gods-doom-eternal-discord-mute-gif-21857683`);
			} else if (!hours && !minutes && !seconds) {
				// days only
				return await interaction.editReply(`Successfully muted **${user.tag}** for **${days} days** ||haha jk lol||\n**Reason:** ${value} ||this didn't really mute the user lol||\nhttps://tenor.com/view/discord-mute-ancient-gods-doom-eternal-discord-mute-gif-21857683`);
			
			
			} else if (!days && !hours) {
				// minutes and seconds
				return await interaction.editReply(`Successfully muted **${user.tag}** for **${minutes} minutes** and **${seconds} seconds** ||haha jk lol||\n**Reason:** ${value} ||this didn't really mute the user lol||\nhttps://tenor.com/view/discord-mute-ancient-gods-doom-eternal-discord-mute-gif-21857683`);
			} else if (!days && !minutes) {
				// hours and seconds
				return await interaction.editReply(`Successfully muted **${user.tag}** for **${hours} hours** and **${seconds} seconds** ||haha jk lol||\n**Reason:** ${value} ||this didn't really mute the user lol||\nhttps://tenor.com/view/discord-mute-ancient-gods-doom-eternal-discord-mute-gif-21857683`);
			} else if (!hours && !minutes) {
				// days and seconds
				return await interaction.editReply(`Successfully muted **${user.tag}** for **${days} days** and **${seconds} seconds** ||haha jk lol||\n**Reason:** ${value} ||this didn't really mute the user lol||\nhttps://tenor.com/view/discord-mute-ancient-gods-doom-eternal-discord-mute-gif-21857683`);
			
			} else if (!days && !seconds) {
				// hours and minutes
				return await interaction.editReply(`Successfully muted **${user.tag}** for **${hours} hours** and **${minutes} minutes** ||haha jk lol||\n**Reason:** ${value} ||this didn't really mute the user lol||\nhttps://tenor.com/view/discord-mute-ancient-gods-doom-eternal-discord-mute-gif-21857683`);
			} else if (!hours && !seconds) {
				// days and minutes
				return await interaction.editReply(`Successfully muted **${user.tag}** for **${days} days** and **${minutes} minutes** ||haha jk lol||\n**Reason:** ${value} ||this didn't really mute the user lol||\nhttps://tenor.com/view/discord-mute-ancient-gods-doom-eternal-discord-mute-gif-21857683`);
			
			} else if (!seconds && !minutes) {
				// days and hours
				return await interaction.editReply(`Successfully muted **${user.tag}** for **${days} days** and **${hours} hours** ||haha jk lol||\n**Reason:** ${value} ||this didn't really mute the user lol||\nhttps://tenor.com/view/discord-mute-ancient-gods-doom-eternal-discord-mute-gif-21857683`);
			
			
			} else if (!days) {
				// hours, minutes and seconds
				return await interaction.editReply(`Successfully muted **${user.tag}** for **${hours} hours**, **${minutes} minutes**, and **${seconds} seconds** ||haha jk lol||\n**Reason:** ${value} ||this didn't really mute the user lol||\nhttps://tenor.com/view/discord-mute-ancient-gods-doom-eternal-discord-mute-gif-21857683`);
			} else if (!hours) {
				// days, minutes and seconds
				return await interaction.editReply(`Successfully muted **${user.tag}** for **${days} days**, **${minutes} minutes**, and **${seconds} seconds** ||haha jk lol||\n**Reason:** ${value} ||this didn't really mute the user lol||\nhttps://tenor.com/view/discord-mute-ancient-gods-doom-eternal-discord-mute-gif-21857683`);
			} else if (!minutes) {
				// hours, hours and seconds
				return await interaction.editReply(`Successfully muted **${user.tag}** for **${days} days**, **${hours} hours**, and **${seconds} seconds** ||haha jk lol||\n**Reason:** ${value} ||this didn't really mute the user lol||\nhttps://tenor.com/view/discord-mute-ancient-gods-doom-eternal-discord-mute-gif-21857683`);
			} else if (!seconds) {
				// hours, minutes and days
				return await interaction.editReply(`Successfully muted **${user.tag}** for **${days} days**, **${hours} hours**, and **${minutes} minutes** ||haha jk lol||\n**Reason:** ${value} ||this didn't really mute the user lol||\nhttps://tenor.com/view/discord-mute-ancient-gods-doom-eternal-discord-mute-gif-21857683`);
			} 
			return await interaction.editReply(`Successfully muted **${user.tag}** for **${days} days**, **${hours} hours**, **${minutes} minutes**, and **${seconds} seconds** ||haha jk lol||\n**Reason:** ${value} ||this didn't really mute the user lol||\nhttps://tenor.com/view/discord-mute-ancient-gods-doom-eternal-discord-mute-gif-21857683`);
			
	},
};
