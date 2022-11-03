<script lang='ts'>
	export let time = 5000;
	export let show: boolean;
	export let durationCounter = false;
	export let title = '';
	
	let percentage = 0;
	let startDate: number;
	
	const timer = () => ((percentage = (Date.now() - startDate) / (time)) < 1) && requestAnimationFrame(timer);
	
	$: if (show) {
		setTimeout(() => {
			show = false;
		}, time);
		
		if (durationCounter) {
			startDate = Date.now();
			requestAnimationFrame(timer);
		}
	}
	
	const barWidthResize = () => {
		return {
			duration: time,
			css: (_, u: number) => `width: ${Math.trunc(u * 100)}%`
		};
	};
</script>

{#if show}
	<div aria-atomic='true' aria-live='assertive' class='alert-box w-100 p-2' role='alert'>
		<div class='toast show'>
			{#if durationCounter || title}
				<div class='toast-header'>
					<strong class='me-auto'>{title}</strong>
					{#if durationCounter}
						<small>{Math.round(time * (1 - percentage) / 1000)} seconds</small>
					{/if}
				</div>
			{/if}
			<div class='toast-body'>
				<slot></slot>
				<div class='bar' in:barWidthResize></div>
			</div>
		</div>
	</div>
{/if}

<style lang='scss'>
	.toast {
		background-color: rgba(255, 255, 255, 1);
	}
	
	.alert-box {
		position: fixed;
		top: 0;
		right: 0;
		width: 100%;
		
		> div {
			position: relative;
			margin: 0 auto;
		}
		
		div.bar {
			position: absolute;
			left: 0;
			bottom: 0;
			height: 3px;
			background-color: var(--bs-blue); // #0d6efd
			width: 100%;
		}
	}
</style>
