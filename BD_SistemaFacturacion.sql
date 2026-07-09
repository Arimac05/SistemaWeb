CREATE DATABASE IF NOT EXISTS facturacion;
USE facturacion;

-- ================== Cliente ==================
CREATE TABLE IF NOT EXISTS cliente (
    cedula     VARCHAR(20) PRIMARY KEY,
    nombre     VARCHAR(100) NOT NULL,
    apellido   VARCHAR(100) NOT NULL,
    telefono   VARCHAR(20),
    email      VARCHAR(100),
    direccion  VARCHAR(200)
);

-- ================== Categoria ==================
CREATE TABLE IF NOT EXISTS categoria (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    nombre      VARCHAR(100) NOT NULL,
    descripcion VARCHAR(200)
);

-- ================== Producto ==================
CREATE TABLE IF NOT EXISTS producto (
    codigo       VARCHAR(20) PRIMARY KEY,
    nombre       VARCHAR(150) NOT NULL,
    descripcion  VARCHAR(200),
    precio       DECIMAL(10,2) NOT NULL DEFAULT 0,
    stock        INT NOT NULL DEFAULT 0,
    id_categoria INT NOT NULL,
    FOREIGN KEY (id_categoria) REFERENCES categoria(id)
);

-- ================== Factura (encabezado) ==================
CREATE TABLE IF NOT EXISTS factura (
    id             INT AUTO_INCREMENT PRIMARY KEY,
    fecha          DATE NOT NULL,
    cedula_cliente VARCHAR(20) NOT NULL,
    subtotal       DECIMAL(10,2) NOT NULL DEFAULT 0,
    iva            DECIMAL(10,2) NOT NULL DEFAULT 0,
    total          DECIMAL(10,2) NOT NULL DEFAULT 0,
    FOREIGN KEY (cedula_cliente) REFERENCES cliente(cedula)
);

-- ================== Detalle Factura ==================
CREATE TABLE IF NOT EXISTS detalle_factura (
    id               INT AUTO_INCREMENT PRIMARY KEY,
    id_factura       INT NOT NULL,
    codigo_producto  VARCHAR(20) NOT NULL,
    cantidad         INT NOT NULL,
    precio_unitario  DECIMAL(10,2) NOT NULL,
    subtotal         DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (id_factura) REFERENCES factura(id) ON DELETE CASCADE,
    FOREIGN KEY (codigo_producto) REFERENCES producto(codigo)
);

-- ================== Datos de prueba ==================
INSERT INTO cliente (cedula, nombre, apellido, telefono, email, direccion) VALUES
('101110111', 'Juan', 'Pérez', '88887777', 'juan@gmail.com', 'Liberia, Guanacaste'),
('202220222', 'María', 'Solano', '89998888', 'maria@gmail.com', 'Bagaces, Guanacaste');

INSERT INTO categoria (id, nombre, descripcion) VALUES
(1, 'Camarón', 'Productos derivados del camarón'),
(2, 'Alimento', 'Alimento balanceado para cultivo'),
(3, 'Insumo', 'Insumos generales de la finca');

INSERT INTO producto (codigo, nombre, descripcion, precio, stock, id_categoria) VALUES
('P001', 'Alimento camarón 20kg', 'Saco de alimento balanceado', 15000, 40, 2),
('P002', 'Camarón entero 1kg', 'Camarón fresco empacado', 6500, 120, 1);
