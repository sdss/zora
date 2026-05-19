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
import { useAppStore } from '@/store/app'

// get the application state store
const store = useAppStore()

// define which properties are passed in from the parent, i.e. ":xxx"
const props = defineProps<{
    sdssid: string,
    files: Array<string>,
    first: string
}>()

// set the body attributes for solara popout
let api = import.meta.env.VITE_API_URL + '/solara/'
const vurl = new URL(api)
const pathname = (vurl.pathname.endsWith('/')) ? vurl.pathname : vurl.pathname + '/'
document.body.setAttribute('data-base-url', pathname)
document.body.setAttribute('data-voila-host', vurl.origin)

let iframe = ref<HTMLIFrameElement | null>(null)
let valid = ref(false)
let errmsg = ref('')
let theme = useTheme()

// encode the file paths for any + in the filename, e.g. apStar
const urienc = props.files.map(encodeURIComponent)
const urifirst = encodeURIComponent(props.first)
let url = ref(import.meta.env.VITE_API_URL + `/solara/embed/?release=${store.release}&sdssid=${props.sdssid}&files=${urifirst}&theme=${theme.global.name.value}`)
console.log('url', url)

// set target origin for postMessages
const targetOrigin = new URL(url.value).origin

async function check_solara() {

    await axios.get(import.meta.env.VITE_API_URL + '/solara/readyz', {withCredentials: true})
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
        iframe.value.contentWindow.postMessage({type: 'themeChange', theme: newVal}, targetOrigin)

    }
})

function postFiles() {
    // post the files to the solara server
    if (props.files && iframe.value && iframe.value.contentWindow) {
        const files = props.files.map((f) => String(f))
        iframe.value.contentWindow.postMessage({type: 'updateFiles', files: files}, targetOrigin)
    }
}

window.addEventListener('message', (event) => {
    // event listener from the solara backend

    if (event.origin !== targetOrigin) {
        console.warn('Received message from unknown origin:', event.origin)
        return
    }
    console.log('Received message from Solara iframe:', event.data)

    // backend has initialized enough to message parent; send files now
    if (event.data === 'ready') {
        postFiles()
    }
})


onMounted(() => {
    // check the solara server
    check_solara()
})

</script>
