import { useEffect, useMemo, useState } from 'react';
import { CheckCircle2, Search } from 'lucide-react';
import { Button } from '../../components/Button.jsx';
import { Card } from '../../components/Card.jsx';
import { Input, Select, Textarea } from '../../components/FormControls.jsx';
import { StatusBadge } from '../../components/StatusBadge.jsx';
import { getDoctorAvailability } from '../../services/availability.service.js';
import { createAppointment } from '../../services/appointments.service.js';
import { getDoctorsBySpecialty } from '../../services/doctors.service.js';
import { getPublicSpecialties } from '../../services/specialties.service.js';
import { useAuth } from '../../context/AuthContext.jsx';
import {
  doctorToOption,
  fullName,
  getErrorMessage,
  specialtyToOption,
  unwrapData,
} from '../../utils/patientPanelFormat.js';

const initialForm = {
  especialidad_id: '',
  doctor_id: '',
  fecha: '',
  hora_inicio: '',
  motivo_consulta: '',
};

function validateAppointmentForm(form) {
  if (!form.especialidad_id) return 'Selecciona una especialidad.';
  if (!form.doctor_id) return 'Selecciona un doctor.';
  if (!form.fecha) return 'Selecciona una fecha.';
  if (!form.hora_inicio) return 'Selecciona un horario disponible.';
  if (!form.motivo_consulta.trim()) return 'Escribe el motivo de consulta.';
  return '';
}

