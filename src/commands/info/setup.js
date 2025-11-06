require('dotenv').config();
const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('setup')
		.setDMPermission(false)
		.setDescription('View how to set me up!'),
	category: 'info',
	async execute(interaction) {
		const setupUrl = process.env.SETUP_GUIDE_URL || `${process.env.GITHUB_REPOSITORY}/blob/main/docs/SETUPGUIDE.md`;
		await interaction.reply(`**Setup Guide:** ${setupUrl}\n\n**What you can configure:**\n• XP & Leveling System\n• Welcome & Leave Messages\n• Custom Embeds\n• Role Management (Staff, Custom, Level Roles)\n• Application System\n• Giveaways\n• Moderation Settings\n• Message Logging\n\n*Follow the guide to get started with setting me up for your server!*`);
	},
};
