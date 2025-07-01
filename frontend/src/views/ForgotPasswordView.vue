<template>
  <div class="auth-page">
    <div class="forgot-password-container">
      <div class="form-card">
        <div class="form-header">
          <div class="arabic-title">رسائل النور</div>
          <h2>Şifremi Unuttum</h2>
          <p class="form-subtitle">
            Email adresinizi girin, şifre sıfırlama bağlantısı gönderelim
          </p>
        </div>
        
        <!-- Başarı mesajı -->
        <div v-if="successMessage" class="alert alert-success">
          <span class="alert-icon">✅</span>
          <div>
            <p>{{ successMessage }}</p>
            <p class="alert-note">Birkaç dakika içinde email gelmezse spam klasörünü kontrol edin.</p>
          </div>
        </div>
        
        <!-- Hata mesajı -->
        <div v-if="error" class="alert alert-error">
          <span class="alert-icon">⚠️</span>
          {{ error }}
        </div>
        
        <form v-if="!successMessage" @submit.prevent="handleForgotPassword">
          <div class="form-group">
            <label for="email">Email Adresi</label>
            <input
              id="email"
              v-model="email"
              type="email"
              placeholder="ornek@email.com"
              required
              class="form-input"
              :disabled="loading"
            >
          </div>
          
          <button 
            type="submit" 
            class="btn btn-primary btn-block"
            :disabled="loading || !email"
          >
            <span v-if="!loading">Şifre Sıfırlama Bağlantısı Gönder</span>
            <span v-else class="loading-text">
              <span class="loading-spinner"></span>
              Gönderiliyor...
            </span>
          </button>
        </form>
        
        <div class="form-footer">
          <router-link to="/login" class="back-link">
            <span>←</span> Giriş sayfasına dön
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed } from 'vue';
import { useStore } from 'vuex';

export default {
  name: 'ForgotPasswordView',
  setup() {
    const store = useStore();
    
    const email = ref('');
    const successMessage = ref('');
    
    const loading = computed(() => store.getters['auth/loading']);
    const error = computed(() => store.getters['auth/error']);
    
    const handleForgotPassword = async () => {
      successMessage.value = '';
      
      const result = await store.dispatch('auth/forgotPassword', email.value);
      
      if (result.success) {
        successMessage.value = `Şifre sıfırlama bağlantısı ${email.value} adresine gönderildi.`;
        email.value = '';
      }
    };
    
    return {
      email,
      successMessage,
      loading,
      error,
      handleForgotPassword
    };
  }
};
</script>

<style lang="scss" scoped>
.auth-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-primary);
  padding: 2rem;
  
  @media (max-width: 768px) {
    padding: 1rem;
  }
}

.forgot-password-container {
  width: 100%;
  max-width: 450px;
}

.form-card {
  background: var(--bg-card);
  border-radius: 20px;
  box-shadow: var(--shadow-lg);
  padding: 3rem;
  
  @media (max-width: 768px) {
    padding: 2rem;
  }
}

.form-header {
  text-align: center;
  margin-bottom: 2rem;
  
  .arabic-title {
    font-family: 'Amiri', serif;
    font-size: 2.5rem;
    color: var(--accent-color);
    margin-bottom: 1rem;
  }
  
  h2 {
    font-size: 2rem;
    color: var(--primary-color);
    margin-bottom: 0.5rem;
  }
  
  .form-subtitle {
    color: var(--text-secondary);
    font-size: 1rem;
    line-height: 1.5;
  }
}

.alert {
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 1.5rem;
  display: flex;
  gap: 0.75rem;
  
  &.alert-success {
    background: #d4edda;
    color: #155724;
    border: 1px solid #c3e6cb;
    
    .alert-note {
      font-size: 0.875rem;
      margin-top: 0.5rem;
      opacity: 0.8;
    }
  }
  
  &.alert-error {
    background: #f8d7da;
    color: #721c24;
    border: 1px solid #f5c6cb;
  }
  
  .alert-icon {
    font-size: 1.25rem;
    flex-shrink: 0;
  }
  
  div {
    flex: 1;
    
    p {
      margin: 0;
    }
  }
}

.form-group {
  margin-bottom: 1.5rem;
  
  label {
    display: block;
    font-weight: 500;
    color: var(--text-primary);
    margin-bottom: 0.5rem;
  }
  
  .form-input {
    width: 100%;
    padding: 0.75rem 1rem;
    border: 2px solid var(--bg-secondary);
    border-radius: 8px;
    font-size: 1rem;
    background: var(--bg-primary);
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
}

.btn-block {
  width: 100%;
  margin-bottom: 1rem;
}

.loading-text {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.loading-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

.form-footer {
  text-align: center;
  margin-top: 2rem;
  
  .back-link {
    color: var(--primary-color);
    text-decoration: none;
    font-size: 0.9rem;
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    transition: all 0.3s;
    
    &:hover {
      gap: 0.75rem;
    }
  }
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>