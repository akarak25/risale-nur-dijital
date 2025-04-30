<template>
  <div class="bookshelf-component">
    <div class="shelf-header" v-if="title">
      <h2>{{ title }}</h2>
      <div v-if="showViewAll" class="view-all">
        <router-link :to="{ name: viewAllRoute, params: viewAllParams }">
          Tümünü Görüntüle
        </router-link>
      </div>
    </div>
    
    <div class="shelf-container" :style="shelfContainerStyle">
      <div class="shelf" :class="{ 'grid-view': isGridView }">
        <div 
          v-for="book in books" 
          :key="book._id"
          class="shelf-item"
        >
          <book-card 
            :book="book"
            :can-flip="true"
          />
        </div>
      </div>
      
      <div class="shelf-base"></div>
    </div>
    
    <div class="view-controls" v-if="showViewControls">
      <button 
        @click="isGridView = false" 
        :class="['view-btn', { active: !isGridView }]"
      >
        <span class="view-icon shelf-icon"></span>
      </button>
      <button 
        @click="isGridView = true" 
        :class="['view-btn', { active: isGridView }]"
      >
        <span class="view-icon grid-icon"></span>
      </button>
    </div>
  </div>
</template>

<script>
import BookCard from './BookCard.vue';

export default {
  name: 'BookShelf',
  components: {
    BookCard
  },
  props: {
    books: {
      type: Array,
      required: true
    },
    title: {
      type: String,
      default: ''
    },
    showViewAll: {
      type: Boolean,
      default: false
    },
    viewAllRoute: {
      type: String,
      default: 'bookshelf'
    },
    viewAllParams: {
      type: Object,
      default: () => ({})
    },
    showViewControls: {
      type: Boolean,
      default: false
    },
    defaultView: {
      type: String,
      default: 'shelf' // 'shelf' veya 'grid'
    },
    maxHeight: {
      type: String,
      default: 'auto'
    }
  },
  data() {
    return {
      isGridView: this.defaultView === 'grid'
    };
  },
  computed: {
    shelfContainerStyle() {
      return {
        maxHeight: this.maxHeight
      };
    }
  },
  watch: {
    defaultView(newVal) {
      this.isGridView = newVal === 'grid';
    }
  }
}
</script>

<style scoped lang="scss">
.bookshelf-component {
  margin-bottom: 30px;
}

.shelf-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  
  h2 {
    font-size: 1.5rem;
    color: #333;
    margin: 0;
  }
  
  .view-all {
    a {
      color: #4a69bd;
      text-decoration: none;
      font-size: 0.9rem;
      font-weight: 600;
      
      &:hover {
        text-decoration: underline;
      }
    }
  }
}

.shelf-container {
  position: relative;
  overflow: hidden;
  
  .shelf {
    display: flex;
    padding-bottom: 20px; // Raf için boşluk
    overflow-x: auto;
    scrollbar-width: thin;
    scrollbar-color: #ccc transparent;
    
    &::-webkit-scrollbar {
      height: 8px;
    }
    
    &::-webkit-scrollbar-track {
      background: transparent;
    }
    
    &::-webkit-scrollbar-thumb {
      background-color: #ccc;
      border-radius: 20px;
    }
    
    &.grid-view {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
      grid-gap: 20px;
      padding-bottom: 0;
    }
    
    .shelf-item {
      flex: 0 0 auto;
      width: 150px;
      height: 220px;
      margin-right: 30px;
      
      &:last-child {
        margin-right: 0;
      }
    }
  }
  
  .shelf-base {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 15px;
    background: linear-gradient(to right, #8B4513, #A0522D);
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
    border-radius: 2px;
    
    &:after {
      content: '';
      position: absolute;
      left: 0;
      right: 0;
      top: 0;
      height: 3px;
      background: rgba(255, 255, 255, 0.1);
    }
  }
}

.view-controls {
  display: flex;
  justify-content: center;
  margin-top: 20px;
  
  .view-btn {
    background: none;
    border: none;
    padding: 8px 15px;
    margin: 0 5px;
    border-radius: 4px;
    cursor: pointer;
    transition: background-color 0.2s;
    
    &:hover {
      background-color: #f0f0f0;
    }
    
    &.active {
      background-color: #e0e0e0;
    }
    
    .view-icon {
      display: inline-block;
      width: 20px;
      height: 20px;
      background-size: contain;
      background-position: center;
      background-repeat: no-repeat;
    }
    
    .shelf-icon:before {
      content: '📚';
    }
    
    .grid-icon:before {
      content: '⊞';
    }
  }
}

@media (max-width: 768px) {
  .shelf-header {
    h2 {
      font-size: 1.3rem;
    }
  }
  
  .shelf-container {
    .shelf {
      .shelf-item {
        width: 120px;
        height: 180px;
        margin-right: 20px;
      }
      
      &.grid-view {
        grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
        grid-gap: 15px;
      }
    }
  }
}
</style>