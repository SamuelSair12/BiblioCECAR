var listaUsuarios = [];
var modoEdicion   = false;

function inicializar() {
    var usr = verificarSesion();
    if (!usr) return;

    if (normalizarRol(usr.rol) !== 'Administrador') {
        alert('No tienes permiso para acceder a esta sección.');
        window.location.href = 'dashboard.html';
        return;
    }

    mostrarInfoUsuario(usr);
    configurarMenu(usr.rol);
    cargarUsuarios();
}

function cargarUsuarios() {
    fetch(APIURL + '/api/Usuarios', {
        method: 'GET',
        headers: obtenerEncabezados()
    })
    .then(function (res) { return res.json(); })
    .then(function (datos) {
        listaUsuarios = datos;
        renderizarTabla(datos);
    })
    .catch(function (err) {
        console.error('Error al cargar usuarios:', err);
        document.getElementById('tabla-usuarios-body').innerHTML =
            '<tr class="sin-registros"><td colspan="7">Error al cargar la lista de usuarios.</td></tr>';
    });
}

function renderizarTabla(datos) {
    var tbody = document.getElementById('tabla-usuarios-body');

    if (!datos || datos.length === 0) {
        tbody.innerHTML = '<tr class="sin-registros"><td colspan="7">No hay usuarios registrados.</td></tr>';
        return;
    }

    var html = '';
    for (var i = 0; i < datos.length; i++) {
        var u = datos[i];
        var rol = normalizarRol(u.rol);
        var estado = u.estado !== false
            ? '<span class="badge badge-verde">Activo</span>'
            : '<span class="badge badge-rojo">Inactivo</span>';

        html += '<tr>';
        html += '<td>' + (i + 1) + '</td>';
        html += '<td>' + (u.identificacion || '—') + '</td>';
        html += '<td>' + (u.nombres || u.nombre || '—') + '</td>';
        html += '<td>' + (u.correo || u.email || '—') + '</td>';
        html += '<td>' + rol + '</td>';
        html += '<td>' + estado + '</td>';
        html += '<td><div class="acciones-tabla">';
        html += '<button class="btn-editar" onclick="abrirModalEditar(' + i + ')">Editar</button>';

        if (u.estado !== false) {
            html += '<button class="btn-advertencia" onclick="cambiarEstado(' + (u.id || u.idUsuario) + ', false)">Desactivar</button>';
        } else {
            html += '<button class="btn-exito" onclick="cambiarEstado(' + (u.id || u.idUsuario) + ', true)">Activar</button>';
        }

        html += '</div></td>';
        html += '</tr>';
    }

    tbody.innerHTML = html;
}

function buscarUsuarios() {
    var nombre = document.getElementById('buscar-nombre').value.toLowerCase();
    var rol    = document.getElementById('filtro-rol').value;

    var filtrados = listaUsuarios.filter(function (u) {
        var coincideNombre = !nombre || (u.nombres || u.nombre || '').toLowerCase().includes(nombre);
        var coincideRol    = !rol    || String(u.rol) === rol;
        return coincideNombre && coincideRol;
    });

    renderizarTabla(filtrados);
}

function limpiarBusqueda() {
    document.getElementById('buscar-nombre').value = '';
    document.getElementById('filtro-rol').value    = '';
    renderizarTabla(listaUsuarios);
}

function abrirModalCrear() {
    modoEdicion = false;
    document.getElementById('titulo-modal-usuario').textContent = 'Nuevo Usuario';
    document.getElementById('usuario-id').value           = '';
    document.getElementById('usuario-identificacion').value = '';
    document.getElementById('usuario-nombres').value      = '';
    document.getElementById('usuario-correo').value       = '';
    document.getElementById('usuario-password').value     = '';
    document.getElementById('usuario-rol').value          = '';
    document.getElementById('label-pass-req').style.display = 'inline';
    document.getElementById('msg-modal-usuario').style.display = 'none';

    document.getElementById('modal-usuario').classList.add('activo');
}

