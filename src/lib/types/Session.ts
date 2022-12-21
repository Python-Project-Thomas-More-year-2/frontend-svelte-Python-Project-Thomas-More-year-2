import { api } from '../../axios';
import type { AxiosResponse } from 'axios';
import { type IUser, User, type UserList } from './User';

export class Session implements ISession {
	id: number;
	code: string;
	startCapital: number;
	goReward: number;
	started: boolean;

	constructor(session: ISession) {
		this.id = session.id;
		this.code = session.code;
		this.startCapital = session.startCapital;
		this.goReward = session.goReward;
		this.started = session.started;
	}

	public static async createSession(username: string): Promise<[Session, User]> {
		const res = (await api.post<never, AxiosResponse<{ session: ISession, user: IUser, }>>('/session', { user: { name: username } })).data;
		return [new Session(res.session), new User(res.user)];
	}

	public static async fetchSession(): Promise<Session> {
		return new Session((await api.get<{ session: ISession }>('/session')).data.session);
	}

	public static async join(sessionCode: string, username: string): Promise<[Session, User]> {
		const res = (
			await api
				.post<never, AxiosResponse<{ session: ISession, user: IUser, }>>(
					'/session/join',
					{
						session: { code: sessionCode },
						user: { name: username }
					})).data;

		return [new Session(res.session), new User(res.user)];
	}

	public static async getConnectedUsers(): Promise<UserList> {
		return (await api.get<IUser[]>('/session/playerlist')).data.map(u => new User(u));
	}

	public async leave(): Promise<void> {
		await api.delete('/session');
	}

	public async start(): Promise<void> {
		await api.post('/session/start');
	}

	public async update(props: ISessionUpdate): Promise<this | never> {
		const res = await api.patch<never, AxiosResponse<{ session: ISession }>, { session: ISessionUpdate }>('/session', { session: props });
		return this.setProps(res.data.session);
	}

	public async fetch(): Promise<this | never> {
		return this.setProps((await api.get<{ session: ISession }>('/session')).data.session);
	}

	public setProps(props: Partial<ISession>): this {
		const a: (keyof ISession)[] = [
			'id',
			'code',
			'startCapital',
			'goReward'
		];
		for (const key of a) {
			if (typeof props[key] !== 'undefined' && props[key] !== null)
				//eslint-disable-next-line @typescript-eslint/ban-ts-comment
				//@ts-ignore
				this[key] = props[key];
		}
		return this;
	}
}

export interface ISession {
	id: number;
	code: string;
	startCapital: number;
	goReward: number;
	started: boolean;
}

export type ISessionUpdate = Pick<ISession, 'startCapital' | 'goReward'>;
