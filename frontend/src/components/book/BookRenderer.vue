<template>
  <div 
    class="book-renderer"
    :class="{ 'dark-mode': isDarkMode }"
  >
    <div 
      ref="bookContainer" 
      class="book-container"
      :style="containerStyle"
    >
      <!-- Turn.js ile kitap görünümü için bileşen -->
      <div id="book" class="book">
        <div 
          v-for="(page, index) in pagesArray" 
          :key="index"
          class="page"
        >
          <div 
            v-if="page"
            class="page-content"
            :style="contentStyle"
            v-html="page.content"
          ></div>
          <div 
            v-else
            class="page-content empty-page"
          ></div>
          
          <div class="page-number" v-if="page && !isHardCover(index)">
            {{ startPage + index - 1 }}
          </div>
        </div>
      </div>
    </div>
    
    <div class="book-controls">
      <button 
        @click="prevPage" 
        class="control-btn prev"
        :disabled="currentPage <= 1"
      >
        <span class="control-icon prev-icon"></span>
      </button>
      
      <div class="page-info">
        <span>{{ displayPage }} / {{ totalPages }}</span>
      </div>
      
      <button 
        @click="nextPage" 
        class="control-btn next"
        :disabled="currentPage >= totalPages"
      >
        <span class="control-icon next-icon"></span>
      </button>
    </div>
    
    <!-- Not Paneli - 
    Position absolute, kitap üzerinde farklı bölgelere notlar eklenebilir -->
    <div 
      v-for="note in pageNotes" 
      :key="note.id"
      class="note"
      :style="{
        top: `${note.position.y}px`,
        left: `${note.position.x}px`,
        backgroundColor: note.color
      }"
    >
      <div class="note-content">{{ note.content }}</div>
      <div class="note-actions">
        <button @click="$emit('edit-note', note)" class="note-btn">
          <span class="note-action-icon edit-icon"></span>
        </button>
        <button @click="$emit('delete-note', note.id)" class="note-btn">
          <span class="note-action-icon delete-icon"></span>
        </button>
      </div>
    </div>
    
    <!-- Yer İmi Göstergesi -->
    <div 
      v-if="hasBookmark"
      class="bookmark-indicator"
      :style="{ backgroundColor: bookmarkColor }"
      @click="$emit('toggle-bookmark')"
    >
      <div class="bookmark-tooltip">
        {{ bookmarkName }}
      </div>
    </div>
  </div>
</template>

<script>
// Turn.js kütüphanesini içe aktarıyoruz
import 'turn.js';

