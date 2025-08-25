
const {XPSettings, XPIgnoredChannels} = require('../../models/')


const addXP = require('../../helpers/leveling/addXP');
const cooldowns = new Map();

module.exports = {
    name: 'messageCreate',
    once: false,
    async execute(message) {
        if (message.author.bot) return;
        if (message.system) {
            console.log(`System message detected in #${message.channel.name} at ${message.guild.name}`);

            // Log the specific type of system message
            console.log(`System Message Type: ${message.type}`);

            // Handle or log specific types of system messages
            switch (message.type) {
                case 'PINS_ADD':
                    console.log(`A message was pinned in ${message.channel.name}`);
                    break;
                case 'GUILD_MEMBER_JOIN':
                    console.log(`A new member joined the server: ${message.author.tag}`);
                    break;
                case 'USER_PREMIUM_GUILD_SUBSCRIPTION':
                    console.log(`${message.author.tag} boosted the server!`);
                    break;
                case 'CHANNEL_FOLLOW_ADD':
                    console.log(`A channel was followed in ${message.channel.name}`);
                    break;
                default:
                    console.log(`Unhandled system message type: ${message.type}`);
                    break;
            }
            return; // Exit here to avoid further processing of system messages
        }
        if (message.attachments.size > 0) {
            console.log(`${message.author.tag} in #${message.channel.name} at ${message.guild.name} sent: ${message.content}`)
            message.attachments.forEach(attachment => {
                // Check if the attachment is an image
                if (attachment.contentType && attachment.contentType.startsWith('image/')) {
                    console.log(`${attachment.url}`);
                    // Handle the image, e.g., download or process it
                } else {
                    console.log(` ${attachment.url}`);
                }
            });
        } else {
            console.log(`${message.author.tag} in #${message.channel.name} at ${message.guild.name} said ${message.content} `)
        }
        const botMention = `<@${message.client.user.id}>`;
        if (message.content.startsWith(prefix)) {
            // Get the command name and arguments
            const args = message.content.slice(prefix.length).trim().split(/ +/);
            const commandName = args.shift().toLowerCase(); // The command name
            const command = message.client.commands.get(commandName); // Retrieve the command from the collection

            if (!command) {
                console.error(`No command matching ${commandName} was found.`);
                return;
            }

            try {
                // Execute the command with the message and arguments
                await command.execute(message, args);
                console.log(`${message.author.tag} in ${message.guild.name} triggered the command: ${commandName}`);
            } catch (error) {
                console.error(`Error executing ${commandName}`);
                console.log(`${message.author.tag} in ${message.guild.name} tried executing ${commandName}, but there was an error.`);
                console.error(error);
            }

        } else if (message.content.startsWith(botMention)) {

            const args = message.content.slice(botMention.length).trim().split(/ +/);
            const commandName = args.shift().toLowerCase(); // The command name
            const command = message.client.commands.get(commandName); // Retrieve the command from the collection

            if (!command) {
                console.error(`No command matching ${commandName} was found.`);
                return;
            }

            try {
                // Execute the command with the message and arguments
                await command.execute(message, args);
                console.log(`${message.author.tag} in ${message.guild.name} triggered the command: ${commandName}`);
            } catch (error) {
                console.error(`Error executing ${commandName}`);
                console.log(`${message.author.tag} in ${message.guild.name} tried executing ${commandName}, but there was an error.`);
                console.error(error);
            }

        }



        const userId = message.author.id;
        const serverId = message.guild.id;
        const channelId = message.channel.id;

        const ignoredChannel = await XPIgnoredChannels.findOne({
            where: { serverId, channelId },
        });

        if (ignoredChannel) {
            console.log(`Message is in ${message.channel.name}, which is in the ignored XP list. Skipping...`);
            return;
        }

        const xpSettings = await XPSettings.findOne({
            where: { serverId },
        });
        if (!xpSettings) {
            console.log(`XP settings not found for the server ${message.guild.name}.`);
            return;
        }

        if (!xpSettings.enabled) {
            console.log(`Leveling not enabled for the server ${message.guild.name}.`);
            return;
        }


        let channel;
        if (!xpSettings.levelUpChannelId) {
            channel = message.channel
        } else {
            channel = await message.guild.channels.fetch(`${xpSettings.levelUpChannelId}`).catch(() => null);
            if (!channel) return console.error('Level up channel not found.')
        }

        // Default XP range if settings are not found
        const minXP = xpSettings.minXP;
        const maxXP = xpSettings.maxXP;
        const multiplier = xpSettings.multiplier;
        const effortMultiplier = xpSettings.effortBoosterMultiplier || 0; // Multiplier for effort booster
        const effortBoosterEnabled = xpSettings.effortBooster;
        const cooldown = xpSettings.cooldown;
        const client = message.client;


        // Cooldown logic to prevent spamming
        const cooldownKey = `${serverId}-${userId}`;
        const now = Date.now();
        const cooldownTime = cooldown * 1000;

        if (cooldowns.has(cooldownKey)) {
            const lastUsed = cooldowns.get(cooldownKey);
            if (now - lastUsed < cooldownTime) return;
        }
        cooldowns.set(cooldownKey, now);

        // Add XP
        let xpToAdd = Math.floor(((Math.random() * (maxXP - minXP + 1)) + minXP));

        // Apply effort booster if enabled
        if (effortBoosterEnabled) {
            const messageLength = message.content.length;

            // Calculate effort bonus using multiplier
            const effortBonus = Math.floor(effortMultiplier * messageLength);
            xpToAdd += effortBonus;
        }
        xpToAdd = Math.floor(xpToAdd * multiplier);
        await addXP(client, userId, serverId, xpToAdd, channel);

    },
};