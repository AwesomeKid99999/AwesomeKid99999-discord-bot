
module.exports = (sequelize, Sequelize) => {
    return sequelize.define('economy', {
        id: {
            type: Sequelize.BIGINT.UNSIGNED,
            primaryKey: true,
            autoIncrement: true
        },
        userId: {
            type: Sequelize.STRING(20),
            allowNull: false,
        },
        serverId: {
            type: Sequelize.STRING(20),
            allowNull: false,
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

    });
}