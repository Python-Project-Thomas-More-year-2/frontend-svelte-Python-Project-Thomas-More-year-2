import axios, { AxiosError } from 'axios';

export const api = axios.create({
	baseURL: 'http://127.0.0.1:5000', //TODO Export to config file
	withCredentials: true
});

export const apiGetErrorMessage = (error: AxiosError | Error): string => {
	if (axios.isAxiosError(error))
		return error.response?.data?.error || error.response?.data?.message || '';

	return error.message;
};
