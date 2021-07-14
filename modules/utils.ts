import { Client, Emoji, GuildMember, Message, MessageEmbed, Snowflake } from 'discord.js';
import * as vars from './vars';
import { ADMIN_ROLE, OWNER_ID } from '../config';
import { Command, EmbedOptions } from './types';

// ########## EXPORTS ##########

export function parseDuration(duration: string): number {
	const separation: {[key: string]: number | undefined} = {
		"d": undefined,
		"h": undefined,
		"m": undefined,
		"s": undefined
	};

	duration = duration.toLowerCase();

	for (let i = 0; i < duration.length; i++) {
		if (isNaN(parseInt(duration[i])) && !(duration[i] in separation)) return 0;
		if (duration[i] in separation) {
			const value = parseInt(duration.split(duration[i])[0]);
			if (separation[duration[i]] === undefined && !isNaN(value) && i !== 0) {
				separation[duration[i]] = value;
				duration = duration.slice(i+1);
				i = -1;
			} else {
				return 0;
			}
		}
	}

	let result = 0;
	if (separation.d) result += separation.d * 1000 * 60 * 60 * 24;
	if (separation.h) result += separation.h * 1000 * 60 * 60;
	if (separation.m) result += separation.m * 1000 * 60;
	if (separation.s) result += separation.s * 1000;

	return Math.ceil(result / 1000) * 1000;
}

export function displayDuration(duration: number, precision: number = 4): string {
	if (duration < 1) duration = 1;
	let result = "";
	let precisionLeft = precision;

	const separation: number[] = [0, 0, 0, 0];
	const durationNum: number[] = [(1000 * 60 * 60 * 24), (1000 * 60 * 60), (1000 * 60), (1000)];
	const durationStr: string[] = ["day", "hour", "minute", "second"];

	for (let i = 0; i < 4; i++) {
		separation[i] = Math.floor(duration / durationNum[i]);
		duration -= separation[i] * durationNum[i];

		if (0 < separation[i]) {
			if (--precisionLeft < 0) {
				separation[i] = 0;
				separation[precision-1]++;
				break;
			}	
		}
	}

	for (let i = 0; i < 4; i++) {
		if (separation[i]) result += `, ${displayNumber(separation[i], durationStr[i])}`;
	}

	return result.slice(2);
}

export function displayNumber(number: number, unit: string = "", suffix: string = "s", cut: number = 0): string {
	let prefix = "";
	if (number < 0) {
		number *= -1;
		prefix = "-";
	}

	let numberStr = number.toString();

	for (let i = 3; i < numberStr.length; i += 4) {
		numberStr = `${numberStr.slice(0, numberStr.length - i)},${numberStr.slice(numberStr.length - i)}`;
	}

	if (unit) {
		unit = (number == 1) ? unit : `${unit.slice(0, unit.length - cut)}${suffix}`;
	}

	return `${prefix}${numberStr}${unit ? " " + unit : ""}`;
}

export function findUserID(arg: string, acceptID: boolean = false): Snowflake | null {
	if (arg === "") return null;
	if (!isNaN(parseInt(arg))) return (acceptID) ? arg as Snowflake : null;

	if (arg.startsWith('<@') && arg.endsWith('>')) {
		arg = arg.slice(2, -1)
		if (arg.startsWith('!')) {
			arg = arg.slice(1)
		}
		return arg as Snowflake;
	} else {
		return null;
	}
}

export function date(ms: number = Date.now()) {
	const date = new Date(ms);
	const dd = String(date.getDate()).padStart(2, '0');
	const mm = String(date.getMonth() + 1).padStart(2, '0');
	const yyyy = date.getFullYear();

	return dd + '/' + mm + '/' + yyyy;
}

export function accessLevel(member: GuildMember):number {
	if (member.id === OWNER_ID) return 3;
	if (member.roles.cache.has(ADMIN_ROLE as Snowflake)) return 2;
	if (member.permissions.has("MANAGE_GUILD")) return 1;
	return 0;
}

