

module.exports = (sequelize, Sequelize) => {
    return sequelize.define('xpIgnoredChannels', {
        serverId: {
            type: Sequelize.STRING(20),
            allowNull: false,
        },
        channelId: {
            type: Sequelize.STRING(20),
            primaryKey: true,
        },
        channelName: {
            type: Sequelize.STRING(100),
            allowNull: false,
        },


    });
}