import { onMounted } from 'vue'
import { useTheme } from 'vuetify'
import { useAppStore } from '@/store/app'

export default function useStoredTheme() {
  const theme = useTheme()
  const store = useAppStore()

  onMounted(() => {
    const storedTheme = store.theme
    if (storedTheme) {
      theme.global.name.value = storedTheme
    }
  })

  return theme
}