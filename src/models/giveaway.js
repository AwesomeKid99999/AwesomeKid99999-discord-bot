

module.exports = (sequelize, Sequelize) => {
    return sequelize.define('giveaway', {
        messageId: {
            type: Sequelize.STRING(20),
            primaryKey: true
        },
        channelId: {
            type: Sequelize.STRING(20),
            allowNull: false
        },
        serverId: {
            type: Sequelize.STRING(20),
            allowNull: false
        },
        prize: {
            type: Sequelize.STRING(255),
            allowNull: false
        },
        winnerCount: {
            type: Sequelize.INTEGER.UNSIGNED,
            allowNull: false
        },
        endsAt: {
            type: Sequelize.BIGINT,
            allowNull: false
        },
        active: {
            type: Sequelize.BOOLEAN,
            allowNull: true
        }
    });
}