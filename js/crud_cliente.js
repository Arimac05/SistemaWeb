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
    $('#tituloFormulario').text('Nuevo cliente');

    $('#panelTabla').hide();
    $('#panelFormulario').show();

    $('#btnMostrarFormulario').hide();

    $('#cedula').focus();
}

function ocultarFormulario() {
    limpiarFormulario();
    filaEditando = null;

    $('#panelFormulario').hide();
    $('#panelTabla').show();

    $('#btnMostrarFormulario').show();
}

function limpiarFormulario() {
    $('#cedula').val('');
    $('#nombre').val('');
    $('#apellido').val('');
    $('#telefono').val('');
    $('#email').val('');
    $('#direccion').val('');
}

function guardarRegistro() {
    const cedula = $('#cedula').val().trim();
    const nombre = $('#nombre').val().trim();
    const apellido = $('#apellido').val().trim();
    const telefono = $('#telefono').val().trim();
    const email = $('#email').val().trim();
    const direccion = $('#direccion').val().trim();

    if (cedula === '' || nombre === '' || apellido === '' || telefono === '' || email === '' || direccion === '') {
        Swal.fire({
            icon: 'warning',
            title: 'Faltan datos',
            text: 'Debe completar todos los campos.'
        });
        return;
    }

    if (!/^\d+$/.test(cedula)) {
        Swal.fire({
            icon: 'warning',
            title: 'Cédula inválida',
            text: 'La cédula debe contener solo números.'
        });
        return;
    }

    if (filaEditando !== null) {
        filaEditando.data([
            cedula,
            nombre,
            apellido,
            telefono,
            email,
            direccion,
            ''
        ]).draw(false);

        Swal.fire({
            icon: 'success',
            title: 'Cliente actualizado',
            text: 'Los datos se guardaron correctamente.'
        });
    } else {
        tabla.row.add([
            cedula,
            nombre,
            apellido,
            telefono,
            email,
            direccion,
            ''
        ]).draw(false);

        Swal.fire({
            icon: 'success',
            title: 'Cliente agregado',
            text: 'El cliente se insertó correctamente.'
        });
    }

    ocultarFormulario();
}

function editarFila(boton) {
    const fila = tabla.row($(boton).closest('tr'));
    const datos = fila.data();

    filaEditando = fila;

    $('#cedula').val(datos[0]);
    $('#nombre').val(datos[1]);
    $('#apellido').val(datos[2]);
    $('#telefono').val(datos[3]);
    $('#email').val(datos[4]);
    $('#direccion').val(datos[5]);

    $('#tituloFormulario').text('Editar cliente');
    $('#panelTabla').hide();
    $('#panelFormulario').show();

    $('#btnMostrarFormulario').hide();

    $('#cedula').focus();
}

function eliminarFila(boton) {
    const fila = tabla.row($(boton).closest('tr'));

    Swal.fire({
        title: '¿Desea eliminar el cliente?',
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
                text: 'El cliente fue eliminado correctamente.'
            });
        }
    });
}
