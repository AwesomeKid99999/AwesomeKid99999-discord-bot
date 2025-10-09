const { SlashCommandBuilder } = require ('discord.js');
const SixSeven = require('../../helpers/SixSeven');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('convert_temperature')
        .setDescription('Convert a temperature into different units!')
        .setDMPermission(false)
        .addSubcommand(subcommand => subcommand
            .setName('fahrenheit_to_celsius')
            .setDescription('Convert a temperature from Fahrenheit to Celsius!')
            .addNumberOption(option => option
                .setName('degrees')
                .setDescription('Degrees in Fahrenheit')
                .setRequired(true)))
        .addSubcommand(subcommand => subcommand
            .setName('celsius_to_fahrenheit')
            .setDescription('Convert a temperature from Celsius to Fahrenheit!')
            .addNumberOption(option => option
                .setName('degrees')
                .setDescription('Degrees in Celsius')
                .setRequired(true)))
        .addSubcommand(subcommand => subcommand
            .setName('fahrenheit_to_kelvin')
            .setDescription('Convert a temperature from Fahrenheit to Kelvin!')
            .addNumberOption(option => option
                .setName('degrees')
                .setDescription('Degrees in Fahrenheit')
                .setRequired(true)))
        .addSubcommand(subcommand => subcommand
            .setName('kelvin_to_fahrenheit')
            .setDescription('Convert a temperature from Kelvin to Fahrenheit!')
            .addNumberOption(option => option
                .setName('degrees')
                .setDescription('Degrees in Kelvin')
                .setRequired(true)))
        .addSubcommand(subcommand => subcommand
            .setName('celsius_to_kelvin')
            .setDescription('Convert a temperature from Celsius to Kelvin!')
            .addNumberOption(option => option
                .setName('degrees')
                .setDescription('Degrees in Celsius')
                .setRequired(true)))
        .addSubcommand(subcommand => subcommand
            .setName('kelvin_to_celsius')
            .setDescription('Convert a temperature from Kelvin to Celsius!')
            .addNumberOption(option => option
                .setName('degrees')
                .setDescription('Degrees in Kelvin')
                .setRequired(true))),


    async execute(interaction) {
       const option = interaction.options.getSubcommand();

       if (option === 'fahrenheit_to_celsius') {
           let temperature = interaction.options.getNumber('degrees')
           let result = (5/9) * (temperature - 32);
           temperature = SixSeven(temperature);
           result = SixSeven(result);
           return await interaction.reply(`**${temperature} degrees Fahrenheit** is equal to **${result} degrees Celsius**`);
       }

       if (option === 'celsius_to_fahrenheit') {
           let temperature = interaction.options.getNumber('degrees')
           let result = ((9/5) * temperature) + 32;
           temperature = SixSeven(temperature);
           result = SixSeven(result);
           return await interaction.reply(`**${temperature} degrees Celsius** is equal to **${result} degrees Fahrenheit**`);
       }

       if (option === 'fahrenheit_to_kelvin') {
           let temperature = interaction.options.getNumber('degrees')
           let result = (5/9) * (temperature - 32) + 273.15;
           temperature = SixSeven(temperature);
           result = SixSeven(result);
           await interaction.reply(`**${temperature} degrees Fahrenheit** is equal to **${result} degrees Kelvin**`);
       }

       if (option === 'kelvin_to_fahrenheit') {
           let temperature = interaction.options.getNumber('degrees')
           let result =  ((temperature - 273.15) * (9/5)) + 32;
           temperature = SixSeven(temperature);
           result = SixSeven(result);
           await interaction.reply(`**${temperature} degrees Kelvin** is equal to **${result} degrees Fahrenheit**`);
       }

       if (option === 'celsius_to_kelvin') {
           let temperature = interaction.options.getNumber('degrees')
           let result = temperature + 273.15;
           temperature = SixSeven(temperature);
           result = SixSeven(result);
           await interaction.reply(`**${temperature} degrees Celsius** is equal to **${result} degrees Kelvin**`);
       }

       if (option === 'kelvin_to_celsius') {
           let temperature = interaction.options.getNumber('degrees')
           let result = temperature - 273.15;
           temperature = SixSeven(temperature);
           result = SixSeven(result);
           await interaction.reply(`**${temperature} degrees Kelvin** is equal to **${result} degrees Celsius**`);
       }

    },
};

