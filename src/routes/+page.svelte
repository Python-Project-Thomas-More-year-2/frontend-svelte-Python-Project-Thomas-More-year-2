<script lang='ts'>
	import { Session } from '../lib/types/Session';
	import { User } from '../lib/types/User';
	import { SessionStore, UserStore } from '../stores';
	import Spinner from '$lib/components/Spinner.svelte';
	import { AxiosError } from 'axios';
	import { apiGetErrorMessage } from '../axios';
	
	enum Status {
		CHOOSER, CREATE, JOIN
	}
	
	let status: Status = Status.CHOOSER;
	let formErrorMessage = '';
	let createSessionPromise: Promise<[Session, User]>;
	
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
		} catch (e: AxiosError | Error) {
			formErrorMessage = apiGetErrorMessage(e);
		}
		
		//TODO Redirect to session page
	};
</script>

<div class='d-flex justify-content-around flex-column align-content-center m-5' id='wrapper'>
	<h1 class='text-center'>MonoOoOoOoOoOopoly<sup>&reg;</sup><br>Banking App</h1>
	<hr>
	<div class='w-75 m-auto'>
		{#if status === Status.CHOOSER}
			<div id='choose' class='d-flex gap-5 mt-5'>
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
					<input class='align-middle' maxlength='15' placeholder='Username' type='text' name='name' id='name'>
					<button type='submit' class='btn btn-primary'>Create</button>
					<Spinner class='align-middle text-primary' promise={createSessionPromise} />
				</form>
			{/if}
		{/if}
	</div>
</div>

<style lang='scss'>
	#choose {
		> div {
			cursor: pointer;
			
			&:hover, &:focus {
				background-color: #0451c9 !important;
			}
		}
	}
</style>
