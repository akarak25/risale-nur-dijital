import { createRouter, createWebHistory } from 'vue-router'
import store from '@/store'
import HomeView from '../views/HomeView.vue'
import BookshelfView from '../views/BookshelfView.vue'
import ReaderView from '../views/ReaderView.vue'
import SearchResultsView from '../views/SearchResultsView.vue'
import BookmarksView from '../views/BookmarksView.vue'
import LoginView from '../views/LoginView.vue'
import RegisterView from '../views/RegisterView.vue'
import ProfileView from '../views/ProfileView.vue'
import ForgotPasswordView from '../views/ForgotPasswordView.vue'
import AdminDashboard from '../views/admin/AdminDashboard.vue'

const routes = [
  {
    path: '/',
    name: 'home',
    component: HomeView
  },
  {
    path: '/bookshelf',
    name: 'bookshelf',
    component: BookshelfView
  },
  {
    path: '/bookshelf/:category',
    name: 'bookshelf-category',
    component: BookshelfView,
    props: true
  },
  {
    path: '/read/:bookId',
    name: 'reader',
    component: ReaderView,
    props: true
  },
  {
    path: '/read/:bookId/page/:pageNumber',
    name: 'reader-page',
    component: ReaderView,
    props: true
  },
  {
    path: '/search',
    name: 'search-results',
    component: SearchResultsView,
    props: route => ({ query: route.query.q })
  },
  {
    path: '/bookmarks',
    name: 'bookmarks',
    component: BookmarksView,
    meta: { requiresAuth: true }
  },
  {
    path: '/profile',
    name: 'profile',
    component: ProfileView,
    meta: { requiresAuth: true }
  },
  {
    path: '/login',
    name: 'login',
    component: LoginView,
    meta: { guestOnly: true }
  },
  {
    path: '/register',
    name: 'register',
    component: RegisterView,
    meta: { guestOnly: true }
  },
  {
    path: '/forgot-password',
    name: 'forgot-password',
    component: ForgotPasswordView,
    meta: { guestOnly: true }
  },
  {
    path: '/about',
    name: 'about',
    // Route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () => import(/* webpackChunkName: "about" */ '../views/AboutView.vue')
  },
  // Admin Routes
  {
    path: '/admin',
    name: 'admin',
    component: AdminDashboard,
    meta: { requiresAuth: true, requiresAdmin: true }
  },
  {
    path: '/admin/books',
    name: 'admin-books',
    component: () => import('../views/admin/AdminBooks.vue'),
    meta: { requiresAuth: true, requiresAdmin: true }
  },
  {
    path: '/admin/books/add',
    name: 'admin-book-add',
    component: () => import('../views/admin/AdminBookAdd.vue'),
    meta: { requiresAuth: true, requiresAdmin: true }
  },
  {
    path: '/admin/books/:id/edit',
    name: 'admin-book-edit',
    component: () => import('../views/admin/AdminBookEdit.vue'),
    props: true,
    meta: { requiresAuth: true, requiresAdmin: true }
  },
  {
    path: '/admin/dictionary',
    name: 'admin-dictionary',
    component: () => import('../views/admin/AdminDictionary.vue'),
    meta: { requiresAuth: true, requiresAdmin: true }
  }
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

// Navigation Guard
router.beforeEach((to, from, next) => {
  const isAuthenticated = store.getters['auth/isAuthenticated']
  const user = store.getters['auth/user']
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth)
  const requiresAdmin = to.matched.some(record => record.meta.requiresAdmin)
  const guestOnly = to.matched.some(record => record.meta.guestOnly)
  
  // Giriş yapılması gereken sayfalara erişim kontrolü
  if (requiresAuth && !isAuthenticated) {
    next({ 
      name: 'login',
      query: { redirect: to.fullPath }
    })
  } 
  // Admin sayfaları kontrolü
  else if (requiresAdmin && (!user || user.role !== 'admin')) {
    next({ name: 'home' })
  }
  // Sadece misafir kullanıcıların görebileceği sayfalar (login, register vb.)
  else if (guestOnly && isAuthenticated) {
    next({ name: 'home' })
  } 
  // Diğer durumlarda devam et
  else {
    next()
  }
})

export default router