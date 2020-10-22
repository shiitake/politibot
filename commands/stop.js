module.exports = {
	name: 'stop',
	description: 'Stop Politibot',
	execute(message, args) {
		message.channel.send("Ok. Politibot will stop bothering you.");
	},
};