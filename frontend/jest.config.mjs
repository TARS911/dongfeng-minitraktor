import nextJest from 'next/jest.js'

const createJestConfig = nextJest({
  // Путь к Next.js приложению для загрузки next.config.js и .env файлов
  dir: './',
})

/** @type {import('jest').Config} */
const config = {
  // Покрытие кода
  coverageProvider: 'v8',

  // Тестовое окружение
  testEnvironment: 'jsdom',

  // Setup файлы
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],

  // Игнорировать папки
  testPathIgnorePatterns: ['/node_modules/', '/.next/'],

  // Module paths
  moduleDirectories: ['node_modules', '<rootDir>/'],

  // Module name mapper для CSS и изображений
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
    '^.+\\.module\\.(css|sass|scss)$': 'identity-obj-proxy',
    '^.+\\.(css|sass|scss)$': '<rootDir>/__mocks__/styleMock.js',
    '^.+\\.(jpg|jpeg|png|gif|webp|svg)$': '<rootDir>/__mocks__/fileMock.js',
  },
}

// createJestConfig экспортируется так, чтобы next/jest мог загрузить конфиг Next.js, который асинхронный
export default createJestConfig(config)
