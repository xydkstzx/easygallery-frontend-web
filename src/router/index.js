import Home from '@/views/Home.vue'
import Ucenter from '@/views/ucenter/Ucenter.vue'
import ScrapingPicture from '@/views/picture/ScrapingPicture.vue'
import { createRouter, createWebHistory } from 'vue-router'
import MySpace from '@/views/space/MySpace.vue'

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
    {
      path: '/picture/scraping',
      name: '抓取图片',
      component: ScrapingPicture,
    },
    {
      path: '/space/mySpace',
      name: '抓取图片',
      component: MySpace,
    },
  ],

})

export default router
