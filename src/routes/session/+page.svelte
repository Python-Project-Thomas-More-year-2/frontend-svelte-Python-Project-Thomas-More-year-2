<!--suppress HtmlWrongAttributeValue -->
<script lang='ts'>
	import { SessionStore, SocketStore, UserStore } from '../../stores';
	import { type ISessionUpdate, Session } from '$lib/types/Session';
	import { onMount } from 'svelte';
	import Spinner from '$lib/components/Spinner.svelte';
	import { goto } from '$app/navigation';
	import { type PlayerList, User } from '$lib/types/User';
	import { apiGetErrorMessage } from '../../axios';
	import Alert from '$lib/components/Alert.svelte';
	import { connectToSocket } from '$lib/socket/socket-client';
	
	let sessionGetPromise: Promise<Session>;
	let userGetPromise: Promise<User>;
	let alertMessage = '';
	let changePropertiesFormInput: Partial<ISessionUpdate> = {
		startCapital: undefined,
		goReward: undefined,
		seeOthersBalance: undefined,
		freeParking: undefined
	};
	let sessionPropertiesChanged = false;
	let playerList: PlayerList = [];
	
	SessionStore.subscribe(s => {
		changePropertiesFormInput = { ...s };
	});
	
	onMount(async () => {
			if (!$SessionStore) {
				sessionGetPromise = Session.fetchSession();
				
				sessionGetPromise
					.then((s: Session) => $SessionStore = s)
					.catch(() => goto('/'));
			}
			
			if (!$UserStore) {
				userGetPromise = User.fetch();
				
				try {
					$UserStore = await userGetPromise;
					if (!$SocketStore)
						$SocketStore = await connectToSocket($UserStore?.socketConnection);
				} catch {
					await goto('/');
				}
			}
			
			playerList = await Session.getConnectedUsers();
		}
	);
	
	const changeSessionProperties = async () => {
		if (!$SessionStore) return;
		
		sessionGetPromise = $SessionStore.update(changePropertiesFormInput as ISessionUpdate);
		
		try {
			$SessionStore = await sessionGetPromise;
			alertMessage = 'Session data updated';
			sessionPropertiesChanged = true;
		} catch (e) {
			alertMessage = apiGetErrorMessage(e);
			sessionPropertiesChanged = true;
		}
	};
	
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
		{$SessionStore?.code}
	</div>
	<div class='p-1 pb-2 text-center fst-italic bg-light small'>
		(click to copy)
		{#if codeIsCopied}
			copied!
		{/if}
	</div>
</div>
<form on:submit|preventDefault={changeSessionProperties}>
	<table class='table table-bordered'>
		<tr>
			<th scope='row'><label for='start-capital'>Start Capital</label></th>
			<td><input bind:value={changePropertiesFormInput.startCapital}
								 class='form-control'
								 id='start-capital'
								 min='0' name='start-capital'
								 readonly={!$UserStore?.isHost}
								 type='number'></td>
		</tr>
		<tr>
			<th scope='row'><label for='go-reward'>Go Reward</label></th>
			<td><input bind:value={changePropertiesFormInput.goReward}
								 class='form-control'
								 id='go-reward'
								 min='0'
								 name='go-reward'
								 readonly={!$UserStore?.isHost}
								 type='number'>
			</td>
		</tr>
		<tr>
			<th scope='row'><label for='see-others-balance'>See Others Balance</label></th>
			<td><input bind:checked={changePropertiesFormInput.seeOthersBalance}
								 class='form-check-inline'
								 disabled={!$UserStore?.isHost}
								 id='see-others-balance'
								 name='see-others-balance'
								 type='checkbox'>
			</td>
		</tr>
		<tr>
			<th scope='row'><label for='free-parking'>Free Parking</label></th>
			<td><input bind:checked={changePropertiesFormInput.freeParking}
								 class='form-check-inline'
								 disabled={!$UserStore?.isHost}
								 id='free-parking'
								 name='free-parking'
								 type='checkbox'></td>
		</tr>
		{#if $UserStore?.isHost}
			<tr>
				<td colspan='2'>
					<div class='d-flex flex-row justify-content-center'>
						<div class='w-50 d-flex justify-content-center'>
							<button class='btn btn-primary w-75' type='submit'>Change</button>
							<div class='w-25'>
								<Spinner promise={sessionGetPromise} />
							</div>
						</div>
					</div>
				</td>
			</tr>
		{/if}
	</table>
</form>

<table class='table'>
	<thead>
		<tr>
			<th class='text-center'>Host</th>
			<th class='text-center'>Name</th>
			{#if $UserStore?.isHost}
				<th class='text-center'>Kick</th>
			{/if}
		</tr>
	</thead>
	<tbody>
		{#each playerList as player}
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
				<td>{player.name}</td>
				{#if $UserStore?.isHost}
					<td>
						{#if player.id !== $UserStore?.id}
							<button class='btn btn-outline-danger btn-sm' on:click={async ()=>{
								playerList = await player.kick();
							}}>X
							</button>
						{/if}
					</td>
				{/if}
			</tr>
		{/each}
	</tbody>
</table>

<Alert bind:show={sessionPropertiesChanged} time={4000}>
	{alertMessage}
</Alert>
