<script lang="ts">
    // let brightness_mode: "light" | "dark" | "auto" = "auto";

    let links = [
        { name: "Home", href: "/" },
        { name: "Server Control", href: "/server-control" },
        { name: "Account", href: "/account" },
    ];

    // function set_light_mode() {}
    // function set_dark_mode() {}
    // function set_auto_mode() {}
</script>

<nav>
    {#each links as link}
        <a class="button" href={link.href}>{link.name}</a>
    {/each}
</nav>

<slot />

<style>
    :global(:root) {
        /* Light Mode */
        --fg: black;
        --bg: white;
        --shadow-color: rgba(0, 0, 0, 0.15);

        /* Dark Mode */
        /* --fg: white;
         --bg: rgb(59, 59, 59);
         --shadow-color: rgba(255, 255, 255, 0.15); */

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

    .button {
        gap: 0.5rem;
        padding: 1rem;
        border-radius: 10px;
        border-style: outset;
        background-color: var(--bg);
        border-width: 2px;
        border-color: grey;
        text-decoration: none;
        color: var(--fg);
    }

    .button:disabled {
        background-color: var(--bg-highlight);
    }
    .button:active:not(:disabled) {
        border-style: inset;
    }

    .button:hover:not(:disabled) {
        background-color: var(--bg-highlight);
    }
</style>
