<?php
// Incluimos el modelo del Cliente
require_once __DIR__ . "/../modelo/Cliente.php";

header("Content-Type: application/json; charset=UTF-8");

$Cliente = new Cliente();

// Leemos el cuerpo de la peticion en formato JSON
$datos = json_decode(file_get_contents("php://input"), true);

$cedula    = isset($datos["cedula"]) ? $datos["cedula"] : "";
$nombre    = isset($datos["nombre"]) ? $datos["nombre"] : "";
$apellido  = isset($datos["apellido"]) ? $datos["apellido"] : "";
$telefono  = isset($datos["telefono"]) ? $datos["telefono"] : "";
$email     = isset($datos["email"]) ? $datos["email"] : "";
$direccion = isset($datos["direccion"]) ? $datos["direccion"] : "";

switch ($_GET["op"]) {

    // Devuelve la lista completa de clientes
    case 'listar':
        $rspta = $Cliente->listar();
        $lista = array();

        while ($fila = $rspta->fetch_assoc()) {
            $lista[] = $fila;
        }

        echo json_encode([
            "exito" => true,
            "datos" => $lista
        ]);
        break;

    // Busca un cliente por cedula (se usa en el autocompletado de Factura)
    case 'buscar':
        $cedula = isset($_GET["cedula"]) ? $_GET["cedula"] : "";
        $rspta = $Cliente->buscar($cedula);
        $fila = $rspta->fetch_assoc();

        echo json_encode([
            "exito" => $fila ? true : false,
            "datos" => $fila
        ]);
        break;

    // Inserta un nuevo cliente
    case 'insertar':
        $respuesta = $Cliente->insertar($cedula, $nombre, $apellido, $telefono, $email, $direccion);
        echo json_encode([
            "exito"   => $respuesta ? true : false,
            "mensaje" => $respuesta ? "Cliente registrado" : "Cliente no se pudo registrar"
        ]);
        break;

    // Actualiza un cliente existente
    case 'editar':
        $respuesta = $Cliente->actualizar($cedula, $nombre, $apellido, $telefono, $email, $direccion);
        echo json_encode([
            "exito"   => $respuesta ? true : false,
            "mensaje" => $respuesta ? "Cliente actualizado" : "Cliente no se pudo actualizar"
        ]);
        break;

    // Elimina un cliente
    case 'eliminar':
        $respuesta = $Cliente->eliminar($cedula);
        echo json_encode([
            "exito"   => $respuesta ? true : false,
            "mensaje" => $respuesta ? "Cliente eliminado" : "Cliente no se pudo eliminar (verifique que no tenga facturas asociadas)"
        ]);
        break;

    default:
        echo json_encode(["exito" => false, "mensaje" => "Operacion no valida"]);
}
?>
