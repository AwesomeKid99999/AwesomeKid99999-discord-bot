

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
            type: Sequelize.BIGINT.UNSIGNED,
            allowNull: false,
            defaultValue: 100, // Default base XP
        },
        xpIncrement: {
            type: Sequelize.BIGINT.UNSIGNED,
            allowNull: false,
            defaultValue: 100, // Default increment for each level
        },
        startingLevel: {
            type: Sequelize.BIGINT,
            allowNull: false,
            defaultValue: 1,
        },
        levelUpMessage: {
            type: Sequelize.STRING(1000),
            allowNull: true,
        },
        levelUpChannelId: {
            type: Sequelize.STRING(20),
            allowNull: true,
        },
        levelUpEmbedId: {
            type: Sequelize.BIGINT.UNSIGNED,
            allowNull: true,
        },
        rankMessage: {
            type: Sequelize.STRING(1000),
            allowNull: true,
        },
        rankEmbedId: {
            type: Sequelize.BIGINT.UNSIGNED,
            allowNull: true,
        },

        enabled: {
            type: Sequelize.BOOLEAN,
            allowNull: true,
        },

    });
}

