$(document).ready(function() {

    $('.accordion-btn').click(function() {
        $(this).next('.accordion-panel').slideToggle('fast');
        const $arrow = $(this).find('.arrow');
        $arrow.text($arrow.text() === '▼' ? '▲' : '▼');
    });
    
    $('.btn-filter').click(function() {
        $('.btn-filter').removeClass('active');
        $(this).addClass('active');

        const filterValue = $(this).data('filter');

        if (filterValue === 'all') {
            $('.service-card').fadeIn(300);
        } else {
            $('.service-card').each(function() {
                if ($(this).data('category') === filterValue) {
                    $(this).fadeIn(300);
                } else {
                    $(this).fadeOut(200);
                }
            });
        }
    });

    $('#booking-form').submit(function(e) {
        e.preventDefault();

        const nombre = $('#nombre').val();
        const servicio = $('#servicio').val();
        const horas = $('#horas').val();

        const htmlResumen = `
            <h3>⚡ ¡Reserva Neón Confirmada!</h3>
            <p><strong>Titular:</strong> ${nombre}</p>
            <p><strong>Zona Seleccionada:</strong> ${servicio}</p>
            <p><strong>Tiempo:</strong> ${horas} unidad(es)</p>
            <p style="margin-top:6px; font-size:0.85rem;"><em>Pásate por caja con tu nombre para acceder a la red.</em></p>
        `;

        $('#booking-summary').hide().html(htmlResumen).slideDown(400);
    });

    $('#cancel-form').submit(function(e) {
        e.preventDefault();

        const nombreCancel = $('#cancel-nombre').val();

        const htmlCancel = `
            <h3>🚫 Reserva Suspendida</h3>
            <p>El registro a nombre de <strong>${nombreCancel}</strong> ha sido cancelado exitosamente del sistema.</p>
        `;

        $('#cancel-summary').hide().html(htmlCancel).slideDown(400);
        $('#cancel-form')[0].reset();
    });

});
