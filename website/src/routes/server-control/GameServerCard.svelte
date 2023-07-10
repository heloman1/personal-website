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
        on:click={() =>
            startStopAction(gameServerData.game, gameServerData.server)}
        >{gameServerData.online ? "Stop" : "Start"}</button
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
        background: var(--bg);
        box-shadow: 0px 0px 30px 0px var(--shadow-color);
        color: var(--fg);
    }

    button {
        color: var(--fg);
        gap: 0.5rem;
        padding: 1rem;
        border-radius: 10px;
        background-color: var(--bg);
    }
</style>
