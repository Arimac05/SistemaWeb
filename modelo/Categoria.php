<?php
//Incluimos inicialmente la conexion a la base de datos
require_once __DIR__ . "/../config/Conexion.php";

class Categoria
{
    public function __construct()
    {
    }

    // Devuelve el registro de una categoria por id
    public function buscar($id)
    {
        $id = (int)$id;
        $sql = "SELECT * FROM categoria WHERE id=$id";
        return ejecutarConsulta($sql);
    }

    // Devuelve la lista de todas las categorias
    public function listar()
    {
        $sql = "SELECT id, nombre FROM categoria ORDER BY nombre ASC";
        return ejecutarConsulta($sql);
    }

    // Agrega una nueva categoria
    public function agregar($nombre)
    {
        global $conexion;
        $nombre = mysqli_real_escape_string($conexion, $nombre);
        $sql = "INSERT INTO categoria (nombre) VALUES ('$nombre')";
        return ejecutarConsulta($sql);
    }

    // Edita una categoria existente
    public function editar($id, $nombre)
    {
        global $conexion;
        $id = (int)$id;
        $nombre = mysqli_real_escape_string($conexion, $nombre);
        $sql = "UPDATE categoria SET nombre='$nombre' WHERE id=$id";
        return ejecutarConsulta($sql);
    }

    // Elimina una categoria por id
    public function eliminar($id)
    {
        $id = (int)$id;
        $sql = "DELETE FROM categoria WHERE id=$id";
        return ejecutarConsulta($sql);
    }
}
?>
