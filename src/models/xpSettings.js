

module.exports = (sequelize, Sequelize) => {
    return sequelize.define('XPSettings', {
        serverId: {
            type: Sequelize.STRING(20),
            primaryKey: true,
        },
        minXP: {
            type: Sequelize.BIGINT,
            defaultValue: 25,
        },
        maxXP: {
            type: Sequelize.BIGINT,
            defaultValue: 50,
        },
        multiplier: {
            type: Sequelize.DOUBLE,
            defaultValue: 1.0, // Default multiplier
        },
        cooldown: {
            type: Sequelize.INTEGER,
            defaultValue: 60,
        },
        effortBooster: {
            type: Sequelize.BOOLEAN,
            defaultValue: false,
        },
        effortBoosterMultiplier: {
            type: Sequelize.FLOAT,
            defaultValue: 0,
            allowNull: false,
        },
        baseXp: {
            type: Sequelize.INTEGER,
            allowNull: false,
            defaultValue: 100, // Default base XP
        },
        xpIncrement: {
            type: Sequelize.INTEGER,
            allowNull: false,
            defaultValue: 100, // Default increment for each level
        },
        startingLevel: {
            type: Sequelize.INTEGER,
            allowNull: false,
            defaultValue: 1,
        },
        levelUpMessage: {
            type: Sequelize.STRING,
            allowNull: true,
        },
        levelUpChannelId: {
            type: Sequelize.STRING,
            allowNull: true,
        },
        levelUpEmbedId: {
            type: Sequelize.INTEGER,
            allowNull: true,
        },
        rankMessage: {
            type: Sequelize.STRING,
            allowNull: true,
        },
        rankEmbedId: {
            type: Sequelize.INTEGER,
            allowNull: true,
        },

        enabled: {
            type: Sequelize.BOOLEAN,
            allowNull: true,
        },

    });
}

