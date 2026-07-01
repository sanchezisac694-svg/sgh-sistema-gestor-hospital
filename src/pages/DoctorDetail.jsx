import { useEffect, useMemo, useState } from 'react';
import { Award, FileBadge, MapPin, Search, Stethoscope } from 'lucide-react';
import { Button } from '../components/Button.jsx';
import { Card } from '../components/Card.jsx';
import { DataTable } from '../components/DataTable.jsx';
import { Input } from '../components/FormControls.jsx';
import { StatusBadge } from '../components/StatusBadge.jsx';
import { getDoctorAvailability } from '../services/availability.service.js';
import { getPublicDoctorById } from '../services/doctors.service.js';
import { getSchedulesByDoctor } from '../services/schedules.service.js';
import { doctorToCard, fullName, getErrorMessage, unwrapData } from '../utils/publicFormat.js';

const dayNames = {
  LUNES: 'Lunes',
  MARTES: 'Martes',
  MIERCOLES: 'Miercoles',
  JUEVES: 'Jueves',
  VIERNES: 'Viernes',
  SABADO: 'Sabado',
  DOMINGO: 'Domingo',
};

function getDoctorIdFromPath() {
  const match = window.location.pathname.match(/^\/doctores\/detalle\/([^/]+)$/);
  return match?.[1] || sessionStorage.getItem('sgh_public_doctor_id') || '';
}

export function DoctorDetail({ navigate }) {
  const [doctor, setDoctor] = useState(null);
  const [horarios, setHorarios] = useState([]);
  const [availability, setAvailability] = useState([]);
  const [fecha, setFecha] = useState('');
  const [loading, setLoading] = useState(true);
  const [availabilityLoading, setAvailabilityLoading] = useState(false);
  const [error, setError] = useState('');
  const doctorId = getDoctorIdFromPath();
  const card = doctor ? doctorToCard(doctor) : null;
  const minDate = new Date().toISOString().split('T')[0];
  const scheduleRows = useMemo(() => horarios.map((horario) => ({
    ...horario,
    dia: dayNames[horario.diaSemana] || horario.diaSemana,
    horario: `${horario.horaInicio} - ${horario.horaFin}`,
    duracion: `${horario.duracionCitaMinutos} min`,
  })), [horarios]);

  async function loadDoctorDetail() {
    if (!doctorId) {
      setError('No se encontro el doctor seleccionado.');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError('');
      const [doctorResponse, scheduleResponse] = await Promise.all([
        getPublicDoctorById(doctorId),
        getSchedulesByDoctor(doctorId),
      ]);
      setDoctor(unwrapData(doctorResponse));
      setHorarios(unwrapData(scheduleResponse) || []);
    } catch (requestError) {
      setError(getErrorMessage(requestError, 'No se pudo cargar el perfil del doctor.'));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadDoctorDetail();
  }, []);

  async function handleCheckAvailability() {
    if (!fecha) {
      setError('Selecciona una fecha.');
      return;
    }

    try {
      setAvailabilityLoading(true);
      setError('');
      setAvailability([]);
      const response = await getDoctorAvailability(doctor.id, fecha);
      setAvailability(unwrapData(response)?.horariosDisponibles || []);
    } catch (requestError) {
      setError(getErrorMessage(requestError, 'No se pudo consultar la disponibilidad.'));
    } finally {
      setAvailabilityLoading(false);
    }
  }

  function scheduleAt(hora = '') {
    navigate(`/agendar-cita?doctor=${doctor.id}&especialidad=${doctor.especialidadId}&fecha=${fecha}&hora=${encodeURIComponent(hora)}`);
  }

  if (loading) {
    return <main className="public-main page-stack"><Card><p className="muted-copy">Cargando informacion...</p></Card></main>;
  }

  return (
    <main className="public-main page-stack">
      <section className="page-heading">
        <span>Perfil medico</span>
        <h1>Detalle del doctor</h1>
        <p>Informacion profesional completa del especialista seleccionado.</p>
      </section>

      {error && (
        <Card className="dashboard-state-card dashboard-error-card">
          <strong>{error}</strong>
          <Button size="sm" variant="secondary" onClick={loadDoctorDetail}>Reintentar</Button>
        </Card>
      )}

      {doctor && (
        <div className="doctor-detail-grid">
          <Card className="doctor-profile-card">
            <div className="doctor-profile-main">
              <div className="doctor-avatar doctor-avatar-large">{card.iniciales}</div>
              <div>
                <StatusBadge status="Disponible hoy" />
                <h1>{fullName(doctor.usuario)}</h1>
                <p>{doctor.especialidad?.nombre}</p>
                <div className="doctor-meta inline">
                  <span><FileBadge size={16} /> Cedula {doctor.cedulaProfesional}</span>
                  <span><MapPin size={16} /> Consultorio {doctor.consultorio}</span>
                </div>
              </div>
            </div>
            <Button onClick={() => scheduleAt()}>Agendar cita</Button>
          </Card>

          <Card title="Biografia profesional">
            <p className="muted-copy">{doctor.biografia || 'Especialista disponible para consulta medica.'}</p>
          </Card>

          <Card title="Horario de atencion">
            <DataTable
              columns={[
                { key: 'dia', label: 'Dia' },
                { key: 'horario', label: 'Horario de atencion' },
                { key: 'duracion', label: 'Duracion cita' },
              ]}
              rows={scheduleRows}
              emptyText="No hay horarios publicados para este doctor."
            />
          </Card>

          <Card title="Consultar disponibilidad">
            <div className="form-stack">
              <Input label="Fecha" type="date" min={minDate} value={fecha} onChange={(event) => setFecha(event.target.value)} />
              <div className="step-actions">
                <Button onClick={handleCheckAvailability} disabled={availabilityLoading}>
                  <Search size={17} />
                  {availabilityLoading ? 'Consultando...' : 'Consultar horarios'}
                </Button>
              </div>
              {availabilityLoading ? (
                <p className="muted-copy">Consultando disponibilidad...</p>
              ) : availability.length > 0 ? (
                <div className="time-grid">
                  {availability.map((hora) => (
                    <button key={hora} type="button" className="time-slot" onClick={() => scheduleAt(hora)}>
                      {hora}
                    </button>
                  ))}
                </div>
              ) : (
                <p className="muted-copy">No hay horarios disponibles para la fecha seleccionada.</p>
              )}
            </div>
          </Card>

          <Card title="Informacion adicional">
            <div className="info-list">
              <span><Stethoscope size={17} /> Especialidad medica: {doctor.especialidad?.nombre}</span>
              <span><MapPin size={17} /> Consultorio: {doctor.consultorio}</span>
              <span><FileBadge size={17} /> Cedula profesional: {doctor.cedulaProfesional}</span>
              <span><Award size={17} /> Atencion hospitalaria SGH</span>
            </div>
          </Card>
        </div>
      )}
    </main>
  );
}
