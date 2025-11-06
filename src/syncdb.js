require('dotenv').config();
const sequelize = require('./utilities/database');


const { Guild, Giveaway, Question, Application, StaffRoles, CustomRoles, Embed, Level, LevelRoles, XPSettings, XPIgnoredChannels } = require('./models/')

Guild.sync({alter: true});
Giveaway.sync({alter: true});
Question.sync({alter: true});
Application.sync({alter: true});
StaffRoles.sync({alter: true});
CustomRoles.sync({alter: true});
Embed.sync({alter: true});
Level.sync({alter: true});
LevelRoles.sync({alter: true});
XPSettings.sync({alter: true});
XPIgnoredChannels.sync({alter: true});