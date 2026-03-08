# History Weaver

An interactive timeline of historical figures from the Islamic Golden Age and beyond. Browse scholars, philosophers, rulers, and scientists — filter by category, view relationships, and switch between Gregorian and Hijri calendars.

## Features

- 📅 Interactive horizontal timeline with figure bars
- 🏷️ Hierarchical category filtering (e.g. Religion → Islam → Fiqh)
- 🔗 Relationship lines between connected figures
- 🌐 Bilingual support (English / Arabic) with RTL
- 📆 Gregorian & Hijri calendar toggle
- 📖 Wikipedia links for each figure
- 📝 Data-driven via a single YAML file — easy to contribute

## Data

All figures, categories, and relation types live in [`public/data/figures.yaml`](public/data/figures.yaml). See the comments in that file for instructions on adding new people.

## Getting Started

```sh
git clone https://github.com/ahmedakef/history-weaver.git
cd history-weaver
npm i
npm run dev
```

## Tech Stack

- React + TypeScript + Vite
- Tailwind CSS + shadcn/ui
- Framer Motion
- YAML data source

## Contributing

Edit `public/data/figures.yaml` to add or update historical figures — no code changes needed. PRs welcome!
