<template>
  <div class="home-view">
    <!-- Hero Bölümü -->
    <section class="hero-section islamic-pattern">
      <div class="hero-content">
        <div class="bismillah">بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ</div>
        <h1 class="hero-title">Risale-i Nur Dijital Kütüphane</h1>
        <p class="hero-subtitle">
          "Ey insanlar! Rabb'inizden size bir öğüt, kalplerdeki hastalıklara bir şifa, 
          müminler için bir hidayet ve rahmet geldi."
          <span class="verse-ref">- Yunus Suresi, 57</span>
        </p>
        <div class="hero-actions">
          <router-link to="/risale-i-nur-kutuphanesi" class="btn btn-primary">
            <span class="icon">📚</span>
            Kitaplığı Keşfet
          </router-link>
          <button @click="scrollToFeatures" class="btn btn-outline">
            <span class="icon">✨</span>
            Özellikler
          </button>
        </div>
      </div>
      <div class="hero-decoration">
        <div class="tasbih-container">
          <div v-for="i in 5" :key="i" class="tasbih-bead" :style="{animationDelay: i * 0.2 + 's'}"></div>
        </div>
      </div>
    </section>

    <!-- Öne Çıkan Kitaplar -->
    <section class="featured-section">
      <div class="container">
        <h2 class="section-title">Temel Eserler</h2>
        <div class="featured-books">
          <div 
            v-for="book in featuredBooks" 
            :key="book.id"
            class="book-card card"
            @click="openBook(book.id)"
          >
            <div class="book-3d">
              <div class="book-cover">
                <div class="cover-spine"></div>
                <div class="cover-front">
                  <img :src="book.cover" :alt="book.title" />
                  <h3>{{ book.title }}</h3>
                </div>
              </div>
            </div>
            <div class="book-info">
              <p class="book-description">{{ book.description }}</p>
              <div class="book-stats">
                <span class="stat">📖 {{ book.pages }} sayfa</span>
                <span class="stat">⭐ {{ book.category }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Kategoriler -->
    <section class="categories-section">
      <div class="container">
        <h2 class="section-title">Külliyat Kategorileri</h2>
        <div class="category-grid">
          <router-link 
            v-for="cat in categories" 
            :key="cat.id"
            :to="`/risale-i-nur-kutuphanesi/${cat.slug}`"
            class="category-card card"
          >
            <div class="category-icon">
              <img :src="cat.icon" :alt="cat.name" />
            </div>
            <h3>{{ cat.name }}</h3>
            <p>{{ cat.count }} eser</p>
          </router-link>
        </div>
      </div>
    </section>

    <!-- Özellikler -->
    <section id="features" class="features-section">
      <div class="container">
        <h2 class="section-title">Dijital Okuma Özellikleri</h2>
        <div class="features-grid">
          <div v-for="feature in features" :key="feature.id" class="feature-card card">
            <div class="feature-icon">{{ feature.icon }}</div>
            <h3>{{ feature.title }}</h3>
            <p>{{ feature.description }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Dua Bölümü -->
    <section class="prayer-section">
      <div class="container">
        <div class="prayer-card card card-glow">
          <h3>Günün Duası</h3>
          <p class="arabic-text">{{ dailyPrayer.arabic }}</p>
          <p class="prayer-meaning">{{ dailyPrayer.turkish }}</p>
          <p class="prayer-source">{{ dailyPrayer.source }}</p>
        </div>
      </div>
    </section>
  </div>
</template>

<script>
import axios from '@/utils/axios';

export default {
  name: 'HomeView',
  data() {
    return {
      featuredBooks: [],
      allBooks: [],
      categories: [],
      features: [
        {
          id: 1,
          icon: '📖',
          title: 'Gerçekçi Okuma',
          description: 'Sayfa çevirme animasyonları ve kitap hissi'
        },
        {
          id: 2,
          icon: '🔍',
          title: 'Akıllı Arama',
          description: 'Tüm külliyatta kelime ve konu bazlı arama'
        },
        {
          id: 3,
          icon: '🔖',
          title: 'Yer İşaretleri',
          description: 'Kaldığınız yeri işaretleyin ve notlar alın'
        },
        {
          id: 4,
          icon: '🎨',
          title: 'Tema Seçenekleri',
          description: 'Göz yormayan okuma modları'
        },
        {
          id: 5,
          icon: '📱',
          title: 'Mobil Uyumlu',
          description: 'Her cihazda mükemmel okuma deneyimi'
        },
        {
          id: 6,
          icon: '💾',
          title: 'Çevrimdışı Okuma',
          description: 'İndirdiğiniz kitapları internet olmadan okuyun'
        }
      ],
      dailyPrayer: {
        arabic: 'رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الْآخِرَةِ حَسَنَةً وَقِنَا عَذَابَ النَّارِ',
        turkish: 'Rabbimiz! Bize dünyada da iyilik ver, ahirette de iyilik ver ve bizi ateş azabından koru.',
        source: 'Bakara Suresi, 201'
      }
    }
  },
  async created() {
    await this.loadBooks();
    this.setupCategories();
  },
  methods: {
    async loadBooks() {
      try {
        const response = await axios.get('/books');
        this.allBooks = response.data;
        
        // Öne çıkan kitapları seç (ilk 4 ana kitap)
        const mainTitles = ['Sözler', 'Mektubat', "Lem'alar", 'Şualar'];
        this.featuredBooks = this.allBooks
          .filter(book => mainTitles.some(title => book.title.includes(title)))
          .slice(0, 4)
          .map(book => ({
            id: book._id,
            title: book.title,
            description: book.description || this.getDefaultDescription(book.title),
            cover: book.coverImage || this.getDefaultCover(book.title),
            pages: book.totalPages || 0,
            category: book.category
          }));
          
        // Eğer 4'ten az kitap varsa, diğerlerinden ekle
        if (this.featuredBooks.length < 4) {
          const additionalBooks = this.allBooks
            .filter(book => !this.featuredBooks.find(fb => fb.id === book._id))
            .slice(0, 4 - this.featuredBooks.length);
          
          this.featuredBooks.push(...additionalBooks.map(book => ({
            id: book._id,
            title: book.title,
            description: book.description || 'Risale-i Nur Külliyatı\'ndan',
            cover: book.coverImage || this.getDefaultCover(book.title),
            pages: book.totalPages || 0,
            category: book.category
          })));
        }
      } catch (error) {
        console.error('Kitaplar yüklenemedi:', error);
      }
    },
    
    setupCategories() {
      // Kategorileri kitap sayılarıyla birlikte oluştur
      const categoryMap = {
        'Sözler': { icon: require('@/assets/images/sözler.png'), order: 1 },
        'Mektubat': { icon: require('@/assets/images/mektubat.png'), order: 2 },
        "Lem'alar": { icon: require('@/assets/images/Lemalar.png'), order: 3 },
        'Şualar': { icon: require('@/assets/images/Şualar.png'), order: 4 },
        'Mesnevî-i Nuriye': { icon: require('@/assets/images/Mesnevi i nuriye.png'), order: 5 },
        'İşarât-ül İ\'caz': { icon: require('@/assets/images/Muhakemat.png'), order: 6 },
        'Barla Lâhikası': { icon: require('@/assets/images/Muhakemat.png'), order: 7 },
        'Kastamonu Lâhikası': { icon: require('@/assets/images/Muhakemat.png'), order: 8 },
        'Emirdağ Lâhikası': { icon: require('@/assets/images/Muhakemat.png'), order: 9 },
        'Diğer': { icon: require('@/assets/images/Muhakemat.png'), order: 10 }
      };
      
      // Kitapları kategorilere göre grupla
      const categoryCounts = {};
      this.allBooks.forEach(book => {
        if (!categoryCounts[book.category]) {
          categoryCounts[book.category] = 0;
        }
        categoryCounts[book.category]++;
      });
      
      // Kategorileri oluştur
      this.categories = Object.entries(categoryCounts).map(([category, count]) => {
        const info = categoryMap[category] || { icon: require('@/assets/images/Muhakemat.png'), order: 99 };
        return {
          id: info.order,
          name: category,
          slug: category,
          icon: info.icon,
          count: count
        };
      }).sort((a, b) => a.id - b.id);
    },
    
    getDefaultCover(title) {
      const coverMap = {
        'Sözler': require('@/assets/images/sözler.png'),
        'Mektubat': require('@/assets/images/mektubat.png'),
        "Lem'alar": require('@/assets/images/Lemalar.png'),
        'Şualar': require('@/assets/images/Şualar.png'),
        'Mesnevî-i Nuriye': require('@/assets/images/Mesnevi i nuriye.png'),
        'Muhakemat': require('@/assets/images/Muhakemat.png'),
        'Sikke-i Tasdik-i Gaybî': require('@/assets/images/sikkei tasdiki gaybi.png')
      };
      
      for (const [key, value] of Object.entries(coverMap)) {
        if (title.includes(key)) return value;
      }
      
      return require('@/assets/images/Muhakemat.png');
    },
    
    getDefaultDescription(title) {
      const descriptions = {
        'Sözler': 'İman hakikatlerini anlatan 33 Söz',
        'Mektubat': 'Nur talebelerine yazılan mektuplar',
        "Lem'alar": 'Işık parıltıları, 33 Lem\'a',
        'Şualar': 'Nur\'un şuleleri, 15 Şua',
        'Mesnevî-i Nuriye': 'Arapça yazılmış nurlu mesnevi',
        'İşarât-ül İ\'caz': 'Kur\'an tefsiri',
        'Barla Lâhikası': 'Barla döneminde yazılan mektuplar',
        'Kastamonu Lâhikası': 'Kastamonu döneminde yazılan mektuplar',
        'Emirdağ Lâhikası': 'Emirdağ döneminde yazılan mektuplar'
      };
      
      for (const [key, value] of Object.entries(descriptions)) {
        if (title.includes(key)) return value;
      }
      
      return 'Risale-i Nur Külliyatı\'ndan';
    },
    openBook(bookId) {
      this.$router.push({ 
        name: 'reader', 
        params: { bookId: bookId }
      });
    },
    scrollToFeatures() {
      document.getElementById('features').scrollIntoView({ behavior: 'smooth' });
    }
  }
}
</script>

<style scoped lang="scss">
.home-view {
  min-height: 100vh;
  animation: fadeIn 0.6s ease-out;
}

// Hero Bölümü
.hero-section {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  background: linear-gradient(135deg, var(--bg-primary) 0%, var(--bg-secondary) 100%);
  overflow: hidden;
  
  .hero-content {
    text-align: center;
    z-index: 10;
    max-width: 800px;
    padding: 2rem;
    
    .bismillah {
      font-size: 2rem;
      color: var(--accent-color);
      margin-bottom: 1rem;
      font-family: 'Amiri', serif;
    }
    
    .hero-title {
      font-size: 3.5rem;
      margin-bottom: 1.5rem;
      background: linear-gradient(135deg, var(--primary-color), var(--primary-light));
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      animation: fadeIn 1s ease-out 0.3s both;
    }
    
    .hero-subtitle {
      font-size: 1.25rem;
      color: var(--text-secondary);
      margin-bottom: 2rem;
      line-height: 1.8;
      animation: fadeIn 1s ease-out 0.6s both;
      
      .verse-ref {
        display: block;
        font-size: 0.9rem;
        color: var(--text-light);
        margin-top: 0.5rem;
      }
    }
    
    .hero-actions {
      display: flex;
      gap: 1rem;
      justify-content: center;
      animation: fadeIn 1s ease-out 0.9s both;
    }
  }
  
  .hero-decoration {
    position: absolute;
    top: 50%;
    right: 10%;
    transform: translateY(-50%);
    
    .tasbih-container {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }
  }
}

// Bölüm Genel Stilleri
section {
  padding: 5rem 0;
  
  .container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 2rem;
  }
  
  .section-title {
    text-align: center;
    margin-bottom: 3rem;
    position: relative;
    
    &::after {
      content: '◆';
      display: block;
      color: var(--accent-color);
      font-size: 1.5rem;
      margin-top: 1rem;
    }
  }
}

// Öne Çıkan Kitaplar
.featured-books {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
  
  .book-card {
    cursor: pointer;
    text-align: center;
    
    .book-3d {
      margin-bottom: 1.5rem;
      height: 300px;
      
      .book-cover {
        height: 100%;
        
        .cover-front {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 1rem;
          height: 100%;
          
          img {
            max-width: 150px;
            max-height: 200px;
            object-fit: contain;
            margin-bottom: 1rem;
          }
          
          h3 {
            font-size: 1.25rem;
            color: var(--primary-dark);
          }
        }
      }
    }
    
    .book-info {
      .book-description {
        color: var(--text-secondary);
        margin-bottom: 1rem;
      }
      
      .book-stats {
        display: flex;
        justify-content: center;
        gap: 1rem;
        
        .stat {
          font-size: 0.9rem;
          color: var(--text-light);
        }
      }
    }
  }
}

// Kategoriler
.category-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
  
  .category-card {
    text-align: center;
    text-decoration: none;
    color: inherit;
    
    .category-icon {
      width: 80px;
      height: 80px;
      margin: 0 auto 1rem;
      padding: 1rem;
      background: var(--bg-secondary);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      
      img {
        max-width: 100%;
        max-height: 100%;
        object-fit: contain;
      }
    }
    
    h3 {
      font-size: 1.25rem;
      margin-bottom: 0.5rem;
    }
    
    p {
      color: var(--text-light);
    }
  }
}

