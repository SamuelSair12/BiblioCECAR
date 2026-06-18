var listaLibros = [];
var modoEdicion = false;
var rolActual   = '';

function inicializar() {
    var usr = verificarSesion();
    if (!usr) return;

    rolActual = normalizarRol(usr.rol);
    mostrarInfoUsuario(usr);
    configurarMenu(usr.rol);

    if (rolActual === 'Invitado') {
        var btnNuevo = document.getElementById('btn-nuevo-libro');
        if (btnNuevo) btnNuevo.style.display = 'none';
    }

    cargarLibros();
    cargarLotesSelect();
}

function cargarLibros() {
    fetch(APIURL + '/api/Libros', {
        method: 'GET',
        headers: obtenerEncabezados()
    })
    .then(function (res) { return res.json(); })
    .then(function (datos) {
        listaLibros = datos;
        renderizarTabla(datos);
    })
    .catch(function (err) {
        console.error('Error cargando libros:', err);
        document.getElementById('tabla-libros-body').innerHTML =
            '<tr class="sin-registros"><td colspan="10">Error al cargar los libros.</td></tr>';
    });
}

function cargarLotesSelect() {
    fetch(APIURL + '/api/Lotes', {
        method: 'GET',
        headers: obtenerEncabezados()
    })
    .then(function (res) { return res.json(); })
    .then(function (lotes) {
        var sel = document.getElementById('libro-lote');
        if (!sel) return;
        sel.innerHTML = '<option value="">-- Sin lote --</option>';
        for (var i = 0; i < lotes.length; i++) {
            var l = lotes[i];
            sel.innerHTML += '<option value="' + (l.lote || l.codigo || l.id) + '">' + (l.lote || l.codigo || l.descripcion) + '</option>';
        }
    })
    .catch(function () {  });
}

function renderizarTabla(datos) {
    var tbody = document.getElementById('tabla-libros-body');
    if (!datos || datos.length === 0) {
        tbody.innerHTML = '<tr class="sin-registros"><td colspan="10">No hay libros registrados.</td></tr>';
        return;
    }

    var html = '';
    for (var i = 0; i < datos.length; i++) {
        var l = datos[i];
        html += '<tr>';
        html += '<td>' + (i + 1) + '</td>';
        html += '<td>' + (l.nombre || '—') + '</td>';
        html += '<td>' + (l.nivel || '—') + '</td>';
        html += '<td>' + (l.tipo !== undefined ? l.tipo : '—') + '</td>';
        html += '<td>' + (l.edicion || '—') + '</td>';
        html += '<td>' + (l.unidades !== undefined ? l.unidades : '—') + '</td>';
        html += '<td>' + (l.lote || '—') + '</td>';
        html += '<td>' + formatearPesos(l.valorCompra) + '</td>';
        html += '<td>' + formatearPesos(l.valorVentaPublico || l.valorVenta) + '</td>';
        html += '<td>';
        if (rolActual !== 'Invitado') {
            html += '<div class="acciones-tabla">';
            html += '<button class="btn-editar" onclick="abrirModalEditar(' + i + ')">Editar</button>';
            html += '</div>';
        } else {
            html += '<span style="color:#888;font-size:12px">Solo lectura</span>';
        }
        html += '</td>';
        html += '</tr>';
    }
    tbody.innerHTML = html;
}

function buscarLibros() {
    var nombre  = document.getElementById('buscar-libro').value.toLowerCase();
    var nivel   = document.getElementById('buscar-nivel').value.toLowerCase();
    var edicion = document.getElementById('buscar-edicion').value.toLowerCase();

    var filtrados = listaLibros.filter(function (l) {
        var ok1 = !nombre  || (l.nombre  || '').toLowerCase().includes(nombre);
        var ok2 = !nivel   || (l.nivel   || '').toLowerCase().includes(nivel);
        var ok3 = !edicion || (l.edicion || '').toLowerCase().includes(edicion);
        return ok1 && ok2 && ok3;
    });

    renderizarTabla(filtrados);
}

function limpiarBusqueda() {
    document.getElementById('buscar-libro').value   = '';
    document.getElementById('buscar-nivel').value   = '';
    document.getElementById('buscar-edicion').value = '';
    renderizarTabla(listaLibros);
}

