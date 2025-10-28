import { createApp } from 'vue'
import App from './App.vue'
import './assets/bootstrap.min.css'
import './assets/styles.scss'
import "@popperjs/core";
import "bootstrap";
import './polyfils'
import "../normalize.css"
import router from './router';
import { Popup } from 'vant';
import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'
import store from './store'
import './plugin/vconsole.js'
import i18n from './plugin/i18n'
import './plugin/metamask'

const pinia = createPinia()
pinia.use(piniaPluginPersistedstate)
const app = createApp(App);

app.use(Popup).use(router).use(pinia).use(i18n);
app.mount('#app')
