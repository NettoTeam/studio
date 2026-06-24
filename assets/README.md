# Pasta de assets (origem das imagens)

Aqui você coloca as imagens **originais**. Depois roda `node scripts/sync-assets.mjs`,
que otimiza tudo pra `public/library/` e reescreve `lib/catalog.json` automaticamente.

## Como organizar

Cada **subpasta** vira uma chave de "sentimento" que a IA pode escolher pro fundo dos cards:

```
assets/
  coach/        ← fotos da CAPA (você / a marca) — pool especial usado na capa do carrossel
  treino/       ← fotos com clima de "treino"
  foco/         ← clima de "foco"
  superacao/    ← clima de "superação"
  forca/  leveza/  descanso/  alimentacao/  conquista/  rotina/  ...
```

- Os nomes das pastas podem ser o que você quiser — eles aparecem no menu de imagens do editor.
- Formatos aceitos: `.jpg`, `.jpeg`, `.png`, `.webp`.
- A pasta **coach** é a única com papel especial: o app sorteia dela a foto da CAPA.

Depois é só rodar:

```bash
node scripts/sync-assets.mjs
```
