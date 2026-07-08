<?php
// Incluimos la clase PDF_MC_Table que permite crear tablas
// con filas de altura variable dentro del PDF
require('MC_Table.php');

// Incluimos el modelo Factura para obtener la informacion
// desde la base de datos
require_once "../modelo/Factura.php";

// Funcion para convertir texto UTF-8 a ISO-8859-1
// FPDF clasico trabaja con ISO-8859-1 y no con UTF-8
// iconv reemplaza a utf8_decode(), ya que esta funcion
// fue marcada como obsoleta a partir de PHP 8.2
function pdfText($texto)
{
    return iconv('UTF-8', 'ISO-8859-1//TRANSLIT', (string)$texto);
}

// Obtenemos el id de la factura enviado por GET
// Ejemplo de uso: vista/rptfactura.php?id=5
$idFactura = isset($_GET['id']) ? (int)$_GET['id'] : 0;

if ($idFactura <= 0)
{
    die('Debe indicar un numero de factura valido. Ejemplo: rptfactura.php?id=1');
}

// Creamos un objeto de la clase Factura y buscamos el encabezado y el detalle
$Factura = new Factura();
$rsptaEncabezado = $Factura->buscarEncabezado($idFactura);

if (!$rsptaEncabezado || $rsptaEncabezado->num_rows === 0)
{
    die('No se encontro la factura solicitada.');
}

$encabezado = $rsptaEncabezado->fetch_object();
$rsptaDetalle = $Factura->buscarDetalle($idFactura);

// Instanciamos la clase para generar el documento PDF
$pdf = new PDF_MC_Table();
$pdf->AliasNbPages();
$pdf->AddPage();

// ---------- Encabezado del documento ----------
$pdf->SetFont('Arial', 'B', 16);
$pdf->Cell(0, 8, pdfText('Finca La Reina / Caprocam'), 0, 1, 'C');

$pdf->SetFont('Arial', '', 10);
$pdf->Cell(0, 6, pdfText('Guanacaste, Costa Rica'), 0, 1, 'C');
$pdf->Ln(4);

$pdf->SetFont('Arial', 'B', 14);
$pdf->Cell(0, 8, pdfText('FACTURA N.' . str_pad($encabezado->id, 5, '0', STR_PAD_LEFT)), 0, 1, 'C');
$pdf->Ln(2);

// ---------- Datos del cliente ----------
$pdf->SetFont('Arial', 'B', 10);
$pdf->Cell(30, 6, pdfText('Fecha:'), 0, 0);
$pdf->SetFont('Arial', '', 10);
$fechaVisual = date('d/m/Y', strtotime($encabezado->fecha));
$pdf->Cell(0, 6, pdfText($fechaVisual), 0, 1);

$pdf->SetFont('Arial', 'B', 10);
$pdf->Cell(30, 6, pdfText('Cliente:'), 0, 0);
$pdf->SetFont('Arial', '', 10);
$pdf->Cell(0, 6, pdfText($encabezado->nombreCliente), 0, 1);

$pdf->SetFont('Arial', 'B', 10);
$pdf->Cell(30, 6, pdfText('Cedula:'), 0, 0);
$pdf->SetFont('Arial', '', 10);
$pdf->Cell(0, 6, pdfText($encabezado->cedula_cliente), 0, 1);

if (!empty($encabezado->telefono))
{
    $pdf->SetFont('Arial', 'B', 10);
    $pdf->Cell(30, 6, pdfText('Telefono:'), 0, 0);
    $pdf->SetFont('Arial', '', 10);
    $pdf->Cell(0, 6, pdfText($encabezado->telefono), 0, 1);
}

$pdf->Ln(6);

// ---------- Encabezados de la tabla de detalle ----------
$pdf->SetFillColor(232, 232, 232);
$pdf->SetFont('Arial', 'B', 10);
$pdf->Cell(25, 7, pdfText('Codigo'), 1, 0, 'C', true);
$pdf->Cell(70, 7, pdfText('Producto'), 1, 0, 'C', true);
$pdf->Cell(30, 7, pdfText('Precio Unit.'), 1, 0, 'C', true);
$pdf->Cell(20, 7, pdfText('Cant.'), 1, 0, 'C', true);
$pdf->Cell(35, 7, pdfText('Subtotal'), 1, 0, 'C', true);
$pdf->Ln(7);

// Definimos el ancho de cada columna de la tabla de detalle
$pdf->SetWidths(array(25, 70, 30, 20, 35));
$pdf->SetAligns(array('L', 'L', 'R', 'C', 'R'));

// Recorremos todas las lineas de detalle obtenidas desde la base de datos
$pdf->SetFont('Arial', '', 10);
while ($linea = $rsptaDetalle->fetch_object())
{
    $pdf->Row(array(
        pdfText($linea->codigo_producto),
        pdfText($linea->nombre_producto),
        pdfText(number_format((float)$linea->precio_unitario, 2)),
        pdfText($linea->cantidad),
        pdfText(number_format((float)$linea->subtotal, 2))
    ));
}

$pdf->Ln(4);

// ---------- Totales ----------
$pdf->SetFont('Arial', 'B', 10);
$pdf->Cell(150, 6, pdfText('Subtotal:'), 0, 0, 'R');
$pdf->Cell(30, 6, pdfText(number_format((float)$encabezado->subtotal, 2)), 0, 1, 'R');

$pdf->Cell(150, 6, pdfText('IVA (13%):'), 0, 0, 'R');
$pdf->Cell(30, 6, pdfText(number_format((float)$encabezado->iva, 2)), 0, 1, 'R');

$pdf->SetFont('Arial', 'B', 12);
$pdf->Cell(150, 8, pdfText('TOTAL:'), 0, 0, 'R');
$pdf->Cell(30, 8, pdfText(number_format((float)$encabezado->total, 2)), 0, 1, 'R');

// Mostramos o descargamos el documento PDF
// Output(nombreArchivo, destino)
//
// nombreArchivo: Nombre que tendra el archivo PDF.
// destino:
// I -> Muestra el PDF en el navegador.
// D -> Descarga el PDF automaticamente.
// F -> Guarda el PDF en el servidor.
// S -> Devuelve el PDF como una cadena de texto
$pdf->Output('I', 'factura_' . $encabezado->id . '.pdf');
?>
