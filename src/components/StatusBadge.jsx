const labels = {
  confirmada: 'Confirmada',
  pendiente: 'Pendiente',
  cancelada: 'Cancelada',
  completada: 'Completada',
  disponible: 'Disponible hoy',
  pocos: 'Pocos espacios',
  proxima: 'Proxima disponibilidad',
  activo: 'Activo',
  inactivo: 'Inactivo',
  activa: 'Activa',
  inactiva: 'Inactiva',
  reprogramada: 'Reprogramada',
  atendida: 'Atendida',
  noasistio: 'No asistio',
  adminconfirmada: 'Confirmada',
};

const normalizedStatuses = {
  'Disponible hoy': 'disponible',
  'Pocos espacios': 'pocos',
  'Proxima disponibilidad': 'proxima',
  'PrÃ³xima disponibilidad': 'proxima',
  Activo: 'activo',
  Inactivo: 'inactivo',
  Activa: 'activa',
  Inactiva: 'inactiva',
  Pendiente: 'pendiente',
  Confirmada: 'adminconfirmada',
  Cancelada: 'cancelada',
  Reprogramada: 'reprogramada',
  Atendida: 'atendida',
  'No asistio': 'noasistio',
  'No asistiÃ³': 'noasistio',
  PENDIENTE: 'pendiente',
  CONFIRMADA: 'adminconfirmada',
  CANCELADA: 'cancelada',
  REPROGRAMADA: 'reprogramada',
  ATENDIDA: 'atendida',
  NO_ASISTIO: 'noasistio',
};

export function StatusBadge({ status }) {
  const normalized = normalizedStatuses[status] || status;

  return <span className={`badge badge-${normalized}`}>{labels[normalized] || status}</span>;
}
