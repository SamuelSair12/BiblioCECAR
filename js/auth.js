const API_URL = "http://localhost:8080/api";

function mostrarMensajeLogin(texto, tipo) {
    var el = document.getElementById('msg-login');
    if (!el) return;
    el.textContent = texto;
    el.className = 'msg-login ' + tipo;
}

function validarFormulario(correo, password, rol) {
    if (!correo || correo.trim() === '') {
        mostrarMensajeLogin('El correo electrónico es obligatorio.', 'error');
        return false;
    }

    var regexCorreo = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!regexCorreo.test(correo)) {
        mostrarMensajeLogin('El correo no tiene un formato válido.', 'error');
        return false;
    }

    if (!password || password.length < 6) {
        mostrarMensajeLogin('La contraseña debe tener mínimo 6 caracteres.', 'error');
        return false;
    }

    if (!rol || rol === '') {
        mostrarMensajeLogin('Debes seleccionar un rol de acceso.', 'error');
        return false;
    }

    return true;
}

function autenticar() {
    var correo   = document.getElementById('correo').value.trim();
    var password = document.getElementById('password').value;
    var rol      = document.getElementById('rol').value;

    if (!validarFormulario(correo, password, rol)) {
        return;
    }

    var btn = document.getElementById('btn-ingresar');
    btn.disabled = true;
    btn.textContent = 'Verificando...';

    iniciarSesion(correo, password, rol);
}

function iniciarSesion(correo, password, rolSeleccionado) {
    var token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7fX0.SmartBooksSecureToken2026"; 
    var infoUsuario = { 
        email: correo, 
        rol: rolSeleccionado || "1" 
    };

    localStorage.setItem('token', token);
    localStorage.setItem('usuario', JSON.stringify(infoUsuario));

    mostrarMensajeLogin('Acceso concedido. Redirigiendo...', 'exito');

    setTimeout(function () {
        var btn = document.getElementById('btn-ingresar');
        if (btn) {
            btn.disabled = false;
            btn.textContent = 'Ingresar al Sistema';
        }
        redirigirPaginaInicio(infoUsuario);
    }, 800);
}

function redirigirPaginaInicio(usuario) {
    var rol = String(usuario.rol).toLowerCase();

    if (rol === '1' || rol === 'admin' || rol === 'administrador') {
        window.location.href = '../html/dashboard.html';
    } else if (rol === '2' || rol === 'bibliotecario' || rol === 'operador') {
        window.location.href = '../html/dashboard.html';
    } else {
        window.location.href = '../html/libros.html';
    }
}

(function () {
    var token   = localStorage.getItem('token');
    var usuario = localStorage.getItem('usuario');
    if (token && usuario) {
        try {
            redirigirPaginaInicio(JSON.parse(usuario));
        } catch (e) {
            localStorage.clear();
        }
    }
})();

document.addEventListener('keydown', function (e) {
    if (e.key === 'Enter') {
        autenticar();
    }
});