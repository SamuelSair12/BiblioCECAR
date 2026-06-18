var listaLotes = [];

function inicializar() {
    var usr = verificarSesion();
    if (!usr) return;

    var rol = normalizarRol(usr.rol);
    if (rol === 'Invitado') {
        window.location.href = '../html/inventario.html';
        return;
    }

    mostrarInfoUsuario(usr);
    configurarMenu(usr.rol);
    cargarLotes();
}

function cargarLotes() {
    fetch(APIURL + '/api/Lotes', {
        method: 'GET',
        headers: obtenerEncabezados()
    })
    .then(function (res) { return res.json(); })
    .then(function (datos) {
        listaLotes = datos;
        renderizarTabla(datos);
    })
    .catch(function (err) {
        console.error('Error cargando lotes:', err);
        document.getElementById('tabla-lotes-body').innerHTML =
            '<tr class="sin-registros"><td colspan="3">Error al cargar los lotes.</td></tr>';
    });
}

function renderizarTabla(datos) {
    var tbody = document.getElementById('tabla-lotes-body');
    if (!datos || datos.length === 0) {
        tbody.innerHTML = '<tr class="sin-registros"><td colspan="3">No hay lotes registrados.</td></tr>';
        return;
    }

    var html = '';
    for (var i = 0; i < datos.length; i++) {
        var l = datos[i];
        html += '<tr>';
        html += '<td>' + (i + 1) + '</td>';
        html += '<td>' + (l.codigo || l.codigoLote || '—') + '</td>';
        html += '<td>' + formatearFecha(l.fechaRegistro || l.fechaCreacion || null) + '</td>';
        html += '</tr>';
    }
    tbody.innerHTML = html;
}

function crearLote() {
    var codigo = document.getElementById('lote-codigo').value.trim();
    var msgForm = document.getElementById('msg-form-lote');

    if (!codigo) {
        msgForm.textContent   = 'El código del lote es obligatorio.';
        msgForm.className     = 'msg-error';
        msgForm.style.display = 'block';
        return;
    }

    if (codigo.length < 3) {
        msgForm.textContent   = 'El código debe tener al menos 3 caracteres.';
        msgForm.className     = 'msg-error';
        msgForm.style.display = 'block';
        return;
    }

    var yaExiste = false;
    for (var k = 0; k < listaLotes.length; k++) {
        var cod = listaLotes[k].codigo || listaLotes[k].codigoLote || '';
        if (cod.toLowerCase() === codigo.toLowerCase()) {
            yaExiste = true;
            break;
        }
    }
    if (yaExiste) {
        msgForm.textContent   = 'Ya existe un lote con ese código.';
        msgForm.className     = 'msg-error';
        msgForm.style.display = 'block';
        return;
    }

    msgForm.style.display = 'none';

    var cuerpo = {
        codigo:         codigo,
        codigoLote:     codigo,
        fechaRegistro:  new Date().toISOString()
    };

    fetch(APIURL + '/api/Lotes', {
        method: 'POST',
        headers: obtenerEncabezados(),
        body: JSON.stringify(codigo)
    })
    .then(function (res) {
    if (res.ok) return { exito: true };
    return res.json();
})
    .then(function (datos) {
        if (datos.error || datos.mensaje) {
            msgForm.textContent   = datos.mensaje || 'Error al registrar el lote.';
            msgForm.className     = 'msg-error';
            msgForm.style.display = 'block';
        } else {
            document.getElementById('lote-codigo').value = '';
            mostrarMensaje('msg-lotes', 'Lote "' + codigo + '" registrado correctamente.', 'exito');
            cargarLotes();
        }
    })
    .catch(function (err) {
        msgForm.textContent   = 'Error de conexión al registrar el lote.';
        msgForm.className     = 'msg-error';
        msgForm.style.display = 'block';
        console.error(err);
    });
}

function buscarLotes() {
    var termino = document.getElementById('buscar-lote').value.toLowerCase().trim();

    if (!termino) {
        renderizarTabla(listaLotes);
        return;
    }

    var filtrados = listaLotes.filter(function (l) {
        var cod = (l.codigo || l.codigoLote || '').toLowerCase();
        return cod.includes(termino);
    });

    renderizarTabla(filtrados);
}

function limpiarBusqueda() {
    document.getElementById('buscar-lote').value = '';
    renderizarTabla(listaLotes);
}

window.onload = inicializar;
