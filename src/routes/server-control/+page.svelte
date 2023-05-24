<script lang="ts">
    import type { PageData } from "./$types";

    export let data: PageData;
</script>

<p>Placeholder Server Control</p>
<span>
    {#await data.number.holup}
        Loading
    {:then value}
        {value}
    {/await}
</span>
