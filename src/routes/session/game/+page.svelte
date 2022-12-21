<script lang='ts'>
	import { PlayerList } from '$lib/types/PlayerList';
	import { User, type UserList } from '$lib/types/User';
	import { onMount } from 'svelte';
	import { SessionStore, SocketStore, UserStore } from '../../../stores';
	import { Session } from '$lib/types/Session';
	import { goto } from '$app/navigation';
	import { connectToSocket } from '$lib/socket/socket-client';
	import Spinner from '$lib/components/Spinner.svelte';
	
	let users: UserList = [];
	let playerList: PlayerList = new PlayerList().subscribe(players => users = players);
	
	let sessionGetPromise: Promise<Session>;
	let userGetPromise: Promise<User>;
	
	
	onMount(async () => {
			if (!$SessionStore) {
				sessionGetPromise = Session.fetchSession();
				
				sessionGetPromise
					.then((s: Session) => {
						$SessionStore = s;
						if (!s.started)
							goto('/session');
					})
					.catch(() => goto('/'));
			}
			
			if (!$UserStore) {
				userGetPromise = User.fetch();
				$UserStore = await userGetPromise;
			}
			
			try {
				if (!$SocketStore?.connected)
					$SocketStore = await connectToSocket($UserStore?.socketConnection);
				playerList.subscribeToSocket($SocketStore);
			} catch {
				await goto('/');
			}
			
			playerList.fetch();
		}
	);
	
	let codeIsCopied = false;
	const copySessionCode = () => {
		if (!$SessionStore?.code) return;
		
		navigator.clipboard.writeText($SessionStore.code);
		codeIsCopied = true;
		setTimeout(() => {
			codeIsCopied = false;
		}, 1500);
	};
</script>

<div>
	<div class='text-center bg-primary text-white p-2 display-2 font-monospace text-uppercase'
			 on:click={copySessionCode}
			 role='button' tabindex='0'>
		{#await sessionGetPromise}
			<Spinner promise={sessionGetPromise} />
		{:then _}
			{#if !$SessionStore}
				<Spinner class='spinner-border-fix' />
			{:else}
				{$SessionStore?.code}
			{/if}
		{/await}
	</div>
	<div class='p-1 pb-2 text-center fst-italic bg-light small'>
		(click to copy)
		{#if codeIsCopied}
			copied!
		{/if}
	</div>
</div>

{#await userGetPromise}
	Loading...
	<Spinner promise={userGetPromise} />
{:then _}
	<table class='table'>
		<thead>
			<tr>
				<th class='text-center'>Host</th>
				<th class='text-center' colspan='2'>Name</th>
				<th class='text-center'>Money</th>
				{#if $UserStore?.isHost}
					<th class='text-center'>Kick</th>
				{/if}
			</tr>
		</thead>
		<tbody>
			{#each users as player}
				<tr class='{player.id === $UserStore?.id ? "table-active" : ""}'>
					<td class='text-center'>
						{#if player.isHost}
							<svg width='2rem' fill='none' stroke='currentColor' viewBox='0 0 24 24'
									 xmlns='http://www.w3.org/2000/svg'>
								<path stroke-linecap='round' stroke-linejoin='round' stroke-width='2'
											d='M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z'></path>
							</svg>
						{/if}
					</td>
					<td>
						<div class='connection-circle rounded-circle bg-success'
								 class:bg-danger={!player.socketConnection}>
							&nbsp;
						</div>
					</td>
					<td>{player.name}</td>
					<td>&dollar; {player.money}</td>
					{#if $UserStore?.isHost}
						<td>
							{#if player.id !== $UserStore?.id}
								<button class='btn btn-outline-danger btn-sm' on:click={async ()=>{
								playerList.players = await player.kick();
							}}>X
								</button>
							{/if}
						</td>
					{/if}
				</tr>
			{/each}
		</tbody>
	</table>
{/await}

<div>
	<div>
		<button class='btn btn-danger w-100' on:click={async () => {
							if(!$SessionStore || !confirm('Are you sure, you want to leave this session?')) return;
							await $SessionStore?.leave();
							goto("/");
						}} type='button'>
			
			{#if $UserStore?.isHost}
				Delete Session
			{:else}
				Leave
			{/if}
		</button>
	</div>
</div>

<style lang='scss'>
	.connection-circle {
		$wh: 1rem;
		
		width: $wh;
		height: $wh;
	}
	
	:global(.spinner-border-fix) {
		border-width: .1em;
	}
</style>
