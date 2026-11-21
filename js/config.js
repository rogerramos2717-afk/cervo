/* =====================================================================
   CONFIGURACIÓN DE LA TIENDA CERVO
   ---------------------------------------------------------------------
   Este es el ÚNICO archivo que necesitas editar.

   ¿Dónde consigo el ID de medición?
   1. Entra a Google Analytics 4 > Administrar (rueda dentada).
   2. En "Propiedad", abre "Flujos de datos" y elige tu flujo web.
   3. Copia el "ID DE MEDICIÓN". Empieza por G- (por ejemplo G-AB12CD34EF).

   ¿Dónde lo pego?
   4. Reemplaza G-XXXXXXXXXX en la línea GA_MEASUREMENT_ID de abajo.
      Conserva las comillas. Ejemplo:  GA_MEASUREMENT_ID: "G-AB12CD34EF",
   5. Guarda el archivo y súbelo de nuevo a GitHub. Vercel publica solo.

   DEBUG_MODE
   - true  : los eventos aparecen en GA4 > Administrar > DebugView
             (recomendado durante el laboratorio).
   - false : la tienda envía los eventos sin el parámetro debug_mode.

   Mientras el ID sea G-XXXXXXXXXX no se carga Google Analytics y los
   eventos solo se ven en el "Monitor de eventos" de la derecha.
   ===================================================================== */
window.TIENDA_CONFIG = {
  // ⬇️ Pega aquí tu ID de medición de GA4, entre comillas.
  GA_MEASUREMENT_ID: "G-XXXXXXXXXX",

  // ⬇️ true durante el laboratorio (DebugView); false para envío normal.
  DEBUG_MODE: true
};
