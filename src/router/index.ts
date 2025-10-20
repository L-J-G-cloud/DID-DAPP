import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'
import { useStore } from '@/store/store'
import { storeToRefs } from 'pinia';
const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    name: 'Home',
    component: () => import('@/view/home/index.vue')
  },
  {
    path: '/register',
    name: 'register',
    component: () => import('@/view/register/index.vue')
  },
  {
    path: '/donor',
    name: 'donor',
    component: () => import('@/view/donor/index.vue')
  },
]

const router = createRouter({   
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from, next) => {
 
  const store = useStore()
  console.log(store.is_reg,store.token)
  if(to.path!=='/'&&to.path!=='/node-sub'&&to.path!=='/registrationform'&&to.path!=='/donor'&&store.token){
    next('/');
  }
  next();
})
export default router
