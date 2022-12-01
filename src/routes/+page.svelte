<script lang='ts'>
	import { Session } from '../lib/types/Session';
	import { User } from '../lib/types/User';
	import { SessionStore, UserStore } from '../stores';
	import Spinner from '$lib/components/Spinner.svelte';
	import { apiGetErrorMessage } from '../axios';
	import { goto } from '$app/navigation';
	
	enum Status {
		CHOOSER, CREATE, JOIN
	}
	
	let status: Status = Status.CHOOSER;
	let formErrorMessage = '';
	let createSessionPromise: Promise<[Session, User]>;
	
	let joinSession: {
		promise?: Promise<[Session, User]>,
		errorMessage: string,
		input: {
			sessionCode: string,
			username: string,
		}
	} = {
		promise: null,
		errorMessage: '',
		input: {
			sessionCode: '',
			username: ''
		}
	};
	
	const changeStatus = (st: Status) => () => {
		status = st;
	};
	
	const submitCreate = async (e) => {
		formErrorMessage = '';
		
		const name: string | undefined = e.target.name?.value;
		if (!name) return formErrorMessage = 'Please fill in a name';
		
		createSessionPromise = Session.createSession(name);
		try {
			const res: [Session, User] = await createSessionPromise;
			SessionStore.set(res[0]);
			UserStore.set(res[1]);
			await goto('/session');
		} catch (e) {
			formErrorMessage = apiGetErrorMessage(e);
		}
	};
	const submitJoin = async () => {
		joinSession.errorMessage = '';
		
		if (!joinSession.input.sessionCode.trim())
			return joinSession.errorMessage = 'Please fill in the Session Code';
		
		if (!joinSession.input.username.trim())
			return joinSession.errorMessage = 'Please fill in the Username';
		
		if (!/^[a-zA-Z]{3}-[a-zA-Z]{3}$/.test(joinSession.input.sessionCode))
			return joinSession.errorMessage = 'Session Code is incorrect (AAA-BBB)';
		
		joinSession.promise = Session.join(joinSession.input.sessionCode, joinSession.input.username);
		try {
			const res: [Session, User] = await joinSession.promise;
			SessionStore.set(res[0]);
			UserStore.set(res[1]);
			await goto('/session');
		} catch (e) {
			joinSession.errorMessage = apiGetErrorMessage(e);
		}
	};
</script>

<div class='d-flex justify-content-around flex-column align-content-center m-5' id='wrapper'>
	<h1 class='text-center'>MonoOoOoOoOoOopoly<sup>&reg;</sup><br>Banking App</h1>
	<hr>
	<div class='w-75 m-auto'>
		{#if status === Status.CHOOSER}
			<div id='choose' class='d-flex gap-2 mt-5'>
				<button on:click={changeStatus(Status.CREATE)}
								class='card w-100 text-center pt-4 pb-4 bg-primary text-white'>
					<span class='m-auto'>Create</span>
				</button>
				<button on:click={changeStatus(Status.JOIN)}
								class='card w-100 text-center pt-4 pb-4 bg-primary text-white'>
					<span class='m-auto'>Join</span>
				</button>
			</div>
		{/if}
		{#if status === Status.CREATE || status === Status.JOIN}
			<div>
				<button class='btn btn-close' style='float: right' on:click={changeStatus(Status.CHOOSER)}></button>
			</div>
			{#if status === Status.CREATE}
				<form on:submit|preventDefault={submitCreate} class='align-baseline mt-5 text-center'>
					{#if formErrorMessage}<p class='alert alert-danger'>{formErrorMessage}</p>{/if}
					<input class='align-middle mt-2' maxlength='15' placeholder='Username' type='text' name='name' id='name'>
					<button type='submit' class='btn btn-primary mt-2'>Create</button>
					<Spinner class='align-middle text-primary mt-2' promise={createSessionPromise} />
				</form>
			{/if}
			{#if status === Status.JOIN}
				<form on:submit|preventDefault={submitJoin} class='align-baseline mt-5 text-center'>
					{#if joinSession.errorMessage}<p class='alert alert-danger'>{joinSession.errorMessage}</p>{/if}
					<input class='align-middle mt-2' maxlength='15' placeholder='Username' type='text' name='name'
								 bind:value={joinSession.input.username}>
					<input class='align-middle mt-2' maxlength='15' placeholder='Code' type='text' name='code'
								 bind:value={joinSession.input.sessionCode}>
					<button type='submit' class='btn btn-primary mt-2'>Join</button>
					<Spinner class='align-middle text-primary mt-2' promise={joinSession.promise} />
				</form>
			{/if}
		{/if}
	</div>
</div>

<style lang='scss'>
	#choose {
		> button {
			&:hover, &:focus {
				background-color: #0451c9 !important;
			}
		}
	}
</style>
