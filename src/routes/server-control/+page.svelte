<script lang="ts">
    import GameServerCard from "./GameServerCard.svelte";
    import type { PageData } from "./$types";

    export let data: PageData;
</script>

<p>Placeholder Server Control</p>

<div class="card-container">
    {#each data.placeholder as d}
        <GameServerCard gameServerData={d} />
    {/each}
</div>

<style>
.card-container {
    display: flex;
    
}
</style>