const { SlashCommandBuilder, PermissionsBitField } = require('discord.js');
const {XPSettings, Level, Embed} = require('../../models/');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('xpsettings')
        .setDescription('Set or view the XP settings for the server. (STAFF ONLY)')
        .setDMPermission(false)
        .addSubcommand(subcommand => subcommand
            .setName('change')
            .setDescription('Set the XP settings for the server. (STAFF ONLY)')
            .addIntegerOption(option => option
                .setName('minxp')
                .setDescription('Minimum XP that can be awarded')
                .setRequired(true))
            .addIntegerOption(option => option
                .setName('maxxp')
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
                .setRequired(false))
            .addBooleanOption(option => option
                .setName('effortbooster')
                .setDescription('Whether or not to enable the effort booster')
                .setRequired(false))
            .addNumberOption(option => option
                .setName('effortboostermultiplier')
                .setDescription('The multiplier for the effort booster (Multiplies this value by number of characters)')
                .setRequired(false)
                .setMinValue(0))
            .addIntegerOption(option => option
                .setName('basexp')
                .setDescription('Base XP required for the first level')
                .setRequired(false)
                .setMinValue(1))
            .addIntegerOption(option => option
                .setName('xpincrement')
                .setDescription('XP increment required for each subsequent level')
                .setRequired(false)
                .setMinValue(0))
            .addIntegerOption(option => option
                .setName('startinglevel')
                .setDescription('The starting level')
                .setRequired(false))
            .addStringOption(option => option
                .setName('levelupmessage')
                .setDescription('Message to display when a user levels up'))
            .addChannelOption(option => option
                .setName('levelupchannel')
                .setDescription('The channel to send the level up message'))
            .addStringOption(option => option
                .setName('levelupembed')
                .setDescription('The name of the embed to show for level up messages (leave empty to remove)'))
            .addStringOption(option => option
                .setName('rankmessage')
                .setDescription('Message to display when using the rank command'))
            .addStringOption(option => option
                .setName('rankembed')
                .setDescription('The name of the embed to show for rank command (leave empty to remove)')))
        .addSubcommand(subcommand => subcommand
            .setName('view')
            .setDescription('View the XP settings for the server. (STAFF ONLY)')),
    async execute(interaction) {
        const subcommand = interaction.options.getSubcommand();


        if (subcommand === 'view') {
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

        if (subcommand === 'change') {


            const serverId = interaction.guild.id;
            const minXP = interaction.options.getInteger('minxp');
            const maxXP = interaction.options.getInteger('maxxp');
            const multiplier = interaction.options.getNumber('multiplier');
            const effortBooster = interaction.options.getBoolean('effortbooster');
            const effortBoosterMultiplier = interaction.options.getNumber('effortboostermultiplier');
            const baseXp = interaction.options.getInteger('basexp');
            const xpIncrement = interaction.options.getInteger('xpincrement');
            const cooldown = interaction.options.getInteger('cooldown');
            const levelUpMessage = interaction.options.getString('levelupmessage');
            const levelUpChannel = interaction.options.getChannel('levelupchannel');
            const levelUpEmbed = interaction.options.getString('levelupembed');
            const rankMessage = interaction.options.getString('rankmessage');
            const rankEmbed = interaction.options.getString('rankembed');
            const enabled = interaction.options.getBoolean('enabled');
            const startingLevel = interaction.options.getInteger('startinglevel')

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

    },
};