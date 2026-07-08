let tabla;
let filaEditando = null;

$(document).ready(function () {

    tabla = $('#tabla').DataTable({
        responsive: true,
        autoWidth: false,
        pageLength: 10,
        language: {
            url: "datatable/es-ES.json"
        },
        columnDefs: [
            {
                targets: 3,
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

    $('#btnMostrarFormulario').on('click', function () {
        mostrarFormularioAgregar();
    });

    $('#btnCancelar').on('click', function () {
        ocultarFormulario();
    });

    $('#btnGuardar').on('click', function () {
        guardarRegistro();
    });

    $('#tabla tbody').on('click', '.btn-editar', function () {
        editarFila(this);
    });

    $('#tabla tbody').on('click', '.btn-eliminar', function () {
        eliminarFila(this);
    });
});

function mostrarFormularioAgregar() {
    filaEditando = null;
    limpiarFormulario();
    $('#tituloFormulario').text('Nueva categoría');

    $('#panelTabla').hide();
    $('#panelFormulario').show();

    $('#btnMostrarFormulario').hide();

    $('#id').focus();
}

function ocultarFormulario() {
    limpiarFormulario();
    filaEditando = null;

    $('#panelFormulario').hide();
    $('#panelTabla').show();

    $('#btnMostrarFormulario').show();
}

function limpiarFormulario() {
    $('#id').val('');
    $('#nombre').val('');
    $('#descripcion').val('');
}

function guardarRegistro() {
    const id = $('#id').val().trim();
    const nombre = $('#nombre').val().trim();
    const descripcion = $('#descripcion').val().trim();

    if (id === '' || nombre === '' || descripcion === '') {
        Swal.fire({
            icon: 'warning',
            title: 'Faltan datos',
            text: 'Debe completar todos los campos.'
        });
        return;
    }

    if (filaEditando !== null) {
        filaEditando.data([
            id,
            nombre,
            descripcion,
            ''
        ]).draw(false);

        Swal.fire({
            icon: 'success',
            title: 'Categoría actualizada',
            text: 'Los datos se guardaron correctamente.'
        });
    } else {
        tabla.row.add([
            id,
            nombre,
            descripcion,
            ''
        ]).draw(false);

        Swal.fire({
            icon: 'success',
            title: 'Categoría agregada',
            text: 'La categoría se insertó correctamente.'
        });
    }

    ocultarFormulario();
}

function editarFila(boton) {
    const fila = tabla.row($(boton).closest('tr'));
    const datos = fila.data();

    filaEditando = fila;

    $('#id').val(datos[0]);
    $('#nombre').val(datos[1]);
    $('#descripcion').val(datos[2]);

    $('#tituloFormulario').text('Editar categoría');
    $('#panelTabla').hide();
    $('#panelFormulario').show();

    $('#btnMostrarFormulario').hide();

    $('#id').focus();
}

function eliminarFila(boton) {
    const fila = tabla.row($(boton).closest('tr'));

    Swal.fire({
        title: '¿Desea eliminar la categoría?',
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
                title: 'Eliminada',
                text: 'La categoría fue eliminada correctamente.'
            });
        }
    });
}
