<template>
  <div class="reader-view" :class="{ 'dark-mode': isDarkMode }">
    <div class="reader-header" v-if="!isFullScreen">
      <div class="book-info">
        <router-link to="/bookshelf" class="back-button">
          <span class="icon-back"></span>
        </router-link>
        <h2 class="book-title">{{ currentBook ? currentBook.title : 'Kitap Yükleniyor...' }}</h2>
      </div>
      
      <div class="reader-controls">
        <button @click="toggleContents" class="control-button">
          <span class="icon-contents"></span>
          <span class="tooltip">İçindekiler</span>
        </button>
        <button @click="toggleBookmarks" class="control-button">
          <span class="icon-bookmarks"></span>
          <span class="tooltip">Yer İmleri</span>
        </button>
        <button @click="toggleSettings" class="control-button">
          <span class="icon-settings"></span>
          <span class="tooltip">Ayarlar</span>
        </button>
        <button @click="toggleFullScreen" class="control-button">
          <span :class="isFullScreen ? 'icon-fullscreen-exit' : 'icon-fullscreen'"></span>
          <span class="tooltip">{{ isFullScreen ? 'Tam Ekrandan Çık' : 'Tam Ekran' }}</span>
        </button>
      </div>
    </div>
    
    <div class="reader-container">
      <aside class="sidebar" v-if="showSidebar && !isFullScreen">
        <div v-if="sidebarContent === 'contents'" class="sidebar-contents">
          <h3>İçindekiler</h3>
          <div v-if="loading" class="sidebar-loading">
            <div class="loading-spinner"></div>
          </div>
          <ul v-else-if="tableOfContents.length > 0" class="contents-list">
            <li v-for="chapter in tableOfContents" :key="chapter._id" class="chapter-item">
              <div @click="goToPage(chapter.pageNumber)" class="chapter-title">
                {{ chapter._id }}
              </div>
              <ul v-if="chapter.subChapters && chapter.subChapters.length > 0" class="subchapter-list">
                <li 
                  v-for="subChapter in chapter.subChapters" 
                  :key="subChapter.title + subChapter.pageNumber"
                  @click="goToPage(subChapter.pageNumber)"
                  class="subchapter-item"
                >
                  {{ subChapter.title }}
                </li>
              </ul>
            </li>
          </ul>
          <div v-else class="sidebar-empty">
            <p>İçindekiler tablosu bulunamadı.</p>
          </div>
        </div>
        
        <div v-if="sidebarContent === 'bookmarks'" class="sidebar-bookmarks">
          <h3>Yer İmleri</h3>
          <div v-if="loading" class="sidebar-loading">
            <div class="loading-spinner"></div>
          </div>
          <ul v-else-if="bookmarks.length > 0" class="bookmarks-list">
            <li 
              v-for="bookmark in bookmarks" 
              :key="bookmark._id"
              @click="goToPage(bookmark.pageNumber)"
              class="bookmark-item"
              :style="{ borderLeftColor: bookmark.color }"
            >
              <div class="bookmark-title">{{ bookmark.name }}</div>
              <div class="bookmark-page">Sayfa {{ bookmark.pageNumber }}</div>
              <button @click.stop="deleteBookmark(bookmark._id)" class="bookmark-delete">×</button>
            </li>
          </ul>
          <div v-else class="sidebar-empty">
            <p>Henüz yer imi eklenmemiş.</p>
            <button @click="addBookmark" class="btn btn-primary btn-sm">Yer İmi Ekle</button>
          </div>
        </div>
        
        <div v-if="sidebarContent === 'settings'" class="sidebar-settings">
          <h3>Okuma Ayarları</h3>
          
          <div class="settings-group">
            <h4>Yazı Boyutu</h4>
            <div class="font-size-controls">
              <button @click="changeFontSize('smaller')" class="btn btn-secondary btn-sm">A-</button>
              <span class="current-size">{{ userSettings.fontSize }}px</span>
              <button @click="changeFontSize('larger')" class="btn btn-secondary btn-sm">A+</button>
            </div>
          </div>
          
          <div class="settings-group">
            <h4>Yazı Tipi</h4>
            <select v-model="userSettings.fontFamily" @change="updateSettings" class="font-select">
              <option value="'Noto Serif', serif">Serif</option>
              <option value="'Nunito', sans-serif">Sans-serif</option>
              <option value="'Courier New', monospace">Monospace</option>
            </select>
          </div>
          
          <div class="settings-group">
            <h4>Satır Aralığı</h4>
            <input 
              type="range" 
              min="1.2" 
              max="2.2" 
              step="0.1" 
              v-model.number="userSettings.lineHeight"
              @change="updateSettings"
              class="range-slider"
            >
            <div class="range-value">{{ userSettings.lineHeight }}</div>
          </div>
          
          <div class="settings-group">
            <h4>Tema</h4>
            <div class="theme-switch">
              <button 
                @click="toggleDarkMode(false)" 
                :class="['theme-option', 'light', { active: !isDarkMode }]"
              >
                Aydınlık
              </button>
              <button 
                @click="toggleDarkMode(true)" 
                :class="['theme-option', 'dark', { active: isDarkMode }]"
              >
                Karanlık
              </button>
            </div>
          </div>
          
          <div class="settings-group">
            <h4>Efektler</h4>
            <div class="effect-options">
              <label class="checkbox-label">
                <input 
                  type="checkbox" 
                  v-model="userSettings.pageAnimations"
                  @change="updateSettings"
                >
                Sayfa çevirme animasyonu
              </label>
              <label class="checkbox-label">
                <input 
                  type="checkbox" 
                  v-model="userSettings.pageSound"
                  @change="updateSettings"
                >
                Sayfa çevirme sesi
              </label>
            </div>
          </div>
        </div>
      </aside>
      
      <div class="reader-main" :class="{ 'with-sidebar': showSidebar && !isFullScreen }">
        <div v-if="loading" class="loading-overlay">
          <div class="loading-spinner"></div>
          <p>Kitap yükleniyor...</p>
        </div>
        
        <div v-else class="book-container">
          <div id="book" class="book-reader">
            <div v-if="pages.length > 0" class="pages-container">
              <div 
                v-for="(page, index) in pages" 
                :key="index"
                class="page"
                :class="{ 'odd': index % 2 === 0, 'even': index % 2 !== 0 }"
              >
                <div class="page-content" :style="pageContentStyle">
                  <div v-if="index % 2 === 0" class="page-number left">{{ currentPageNumber + index }}</div>
                  <div v-html="page.content"></div>
                  <div v-if="index % 2 !== 0" class="page-number right">{{ currentPageNumber + index }}</div>
                </div>
                
                <div class="page-notes">
                  <div 
                    v-for="note in getNotesForPage(currentPageNumber + index)" 
                    :key="note._id"
                    class="note"
                    :style="{
                      top: note.position.y + 'px',
                      left: note.position.x + 'px',
                      backgroundColor: note.color
                    }"
                  >
                    {{ note.content }}
                    <div class="note-actions">
                      <button @click="editNote(note)">Düzenle</button>
                      <button @click="deleteNote(note._id)">Sil</button>
                    </div>
                  </div>
                </div>
                
                <div 
                  v-if="hasBookmark(currentPageNumber + index)"
                  class="bookmark-indicator"
                  :style="{ backgroundColor: getBookmarkColor(currentPageNumber + index) }"
                >
                  <span class="bookmark-name">{{ getBookmarkName(currentPageNumber + index) }}</span>
                </div>
              </div>
            </div>
            
            <div v-else class="no-pages">
              <p>Bu kitap için sayfa bulunamadı.</p>
            </div>
            
            <div class="book-navigation">
              <button 
                @click="prevPage" 
                class="nav-button prev"
                :disabled="currentPageNumber <= 1"
              >
                <span class="icon-prev"></span>
              </button>
              
              <div class="page-info">
                Sayfa {{ currentPageNumber }} / {{ totalPages }}
              </div>
              
              <button 
                @click="nextPage" 
                class="nav-button next"
                :disabled="currentPageNumber >= totalPages"
              >
                <span class="icon-next"></span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Add Note Modal -->
    <div v-if="showNoteModal" class="modal-overlay">
      <div class="modal-dialog">
        <div class="modal-header">
          <h3>{{ editingNote ? 'Not Düzenle' : 'Not Ekle' }}</h3>
          <button @click="closeNoteModal" class="modal-close">×</button>
        </div>
        <div class="modal-body">
          <textarea 
            v-model="noteContent" 
            placeholder="Notunuzu buraya yazın..."
            class="note-textarea"
          ></textarea>
          
          <div class="note-colors">
            <div class="color-label">Not Rengi:</div>
            <div class="color-options">
              <span 
                v-for="color in noteColors" 
                :key="color"
                :style="{ backgroundColor: color }"
                :class="['color-option', { selected: noteColor === color }]"
                @click="noteColor = color"
              ></span>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button @click="closeNoteModal" class="btn btn-secondary">İptal</button>
          <button @click="saveNote" class="btn btn-primary">Kaydet</button>
        </div>
      </div>
    </div>
    
    <!-- Add Bookmark Modal -->
    <div v-if="showBookmarkModal" class="modal-overlay">
      <div class="modal-dialog">
        <div class="modal-header">
          <h3>{{ editingBookmark ? 'Yer İmini Düzenle' : 'Yer İmi Ekle' }}</h3>
          <button @click="closeBookmarkModal" class="modal-close">×</button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label for="bookmark-name">Yer İmi Adı:</label>
            <input 
              type="text" 
              id="bookmark-name"
              v-model="bookmarkName" 
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
                :class="['color-option', { selected: bookmarkColor === color }]"
                @click="bookmarkColor = color"
              ></span>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button @click="closeBookmarkModal" class="btn btn-secondary">İptal</button>
          <button @click="saveBookmark" class="btn btn-primary">Kaydet</button>
        </div>
      </div>
    </div>
    
    <!-- Dictionary Popup -->
    <div v-if="showDictionary" class="dictionary-popup" :style="dictionaryPosition">
      <div class="dictionary-header">
        <h4>{{ selectedWord }}</h4>
        <button @click="closeDictionary" class="dictionary-close">×</button>
      </div>
      <div class="dictionary-content">
        <div v-if="dictionaryLoading" class="dictionary-loading">
          <div class="loading-spinner"></div>
        </div>
        <div v-else-if="wordMeaning" class="word-meaning">
          <p>{{ wordMeaning.meaning }}</p>
          <p v-if="wordMeaning.example" class="word-example">
            <strong>Örnek:</strong> {{ wordMeaning.example }}
          </p>
        </div>
        <div v-else class="word-not-found">
          <p>Bu kelime sözlükte bulunamadı.</p>
        </div>
      </div>
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
      required: false,
      default: 1
    }
  },
  data() {
    return {
      loading: true,
      pages: [],
      currentPageNumber: parseInt(this.pageNumber) || 1,
      tableOfContents: [],
      showSidebar: false,
      sidebarContent: 'contents',
      isFullScreen: false,
      showNoteModal: false,
      showBookmarkModal: false,
      noteContent: '',
      noteColor: '#ffeb3b',
      notePosition: { x: 50, y: 50 },
      editingNote: null,
      bookmarkName: '',
      bookmarkColor: '#e74c3c',
      editingBookmark: null,
      noteColors: ['#ffeb3b', '#4caf50', '#2196f3', '#9c27b0', '#ff9800'],
      bookmarkColors: ['#e74c3c', '#3498db', '#2ecc71', '#f39c12', '#9b59b6'],
      showDictionary: false,
      selectedWord: '',
      wordMeaning: null,
      dictionaryPosition: { top: '0px', left: '0px' },
      dictionaryLoading: false,
      
      // Sayfada göstermek üzere oluşturulan örnek sayfalar (API'den gelecek)
      dummyPages: [
        { content: "<p>Bismillahirrahmanirrahim</p><p>Risale-i Nur Külliyatı, İman ve Kur'an hakikatlerini müspet ilim anlayışıyla ele alıp inceleyen, akla, kalbe ve ruha hitap eden bir eserdir.</p><p>Bu eserlerin müellifi Bediüzzaman Said Nursi, 1877 yılında Bitlis'in Hizan ilçesine bağlı Nurs köyünde doğmuştur.</p><p>İman ve Kur'an hakikatlerini müdellel bir şekilde ortaya koyan bu eserler, imanı kurtarma yolunda büyük bir hizmet görmüştür.</p>" },
        { content: "<p>Risale-i Nur Külliyatı'nın temel amacı, iman hakikatlerini akla, kalbe ve vicdana kabul ettirmektir.</p><p>Bu eserler, fen ve felsefenin ilerlemesiyle meydana çıkan şüphelere karşı Kur'an'dan alınan bir nur ile cevap vermektedir.</p><p>Eserler arasında Sözler, Mektubat, Lem'alar ve Şualar temel kitapları oluşturmaktadır.</p><p>Bu dijital kütüphane ile Risale-i Nur eserlerini dijital ortamda okuma imkanı sunulmaktadır.</p>" }
      ]
    }
  },
  computed: {
    currentBook() {
      return this.$store.state.currentBook;
    },
    totalPages() {
      return this.currentBook ? this.currentBook.totalPages : 0;
    },
    bookmarks() {
      return this.$store.getters.getBookmarksByBook(this.bookId);
    },
    isDarkMode() {
      return this.userSettings.darkMode;
    },
    userSettings() {
      return this.$store.state.userSettings;
    },
    pageContentStyle() {
      return {
        fontSize: `${this.userSettings.fontSize}px`,
        fontFamily: this.userSettings.fontFamily,
        lineHeight: this.userSettings.lineHeight
      };
    }
  },
  created() {
    // Kitap ve ilk sayfa bilgilerini yükle
    this.loadBook();
    
    // Klavye kısayolları için event listener ekle
    window.addEventListener('keydown', this.handleKeyDown);
    
    // Kullanıcı ayarlarını localStorage'dan al
    const savedSettings = localStorage.getItem('userSettings');
    if (savedSettings) {
      this.$store.dispatch('updateUserSettings', JSON.parse(savedSettings));
    }
  },
  mounted() {
    // Metin içindeki kelimelere tıklama için event listener
    this.addWordClickListeners();
  },
  updated() {
    // DOM güncellemelerinden sonra kelime tıklama listenerlarını güncelle
    this.addWordClickListeners();
  },
  beforeUnmount() {
    // Temizlik işlemleri
    window.removeEventListener('keydown', this.handleKeyDown);
  },
  methods: {
    async loadBook() {
      this.loading = true;
      try {
        // Kitap bilgilerini yükle
        await this.$store.dispatch('fetchBook', this.bookId);
        
        // Kullanıcının yer imlerini ve notlarını yükle
        // Not: Gerçek uygulamada kullanıcı ID'si olacaktır
        const userId = 'user123';
        await this.$store.dispatch('fetchUserBookmarks', userId);
        await this.$store.dispatch('fetchPageNotes', {
          userId,
          bookId: this.bookId,
          pageNumber: this.currentPageNumber
        });
        
        // Kitap içindekiler tablosunu yükle
        // Bu uygulama için dummy veri kullanılıyor
        this.tableOfContents = [
          {
            _id: 'Birinci Bölüm',
            pageNumber: 1,
            subChapters: [
              { title: 'Giriş', pageNumber: 1 },
              { title: 'İman Hakikatleri', pageNumber: 5 }
            ]
          },
          {
            _id: 'İkinci Bölüm',
            pageNumber: 20,
            subChapters: [
              { title: 'Kur\'an Hakikatleri', pageNumber: 20 },
              { title: 'İbadet ve Hikmetleri', pageNumber: 35 }
            ]
          }
        ];
        
        // API'den sayfa yükleme (örnek için dummy sayfa kullanıyoruz)
        await this.loadPages(this.currentPageNumber);
      } catch (error) {
        console.error('Kitap yüklenirken hata oluştu:', error);
      } finally {
        this.loading = false;
      }
    },
    
    async loadPages(pageNumber) {
      // Gerçek uygulamada API'den sayfaları yükle
      // Şimdilik dummy sayfaları kullanıyoruz
      this.currentPageNumber = parseInt(pageNumber);
      this.pages = this.dummyPages;
    },
    
    async prevPage() {
      if (this.currentPageNumber > 1) {
        this.currentPageNumber -= 2;
        if (this.currentPageNumber < 1) this.currentPageNumber = 1;
        await this.loadPages(this.currentPageNumber);
        this.playPageSound();
      }
    },
    
    async nextPage() {
      if (this.currentPageNumber < this.totalPages) {
        this.currentPageNumber += 2;
        if (this.currentPageNumber > this.totalPages) {
          this.currentPageNumber = this.totalPages;
        }
        await this.loadPages(this.currentPageNumber);
        this.playPageSound();
      }
    },
    
    async goToPage(pageNumber) {
      const page = parseInt(pageNumber);
      if (page >= 1 && page <= this.totalPages) {
        this.currentPageNumber = page;
        await this.loadPages(this.currentPageNumber);
        this.showSidebar = false;
        this.playPageSound();
      }
    },
    
    toggleContents() {
      this.sidebarContent = 'contents';
      this.showSidebar = !this.showSidebar || this.sidebarContent !== 'contents';
    },
    
    toggleBookmarks() {
      this.sidebarContent = 'bookmarks';
      this.showSidebar = !this.showSidebar || this.sidebarContent !== 'bookmarks';
    },
    
    toggleSettings() {
      this.sidebarContent = 'settings';
      this.showSidebar = !this.showSidebar || this.sidebarContent !== 'settings';
    },
    
    toggleFullScreen() {
      this.isFullScreen = !this.isFullScreen;
      if (this.isFullScreen) {
        if (document.documentElement.requestFullscreen) {
          document.documentElement.requestFullscreen();
        }
      } else {
        if (document.exitFullscreen) {
          document.exitFullscreen();
        }
      }
    },
    
    changeFontSize(direction) {
      let fontSize = this.userSettings.fontSize;
      if (direction === 'larger') {
        fontSize = Math.min(fontSize + 2, 24);
      } else {
        fontSize = Math.max(fontSize - 2, 12);
      }
      this.$store.dispatch('updateUserSettings', { fontSize });
    },
    
    toggleDarkMode(value) {
      this.$store.dispatch('updateUserSettings', { darkMode: value });
    },
    
    updateSettings() {
      this.$store.dispatch('updateUserSettings', this.userSettings);
    },
    
    playPageSound() {
      if (this.userSettings.pageSound) {
        // Sayfa çevirme sesi çal
        const audio = new Audio('/sounds/page-flip.mp3');
        audio.play().catch(e => console.error('Ses çalınamadı:', e));
      }
    },
    
    handleKeyDown(event) {
      // Klavye kısayolları
      switch (event.key) {
        case 'ArrowLeft':
          this.prevPage();
          break;
        case 'ArrowRight':
          this.nextPage();
          break;
        case 'f':
          if (event.ctrlKey) {
            event.preventDefault();
            this.toggleFullScreen();
          }
          break;
        case 'Escape':
          if (this.isFullScreen) {
            this.isFullScreen = false;
            if (document.exitFullscreen) {
              document.exitFullscreen();
            }
          }
          break;
      }
    },
    
    // Not ekleme/düzenleme işlemleri
    addNote(event) {
      this.editingNote = null;
      this.noteContent = '';
      this.noteColor = '#ffeb3b';
      this.notePosition = {
        x: event.offsetX,
        y: event.offsetY
      };
      this.showNoteModal = true;
    },
    
    editNote(note) {
      this.editingNote = note;
      this.noteContent = note.content;
      this.noteColor = note.color;
      this.showNoteModal = true;
    },
    
    async saveNote() {
      if (!this.noteContent.trim()) {
        alert('Not içeriği boş olamaz!');
        return;
      }
      
      try {
        const userId = 'user123'; // Gerçek uygulamada kullanıcı ID'si olacak
        
        if (this.editingNote) {
          // Mevcut notu güncelle
          await this.$store.dispatch('updateNote', {
            id: this.editingNote._id,
            data: {
              content: this.noteContent,
              color: this.noteColor
            }
          });
        } else {
          // Yeni not ekle
          await this.$store.dispatch('addNote', {
            userId,
            bookId: this.bookId,
            pageNumber: this.currentPageNumber,
            content: this.noteContent,
            position: this.notePosition,
            color: this.noteColor
          });
        }
        
        this.closeNoteModal();
      } catch (error) {
        console.error('Not kaydedilirken hata oluştu:', error);
        alert('Not kaydedilirken bir hata oluştu.');
      }
    },
    
    async deleteNote(noteId) {
      if (confirm('Bu notu silmek istediğinizden emin misiniz?')) {
        try {
          await this.$store.dispatch('deleteNote', noteId);
        } catch (error) {
          console.error('Not silinirken hata oluştu:', error);
          alert('Not silinirken bir hata oluştu.');
        }
      }
    },
    
    closeNoteModal() {
      this.showNoteModal = false;
      this.editingNote = null;
    },
    
    // Yer imi ekleme/düzenleme işlemleri
    addBookmark() {
      this.editingBookmark = null;
      this.bookmarkName = `Sayfa ${this.currentPageNumber}`;
      this.bookmarkColor = '#e74c3c';
      this.showBookmarkModal = true;
    },
    
    editBookmark(bookmark) {
      this.editingBookmark = bookmark;
      this.bookmarkName = bookmark.name;
      this.bookmarkColor = bookmark.color;
      this.showBookmarkModal = true;
    },
    
    async saveBookmark() {
      if (!this.bookmarkName.trim()) {
        alert('Yer imi adı boş olamaz!');
        return;
      }
      
      try {
        const userId = 'user123'; // Gerçek uygulamada kullanıcı ID'si olacak
        
        if (this.editingBookmark) {
          // Mevcut yer imini güncelle
          await this.$store.dispatch('updateBookmark', {
            id: this.editingBookmark._id,
            data: {
              name: this.bookmarkName,
              color: this.bookmarkColor
            }
          });
        } else {
          // Yeni yer imi ekle
          await this.$store.dispatch('addBookmark', {
            userId,
            bookId: this.bookId,
            pageNumber: this.currentPageNumber,
            name: this.bookmarkName,
            color: this.bookmarkColor
          });
        }
        
        this.closeBookmarkModal();
      } catch (error) {
        console.error('Yer imi kaydedilirken hata oluştu:', error);
        alert('Yer imi kaydedilirken bir hata oluştu.');
      }
    },
    
    async deleteBookmark(bookmarkId) {
      if (confirm('Bu yer imini silmek istediğinizden emin misiniz?')) {
        try {
          await this.$store.dispatch('deleteBookmark', bookmarkId);
        } catch (error) {
          console.error('Yer imi silinirken hata oluştu:', error);
          alert('Yer imi silinirken bir hata oluştu.');
        }
      }
    },
    
    closeBookmarkModal() {
      this.showBookmarkModal = false;
      this.editingBookmark = null;
    },
    
    // Yer imi yardımcı fonksiyonları
    hasBookmark(pageNumber) {
      return this.bookmarks.some(b => b.pageNumber === pageNumber);
    },
    
    getBookmarkColor(pageNumber) {
      const bookmark = this.bookmarks.find(b => b.pageNumber === pageNumber);
      return bookmark ? bookmark.color : '#e74c3c';
    },
    
    getBookmarkName(pageNumber) {
      const bookmark = this.bookmarks.find(b => b.pageNumber === pageNumber);
      return bookmark ? bookmark.name : '';
    },
    
    // Sayfa notları için yardımcı fonksiyon
    getNotesForPage(pageNumber) {
      return this.$store.state.notes.filter(
        note => note.bookId === this.bookId && note.pageNumber === pageNumber
      );
    },
    
    // Kelime sözlüğü işlemleri
    addWordClickListeners() {
      // Sayfa içindeki metinlere kelime tıklama olayı ekle
      const pageContentElements = document.querySelectorAll('.page-content p');
      pageContentElements.forEach(element => {
        if (!element.hasWordListeners) {
          element.addEventListener('click', this.handleWordClick);
          element.hasWordListeners = true;
        }
      });
    },
    
    handleWordClick(event) {
      // Tıklanan metinden kelimeyi çıkar
      const text = window.getSelection().toString().trim();
      if (text && text.length > 0) {
        this.selectedWord = text;
        
        // Sözlük penceresinin konumunu ayarla
        const rect = window.getSelection().getRangeAt(0).getBoundingClientRect();
        this.dictionaryPosition = {
          top: `${rect.bottom + window.scrollY + 10}px`,
          left: `${rect.left + window.scrollX}px`
        };
        
        // Kelime anlamını ara
        this.searchWordMeaning(text);
      }
    },
    
    async searchWordMeaning(word) {
      this.showDictionary = true;
      this.dictionaryLoading = true;
      this.wordMeaning = null;
      
      try {
        // API'den kelime anlamını al
        const meaning = await this.$store.dispatch('searchWord', word);
        this.wordMeaning = meaning;
      } catch (error) {
        console.error('Kelime anlamı aranırken hata oluştu:', error);
      } finally {
        this.dictionaryLoading = false;
      }
    },
    
    closeDictionary() {
      this.showDictionary = false;
    }
  }
}
</script>

