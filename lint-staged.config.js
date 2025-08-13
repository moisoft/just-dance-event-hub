module.exports = {
  // Frontend files
  'frontend/src/**/*.{js,jsx,ts,tsx}': [
    'cd frontend && npm run lint:fix',
    'cd frontend && npm run format',
    'cd frontend && npm run type-check'
  ],
  
  // Backend files
  'backend/src/**/*.{js,ts}': [
    'cd backend && npm run lint:fix',
    'cd backend && npm run format',
    'cd backend && npm run type-check'
  ],
  
  // Error middleware app files
  'error-middleware-app/src/**/*.{js,ts}': [
    'cd error-middleware-app && npm run lint:fix',
    'cd error-middleware-app && npm run format'
  ],
  
  // JSON files
  '**/*.json': [
    'prettier --write'
  ],
  
  // Markdown files
  '**/*.md': [
    'prettier --write'
  ],
  
  // YAML files
  '**/*.{yml,yaml}': [
    'prettier --write'
  ],
  
  // CSS/SCSS files
  '**/*.{css,scss,sass}': [
    'prettier --write'
  ]
};