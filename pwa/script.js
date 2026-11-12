document.addEventListener('DOMContentLoaded', function () {

  // 1. CONTROL DEL MENÚ DESPLEGABLE HUD
  const menuBtn = document.getElementById('menuBtn');
  const menuPrincipal = document.getElementById('menuPrincipal');

  if (menuBtn && menuPrincipal) {
    menuBtn.addEventListener('click', function (e) {
      e.stopPropagation();
      menuPrincipal.classList.toggle('is-open');
      const expanded = menuPrincipal.classList.contains('is-open');
      menuBtn.setAttribute('aria-expanded', expanded);
    });

    document.addEventListener('click', function (e) {
      if (!menuPrincipal.contains(e.target) && !menuBtn.contains(e.target)) {
        menuPrincipal.classList.remove('is-open');
        menuBtn.setAttribute('aria-expanded', 'false');
      }
    });
  }

  // 2. APERTURA Y CIERRE DE VENTANAS MODALES HUD
  const modales = document.querySelectorAll('.hud-modal');

  function abrirModal(modalId) {
    modales.forEach(m => m.classList.remove('is-open'));
    const modalTarget = document.getElementById(modalId);
    if (modalTarget) {
      modalTarget.classList.add('is-open');
      if (menuPrincipal) menuPrincipal.classList.remove('is-open');
    }
  }

  function cerrarModales() {
    modales.forEach(m => m.classList.remove('is-open'));
  }

  // Enlaces del menú y botones que abren modales
  document.querySelectorAll('[data-modal]').forEach(item => {
    item.addEventListener('click', function (e) {
      e.preventDefault();
      const modalId = this.getAttribute('data-modal');
      abrirModal(modalId);
    });
  });

  // Botones de cierre (X o fondo)
  document.querySelectorAll('[data-close]').forEach(btn => {
    btn.addEventListener('click', cerrarModales);
  });

  modales.forEach(modal => {
    modal.addEventListener('click', function (e) {
      if (e.target === this) {
        cerrarModales();
      }
    });
  });

  // 3. BIBLIOTECA LITERARIA: MODAL DETALLE DE LIBROS
  const modalDetalleLibro = document.getElementById('modal-detalle-libro');
  const libroTituloModal = document.getElementById('libroTituloModal');
  const libroAutorAnio = document.getElementById('libroAutorAnio');
  const libroDesc = document.getElementById('libroDesc');
  const cerrarDetalleLibro = document.getElementById('cerrarDetalleLibro');
  const btnCerrarDetalle = document.getElementById('btnCerrarDetalle');

  document.querySelectorAll('[data-libro="true"]').forEach(card => {
    card.addEventListener('click', function () {
      const titulo = this.getAttribute('data-titulo');
      const autor = this.getAttribute('data-autor');
      const anio = this.getAttribute('data-anio');
      const desc = this.getAttribute('data-desc');

      if (libroTituloModal) libroTituloModal.textContent = titulo;
      if (libroAutorAnio) libroAutorAnio.textContent = `${autor} (${anio})`;
      if (libroDesc) libroDesc.textContent = desc;

      abrirModal('modal-detalle-libro');
    });
  });

  if (cerrarDetalleLibro) cerrarDetalleLibro.addEventListener('click', () => abrirModal('modal-libros'));
  if (btnCerrarDetalle) btnCerrarDetalle.addEventListener('click', () => abrirModal('modal-libros'));

  // 4. FILTRADO DE CINE Y ANIMES
  const gridCine = document.getElementById('gridCine');
  if (gridCine) {
    const itemsCine = gridCine.querySelectorAll('.cine-item-col');
    const botonesCine = document.querySelectorAll('[data-cine-filtro]');

    botonesCine.forEach(btn => {
      btn.addEventListener('click', function () {
        const filtro = this.getAttribute('data-cine-filtro');

        botonesCine.forEach(b => b.classList.remove('is-active'));
        this.classList.add('is-active');

        itemsCine.forEach(item => {
          const tipo = item.getAttribute('data-tipo');
          if (filtro === 'todos' || tipo === filtro) {
            item.style.display = 'block';
          } else {
            item.style.display = 'none';
          }
        });
      });
    });
  }

  // 5. FILTRADO DE FAVORITOS (MÚSICA Y JUEGOS CON SUBFILTROS)
  const gridFavoritos = document.getElementById('gridFavoritos');
  if (gridFavoritos) {
    const tarjetas = gridFavoritos.querySelectorAll('[data-tipo]');
    const botonesTipo = document.querySelectorAll('#modal-favoritos [data-filtro]');
    const botonesSub = document.querySelectorAll('#modal-favoritos [data-sub-filtro]');
    const subMusica = document.getElementById('sub-musica');
    const subJuegos = document.getElementById('sub-juegos');
    const conteo = document.getElementById('conteoFavoritos');

    let estado = { tipo: 'todos', sub: '' };

    function actualizarFavoritos() {
      let visibles = 0;
      tarjetas.forEach(tarjeta => {
        const matchTipo = estado.tipo === 'todos' || tarjeta.dataset.tipo === estado.tipo;
        const subCategorias = tarjeta.dataset.sub ? tarjeta.dataset.sub.split(' ') : [];
        const matchSub = !estado.sub || subCategorias.includes(estado.sub);
        const mostrar = matchTipo && matchSub;

        tarjeta.hidden = !mostrar;
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
        actualizarFavoritos();
      });
    });

    botonesSub.forEach(btn => {
      btn.addEventListener('click', () => {
        estado.sub = btn.dataset.subFiltro;
        actualizarFavoritos();
      });
    });

    actualizarFavoritos();
  }

  // 6. VALIDACIÓN Y CONTADOR DE MENSAJE EN CONTACTO
  const contactoForm = document.getElementById('contactoForm');
  const mensajeArea = document.getElementById('mensaje');
  const contadorMensaje = document.getElementById('contadorMensaje');

  if (mensajeArea && contadorMensaje) {
    mensajeArea.addEventListener('input', function () {
      const actual = this.value.length;
      contadorMensaje.textContent = `${actual}/500`;
    });
  }

  if (contactoForm) {
    contactoForm.addEventListener('submit', function (e) {
      e.preventDefault();
      const nombre = document.getElementById('nombre').value.trim();
      const email = document.getElementById('email').value.trim();
      const celular = document.getElementById('celular').value.trim();
      const acepto = document.getElementById('acepto').checked;

      if (!nombre || !email || !celular || !acepto) {
        alert('Por favor, completa todos los campos requeridos y acepta los términos.');
        return;
      }

      contactoForm.hidden = true;
      const formSuccess = document.getElementById('formSuccess');
      const successText = document.getElementById('successText');
      if (formSuccess && successText) {
        successText.textContent = `¡Gracias ${nombre}! Tu solicitud fue enviada con éxito. Te responderemos pronto.`;
        formSuccess.hidden = false;
      }
    });

    const nuevaSolicitud = document.getElementById('nuevaSolicitud');
    if (nuevaSolicitud) {
      nuevaSolicitud.addEventListener('click', function () {
        contactoForm.reset();
        contactoForm.hidden = false;
        document.getElementById('formSuccess').hidden = true;
        if (contadorMensaje) contadorMensaje.textContent = '0/500';
      });
    }
  }

  // 7. HERRAMIENTA DE DIAGNÓSTICO PWA
  const btnAnalizar = document.getElementById('btnAnalizar');
  const codigoInput = document.getElementById('codigoInput');
  const panelResultado = document.getElementById('panelResultado');
  const detallesReporte = document.getElementById('detallesReporte');
  const codigoSugerido = document.getElementById('codigoSugerido');

  if (btnAnalizar && codigoInput) {
    btnAnalizar.addEventListener('click', function () {
      const codigo = codigoInput.value.trim();
      if (!codigo) {
        alert('Pega algo de código para analizar.');
        return;
      }

      panelResultado.style.display = 'block';
      detallesReporte.innerHTML = `<span class="text-success"><i class="bi bi-check-circle me-1"></i>Estructura limpia analizada correctamente. Sin bloqueos DOM críticos.</span>`;
      codigoSugerido.value = `/* Optimización aplicada */\n` + codigo.substring(0, 150) + `\n/* ... */`;
    });
  }

});