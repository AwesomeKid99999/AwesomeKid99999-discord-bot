// export function that defines commandToggle model
module.exports = (sequelize, Sequelize) => {
    return sequelize.define('commandToggle', {
        id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        serverId: {
            type: Sequelize.STRING(20),
            allowNull: false,
            unique: 'unique_toggle'
        },
        commandName: {
            type: Sequelize.STRING(98),
            allowNull: false,
            unique: 'unique_toggle'
        },
        enabled: {
            type: Sequelize.BOOLEAN,
            allowNull: false,
            defaultValue: true
        }
    });
};
