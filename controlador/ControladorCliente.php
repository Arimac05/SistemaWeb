<?php
header('Content-Type: application/json; charset=utf-8');

require_once __DIR__ . "/../modelo/Cliente.php";

$Cliente = new Cliente();
$accion = $_REQUEST['accion'] ?? '';

switch ($accion)
{
    // Devuelve todos los clientes, usado para llenar el modal de busqueda
    case 'listar':
        $rspta = $Cliente->listar();
        $clientes = array();

        while ($fila = $rspta->fetch_object())
        {
            $clientes[] = array(
                'cedula' => $fila->cedula,
                'nombre' => $fila->nombre,
                'telefono' => $fila->telefono
            );
        }

        echo json_encode(array('exito' => true, 'datos' => $clientes));
        break;

    // Busca un cliente puntual por cedula, usado en el autocompletado
    case 'buscar':
        $cedula = $_GET['cedula'] ?? '';
        $rspta = $Cliente->buscar($cedula);

        if ($rspta && $rspta->num_rows > 0)
        {
            $fila = $rspta->fetch_object();
            echo json_encode(array(
                'exito' => true,
                'datos' => array('cedula' => $fila->cedula, 'nombre' => $fila->nombre, 'telefono' => $fila->telefono)
            ));
        }
        else
        {
            echo json_encode(array('exito' => false, 'mensaje' => 'Cliente no encontrado.'));
        }
        break;

    default:
        echo json_encode(array('exito' => false, 'mensaje' => 'Accion no reconocida.'));
        break;
}
?>
