import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'
import { useStore } from '@/store/store'
import { storeToRefs } from 'pinia';
const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    redirect: '/dashboard'
  },
  {
    path: '/connect',
    name: 'connect',
    component: () => import('@/view/identitycasting/components/NoCon.vue')
  },
  {
    path: '/identitycasting',
    name: 'Identitycasting',
    component: () => import('@/view/identitycasting/index.vue')
  },
  {
    path: '/casting',
    name: 'casting',
    component: () => import('@/view/identitycasting/components/Identity/casting.vue')
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
  // {
  //   path: '/pledge-did',
  //   name: 'pledge-did',
  //   component: () => import('@/view/identitycasting/components/PledgeDID/index.vue')
  // },
  {
    path: '/dashboard',
    name: 'dashboard',
    component: () => import('@/view/dashboard/index.vue')
  },
  {
    path: '/gas',
    name: 'gas',
    component: () => import('@/view/identitycasting/components/Identity/gas.vue')
  },
  {
    path: '/withdrawal',
    name: 'withdrawal',
    component: () => import('@/view/dashboard/withdrawal.vue')
  },
  {
    path: '/pledge-did',
    name: 'pledge',
    component: () => import('@/view/identitycasting/components/didpledge/pledge.vue')
  },
  {
    path: '/valcontribution-details/:address?',
    name: 'valcontribution-details',
    component: () => import('@/view/identitycasting/components/valcontribution/details.vue')
  },
  {
    path: '/valcontribution-plusedetails/:address?',
    name: 'valcontribution-plusedetails',
    component: () => import('@/view/identitycasting/components/valcontribution/plusedetails.vue')
  },
  {
    path: '/inviterecord/:id?',
    name: 'inviterecord',
    component: () => import('@/view/identitycasting/components/invite/inviterecord.vue')
  },
  {
    path: '/product',
    name: 'product',
    component: () => import('@/view/identitycasting/components/product/index.vue')
  },
]

const router = createRouter({   
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  const store = useStore()
  
  // 如果用户已登录且有token，但访问连接页面，重定向到dashboard
  if (store.token && to.path === '/connect') {
    next('/dashboard');
    return;
  }
  
  // 如果用户未登录且不在连接页面，重定向到连接页面
  if (!store.account && to.path !== '/connect') {
    next('/connect');
    return;
  }
  
  // 其他情况正常通过
  next();
})
export default router
