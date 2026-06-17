var listaVentas  = [];
var itemsVenta   = []; 
var listaLibros  = [];

function inicializar() {
    var usr = verificarSesion();
    if (!usr) return;
    mostrarInfoUsuario(usr);
    configurarMenu(usr.rol);
    cargarSelectClientes();
    cargarSelectLibros();
    cargarSelectLotes();
    cargarVentas();
    generarComprobante();
}

function generarComprobante() {
    var ahora  = new Date();
    var codigo = 'VTA-' + ahora.getFullYear()
        + String(ahora.getMonth() + 1).padStart(2, '0')
        + String(ahora.getDate()).padStart(2, '0')
        + '-' + String(Math.floor(Math.random() * 9000) + 1000);
    document.getElementById('venta-comprobante').value = codigo;
}

function cargarSelectClientes() {
    fetch(APIURL + '/api/Clientes', {
        method: 'GET',
        headers: obtenerEncabezados()
    })
    .then(function (res) { return res.json(); })
    .then(function (datos) {
        var sel = document.getElementById('venta-cliente');
        sel.innerHTML = '<option value="">-- Seleccione un cliente --</option>';
        for (var i = 0; i < datos.length; i++) {
            var c = datos[i];
            sel.innerHTML += '<option value="' + (c.identificacion || c.id) + '">'
                + (c.nombres || c.nombre) + ' — ' + (c.identificacion || '') + '</option>';
        }
    })
    .catch(function () { console.warn('No se cargaron los clientes.'); });
}

function cargarSelectLibros() {
    fetch(APIURL + '/api/Libros', {
        method: 'GET',
        headers: obtenerEncabezados()
    })
    .then(function (res) { return res.json(); })
    .then(function (datos) {
        listaLibros = datos;
        var sel = document.getElementById('item-libro');
        sel.innerHTML = '<option value="">-- Seleccione --</option>';
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
        var sel = document.getElementById('item-lote');
        sel.innerHTML = '<option value="">-- Lote --</option>';
        for (var i = 0; i < datos.length; i++) {
            var l   = datos[i];
            var cod = l.lote || l.codigo || l.id;
            sel.innerHTML += '<option value="' + cod + '">' + cod + '</option>';
        }
    })
    .catch(function () { console.warn('No se cargaron los lotes.'); });
}

function agregarItem() {
    var libroId  = document.getElementById('item-libro').value;
    var lote     = document.getElementById('item-lote').value;
    var cantidad = document.getElementById('item-cantidad').value;

    if (!libroId) {
        alert('Selecciona un libro para agregar.');
        return;
    }
    if (!lote) {
        alert('Selecciona el lote del libro.');
        return;
    }
    if (!cantidad || parseInt(cantidad) < 1) {
        alert('La cantidad debe ser al menos 1.');
        return;
    }

    var nombreLibro = '';
    for (var i = 0; i < listaLibros.length; i++) {
        if (String(listaLibros[i].id || listaLibros[i].idLibro) === libroId) {
            nombreLibro = listaLibros[i].nombre;
            break;
        }
    }

    itemsVenta.push({
        libro:    parseInt(libroId),
        nombre:   nombreLibro,
        lote:     lote,
        cantidad: parseInt(cantidad)
    });

    document.getElementById('item-libro').value    = '';
    document.getElementById('item-lote').value     = '';
    document.getElementById('item-cantidad').value = '1';

    renderizarItems();
}

function quitarItem(indice) {
    itemsVenta.splice(indice, 1);
    renderizarItems();
}

function renderizarItems() {
    var tbody = document.getElementById('items-body');
    if (itemsVenta.length === 0) {
        tbody.innerHTML = '<tr class="sin-registros"><td colspan="4">Aún no hay ítems agregados.</td></tr>';
        return;
    }

    var html = '';
    for (var i = 0; i < itemsVenta.length; i++) {
        var item = itemsVenta[i];
        html += '<tr>';
        html += '<td>' + item.nombre + '</td>';
        html += '<td>' + item.lote + '</td>';
        html += '<td>' + item.cantidad + '</td>';
        html += '<td><button class="btn-peligro" onclick="quitarItem(' + i + ')">Quitar</button></td>';
        html += '</tr>';
    }
    tbody.innerHTML = html;
}

