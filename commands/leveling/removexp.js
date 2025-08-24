const { SlashCommandBuilder, PermissionsBitField} = require('discord.js');
const { XPSettings } = require('../../models/');
const removeXP = require('../../helpers/leveling/removeXP');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('removexp')
        .setDescription('Remove XP from a user. (STAFF ONLY)')
        .setDMPermission(false)
        .addUserOption(option =>
            option.setName('user')
                .setDescription('The user to remove XP from')
                .setRequired(true)
        )
        .addIntegerOption(option => option
                .setName('xp')
                .setDescription('Amount of XP to remove')
                .setMinValue(0)
                .setRequired(true)
        ),
    async execute(interaction) {



        if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageGuild)) {
            return interaction.reply(':x: You do not have permission to manage XP.');
        }

        const user = interaction.options.getUser('user');
        const xpToRemove = interaction.options.getInteger('xp');
        const serverId = interaction.guild.id;
        let member = interaction.options.getMember('user');

        if (!member) {
            member = interaction.options.getUser('user');
            return interaction.reply({content: `Sorry, you cannot remove XP from ${member} because they are not in the server.`,
                ephemeral: true,});

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

        // Check if the user is a bot
        if (user.bot) {
            return interaction.reply('Bots cannot lose XP.');
        }

        await interaction.deferReply();
        // Remove XP from the user
        const { actualXPRemoved, newLevel, currentXP } = await removeXP(user.id, serverId, xpToRemove);

        return interaction.editReply({
            content: `${user} has had ${actualXPRemoved} XP removed. They are now at **level ${newLevel}** with **${currentXP} XP**.`,
            ephemeral: true,
        });
    },
};