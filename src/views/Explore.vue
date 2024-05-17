<template>
    <div id="explore-aladin-lite" style="width: 100%; height: 100vh;"></div>
</template>

<script lang="ts" setup>
import A from 'aladin-lite'

let aladin = null

A.init.then(() => {
    aladin = A.aladin('#explore-aladin-lite', {target: 'M101', fov: 5, projection: "AIT",
    survey: "P/PanSTARRS/DR1/color-z-zg-g", cooFrame: 'ICRSd', showCooGridControl: true,
    showSimbadPointerControl: true, showCooGrid: true, showContextMenu: true});
});
</script>

<style>
.myButton {
    position: absolute;
    top: 15rem;
    left: 0;

    background-color: pink;
}
.testbutton {
    position: absolute;
    top: 17rem;
    left: 0;
}
</style>