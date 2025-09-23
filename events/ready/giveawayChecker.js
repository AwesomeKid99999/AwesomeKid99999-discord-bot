const { Giveaway } = require('../../models');
const endGiveaway = require('../../helpers/giveaway/endGiveaway');
const { Op } = require('sequelize');

let giveawayCheckInterval;
const scheduledTimeouts = new Set();
const MAX_TIMEOUT_DELAY_MS = 2147483647; // ~24.8 days (setTimeout max)

async function checkExpiredGiveaways(client) {
    try {
        const now = Date.now();

        // 1) End all giveaways that are past due
        const expiredGiveaways = await Giveaway.findAll({
            where: {
                active: true,
                endsAt: { [Op.lte]: now }
            }
        });

        for (const giveaway of expiredGiveaways) {
            console.log(`Found expired giveaway: ${giveaway.prize} (Message ID: ${giveaway.messageId})`);
            await endGiveaway(client, giveaway.messageId);
            scheduledTimeouts.delete(giveaway.messageId);
        }

        if (expiredGiveaways.length > 0) {
            console.log(`Processed ${expiredGiveaways.length} expired giveaway(s)`);
        }

        // 2) Handoff: for active giveaways ending within setTimeout limit, schedule precise timeout
        const soonGiveaways = await Giveaway.findAll({
            where: {
                active: true,
                endsAt: { [Op.and]: [{ [Op.gt]: now }, { [Op.lte]: now + MAX_TIMEOUT_DELAY_MS }] }
            }
        });

        for (const giveaway of soonGiveaways) {
            if (scheduledTimeouts.has(giveaway.messageId)) continue;

            const remaining = giveaway.endsAt - now;
            if (remaining <= 0) continue; // already handled above or will be in next tick

            scheduledTimeouts.add(giveaway.messageId);
            setTimeout(async () => {
                try {
                    await endGiveaway(client, giveaway.messageId);
                } catch (err) {
                    console.error(`Error ending scheduled giveaway ${giveaway.messageId}:`, err);
                } finally {
                    scheduledTimeouts.delete(giveaway.messageId);
                }
            }, remaining);
        }
    } catch (error) {
        console.error('Error checking expired giveaways:', error);
    }
}

function startGiveawayChecker(client) {
    // Run once immediately on startup to reschedule precise timeouts after restarts
    checkExpiredGiveaways(client);

    // Then check every 5 minutes for expired/soon giveaways
    giveawayCheckInterval = setInterval(() => {
        checkExpiredGiveaways(client);
    }, 5 * 60 * 1000); // 5 minutes in milliseconds

    console.log('Giveaway checker started - ran immediately and will check every 5 minutes');
}

function stopGiveawayChecker() {
    if (giveawayCheckInterval) {
        clearInterval(giveawayCheckInterval);
        giveawayCheckInterval = null;
        console.log('Giveaway checker stopped');
    }
}

module.exports = {
    startGiveawayChecker,
    stopGiveawayChecker,
    checkExpiredGiveaways
};
