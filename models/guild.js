const Sequelize = require('sequelize');
const sequelize = require('../utilities/database');

module.exports = Guild = sequelize.define('guild', {
    id: {
        type: Sequelize.STRING,
        primaryKey: true
    },
    muteRoleId: {
        type: Sequelize. STRING,
        allowNull: true
    }
});