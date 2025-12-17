

module.exports = (sequelize, Sequelize) => {
    return sequelize.define('GlobalUserLevel', {
        userId: {
            type: Sequelize.STRING(20),
            allowNull: false,
            primaryKey: true,
        },
        currentXp: {
            type: Sequelize.BIGINT,
            allowNull: false,
            defaultValue: 0,
        },
        totalXp: {
            type: Sequelize.BIGINT,
            allowNull: false,
            defaultValue: 0,
        },
        dailyXp: {
            type: Sequelize.BIGINT,
            allowNull: false,
            defaultValue: 0,
        },
        weeklyXp: {
            type: Sequelize.BIGINT,
            allowNull: false,
            defaultValue: 0,
        },
        monthlyXp: {
            type: Sequelize.BIGINT,
            allowNull: false,
            defaultValue: 0,
        },
        level: {
            type: Sequelize.BIGINT,
            allowNull: false,
            defaultValue: 1,
        },
        enabled: {
            type: Sequelize.BOOLEAN,
            allowNull: true,
        }
    });
}