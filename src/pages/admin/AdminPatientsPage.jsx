import { useEffect, useMemo, useState } from 'react';
import { CalendarDays, Pencil, Plus, Power, Search } from 'lucide-react';
import { Button } from '../../components/Button.jsx';
import { Card } from '../../components/Card.jsx';
import { DataTable } from '../../components/DataTable.jsx';
import { Input, Select, Textarea } from '../../components/FormControls.jsx';
import { Modal } from '../../components/Modal.jsx';
import { StatusBadge } from '../../components/StatusBadge.jsx';
import { clearSession } from '../../services/auth.service.js';
import {
  createPatient,
  getPatientAppointments,
  getPatients,
  updatePatient,
  updatePatientStatus,
} from '../../services/patients.service.js';

const sexOptions = ['MASCULINO', 'FEMENINO', 'OTRO', 'NO_ESPECIFICADO'];
const emptyForm = {
  nombre: '',
  apellido_paterno: '',
  apellido_materno: '',
  correo: '',
  password: '',
  telefono: '',
  fecha_nacimiento: '',
  sexo: 'NO_ESPECIFICADO',
  direccion: '',
  contacto_emergencia: '',
  telefono_emergencia: '',
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

function getFullName(usuario = {}) {
  return [usuario.nombre, usuario.apellidoPaterno || usuario.apellido_paterno, usuario.apellidoMaterno || usuario.apellido_materno]
    .filter(Boolean)
    .join(' ');
}

function toDateInput(value) {
  if (!value) return '';
  return String(value).slice(0, 10);
}

function formatDate(value) {
  if (!value) return 'N/A';
  return new Intl.DateTimeFormat('es-MX', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date(value));
}

function formatTime(value) {
  if (!value) return 'N/A';
  if (typeof value === 'string' && /^\d{2}:\d{2}/.test(value)) return value.slice(0, 5);
  return new Intl.DateTimeFormat('es-MX', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(new Date(value));
}

export function AdminPatientsPage({ navigate }) {
  const [pacientes, setPacientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [search, setSearch] = useState('');
  const [sexo, setSexo] = useState('');
  const [estado, setEstado] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingPatient, setEditingPatient] = useState(null);
  const [appointmentsModalOpen, setAppointmentsModalOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [patientAppointments, setPatientAppointments] = useState([]);
  const [appointmentsLoading, setAppointmentsLoading] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [formError, setFormError] = useState('');

  async function loadPatients() {
    try {
      setLoading(true);
      setError('');

      const response = await getPatients({
        search: search || undefined,
        sexo: sexo || undefined,
        estado: mapEstadoFilter(estado),
      });

      setPacientes(response.data || []);
    } catch (requestError) {
      if (requestError.status === 401) {
        clearSession();
        navigate('/login');
        return;
      }

      setError(getErrorMessage(requestError, 'No se pudieron cargar los pacientes.'));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadPatients();
  }, []);

  function updateForm(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function openCreateModal() {
    setEditingPatient(null);
    setForm(emptyForm);
    setError('');
    setSuccess('');
    setFormError('');
    setModalOpen(true);
  }

  function openEditModal(paciente) {
    const usuario = paciente.usuario || {};

    setEditingPatient(paciente);
    setForm({
      nombre: usuario.nombre || '',
      apellido_paterno: usuario.apellidoPaterno || usuario.apellido_paterno || '',
      apellido_materno: usuario.apellidoMaterno || usuario.apellido_materno || '',
      correo: usuario.correo || '',
      password: '',
      telefono: usuario.telefono || '',
      fecha_nacimiento: toDateInput(paciente.fechaNacimiento || paciente.fecha_nacimiento),
      sexo: paciente.sexo || 'NO_ESPECIFICADO',
      direccion: paciente.direccion || '',
      contacto_emergencia: paciente.contactoEmergencia || paciente.contacto_emergencia || '',
      telefono_emergencia: paciente.telefonoEmergencia || paciente.telefono_emergencia || '',
      estado: paciente.estado ?? true,
    });
    setError('');
    setSuccess('');
    setFormError('');
    setModalOpen(true);
  }

  function validatePatientForm() {
    const correoValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.correo);

    if (!form.nombre.trim()) return 'El nombre es obligatorio.';
    if (!form.apellido_paterno.trim()) return 'El apellido paterno es obligatorio.';
    if (!form.correo.trim()) return 'El correo es obligatorio.';
    if (!correoValido) return 'El correo no es valido.';
    if (!editingPatient && form.password.length < 8) return 'La contrasena debe tener al menos 8 caracteres.';
    if (!form.sexo) return 'Selecciona el sexo del paciente.';
    return '';
  }

  async function handleSubmitPatient(event) {
    event.preventDefault();
    const validationError = validatePatientForm();

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
        usuario: {
          nombre: form.nombre.trim(),
          apellido_paterno: form.apellido_paterno.trim(),
          apellido_materno: form.apellido_materno.trim() || null,
          correo: form.correo.trim(),
          telefono: form.telefono.trim() || null,
        },
        fecha_nacimiento: form.fecha_nacimiento || null,
        sexo: form.sexo,
        direccion: form.direccion.trim() || null,
        contacto_emergencia: form.contacto_emergencia.trim() || null,
        telefono_emergencia: form.telefono_emergencia.trim() || null,
        estado: form.estado,
      };

      if (editingPatient) {
        await updatePatient(editingPatient.id, payload);
        setSuccess('Paciente actualizado correctamente.');
      } else {
        await createPatient({
          ...payload,
          usuario: {
            ...payload.usuario,
            password: form.password,
          },
        });
        setSuccess('Paciente creado correctamente.');
      }

      setModalOpen(false);
      setEditingPatient(null);
      await loadPatients();
    } catch (requestError) {
      if (requestError.status === 401) {
        clearSession();
        navigate('/login');
        return;
      }

      setFormError(getErrorMessage(requestError, 'No se pudo guardar el paciente.'));
    } finally {
      setSaving(false);
    }
  }

  async function handleToggleStatus(paciente) {
    const nuevoEstado = !paciente.estado;
    const confirmMessage = nuevoEstado
      ? 'Deseas activar este paciente?'
      : 'Deseas inactivar este paciente? Ya no podra iniciar sesion ni agendar citas.';

    if (!window.confirm(confirmMessage)) return;

    try {
      setError('');
      setSuccess('');
      await updatePatientStatus(paciente.id, nuevoEstado);
      setSuccess(nuevoEstado ? 'Paciente activado correctamente.' : 'Paciente inactivado correctamente.');
      await loadPatients();
    } catch (requestError) {
      if (requestError.status === 401) {
        clearSession();
        navigate('/login');
        return;
      }

      setError(getErrorMessage(requestError, 'No se pudo cambiar el estado del paciente.'));
    }
  }

  async function openAppointmentsModal(paciente) {
    try {
      setSelectedPatient(paciente);
      setAppointmentsModalOpen(true);
      setAppointmentsLoading(true);
      setError('');
      setPatientAppointments([]);

      const response = await getPatientAppointments(paciente.id);
      setPatientAppointments(response.data || []);
    } catch (requestError) {
      setError(getErrorMessage(requestError, 'No se pudieron cargar las citas del paciente.'));
    } finally {
      setAppointmentsLoading(false);
    }
  }

  const appointmentColumns = [
    { key: 'folio', label: 'Folio', render: (row) => row.folio || row.id },
    { key: 'fecha', label: 'Fecha', render: (row) => formatDate(row.fecha) },
    { key: 'hora', label: 'Hora', render: (row) => formatTime(row.horaInicio || row.hora_inicio) },
    { key: 'doctor', label: 'Doctor', render: (row) => getFullName(row.doctor?.usuario) || 'Sin doctor' },
    { key: 'especialidad', label: 'Especialidad', render: (row) => row.especialidad?.nombre || row.doctor?.especialidad?.nombre || 'Sin especialidad' },
    { key: 'motivo', label: 'Motivo', render: (row) => row.motivo || 'Sin motivo' },
    { key: 'estado', label: 'Estado', render: (row) => <StatusBadge status={row.estado} /> },
  ];

  const columns = useMemo(
    () => [
      { key: 'nombre', label: 'Nombre completo', render: (row) => getFullName(row.usuario) },
      { key: 'correo', label: 'Correo', render: (row) => row.usuario?.correo || 'Sin correo' },
      { key: 'telefono', label: 'Telefono', render: (row) => row.usuario?.telefono || 'Sin telefono' },
      { key: 'sexo', label: 'Sexo', render: (row) => row.sexo || 'NO_ESPECIFICADO' },
      { key: 'fechaNacimiento', label: 'Fecha nacimiento', render: (row) => formatDate(row.fechaNacimiento || row.fecha_nacimiento) },
      { key: 'estado', label: 'Estado', render: (row) => <StatusBadge status={row.estado ? 'Activo' : 'Inactivo'} /> },
      { key: 'contactoEmergencia', label: 'Contacto emergencia', render: (row) => row.contactoEmergencia || row.contacto_emergencia || 'Sin contacto' },
      {
        key: 'acciones',
        label: 'Acciones',
        render: (row) => (
          <div className="table-actions">
            <button type="button" title="Editar" onClick={() => openEditModal(row)}>
              <Pencil size={16} />
            </button>
            <button type="button" title="Citas" onClick={() => openAppointmentsModal(row)}>
              <CalendarDays size={16} />
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
        <div className="admin-filter-grid patients-filter-grid">
          <Input
            label="Buscar por nombre, correo o telefono"
            placeholder="Nombre, correo o telefono"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
          <Select label="Sexo" placeholder="Todos" options={sexOptions} value={sexo} onChange={(event) => setSexo(event.target.value)} />
          <Select label="Estado" placeholder="Todos" options={['Activo', 'Inactivo']} value={estado} onChange={(event) => setEstado(event.target.value)} />
          <Button onClick={loadPatients} disabled={loading}>
            <Search size={18} />
            Buscar
          </Button>
          <Button onClick={openCreateModal}>
            <Plus size={18} />
            Nuevo paciente
          </Button>
        </div>
      </Card>

      {success && <div className="admin-success-message">{success}</div>}

      {error ? (
        <Card className="dashboard-state-card dashboard-error-card">
          <strong>No se pudieron cargar los pacientes.</strong>
          <span>{error}</span>
          <Button onClick={loadPatients}>Reintentar</Button>
        </Card>
      ) : loading ? (
        <Card className="dashboard-state-card">
          <strong>Cargando pacientes...</strong>
          <span>Consultando pacientes reales del sistema SGH.</span>
        </Card>
      ) : (
        <DataTable columns={columns} rows={pacientes} emptyText="No se encontraron pacientes." />
      )}

      <Modal
        open={modalOpen}
        title={editingPatient ? 'Editar paciente' : 'Nuevo paciente'}
        onClose={() => setModalOpen(false)}
        footer={
          <>
            <Button type="button" variant="ghost" onClick={() => setModalOpen(false)}>Cancelar</Button>
            <Button type="submit" form="admin-patient-form" disabled={saving}>
              {saving ? 'Guardando...' : 'Guardar'}
            </Button>
          </>
        }
      >
        <form id="admin-patient-form" className="admin-form-grid" onSubmit={handleSubmitPatient}>
          <Input label="Nombre" value={form.nombre} onChange={(event) => updateForm('nombre', event.target.value)} />
          <Input label="Apellido paterno" value={form.apellido_paterno} onChange={(event) => updateForm('apellido_paterno', event.target.value)} />
          <Input label="Apellido materno" value={form.apellido_materno} onChange={(event) => updateForm('apellido_materno', event.target.value)} />
          <Input label="Correo" type="email" value={form.correo} onChange={(event) => updateForm('correo', event.target.value)} />
          {!editingPatient && (
            <Input label="Contrasena" type="password" value={form.password} onChange={(event) => updateForm('password', event.target.value)} />
          )}
          <Input label="Telefono" value={form.telefono} onChange={(event) => updateForm('telefono', event.target.value)} />
          <Input label="Fecha de nacimiento" type="date" value={form.fecha_nacimiento} onChange={(event) => updateForm('fecha_nacimiento', event.target.value)} />
          <Select label="Sexo" options={sexOptions} value={form.sexo} onChange={(event) => updateForm('sexo', event.target.value)} />
          <Textarea label="Direccion" className="span-2" value={form.direccion} onChange={(event) => updateForm('direccion', event.target.value)} />
          <Input label="Contacto de emergencia" value={form.contacto_emergencia} onChange={(event) => updateForm('contacto_emergencia', event.target.value)} />
          <Input label="Telefono de emergencia" value={form.telefono_emergencia} onChange={(event) => updateForm('telefono_emergencia', event.target.value)} />
          <Select
            label="Estado"
            options={['Activo', 'Inactivo']}
            value={form.estado ? 'Activo' : 'Inactivo'}
            onChange={(event) => updateForm('estado', event.target.value === 'Activo')}
          />
          {formError && <div className="form-alert span-2" role="alert">{formError}</div>}
        </form>
      </Modal>

      <Modal
        open={appointmentsModalOpen}
        title={`Citas de ${selectedPatient ? getFullName(selectedPatient.usuario) : 'paciente'}`}
        onClose={() => setAppointmentsModalOpen(false)}
        footer={<Button onClick={() => setAppointmentsModalOpen(false)}>Cerrar</Button>}
      >
        {appointmentsLoading ? (
          <p>Cargando citas...</p>
        ) : patientAppointments.length === 0 ? (
          <p>Este paciente aun no tiene citas registradas.</p>
        ) : (
          <DataTable columns={appointmentColumns} rows={patientAppointments} emptyText="Este paciente aun no tiene citas registradas." />
        )}
      </Modal>
    </div>
  );
}
