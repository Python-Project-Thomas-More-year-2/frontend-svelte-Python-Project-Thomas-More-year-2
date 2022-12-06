import { api } from '../../axios';
import type { AxiosResponse } from 'axios';
import { type IUser, User } from './User';

export class Session implements ISession {
	id: number;
	code: string;
	startCapital: number;
	seeOthersBalance: boolean;
	goReward: number;
	freeParkingMoney: number;
	freeParking: boolean;

	constructor(session: ISession) {
		this.id = session.id;
		this.code = session.code;
		this.startCapital = session.startCapital;
		this.seeOthersBalance = session.seeOthersBalance;
		this.goReward = session.goReward;
		this.freeParkingMoney = session.freeParkingMoney;
		this.freeParking = session.freeParking;
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

	public async update(props: ISessionUpdate): Promise<this | never> {
		const res = await api.patch<never, AxiosResponse<{ session: ISession }>, { session: ISessionUpdate }>('/session', { session: props });
		return this.setProps(res.data.session);
	}

	public setProps(props: Partial<ISession>): this {
		const a: (keyof ISession)[] = [
			'id',
			'code',
			'startCapital',
			'seeOthersBalance',
			'goReward',
			'freeParkingMoney',
			'freeParking'
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
	seeOthersBalance: boolean;
	goReward: number;
	freeParkingMoney: number;
	freeParking: boolean;
}

export type ISessionUpdate = Pick<ISession, 'startCapital' | 'goReward' | 'seeOthersBalance' | 'freeParking'>;
