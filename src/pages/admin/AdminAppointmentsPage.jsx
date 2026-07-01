import { useEffect, useMemo, useState } from 'react';
import { CalendarClock, Check, Eye, Plus, RotateCcw, Search, X } from 'lucide-react';
import { Button } from '../../components/Button.jsx';
import { Card } from '../../components/Card.jsx';
import { DataTable } from '../../components/DataTable.jsx';
import { Input, Select, Textarea } from '../../components/FormControls.jsx';
import { Modal } from '../../components/Modal.jsx';
import { StatusBadge } from '../../components/StatusBadge.jsx';
import { getDoctorAvailability } from '../../services/availability.service.js';
import {
  cancelAppointment,
  confirmAppointment,
  createAppointment,
  getAppointmentById,
  getAppointments,
  rescheduleAppointment,
} from '../../services/appointments.service.js';
import { clearSession } from '../../services/auth.service.js';
import { getDoctors } from '../../services/doctors.service.js';
import { getPatients } from '../../services/patients.service.js';
import { getSpecialties } from '../../services/specialties.service.js';

const appointmentStates = ['PENDIENTE', 'CONFIRMADA', 'CANCELADA', 'REPROGRAMADA', 'ATENDIDA', 'NO_ASISTIO'];
const emptyForm = {
  paciente_id: '',
  doctor_id: '',
  especialidad_id: '',
  fecha: '',
  hora_inicio: '',
  motivo_consulta: '',
  observaciones_admin: '',
};
const emptyRescheduleForm = {
  nueva_fecha: '',
  nueva_hora_inicio: '',
  comentario: '',
};

function getFullName(usuario = {}) {
  return [usuario.nombre, usuario.apellidoPaterno || usuario.apellido_paterno, usuario.apellidoMaterno || usuario.apellido_materno]
    .filter(Boolean)
    .join(' ');
}

function getPatientName(paciente) {
  return getFullName(paciente?.usuario) || paciente?.usuario?.correo || 'Sin paciente';
}

function getDoctorName(doctor) {
  return getFullName(doctor?.usuario) || doctor?.usuario?.correo || 'Sin doctor';
}

function getErrorMessage(error, fallback) {
  return error?.message || fallback;
}

function canConfirm(estado) {
  return estado === 'PENDIENTE' || estado === 'REPROGRAMADA';
}

function canCancel(estado) {
  return !['CANCELADA', 'ATENDIDA', 'NO_ASISTIO'].includes(estado);
}

function canReschedule(estado) {
  return !['CANCELADA', 'ATENDIDA', 'NO_ASISTIO'].includes(estado);
}

