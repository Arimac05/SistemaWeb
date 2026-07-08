let tabla;
let tablaCategorias;
let filaEditando = null;
let modalCategorias;

const listaCategorias = [
    { id: '1', nombre: 'Camarón' },
    { id: '2', nombre: 'Alimento' },
    { id: '3', nombre: 'Insumo' }
];

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
        modalCategorias.show();
    });

    $('#idCategoria').on('input blur', function () {
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

function mostrarFormularioAgregar() {
    filaEditando = null;
    limpiarFormulario();
    $('#tituloFormulario').text('Nuevo producto');

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
        Swal.fire({
            icon: 'warning',
            title: 'Faltan datos',
            text: 'Debe completar todos los campos, incluyendo la categoría.'
        });
        return;
    }

    if (filaEditando !== null) {
        filaEditando.data([
            codigo,
            nombre,
            descripcion,
            precio,
            stock,
            nombreCategoria,
            ''
        ]).draw(false);

        Swal.fire({
            icon: 'success',
            title: 'Producto actualizado',
            text: 'Los datos se guardaron correctamente.'
        });
    } else {
        tabla.row.add([
            codigo,
            nombre,
            descripcion,
            precio,
            stock,
            nombreCategoria,
            ''
        ]).draw(false);

        Swal.fire({
            icon: 'success',
            title: 'Producto agregado',
            text: 'El producto se insertó correctamente.'
        });
    }

    ocultarFormulario();
}

function editarFila(boton) {
    const fila = tabla.row($(boton).closest('tr'));
    const datos = fila.data();

    filaEditando = fila;

    $('#codigo').val(datos[0]);
    $('#nombre').val(datos[1]);
    $('#descripcion').val(datos[2]);
    $('#precio').val(datos[3]);
    $('#stock').val(datos[4]);
    $('#nombreCategoria').val(datos[5]);

    // Busca el id de categoría correspondiente al nombre guardado en la fila
    const categoria = listaCategorias.find(item => item.nombre === datos[5]);
    $('#idCategoria').val(categoria ? categoria.id : '');

    $('#tituloFormulario').text('Editar producto');
    $('#panelTabla').hide();
    $('#panelFormulario').show();

    $('#btnMostrarFormulario').hide();

    $('#codigo').focus();
}

function eliminarFila(boton) {
    const fila = tabla.row($(boton).closest('tr'));

    Swal.fire({
        title: '¿Desea eliminar el producto?',
        text: 'Esta acción no se puede deshacer.',
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'No'
    }).then((result) => {
        if (result.isConfirmed) {
            fila.remove().draw(false);

            Swal.fire({
                icon: 'success',
                title: 'Eliminado',
                text: 'El producto fue eliminado correctamente.'
            });
        }
    });
}

function buscarCategoriaPorCodigo() {
    const idCategoria = $('#idCategoria').val().trim();
    const categoria = listaCategorias.find(item => item.id === idCategoria);

    if (categoria) {
        $('#nombreCategoria').val(categoria.nombre);
    } else {
        $('#nombreCategoria').val('');
    }
}

function seleccionarCategoriaDesdeModal(boton) {
    const fila = tablaCategorias.row($(boton).closest('tr'));
    const datos = fila.data();

    $('#idCategoria').val(datos[0]);
    $('#nombreCategoria').val(datos[1]);

    modalCategorias.hide();
    $('#idCategoria').focus();
}
