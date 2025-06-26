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
                    <div id="explore-aladin-lite" style="width: 100%; height: 100vh;">
                        <!-- moc vuetify ui component -->
                        <div class="moc-content" style="width:300px">
                            <v-list v-if='short' max-height="200px" slim density="compact" variant='plain' id="moclist">
                                <v-list-item
                                v-for="(item, index) in mocs"
                                :key="index"
                                >
                                <!-- <v-btn rounded="0" variant="text" color='white' @click="get_moc(item)">{{ item }}</v-btn> -->
                                <v-btn v-tippy="'Load catalog from '+get_source(item)" rounded="0" variant="text" color='white' @click="get_hipscat(item)">{{ item }}</v-btn>

                                </v-list-item>
                            </v-list>
                            <!-- temp conditional hack for testing -->
                            <v-list v-else max-height="200px" slim density="compact" variant='plain' id="moclist">
                                <v-list-item v-for="(item, index) in mocs" :key="index" class="align-center">
                                    <v-row align="center" no-gutters class="w-100">
                                        <v-col cols="auto">
                                            <div class="text-left text-button">{{ item }}</div>
                                        </v-col>
                                        <v-col cols="auto" class="ml-auto">
                                            <v-btn-toggle>
                                                <v-btn v-tippy="'Add sky footprints'" icon="mdi-shape-polygon-plus" variant="text" color="white" @click="get_moc(item)"></v-btn>
                                                <v-btn v-tippy="'Add hips source catalog'" icon="mdi-star-plus-outline" variant="text" color="white" @click="get_hipscat(item)"></v-btn>
                                            </v-btn-toggle>
                                        </v-col>
                                    </v-row>
                                </v-list-item>
                            </v-list>
                        </div>
                    </div>
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
import HiPSList from '@/assets/aladinDefaultHipsList.js'

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
let short = ref(true) // temporary setting to trial both
let mocs = ref([])
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
        showSimbadPointerControl: true, showCooGrid: true, showContextMenu: true, showSettingsControl: true,
        hipsList: HiPSList.DEFAULT});

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
                    await coneSearch(lon, lat, c1 * p.r, 'degree')

                    // remove the circle overlay
                    aladin.removeOverlay(overlay);
                })
            }

        })

        aladin.addUI(csbtn)

        // Define the moc ui box
        let mocbox = A.box({
            header: {
                title: "SDSS Sky Catalogs",
            },
            // Adding a CSS class allowing you to position your window on the aladin lite view
            classList: ['mocBox'],
            //content: "This is the content of my window<br/> I can write proper html",
            content: document.querySelectorAll('.moc-content')[0],
        })
        mocbox._hide();
        aladin.addUI(mocbox)

        // Define the button that toggles the box
        let mocBtn = A.button({
            content: '<span class="v-icon v-icon--size-large mdi mdi-blur-radial"></span>',
            size: 'medium',
            classList: ['mocBtn'],
            tooltip: {content:'Display SDSS Sky Coverage'},
            action(o) {
                mocs.value = get_mocs()
                if (mocbox.isHidden) {
                    mocbox._show({
                    })
                } else {
                    mocbox._hide()
                }
            }
        });

        aladin.addUI(mocBtn)

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
                // only trigger if there is a tab
                if (object.catalog.tabid) {
                    tab.value = object.catalog.tabid
                    // add the object selection to table selection
                    childRefs.value[object.catalog.tabid].updateSelection([object.data])
                }

            } else {
                // run when background is selected
                // deselect the objects
                console.log('background clicked', objClicked)
                objectSelected.value = false
                objClicked.deselect()
                // only trigger if there is a tab
                if (objClicked.catalog.tabid) {
                    objClicked.catalog.deselectAll()
                    // deselect the object in the table
                    childRefs.value.forEach(table => table && table.updateSelection([]))
                }

                // close any popup windows
                objClicked.popup.hide()
            }
        })

        // handle all clicks
        aladin.on('click', (object) => {
            nextTick()
            // when table object is selected and clicking background, deselect all objects
            if (object && !objectSelected.value) {
                childRefs.value.forEach(table => table && table.updateSelection([]))
            }
            mocbox._hide()
        })

        store.aladin = aladin
        aladinReady.value = true
        resolve()
    });
})
}

