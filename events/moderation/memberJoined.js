const {Guild, Embed} = require('../../models/')
const {EmbedBuilder} = require("discord.js");

module.exports = {
    name: 'guildMemberAdd',
    once: false,
    async execute(member) {
        // This function will be called whenever a member leaves a server
        console.log(`${member.user.tag} joined ${member.guild.name}`);
        const guild = await Guild.findOne({where: {serverId: await member.guild.id}});

        if (!guild) return console.log(`${member.guild.name} does not exist in the server table`);


        if (!guild.welcomeChannelId) return console.log(`${member.guild.name} does not have a welcome channel`);
        if (!guild.welcomeMessage && !guild.welcomeEmbedId) return console.log(`${member.guild.name} does not have a welcome message`);
        // Test welcome message only

        if (guild.welcomeMessage && !guild.welcomeEmbedId) {
            const welcomeChannel = await member.guild.channels.fetch(guild.welcomeChannelId)
            const formattedMessage = guild.welcomeMessage
                .replace('{user}', `<@${member.user.id}>`)
                .replace('{username}', member.user.username)
                .replace('{tag}', member.user.tag)
                .replace('{server}', member.guild.name)
                .replace('{user_avatar}', member.user.displayAvatarURL({ dynamic: true })) // Replacing placeholder with user avatar URL
                .replace('{server_icon}', member.guild.iconURL({ dynamic: true })) // Replacing placeholder with server icon URL
                .replace('{server_avatar}', member.guild.iconURL({ dynamic: true })); // Handling the server avatar placeholder

            return await welcomeChannel.send(formattedMessage);
        }

        // Test welcome embed only
        if (!guild.welcomeMessage && guild.welcomeEmbedId) {
            const welcomeChannel = await member.guild.channels.fetch(guild.welcomeChannelId)

            const welcomeEmbed = await Embed.findOne({ where: { id: guild.welcomeEmbedId } });

            if (!welcomeEmbed) {
                 console.log(`The embed associated with the welcome message in ${member.guild} no longer exists.`);
                return welcomeChannel.send("Error: The embed associated with the welcome message no longer exists.")
            }

            if (!welcomeEmbed.isActive) {
                return await welcomeChannel.send('The embed associated with the welcome message is not active.');
            }

            const embed = new EmbedBuilder()
                .setAuthor({
                    name: welcomeEmbed.authorText ? welcomeEmbed.authorText
                        .replace('{user}', `<@${member.user.id}>`)
                        .replace('{username}', member.user.username)
                        .replace('{tag}', member.user.tag)
                        .replace('{server}', member.guild.name)
                        .replace('{server_members}', member.guild.memberCount) : null,
                    iconURL: welcomeEmbed.authorImage
                        .replace('{user_avatar}', member.user.displayAvatarURL({ dynamic: true }))
                        .replace('{server_avatar}', member.guild.iconURL({ dynamic: true })) || null
                })
                .setTitle(welcomeEmbed.title ? welcomeEmbed.title
                        .replace('{user}', `<@${member.user.id}>`)
                        .replace('{username}', member.user.username)
                        .replace('{tag}', member.user.tag)
                        .replace('{server}', member.guild.name)
                        .replace('{server_members}', member.guild.memberCount)
                    : null)
                .setDescription(welcomeEmbed.description ? welcomeEmbed.description
                        .replace('{user}', `<@${member.user.id}>`)
                        .replace('{username}', member.user.username)
                        .replace('{tag}', member.user.tag)
                        .replace('{server}', member.guild.name)
                        .replace('{server_members}', member.guild.memberCount)
                    : null)
                .setThumbnail(welcomeEmbed.thumbnail === "{user_avatar}" ? member.user.displayAvatarURL({ dynamic: true }) :
                    welcomeEmbed.thumbnail === "{server_avatar}" ? member.guild.iconURL({ dynamic: true }) :
                        welcomeEmbed.thumbnail || null) // Handling thumbnail for both user avatar and server avatar placeholders
                .setFooter({
                    text: welcomeEmbed.footerText ? welcomeEmbed.footerText
                            .replace('{user}', `<@${member.user.id}>`)
                            .replace('{username}', member.user.username)
                            .replace('{tag}', member.user.tag)
                            .replace('{server}', member.guild.name)
                            .replace('{server_members}', member.guild.memberCount)
                        : null,
                    iconURL: welcomeEmbed.footerImage === "{user_avatar}" ? member.user.displayAvatarURL({ dynamic: true }) :
                        welcomeEmbed.footerImage === "{server_avatar}" ? member.guild.iconURL({ dynamic: true }) :
                            (welcomeEmbed.footerImage || null)
                })
                .setColor(welcomeEmbed.color || null)
                .setImage(welcomeEmbed.image === "{user_avatar}" ? member.user.displayAvatarURL({ dynamic: true }) :
                    welcomeEmbed.image === "{server_avatar}" ? member.guild.iconURL({ dynamic: true }) :
                        welcomeEmbed.image || null); // Handling image for both user avatar and server avatar placeholders

            if (welcomeEmbed.timestamp) embed.setTimestamp();

            return await welcomeChannel.send({ embeds: [embed] });
        }

        // Test both welcome message and embed
        if (guild.welcomeMessage && guild.welcomeEmbedId) {
            const welcomeChannel = await member.guild.channels.fetch(guild.welcomeChannelId)

            const welcomeEmbed = await Embed.findOne({ where: { id: guild.welcomeEmbedId } });

            if (!welcomeEmbed) {
                console.log(`The embed associated with the welcome message in ${member.guild} no longer exists.`);
                return welcomeChannel.send("Error: The embed associated with the welcome message no longer exists.")
            }



            const formattedMessage = guild.welcomeMessage
                .replace('{user}', `<@${member.user.id}>`)
                .replace('{username}', member.user.username)
                .replace('{tag}', member.user.tag)
                .replace('{server}', member.guild.name)
                .replace('{user_avatar}', member.user.displayAvatarURL({ dynamic: true }))
                .replace('{server_icon}', member.guild.iconURL({ dynamic: true }))
                .replace('{server_avatar}', member.guild.iconURL({ dynamic: true })) // Replacing the server avatar placeholder
                .replace('{server_members}', member.guild.memberCount);
            const embed = new EmbedBuilder()
                .setAuthor({
                    name: welcomeEmbed.authorText ? welcomeEmbed.authorText
                            .replace('{user}', `<@${member.user.id}>`)
                            .replace('{username}', member.user.username)
                            .replace('{tag}', member.user.tag)
                            .replace('{server}', member.guild.name)
                            .replace('{server_members}', member.guild.memberCount): null,
                    iconURL: welcomeEmbed.authorImage
                        .replace('{user_avatar}', member.user.displayAvatarURL({ dynamic: true }))
                        .replace('{server_avatar}', member.guild.iconURL({ dynamic: true })) || null
                })
                .setTitle(welcomeEmbed.title ? welcomeEmbed.title
                        .replace('{user}', `<@${member.user.id}>`)
                        .replace('{username}', member.user.username)
                        .replace('{tag}', member.user.tag)
                        .replace('{server}', member.guild.name)
                        .replace('{server_members}', member.guild.memberCount): null)
                .setDescription(welcomeEmbed.description ? welcomeEmbed.description
                        .replace('{user}', `<@${member.user.id}>`)
                        .replace('{username}', member.user.username)
                        .replace('{tag}', member.user.tag)
                        .replace('{server}', member.guild.name)
                        .replace('{server_members}', member.guild.memberCount) : null)
                .setThumbnail(welcomeEmbed.thumbnail === "{user_avatar}" ? member.user.displayAvatarURL({ dynamic: true }) :
                    welcomeEmbed.thumbnail === "{server_avatar}" ? member.guild.iconURL({ dynamic: true }) :
                        welcomeEmbed.thumbnail || null)
                .setFooter({
                    text: welcomeEmbed.footerText ? welcomeEmbed.footerText
                        .replace('{user}', `<@${member.user.id}>`)
                        .replace('{username}', member.user.username)
                        .replace('{tag}', member.user.tag)
                        .replace('{server}', member.guild.name)
                        .replace('{server_members}', member.guild.memberCount): null,
                    iconURL: welcomeEmbed.footerImage === "{user_avatar}" ? member.user.displayAvatarURL({ dynamic: true }) :
                        welcomeEmbed.footerImage === "{server_avatar}" ? member.guild.iconURL({ dynamic: true }) :
                            (welcomeEmbed.footerImage || null)
                })
                .setColor(welcomeEmbed.color || null)
                .setImage(welcomeEmbed.image === "{user_avatar}" ? member.user.displayAvatarURL({ dynamic: true }) :
                    welcomeEmbed.image === "{server_avatar}" ? member.guild.iconURL({ dynamic: true }) :
                        welcomeEmbed.image || null);
            if (welcomeEmbed.timestamp) embed.setTimestamp();


                if (!welcomeEmbed.isActive) {
                    await welcomeChannel.send({ content: formattedMessage + '\n(The embed associated with the welcome message is not active.)'});
                } else {
                    await welcomeChannel.send({ content: formattedMessage, embeds: [embed] });
                }

        }


    },
};