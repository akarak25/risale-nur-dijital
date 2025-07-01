<template>
  <div id="app" :data-theme="theme">
    <!-- Ana Navigasyon -->
    <nav class="main-nav" v-if="!isReaderFullscreen">
      <div class="nav-container">
        <div class="nav-brand">
          <router-link to="/" class="brand-link">
            <div class="brand-logo">
              <span class="arabic-text">رسائل النور</span>
            </div>
            <div class="brand-text">
              <h1>Risale-i Nur</h1>
              <p>Dijital Kütüphane</p>
            </div>
          </router-link>
        </div>

        <div class="nav-search">
          <div class="search-container">
            <input 
              type="text" 
              v-model="searchQuery" 
              placeholder="Külliyatta ara..." 
              @keyup.enter="performSearch"
              class="search-input"
            >
            <button @click="performSearch" class="search-btn">
              <span class="icon">🔍</span>
            </button>
          </div>
        </div>

        <div class="nav-actions">
          <button @click="toggleTheme" class="action-btn theme-toggle">
            <span class="icon">{{ themeIcon }}</span>
            <span class="tooltip">{{ themeTooltip }}</span>
          </button>
          
          <router-link v-if="isAuthenticated" to="/bookmarks" class="action-btn">
            <span class="icon">🔖</span>
            <span class="badge" v-if="bookmarkCount > 0">{{ bookmarkCount }}</span>
            <span class="tooltip">Yer İmleri</span>
          </router-link>
          
          <router-link v-if="isAuthenticated && isAdmin" to="/admin" class="action-btn">
            <span class="icon">🛠️</span>
            <span class="tooltip">Admin Panel</span>
          </router-link>
          
          <router-link v-if="isAuthenticated" to="/profile" class="action-btn">
            <span class="icon">👤</span>
            <span class="tooltip">Profilim</span>
          </router-link>
          
          <router-link v-if="!isAuthenticated" to="/login" class="action-btn">
            <span class="icon">🔑</span>
            <span class="tooltip">Giriş Yap</span>
          </router-link>
          
          <button v-if="isAuthenticated" @click="handleLogout" class="action-btn">
            <span class="icon">🚪</span>
            <span class="tooltip">Çıkış Yap</span>
          </button>
          
          <button @click="toggleMenu" class="action-btn menu-toggle">
            <span class="icon">☰</span>
          </button>
        </div>
      </div>
    </nav>

    <!-- Mobil Menü -->
    <transition name="slide">
      <div v-if="showMobileMenu" class="mobile-menu">
        <div class="menu-header">
          <h3>Menü</h3>
          <button @click="toggleMenu" class="close-btn">×</button>
        </div>
        <nav class="menu-items">
          <router-link to="/" @click="toggleMenu" class="menu-item">
            <span class="icon">🏠</span>
            Ana Sayfa
          </router-link>
          <router-link to="/bookshelf" @click="toggleMenu" class="menu-item">
            <span class="icon">📚</span>
            Kitaplık
          </router-link>
          <router-link v-if="isAuthenticated" to="/bookmarks" @click="toggleMenu" class="menu-item">
            <span class="icon">🔖</span>
            Yer İmleri
          </router-link>
          <router-link v-if="isAuthenticated && isAdmin" to="/admin" @click="toggleMenu" class="menu-item">
            <span class="icon">🛠️</span>
            Admin Panel
          </router-link>
          <router-link v-if="isAuthenticated" to="/profile" @click="toggleMenu" class="menu-item">
            <span class="icon">👤</span>
            Profilim
          </router-link>
          <router-link to="/about" @click="toggleMenu" class="menu-item">
            <span class="icon">ℹ️</span>
            Hakkında
          </router-link>
          <div class="menu-divider" v-if="isAuthenticated"></div>
          <button v-if="isAuthenticated" @click="handleLogout" class="menu-item logout-item">
            <span class="icon">🚪</span>
            Çıkış Yap
          </button>
          <router-link v-if="!isAuthenticated" to="/login" @click="toggleMenu" class="menu-item">
            <span class="icon">🔑</span>
            Giriş Yap
          </router-link>
          <router-link v-if="!isAuthenticated" to="/register" @click="toggleMenu" class="menu-item">
            <span class="icon">✍️</span>
            Kayıt Ol
          </router-link>
        </nav>
      </div>
    </transition>

    <!-- Ana İçerik -->
    <main class="main-content">
      <router-view v-slot="{ Component }">
        <transition name="page" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </main>

    <!-- Alt Bilgi -->
    <footer class="main-footer" v-if="!isReaderFullscreen">
      <div class="footer-content">
        <div class="footer-section">
          <h4>Risale-i Nur Külliyatı</h4>
          <p>Bediüzzaman Said Nursi'nin tüm eserleri dijital ortamda</p>
        </div>
        
        <div class="footer-section">
          <h4>Hızlı Erişim</h4>
          <div class="footer-links">
            <router-link to="/bookshelf/sozler">Sözler</router-link>
            <router-link to="/bookshelf/mektubat">Mektubat</router-link>
            <router-link to="/bookshelf/lemalar">Lem'alar</router-link>
            <router-link to="/bookshelf/sualar">Şualar</router-link>
          </div>
        </div>
        
        <div class="footer-section">
          <h4>İletişim</h4>
          <p>risale@example.com</p>
          <div class="social-links">
            <a href="#" class="social-link">📧</a>
            <a href="#" class="social-link">📱</a>
          </div>
        </div>
      </div>
      
      <div class="footer-bottom">
        <p>&copy; {{ currentYear }} Risale-i Nur Dijital Kütüphane. Tüm hakları saklıdır.</p>
      </div>
    </footer>

    <!-- Bildirim Toast -->
    <transition name="toast">
      <div v-if="notification" class="toast" :class="notification.type">
        <span class="toast-icon">{{ notification.icon }}</span>
        <span class="toast-message">{{ notification.message }}</span>
        <button @click="closeNotification" class="toast-close">×</button>
      </div>
    </transition>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';

