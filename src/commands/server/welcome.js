const { SlashCommandBuilder, PermissionsBitField, EmbedBuilder} = require('discord.js');
const {Guild, Embed} = require('../../models/')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('welcome')
        .setDescription('Configure stuff for when a member joins the server. (STAFF ONLY)')
        .setDMPermission(false)
        .addSubcommand(subcommand => subcommand
            .setName('channel')
            .setDescription('Add, change, or remove the welcome channel in the server. (STAFF ONLY)')
            .addChannelOption(option => option
                .setName('channel')
                .setDescription('The channel to set')))
        .addSubcommand(subcommand => subcommand
            .setName('message')
            .setDescription('Add, change, or remove the welcome message in the server. (STAFF ONLY)')
            .addStringOption(option => option
                .setName('message')
                .setDescription('The message to set. Use /placeholders for a list of available placeholders.')
                .setMaxLength(1000))
            .addStringOption(option => option
                .setName('embed')
                .setDescription('The name of the embed to show (leave empty to remove)')
                .setMaxLength(100)))
        .addSubcommand(subcommand => subcommand
            .setName('test')
            .setDescription('Test the welcome message. (STAFF ONLY)')),

    category: 'server announcements',
    async execute(interaction) {

        if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageGuild))
            return interaction.reply(':x: Sorry, you do not have permission to run this command.');

        if (interaction.options.getSubcommand() === 'channel') {
            const channel = interaction.options.getChannel('channel');
            const [guild] = await Guild.findOrCreate({where: {serverId: await interaction.guild.id}});

            if (!channel) {
                await guild.update({ welcomeChannelId: null });
                return await interaction.reply('Welcome channel has been set to **none**.');
            } else {
                await guild.update({ welcomeChannelId: channel.id });
                return await interaction.reply(`Welcome channel has been set to **${channel}**`);
            }
        }

        if (interaction.options.getSubcommand() === 'message') {

           const message = interaction.options.getString('message');
           const embed = interaction.options.getString('embed');

           const [guild] = await Guild.findOrCreate({where: {serverId: await interaction.guild.id}});

           if (!message && !embed) {
               await guild.update({ welcomeMessage: null, welcomeEmbedId: null });
               return await interaction.reply('Removed the welcome message and embed.');
           } else if (message && !embed) {
               // Replace \n with actual newlines
               const formattedMessage = message.replace(/\\n/g, '\n');

               await guild.update({ welcomeMessage: formattedMessage });
               return interaction.reply({ content: `Welcome message has been set to:\n\`${formattedMessage}\`` });

           } else if (!message && embed) {
               const existingEmbed = await Embed.findOne({ where: { serverId: interaction.guild.id, embedName: embed } });
               if (!existingEmbed) {
                   return interaction.reply({ content: `The embed **${embed}** does not exist.`, ephemeral: true });
               }
               await guild.update({ welcomeEmbedId: existingEmbed.id });
               return await interaction.reply(`Welcome embed has been set to embed name: **${existingEmbed.embedName}**`);

           } else {
               // Replace \n with actual newlines
               const formattedMessage = message.replace(/\\n/g, '\n');
               await guild.update({ welcomeMessage: formattedMessage });

               const existingEmbed = await Embed.findOne({ where: { serverId: interaction.guild.id, embedName: embed } });
               if (!existingEmbed) {
                   return interaction.reply({ content: `The embed **${embed}** does not exist, but the welcome message has been set to:\n\`${formattedMessage}\`.`, ephemeral: true });
               }
               await guild.update({ welcomeEmbedId: existingEmbed.id });
               return await interaction.reply(`Welcome message has been set to:\n\`${formattedMessage}\`\n\nWelcome embed has been set to embed name: **${existingEmbed.embedName}**`);
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

            const welcomeMessage = guild.welcomeMessage;
            const welcomeEmbedId = guild.welcomeEmbedId;
            const welcomeChannel = await interaction.guild.channels.fetch(guild.welcomeChannelId)

            // Test welcome message only
            if (!welcomeMessage && !welcomeEmbedId) {
                return await interaction.reply(':x: No welcome message or embed has been set.');
            }

            if (welcomeMessage && !welcomeEmbedId) {
                const formattedMessage = welcomeMessage
                    .replace('{user}', `<@${interaction.user.id}>`)
                    .replace('{username}', interaction.user.username)
                    .replace('{tag}', interaction.user.tag)
                    .replace('{server}', interaction.guild.name)
                    .replace('{user_avatar}', interaction.user.displayAvatarURL({ dynamic: true }))
                    .replace('{server_avatar}', interaction.guild.iconURL({ dynamic: true }))
                    .replace('{server_members}', interaction.guild.memberCount);

                if (!guild.welcomeChannelId) {
                    return await interaction.reply(formattedMessage);
                } else {
                    await welcomeChannel.send(formattedMessage);
                    return await interaction.reply("Tested the welcome message.");
                }

            }

            // Test welcome embed only
            if (!welcomeMessage && welcomeEmbedId) {
                const welcomeEmbed = await Embed.findOne({ where: { id: welcomeEmbedId } });

                if (!welcomeEmbed) {
                    return await interaction.reply(':x: The embed associated with the welcome message no longer exists.');
                }

                if (!welcomeEmbed.isActive) {
                    return await interaction.reply(':x: The embed associated with the welcome message is not active.');
                }

                const embed = new EmbedBuilder()
                    .setAuthor({
                        name: welcomeEmbed.authorText ? welcomeEmbed.authorText
                                .replace('{user}', `<@${interaction.user.id}>`)
                                .replace('{username}', interaction.user.username)
                                .replace('{tag}', interaction.user.tag)
                                .replace('{server}', interaction.guild.name)
                                .replace('{server_members}', interaction.guild.memberCount): null,
                        iconURL: welcomeEmbed.authorImage ? welcomeEmbed.authorImage
                            .replace('{user_avatar}', interaction.user.displayAvatarURL({ dynamic: true }))
                            .replace('{server_avatar}', interaction.guild.iconURL({ dynamic: true })) : null
                    })
                    .setTitle(welcomeEmbed.title ? welcomeEmbed.title
                            .replace('{user}', `<@${interaction.user.id}>`)
                            .replace('{username}', interaction.user.username)
                            .replace('{tag}', interaction.user.tag)
                            .replace('{server}', interaction.guild.name)
                            .replace('{server_members}', interaction.guild.memberCount)
                                                    : null)
                    .setDescription(welcomeEmbed.description ? welcomeEmbed.description
                            .replace('{user}', `<@${interaction.user.id}>`)
                            .replace('{username}', interaction.user.username)
                            .replace('{tag}', interaction.user.tag)
                            .replace('{server}', interaction.guild.name)
                        .replace('{server_members}', interaction.guild.memberCount) : null)
                    .setThumbnail(welcomeEmbed.thumbnail === "{user_avatar}" ? interaction.user.displayAvatarURL({ dynamic: true }) :
                        welcomeEmbed.thumbnail === "{server_avatar}" ? interaction.guild.iconURL({ dynamic: true }) :
                            welcomeEmbed.thumbnail || null) // Handling thumbnail for both user avatar and server avatar placeholders
                    .setFooter({
                        text: welcomeEmbed.footerText ? welcomeEmbed.footerText
                                .replace('{user}', `<@${interaction.user.id}>`)
                                .replace('{username}', interaction.user.username)
                                .replace('{tag}', interaction.user.tag)
                                .replace('{server}', interaction.guild.name)
                            .replace('{server_members}', interaction.guild.memberCount) : null,
                        iconURL: welcomeEmbed.footerImage === "{user_avatar}" ? interaction.user.displayAvatarURL({ dynamic: true }) :
                            welcomeEmbed.footerImage === "{server_avatar}" ? interaction.guild.iconURL({ dynamic: true }) :
                                (welcomeEmbed.footerImage || null)
                    })
                    .setColor(welcomeEmbed.color || null)
                    .setImage(welcomeEmbed.image === "{user_avatar}" ? interaction.user.displayAvatarURL({ dynamic: true }) :
                        welcomeEmbed.image === "{server_avatar}" ? interaction.guild.iconURL({ dynamic: true }) :
                            welcomeEmbed.image || null); // Handling image for both user avatar and server avatar placeholders

                if (welcomeEmbed.timestamp) embed.setTimestamp();

                if (!guild.welcomeChannelId) {
                    return await interaction.reply({embeds: [embed]});
                } else {
                    await welcomeChannel.send({embeds: [embed]});
                    return await interaction.reply("Tested the welcome message.");
                }
            }

            // Test both welcome message and embed
            if (welcomeMessage && welcomeEmbedId) {
                const welcomeEmbed = await Embed.findOne({ where: { id: welcomeEmbedId } });

                if (!welcomeEmbed) {
                    return await interaction.reply(':x: The embed associated with the welcome message no longer exists.');
                }


                const formattedMessage = welcomeMessage
                    .replace('{user}', `<@${interaction.user.id}>`)
                    .replace('{username}', interaction.user.username)
                    .replace('{tag}', interaction.user.tag)
                    .replace('{server}', interaction.guild.name)
                    .replace('{user_avatar}', interaction.user.displayAvatarURL({ dynamic: true }))
                    .replace('{server_avatar}', interaction.guild.iconURL({ dynamic: true }))
                    .replace('{server_members}', interaction.guild.memberCount);


                const embed = new EmbedBuilder()
                    .setAuthor({
                        name: welcomeEmbed.authorText ? welcomeEmbed.authorText
                                .replace('{user}', `<@${interaction.user.id}>`)
                                .replace('{username}', interaction.user.username)
                                .replace('{tag}', interaction.user.tag)
                                .replace('{server}', interaction.guild.name)
                                .replace('{server_members}', interaction.guild.memberCount)
                            : null,
                        iconURL: welcomeEmbed.authorImage ? welcomeEmbed.authorImage
                            .replace('{user_avatar}', interaction.user.displayAvatarURL({ dynamic: true }))
                            .replace('{server_avatar}', interaction.guild.iconURL({ dynamic: true })) : null
                    })
                    .setTitle(welcomeEmbed.title ? welcomeEmbed.title
                            .replace('{user}', `<@${interaction.user.id}>`)
                            .replace('{username}', interaction.user.username)
                            .replace('{tag}', interaction.user.tag)
                            .replace('{server}', interaction.guild.name)
                            .replace('{server_members}', interaction.guild.memberCount)
                        : null)
                    .setDescription(welcomeEmbed.description ? welcomeEmbed.description
                            .replace('{user}', `<@${interaction.user.id}>`)
                            .replace('{username}', interaction.user.username)
                            .replace('{tag}', interaction.user.tag)
                            .replace('{server}', interaction.guild.name)
                            .replace('{server_members}', interaction.guild.memberCount)
                        : null)
                    .setThumbnail(welcomeEmbed.thumbnail === "{user_avatar}" ? interaction.user.displayAvatarURL({ dynamic: true }) :
                        welcomeEmbed.thumbnail === "{server_avatar}" ? interaction.guild.iconURL({ dynamic: true }) :
                            welcomeEmbed.thumbnail || null)
                    .setFooter({
                        text: welcomeEmbed.footerText ? welcomeEmbed.footerText
                                .replace('{user}', `<@${interaction.user.id}>`)
                                .replace('{username}', interaction.user.username)
                                .replace('{tag}', interaction.user.tag)
                                .replace('{server}', interaction.guild.name)
                                .replace('{server_members}', interaction.guild.memberCount): null,
                        iconURL: welcomeEmbed.footerImage === "{user_avatar}" ? interaction.user.displayAvatarURL({ dynamic: true }) :
                            welcomeEmbed.footerImage === "{server_avatar}" ? interaction.guild.iconURL({ dynamic: true }) :
                                (welcomeEmbed.footerImage || null)
                    })
                    .setColor(welcomeEmbed.color || null)
                    .setImage(welcomeEmbed.image === "{user_avatar}" ? interaction.user.displayAvatarURL({ dynamic: true }) :
                        welcomeEmbed.image === "{server_avatar}" ? interaction.guild.iconURL({ dynamic: true }) :
                            welcomeEmbed.image || null);

                if (welcomeEmbed.timestamp) embed.setTimestamp();


                if (!guild.welcomeChannelId) {
                    if (!welcomeEmbed.isActive) {
                        return await interaction.reply(`${formattedMessage}\n(The embed associated with the welcome message is not active.)`);
                    }
                    return await interaction.reply({ content: formattedMessage, embeds: [embed] });
                } else {
                    if (!welcomeEmbed.isActive) {
                        await welcomeChannel.send({ content: formattedMessage + '\n(The embed associated with the welcome message is not active.)'});
                        return await interaction.reply("Tested the welcome message.");
                    } else {
                        await welcomeChannel.send({ content: formattedMessage, embeds: [embed] });
                        return await interaction.reply("Tested the welcome message.");
                    }
                }


            }
        }

    },
};