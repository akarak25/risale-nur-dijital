<template>
  <div class="reader-view" :class="readerClasses">
    <!-- Okuyucu Başlığı -->
    <header class="reader-header" v-if="!isFullScreen">
      <div class="header-left">
        <router-link to="/bookshelf" class="back-btn">
          <span class="icon">◄</span>
          <span class="text">Kitaplık</span>
        </router-link>
        <div class="book-info">
          <h1 class="book-title">{{ currentBook?.title || 'Yükleniyor...' }}</h1>
          <p class="reading-progress">
            <span class="current-page">{{ currentPage }}</span>
            <span class="separator">/</span>
            <span class="total-pages">{{ totalPages }}</span>
          </p>
        </div>
      </div>
      
      <div class="header-controls">
        <button @click="togglePanel('contents')" class="control-btn" :class="{active: activePanel === 'contents'}">
          <span class="icon">☰</span>
          <span class="tooltip">İçindekiler</span>
        </button>
        <button @click="togglePanel('search')" class="control-btn" :class="{active: activePanel === 'search'}">
          <span class="icon">🔍</span>
          <span class="tooltip">Ara</span>
        </button>
        <button @click="togglePanel('notes')" class="control-btn" :class="{active: activePanel === 'notes'}">
          <span class="icon">📝</span>
          <span class="tooltip">Notlar</span>
        </button>
        <button @click="togglePanel('settings')" class="control-btn" :class="{active: activePanel === 'settings'}">
          <span class="icon">⚙️</span>
          <span class="tooltip">Ayarlar</span>
        </button>
        <button @click="toggleFullScreen" class="control-btn">
          <span class="icon">{{ isFullScreen ? '⮨' : '⛶' }}</span>
          <span class="tooltip">{{ isFullScreen ? 'Normal Görünüm' : 'Tam Ekran' }}</span>
        </button>
      </div>
    </header>

    <!-- Ana İçerik Alanı -->
    <div class="reader-content">
      <!-- Sol Panel -->
      <aside class="side-panel" v-if="activePanel && !isFullScreen">
        <!-- İçindekiler -->
        <div v-if="activePanel === 'contents'" class="panel-content">
          <h2 class="panel-title">İçindekiler</h2>
          <div class="contents-tree">
            <div 
              v-for="chapter in tableOfContents" 
              :key="chapter.id"
              class="chapter-item"
              :class="{active: isInChapter(chapter)}"
            >
              <div @click="goToPage(chapter.page)" class="chapter-header">
                <span class="chapter-number">{{ chapter.number }}</span>
                <span class="chapter-title">{{ chapter.title }}</span>
              </div>
              <div v-if="chapter.subChapters" class="sub-chapters">
                <div 
                  v-for="sub in chapter.subChapters" 
                  :key="sub.id"
                  @click="goToPage(sub.page)"
                  class="sub-chapter"
                  :class="{active: currentPage === sub.page}"
                >
                  {{ sub.title }}
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Arama -->
        <div v-if="activePanel === 'search'" class="panel-content">
          <h2 class="panel-title">Kitap İçinde Ara</h2>
          <div class="search-box">
            <input 
              v-model="searchQuery"
              @keyup.enter="performSearch"
              type="text" 
              placeholder="Aramak istediğiniz kelime..."
              class="search-input"
            >
            <button @click="performSearch" class="search-btn btn btn-primary">
              Ara
            </button>
          </div>
          <div v-if="searchResults.length > 0" class="search-results">
            <div 
              v-for="result in searchResults" 
              :key="result.id"
              @click="goToPage(result.page)"
              class="search-result"
            >
              <div class="result-page">Sayfa {{ result.page }}</div>
              <div class="result-text" v-html="result.highlight"></div>
            </div>
          </div>
          <div v-else-if="searchPerformed" class="no-results">
            Sonuç bulunamadı.
          </div>
        </div>

        <!-- Notlar -->
        <div v-if="activePanel === 'notes'" class="panel-content">
          <h2 class="panel-title">Notlarım</h2>
          <button @click="addNewNote" class="btn btn-accent add-note-btn">
            + Yeni Not Ekle
          </button>
          <div class="notes-list">
            <div 
              v-for="note in userNotes" 
              :key="note.id"
              class="note-item card"
              :style="{borderLeftColor: note.color}"
            >
              <div class="note-header">
                <span class="note-page">Sayfa {{ note.page }}</span>
                <button @click="deleteNote(note.id)" class="delete-btn">×</button>
              </div>
              <div class="note-content">{{ note.content }}</div>
              <div class="note-date">{{ formatDate(note.date) }}</div>
            </div>
          </div>
        </div>

        <!-- Ayarlar -->
        <div v-if="activePanel === 'settings'" class="panel-content">
          <h2 class="panel-title">Okuma Ayarları</h2>
          
          <div class="setting-group">
            <label>Yazı Boyutu</label>
            <div class="font-size-control">
              <button @click="decreaseFontSize" class="size-btn">A-</button>
              <span class="size-value">{{ settings.fontSize }}px</span>
              <button @click="increaseFontSize" class="size-btn">A+</button>
            </div>
          </div>

          <div class="setting-group">
            <label>Yazı Tipi</label>
            <select v-model="settings.fontFamily" class="setting-select">
              <option value="'Amiri', serif">Amiri (Klasik)</option>
              <option value="'Roboto', sans-serif">Roboto (Modern)</option>
              <option value="'Georgia', serif">Georgia</option>
            </select>
          </div>

          <div class="setting-group">
            <label>Satır Aralığı</label>
            <input 
              type="range" 
              min="1.2" 
              max="2.5" 
              step="0.1"
              v-model="settings.lineHeight"
              class="setting-range"
            >
            <span class="range-value">{{ settings.lineHeight }}</span>
          </div>

          <div class="setting-group">
            <label>Tema</label>
            <div class="theme-options">
              <button 
                @click="setTheme('light')"
                class="theme-btn"
                :class="{active: settings.theme === 'light'}"
              >
                ☀️ Aydınlık
              </button>
              <button 
                @click="setTheme('sepia')"
                class="theme-btn"
                :class="{active: settings.theme === 'sepia'}"
              >
                📜 Sepya
              </button>
              <button 
                @click="setTheme('dark')"
                class="theme-btn"
                :class="{active: settings.theme === 'dark'}"
              >
                🌙 Karanlık
              </button>
            </div>
          </div>
        </div>
      </aside>

      <!-- Kitap Görüntüleme Alanı -->
      <main class="book-display" :class="{'with-panel': activePanel}">
        <div v-if="loading" class="loading-container">
          <div class="loading-islamic"></div>
          <p>Kitap yükleniyor...</p>
        </div>

        <div v-else class="book-container">
          <!-- Kitap Sayfaları -->
          <div class="book-pages" :style="bookStyles">
            <div class="page-spread">
              <!-- Sol Sayfa -->
              <div class="page page-left" v-if="currentPage > 1">
                <div class="page-header">
                  <span class="page-number">{{ currentPage - 1 }}</span>
                  <span class="chapter-name">{{ getCurrentChapter(currentPage - 1) }}</span>
                </div>
                <div 
                  class="page-content"
                  v-html="getPageContent(currentPage - 1)"
                  @mouseup="handleTextSelection"
                ></div>
                <div class="page-footer">
                  <div class="ornament">◆◇◆</div>
                </div>
              </div>

              <!-- Sağ Sayfa -->
              <div class="page page-right">
                <div class="page-header">
                  <span class="chapter-name">{{ getCurrentChapter(currentPage) }}</span>
                  <span class="page-number">{{ currentPage }}</span>
                </div>
                <div 
                  class="page-content"
                  v-html="getPageContent(currentPage)"
                  @mouseup="handleTextSelection"
                ></div>
                <div class="page-footer">
                  <div class="ornament">◆◇◆</div>
                </div>
              </div>
            </div>
          </div>

          <!-- Sayfa Kontrolleri -->
          <div class="page-controls">
            <button 
              @click="previousPage" 
              :disabled="currentPage <= 1"
              class="page-nav prev"
            >
              <span class="icon">◀</span>
            </button>

            <div class="page-slider">
              <input 
                type="range" 
                min="1" 
                :max="totalPages"
                v-model="currentPage"
                @input="onPageSliderChange"
                class="slider"
              >
              <div class="page-indicator">
                Sayfa {{ currentPage }} / {{ totalPages }}
              </div>
            </div>

            <button 
              @click="nextPage"
              :disabled="currentPage >= totalPages"
              class="page-nav next"
            >
              <span class="icon">▶</span>
            </button>
          </div>
        </div>
      </main>
    </div>

    <!-- Seçili Metin Menüsü -->
    <div 
      v-if="showSelectionMenu"
      class="selection-menu"
      :style="selectionMenuPosition"
    >
      <button @click="highlightSelection" class="menu-btn">
        <span class="icon">🖍️</span>
        Vurgula
      </button>
      <button @click="addNoteToSelection" class="menu-btn">
        <span class="icon">📝</span>
        Not Ekle
      </button>
      <button @click="copySelection" class="menu-btn">
        <span class="icon">📋</span>
        Kopyala
      </button>
    </div>

    <!-- Not Ekleme Modal -->
    <transition name="modal">
      <div v-if="showNoteModal" class="modal-overlay" @click.self="closeNoteModal">
        <div class="modal-content card">
          <div class="modal-header">
            <h3>Not Ekle</h3>
            <button @click="closeNoteModal" class="close-btn">×</button>
          </div>
          <div class="modal-body">
            <div v-if="noteSelection" class="selected-text">
              <label>Seçili Metin:</label>
              <p>{{ noteSelection }}</p>
            </div>
            <div class="form-group">
              <label>Notunuz:</label>
              <textarea 
                v-model="noteText"
                placeholder="Notunuzu buraya yazın..."
                rows="5"
                class="note-textarea"
              ></textarea>
            </div>
            <div class="form-group">
              <label>Not Rengi:</label>
              <div class="color-picker">
                <span 
                  v-for="color in noteColors"
                  :key="color"
                  @click="selectedNoteColor = color"
                  :style="{backgroundColor: color}"
                  :class="['color-option', {selected: selectedNoteColor === color}]"
                ></span>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button @click="closeNoteModal" class="btn btn-outline">İptal</button>
            <button @click="saveNote" class="btn btn-primary">Kaydet</button>
          </div>
        </div>
      </div>
    </transition>

    <!-- Tam Ekran Kontrolleri -->
    <div v-if="isFullScreen" class="fullscreen-controls">
      <button @click="toggleFullScreen" class="exit-fullscreen">
        <span class="icon">✕</span>
        Tam Ekrandan Çık
      </button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ReaderView',
  props: {
    bookId: {
      type: String,
      required: true
    },
    pageNumber: {
      type: [String, Number],
      default: 1
    }
  },
  data() {
    return {
      loading: true,
      currentBook: null,
      currentPage: parseInt(this.pageNumber) || 1,
      totalPages: 100,
      activePanel: null,
      isFullScreen: false,
      
      // İçerik
      tableOfContents: [],
      pageContents: {},
      
      // Arama
      searchQuery: '',
      searchResults: [],
      searchPerformed: false,
      
      // Notlar
      userNotes: [],
      showNoteModal: false,
      noteText: '',
      noteSelection: '',
      selectedNoteColor: '#ffeb3b',
      noteColors: ['#ffeb3b', '#81c784', '#64b5f6', '#ba68c8', '#ffb74d'],
      
      // Seçim menüsü
      showSelectionMenu: false,
      selectionMenuPosition: { top: '0px', left: '0px' },
      selectedText: '',
      
      // Ayarlar
      settings: {
        fontSize: 18,
        fontFamily: "'Amiri', serif",
        lineHeight: 1.8,
        theme: 'light'
      }
    }
  },
  computed: {
    readerClasses() {
      return {
        'dark-mode': this.settings.theme === 'dark',
        'sepia-mode': this.settings.theme === 'sepia',
        'fullscreen': this.isFullScreen
      }
    },
    bookStyles() {
      return {
        fontSize: `${this.settings.fontSize}px`,
        fontFamily: this.settings.fontFamily,
        lineHeight: this.settings.lineHeight
      }
    }
  },
  async created() {
    await this.loadBook();
    this.loadUserSettings();
    this.setupKeyboardShortcuts();
  },
  methods: {
    // Kitap yükleme
    async loadBook() {
      this.loading = true;
      try {
        // API'den kitap bilgilerini yükle
        await this.$store.dispatch('fetchBook', this.bookId);
        this.currentBook = this.$store.state.currentBook;
        
        // Örnek içerik ve içindekiler
        this.setupDemoContent();
        
        // Kullanıcı notlarını yükle
        this.loadUserNotes();
      } catch (error) {
        console.error('Kitap yüklenemedi:', error);
      } finally {
        this.loading = false;
      }
    },
    
    // Demo içerik oluştur
    setupDemoContent() {
      this.totalPages = 300;
      this.tableOfContents = [
        {
          id: 1,
          number: '1',
          title: 'Birinci Söz',
          page: 1,
          subChapters: [
            { id: 11, title: 'Bismillah\'ın Hikmeti', page: 3 },
            { id: 12, title: 'Her Şeyin Başı', page: 7 }
          ]
        },
        {
          id: 2,
          number: '2',
          title: 'İkinci Söz',
          page: 15,
          subChapters: [
            { id: 21, title: 'İmanın Faydaları', page: 17 },
            { id: 22, title: 'Küfürün Zararları', page: 25 }
          ]
        }
      ];
      
      // Örnek sayfa içerikleri
      this.pageContents = {
        1: '<p>Bismillahirrahmanirrahim</p><p>Birinci Söz: Bismillah her hayrın başıdır. Biz dahi başta ona başlarız. Bil ey nefsim! Şu mübarek kelime, İslam nişanı olduğu gibi, bütün mevcudatın lisân-ı hâl ile vird-i zebânıdır.</p>',
        2: '<p>Bismillah, kâinatın parlak bir nuru, büyük bir kuvvetidir. Evet Bismillah, öyle kudsî bir kelimedir ki; bu kelimeyi söyleyen, bütün mevcudat namına Cenab-ı Hakka kulluk eder, bütün mevcudatı kendine müsahhar görür.</p>'
      };
    },
    
    // Sayfa içeriği getir
    getPageContent(pageNum) {
      return this.pageContents[pageNum] || `<p>Sayfa ${pageNum} içeriği yükleniyor...</p>`;
    },
    
    // Sayfa navigasyonu
    previousPage() {
      if (this.currentPage > 2) {
        this.currentPage -= 2;
      } else if (this.currentPage === 2) {
        this.currentPage = 1;
      }
    },
    
    nextPage() {
      if (this.currentPage < this.totalPages - 1) {
        this.currentPage += 2;
      } else if (this.currentPage === this.totalPages - 1) {
        this.currentPage = this.totalPages;
      }
    },
    
    goToPage(page) {
      this.currentPage = parseInt(page);
      this.activePanel = null;
    },
    
    onPageSliderChange(event) {
      this.currentPage = parseInt(event.target.value);
    },
    
    // Panel kontrolü
    togglePanel(panel) {
      this.activePanel = this.activePanel === panel ? null : panel;
    },
    
    // Tam ekran
    toggleFullScreen() {
      this.isFullScreen = !this.isFullScreen;
      if (this.isFullScreen) {
        document.documentElement.requestFullscreen();
      } else {
        document.exitFullscreen();
      }
    },
    
    // Metin seçimi
    handleTextSelection() {
      const selection = window.getSelection();
      const text = selection.toString().trim();
      
      if (text) {
        this.selectedText = text;
        const range = selection.getRangeAt(0);
        const rect = range.getBoundingClientRect();
        
        this.selectionMenuPosition = {
          top: `${rect.top - 40}px`,
          left: `${rect.left + (rect.width / 2) - 100}px`
        };
        this.showSelectionMenu = true;
      } else {
        this.showSelectionMenu = false;
      }
    },
    
    // Not işlemleri
    addNoteToSelection() {
      this.noteSelection = this.selectedText;
      this.showNoteModal = true;
      this.showSelectionMenu = false;
    },
    
    addNewNote() {
      this.noteSelection = '';
      this.showNoteModal = true;
    },
    
    saveNote() {
      const note = {
        id: Date.now(),
        page: this.currentPage,
        content: this.noteText,
        selection: this.noteSelection,
        color: this.selectedNoteColor,
        date: new Date()
      };
      
      this.userNotes.push(note);
      this.saveUserNotes();
      this.closeNoteModal();
    },
    
    closeNoteModal() {
      this.showNoteModal = false;
      this.noteText = '';
      this.noteSelection = '';
    },
    
    deleteNote(noteId) {
      this.userNotes = this.userNotes.filter(n => n.id !== noteId);
      this.saveUserNotes();
    },
    
    // Ayarlar
    increaseFontSize() {
      if (this.settings.fontSize < 30) {
        this.settings.fontSize += 2;
        this.saveUserSettings();
      }
    },
    
    decreaseFontSize() {
      if (this.settings.fontSize > 12) {
        this.settings.fontSize -= 2;
        this.saveUserSettings();
      }
    },
    
    setTheme(theme) {
      this.settings.theme = theme;
      this.saveUserSettings();
    },
    
    // Local Storage işlemleri
    saveUserSettings() {
      localStorage.setItem('readerSettings', JSON.stringify(this.settings));
    },
    
    loadUserSettings() {
      const saved = localStorage.getItem('readerSettings');
      if (saved) {
        this.settings = { ...this.settings, ...JSON.parse(saved) };
      }
    },
    
    saveUserNotes() {
      localStorage.setItem(`notes_${this.bookId}`, JSON.stringify(this.userNotes));
    },
    
    loadUserNotes() {
      const saved = localStorage.getItem(`notes_${this.bookId}`);
      if (saved) {
        this.userNotes = JSON.parse(saved);
      }
    },
    
    // Klavye kısayolları
    setupKeyboardShortcuts() {
      document.addEventListener('keydown', this.handleKeyPress);
    },
    
    handleKeyPress(e) {
      switch(e.key) {
        case 'ArrowLeft':
          this.previousPage();
          break;
        case 'ArrowRight':
          this.nextPage();
          break;
        case 'Escape':
          if (this.isFullScreen) this.toggleFullScreen();
          break;
      }
    },
    
    // Yardımcı fonksiyonlar
    getCurrentChapter(page) {
      for (let chapter of this.tableOfContents) {
        if (page >= chapter.page && (!chapter.nextPage || page < chapter.nextPage)) {
          return chapter.title;
        }
      }
      return '';
    },
    
    isInChapter(chapter) {
      return this.currentPage >= chapter.page && 
             (!chapter.nextPage || this.currentPage < chapter.nextPage);
    },
    
    formatDate(date) {
      return new Date(date).toLocaleDateString('tr-TR');
    },
    
    // Metin işlemleri
    highlightSelection() {
      // Vurgulama işlemi
      console.log('Metin vurgulandı:', this.selectedText);
      this.showSelectionMenu = false;
    },
    
    copySelection() {
      navigator.clipboard.writeText(this.selectedText);
      this.showSelectionMenu = false;
    },
    
    // Arama
    performSearch() {
      if (!this.searchQuery) return;
      
      // Basit arama simülasyonu
      this.searchResults = [
        {
          id: 1,
          page: 15,
          highlight: `...${this.searchQuery} bulunduğu cümle örneği...`
        }
      ];
      this.searchPerformed = true;
    }
  },
  beforeUnmount() {
    document.removeEventListener('keydown', this.handleKeyPress);
  }
}
</script>

<style scoped lang="scss">
@import '@/assets/styles/reader-view.scss';
</style>