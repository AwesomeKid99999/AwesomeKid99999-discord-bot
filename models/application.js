module.exports = (sequelize, Sequelize) => {
    return sequelize.define('application', {
        id: {
            type: Sequelize.BIGINT.UNSIGNED,
            primaryKey: true,
            autoIncrement: true
        },
        serverId: {
            type: Sequelize.STRING(20),
            allowNull: false
        },
        userId: {
            type: Sequelize.STRING(20),
            allowNull: false
        },
        channelId: {
            type: Sequelize.STRING(20),
            allowNull: false
        },
        confirmationId: { // Sent application ID
            type: Sequelize.STRING(20),
            allowNull: false
        },
        applicationType: {
            type: Sequelize.STRING(50),
            allowNull: false
        },
        response: {
            type: Sequelize.JSON,
            allowNull: false
        },
        applicationToggle: {
            type: Sequelize.BOOLEAN,
            allowNull: true
        },
        status: {
            type: Sequelize.ENUM('pending', 'accepted', 'denied'),
            defaultValue: 'pending',
        },
    }, {
        timestamps: true,
    });
}