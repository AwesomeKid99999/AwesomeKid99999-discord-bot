const { SlashCommandBuilder, PermissionsBitField } = require('discord.js');
const { Guild, Question, Embed } = require('../../models');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('listquestions')
        .setDMPermission(false)
        .setDescription('List all staff application questions for this server.')
        .addStringOption(option =>
            option.setName('type')
                .setDescription('Filter questions by type (optional)')
                .setRequired(false)),

    async execute(interaction) {
        const serverId = interaction.guild.id; // Get the server's ID
        const questionType = interaction.options.getString('type')?.toLowerCase();

        const guild = await Guild.findOne({ where: { serverId: serverId } });
        if (!guild) {
            console.log(`${interaction.guild.name} does not exist in the database`);
            return interaction.reply({
                content: 'Please contact staff to set up something in the database for this server.',
                ephemeral: true,
            });
        }

        if (
            !guild.applicationToggle &&
            !interaction.member.roles.cache.some((role) => role.id === guild.staffRoleId) &&
            !interaction.member.permissions.has(PermissionsBitField.Flags.ManageGuild)
        ) {
            return interaction.reply({
                content: 'Sorry, staff applications are closed at this time, so you cannot see the questions.',
                ephemeral: true,
            });
        }



        try {
            // Build where clause based on whether type filter is provided
            const whereClause = { serverId: serverId };
            if (questionType) {
                whereClause.QuestionType = questionType;
            }

            // Fetch questions from the database for the current server
            const questions = await Question.findAll({
                where: whereClause,
                order: [['questionNumber', 'ASC']], // Order questions by their number
            });

            // If no questions are found
            if (questions.length === 0) {
                const message = questionType 
                    ? `There are no ${questionType} application questions set up for this server.`
                    : 'There are no staff application questions set up for this server.';
                return interaction.reply({
                    content: message,
                    ephemeral: true,
                });
            }

            // Create a message listing the questions with embed information
            const questionList = [];
            
            for (const question of questions) {
                let questionText = `**Question ${question.questionNumber}:**`;
                
                // Add question type
                questionText += ` *[${question.QuestionType}]*`;
                
                // Add question text if it exists, otherwise show placeholder
                if (question.questionText) {
                    questionText += ` ${question.questionText}`;
                } else if (question.QuestionEmbedId || question.questionImage) {
                    questionText += ` View image/embed below`;
                }
                
                // Add embed information if it exists
                if (question.QuestionEmbedId) {
                    const embed = await Embed.findOne({ where: { id: question.QuestionEmbedId } });
                    if (embed) {
                        questionText += ` *(Embed: ${embed.embedName})*`;
                    } else {
                        questionText += ` *(Embed: Deleted/Invalid)*`;
                    }
                }
                
                // Add image information if it exists
                if (question.questionImage) {
                    questionText += ` *(Image)*`;
                }
                
                questionList.push(questionText);
            }
            
            const questionListString = questionList.join('\n');

            // Split the message into chunks if it exceeds 2000 characters
            const splitMessages = [];
            let chunk = '';

            questionListString.split('\n').forEach((line) => {
                if (chunk.length + line.length + 1 > 2000) {
                    splitMessages.push(chunk);
                    chunk = '';
                }
                chunk += `${line}\n`;
            });
            if (chunk.length > 0) splitMessages.push(chunk);


            // if staff apps are closed and person is staff
            if (
                !guild.applicationToggle &&
                (interaction.member.roles.cache.some((role) => role.id === guild.staffRoleId) ||
                    interaction.member.permissions.has(PermissionsBitField.Flags.ManageGuild))
            ) {
                // Edit the reply with the first chunk
                await interaction.reply({
                    content: splitMessages[0], ephemeral: true,
                });

                // Send the remaining chunks as follow-ups
                for (let i = 1; i < splitMessages.length; i++) {
                    await interaction.followUp({
                        content: splitMessages[i], ephemeral: true,
                    });
                }
            } else {
                // Edit the reply with the first chunk
                await interaction.reply({
                    content: splitMessages[0],
                });

                // Send the remaining chunks as follow-ups
                for (let i = 1; i < splitMessages.length; i++) {
                    await interaction.followUp({
                        content: splitMessages[i],
                    });
                }
            }


        } catch (error) {
            console.error(error);
            await interaction.reply({
                content:
                    'An error occurred while trying to list the staff application questions. Please try again later.',
                ephemeral: true,
            });
        }
    },
};