const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('ping')
		.setDMPermission(false)
		.setDescription('Replies with Pong and the latency of the bot!'),
		category: 'utility',
	async execute(interaction) {
		const sent = await interaction.reply({ content: 'Pinging...', fetchReply: true });
		interaction.editReply(`:ping_pong: Pong!\n**Websocket (initial response): ${interaction.client.ws.ping}ms**\n**Roundtrip latency: ${sent.createdTimestamp - interaction.createdTimestamp}ms**`);

	},
};