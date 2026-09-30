import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import { defineConfig, globalIgnores } from 'eslint/config'

// Core no-unused-vars can't see JSX usage (<motion.div>, <Icon />) without
// eslint-plugin-react, so mark JSX tag identifiers as used ourselves.
const local = {
  rules: {
    'jsx-uses-vars': {
      create(context) {
        return {
          JSXOpeningElement(node) {
            let name = node.name
            const isMember = name.type === 'JSXMemberExpression'
            while (name.type === 'JSXMemberExpression') name = name.object
            if (name.type !== 'JSXIdentifier') return
            if (!isMember && /^[a-z]/.test(name.name)) return // intrinsic element like <div>
            context.sourceCode.markVariableAsUsed(name.name, node)
          },
        }
      },
    },
  },
}

export default defineConfig([
  globalIgnores(['dist', 'dist-ssr', 'server']),
  {
    files: ['**/*.{js,jsx}'],
    extends: [
      js.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parserOptions: {
        ecmaVersion: 'latest',
        ecmaFeatures: { jsx: true },
        sourceType: 'module',
      },
    },
    plugins: { local },
    rules: {
      'local/jsx-uses-vars': 'error',
      'no-unused-vars': ['error', { varsIgnorePattern: '^[A-Z_]' }],
    },
  },
])
