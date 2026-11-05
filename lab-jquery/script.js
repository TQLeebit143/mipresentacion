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

        const contenidoHtml = `
            <h3>🎉 ¡Reserva Exitosa!</h3>
            <p><strong>Cliente:</strong> ${nombre}</p>
            <p><strong>Estación:</strong> ${servicio}</p>
            <p><strong>Tiempo asignado:</strong> ${horas} hora(s)</p>
            <p style="margin-top:8px; font-size:0.85rem; color:#a3e635;"><em>Presenta este comprobante en recepción para activar tu sesión.</em></p>
        `;

        $('#booking-summary').hide().html(contenidoHtml).slideDown(400);
    });

});
