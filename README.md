# Oráculo Astral

Aplicación web estática para generar cartas natales con React, TypeScript, Vite y Swiss Ephemeris en WebAssembly.

## Arquitectura

- Despliegue objetivo: GitHub Pages, sin backend.
- Motor astronómico: `@swisseph/browser`, encapsulado en `src/core/astrology`.
- Geocodificación: interfaz `GeocoderProvider`; proveedor inicial Open-Meteo en un módulo aislado.
- Zona horaria: resolución cliente-first. El geocoder devuelve IANA cuando está disponible; para coordenadas manuales se puede usar lookup local. La conversión histórica local -> UTC se gestiona con Temporal.
- PWA: manifest y service worker propios, sin plugin de build.

## Decisiones

Swiss Ephemeris queda desacoplado para poder sustituir el wrapper si aparece una limitación técnica o de licencia. La librería está bajo AGPL-3.0; un uso cerrado o comercial requiere revisar la licencia profesional de Astrodienst.

Open-Meteo se usa porque no exige clave privada en el navegador y devuelve resultados internacionales con coordenadas, divisiones administrativas y zona horaria. El resto de la aplicación no depende de Open-Meteo directamente.

La prioridad es mantener la aplicación como estática desplegable en GitHub Pages. Solo se considerará un backend mínimo si una funcionalidad crítica demuestra no poder resolverse de forma fiable en cliente.

## Scripts

```bash
npm run dev
npm run typecheck
npm run lint
npm run test
npm run build
npm run audit
```
