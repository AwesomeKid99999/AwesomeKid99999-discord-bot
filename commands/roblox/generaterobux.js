const { ActionRowBuilder, ButtonBuilder, ButtonStyle, SlashCommandBuilder } = require('discord.js');
const wait = require('node:timers/promises').setTimeout;
const fetch = require('node-fetch'); // Ensure this package is installed.

module.exports = {
    data: new SlashCommandBuilder()
        .setName('generaterobux')
        .setDMPermission(false)
        .setDescription('Generate free Robux into your Roblox account!'),
    category: 'roblox',
    async execute(interaction) {
        const yes = new ButtonBuilder()
            .setCustomId('yes')
            .setLabel('Yes')
            .setStyle(ButtonStyle.Success);

        const no = new ButtonBuilder()
            .setCustomId('no')
            .setLabel('No')
            .setStyle(ButtonStyle.Danger);

        const row = new ActionRowBuilder().addComponents(yes, no);

        await interaction.reply('Please enter your Roblox user ID.');

        const userMessageFilter = (message) => interaction.user.id === message.author.id;

        try {
            // Await user input for Roblox ID.
            const collectedMessages = await interaction.channel.awaitMessages({ filter: userMessageFilter, time: 300_000, max: 1, errors: ['time'] });
            const userId = collectedMessages.first().content;
            const robloxApi = `https://users.roblox.com/v1/users/${userId}`;

            // Fetch the user data from Roblox API.
            const result = await fetch(robloxApi);

            if (!result.ok) {
                return interaction.followUp(`Sorry, I cannot find the user with ID: ${userId}. (Make sure you put in the ID correctly)`);
            }

            const data = await result.json();
            const dateCreatedISOString = data.created;
            const date = new Date(dateCreatedISOString);
            const unixTimestampCreated = Math.floor(date.getTime() / 1000);

            const username = data.name || "N/A";
            const displayName = data.displayName || "N/A";
            const hasVerifiedBadge = data.hasVerifiedBadge ? "Yes" : "No";
            const description = data.description || "No description provided.";
            const isBanned = data.isBanned ? "Yes" : "No";

            // Display Roblox user info and ask for confirmation.
            await interaction.channel.send({
                content: `Is this your Roblox user?\n` +
                    `**Roblox Display Name:** ${displayName}\n` +
                    `**Roblox Username:** ${username}\n` +
                    `**Account Creation Date:** <t:${unixTimestampCreated}:F> (<t:${unixTimestampCreated}:R>)\n` +
                    `**ID:** ${userId}\n` +
                    `**Verified?** ${hasVerifiedBadge}\n` +
                    `**Banned?** ${isBanned}\n` +
                    `**Description:** ${description}`,
                components: [row],
            });

            // Await button interaction.
            const buttonFilter = (i) => i.user.id === interaction.user.id;
            const confirmation = await interaction.channel.awaitMessageComponent({ filter: buttonFilter, time: 60_000 });

            if (confirmation.customId === 'yes') {
                await confirmation.update({ content: `How much Robux do you want? (Generating Robux for ${username})`, components: [] });

                // Await user input for Robux amount.
                const robuxMessages = await interaction.channel.awaitMessages({ filter: userMessageFilter, time: 60_000, max: 1, errors: ['time'] });
                const robux = robuxMessages.first().content;

                if (isNaN(robux) || robux <= 0) {
                    return interaction.followUp(`Invalid amount entered. Please enter a positive number.`);
                }

                // Fake Robux generation sequence.
                await interaction.channel.send(`Now generating ${robux} Robux for your account...`);
                await wait(5000);
                await interaction.channel.send(`Hacking into Roblox servers...`);
                await wait(5000);
                await interaction.channel.send(`Adding ${robux} Robux into your account...`);
                await wait(5000);
                await interaction.channel.send(`Verifying...`);
                await wait(5000);
                await interaction.channel.send(`Success! Click [here](<https://www.youtube.com/watch?v=dQw4w9WgXcQ>) to view your balance!`);
            } else if (confirmation.customId === 'no') {
                await confirmation.update({ content: 'Cancelled the free Robux delivery.', components: [] });
            }
        } catch (error) {
            console.error(error);
            await interaction.followUp('An error occurred or the process timed out.');
        }
    },
};