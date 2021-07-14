import { UserHandler } from "../modules/db";
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

	// @ts-ignore
	const targetMember: GuildMember | null = message.guild.members.resolve(targetUser);

	if (targetMember === null) {
		return message.channel.send({
			embeds: [embed({ error: "You need to mention someone from this server" })]
		});
	}

	const userHandler = new UserHandler(message.author.id, message.author);
	const userData = await userHandler.fetch();

	if (!userData.currency) {
		return message.channel.send({
			embeds: [embed({ error: "You are too poor for that waifu" })]
		});
	}

	const userWaifus = await userHandler.find_waifus();

	if (userData.waifulimit ?? 5 <= userWaifus.length) {
		return message.channel.send({
			embeds: [embed({ error: "Your harem is too full, increase your waifu limit" })]
		});
	}

	const targetHandler = new UserHandler(targetUserID, targetUser);
	const targetData = await targetHandler.fetch();

	if (targetData.owner) {
		if (targetData.owner.id == message.author.id) {
			return message.channel.send({
				embeds: [embed({ error: "That user is already your waifu. How thirsty are you..." })]
			});
		}

		if (targetData.owner.date < Date.now() - 24 * 60 * 60 * 1000) {
			return message.channel.send({
				embeds: [embed({ error: "That waifu was claimed less than a day ago, wait for your turn" })]
			});
		}
	}

	let cost: number = 100;
	if (targetData.value) {
		if (targetData.affection && targetData.affection.id == message.author.id) {
			cost = Math.ceil(targetData.value / 2);
		} else {
			cost = targetData.value;
		}
	} else {
		if (targetData.affection && targetData.affection.id == message.author.id) {
			cost = 50;
		} else {
			cost = 100;
		}
	}

	if (userData.currency < cost) {
		return message.channel.send({
			embeds: [embed({ error: "You are too poor for that waifu" })]
		});
	}

	targetHandler
		.owner_set(message.author.id)
		.value_add(cost)
		.update();
	
	userHandler
		.currency_sub(cost)
		.update();
	
	// @ts-ignore
	if (targetUserID == message.client.user.id) {
		message.channel.send({
			embeds: [embed({ success: "I-I have a new m-master..? Please take care of me!" })]
		});
	} else {
		message.channel.send({
			embeds: [embed({ success: `You claimed **${targetMember.displayName}** as your waifu for **${displayNumber(cost, CURRENCY)}**` })]
		});
	}
}

module.exports = {
	name: "claim",
	aliases: [],
	usage: "[@user]",
	description: 
		"Claim another user as your waifu\n" +
		"You only need to pay half their value if they are affectionate towards you\n" +
		"The amount you spend will be added to your waifu's value\n",
	module: "Waifus",
	access: 0,
	premium: false,
	guildOnly: true,
	execute
} as Command;