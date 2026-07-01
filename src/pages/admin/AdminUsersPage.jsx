import { useEffect, useMemo, useState } from 'react';
import { Pencil, Plus, Power, Search } from 'lucide-react';
import { Button } from '../../components/Button.jsx';
import { Card } from '../../components/Card.jsx';
import { DataTable } from '../../components/DataTable.jsx';
import { Input, Select } from '../../components/FormControls.jsx';
import { Modal } from '../../components/Modal.jsx';
import { StatusBadge } from '../../components/StatusBadge.jsx';
import { clearSession } from '../../services/auth.service.js';
import {
  createUser,
  getUsers,
  updateUser,
  updateUserStatus,
} from '../../services/users.service.js';

const roles = ['ADMIN', 'DOCTOR', 'ENFERMERO', 'RECEPCIONISTA', 'PACIENTE'];
const emptyForm = {
  nombre: '',
  apellido_paterno: '',
  apellido_materno: '',
  correo: '',
  password: '',
  telefono: '',
  rol: '',
  estado: true,
};

function getRole(usuario) {
  return usuario.rol?.nombre || usuario.rol || '';
}

function getFullName(usuario) {
  return [
    usuario.nombre,
    usuario.apellidoPaterno || usuario.apellido_paterno,
    usuario.apellidoMaterno || usuario.apellido_materno,
  ]
    .filter(Boolean)
    .join(' ');
}

function formatDate(value) {
  if (!value) return 'N/A';
  return new Intl.DateTimeFormat('es-MX', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date(value));
}

function mapEstadoFilter(value) {
  if (value === 'Activo') return true;
  if (value === 'Inactivo') return false;
  return undefined;
}

function getErrorMessage(error, fallback) {
  return error?.message || fallback;
}

