<template>
  <div class="admin-dictionary">
    <div class="page-header">
      <h1>Sözlük Yönetimi</h1>
      <button @click="showAddModal = true" class="add-btn">
        <i class="fas fa-plus"></i> Yeni Kelime Ekle
      </button>
    </div>

    <div class="search-box">
      <input 
        v-model="searchQuery" 
        type="text" 
        placeholder="Kelime ara..."
        @input="searchWords"
      >
    </div>

    <div v-if="loading" class="loading">
      <i class="fas fa-spinner fa-spin"></i> Yükleniyor...
    </div>

    <div v-else class="words-grid">
      <div v-for="word in filteredWords" :key="word._id" class="word-card">
        <div class="word-header">
          <h3>{{ word.word }}</h3>
          <div class="word-actions">
            <button @click="editWord(word)" class="edit-btn" title="Düzenle">
              <i class="fas fa-edit"></i>
            </button>
            <button @click="deleteWord(word._id)" class="delete-btn" title="Sil">
              <i class="fas fa-trash"></i>
            </button>
          </div>
        </div>
        <p class="word-meaning">{{ word.meaning }}</p>
        <p v-if="word.example" class="word-example">
          <strong>Örnek:</strong> {{ word.example }}
        </p>
      </div>
    </div>

    <div v-if="!loading && filteredWords.length === 0" class="no-data">
      <i class="fas fa-language"></i>
      <p>Henüz kelime bulunmuyor.</p>
    </div>

    <!-- Add/Edit Modal -->
    <div v-if="showAddModal || showEditModal" class="modal-overlay" @click.self="closeModals">
      <div class="modal-content">
        <h2>{{ showEditModal ? 'Kelime Düzenle' : 'Yeni Kelime Ekle' }}</h2>
        
        <form @submit.prevent="saveWord">
          <div class="form-group">
            <label>Kelime (Osmanlıca/Arapça) *</label>
            <input 
              v-model="currentWord.word" 
              type="text" 
              required
              placeholder="حقيقت"
              dir="rtl"
            >
          </div>
          
          <div class="form-group">
            <label>Anlamı (Türkçe) *</label>
            <input 
              v-model="currentWord.meaning" 
              type="text" 
              required
              placeholder="Hakikat - Gerçek, doğru"
            >
          </div>
          
          <div class="form-group">
            <label>Örnek Kullanım</label>
            <textarea 
              v-model="currentWord.example" 
              rows="3"
              placeholder="Hakikat-i imaniye"
            ></textarea>
          </div>
          
          <div class="modal-actions">
            <button type="submit" class="primary-btn" :disabled="saving">
              <i v-if="saving" class="fas fa-spinner fa-spin"></i>
              {{ saving ? 'Kaydediliyor...' : 'Kaydet' }}
            </button>
            <button type="button" @click="closeModals" class="secondary-btn">İptal</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import axios from '@/utils/axios';

