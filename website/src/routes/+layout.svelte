<script lang="ts">
</script>

<nav>
    <a href="/"> Home </a>
    <a href="/server-control">Server Control</a>
    <a href="/account">Account</a>
</nav>

<slot />

<style>
    :global(:root) {
        /* Light Mode */
        /* --fg: black;
        --bg: white;
        --shadow-color: rgba(0, 0, 0, 0.15); */

        /* Dark Mode */
        --fg: white;
        --bg: rgb(59, 59, 59);
        --shadow-color: rgba(255, 255, 255, 0.15);

        --bg-highlight: gray;
    }
    :global(body) {
        background-color: var(--bg);
    }
    nav {
        /* border: solid blue; */
        margin-bottom: 1rem;
        display: flex;
        /* flex-direction: column; */
        gap: 0.5rem;
        padding: 1rem;
        border-radius: 10px;
        background-color: var(--bg);
        box-shadow: 0px 0px 30px 0px var(--shadow-color);
    }

    a {
        color: var(--fg);
        gap: 0.5rem;
        padding: 1rem;
        border-radius: 10px;
        border-style: outset;
        background-color: var(--bg);

        text-decoration: none;
    }

    a:active {
        border-style: inset;
    }
    
    a:hover {
        background-color: var(--bg-highlight);
    }
</style>
