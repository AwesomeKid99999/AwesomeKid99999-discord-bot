const Guild = require('../../models/guild')

module.exports = {
    name: 'guildMemberAdd',
    once: false,
    async execute(member) {
        // This function will be called whenever a member leaves a server
        console.log(`${member.user.tag} joined ${member.guild.name}`);
        const [guild] = await Guild.findOrCreate({where: {id: await member.guild.id}});

        if (!guild.welcomeChannelId) return;
        if (!guild.welcomeMessage) return;

        const welcomeChannel = await member.guild.channels.fetch(guild.welcomeChannelId)
        const welcomeMessage = guild.welcomeMessage
            .replace('{user}', `<@${member.id}>`) // Mention the user
            .replace('{username}', member.user.username) // Username of the user
            .replace('{tag}', member.user.tag) // Full tag of the user (e.g., "User#1234")
            .replace('{server}', member.guild.name); // Server name
        welcomeChannel.send(welcomeMessage);

    },
};