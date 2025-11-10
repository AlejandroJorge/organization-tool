<script lang="ts">
	import '../app.css';
	import favicon from '$lib/assets/favicon.svg';
	import ToastHost from '$lib/components/ToastHost.svelte';
	
	let { children } = $props();
</script>

<svelte:head>
	<title>Organize | Tasks & Notes</title>
	<meta
		name="description"
		content="Organize your work with simple task lists and notes, all in one minimalist dashboard."
	/>
	<link rel="icon" href={favicon} />
</svelte:head>

<div class="relative">
	{@render children()}
	<ToastHost />
</div>
