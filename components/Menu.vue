<script setup lang="ts">
    import logo from "~/assets/icon.png";
</script>

<template>
    <div class="header">
        <div class="burger-container" :class="{ open: isMenuOpen }" @click="isMenuOpen = !isMenuOpen">
            <div class="burger" />
        </div>

        <img :src="logo" />

        <AppMenuButton name="NoSadNile Network" class="title" href="/" />
        
        <AppMenuButton :name="serverIp" :icon="ipClasses" class="ip" @click="copyIp" />
    </div>

    <div class="menu" :class="{ open: isMenuOpen }">
        <div
            class="burger-container"
            :class="{ open: isMenuOpen }"
            @click="isMenuOpen = !isMenuOpen"
        >
            <div class="burger" />
        </div>

        <div class="menu-item">
            <AppMenuButton name="Home" icon="fa-solid fa-home" href="/" />
        </div>

        <div class="menu-item">
            <AppMenuButton name="Our Team" icon="fa-solid fa-users" href="/team" />
        </div>

        <div class="menu-item">
            <AppMenuButton name="History" icon="fa-solid fa-book-open" href="/history" />
        </div>

        <div class="menu-item">
            <AppMenuButton name="Contact" icon="fa-solid fa-phone" href="/contact" />
        </div>

        <div class="menu-item">
            <AppMenuButton name="Map" icon="fa-solid fa-map" href="/map" />
        </div>

        <div class="menu-item">
            <AppMenuButton name="Store" icon="fa-solid fa-shopping-bag" href="/store" />
        </div>
    </div>
</template>

<script lang="ts">
export default {
    data() {
        return {
            isMenuOpen: false,
            serverIp: "play.nosadnile.net",
            ipClasses: "fa-regular fa-clipboard mg-r",
        };
    },

    methods: {
        copyIp() {
            navigator.clipboard.writeText(this.serverIp);

            this.ipClasses = "fa-solid fa-check fa-bounce mg-r";

            setTimeout(() => {
                this.ipClasses = "fa-regular fa-clipboard mg-r";
            }, 1000);
        },
    },
};
</script>

<style scoped lang="scss">
$burgerWidth: 25px;
$burgerHeight: 8px;
$burgerMargin: 0px;

.header {
    width: 100%;
    height: 3.75rem;
    background: #3f4140;

    position: fixed;
    top: 0;
    left: 0;

    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: flex-start;

    img {
        height: 70%;
        margin: 12.5% 0.5%;
        border-radius: 4px;
    }

    .title {
        font-size: 16pt;
        font-family: Ubuntu;

        color: #ffffff;
        padding: 0 0.5%;
    }

    .ip {
        font-size: 12pt;
        font-family: Ubuntu;

        color: #ffffff;
        padding: 0 0.5%;

        justify-self: flex-end;
        margin-left: auto;
        margin-right: 0.75%;
    }
}

.menu {
    width: 20%;
    height: 100%;
    background: #3f4140;

    position: fixed;
    top: 0;
    left: 0;

    display: flex;
    flex-direction: column;
    align-items: flex-start;
    justify-content: flex-start;

    opacity: 0;
    pointer-events: none;

    transition: opacity 0.5s ease;

    &.open {
        opacity: 1;
        pointer-events: unset;
    }

    .menu-item {
        margin: 2% 8%;
    }

    .burger-container {
        padding: 2%;
    }
}

.burger-container {
    height: 3.5%;
    width: $burgerWidth;
    padding: 2% 1%;
    cursor: pointer;
    transition: all 0.5s ease-in-out;
    border: none;

    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;

    .burger {
        width: $burgerWidth;
        height: calc($burgerHeight / 3);
        background-color: #ffffff;
        border-radius: 8px;
        box-shadow: 0 2px 5px rgba(255, 101, 47, 0.2);
        transition: all 0.5s ease-in-out;

        &::before,
        &::after {
            content: "";
            position: absolute;
            width: $burgerWidth;
            height: calc($burgerHeight / 3);
            background: #ffffff;
            border-radius: 8px;
            box-shadow: 0 2px 5px rgba(255, 101, 47, 0.2);
            transition: all 0.5s ease-in-out;
        }

        &::before {
            transform: translateY(-$burgerHeight - $burgerMargin);
        }

        &::after {
            transform: translateY($burgerHeight + $burgerMargin);
        }
    }

    &.open .burger {
        background: transparent;
        box-shadow: none;

        &::before {
            transform: rotate(45deg);
        }

        &::after {
            transform: rotate(-45deg);
        }
    }
}
</style>
