/* ============================================================
   BOOT COMPARTIDO — Diseño Web II
   Único punto de arranque de la página. Hace dos cosas antes de
   pintar la interfaz:
     1) Aplica el tema guardado (evita el parpadeo claro/oscuro).
     2) Identifica el dispositivo (laptop vs. celular/tablet) y,
        solo en las páginas de escritorio, redirige a la PWA.
   Se configura con atributos en <html>, sin editar este archivo:
     data-theme-key="dw2-theme"      clave de localStorage
     data-default-theme="dark"       tema si no hay nada guardado
     data-bs-theme-sync="on"         sincroniza data-bs-theme (Bootstrap)
     data-device-router="on"         activa la redirección a la PWA
     data-vista-key="vistaHeladeria" escape ?v=escritorio por pestaña
     data-pwa-target="pwa/index.html" destino móvil
   ============================================================ */
(function () {
  'use strict';

  var root = document.documentElement;

  /* ── 1. TEMA TEMPRANO ───────────────────────────────────── */
  var themeKey = root.getAttribute('data-theme-key') || 'dw2-theme';
  var defaultTheme = root.getAttribute('data-default-theme') || 'dark';
  var theme = defaultTheme;
  try {
    theme = localStorage.getItem(themeKey) || defaultTheme;
  } catch (error) {
    theme = defaultTheme;
  }
  root.dataset.theme = theme;
  if (root.getAttribute('data-bs-theme-sync') === 'on') {
    root.dataset.bsTheme = theme;
  }

  /* ── 2. ENRUTADO LAPTOP / CELULAR ───────────────────────── */
  if (root.getAttribute('data-device-router') !== 'on') return;

  var ua = navigator.userAgent || '';
  var esMovil = /Android|iPhone|iPad|iPod|Windows Phone|IEMobile|Opera Mini|webOS|BlackBerry/i.test(ua)
    || (navigator.maxTouchPoints > 1 && /Macintosh/.test(ua));

  var vistaKey = root.getAttribute('data-vista-key') || '';
  var pwaTarget = root.getAttribute('data-pwa-target') || 'pwa/index.html';
  var preferida = '';

  try {
    var params = new URLSearchParams(window.location.search);
    if (params.get('v') === 'escritorio' && vistaKey) {
      sessionStorage.setItem(vistaKey, 'escritorio');
    }
    preferida = vistaKey ? (sessionStorage.getItem(vistaKey) || '') : '';
  } catch (error) {
    preferida = '';
  }

  if (esMovil && preferida !== 'escritorio') {
    window.location.replace(pwaTarget);
  }
})();
