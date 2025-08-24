const { SlashCommandBuilder, PermissionsBitField} = require('discord.js');
const {Question, Guild} = require('../../models/');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('removequestion')
        .setDescription('Remove a question from the application form. (STAFF ONLY)')
        .setDMPermission(false)
        .addIntegerOption(option =>
            option.setName('number')
                .setDescription('The question number to remove')
                .setRequired(true)),
    async execute(interaction) {
        const serverId = interaction.guild.id;
        const questionNumber = interaction.options.getInteger('number');

        const guild = await Guild.findOne({ where: { serverId: serverId } });
        if (!guild) {
            console.log(`${interaction.guild.name} does not exist in the database`);
            return await interaction.reply({
                content: 'Please set up something in the database for this server.',
                ephemeral: true,
            });
        }

        // Permission check
        if (
            !interaction.member.roles.cache.some((role) => role.id === guild.staffRoleId) &&
            !interaction.member.permissions.has(PermissionsBitField.Flags.ManageServer)
        ) {
            return await interaction.reply({
                content: 'Sorry, you do not have permission to run this command.',
                ephemeral: true,
            });
        }

        // Find and delete the question
        const deleted = await Question.destroy({ where: { serverId, questionNumber } });

        if (!deleted) {
            return interaction.reply({ content: `No question found with number ${questionNumber}.`, ephemeral: true });
        }

        interaction.reply({ content: `Removed question ${questionNumber}.`});
    }
};