# Cervo · Tienda ficticia de ropa deportiva para el laboratorio de GA4

Sitio académico de simulación para el laboratorio de **Google Analytics 4** del Diplomado en E-commerce y Negocios Internacionales Digitales.

- Solo HTML, CSS y JavaScript puros: sin frameworks, sin npm y sin compilación.
- No tiene servidor, base de datos ni pagos reales.
- No pide ni guarda correo, teléfono, documento ni datos de tarjeta.
- Se publica gratis en Vercel desde GitHub.

---

## 1. Lo único que debes editar: `js/config.js`

```js
window.TIENDA_CONFIG = {
  GA_MEASUREMENT_ID: "G-XXXXXXXXXX",  // ⬅️ pega aquí tu ID de medición
  DEBUG_MODE: true                     // true = ver eventos en DebugView
};
```

1. En GA4 ve a **Administrar › Flujos de datos › (tu flujo web)** y copia el **ID de medición** (empieza por `G-`).
2. Reemplaza `G-XXXXXXXXXX` por tu ID. Conserva las comillas.
3. Guarda y sube el archivo a GitHub. Vercel vuelve a publicar solo en unos segundos.

Mientras el ID sea `G-XXXXXXXXXX`, la tienda **no carga Google Analytics**. Los eventos solo se ven en el Monitor de eventos, que muestra un aviso rojo.

Con `DEBUG_MODE: true` los eventos aparecen en **GA4 › Administrar › DebugView**. Con `false` se envían de forma normal (sin `debug_mode`).

---

## 2. Estructura de archivos

```
Cervo/
├── index.html          Catálogo y banner del cupón BIENVENIDA10
├── producto.html       Detalle (producto.html?id=CRV-001)
├── carrito.html        Carrito y cupón
├── checkout.html       Checkout en 2 pasos (Envío y Pago simulado)
├── gracias.html        Confirmación y evento purchase
├── css/estilos.css     Estilos (inspirados en Apple Design)
├── js/config.js        ⬅️ ID de medición (único archivo editable)
├── js/productos.js     Los 8 productos
├── js/carrito.js       Carrito en localStorage, cupón, tarifas e ítems GA4
├── js/analytics.js     Carga de gtag.js, funciones de envío y monitor de eventos
├── js/inicio.js        Lógica de index.html
├── js/producto.js      Lógica de producto.html
├── js/carrito-pagina.js Lógica de carrito.html
├── js/checkout.js      Lógica de checkout.html
├── js/gracias.js       Lógica de gracias.html
└── README.md
```

## 3. Catálogo

| ID | Producto | Categoría | Precio (COP) |
|---|---|---|---|
| CRV-001 | Camiseta Aero Dry | Camisetas | 89.000 |
| CRV-002 | Camiseta Manga Larga Termo | Camisetas | 119.000 |
| CRV-003 | Leggings Pulse | Leggings | 149.000 |
| CRV-004 | Pantaloneta Stride 7" | Pantalonetas | 99.000 |
| CRV-005 | Top Deportivo Core | Tops | 109.000 |
| CRV-006 | Chaqueta Cortavientos Vento | Chaquetas | 259.000 |
| CRV-007 | Jogger Flow | Pantalones | 179.000 |
| CRV-008 | Medias Run Pack x3 | Accesorios | 45.000 |

- **Cupón:** `BIENVENIDA10` (10 % de descuento). Se aplica en el carrito o con un clic en el banner del inicio.
- **Envío (COP):** Nacional Estándar 12.000 (gratis desde 150.000 en productos), Nacional Express 25.000, Internacional Estándar 95.000, Internacional Express 160.000.
- **Países:** Colombia (Nacional), México, Estados Unidos, España, Perú, Chile, Argentina y Ecuador (Internacional).
- **Pagos simulados:** Tarjeta de crédito, PSE, Nequi y PayPal.

---

## 4. Contrato de medición

Todos los eventos llevan `currency: "COP"`. Cada ítem lleva `item_id`, `item_name`, `item_brand` ("Cervo"), `item_category`, `price`, `quantity` e `index`. Con cupón activo, `price` es el precio unitario con descuento, `discount` es el descuento por unidad y se agrega `coupon`.

