

module.exports = (sequelize, Sequelize) => {
    return sequelize.define('giveaway', {
        messageId: {
            type: Sequelize.STRING,
            primaryKey: true
        },
        channelId: {
            type: Sequelize.STRING,
            allowNull: false
        },
        serverId: {
            type: Sequelize.STRING,
            allowNull: false
        },
        prize: {
            type: Sequelize.STRING,
            allowNull: false
        },
        winnerCount: {
            type: Sequelize.INTEGER,
            allowNull: false
        },
        endsAt: {
            type: Sequelize.INTEGER,
            allowNull: false
        },
        active: {
            type: Sequelize.BOOLEAN,
            allowNull: true
        }
    });
}