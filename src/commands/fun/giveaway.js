const { SlashCommandBuilder, PermissionsBitField} = require('discord.js');
const {Giveaway} = require('../../models/');
const endGiveaway = require('../../helpers/giveaway/endGiveaway')
const pickWinners = require('../../helpers/giveaway/pickWinners')
const { checkExpiredGiveaways } = require('../../events/ready/giveawayChecker');

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
                        .setMaxLength(255)
                        .setRequired(true))
                .addIntegerOption(option =>
                    option.setName('winners')
                        .setDescription('Number of winners')
                        .setMinValue(1)
                        .setRequired(true))
                .addIntegerOption(option => option
                    .setName('milliseconds')
                    .setDescription('Duration in milliseconds')
                    .setMinValue(0)
                    .setMaxValue(999))
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
                        .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('edit')
                .setDescription('Edit an active giveaway. (STAFF ONLY)')
                .addStringOption(option =>
                    option.setName('message_id')
                        .setDescription('The message ID of the giveaway')
                        .setRequired(true))
                .addStringOption(option =>
                    option.setName('prize')
                        .setDescription('New prize (leave blank to keep)')
                        .setMaxLength(255))
                .addIntegerOption(option =>
                    option.setName('winners')
                        .setDescription('New number of winners')
                        .setMinValue(1))
                .addIntegerOption(option => option
                    .setName('milliseconds')
                    .setDescription('Set new duration: milliseconds (overrides add_seconds)')
                    .setMinValue(0)
                    .setMaxValue(999))
                .addIntegerOption(option =>
                    option.setName('seconds')
                        .setDescription('Set new duration: seconds (overrides add_seconds)')
                        .setMinValue(0)
                        .setMaxValue(59))
                .addIntegerOption(option =>
                    option.setName('minutes')
                        .setDescription('Set new duration: minutes (overrides add_seconds)')
                        .setMinValue(0)
                        .setMaxValue(59))
                .addIntegerOption(option =>
                    option.setName('hours')
                        .setDescription('Set new duration: hours (overrides add_seconds)')
                        .setMinValue(0)
                        .setMaxValue(23))
                .addIntegerOption(option =>
                    option.setName('days')
                        .setDescription('Set new duration: days (overrides add_seconds)')
                        .setMinValue(0))
                .addIntegerOption(option =>
                    option.setName('add_seconds')
                        .setDescription('Add/subtract seconds to current end time (use negative to shorten)'))),
        category: 'fun',

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
            const milliseconds = interaction.options.getInteger('milliseconds') || 0;
            const seconds = interaction.options.getInteger('seconds') || 0;
            const minutes = interaction.options.getInteger('minutes') || 0;
            const hours = interaction.options.getInteger('hours') || 0;
            const days = interaction.options.getInteger('days') || 0;
            const winners = interaction.options.getInteger('winners');

            let duration = (days * 86400000) + (hours * 3600000) + (minutes * 60000) + (seconds * 1000) + milliseconds;
            const endsAt = (Math.floor(interaction.createdTimestamp)) + duration;

            if (duration <= 0) {
                return interaction.reply({ content: 'Please enter a duration greater than 0 seconds.', ephemeral: true });
            }

            const giveawayMessage = await interaction.reply({
                content: `🎉 **GIVEAWAY** 🎉\nPrize: **${prize}**\nReact with 🎉 to enter!\nEnds: <t:${(endsAt/1000).toPrecision(10)}:R> (<t:${(endsAt/1000).toPrecision(10)}:F>)\nWinners: **${winners}**`,
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

            // For giveaways longer than 24.8 days, we rely on the periodic checker
            // For shorter giveaways, we can still use setTimeout for immediate response
            if (duration <= 2147483647) { // Max setTimeout value
                setTimeout(() => endGiveaway(interaction.client, giveawayMessage.id), duration);
            }
        }

        else if (subcommand === 'end') {
            const messageId = interaction.options.getString('message_id');
            const giveaway = await Giveaway.findOne({ where: { messageId, active: true } });

            if (!giveaway) {
                return interaction.reply({ content: 'No active giveaway found with that message ID.', ephemeral: true });
            }


            if (giveaway.serverId !== interaction.guild.id) {
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

        else if (subcommand === 'edit') {
            const messageId = interaction.options.getString('message_id');
            const newPrize = interaction.options.getString('prize');
            const newWinners = interaction.options.getInteger('winners');
            const setMs = interaction.options.getInteger('set_milliseconds') || 0;
            const setSec = interaction.options.getInteger('set_seconds') || 0;
            const setMin = interaction.options.getInteger('set_minutes') || 0;
            const setHr = interaction.options.getInteger('set_hours') || 0;
            const setDay = interaction.options.getInteger('set_days') || 0;
            const addSeconds = interaction.options.getInteger('add_seconds'); // can be negative

            const giveaway = await Giveaway.findOne({ where: { messageId, active: true } });
            if (!giveaway) {
                return interaction.reply({ content: 'No active giveaway found with that message ID.', ephemeral: true });
            }
            if (giveaway.serverId !== interaction.guild.id) {
                return interaction.reply({ content: 'Sorry, that giveaway belongs to a different server.', ephemeral: true });
            }

            if (newPrize === null && newWinners === null && setMs === 0 && setSec === 0 && setMin === 0 && setHr === 0 && setDay === 0 && addSeconds === null) {
                return interaction.reply({ content: 'Please provide at least one field to edit.', ephemeral: true });
            }

            let updatedPrize = giveaway.prize;
            let updatedWinnerCount = giveaway.winnerCount;
            let updatedEndsAt = giveaway.endsAt;

            if (newPrize !== null) {
                updatedPrize = newPrize;
            }
            if (newWinners !== null) {
                if (newWinners < 1) {
                    return interaction.reply({ content: 'Winners must be at least 1.', ephemeral: true });
                }
                updatedWinnerCount = newWinners;
            }

            const giveawayMessageId = giveaway.messageId;
            const giveawayChannelId = giveaway.channelId;
            const giveawayChannel = await interaction.client.channels.cache.get(giveawayChannelId);
            const giveawayMessage = await giveawayChannel.messages.fetch(giveawayMessageId);

            const hasSetDuration = (setMs + setSec + setMin + setHr + setDay) > 0;
            if (hasSetDuration) {
                const duration = (setDay * 86400000) + (setHr * 3600000) + (setMin * 60000) + (setSec * 1000) + setMs;
                if (duration <= 0) {
                    return interaction.reply({ content: 'Please set a duration greater than 0 seconds.', ephemeral: true });
                }
                updatedEndsAt = giveawayMessage.createdTimestamp + duration;
            } else if (addSeconds !== null) {
                const delta = addSeconds * 1000;
                updatedEndsAt = giveaway.endsAt + delta;
                if (updatedEndsAt <= Date.now()) {
                    // End immediately if now past due after adjustment
                    await endGiveaway(interaction.client, giveaway.messageId);
                    return interaction.reply({ content: 'Giveaway time updated and it has now ended.', ephemeral: true });
                }
            }

            await giveaway.update({ prize: updatedPrize, winnerCount: updatedWinnerCount, endsAt: updatedEndsAt });

            // Try to update the original message content
            const channel = await interaction.client.channels.fetch(giveaway.channelId).catch(() => null);
            if (channel) {
                const message = await channel.messages.fetch(giveaway.messageId).catch(() => null);
                if (message) {
                    const endsAtTs = (updatedEndsAt/1000).toPrecision(10);
                    // Try to preserve basic structure; show Winner(s) count
                    const winnersLabel = 'Winners';
                    const content = `🎉 **GIVEAWAY** 🎉\nPrize: **${updatedPrize}**\nReact with 🎉 to enter!\nEnds: <t:${endsAtTs}:R> (<t:${endsAtTs}:F>)\n${winnersLabel}: **${updatedWinnerCount}**`;
                    await message.edit({ content }).catch(() => null);
                }
            }

            // Ask checker to rescan now so precise timeout gets scheduled if within window
            try { await checkExpiredGiveaways(interaction.client); } catch {}

            return interaction.reply({ content: 'Giveaway updated.', ephemeral: true });
        }
    }
};



