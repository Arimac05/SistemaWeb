<?php
// Incluimos el modelo de Factura
require_once __DIR__ . "/../modelo/Factura.php";

header("Content-Type: application/json; charset=UTF-8");

$Factura = new Factura();

// Leemos el cuerpo de la peticion en formato JSON
$datos = json_decode(file_get_contents("php://input"), true);

switch ($_GET["op"]) {

    // Devuelve la lista de facturas (encabezados)
    case 'listar':
        $rspta = $Factura->listar();
        $lista = array();

        while ($fila = $rspta->fetch_assoc()) {
            $lista[] = $fila;
        }

        echo json_encode([
            "exito" => true,
            "datos" => $lista
        ]);
        break;

    // Guarda una factura completa: encabezado + detalle
    // El detalle llega dentro del JSON como un arreglo de productos
    case 'guardar':
        $fecha   = isset($datos["fecha"]) ? $datos["fecha"] : "";
        $cedula  = isset($datos["cedula"]) ? $datos["cedula"] : "";
        $detalle = isset($datos["detalle"]) ? $datos["detalle"] : array();

        // Calculamos los totales en el servidor (no confiamos solo en el front)
        $subtotal = 0;
        foreach ($detalle as $linea) {
            $subtotal += floatval($linea["precioUnitario"]) * intval($linea["cantidad"]);
        }
        $iva = $subtotal * 0.13;
        $total = $subtotal + $iva;

        // Insertamos primero el encabezado y obtenemos el id generado
        $idFactura = $Factura->insertarEncabezado($fecha, $cedula, $subtotal, $iva, $total);

        // Insertamos cada linea del detalle asociada al id de la factura
        foreach ($detalle as $linea) {
            $codigoProducto = $linea["codigo"];
            $cantidad = intval($linea["cantidad"]);
            $precioUnitario = floatval($linea["precioUnitario"]);
            $subtotalLinea = $precioUnitario * $cantidad;

            $Factura->insertarDetalle($idFactura, $codigoProducto, $cantidad, $precioUnitario, $subtotalLinea);
        }

        echo json_encode([
            "exito"   => true,
            "mensaje" => "Factura registrada",
            "id"      => $idFactura
        ]);
        break;

    // Elimina una factura (el detalle se borra en cascada)
    case 'eliminar':
        $id = isset($datos["id"]) ? intval($datos["id"]) : 0;
        $respuesta = $Factura->eliminar($id);

        echo json_encode([
            "exito"   => $respuesta ? true : false,
            "mensaje" => $respuesta ? "Factura eliminada" : "Factura no se pudo eliminar"
        ]);
        break;

    default:
        echo json_encode(["exito" => false, "mensaje" => "Operacion no valida"]);
}
?>
