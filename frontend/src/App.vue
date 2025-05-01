<template>
  <div id="app" :class="{ 'dark-mode': isDarkMode }">
    <header class="app-header" v-if="!isFullScreen">
      <div class="logo">
        <router-link to="/">
          <img src="@/assets/images/sözler.png" alt="Risale-i Nur Dijital Kütüphane" style="height: 40px;" />
        </router-link>
      </div>
      <div class="search-bar">
        <input 
          type="text" 
          v-model="searchQuery" 
          placeholder="Risale-i Nur'da ara..." 
          @keyup.enter="search"
        />
        <button @click="search">Ara</button>
      </div>
      <div class="settings">
        <button @click="toggleDarkMode" class="icon-button">
          <i :class="isDarkMode ? 'icon-light' : 'icon-dark'"></i>
        </button>
        <button @click="toggleFullScreen" class="icon-button">
          <i class="icon-fullscreen"></i>
        </button>
      </div>
    </header>

    <main class="app-content">
      <router-view />
    </main>

    <footer class="app-footer" v-if="!isFullScreen">
      <p>&copy; {{ new Date().getFullYear() }} Risale-i Nur Dijital Kütüphane</p>
    </footer>
  </div>
</template>

<script>
export default {
  name: 'App',
  data() {
    return {
      searchQuery: '',
      isDarkMode: false,
      isFullScreen: false
    }
  },
  created() {
    // Kullanıcı tercihlerini localStorage'dan al
    const darkMode = localStorage.getItem('darkMode');
    if (darkMode) {
      this.isDarkMode = darkMode === 'true';
    }
  },
  methods: {
    search() {
      if (this.searchQuery.trim()) {
        this.$router.push({ 
          name: 'search-results', 
          query: { q: this.searchQuery } 
        });
      }
    },
    toggleDarkMode() {
      this.isDarkMode = !this.isDarkMode;
      localStorage.setItem('darkMode', this.isDarkMode);
    },
    toggleFullScreen() {
      this.isFullScreen = !this.isFullScreen;
      if (this.isFullScreen) {
        document.documentElement.requestFullscreen().catch(err => {
          console.error('Tam ekran moduna geçilemedi:', err);
          this.isFullScreen = false;
        });
      } else {
        if (document.fullscreenElement) {
          document.exitFullscreen();
        }
      }
    }
  }
}
</script>

<style lang="scss">
// Genel stil tanımları
#app {
  font-family: 'Nunito', 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  
  &.dark-mode {
    background-color: #121212;
    color: #f0f0f0;
    
    .app-header, .app-footer {
      background-color: #1e1e1e;
      color: #f0f0f0;
    }
    
    .search-bar input {
      background-color: #2a2a2a;
      color: #f0f0f0;
      border-color: #333;
    }
    
    .search-bar button {
      background-color: #3a3a3a;
      color: #f0f0f0;
    }
    
    .icon-button {
      color: #f0f0f0;
    }
  }
}

.app-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 2rem;
  background-color: #fff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  z-index: 10;
  
  .logo {
    img {
      height: 40px;
    }
  }
  
  .search-bar {
    display: flex;
    flex: 1;
    max-width: 500px;
    margin: 0 2rem;
    
    input {
      flex: 1;
      padding: 0.5rem 1rem;
      border: 1px solid #ddd;
      border-radius: 4px 0 0 4px;
      font-size: 1rem;
      
      &:focus {
        outline: none;
        border-color: #4a69bd;
      }
    }
    
    button {
      padding: 0.5rem 1rem;
      background-color: #4a69bd;
      color: white;
      border: none;
      border-radius: 0 4px 4px 0;
      cursor: pointer;
      font-size: 1rem;
      
      &:hover {
        background-color: #3b5998;
      }
    }
  }
  
  .settings {
    display: flex;
    gap: 1rem;
    
    .icon-button {
      background: none;
      border: none;
      font-size: 1.5rem;
      cursor: pointer;
      color: #333;
      
      &:hover {
        color: #4a69bd;
      }
    }
  }
}

.app-content {
  flex: 1;
  padding: 2rem;
}

.app-footer {
  padding: 1rem 2rem;
  background-color: #f8f9fa;
  text-align: center;
  font-size: 0.9rem;
  color: #6c757d;
}

// İkon stilleri
.icon-dark:before {
  content: '🌙';
}

.icon-light:before {
  content: '☀️';
}

.icon-fullscreen:before {
  content: '⛶';
}
</style>
