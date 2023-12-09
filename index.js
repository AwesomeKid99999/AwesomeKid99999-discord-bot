const fs = require('node:fs');
const path = require('node:path');
const { Client, Collection, GatewayIntentBits, VoiceStateManager} = require('discord.js');
const { Player } = require('discord-player');
const { token, chatGptToken } = require('./config.json');
const { OpenAI } = require('openai');
const wait = require('node:timers/promises').setTimeout;


const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildVoiceStates, GatewayIntentBits.GuildMembers, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent ] });

const player = new Player(client);


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
	apiKey: chatGptToken,
})


// chatgpt
client.on('messageCreate', async (message) => {
	
	 if (message.author.bot) return;
	//  if (message.author.id === message.client.user.id) return;

	const guild =  await Guild.findOne({ where: { id: message.guild.id }})
	
		if (!guild) return; 



		if ((!guild.chatgptChannelId) && (message.mentions.users.has(message.client.user.id))) {
			try {
				await message.channel.sendTyping();
				await wait(5000);
				const chatCompletion = await openai.chat.completions.create({
				messages: [
					{ 
					
						role: 'user', 
						content: message.content 
			
					}
				],
				model: 'gpt-3.5-turbo',
			  })
				  const responseMessage =  chatCompletion.choices[0].message.content;
		const chunkSizeLimit = 2000;
	
		for (let i = 0; i < responseMessage.length; i += chunkSizeLimit) {
			const chunk = responseMessage.substring(i, i + chunkSizeLimit);
	
			await message.reply(chunk);
		}
	
			} catch (error) {
				console.error('OpenAI Error: \n', error);
				if (error.status === 404) {
					await message.reply(`404 error`);
				}
				if (error.status === 429) {
					await message.reply(`You are being rate limited. Please try again later.`);
				}
			} 
		}
        
		if (!guild.chatgptChannelId) return; 

        const channel = await message.guild.channels.fetch(`${guild.chatgptChannelId}`);
        
        if ((channel != message.channelId) && !message.mentions.users.has(message.client.user.id)) return; 

        try {
			await message.channel.sendTyping();
			await wait(5000);
            const chatCompletion = await openai.chat.completions.create({
            messages: [
				
				{ 
				
					role: 'user', 
					content: message.content 
		
				}
			],
            model: 'gpt-3.5-turbo',
            
          })
              const responseMessage = chatCompletion.choices[0].message.content;
    const chunkSizeLimit = 2000;

    for (let i = 0; i < responseMessage.length; i += chunkSizeLimit) {
        const chunk = responseMessage.substring(i, i + chunkSizeLimit);

    	 await message.reply(chunk);
    }

        } catch (error) {
            console.error('OpenAI Error: \n', error);
			if (error.status === 404) {
				await message.reply(`404 error`);
			}
			if (error.status === 429) {
				await message.reply(`You are being rate limited. Please try again later.`);
			}
        } 

})

player.extractors.loadDefault();



client.login(token);