import { gifts } from "../modules/vars";
import { embed, displayNumber } from "../modules/utils";
import { Command } from "../modules/types";
import { Message} from "discord.js";

async function execute(message: Message, args: string[], prefix: string): Promise<any> {
	let description = "";
	for (const giftName in gifts) {
		const giftNameKey = giftName as keyof typeof gifts;
		description += `${gifts[giftNameKey].emoji} • **${giftName}** • ${displayNumber(gifts[giftNameKey].cost)}\n`;
	}
	
	message.channel.send({
		embeds: [embed({
			title: "Gifts",
			description
		})]
	});
}

module.exports = {
	name: "gifts",
	aliases: [],
	usage: "",
	description: "See the list of all gifts you can buy",
	module: "Waifus",
	access: 0,
	premium: false,
	guildOnly: false,
	execute
} as Command;