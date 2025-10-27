
const {Level, XPSettings, LevelRoles, Embed} = require('../../models')
const {EmbedBuilder} = require('discord.js')

async function addXP(client, userId, serverId, xpToAdd, channel, isCommand) {
    const xpSettings = await XPSettings.findOne({
        where: { serverId },
    });

    if (!xpSettings) return;

    const xpBase = xpSettings.baseXp; // Base XP required for level 1
    const xpIncrement = xpSettings.xpIncrement; // Additional XP required per level
    const levelUpMessage = xpSettings.levelUpMessage ?? `{user}, you have reached **level {level}**. GG!`;
    const startingLevel = xpSettings.startingLevel;

    // Find or create the user's XP record
    const [userXP] = await Level.findOrCreate({
        where: { userId, serverId },
        defaults: { currentXp: 0, totalXp: 0, level: startingLevel },
    });

    // Fetch the guild by server ID
    const guild = await client.guilds.fetch(serverId);
    if (!guild) {
        console.error(`Guild with ID ${serverId} not found.`);
        return null;
    }

    // Fetch the guild member by user ID
    const member = await guild.members.fetch(userId);

    // Add the XP
    userXP.totalXp += xpToAdd;
    userXP.currentXp += xpToAdd;
    const addedXP = xpToAdd;


    // Check for level-ups
    let currentLevel = userXP.level;
    let nextLevelXP = xpBase + (xpIncrement * (currentLevel - startingLevel)); // Level 1 requires 100 XP, level 2 = 200 XP, level 3 = 300 XP, etc.

    // Fetch all role rewards for the server
    const roleRewards = await LevelRoles.findAll({
        where: { serverId: serverId },
        attributes: ['level', 'roleId'],
    });

    // Convert role rewards into a map for easy lookup
    const rewardMap = new Map(roleRewards.map((reward) => [reward.level, reward.roleId]));

    // Track roles to assign
    const newRoles = [];

    // Check if the user has enough XP to level up
    let loopCount = 0;
    while (userXP.currentXp >= nextLevelXP) {
        userXP.currentXp -= nextLevelXP;
        currentLevel++;
        nextLevelXP = xpBase + (xpIncrement * (currentLevel - startingLevel));

        if (rewardMap.has(currentLevel)) {
            newRoles.push(rewardMap.get(currentLevel));
        }

        // Yield to event loop every 10 iterations to prevent freezing
        loopCount++;
        if (loopCount % 10 === 0) {
            await new Promise(resolve => setImmediate(resolve));
        }
    }

    // Update the user's level if it has changed
    if (currentLevel > userXP.level) {
        userXP.level = currentLevel;
        await userXP.save();

        // Assign new roles
        for (const roleId of newRoles) {
            const role = guild.roles.cache.get(roleId);
            if (role && !member.roles.cache.has(roleId)) {
                await member.roles.add(role).catch(console.error);
            }
        }
        if (isCommand) return {
            addedXP,
            newLevel: userXP.level,
            currentXP: userXP.currentXp,
        };

        // Handle level up message with embed support
        const levelUpChannelId = xpSettings.levelUpChannelId;
        const levelUpEmbedId = xpSettings.levelUpEmbedId;
        
        // Determine which channel to send to
        const targetChannel = levelUpChannelId ? 
            await guild.channels.fetch(levelUpChannelId).catch(() => null) : 
            channel;
        
        if (!targetChannel) {
            console.error(`Level up channel ${levelUpChannelId} not found for server ${serverId}`);
            return;
        }

        // Handle embed-only level up
        if (levelUpEmbedId && !levelUpMessage) {
            const levelUpEmbed = await Embed.findOne({ where: { id: levelUpEmbedId } });
            
            if (!levelUpEmbed) {
                console.error(`Level up embed ${levelUpEmbedId} not found for server ${serverId}`);
                return;
            }

            if (!levelUpEmbed.isActive) {
                console.log(`Level up embed ${levelUpEmbedId} is not active for server ${serverId}`);
                return;
            }

            // Get user leveling data for embed placeholders
            const allUsers = await Level.findAll({
                where: { serverId: serverId },
                order: [['totalXp', 'DESC']]
            });
            const rank = allUsers.findIndex(user => user.userId === userId) + 1;
            const nextLevelXP = xpBase + (xpIncrement * (userXP.level - startingLevel));

            const embed = new EmbedBuilder()
                .setAuthor({
                    name: levelUpEmbed.authorText ? levelUpEmbed.authorText
                            .replace('{user}', `<@${userId}>`)
                            .replace('{username}', member.user.username)
                            .replace('{tag}', member.user.tag)
                            .replace('{server}', guild.name)
                            .replace('{server_members}', guild.memberCount)
                            .replace('{level}', userXP.level)
                            .replace('{current_xp}', userXP.currentXp)
                            .replace('{total_xp}', userXP.totalXp)
                            .replace('{next_level_xp}', nextLevelXP)
                            .replace('{rank}', rank): null,
                    iconURL: levelUpEmbed.authorImage ? levelUpEmbed.authorImage
                        .replace('{user_avatar}', member.user.displayAvatarURL({ dynamic: true }))
                        .replace('{server_avatar}', guild.iconURL({ dynamic: true })) : null
                })
                .setTitle(levelUpEmbed.title ? levelUpEmbed.title
                        .replace('{user}', `<@${userId}>`)
                        .replace('{username}', member.user.username)
                        .replace('{tag}', member.user.tag)
                        .replace('{server}', guild.name)
                        .replace('{server_members}', guild.memberCount)
                        .replace('{level}', userXP.level)
                        .replace('{current_xp}', userXP.currentXp)
                        .replace('{total_xp}', userXP.totalXp)
                        .replace('{next_level_xp}', nextLevelXP)
                        .replace('{rank}', rank): null)
                .setDescription(levelUpEmbed.description ? levelUpEmbed.description
                        .replace('{user}', `<@${userId}>`)
                        .replace('{username}', member.user.username)
                        .replace('{tag}', member.user.tag)
                        .replace('{server}', guild.name)
                        .replace('{server_members}', guild.memberCount)
                        .replace('{level}', userXP.level)
                        .replace('{current_xp}', userXP.currentXp)
                        .replace('{total_xp}', userXP.totalXp)
                        .replace('{next_level_xp}', nextLevelXP)
                        .replace('{rank}', rank): null)
                .setThumbnail(levelUpEmbed.thumbnail === "{user_avatar}" ? member.user.displayAvatarURL({ dynamic: true }) :
                    levelUpEmbed.thumbnail === "{server_avatar}" ? guild.iconURL({ dynamic: true }) :
                        levelUpEmbed.thumbnail || null)
                .setFooter({
                    text: levelUpEmbed.footerText ? levelUpEmbed.footerText
                            .replace('{user}', `<@${userId}>`)
                            .replace('{username}', member.user.username)
                            .replace('{tag}', member.user.tag)
                            .replace('{server}', guild.name)
                            .replace('{server_members}', guild.memberCount)
                            .replace('{level}', userXP.level)
                            .replace('{current_xp}', userXP.currentXp)
                            .replace('{total_xp}', userXP.totalXp)
                            .replace('{next_level_xp}', nextLevelXP)
                            .replace('{rank}', rank): null,
                    iconURL: levelUpEmbed.footerImage === "{user_avatar}" ? member.user.displayAvatarURL({ dynamic: true }) :
                        levelUpEmbed.footerImage === "{server_avatar}" ? guild.iconURL({ dynamic: true }) :
                            (levelUpEmbed.footerImage || null)
                })
                .setColor(levelUpEmbed.color || null)
                .setImage(levelUpEmbed.image === "{user_avatar}" ? member.user.displayAvatarURL({ dynamic: true }) :
                    levelUpEmbed.image === "{server_avatar}" ? guild.iconURL({ dynamic: true }) :
                        levelUpEmbed.image || null);

            if (levelUpEmbed.timestamp) embed.setTimestamp();

            return targetChannel.send({ embeds: [embed] });
        }

        // Handle message-only level up
        if (levelUpMessage && !levelUpEmbedId) {
            const formattedMessage = levelUpMessage
                .replace('{user}', `<@${userId}>`)
                .replace('{username}', member.user.username)
                .replace('{tag}', member.user.tag)
                .replace('{level}', userXP.level);

            return targetChannel.send(formattedMessage);
        }

        // Handle both message and embed
        if (levelUpMessage && levelUpEmbedId) {
            const levelUpEmbed = await Embed.findOne({ where: { id: levelUpEmbedId } });
            
            if (!levelUpEmbed) {
                console.error(`Level up embed ${levelUpEmbedId} not found for server ${serverId}`);
                // Fallback to message only
                const formattedMessage = levelUpMessage
                    .replace('{user}', `<@${userId}>`)
                    .replace('{username}', member.user.username)
                    .replace('{tag}', member.user.tag)
                    .replace('{level}', userXP.level);
                return targetChannel.send(formattedMessage);
            }

            const formattedMessage = levelUpMessage
                .replace('{user}', `<@${userId}>`)
                .replace('{username}', member.user.username)
                .replace('{tag}', member.user.tag)
                .replace('{level}', userXP.level);

            if (!levelUpEmbed.isActive) {
                return targetChannel.send(`${formattedMessage}\n(The embed associated with the level up message is not active.)`);
            }

            // Get user leveling data for embed placeholders
            const allUsers = await Level.findAll({
                where: { serverId: serverId },
                order: [['totalXp', 'DESC']]
            });
            const rank = allUsers.findIndex(user => user.userId === userId) + 1;
            const nextLevelXP = xpBase + (xpIncrement * (userXP.level - startingLevel));

            const embed = new EmbedBuilder()
                .setAuthor({
                    name: levelUpEmbed.authorText ? levelUpEmbed.authorText
                            .replace('{user}', `<@${userId}>`)
                            .replace('{username}', member.user.username)
                            .replace('{tag}', member.user.tag)
                            .replace('{server}', guild.name)
                            .replace('{server_members}', guild.memberCount)
                            .replace('{level}', userXP.level)
                            .replace('{current_xp}', userXP.currentXp)
                            .replace('{total_xp}', userXP.totalXp)
                            .replace('{next_level_xp}', nextLevelXP)
                            .replace('{rank}', rank): null,
                    iconURL: levelUpEmbed.authorImage ? levelUpEmbed.authorImage
                        .replace('{user_avatar}', member.user.displayAvatarURL({ dynamic: true }))
                        .replace('{server_avatar}', guild.iconURL({ dynamic: true })) : null
                })
                .setTitle(levelUpEmbed.title ? levelUpEmbed.title
                        .replace('{user}', `<@${userId}>`)
                        .replace('{username}', member.user.username)
                        .replace('{tag}', member.user.tag)
                        .replace('{server}', guild.name)
                        .replace('{server_members}', guild.memberCount)
                        .replace('{level}', userXP.level)
                        .replace('{current_xp}', userXP.currentXp)
                        .replace('{total_xp}', userXP.totalXp)
                        .replace('{next_level_xp}', nextLevelXP)
                        .replace('{rank}', rank): null)
                .setDescription(levelUpEmbed.description ? levelUpEmbed.description
                        .replace('{user}', `<@${userId}>`)
                        .replace('{username}', member.user.username)
                        .replace('{tag}', member.user.tag)
                        .replace('{server}', guild.name)
                        .replace('{server_members}', guild.memberCount)
                        .replace('{level}', userXP.level)
                        .replace('{current_xp}', userXP.currentXp)
                        .replace('{total_xp}', userXP.totalXp)
                        .replace('{next_level_xp}', nextLevelXP)
                        .replace('{rank}', rank): null)
                .setThumbnail(levelUpEmbed.thumbnail === "{user_avatar}" ? member.user.displayAvatarURL({ dynamic: true }) :
                    levelUpEmbed.thumbnail === "{server_avatar}" ? guild.iconURL({ dynamic: true }) :
                        levelUpEmbed.thumbnail || null)
                .setFooter({
                    text: levelUpEmbed.footerText ? levelUpEmbed.footerText
                            .replace('{user}', `<@${userId}>`)
                            .replace('{username}', member.user.username)
                            .replace('{tag}', member.user.tag)
                            .replace('{server}', guild.name)
                            .replace('{server_members}', guild.memberCount)
                            .replace('{level}', userXP.level)
                            .replace('{current_xp}', userXP.currentXp)
                            .replace('{total_xp}', userXP.totalXp)
                            .replace('{next_level_xp}', nextLevelXP)
                            .replace('{rank}', rank): null,
                    iconURL: levelUpEmbed.footerImage === "{user_avatar}" ? member.user.displayAvatarURL({ dynamic: true }) :
                        levelUpEmbed.footerImage === "{server_avatar}" ? guild.iconURL({ dynamic: true }) :
                            (levelUpEmbed.footerImage || null)
                })
                .setColor(levelUpEmbed.color || null)
                .setImage(levelUpEmbed.image === "{user_avatar}" ? member.user.displayAvatarURL({ dynamic: true }) :
                    levelUpEmbed.image === "{server_avatar}" ? guild.iconURL({ dynamic: true }) :
                        levelUpEmbed.image || null);

            if (levelUpEmbed.timestamp) embed.setTimestamp();

            return targetChannel.send({ content: formattedMessage, embeds: [embed] });
        }
    }

    // Save XP without a level-up
    await userXP.save();
    return {
        addedXP,
        newLevel: userXP.level,
        currentXP: userXP.currentXp,
    };

}

module.exports = addXP;