

module.exports = (sequelize, Sequelize) => {
    return sequelize.define('level', {
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
        level: {
            type: Sequelize.BIGINT,
            allowNull: false,
            defaultValue: 1,
        },

    });
}