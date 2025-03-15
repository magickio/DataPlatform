import { createSSRApp } from 'vue'
import App from './App.vue'
import { i18n } from './composables/useI18n'
import 'uno.css'

export function createApp() {
  const app = createSSRApp(App)
  app.use(i18n)
  return {
    app,
  }
}
