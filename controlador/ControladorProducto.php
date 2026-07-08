<?php
header('Content-Type: application/json; charset=utf-8');

require_once __DIR__ . "/../modelo/Producto.php";

$Producto = new Producto();
$accion = $_REQUEST['accion'] ?? '';

switch ($accion)
{
    // Devuelve todos los productos, usado para llenar el modal de busqueda
    case 'listar':
        $rspta = $Producto->listar();
        $productos = array();

        while ($fila = $rspta->fetch_object())
        {
            $productos[] = array(
                'codigo' => $fila->codigo,
                'nombre' => $fila->nombre,
                'precio' => (float)$fila->precio
            );
        }

        echo json_encode(array('exito' => true, 'datos' => $productos));
        break;

    // Busca un producto puntual por codigo, usado en el autocompletado
    case 'buscar':
        $codigo = $_GET['codigo'] ?? '';
        $rspta = $Producto->buscar($codigo);

        if ($rspta && $rspta->num_rows > 0)
        {
            $fila = $rspta->fetch_object();
            echo json_encode(array(
                'exito' => true,
                'datos' => array('codigo' => $fila->codigo, 'nombre' => $fila->nombre, 'precio' => (float)$fila->precio)
            ));
        }
        else
        {
            echo json_encode(array('exito' => false, 'mensaje' => 'Producto no encontrado.'));
        }
        break;

    default:
        echo json_encode(array('exito' => false, 'mensaje' => 'Accion no reconocida.'));
        break;
}
?>
