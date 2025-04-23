<template>
  <div ref="div"/>
</template>
<script>
import { markRaw } from 'vue'
import { default as namumarkRegister } from './namu/vs/languages/namumark'
import { QuickAccess } from './namu/toolbar/quickaccess'
import editorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker'

export default {
  pluginInfo: {
    name: 'thetree-monaco',
    label: '편집기',
    buttons: [
      {
        name: 'bold',
        label: '굵게'
      },
      {
        name: 'italic',
        label: '기울임'
      },
      {
        name: 'strike',
        label: '취소선'
      },
      {
        name: 'link',
        label: '링크'
      },
      {
        name: 'file',
        label: '파일'
      },
      {
        name: 'footnote',
        label: '각주'
      },
      {
        name: 'include',
        label: '틀'
      }
    ]
  },
  data() {
    return {
      editor: null,
      monaco: null,
      quickaccess: null
    }
  },
  computed: {
    theme() {
      return this.$store.state.currentTheme === 'dark' ? 'vs-dark' : 'vs'
    }
  },
  watch: {
    theme(newValue) {
      this.monaco.editor.setTheme(newValue)
    }
  },
  async mounted() {
    const monaco = await import('monaco-editor')

    namumarkRegister(monaco)

    self.MonacoEnvironment = {
      getWorker(_, label) {
        return new editorWorker()
      }
    }

    this.monaco = markRaw(monaco)
    this.editor = markRaw(monaco.editor.create(this.$refs.div, {
      language: 'namumark',
      automaticLayout: true,
      wordWrap: true,
      renderWhitespace: 'all',
      fontFamily: 'D2Coding, Consolas, "나눔고딕코딩", "Courier New", monospace',
      value: this.$store.state.viewData.content,
      minimap: {
        enabled: false
      },
      theme: this.theme
    }))

    this.quickaccess = new QuickAccess(this.editor, this.monaco)
  },
  methods: {
    getValue() {
      return this.editor.getValue()
    },
    setValue(value) {
      this.editor.setValue(value)
    },
    onButtonClick(name) {
      this.quickaccess.apply({
        bold: { bracket: `'''` },
        italic: { bracket: `''` },
        strike: { bracket: `~~` },
        link: {
          bracket: {
            open: `[[`,
            close: `]]`
          }
        },
        file: {
          bracket: {
            open: `[[파일:`,
            close: `]]`
          }
        },
        footnote: {
          bracket: {
            open: `[* `,
            close: `]`
          }
        },
        include: {
          bracket: {
            open: `[include(`,
            close: `)]`
          }
        }
      }[name])
    }
  }
}
</script>
<style scoped>
div {
  height: 30rem;
  width: 100%;
  --vscode-editorCodeLens-lineHeight: 16px;
  --vscode-editorCodeLens-fontSize: 12px;
  --vscode-editorCodeLens-fontFeatureSettings: "liga" off, "calt" off;
}
</style>