(function () {
  'use strict';

  var WHATSAPP_NUMBER = '59178794797';
  var PLACEHOLDER_IMG = 'assets/placeholder.svg';
  var doc = document;
  var root = doc.documentElement;

  function byId(id) {
    return doc.getElementById(id);
  }

  function all(selector, context) {
    return Array.prototype.slice.call((context || doc).querySelectorAll(selector));
  }

  function aplicarTema(tema) {
    var seguro = tema === 'light' ? 'light' : 'dark';
    root.dataset.theme = seguro;
    root.dataset.bsTheme = seguro;

    var themeBtn = byId('themeBtn');
    if (themeBtn) {
      var icon = themeBtn.querySelector('i');
      if (icon) {
        icon.className = seguro === 'dark' ? 'bi bi-sun' : 'bi bi-moon-stars';
      }
      themeBtn.setAttribute('aria-label', seguro === 'dark' ? 'Cambiar a tema claro' : 'Cambiar a tema oscuro');
      themeBtn.setAttribute('title', seguro === 'dark' ? 'Cambiar a tema claro' : 'Cambiar a tema oscuro');
    }

    var meta = doc.querySelector('meta[name="theme-color"]');
    if (meta) {
      meta.setAttribute('content', seguro === 'dark' ? '#0f1115' : '#f8f9fa');
    }
  }

  function temaGuardado() {
    try {
      return localStorage.getItem('tema') === 'light' ? 'light' : 'dark';
    } catch (error) {
      return 'dark';
    }
  }

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

  function iniciarLibros() {
    var modal = byId('modalLibro');
    if (!modal) return;

    var titulo = byId('libroTitulo');
    var autorAnio = byId('libroAutorAnio');
    var desc = byId('libroDesc');

    function rellenar(card) {
      if (titulo) titulo.textContent = card.getAttribute('data-titulo') || '';
      if (autorAnio) {
        autorAnio.textContent = 'Autor: ' + (card.getAttribute('data-autor') || '—') +
          ' | Año: ' + (card.getAttribute('data-anio') || '—');
      }
      if (desc) desc.textContent = card.getAttribute('data-desc') || '';
    }

    all('.card-book[data-titulo]').forEach(function (card) {
      if (!card.hasAttribute('tabindex')) card.setAttribute('tabindex', '0');
      card.setAttribute('role', 'button');
    });

    doc.addEventListener('click', function (event) {
      var card = event.target.closest('.card-book[data-titulo]');
      if (card) rellenar(card);
    });

    doc.addEventListener('keydown', function (event) {
      var card = event.target.closest && event.target.closest('.card-book[data-titulo]');
      if (!card) return;
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        rellenar(card);
        if (window.bootstrap && window.bootstrap.Modal) {
          window.bootstrap.Modal.getOrCreateInstance(modal).show();
        }
      }
    });

    modal.addEventListener('show.bs.modal', function (event) {
      if (event.relatedTarget) rellenar(event.relatedTarget);
    });
  }

  function iniciarCine() {
    var grid = byId('gridCine');
    if (!grid) return;

    var items = all('.cine-item-col', grid);

    doc.addEventListener('click', function (event) {
      var boton = event.target.closest('[data-cine-filtro]');
      if (!boton) return;

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
    var botonesTipo = all('[data-filtro]');
    var botonesSub = all('[data-sub-filtro]');
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

        var columna = tarjeta.closest('.col-md-6, .col-lg-4');
        if (columna) columna.hidden = !mostrar;
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
      if (tipo) {
        estado.tipo = tipo.getAttribute('data-filtro');
        estado.sub = '';
        actualizar();
        return;
      }

      var sub = event.target.closest('[data-sub-filtro]');
      if (sub && grid.ownerDocument.contains(sub)) {
        estado.sub = sub.getAttribute('data-sub-filtro') || '';
        actualizar();
      }
    });

    actualizar();
  }

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

  var ETIQUETAS_SERVICIO = {
    frontend: 'Desarrollo web frontend e interfaces',
    fullstack: 'Desarrollo web full-stack (C#, PHP, SQL)',
    base_datos: 'Diseño y normalización de bases de datos',
    redes: 'Infraestructura de redes y virtualización',
    otro: 'Consultoría técnica o proyecto personal'
  };

  function iniciarFormulario() {
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
        'Hola Ale, te escribo desde tu portafolio.',
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
      if (el.closest('.field')) {
        el.closest('.field').classList.remove('is-invalid');
      }
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
          alerta.textContent = 'Revisa los campos marcados en rojo antes de enviar.';
          alerta.hidden = false;
        }
        if (primerInvalido) primerInvalido.focus();
        return;
      }

      if (alerta) alerta.hidden = true;

      var nombre = campos.nombre.value.trim();
      if (textoExito) {
        textoExito.textContent = '¡Gracias, ' + nombre + '! Tu solicitud fue registrada. Puedes enviarla directamente por WhatsApp para recibir respuesta más rápido.';
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
    
        }
      });
    }

    iniciarMenu();
    iniciarLibros();
    iniciarCine();
    iniciarFavoritos();
    iniciarFallbackImagenes();
    iniciarFormulario();
  }

  if (doc.readyState === 'loading') {
    doc.addEventListener('DOMContentLoaded', iniciar, { once: true });
  } else {
    iniciar();
  }
})();