export default {
  name: 'App',
  data() {
    return {
      searchQuery: '',
      theme: 'light',
      showMobileMenu: false,
      notification: null,
      isReaderFullscreen: false
    }
  },
  computed: {
    ...mapGetters('auth', ['isAuthenticated', 'user']),
    isAdmin() {
      return this.user && this.user.role === 'admin';
    },
    currentYear() {
      return new Date().getFullYear();
    },
    themeIcon() {
      const icons = {
        light: '☀️',
        sepia: '📜',
        dark: '🌙'
      };
      return icons[this.theme];
    },
    themeTooltip() {
      const tooltips = {
        light: 'Aydınlık Tema',
        sepia: 'Sepya Tema',
        dark: 'Karanlık Tema'
      };
      return tooltips[this.theme];
    },
    bookmarkCount() {
      return this.$store?.state?.bookmarks?.length || 0;
    }
  },
  created() {
    // Tema tercihini yükle
    const savedTheme = localStorage.getItem('appTheme');
    if (savedTheme) {
      this.theme = savedTheme;
    }
    
    // Route değişikliklerini dinle
    this.$router.beforeEach((to, from, next) => {
      // Reader sayfasında tam ekran kontrolü
      this.isReaderFullscreen = to.name === 'reader' && to.query.fullscreen === 'true';
      next();
    });
    
    // Event listener'ları ekle
    this.setupEventListeners();
    
    // Store'dan notification dinle
    this.$store.watch(
      (state) => state.notification,
      (notification) => {
        if (notification) {
          this.showNotification(notification);
          // Notification'ı temizle
          setTimeout(() => {
            this.$store.commit('SET_NOTIFICATION', null);
          }, 100);
        }
      }
    );
  },
  methods: {
    performSearch() {
      if (this.searchQuery.trim()) {
        this.$router.push({ 
          name: 'search-results', 
          query: { q: this.searchQuery } 
        });
        this.searchQuery = '';
      }
    },
    
    toggleTheme() {
      const themes = ['light', 'sepia', 'dark'];
      const currentIndex = themes.indexOf(this.theme);
      this.theme = themes[(currentIndex + 1) % themes.length];
      localStorage.setItem('appTheme', this.theme);
      
      this.showNotification({
        type: 'success',
        icon: this.themeIcon,
        message: `${this.themeTooltip} aktif`
      });
    },
    
    toggleMenu() {
      this.showMobileMenu = !this.showMobileMenu;
    },
    
    showNotification(notification) {
      this.notification = notification;
      setTimeout(() => {
        this.notification = null;
      }, 3000);
    },
    
    closeNotification() {
      this.notification = null;
    },
    
    async handleLogout() {
      this.showMobileMenu = false;
      await this.$store.dispatch('auth/logout');
      this.showNotification({
        type: 'success',
        icon: '👋',
        message: 'Başarıyla çıkış yaptınız'
      });
    },
    
    setupEventListeners() {
      // Klavye kısayolları
      document.addEventListener('keydown', (e) => {
        // Ctrl/Cmd + K: Arama
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
          e.preventDefault();
          const searchInput = document.querySelector('.search-input');
          if (searchInput) searchInput.focus();
        }
        
        // Ctrl/Cmd + T: Tema değiştir
        if ((e.ctrlKey || e.metaKey) && e.key === 't') {
          e.preventDefault();
          this.toggleTheme();
        }
      });
    }
  }
}
</script>

