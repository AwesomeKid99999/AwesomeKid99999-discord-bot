const { SlashCommandBuilder, PermissionsBitField } = require('discord.js');
const { Guild, Question, Embed, Application } = require('../../models');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('listquestions')
        .setDMPermission(false)
        .setDescription('List all application questions for this server.')
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
 
        // Determine if the user is staff (by staff role or Manage Guild permission)
        const isStaff = (
            interaction.member.roles.cache.some((role) => role.id === guild.staffRoleId) ||
            interaction.member.permissions.has(PermissionsBitField.Flags.ManageGuild)
        );

        // If a specific type is requested and that type is closed, block non-staff
        if (questionType && !isStaff) {
            const applicationToggle = await Application.findOne({
                where: {
                    serverId: serverId,
                    applicationType: questionType,
                    userId: 'SYSTEM_TOGGLE'
                }
            });
            if (!applicationToggle || !applicationToggle.applicationToggle) {
                return interaction.reply({
                    content: `Sorry, ${questionType} applications are closed at this time, so you cannot see the questions.`,
                    ephemeral: true,
                });
            }
        }



        try {
            // Build where clause based on whether type filter is provided
            const whereClause = { serverId: serverId };
            if (questionType) {
                // Specific type requested
                whereClause.QuestionType = questionType;
            } else if (!isStaff) {
                // No specific type requested: if non-staff, only show questions for OPEN types
                const toggles = await Application.findAll({
                    where: { serverId: serverId, userId: 'SYSTEM_TOGGLE' }
                });
                const openTypes = toggles.filter(t => !!t.applicationToggle).map(t => t.applicationType);
                if (openTypes.length === 0) {
                    return interaction.reply({
                        content: 'There are no open application types at this time.',
                        ephemeral: true,
                    });
                }
                // Limit questions to open types for non-staff
                whereClause.QuestionType = openTypes;
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
                    : 'There are no application questions set up for this server.';
                return interaction.reply({
                    content: message,
                    ephemeral: true,
                });
            }

            // Create messages, potentially splitting into open-type (public) and closed-type (ephemeral) for staff
            const buildQuestionText = async (question) => {
                let questionText = `**Question ${question.questionNumber}:**`;
                questionText += ` *[${question.QuestionType}]*`;
                if (question.questionText) {
                    questionText += ` ${question.questionText}`;
                } else if (question.QuestionEmbedId || question.questionImage) {
                    questionText += ` View image/embed below`;
                }
                if (question.QuestionEmbedId) {
                    const embed = await Embed.findOne({ where: { id: question.QuestionEmbedId } });
                    if (embed) {
                        questionText += ` *(Embed: ${embed.embedName})*`;
                    } else {
                        questionText += ` *(Embed: Deleted/Invalid)*`;
                    }
                }
                if (question.questionImage) {
                    questionText += ` *(Image)*`;
                }
                return questionText;
            };

            // Special handling for staff with no type filter: split into open vs closed
            if (isStaff && !questionType) {
                const typesInResults = Array.from(new Set(questions.map(q => q.QuestionType)));
                let openTypeSet = new Set();
                if (!(guild && guild.applicationToggle === false)) { // if globally closed, treat all as closed
                    const togglesForTypes = await Application.findAll({
                        where: {
                            serverId: serverId,
                            userId: 'SYSTEM_TOGGLE',
                            applicationType: typesInResults,
                        }
                    });
                    openTypeSet = new Set(togglesForTypes.filter(t => !!t.applicationToggle).map(t => t.applicationType));
                }

                const openQuestionList = [];
                const closedQuestionList = [];
                for (const question of questions) {
                    const text = await buildQuestionText(question);
                    if (openTypeSet.has(question.QuestionType)) {
                        openQuestionList.push(text);
                    } else {
                        closedQuestionList.push(text);
                    }
                }

                const buildChunks = (lines) => {
                    const result = [];
                    let c = '';
                    for (const line of lines) {
                        if (c.length + line.length + 1 > 2000) {
                            result.push(c);
                            c = '';
                        }
                        c += `${line}\n`;
                    }
                    if (c.length > 0) result.push(c);
                    return result;
                };

                const openSplitMessages = buildChunks(openQuestionList);
                const closedSplitMessages = buildChunks(closedQuestionList);

                // Prefer replying publicly with open questions if available
                if (openSplitMessages.length > 0) {
                    await interaction.reply({ content: openSplitMessages[0] });
                    for (let i = 1; i < openSplitMessages.length; i++) {
                        await interaction.followUp({ content: openSplitMessages[i] });
                    }
                } else if (closedSplitMessages.length > 0) {
                    // If only closed exist, initial reply must be ephemeral
                    await interaction.reply({ content: closedSplitMessages[0], ephemeral: true });
                    for (let i = 1; i < closedSplitMessages.length; i++) {
                        await interaction.followUp({ content: closedSplitMessages[i], ephemeral: true });
                    }
                    return;
                } else {
                    // No content somehow (shouldn't happen because questions.length > 0)
                    await interaction.reply({ content: 'No questions found.', ephemeral: true });
                    return;
                }

                // Send closed types privately as follow-ups if any
                for (let i = 0; i < closedSplitMessages.length; i++) {
                    await interaction.followUp({ content: closedSplitMessages[i], ephemeral: true });
                }

                return;
            }

            // Default behavior: single list based on current whereClause
            const questionList = [];
            for (const question of questions) {
                const questionText = await buildQuestionText(question);
                questionList.push(questionText);
            }

            const questionListString = questionList.join('\n');

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


            // Decide whether to make the output ephemeral
            let makeEphemeral = false;
            // If a specific type was requested and it's closed, staff will still see it but privately
            if (questionType) {
                const applicationToggle = await Application.findOne({
                    where: {
                        serverId: serverId,
                        applicationType: questionType,
                        userId: 'SYSTEM_TOGGLE'
                    }
                });
                if ((!applicationToggle || !applicationToggle.applicationToggle) && isStaff) {
                    makeEphemeral = true;
                }
            } else if (isStaff) {
                // No specific type requested: if staff and any included type is closed, send ephemerally
                // Global closed flag on Guild (legacy support)
                if (guild && guild.applicationToggle === false) {
                    makeEphemeral = true;
                } else {
                    // Determine which types are in the question set
                    const typesInResults = Array.from(new Set(questions.map(q => q.QuestionType)));
                    if (typesInResults.length > 0) {
                        const togglesForTypes = await Application.findAll({
                            where: {
                                serverId: serverId,
                                userId: 'SYSTEM_TOGGLE',
                                applicationType: typesInResults,
                            }
                        });
                        const openTypeSet = new Set(
                            togglesForTypes.filter(t => !!t.applicationToggle).map(t => t.applicationType)
                        );
                        // If any type in results is not open, consider it closed and make ephemeral
                        const hasClosedType = typesInResults.some(t => !openTypeSet.has(t));
                        if (hasClosedType) {
                            makeEphemeral = true;
                        }
                    }
                }
            }

            // Send the first chunk
            await interaction.reply({
                content: splitMessages[0],
                ephemeral: makeEphemeral,
            });

            // Send remaining chunks
            for (let i = 1; i < splitMessages.length; i++) {
                await interaction.followUp({
                    content: splitMessages[i],
                    ephemeral: makeEphemeral,
                });
            }


        } catch (error) {
            console.error(error);
            await interaction.reply({
                content:
                    'An error occurred while trying to list the application questions. Please try again later.',
                ephemeral: true,
            });
        }
    },
};