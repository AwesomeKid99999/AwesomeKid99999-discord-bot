const { SlashCommandBuilder, PermissionsBitField } = require('discord.js');
const {Guild} = require('../../models/')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('applicationtoggle')
        .setDescription('Open or close staff applications in the server. (STAFF ONLY)')
        .setDMPermission(false)
        .addBooleanOption(option => option
            .setName('open')
            .setDescription('Whether or not to open staff applications')),
    category: 'moderation',
    async execute(interaction) {
        const enable = interaction.options.getBoolean('open');
        const [guild] = await Guild.findOrCreate({where: {serverId: await interaction.guild.id}});




        if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageGuild)) {
            return interaction.reply(':x: You do not have permission to manage the server.');

        }



        if (!enable) {
            await guild.update({ applicationToggle: false });
            console.log(`Staff apps disabled in ${interaction.guild}`);
            return await interaction.reply('Staff applications have been **closed**.');



        } else {
            await guild.update({ applicationToggle: true });
            console.log(`Staff apps enabled in ${interaction.guild}`);
            return await interaction.reply(`Staff applications have been **opened**.`);

        }


    },
};