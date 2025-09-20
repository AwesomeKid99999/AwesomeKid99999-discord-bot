const { SlashCommandBuilder, PermissionsBitField} = require('discord.js');
const {Giveaway} = require('../../models/');
const endGiveaway = require('../../helpers/giveaway/endGiveaway')
const pickWinners = require('../../helpers/giveaway/pickWinners')

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

            setTimeout(() => endGiveaway(interaction.client, giveawayMessage.id), duration);
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
    }
};



