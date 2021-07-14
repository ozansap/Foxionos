import { UserHandler } from "../modules/db";
import { embed, findUserID } from "../modules/utils";
import { Command } from "../modules/types";
import { GuildMember, Message, Snowflake, User } from "discord.js";

async function execute(message: Message, args: string[], prefix: string): Promise<any> {
	if (!message.guild) return;
	
	if (args[0] === "unset") {
		const userHandler = new UserHandler(message.author.id, message.author);
		const userData = await userHandler.fetch();

		if (!userData.affection) {
			return message.channel.send({
				embeds: [embed({ error: "You don't have an affection towards anyone" })]
			});
		}

		if (userData.affection.date > Date.now() - 24 * 60 * 60 * 1000) {
			return message.channel.send({
				embeds: [embed({ error: "You have to wait a day before you can change your affection again" })]
			});
		}

		userHandler
			.affection_unset()
			.update();
		
		return message.channel.send({
			embeds: [embed({ success: `It's a lonely world we live in, you only make it harder for yourself...` })]
		});
	}

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


	if (userData.affection) {
		if (userData.affection.id == targetUserID) {
			return message.channel.send({
				embeds: [embed({ error: "You are already affectionate towards that user" })]
			});
		}

		if (userData.affection.date > Date.now() - 24 * 60 * 60 * 1000) {
			return message.channel.send({
				embeds: [embed({ error: "You have to wait a day before you can change your affection again" })]
			});
		}
	}
	
	userHandler
		.affection_set(targetUserID)
		.update();
	
	// @ts-ignore
	if (targetUserID == message.client.user.id) {
		message.channel.send({
			embeds: [embed({ success: "I'm flattered >/////<" })]
		});
	} else {
		message.channel.send({
			embeds: [embed({ success: `You openly admitted to liking **${targetMember.displayName}**, unbelievable...` })]
		});
	}
}

module.exports = {
	name: "affection",
	aliases: [],
	usage: "[@user]/unset",
	description: 
		"Show your affection towards a user\n" +
		"Gifts coming from them will add more value to you\n" +
		"They will only need to pay half your value to claim you",
	module: "Waifus",
	access: 0,
	premium: false,
	guildOnly: true,
	execute
} as Command;