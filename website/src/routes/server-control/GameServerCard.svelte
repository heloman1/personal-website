<script lang="ts">
    export let gameServerData: GameServer;
    export let disabled = false;
</script>

<div class="card">
    <span>{gameServerData.game}</span>
    <span>{gameServerData.server}</span>
    <span>{gameServerData.port}</span>
    <span>{disabled}</span>
</div>

<style>
    .card {
        border: solid blue;
        display: flex;
        flex-direction: column;
        gap: .5rem;
        padding: 1rem;
    }
</style>
