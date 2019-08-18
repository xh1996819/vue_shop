import Vue from 'vue'
import Router from 'vue-router'
import Login from './components/Login.vue'
import Home from './components/Home.vue'
import Welcome from './components/Welcome.vue'
import Users from './components/user/Users.vue'
import Rights from './components/power/Rights.vue'
import Roles from './components/power/Roles.vue'

Vue.use(Router)

const router = new Router({
  routes: [
    { path: '/', redirect: '/login' },
    { path: '/login', component: Login, name: 'login' },
    {
      path: '/home',
      component: Home,
      name: 'home',
      redirect: '/welcome',
      children: [
        { path: '/welcome', component: Welcome, name: 'welcome' },
        { path: '/users', component: Users, name: 'users' },
        { path: '/rights', component: Rights, name: 'rights' },
        { path: '/roles', component: Roles, name: 'roles' }
      ]
    }
  ]
})

// 挂载路由导航守卫
router.beforeEach((to, from, next) => {
  if (to.path === '/login') return next()
  const tokenStr = window.sessionStorage.getItem('token')
  if (!tokenStr) return next('/login')
  next()
})

export default router
