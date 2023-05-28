<script setup lang="ts">
const i18n = useI18n();

const t = i18n.t;
const locale = i18n.locale;
const locales = i18n.locales;
</script>

<template>
    <div>
        <Group :title="t('controls.title')">
            <SimpleButton
                :active="appState.controls.state === 'perspective'"
                @action="
                    $bluemap.setPerspectiveView(500, appState.controls.state === 'free' ? 100 : 0)
                "
                >{{ t("controls.perspective.button") }}</SimpleButton
            >
            <SimpleButton
                :active="appState.controls.state === 'flat'"
                @action="$bluemap.setFlatView(500, appState.controls.state === 'free' ? 100 : 0)"
                >{{ t("controls.flatView.button") }}</SimpleButton
            >
            <SimpleButton
                :active="appState.controls.state === 'free'"
                @action="$bluemap.setFreeFlight(500)"
                >{{ t("controls.freeFlight.button") }}</SimpleButton
            >
        </Group>

        <Group :title="t('lighting.title')">
            <Slider
                :value="mapViewer.uniforms.sunlightStrength.value"
                :min="0"
                :max="1"
                :step="0.01"
                @update="mapViewer.uniforms.sunlightStrength.value = $event"
                >{{ t("lighting.sunlight") }}</Slider
            >
            <Slider
                :value="mapViewer.uniforms.ambientLight.value"
                :min="0"
                :max="1"
                :step="0.01"
                @update="mapViewer.uniforms.ambientLight.value = $event"
                >{{ t("lighting.ambientLight") }}</Slider
            >
        </Group>

        <Group :title="t('resolution.title')">
            <SimpleButton
                v-for="stage of qualityStages"
                :key="stage.name"
                :active="mapViewer.superSampling === stage.value"
                @action="
                    $bluemap.mapViewer.superSampling = stage.value;
                    $bluemap.saveUserSettings();
                "
                >{{ stage.name }}</SimpleButton
            >
        </Group>

        <Group :title="t('renderDistance.title')">
            <Slider
                :value="mapViewer.loadedHiresViewDistance"
                :min="settings.hiresSliderMin"
                :max="settings.hiresSliderMax"
                :step="10"
                :formatter="renderDistanceFormatter"
                @update="
                    mapViewer.loadedHiresViewDistance = $event;
                    $bluemap.mapViewer.updateLoadedMapArea();
                "
                @lazy="$bluemap.saveUserSettings()"
                >{{ t("renderDistance.hiresLayer") }}</Slider
            >
            <Slider
                :value="mapViewer.loadedLowresViewDistance"
                :min="settings.lowresSliderMin"
                :max="settings.lowresSliderMax"
                :step="100"
                @update="
                    mapViewer.loadedLowresViewDistance = $event;
                    $bluemap.mapViewer.updateLoadedMapArea();
                "
                @lazy="$bluemap.saveUserSettings()"
                >{{ t("renderDistance.lowersLayer") }}</Slider
            >
            <SwitchButton
                :on="!appState.controls.pauseTileLoading"
                @action="
                    appState.controls.pauseTileLoading = !appState.controls.pauseTileLoading;
                    $bluemap.saveUserSettings();
                "
                >{{ t("renderDistance.loadHiresWhileMoving") }}</SwitchButton
            >
        </Group>

        <Group :title="t('mapControls.title')">
            <SwitchButton
                :on="appState.controls.showZoomButtons"
                @action="
                    appState.controls.showZoomButtons = !appState.controls.showZoomButtons;
                    $bluemap.saveUserSettings();
                "
                >{{ t("mapControls.showZoomButtons") }}</SwitchButton
            >
        </Group>

        <Group :title="t('freeFlightControls.title')">
            <Slider
                :value="appState.controls.mouseSensitivity"
                :min="0.1"
                :max="5"
                :step="0.05"
                @update="
                    appState.controls.mouseSensitivity = $event;
                    $bluemap.updateControlsSettings();
                "
                @lazy="$bluemap.saveUserSettings()"
                >{{ t("freeFlightControls.mouseSensitivity") }}</Slider
            >
            <SwitchButton
                :on="appState.controls.invertMouse"
                @action="
                    appState.controls.invertMouse = !appState.controls.invertMouse;
                    $bluemap.updateControlsSettings();
                    $bluemap.saveUserSettings();
                "
                >{{ t("freeFlightControls.invertMouseY") }}</SwitchButton
            >
        </Group>

        <Group :title="t('theme.title')">
            <SimpleButton
                v-for="theme of themes"
                :key="theme.name"
                :active="appState.theme === theme.value"
                @action="
                    $bluemap.setTheme(theme.value as any);
                    $bluemap.saveUserSettings();
                "
                >{{ theme.name }}</SimpleButton
            >
        </Group>

        <Group :title="t('screenshot.title')">
            <SwitchButton
                :on="appState.screenshot.clipboard"
                @action="
                    appState.screenshot.clipboard = !appState.screenshot.clipboard;
                    $bluemap.saveUserSettings();
                "
                >{{ t("screenshot.clipboard") }}</SwitchButton
            >
        </Group>

        <Group v-if="languages.length > 1" :title="t('language.title')">
            <SimpleButton
                v-for="lang of languages"
                :key="lang.code"
                :active="lang.code === locale"
                @action="
                    changeLanguage(lang.code);
                    $bluemap.saveUserSettings();
                "
                >{{ lang.name }}</SimpleButton
            >
        </Group>

        <SwitchButton
            :on="appState.debug"
            @action="
                switchDebug();
                $bluemap.saveUserSettings();
            "
            >{{ t("debug.button") }}</SwitchButton
        >

        <SimpleButton @action="$bluemap.resetSettings()">{{
            t("resetAllSettings.button")
        }}</SimpleButton>
    </div>
