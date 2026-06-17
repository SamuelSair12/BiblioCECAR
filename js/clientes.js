var listaClientes = [];
var modoEdicion   = false;

function inicializar() {
    var usr = verificarSesion();
    if (!usr) return;
    mostrarInfoUsuario(usr);
    configurarMenu(usr.rol);
    cargarClientes();
}

function cargarClientes() {
    fetch(APIURL + '/api/Clientes', {
        method: 'GET',
        headers: obtenerEncabezados()
    })
    .then(function (res) { return res.json(); })
    .then(function (datos) {
        listaClientes = datos;
        renderizarTabla(datos);
    })
    .catch(function (err) {
        console.error('Error cargando clientes:', err);
        document.getElementById('tabla-clientes-body').innerHTML =
            '<tr class="sin-registros"><td colspan="7">Error al cargar los clientes.</td></tr>';
    });
}

function renderizarTabla(datos) {
    var tbody = document.getElementById('tabla-clientes-body');
    if (!datos || datos.length === 0) {
        tbody.innerHTML = '<tr class="sin-registros"><td colspan="7">No hay clientes registrados.</td></tr>';
        return;
    }

    var html = '';
    for (var i = 0; i < datos.length; i++) {
        var c = datos[i];
        html += '<tr>';
        html += '<td>' + (i + 1) + '</td>';
        html += '<td>' + (c.identificacion || '—') + '</td>';
        html += '<td>' + (c.nombres || c.nombre || '—') + '</td>';
        html += '<td>' + (c.correo || c.email || '—') + '</td>';
        html += '<td>' + (c.celular || '—') + '</td>';
        html += '<td>' + formatearFecha(c.fechaNacimiento) + '</td>';
        html += '<td><div class="acciones-tabla">';
        html += '<button class="btn-editar" onclick="abrirModalEditar(' + i + ')">Editar</button>';
        html += '</div></td>';
        html += '</tr>';
    }
    tbody.innerHTML = html;
}

function buscarClientes() {
    var nombre = document.getElementById('buscar-cliente').value.toLowerCase();
    var id     = document.getElementById('buscar-identificacion').value.toLowerCase();

    var filtrados = listaClientes.filter(function (c) {
        var ok1 = !nombre || (c.nombres || c.nombre || '').toLowerCase().includes(nombre);
        var ok2 = !id     || (c.identificacion || '').toLowerCase().includes(id);
        return ok1 && ok2;
    });

    renderizarTabla(filtrados);
}

function limpiarBusqueda() {
    document.getElementById('buscar-cliente').value       = '';
    document.getElementById('buscar-identificacion').value = '';
    renderizarTabla(listaClientes);
}

function abrirModalCrear() {
    modoEdicion = false;
    document.getElementById('titulo-modal-cliente').textContent = 'Nuevo Cliente';
    document.getElementById('cliente-id').value             = '';
    document.getElementById('cliente-identificacion').value = '';
    document.getElementById('cliente-nombres').value        = '';
    document.getElementById('cliente-correo').value         = '';
    document.getElementById('cliente-celular').value        = '';
    document.getElementById('cliente-fecha-nacimiento').value = '';
    document.getElementById('msg-modal-cliente').style.display = 'none';
    document.getElementById('modal-cliente').classList.add('activo');
}

function abrirModalEditar(indice) {
    modoEdicion = true;
    var c = listaClientes[indice];
    document.getElementById('titulo-modal-cliente').textContent = 'Editar Cliente';
    document.getElementById('cliente-id').value             = c.id || c.idCliente || '';
    document.getElementById('cliente-identificacion').value = c.identificacion || '';
    document.getElementById('cliente-nombres').value        = c.nombres || c.nombre || '';
    document.getElementById('cliente-correo').value         = c.correo || c.email || '';
    document.getElementById('cliente-celular').value        = c.celular || '';
    document.getElementById('cliente-fecha-nacimiento').value = (c.fechaNacimiento || '').substring(0, 10);
    document.getElementById('msg-modal-cliente').style.display = 'none';
    document.getElementById('modal-cliente').classList.add('activo');
}

function cerrarModal() {
    document.getElementById('modal-cliente').classList.remove('activo');
}

function guardarCliente() {
    var id             = document.getElementById('cliente-id').value;
    var identificacion = document.getElementById('cliente-identificacion').value.trim();
    var nombres        = document.getElementById('cliente-nombres').value.trim();
    var correo         = document.getElementById('cliente-correo').value.trim();
    var celular        = document.getElementById('cliente-celular').value.trim();
    var fechaNac       = document.getElementById('cliente-fecha-nacimiento').value;

    if (!identificacion) {
        mostrarMensajeModal('La identificación es obligatoria.', 'error');
        return;
    }
    if (!nombres) {
        mostrarMensajeModal('Los nombres son obligatorios.', 'error');
        return;
    }
    var regexCorreo = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!correo || !regexCorreo.test(correo)) {
        mostrarMensajeModal('El correo no tiene un formato válido.', 'error');
        return;
    }

    var cuerpo = {
        identificacion: identificacion,
        nombres:        nombres,
        correo:         correo,
        celular:        celular || null,
        fechaNacimiento: fechaNac || null
    };

    var url    = modoEdicion ? APIURL + '/api/Clientes/' + id : APIURL + '/api/Clientes';
    var metodo = modoEdicion ? 'PUT' : 'POST';

    fetch(url, {
        method: metodo,
        headers: obtenerEncabezados(),
        body: JSON.stringify(cuerpo)
    })
    .then(function (res) { return res.json(); })
    .then(function (datos) {
        if (datos.error) {
            mostrarMensajeModal(datos.mensaje || 'Error al guardar.', 'error');
        } else {
            cerrarModal();
            mostrarMensaje('msg-clientes', modoEdicion ? 'Cliente actualizado.' : 'Cliente registrado correctamente.', 'exito');
            cargarClientes();
        }
    })
    .catch(function (err) {
        mostrarMensajeModal('Error de conexión.', 'error');
        console.error(err);
    });
}

function mostrarMensajeModal(texto, tipo) {
    var el = document.getElementById('msg-modal-cliente');
    if (!el) return;
    el.textContent   = texto;
    el.className     = tipo === 'error' ? 'msg-error' : 'msg-exito';
    el.style.display = 'block';
}

window.onload = inicializar;
