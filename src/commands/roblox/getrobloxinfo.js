const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('robloxinfo')
        .setDMPermission(false)
        .setDescription('Gets your Roblox information using your Roblox ID')
        .addIntegerOption(option => option
            .setName('id')
            .setDescription('your Roblox user ID')
            .setRequired(true)),

    category: 'roblox',
    async execute(interaction) {
        const userId = interaction.options.getInteger('id')

        const robloxApi = `https://users.roblox.com/v1/users/${userId}`;

        try {
            // Fetch the user data
            const result = await fetch(robloxApi);

            if (!result.ok) {
                // User not found or API error
                return interaction.reply(`Sorry, I cannot find the user with ID: ${userId}.`);
            }

            // Parse the data
            const data = await result.json();

            // Extract data from the response
            const dateCreatedISOString = data.created;
            const date = new Date(dateCreatedISOString);
            const unixTimestampCreated = Math.floor(date.getTime() / 1000); // Convert to seconds for Discord timestamp

            const username = data.name || "N/A";
            const displayName = data.displayName || "N/A";
            const hasVerifiedBadge = data.hasVerifiedBadge ? "Yes" : "No";
            const description = data.description || "No description provided.";
            const isBanned = data.isBanned ? "Yes" : "No";
            const externalAppDisplayName = data.externalAppDisplayName || "N/A";


            // Reply with user info
            return interaction.reply(
                `**Roblox Display Name:** ${displayName}\n` +
                `**Roblox Username:** ${username}\n` +
                `**Account Creation Date:** <t:${unixTimestampCreated}:F> (<t:${unixTimestampCreated}:R>)\n` +
                `**ID:** ${userId}\n` +
                `**Verified?** ${hasVerifiedBadge}\n` +
                `**External App Display Name:** ${externalAppDisplayName}\n` +
                `**Banned?** ${isBanned}\n` +
                `**Description:** ${description}`
            );
        } catch (error) {
            console.error(error);
            return interaction.reply('An error occurred while fetching data from the Roblox API.');
        }

    },
};