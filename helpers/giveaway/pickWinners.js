const {Giveaway} = require("../../models");

async function pickWinners(message, winnerCount, prize, reroll, interactionUser) {

    const messageId = message.id;


    const reaction = message.reactions.cache.get('🎉');
    if (!reaction) {
        if (reroll) {
            const giveaway = await Giveaway.findOne({ where: { messageId, active: false } });

            message.channel.send(`🎉 Giveaway rerolled by ${interactionUser}! However, no one entered the giveaway for **${prize}**.`);
            return message.edit({
                content: `🎉 **GIVEAWAY** 🎉\nPrize: **${prize}**\nEnded: <t:${(giveaway.endsAt/1000).toPrecision(10)}:R> (<t:${(giveaway.endsAt/1000).toPrecision(10)}:F>)\nWinners: **Nobody**`
            });
        } else {

            const giveaway = await Giveaway.findOne({ where: { messageId, active: true } });


            let endsAt;

            if (giveaway.endsAt > Math.floor(Date.now())) {
                endsAt = Math.floor(Date.now());
                await giveaway.update({ endsAt: endsAt });
            } else {
                endsAt = giveaway.endsAt;
            }

            message.channel.send(`No one entered the giveaway for **${prize}**.`);
            return message.edit({
                content: `🎉 **GIVEAWAY** 🎉\nPrize: **${prize}**\nEnded: <t:${(endsAt/1000).toPrecision(10)}:R> (<t:${(endsAt/1000).toPrecision(10)}:F>)\nWinners: **Nobody**`
            });
        }
    }

    const users = await reaction.users.fetch();
    const validUsers = users.filter(user => !user.bot);

    if (validUsers.size === 0) {
        if (reroll) {
            const giveaway = await Giveaway.findOne({ where: { messageId, active: false } });


            message.channel.send(`🎉 Giveaway rerolled by ${interactionUser}! However, no one entered the giveaway for **${prize}**.`);
            return message.edit({
                content: `🎉 **GIVEAWAY** 🎉\nPrize: **${prize}**\nEnded: <t:${(giveaway.endsAt/1000).toPrecision(10)}:R> (<t:${(giveaway.endsAt/1000).toPrecision(10)}:F>)\nWinners: **Nobody**`
            });
        } else {
            const giveaway = await Giveaway.findOne({ where: { messageId, active: true } });


            let endsAt;

            if (giveaway.endsAt > Math.floor(Date.now())) {
                endsAt = Math.floor(Date.now());
                await giveaway.update({ endsAt: endsAt });
            } else {
                endsAt = giveaway.endsAt;
            }

            message.channel.send(`🎉 No one entered the giveaway for **${prize}**.`);
            return message.edit({
                content: `🎉 **GIVEAWAY** 🎉\nPrize: **${prize}**\nEnded: <t:${(endsAt/1000).toPrecision(10)}:R> (<t:${(endsAt/1000).toPrecision(10)}:F>)\nWinners: **Nobody**`
            });
        }    }

    const winners = validUsers.random(winnerCount);
    const winnerMentions = Array.isArray(winners)
        ? winners.map(winner => `<@${winner.id}>`).join(', ')
        : `<@${winners.id}>`;




    if (reroll) {
        const giveaway = await Giveaway.findOne({ where: { messageId, active: false } });

        message.channel.send(`🎉 Giveaway rerolled by ${interactionUser}! Congratulations ${winnerMentions}! You won **${prize}**!`);
        return message.edit({
            content: `🎉 **GIVEAWAY** 🎉\nPrize: **${prize}**\nEnded: <t:${(giveaway.endsAt/1000).toPrecision(10)}:R> (<t:${(giveaway.endsAt/1000).toPrecision(10)}:F>)\nWinners: **${winnerMentions}**`
        });
    } else {
        const giveaway = await Giveaway.findOne({ where: { messageId, active: true } });

        let endsAt;

        if (giveaway.endsAt > Math.floor(Date.now())) {
            endsAt = Math.floor(Date.now());
            await giveaway.update({ endsAt: endsAt });
        } else {
            endsAt = giveaway.endsAt;
        }

        message.channel.send(`🎉 Congratulations ${winnerMentions}! You won **${prize}**!`);
        return message.edit({
            content: `🎉 **GIVEAWAY** 🎉\nPrize: **${prize}**\nEnded: <t:${(endsAt/1000).toPrecision(10)}:R> (<t:${(endsAt/1000).toPrecision(10)}:F>)\nWinners: **${winnerMentions}**`
        });
    }

}

module.exports = pickWinners;