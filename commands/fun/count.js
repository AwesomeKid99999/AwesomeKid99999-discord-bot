const fs = require('node:fs');
const { SlashCommandBuilder, AttachmentBuilder } = require('discord.js');

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function generateCount(start, end) {
    let numString = '';

    for (let i = start; i <= end; i++) {
        numString += i + (i === end ? '' : ', ');

        // Every 1000 numbers, yield to event loop to avoid freezing
        if ((i - start + 1) % 1000 === 0) {
            await delay(5); // Tiny pause to let Discord.js process
        }
    }

    return numString;
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('count')
        .setDMPermission(false)
        .setDescription('Count numbers!')
        .addIntegerOption(option =>
            option.setName('starting_number')
                .setDescription('The starting number')
                .setRequired(true))
        .addIntegerOption(option =>
            option.setName('ending_number')
                .setDescription('The ending number')
                .setRequired(true)),
    category: 'fun',

    async execute(interaction) {
        const start = interaction.options.getInteger('starting_number');
        const end = interaction.options.getInteger('ending_number');

        if (end < start) {
            return interaction.reply("❌ Ending number must be greater than or equal to the starting number.");
        }

        await interaction.deferReply();

        try {
            const numString = await generateCount(start, end);

            if (numString.length > 2000) {
                const fileName = `count_${interaction.user.username}.txt`;
                fs.writeFileSync(fileName, numString);

                const fileAttachment = new AttachmentBuilder(fileName);

                fs.unlinkSync(fileName);

                return interaction.editReply({
                    files: [fileAttachment],
                });
            }

            return interaction.editReply(numString);
        } catch (error) {
            console.error("Error generating count:", error);
            return interaction.editReply(`⚠️ An error occurred: \`${error.message || error}\``);
        }
    },
};