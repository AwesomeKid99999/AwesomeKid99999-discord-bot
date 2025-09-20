

module.exports = (sequelize, Sequelize) => {
    return sequelize.define('staffRoles', {
        roleId: {
            type: Sequelize.STRING,
            primaryKey: true,
        },
        serverId: {
            type: Sequelize.STRING,
            allowNull: false
        },
        roleName: {
            type: Sequelize.STRING,
            allowNull: false,
        },
    });
}