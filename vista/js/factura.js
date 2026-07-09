let tablaFacturas;
let tablaDetalle;
let tablaClientes;
let tablaProductos;
let modalClientes;
let modalProductos;

const IVA_PORCENTAJE = 0.13;

const URL_FACTURA = '../controlador/ControladorFactura.php';
const URL_CLIENTE = '../controlador/ControladorCliente.php';
const URL_PRODUCTO = '../controlador/ControladorProducto.php';

$(document).ready(function () {
    modalClientes = new bootstrap.Modal(document.getElementById('modalClientes'));
    modalProductos = new bootstrap.Modal(document.getElementById('modalProductos'));

    tablaFacturas = $('#tablaFacturas').DataTable({
        responsive: true,
        autoWidth: false,
        pageLength: 10,
        language: {
            url: "datatable/es-ES.json"
        },
        columnDefs: [
            {
                targets: 5,
                orderable: false,
                searchable: false,
                className: 'text-center acciones-btns',
                render: function () {
                    return "<button type='button' class='btn btn-sm btn-info btn-pdf-factura'>PDF</button> " +
                           "<button type='button' class='btn btn-sm btn-danger btn-eliminar-factura'>Eliminar</button>";
                }
            },
            {
                targets: 6,
                visible: false,
                searchable: false
            }
        ]
    });

    tablaDetalle = $('#tablaDetalle').DataTable({
        responsive: true,
        autoWidth: false,
        pageLength: 10,
        language: {
            url: "datatable/es-ES.json"
        },
        columnDefs: [
            {
                targets: 5,
                orderable: false,
                searchable: false,
                className: 'text-center acciones-btns',
                render: function () {
                    return "<button type='button' class='btn btn-sm btn-warning btn-editar-detalle'>Editar</button> " +
                           "<button type='button' class='btn btn-sm btn-danger btn-eliminar-detalle'>Eliminar</button>";
                }
            }
        ]
    });

    tablaClientes = $('#tablaClientes').DataTable({
        responsive: true,
        autoWidth: false,
        pageLength: 5,
        language: {
            url: "datatable/es-ES.json"
        },
        columnDefs: [{
            targets: 2,
            orderable: false,
            searchable: false,
            className: 'text-center',
            render: function () {
                return "<button type='button' class='btn btn-sm btn-primary btn-seleccionar-cliente'>Seleccionar</button>";
            }
        }]
    });

    tablaProductos = $('#tablaProductos').DataTable({
        responsive: true,
        autoWidth: false,
        pageLength: 5,
        language: {
            url: "datatable/es-ES.json"
        },
        columnDefs: [{
            targets: 3,
            orderable: false,
            searchable: false,
            className: 'text-center',
            render: function () {
                return "<button type='button' class='btn btn-sm btn-primary btn-seleccionar-producto'>Seleccionar</button>";
            }
        }]
    });

    cargarTablaFacturas();

    $('#btnMostrarFormulario').on('click', function () {
        mostrarFormularioAgregar();
    });

    $('#btnCancelarFactura').on('click', function () {
        ocultarFormulario();
    });

    $('#btnBuscarCliente').on('click', function () {
        cargarTablaClientes();
        modalClientes.show();
    });

    $('#btnBuscarProducto').on('click', function () {
        cargarTablaProductos();
        modalProductos.show();
    });

    $('#cedulaCliente').on('blur', function () {
        buscarClientePorCedula();
    });

    $('#codigoProducto').on('blur', function () {
        buscarProductoPorCodigo();
    });

    $('#btnAgregarDetalle').on('click', function () {
        agregarDetalle();
    });

    $('#btnGuardarFactura').on('click', function () {
        guardarFactura();
    });

    $('#tablaClientes tbody').on('click', '.btn-seleccionar-cliente', function () {
        seleccionarCliente(this);
    });

    $('#tablaProductos tbody').on('click', '.btn-seleccionar-producto', function () {
        seleccionarProducto(this);
    });

    $('#tablaDetalle tbody').on('click', '.btn-editar-detalle', function () {
        editarDetalle(this);
    });

    $('#tablaDetalle tbody').on('click', '.btn-eliminar-detalle', function () {
        eliminarDetalle(this);
    });

    $('#tablaFacturas tbody').on('click', '.btn-eliminar-factura', function () {
        eliminarFactura(this);
    });

    // Abre el PDF de la factura en una pestaña nueva
    $('#tablaFacturas tbody').on('click', '.btn-pdf-factura', function () {
        const fila = tablaFacturas.row($(this).closest('tr'));
        const idFactura = fila.data()[6]; // columna oculta con el id real
        window.open('rptfactura.php?id=' + idFactura, '_blank');
    });
});

