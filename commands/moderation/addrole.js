const { SlashCommandBuilder, PermissionsBitField } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('addrole')
		.setDescription('Add a role to a member in the server. (STAFF ONLY)')
		.setDMPermission(false)
		.addUserOption(option => option.setName('target')
        	.setDescription('The user to add the role to')
	        .setRequired(true))
			
		.addRoleOption(option => option.setName('role')
		.setDescription('The role to add')
		.setRequired(true)),
		
		category: 'moderation',
		async execute(interaction) {
			
			
			 user =  interaction.options.getMember('target');
			const role = interaction.options.getRole('role');
		
			await interaction.deferReply();

			if (!user) {
				user =	interaction.options.getUser('target');
				if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageRoles)) {
					 await interaction.editReply( ':x: You do not have permission to manage roles.');
					
				}
				 return await interaction.editReply(`You cannot add roles to **${user.tag}** because they are not in the server.`);
				}
			if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageRoles)) {
				return interaction.editReply(':x: You do not have permission to manage roles.');
				
			}
			

			

			const botMember = interaction.guild.members.cache.get(interaction.client.user.id);
			const highestRole = botMember.roles.highest;
			
			
			 if (role.comparePositionTo(interaction.member.roles.highest) >= 0) {
				  interaction.editReply(`:warning: You cannot add the role ${role} to **${user.user.tag}** because your role is not high enough.`);
				  
		
				} else if (role.comparePositionTo(highestRole) >= 0) {
					await interaction.editReply( `:warning: I cannot add the role ${role} to **${user.user.tag}** because my role is not high enough.`);
					
				  }  else if (!role.editable) {
					return interaction.editReply(`:warning: You cannot add the role ${role} to **${user.user.tag}** because it is not editable.`);
				} else
			{
				
				await user.roles.add(role);
				return await interaction.editReply(`Successfully added the role ${role} to **${user.user.tag}**`);

			}
			

	},
};