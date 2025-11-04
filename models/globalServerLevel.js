

module.exports = (sequelize, Sequelize) => {
    return sequelize.define('GlobalServerLevel', {
        serverId: {
            type: Sequelize.STRING(20),
            allowNull: false,
            primaryKey: true,
        },
        standardizedXp: {
            type: Sequelize.BIGINT,
            allowNull: false,
            defaultValue: 0,
        },
        rawXp: {
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

        enabled: {
            type: Sequelize.BOOLEAN,
            allowNull: true,
        }
    });
}