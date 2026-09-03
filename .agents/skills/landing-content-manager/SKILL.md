---
name: landing-content-manager
description: When the user wants to update, add, edit, list, or remove events, workshops, fairs (ferias y talleres) or gallery photos (clientas, ferias en Cartagena, talleres de tejido, el taller & Shirley) on the Nénufar Landing Page. Also use when the user mentions "actualizar ferias", "agregar feria", "nuevo taller", "actualizar galeria", "agregar fotos a la galeria", "fotos de clientas", or "modificar landing". STRICT GUARDRAIL: Operates EXCLUSIVELY on the Landing Page. Prohibits modifying the jewelry catalog (/shop), products, inventory, prices, orders, or carts.
metadata:
  version: 1.0.0
---

# Landing Content Manager (Ferias, Eventos & Galería)

Esta skill define la gestión técnica y operativa de los contenidos dinámicos de la **Landing Page de Nénufar** (Cartagena de Indias).

## 🛑 Guardrails Inviolables (Reglas de Alcance)

1. **Exclusividad en la Landing Page:**
   - Todo cambio realizado por esta skill afecta **única y exclusivamente** a la página de inicio (`pages` con `slug: 'home'`) y la colección de eventos de la landing (`events`).
2. **Prohibición Total sobre el Catálogo de Tienda (`/shop`):**
   - **Nunca** alterar la colección `products`, precios (`priceInCOP`), inventario (`inventory`), categorías de tienda ni la configuración de pedidos (`orders`) o carritos (`carts`).
3. **Persistencia Directa en PostgreSQL & Local API:**
   - La Landing Page se alimenta de PostgreSQL con respaldo estático. Toda modificación debe persistirse en la base de datos para que sea visible en producción y en `/admin`.
4. **Imágenes en Formato WebP Local:**
   - Las fotografías de galería deben residir preferentemente en `/media/` o URLs de Payload Media (`/api/media/file/...-800x1000.webp`) para carga ultrarrápida sin dependencias externas.

---

## 📅 1. Gestión de Ferias & Talleres (`events`)

El bloque `upcomingEvents` de la Landing Page consume directamente los documentos de la colección `events` de Payload CMS.

### Estructura de un Evento:
- `title` (string, requerido): Nombre del taller o feria (ej. *"Feria Artesanal Getsemaní"*).
- `date` (ISO Date, requerido): Fecha de inicio del evento (ej. `"2026-09-20T10:00:00-05:00"`).
- `endDate` (ISO Date, opcional): Fecha de culminación.
- `location` (string, requerido): Ubicación física en Cartagena (ej. *"Plaza de San Diego, Centro Histórico"*).
- `description` (string, opcional): Resumen de lo que Shirley expondrá o enseñará.
- `type` (`'taller'` | `'feria'`, por defecto `'taller'`).

### Herramienta CLI Rápida:
```bash
# Listar ferias y talleres activos en la landing
pnpm tsx scripts/manage-landing-events.ts list

# Publicar un nuevo evento o feria en la landing
pnpm tsx scripts/manage-landing-events.ts add \
  --title "Feria del Caribe San Diego" \
  --date "2026-10-05T09:00:00-05:00" \
  --location "Plaza San Diego, Cartagena" \
  --type "feria" \
  --description "Exhibición de Okamas ceremoniales y joyas tejidas a mano por Shirley."

# Eliminar un evento de la landing por su ID
pnpm tsx scripts/manage-landing-events.ts delete --id 5
```

---

## 📸 2. Gestión de la Galería de la Landing (`gallery`)

La Galería de la Landing Page es un carrusel fotográfico con pestañas de momentos reales. Vive en el bloque `gallery` de la página Home (ID: 3 en PostgreSQL).

### Los 4 Tabs Canónicos:
1. `clientas` — **Nuestras Clientas** (Fotos de compradoras luciendo aretes, pulseras y collares).
2. `ferias` — **Ferias en Cartagena** (Shirley en eventos presenciales y pop-ups).
3. `talleres` — **Talleres de Tejido** (Clases en vivo y momentos de creación comunitaria).
4. `taller` — **El Taller & Shirley** (El proceso íntimo del tejido paciente en micro-mostacillas).

### Herramienta CLI Rápida:
```bash
# Listar todas las fotos organizadas por pestaña
pnpm tsx scripts/manage-landing-gallery.ts list

# Agregar una nueva foto a una pestaña específica de la landing
pnpm tsx scripts/manage-landing-gallery.ts add \
  --tab "clientas" \
  --imageUrl "/api/media/file/colombia-aretes-6-800x1000.webp" \
  --title "Clienta en Cartagena luciendo aretes de autor"

# Eliminar una foto de un tab por su índice
pnpm tsx scripts/manage-landing-gallery.ts remove \
  --tab "clientas" \
  --index 2
```

---

## 🤖 3. Uso desde el Bot de Telegram de Shirley

Shirley puede actualizar la landing directamente desde su chat privado de Telegram mediante el bot de gestión:
- *"Publica que el próximo sábado 14 de octubre estaré en la Feria de Getsemaní de 10am a 6pm"* → Ejecuta `publicarEvento`.
- *"¿Cuáles ferias o talleres tenemos publicados en la landing?"* → Ejecuta `listarEventos`.
- *(Con foto adjunta)* *"Agrega esta foto al carrusel de clientas en la landing"* → Ejecuta `agregarFotoGaleriaLanding`.
