# Sistema de Facturación — Base del proyecto (Front)

Este proyecto sigue **exactamente** la misma arquitectura y convenciones vistas en clase (Sistemv3), para que todo el equipo trabaje de forma consistente.

## Estructura de carpetas

```
SistemaFacturacion/
├── css/
│   ├── bootstrap.min.css
│   ├── jquery.dataTables.min.css
│   └── estilos.css
├── js/
│   ├── jquery.js
│   ├── alerta.js              (SweetAlert2)
│   ├── bootstrap.bundle.min.js
│   ├── jquery.dataTables.min.js
│   ├── menu.js                (inyecta menu.html)
│   ├── crud_cliente.js
│   ├── crud_categoria.js
│   ├── crud_producto.js
│   └── factura.js
├── datatable/
│   └── es-ES.json             (idioma DataTables)
├── menu.html                  (menú compartido, se inyecta con fetch)
├── index.html                 (Facturación — pantalla principal)
├── clientes.html
├── categorias.html
└── productos.html
```

Todas las librerías están **locales** (no CDN), igual que en el ejemplo del profesor, para que el proyecto funcione sin depender de internet.

## Convenciones que TODOS deben respetar

1. **Un archivo `.html` por pantalla**, todas comparten `css/estilos.css` y cargan el menú con `<div id="menu"></div>` + `js/menu.js`.
2. **El formulario NO es un modal.** Se muestra/oculta con `panelFormulario` / `panelTabla` (mostrar uno, ocultar el otro). Los modales (`modalXxx`) son SOLO para buscar/seleccionar un registro relacionado (como categoría en Producto, o cliente/producto en Factura).
3. **El CRUD se maneja con la API de DataTables**, no reconstruyendo la tabla desde cero:
   - Agregar fila: `tabla.row.add([...]).draw(false);`
   - Editar fila: se guarda la referencia de la fila en una variable (`filaEditando`) y se actualiza con `filaEditando.data([...]).draw(false);`
   - Eliminar fila: `fila.remove().draw(false);`
   - La columna de "Acciones" siempre se genera con `columnDefs` + `render`, nunca escrita a mano en el array de datos.
4. **Búsqueda con relación (llave foránea):** el campo de código/ID relacionado tiene autocompletado con el evento `input blur`, y un botón de lupa (🔍) que abre un modal con una tabla y botón "Seleccionar" (ver `crud_producto.js` como ejemplo con Categoría, o `factura.js` con Cliente/Producto).
5. **Nombres de funciones en español**, siguiendo el patrón: `mostrarFormularioAgregar`, `ocultarFormulario`, `limpiarFormulario`, `guardarRegistro`, `editarFila`, `eliminarFila`, `buscarXPorCodigo`, `seleccionarXDesdeModal`.
6. Por ahora los datos son arreglos de JavaScript de prueba (`listaClientes`, `listaProductos`, etc.). Cuando se conecte el backend en PHP/MySQL, estos arreglos se reemplazan por llamadas `$.ajax()` que consuman el controlador PHP.

## Cómo ver el proyecto

Como el menú se carga con `fetch("menu.html")`, el navegador **no permite abrir los `.html` con doble clic** (bloqueo de CORS en `file://`). Hay que servirlo con un servidor local, por ejemplo:

- **VS Code:** extensión "Live Server" → clic derecho en `index.html` → "Open with Live Server".
- **XAMPP:** copiar la carpeta a `htdocs/` y abrir `http://localhost/SistemaFacturacion/`.

## Módulos y quién los desarrolla (completar según el equipo)

| Módulo | Pantalla | Tipo | Responsable |
|---|---|---|---|
| Cliente | `clientes.html` | Mantenimiento básico | |
| Categoría | `categorias.html` | Mantenimiento básico | |
| Producto | `productos.html` | Mantenimiento con relación (Categoría) | |
| Factura | `index.html` | Encabezado - Detalle | |

## Backend (PHP/MySQL) — módulo Factura

Se agregó el backend siguiendo **exactamente** la misma arquitectura y librería de generación de PDF vistas en el ejemplo `Reporte` (config → modelo → vista, con FPDF):

```
SistemaFacturacion/
├── config/
│   ├── global.php        (constantes de conexión, BD "facturacion")
│   └── Conexion.php       (conexión mysqli + ejecutarConsulta())
├── modelo/
│   ├── Cliente.php
│   ├── Categoria.php
│   ├── Producto.php
│   └── Factura.php        (encabezado + detalle, calcula IVA 13%, transacción)
├── controlador/           (endpoints AJAX en JSON, consumidos por js/factura.js)
│   ├── ControladorCliente.php
│   ├── ControladorProducto.php
│   └── ControladorFactura.php
├── vista/
│   ├── MC_Table.php        (igual al de Reporte: tabla con filas de alto variable)
│   └── rptfactura.php      (genera el PDF de una factura: vista/rptfactura.php?id=N)
├── pdf/                    (librería FPDF, copiada tal cual de Reporte)
└── BD Facturacion.sql      (script de base de datos: cliente, categoria, producto, factura, detalle_factura)
```

### Cómo probarlo

1. Importar `BD Facturacion.sql` en MySQL/MariaDB (crea la base `facturacion` con datos de ejemplo).
2. Copiar el proyecto a `htdocs/` de XAMPP (o similar) y abrir `http://localhost/SistemaFacturacion/`.
3. En **Facturación** (`index.html`), los combos de cliente/producto y el listado de facturas ahora se cargan desde la base de datos vía AJAX (`controlador/*.php`).
4. Cada factura guardada tiene un botón **"Generar PDF"** que abre `vista/rptfactura.php?id=N` en una pestaña nueva, generando el documento con FPDF (mismo mecanismo que `rptestudiantes.php` en el proyecto Reporte).

### Pendiente (otros módulos)

- Conectar `clientes.html`, `categorias.html` y `productos.html` a sus respectivos controladores (los modelos `Cliente.php`, `Categoria.php` y `Producto.php` ya están listos con `listar/agregar/editar/eliminar`), reemplazando los arreglos de prueba en `crud_cliente.js`, `crud_categoria.js` y `crud_producto.js` por `$.ajax()`.

