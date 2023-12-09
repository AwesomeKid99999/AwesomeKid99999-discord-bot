const { SlashCommandBuilder, PermissionsBitField } = require('discord.js');
const Guild = require('../../models/guild')

module.exports = {
	data: new SlashCommandBuilder()
		.setName('welcomechannel')
		.setDescription('Add, change, or remove the welcome channel in the server. (STAFF ONLY)')
		.setDMPermission(false)
		.addChannelOption(option => option
			.setName('channel')
			.setDescription('The channel to set')),
		
		category: 'moderation',
		async execute(interaction) {
			const channel = interaction.options.getChannel('channel');
			const [guild] = await Guild.findOrCreate({where: {id: await interaction.guild.id}});
		
			await interaction.deferReply();

			
				
			if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageChannels)) {
				return interaction.editReply(':x: You do not have permission to manage channels.');
				
			}

            const botMember = interaction.guild.members.cache.get(interaction.client.user.id);
			if (!botMember.permissions.has(PermissionsBitField.Flags.ManageChannels)) {
				return interaction.editReply(':warning: I do not have permission to manage channels.');
				
			}
			

			if (!channel) {
				await guild.update({ welcomeChannelId: null });
				return await interaction.editReply('Welcome channel has been set to **none**.');

			
			
			} else {
				await guild.update({ welcomeChannelId: channel.id });
				return await interaction.editReply(`Welcome channel has been set to **${channel}**`);
			}
			

	},
};