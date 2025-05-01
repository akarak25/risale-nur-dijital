<template>
  <div class="home">
    <div class="welcome-section">
      <h1>Risale-i Nur Dijital Kütüphane</h1>
      <p>Bediüzzaman Said Nursi'nin eserlerini gerçek kitap deneyimiyle okumak için hoş geldiniz.</p>
      <div class="action-buttons">
        <router-link to="/bookshelf" class="btn btn-primary">Kitaplığa Göz At</router-link>
      </div>
    </div>
    
    <div class="featured-books">
      <h2>Öne Çıkan Kitaplar</h2>
      <div class="bookshelf">
        <div 
          v-for="book in featuredBooks" 
          :key="book._id" 
          class="bookshelf-item"
          @click="goToBook(book._id)"
        >
          <div class="book">
            <div class="book-cover">
              <div class="cover-front" :style="{ backgroundImage: `url(${book.coverImage})` }"></div>
              <div class="cover-back">
                <div class="book-summary">
                  <h3>{{ book.title }}</h3>
                  <p>{{ book.description }}</p>
                </div>
              </div>
            </div>
          </div>
          <h3 class="book-title">{{ book.title }}</h3>
        </div>
      </div>
    </div>
    
    <div class="categories-section">
      <h2>Kategoriler</h2>
      <div class="categories-grid">
        <router-link 
          v-for="category in categories" 
          :key="category" 
          :to="{ name: 'bookshelf-category', params: { category } }"
          class="category-card"
        >
          <div class="category-icon" :class="'category-' + categorySlug(category)"></div>
          <h3>{{ category }}</h3>
        </router-link>
      </div>
    </div>
    
    <div class="features-section">
      <h2>Dijital Kütüphane Özellikleri</h2>
      <div class="features-grid">
        <div class="feature-card">
          <div class="feature-icon icon-book"></div>
          <h3>Gerçekçi Kitap Deneyimi</h3>
          <p>Gerçek kitap görünümü, sayfa çevirme animasyonu ve kağıt dokusu ile fiziksel okuma deneyimini yaşayın.</p>
        </div>
        
        <div class="feature-card">
          <div class="feature-icon icon-note"></div>
          <h3>Not Alma</h3>
          <p>Sayfa kenarlarına notlar ekleyin ve daha sonra kolayca erişin.</p>
        </div>
        
        <div class="feature-card">
          <div class="feature-icon icon-bookmark"></div>
          <h3>Yer İşaretleri</h3>
          <p>Kaldığınız yeri işaretleyin ve sonraki okumalarınızda kaldığınız yerden devam edin.</p>
        </div>
        
        <div class="feature-card">
          <div class="feature-icon icon-search"></div>
          <h3>Gelişmiş Arama</h3>
          <p>Tüm külliyat içinde anahtar kelimelerle arama yaparak istediğiniz bilgiye hızlıca erişin.</p>
        </div>
        
        <div class="feature-card">
          <div class="feature-icon icon-font"></div>
          <h3>Özelleştirme</h3>
          <p>Yazı tipi, boyutu ve tema ayarlarını kişiselleştirerek size en uygun okuma deneyimini oluşturun.</p>
        </div>
        
        <div class="feature-card">
          <div class="feature-icon icon-mobile"></div>
          <h3>Mobil Uyumlu</h3>
          <p>Her cihazda aynı kalitede okuma deneyimi için tam uyumlu tasarım.</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'HomeView',
  data() {
    return {
      featuredBooks: [],
      categories: [
        'Sözler', 
        'Mektubat', 
        'Lem\'alar', 
        'Şualar', 
        'İşarât-ül İ\'caz', 
        'Mesnevî-i Nuriye', 
        'Barla Lâhikası', 
        'Kastamonu Lâhikası', 
        'Emirdağ Lâhikası', 
        'Diğer'
      ]
    }
  },
  created() {
    this.loadFeaturedBooks();
  },
  methods: {
    async loadFeaturedBooks() {
      try {
        // Ana sayfada gösterilecek öne çıkan kitapları yükle
        // Bu örnek için rastgele 5 kitap gösterelim
        await this.$store.dispatch('fetchBooks');
        let books = this.$store.state.books.slice(0, 5);
        
        // Kitap kapak resimlerini manuel olarak ayarla
        const bookCovers = {
          'Sözler': require('@/assets/images/sözler.png'),
          'Mektubat': require('@/assets/images/mektubat.png'),
          'Lem\'alar': require('@/assets/images/Lemalar.png'),
          'Şualar': require('@/assets/images/Şualar.png'),
          'Mesnevî-i Nuriye': require('@/assets/images/Mesnevi i nuriye.png'),
          'İşarât-ül İ\'caz': require('@/assets/images/sikkei tasdiki gaybi.png'),
          'Muhakemat': require('@/assets/images/Muhakemat.png')
        };
        
        this.featuredBooks = books.map(book => {
          // Eğer kitabın başlığı için bir kapak resmi varsa, onu kullan
          if (bookCovers[book.title]) {
            book.coverImage = bookCovers[book.title];
          }
          return book;
        });
      } catch (error) {
        console.error("Öne çıkan kitaplar yüklenirken hata oluştu:", error);
      }
    },
    goToBook(bookId) {
      this.$router.push({ name: 'reader', params: { bookId } });
    },
    categorySlug(category) {
      return category
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[ğüşıöçĞÜŞİÖÇ]/g, c => {
          return {
            'ğ': 'g', 'ü': 'u', 'ş': 's', 'ı': 'i', 'ö': 'o', 'ç': 'c',
            'Ğ': 'G', 'Ü': 'U', 'Ş': 'S', 'İ': 'I', 'Ö': 'O', 'Ç': 'C'
          }[c];
        });
    }
  }
}
</script>