function registrarVenta() {
    var idCliente    = document.getElementById('venta-cliente').value;
    var comprobante  = document.getElementById('venta-comprobante').value.trim();
    var observaciones= document.getElementById('venta-observaciones').value.trim();

    if (!idCliente) {
        mostrarMsgForm('Selecciona un cliente para la venta.', 'error');
        return;
    }
    if (!comprobante) {
        mostrarMsgForm('El número de comprobante es obligatorio.', 'error');
        return;
    }
    if (itemsVenta.length === 0) {
        mostrarMsgForm('Agrega al menos un libro a la venta.', 'error');
        return;
    }

    var items = [];
    for (var i = 0; i < itemsVenta.length; i++) {
        items.push({
            libro:    itemsVenta[i].libro,
            lote:     itemsVenta[i].lote,
            cantidad: itemsVenta[i].cantidad
        });
    }

    var cuerpo = {
        identificacionCliente: idCliente,
        numeroComprobante:     comprobante,
        observaciones:         observaciones || null,
        items:                 items
    };

    fetch(APIURL + '/api/Ventas', {
        method: 'POST',
        headers: obtenerEncabezados(),
        body: JSON.stringify(cuerpo)
    })
    .then(function (res) { return res.json(); })
    .then(function (datos) {
        if (datos.error) {
            mostrarMsgForm(datos.mensaje || 'Error al registrar la venta.', 'error');
        } else {
            limpiarVenta();
            mostrarMensaje('msg-ventas', 'Venta registrada correctamente. Comprobante: ' + comprobante, 'exito');
            cargarVentas();
        }
    })
    .catch(function (err) {
        mostrarMsgForm('Error de conexión al registrar la venta.', 'error');
        console.error(err);
    });
}

function limpiarVenta() {
    document.getElementById('venta-cliente').value       = '';
    document.getElementById('venta-observaciones').value = '';
    document.getElementById('msg-form-venta').style.display = 'none';
    itemsVenta = [];
    renderizarItems();
    generarComprobante();
}

function cargarVentas() {
    fetch(APIURL + '/api/Ventas', {
        method: 'GET',
        headers: obtenerEncabezados()
    })
    .then(function (res) { return res.json(); })
    .then(function (datos) {
        listaVentas = datos;
        renderizarTablaVentas(datos);
    })
    .catch(function (err) {
        console.error('Error cargando ventas:', err);
        document.getElementById('tabla-ventas-body').innerHTML =
            '<tr class="sin-registros"><td colspan="6">Error al cargar las ventas.</td></tr>';
    });
}

function renderizarTablaVentas(datos) {
    var tbody = document.getElementById('tabla-ventas-body');
    if (!datos || datos.length === 0) {
        tbody.innerHTML = '<tr class="sin-registros"><td colspan="6">No hay ventas registradas.</td></tr>';
        return;
    }

    var html = '';
    for (var i = 0; i < datos.length; i++) {
        var v = datos[i];
        html += '<tr>';
        html += '<td>' + (i + 1) + '</td>';
        html += '<td>' + (v.numeroComprobante || v.comprobante || '—') + '</td>';
        html += '<td>' + (v.cliente || v.identificacionCliente || '—') + '</td>';
        html += '<td>' + (v.observaciones || '—') + '</td>';
        html += '<td>' + formatearFecha(v.fecha || v.fechaVenta) + '</td>';
        html += '<td>';
        if (v.id || v.idVenta) {
            html += '<button class="btn-editar" onclick="verDetalle(' + (v.id || v.idVenta) + ')">Ver</button>';
        }
        html += '</td>';
        html += '</tr>';
    }
    tbody.innerHTML = html;
}

function filtrarVentas() {
    var ini     = document.getElementById('filtro-fecha-ini-v').value;
    var fin     = document.getElementById('filtro-fecha-fin-v').value;
    var cliente = document.getElementById('filtro-cliente-v').value.toLowerCase();

    var filtrados = listaVentas.filter(function (v) {
        var fecha = new Date(v.fecha || v.fechaVenta);
        var okIni  = !ini     || fecha >= new Date(ini);
        var okFin  = !fin     || fecha <= new Date(fin + 'T23:59:59');
        var okCli  = !cliente || (v.cliente || v.identificacionCliente || '').toLowerCase().includes(cliente);
        return okIni && okFin && okCli;
    });

    renderizarTablaVentas(filtrados);
}

function limpiarFiltros() {
    document.getElementById('filtro-fecha-ini-v').value = '';
    document.getElementById('filtro-fecha-fin-v').value = '';
    document.getElementById('filtro-cliente-v').value   = '';
    renderizarTablaVentas(listaVentas);
}

function verDetalle(idVenta) {
    alert('Detalle de la venta #' + idVenta + '\n\nConsulta el registro en el panel de ventas de la API.');
}

function mostrarMsgForm(texto, tipo) {
    var el = document.getElementById('msg-form-venta');
    if (!el) return;
    el.textContent   = texto;
    el.className     = tipo === 'error' ? 'msg-error' : 'msg-exito';
    el.style.display = 'block';
}

window.onload = inicializar;
