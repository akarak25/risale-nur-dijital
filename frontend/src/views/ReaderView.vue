<template>
  <div class="reader-view">
    <!-- Sol Panel -->
    <aside class="left-panel" :class="{ show: showMobileMenu }">
      <div class="panel-header">
        Risale-i Nur Külliyatı
      </div>
      
      <div class="books-list">
        <!-- Dinamik kitap listesi -->
        <div class="book-group" v-for="book in books" :key="book._id">
          <div class="book-header" @click="selectBook(book)">
            <span class="arrow" v-if="book.hasChapters" :class="{ expanded: expandedBooks[book._id] }">▶</span>
            {{ book.title }}
          </div>
          
          <!-- Alt bölümler varsa -->
          <div class="chapters" v-if="book.hasChapters && expandedBooks[book._id]" :class="{ show: expandedBooks[book._id] }">
            <div class="chapter" 
                 v-for="chapter in book.chapters" 
                 :key="chapter.id"
                 :class="{ active: isActiveChapter(book._id, chapter.id) }"
                 @click.stop="goToChapter(book._id, chapter)">
              {{ chapter.title }}
            </div>
          </div>
        </div>
      </div>
    </aside>
    
    <!-- Sağ Panel -->
    <div class="right-panel">
      <!-- Üst Bar -->
      <header class="top-bar">
        <button class="mobile-menu-btn" @click="showMobileMenu = !showMobileMenu">☰</button>
        
        <div class="nav-section">
          <span class="book-info">
            <strong>{{ currentBookName }}</strong>
            <span class="separator" v-if="currentChapterName"> › </span>
            <span v-if="currentChapterName">{{ currentChapterName }}</span>
          </span>
          
          <div class="page-nav">
            <button @click="previousPage" :disabled="currentPage <= 1">◄</button>
            <input 
              type="number" 
              class="page-input" 
              v-model.number="currentPage"
              @change="onPageChange"
              :min="1"
              :max="totalPages"
            >
            <span class="page-total">/ {{ totalPages }}</span>
            <button @click="nextPage" :disabled="currentPage >= totalPages">►</button>
          </div>
        </div>
      </header>
      
      <!-- İçerik -->
      <main class="content-area">
        <div class="loading" v-if="loading">
          <div class="spinner"></div>
          <div>Yükleniyor...</div>
        </div>
        
        <div class="content-wrapper" v-else>
          <div class="page-header" v-if="showPageHeader">
            <h1>{{ currentBookName }}</h1>
            <h2 v-if="currentChapterName">{{ currentChapterName }}</h2>
            <div class="author">Bediüzzaman Said Nursi</div>
          </div>
          
          <div class="page-content" v-html="pageContent"></div>
        </div>
      </main>
      
      <!-- Alt Bar -->
      <footer class="bottom-bar">
        <span class="status-text">{{ currentBookName }}</span>
        <span class="page-info">Sayfa: {{ currentPage }} / {{ totalPages }}</span>
      </footer>
    </div>
    
    <!-- Arama -->
    <div v-if="showSearch" class="overlay" @click="showSearch = false"></div>
    <div v-if="showSearch" class="search-box">
      <div class="search-header">
        <span>Arama</span>
        <button class="close-btn" @click="showSearch = false">×</button>
      </div>
      
      <input 
        type="text" 
        class="search-input" 
        placeholder="Aranacak kelime..."
        v-model="searchQuery"
        @keyup.enter="performSearch"
        ref="searchInput"
      >
      
      <div class="search-options">
        <label>
          <input type="radio" v-model="searchScope" value="page"> Bu sayfa
        </label>
        <label>
          <input type="radio" v-model="searchScope" value="book"> Bu kitap
        </label>
        <label>
          <input type="radio" v-model="searchScope" value="all"> Tüm külliyat
        </label>
      </div>
      
      <div class="search-buttons">
        <button @click="showSearch = false">İptal</button>
        <button class="primary" @click="performSearch">Ara</button>
      </div>
    </div>
  </div>
</template>

<script>
import axios from '@/utils/axios';

