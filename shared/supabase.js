(function () {
  'use strict';

  var COLA_KEY = 'dw2_supabase_cola';
  var MAX_COLA = 50;

  function config() {
    var c = window.SUPABASE_CONFIG || {};
    var url = String(c.url || '').replace(/\/+$/, '');
    var key = String(c.anonKey || '');
    return { url: url, key: key };
  }

  function configurado() {
    var c = config();
    return /^https:\/\/.+\.supabase\.(co|in)$/.test(c.url) && c.key.length > 10;
  }

  function leerCola() {
    try {
      var raw = localStorage.getItem(COLA_KEY);
      var lista = raw ? JSON.parse(raw) : [];
      return Array.isArray(lista) ? lista : [];
    } catch (e) {
      return [];
    }
  }

  function escribirCola(lista) {
    try {
      localStorage.setItem(COLA_KEY, JSON.stringify(lista.slice(-MAX_COLA)));
    } catch (e) {
    }
  }

  function encolar(tabla, datos) {
    var lista = leerCola();
    lista.push({ tabla: tabla, datos: datos, fecha: new Date().toISOString() });
    escribirCola(lista);
  }

  function enviar(tabla, datos) {
    var c = config();
    return fetch(c.url + '/rest/v1/' + encodeURIComponent(tabla), {
      method: 'POST',
      headers: {
        'apikey': c.key,
        'Authorization': 'Bearer ' + c.key,
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify(datos)
    }).then(function (respuesta) {
      if (!respuesta.ok) {
        return respuesta.text().then(function (texto) {
          throw new Error('Supabase ' + respuesta.status + ': ' + texto.slice(0, 120));
        });
      }
      return { ok: true };
    });
  }

  function guardar(tabla, datos) {
    if (!tabla || !datos || typeof datos !== 'object') {
      return Promise.resolve({ ok: false, motivo: 'datos-invalidos', encolado: false });
    }
    if (!configurado()) {
      encolar(tabla, datos);
      return Promise.resolve({ ok: false, motivo: 'sin-configurar', encolado: true });
    }
    return enviar(tabla, datos)
      .then(function (r) {
        return { ok: true, encolado: false, respuesta: r };
      })
      .catch(function (err) {
        encolar(tabla, datos);
        return { ok: false, motivo: err.message, encolado: true };
      });
  }

  function sincronizar() {
    if (!configurado()) {
      return Promise.resolve({ ok: false, motivo: 'sin-configurar', enviados: 0, pendientes: leerCola().length });
    }
    var lista = leerCola();
    if (!lista.length) {
      return Promise.resolve({ ok: true, enviados: 0, pendientes: 0 });
    }
    var enviados = 0;
    var pendientes = [];
    var cadena = Promise.resolve();

    lista.forEach(function (item) {
      cadena = cadena.then(function () {
        return enviar(item.tabla, item.datos)
          .then(function () { enviados += 1; })
          .catch(function () { pendientes.push(item); });
      });
    });

    return cadena.then(function () {
      escribirCola(pendientes);
      return { ok: pendientes.length === 0, enviados: enviados, pendientes: pendientes.length };
    });
  }

  function pendientes() {
    return leerCola().length;
  }

  window.addEventListener('online', function () {
    sincronizar();
  });

  if (configurado() && pendientes() > 0) {
    sincronizar();
  }

  window.SupabaseDW2 = {
    configurado: configurado,
    guardar: guardar,
    sincronizar: sincronizar,
    pendientes: pendientes,
    cola: leerCola
  };
})();