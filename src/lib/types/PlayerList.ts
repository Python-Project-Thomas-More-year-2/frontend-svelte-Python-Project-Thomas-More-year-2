import type { User, UserList } from '$lib/types/User';
import { Session } from '$lib/types/Session';
import type { Socket } from 'socket.io-client';
import axios from 'axios';

export class PlayerList {
	private _players: User[] = [];
	private _callbacks: SubscribeCallback[] = [];

	constructor(players?: UserList) {
		if (players)
			this._players = players;
	}

	public get players(): User[] {
		return this._players;
	}

	public set players(users: User[]) {
		this._players = users;
		this._players.sort((a, b) => a.name < b.name ? -1 : 1);
		this.runCallbacks();
	}

	public subscribe(cb: SubscribeCallback): this {
		this._callbacks.push(cb);
		return this;
	}

	public set(users: UserList) {
		this.players = users;
	}

	public subscribeToSocket(socket: Socket): void {
		socket.on('user-connect', () => {
			console.log('user-connect');
			//noinspection JSIgnoredPromiseFromCall
			this.fetch();
		});

		socket.on('user-disconnect', () => {
			console.log('user-disconnect');
			//noinspection JSIgnoredPromiseFromCall
			this.fetch();
		});

		socket.on('user-balance-update', () => {
			console.log('user-balance-update');
			//noinspection JSIgnoredPromiseFromCall
			this.fetch();
		});
	}

	public async fetch() {
		try {
			this.players = await Session.getConnectedUsers();
			console.log('Refreshed Player List', this.players);
		} catch (e) {
			if (axios.isAxiosError(e)) {
				console.error('Refresh Player List', e.response?.data);
			} else throw e;
		}
	}

	public [Symbol.iterator]() {
		return this._players[Symbol.iterator];
	}

	private runCallbacks(): void {
		this._callbacks.forEach(cb => cb(this.players));
	}
}

export type SubscribeCallback = (players: UserList) => void
