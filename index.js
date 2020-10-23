const fs = require('fs');
const path = require('path');
const Discord = require('discord.js');
const config = require('./config.json');
const siteList = require('./sitelist.json');
const url = require('url');
const token = fs.readFileSync(path.resolve(__dirname, process.env.BOT_TOKEN), 'utf8').toString();
const client = new Discord.Client();

client.commands = new Discord.Collection();
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
	const command = require(`./commands/${file}`);
	client.commands.set(command.name, command);
}

client.once('ready', () => {
	console.log('Ready!');
});

var addList = [];

function addChannel (channel) {
	addList.push(channel);
	console.log(addList);
}


client.on('message', message => {
	//ignore the bot
	if (message.author.bot) { 
		return;
	}
	//handle commands	
	else if (message.content.startsWith(config.prefix))
	{
		const args = message.content.slice(config.prefix.length).trim().split(' ');
		const commandName = args.shift().toLowerCase();		
		if (!client.commands.has(commandName)) return;

		// const command = client.commands.get(commandName);

		// try {
		// 	command.execute(message, message.args);
		// } catch (error) {
		// 	console.error(error);
		// 	message.reply('there was an error trying to execute that commands');
		// }
		if (commandName == "add")
		{
			addList.push(message.channel.name);
			message.channel.send('Thanks for adding Politibot.');
			console.log(addList);
		}
		if (commandName == "stop")
		{
			addList.splice(addList.indexOf(message.channel.name), 1);
			message.channel.send('Politibot will not both you anymore.');
			console.log(addList);
		}
	}

	else if ( addList.includes(message.channel.name) &&
		( message.content.includes('https://') 
			|| message.content.includes('http://'))
		)
		{			
			var user = message.author.username;
			var urlIndex = message.content.indexOf('https://') != -1 ?
				message.content.indexOf('https://') :
				message.content.indexOf('http://');
			var myUrl = message.content.substring(urlIndex, message.content.length + 1).split(' ')[0];
			console.log(user + ' posted a url: '+ myUrl);

			var hostname = url.parse(myUrl).hostname;			
			var urlPath = url.parse(myUrl).path;
			var matchingSite = siteList.find(x => x.url === hostname);
			if (matchingSite === null || matchingSite === undefined)
			{
				console.log('no matching site found for ' + hostname);
			}
			else
			{
				const allSidesEmbed = new Discord.MessageEmbed()
					.setColor('#0099ff')
					.setTitle( matchingSite.name )
					//.setURL('https://www.allsides.com/media-bias/media-bias-ratings')
					.setDescription(`${matchingSite.name} has a bias rating of: ${matchingSite.bias}. See more [here](https://www.allsides.com/media-bias/media-bias-ratings)`)
				
				message.channel.send(allSidesEmbed);
				// message.channel.send(`${matchingSite.name} has a bias rating of: ${matchingSite.bias}. See more here http://www.allsides.com`)				
				// .then(console.log)
				// .catch(console.error);				
			}
		}
	//console.log(message.content);
});

client.login(token);
