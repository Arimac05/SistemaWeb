let tabla;
let tablaCategorias;
let filaEditando = null;
let modalCategorias;

const URL_PRODUCTO = '../controlador/ControladorProducto.php';
const URL_CATEGORIA = '../controlador/ControladorCategoria.php';

$(document).ready(function () {

    modalCategorias = new bootstrap.Modal(document.getElementById('modalCategorias'));

    tabla = $('#tabla').DataTable({
        responsive: true,
        autoWidth: false,
        pageLength: 10,
        language: {
            url: "datatable/es-ES.json"
        },
        columnDefs: [
            {
                targets: 6,
                orderable: false,
                searchable: false,
                className: 'text-center acciones-btns',
                render: function () {
                    return "<button type='button' class='btn btn-sm btn-warning btn-editar'>Editar</button> " +
                        "<button type='button' class='btn btn-sm btn-danger btn-eliminar'>Eliminar</button>";
                }
            }
        ]
    });

    tablaCategorias = $('#tablaCategorias').DataTable({
        responsive: true,
        autoWidth: false,
        pageLength: 5,
        language: {
            url: "datatable/es-ES.json"
        },
        columnDefs: [
            {
                targets: 2,
                orderable: false,
                searchable: false,
                className: 'text-center',
                render: function () {
                    return "<button type='button' class='btn btn-sm btn-primary btn-seleccionar-categoria'>Seleccionar</button>";
                }
            }
        ]
    });

    cargarTabla();

    $('#btnMostrarFormulario').on('click', function () {
        mostrarFormularioAgregar();
    });

    $('#btnCancelar').on('click', function () {
        ocultarFormulario();
    });

    $('#btnGuardar').on('click', function () {
        guardarRegistro();
    });

    $('#btnBuscarCategoria').on('click', function () {
        cargarTablaCategorias();
        modalCategorias.show();
    });

    $('#idCategoria').on('blur', function () {
        buscarCategoriaPorCodigo();
    });

    $('#tabla tbody').on('click', '.btn-editar', function () {
        editarFila(this);
    });

    $('#tabla tbody').on('click', '.btn-eliminar', function () {
        eliminarFila(this);
    });

    $('#tablaCategorias tbody').on('click', '.btn-seleccionar-categoria', function () {
        seleccionarCategoriaDesdeModal(this);
    });
});

// Trae la lista de productos (con nombre de categoria) desde el servidor
function cargarTabla() {
    $.ajax({
        type: "GET",
        url: URL_PRODUCTO + "?op=listar",
        dataType: "json",
        success: function (respuesta) {
            tabla.clear();

            respuesta["datos"].forEach(function (p) {
                tabla.row.add([
                    p.codigo,
                    p.nombre,
                    p.descripcion,
                    p.precio,
                    p.stock,
                    p.nombre_categoria,
                    ''
                ]);
            });

            tabla.draw();
        }
    });
}

// Trae la lista de categorias para el modal de busqueda
function cargarTablaCategorias() {
    $.ajax({
        type: "GET",
        url: URL_CATEGORIA + "?op=listar",
        dataType: "json",
        success: function (respuesta) {
            tablaCategorias.clear();

            respuesta["datos"].forEach(function (cat) {
                tablaCategorias.row.add([
                    cat.id,
                    cat.nombre,
                    ''
                ]);
            });

            tablaCategorias.draw();
        }
    });
}

function mostrarFormularioAgregar() {
    filaEditando = null;
    limpiarFormulario();
    $('#tituloFormulario').text('Nuevo producto');
    $('#codigo').prop('disabled', false);

    $('#panelTabla').hide();
    $('#panelFormulario').show();

    $('#btnMostrarFormulario').hide();

    $('#codigo').focus();
}

function ocultarFormulario() {
    limpiarFormulario();
    filaEditando = null;

    $('#panelFormulario').hide();
    $('#panelTabla').show();

    $('#btnMostrarFormulario').show();
}

function limpiarFormulario() {
    $('#codigo').val('');
    $('#nombre').val('');
    $('#descripcion').val('');
    $('#precio').val('');
    $('#stock').val('');
    $('#idCategoria').val('');
    $('#nombreCategoria').val('');
}

