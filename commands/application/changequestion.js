const { SlashCommandBuilder, PermissionsBitField} = require('discord.js');
const {Question, Guild, Embed} = require('../../models/');

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
            option.setName('question_type')
                .setDescription('The type of question for a type of application (single word only)')
                .setRequired(true)
                .setMaxLength(50))
        .addStringOption(option =>
            option.setName('text')
                .setDescription('The new text for the question (optional if using embed)')
                .setRequired(false))
        .addStringOption(option =>
            option.setName('embed')
                .setDescription('The name of an embed to use for this question (optional)'))
        .addStringOption(option =>
            option.setName('image')
                .setDescription('URL of an image to display with this question (optional)')),
    async execute(interaction) {
        const questionNumber = interaction.options.getInteger('number');
        const newText = interaction.options.getString('text');
        const embedName = interaction.options.getString('embed');
        const imageUrl = interaction.options.getString('image');
        const newType = interaction.options.getString('question_type').toLowerCase();
        const serverId = interaction.guild.id;

        // Validate that question type is a single word
        if (newType.includes(' ') || newType.includes('-') || newType.includes('_')) {
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

        try {
            // Find the question
            const question = await Question.findOne({ where: { serverId, questionNumber, QuestionType: newType } });
            if (!question) {
                return interaction.reply({
                    content: `Question ${questionNumber} for type **${newType}** does not exist for this server.`,
                });
            }

            // Validate that either text, embed, or image is provided
            if (!newText && !embedName && !imageUrl) {
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

            // Update the question
            if (newText) question.questionText = newText;
            if (embedName !== null) question.QuestionEmbedId = embedId;
            if (imageUrl !== null) question.questionImage = imageUrl;
            if (newType) question.QuestionType = newType;
            await question.save();

            const textMessage = newText ? ` to: "${newText}"` : '';
            const embedMessage = embedName ? ` with embed **${embedName}**` : '';
            const imageMessage = imageUrl ? ` with image` : '';
            const typeMessage = newType ? ` (Type: ${newType})` : '';
            interaction.reply({
                content: `Question ${questionNumber} has been updated${textMessage}${embedMessage}${imageMessage}${typeMessage}`,
            });
        } catch (error) {
            console.error(error);
            interaction.reply({
                content: 'An error occurred while updating the question. Please try again later.',
            });
        }
    },
};