<!--
  ═══ RichTextEditor Component ═══
  WYSIWYG editor สำหรับ CMS content (ใช้ TipTap/ProseMirror)

  ฟีเจอร์:
  - Format: Bold, Italic, Underline, Strikethrough
  - Heading: H1-H4, Paragraph
  - List: Bullet, Ordered, Blockquote
  - Align: Left, Center, Right
  - Link: เพิ่ม/แก้ URL
  - Image: แทรกจาก MediaPicker
  - Table: เพิ่ม/ลบ row, column
  - Undo/Redo + Fullscreen
  - Character/Word count

  Props: modelValue (HTML string), placeholder
  Emits: update:modelValue

  ⚠️ ใช้ sanitizeRichHtml() ก่อนแสดงบนหน้า public
-->
<template>
  <div class="rte-wrapper" :class="{ 'rte-fullscreen': isFullscreen }">
    <!-- Toolbar -->
    <div v-if="editor" class="rte-toolbar">
      <div class="rte-toolbar-group">
        <button type="button" class="rte-btn" :class="{ active: editor.isActive('bold') }" title="Bold (Ctrl+B)" @click="editor.chain().focus().toggleBold().run()">
          <strong>B</strong>
        </button>
        <button type="button" class="rte-btn" :class="{ active: editor.isActive('italic') }" title="Italic (Ctrl+I)" @click="editor.chain().focus().toggleItalic().run()">
          <em>I</em>
        </button>
        <button type="button" class="rte-btn" :class="{ active: editor.isActive('underline') }" title="Underline (Ctrl+U)" @click="editor.chain().focus().toggleUnderline().run()">
          <u>U</u>
        </button>
        <button type="button" class="rte-btn" :class="{ active: editor.isActive('strike') }" title="Strikethrough" @click="editor.chain().focus().toggleStrike().run()">
          <s>S</s>
        </button>
      </div>

      <div class="rte-divider" />

      <div class="rte-toolbar-group">
        <select class="rte-select" @change="setHeading($event)" :value="currentHeading">
          <option value="p">Paragraph</option>
          <option value="1">Heading 1</option>
          <option value="2">Heading 2</option>
          <option value="3">Heading 3</option>
          <option value="4">Heading 4</option>
        </select>
      </div>

      <div class="rte-divider" />

      <div class="rte-toolbar-group">
        <button type="button" class="rte-btn" :class="{ active: editor.isActive('bulletList') }" title="Bullet List" @click="editor.chain().focus().toggleBulletList().run()">
          ☰
        </button>
        <button type="button" class="rte-btn" :class="{ active: editor.isActive('orderedList') }" title="Numbered List" @click="editor.chain().focus().toggleOrderedList().run()">
          1.
        </button>
        <button type="button" class="rte-btn" :class="{ active: editor.isActive('blockquote') }" title="Blockquote" @click="editor.chain().focus().toggleBlockquote().run()">
          ❝
        </button>
      </div>

      <div class="rte-divider" />

      <div class="rte-toolbar-group">
        <button type="button" class="rte-btn" :class="{ active: editor.isActive({ textAlign: 'left' }) }" title="Align Left" @click="editor.chain().focus().setTextAlign('left').run()">
          ⫷
        </button>
        <button type="button" class="rte-btn" :class="{ active: editor.isActive({ textAlign: 'center' }) }" title="Align Center" @click="editor.chain().focus().setTextAlign('center').run()">
          ⫿
        </button>
        <button type="button" class="rte-btn" :class="{ active: editor.isActive({ textAlign: 'right' }) }" title="Align Right" @click="editor.chain().focus().setTextAlign('right').run()">
          ⫸
        </button>
      </div>

      <div class="rte-divider" />

      <div class="rte-toolbar-group">
        <button type="button" class="rte-btn" title="Insert Link" @click="insertLink">
          🔗
        </button>
        <button type="button" class="rte-btn" title="Insert Image" @click="showMediaPicker = true">
          🖼️
        </button>
        <button type="button" class="rte-btn" title="YouTube Video" @click="insertYoutube">
          ▶️
        </button>

      </div>

      <div class="rte-divider" />

      <div class="rte-toolbar-group">
        <button type="button" class="rte-btn" :class="{ active: editor.isActive('codeBlock') }" title="Code Block" @click="editor.chain().focus().toggleCodeBlock().run()">
          &lt;/&gt;
        </button>
        <button type="button" class="rte-btn" title="Horizontal Rule" @click="editor.chain().focus().setHorizontalRule().run()">
          ―
        </button>
      </div>

      <div class="rte-divider" />

      <!-- Table Controls -->
      <div class="rte-toolbar-group">
        <button type="button" class="rte-btn" title="Insert Table" @click="editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()">
          ⊞
        </button>
        <template v-if="editor.isActive('table')">
          <button type="button" class="rte-btn" title="Add Column" @click="editor.chain().focus().addColumnAfter().run()">⊕c</button>
          <button type="button" class="rte-btn" title="Add Row" @click="editor.chain().focus().addRowAfter().run()">⊕r</button>
          <button type="button" class="rte-btn" title="Delete Column" @click="editor.chain().focus().deleteColumn().run()">⊖c</button>
          <button type="button" class="rte-btn" title="Delete Row" @click="editor.chain().focus().deleteRow().run()">⊖r</button>
          <button type="button" class="rte-btn" title="Delete Table" @click="editor.chain().focus().deleteTable().run()">🗑️</button>
        </template>
      </div>

      <div class="rte-toolbar-right">
        <button type="button" class="rte-btn" title="Undo" @click="editor.chain().focus().undo().run()" :disabled="!editor.can().undo()">
          ↩
        </button>
        <button type="button" class="rte-btn" title="Redo" @click="editor.chain().focus().redo().run()" :disabled="!editor.can().redo()">
          ↪
        </button>
        <button type="button" class="rte-btn" :class="{ active: isFullscreen }" title="Fullscreen" @click="isFullscreen = !isFullscreen">
          {{ isFullscreen ? '✕' : '⛶' }}
        </button>
      </div>
    </div>

    <!-- Editor Content -->
    <EditorContent :editor="editor" class="rte-content" />

    <!-- Footer -->
    <div v-if="editor" class="rte-footer">
      <span class="rte-char-count">
        {{ charCount }} chars · {{ wordCount }} words
      </span>
    </div>

    <!-- Media Picker Modal -->
    <AdminMediaPicker
      v-if="showMediaPicker"
      @select="onMediaSelect"
      @close="showMediaPicker = false"
    />
  </div>
