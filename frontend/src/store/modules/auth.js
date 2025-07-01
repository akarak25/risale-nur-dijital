import axios from '@/utils/axios';
import { 
  getToken, 
  setToken, 
  removeToken, 
  getUser, 
  setUser, 
  removeUser,
  clearAuthData 
} from '@/utils/auth';
import router from '@/router';

const state = {
  token: getToken(),
  user: getUser(),
  loading: false,
  error: null
};

const getters = {
  isAuthenticated: state => !!state.token,
  user: state => state.user,
  token: state => state.token,
  loading: state => state.loading,
  error: state => state.error,
  isEmailVerified: state => state.user?.isEmailVerified || false,
  userRole: state => state.user?.role || 'user'
};

const mutations = {
  SET_TOKEN(state, token) {
    state.token = token;
    if (token) {
      setToken(token);
    } else {
      removeToken();
    }
  },
  
  SET_USER(state, user) {
    state.user = user;
    if (user) {
      setUser(user);
    } else {
      removeUser();
    }
  },
  
  SET_LOADING(state, loading) {
    state.loading = loading;
  },
  
  SET_ERROR(state, error) {
    state.error = error;
  },
  
  UPDATE_USER_PREFERENCES(state, preferences) {
    if (state.user) {
      state.user.preferences = { ...state.user.preferences, ...preferences };
      setUser(state.user);
    }
  },
  
  CLEAR_AUTH(state) {
    state.token = null;
    state.user = null;
    state.error = null;
    clearAuthData();
  }
};

const actions = {
  // Kullanıcı kaydı
  async register({ commit }, userData) {
    commit('SET_LOADING', true);
    commit('SET_ERROR', null);
    
    try {
      const response = await axios.post('/auth/register', userData);
      const { token, user } = response.data;
      
      commit('SET_TOKEN', token);
      commit('SET_USER', user);
      
      // Ana store'daki kullanıcı ayarlarını güncelle
      this.commit('UPDATE_USER_SETTINGS', user.preferences);
      
      return { success: true };
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Kayıt işlemi başarısız oldu';
      commit('SET_ERROR', errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      commit('SET_LOADING', false);
    }
  },
  
  // Kullanıcı girişi
  async login({ commit, dispatch }, credentials) {
    commit('SET_LOADING', true);
    commit('SET_ERROR', null);
    
    try {
      const response = await axios.post('/auth/login', credentials);
      const { token, user } = response.data;
      
      commit('SET_TOKEN', token);
      commit('SET_USER', user);
      
      // Ana store'daki kullanıcı ayarlarını güncelle
      this.commit('UPDATE_USER_SETTINGS', user.preferences);
      
      // Kullanıcının yer imlerini ve notlarını yükle
      await dispatch('fetchUserBookmarks', user._id, { root: true });
      await dispatch('fetchUserNotes', user._id, { root: true });
      
      return { success: true };
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Giriş işlemi başarısız oldu';
      commit('SET_ERROR', errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      commit('SET_LOADING', false);
    }
  },
  
  // Kullanıcı çıkışı
  async logout({ commit, state }) {
    // Eğer token yoksa direkt temizle
    if (!state.token) {
      commit('CLEAR_AUTH');
      this.commit('SET_BOOKMARKS', []);
      this.commit('SET_NOTES', []);
      router.push('/');
      return;
    }
    
    try {
      await axios.post('/auth/logout');
    } catch (error) {
      // Logout hatası olsa bile kullanıcıyı çıkar
      console.error('Logout error:', error);
    } finally {
      commit('CLEAR_AUTH');
      this.commit('SET_BOOKMARKS', []);
      this.commit('SET_NOTES', []);
      router.push('/');
    }
  },
  
  // Mevcut kullanıcı bilgilerini getir
  async fetchCurrentUser({ commit }) {
    commit('SET_LOADING', true);
    
    try {
      const response = await axios.get('/auth/me');
      const user = response.data.data;
      
      commit('SET_USER', user);
      this.commit('UPDATE_USER_SETTINGS', user.preferences);
      
      return { success: true, user };
    } catch (error) {
      commit('SET_ERROR', 'Kullanıcı bilgileri alınamadı');
      return { success: false, error: error.message };
    } finally {
      commit('SET_LOADING', false);
    }
  },
  
  // Profil güncelleme
  async updateProfile({ commit }, profileData) {
    commit('SET_LOADING', true);
    commit('SET_ERROR', null);
    
    try {
      const response = await axios.put('/auth/updateprofile', profileData);
      const user = response.data.data;
      
      commit('SET_USER', user);
      
      return { success: true, user };
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Profil güncellenemedi';
      commit('SET_ERROR', errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      commit('SET_LOADING', false);
    }
  },
  
  // Şifre değiştirme
  async updatePassword({ commit }, passwordData) {
    commit('SET_LOADING', true);
    commit('SET_ERROR', null);
    
    try {
      const response = await axios.put('/auth/updatepassword', passwordData);
      const { token } = response.data;
      
      commit('SET_TOKEN', token);
      
      return { success: true };
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Şifre değiştirilemedi';
      commit('SET_ERROR', errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      commit('SET_LOADING', false);
    }
  },
  
  // Tercih güncelleme
  async updatePreferences({ commit }, preferences) {
    commit('SET_LOADING', true);
    
    try {
      const response = await axios.put('/auth/updatepreferences', preferences);
      const updatedPreferences = response.data.data;
      
      commit('UPDATE_USER_PREFERENCES', updatedPreferences);
      this.commit('UPDATE_USER_SETTINGS', updatedPreferences);
      
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    } finally {
      commit('SET_LOADING', false);
    }
  },
  
  // Şifremi unuttum
  async forgotPassword({ commit }, email) {
    commit('SET_LOADING', true);
    commit('SET_ERROR', null);
    
    try {
      await axios.post('/auth/forgotpassword', { email });
      
      return { success: true };
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'İşlem başarısız oldu';
      commit('SET_ERROR', errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      commit('SET_LOADING', false);
    }
  },
  
  // Şifre sıfırlama
  async resetPassword({ commit }, { token, password }) {
    commit('SET_LOADING', true);
    commit('SET_ERROR', null);
    
    try {
      const response = await axios.put(`/auth/resetpassword/${token}`, { password });
      const { token: newToken, user } = response.data;
      
      commit('SET_TOKEN', newToken);
      commit('SET_USER', user);
      
      return { success: true };
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Şifre sıfırlanamadı';
      commit('SET_ERROR', errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      commit('SET_LOADING', false);
    }
  },
  
  // Email doğrulama
  async verifyEmail({ commit }, token) {
    commit('SET_LOADING', true);
    
    try {
      await axios.get(`/auth/verifyemail/${token}`);
      
      // Kullanıcı bilgilerini güncelle
      const response = await axios.get('/auth/me');
      const user = response.data.data;
      commit('SET_USER', user);
      
      return { success: true };
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Email doğrulanamadı';
      return { success: false, error: errorMessage };
    } finally {
      commit('SET_LOADING', false);
    }
  }
};

export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions
};