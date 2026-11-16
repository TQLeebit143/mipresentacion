/* ==========================================================================
   PORTAFOLIO PWA · ALE
   JavaScript vanilla, sin jQuery.
   - Tema claro/oscuro persistente.
   - Instalación PWA y estado de conexión.
   - Modales accesibles con delegación de eventos.
   - Filtros, biblioteca, cine y favoritos.
   - Validación de contacto y envío por WhatsApp.
   - Diagnóstico DOM seguro (sin innerHTML con datos del usuario).
   ========================================================================== */
(function () {
  'use strict';

  var WHATSAPP_NUMBER = '59178794797';
  var PLACEHOLDER_IMG = 'assets/placeholder.svg';
  var doc = document;
  var root = doc.documentElement;
  var deferredInstallPrompt = null;
  var ultimoFoco = null;

  function byId(id) {
    return doc.getElementById(id);
  }

  function all(selector, context) {
    return Array.prototype.slice.call((context || doc).querySelectorAll(selector));
  }

  /* ------------------------------------------------------------------------
     1. TEMA
     ------------------------------------------------------------------------ */
  function aplicarTema(tema) {
    var seguro = tema === 'light' ? 'light' : 'dark';
    root.dataset.theme = seguro;
    root.dataset.bsTheme = seguro;

    var btn = byId('themeBtn');
    if (btn) {
      var icon = btn.querySelector('i');
      if (icon) icon.className = seguro === 'dark' ? 'bi bi-sun' : 'bi bi-moon-stars';
      btn.setAttribute('aria-label', seguro === 'dark' ? 'Cambiar a tema claro' : 'Cambiar a tema oscuro');
      btn.setAttribute('title', seguro === 'dark' ? 'Cambiar a tema claro' : 'Cambiar a tema oscuro');
    }

    var meta = doc.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', seguro === 'dark' ? '#0f1115' : '#f4f5f7');
  }

  function temaGuardado() {
    try {
      return localStorage.getItem('tema') === 'light' ? 'light' : 'dark';
    } catch (error) {
      return 'dark';
    }
  }

  /* ------------------------------------------------------------------------
     2. AVISOS LIGEROS
     ------------------------------------------------------------------------ */
  function mostrarAviso(texto) {
    var aviso = doc.createElement('div');
    aviso.className = 'hud-toast';
    aviso.setAttribute('role', 'status');
    aviso.textContent = texto;
    doc.body.appendChild(aviso);

    window.setTimeout(function () {
      aviso.classList.add('is-hiding');
      window.setTimeout(function () {
        if (aviso.parentNode) aviso.parentNode.removeChild(aviso);
      }, 250);
    }, 3200);
  }

  /* ------------------------------------------------------------------------
     3. MENÚ
     ------------------------------------------------------------------------ */
  function iniciarMenu() {
    var menuBtn = byId('menuBtn');
    var menu = byId('menuPrincipal');
    if (!menuBtn || !menu) return;

    function abrir(abierto) {
      menu.classList.toggle('is-open', abierto);
      menuBtn.setAttribute('aria-expanded', String(abierto));
    }

    menuBtn.addEventListener('click', function (event) {
      event.stopPropagation();
      abrir(!menu.classList.contains('is-open'));
    });

    doc.addEventListener('click', function (event) {
      if (!menu.contains(event.target) && !menuBtn.contains(event.target)) {
        abrir(false);
      }
    });

    doc.addEventListener('keydown', function (event) {
      if (event.key === 'Escape' && menu.classList.contains('is-open')) {
        abrir(false);
        menuBtn.focus();
      }
    });

    menu.addEventListener('click', function (event) {
      if (event.target.closest('a')) abrir(false);
    });
  }

  /* ------------------------------------------------------------------------
     4. MODALES
     ------------------------------------------------------------------------ */
  function prepararModales() {
    all('.hud-modal').forEach(function (modal) {
      modal.setAttribute('role', 'dialog');
      modal.setAttribute('aria-modal', 'true');
      modal.setAttribute('aria-hidden', 'true');
      var titulo = modal.querySelector('.hud-modal-header h3');
      if (titulo) modal.setAttribute('aria-label', titulo.textContent.trim());
    });
  }

  function cerrarModales() {
    all('.hud-modal.is-open').forEach(function (modal) {
      modal.classList.remove('is-open');
      modal.setAttribute('aria-hidden', 'true');
    });
    if (ultimoFoco && typeof ultimoFoco.focus === 'function') {
      ultimoFoco.focus();
    }
    ultimoFoco = null;
  }

  function abrirModal(id) {
    var destino = byId(id);
    if (!destino) return;

    ultimoFoco = doc.activeElement;
    all('.hud-modal.is-open').forEach(function (modal) {
      modal.classList.remove('is-open');
      modal.setAttribute('aria-hidden', 'true');
    });

    destino.classList.add('is-open');
    destino.setAttribute('aria-hidden', 'false');

    window.requestAnimationFrame(function () {
      var enfocable = destino.querySelector('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
      if (enfocable && typeof enfocable.focus === 'function') enfocable.focus();
    });
  }

  function iniciarModales() {
    prepararModales();

    doc.addEventListener('click', function (event) {
      var apertura = event.target.closest('[data-modal]');
      if (apertura) {
        event.preventDefault();
        abrirModal(apertura.getAttribute('data-modal'));
        return;
      }

      var cierre = event.target.closest('[data-close]');
      if (cierre) {
        event.preventDefault();
        cerrarModales();
        return;
      }

      if (event.target.classList && event.target.classList.contains('hud-modal')) {
        cerrarModales();
      }
    });

    doc.addEventListener('keydown', function (event) {
      if (event.key === 'Escape' && doc.querySelector('.hud-modal.is-open')) {
        cerrarModales();
      }
    });
  }

  /* ------------------------------------------------------------------------
     5. BIBLIOTECA
     ------------------------------------------------------------------------ */
  function iniciarBiblioteca() {
    var detalle = byId('modal-detalle-libro');
    if (!detalle) return;

    var titulo = byId('libroTituloModal');
    var autorAnio = byId('libroAutorAnio');
    var desc = byId('libroDesc');

    function rellenar(card) {
      if (titulo) titulo.textContent = card.getAttribute('data-titulo') || '';
      if (autorAnio) autorAnio.textContent = (card.getAttribute('data-autor') || '—') + ' (' + (card.getAttribute('data-anio') || '—') + ')';
      if (desc) desc.textContent = card.getAttribute('data-desc') || '';
    }

    all('[data-libro="true"]').forEach(function (card) {
      card.setAttribute('tabindex', '0');
      card.setAttribute('role', 'button');
    });

    doc.addEventListener('click', function (event) {
      var card = event.target.closest('[data-libro="true"]');
      if (!card) return;
      event.preventDefault();
      rellenar(card);
      abrirModal('modal-detalle-libro');
    });

    doc.addEventListener('keydown', function (event) {
      var card = event.target.closest && event.target.closest('[data-libro="true"]');
      if (!card) return;
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        rellenar(card);
        abrirModal('modal-detalle-libro');
      }
    });

    var volver = function () { abrirModal('modal-libros'); };
    var cerrarDetalle = byId('cerrarDetalleLibro');
    var btnCerrar = byId('btnCerrarDetalle');
    if (cerrarDetalle) cerrarDetalle.addEventListener('click', volver);
    if (btnCerrar) btnCerrar.addEventListener('click', volver);
  }

  /* ------------------------------------------------------------------------
     6. FILTROS
     ------------------------------------------------------------------------ */
  function iniciarCine() {
    var grid = byId('gridCine');
    if (!grid) return;

    var items = all('.cine-item-col', grid);

    doc.addEventListener('click', function (event) {
      var boton = event.target.closest('[data-cine-filtro]');
      if (!boton || !boton.closest('#modal-peliculas')) return;

      var filtro = boton.getAttribute('data-cine-filtro');
      all('[data-cine-filtro]').forEach(function (btn) {
        var activo = btn === boton;
        btn.classList.toggle('is-active', activo);
        btn.setAttribute('aria-pressed', String(activo));
      });

      items.forEach(function (item) {
        item.hidden = !(filtro === 'todos' || item.getAttribute('data-tipo') === filtro);
      });
    });
  }

  function iniciarFavoritos() {
    var grid = byId('gridFavoritos');
    if (!grid) return;

    var tarjetas = all('[data-tipo]', grid);
    var botonesTipo = all('#modal-favoritos [data-filtro]');
    var botonesSub = all('#modal-favoritos [data-sub-filtro]');
    var subMusica = byId('sub-musica');
    var subJuegos = byId('sub-juegos');
    var conteo = byId('conteoFavoritos');
    var estado = { tipo: 'todos', sub: '' };

    function actualizar() {
      var visibles = 0;

      tarjetas.forEach(function (tarjeta) {
        var coincideTipo = estado.tipo === 'todos' || tarjeta.getAttribute('data-tipo') === estado.tipo;
        var subCategorias = (tarjeta.getAttribute('data-sub') || '').split(' ').filter(Boolean);
        var coincideSub = !estado.sub || subCategorias.indexOf(estado.sub) !== -1;
        var mostrar = coincideTipo && coincideSub;

        tarjeta.hidden = !mostrar;
        if (mostrar) visibles += 1;
      });

      botonesTipo.forEach(function (btn) {
        var activo = btn.getAttribute('data-filtro') === estado.tipo;
        btn.classList.toggle('is-active', activo);
        btn.setAttribute('aria-pressed', String(activo));
      });

      if (subMusica) subMusica.hidden = estado.tipo !== 'musica';
      if (subJuegos) subJuegos.hidden = estado.tipo !== 'juegos';

      botonesSub.forEach(function (btn) {
        var activo = (btn.getAttribute('data-sub-filtro') || '') === estado.sub;
        btn.classList.toggle('is-active', activo);
        btn.setAttribute('aria-pressed', String(activo));
      });

      if (conteo) conteo.textContent = 'Mostrando ' + visibles + ' de ' + tarjetas.length;
    }

    doc.addEventListener('click', function (event) {
      var tipo = event.target.closest('[data-filtro]');
      if (tipo && tipo.closest('#modal-favoritos')) {
        estado.tipo = tipo.getAttribute('data-filtro');
        estado.sub = '';
        actualizar();
        return;
      }

      var sub = event.target.closest('[data-sub-filtro]');
      if (sub && sub.closest('#modal-favoritos')) {
        estado.sub = sub.getAttribute('data-sub-filtro') || '';
        actualizar();
      }
    });

    actualizar();
  }

  /* ------------------------------------------------------------------------
     7. IMÁGENES CAÍDAS
     ------------------------------------------------------------------------ */
  function iniciarFallbackImagenes() {
    doc.addEventListener('error', function (event) {
      var img = event.target;
      if (!img || img.tagName !== 'IMG') return;
      if (img.dataset.fallbackAplicado === 'true') return;
      img.dataset.fallbackAplicado = 'true';
      img.src = PLACEHOLDER_IMG;
      if (!img.alt) img.alt = 'Imagen no disponible';
    }, true);
  }

  /* ------------------------------------------------------------------------
     8. FORMULARIO DE CONTACTO
     ------------------------------------------------------------------------ */
  var ETIQUETAS_SERVICIO = {
    frontend: 'Desarrollo web frontend e interfaces',
    fullstack: 'Desarrollo web full-stack (C#, PHP, SQL)',
    base_datos: 'Diseño y normalización de bases de datos',
    redes: 'Infraestructura de redes y virtualización',
    otro: 'Consultoría técnica o proyecto personal'
  };

  function iniciarContacto() {
    var form = byId('contactoForm');
    if (!form) return;

    var campos = {
      nombre: byId('nombre'),
      email: byId('email'),
      celular: byId('celular'),
      servicio: byId('servicio'),
      mensaje: byId('mensaje'),
      acepto: byId('acepto')
    };

    var contador = byId('contadorMensaje');
    var alerta = byId('formAlert');
    var exito = byId('formSuccess');
    var textoExito = byId('successText');
    var waEnviar = byId('waEnviar');
    var nuevaSolicitud = byId('nuevaSolicitud');

    var reglas = {
      nombre: function (valor) {
        var v = String(valor || '').trim();
        if (!v) return 'El nombre es obligatorio.';
        if (v.length < 2) return 'Escribe al menos 2 caracteres.';
        return '';
      },
      email: function (valor) {
        var v = String(valor || '').trim();
        if (!v) return 'El correo es obligatorio.';
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)) return 'Ingresa un correo válido.';
        return '';
      },
      celular: function (valor) {
        var v = String(valor || '').trim();
        if (!v) return 'El celular es obligatorio.';
        if (!/^\d{8}$/.test(v)) return 'El celular debe tener 8 dígitos.';
        return '';
      },
      servicio: function (valor) {
        return valor ? '' : 'Selecciona un tipo de servicio.';
      },
      mensaje: function (valor) {
        var v = String(valor || '').trim();
        if (v.length < 10) return 'Describe tu proyecto con al menos 10 caracteres.';
        return '';
      },
      acepto: function (_valor, el) {
        return el && el.checked ? '' : 'Debes aceptar el uso de tus datos.';
      }
    };

    function validarCampo(nombre) {
      var el = campos[nombre];
      if (!el) return true;

      var error = reglas[nombre] ? reglas[nombre](el.type === 'checkbox' ? '' : el.value, el) : '';
      var field = el.closest('.field');
      var errDiv = byId('err-' + nombre);

      if (field) {
        field.classList.toggle('is-invalid', Boolean(error));
        field.classList.toggle('is-valid', !error);
      }
      if (errDiv) errDiv.textContent = error;
      return !error;
    }

    function limpiarCampo(nombre) {
      var el = campos[nombre];
      if (!el) return;
      var field = el.closest('.field');
      var errDiv = byId('err-' + nombre);
      if (field) field.classList.remove('is-invalid', 'is-valid');
      if (errDiv) errDiv.textContent = '';
    }

    function construirMensaje() {
      var servicio = campos.servicio.value;
      return [
        'Hola Ale, te escribo desde tu portafolio PWA.',
        '',
        'Nombre: ' + campos.nombre.value.trim(),
        'Correo: ' + campos.email.value.trim(),
        'Celular: +591 ' + campos.celular.value.trim(),
        'Servicio: ' + (ETIQUETAS_SERVICIO[servicio] || servicio),
        '',
        'Detalle:',
        campos.mensaje.value.trim()
      ].join('\n');
    }

    form.addEventListener('input', function (event) {
      var el = event.target;
      if (!el.name) return;

      if (el.name === 'celular') {
        el.value = el.value.replace(/\D/g, '').slice(0, 8);
      }
      if (el.name === 'mensaje' && contador) {
        contador.textContent = el.value.length + '/500';
      }
      if (el.closest('.field')) el.closest('.field').classList.remove('is-invalid');
      var errDiv = byId('err-' + el.name);
      if (errDiv) errDiv.textContent = '';
      if (alerta) alerta.hidden = true;
    });

    form.addEventListener('change', function (event) {
      if (event.target.name === 'servicio' || event.target.name === 'acepto') {
        validarCampo(event.target.name);
      }
      if (alerta) alerta.hidden = true;
    });

    form.addEventListener('blur', function (event) {
      if (event.target.name) validarCampo(event.target.name);
    }, true);

    form.addEventListener('submit', function (event) {
      event.preventDefault();
      var valido = true;
      var primerInvalido = null;

      Object.keys(campos).forEach(function (nombre) {
        if (!validarCampo(nombre)) {
          valido = false;
          if (!primerInvalido) primerInvalido = campos[nombre];
        }
      });

      if (!valido) {
        if (alerta) {
          alerta.textContent = 'Revisa los campos marcados antes de enviar.';
          alerta.hidden = false;
        }
        if (primerInvalido) primerInvalido.focus();
        return;
      }

      if (alerta) alerta.hidden = true;

      var nombre = campos.nombre.value.trim();
      if (textoExito) {
        textoExito.textContent = '¡Gracias, ' + nombre + '! Tu solicitud fue registrada. Puedes enviarla por WhatsApp para recibir respuesta más rápido.';
      }
      if (waEnviar) {
        waEnviar.href = 'https://wa.me/' + WHATSAPP_NUMBER + '?text=' + encodeURIComponent(construirMensaje());
      }

      form.hidden = true;
      if (exito) {
        exito.hidden = false;
        exito.focus();
      }
    });

    if (nuevaSolicitud) {
      nuevaSolicitud.addEventListener('click', function () {
        form.reset();
        Object.keys(campos).forEach(limpiarCampo);
        if (contador) contador.textContent = '0/500';
        if (alerta) alerta.hidden = true;
        if (exito) exito.hidden = true;
        form.hidden = false;
        if (campos.nombre) campos.nombre.focus();
      });
    }

    if (contador) contador.textContent = (campos.mensaje ? campos.mensaje.value.length : 0) + '/500';
  }

  /* ------------------------------------------------------------------------
     9. DIAGNÓSTICO SEGURO
     ------------------------------------------------------------------------ */
  function iniciarDiagnostico() {
    var btn = byId('btnAnalizar');
    var input = byId('codigoInput');
    var panel = byId('panelResultado');
    var reporte = byId('detallesReporte');
    var sugerido = byId('codigoSugerido');
    if (!btn || !input) return;

    btn.addEventListener('click', function () {
      var codigo = input.value.trim();
      if (!codigo) {
        mostrarAviso('Pega un fragmento de HTML o CSS para analizar.');
        input.focus();
        return;
      }

      var hallazgos = [];

      if (/\son[a-z]+\s*=/i.test(codigo)) {
        hallazgos.push('Se detectaron manejadores inline (onclick, onchange, etc.). Usa addEventListener.');
      }
      if (/<img\b/i.test(codigo) && !/loading\s*=\s*["']lazy["']/i.test(codigo)) {
        hallazgos.push('Las imágenes no usan loading="lazy". Añade carga diferida.');
      }
      if (/\.html\s*\(/i.test(codigo)) {
        hallazgos.push('Se detectó .html() (jQuery). Prefiere textContent para evitar XSS.');
      }
      if (/jquery/i.test(codigo)) {
        hallazgos.push('Se referencian librerías jQuery. Evalúa si son necesarias.');
      }
      if (/<button(?![^>]*type=)/i.test(codigo)) {
        hallazgos.push('Hay botones sin atributo type. Define type="button" o type="submit".');
      }

      if (panel) panel.style.display = 'block';
      if (reporte) {
        reporte.textContent = hallazgos.length
          ? 'Hallazgos (' + hallazgos.length + '):\n• ' + hallazgos.join('\n• ')
          : 'Sin observaciones críticas: no se detectaron manejadores inline, .html() ni imágenes sin lazy loading.';
      }
      if (sugerido) {
        sugerido.value = '/* Revisión aplicada */\n' + codigo.slice(0, 180) + (codigo.length > 180 ? '\n/* … */' : '');
      }
    });
  }

  /* ------------------------------------------------------------------------
     10. INSTALACIÓN PWA Y ESTADO DE RED
     ------------------------------------------------------------------------ */
  function iniciarPWA() {
    var btn = byId('btnPWAEstado');
    var texto = byId('pwaEstadoTexto');
    var instalada = window.matchMedia('(display-mode: standalone)').matches || Boolean(window.navigator.standalone);

    function actualizarBoton(estado) {
      if (!btn || !texto) return;
      btn.classList.remove('is-offline', 'is-installed');

      if (estado === 'installed') {
        texto.textContent = 'Instalada';
        btn.classList.add('is-installed');
        btn.setAttribute('aria-label', 'Aplicación instalada');
      } else if (estado === 'offline') {
        texto.textContent = 'Offline';
        btn.classList.add('is-offline');
        btn.setAttribute('aria-label', 'Sin conexión, modo offline activo');
      } else {
        texto.textContent = 'Instalar';
        btn.setAttribute('aria-label', 'Instalar la aplicación');
      }
    }

    window.addEventListener('beforeinstallprompt', function (event) {
      event.preventDefault();
      deferredInstallPrompt = event;
      actualizarBoton('ready');
    });

    window.addEventListener('appinstalled', function () {
      deferredInstallPrompt = null;
      instalada = true;
      actualizarBoton('installed');
      mostrarAviso('Aplicación instalada. Ya puedes abrirla desde tu dispositivo.');
    });

    if (btn) {
      btn.addEventListener('click', function () {
        if (deferredInstallPrompt) {
          deferredInstallPrompt.prompt();
          deferredInstallPrompt.userChoice.then(function (choice) {
            if (choice.outcome === 'accepted') {
              mostrarAviso('Instalación aceptada.');
            } else {
              mostrarAviso('Puedes instalar la app desde el menú del navegador.');
            }
            deferredInstallPrompt = null;
          });
          return;
        }

        if (instalada) {
          mostrarAviso('La aplicación ya está instalada y abierta en modo independiente.');
        } else {
          mostrarAviso('Para instalar: abre el menú del navegador y elige "Instalar aplicación" o "Añadir a pantalla de inicio".');
        }
      });
    }

    function actualizarRed() {
      if (!navigator.onLine) {
        actualizarBoton('offline');
      } else if (instalada) {
        actualizarBoton('installed');
      } else {
        actualizarBoton(deferredInstallPrompt ? 'ready' : 'default');
      }
    }

    window.addEventListener('online', function () {
      actualizarRed();
      mostrarAviso('Conexión restablecida.');
    });

    window.addEventListener('offline', function () {
      actualizarRed();
      mostrarAviso('Sin conexión: la app sigue disponible gracias al service worker.');
    });

    actualizarRed();

    if ('serviceWorker' in navigator) {
      window.addEventListener('load', function () {
        navigator.serviceWorker.register('sw.js').catch(function () {
          mostrarAviso('No se pudo registrar el service worker.');
        });
      });
    }
  }

  /* ------------------------------------------------------------------------
     11. ARRANQUE
     ------------------------------------------------------------------------ */
  function iniciar() {
    aplicarTema(temaGuardado());

    var themeBtn = byId('themeBtn');
    if (themeBtn) {
      themeBtn.addEventListener('click', function () {
        var siguiente = root.dataset.theme === 'dark' ? 'light' : 'dark';
        aplicarTema(siguiente);
        try {
          localStorage.setItem('tema', siguiente);
        } catch (error) {
          /* Sin almacenamiento: el tema se mantiene en memoria. */
        }
      });
    }

    iniciarMenu();
    iniciarModales();
    iniciarBiblioteca();
    iniciarCine();
    iniciarFavoritos();
    iniciarFallbackImagenes();
    iniciarContacto();
    iniciarDiagnostico();
    iniciarPWA();
  }

  if (doc.readyState === 'loading') {
    doc.addEventListener('DOMContentLoaded', iniciar, { once: true });
  } else {
    iniciar();
  }
})();
