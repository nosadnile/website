<template>
    <div class="menu-button">
        <span class="name" @click="clickAction">
            <i v-if="icon" :class="icon" />

            {{ name }}
        </span>
    </div>
</template>

<script lang="ts">
    export default {
        emits: ["click"],

        props: {
            name: {
                type: String,
                required: true,
                default: "Button",
            },

            icon: {
                type: String,
                required: false,
            },

            href: {
                type: String,
                required: false,
            },
        },

        methods: {
            clickAction() {
                this.$emit("click");

                if (this.$props.href)
                    navigateTo(this.$props.href);
            },
        },
    };
</script>

<style scoped lang="scss">
    @import "@fontsource/ubuntu/index.css";

    * {
        box-sizing: border-box;
    }
    
    .menu-button {
        display: flex;
        flex-wrap: wrap;
        font-family: Ubuntu;

        .name {
            display: block;
            position: relative;
            padding: 0.2em 0;
            cursor: pointer;
            color: white;

            &::after {
                content: '';
                position: absolute;
                bottom: 0;
                left: 0;
                width: 100%;
                height: 0.1em;
                background-color: white;
                opacity: 0;
                transition: opacity 300ms, transform 300ms;
                transform: scale(0);
                transform-origin: center;
            }

            &:hover::after,
            &:focus::after {
                opacity: 1;
                transform: translate3d(0, 0.2em, 0);
                transform: scale(1);
            }
        }

        .mg-r::before {
            margin-right: 0.125rem;
        }
    }
</style>
