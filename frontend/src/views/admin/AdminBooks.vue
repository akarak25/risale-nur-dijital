<template>
  <div class="admin-books">
    <div class="page-header">
      <h1>Kitap Yönetimi</h1>
      <div class="header-actions">
        <router-link to="/admin/books/import" class="import-btn">
          <i class="fas fa-file-import"></i> Toplu İçe Aktar
        </router-link>
        <router-link to="/admin/books/import-single" class="single-import-btn">
          <i class="fas fa-book-medical"></i> Tekli Kitap Ekle
        </router-link>
        <router-link to="/admin/books/add" class="add-btn">
          <i class="fas fa-plus"></i> Hızlı Ekle
        </router-link>
      </div>
    </div>

    <div class="search-box">
      <input 
        v-model="searchQuery" 
        type="text" 
        placeholder="Kitap ara..."
        @input="searchBooks"
      >
    </div>

    <div v-if="loading" class="loading">
      <i class="fas fa-spinner fa-spin"></i> Yükleniyor...
    </div>

    <div v-else class="books-table">
      <table>
        <thead>
          <tr>
            <th>Sıra</th>
            <th>Başlık</th>
            <th>Kategori</th>
            <th>Sayfa Sayısı</th>
            <th>Yayın Yılı</th>
            <th>İşlemler</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="book in filteredBooks" :key="book._id">
            <td>{{ book.order }}</td>
            <td>{{ book.title }}</td>
            <td>{{ book.category }}</td>
            <td>{{ book.totalPages || 0 }}</td>
            <td>{{ book.publishYear }}</td>
            <td class="actions">
              <router-link 
                :to="`/admin/books/${book._id}/edit`" 
                class="edit-btn"
                title="Düzenle"
              >
                <i class="fas fa-edit"></i>
              </router-link>
              <button 
                @click="deleteBook(book._id)" 
                class="delete-btn"
                title="Sil"
              >
                <i class="fas fa-trash"></i>
              </button>
              <router-link 
                :to="`/read/${book._id}`" 
                class="view-btn"
                title="Görüntüle"
              >
                <i class="fas fa-eye"></i>
              </router-link>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-if="!loading && filteredBooks.length === 0" class="no-data">
      <i class="fas fa-book"></i>
      <p>Henüz kitap bulunmuyor.</p>
    </div>
  </div>
</template>

<script>
import axios from '@/utils/axios';

export default {
  name: 'AdminBooks',
  data() {
    return {
      books: [],
      filteredBooks: [],
      searchQuery: '',
      loading: true
    };
  },
  mounted() {
    this.loadBooks();
  },
  methods: {
    async loadBooks() {
      try {
        const response = await axios.get('/books');
        this.books = response.data;
        this.filteredBooks = this.books;
        this.loading = false;
      } catch (error) {
        console.error('Kitaplar yüklenemedi:', error);
        this.loading = false;
      }
    },
    
    searchBooks() {
      const query = this.searchQuery.toLowerCase();
      this.filteredBooks = this.books.filter(book => 
        book.title.toLowerCase().includes(query) ||
        book.category.toLowerCase().includes(query)
      );
    },
    
    async deleteBook(bookId) {
      if (!confirm('Bu kitabı silmek istediğinizden emin misiniz?')) {
        return;
      }
      
      try {
        await axios.delete(`/books/${bookId}`);
        this.books = this.books.filter(b => b._id !== bookId);
        this.searchBooks();
        alert('Kitap başarıyla silindi!');
      } catch (error) {
        console.error('Kitap silinemedi:', error);
        alert('Kitap silinirken bir hata oluştu.');
      }
    }
  }
};
</script>

<style scoped>
.admin-books {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
}

.page-header h1 {
  margin: 0;
  color: #2c3e50;
}

.header-actions {
  display: flex;
  gap: 15px;
  align-items: center;
}

.add-btn,
.import-btn,
.single-import-btn {
  padding: 10px 20px;
  border-radius: 5px;
  text-decoration: none;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: background 0.2s;
}

.add-btn {
  background: #3498db;
  color: white;
}

.add-btn:hover {
  background: #2980b9;
}

.import-btn {
  background: #2ecc71;
  color: white;
}

.import-btn:hover {
  background: #27ae60;
}

.single-import-btn {
  background: #e67e22;
  color: white;
}

.single-import-btn:hover {
  background: #d35400;
}

.search-box {
  margin-bottom: 20px;
}

.search-box input {
  width: 100%;
  max-width: 400px;
  padding: 10px 15px;
  border: 1px solid #ddd;
  border-radius: 5px;
  font-size: 16px;
}

.loading {
  text-align: center;
  padding: 50px;
  font-size: 18px;
  color: #666;
}

.books-table {
  background: white;
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

.books-table table {
  width: 100%;
  border-collapse: collapse;
}

.books-table th {
  background: #34495e;
  color: white;
  padding: 15px;
  text-align: left;
  font-weight: 500;
}

.books-table td {
  padding: 15px;
  border-bottom: 1px solid #eee;
}

.books-table tbody tr:hover {
  background: #f8f9fa;
}

.actions {
  display: flex;
  gap: 10px;
}

.edit-btn,
.delete-btn,
.view-btn {
  width: 35px;
  height: 35px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.edit-btn {
  background: #f39c12;
  color: white;
}

.edit-btn:hover {
  background: #e67e22;
}

.delete-btn {
  background: #e74c3c;
  color: white;
}

.delete-btn:hover {
  background: #c0392b;
}

.view-btn {
  background: #2ecc71;
  color: white;
}

.view-btn:hover {
  background: #27ae60;
}

.no-data {
  text-align: center;
  padding: 50px;
  color: #999;
}

.no-data i {
  font-size: 48px;
  margin-bottom: 15px;
}

/* Responsive */
@media (max-width: 768px) {
  .books-table {
    overflow-x: auto;
  }
  
  .books-table table {
    min-width: 600px;
  }
}
</style>