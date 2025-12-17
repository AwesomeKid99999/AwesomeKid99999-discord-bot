const { SlashCommandBuilder } = require('discord.js');
const wait = require('node:timers/promises').setTimeout;

module.exports = {
    data: new SlashCommandBuilder()
        .setName('count_to_three')
        .setDMPermission(false)
        .addUserOption(option =>
            option
                .setName('target')
                .setDescription('The member that is in trouble')
                .setRequired(false))
        .setDescription("Oh no! You are (or another member is) getting into trouble!"),
    category: 'fun',
    async execute(interaction) {
        const botId = interaction.client.user.id;

        const target = interaction.options.getUser('target') || interaction.user;
        const member = await interaction.guild.members.fetch(target.id).catch(() => null);

        if (!member) return await interaction.reply(`${target} gets a break because they are not in the server.`);
        if (target.id === botId) return await interaction.reply(`What? Why am I getting into trouble?`);

        await interaction.reply(`${target}, if you don't come here within 3 seconds, you're getting in trouble!\n||ping me to come||`);
        await wait(1000);

        // boolean flag that will flip to true when the target pings the bot
        let stopped = false;

        // filter: only messages from the target user that mention the bot
        const filter = (message) =>
            message.author.id === target.id &&
            message.mentions?.users?.has(botId);

        // create the collector (10s max just like before)
        const collector = interaction.channel.createMessageCollector({ filter, time: 10000 });

        collector.on('collect', async (message) => {
            stopped = true;
            // stop the collector and let the rest of the code know we've been interrupted
            collector.stop('collected');
            await interaction.followUp(`${target}, you came, but you're still in trouble! :rage:`);
        });

        // If user already pinged in the brief initial period, stop early
        if (stopped) return;


        // Start the counting
        await interaction.followUp("1...");
        await wait(1000);

        if (stopped) return;


        await interaction.followUp("2...");
        await wait(1000);

        if (stopped) return;

        // start counting in fractions (original behavior preserved)
        let number = 2.5;
        let count = 0;

        while (count < 3) {
            if (stopped) break; // <-- stop immediately if flagged
            await interaction.followUp(`${number}...`);
            await wait(1000);
            number = number + (3 - number) / 2;
            count++;
        }

        // final message only if we were NOT interrupted
        if (!stopped) {
            await interaction.followUp(`3! That's it, ${target}! You're in trouble! :rage:`);
        }
    },
};