// ---------- Carga de tablas desde el servidor ----------
function cargarTablaFacturas() {
    $.ajax({
        type: "GET",
        url: URL_FACTURA + "?op=listar",
        dataType: "json",
        success: function (respuesta) {
            tablaFacturas.clear();

            respuesta["datos"].forEach(function (f) {
                tablaFacturas.row.add([
                    convertirFechaAVisual(f.fecha),
                    f.cedula_cliente,
                    f.nombre_cliente,
                    f.cantidad_productos,
                    '₡' + parseFloat(f.total).toFixed(2),
                    '',
                    f.id // dato extra oculto (no se muestra columna, se usa para el PDF)
                ]);
            });

            tablaFacturas.draw();
        }
    });
}

function cargarTablaClientes() {
    $.ajax({
        type: "GET",
        url: URL_CLIENTE + "?op=listar",
        dataType: "json",
        success: function (respuesta) {
            tablaClientes.clear();

            respuesta["datos"].forEach(function (c) {
                tablaClientes.row.add([
                    c.cedula,
                    c.nombre + ' ' + c.apellido,
                    ''
                ]);
            });

            tablaClientes.draw();
        }
    });
}

function cargarTablaProductos() {
    $.ajax({
        type: "GET",
        url: URL_PRODUCTO + "?op=listar",
        dataType: "json",
        success: function (respuesta) {
            tablaProductos.clear();

            respuesta["datos"].forEach(function (p) {
                tablaProductos.row.add([
                    p.codigo,
                    p.nombre,
                    p.precio,
                    ''
                ]);
            });

            tablaProductos.draw();
        }
    });
}

// ---------- Encabezado ----------
function mostrarFormularioAgregar() {
    limpiarFormularioFactura();
    colocarFechaActual();
    $('#tituloFormulario').text('Nueva factura');
    $('#panelTabla').hide();
    $('#panelFormulario').show();
    $('#btnMostrarFormulario').hide();
    $('#cedulaCliente').focus();
}

function ocultarFormulario() {
    limpiarFormularioFactura();
    $('#panelFormulario').hide();
    $('#panelTabla').show();
    $('#btnMostrarFormulario').show();
}

function limpiarFormularioFactura() {
    $('#cedulaCliente').val('');
    $('#nombreCliente').val('');
    $('#codigoProducto').val('');
    $('#nombreProducto').val('');
    $('#precioProducto').val('');
    $('#cantidadProducto').val(1);
    tablaDetalle.clear().draw(false);
    calcularTotales();
    colocarFechaActual();
}

function colocarFechaActual() {
    const hoy = new Date();
    const anio = hoy.getFullYear();
    const mes = String(hoy.getMonth() + 1).padStart(2, '0');
    const dia = String(hoy.getDate()).padStart(2, '0');
    $('#fechaFactura').val(`${anio}-${mes}-${dia}`);
}

function buscarClientePorCedula() {
    const cedula = $('#cedulaCliente').val().trim();

    if (cedula === '') {
        $('#nombreCliente').val('');
        return;
    }

    $.ajax({
        type: "GET",
        url: URL_CLIENTE + "?op=buscar&cedula=" + encodeURIComponent(cedula),
        dataType: "json",
        success: function (respuesta) {
            if (respuesta["exito"]) {
                $('#nombreCliente').val(respuesta["datos"].nombre + ' ' + respuesta["datos"].apellido);
            } else {
                $('#nombreCliente').val('');
                alert('No existe un cliente con esa cedula.');
            }
        }
    });
}

function seleccionarCliente(boton) {
    const fila = tablaClientes.row($(boton).closest('tr'));
    const datos = fila.data();
    $('#cedulaCliente').val(datos[0]);
    $('#nombreCliente').val(datos[1]);
    modalClientes.hide();
    $('#cedulaCliente').focus();
}

// ---------- Detalle ----------
function buscarProductoPorCodigo() {
    const codigo = $('#codigoProducto').val().trim();

    if (codigo === '') {
        $('#nombreProducto').val('');
        $('#precioProducto').val('');
        return;
    }

    $.ajax({
        type: "GET",
        url: URL_PRODUCTO + "?op=buscar&codigo=" + encodeURIComponent(codigo),
        dataType: "json",
        success: function (respuesta) {
            if (respuesta["exito"]) {
                $('#nombreProducto').val(respuesta["datos"].nombre);
                $('#precioProducto').val(respuesta["datos"].precio);
            } else {
                $('#nombreProducto').val('');
                $('#precioProducto').val('');
                alert('No existe un producto con ese codigo.');
            }
        }
    });
}

function seleccionarProducto(boton) {
    const fila = tablaProductos.row($(boton).closest('tr'));
    const datos = fila.data();
    $('#codigoProducto').val(datos[0]);
    $('#nombreProducto').val(datos[1]);
    $('#precioProducto').val(datos[2]);
    modalProductos.hide();
    $('#codigoProducto').focus();
}

