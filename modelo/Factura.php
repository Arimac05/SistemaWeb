<?php
// Incluimos inicialmente la conexion a la base de datos
require_once __DIR__ . "/../config/Conexion.php";

class Factura
{
    public function __construct()
    {
    }

    // Devuelve la lista de facturas con el nombre del cliente,
    // la cantidad de productos y el total de cada una
    public function listar()
    {
        $sql = "SELECT f.id, f.fecha, f.cedula_cliente,
                       CONCAT(c.nombre, ' ', c.apellido) AS nombre_cliente,
                       f.subtotal, f.iva, f.total,
                       (SELECT COUNT(*) FROM detalle_factura d WHERE d.id_factura = f.id) AS cantidad_productos
                FROM factura f
                INNER JOIN cliente c ON f.cedula_cliente = c.cedula
                ORDER BY f.id DESC";
        return ejecutarConsulta($sql);
    }

    // Devuelve el encabezado de una factura por id
    public function buscarEncabezado($id)
    {
        $sql = "SELECT f.id, f.fecha, f.cedula_cliente,
                       CONCAT(c.nombre, ' ', c.apellido) AS nombre_cliente,
                       f.subtotal, f.iva, f.total
                FROM factura f
                INNER JOIN cliente c ON f.cedula_cliente = c.cedula
                WHERE f.id=$id";
        return ejecutarConsulta($sql);
    }

    // Devuelve el detalle (lineas de producto) de una factura
    public function listarDetalle($idFactura)
    {
        $sql = "SELECT d.codigo_producto, p.nombre AS nombre_producto,
                       d.cantidad, d.precio_unitario, d.subtotal
                FROM detalle_factura d
                INNER JOIN producto p ON d.codigo_producto = p.codigo
                WHERE d.id_factura=$idFactura";
        return ejecutarConsulta($sql);
    }

    // Inserta el encabezado de la factura y devuelve el id generado
    public function insertarEncabezado($fecha, $cedulaCliente, $subtotal, $iva, $total)
    {
        global $conexion;

        $sql = "INSERT INTO factura (fecha, cedula_cliente, subtotal, iva, total)
                VALUES ('$fecha', '$cedulaCliente', $subtotal, $iva, $total)";
        ejecutarConsulta($sql);

        // insert_id devuelve el id autoincremental que acaba de generarse
        return $conexion->insert_id;
    }

    // Inserta una linea de detalle asociada a una factura
    public function insertarDetalle($idFactura, $codigoProducto, $cantidad, $precioUnitario, $subtotal)
    {
        $sql = "INSERT INTO detalle_factura (id_factura, codigo_producto, cantidad, precio_unitario, subtotal)
                VALUES ($idFactura, '$codigoProducto', $cantidad, $precioUnitario, $subtotal)";
        return ejecutarConsulta($sql);
    }

    // Elimina una factura (el detalle se borra automaticamente por ON DELETE CASCADE)
    public function eliminar($id)
    {
        $sql = "DELETE FROM factura WHERE id=$id";
        return ejecutarConsulta($sql);
    }
}
?>
