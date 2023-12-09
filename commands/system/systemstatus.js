const config = require('config');
const embedOptions = config.get('embedOptions');
const { notValidGuildId } = require('../../utilities/validation/systemCommandValidator');
const { getUptimeFormatted } = require('../../utilities/system/getUptimeFormatted');
const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const osu = require('node-os-utils');
const { version, dependencies } = require('../../package.json');

module.exports = {
    isSystemCommand: false,
    isNew: false,
    isBeta: false,
    data: new SlashCommandBuilder()
        .setName('systemstatus')
        .setDescription('Show the bot and system status.')
        .setDMPermission(false)
        .setNSFW(false),
    async execute ( interaction, executionId ) {

        await interaction.deferReply();

        if (await notValidGuildId({ interaction, executionId })) {
            return;
        }

        // from normal /status command
        const uptimeString = await getUptimeFormatted({ executionId });
        const usedMemoryInMB = Math.ceil((await osu.mem.info()).usedMemMb).toLocaleString('en-US');
        const cpuUsage = await osu.cpu.usage();
        const releaseVersion = version;

        // specific to /systemstatus command
        const totalMemoryInMb = Math.ceil((await osu.mem.info()).totalMemMb).toLocaleString('en-US');
        const cpuCores = await osu.cpu.count();
        const platform = await osu.os.platform();
        const discordJsVersion = dependencies['discord.js'];
        const opusVersion = dependencies['@discord-player/opus'];
        const restVersion = dependencies['@discordjs/rest'];
        const voiceVersion = dependencies['discord-voip'];
        const discordPlayerVersion = dependencies['discord-player'];
        const extractorVersion = dependencies['@discord-player/extractor'];
        const mediaplexVersion = dependencies['mediaplex'];
        const distubeYtdlVersion = dependencies['@distube/ytdl-core'];




        const systemStatusString =
            `**${platform}** Platform\n` +
            `**${uptimeString}** Uptime\n` +
            `**${cpuUsage}% @ ${cpuCores} cores** CPU usage\n` +
            `**${usedMemoryInMB} / ${totalMemoryInMb} MB** Memory usage`;

        const dependenciesString =
            `**${discordJsVersion}** discord.js\n` +
            `**┗ ${restVersion}** @discordjs/rest\n` +
            `**${discordPlayerVersion}** discord-player\n` +
            `**┗ ${opusVersion}** @discord-player/opus\n` +
            `**┗ ${extractorVersion}** @discord-player/extractor\n` +
            `**${voiceVersion}** discord-voip\n` +
            `**${mediaplexVersion}** mediaplex\n` +
            `**${distubeYtdlVersion}** @distube/ytdl-core`;

        const discordStatusString = `**${interaction.client.ws.ping} ms** Discord API latency`;

        console.debug('Transformed system status into embed description.');

        console.debug('Responding with info embed.');
        return await interaction.editReply({
            embeds: [
                new EmbedBuilder()
                    .setDescription(`**${embedOptions.icons.bot} Bot status**\n––––––––––––––––––––––––––––––––––––––`)
                    .addFields(
                        {
                            name: `**${embedOptions.icons.server} System status**`,
                            value: systemStatusString,
                            inline: false
                        },
                        {
                            name: `**${embedOptions.icons.discord} Discord status**`,
                            value: discordStatusString,
                            inline: false
                        },
                        {
                            name: `**${embedOptions.icons.bot} Dependencies**`,
                            value: dependenciesString,
                            inline: false
                        }
                    )
                    .setColor(embedOptions.colors.info)
            ]
        });
    }
};
