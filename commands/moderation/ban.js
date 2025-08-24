const { SlashCommandBuilder, PermissionsBitField } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('ban')
		.setDMPermission(false)
		.setDescription('Ban a user from the server. (STAFF ONLY)')
		.addUserOption(option => option.setName('target')
        	.setDescription('The user to ban')
	        .setRequired(true))
		
		.addStringOption(option => option.setName('reason').setDescription('The reason for banning the user')),
		category: 'moderation',
		async execute(interaction) {
			let target =  interaction.options.getMember('target');
			const value = interaction.options.getString('reason') ?? 'No reason provided';


			if (!target) {
				target =	interaction.options.getUser('target');
				if (!interaction.member.permissions.has(PermissionsBitField.Flags.BanMembers)) {
					 await interaction.reply(':x: You do not have permission to ban users.');
					
				}
				await interaction.guild.bans.create(target, {reason: `${value} - ${interaction.user.tag}`} );
				 return await interaction.reply(`Successfully banned **${target.tag}**\n**Reason:** ${value}`);
				}
			if (!interaction.member.permissions.has(PermissionsBitField.Flags.BanMembers)) {
				return interaction.reply(':x: You do not have permission to ban users.');
				
			}

			if (target.id === interaction.user.id) {
				return interaction.reply(':warning: Please do not try to ban yourself.');
			}



			const botMember = interaction.guild.members.cache.get(interaction.client.user.id);
			if (target === botMember) {
				return await interaction.reply('Please don\'t ban me :sob:');
			}

			if (!interaction.client.member.permissions.has(PermissionsBitField.Flags.BanMembers)) {
				return interaction.reply(':warning: I do not have permission to ban users.');
				
			}			
			const highestRole = botMember.roles.highest;
			const ownerPromise = interaction.guild.fetchOwner();
			const owner = await ownerPromise;


			if (interaction.member === owner) {
				if (target.roles.highest.comparePositionTo(highestRole) >= 0) {
					await interaction.reply({
						content: ":warning: I don't have permission to ban this member because my role is not high enough.",
						ephemeral: true
					});

				} else {
					if (!target.user.bot) {
						target.send(`You were banned from **${interaction.guild.name}** by **${interaction.user.tag}**.\n**Reason:** ${value}`).catch(async (err) => {
							console.log(err)
							return await interaction.reply(`Successfully banned **${target.user.tag}**\n**Reason:** ${value}\nI was unable to DM them.`).catch((err) => {
								console.log(err)
							})
						})
					}

					await interaction.guild.members.ban(target, {reason: `${value} - ${interaction.user.tag}`});
					await interaction.reply(`Successfully banned **${user.user.tag}**\n**Reason:** ${value}`);
				}
			} else if (target === owner || target.roles.highest.comparePositionTo(interaction.member.roles.highest) >= 0) {
				  interaction.reply(":warning: You don't have permission to ban this member because your role is not high enough.");
				  
		
				} else if (target.roles.highest.comparePositionTo(highestRole) >= 0) {
					await interaction.reply(":warning: I don't have permission to ban this member because my role is not high enough.");
					
				  } else {

				if (!target.user.bot) {
					target.send(`You were banned from **${interaction.guild.name}** by **${interaction.user.tag}**.\n**Reason:** ${value}`).catch(async (err) => {
						console.log(err)
						return await interaction.reply(`Successfully banned **${user.user.tag}**\n**Reason:** ${value}\nI was unable to DM them`).catch((err) =>{
							console.log(err)
						})
					})
				}

				await interaction.guild.members.ban(target, {reason: `${value} - ${interaction.user.tag}`} );
				 await interaction.reply(`Successfully banned **${target.user.tag}**\n**Reason:** ${value}`);

			}
			

	},
};