<template>
  <div class="admin-dashboard">
    <div class="admin-header">
      <h1>Risale-i Nur Yönetim Paneli</h1>
      <button @click="logout" class="logout-btn">
        <i class="fas fa-sign-out-alt"></i> Çıkış
      </button>
    </div>

    <div class="admin-stats">
      <div class="stat-card">
        <i class="fas fa-book"></i>
        <h3>{{ stats.totalBooks }}</h3>
        <p>Toplam Kitap</p>
      </div>
      <div class="stat-card">
        <i class="fas fa-file-alt"></i>
        <h3>{{ stats.totalPages }}</h3>
        <p>Toplam Sayfa</p>
      </div>
      <div class="stat-card">
        <i class="fas fa-language"></i>
        <h3>{{ stats.totalWords }}</h3>
        <p>Sözlük Kelimesi</p>
      </div>
      <div class="stat-card">
        <i class="fas fa-users"></i>
        <h3>{{ stats.totalUsers }}</h3>
        <p>Kayıtlı Kullanıcı</p>
      </div>
    </div>

    <div class="admin-actions">
      <div class="action-section">
        <h2><i class="fas fa-upload"></i> İçerik Aktarma</h2>
        <div class="import-options">
          <button @click="showImportModal = true" class="primary-btn">
            <i class="fas fa-file-import"></i> Diyanet Verilerini Aktar
          </button>
          <button @click="showBulkImport = true" class="secondary-btn">
            <i class="fas fa-folder-plus"></i> Klasörden Kitap Ekle
          </button>
        </div>
      </div>

      <div class="action-section">
        <h2><i class="fas fa-book-medical"></i> Kitap Yönetimi</h2>
        <div class="book-actions">
          <router-link to="/admin/books" class="action-btn">
            <i class="fas fa-list"></i> Kitapları Listele
          </router-link>
          <router-link to="/admin/books/add" class="action-btn">
            <i class="fas fa-plus"></i> Yeni Kitap Ekle
          </router-link>
        </div>
      </div>

      <div class="action-section">
        <h2><i class="fas fa-spell-check"></i> Sözlük Yönetimi</h2>
        <div class="dictionary-actions">
          <router-link to="/admin/dictionary" class="action-btn">
            <i class="fas fa-list"></i> Kelimeleri Listele
          </router-link>
          <button @click="showDictionaryImport = true" class="action-btn">
            <i class="fas fa-file-upload"></i> Sözlük İçe Aktar
          </button>
        </div>
      </div>
    </div>

    <!-- Diyanet Import Modal -->
    <div v-if="showImportModal" class="modal-overlay" @click.self="showImportModal = false">
      <div class="modal-content">
        <h2>Diyanet Verilerini İçe Aktar</h2>
        <div class="import-form">
          <div class="form-group">
            <label>Veri Formatı:</label>
            <select v-model="importSettings.format">
              <option value="html">HTML Format</option>
              <option value="txt">TXT Format</option>
            </select>
          </div>
          
          <div class="form-group">
            <label>Kitap Seçimi:</label>
            <div class="book-selection">
              <label class="checkbox-label">
                <input type="checkbox" v-model="selectAll" @change="toggleSelectAll">
                Tümünü Seç
              </label>
              <div class="book-list">
                <label v-for="book in availableBooks" :key="book.id" class="checkbox-label">
                  <input type="checkbox" v-model="selectedBooks" :value="book.id">
                  {{ book.name }}
                </label>
              </div>
            </div>
          </div>

          <div class="form-actions">
            <button @click="startImport" class="primary-btn" :disabled="importing">
              <i v-if="importing" class="fas fa-spinner fa-spin"></i>
              {{ importing ? 'Aktarılıyor...' : 'Aktarmayı Başlat' }}
            </button>
            <button @click="showImportModal = false" class="secondary-btn">İptal</button>
          </div>
        </div>

        <div v-if="importProgress.show" class="import-progress">
          <div class="progress-bar">
            <div class="progress-fill" :style="{width: importProgress.percent + '%'}"></div>
          </div>
          <p>{{ importProgress.current }} / {{ importProgress.total }} - {{ importProgress.message }}</p>
        </div>
      </div>
    </div>

    <!-- Bulk Import Modal -->
    <div v-if="showBulkImport" class="modal-overlay" @click.self="showBulkImport = false">
      <div class="modal-content">
        <h2>Klasörden Toplu Kitap Ekleme</h2>
        <div class="bulk-import-form">
          <div class="form-group">
            <label>Klasör Yolu:</label>
            <input v-model="bulkImportPath" type="text" placeholder="C:\kitaplar">
          </div>
          
          <div class="info-box">
            <h4>Klasör Yapısı:</h4>
            <pre>