export function AdminAppointmentsPage({ navigate }) {
  const [citas, setCitas] = useState([]);
  const [pacientes, setPacientes] = useState([]);
  const [doctores, setDoctores] = useState([]);
  const [especialidades, setEspecialidades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [search, setSearch] = useState('');
  const [doctorId, setDoctorId] = useState('');
  const [pacienteId, setPacienteId] = useState('');
  const [especialidadId, setEspecialidadId] = useState('');
  const [estado, setEstado] = useState('');
  const [fecha, setFecha] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [rescheduleModalOpen, setRescheduleModalOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [availability, setAvailability] = useState([]);
  const [availabilityLoading, setAvailabilityLoading] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [formError, setFormError] = useState('');
  const [rescheduleForm, setRescheduleForm] = useState(emptyRescheduleForm);
  const [rescheduleError, setRescheduleError] = useState('');

  async function loadAppointments() {
    try {
      setLoading(true);
      setError('');

      const response = await getAppointments({
        search: search || undefined,
        doctor_id: doctorId || undefined,
        paciente_id: pacienteId || undefined,
        especialidad_id: especialidadId || undefined,
        estado: estado || undefined,
        fecha: fecha || undefined,
      });

      setCitas(response.data || []);
    } catch (requestError) {
      if (requestError.status === 401) {
        clearSession();
        navigate('/login');
        return;
      }

      setError(getErrorMessage(requestError, 'No se pudieron cargar las citas.'));
    } finally {
      setLoading(false);
    }
  }

  async function loadInitialCatalogs() {
    try {
      const [patientsResponse, doctorsResponse, specialtiesResponse] = await Promise.all([
        getPatients({ estado: true }),
        getDoctors({ estado: true }),
        getSpecialties({ estado: true }),
      ]);

      setPacientes(patientsResponse.data || []);
      setDoctores(doctorsResponse.data || []);
      setEspecialidades(specialtiesResponse.data || []);
    } catch {
      setError('No se pudieron cargar pacientes, doctores o especialidades.');
    }
  }

  useEffect(() => {
    loadAppointments();
    loadInitialCatalogs();
  }, []);

  function updateForm(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function updateAppointmentDoctorOrDate(field, value) {
    setForm((current) => ({ ...current, [field]: value, hora_inicio: '' }));
    setAvailability([]);
  }

  function openCreateModal() {
    setForm(emptyForm);
    setAvailability([]);
    setError('');
    setSuccess('');
    setFormError('');
    setModalOpen(true);
  }

  function validateAppointmentForm() {
    if (!form.paciente_id) return 'Selecciona un paciente.';
    if (!form.especialidad_id) return 'Selecciona una especialidad.';
    if (!form.doctor_id) return 'Selecciona un doctor.';
    if (!form.fecha) return 'Selecciona una fecha.';
    if (!form.hora_inicio) return 'Selecciona un horario disponible.';
    if (!form.motivo_consulta.trim()) return 'El motivo de consulta es obligatorio.';
    return '';
  }

  async function handleLoadAvailability() {
    if (!form.doctor_id) {
      setFormError('Selecciona un doctor.');
      return;
    }

    if (!form.fecha) {
      setFormError('Selecciona una fecha.');
      return;
    }

    try {
      setAvailabilityLoading(true);
      setFormError('');
      setAvailability([]);
      const response = await getDoctorAvailability(form.doctor_id, form.fecha);
      setAvailability(response.data?.horariosDisponibles || []);
    } catch (requestError) {
      setFormError(getErrorMessage(requestError, 'No se pudo consultar la disponibilidad.'));
    } finally {
      setAvailabilityLoading(false);
    }
  }

  async function handleSubmitAppointment(event) {
    event.preventDefault();
    const validationError = validateAppointmentForm();

    if (validationError) {
      setFormError(validationError);
      return;
    }

    try {
      setSaving(true);
      setError('');
      setSuccess('');
      setFormError('');

      await createAppointment({
        paciente_id: form.paciente_id,
        doctor_id: form.doctor_id,
        especialidad_id: form.especialidad_id,
        fecha: form.fecha,
        hora_inicio: form.hora_inicio,
        motivo_consulta: form.motivo_consulta.trim(),
        observaciones_admin: form.observaciones_admin.trim() || null,
      });

      setSuccess('Cita creada correctamente.');
      setModalOpen(false);
      await loadAppointments();
    } catch (requestError) {
      setFormError(getErrorMessage(requestError, 'No se pudo crear la cita.'));
    } finally {
      setSaving(false);
    }
  }

  async function openDetailModal(cita) {
    try {
      setError('');
      const response = await getAppointmentById(cita.id);
      setSelectedAppointment(response.data);
      setDetailModalOpen(true);
    } catch (requestError) {
      setError(getErrorMessage(requestError, 'No se pudo cargar el detalle de la cita.'));
    }
  }

  async function handleConfirm(cita) {
    if (!window.confirm('Deseas confirmar esta cita?')) return;

    try {
      setError('');
      setSuccess('');
      await confirmAppointment(cita.id, 'Cita confirmada desde administracion.');
      setSuccess('Cita confirmada correctamente.');
      await loadAppointments();
    } catch (requestError) {
      setError(getErrorMessage(requestError, 'No se pudo confirmar la cita.'));
    }
  }

  async function handleCancel(cita) {
    const motivo = window.prompt('Escribe el motivo de cancelacion:');
    if (!motivo || !motivo.trim()) return;

    try {
      setError('');
      setSuccess('');
      await cancelAppointment(cita.id, motivo.trim());
      setSuccess('Cita cancelada correctamente.');
      await loadAppointments();
    } catch (requestError) {
      setError(getErrorMessage(requestError, 'No se pudo cancelar la cita.'));
    }
  }

  function openRescheduleModal(cita) {
    setSelectedAppointment(cita);
    setRescheduleForm(emptyRescheduleForm);
    setAvailability([]);
    setError('');
    setRescheduleError('');
    setRescheduleModalOpen(true);
  }

  async function handleLoadRescheduleAvailability() {
    const doctorIdForAppointment = selectedAppointment?.doctor?.id || selectedAppointment?.doctorId || selectedAppointment?.doctor_id;

    if (!doctorIdForAppointment) {
      setRescheduleError('No se encontro el doctor de la cita.');
      return;
    }

    if (!rescheduleForm.nueva_fecha) {
      setRescheduleError('Selecciona la nueva fecha.');
      return;
    }

    try {
      setAvailabilityLoading(true);
      setRescheduleError('');
      setAvailability([]);
      const response = await getDoctorAvailability(doctorIdForAppointment, rescheduleForm.nueva_fecha);
      setAvailability(response.data?.horariosDisponibles || []);
    } catch (requestError) {
      setRescheduleError(getErrorMessage(requestError, 'No se pudo consultar la disponibilidad.'));
    } finally {
      setAvailabilityLoading(false);
    }
  }

  async function handleSubmitReschedule(event) {
    event.preventDefault();

    if (!selectedAppointment) return;
    if (!rescheduleForm.nueva_fecha) {
      setRescheduleError('Selecciona la nueva fecha.');
      return;
    }
    if (!rescheduleForm.nueva_hora_inicio) {
      setRescheduleError('Selecciona la nueva hora.');
      return;
    }

    try {
      setSaving(true);
      setError('');
      setSuccess('');
      setRescheduleError('');

      await rescheduleAppointment(selectedAppointment.id, {
        nueva_fecha: rescheduleForm.nueva_fecha,
        nueva_hora_inicio: rescheduleForm.nueva_hora_inicio,
        comentario: rescheduleForm.comentario.trim() || null,
      });

      setSuccess('Cita reprogramada correctamente.');
      setRescheduleModalOpen(false);
      setSelectedAppointment(null);
      await loadAppointments();
    } catch (requestError) {
      setRescheduleError(getErrorMessage(requestError, 'No se pudo reprogramar la cita.'));
    } finally {
      setSaving(false);
    }
  }

  function clearFilters() {
    setSearch('');
    setDoctorId('');
    setPacienteId('');
    setEspecialidadId('');
    setEstado('');
    setFecha('');
  }

  const patientOptions = pacientes.map((paciente) => ({ label: getPatientName(paciente), value: paciente.id }));
  const doctorOptions = doctores.map((doctor) => ({ label: getDoctorName(doctor), value: doctor.id }));
  const specialtyOptions = especialidades.map((especialidad) => ({ label: especialidad.nombre, value: especialidad.id }));
  const filteredDoctors = form.especialidad_id
    ? doctores.filter((doctor) => (doctor.especialidadId || doctor.especialidad_id || doctor.especialidad?.id) === form.especialidad_id)
    : doctores;
  const filteredDoctorOptions = filteredDoctors.map((doctor) => ({ label: getDoctorName(doctor), value: doctor.id }));

  const columns = useMemo(
    () => [
      { key: 'folio', label: 'Folio' },
      { key: 'paciente', label: 'Paciente', render: (row) => getPatientName(row.paciente) },
      { key: 'doctor', label: 'Doctor', render: (row) => getDoctorName(row.doctor) },
      { key: 'especialidad', label: 'Especialidad', render: (row) => row.especialidad?.nombre || row.doctor?.especialidad?.nombre || 'Sin especialidad' },
      { key: 'fecha', label: 'Fecha' },
      { key: 'horaInicio', label: 'Hora' },
      { key: 'motivoConsulta', label: 'Motivo', render: (row) => row.motivoConsulta || row.motivo_consulta || 'Sin motivo' },
      { key: 'estado', label: 'Estado', render: (row) => <StatusBadge status={row.estado} /> },
      {
        key: 'acciones',
        label: 'Acciones',
        render: (row) => (
          <div className="table-actions appointments-actions">
            <button type="button" title="Ver" onClick={() => openDetailModal(row)}><Eye size={16} /></button>
            {canConfirm(row.estado) && <button type="button" title="Confirmar" onClick={() => handleConfirm(row)}><Check size={16} /></button>}
            {canReschedule(row.estado) && <button type="button" title="Reprogramar" onClick={() => openRescheduleModal(row)}><RotateCcw size={16} /></button>}
            {canCancel(row.estado) && <button type="button" title="Cancelar" onClick={() => handleCancel(row)}><X size={16} /></button>}
          </div>
        ),
      },
    ],
    []
  );

  return (
    <div className="dashboard-stack">
      <Card className="admin-filter-card">
        <div className="admin-filter-grid appointments-filter-grid">
          <Input label="Buscar" placeholder="Folio, paciente, doctor o motivo" value={search} onChange={(event) => setSearch(event.target.value)} />
          <Select label="Paciente" placeholder="Todos" options={patientOptions} value={pacienteId} onChange={(event) => setPacienteId(event.target.value)} />
          <Select label="Doctor" placeholder="Todos" options={doctorOptions} value={doctorId} onChange={(event) => setDoctorId(event.target.value)} />
          <Select label="Especialidad" placeholder="Todas" options={specialtyOptions} value={especialidadId} onChange={(event) => setEspecialidadId(event.target.value)} />
          <Select label="Estado" placeholder="Todos" options={appointmentStates} value={estado} onChange={(event) => setEstado(event.target.value)} />
          <Input label="Fecha" type="date" value={fecha} onChange={(event) => setFecha(event.target.value)} />
          <Button onClick={loadAppointments} disabled={loading}><Search size={18} />Buscar</Button>
          <Button variant="secondary" onClick={clearFilters}>Limpiar filtros</Button>
          <Button onClick={openCreateModal}><Plus size={18} />Nueva cita</Button>
        </div>
      </Card>

      {success && <div className="admin-success-message">{success}</div>}

      {error ? (
        <Card className="dashboard-state-card dashboard-error-card">
          <strong>No se pudieron cargar las citas.</strong>
          <span>{error}</span>
          <Button onClick={loadAppointments}>Reintentar</Button>
        </Card>
      ) : loading ? (
        <Card className="dashboard-state-card">
          <strong>Cargando citas...</strong>
          <span>Consultando citas reales del sistema SGH.</span>
        </Card>
      ) : (
        <DataTable columns={columns} rows={citas} emptyText="No se encontraron citas." />
      )}

      <Modal
        open={modalOpen}
        title="Nueva cita"
        onClose={() => setModalOpen(false)}
        footer={
          <>
            <Button type="button" variant="ghost" onClick={() => setModalOpen(false)}>Cancelar</Button>
            <Button type="submit" form="admin-appointment-form" disabled={saving}>{saving ? 'Guardando...' : 'Guardar'}</Button>
          </>
        }
      >
        <form id="admin-appointment-form" className="admin-form-grid" onSubmit={handleSubmitAppointment}>
          <Select label="Paciente" placeholder="Seleccionar" options={patientOptions} value={form.paciente_id} onChange={(event) => updateForm('paciente_id', event.target.value)} />
          <Select
            label="Especialidad"
            placeholder="Seleccionar"
            options={specialtyOptions}
            value={form.especialidad_id}
            onChange={(event) => {
              updateForm('especialidad_id', event.target.value);
              updateAppointmentDoctorOrDate('doctor_id', '');
            }}
          />
          <Select label="Doctor" placeholder="Seleccionar" options={filteredDoctorOptions} value={form.doctor_id} onChange={(event) => updateAppointmentDoctorOrDate('doctor_id', event.target.value)} />
          <Input label="Fecha" type="date" value={form.fecha} onChange={(event) => updateAppointmentDoctorOrDate('fecha', event.target.value)} />
          <div className="span-2">
            <Button type="button" variant="secondary" onClick={handleLoadAvailability} disabled={availabilityLoading}>
              {availabilityLoading ? 'Consultando...' : 'Consultar disponibilidad'}
            </Button>
            <div className="slots-grid appointment-slots">
              {availability.length > 0 ? (
                availability.map((hora) => (
                  <button
                    key={hora}
                    type="button"
                    className={`slot-button ${form.hora_inicio === hora ? 'is-active' : ''}`}
                    onClick={() => updateForm('hora_inicio', hora)}
                  >
                    {hora}
                  </button>
                ))
              ) : (
                <span className="muted-copy">Selecciona doctor y fecha para consultar disponibilidad.</span>
              )}
            </div>
          </div>
          <Textarea label="Motivo de consulta" className="span-2" value={form.motivo_consulta} onChange={(event) => updateForm('motivo_consulta', event.target.value)} />
          <Textarea label="Observaciones administrativas" className="span-2" value={form.observaciones_admin} onChange={(event) => updateForm('observaciones_admin', event.target.value)} />
          {formError && <div className="form-alert span-2" role="alert">{formError}</div>}
        </form>
      </Modal>

      <Modal
        open={detailModalOpen}
        title="Detalle de cita"
        onClose={() => setDetailModalOpen(false)}
        footer={<Button onClick={() => setDetailModalOpen(false)}>Cerrar</Button>}
      >
        {selectedAppointment && (
          <div className="detail-list">
            <div><span>Folio</span><strong>{selectedAppointment.folio}</strong></div>
            <div><span>Paciente</span><strong>{getPatientName(selectedAppointment.paciente)}</strong></div>
            <div><span>Correo paciente</span><strong>{selectedAppointment.paciente?.usuario?.correo || 'N/A'}</strong></div>
            <div><span>Telefono paciente</span><strong>{selectedAppointment.paciente?.usuario?.telefono || 'N/A'}</strong></div>
            <div><span>Doctor</span><strong>{getDoctorName(selectedAppointment.doctor)}</strong></div>
            <div><span>Especialidad</span><strong>{selectedAppointment.especialidad?.nombre || 'N/A'}</strong></div>
            <div><span>Fecha</span><strong>{selectedAppointment.fecha}</strong></div>
            <div><span>Hora inicio</span><strong>{selectedAppointment.horaInicio}</strong></div>
            <div><span>Hora fin</span><strong>{selectedAppointment.horaFin}</strong></div>
            <div><span>Motivo</span><strong>{selectedAppointment.motivoConsulta}</strong></div>
            <div><span>Estado</span><strong>{selectedAppointment.estado}</strong></div>
            <div><span>Observaciones administrativas</span><strong>{selectedAppointment.observacionesAdmin || 'Sin observaciones'}</strong></div>
          </div>
        )}
      </Modal>

      <Modal
        open={rescheduleModalOpen}
        title="Reprogramar cita"
        onClose={() => setRescheduleModalOpen(false)}
        footer={
          <>
            <Button type="button" variant="ghost" onClick={() => setRescheduleModalOpen(false)}>Cancelar</Button>
            <Button type="submit" form="admin-reschedule-form" disabled={saving}>{saving ? 'Guardando...' : 'Guardar'}</Button>
          </>
        }
      >
        <form id="admin-reschedule-form" className="admin-form-grid" onSubmit={handleSubmitReschedule}>
          <Input
            label="Nueva fecha"
            type="date"
            value={rescheduleForm.nueva_fecha}
            onChange={(event) => {
              setRescheduleForm((current) => ({ ...current, nueva_fecha: event.target.value, nueva_hora_inicio: '' }));
              setAvailability([]);
            }}
          />
          <Button type="button" variant="secondary" onClick={handleLoadRescheduleAvailability} disabled={availabilityLoading}>
            {availabilityLoading ? 'Consultando...' : 'Consultar disponibilidad'}
          </Button>
          <div className="span-2">
            <div className="slots-grid appointment-slots">
              {availability.length > 0 ? (
                availability.map((hora) => (
                  <button
                    key={hora}
                    type="button"
                    className={`slot-button ${rescheduleForm.nueva_hora_inicio === hora ? 'is-active' : ''}`}
                    onClick={() => setRescheduleForm((current) => ({ ...current, nueva_hora_inicio: hora }))}
                  >
                    {hora}
                  </button>
                ))
              ) : (
                <span className="muted-copy">Selecciona fecha para consultar disponibilidad.</span>
              )}
            </div>
          </div>
          <Textarea label="Comentario" className="span-2" value={rescheduleForm.comentario} onChange={(event) => setRescheduleForm((current) => ({ ...current, comentario: event.target.value }))} />
          {rescheduleError && <div className="form-alert span-2" role="alert">{rescheduleError}</div>}
        </form>
      </Modal>
    </div>
  );
}
