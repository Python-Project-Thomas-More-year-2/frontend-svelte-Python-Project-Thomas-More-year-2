import { api } from '../index';
import type { AxiosResponse } from 'axios';

export const getTransactionsToPay = async (): Promise<ITransaction[]> => {
	return (await api.get<ITransaction[]>('/session/game/transactions/payer')).data;
};

export const getTransactionsSender = async (): Promise<ITransaction[]> => {
	return (await api.get<ITransaction[]>('/session/game/transactions/sender')).data;
};

export const payForTransaction = async ({ id }: ITransaction): Promise<void> => {
	await api.put<never, AxiosResponse<Record<string, never>>, { transaction: { id: number } }>('/session/game/pay-rent', { transaction: { id } });
};

export interface ITransaction {
	id: number,
	request_payer_id: number,
	request_sender_id: number | null,
	amount: number,


}
