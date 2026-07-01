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
  createSpecialty,
  getSpecialties,
  updateSpecialty,
  updateSpecialtyStatus,
} from '../../services/specialties.service.js';

const emptyForm = {
  nombre: '',
  descripcion: '',
  estado: true,
};

function mapEstadoFilter(value) {
  if (value === 'Activo') return true;
  if (value === 'Inactivo') return false;
  return undefined;
}

function formatDate(value) {
  if (!value) return 'N/A';
  return new Intl.DateTimeFormat('es-MX', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date(value));
}

function getErrorMessage(error, fallback) {
  return error?.message || fallback;
}

export function AdminSpecialtiesPage({ navigate }) {
  const [especialidades, setEspecialidades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [search, setSearch] = useState('');
  const [estado, setEstado] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingSpecialty, setEditingSpecialty] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [formError, setFormError] = useState('');

  async function loadSpecialties() {
    try {
      setLoading(true);
      setError('');

      const response = await getSpecialties({
        search: search || undefined,
        estado: mapEstadoFilter(estado),
      });

      setEspecialidades(response.data || []);
    } catch (requestError) {
      if (requestError.status === 401) {
        clearSession();
        navigate('/login');
        return;
      }

      setError(getErrorMessage(requestError, 'No se pudieron cargar las especialidades.'));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadSpecialties();
  }, []);

  function updateForm(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function openCreateModal() {
    setEditingSpecialty(null);
    setForm(emptyForm);
    setError('');
    setSuccess('');
    setFormError('');
    setModalOpen(true);
  }

  function openEditModal(especialidad) {
    setEditingSpecialty(especialidad);
    setForm({
      nombre: especialidad.nombre || '',
      descripcion: especialidad.descripcion || '',
      estado: especialidad.estado ?? true,
    });
    setError('');
    setSuccess('');
    setFormError('');
    setModalOpen(true);
  }

  function validateForm() {
    if (!form.nombre.trim()) return 'El nombre de la especialidad es obligatorio.';
    if (form.nombre.trim().length < 2) return 'El nombre debe tener al menos 2 caracteres.';
    return '';
  }

  async function handleSubmitSpecialty(event) {
    event.preventDefault();
    const validationMessage = validateForm();

    if (validationMessage) {
      setFormError(validationMessage);
      return;
    }

    try {
      setSaving(true);
      setError('');
      setSuccess('');
      setFormError('');

      const payload = {
        nombre: form.nombre.trim(),
        descripcion: form.descripcion.trim() || null,
        estado: form.estado,
      };

      if (editingSpecialty) {
        await updateSpecialty(editingSpecialty.id, payload);
        setSuccess('Especialidad actualizada correctamente.');
      } else {
        await createSpecialty(payload);
        setSuccess('Especialidad creada correctamente.');
      }

      setModalOpen(false);
      setEditingSpecialty(null);
      await loadSpecialties();
    } catch (requestError) {
      if (requestError.status === 401) {
        clearSession();
        navigate('/login');
        return;
      }

      setFormError(getErrorMessage(requestError, 'No se pudo guardar la especialidad.'));
    } finally {
      setSaving(false);
    }
  }

  async function handleToggleStatus(especialidad) {
    const nuevoEstado = !especialidad.estado;
    const confirmMessage = nuevoEstado
      ? 'Deseas activar esta especialidad?'
      : 'Deseas inactivar esta especialidad?';

    if (!window.confirm(confirmMessage)) return;

    try {
      setError('');
      setSuccess('');
      await updateSpecialtyStatus(especialidad.id, nuevoEstado);
      setSuccess(nuevoEstado ? 'Especialidad activada correctamente.' : 'Especialidad inactivada correctamente.');
      await loadSpecialties();
    } catch (requestError) {
      if (requestError.status === 401) {
        clearSession();
        navigate('/login');
        return;
      }

      setError(getErrorMessage(requestError, 'No se pudo cambiar el estado de la especialidad.'));
    }
  }

  const columns = useMemo(
    () => [
      { key: 'nombre', label: 'Nombre' },
      { key: 'descripcion', label: 'Descripcion', render: (row) => row.descripcion || 'Sin descripcion' },
      { key: 'estado', label: 'Estado', render: (row) => <StatusBadge status={row.estado ? 'Activa' : 'Inactiva'} /> },
      { key: 'createdAt', label: 'Fecha de registro', render: (row) => formatDate(row.createdAt || row.created_at) },
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
        <div className="admin-filter-grid specialty-filter-grid">
          <Input
            label="Buscar por nombre"
            placeholder="Nombre de especialidad"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
          <Select
            label="Estado"
            placeholder="Todos"
            options={['Activo', 'Inactivo']}
            value={estado}
            onChange={(event) => setEstado(event.target.value)}
          />
          <Button onClick={loadSpecialties} disabled={loading}>
            <Search size={18} />
            Buscar
          </Button>
          <Button onClick={openCreateModal}>
            <Plus size={18} />
            Nueva especialidad
          </Button>
        </div>
      </Card>

      {success && <div className="admin-success-message">{success}</div>}

      {error ? (
        <Card className="dashboard-state-card dashboard-error-card">
          <strong>No se pudieron cargar las especialidades.</strong>
          <span>{error}</span>
          <Button onClick={loadSpecialties}>Reintentar</Button>
        </Card>
      ) : loading ? (
        <Card className="dashboard-state-card">
          <strong>Cargando especialidades...</strong>
          <span>Consultando especialidades reales del sistema SGH.</span>
        </Card>
      ) : (
        <DataTable columns={columns} rows={especialidades} emptyText="No se encontraron especialidades." />
      )}

      <Modal
        open={modalOpen}
        title={editingSpecialty ? 'Editar especialidad' : 'Nueva especialidad'}
        onClose={() => setModalOpen(false)}
        footer={
          <>
            <Button type="button" variant="ghost" onClick={() => setModalOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" form="admin-specialty-form" disabled={saving}>
              {saving ? 'Guardando...' : 'Guardar'}
            </Button>
          </>
        }
      >
        <form id="admin-specialty-form" className="admin-form-grid" onSubmit={handleSubmitSpecialty}>
          <Input label="Nombre" value={form.nombre} onChange={(event) => updateForm('nombre', event.target.value)} />
          <Textarea
            label="Descripcion"
            className="span-2"
            value={form.descripcion}
            onChange={(event) => updateForm('descripcion', event.target.value)}
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
