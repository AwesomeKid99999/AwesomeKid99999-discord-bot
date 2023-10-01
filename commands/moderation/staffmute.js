const { SlashCommandBuilder, PermissionsBitField } = require('discord.js');
const Guild = require('../../models/guild')

module.exports = {
	data: new SlashCommandBuilder()
		.setName('modmute')
		.setDescription('Mute a member in the server. (STAFF ONLY)')
		.setDMPermission(false)
		.addUserOption(option => option.setName('target')
        	.setDescription('The user to mute')
	        .setRequired(true)),
			
		
		category: 'moderation',
		async execute(interaction) {
			
			
			user =  interaction.options.getMember('target');
			const guild = await Guild.findOne({ where: { id: await interaction.guild.id }})
			const role = await interaction.guild.roles.fetch(`${guild.muteRoleId}`);
			await interaction.deferReply();

			if (!user) {

				if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageRoles)) {
					 await interaction.editReply( ':x: You do not have permission to manage roles.');
					
				}
				 return await interaction.editReply(`You cannot mute **${user.tag}** because they are not in the server.`);
				}
			if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageRoles)) {
				return interaction.editReply(':x: You do not have permission to mute members.');
				
			}
			

			

			const botMember = interaction.guild.members.cache.get(interaction.client.user.id);
			const highestRole = botMember.roles.highest;
			
			
			 if (user.roles.highest.comparePositionTo(interaction.member.roles.highest) >= 0) {
				  interaction.editReply(`:warning: You cannot mute **${user.user.tag}** because your role is not high enough.`);
				  
		
				} else if (user.roles.highest.comparePositionTo(highestRole) >= 0) {
					await interaction.editReply( `:warning: I cannot mute **${user.user.tag}** because my role is not high enough.`);
					
				} else
			{
				
				await user.roles.add(role);
				return await interaction.editReply(`Successfully muted **${user.user.tag}**`);

			}
			

	},
};