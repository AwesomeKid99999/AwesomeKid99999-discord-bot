require('dotenv').config();
const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('commands')
		.setDMPermission(false)
		.setDescription('Replies with my commands you can use!'),
	category: 'info',
	async execute(interaction) {
		const commandsUrl = process.env.COMMANDS_GUIDE_URL || `${process.env.GITHUB_REPOSITORY}/blob/main/docs/COMMANDS.md`;
		await interaction.reply(`**Commands Guide:** ${commandsUrl}\n\n**Categories:**\n• Application Commands\n• Leveling & XP\n• Role Management\n• Welcome/Leave Messages\n• Embeds\n• Moderation\n• Giveaways\n• Fun Commands\n• Information\n• Utility\n• Math & Conversions\n• Roblox\n\n*Tip: Type \`/\` to see all available slash commands!*`);
	},
};