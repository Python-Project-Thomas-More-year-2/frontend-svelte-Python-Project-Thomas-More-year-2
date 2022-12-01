<!--suppress HtmlWrongAttributeValue -->
<script lang='ts'>
	import { SessionStore, UserStore } from '../../stores';
	import { type ISessionUpdate, Session } from '$lib/types/Session';
	import { onMount } from 'svelte';
	import Spinner from '$lib/components/Spinner.svelte';
	import { goto } from '$app/navigation';
	import { User } from '$lib/types/User';
	import { apiGetErrorMessage } from '../../axios';
	import Alert from '$lib/components/Alert.svelte';
	
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
			
			userGetPromise
				.then((s: User) => $UserStore = s)
				.catch(() => goto('/'));
		}
	});
	
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
</script>

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
		<tr>
			<td colspan='2'>
				<div class='d-flex flex-row justify-content-center'>
					<div class='w-50 d-flex justify-content-center'>
						<button class='btn btn-primary w-75' disabled={!$UserStore?.isHost} type='submit'>Change</button>
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
	{alertMessage}
</Alert>