function abrirModalEditar(indice) {
    modoEdicion = true;
    var u = listaUsuarios[indice];

    document.getElementById('titulo-modal-usuario').textContent = 'Editar Usuario';
    document.getElementById('usuario-id').value            = u.id || u.idUsuario || '';
    document.getElementById('usuario-identificacion').value = u.identificacion || '';
    document.getElementById('usuario-nombres').value       = u.nombres || u.nombre || '';
    document.getElementById('usuario-correo').value        = u.correo || u.email || '';
    document.getElementById('usuario-password').value      = '';
    document.getElementById('usuario-rol').value           = String(u.rol) || '';
    document.getElementById('label-pass-req').style.display = 'none';
    document.getElementById('msg-modal-usuario').style.display = 'none';

    document.getElementById('modal-usuario').classList.add('activo');
}

function cerrarModal() {
    document.getElementById('modal-usuario').classList.remove('activo');
}

function guardarUsuario() {
    var id             = document.getElementById('usuario-id').value;
    var identificacion = document.getElementById('usuario-identificacion').value.trim();
    var nombres        = document.getElementById('usuario-nombres').value.trim();
    var correo         = document.getElementById('usuario-correo').value.trim();
    var password       = document.getElementById('usuario-password').value;
    var rol            = document.getElementById('usuario-rol').value;

    if (!nombres) {
        mostrarMensajeModal('Los nombres son obligatorios.', 'error');
        return;
    }

    var regexCorreo = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!correo || !regexCorreo.test(correo)) {
        mostrarMensajeModal('Ingresa un correo electrónico válido.', 'error');
        return;
    }

    if (!modoEdicion && password.length < 8) {
        mostrarMensajeModal('La contraseña debe tener mínimo 8 caracteres.', 'error');
        return;
    }

    if (!rol) {
        mostrarMensajeModal('Selecciona un rol.', 'error');
        return;
    }

    var cuerpo = {
        identificacion: identificacion,
        nombres:  nombres,
        email:    correo,
        rol:      parseInt(rol),
        estado:   true
    };

    if (!modoEdicion) {
        cuerpo.password = password;
    } else if (password.length >= 6) {
        cuerpo.password = password;
    }

    var url    = modoEdicion ? APIURL + '/api/Usuarios/' + id : APIURL + '/api/Usuarios';
    var metodo = modoEdicion ? 'PUT' : 'POST';

    fetch(url, {
        method: metodo,
        headers: obtenerEncabezados(),
        body: JSON.stringify(cuerpo)
    })
    .then(function (res) { return res.json(); })
    .then(function (datos) {
        if (datos.error || datos.mensaje && datos.mensaje.toLowerCase().includes('error')) {
            mostrarMensajeModal(datos.mensaje || datos.error || 'Error al guardar.', 'error');
        } else {
            cerrarModal();
            mostrarMensaje('msg-usuarios', modoEdicion ? 'Usuario actualizado correctamente.' : 'Usuario creado correctamente.', 'exito');
            cargarUsuarios();
        }
    })
    .catch(function (err) {
        mostrarMensajeModal('Error de conexión al guardar el usuario.', 'error');
        console.error(err);
    });
}

function cambiarEstado(idUsuario, nuevoEstado) {
    var accion = nuevoEstado ? 'activar' : 'desactivar';
    if (!confirm('¿Deseas ' + accion + ' este usuario?')) return;

    fetch(APIURL + '/api/Usuarios/' + idUsuario + '/estado', {
        method: 'PUT',
        headers: obtenerEncabezados(),
        body: JSON.stringify({ estado: nuevoEstado })
    })
    .then(function (res) { return res.json(); })
    .then(function () {
        mostrarMensaje('msg-usuarios', 'Estado del usuario actualizado.', 'exito');
        cargarUsuarios();
    })
    .catch(function (err) {
        alert('Error al cambiar el estado del usuario.');
        console.error(err);
    });
}

function mostrarMensajeModal(texto, tipo) {
    var el = document.getElementById('msg-modal-usuario');
    if (!el) return;
    el.textContent  = texto;
    el.className    = tipo === 'error' ? 'msg-error' : 'msg-exito';
    el.style.display = 'block';
}

window.onload = inicializar;
