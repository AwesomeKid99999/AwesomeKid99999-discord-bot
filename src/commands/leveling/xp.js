const { SlashCommandBuilder, PermissionsBitField, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const addXP = require('../../helpers/leveling/addXP');
const {XPSettings} = require("../../models/");
const removeXP = require("../../helpers/leveling/removeXP");
const {Embed, Level, XPIgnoredChannels, LevelRoles} = require("../../models");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('xp')
        .setDescription('Manage XP stuff in the server. (STAFF ONLY)')
        .setDMPermission(false)
        .addSubcommand(subcommand => subcommand
            .setName('add')
            .setDescription('Add XP to a user. (STAFF ONLY)')
            .addUserOption(option => option
                .setName('user')
                .setDescription('The user to add XP to')
                .setRequired(true))
            .addIntegerOption(option => option
                .setName('xp')
                .setDescription('Amount of XP to add')
                .setMinValue(0)
                .setRequired(true)))
        .addSubcommand(subcommand => subcommand
            .setName('remove')
            .setDescription('Remove XP from a user. (STAFF ONLY)')
            .addUserOption(option =>
                option.setName('user')
                    .setDescription('The user to remove XP from')
                    .setRequired(true))
            .addIntegerOption(option => option
                .setName('xp')
                .setDescription('Amount of XP to remove')
                .setMinValue(0)
                .setRequired(true)))
        .addSubcommand(subcommand => subcommand
            .setName('set')
            .setDescription('Set the total XP for a specific user. (STAFF ONLY)')
            .addUserOption(option =>
                option.setName('user')
                    .setDescription('The user to set the XP for')
                    .setRequired(true))
            .addIntegerOption(option =>
                option.setName('xp')
                    .setDescription('The new total XP value')
                    .setMinValue(0)
                    .setRequired(true)))
        .addSubcommandGroup(subcommandGroup => subcommandGroup
            .setName('reset')
            .setDescription('Reset a user\'s or the whole server\'s XP. (STAFF ONLY)')
            .addSubcommand(subcommand => subcommand
                .setName('user')
                .setDescription('Reset a user\'s XP. (STAFF ONLY)')
                .addUserOption(option => option
                    .setName('user')
                    .setDescription('The user whose XP you want to reset.')
                    .setRequired(true)))
            .addSubcommand(subcommand => subcommand
                .setName('server')
                .setDescription('Reset XP for all users in the server. (STAFF ONLY)')))
        .addSubcommandGroup(subcommandGroup => subcommandGroup
            .setName('settings')
            .setDescription('Set or view the XP settings for the server. (STAFF ONLY)')
            .addSubcommand(subcommand => subcommand
                .setName('change')
                .setDescription('Set the XP settings for the server. (STAFF ONLY)')
                .addIntegerOption(option => option
                    .setName('min_xp')
                    .setDescription('Minimum XP that can be awarded')
                    .setRequired(true))
                .addIntegerOption(option => option
                    .setName('max_xp')
                    .setDescription('Maximum XP that can be awarded')
                    .setRequired(true))
                .addNumberOption(option => option
                    .setName('multiplier')
                    .setDescription('Multiplier for XP')
                    .setMinValue(0.000000000000)
                    .setRequired(true))
                .addBooleanOption(option => option
                    .setName('enabled')
                    .setDescription('Whether or not to enable leveling')
                    .setRequired(true))
                .addIntegerOption(option => option
                    .setName('cooldown')
                    .setDescription('Cooldown of earning XP in seconds')
                    .setMinValue(0)
                    .setMaxValue(2147483647)
                    .setRequired(false))
                .addBooleanOption(option => option
                    .setName('effort_booster')
                    .setDescription('Whether or not to enable the effort booster')
                    .setRequired(false))
                .addNumberOption(option => option
                    .setName('effort_booster_multiplier')
                    .setDescription('The multiplier for the effort booster (Multiplies this value by number of characters)')
                    .setRequired(false)
                    .setMinValue(0))
                .addIntegerOption(option => option
                    .setName('base_xp')
                    .setDescription('Base XP required for the first level')
                    .setRequired(false)
                    .setMinValue(1))
                .addIntegerOption(option => option
                    .setName('xp_increment')
                    .setDescription('XP increment required for each subsequent level')
                    .setRequired(false)
                    .setMinValue(0))
                .addIntegerOption(option => option
                    .setName('starting_level')
                    .setDescription('The starting level')
                    .setRequired(false))
                .addStringOption(option => option
                    .setName('level_up_message')
                    .setDescription('Message to display when a user levels up')
                    .setMaxLength(1000))
                .addChannelOption(option => option
                    .setName('level_up_channel')
                    .setDescription('The channel to send the level up message'))
                .addStringOption(option => option
                    .setName('level_up_embed')
                    .setDescription('The name of the embed to show for level up messages (leave empty to remove)'))
                .addStringOption(option => option
                    .setName('rank_message')
                    .setDescription('Message to display when using the rank command')
                    .setMaxLength(1000))
                .addStringOption(option => option
                    .setName('rank_embed')
                    .setDescription('The name of the embed to show for rank command (leave empty to remove)')))
            .addSubcommand(subcommand => subcommand
                    .setName('view')
                    .setDescription('View the XP settings for the server. (STAFF ONLY)')))
        .addSubcommandGroup(subcommandGroup => subcommandGroup
            .setName('ignored_channels')
            .setDescription('Add or remove a channel from the ignored XP channels list. (STAFF ONLY)')
            .addSubcommand(subcommand => subcommand
                    .setName('add')
                    .setDescription('Add a channel to the ignored XP channel list. (STAFF ONLY)')
                    .addChannelOption(option =>
                        option.setName('channel')
                            .setDescription('The channel to ignore XP in')
                            .setRequired(true)))
            .addSubcommand(subcommand => subcommand
                    .setName('list')
                    .setDescription('View the channels in the ignored XP list. (STAFF ONLY)'))
            .addSubcommand(subcommand => subcommand
                    .setName('remove')
                    .setDescription('Remove a channel from the ignored XP list. (STAFF ONLY)')
                    .addChannelOption(option =>
                        option.setName('channel')
                            .setDescription('The channel to stop ignoring XP in')
                            .setRequired(true)))),
        category: 'leveling',
    async execute(interaction) {

        const subCommand = interaction.options.getSubcommand();
        const subCommandGroup = interaction.options.getSubcommandGroup();

        if (subCommandGroup === "reset") {
           if (subCommand === "user") {
               const user = interaction.options.getUser('user');
               const serverId = interaction.guild.id;

               if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageGuild)) {
                   return interaction.reply(':x: You do not have permission to run this command.');
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



               if (user.bot) {
                   return interaction.reply({ content: `Bots cannot get their XP reset.`, ephemeral: true });
               }



               // Check if the user has an XP record
               const userXP = await Level.findOne({
                   where: { userId: user.id, serverId }
               });


               if (!userXP) {
                   return interaction.reply({ content: `${user.username} does not have any XP data.`, ephemeral: true });
               }


               const row = new ActionRowBuilder().addComponents(
                   new ButtonBuilder()
                       .setCustomId(`confirm-reset-xp`)
                       .setLabel('Confirm')
                       .setStyle(ButtonStyle.Danger),
                   new ButtonBuilder()
                       .setCustomId(`cancel-reset-xp`)
                       .setLabel('Cancel')
                       .setStyle(ButtonStyle.Success)
               );


                   const response = await interaction.reply({content: `Are you sure you want to reset ${user.username}'s XP to 0?`,
                       components: [row],
                       withResponse: true,
                       ephemeral: true
                   });

               const collectorFilter = i => i.user.id === interaction.user.id;

               try {
                   const confirmation = await response.resource.message.awaitMessageComponent({ filter: collectorFilter, time: 60_000 });

                   if (confirmation.customId === 'confirm-reset-xp') {
                       await confirmation.update({ content: `Resetting ${user.username}'s XP...`, components: [] })
                       // Reset XP to 0
                       userXP.currentXp = 0;
                       userXP.totalXp = 0;
                       userXP.level = xpSettings.startingLevel;  // Reset to starting level

                       await userXP.save();

                       return interaction.editReply({ content: `${user.username}'s XP has been reset to 0!`, ephemeral: true });

                   } else if (confirmation.customId === 'cancel-reset-xp') {
                       return await confirmation.update({ content: `${user.username}'s XP has not been reset!`, components: [] });
                   }
               } catch (err) {
                   console.log(err)
                   return await interaction.editReply({ content: 'Confirmation not received within 1 minute, cancelling', components: [] });
               }




           }

           if (subCommand === "server") {
               const serverId = interaction.guild.id;

               // Check if the user has permission (for example, admin or staff role check)
               if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageGuild)) {
                   return interaction.reply({ content: 'You do not have permission to reset XP for all users.', ephemeral: true });
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

               // Find all user XP records in the server and reset them
               const allUsersXP = await Level.findAll({ where: { serverId } });

               if (allUsersXP.length === 0) {
                   return interaction.reply({ content: 'There are no XP records to reset.', ephemeral: true });
               }

               const row = new ActionRowBuilder().addComponents(
                   new ButtonBuilder()
                       .setCustomId(`confirm-reset-xp`)
                       .setLabel('Confirm')
                       .setStyle(ButtonStyle.Danger),
                   new ButtonBuilder()
                       .setCustomId(`cancel-reset-xp`)
                       .setLabel('Cancel')
                       .setStyle(ButtonStyle.Success)
               );

               const response = await interaction.reply({content: `Are you sure you want to reset everyone's XP to 0?`,
                   components: [row],
                   withResponse: true,
                   ephemeral: true
               });

               const collectorFilter = i => i.user.id === interaction.user.id;

               try {
                   const confirmation = await response.resource.message.awaitMessageComponent({ filter: collectorFilter, time: 60_000 });

                   if (confirmation.customId === 'confirm-reset-xp') {
                       await confirmation.update({ content: `Resetting everyone's XP...`, components: [] })
                       // Reset each user's XP
                       for (const userXP of allUsersXP) {
                           userXP.currentXp = 0;
                           userXP.totalXp = 0;
                           userXP.level = xpSettings.startingLevel;  // Reset all users to level 1
                           await userXP.save();
                       }

                       return interaction.editReply({ content: 'XP has been reset for all users in the server.', ephemeral: true });

                   } else if (confirmation.customId === 'cancel-reset-xp') {
                       return await confirmation.update({ content: `Everyone's XP has not been reset!`, components: [] });
                   }
               } catch (err) {
                   console.log(err)
                   return await interaction.editReply({ content: 'Confirmation not received within 1 minute, cancelling', components: [] });
               }


           }

        }

        if (subCommandGroup === "settings") {
            if (subCommand === 'view') {
                if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageGuild)) {
                    return interaction.reply({
                        content: 'You do not have permission to view the XP settings.',
                        ephemeral: true,
                    });
                }

                const xpSettings = await XPSettings.findOne({where: { serverId: interaction.guild.id }})
                if (!xpSettings) return await interaction.reply('XP settings not found for this server.');
                const minXP = xpSettings.minXP;
                const maxXP = xpSettings.maxXP;
                const multiplier = xpSettings.multiplier;
                const effortBooster = xpSettings.effortBooster;
                const effortBoosterMultiplier = xpSettings.effortBoosterMultiplier;
                const baseXp = xpSettings.baseXp;
                const xpIncrement = xpSettings.xpIncrement;
                const cooldown = xpSettings.cooldown;
                const levelUpMessage = xpSettings.levelUpMessage;
                const levelUpChannelId = xpSettings.levelUpChannelId;
                const levelUpEmbedId = xpSettings.levelUpEmbedId;
                const rankMessage = xpSettings.rankMessage;
                const rankEmbedId = xpSettings.rankEmbedId;
                const enabled = xpSettings.enabled;
                const startingLevel = xpSettings.startingLevel;

                let levelUpChannel;
                if (!levelUpChannelId) {
                    levelUpChannel = "current channel"
                } else {
                    levelUpChannel = await interaction.client.channels.fetch(levelUpChannelId).catch(() => null);
                    if (!levelUpChannel) {
                        return interaction.reply({ content: 'The level up channel no longer exists.', ephemeral: true });
                    }
                }

                let levelUpEmbed;
                if (!levelUpEmbedId) {
                    levelUpEmbed = "none"
                } else {
                    const embed = await Embed.findOne({ where: { id: levelUpEmbedId } });
                    if (!embed) {
                        levelUpEmbed = "deleted embed"
                    } else {
                        levelUpEmbed = embed.embedName;
                    }
                }

                let rankEmbed;
                if (!rankEmbedId) {
                    rankEmbed = "none"
                } else {
                    const embed = await Embed.findOne({ where: { id: rankEmbedId } });
                    if (!embed) {
                        rankEmbed = "deleted embed"
                    } else {
                        rankEmbed = embed.embedName;
                    }
                }

                return await interaction.reply({
                    content: `Here are the XP settings for this server:\n
            **Minimum XP:** ${minXP}
            **Maximum XP:** ${maxXP}
            **Multiplier:** ${multiplier}
            **Effort Booster Enabled:** ${effortBooster}
            **Effort Booster Multiplier:** ${effortBoosterMultiplier || 'Not set'}
            **Base XP:** ${baseXp}
            **XP Increment:** ${xpIncrement}
            **Cooldown:** ${cooldown} seconds
            **Starting Level:** ${startingLevel}
            **Level Up Message:** \`${levelUpMessage}\`
            **Level Up Channel:** ${levelUpChannel}
            **Level Up Embed:** ${levelUpEmbed}
            **Rank Message:** \`\`\`${rankMessage}\`\`\`
            **Rank Embed:** ${rankEmbed}
            **Enabled?** ${enabled}`,
                });

            }

            if (subCommand === 'change') {


                const serverId = interaction.guild.id;
                const minXP = interaction.options.getInteger('min_xp');
                const maxXP = interaction.options.getInteger('max_xp');
                const multiplier = interaction.options.getNumber('multiplier');
                const effortBooster = interaction.options.getBoolean('effort_booster');
                const effortBoosterMultiplier = interaction.options.getNumber('effort_booster_multiplier');
                const baseXp = interaction.options.getInteger('base_xp');
                const xpIncrement = interaction.options.getInteger('xp_increment');
                const cooldown = interaction.options.getInteger('cooldown')
                const levelUpMessage = interaction.options.getString('level_up+message');
                const levelUpChannel = interaction.options.getChannel('level_up_channel');
                const levelUpEmbed = interaction.options.getString('level_up_embed');
                const rankMessage = interaction.options.getString('rank_message');
                const rankEmbed = interaction.options.getString('rank_embed');
                const enabled = interaction.options.getBoolean('enabled');
                const startingLevel = interaction.options.getInteger('starting_level')

                // Check if the user has the necessary permissions
                if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageGuild)) {
                    return interaction.reply({
                        content: 'You do not have permission to set the XP settings.',
                        ephemeral: true,
                    });
                }

                // Validate minXP and maxXP
                if (minXP >= maxXP) {
                    return interaction.reply({
                        content: 'Minimum XP must be less than Maximum XP.',
                        ephemeral: true,
                    });
                }

                // Handle embed validation
                let levelUpEmbedId = null;
                if (levelUpEmbed) {
                    const existingEmbed = await Embed.findOne({ where: { serverId: interaction.guild.id, embedName: levelUpEmbed } });
                    if (!existingEmbed) {
                        return interaction.reply({
                            content: `The embed **${levelUpEmbed}** does not exist.`,
                            ephemeral: true,
                        });
                    }
                    levelUpEmbedId = existingEmbed.id;
                }

                let rankEmbedId = null;
                if (rankEmbed) {
                    const existingRankEmbed = await Embed.findOne({ where: { serverId: interaction.guild.id, embedName: rankEmbed } });
                    if (!existingRankEmbed) {
                        return interaction.reply({
                            content: `The embed **${rankEmbed}** does not exist.`,
                            ephemeral: true,
                        });
                    }
                    rankEmbedId = existingRankEmbed.id;
                }

                await interaction.deferReply({ephemeral: true});

                // Find or create the XP settings record for the server
                const [xpSettings] = await XPSettings.findOrCreate({
                    where: { serverId },
                    defaults: {
                        minXP,
                        maxXP,
                        multiplier,
                        effortBooster: effortBooster || false,
                        effortBoosterMultiplier: effortBoosterMultiplier || 0,
                        baseXp: baseXp || 100,
                        xpIncrement: xpIncrement || 100,
                        cooldown: cooldown || 60,
                        levelUpMessage: levelUpMessage,
                        levelUpChannelId: levelUpChannel?.id || null,
                        levelUpEmbedId: levelUpEmbedId,
                        rankMessage: rankMessage,
                        rankEmbedId: rankEmbedId,
                        enabled: enabled || false,
                        startingLevel: startingLevel || 1,
                    },
                });

                if (((maxXP * multiplier) / ((baseXp !== null) ? (baseXp) : (xpSettings.baseXp))) > 1000000) {

                    return interaction.editReply({
                        content: 'Please set lower max XP gain values or a lower multiplier, or a higher base XP value to prevent calculations taking too long.',
                        ephemeral: true,
                    });
                }

                // Update XP settings
                xpSettings.minXP = minXP;
                xpSettings.maxXP = maxXP;
                xpSettings.multiplier = multiplier;
                if (effortBooster !== null) xpSettings.effortBooster = effortBooster;
                xpSettings.enabled = enabled;
                if (effortBoosterMultiplier !== null) xpSettings.effortBoosterMultiplier = effortBoosterMultiplier;
                if (baseXp !== null) xpSettings.baseXp = baseXp;
                if (xpIncrement !== null) xpSettings.xpIncrement = xpIncrement;
                if (cooldown !== null) xpSettings.cooldown = cooldown;
                xpSettings.levelUpMessage = levelUpMessage;
                if (startingLevel !== null) xpSettings.startingLevel = startingLevel;
                xpSettings.levelUpChannelId = levelUpChannel?.id || null;
                xpSettings.levelUpEmbedId = levelUpEmbedId;
                xpSettings.rankMessage = rankMessage;
                xpSettings.rankEmbedId = rankEmbedId;

                await xpSettings.save();


                // Recalculate user levels based on new settings
                const users = await Level.findAll({ where: { serverId: serverId } });
                if (!users.length) return interaction.editReply({
                    content: `XP settings for the server have been updated:
            **Minimum XP:** ${minXP}
            **Maximum XP:** ${maxXP}
            **Multiplier:** ${multiplier}
            **Effort Booster Enabled:** ${effortBooster || false}
            **Effort Booster Multiplier:** ${effortBoosterMultiplier || 'Not set'}
            **Base XP:** ${baseXp || `Unchanged (Default: 100, but set to \`${xpSettings.baseXp}\`)`}
            **XP Increment:** ${(xpIncrement !== null) ? (xpIncrement) : `Unchanged (Default: 100, but set to ${xpSettings.xpIncrement})`}
            **Cooldown:** ${(cooldown !== null) ? (cooldown + " seconds") : (`Unchanged (Default: 60 seconds, but set to \`${xpSettings.cooldown} seconds\`)`)}
            **Starting Level:** ${(startingLevel !== null) ? (startingLevel) : `Unchanged (Default: 1, but set to ${xpSettings.startingLevel})`}
            **Level Up Message:** ${levelUpMessage || `none` }
            **Level Up Channel:** ${levelUpChannel || "current channel"}
            **Level Up Embed:** ${levelUpEmbed || "none"}
            **Rank Message:** ${rankMessage || `none` }
            **Rank Embed:** ${rankEmbed || "none"}
            **Enabled?** ${enabled}
            No users' XP was reset.`,

                    ephemeral: true,
                });
                for (const user of users) {
                    const totalXP = user.totalXp; // Preserve total XP
                    let newLevel = xpSettings.startingLevel;

                    let nextLevelXP = xpSettings.baseXp + (xpSettings.xpIncrement * (newLevel - startingLevel))
                    let remainingXP = totalXP; // Remaining XP to calculate levels


                    // loop
                    // Calculate new level based on total XP
                    while (remainingXP >= nextLevelXP) {
                        remainingXP -= nextLevelXP;
                        newLevel++;
                        nextLevelXP = xpSettings.baseXp + (xpSettings.xpIncrement * (newLevel - startingLevel)); // Increment for the next level
                    }

                    // Update the user's level and current XP
                    user.level = newLevel;
                    user.currentXp = remainingXP; // Remaining XP after leveling
                    await user.save();

                }


                // Build a response message summarizing the changes
                return interaction.editReply({
                    content: `XP settings for the server have been updated:
            **Minimum XP:** ${minXP}
            **Maximum XP:** ${maxXP}
            **Multiplier:** ${multiplier}
            **Effort Booster Enabled:** ${effortBooster || false}
            **Effort Booster Multiplier:** ${effortBoosterMultiplier || 'Not set'}
            **Base XP:** ${baseXp || `Unchanged (Default: 100, but set to ${xpSettings.baseXp})`}
            **XP Increment:** ${(xpIncrement !== null) ? (xpIncrement) : `Unchanged (Default: 100, but set to ${xpSettings.xpIncrement})`}
            **Cooldown:** ${(cooldown !== null) ? (cooldown + " seconds") : (`Unchanged (Default: 60 seconds, but set to ${xpSettings.cooldown} seconds)`)}
            **Starting Level:** ${(startingLevel !== null) ? (startingLevel) : `Unchanged (Default: 1, but set to ${xpSettings.startingLevel})`}
            **Level Up Message:** ${levelUpMessage || 'none' }
            **Level Up Channel:** ${levelUpChannel || "current channel"}
            **Level Up Embed:** ${levelUpEmbed || "none"}
            **Rank Message:** ${rankMessage || `none` }
            **Rank Embed:** ${rankEmbed || "none"}
            **Enabled?** ${enabled}`,
                    ephemeral: true,
                });
            }
        }

        if (subCommandGroup === "ignored_channels") {
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
        }

        if (subCommand === "add") {
            if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageGuild)) {
                return interaction.reply(':x: You do not have permission to manage XP.');
            }




            const user = interaction.options.getUser('user');
            const xpToAdd = interaction.options.getInteger('xp');
            const serverId = interaction.guild.id;
            let member = interaction.options.getMember('user');

            if (!member) {
                member = interaction.options.getUser('user');
                return interaction.reply({content: `Sorry, you cannot add XP to ${member} because they are not in the server.`,
                    ephemeral: true,});

            }

            const isCommand = true;



            const client = interaction.client;

            // Check if the user is a bot
            if (user.bot) {
                return interaction.reply('Bots cannot gain XP.');
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



            const row = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId(`confirm-add-xp`)
                    .setLabel('Confirm')
                    .setStyle(ButtonStyle.Success),
                new ButtonBuilder()
                    .setCustomId(`cancel-add-xp`)
                    .setLabel('Cancel')
                    .setStyle(ButtonStyle.Danger)
            );


            if (xpToAdd / xpSettings.baseXp > 1000000) {
                const response = await interaction.reply({content: `Are you sure you want to add ${xpToAdd} XP to ${user}? This may take a while.`,
                    components: [row],
                    withResponse: true,
                    ephemeral: true,
                });

                const collectorFilter = i => i.user.id === interaction.user.id;

                try {
                    const confirmation = await response.resource.message.awaitMessageComponent({ filter: collectorFilter, time: 60_000 });

                    if (confirmation.customId === 'confirm-add-xp') {
                        await confirmation.update({ content: `Adding ${xpToAdd} XP to ${user}...`, components: [] })
                        const {addedXP, newLevel, currentXP} = await addXP(client, user.id, serverId, xpToAdd, null, isCommand);
                        return interaction.editReply({
                            content: `${user} has had ${addedXP} XP added. They are now at **level ${newLevel}** with **${currentXP} XP**.`,
                        });
                    } else if (confirmation.customId === 'cancel-add-xp') {
                        return await confirmation.update({ content: `XP not added to ${user}`, components: [] });
                    }
                } catch (err) {
                    console.log(err)
                    return await interaction.editReply({ content: 'Confirmation not received within 1 minute, cancelling', components: [] });
                }

            }

            await interaction.deferReply( { ephemeral: true } );



            const {addedXP, newLevel, currentXP} = await addXP(client, user.id, serverId, xpToAdd, null, isCommand);
            return interaction.editReply({
                content: `${user} has had ${addedXP} XP added. They are now at **level ${newLevel}** with **${currentXP} XP**.`,
            });

        }

        if (subCommand === "remove") {
            if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageGuild)) {
                return interaction.reply(':x: You do not have permission to manage XP.');
            }

            const user = interaction.options.getUser('user');
            const xpToRemove = interaction.options.getInteger('xp');
            const serverId = interaction.guild.id;
            let member = interaction.options.getMember('user');

            if (!member) {
                member = interaction.options.getUser('user');
                return interaction.reply({
                    content: `Sorry, you cannot remove XP from ${member} because they are not in the server.`,
                    ephemeral: true,
                });

            }


            const xpSettings = await XPSettings.findOne({
                where: {serverId},
            });
            if (!xpSettings) {
                interaction.reply(`XP settings not found for this server.`);
                return;
            }
            if (!xpSettings.enabled) {
                interaction.reply(`Leveling not enabled.`);
                return;
            }

            // Check if the user is a bot
            if (user.bot) {
                return interaction.reply('Bots cannot lose XP.');
            }


            const row = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId(`confirm-remove-xp`)
                    .setLabel('Confirm')
                    .setStyle(ButtonStyle.Success),
                new ButtonBuilder()
                    .setCustomId(`cancel-remove-xp`)
                    .setLabel('Cancel')
                    .setStyle(ButtonStyle.Danger)
            );


            if (xpToRemove / xpSettings.baseXp > 1000000) {
                const response = await interaction.reply({
                    content: `Are you sure you want to remove ${xpToRemove} XP from ${user}? This may take a while.`,
                    components: [row],
                    withResponse: true,
                    ephemeral: true,
                });

                const collectorFilter = i => i.user.id === interaction.user.id;

                try {
                    const confirmation = await response.resource.message.awaitMessageComponent({
                        filter: collectorFilter,
                        time: 60_000
                    });

                    if (confirmation.customId === 'confirm-remove-xp') {
                        await confirmation.update({content: `Removing ${xpToRemove} XP from ${user}...`, components: []})
                        // Remove XP from the user
                        const {actualXPRemoved, newLevel, currentXP} = await removeXP(user.id, serverId, xpToRemove);

                        return interaction.editReply({
                            content: `${user} has had ${actualXPRemoved} XP removed. They are now at **level ${newLevel}** with **${currentXP} XP**.`,
                            ephemeral: true,
                        });
                    } else if (confirmation.customId === 'cancel-remove-xp') {
                        return await confirmation.update({content: `XP not removed from ${user}`, components: []});
                    }
                } catch (err) {
                    console.log(err)
                    return await interaction.editReply({
                        content: 'Confirmation not received within 1 minute, cancelling',
                        components: []
                    });
                }


                await interaction.deferReply({ephemeral: true});

                // remove xp
                const {actualXPRemoved, newLevel, currentXP} = await removeXP(user.id, serverId, xpToRemove);

                return interaction.editReply({
                    content: `${user} has had ${actualXPRemoved} XP removed. They are now at **level ${newLevel}** with **${currentXP} XP**.`,
                    ephemeral: true,
                });


            }
        }

        if (subCommand === "set") {
                // Check if the user has the necessary permissions
                if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageGuild)) {
                    return interaction.reply({
                        content: 'You do not have permission to run this command.',
                        ephemeral: true,
                    });
                }


                const serverId = interaction.guild.id;
                let member = interaction.options.getMember('user');

                if (!member) {
                    member = interaction.options.getUser('user');
                    return interaction.reply({
                        content: `Sorry, you cannot set the XP for ${member} because they are not in the server.`,
                        ephemeral: true,
                    });

                }

                const newTotalXP = interaction.options.getInteger('xp');
                const userId = member.id;

                // Check if the user is a bot
                if (member.user.bot) {
                    return interaction.reply('Bots cannot get their XP set.');
                }


                // Fetch XP settings
                const xpSettings = await XPSettings.findOne({where: {serverId}});

                if (!xpSettings) {
                    return interaction.reply({
                        content: 'XP settings not configured for this server.',
                        ephemeral: true,
                    });
                }

                if (!xpSettings.enabled) {
                    return interaction.reply({
                        content: 'Leveling not enabled.',
                    });
                }


            const row = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId(`confirm-set-xp`)
                    .setLabel('Confirm')
                    .setStyle(ButtonStyle.Success),
                new ButtonBuilder()
                    .setCustomId(`cancel-set-xp`)
                    .setLabel('Cancel')
                    .setStyle(ButtonStyle.Danger)
            );


            if (newTotalXP / xpSettings.baseXp > 1000000) {
                const response = await interaction.reply({
                    content: `Are you sure you want to set ${member}'s total XP to ${newTotalXP}? This may take a while.`,
                    components: [row],
                    withResponse: true,
                    ephemeral: true,
                })

                const collectorFilter = i => i.user.id === interaction.user.id;

                try {
                    const confirmation = await response.resource.message.awaitMessageComponent({
                        filter: collectorFilter,
                        time: 60_000
                    });

                    if (confirmation.customId === 'confirm-set-xp') {
                        await confirmation.update({content: `Setting ${member}'s total XP to ${newTotalXP}. This may take a while...`, components: []})


                        const startingLevel = xpSettings.startingLevel;
                        // Fetch the user from the database
                        const [user] = await Level.findOrCreate({
                            where: {userId, serverId},
                            defaults: {currentXp: 0, totalXp: 0, level: startingLevel},
                        });


                        const baseXp = xpSettings.baseXp;
                        const xpIncrement = xpSettings.xpIncrement;


                        // Fetch all role rewards for the server
                        const roleRewards = await LevelRoles.findAll({
                            where: {serverId: serverId},
                            attributes: ['level', 'roleId'],
                        });

                        // Convert role rewards into a map for easy lookup
                        const rewardMap = new Map(roleRewards.map((reward) => [reward.level, reward.roleId]));

                        // Track roles to assign
                        let newRoles = [];


                        // Recalculate level and current XP
                        let newLevel = startingLevel;
                        let nextLevelXP = baseXp + (xpIncrement * (newLevel - startingLevel));
                        let remainingXP = newTotalXP;


                        // loop
                        let loopCount = 0;
                        while (remainingXP >= nextLevelXP) {
                            remainingXP -= nextLevelXP;
                            newLevel++;
                            nextLevelXP = baseXp + (xpIncrement * (newLevel - startingLevel));

                            if (rewardMap.has(newLevel)) {
                                newRoles.push(rewardMap.get(newLevel));
                            }

                            // Yield to event loop every 10 iterations to prevent freezing
                            loopCount++;
                            if (loopCount % 10 === 0) {
                                await new Promise(resolve => setImmediate(resolve));
                            }
                        }

                        // Update the user record
                        user.totalXp = newTotalXP;
                        user.level = newLevel;
                        user.currentXp = remainingXP;
                        await user.save();

                        // Reply to the interaction
                        return interaction.editReply({
                            content: `User ${member} now has **${newTotalXP} total XP**, is at level **${newLevel}**, and needs **${nextLevelXP - remainingXP} XP** to reach the next level.`,
                            ephemeral: true,
                        });

                    } else if (confirmation.customId === 'cancel-set-xp') {
                        return await confirmation.update({content: `${member}'s total XP has been unchanged`, components: []});
                    }
                } catch (err) {
                    console.log(err)
                    return await interaction.editReply({
                        content: 'Confirmation not received within 1 minute, cancelling',
                        components: []
                    });
                }

            }


            await interaction.deferReply({ephemeral: true});


            const startingLevel = xpSettings.startingLevel;
            // Fetch the user from the database
            const [user] = await Level.findOrCreate({
                where: {userId, serverId},
                defaults: {currentXp: 0, totalXp: 0, level: startingLevel},
            });


            const baseXp = xpSettings.baseXp;
            const xpIncrement = xpSettings.xpIncrement;


            // Fetch all role rewards for the server
            const roleRewards = await LevelRoles.findAll({
                where: {serverId: serverId},
                attributes: ['level', 'roleId'],
            });

            // Convert role rewards into a map for easy lookup
            const rewardMap = new Map(roleRewards.map((reward) => [reward.level, reward.roleId]));

            // Track roles to assign
            let newRoles = [];


            // Recalculate level and current XP
            let newLevel = startingLevel;
            let nextLevelXP = baseXp + (xpIncrement * (newLevel - startingLevel));
            let remainingXP = newTotalXP;


            // loop
            let loopCount = 0;
            while (remainingXP >= nextLevelXP) {
                remainingXP -= nextLevelXP;
                newLevel++;
                nextLevelXP = baseXp + (xpIncrement * (newLevel - startingLevel));

                if (rewardMap.has(newLevel)) {
                    newRoles.push(rewardMap.get(newLevel));
                }

                // Yield to event loop every 10 iterations to prevent freezing
                loopCount++;
                if (loopCount % 10 === 0) {
                    await new Promise(resolve => setImmediate(resolve));
                }
            }

            // Update the user record
            user.totalXp = newTotalXP;
            user.level = newLevel;
            user.currentXp = remainingXP;
            await user.save();

            // Reply to the interaction
            return interaction.editReply({
                content: `User ${member} now has **${newTotalXP} total XP**, is at level **${newLevel}**, and needs **${nextLevelXP - remainingXP} XP** to reach the next level.`,
                ephemeral: true,
            });


        }




    },
};