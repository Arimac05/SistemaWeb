<?php
// Incluimos inicialmente la conexion a la base de datos
require_once __DIR__ . "/../config/Conexion.php";

class Categoria
{
    public function __construct()
    {
    }

    // Devuelve la lista de todas las categorias
    public function listar()
    {
        $sql = "SELECT * FROM categoria ORDER BY nombre ASC";
        return ejecutarConsulta($sql);
    }

    // Devuelve el registro de una categoria por id
    public function buscar($id)
    {
        $sql = "SELECT * FROM categoria WHERE id=$id";
        return ejecutarConsulta($sql);
    }

    // Inserta una nueva categoria
    public function insertar($nombre, $descripcion)
    {
        $sql = "INSERT INTO categoria (nombre, descripcion)
                VALUES ('$nombre', '$descripcion')";
        return ejecutarConsulta($sql);
    }

    // Actualiza los datos de una categoria existente
    public function actualizar($id, $nombre, $descripcion)
    {
        $sql = "UPDATE categoria SET
                    nombre='$nombre',
                    descripcion='$descripcion'
                WHERE id=$id";
        return ejecutarConsulta($sql);
    }

    // Elimina una categoria por id
    public function eliminar($id)
    {
        $sql = "DELETE FROM categoria WHERE id=$id";
        return ejecutarConsulta($sql);
    }
}
?>
