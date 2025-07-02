<template>
  <div class="admin-book-import">
    <div class="page-header">
      <h1>Toplu Kitap İçe Aktarma</h1>
      <router-link to="/admin/books" class="back-btn">
        <i class="fas fa-arrow-left"></i> Geri Dön
      </router-link>
    </div>

    <div class="import-container">
      <!-- İçe Aktarma Seçenekleri -->
      <div class="import-options">
        <h2>İçe Aktarma Yöntemi Seçin</h2>
        
        <div class="option-cards">
          <div 
            class="option-card"
            :class="{ active: importMethod === 'diyanet' }"
            @click="importMethod = 'diyanet'"
          >
            <i class="fas fa-folder-open"></i>
            <h3>Diyanet Klasöründen</h3>
            <p>Risale-i-Nur-Diyanet klasöründeki HTML/TXT dosyalarından otomatik içe aktarma</p>
          </div>
          
          <div 
            class="option-card"
            :class="{ active: importMethod === 'custom' }"
            @click="importMethod = 'custom'"
          >
            <i class="fas fa-upload"></i>
            <h3>Özel Klasörden</h3>
            <p>Belirttiğiniz bir klasörden kitapları içe aktarın</p>
          </div>
        </div>
      </div>

      <!-- Diyanet İçe Aktarma -->
      <div v-if="importMethod === 'diyanet'" class="import-form">
        <h3>Diyanet Klasöründen İçe Aktarma</h3>
        
        <div class="form-group">
          <label>Kaynak Klasör:</label>
          <input 
            type="text" 
            v-model="diyanetPath" 
            readonly
            class="readonly-input"
          >
        </div>
        
        <div class="form-group">
          <label>Dosya Formatı:</label>
          <select v-model="fileFormat">
            <option value="html">HTML</option>
            <option value="txt">TXT</option>
          </select>
        </div>
        
        <div class="form-actions">
          <button 
            @click="startDiyanetImport" 
            :disabled="importing"
            class="import-btn"
          >
            <i v-if="importing" class="fas fa-spinner fa-spin"></i>
            <i v-else class="fas fa-download"></i>
            {{ importing ? 'İçe Aktarılıyor...' : 'İçe Aktarmayı Başlat' }}
          </button>
        </div>
      </div>

      <!-- Özel Klasör İçe Aktarma -->
      <div v-if="importMethod === 'custom'" class="import-form">
        <h3>Özel Klasörden İçe Aktarma</h3>
        
        <div class="form-group">
          <label>Klasör Yolu:</label>
          <input 
            type="text" 
            v-model="customPath" 
            placeholder="C:\Kitaplar"
          >
          <small>Kitapların bulunduğu ana klasörün yolunu girin</small>
        </div>
        
        <div class="form-group">
          <label>Dosya Formatı:</label>
          <select v-model="fileFormat">
            <option value="html">HTML</option>
            <option value="txt">TXT</option>
          </select>
        </div>
        
        <div class="form-actions">
          <button 
            @click="startCustomImport" 
            :disabled="importing || !customPath"
            class="import-btn"
          >
            <i v-if="importing" class="fas fa-spinner fa-spin"></i>
            <i v-else class="fas fa-download"></i>
            {{ importing ? 'İçe Aktarılıyor...' : 'İçe Aktarmayı Başlat' }}
          </button>
        </div>
      </div>

      <!-- İlerleme Durumu -->
      <div v-if="importProgress.show" class="import-progress">
        <h3>İçe Aktarma İlerlemesi</h3>
        
        <div class="progress-bar">
          <div 
            class="progress-fill" 
            :style="{ width: importProgress.percent + '%' }"
          ></div>
        </div>
        
        <div class="progress-info">
          <p>{{ importProgress.message }}</p>
          <p v-if="importProgress.current">
            {{ importProgress.current }} / {{ importProgress.total }}
          </p>
        </div>
        
        <div v-if="importProgress.logs.length > 0" class="progress-logs">
          <h4>İşlem Kayıtları:</h4>
          <div class="log-container">
            <div 
              v-for="(log, index) in importProgress.logs" 
              :key="index"
              class="log-entry"
              :class="log.type"
            >
              <i :class="getLogIcon(log.type)"></i>
              {{ log.message }}
            </div>
          </div>
        </div>
      </div>

      <!-- Sonuç -->
      <div v-if="importResult" class="import-result" :class="importResult.type">
        <i :class="importResult.type === 'success' ? 'fas fa-check-circle' : 'fas fa-exclamation-circle'"></i>
        <h3>{{ importResult.title }}</h3>
        <p>{{ importResult.message }}</p>
        
        <div v-if="importResult.stats" class="result-stats">
          <div class="stat-item">
            <span class="stat-value">{{ importResult.stats.books }}</span>
            <span class="stat-label">Kitap</span>
          </div>
          <div class="stat-item">
            <span class="stat-value">{{ importResult.stats.pages }}</span>
            <span class="stat-label">Sayfa</span>
          </div>
          <div class="stat-item">
            <span class="stat-value">{{ importResult.stats.words }}</span>
            <span class="stat-label">Sözlük Kelimesi</span>
          </div>
        </div>
        
        <div class="result-actions">
          <router-link to="/admin/books" class="view-books-btn">
            <i class="fas fa-book"></i> Kitapları Görüntüle
          </router-link>
          <button @click="resetImport" class="reset-btn">
            <i class="fas fa-redo"></i> Yeni İçe Aktarma
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from '@/utils/axios';