<style scoped lang="scss">
.reader-view {
  height: calc(100vh - 60px);
  display: flex;
  flex-direction: column;
  
  &.dark-mode {
    .reader-header {
      background-color: #222;
      color: #f5f5f5;
      
      .book-title {
        color: #f5f5f5;
      }
      
      .control-button {
        color: #f5f5f5;
        
        &:hover {
          background-color: #333;
        }
      }
    }
    
    .reader-main {
      background-color: #1a1a1a;
    }
    
    .book-container {
      .page {
        background-color: #222;
        color: #f5f5f5;
        box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
      }
    }
    
    .sidebar {
      background-color: #222;
      color: #f5f5f5;
      border-right-color: #333;
      
      h3 {
        color: #f5f5f5;
        border-bottom-color: #333;
      }
    }
    
    .book-navigation {
      background-color: rgba(34, 34, 34, 0.8);
      color: #f5f5f5;
      
      .nav-button {
        color: #f5f5f5;
        
        &:hover:not(:disabled) {
          background-color: #333;
        }
        
        &:disabled {
          color: #666;
        }
      }
    }
  }
}

.reader-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 20px;
  background-color: #fff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  z-index: 10;
  
  .book-info {
    display: flex;
    align-items: center;
    
    .back-button {
      margin-right: 15px;
      font-size: 1.5rem;
      color: #333;
      text-decoration: none;
      
      &:hover {
        color: #4a69bd;
      }
    }
    
    .book-title {
      font-size: 1.4rem;
      font-weight: 600;
      color: #333;
    }
  }
  
  .reader-controls {
    display: flex;
    gap: 10px;
    
    .control-button {
      background: none;
      border: none;
      font-size: 1.2rem;
      padding: 8px;
      border-radius: 4px;
      cursor: pointer;
      color: #333;
      position: relative;
      
      &:hover {
        background-color: #f5f5f5;
        
        .tooltip {
          visibility: visible;
          opacity: 1;
        }
      }
      
      .tooltip {
        visibility: hidden;
        opacity: 0;
        position: absolute;
        bottom: -30px;
        left: 50%;
        transform: translateX(-50%);
        background-color: rgba(0, 0, 0, 0.8);
        color: white;
        padding: 5px 10px;
        border-radius: 4px;
        font-size: 0.8rem;
        white-space: nowrap;
        transition: opacity 0.2s;
        z-index: 100;
        
        &:before {
          content: '';
          position: absolute;
          top: -5px;
          left: 50%;
          transform: translateX(-50%);
          border-left: 5px solid transparent;
          border-right: 5px solid transparent;
          border-bottom: 5px solid rgba(0, 0, 0, 0.8);
        }
      }
    }
  }
}