function agregarDetalle() {
    const codigoProducto = $('#codigoProducto').val().trim();
    const nombreProducto = $('#nombreProducto').val().trim();
    const precioProducto = parseFloat($('#precioProducto').val());
    const cantidadProducto = parseInt($('#cantidadProducto').val());

    if (codigoProducto === '' || nombreProducto === '') {
        alert('Debe seleccionar un producto valido.');
        return;
    }

    if (isNaN(cantidadProducto) || cantidadProducto <= 0) {
        alert('La cantidad debe ser mayor a cero.');
        return;
    }

    const subtotal = precioProducto * cantidadProducto;

    tablaDetalle.row.add([
        codigoProducto,
        nombreProducto,
        precioProducto.toFixed(2),
        cantidadProducto,
        subtotal.toFixed(2),
        ''
    ]).draw(false);

    $('#codigoProducto').val('');
    $('#nombreProducto').val('');
    $('#precioProducto').val('');
    $('#cantidadProducto').val(1);
    $('#codigoProducto').focus();

    calcularTotales();
}

// Trae de nuevo una linea del detalle al formulario para poder modificarla
function editarDetalle(boton) {
    const fila = tablaDetalle.row($(boton).closest('tr'));
    const datos = fila.data();

    $('#codigoProducto').val(datos[0]);
    $('#nombreProducto').val(datos[1]);
    $('#precioProducto').val(datos[2]);
    $('#cantidadProducto').val(datos[3]);

    // Quitamos la fila de la tabla; al presionar "Agregar" se vuelve a
    // insertar con los valores actualizados
    fila.remove().draw(false);
    calcularTotales();

    $('#cantidadProducto').focus();
}

function eliminarDetalle(boton) {
    const fila = tablaDetalle.row($(boton).closest('tr'));
    fila.remove().draw(false);
    calcularTotales();
}

function calcularTotales() {
    let subtotal = 0;

    tablaDetalle.rows().every(function () {
        const datos = this.data();
        subtotal += parseFloat(datos[4]);
    });

    const iva = subtotal * IVA_PORCENTAJE;
    const total = subtotal + iva;

    $('#montoSubtotal').text('₡' + subtotal.toFixed(2));
    $('#montoIva').text('₡' + iva.toFixed(2));
    $('#montoTotal').text('₡' + total.toFixed(2));
}

// ---------- Guardar ----------
function guardarFactura() {
    const fecha = $('#fechaFactura').val().trim();
    const cedula = $('#cedulaCliente').val().trim();
    const nombre = $('#nombreCliente').val().trim();
    const cantidadProductos = tablaDetalle.rows().count();

    if (fecha === '' || cedula === '' || nombre === '') {
        alert('Debe completar la fecha y seleccionar un cliente.');
        return;
    }

    if (cantidadProductos === 0) {
        alert('Debe agregar al menos un producto.');
        return;
    }

    // Convertimos las filas del detalle a un arreglo de objetos
    const detalle = [];
    tablaDetalle.rows().every(function () {
        const datos = this.data();
        detalle.push({
            codigo: datos[0],
            precioUnitario: parseFloat(datos[2]),
            cantidad: parseInt(datos[3])
        });
    });

    $.ajax({
        type: "POST",
        url: URL_FACTURA + "?op=guardar",
        data: JSON.stringify({
            fecha: fecha,
            cedula: cedula,
            detalle: detalle
        }),
        contentType: "application/json; charset=UTF-8",
        dataType: "json",
        success: function (respuesta) {
            alert(respuesta["mensaje"]);

            if (respuesta["exito"]) {
                cargarTablaFacturas();
                ocultarFormulario();
            }
        }
    });
}

function eliminarFactura(boton) {
    const fila = tablaFacturas.row($(boton).closest('tr'));
    const idFactura = fila.data()[6];

    if (!confirm('¿Desea eliminar la factura? Esta accion no se puede deshacer.')) {
        return;
    }

    $.ajax({
        type: "POST",
        url: URL_FACTURA + "?op=eliminar",
        data: JSON.stringify({ id: idFactura }),
        contentType: "application/json; charset=UTF-8",
        dataType: "json",
        success: function (respuesta) {
            alert(respuesta["mensaje"]);

            if (respuesta["exito"]) {
                cargarTablaFacturas();
            }
        }
    });
}

function convertirFechaAVisual(fechaInput) {
    // La fecha llega desde MySQL en formato YYYY-MM-DD
    const partes = fechaInput.split('-');
    if (partes.length !== 3) return fechaInput;
    return `${partes[2]}/${partes[1]}/${partes[0]}`;
}
