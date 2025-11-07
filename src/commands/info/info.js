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
    category: 'utility',
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

            const message = `I'm a bot on **version ${versionTag}** that was originally built for **AwesomeKid99999's** Discord server. I've come a long way—read my full story here: ${historyUrl || 'https://github.com/AwesomeKid99999/AwesomeKid99999-discord-bot/blob/main/docs/BOT_HISTORY.md'}`;
            return await interaction.reply(message);
        }

        if (interaction.options.getSubcommand() === 'server') {
            const ownerPromise = interaction.guild.fetchOwner();
            const owner = await ownerPromise;
            let timestamp = interaction.guild.createdTimestamp;
            let a = timestamp.toPrecision(10);
            await interaction.reply(`**Server name:** ${interaction.guild.name}\n**Total members:** ${interaction.guild.memberCount}\n**Owned by: **${(owner.user.tag)}**\nCreated at: **<t:${a/1000}:F>, <t:${a/1000}:R>`);

        }


        if (interaction.options.getSubcommand() === 'user') {

            const user = interaction.options.getUser('target');
            const member = interaction.options.getMember('target');



            if (!user || user.id === interaction.user.id) {

                let timestamp_y = interaction.user.createdTimestamp;
                let timestamp_y2 = interaction.member.joinedTimestamp;
                let b = timestamp_y.toPrecision(10);
                let b2 = timestamp_y2.toPrecision(10);
                return interaction.reply(`**Your display name:** ${interaction.user.displayName}\n**Your username:** ${interaction.user.tag} (${interaction.user.username}#${interaction.user.discriminator}) \n**Your id:** ${interaction.user.id}\n**Account Creation Date:** <t:${b/1000}:F>, <t:${b/1000}:R>\n**Server Join Date:** <t:${b2/1000}:F>, <t:${b2/1000}:R>`);
            } else if (member) {
                let timestamp_z = user.createdTimestamp;
                let timestamp_z2 = member.joinedTimestamp;
                let c = timestamp_z.toPrecision(10);
                let c2 = timestamp_z2.toPrecision(10);
                return interaction.reply(`**Their display name:** ${user.displayName}\n**Their username:** ${user.tag} (${user.username}#${user.discriminator})\n**Their id:** ${user.id}\n**Account Creation Date:** <t:${c/1000}:F>, <t:${c/1000}:R>\n**Server Join Date:** <t:${c2/1000}:F>, <t:${c2/1000}:R>`);
            } else {
                let timestamp_x = user.createdTimestamp;
                let a = timestamp_x.toPrecision(10);
                return interaction.reply(`**Their display name:** ${user.displayName}\n**Their username:** ${user.tag} (${user.username}#${user.discriminator})\n**Their id:** ${user.id}\n**Account Creation Date:** <t:${a/1000}:F>, <t:${a/1000}:R>`);
            }

        }

    },
};