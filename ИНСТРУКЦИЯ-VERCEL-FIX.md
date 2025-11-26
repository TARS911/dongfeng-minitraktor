# 🚀 ИНСТРУКЦИЯ ПО ИСПРАВЛЕНИЮ VERCEL DEPLOYMENT

## ❌ Текущая ошибка

```
Running "install" command: `cd frontend && npm install`...
sh: line 1: cd: frontend: No such file or directory
Error: Command "cd frontend && npm install" exited with 1
```

## 🔍 Причина

В **Vercel Dashboard** в настройках проекта прописаны старые команды:
- Install Command: `cd frontend && npm install`
- Build Command: `cd frontend && npm run build`

Но Vercel не может выполнить `cd frontend`, потому что **Root Directory** не настроен.

---

## ✅ РЕШЕНИЕ

### ВАРИАНТ 1: Настроить Root Directory (РЕКОМЕНДУЕТСЯ)

#### Шаг 1: Открыть настройки проекта в Vercel

1. Перейти: https://vercel.com/dashboard
2. Выбрать проект **dongfeng-minitraktor**
3. Перейти в **Settings** (вкладка вверху)

#### Шаг 2: Настроить Root Directory

1. В меню слева выбрать **General**
2. Найти секцию **Root Directory**
3. Нажать **Edit**
4. Указать: `frontend`
5. Нажать **Save**

#### Шаг 3: Исправить Build Commands

1. В меню слева выбрать **General** (или **Build & Development Settings**)
2. Найти секцию **Build & Development Settings**
3. Нажать **Override** для следующих параметров:

**Install Command:**
```
npm install
```
(убрать `cd frontend &&`)

**Build Command:**
```
npm run build
```
(убрать `cd frontend &&`)

**Output Directory:**
```
.next
```

4. Нажать **Save**

#### Шаг 4: Редеплой

1. Перейти в **Deployments**
2. Найти последний деплой (failed)
3. Нажать **⋮** (три точки) → **Redeploy**
4. Или сделать новый коммит и пуш

---

### ВАРИАНТ 2: Убрать Root Directory (АЛЬТЕРНАТИВА)

Если по какой-то причине ВАРИАНТ 1 не подходит:

#### Шаг 1: Убрать Root Directory

1. В Vercel Dashboard → Settings → General
2. Root Directory должен быть **пустым** (не указан)
3. Save

#### Шаг 2: Вернуть команды с `cd frontend`

**Install Command:**
```
cd frontend && npm install
```

**Build Command:**
```
cd frontend && npm run build
```

**Output Directory:**
```
frontend/.next
```

#### Шаг 3: Проверить структуру проекта

Убедиться, что в корне репозитория есть директория `frontend/`:

```
dongfeng-minitraktor/
├── frontend/           ← ДОЛЖНА БЫТЬ ЗДЕСЬ
│   ├── app/
│   ├── components/
│   ├── package.json
│   └── next.config.js
├── scripts/
├── vercel.json
└── README.md
```

---

## 🎯 Рекомендация

**Используй ВАРИАНТ 1** (Root Directory = `frontend`)

### Преимущества:
- ✅ Чище и понятнее
- ✅ Vercel автоматически работает в директории `frontend`
- ✅ Не нужно писать `cd frontend` в каждой команде
- ✅ Следует best practices Next.js + Vercel

---

## 📋 Итоговая конфигурация (ВАРИАНТ 1)

### Vercel Dashboard Settings:

```
Root Directory: frontend
Install Command: npm install
Build Command: npm run build
Output Directory: .next
Framework Preset: Next.js
```

### vercel.json (уже настроен правильно):

```json
{
  "buildCommand": "npm run build",
  "installCommand": "npm install",
  "framework": "nextjs",
  "github": {
    "silent": true
  }
}
```

---

## ✅ Проверка после исправления

После редеплоя в логах должно быть:

```
✅ Running "install" command: npm install
✅ Running "build" command: npm run build
✅ Build completed successfully
```

Без ошибок "No such file or directory"!

---

**Последнее обновление:** 2025-11-27
**Автор:** Claude Code