<style lang="scss">
@import '@/assets/styles/main.scss';

#app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: var(--bg-primary);
  color: var(--text-primary);
  transition: all 0.3s ease;
}

// Ana Navigasyon
.main-nav {
  background: var(--bg-card);
  box-shadow: var(--shadow-md);
  position: sticky;
  top: 0;
  z-index: 100;
  
  .nav-container {
    max-width: 1400px;
    margin: 0 auto;
    padding: 1rem 2rem;
    display: flex;
    align-items: center;
    gap: 2rem;
    
    @media (max-width: 768px) {
      padding: 1rem;
      gap: 1rem;
    }
  }
  
  .nav-brand {
    .brand-link {
      display: flex;
      align-items: center;
      gap: 1rem;
      text-decoration: none;
      color: inherit;
      
      .brand-logo {
        width: 50px;
        height: 50px;
        background: var(--primary-color);
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        
        .arabic-text {
          color: white;
          font-size: 0.8rem;
        }
      }
      
      .brand-text {
        @media (max-width: 768px) {
          display: none;
        }
        
        h1 {
          font-size: 1.25rem;
          margin: 0;
          color: var(--primary-color);
        }
        
        p {
          font-size: 0.875rem;
          margin: 0;
          color: var(--text-secondary);
        }
      }
    }
  }
  
  .nav-search {
    flex: 1;
    max-width: 600px;
    
    .search-container {
      display: flex;
      background: var(--bg-secondary);
      border-radius: 30px;
      overflow: hidden;
      
      .search-input {
        flex: 1;
        padding: 0.75rem 1.5rem;
        border: none;
        background: transparent;
        font-size: 1rem;
        color: var(--text-primary);
        
        &:focus {
          outline: none;
        }
        
        &::placeholder {
          color: var(--text-light);
        }
      }
      
      .search-btn {
        padding: 0 1.5rem;
        background: transparent;
        border: none;
        cursor: pointer;
        color: var(--text-secondary);
        transition: all 0.3s;
        
        &:hover {
          color: var(--primary-color);
        }
      }
    }
  }
  
  .nav-actions {
    display: flex;
    gap: 0.5rem;
    
    .action-btn {
      position: relative;
      width: 40px;
      height: 40px;
      border-radius: 50%;
      border: none;
      background: transparent;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--text-primary);
      text-decoration: none;
      transition: all 0.3s;
      
      &:hover {
        background: var(--bg-secondary);
        
        .tooltip {
          opacity: 1;
          visibility: visible;
          transform: translateY(0);
        }
      }
      
      .icon {
        font-size: 1.25rem;
      }
      
      .badge {
        position: absolute;
        top: -5px;
        right: -5px;
        background: var(--accent-color);
        color: var(--primary-dark);
        font-size: 0.75rem;
        padding: 2px 6px;
        border-radius: 10px;
        font-weight: 600;
      }
      
      .tooltip {
        position: absolute;
        bottom: -35px;
        left: 50%;
        transform: translateX(-50%) translateY(5px);
        background: rgba(0, 0, 0, 0.8);
        color: white;
        padding: 0.25rem 0.75rem;
        border-radius: 4px;
        font-size: 0.875rem;
        white-space: nowrap;
        opacity: 0;
        visibility: hidden;
        transition: all 0.3s;
      }
      
      &.menu-toggle {
        display: none;
        
        @media (max-width: 768px) {
          display: flex;
        }
      }
    }
  }
}

