<template>
    <div class="primary-button">
        <span class="button">{{ $props.name }}</span>
    </div>
</template>

<script lang="ts">
    export default {
        props: {
            name: {
                type: String,
                required: true,
                default: "Button",
            },
        },
    };
</script>

<style scoped lang="scss">
    @import "@fontsource/ubuntu/index.css";
    
    .primary-button {
        display: flex;
        flex-wrap: wrap;

        .button {
            padding: 0.4% 1.1%;
            cursor: pointer;
            background-color: #1f2120;
            color: white;
            font-family: Ubuntu;
            border-radius: 6px;
            border: 1px solid #1f2120;

            transition: background-color 0.5s ease, color 0.5s ease;

            &:hover, &:focus {
                background-color: white;
                color: #1f2120;
            }
        }
    }
</style>
