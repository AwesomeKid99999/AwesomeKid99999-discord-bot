
module.exports = (sequelize, Sequelize) => {
    return sequelize.define('globalServerEconomy', {
        serverId: {
            type: Sequelize.STRING(20),
            allowNull: false,
            primaryKey: true,
        },
        wallet: {
            type: Sequelize.BIGINT,
            allowNull: false,
            defaultValue: 0,
        },
        bank: {
            type: Sequelize.BIGINT,
            allowNull: false,
            defaultValue: 0,
        },
        totalMoney: {
            type: Sequelize.BIGINT,
            allowNull: false,
            defaultValue: 0,
        },
        dailyMoney: {
            type: Sequelize.BIGINT,
            allowNull: false,
            defaultValue: 0,
        },
        weeklyMoney: {
            type: Sequelize.BIGINT,
            allowNull: false,
            defaultValue: 0,
        },
        monthlyMoney: {
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