kitaplar/
├── sozler/
│   ├── metadata.json
│   ├── sayfa-001.txt
│   └── sayfa-002.txt
└── mektubat/
    ├── metadata.json
    └── sayfa-001.txt
            </pre>
          </div>

          <div class="form-actions">
            <button @click="startBulkImport" class="primary-btn">
              <i class="fas fa-folder-open"></i> Klasörü Tara ve Ekle
            </button>
            <button @click="showBulkImport = false" class="secondary-btn">İptal</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Dictionary Import Modal -->
    <div v-if="showDictionaryImport" class="modal-overlay" @click.self="showDictionaryImport = false">
      <div class="modal-content">
        <h2>Sözlük İçe Aktarma</h2>
        <div class="dictionary-import-form">
          <div class="form-group">
            <label>Dosya Seçin:</label>
            <input type="file" @change="handleDictionaryFile" accept=".json,.csv">
          </div>
          
          <div class="form-group">
            <label>Veya JSON Formatında Yapıştırın:</label>
            <textarea v-model="dictionaryJson" rows="10" placeholder='[{"word": "حقيقت", "meaning": "Hakikat", "example": "..."}]'></textarea>
          </div>

          <div class="form-actions">
            <button @click="importDictionary" class="primary-btn">
              <i class="fas fa-upload"></i> Sözlüğü İçe Aktar
            </button>
            <button @click="showDictionaryImport = false" class="secondary-btn">İptal</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from '@/utils/axios';

export default {
  name: 'AdminDashboard',
  data() {
    return {
      stats: {
        totalBooks: 0,
        totalPages: 0,
        totalWords: 0,
        totalUsers: 0
      },
      showImportModal: false,
      showBulkImport: false,
      showDictionaryImport: false,
      importing: false,
      importSettings: {
        format: 'html'
      },
      availableBooks: [
        { id: '01_sozler', name: 'Sözler' },
        { id: '02_mektubat', name: 'Mektubat' },
        { id: '03_lemalar', name: "Lem'alar" },
        { id: '04_sualar', name: 'Şualar' },
        { id: '05_tarihce', name: 'Tarihçe-i Hayat' },
        { id: '06_mesnevi', name: 'Mesnevî-i Nuriye' },
        { id: '07_isarat', name: "İşaratü'l-i'caz" },
        { id: '08_sikke', name: 'Sikke-i Tasdik-i Gaybî' },
        { id: '09_barla', name: 'Barla Lâhikası' },
        { id: '10_kastamonu', name: 'Kastamonu Lâhikası' },
        { id: '11_emirdag1', name: 'Emirdağ Lâhikası 1' },
        { id: '12_emirdag2', name: 'Emirdağ Lâhikası 2' },
        { id: '13_asa', name: 'Asâ-yı Musa' },
        { id: '14_kucuk', name: 'Küçük Kitaplar' }
      ],
      selectedBooks: [],
      selectAll: false,
      bulkImportPath: 'C:\\Users\\Fatih\\Desktop\\Risale-i-Nur-Diyanet',
      dictionaryJson: '',
      importProgress: {
        show: false,
        current: 0,
        total: 0,
        percent: 0,
        message: ''
      }
    };
  },
  mounted() {
    this.loadStats();
  },
  methods: {
    async loadStats() {
      try {
        const response = await axios.get('/admin/stats');
        this.stats = response.data;
      } catch (error) {
        console.error('İstatistikler yüklenemedi:', error);
      }
    },
    
    toggleSelectAll() {
      if (this.selectAll) {
        this.selectedBooks = this.availableBooks.map(b => b.id);
      } else {
        this.selectedBooks = [];
      }
    },
    
    async startImport() {
      if (this.selectedBooks.length === 0) {
        alert('Lütfen en az bir kitap seçin');
        return;
      }
      
      this.importing = true;
      this.importProgress.show = true;
      this.importProgress.total = this.selectedBooks.length;
      
      try {
        for (let i = 0; i < this.selectedBooks.length; i++) {
          const bookId = this.selectedBooks[i];
          const bookInfo = this.availableBooks.find(b => b.id === bookId);
          
          this.importProgress.current = i + 1;
          this.importProgress.percent = ((i + 1) / this.selectedBooks.length) * 100;
          this.importProgress.message = `${bookInfo.name} aktarılıyor...`;
          
          await axios.post('/admin/import/diyanet', {
            bookId,
            format: this.importSettings.format,
            sourcePath: this.bulkImportPath
          });
        }
        
        this.importProgress.message = 'Tüm kitaplar başarıyla aktarıldı!';
        setTimeout(() => {
          this.showImportModal = false;
          this.importProgress.show = false;
          this.loadStats();
        }, 2000);
        
      } catch (error) {
        console.error('Import hatası:', error);
        alert('Aktarma sırasında hata oluştu: ' + error.message);
      } finally {
        this.importing = false;
      }
    },
    
    async startBulkImport() {
      if (!this.bulkImportPath) {
        alert('Lütfen klasör yolu girin');
        return;
      }
      
      try {
        const response = await axios.post('/admin/import/bulk', {
          path: this.bulkImportPath
        });
        
        alert(`${response.data.imported} kitap başarıyla eklendi!`);
        this.showBulkImport = false;
        this.loadStats();
      } catch (error) {
        console.error('Toplu import hatası:', error);
        alert('Hata: ' + error.message);
      }
    },
    
    handleDictionaryFile(event) {
      const file = event.target.files[0];
      if (!file) return;
      
      const reader = new FileReader();
      reader.onload = (e) => {
        this.dictionaryJson = e.target.result;
      };
      reader.readAsText(file);
    },
    
    async importDictionary() {
      if (!this.dictionaryJson) {
        alert('Lütfen sözlük verisi girin');
        return;
      }
      
      try {
        let words;
        try {
          words = JSON.parse(this.dictionaryJson);
        } catch (e) {
          alert('Geçersiz JSON formatı');
          return;
        }
        
        const response = await axios.post('/admin/dictionary/import', { words });
        alert(`${response.data.imported} kelime başarıyla eklendi!`);
        this.showDictionaryImport = false;
        this.dictionaryJson = '';
        this.loadStats();
      } catch (error) {
        console.error('Sözlük import hatası:', error);
        alert('Hata: ' + error.message);
      }
    },
    
    logout() {
      this.$store.dispatch('auth/logout');
      this.$router.push('/');
    }
  }
};
</script>

