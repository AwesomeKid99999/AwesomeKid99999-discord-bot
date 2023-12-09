const config = require('config');
const embedOptions = config.get('embedOptions');
const ffmpegFilterOptionsPage1 = config.get('ffmpegFilterOptionsPage1');
const ffmpegFilterOptionsPage2 = config.get('ffmpegFilterOptionsPage2');
const { notInVoiceChannel, notInSameVoiceChannel } = require('../../utilities/validation/voiceChannelValidator');
const { queueDoesNotExist, queueNoCurrentTrack } = require('../../utilities/validation/queueValidator');
const {
    SlashCommandBuilder,
    EmbedBuilder,
    ActionRowBuilder,
    StringSelectMenuBuilder,
    StringSelectMenuOptionBuilder,
    ButtonBuilder
} = require('discord.js');
const { useQueue } = require('discord-player');

module.exports = {
    isNew: false,
    isBeta: false,
    data: new SlashCommandBuilder()
        .setName('filters')
        .setDescription('Toggle various audio filters during playback.')
        .setDMPermission(false)
        .setNSFW(false)
		.addIntegerOption(option => option
			.setName('page')
			.setDescription('page number')
            .setMinValue(1)
            .setMaxValue(2)
            .setRequired(true)),
            
    async execute ( interaction, executionId ) {
        
        const pageNumber = interaction.options.getInteger('page');

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

        let filterOptions = [];

        if (pageNumber == 1) {
            ffmpegFilterOptionsPage1.availableFilters.forEach((filter) => {
                let isEnabled = false;
    
                if (queue.filters.ffmpeg.filters.includes(filter.value)) {
                    isEnabled = true;
                }
    
                filterOptions.push(
                    new StringSelectMenuOptionBuilder()
                        .setLabel(filter.label)
                        .setDescription(filter.description)
                        .setValue(filter.value)
                        .setEmoji(filter.emoji)
                        .setDefault(isEnabled)
                );
            });
    
            const filterSelect = new StringSelectMenuBuilder()
                .setCustomId('filters')
                .setPlaceholder('Select multiple options.')
                .setMinValues(0)
                .setMaxValues(filterOptions.length)
                .addOptions(filterOptions);
    
            const filterActionRow = new ActionRowBuilder().addComponents(filterSelect);
    
            const disableFiltersActionRow = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId('disable-filters')
                    .setLabel('Disable all filters')
                    .setStyle('Secondary')
                    .setEmoji(embedOptions.icons.disable)
            );
    
            console.debug('Sending info embed with action row components.');
            const response = await interaction.editReply({
                embeds: [
                    new EmbedBuilder()
                        .setDescription(
                            `**Toggle filters** ${embedOptions.icons.beta} (Page 1)\nEnable or disable audio filters for playback from the menu.`
                        )
                        .setColor(embedOptions.colors.info)
                        .setFooter({ text: `Powered by Cadence Music Bot` })
                ],
                components: [filterActionRow, disableFiltersActionRow]
            });
    
            const collectorFilter = (i) => i.user.id === interaction.user.id;
            try {
                const confirmation = await response.awaitMessageComponent({
                    filter: collectorFilter,
                    time: 300_000
                });
    
                confirmation.deferUpdate();
    
                console.debug('Received component interaction response.');
    
                queue.filters.ffmpeg.setInputArgs([
                    '-threads',
                    ffmpegFilterOptionsPage1.threadAmount,
                    '-reconnect',
                    '1',
                    '-reconnect_streamed',
                    '1',
                    '-reconnect_delay_max',
                    '10',
                    '-vn'
                ]);
    
                // Reset filters before enabling provided filters
                if (queue.filters.ffmpeg.filters.length > 0) {
                    queue.filters.ffmpeg.setFilters(false);
                    console.debug('Reset queue filters.');
                }
    
                if (confirmation.customId === 'disable-filters' || confirmation.values.length === 0) {
                    console.debug('Responding with success embed.');
                    return await interaction.editReply({
                        embeds: [
                            new EmbedBuilder()
                                .setAuthor({
                                    name: interaction.member.nickname || interaction.user.username,
                                    iconURL: interaction.user.avatarURL()
                                })
                                .setDescription(
                                    `**${embedOptions.icons.success} Disabled filters**\nAll audio filters have been disabled.`
                                )
                                .setColor(embedOptions.colors.success)
                        ],
                        components: []
                    });
                }
    
                // if bassboost is enabled and not normalizer, also enable normalizer to avoid distrorion
                if (
                    (confirmation.values.includes('bassboost_low') || confirmation.values.includes('bassboost')) &&
                    !confirmation.values.includes('normalizer')
                ) {
                    confirmation.values.push('normalizer');
                }
    
                // Enable provided filters
                queue.filters.ffmpeg.toggle(confirmation.values);
                console.debug(`Enabled filters ${confirmation.values.join(', ')}.`);
    
                console.debug('Responding with success embed.');
                return await interaction.editReply({
                    embeds: [
                        new EmbedBuilder()
                            .setAuthor({
                                name: interaction.member.nickname || interaction.user.username,
                                iconURL: interaction.user.avatarURL()
                            })
                            .setDescription(
                                `**${
                                    embedOptions.icons.success
                                } (Page 1) Filters toggled**\nNow using these filters:\n${confirmation.values
                                    .map((enabledFilter) => {
                                        let filter = ffmpegFilterOptionsPage1.availableFilters.find(
                                            (filter) => enabledFilter == filter.value
                                        );
    
                                        return `- **${filter.emoji} ${filter.label}**`;
                                    })
                                    .join('\n')}`
                            )
                            .setColor(embedOptions.colors.success)
                            .setFooter({ text: `Powered by Cadence Music Bot` })
                    ],
                    components: []
                });
            } catch (error) {
                if (error.code === 'InteractionCollectorError') {
                    console.debug('Interaction response timed out.');
                    return;
                }
    
                console.error(error, 'Unhandled error while awaiting or handling component interaction.');
            }
        }
        
        if (pageNumber == 2) {
            ffmpegFilterOptionsPage2.availableFilters.forEach((filter) => {
                let isEnabled = false;
    
                if (queue.filters.ffmpeg.filters.includes(filter.value)) {
                    isEnabled = true;
                }
    
                filterOptions.push(
                    new StringSelectMenuOptionBuilder()
                        .setLabel(filter.label)
                        .setDescription(filter.description)
                        .setValue(filter.value)
                        .setEmoji(filter.emoji)
                        .setDefault(isEnabled)
                );
            });
    
            const filterSelect = new StringSelectMenuBuilder()
                .setCustomId('filters')
                .setPlaceholder('Select multiple options.')
                .setMinValues(0)
                .setMaxValues(filterOptions.length)
                .addOptions(filterOptions);
    
            const filterActionRow = new ActionRowBuilder().addComponents(filterSelect);
    
            const disableFiltersActionRow = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId('disable-filters')
                    .setLabel('Disable all filters')
                    .setStyle('Secondary')
                    .setEmoji(embedOptions.icons.disable)
            );
    
            console.debug('Sending info embed with action row components.');
            const response = await interaction.editReply({
                embeds: [
                    new EmbedBuilder()
                        .setDescription(
                            `**Toggle filters** ${embedOptions.icons.beta} (Page 2)\nEnable or disable audio filters for playback from the menu.`
                        )
                        .setColor(embedOptions.colors.info)
                        .setFooter({ text: `Powered by Cadence Music Bot` })
                ],
                components: [filterActionRow, disableFiltersActionRow]
            });
    
            const collectorFilter = (i) => i.user.id === interaction.user.id;
            try {
                const confirmation = await response.awaitMessageComponent({
                    filter: collectorFilter,
                    time: 300_000
                });
    
                confirmation.deferUpdate();
    
                console.debug('Received component interaction response.');
    
                queue.filters.ffmpeg.setInputArgs([
                    '-threads',
                    ffmpegFilterOptionsPage2.threadAmount,
                    '-reconnect',
                    '1',
                    '-reconnect_streamed',
                    '1',
                    '-reconnect_delay_max',
                    '10',
                    '-vn'
                ]);
    
                // Reset filters before enabling provided filters
                if (queue.filters.ffmpeg.filters.length > 0) {
                    queue.filters.ffmpeg.setFilters(false);
                    console.debug('Reset queue filters.');
                }
    
                if (confirmation.customId === 'disable-filters' || confirmation.values.length === 0) {
                    console.debug('Responding with success embed.');
                    return await interaction.editReply({
                        embeds: [
                            new EmbedBuilder()
                                .setAuthor({
                                    name: interaction.member.nickname || interaction.user.username,
                                    iconURL: interaction.user.avatarURL()
                                })
                                .setDescription(
                                    `**${embedOptions.icons.success} Disabled filters**\nAll audio filters have been disabled.`
                                )
                                .setColor(embedOptions.colors.success)
                        ],
                        components: []
                    });
                }

    
                // Enable provided filters
                queue.filters.ffmpeg.toggle(confirmation.values);
                console.debug(`Enabled filters ${confirmation.values.join(', ')}.`);
    
                console.debug('Responding with success embed.');
                return await interaction.editReply({
                    embeds: [
                        new EmbedBuilder()
                            .setAuthor({
                                name: interaction.member.nickname || interaction.user.username,
                                iconURL: interaction.user.avatarURL()
                            })
                            .setDescription(
                                `**${
                                    embedOptions.icons.success
                                } (Page 2) Filters toggled**\nNow using these filters:\n${confirmation.values
                                    .map((enabledFilter) => {
                                        let filter = ffmpegFilterOptionsPage2.availableFilters.find(
                                            (filter) => enabledFilter == filter.value
                                        );
    
                                        return `- **${filter.emoji} ${filter.label}**`;
                                    })
                                    .join('\n')}`
                            )
                            .setColor(embedOptions.colors.success)
                            .setFooter({ text: `Powered by Cadence Music Bot` })
                    ],
                    components: []
                });
            } catch (error) {
                if (error.code === 'InteractionCollectorError') {
                    console.debug('Interaction response timed out.');
                    return;
                }
    
                console.error(error, 'Unhandled error while awaiting or handling component interaction.');
            }
        }
    }
};
