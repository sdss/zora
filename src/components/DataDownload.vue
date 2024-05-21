<template>
    <v-menu location="bottom">
      <template v-slot:activator="{ props }">
        <v-btn color="secondary-darken-1" rounded="0" class="my-0" v-bind="props"
         v-tippy="'Download data files for this target'">
          Download Data
          <v-icon right>mdi-menu-down</v-icon>
        </v-btn>
      </template>

      <v-list variant="tonal">
        <v-list-item v-for="(item, index) in dloptions" :key="index" @click.stop="showDialog(item.dialog, item.code)">
          <v-list-item-title>{{item.title}}</v-list-item-title>
        </v-list-item>
      </v-list>

      <v-dialog v-model="dialog" max-width="800px">
        <v-card>
          <v-card-title>{{ dialogTitle }}</v-card-title>
          <v-card-subtitle>Authentication setup may be needed</v-card-subtitle>
          <v-card-text variant='tonal' style="overflow-x: auto;">
            <pre><code>{{ codeSnippet }}</code></pre>
          </v-card-text>
          <v-card-actions>
            <v-btn prepend-icon="mdi-content-copy" color="primary" @click="copyToClipboard(codeSnippet)">
              <template v-slot:prepend>
                <v-icon :color="copied ? 'success' : 'primary'" :icon="copied ? 'mdi-check' : 'mdi-content-copy'"></v-icon>
                </template>
              Copy to Clipboard</v-btn>
            <v-spacer></v-spacer>
            <v-btn prepend-icon='mdi-close' color="primary" @click="dialog = false">Close</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </v-menu>
</template>

<script setup lang="ts">
  import { ref, defineProps, watch } from 'vue';
  import { useAppStore } from '@/store/app'

const store = useAppStore()

// define which properties are passed in from the parent, i.e. ":xxx"
const props = defineProps<{
    files: Array<string>
}>()

  const dialog = ref(false);
  const dialogTitle = ref('')
  const codeSnippet = ref('')
  let copied = ref(false)

  // data to populate the dropdown menu with
let dloptions = [
  { key: 'http', title: 'With wget', value: 'http', dialog: 'Download via Http', code: '' },
  { key: 'rsync', title: 'With rsync', value: 'rsync', dialog: 'Download using Rsync', code: '' },
  { key: 'python', title: 'With Python', value: 'python', dialog: "Download with sdss_access", code: '' }
]

function showDialog(title: string, code: string) {
    // show the dialog window
    copied.value = false
    dialog.value = true;
    dialogTitle.value = title;
    codeSnippet.value = code;
}

function copyToClipboard(text: string) {
  // copy the data download text to the clipboard
  navigator.clipboard.writeText(text).then(() => {
    console.log('Text copied to clipboard');
    copied.value = true
  }).catch(err => {
    console.error('Failed to copy text: ', err);
  })
}

function convertPath(path: string, key: string) {
    // conver the filename path to a url
    const newPath = path.split("/sas/")[1]
    const route = (path.includes('ipl') || path.includes('work')) ? 'sdss5' : 'sdss'
    const user = (path.includes('ipl') || path.includes('work')) ? 'sdss5@' : ''

    const base = (key == 'http') ? `https://data.${route}.org/sas/` : `rsync://${user}dtn.sdss.org/`
    return `${base}${newPath}`
}

function generateCode(key: string) {
    // generate the code snippets for the download menu options
    let urls = props.files.map(x => convertPath(x, key))

    let code = ''
    switch (key) {
      case 'http':
        code = `wget ${urls.join(' ')}`
        break
      case 'rsync':
        code = urls.map(x => `rsync -avz --no-motd ${x} .`).join(" \n")
        break;
      case 'python':
        code = `
          from sdss_access import Access
          access = Access(release="${store.release}")
          access.remote()
          urls = ${JSON.stringify(urls)}
          for url in urls:
              access.add_file(url, input_type='url')
          access.set_stream()
          access.commit()`
          break
    }
    return code
}


watch(() => props.files, () => {
  // Regenerate download options whenever the files prop changes
  dloptions.forEach(option => {
    option.code = generateCode(option.key);
  });
}, { immediate: true });

</script>
