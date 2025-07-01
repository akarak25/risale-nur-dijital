// Osmanlıca/Arapça kelime tespit ve işleme mixin'i

export default {
  methods: {
    // Metindeki Osmanlıca kelimeleri tespit et ve işaretle
    processOttomanWords(text) {
      if (!text) return '';
      
      // Osmanlıca/Arapça Unicode aralığı: U+0600 - U+06FF
      const ottomanWordRegex = /([\u0600-\u06FF]+)/g;
      
      // HTML string olarak döndür
      return text.replace(ottomanWordRegex, (match) => {
        return `<dictionary-tooltip word="${match}">${match}</dictionary-tooltip>`;
      });
    },
    
    // Vue bileşeni olarak render et
    renderTextWithDictionary(h, text) {
      if (!text) return '';
      
      const ottomanWordRegex = /([\u0600-\u06FF]+)/g;
      const parts = text.split(ottomanWordRegex);
      
      return parts.map((part, index) => {
        // Osmanlıca kelime mi kontrol et
        if (ottomanWordRegex.test(part)) {
          return h('dictionary-tooltip', {
            props: { word: part },
            key: `word-${index}`
          }, part);
        }
        return part;
      });
    },
    
    // Belirli bir element içindeki Osmanlıca kelimeleri işle
    processElementForDictionary(element) {
      if (!element) return;
      
      const walker = document.createTreeWalker(
        element,
        NodeFilter.SHOW_TEXT,
        null,
        false
      );
      
      const textNodes = [];
      let node;
      
      // Tüm text node'ları topla
      while (node = walker.nextNode()) {
        if (node.nodeValue && node.nodeValue.trim()) {
          textNodes.push(node);
        }
      }
      
      // Her text node'u işle
      textNodes.forEach(textNode => {
        const text = textNode.nodeValue;
        const ottomanWordRegex = /([\u0600-\u06FF]+)/g;
        
        if (ottomanWordRegex.test(text)) {
          const wrapper = document.createElement('span');
          wrapper.innerHTML = this.processOttomanWords(text);
          textNode.parentNode.replaceChild(wrapper, textNode);
        }
      });
    }
  }
};