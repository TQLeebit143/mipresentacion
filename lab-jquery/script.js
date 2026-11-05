$(document).ready(function() {

    $('.accordion-btn').click(function() {
        $(this).next('.accordion-panel').slideToggle('fast');
        const $arrow = $(this).find('.arrow');
        $arrow.text($arrow.text() === '▼' ? '▲' : '▼');
    });

    $('.btn-zone').click(function() {
       
        $('.btn-zone').removeClass('active');
        $(this).addClass('active');

        const selectedTheme = $(this).data('theme');
        const icon = $(this).data('icon');
        const zone = $(this).data('zone');

        $('body').removeClass('theme-cafe theme-pc theme-console').addClass(selectedTheme);

        $('#main-icon').html(`${icon} CyberCafé & Gaming Lounge`);

        $('.service-card').css('opacity', '0.4');
        $(`.service-card[data-zone="${zone}"]`).css('opacity', '1').find('.accordion-panel').slideDown('fast');
    });

    $('#booking-form').submit(function(e) {
        e.preventDefault();

        const nombre = $('#nombre').val();
        const servicioText = $('#servicio option:selected').text();
        const horas = $('#horas').val();

        const resumenHtml = `
            <h3>✅ ¡Reserva Confirmada!</h3>
            <p><strong>Cliente:</strong> ${nombre}</p>
            <p><strong>Área Reservada:</strong> ${servicioText}</p>
            <p><strong>Tiempo:</strong> ${horas} hora(s)</p>
            <p><em>Te esperamos en recepción para la entrega de tus credenciales/equipo.</em></p>
        `;

        $('#booking-summary').html(resumenHtml).fadeIn('slow');
    });

});
