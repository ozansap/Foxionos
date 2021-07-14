import { embed, displayNumber } from "../modules/utils";
import { Command } from "../modules/types";
import { Message} from "discord.js";
import { UserHandler } from "../modules/db";
import { CURRENCY } from "../config";

async function execute(message: Message, args: string[], prefix: string): Promise<any> {
	const userHandler = new UserHandler(message.author.id, message.author);
	const userData = await userHandler.fetch();

	const currentWaifulimit = userData.waifulimit ?? 5;
	const cost = currentWaifulimit * 100;

	if (args[0] === undefined || args[0].toLowerCase() !== "yes") {
		return message.channel.send({
			embeds: [embed({ 
				description:
					`Your current waifu limit is **${currentWaifulimit}**\n` +
					`Increasing it will cost **${displayNumber(cost, CURRENCY)}**\n\n` +
					`If you are sure you want to increase your waifu limit, type:\n` +
					`\`${prefix}waifulimit yes\``
			})]
		});
	}

	if (!userData.currency || userData.currency < cost) {
		return message.channel.send({
			embeds: [embed({ error: "You are too poor for that" })]
		});
	}

	userHandler
		.waifulimit_add()
		.currency_sub(cost)
		.update();
	
	return message.channel.send({
		embeds: [embed({
			success:
				`You spent **${displayNumber(cost, CURRENCY)}** to increase your waifu limit to **${currentWaifulimit + 1}**`
		})]
	});
}


module.exports = {
	name: "waifulimit",
	aliases: [],
	usage: "yes",
	description:
		"Increase your waifu limit\n" +
		"Increasing costs (100 * current waifu limit)",
	module: "Waifus",
	access: 0,
	premium: false,
	guildOnly: false,
	execute
} as Command;