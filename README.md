# Jaime Safe Food — Prototipo Expo

App privada familiar para iPhone orientada a analizar ingredientes, productos, platos y menús con un criterio conservador para alergias alimentarias.

## Importante
Este prototipo no sustituye diagnóstico, pauta médica ni revisión de etiquetado. Ante duda: no consumir.

## Cómo arrancar

1. Instala Node.js desde https://nodejs.org
2. Instala Expo Go en el iPhone.
3. En Terminal:

```bash
npm install
npx expo start
```

4. Escanea el QR con Expo Go.

## Siguiente integración real

La llamada a IA está simulada en `src/services/analyzeImage.ts`.
Para producción, no pongas nunca la API key de OpenAI dentro de la app.
Crea un backend/serverless function y llama desde la app a tu backend.