<style scoped lang="scss">
.home {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.welcome-section {
  text-align: center;
  padding: 40px 0;
  
  h1 {
    font-size: 2.5rem;
    margin-bottom: 20px;
    color: #4a69bd;
  }
  
  p {
    font-size: 1.2rem;
    max-width: 700px;
    margin: 0 auto 30px;
    color: #666;
  }
  
  .action-buttons {
    margin-top: 20px;
    
    .btn {
      padding: 12px 24px;
      font-size: 1.1rem;
    }
  }
}

.featured-books {
  margin: 40px 0;
  
  h2 {
    text-align: center;
    margin-bottom: 30px;
    font-size: 1.8rem;
    color: #333;
  }
  
  .bookshelf {
    display: flex;
    overflow-x: auto;
    padding: 20px 0;
    -webkit-overflow-scrolling: touch;
    
    .bookshelf-item {
      flex: 0 0 auto;
      width: 180px;
      margin-right: 30px;
      cursor: pointer;
      transition: transform 0.3s;
      
      &:hover {
        transform: scale(1.05);
      }
      
      .book {
        perspective: 1200px;
        width: 100%;
        height: 250px;
        position: relative;
        
        .book-cover {
          position: relative;
          width: 100%;
          height: 100%;
          transform-style: preserve-3d;
          transition: transform 0.5s;
          
          .cover-front, .cover-back {
            position: absolute;
            width: 100%;
            height: 100%;
            backface-visibility: hidden;
            border-radius: 5px;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
          }
          
          .cover-front {
            background-size: cover;
            background-position: center;
            background-repeat: no-repeat;
            border: 1px solid #ddd;
          }
          
          .cover-back {
            transform: rotateY(180deg);
            background-color: #f5f5f5;
            padding: 15px;
            display: flex;
            align-items: center;
            justify-content: center;
            
            .book-summary {
              text-align: center;
              
              h3 {
                font-size: 1rem;
                margin-bottom: 10px;
              }
              
              p {
                font-size: 0.8rem;
                line-height: 1.4;
                color: #666;
              }
            }
          }
        }
        
        &:hover .book-cover {
          transform: rotateY(180deg);
        }
      }
    }
  }
  
  .book-title {
    text-align: center;
    margin-top: 15px;
    font-size: 1.1rem;
  }
}

.categories-section {
  margin: 60px 0;
  
  h2 {
    text-align: center;
    margin-bottom: 30px;
    font-size: 1.8rem;
    color: #333;
  }
  
  .categories-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    grid-gap: 20px;
  }
  
  .category-card {
    display: block;
    text-decoration: none;
    background-color: #fff;
    padding: 20px;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    text-align: center;
    transition: transform 0.3s, box-shadow 0.3s;
    
    &:hover {
      transform: translateY(-5px);
      box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
    }
    
    h3 {
      color: #333;
      font-size: 1.2rem;
      margin-top: 15px;
    }
    
    .category-icon {
      width: 60px;
      height: 60px;
      margin: 0 auto;
      background-size: contain;
      background-position: center;
      background-repeat: no-repeat;
    }
  }
}

