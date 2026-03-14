import js from '@eslint/js';
import globals from 'globals';

export default [
  {
    ignores: ['node_modules'],
  },
  {
    files: ['**/*.{js,mjs}'],
    languageOptions: {
      sourceType: 'module',
      globals: globals.node,
    },
    plugins: {
      js,
    },
    rules: {
      ...js.configs.recommended.rules,

      // Основные правила стиля Airbnb (выборка):
      // 1. точка с запятой обязательна:
      semi: ['error', 'always'],
      // 2. использование одинарных кавычек:
      quotes: ['error', 'single', { avoidEscape: true }],
      // 3. отступ - 2 пробела
      indent: ['error', 2, { SwitchCase: 1 }],
      // 4. max длина строки - 100 символов
      'max-len': ['error', { code: 100, ignoreUrls: true }],
      // 5. camelCase для идентификаторов
      camelcase: ['error', { properties: 'always' }],
      // 6. запрет var
      'no-var': 'error',
      // 7. предпочитать const, если переменная не переназначается
      'prefer-const': 'error',
      // 8. запрет на объявление пустых блоков
      'no-empty': ['error', { allowEmptyCatch: true }],
      // 9. запрет console.log()
      // 'no-console': ['warn', { allow: ['warn', 'error'] }],
      // 10. использование функций после объявления
      'no-use-before-define': ['error', { functions: false, classes: true }],
      // 11. использовать trailing commas
      'comma-dangle': ['error', 'always-multiline'],
      // 12. без пробелов перед функцией
      'space-before-function-paren': ['error', 'never'],
      // 13. пробелы после if и while
      'keyword-spacing': ['error', { before: true, after: true }],
      // 14. пробелы внутри фигурных скобок
      'object-curly-spacing': ['error', 'always'],
      // 15. стрелочные функции вместо function
      'prefer-arrow-callback': 'error',

      // Дополнительные правила:
      // 1. игнорирование неиспользуемых переменных с префиксом _:
      'no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    },
  },
];
