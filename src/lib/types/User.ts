import { api } from '../../axios';
import type { AxiosResponse } from 'axios';

export class User {
	id: number;
	session_id: number;
	money: number;
	name: string;
	isHost: boolean;
	socketConnection?: string;

	constructor(user: IUser) {
		this.id = user.id;
		this.session_id = user.session_id;
		this.money = user.money;
		this.name = user.name;
		this.isHost = user.isHost;
		this.socketConnection = user.socketConnection;
	}

	public static async fetch(): Promise<User> {
		return new User((await api.get<{ user: IUser }>('/user')).data.user);
	}

	public async kick(): Promise<UserList> {
		return (await api.delete<never, AxiosResponse<IUser[]>, { user: { id: number } }>('/session/playerlist', { data: { user: { id: this.id } } })).data.map(u => new User(u));
	}

	public async passesGo(): Promise<void> {
		await api.post<never, AxiosResponse<Record<string, never>>, { user: { id: number } }>('/session/game/go', {
			user: {
				id: this.id
			}
		});
	}

	public async sendMoney(amount: number): Promise<void> {
		await api.post<never, AxiosResponse<Record<string, never>>, { user: { id: number }, transaction: { amount: number } }>('/session/game/bank-money', {
			user: { id: this.id },
			transaction: { amount }
		});
	}
}

export interface IUser {
	id: number,
	session_id: number,
	money: number,
	name: string,
	isHost: boolean,
	socketConnection?: string,
}

export type UserList = User[];
