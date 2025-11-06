const sequelize = require('../utilities/database');
const Sequelize = require('sequelize');

// import models by calling function
const Guild = require('./guild')(sequelize, Sequelize);
const Giveaway = require('./giveaway')(sequelize, Sequelize);
const Question = require('./question')(sequelize, Sequelize);
const Application = require('./application')(sequelize, Sequelize);
const StaffRoles = require('./staffRoles')(sequelize, Sequelize);
const CustomRoles = require('./customRoles')(sequelize, Sequelize);
const Embed = require('./embed')(sequelize, Sequelize);
const Level = require('./level')(sequelize, Sequelize);
const GlobalUserLevel = require('./globalUserLevel')(sequelize, Sequelize);
const LevelRoles = require('./levelRoles')(sequelize, Sequelize);
const XPSettings = require('./xpSettings')(sequelize, Sequelize);
const XPIgnoredChannels = require('./xpIgnoredChannels')(sequelize, Sequelize);
const Birthday = require('./birthday')(sequelize, Sequelize);

// Export centralized library of models
module.exports = {
    sequelize,
    Sequelize,
    Guild,
    Giveaway,
    Question,
    Application,
    StaffRoles,
    CustomRoles,
    Embed,
    Level,
    GlobalUserLevel,
    LevelRoles,
    XPSettings,
    XPIgnoredChannels,
    Birthday
};