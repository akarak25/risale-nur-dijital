<template>
  <div class="bookmarks-view">
    <div class="bookmarks-header">
      <h1>Yer İmlerim</h1>
      <p class="description">Kaydettiğiniz tüm yer imlerini burada görüntüleyebilir ve yönetebilirsiniz.</p>
    </div>
    
    <div v-if="loading" class="loading-overlay">
      <div class="loading-spinner"></div>
      <p>Yer imleri yükleniyor...</p>
    </div>
    
    <div v-else-if="bookmarks.length === 0" class="empty-bookmarks">
      <div class="empty-icon">🔖</div>
      <h2>Henüz Yer İmi Eklenmemiş</h2>
      <p>Kitap okurken sayfaları kaydetmek için yer imi özelliğini kullanabilirsiniz.</p>
      <router-link to="/bookshelf" class="btn btn-primary">Kitaplığa Git</router-link>
    </div>
    
    <div v-else class="bookmarks-container">
      <div class="filter-bar">
        <div class="search-box">
          <input 
            type="text" 
            v-model="searchQuery" 
            placeholder="Yer imlerinde ara..." 
            @input="filterBookmarks"
          />
        </div>
        
        <div class="sort-options">
          <label for="sort-select">Sıralama:</label>
          <select id="sort-select" v-model="sortOption" @change="sortBookmarks">
            <option value="date-desc">En Yeni</option>
            <option value="date-asc">En Eski</option>
            <option value="name-asc">İsim (A-Z)</option>
            <option value="name-desc">İsim (Z-A)</option>
          </select>
        </div>
      </div>
      
      <div class="bookmarks-grid">
        <div 
          v-for="bookmark in filteredBookmarks" 
          :key="bookmark._id"
          class="bookmark-card"
        >
          <div class="bookmark-indicator" :style="{ backgroundColor: bookmark.color }"></div>
          <div class="bookmark-content">
            <h3 class="bookmark-name">{{ bookmark.name }}</h3>
            
            <div class="bookmark-details">
              <div class="book-info">
                <p class="book-title">{{ getBookTitle(bookmark.bookId) }}</p>
                <p class="page-number">Sayfa {{ bookmark.pageNumber }}</p>
              </div>
              
              <div class="bookmark-date">
                {{ formatDate(bookmark.createdAt) }}
              </div>
            </div>
            
            <div class="bookmark-actions">
              <button @click="goToBookmark(bookmark)" class="action-btn goto">
                <span class="action-icon">📖</span>
                <span class="action-text">Sayfaya Git</span>
              </button>
              
              <button @click="editBookmark(bookmark)" class="action-btn edit">
                <span class="action-icon">✏️</span>
                <span class="action-text">Düzenle</span>
              </button>
              
              <button @click="deleteBookmark(bookmark)" class="action-btn delete">
                <span class="action-icon">🗑️</span>
                <span class="action-text">Sil</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Edit Bookmark Modal -->
    <div v-if="showEditModal" class="modal-overlay">
      <div class="modal-dialog">
        <div class="modal-header">
          <h3>Yer İmini Düzenle</h3>
          <button @click="closeEditModal" class="modal-close">×</button>
        </div>
        
        <div class="modal-body">
          <div class="form-group">
            <label for="bookmark-name">Yer İmi Adı:</label>
            <input 
              type="text" 
              id="bookmark-name"
              v-model="editingBookmark.name" 
              placeholder="Yer imi adını girin..."
              class="form-control"
            >
          </div>
          
          <div class="bookmark-colors">
            <div class="color-label">Yer İmi Rengi:</div>
            <div class="color-options">
              <span 
                v-for="color in bookmarkColors" 
                :key="color"
                :style="{ backgroundColor: color }"
                :class="['color-option', { selected: editingBookmark.color === color }]"
                @click="editingBookmark.color = color"
              ></span>
            </div>
          </div>
        </div>
        
        <div class="modal-footer">
          <button @click="closeEditModal" class="btn btn-secondary">İptal</button>
          <button @click="saveEditedBookmark" class="btn btn-primary">Kaydet</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'BookmarksView',
  data() {
    return {
      loading: true,
      searchQuery: '',
      sortOption: 'date-desc',
      filteredBookmarks: [],
      showEditModal: false,
      editingBookmark: {
        _id: null,
        name: '',
        color: ''
      },
      bookmarkColors: ['#e74c3c', '#3498db', '#2ecc71', '#f39c12', '#9b59b6']
    };
  },
  computed: {
    bookmarks() {
      return this.$store.state.bookmarks;
    },
    books() {
      return this.$store.state.books;
    }
  },
  created() {
    this.fetchData();
  },
  methods: {
    async fetchData() {
      this.loading = true;
      try {
        // Tüm kitapları getir (kitap bilgileri için)
        if (this.books.length === 0) {
          await this.$store.dispatch('fetchBooks');
        }
        
        // Kullanıcının yer imlerini getir
        // Not: Gerçek uygulamada kullanıcı ID'si olacaktır
        const userId = 'user123';
        await this.$store.dispatch('fetchUserBookmarks', userId);
        
        // Filtreleme ve sıralama uygula
        this.filterBookmarks();
      } catch (error) {
        console.error('Yer imleri yüklenirken hata oluştu:', error);
      } finally {
        this.loading = false;
      }
    },
    
    filterBookmarks() {
      // Arama sorgusuna göre filtrele
      const query = this.searchQuery.toLowerCase().trim();
      
      if (query === '') {
        this.filteredBookmarks = [...this.bookmarks];
      } else {
        this.filteredBookmarks = this.bookmarks.filter(bookmark => {
          // Yer imi adında ara
          if (bookmark.name.toLowerCase().includes(query)) {
            return true;
          }
          
          // Kitap adında ara
          const book = this.getBook(bookmark.bookId);
          if (book && book.title.toLowerCase().includes(query)) {
            return true;
          }
          
          return false;
        });
      }
      
      // Sıralamayla devam et
      this.sortBookmarks();
    },
    
    sortBookmarks() {
      // Seçilen sıralama seçeneğine göre sırala
      switch (this.sortOption) {
        case 'date-desc':
          this.filteredBookmarks.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
          break;
        case 'date-asc':
          this.filteredBookmarks.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
          break;
        case 'name-asc':
          this.filteredBookmarks.sort((a, b) => a.name.localeCompare(b.name));
          break;
        case 'name-desc':
          this.filteredBookmarks.sort((a, b) => b.name.localeCompare(a.name));
          break;
      }
    },
    
    getBook(bookId) {
      return this.books.find(book => book._id === bookId);
    },
    
    getBookTitle(bookId) {
      const book = this.getBook(bookId);
      return book ? book.title : 'Bilinmeyen Kitap';
    },
    
    formatDate(dateString) {
      const date = new Date(dateString);
      return new Intl.DateTimeFormat('tr-TR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      }).format(date);
    },
    
    goToBookmark(bookmark) {
      this.$router.push({
        name: 'reader-page',
        params: {
          bookId: bookmark.bookId,
          pageNumber: bookmark.pageNumber
        }
      });
    },
    
    editBookmark(bookmark) {
      this.editingBookmark = {
        _id: bookmark._id,
        name: bookmark.name,
        color: bookmark.color
      };
      this.showEditModal = true;
    },
    
    async saveEditedBookmark() {
      if (!this.editingBookmark.name.trim()) {
        alert('Yer imi adı boş olamaz!');
        return;
      }
      
      try {
        await this.$store.dispatch('updateBookmark', {
          id: this.editingBookmark._id,
          data: {
            name: this.editingBookmark.name,
            color: this.editingBookmark.color
          }
        });
        
        this.closeEditModal();
      } catch (error) {
        console.error('Yer imi güncellenirken hata oluştu:', error);
        alert('Yer imi güncellenirken bir hata oluştu.');
      }
    },
    
    async deleteBookmark(bookmark) {
      if (confirm(`"${bookmark.name}" yer imini silmek istediğinizden emin misiniz?`)) {
        try {
          await this.$store.dispatch('deleteBookmark', bookmark._id);
        } catch (error) {
          console.error('Yer imi silinirken hata oluştu:', error);
          alert('Yer imi silinirken bir hata oluştu.');
        }
      }
    },
    
    closeEditModal() {
      this.showEditModal = false;
      this.editingBookmark = {
        _id: null,
        name: '',
        color: ''
      };
    }
  }
}
</script>

