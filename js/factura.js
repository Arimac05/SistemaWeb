let tablaFacturas;
let tablaDetalle;
let tablaClientes;
let tablaProductos;
let modalClientes;
let modalProductos;
let idFacturaEditando = null;

const IVA_PORCENTAJE = 0.13;

// Estas listas se llenan desde el servidor (ver cargarClientes / cargarProductos)
// y se usan como cache local para el autocompletado por cedula/codigo
let listaClientes = [];
let listaProductos = [];

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
                render: function (data, type, row) {
                    const id = row[6];
                    return "<button type='button' class='btn btn-sm btn-info btn-pdf-factura' data-id='" + id + "'>Generar PDF</button> " +
                           "<button type='button' class='btn btn-sm btn-warning btn-editar-factura' data-id='" + id + "'>Editar</button> " +
                           "<button type='button' class='btn btn-sm btn-danger btn-eliminar-factura' data-id='" + id + "'>Eliminar</button>";
                }
            },
            {
                // Columna oculta que guarda el id real de la factura en la base de datos
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

    // Cargamos los datos reales desde el servidor (config/modelo/controlador en PHP)
    cargarClientes();
    cargarProductos();
    cargarFacturas();

    $('#btnMostrarFormulario').on('click', function () {
        mostrarFormularioAgregar();
    });

    $('#btnCancelarFactura').on('click', function () {
        ocultarFormulario();
    });

    $('#btnBuscarCliente').on('click', function () {
        modalClientes.show();
    });

    $('#btnBuscarProducto').on('click', function () {
        modalProductos.show();
    });

    $('#cedulaCliente').on('input blur', function () {
        buscarClientePorCedula();
    });

    $('#codigoProducto').on('input blur', function () {
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

    $('#tablaDetalle tbody').on('click', '.btn-eliminar-detalle', function () {
        eliminarDetalle(this);
    });

    $('#tablaDetalle tbody').on('click', '.btn-editar-detalle', function () {
        editarDetalle(this);
    });

    $('#tablaFacturas tbody').on('click', '.btn-eliminar-factura', function () {
        eliminarFactura(this);
    });

    $('#tablaFacturas tbody').on('click', '.btn-editar-factura', function () {
        editarFactura(this);
    });

    $('#tablaFacturas tbody').on('click', '.btn-pdf-factura', function () {
        generarFacturaPDF(this);
    });
});

// ---------- Carga de datos desde el backend (config/modelo/controlador) ----------

function cargarClientes() {
    return $.getJSON('controlador/ControladorCliente.php', { accion: 'listar' })
        .done(function (respuesta) {
            if (respuesta.exito) {
                listaClientes = respuesta.datos;
                tablaClientes.clear();
                listaClientes.forEach(function (c) {
                    tablaClientes.row.add([c.cedula, c.nombre, '']);
                });
                tablaClientes.draw(false);
            }
        })
        .fail(function () {
            Swal.fire({
                icon: 'error',
                title: 'Error de conexión',
                text: 'No se pudo cargar la lista de clientes. Verifique que el servidor PHP y la base de datos estén activos.'
            });
        });
}

function cargarProductos() {
    return $.getJSON('controlador/ControladorProducto.php', { accion: 'listar' })
        .done(function (respuesta) {
            if (respuesta.exito) {
                listaProductos = respuesta.datos;
                tablaProductos.clear();
                listaProductos.forEach(function (p) {
                    tablaProductos.row.add([p.codigo, p.nombre, p.precio, '']);
                });
                tablaProductos.draw(false);
            }
        })
        .fail(function () {
            Swal.fire({
                icon: 'error',
                title: 'Error de conexión',
                text: 'No se pudo cargar la lista de productos. Verifique que el servidor PHP y la base de datos estén activos.'
            });
        });
}

function cargarFacturas() {
    return $.getJSON('controlador/ControladorFactura.php', { accion: 'listar' })
        .done(function (respuesta) {
            if (respuesta.exito) {
                tablaFacturas.clear();
                respuesta.datos.forEach(function (f) {
                    tablaFacturas.row.add([
                        f.fecha,
                        f.cedula,
                        f.nombreCliente,
                        f.cantidadProductos,
                        '₡' + Number(f.total).toFixed(2),
                        '',
                        f.id
                    ]);
                });
                tablaFacturas.draw(false);
            }
        })
        .fail(function () {
            Swal.fire({
                icon: 'error',
                title: 'Error de conexión',
                text: 'No se pudo cargar la lista de facturas. Verifique que el servidor PHP y la base de datos estén activos.'
            });
        });
}

function mostrarFormularioAgregar() {
    idFacturaEditando = null;
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
    idFacturaEditando = null;
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
    const cliente = listaClientes.find(item => item.cedula === cedula);
    $('#nombreCliente').val(cliente ? cliente.nombre : '');
}

function buscarProductoPorCodigo() {
    const codigo = $('#codigoProducto').val().trim();
    const producto = listaProductos.find(item => item.codigo === codigo);

    if (producto) {
        $('#nombreProducto').val(producto.nombre);
        $('#precioProducto').val(producto.precio);
    } else {
        $('#nombreProducto').val('');
        $('#precioProducto').val('');
    }
}

function seleccionarCliente(boton) {
    const fila = tablaClientes.row($(boton).closest('tr'));
    const datos = fila.data();
    $('#cedulaCliente').val(datos[0]);
    $('#nombreCliente').val(datos[1]);
    modalClientes.hide();
    $('#cedulaCliente').focus();
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
        Swal.fire({
            icon: 'warning',
            title: 'Faltan datos',
            text: 'Debe seleccionar un producto válido.'
        });
        return;
    }

    if (isNaN(cantidadProducto) || cantidadProducto <= 0) {
        Swal.fire({
            icon: 'warning',
            title: 'Cantidad inválida',
            text: 'La cantidad debe ser mayor a cero.'
        });
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

function editarDetalle(boton) {
    const fila = tablaDetalle.row($(boton).closest('tr'));
    const datos = fila.data();

    $('#codigoProducto').val(datos[0]);
    $('#nombreProducto').val(datos[1]);
    $('#precioProducto').val(datos[2]);
    $('#cantidadProducto').val(datos[3]);

    fila.remove().draw(false);
    $('#codigoProducto').focus();

    calcularTotales();
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

// ---------- Guardado real contra el backend (modelo Factura -> tabla factura + detalle_factura) ----------

function guardarFactura() {
    const fecha = $('#fechaFactura').val().trim();
    const cedula = $('#cedulaCliente').val().trim();
    const nombre = $('#nombreCliente').val().trim();
    const cantidadProductos = tablaDetalle.rows().count();

    if (fecha === '' || cedula === '' || nombre === '') {
        Swal.fire({
            icon: 'warning',
            title: 'Falta encabezado',
            text: 'Debe completar la fecha y seleccionar un cliente.'
        });
        return;
    }

    if (cantidadProductos === 0) {
        Swal.fire({
            icon: 'warning',
            title: 'Falta detalle',
            text: 'Debe agregar al menos un producto.'
        });
        return;
    }

    // Armamos el detalle en el formato que espera modelo/Factura.php -> guardar()
    const detalle = [];
    tablaDetalle.rows().every(function () {
        const datos = this.data();
        detalle.push({
            codigo: datos[0],
            nombre: datos[1],
            precio: parseFloat(datos[2]),
            cantidad: parseInt(datos[3])
        });
    });

    // Si estamos editando, primero eliminamos la factura anterior
    // y luego insertamos la version actualizada (encabezado + detalle)
    const promesaPrevia = idFacturaEditando !== null
        ? $.post('controlador/ControladorFactura.php', { accion: 'eliminar', id: idFacturaEditando })
        : $.Deferred().resolve().promise();

    promesaPrevia.then(function () {
        return $.post('controlador/ControladorFactura.php', {
            accion: 'guardar',
            cedula: cedula,
            fecha: fecha,
            detalle: JSON.stringify(detalle)
        });
    }).done(function (respuesta) {
        if (respuesta.exito) {
            Swal.fire({
                icon: 'success',
                title: idFacturaEditando !== null ? 'Factura actualizada' : 'Factura guardada',
                text: `Se registró la factura de ${nombre}.`
            });
            ocultarFormulario();
            cargarFacturas();
        } else {
            Swal.fire({
                icon: 'error',
                title: 'No se pudo guardar',
                text: respuesta.mensaje || 'Ocurrió un error al guardar la factura.'
            });
        }
    }).fail(function () {
        Swal.fire({
            icon: 'error',
            title: 'Error de conexión',
            text: 'No se pudo comunicar con el servidor para guardar la factura.'
        });
    });
}

function editarFactura(boton) {
    const id = $(boton).data('id');

    $.getJSON('controlador/ControladorFactura.php', { accion: 'detalle', id: id })
        .done(function (respuesta) {
            if (!respuesta.exito) {
                Swal.fire({ icon: 'error', title: 'No encontrada', text: respuesta.mensaje });
                return;
            }

            idFacturaEditando = respuesta.encabezado.id;
            limpiarFormularioFactura();

            $('#fechaFactura').val(respuesta.encabezado.fecha);
            $('#cedulaCliente').val(respuesta.encabezado.cedula);
            $('#nombreCliente').val(respuesta.encabezado.nombreCliente);

            tablaDetalle.clear();
            respuesta.detalle.forEach(function (linea) {
                tablaDetalle.row.add([
                    linea.codigo,
                    linea.nombre,
                    linea.precio.toFixed(2),
                    linea.cantidad,
                    linea.subtotal.toFixed(2),
                    ''
                ]);
            });
            tablaDetalle.draw(false);
            calcularTotales();

            $('#tituloFormulario').text('Editar factura');
            $('#panelTabla').hide();
            $('#panelFormulario').show();
            $('#btnMostrarFormulario').hide();
            $('#cedulaCliente').focus();
        })
        .fail(function () {
            Swal.fire({
                icon: 'error',
                title: 'Error de conexión',
                text: 'No se pudo cargar la factura para editarla.'
            });
        });
}

function eliminarFactura(boton) {
    const id = $(boton).data('id');

    Swal.fire({
        title: '¿Desea eliminar la factura?',
        text: 'Esta acción no se puede deshacer.',
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'No'
    }).then((result) => {
        if (result.isConfirmed) {
            $.post('controlador/ControladorFactura.php', { accion: 'eliminar', id: id })
                .done(function (respuesta) {
                    if (respuesta.exito) {
                        Swal.fire({
                            icon: 'success',
                            title: 'Eliminada',
                            text: 'La factura fue eliminada correctamente.'
                        });
                        cargarFacturas();
                    } else {
                        Swal.fire({
                            icon: 'error',
                            title: 'No se pudo eliminar',
                            text: respuesta.mensaje || 'Ocurrió un error al eliminar la factura.'
                        });
                    }
                })
                .fail(function () {
                    Swal.fire({
                        icon: 'error',
                        title: 'Error de conexión',
                        text: 'No se pudo comunicar con el servidor para eliminar la factura.'
                    });
                });
        }
    });
}

// Abre en una pestaña nueva el PDF generado por vista/rptfactura.php (FPDF)
function generarFacturaPDF(boton) {
    const id = $(boton).data('id');
    window.open('vista/rptfactura.php?id=' + id, '_blank');
}