</template>

<script setup lang="ts">
import { useEditor, EditorContent } from '@tiptap/vue-3'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import TextAlign from '@tiptap/extension-text-align'
import Link from '@tiptap/extension-link'
import Image from '@tiptap/extension-image'
import Youtube from '@tiptap/extension-youtube'
import Placeholder from '@tiptap/extension-placeholder'
import { Table } from '@tiptap/extension-table'
import { TableRow } from '@tiptap/extension-table'
import { TableCell } from '@tiptap/extension-table'
import { TableHeader } from '@tiptap/extension-table'

const props = defineProps<{
  modelValue: string
  placeholder?: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const isFullscreen = ref(false)
const showMediaPicker = ref(false)
const charCount = ref(0)
const wordCount = ref(0)

const editor = useEditor({
  content: props.modelValue,
  extensions: [
    StarterKit.configure({
      heading: { levels: [1, 2, 3, 4] },
    }),
    Underline,
    TextAlign.configure({ types: ['heading', 'paragraph'] }),
    Link.configure({ openOnClick: false, HTMLAttributes: { class: 'rte-link' } }),
    Image.configure({ HTMLAttributes: { class: 'rte-image' } }),
    Youtube.configure({ width: 640, height: 360, HTMLAttributes: { class: 'rte-youtube' } }),
    Placeholder.configure({ placeholder: props.placeholder || 'Start writing...' }),
    Table.configure({ resizable: true, HTMLAttributes: { class: 'rte-table' } }),
    TableRow,
    TableCell,
    TableHeader,
  ],
  onUpdate: ({ editor: e }) => {
    emit('update:modelValue', e.getHTML())
    updateCounts(e)
  },
  onCreate: ({ editor: e }) => {
    updateCounts(e)
  },
})

function updateCounts(e: any) {
  const text = e.getText() || ''
  charCount.value = text.length
  wordCount.value = text.split(/\s+/).filter(Boolean).length
}

// Sync external changes
watch(() => props.modelValue, (val) => {
  if (editor.value && editor.value.getHTML() !== val) {
    editor.value.commands.setContent(val, { emitUpdate: false })
  }
})

const currentHeading = computed(() => {
  if (!editor.value) return 'p'
  for (const level of [1, 2, 3, 4]) {
    if (editor.value.isActive('heading', { level })) return String(level)
  }
  return 'p'
})

function setHeading(event: Event) {
  const val = (event.target as HTMLSelectElement).value
  if (val === 'p') {
    editor.value?.chain().focus().setParagraph().run()
  } else {
    editor.value?.chain().focus().toggleHeading({ level: Number(val) as 1|2|3|4 }).run()
  }
}

function insertLink() {
  const url = window.prompt('Enter URL:', editor.value?.getAttributes('link').href || 'https://')
  if (url === null) return
  if (url === '') {
    editor.value?.chain().focus().extendMarkRange('link').unsetLink().run()
  } else {
    editor.value?.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
  }
}

function insertYoutube() {
  const url = window.prompt('Enter YouTube URL:')
  if (url) {
    editor.value?.chain().focus().setYoutubeVideo({ src: url }).run()
  }
}

function onMediaSelect(url: string) {
  editor.value?.chain().focus().setImage({ src: url }).run()
  showMediaPicker.value = false
}

onBeforeUnmount(() => {
  editor.value?.destroy()
})
</script>

<style scoped>
.rte-wrapper {
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.02);
  transition: border-color 0.2s;
}
.rte-wrapper:focus-within {
  border-color: rgba(212, 168, 67, 0.4);
}
.rte-wrapper.rte-fullscreen {
  position: fixed;
  inset: 0;
  z-index: 100;
  border-radius: 0;
  background: var(--color-surface-primary, #0a0a0f);
  display: flex;
  flex-direction: column;
}

/* Toolbar */
.rte-toolbar {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 8px;
  background: rgba(255, 255, 255, 0.03);
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  flex-wrap: wrap;
  min-height: 40px;
}
.rte-toolbar-group {
  display: flex;
  align-items: center;
  gap: 2px;
}
.rte-toolbar-right {
  display: flex;
  align-items: center;
  gap: 2px;
  margin-left: auto;
}
.rte-divider {
  width: 1px;
  height: 20px;
  background: rgba(255, 255, 255, 0.08);
  margin: 0 4px;
}
.rte-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  border: none;
  border-radius: 6px;
  background: transparent;
  color: rgba(255, 255, 255, 0.5);
  font-size: 0.8125rem;
  cursor: pointer;
  transition: all 0.15s;
}
.rte-btn:hover {
  background: rgba(255, 255, 255, 0.08);
  color: white;
}
.rte-btn.active {
  background: rgba(212, 168, 67, 0.15);
  color: #d4a843;
}
.rte-btn:disabled {
  opacity: 0.25;
  cursor: default;
}
.rte-select {
  padding: 4px 8px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.04);
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.75rem;
  outline: none;
  cursor: pointer;
}
.rte-select:focus {
  border-color: rgba(212, 168, 67, 0.4);
}

