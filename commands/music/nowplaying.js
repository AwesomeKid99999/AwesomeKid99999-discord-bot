const config = require('config');
const embedOptions = config.get('embedOptions');
const playerOptions = config.get('playerOptions');
const { notInVoiceChannel, notInSameVoiceChannel } = require('../../utilities/validation/voiceChannelValidator');
const { queueDoesNotExist, queueNoCurrentTrack } = require('../../utilities/validation/queueValidator');
const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ComponentType } = require('discord.js');
const { useQueue, useHistory } = require('discord-player');

module.exports = {
    isNew: false,
    isBeta: false,
    data: new SlashCommandBuilder()
        .setName('nowplaying')
        .setDescription('Show information about the track currently playing.')
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

        const sourceStringsFormatted = new Map([
            ['youtube', 'YouTube'],
            ['soundcloud', 'SoundCloud'],
            ['spotify', 'Spotify'],
            ['apple_music', 'Apple Music'],
            ['arbitrary', 'Direct source']
        ]);

        const sourceIcons = new Map([
            ['youtube', embedOptions.icons.sourceYouTube],
            ['soundcloud', embedOptions.icons.sourceSoundCloud],
            ['spotify', embedOptions.icons.sourceSpotify],
            ['apple_music', embedOptions.icons.sourceAppleMusic],
            ['arbitrary', embedOptions.icons.sourceArbitrary]
        ]);

        const currentTrack = queue.currentTrack;

        let author = currentTrack.author ? currentTrack.author : 'Unavailable';
        if (author === 'cdn.discordapp.com') {
            author = 'Unavailable';
        }
        let plays = currentTrack.views !== 0 ? currentTrack.views : 0;

        if (
            plays === 0 &&
            currentTrack.metadata.bridge &&
            currentTrack.metadata.bridge.views !== 0 &&
            currentTrack.metadata.bridge.views !== undefined
        ) {
            plays = currentTrack.metadata.bridge.views;
        } else if (plays === 0) {
            plays = 'Unavailable';
        }

        const source = sourceStringsFormatted.get(currentTrack.raw.source) ?? 'Unavailable';
        const queueLength = queue.tracks.data.length;
        const timestamp = queue.node.getTimestamp();
        let bar = `**\`${timestamp.current.label}\`** ${queue.node.createProgressBar({
            queue: false,
            length: playerOptions.progressBar.length ?? 12,
            timecodes: playerOptions.progressBar.timecodes ?? true,
            indicator: playerOptions.progressBar.indicator ?? '🔘',
            leftChar: playerOptions.progressBar.leftChar ?? '▬',
            rightChar: playerOptions.progressBar.rightChar ?? '▬'
        })} **\`${timestamp.total.label}\`**`;

        if (currentTrack.raw.duration === 0 || currentTrack.duration === '0:00') {
            bar = '_No duration available._';
        }

        if (currentTrack.raw.live) {
            bar = `${embedOptions.icons.liveTrack} **\`LIVE\`** - Playing continuously from live source.`;
        }

        const nowPlayingActionRow = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
            .setCustomId('nowplaying-back')
            .setLabel('Go back a track')
            .setStyle('Secondary')
            .setEmoji(embedOptions.icons.previousTrack),
            new ButtonBuilder()
            .setCustomId('nowplaying-pause')
            .setLabel('Play/Pause')
            .setStyle('Secondary')
            .setEmoji(embedOptions.icons.pauseResumeTrack),
            new ButtonBuilder()
                .setCustomId('nowplaying-skip')
                .setLabel('Skip track')
                .setStyle('Secondary')
                .setEmoji(embedOptions.icons.nextTrack)
        );

        const loopModesFormatted = new Map([
            [0, 'disabled'],
            [1, 'track'],
            [2, 'queue'],
            [3, 'autoplay']
        ]);

        const loopModeUserString = loopModesFormatted.get(queue.repeatMode);

        console.debug('Successfully retrieved information about the current track.');

        console.debug('Sending info embed with action row components.');
        const response = await interaction.editReply({
            embeds: [
                new EmbedBuilder()
                    .setAuthor({
                        name: `Channel: ${queue.channel.name} (${queue.channel.bitrate / 1000}kbps)`,
                        iconURL: interaction.guild.iconURL()
                    })
                    .setDescription(
                        (queue.node.isPaused()
                            ? '**Currently Paused**\n'
                            : `**${embedOptions.icons.audioPlaying} Now Playing**\n`) +
                            `**[${currentTrack.title}](${currentTrack.raw.url ?? currentTrack.url})**` +
                            `\nRequested by: <@${currentTrack.requestedBy.id}>` +
                            `\n ${bar}\n\n` +
                            `${
                                queue.repeatMode === 0
                                    ? ''
                                    : `**${
                                        queue.repeatMode === 3 ? embedOptions.icons.autoplay : embedOptions.icons.loop
                                    } Looping**\nLoop mode is set to ${loopModeUserString}. You can change it with **\`/loop\`**.`
                            }`
                    )
                    .addFields(
                        {
                            name: '**Author**',
                            value: author,
                            inline: true
                        },
                        {
                            name: '**Plays**',
                            value: plays.toLocaleString('en-US'),
                            inline: true
                        },
                        {
                            name: '**Track source**',
                            value: `**${sourceIcons.get(currentTrack.raw.source)} [${source}](${
                                currentTrack.raw.url ?? currentTrack.url
                            })**`,
                            inline: true
                        }
                    )
                    .setFooter({
                        text: queueLength ? `${queueLength} other tracks in the queue... || Powered by Cadence Music Bot` : 'Powered by Cadence Music Bot'

                    })
                    .setThumbnail(queue.currentTrack.thumbnail)
                    .setColor(embedOptions.colors.info)
            ],
            components: [nowPlayingActionRow]
        });

        console.debug(`User used command '${interaction.commandName}', finished sending response.`);

        const collector = response.createMessageComponentCollector({ componentType: ComponentType.Button, time: 300000 });
        collector.on ('collect', async (i) =>{

            if (i.user.id === interaction.user.id) {
                try {
            

                    
        
                    console.debug('Received component interaction response.');
        
                    console.log(`${i.customId}`);
        
                    if (i.customId === 'nowplaying-back') {
                        console.debug('Received back confirmation.');
                        const history = useHistory(interaction.guild.id);
        
                        if (!history.tracks.size) {
                            
                            return await interaction.followUp({
                                embeds: [
                                    new EmbedBuilder()
                                        .setAuthor({
                                            name: interaction.member.nickname || interaction.user.username,
                                            iconURL: interaction.user.avatarURL()
                                        })
                                        .setDescription(
                                            `**${embedOptions.icons.warning} Cannot go back track**` +
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
                                
                                return await interaction.followUp({
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
                            const loopModeUserString = loopModesFormatted.get(queue.repeatMode);
        
                    console.debug('Responding with success embed.');
                    
                    return await interaction.followUp({
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
        
        
        
                    if (i.customId === 'nowplaying-pause') {
                        console.debug(`Received play/pause confirmation.`);
        
                        let durationFormat =
                    queue.currentTrack.raw.duration === 0 || queue.currentTrack.duration === '0:00'
                        ? ''
                        : `\`${queue.currentTrack.duration}\``;
        
                if (queue.currentTrack.raw.live) {
                    durationFormat = `${embedOptions.icons.liveTrack} \`LIVE\``;
                }
        
                        queue.node.setPaused(!queue.node.isPaused());
                console.debug(`Set paused state to ${queue.node.isPaused()}.`);
        
                console.debug('Responding with success embed.');
                
                return await interaction.followUp({
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
        
        
        
                    if (i.customId === 'nowplaying-skip') {
                        console.debug('Received skip confirmation.');
                        if (!queue || (queue.tracks.data.length === 0 && !queue.currentTrack)) {
                            console.debug('Tried skipping track but there was no queue.');
        
                            console.debug('Responding with warning embed.');
                            
                            return await interaction.followUp({
                                embeds: [
                                    new EmbedBuilder()
                                        .setDescription(
                                            `**${embedOptions.icons.warning} Oops!**\nThere is nothing currently playing. First add some tracks with **\`/play\`**!`
                                        )
                                        .setColor(embedOptions.colors.warning)
                                        .setFooter({ text: `Powered by Cadence Music Bot` })
                                ],
                                components: []
                            });
                        }
                        
        
                        if (queue.currentTrack !== currentTrack) {
                            console.debug(
                                'Tried skipping track but it is not the current track and therefore already skipped/removed.'
                            );
        
                            console.debug('Responding with warning embed.');
                            
                            return await interaction.followUp({
                                embeds: [
                                    new EmbedBuilder()
                                        .setDescription(
                                            `**${embedOptions.icons.warning} Oops!**\nThis track has already been skipped or is no longer playing.`
                                        )
                                        .setColor(embedOptions.colors.warning)
                                        .setFooter({ text: `Powered by Cadence Music Bot` })
        
                                ],
                                components: []
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
                        console.debug('Skipped the track.');
        
                        const repeatModeUserString = loopModesFormatted.get(queue.repeatMode);
        
                        console.debug('Responding with success embed.');
                        
                        return await interaction.followUp({
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
                                                    } Looping**\nLoop mode is set to ${repeatModeUserString}. You can change it with **\`/loop\`**.`
                                            }`
                                    )
                                    .setThumbnail(skippedTrack.thumbnail)
                                    .setColor(embedOptions.colors.success)
                                    .setFooter({ text: `Powered by Cadence Music Bot` })
                            ],
                            components: []
                        });
                        
                    }
                } catch (error) {
                    if (error.code === 'InteractionCollectorError') {
                        console.debug('Interaction response timed out.');
                        return;
                    }
        
                    console.error(error, 'Unhandled error while awaiting or handling component interaction.');
                    return;
                }
            } else {
                
                return await interaction.followUp({
                    embeds: [
                        new EmbedBuilder()
                            .setAuthor({
                                name: interaction.member.nickname || interaction.user.username,
                                iconURL: interaction.user.avatarURL()
                            })
                            .setDescription(
                                `**${embedOptions.icons.warning} You do not have permission to click these buttons.**`
                            )
                            .setColor(embedOptions.colors.warning)
                            .setFooter({ text: `Powered by Cadence Music Bot` })
                    ],
                    components: []
                });
            
            }
            
        });
        
    }
};
