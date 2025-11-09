const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('poll')
        .setDescription('Create a poll!')
        .setDMPermission(false)
        .addStringOption(option => option
            .setName('question')
            .setDescription('The question for the poll')
            .setRequired(true))
        .addStringOption(option => option
            .setName('choices')
            .setDescription('Comma-separated choices for the poll (max 20)')
            .setRequired(true))
        .addBooleanOption(option => option
            .setName("embed")
            .setDescription('Whether the poll should be an embed')),
        category: 'fun',
    async execute(interaction) {

        const isEmbed = interaction.options.getBoolean('embed');

        const whoAsked = interaction.user.tag;
        const question = interaction.options.getString('question');
        const choices = interaction.options.getString('choices');
        // array of emojis (you can change this)
        const emojis = [
            '<:1_:1266235413513633842>', '<:2_:1266235430462816399>', '<:3_:1266235464600387717>', '<:4_:1266235466026582027>',
            '<:5_:1266235467762765914>', '<:6_:1266235469142949979>', '<:7_:1266235470850035815>', '<:8_:1266235472540078204>',
            '<:9_:1266235473806753883>', '<:10:1266235475190878338>', '<:11:1266235476751286415>', '<:12:1266235582300819548>',
            '<:13:1266235480400203776>', '<:14:1266235482518327428>', '<:15:1266235583932530828>', '<:16:1266235486327017594>',
            '<:17:1266235585400537193>', '<:18:1266235490659729418>', '<:19:1266235492664348725>', '<:20:1266235587011149957>'
        ];


        // Split the choices and validate
        const pollOptions = choices.split(',').map(choice => choice.trim());
        if (pollOptions.length > 20) {
            return interaction.reply(':x: You can only have up to 20 choices.');
        }
        let choicesMessage = '';
        pollOptions.forEach((option, index) => {
            choicesMessage += `${emojis[index]} ${option}\n`;
        });



        let pollMessage;

        if (isEmbed) {
            const embed = new EmbedBuilder()
                .setColor("Random")
                .setTitle(question)
                .setAuthor({name: whoAsked, iconURL: interaction.user.displayAvatarURL({dynamic: true})})
                .setDescription(choicesMessage)
                .setTimestamp()
            pollMessage = await interaction.reply({ embeds: [embed], fetchReply: true})
        } else {
         pollMessage = await interaction.reply({ content:`📊 Poll by **${whoAsked}**\n\n**Question:** ${question}\n${choicesMessage}\n**This question was asked:** <t:${(interaction.createdTimestamp/1000).toPrecision(10)}:F>`, fetchReply: true });
        }

        // React with emojis for each choice
        for (let i = 0; i < pollOptions.length; i++) {
            await pollMessage.react(emojis[i]);
        }
    },
};