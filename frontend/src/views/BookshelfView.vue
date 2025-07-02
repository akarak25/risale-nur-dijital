<template>
  <div class="bookshelf-view">
    <!-- Başlık ve Filtreler -->
    <div class="bookshelf-header">
      <div class="header-content">
        <h1 class="page-title">
          <span class="icon">📚</span>
          {{ pageTitle }}
        </h1>
        <p class="page-subtitle">
          Risale-i Nur Külliyatı'ndan {{ filteredBooksCount }} eser
        </p>
      </div>
      
      <div class="header-controls">
        <div class="filter-group">
          <label>Kategori:</label>
          <select v-model="selectedCategory" @change="filterBooks" class="filter-select">
            <option value="">Tüm Kitaplar</option>
            <option v-for="cat in categories" :key="cat.id" :value="cat.slug">
              {{ cat.name }}
            </option>
          </select>
        </div>
        
        <div class="view-toggle">
          <button 
            @click="viewMode = 'grid'" 
            :class="['view-btn', {active: viewMode === 'grid'}]"
          >
            <span class="icon">⊞</span>
          </button>
          <button 
            @click="viewMode = 'list'" 
            :class="['view-btn', {active: viewMode === 'list'}]"
          >
            <span class="icon">☰</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Yükleniyor -->
    <div v-if="loading" class="loading-container">
      <div class="loading-islamic"></div>
      <p>Kitaplar hazırlanıyor...</p>
    </div>

    <!-- Boş Durum -->
    <div v-else-if="filteredBooks.length === 0" class="empty-state">
      <div class="empty-icon">📚</div>
      <h3>Kitap Bulunamadı</h3>
      <p>Seçili kategoride henüz kitap bulunmuyor.</p>
      <button @click="clearFilters" class="btn btn-primary">
        Tüm Kitapları Göster
      </button>
    </div>

    <!-- Kitap Listesi - Grid Görünüm -->
    <div v-else-if="viewMode === 'grid'" class="books-grid">
      <div 
        v-for="book in filteredBooks" 
        :key="book.id"
        class="book-item"
        @click="openBook(book.id)"
      >
        <div class="book-3d">
          <div class="book-cover">
            <div class="cover-spine"></div>
            <div class="cover-front">
              <div class="book-image">
                <img :src="book.coverImage" :alt="book.title" />
              </div>
              <div class="book-overlay">
                <h3 class="book-title">{{ book.title }}</h3>
                <p class="book-author">{{ book.author }}</p>
              </div>
            </div>
          </div>
        </div>
        <div class="book-info">
          <h4>{{ book.title }}</h4>
          <div class="book-meta">
            <span class="pages">📄 {{ book.pageCount }} sayfa</span>
            <span class="category">{{ getCategoryName(book.category) }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Kitap Listesi - Liste Görünüm -->
    <div v-else class="books-list">
      <div 
        v-for="book in filteredBooks" 
        :key="book.id"
        class="book-list-item card"
        @click="openBook(book.id)"
      >
        <div class="book-cover-small">
          <img :src="book.coverImage" :alt="book.title" />
        </div>
        <div class="book-details">
          <h3>{{ book.title }}</h3>
          <p class="book-description">{{ book.description }}</p>
          <div class="book-meta">
            <span class="author">✍️ {{ book.author }}</span>
            <span class="pages">📄 {{ book.pageCount }} sayfa</span>
            <span class="category">🏷️ {{ getCategoryName(book.category) }}</span>
          </div>
        </div>
        <div class="book-actions">
          <button @click.stop="openBook(book.id)" class="btn btn-primary">
            Oku
          </button>
          <button @click.stop="toggleBookmark(book.id)" class="btn btn-outline">
            <span class="icon">{{ isBookmarked(book.id) ? '🔖' : '📌' }}</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Sayfalama -->
    <div v-if="totalPages > 1" class="pagination">
      <button 
        @click="currentPage--" 
        :disabled="currentPage === 1"
        class="page-btn"
      >
        ◀
      </button>
      <span class="page-info">
        Sayfa {{ currentPage }} / {{ totalPages }}
      </span>
      <button 
        @click="currentPage++" 
        :disabled="currentPage === totalPages"
        class="page-btn"
      >
        ▶
      </button>
    </div>
  </div>
</template>

<script>
import axios from '@/utils/axios';

export default {
  name: 'BookshelfView',
  props: {
    category: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      loading: false,
      selectedCategory: this.category || '',
      viewMode: 'grid',
      currentPage: 1,
      booksPerPage: 12,
      searchQuery: '',
      categories: [
        { id: 1, name: 'Sözler', slug: 'Sözler' },
        { id: 2, name: 'Mektubat', slug: 'Mektubat' },
        { id: 3, name: "Lem'alar", slug: "Lem'alar" },
        { id: 4, name: 'Şualar', slug: 'Şualar' },
        { id: 5, name: 'Mesnevî-i Nuriye', slug: 'Mesnevî-i Nuriye' },
        { id: 6, name: 'İşarât-ül İ\'caz', slug: 'İşarât-ül İ\'caz' },
        { id: 7, name: 'Barla Lâhikası', slug: 'Barla Lâhikası' },
        { id: 8, name: 'Kastamonu Lâhikası', slug: 'Kastamonu Lâhikası' },
        { id: 9, name: 'Emirdağ Lâhikası', slug: 'Emirdağ Lâhikası' },
        { id: 10, name: 'Tarihçe-i Hayat', slug: 'Tarihçe-i Hayat' },
        { id: 11, name: 'Sikke-i Tasdik-i Gaybî', slug: 'Sikke-i Tasdik-i Gaybî' },
        { id: 12, name: 'Asâ-yı Musa', slug: 'Asâ-yı Musa' },
        { id: 13, name: 'Küçük Kitaplar', slug: 'Küçük Kitaplar' },
        { id: 14, name: 'Risale-i Nur', slug: 'Risale-i Nur' },
        { id: 15, name: 'Diğer', slug: 'Diğer' }
      ],
      books: [], // Veritabanından gelecek
    }
  },
  computed: {
    pageTitle() {
      if (this.selectedCategory) {
        const cat = this.categories.find(c => c.slug === this.selectedCategory);
        return cat ? cat.name : 'Kitaplık';
      }
      return 'Risale-i Nur Kitaplığı';
    },
    filteredBooks() {
      let filtered = this.books;
      
      // Kategori filtresi
      if (this.selectedCategory) {
        filtered = filtered.filter(book => book.category === this.selectedCategory);
      }
      
      // Arama filtresi
      if (this.searchQuery) {
        const query = this.searchQuery.toLowerCase();
        filtered = filtered.filter(book => 
          book.title.toLowerCase().includes(query) ||
          book.description.toLowerCase().includes(query)
        );
      }
      
      // Sayfalama
      const start = (this.currentPage - 1) * this.booksPerPage;
      const end = start + this.booksPerPage;
      
      return filtered.slice(start, end);
    },
    filteredBooksCount() {
      return this.books.filter(book => 
        !this.selectedCategory || book.category === this.selectedCategory
      ).length;
    },
    totalPages() {
      return Math.ceil(this.filteredBooksCount / this.booksPerPage);
    },
    bookmarkedBooks() {
      return [];
    }
  },
  async created() {
    await this.loadBooks();
  },
  watch: {
    category(newCategory) {
      this.selectedCategory = newCategory;
      this.currentPage = 1;
    }
  },
  methods: {
    async loadBooks() {
      this.loading = true;
      try {
        // API'den kitapları çek
        const response = await axios.get('/books');
        this.books = response.data.map(book => ({
          id: book._id,
          title: book.title,
          author: book.author,
          description: book.description,
          coverImage: book.coverImage || this.getDefaultCover(book.title),
          category: book.category,
          pageCount: book.totalPages || 0
        }));
      } catch (error) {
        console.error('Kitaplar yüklenemedi:', error);
      } finally {
        this.loading = false;
      }
    },
    
    getDefaultCover(title) {
      // Varsayılan kapak resimlerini eşleştir
      const coverMap = {
        'Sözler': require('@/assets/images/sözler.png'),
        'Mektubat': require('@/assets/images/mektubat.png'),
        "Lem'alar": require('@/assets/images/Lemalar.png'),
        'Şualar': require('@/assets/images/Şualar.png'),
        'Mesnevî-i Nuriye': require('@/assets/images/Mesnevi i nuriye.png'),
        'Muhakemat': require('@/assets/images/Muhakemat.png'),
        'Sikke-i Tasdik-i Gaybî': require('@/assets/images/sikkei tasdiki gaybi.png')
      };
      
      return coverMap[title] || '/images/default-book-cover.jpg';
    },
    openBook(bookId) {
      this.$router.push({ 
        name: 'reader', 
        params: { bookId: bookId }
      });
    },
    filterBooks() {
      this.currentPage = 1;
      if (this.selectedCategory) {
        this.$router.push({ 
          name: 'bookshelf-category', 
          params: { category: this.selectedCategory } 
        });
      } else {
        this.$router.push({ name: 'bookshelf' });
      }
    },
    clearFilters() {
      this.selectedCategory = '';
      this.searchQuery = '';
      this.currentPage = 1;
      this.$router.push({ name: 'bookshelf' });
    },
    getCategoryName(slug) {
      const cat = this.categories.find(c => c.slug === slug);
      return cat ? cat.name : '';
    },
    isBookmarked(bookId) {
      return false; // TODO: Implement bookmark check
    },
    toggleBookmark(bookId) {
      console.log('Bookmark toggled for:', bookId);
      // TODO: Implement bookmark functionality
    }
  }
}
</script>