export function AdminUsersPage({ navigate }) {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [search, setSearch] = useState('');
  const [rol, setRol] = useState('');
  const [estado, setEstado] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [formError, setFormError] = useState('');

  async function loadUsers() {
    try {
      setLoading(true);
      setError('');

      const response = await getUsers({
        search: search || undefined,
        rol: rol || undefined,
        estado: mapEstadoFilter(estado),
      });

      setUsuarios(response.data || []);
    } catch (requestError) {
      if (requestError.status === 401) {
        clearSession();
        navigate('/login');
        return;
      }

      setError(getErrorMessage(requestError, 'No se pudieron cargar los usuarios.'));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadUsers();
  }, []);

  function updateForm(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function openCreateModal() {
    setEditingUser(null);
    setForm(emptyForm);
    setFormError('');
    setModalOpen(true);
  }

  function openEditModal(usuario) {
    setEditingUser(usuario);
    setForm({
      nombre: usuario.nombre || '',
      apellido_paterno: usuario.apellidoPaterno || usuario.apellido_paterno || '',
      apellido_materno: usuario.apellidoMaterno || usuario.apellido_materno || '',
      correo: usuario.correo || '',
      password: '',
      telefono: usuario.telefono || '',
      rol: getRole(usuario),
      estado: Boolean(usuario.estado),
    });
    setFormError('');
    setModalOpen(true);
  }

  function validateForm() {
    const correoValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.correo);

    if (!form.nombre.trim()) return 'Nombre obligatorio.';
    if (!form.apellido_paterno.trim()) return 'Apellido paterno obligatorio.';
    if (!form.correo.trim()) return 'Correo obligatorio.';
    if (!correoValido) return 'Correo valido obligatorio.';
    if (!form.rol) return 'Rol obligatorio.';
    if (!editingUser && !form.password.trim()) return 'Contrasena obligatoria.';
    if (!editingUser && form.password.length < 8) return 'Contrasena minimo 8 caracteres.';

    return '';
  }

  async function handleSubmitUser(event) {
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
        apellido_paterno: form.apellido_paterno.trim(),
        apellido_materno: form.apellido_materno.trim() || null,
        correo: form.correo.trim(),
        telefono: form.telefono.trim() || null,
        rol: form.rol,
        estado: form.estado,
      };

      if (editingUser) {
        await updateUser(editingUser.id, payload);
        setSuccess('Usuario actualizado correctamente.');
      } else {
        await createUser({
          ...payload,
          password: form.password,
        });
        setSuccess('Usuario creado correctamente.');
      }

      setModalOpen(false);
      setEditingUser(null);
      await loadUsers();
    } catch (requestError) {
      if (requestError.status === 401) {
        clearSession();
        navigate('/login');
        return;
      }

      setFormError(getErrorMessage(requestError, 'No se pudo guardar el usuario.'));
    } finally {
      setSaving(false);
    }
  }

  async function handleToggleStatus(usuario) {
    const nuevoEstado = !usuario.estado;
    const confirmMessage = nuevoEstado
      ? 'Deseas activar este usuario?'
      : 'Deseas inactivar este usuario?';

    if (!window.confirm(confirmMessage)) return;

    try {
      setError('');
      setSuccess('');
      await updateUserStatus(usuario.id, nuevoEstado);
      setSuccess(nuevoEstado ? 'Usuario activado correctamente.' : 'Usuario inactivado correctamente.');
      await loadUsers();
    } catch (requestError) {
      if (requestError.status === 401) {
        clearSession();
        navigate('/login');
        return;
      }

      setError(getErrorMessage(requestError, 'No se pudo cambiar el estado del usuario.'));
    }
  }

  const columns = useMemo(
    () => [
      { key: 'nombreCompleto', label: 'Nombre completo', render: getFullName },
      { key: 'correo', label: 'Correo' },
      { key: 'telefono', label: 'Telefono', render: (row) => row.telefono || 'Sin telefono' },
      { key: 'rol', label: 'Rol', render: (row) => <span className="role-badge">{getRole(row)}</span> },
      { key: 'estado', label: 'Estado', render: (row) => <StatusBadge status={row.estado ? 'Activo' : 'Inactivo'} /> },
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
        <div className="admin-filter-grid user-filter-grid">
          <Input
            label="Buscar por nombre o correo"
            placeholder="Nombre o correo"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
          <Select
            label="Rol"
            placeholder="Todos"
            options={roles}
            value={rol}
            onChange={(event) => setRol(event.target.value)}
          />
          <Select
            label="Estado"
            placeholder="Todos"
            options={['Activo', 'Inactivo']}
            value={estado}
            onChange={(event) => setEstado(event.target.value)}
          />
          <Button onClick={loadUsers} disabled={loading}>
            <Search size={18} />
            Buscar
          </Button>
          <Button onClick={openCreateModal}>
            <Plus size={18} />
            Nuevo usuario
          </Button>
        </div>
      </Card>

      {success && <div className="admin-success-message">{success}</div>}

      {error ? (
        <Card className="dashboard-state-card dashboard-error-card">
          <strong>No se pudieron cargar los usuarios.</strong>
          <span>{error}</span>
          <Button onClick={loadUsers}>Reintentar</Button>
        </Card>
      ) : loading ? (
        <Card className="dashboard-state-card">
          <strong>Cargando usuarios...</strong>
          <span>Consultando usuarios reales del sistema SGH.</span>
        </Card>
      ) : (
        <DataTable columns={columns} rows={usuarios} emptyText="No se encontraron usuarios." />
      )}

      <Modal
        open={modalOpen}
        title={editingUser ? 'Editar usuario' : 'Nuevo usuario'}
        onClose={() => setModalOpen(false)}
        footer={
          <>
            <Button type="button" variant="ghost" onClick={() => setModalOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" form="admin-user-form" disabled={saving}>
              {saving ? 'Guardando...' : 'Guardar'}
            </Button>
          </>
        }
      >
        <form id="admin-user-form" className="admin-form-grid" onSubmit={handleSubmitUser}>
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
          <Input
            label="Correo"
            type="email"
            value={form.correo}
            onChange={(event) => updateForm('correo', event.target.value)}
          />
          {!editingUser && (
            <Input
              label="Contrasena"
              type="password"
              value={form.password}
              onChange={(event) => updateForm('password', event.target.value)}
            />
          )}
          <Input
            label="Telefono"
            value={form.telefono}
            onChange={(event) => updateForm('telefono', event.target.value)}
          />
          <Select
            label="Rol"
            placeholder="Seleccionar"
            options={roles}
            value={form.rol}
            onChange={(event) => updateForm('rol', event.target.value)}
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
