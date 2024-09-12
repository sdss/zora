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
            <splitpanes>
                <!-- aladin-lite pane -->
                <pane size="70">
                    <div id="explore-aladin-lite" style="width: 100%; height: 100vh;"></div>
                </pane>
                <!-- data table pane -->
                <pane size="30" min-size="2" v-if="tabs.length">

                <v-tabs
                    v-model="tab"
                    :items="tabs"
                    align-tabs="start"
                    height="60"
                    slider-color="#f78166"
                    >
                    <!-- slot for adding remove tab button to tab -->
                    <template v-slot:tab="{ item }">
                        <v-tab
                        :key="item.value"
                        :value="item.value"
                        slim
                        rounded="0"
                        class="text-none"
                        @click="gotoTab(item)"
                        >{{ item.text }}<v-icon @click.stop="removeTab(item)">mdi-close</v-icon>
                        </v-tab>
                    </template>

                    <!-- data table -->
                    <template v-slot:item="{ item }">
                        <v-tabs-window-item :value="item.value" class="pa-0">
                            <catalog-table :ref="el => childRefs[item.value] = el" :key="item.value" :id="item.value" :items="item.items" :catalog="item.catalog"/>
                        </v-tabs-window-item>
                    </template>
                </v-tabs>

                </pane>
            </splitpanes>
        </v-col>
    </v-row>
</template>

<script lang="ts" setup>
import A from 'aladin-lite'
import useStoredTheme from '@/composables/useTheme'
import { useRoute } from 'vue-router'
import { useAppStore } from '@/store/app'
import { ref, onMounted, nextTick, watch } from 'vue'
import axiosInstance from '@/axios'
import { Splitpanes, Pane } from 'splitpanes'
import 'splitpanes/dist/splitpanes.css'
import CatalogTable from '@/components/CatalogTable.vue'

// get the store
const store = useAppStore()

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

// mount the stored theme
useStoredTheme()

// set parameters
let tab = ref(1)
let tabs = ref([])
const childRefs = ref([])
let aladin: any = null
const aladinReady = ref(false)
let objectSelected = ref(false)

// compute average of an array
const average = array => array.reduce((a, b) => JSON.parse(a) + JSON.parse(b)) / array.length;

function gotoTab(item) {
    // go to the tab's data average RA, Dec position
    const ra = average(item.items.map(ii => ii.ra_sdss_id))
    const dec = average(item.items.map(ii => ii.dec_sdss_id))
    store.aladin.gotoRaDec(ra, dec)
}

async function setupAladin() {
    return new Promise<void>((resolve) => {
    // set up the main aladin lite viewer
    A.init.then(() => {
        aladin = A.aladin('#explore-aladin-lite',
        {target: target, fov: fov, projection: "AIT",
        survey: "P/PanSTARRS/DR1/color-z-zg-g", cooFrame: 'ICRSd', showCooGridControl: true, showFullscreenControl: false,
        showSimbadPointerControl: true, showCooGrid: true, showContextMenu: true, showSettingsControl: true});


        // UI button for SDSS cone search
        let csbtn = A.button({
            // this webfont icon usage is a hack; not recommended but will work
            content: '<span class="v-icon v-icon--size-large mdi mdi-cone"></span>',
            classList: ['conesearch_button'],
            tooltip: {content:'Perform a cone search for SDSS targets'},
            size: 'medium',
            action(o) {
                // button action to draw a selection circle
                aladin.select('circle', async p => {
                    // get the circle center ra, dec and radius
                    let [lon, lat] = aladin.pix2world(p.x, p.y);
                    var s = aladin.getSize();
                    var f = aladin.getFov();
                    var c1 = f[0]/s[0];
                    var c2 = f[1]/s[1];
                    console.log('pixel scale [deg/pix]', c1, c2);
                    console.log('ra, dec, radius in degree', lon, lat, c1 * p.r)

                    // add the circle overlay
                    var overlay = A.graphicOverlay({color: '#ee2345', lineWidth: 2});
                    aladin.addOverlay(overlay);
                    overlay.add(A.circle(lon, lat, c1 * p.r));

                    // perform the cone search
                    await coneSearch(lon, lat, c1 * p.r, 'degree', aladin)

                    // remove the circle overlay
                    aladin.removeOverlay(overlay);
                })
            }

        })

        aladin.addUI(csbtn)

        // Handle clicks on different objects
        let objClicked: any = null
        aladin.on('objectClicked', (object) => {
            nextTick()
            // run when an object is selected
            if (object) {
                console.log('object clicked', object)
                // store the object and select it
                objectSelected.value = true
                objClicked = object
                object.select()
                tab.value = object.catalog.tabid

                // add the object selection to table selection
                childRefs.value[object.catalog.tabid].updateSelection([object.data])

            } else {
                // run when background is selected
                // deselect the objects
                console.log('background clicked', objClicked)
                objectSelected.value = false
                objClicked.deselect()
                objClicked.catalog.deselectAll()
                // deselect everything in all table
                childRefs.value.forEach(table => table && table.updateSelection([]))

            }
        })

        // handle all clicks
        aladin.on('click', (object) => {
            nextTick()
            // when table object is selected and clicking background, deselect all objects
            if (object && !objectSelected.value) {
                childRefs.value.forEach(table => table && table.updateSelection([]))
            }
        })

        store.aladin = aladin
        aladinReady.value = true
        resolve()
    });
})
}

