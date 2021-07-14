import { UserHandler } from "../modules/db";
import { gifts } from "../modules/vars";
import { CURRENCY } from "../config";
import { embed, displayNumber, findUserID } from "../modules/utils";
import { Command } from "../modules/types";
import { GuildMember, Message, Snowflake, User } from "discord.js";

async function execute(message: Message, args: string[], prefix: string): Promise<any> {
	if (!message.guild) return;

	const targetUserID: Snowflake | null = findUserID(args[0] ?? "");
	
	if (targetUserID === null) {
		return message.channel.send({
			embeds: [embed({ error: "You need to mention someone" })]
		});
	}

	if (targetUserID === message.author.id) {
		return message.channel.send({
			embeds: [embed({ error: "You can't be *that* narcissistic..." })]
		});
	}

	const targetUser: User | undefined = message.client.users.cache.get(targetUserID);

	if (targetUser === undefined) {
		return message.channel.send({
			embeds: [embed({ error: "You need to mention someone" })]
		});
	}

	const targetMember: GuildMember | null = message.guild.members.resolve(targetUser);

	if (targetMember === null) {
		return message.channel.send({
			embeds: [embed({ error: "You need to mention someone from this server" })]
		});
	}

	const cost: number = parseInt(args[1]);

	if (isNaN(cost) || cost < 10) {
		return message.channel.send({
			embeds: [embed({ error: "You need to enter a valid amount" })]
		});
	}

	const userHandler = new UserHandler(message.author.id, message.author);
	const userData = await userHandler.fetch();

	if (!userData.currency || userData.currency < cost) {
		return message.channel.send({
			embeds: [embed({ error: "You are too poor for that" })]
		});
	}

	const targetHandler = new UserHandler(targetUserID, targetUser);
	const targetData = await targetHandler.fetch();
	
	const value = (targetData.affection && targetData.affection.id == message.author.id) ?  cost * 9 / 10 : cost * 4 / 5;

	targetHandler
		.currency_add(Math.floor(value))
		.update();
	
	userHandler
		.currency_sub(cost)
		.update();
	
	message.channel.send({
		embeds: [embed({
			success: `**${targetMember.displayName}** received **${displayNumber(Math.floor(Math.floor(value)), CURRENCY)}** from you`
		})]
	});
}

module.exports = {
	name: "give",
	aliases: [],
	usage: "[@user] [amount]",
	description: 
		"Give a user some of your currency (min 10), paying some tax\n" +
		"Tax amount is 20% normally, 10% if the user is affectionate towards you",
	module: "Economy",
	access: 0,
	premium: false,
	guildOnly: true,
	execute
} as Command;