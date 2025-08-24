
const {Level, XPSettings, LevelRoles} = require('../../models')

async function addXP(client, userId, serverId, xpToAdd, channel, isCommand) {
    const xpSettings = await XPSettings.findOne({
        where: { serverId },
    });

    if (!xpSettings) return;

    const xpBase = xpSettings.baseXp; // Base XP required for level 1
    const xpIncrement = xpSettings.xpIncrement; // Additional XP required per level
    const levelUpMessage = xpSettings.levelUpMessage;
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

        return channel.send(levelUpMessage
            .replace('{user}', `<@${userId}>`) // Mention the user
            .replace('{username}', member.user.username) // Username of the user
            .replace('{tag}', member.user.tag) // Full tag of the user (e.g., "User#1234")
            .replace('{level}', userXP.level) // Current level
        );
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