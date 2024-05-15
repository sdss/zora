<template>
    <div v-if="valid" id="zora-solara">
        <iframe id='iframe' :src=url width="100%" height="600px" title="Solara app running Jdaviz" frameborder="0"></iframe>
    </div>
    <v-banner v-else type="warning" class='ma-4' color="warning" lines="one" icon="mdi-emoticon-sad"><v-banner-text>{{ errmsg }}</v-banner-text></v-banner>
</template>

<script lang="ts" setup>

import axios from 'axios'
import { ref, onMounted } from 'vue'


// define which properties are passed in from the parent, i.e. ":xxx"
const props = defineProps<{
    sdssid: string,
    files: Array<string>,
}>()


let valid = ref(false)
let errmsg = ref('')

import.meta.env.VITE_API_URL + '/info/database'
let url = ref(import.meta.env.VITE_API_URL + `/solara/embed/?release=IPL3&sdssid=${props.sdssid}&files=${props.files.join()}`)
console.log('url', url)

async function check_solara() {

    await axios.get(import.meta.env.VITE_API_URL + '/solara', {withCredentials: true})
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

onMounted(() => {
    // check the solara server
    check_solara()
})

</script>
