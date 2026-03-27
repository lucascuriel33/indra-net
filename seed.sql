-- ══════════════════════════════════════════════════════════════
-- Indra Net — Datos Iniciales (Español)
-- ══════════════════════════════════════════════════════════════
-- Ejecutar: npx wrangler d1 execute indra-net-db --file=seed.sql --remote

INSERT INTO products (name, slug, description, price, image_url, category, stock, featured) VALUES
('Neural Interface Headset', 'neural-interface-headset',
 'Auricular bio-responsivo con campos de ruido adaptativos. Carcasa de compuesto titanio-grafeno con nodos de retroalimentación háptica en 128 puntos de contacto.',
 24999.00, '', 'Hardware', 15, 1),

('Quantum Thread Cable', 'quantum-thread-cable',
 'Cable de datos superconductor con transferencia de latencia cero. Núcleo de fibra óptica trenzada recubierto en polímero refrigerado por líquido.',
 4999.00, '', 'Accesorios', 50, 0),

('Holographic Display Panel', 'holographic-display-panel',
 'Pantalla volumétrica de 32 pulgadas con resolución 16K por capa. Motor de renderizado de paralaje de tres capas con calibración de seguimiento ocular.',
 89999.00, '', 'Hardware', 8, 1),

('Synaptic Keyboard', 'synaptic-keyboard',
 'Teclado mecánico predictivo con asistencia de enlace neural. Teclas de levitación magnética con fuerza de actuación variable.',
 12999.00, '', 'Periféricos', 25, 1),

('Mesh Network Node', 'mesh-network-node',
 'Baliza de red mesh auto-configurable. Establece canales cifrados peer-to-peer en un radio de 500m sin configuración.',
 7499.00, '', 'Redes', 40, 0),

('Cortex Processing Unit', 'cortex-processing-unit',
 'Procesador neuromórfico de 128 núcleos con refrigeración pasiva de nitrógeno líquido. Optimizado para inferencia paralela y procesamiento de señales en tiempo real.',
 149999.00, '', 'Hardware', 5, 1),

('Photon Mouse', 'photon-mouse',
 'Mouse levitante sin fricción con sensor óptico de 32000 DPI. Incluye base de carga inalámbrica con capa de reconocimiento gestual.',
 8999.00, '', 'Periféricos', 35, 0),

('Dark Matter Power Cell', 'dark-matter-power-cell',
 'Unidad de alimentación portátil de alta densidad con salida sostenida de 72 horas. Matriz de supercapacitores de grafeno con balanceo inteligente de carga.',
 19999.00, '', 'Accesorios', 20, 1);
