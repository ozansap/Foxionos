import { Snowflake, User } from "discord.js";
import { MONGO_URI, MONGO_DB_NAME } from '../config';
import { UserData } from './types';
import { MongoClient } from 'mongodb';
import { defaultValue } from "./vars";

const mongoClient = new MongoClient(MONGO_URI, { useNewUrlParser: true , useUnifiedTopology: true });

let users: any;
let general: any;

// ########## EXPORTS ##########

export async function connect():Promise<void> {
	await mongoClient.connect();
	const database = mongoClient.db(MONGO_DB_NAME);

	users = database.collection("users");
	general = database.collection("general");
}

export class UserHandler {
	data: UserData;
	stages: any[];
	user: User | null;
	userID: Snowflake;

	constructor(userID: Snowflake, user?:User) {
		this.data = {} as UserData;
		this.stages = [];
		this.user = user ?? null;
		this.userID = userID;
	}

	async fetch(): Promise<UserData> {
		this.data = await users.findOne({ _id: this.userID }) ?? {};
		return this.data;
	}

	async update(returnOriginal: boolean = false): Promise<UserData> {
		const result = await users.findOneAndUpdate({ _id: this.userID }, [...this.stages, {
			$set: {
				tag: (this.user) ? this.user.tag : "$tag",
				last: Date.now()
			}
		}], { returnDocument: returnOriginal ? "before" : "after", upsert: true });
		this.data = result.value as UserData;
		return this.data;
	}

	async find_waifu(targetTag: string): Promise<UserData> {
		const waifu: UserData = await users.findOne({ "owner.id": this.userID, tag: targetTag });
		return waifu;
	}

	async find_waifus(): Promise<UserData[]> {
		const cursor = await users.find({ "owner.id": this.userID }).sort({ "owner.date": 1 });
		let waifus: UserData[] = [];

		await cursor.forEach((waifuData: UserData) => {
			waifus.push(waifuData);
		});

		cursor.close();

		return waifus;
	}

	currency_add(amount: number): UserHandler {
		this.stages.push({
			$set: {
				currency: {
					$cond: {
						if: { $eq: [{ $type: "$currency" }, "missing"] },
						then: amount,
						else: { $add: ["$currency", amount] }
					}
				}
			}
		});
		return this;
	}

	currency_sub(amount: number): UserHandler {
		this.stages.push({
			$set: {
				currency: {
					$subtract: ["$currency", amount]
				}
			}
		})
		return this;
	}

	currency_set(amount: number): UserHandler {
		this.stages.push({
			$set: {
				currency: amount
			}
		});
		return this;
	}

	affection_set(targetUserID: Snowflake): UserHandler  {
		this.stages.push({
			$set: {
				"affection.id": targetUserID,
				"affection.date": Date.now()
			}
		})
		return this;
	}

	affection_unset(): UserHandler {
		this.stages.push({
			$unset: "affection"
		})
		return this;
	}

	owner_set(targetUserID: Snowflake): UserHandler {
		this.stages.push({
			$set: {
				"owner.id": targetUserID,
				"owner.date": Date.now(),
			}
		})
		return this;
	}

	owner_unset(): UserHandler {
		this.stages.push({
			$unset: "owner"
		})
		return this;
	}

	gifts_add(giftName: string): UserHandler {
		this.stages.push({
			$set: {
				[`gifts.${giftName}`]: {
					$cond: {
						if: { $eq: [{ $type: `$gifts.${giftName}` }, "missing"] },
						then: 1,
						else: { $add: [`$gifts.${giftName}`, 1] }
					}
				}
			}
		})
		return this;
	}

	value_add(amount: number): UserHandler {
		this.stages.push({
			$set: {
				value: {
					$cond: {
						if: { $eq: [{ $type: "$value" }, "missing"] },
						then: 100 + amount,
						else: { $add: ["$value", amount] }
					}
				}
			}
		})
		return this;
	}

	waifulimit_add(): UserHandler {
		this.stages.push({
			$set: {
				waifulimit: {
					$cond: {
						if: { $eq: [{ $type: "$waifulimit" }, "missing"] },
						then: 6,
						else: { $add: ["$waifulimit", 1] }
					}
				}
			}
		})
		return this;
	}

	title_set(title: string): UserHandler {
		this.stages.push({
			$set: {
				"title": title
			}
		})
		return this;
	}

	title_unset(): UserHandler {
		this.stages.push({
			$unset: "title"
		})
		return this;
	}

	daily_claim(): UserHandler {
		this.stages.push({
			$set: {
				"daily": Date.now()
			}
		})
		return this;
	}
}

export class Leaderboard {
	type: keyof UserData;
	order: "asc" | "desc";
	limit: number;
	authorIndex: number;
	authorValue: number;
	data: UserData[];

	constructor(type: keyof UserData, order: "asc" | "desc" = "desc", limit: number = 10) {
		this.type = type;
		this.order = order;
		this.limit = limit;
		this.authorIndex = 0;
		this.authorValue = defaultValue[type as keyof typeof defaultValue];
		this.data = [];
	}

	async fetch(): Promise<UserData[]> {
		const cursor = users.find().sort({ [this.type]: this.order === "desc" ? -1 : 1 }).limit(this.limit);

		let data: UserData[] = [];
		await cursor.forEach((userData: UserData) => {
			if (userData[this.type] === undefined) return;
			data.push(userData);
		});
		cursor.close();

		this.data = data;
		return this.data;
	}

	async findAuthor(userID: Snowflake): Promise<[number, number]> {
		const userHandler = new UserHandler(userID);
		const userData = await userHandler.fetch();

		if (userData[this.type] === undefined) return [this.authorIndex, this.authorValue];

		const cursor = users.find({ [this.type]: { $gt: userData[this.type] } });
		const cursorCount = await cursor.count();
		cursor.close();

		this.authorIndex = cursorCount + 1;
		// @ts-ignore
		this.authorValue = userData[this.type];
		return [this.authorIndex, this.authorValue];
	}
}