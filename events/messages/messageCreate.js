
module.exports = {
    name: 'messageCreate',
    once: false,
    async execute(message) {
        if (message.author.bot) return;
        console.log(`${message.author.tag} in #${message.channel.name} at ${message.guild.name} said ${message.content} `)

        
    },
};