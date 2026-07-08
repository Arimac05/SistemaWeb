<?php
//Incluimos inicialmente la conexion a la base de datos
require_once __DIR__ . "/../config/Conexion.php";

class Producto
{
    public function __construct()
    {
    }

    // Devuelve el registro de un producto por codigo
    public function buscar($codigo)
    {
        $codigo = mysqli_real_escape_string($GLOBALS['conexion'], $codigo);
        $sql = "SELECT * FROM producto WHERE codigo='$codigo'";
        return ejecutarConsulta($sql);
    }

    // Devuelve la lista de todos los productos
    public function listar()
    {
        $sql = "SELECT p.codigo, p.nombre, p.precio, p.id_categoria, c.nombre AS nombreCategoria
                FROM producto p
                LEFT JOIN categoria c ON c.id = p.id_categoria
                ORDER BY p.nombre ASC";
        return ejecutarConsulta($sql);
    }

    // Agrega un nuevo producto
    public function agregar($codigo, $nombre, $precio, $idCategoria)
    {
        global $conexion;
        $codigo = mysqli_real_escape_string($conexion, $codigo);
        $nombre = mysqli_real_escape_string($conexion, $nombre);
        $precio = (float)$precio;
        $idCategoria = (int)$idCategoria;

        $sql = "INSERT INTO producto (codigo, nombre, precio, id_categoria)
                VALUES ('$codigo', '$nombre', $precio, $idCategoria)";
        return ejecutarConsulta($sql);
    }

    // Edita un producto existente
    public function editar($codigo, $nombre, $precio, $idCategoria)
    {
        global $conexion;
        $codigo = mysqli_real_escape_string($conexion, $codigo);
        $nombre = mysqli_real_escape_string($conexion, $nombre);
        $precio = (float)$precio;
        $idCategoria = (int)$idCategoria;

        $sql = "UPDATE producto SET nombre='$nombre', precio=$precio, id_categoria=$idCategoria
                WHERE codigo='$codigo'";
        return ejecutarConsulta($sql);
    }

    // Elimina un producto por codigo
    public function eliminar($codigo)
    {
        $codigo = mysqli_real_escape_string($GLOBALS['conexion'], $codigo);
        $sql = "DELETE FROM producto WHERE codigo='$codigo'";
        return ejecutarConsulta($sql);
    }
}
?>
