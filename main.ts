import { Client, Intents, Message, Snowflake } from 'discord.js';
import fs from 'fs';

import { TOKEN, OWNER_ID, PREFIX } from './config';
import { Command, Modules } from './modules/types';
import * as vars from './modules/vars';
import * as utils from './modules/utils';
import * as db from './modules/db';


const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES] });
client.login(TOKEN);


const commands: Command[] = [];
const commandFiles = fs.readdirSync("./commands").filter(file => file.endsWith(".ts"));
for (const file of commandFiles) {
	const command = require(`./commands/${file}`);
	commands.push(command);
}


let commandCooldown: Snowflake[] = [];
let currencyCooldown: Snowflake[] = [];


client.on('ready', async () => {
	if (!client.user) return;

	client.user.setPresence({ activities: [{ name: `${PREFIX}help`, type: "LISTENING" }] });

	await utils.emojis.init(client);
	await db.connect();
	vars.Commands.init(commands);

	console.log(`Logged in as ${client.user.tag}!`);
});


client.on('messageCreate', async (message: Message) => {
	if (!message.member) return;
	if (!client.user) return;
	if (message.author.bot) return;

	//check currency cooldown
	if (!currencyCooldown.includes(message.author.id)) {
		const userHandler = new db.UserHandler(message.author.id, message.author);

		const gained = utils.randBetween(5, 8);
		await userHandler.currency_add(gained).update();
		
		currencyCooldown.push(message.author.id);
		setTimeout(() => {
			currencyCooldown.splice(currencyCooldown.indexOf(message.author.id));
		}, vars.currencyCooldownDuration);
	}

	// ### COMMANDS ### 

	// separate message content into arguments
	let args: string[];
	if (message.content.startsWith(`<@${client.user.id}>`) || message.content.startsWith(`<@!${client.user.id}>`)) {
		args = message.content.trim().split(/ +/g).slice(1);
	} else if (message.content.trim().slice(0, PREFIX.length) === PREFIX) {
		args = message.content.slice(PREFIX.length).trim().split(/ +/g);
	} else {
		return;
	}

	// find command name
	let commandName = (args.shift() ?? "").toLowerCase();
	if (!commandName) return;

	// eval command
	if (commandName === "eval" && message.author.id === OWNER_ID) {
		let evalResult;

		try {
			evalResult = await eval("(async () => {" + args.join(" ") + "})()");
		} catch (err) {
			evalResult = `\`\`\`${err.message}\`\`\``;
		}

		message.channel.send(evalResult.toString());
		return;
	}

	// find command
	const command = commands.find(c => c.name === commandName || c.aliases.includes(commandName));
	if (!command) return;

	if (utils.accessLevel(message.member) < command.access) return;

	// check command cooldown
	if (commandCooldown.includes(message.author.id)) {
		message.channel.send({
			embeds: [utils.embed({ error: `You need to wait ${vars.commandCooldownDuration / 1000} seconds between each command` })]
		});
		return;
	}

	// add to cooldown
	commandCooldown.push(message.author.id);
	setTimeout(() => {
		commandCooldown.splice(commandCooldown.indexOf(message.author.id));
	}, vars.commandCooldownDuration);


	try {
		command.execute(message, args, PREFIX);
	} catch (error) {
		message.channel.send({
			embeds: [utils.embed({
				error:
					"There was an error trying to execute that command\n" +
					"Contact Swagnemite#9374 if you keep getting this error"
			})]
		});
	}
});