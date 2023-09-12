const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('message')
		.setDescription('Make me send a direct message to someone.')
		.setDMPermission(false)
		.addUserOption(option => option.setName('target')
        .setDescription('The member to message').setRequired(true))
		.addStringOption(option => option.setName('message').setDescription('The message you want to send').setRequired(true)),
		
		category: 'fun',
		async execute(interaction) {
			
			const target = interaction.options.getMember('target');
			const value = interaction.options.getString('message');
			
			if (!target) {
				return await interaction.reply(`Sorry, I cannot message **${target.user.tag}** because they are not in the server.`);
			}

			if (target.id === "872195259730386994") {
				return await interaction.reply(`I cannot DM myself silly`);
			}
			if (target.user.bot) {
				return await interaction.reply(`Sorry, I cannot message bots.`);
			}
			 if (value.length > 1811) {
				return await interaction.reply(`Please make your message shorter.`);
			 }
{
				target.send(`**${interaction.user.tag}** from **${interaction.guild.name}** has sent you a message.\n**Message:** ${value}`).catch(async (err) => {
					console.log(err)
return await interaction.editReply(`Failed to send the message. Try again. (**${target.user.tag}** may have their DMs off)`).catch((err) =>{})
})
				return await interaction.reply(`Successfully sent **${target.user.tag}** a message.\n**Message:** ${value}`);

			}
                 
	
	},
};