export function PatientScheduleAppointment({ navigate }) {
  const { isAuthenticated, user } = useAuth();
  const [especialidades, setEspecialidades] = useState([]);
  const [doctores, setDoctores] = useState([]);
  const [availability, setAvailability] = useState([]);
  const [loading, setLoading] = useState(true);
  const [doctorsLoading, setDoctorsLoading] = useState(false);
  const [availabilityLoading, setAvailabilityLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [form, setForm] = useState(initialForm);

  const specialtyOptions = useMemo(() => especialidades.map(specialtyToOption), [especialidades]);
  const doctorOptions = useMemo(() => doctores.map(doctorToOption), [doctores]);
  const selectedDoctor = useMemo(() => doctores.find((doctor) => doctor.id === form.doctor_id), [doctores, form.doctor_id]);
  const minDate = new Date().toISOString().split('T')[0];

  function getQueryDefaults() {
    const params = new URLSearchParams(window.location.search);
    return {
      especialidad_id: params.get('especialidad') || '',
      doctor_id: params.get('doctor') || '',
      fecha: params.get('fecha') || '',
      hora_inicio: params.get('hora') || '',
    };
  }

  async function loadSpecialties() {
    try {
      setLoading(true);
      setError('');
      const response = await getPublicSpecialties({ estado: true });
      setEspecialidades(unwrapData(response) || []);
      const defaults = getQueryDefaults();
      if (defaults.especialidad_id || defaults.doctor_id || defaults.fecha || defaults.hora_inicio) {
        setForm((current) => ({ ...current, ...defaults }));
        if (defaults.especialidad_id) {
          await loadDoctorsBySpecialty(defaults.especialidad_id);
        }
        if (defaults.doctor_id && defaults.fecha) {
          await loadAvailability(defaults.doctor_id, defaults.fecha, defaults.hora_inicio);
        }
      }
    } catch (requestError) {
      setError(getErrorMessage(requestError, 'No se pudieron cargar las especialidades.'));
    } finally {
      setLoading(false);
    }
  }

  async function loadDoctorsBySpecialty(especialidadId) {
    setDoctorsLoading(true);
    try {
      const response = await getDoctorsBySpecialty(especialidadId);
      setDoctores(unwrapData(response) || []);
    } finally {
      setDoctorsLoading(false);
    }
  }

  useEffect(() => {
    loadSpecialties();
  }, []);

  async function handleSpecialtyChange(especialidadId) {
    setForm((current) => ({
      ...current,
      especialidad_id: especialidadId,
      doctor_id: '',
      fecha: '',
      hora_inicio: '',
    }));
    setAvailability([]);
    setDoctores([]);

    if (!especialidadId) return;

    try {
      setError('');
      await loadDoctorsBySpecialty(especialidadId);
    } catch (requestError) {
      setError(getErrorMessage(requestError, 'No se pudieron cargar los doctores.'));
    }
  }

  function handleDoctorChange(doctorId) {
    setForm((current) => ({
      ...current,
      doctor_id: doctorId,
      fecha: '',
      hora_inicio: '',
    }));
    setAvailability([]);
  }

  async function loadAvailability(doctorId, fecha, preferredHour = '') {
    if (!doctorId) {
      setError('Selecciona un doctor.');
      return;
    }

    if (!fecha) {
      setError('Selecciona una fecha.');
      return;
    }

    try {
      setAvailabilityLoading(true);
      setError('');
      setAvailability([]);
      setForm((current) => ({ ...current, hora_inicio: preferredHour || '' }));
      const response = await getDoctorAvailability(doctorId, fecha);
      const slots = unwrapData(response)?.horariosDisponibles || [];
      setAvailability(slots);
      if (preferredHour && !slots.includes(preferredHour)) {
        setForm((current) => ({ ...current, hora_inicio: '' }));
        setError('El horario seleccionado ya no esta disponible.');
      }
    } catch (requestError) {
      setError(getErrorMessage(requestError, 'No se pudo consultar la disponibilidad.'));
    } finally {
      setAvailabilityLoading(false);
    }
  }

  async function handleLoadAvailability() {
    await loadAvailability(form.doctor_id, form.fecha);
  }

  async function handleSubmitAppointment(event) {
    event.preventDefault();

    if (!isAuthenticated) {
      const returnUrl = `${window.location.pathname}${window.location.search}`;
      navigate(`/login?returnUrl=${encodeURIComponent(returnUrl)}`);
      return;
    }

    if (user?.rol !== 'PACIENTE') {
      setError('Solo los pacientes pueden agendar citas desde esta seccion.');
      return;
    }

    const validationError = validateAppointmentForm(form);

    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setSaving(true);
      setError('');
      setSuccess('');
      await createAppointment({
        doctor_id: form.doctor_id,
        especialidad_id: form.especialidad_id,
        fecha: form.fecha,
        hora_inicio: form.hora_inicio,
        motivo_consulta: form.motivo_consulta.trim(),
      });
      setSuccess('Cita agendada correctamente.');
      setForm(initialForm);
      setDoctores([]);
      setAvailability([]);
    } catch (requestError) {
      setError(getErrorMessage(requestError, 'No se pudo agendar la cita.'));
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="patient-page">
      <section className="page-heading patient-heading">
        <div>
          <span className="eyebrow-light">Portal paciente</span>
          <h1>Agendar cita</h1>
          <p>Selecciona especialidad, doctor, fecha y una hora disponible.</p>
        </div>
        <Button variant="ghost" onClick={() => navigate('/paciente/citas')}>Ver mis citas</Button>
      </section>

      {error && (
        <Card className="dashboard-state-card dashboard-error-card">
          <strong>{error}</strong>
          <Button size="sm" variant="secondary" onClick={loadSpecialties}>Reintentar</Button>
        </Card>
      )}

      {success && (
        <Card className="success-card">
          <CheckCircle2 size={42} />
          <h1>{success}</h1>
          <StatusBadge status="PENDIENTE" />
          <p>La cita queda pendiente hasta confirmacion del hospital.</p>
          <Button onClick={() => navigate('/paciente/citas')}>Ir a mis citas</Button>
        </Card>
      )}

      <Card title="Datos de la cita">
        {loading ? (
          <p className="muted-copy">Cargando informacion...</p>
        ) : (
          <form className="form-stack" onSubmit={handleSubmitAppointment}>
            <div className="admin-filter-grid availability-filter-grid">
              <Select
                label="Especialidad"
                options={specialtyOptions}
                value={form.especialidad_id}
                onChange={(event) => handleSpecialtyChange(event.target.value)}
              />
              <Select
                label="Doctor"
                options={doctorOptions}
                value={form.doctor_id}
                onChange={(event) => handleDoctorChange(event.target.value)}
                disabled={!form.especialidad_id || doctorsLoading}
                placeholder={doctorsLoading ? 'Cargando doctores...' : 'Seleccionar'}
              />
              <Input
                label="Fecha"
                type="date"
                min={minDate}
                value={form.fecha}
                onChange={(event) => {
                  setForm((current) => ({ ...current, fecha: event.target.value, hora_inicio: '' }));
                  setAvailability([]);
                }}
              />
            </div>

            {selectedDoctor && (
              <div className="patient-card">
                <strong>{fullName(selectedDoctor.usuario)}</strong>
                <span>{selectedDoctor.especialidad?.nombre}</span>
                <span>Cedula {selectedDoctor.cedulaProfesional}</span>
                <span>Consultorio {selectedDoctor.consultorio}</span>
              </div>
            )}

            <div className="step-actions">
              <Button type="button" variant="secondary" onClick={handleLoadAvailability} disabled={availabilityLoading}>
                <Search size={17} />
                {availabilityLoading ? 'Consultando...' : 'Consultar disponibilidad'}
              </Button>
            </div>

            <div className="appointment-slots">
              {availabilityLoading ? (
                <p className="muted-copy">Consultando disponibilidad...</p>
              ) : availability.length > 0 ? (
                <div className="time-grid">
                  {availability.map((hora) => (
                    <button
                      key={hora}
                      type="button"
                      className={`time-slot ${form.hora_inicio === hora ? 'is-selected' : ''}`.trim()}
                      onClick={() => setForm((current) => ({ ...current, hora_inicio: hora }))}
                    >
                      {hora}
                    </button>
                  ))}
                </div>
              ) : form.doctor_id && form.fecha ? (
                <p className="muted-copy">No hay horarios disponibles para la fecha seleccionada.</p>
              ) : (
                <p className="muted-copy">Selecciona doctor y fecha para consultar horarios disponibles.</p>
              )}
            </div>

            <Textarea
              label="Motivo de consulta"
              placeholder="Describe brevemente el motivo de tu consulta."
              value={form.motivo_consulta}
              onChange={(event) => setForm((current) => ({ ...current, motivo_consulta: event.target.value }))}
              required
            />

            <div className="appointment-summary">
              <h3>Resumen de cita</h3>
              <dl>
                <div><dt>Especialidad</dt><dd>{especialidades.find((item) => item.id === form.especialidad_id)?.nombre || 'Sin seleccionar'}</dd></div>
                <div><dt>Doctor</dt><dd>{selectedDoctor ? fullName(selectedDoctor.usuario) : 'Sin seleccionar'}</dd></div>
                <div><dt>Fecha</dt><dd>{form.fecha || 'Sin seleccionar'}</dd></div>
                <div><dt>Hora</dt><dd>{form.hora_inicio || 'Sin seleccionar'}</dd></div>
                <div><dt>Estado inicial</dt><dd><StatusBadge status="PENDIENTE" /></dd></div>
              </dl>
            </div>

            <div className="step-actions">
              <Button type="submit" disabled={saving}>{saving ? 'Guardando...' : 'Confirmar cita'}</Button>
              <Button type="button" variant="ghost" onClick={() => setForm(initialForm)}>Limpiar</Button>
            </div>
          </form>
        )}
      </Card>
    </main>
  );
}
