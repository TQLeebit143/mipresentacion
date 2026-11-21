(function () {
  'use strict';

  if (window.Validacion) return;

  var INSULTOS = [
    'puta', 'puto', 'putas', 'putos', 'putita', 'putito',
    'mierda', 'mierdas', 'pendejo', 'pendeja', 'pendejos', 'pendejas',
    'cabron', 'cabrona', 'cabrones', 'verga', 'vergas',
    'chinga', 'chingar', 'chingada', 'chingado', 'joder', 'jodete', 'jodido', 'jodida',
    'coño', 'coños', 'gilipollas', 'idiota', 'idiotas', 'imbecil', 'imbeciles',
    'estupido', 'estupida', 'estupidos', 'marica', 'maricon', 'maricones',
    'zorra', 'zorras', 'perra', 'perras', 'culero', 'culiao', 'culia',
    'boludo', 'boluda', 'huevon', 'huevona', 'pija', 'pijas', 'tonto', 'tonta',
    'malparido', 'hijueputa', 'gonorrea', 'careculo', 'carechimba'
  ];

  var INSULTOS_CORTOS = ['ptm', 'ctm', 'csm', 'mrd', 'hpta', 'qliao', 'qlia', 'hp'];

  var REQUERIDOS = [
    'icecontactname', 'icecontactemail', 'icecontactmsg',
    'citatutor', 'citamascota', 'citacelular', 'citafecha',
    'pwacitatutor', 'pwacitamascota', 'pwacitacelular', 'pwacitafecha',
    'vetaliasinput', 'icealiasinput', 'pwaaliasinput',
    'vetclientalias', 'iceclientalias', 'pwaclientalias',
    'gamertaginput', 'pwagamertaginput', 'ciberclientgamertag', 'pwaclientgamertag',
    'icecheckoutnombre', 'pwacheckoutnombre', 'checkoutcliente', 'pwacheckoutcliente',
    'vetadminuser', 'vetadminpass', 'iceadminuser', 'iceadminpass',
    'ciberadminuser', 'ciberadminpass', 'pwaadminuser', 'pwaadminpass',
    'reservanombre', 'pwareservanombre', 'pwakaraokeinput',
    'inputaliashero', 'inputmodalalias', 'inputaliaspwa', 'inputcuentaaliaspwa',
    'contactonombre', 'contactomensaje', 'contactotelefono', 'contactoemail',
    'inputpacientenombre', 'inputpacientecelular', 'inputgraduacionojos',
    'inputaliaspwaoptica', 'nombrepacientepwaoptica', 'opticaadminuser'
  ];

  var MENSAJES = {
    nombre: 'Escribe tu nombre.',
    alias: 'Escribe un alias.',
    email: 'Escribe tu correo electrónico.',
    telefono: 'Escribe tu celular.',
    texto: 'Escribe un mensaje.',
    titulo: 'Escribe el nombre de la canción o artista.',
    password: 'Escribe la contraseña.',
    usuario: 'Escribe el usuario.',
    fecha: 'Elige una fecha.',
    select: 'Selecciona una opción.',
    checkbox: 'Marca esta casilla para continuar.',
    numero: 'Escribe un número.'
  };

  var CONTRASENAS_DEBILES = ['123456', '1234567', '12345678', '123456789', 'password', 'admin123', 'qwerty', 'abcdef', '000000', '111111'];

  function limpiar(valor) {
    var limpio = String(valor == null ? '' : valor).replace(/\s+/g, ' ').trim();
    if (window.DOMPurify) {
      return window.DOMPurify.sanitize(limpio, { ALLOWED_TAGS: [], ALLOWED_ATTR: [] });
    }
    return limpio;
  }

  function normalizar(valor) {
    var texto = String(valor == null ? '' : valor).toLowerCase();
    if (texto.normalize) {
      texto = texto.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    }
    return texto;
  }

  function desleet(texto) {
    var mapa = { '0': 'o', '1': 'i', '3': 'e', '4': 'a', '5': 's', '7': 't', '@': 'a', '$': 's', '!': 'i' };
    var salida = '';
    for (var i = 0; i < texto.length; i++) {
      var c = texto.charAt(i);
      salida += mapa[c] || c;
    }
    return salida;
  }

  function palabrasDe(texto) {
    return normalizar(texto).split(/[^a-zñ]+/).filter(Boolean);
  }

  function tieneInsulto(texto) {
    var palabras = palabrasDe(desleet(String(texto || '')));
    for (var i = 0; i < palabras.length; i++) {
      var p = palabras[i];
      if (INSULTOS.indexOf(p) >= 0 || INSULTOS_CORTOS.indexOf(p) >= 0) return true;
      if (p.length > 4 && INSULTOS.indexOf(p.slice(0, -1)) >= 0) return true;
    }
    return false;
  }

  function esPeriodico(t) {
    for (var p = 3; p <= 4; p++) {
      if (t.length < p * 2) continue;
      var igual = true;
      for (var i = 0; i < t.length; i++) {
        if (t.charAt(i) !== t.charAt(i % p)) { igual = false; break; }
      }
      if (igual) return true;
    }
    return false;
  }

  function esBasura(token, estricto) {
    var t = normalizar(token).replace(/[^a-zñ]/g, '');
    if (t.length < 4) return false;

    var vocales = (t.match(/[aeiouy]/g) || []).length;
    if (!vocales) return true;
    if (estricto && /(.)\1{2,}/.test(t)) return true;
    if (/[bcdfghjklmnñpqrstvwxyz]{5,}/.test(t)) return true;
    if (vocales / t.length < 0.2) return true;
    if (/(asdf|sdfg|dfgh|fghj|ghjk|hjkl|qwer|wert|erty|rtyu|tyui|yuio|uiop|zxcv|xcvb|cvbn|vbnm)/.test(t)) return true;
    if (/(abcd|bcde|cdef|defg|efgh|fghi|ghij|hijk|ijkl|jklm|klmn|lmno|mnop|nopq|opqr|pqrs|qrst|rstu|stuv|tuvw|uvwx|vwxy|wxyz|1234|2345|3456|4567|5678|6789)/.test(t)) return true;
    if (estricto && esPeriodico(t)) return true;
    return false;
  }

  function esSecuenciaDeDigitos(digitos) {
    var asc = true;
    var desc = true;
    for (var i = 1; i < digitos.length; i++) {
      var antes = Number(digitos.charAt(i - 1));
      var ahora = Number(digitos.charAt(i));
      if (ahora !== (antes + 1) % 10) asc = false;
      if (ahora !== (antes + 9) % 10) desc = false;
    }
    return asc || desc;
  }

  var reglas = {
    nombre: function (valor, conf) {
      var v = limpiar(valor);
      if (!v) return conf && conf.requerido ? MENSAJES.nombre : '';
      if (/\d/.test(v)) return 'El nombre no puede llevar números.';
      if (!/^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ'’. -]+$/.test(v)) return 'Usa solo letras, espacios, apóstrofes o guiones.';
      if (v.length < 2) return 'El nombre es demasiado corto.';

      var trozos = v.split(/[\s'’.]+/).filter(Boolean);
      var letras = (v.match(/[A-Za-zÁÉÍÓÚÜÑáéíóúüñ]/g) || []).length;
      if (letras < 2) return 'El nombre necesita al menos dos letras.';

      for (var i = 0; i < trozos.length; i++) {
        if (esBasura(trozos[i], true)) {
          return 'Ese nombre parece escrito al azar. Revisa cómo lo escribiste.';
        }
      }
      if (tieneInsulto(v)) return 'Usa un nombre real, sin palabras ofensivas.';
      return '';
    },

    alias: function (valor, conf) {
      var v = limpiar(valor);
      if (!v) return conf && conf.requerido ? MENSAJES.alias : '';
      if (v.length < 3) return 'El alias debe tener al menos 3 caracteres.';
      if (!/^[A-Za-z0-9ÁÉÍÓÚÜÑáéíóúüñ _.\-]+$/.test(v)) {
        return 'El alias solo admite letras, números, espacios, punto, guion o guion bajo.';
      }
      if (!/[A-Za-zÁÉÍÓÚÜÑáéíóúüñ]{2}/.test(v)) {
        return 'El alias debe incluir al menos dos letras (no solo números).';
      }
      var letras = v.replace(/[^A-Za-zÁÉÍÓÚÜÑáéíóúüñ]/g, '');
      if (letras.length >= 4 && esBasura(letras, false)) {
        return 'Ese alias parece escrito al azar.';
      }
      if (tieneInsulto(v)) return 'Elige un alias sin palabras ofensivas.';
      return '';
    },

    email: function (valor, conf) {
      var v = limpiar(valor);
      if (!v) return conf && conf.requerido ? MENSAJES.email : '';
      if (/\s/.test(v)) return 'El correo no puede llevar espacios.';
      if (v.length > 80) return 'El correo es demasiado largo.';
      if (!/^[A-Za-z0-9._%+-]+@[A-Za-z0-9-]+(\.[A-Za-z0-9-]+)*\.[A-Za-z]{2,24}$/.test(v)) {
        return 'Escribe un correo válido, por ejemplo nombre@gmail.com.';
      }
      if (/\.\./.test(v) || /^[.-]/.test(v) || /[.-]@/.test(v) || /@[.-]/.test(v)) {
        return 'El correo tiene puntos o guiones mal ubicados.';
      }
      var local = v.split('@')[0];
      if (local.length < 2) return 'El correo es demasiado corto.';
      if (tieneInsulto(local)) return 'Escribe un correo real, sin palabras ofensivas.';
      return '';
    },

    telefono: function (valor, conf) {
      var v = limpiar(valor).replace(/[\s().-]/g, '');
      if (!v) return conf && conf.requerido ? MENSAJES.telefono : '';
      if (!/^\+?\d+$/.test(v)) return 'El celular solo debe tener números.';

      var digitos = v.replace(/\D/g, '');
      var exacto = (conf && conf.exacto) || 0;
      if (!exacto && conf && conf.campo) {
        var patron = conf.campo.getAttribute('pattern') || '';
        var totalPatron = 0;
        var resto = patron.replace(/(\\d|\[[^\]]*\]|\.)\{(\d+)(,(\d*))?\}/g, function (_, atomo, n, _grupo, m) {
          totalPatron += Number(m || n);
          return '';
        });
        totalPatron += (resto.match(/\\d|\[[^\]]*\]|\d/g) || []).length;
        if (totalPatron >= 7 && totalPatron <= 15) exacto = totalPatron;
        var tope = conf.campo.maxLength;
        if (!exacto && tope >= 7 && tope <= 9) exacto = tope;
      }

      if (exacto) {
        if (digitos.length !== exacto) return 'El celular debe tener ' + exacto + ' dígitos.';
      } else {
        if (digitos.length < 7) return 'El celular debe tener al menos 7 dígitos.';
        if (digitos.length > 15) return 'El celular tiene demasiados dígitos.';
      }

      if (/^(\d)\1+$/.test(digitos)) return 'Ese número no parece real.';
      if (digitos.length >= 7 && esSecuenciaDeDigitos(digitos)) return 'Ese número no parece real.';
      var prefijo = conf && conf.campo ? (conf.campo.getAttribute('data-prefijo') || '') : '';
      if (prefijo && prefijo.indexOf(digitos.charAt(0)) < 0) {
        var opciones = prefijo.split('').join(' o ');
        return 'El celular debe empezar con ' + opciones + '.';
      }
      return '';
    },

    texto: function (valor, conf) {
      var v = limpiar(valor);
      var min = (conf && conf.min) || (conf && conf.requerido ? 10 : 2);
      var max = (conf && conf.max) || 600;
      if (!v) return conf && conf.requerido ? MENSAJES.texto : '';
      if (v.length < min) return 'Escribe al menos ' + min + ' caracteres.';
      if (v.length > max) return 'El texto no puede pasar de ' + max + ' caracteres.';

      var palabras = v.split(/\s+/).filter(Boolean);
      var conLetras = palabras.filter(function (p) { return /[A-Za-zÁÉÍÓÚÜÑáéíóúüñ]/.test(p); });
      var letras = (v.match(/[A-Za-zÁÉÍÓÚÜÑáéíóúüñ]/g) || []).length;

      if (!conLetras.length) return 'Escribe un mensaje con palabras, no solo números o símbolos.';
      var minLetras = conf && conf.requerido ? 6 : 2;
      if (letras < minLetras) return 'Escribe un mensaje un poco más claro.';
      if (conf && conf.requerido && conLetras.length < 2 && letras < 12) return 'Cuéntanos un poco más (al menos dos palabras).';

      var basura = conLetras.filter(function (p) {
        return p.replace(/[^A-Za-zÁÉÍÓÚÜÑáéíóúüñ]/g, '').length >= 5 && esBasura(p, false);
      });
      if (basura.length) return 'Hay una palabra que parece escrita al azar ("' + basura[0].slice(0, 12) + '"). Revísala.';
      if (tieneInsulto(v)) return 'Evita las palabras ofensivas en el mensaje.';
      return '';
    },

    titulo: function (valor, conf) {
      var v = limpiar(valor);
      if (!v) return conf && conf.requerido ? MENSAJES.titulo : '';
      if (v.length < 3) return 'Escribe al menos 3 caracteres.';
      if (!/^[A-Za-z0-9ÁÉÍÓÚÜÑáéíóúüñ &'’.,()\/\-]+$/.test(v)) return 'Quita los símbolos raros del título.';
      if (!/[A-Za-zÁÉÍÓÚÜÑáéíóúüñ]{2}/.test(v)) return 'El título necesita al menos dos letras.';
      if (esBasura(v.replace(/[^A-Za-zÁÉÍÓÚÜÑáéíóúüñ]/g, ''), false)) return 'Ese título parece escrito al azar.';
      if (tieneInsulto(v)) return 'Elige un título sin palabras ofensivas.';
      return '';
    },

    usuario: function (valor, conf) {
      var v = limpiar(valor);
      if (!v) return conf && conf.requerido ? MENSAJES.usuario : '';
      if (!/^[A-Za-z0-9._-]{3,30}$/.test(v)) return 'El usuario debe tener de 3 a 30 letras o números, sin espacios.';
      if (/^\d+$/.test(v)) return 'El usuario debe incluir al menos una letra.';
      var letras = v.replace(/[^A-Za-zÁÉÍÓÚÜÑáéíóúüñ]/g, '');
      if (letras.length >= 4 && esBasura(letras, false)) return 'Ese usuario parece escrito al azar.';
      if (tieneInsulto(v)) return 'Elige un usuario sin palabras ofensivas.';
      return '';
    },

    password: function (valor, conf) {
      var v = String(valor == null ? '' : valor);
      if (!v) return conf && conf.requerido ? MENSAJES.password : '';
      if (/\s/.test(v)) return 'La contraseña no puede llevar espacios.';
      if (v.length < 6) return 'La contraseña debe tener al menos 6 caracteres.';
      if (CONTRASENAS_DEBILES.indexOf(v.toLowerCase()) >= 0) return 'Esa contraseña es demasiado fácil. Usa otra.';
      if (/^(.)\1+$/.test(v)) return 'La contraseña no puede ser el mismo carácter repetido.';
      return '';
    },

    numero: function (valor, conf) {
      var v = limpiar(valor);
      if (!v) return conf && conf.requerido ? MENSAJES.numero : '';
      var n = Number(v);
      if (!isFinite(n)) return 'Escribe un número válido.';
      if (conf && conf.campo) {
        var min = parseFloat(conf.campo.getAttribute('min'));
        var max = parseFloat(conf.campo.getAttribute('max'));
        if (isFinite(min) && n < min) return 'El valor mínimo es ' + min + '.';
        if (isFinite(max) && n > max) return 'El valor máximo es ' + max + '.';
      }
      return '';
    },

    fecha: function (valor, conf) {
      var v = limpiar(valor);
      if (!v) return conf && conf.requerido ? MENSAJES.fecha : '';
      var fecha = new Date(v + 'T00:00:00');
      if (isNaN(fecha.getTime())) return 'Elige una fecha válida.';
      var min = conf && conf.campo ? conf.campo.getAttribute('min') : '';
      if (min) {
        var tope = new Date(min + 'T00:00:00');
        if (!isNaN(tope.getTime()) && fecha < tope) return 'La fecha no puede ser anterior a hoy.';
      }
      return '';
    },

    graduacion: function (valor, conf) {
      var v = limpiar(valor);
      if (!v) return conf && conf.requerido ? 'Escribe tu graduación o describe lo que necesitas.' : '';
      if (v.length > 80) return 'La graduación no puede pasar de 80 caracteres.';
      if (!/^[0-9A-Za-zÁÉÍÓÚÜÑáéíóúüñ\s.,+\-:/()°]+$/.test(v)) {
        return 'Usa solo números, letras y los signos OD / OI / + / -.';
      }
      if (!/\d/.test(v) && !/[A-Za-zÁÉÍÓÚÜÑáéíóúüñ]{3}/.test(v)) {
        return 'Escribe una medida (-1.50) o describe tu caso.';
      }
      var letras = v.replace(/[^A-Za-zÁÉÍÓÚÜÑáéíóúüñ]/g, '');
      if (letras.length >= 5 && esBasura(letras, false)) return 'Esa graduación parece escrita al azar.';
      if (tieneInsulto(v)) return 'Evita las palabras ofensivas.';
      return '';
    },

    select: function (valor, conf) {
      var campo = conf && conf.campo;
      var v = campo ? String(campo.value || '') : limpiar(valor);
      if (!v) return conf && conf.requerido ? MENSAJES.select : '';
      if (campo && campo.selectedIndex > 0) {
        var opcion = campo.options[campo.selectedIndex];
        if (opcion && /^(selecciona|elige|escoge|--)/i.test(opcion.text.trim())) return MENSAJES.select;
      }
      return '';
    },

    busqueda: function () { return ''; },
    libre: function () { return ''; }
  };

  function tipoDe(campo) {
    var forzado = campo.getAttribute('data-validar');
    if (forzado && reglas[forzado]) return forzado;

    var id = String(campo.id || '').toLowerCase();
    var name = String(campo.name || '').toLowerCase();
    var clave = id || name;

    if (campo.readOnly || campo.disabled) return 'libre';
    if (/codigo|readonly|honeypot/.test(clave)) return 'libre';
    if (campo.type === 'checkbox') return 'checkbox';
    if (campo.tagName === 'SELECT') return 'select';
    if (campo.type === 'date') return 'fecha';
    if (campo.type === 'email' || /email|correo/.test(clave)) return 'email';
    if (campo.type === 'tel' || /celular|telefono|phone|whatsapp/.test(clave)) return 'telefono';
    if (/pass|clave|contrasena/.test(clave)) {
      if (/admin|login|optometra/.test(clave)) return 'libre';
      return 'password';
    }
    if (/adminuser|adminusuario|inputuser|userpwa/.test(clave)) return 'usuario';
    if (/graduacion|receta|dioptria/.test(clave)) return 'graduacion';
    if (/gamertag|jugador|reserva/.test(clave)) return 'alias';
    if (/alias/.test(clave)) return 'alias';
    if (/mascota|mascot|pet$|^pet/.test(clave)) return 'nombre';
    if (/nombre|tutor|owner|cliente|name|apellido/.test(clave)) return 'nombre';
    if (/mensaje|msg|notas|nota|detalle|comentario|solicitud|descripcion/.test(clave)) return 'texto';
    if (/cancion|titulo|song|artista|karaoke/.test(clave)) return 'titulo';
    if (campo.type === 'search' || /busqueda|search|filtro/.test(clave)) return 'busqueda';
    if (/horas|cantidad|qty|numero|edad/.test(clave) || campo.type === 'number') return 'numero';
    return 'libre';
  }

  function esRequerido(campo, tipo) {
    if (campo.hasAttribute('required') || campo.getAttribute('data-requerido') === 'si') return true;
    if (tipo === 'checkbox' || tipo === 'select' || tipo === 'fecha' || tipo === 'numero') {
      return REQUERIDOS.indexOf(String(campo.id || '').toLowerCase()) >= 0;
    }
    return REQUERIDOS.indexOf(String(campo.id || '').toLowerCase()) >= 0;
  }

  function configDe(campo) {
    var tipo = tipoDe(campo);
    var min = parseInt(campo.getAttribute('minlength') || '', 10);
    var max = parseInt(campo.getAttribute('maxlength') || '', 10);
    return {
      tipo: tipo,
      campo: campo,
      requerido: esRequerido(campo, tipo),
      min: isFinite(min) ? min : undefined,
      max: isFinite(max) ? max : undefined
    };
  }

  var estiloInyectado = false;

  function inyectarEstilo() {
    if (estiloInyectado || !document.head) return;
    estiloInyectado = true;
    var style = document.createElement('style');
    style.setAttribute('data-validacion-estilo', '');
    style.textContent = [
      '.campo-error{margin:6px 0 0;font:600 .8rem/1.4 "Manrope",system-ui,sans-serif;color:#ff8fa3;display:flex;gap:6px;align-items:flex-start;}',
      '.campo-error::before{content:"⚠";flex:0 0 auto;}',
      '.campo-invalido{outline:2px solid #ff5d73;outline-offset:1px;border-radius:inherit;}',
      '.form-check .campo-error{margin-left:0;}'
    ].join('');
    document.head.appendChild(style);
  }

  function nodoError(campo, crear) {
    var id = (campo.id || campo.name || 'campo') + '-error';
    var nodo = document.getElementById(id);
    if (!nodo && crear) {
      nodo = document.createElement('p');
      nodo.id = id;
      nodo.className = 'campo-error';
      nodo.setAttribute('role', 'alert');
      var ancla = campo.type === 'checkbox' ? (campo.closest('.form-check') || campo) : campo;
      if (ancla.parentNode) ancla.parentNode.insertBefore(nodo, ancla.nextSibling);
    }
    return nodo;
  }

  function pintarError(campo, mensaje) {
    inyectarEstilo();
    var nodo = nodoError(campo, Boolean(mensaje));

    if (!mensaje) {
      campo.classList.remove('campo-invalido');
      campo.removeAttribute('aria-invalid');
      if (nodo) {
        nodo.textContent = '';
        nodo.remove();
      }
      return;
    }

    campo.classList.add('campo-invalido');
    campo.setAttribute('aria-invalid', 'true');
    if (nodo) {
      nodo.textContent = mensaje;
      campo.setAttribute('aria-describedby', nodo.id);
    }
  }

  function validarCampo(campo) {
    var conf = configDe(campo);
    if (conf.tipo === 'libre' || conf.tipo === 'busqueda') {
      pintarError(campo, '');
      return true;
    }

    var valor = campo.type === 'checkbox' ? '' : campo.value;
    var mensaje = '';

    if (conf.tipo === 'checkbox') {
      mensaje = conf.requerido && !campo.checked ? MENSAJES.checkbox : '';
    } else {
      mensaje = reglas[conf.tipo] ? reglas[conf.tipo](valor, conf) : '';
    }

    pintarError(campo, mensaje);
    return !mensaje;
  }

  function camposDe(form) {
    return Array.prototype.slice
      .call(form.querySelectorAll('input, textarea, select'))
      .filter(function (campo) {
        return !campo.disabled && !campo.readOnly &&
          ['hidden', 'submit', 'button', 'reset', 'file'].indexOf(campo.type) < 0;
      });
  }

  function validarFormulario(form) {
    var campos = camposDe(form);
    var primero = null;
    campos.forEach(function (campo) {
      if (!validarCampo(campo) && !primero) primero = campo;
    });
    if (primero) {
      primero.focus({ preventScroll: false });
      if (primero.scrollIntoView) primero.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return false;
    }
    return true;
  }

  function limpiarFormulario(form) {
    camposDe(form).forEach(function (campo) { pintarError(campo, ''); });
  }

  function alEnviar(event) {
    var form = event.target;
    if (!form || form.tagName !== 'FORM') return;
    if (form.getAttribute('data-validacion') === 'manual') return;
    if (!validarFormulario(form)) {
      event.preventDefault();
      event.stopPropagation();
      if (event.stopImmediatePropagation) event.stopImmediatePropagation();
    }
  }

  function alSalir(event) {
    var campo = event.target;
    if (!campo || !campo.matches || !campo.matches('input, textarea, select')) return;
    var form = campo.form;
    if (!form || form.getAttribute('data-validacion') === 'manual') return;
    if (campo.type === 'search') return;
    var conf = configDe(campo);
    if (conf.tipo === 'libre' || conf.tipo === 'busqueda') return;
    if (campo.type !== 'checkbox' && !String(campo.value || '').trim()) return;
    validarCampo(campo);
  }

  function alEscribir(event) {
    var campo = event.target;
    if (!campo || !campo.classList || !campo.classList.contains('campo-invalido')) return;
    validarCampo(campo);
  }

  function alReiniciar(event) {
    var form = event.target;
    if (!form || form.tagName !== 'FORM') return;
    limpiarFormulario(form);
  }

  function preparar() {
    var forms = document.querySelectorAll('form');
    Array.prototype.forEach.call(forms, function (form) {
      if (form.getAttribute('data-validacion') === 'manual') return;
      form.setAttribute('novalidate', '');
      form.setAttribute('autocomplete', form.getAttribute('autocomplete') || 'on');
    });
    inyectarEstilo();
  }

  function iniciarContactoManual() {
    var form = document.getElementById('contactoForm');
    if (!form || form.getAttribute('data-validacion') !== 'manual') return;

    var nombre = document.getElementById('nombre');
    var email = document.getElementById('email');
    var codigoPais = document.getElementById('codigoPais');
    var celular = document.getElementById('celular');
    var servicio = document.getElementById('servicio');
    var mensaje = document.getElementById('mensaje');
    var acepto = document.getElementById('acepto');
    var contadorMensaje = document.getElementById('contadorMensaje');
    var formAlert = document.getElementById('formAlert');
    var formSuccess = document.getElementById('formSuccess');
    var successText = document.getElementById('successText');
    var waEnviar = document.getElementById('waEnviar');
    var nuevaSolicitud = document.getElementById('nuevaSolicitud');
    var btnEnviar = document.getElementById('btnEnviar');

    function marcarCampo(input, errorId, msg) {
      var field = input.closest('.field');
      var errEl = document.getElementById(errorId);
      if (errEl) errEl.textContent = msg || '';
      if (field) {
        field.classList.toggle('is-invalid', Boolean(msg));
        field.classList.toggle('is-valid', !msg);
      }
      return !msg;
    }

    function validarNombreManual() {
      var err = reglas.nombre(nombre.value, { requerido: true });
      return marcarCampo(nombre, 'err-nombre', err);
    }

    function validarEmailManual() {
      var err = reglas.email(email.value, { requerido: true });
      return marcarCampo(email, 'err-email', err);
    }

    function validarCelularManual() {
      var digitos = celular.value.replace(/\D/g, '');
      celular.value = digitos;
      var pais = codigoPais ? codigoPais.value : '+591';
      var err = '';

      if (!digitos) {
        err = MENSAJES.telefono;
      } else if (pais === '+591') {
        if (!/^[67]\d{7}$/.test(digitos)) {
          err = 'Para Bolivia (+591) ingresa 8 dígitos iniciando en 6 o 7.';
        } else if (/^(\d)\1+$/.test(digitos) || esSecuenciaDeDigitos(digitos)) {
          err = 'Ese número no parece real.';
        }
      } else {
        err = reglas.telefono(digitos, { requerido: true, campo: celular });
      }
      return marcarCampo(celular, 'err-celular', err);
    }

    function validarServicioManual() {
      var err = reglas.select(servicio.value, { requerido: true, campo: servicio });
      return marcarCampo(servicio, 'err-servicio', err);
    }

    function validarMensajeManual() {
      if (contadorMensaje) contadorMensaje.textContent = mensaje.value.length + '/500';
      var err = reglas.texto(mensaje.value, { requerido: true, min: 12, max: 500 });
      return marcarCampo(mensaje, 'err-mensaje', err);
    }

    function validarAceptoManual() {
      var err = !acepto.checked ? MENSAJES.checkbox : '';
      return marcarCampo(acepto, 'err-acepto', err);
    }

    nombre.addEventListener('input', validarNombreManual);
    email.addEventListener('input', validarEmailManual);
    celular.addEventListener('input', validarCelularManual);
    if (codigoPais) {
      codigoPais.addEventListener('change', function () {
        celular.placeholder = codigoPais.value === '+591' ? '71234567' : 'Número sin código de país';
        if (celular.value) validarCelularManual();
      });
    }
    servicio.addEventListener('change', validarServicioManual);
    mensaje.addEventListener('input', validarMensajeManual);
    acepto.addEventListener('change', validarAceptoManual);

    form.addEventListener('submit', async function (e) {
      e.preventDefault();
      if (formAlert) formAlert.hidden = true;

      var ok = [
        validarNombreManual(),
        validarEmailManual(),
        validarCelularManual(),
        validarServicioManual(),
        validarMensajeManual(),
        validarAceptoManual()
      ].every(Boolean);

      if (!ok) {
        if (formAlert) {
          formAlert.textContent = 'Revisa los campos marcados antes de enviar la solicitud.';
          formAlert.hidden = false;
        }
        return;
      }

      var pais = codigoPais ? codigoPais.value : '+591';
      var numLimpio = celular.value.replace(/\D/g, '');
      var telefonoCompleto = (pais + ' ' + numLimpio).trim();
      var textoServicio = servicio.options[servicio.selectedIndex].text;
      var mensajeConServicio = '[' + textoServicio + '] ' + limpiar(mensaje.value);

      var payload = {
        proyecto: 'presentacion',
        nombre: limpiar(nombre.value),
        email: limpiar(email.value),
        telefono: telefonoCompleto,
        mensaje: mensajeConServicio.slice(0, 600)
      };

      if (btnEnviar) btnEnviar.disabled = true;

      var resultado = { ok: false, encolado: true };
      if (window.SupabaseDW2) {
        resultado = await window.SupabaseDW2.guardar('mensajes_contacto', payload);
      }

      if (btnEnviar) btnEnviar.disabled = false;

      form.hidden = true;
      if (formSuccess) {
        formSuccess.hidden = false;
        formSuccess.focus();
      }

      if (successText) {
        successText.textContent = resultado.ok
          ? 'Gracias ' + payload.nombre + '. Tu solicitud sobre "' + textoServicio + '" quedó registrada en Supabase.'
          : 'Gracias ' + payload.nombre + '. Tu solicitud sobre "' + textoServicio + '" se guardó en cola local y se sincronizará al conectar.';
      }

      if (waEnviar) {
        var textoWa = encodeURIComponent(
          'Hola Ale, soy ' + payload.nombre + ' (' + telefonoCompleto + '). Solicito información sobre: ' + textoServicio + '. Detalle: ' + limpiar(mensaje.value)
        );
        waEnviar.href = 'https://wa.me/59178794797?text=' + textoWa;
      }
    });

    if (nuevaSolicitud) {
      nuevaSolicitud.addEventListener('click', function () {
        form.reset();
        form.querySelectorAll('.field').forEach(function (f) {
          f.classList.remove('is-valid', 'is-invalid');
        });
        if (contadorMensaje) contadorMensaje.textContent = '0/500';
        if (formSuccess) formSuccess.hidden = true;
        form.hidden = false;
        nombre.focus();
      });
    }
  }

  document.addEventListener('submit', alEnviar, true);
  document.addEventListener('focusout', alSalir, true);
  document.addEventListener('input', alEscribir, true);
  document.addEventListener('reset', alReiniciar, true);

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      preparar();
      iniciarContactoManual();
    }, { once: true });
  } else {
    preparar();
    iniciarContactoManual();
  }

  window.Validacion = {
    reglas: reglas,
    validarCampo: validarCampo,
    validarFormulario: validarFormulario,
    limpiarFormulario: limpiarFormulario,
    validarCampos: function (lista) {
      var primero = null;
      (lista || []).forEach(function (campo) {
        if (!campo || !campo.matches) return;
        if (!validarCampo(campo) && !primero) primero = campo;
      });
      if (primero) {
        primero.focus({ preventScroll: false });
        if (primero.scrollIntoView) primero.scrollIntoView({ behavior: 'smooth', block: 'center' });
        return false;
      }
      return true;
    },
    tieneInsulto: tieneInsulto,
    esBasura: esBasura
  };
})();