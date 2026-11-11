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

  // 3. SISTEMA DE MODALES HUD FLOTANTES (SIN SCROLL GLOBAL)
  const triggers = document.querySelectorAll('[data-modal]');
  const closeButtons = document.querySelectorAll('[data-close]');
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

  triggers.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const modalTarget = btn.getAttribute('data-modal');
      abrirModal(modalTarget);
    });
  });

  closeButtons.forEach(btn => {
    btn.addEventListener('click', cerrarModales);
  });

  modals.forEach(modal => {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        cerrarModales();
      }
    });
  });

  // 4. FORMULARIO DE CONTACTO Y VALIDACIONES
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

});

// Hidratación SSR y jQuery
$(document).ready(function () {
  function simularHidratacionSSR() {
    let $box = $('#contenedorHidratacion');
    if ($box.attr('data-hidratado') === 'true') return;

    $('#btnPWAEstado')
      .off('click')
      .text('⚡ HUD Active')
      .addClass('active-sync')
      .on('click', function () {
        alert('¡Interfaz HUD sincronizada correctamente!');
      });

    $box.attr('data-hidratado', 'true');
  }

  setTimeout(simularHidratacionSSR, 400);
});