

module.exports = (sequelize, Sequelize) => {
    return sequelize.define('xpIgnoredChannels', {
        serverId: {
            type: Sequelize.STRING,
            allowNull: false,
        },
        channelId: {
            type: Sequelize.STRING,
            primaryKey: true,
        },
        channelName: {
            type: Sequelize.STRING,
            allowNull: false,
        },


    });
}