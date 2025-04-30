import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import BookshelfView from '../views/BookshelfView.vue'
import ReaderView from '../views/ReaderView.vue'
import SearchResultsView from '../views/SearchResultsView.vue'
import BookmarksView from '../views/BookmarksView.vue'

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
    component: BookmarksView
  },
  {
    path: '/about',
    name: 'about',
    // Route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () => import(/* webpackChunkName: "about" */ '../views/AboutView.vue')
  }
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

export default router