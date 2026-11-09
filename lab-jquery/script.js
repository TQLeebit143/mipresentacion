let listaReservas = [];
let totalPagarGlobal = 0;
let totalItemsGlobal = 0;
let contadorEq = { 
  "Cabinas PC Gamer Pro": 1, 
  "Salas VIP Consolas (PS5)": 1, 
  "Salas Normales Consolas (PS4/PS3)": 1, 
  "Mesas Co-Working & Café": 1 
};

function mostrarToast(titulo, mensaje) {
  const toast = $('#toast-alert');
  $('#toast-titulo').text(titulo);
  $('#toast-cuerpo').text(mensaje);
  toast.stop(true, true).removeClass('toast-hidden').fadeIn('fast').delay(2500).fadeOut('slow');
}

function registrarBitacoraEvento(tipo, mensaje) {
  const hora = new Date().toLocaleTimeString();
  $('#logOutputEventos').prepend(`<div>[${hora}] <strong>${tipo}:</strong> ${mensaje}</div>`);
}

function registrarBitacoraVenta(detalleVenta, monto, cliente) {
  const hora = new Date().toLocaleTimeString();
  $('#logOutputVentas').prepend(`<div style="color: var(--section-title);">[VENTA OK - ${hora}] Cliente: <strong>${cliente}</strong> | Estaciones/Snacks: ${detalleVenta} | <strong>Total: ${monto} BOB</strong></div>`);
}

document.addEventListener('DOMContentLoaded', () => {

  $('#btn-tema').click(() => {
    document.body.classList.toggle('light-mode');
    const esClaro = document.body.classList.contains('light-mode');
    $('#btn-tema').html(esClaro ? '☀️ Modo Día' : '🌙 Modo Noche');
    registrarBitacoraEvento('TEMA', `Interfaz cambiada a modo ${esClaro ? 'Claro (Día)' : 'Oscuro (Noche)'}`);
    mostrarToast('TEMA', `Cambiado a modo ${esClaro ? 'Claro' : 'Oscuro'}`);
  });

  $('#inputRadar').on('keyup', function() {
    const query = $(this).val().toLowerCase();
    registrarBitacoraEvento('RADAR', `Búsqueda filtrada: "${query}"`);
  });

  $('.accordion-btn').click(function(e) {
    e.stopPropagation();
    $(this).next('.accordion-panel').slideToggle('fast');
  });

  const formReserva = document.getElementById('form-reserva');
  if (formReserva) {
    formReserva.addEventListener('submit', (e) => {
      e.preventDefault();
      const inputCliente = document.getElementById('nombreCliente');
      const cliente = inputCliente.value.trim();
      const area = document.getElementById('areaReserva').value;
      const horas = parseFloat(document.getElementById('horasReserva').value);

      if (!cliente) {
        inputCliente.classList.add('input-error');
        inputCliente.focus();
        registrarBitacoraEvento('VALIDACIÓN', 'Intento de reserva fallido: Nombre obligatorio vacío');
        mostrarToast('ADVERTENCIA', 'El nombre del jugador es obligatorio');
        return;
      }
      inputCliente.classList.remove('input-error');

      let prefijo = area.includes('PC') ? 'PC' : (area.includes('VIP') ? 'PS5' : (area.includes('Normales') ? 'PS4' : 'MESA'));
      let eqID = `${prefijo}-0${contadorEq[area]++}`;
      let tarifaHora = area.includes('PC') ? 10 : (area.includes('VIP') ? 18 : 12);
      let subtotal = tarifaHora * horas;

      listaReservas.push({ cliente, area, equipo: eqID, horas, totalPagar: subtotal, consumos: [] });
      
      actualizarCarritoDOM();
      actualizarSelectoresMenu();
      actualizarMapaCompleto();

      registrarBitacoraEvento('RESERVA', `Estación ${eqID} asignada a ${cliente} (${horas}h)`);
      mostrarToast('¡RESERVA EXITOSA!', `${eqID} asignado a ${cliente}`);
      formReserva.reset();
      document.querySelectorAll('.service-card').forEach(c => c.classList.remove('selected-card'));
    });
  }
});

function cambiarVistaCompleta(idVista, nombreZona, claseFondo) {
  $('.vista-hud').hide();
  $('#' + idVista).fadeIn(200);

  let modoActual = document.body.classList.contains('light-mode') ? 'light-mode ' : '';
  document.body.className = modoActual + claseFondo;

  $('.btn-dock-nav').removeClass('active');
  $('.btn-dock-nav').filter(function() {
    return $(this).attr('onclick').includes(idVista);
  }).addClass('active');

  $('#indicador-zona').text(nombreZona);
  registrarBitacoraEvento('NAVEGACIÓN', `Cambio a sección: ${nombreZona}`);
}

function seleccionarEstacionTarjeta(elementoCard, nombreZona) {
  document.getElementById('areaReserva').value = nombreZona;
  $('.service-card').removeClass('selected-card');
  $(elementoCard).addClass('selected-card');
  mostrarToast('ZONA SELECCIONADA', nombreZona);
}

