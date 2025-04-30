<template>
  <div class="search-results-view">
    <div class="search-header">
      <h1>Arama Sonuçları</h1>
      <div class="search-info">
        <p v-if="searchResults.length > 0">
          "{{ query }}" için {{ searchResults.length }} sonuç bulundu.
        </p>
        <p v-else-if="!loading">
          "{{ query }}" için sonuç bulunamadı.
        </p>
      </div>
      <div class="advanced-search">
        <button @click="toggleAdvancedSearch" class="toggle-button">
          {{ showAdvanced ? 'Basit Arama' : 'Gelişmiş Arama' }}
        </button>
        
        <div v-if="showAdvanced" class="advanced-search-panel">
          <div class="filter-row">
            <div class="filter-group">
              <label for="category-filter">Kategori:</label>
              <select id="category-filter" v-model="filters.category">
                <option value="">Tüm Kategoriler</option>
                <option v-for="category in categories" :key="category" :value="category">
                  {{ category }}
                </option>
              </select>
            </div>
            
            <div class="filter-group">
              <label for="book-filter">Kitap:</label>
              <select id="book-filter" v-model="filters.bookId">
                <option value="">Tüm Kitaplar</option>
                <option v-for="book in books" :key="book._id" :value="book._id">
                  {{ book.title }}
                </option>
              </select>
            </div>
          </div>
          
          <div class="filter-row">
            <div class="filter-group checkbox-group">
              <label class="checkbox-label">
                <input type="checkbox" v-model="filters.exactPhrase">
                Tam İfade Ara
              </label>
            </div>
          </div>
          
          <div class="search-actions">
            <button @click="search" class="btn btn-primary">Ara</button>
            <button @click="resetFilters" class="btn btn-secondary">Filtreleri Sıfırla</button>
          </div>
        </div>
      </div>
    </div>
    
    <div v-if="loading" class="loading-overlay">
      <div class="loading-spinner"></div>
      <p>Arama yapılıyor...</p>
    </div>
    
    <div v-else-if="searchResults.length === 0" class="empty-results">
      <p>Aramanız için eşleşen sonuç bulunamadı.</p>
      <div class="suggestions">
        <h3>Öneriler:</h3>
        <ul>
          <li>Farklı anahtar kelimeler deneyin</li>
          <li>Yazım hatası olmadığından emin olun</li>
          <li>Daha genel terimler kullanmayı deneyin</li>
          <li>Filtrelerinizi kontrol edin</li>
        </ul>
      </div>
    </div>
    
    <div v-else class="search-results">
      <div 
        v-for="(result, index) in searchResults" 
        :key="index"
        class="result-card"
      >
        <div class="result-header">
          <h3 class="book-title">{{ result.bookTitle }}</h3>
          <div class="book-category">{{ result.bookCategory }}</div>
        </div>
        
        <div class="result-content">
          <div class="page-info">
            <span class="page-number">Sayfa {{ result.pageNumber }}</span>
            <button @click="goToPage(result.bookId, result.pageNumber)" class="go-to-page-btn">
              Sayfaya Git
            </button>
          </div>
          
          <div class="content-preview" v-html="result.highlightedContent"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'SearchResultsView',
  props: {
    query: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      loading: true,
      showAdvanced: false,
      filters: {
        bookId: '',
        category: '',
        exactPhrase: false
      }
    };
  },
  computed: {
    searchResults() {
      return this.$store.state.searchResults;
    },
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
    }
  },
  created() {
    // Tüm kitapları getir (filtreler için)
    this.fetchBooks();
    
    // İlk aramayı yap
    this.search();
  },
  watch: {
    query() {
      // Query değiştiğinde tekrar arama yap
      this.search();
    }
  },
  methods: {
    async fetchBooks() {
      if (this.books.length === 0) {
        await this.$store.dispatch('fetchBooks');
      }
    },
    
    async search() {
      this.loading = true;
      
      try {
        if (this.showAdvanced) {
          // Gelişmiş arama
          await this.$store.dispatch('advancedSearch', {
            query: this.query,
            bookId: this.filters.bookId,
            category: this.filters.category,
            exactPhrase: this.filters.exactPhrase
          });
        } else {
          // Basit arama
          await this.$store.dispatch('searchBooks', this.query);
        }
      } catch (error) {
        console.error('Arama yapılırken hata oluştu:', error);
      } finally {
        this.loading = false;
      }
    },
    
    toggleAdvancedSearch() {
      this.showAdvanced = !this.showAdvanced;
    },
    
    resetFilters() {
      this.filters = {
        bookId: '',
        category: '',
        exactPhrase: false
      };
      this.search();
    },
    
    goToPage(bookId, pageNumber) {
      this.$router.push({
        name: 'reader-page',
        params: { bookId, pageNumber }
      });
    }
  }
}
</script>

