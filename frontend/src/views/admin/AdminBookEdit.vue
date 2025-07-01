<template>
  <div class="admin-book-edit">
    <div class="page-header">
      <h1>Kitap Düzenle</h1>
      <router-link to="/admin/books" class="back-btn">
        <i class="fas fa-arrow-left"></i> Geri Dön
      </router-link>
    </div>

    <div v-if="loading" class="loading">
      <i class="fas fa-spinner fa-spin"></i> Yükleniyor...
    </div>

    <form v-else @submit.prevent="updateBook" class="book-form">
      <div class="form-group">
        <label for="title">Kitap Başlığı *</label>
        <input 
          id="title"
          v-model="book.title" 
          type="text" 
          required
          placeholder="Örn: Sözler"
        >
      </div>

      <div class="form-row">
        <div class="form-group">
          <label for="category">Kategori *</label>
          <select id="category" v-model="book.category" required>
            <option value="">Seçiniz</option>
            <option value="Sözler">Sözler</option>
            <option value="Mektubat">Mektubat</option>
            <option value="Lem'alar">Lem'alar</option>
            <option value="Şualar">Şualar</option>
            <option value="İşarât-ül İ'caz">İşarât-ül İ'caz</option>
            <option value="Mesnevî-i Nuriye">Mesnevî-i Nuriye</option>
            <option value="Barla Lâhikası">Barla Lâhikası</option>
            <option value="Kastamonu Lâhikası">Kastamonu Lâhikası</option>
            <option value="Emirdağ Lâhikası">Emirdağ Lâhikası</option>
            <option value="Diğer">Diğer</option>
          </select>
        </div>

        <div class="form-group">
          <label for="publishYear">Yayın Yılı</label>
          <input 
            id="publishYear"
            v-model.number="book.publishYear" 
            type="number" 
            min="1900" 
            max="2030"
            placeholder="Örn: 1926"
          >
        </div>
      </div>

      <div class="form-row">
        <div class="form-group">
          <label for="order">Sıra No *</label>
          <input 
            id="order"
            v-model.number="book.order" 
            type="number" 
            required
            min="1"
            placeholder="1"
          >
        </div>

        <div class="form-group">
          <label for="totalPages">Sayfa Sayısı</label>
          <input 
            id="totalPages"
            v-model.number="book.totalPages" 
            type="number" 
            min="1"
            placeholder="0"
          >
        </div>
      </div>

      <div class="form-group">
        <label for="coverImage">Kapak Resmi URL'si</label>
        <input 
          id="coverImage"
          v-model="book.coverImage" 
          type="text"
          placeholder="/covers/sozler.jpg"
        >
      </div>

      <div class="form-group">
        <label for="description">Açıklama *</label>
        <textarea 
          id="description"
          v-model="book.description" 
          rows="4"
          required
          placeholder="Kitap hakkında kısa açıklama..."
        ></textarea>
      </div>

      <div class="form-info">
        <p><strong>Oluşturulma:</strong> {{ formatDate(book.createdAt) }}</p>
        <p><strong>Son Güncelleme:</strong> {{ formatDate(book.updatedAt) }}</p>
      </div>

      <div class="form-actions">
        <button type="submit" class="submit-btn" :disabled="saving">
          <i v-if="saving" class="fas fa-spinner fa-spin"></i>
          {{ saving ? 'Kaydediliyor...' : 'Değişiklikleri Kaydet' }}
        </button>
        <router-link to="/admin/books" class="cancel-btn">İptal</router-link>
      </div>
    </form>
  </div>
</template>

<script>
import axios from '@/utils/axios';

export default {
  name: 'AdminBookEdit',
  props: {
    id: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      book: {
        title: '',
        author: 'Bediüzzaman Said Nursi',
        category: '',
        description: '',
        coverImage: '',
        publishYear: null,
        order: 1,
        totalPages: 0
      },
      loading: true,
      saving: false
    };
  },
  mounted() {
    this.loadBook();
  },
  methods: {
    async loadBook() {
      try {
        const response = await axios.get(`/books/${this.id}`);
        this.book = response.data;
        this.loading = false;
      } catch (error) {
        console.error('Kitap yüklenemedi:', error);
        alert('Kitap yüklenirken bir hata oluştu!');
        this.$router.push('/admin/books');
      }
    },
    
    async updateBook() {
      this.saving = true;
      
      try {
        const bookData = { ...this.book };
        delete bookData._id;
        delete bookData.__v;
        delete bookData.createdAt;
        delete bookData.updatedAt;
        
        await axios.put(`/books/${this.id}`, bookData);
        
        alert('Kitap başarıyla güncellendi!');
        this.$router.push('/admin/books');
      } catch (error) {
        console.error('Kitap güncellenirken hata:', error);
        alert('Kitap güncellenirken bir hata oluştu: ' + (error.response?.data?.message || error.message));
      } finally {
        this.saving = false;
      }
    },
    
    formatDate(dateString) {
      if (!dateString) return '-';
      const date = new Date(dateString);
      return date.toLocaleDateString('tr-TR') + ' ' + date.toLocaleTimeString('tr-TR');
    }
  }
};
</script>

<style scoped>
.admin-book-edit {
  padding: 20px;
  max-width: 800px;
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

.back-btn {
  color: #666;
  text-decoration: none;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  border: 1px solid #ddd;
  border-radius: 5px;
  transition: all 0.2s;
}

.back-btn:hover {
  background: #f8f9fa;
  color: #333;
}

.loading {
  text-align: center;
  padding: 50px;
  font-size: 18px;
  color: #666;
}

.book-form {
  background: white;
  padding: 30px;
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

.form-group {
  margin-bottom: 20px;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #555;
}

.form-group input,
.form-group select,
.form-group textarea {
  width: 100%;
  padding: 10px 15px;
  border: 1px solid #ddd;
  border-radius: 5px;
  font-size: 16px;
  font-family: inherit;
}

.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #3498db;
  box-shadow: 0 0 0 2px rgba(52, 152, 219, 0.2);
}

.form-group textarea {
  resize: vertical;
}

.form-info {
  background: #f8f9fa;
  padding: 15px;
  border-radius: 5px;
  margin: 20px 0;
}

.form-info p {
  margin: 5px 0;
  color: #666;
}

.form-actions {
  display: flex;
  gap: 15px;
  margin-top: 30px;
  padding-top: 20px;
  border-top: 1px solid #eee;
}

.submit-btn {
  background: #3498db;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 5px;
  font-size: 16px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: background 0.2s;
}

.submit-btn:hover:not(:disabled) {
  background: #2980b9;
}

.submit-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.cancel-btn {
  background: #95a5a6;
  color: white;
  padding: 12px 24px;
  border-radius: 5px;
  text-decoration: none;
  font-size: 16px;
  transition: background 0.2s;
}

.cancel-btn:hover {
  background: #7f8c8d;
}

/* Responsive */
@media (max-width: 768px) {
  .form-row {
    grid-template-columns: 1fr;
  }
  
  .book-form {
    padding: 20px;
  }
}
</style>