require('dotenv').config();
const sequelize = require('./utilities/database');


const { Guild, Giveaway, Question, Application, StaffRoles, CustomRoles, Embed, Level, LevelRoles, XPSettings, XPIgnoredChannels, Birthday, CommandToggle } = require('./models/')

Guild.sync();
Giveaway.sync();
Question.sync();
Application.sync();
StaffRoles.sync();
CustomRoles.sync();
Embed.sync();
Level.sync();
LevelRoles.sync();
XPSettings.sync();
XPIgnoredChannels.sync();
Birthday.sync();
CommandToggle.sync();

console.log('All models were synchronized successfully.');