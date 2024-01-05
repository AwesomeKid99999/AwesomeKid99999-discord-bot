const { SlashCommandBuilder } = require ('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('math')
        .setDescription('Do various math commands!')
        .setDMPermission(false)
        // math operations
        .addSubcommandGroup(subCommandGroup => subCommandGroup
            .setName('operation')
            .setDescription('Do various math operations! (add, subtract, multiply, divide, etc.)')
            .addSubcommand(subcommand => subcommand
                .setName('add')
                .setDescription('Add two numbers!')
                .addNumberOption(option=> option
                    .setName('first')
                    .setDescription('The first number')
                    .setRequired(true))
                .addNumberOption(option=> option
                    .setName('second')
                    .setDescription('The second number')
                    .setRequired(true)))
            .addSubcommand(subcommand => subcommand
                .setName('subtract')
                .setDescription('Subtract two numbers!')
                .addNumberOption(option=> option
                    .setName('first')
                    .setDescription('The first number')
                    .setRequired(true))
                .addNumberOption(option=> option
                    .setName('second')
                    .setDescription('The second number')
                    .setRequired(true)))
            .addSubcommand(subcommand => subcommand
                .setName('multiply')
                .setDescription('Multiply two numbers!')
                .addNumberOption(option=> option
                    .setName('first')
                    .setDescription('The first number')
                    .setRequired(true))
                .addNumberOption(option=> option
                    .setName('second')
                    .setDescription('The second number')
                    .setRequired(true)))
            .addSubcommand(subcommand => subcommand
                .setName('divide')
                .setDescription('Divide two numbers!')
                .addNumberOption(option=> option
                    .setName('first')
                    .setDescription('The first number')
                    .setRequired(true))
                .addNumberOption(option=> option
                    .setName('second')
                    .setDescription('The second number')
                    .setRequired(true))))
            
            // area
            .addSubcommandGroup(subCommandGroup => subCommandGroup
                .setName('area')
                .setDescription('Find the area of different shapes!')
                .addSubcommand(subcommand => subcommand
                    .setName('rectangle')
                    .setDescription('Get the area of a rectangle!')
                    .addNumberOption(option=> option
                        .setName('length')
                        .setDescription('The length of the rectangle')
                        .setRequired(true))
                    .addNumberOption(option=> option
                        .setName('width')
                        .setDescription('The width of the rectangle')
                        .setRequired(true)))),
    category: 'math',
    async execute (interaction) {

        // math operations
        if (interaction.options.getSubcommandGroup() === 'operation') {
            if (interaction.options.getSubcommand() === 'add') {
                let num1 = interaction.options.getNumber('first');
                let num2 = interaction.options.getNumber('second');
        
        
                let num3 = num1 + num2;
        
                if ((num1 == 9 && num2 == 10) || (num1 == 10 && num2 == 9)) {
                    num3 = 21;
                }
        
                return await interaction.reply(`The **sum** of **${num1}** and **${num2}** is **${num3}**.`);
            } else if (interaction.options.getSubcommand() === 'subtract') {
                let num1 = interaction.options.getNumber('first');
                let num2 = interaction.options.getNumber('second');
        
                let num3 = num1 - num2;
        
                return await interaction.reply(`The **difference** of **${num1}** and **${num2}** is **${num3}**.`);
        
            } else if (interaction.options.getSubcommand() === 'multiply') {
                let num1 = interaction.options.getNumber('first');
                let num2 = interaction.options.getNumber('second');
        
                let num3 = num1 * num2;
        
                return await interaction.reply(`The **product** of **${num1}** and **${num2}** is **${num3}**.`);
            } else if (interaction.options.getSubcommand() === 'divide') {
                let num1 = interaction.options.getNumber('first');
                let num2 = interaction.options.getNumber('second');
        
                let num3 = num1 / num2;
        
                if (num2 == 0) {
                   return await interaction.reply(`You cannot **divide by 0. (${num1}/${num2})**`);
                } else {
                   return await interaction.reply(`The **quotient** of **${num1}** and **${num2}** is **${num3}**.`);
                }
            }
        }
        
        if (interaction.options.getSubcommandGroup() === 'area') {
            if (interaction.options.getSubcommand() === 'rectangle') {
                let length = interaction.options.getNumber('length');
                let width = interaction.options.getNumber('width');

                let area = length * width;
                
                return await interaction.reply(`The **area** of a **rectangle** with **length ${length}** and **width ${width}** is **${area}**.`);

            }
        }
    },
};