<style scoped>
.admin-dashboard {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.admin-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  padding-bottom: 20px;
  border-bottom: 2px solid #eee;
}

.admin-header h1 {
  color: #2c3e50;
  margin: 0;
}

.logout-btn {
  background: #e74c3c;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 5px;
  cursor: pointer;
  font-size: 16px;
}

.logout-btn:hover {
  background: #c0392b;
}

/* İstatistikler */
.admin-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 40px;
}

.stat-card {
  background: white;
  border-radius: 10px;
  padding: 25px;
  text-align: center;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  transition: transform 0.2s;
}

.stat-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 5px 20px rgba(0,0,0,0.15);
}

.stat-card i {
  font-size: 40px;
  color: #3498db;
  margin-bottom: 15px;
}

.stat-card h3 {
  font-size: 32px;
  margin: 10px 0;
  color: #2c3e50;
}

.stat-card p {
  color: #7f8c8d;
  margin: 0;
}

/* Admin Actions */
.admin-actions {
  display: grid;
  gap: 30px;
}

.action-section {
  background: white;
  padding: 25px;
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

.action-section h2 {
  color: #2c3e50;
  margin-top: 0;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  gap: 10px;
}

.action-section h2 i {
  color: #3498db;
}

.import-options,
.book-actions,
.dictionary-actions {
  display: flex;
  gap: 15px;
  flex-wrap: wrap;
}

.primary-btn,
.secondary-btn,
.action-btn {
  padding: 12px 24px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 16px;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  text-decoration: none;
  transition: all 0.2s;
}

.primary-btn {
  background: #3498db;
  color: white;
}

.primary-btn:hover {
  background: #2980b9;
}

.secondary-btn {
  background: #95a5a6;
  color: white;
}

.secondary-btn:hover {
  background: #7f8c8d;
}

.action-btn {
  background: #ecf0f1;
  color: #2c3e50;
}

.action-btn:hover {
  background: #bdc3c7;
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
  max-width: 600px;
  width: 90%;
  max-height: 80vh;
  overflow-y: auto;
}

.modal-content h2 {
  margin-top: 0;
  color: #2c3e50;
}

/* Form Styles */
.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: bold;
  color: #555;
}

.form-group input[type="text"],
.form-group select,
.form-group textarea {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 5px;
  font-size: 16px;
}

.form-group textarea {
  resize: vertical;
  font-family: monospace;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 5px 0;
  cursor: pointer;
}

.book-selection {
  border: 1px solid #ddd;
  border-radius: 5px;
  padding: 15px;
  max-height: 300px;
  overflow-y: auto;
}

.book-list {
  margin-top: 10px;
  padding-left: 20px;
}

.form-actions {
  display: flex;
  gap: 15px;
  justify-content: flex-end;
  margin-top: 25px;
}

/* Progress Bar */
.import-progress {
  margin-top: 20px;
  padding: 15px;
  background: #ecf0f1;
  border-radius: 5px;
}

.progress-bar {
  background: #bdc3c7;
  border-radius: 10px;
  height: 20px;
  overflow: hidden;
  margin-bottom: 10px;
}

.progress-fill {
  background: #3498db;
  height: 100%;
  transition: width 0.3s ease;
}

.import-progress p {
  margin: 0;
  text-align: center;
  color: #555;
}

/* Info Box */
.info-box {
  background: #ecf0f1;
  padding: 15px;
  border-radius: 5px;
  margin: 15px 0;
}

.info-box h4 {
  margin-top: 0;
  color: #2c3e50;
}

.info-box pre {
  background: white;
  padding: 10px;
  border-radius: 3px;
  overflow-x: auto;
  font-size: 12px;
}

/* Responsive */
@media (max-width: 768px) {
  .admin-stats {
    grid-template-columns: 1fr 1fr;
  }
  
  .import-options,
  .book-actions,
  .dictionary-actions {
    flex-direction: column;
  }
  
  .modal-content {
    padding: 20px;
  }
}
</style>