.reader-container {
  display: flex;
  flex: 1;
  overflow: hidden;
}

.sidebar {
  width: 300px;
  background-color: #fff;
  border-right: 1px solid #ddd;
  overflow-y: auto;
  transition: width 0.3s;
  
  h3 {
    padding: 15px;
    margin: 0;
    border-bottom: 1px solid #eee;
    font-size: 1.2rem;
  }
  
  .sidebar-loading {
    display: flex;
    justify-content: center;
    padding: 30px;
    
    .loading-spinner {
      width: 30px;
      height: 30px;
      border: 3px solid #f3f3f3;
      border-top: 3px solid #4a69bd;
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }
  }
  
  .sidebar-empty {
    padding: 20px;
    text-align: center;
    color: #666;
    
    p {
      margin-bottom: 15px;
    }
  }
  
  .contents-list, .bookmarks-list {
    list-style: none;
    padding: 0;
    margin: 0;
  }
  
  .chapter-item {
    padding: 0;
    margin: 0;
    
    .chapter-title {
      padding: 12px 15px;
      cursor: pointer;
      font-weight: 600;
      border-bottom: 1px solid #eee;
      
      &:hover {
        background-color: #f5f5f5;
      }
    }
    
    .subchapter-list {
      list-style: none;
      padding: 0;
      margin: 0;
      background-color: #f9f9f9;
      
      .subchapter-item {
        padding: 10px 15px 10px 30px;
        cursor: pointer;
        border-bottom: 1px solid #eee;
        
        &:hover {
          background-color: #f0f0f0;
        }
      }
    }
  }
  
  .bookmark-item {
    padding: 15px;
    border-left: 4px solid #e74c3c;
    border-bottom: 1px solid #eee;
    cursor: pointer;
    position: relative;
    
    &:hover {
      background-color: #f5f5f5;
      
      .bookmark-delete {
        display: block;
      }
    }
    
    .bookmark-title {
      font-weight: 600;
      margin-bottom: 5px;
    }
    
    .bookmark-page {
      font-size: 0.9rem;
      color: #666;
    }
    
    .bookmark-delete {
      display: none;
      position: absolute;
      top: 10px;
      right: 10px;
      width: 20px;
      height: 20px;
      border-radius: 50%;
      background-color: #e74c3c;
      color: white;
      border: none;
      font-size: 1rem;
      line-height: 1;
      cursor: pointer;
      
      &:hover {
        background-color: #c0392b;
      }
    }
  }
  
  .settings-group {
    padding: 15px;
    border-bottom: 1px solid #eee;
    
    h4 {
      margin: 0 0 10px 0;
      font-size: 1rem;
    }
    
    .font-size-controls {
      display: flex;
      align-items: center;
      justify-content: space-between;
      
      .current-size {
        font-size: 1rem;
        margin: 0 15px;
      }
    }
    
    .font-select {
      width: 100%;
      padding: 8px;
      border-radius: 4px;
      border: 1px solid #ddd;
      
      &:focus {
        outline: none;
        border-color: #4a69bd;
      }
    }
    
    .range-slider {
      width: 100%;
      margin: 10px 0;
    }
    
    .range-value {
      text-align: center;
      font-size: 0.9rem;
    }
    
    .theme-switch {
      display: flex;
      gap: 10px;
      
      .theme-option {
        flex: 1;
        padding: 8px;
        border: 1px solid #ddd;
        border-radius: 4px;
        background-color: #fff;
        cursor: pointer;
        text-align: center;
        
        &.light {
          &.active {
            background-color: #f8f9fa;
            border-color: #4a69bd;
            color: #4a69bd;
          }
        }
        
        &.dark {
          background-color: #333;
          color: #fff;
          
          &.active {
            background-color: #121212;
            border-color: #4a69bd;
          }
        }
      }
    }
    
    .effect-options {
      display: flex;
      flex-direction: column;
      gap: 10px;
      
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

.reader-main {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #f8f8f8;
  overflow: hidden;
  position: relative;
  
  &.with-sidebar {
    margin-left: 0;
  }
}

.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background-color: rgba(255, 255, 255, 0.8);
  z-index: 100;
  
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
    color: #333;
  }
}

.book-container {
  width: 90%;
  max-width: 1000px;
  height: 90%;
  position: relative;
  display: flex;
  justify-content: center;
  
  .book-reader {
    width: 100%;
    height: 100%;
    position: relative;
    
    .pages-container {
      width: 100%;
      height: calc(100% - 60px);
      position: relative;
      display: flex;
      justify-content: center;
      perspective: 1500px;
    }
    
    .page {
      width: 45%;
      height: 100%;
      background-color: #fff;
      padding: 40px;
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
      position: relative;
      overflow: hidden;
      
      &.odd {
        border-radius: 10px 0 0 10px;
        margin-right: 2px;
      }
      
      &.even {
        border-radius: 0 10px 10px 0;
        margin-left: 2px;
      }
      
      .page-content {
        height: 100%;
        overflow-y: auto;
        padding-right: 15px;
        
        p {
          margin-bottom: 1em;
          text-align: justify;
        }
        
        .page-number {
          position: absolute;
          bottom: 20px;
          font-size: 0.9rem;
          color: #666;
          
          &.left {
            left: 20px;
          }
          
          &.right {
            right: 20px;
          }
        }
      }
      
      .page-notes {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        pointer-events: none;
        
        .note {
          position: absolute;
          background-color: rgba(255, 235, 59, 0.7);
          padding: 10px;
          border-radius: 4px;
          max-width: 200px;
          font-size: 0.9rem;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          pointer-events: auto;
          z-index: 10;
          
          .note-actions {
            display: none;
            margin-top: 5px;
            
            button {
              background: none;
              border: none;
              font-size: 0.8rem;
              cursor: pointer;
              color: #333;
              
              &:hover {
                text-decoration: underline;
              }
            }
          }
          
          &:hover .note-actions {
            display: flex;
            justify-content: space-between;
          }
        }
      }
      
      .bookmark-indicator {
        position: absolute;
        top: 0;
        right: 20px;
        width: 40px;
        height: 60px;
        background-color: #e74c3c;
        border-radius: 0 0 20px 20px;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        z-index: 5;
        
        .bookmark-name {
          position: absolute;
          top: 100%;
          left: 0;
          width: 120px;
          background-color: inherit;
          color: white;
          padding: 5px;
          border-radius: 0 0 4px 4px;
          font-size: 0.8rem;
          text-align: center;
          transform: translateX(-40px);
          opacity: 0;
          transition: opacity 0.3s, top 0.3s;
        }
        
        &:hover .bookmark-name {
          opacity: 1;
          top: 60px;
        }
      }
    }
    
    .no-pages {
      display: flex;
      justify-content: center;
      align-items: center;
      height: 100%;
      
      p {
        font-size: 1.2rem;
        color: #666;
      }
    }
    
    .book-navigation {
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      height: 60px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0 20px;
      background-color: rgba(255, 255, 255, 0.8);
      backdrop-filter: blur(5px);
      
      .nav-button {
        width: 40px;
        height: 40px;
        border-radius: 50%;
        background-color: transparent;
        border: none;
        font-size: 1.2rem;
        cursor: pointer;
        
        &:hover:not(:disabled) {
          background-color: #f0f0f0;
        }
        
        &:disabled {
          cursor: not-allowed;
          color: #ccc;
        }
      }
      
      .page-info {
        font-size: 1rem;
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
      
      .note-textarea {
        width: 100%;
        height: 150px;
        padding: 10px;
        border: 1px solid #ddd;
        border-radius: 4px;
        font-size: 1rem;
        font-family: inherit;
        resize: vertical;
        
        &:focus {
          outline: none;
          border-color: #4a69bd;
        }
      }
      
      .note-colors, .bookmark-colors {
        margin-top: 20px;
        
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

.dictionary-popup {
  position: absolute;
  width: 300px;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 500;
  
  .dictionary-header {
    padding: 10px 15px;
    border-bottom: 1px solid #eee;
    display: flex;
    justify-content: space-between;
    align-items: center;
    
    h4 {
      margin: 0;
      font-size: 1.1rem;
    }
    
    .dictionary-close {
      background: none;
      border: none;
      font-size: 1.2rem;
      cursor: pointer;
      color: #666;
      
      &:hover {
        color: #333;
      }
    }
  }
  
  .dictionary-content {
    padding: 15px;
    
    .dictionary-loading {
      display: flex;
      justify-content: center;
      padding: 20px;
      
      .loading-spinner {
        width: 30px;
        height: 30px;
        border: 3px solid #f3f3f3;
        border-top: 3px solid #4a69bd;
        border-radius: 50%;
        animation: spin 1s linear infinite;
      }
    }
    
    .word-meaning {
      p {
        margin-bottom: 10px;
        line-height: 1.4;
      }
      
      .word-example {
        font-style: italic;
        color: #666;
      }
    }
    
    .word-not-found {
      text-align: center;
      padding: 10px;
      color: #666;
    }
  }
}

// Sayfa tıklama alanı
.page-content p {
  cursor: text;
}

// İkon stilleri
.icon-back:before {
  content: '←';
}

.icon-contents:before {
  content: '☰';
}

.icon-bookmarks:before {
  content: '🔖';
}

.icon-settings:before {
  content: '⚙️';
}

.icon-fullscreen:before {
  content: '⛶';
}

.icon-fullscreen-exit:before {
  content: '⮹';
}

.icon-prev:before {
  content: '◀';
}

.icon-next:before {
  content: '▶';
}

// Animasyonlar
@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

// Responsive
@media (max-width: 992px) {
  .book-container .book-reader .page {
    padding: 20px;
    width: 48%;
  }
}

@media (max-width: 768px) {
  .reader-header {
    .book-info .book-title {
      font-size: 1.1rem;
    }
    
    .reader-controls {
      gap: 5px;
      
      .control-button {
        font-size: 1rem;
        padding: 6px;
      }
    }
  }
  
  .sidebar {
    width: 250px;
  }
  
  .book-container .book-reader {
    .page {
      padding: 15px;
      width: 48%;
      
      .page-content {
        font-size: 0.9rem !important;
      }
    }
  }
}

@media (max-width: 576px) {
  .reader-header {
    padding: 8px 15px;
    
    .book-info {
      .back-button {
        margin-right: 10px;
        font-size: 1.2rem;
      }
      
      .book-title {
        font-size: 1rem;
      }
    }
  }
  
  .book-container {
    width: 98%;
    
    .book-reader {
      .pages-container {
        flex-direction: column;
        align-items: center;
      }
      
      .page {
        width: 90%;
        height: auto;
        max-height: calc((100% - 20px) / 2);
        margin: 5px 0;
        
        &.odd, &.even {
          border-radius: 10px;
        }
      }
    }
  }
}
</style>