import { UserHandler } from "../modules/db";
import { CURRENCY } from "../config";
import { gifts } from "../modules/vars";
import { embed, displayNumber, findUserID, date } from "../modules/utils";
import { Command, EmbedOptions, UserData } from "../modules/types";
import { Message, Snowflake, User } from "discord.js";

async function execute(message: Message, args: string[], prefix: string) {
	const userID: Snowflake | null = findUserID(args[0] ?? "");
	
	const user: User = (userID === null) ? message.author : message.client.users.cache.get(userID) ?? message.author;

	const userHandler = new UserHandler(user.id);
	const userData: UserData = await userHandler.fetch();

	let embedOptions: EmbedOptions = {
		fields: [],
		author: userData.tag ?? user.tag,
		thumbnail: user.avatarURL({ dynamic: true, size: 128 }),
		description: (
			`💰 Currency: **${displayNumber(userData.currency || 0, CURRENCY)}**\n` +
			`💵 Value: **${displayNumber(userData.value || 100, CURRENCY)}**\n\n`
		)
	}

	if (userData.title) {
		embedOptions.title = `「${userData.title}」`;
	}

	if (userData.owner) {
		const ownerData = await new UserHandler(userData.owner.id).fetch();
		const ownerTag = ownerData.tag ?? (await message.client.users.fetch(userData.owner.id)).tag;
		embedOptions.description += `🔒 Claimed By: **${ownerTag.slice(0, -5)}** (${date(userData.owner.date)})\n`;
	}

	if (userData.affection) {
		const affectionData = await new UserHandler(userData.affection.id).fetch();
		const affectionTag = affectionData.tag ?? (await message.client.users.fetch(userData.affection.id)).tag;
		embedOptions.description += `♥️ Likes: **${affectionTag.slice(0, -5)}** (${date(userData.affection.date)})\n\n`;
	}

	const waifus = await userHandler.find_waifus();
	if (waifus.length) {
		let waifuField = "💒 Waifus:";

		for (const waifu of waifus) {
			if (!waifu.owner || !waifu.tag) throw new Error("Something went horribly wrong");
			waifuField += `\n**${waifu.tag.slice(0, -5)}** (${date(waifu.owner.date)})`;
		}

		if (embedOptions.fields !== undefined) embedOptions.fields.push(["\u200b", waifuField, true]);
	}

	if (userData.gifts) {
		let giftField = "🎁 Gifts:";
		let giftNames: string[] = [];

		for (const giftName in gifts) {
			if (!(giftName in userData.gifts)) continue;
			giftNames.push(giftName);
		}

		giftNames = giftNames.slice(-(userData.waifulimit ?? 5)).reverse();

		for (const giftName of giftNames) {
			const giftNameKey = giftName as keyof typeof gifts;
			giftField += `\n${gifts[giftNameKey].emoji} x**${userData.gifts[giftNameKey]}**`;
		}

		if (embedOptions.fields !== undefined) embedOptions.fields.push(["\u200b", giftField, true]);
	}

	message.channel.send({
		embeds: [embed(embedOptions)]
	});
}

module.exports = {
	name: "profile",
	aliases: ["p"],
	usage: "[@user (optional)]",
	description: "See your or someone else's profile",
	module: "Waifus",
	access: 0,
	premium: false,
	guildOnly: false,
	execute
} as Command;