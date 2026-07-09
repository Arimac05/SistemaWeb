let tabla;
let filaEditando = null;

const URL_CONTROLADOR = '../controlador/ControladorCategoria.php';

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

function cargarTabla() {
    $.ajax({
        type: "GET",
        url: URL_CONTROLADOR + "?op=listar",
        dataType: "json",
        success: function (respuesta) {
            tabla.clear();

            respuesta["datos"].forEach(function (cat) {
                tabla.row.add([
                    cat.id,
                    cat.nombre,
                    cat.descripcion,
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
    $('#tituloFormulario').text('Nueva categoria');

    $('#panelTabla').hide();
    $('#panelFormulario').show();

    $('#btnMostrarFormulario').hide();

    $('#nombre').focus();
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
    const nombre = $('#nombre').val().trim();
    const descripcion = $('#descripcion').val().trim();

    if (nombre === '' || descripcion === '') {
        alert('Debe completar todos los campos.');
        return;
    }

    const esEdicion = filaEditando !== null;
    const datos = {
        nombre: nombre,
        descripcion: descripcion
    };

    if (esEdicion) {
        datos.id = $('#id').val();
    }

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

    $('#id').val(datos[0]);
    $('#nombre').val(datos[1]);
    $('#descripcion').val(datos[2]);

    $('#tituloFormulario').text('Editar categoria');
    $('#panelTabla').hide();
    $('#panelFormulario').show();

    $('#btnMostrarFormulario').hide();

    $('#nombre').focus();
}

function eliminarFila(boton) {
    const fila = tabla.row($(boton).closest('tr'));
    const id = fila.data()[0];

    if (!confirm('¿Desea eliminar la categoria? Esta accion no se puede deshacer.')) {
        return;
    }

    $.ajax({
        type: "POST",
        url: URL_CONTROLADOR + "?op=eliminar",
        data: JSON.stringify({ id: id }),
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
