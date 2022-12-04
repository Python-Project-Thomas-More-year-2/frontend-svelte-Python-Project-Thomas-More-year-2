import { type Writable, writable } from 'svelte/store';
import type { IUser } from '$lib/types/User';
import type { Session } from '$lib/types/Session';
import type { Socket } from 'socket.io-client';

export const UserStore: Writable<IUser | null> = writable(null);
export const SessionStore: Writable<Session | null> = writable(null);

export const SocketStore: Writable<Socket | null> = writable(null);
