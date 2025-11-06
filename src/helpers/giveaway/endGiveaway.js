const {Giveaway} = require("../../models");
const pickWinners = require("./pickWinners")

async function endGiveaway(client, messageId) {
    const giveaway = await Giveaway.findOne({ where: { messageId, active: true } });
    if (!giveaway) return;

    const channel = await client.channels.fetch(giveaway.channelId).catch(() => null);
    if (!channel) {
        console.error(`Channel with ID ${giveaway.channelId} not found. Marking giveaway as inactive.`);
        await giveaway.update({active: false});
        return;

    }

    const message = await channel.messages.fetch(giveaway.messageId).catch(() => null);
    if (!message) {
        console.error(`Message with ID ${giveaway.messageId} not found. Marking as inactive.`);
        await giveaway.update({active: false});
        return;
    }

    await pickWinners(message, giveaway.winnerCount, giveaway.prize);
    await giveaway.update({ active: false });
}

module.exports = endGiveaway;