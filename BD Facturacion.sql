CREATE DATABASE IF NOT EXISTS facturacion;
USE facturacion;

CREATE TABLE IF NOT EXISTS cliente (
    cedula VARCHAR(20) PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    telefono VARCHAR(30)
);

CREATE TABLE IF NOT EXISTS categoria (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL
);

CREATE TABLE IF NOT EXISTS producto (
    codigo VARCHAR(20) PRIMARY KEY,
    nombre VARCHAR(150) NOT NULL,
    precio DECIMAL(10,2) NOT NULL,
    id_categoria INT,
    CONSTRAINT fk_producto_categoria FOREIGN KEY (id_categoria) REFERENCES categoria(id)
);

CREATE TABLE IF NOT EXISTS factura (
    id INT AUTO_INCREMENT PRIMARY KEY,
    fecha DATE NOT NULL,
    cedula_cliente VARCHAR(20) NOT NULL,
    subtotal DECIMAL(10,2) NOT NULL,
    iva DECIMAL(10,2) NOT NULL,
    total DECIMAL(10,2) NOT NULL,
    CONSTRAINT fk_factura_cliente FOREIGN KEY (cedula_cliente) REFERENCES cliente(cedula)
);

CREATE TABLE IF NOT EXISTS detalle_factura (
    id INT AUTO_INCREMENT PRIMARY KEY,
    id_factura INT NOT NULL,
    codigo_producto VARCHAR(20) NOT NULL,
    nombre_producto VARCHAR(150) NOT NULL,
    precio_unitario DECIMAL(10,2) NOT NULL,
    cantidad INT NOT NULL,
    subtotal DECIMAL(10,2) NOT NULL,
    CONSTRAINT fk_detalle_factura FOREIGN KEY (id_factura) REFERENCES factura(id) ON DELETE CASCADE,
    CONSTRAINT fk_detalle_producto FOREIGN KEY (codigo_producto) REFERENCES producto(codigo)
);

-- Datos de prueba (mismos que el prototipo en front)
INSERT INTO cliente (cedula, nombre, telefono) VALUES
('101110111', 'Juan Pérez', '8888-1111'),
('202220222', 'María Solano', '8888-2222');

INSERT INTO categoria (id, nombre) VALUES
(1, 'Alimento'),
(2, 'Producto fresco');

INSERT INTO producto (codigo, nombre, precio, id_categoria) VALUES
('P001', 'Alimento camarón 20kg', 15000, 1),
('P002', 'Camarón entero 1kg', 6500, 2);
