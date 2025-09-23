
module.exports = (sequelize, Sequelize) => {
    return sequelize.define('levelRoles', {
        roleId: {
            type: Sequelize.STRING,
            primaryKey: true,
        },
        roleName: {
            type: Sequelize.STRING,
            allowNull: false,
        },
        serverId: {
            type: Sequelize.STRING,
            allowNull: false
        },
        level: {
            type: Sequelize.INTEGER,
            allowNull: false,
        },
    });
}