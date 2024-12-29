const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('hello')
		.setDMPermission(false)
		.setDescription('Hello Bob?'),
		category: 'fun',
	async execute(interaction) {
		interaction.reply("Hello World!");
	},
};