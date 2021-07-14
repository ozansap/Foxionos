import { Message, Snowflake } from 'discord.js';

export enum Modules {
	ADMIN = "Admin",
	WAIFUS = "Waifus",
	ECONOMY = "Economy",
	MISC = "Misc",
}

export interface Command {
	name: string;
	aliases: string[];
	usage: string;
	description: string;
	module: Modules;
	rules?: string;
	access: number;
	premium: boolean;
	guildOnly: boolean;
	execute(message: Message, args: string[], prefix: string): any;
}

export interface EmbedOptions {
	description?: string;
	title?: string;
	author?: string;
	footer?: string;
	error?: string;
	success?: string;
	image?: string;
	thumbnail?: string | null;
	timestamp?: number;
	color?: number;
	fields?: [ name: string, value: string, inline: boolean ][];
}

export interface UserData {
	_id?: string;
	
	tag?: string;
	last?: number;
	title?: string;
	daily?: number;

	currency?: number;
	value?: number;
	waifulimit?: number;
	gifts?: {
		[giftName: string]: number;
	}
	owner?: {
		id: Snowflake;
		date: number;
	}
	affection?: {
		id: Snowflake;
		date: number;
	}
}