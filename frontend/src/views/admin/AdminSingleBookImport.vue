<template>
  <div class="single-book-import">
    <div class="page-header">
      <h1>Tekli Kitap İçe Aktarma</h1>
      <router-link to="/admin/books" class="back-btn">
        <i class="fas fa-arrow-left"></i> Geri Dön
      </router-link>
    </div>

    <div class="import-container">
      <!-- Kitap Bilgileri -->
      <div class="book-info-section">
        <h2>Kitap Bilgileri</h2>
        
        <div class="form-row">
          <div class="form-group">
            <label>Kitap Başlığı *</label>
            <input 
              v-model="bookInfo.title" 
              type="text" 
              placeholder="Örn: Sözler"
              required
            >
          </div>
          
          <div class="form-group">
            <label>Kategori *</label>
            <select v-model="bookInfo.category" required>
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
        </div>
        
        <div class="form-row">
          <div class="form-group">
            <label>Yayın Yılı</label>
            <input 
              v-model.number="bookInfo.publishYear" 
              type="number" 
              min="1900" 
              max="2030"
              placeholder="1926"
            >
          </div>
          
          <div class="form-group">
            <label>Sıra No</label>
            <input 
              v-model.number="bookInfo.order" 
              type="number" 
              min="1"
              placeholder="Otomatik belirlenecek"
            >
          </div>
        </div>
        
        <div class="form-group">
          <label>Açıklama *</label>
          <textarea 
            v-model="bookInfo.description" 
            rows="3"
            placeholder="Kitap hakkında kısa açıklama..."
            required
          ></textarea>
        </div>
      </div>

      <!-- İçerik Ekleme -->
      <div class="content-section">
        <h2>Kitap İçeriği</h2>
        
        <div class="import-method">
          <label>
            <input type="radio" v-model="importMethod" value="file">
            Dosyadan Yükle
          </label>
          <label>
            <input type="radio" v-model="importMethod" value="text">
            Metin Olarak Yapıştır
          </label>
          <label>
            <input type="radio" v-model="importMethod" value="chapters">
            Bölüm Bölüm Ekle
          </label>
        </div>
        
        <!-- Dosyadan Yükleme -->
        <div v-if="importMethod === 'file'" class="file-upload">
          <div class="upload-area" @drop="handleDrop" @dragover.prevent @dragleave.prevent>
            <input 
              type="file" 
              ref="fileInput" 
              @change="handleFileSelect"
              accept=".txt,.html,.doc,.docx"
              multiple
            >
            <i class="fas fa-cloud-upload-alt"></i>
            <p>Dosyaları sürükleyin veya <span @click="$refs.fileInput.click()">seçin</span></p>
            <small>Desteklenen: TXT, HTML, DOC, DOCX</small>
          </div>
          
          <div v-if="uploadedFiles.length > 0" class="uploaded-files">
            <h4>Yüklenen Dosyalar:</h4>
            <div v-for="(file, index) in uploadedFiles" :key="index" class="file-item">
              <span>{{ file.name }}</span>
              <button @click="removeFile(index)" class="remove-btn">
                <i class="fas fa-times"></i>
              </button>
            </div>
          </div>
        </div>
        
        <!-- Metin Yapıştırma -->
        <div v-else-if="importMethod === 'text'" class="text-paste">
          <textarea 
            v-model="pastedContent" 
            rows="15"
            placeholder="Kitap içeriğini buraya yapıştırın..."
          ></textarea>
        </div>
        
        <!-- Bölüm Bölüm Ekleme -->
        <div v-else-if="importMethod === 'chapters'" class="chapter-add">
          <div v-for="(chapter, index) in chapters" :key="index" class="chapter-item">
            <div class="chapter-header">
              <h4>{{ chapter.order }}. Bölüm</h4>
              <button @click="removeChapter(index)" class="remove-btn">
                <i class="fas fa-trash"></i>
              </button>
            </div>
            
            <div class="form-group">
              <label>Başlık</label>
              <input v-model="chapter.title" type="text" placeholder="Örn: Birinci Söz">
            </div>
            
            <div class="form-group">
              <label>İçerik</label>
              <textarea 
                v-model="chapter.content" 
                rows="10"
                placeholder="Bölüm içeriği..."
              ></textarea>
            </div>
          </div>
          
          <button @click="addChapter" class="add-chapter-btn">
            <i class="fas fa-plus"></i> Yeni Bölüm Ekle
          </button>
        </div>
      </div>

      <!-- İçerik Önizleme -->
      <div v-if="processedContent.length > 0" class="preview-section">
        <h2>İçerik Önizleme</h2>
        <div class="preview-info">
          <span><i class="fas fa-file-alt"></i> {{ processedContent.length }} Sayfa</span>
          <span><i class="fas fa-font"></i> {{ totalWords }} Kelime</span>
          <span><i class="fas fa-language"></i> {{ ottomanWords.size }} Osmanlıca Kelime</span>
        </div>
        
        <div class="preview-pages">
          <div 
            v-for="(page, index) in processedContent.slice(0, 3)" 
            :key="index" 
            class="preview-page"
          >
            <h5>Sayfa {{ page.pageNumber }}</h5>
            <div v-html="page.content.substring(0, 200) + '...'"></div>
          </div>
          <p v-if="processedContent.length > 3" class="more-pages">
            ... ve {{ processedContent.length - 3 }} sayfa daha
          </p>
        </div>
      </div>

      <!-- İşlem Butonları -->
      <div class="action-buttons">
        <button 
          @click="processContent" 
          class="process-btn"
          :disabled="!canProcess"
        >
          <i class="fas fa-cogs"></i> İçeriği İşle
        </button>
        
        <button 
          @click="saveBook" 
          class="save-btn"
          :disabled="!canSave || saving"
        >
          <i v-if="saving" class="fas fa-spinner fa-spin"></i>
          <i v-else class="fas fa-save"></i>
          {{ saving ? 'Kaydediliyor...' : 'Kitabı Kaydet' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import axios from '@/utils/axios';

export default {
  name: 'AdminSingleBookImport',
  data() {
    return {
      bookInfo: {
        title: '',
        category: '',
        description: '',
        publishYear: null,
        order: null,
        author: 'Bediüzzaman Said Nursi',
        coverImage: ''
      },
      importMethod: 'file',
      uploadedFiles: [],
      pastedContent: '',
      chapters: [],
      processedContent: [],
      ottomanWords: new Set(),
      saving: false
    };
  },
  computed: {
    canProcess() {
      if (this.importMethod === 'file') return this.uploadedFiles.length > 0;
      if (this.importMethod === 'text') return this.pastedContent.trim().length > 0;
      if (this.importMethod === 'chapters') return this.chapters.some(ch => ch.content.trim());
      return false;
    },
    canSave() {
      return this.bookInfo.title && 
             this.bookInfo.category && 
             this.bookInfo.description && 
             this.processedContent.length > 0;
    },
    totalWords() {
      return this.processedContent.reduce((total, page) => {
        return total + page.content.split(/\s+/).length;
      }, 0);
    }
  },
  methods: {
    handleDrop(e) {
      e.preventDefault();
      const files = Array.from(e.dataTransfer.files);
      this.handleFiles(files);
    },
    
    handleFileSelect(e) {
      const files = Array.from(e.target.files);
      this.handleFiles(files);
    },
    
    handleFiles(files) {
      files.forEach(file => {
        if (this.isValidFile(file)) {
          this.uploadedFiles.push(file);
        } else {
          alert(`${file.name} desteklenmeyen bir dosya türü`);
        }
      });
    },
    
    isValidFile(file) {
      const validTypes = ['text/plain', 'text/html', 'application/msword', 
                         'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      return validTypes.includes(file.type) || 
             file.name.match(/\.(txt|html|doc|docx)$/i);
    },
    
    removeFile(index) {
      this.uploadedFiles.splice(index, 1);
    },
    
    addChapter() {
      const nextOrder = this.chapters.length + 1;
      this.chapters.push({
        order: nextOrder,
        title: '',
        content: ''
      });
    },
    
    removeChapter(index) {
      this.chapters.splice(index, 1);
      // Sıra numaralarını güncelle
      this.chapters.forEach((ch, i) => {
        ch.order = i + 1;
      });
    },
    
    async processContent() {
      this.processedContent = [];
      this.ottomanWords.clear();
      
      let rawContent = '';
      
      try {
        // İçeriği topla
        if (this.importMethod === 'file') {
          for (const file of this.uploadedFiles) {
            const content = await this.readFile(file);
            rawContent += content + '\n\n';
          }
        } else if (this.importMethod === 'text') {
          rawContent = this.pastedContent;
        } else if (this.importMethod === 'chapters') {
          rawContent = this.chapters
            .map(ch => `<h2>${ch.title}</h2>\n${ch.content}`)
            .join('\n\n');
        }
        
        // İçeriği işle ve sayfalara böl
        this.processedContent = this.parseAndSplitContent(rawContent);
        
        // Osmanlıca kelimeleri tespit et
        this.detectOttomanWords(rawContent);
        
        // Otomatik sıralama
        if (!this.bookInfo.order) {
          this.bookInfo.order = await this.getNextOrder();
        }
        
        // Kapak resmi URL'si
        if (!this.bookInfo.coverImage) {
          const slug = this.bookInfo.title.toLowerCase()
            .replace(/[^\w\s]/gi, '')
            .replace(/\s+/g, '-');
          this.bookInfo.coverImage = `/covers/${slug}.jpg`;
        }
        
        alert(`İçerik başarıyla işlendi! ${this.processedContent.length} sayfa oluşturuldu.`);
        
      } catch (error) {
        console.error('İçerik işleme hatası:', error);
        alert('İçerik işlenirken hata oluştu: ' + error.message);
      }
    },
    
    readFile(file) {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = e => resolve(e.target.result);
        reader.onerror = reject;
        reader.readAsText(file, 'UTF-8');
      });
    },
    
    parseAndSplitContent(rawContent) {
      const pages = [];
      const maxPageLength = 5000;
      
      // Başlıkları tespit et
      const sections = this.detectSections(rawContent);
      
      sections.forEach((section, sectionIndex) => {
        // Her bölümü sayfalara böl
        const sectionPages = this.splitIntoPages(section.content, maxPageLength);
        
        sectionPages.forEach((pageContent, pageIndex) => {
          pages.push({
            pageNumber: pages.length + 1,
            content: this.formatContent(pageContent),
            chapter: section.title,
            subChapter: pageIndex === 0 ? section.subtitle : ''
          });
        });
      });
      
      return pages;
    },
    
    detectSections(content) {
      const sections = [];
      
      // Başlık patternleri
      const patterns = [
        /^#{1,3}\s+(.+)$/gm,  // Markdown başlıkları
        /^(.+)\n={3,}$/gm,    // Altı çizili başlıklar
        /^(\d+\.?\s*(?:Birinci|İkinci|Üçüncü|Dördüncü|Beşinci|Altıncı|Yedinci|Sekizinci|Dokuzuncu|Onuncu|[A-Za-z]+)\s+Söz.*)$/gmi,
        /^((?:Birinci|İkinci|Üçüncü|[A-Za-z]+)\s+(?:Söz|Mektup|Lem'a|Şua).*)$/gmi
      ];
      
      let lastIndex = 0;
      const allMatches = [];
      
      // Tüm başlıkları bul
      patterns.forEach(pattern => {
        let match;
        while ((match = pattern.exec(content)) !== null) {
          allMatches.push({
            title: match[1].trim(),
            index: match.index,
            length: match[0].length
          });
        }
      });
      
      // Sırala
      allMatches.sort((a, b) => a.index - b.index);
      
      // Bölümleri oluştur
      allMatches.forEach((match, i) => {
        if (match.index > lastIndex) {
          // Önceki içeriği ekle
          if (lastIndex === 0 && match.index > 100) {
            sections.push({
              title: 'Giriş',
              subtitle: '',
              content: content.substring(0, match.index).trim()
            });
          }
          
          // Yeni bölüm
          const nextIndex = allMatches[i + 1]?.index || content.length;
          sections.push({
            title: match.title,
            subtitle: '',
            content: content.substring(match.index + match.length, nextIndex).trim()
          });
          
          lastIndex = nextIndex;
        }
      });
      
      // Hiç başlık bulunamadıysa
      if (sections.length === 0) {
        sections.push({
          title: this.bookInfo.title || 'İçerik',
          subtitle: '',
          content: content
        });
      }
      
      return sections;
    },
    
    splitIntoPages(content, maxLength) {
      if (content.length <= maxLength) {
        return [content];
      }
      
      const pages = [];
      const paragraphs = content.split(/\n\n+/);
      let currentPage = '';
      
      paragraphs.forEach(para => {
        if (currentPage.length + para.length > maxLength && currentPage) {
          pages.push(currentPage.trim());
          currentPage = para;
        } else {
          currentPage += (currentPage ? '\n\n' : '') + para;
        }
      });
      
      if (currentPage) {
        pages.push(currentPage.trim());
      }
      
      return pages;
    },
    
    formatContent(text) {
      // Paragrafları HTML'e dönüştür
      let html = text
        .split(/\n\n+/)
        .map(para => `<p>${para.trim()}</p>`)
        .join('\n');
      
      // Osmanlıca metinleri işaretle
      html = html.replace(/[\u0600-\u06FF]+/g, match => {
        return `<span class="ottoman-text">${match}</span>`;
      });
      
      return html;
    },
    
    detectOttomanWords(content) {
      const ottomanPattern = /[\u0600-\u06FF]+/g;
      let match;
      
      while ((match = ottomanPattern.exec(content)) !== null) {
        if (match[0].length >= 2) {
          this.ottomanWords.add(match[0]);
        }
      }
    },
    
    async getNextOrder() {
      try {
        const response = await axios.get('/books');
        const books = response.data;
        
        // Aynı kategorideki kitapları bul
        const categoryBooks = books.filter(b => b.category === this.bookInfo.category);
        
        if (categoryBooks.length === 0) {
          return 1;
        }
        
        // En yüksek sıra numarasını bul
        const maxOrder = Math.max(...categoryBooks.map(b => b.order || 0));
        return maxOrder + 1;
        
      } catch (error) {
        console.error('Sıra belirleme hatası:', error);
        return 999;
      }
    },
    
    async saveBook() {
      if (!this.canSave) return;
      
      this.saving = true;
      
      try {
        // Önce kitabı oluştur
        const bookResponse = await axios.post('/books', {
          ...this.bookInfo,
          totalPages: this.processedContent.length
        });
        
        const bookId = bookResponse.data._id;
        
        // Sayfaları ekle
        for (const page of this.processedContent) {
          await axios.post('/books/page', {
            bookId,
            ...page
          });
        }
        
        // Osmanlıca kelimeleri sözlüğe ekle
        const newWords = Array.from(this.ottomanWords).map(word => ({
          word,
          meaning: 'Henüz anlamı eklenmemiş',
          example: ''
        }));
        
        if (newWords.length > 0) {
          await axios.post('/dictionary/bulk', { words: newWords });
        }
        
        alert(`Kitap başarıyla kaydedildi!\n${this.processedContent.length} sayfa ve ${newWords.length} yeni kelime eklendi.`);
        
        this.$router.push('/admin/books');
        
      } catch (error) {
        console.error('Kaydetme hatası:', error);
        alert('Kitap kaydedilirken hata oluştu: ' + (error.response?.data?.message || error.message));
      } finally {
        this.saving = false;
      }
    }
  }
};
</script>

<style scoped>
.single-book-import {
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

/* Form Sections */
.book-info-section,
.content-section,
.preview-section {
  margin-bottom: 30px;
  padding-bottom: 30px;
  border-bottom: 1px solid #e0e0e0;
}

.book-info-section:last-child,
.content-section:last-child,
.preview-section:last-child {
  border-bottom: none;
}

h2 {
  color: #333;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  gap: 10px;
}

/* Form Elements */
.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin-bottom: 20px;
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

/* Import Method */
.import-method {
  display: flex;
  gap: 30px;
  margin-bottom: 25px;
}

.import-method label {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  font-weight: 500;
}

.import-method input[type="radio"] {
  width: auto;
}

/* File Upload */
.upload-area {
  border: 2px dashed #3498db;
  border-radius: 10px;
  padding: 40px;
  text-align: center;
  background: #f0f8ff;
  cursor: pointer;
  transition: all 0.3s;
}

.upload-area:hover {
  border-color: #2980b9;
  background: #e6f3ff;
}

.upload-area input[type="file"] {
  display: none;
}

.upload-area i {
  font-size: 48px;
  color: #3498db;
  margin-bottom: 15px;
}

.upload-area p {
  margin: 10px 0;
  color: #666;
}

.upload-area span {
  color: #3498db;
  text-decoration: underline;
  cursor: pointer;
}

.uploaded-files {
  margin-top: 20px;
}

.uploaded-files h4 {
  margin-bottom: 10px;
  color: #555;
}

.file-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px;
  background: #f8f9fa;
  border-radius: 5px;
  margin-bottom: 8px;
}

.remove-btn {
  background: #e74c3c;
  color: white;
  border: none;
  padding: 5px 10px;
  border-radius: 3px;
  cursor: pointer;
  font-size: 14px;
}

.remove-btn:hover {
  background: #c0392b;
}

/* Text Paste */
.text-paste textarea {
  font-family: monospace;
  background: #f8f9fa;
}

/* Chapter Add */
.chapter-item {
  background: #f8f9fa;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 20px;
}

.chapter-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.chapter-header h4 {
  margin: 0;
  color: #333;
}

.add-chapter-btn {
  background: #3498db;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 5px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  margin-top: 20px;
}

.add-chapter-btn:hover {
  background: #2980b9;
}

/* Preview Section */
.preview-info {
  display: flex;
  gap: 30px;
  margin-bottom: 20px;
  padding: 15px;
  background: #f0f8ff;
  border-radius: 8px;
}

.preview-info span {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #555;
}

.preview-info i {
  color: #3498db;
}

.preview-pages {
  display: grid;
  gap: 15px;
}

.preview-page {
  padding: 15px;
  background: #f8f9fa;
  border-radius: 5px;
  border-left: 4px solid #3498db;
}

.preview-page h5 {
  margin: 0 0 10px 0;
  color: #3498db;
}

.more-pages {
  text-align: center;
  color: #666;
  font-style: italic;
  margin-top: 15px;
}

/* Action Buttons */
.action-buttons {
  display: flex;
  gap: 15px;
  justify-content: center;
  margin-top: 30px;
  padding-top: 30px;
  border-top: 1px solid #e0e0e0;
}

.process-btn,
.save-btn {
  padding: 12px 30px;
  border: none;
  border-radius: 5px;
  font-size: 16px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 10px;
  transition: all 0.2s;
}

.process-btn {
  background: #f39c12;
  color: white;
}

.process-btn:hover:not(:disabled) {
  background: #e67e22;
}

.save-btn {
  background: #2ecc71;
  color: white;
}

.save-btn:hover:not(:disabled) {
  background: #27ae60;
}

.process-btn:disabled,
.save-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Ottoman Text */
.ottoman-text {
  color: #d35400;
  font-weight: 500;
  direction: rtl;
}

/* Responsive */
@media (max-width: 768px) {
  .form-row {
    grid-template-columns: 1fr;
  }
  
  .import-method {
    flex-direction: column;
    gap: 15px;
  }
  
  .preview-info {
    flex-direction: column;
    gap: 10px;
  }
  
  .action-buttons {
    flex-direction: column;
  }
  
  .process-btn,
  .save-btn {
    width: 100%;
    justify-content: center;
  }
}
</style>