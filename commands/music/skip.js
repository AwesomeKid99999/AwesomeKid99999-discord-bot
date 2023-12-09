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
        .setName('skip')
        .setDescription('Skip current or specified track.')
        .setDMPermission(false)
        .setNSFW(false)
        .addNumberOption((option) =>
            option.setName('tracknumber').setDescription('Track number to skip to in the queue.').setMinValue(1)
        ),
    async execute (interaction, executionId) {





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

        const skipToTrack = interaction.options.getNumber('tracknumber');

        if (skipToTrack) {
            if (skipToTrack > queue.tracks.data.length) {
                console.debug('Specified track number was higher than total tracks.');

                console.debug('Responding with warning embed.');
                return await interaction.editReply({
                    embeds: [
                        new EmbedBuilder()
                            .setDescription(
                                `**${embedOptions.icons.warning} Oops!**\nThere are only \`${queue.tracks.data.length}\` tracks in the queue. You cannot skip to track \`${skipToTrack}\`.\n\nView tracks added to the queue with **\`/queue\`**.`
                            )
                            .setColor(embedOptions.colors.warning)
                    ]
                });
            } else {
                const skippedTrack = queue.currentTrack;
                let durationFormat =
                    skippedTrack.raw.duration === 0 || skippedTrack.duration === '0:00'
                        ? ''
                        : `\`${skippedTrack.duration}\``;

                if (skippedTrack.raw.live) {
                    durationFormat = `${embedOptions.icons.liveTrack} \`LIVE\``;
                }

                queue.node.skipTo(skipToTrack - 1);
                console.debug('Skipped to specified track number.');

                console.debug('Responding with success embed.');
                return await interaction.editReply({
                    embeds: [
                        new EmbedBuilder()
                            .setAuthor({
                                name: interaction.member.nickname || interaction.user.username,
                                iconURL: interaction.user.avatarURL()
                            })
                            .setDescription(
                                `**${embedOptions.icons.skipped} Skipped track**\n**${durationFormat} [${
                                    skippedTrack.title
                                }](${skippedTrack.raw.url ?? skippedTrack.url})**`
                            )
                            .setThumbnail(skippedTrack.thumbnail)
                            .setColor(embedOptions.colors.success)
                    ]
                });
            }
        } else {
            if (queue.tracks.data.length === 0 && !queue.currentTrack) {
                console.debug('No tracks in queue and no current track.');

                console.debug('Responding with warning embed.');
                return await interaction.editReply({
                    embeds: [
                        new EmbedBuilder()
                            .setDescription(
                                `**${embedOptions.icons.warning} Oops!**\nThere is nothing currently playing. First add some tracks with **\`/play\`**!`
                            )
                            .setColor(embedOptions.colors.warning)
                    ]
                });
            }

            const skippedTrack = queue.currentTrack;
            let durationFormat =
                skippedTrack.raw.duration === 0 || skippedTrack.duration === '0:00'
                    ? ''
                    : `\`${skippedTrack.duration}\``;

            if (skippedTrack.raw.live) {
                durationFormat = `${embedOptions.icons.liveTrack} \`LIVE\``;
            }
            queue.node.skip();
            console.debug('Skipped current track.');

            const loopModesFormatted = new Map([
                [0, 'disabled'],
                [1, 'track'],
                [2, 'queue'],
                [3, 'autoplay']
            ]);

            const loopModeUserString = loopModesFormatted.get(queue.repeatMode);

            console.debug('Responding with success embed.');
            return await interaction.editReply({
                embeds: [
                    new EmbedBuilder()
                        .setAuthor({
                            name: interaction.member.nickname || interaction.user.username,
                            iconURL: interaction.user.avatarURL()
                        })
                        .setDescription(
                            `**${embedOptions.icons.skipped} Skipped track**\n**${durationFormat} [${
                                skippedTrack.title
                            }](${skippedTrack.raw.url ?? skippedTrack.url})**` +
                                `${
                                    queue.repeatMode === 0
                                        ? ''
                                        : `\n\n**${
                                            queue.repeatMode === 3
                                                ? embedOptions.icons.autoplaying
                                                : embedOptions.icons.looping
                                        } Looping**\nLoop mode is set to ${loopModeUserString}. You can change it with **\`/loop\`**.`
                                }`
                        )
                        .setThumbnail(skippedTrack.thumbnail)
                        .setColor(embedOptions.colors.success)
                ]
            });
        }
    }
};
