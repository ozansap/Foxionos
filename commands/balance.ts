import { UserHandler } from "../modules/db";
import { CURRENCY } from "../config";
import { embed, displayNumber, findUserID } from "../modules/utils";
import { Command, UserData } from "../modules/types";
import { Message, Snowflake, User } from "discord.js";

async function execute(message: Message, args: string[], prefix: string) {
	const userID: Snowflake | null = findUserID(args[0] ?? "");
	
	const user: User = (userID === null) ? message.author : message.client.users.cache.get(userID) ?? message.author;

	const userHandler = new UserHandler(user.id);
	const userData: UserData = await userHandler.fetch() ?? {
		tag: user.tag,
	} as UserData;

	const currency = userData.currency ?? 0;

	// @ts-ignore
	const displayName = message.guild ? message.guild.members.resolve(user).displayName : message.author.username.slice(0, -5);

	message.channel.send({
		embeds: [	embed({ description: `💰 **${displayName}** has **${displayNumber(currency, CURRENCY)}**` })]
	})
}

module.exports = {
	name: "balance",
	aliases: ["bal", "b"],
	usage: "[@user (optional)]",
	description: "See your or someone else's balance",
	module: "Economy",
	access: 0,
	premium: false,
	guildOnly: false,
	execute
} as Command;