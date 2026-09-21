navigator.serviceWorker.register('sw.js');



// Referencias de jQuery

var titulo = $('#titulo');
var nuevoBtn = $('#nuevo-btn');
var salirBtn = $('#salir-btn');
var cancelarBtn = $('#cancel-btn');
var postBtn = $('#post-btn');
var avatarSel = $('#seleccion');
var timeline = $('#timeline');

var modal = $('#modal');
var modalAvatar = $('#modal-avatar');
var avatarBtns = $('.seleccion-avatar');
var txtMensaje = $('#txtMensaje');

// El usuario, contiene el ID del héroe seleccionado
var usuario;




// ===== Codigo de la aplicación

function crearMensajeHTML(mensaje, personaje) {

    var content = `
    <li class="animated fadeIn fast">
        <div class="avatar">
            <img src="img/avatars/${personaje}.jpg">
        </div>
        <div class="bubble-container">
            <div class="bubble">
                <h3>@${personaje}</h3>
                <br/>
                ${mensaje}
            </div>
            
            <div class="arrow"></div>
        </div>
    </li>
    `;

    timeline.prepend(content);
    cancelarBtn.click();

}



// Globals
function logIn(ingreso) {

    if (ingreso) {
        nuevoBtn.removeClass('oculto');
        salirBtn.removeClass('oculto');
        timeline.removeClass('oculto');
        avatarSel.addClass('oculto');
        modalAvatar.attr('src', 'img/avatars/' + usuario + '.jpg');
    } else {
        nuevoBtn.addClass('oculto');
        salirBtn.addClass('oculto');
        timeline.addClass('oculto');
        avatarSel.removeClass('oculto');

        titulo.text('Seleccione Personaje');

    }

}


// Seleccion de personaje
avatarBtns.on('click', function () {

    usuario = $(this).data('user');

    titulo.text('@' + usuario);

    logIn(true);

});

// Parametros de entrada del manifest: accesos directos (?user=) y share_target
(function () {

    var params = new URLSearchParams(window.location.search);

    // Acceso directo: ./index.html?user=spiderman entra ya logueado
    var solicitado = params.get('user');
    var avatar = avatarBtns.filter('[data-user="' + solicitado + '"]');

    if (!avatar.length) {
        // Sin personaje valido, el compartido entra como el heroe por defecto
        avatar = avatarBtns.filter('[data-user="spiderman"]');
    }

    // share_target: Android manda el contenido compartido como ?title=&text=&url=
    var compartido = [params.get('title'), params.get('text'), params.get('url')]
        .filter(function (parte) { return parte; })
        .join(' ');

    if (!solicitado && !compartido) {
        return;
    }

    avatar.click();

    if (compartido) {
        crearMensajeHTML(compartido, usuario);
    }

    // Limpia la query para que al recargar no se repita el mensaje
    history.replaceState(null, '', window.location.pathname);

})();

// Boton de salir
salirBtn.on('click', function () {

    logIn(false);

});

// Boton de nuevo mensaje
nuevoBtn.on('click', function () {

    modal.removeClass('oculto');
    modal.animate({
        marginTop: '-=1000px',
        opacity: 1
    }, 200);

});

// Boton de cancelar mensaje
cancelarBtn.on('click', function () {
    modal.animate({
        marginTop: '+=1000px',
        opacity: 0
    }, 200, function () {
        modal.addClass('oculto');
        txtMensaje.val('');
    });
});

// Boton de enviar mensaje
postBtn.on('click', function () {

    var mensaje = txtMensaje.val();
    if (mensaje.length === 0) {
        cancelarBtn.click();
        return;
    }

    crearMensajeHTML(mensaje, usuario);

});