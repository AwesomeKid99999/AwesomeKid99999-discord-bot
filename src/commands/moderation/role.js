const { SlashCommandBuilder, PermissionsBitField } = require('discord.js');
const { Guild, StaffRoles, CustomRoles, LevelRoles } = require('../../models');

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
            .setName('create')
            .setDescription('Create a (normal) role in the server. (STAFF ONLY)')
            .addStringOption(option => option
                .setName('name')
                .setDescription('The name of the role to create')
                .setMaxLength(100)
                .setRequired(true))
            .addStringOption(option => option
                .setName('color')
                .setDescription('The color of the new role (hex code, e.g., #ff0000)')
                .setRequired(false))
            .addBooleanOption(option => option
                .setName('hoisted')
                .setDescription('Whether the role should be displayed separately in the member list')
                .setRequired(false)))
        .addSubcommand(subcommand => subcommand
            .setName('delete')
            .setDescription('Delete a (normal) role in the server. (STAFF ONLY)')
            .addRoleOption(option => option
                .setName('role')
                .setDescription('The role to delete')
                .setRequired(true)))
        .addSubcommand(subcommand => subcommand
            .setName('mute')
            .setDescription('Add, change, or remove the mute role in the server. (STAFF ONLY)')
            .addRoleOption(option => option
                .setName('role')
                .setDescription('The role to set')))
        .addSubcommandGroup(subcommandGroup => subcommandGroup
            .setName('custom')
            .setDescription('Manage custom roles in the server. (STAFF ONLY)')
            .addSubcommand(subcommand => subcommand
                .setName('create')
                .setDescription('Create a custom role in the database for this server. (STAFF ONLY)')
                .addRoleOption(option => option.setName('role')
                    .setDescription('The custom role to add to the database')
                    .setRequired(true)))
            .addSubcommand(subcommand => subcommand
                .setName('delete')
                .setDescription('Delete a custom role in the database for this server. (STAFF ONLY)')
                .addRoleOption(option => option.setName('role')
                    .setDescription('The custom role to remove in the database')
                    .setRequired(true)))
            .addSubcommand(subcommand => subcommand
                .setName('list')
                .setDescription('List the custom roles for this server.'))
            .addSubcommand(subcommand => subcommand
                .setName('add')
                .setDescription('Add a custom role to a member in the server. (STAFF ONLY)')
                .addUserOption(option => option.setName('target')
                    .setDescription('The user to add the custom role to')
                    .setRequired(true))
                .addRoleOption(option => option.setName('role')
                    .setDescription('The custom role to add')
                    .setRequired(true)))
            .addSubcommand(subcommand => subcommand
                .setName('remove')
                .setDescription('Remove a custom role from a member in the server. (STAFF ONLY)')
                .addUserOption(option => option.setName('target')
                    .setDescription('The user to remove the custom role from')
                    .setRequired(true))
                .addRoleOption(option => option.setName('role')
                    .setDescription('The custom role to remove')
                    .setRequired(true))))
        .addSubcommandGroup(subcommandGroup => subcommandGroup
            .setName('staff')
            .setDescription('Manage staff roles in the server. (STAFF ONLY)')
            .addSubcommand(subcommand => subcommand
                .setName('create')
                .setDescription('Create a staff role in the database for this server. (STAFF ONLY)')
                .addRoleOption(option => option.setName('role')
                    .setDescription('The staff role to add to the database')
                    .setRequired(true)))
            .addSubcommand(subcommand => subcommand
                .setName('delete')
                .setDescription('Delete a staff role in the database for this server. (STAFF ONLY)')
                .addRoleOption(option => option.setName('role')
                    .setDescription('The staff role to remove in the database')
                    .setRequired(true)))
            .addSubcommand(subcommand => subcommand
                .setName('list')
                .setDescription('List the staff roles for this server. (STAFF ONLY)'))
            .addSubcommand(subcommand => subcommand
                .setName('add')
                .setDescription('Add a staff role to a member in the server. (STAFF ONLY)')
                .addUserOption(option => option.setName('target')
                    .setDescription('The user to add the staff role to')
                    .setRequired(true))
                .addRoleOption(option => option.setName('role')
                    .setDescription('The staff role to add')
                    .setRequired(true)))
            .addSubcommand(subcommand => subcommand
                .setName('remove')
                .setDescription('Remove a staff role from a member in the server. (STAFF ONLY)')
                .addUserOption(option => option.setName('target')
                    .setDescription('The user to remove the staff role from')
                    .setRequired(true))
                .addRoleOption(option => option.setName('role')
                    .setDescription('The staff role to remove')
                    .setRequired(true))))
        .addSubcommandGroup(subcommandGroup => subcommandGroup
            .setName('level')
            .setDescription('Manage level roles in the server. (STAFF ONLY)')
            .addSubcommand(subcommand => subcommand
                .setName('create')
                .setDescription('Add a level reward role to the database. (STAFF ONLY)')
                .addRoleOption(option => option
                    .setName('role')
                    .setDescription('The level role to add to the database')
                    .setRequired(true))
                .addIntegerOption(option => option.setName('level')
                    .setDescription('The level required to obtain the role')
                    .setRequired(true)))
            .addSubcommand(subcommand => subcommand
                .setName('delete')
                .setDescription('Remove a level reward role from the database. (STAFF ONLY)')
                .addIntegerOption(option => option
                    .setName('level')
                    .setDescription('The level of the role to delete from the database')
                    .setRequired(true)))
            .addSubcommand(subcommand => subcommand
                .setName('list')
                .setDescription('List all level role rewards for the server.'))),

    category: 'moderation',
    async execute(interaction) {

        if (interaction.options.getSubcommandGroup() === 'custom') {

            if (interaction.options.getSubcommand() === 'create') {
                const role = interaction.options.getRole('role');
                const [customRole] = await CustomRoles.findOrCreate({
                    where: {
                        roleId: await role.id,
                        serverId: interaction.guild.id,
                        roleName: role.name
                    }
                });

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
                        return await interaction.reply(`:warning: I cannot add the role ${role} to the custom roles list because my role is not high enough.`);

                    } else if (!role.editable) {
                        return await interaction.reply(`:warning: I cannot add the role ${role} to the custom roles list because it is not editable.`);
                    } else {
                        customRole.update({roleId: role.id, serverId: interaction.guild.id, roleName: role.name});
                        return await interaction.reply(`Successfully added the role ${role} to the custom roles list!`);
                    }
                } else {
                    if (role.comparePositionTo(interaction.member.roles.highest) >= 0) {
                        return await interaction.reply(`:warning: You cannot add the role ${role} to the custom roles list because your role is not high enough.`);
                    } else if (role.comparePositionTo(highestRole) >= 0) {
                        return await interaction.reply(`:warning: I cannot add the role ${role} to the custom roles list because my role is not high enough.`);
                    } else if (!role.editable) {
                        return await interaction.reply(`:warning: I cannot add the role ${role} to the custom roles list because it is not editable.`);
                    } else {
                        customRole.update({roleId: role.id, serverId: interaction.guild.id, roleName: role.name});
                        return await interaction.reply(`Successfully added the role ${role} to the custom roles list!`);
                    }
                }

            }

            if (interaction.options.getSubcommand() === 'delete') {
                const role = interaction.options.getRole('role');
                const customRole = await CustomRoles.findOne({where: {roleId: await role.id}});


                if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageRoles)) {
                    return interaction.reply(':x: You do not have permission to manage roles.');
                }

                const botMember = interaction.guild.members.cache.get(interaction.client.user.id);
                if (!botMember.permissions.has(PermissionsBitField.Flags.ManageRoles)) {
                    return interaction.reply(':warning: I do not have permission to manage roles.');
                }


                if (!customRole) {
                    return await interaction.reply(`:warning: The role ${role} does not exist in the custom roles list.`);
                }

                const highestRole = botMember.roles.highest;

                const ownerPromise = interaction.guild.fetchOwner();
                const owner = await ownerPromise;

                if (interaction.member === owner) {
                    if (role.comparePositionTo(highestRole) >= 0) {
                        return await interaction.reply(`:warning: I cannot remove the role ${role} from the custom roles list because my role is not high enough.`);

                    } else if (!role.editable) {
                        return await interaction.reply(`:warning: I cannot remove the role ${role} from the custom roles list because it is not editable.`);
                    } else {
                        customRole.destroy();
                        return await interaction.reply(`Successfully removed the role ${role} from the custom roles list!`);
                    }
                } else {
                    if (role.comparePositionTo(interaction.member.roles.highest) >= 0) {
                        return await interaction.reply(`:warning: You cannot remove the role ${role} from the custom roles list because your role is not high enough.`);
                    } else if (role.comparePositionTo(highestRole) >= 0) {
                        return await interaction.reply(`:warning: I cannot remove the role ${role} from the custom roles list because my role is not high enough.`);
                    } else if (!role.editable) {
                        return await interaction.reply(`:warning: I cannot remove the role ${role} from the custom roles list because it is not editable.`);
                    } else {
                        customRole.destroy();
                        return await interaction.reply(`Successfully removed the role ${role} from the custom roles list!`);
                    }
                }
            }

            if (interaction.options.getSubcommand() === 'add') {
                let target = interaction.options.getMember('target');
                const role = interaction.options.getRole('role');
                const customRole = await CustomRoles.findOne({where: {roleId: await role.id}});

                if (!target) {
                    target = interaction.options.getUser('target');
                    if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageRoles)) {
                        await interaction.reply(':x: You do not have permission to manage roles.');

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


                if (!customRole) {
                    return await interaction.reply(`:warning: You cannot add the role ${role} to **${target.user.tag}** because it does not exist in the custom roles list.`);
                }


                const highestRole = botMember.roles.highest;

                const ownerPromise = interaction.guild.fetchOwner();
                const owner = await ownerPromise;

                if (interaction.member === owner) {
                    if (role.comparePositionTo(highestRole) >= 0) {
                        await interaction.reply(`:warning: I cannot add the custom role ${role} to **${target.user.tag}** because my role is not high enough.`);

                    } else if (!role.editable) {
                        return interaction.reply(`:warning: You cannot add the custom role ${role} to **${target.user.tag}** because it is not editable.`);
                    } else {

                        await target.roles.add(role);
                        return await interaction.reply(`Successfully added the custom role ${role} to **${target.user.tag}**`);

                    }
                } else {
                    if (role.comparePositionTo(interaction.member.roles.highest) >= 0) {
                        await interaction.reply(`:warning: You cannot add the custom role ${role} to **${target.user.tag}** because your role is not high enough.`);


                    } else if (role.comparePositionTo(highestRole) >= 0) {
                        await interaction.reply(`:warning: I cannot add the custom role ${role} to **${target.user.tag}** because my role is not high enough.`);

                    } else if (!role.editable) {
                        return interaction.reply(`:warning: You cannot add the custom role ${role} to **${target.user.tag}** because it is not editable.`);
                    } else {

                        await target.roles.add(role);
                        return await interaction.reply(`Successfully added the custom role ${role} to **${target.user.tag}**`);

                    }
                }

            }

            if (interaction.options.getSubcommand() === 'remove') {
                let target = interaction.options.getMember('target');
                const role = interaction.options.getRole('role');
                const customRole = await CustomRoles.findOne({where: {roleId: await role.id}});

                if (!target) {
                    target = interaction.options.getUser('target');
                    if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageRoles)) {
                        await interaction.reply(':x: You do not have permission to manage roles.');

                    }
                    return await interaction.reply(`You cannot remove roles to **${target.tag}** because they are not in the server.`);
                }
                if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageRoles)) {
                    return interaction.reply(':x: You do not have permission to manage roles.');

                }


                const botMember = interaction.guild.members.cache.get(interaction.client.user.id);
                if (!botMember.permissions.has(PermissionsBitField.Flags.ManageRoles)) {
                    return interaction.reply(':warning: I do not have permission to manage roles.');
                }


                if (!customRole) {
                    return await interaction.reply(`:warning: You cannot remove the role ${role} from **${target.user.tag}** because it does not exist in the custom roles list.`);
                }


                const highestRole = botMember.roles.highest;

                const ownerPromise = interaction.guild.fetchOwner();
                const owner = await ownerPromise;

                if (interaction.member === owner) {
                    if (role.comparePositionTo(highestRole) >= 0) {
                        await interaction.reply(`:warning: I cannot remove the custom role ${role} from **${target.user.tag}** because my role is not high enough.`);

                    } else if (!role.editable) {
                        return interaction.reply(`:warning: You cannot remove the custom role ${role} from **${target.user.tag}** because it is not editable.`);
                    } else {

                        await target.roles.remove(role);
                        return await interaction.reply(`Successfully removed the custom role ${role} from **${target.user.tag}**`);

                    }
                } else {
                    if (role.comparePositionTo(interaction.member.roles.highest) >= 0) {
                        await interaction.reply(`:warning: You cannot remove the custom role ${role} from **${target.user.tag}** because your role is not high enough.`);


                    } else if (role.comparePositionTo(highestRole) >= 0) {
                        await interaction.reply(`:warning: I cannot remove the custom role ${role} from **${target.user.tag}** because my role is not high enough.`);

                    } else if (!role.editable) {
                        return interaction.reply(`:warning: You cannot remove the custom role ${role} from **${target.user.tag}** because it is not editable.`);
                    } else {

                        await target.roles.remove(role);
                        return await interaction.reply(`Successfully removed the custom role ${role} from **${target.user.tag}**`);

                    }
                }

            }

            if (interaction.options.getSubcommand() === 'list') {
                try {
                    // Fetch custom roles from the database
                    const customRoles = await CustomRoles.findAll({
                        where: { serverId: interaction.guild.id },
                    });

                    if (!customRoles.length) {
                        await interaction.reply('There are no custom roles in this server.');
                        return;
                    }

                    // Format the roles into a displayable string
                    let rolesList = customRoles
                        .map(role => `<@&${role.roleId}> **${role.roleName}** (ID: ${role.roleId})`)
                        .join('\n');

                    // Check if the response exceeds Discord's 2000-character limit
                    if (rolesList.length > 2000) {
                        const splitMessages = [];
                        let chunk = '';

                        // Split the roles into chunks
                        for (const line of rolesList.split('\n')) {
                            if ((chunk + line + '\n').length > 2000) {
                                splitMessages.push(chunk);
                                chunk = '';
                            }
                            chunk += line + '\n';
                        }
                        if (chunk) splitMessages.push(chunk);

                        // Send each chunk as a separate message
                        await interaction.reply({ content: 'The list of custom roles is too long, splitting into multiple messages:' });
                        for (const message of splitMessages) {
                            await interaction.followUp({ content: message });
                        }
                    } else {
                        // Send the roles list if it fits within the character limit
                        await interaction.reply({ content: rolesList });
                    }
                } catch (error) {
                    console.error(error);
                    await interaction.reply('An error occurred while fetching custom roles.');
                }
            }

        }

        if (interaction.options.getSubcommandGroup() === 'staff') {

            if (interaction.options.getSubcommand() === 'create') {
                const role = interaction.options.getRole('role');
                const [staffRole] = await StaffRoles.findOrCreate({
                    where: {
                        roleId: await role.id,
                        serverId: interaction.guild.id,
                        roleName: role.name
                    }
                });

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
                        return await interaction.reply(`:warning: I cannot add the role ${role} to the staff roles list because my role is not high enough.`);

                    } else if (!role.editable) {
                        return await interaction.reply(`:warning: I cannot add the role ${role} to the staff roles list because it is not editable.`);
                    } else {
                        staffRole.update({roleId: role.id, serverId: interaction.guild.id, roleName: role.name});
                        return await interaction.reply(`Successfully added the role ${role} to the staff roles list!`);
                    }
                } else {
                    if (role.comparePositionTo(interaction.member.roles.highest) >= 0) {
                        return await interaction.reply(`:warning: You cannot add the role ${role} to the staff roles list because your role is not high enough.`);
                    } else if (role.comparePositionTo(highestRole) >= 0) {
                        return await interaction.reply(`:warning: I cannot add the role ${role} to the staff roles list because my role is not high enough.`);
                    } else if (!role.editable) {
                        return await interaction.reply(`:warning: I cannot add the role ${role} to the staff roles list because it is not editable.`);
                    } else {
                        staffRole.update({roleId: role.id, serverId: interaction.guild.id, roleName: role.name});
                        return await interaction.reply(`Successfully added the role ${role} to the staff roles list!`);
                    }
                }

            }

            if (interaction.options.getSubcommand() === 'delete') {
                const role = interaction.options.getRole('role');
                const staffRole = await StaffRoles.findOne({where: {roleId: await role.id}});


                if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageRoles)) {
                    return interaction.reply(':x: You do not have permission to manage roles.');
                }

                const botMember = interaction.guild.members.cache.get(interaction.client.user.id);
                if (!botMember.permissions.has(PermissionsBitField.Flags.ManageRoles)) {
                    return interaction.reply(':warning: I do not have permission to manage roles.');
                }


                if (!staffRole) {
                    return await interaction.reply(`:warning: The role ${role} does not exist in the staff roles list.`);
                }

                const highestRole = botMember.roles.highest;

                const ownerPromise = interaction.guild.fetchOwner();
                const owner = await ownerPromise;

                if (interaction.member === owner) {
                    if (role.comparePositionTo(highestRole) >= 0) {
                        return await interaction.reply(`:warning: I cannot remove the role ${role} from the staff roles list because my role is not high enough.`);

                    } else if (!role.editable) {
                        return await interaction.reply(`:warning: I cannot remove the role ${role} from the staff roles list because it is not editable.`);
                    } else {
                        staffRole.destroy();
                        return await interaction.reply(`Successfully removed the role ${role} from the staff roles list!`);
                    }
                } else {
                    if (role.comparePositionTo(interaction.member.roles.highest) >= 0) {
                        return await interaction.reply(`:warning: You cannot remove the role ${role} from the staff roles list because your role is not high enough.`);
                    } else if (role.comparePositionTo(highestRole) >= 0) {
                        return await interaction.reply(`:warning: I cannot remove the role ${role} from the staff roles list because my role is not high enough.`);
                    } else if (!role.editable) {
                        return await interaction.reply(`:warning: I cannot remove the role ${role} from the staff roles list because it is not editable.`);
                    } else {
                        staffRole.destroy();
                        return await interaction.reply(`Successfully removed the role ${role} from the staff roles list!`);
                    }
                }
            }

            if (interaction.options.getSubcommand() === 'add') {
                let target = interaction.options.getMember('target');
                const role = interaction.options.getRole('role');
                const staffRole = await StaffRoles.findOne({where: {roleId: await role.id}});

                if (!target) {
                    target = interaction.options.getUser('target');
                    if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageRoles)) {
                        await interaction.reply(':x: You do not have permission to manage roles.');

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


                if (!staffRole) {
                    return await interaction.reply(`:warning: You cannot add the role ${role} to **${target.user.tag}** because it does not exist in the staff roles list.`);
                }


                const highestRole = botMember.roles.highest;

                const ownerPromise = interaction.guild.fetchOwner();
                const owner = await ownerPromise;

                if (interaction.member === owner) {
                    if (role.comparePositionTo(highestRole) >= 0) {
                        await interaction.reply(`:warning: I cannot add the staff role ${role} to **${target.user.tag}** because my role is not high enough.`);

                    } else if (!role.editable) {
                        return interaction.reply(`:warning: You cannot add the staff role ${role} to **${target.user.tag}** because it is not editable.`);
                    } else {

                        await target.roles.add(role);
                        return await interaction.reply(`Successfully added the staff role ${role} to **${target.user.tag}**`);

                    }
                } else {
                    if (role.comparePositionTo(interaction.member.roles.highest) >= 0) {
                        await interaction.reply(`:warning: You cannot add the staff role ${role} to **${target.user.tag}** because your role is not high enough.`);


                    } else if (role.comparePositionTo(highestRole) >= 0) {
                        await interaction.reply(`:warning: I cannot add the staff role ${role} to **${target.user.tag}** because my role is not high enough.`);

                    } else if (!role.editable) {
                        return interaction.reply(`:warning: You cannot add the staff role ${role} to **${target.user.tag}** because it is not editable.`);
                    } else {

                        await target.roles.add(role);
                        return await interaction.reply(`Successfully added the staff role ${role} to **${target.user.tag}**`);

                    }
                }

            }

            if (interaction.options.getSubcommand() === 'remove') {
                let target = interaction.options.getMember('target');
                const role = interaction.options.getRole('role');
                const staffRole = await StaffRoles.findOne({where: {roleId: await role.id}});

                if (!target) {
                    target = interaction.options.getUser('target');
                    if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageRoles)) {
                        await interaction.reply(':x: You do not have permission to manage roles.');

                    }
                    return await interaction.reply(`You cannot remove roles to **${target.tag}** because they are not in the server.`);
                }
                if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageRoles)) {
                    return interaction.reply(':x: You do not have permission to manage roles.');

                }


                const botMember = interaction.guild.members.cache.get(interaction.client.user.id);
                if (!botMember.permissions.has(PermissionsBitField.Flags.ManageRoles)) {
                    return interaction.reply(':warning: I do not have permission to manage roles.');
                }


                if (!staffRole) {
                    return await interaction.reply(`:warning: You cannot remove the role ${role} from **${target.user.tag}** because it does not exist in the staff roles list.`);
                }


                const highestRole = botMember.roles.highest;

                const ownerPromise = interaction.guild.fetchOwner();
                const owner = await ownerPromise;

                if (interaction.member === owner) {
                    if (role.comparePositionTo(highestRole) >= 0) {
                        await interaction.reply(`:warning: I cannot remove the staff role ${role} from **${target.user.tag}** because my role is not high enough.`);

                    } else if (!role.editable) {
                        return interaction.reply(`:warning: You cannot remove the staff role ${role} from **${target.user.tag}** because it is not editable.`);
                    } else {

                        await target.roles.remove(role);
                        return await interaction.reply(`Successfully removed the staff role ${role} from **${target.user.tag}**`);

                    }
                } else {
                    if (role.comparePositionTo(interaction.member.roles.highest) >= 0) {
                        await interaction.reply(`:warning: You cannot remove the staff role ${role} from **${target.user.tag}** because your role is not high enough.`);


                    } else if (role.comparePositionTo(highestRole) >= 0) {
                        await interaction.reply(`:warning: I cannot remove the staff role ${role} from **${target.user.tag}** because my role is not high enough.`);

                    } else if (!role.editable) {
                        return interaction.reply(`:warning: You cannot remove the staff role ${role} from **${target.user.tag}** because it is not editable.`);
                    } else {

                        await target.roles.remove(role);
                        return await interaction.reply(`Successfully removed the staff role ${role} from **${target.user.tag}**`);

                    }
                }

            }

            if (interaction.options.getSubcommand() === 'list') {

                if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageRoles)) {
                    return interaction.reply(':x: Sorry, you do not have permission to run this command.');

                }

                try {
                    // Fetch staff roles from the database
                    const staffRoles = await StaffRoles.findAll({
                        where: { serverId: interaction.guild.id },
                    });

                    if (!staffRoles.length) {
                        await interaction.reply('There are no staff roles in this server.');
                        return;
                    }

                    // Format the roles into a displayable string
                    let rolesList = staffRoles
                        .map(role => `<@&${role.roleId}> **${role.roleName}** (ID: ${role.roleId})`)
                        .join('\n');

                    // Check if the response exceeds Discord's 2000-character limit
                    if (rolesList.length > 2000) {
                        const splitMessages = [];
                        let chunk = '';

                        // Split the roles into chunks
                        for (const line of rolesList.split('\n')) {
                            if ((chunk + line + '\n').length > 2000) {
                                splitMessages.push(chunk);
                                chunk = '';
                            }
                            chunk += line + '\n';
                        }
                        if (chunk) splitMessages.push(chunk);

                        // Send each chunk as a separate message
                        await interaction.reply({ content: 'The list of staff roles is too long, splitting into multiple messages:' });
                        for (const message of splitMessages) {
                            await interaction.followUp({ content: message });
                        }
                    } else {
                        // Send the roles list if it fits within the character limit
                        await interaction.reply({ content: rolesList });
                    }
                } catch (error) {
                    console.error(error);
                    await interaction.reply('An error occurred while fetching staff roles.');
                }
            }
        }

        if (interaction.options.getSubcommandGroup() === 'level') {

            if (interaction.options.getSubcommand() === 'create') {
                const level = interaction.options.getInteger('level');
                const role = interaction.options.getRole('role');


                if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageRoles)) {
                    return interaction.reply(':x: You do not have permission to manage roles.');

                }


                const botMember = interaction.guild.members.cache.get(interaction.client.user.id);
                if (!botMember.permissions.has(PermissionsBitField.Flags.ManageRoles)) {
                    return interaction.reply(':warning: I do not have permission to manage roles, so I cannot assign level roles.');
                }

                // Check if a reward for this level already exists
                const existingReward = await LevelRoles.findOne({ where: { serverId: interaction.guild.id, level: level } });

                if (existingReward) {
                    return interaction.reply({
                        content: `A role reward for level ${level} already exists.`,
                        ephemeral: true,
                    });
                }

                // Add the role reward to the database
                await LevelRoles.create({
                    serverId: interaction.guild.id,
                    level: level,
                    roleId: role.id,
                    roleName: role.name,
                });

                return interaction.reply({
                    content: `Role reward added: Level ${level} -> ${role.name}`,
                });
            }

            if (interaction.options.getSubcommand() === 'delete') {
                const level = interaction.options.getInteger('level');


                if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageRoles)) {
                    return interaction.reply(':x: You do not have permission to manage roles.');

                }


                const botMember = interaction.guild.members.cache.get(interaction.client.user.id);
                if (!botMember.permissions.has(PermissionsBitField.Flags.ManageRoles)) {
                    return interaction.reply(':warning: I do not have permission to manage roles, so I cannot assign level roles.');
                }

                // Check if a reward for this level already exists
                const existingReward = await LevelRoles.findOne({ where: { serverId: interaction.guild.id, level: level } });

                if (!existingReward) {
                    return interaction.reply({
                        content: `No role reward exists for level ${level}.`,
                        ephemeral: true,
                    });
                }

                // Add the role reward to the database
                await existingReward.destroy();

                return interaction.reply({
                    content: `Role reward for level ${level} has been removed.`,
                    ephemeral: true,
                });
            }

            if (interaction.options.getSubcommand() === 'list') {
                try {
                    // Fetch custom roles from the database
                    const rewards = await LevelRoles.findAll({
                        where: { serverId: interaction.guild.id },
                    });

                    if (!rewards.length) {
                        await interaction.reply('There are no level role rewards in this server.');
                        return;
                    }

                    // Format the roles into a displayable string
                    let rolesList = rewards
                        .map(role => `**Level ${role.level}**: <@&${role.roleId}> ${role.roleName} (ID: ${role.roleId})`)
                        .join('\n');

                    // Check if the response exceeds Discord's 2000-character limit
                    if (rolesList.length > 2000) {
                        const splitMessages = [];
                        let chunk = '';

                        // Split the roles into chunks
                        for (const line of rolesList.split('\n')) {
                            if ((chunk + line + '\n').length > 2000) {
                                splitMessages.push(chunk);
                                chunk = '';
                            }
                            chunk += line + '\n';
                        }
                        if (chunk) splitMessages.push(chunk);

                        // Send each chunk as a separate message
                        await interaction.reply({ content: 'The list of custom roles is too long, splitting into multiple messages:' });
                        for (const message of splitMessages) {
                            await interaction.followUp({ content: message });
                        }
                    } else {
                        // Send the roles list if it fits within the character limit
                        await interaction.reply({ content: rolesList });
                    }
                } catch (error) {
                    console.error(error);
                    await interaction.reply('An error occurred while fetching custom roles.');
                }
            }


        }
        
        if (interaction.options.getSubcommand() === 'add') {
                let target = interaction.options.getMember('target');
                const role = interaction.options.getRole('role');

                if (!target) {
                    target = interaction.options.getUser('target');
                    if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageRoles)) {
                        await interaction.reply(':x: You do not have permission to manage roles.');

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
                        await interaction.reply(`:warning: I cannot add the role ${role} to **${target.user.tag}** because my role is not high enough.`);

                    } else if (!role.editable) {
                        return interaction.reply(`:warning: You cannot add the role ${role} to **${target.user.tag}** because it is not editable.`);
                    } else {

                        await target.roles.add(role);
                        return await interaction.reply(`Successfully added the role ${role} to **${target.user.tag}**`);

                    }
                } else {
                    if (role.comparePositionTo(interaction.member.roles.highest) >= 0) {
                        await interaction.reply(`:warning: You cannot add the role ${role} to **${target.user.tag}** because your role is not high enough.`);


                    } else if (role.comparePositionTo(highestRole) >= 0) {
                        await interaction.reply(`:warning: I cannot add the role ${role} to **${target.user.tag}** because my role is not high enough.`);

                    } else if (!role.editable) {
                        return interaction.reply(`:warning: You cannot add the role ${role} to **${target.user.tag}** because it is not editable.`);
                    } else {

                        await target.roles.add(role);
                        return await interaction.reply(`Successfully added the role ${role} to **${target.user.tag}**`);

                    }
                }

            }

        if (interaction.options.getSubcommand() === 'remove') {

                let target = interaction.options.getMember('target');
                const role = interaction.options.getRole('role');


                if (!target) {
                    target = interaction.options.getUser('target');
                    if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageRoles)) {
                        return await interaction.reply(':x: You do not have permission to manage roles.');

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
                        return await interaction.reply(`:warning: I cannot remove the role ${role} from **${target.user.tag}** because my role is not high enough.`);

                    } else if (!role.editable) {
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

        if (interaction.options.getSubcommand() === 'create') {
                const name = interaction.options.getString('name');
                const color = interaction.options.getString('color') || '#000000';  // Default to black if no color is provided
                const hoisted = interaction.options.getBoolean('hoisted') || false;  // Default to false if no hoisted option is provided

                if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageRoles)) {
                    return interaction.reply(':x: You do not have permission to manage roles.');
                }

                const botMember = interaction.guild.members.cache.get(interaction.client.user.id);
                if (!botMember.permissions.has(PermissionsBitField.Flags.ManageRoles)) {
                    return interaction.reply(':warning: I do not have permission to manage roles.');
                }

                try {
                    const role = await interaction.guild.roles.create({
                        name: name,
                        color: color,
                        hoist: hoisted,
                        reason: 'Role created via bot command',
                    });

                    return interaction.reply({
                        content: `Successfully created the role **${role.name}** with color **${color}**!`,
                    });
                } catch (error) {
                    console.error('Error creating role:', error);
                    return interaction.reply({
                        content: 'There was an error trying to create the role. Please try again later.',
                        ephemeral: true,
                    });
                }

            }

        if (interaction.options.getSubcommand() === 'delete') {
                const role = interaction.options.getRole('role');

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
                        return await interaction.reply(`:warning: I cannot delete the role ${role} because my role is not high enough.`);

                    } else if (!role.editable) {
                        return await interaction.reply(`:warning: You cannot delete the role ${role} because it is not editable.`);
                    } else {
                        try {
                            await role.delete();
                            return await interaction.reply(`Successfully deleted the role **${role.name}**`);

                        } catch (error) {
                            console.error(error);
                            return await interaction.reply(`There was a problem deleting the role **${role.name}**. Please try again later.`);
                        }

                    }
                } else {
                    if (role.comparePositionTo(interaction.member.roles.highest) >= 0) {
                        return await interaction.reply(`:warning: You cannot delete the role **${role.name}** because your role is not high enough.`);
                    } else if (role.comparePositionTo(highestRole) >= 0) {
                        return await interaction.reply(`:warning: I cannot delete the role **${role.name}** because my role is not high enough.`);
                    } else if (!role.editable) {
                        return await interaction.reply(`:warning: I cannot delete the role **${role.name}** because it is not editable.`);
                    } else {

                        try {
                            await role.delete();
                            return await interaction.reply(`Successfully deleted the role **${role.name}**`);

                        } catch (error) {
                            console.error(error);
                            return await interaction.reply(`There was a problem deleting the role **${role.name}**. Please try again later.`);
                        }

                    }
                }


            }

        if (interaction.options.getSubcommand() === 'mute') {
                const role = interaction.options.getRole('role');
                const [guild] = await Guild.findOrCreate({where: {serverId: await interaction.guild.id}});


                if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageRoles)) {
                    return interaction.reply(':x: You do not have permission to manage roles.');

                }

                const botMember = interaction.guild.members.cache.get(interaction.client.user.id);
                if (!botMember.permissions.has(PermissionsBitField.Flags.ManageRoles)) {
                    return interaction.reply(':warning: I do not have permission to manage roles.');

                }


                const highestRole = botMember.roles.highest;

                if (!role) {
                    await guild.update({muteRoleId: null});
                    return await interaction.reply('Mute role has been set to **none**.');


                } else if (role.comparePositionTo(highestRole) >= 0) {
                    await interaction.reply(`:warning: I cannot set the mute role to **${role}** because my role is not high enough. (I cannot mute people with it later)`);
                } else if (!role.editable) {
                    return interaction.reply(`:warning: You cannot set the mute role to **${role}** because it is not editable.`);
                } else {
                    await guild.update({muteRoleId: role.id});
                    return await interaction.reply(`Mute role has been set to **${role}**`);
                }

            }

    }
}