const { SlashCommandBuilder, AttachmentBuilder } = require('discord.js');

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function generateCount(start, end, { maxItems = 10000000, maxChars = 10485760 } = {}) {
    const total = end - start + 1;

    if (total > maxItems) {
        throw new Error(`Range too large: ${total} items (max ${maxItems}).`);
    }

    const parts = [];
    let lengthSoFar = 0;

    for (let i = start; i <= end; i++) {
        const part = String(i);
        // add comma and space unless last
        const sep = i === end ? '' : ', ';
        const toPush = part + sep;

        parts.push(toPush);
        lengthSoFar += toPush.length;

        if (lengthSoFar > maxChars) {
            throw new Error(`Output exceeds allowed size (${maxChars} chars).`);
        }

        // yield occasionally to avoid blocking event loop on big ranges
        if ((i - start + 1) % 1000 === 0) {
            await delay(5);
        }
    }

    return parts.join('');
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

        // Basic validation
        if (start == null || end == null) {
            return interaction.reply({ content: '❌ Invalid input.', ephemeral: true });
        }

        if (!Number.isInteger(start) || !Number.isInteger(end)) {
            return interaction.reply({ content: '❌ Start and end must be integers.', ephemeral: true });
        }

        if (end < start) {
            return interaction.reply({ content: '❌ Ending number must be greater than or equal to the starting number.', ephemeral: true });
        }

        await interaction.deferReply();

        try {
            // Safety limits: adjust if you want to allow bigger ranges
            const MAX_ITEMS = 10000000; // max count of numbers allowed
            const MAX_CHARS = 10485760; // max characters in output
            const FILE_THRESHOLD = 2000; // if longer than this, send as file

            const numString = await generateCount(start, end, { maxItems: MAX_ITEMS, maxChars: MAX_CHARS });

            if (numString.length > FILE_THRESHOLD) {
                const fileName = `count_${interaction.user.username || 'user'}.txt`;
                const buffer = Buffer.from(numString, 'utf8');
                const fileAttachment = new AttachmentBuilder(buffer, { name: fileName });

                return interaction.editReply({ files: [fileAttachment] });
            }

            return interaction.editReply({ content: numString });
        } catch (error) {
            console.error('Error generating count:', error);

            const message = error && error.message ? error.message : String(error);
            return interaction.editReply({ content: `⚠️ An error occurred: \`${message}\`` });
        }
    },
};