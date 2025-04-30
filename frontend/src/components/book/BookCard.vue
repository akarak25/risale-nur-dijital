<template>
  <div class="book-card" @click="openBook">
    <div class="book" :class="{ 'can-flip': canFlip }">
      <div class="book-cover">
        <div 
          class="cover-front" 
          :style="{ backgroundImage: `url(${book.coverImage})` }"
        >
          <div class="book-spine">
            <h3>{{ book.title }}</h3>
            <div class="book-author">{{ book.author || 'Bediüzzaman Said Nursi' }}</div>
          </div>
        </div>
        <div class="cover-back">
          <div class="book-summary">
            <h3>{{ book.title }}</h3>
            <p class="book-description">{{ truncateDescription }}</p>
            <div class="book-meta">
              <div class="book-pages">{{ book.totalPages }} Sayfa</div>
              <div class="book-category">{{ book.category }}</div>
            </div>
            <button class="read-btn" @click.stop="readBook">
              Okumaya Başla
            </button>
          </div>
        </div>
      </div>
    </div>
    <h3 class="book-title">{{ book.title }}</h3>
  </div>
</template>

<script>
export default {
  name: 'BookCard',
  props: {
    book: {
      type: Object,
      required: true
    },
    canFlip: {
      type: Boolean,
      default: true
    },
    maxDescriptionLength: {
      type: Number,
      default: 150
    }
  },
  computed: {
    truncateDescription() {
      if (!this.book.description) return '';
      
      if (this.book.description.length <= this.maxDescriptionLength) {
        return this.book.description;
      }
      
      return this.book.description.substring(0, this.maxDescriptionLength) + '...';
    }
  },
  methods: {
    openBook() {
      if (this.canFlip) return; // Çevirme aktifse, sadece çevirme yap
      this.readBook();
    },
    readBook() {
      this.$router.push({
        name: 'reader',
        params: { bookId: this.book._id }
      });
    }
  }
}
</script>

<style scoped lang="scss">
.book-card {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  
  .book-title {
    text-align: center;
    margin-top: 15px;
    font-size: 1.1rem;
    color: #333;
  }
}

.book {
  height: calc(100% - 40px);
  perspective: 1000px;
  cursor: pointer;
  
  .book-cover {
    height: 100%;
    transform-style: preserve-3d;
    transition: transform 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    position: relative;
    
    .cover-front, .cover-back {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      backface-visibility: hidden;
      border-radius: 6px;
      box-shadow: 0 4px 10px rgba(0, 0, 0, 0.15);
    }
    
    .cover-front {
      background-size: cover;
      background-position: center;
      background-color: #f0f0f0;
      display: flex;
      align-items: flex-start;
      
      .book-spine {
        position: absolute;
        left: 0;
        top: 0;
        width: 40px;
        height: 100%;
        background-color: rgba(0, 0, 0, 0.7);
        color: white;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        writing-mode: vertical-lr;
        transform: rotate(180deg);
        padding: 10px 0;
        
        h3 {
          font-size: 1rem;
          margin: 0;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          max-width: 100%;
          writing-mode: vertical-lr;
          transform: rotate(180deg);
        }
        
        .book-author {
          font-size: 0.7rem;
          margin-top: 10px;
          opacity: 0.8;
        }
      }
    }
    
    .cover-back {
      transform: rotateY(180deg);
      background-color: #f8f8f8;
      padding: 20px;
      display: flex;
      flex-direction: column;
      justify-content: center;
      
      .book-summary {
        text-align: center;
        
        h3 {
          font-size: 1.2rem;
          margin-bottom: 15px;
          color: #333;
        }
        
        .book-description {
          font-size: 0.9rem;
          line-height: 1.4;
          color: #666;
          margin-bottom: 20px;
          display: -webkit-box;
          -webkit-line-clamp: 6;
          -webkit-box-orient: vertical;
          overflow: hidden;
          text-align: left;
        }
        
        .book-meta {
          display: flex;
          justify-content: space-between;
          margin-bottom: 20px;
          
          .book-pages, .book-category {
            font-size: 0.8rem;
            color: #888;
            background-color: #f0f0f0;
            padding: 3px 8px;
            border-radius: 4px;
          }
        }
        
        .read-btn {
          background-color: #4a69bd;
          color: white;
          border: none;
          padding: 8px 20px;
          border-radius: 4px;
          font-size: 0.9rem;
          cursor: pointer;
          transition: background-color 0.2s;
          
          &:hover {
            background-color: #3b5998;
          }
        }
      }
    }
  }
  
  &.can-flip:hover .book-cover {
    transform: rotateY(180deg);
  }
}

// Responsive tasarım için medya sorguları
@media (max-width: 992px) {
  .book-card {
    .book-title {
      font-size: 1rem;
    }
  }
  
  .book {
    .book-cover {
      .cover-front {
        .book-spine {
          width: 30px;
          
          h3 {
            font-size: 0.9rem;
          }
        }
      }
      
      .cover-back {
        padding: 15px;
        
        .book-summary {
          h3 {
            font-size: 1.1rem;
          }
          
          .book-description {
            font-size: 0.8rem;
            -webkit-line-clamp: 5;
          }
        }
      }
    }
  }
}

@media (max-width: 768px) {
  .book {
    .book-cover {
      .cover-back {
        .book-summary {
          .book-description {
            -webkit-line-clamp: 4;
          }
        }
      }
    }
  }
}
</style>