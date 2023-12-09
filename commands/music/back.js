const config = require('config');
const embedOptions = config.get('embedOptions');
const { notInVoiceChannel, notInSameVoiceChannel } = require('../../utilities/validation/voiceChannelValidator');
const { queueDoesNotExist, queueNoCurrentTrack } = require('../../utilities/validation/queueValidator');
const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { useQueue, useHistory} = require('discord-player');

module.exports = {
    isNew: false,
    isBeta: false,
    data: new SlashCommandBuilder()
        .setName('back')
        .setDescription('Go back a track.')
        .setDMPermission(false)
        .setNSFW(false),
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

        const history = useHistory(interaction.guild.id);


        if (!history.tracks.size) {
            return await interaction.editReply({
                embeds: [
                    new EmbedBuilder()
                        .setAuthor({
                            name: interaction.member.nickname || interaction.user.username,
                            iconURL: interaction.user.avatarURL()
                        })
                        .setDescription(
                            `**${embedOptions.icons.warning} Cannot go back a track. This seems to be the first song in the queue.**` +
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
                        .setColor(embedOptions.colors.warning)
                ]
            });
        }


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

            const backedTrack = queue.currentTrack;
            let durationFormat =
                backedTrack.raw.duration === 0 || backedTrack.duration === '0:00'
                    ? ''
                    : `\`${backedTrack.duration}\``;

            if (backedTrack.raw.live) {
                durationFormat = `${embedOptions.icons.liveTrack} \`LIVE\``;
            }
        await history.previous();
            console.debug('Went back a track.');

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
                            `**${embedOptions.icons.back} Went back a track**\n**${durationFormat} [${
                                backedTrack.title
                            }](${backedTrack.raw.url ?? backedTrack.url})**` +
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
                        .setThumbnail(backedTrack.thumbnail)
                        .setColor(embedOptions.colors.success)
                ]
            });
        }

};
