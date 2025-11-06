const { SlashCommandBuilder } = require('discord.js');


module.exports = {
	data: new SlashCommandBuilder()
		.setName('commands')
		.setDMPermission(false)
		.setDescription('Replies with my commands you can use!'),
	async execute(interaction) {
		await interaction.reply(`**__Slash Commands:__**\n**/avatar** - Get the avatar URL of the selected user, or your own avatar.\n**/beep** - Replies with "Boop"!\n**/commands** - Replies with slash commands you can use!\n**/help** - Replies with bot information!\n**/jokeban** - Ban a member (or a non-member, and jokingly) from this server!\n**/jokekick** - Kick a member (or a non-member, and jokingly) from this server!\n**/jokemute** - Mute a member (or a non-member, and jokingly) in this server!\n**/jokewarn** - Warn a member (or a non-member, and jokingly) in this server!\n**/message** - Make me DM someone!\n**/ping** - Replies with "Pong" and the latency!\n**/say** - Make me say something!\n**/serverinfo** - Replies with server info!\n**/userinfo** - Replies with user info!\n**/website** - Replies with the link to Awesome's website!\n**/time** - Replies with the current time! (it matches with your time zone)\n\n**__Staff Commands:__**\n**/addrole** - Add a role to a member.\n**/removerole** - Remove a role from a member.\n**/purge** - Bulk delete up to 100 messages.\n**/staffban** - Ban a user from the server.\n**/staffunban** - Unban a user from the server.\n**/staffkick** - Kick a user from the server.\n\n**__Music Commands:__** (THESE COMMANDS ONLY WORK WHEN THE MUSIC MODULE IS ACTIVE!)\n**?help** - This command will make me send you all the music commands in your direct messages! `);
	},
};