const config = require('config');
const embedOptions = config.get('embedOptions');
const botOptions = config.get('botOptions');
const playerOptions = config.get('playerOptions');
const { notInVoiceChannel, notInSameVoiceChannel } = require('../../utilities/validation/voiceChannelValidator');
const { cannotJoinVoiceOrTalk } = require('../../utilities/validation/permissionValidator');
const { transformQuery } = require('../../utilities/validation/searchQueryValidator');
const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { useMainPlayer, useQueue, QueryType } = require('discord-player');


module.exports = {
    data: new SlashCommandBuilder()
        .setName('play')
        .setDMPermission(false)
        .setDescription('Play music from a streaming service or from a file.')
        .addStringOption(option=> option
            .setName('query')
            .setDescription('The song\'s title'))
        .addStringOption(option => option
            .setName('path')
            .setDescription('The song\'s file path')),

    category: 'music',
    async execute (interaction, executionId) {

        await interaction.deferReply();

        if (await notInVoiceChannel({ interaction, executionId })) {
            return;
        }

        if (await cannotJoinVoiceOrTalk({ interaction, executionId })) {
            return;
        }

        let queue = useQueue(interaction.guild.id);
        if (queue && (await notInSameVoiceChannel({ interaction, queue, executionId }))) {
            return;
        }

        const player = useMainPlayer();
        const query = interaction.options.getString('query');
        const filePath = interaction.options.getString('path');

        if (!query && !filePath) {
            return await interaction.editReply({
                embeds: [
                    new EmbedBuilder()
                        .setDescription(
                            `**${embedOptions.icons.warning} You did not specify a query or file path.**`
                        )
                        .setColor(embedOptions.colors.warning)
                        .setFooter({ text: `Powered by Cadence Music Bot` })
                ]
            });
        }

        if (query && filePath) {
            return await interaction.editReply({
                embeds: [
                    new EmbedBuilder()
                        .setDescription(
                            `**${embedOptions.icons.warning} You specified both a query and file path. Please only choose one.\nQuery: ${query}\nFile Path: ${filePath}**`
                        )
                        .setColor(embedOptions.colors.warning)
                        .setFooter({ text: `Powered by Cadence Music Bot` })
                ]
            });
        }

        if (filePath) {

            queue = useQueue(interaction.guild.id);
            let queueSize = queue?.size ?? 0;


            let track;



            try {
                console.debug(`Attempting to add track with player.play(). File path: '${filePath}'.`);

                ({ track } = await player.play(interaction.member.voice.channel, filePath, {
                    searchEngine: QueryType.FILE,
                    requestedBy: interaction.user,
                    nodeOptions: {
                        leaveOnEmpty: playerOptions.leaveOnEmpty ?? true,
                        leaveOnEmptyCooldown: playerOptions.leaveOnEmptyCooldown ?? 300_000,
                        leaveOnEnd: playerOptions.leaveOnEnd ?? true,
                        leaveOnEndCooldown: playerOptions.leaveOnEndCooldown ?? 300_000,
                        leaveOnStop: playerOptions.leaveOnStop ?? true,
                        leaveOnStopCooldown: playerOptions.leaveOnStopCooldown ?? 300_000,
                        maxSize: playerOptions.maxQueueSize ?? 1000,
                        maxHistorySize: playerOptions.maxHistorySize ?? 100,
                        volume: playerOptions.defaultVolume ?? 50,
                        bufferingTimeout: playerOptions.bufferingTimeout ?? 3000,
                        connectionTimeout: playerOptions.connectionTimeout ?? 30000,
                        metadata: {
                            channel: interaction.channel,
                            client: interaction.client,
                            requestedBy: interaction.user,
                            track: filePath
                        }
                    }
                }));
            } catch (error) {

                if (!track) {
                    console.debug(`No results found for file path: '${filePath}'`);

                    console.debug('Responding with warning embed.');
                    return await interaction.editReply({
                        embeds: [
                            new EmbedBuilder()
                                .setDescription(
                                    `**${embedOptions.icons.warning} No track found**\nNo results found for \`${filePath}\``
                                )
                                .setColor(embedOptions.colors.warning)
                                .setFooter({ text: `Powered by Cadence Music Bot` })
                        ]
                    });
                }

                if (error.message === 'Cancelled') {
                    console.debug(error, `Operation cancelled. File path: ${filePath}.`);

                    console.debug('Responding with error embed.');
                    return await interaction.editReply({
                        embeds: [
                            new EmbedBuilder()
                                .setDescription(
                                    `**${embedOptions.icons.error} Uh-oh... Failed to add track!**\nSomething unexpected happened and the operation was cancelled.\n\nYou can try to perform the command again.\n\n_If you think this message is incorrect, please submit a bug report in the **[support server](${botOptions.serverInviteUrl})**._`
                                )
                                .setColor(embedOptions.colors.error)
                                .setFooter({ text: `Execution ID: ${executionId} || Powered by Cadence Music Bot` })
                        ]
                    });
                }



                console.error(error, 'Failed to play track with player.play(), unhandled error.');
            }

            console.debug(`Successfully added track with player.play(). File path: '${filePath}'.`);

            queue = useQueue(interaction.guild.id);

            if (!queue) {
                console.warn(`After player.play(), queue is undefined. File path: '${filePath}'.`);

                console.debug('Responding with error embed.');
                return await interaction.editReply({
                    embeds: [
                        new EmbedBuilder()
                            .setDescription(
                                `**${embedOptions.icons.error} Uh-oh... Failed to add track!**\nThere was an issue adding this track to the queue.\n\nYou can try to perform the command again.\n\n_If this problem persists, please submit a bug report in the **[support server](${botOptions.serverInviteUrl})**._`
                            )
                            .setColor(embedOptions.colors.error)
                            .setFooter({ text: `Execution ID: ${executionId} || Powered by Cadence Music Bot` })
                    ]
                });
            }

            if (
                track.source.length === 0 ||
                track.source === 'arbitrary' ||
                track.thumbnail === null ||
                track.thumbnail === undefined ||
                track.thumbnail === ''
            ) {
                console.debug(
                    `Track found but source is arbitrary or missing thumbnail. Using fallback thumbnail url. Query: '${filePath}'.`
                );
                track.thumbnail = embedOptions.info.fallbackThumbnailUrl;
            }

            let durationFormat = track.raw.duration === 0 || track.duration === '0:00' ? '' : `\`${track.duration}\``;

            if (track.raw.live) {
                durationFormat = `${embedOptions.icons.liveTrack} \`LIVE\``;
            }


            if (queue.currentTrack === track && queue.tracks.data.length === 0) {
                console.debug(`Track found and added with player.play(), started playing. File path: '${filePath}'.`);

                console.debug('Responding with success embed.');
                return await interaction.editReply({
                    embeds: [
                        new EmbedBuilder()
                            .setAuthor({
                                name:
                                    interaction.member.nickname || interaction.member.nickname || interaction.user.username,
                                iconURL: interaction.user.avatarURL()
                            })
                            .setDescription(
                                `**${embedOptions.icons.audioStartedPlaying} Started playing**\n**${durationFormat} [${
                                    track.title
                                }](${track.raw.url ?? track.url})**`
                            )
                            .setThumbnail(track.thumbnail)
                            .setColor(embedOptions.colors.success)
                            .setFooter({ text: `Powered by Cadence Music Bot` })
                    ]
                });
            }

            console.debug(`Track found and added with player.play(), added to queue. File path: '${filePath}'.`);

            console.debug('Responding with success embed.');
            return await interaction.editReply({
                embeds: [
                    new EmbedBuilder()
                        .setAuthor({
                            name: interaction.member.nickname || interaction.user.username,
                            iconURL: interaction.user.avatarURL()
                        })
                        .setDescription(
                            `${embedOptions.icons.success} **Added to queue**\n**${durationFormat} [${track.title}](${
                                track.raw.url ?? track.url
                            })**`
                        )
                        .setThumbnail(track.thumbnail)
                        .setColor(embedOptions.colors.success)
                        .setFooter({ text: `Powered by Cadence Music Bot` })
                ]
            });

        }

        if (query) {
            const transformedQuery = await transformQuery({ query, executionId });

            let searchResult;

            try {
                searchResult = await player.search(transformedQuery, {
                    requestedBy: interaction.user
                });
            } catch (error) {
                console.error(error, `Failed to search for track with player.search() with query: ${transformedQuery}.`);
            }

            if (!searchResult || searchResult.tracks.length === 0) {
                console.debug(`No results found for query: '${query}'`);

                console.debug('Responding with warning embed.');
                return await interaction.editReply({
                    embeds: [
                        new EmbedBuilder()
                            .setDescription(
                                `**${embedOptions.icons.warning} No track found**\nNo results found for \`${transformedQuery}\`.\n\nIf you specified a URL, please make sure it is valid and public.`
                            )
                            .setColor(embedOptions.colors.warning)
                            .setFooter({ text: `Powered by Cadence Music Bot` })
                    ]
                });
            }

            queue = useQueue(interaction.guild.id);
            let queueSize = queue?.size ?? 0;

            if ((searchResult.playlist && searchResult.tracks.length) > playerOptions.maxQueueSize - queueSize) {
                console.debug(`Playlist found but would exceed max queue size. Query: '${query}'.`);

                console.debug('Responding with warning embed.');
                return await interaction.editReply({
                    embeds: [
                        new EmbedBuilder()
                            .setDescription(
                                `**${embedOptions.icons.warning} Playlist too large**\nThis playlist is too large to be added to the queue.\n\nThe maximum amount of tracks that can be added to the queue is **${playerOptions.maxQueueSize}**.`
                            )
                            .setColor(embedOptions.colors.warning)
                            .setFooter({ text: `Powered by Cadence Music Bot` })
                    ]
                });
            }

            let track;

            try {
                console.debug(`Attempting to add track with player.play(). Query: '${query}'.`);

                ({ track } = await player.play(interaction.member.voice.channel, searchResult, {
                    requestedBy: interaction.user,
                    nodeOptions: {
                        leaveOnEmpty: playerOptions.leaveOnEmpty ?? true,
                        leaveOnEmptyCooldown: playerOptions.leaveOnEmptyCooldown ?? 300_000,
                        leaveOnEnd: playerOptions.leaveOnEnd ?? true,
                        leaveOnEndCooldown: playerOptions.leaveOnEndCooldown ?? 300_000,
                        leaveOnStop: playerOptions.leaveOnStop ?? true,
                        leaveOnStopCooldown: playerOptions.leaveOnStopCooldown ?? 300_000,
                        maxSize: playerOptions.maxQueueSize ?? 1000,
                        maxHistorySize: playerOptions.maxHistorySize ?? 100,
                        volume: playerOptions.defaultVolume ?? 50,
                        bufferingTimeout: playerOptions.bufferingTimeout ?? 3000,
                        connectionTimeout: playerOptions.connectionTimeout ?? 30000,
                        metadata: {
                            channel: interaction.channel,
                            client: interaction.client,
                            requestedBy: interaction.user,
                            track: searchResult.tracks[0]
                        }
                    }
                }));
            } catch (error) {
                if (error.message.includes('Sign in to confirm your age')) {
                    console.debug('Found track but failed to retrieve audio due to age confirmation warning.');

                    console.debug('Responding with warning embed.');
                    return await interaction.editReply({
                        embeds: [
                            new EmbedBuilder()
                                .setDescription(
                                    `**${embedOptions.icons.warning} Cannot retrieve audio for track**\nThis audio source is age restricted and requires login to access. Because of this I cannot retrieve the audio for the track.\n\n_If you think this message is incorrect, please submit a bug report in the **[support server](${botOptions.serverInviteUrl})**._`
                                )
                                .setColor(embedOptions.colors.warning)
                                .setFooter({ text: `Powered by Cadence Music Bot` })
                        ]
                    });
                }

                if (error.message.includes('The following content may contain')) {
                    console.debug('Found track but failed to retrieve audio due to graphic/mature/sensitive topic warning.');

                    console.debug('Responding with warning embed.');
                    return await interaction.editReply({
                        embeds: [
                            new EmbedBuilder()
                                .setDescription(
                                    `**${embedOptions.icons.warning} Cannot retrieve audio for track**\nThis audio source cannot be played as the video source has a warning for graphic or sensistive topics. It requires a manual confirmation to to play the video, and because of this I am unable to extract the audio for this source.\n\n_If you think this message is incorrect, please submit a bug report in the **[support server](${botOptions.serverInviteUrl})**._`
                                )
                                .setColor(embedOptions.colors.warning)
                                .setFooter({ text: `Powered by Cadence Music Bot` })
                        ]
                    });
                }

                if (
                    (error.type === 'TypeError' &&
                        (error.message.includes('Cannot read properties of null (reading \'createStream\')') ||
                            error.message.includes('Failed to fetch resources for ytdl streaming'))) ||
                    error.message.includes('Could not extract stream for this track')
                ) {
                    console.debug(error, `Found track but failed to retrieve audio. Query: ${query}.`);

                    console.debug('Responding with error embed.');
                    return await interaction.editReply({
                        embeds: [
                            new EmbedBuilder()
                                .setDescription(
                                    `**${embedOptions.icons.error} Uh-oh... Failed to add track!**\nAfter finding a result, I was unable to retrieve audio for the track.\n\nYou can try to perform the command again.\n\n_If you think this message is incorrect, please submit a bug report in the **[support server](${botOptions.serverInviteUrl})**._`
                                )
                                .setColor(embedOptions.colors.error)
                                .setFooter({ text: `Execution ID: ${executionId} || Powered by Cadence Music Bot` })
                        ]
                    });
                }

                if (error.message === 'Cancelled') {
                    console.debug(error, `Operation cancelled. Query: ${query}.`);

                    console.debug('Responding with error embed.');
                    return await interaction.editReply({
                        embeds: [
                            new EmbedBuilder()
                                .setDescription(
                                    `**${embedOptions.icons.error} Uh-oh... Failed to add track!**\nSomething unexpected happened and the operation was cancelled.\n\nYou can try to perform the command again.\n\n_If you think this message is incorrect, please submit a bug report in the **[support server](${botOptions.serverInviteUrl})**._`
                                )
                                .setColor(embedOptions.colors.error)
                                .setFooter({ text: `Execution ID: ${executionId} || Powered by Cadence Music Bot` })
                        ]
                    });
                }

                if (error.message === 'Cannot read properties of null (reading \'createStream\')') {
                    // Can happen if /play then /leave before track starts playing
                    console.warn(error, 'Found track but failed to play back audio. Voice connection might be unavailable.');

                    console.debug('Responding with error embed.');
                    return await interaction.editReply({
                        embeds: [
                            new EmbedBuilder()
                                .setDescription(
                                    `**${embedOptions.icons.error} Uh-oh... Failed to add track!**\nSomething unexpected happened and it was not possible to start playing the track. This could happen if the voice connection is lost or queue is destroyed while adding the track.\n\nYou can try to perform the command again.\n\n_If you think this message is incorrect, please submit a bug report in the **[support server](${botOptions.serverInviteUrl})**._`
                                )
                                .setColor(embedOptions.colors.error)
                                .setFooter({ text: `Execution ID: ${executionId} || Powered by Cadence Music Bot` })
                        ]
                    });
                }

                console.error(error, 'Failed to play track with player.play(), unhandled error.');
            }

            console.debug(`Successfully added track with player.play(). Query: '${query}'.`);

            queue = useQueue(interaction.guild.id);

            if (!queue) {
                console.warn(`After player.play(), queue is undefined. Query: '${query}'.`);

                console.debug('Responding with error embed.');
                return await interaction.editReply({
                    embeds: [
                        new EmbedBuilder()
                            .setDescription(
                                `**${embedOptions.icons.error} Uh-oh... Failed to add track!**\nThere was an issue adding this track to the queue.\n\nYou can try to perform the command again.\n\n_If this problem persists, please submit a bug report in the **[support server](${botOptions.serverInviteUrl})**._`
                            )
                            .setColor(embedOptions.colors.error)
                            .setFooter({ text: `Execution ID: ${executionId} || Powered by Cadence Music Bot` })
                    ]
                });
            }

            if (
                track.source.length === 0 ||
                track.source === 'arbitrary' ||
                track.thumbnail === null ||
                track.thumbnail === undefined ||
                track.thumbnail === ''
            ) {
                console.debug(
                    `Track found but source is arbitrary or missing thumbnail. Using fallback thumbnail url. Query: '${query}'.`
                );
                track.thumbnail = embedOptions.info.fallbackThumbnailUrl;
            }

            let durationFormat = track.raw.duration === 0 || track.duration === '0:00' ? '' : `\`${track.duration}\``;

            if (track.raw.live) {
                durationFormat = `${embedOptions.icons.liveTrack} \`LIVE\``;
            }

            if (searchResult.playlist && searchResult.tracks.length > 1) {
                console.debug(`Playlist found and added with player.play(). Query: '${query}'`);

                console.debug('Responding with success embed.');
                return await interaction.editReply({
                    embeds: [
                        new EmbedBuilder()
                            .setAuthor({
                                name: interaction.member.nickname || interaction.user.username,
                                iconURL: interaction.user.avatarURL()
                            })
                            .setDescription(
                                `**${embedOptions.icons.success} Added playlist to queue**\n**${durationFormat} [${
                                    track.title
                                }](${track.raw.url ?? track.url})**\n\nAnd **${
                                    searchResult.tracks.length - 1
                                }** more tracks... **\`/queue\`** to view all.`
                            )
                            .setThumbnail(track.thumbnail)
                            .setColor(embedOptions.colors.success)
                            .setFooter({ text: `Powered by Cadence Music Bot` })
                    ]
                });
            }

            if (queue.currentTrack === track && queue.tracks.data.length === 0) {
                console.debug(`Track found and added with player.play(), started playing. Query: '${query}'.`);

                console.debug('Responding with success embed.');
                return await interaction.editReply({
                    embeds: [
                        new EmbedBuilder()
                            .setAuthor({
                                name:
                                    interaction.member.nickname || interaction.member.nickname || interaction.user.username,
                                iconURL: interaction.user.avatarURL()
                            })
                            .setDescription(
                                `**${embedOptions.icons.audioStartedPlaying} Started playing**\n**${durationFormat} [${
                                    track.title
                                }](${track.raw.url ?? track.url})**`
                            )
                            .setThumbnail(track.thumbnail)
                            .setColor(embedOptions.colors.success)
                            .setFooter({ text: `Powered by Cadence Music Bot` })
                    ]
                });
            }

            console.debug(`Track found and added with player.play(), added to queue. Query: '${query}'.`);

            console.debug('Responding with success embed.');
            return await interaction.editReply({
                embeds: [
                    new EmbedBuilder()
                        .setAuthor({
                            name: interaction.member.nickname || interaction.user.username,
                            iconURL: interaction.user.avatarURL()
                        })
                        .setDescription(
                            `${embedOptions.icons.success} **Added to queue**\n**${durationFormat} [${track.title}](${
                                track.raw.url ?? track.url
                            })**`
                        )
                        .setThumbnail(track.thumbnail)
                        .setColor(embedOptions.colors.success)
                        .setFooter({ text: `Powered by Cadence Music Bot` })
                ]
            });

        }
    },
};
