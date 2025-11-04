
module.exports = (sequelize, Sequelize) => {
    return sequelize.define('birthday', {
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
        year: {
            type: Sequelize.BIGINT,
            allowNull: true,
            defaultValue: 0,
        },
        month: {
            type: Sequelize.TINYINT,
            allowNull: false,
        },
        day: {
            type: Sequelize.TINYINT,
            allowNull: false,
        },
        showAge: {
            type: Sequelize.BOOLEAN,
            allowNull: true,
            defaultValue: false,
        }
    });
}