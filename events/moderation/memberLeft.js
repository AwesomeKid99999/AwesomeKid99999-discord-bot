const Guild = require('../../models/guild')

module.exports = {
    name: 'guildMemberRemove',
    once: false,
    async execute(member) {
        // This function will be called whenever a member leaves a server
        console.log(`${member.user.tag} left ${member.guild.name}`);

        const [guild] = await Guild.findOrCreate({where: {id: await member.guild.id}});

        if (!guild.leaveChannelId) return;
        if (!guild.leaveMessage) return;

        const leaveChannel = await member.guild.channels.fetch(guild.leaveChannelId)
        const leaveMessage = guild.leaveMessage
            .replace('{user}', `<@${member.id}>`) // Mention the user
            .replace('{username}', member.user.username) // Username of the user
            .replace('{tag}', member.user.tag) // Full tag of the user (e.g., "User#1234")
            .replace('{server}', member.guild.name); // Server name
        leaveChannel.send(leaveMessage);

    },
};