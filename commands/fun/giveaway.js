const { SlashCommandBuilder } = require('discord.js');
const Giveaway = require('../../models/giveaway');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('giveaway')
        .setDMPermission(false)
        .setDescription('Starts a giveaway!')

        .addStringOption(option => option
            .setName('prize')
            .setDescription('The prize for the giveaway')
            .setRequired(true))
        .addIntegerOption(option => option
            .setName('winners')
            .setDescription('Number of winners')
            .setMinValue(1)
            .setRequired(true))
        .addIntegerOption(option => option
            .setName('seconds')
            .setDescription('Duration of the giveaway in seconds')
            .setMinValue(0)
            .setMaxValue(59))
        .addIntegerOption(option => option
            .setName('minutes')
            .setDescription('Duration of the giveaway in minutes')
            .setMinValue(0)
            .setMaxValue(59))
        .addIntegerOption(option => option
            .setName('hours')
            .setDescription('Duration of the giveaway in hours')
            .setMinValue(0)
            .setMaxValue(23))
        .addIntegerOption(option => option
            .setName('days')
            .setDescription('Duration of the giveaway in days')
            .setMinValue(0)),

    async execute(interaction) {

        const prize = interaction.options.getString('prize');
        const seconds = interaction.options.getInteger('seconds') || 0;
        const minutes = interaction.options.getInteger('minutes') || 0;
        const hours = interaction.options.getInteger('hours') || 0;
        const days = interaction.options.getInteger('days') || 0;
        const winners = interaction.options.getInteger('winners');



        let duration = (days * 86400) + (hours * 3600) + (minutes * 60) + seconds;

        const endsAt = Math.floor(Date.now() / 1000) + duration
        const endsAtDate = new Date(Date.now() + duration * 1000)

        if (duration <= 0) {
            interaction.reply(`Please enter a duration greater than 0 seconds.`);
            return;
        }

        const giveawayMessage = await interaction.reply({
            content: `🎉 **GIVEAWAY** 🎉\nPrize: **${prize}**\nReact with 🎉 to enter!\nEnds: <t:${endsAt}:R>\nWinners: **${winners}**`,
            fetchReply: true, // Allows the bot to fetch the message object
        });

        await giveawayMessage.react('🎉');

        const [giveaway] = await Giveaway.findOrCreate({ where: { messageId: giveawayMessage.id}, // Use the unique message ID
            defaults: {
                channelId: interaction.channel.id,
                prize: prize,
                endsAt: endsAtDate,
                winnerCount: winners,
            },
        });


        await giveaway.update({
            messageId: interaction.id,
            channelId: interaction.channel.id,
            prize: prize,
            endsAt: endsAtDate,
            winnerCount: winners,
        });

        // Wait for the giveaway duration
        setTimeout(async () => {
            // Fetch the giveaway message to get the reactions
            const updatedMessage = await interaction.channel.messages.fetch(giveawayMessage.id);
            const reaction = updatedMessage.reactions.cache.get('🎉');

            if (!reaction) {
                interaction.channel.send(`No one entered the giveaway for **${prize}**.`);
                return;
            }

            // Fetch all users who reacted
            const users = await reaction.users.fetch();
            const validUsers = users.filter(user => !user.bot); // Exclude bots

            if (validUsers.size === 0) {
                interaction.channel.send(`No one entered the giveaway for **${prize}**.`);
                return;
            }

            // Pick multiple random winners
            const winnersArray = validUsers.random(winners);

            if (!Array.isArray(winnersArray)) {
                // If only one winner can be picked
                interaction.channel.send(`🎉 Congratulations <@${winnersArray.id}>! You won **${prize}**!`);
                await interaction.editReply({
                    content: `🎉 **GIVEAWAY** 🎉\nPrize: **${prize}**\nEnded: <t:${endsAt}:R>\nWinner: **${winnersArray.id}**`,
                    fetchReply: true, // Allows the bot to fetch the message object
                });
            } else if (winnersArray.length > 0) {
                // If multiple winners can be picked
                const winnerMentions = winnersArray.map(winner => `<@${winner.id}>`).join(', ');
                interaction.channel.send(`🎉 Congratulations ${winnerMentions}! You won **${prize}**!`);
                await interaction.editReply({
                    content: `🎉 **GIVEAWAY** 🎉\nPrize: **${prize}**\nEnded: <t:${endsAt}:R>\nWinners: **${winnerMentions}**`,
                    fetchReply: true, // Allows the bot to fetch the message object
                });
            } else {
                // If not enough participants for the number of winners
                interaction.channel.send(`Not enough participants entered for **${prize}**. Giveaway ended.`);
                await interaction.editReply({
                    content: `🎉 **GIVEAWAY** 🎉\nPrize: **${prize}**\nEnded: <t:${endsAt}:R>\nWinners: **Nobody**`,
                    fetchReply: true, // Allows the bot to fetch the message object
                });
            }


        }, duration * 1000);
    },
};