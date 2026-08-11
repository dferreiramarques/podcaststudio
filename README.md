# PodcastStudio · CICF

Editor de podcasts não-destrutivo para o Centro de Inovação Carlos Fiolhais, Maia.

## Deploy no Railway

1. Fork/push este repositório para o teu GitHub
2. No Railway: **New Project → Deploy from GitHub repo**
3. Railway detecta `package.json` automaticamente e usa `node server.js`
4. Nenhuma variável de ambiente necessária

## Desenvolvimento local

```bash
node server.js
# Abre http://localhost:3000
```

## Features
- Gravação com countdown configurável
- Edição não-destrutiva com undo ilimitado
- Visualização stereo da forma de onda
- Corte de silêncios com crossfade configurável
- Play de seleção em loop
- Fade in/out + normalização de peak
- Exportar WAV e MP3 (128kbps)
- Guardar/abrir projetos `.pcast`
- PWA — instalável em desktop e mobile
- Persistência automática via IndexedDB

## Créditos
David Marques · MIT License · Vibe coded with claude.ai
