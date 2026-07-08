<?php
//Incluimos inicialmente la conexion a la base de datos
require_once __DIR__ . "/../config/Conexion.php";

class Factura
{
    // Porcentaje de IVA utilizado en toda la facturacion
    const IVA_PORCENTAJE = 0.13;

    public function __construct()
    {
    }

    // Devuelve la lista de todas las facturas (encabezado)
    // incluyendo el nombre del cliente y la cantidad de productos
    public function listar()
    {
        $sql = "SELECT f.id, f.fecha, f.cedula_cliente, c.nombre AS nombreCliente,
                       f.subtotal, f.iva, f.total,
                       (SELECT COUNT(*) FROM detalle_factura d WHERE d.id_factura = f.id) AS cantidadProductos
                FROM factura f
                INNER JOIN cliente c ON c.cedula = f.cedula_cliente
                ORDER BY f.id DESC";
        return ejecutarConsulta($sql);
    }

    // Devuelve el encabezado de una factura por id
    public function buscarEncabezado($id)
    {
        $id = (int)$id;
        $sql = "SELECT f.id, f.fecha, f.cedula_cliente, c.nombre AS nombreCliente, c.telefono,
                       f.subtotal, f.iva, f.total
                FROM factura f
                INNER JOIN cliente c ON c.cedula = f.cedula_cliente
                WHERE f.id = $id";
        return ejecutarConsulta($sql);
    }

    // Devuelve el detalle (lineas de productos) de una factura
    public function buscarDetalle($id)
    {
        $id = (int)$id;
        $sql = "SELECT codigo_producto, nombre_producto, precio_unitario, cantidad, subtotal
                FROM detalle_factura
                WHERE id_factura = $id
                ORDER BY id ASC";
        return ejecutarConsulta($sql);
    }

    // Guarda una factura completa (encabezado + detalle) dentro de una transaccion
    // $cedula -> cedula del cliente
    // $fecha  -> fecha de la factura (formato Y-m-d)
    // $detalle -> arreglo de lineas, cada una con: codigo, nombre, precio, cantidad
    //
    // Retorna el id de la factura creada, o false si ocurrio un error
    public function guardar($cedula, $fecha, $detalle)
    {
        global $conexion;

        if (empty($detalle))
        {
            return false;
        }

        $cedula = mysqli_real_escape_string($conexion, $cedula);
        $fecha = mysqli_real_escape_string($conexion, $fecha);

        // Calculamos los totales a partir del detalle recibido
        $subtotal = 0;
        foreach ($detalle as $linea)
        {
            $subtotal += (float)$linea['precio'] * (int)$linea['cantidad'];
        }
        $iva = $subtotal * self::IVA_PORCENTAJE;
        $total = $subtotal + $iva;

        // Iniciamos una transaccion para asegurar que el encabezado
        // y el detalle se guarden juntos
        $conexion->begin_transaction();

        try
        {
            $sqlFactura = "INSERT INTO factura (fecha, cedula_cliente, subtotal, iva, total)
                            VALUES ('$fecha', '$cedula', $subtotal, $iva, $total)";
            if (!ejecutarConsulta($sqlFactura))
            {
                throw new Exception("No se pudo guardar el encabezado de la factura");
            }

            $idFactura = $conexion->insert_id;

            foreach ($detalle as $linea)
            {
                $codigo = mysqli_real_escape_string($conexion, $linea['codigo']);
                $nombre = mysqli_real_escape_string($conexion, $linea['nombre']);
                $precio = (float)$linea['precio'];
                $cantidad = (int)$linea['cantidad'];
                $subtotalLinea = $precio * $cantidad;

                $sqlDetalle = "INSERT INTO detalle_factura
                                (id_factura, codigo_producto, nombre_producto, precio_unitario, cantidad, subtotal)
                                VALUES ($idFactura, '$codigo', '$nombre', $precio, $cantidad, $subtotalLinea)";

                if (!ejecutarConsulta($sqlDetalle))
                {
                    throw new Exception("No se pudo guardar el detalle de la factura");
                }
            }

            $conexion->commit();
            return $idFactura;
        }
        catch (Exception $e)
        {
            $conexion->rollback();
            return false;
        }
    }

    // Elimina una factura (el detalle se elimina en cascada, ver BD Facturacion.sql)
    public function eliminar($id)
    {
        $id = (int)$id;
        $sql = "DELETE FROM factura WHERE id = $id";
        return ejecutarConsulta($sql);
    }
}
?>
