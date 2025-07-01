<template>
  <div class="word-wrapper" @mouseenter="showTooltip" @mouseleave="hideTooltip">
    <span class="ottoman-word" :class="{ 'has-meaning': hasMeaning }">
      <slot></slot>
    </span>
    
    <transition name="tooltip">
      <div v-if="isTooltipVisible && meaning" class="word-tooltip" :style="tooltipStyle">
        <div class="tooltip-header">{{ word }}</div>
        <div class="tooltip-meaning">{{ meaning.meaning }}</div>
        <div v-if="meaning.example" class="tooltip-example">
          <strong>Örnek:</strong> {{ meaning.example }}
        </div>
      </div>
    </transition>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  name: 'DictionaryTooltip',
  props: {
    word: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      isTooltipVisible: false,
      meaning: null,
      hasMeaning: false,
      tooltipStyle: {
        top: '0px',
        left: '0px'
      },
      cache: new Map() // Kelime anlamlarını cache'le
    };
  },
  methods: {
    async showTooltip(event) {
      this.isTooltipVisible = true;
      
      // Tooltip pozisyonunu ayarla
      const rect = event.target.getBoundingClientRect();
      this.tooltipStyle = {
        top: `${rect.bottom + 5}px`,
        left: `${rect.left}px`
      };
      
      // Cache'de varsa kullan
      if (this.cache.has(this.word)) {
        this.meaning = this.cache.get(this.word);
        this.hasMeaning = !!this.meaning;
        return;
      }
      
      // API'den kelime anlamını getir
      try {
        const response = await axios.get(
          `${process.env.VUE_APP_API_URL}/dictionary/word/${encodeURIComponent(this.word)}`
        );
        this.meaning = response.data;
        this.hasMeaning = true;
        this.cache.set(this.word, response.data);
      } catch (error) {
        this.hasMeaning = false;
        this.meaning = null;
        this.cache.set(this.word, null);
      }
    },
    
    hideTooltip() {
      this.isTooltipVisible = false;
    }
  }
};
</script>

<style scoped>
.word-wrapper {
  display: inline;
  position: relative;
}

.ottoman-word {
  cursor: help;
  border-bottom: 1px dotted #999;
  transition: all 0.2s ease;
}

.ottoman-word.has-meaning {
  border-bottom-color: #3498db;
  color: #2c3e50;
}

.ottoman-word:hover {
  background-color: rgba(52, 152, 219, 0.1);
}

.word-tooltip {
  position: fixed;
  z-index: 1000;
  background: white;
  border: 1px solid #ddd;
  border-radius: 6px;
  padding: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  max-width: 300px;
  font-size: 14px;
}

.tooltip-header {
  font-weight: bold;
  color: #2c3e50;
  margin-bottom: 6px;
  font-size: 16px;
  direction: rtl; /* Osmanlıca için sağdan sola */
}

.tooltip-meaning {
  color: #555;
  line-height: 1.4;
  margin-bottom: 6px;
}

.tooltip-example {
  color: #777;
  font-size: 12px;
  font-style: italic;
  border-top: 1px solid #eee;
  padding-top: 6px;
  margin-top: 6px;
}

/* Tooltip animasyonu */
.tooltip-enter-active,
.tooltip-leave-active {
  transition: opacity 0.3s ease;
}

.tooltip-enter-from,
.tooltip-leave-to {
  opacity: 0;
}

/* Dark tema desteği */
@media (prefers-color-scheme: dark) {
  .word-tooltip {
    background: #2c3e50;
    border-color: #34495e;
    color: #ecf0f1;
  }
  
  .tooltip-header {
    color: #3498db;
  }
  
  .tooltip-meaning {
    color: #bdc3c7;
  }
  
  .tooltip-example {
    color: #95a5a6;
    border-top-color: #34495e;
  }
}
</style>