| Evento | Cuándo se envía | Parámetros principales |
|---|---|---|
| `view_item_list` | Al cargar el catálogo | `item_list_id: "catalogo_principal"`, `item_list_name`, `items` |
| `view_promotion` | Al mostrarse el banner del cupón | `promotion_id: "BIENVENIDA10"`, `promotion_name`, `creative_name`, `creative_slot`, `items` |
| `select_promotion` | Clic en el banner (aplica el cupón y va al carrito) | Los mismos de `view_promotion` |
| `select_item` | Clic en un producto, antes de navegar | `item_list_id`, `item_list_name`, `items` |
| `view_item` | Al abrir el detalle | `value`, `items` |
| `add_to_cart` | Al agregar o aumentar unidades | `value`, `items` (quantity = unidades agregadas) |
| `remove_from_cart` | Al quitar o disminuir unidades | `value`, `items` |
| `view_cart` | Al abrir el carrito con productos | `value`, `coupon` (si existe), `items` |
| `begin_checkout` | Al abrir checkout.html | `value`, `coupon`, `items` |
| `add_shipping_info` | Clic en "Continuar al pago" | `value`, `coupon`, `items`, `shipping_tier` |
| `add_payment_info` | Clic en "Pagar (simulado)" | `value`, `coupon`, `payment_type`, `items` |
| `purchase` | Al cargar gracias.html (una vez por pedido) | `transaction_id`, `affiliation`, `value`, `shipping`, `coupon`, `tipo_cliente`, `items` |

- `shipping_tier` toma uno de estos valores: `Nacional - Estándar`, `Nacional - Express`, `Internacional - Estándar`, `Internacional - Express`.
- El `value` de `purchase` es el total de productos con descuento, sin envío (suma de `price × quantity`).
- `gtag('set', 'user_properties', { tipo_cliente })` se envía al confirmar el envío y otra vez antes de `purchase`.
- El pedido se guarda en `sessionStorage` antes de ir a gracias.html y se marca como enviado después de `purchase`. Recargar la página no lo repite. El carrito se vacía tras la compra.

### Configuración recomendada en GA4

En **Administrar › Definiciones personalizadas** crea:

1. Dimensión de **evento** `tipo_cliente` (parámetro `tipo_cliente`).
2. Dimensión de **usuario** `tipo_cliente` (propiedad `tipo_cliente`).

Así podrás segmentar compras nacionales e internacionales en los informes.

---

## 5. Monitor de eventos (ayuda didáctica)

Es el panel oscuro de la derecha (en celulares queda abajo). Muestra:

- **Estado:** en verde "Conectado a G-… · modo depuración", o en rojo "Sin ID de medición…".
- **Origen de la visita:** `utm_source / utm_medium · utm_campaign` de la primera página de la sesión, o "directo (sin UTM)".
- **Los últimos 12 eventos**, con hora, nombre y resumen. Toca uno para ver todos sus parámetros.
- **Simular nuevo visitante:** borra las cookies `_ga*`, el carrito y la sesión, y vuelve al inicio.

El botón **Ocultar / Mostrar** pliega el panel y recuerda tu elección.

Enlace de prueba con UTM (cambia el dominio por el tuyo):

```
https://tu-proyecto.vercel.app/?utm_source=instagram&utm_medium=social&utm_campaign=lanzamiento
```

---

## 6. Publicar gratis: GitHub + Vercel (desde el navegador)

### Subir a GitHub
1. Entra a [github.com](https://github.com) e inicia sesión.
2. Arriba a la derecha, **+ › New repository**. Nómbralo, por ejemplo, `cervo-tienda`, déjalo **Public** y pulsa **Create repository**.
3. En la página del repositorio vacío, haz clic en **uploading an existing file**.
4. Descomprime el .zip en tu computador, abre la carpeta `Cervo` y **arrastra todo su contenido** (index.html, las carpetas `css` y `js`, los demás .html y README.md). `index.html` debe quedar en la raíz del repositorio, no dentro de otra carpeta.
5. Pulsa **Commit changes**.

### Publicar en Vercel
1. Entra a [vercel.com](https://vercel.com) y elige **Continue with GitHub**.
2. Pulsa **Add New… › Project** e **Import** el repositorio `cervo-tienda`.
3. En **Framework Preset** elige **Other**. No cambies Build Command ni Output Directory (déjalos vacíos) y Root Directory en `./`.
4. Pulsa **Deploy**. En menos de un minuto tendrás una dirección como `https://cervo-tienda.vercel.app`.

### Actualizar el ID de medición
En GitHub abre `js/config.js`, pulsa el ícono del lápiz, pega tu ID, y pulsa **Commit changes**. Vercel publica la nueva versión automáticamente.

---

## 7. Solución de problemas

- **No veo eventos en DebugView:** revisa que el ID esté bien escrito, que `DEBUG_MODE` sea `true` y desactiva bloqueadores de anuncios (bloquean Google Analytics).
- **El monitor sigue en rojo:** el ID todavía es `G-XXXXXXXXXX` o no empieza por `G-`.
- **Quiero empezar de cero:** usa **Simular nuevo visitante** en el monitor.
- **Probar en local:** abre la carpeta con un servidor local (por ejemplo la extensión Live Server de VS Code). Al abrir el archivo directamente (`file://`) algunas funciones del navegador se limitan.
