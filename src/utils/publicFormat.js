export function unwrapData(response) {
  return response?.data ?? response;
}

export function getErrorMessage(error, fallback) {
  return error?.message || fallback;
}

export function fullName(user) {
  if (!user) return 'Sin nombre';
  return [user.nombre, user.apellidoPaterno, user.apellidoMaterno].filter(Boolean).join(' ') || 'Sin nombre';
}

export function initialsFromName(name = '') {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase() || 'DR';
}

export function doctorToCard(doctor) {
  const name = fullName(doctor?.usuario);

  return {
    ...doctor,
    nombre: name,
    iniciales: initialsFromName(name),
    especialidad: doctor?.especialidad?.nombre || 'Sin especialidad',
    cedula: doctor?.cedulaProfesional || doctor?.cedula_profesional || 'Sin cedula',
    disponibilidad: 'consultar agenda',
    estado: doctor?.estado ? 'Disponible hoy' : 'Inactivo',
  };
}

export function getReturnUrl() {
  const params = new URLSearchParams(window.location.search);
  const returnUrl = params.get('returnUrl');
  return returnUrl || '';
}

export function safeReturnUrl(returnUrl) {
  if (!returnUrl || !returnUrl.startsWith('/')) return '';
  if (returnUrl.startsWith('//')) return '';
  return returnUrl;
}
