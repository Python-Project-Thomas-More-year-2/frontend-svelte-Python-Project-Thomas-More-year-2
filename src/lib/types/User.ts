import { api } from '../../axios';

export class User {
	id: number;
	session_id: number;
	money: number;
	name: string;
	isHost: boolean;
	isBank: boolean;
	socketConnection?: string;

	constructor(user: IUser) {
		this.id = user.id;
		this.session_id = user.session_id;
		this.money = user.money;
		this.name = user.name;
		this.isHost = user.isHost;
		this.isBank = user.isBank;
		this.socketConnection = user.socketConnection;
	}

	public static async fetch(): Promise<User> {
		return new User((await api.get<{ user: IUser }>('/user')).data.user);
	}
}

export interface IUser {
	id: number,
	session_id: number,
	money: number,
	name: string,
	isHost: boolean,
	isBank: boolean,
	socketConnection?: string,
}
