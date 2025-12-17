
module.exports = (sequelize, Sequelize) => {
    return sequelize.define('customRoles', {
        roleId: {
            type: Sequelize.STRING(20),
            primaryKey: true,
        },
        serverId: {
            type: Sequelize.STRING(20),
            allowNull: false
        },
        roleName: {
            type: Sequelize.STRING(100),
            allowNull: false,
        },
    });
}