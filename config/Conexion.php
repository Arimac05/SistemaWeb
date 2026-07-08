<?php

// Incluimos el archivo global.php donde se encuentran
// las constantes con la configuracion de la base de datos
require_once "global.php";

// Creamos la conexion con la base de datos
// mysqli(host, usuario, password, baseDatos)
$conexion = new mysqli(DB_HOST, DB_USERNAME, DB_PASSWORD, DB_NAME);

// Configuramos la codificacion de caracteres que utilizara
// la conexion con la base de datos
// Esto evita problemas al trabajar con caracteres especiales
mysqli_query($conexion, 'SET NAMES "' . DB_ENCODE . '"');

// Verificamos si ocurrio un error durante la conexion
// mysqli_connect_errno() devuelve el numero del error
// Si no hubo errores devuelve 0
if (mysqli_connect_errno())
{
    // Mostramos el mensaje del error ocurrido
    printf("Fallo conexion a la base de datos: %s\n", mysqli_connect_error());

    // Finalizamos la ejecucion del programa
    exit();
}

// Funcion para ejecutar consultas SQL
// Parametro:
// $sql -> Consulta SQL que se desea ejecutar
//
// Retorna:
// Un objeto mysqli_result con los registros para consultas SELECT.
// true o false para consultas INSERT, UPDATE o DELETE.
function ejecutarConsulta($sql)
{
    // Utilizamos la variable global de la conexion
    global $conexion;

    // Ejecutamos la consulta SQL
    $query = $conexion->query($sql);

    // Retornamos el resultado de la consulta
    return $query;
}

?>
