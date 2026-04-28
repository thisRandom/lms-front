import { createApp } from 'vue'
import { createPinia } from 'pinia'

import '@arco-design/web-vue/dist/arco.css';
import App from './App.vue'
import ArcoVue from '@arco-design/web-vue';
import router from './router'
import permission from '@/directives/permission';

const app = createApp(App)

app.use(ArcoVue);
app.use(createPinia())
app.use(router)
app.directive('permission', permission);
app.mount('#app')
