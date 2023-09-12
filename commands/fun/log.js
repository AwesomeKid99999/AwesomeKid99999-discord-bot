const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('log')
		.setDescription('Make me send a message to the console!')
		.setDMPermission(false)
		.addStringOption(option => option.setName('input').setDescription('The message to send to the console').setRequired(true)),
		category: 'fun',
	async execute(interaction) {
		const value = interaction.options.getString('input');

		if (value.length > 1912) {
			return await interaction.reply(`Please make your message shorter.`);
		 }

	
		console.log(`${interaction.user.tag} - ${value}`)
		return await interaction.reply(`**${interaction.user.tag}** sent a message to the console.\n**Message:** ${value}`);
	
	},
};