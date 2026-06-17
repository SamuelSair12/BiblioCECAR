var sesionActiva  = false;
var usuarioActual = null;

function verificarSesion() {
    var token      = localStorage.getItem('token');
    var usuarioStr = localStorage.getItem('usuario');

    if (token && usuarioStr) {
        try {
            usuarioActual = JSON.parse(usuarioStr);
            sesionActiva  = true;
        } catch (e) {
            
            localStorage.clear();
            sesionActiva  = false;
            usuarioActual = null;
        }
    }
}

function configurarInterfaz() {
    if (sesionActiva) {
        mostrarInterfazConSesion();
    } else {
        mostrarInterfazSinSesion();
    }
}

function mostrarInterfazConSesion() {
    var nombre = usuarioActual.nombres || usuarioActual.nombre || 'Usuario';

    document.getElementById('saludo-usuario').textContent = 'Hola, ' + nombre;
    document.getElementById('btn-login').style.display    = 'none';
    document.getElementById('btn-panel').style.display    = 'inline-block';
    document.getElementById('btn-salir').style.display    = 'inline-block';
    document.getElementById('nav-perfil').style.display   = 'list-item';

    document.getElementById('aviso-invitado').style.display = 'none';
}

function mostrarInterfazSinSesion() {
    
    document.getElementById('btn-login').style.display  = 'inline-block';
    document.getElementById('btn-panel').style.display  = 'none';
    document.getElementById('btn-salir').style.display  = 'none';
    document.getElementById('nav-perfil').style.display = 'none';

    document.getElementById('aviso-invitado').style.display = 'flex';
}

function irAlPanel() {
    if (!sesionActiva) {
        
        window.location.href = 'html/login.html';
        return;
    }

    var rol = String(usuarioActual.rol).trim().toLowerCase();

    if (rol === '1' || rol === 'admin' || rol === 'administrador' ||
        rol === '2' || rol === 'bibliotecario' || rol === 'operador') {
        window.location.href = 'html/dashboard.html';
    } else {
        
        window.location.href = 'html/libros.html';
    }
}

function accederModulo(rutaModulo) {
    if (!sesionActiva) {
        
        alert('Debes iniciar sesión para acceder a este módulo.');
        window.location.href = 'html/login.html';
        return;
    }

    window.location.href = rutaModulo;
}

function cerrarSesionIndex() {
    var confirmar = confirm('¿Deseas cerrar la sesión?');
    if (confirmar) {
        localStorage.removeItem('token');
        localStorage.removeItem('usuario');
        
        window.location.reload();
    }
}

window.onload = function () {
    verificarSesion();
    configurarInterfaz();
};