function guardarRegistro() {
    const codigo = $('#codigo').val().trim();
    const nombre = $('#nombre').val().trim();
    const descripcion = $('#descripcion').val().trim();
    const precio = $('#precio').val().trim();
    const stock = $('#stock').val().trim();
    const idCategoria = $('#idCategoria').val().trim();
    const nombreCategoria = $('#nombreCategoria').val().trim();

    if (codigo === '' || nombre === '' || descripcion === '' || precio === '' || stock === '' ||
        idCategoria === '' || nombreCategoria === '') {
        alert('Debe completar todos los campos, incluyendo la categoria.');
        return;
    }

    if (isNaN(precio) || parseFloat(precio) < 0) {
        alert('El precio debe ser un numero valido.');
        return;
    }

    if (isNaN(stock) || parseInt(stock) < 0) {
        alert('El stock debe ser un numero valido.');
        return;
    }

    const esEdicion = filaEditando !== null;
    const datos = {
        codigo: codigo,
        nombre: nombre,
        descripcion: descripcion,
        precio: precio,
        stock: stock,
        idCategoria: idCategoria
    };

    $.ajax({
        type: "POST",
        url: URL_PRODUCTO + "?op=" + (esEdicion ? 'editar' : 'insertar'),
        data: JSON.stringify(datos),
        contentType: "application/json; charset=UTF-8",
        dataType: "json",
        success: function (respuesta) {
            alert(respuesta["mensaje"]);

            if (respuesta["exito"]) {
                cargarTabla();
                ocultarFormulario();
            }
        }
    });
}

function editarFila(boton) {
    const fila = tabla.row($(boton).closest('tr'));
    const datos = fila.data();

    filaEditando = fila;

    $('#codigo').val(datos[0]).prop('disabled', true);
    $('#nombre').val(datos[1]);
    $('#descripcion').val(datos[2]);
    $('#precio').val(datos[3]);
    $('#stock').val(datos[4]);
    $('#nombreCategoria').val(datos[5]);
    $('#idCategoria').val('');

    // Buscamos el id de la categoria correspondiente al nombre mostrado en la fila
    $.ajax({
        type: "GET",
        url: URL_CATEGORIA + "?op=listar",
        dataType: "json",
        success: function (respuesta) {
            const categoria = respuesta["datos"].find(c => c.nombre === datos[5]);
            if (categoria) {
                $('#idCategoria').val(categoria.id);
            }
        }
    });

    $('#tituloFormulario').text('Editar producto');
    $('#panelTabla').hide();
    $('#panelFormulario').show();

    $('#btnMostrarFormulario').hide();

    $('#nombre').focus();
}

function eliminarFila(boton) {
    const fila = tabla.row($(boton).closest('tr'));
    const codigo = fila.data()[0];

    if (!confirm('¿Desea eliminar el producto? Esta accion no se puede deshacer.')) {
        return;
    }

    $.ajax({
        type: "POST",
        url: URL_PRODUCTO + "?op=eliminar",
        data: JSON.stringify({ codigo: codigo }),
        contentType: "application/json; charset=UTF-8",
        dataType: "json",
        success: function (respuesta) {
            alert(respuesta["mensaje"]);

            if (respuesta["exito"]) {
                cargarTabla();
            }
        }
    });
}

function buscarCategoriaPorCodigo() {
    const idCategoria = $('#idCategoria').val().trim();

    if (idCategoria === '') {
        $('#nombreCategoria').val('');
        return;
    }

    $.ajax({
        type: "GET",
        url: URL_CATEGORIA + "?op=buscar&id=" + encodeURIComponent(idCategoria),
        dataType: "json",
        success: function (respuesta) {
            if (respuesta["exito"]) {
                $('#nombreCategoria').val(respuesta["datos"].nombre);
            } else {
                $('#nombreCategoria').val('');
                alert('No existe una categoria con ese ID.');
            }
        }
    });
}

function seleccionarCategoriaDesdeModal(boton) {
    const fila = tablaCategorias.row($(boton).closest('tr'));
    const datos = fila.data();

    $('#idCategoria').val(datos[0]);
    $('#nombreCategoria').val(datos[1]);

    modalCategorias.hide();
    $('#idCategoria').focus();
}