export default {
  name: 'AdminDictionary',
  data() {
    return {
      words: [],
      filteredWords: [],
      searchQuery: '',
      loading: true,
      showAddModal: false,
      showEditModal: false,
      saving: false,
      currentWord: {
        word: '',
        meaning: '',
        example: ''
      }
    };
  },
  mounted() {
    this.loadWords();
  },
  methods: {
    async loadWords() {
      try {
        const response = await axios.get('/dictionary');
        this.words = response.data;
        this.filteredWords = this.words;
        this.loading = false;
      } catch (error) {
        console.error('Kelimeler yüklenemedi:', error);
        this.loading = false;
      }
    },
    
    searchWords() {
      const query = this.searchQuery.toLowerCase();
      this.filteredWords = this.words.filter(word => 
        word.word.toLowerCase().includes(query) ||
        word.meaning.toLowerCase().includes(query) ||
        (word.example && word.example.toLowerCase().includes(query))
      );
    },
    
    editWord(word) {
      this.currentWord = { ...word };
      this.showEditModal = true;
    },
    
    async saveWord() {
      this.saving = true;
      
      try {
        if (this.showEditModal) {
          // Güncelleme
          await axios.put(`/dictionary/${this.currentWord._id}`, {
            word: this.currentWord.word,
            meaning: this.currentWord.meaning,
            example: this.currentWord.example
          });
          
          // Listede güncelle
          const index = this.words.findIndex(w => w._id === this.currentWord._id);
          if (index !== -1) {
            this.words[index] = { ...this.currentWord };
          }
        } else {
          // Yeni ekleme
          const response = await axios.post('/dictionary', this.currentWord);
          this.words.unshift(response.data);
        }
        
        this.searchWords();
        this.closeModals();
        alert(this.showEditModal ? 'Kelime güncellendi!' : 'Kelime eklendi!');
      } catch (error) {
        console.error('Kelime kaydedilemedi:', error);
        alert('Hata: ' + (error.response?.data?.message || error.message));
      } finally {
        this.saving = false;
      }
    },
    
    async deleteWord(wordId) {
      if (!confirm('Bu kelimeyi silmek istediğinizden emin misiniz?')) {
        return;
      }
      
      try {
        await axios.delete(`/dictionary/${wordId}`);
        this.words = this.words.filter(w => w._id !== wordId);
        this.searchWords();
        alert('Kelime silindi!');
      } catch (error) {
        console.error('Kelime silinemedi:', error);
        alert('Kelime silinirken bir hata oluştu.');
      }
    },
    
    closeModals() {
      this.showAddModal = false;
      this.showEditModal = false;
      this.currentWord = {
        word: '',
        meaning: '',
        example: ''
      };
    }
  }
};
</script>

<style scoped>
.admin-dictionary {
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

.add-btn {
  background: #3498db;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 5px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: background 0.2s;
}

.add-btn:hover {
  background: #2980b9;
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

.words-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

.word-card {
  background: white;
  border-radius: 10px;
  padding: 20px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  transition: transform 0.2s, box-shadow 0.2s;
}

.word-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 5px 20px rgba(0,0,0,0.15);
}

.word-header {
  display: flex;
  justify-content: space-between;
  align-items: start;
  margin-bottom: 10px;
}

.word-header h3 {
  margin: 0;
  font-size: 24px;
  color: #2c3e50;
  direction: rtl;
  font-family: 'Noto Naskh Arabic', Arial, sans-serif;
}

.word-actions {
  display: flex;
  gap: 5px;
}

.edit-btn,
.delete-btn {
  width: 30px;
  height: 30px;
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

.word-meaning {
  color: #555;
  margin: 10px 0;
  line-height: 1.5;
}

.word-example {
  color: #777;
  font-size: 14px;
  font-style: italic;
  margin: 10px 0 0;
  padding-top: 10px;
  border-top: 1px solid #eee;
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

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  padding: 30px;
  border-radius: 10px;
  max-width: 500px;
  width: 90%;
}

.modal-content h2 {
  margin-top: 0;
  margin-bottom: 20px;
  color: #2c3e50;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #555;
}

.form-group input,
.form-group textarea {
  width: 100%;
  padding: 10px 15px;
  border: 1px solid #ddd;
  border-radius: 5px;
  font-size: 16px;
  font-family: inherit;
}

.form-group input:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #3498db;
  box-shadow: 0 0 0 2px rgba(52, 152, 219, 0.2);
}

.form-group textarea {
  resize: vertical;
}

.modal-actions {
  display: flex;
  gap: 15px;
  justify-content: flex-end;
  margin-top: 25px;
}

.primary-btn,
.secondary-btn {
  padding: 10px 20px;
  border: none;
  border-radius: 5px;
  font-size: 16px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s;
}

.primary-btn {
  background: #3498db;
  color: white;
}

.primary-btn:hover:not(:disabled) {
  background: #2980b9;
}

.primary-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.secondary-btn {
  background: #95a5a6;
  color: white;
}

.secondary-btn:hover {
  background: #7f8c8d;
}

/* Responsive */
@media (max-width: 768px) {
  .words-grid {
    grid-template-columns: 1fr;
  }
  
  .page-header {
    flex-direction: column;
    gap: 15px;
    align-items: stretch;
  }
  
  .add-btn {
    justify-content: center;
  }
}
</style>