<template>
  <div class="randomizer d-flex flex-wrap align-center justify-center ga-4">
    <span class="text-h6">Don't know where to start? Try a random target:</span>

    <v-btn-toggle
      v-model="random"
      class="randomizer-toggle"
      group
      rounded="0"
      divided
      border
      density="comfortable"
    >
      <v-btn class="randomizer-button" value="solo" @click="navigateToRandomSoloTarget"
      v-tippy="{content: 'View random single target', placement: 'top'}"
>
        Solo
      </v-btn>

      <v-btn class="randomizer-button" value="sky" :disabled="skyLoading" @click="navigateToRandomSkyTarget"
      v-tippy="{content: 'View all random targets on sky', placement: 'top'}"
>
        On Sky
        <v-progress-circular
          v-if="skyLoading"
          indeterminate
          size="16"
          width="2"
          class="ml-2"
        />
      </v-btn>
    </v-btn-toggle>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import axiosInstance from '@/axios'
import { useAppStore } from '@/store/app'

const random = ref(null)
const rows = ref<any[]>([])
const skyLoading = ref(false)
const router = useRouter()
const store = useAppStore() as ReturnType<typeof useAppStore> & {
  release: string
  get_auth_hdr: () => Record<string, string>
  set_result_data: (data: any[]) => void
}

const sdssIds = [54414448, 54541664, 54549274, 54716896, 54826702, 54879351, 54913180, 54931220, 55000296, 55021421,
55317723, 55411939, 55494327, 55499439, 55557566, 55746222, 56357859, 57788345, 57846358, 57947429, 58005095,
58058312, 58059213, 58362035, 58419581, 58444122, 58501455, 59205041, 62531202, 63733541, 63740111, 63946201,
64874700, 64882762, 65108171, 65122751, 65148689, 65216542, 65295849, 65518291, 65577706, 65823065, 65857158, 54459273
]

function getRandomSdssId(): string {
  const index = Math.floor(Math.random() * sdssIds.length)

  return String(sdssIds[index])
}

function navigateToRandomSoloTarget(): void {
  const sdssId = getRandomSdssId()

  void router.push({ name: 'target', params: { sdss_id: sdssId } })
}

function getCacheKey(release: string, text: string): string {
  return `randomizer:${release}:${text}`
}

function getCachedRows(cacheKey: string): any[] | null {
  try {
    const raw = sessionStorage.getItem(cacheKey)
    if (!raw) {
      return null
    }
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : null
  } catch {
    return null
  }
}

function setCachedRows(cacheKey: string, data: any[]): void {
  try {
    sessionStorage.setItem(cacheKey, JSON.stringify(data))
  } catch {
    // ignore storage failures and continue without persistent cache
  }
}

async function navigateToRandomSkyTarget(): Promise<void> {
  if (skyLoading.value) {
    return
  }

  skyLoading.value = true
  try {
    const cacheKey = getCacheKey(store.release, 'random_onsky')
    const cached = getCachedRows(cacheKey)
    if (cached) {
      console.log('Using cached random sky targets')
      rows.value = cached
      store.set_result_data(rows.value)
      await router.push({ name: 'explore' })
      return
    }

    const headers = {
      'Content-Type': 'application/json',
      ...store.get_auth_hdr()
    }
    const payload = {
      idtype: 'sdssid',
      sdss_id_list: sdssIds,
      release: store.release
    }
    console.log('Using new random sky targets')

    const response = await axiosInstance.post('/query/sdssid', payload, { headers })
    const data = ('data' in response.data ? response.data.data : response.data) as any[]
    rows.value = data
    setCachedRows(cacheKey, data)

    store.set_result_data(rows.value)
    await router.push({ name: 'explore' })
  } finally {
    skyLoading.value = false
  }
}

</script>

<style scoped>
.randomizer {
  width: 100%;
}

.randomizer-toggle {
  align-self: center;
}

.randomizer-button:hover {
  background-color: rgb(var(--v-theme-primary));
  color: rgb(var(--v-theme-on-primary));
}

</style>