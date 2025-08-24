const {Guild} = require('../../models/')

module.exports = {
    name: 'guildMemberRemove',
    once: false,
    async execute(member) {
        // This function will be called whenever a member leaves a server
        console.log(`${member.user.tag} left ${member.guild.name}`);

        const guild = await Guild.findOne({where: {serverId: await member.guild.id}});

        if (!guild) return console.log(`${member.guild.name} does not exist in the server table`);

        if (!guild.leaveChannelId) return console.log(`${member.guild.name} does not have a leave channel`);
        if (!guild.leaveMessage && !guild.leaveEmbedId) return console.log(`${member.guild.name} does not have a leave message`);
        // Test leave message only

        if (guild.leaveMessage && !guild.leaveEmbedId) {
            const leaveChannel = await member.guild.channels.fetch(guild.leaveChannelId)
            const formattedMessage = guild.leaveMessage
                .replace('{user}', `<@${member.user.id}>`)
                .replace('{username}', member.user.username)
                .replace('{tag}', member.user.tag)
                .replace('{server}', member.guild.name)
                .replace('{user_avatar}', member.user.displayAvatarURL({ dynamic: true })) // Replacing placeholder with user avatar URL
                .replace('{server_icon}', member.guild.iconURL({ dynamic: true })) // Replacing placeholder with server icon URL
                .replace('{server_avatar}', member.guild.iconURL({ dynamic: true })); // Handling the server avatar placeholder

            return await leaveChannel.send(formattedMessage);
        }

        // Test leave embed only
        if (!guild.leaveMessage && guild.leaveEmbedId) {
            const leaveChannel = await member.guild.channels.fetch(guild.leaveChannelId)

            const leaveEmbed = await Embed.findOne({ where: { id: guild.leaveEmbedId } });

            if (!leaveEmbed) {
                console.log(`The embed associated with the leave message in ${member.guild} no longer exists.`);
                return leaveChannel.send("Error: The embed associated with the leave message no longer exists.")
            }

            if (!leaveEmbed.isActive) {
                return await leaveChannel.send('The embed associated with the leave message is not active.');
            }

            const embed = new EmbedBuilder()
                .setAuthor({
                    name: leaveEmbed.authorText ? leaveEmbed.authorText
                        .replace('{user}', `<@${member.user.id}>`)
                        .replace('{username}', member.user.username)
                        .replace('{tag}', member.user.tag)
                        .replace('{server}', member.guild.name)
                        .replace('{server_members}', member.guild.memberCount) : null,
                    iconURL: leaveEmbed.authorImage
                        .replace('{user_avatar}', member.user.displayAvatarURL({ dynamic: true }))
                        .replace('{server_avatar}', member.guild.iconURL({ dynamic: true })) || null
                })
                .setTitle(leaveEmbed.title ? leaveEmbed.title
                        .replace('{user}', `<@${member.user.id}>`)
                        .replace('{username}', member.user.username)
                        .replace('{tag}', member.user.tag)
                        .replace('{server}', member.guild.name)
                        .replace('{server_members}', member.guild.memberCount)
                    : null)
                .setDescription(leaveEmbed.description ? leaveEmbed.description
                        .replace('{user}', `<@${member.user.id}>`)
                        .replace('{username}', member.user.username)
                        .replace('{tag}', member.user.tag)
                        .replace('{server}', member.guild.name)
                        .replace('{server_members}', member.guild.memberCount)
                    : null)
                .setThumbnail(leaveEmbed.thumbnail === "{user_avatar}" ? member.user.displayAvatarURL({ dynamic: true }) :
                    leaveEmbed.thumbnail === "{server_avatar}" ? member.guild.iconURL({ dynamic: true }) :
                        leaveEmbed.thumbnail || null) // Handling thumbnail for both user avatar and server avatar placeholders
                .setFooter({
                    text: leaveEmbed.footerText ? leaveEmbed.footerText
                            .replace('{user}', `<@${member.user.id}>`)
                            .replace('{username}', member.user.username)
                            .replace('{tag}', member.user.tag)
                            .replace('{server}', member.guild.name)
                            .replace('{server_members}', member.guild.memberCount)
                        : null,
                    iconURL: leaveEmbed.footerImage === "{user_avatar}" ? member.user.displayAvatarURL({ dynamic: true }) :
                        leaveEmbed.footerImage === "{server_avatar}" ? member.guild.iconURL({ dynamic: true }) :
                            (leaveEmbed.footerImage || null)
                })
                .setColor(leaveEmbed.color || null)
                .setImage(leaveEmbed.image === "{user_avatar}" ? member.user.displayAvatarURL({ dynamic: true }) :
                    leaveEmbed.image === "{server_avatar}" ? member.guild.iconURL({ dynamic: true }) :
                        leaveEmbed.image || null); // Handling image for both user avatar and server avatar placeholders

            if (leaveEmbed.timestamp) embed.setTimestamp();

            return await leaveChannel.send({ embeds: [embed] });
        }

        // Test both leave message and embed
        if (guild.leaveMessage && guild.leaveEmbedId) {
            const leaveChannel = await member.guild.channels.fetch(guild.leaveChannelId)

            const leaveEmbed = await Embed.findOne({ where: { id: guild.leaveEmbedId } });

            if (!leaveEmbed) {
                console.log(`The embed associated with the leave message in ${member.guild} no longer exists.`);
                return leaveChannel.send("Error: The embed associated with the leave message no longer exists.")
            }

            const formattedMessage = guild.leaveMessage
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
                    name: leaveEmbed.authorText ? leaveEmbed.authorText
                        .replace('{user}', `<@${member.user.id}>`)
                        .replace('{username}', member.user.username)
                        .replace('{tag}', member.user.tag)
                        .replace('{server}', member.guild.name)
                        .replace('{server_members}', member.guild.memberCount): null,
                    iconURL: leaveEmbed.authorImage
                        .replace('{user_avatar}', member.user.displayAvatarURL({ dynamic: true }))
                        .replace('{server_avatar}', member.guild.iconURL({ dynamic: true })) || null
                })
                .setTitle(leaveEmbed.title ? leaveEmbed.title
                    .replace('{user}', `<@${member.user.id}>`)
                    .replace('{username}', member.user.username)
                    .replace('{tag}', member.user.tag)
                    .replace('{server}', member.guild.name)
                    .replace('{server_members}', member.guild.memberCount): null)
                .setDescription(leaveEmbed.description ? leaveEmbed.description
                    .replace('{user}', `<@${member.user.id}>`)
                    .replace('{username}', member.user.username)
                    .replace('{tag}', member.user.tag)
                    .replace('{server}', member.guild.name)
                    .replace('{server_members}', member.guild.memberCount) : null)
                .setThumbnail(leaveEmbed.thumbnail === "{user_avatar}" ? member.user.displayAvatarURL({ dynamic: true }) :
                    leaveEmbed.thumbnail === "{server_avatar}" ? member.guild.iconURL({ dynamic: true }) :
                        leaveEmbed.thumbnail || null)
                .setFooter({
                    text: leaveEmbed.footerText ? leaveEmbed.footerText
                        .replace('{user}', `<@${member.user.id}>`)
                        .replace('{username}', member.user.username)
                        .replace('{tag}', member.user.tag)
                        .replace('{server}', member.guild.name)
                        .replace('{server_members}', member.guild.memberCount): null,
                    iconURL: leaveEmbed.footerImage === "{user_avatar}" ? member.user.displayAvatarURL({ dynamic: true }) :
                        leaveEmbed.footerImage === "{server_avatar}" ? member.guild.iconURL({ dynamic: true }) :
                            (leaveEmbed.footerImage || null)
                })
                .setColor(leaveEmbed.color || null)
                .setImage(leaveEmbed.image === "{user_avatar}" ? member.user.displayAvatarURL({ dynamic: true }) :
                    leaveEmbed.image === "{server_avatar}" ? member.guild.iconURL({ dynamic: true }) :
                        leaveEmbed.image || null);
            if (leaveEmbed.timestamp) embed.setTimestamp();


            if (!leaveEmbed.isActive) {
                await leaveChannel.send({ content: formattedMessage + '\n(The embed associated with the welcome message is not active.)'});
            } else {
                await leaveChannel.send({ content: formattedMessage, embeds: [embed] });
            }
        }

    },
};