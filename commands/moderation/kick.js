const { SlashCommandBuilder, PermissionsBitField } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('kick')
		.setDMPermission(false)
		.setDescription('Kick a user from the server. (STAFF ONLY)')
		.addUserOption(option => option.setName('target')
        	.setDescription('The user to kick')
	        .setRequired(true))
			.setDMPermission(false)
		.addStringOption(option => option.setName('reason').setDescription('The reason for kicking the user')),
		category: 'moderation',
		async execute(interaction) {
			 user =  interaction.options.getMember('target');
			const value = interaction.options.getString('reason') ?? 'No reason provided';
			

			if (!user) {
				
				if (!interaction.member.permissions.has(PermissionsBitField.Flags.KickMembers)) {
					 await interaction.reply({ content: ':x: You do not have permission to kick members.', ephemeral: true });	
				}
				 return interaction.reply(`The user you're trying to kick isn't in the server.`);
				}
			if (!interaction.member.permissions.has(PermissionsBitField.Flags.KickMembers)) {
				return interaction.reply({ content: ':x: You do not have permission to kick members.', ephemeral: true });
				
			}

			if (user.id === interaction.user.id) {
				return interaction.reply({ content: ':warning: Please do not try to kick yourself.', ephemeral: true });
			}

			if (user.id === "872195259730386994") {
				return interaction.reply({ content: `Please don't kick me :sob:`, ephemeral: true })
			}

			const botMember = interaction.guild.members.cache.get(interaction.client.user.id);
			if (!botMember.permissions.has(PermissionsBitField.Flags.KickMembers)) {
				return interaction.reply(':warning: I do not have permission to kick members.');
				
			}			
			const highestRole = botMember.roles.highest;
			
			
			 if (user.roles.highest.comparePositionTo(interaction.member.roles.highest) >= 0) {
				  interaction.reply({content: ":warning: You don't have permission to kick this member because your role is not high enough.", ephemeral: true });
				  
		
				} else if (user.roles.highest.comparePositionTo(highestRole) >= 0) {
					await interaction.reply({content: ":warning: I don't have permission to kick this member because my role is not high enough.", ephemeral: true });
					
				  } else
			{
				
				
				user.send(`You were kicked from **${interaction.guild.name}** by **${interaction.user.tag}**.\n**Reason:** ${value}`).catch(async (err) => {
					console.log(err)
				 return await interaction.reply(`Successfully kicked **${user.user.tag}**\n**Reason:** ${value}\nI was unable to DM them`).catch((err) =>{
					 console.log(err)
				 })
})
				await interaction.guild.members.kick(user, {reason: `${value} - ${interaction.user.tag}`} );
				 await interaction.reply(`Successfully kicked **${user.user.tag}**\n**Reason:** ${value}`);

			}
			

	},
};