const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('say')
		.setDescription('Make me say something!')
		.setDMPermission(false)
		.addStringOption(option => option.setName('input').setDescription('The input for me to say').setRequired(true))
		.addChannelOption(option => option.setName('channel').setDescription('Where I should send the message')),
		category: 'fun',
	async execute(interaction) {
		const value = interaction.options.getString('input');
		const channel = interaction.options.getChannel('channel');

		if (value.length > 1955) {
			return await interaction.reply(`Please make your message shorter.`);
		 }

		if (!channel || channel.id === interaction.channel.id ) {
			return interaction.reply(`${value}`);
		}
		
		channel.send(`**${interaction.user.tag}** - ${value}`);
		return interaction.reply(`Sent a message in ${channel}!`);
	
	},
};