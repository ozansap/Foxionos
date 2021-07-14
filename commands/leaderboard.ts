import { Leaderboard } from "../modules/db";
import { CURRENCY } from "../config";
import { embed, displayNumber } from "../modules/utils";
import { Command, UserData } from "../modules/types";
import { Message } from "discord.js";

async function execute(message: Message, args: string[], prefix: string): Promise<any> {
	const inputType = (args[0] !== undefined) ? args[0].toLowerCase() : "";

	let type = "";
	let title = "";
	let unit = "";

	switch (inputType) {
		case "value":
		case "v":
			type = "value";
			title = "Leaderboard • Waifu Value";
			unit = CURRENCY;
			break;
		case "currency":
		case "c":
			type = "currency";
			title = "Leaderboard • Currency";
			unit = CURRENCY;
			break;
		default:
			return message.channel.send({
				embeds: [embed({ error: "You need to enter a valid leaderboard type" })]
			});
	}

	const lb = new Leaderboard(type as keyof UserData);
	const lbData = await lb.fetch();
	const [authorIndex, authorValue] = await lb.findAuthor(message.author.id);

	let description = "";
	let index = 1;

	for (const data of lbData) {
		description += `\`${index++}.\` **${data.tag}** • ${displayNumber(data[type as keyof UserData] as number, unit)}\n`;
	}

	description += `\n\`${authorIndex}.\` **${message.author.tag}** • ${displayNumber(authorValue, unit)}`;

	return message.channel.send({
		embeds: [embed({ title, description })]
	});
}

module.exports = {
	name: "leaderboard",
	aliases: ["lb", "top"],
	usage: "currency/value",
	description: "See the top members in one of the categories",
	module: "Misc",
	access: 0,
	premium: false,
	guildOnly: false,
	execute
} as Command;