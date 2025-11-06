const { SlashCommandBuilder, PermissionsBitField} = require('discord.js');
const { Guild, Question, Embed, Application} = require("../../models");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('question')
        .setDescription('Manage questions on an application form. (STAFF ONLY)')
        .setDMPermission(false)
        .addSubcommand(subcommand => subcommand
            .setName('add')
            .setDescription('Add a new question to an application form. (STAFF ONLY)')
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
                    .setMaxLength(1000)
                    .setRequired(false))
            .addStringOption(option =>
                option.setName('embed')
                    .setDescription('The name of an embed to use for this question (optional)')
                    .setMaxLength(100))
            .addStringOption(option =>
                option.setName('image')
                    .setDescription('URL of an image to display with this question (optional)')
                    .setMaxLength(2000)))
        .addSubcommand(subcommand => subcommand
            .setName('change')
            .setDescription('Change a question in an application process. (STAFF ONLY)')
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
                    .setMaxLength(1000)
                    .setRequired(false))
            .addStringOption(option =>
                option.setName('embed')
                    .setDescription('The name of an embed to use for this question (optional)')
                    .setMaxLength(100))
            .addStringOption(option =>
                option.setName('image')
                    .setDescription('URL of an image to display with this question (optional)')
                    .setMaxLength(2000)))
        .addSubcommand(subcommand => subcommand
            .setName('remove')
            .setDescription('Remove a question from an application form. (STAFF ONLY)')
            .addIntegerOption(option =>
                option.setName('number')
                    .setDescription('The question number to remove')
                    .setRequired(true))
            .addStringOption(option =>
                option.setName('type')
                    .setDescription('The type of question to remove (single word only)')
                    .setRequired(true)
                    .setMaxLength(50)))
        .addSubcommand(subcommand => subcommand
            .setName('list')
            .setDescription('List all application questions for this server.')
            .addStringOption(option =>
                option.setName('type')
                    .setDescription('Filter questions by type (optional)')
                    .setMaxLength(50)
                    .setRequired(false))),
    async execute(interaction) {

        const subCommand = interaction.options.getSubcommand();
        if (subCommand === "add") {
            // add question logic
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

        if (subCommand === "change") {
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
        }

        if (subCommand === "remove") {
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

        if (subCommand === "list") {
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
                        questionText += ` *(Image: ${question.questionImage})*`;
                    }
                    return questionText;
                };

                // Special handling for staff with no type filter: split into open vs closed
                if (isStaff && !questionType) {
                    const typesInResults = [...new Set(questions.map(q => q.QuestionType))];

                    // Fetch per-type toggles for the types that appear in the current results
                    const togglesForTypes = await Application.findAll({
                        where: {
                            serverId: serverId,
                            userId: 'SYSTEM_TOGGLE',
                            applicationType: typesInResults,
                        }
                    });

                    // Types are CLOSED by default; mark as open only if a toggle explicitly enables them
                    const openTypeSet = new Set(
                        togglesForTypes
                            .filter(t => Boolean(t.applicationToggle))
                            .map(t => t.applicationType)
                    );

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

// Split to <= 2000 chars chunks
                const buildChunks = (lines) => {
                    const result = [];
                    let chunk = '';
                    for (const line of lines) {
                        if (chunk.length + line.length + 1 > 2000) {
                            result.push(chunk);
                            chunk = '';
                        }
                        chunk += `${line}\n`;
                    }
                    if (chunk.length > 0) result.push(chunk);
                    return result;
                };

                const splitMessages = buildChunks(questionList);

// Decide whether to make the output ephemeral
                let makeEphemeral = false;

                if (questionType) {
                    // Specific type requested: staff see it privately if that type is closed
                    const applicationToggle = await Application.findOne({
                        where: {
                            serverId: serverId,
                            applicationType: questionType,
                            userId: 'SYSTEM_TOGGLE',
                        },
                    });

                    const isOpen = !!(applicationToggle && applicationToggle.applicationToggle);
                    if (!isOpen && isStaff) {
                        makeEphemeral = true;
                    }
                } else if (isStaff) {
                    // Staff + no specific type: if any type in results is closed, make ephemeral
                    const typesInResults = [...new Set(questions.map(q => q.QuestionType))];

                    if (typesInResults.length > 0) {
                        const togglesForTypes = await Application.findAll({
                            where: {
                                serverId: serverId,
                                userId: 'SYSTEM_TOGGLE',
                                applicationType: typesInResults,
                            },
                        });

                        const openTypeSet = new Set(
                            togglesForTypes
                                .filter(t => !!t.applicationToggle)
                                .map(t => t.applicationType)
                        );

                        const hasClosedType = typesInResults.some(t => !openTypeSet.has(t));
                        if (hasClosedType) {
                            makeEphemeral = true;
                        }
                    }
                }

// Send the first chunk
                await interaction.reply({
                    content: splitMessages[0] || 'No questions found.',
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
        }


    }
};