const { SlashCommandBuilder } = require('discord.js');
module.exports = {
	data: new SlashCommandBuilder()
		.setName('jokekick')
		.setDMPermission(false)

		.setDescription('Kick a user (jokingly) from this server, even if they are not here!')
		.addUserOption(option => option.setName('target')
			.setDescription('The user to kick')
			.setRequired(true))
		.addStringOption(option => option.setName('reason').setDescription('The reason for kicking the user')),
		category: 'fakemoderation',
		async execute(interaction) {
			const user = interaction.options.getUser('target');
			const value = interaction.options.getString('reason') ?? 'No reason provided';
			
            
            return await interaction.reply(`Successfully kicked **${user.tag}** ||haha jk lol||\n**Reason:** ${value} ||this didn't really kick the user lol||\nhttps://tenor.com/view/discord-server-kick-gif-25044735`);
			
	
	},
};