export default {
  name: 'AdminBookImport',
  data() {
    return {
      importMethod: 'diyanet',
      diyanetPath: 'C:\\Users\\Fatih\\Desktop\\Risale-i-Nur-Diyanet',
      customPath: '',
      fileFormat: 'html',
      importing: false,
      importProgress: {
        show: false,
        percent: 0,
        current: 0,
        total: 0,
        message: '',
        logs: []
      },
      importResult: null,
      ws: null // WebSocket bağlantısı
    };
  },
  methods: {
    async startDiyanetImport() {
      this.startImport(this.diyanetPath);
    },
    
    async startCustomImport() {
      if (!this.customPath) {
        alert('Lütfen bir klasör yolu girin');
        return;
      }
      this.startImport(this.customPath);
    },
    
    async startImport(path) {
      this.importing = true;
      this.importResult = null;
      this.importProgress = {
        show: true,
        percent: 0,
        current: 0,
        total: 0,
        message: 'İçe aktarma başlatılıyor...',
        logs: []
      };
      
      try {
        // Backend'e import isteği gönder
        const response = await axios.post('/books/import', {
          sourcePath: path,
          format: this.fileFormat
        });
        
        if (response.data.success) {
          // WebSocket bağlantısı kur (ilerleme takibi için)
          this.connectWebSocket(response.data.importId);
        } else {
          throw new Error(response.data.message || 'İçe aktarma başlatılamadı');
        }
      } catch (error) {
        console.error('İçe aktarma hatası:', error);
        this.importing = false;
        this.importResult = {
          type: 'error',
          title: 'İçe Aktarma Hatası',
          message: error.response?.data?.message || error.message
        };
        this.importProgress.show = false;
      }
    },
    
    connectWebSocket(importId) {
      // WebSocket bağlantısı kur
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const host = window.location.hostname;
      const port = process.env.NODE_ENV === 'production' ? '' : ':3000';
      const wsUrl = `${protocol}//${host}${port}`;
      this.ws = new WebSocket(`${wsUrl}/import/${importId}`);
      
      this.ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        
        switch (data.type) {
          case 'progress':
            this.updateProgress(data);
            break;
          case 'log':
            this.addLog(data);
            break;
          case 'complete':
            this.onImportComplete(data);
            break;
          case 'error':
            this.onImportError(data);
            break;
        }
      };
      
      this.ws.onerror = (error) => {
        console.error('WebSocket hatası:', error);
        this.onImportError({ message: 'Bağlantı hatası oluştu' });
      };
      
      this.ws.onclose = () => {
        console.log('WebSocket bağlantısı kapatıldı');
      };
    },
    
    updateProgress(data) {
      this.importProgress.percent = data.percent || 0;
      this.importProgress.current = data.current || 0;
      this.importProgress.total = data.total || 0;
      this.importProgress.message = data.message || '';
    },
    
    addLog(data) {
      this.importProgress.logs.push({
        type: data.level || 'info',
        message: data.message
      });
      
      // Log container'ı en alta kaydır
      this.$nextTick(() => {
        const logContainer = this.$el.querySelector('.log-container');
        if (logContainer) {
          logContainer.scrollTop = logContainer.scrollHeight;
        }
      });
    },
    
    onImportComplete(data) {
      this.importing = false;
      this.importProgress.show = false;
      this.importResult = {
        type: 'success',
        title: 'İçe Aktarma Tamamlandı!',
        message: 'Kitaplar başarıyla içe aktarıldı.',
        stats: data.stats || {
          books: 0,
          pages: 0,
          words: 0
        }
      };
      
      if (this.ws) {
        this.ws.close();
      }
    },
    
    onImportError(data) {
      this.importing = false;
      this.importProgress.show = false;
      this.importResult = {
        type: 'error',
        title: 'İçe Aktarma Hatası',
        message: data.message || 'Bilinmeyen bir hata oluştu'
      };
      
      if (this.ws) {
        this.ws.close();
      }
    },
    
    getLogIcon(type) {
      const icons = {
        'info': 'fas fa-info-circle',
        'success': 'fas fa-check-circle',
        'warning': 'fas fa-exclamation-triangle',
        'error': 'fas fa-times-circle'
      };
      return icons[type] || icons.info;
    },
    
    resetImport() {
      this.importResult = null;
      this.importProgress = {
        show: false,
        percent: 0,
        current: 0,
        total: 0,
        message: '',
        logs: []
      };
    }
  },
  
  beforeDestroy() {
    if (this.ws) {
      this.ws.close();
    }
  }
};
</script>