<style scoped lang="scss">
.bookmarks-view {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.bookmarks-header {
  text-align: center;
  margin-bottom: 40px;
  
  h1 {
    font-size: 2.2rem;
    color: #4a69bd;
    margin-bottom: 10px;
  }
  
  .description {
    font-size: 1.1rem;
    color: #666;
    max-width: 600px;
    margin: 0 auto;
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

.empty-bookmarks {
  text-align: center;
  padding: 60px 20px;
  
  .empty-icon {
    font-size: 5rem;
    margin-bottom: 20px;
  }
  
  h2 {
    font-size: 1.8rem;
    color: #333;
    margin-bottom: 15px;
  }
  
  p {
    font-size: 1.1rem;
    color: #666;
    max-width: 500px;
    margin: 0 auto 30px;
  }
  
  .btn {
    padding: 10px 20px;
    font-size: 1.1rem;
  }
}

.bookmarks-container {
  .filter-bar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 30px;
    background-color: #f8f9fa;
    padding: 15px 20px;
    border-radius: 8px;
    
    .search-box {
      flex: 1;
      max-width: 400px;
      
      input {
        width: 100%;
        padding: 10px 15px;
        border: 1px solid #ddd;
        border-radius: 4px;
        font-size: 1rem;
        
        &:focus {
          outline: none;
          border-color: #4a69bd;
        }
      }
    }
    
    .sort-options {
      display: flex;
      align-items: center;
      
      label {
        margin-right: 10px;
        font-weight: 600;
      }
      
      select {
        padding: 8px 12px;
        border: 1px solid #ddd;
        border-radius: 4px;
        font-size: 1rem;
        background-color: #fff;
        
        &:focus {
          outline: none;
          border-color: #4a69bd;
        }
      }
    }
  }
  
  .bookmarks-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 20px;
    
    .bookmark-card {
      background-color: #fff;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      display: flex;
      transition: transform 0.2s, box-shadow 0.2s;
      
      &:hover {
        transform: translateY(-3px);
        box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
      }
      
      .bookmark-indicator {
        width: 8px;
        background-color: #e74c3c;
      }
      
      .bookmark-content {
        flex: 1;
        padding: 20px;
        
        .bookmark-name {
          font-size: 1.3rem;
          margin: 0 0 15px 0;
          color: #333;
        }
        
        .bookmark-details {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 20px;
          
          .book-info {
            .book-title {
              font-size: 1rem;
              font-weight: 600;
              margin: 0 0 5px 0;
              color: #4a69bd;
            }
            
            .page-number {
              font-size: 0.9rem;
              color: #666;
              margin: 0;
            }
          }
          
          .bookmark-date {
            font-size: 0.8rem;
            color: #999;
            background-color: #f8f9fa;
            padding: 3px 8px;
            border-radius: 4px;
          }
        }
        
        .bookmark-actions {
          display: flex;
          gap: 10px;
          
          .action-btn {
            flex: 1;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: 10px;
            border: none;
            border-radius: 4px;
            background-color: #f8f9fa;
            cursor: pointer;
            transition: background-color 0.2s;
            
            .action-icon {
              font-size: 1.2rem;
              margin-bottom: 5px;
            }
            
            .action-text {
              font-size: 0.8rem;
            }
            
            &.goto:hover {
              background-color: #e3f2fd;
            }
            
            &.edit:hover {
              background-color: #e8f5e9;
            }
            
            &.delete:hover {
              background-color: #ffebee;
            }
          }
        }
      }
    }
  }
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  
  .modal-dialog {
    width: 90%;
    max-width: 500px;
    background-color: #fff;
    border-radius: 8px;
    overflow: hidden;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    
    .modal-header {
      padding: 15px 20px;
      border-bottom: 1px solid #eee;
      display: flex;
      justify-content: space-between;
      align-items: center;
      
      h3 {
        margin: 0;
        font-size: 1.3rem;
      }
      
      .modal-close {
        background: none;
        border: none;
        font-size: 1.5rem;
        cursor: pointer;
        color: #666;
        
        &:hover {
          color: #333;
        }
      }
    }
    
    .modal-body {
      padding: 20px;
      
      .form-group {
        margin-bottom: 20px;
        
        label {
          display: block;
          margin-bottom: 8px;
          font-weight: 600;
        }
        
        .form-control {
          width: 100%;
          padding: 10px;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-size: 1rem;
          
          &:focus {
            outline: none;
            border-color: #4a69bd;
          }
        }
      }
      
      .bookmark-colors {
        .color-label {
          margin-bottom: 10px;
          font-weight: 600;
        }
        
        .color-options {
          display: flex;
          gap: 10px;
          
          .color-option {
            width: 30px;
            height: 30px;
            border-radius: 50%;
            cursor: pointer;
            transition: transform 0.2s;
            
            &:hover {
              transform: scale(1.1);
            }
            
            &.selected {
              box-shadow: 0 0 0 2px #fff, 0 0 0 4px #333;
            }
          }
        }
      }
    }
    
    .modal-footer {
      padding: 15px 20px;
      border-top: 1px solid #eee;
      display: flex;
      justify-content: flex-end;
      gap: 10px;
    }
  }
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

@media (max-width: 768px) {
  .bookmarks-header h1 {
    font-size: 1.8rem;
  }
  
  .filter-bar {
    flex-direction: column;
    gap: 15px;
    
    .search-box {
      max-width: 100%;
    }
  }
  
  .bookmarks-grid {
    grid-template-columns: 1fr;
  }
}
</style>