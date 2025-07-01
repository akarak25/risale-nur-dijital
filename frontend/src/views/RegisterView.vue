<template>
  <div class="auth-page">
    <div class="auth-container">
      <!-- Sol taraf - Görsel ve bilgi -->
      <div class="auth-info">
        <div class="info-content">
          <div class="arabic-title">رسائل النور</div>
          <h1>Risale-i Nur Dijital Kütüphane</h1>
          <p class="info-text">
            Ücretsiz hesap oluşturarak Risale-i Nur külliyatına erişin ve 
            kişiselleştirilmiş okuma deneyiminin keyfini çıkarın.
          </p>
          <div class="features">
            <div class="feature">
              <span class="feature-icon">✨</span>
              <span>Ücretsiz ve sınırsız erişim</span>
            </div>
            <div class="feature">
              <span class="feature-icon">☁️</span>
              <span>Bulut tabanlı senkronizasyon</span>
            </div>
            <div class="feature">
              <span class="feature-icon">🎨</span>
              <span>Kişiselleştirilebilir okuma deneyimi</span>
            </div>
            <div class="feature">
              <span class="feature-icon">📱</span>
              <span>Tüm cihazlardan erişim</span>
            </div>
          </div>
        </div>
        <div class="islamic-pattern"></div>
      </div>
      
      <!-- Sağ taraf - Kayıt formu -->
      <div class="auth-form">
        <div class="form-container">
          <h2>Hesap Oluştur</h2>
          <p class="form-subtitle">Risale-i Nur ailesine katılın</p>
          
          <!-- Hata mesajı -->
          <div v-if="error" class="alert alert-error">
            <span class="alert-icon">⚠️</span>
            {{ error }}
          </div>
          
          <!-- Başarı mesajı -->
          <div v-if="successMessage" class="alert alert-success">
            <span class="alert-icon">✅</span>
            {{ successMessage }}
          </div>
          
          <form @submit.prevent="handleRegister">
            <div class="form-group">
              <label for="name">Ad Soyad</label>
              <input
                id="name"
                v-model="formData.name"
                type="text"
                placeholder="Adınız Soyadınız"
                required
                minlength="2"
                maxlength="50"
                class="form-input"
                :disabled="loading"
              >
            </div>
            
            <div class="form-group">
              <label for="email">Email Adresi</label>
              <input
                id="email"
                v-model="formData.email"
                type="email"
                placeholder="ornek@email.com"
                required
                class="form-input"
                :disabled="loading"
              >
            </div>
            
            <div class="form-group">
              <label for="password">Şifre</label>
              <div class="password-input">
                <input
                  id="password"
                  v-model="formData.password"
                  :type="showPassword ? 'text' : 'password'"
                  placeholder="En az 6 karakter"
                  required
                  minlength="6"
                  class="form-input"
                  :disabled="loading"
                  @input="checkPasswordStrength"
                >
                <button
                  type="button"
                  @click="showPassword = !showPassword"
                  class="password-toggle"
                  :disabled="loading"
                >
                  {{ showPassword ? '👁️' : '👁️‍🗨️' }}
                </button>
              </div>
              <div class="password-strength" v-if="formData.password">
                <div class="strength-bar">
                  <div 
                    class="strength-fill" 
                    :class="passwordStrength.class"
                    :style="{ width: passwordStrength.percentage + '%' }"
                  ></div>
                </div>
                <span class="strength-text" :class="passwordStrength.class">
                  {{ passwordStrength.text }}
                </span>
              </div>
            </div>
            
            <div class="form-group">
              <label for="confirmPassword">Şifre Tekrar</label>
              <div class="password-input">
                <input
                  id="confirmPassword"
                  v-model="formData.confirmPassword"
                  :type="showConfirmPassword ? 'text' : 'password'"
                  placeholder="Şifrenizi tekrar girin"
                  required
                  class="form-input"
                  :disabled="loading"
                  @blur="checkPasswordMatch"
                >
                <button
                  type="button"
                  @click="showConfirmPassword = !showConfirmPassword"
                  class="password-toggle"
                  :disabled="loading"
                >
                  {{ showConfirmPassword ? '👁️' : '👁️‍🗨️' }}
                </button>
              </div>
              <div v-if="passwordMatchError" class="field-error">
                {{ passwordMatchError }}
              </div>
            </div>
            
            <div class="form-group">
              <label class="checkbox-label">
                <input
                  v-model="acceptTerms"
                  type="checkbox"
                  class="checkbox-input"
                  required
                  :disabled="loading"
                >
                <span>
                  <a href="#" @click.prevent="showTerms">Kullanım Şartları</a> ve 
                  <a href="#" @click.prevent="showPrivacy">Gizlilik Politikası</a>'nı 
                  okudum ve kabul ediyorum
                </span>
              </label>
            </div>
            
            <button 
              type="submit" 
              class="btn btn-primary btn-block"
              :disabled="loading || !isFormValid"
            >
              <span v-if="!loading">Hesap Oluştur</span>
              <span v-else class="loading-text">
                <span class="loading-spinner"></span>
                Hesap oluşturuluyor...
              </span>
            </button>
          </form>
          
          <div class="divider">
            <span>veya</span>
          </div>
          
          <router-link to="/login" class="btn btn-outline btn-block">
            Zaten Hesabım Var
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue';
import { useStore } from 'vuex';
import { useRouter } from 'vue-router';

