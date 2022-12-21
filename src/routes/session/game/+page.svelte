<script lang='ts'>
	import { PlayerList } from '$lib/types/PlayerList';
	import { User, type UserList } from '$lib/types/User';
	import { onMount } from 'svelte';
	import { SessionStore, SocketStore, UserStore } from '../../../stores';
	import { Session } from '$lib/types/Session';
	import { goto } from '$app/navigation';
	import { connectToSocket } from '$lib/socket/socket-client';
	import Spinner from '$lib/components/Spinner.svelte';
	import Alert from '$lib/components/Alert.svelte';
	import type { ITransaction } from '../../../axios/helpers/transactions';
	import { getTransactionsSender, getTransactionsToPay, payForTransaction } from '../../../axios/helpers/transactions';
	
	let users: UserList = [];
	let playerList: PlayerList = new PlayerList().subscribe(players => users = players);
	
	let sessionGetPromise: Promise<Session>;
	let userGetPromise: Promise<User>;
	
	let transactionsToPay: ITransaction[] = [];
	let transactionsToGetPayed: ITransaction[] = [];
	
	const fetchTransactions = () => {
		getTransactionsToPay().then(t => transactionsToPay = t);
		getTransactionsSender().then(t => transactionsToGetPayed = t);
	};
	
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
				
				$SocketStore.on('user-connect', () => {
					console.log('user-connect');
					fetchTransactions();
				});
				
				$SocketStore.on('user-disconnect', () => {
					console.log('user-disconnect');
					fetchTransactions();
				});
				
				$SocketStore.on('user-balance-update', () => {
					console.log('user-balance-update');
					fetchTransactions();
				});
				
				$SocketStore.on('transaction-requested-rent', () => {
					console.log('transaction-requested-rent');
					fetchTransactions();
				});
				
				$SocketStore.on('transaction-requested', () => {
					console.log('transaction-requested');
					fetchTransactions();
				});
				
				$SocketStore.on('user-balance-update', () => {
					console.log('user-balance-update');
					fetchTransactions();
					playerList.fetch();
				});
				
				$SocketStore.on('kick', () => {
					console.log('kick');
					
					Session.fetchSession()
						.then((s: Session) => $SessionStore = s)
						.catch(() => goto('/'));
				});
			} catch {
				await goto('/');
			}
			
			playerList.fetch();
			fetchTransactions();
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
	
	let showAlert = false;
	let alertMessage = '';
	const error = (message: string) => {
		if (showAlert) {
			console.error('Error:', message);
		} else {
			alertMessage = message;
			showAlert = true;
		}
	};
	
	let valueRequestPersonal = 0;
	let selectedPlayerIdRequestPersonal: number;
	const requestPersonal = async () => {
		if (!selectedPlayerIdRequestPersonal && selectedPlayerIdRequestPersonal !== 0) return;
		try {
			await $UserStore?.requestMoneyFrom(users.find(p => p.id == selectedPlayerIdRequestPersonal), valueRequestPersonal);
			fetchTransactions();
		} catch (e) {
			console.error('requestPersonal', e);
			error(e?.response?.data?.error || e?.response?.data?.message || 'Something went wrong');
		}
	};
	
	let valueBankMoneySend = 0;
	let selectedPlayerIdBankMoneySend: number;
	const addMoneyToSelectedUser = async () => {
		if (!selectedPlayerIdBankMoneySend && selectedPlayerIdBankMoneySend !== 0) return;
		try {
			await users.find(p => p.id == selectedPlayerIdBankMoneySend)?.sendMoney(valueBankMoneySend);
		} catch (e) {
			console.error('addMoneyToSelectedUser', e);
			error(e?.response?.data?.error || e?.response?.data?.message || 'Something went wrong');
		}
	};
	
	let valueBankMoneyRequest = 0;
	let selectedPlayerIdBankMoneyRequest: number;
	const requestMoneyToSelectedUser = async () => {
		if (!selectedPlayerIdBankMoneyRequest && selectedPlayerIdBankMoneyRequest !== 0) return;
		try {
			await users.find(p => p.id == selectedPlayerIdBankMoneyRequest)?.requestMoneyFromBank(valueBankMoneyRequest);
		} catch (e) {
			console.error('requestMoneyToSelectedUser', e);
			error(e?.response?.data?.error || e?.response?.data?.message || 'Something went wrong');
		}
	};
	
	const payForTransactionFunction = (transaction: ITransaction) => (async () => {
		try {
			await payForTransaction(transaction);
			fetchTransactions();
		} catch (e) {
			console.error('Pay for transaction', e);
			error(e?.response?.data?.error || e?.response?.data?.message || 'Something went wrong');
		}
	});
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
					<th class='text-center'>Passes Go</th>
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
						<td>
							<button type='button' class='btn btn-primary' on:click={() => { player.passesGo() }}>
								Go
							</button>
						</td>
					{/if}
				</tr>
			{/each}
		</tbody>
	</table>
{/await}

