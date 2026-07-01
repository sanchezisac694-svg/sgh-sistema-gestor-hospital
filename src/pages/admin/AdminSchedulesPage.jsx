import { useEffect, useMemo, useState } from 'react';
import { Pencil, Plus, Power, Search } from 'lucide-react';
import { Button } from '../../components/Button.jsx';
import { Card } from '../../components/Card.jsx';
import { DataTable } from '../../components/DataTable.jsx';
import { Input, Select } from '../../components/FormControls.jsx';
import { Modal } from '../../components/Modal.jsx';
import { StatusBadge } from '../../components/StatusBadge.jsx';
import { getDoctorAvailability } from '../../services/availability.service.js';
import { clearSession } from '../../services/auth.service.js';
import { getDoctors } from '../../services/doctors.service.js';
import {
  createSchedule,
  getSchedules,
  updateSchedule,
  updateScheduleStatus,
} from '../../services/schedules.service.js';

const diasSemana = ['LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES', 'SABADO', 'DOMINGO'];
const emptyForm = {
  doctor_id: '',
  dia_semana: 'LUNES',
  hora_inicio: '08:00',
  hora_fin: '14:00',
  duracion_cita_minutos: 30,
  consultorio: '',
  estado: true,
};

function mapEstadoFilter(value) {
  if (value === 'Activo') return true;
  if (value === 'Inactivo') return false;
  return undefined;
}

function getErrorMessage(error, fallback) {
  return error?.message || fallback;
}

function getDoctorName(doctor = {}) {
  const usuario = doctor.usuario || {};
  return [usuario.nombre, usuario.apellidoPaterno || usuario.apellido_paterno, usuario.apellidoMaterno || usuario.apellido_materno]
    .filter(Boolean)
    .join(' ');
}

function timeToMinutes(time) {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
}

