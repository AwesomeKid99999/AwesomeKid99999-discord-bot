const { SlashCommandBuilder } = require ('discord.js');
const SixSeven = require("../../helpers/SixSeven");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('convert_number')
        .setDescription('Convert numbers into a different base!')
        .setDMPermission(false)
        .addIntegerOption(option=>option
            .setName('input_base')
            .setDescription('the base of the input number')
            .setRequired(true)
            .setMinValue(2)
            .setMaxValue(36))
        .addStringOption(option=>option
            .setName('number')
            .setDescription('the number to convert')
            .setRequired(true))
        .addIntegerOption(option=>option
            .setName('output_base')
            .setDescription('the base of the output number')
            .setRequired(true)
            .setMinValue(2)
            .setMaxValue(36)),
    category: 'math',
    async execute (interaction) {


        let fromBase = interaction.options.getInteger('input_base');
        let value = interaction.options.getString('number');
        let toBase = interaction.options.getInteger('output_base');

        if (value == "Math.PI") {
            pi = Math.PI.toString();
            value = pi;
        }

        let [intPart, fracPart] = value.split("."); // Split into integer and fractional part

        // Convert the integer part
        let decimalIntPart = parseInt(intPart, fromBase);

        console.log(intPart, decimalIntPart)

        if (isNaN(decimalIntPart)) {
            return await interaction.reply(`Error! Check your input number!`);

        }

        let resultIntPart = decimalIntPart.toString(toBase);

        value = SixSeven(value);
        resultIntPart = SixSeven(resultIntPart);

        if (!fracPart) return await interaction.reply(`The number **${value} (in base ${fromBase})** converted to **base ${toBase}** would be **${resultIntPart}**`); // No fractional part, return integer result
    
        // Convert the fractional part
        let decimalFracPart = 0;
        for (let i = 0; i < fracPart.length; i++) {
            decimalFracPart += parseInt(fracPart[i], fromBase) / Math.pow(fromBase, i + 1);
        }
    
        let resultFracPart = "";
        for (let i = 0; i < 99; i++) { 
            decimalFracPart *= toBase;
            let fracDigit = Math.floor(decimalFracPart);
            resultFracPart += fracDigit.toString(toBase);
            decimalFracPart -= fracDigit;
            if (decimalFracPart === 0) break;
        }

        resultFracPart = SixSeven(resultFracPart);


       return await interaction.reply(`The number **${value} (in base ${fromBase})** converted to **base ${toBase}** would be **${resultIntPart}.${resultFracPart}**`);

    },
};