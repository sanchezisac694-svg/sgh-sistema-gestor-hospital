import { useEffect, useMemo, useState } from 'react';
import { CheckCircle2, Clock3, Stethoscope, UserX } from 'lucide-react';
import { Button } from '../../components/Button.jsx';
import { Card, StatCard } from '../../components/Card.jsx';
import { DataTable } from '../../components/DataTable.jsx';
import { Textarea } from '../../components/FormControls.jsx';
import { Modal } from '../../components/Modal.jsx';
import { StatusBadge } from '../../components/StatusBadge.jsx';
import { attendAppointment, markNoShowAppointment } from '../../services/appointments.service.js';
import {
  getMyDoctorAppointmentById,
  getTodayDoctorAppointments,
} from '../../services/doctor-panel.service.js';
import {
  appointmentToRow,
  canAttend,
  canMarkNoShow,
  fullName,
  getErrorMessage,
  unwrapData,
} from '../../utils/doctorPanelFormat.js';

const initialForm = {
  observaciones: '',
  diagnostico_inicial: '',
  recomendaciones: '',
};

export function DoctorTodayAppointments({ navigate }) {
  const [appointments, setAppointments] = useState([]);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [attendModalOpen, setAttendModalOpen] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const rows = useMemo(() => appointments.map(appointmentToRow), [appointments]);
  const counts = useMemo(() => ({
    total: rows.length,
    confirmadas: rows.filter((row) => row.estado === 'CONFIRMADA').length,
    pendientes: rows.filter((row) => row.estado === 'PENDIENTE').length,
    atendidas: rows.filter((row) => row.estado === 'ATENDIDA').length,
    noAsistio: rows.filter((row) => row.estado === 'NO_ASISTIO').length,
  }), [rows]);

  async function loadTodayAppointments() {
    try {
      setLoading(true);
      setError('');
      const response = await getTodayDoctorAppointments();
      setAppointments(unwrapData(response) || []);
    } catch (requestError) {
      setError(getErrorMessage(requestError, 'No se pudieron cargar las citas de hoy.'));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadTodayAppointments();
  }, []);

  async function openDetail(appointment) {
    try {
      const response = await getMyDoctorAppointmentById(appointment.id);
      setSelectedAppointment(unwrapData(response));
      setDetailModalOpen(true);
    } catch (requestError) {
      setError(getErrorMessage(requestError, 'No se pudo cargar el detalle de la cita.'));
    }
  }

  function openAttend(appointment) {
    setSelectedAppointment(appointment);
    setForm(initialForm);
    setAttendModalOpen(true);
    setError('');
  }

  async function saveAttend(event) {
    event.preventDefault();
    if (!selectedAppointment) return;

    if (!form.observaciones.trim()) {
      setError('Las observaciones son obligatorias.');
      return;
    }

    try {
      setSaving(true);
      setError('');
      setSuccess('');
      await attendAppointment(selectedAppointment.id, {
        observaciones: form.observaciones.trim(),
        diagnostico_inicial: form.diagnostico_inicial.trim() || null,
        recomendaciones: form.recomendaciones.trim() || null,
      });
      setSuccess('Cita marcada como atendida correctamente.');
      setAttendModalOpen(false);
      await loadTodayAppointments();
    } catch (requestError) {
      setError(getErrorMessage(requestError, 'No se pudo atender la cita.'));
    } finally {
      setSaving(false);
    }
  }

  async function markNoShow(appointment) {
    const comentario = window.prompt('Comentario opcional sobre la inasistencia:');

    try {
      setError('');
      setSuccess('');
      await markNoShowAppointment(appointment.id, comentario || null);
      setSuccess('Cita marcada como no asistio correctamente.');
      await loadTodayAppointments();
    } catch (requestError) {
      setError(getErrorMessage(requestError, 'No se pudo marcar la cita como no asistio.'));
    }
  }

  const columns = [
    { key: 'pacienteNombre', label: 'Paciente' },
    { key: 'hora', label: 'Hora' },
    { key: 'motivo', label: 'Motivo' },
    { key: 'estado', label: 'Estado', render: (row) => <StatusBadge status={row.estado} /> },
    {
      key: 'acciones',
      label: 'Acciones',
      render: (row) => (
        <div className="doctor-table-actions">
          <Button size="sm" variant="secondary" onClick={() => openDetail(row)}>Ver detalle</Button>
          {canAttend(row.estado) && (
            <Button size="sm" onClick={() => openAttend(row)}>
              <Stethoscope size={16} />
              Atender
            </Button>
          )}
          {canMarkNoShow(row.estado) && (
            <Button size="sm" variant="ghost" onClick={() => markNoShow(row)}>
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
      <section className="stats-grid doctor-today-grid">
        <StatCard label="Total hoy" value={counts.total} helper="Citas programadas" />
        <StatCard label="Confirmadas" value={counts.confirmadas} helper="Listas para atender" tone="blue" icon={CheckCircle2} />
        <StatCard label="Pendientes" value={counts.pendientes} helper="Por confirmar" tone="yellow" icon={Clock3} />
        <StatCard label="Atendidas" value={counts.atendidas} helper="Finalizadas" tone="green" icon={CheckCircle2} />
        <StatCard label="No asistio" value={counts.noAsistio} helper="Ausencias" tone="yellow" icon={UserX} />
      </section>

      {error && (
        <Card className="dashboard-state-card dashboard-error-card">
          <strong>{error}</strong>
          <Button size="sm" variant="secondary" onClick={loadTodayAppointments}>Reintentar</Button>
        </Card>
      )}

      {success && (
        <Card className="dashboard-state-card">
          <strong>{success}</strong>
        </Card>
      )}

      <Card title="Citas de hoy" subtitle="Consulta y atiende las citas programadas para el dia.">
        {loading ? (
          <p className="muted-copy">Cargando informacion...</p>
        ) : (
          <DataTable columns={columns} rows={rows} emptyText="No tienes citas registradas para hoy." />
        )}
      </Card>

      <Modal open={detailModalOpen} title="Detalle de cita" onClose={() => setDetailModalOpen(false)}>
        {selectedAppointment && (
          <div className="info-list">
            <span>Folio: {selectedAppointment.folio}</span>
            <span>Paciente: {fullName(selectedAppointment.paciente?.usuario)}</span>
            <span>Fecha: {selectedAppointment.fecha}</span>
            <span>Hora: {selectedAppointment.horaInicio} - {selectedAppointment.horaFin}</span>
            <span>Motivo: {selectedAppointment.motivoConsulta || 'Sin motivo'}</span>
            <span>Estado: <StatusBadge status={selectedAppointment.estado} /></span>
          </div>
        )}
      </Modal>

      <Modal open={attendModalOpen} title="Atender cita" onClose={() => setAttendModalOpen(false)}>
        <form className="form-stack" onSubmit={saveAttend}>
          <Textarea label="Observaciones obligatorias" value={form.observaciones} onChange={(event) => setForm({ ...form, observaciones: event.target.value })} required />
          <Textarea label="Diagnostico inicial" value={form.diagnostico_inicial} onChange={(event) => setForm({ ...form, diagnostico_inicial: event.target.value })} />
          <Textarea label="Recomendaciones" value={form.recomendaciones} onChange={(event) => setForm({ ...form, recomendaciones: event.target.value })} />
          <div className="step-actions">
            <Button type="submit" disabled={saving}>{saving ? 'Guardando...' : 'Guardar como atendida'}</Button>
            <Button type="button" variant="ghost" onClick={() => setAttendModalOpen(false)}>Cancelar</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
