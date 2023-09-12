const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('userinfo')
		.setDMPermission(false)
		.setDescription('Replies with user info!')
		.addUserOption(option => option.setName('target').setDescription('The user\'s avatar to show')),
		async execute(interaction) {
			const user = interaction.options.getUser('target');
			const member = interaction.options.getMember('target');


			
			 if (!user || user.id === interaction.user.id) {
				
			let timestamp_y = interaction.user.createdTimestamp;
			let timestamp_y2 = interaction.member.joinedTimestamp;
			let b = timestamp_y.toPrecision(10);
			let b2 = timestamp_y2.toPrecision(10);
				return interaction.reply(`**Your tag:** ${interaction.user.tag}\n**Your id:** ${interaction.user.id}\n**Account Creation Date:** <t:${b/1000}:F>, <t:${b/1000}:R>\n**Server Join Date:** <t:${b2/1000}:F>, <t:${b2/1000}:R>`);
			} else if (member) {
				let timestamp_z = user.createdTimestamp;
				let timestamp_z2 = member.joinedTimestamp;
				let c = timestamp_z.toPrecision(10);
				let c2 = timestamp_z2.toPrecision(10);
				return interaction.reply(`**Their tag:** ${user.tag}\n**Their id:** ${user.id}\n**Account Creation Date:** <t:${c/1000}:F>, <t:${c/1000}:R>\n**Server Join Date:** <t:${c2/1000}:F>, <t:${c2/1000}:R>`);
			} else {
				let timestamp_x = user.createdTimestamp;
				let a = timestamp_x.toPrecision(10);	
				return interaction.reply(`**Their tag:** ${user.tag}\n**Their id:** ${user.id}\n**Account Creation Date:** <t:${a/1000}:F>, <t:${a/1000}:R>`);
			} 
			
			
	
	},
};