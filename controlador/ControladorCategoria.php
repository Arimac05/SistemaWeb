<?php
// Incluimos el modelo de Categoria
require_once __DIR__ . "/../modelo/Categoria.php";

header("Content-Type: application/json; charset=UTF-8");

$Categoria = new Categoria();

// Leemos el cuerpo de la peticion en formato JSON
$datos = json_decode(file_get_contents("php://input"), true);

$id          = isset($datos["id"]) ? $datos["id"] : "";
$nombre      = isset($datos["nombre"]) ? $datos["nombre"] : "";
$descripcion = isset($datos["descripcion"]) ? $datos["descripcion"] : "";

switch ($_GET["op"]) {

    // Devuelve la lista completa de categorias
    case 'listar':
        $rspta = $Categoria->listar();
        $lista = array();

        while ($fila = $rspta->fetch_assoc()) {
            $lista[] = $fila;
        }

        echo json_encode([
            "exito" => true,
            "datos" => $lista
        ]);
        break;

    // Busca una categoria por id (se usa en el autocompletado de Producto)
    case 'buscar':
        $id = isset($_GET["id"]) ? intval($_GET["id"]) : 0;
        $rspta = $Categoria->buscar($id);
        $fila = $rspta->fetch_assoc();

        echo json_encode([
            "exito" => $fila ? true : false,
            "datos" => $fila
        ]);
        break;

    // Inserta una nueva categoria
    case 'insertar':
        $respuesta = $Categoria->insertar($nombre, $descripcion);
        echo json_encode([
            "exito"   => $respuesta ? true : false,
            "mensaje" => $respuesta ? "Categoria registrada" : "Categoria no se pudo registrar"
        ]);
        break;

    // Actualiza una categoria existente
    case 'editar':
        $respuesta = $Categoria->actualizar(intval($id), $nombre, $descripcion);
        echo json_encode([
            "exito"   => $respuesta ? true : false,
            "mensaje" => $respuesta ? "Categoria actualizada" : "Categoria no se pudo actualizar"
        ]);
        break;

    // Elimina una categoria
    case 'eliminar':
        $respuesta = $Categoria->eliminar(intval($id));
        echo json_encode([
            "exito"   => $respuesta ? true : false,
            "mensaje" => $respuesta ? "Categoria eliminada" : "Categoria no se pudo eliminar (verifique que no tenga productos asociados)"
        ]);
        break;

    default:
        echo json_encode(["exito" => false, "mensaje" => "Operacion no valida"]);
}
?>
