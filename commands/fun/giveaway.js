const { SlashCommandBuilder, PermissionsBitField} = require('discord.js');
const {Giveaway} = require('../../models/');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('giveaway')
        .setDescription('Manage giveaways for the server!')
        .setDMPermission(false)
        .addSubcommand(subcommand =>
            subcommand
                .setName('start')
                .setDescription('Start a giveaway in the server! (STAFF ONLY)')
                .addStringOption(option =>
                    option.setName('prize')
                        .setDescription('The prize for the giveaway')
                        .setRequired(true))
                .addIntegerOption(option =>
                    option.setName('winners')
                        .setDescription('Number of winners')
                        .setMinValue(1)
                        .setRequired(true))
                .addIntegerOption(option =>
                    option.setName('seconds')
                        .setDescription('Duration in seconds')
                        .setMinValue(0)
                        .setMaxValue(59))
                .addIntegerOption(option =>
                    option.setName('minutes')
                        .setDescription('Duration in minutes')
                        .setMinValue(0)
                        .setMaxValue(59))
                .addIntegerOption(option =>
                    option.setName('hours')
                        .setDescription('Duration in hours')
                        .setMinValue(0)
                        .setMaxValue(23))
                .addIntegerOption(option =>
                    option.setName('days')
                        .setDescription('Duration in days')
                        .setMinValue(0)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('end')
                .setDescription('End an active giveaway in the server. (STAFF ONLY)')
                .addStringOption(option =>
                    option.setName('message_id')
                        .setDescription('The message ID of the giveaway')
                        .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('reroll')
                .setDescription('Reroll winners for a completed giveaway. (STAFF ONLY)')
                .addStringOption(option =>
                    option.setName('message_id')
                        .setDescription('The message ID of the giveaway')
                        .setRequired(true))),

    async execute(interaction) {

        if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageGuild)) {
            return interaction.reply({
                content: 'You do not have permission to run this command.',
                ephemeral: true,
            });
        }

        const subcommand = interaction.options.getSubcommand();

        if (subcommand === 'start') {
            const prize = interaction.options.getString('prize');
            const seconds = interaction.options.getInteger('seconds') || 0;
            const minutes = interaction.options.getInteger('minutes') || 0;
            const hours = interaction.options.getInteger('hours') || 0;
            const days = interaction.options.getInteger('days') || 0;
            const winners = interaction.options.getInteger('winners');

            let duration = (days * 86400) + (hours * 3600) + (minutes * 60) + seconds;
            const endsAt = (Math.floor(interaction.createdTimestamp / 1000)) + duration;

            if (duration <= 0) {
                return interaction.reply({ content: 'Please enter a duration greater than 0 seconds.', ephemeral: true });
            }

            const giveawayMessage = await interaction.reply({
                content: `🎉 **GIVEAWAY** 🎉\nPrize: **${prize}**\nReact with 🎉 to enter!\nEnds: <t:${endsAt}:R> (<t:${endsAt}:F>)\nWinners: **${winners}**`,
                fetchReply: true
            });

            await giveawayMessage.react('🎉');

            await Giveaway.create({
                messageId: giveawayMessage.id,
                channelId: interaction.channel.id,
                serverId: interaction.guild.id,
                prize: prize,
                endsAt: endsAt,
                winnerCount: winners,
                active: true
            });

            setTimeout(() => endGiveaway(interaction.client, giveawayMessage.id), duration * 1000);
        }

        else if (subcommand === 'end') {
            const messageId = interaction.options.getString('message_id');
            const giveaway = await Giveaway.findOne({ where: { messageId, active: true } });

            if (!giveaway) {
                return interaction.reply({ content: 'No active giveaway found with that message ID.', ephemeral: true });
            }

            if (!giveaway.serverId !== interaction.guild.id) {
                return interaction.reply({ content: 'Sorry, that giveaway belongs to a different server.', ephemeral: true });
            }



            await endGiveaway(interaction.client, messageId);
            interaction.reply({ content: `The giveaway for **${giveaway.prize}** has been manually ended.`, ephemeral: true });
        }

        else if (subcommand === 'reroll') {
            const messageId = interaction.options.getString('message_id');
            const giveaway = await Giveaway.findOne({ where: { messageId, active: false } });

            if (!giveaway) {
                return interaction.reply({ content: 'No completed giveaway found with that message ID.', ephemeral: true });
            }


            if (giveaway.serverId !== interaction.guild.id) {
                return interaction.reply({ content: 'Sorry, that giveaway belongs to a different server.', ephemeral: true });
            }


            const channel = await interaction.client.channels.fetch(giveaway.channelId).catch(() => null);
            if (!channel) {
                return interaction.reply({ content: 'The channel for this giveaway no longer exists.', ephemeral: true });
            }

            const message = await channel.messages.fetch(messageId).catch(() => null);
            if (!message) {
                return interaction.reply({ content: 'The giveaway message could not be found.', ephemeral: true });
            }

            await pickWinners(message, giveaway.winnerCount, giveaway.prize, true, interaction.user);
            interaction.reply({ content: 'Winners have been re-rolled!', ephemeral: true });
        }
    }
};

