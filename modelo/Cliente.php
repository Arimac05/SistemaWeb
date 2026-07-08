<?php
//Incluimos inicialmente la conexion a la base de datos
require_once __DIR__ . "/../config/Conexion.php";

class Cliente
{
    public function __construct()
    {
    }

    // Devuelve el registro de un cliente por cedula
    public function buscar($cedula)
    {
        $cedula = mysqli_real_escape_string($GLOBALS['conexion'], $cedula);
        $sql = "SELECT * FROM cliente WHERE cedula='$cedula'";
        return ejecutarConsulta($sql);
    }

    // Devuelve la lista de todos los clientes
    public function listar()
    {
        $sql = "SELECT cedula, nombre, telefono FROM cliente ORDER BY nombre ASC";
        return ejecutarConsulta($sql);
    }

    // Agrega un nuevo cliente
    public function agregar($cedula, $nombre, $telefono)
    {
        global $conexion;
        $cedula = mysqli_real_escape_string($conexion, $cedula);
        $nombre = mysqli_real_escape_string($conexion, $nombre);
        $telefono = mysqli_real_escape_string($conexion, $telefono);

        $sql = "INSERT INTO cliente (cedula, nombre, telefono) VALUES ('$cedula', '$nombre', '$telefono')";
        return ejecutarConsulta($sql);
    }

    // Edita un cliente existente
    public function editar($cedula, $nombre, $telefono)
    {
        global $conexion;
        $cedula = mysqli_real_escape_string($conexion, $cedula);
        $nombre = mysqli_real_escape_string($conexion, $nombre);
        $telefono = mysqli_real_escape_string($conexion, $telefono);

        $sql = "UPDATE cliente SET nombre='$nombre', telefono='$telefono' WHERE cedula='$cedula'";
        return ejecutarConsulta($sql);
    }

    // Elimina un cliente por cedula
    public function eliminar($cedula)
    {
        $cedula = mysqli_real_escape_string($GLOBALS['conexion'], $cedula);
        $sql = "DELETE FROM cliente WHERE cedula='$cedula'";
        return ejecutarConsulta($sql);
    }
}
?>
