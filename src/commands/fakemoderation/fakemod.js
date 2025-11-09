const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('fakemod')
        .setDescription('Do various fake moderation commands')
        .setDMPermission(false)
        .addSubcommand(subcommand => subcommand
            .setName('ban')
            .setDescription('Ban a user (jokingly) from this server!')
            .addUserOption(option => option
                .setName('target')
                .setDescription('The user to ban')
                .setRequired(true))
            .addStringOption(option => option
                .setName('reason')
                .setDescription('The reason for banning the user')))
        .addSubcommand(subcommand => subcommand
            .setName('kick')
            .setDescription('Kick a user (jokingly) from this server, even if they are not here!')
            .addUserOption(option => option
                .setName('target')
                .setDescription('The user to kick')
                .setRequired(true))
            .addStringOption(option => option
                .setName('reason')
                .setDescription('The reason for kicking the user')))
        .addSubcommand(subcommand => subcommand
            .setName('mute')
            .setDescription('Mute a user (jokingly) in this server, even if they are not here!')
            .addUserOption(option => option
                .setName('target')
                .setDescription('The user to mute')
                .setRequired(true))
            .addStringOption(option => option
                .setName('reason')
                .setDescription('The reason for muting the user'))
            .addIntegerOption(option => option
                .setName('days')
                .setDescription('Number of days to mute the user')
                .setMinValue(0))
            .addIntegerOption(option => option
                .setName('hours')
                .setDescription('Number of hours to mute the user')
                .setMinValue(0)
                .setMaxValue(23))
            .addIntegerOption(option => option
                .setName('minutes')
                .setDescription('Number of minutes to mute the user')
                .setMinValue(0)
                .setMaxValue(59))
            .addIntegerOption(option => option
                .setName('seconds')
                .setDescription('Number of seconds to mute the user')
                .setMinValue(0)
                .setMaxValue(59)))
        .addSubcommand(subcommand => subcommand
            .setName('warn')
            .setDescription('Warn a user (jokingly) in this server, even if they are not here!')
            .addUserOption(option => option
                .setName('target')
                .setDescription('The user to warn')
                .setRequired(true))
            .addStringOption(option => option
                .setName('reason')
                .setDescription('The reason for warning the user')
                .setRequired(true))),

    category: 'fake moderation',
    async execute(interaction) {


        if (interaction.options.getSubcommand() === 'ban') {
            const user = interaction.options.getUser('target');
            const value = interaction.options.getString('reason') ?? 'No reason provided';
            return await interaction.reply(`Successfully banned **${user.tag}** ||haha jk lol||\n**Reason:** ${value} ||this didn't really ban the user lol||\nhttps://tenor.com/view/bane-no-banned-and-you-are-explode-gif-16047504`);
        }

        if (interaction.options.getSubcommand() === 'kick') {

            const user = interaction.options.getUser('target');
            const value = interaction.options.getString('reason') ?? 'No reason provided';

            return await interaction.reply(`Successfully kicked **${user.tag}** ||haha jk lol||\n**Reason:** ${value} ||this didn't really kick the user lol||\nhttps://tenor.com/view/discord-server-kick-gif-25044735`);
        }

        if (interaction.options.getSubcommand() === 'mute') {


            const user = interaction.options.getUser('target');
            const reason = interaction.options.getString('reason') ?? 'No reason provided';

            // Get time inputs
            const days = interaction.options.getInteger('days') || 0;
            const hours = interaction.options.getInteger('hours') || 0;
            const minutes = interaction.options.getInteger('minutes') || 0;
            const seconds = interaction.options.getInteger('seconds') || 0;

            await interaction.deferReply();

            // Build the duration string dynamically
            let duration = [];
            if (days > 0) duration.push(`${days} day${days > 1 ? 's' : ''}`);
            if (hours > 0) duration.push(`${hours} hour${hours > 1 ? 's' : ''}`);
            if (minutes > 0) duration.push(`${minutes} minute${minutes > 1 ? 's' : ''}`);
            if (seconds > 0) duration.push(`${seconds} second${seconds > 1 ? 's' : ''}`);

            // Handle different cases
            let durationText = duration.length > 0
                ? duration.join(', ')
                : 'indefinitely';

            // Send the final response
            return await interaction.editReply(`Successfully muted **${user.tag}** for **${durationText}** ||haha jk lol||\n**Reason:** ${reason} ||this didn't really mute the user lol||\nhttps://tenor.com/view/discord-mute-ancient-gods-doom-eternal-discord-mute-gif-21857683`);

        }

        if (interaction.options.getSubcommand() === 'warn') {

            const user = interaction.options.getUser('target');
            const value = interaction.options.getString('reason');
            return interaction.reply(`Warning logged for **${user.tag}** ||haha jk lol||\n**Reason:** ${value} ||this warning didn't count lol||\nhttps://tenor.com/view/discord-meme-spooked-scared-mod-gif-18361254`);

        }

    },
};