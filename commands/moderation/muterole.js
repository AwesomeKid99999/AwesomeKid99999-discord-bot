const { SlashCommandBuilder, PermissionsBitField } = require('discord.js');
const Guild = require('../../models/guild')

module.exports = {
	data: new SlashCommandBuilder()
		.setName('muterole')
		.setDescription('Add, change, or remove the mute role in the server. (STAFF ONLY)')
		.setDMPermission(false)
			
		.addRoleOption(option => option.setName('role')
		.setDescription('The role to set')),
		
		category: 'moderation',
		async execute(interaction) {
			const role = interaction.options.getRole('role');
			const [guild] = await Guild.findOrCreate({where: {id: await interaction.guild.id}});
		
			await interaction.deferReply();

			
				
			if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageRoles)) {
				return interaction.editReply(':x: You do not have permission to manage roles.');
				
			}

			const botMember = interaction.guild.members.cache.get(interaction.client.user.id);
			const highestRole = botMember.roles.highest;

			if (!role) {
				await guild.update({ muteRoleId: null });
				return await interaction.editReply('Mute role has been set to **none**.');

			
			}  else if (role.comparePositionTo(highestRole) >= 0) {
				await interaction.editReply( `:warning: I cannot set the mute role to **${role}** because my role is not high enough. (I cannot mute people with it later)`);
				}  else if (!role.editable) {
				return interaction.editReply(`:warning: You cannot set the mute role to **${role}** because it is not editable.`);
			} else {
				await guild.update({ muteRoleId: role.id });
				return await interaction.editReply(`Mute role has been set to **${role}**`);
			}
			

	},
};