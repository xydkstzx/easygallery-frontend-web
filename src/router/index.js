import Home from '@/views/Home.vue'
import Ucenter from '@/views/ucenter/Ucenter.vue'
import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: '首页',
      component: Home,
    },
    {
      path: '/ucenter/:userId',
      name: '个人中心',
      component: Ucenter,
    },
  ],

})

export default router