</template>

<script lang="ts">
import { LocaleObject } from "@nuxtjs/i18n/dist/runtime/composables";
import Group from "./Group.vue";
import SimpleButton from "./SimpleButton.vue";
import Slider from "./Slider.vue";
import SwitchButton from "./SwitchButton.vue";
import { setLanguage } from "@/lib/BlueMap/i18n";

const { $i18n } = useNuxtApp();

const themes = [
    {
        get name() {
            return $i18n.t("theme.default");
        },
        value: null,
    },
    {
        get name() {
            return $i18n.t("theme.dark");
        },
        value: "dark",
    },
    {
        get name() {
            return $i18n.t("theme.light");
        },
        value: "light",
    },
    {
        get name() {
            return $i18n.t("theme.contrast");
        },
        value: "contrast",
    },
];

const qualityStages = [
    {
        get name() {
            return $i18n.t("resolution.high");
        },
        value: 2,
    },
    {
        get name() {
            return $i18n.t("resolution.normal");
        },
        value: 1,
    },
    {
        get name() {
            return $i18n.t("resolution.low");
        },
        value: 0.5,
    },
];

export default {
    name: "SettingsMenu",
    components: { SwitchButton, Slider, SimpleButton, Group },
    data() {
        return {
            appState: this.$bluemap.appState,
            mapViewer: this.$bluemap.mapViewer.data,
            settings: {
                ...{
                    hiresSliderMax: 500,
                    hiresSliderMin: 50,
                    lowresSliderMax: 10000,
                    lowresSliderMin: 500,
                },
                ...this.$bluemap.settings,
            },
            languages: locales as any as LocaleObject[],

            qualityStages: qualityStages,
            themes: themes,
        };
    },
    methods: {
        switchDebug() {
            this.$bluemap.setDebug(!this.appState.debug);
        },
        renderDistanceFormatter(value: string) {
            let f = parseFloat(value);
            return f === 0 ? t("renderDistance.off") : f.toFixed(0);
        },
        changeLanguage(lang: string) {
            setLanguage(lang);
        },
    },
};
</script>

<style></style>
