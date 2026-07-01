import { useEffect, useMemo, useState } from 'react';
import { Eye, Search, Stethoscope, UserX } from 'lucide-react';
import { Button } from '../../components/Button.jsx';
import { Card } from '../../components/Card.jsx';
import { DataTable } from '../../components/DataTable.jsx';
import { Input, Select, Textarea } from '../../components/FormControls.jsx';
import { Modal } from '../../components/Modal.jsx';
import { StatusBadge } from '../../components/StatusBadge.jsx';
import {
  attendAppointment,
  markNoShowAppointment,
} from '../../services/appointments.service.js';
import {
  getMyDoctorAppointmentById,
  getMyDoctorAppointments,
} from '../../services/doctor-panel.service.js';
import {
  DOCTOR_APPOINTMENT_STATES,
  appointmentToRow,
  canAttend,
  canMarkNoShow,
  fullName,
  getErrorMessage,
  unwrapData,
} from '../../utils/doctorPanelFormat.js';

const initialAttendForm = {
  observaciones: '',
  diagnostico_inicial: '',
  recomendaciones: '',
};

export function DoctorAppointments({ navigate }) {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [fecha, setFecha] = useState('');
  const [estado, setEstado] = useState('');
  const [search, setSearch] = useState('');
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [attendModalOpen, setAttendModalOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [attendForm, setAttendForm] = useState(initialAttendForm);

  const rows = useMemo(() => appointments.map(appointmentToRow), [appointments]);

  async function loadAppointments(overrides = {}) {
    const nextFecha = Object.prototype.hasOwnProperty.call(overrides, 'fecha') ? overrides.fecha : fecha;
    const nextEstado = Object.prototype.hasOwnProperty.call(overrides, 'estado') ? overrides.estado : estado;
    const nextSearch = Object.prototype.hasOwnProperty.call(overrides, 'search') ? overrides.search : search;

    try {
      setLoading(true);
      setError('');
      const response = await getMyDoctorAppointments({
        fecha: nextFecha || undefined,
        estado: nextEstado || undefined,
        search: nextSearch || undefined,
      });
      setAppointments(unwrapData(response) || []);
    } catch (requestError) {
      setError(getErrorMessage(requestError, 'No se pudieron cargar las citas.'));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAppointments();
  }, []);

  async function openDetailModal(appointment) {
    try {
      setError('');
      const response = await getMyDoctorAppointmentById(appointment.id);
      setSelectedAppointment(unwrapData(response));
      setDetailModalOpen(true);
    } catch (requestError) {
      setError(getErrorMessage(requestError, 'No se pudo cargar el detalle de la cita.'));
    }
  }

  function openAttendModal(appointment) {
    setSelectedAppointment(appointment);
    setAttendForm(initialAttendForm);
    setError('');
    setAttendModalOpen(true);
  }

  async function handleAttendAppointment(event) {
    event.preventDefault();
    if (!selectedAppointment) return;

    if (!attendForm.observaciones.trim()) {
      setError('Las observaciones son obligatorias.');
      return;
    }

    try {
      setSaving(true);
      setError('');
      setSuccess('');
      await attendAppointment(selectedAppointment.id, {
        observaciones: attendForm.observaciones.trim(),
        diagnostico_inicial: attendForm.diagnostico_inicial.trim() || null,
        recomendaciones: attendForm.recomendaciones.trim() || null,
      });
      setSuccess('Cita marcada como atendida correctamente.');
      setAttendModalOpen(false);
      setSelectedAppointment(null);
      await loadAppointments();
    } catch (requestError) {
      setError(getErrorMessage(requestError, 'No se pudo atender la cita.'));
    } finally {
      setSaving(false);
    }
  }

  async function handleMarkNoShow(appointment) {
    const comentario = window.prompt('Comentario opcional sobre la inasistencia:');

    try {
      setError('');
      setSuccess('');
      await markNoShowAppointment(appointment.id, comentario || null);
      setSuccess('Cita marcada como no asistio correctamente.');
      await loadAppointments();
    } catch (requestError) {
      setError(getErrorMessage(requestError, 'No se pudo marcar la cita como no asistio.'));
    }
  }

  function clearFilters() {
    setFecha('');
    setEstado('');
    setSearch('');
    loadAppointments({ fecha: '', estado: '', search: '' });
  }

  const columns = [
    { key: 'folio', label: 'Folio' },
    { key: 'pacienteNombre', label: 'Paciente' },
    { key: 'fecha', label: 'Fecha' },
    { key: 'hora', label: 'Hora' },
    { key: 'motivo', label: 'Motivo' },
    { key: 'estado', label: 'Estado', render: (row) => <StatusBadge status={row.estado} /> },
    {
      key: 'acciones',
      label: 'Acciones',
      render: (row) => (
        <div className="doctor-table-actions">
          <Button size="sm" variant="secondary" onClick={() => openDetailModal(row)}>
            <Eye size={16} />
            Ver
          </Button>
          {canAttend(row.estado) && (
            <Button size="sm" onClick={() => openAttendModal(row)}>
              <Stethoscope size={16} />
              Atender
            </Button>
          )}
          {canMarkNoShow(row.estado) && (
            <Button size="sm" variant="ghost" onClick={() => handleMarkNoShow(row)}>
              <UserX size={16} />
              No asistio
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="dashboard-stack">
      <Card className="admin-filter-card">
        <div className="admin-filter-grid doctor-filter-grid">
          <Input
            label="Buscar paciente"
            placeholder="Paciente, folio o motivo"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
          <Input label="Fecha" type="date" value={fecha} onChange={(event) => setFecha(event.target.value)} />
          <Select label="Estado" options={DOCTOR_APPOINTMENT_STATES} value={estado} onChange={(event) => setEstado(event.target.value)} />
          <Button onClick={loadAppointments}>
            <Search size={17} />
            Buscar
          </Button>
          <Button variant="ghost" onClick={clearFilters}>Limpiar filtros</Button>
        </div>
      </Card>

      {error && (
        <Card className="dashboard-state-card dashboard-error-card">
          <strong>{error}</strong>
          <Button size="sm" variant="secondary" onClick={loadAppointments}>Reintentar</Button>
        </Card>
      )}

      {success && (
        <Card className="dashboard-state-card">
          <strong>{success}</strong>
        </Card>
      )}

      <Card title="Mis citas" subtitle="Citas asignadas al doctor autenticado.">
        {loading ? (
          <p className="muted-copy">Cargando informacion...</p>
        ) : (
          <DataTable columns={columns} rows={rows} emptyText="No tienes citas registradas." />
        )}
      </Card>

      <Modal
        open={detailModalOpen}
        title="Detalle de cita"
        onClose={() => setDetailModalOpen(false)}
        footer={<Button variant="ghost" onClick={() => setDetailModalOpen(false)}>Cerrar</Button>}
      >
        {selectedAppointment && (
          <div className="info-list">
            <span>Folio: {selectedAppointment.folio}</span>
            <span>Paciente: {fullName(selectedAppointment.paciente?.usuario)}</span>
            <span>Correo: {selectedAppointment.paciente?.usuario?.correo || 'Sin correo'}</span>
            <span>Telefono: {selectedAppointment.paciente?.usuario?.telefono || 'Sin telefono'}</span>
            <span>Fecha: {selectedAppointment.fecha}</span>
            <span>Hora inicio: {selectedAppointment.horaInicio}</span>
            <span>Hora fin: {selectedAppointment.horaFin}</span>
            <span>Motivo: {selectedAppointment.motivoConsulta || 'Sin motivo'}</span>
            <span>Estado: <StatusBadge status={selectedAppointment.estado} /></span>
            {selectedAppointment.observacion && (
              <span>Observacion: {selectedAppointment.observacion.observaciones}</span>
            )}
          </div>
        )}
      </Modal>

      <Modal
        open={attendModalOpen}
        title="Atender cita"
        onClose={() => setAttendModalOpen(false)}
      >
        <form className="form-stack" onSubmit={handleAttendAppointment}>
          <Textarea
            label="Observaciones obligatorias"
            value={attendForm.observaciones}
            onChange={(event) => setAttendForm({ ...attendForm, observaciones: event.target.value })}
            required
          />
          <Textarea
            label="Diagnostico inicial"
            value={attendForm.diagnostico_inicial}
            onChange={(event) => setAttendForm({ ...attendForm, diagnostico_inicial: event.target.value })}
          />
          <Textarea
            label="Recomendaciones"
            value={attendForm.recomendaciones}
            onChange={(event) => setAttendForm({ ...attendForm, recomendaciones: event.target.value })}
          />
          <div className="step-actions">
            <Button type="submit" disabled={saving}>{saving ? 'Guardando...' : 'Guardar como atendida'}</Button>
            <Button type="button" variant="ghost" onClick={() => setAttendModalOpen(false)}>Cancelar</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
