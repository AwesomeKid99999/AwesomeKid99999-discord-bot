const { SlashCommandBuilder } = require ('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('divide')
        .setDMPermission(false)
        .setDescription('Divide two numbers!')
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

        let num3 = num1 / num2;

        if (num2 == 0) {
           return await interaction.reply(`You cannot **divide by 0. (${num1}/${num2})**`);
        } else {
           return await interaction.reply(`The **quotient** of **${num1}** and **${num2}** is **${num3}**.`);
        }

    },
};