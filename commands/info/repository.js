const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('repository')
		.setDMPermission(false)
		.setDescription("View the source code of this bot!"),
	async execute(interaction) {
		await interaction.reply(`**GitHub Repository:** https://github.com/AwesomeKid99999/AwesomeKid99999-discord-bot`);
	},
};