require('dotenv').config();
const fs = require('node:fs');
const path = require('node:path');
const { Client, Collection, GatewayIntentBits } = require('discord.js');
const { OpenAI } = require('openai');
const { clearInterval } = require('node:timers');
const wait = require('node:timers/promises').setTimeout;


const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildVoiceStates, GatewayIntentBits.GuildMembers, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent ] });



client.commands = new Collection();
const commandFoldersPath = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(commandFoldersPath);

for (const commandFolder of commandFolders) {
	const commandsPath = path.join(commandFoldersPath, commandFolder);
	const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
	for (const file of commandFiles) {
		const filePath = path.join(commandsPath, file);
		const command = require(filePath);
		if ('data' in command && 'execute' in command) {
			client.commands.set(command.data.name, command);
		} else {
			console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
		}
	}
}

const eventFoldersPath = path.join(__dirname, 'events');
const eventFolders = fs.readdirSync(eventFoldersPath);

for (const eventFolder of eventFolders) {
	const eventsPath = path.join(eventFoldersPath, eventFolder);
	const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));
	for (const file of eventFiles) {
		const filePath = path.join(eventsPath, file);
		const event = require(filePath);
		if (event.once) {
			client.once(event.name, (...args) => event.execute(...args));
		} else {
			client.on(event.name, (...args) => event.execute(...args));
		}
	}
}

const openai = new OpenAI({
	apiKey: process.env.OPENAI_TOKEN,
})


// chatgpt
client.on('messageCreate', async (message) => {
	
	if (message.author.bot) return;


	const guild =  await Guild.findOne({ where: { id: message.guild.id }})
	
		if (!guild) return; 
		if (!guild.chatgptToggle) return;


		let conversation = [];
		conversation.push({
			role: 'system',
			content: 'Awesome\'s Utility is friendly.'
		})

		let prevMessages = await message.channel.messages.fetch({ limit: 10 });
		prevMessages.reverse();
		prevMessages.forEach ((msg) => {
			if (msg.author.bot && msg.author.id !== client.user.id) return;

			const username = msg.author.username.replace(/\s+/g, '_').replace(/[^\w\s]/gi, '');

			if (msg.author.id === client.user.id) {
				conversation.push({
					role: 'assistant', 
					name: username,
					content: msg.content,
				
				});
				return;
			}
			if (msg.attachments.size > 0) {
				msg.attachments.forEach(attachment => {
					// Check if the attachment is an image
					if (attachment.contentType && attachment.contentType.startsWith('image/')) {
						// Handle the image, e.g., download or process it
						conversation.push ({
							role: 'user',
							name: username,
							content: [{ type: "text", text: msg.content },
								{ type: "image_url", image_url: { url: attachment.url } },],
						})
					} else {
						conversation.push ({
							role: 'user',
							name: username,
							content: [{ type: "text", text: msg.content },
								{ type: "image_url", image_url: { url: attachment.url } },],
						})
					}


				});
			} else {
				conversation.push ({
					role: 'user',
					name: username,
					content: msg.content,
				})
			}

		})



		if ((!guild.chatgptChannelId) && (message.mentions.users.has(message.client.user.id))) {
			try {
				await message.channel.sendTyping();

				const sendTypingInterval = setInterval(() => {
					message.channel.sendTyping();
				}, 5000);

				try {
					await wait(5000);
					const chatCompletion = await openai.chat.completions.create({
						messages: conversation,
						model: 'gpt-4o',
					});

					const responseMessage = chatCompletion.choices[0].message.content;
					const chunkSizeLimit = 2000;

					for (let i = 0; i < responseMessage.length; i += chunkSizeLimit) {
						const chunk = responseMessage.substring(i, i + chunkSizeLimit);
						await message.reply(chunk);
					}
				} catch (error) {
					console.error('OpenAI Error: \n', error);
					if (error.status === 400) {
						await message.reply(`Bad Request! ${error}`);
					} else if (error.status === 404) {
						await message.reply(`404 error: ${error}`);
					} else if (error.status === 429) {
						await message.reply(`You are being rate limited. Please try again later. ${error}`);
					} else {
						await message.reply(`An unexpected error occurred: ${error}`);
					}
				} finally {
					clearInterval(sendTypingInterval); // Ensure cleanup here
				}
			} catch (outerError) {
				console.error('Error sending typing or initializing interval:', outerError);
				await message.reply(`An error occurred before processing the request.`);
			}
		}
        
		if (!guild.chatgptChannelId) return;
		try {
			const channel = await message.guild.channels.fetch(`${guild.chatgptChannelId}`);

		} catch (error) {
			if (error.code === 10003) {
				console.log('Unknown Channel');
				return;
			}
		}
	const channel = await message.guild.channels.fetch(`${guild.chatgptChannelId}`);

	if ((!channel) && !message.mentions.users.has(message.client.user.id)) return;

	if ((channel != message.channelId) && !message.mentions.users.has(message.client.user.id)) return;

	try {
		await message.channel.sendTyping();

		const sendTypingInterval = setInterval(() => {
			message.channel.sendTyping();
		}, 5000);

		try {
			await wait(5000);




			const chatCompletion = await openai.chat.completions.create({
				messages: conversation,
				model: 'gpt-4o',
			});

			const responseMessage = chatCompletion.choices[0].message.content;
			const chunkSizeLimit = 2000;

			for (let i = 0; i < responseMessage.length; i += chunkSizeLimit) {
				const chunk = responseMessage.substring(i, i + chunkSizeLimit);
				await message.reply(`${chunk}`);
			}
		} catch (error) {
			console.error('OpenAI Error: \n', error);
			if (error.status === 400) {
				await message.reply(`Bad Request! ${error}`);
			} else if (error.status === 404) {
				await message.reply(`404 error: ${error}`);
			} else if (error.status === 429) {
				await message.reply(`You are being rate limited. Please try again later. ${error}`);
			} else {
				await message.reply(`An unexpected error occurred: ${error}`);
			}
		} finally {
			clearInterval(sendTypingInterval); // Ensure cleanup here
		}
	} catch (outerError) {
		console.error('Error sending typing or initializing interval:', outerError);
		await message.reply(`An error occurred before processing the request.`);
	}

})









client.login(process.env.DISCORD_BOT_TOKEN);