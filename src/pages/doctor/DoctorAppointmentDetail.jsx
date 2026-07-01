import { useEffect, useState } from 'react';
import { Button } from '../../components/Button.jsx';
import { Card } from '../../components/Card.jsx';
import { StatusBadge } from '../../components/StatusBadge.jsx';
import { AppointmentInfoCard, PatientInfoCard } from '../../components/doctor/DoctorUi.jsx';
import { getMyDoctorAppointmentById } from '../../services/doctor-panel.service.js';
import { canAttend, canMarkNoShow, getErrorMessage, unwrapData } from '../../utils/doctorPanelFormat.js';
import { markNoShowAppointment } from '../../services/appointments.service.js';

function getStoredAppointmentId() {
  const params = new URLSearchParams(window.location.search);
  return params.get('id') || sessionStorage.getItem('sgh_doctor_appointment_id');
}

export function DoctorAppointmentDetail({ navigate }) {
  const [appointment, setAppointment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const appointmentId = getStoredAppointmentId();

  async function loadAppointment() {
    if (!appointmentId) {
      setError('Selecciona una cita para ver su detalle.');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError('');
      const response = await getMyDoctorAppointmentById(appointmentId);
      setAppointment(unwrapData(response));
    } catch (requestError) {
      setError(getErrorMessage(requestError, 'No se pudo cargar el detalle de la cita.'));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAppointment();
  }, []);

  async function handleNoShow() {
    if (!appointment) return;
    const comentario = window.prompt('Comentario opcional sobre la inasistencia:');

    try {
      setError('');
      await markNoShowAppointment(appointment.id, comentario || null);
      await loadAppointment();
    } catch (requestError) {
      setError(getErrorMessage(requestError, 'No se pudo marcar la cita como no asistio.'));
    }
  }

  if (loading) {
    return <Card><p className="muted-copy">Cargando informacion...</p></Card>;
  }

  if (error) {
    return (
      <Card className="dashboard-state-card dashboard-error-card">
        <strong>{error}</strong>
        <div className="step-actions">
          <Button size="sm" variant="secondary" onClick={loadAppointment}>Reintentar</Button>
          <Button size="sm" variant="ghost" onClick={() => navigate('/doctor/citas')}>Regresar</Button>
        </div>
      </Card>
    );
  }

  return (
    <div className="dashboard-stack">
      <section className="doctor-detail-grid">
        <AppointmentInfoCard appointment={appointment} />
        <PatientInfoCard appointment={appointment} />
      </section>
      {appointment?.observacion && (
        <Card title="Observacion registrada">
          <div className="info-list">
            <span>Observaciones: {appointment.observacion.observaciones}</span>
            <span>Diagnostico inicial: {appointment.observacion.diagnosticoInicial || 'Sin diagnostico'}</span>
            <span>Recomendaciones: {appointment.observacion.recomendaciones || 'Sin recomendaciones'}</span>
          </div>
        </Card>
      )}
      <Card title="Acciones disponibles">
        <div className="doctor-detail-actions">
          <StatusBadge status={appointment.estado} />
          {canAttend(appointment.estado) && (
            <Button onClick={() => {
              sessionStorage.setItem('sgh_doctor_appointment_id', appointment.id);
              navigate('/doctor/citas/atender');
            }}>
              Atender cita
            </Button>
          )}
          {canMarkNoShow(appointment.estado) && (
            <Button variant="danger" onClick={handleNoShow}>Marcar como no asistio</Button>
          )}
          <Button variant="ghost" onClick={() => navigate('/doctor/citas')}>Regresar</Button>
        </div>
      </Card>
    </div>
  );
}