async function get_mocs() {
    // get the list of available MOCs
    await axiosInstance.get('mocs/list')
        .then(response => {
        // Handle the response data
        console.log('mocs', response.data)
        // remove the work releases
        let data = response.data.filter((moc: string) => !moc.startsWith('sdsswork'))

        // remove the IPLs if a user is not logged in
        if (!store.logged_in) {
            data = data.filter((moc: string) => !moc.startsWith('ipl'))
        }

        // sort the moc entries by IPL -> DR -> rest
        data.sort((a, b) => {
            const getPriority = str => {
                if (str.startsWith('ipl')) return 2
                if (str.startsWith('dr')) return 1
                return 0
            };

            const getNumber = str => {
                const match = str.match(/(?:ipl|dr)(\d+)/)
                return match ? parseInt(match[1], 10) : 0
            };

            const priorityDiff = getPriority(b) - getPriority(a)
            if (priorityDiff !== 0) return priorityDiff
            return getNumber(b) - getNumber(a)
        })

        mocs.value = data
        })
        .catch(error => {
        // Handle the error
        console.error('API call error:', error)
        });
}

function get_moc(item) {
    // get the MOC for the selected item
    let [release, survey] = item.split(':')

    let url = import.meta.env.VITE_API_URL + `/mocs/fits?survey=${survey}&release=${release}`
    var moc = A.MOCFromURL(url,
                {lineWidth: 3, name: `${survey}-moc`});
                store.aladin.addMOC(moc);
}

function get_hipscat(item) {
    // get the HIPS catalog for the selected item
    let [release, survey] = item.split(':')

    let url = import.meta.env.VITE_API_URL + `/static/mocs/${release}/${survey}`
    var hips = A.catalogHiPS(url, {onClick: 'showPopup', name: survey, sourceSize: 10});
    aladin.addCatalog(hips);
}

function get_source(item) {
    // get a source catalog name for the moc survey item
    let hipscat = {"bhm": "spAll",
                "mwm": "mwmTargets",
                "eboss": "spAll-dr17",
                "apogee": "allStar-dr17",
                "manga": "drpall",
                "mastar": "drpall",
                "allspec": "allspec"}
    let [release, survey] = item.split(':')
    return hipscat[survey]
}

async function coneSearch(ra: string, dec: string, radius: number, units: string): Promise<void> {
    // perform the cone search API call

    const endpoint = `/query/cone?ra=${ra}&dec=${dec}&radius=${radius}&units=${units}&release=${store.release}`
    await axiosInstance.get(endpoint, {headers: store.get_auth_hdr()})
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

function setShape(source) {
    // set the shape of the source based on its property
    if (source.data.in_boss && !source.data.in_apogee ) {
        // BHM-only
        return 'circle'
    } else if (!source.data.in_boss && source.data.in_apogee ) {
        // MWM-only
        return 'square'
    } else if (source.data.in_boss && source.data.in_apogee && source.data.in_astra) {
        // BHM-MWM-Astra
        return 'triangle'
    } else {
        // Astra DR17-processed
        return 'cross'
    }
}

function addCatalog(data: Array<object>, aladin: any, name: string, size: number = 18) {
    // add a new aladin catalog of sources

    var cat = A.catalog({name: name, sourceSize: size, onClick: 'showPopup', shape: setShape});
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
    console.log('aladin ready', store.aladin)

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

#moclist {
    background-color: rgba(0,0,0,0.5);
}

.mocBtn {
    position: absolute !important;
    top: 15rem;
    left: 0.2rem;
}

.mocBox {
    position: absolute;
    top: 15rem;
    left: 2.5rem;
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

.aladin-popup-container {
    display: block;
    max-width: 25rem;      /* limit max size */
    min-width: 14rem;      /* reasonable minimum */
    width: auto !important;
    overflow-x: visible;   /* let contents expand naturally */
    padding: 0.5rem 1rem;  /* optional: nicer spacing */
}

.aladin-popupText .aladin-marker-measurement > table {
    width: 100%;           /* table fills popup width */
    display: table;        /* default table display */
    table-layout: auto;    /* natural column sizing */
    overflow-x: auto;      /* horizontal scroll if needed */
    word-break: break-all; /* only if long strings break layout */
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