export default {
  name: 'RegisterView',
  setup() {
    const store = useStore();
    const router = useRouter();
    
    // Form verileri
    const formData = ref({
      name: '',
      email: '',
      password: '',
      confirmPassword: ''
    });
    
    const showPassword = ref(false);
    const showConfirmPassword = ref(false);
    const acceptTerms = ref(false);
    const passwordMatchError = ref('');
    const successMessage = ref('');
    
    // Şifre güçlüğü
    const passwordStrength = ref({
      percentage: 0,
      text: '',
      class: ''
    });
    
    // Store'dan değerler
    const loading = computed(() => store.getters['auth/loading']);
    const error = computed(() => store.getters['auth/error']);
    
    // Form geçerliliği
    const isFormValid = computed(() => {
      return formData.value.name.length >= 2 &&
             formData.value.email.includes('@') &&
             formData.value.password.length >= 6 &&
             formData.value.password === formData.value.confirmPassword &&
             acceptTerms.value;
    });
    
    // Şifre güçlüğünü kontrol et
    const checkPasswordStrength = () => {
      const password = formData.value.password;
      let strength = 0;
      
      if (password.length >= 6) strength += 25;
      if (password.length >= 8) strength += 25;
      if (/[0-9]/.test(password)) strength += 25;
      if (/[A-Z]/.test(password) && /[a-z]/.test(password)) strength += 25;
      
      passwordStrength.value = {
        percentage: strength,
        text: strength <= 25 ? 'Zayıf' : 
              strength <= 50 ? 'Orta' : 
              strength <= 75 ? 'İyi' : 'Güçlü',
        class: strength <= 25 ? 'weak' : 
               strength <= 50 ? 'medium' : 
               strength <= 75 ? 'good' : 'strong'
      };
    };
    
    // Şifre eşleşmesini kontrol et
    const checkPasswordMatch = () => {
      if (formData.value.confirmPassword && 
          formData.value.password !== formData.value.confirmPassword) {
        passwordMatchError.value = 'Şifreler eşleşmiyor';
      } else {
        passwordMatchError.value = '';
      }
    };
    
    // Kayıt işlemi
    const handleRegister = async () => {
      if (!isFormValid.value) return;
      
      const result = await store.dispatch('auth/register', {
        name: formData.value.name,
        email: formData.value.email,
        password: formData.value.password
      });
      
      if (result.success) {
        // Başarılı kayıt
        successMessage.value = 'Hesabınız başarıyla oluşturuldu! Email adresinizi doğrulamak için gönderilen maili kontrol edin.';
        
        // 3 saniye sonra ana sayfaya yönlendir
        setTimeout(() => {
          router.push('/');
          
          // Hoş geldin mesajı
          store.commit('SET_NOTIFICATION', {
            type: 'success',
            icon: '🎉',
            message: 'Risale-i Nur ailesine hoş geldiniz!'
          });
        }, 3000);
      }
    };
    
    // Kullanım şartları modal
    const showTerms = () => {
      alert('Kullanım şartları sayfası henüz hazır değil.');
    };
    
    // Gizlilik politikası modal
    const showPrivacy = () => {
      alert('Gizlilik politikası sayfası henüz hazır değil.');
    };
    
    // Component mount olduğunda
    onMounted(() => {
      // Eğer zaten giriş yapmışsa ana sayfaya yönlendir
      if (store.getters['auth/isAuthenticated']) {
        router.push('/');
      }
    });
    
    return {
      formData,
      showPassword,
      showConfirmPassword,
      acceptTerms,
      passwordMatchError,
      passwordStrength,
      successMessage,
      loading,
      error,
      isFormValid,
      handleRegister,
      checkPasswordStrength,
      checkPasswordMatch,
      showTerms,
      showPrivacy
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

.auth-container {
  width: 100%;
  max-width: 1200px;
  background: var(--bg-card);
  border-radius: 20px;
  box-shadow: var(--shadow-lg);
  display: grid;
  grid-template-columns: 1fr 1fr;
  overflow: hidden;
  
  @media (max-width: 968px) {
    grid-template-columns: 1fr;
    max-width: 500px;
  }
}

// Sol taraf - Bilgi alanı
.auth-info {
  background: linear-gradient(135deg, var(--primary-color), var(--primary-dark));
  color: white;
  padding: 4rem;
  display: flex;
  flex-direction: column;
  justify-content: center;
  position: relative;
  overflow: hidden;
  
  @media (max-width: 968px) {
    display: none;
  }
  
  .info-content {
    position: relative;
    z-index: 2;
  }
  
  .arabic-title {
    font-family: 'Amiri', serif;
    font-size: 3rem;
    color: var(--accent-color);
    margin-bottom: 1rem;
    text-align: center;
  }
  
  h1 {
    font-size: 2rem;
    margin-bottom: 1.5rem;
    text-align: center;
    color: white;
  }
  
  .info-text {
    font-size: 1.125rem;
    line-height: 1.8;
    margin-bottom: 3rem;
    text-align: center;
    opacity: 0.95;
  }
  
  .features {
    display: grid;
    gap: 1.5rem;
    
    .feature {
      display: flex;
      align-items: center;
      gap: 1rem;
      
      .feature-icon {
        font-size: 1.5rem;
        background: rgba(255, 255, 255, 0.2);
        width: 50px;
        height: 50px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      
      span:last-child {
        font-size: 1.125rem;
      }
    }
  }
  
  .islamic-pattern {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    opacity: 0.1;
    background-image: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.5'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
  }
}

// Sağ taraf - Form alanı
.auth-form {
  padding: 3rem;
  display: flex;
  align-items: center;
  justify-content: center;
  
  @media (max-width: 768px) {
    padding: 2rem;
  }
  
  .form-container {
    width: 100%;
    max-width: 400px;
  }
  
  h2 {
    font-size: 2rem;
    color: var(--primary-color);
    margin-bottom: 0.5rem;
    text-align: center;
  }
  
  .form-subtitle {
    color: var(--text-secondary);
    text-align: center;
    margin-bottom: 2rem;
  }
  
  .alert {
    padding: 1rem;
    border-radius: 8px;
    margin-bottom: 1.5rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    
    &.alert-error {
      background: #fee;
      color: #c33;
      border: 1px solid #fcc;
    }
    
    &.alert-success {
      background: #efe;
      color: #3c3;
      border: 1px solid #cfc;
    }
    
    .alert-icon {
      font-size: 1.25rem;
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
    
    .password-input {
      position: relative;
      
      .password-toggle {
        position: absolute;
        right: 1rem;
        top: 50%;
        transform: translateY(-50%);
        background: none;
        border: none;
        font-size: 1.25rem;
        cursor: pointer;
        padding: 0.25rem;
        
        &:hover {
          opacity: 0.7;
        }
        
        &:disabled {
          cursor: not-allowed;
        }
      }
    }
    
    .password-strength {
      margin-top: 0.5rem;
      
      .strength-bar {
        height: 4px;
        background: var(--bg-secondary);
        border-radius: 2px;
        overflow: hidden;
        margin-bottom: 0.25rem;
        
        .strength-fill {
          height: 100%;
          transition: all 0.3s;
          
          &.weak {
            background: #e74c3c;
          }
          
          &.medium {
            background: #f39c12;
          }
          
          &.good {
            background: #f1c40f;
          }
          
          &.strong {
            background: #27ae60;
          }
        }
      }
      
      .strength-text {
        font-size: 0.875rem;
        
        &.weak {
          color: #e74c3c;
        }
        
        &.medium {
          color: #f39c12;
        }
        
        &.good {
          color: #d68910;
        }
        
        &.strong {
          color: #27ae60;
        }
      }
    }
    
    .field-error {
      color: #e74c3c;
      font-size: 0.875rem;
      margin-top: 0.25rem;
    }
    
    .checkbox-label {
      display: flex;
      align-items: flex-start;
      gap: 0.5rem;
      cursor: pointer;
      
      .checkbox-input {
        width: 18px;
        height: 18px;
        cursor: pointer;
        margin-top: 2px;
        flex-shrink: 0;
      }
      
      span {
        font-size: 0.875rem;
        color: var(--text-secondary);
        
        a {
          color: var(--primary-color);
          text-decoration: none;
          
          &:hover {
            text-decoration: underline;
          }
        }
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
  
  .divider {
    text-align: center;
    margin: 1.5rem 0;
    position: relative;
    
    span {
      background: var(--bg-card);
      padding: 0 1rem;
      color: var(--text-light);
      position: relative;
    }
    
    &::before {
      content: '';
      position: absolute;
      top: 50%;
      left: 0;
      right: 0;
      height: 1px;
      background: var(--bg-secondary);
    }
  }
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>