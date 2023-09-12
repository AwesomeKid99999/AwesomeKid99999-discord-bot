const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('website')
		.setDMPermission(false)
		.setDescription("Replies with to the link to the owner's personal website!"),
	async execute(interaction) {
		await interaction.reply(`**Awesome's website:** https://awesomekid99999.carrd.co`);
	},
};