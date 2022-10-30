<script lang='ts'>
	export let promise: Promise<never> | undefined;
	//noinspection JSUnusedGlobalSymbols,ReservedWordAsName
	export { className as class };
	let className = '';
</script>

{#await promise}
	<div class={'spinner-border '+className} role='status'>
		<span class='visually-hidden'>Loading...</span>
	</div>
{/await}
