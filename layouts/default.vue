<template>
    <div class="main">
        <Menu />
        <slot />
    </div>
</template>

<style lang="scss">
    .main {
        width: 100%;
        height: 100%;

        display: flex;
        flex-direction: column;
        align-items: flex-start;
        justify-content: flex-start;
    }
</style>
