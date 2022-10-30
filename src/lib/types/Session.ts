import { api } from '../../axios';
import type { AxiosResponse } from 'axios';
import { type IUser, User } from './User';

export class Session {
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
