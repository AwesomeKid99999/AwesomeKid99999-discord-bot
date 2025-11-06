const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('time')
		.setDMPermission(false)
		.setDescription('Get your local time with me!'),
		async execute(interaction) {
			let timestamp = interaction.createdTimestamp;
			let n = timestamp.toPrecision(10);
			return interaction.reply(`The time is: <t:${n/1000}:T>`);
	
	},
};