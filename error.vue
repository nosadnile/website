<script setup lang="ts">
import eruda from "eruda";

eruda.init();
</script>

<template>
    <NuxtLayout class="stretch">
        <div class="error">
            <h1>404</h1>

            <br />

            <h2>Page not found</h2>

            <br /><br /><br />
            
            <p>
                The page you are looking for might have been removed, had its name
                changed or is temporarily unavailable.
            </p>

            <br /><br />

            <AppMenuButton name="Go Back" icon="fa-solid fa-arrow-left" href="/" />
        </div>
    </NuxtLayout>
</template>

<style lang="scss">
@import "@/assets/global.scss";

.stretch {
    width: 100%;
    height: 100%;
}

.page-enter-active,
.page-leave-active {
    transition: all 0.4s;
}

.page-enter-from,
.page-leave-to {
    opacity: 0;
    filter: blur(1rem);
}

.layout-enter-active,
.layout-leave-active {
    transition: all 0.4s;
}

.layout-enter-from,
.layout-leave-to {
    filter: grayscale(1);
}

.error {
    width: 100%;
    height: 100%;

    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;

    text-align: center;
    color: #ffffff;

    font-family: Ubuntu;

    h1 {
        font-size: 30pt;
        font-weight: bolder;
        margin: 0;
    }

    h2 {
        font-size: 20pt;
        font-weight: bold;
        margin: 0;
    }

    p {
        font-size: 14pt;
        font-weight: lighter;
        margin: 0;
    }

    .menu-button {
        font-size: 18pt;
    }
}
</style>