<style scoped>
.admin-book-import {
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

.import-container {
  background: white;
  padding: 30px;
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

.import-options h2 {
  margin-bottom: 20px;
  color: #333;
}

.option-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.option-card {
  padding: 30px;
  border: 2px solid #e0e0e0;
  border-radius: 10px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s;
}

.option-card:hover {
  border-color: #3498db;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(52, 152, 219, 0.2);
}

.option-card.active {
  border-color: #3498db;
  background: #f0f8ff;
}

.option-card i {
  font-size: 48px;
  color: #3498db;
  margin-bottom: 15px;
}

.option-card h3 {
  margin: 0 0 10px 0;
  color: #333;
}

.option-card p {
  margin: 0;
  color: #666;
  font-size: 14px;
}

.import-form {
  background: #f8f9fa;
  padding: 25px;
  border-radius: 8px;
  margin-top: 20px;
}

.import-form h3 {
  margin-top: 0;
  margin-bottom: 20px;
  color: #333;
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
.form-group select {
  width: 100%;
  padding: 10px 15px;
  border: 1px solid #ddd;
  border-radius: 5px;
  font-size: 16px;
}

.form-group input:focus,
.form-group select:focus {
  outline: none;
  border-color: #3498db;
  box-shadow: 0 0 0 2px rgba(52, 152, 219, 0.2);
}

.readonly-input {
  background: #e9ecef;
  cursor: not-allowed;
}

.form-group small {
  display: block;
  margin-top: 5px;
  color: #666;
  font-size: 13px;
}

.form-actions {
  margin-top: 25px;
}

.import-btn {
  background: #3498db;
  color: white;
  border: none;
  padding: 12px 30px;
  border-radius: 5px;
  font-size: 16px;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 10px;
  transition: background 0.2s;
}

.import-btn:hover:not(:disabled) {
  background: #2980b9;
}

.import-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

/* İlerleme Durumu */
.import-progress {
  margin-top: 30px;
  padding: 25px;
  background: #f8f9fa;
  border-radius: 8px;
  border: 1px solid #e0e0e0;
}

.import-progress h3 {
  margin-top: 0;
  margin-bottom: 20px;
  color: #333;
}

.progress-bar {
  width: 100%;
  height: 30px;
  background: #e0e0e0;
  border-radius: 15px;
  overflow: hidden;
  margin-bottom: 15px;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #3498db, #2980b9);
  transition: width 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 500;
}

.progress-info {
  text-align: center;
  color: #666;
}

.progress-info p {
  margin: 5px 0;
}

.progress-logs {
  margin-top: 20px;
  border-top: 1px solid #e0e0e0;
  padding-top: 20px;
}

.progress-logs h4 {
  margin-top: 0;
  margin-bottom: 15px;
  color: #555;
}

.log-container {
  max-height: 200px;
  overflow-y: auto;
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 5px;
  padding: 10px;
}

.log-entry {
  padding: 8px 12px;
  margin-bottom: 5px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
}

.log-entry i {
  flex-shrink: 0;
}

.log-entry.info {
  background: #e3f2fd;
  color: #1976d2;
}

.log-entry.success {
  background: #e8f5e9;
  color: #388e3c;
}

.log-entry.warning {
  background: #fff3e0;
  color: #f57c00;
}

.log-entry.error {
  background: #ffebee;
  color: #d32f2f;
}

/* Sonuç */
.import-result {
  margin-top: 30px;
  padding: 40px;
  text-align: center;
  border-radius: 10px;
}

.import-result.success {
  background: #e8f5e9;
  color: #2e7d32;
}

.import-result.error {
  background: #ffebee;
  color: #c62828;
}

.import-result i {
  font-size: 64px;
  margin-bottom: 20px;
}

.import-result h3 {
  margin: 0 0 10px 0;
  font-size: 24px;
}

.import-result p {
  margin: 0 0 30px 0;
  font-size: 16px;
}

.result-stats {
  display: flex;
  justify-content: center;
  gap: 40px;
  margin: 30px 0;
}

.stat-item {
  text-align: center;
}

.stat-value {
  display: block;
  font-size: 36px;
  font-weight: 600;
  margin-bottom: 5px;
}

.stat-label {
  display: block;
  font-size: 14px;
  opacity: 0.8;
}

.result-actions {
  display: flex;
  justify-content: center;
  gap: 15px;
  margin-top: 30px;
}

.view-books-btn,
.reset-btn {
  padding: 12px 24px;
  border-radius: 5px;
  font-size: 16px;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  text-decoration: none;
  transition: all 0.2s;
}

.view-books-btn {
  background: #3498db;
  color: white;
  border: none;
}

.view-books-btn:hover {
  background: #2980b9;
}

.reset-btn {
  background: white;
  color: #666;
  border: 1px solid #ddd;
}

.reset-btn:hover {
  background: #f8f9fa;
  color: #333;
}

/* Responsive */
@media (max-width: 768px) {
  .option-cards {
    grid-template-columns: 1fr;
  }
  
  .result-stats {
    flex-direction: column;
    gap: 20px;
  }
  
  .result-actions {
    flex-direction: column;
    width: 100%;
  }
  
  .view-books-btn,
  .reset-btn {
    width: 100%;
    justify-content: center;
  }
}
</style>