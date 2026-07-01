import { useEffect, useMemo, useState } from 'react';
import { Eye, X } from 'lucide-react';
import { Button } from '../../components/Button.jsx';
import { Card } from '../../components/Card.jsx';
import { DataTable } from '../../components/DataTable.jsx';
import { Modal } from '../../components/Modal.jsx';
import { StatusBadge } from '../../components/StatusBadge.jsx';
import {
  cancelMyPatientAppointment,
  getMyPatientAppointments,
} from '../../services/patient-panel.service.js';
import {
  appointmentToPatientRow,
  canPatientCancel,
  getErrorMessage,
  unwrapData,
} from '../../utils/patientPanelFormat.js';

export function PatientAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const rows = useMemo(() => appointments.map(appointmentToPatientRow), [appointments]);

  async function loadAppointments() {
    try {
      setLoading(true);
      setError('');
      const response = await getMyPatientAppointments();
      setAppointments(unwrapData(response) || []);
    } catch (requestError) {
      setError(getErrorMessage(requestError, 'No se pudieron cargar tus citas.'));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAppointments();
  }, []);

  async function handleCancelAppointment(appointment) {
    const motivo = window.prompt('Escribe el motivo de cancelacion:');
    if (!motivo || !motivo.trim()) return;

    try {
      setError('');
      setSuccess('');
      await cancelMyPatientAppointment(appointment.id, motivo.trim());
      setSuccess('Cita cancelada correctamente.');
      await loadAppointments();
    } catch (requestError) {
      setError(getErrorMessage(requestError, 'No se pudo cancelar la cita.'));
    }
  }

  const columns = [
    { key: 'folio', label: 'Folio' },
    { key: 'doctorNombre', label: 'Doctor' },
    { key: 'especialidadNombre', label: 'Especialidad' },
    { key: 'fecha', label: 'Fecha' },
    { key: 'hora', label: 'Hora' },
    { key: 'motivo', label: 'Motivo' },
    { key: 'estado', label: 'Estado', render: (row) => <StatusBadge status={row.estado} /> },
    {
      key: 'acciones',
      label: 'Acciones',
      render: (row) => (
        <div className="appointments-actions">
          <Button size="sm" variant="secondary" onClick={() => setSelectedAppointment(row)}>
            <Eye size={16} />
            Ver
          </Button>
          {canPatientCancel(row) && (
            <Button size="sm" variant="danger" onClick={() => handleCancelAppointment(row)}>
              <X size={16} />
              Cancelar
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="patient-page">
      <section className="page-heading patient-heading">
        <div>
          <span className="eyebrow-light">Portal paciente</span>
          <h1>Mis citas</h1>
          <p>Consulta y cancela tus citas activas cuando corresponda.</p>
        </div>
      </section>

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

      <Card title="Citas registradas">
        {loading ? (
          <p className="muted-copy">Cargando informacion...</p>
        ) : (
          <DataTable columns={columns} rows={rows} emptyText="Aun no tienes citas registradas." />
        )}
      </Card>

      <Modal open={Boolean(selectedAppointment)} title="Detalle de cita" onClose={() => setSelectedAppointment(null)}>
        {selectedAppointment && (
          <div className="info-list">
            <span>Folio: {selectedAppointment.folio}</span>
            <span>Doctor: {selectedAppointment.doctorNombre}</span>
            <span>Especialidad: {selectedAppointment.especialidadNombre}</span>
            <span>Fecha: {selectedAppointment.fecha}</span>
            <span>Hora inicio: {selectedAppointment.horaInicio}</span>
            <span>Hora fin: {selectedAppointment.horaFin}</span>
            <span>Motivo: {selectedAppointment.motivo}</span>
            <span>Consultorio: {selectedAppointment.consultorio}</span>
            <span>Estado: <StatusBadge status={selectedAppointment.estado} /></span>
          </div>
        )}
      </Modal>
    </div>
  );
}
