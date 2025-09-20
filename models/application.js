module.exports = (sequelize, Sequelize) => {
    return sequelize.define('application', {
        id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        serverId: {
            type: Sequelize.STRING,
            allowNull: false
        },
        userId: {
            type: Sequelize.STRING,
            allowNull: false
        },
        channelId: {
            type: Sequelize.STRING,
            allowNull: false
        },
        confirmationId: {
            type: Sequelize.STRING,
            allowNull: false
        },
        response: {
            type: Sequelize.JSON,
            allowNull: false
        },
        status: {
            type: Sequelize.ENUM('pending', 'accepted', 'denied'),
            defaultValue: 'pending',
        },
    }, {
        timestamps: true,
    });
}