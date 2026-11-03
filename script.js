document.addEventListener('DOMContentLoaded', () => {

  // TEMA CLARO / OSCURO
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

  // NAVEGACIÓN HAMBURGUESA ÚNICA
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

    menuPrincipal.querySelectorAll('.menu-link').forEach(link => {
      link.addEventListener('click', () => {
        menuPrincipal.classList.remove('is-open');
        menuBtn.setAttribute('aria-expanded', 'false');
      });
    });
  }

  // FILTRADO DE FAVORITOS
  const grid = document.getElementById('gridFavoritos');
  if (grid) {
    const tarjetas = grid.querySelectorAll('[data-tipo]');
    const botonesTipo = document.querySelectorAll('[data-filtro]');
    const botonesSub = document.querySelectorAll('[data-sub-filtro]');
    const subMusica = document.getElementById('sub-musica');
    const subJuegos = document.getElementById('sub-juegos');
    const conteo = document.getElementById('conteoFavoritos');

    let estado = { tipo: 'todos', sub: '' };

    function actualizar() {
      let visibles = 0;
      tarjetas.forEach(tarjeta => {
        const matchTipo = estado.tipo === 'todos' || tarjeta.dataset.tipo === estado.tipo;
        const subCategorias = tarjeta.dataset.sub.split(' ');
        const matchSub = !estado.sub || subCategorias.includes(estado.sub);
        const mostrar = matchTipo && matchSub;

        tarjeta.closest('.col-md-6').hidden = !mostrar;
        if (mostrar) visibles++;
      });

      botonesTipo.forEach(btn => {
        btn.classList.toggle('is-active', btn.dataset.filtro === estado.tipo);
      });

      subMusica.hidden = estado.tipo !== 'musica';
      subJuegos.hidden = estado.tipo !== 'juegos';

      botonesSub.forEach(btn => {
        btn.classList.toggle('is-active', btn.dataset.subFiltro === estado.sub);
      });

      conteo.textContent = `Mostrando ${visibles} de ${tarjetas.length}`;
    }

    botonesTipo.forEach(btn => {
      btn.addEventListener('click', () => {
        estado.tipo = btn.dataset.filtro;
        estado.sub = '';
        actualizar();
      });
    });

    botonesSub.forEach(btn => {
      btn.addEventListener('click', () => {
        estado.sub = btn.dataset.subFiltro;
        actualizar();
      });
    });

    actualizar();
  }

  // FORMULARIO DE CONTACTO Y VALIDACIONES
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
        if (!v) return 'El nombre es obligatorio.';
        if (v.length < 2 || v.length > 30) return 'Entre 2 y 30 caracteres.';
        if (/\d/.test(v)) return 'Sin números.';
        return '';
      },
      email: (v) => {
        v = v.trim();
        if (!v) return 'El correo es obligatorio.';
        return /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(v) ? '' : 'Ingresa un correo válido (ej: usuario@gmail.com).';
      },
      celular: (v) => {
        v = v.trim();
        if (!v) return 'El celular es obligatorio.';
        if (!/^\d{8}$/.test(v)) return 'Debe tener 8 dígitos.';
        return (v.startsWith('6') || v.startsWith('7')) ? '' : 'Debe empezar con 6 o 7.';
      },
      servicio: (v) => v ? '' : 'Selecciona un servicio.',
      mensaje: (v) => {
        v = v.trim();
        if (!v) return 'Escribe los detalles de tu proyecto.';
        if (v.length < 15) return 'Mínimo 15 caracteres.';
        return esTextoCoherente(v) ? '' : 'Escribe un mensaje legible.';
      },
      acepto: (v) => v ? '' : 'Debes aceptar los términos.'
    };

    function validar(nombre) {
      const el = campos[nombre];
      const val = el.type === 'checkbox' ? el.checked : el.value;
      const error = reglas[nombre](val);
      const parent = el.closest('.field');
      const errDiv = document.getElementById(`err-${nombre}`);

      parent.classList.toggle('is-invalid', !!error);
      parent.classList.toggle('is-valid', !error);
      errDiv.textContent = error;
      return !error;
    }

    Object.keys(campos).forEach(key => {
      const el = campos[key];
      const ev = (el.tagName === 'SELECT' || el.type === 'checkbox') ? 'change' : 'input';
      el.addEventListener(ev, () => {
        if (key === 'celular') el.value = el.value.replace(/\D/g, '').slice(0, 8);
        if (key === 'mensaje') contador.textContent = `${el.value.length}/500`;
        validar(key);
      });
    });

    contactoForm.addEventListener('submit', (e) => {
      e.preventDefault();
      let valido = true;
      Object.keys(campos).forEach(k => { if (!validar(k)) valido = false; });

      if (valido) {
        successText.textContent = `Gracias ${campos.nombre.value}. He recibido tu mensaje y me pondré en contacto pronto.`;
        contactoForm.hidden = true;
        formSuccess.hidden = false;
      }
    });

    if (nuevaSolicitud) {
      nuevaSolicitud.addEventListener('click', () => {
        contactoForm.reset();
        Object.keys(campos).forEach(k => {
          const p = campos[k].closest('.field');
          p.classList.remove('is-valid', 'is-invalid');
          document.getElementById(`err-${k}`).textContent = '';
        });
        contador.textContent = '0/500';
        formSuccess.hidden = true;
        contactoForm.hidden = false;
      });
    }
  }

});