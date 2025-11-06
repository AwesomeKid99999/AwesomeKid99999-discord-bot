const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('beep')
		.setDMPermission(false)
		.setDescription('Replies with "Boop"!'),
		category: 'fun',
	async execute(interaction) {
		// // check if Sonia executed the interaction
		// if (interaction.user.id === "967548658243498015") {
		// 	interaction.reply('OMG ITS SONIA');
		// } else {
			interaction.reply('Boop!');
		// }
		
	},


};