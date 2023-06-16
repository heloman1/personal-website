<script lang="ts">
    export let gameServerData: GameServer;
    export let disabled = false;
    export let startStopAction: (game: string, server: string) => void;
</script>

<div class="card">
    <span>Game: {gameServerData.game}</span>
    <span>Name: {gameServerData.server}</span>
    <span>Ports: {gameServerData.port}</span>
    <span>Online: {gameServerData.online}</span>
    <span>Card Disabled: {disabled}</span>
    <button
        {disabled}
        on:click={() => startStopAction(gameServerData.game, gameServerData.server)}
        >Start/Stop</button
    >
</div>

<style>
    .card {
        /* border: solid blue; */
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
        padding: 1rem;
        border-radius: 10px;
        background: white;
        box-shadow: 0px 0px 30px 0px rgba(0, 0, 0, 0.15);
    }
</style>
