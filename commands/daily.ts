import { embed, displayNumber, sameDay, randBetween } from "../modules/utils";
import { Command } from "../modules/types";
import { Message} from "discord.js";
import { UserHandler } from "../modules/db";
import { CURRENCY } from "../config";

async function execute(message: Message, args: string[], prefix: string): Promise<any> {
	const userHandler = new UserHandler(message.author.id, message.author);
	const userData = await userHandler.fetch();

	if (userData.daily && sameDay(userData.daily, Date.now())) {
		return message.channel.send({
			embeds: [embed({ error: "You already claimed your daily today" })]
		});
	}

	const amount = randBetween(30, 50);

	userHandler
		.daily_claim()
		.currency_add(amount)
		.update();
	
	return message.channel.send({
		embeds: [embed({ success: `You claimed **${displayNumber(amount, CURRENCY)}** from daily` })]
	});
}


module.exports = {
	name: "daily",
	aliases: ["d"],
	usage: "",
	description: "Claim daily currency",
	module: "Economy",
	access: 0,
	premium: false,
	guildOnly: false,
	execute
} as Command;