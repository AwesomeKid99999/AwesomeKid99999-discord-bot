const Guild = require('../../models/guild');

module.exports = {
    name: 'guildMemberAdd',
    once: false,
    async execute(member) {
        // This function will be called whenever a member joins a server
        console.log(`${member.user.tag} joined ${member.guild.name}`);
        const guild =  await Guild.findOne({ where: { id: member.guild.id }});
        if (!guild) {
            console.log(`${member.guild.name} does not exist in the database`);
        }
        if (!guild.welcomeChannelId) return;

        const channel = await member.guild.channels.fetch(`${guild.welcomeChannelId}`);
        try {
            return await channel.send(`**${member.user}**, welcome to **${member.guild.name}**!`);
        } catch (error) {
            if (error.message === 'Missing Permissions') {
                console.log(`Cannot send messages in ${channel}`);
            }
        }
    },
};