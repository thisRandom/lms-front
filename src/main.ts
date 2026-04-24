import { createApp } from 'vue'
import { createPinia } from 'pinia'

import '@arco-design/web-vue/dist/arco.css';
import App from './App.vue'
import ArcoVue from '@arco-design/web-vue';
import router from './router'
import { setupPermissionDirective } from '@/directives/permission'

const app = createApp(App)

app.use(ArcoVue);
app.use(createPinia())
app.use(router)
setupPermissionDirective(app)

app.mount('#app')
