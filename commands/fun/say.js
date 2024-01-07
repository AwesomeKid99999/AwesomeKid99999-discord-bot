const { err } = require('@sapphire/framework');
const { SlashCommandBuilder, PermissionsBitField } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('say')
		.setDescription('Make me say something!')
		.setDMPermission(false)
		.addStringOption(option => option.setName('input').setDescription('The input for me to say').setRequired(true))
		.addChannelOption(option => option.setName('channel').setDescription('Where I should send the message'))
		.addStringOption((option) =>
            option
                .setName('tts')
                .setDescription('Use text to speech?')
                .setRequired(false)
                .addChoices(
                    { name: 'yes', value: '1' },
                    { name: 'no', value: '0' }
                )
        ),
		category: 'fun',
	async execute(interaction) {
		const value = await interaction.options.getString('input');
		const channel = await interaction.options.getChannel('channel');
		const botMember = await interaction.guild.members.cache.get(interaction.client.user.id);



		const mode =  interaction.options.getString('tts');
	

	
		if (value.length > 1955) {
			return await interaction.reply(`Please make your message shorter.`);
		 }

		 if (!mode || mode == 'no') {
			if (!channel || channel.id === interaction.channel.id ) {
				return await interaction.reply(`${value}`);
			}
			
			if (!botMember.permissions.has(PermissionsBitField.Flags.SendMessages)) {
				return await interaction.reply(`I do not have permission to send messages.`);
			}

			try {
				await channel.send(`**${interaction.user.tag}** - ${value}`);
				return await interaction.reply(`Sent a message in ${channel}!`);
			} catch (error) {
				if (error.message === 'Missing Permissions') {
					return await interaction.reply(`I do not have permissions to send messages in ${channel}.`);
				}
			}
			
		 } else {

			if (!channel || channel.id === interaction.channel.id ) {
					return await interaction.reply({content: `${value}`, tts: true});
				}
	
				if (!botMember.permissions.has(PermissionsBitField.Flags.SendMessages)) {
					return await interaction.reply(`I do not have permission to send messages.`);
				}
				try {
					await channel.send({ content: `**${interaction.user.tag}** - ${value}`, tts: true});
					return await interaction.reply(`Sent a message in ${channel}!`);
				
				} catch (error) {
					if (error.message === 'Missing Permissions') {
						return await interaction.reply(`I do not have permissions to send messages in ${channel}.`);
					}
				}
		 }


		
			
			
			
		
	},
};