export default {
  name: 'BookRenderer',
  props: {
    // Gösterilecek sayfalar
    pages: {
      type: Array,
      required: true
    },
    // Başlangıç sayfası
    startPage: {
      type: Number,
      default: 1
    },
    // Toplam sayfa sayısı
    totalPages: {
      type: Number,
      required: true
    },
    // Sayfadaki notlar
    notes: {
      type: Array,
      default: () => []
    },
    // Yer imi bilgisi
    bookmark: {
      type: Object,
      default: null
    },
    // Kullanıcı ayarları
    settings: {
      type: Object,
      default: () => ({
        fontSize: 16,
        fontFamily: "'Noto Serif', serif",
        lineHeight: 1.6,
        darkMode: false,
        pageAnimations: true,
        pageSound: true
      })
    }
  },
  data() {
    return {
      // Turn.js nesnesi
      book: null,
      // Geçerli sayfa
      currentPage: this.startPage,
      // Sesi çalma için Audio nesnesi
      pageSound: null,
      // Sayfaları oluşturmak için dizi
      pagesArray: []
    };
  },
  computed: {
    // Koyu mod ayarı
    isDarkMode() {
      return this.settings.darkMode;
    },
    // Sayfa içerik stili
    contentStyle() {
      return {
        fontSize: `${this.settings.fontSize}px`,
        fontFamily: this.settings.fontFamily,
        lineHeight: this.settings.lineHeight
      };
    },
    // Konteyner stili
    containerStyle() {
      return {
        width: '100%',
        height: '100%'
      };
    },
    // Görüntülenen sayfa numarası (çift sayfada)
    displayPage() {
      // Çift sayfa görünümünde, sağdaki sayfayı gösteriyoruz
      return this.currentPage % 2 === 0 ? this.currentPage : this.currentPage + 1;
    },
    // Geçerli sayfadaki notlar
    pageNotes() {
      return this.notes.filter(note => 
        note.pageNumber === this.currentPage || 
        note.pageNumber === this.currentPage + 1
      );
    },
    // Geçerli sayfada yer imi var mı?
    hasBookmark() {
      return this.bookmark !== null && 
        (this.bookmark.pageNumber === this.currentPage || 
         this.bookmark.pageNumber === this.currentPage + 1);
    },
    // Yer imi rengi
    bookmarkColor() {
      return this.bookmark ? this.bookmark.color : '#e74c3c';
    },
    // Yer imi adı
    bookmarkName() {
      return this.bookmark ? this.bookmark.name : '';
    }
  },
  watch: {
    // Sayfa sayısı değiştiğinde kitabı güncelle
    pages: {
      handler() {
        this.updatePages();
      },
      deep: true
    },
    // Başlangıç sayfası değiştiğinde sayfayı güncelle
    startPage(newVal) {
      this.goToPage(newVal);
    },
    // Kullanıcı ayarları değiştiğinde isteğe bağlı olarak kitabı güncelle
    settings: {
      handler() {
        // Animasyon tercihi değiştiyse kitabı yeniden başlat
        if (this.book) {
          this.book.turn('options', {
            acceleration: this.settings.pageAnimations
          });
        }
      },
      deep: true
    }
  },
  mounted() {
    // Sayfaları hazırla
    this.updatePages();
    
    // Sayfa yüklendikten sonra Turn.js'i başlat
    this.$nextTick(() => {
      this.initBook();
    });
    
    // Sayfa sesi için Audio nesnesini hazırla
    this.pageSound = new Audio('/sounds/page-flip.mp3');
  },
  beforeUnmount() {
    // Bileşen kaldırılmadan önce Turn.js'i temizle
    if (this.book) {
      this.book.turn('destroy');
    }
  },
  methods: {
    // Turn.js kitabını başlat
    initBook() {
      // Turn.js için referansı al
      const el = document.getElementById('book');
      if (!el) return;
      
      // Turn.js'i başlat
      this.book = $(el).turn({
        width: this.$refs.bookContainer.offsetWidth,
        height: this.$refs.bookContainer.offsetHeight,
        autoCenter: true,
        gradients: true,
        acceleration: this.settings.pageAnimations,
        elevation: 50,
        duration: this.settings.pageAnimations ? 600 : 0,
        page: this.currentPage,
        when: {
          turning: (event, page) => {
            // Sayfa çevirme sırasında
            this.currentPage = page;
            this.$emit('page-changing', page);
          },
          turned: (event, page) => {
            // Sayfa çevrildikten sonra
            this.currentPage = page;
            this.$emit('page-changed', page);
            
            // Sayfa çevirme sesi
            if (this.settings.pageSound) {
              this.playPageSound();
            }
          }
        }
      });
      
      // Pencere boyutu değiştiğinde kitabı yeniden boyutlandır
      window.addEventListener('resize', this.resizeBook);
      
      // İlk sayfaya git
      this.goToPage(this.startPage);
    },
    
    // Kitabı yeniden boyutlandır
    resizeBook() {
      if (this.book) {
        this.book.turn('size', 
          this.$refs.bookContainer.offsetWidth, 
          this.$refs.bookContainer.offsetHeight
        );
      }
    },
    
    // Sayfaları güncelle
    updatePages() {
      // Sayfaları diziye dönüştür (Turn.js için)
      this.pagesArray = [null, ...this.pages, null]; // Kapaklar için boş sayfalar
    },
    
    // İleri sayfa
    nextPage() {
      if (this.book && this.currentPage < this.totalPages) {
        this.book.turn('next');
      }
    },
    
    // Geri sayfa
    prevPage() {
      if (this.book && this.currentPage > 1) {
        this.book.turn('previous');
      }
    },
    
    // Belirli bir sayfaya git
    goToPage(pageNumber) {
      if (this.book) {
        this.book.turn('page', parseInt(pageNumber));
      }
    },
    
    // Sayfa çevirme sesini çal
    playPageSound() {
      if (this.pageSound) {
        this.pageSound.currentTime = 0;
        this.pageSound.play().catch(e => {
          // Tarayıcı sesi oynatmadığında hata mesajını yoksay
          console.warn('Sayfa sesi oynatılamadı:', e);
        });
      }
    },
    
    // Cilt kapağı kontrolü (ilk ve son sayfa)
    isHardCover(index) {
      return index === 0 || index === this.pagesArray.length - 1;
    }
  }
}
</script>

