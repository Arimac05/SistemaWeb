<?php
// Incluimos la clase PDF_MC_Table que permite crear tablas
// con filas de altura variable dentro del PDF
require(__DIR__ . '/MC_Table.php');

// Incluimos el modelo Factura para obtener la informacion
// desde la base de datos
require_once __DIR__ . "/../modelo/Factura.php";

// Funcion para convertir texto UTF-8 a ISO-8859-1
// FPDF clasico trabaja con ISO-8859-1 y no con UTF-8
// iconv reemplaza a utf8_decode(), ya que esta funcion
// fue marcada como obsoleta a partir de PHP 8.2
function pdfText($texto)
{
    return iconv('UTF-8', 'ISO-8859-1//TRANSLIT', (string)$texto);
}

// Leemos el id de la factura que se quiere imprimir (llega por la URL)
$idFactura = isset($_GET['id']) ? intval($_GET['id']) : 0;

// Creamos un objeto para usar los metodos del modelo
$Factura = new Factura();

// Buscamos el encabezado de la factura
$rsptaEncabezado = $Factura->buscarEncabezado($idFactura);
$encabezado = $rsptaEncabezado->fetch_object();

// Si no existe la factura, detenemos la ejecucion
if (!$encabezado)
{
    die('La factura solicitada no existe.');
}

// Instanciamos la clase para generar el documento PDF
$pdf = new PDF_MC_Table();

// Agregamos la primera pagina al documento
$pdf->AddPage();

// ===================== Encabezado del documento =====================

// Configuramos el tipo de letra para el titulo
// SetFont(familia, estilo, tamano)
$pdf->SetFont('Arial', 'B', 14);

// Titulo centrado del reporte
$pdf->Cell(0, 8, pdfText('FACTURA'), 0, 1, 'C');

$pdf->Ln(2);

// Datos generales de la factura (numero y fecha)
$pdf->SetFont('Arial', '', 10);
$pdf->Cell(95, 6, pdfText('Factura N.: ' . $encabezado->id), 0, 0, 'L');
$pdf->Cell(95, 6, pdfText('Fecha: ' . $encabezado->fecha), 0, 1, 'R');

$pdf->Ln(2);

// Datos del cliente
$pdf->SetFont('Arial', 'B', 10);
$pdf->Cell(0, 6, pdfText('Datos del cliente'), 0, 1, 'L');

$pdf->SetFont('Arial', '', 10);
$pdf->Cell(0, 6, pdfText('Cedula: ' . $encabezado->cedula_cliente), 0, 1, 'L');
$pdf->Cell(0, 6, pdfText('Nombre: ' . $encabezado->nombre_cliente), 0, 1, 'L');

$pdf->Ln(4);

// ===================== Detalle de productos =====================

// Definimos el color de fondo de las celdas del encabezado de la tabla
// SetFillColor(rojo, verde, azul)
$pdf->SetFillColor(232, 232, 232);

// Configuramos la fuente para los encabezados de la tabla
$pdf->SetFont('Arial', 'B', 10);

// Creamos los encabezados de la tabla
$pdf->Cell(25, 6, pdfText('Codigo'), 1, 0, 'C', true);
$pdf->Cell(65, 6, pdfText('Producto'), 1, 0, 'C', true);
$pdf->Cell(25, 6, pdfText('Cantidad'), 1, 0, 'C', true);
$pdf->Cell(35, 6, pdfText('Precio Unit.'), 1, 0, 'C', true);
$pdf->Cell(40, 6, pdfText('Subtotal'), 1, 0, 'C', true);

// Bajamos a la siguiente linea para comenzar los registros
$pdf->Ln(6);

// Obtenemos el detalle (lineas de producto) de la factura
$rsptaDetalle = $Factura->listarDetalle($idFactura);

// Definimos el ancho de cada columna de la tabla
$pdf->SetWidths(array(25, 65, 25, 35, 40));
$pdf->SetAligns(array('C', 'L', 'C', 'R', 'R'));

// Configuramos la fuente para los datos
$pdf->SetFont('Arial', '', 10);

// Recorremos todos los registros del detalle
while ($linea = $rsptaDetalle->fetch_object())
{
    $pdf->Row(array(
        pdfText($linea->codigo_producto),
        pdfText($linea->nombre_producto),
        pdfText($linea->cantidad),
        pdfText(number_format($linea->precio_unitario, 2)),
        pdfText(number_format($linea->subtotal, 2))
    ));
}

$pdf->Ln(4);

// ===================== Totales =====================

$pdf->SetFont('Arial', '', 10);
$pdf->Cell(150, 6, pdfText('Subtotal'), 0, 0, 'R');
$pdf->Cell(40, 6, pdfText(number_format($encabezado->subtotal, 2)), 1, 1, 'R');

$pdf->Cell(150, 6, pdfText('IVA (13%)'), 0, 0, 'R');
$pdf->Cell(40, 6, pdfText(number_format($encabezado->iva, 2)), 1, 1, 'R');

$pdf->SetFont('Arial', 'B', 10);
$pdf->Cell(150, 7, pdfText('Total'), 0, 0, 'R');
$pdf->Cell(40, 7, pdfText(number_format($encabezado->total, 2)), 1, 1, 'R');

// Mostramos o descargamos el documento PDF
// Output(nombreArchivo, destino)
// I -> Muestra el PDF en el navegador.
// D -> Descarga el PDF automaticamente.
$pdf->Output('I', 'factura_' . $encabezado->id . '.pdf');
?>
