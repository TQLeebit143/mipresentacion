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

  // 2. MENÚ HAMBURGUESA DE NAVEGACIÓN
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

  // 3. MODAL DINÁMICO PARA LOS LIBROS (PRÓLOGO, AUTOR Y AÑO)
  const modalLibro = document.getElementById('modalLibro');
  if (modalLibro) {
    modalLibro.addEventListener('show.bs.modal', event => {
      const card = event.relatedTarget;
      if (!card) return;
      const titulo = card.getAttribute('data-titulo');
      const autor = card.getAttribute('data-autor');
      const anio = card.getAttribute('data-anio');
      const desc = card.getAttribute('data-desc');

      document.getElementById('libroTitulo').textContent = titulo;
      document.getElementById('libroAutorAnio').textContent = `Autor: ${autor} | Año: ${anio}`;
      document.getElementById('libroDesc').textContent = desc;
    });
  }

  // 4. FILTRADO DE CINE, SERIES Y ANIMES
  const gridCine = document.getElementById('gridCine');
  if (gridCine) {
    const itemsCine = gridCine.querySelectorAll('.cine-item-col');
    const botonesCine = document.querySelectorAll('[data-cine-filtro]');

    botonesCine.forEach(btn => {
      btn.addEventListener('click', () => {
        const filtro = btn.dataset.cineFiltro;
        botonesCine.forEach(b => b.classList.remove('is-active'));
        btn.classList.add('is-active');

        itemsCine.forEach(item => {
          const match = filtro === 'todos' || item.dataset.tipo === filtro;
          item.style.display = match ? 'block' : 'none';
        });
      });
    });
  }

  // 5. FILTRADO DE FAVORITOS (MÚSICA Y JUEGOS)
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
        const subCategorias = tarjeta.dataset.sub ? tarjeta.dataset.sub.split(' ') : [];
        const matchSub = !estado.sub || subCategorias.includes(estado.sub);
        const mostrar = matchTipo && matchSub;

        const contenedorCol = tarjeta.closest('.col-md-6, .col-lg-4');
        if (contenedorCol) contenedorCol.hidden = !mostrar;
        if (mostrar) visibles++;
      });

      botonesTipo.forEach(btn => {
        btn.classList.toggle('is-active', btn.dataset.filtro === estado.tipo);
      });

      if (subMusica) subMusica.hidden = estado.tipo !== 'musica';
      if (subJuegos) subJuegos.hidden = estado.tipo !== 'juegos';

      botonesSub.forEach(btn => {
        btn.classList.toggle('is-active', btn.dataset.subFiltro === estado.sub);
      });

      if (conteo) conteo.textContent = `Mostrando ${visibles} de ${tarjetas.length}`;
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

  // 6. VALIDACIÓN DEL FORMULARIO DE CONTACTO
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

    const reglas = {
      nombre: (v) => v.trim() ? (v.trim().length >= 2 ? '' : 'Mínimo 2 caracteres.') : 'Obligatorio.',
      email: (v) => v.trim() ? (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) ? '' : 'Correo inválido.') : 'Obligatorio.',
      celular: (v) => v.trim() ? (/^\d{8}$/.test(v) ? '' : 'Debe tener 8 dígitos.') : 'Obligatorio.',
      servicio: (v) => v ? '' : 'Selecciona una opción.',
      mensaje: (v) => v.trim().length >= 10 ? '' : 'Mínimo 10 caracteres.',
      acepto: (v) => v ? '' : 'Debes aceptar.'
    };

    function validar(nombre) {
      if (!campos[nombre]) return true;
      const el = campos[nombre];
      const val = el.type === 'checkbox' ? el.checked : el.value;
      const error = reglas[nombre] ? reglas[nombre](val) : '';
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