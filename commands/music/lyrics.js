const config = require('config');
const embedOptions = config.get('embedOptions');
const { notInVoiceChannel, notInSameVoiceChannel } = require('../../utilities/validation/voiceChannelValidator');
const { queueDoesNotExist, queueNoCurrentTrack } = require('../../utilities/validation/queueValidator');
const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { useMainPlayer, useQueue, QueryType } = require('discord-player');
const { lyricsExtractor } = require('@discord-player/extractor');

const recentQueries = new Map();


module.exports = {
    isNew: false,
    isBeta: false,
    data: new SlashCommandBuilder()
        .setName('lyrics')
        .setDescription('Get lyrics from Genius for current or specified track.')
        .setDMPermission(false)
        .setNSFW(false)
        .addStringOption((option) =>
            option
                .setName('query')
                .setDescription('Search query or URL.')
                .setRequired(false)
                .setMinLength(2)
                .setMaxLength(500)

        ),

    async execute ( interaction, executionId ) {

        await interaction.deferReply();

        const query = interaction.options.getString('query');
        const queue = useQueue(interaction.guild.id);
        let geniusSearchQuery = '';

        if (!query) {
            if (await notInVoiceChannel({ interaction, executionId })) {
                return;
            }

            if (await queueDoesNotExist({ interaction, queue, executionId })) {
                return;
            }

            if (await notInSameVoiceChannel({ interaction, queue, executionId })) {
                return;
            }

            if (await queueNoCurrentTrack({ interaction, queue, executionId })) {
                return;
            }
            geniusSearchQuery = queue.currentTrack.title.slice(0, 50);

            console.debug(
                `No input query provided, using current track. Using query for genius: '${geniusSearchQuery}'`
            );
        }

        let searchResult;
        if (query) {
            console.debug(`Query input provided, using query '${query}' for player.search().`);
            const player = useMainPlayer();
            const searchResults = await player.search(query, {
                searchEngine: QueryType.SPOTIFY_SEARCH
            });

            if (searchResults.tracks.length === 0) {
                console.debug('No search results using player.search() found.');

                console.debug('Responding with warning embed.');
                return await interaction.editReply({
                    embeds: [
                        new EmbedBuilder()
                            .setDescription(
                                `**${embedOptions.icons.warning} No search results found**\nThere was no search results found for query **${query}**.`
                            )
                            .setColor(embedOptions.colors.warning)
                            .setFooter({ text: `Powered by Cadence Music Bot` })
                    ]
                });
            }

            searchResult = searchResults.tracks[0];
            geniusSearchQuery = searchResults.tracks[0].title;
            console.debug(`Using query for genius: '${geniusSearchQuery}'`);
        }

        // get lyrics
        const genius = lyricsExtractor();
        let lyricsResult = await genius.search(geniusSearchQuery).catch(() => null);

        // try again with shorter query (some titles just have added info in the end)
        if (!lyricsResult && geniusSearchQuery.length > 20) {
            console.debug(
                `No Genius lyrics found for query '${geniusSearchQuery}', trying again with shorter query (20 chars).`
            );
            lyricsResult = await genius.search(geniusSearchQuery.slice(0, 20)).catch(() => null);
        }
        if (!lyricsResult && geniusSearchQuery.length > 10) {
            console.debug(
                `No Genius lyrics found for query '${geniusSearchQuery}', trying again with shorter query (10 chars).`
            );
            lyricsResult = await genius.search(geniusSearchQuery.slice(0, 10)).catch(() => null);
        }

        // Check if authors in track from searchResult includes the artist name from genius
        if (searchResult && lyricsResult) {
            const searchResultAuthorIncludesArtist = searchResult.author
                .toLowerCase()
                .includes(lyricsResult.artist.name.toLowerCase());
            const lyricsResultArtistIncludesAuthor = lyricsResult.artist.name
                .toLowerCase()
                .includes(searchResult.author.toLowerCase());
            const searchResultAuthorSplitIncludesArtist = lyricsResult.artist.name
                .toLowerCase()
                .includes(searchResult.author.split(', ')[0].toLowerCase());

            if (
                !searchResultAuthorIncludesArtist &&
                !lyricsResultArtistIncludesAuthor &&
                !searchResultAuthorSplitIncludesArtist
            ) {
                lyricsResult = null;
                console.debug('Found Genius lyrics but artist name did not match from player.search() result.');
            }
        }

        if (!lyricsResult || !lyricsResult.lyrics) {
            console.debug('No matching lyrics found.');

            console.debug('Responding with warning embed.');
            return await interaction.editReply({
                embeds: [
                    new EmbedBuilder()
                        .setDescription(
                            `**${embedOptions.icons.warning} No lyrics found**\nThere was no Genius lyrics found for track **${geniusSearchQuery}**.`
                        )
                        .setColor(embedOptions.colors.warning)
                        .setFooter({ text: `Powered by Cadence Music Bot` })
                ]
            });
        }

        console.debug(`Successfully found matching Genius lyrics for query '${geniusSearchQuery}'.`);

        // If message length is too long, split into multiple messages
        if (lyricsResult.lyrics.length > 3800) {
            console.debug('Lyrics text too long, splitting into multiple messages.');
            const messageCount = Math.ceil(lyricsResult.lyrics.length / 3800);
            for (let i = 0; i < messageCount; i++) {
                console.debuf(`Lyrics, sending message ${i + 1} of ${messageCount}.`);
                const message = lyricsResult.lyrics.slice(i * 3800, (i + 1) * 3800);
                if (i === 0) {
                    console.debug('Responding with info embed for first message with lyrics.');
                    await interaction.editReply({
                        embeds: [
                            new EmbedBuilder()
                                .setDescription(
                                    `**${embedOptions.icons.queue} Showing lyrics**\n` +
                                        `**Track: [${lyricsResult.title}](${lyricsResult.url})**\n` +
                                        `**Artist: [${lyricsResult.artist.name}](${lyricsResult.artist.url})**` +
                                        `\n\n\`\`\`fix\n${message}\`\`\``
                                )
                                .setColor(embedOptions.colors.info)
                                .setFooter({ text: `Powered by Cadence Music Bot` })
                        ]
                    });
                    continue;
                } else {
                    console.debug('Sending consecutive message with lyrics.');
                    await interaction.channel.send({
                        embeds: [
                            new EmbedBuilder()
                                .setDescription(`\`\`\`fix\n${message}\`\`\``)
                                .setColor(embedOptions.colors.info)
                                .setFooter({ text: `Powered by Cadence Music Bot` })
                        ]
                    });
                }
            }

            return;
        }

        console.debug('Responding with info embed.');
        return await interaction.editReply({
            embeds: [
                new EmbedBuilder()
                    .setDescription(
                        `**${embedOptions.icons.queue} Showing lyrics**\n` +
                            `**Track: [${lyricsResult.title}](${lyricsResult.url})**\n` +
                            `**Artist: [${lyricsResult.artist.name}](${lyricsResult.artist.url})**` +
                            `\n\n\`\`\`fix\n${lyricsResult.lyrics}\`\`\``
                    )
                    .setColor(embedOptions.colors.info)
                    .setFooter({ text: `Powered by Cadence Music Bot` })
            ]
        });
    }
};
