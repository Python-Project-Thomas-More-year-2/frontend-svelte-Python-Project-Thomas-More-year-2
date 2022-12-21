<script lang='ts'>
	//eslint-disable-next-line @typescript-eslint/no-empty-function
	export let promise: Promise<never> | undefined = new Promise(() => {});
	//noinspection JSUnusedGlobalSymbols,ReservedWordAsName
	export { className as class };
	let className = '';
</script>

{#await promise}
	<div class={'spinner-border '+className} role='status'>
		<span class='visually-hidden'>Loading...</span>
	</div>
{/await}
