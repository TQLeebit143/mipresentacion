(() => {
  const limpiarTexto = (valor) => {
    const limpio = String(valor ?? '').trim();
    if (window.DOMPurify) {
      return window.DOMPurify.sanitize(limpio, { ALLOWED_TAGS: [], ALLOWED_ATTR: [] });
    }
    return limpio;
  };

  const crearSvgRespaldo = (titulo) => {
    const t = limpiarTexto(titulo || 'Ale Portfolio').slice(0, 28);
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 260"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#161a22"/><stop offset="100%" stop-color="#2a121b"/></linearGradient></defs><rect width="400" height="260" fill="url(#g)"/><text x="200" y="120" text-anchor="middle" fill="#e63946" font-family="Georgia,serif" font-size="34" font-weight="700">✦</text><text x="200" y="162" text-anchor="middle" fill="#f0f3f9" font-family="Segoe UI,sans-serif" font-size="14" font-weight="600">${t}</text></svg>`;
    return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
  };

  const sincronizarSupabaseSiHayRed = () => {
    if (!navigator.onLine) return;
    if (window.SupabaseDW2 && typeof window.SupabaseDW2.sincronizar === 'function') {
      window.SupabaseDW2.sincronizar().catch(() => {});
    }
  };

  const activarZoomInteractivo = (contenedor, imagen) => {
    if (!contenedor || !imagen) return;
    contenedor.addEventListener('click', () => {
      const activo = contenedor.classList.toggle('is-zoomed');
      if (!activo) {
        imagen.style.transformOrigin = 'center center';
      }
    });
    contenedor.addEventListener('mousemove', (e) => {
      if (!contenedor.classList.contains('is-zoomed')) return;
      const rect = contenedor.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      imagen.style.transformOrigin = `${x}% ${y}%`;
    });
  };

  document.addEventListener('DOMContentLoaded', () => {
    document.body.dataset.hidratado = 'true';

    document.querySelectorAll('img').forEach((img) => {
      const aplicarRespaldo = () => {
        if (img.dataset.fallbackApplied) return;
        img.dataset.fallbackApplied = 'true';
        img.src = crearSvgRespaldo(img.alt || 'Vista previa');
      };
      if (img.complete && img.naturalWidth === 0 && img.getAttribute('src')) {
        aplicarRespaldo();
      }
      img.addEventListener('error', aplicarRespaldo);
    });

    const root = document.documentElement;
    const themeBtn = document.getElementById('themeBtn');
    const menuBtn = document.getElementById('menuBtn');
    const menuPrincipal = document.getElementById('menuPrincipal');
    const estadoRedBadge = document.getElementById('estadoRedBadge');

    const aplicarTema = (tema) => {
      const temaValido = tema === 'light' ? 'light' : 'dark';
      root.setAttribute('data-theme', temaValido);
      root.setAttribute('data-bs-theme', temaValido);
      localStorage.setItem('tema', temaValido);
      if (themeBtn) {
        const icono = themeBtn.querySelector('i');
        if (icono) {
          icono.className = temaValido === 'dark' ? 'bi bi-sun' : 'bi bi-moon-stars';
        }
      }
    };

    aplicarTema(localStorage.getItem('tema') || root.getAttribute('data-theme') || 'dark');

    if (themeBtn) {
      themeBtn.addEventListener('click', () => {
        const actual = root.getAttribute('data-theme');
        aplicarTema(actual === 'dark' ? 'light' : 'dark');
      });
    }

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

      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && menuPrincipal.classList.contains('is-open')) {
          menuPrincipal.classList.remove('is-open');
          menuBtn.setAttribute('aria-expanded', 'false');
          menuBtn.focus();
        }
      });
    }

    const actualizarEstadoRed = () => {
      if (estadoRedBadge) {
        if (navigator.onLine) {
          estadoRedBadge.textContent = 'En Línea';
          estadoRedBadge.classList.remove('is-offline');
        } else {
          estadoRedBadge.textContent = 'Modo Offline Activo (Datos Locales)';
          estadoRedBadge.classList.add('is-offline');
        }
      }
      sincronizarSupabaseSiHayRed();
    };

    actualizarEstadoRed();
    window.addEventListener('online', actualizarEstadoRed);
    window.addEventListener('offline', actualizarEstadoRed);

    let deferredPrompt = null;
    const btnInstalarPWA = document.getElementById('btnInstalarPWA');

    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      deferredPrompt = e;
      if (btnInstalarPWA) btnInstalarPWA.hidden = false;
    });

    if (btnInstalarPWA) {
      btnInstalarPWA.addEventListener('click', async () => {
        if (!deferredPrompt) return;
        deferredPrompt.prompt();
        await deferredPrompt.userChoice;
        deferredPrompt = null;
        btnInstalarPWA.hidden = true;
      });
    }

    if ('serviceWorker' in navigator && location.protocol.startsWith('http')) {
      navigator.serviceWorker.register('./sw.js').catch(() => {});
    }

    const activarSeccion = (idSeccion) => {
      if (!idSeccion) return;
      const destinoEl = document.getElementById(idSeccion);
      document.querySelectorAll('.vista-seccion').forEach((sec) => {
        sec.classList.toggle('is-vista-activa', sec.id === idSeccion);
      });
      document.querySelectorAll('.dock-link').forEach((link) => {
        link.classList.toggle('is-active', link.dataset.vistaTarget === idSeccion);
      });
      if (menuPrincipal && menuBtn) {
        menuPrincipal.classList.remove('is-open');
        menuBtn.setAttribute('aria-expanded', 'false');
      }
      if (destinoEl) {
        destinoEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
      sincronizarSupabaseSiHayRed();
    };

    document.addEventListener('click', (e) => {
      const trigger = e.target.closest('[data-vista-target]');
      if (!trigger) return;
      e.preventDefault();
      activarSeccion(trigger.dataset.vistaTarget);
    });

    const btnSimularContraste = document.getElementById('btnSimularContraste');
    if (btnSimularContraste) {
      btnSimularContraste.addEventListener('click', () => {
        const activo = document.body.classList.toggle('alto-contraste');
        btnSimularContraste.setAttribute('aria-pressed', String(activo));
      });
    }

    const btnSimularVista = document.getElementById('btnSimularVista');
    if (btnSimularVista) {
      btnSimularVista.addEventListener('click', () => {
        const activo = document.body.classList.toggle('vista-movil-simulada');
        btnSimularVista.setAttribute('aria-pressed', String(activo));
        const texto = btnSimularVista.querySelector('span');
        if (texto) texto.textContent = activo ? 'Escritorio' : 'Móvil';
      });
    }

    const btnModoScrollMvl = document.getElementById('btnModoScrollMvl');
    if (btnModoScrollMvl) {
      btnModoScrollMvl.addEventListener('click', () => {
        const activo = document.body.classList.toggle('modo-scroll-continuo');
        btnModoScrollMvl.setAttribute('aria-pressed', String(activo));
      });
    }

    const btnSmokeTest = document.getElementById('btnSmokeTest');
    const salidaAudit = document.getElementById('salidaAudit');
    if (btnSmokeTest && salidaAudit) {
      btnSmokeTest.addEventListener('click', () => {
        const botones = document.querySelectorAll('button').length;
        const sinAlt = Array.from(document.querySelectorAll('img')).filter((img) => !img.hasAttribute('alt') || img.getAttribute('alt').trim() === '').length;
        const enlacesVacios = Array.from(document.querySelectorAll('a')).filter((a) => !a.getAttribute('href') || a.getAttribute('href') === '#').length;
        salidaAudit.textContent = `Smoke Test OK | Botones: ${botones} | Imágenes sin alt: ${sinAlt} | Enlaces vacíos: ${enlacesVacios}`;
      });
    }

    const btnAuditarA11Y = document.getElementById('btnAuditarA11Y');
    const reporteA11Y = document.getElementById('reporteA11Y');
    if (btnAuditarA11Y && reporteA11Y) {
      btnAuditarA11Y.addEventListener('click', () => {
        const semanticas = document.querySelectorAll('header, nav, main, section, article, aside, footer').length;
        const sinAlt = Array.from(document.querySelectorAll('img')).filter((img) => !img.hasAttribute('alt') || img.getAttribute('alt').trim() === '').length;
        reporteA11Y.textContent = `Auditoría en vivo: ${semanticas} etiquetas semánticas HTML5 detectadas | Imágenes sin alt: ${sinAlt}`;
      });
    }

    const gridFavoritos = document.getElementById('gridFavoritos');
    if (gridFavoritos) {
      gridFavoritos.querySelectorAll('.fav-card').forEach((card) => {
        if (card.querySelector('.btn-simular')) return;
        const link = card.querySelector('.link-more');
        const contenedor = link ? link.parentElement : card;
        if (!contenedor) return;

        const acciones = document.createElement('div');
        acciones.className = 'card-footer-actions mt-auto';

        if (link) {
          link.classList.remove('mt-auto');
          contenedor.insertBefore(acciones, link);
          acciones.appendChild(link);
        } else {
          contenedor.appendChild(acciones);
        }

        const btnSim = document.createElement('button');
        btnSim.type = 'button';
        btnSim.className = 'btn-simular';
        btnSim.textContent = 'Simular estado';
        acciones.appendChild(btnSim);

        const estadoP = document.createElement('p');
        estadoP.className = 'estado-tarjeta';
        estadoP.hidden = true;
        estadoP.textContent = 'Estado: Seleccionado (Simulación)';
        contenedor.appendChild(estadoP);
      });
    }

    document.addEventListener('click', (e) => {
      const btn = e.target.closest('.btn-simular');
      if (!btn) return;
      e.preventDefault();
      e.stopPropagation();
      const tarjeta = btn.closest('.card-item');
      if (!tarjeta) return;
      const activa = tarjeta.classList.toggle('card-item--activo');
      const textoEstado = tarjeta.querySelector('.estado-tarjeta');
      if (textoEstado) {
        textoEstado.hidden = !activa;
        textoEstado.textContent = 'Estado: Seleccionado (Simulación)';
      }
    });

    const libroBtns = document.querySelectorAll('[data-libro-filtro]');
    const libroCols = document.querySelectorAll('.libro-item-col');
    const conteoLibros = document.getElementById('conteoLibros');
    const actualizarLibros = (filtro = 'todos') => {
      let visibles = 0;
      libroCols.forEach((col) => {
        const mostrar = filtro === 'todos' || col.dataset.genero === filtro;
        col.hidden = !mostrar;
        if (mostrar) visibles++;
      });
      if (conteoLibros) {
        conteoLibros.textContent = `Mostrando ${visibles} de ${libroCols.length} obras literarias`;
      }
    };
    libroBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        const filtro = btn.dataset.libroFiltro || 'todos';
        libroBtns.forEach((b) => {
          const activo = b === btn;
          b.classList.toggle('is-active', activo);
          b.setAttribute('aria-pressed', String(activo));
        });
        actualizarLibros(filtro);
      });
    });
    actualizarLibros('todos');

    const cineBtns = document.querySelectorAll('[data-cine-filtro]');
    const cineCols = document.querySelectorAll('.cine-item-col');
    cineBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        const filtro = btn.dataset.cineFiltro;
        cineBtns.forEach((b) => b.classList.toggle('is-active', b === btn));
        cineCols.forEach((col) => {
          col.hidden = filtro !== 'todos' && col.dataset.tipo !== filtro;
        });
      });
    });

    const favBtns = document.querySelectorAll('[data-filtro]');
    const subMusica = document.getElementById('sub-musica');
    const subJuegos = document.getElementById('sub-juegos');
    const conteoFavoritos = document.getElementById('conteoFavoritos');
    let filtroPrincipal = 'todos';
    let subFiltroActual = '';

    const actualizarFavoritos = () => {
      if (!gridFavoritos) return;
      const items = gridFavoritos.querySelectorAll('[data-tipo]');
      let visibles = 0;
      items.forEach((item) => {
        const coincideTipo = filtroPrincipal === 'todos' || item.dataset.tipo === filtroPrincipal;
        const coincideSub = !subFiltroActual || item.dataset.sub === subFiltroActual;
        const mostrar = coincideTipo && coincideSub;
        item.hidden = !mostrar;
        if (mostrar) visibles++;
      });
      if (conteoFavoritos) {
        conteoFavoritos.textContent = `Mostrando ${visibles} de ${items.length} elementos`;
      }
    };

    favBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        filtroPrincipal = btn.dataset.filtro || 'todos';
        subFiltroActual = '';
        favBtns.forEach((b) => {
          const activo = b === btn;
          b.classList.toggle('is-active', activo);
          b.setAttribute('aria-pressed', String(activo));
        });
        if (subMusica) subMusica.hidden = filtroPrincipal !== 'musica';
        if (subJuegos) subJuegos.hidden = filtroPrincipal !== 'juegos';
        document.querySelectorAll('[data-sub-filtro]').forEach((sb) => {
          const esTodos = sb.dataset.subFiltro === '';
          sb.classList.toggle('is-active', esTodos);
          sb.setAttribute('aria-pressed', String(esTodos));
        });
        actualizarFavoritos();
      });
    });

    document.querySelectorAll('[data-sub-filtro]').forEach((btn) => {
      btn.addEventListener('click', () => {
        subFiltroActual = btn.dataset.subFiltro || '';
        const grupo = btn.parentElement;
        if (grupo) {
          grupo.querySelectorAll('[data-sub-filtro]').forEach((sb) => {
            const activo = sb === btn;
            sb.classList.toggle('is-active', activo);
            sb.setAttribute('aria-pressed', String(activo));
          });
        }
        actualizarFavoritos();
      });
    });

    actualizarFavoritos();

    const modalLibro = document.getElementById('modalLibro');
    const libroZoomWrap = document.getElementById('libroZoomWrap');
    const libroImgModal = document.getElementById('libroImgModal');

    if (modalLibro) {
      modalLibro.addEventListener('show.bs.modal', (e) => {
        const card = e.relatedTarget;
        if (!card) return;
        const img = card.querySelector('img');
        const libroTitulo = document.getElementById('libroTitulo');
        const libroAutorAnio = document.getElementById('libroAutorAnio');
        const libroDesc = document.getElementById('libroDesc');

        if (libroZoomWrap) libroZoomWrap.classList.remove('is-zoomed');
        if (libroImgModal) {
          libroImgModal.style.transformOrigin = 'center center';
          if (img) {
            libroImgModal.src = img.src;
            libroImgModal.alt = `Portada de ${limpiarTexto(card.dataset.titulo)}`;
          }
        }
        if (libroTitulo) libroTitulo.textContent = limpiarTexto(card.dataset.titulo);
        if (libroAutorAnio) {
          libroAutorAnio.textContent = `${limpiarTexto(card.dataset.autor)} · ${limpiarTexto(card.dataset.anio)}`;
        }
        if (libroDesc) libroDesc.textContent = limpiarTexto(card.dataset.desc);
      });

      modalLibro.addEventListener('hidden.bs.modal', () => {
        if (libroZoomWrap) libroZoomWrap.classList.remove('is-zoomed');
        if (libroImgModal) libroImgModal.style.transformOrigin = 'center center';
      });
    }

    activarZoomInteractivo(libroZoomWrap, libroImgModal);

    document.querySelectorAll('.card-book').forEach((card) => {
      card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          card.click();
        }
      });
    });

    const modalImagenZoom = document.getElementById('modalImagenZoom');
    const galeriaZoomWrap = document.getElementById('galeriaZoomWrap');
    const galeriaImgModal = document.getElementById('galeriaImgModal');
    const modalImagenZoomLabel = document.getElementById('modalImagenZoomLabel');
    const galeriaDescModal = document.getElementById('galeriaDescModal');

    const abrirZoomImagen = (imgEl) => {
      if (!modalImagenZoom || !galeriaImgModal || !imgEl) return;
      const slide = imgEl.closest('.carousel-item');
      const card = imgEl.closest('.fav-card');
      const titulo = slide?.querySelector('h3')?.textContent
        || card?.querySelector('.fav-title')?.textContent
        || imgEl.alt
        || 'Vista ampliada';
      const descripcion = slide?.querySelector('p')?.textContent
        || card?.querySelector('.fav-text')?.textContent
        || imgEl.alt
        || '';

      if (galeriaZoomWrap) galeriaZoomWrap.classList.remove('is-zoomed');
      galeriaImgModal.style.transformOrigin = 'center center';
      galeriaImgModal.src = imgEl.src;
      galeriaImgModal.alt = imgEl.alt || limpiarTexto(titulo);
      if (modalImagenZoomLabel) modalImagenZoomLabel.textContent = limpiarTexto(titulo);
      if (galeriaDescModal) galeriaDescModal.textContent = limpiarTexto(descripcion);

      if (window.bootstrap?.Modal) {
        window.bootstrap.Modal.getOrCreateInstance(modalImagenZoom).show();
      }
    };

    document.querySelectorAll('.carousel-img, .fav-card-img').forEach((img) => {
      img.setAttribute('tabindex', '0');
      img.setAttribute('role', 'button');
      img.setAttribute('title', 'Haz clic para ampliar la imagen');
      img.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        abrirZoomImagen(img);
      });
      img.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          abrirZoomImagen(img);
        }
      });
    });

    if (modalImagenZoom) {
      modalImagenZoom.addEventListener('hidden.bs.modal', () => {
        if (galeriaZoomWrap) galeriaZoomWrap.classList.remove('is-zoomed');
        if (galeriaImgModal) galeriaImgModal.style.transformOrigin = 'center center';
      });
    }

    activarZoomInteractivo(galeriaZoomWrap, galeriaImgModal);
  });
})();