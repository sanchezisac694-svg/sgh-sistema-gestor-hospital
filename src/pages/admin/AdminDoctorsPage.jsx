import { useEffect, useMemo, useState } from 'react';
import { Pencil, Plus, Power, Search } from 'lucide-react';
import { Button } from '../../components/Button.jsx';
import { Card } from '../../components/Card.jsx';
import { DataTable } from '../../components/DataTable.jsx';
import { Input, Select, Textarea } from '../../components/FormControls.jsx';
import { Modal } from '../../components/Modal.jsx';
import { StatusBadge } from '../../components/StatusBadge.jsx';
import { clearSession } from '../../services/auth.service.js';
import {
  createDoctor,
  getDoctors,
  updateDoctor,
  updateDoctorStatus,
} from '../../services/doctors.service.js';
import { getSpecialties } from '../../services/specialties.service.js';

const emptyForm = {
  nombre: '',
  apellido_paterno: '',
  apellido_materno: '',
  correo: '',
  password: '',
  telefono: '',
  especialidad_id: '',
  cedula_profesional: '',
  consultorio: '',
  biografia: '',
  foto_url: '',
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

function getCedula(doctor) {
  return doctor.cedulaProfesional || doctor.cedula_profesional || '';
}

function getFotoUrl(doctor) {
  return doctor.fotoUrl || doctor.foto_url || '';
}

export function AdminDoctorsPage({ navigate }) {
  const [doctores, setDoctores] = useState([]);
  const [especialidades, setEspecialidades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [search, setSearch] = useState('');
  const [especialidadId, setEspecialidadId] = useState('');
  const [estado, setEstado] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingDoctor, setEditingDoctor] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [formError, setFormError] = useState('');

  async function loadDoctors() {
    try {
      setLoading(true);
      setError('');

      const response = await getDoctors({
        search: search || undefined,
        especialidad_id: especialidadId || undefined,
        estado: mapEstadoFilter(estado),
      });

      setDoctores(response.data || []);
    } catch (requestError) {
      if (requestError.status === 401) {
        clearSession();
        navigate('/login');
        return;
      }

      setError(getErrorMessage(requestError, 'No se pudieron cargar los doctores.'));
    } finally {
      setLoading(false);
    }
  }

  async function loadSpecialties() {
    try {
      const response = await getSpecialties({ estado: true });
      setEspecialidades(response.data || []);
    } catch {
      setError('No se pudieron cargar las especialidades.');
    }
  }

  useEffect(() => {
    loadDoctors();
    loadSpecialties();
  }, []);

  function updateForm(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function openCreateModal() {
    setEditingDoctor(null);
    setForm(emptyForm);
    setError('');
    setSuccess('');
    setFormError('');
    setModalOpen(true);
  }

  function openEditModal(doctor) {
    const usuario = doctor.usuario || {};

    setEditingDoctor(doctor);
    setForm({
      nombre: usuario.nombre || '',
      apellido_paterno: usuario.apellidoPaterno || usuario.apellido_paterno || '',
      apellido_materno: usuario.apellidoMaterno || usuario.apellido_materno || '',
      correo: usuario.correo || '',
      password: '',
      telefono: usuario.telefono || '',
      especialidad_id: doctor.especialidadId || doctor.especialidad_id || doctor.especialidad?.id || '',
      cedula_profesional: getCedula(doctor),
      consultorio: doctor.consultorio || '',
      biografia: doctor.biografia || '',
      foto_url: getFotoUrl(doctor) || '',
      estado: doctor.estado ?? true,
    });
    setError('');
    setSuccess('');
    setFormError('');
    setModalOpen(true);
  }

  function validateDoctorForm() {
    const correoValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.correo);

    if (!form.nombre.trim()) return 'El nombre es obligatorio.';
    if (!form.apellido_paterno.trim()) return 'El apellido paterno es obligatorio.';
    if (!form.correo.trim()) return 'El correo es obligatorio.';
    if (!correoValido) return 'El correo no es valido.';
    if (!editingDoctor && !form.password.trim()) return 'La contrasena es obligatoria.';
    if (!editingDoctor && form.password.length < 8) return 'La contrasena debe tener al menos 8 caracteres.';
    if (!form.especialidad_id) return 'La especialidad es obligatoria.';
    if (!form.cedula_profesional.trim()) return 'La cedula profesional es obligatoria.';
    if (!form.consultorio.trim()) return 'El consultorio es obligatorio.';

    return '';
  }

  async function handleSubmitDoctor(event) {
    event.preventDefault();
    const validationError = validateDoctorForm();

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
        especialidad_id: form.especialidad_id,
        cedula_profesional: form.cedula_profesional.trim(),
        consultorio: form.consultorio.trim(),
        biografia: form.biografia.trim() || null,
        foto_url: form.foto_url.trim() || null,
        estado: form.estado,
      };

      if (editingDoctor) {
        await updateDoctor(editingDoctor.id, payload);
        setSuccess('Doctor actualizado correctamente.');
      } else {
        await createDoctor({
          ...payload,
          usuario: {
            ...payload.usuario,
            password: form.password,
          },
        });
        setSuccess('Doctor creado correctamente.');
      }

      setModalOpen(false);
      setEditingDoctor(null);
      await loadDoctors();
    } catch (requestError) {
      if (requestError.status === 401) {
        clearSession();
        navigate('/login');
        return;
      }

      setFormError(getErrorMessage(requestError, 'No se pudo guardar el doctor.'));
    } finally {
      setSaving(false);
    }
  }

  async function handleToggleStatus(doctor) {
    const nuevoEstado = !doctor.estado;
    const confirmMessage = nuevoEstado
      ? 'Deseas activar este doctor?'
      : 'Deseas inactivar este doctor? Esto tambien impedira su acceso al sistema.';

    if (!window.confirm(confirmMessage)) return;

    try {
      setError('');
      setSuccess('');
      await updateDoctorStatus(doctor.id, nuevoEstado);
      setSuccess(nuevoEstado ? 'Doctor activado correctamente.' : 'Doctor inactivado correctamente.');
      await loadDoctors();
    } catch (requestError) {
      if (requestError.status === 401) {
        clearSession();
        navigate('/login');
        return;
      }

      setError(getErrorMessage(requestError, 'No se pudo cambiar el estado del doctor.'));
    }
  }

  const specialtyOptions = especialidades.map((especialidad) => ({
    label: especialidad.nombre,
    value: especialidad.id,
  }));

  const columns = useMemo(
    () => [
      { key: 'nombre', label: 'Nombre completo', render: (row) => getFullName(row.usuario) },
      { key: 'correo', label: 'Correo', render: (row) => row.usuario?.correo || 'Sin correo' },
      { key: 'especialidad', label: 'Especialidad', render: (row) => row.especialidad?.nombre || 'Sin especialidad' },
      { key: 'cedula', label: 'Cedula profesional', render: getCedula },
      { key: 'consultorio', label: 'Consultorio' },
      { key: 'telefono', label: 'Telefono', render: (row) => row.usuario?.telefono || 'Sin telefono' },
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
        <div className="admin-filter-grid doctors-admin-filter-grid">
          <Input
            label="Buscar por nombre, correo o cedula"
            placeholder="Nombre, correo o cedula"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
          <Select
            label="Especialidad"
            placeholder="Todas"
            options={specialtyOptions}
            value={especialidadId}
            onChange={(event) => setEspecialidadId(event.target.value)}
          />
          <Select
            label="Estado"
            placeholder="Todos"
            options={['Activo', 'Inactivo']}
            value={estado}
            onChange={(event) => setEstado(event.target.value)}
          />
          <Button onClick={loadDoctors} disabled={loading}>
            <Search size={18} />
            Buscar
          </Button>
          <Button onClick={openCreateModal}>
            <Plus size={18} />
            Nuevo doctor
          </Button>
        </div>
      </Card>

      {success && <div className="admin-success-message">{success}</div>}

      {error ? (
        <Card className="dashboard-state-card dashboard-error-card">
          <strong>No se pudieron cargar los doctores.</strong>
          <span>{error}</span>
          <Button onClick={loadDoctors}>Reintentar</Button>
        </Card>
      ) : loading ? (
        <Card className="dashboard-state-card">
          <strong>Cargando doctores...</strong>
          <span>Consultando doctores reales del sistema SGH.</span>
        </Card>
      ) : (
        <DataTable columns={columns} rows={doctores} emptyText="No se encontraron doctores." />
      )}

      <Modal
        open={modalOpen}
        title={editingDoctor ? 'Editar doctor' : 'Nuevo doctor'}
        onClose={() => setModalOpen(false)}
        footer={
          <>
            <Button type="button" variant="ghost" onClick={() => setModalOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" form="admin-doctor-form" disabled={saving}>
              {saving ? 'Guardando...' : 'Guardar'}
            </Button>
          </>
        }
      >
        <form id="admin-doctor-form" className="admin-form-grid doctor-form-grid" onSubmit={handleSubmitDoctor}>
          <Input label="Nombre" value={form.nombre} onChange={(event) => updateForm('nombre', event.target.value)} />
          <Input
            label="Apellido paterno"
            value={form.apellido_paterno}
            onChange={(event) => updateForm('apellido_paterno', event.target.value)}
          />
          <Input
            label="Apellido materno"
            value={form.apellido_materno}
            onChange={(event) => updateForm('apellido_materno', event.target.value)}
          />
          <Input label="Correo" type="email" value={form.correo} onChange={(event) => updateForm('correo', event.target.value)} />
          {!editingDoctor && (
            <Input
              label="Contrasena"
              type="password"
              value={form.password}
              onChange={(event) => updateForm('password', event.target.value)}
            />
          )}
          <Input label="Telefono" value={form.telefono} onChange={(event) => updateForm('telefono', event.target.value)} />
          <Select
            label="Especialidad"
            placeholder="Seleccionar"
            options={specialtyOptions}
            value={form.especialidad_id}
            onChange={(event) => updateForm('especialidad_id', event.target.value)}
          />
          <Input
            label="Cedula profesional"
            value={form.cedula_profesional}
            onChange={(event) => updateForm('cedula_profesional', event.target.value)}
          />
          <Input label="Consultorio" value={form.consultorio} onChange={(event) => updateForm('consultorio', event.target.value)} />
          <Input label="Foto URL" value={form.foto_url} onChange={(event) => updateForm('foto_url', event.target.value)} />
          <Textarea
            label="Biografia"
            className="span-2"
            value={form.biografia}
            onChange={(event) => updateForm('biografia', event.target.value)}
          />
          <Select
            label="Estado"
            options={['Activo', 'Inactivo']}
            value={form.estado ? 'Activo' : 'Inactivo'}
            onChange={(event) => updateForm('estado', event.target.value === 'Activo')}
          />
          {formError && (
            <div className="form-alert span-2" role="alert">
              {formError}
            </div>
          )}
        </form>
      </Modal>
    </div>
  );
}
