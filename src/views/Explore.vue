<template>
    <!-- info context -->
    <v-row no-gutters>
        <v-col class="d-flex justify-center align-center" cols="12">
            <p class="text-center ma-0">Explore the sky using
                <a href="https://aladin.cds.unistra.fr/AladinLite/doc/" target="_blank">Aladin-Lite</a>.
            </p>
            <v-icon class="ml-1" size='x-small' icon="mdi-help"
            v-tippy="'See <a href=\'https://aladin.cds.unistra.fr/AladinLite/doc/API/examples/\' target=\'_blank\'>example usage</a>, explore the <a href=\'https://cds.unistra.fr/help/faq/aladin/\' target=\'_blank\'>FAQ</a> or learn more about the <a href=\'http://aladin.cds.unistra.fr/aladin.gml\' target=\'_blank\'>main app</a>.'"
            ></v-icon>
        </v-col>
    </v-row>
    <!-- Aladin-Lite viewer -->
    <v-row no-gutters>
        <v-col cols="12">
            <div id="explore-aladin-lite" style="width: 100%; height: 100vh;"></div>
        </v-col>
    </v-row>
</template>

<script lang="ts" setup>
import A from 'aladin-lite'
import useStoredTheme from '@/composables/useTheme'
import { useRoute } from 'vue-router'

// get the initial target from the route
const route = useRoute()
let target = ''
let fov = null
if (!route.query.ra || !route.query.dec) {
    // load a default taraget
    target = 'M101'
    fov = 5
} else {
    // load a requested target
    target = `${route.query.ra}, ${route.query.dec}`
    fov = 0.1
}
console.log('target', target)


// mount the stored theme
useStoredTheme()


console.log('route', route.query)

let aladin = null

A.init.then(() => {
    aladin = A.aladin('#explore-aladin-lite', {target: target, fov: fov, projection: "AIT",
    survey: "P/PanSTARRS/DR1/color-z-zg-g", cooFrame: 'ICRSd', showCooGridControl: true,
    showSimbadPointerControl: true, showCooGrid: true, showContextMenu: true});

    // let btn = A.button({
    //             content: 'My button',
    //             classList: ['myButton'],
    //             tooltip: {cssStyle: {color: 'red'}, content: 'Create a moc in pink!', position: {direction: 'top'}},
    //             action(o) {
    //                 aladin.select('poly', p => {
    //                     try {
    //                         let ra = []
    //                         let dec = []
    //                         for (const v of p.vertices) {
    //                             let [lon, lat] = aladin.pix2world(v.x, v.y);
    //                             ra.push(lon)
    //                             dec.push(lat)
    //                         }
    //                         let moc = A.MOCFromPolygon(
    //                             {ra, dec},
    //                             {name: 'poly', lineWidth: 3.0, color: 'pink'},
    //                         );
    //                         aladin.addMOC(moc)
    //                     } catch(_) {
    //                         alert('Selection covers a region out of the projection definition domain.');
    //                     }
    //                 })
    //             }
    //         });

    // let bbtn = A.button({
    //     content: 'Test',
    //     classList: ['testbutton'],
    //     action(o) {
    //         aladin.select('circle', p => {
    //             let [lon, lat] = aladin.pix2world(p.x, p.y);
    //             console.log(p, lon, lat);
    //             var s = aladin.getSize();
  	//             var f = aladin.getFov();
    //             console.log(s, f);
    //             var c1 = f[0]/s[0];
    //             var c2 = f[1]/s[1];
  	//             console.log('pixel scale [deg/pix]', c1, c2);
    //             console.log(lon, lat, c1 * p.r)

    //             var overlay = A.graphicOverlay({color: '#ee2345', lineWidth: 2});
    //             aladin.addOverlay(overlay);
    //             overlay.add(A.circle(lon, lat, c1 * p.r));
    //         })
    //     }

    // })

    // aladin.addUI(btn)
    // aladin.addUI(bbtn)
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