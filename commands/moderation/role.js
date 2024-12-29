const { SlashCommandBuilder, PermissionsBitField } = require('discord.js');
const Guild = require('../../models/guild')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('role')
        .setDescription('Do stuff with roles in the server. (STAFF ONLY)')
        .setDMPermission(false)
        .addSubcommand(subcommand => subcommand
            .setName('add')
            .setDescription('Add a role to a member in the server. (STAFF ONLY)')
            .addUserOption(option => option.setName('target')
                .setDescription('The user to add the role to')
                .setRequired(true))
            .addRoleOption(option => option.setName('role')
                .setDescription('The role to add')
                .setRequired(true)))
        .addSubcommand(subcommand => subcommand
            .setName('remove')
                .setDescription('Remove a role from a member in the server. (STAFF ONLY)')
                .addUserOption(option => option.setName('target')
                    .setDescription('The user to remove the role from')
                    .setRequired(true))
                .addRoleOption(option => option.setName('role')
                    .setDescription('The role to remove')
                    .setRequired(true)))
        .addSubcommand(subcommand => subcommand
            .setName('mute')
            .setDescription('Add, change, or remove the mute role in the server. (STAFF ONLY)')
            .addRoleOption(option => option
                .setName('role')
                .setDescription('The role to set'))),

    category: 'moderation',
    async execute(interaction) {
    
        if (interaction.options.getSubcommand() === 'add') {
            let target =  interaction.options.getMember('target');
            const role = interaction.options.getRole('role');
            
            if (!target) {
                target =	interaction.options.getUser('target');
                if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageRoles)) {
                    await interaction.reply( ':x: You do not have permission to manage roles.');

                }
                return await interaction.reply(`You cannot add roles to **${target.tag}** because they are not in the server.`);
            }
            if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageRoles)) {
                return interaction.reply(':x: You do not have permission to manage roles.');

            }




            const botMember = interaction.guild.members.cache.get(interaction.client.user.id);
            if (!botMember.permissions.has(PermissionsBitField.Flags.ManageRoles)) {
                return interaction.reply(':warning: I do not have permission to manage roles.');

            }



            const highestRole = botMember.roles.highest;

            const ownerPromise = interaction.guild.fetchOwner();
            const owner = await ownerPromise;

            if (interaction.member === owner) {
                if (role.comparePositionTo(highestRole) >= 0) {
                    await interaction.reply( `:warning: I cannot add the role ${role} to **${target.user.tag}** because my role is not high enough.`);

                }  else if (!role.editable) {
                    return interaction.reply(`:warning: You cannot add the role ${role} to **${target.user.tag}** because it is not editable.`);
                } else
                {

                    await target.roles.add(role);
                    return await interaction.reply(`Successfully added the role ${role} to **${target.user.tag}**`);

                }
            } else {
                if (role.comparePositionTo(interaction.member.roles.highest) >= 0) {
                    await interaction.reply(`:warning: You cannot add the role ${role} to **${target.user.tag}** because your role is not high enough.`);


                } else if (role.comparePositionTo(highestRole) >= 0) {
                    await interaction.reply( `:warning: I cannot add the role ${role} to **${target.user.tag}** because my role is not high enough.`);

                }  else if (!role.editable) {
                    return interaction.reply(`:warning: You cannot add the role ${role} to **${target.user.tag}** because it is not editable.`);
                } else
                {

                    await target.roles.add(role);
                    return await interaction.reply(`Successfully added the role ${role} to **${target.user.tag}**`);

                }
            }

        }


        if (interaction.options.getSubcommand() === 'remove') {

            let target =  interaction.options.getMember('target');
            const role = interaction.options.getRole('role');


            if (!target) {
                target =	interaction.options.getUser('target');
                if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageRoles)) {
                    return await interaction.reply( ':x: You do not have permission to manage roles.');

                }
                return await interaction.reply(`You cannot remove roles from **${target.tag}** because they are not in the server.`);
            }
            if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageRoles)) {
                return await interaction.reply(':x: You do not have permission to manage roles.');

            }




            const botMember = interaction.guild.members.cache.get(interaction.client.user.id);
            if (!botMember.permissions.has(PermissionsBitField.Flags.ManageRoles)) {
                return await interaction.reply(':warning: I do not have permission to manage roles.');

            }
            const highestRole = botMember.roles.highest;

            const ownerPromise = interaction.guild.fetchOwner();
            const owner = await ownerPromise;

            if (interaction.member === owner) {
                if (role.comparePositionTo(highestRole) >= 0) {
                    return await interaction.reply( `:warning: I cannot remove the role ${role} from **${target.user.tag}** because my role is not high enough.`);

                }  else if (!role.editable) {
                    return await interaction.reply(`:warning: You cannot remove the role ${role} from **${target.user.tag}** because it is not editable.`);
                } else {
                    await target.roles.remove(role);
                    return await interaction.reply(`Successfully removed the role ${role} from **${target.user.tag}**`);
                }
            } else {
                if (role.comparePositionTo(interaction.member.roles.highest) >= 0) {
                    return await interaction.reply(`:warning: You cannot remove the role ${role} from **${target.user.tag}** because your role is not high enough.`);
                } else if (role.comparePositionTo(highestRole) >= 0) {
                    return await interaction.reply(`:warning: I cannot remove the role ${role} from **${target.user.tag}** because my role is not high enough.`);
                } else if (!role.editable) {
                    return await interaction.reply(`:warning: You cannot remove the role ${role} from **${target.user.tag}** because it is not editable.`);
                } else {

                    await target.roles.remove(role);
                    return await interaction.reply(`Successfully removed the role ${role} from **${target.user.tag}**`);

                }
            }

        }

        if (interaction.options.getSubcommand() === 'mute') {
            const role = interaction.options.getRole('role');
            const [guild] = await Guild.findOrCreate({where: {id: await interaction.guild.id}});




            if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageRoles)) {
                return interaction.reply(':x: You do not have permission to manage roles.');

            }

            const botMember = interaction.guild.members.cache.get(interaction.client.user.id);
            if (!botMember.permissions.has(PermissionsBitField.Flags.ManageRoles)) {
                return interaction.reply(':warning: I do not have permission to manage roles.');

            }


            const highestRole = botMember.roles.highest;

            if (!role) {
                await guild.update({ muteRoleId: null });
                return await interaction.reply('Mute role has been set to **none**.');


            }  else if (role.comparePositionTo(highestRole) >= 0) {
                await interaction.reply( `:warning: I cannot set the mute role to **${role}** because my role is not high enough. (I cannot mute people with it later)`);
            }  else if (!role.editable) {
                return interaction.reply(`:warning: You cannot set the mute role to **${role}** because it is not editable.`);
            } else {
                await guild.update({ muteRoleId: role.id });
                return await interaction.reply(`Mute role has been set to **${role}**`);
            }

        }

    }
}