// Function to end a giveaway
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

// Function to pick winners
async function pickWinners(message, winnerCount, prize, reroll, interactionUser) {

    const messageId = message.id;


    const reaction = message.reactions.cache.get('🎉');
    if (!reaction) {
        if (reroll) {
            const giveaway = await Giveaway.findOne({ where: { messageId, active: false } });

            message.channel.send(`🎉 Giveaway rerolled by ${interactionUser}! However, no one entered the giveaway for **${prize}**.`);
            return message.edit({
                content: `🎉 **GIVEAWAY** 🎉\nPrize: **${prize}**\nEnded: <t:${giveaway.endsAt}:R> (<t:${giveaway.endsAt}:F>)\nWinners: **Nobody**`
            });
        } else {

            const giveaway = await Giveaway.findOne({ where: { messageId, active: true } });


            let endsAt;

            if (giveaway.endsAt > Math.floor(Date.now() / 1000)) {
                endsAt = Math.floor(Date.now() / 1000);
                await giveaway.update({ endsAt: endsAt });
            } else {
                endsAt = giveaway.endsAt;
            }

            message.channel.send(`🎉 No one entered the giveaway for **${prize}**.`);
            return message.edit({
                content: `🎉 **GIVEAWAY** 🎉\nPrize: **${prize}**\nEnded: <t:${endsAt}:R> (<t:${endsAt}:F>)\nWinners: **Nobody**`
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
                content: `🎉 **GIVEAWAY** 🎉\nPrize: **${prize}**\nEnded: <t:${giveaway.endsAt}:R> (<t:${giveaway.endsAt}:F>)\nWinners: **Nobody**`
            });
        } else {
            const giveaway = await Giveaway.findOne({ where: { messageId, active: true } });


            let endsAt;

            if (giveaway.endsAt > Math.floor(Date.now() / 1000)) {
                endsAt = Math.floor(Date.now() / 1000);
                await giveaway.update({ endsAt: endsAt });
            } else {
                endsAt = giveaway.endsAt;
            }

            message.channel.send(`🎉 No one entered the giveaway for **${prize}**.`);
            return message.edit({
                content: `🎉 **GIVEAWAY** 🎉\nPrize: **${prize}**\nEnded: <t:${endsAt}:R> (<t:${endsAt}:F>)\nWinners: **Nobody**`
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
            content: `🎉 **GIVEAWAY** 🎉\nPrize: **${prize}**\nEnded: <t:${giveaway.endsAt}:R> (<t:${giveaway.endsAt}:F>)\nWinners: **${winnerMentions}**`
        });
    } else {
        const giveaway = await Giveaway.findOne({ where: { messageId, active: true } });

        let endsAt;

        if (giveaway.endsAt > Math.floor(Date.now() / 1000)) {
            endsAt = Math.floor(Date.now() / 1000);
            await giveaway.update({ endsAt: endsAt });
        } else {
            endsAt = giveaway.endsAt;
        }

        message.channel.send(`🎉 Congratulations ${winnerMentions}! You won **${prize}**!`);
        return message.edit({
            content: `🎉 **GIVEAWAY** 🎉\nPrize: **${prize}**\nEnded: <t:${endsAt}:R> (<t:${endsAt}:F>)\nWinners: **${winnerMentions}**`
        });
    }

}