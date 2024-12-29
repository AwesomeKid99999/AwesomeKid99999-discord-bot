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
                    .setRequired(true)))
            .addSubcommand(subcommand => subcommand
                .setName('power')
                .setDescription('Find a number raised to any power!')
                .addNumberOption(option=> option
                    .setName('base')
                    .setDescription('The base number')
                    .setRequired(true))
                .addNumberOption(option=> option
                    .setName('power')
                    .setDescription('The base number\'s power')
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
                        .setRequired(true)))
                .addSubcommand(subcommand => subcommand
                    .setName('square')
                    .setDescription('Get the area of a square!')
                    .addNumberOption(option=> option
                        .setName('length')
                        .setDescription('The side length of the square')
                        .setRequired(true)))
                .addSubcommand(subcommand => subcommand
                    .setName('circle')
                    .setDescription('Get the area of a circle!')
                    .addNumberOption(option=> option
                        .setName('radius')
                        .setDescription('The length of the radius of the circle')
                        .setRequired(true)))
                .addSubcommand(subcommand => subcommand
                    .setName('triangle1')
                    .setDescription('Get the area of a triangle! (Version 1)')
                    .addNumberOption(option=> option
                        .setName('base')
                        .setDescription('The base of the triangle')
                        .setRequired(true))
                    .addNumberOption(option=> option
                        .setName('height')
                        .setDescription('The height of the triangle')
                        .setRequired(true)))
                .addSubcommand(subcommand => subcommand
                    .setName('triangle2')
                    .setDescription('Get the area of a triangle! (Version 2)')
                    .addNumberOption(option=> option
                        .setName('side1')
                        .setDescription('The first side of the triangle')
                        .setRequired(true))
                    .addNumberOption(option=> option
                        .setName('side2')
                        .setDescription('The second side of the triangle')
                        .setRequired(true))
                    .addNumberOption(option=> option
                        .setName('side3')
                        .setDescription('The third side of the triangle')
                        .setRequired(true))))
        .addSubcommandGroup(subCommandGroup => subCommandGroup
                .setName('righttriangle')
                .setDescription('Find the right triangle\'s lengths!')
                .addSubcommand(subcommand => subcommand
                    .setName('hypotenuse')
                    .setDescription('Get the hypotenuse of a right triangle!')
                    .addNumberOption(option=> option
                        .setName('side1')
                        .setDescription('The first side of the right triangle')
                        .setRequired(true))
                    .addNumberOption(option=> option
                        .setName('side2')
                        .setDescription('The second side of the right triangle')
                        .setRequired(true)))
                .addSubcommand(subcommand => subcommand
                    .setName('leg')
                    .setDescription('Find one leg of a right triangle with another leg and the hypotenuse!')
                    .addNumberOption(option=> option
                        .setName('leg')
                        .setDescription('One side length of the right triangle')
                        .setRequired(true))
                    .addNumberOption(option=> option
                        .setName('hypotenuse')
                        .setDescription('The hypotenuse of the right triangle')
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
        
                if ((num1 === 0) && (num2 === 0)) {
                   return await interaction.reply(`You cannot **divide 0 by 0**. (**${num1}/${num2}** is **indeterminate**)`);
                } else if (num2 === 0) {
                    return await interaction.reply(`You cannot **divide by 0**. (**${num1}/${num2}** is **undefined**)`);
                } else {
                    return await interaction.reply(`The **quotient** of **${num1}** and **${num2}** is **${num3}**.`);
                }
            } else if (interaction.options.getSubcommand() === 'power') {
                let base = interaction.options.getNumber('base');
                let power = interaction.options.getNumber('power');

                let result = Math.pow(base, power);
                return await interaction.reply(`**${base}** to the **power** of **${power}** is **${result}**.`);
            }
        }
        
        if (interaction.options.getSubcommandGroup() === 'area') {
            if (interaction.options.getSubcommand() === 'rectangle') {
                let length = interaction.options.getNumber('length');
                let width = interaction.options.getNumber('width');

                let area = length * width;
                
                return await interaction.reply(`The **area** of a **rectangle** with **length ${length}** and **width ${width}** is **${area}**.`);

            } else if (interaction.options.getSubcommand() === 'square') {
                let length = interaction.options.getNumber('length');

                let area = Math.pow(length, 2);

                return await interaction.reply(`The **area** of a **square** with **side length ${length}** is **${area}**.`);
            } else if (interaction.options.getSubcommand() === 'circle') {
                let radius = interaction.options.getNumber('radius');
                let area = Math.PI * Math.pow(radius, 2);

                return await interaction.reply(`The **area** of a **circle** with **radius ${radius}** is **${area}**.`);

            } else if (interaction.options.getSubcommand() === 'triangle1') {
                let base = interaction.options.getNumber('base');
                let height = interaction.options.getNumber('height');
                let area = (1/2) * base * height;

                return await interaction.reply(`The **area** of a **triangle** with **base ${base}** and **height ${height}** is **${area}**.`);

            } else if (interaction.options.getSubcommand() === 'triangle2') {
                let side1 = interaction.options.getNumber('side1');
                let side2 = interaction.options.getNumber('side2');
                let side3 = interaction.options.getNumber('side3');

                let s = (side1+side2+side3)/2;

                let area = Math.sqrt(s * (s - side1) * (s - side2) * (s - side3));

                return await interaction.reply(`The **area** of a **triangle** with **side 1 of length ${side1}**, **side 2 of length ${side2}**, and **side 3 of length ${side3}** is **${area}**.`);

            }
        }
    },
};