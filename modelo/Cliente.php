<?php
// Incluimos inicialmente la conexion a la base de datos
require_once __DIR__ . "/../config/Conexion.php";

class Cliente
{
    public function __construct()
    {
    }

    // Devuelve la lista de todos los clientes
    public function listar()
    {
        $sql = "SELECT * FROM cliente ORDER BY nombre ASC";
        return ejecutarConsulta($sql);
    }

    // Devuelve el registro de un cliente por cedula
    public function buscar($cedula)
    {
        $sql = "SELECT * FROM cliente WHERE cedula='$cedula'";
        return ejecutarConsulta($sql);
    }

    // Inserta un nuevo cliente
    public function insertar($cedula, $nombre, $apellido, $telefono, $email, $direccion)
    {
        $sql = "INSERT INTO cliente (cedula, nombre, apellido, telefono, email, direccion)
                VALUES ('$cedula', '$nombre', '$apellido', '$telefono', '$email', '$direccion')";
        return ejecutarConsulta($sql);
    }

    // Actualiza los datos de un cliente existente
    public function actualizar($cedula, $nombre, $apellido, $telefono, $email, $direccion)
    {
        $sql = "UPDATE cliente SET
                    nombre='$nombre',
                    apellido='$apellido',
                    telefono='$telefono',
                    email='$email',
                    direccion='$direccion'
                WHERE cedula='$cedula'";
        return ejecutarConsulta($sql);
    }

    // Elimina un cliente por cedula
    public function eliminar($cedula)
    {
        $sql = "DELETE FROM cliente WHERE cedula='$cedula'";
        return ejecutarConsulta($sql);
    }
}
?>
