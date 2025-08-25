const { SlashCommandBuilder, PermissionsBitField} = require('discord.js');
const { Guild, Question } = require("../../models");

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
            option.setName('text')
                .setDescription('The question text')
                .setRequired(true)),
    async execute(interaction) {
        const serverId = interaction.guild.id;
        const questionNumber = interaction.options.getInteger('number');
        const questionText = interaction.options.getString('text');

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



        // Check if a question with this number already exists
        const existingQuestion = await Question.findOne({ where: { serverId, questionNumber } });
        if (existingQuestion) {
            return interaction.reply({ content: `A question with number ${questionNumber} already exists!`, ephemeral: true });
        }

        // Add the new question to the database
        await Question.create({
            serverId: serverId,
            questionNumber: questionNumber,
            questionText: questionText
        });

        interaction.reply({ content: `Added question ${questionNumber}: "${questionText}"`});
    }
};