.features-section {
  margin: 60px 0;
  
  h2 {
    text-align: center;
    margin-bottom: 30px;
    font-size: 1.8rem;
    color: #333;
  }
  
  .features-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    grid-gap: 30px;
  }
  
  .feature-card {
    background-color: #fff;
    padding: 30px;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    text-align: center;
    
    h3 {
      font-size: 1.3rem;
      margin: 15px 0;
      color: #333;
    }
    
    p {
      color: #666;
      line-height: 1.6;
    }
    
    .feature-icon {
      width: 60px;
      height: 60px;
      margin: 0 auto;
      background-size: contain;
      background-position: center;
      background-repeat: no-repeat;
    }
  }
}

// Kategori ve Özellik İkonları
.category-sozler {
  background-image: url('../assets/images/sözler.png');
  background-size: contain;
  background-position: center;
  background-repeat: no-repeat;
  width: 60px;
  height: 60px;
}

.category-mektubat {
  background-image: url('../assets/images/mektubat.png');
  background-size: contain;
  background-position: center;
  background-repeat: no-repeat;
  width: 60px;
  height: 60px;
}

.category-lemalar {
  background-image: url('../assets/images/Lemalar.png');
  background-size: contain;
  background-position: center;
  background-repeat: no-repeat;
  width: 60px;
  height: 60px;
}

.category-sualar {
  background-image: url('../assets/images/Şualar.png');
  background-size: contain;
  background-position: center;
  background-repeat: no-repeat;
  width: 60px;
  height: 60px;
}

.category-isarat-ul-i-caz {
  background-image: url('../assets/images/sikkei tasdiki gaybi.png');
  background-size: contain;
  background-position: center;
  background-repeat: no-repeat;
  width: 60px;
  height: 60px;
}

.category-mesnevi-i-nuriye {
  background-image: url('../assets/images/Mesnevi i nuriye.png');
  background-size: contain;
  background-position: center;
  background-repeat: no-repeat;
  width: 60px;
  height: 60px;
}

.category-barla-lahikasi {
  background-image: url('../assets/images/Muhakemat.png');
  background-size: contain;
  background-position: center;
  background-repeat: no-repeat;
  width: 60px;
  height: 60px;
}

.category-kastamonu-lahikasi, .category-emirdag-lahikasi, .category-diger {
  background-image: url('../assets/images/Muhakemat.png');
  background-size: contain;
  background-position: center;
  background-repeat: no-repeat;
  width: 60px;
  height: 60px;
}

.icon-book:before {
  content: '📚';
  font-size: 40px;
}

.icon-note:before {
  content: '📝';
  font-size: 40px;
}

.icon-bookmark:before {
  content: '🔖';
  font-size: 40px;
}

.icon-search:before {
  content: '🔍';
  font-size: 40px;
}

.icon-font:before {
  content: '🖋️';
  font-size: 40px;
}

.icon-mobile:before {
  content: '📱';
  font-size: 40px;
}

// Responsive
@media (max-width: 768px) {
  .welcome-section {
    h1 {
      font-size: 2rem;
    }
    
    p {
      font-size: 1rem;
    }
  }
  
  .features-grid {
    grid-template-columns: 1fr !important;
  }
}
</style>