<style scoped lang="scss">
.book-renderer {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  
  &.dark-mode {
    .book-container {
      background-color: #1a1a1a;
    }
    
    .page {
      background-color: #222 !important;
      color: #f5f5f5 !important;
      
      .page-number {
        color: #aaa !important;
      }
    }
    
    .book-controls {
      background-color: rgba(34, 34, 34, 0.8);
      
      .control-btn {
        color: #f5f5f5;
        
        &:hover:not(:disabled) {
          background-color: #333;
        }
        
        &:disabled {
          color: #666;
        }
      }
      
      .page-info {
        color: #f5f5f5;
      }
    }
  }
}

.book-container {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;
  background-color: #f5f5f5;
  
  .book {
    position: relative;
    
    // Turn.js sayfaları
    .page {
      background-color: #fff;
      overflow: hidden;
      position: relative;
      
      &.hard {
        background-color: #f0f0f0;
        border: 1px solid #ddd;
      }
      
      // Page content container
      .page-content {
        padding: 40px;
        box-sizing: border-box;
        height: 100%;
        overflow-y: auto;
        
        &.empty-page {
          background-color: #f8f8f8;
        }
        
        p {
          margin-bottom: 1em;
          text-align: justify;
        }
      }
      
      .page-number {
        position: absolute;
        bottom: 15px;
        font-size: 0.9rem;
        color: #666;
        
        &:nth-child(odd) {
          left: 20px;
        }
        
        &:nth-child(even) {
          right: 20px;
        }
      }
    }
  }
}

// Sayfa kontrolcüsü
.book-controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 20px;
  background-color: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(5px);
  z-index: 10;
  
  .control-btn {
    width: 40px;
    height: 40px;
    display: flex;
    justify-content: center;
    align-items: center;
    border: none;
    background: transparent;
    border-radius: 50%;
    cursor: pointer;
    transition: background-color 0.2s;
    
    &:hover:not(:disabled) {
      background-color: #f0f0f0;
    }
    
    &:disabled {
      cursor: not-allowed;
      opacity: 0.5;
    }
    
    .control-icon {
      font-size: 1.2rem;
      display: inline-block;
    }
    
    .prev-icon:before {
      content: '◀';
    }
    
    .next-icon:before {
      content: '▶';
    }
  }
  
  .page-info {
    font-size: 1rem;
    color: #333;
  }
}

// Notlar
.note {
  position: absolute;
  background-color: rgba(255, 235, 59, 0.7);
  padding: 10px;
  border-radius: 4px;
  width: 200px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  z-index: 100;
  font-size: 0.9rem;
  
  .note-content {
    margin-bottom: 5px;
  }
  
  .note-actions {
    display: none;
    justify-content: flex-end;
    gap: 5px;
    
    .note-btn {
      background: none;
      border: none;
      font-size: 0.8rem;
      cursor: pointer;
      color: #555;
      padding: 3px;
      
      &:hover {
        color: #000;
      }
      
      .note-action-icon {
        display: inline-block;
      }
      
      .edit-icon:before {
        content: '✏️';
      }
      
      .delete-icon:before {
        content: '🗑️';
      }
    }
  }
  
  &:hover .note-actions {
    display: flex;
  }
}

// Yer imi göstergesi
.bookmark-indicator {
  position: absolute;
  top: 0;
  right: 20px;
  width: 40px;
  height: 60px;
  background-color: #e74c3c;
  border-radius: 0 0 20px 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  cursor: pointer;
  z-index: 50;
  
  .bookmark-tooltip {
    position: absolute;
    top: 100%;
    left: -20px;
    width: 80px;
    background-color: inherit;
    color: white;
    text-align: center;
    padding: 5px;
    border-radius: 3px;
    font-size: 0.8rem;
    opacity: 0;
    transition: opacity 0.3s;
    pointer-events: none;
  }
  
  &:hover .bookmark-tooltip {
    opacity: 1;
  }
}

// Responsive
@media (max-width: 768px) {
  .book-container {
    .book {
      .page {
        .page-content {
          padding: 20px;
        }
      }
    }
  }
}
</style>