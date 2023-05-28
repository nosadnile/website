<script setup lang="ts">
    useHead({
        title: "Map",
    });
</script>

<template>
    <div ref="container">
        <MapViewer />
    </div>

    <Menu />
</template>

<script lang="ts">
export default {
    name: "Map",
    
    mounted() {
        const container = this.$refs.container as HTMLDivElement;
        
        container.appendChild(this.$mapContainer);
    },

    beforeUnmount() {
        const container = this.$refs.container as HTMLDivElement;

        container.removeChild(this.$mapContainer);
    },
};
</script>
