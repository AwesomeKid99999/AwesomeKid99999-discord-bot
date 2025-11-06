const { SlashCommandBuilder, PermissionsBitField } = require('discord.js');
const {Guild} = require('../../models/')

module.exports = {
	data: new SlashCommandBuilder()
		.setName('unmute')
		.setDescription('Unmute a member in the server. (STAFF ONLY)')
		.setDMPermission(false)
		.addUserOption(option => option.setName('target')
        	.setDescription('The user to unmute')
	        .setRequired(true)),
			
		
		category: 'moderation',
		async execute(interaction) {
			

			let target =  interaction.options.getMember('target');
			const guild = await Guild.findOne({ where: { serverId: await interaction.guild.id }});
			if (!guild) {
				console.log(`${interaction.guild.name} does not exist in the database`);
				return await  interaction.reply(`Please try to set a mute role first.`)
			}
			const role = await interaction.guild.roles.fetch(`${guild.muteRoleId}`);
			if (!role) {
				console.log(`${interaction.guild.name} does not have a muterole set`);
				return await interaction.reply(`:warning: There is no mute role set.`)
			}



			if (!target) {
				if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageRoles)) {
					return await interaction.reply( ':x: You do not have permission to unmute members.');
				}
				return await interaction.reply(`You cannot unmute **${target.tag}** because they are not in the server.`);
			}
			
			if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageRoles)) {
				return await interaction.reply(':x: You do not have permission to unmute members.');
			}

			if (!target.roles.cache.some(role => role.id === guild.muteRoleId)) return await interaction.reply(`:x: **${target.user.tag}** isn't muted.`);


			if (target.id === interaction.user.id) {
				return interaction.reply({ content: ':x: Sorry, you cannot unmute yourself.'});
			}



			const botMember = interaction.guild.members.cache.get(interaction.client.user.id);
			if (target === botMember) {
				return await interaction.reply('Who muted me in the first place? :sob:');
			}
			if (!botMember.permissions.has(PermissionsBitField.Flags.ManageRoles)) {
				return await interaction.reply(':warning: I do not have permission to unmute members.');
				
			}
			const highestRole = botMember.roles.highest;
			
			const ownerPromise = interaction.guild.fetchOwner();
			const owner = await ownerPromise;



			if (interaction.member === owner) {
				if (role.comparePositionTo(highestRole) >= 0) {
					return await interaction.reply( `:warning: I cannot unmute **${target.user.tag}** because my role is not high enough.`);
				} else {
					await target.roles.remove(role);
					return await interaction.reply(`Successfully unmuted **${target.user.tag}**`);
				}
			} else {
			 	if (target === owner || target.roles.highest.comparePositionTo(interaction.member.roles.highest) >= 0) {
					return await interaction.reply(`:warning: You cannot unmute **${target.user.tag}** because your role is not high enough.`);
				} else if (target.roles.highest.comparePositionTo(highestRole) >= 0) {
					return await interaction.reply( `:warning: I cannot unmute **${target.user.tag}** because my role is not high enough.`);
				} else {
				await target.roles.remove(role);
				return await interaction.reply(`Successfully unmuted **${target.user.tag}**`);
			}
		}	

	},
};