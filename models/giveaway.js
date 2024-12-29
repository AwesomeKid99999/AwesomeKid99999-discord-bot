const Sequelize = require('sequelize');
const sequelize = require('../utilities/database');

module.exports = Giveaway = sequelize.define('giveaway', {
    messageId: {
        type: Sequelize.STRING,
        primaryKey: true
    },
    channelId: {
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
        type: Sequelize.DATE,
        allowNull: false
    },
});