<style scoped lang="scss">
.search-results-view {
  max-width: 1000px;
  margin: 0 auto;
  padding: 20px;
}

.search-header {
  margin-bottom: 30px;
  
  h1 {
    font-size: 2rem;
    color: #4a69bd;
    margin-bottom: 10px;
  }
  
  .search-info {
    font-size: 1.1rem;
    color: #666;
    margin-bottom: 20px;
  }
  
  .advanced-search {
    .toggle-button {
      background: none;
      border: none;
      color: #4a69bd;
      cursor: pointer;
      font-size: 1rem;
      font-weight: 600;
      padding: 0;
      margin-bottom: 15px;
      
      &:hover {
        text-decoration: underline;
      }
    }
    
    .advanced-search-panel {
      background-color: #f8f9fa;
      border-radius: 8px;
      padding: 20px;
      margin-bottom: 20px;
      
      .filter-row {
        display: flex;
        flex-wrap: wrap;
        gap: 20px;
        margin-bottom: 15px;
        
        .filter-group {
          flex: 1;
          min-width: 200px;
          
          label {
            display: block;
            margin-bottom: 8px;
            font-weight: 600;
          }
          
          select {
            width: 100%;
            padding: 8px 12px;
            border-radius: 4px;
            border: 1px solid #ddd;
            font-size: 1rem;
            
            &:focus {
              outline: none;
              border-color: #4a69bd;
            }
          }
          
          &.checkbox-group {
            display: flex;
            align-items: center;
            
            .checkbox-label {
              display: flex;
              align-items: center;
              gap: 10px;
              cursor: pointer;
              
              input[type="checkbox"] {
                margin: 0;
              }
            }
          }
        }
      }
      
      .search-actions {
        display: flex;
        gap: 10px;
        margin-top: 20px;
      }
    }
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

.empty-results {
  text-align: center;
  padding: 50px 20px;
  
  p {
    font-size: 1.2rem;
    color: #666;
    margin-bottom: 30px;
  }
  
  .suggestions {
    max-width: 500px;
    margin: 0 auto;
    text-align: left;
    
    h3 {
      font-size: 1.2rem;
      margin-bottom: 15px;
      color: #333;
    }
    
    ul {
      padding-left: 20px;
      
      li {
        margin-bottom: 10px;
        color: #666;
      }
    }
  }
}

.search-results {
  .result-card {
    background-color: #fff;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    overflow: hidden;
    margin-bottom: 20px;
    transition: transform 0.2s, box-shadow 0.2s;
    
    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
    }
    
    .result-header {
      padding: 15px 20px;
      border-bottom: 1px solid #eee;
      display: flex;
      justify-content: space-between;
      align-items: center;
      background-color: #f8f9fa;
      
      .book-title {
        font-size: 1.2rem;
        margin: 0;
        color: #333;
      }
      
      .book-category {
        font-size: 0.9rem;
        color: #666;
        padding: 3px 8px;
        background-color: #e9ecef;
        border-radius: 4px;
      }
    }
    
    .result-content {
      padding: 20px;
      
      .page-info {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 15px;
        
        .page-number {
          font-size: 0.9rem;
          color: #666;
          font-weight: 600;
        }
        
        .go-to-page-btn {
          background-color: #4a69bd;
          color: white;
          border: none;
          padding: 5px 10px;
          border-radius: 4px;
          font-size: 0.9rem;
          cursor: pointer;
          transition: background-color 0.2s;
          
          &:hover {
            background-color: #3b5998;
          }
        }
      }
      
      .content-preview {
        font-size: 1rem;
        line-height: 1.6;
        color: #333;
        
        ::v-deep mark {
          background-color: #fffacd;
          padding: 2px 0;
        }
      }
    }
  }
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

@media (max-width: 768px) {
  .search-header h1 {
    font-size: 1.8rem;
  }
  
  .filter-row {
    flex-direction: column;
    gap: 15px !important;
  }
}
</style>