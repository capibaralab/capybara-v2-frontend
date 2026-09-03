<script setup>
import { reactive, ref } from 'vue'
import { useCampaignDraftStore } from '../../stores/campaignDraft'

const draft = useCampaignDraftStore()
const errors = reactive({ product: '', pdpUrl: '' })
const dragActive = ref(false)
const fileInput = ref(null)

const MODEL_EXTENSIONS = ['.glb', '.gltf', '.usdz']

function isModelFile(file) {
  const name = file.name.toLowerCase()
  return MODEL_EXTENSIONS.some((ext) => name.endsWith(ext))
}

function handleFile(file) {
  if (!file) return
  if (file.type.startsWith('image/')) {
    draft.product.method = 'upload'
    draft.product.uploadKind = 'image'
    draft.product.fileName = file.name
    draft.product.modelFileName = ''
    draft.product.scrapedName = ''
    const reader = new FileReader()
    reader.onload = () => {
      draft.product.imageDataUrl = reader.result
    }
    reader.readAsDataURL(file)
    errors.product = ''
  } else if (isModelFile(file)) {
    draft.product.method = 'upload'
    draft.product.uploadKind = 'model'
    draft.product.modelFileName = file.name
    draft.product.imageDataUrl = ''
    draft.product.fileName = ''
    draft.product.scrapedName = ''
    errors.product = ''
  } else {
    errors.product = 'Unsupported file type — use an image or a .glb/.gltf/.usdz model'
  }
}

function openFileBrowser() {
  fileInput.value?.click()
}

function onFileInputChange(event) {
  handleFile(event.target.files[0])
}

function onDrop(event) {
  event.preventDefault()
  dragActive.value = false
  handleFile(event.dataTransfer.files[0])
}

function onDragOver(event) {
  event.preventDefault()
  dragActive.value = true
}

function onDragLeave() {
  dragActive.value = false
}

function validate() {
  errors.product = draft.product.uploadKind ? '' : 'Upload a product image/3D model'
  errors.pdpUrl = draft.product.pdpUrl.trim() ? '' : 'Product purchase page URL is required'
  return !errors.product && !errors.pdpUrl
}

defineExpose({ validate })
</script>

<template>
  <div>
    <div class="field method-panel">
      <label>Product Image or 3D Model</label>
      <div
        class="dropzone"
        :class="{ active: dragActive }"
        @click="openFileBrowser"
        @dragover="onDragOver"
        @dragleave="onDragLeave"
        @drop="onDrop"
      >
        <template v-if="draft.product.uploadKind === 'image'">
          <img :src="draft.product.imageDataUrl" alt="Product preview" class="preview" />
          <span class="file-name">{{ draft.product.fileName }}</span>
        </template>
        <template v-else-if="draft.product.uploadKind === 'model'">
          <span class="model-icon">🧊</span>
          <span class="file-name">{{ draft.product.modelFileName }}</span>
        </template>
        <template v-else>
          <svg class="upload-icon" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path
              d="M11.47 2.47a.75.75 0 0 1 1.06 0l4.5 4.5a.75.75 0 0 1-1.06 1.06l-3.22-3.22V16.5a.75.75 0 0 1-1.5 0V4.81L8.03 8.03a.75.75 0 0 1-1.06-1.06l4.5-4.5ZM3 15.75a.75.75 0 0 1 .75.75v2.25a1.5 1.5 0 0 0 1.5 1.5h13.5a1.5 1.5 0 0 0 1.5-1.5V16.5a.75.75 0 0 1 1.5 0v2.25a3 3 0 0 1-3 3H5.25a3 3 0 0 1-3-3V16.5a.75.75 0 0 1 .75-.75Z"
            />
          </svg>
          <span class="dropzone-hint">
            Drag & drop an image or 3D model here, or click to browse
          </span>
          <span class="dropzone-subhint">Accepts images, or .glb/.gltf/.usdz model files</span>
        </template>
      </div>
      <input
        ref="fileInput"
        type="file"
        accept="image/*,.glb,.gltf,.usdz"
        class="hidden-input"
        @change="onFileInputChange"
      />
    </div>

    <div class="divider-or"><span>and</span></div>

    <div class="field method-panel">
      <label for="pdpUrl">Product Purchase Page</label>
      <input
        id="pdpUrl"
        v-model="draft.product.pdpUrl"
        type="url"
        :class="{ 'has-error': errors.pdpUrl }"
        placeholder="https://example.com/products/your-item"
      />
      <span v-if="errors.pdpUrl" class="error">{{ errors.pdpUrl }}</span>
    </div>

    <span v-if="errors.product" class="error">{{ errors.product }}</span>
  </div>
</template>

<style scoped>
.method-panel {
  align-items: flex-start;
}
.dropzone {
  width: 100%;
  min-height: 180px;
  border: 2px dashed var(--border);
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 24px;
  cursor: pointer;
  text-align: center;
  transition: border-color 0.15s, background 0.15s;
}
.dropzone.active {
  border-color: var(--accent-border);
  background: var(--accent-bg);
}
.upload-icon {
  width: 32px;
  height: 32px;
  color: var(--text);
}
.dropzone-hint {
  font-size: 15px;
  font-weight: 600;
  color: var(--text-h);
}
.dropzone-subhint {
  font-size: 13px;
  color: var(--text);
}
.model-icon {
  font-size: 40px;
}
.file-name {
  font-size: 13px;
  color: var(--text);
}
.hidden-input {
  display: none;
}
.preview {
  width: 120px;
  height: 120px;
  object-fit: cover;
  border-radius: 8px;
  border: 1px solid var(--border);
}
.divider-or {
  display: flex;
  align-items: center;
  color: var(--text);
  font-size: 13px;
  margin: 20px 0;
}
.divider-or::before,
.divider-or::after {
  content: '';
  flex: 1;
  border-top: 1px solid var(--border);
}
.divider-or span {
  padding: 0 12px;
}
</style>
