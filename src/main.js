import './assets/bass.scss'
import "./assets/icon/iconfont.css"
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'

import zhCn from 'element-plus/es/locale/lang/zh-cn'
import App from './App.vue'
import router from './router'

import Dialog from './components/Dialog.vue' 


import Message from '@/utils/Message'
import Request from '@/utils/Request'
import { Api } from './utils/Api.js'

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(ElementPlus, {
  locale: zhCn,
})


app.component('Dialog', Dialog)
app.config.globalProperties.Message = Message
app.config.globalProperties.Request = Request
app.config.globalProperties.Api = Api

app.mount('#app')