<style scoped lang="scss">
.bookshelf-view {
  min-height: calc(100vh - 200px);
  animation: fadeIn 0.6s ease-out;
}

// Başlık
.bookshelf-header {
  margin-bottom: 3rem;
  
  .header-content {
    text-align: center;
    margin-bottom: 2rem;
    
    .page-title {
      font-size: 2.5rem;
      color: var(--primary-color);
      margin-bottom: 0.5rem;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 1rem;
      
      .icon {
        font-size: 2rem;
      }
    }
    
    .page-subtitle {
      font-size: 1.1rem;
      color: var(--text-secondary);
    }
  }
  
  .header-controls {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 2rem;
    flex-wrap: wrap;
    
    .filter-group {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      
      label {
        font-weight: 500;
        color: var(--text-secondary);
      }
      
      .filter-select {
        padding: 0.5rem 1rem;
        border: 2px solid var(--bg-secondary);
        border-radius: 8px;
        background: var(--bg-card);
        color: var(--text-primary);
        font-size: 1rem;
        min-width: 200px;
        
        &:focus {
          outline: none;
          border-color: var(--primary-color);
        }
      }
    }
    
    .view-toggle {
      display: flex;
      background: var(--bg-secondary);
      border-radius: 8px;
      padding: 4px;
      
      .view-btn {
        padding: 0.5rem 1rem;
        border: none;
        background: transparent;
        cursor: pointer;
        border-radius: 4px;
        transition: all 0.3s;
        color: var(--text-secondary);
        
        &:hover {
          color: var(--text-primary);
        }
        
        &.active {
          background: var(--bg-card);
          color: var(--primary-color);
          box-shadow: var(--shadow-sm);
        }
      }
    }
  }
}

