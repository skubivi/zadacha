# Между двумя точками

Интерактивный Monte Carlo-эксперимент: средняя дистанция между двумя случайными точками в прямоугольнике. Каждый запуск действительно рассчитывает 1 000 000 пар и сравнивает оценку с аналитическим ответом.

## Локальный запуск

```bash
npm install
npm run dev
```

Проверки:

```bash
npm test -- --run
npm run typecheck
npm run build
```

## GitHub Pages

1. Создайте пустой репозиторий на GitHub и отправьте в него этот проект.
2. В `Settings → Pages → Build and deployment` выберите источник `GitHub Actions`.
3. Отправьте изменения в ветку `main` или `master`.

Workflow соберёт проект и опубликует папку `dist`. Относительный `base` в Vite позволяет сайту работать по адресу репозитория вида `https://username.github.io/repository/`.
