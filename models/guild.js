// export function that defines guild model
module.exports = (sequelize, Sequelize) => {
    return sequelize.define('guild', {
        serverId: {
            type: Sequelize.STRING,
            primaryKey: true
        },
        muteRoleId: {
            type: Sequelize.STRING,
            allowNull: true
        },
        welcomeChannelId: {
            type: Sequelize.STRING,
            allowNull: true
        },
        welcomeMessage: {
            type: Sequelize.STRING,
            allowNull: true
        },
        welcomeEmbedId: {
            type: Sequelize.INTEGER,
            allowNull: true,
        },

        leaveChannelId: {
            type: Sequelize.STRING,
            allowNull: true
        },
        leaveMessage: {
            type: Sequelize.STRING,
            allowNull: true
        },
        leaveEmbedId: {
            type: Sequelize.INTEGER,
            allowNull: true,
        },
        applicationChannelId: {
            type: Sequelize.STRING,
            allowNull: true
        },
        messageLogChannelId: {
            type: Sequelize.STRING,
            allowNull: true
        },
        memesEnabled: {
            type: Sequelize.BOOLEAN,
            allowNull: true
        },
    });
};