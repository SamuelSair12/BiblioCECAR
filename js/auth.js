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

    iniciarSesion(correo, password);
}

function iniciarSesion(correo, password) {
    var url = APIURL + '/api/Seguridad/iniciar-sesion';

    fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: correo, password: password })
    })
    .then(function (respuesta) {
        return respuesta.json();
    })
    .then(function (datos) {
        var btn = document.getElementById('btn-ingresar');
        btn.disabled = false;
        btn.textContent = 'Ingresar al Sistema';

        if (datos.token !== undefined && datos.token !== null && datos.token !== '') {
            
            localStorage.setItem('token', datos.token);
            localStorage.setItem('usuario', JSON.stringify(datos.usuario));

            mostrarMensajeLogin('Acceso concedido. Redirigiendo...', 'exito');

            setTimeout(function () {
                redirigirPaginaInicio(datos.usuario);
            }, 800);

        } else {
            mostrarMensajeLogin(
                datos.mensaje || datos.message || 'Correo o contraseña incorrectos.',
                'error'
            );
        }
    })
    .catch(function (error) {
        var btn = document.getElementById('btn-ingresar');
        btn.disabled = false;
        btn.textContent = 'Ingresar al Sistema';
        mostrarMensajeLogin('Error de conexión. Verifica la red e intenta de nuevo.', 'error');
        console.error('Error en la petición de login:', error);
    });
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