export default {
  name: 'ReaderView',
  props: {
    bookId: {
      type: String,
      required: true
    },
    pageNumber: {
      type: [String, Number],
      default: 1
    }
  },
  data() {
    return {
      // Sayfa durumu
      loading: false,
      currentPage: parseInt(this.pageNumber) || 1,
      totalPages: 0,
      pageContent: '',
      
      // Kitap bilgileri
      currentBook: null,
      currentBookName: '',
      currentChapterName: '',
      
      // Kitap listesi
      books: [],
      expandedBooks: {},
      
      // UI durumları
      showMobileMenu: false,
      showSearch: false,
      
      // Arama
      searchQuery: '',
      searchScope: 'book',
      
      // Sayfa başlığı göster
      showPageHeader: true
    }
  },
  async created() {
    await this.loadBooks();
    await this.loadBook();
    this.setupKeyboardShortcuts();
  },
  watch: {
    currentPage(newPage) {
      this.loadPage(newPage);
      this.updateURL();
    },
    bookId() {
      this.loadBook();
    }
  },
  methods: {
    // Kitapları yükle
    async loadBooks() {
      try {
        const response = await axios.get('/books');
        this.books = response.data;
        
        // Bölümleri olan kitapları işaretle
        this.books.forEach(book => {
          if (['sozler', 'mektubat', 'lemalar', 'sualar'].includes(book.slug)) {
            book.hasChapters = true;
            book.chapters = this.generateChapters(book.slug);
          }
        });
        
        // İlk kitabı genişlet
        if (this.books.length > 0) {
          this.$set(this.expandedBooks, this.books[0]._id, true);
        }
      } catch (error) {
        console.error('Kitaplar yüklenemedi:', error);
      }
    },
    
    // Bölümleri oluştur (geçici çözüm)
    generateChapters(bookSlug) {
      const chapterCounts = {
        sozler: 33,
        mektubat: 29,
        lemalar: 33,
        sualar: 15
      };
      
      const count = chapterCounts[bookSlug] || 0;
      const chapters = [];
      
      for (let i = 1; i <= count; i++) {
        chapters.push({
          id: i,
          title: `${i}. ${this.getChapterName(bookSlug)}`
        });
      }
      
      return chapters;
    },
    
    getChapterName(bookSlug) {
      const names = {
        sozler: 'Söz',
        mektubat: 'Mektup',
        lemalar: 'Lem\'a',
        sualar: 'Şua'
      };
      return names[bookSlug] || 'Bölüm';
    },
    
    // Kitap seç
    selectBook(book) {
      if (book.hasChapters) {
        // Toggle genişletme
        this.$set(this.expandedBooks, book._id, !this.expandedBooks[book._id]);
      } else {
        // Direkt kitaba git
        this.goToBook(book.slug || book._id);
      }
    },
    
    // Aktif bölüm kontrolü
    isActiveChapter(book, chapter) {
      // Basit kontrol - gerçek implementasyonda daha detaylı olmalı
      return false;
    },
    
    // Bölüme git
    goToChapter(bookId, chapter) {
      // Bölüm sayfasına git - gerçek implementasyonda sayfa numarasını bul
      console.log(`Kitap: ${bookId}, Bölüm: ${chapter.title}`);
      // this.$router.push({ ... })
    },
    
    // Kitaba git
    goToBook(bookCode) {
      this.$router.push({
        name: 'reader',
        params: { bookId: bookCode }
      });
    },
    
    // Kitap yükle
    async loadBook() {
      this.loading = true;
      try {
        const response = await axios.get(`/books/${this.bookId}`);
        this.currentBook = response.data;
        
        if (this.currentBook) {
          this.currentBookName = this.currentBook.title;
          this.totalPages = this.currentBook.totalPages || 0;
          document.title = `${this.currentBookName} - Risale-i Nur`;
        }
        
        if (this.totalPages > 0) {
          await this.loadPage(this.currentPage);
        }
      } catch (error) {
        console.error('Kitap yüklenemedi:', error);
      } finally {
        this.loading = false;
      }
    },
    
    // Sayfa yükle
    async loadPage(pageNumber) {
      try {
        const response = await axios.get(`/books/${this.bookId}/page/${pageNumber}`);
        if (response.data) {
          this.pageContent = response.data.content;
          // İlk sayfada başlık göster
          this.showPageHeader = pageNumber === 1;
        }
      } catch (error) {
        console.error(`Sayfa ${pageNumber} yüklenemedi:`, error);
        this.pageContent = '<p>Sayfa yüklenirken hata oluştu.</p>';
      }
    },
    
    // Navigasyon
    previousPage() {
      if (this.currentPage > 1) {
        this.currentPage--;
      }
    },
    
    nextPage() {
      if (this.currentPage < this.totalPages) {
        this.currentPage++;
      }
    },
    
    onPageChange() {
      if (this.currentPage < 1) {
        this.currentPage = 1;
      } else if (this.currentPage > this.totalPages) {
        this.currentPage = this.totalPages;
      }
    },
    
    // URL güncelle
    updateURL() {
      this.$router.push({
        name: 'reader-page',
        params: { 
          bookId: this.bookId, 
          pageNumber: this.currentPage 
        },
        replace: true
      });
    },
    
    // Arama
    async performSearch() {
      if (!this.searchQuery) return;
      
      console.log('Arama:', this.searchQuery, 'Kapsam:', this.searchScope);
      // Arama implementasyonu
      this.showSearch = false;
    },
    
    // Klavye kısayolları
    setupKeyboardShortcuts() {
      document.addEventListener('keydown', (e) => {
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
        
        switch(e.key) {
          case 'ArrowLeft':
            e.preventDefault();
            this.previousPage();
            break;
          case 'ArrowRight':
            e.preventDefault();
            this.nextPage();
            break;
          case 'f':
          case 'F':
            if (e.ctrlKey) {
              e.preventDefault();
              this.showSearch = true;
              this.$nextTick(() => {
                this.$refs.searchInput?.focus();
              });
            }
            break;
        }
      });
    }
  }
}
</script>

<style scoped lang="scss">
@import '@/assets/styles/reader-view.scss';
</style>