const {Level, XPSettings} = require('../../models/');

async function removeXP(userId, serverId, xpToRemove) {
    const xpSettings = await XPSettings.findOne({
        where: { serverId }
    });

    if (!xpSettings) return;


    const xpBase = xpSettings.baseXp; // Base XP required for level 1
    const xpIncrement = xpSettings.xpIncrement; // Additional XP required per level
    const startingLevel = xpSettings.startingLevel;


    // Find or create the user's XP record
    const [userXP] = await Level.findOrCreate({
        where: { userId, serverId },
        defaults: { currentXp: 0, totalXp: 0, level: startingLevel },
    });

    const actualXPRemoved = Math.min(xpToRemove, userXP.totalXp);

    // Subtract XP
    userXP.totalXp -= actualXPRemoved;

    // Adjust currentXp based on actual XP removed
    if (userXP.currentXp >= actualXPRemoved) {
        userXP.currentXp -= actualXPRemoved;
    } else {
        // If currentXp is less than the XP to remove, calculate the overflow
        let overflow = actualXPRemoved - userXP.currentXp;
        userXP.currentXp = 0;

        // Handle level-down logic if overflow affects previous levels
        let currentLevel = userXP.level;
        let loopCount = 0;
        while (overflow > 0 && currentLevel > startingLevel) {
            currentLevel--;
            const requiredXpForPreviousLevel = xpBase + (xpIncrement * (currentLevel - startingLevel));

            if (overflow >= requiredXpForPreviousLevel) {
                overflow -= requiredXpForPreviousLevel;
            } else {
                userXP.currentXp = requiredXpForPreviousLevel - overflow;
                break;
            }

            loopCount++;
            if (loopCount % 10 === 0) {
                await new Promise(resolve => setImmediate(resolve)); // Yield to event loop
            }
        }

        userXP.level = currentLevel;
    }

    // Ensure currentXp doesn't exceed the maximum for the current level
    const maxCurrentXpForLevel = xpBase + (xpIncrement * (userXP.level - startingLevel)) - 1;
    if (userXP.currentXp > maxCurrentXpForLevel) {
        userXP.currentXp = maxCurrentXpForLevel;
    }

    // Save changes to the database
    await userXP.save();

    // Return the details for further processing if needed
    return {
        actualXPRemoved,
        newLevel: userXP.level,
        currentXP: userXP.currentXp,
    };
}

module.exports = removeXP;