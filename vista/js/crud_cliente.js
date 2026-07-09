let tabla;
let filaEditando = null;

// Ruta del controlador que atiende las peticiones de este modulo
const URL_CONTROLADOR = '../controlador/ControladorCliente.php';

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

    $('#tabla tbody').on('click', '.btn-editar', function () {
        editarFila(this);
    });

    $('#tabla tbody').on('click', '.btn-eliminar', function () {
        eliminarFila(this);
    });
});

// Trae la lista de clientes desde el servidor y llena la tabla
function cargarTabla() {
    $.ajax({
        type: "GET",
        url: URL_CONTROLADOR + "?op=listar",
        dataType: "json",
        success: function (respuesta) {
            tabla.clear();

            respuesta["datos"].forEach(function (c) {
                tabla.row.add([
                    c.cedula,
                    c.nombre,
                    c.apellido,
                    c.telefono,
                    c.email,
                    c.direccion,
                    ''
                ]);
            });

            tabla.draw();
        }
    });
}

function mostrarFormularioAgregar() {
    filaEditando = null;
    limpiarFormulario();
    $('#tituloFormulario').text('Nuevo cliente');
    $('#cedula').prop('disabled', false);

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
        alert('Debe completar todos los campos.');
        return;
    }

    if (!/^\d+$/.test(cedula)) {
        alert('La cedula debe contener solo numeros.');
        return;
    }

    if (!/^\d+$/.test(telefono)) {
        alert('El telefono debe contener solo numeros.');
        return;
    }

    const esEdicion = filaEditando !== null;
    const datos = {
        cedula: cedula,
        nombre: nombre,
        apellido: apellido,
        telefono: telefono,
        email: email,
        direccion: direccion
    };

    $.ajax({
        type: "POST",
        url: URL_CONTROLADOR + "?op=" + (esEdicion ? 'editar' : 'insertar'),
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

    $('#cedula').val(datos[0]).prop('disabled', true);
    $('#nombre').val(datos[1]);
    $('#apellido').val(datos[2]);
    $('#telefono').val(datos[3]);
    $('#email').val(datos[4]);
    $('#direccion').val(datos[5]);

    $('#tituloFormulario').text('Editar cliente');
    $('#panelTabla').hide();
    $('#panelFormulario').show();

    $('#btnMostrarFormulario').hide();

    $('#nombre').focus();
}

function eliminarFila(boton) {
    const fila = tabla.row($(boton).closest('tr'));
    const cedula = fila.data()[0];

    if (!confirm('¿Desea eliminar el cliente? Esta accion no se puede deshacer.')) {
        return;
    }

    $.ajax({
        type: "POST",
        url: URL_CONTROLADOR + "?op=eliminar",
        data: JSON.stringify({ cedula: cedula }),
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