async function coneSearch(ra: string, dec: string, radius: number, units: string, aladin: any): Promise<void> {
    // perform the cone search API call

    const endpoint = `/query/cone?ra=${ra}&dec=${dec}&radius=${radius}&units=${units}`
    await axiosInstance.get(endpoint)
        .then(response => {
        // Handle the response data
        // if no results, do nothing
        if (response.data.length == 0) {
            return
        }

        // add the results to a new tab
        add_tab(response.data, 'Cone Search')

        })
        .catch(error => {
        // Handle the error
        console.error('API call error:', error)
        });
}

function addCatalog(data: Array<object>, aladin: any, name: string, size: number = 18) {
    // add a new aladin catalog of sources

    var cat = A.catalog({name: name, sourceSize: size, onClick: 'showPopup'});
    aladin.addCatalog(cat);

    // test marker with popup
    //cat.addSources([A.marker(315.78, -3.2, {popupTitle: 'Stuff', popupDesc: 'This is a test'})]);

    // add the data as new sources
    // we hide the default aladin-table for catalogs since it is useless for now
    data.forEach((targ) => {
        cat.addSources([A.source(targ.ra_sdss_id, targ.dec_sdss_id, targ)]);
    })

    return cat
}


async function removeTab(item) {
    // remove a tab from the list of tabs

    // get the tab index
    const index = tabs.value.findIndex(tab => tab.value === item.value);

    if (index !== -1) {
        // Remove the item from the items array
        tabs.value.splice(index, 1);
        tab.value = 1

        // Remove the corresponding ref from childRefs
        delete childRefs.value[index];

        // Reset ids and tabid to be sequential starting from 1
        tabs.value.forEach((item, idx) => {
            const oldTabId = item.catalog.tabid;
            item.value = idx + 1;
            item.catalog.tabid = idx + 1;

            // Update the childRefs object with the new tabid
            childRefs.value[item.catalog.tabid] = childRefs.value[oldTabId];
            delete childRefs.value[oldTabId];
        });
    }
    // let the Vue DOM update
    await nextTick()

    // remove the alading catalog
    store.aladin.removeOverlay(item.catalog)

}

async function add_tab(data: Array<object>, title: string) {
    // add new tabular and catalog data

    // get a unique name for the catalog
    let name = store.aladin.view.makeUniqLayerName(title)

    // add the results to a new Aladin catalog
    let cat = addCatalog(data, store.aladin, name, 18)

    await nextTick()
    const newIdx = tabs.value.length ? Math.max(...tabs.value.map(item => item.value)) + 1 : 1
    cat.tabid = newIdx

    // add a new tab entry
    tabs.value.push({
        text: name,
        value: newIdx,
        items: data,
        headers: Object.entries(data).map((item)=> ({title: item[0], key: item[0], type: typeof item[1], description: store.get_field_from_db(item[0], 'description')})),
        catalog: cat})

    // update the active tab
    tab.value = tabs.value.length
}

async function check_targets() {
    // check for targets pushed from the search results
    console.log('checking targets')
    if (store.result_targs.length === 0) {
        console.log('No targets to check')
        return
    }

    // add the search results to a new tab
    await add_tab(store.result_targs, 'Search Results')

    // go to the tab
    await nextTick()
    gotoTab(tabs.value[tab.value-1])
    store.aladin.setFoV(0.1)

    // reset the search results
    store.result_targs.value = []

}

onMounted(async () => {
    // wait for aladin to set up
    await setupAladin()

    // wait a tick before we check for target data to load data, to ensure aladin is fully set up
    await nextTick(async() => {
        setTimeout(async() => {
            // Check targets and load catalog data here
            await check_targets();
        }, 500)
    });

})
</script>

<style>
.myButton {
    position: absolute;
    top: 15rem;
    left: 0;

    background-color: pink;
}

.conesearch_button {
    position: absolute;
    top: 12.6rem;
    left: 0.2rem;
}

.aladin-table {
    /* the aladin catalog table, hide this for now */
    display: none;
    position: absolute;
    bottom: 6rem;
}

.aladin-popupTitle {
    color: black;
}

.aladin-popupText {
    color: black;
}

.splitpanes__splitter {background-color: #ccc;position: relative;}
.splitpanes__splitter:before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  transition: opacity 0.4s;
  background-color: rgba(243, 229, 248, 0.4);
  opacity: 0;
  z-index: 1;
}
.splitpanes__splitter:hover:before {opacity: 1;}
.splitpanes--vertical > .splitpanes__splitter:before {left: -10px;right: -10px;height: 100%;}
.splitpanes--horizontal > .splitpanes__splitter:before {top: -10px;bottom: -10px;width: 100%;}
</style>