// Grid Görünüm
.books-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 2rem;
  margin-bottom: 3rem;
  
  .book-item {
    cursor: pointer;
    transition: transform 0.3s;
    
    &:hover {
      transform: translateY(-5px);
      
      .book-3d .book-cover {
        transform: rotateY(-15deg);
      }
    }
    
    .book-3d {
      height: 280px;
      margin-bottom: 1rem;
      perspective: 1000px;
      
      .book-cover {
        position: relative;
        width: 100%;
        height: 100%;
        transform-style: preserve-3d;
        transition: transform 0.5s;
        
        .cover-spine {
          position: absolute;
          left: -15px;
          top: 0;
          width: 15px;
          height: 100%;
          background: linear-gradient(90deg, #8b6914, #cdaa3d);
          transform: rotateY(-90deg) translateZ(7.5px);
        }
        
        .cover-front {
          position: relative;
          width: 100%;
          height: 100%;
          background: var(--bg-card);
          border-radius: 0 8px 8px 0;
          overflow: hidden;
          box-shadow: var(--shadow-md);
          
          .book-image {
            width: 100%;
            height: 100%;
            
            img {
              width: 100%;
              height: 100%;
              object-fit: cover;
            }
          }
          
          .book-overlay {
            position: absolute;
            bottom: 0;
            left: 0;
            right: 0;
            background: linear-gradient(to top, rgba(0,0,0,0.8), transparent);
            padding: 1.5rem 1rem;
            color: white;
            
            .book-title {
              font-size: 1.1rem;
              margin-bottom: 0.25rem;
            }
            
            .book-author {
              font-size: 0.9rem;
              opacity: 0.9;
            }
          }
        }
      }
    }
    
    .book-info {
      text-align: center;
      
      h4 {
        font-size: 1.1rem;
        margin-bottom: 0.5rem;
        color: var(--primary-color);
      }
      
      .book-meta {
        display: flex;
        justify-content: center;
        gap: 1rem;
        font-size: 0.875rem;
        color: var(--text-secondary);
        
        .category {
          color: var(--accent-color);
          font-weight: 500;
        }
      }
    }
  }
}