/* Content Area */
.rte-content {
  min-height: 200px;
  max-height: 600px;
  overflow-y: auto;
}
.rte-fullscreen .rte-content {
  flex: 1;
  max-height: none;
}
.rte-content :deep(.tiptap) {
  padding: 16px 20px;
  min-height: 200px;
  outline: none;
  color: rgba(255, 255, 255, 0.85);
  font-size: 0.9375rem;
  line-height: 1.7;
}
.rte-content :deep(.tiptap p.is-editor-empty:first-child::before) {
  content: attr(data-placeholder);
  color: rgba(255, 255, 255, 0.2);
  pointer-events: none;
  float: left;
  height: 0;
}
.rte-content :deep(.tiptap h1) { font-size: 1.75rem; font-weight: 800; margin: 1em 0 0.5em; }
.rte-content :deep(.tiptap h2) { font-size: 1.375rem; font-weight: 700; margin: 0.8em 0 0.4em; }
.rte-content :deep(.tiptap h3) { font-size: 1.125rem; font-weight: 600; margin: 0.6em 0 0.3em; }
.rte-content :deep(.tiptap h4) { font-size: 1rem; font-weight: 600; margin: 0.5em 0 0.25em; }
.rte-content :deep(.tiptap ul),
.rte-content :deep(.tiptap ol) { padding-left: 1.5em; }
.rte-content :deep(.tiptap blockquote) {
  border-left: 3px solid rgba(212, 168, 67, 0.4);
  padding-left: 1em;
  color: rgba(255, 255, 255, 0.6);
  margin: 1em 0;
}
.rte-content :deep(.tiptap pre) {
  background: rgba(0, 0, 0, 0.3);
  border-radius: 8px;
  padding: 12px 16px;
  font-family: monospace;
  font-size: 0.875rem;
  overflow-x: auto;
}
.rte-content :deep(.tiptap img.rte-image) {
  max-width: 100%;
  border-radius: 8px;
  margin: 1em 0;
}
.rte-content :deep(.tiptap a.rte-link) {
  color: #d4a843;
  text-decoration: underline;
}
.rte-content :deep(.tiptap hr) {
  border: none;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  margin: 1.5em 0;
}
.rte-content :deep(.tiptap table) {
  width: 100%;
  border-collapse: collapse;
  margin: 1em 0;
}
.rte-content :deep(.tiptap th),
.rte-content :deep(.tiptap td) {
  border: 1px solid rgba(255, 255, 255, 0.1);
  padding: 8px 12px;
  text-align: left;
}
.rte-content :deep(.tiptap th) {
  background: rgba(255, 255, 255, 0.04);
  font-weight: 600;
}

/* Footer */
.rte-footer {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding: 6px 12px;
  border-top: 1px solid rgba(255, 255, 255, 0.06);
  background: rgba(255, 255, 255, 0.02);
}
.rte-char-count {
  font-size: 0.6875rem;
  color: rgba(255, 255, 255, 0.25);
}
</style>
