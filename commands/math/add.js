const { SlashCommandBuilder } = require ('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('add')
        .setDMPermission(false)
        .setDescription('Add two numbers!')
        .addNumberOption(option=> option
            .setName('first')
            .setDescription('The first number')
            .setRequired(true))
        .addNumberOption(option=> option
            .setName('second')
            .setDescription('The second number')
            .setRequired(true)),
    category: 'math',
    async execute (interaction) {
        let num1 = interaction.options.getNumber('first');
        let num2 = interaction.options.getNumber('second');


        let num3 = num1 + num2;

        if ((num1 == 9 && num2 == 10) || (num1 == 10 && num2 == 9)) {
            num3 = 21;
        }

        return await interaction.reply(`The **sum** of **${num1}** and **${num2}** is **${num3}**.`);

    },
};