<script lang='ts'>
	import { PlayerList } from '$lib/types/PlayerList';
	import { UserList } from '$lib/types/User';
	
	let users: UserList = [];
	let playerList: PlayerList = new PlayerList().subscribe(players => users = players);
</script>
