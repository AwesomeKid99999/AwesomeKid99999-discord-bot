const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('jokeban')
		.setDMPermission(false)
		.setDescription('Ban a user (jokingly) from this server!')
		.addUserOption(option => option.setName('target')
        	.setDescription('The user to ban')
	        .setRequired(true))
			
		.addStringOption(option => option.setName('reason').setDescription('The reason for banning the user')),
		category: 'fakemoderation',
		async execute(interaction) {
			const user = interaction.options.getUser('target');
			const value = interaction.options.getString('reason') ?? 'No reason provided';
            return await interaction.reply(`Successfully banned **${user.tag}** ||haha jk lol||\n**Reason:** ${value} ||this didn't really ban the user lol||\nhttps://tenor.com/view/bane-no-banned-and-you-are-explode-gif-16047504`);
                 
	
	},
};
