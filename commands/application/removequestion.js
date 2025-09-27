const { SlashCommandBuilder, PermissionsBitField} = require('discord.js');
const {Question, Guild, Embed} = require('../../models/');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('removequestion')
        .setDescription('Remove a question from the application form. (STAFF ONLY)')
        .setDMPermission(false)
        .addIntegerOption(option =>
            option.setName('number')
                .setDescription('The question number to remove')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('type')
                .setDescription('The type of question to remove (single word only)')
                .setRequired(true)
                .setMaxLength(50)),
    async execute(interaction) {
        const serverId = interaction.guild.id;
        const questionNumber = interaction.options.getInteger('number');
        const questionType = interaction.options.getString('type').toLowerCase();

        // Validate that question type is a single word
        if (questionType.includes(' ') || questionType.includes('-') || questionType.includes('_')) {
            return await interaction.reply({
                content: 'Question type must be a single word (no spaces, hyphens, or underscores).',
                ephemeral: true,
            });
        }

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
            !interaction.member.permissions.has(PermissionsBitField.Flags.ManageGuild)
        ) {
            return await interaction.reply({
                content: 'Sorry, you do not have permission to run this command.',
                ephemeral: true,
            });
        }

        // Find the question first to get embed information
        const question = await Question.findOne({ where: { serverId, questionNumber, QuestionType: questionType } });

        if (!question) {
            return interaction.reply({ content: `No question found with number ${questionNumber} with type **${questionType}**.`, ephemeral: true });
        }

        // Get embed information if it exists
        let embedInfo = '';
        if (question.QuestionEmbedId) {
            const embed = await Embed.findOne({ where: { id: question.QuestionEmbedId } });
            if (embed) {
                embedInfo = ` with embed **${embed.embedName}**`;
            } else {
                embedInfo = ` with embed **Deleted/Invalid**`;
            }
        }

        // Get image information if it exists
        let imageInfo = '';
        if (question.questionImage) {
            imageInfo = ` with image`;
        }

        // Delete the question
        await Question.destroy({ where: { serverId, questionNumber, QuestionType: questionType } });

        const textInfo = question.questionText ? `: "${question.questionText}"` : '';
        interaction.reply({ content: `Removed question ${questionNumber}${textInfo}${embedInfo}${imageInfo} (Type: ${questionType}).`});
    }
};