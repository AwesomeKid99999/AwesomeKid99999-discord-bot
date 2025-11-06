const {Level, XPSettings} = require('../../models')

// Helper function to get user leveling data
async function getUserLevelingData(userId, serverId) {
    try {
        const xpSettings = await XPSettings.findOne({
            where: { serverId: serverId }
        });
        
        if (!xpSettings || !xpSettings.enabled) {
            return null;
        }

        const userXP = await Level.findOne({
            where: { userId: userId, serverId: serverId },
        });

        if (!userXP) {
            return {
                level: xpSettings.startingLevel,
                currentXp: 0,
                totalXp: 0,
                nextLevelXp: xpSettings.baseXp,
                rank: 0
            };
        }

        // Calculate rank
        const allUsers = await Level.findAll({
            where: { serverId: serverId },
            order: [['totalXp', 'DESC']]
        });
        const rank = allUsers.findIndex(user => user.userId === userId) + 1;

        // Calculate next level XP
        const xpBase = xpSettings.baseXp;
        const xpIncrement = xpSettings.xpIncrement;
        const startingLevel = xpSettings.startingLevel;
        const currentLevel = userXP.level;
        const nextLevelXP = xpBase + (xpIncrement * (currentLevel - startingLevel));

        return {
            level: userXP.level,
            currentXp: userXP.currentXp,
            totalXp: userXP.totalXp,
            nextLevelXp: nextLevelXP,
            rank: rank
        };
    } catch (error) {
        console.error('Error getting user leveling data:', error);
        return null;
    }
}

module.exports = { getUserLevelingData };