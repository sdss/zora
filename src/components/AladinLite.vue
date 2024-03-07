<template>
    <div id="aladin-lite-div" style="width: 100%; height: 300px"></div>
</template>

<script lang="ts" setup type="module">

import A from 'aladin-lite'

// define which properties are passed in from the parent, i.e. ":xxx"
const props = defineProps<{
    ra: bigint,
    dec: bigint
}>()

let aladin = null
let target = `${props.ra}, ${props.dec}`

console.log('stuff', props.width, props.height)
console.log('al target props', target);

A.init.then(() => {
    aladin = A.aladin('#aladin-lite-div', {target: target, fov: 0.1, survey: "P/PanSTARRS/DR1/color-z-zg-g", projection: "AIT",
    cooFrame: 'ICRSd', showCooGridControl: true, showSimbadPointerControl: true, showCooGrid: false,
    showProjectionControl: false, showFullscreenControl: false, showZoomControl: false, showStatusBar: false,
    showSettingsControl: false});

    aladin.setFovRange(0.01, 10)
});
</script>

<!-- <style>
/* Load the CSS file of aladin-lite */
@import "http://aladin.u-strasbg.fr/AladinLite/api/v3/latest/aladin.min.css";
</style> -->