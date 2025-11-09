const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('info')
        .setDMPermission(false)
        .setDescription('Replies with info!')
        .addSubcommand(subcommand => subcommand
            .setName('bot')
            .setDescription('Replies with bot information!'))
        .addSubcommand(subcommand => subcommand
            .setName('server')
            .setDescription('Replies with server info!'))
        .addSubcommand(subcommand => subcommand
            .setName('user')
                .setDescription('Replies with user info!')
                .addUserOption(option => option
                    .setName('target')
                    .setDescription('The user\'s information')),
),
    category: 'info',
    async execute(interaction) {

        if (interaction.options.getSubcommand() === 'bot') {
            // Minimal, friendly output with version and a link to full history
            const pkg = require('../../../package.json');
            const versionTag = pkg?.version ? `${pkg.version}` : '';

            // Build history URL from env or repository
            let repoUrl = (pkg.repository && (pkg.repository.url || pkg.repository)) || process.env.GITHUB_REPOSITORY || '';
            if (typeof repoUrl === 'object') repoUrl = repoUrl.url || '';
            if (repoUrl.startsWith('git+')) repoUrl = repoUrl.slice(4);
            if (repoUrl.endsWith('.git')) repoUrl = repoUrl.slice(0, -4);
            const historyUrl = process.env.BOT_HISTORY_URL || (repoUrl ? `${repoUrl}/blob/main/docs/BOT_HISTORY.md` : '');

            // Total server (guild) count
            const guildCount = interaction.client?.guilds?.cache?.size ?? 0;

            // Calculate uptime and ready timestamp
            const uptimeMs = interaction.client?.uptime ?? 0;
            const readyTimestamp = Math.floor((Date.now() - uptimeMs) / 1000);
            
            const totalSeconds = Math.floor(uptimeMs / 1000);
            const days = Math.floor(totalSeconds / 86400);
            const hours = Math.floor((totalSeconds % 86400) / 3600);
            const minutes = Math.floor((totalSeconds % 3600) / 60);
            const seconds = totalSeconds % 60;
            
            const uptimeParts = [];
            if (days > 0) uptimeParts.push(`${days} day${days === 1 ? '' : 's'}`);
            if (hours > 0) uptimeParts.push(`${hours} hour${hours === 1 ? '' : 's'}`);
            if (minutes > 0) uptimeParts.push(`${minutes} minute${minutes === 1 ? '' : 's'}`);
            if (seconds > 0 || uptimeParts.length === 0) uptimeParts.push(`${seconds} second${seconds === 1 ? '' : 's'}`);
            const uptimeFormatted = uptimeParts.join(', ');

            const message = `I'm a bot on **version ${versionTag}** that was originally built for **AwesomeKid99999's** Discord server. I'm currently in **${guildCount}** server${guildCount === 1 ? '' : 's'}.\n**My current uptime (as of when this command was run) is:** ${uptimeFormatted}\n**I was online since:** <t:${readyTimestamp}:F> (<t:${readyTimestamp}:R>)\n\nI've come a long way—read my full story here: ${historyUrl || 'https://github.com/AwesomeKid99999/AwesomeKid99999-discord-bot/blob/main/docs/BOT_HISTORY.md'}`;
            return await interaction.reply(message);
        }

    if (interaction.options.getSubcommand() === 'server') {
        const ownerPromise = interaction.guild.fetchOwner();
        const owner = await ownerPromise;
        const serverCreatedTimestamp = interaction.guild.createdTimestamp;
        const serverCreatedUnix = Math.floor(serverCreatedTimestamp / 1000);
        await interaction.reply(`**Server name:** ${interaction.guild.name}\n**Total members:** ${interaction.guild.memberCount}\n**Owned by: **${(owner.user.tag)}**\nCreated at: **<t:${serverCreatedUnix}:F>, <t:${serverCreatedUnix}:R>`);

    }
        if (interaction.options.getSubcommand() === 'user') {

            const user = interaction.options.getUser('target');
            const member = interaction.options.getMember('target');



            if (!user || user.id === interaction.user.id) {

            const accountCreatedTimestamp = interaction.user.createdTimestamp;
            const serverJoinedTimestamp = interaction.member.joinedTimestamp;
            const accountCreatedUnix = Math.floor(accountCreatedTimestamp / 1000);
            const serverJoinedUnix = Math.floor(serverJoinedTimestamp / 1000);
            return interaction.reply(`**Your display name:** ${interaction.user.displayName}\n**Your username:** ${interaction.user.tag}\n**Your id:** ${interaction.user.id}\n**Account Creation Date:** <t:${accountCreatedUnix}:F>, <t:${accountCreatedUnix}:R>\n**Server Join Date:** <t:${serverJoinedUnix}:F>, <t:${serverJoinedUnix}:R>`);
        } else if (member) {
            const accountCreatedTimestamp = user.createdTimestamp;
            const serverJoinedTimestamp = member.joinedTimestamp;
            const accountCreatedUnix = Math.floor(accountCreatedTimestamp / 1000);
            const serverJoinedUnix = Math.floor(serverJoinedTimestamp / 1000);
            return interaction.reply(`**Their display name:** ${user.displayName}\n**Their username:** ${user.tag}\n**Their id:** ${user.id}\n**Account Creation Date:** <t:${accountCreatedUnix}:F>, <t:${accountCreatedUnix}:R>\n**Server Join Date:** <t:${serverJoinedUnix}:F>, <t:${serverJoinedUnix}:R>`);
        } else {
            const accountCreatedTimestamp = user.createdTimestamp;
            const accountCreatedUnix = Math.floor(accountCreatedTimestamp / 1000);
            return interaction.reply(`**Their display name:** ${user.displayName}\n**Their username:** ${user.tag}\n**Their id:** ${user.id}\n**Account Creation Date:** <t:${accountCreatedUnix}:F>, <t:${accountCreatedUnix}:R>`);
        }        }

    },
};