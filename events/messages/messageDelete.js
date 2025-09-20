const {Guild} = require('../../models/')

module.exports = {
    name: 'messageDelete',
    once: false,
    async execute(message) {



        if (message.author.bot) return;
        if (message.system) {
            console.log(`System message deleted in #${message.channel.name} at ${message.guild.name}`);
            const guild = await Guild.findOne({ where: { serverId: await message.guild.id }});
            if (!guild) {
                return console.log(`${message.guild.name} does not exist in the database`);
            }
            if (!guild.messageLogChannelId) {
                return console.log(`${message.guild.name} does not have a message log channel set`);
            }
            const channel = await message.guild.channels.fetch(`${guild.messageLogChannelId}`);
            if (!channel) {
                return console.log(`${message.guild.name} has an invalid log channel`);
            }
            channel.send(`System message deleted in <#${message.channelId}>`);
            return;
        }




        if (message.attachments.size > 0) {
            console.log(`A message by ${message.author.tag} with an attachment was deleted in #${message.channel.name} at ${message.guild.name}: ${message.content}`)

            const guild = await Guild.findOne({ where: { serverId: await message.guild.id }});
            if (!guild) {
                return console.log(`${message.guild.name} does not exist in the database`);
            }
            if (!guild.messageLogChannelId) {
                return console.log(`${message.guild.name} does not have a message log channel set`);
            }
            const channel = await message.guild.channels.fetch(`${guild.messageLogChannelId}`);
            if (!channel) {
                return console.log(`${message.guild.name} has an invalid log channel`);
            }

            channel.send(`A message by **${message.author.tag}** with an attachment was deleted in <#${message.channelId}>: ${message.content}`)
            message.attachments.forEach(attachment => {
                // Check if the attachment is an image
                if (attachment.contentType && attachment.contentType.startsWith('image/')) {
                    console.log(`${attachment.url}`);
                    channel.send(`${attachment.url}`);
                    // Handle the image, e.g., download or process it
                } else {
                    console.log(` ${attachment.url}`);
                    channel.send(`${attachment.url}`);
                }
            });
        } else {
            console.log(`A message by ${message.author.tag} was deleted in #${message.channel.name} at ${message.guild.name}: ${message.content} `)

            const guild = await Guild.findOne({ where: { serverId: await message.guild.id }});
            if (!guild) {
                return console.log(`${message.guild.name} does not exist in the database`);
            }
            if (!guild.messageLogChannelId) {
                return console.log(`${message.guild.name} does not have a message log channel set`);
            }
            const channel = await message.guild.channels.fetch(`${guild.messageLogChannelId}`);
            if (!channel) {
                return console.log(`${message.guild.name} has an invalid log channel`);
            }

            channel.send(`A message by **${message.author.tag}** was deleted in <#${message.channelId}>: ${message.content} `)
        }

    },
};