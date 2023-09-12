const { SlashCommandBuilder, PermissionsBitField } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('modunban')
		.setDMPermission(false)
		.setDescription('Unban a user from the server. (STAFF ONLY)')
		.addUserOption(option => option.setName('target')
        	.setDescription('The user to unban')
	        .setRequired(true))
			.setDMPermission(false)
		.addStringOption(option => option.setName('reason').setDescription('The reason for unbanning the user')),
		category: 'moderation',
		async execute(interaction) {
			const user = interaction.options.getUser('target');
			const userId = interaction.options.getUser('target').id;
			const bannedUsers = await interaction.guild.bans.fetch();
			const isBanned = bannedUsers.has(userId);
			
			const value = interaction.options.getString('reason') ?? 'No reason provided';
			await interaction.deferReply();

			if (!interaction.member.permissions.has(PermissionsBitField.Flags.BanMembers)) {
				return interaction.editReply({ content: ':x: You do not have permission to unban users.', ephemeral: true });
				
			}
			if (!isBanned) {
				await interaction.editReply(`User **${user.tag}** is not banned.`);
				return;
			}
			

			
			
				await interaction.guild.bans.remove(userId, {reason: `${value} - ${interaction.user.tag}`} );
				await interaction.editReply(`Successfully unbanned **${user.tag}**\n**Reason:** ${value}`);

			
			

	},
};