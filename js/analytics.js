/* =====================================================================
   GOOGLE ANALYTICS 4 + MONITOR DE EVENTOS
   ---------------------------------------------------------------------
   - Carga gtag.js SOLO si el ID tiene formato G-... y no es el marcador.
   - DEBUG_MODE true  -> gtag('config', ID, { debug_mode: true })
     DEBUG_MODE false -> gtag('config', ID)  (sin debug_mode)
   - Expone:
       Analitica.enviarEvento(nombre, parametros)
       Analitica.enviarEventoYNavegar(nombre, parametros, url)
       Analitica.fijarPropiedadesUsuario({ tipo_cliente: "..." })
   - Dibuja el "Monitor de eventos" (ayuda didáctica) en todas las páginas.
   No edites este archivo: la configuración está en js/config.js
   ===================================================================== */
(function () {
  "use strict";

  var cfg = window.TIENDA_CONFIG || {};
  var ID = String(cfg.GA_MEASUREMENT_ID || "").trim().toUpperCase();
  var DEBUG = cfg.DEBUG_MODE === true;
  var MARCADOR = "G-XXXXXXXXXX";
  var ID_VALIDO = /^G-[A-Z0-9]{4,}$/.test(ID) && ID !== MARCADOR;

  var CLAVE_EVENTOS = "cervo_monitor_eventos";   // sessionStorage
  var CLAVE_ORIGEN = "cervo_origen";             // sessionStorage
  var CLAVE_PLEGADO = "cervo_monitor_plegado";   // localStorage
  var CLAVE_CARRITO = "cervo_carrito";           // localStorage
  var MAX_EVENTOS = 12;

  /* ---------- 1. gtag ---------- */
  window.dataLayer = window.dataLayer || [];
  function gtag() { window.dataLayer.push(arguments); }
  window.gtag = gtag;

  if (ID_VALIDO) {
    var s = document.createElement("script");
    s.async = true;
    s.src = "https://www.googletagmanager.com/gtag/js?id=" + encodeURIComponent(ID);
    document.head.appendChild(s);
    gtag("js", new Date());
    if (DEBUG) {
      gtag("config", ID, { debug_mode: true });
    } else {
      gtag("config", ID);
    }
  }

  /* ---------- 2. Almacenamiento seguro ---------- */
  function ssGet(k) { try { return sessionStorage.getItem(k); } catch (e) { return null; } }
  function ssSet(k, v) { try { sessionStorage.setItem(k, v); } catch (e) { } }
  function lsGet(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
  function lsSet(k, v) { try { localStorage.setItem(k, v); } catch (e) { } }

  /* ---------- 3. Origen de la visita (primera página de la sesión) ---------- */
  (function registrarOrigen() {
    if (ssGet(CLAVE_ORIGEN)) return;
    var p = new URLSearchParams(window.location.search);
    var src = p.get("utm_source"), med = p.get("utm_medium"), camp = p.get("utm_campaign");
    var texto = src
      ? src + " / " + (med || "(sin medium)") + " · " + (camp || "(sin campaign)")
      : "directo (sin UTM)";
    ssSet(CLAVE_ORIGEN, texto);
  })();

  /* ---------- 4. Registro de eventos para el monitor ---------- */
  var formatoCOP = new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 });

  function leerEventos() {
    try { return JSON.parse(ssGet(CLAVE_EVENTOS)) || []; } catch (e) { return []; }
  }

  // Quita funciones (event_callback) para poder guardar y mostrar los parámetros
  function limpiar(params) {
    try { return JSON.parse(JSON.stringify(params || {})); } catch (e) { return {}; }
  }

  function resumen(nombre, p) {
    var partes = [];
    if (nombre === "page_view") return (p.page_title || "") + " · " + (p.page_location || "");
    if (nombre === "user_properties") {
      return Object.keys(p).map(function (k) { return k + " = " + p[k]; }).join(", ");
    }
    if (p.item_list_name) partes.push("lista: " + p.item_list_name);
    if (p.promotion_id) partes.push("promo: " + p.promotion_id);
    if (p.transaction_id) partes.push("pedido " + p.transaction_id);
    if (typeof p.value === "number") partes.push("value " + formatoCOP.format(p.value));
    if (typeof p.shipping === "number") partes.push("envío " + formatoCOP.format(p.shipping));
    if (p.shipping_tier) partes.push(p.shipping_tier);
    if (p.payment_type) partes.push("pago: " + p.payment_type);
    if (p.tipo_cliente) partes.push("cliente " + p.tipo_cliente);
    if (p.coupon) partes.push("cupón " + p.coupon);
    if (Array.isArray(p.items)) {
      if (p.items.length === 1) {
        var it = p.items[0];
        partes.push(it.item_name + " ×" + it.quantity + " a " + formatoCOP.format(it.price));
      } else {
        var unidades = p.items.reduce(function (s, i) { return s + (i.quantity || 0); }, 0);
        partes.push(p.items.length + " productos (" + unidades + " u.)");
      }
    }
    return partes.join(" · ");
  }

  function registrar(nombre, params) {
    var p = limpiar(params);
    var lista = leerEventos();
    lista.unshift({
      hora: new Date().toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit", second: "2-digit", hourCycle: "h23" }),
      nombre: nombre,
      resumen: resumen(nombre, p),
      params: p
    });
    ssSet(CLAVE_EVENTOS, JSON.stringify(lista.slice(0, MAX_EVENTOS)));
    pintarEventos();
  }

  /* ---------- 5. API pública ---------- */
  function enviarEvento(nombre, params) {
    var p = Object.assign({ currency: "COP" }, params || {});
    gtag("event", nombre, p);
    registrar(nombre, p);
  }

  function enviarEventoYNavegar(nombre, params, url) {
    var navegado = false;
    function ir() {
      if (navegado) return;
      navegado = true;
      window.location.href = url;
    }
    var p = Object.assign({}, params || {}, { event_callback: ir, event_timeout: 1000 });
    enviarEvento(nombre, p);
    // Respaldo: si GA no confirma (bloqueador, red lenta), navega a los 1200 ms
    setTimeout(ir, 1200);
    // Sin ID de medición no hay gtag.js que llame al callback: navega de inmediato
    if (!ID_VALIDO) setTimeout(ir, 0);
  }

  function fijarPropiedadesUsuario(props) {
    gtag("set", "user_properties", props);
    registrar("user_properties", props);
  }

  window.Analitica = {
    idValido: ID_VALIDO,
    enviarEvento: enviarEvento,
    enviarEventoYNavegar: enviarEventoYNavegar,
    fijarPropiedadesUsuario: fijarPropiedadesUsuario
  };

  // page_view: GA4 lo envía solo con gtag('config'); aquí lo mostramos en el monitor
  registrar("page_view", { page_title: document.title, page_location: window.location.pathname + window.location.search });

  /* ---------- 6. Monitor de eventos ---------- */
  var listaEl = null;

  function el(tag, clase, texto) {
    var n = document.createElement(tag);
    if (clase) n.className = clase;
    if (texto !== undefined) n.textContent = texto;
    return n;
  }

  function pintarEventos() {
    if (!listaEl) return;
    listaEl.innerHTML = "";
    var eventos = leerEventos();
    if (!eventos.length) {
      listaEl.appendChild(el("li", "monitor-vacio", "Aún no hay eventos en esta sesión."));
      return;
    }
    eventos.forEach(function (ev) {
      var li = el("li", "monitor-evento" + (ev.nombre === "purchase" ? " es-compra" : ""));
      var det = el("details");
      var sum = el("summary");
      sum.appendChild(el("span", "monitor-hora", ev.hora));
      sum.appendChild(el("code", "monitor-nombre", ev.nombre));
      sum.appendChild(el("span", "monitor-resumen", ev.resumen));
      det.appendChild(sum);
      det.appendChild(el("pre", "monitor-json", JSON.stringify(ev.params, null, 2)));
      li.appendChild(det);
      listaEl.appendChild(li);
    });
  }

  function borrarCookiesGA() {
    var nombres = document.cookie.split(";")
      .map(function (c) { return c.split("=")[0].trim(); })
      .filter(function (n) { return n.indexOf("_ga") === 0; });
    var host = window.location.hostname;
    var partes = host.split(".");
    var dominios = ["", host, "." + host];
    for (var i = 1; i < partes.length; i++) {
      var d = partes.slice(i).join(".");
      dominios.push(d, "." + d);
    }
    var caduca = "=; expires=Thu, 01 Jan 1970 00:00:00 GMT; max-age=0; path=/";
    nombres.forEach(function (n) {
      dominios.forEach(function (dom) {
        document.cookie = n + caduca + (dom ? "; domain=" + dom : "");
      });
    });
  }

  function simularNuevoVisitante() {
    borrarCookiesGA();
    try { localStorage.removeItem(CLAVE_CARRITO); } catch (e) { }
    try { sessionStorage.clear(); } catch (e) { }
    window.location.href = "index.html";
  }

  function construirMonitor() {
    var plegado = lsGet(CLAVE_PLEGADO) === "1";
    var body = document.body;
    body.classList.add("con-monitor");

    var aside = el("aside", "monitor");
    aside.id = "monitor";
    aside.setAttribute("aria-label", "Monitor de eventos de Google Analytics 4");

    var cab = el("div", "monitor-cabecera");
    cab.appendChild(el("strong", "monitor-titulo", "Monitor de eventos GA4"));
    var toggle = el("button", "monitor-toggle");
    toggle.type = "button";
    cab.appendChild(toggle);
    aside.appendChild(cab);

    var cuerpo = el("div", "monitor-cuerpo");
    cuerpo.id = "monitor-cuerpo";
    toggle.setAttribute("aria-controls", "monitor-cuerpo");

    var estado = el("p", "monitor-estado " + (ID_VALIDO ? "ok" : "error"),
      ID_VALIDO
        ? "Conectado a " + ID + (DEBUG ? " · modo depuración" : "")
        : "Sin ID de medición: los eventos solo se muestran aquí. Edita js/config.js.");
    cuerpo.appendChild(estado);

    var origen = el("div", "monitor-origen");
    origen.appendChild(el("span", "monitor-etiqueta", "Origen de la visita"));
    origen.appendChild(el("span", "monitor-valor", ssGet(CLAVE_ORIGEN) || "directo (sin UTM)"));
    cuerpo.appendChild(origen);

    cuerpo.appendChild(el("p", "monitor-etiqueta", "Últimos " + MAX_EVENTOS + " eventos (toca uno para ver sus parámetros)"));
    listaEl = el("ol", "monitor-lista");
    cuerpo.appendChild(listaEl);

    var reset = el("button", "monitor-reset", "Simular nuevo visitante");
    reset.type = "button";
    reset.addEventListener("click", simularNuevoVisitante);
    cuerpo.appendChild(reset);
    aside.appendChild(cuerpo);

    function aplicar(p) {
      aside.classList.toggle("plegado", p);
      body.classList.toggle("monitor-plegado", p);
      toggle.textContent = p ? "Mostrar" : "Ocultar";
      toggle.setAttribute("aria-expanded", p ? "false" : "true");
    }
    toggle.addEventListener("click", function () {
      plegado = !plegado;
      lsSet(CLAVE_PLEGADO, plegado ? "1" : "0");
      aplicar(plegado);
    });
    aplicar(plegado);

    body.appendChild(aside);
    pintarEventos();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", construirMonitor);
  } else {
    construirMonitor();
  }
})();
