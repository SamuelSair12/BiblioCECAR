var APIURL = 'http://localhost:8080';

function verificarSesion() {
    var token = localStorage.getItem('token');
    var usuarioStr = localStorage.getItem('usuario');

    if (!token || !usuarioStr) {
        window.location.href = '../html/login.html';
        return null;
    }

    try {
        return JSON.parse(usuarioStr);
    } catch (e) {
        localStorage.clear();
        window.location.href = '../html/login.html';
        return null;
    }
}

function cerrarSesion() {
    if (confirm('¿Deseas cerrar la sesión?')) {
        localStorage.removeItem('token');
        localStorage.removeItem('usuario');
        window.location.href = '../html/login.html';
    }
}

function obtenerToken() {
    return localStorage.getItem('token');
}

function obtenerEncabezados() {
    return {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + obtenerToken()
    };
}

function normalizarRol(rol) {
    var r = String(rol).trim().toLowerCase();
    if (r === '1' || r === 'admin' || r === 'administrador') return 'Administrador';
    if (r === '2' || r === 'bibliotecario' || r === 'operador') return 'Bibliotecario';
    return 'Invitado';
}

function configurarMenu(rolUsuario) {
    var rol = normalizarRol(rolUsuario);

    var ids = [
        'menu-dashboard',
        'menu-usuarios',
        'menu-libros',
        'menu-clientes',
        'menu-ingresos',
        'menu-inventario',
        'menu-ventas',
        'menu-lotes'
    ];

    for (var i = 0; i < ids.length; i++) {
        var el = document.getElementById(ids[i]);
        if (el) el.style.display = 'none';
    }

    function mostrar(id) {
        var el = document.getElementById(id);
        if (el) el.style.display = 'block';
    }

    if (rol === 'Administrador') {
        mostrar('menu-dashboard');
        mostrar('menu-usuarios');
        mostrar('menu-libros');
        mostrar('menu-clientes');
        mostrar('menu-ingresos');
        mostrar('menu-inventario');
        mostrar('menu-ventas');
        mostrar('menu-lotes');

    } else if (rol === 'Bibliotecario') {
        mostrar('menu-dashboard');
        mostrar('menu-libros');
        mostrar('menu-clientes');
        mostrar('menu-ingresos');
        mostrar('menu-inventario');
        mostrar('menu-ventas');
        mostrar('menu-lotes');

    } else {
        
        mostrar('menu-libros');
        mostrar('menu-inventario');
    }
}

function mostrarInfoUsuario(usuario) {
    var elNombre = document.getElementById('nombre-usuario');
    var elRol    = document.getElementById('rol-usuario');
    var elBarraNombre = document.getElementById('barra-nombre');
    var elBarraRol    = document.getElementById('barra-rol');

    var nombre = usuario.nombres || usuario.nombre || 'Usuario';
    var rol    = normalizarRol(usuario.rol);

    if (elNombre) elNombre.textContent = nombre;
    if (elRol)    elRol.textContent    = rol;
    if (elBarraNombre) elBarraNombre.textContent = nombre;
    if (elBarraRol)    elBarraRol.textContent    = rol;
}

function mostrarMensaje(idElemento, texto, tipo) {
    var el = document.getElementById(idElemento);
    if (!el) return;
    el.textContent = texto;
    el.className = tipo === 'exito'
        ? 'msg-exito'
        : tipo === 'advertencia'
            ? 'msg-advertencia'
            : 'msg-error';
    el.style.display = 'block';

    setTimeout(function () {
        el.style.display = 'none';
    }, 4000);
}

function formatearFecha(fechaStr) {
    if (!fechaStr) return '—';
    var d = new Date(fechaStr);
    if (isNaN(d.getTime())) return fechaStr;
    return d.toLocaleDateString('es-CO', {
        year: 'numeric', month: '2-digit', day: '2-digit'
    });
}

function formatearPesos(valor) {
    if (valor === null || valor === undefined) return '—';
    return '$ ' + Number(valor).toLocaleString('es-CO');
}
