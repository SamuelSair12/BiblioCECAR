var usuario = null;

function inicializar() {
    usuario = verificarSesion();
    if (!usuario) return;

    mostrarInfoUsuario(usuario);
    configurarMenu(usuario.rol);

    var rol = normalizarRol(usuario.rol);
    var nombre = usuario.nombres || usuario.nombre || 'Usuario';
    document.getElementById('bienvenida').textContent =
        'Bienvenido/a, ' + nombre + '. Estás conectado como ' + rol + '.';

    cargarIndicadores();
    cargarVentasRecientes();
    generarAccesosRapidos(rol);
}

function cargarIndicadores() {
    fetch(APIURL + '/api/Dashboard', {
        method: 'GET',
        headers: obtenerEncabezados()
    })
    .then(function (res) {
        return res.json();
    })
    .then(function (datos) {
        var tLibros  = document.getElementById('total-libros');
        var vHoy     = document.getElementById('ventas-hoy');
        var stock    = document.getElementById('stock-disponible');
        var tClientes= document.getElementById('total-clientes');

        if (tLibros)   tLibros.textContent   = datos.totalLibros   !== undefined ? datos.totalLibros   : '—';
        if (vHoy)      vHoy.textContent      = datos.ventasHoy     !== undefined ? datos.ventasHoy     : '—';
        if (stock)     stock.textContent     = datos.stockDisponible!== undefined ? datos.stockDisponible: '—';
        if (tClientes) tClientes.textContent = datos.totalClientes  !== undefined ? datos.totalClientes : '—';
    })
    .catch(function (err) {
        console.warn('No se pudo cargar el dashboard:', err);
        
    });
}

function cargarVentasRecientes() {
    fetch(APIURL + '/api/Ventas', {
        method: 'GET',
        headers: obtenerEncabezados()
    })
    .then(function (res) {
        return res.json();
    })
    .then(function (datos) {
        var tbody = document.getElementById('tabla-ventas-recientes');
        if (!tbody) return;

        if (!datos || datos.length === 0) {
            tbody.innerHTML = '<tr class="sin-registros"><td colspan="4">No hay ventas registradas aún.</td></tr>';
            return;
        }

        var ultimas = datos.slice(-5).reverse();
        var html = '';

        for (var i = 0; i < ultimas.length; i++) {
            var v = ultimas[i];
            html += '<tr>';
            html += '<td>' + (v.numeroComprobante || v.comprobante || '—') + '</td>';
            html += '<td>' + (v.cliente || v.identificacionCliente || '—') + '</td>';
            html += '<td>' + formatearFecha(v.fecha || v.fechaVenta) + '</td>';
            html += '<td>' + formatearPesos(v.total || v.valorTotal) + '</td>';
            html += '</tr>';
        }

        tbody.innerHTML = html;
    })
    .catch(function (err) {
        console.warn('No se pudo cargar ventas recientes:', err);
        var tbody = document.getElementById('tabla-ventas-recientes');
        if (tbody) {
            tbody.innerHTML = '<tr class="sin-registros"><td colspan="4">No se pudo cargar la información.</td></tr>';
        }
    });
}

function generarAccesosRapidos(rol) {
    var grilla = document.getElementById('grilla-accesos');
    if (!grilla) return;

    var modulos = [];

    if (rol === 'Administrador') {
        modulos = [
            { href: 'usuarios.html',   icono: 'fas fa-users',         texto: 'Usuarios'   },
            { href: 'libros.html',     icono: 'fas fa-book',          texto: 'Libros'     },
            { href: 'clientes.html',   icono: 'fas fa-user-tie',      texto: 'Clientes'   },
            { href: 'ingresos.html',   icono: 'fas fa-box-open',      texto: 'Ingresos'   },
            { href: 'inventario.html', icono: 'fas fa-boxes',         texto: 'Inventario' },
            { href: 'ventas.html',     icono: 'fas fa-shopping-cart', texto: 'Ventas'     },
            { href: 'lotes.html',      icono: 'fas fa-tags',          texto: 'Lotes'      },
            { href: 'perfil.html',     icono: 'fas fa-user-circle',   texto: 'Perfil'     }
        ];

    } else if (rol === 'Bibliotecario') {
        modulos = [
            { href: 'libros.html',     icono: 'fas fa-book',          texto: 'Libros'     },
            { href: 'clientes.html',   icono: 'fas fa-user-tie',      texto: 'Clientes'   },
            { href: 'ingresos.html',   icono: 'fas fa-box-open',      texto: 'Ingresos'   },
            { href: 'inventario.html', icono: 'fas fa-boxes',         texto: 'Inventario' },
            { href: 'ventas.html',     icono: 'fas fa-shopping-cart', texto: 'Ventas'     },
            { href: 'lotes.html',      icono: 'fas fa-tags',          texto: 'Lotes'      },
            { href: 'perfil.html',     icono: 'fas fa-user-circle',   texto: 'Perfil'     }
        ];

    } else {
        modulos = [
            { href: 'libros.html',     icono: 'fas fa-book',  texto: 'Catálogo'   },
            { href: 'inventario.html', icono: 'fas fa-boxes', texto: 'Inventario' },
            { href: 'perfil.html',     icono: 'fas fa-user-circle', texto: 'Perfil' }
        ];
    }

    var html = '';
    for (var i = 0; i < modulos.length; i++) {
        var m = modulos[i];
        html += '<a href="' + m.href + '" class="boton-acceso">';
        html += '<i class="' + m.icono + ' acceso-icono"></i>';
        html += '<span class="acceso-texto">' + m.texto + '</span>';
        html += '</a>';
    }

    grilla.innerHTML = html;
}

window.onload = inicializar;
