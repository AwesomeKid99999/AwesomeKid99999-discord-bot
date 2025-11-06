const { SlashCommandBuilder, PermissionsBitField } = require('discord.js');
const {Guild} = require('../../models/')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('messagelogchannel')
        .setDescription('Add, change, or remove the message logging channel in the server. (STAFF ONLY)')
        .setDMPermission(false)
        .addChannelOption(option => option
            .setName('channel')
            .setDescription('The channel to set')),

    category: 'moderation',
    async execute(interaction) {
        const channel = interaction.options.getChannel('channel');
        const [guild] = await Guild.findOrCreate({where: {serverId: await interaction.guild.id}});




        if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageChannels)) {
            return interaction.reply(':x: You do not have permission to manage channels.');

        }

        const botMember = interaction.guild.members.cache.get(interaction.client.user.id);
        if (!botMember.permissions.has(PermissionsBitField.Flags.ManageChannels)) {
            return interaction.reply(':warning: I do not have permission to manage channels.');

        }


        if (!channel) {
            await guild.update({ messageLogChannelId: null });
            return await interaction.reply('Message logging channel has been set to **none**.');



        } else {
            await guild.update({ messageLogChannelId: channel.id });
            return await interaction.reply(`Message logging channel has been set to **${channel}**`);
        }


    },
};