function actualizarCarritoDOM() {
  const lista = $('#lista-carrito-lobby');
  lista.html('');
  totalPagarGlobal = 0;
  totalItemsGlobal = 0;

  if (listaReservas.length === 0) {
    lista.html('<li class="carrito-vacio">Sin reservas ni snacks activos.</li>');
  } else {
    listaReservas.forEach(r => {
      totalPagarGlobal += r.totalPagar;
      totalItemsGlobal += 1;
      let detalleConsumos = r.consumos.length > 0 ? ` (+ ${r.consumos.map(c=>c.item).join(', ')})` : '';
      lista.append(`<li><strong>${r.equipo}</strong> (${r.cliente}): ${r.totalPagar} BOB${detalleConsumos}</li>`);
    });
  }

  $('#hud-items').text(totalItemsGlobal);
  $('#hud-total').text(totalPagarGlobal);
  $('#carritoTotalLabel').text(totalPagarGlobal + ' BOB');
}

function actualizarSelectoresMenu() {
  const select = $('#selectEquipoMenu');
  const selectCancel = $('#selectCancelarEstacion');
  select.html('<option value="">-- Selecciona tu equipo --</option>');
  selectCancel.html('<option value="">-- Seleccionar --</option>');

  listaReservas.forEach(r => {
    select.append(`<option value="${r.equipo}">${r.equipo} - ${r.cliente}</option>`);
    selectCancel.append(`<option value="${r.equipo}">${r.equipo} - ${r.cliente}</option>`);
  });
}

function actualizarMapaCompleto() {
  const mapa = $('#mapaGridCompleto');
  const mapaLobby = $('#mapaGridLobby');
  mapa.html('');
  if(mapaLobby.length) mapaLobby.html('');

  listaReservas.forEach(r => {
    const cardHtml = `<div class="mapa-card ocupado" data-id="${r.equipo}">${r.equipo}<br><small>${r.cliente}</small></div>`;
    mapa.append(cardHtml);
    if(mapaLobby.length) mapaLobby.append(cardHtml);
  });
}

function pedirItem(nombreItem, precio) {
  const eq = document.getElementById('selectEquipoMenu').value;
  if (!eq) {
    alert('Primero debes seleccionar tu estación activa en el menú superior de cafetería.');
    return;
  }
  let res = listaReservas.find(r => r.equipo === eq);
  if (res) {
    res.consumos.push({ item: nombreItem, precio });
    res.totalPagar += precio;
    actualizarCarritoDOM();
    registrarBitacoraEvento('CAFETERÍA', `Pedido de ${nombreItem} (${precio} BOB) sumado a ${eq}`);
    mostrarToast('SNACK AÑADIDO', `${nombreItem} sumado a ${eq}`);
  }
}

function consultarCuentaCliente() {
  const query = $('#inputBusquedaCuenta').val().trim().toLowerCase();
  const resultados = listaReservas.filter(r => r.cliente.toLowerCase().includes(query) || r.equipo.toLowerCase().includes(query));
  const box = $('#resultadoConsultaCuenta');

  if (!query || resultados.length === 0) {
    box.html('<div>No se encontraron cuentas activas para esa búsqueda.</div>');
    return;
  }

  let html = '';
  resultados.forEach(r => {
    let snacksStr = r.consumos.map(c => `${c.item} (${c.precio} BOB)`).join(', ') || 'Ninguno';
    html += `<div style="margin-bottom: 6px; border-bottom: 1px dashed var(--border); padding-bottom: 4px;">
      <strong>Estación: ${r.equipo}</strong> | Cliente: ${r.cliente}<br>
      Horas: ${r.horas}h | Snacks: [${snacksStr}]<br>
      <strong style="color: var(--section-title);">Subtotal a Pagar: ${r.totalPagar} BOB</strong>
    </div>`;
  });
  box.html(html);
  registrarBitacoraEvento('CUENTA', `Consulta de estado de cuenta para: "${query}"`);
}

function liberarEstacionSistema() {
  const eq = $('#selectCancelarEstacion').val();
  if (!eq) {
    alert('Selecciona una estación a liberar.');
    return;
  }
  listaReservas = listaReservas.filter(r => r.equipo !== eq);
  actualizarCarritoDOM();
  actualizarSelectoresMenu();
  actualizarMapaCompleto();
  registrarBitacoraEvento('LIBERACIÓN', `Estación ${eq} liberada y sesión finalizada.`);
  mostrarToast('ESTACIÓN LIBERADA', `${eq} se encuentra disponible nuevamente.`);
}

function abrirCheckoutModal() {
  if (totalPagarGlobal <= 0) {
    alert('El carrito está vacío. Agrega una reserva o snack antes de pagar.');
    return;
  }
  let resumenHtml = '';
  listaReservas.forEach(r => {
    resumenHtml += `<div>• ${r.equipo} (${r.cliente}): ${r.totalPagar} BOB</div>`;
  });
  $('#modal-resumen').html(resumenHtml);
  $('#modalTotalPagar').text(totalPagarGlobal);
  $('#inputModalCliente').val(listaReservas.length > 0 ? listaReservas[0].cliente : '');
  $('#modal-checkout').fadeIn('fast');
}

function procesarPagoFinal() {
  const clientePago = $('#inputModalCliente').val().trim() || 'Cliente General';
  let detalleTicket = listaReservas.map(r => `${r.equipo} (${r.cliente})`).join(', ');
  let montoPagado = totalPagarGlobal;

  registrarBitacoraVenta(detalleTicket, montoPagado, clientePago);

  $('#modal-checkout').fadeOut('fast');
  mostrarToast('¡PAGO EXITOSO!', `Transacción confirmada por ${montoPagado} BOB`);
  registrarBitacoraEvento('VENTA', `Pago procesado y registrado en caja por ${montoPagado} BOB`);

  listaReservas = [];
  actualizarCarritoDOM();
  actualizarMapaCompleto();
  actualizarSelectoresMenu();
}