// Özellikler
.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  
  .feature-card {
    text-align: center;
    
    .feature-icon {
      font-size: 3rem;
      margin-bottom: 1rem;
    }
    
    h3 {
      font-size: 1.25rem;
      margin-bottom: 0.5rem;
    }
    
    p {
      color: var(--text-secondary);
    }
  }
}

// Dua Bölümü
.prayer-section {
  background: var(--bg-secondary);
  
  .prayer-card {
    max-width: 600px;
    margin: 0 auto;
    text-align: center;
    
    h3 {
      margin-bottom: 1.5rem;
    }
    
    .arabic-text {
      font-size: 1.5rem;
      margin-bottom: 1rem;
      color: var(--primary-color);
    }
    
    .prayer-meaning {
      font-size: 1.1rem;
      margin-bottom: 1rem;
      line-height: 1.8;
    }
    
    .prayer-source {
      color: var(--text-light);
      font-style: italic;
    }
  }
}

// Responsive
@media (max-width: 768px) {
  .hero-section {
    .hero-content {
      .hero-title {
        font-size: 2.5rem;
      }
      
      .hero-actions {
        flex-direction: column;
        width: 100%;
        
        .btn {
          width: 100%;
        }
      }
    }
  }
  
  .featured-books {
    grid-template-columns: 1fr;
  }
  
  .category-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .features-grid {
    grid-template-columns: 1fr;
  }
}
</style>