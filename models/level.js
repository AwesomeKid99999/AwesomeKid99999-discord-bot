

module.exports = (sequelize, Sequelize) => {
    return sequelize.define('level', {
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
        currentXp: {
            type: Sequelize.INTEGER,
            allowNull: false,
            defaultValue: 0,
        },
        totalXp: {
            type: Sequelize.INTEGER,
            allowNull: false,
            defaultValue: 0,
        },
        level: {
            type: Sequelize.INTEGER,
            allowNull: false,
            defaultValue: 1,
        },

    });
}