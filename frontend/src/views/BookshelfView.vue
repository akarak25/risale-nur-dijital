<template>
  <div class="bookshelf-view">
    <div class="bookshelf-header">
      <h1>{{ title }}</h1>
      <div class="category-filter">
        <label for="category-select">Kategori:</label>
        <select id="category-select" v-model="selectedCategory" @change="changeCategory">
          <option value="">Tüm Kitaplar</option>
          <option v-for="category in categories" :key="category" :value="category">
            {{ category }}
          </option>
        </select>
      </div>
    </div>

    <div v-if="loading" class="loading-overlay">
      <div class="loading-spinner"></div>
      <p>Kitaplar yükleniyor...</p>
    </div>

    <div v-else-if="books.length === 0" class="empty-state">
      <p>Bu kategoride kitap bulunamadı.</p>
    </div>

    <div v-else class="bookshelf">
      <div 
        v-for="book in books" 
        :key="book._id" 
        class="bookshelf-item"
        @click="openBook(book._id)"
      >
        <div class="book">
          <div class="book-cover">
            <div class="cover-front" :style="{ backgroundImage: `url(${book.coverImage})` }">
              <div class="book-spine">
                <h3>{{ book.title }}</h3>
              </div>
            </div>
            <div class="cover-back">
              <div class="book-summary">
                <h3>{{ book.title }}</h3>
                <p>{{ truncateText(book.description, 150) }}</p>
                <button class="btn btn-primary book-read-btn">Okumaya Başla</button>
              </div>
            </div>
          </div>
        </div>
        <h3 class="book-title">{{ book.title }}</h3>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'BookshelfView',
  props: {
    category: {
      type: String,
      required: false,
      default: ''
    }
  },
  data() {
    return {
      selectedCategory: '',
      loading: true,
      error: null
    }
  },
  computed: {
    books() {
      return this.$store.state.books;
    },
    categories() {
      return [
        'Sözler', 
        'Mektubat', 
        'Lem\'alar', 
        'Şualar', 
        'İşarât-ül İ\'caz', 
        'Mesnevî-i Nuriye', 
        'Barla Lâhikası', 
        'Kastamonu Lâhikası', 
        'Emirdağ Lâhikası', 
        'Diğer'
      ];
    },
    title() {
      return this.selectedCategory ? `${this.selectedCategory} Kitapları` : 'Tüm Kitaplar';
    }
  },
  created() {
    this.selectedCategory = this.category;
    this.fetchBooks();
  },
  watch: {
    category(newCategory) {
      this.selectedCategory = newCategory;
      this.fetchBooks();
    }
  },
  methods: {
    async fetchBooks() {
      this.loading = true;
      try {
        if (this.selectedCategory) {
          await this.$store.dispatch('fetchBooksByCategory', this.selectedCategory);
        } else {
          await this.$store.dispatch('fetchBooks');
        }
        this.error = null;
      } catch (error) {
        console.error('Kitaplar yüklenirken hata oluştu:', error);
        this.error = 'Kitaplar yüklenirken bir hata oluştu. Lütfen daha sonra tekrar deneyin.';
      } finally {
        this.loading = false;
      }
    },
    openBook(bookId) {
      this.$router.push({ name: 'reader', params: { bookId } });
    },
    changeCategory() {
      if (this.selectedCategory) {
        this.$router.push({ name: 'bookshelf-category', params: { category: this.selectedCategory } });
      } else {
        this.$router.push({ name: 'bookshelf' });
      }
    },
    truncateText(text, maxLength) {
      if (!text) return '';
      if (text.length <= maxLength) return text;
      return text.slice(0, maxLength) + '...';
    }
  }
}
</script>

<style scoped lang="scss">
.bookshelf-view {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.bookshelf-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  
  h1 {
    font-size: 2rem;
    color: #4a69bd;
  }
  
  .category-filter {
    display: flex;
    align-items: center;
    
    label {
      margin-right: 10px;
      font-weight: 600;
    }
    
    select {
      padding: 8px 12px;
      border-radius: 4px;
      border: 1px solid #ddd;
      font-size: 1rem;
      background-color: #fff;
      
      &:focus {
        outline: none;
        border-color: #4a69bd;
      }
    }
  }
}

.bookshelf {
  display: flex;
  flex-wrap: wrap;
  gap: 30px;
  
  .bookshelf-item {
    flex: 0 0 calc(20% - 24px);
    max-width: calc(20% - 24px);
    height: 300px;
    cursor: pointer;
    
    .book-title {
      text-align: center;
      margin-top: 15px;
      font-size: 1.1rem;
    }
    
    @media (max-width: 1200px) {
      flex: 0 0 calc(25% - 24px);
      max-width: calc(25% - 24px);
    }
    
    @media (max-width: 992px) {
      flex: 0 0 calc(33.333% - 24px);
      max-width: calc(33.333% - 24px);
    }
    
    @media (max-width: 768px) {
      flex: 0 0 calc(50% - 24px);
      max-width: calc(50% - 24px);
    }
    
    @media (max-width: 576px) {
      flex: 0 0 100%;
      max-width: 100%;
    }
  }
}

.book {
  height: 100%;
  perspective: 1000px;
  
  .book-cover {
    height: 100%;
    transform-style: preserve-3d;
    transition: transform 0.6s;
    position: relative;
    
    .cover-front, .cover-back {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      backface-visibility: hidden;
      border-radius: 4px;
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
    }
    
    .cover-front {
      background-size: cover;
      background-position: center;
      background-color: #f0f0f0;
      display: flex;
      align-items: flex-start;
    }
    
    .book-spine {
      position: absolute;
      left: 0;
      top: 0;
      width: 40px;
      height: 100%;
      background-color: rgba(0, 0, 0, 0.7);
      color: white;
      display: flex;
      justify-content: center;
      align-items: center;
      writing-mode: vertical-lr;
      transform: rotate(180deg);
      
      h3 {
        font-size: 1rem;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        padding: 10px 5px;
      }
    }
    
    .cover-back {
      transform: rotateY(180deg);
      background-color: #f8f8f8;
      padding: 20px;
      display: flex;
      flex-direction: column;
      justify-content: center;
      
      .book-summary {
        text-align: center;
        
        h3 {
          margin-bottom: 15px;
          font-size: 1.3rem;
        }
        
        p {
          font-size: 0.9rem;
          line-height: 1.4;
          margin-bottom: 20px;
          color: #666;
        }
        
        .book-read-btn {
          padding: 8px 16px;
          font-size: 0.9rem;
        }
      }
    }
  }
  
  &:hover .book-cover {
    transform: rotateY(180deg);
  }
}

.loading-overlay {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 50px;
  
  .loading-spinner {
    width: 50px;
    height: 50px;
    border: 5px solid #f3f3f3;
    border-top: 5px solid #4a69bd;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin-bottom: 20px;
  }
  
  p {
    font-size: 1.2rem;
    color: #666;
  }
}

.empty-state {
  text-align: center;
  padding: 50px;
  
  p {
    font-size: 1.2rem;
    color: #666;
  }
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style>