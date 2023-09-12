const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('jokemute')
		.setDescription('Mute a user (jokingly) in this server!')
		.addUserOption(option => option.setName('target').setDescription('The user to mute').setRequired(true))
		.addStringOption(option => option.setName('reason').setDescription('The reason for muting the user'))
		.setDMPermission(false)
		.addIntegerOption(option => option.setName('length').setDescription('Number of minutes to mute the user')),
		
		category: 'fakemoderation',
		async execute(interaction) {
			const user = interaction.options.getUser('target');
			const value = interaction.options.getString('reason') ?? 'No reason provided';
			const length = interaction.options.getInteger('length')?? 'infinity';
			
				return await interaction.reply(`Successfully muted **${user.tag}** for **${length} minutes** ||haha jk lol||\n**Reason:** ${value} ||this didn't really mute the user lol||\nhttps://tenor.com/view/discord-mute-ancient-gods-doom-eternal-discord-mute-gif-21857683`);
			
	},
};
