const { SlashCommandBuilder, PermissionsBitField, EmbedBuilder} = require('discord.js');
const {Guild, Embed} = require('../../models/')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('leave')
        .setDescription('Configure stuff for when a member leaves the server. (STAFF ONLY)')
        .setDMPermission(false)
        .addSubcommand(subcommand => subcommand
            .setName('channel')
            .setDescription('Add, change, or remove the leave channel in the server. (STAFF ONLY)')
            .addChannelOption(option => option
                .setName('channel')
                .setDescription('The channel to set')))
        .addSubcommand(subcommand => subcommand
            .setName('message')
            .setDescription('Add, change, or remove the leave message in the server. (STAFF ONLY)')
            .addStringOption(option => option
                .setName('message')
                .setDescription('The message to set. Use placeholders like {user}, {username}, {tag}, {server}, and \\n for new lines.')
                .setMaxLength(1000)))
        .addSubcommand(subcommand => subcommand
            .setName('embed')
            .setDescription('Add, change, or remove the leave embed in the server. (STAFF ONLY)')
            .addStringOption(option => option
                .setName('name')
                .setDescription('The name of the embed')
                .setMaxLength(100)))
        .addSubcommand(subcommand => subcommand
            .setName('test')
            .setDescription('Test the leave message. (STAFF ONLY)')),

    category: 'moderation',
    async execute(interaction) {

        if (interaction.options.getSubcommand() === 'channel') {
            const channel = interaction.options.getChannel('channel');
            const [guild] = await Guild.findOrCreate({where: {serverId: await interaction.guild.id}});




            if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageChannels)) {
                return interaction.reply(':x: You do not have permission to manage channels.');

            }

            const botMember = interaction.guild.members.cache.get(interaction.client.user.id);
            if (!botMember.permissions.has(PermissionsBitField.Flags.ManageChannels)) {
                return interaction.reply(':warning: I do not have permission to manage channels.');

            }



            if (!channel) {
                await guild.update({ leaveChannelId: null });
                return await interaction.reply('Leave channel has been set to **none**.');



            } else {
                await guild.update({ leaveChannelId: channel.id });
                return await interaction.reply(`Leave channel has been set to **${channel}**`);
            }
        }

        if (interaction.options.getSubcommand() === 'message') {

            const message = interaction.options.getString('message');
            const [guild] = await Guild.findOrCreate({where: {serverId: await interaction.guild.id}});




            if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageMessages)) {
                return interaction.reply(':x: You do not have permission to manage messages.');

            }

            const botMember = interaction.guild.members.cache.get(interaction.client.user.id);
            if (!botMember.permissions.has(PermissionsBitField.Flags.ManageMessages)) {
                return interaction.reply(':warning: I do not have permission to manage messages.');

            }


            if (!message) {
                await guild.update({ leaveMessage: null });
                return await interaction.reply('Removed the leamve message.');



            } else {
                // Replace \n with actual newlines
                const formattedMessage = message.replace(/\\n/g, '\n');

                await guild.update({ leaveMessage: formattedMessage });
                return interaction.reply({ content: `Leave message has been set to:\n\`${formattedMessage}\`` });

            }
        }

        if (interaction.options.getSubcommand() === 'embed') {
            const name = interaction.options.getString('name');
            const [guild] = await Guild.findOrCreate({where: {serverId: await interaction.guild.id}});

            if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageGuild)) {
                return interaction.reply(':x: You do not have permission to run this command.');

            }



            if (!name) {
                await guild.update({ leaveEmbedId: null });
                return await interaction.reply('Leave embed has been set to **none**.');



            } else {

                const existingEmbed = await Embed.findOne({ where: { serverId: interaction.guild.id, embedName: name } });
                if (!existingEmbed) {
                    return interaction.reply({ content: `The embed **${name}** does not exist.`, ephemeral: true });
                }

                await guild.update({ leaveEmbedId: existingEmbed.id });
                return await interaction.reply(`Leave embed has been set to embed name: **${existingEmbed.embedName}**`);
            }
        }

        if (interaction.options.getSubcommand() === 'test') {
            const guild = await Guild.findOne({ where: { serverId: await interaction.guild.id } });

            if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageMessages)) {
                return interaction.reply(':x: You do not have permission to manage messages.');
            }

            if (!guild) {
                return interaction.reply(':x: No guild configuration found.');
            }

            const leaveMessage = guild.leaveMessage;
            const leaveEmbedId = guild.leaveEmbedId;
            const leaveChannel = await interaction.guild.channels.fetch(guild.leaveChannelId)

            // Test leave message only
            if (!leaveMessage && !leaveEmbedId) {
                return await interaction.reply(':x: No leave message or embed has been set.');
            }

            if (leaveMessage && !leaveEmbedId) {
                const formattedMessage = leaveMessage
                    .replace('{user}', `<@${interaction.user.id}>`)
                    .replace('{username}', interaction.user.username)
                    .replace('{tag}', interaction.user.tag)
                    .replace('{server}', interaction.guild.name)
                    .replace('{user_avatar}', interaction.user.displayAvatarURL({ dynamic: true })) // Replacing placeholder with user avatar URL
                    .replace('{server_icon}', interaction.guild.iconURL({ dynamic: true })) // Replacing placeholder with server icon URL
                    .replace('{server_avatar}', interaction.guild.iconURL({ dynamic: true })) // Handling the server avatar placeholder
                    .replace('{server_members}', interaction.guild.memberCount);

                if (!guild.leaveChannelId) {
                    return await interaction.reply(formattedMessage);
                } else {
                    await leaveChannel.send(formattedMessage);
                    return await interaction.reply("Tested the leave message.");
                }

            }

            // Test leave embed only
            if (!leaveMessage && leaveEmbedId) {
                const leaveEmbed = await Embed.findOne({ where: { id: leaveEmbedId } });

                if (!leaveEmbed) {
                    return await interaction.reply(':x: The embed associated with the leave message no longer exists.');
                }

                if (!leaveEmbed.isActive) {
                    return await interaction.reply(':x: The embed associated with the leave message is not active.');
                }

                const embed = new EmbedBuilder()
                    .setAuthor({
                        name: leaveEmbed.authorText ? leaveEmbed.authorText
                            .replace('{user}', `<@${interaction.user.id}>`)
                            .replace('{username}', interaction.user.username)
                            .replace('{tag}', interaction.user.tag)
                            .replace('{server}', interaction.guild.name)
                            .replace('{server_members}', interaction.guild.memberCount): null,
                        iconURL: leaveEmbed.authorImage ? leaveEmbed.authorImage
                            .replace('{user_avatar}', interaction.user.displayAvatarURL({ dynamic: true }))
                            .replace('{server_avatar}', interaction.guild.iconURL({ dynamic: true })) : null
                    })
                    .setTitle(leaveEmbed.title ? leaveEmbed.title
                            .replace('{user}', `<@${interaction.user.id}>`)
                            .replace('{username}', interaction.user.username)
                            .replace('{tag}', interaction.user.tag)
                            .replace('{server}', interaction.guild.name)
                            .replace('{server_members}', interaction.guild.memberCount)
                        : null)
                    .setDescription(leaveEmbed.description ? leaveEmbed.description
                        .replace('{user}', `<@${interaction.user.id}>`)
                        .replace('{username}', interaction.user.username)
                        .replace('{tag}', interaction.user.tag)
                        .replace('{server}', interaction.guild.name)
                        .replace('{server_members}', interaction.guild.memberCount) : null)
                    .setThumbnail(leaveEmbed.thumbnail === "{user_avatar}" ? interaction.user.displayAvatarURL({ dynamic: true }) :
                        leaveEmbed.thumbnail === "{server_avatar}" ? interaction.guild.iconURL({ dynamic: true }) :
                            leaveEmbed.thumbnail || null) // Handling thumbnail for both user avatar and server avatar placeholders
                    .setFooter({
                        text: leaveEmbed.footerText ? leaveEmbed.footerText
                            .replace('{user}', `<@${interaction.user.id}>`)
                            .replace('{username}', interaction.user.username)
                            .replace('{tag}', interaction.user.tag)
                            .replace('{server}', interaction.guild.name)
                            .replace('{server_members}', interaction.guild.memberCount) : null,
                        iconURL: leaveEmbed.footerImage === "{user_avatar}" ? interaction.user.displayAvatarURL({ dynamic: true }) :
                            leaveEmbed.footerImage === "{server_avatar}" ? interaction.guild.iconURL({ dynamic: true }) :
                                (leaveEmbed.footerImage || null)
                    })
                    .setColor(leaveEmbed.color || null)
                    .setImage(leaveEmbed.image === "{user_avatar}" ? interaction.user.displayAvatarURL({ dynamic: true }) :
                        leaveEmbed.image === "{server_avatar}" ? interaction.guild.iconURL({ dynamic: true }) :
                            leaveEmbed.image || null); // Handling image for both user avatar and server avatar placeholders

                if (leaveEmbed.timestamp) embed.setTimestamp();

                if (!guild.leaveChannelId) {
                    return await interaction.reply({embeds: [embed]});
                } else {
                    await leaveChannel.send({embeds: [embed]});
                    return await interaction.reply("Tested the leave message.");
                }
            }

            // Test both leave message and embed
            if (leaveMessage && leaveEmbedId) {
                const leaveEmbed = await Embed.findOne({ where: { id: leaveEmbedId } });

                if (!leaveEmbed) {
                    return await interaction.reply(':x: The embed associated with the leave message no longer exists.');
                }



                const formattedMessage = leaveMessage
                    .replace('{user}', `<@${interaction.user.id}>`)
                    .replace('{username}', interaction.user.username)
                    .replace('{tag}', interaction.user.tag)
                    .replace('{server}', interaction.guild.name)
                    .replace('{user_avatar}', interaction.user.displayAvatarURL({ dynamic: true }))
                    .replace('{server_icon}', interaction.guild.iconURL({ dynamic: true }))
                    .replace('{server_avatar}', interaction.guild.iconURL({ dynamic: true })) // Replacing the server avatar placeholder
                    .replace('{server_members}', interaction.guild.memberCount);
                const embed = new EmbedBuilder()
                    .setAuthor({
                        name: leaveEmbed.authorText ? leaveEmbed.authorText
                                .replace('{user}', `<@${interaction.user.id}>`)
                                .replace('{username}', interaction.user.username)
                                .replace('{tag}', interaction.user.tag)
                                .replace('{server}', interaction.guild.name)
                                .replace('{server_members}', interaction.guild.memberCount)
                            : null,
                        iconURL: leaveEmbed.authorImage
                            .replace('{user_avatar}', interaction.user.displayAvatarURL({ dynamic: true }))
                            .replace('{server_avatar}', interaction.guild.iconURL({ dynamic: true })) || null
                    })
                    .setTitle(leaveEmbed.title ? leaveEmbed.title
                            .replace('{user}', `<@${interaction.user.id}>`)
                            .replace('{username}', interaction.user.username)
                            .replace('{tag}', interaction.user.tag)
                            .replace('{server}', interaction.guild.name)
                            .replace('{server_members}', interaction.guild.memberCount)
                        : null)
                    .setDescription(leaveEmbed.description ? leaveEmbed.description
                            .replace('{user}', `<@${interaction.user.id}>`)
                            .replace('{username}', interaction.user.username)
                            .replace('{tag}', interaction.user.tag)
                            .replace('{server}', interaction.guild.name)
                            .replace('{server_members}', interaction.guild.memberCount)
                        : null)
                    .setThumbnail(leaveEmbed.thumbnail === "{user_avatar}" ? interaction.user.displayAvatarURL({ dynamic: true }) :
                        leaveEmbed.thumbnail === "{server_avatar}" ? interaction.guild.iconURL({ dynamic: true }) :
                            leaveEmbed.thumbnail || null)
                    .setFooter({
                        text: leaveEmbed.footerText ? leaveEmbed.footerText
                            .replace('{user}', `<@${interaction.user.id}>`)
                            .replace('{username}', interaction.user.username)
                            .replace('{tag}', interaction.user.tag)
                            .replace('{server}', interaction.guild.name)
                            .replace('{server_members}', interaction.guild.memberCount): null,
                        iconURL: leaveEmbed.footerImage === "{user_avatar}" ? interaction.user.displayAvatarURL({ dynamic: true }) :
                            leaveEmbed.footerImage === "{server_avatar}" ? interaction.guild.iconURL({ dynamic: true }) :
                                (leaveEmbed.footerImage || null)
                    })
                    .setColor(leaveEmbed.color || null)
                    .setImage(leaveEmbed.image === "{user_avatar}" ? interaction.user.displayAvatarURL({ dynamic: true }) :
                        leaveEmbed.image === "{server_avatar}" ? interaction.guild.iconURL({ dynamic: true }) :
                            leaveEmbed.image || null);
                if (leaveEmbed.timestamp) embed.setTimestamp();


                if (!guild.leaveChannelId) {
                    if (!leaveEmbed.isActive) {
                        return await interaction.reply(`${formattedMessage}\n(The embed associated with the leave message is not active.)`);
                    }
                    return await interaction.reply({ content: formattedMessage, embeds: [embed] });
                } else {
                    if (!leaveEmbed.isActive) {
                        await leaveChannel.send({ content: formattedMessage + '\n(The embed associated with the leave message is not active.)'});
                        return await interaction.reply("Tested the leave message.");
                    } else {
                        await leaveChannel.send({ content: formattedMessage, embeds: [embed] });
                        return await interaction.reply("Tested the leave message.");
                    }
                }


            }
        }

    },
};