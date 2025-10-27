const { SlashCommandBuilder, PermissionsBitField, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const addXP = require('../../helpers/leveling/addXP');
const {XPSettings} = require("../../models/");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('addxp')
        .setDescription('Add XP to a user. (STAFF ONLY)')
        .setDMPermission(false)
        .addUserOption(option => option
            .setName('user')
            .setDescription('The user to add XP to')
            .setRequired(true))
        .addIntegerOption(option => option
            .setName('xp')
            .setDescription('Amount of XP to add')
            .setMinValue(0)

            .setRequired(true)),
    async execute(interaction) {


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
                await interaction.editReply({ content: 'Confirmation not received within 1 minute, cancelling', components: [] });
            }

        }

        await interaction.deferReply( { ephemeral: true } );



        const {addedXP, newLevel, currentXP} = await addXP(client, user.id, serverId, xpToAdd, null, isCommand);
            return interaction.editReply({
                content: `${user} has had ${addedXP} XP added. They are now at **level ${newLevel}** with **${currentXP} XP**.`,
            });



    },
};