const fs = require('fs');
const path = require('path');
const Discord = require('discord.js');
const config = require('./config.json');
const siteList = require('./sitelist.json');
const db = require('./db')

db.connect();

const url = require('url');
const token = fs.readFileSync(path.resolve(__dirname, process.env.BOT_TOKEN), 'utf8').toString().trim();



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
const ChannelList = 'channelList';

function addChannel (channel) {
	addList.push(channel);
	console.log(addList);
}

const isMember = function(channel, callback) {	
	db.client().sismember(ChannelList, channel, function(err, result) {
		if (err) {
			console.log('Error when checking membership for ' + channel + ': ' + err);
			callback(false);
		} else {			
			callback(result === 1);			
		}
	})
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
		//if (!client.commands.has(commandName)) return;

		// const command = client.commands.get(commandName);

		// try {
		// 	command.execute(message, message.args);
		// } catch (error) {
		// 	console.error(error);
		// 	message.reply('there was an error trying to execute that commands');
		// }
		if (commandName == "add")
		{						
			isMember(message.channel.name, function(result) {
				if (result === true) {
					message.channel.send('Politibot is already here.');
				} else {
					db.client().sadd(ChannelList, message.channel.name);
					message.channel.send('Thanks for adding Politibot');
				}
			});			
		}
		if (commandName == "stop")
		{			
			isMember(message.channel.name, function(result){
				if (result === true) {
					db.client().srem(ChannelList, message.channel.name, function (err, result) {
					if (err) {
						console.log('there was a problem removing the channel: ' + err);
					} else {
						message.channel.send('Politibot will not bother you anymore.');
					}
				});
				} else {
					message.channel.send('Politibot is not here.');
				}
			});			
		}
		if (commandName == "list")
		{
			console.log('getting list of channels.');
			db.client().smembers(ChannelList, function(err, result) {
				if (err) {
					message.channel.send('That did not work');
					console.error(err);
				} else if (!Array.isArray(result) || !result.length) {
					message.channel.send('Politibot is not active on any channels.');
				} else {
					message.channel.send(result);
					console.log('channel results: ' + result);
				}
			});
		}
	}

	else if ( message.content.includes('https://') 
			|| message.content.includes('http://'))
		{			
			isMember(message.channel.name, function(result) {
				if (result === true) {
					var user = message.author.username;
					var urlIndex = message.content.indexOf('https://') != -1 ?
					message.content.indexOf('https://') :
					message.content.indexOf('http://');
					var myUrl = message.content.substring(urlIndex, message.content.length + 1).split(' ')[0];
					console.log(user + ' posted a url: '+ myUrl);

					var hostname = url.parse(myUrl).hostname.replace('www.', '');
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
			});			
		}
	//console.log(message.content);
});

client.login(token);