export function AdminSchedulesPage({ navigate }) {
  const [horarios, setHorarios] = useState([]);
  const [doctores, setDoctores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [doctorId, setDoctorId] = useState('');
  const [diaSemana, setDiaSemana] = useState('');
  const [estado, setEstado] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [formError, setFormError] = useState('');
  const [availabilityDoctorId, setAvailabilityDoctorId] = useState('');
  const [availabilityDate, setAvailabilityDate] = useState('');
  const [availability, setAvailability] = useState(null);
  const [availabilityLoading, setAvailabilityLoading] = useState(false);

  async function loadSchedules() {
    try {
      setLoading(true);
      setError('');

      const response = await getSchedules({
        doctor_id: doctorId || undefined,
        dia_semana: diaSemana || undefined,
        estado: mapEstadoFilter(estado),
      });

      setHorarios(response.data || []);
    } catch (requestError) {
      if (requestError.status === 401) {
        clearSession();
        navigate('/login');
        return;
      }

      setError(getErrorMessage(requestError, 'No se pudieron cargar los horarios.'));
    } finally {
      setLoading(false);
    }
  }

  async function loadDoctors() {
    try {
      const response = await getDoctors({ estado: true });
      setDoctores(response.data || []);
    } catch {
      setError('No se pudieron cargar los doctores.');
    }
  }

  useEffect(() => {
    loadSchedules();
    loadDoctors();
  }, []);

  function updateForm(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function openCreateModal() {
    setEditingSchedule(null);
    setForm(emptyForm);
    setError('');
    setSuccess('');
    setFormError('');
    setModalOpen(true);
  }

  function openEditModal(horario) {
    setEditingSchedule(horario);
    setForm({
      doctor_id: horario.doctorId || horario.doctor_id || horario.doctor?.id || '',
      dia_semana: horario.diaSemana || horario.dia_semana || 'LUNES',
      hora_inicio: horario.horaInicio || horario.hora_inicio || '08:00',
      hora_fin: horario.horaFin || horario.hora_fin || '14:00',
      duracion_cita_minutos: horario.duracionCitaMinutos || horario.duracion_cita_minutos || 30,
      consultorio: horario.consultorio || '',
      estado: horario.estado ?? true,
    });
    setError('');
    setSuccess('');
    setFormError('');
    setModalOpen(true);
  }

  function validateScheduleForm() {
    if (!editingSchedule && !form.doctor_id) return 'Selecciona un doctor.';
    if (!form.dia_semana) return 'Selecciona un dia de semana.';
    if (!form.hora_inicio) return 'La hora de inicio es obligatoria.';
    if (!form.hora_fin) return 'La hora fin es obligatoria.';
    if (timeToMinutes(form.hora_fin) <= timeToMinutes(form.hora_inicio)) {
      return 'La hora fin debe ser mayor que la hora inicio.';
    }
    if (!Number(form.duracion_cita_minutos) || Number(form.duracion_cita_minutos) <= 0) {
      return 'La duracion debe ser mayor a cero.';
    }
    return '';
  }

  async function handleSubmitSchedule(event) {
    event.preventDefault();
    const validationError = validateScheduleForm();

    if (validationError) {
      setFormError(validationError);
      return;
    }

    try {
      setSaving(true);
      setError('');
      setSuccess('');
      setFormError('');

      const payload = {
        dia_semana: form.dia_semana,
        hora_inicio: form.hora_inicio,
        hora_fin: form.hora_fin,
        duracion_cita_minutos: Number(form.duracion_cita_minutos),
        consultorio: form.consultorio.trim() || null,
        estado: form.estado,
      };

      if (editingSchedule) {
        await updateSchedule(editingSchedule.id, payload);
        setSuccess('Horario actualizado correctamente.');
      } else {
        await createSchedule({
          ...payload,
          doctor_id: form.doctor_id,
        });
        setSuccess('Horario creado correctamente.');
      }

      setModalOpen(false);
      setEditingSchedule(null);
      await loadSchedules();
    } catch (requestError) {
      if (requestError.status === 401) {
        clearSession();
        navigate('/login');
        return;
      }

      setFormError(getErrorMessage(requestError, 'No se pudo guardar el horario.'));
    } finally {
      setSaving(false);
    }
  }

  async function handleToggleStatus(horario) {
    const nuevoEstado = !horario.estado;
    const confirmMessage = nuevoEstado
      ? 'Deseas activar este horario?'
      : 'Deseas inactivar este horario? Ya no generara disponibilidad.';

    if (!window.confirm(confirmMessage)) return;

    try {
      setError('');
      setSuccess('');
      await updateScheduleStatus(horario.id, nuevoEstado);
      setSuccess(nuevoEstado ? 'Horario activado correctamente.' : 'Horario inactivado correctamente.');
      await loadSchedules();
    } catch (requestError) {
      if (requestError.status === 401) {
        clearSession();
        navigate('/login');
        return;
      }

      setError(getErrorMessage(requestError, 'No se pudo cambiar el estado del horario.'));
    }
  }

  async function handleCheckAvailability(event) {
    event.preventDefault();

    if (!availabilityDoctorId) {
      setError('Selecciona un doctor para consultar disponibilidad.');
      return;
    }

    if (!availabilityDate) {
      setError('Selecciona una fecha.');
      return;
    }

    try {
      setAvailabilityLoading(true);
      setError('');
      setAvailability(null);

      const response = await getDoctorAvailability(availabilityDoctorId, availabilityDate);
      setAvailability(response.data);
    } catch (requestError) {
      setError(getErrorMessage(requestError, 'No se pudo consultar la disponibilidad.'));
    } finally {
      setAvailabilityLoading(false);
    }
  }

  const doctorOptions = doctores.map((doctor) => ({
    label: getDoctorName(doctor) || doctor.usuario?.correo || doctor.id,
    value: doctor.id,
  }));

  const columns = useMemo(
    () => [
      { key: 'doctor', label: 'Doctor', render: (row) => getDoctorName(row.doctor) || 'Sin doctor' },
      { key: 'especialidad', label: 'Especialidad', render: (row) => row.doctor?.especialidad?.nombre || 'Sin especialidad' },
      { key: 'diaSemana', label: 'Dia' },
      { key: 'horaInicio', label: 'Hora inicio' },
      { key: 'horaFin', label: 'Hora fin' },
      { key: 'duracionCitaMinutos', label: 'Duracion', render: (row) => `${row.duracionCitaMinutos || row.duracion_cita_minutos} min` },
      { key: 'consultorio', label: 'Consultorio', render: (row) => row.consultorio || 'Sin consultorio' },
      { key: 'estado', label: 'Estado', render: (row) => <StatusBadge status={row.estado ? 'Activo' : 'Inactivo'} /> },
      {
        key: 'acciones',
        label: 'Acciones',
        render: (row) => (
          <div className="table-actions">
            <button type="button" title="Editar" onClick={() => openEditModal(row)}>
              <Pencil size={16} />
            </button>
            <button type="button" title={row.estado ? 'Inactivar' : 'Activar'} onClick={() => handleToggleStatus(row)}>
              <Power size={16} />
            </button>
          </div>
        ),
      },
    ],
    []
  );

  return (
    <div className="dashboard-stack">
      <Card className="admin-filter-card">
        <div className="admin-filter-grid schedules-filter-grid">
          <Select label="Doctor" placeholder="Todos" options={doctorOptions} value={doctorId} onChange={(event) => setDoctorId(event.target.value)} />
          <Select label="Dia de semana" placeholder="Todos" options={diasSemana} value={diaSemana} onChange={(event) => setDiaSemana(event.target.value)} />
          <Select label="Estado" placeholder="Todos" options={['Activo', 'Inactivo']} value={estado} onChange={(event) => setEstado(event.target.value)} />
          <Button onClick={loadSchedules} disabled={loading}>
            <Search size={18} />
            Buscar
          </Button>
          <Button onClick={openCreateModal}>
            <Plus size={18} />
            Nuevo horario
          </Button>
        </div>
      </Card>

      <Card title="Consultar disponibilidad" subtitle="Consulta espacios por doctor y fecha futura">
        <form className="admin-filter-grid availability-filter-grid" onSubmit={handleCheckAvailability}>
          <Select label="Doctor" placeholder="Seleccionar" options={doctorOptions} value={availabilityDoctorId} onChange={(event) => setAvailabilityDoctorId(event.target.value)} />
          <Input label="Fecha" type="date" value={availabilityDate} onChange={(event) => setAvailabilityDate(event.target.value)} />
          <Button type="submit" disabled={availabilityLoading}>
            {availabilityLoading ? 'Consultando...' : 'Consultar'}
          </Button>
        </form>
        {availability && (
          <div className="availability-card">
            <h3>Disponibilidad</h3>
            <p><strong>Doctor:</strong> {availability.doctor}</p>
            <p><strong>Fecha:</strong> {availability.fecha}</p>
            <p><strong>Dia:</strong> {availability.diaSemana}</p>
            {availability.horariosDisponibles?.length > 0 ? (
              <div className="slots-grid">
                {availability.horariosDisponibles.map((hora) => (
                  <span key={hora} className="slot-badge">{hora}</span>
                ))}
              </div>
            ) : (
              <p>No hay horarios disponibles para esta fecha.</p>
            )}
          </div>
        )}
      </Card>

      {success && <div className="admin-success-message">{success}</div>}

      {error ? (
        <Card className="dashboard-state-card dashboard-error-card">
          <strong>No se pudieron cargar los horarios.</strong>
          <span>{error}</span>
          <Button onClick={loadSchedules}>Reintentar</Button>
        </Card>
      ) : loading ? (
        <Card className="dashboard-state-card">
          <strong>Cargando horarios...</strong>
          <span>Consultando horarios reales del sistema SGH.</span>
        </Card>
      ) : (
        <DataTable columns={columns} rows={horarios} emptyText="No se encontraron horarios." />
      )}

      <Modal
        open={modalOpen}
        title={editingSchedule ? 'Editar horario' : 'Nuevo horario'}
        onClose={() => setModalOpen(false)}
        footer={
          <>
            <Button type="button" variant="ghost" onClick={() => setModalOpen(false)}>Cancelar</Button>
            <Button type="submit" form="admin-schedule-form" disabled={saving}>
              {saving ? 'Guardando...' : 'Guardar'}
            </Button>
          </>
        }
      >
        <form id="admin-schedule-form" className="admin-form-grid" onSubmit={handleSubmitSchedule}>
          {!editingSchedule && (
            <Select
              label="Doctor"
              placeholder="Seleccionar"
              options={doctorOptions}
              value={form.doctor_id}
              onChange={(event) => updateForm('doctor_id', event.target.value)}
            />
          )}
          <Select label="Dia de semana" options={diasSemana} value={form.dia_semana} onChange={(event) => updateForm('dia_semana', event.target.value)} />
          <Input label="Hora inicio" type="time" value={form.hora_inicio} onChange={(event) => updateForm('hora_inicio', event.target.value)} />
          <Input label="Hora fin" type="time" value={form.hora_fin} onChange={(event) => updateForm('hora_fin', event.target.value)} />
          <Input
            label="Duracion de cita en minutos"
            type="number"
            min="1"
            value={form.duracion_cita_minutos}
            onChange={(event) => updateForm('duracion_cita_minutos', event.target.value)}
          />
          <Input label="Consultorio" value={form.consultorio} onChange={(event) => updateForm('consultorio', event.target.value)} />
          <Select
            label="Estado"
            options={['Activo', 'Inactivo']}
            value={form.estado ? 'Activo' : 'Inactivo'}
            onChange={(event) => updateForm('estado', event.target.value === 'Activo')}
          />
          {formError && <div className="form-alert span-2" role="alert">{formError}</div>}
        </form>
      </Modal>
    </div>
  );
}
