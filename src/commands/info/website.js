require('dotenv').config();
const { SlashCommandBuilder } = require('discord.js');



module.exports = {
	data: new SlashCommandBuilder()
		.setName('website')
		.setDMPermission(false)
		.setDescription("Replies with to the link to the owner's personal website!"),
	category: 'info',
	async execute(interaction) {
		const bot = await interaction.client.application.fetch();
		await interaction.reply(`**Owner ${bot.owner.tag}'s website:** ${process.env.OWNER_WEBSITE}`);
	},
};

