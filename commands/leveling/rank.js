const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const {Level, XPSettings, Embed} = require('../../models')


module.exports = {
    data: new SlashCommandBuilder()
        .setName('rank')
        .setDescription('Check your rank and XP in the server.')
        .setDMPermission(false)
        .addUserOption(option => option
            .setName('user')
            .setDescription('The user to check the rank for (default is you).')
            .setRequired(false)),
    async execute(interaction) {
        const user = interaction.options.getUser('user') || interaction.user; // Use the mentioned user or the command issuer
        const serverId = interaction.guild.id;
        const userId = user.id




        const xpSettings = await XPSettings.findOne({
            where: { serverId: serverId }
        });
        if (!xpSettings) return interaction.reply(`This server doesn't have any XP settings set up.`);

        if (!xpSettings.enabled) {
            interaction.reply(`Leveling not enabled.`);
            return;
        }


        // Find the user's XP record in the database
        const userXP = await Level.findOne({
            where: { userId: user.id, serverId: serverId },
        });

        // If the user has no XP record
        if (!userXP) {
            return interaction.reply(`**${user.username}** has no XP data.`);
        }

        const usersXP = await Level.findAll({
            where: { serverId: serverId },
            order: [['totalXp', 'DESC']]
        });

        // Calculate the required XP for the current level
        const xpBase = xpSettings.baseXp;
        const xpIncrement = xpSettings.xpIncrement;
        const startingLevel = xpSettings.startingLevel;
        const currentLevel = userXP.level;
        const nextLevelXP = xpBase + (xpIncrement * (currentLevel - startingLevel));

        const rank = await usersXP.findIndex(user => user.userId === userId)+1;

        // Check if there's a custom rank message or embed in XP settings
        const rankMessage = xpSettings.rankMessage;
        const rankEmbedId = xpSettings.rankEmbedId;

        // Handle embed-only rank display
        if (rankEmbedId && !rankMessage) {
            const rankEmbed = await Embed.findOne({ where: { id: rankEmbedId } });
            
            if (!rankEmbed) {
                console.error(`Rank embed ${rankEmbedId} not found for server ${serverId}`);
                // Fallback to default message
                return interaction.reply(`**${user.username}'s Rank** in **${interaction.guild.name}**\n**Level:** ${userXP.level}\n**Current XP:** ${userXP.currentXp}/${nextLevelXP}\n**Total XP:** ${userXP.totalXp}\n**Rank:** #${rank}`);
            }

            if (!rankEmbed.isActive) {
                console.log(`Rank embed ${rankEmbedId} is not active for server ${serverId}`);
                // Fallback to default message
                return interaction.reply(`**${user.username}'s Rank** in **${interaction.guild.name}**\n**Level:** ${userXP.level}\n**Current XP:** ${userXP.currentXp}/${nextLevelXP}\n**Total XP:** ${userXP.totalXp}\n**Rank:** #${rank}`);
            }

            // Create embed with rank data
            const embed = new EmbedBuilder()
                .setAuthor({
                    name: rankEmbed.authorText ? rankEmbed.authorText
                            .replace('{user}', `<@${userId}>`)
                            .replace('{username}', user.username)
                            .replace('{tag}', user.tag)
                            .replace('{server}', interaction.guild.name)
                            .replace('{server_members}', interaction.guild.memberCount)
                            .replace('{level}', userXP.level)
                            .replace('{current_xp}', userXP.currentXp)
                            .replace('{total_xp}', userXP.totalXp)
                            .replace('{next_level_xp}', nextLevelXP)
                            .replace('{rank}', rank): null,
                    iconURL: rankEmbed.authorImage ? rankEmbed.authorImage
                        .replace('{user_avatar}', user.displayAvatarURL({ dynamic: true }))
                        .replace('{server_avatar}', interaction.guild.iconURL({ dynamic: true })) : null
                })
                .setTitle(rankEmbed.title ? rankEmbed.title
                        .replace('{user}', `<@${userId}>`)
                        .replace('{username}', user.username)
                        .replace('{tag}', user.tag)
                        .replace('{server}', interaction.guild.name)
                        .replace('{server_members}', interaction.guild.memberCount)
                        .replace('{level}', userXP.level)
                        .replace('{current_xp}', userXP.currentXp)
                        .replace('{total_xp}', userXP.totalXp)
                        .replace('{next_level_xp}', nextLevelXP)
                        .replace('{rank}', rank): null)
                .setDescription(rankEmbed.description ? rankEmbed.description
                        .replace('{user}', `<@${userId}>`)
                        .replace('{username}', user.username)
                        .replace('{tag}', user.tag)
                        .replace('{server}', interaction.guild.name)
                        .replace('{server_members}', interaction.guild.memberCount)
                        .replace('{level}', userXP.level)
                        .replace('{current_xp}', userXP.currentXp)
                        .replace('{total_xp}', userXP.totalXp)
                        .replace('{next_level_xp}', nextLevelXP)
                        .replace('{rank}', rank): null)
                .setThumbnail(rankEmbed.thumbnail === "{user_avatar}" ? user.displayAvatarURL({ dynamic: true }) :
                    rankEmbed.thumbnail === "{server_avatar}" ? interaction.guild.iconURL({ dynamic: true }) :
                        rankEmbed.thumbnail || null)
                .setFooter({
                    text: rankEmbed.footerText ? rankEmbed.footerText
                            .replace('{user}', `<@${userId}>`)
                            .replace('{username}', user.username)
                            .replace('{tag}', user.tag)
                            .replace('{server}', interaction.guild.name)
                            .replace('{server_members}', interaction.guild.memberCount)
                            .replace('{level}', userXP.level)
                            .replace('{current_xp}', userXP.currentXp)
                            .replace('{total_xp}', userXP.totalXp)
                            .replace('{next_level_xp}', nextLevelXP)
                            .replace('{rank}', rank): null,
                    iconURL: rankEmbed.footerImage === "{user_avatar}" ? user.displayAvatarURL({ dynamic: true }) :
                        rankEmbed.footerImage === "{server_avatar}" ? interaction.guild.iconURL({ dynamic: true }) :
                            (rankEmbed.footerImage || null)
                })
                .setColor(rankEmbed.color || null)
                .setImage(rankEmbed.image === "{user_avatar}" ? user.displayAvatarURL({ dynamic: true }) :
                    rankEmbed.image === "{server_avatar}" ? interaction.guild.iconURL({ dynamic: true }) :
                        rankEmbed.image || null);

            if (rankEmbed.timestamp) embed.setTimestamp();

            return interaction.reply({ embeds: [embed] });
        }

        // Handle message-only rank display
        if (rankMessage && !rankEmbedId) {
            const formattedMessage = rankMessage
                .replace('{user}', `<@${userId}>`)
                .replace('{username}', user.username)
                .replace('{tag}', user.tag)
                .replace('{server}', interaction.guild.name)
                .replace('{server_members}', interaction.guild.memberCount)
                .replace('{level}', userXP.level)
                .replace('{current_xp}', userXP.currentXp)
                .replace('{total_xp}', userXP.totalXp)
                .replace('{next_level_xp}', nextLevelXP)
                .replace('{rank}', rank);

            return interaction.reply(formattedMessage);
        }

        // Handle both message and embed
        if (rankMessage && rankEmbedId) {
            const rankEmbed = await Embed.findOne({ where: { id: rankEmbedId } });
            
            if (!rankEmbed) {
                console.error(`Rank embed ${rankEmbedId} not found for server ${serverId}`);
                // Fallback to message only
                const formattedMessage = rankMessage
                    .replace('{user}', `<@${userId}>`)
                    .replace('{username}', user.username)
                    .replace('{tag}', user.tag)
                    .replace('{server}', interaction.guild.name)
                    .replace('{server_members}', interaction.guild.memberCount)
                    .replace('{level}', userXP.level)
                    .replace('{current_xp}', userXP.currentXp)
                    .replace('{total_xp}', userXP.totalXp)
                    .replace('{next_level_xp}', nextLevelXP)
                    .replace('{rank}', rank);
                return interaction.reply(formattedMessage);
            }

            const formattedMessage = rankMessage
                .replace('{user}', `<@${userId}>`)
                .replace('{username}', user.username)
                .replace('{tag}', user.tag)
                .replace('{server}', interaction.guild.name)
                .replace('{server_members}', interaction.guild.memberCount)
                .replace('{level}', userXP.level)
                .replace('{current_xp}', userXP.currentXp)
                .replace('{total_xp}', userXP.totalXp)
                .replace('{next_level_xp}', nextLevelXP)
                .replace('{rank}', rank);

            if (!rankEmbed.isActive) {
                return interaction.reply(`${formattedMessage}\n(The embed associated with the rank message is not active.)`);
            }

            // Create embed with rank data
            const embed = new EmbedBuilder()
                .setAuthor({
                    name: rankEmbed.authorText ? rankEmbed.authorText
                            .replace('{user}', `<@${userId}>`)
                            .replace('{username}', user.username)
                            .replace('{tag}', user.tag)
                            .replace('{server}', interaction.guild.name)
                            .replace('{server_members}', interaction.guild.memberCount)
                            .replace('{level}', userXP.level)
                            .replace('{current_xp}', userXP.currentXp)
                            .replace('{total_xp}', userXP.totalXp)
                            .replace('{next_level_xp}', nextLevelXP)
                            .replace('{rank}', rank): null,
                    iconURL: rankEmbed.authorImage ? rankEmbed.authorImage
                        .replace('{user_avatar}', user.displayAvatarURL({ dynamic: true }))
                        .replace('{server_avatar}', interaction.guild.iconURL({ dynamic: true })) : null
                })
                .setTitle(rankEmbed.title ? rankEmbed.title
                        .replace('{user}', `<@${userId}>`)
                        .replace('{username}', user.username)
                        .replace('{tag}', user.tag)
                        .replace('{server}', interaction.guild.name)
                        .replace('{server_members}', interaction.guild.memberCount)
                        .replace('{level}', userXP.level)
                        .replace('{current_xp}', userXP.currentXp)
                        .replace('{total_xp}', userXP.totalXp)
                        .replace('{next_level_xp}', nextLevelXP)
                        .replace('{rank}', rank): null)
                .setDescription(rankEmbed.description ? rankEmbed.description
                        .replace('{user}', `<@${userId}>`)
                        .replace('{username}', user.username)
                        .replace('{tag}', user.tag)
                        .replace('{server}', interaction.guild.name)
                        .replace('{server_members}', interaction.guild.memberCount)
                        .replace('{level}', userXP.level)
                        .replace('{current_xp}', userXP.currentXp)
                        .replace('{total_xp}', userXP.totalXp)
                        .replace('{next_level_xp}', nextLevelXP)
                        .replace('{rank}', rank): null)
                .setThumbnail(rankEmbed.thumbnail === "{user_avatar}" ? user.displayAvatarURL({ dynamic: true }) :
                    rankEmbed.thumbnail === "{server_avatar}" ? interaction.guild.iconURL({ dynamic: true }) :
                        rankEmbed.thumbnail || null)
                .setFooter({
                    text: rankEmbed.footerText ? rankEmbed.footerText
                            .replace('{user}', `<@${userId}>`)
                            .replace('{username}', user.username)
                            .replace('{tag}', user.tag)
                            .replace('{server}', interaction.guild.name)
                            .replace('{server_members}', interaction.guild.memberCount)
                            .replace('{level}', userXP.level)
                            .replace('{current_xp}', userXP.currentXp)
                            .replace('{total_xp}', userXP.totalXp)
                            .replace('{next_level_xp}', nextLevelXP)
                            .replace('{rank}', rank): null,
                    iconURL: rankEmbed.footerImage === "{user_avatar}" ? user.displayAvatarURL({ dynamic: true }) :
                        rankEmbed.footerImage === "{server_avatar}" ? interaction.guild.iconURL({ dynamic: true }) :
                            (rankEmbed.footerImage || null)
                })
                .setColor(rankEmbed.color || null)
                .setImage(rankEmbed.image === "{user_avatar}" ? user.displayAvatarURL({ dynamic: true }) :
                    rankEmbed.image === "{server_avatar}" ? interaction.guild.iconURL({ dynamic: true }) :
                        rankEmbed.image || null);

            if (rankEmbed.timestamp) embed.setTimestamp();

            return interaction.reply({ content: formattedMessage, embeds: [embed] });
        }

        // Default fallback message
        return interaction.reply(`**${user.username}'s Rank** in **${interaction.guild.name}**\n**Level:** ${userXP.level}\n**Current XP:** ${userXP.currentXp}/${nextLevelXP}\n**Total XP:** ${userXP.totalXp}\n**Rank:** #${rank}
        `);
    },
};