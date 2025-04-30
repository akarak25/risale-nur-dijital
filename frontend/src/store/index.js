import { createStore } from 'vuex'
import axios from 'axios'

// API URL
const API_URL = process.env.VUE_APP_API_URL || 'http://localhost:3000/api'

export default createStore({
  state: {
    books: [],
    currentBook: null,
    currentPage: null,
    bookmarks: [],
    notes: [],
    userSettings: {
      fontSize: 16,
      fontFamily: 'Noto Serif',
      lineHeight: 1.6,
      darkMode: false,
      pageAnimations: true,
      pageSound: true
    },
    searchResults: [],
    loading: false,
    error: null
  },
  getters: {
    getBookById: (state) => (id) => {
      return state.books.find(book => book._id === id)
    },
    getBookmarksByBook: (state) => (bookId) => {
      return state.bookmarks.filter(bookmark => bookmark.bookId === bookId)
    },
    getNotesByPage: (state) => (bookId, pageNumber) => {
      return state.notes.filter(
        note => note.bookId === bookId && note.pageNumber === parseInt(pageNumber)
      )
    },
    getCurrentPageNotes: (state) => {
      if (!state.currentBook || !state.currentPage) return []
      return state.notes.filter(
        note => note.bookId === state.currentBook._id && 
                note.pageNumber === state.currentPage.pageNumber
      )
    },
    getBookCategories: (state) => {
      const categories = state.books.map(book => book.category)
      return [...new Set(categories)]
    }
  },
  mutations: {
    SET_BOOKS(state, books) {
      state.books = books
    },
    SET_CURRENT_BOOK(state, book) {
      state.currentBook = book
    },
    SET_CURRENT_PAGE(state, page) {
      state.currentPage = page
    },
    SET_BOOKMARKS(state, bookmarks) {
      state.bookmarks = bookmarks
    },
    ADD_BOOKMARK(state, bookmark) {
      state.bookmarks.push(bookmark)
    },
    UPDATE_BOOKMARK(state, updatedBookmark) {
      const index = state.bookmarks.findIndex(b => b._id === updatedBookmark._id)
      if (index !== -1) {
        state.bookmarks.splice(index, 1, updatedBookmark)
      }
    },
    REMOVE_BOOKMARK(state, bookmarkId) {
      state.bookmarks = state.bookmarks.filter(b => b._id !== bookmarkId)
    },
    SET_NOTES(state, notes) {
      state.notes = notes
    },
    ADD_NOTE(state, note) {
      state.notes.push(note)
    },
    UPDATE_NOTE(state, updatedNote) {
      const index = state.notes.findIndex(n => n._id === updatedNote._id)
      if (index !== -1) {
        state.notes.splice(index, 1, updatedNote)
      }
    },
    REMOVE_NOTE(state, noteId) {
      state.notes = state.notes.filter(n => n._id !== noteId)
    },
    UPDATE_USER_SETTINGS(state, settings) {
      state.userSettings = { ...state.userSettings, ...settings }
    },
    SET_SEARCH_RESULTS(state, results) {
      state.searchResults = results
    },
    SET_LOADING(state, loading) {
      state.loading = loading
    },
    SET_ERROR(state, error) {
      state.error = error
    }
  },
  actions: {
    // Kitapları getir
    async fetchBooks({ commit }) {
      commit('SET_LOADING', true)
      try {
        const response = await axios.get(`${API_URL}/books`)
        commit('SET_BOOKS', response.data)
        commit('SET_ERROR', null)
      } catch (error) {
        console.error('Kitaplar getirilirken hata oluştu:', error)
        commit('SET_ERROR', 'Kitaplar yüklenirken bir hata oluştu.')
      } finally {
        commit('SET_LOADING', false)
      }
    },
    
    // Kategoriye göre kitapları getir
    async fetchBooksByCategory({ commit }, category) {
      commit('SET_LOADING', true)
      try {
        const response = await axios.get(`${API_URL}/books/category/${category}`)
        commit('SET_BOOKS', response.data)
        commit('SET_ERROR', null)
      } catch (error) {
        console.error('Kategori kitapları getirilirken hata oluştu:', error)
        commit('SET_ERROR', 'Kategori kitapları yüklenirken bir hata oluştu.')
      } finally {
        commit('SET_LOADING', false)
      }
    },
    
    // Belirli bir kitabı getir
    async fetchBook({ commit }, bookId) {
      commit('SET_LOADING', true)
      try {
        const response = await axios.get(`${API_URL}/books/${bookId}`)
        commit('SET_CURRENT_BOOK', response.data)
        commit('SET_ERROR', null)
      } catch (error) {
        console.error('Kitap getirilirken hata oluştu:', error)
        commit('SET_ERROR', 'Kitap yüklenirken bir hata oluştu.')
      } finally {
        commit('SET_LOADING', false)
      }
    },
    
    // Kitap sayfasını getir
    async fetchBookPage({ commit }, { bookId, pageNumber }) {
      commit('SET_LOADING', true)
      try {
        const response = await axios.get(`${API_URL}/books/${bookId}/page/${pageNumber}`)
        commit('SET_CURRENT_PAGE', response.data)
        commit('SET_ERROR', null)
      } catch (error) {
        console.error('Sayfa getirilirken hata oluştu:', error)
        commit('SET_ERROR', 'Sayfa yüklenirken bir hata oluştu.')
      } finally {
        commit('SET_LOADING', false)
      }
    },
    
    // Kullanıcının yer imlerini getir
    async fetchUserBookmarks({ commit }, userId) {
      commit('SET_LOADING', true)
      try {
        const response = await axios.get(`${API_URL}/bookmarks/user/${userId}`)
        commit('SET_BOOKMARKS', response.data)
        commit('SET_ERROR', null)
      } catch (error) {
        console.error('Yer imleri getirilirken hata oluştu:', error)
        commit('SET_ERROR', 'Yer imleri yüklenirken bir hata oluştu.')
      } finally {
        commit('SET_LOADING', false)
      }
    },
    
    // Yeni yer imi ekle
    async addBookmark({ commit }, bookmark) {
      commit('SET_LOADING', true)
      try {
        const response = await axios.post(`${API_URL}/bookmarks`, bookmark)
        commit('ADD_BOOKMARK', response.data)
        commit('SET_ERROR', null)
        return response.data
      } catch (error) {
        console.error('Yer imi eklenirken hata oluştu:', error)
        commit('SET_ERROR', 'Yer imi eklenirken bir hata oluştu.')
        throw error
      } finally {
        commit('SET_LOADING', false)
      }
    },
    
    // Yer imi güncelle
    async updateBookmark({ commit }, { id, data }) {
      commit('SET_LOADING', true)
      try {
        const response = await axios.put(`${API_URL}/bookmarks/${id}`, data)
        commit('UPDATE_BOOKMARK', response.data)
        commit('SET_ERROR', null)
        return response.data
      } catch (error) {
        console.error('Yer imi güncellenirken hata oluştu:', error)
        commit('SET_ERROR', 'Yer imi güncellenirken bir hata oluştu.')
        throw error
      } finally {
        commit('SET_LOADING', false)
      }
    },
    
    // Yer imi sil
    async deleteBookmark({ commit }, bookmarkId) {
      commit('SET_LOADING', true)
      try {
        await axios.delete(`${API_URL}/bookmarks/${bookmarkId}`)
        commit('REMOVE_BOOKMARK', bookmarkId)
        commit('SET_ERROR', null)
      } catch (error) {
        console.error('Yer imi silinirken hata oluştu:', error)
        commit('SET_ERROR', 'Yer imi silinirken bir hata oluştu.')
        throw error
      } finally {
        commit('SET_LOADING', false)
      }
    },
    
    // Kullanıcının notlarını getir
    async fetchUserNotes({ commit }, userId) {
      commit('SET_LOADING', true)
      try {
        const response = await axios.get(`${API_URL}/notes/user/${userId}`)
        commit('SET_NOTES', response.data)
        commit('SET_ERROR', null)
      } catch (error) {
        console.error('Notlar getirilirken hata oluştu:', error)
        commit('SET_ERROR', 'Notlar yüklenirken bir hata oluştu.')
      } finally {
        commit('SET_LOADING', false)
      }
    },
    
    // Sayfadaki notları getir
    async fetchPageNotes({ commit }, { userId, bookId, pageNumber }) {
      commit('SET_LOADING', true)
      try {
        const response = await axios.get(`${API_URL}/notes/user/${userId}/book/${bookId}/page/${pageNumber}`)
        commit('SET_NOTES', response.data)
        commit('SET_ERROR', null)
      } catch (error) {
        console.error('Sayfa notları getirilirken hata oluştu:', error)
        commit('SET_ERROR', 'Sayfa notları yüklenirken bir hata oluştu.')
      } finally {
        commit('SET_LOADING', false)
      }
    },
    
    // Yeni not ekle
    async addNote({ commit }, note) {
      commit('SET_LOADING', true)
      try {
        const response = await axios.post(`${API_URL}/notes`, note)
        commit('ADD_NOTE', response.data)
        commit('SET_ERROR', null)
        return response.data
      } catch (error) {
        console.error('Not eklenirken hata oluştu:', error)
        commit('SET_ERROR', 'Not eklenirken bir hata oluştu.')
        throw error
      } finally {
        commit('SET_LOADING', false)
      }
    },
    
    // Not güncelle
    async updateNote({ commit }, { id, data }) {
      commit('SET_LOADING', true)
      try {
        const response = await axios.put(`${API_URL}/notes/${id}`, data)
        commit('UPDATE_NOTE', response.data)
        commit('SET_ERROR', null)
        return response.data
      } catch (error) {
        console.error('Not güncellenirken hata oluştu:', error)
        commit('SET_ERROR', 'Not güncellenirken bir hata oluştu.')
        throw error
      } finally {
        commit('SET_LOADING', false)
      }
    },
    
    // Not sil
    async deleteNote({ commit }, noteId) {
      commit('SET_LOADING', true)
      try {
        await axios.delete(`${API_URL}/notes/${noteId}`)
        commit('REMOVE_NOTE', noteId)
        commit('SET_ERROR', null)
      } catch (error) {
        console.error('Not silinirken hata oluştu:', error)
        commit('SET_ERROR', 'Not silinirken bir hata oluştu.')
        throw error
      } finally {
        commit('SET_LOADING', false)
      }
    },
    
    // Kullanıcı ayarlarını güncelle ve localStorage'a kaydet
    updateUserSettings({ commit }, settings) {
      commit('UPDATE_USER_SETTINGS', settings)
      localStorage.setItem('userSettings', JSON.stringify({
        ...this.state.userSettings,
        ...settings
      }))
    },
    
    // Arama yap
    async searchBooks({ commit }, query) {
      commit('SET_LOADING', true)
      try {
        const response = await axios.get(`${API_URL}/search/basic`, {
          params: { query }
        })
        commit('SET_SEARCH_RESULTS', response.data)
        commit('SET_ERROR', null)
        return response.data
      } catch (error) {
        console.error('Arama yapılırken hata oluştu:', error)
        commit('SET_ERROR', 'Arama yapılırken bir hata oluştu.')
        return []
      } finally {
        commit('SET_LOADING', false)
      }
    },
    
    // Gelişmiş arama
    async advancedSearch({ commit }, params) {
      commit('SET_LOADING', true)
      try {
        const response = await axios.get(`${API_URL}/search/advanced`, {
          params
        })
        commit('SET_SEARCH_RESULTS', response.data)
        commit('SET_ERROR', null)
        return response.data
      } catch (error) {
        console.error('Gelişmiş arama yapılırken hata oluştu:', error)
        commit('SET_ERROR', 'Gelişmiş arama yapılırken bir hata oluştu.')
        return []
      } finally {
        commit('SET_LOADING', false)
      }
    },
    
    // Kelime anlamını ara
    async searchWord({ commit }, word) {
      commit('SET_LOADING', true)
      try {
        const response = await axios.get(`${API_URL}/dictionary/word/${word}`)
        commit('SET_ERROR', null)
        return response.data
      } catch (error) {
        console.error('Kelime anlamı aranırken hata oluştu:', error)
        if (error.response && error.response.status === 404) {
          return null
        }
        commit('SET_ERROR', 'Kelime anlamı aranırken bir hata oluştu.')
        return null
      } finally {
        commit('SET_LOADING', false)
      }
    }
  },
  modules: {
  }
})