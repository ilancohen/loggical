<script setup lang="ts">
import { ref, computed } from 'vue'

interface Props {
  src: string
  title: string
  height?: string
  description?: string
}

const props = withDefaults(defineProps<Props>(), {
  height: '600px',
})

const showCode = ref(false)
const sourceCode = ref('')
const loading = ref(false)

const iframeSrc = computed(() => {
  // If src starts with /, it's relative to base
  return props.src
})

const fetchSourceCode = async () => {
  if (sourceCode.value) {
    showCode.value = !showCode.value
    return
  }
  
  loading.value = true
  try {
    // Fetch the source file
    const response = await fetch(props.src)
    if (response.ok) {
      sourceCode.value = await response.text()
    } else {
      sourceCode.value = '// Unable to load source code'
    }
  } catch (error) {
    sourceCode.value = '// Error loading source code: ' + error.message
  }
  loading.value = false
  showCode.value = true
}
</script>

<template>
  <div class="interactive-demo">
    <div class="demo-header">
      <h3>{{ title }}</h3>
      <p v-if="description" class="description">{{ description }}</p>
      <div class="demo-actions">
        <button @click="fetchSourceCode" class="code-toggle-btn">
          {{ loading ? '⏳ Loading...' : showCode ? '📖 Hide Code' : '💻 View Code' }}
        </button>
        <a :href="iframeSrc" target="_blank" class="open-new-btn">
          🚀 Open in New Tab
        </a>
      </div>
    </div>
    
    <div class="demo-content">
      <div class="iframe-container" :style="{ height }">
        <iframe 
          :src="iframeSrc" 
          frameborder="0"
          sandbox="allow-scripts allow-same-origin allow-forms"
          loading="lazy"
        ></iframe>
      </div>
      
      <div v-if="showCode" class="source-code">
        <div class="code-header">
          <span class="code-title">📄 Source Code</span>
          <button @click="showCode = false" class="close-code-btn">✕</button>
        </div>
        <div class="code-content">
          <pre><code>{{ sourceCode }}</code></pre>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.interactive-demo {
  margin: 2rem 0;
  border: 1px solid var(--vp-c-divider);
  border-radius: 12px;
  overflow: hidden;
  background: var(--vp-c-bg-soft);
}

.demo-header {
  padding: 1.5rem;
  background: var(--vp-c-bg-alt);
  border-bottom: 1px solid var(--vp-c-divider);
}

.demo-header h3 {
  margin: 0 0 0.5rem 0;
  font-size: 1.5rem;
  color: var(--vp-c-brand-1);
}

.description {
  margin: 0.5rem 0 1rem 0;
  color: var(--vp-c-text-2);
  font-size: 0.95rem;
}

.demo-actions {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.code-toggle-btn,
.open-new-btn {
  padding: 0.5rem 1rem;
  border-radius: 6px;
  font-weight: 500;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s ease;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}

.code-toggle-btn {
  background: var(--vp-c-brand-1);
  color: white;
  border: none;
}

.code-toggle-btn:hover {
  background: var(--vp-c-brand-2);
  transform: translateY(-2px);
}

.open-new-btn {
  background: var(--vp-c-bg);
  color: var(--vp-c-brand-1);
  border: 1px solid var(--vp-c-brand-1);
}

.open-new-btn:hover {
  background: var(--vp-c-brand-1);
  color: white;
  transform: translateY(-2px);
}

.demo-content {
  position: relative;
}

.iframe-container {
  width: 100%;
  position: relative;
  background: white;
}

.iframe-container iframe {
  width: 100%;
  height: 100%;
  border: none;
}

.source-code {
  border-top: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg-alt);
}

.code-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.5rem;
  background: var(--vp-c-bg);
  border-bottom: 1px solid var(--vp-c-divider);
}

.code-title {
  font-weight: 600;
  color: var(--vp-c-text-1);
  font-size: 0.95rem;
}

.close-code-btn {
  background: none;
  border: none;
  color: var(--vp-c-text-2);
  cursor: pointer;
  padding: 0.25rem 0.5rem;
  font-size: 1.2rem;
  line-height: 1;
  border-radius: 4px;
  transition: all 0.2s ease;
}

.close-code-btn:hover {
  background: var(--vp-c-bg-soft);
  color: var(--vp-c-text-1);
}

.code-content {
  max-height: 500px;
  overflow: auto;
  padding: 0;
}

.code-content pre {
  margin: 0;
  padding: 1.5rem;
  background: var(--vp-code-block-bg);
  overflow-x: auto;
}

.code-content code {
  color: var(--vp-c-text-1);
  font-family: var(--vp-font-family-mono);
  font-size: 0.875rem;
  line-height: 1.6;
  white-space: pre;
}

@media (max-width: 768px) {
  .demo-header {
    padding: 1rem;
  }
  
  .demo-actions {
    flex-direction: column;
  }
  
  .code-toggle-btn,
  .open-new-btn {
    width: 100%;
    justify-content: center;
  }
  
  .iframe-container {
    height: 400px !important;
  }
}
</style>

