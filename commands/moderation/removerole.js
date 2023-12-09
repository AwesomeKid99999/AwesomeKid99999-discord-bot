const { SlashCommandBuilder, PermissionsBitField, transformResolved } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('removerole')
		.setDescription('Remove a role to a member in the server. (STAFF ONLY)')
		.setDMPermission(false)
		.addUserOption(option => option.setName('target')
        	.setDescription('The user to remove the role to')
	        .setRequired(true))
		
		.addRoleOption(option => option.setName('role')
		.setDescription('The role to remove')
		.setRequired(true)),
		category: 'moderation',
		async execute(interaction) {
			
			
			let target =  interaction.options.getMember('target');
			const role = interaction.options.getRole('role') ?? 'No reason provided';
		
			await interaction.deferReply();

			if (!target) {
				target =	interaction.options.getUser('target');
				if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageRoles)) {
					return await interaction.editReply( ':x: You do not have permission to manage roles.');
					
				}
				 return await interaction.editReply(`You cannot remove roles from **${target.tag}** because they are not in the server.`);
				}
			if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageRoles)) {
				return await interaction.editReply(':x: You do not have permission to manage roles.');
				
			}
			

			

			const botMember = interaction.guild.members.cache.get(interaction.client.user.id);
			if (!botMember.permissions.has(PermissionsBitField.Flags.ManageRoles)) {
				return await interaction.editReply(':warning: I do not have permission to manage roles.');
				
			}
			const highestRole = botMember.roles.highest;
			
			const ownerPromise = interaction.guild.fetchOwner();
			const owner = await ownerPromise;

			if (interaction.member === owner) {
				if (role.comparePositionTo(highestRole) >= 0) {
				    return await interaction.editReply( `:warning: I cannot remove the role ${role} from **${target.user.tag}** because my role is not high enough.`);

				}  else if (!role.editable) {
					return await interaction.editReply(`:warning: You cannot remove the role ${role} from **${target.user.tag}** because it is not editable.`);
				} else {
					await target.roles.remove(role);
					return await interaction.editReply(`Successfully removed the role ${role} from **${target.user.tag}**`);
				}
			} else {
			 if (role.comparePositionTo(interaction.member.roles.highest) >= 0) {
				  return await interaction.editReply(`:warning: You cannot remove the role ${role} from **${target.user.tag}** because your role is not high enough.`);
				} else if (role.comparePositionTo(highestRole) >= 0) {
					return await interaction.editReply(`:warning: I cannot remove the role ${role} from **${target.user.tag}** because my role is not high enough.`);
				} else if (!role.editable) {
					return await interaction.editReply(`:warning: You cannot remove the role ${role} from **${target.user.tag}** because it is not editable.`);
				} else {
				
				await target.roles.remove(role);
				return await interaction.editReply(`Successfully removed the role ${role} from **${target.user.tag}**`);

				}
			}
	},
};