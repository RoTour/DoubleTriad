<script lang="ts">
	import { notificationCenter } from '$lib/framework/stores/NotificationCenterStore.svelte';
	import { onDestroy, onMount } from 'svelte';
	import { NotificationBuilder, type Notification } from '$lib/entities/Notification';
	import { fly } from 'svelte/transition';
	import { flip } from 'svelte/animate';

	let notifications: Notification[] = $state([]);
	let timeouts: number[] = [];

	$inspect('notifications', notifications);

	onMount(() => {
		notificationCenter.instance.onNewNotification(({ notification }) => {
			notifications.push(notification);
			if (!notification.expiration) return;
			const timeout = setTimeout(() => {
				notifications = [...notifications.filter((n) => !notification.compare(n))];
			}, notification.expiration);
			timeouts.push(timeout);
		});
	});

	onDestroy(() => {
		notificationCenter.instance.cleanUp();
		timeouts.forEach((timeout) => clearTimeout(timeout));
		notifications = [];
	});

	let index = 0;
	const sendNotification = () => {
		NotificationBuilder()
			.withTitle(index + ' - Starter notification :')
			.withDescription('For testing purposes')
			.withExpiration(5000)
			.send();
		index++;
	};
</script>

{#snippet Notification(data: Notification)}
	<h3
		class="font-bold text-2xl"
		class:text-red-600={data.type === 'error'}
		class:text-green-600={data.type === 'success'}
		class:text-blue-600={data.type === 'info'}
	>
		{data.title}
	</h3>
	<p class="text-2xl">{data.description}</p>
{/snippet}

<ul class="fixed top-1/4 left-1/2 -translate-x-1/2 w-screen">
	{#each notifications.slice(-5) as notification (notification.id)}
		<li
			in:fly={{ duration: 500, y: 50 }}
			out:fly={{ duration: 1000, y: -10 }}
			animate:flip
			class="flex justify-center w-full gap-[.75ch]"
		>
			{@render Notification(notification)}
		</li>
	{/each}
</ul>
<button onclick={sendNotification} class="fixed right-0 border-black border-2">
	Send notification
</button>