export class emojis {
	static collection: Emoji[] = [];

	static list: {[emoji: string]: Snowflake} = {
		coin1: "765961217600389140",
		coin2: "765961852680929280",
		coin3: "765961863678525490",
		coin4: "765961988466802718",
		coin5: "765962256412311584",
		coin6: "765962450885148682",
		error: "744576222276747265",
		success: "744576203590991906",
		card0: "757920897205141585",
		card1: "757920943128576021",
		card2: "744575578903937127",
		card3: "744575780322803822",
		card4: "744575825453776941",
		card5: "744575878633226321",
		card6: "744575930785202358",
		card7: "744575954705448960",
		card8: "744575972774248478",
		card9: "744575987324551299",
		card10: "744576002654470324",
		cardJ: "744576020472135780",
		cardQ: "744576045310541866",
		cardK: "744576061656006697",
		cardA: "744576079435399258",
		clubs: "744576135094075462",
		hearts: "744576118438494229",
		spades: "744576099106684970",
		diamonds: "744576152726667335",
		unknown: "744576177250762813"
	}

	static async init(client: Client): Promise<void> {
		let guildIDs: Snowflake[] = ["744545521871618148"];
		let guilds = guildIDs.map(async x => await client.guilds.fetch(x));

		for await (const guild of guilds) {
			emojis.collection = [...emojis.collection, ...guild.emojis.cache.values()];
		}
	}

	static get(emojiName: string): string {
		const emoji = emojis.collection.find((e: Emoji) => e.id == emojis.list[emojiName]);
		return (emoji ?? "").toString();	
	}
}

export function embed(options: EmbedOptions):MessageEmbed {
	let messageEmbed = new MessageEmbed();

	if (options.error) {
		messageEmbed.setDescription(emojis.get("error") + " " + options.error);
		messageEmbed.setColor(vars.colors.red);
	} else if (options.success) {
		messageEmbed.setDescription(emojis.get("success") + " " + options.success);
		messageEmbed.setColor(vars.colors.green);
	} else {
		messageEmbed.setColor(options.color ?? vars.colors.default);
		if (options.description) messageEmbed.setDescription(options.description);
	}

	if (options.fields && options.fields.length) {
		for (const field of options.fields) {
			messageEmbed.addField(field[0], field[1], field[2]);
		}
	}

	if (options.author) messageEmbed.setAuthor(options.author);
	if (options.title) messageEmbed.setTitle(options.title);
	if (options.footer) messageEmbed.setFooter(options.footer);
	if (options.image) messageEmbed.setImage(options.image);
	if (options.thumbnail) messageEmbed.setThumbnail(options.thumbnail);
	if (options.timestamp) messageEmbed.setTimestamp(options.timestamp);
	
	return messageEmbed;
}

export function commandHelp(command: Command, prefix: string): MessageEmbed {
	let description = command.description;

	description += `\n\n**Usage:** \`${prefix}${command.name} ${command.usage}\``;

	if (command.aliases.length > 0) {
		description += "\n**Aliases:** ";
		
		command.aliases.forEach(x => {
			description += `\`${x}\`, `;
		})

		description = description.slice(0, -2);
	}

	if (command.guildOnly) {
		description += "\n**Cannot be used in DMs**";
	}

	return embed({
		title: prefix + command.name,
		description,
		footer: `Module: ${command.module}`
	});
}

export function sameDay(n1: number, n2: number): boolean {
	const d1 = new Date(n1);
	const d2 = new Date(n2);

  return d1.getUTCFullYear() === d2.getUTCFullYear() &&
    d1.getUTCMonth() === d2.getUTCMonth() &&
    d1.getUTCDate() === d2.getUTCDate();
}

export function randBetween(min: number, max: number): number {
	return Math.floor(Math.random() * (max - min + 1) + min);
}