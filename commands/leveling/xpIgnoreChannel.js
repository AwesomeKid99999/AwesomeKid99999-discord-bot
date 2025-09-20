const { SlashCommandBuilder, PermissionsBitField } = require('discord.js');
const {XPIgnoredChannels, XPSettings} = require('../../models/');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ignorexpchannel')
        .setDescription('Add or remove a channel from the ignored XP list.')
        .setDMPermission(false)
        .addSubcommand(subcommand =>
            subcommand
                .setName('add')
                .setDescription('Add a channel to the ignored XP list.')
                .addChannelOption(option =>
                    option.setName('channel')
                        .setDescription('The channel to ignore XP in')
                        .setRequired(true)
                )
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('list')
                .setDescription('View the channels in the ignored XP list.')
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('remove')
                .setDescription('Remove a channel from the ignored XP list.')
                .addChannelOption(option =>
                    option.setName('channel')
                        .setDescription('The channel to stop ignoring XP in')
                        .setRequired(true)
                )
        ),
    async execute(interaction) {
        const channel = interaction.options.getChannel('channel');
        const serverId = interaction.guild.id;

        // Check for necessary permissions
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageGuild)) {
            return interaction.reply({
                content: 'You do not have permission to manage XP ignored channels.',
                ephemeral: true,
            });
        }

        const xpSettings = await XPSettings.findOne({
            where: { serverId },
        });
        if (!xpSettings) {
            interaction.reply(`XP settings not found for this server.`);
            return;
        }
        if (!xpSettings.enabled) {
            interaction.reply(`Leveling not enabled.`);
            return;
        }

        if (interaction.options.getSubcommand() === 'add') {
            // Add channel to the ignored list
            await XPIgnoredChannels.findOrCreate({
                where: { serverId, channelId: channel.id, channelName: channel.name },
                defaults: { serverId, channelId: channel.id, channelName: channel.name },
            });

            return interaction.reply({
                content: `XP will now be ignored in <#${channel.id}>.`,
                ephemeral: true,
            });
        } else if (interaction.options.getSubcommand() === 'remove') {
            // Remove channel from the ignored list
            const deleted = await XPIgnoredChannels.destroy({
                where: { serverId, channelId: channel.id },
            });

            if (deleted) {
                return interaction.reply({
                    content: `XP will no longer be ignored in <#${channel.id}>.`,
                    ephemeral: true,
                });
            } else {
                return interaction.reply({
                    content: `<#${channel.id}> is not in the ignored list.`,
                    ephemeral: true,
                });
            }
        }

        if (interaction.options.getSubcommand() === 'list') {
            try {
                // Fetch custom roles from the database
                const ignoredChannels = await XPIgnoredChannels.findAll({
                    where: { serverId: interaction.guild.id },
                });

                if (!ignoredChannels.length) {
                    await interaction.reply('There are no ignored XP channels in this server.');
                    return;
                }

                // Format the roles into a displayable string
                let channelsList = ignoredChannels
                    .map(channel => `**${channel.channelName}** (ID: ${channel.channelId})`)
                    .join('\n');

                // Check if the response exceeds Discord's 2000-character limit
                if (channelsList.length > 2000) {
                    const splitMessages = [];
                    let chunk = '';

                    // Split the roles into chunks
                    for (const line of channelsList.split('\n')) {
                        if ((chunk + line + '\n').length > 2000) {
                            splitMessages.push(chunk);
                            chunk = '';
                        }
                        chunk += line + '\n';
                    }
                    if (chunk) splitMessages.push(chunk);

                    // Send each chunk as a separate message
                    await interaction.reply({ content: 'The list of ignored XP channels is too long, splitting into multiple messages:' });
                    for (const message of splitMessages) {
                        await interaction.followUp({ content: message });
                    }
                } else {
                    // Send the roles list if it fits within the character limit
                    await interaction.reply({ content: channelsList });
                }
            } catch (error) {
                console.error(error);
                await interaction.reply('An error occurred while fetching ignored XP channels.');
            }
        }
    },
};