// Mobil Menü
.mobile-menu {
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  width: 300px;
  background: var(--bg-card);
  box-shadow: var(--shadow-lg);
  z-index: 200;
  overflow-y: auto;
  
  .menu-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1.5rem;
    border-bottom: 1px solid var(--bg-secondary);
    
    h3 {
      margin: 0;
      color: var(--primary-color);
    }
    
    .close-btn {
      background: none;
      border: none;
      font-size: 2rem;
      cursor: pointer;
      color: var(--text-secondary);
    }
  }
  
  .menu-items {
    padding: 1rem;
    
    .menu-item {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 1rem;
      border-radius: 8px;
      text-decoration: none;
      color: var(--text-primary);
      transition: all 0.3s;
      
      &:hover {
        background: var(--bg-secondary);
      }
      
      &.router-link-active {
        background: var(--primary-color);
        color: white;
      }
    }
    
    .menu-divider {
      height: 1px;
      background: var(--bg-secondary);
      margin: 0.5rem 0;
    }
    
    .logout-item {
      color: #e74c3c;
      
      &:hover {
        background: #fee;
        color: #c0392b;
      }
    }
  }
}

// Ana İçerik
.main-content {
  flex: 1;
  width: 100%;
  max-width: 1400px;
  margin: 0 auto;
  padding: 2rem;
  
  @media (max-width: 768px) {
    padding: 1rem;
  }
}

// Alt Bilgi
.main-footer {
  background: var(--bg-card);
  margin-top: 4rem;
  
  .footer-content {
    max-width: 1400px;
    margin: 0 auto;
    padding: 3rem 2rem;
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 2rem;
    
    @media (max-width: 768px) {
      padding: 2rem 1rem;
    }
  }
  
  .footer-section {
    h4 {
      color: var(--primary-color);
      margin-bottom: 1rem;
    }
    
    p {
      color: var(--text-secondary);
      line-height: 1.6;
    }
    
    .footer-links {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      
      a {
        color: var(--text-secondary);
        text-decoration: none;
        transition: all 0.3s;
        
        &:hover {
          color: var(--primary-color);
          transform: translateX(5px);
        }
      }
    }
    
    .social-links {
      display: flex;
      gap: 1rem;
      margin-top: 1rem;
      
      .social-link {
        width: 40px;
        height: 40px;
        border-radius: 50%;
        background: var(--bg-secondary);
        display: flex;
        align-items: center;
        justify-content: center;
        text-decoration: none;
        font-size: 1.25rem;
        transition: all 0.3s;
        
        &:hover {
          background: var(--primary-color);
          transform: translateY(-3px);
        }
      }
    }
  }
  
  .footer-bottom {
    background: var(--bg-secondary);
    padding: 1.5rem;
    text-align: center;
    
    p {
      margin: 0;
      color: var(--text-light);
      font-size: 0.875rem;
    }
  }
}

// Toast Bildirimi
.toast {
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  background: var(--bg-card);
  padding: 1rem 1.5rem;
  border-radius: 8px;
  box-shadow: var(--shadow-lg);
  display: flex;
  align-items: center;
  gap: 1rem;
  z-index: 300;
  
  &.success {
    border-left: 4px solid var(--green-color);
  }
  
  &.error {
    border-left: 4px solid #e74c3c;
  }
  
  &.info {
    border-left: 4px solid var(--primary-color);
  }
  
  .toast-icon {
    font-size: 1.5rem;
  }
  
  .toast-message {
    flex: 1;
  }
  
  .toast-close {
    background: none;
    border: none;
    font-size: 1.5rem;
    cursor: pointer;
    color: var(--text-secondary);
    
    &:hover {
      color: var(--text-primary);
    }
  }
}

// Animasyonlar
.slide-enter-active,
.slide-leave-active {
  transition: transform 0.3s ease;
}

.slide-enter-from {
  transform: translateX(100%);
}

.slide-leave-to {
  transform: translateX(100%);
}

.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}

.toast-enter-from {
  transform: translateY(100%);
  opacity: 0;
}

.toast-leave-to {
  transform: translateY(100%);
  opacity: 0;
}

.page-enter-active,
.page-leave-active {
  transition: all 0.3s ease;
}

.page-enter-from {
  opacity: 0;
  transform: translateY(20px);
}

.page-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}
</style>