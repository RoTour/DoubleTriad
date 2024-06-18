<script lang="ts">
	import Notifications from '$lib/framework/components/Notifications.svelte';
	import '$lib/framework/stores/NotificationCenterStore.svelte';
	import '../app.css';
</script>

<Notifications />
<slot />
