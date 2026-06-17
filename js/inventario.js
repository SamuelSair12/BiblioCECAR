var listaInventario = [];
var UMBRAL_STOCK_BAJO = 5; 

function inicializar() {
    var usr = verificarSesion();
    if (!usr) return;
    mostrarInfoUsuario(usr);
    configurarMenu(usr.rol);
    cargarSelectLotes();
    cargarInventarioGeneral();
}

function cargarSelectLotes() {
    fetch(APIURL + '/api/Lotes', {
        method: 'GET',
        headers: obtenerEncabezados()
    })
    .then(function (res) { return res.json(); })
    .then(function (datos) {
        var sel = document.getElementById('filtro-lote-inv');
        sel.innerHTML = '<option value="">Todos los lotes</option>';
        for (var i = 0; i < datos.length; i++) {
            var l   = datos[i];
            var cod = l.lote || l.codigo || l.id;
            sel.innerHTML += '<option value="' + cod + '">' + cod + '</option>';
        }
    })
    .catch(function () { console.warn('No se cargaron los lotes.'); });
}

function cargarInventarioGeneral() {
    document.getElementById('filtro-lote-inv').value = '';
    fetch(APIURL + '/api/Inventario', {
        method: 'GET',
        headers: obtenerEncabezados()
    })
    .then(function (res) { return res.json(); })
    .then(function (datos) {
        listaInventario = datos;
        renderizarTabla(datos);
        renderizarResumen(datos);
    })
    .catch(function (err) {
        console.error('Error cargando inventario:', err);
        document.getElementById('tabla-inventario-body').innerHTML =
            '<tr class="sin-registros"><td colspan="5">Error al cargar el inventario.</td></tr>';
    });
}

function filtrarInventario() {
    var lote = document.getElementById('filtro-lote-inv').value;
    if (!lote) {
        cargarInventarioGeneral();
        return;
    }

    fetch(APIURL + '/api/Inventario?lote=' + lote, {
        method: 'GET',
        headers: obtenerEncabezados()
    })
    .then(function (res) { return res.json(); })
    .then(function (datos) {
        renderizarTabla(datos);
        renderizarResumen(datos);
    })
    .catch(function (err) {
        console.error('Error filtrando inventario:', err);
    });
}

function renderizarTabla(datos) {
    var tbody = document.getElementById('tabla-inventario-body');
    if (!datos || datos.length === 0) {
        tbody.innerHTML = '<tr class="sin-registros"><td colspan="5">No se encontraron registros de inventario.</td></tr>';
        return;
    }

    var html = '';
    for (var i = 0; i < datos.length; i++) {
        var item  = datos[i];
        var stock = item.stock !== undefined ? item.stock : (item.unidades !== undefined ? item.unidades : 0);

        var claseFila  = '';
        var badgeStock = '';

        if (stock <= 0) {
            claseFila  = 'fila-sin-stock';
            badgeStock = '<span class="badge badge-rojo">Sin stock</span>';
        } else if (stock <= UMBRAL_STOCK_BAJO) {
            claseFila  = 'fila-stock-bajo';
            badgeStock = '<span class="badge badge-amarillo">Stock bajo</span>';
        } else {
            badgeStock = '<span class="badge badge-verde">Disponible</span>';
        }

        html += '<tr class="' + claseFila + '">';
        html += '<td>' + (i + 1) + '</td>';
        html += '<td>' + (item.libroNombre || item.libro || item.nombre || '—') + '</td>';
        html += '<td>' + (item.lote || '—') + '</td>';
        html += '<td><strong>' + stock + '</strong></td>';
        html += '<td>' + badgeStock + '</td>';
        html += '</tr>';
    }
    tbody.innerHTML = html;
}

function renderizarResumen(datos) {
    var contenedor = document.getElementById('resumen-stock');
    if (!contenedor) return;

    var total       = datos.length;
    var sinStock    = 0;
    var stockBajo   = 0;
    var totalUnidades = 0;

    for (var i = 0; i < datos.length; i++) {
        var stock = datos[i].stock !== undefined ? datos[i].stock : (datos[i].unidades || 0);
        totalUnidades += stock;
        if (stock <= 0) {
            sinStock++;
        } else if (stock <= UMBRAL_STOCK_BAJO) {
            stockBajo++;
        }
    }

    contenedor.innerHTML =
        '<div class="tarjeta-resumen-inv">' +
            '<span class="num">' + total + '</span>' +
            '<span class="etq">Títulos en Inventario</span>' +
        '</div>' +
        '<div class="tarjeta-resumen-inv">' +
            '<span class="num">' + totalUnidades + '</span>' +
            '<span class="etq">Unidades Totales</span>' +
        '</div>' +
        '<div class="tarjeta-resumen-inv alerta">' +
            '<span class="num">' + stockBajo + '</span>' +
            '<span class="etq">⚠️ Stock Bajo</span>' +
        '</div>';

    if (sinStock > 0) {
        contenedor.innerHTML +=
            '<div class="tarjeta-resumen-inv critico" style="grid-column: 1/-1;">' +
                '<span class="num">⚠️ ' + sinStock + ' libro(s) sin stock</span>' +
                '<span class="etq">Requieren reposición urgente</span>' +
            '</div>';
    }
}

window.onload = inicializar;
