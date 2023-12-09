const config = require('config');
const embedOptions = config.get('embedOptions');
const { notInVoiceChannel, notInSameVoiceChannel } = require('../../utilities/validation/voiceChannelValidator');
const { queueDoesNotExist, queueNoCurrentTrack } = require('../../utilities/validation/queueValidator');
const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { useQueue } = require('discord-player');

module.exports = {
    isNew: false,
    isBeta: false,
    data: new SlashCommandBuilder()
        .setName('pause')
        .setDescription('Pause or resume the current track.')
        .setDMPermission(false)
        .setNSFW(false),
    async execute ( interaction, executionId )  {
        await interaction.deferReply();

        if (await notInVoiceChannel({ interaction, executionId })) {
            return;
        }

        const queue = useQueue(interaction.guild.id);

        if (await queueDoesNotExist({ interaction, queue, executionId })) {
            return;
        }

        if (await notInSameVoiceChannel({ interaction, queue, executionId })) {
            return;
        }

        if (await queueNoCurrentTrack({ interaction, queue, executionId })) {
            return;
        }

        let durationFormat =
            queue.currentTrack.raw.duration === 0 || queue.currentTrack.duration === '0:00'
                ? ''
                : `\`${queue.currentTrack.duration}\``;

        if (queue.currentTrack.raw.live) {
            durationFormat = `${embedOptions.icons.liveTrack} \`LIVE\``;
        }

        // change paused state to opposite of current state
        queue.node.setPaused(!queue.node.isPaused());
        console.debug(`Set paused state to ${queue.node.isPaused()}.`);

        console.debug('Responding with success embed.');
        return await interaction.editReply({
            embeds: [
                new EmbedBuilder()
                    .setAuthor({
                        name: interaction.member.nickname || interaction.user.username,
                        iconURL: interaction.user.avatarURL()
                    })
                    .setDescription(
                        `**${embedOptions.icons.pauseResumed} ${
                            queue.node.isPaused() ? 'Paused Track' : 'Resumed track'
                        }**\n**${durationFormat} [${queue.currentTrack.title}](${
                            queue.currentTrack.raw.url ?? queue.currentTrack.url
                        })**`
                    )
                    .setThumbnail(queue.currentTrack.thumbnail)
                    .setColor(embedOptions.colors.success)
                    .setFooter({ text: `Powered by Cadence Music Bot` })
            ]
        });
    }
};
