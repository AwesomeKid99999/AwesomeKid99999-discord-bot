const Guild = require('./models/guild')
const Giveaway = require('./models/giveaway')


Guild.sync({alter: true});
Giveaway.sync({alter: true});