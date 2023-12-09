module.exports = {
    name: 'guildMemberRemove',
    once: false,
    execute(member) {
        // This function will be called whenever a member leaves a server
        console.log(`${member.user.tag} (${member.user.id}) left ${member.guild.name}`);
    },
};