<template>
  <div class="profile-page">
    <div class="page-header">
      <h1>Profilim</h1>
      <p class="page-subtitle">Hesap bilgilerinizi ve tercihlerinizi yönetin</p>
    </div>
    
    <div class="profile-container">
      <!-- Sol menü -->
      <aside class="profile-sidebar">
        <nav class="sidebar-nav">
          <button
            v-for="tab in tabs"
            :key="tab.id"
            @click="activeTab = tab.id"
            :class="['nav-item', { active: activeTab === tab.id }]"
          >
            <span class="nav-icon">{{ tab.icon }}</span>
            <span class="nav-text">{{ tab.label }}</span>
          </button>
        </nav>
      </aside>
      
      <!-- Ana içerik -->
      <main class="profile-content">
        <!-- Profil Bilgileri -->
        <section v-if="activeTab === 'profile'" class="content-section">
          <h2>Profil Bilgileri</h2>
          
          <div v-if="profileSuccess" class="alert alert-success">
            <span class="alert-icon">✅</span>
            {{ profileSuccess }}
          </div>
          
          <div v-if="profileError" class="alert alert-error">
            <span class="alert-icon">⚠️</span>
            {{ profileError }}
          </div>
          
          <form @submit.prevent="updateProfile" class="profile-form">
            <div class="form-row">
              <div class="form-group">
                <label for="name">Ad Soyad</label>
                <input
                  id="name"
                  v-model="profileForm.name"
                  type="text"
                  class="form-input"
                  required
                  :disabled="loading"
                >
              </div>
              
              <div class="form-group">
                <label for="email">Email Adresi</label>
                <input
                  id="email"
                  v-model="profileForm.email"
                  type="email"
                  class="form-input"
                  required
                  :disabled="loading"
                >
                <p class="form-hint" v-if="user && !user.isEmailVerified">
                  <span class="warning-icon">⚠️</span>
                  Email adresiniz doğrulanmamış
                </p>
              </div>
            </div>
            
            <div class="form-actions">
              <button type="submit" class="btn btn-primary" :disabled="loading || !profileChanged">
                {{ loading ? 'Kaydediliyor...' : 'Değişiklikleri Kaydet' }}
              </button>
            </div>
          </form>
          
          <div class="section-divider"></div>
          
          <div class="account-info">
            <h3>Hesap Bilgileri</h3>
            <div class="info-grid">
              <div class="info-item">
                <span class="info-label">Kayıt Tarihi:</span>
                <span class="info-value">{{ formatDate(user?.createdAt) }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Son Giriş:</span>
                <span class="info-value">{{ formatDate(user?.lastLogin) }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Hesap Türü:</span>
                <span class="info-value">{{ user?.role === 'admin' ? 'Yönetici' : 'Kullanıcı' }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Hesap Durumu:</span>
                <span class="info-value status" :class="{ active: user?.isActive }">
                  {{ user?.isActive ? 'Aktif' : 'Pasif' }}
                </span>
              </div>
            </div>
          </div>
        </section>
        
        <!-- Güvenlik -->
        <section v-if="activeTab === 'security'" class="content-section">
          <h2>Güvenlik Ayarları</h2>
          
          <div v-if="securitySuccess" class="alert alert-success">
            <span class="alert-icon">✅</span>
            {{ securitySuccess }}
          </div>
          
          <div v-if="securityError" class="alert alert-error">
            <span class="alert-icon">⚠️</span>
            {{ securityError }}
          </div>
          
          <form @submit.prevent="updatePassword" class="security-form">
            <h3>Şifre Değiştir</h3>
            
            <div class="form-group">
              <label for="currentPassword">Mevcut Şifre</label>
              <input
                id="currentPassword"
                v-model="passwordForm.currentPassword"
                type="password"
                class="form-input"
                required
                :disabled="loading"
              >
            </div>
            
            <div class="form-group">
              <label for="newPassword">Yeni Şifre</label>
              <input
                id="newPassword"
                v-model="passwordForm.newPassword"
                type="password"
                class="form-input"
                required
                minlength="6"
                :disabled="loading"
              >
            </div>
            
            <div class="form-group">
              <label for="confirmPassword">Yeni Şifre Tekrar</label>
              <input
                id="confirmPassword"
                v-model="passwordForm.confirmPassword"
                type="password"
                class="form-input"
                required
                :disabled="loading"
              >
            </div>
            
            <div class="form-actions">
              <button type="submit" class="btn btn-primary" :disabled="loading || !passwordValid">
                {{ loading ? 'Değiştiriliyor...' : 'Şifreyi Değiştir' }}
              </button>
            </div>
          </form>
        </section>
        
        <!-- Okuma Tercihleri -->
        <section v-if="activeTab === 'preferences'" class="content-section">
          <h2>Okuma Tercihleri</h2>
          
          <div class="preferences-form">
            <div class="preference-group">
              <h3>Yazı Ayarları</h3>
              
              <div class="preference-item">
                <label for="fontSize">Yazı Boyutu</label>
                <div class="preference-control">
                  <input
                    id="fontSize"
                    v-model.number="preferences.fontSize"
                    type="range"
                    min="12"
                    max="24"
                    step="1"
                    class="range-input"
                    @input="updatePreferences"
                  >
                  <span class="range-value">{{ preferences.fontSize }}px</span>
                </div>
              </div>
              
              <div class="preference-item">
                <label for="fontFamily">Yazı Tipi</label>
                <select
                  id="fontFamily"
                  v-model="preferences.fontFamily"
                  class="form-select"
                  @change="updatePreferences"
                >
                  <option value="Noto Serif">Noto Serif</option>
                  <option value="Roboto">Roboto</option>
                  <option value="Amiri">Amiri (Arapça)</option>
                  <option value="Arial">Arial</option>
                  <option value="Georgia">Georgia</option>
                </select>
              </div>
              
              <div class="preference-item">
                <label for="lineHeight">Satır Yüksekliği</label>
                <div class="preference-control">
                  <input
                    id="lineHeight"
                    v-model.number="preferences.lineHeight"
                    type="range"
                    min="1"
                    max="2"
                    step="0.1"
                    class="range-input"
                    @input="updatePreferences"
                  >
                  <span class="range-value">{{ preferences.lineHeight }}</span>
                </div>
              </div>
            </div>
            
            <div class="preference-group">
              <h3>Görünüm Ayarları</h3>
              
              <div class="preference-item">
                <label for="theme">Tema</label>
                <div class="theme-options">
                  <button
                    v-for="theme in themes"
                    :key="theme.value"
                    @click="setTheme(theme.value)"
                    :class="['theme-option', { active: preferences.theme === theme.value }]"
                  >
                    <span class="theme-icon">{{ theme.icon }}</span>
                    <span class="theme-name">{{ theme.name }}</span>
                  </button>
                </div>
              </div>
              
              <div class="preference-item">
                <label class="toggle-label">
                  <input
                    v-model="preferences.pageAnimations"
                    type="checkbox"
                    class="toggle-input"
                    @change="updatePreferences"
                  >
                  <span class="toggle-switch"></span>
                  <span class="toggle-text">Sayfa animasyonları</span>
                </label>
              </div>
              
              <div class="preference-item">
                <label class="toggle-label">
                  <input
                    v-model="preferences.pageSound"
                    type="checkbox"
                    class="toggle-input"
                    @change="updatePreferences"
                  >
                  <span class="toggle-switch"></span>
                  <span class="toggle-text">Sayfa çevirme sesi</span>
                </label>
              </div>
            </div>
            
            <div class="preview-section">
              <h3>Önizleme</h3>
              <div 
                class="preview-box"
                :style="{
                  fontSize: preferences.fontSize + 'px',
                  fontFamily: preferences.fontFamily,
                  lineHeight: preferences.lineHeight
                }"
              >
                <p>
                  "İman öyle bir nurdur ki, kalbe girdiği vakit, kâinatı bir cennet bahçesi şekline çevirir. 
                  Cehennem öyle bir ateştir ki, küfür ve dalalet kalbe girdiği vakit, kâinatı gamlı ve 
                  karanlıklı bir zindan hükmüne getirir."
                </p>
                <p class="preview-source">— Risale-i Nur, Sözler</p>
              </div>
            </div>
          </div>
        </section>
        
        <!-- İstatistikler -->
        <section v-if="activeTab === 'stats'" class="content-section">
          <h2>Okuma İstatistikleri</h2>
          
          <div class="stats-grid">
            <div class="stat-card">
              <div class="stat-icon">📚</div>
              <div class="stat-content">
                <h3>{{ stats.booksRead }}</h3>
                <p>Okunan Kitap</p>
              </div>
            </div>
            
            <div class="stat-card">
              <div class="stat-icon">📖</div>
              <div class="stat-content">
                <h3>{{ stats.pagesRead }}</h3>
                <p>Okunan Sayfa</p>
              </div>
            </div>
            
            <div class="stat-card">
              <div class="stat-icon">🔖</div>
              <div class="stat-content">
                <h3>{{ stats.bookmarks }}</h3>
                <p>Yer İmi</p>
              </div>
            </div>
            
            <div class="stat-card">
              <div class="stat-icon">📝</div>
              <div class="stat-content">
                <h3>{{ stats.notes }}</h3>
                <p>Not</p>
              </div>
            </div>
          </div>
          
          <div class="reading-history">
            <h3>Son Okunanlar</h3>
            <div v-if="readingHistory.length > 0" class="history-list">
              <div 
                v-for="item in readingHistory" 
                :key="item.bookId"
                class="history-item"
              >
                <div class="book-info">
                  <h4>{{ item.bookTitle }}</h4>
                  <p>Sayfa {{ item.lastPage }} - {{ formatDate(item.lastReadAt) }}</p>
                </div>
                <router-link 
                  :to="`/read/${item.bookId}/page/${item.lastPage}`"
                  class="btn btn-sm btn-outline"
                >
                  Devam Et
                </router-link>
              </div>
            </div>
            <div v-else class="empty-state">
              <p>Henüz okuma geçmişiniz bulunmuyor.</p>
            </div>
          </div>
        </section>
      </main>
    </div>
  </div>
</template>

<script>
import { ref, computed, reactive, onMounted } from 'vue';
import { useStore } from 'vuex';

export default {
  name: 'ProfileView',
  setup() {
    const store = useStore();
    
    // Aktif tab
    const activeTab = ref('profile');
    
    // Tab listesi
    const tabs = [
      { id: 'profile', label: 'Profil Bilgileri', icon: '👤' },
      { id: 'security', label: 'Güvenlik', icon: '🔒' },
      { id: 'preferences', label: 'Tercihler', icon: '⚙️' },
      { id: 'stats', label: 'İstatistikler', icon: '📊' }
    ];
    
    // Kullanıcı bilgileri
    const user = computed(() => store.getters['auth/user']);
    const loading = computed(() => store.getters['auth/loading']);
    
    // Profil formu
    const profileForm = reactive({
      name: '',
      email: ''
    });
    
    const profileSuccess = ref('');
    const profileError = ref('');
    
    // Şifre formu
    const passwordForm = reactive({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
    
    const securitySuccess = ref('');
    const securityError = ref('');
    
    // Tercihler
    const preferences = reactive({
      fontSize: 16,
      fontFamily: 'Noto Serif',
      lineHeight: 1.6,
      theme: 'light',
      pageAnimations: true,
      pageSound: true
    });
    
    // Tema seçenekleri
    const themes = [
      { value: 'light', name: 'Aydınlık', icon: '☀️' },
      { value: 'sepia', name: 'Sepya', icon: '📜' },
      { value: 'dark', name: 'Karanlık', icon: '🌙' }
    ];
    
    // İstatistikler
    const stats = reactive({
      booksRead: 0,
      pagesRead: 0,
      bookmarks: 0,
      notes: 0
    });
    
    // Okuma geçmişi
    const readingHistory = ref([]);
    
    // Profil değişiklik kontrolü
    const profileChanged = computed(() => {
      return profileForm.name !== user.value?.name ||
             profileForm.email !== user.value?.email;
    });
    
    // Şifre geçerlilik kontrolü
    const passwordValid = computed(() => {
      return passwordForm.newPassword.length >= 6 &&
             passwordForm.newPassword === passwordForm.confirmPassword;
    });
    
    // Profil güncelleme
    const updateProfile = async () => {
      profileError.value = '';
      profileSuccess.value = '';
      
      const result = await store.dispatch('auth/updateProfile', {
        name: profileForm.name,
        email: profileForm.email
      });
      
      if (result.success) {
        profileSuccess.value = 'Profil bilgileriniz başarıyla güncellendi.';
      } else {
        profileError.value = result.error;
      }
    };
    
    // Şifre güncelleme
    const updatePassword = async () => {
      securityError.value = '';
      securitySuccess.value = '';
      
      if (passwordForm.newPassword !== passwordForm.confirmPassword) {
        securityError.value = 'Yeni şifreler eşleşmiyor.';
        return;
      }
      
      const result = await store.dispatch('auth/updatePassword', {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword
      });
      
      if (result.success) {
        securitySuccess.value = 'Şifreniz başarıyla değiştirildi.';
        // Formu temizle
        passwordForm.currentPassword = '';
        passwordForm.newPassword = '';
        passwordForm.confirmPassword = '';
      } else {
        securityError.value = result.error;
      }
    };
    
    // Tercihleri güncelle
    const updatePreferences = async () => {
      await store.dispatch('auth/updatePreferences', preferences);
    };
    
    // Tema değiştir
    const setTheme = (theme) => {
      preferences.theme = theme;
      updatePreferences();
    };
    
    // Tarih formatlama
    const formatDate = (date) => {
      if (!date) return 'Bilinmiyor';
      return new Date(date).toLocaleDateString('tr-TR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    };
    
    // İstatistikleri yükle
    const loadStats = () => {
      // Store'dan istatistikleri al
      const bookmarks = store.state.bookmarks || [];
      const notes = store.state.notes || [];
      const history = user.value?.readingHistory || [];
      
      stats.bookmarks = bookmarks.length;
      stats.notes = notes.length;
      stats.booksRead = history.length;
      stats.pagesRead = history.reduce((total, item) => total + (item.lastPage || 0), 0);
      
      // Okuma geçmişini hazırla
      readingHistory.value = history.slice(0, 5).map(item => ({
        ...item,
        bookTitle: store.getters.getBookById(item.bookId)?.title || 'Bilinmeyen Kitap'
      }));
    };
    
    // Component mount olduğunda
    onMounted(() => {
      if (user.value) {
        // Form değerlerini ayarla
        profileForm.name = user.value.name;
        profileForm.email = user.value.email;
        
        // Tercihleri ayarla
        if (user.value.preferences) {
          Object.assign(preferences, user.value.preferences);
        }
        
        // İstatistikleri yükle
        loadStats();
      }
    });
    
    return {
      activeTab,
      tabs,
      user,
      loading,
      profileForm,
      profileSuccess,
      profileError,
      profileChanged,
      passwordForm,
      securitySuccess,
      securityError,
      passwordValid,
      preferences,
      themes,
      stats,
      readingHistory,
      updateProfile,
      updatePassword,
      updatePreferences,
      setTheme,
      formatDate
    };
  }
};
</script>

<style lang="scss" scoped>
.profile-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
  
  @media (max-width: 768px) {
    padding: 1rem;
  }
}

.page-header {
  margin-bottom: 3rem;
  
  h1 {
    font-size: 2.5rem;
    color: var(--primary-color);
    margin-bottom: 0.5rem;
  }
  
  .page-subtitle {
    color: var(--text-secondary);
    font-size: 1.125rem;
  }
}

.profile-container {
  display: grid;
  grid-template-columns: 250px 1fr;
  gap: 2rem;
  
  @media (max-width: 968px) {
    grid-template-columns: 1fr;
  }
}

// Sol menü
.profile-sidebar {
  @media (max-width: 968px) {
    margin-bottom: 2rem;
  }
  
  .sidebar-nav {
    background: var(--bg-card);
    border-radius: 12px;
    padding: 1rem;
    box-shadow: var(--shadow-sm);
    
    @media (max-width: 968px) {
      display: flex;
      gap: 0.5rem;
      overflow-x: auto;
      padding: 0.5rem;
    }
  }
  
  .nav-item {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    width: 100%;
    padding: 0.75rem 1rem;
    border: none;
    background: transparent;
    color: var(--text-secondary);
    text-align: left;
    cursor: pointer;
    border-radius: 8px;
    transition: all 0.3s;
    font-size: 1rem;
    
    @media (max-width: 968px) {
      flex-direction: column;
      gap: 0.25rem;
      padding: 0.75rem;
      white-space: nowrap;
    }
    
    &:hover {
      background: var(--bg-secondary);
      color: var(--primary-color);
    }
    
    &.active {
      background: var(--primary-color);
      color: white;
      
      .nav-icon {
        transform: scale(1.1);
      }
    }
    
    .nav-icon {
      font-size: 1.25rem;
      transition: transform 0.3s;
    }
    
    .nav-text {
      @media (max-width: 968px) {
        font-size: 0.75rem;
      }
    }
  }
}

// Ana içerik
.profile-content {
  .content-section {
    background: var(--bg-card);
    border-radius: 12px;
    padding: 2rem;
    box-shadow: var(--shadow-sm);
    
    @media (max-width: 768px) {
      padding: 1.5rem;
    }
    
    h2 {
      font-size: 1.75rem;
      color: var(--primary-color);
      margin-bottom: 1.5rem;
    }
    
    h3 {
      font-size: 1.25rem;
      color: var(--text-primary);
      margin-bottom: 1rem;
    }
  }
}

// Form stilleri
.profile-form,
.security-form {
  .form-row {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 1.5rem;
  }
  
  .form-group {
    margin-bottom: 1.5rem;
    
    label {
      display: block;
      font-weight: 500;
      color: var(--text-primary);
      margin-bottom: 0.5rem;
    }
    
    .form-input,
    .form-select {
      width: 100%;
      padding: 0.75rem 1rem;
      border: 2px solid var(--bg-secondary);
      border-radius: 8px;
      font-size: 1rem;
      background: var(--bg-primary);
      color: var(--text-primary);
      transition: all 0.3s;
      
      &:focus {
        outline: none;
        border-color: var(--primary-color);
        background: var(--bg-card);
      }
      
      &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
      }
    }
    
    .form-hint {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin-top: 0.5rem;
      font-size: 0.875rem;
      color: #f39c12;
      
      .warning-icon {
        font-size: 1rem;
      }
    }
  }
  
  .form-actions {
    margin-top: 2rem;
    
    .btn {
      min-width: 200px;
    }
  }
}

// Alert mesajları
.alert {
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  
  &.alert-success {
    background: #d4edda;
    color: #155724;
    border: 1px solid #c3e6cb;
  }
  
  &.alert-error {
    background: #f8d7da;
    color: #721c24;
    border: 1px solid #f5c6cb;
  }
  
  .alert-icon {
    font-size: 1.25rem;
  }
}

// Bölüm ayırıcı
.section-divider {
  height: 1px;
  background: var(--bg-secondary);
  margin: 2rem 0;
}

// Hesap bilgileri
.account-info {
  .info-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1rem;
  }
  
  .info-item {
    padding: 1rem;
    background: var(--bg-secondary);
    border-radius: 8px;
    
    .info-label {
      display: block;
      font-size: 0.875rem;
      color: var(--text-secondary);
      margin-bottom: 0.25rem;
    }
    
    .info-value {
      font-weight: 500;
      color: var(--text-primary);
      
      &.status {
        &.active {
          color: var(--green-color);
        }
      }
    }
  }
}

// Tercih ayarları
.preferences-form {
  .preference-group {
    margin-bottom: 2rem;
    
    &:last-child {
      margin-bottom: 0;
    }
  }
  
  .preference-item {
    margin-bottom: 1.5rem;
    
    label {
      display: block;
      font-weight: 500;
      color: var(--text-primary);
      margin-bottom: 0.5rem;
    }
    
    .preference-control {
      display: flex;
      align-items: center;
      gap: 1rem;
      
      .range-input {
        flex: 1;
        height: 6px;
        -webkit-appearance: none;
        appearance: none;
        background: var(--bg-secondary);
        border-radius: 3px;
        outline: none;
        
        &::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 20px;
          height: 20px;
          background: var(--primary-color);
          border-radius: 50%;
          cursor: pointer;
          transition: all 0.3s;
          
          &:hover {
            transform: scale(1.2);
            box-shadow: 0 0 0 8px rgba(26, 35, 126, 0.1);
          }
        }
      }
      
      .range-value {
        min-width: 60px;
        text-align: right;
        color: var(--text-secondary);
      }
    }
  }
  
  .theme-options {
    display: flex;
    gap: 1rem;
    
    .theme-option {
      flex: 1;
      padding: 1rem;
      border: 2px solid var(--bg-secondary);
      border-radius: 8px;
      background: transparent;
      cursor: pointer;
      transition: all 0.3s;
      text-align: center;
      
      &:hover {
        border-color: var(--primary-light);
      }
      
      &.active {
        border-color: var(--primary-color);
        background: var(--primary-color);
        color: white;
      }
      
      .theme-icon {
        display: block;
        font-size: 2rem;
        margin-bottom: 0.5rem;
      }
      
      .theme-name {
        font-size: 0.875rem;
      }
    }
  }
  
  .toggle-label {
    display: flex;
    align-items: center;
    gap: 1rem;
    cursor: pointer;
    
    .toggle-input {
      display: none;
      
      &:checked + .toggle-switch {
        background: var(--primary-color);
        
        &::after {
          transform: translateX(24px);
        }
      }
    }
    
    .toggle-switch {
      position: relative;
      width: 50px;
      height: 26px;
      background: var(--bg-secondary);
      border-radius: 13px;
      transition: all 0.3s;
      
      &::after {
        content: '';
        position: absolute;
        top: 3px;
        left: 3px;
        width: 20px;
        height: 20px;
        background: white;
        border-radius: 50%;
        transition: all 0.3s;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
      }
    }
    
    .toggle-text {
      color: var(--text-primary);
    }
  }
}

// Önizleme
.preview-section {
  margin-top: 2rem;
  
  .preview-box {
    padding: 1.5rem;
    background: var(--bg-secondary);
    border-radius: 8px;
    
    p {
      margin-bottom: 1rem;
      
      &:last-child {
        margin-bottom: 0;
      }
    }
    
    .preview-source {
      font-style: italic;
      color: var(--text-secondary);
      text-align: right;
    }
  }
}

// İstatistikler
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
  margin-bottom: 3rem;
  
  .stat-card {
    background: var(--bg-secondary);
    border-radius: 12px;
    padding: 1.5rem;
    display: flex;
    align-items: center;
    gap: 1.5rem;
    transition: all 0.3s;
    
    &:hover {
      transform: translateY(-2px);
      box-shadow: var(--shadow-md);
    }
    
    .stat-icon {
      font-size: 3rem;
      opacity: 0.8;
    }
    
    .stat-content {
      h3 {
        font-size: 2rem;
        color: var(--primary-color);
        margin-bottom: 0.25rem;
      }
      
      p {
        color: var(--text-secondary);
        font-size: 0.875rem;
      }
    }
  }
}

// Okuma geçmişi
.reading-history {
  .history-list {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }
  
  .history-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem;
    background: var(--bg-secondary);
    border-radius: 8px;
    
    .book-info {
      h4 {
        font-size: 1.125rem;
        color: var(--text-primary);
        margin-bottom: 0.25rem;
      }
      
      p {
        font-size: 0.875rem;
        color: var(--text-secondary);
      }
    }
    
    .btn-sm {
      padding: 0.5rem 1rem;
      font-size: 0.875rem;
    }
  }
  
  .empty-state {
    text-align: center;
    padding: 3rem;
    color: var(--text-secondary);
  }
}

// Responsive düzenlemeler
@media (max-width: 768px) {
  .profile-content {
    .content-section {
      h2 {
        font-size: 1.5rem;
      }
      
      h3 {
        font-size: 1.125rem;
      }
    }
  }
  
  .theme-options {
    flex-direction: column;
  }
  
  .stats-grid {
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
    
    .stat-card {
      padding: 1rem;
      
      .stat-icon {
        font-size: 2rem;
      }
      
      .stat-content {
        h3 {
          font-size: 1.5rem;
        }
      }
    }
  }
}
</style>