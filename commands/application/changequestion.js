const { SlashCommandBuilder, PermissionsBitField} = require('discord.js');
const {Question, Guild} = require('../../models/');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('changequestion')
        .setDescription('Change a question in the application process. (STAFF ONLY)')
        .setDMPermission(false)
        .addIntegerOption(option =>
            option.setName('number')
                .setDescription('The question number to edit.')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('text')
                .setDescription('The new text for the question.')
                .setRequired(true)),
    async execute(interaction) {
        const questionNumber = interaction.options.getInteger('number');
        const newText = interaction.options.getString('text');
        const serverId = interaction.guild.id;

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

        try {
            // Find the question
            const question = await Question.findOne({ where: { serverId, questionNumber } });
            if (!question) {
                return interaction.reply({
                    content: `Question ${questionNumber} does not exist for this server.`,
                });
            }

            // Update the question
            question.questionText = newText;
            await question.save();

            interaction.reply({
                content: `Question ${questionNumber} has been updated to: "${newText}"`,
            });
        } catch (error) {
            console.error(error);
            interaction.reply({
                content: 'An error occurred while updating the question. Please try again later.',
            });
        }
    },
};