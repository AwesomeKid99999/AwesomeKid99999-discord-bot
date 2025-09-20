const { SlashCommandBuilder, PermissionsBitField } = require('discord.js');
const { Guild, Question } = require('../../models');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('listquestions')
        .setDMPermission(false)
        .setDescription('List all staff application questions for this server.'),

    async execute(interaction) {
        const serverId = interaction.guild.id; // Get the server's ID

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
            // Fetch questions from the database for the current server
            const questions = await Question.findAll({
                where: { serverId: serverId },
                order: [['questionNumber', 'ASC']], // Order questions by their number
            });

            // If no questions are found
            if (questions.length === 0) {
                return interaction.reply({
                    content: 'There are no staff application questions set up for this server.',
                    ephemeral: true,
                });
            }

            // Create a message listing the questions
            const questionList = questions
                .map(
                    (question) =>
                        `**Question ${question.questionNumber}:** ${question.questionText}`
                )
                .join('\n');

            // Split the message into chunks if it exceeds 2000 characters
            const splitMessages = [];
            let chunk = '';

            questionList.split('\n').forEach((line) => {
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