<Alert bind:show={showAlert} time={4000}>
	{alertMessage}
</Alert>

<div>
	<div>
		<table class='table'>
			<caption class='caption-top'>To pay</caption>
			<thead>
				<tr>
					<th>To</th>
					<th>Amount</th>
					<th>Pay</th>
				</tr>
			</thead>
			<tbody>
				{#each transactionsToPay as transaction}
					<tr>
						<td>
							{#if transaction.request_sender_id}
								{users.find(p => p.id === transaction.request_sender_id)?.name}
							{:else}
								<u>Bank</u>
							{/if}
						</td>
						<td>{transaction.amount}</td>
						<td>
							<button
								type='button'
								class='btn btn-primary'
								on:click={payForTransactionFunction(transaction)}>
								Pay
							</button>
						</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
	<hr>
	<div class='bg-light'>
		<table class='table'>
			<caption class='caption-top'>Get payed</caption>
			<thead>
				<tr>
					<th>From</th>
					<th>Amount</th>
				</tr>
			</thead>
			<tbody>
				{#each transactionsToGetPayed as transaction}
					<tr>
						<td>
							{#if transaction.request_payer_id}
								{users.find(p => p.id === transaction.request_payer_id)?.name}
							{:else}
								<u>Bank</u>
							{/if}
						</td>
						<td>{transaction.amount}</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
</div>

<hr>

<div>
	<form on:submit|preventDefault={requestPersonal}>
		<span>Request money</span>
		<div class='input-group'>
			<select bind:value={selectedPlayerIdRequestPersonal} class='form-select'>
				{#each users as player}
					{#if player.id !== $UserStore.id}
						<option value={player.id}>{player.name}</option>
					{/if}
				{/each}
			</select>
			<span class='input-group-text'>$</span>
			<input bind:value={valueRequestPersonal} class='form-control' min='0' type='number'>
			<button class='form-control' type='submit'>Send</button>
		</div>
	</form>
	
	{#if $UserStore?.isHost}
		<hr>
		<h2>Bank</h2>
		<form on:submit|preventDefault={addMoneyToSelectedUser}>
			<span>Send Bank money to user</span>
			<div class='input-group'>
				<select bind:value={selectedPlayerIdBankMoneySend} class='form-select'>
					{#each users as player}
						<option value={player.id}>{player.name}</option>
					{/each}
				</select>
				<span class='input-group-text'>$</span>
				<input bind:value={valueBankMoneySend} class='form-control' min='0' type='number'>
				<button class='form-control' type='submit'>Send</button>
			</div>
		</form>
		<form on:submit|preventDefault={requestMoneyToSelectedUser}>
			<span>Ask user to pay (money goes to the bank)</span>
			<div class='input-group'>
				<select bind:value={selectedPlayerIdBankMoneyRequest} class='form-select'>
					{#each users as player}
						<option value={player.id}>{player.name}</option>
					{/each}
				</select>
				<span class='input-group-text'>$</span>
				<input bind:value={valueBankMoneyRequest} class='form-control' min='0' type='number'>
				<button class='form-control' type='submit'>Send</button>
			</div>
		</form>
	{/if}
	<hr>
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
