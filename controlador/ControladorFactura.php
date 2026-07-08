<?php
// Este controlador recibe peticiones AJAX desde js/factura.js
// y las traduce en llamadas al modelo Factura.
// Siempre responde en formato JSON.

header('Content-Type: application/json; charset=utf-8');

require_once __DIR__ . "/../modelo/Factura.php";

$Factura = new Factura();

// La accion a ejecutar llega por GET o POST (accion=guardar|listar|eliminar)
$accion = $_REQUEST['accion'] ?? '';

switch ($accion)
{
    // Devuelve el listado de facturas (encabezado) en formato JSON
    // para llenar la tabla principal (tablaFacturas)
    case 'listar':
        $rspta = $Factura->listar();
        $facturas = array();

        while ($fila = $rspta->fetch_object())
        {
            $facturas[] = array(
                'id' => $fila->id,
                'fecha' => date('d/m/Y', strtotime($fila->fecha)),
                'cedula' => $fila->cedula_cliente,
                'nombreCliente' => $fila->nombreCliente,
                'cantidadProductos' => (int)$fila->cantidadProductos,
                'total' => (float)$fila->total
            );
        }

        echo json_encode(array('exito' => true, 'datos' => $facturas));
        break;

    // Guarda una nueva factura (encabezado + detalle) y devuelve el id creado
    case 'guardar':
        $cedula = $_POST['cedula'] ?? '';
        $fecha = $_POST['fecha'] ?? '';
        $detalleJson = $_POST['detalle'] ?? '[]';
        $detalle = json_decode($detalleJson, true);

        if ($cedula === '' || $fecha === '' || empty($detalle))
        {
            echo json_encode(array('exito' => false, 'mensaje' => 'Datos incompletos para guardar la factura.'));
            break;
        }

        $idFactura = $Factura->guardar($cedula, $fecha, $detalle);

        if ($idFactura !== false)
        {
            echo json_encode(array('exito' => true, 'id' => $idFactura));
        }
        else
        {
            echo json_encode(array('exito' => false, 'mensaje' => 'No se pudo guardar la factura.'));
        }
        break;

    // Devuelve el encabezado y el detalle de una factura puntual,
    // usado para volver a cargar el formulario al editar
    case 'detalle':
        $id = $_GET['id'] ?? 0;
        $rsptaEnc = $Factura->buscarEncabezado($id);

        if (!$rsptaEnc || $rsptaEnc->num_rows === 0)
        {
            echo json_encode(array('exito' => false, 'mensaje' => 'Factura no encontrada.'));
            break;
        }

        $enc = $rsptaEnc->fetch_object();
        $rsptaDet = $Factura->buscarDetalle($id);
        $detalle = array();

        while ($fila = $rsptaDet->fetch_object())
        {
            $detalle[] = array(
                'codigo' => $fila->codigo_producto,
                'nombre' => $fila->nombre_producto,
                'precio' => (float)$fila->precio_unitario,
                'cantidad' => (int)$fila->cantidad,
                'subtotal' => (float)$fila->subtotal
            );
        }

        echo json_encode(array(
            'exito' => true,
            'encabezado' => array(
                'id' => $enc->id,
                'fecha' => $enc->fecha,
                'cedula' => $enc->cedula_cliente,
                'nombreCliente' => $enc->nombreCliente
            ),
            'detalle' => $detalle
        ));
        break;

    // Elimina una factura existente por id
    case 'eliminar':
        $id = $_POST['id'] ?? 0;

        if ((int)$id <= 0)
        {
            echo json_encode(array('exito' => false, 'mensaje' => 'Id de factura invalido.'));
            break;
        }

        $resultado = $Factura->eliminar($id);
        echo json_encode(array('exito' => (bool)$resultado));
        break;

    default:
        echo json_encode(array('exito' => false, 'mensaje' => 'Accion no reconocida.'));
        break;
}
?>
