const Sequelize = require('sequelize');
const sequelize = require('../utilities/database');

module.exports = Guild = sequelize.define('guild', {
    id: {
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

    leaveChannelId: {
        type: Sequelize.STRING,
        allowNull: true
    },
    leaveMessage: {
        type: Sequelize.STRING,
        allowNull: true
    },
    chatgptChannelId: {
        type: Sequelize.STRING,
        allowNull: true
    },
    chatgptToggle: {
        type: Sequelize.BOOLEAN,
        allowNull: true
    },

});