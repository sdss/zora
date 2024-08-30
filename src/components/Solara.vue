<template>
    <div v-if="valid" id="zora-solara">
        <iframe id='iframe' :src=url width="100%" height="600px" title="Solara app running Jdaviz" frameborder="0" ref="iframe"></iframe>
    </div>
    <v-banner v-else type="warning" class='ma-4' color="warning" lines="one" icon="mdi-emoticon-sad"><v-banner-text>{{ errmsg }}</v-banner-text></v-banner>
</template>

<script lang="ts" setup>

import axios from 'axios'
import { ref, onMounted, watch } from 'vue'
import { useTheme } from 'vuetify'


// define which properties are passed in from the parent, i.e. ":xxx"
const props = defineProps<{
    sdssid: string,
    files: Array<string>,
}>()

// set the body attributes for solara popout
let api = import.meta.env.VITE_API_URL + '/solara/'
const vurl = new URL(api)
const pathname = (vurl.pathname.endsWith('/')) ? vurl.pathname : vurl.pathname + '/'
document.body.setAttribute('data-base-url', pathname)
document.body.setAttribute('data-voila-host', vurl.origin)

let iframe = ref(null)
let valid = ref(false)
let errmsg = ref('')
let theme = useTheme()

let url = ref(import.meta.env.VITE_API_URL + `/solara/embed/?release=IPL3&sdssid=${props.sdssid}&files=${props.files.join()}&theme=${theme.global.name.value}`)
console.log('url', url)

async function check_solara() {

    await axios.get(import.meta.env.VITE_API_URL + '/solara/embed/', {withCredentials: true})
        .then((response) => {
            console.log('solara response', response)
            valid.value = true
        })
        .catch((error) => {
            let obj = error.toJSON()
            console.error('solara error', obj)
            if (obj.code == "ERR_NETWORK") {
                errmsg.value = 'Error: Solara network server is down.'
            } else {
                errmsg.value = `Error: ${obj.message}.`
            }
        })
}

// create watcher for the theme
watch(() => theme.global.name.value, (newVal) => {
    console.log('theme change', newVal)
    // watch for theme changes and send request
    if (iframe.value && iframe.value.contentWindow) {
        iframe.value.contentWindow.postMessage({type: 'themeChange', theme: newVal}, '*')
    }
})

onMounted(() => {
    // check the solara server
    check_solara()
})

</script>
