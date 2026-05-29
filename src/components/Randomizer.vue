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

const sdssIds = [54459273, 54414448, 54541664, 54549274, 54716896, 54826702, 54879351, 54913180, 54931220, 55000296, 55021421,
55317723, 55411939, 55494327, 55499439, 55557566, 55746222, 56357859, 57788345, 57846358, 57947429, 58005095,
65779392, 107303838, 55289780, 95669062, 96918220, 65873952, 73723075, 73590837, 54873856, 55264744,
61250417, 61198009, 55430544, 74539159, 67586017, 92551890, 101521627, 110913033, 95803549, 56455313, 79988517,
61094038, 80040652, 80024005, 79977143, 55775322, 79989205, 55759329, 74373053, 80003690, 92603923, 93450223 , 99338706,
101607349, 110633641, 110898813, 120720552, 123515953, 62244601, 62243506]

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