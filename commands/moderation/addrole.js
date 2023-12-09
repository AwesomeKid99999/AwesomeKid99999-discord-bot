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
			
			
			let target =  interaction.options.getMember('target');
			const role = interaction.options.getRole('role');
		
			await interaction.deferReply();

			if (!target) {
				target =	interaction.options.getUser('target');
				if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageRoles)) {
					 await interaction.editReply( ':x: You do not have permission to manage roles.');
					
				}
				 return await interaction.editReply(`You cannot add roles to **${target.tag}** because they are not in the server.`);
				}
			if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageRoles)) {
				return interaction.editReply(':x: You do not have permission to manage roles.');
				
			}
			

			

			const botMember = interaction.guild.members.cache.get(interaction.client.user.id);
			if (!botMember.permissions.has(PermissionsBitField.Flags.ManageRoles)) {
				return interaction.editReply(':warning: I do not have permission to manage roles.');
				
			}



			const highestRole = botMember.roles.highest;

			const ownerPromise = interaction.guild.fetchOwner();
			const owner = await ownerPromise;

			if (interaction.member === owner) {
				if (role.comparePositionTo(highestRole) >= 0) {
					await interaction.editReply( `:warning: I cannot add the role ${role} to **${target.user.tag}** because my role is not high enough.`);

				}  else if (!role.editable) {
					return interaction.editReply(`:warning: You cannot add the role ${role} to **${target.user.tag}** because it is not editable.`);
				} else
				{

					await target.roles.add(role);
					return await interaction.editReply(`Successfully added the role ${role} to **${target.user.tag}**`);

				}
			} else {
				if (role.comparePositionTo(interaction.member.roles.highest) >= 0) {
					await interaction.editReply(`:warning: You cannot add the role ${role} to **${target.user.tag}** because your role is not high enough.`);


				} else if (role.comparePositionTo(highestRole) >= 0) {
					await interaction.editReply( `:warning: I cannot add the role ${role} to **${target.user.tag}** because my role is not high enough.`);

				}  else if (!role.editable) {
					return interaction.editReply(`:warning: You cannot add the role ${role} to **${target.user.tag}** because it is not editable.`);
				} else
				{

					await target.roles.add(role);
					return await interaction.editReply(`Successfully added the role ${role} to **${target.user.tag}**`);

				}
			}


			

	},
};