import { io, Socket } from 'socket.io-client';
import type { User } from '$lib/types/User';


export const connectToSocket = (socketConnection: User['socketConnection']): Promise<Socket> => new Promise<Socket>((resolve, reject) => {

	const socket = io('http://127.0.0.1:5000'); //TODO Export to config file

	if (!socketConnection) return reject('Can not connect to socket {user.socketConnection} is empty');

	socket.on('auth-res', args => {
		if ('message' in args) {
			console.log('Connected successfully to the socket');
			resolve(socket);
		} else {
			reject('error' in args ? args.error : args);
		}
	});

	// Send authentication-data
	socket.emit('auth', { socketConnection });

	socket.connect();
});
