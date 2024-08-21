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
                <pane size="30" min-size="2">
                    <v-data-table sticky density="compact" v-model:sort-by="sortBy" v-model:page="page"
                    v-model:items-per-page="itemsPerPage" item-value="sdss_id" v-model='selected'
                    :items="items" :headers="headers" return-object show-select select-strategy="single">
                    <!-- adds a target page link to the sdss id column -->
                    <template v-slot:item.sdss_id="{ item }">
                        <router-link :to="{ name: 'target', params: { sdss_id: item.sdss_id } }" target="_blank">{{ item.sdss_id }}</router-link>
                    </template>
                    </v-data-table>
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
import { ref, watch, computed } from 'vue'
import axiosInstance from '@/axios'
import { Splitpanes, Pane } from 'splitpanes'
import 'splitpanes/dist/splitpanes.css'

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
let selected = ref([])
let page = ref(1)
let itemsPerPage = ref(10)
let sortBy = ref([])
let items = ref([])
let headers = ref([])

// const headers = ref([
//   { title: 'sdss_id', key: 'sdss_id', type: 'number' },
//   { title: 'RA', key: 'ra_sdss_id', type: 'number' },
//   { title: 'Dec', key: 'dec_sdss_id', type: 'number' },
//   { title: 'catalogid21', key: 'catalogid21', type: 'number' },
//   { title: 'catalogid25', key: 'catalogid25', type: 'number' },
//   { title: 'catalogid31', key: 'catalogid31', type: 'number' },
//   { title: 'in_boss', key: 'in_boss', type: 'boolean' },
//   { title: 'in_apogee', key: 'in_apogee', type: 'boolean' },
//   { title: 'in_astra', key: 'in_astra', type: 'boolean' }])

//  headers.value = Object.entries(data.value[0]).map((item)=> ({title: store.get_field_from_db(item[0], 'display_name'), key: item[0], type: typeof item[1], description: store.get_field_from_db(item[0], 'description')}))


const sortItems = (itemList, sortBy) => {
    // manually sort the data table

    console.log('sortby', sortBy)
    // if sortBy is empty, return the original array
    if (sortBy.length === 0) {
        return itemList
    }

    // sorting of array
    return itemList.slice().sort((a, b) => {
        const sortDesc = sortBy.order === "desc"
        const aValue = a[sortBy.key]
        const bValue = b[sortBy.key]

        let alt = sortDesc ? 1 : -1
        let agt = sortDesc ? -1 : 1
        if (sortBy.key == 'dec_sdss_id') {
            alt = sortDesc ? -1 : 1
            agt = sortDesc ? 1 : -1
        }

        if (aValue < bValue) return alt;
        if (aValue > bValue) return agt;
        return 0
    })
}


watch(selected, (newVal) => {
        // Here we watch on selectedDither and scroll to the page where the selected dither is located

        // First, checking whether dither is selected, since changing of LVMStore.selectedDithers
        // can be caused by deselecting the dither
        if (newVal && newVal.length > 0) {

            let itemList = items.value

            console.log('sort by', sortBy.value)

            // first check whether sorting is neccessary and sort if needed
            if (sortBy.value.length > 0) {
                itemList = sortItems(itemList, sortBy.value[0])
            }

            // find index in (sorted) list of dithers
            const itemIdx = itemList.findIndex(item => item.sdss_id === newVal[0].sdss_id)

            // find page of selected dither
            //console.log('item index', itemIdx)
            //console.log('row', itemList[itemIdx])
            //console.log('math', itemIdx, itemsPerPage.value, itemIdx / itemsPerPage.value)
            const pg = Math.floor(itemIdx / itemsPerPage.value) + 1
            page.value = pg
            console.log('page', pg)

            let catalog = store.aladin.view.catalogs.find(item => item.name=='Cone Search Results')
            let sources = catalog.sources
            let obj = sources.filter(item => (item.data && item.data.sdss_id == newVal[0].sdss_id))
            if (obj.length > 0) {
                catalog.deselectAll()
                obj[0].select()
            }
            console.log('a catalog', obj)
        } else {
            let catalog = store.aladin.view.catalogs.find(item => item.name=='Cone Search Results')
            catalog.deselectAll()
        }
    }, {deep: true})


let aladin: any = null

A.init.then(() => {
    aladin = A.aladin('#explore-aladin-lite',
    {target: target, fov: fov, projection: "AIT",
    survey: "P/PanSTARRS/DR1/color-z-zg-g", cooFrame: 'ICRSd', showCooGridControl: true, showFullscreenControl: false,
    showSimbadPointerControl: true, showCooGrid: true, showContextMenu: true, showSettingsControl: true});

    store.aladin = aladin

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

    //aladin.addUI(btn)
    aladin.addUI(csbtn)

    // Handle clicks on different objects
    let objClicked: any = null
    aladin.on('objectClicked', (object) => {
        // run when an object is selected
        if (object) {
            // store the object and select it
            objClicked = object
            object.select()
            // add the object selection to table selection
            selected.value = [object.data]

        } else {
            // run when background is selected
            // deselect the objects
            objClicked.deselect()
            objClicked.catalog.deselectAll()
            // deselect everything in the table
            selected.value = []

        }
    })

});


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

        // add the results to a new Aladin catalog
        addCatalog(response.data, aladin, 'Cone Search Results', 18)

        // add the results to the table
        items.value=response.data
        headers.value = Object.entries(response.data[0]).map((item)=> ({title: item[0], key: item[0], type: typeof item[1], description: store.get_field_from_db(item[0], 'description')}))


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
}
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