document.addEventListener('DOMContentLoaded', () => {

  // 1. TEMA CLARO / OSCURO
  const themeBtn = document.getElementById('themeBtn');
  function aplicarTema(tema) {
    document.documentElement.dataset.theme = tema;
    document.documentElement.dataset.bsTheme = tema;
    if (themeBtn) {
      themeBtn.querySelector('i').className = tema === 'dark' ? 'bi bi-sun' : 'bi bi-moon-stars';
    }
  }

  if (themeBtn) {
    themeBtn.addEventListener('click', () => {
      const actual = document.documentElement.dataset.theme || 'dark';
      const siguiente = actual === 'dark' ? 'light' : 'dark';
      aplicarTema(siguiente);
      try { localStorage.setItem('tema', siguiente); } catch (e) {}
    });
  }

  // 2. MENÚ HAMBURGUESA DESPLEGABLE
  const menuBtn = document.getElementById('menuBtn');
  const menuPrincipal = document.getElementById('menuPrincipal');

  if (menuBtn && menuPrincipal) {
    menuBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const abierto = menuPrincipal.classList.toggle('is-open');
      menuBtn.setAttribute('aria-expanded', String(abierto));
    });

    document.addEventListener('click', (e) => {
      if (!menuPrincipal.contains(e.target) && !menuBtn.contains(e.target)) {
        menuPrincipal.classList.remove('is-open');
        menuBtn.setAttribute('aria-expanded', 'false');
      }
    });
  }

  // 3. SISTEMA DE MODALES HUD FLOTANTES (DELEGACIÓN POR EVENT BUBBLING)
  const modals = document.querySelectorAll('.hud-modal');

  function abrirModal(modalId) {
    modals.forEach(m => m.classList.remove('is-open'));
    const target = document.getElementById(modalId);
    if (target) {
      target.classList.add('is-open');
    }
    if (menuPrincipal) menuPrincipal.classList.remove('is-open');
  }

  function cerrarModales() {
    modals.forEach(m => m.classList.remove('is-open'));
  }

  $(document).off('click', '[data-modal]').on('click', '[data-modal]', function (e) {
    e.preventDefault();
    const modalTarget = $(this).attr('data-modal');
    abrirModal(modalTarget);
  });

  $(document).off('click', '[data-close]').on('click', '[data-close]', function () {
    cerrarModales();
  });

  modals.forEach(modal => {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        cerrarModales();
      }
    });
  });

  // 4. FILTRADO DE FAVORITOS EN MÓVIL Y LAPTOP
  const grid = document.getElementById('gridFavoritos');
  if (grid) {
    const tarjetas = grid.querySelectorAll('.fav-item-col');
    const botonesTipo = document.querySelectorAll('[data-filtro]');
    const botonesSub = document.querySelectorAll('[data-sub-filtro]');
    const subMusica = document.getElementById('sub-musica');
    const subJuegos = document.getElementById('sub-juegos');
    const conteo = document.getElementById('conteoFavoritos');

    let estado = { tipo: 'todos', sub: '' };

    function actualizarFiltros() {
      let visibles = 0;
      tarjetas.forEach(tarjeta => {
        const matchTipo = estado.tipo === 'todos' || tarjeta.dataset.tipo === estado.tipo;
        const subCategorias = tarjeta.dataset.sub ? tarjeta.dataset.sub.split(' ') : [];
        const matchSub = !estado.sub || subCategorias.includes(estado.sub);
        const mostrar = matchTipo && matchSub;

        if (mostrar) {
          tarjeta.style.display = 'block';
          visibles++;
        } else {
          tarjeta.style.display = 'none';
        }
      });

      botonesTipo.forEach(btn => {
        btn.classList.toggle('is-active', btn.dataset.filtro === estado.tipo);
      });

      if (subMusica) subMusica.hidden = estado.tipo !== 'musica';
      if (subJuegos) subJuegos.hidden = estado.tipo !== 'juegos';

      botonesSub.forEach(btn => {
        btn.classList.toggle('is-active', btn.dataset.subFiltro === estado.sub);
      });

      if (conteo) conteo.textContent = `Mostrando ${visibles} de ${tarjetas.length} elementos`;
    }

    botonesTipo.forEach(btn => {
      btn.addEventListener('click', () => {
        estado.tipo = btn.dataset.filtro;
        estado.sub = '';
        actualizarFiltros();
      });
    });

    botonesSub.forEach(btn => {
      btn.addEventListener('click', () => {
        estado.sub = btn.dataset.subFiltro;
        actualizarFiltros();
      });
    });

    actualizarFiltros();
  }

  // 5. FORMULARIO Y VALIDACIÓN
  const contactoForm = document.getElementById('contactoForm');
  if (contactoForm) {
    const campos = {
      nombre: document.getElementById('nombre'),
      email: document.getElementById('email'),
      celular: document.getElementById('celular'),
      servicio: document.getElementById('servicio'),
      mensaje: document.getElementById('mensaje'),
      acepto: document.getElementById('acepto')
    };

    const contador = document.getElementById('contadorMensaje');
    const formSuccess = document.getElementById('formSuccess');
    const successText = document.getElementById('successText');
    const nuevaSolicitud = document.getElementById('nuevaSolicitud');

    function esTextoCoherente(texto) {
      const v = texto.trim().toLowerCase();
      if (v.length < 15) return false;
      if (/[bcdfghjklmnpqrstvwxyz]{6,}/i.test(v)) return false;
      if (/(.)\1{4,}/.test(v)) return false;
      return new Set(v.replace(/\s+/g, '')).size >= 5;
    }

    const reglas = {
      nombre: (v) => {
        v = v.trim();
        if (!v) return 'Obligatorio.';
        if (v.length < 2 || v.length > 30) return 'Entre 2 y 30 caracteres.';
        if (/\d/.test(v)) return 'Sin números.';
        return '';
      },
      email: (v) => {
        v = v.trim();
        if (!v) return 'Obligatorio.';
        return /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(v) ? '' : 'Correo inválido.';
      },
      celular: (v) => {
        v = v.trim();
        if (!v) return 'Obligatorio.';
        if (!/^\d{8}$/.test(v)) return 'Debe tener 8 dígitos.';
        return (v.startsWith('6') || v.startsWith('7')) ? '' : 'Debe iniciar con 6 o 7.';
      },
      servicio: (v) => v ? '' : 'Selecciona.',
      mensaje: (v) => {
        v = v.trim();
        if (!v) return 'Escribe detalles.';
        if (v.length < 15) return 'Mínimo 15 caracteres.';
        return esTextoCoherente(v) ? '' : 'Mensaje no legible.';
      },
      acepto: (v) => v ? '' : 'Acepta términos.'
    };

    function validar(nombre) {
      const el = campos[nombre];
      const val = el.type === 'checkbox' ? el.checked : el.value;
      const error = reglas[nombre](val);
      const parent = el.closest('.field');
      const errDiv = document.getElementById(`err-${nombre}`);

      if (parent) {
        parent.classList.toggle('is-invalid', !!error);
        parent.classList.toggle('is-valid', !error);
      }
      if (errDiv) errDiv.textContent = error;
      return !error;
    }

    Object.keys(campos).forEach(key => {
      const el = campos[key];
      if (el) {
        const ev = (el.tagName === 'SELECT' || el.type === 'checkbox') ? 'change' : 'input';
        el.addEventListener(ev, () => {
          if (key === 'celular') el.value = el.value.replace(/\D/g, '').slice(0, 8);
          if (key === 'mensaje' && contador) contador.textContent = `${el.value.length}/500`;
          validar(key);
        });
      }
    });

    contactoForm.addEventListener('submit', (e) => {
      e.preventDefault();
      let valido = true;
      Object.keys(campos).forEach(k => { if (!validar(k)) valido = false; });

      if (valido) {
        if (successText) successText.textContent = `¡Gracias ${campos.nombre.value}! Mensaje recibido con éxito.`;
        contactoForm.hidden = true;
        if (formSuccess) formSuccess.hidden = false;
      }
    });

    if (nuevaSolicitud) {
      nuevaSolicitud.addEventListener('click', () => {
        contactoForm.reset();
        Object.keys(campos).forEach(k => {
          const el = campos[k];
          if (el) {
            const p = el.closest('.field');
            if (p) p.classList.remove('is-valid', 'is-invalid');
            const errDiv = document.getElementById(`err-${k}`);
            if (errDiv) errDiv.textContent = '';
          }
        });
        if (contador) contador.textContent = '0/500';
        if (formSuccess) formSuccess.hidden = true;
        contactoForm.hidden = false;
      });
    }
  }

  // 6. HERRAMIENTA DE DIAGNÓSTICO (INGE MIGUEL)
  const btnAnalizar = document.getElementById('btnAnalizar');
  if (btnAnalizar) {
    btnAnalizar.addEventListener('click', function() {
      let src = document.getElementById('codigoInput').value;
      if(!src.trim()) return alert('Por favor pega algún código.');
      
      let hallazgos = [];
      let limpio = src;
      
      let clasesBloqueo = [/ad-banner/gi, /promo-box/gi, /social-ads/gi, /analytics/gi, /tracker/gi];
      clasesBloqueo.forEach(regex => {
        if(regex.test(src)) {
          hallazgos.push('<span class="badge-danger">BLOQUEO GRAVE</span> Detectada clase sospechosa ' + regex + ' (Brave/Opera la ocultarán).');
          limpio = limpio.replace(regex, 'seccion-destacada');
        }
      });
      
      if(/100vh/gi.test(src) && !/min-height/gi.test(src)) {
        hallazgos.push('<span class="badge-danger">DESBORDAMIENTO</span> Se detectó 100vh rígido. Reemplazar por min-height: 100dvh.');
        limpio = limpio.replace(/height:\s*100vh;/gi, 'min-height: 100dvh;');
      }
      
      let viabilidad = hallazgos.length <= 2 
        ? '<span class="badge-success">CÓDIGO RESCATABLE</span> Aplica los cambios sugeridos abajo.' 
        : '<span class="badge-danger">REFACTORIZAR</span> Demasiadas inconsistencias.';
      
      let htmlReporte = '<p><b>Dictamen:</b> ' + viabilidad + '</p><ul style="padding-left:20px;">';
      hallazgos.forEach(h => htmlReporte += '<li style="margin-bottom:4px;">' + h + '</li>');
      if(hallazgos.length === 0) {
        htmlReporte += '<li><span class="badge-success">EXCELENTE</span> No se encontraron nombres de clases bloqueables ni errores de viewport.</li>';
      }
      htmlReporte += '</ul>';
      
      document.getElementById('detallesReporte').innerHTML = htmlReporte;
      document.getElementById('codigoSugerido').value = limpio;
      document.getElementById('panelResultado').style.display = 'block';
    });
  }

});

// Hidratación SSR y Estado de Red
$(document).ready(function () {
  function actualizarEstadoRed() {
    if (navigator.onLine) {
      $('#btnPWAEstado').html('<i class="bi bi-lightning-charge-fill me-1"></i>En Línea').addClass('active-sync');
    } else {
      $('#btnPWAEstado').html('<i class="bi bi-wifi-off me-1"></i>Modo Offline Activo').removeClass('active-sync');
    }
  }

  $(window).on('online offline', actualizarEstadoRed);
  actualizarEstadoRed();
});