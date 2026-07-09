<?php
// Incluimos inicialmente la conexion a la base de datos
require_once __DIR__ . "/../config/Conexion.php";

class Producto
{
    public function __construct()
    {
    }

    // Devuelve la lista de todos los productos junto con el nombre de su categoria
    public function listar()
    {
        $sql = "SELECT p.codigo, p.nombre, p.descripcion, p.precio, p.stock,
                       p.id_categoria, c.nombre AS nombre_categoria
                FROM producto p
                INNER JOIN categoria c ON p.id_categoria = c.id
                ORDER BY p.nombre ASC";
        return ejecutarConsulta($sql);
    }

    // Devuelve el registro de un producto por codigo
    public function buscar($codigo)
    {
        $sql = "SELECT p.codigo, p.nombre, p.descripcion, p.precio, p.stock,
                       p.id_categoria, c.nombre AS nombre_categoria
                FROM producto p
                INNER JOIN categoria c ON p.id_categoria = c.id
                WHERE p.codigo='$codigo'";
        return ejecutarConsulta($sql);
    }

    // Inserta un nuevo producto
    public function insertar($codigo, $nombre, $descripcion, $precio, $stock, $idCategoria)
    {
        $sql = "INSERT INTO producto (codigo, nombre, descripcion, precio, stock, id_categoria)
                VALUES ('$codigo', '$nombre', '$descripcion', $precio, $stock, $idCategoria)";
        return ejecutarConsulta($sql);
    }

    // Actualiza los datos de un producto existente
    public function actualizar($codigo, $nombre, $descripcion, $precio, $stock, $idCategoria)
    {
        $sql = "UPDATE producto SET
                    nombre='$nombre',
                    descripcion='$descripcion',
                    precio=$precio,
                    stock=$stock,
                    id_categoria=$idCategoria
                WHERE codigo='$codigo'";
        return ejecutarConsulta($sql);
    }

    // Elimina un producto por codigo
    public function eliminar($codigo)
    {
        $sql = "DELETE FROM producto WHERE codigo='$codigo'";
        return ejecutarConsulta($sql);
    }
}
?>
