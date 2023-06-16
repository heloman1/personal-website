<script lang="ts">
    import GameServerCard from "./GameServerCard.svelte";
    import type { PageData } from "./$types";
    import { onMount } from "svelte";

    // data is an important name for Svelte, do not rename
    export let data: PageData;

</script>

<div class="card-container">
    {#await data.streamed.gameServerData}
        <span>Loading</span>
    {:then data}
        {#each data as d}
            <GameServerCard gameServerData={d} startStopAction={(game, server) => console.log(`${game} : ${server}`)}/>
        {/each}
    {/await}
</div>

<style>
    .card-container {
        display: flex;
        gap: 1rem
    }
</style>
