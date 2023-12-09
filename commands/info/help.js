const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('help')
		.setDMPermission(false)
		.setDescription('Replies with bot information!'),
	async execute(interaction) {
		await interaction.reply(`I am a bot that was designed for **Awesome Kid Plays'** Discord server! I can do *quite a few basic commands*, and that includes __showing your avatar, testing the latency, showing basic server information, showing basic user information, and providing a link to the bot owner's website__. However, I can't do **basic moderation actions __except__** for **bulk deleting messages** ||(only because **the bot owner is dumb** and **__doesn't know how to set up permissions on who can kick, ban, mute, and more using me__**)||. On the bright side, I can create **fake** moderation messages. ||Also he didn't code the music part, he is using JMusicBot by **jagrosh**|| In fact, I was created by AwesomeKid99999.\n\nUpdate 7/24/23: he figured out how to properly set up the kick and ban commands :open_mouth:`);
		await interaction.followUp(`Update 11/22/23: I now have access to Ihsoy's music commands! It is powered by Cadence.`)
	},
};