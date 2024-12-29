const { SlashCommandBuilder, PermissionsBitField } = require('discord.js');
const Guild = require('../../models/guild')

module.exports = {
	data: new SlashCommandBuilder()
		.setName('chatgpttoggle')
		.setDescription('Enable or disable ChatGPT functionality in the server. (STAFF ONLY)')
		.setDMPermission(false)
		.addBooleanOption(option => option
			.setName('enabled')
			.setDescription('Whether or not to enable ChatGPT functionality')),
		category: 'moderation',
		async execute(interaction) {
			const enable = interaction.options.getBoolean('enabled');
			const [guild] = await Guild.findOrCreate({where: {id: await interaction.guild.id}});
		
			await interaction.deferReply();

			
				
			if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageServer)) {
				return interaction.editReply(':x: You do not have permission to manage the server.');
				
			}

			

			if (!enable) {
				await guild.update({ chatgptToggle: false });
				console.log(`ChatGPT disabled in ${interaction.guild}`);
				return await interaction.editReply('ChatGPT functionality **disabled**.');

			
			
			} else {
				await guild.update({ chatgptToggle: true });
				console.log(`ChatGPT enabled in ${interaction.guild}`);
				return await interaction.editReply(`ChatGPT functionality **enabled**.`);

			}
			

	},
};