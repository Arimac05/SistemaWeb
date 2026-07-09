<?php
// Incluimos el modelo de Producto
require_once __DIR__ . "/../modelo/Producto.php";

header("Content-Type: application/json; charset=UTF-8");

$Producto = new Producto();

// Leemos el cuerpo de la peticion en formato JSON
$datos = json_decode(file_get_contents("php://input"), true);

$codigo      = isset($datos["codigo"]) ? $datos["codigo"] : "";
$nombre      = isset($datos["nombre"]) ? $datos["nombre"] : "";
$descripcion = isset($datos["descripcion"]) ? $datos["descripcion"] : "";
$precio      = isset($datos["precio"]) ? floatval($datos["precio"]) : 0;
$stock       = isset($datos["stock"]) ? intval($datos["stock"]) : 0;
$idCategoria = isset($datos["idCategoria"]) ? intval($datos["idCategoria"]) : 0;

switch ($_GET["op"]) {

    // Devuelve la lista completa de productos (con el nombre de su categoria)
    case 'listar':
        $rspta = $Producto->listar();
        $lista = array();

        while ($fila = $rspta->fetch_assoc()) {
            $lista[] = $fila;
        }

        echo json_encode([
            "exito" => true,
            "datos" => $lista
        ]);
        break;

    // Busca un producto por codigo (se usa en el autocompletado de Factura)
    case 'buscar':
        $codigo = isset($_GET["codigo"]) ? $_GET["codigo"] : "";
        $rspta = $Producto->buscar($codigo);
        $fila = $rspta->fetch_assoc();

        echo json_encode([
            "exito" => $fila ? true : false,
            "datos" => $fila
        ]);
        break;

    // Inserta un nuevo producto
    case 'insertar':
        $respuesta = $Producto->insertar($codigo, $nombre, $descripcion, $precio, $stock, $idCategoria);
        echo json_encode([
            "exito"   => $respuesta ? true : false,
            "mensaje" => $respuesta ? "Producto registrado" : "Producto no se pudo registrar"
        ]);
        break;

    // Actualiza un producto existente
    case 'editar':
        $respuesta = $Producto->actualizar($codigo, $nombre, $descripcion, $precio, $stock, $idCategoria);
        echo json_encode([
            "exito"   => $respuesta ? true : false,
            "mensaje" => $respuesta ? "Producto actualizado" : "Producto no se pudo actualizar"
        ]);
        break;

    // Elimina un producto
    case 'eliminar':
        $respuesta = $Producto->eliminar($codigo);
        echo json_encode([
            "exito"   => $respuesta ? true : false,
            "mensaje" => $respuesta ? "Producto eliminado" : "Producto no se pudo eliminar (verifique que no tenga facturas asociadas)"
        ]);
        break;

    default:
        echo json_encode(["exito" => false, "mensaje" => "Operacion no valida"]);
}
?>
