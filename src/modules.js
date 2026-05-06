export const ADMIN_MENU = [
  'Dashboard',
  'Clientes',
  'Cuentas trading',
  'Depositos',
  'Retiros',
  'Creditos / Bonos',
  'Operaciones',
  'CRM',
  'Riesgo',
  'Reportes',
  'Configuracion',
  'Usuarios admin',
  'Auditoria'
];

export const MODULES = {
  Dashboard: ['Clientes activos', 'Solicitudes pendientes', 'Operaciones abiertas', 'Actividad reciente'],
  Clientes: ['Crear cliente', 'Editar datos basicos', 'KYC', 'Estado del cliente', 'Historial', 'IP y dispositivo', 'Asignar asesor'],
  'Cuentas trading': ['Balance', 'Equidad', 'Margen', 'Margen libre', 'Apalancamiento', 'Estado de cuenta'],
  Depositos: ['Solicitudes pendientes', 'Monto', 'Metodo de pago', 'Aprobar', 'Rechazar', 'Historial'],
  Retiros: ['Solicitudes pendientes', 'Cuenta destino', 'Metodo de pago', 'Motivo', 'Aprobar', 'Rechazar'],
  'Creditos / Bonos': ['Crear credito', 'Crear bono', 'Asignar a cuenta', 'Condiciones', 'Fecha de expiracion'],
  Operaciones: ['Abiertas', 'Cerradas', 'Simbolo', 'Lotes', 'Precio', 'Resultado'],
  CRM: ['Pipeline', 'Seguimientos', 'Notas', 'Asesor', 'Proxima llamada'],
  Riesgo: ['Nivel de margen', 'Exposicion', 'Stop-out', 'Alertas'],
  Reportes: ['Depositos', 'Retiros', 'Volumen', 'Actividad'],
  Configuracion: ['Parametros', 'Mercados', 'Metodos de pago', 'Mensajes'],
  'Usuarios admin': ['Crear admin', 'Permisos', 'Rol', 'Estado'],
  Auditoria: ['Cambios', 'Usuario', 'Fecha', 'Accion']
};