function abrirModalCrear() {
    modoEdicion = false;
    document.getElementById('titulo-modal-libro').textContent = 'Nuevo Libro';
    document.getElementById('libro-id').value          = '';
    document.getElementById('libro-nombre').value      = '';
    document.getElementById('libro-nivel').value       = '';
    document.getElementById('libro-tipo').value        = '';
    document.getElementById('libro-edicion').value     = '';
    document.getElementById('libro-unidades').value    = '';
    document.getElementById('libro-lote').value        = '';
    document.getElementById('libro-valor-compra').value= '';
    document.getElementById('libro-valor-venta').value = '';
    document.getElementById('msg-modal-libro').style.display = 'none';
    document.getElementById('modal-libro').classList.add('activo');
}

function abrirModalEditar(indice) {
    modoEdicion = true;
    var l = listaLibros[indice];

    document.getElementById('titulo-modal-libro').textContent = 'Editar Libro';
    document.getElementById('libro-id').value          = l.id || l.idLibro || '';
    document.getElementById('libro-nombre').value      = l.nombre || '';
    document.getElementById('libro-nivel').value       = l.nivel  || '';
    document.getElementById('libro-tipo').value        = l.tipo   || '';
    document.getElementById('libro-edicion').value     = l.edicion || '';
    document.getElementById('libro-unidades').value    = l.unidades || 0;
    document.getElementById('libro-lote').value        = l.lote   || '';
    document.getElementById('libro-valor-compra').value= l.valorCompra || '';
    document.getElementById('libro-valor-venta').value = l.valorVentaPublico || l.valorVenta || '';
    document.getElementById('msg-modal-libro').style.display = 'none';
    document.getElementById('modal-libro').classList.add('activo');
}

function cerrarModal() {
    document.getElementById('modal-libro').classList.remove('activo');
}

function guardarLibro() {
    var id          = document.getElementById('libro-id').value;
    var nombre      = document.getElementById('libro-nombre').value.trim();
    var nivel       = document.getElementById('libro-nivel').value.trim();
    var tipo        = document.getElementById('libro-tipo').value;
    var edicion     = document.getElementById('libro-edicion').value.trim();
    var unidades    = document.getElementById('libro-unidades').value;
    var lote        = document.getElementById('libro-lote').value;
    var valorCompra = document.getElementById('libro-valor-compra').value;
    var valorVenta  = document.getElementById('libro-valor-venta').value;

    if (!nombre) {
        mostrarMensajeModal('El nombre del libro es obligatorio.', 'error');
        return;
    }
    if (!unidades || isNaN(unidades) || parseInt(unidades) < 0) {
        mostrarMensajeModal('Las unidades deben ser un número mayor o igual a 0.', 'error');
        return;
    }
    if (!valorVenta || isNaN(valorVenta) || parseFloat(valorVenta) < 0) {
        mostrarMensajeModal('El valor de venta es obligatorio y debe ser positivo.', 'error');
        return;
    }
    if (!tipo || (parseInt(tipo) !== 1 && parseInt(tipo) !== 2)) {
    mostrarMensajeModal('Selecciona un tipo: Student\'s Book o Workbook.', 'error');
    return;
}

    var cuerpo = {
        nombre:          nombre,
        nivel:           nivel,
        tipo: parseInt(tipo) || 0,
        edicion:         edicion,
        unidades:        parseInt(unidades),
        lote:            lote || null,
        valorCompra:     valorCompra ? parseFloat(valorCompra) : null,
        valorVentaPublico: parseFloat(valorVenta)
    };

    var url    = modoEdicion ? APIURL + '/api/Libros/' + id : APIURL + '/api/Libros';
    var metodo = modoEdicion ? 'PUT' : 'POST';

    fetch(url, {
        method: metodo,
        headers: obtenerEncabezados(),
        body: JSON.stringify(cuerpo)
    })
    .then(function (res) { return res.json(); })
    .then(function (datos) {
        if (datos.error) {
            mostrarMensajeModal(datos.mensaje || datos.error || 'Error al guardar.', 'error');
        } else {
            cerrarModal();
            mostrarMensaje('msg-libros', modoEdicion ? 'Libro actualizado.' : 'Libro creado correctamente.', 'exito');
            cargarLibros();
        }
    })
    .catch(function (err) {
        mostrarMensajeModal('Error de conexión al guardar el libro.', 'error');
        console.error(err);
    });
}

function mostrarMensajeModal(texto, tipo) {
    var el = document.getElementById('msg-modal-libro');
    if (!el) return;
    el.textContent   = texto;
    el.className     = tipo === 'error' ? 'msg-error' : 'msg-exito';
    el.style.display = 'block';
}

window.onload = inicializar;
