
module.exports = (sequelize, Sequelize) => {
    return sequelize.define('economy', {
        id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        userId: {
            type: Sequelize.STRING,
            allowNull: false,
        },
        serverId: {
            type: Sequelize.STRING,
            allowNull: false,
        },
        wallet: {
            type: Sequelize.INTEGER,
            allowNull: false,
            defaultValue: 0,
        },
        bank: {
            type: Sequelize.INTEGER,
            allowNull: false,
            defaultValue: 0,
        },
        totalMoney: {
            type: Sequelize.INTEGER,
            allowNull: false,
            defaultValue: 0,
        },

    });
}