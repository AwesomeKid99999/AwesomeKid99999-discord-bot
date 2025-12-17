const { SlashCommandBuilder, PermissionsBitField, ChannelType } = require("discord.js");

module.exports = {
	data: new SlashCommandBuilder()
		.setName("say")
		.setDescription("Make me say something!")
		.setDMPermission(false)
		.addStringOption(opt =>
			opt.setName("input").setDescription("What should I say?").setRequired(true)
		)
		.addChannelOption(opt =>
			opt.setName("channel").setDescription("Where should I send it?")
		)
		.addBooleanOption(opt =>
			opt.setName("tts").setDescription("Enable text-to-speech?")
		),
	category: "fun",

	async execute(interaction) {
		const value = interaction.options.getString("input", true);
		const selected = interaction.options.getChannel("channel");
		const ttsRequested = interaction.options.getBoolean("tts") ?? false;

		if (value.length > 1955) {
			return interaction.reply({ content: "Please make your message shorter.", ephemeral: true });
		}

		// Resolve target channel first (so we can use it below)
		const channel = selected ?? interaction.channel;

		// Must be a guild text-based place
		if (!interaction.inGuild() || !channel.isTextBased() || channel.type === ChannelType.DM) {
			return interaction.reply({ content: "I can only send messages in guild text channels.", ephemeral: true });
		}

		// Compute required perms in that specific channel
		const userPermsNeeded = [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages];
		const botPermsNeeded  = [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages];

		if (channel.isThread()) {
			userPermsNeeded.push(PermissionsBitField.Flags.SendMessagesInThreads);
			botPermsNeeded.push(PermissionsBitField.Flags.SendMessagesInThreads);
		}

		// Check base perms
		const userCan = channel.permissionsFor(interaction.member)?.has(userPermsNeeded, true);
		if (!userCan) {
			return interaction.reply({
				content: `You don't have permission to send messages in ${channel}.`,
				ephemeral: true
			});
		}

		const me = interaction.guild.members.me ?? await interaction.guild.members.fetchMe();
		const botCanBase = channel.permissionsFor(me)?.has(botPermsNeeded, true);
		if (!botCanBase) {
			return interaction.reply({
				content: `I don't have the required permissions to send messages in ${channel}.`,
				ephemeral: true
			});
		}

		// Silent TTS fallback: only use TTS if BOTH user and bot can do it
		const userCanTTS = channel.permissionsFor(interaction.member)
			?.has(PermissionsBitField.Flags.SendTTSMessages, true);
		const botCanTTS = channel.permissionsFor(me)
			?.has(PermissionsBitField.Flags.SendTTSMessages, true);
		const useTTS = ttsRequested && userCanTTS && botCanTTS;

		try {
			if (channel.id === interaction.channelId) {
				return interaction.reply({ content: value, tts: useTTS });
			} else {
				await channel.send({ content: `**${interaction.user.tag}** - ${value}`, tts: useTTS });
				return interaction.reply({ content: `Sent your message in ${channel}.`, ephemeral: true });
			}
		} catch (error) {
			if (error?.code === 50013 || /Missing Permissions/i.test(String(error?.message))) {
				return interaction.reply({ content: `I don't have permissions to send messages in ${channel}.`, ephemeral: true });
			}
			console.error("say command error:", error);
			return interaction.reply({ content: "Something went wrong trying to send that.", ephemeral: true });
		}
	}
};