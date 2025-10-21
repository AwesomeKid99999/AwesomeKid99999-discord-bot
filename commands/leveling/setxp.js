const { SlashCommandBuilder, PermissionsBitField} = require('discord.js');
const {Level, XPSettings, LevelRoles} = require('../../models/');


module.exports = {
    data: new SlashCommandBuilder()
        .setName('setxp')
        .setDescription('Set the total XP for a specific user.')
        .setDMPermission(false)
        .addUserOption(option =>
            option.setName('user')
                .setDescription('The user to set the XP for')
                .setRequired(true)
        )
        .addIntegerOption(option =>
            option.setName('xp')
                .setDescription('The new total XP value')
                .setMinValue(0)
                .setRequired(true)
        ),
    async execute(interaction) {




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
            return interaction.reply({content: `Sorry, you cannot set the XP for ${member} because they are not in the server.`,
            ephemeral: true,});

        }

        const newTotalXP = interaction.options.getInteger('xp');
        const userId = member.id;

        // Check if the user is a bot
        if (member.user.bot) {
            return interaction.reply('Bots cannot get their XP set.');
        }


        // Fetch XP settings
        const xpSettings = await XPSettings.findOne({ where: { serverId } });

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

        await interaction.deferReply({ephemeral: true});


        const startingLevel = xpSettings.startingLevel;
        // Fetch the user from the database
        const [user] = await Level.findOrCreate({
            where: { userId, serverId },
            defaults: { currentXp: 0, totalXp: 0, level: startingLevel },
        });





        const baseXp = xpSettings.baseXp;
        const xpIncrement = xpSettings.xpIncrement;


        // Fetch all role rewards for the server
        const roleRewards = await LevelRoles.findAll({
            where: { serverId: serverId },
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
    },
};