function inicializar() {
    var usr = verificarSesion();
    if (!usr) return;

    mostrarInfoUsuario(usr);
    configurarMenu(usr.rol);
    renderizarPerfil(usr);
}

function renderizarPerfil(usr) {
    var nombre = usr.nombres || usr.nombre || 'Usuario';
    var correo = usr.correo  || usr.email  || '—';
    var rol    = normalizarRol(usr.rol);
    var estado = usr.activo === false ? 'Inactivo' : 'Activo';

    var partes    = nombre.split(' ');
    var iniciales = partes[0].charAt(0).toUpperCase();
    if (partes.length > 1) {
        iniciales += partes[partes.length - 1].charAt(0).toUpperCase();
    }
    document.getElementById('avatar-iniciales').textContent = iniciales;

    document.getElementById('perfil-nombre-completo').textContent = nombre;
    document.getElementById('perfil-rol-badge').textContent       = rol;

    document.getElementById('perfil-dato-nombre').textContent  = nombre;
    document.getElementById('perfil-dato-correo').textContent  = correo;
    document.getElementById('perfil-dato-rol').textContent     = rol;
    document.getElementById('perfil-dato-estado').textContent  = estado;

    var elEstado = document.getElementById('perfil-dato-estado');
    if (elEstado) {
        elEstado.style.color       = estado === 'Activo' ? '#28a745' : '#dc3545';
        elEstado.style.fontWeight  = '600';
    }
}

function cambiarContrasena() {
    var actual     = document.getElementById('pass-actual').value;
    var nueva      = document.getElementById('pass-nueva').value;
    var confirmar  = document.getElementById('pass-confirmar').value;
    var msgEl      = document.getElementById('msg-cambio-pass');

    function mostrarError(texto) {
        msgEl.textContent   = texto;
        msgEl.className     = 'msg-error';
        msgEl.style.display = 'block';
    }

    if (!actual) {
        mostrarError('Debes ingresar tu contraseña actual.');
        return;
    }
    if (!nueva || nueva.length < 6) {
        mostrarError('La nueva contraseña debe tener al menos 6 caracteres.');
        return;
    }
    if (nueva !== confirmar) {
        mostrarError('Las contraseñas no coinciden.');
        return;
    }
    if (nueva === actual) {
        mostrarError('La nueva contraseña no puede ser igual a la actual.');
        return;
    }

    msgEl.style.display = 'none';

    var usr = verificarSesion();
    if (!usr) return;

    var cuerpo = {
        contrasenaActual: actual,
        contrasenaNueva:  nueva
    };

    fetch(APIURL + '/api/Seguridad/cambiar-contrasena', {
        method: 'PUT',
        headers: obtenerEncabezados(),
        body: JSON.stringify(cuerpo)
    })
    .then(function (res) { return res.json(); })
    .then(function (datos) {
        if (datos.error || datos.mensaje) {
            mostrarError(datos.mensaje || 'No se pudo actualizar la contraseña.');
        } else {
            document.getElementById('pass-actual').value    = '';
            document.getElementById('pass-nueva').value     = '';
            document.getElementById('pass-confirmar').value = '';
            mostrarMensaje('msg-perfil', 'Contraseña actualizada correctamente.', 'exito');
        }
    })
    .catch(function (err) {
        mostrarError('Error de conexión al actualizar la contraseña.');
        console.error(err);
    });
}

window.onload = inicializar;
