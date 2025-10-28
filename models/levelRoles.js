
module.exports = (sequelize, Sequelize) => {
    return sequelize.define('levelRoles', {
        roleId: {
            type: Sequelize.STRING(20),
            primaryKey: true,
        },
        roleName: {
            type: Sequelize.STRING(100),
            allowNull: false,
        },
        serverId: {
            type: Sequelize.STRING(20),
            allowNull: false
        },
        level: {
            type: Sequelize.BIGINT,
            allowNull: false,
        },
    });
}