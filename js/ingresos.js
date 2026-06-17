var listaIngresos = [];

function inicializar() {
    var usr = verificarSesion();
    if (!usr) return;
    mostrarInfoUsuario(usr);
    configurarMenu(usr.rol);
    cargarSelectLibros();
    cargarSelectLotes();
    cargarIngresos();
}

function cargarSelectLibros() {
    fetch(APIURL + '/api/Libros', {
        method: 'GET',
        headers: obtenerEncabezados()
    })
    .then(function (res) { return res.json(); })
    .then(function (datos) {
        var sel = document.getElementById('ingreso-libro');
        sel.innerHTML = '<option value="">-- Seleccione un libro --</option>';
        for (var i = 0; i < datos.length; i++) {
            var l = datos[i];
            sel.innerHTML += '<option value="' + (l.id || l.idLibro) + '">' + l.nombre + '</option>';
        }
    })
    .catch(function () { console.warn('No se cargaron los libros.'); });
}

function cargarSelectLotes() {
    fetch(APIURL + '/api/Lotes', {
        method: 'GET',
        headers: obtenerEncabezados()
    })
    .then(function (res) { return res.json(); })
    .then(function (datos) {
        var sel = document.getElementById('ingreso-lote');
        sel.innerHTML = '<option value="">-- Seleccione un lote --</option>';
        for (var i = 0; i < datos.length; i++) {
            var l = datos[i];
            var codigo = l.lote || l.codigo || l.id;
            sel.innerHTML += '<option value="' + codigo + '">' + codigo + '</option>';
        }
    })
    .catch(function () { console.warn('No se cargaron los lotes.'); });
}

function cargarIngresos() {
    fetch(APIURL + '/api/Ingresos', {
        method: 'GET',
        headers: obtenerEncabezados()
    })
    .then(function (res) { return res.json(); })
    .then(function (datos) {
        listaIngresos = datos;
        renderizarTabla(datos);
    })
    .catch(function (err) {
        console.error('Error cargando ingresos:', err);
        document.getElementById('tabla-ingresos-body').innerHTML =
            '<tr class="sin-registros"><td colspan="7">Error al cargar los ingresos.</td></tr>';
    });
}

function renderizarTabla(datos) {
    var tbody = document.getElementById('tabla-ingresos-body');
    if (!datos || datos.length === 0) {
        tbody.innerHTML = '<tr class="sin-registros"><td colspan="7">No hay ingresos registrados.</td></tr>';
        return;
    }

    var html = '';
    for (var i = 0; i < datos.length; i++) {
        var ing = datos[i];
        html += '<tr>';
        html += '<td>' + (i + 1) + '</td>';
        html += '<td>' + (ing.libroNombre || ing.libro || ing.idLibro || '—') + '</td>';
        html += '<td>' + (ing.lote || '—') + '</td>';
        html += '<td>' + (ing.unidades !== undefined ? ing.unidades : '—') + '</td>';
        html += '<td>' + formatearPesos(ing.valorCompra) + '</td>';
        html += '<td>' + formatearPesos(ing.valorVentaPublico || ing.valorVenta) + '</td>';
        html += '<td>' + formatearFecha(ing.fecha || ing.fechaIngreso) + '</td>';
        html += '</tr>';
    }
    tbody.innerHTML = html;
}

function registrarIngreso() {
    var idLibro      = document.getElementById('ingreso-libro').value;
    var lote         = document.getElementById('ingreso-lote').value;
    var unidades     = document.getElementById('ingreso-unidades').value;
    var valorCompra  = document.getElementById('ingreso-valor-compra').value;
    var valorVenta   = document.getElementById('ingreso-valor-venta').value;

    if (!idLibro) {
        mostrarMsgForm('Selecciona un libro.', 'error');
        return;
    }
    if (!lote) {
        mostrarMsgForm('Selecciona un lote.', 'error');
        return;
    }
    if (!unidades || parseInt(unidades) < 1) {
        mostrarMsgForm('Las unidades deben ser al menos 1.', 'error');
        return;
    }
    if (!valorVenta || parseFloat(valorVenta) < 0) {
        mostrarMsgForm('El valor de venta es obligatorio.', 'error');
        return;
    }

    var cuerpo = {
        libro:            parseInt(idLibro),
        lote:             lote,
        unidades:         parseInt(unidades),
        valorCompra:      valorCompra ? parseFloat(valorCompra) : null,
        valorVentaPublico: parseFloat(valorVenta)
    };

    fetch(APIURL + '/api/Ingresos', {
        method: 'POST',
        headers: obtenerEncabezados(),
        body: JSON.stringify(cuerpo)
    })
    .then(function (res) { return res.json(); })
    .then(function (datos) {
        if (datos.error) {
            mostrarMsgForm(datos.mensaje || 'Error al registrar el ingreso.', 'error');
        } else {
            limpiarFormulario();
            mostrarMensaje('msg-ingresos', 'Ingreso registrado correctamente.', 'exito');
            cargarIngresos();
        }
    })
    .catch(function (err) {
        mostrarMsgForm('Error de conexión al registrar el ingreso.', 'error');
        console.error(err);
    });
}

function limpiarFormulario() {
    document.getElementById('ingreso-libro').value        = '';
    document.getElementById('ingreso-lote').value         = '';
    document.getElementById('ingreso-unidades').value     = '';
    document.getElementById('ingreso-valor-compra').value = '';
    document.getElementById('ingreso-valor-venta').value  = '';
    document.getElementById('msg-form-ingreso').style.display = 'none';
}

function filtrarIngresos() {
    var fechaIni = document.getElementById('filtro-fecha-inicio').value;
    var fechaFin = document.getElementById('filtro-fecha-fin').value;
    var loteText = document.getElementById('filtro-lote-busqueda').value.toLowerCase();

    var filtrados = listaIngresos.filter(function (ing) {
        var fecha = new Date(ing.fecha || ing.fechaIngreso);
        var okIni  = !fechaIni || fecha >= new Date(fechaIni);
        var okFin  = !fechaFin || fecha <= new Date(fechaFin + 'T23:59:59');
        var okLote = !loteText  || (ing.lote || '').toLowerCase().includes(loteText);
        return okIni && okFin && okLote;
    });

    renderizarTabla(filtrados);
}

function limpiarFiltros() {
    document.getElementById('filtro-fecha-inicio').value    = '';
    document.getElementById('filtro-fecha-fin').value       = '';
    document.getElementById('filtro-lote-busqueda').value   = '';
    renderizarTabla(listaIngresos);
}

function mostrarMsgForm(texto, tipo) {
    var el = document.getElementById('msg-form-ingreso');
    if (!el) return;
    el.textContent   = texto;
    el.className     = tipo === 'error' ? 'msg-error' : 'msg-exito';
    el.style.display = 'block';
}

window.onload = inicializar;
