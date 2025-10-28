// export function that defines guild model
module.exports = (sequelize, Sequelize) => {
    return sequelize.define('guild', {
        serverId: {
            type: Sequelize.STRING(20),
            primaryKey: true
        },
        muteRoleId: {
            type: Sequelize.STRING(20),
            allowNull: true
        },
        welcomeChannelId: {
            type: Sequelize.STRING(20),
            allowNull: true
        },
        welcomeMessage: {
            type: Sequelize.STRING(1000),
            allowNull: true
        },
        welcomeEmbedId: {
            type: Sequelize.BIGINT.UNSIGNED,
            allowNull: true,
        },

        leaveChannelId: {
            type: Sequelize.STRING(20),
            allowNull: true
        },
        leaveMessage: {
            type: Sequelize.STRING(1000),
            allowNull: true
        },
        leaveEmbedId: {
            type: Sequelize.BIGINT.UNSIGNED,
            allowNull: true,
        },
        applicationChannelId: {
            type: Sequelize.STRING(20),
            allowNull: true
        },
        messageLogChannelId: {
            type: Sequelize.STRING(20),
            allowNull: true
        },
        memesEnabled: {
            type: Sequelize.BOOLEAN,
            allowNull: true
        },

    });

};