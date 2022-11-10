<script lang='ts'>
	import { SessionStore } from '../../stores';
	import { type ISessionUpdate, Session } from '../../lib/types/Session';
	import { get } from 'svelte/store';
	import { onMount } from 'svelte';
	import Spinner from '$lib/components/Spinner.svelte';
	import { goto } from '$app/navigation';
	import Alert from '$lib/components/Alert.svelte';
	
	let session: Session = get(SessionStore);
	let sessionGetPromise: Promise<Session>;
	let changePropertiesFormInput: ISessionUpdate = {
		startCapital: undefined,
		goReward: undefined,
		seeOthersBalance: undefined,
		freeParking: undefined
	};
	let sessionPropertiesChanged = false;
	
	SessionStore.subscribe(s => {
		session = s;
		changePropertiesFormInput = {
			startCapital: session?.startCapital,
			goReward: session?.goReward,
			seeOthersBalance: session?.seeOthersBalance,
			freeParking: session?.freeParking
		};
	});
	
	onMount(async () => {
		if (!session) {
			sessionGetPromise = Session.fetchSession();
			
			sessionGetPromise
				.then((s: Session) => SessionStore.set(s))
				.catch(() => goto('/'));
		}
	});
	
	const changeSessionProperties = async () => {
		sessionGetPromise = session.update(changePropertiesFormInput);
		SessionStore.set(await sessionGetPromise);
		sessionPropertiesChanged = true;
	};
</script>

<form on:submit|preventDefault={changeSessionProperties}>
	<table class='table table-bordered'>
		<tr>
			<th scope='row'><label for='start-capital'>Start Capital</label></th>
			<td><input bind:value={changePropertiesFormInput.startCapital} class='form-control' id='start-capital' min='0'
								 name='start-capital' type='number'></td>
		</tr>
		<tr>
			<th scope='row'><label for='go-reward'>Go Reward</label></th>
			<td><input bind:value={changePropertiesFormInput.goReward} class='form-control' id='go-reward' min='0'
								 name='go-reward'
								 type='number'>
			</td>
		</tr>
		<tr>
			<th scope='row'><label for='see-others-balance'>See Others Balance</label></th>
			<td><input bind:checked={changePropertiesFormInput.seeOthersBalance} class='form-check-inline'
								 id='see-others-balance'
								 name='see-others-balance' type='checkbox'>
			</td>
		</tr>
		<tr>
			<th scope='row'><label for='free-parking'>Free Parking</label></th>
			<td><input bind:checked={changePropertiesFormInput.freeParking} class='form-check-inline' id='free-parking'
								 name='free-parking'
								 type='checkbox'></td>
		</tr>
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
	</table>
</form>
<Alert bind:show={sessionPropertiesChanged} time={4000}>
	Session data updated
</Alert>