// Liste Görünüm
.books-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 3rem;
  
  .book-list-item {
    display: flex;
    gap: 1.5rem;
    padding: 1.5rem;
    cursor: pointer;
    transition: all 0.3s;
    
    &:hover {
      transform: translateX(5px);
      box-shadow: var(--shadow-lg);
    }
    
    .book-cover-small {
      flex-shrink: 0;
      width: 120px;
      height: 160px;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: var(--shadow-md);
      
      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
    }
    
    .book-details {
      flex: 1;
      
      h3 {
        font-size: 1.5rem;
        margin-bottom: 0.5rem;
        color: var(--primary-color);
      }
      
      .book-description {
        font-size: 1rem;
        line-height: 1.6;
        color: var(--text-secondary);
        margin-bottom: 1rem;
      }
      
      .book-meta {
        display: flex;
        gap: 1.5rem;
        flex-wrap: wrap;
        font-size: 0.9rem;
        color: var(--text-light);
        
        span {
          display: flex;
          align-items: center;
          gap: 0.25rem;
        }
      }
    }
    
    .book-actions {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      align-items: flex-end;
      justify-content: center;
    }
  }
}

// Boş Durum
.empty-state {
  text-align: center;
  padding: 4rem 2rem;
  
  .empty-icon {
    font-size: 4rem;
    margin-bottom: 1rem;
    opacity: 0.5;
  }
  
  h3 {
    font-size: 1.5rem;
    margin-bottom: 0.5rem;
    color: var(--text-primary);
  }
  
  p {
    color: var(--text-secondary);
    margin-bottom: 2rem;
  }
}

// Yükleniyor
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  
  p {
    margin-top: 1rem;
    font-size: 1.1rem;
    color: var(--text-secondary);
  }
}

// Sayfalama
.pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  margin-top: 3rem;
  
  .page-btn {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    border: 2px solid var(--primary-color);
    background: var(--bg-card);
    color: var(--primary-color);
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.3s;
    
    &:hover:not(:disabled) {
      background: var(--primary-color);
      color: white;
    }
    
    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
  }
  
  .page-info {
    font-weight: 500;
    color: var(--text-secondary);
  }
}

// Responsive
@media (max-width: 768px) {
  .bookshelf-header {
    .page-title {
      font-size: 2rem;
    }
    
    .header-controls {
      flex-direction: column;
      gap: 1rem;
      
      .filter-select {
        width: 100%;
      }
    }
  }
  
  .books-grid {
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    gap: 1.5rem;
  }
  
  .books-list {
    .book-list-item {
      flex-direction: column;
      text-align: center;
      
      .book-cover-small {
        margin: 0 auto;
      }
      
      .book-actions {
        flex-direction: row;
        justify-content: center;
        width: 100%;
      }
    }
  }
}
</style>