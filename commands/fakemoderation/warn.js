const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('jokewarn')
		.setDescription('Warn a user (jokingly) in this server!')
		.addUserOption(option => option.setName('target').setDescription('The user to warn').setRequired(true))
		.setDMPermission(false)
        .addStringOption(option => option.setName('reason').setDescription('The reason for warning the user').setRequired(true)),
		category: 'fakemoderation',
		async execute(interaction) {
			const user = interaction.options.getUser('target');
			const value = interaction.options.getString('reason');
			return interaction.reply(`Warning logged for **${user.tag}** ||haha jk lol||\n**Reason:** ${value} ||this warning didn't count lol||\nhttps://tenor.com/view/discord-meme-spooked-scared-mod-gif-18361254`);
		
            
	},
};
        
	
