const { SlashCommandBuilder, PermissionsBitField} = require('discord.js');
const { Guild, Question, Embed } = require("../../models");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('addquestion')
        .setDescription('Add a new question to the application form. (STAFF ONLY)')
        .setDMPermission(false)
        .addIntegerOption(option =>
            option.setName('number')
                .setDescription('The question number')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('question_type')
                .setDescription('The type of question for a type of application (single word only)')
                .setRequired(true)
                .setMaxLength(50))
        .addStringOption(option =>
            option.setName('text')
                .setDescription('The question text (optional if using embed)')
                .setRequired(false))
        .addStringOption(option =>
            option.setName('embed')
                .setDescription('The name of an embed to use for this question (optional)'))
        .addStringOption(option =>
            option.setName('image')
                .setDescription('URL of an image to display with this question (optional)')),
    async execute(interaction) {
        const serverId = interaction.guild.id;
        const questionNumber = interaction.options.getInteger('number');
        const questionText = interaction.options.getString('text');
        const embedName = interaction.options.getString('embed');
        const imageUrl = interaction.options.getString('image');
        const questionType = interaction.options.getString('question_type').toLowerCase();

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


        // Check if a question with this number already exists
        const existingQuestion = await Question.findOne({ where: { serverId, questionNumber, QuestionType: questionType } });
        if (existingQuestion) {
            return interaction.reply({ content: `A question with number ${questionNumber} with type **${questionType}** already exists!`, ephemeral: true });
        }

        // Validate that either text, embed, or image is provided
        if (!questionText && !embedName && !imageUrl) {
            return interaction.reply({ content: 'You must provide either question text, an embed name, or an image URL.', ephemeral: true });
        }

        // Validate embed if provided
        let embedId = null;
        if (embedName) {
            const embed = await Embed.findOne({ where: { serverId: interaction.guild.id, embedName: embedName } });
            if (!embed) {
                return interaction.reply({ content: `The embed **${embedName}** does not exist.`, ephemeral: true });
            }
            if (!embed.isActive) {
                return interaction.reply({ content: `The embed **${embedName}** is not active.`, ephemeral: true });
            }
            embedId = embed.id;
        }

        // Add the new question to the database
        await Question.create({
            serverId: serverId,
            questionNumber: questionNumber,
            questionText: questionText,
            QuestionEmbedId: embedId,
            questionImage: imageUrl,
            QuestionType: questionType
        });

        const textMessage = questionText ? `: "${questionText}"` : '';
        const embedMessage = embedName ? ` with embed **${embedName}**` : '';
        const imageMessage = imageUrl ? ` with image` : '';
        const typeMessage = ` (Type: ${questionType})`;
        interaction.reply({ content: `Added question ${questionNumber}${textMessage}${embedMessage}${imageMessage}${typeMessage}`});
    }
};