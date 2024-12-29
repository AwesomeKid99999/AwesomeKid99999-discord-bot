
module.exports = {
    name: 'messageCreate',
    once: false,
    async execute(message) {
        if (message.author.bot) return;
        if (message.attachments.size > 0) {
            console.log(`${message.author.tag} in #${message.channel.name} at ${message.guild.name} sent: ${message.content}`)
            message.attachments.forEach(attachment => {
                // Check if the attachment is an image
                if (attachment.contentType && attachment.contentType.startsWith('image/')) {
                    console.log(`${attachment.url}`);
                    // Handle the image, e.g., download or process it
                } else {
                    console.log(` ${attachment.url}`);
                }
            });
        } else {
            console.log(`${message.author.tag} in #${message.channel.name} at ${message.guild.name} said ${message.content} `)
        }

        
    },
};