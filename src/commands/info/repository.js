require('dotenv').config();
const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('repository')
		.setDMPermission(false)
		.setDescription("View my source code!"),
	category: 'info',
	async execute(interaction) {
		await interaction.reply(`**GitHub Repository:** ${process.env.GITHUB_REPOSITORY}`);
	},
};