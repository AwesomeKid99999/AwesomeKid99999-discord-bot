const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('serverinfo')
		.setDMPermission(false)
		.setDescription('Replies with server info!'),
		category: 'utility',
	async execute(interaction) {
	
		
		const ownerPromise = interaction.guild.fetchOwner();
		const owner = await ownerPromise;
		let timestamp = interaction.guild.createdTimestamp;
				let a = timestamp.toPrecision(10);	
		await interaction.reply(`**Server name:** ${interaction.guild.name}\n**Total members:** ${interaction.guild.memberCount}\n**Owned by: **${(owner.user.tag)}**\nCreated at: **<t:${a/1000}:F>, <t:${a/1000}:R>`);
	},
};