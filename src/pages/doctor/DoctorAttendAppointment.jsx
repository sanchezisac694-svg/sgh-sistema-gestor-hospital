import { useEffect, useState } from 'react';
import { CheckCircle2 } from 'lucide-react';
import { Button } from '../../components/Button.jsx';
import { Card } from '../../components/Card.jsx';
import { AppointmentInfoCard, MedicalAttentionForm, PatientInfoCard } from '../../components/doctor/DoctorUi.jsx';
import { attendAppointment } from '../../services/appointments.service.js';
import { getMyDoctorAppointmentById } from '../../services/doctor-panel.service.js';
import { canAttend, getErrorMessage, unwrapData } from '../../utils/doctorPanelFormat.js';

const initialForm = {
  observaciones: '',
  diagnostico_inicial: '',
  recomendaciones: '',
};

function getStoredAppointmentId() {
  const params = new URLSearchParams(window.location.search);
  return params.get('id') || sessionStorage.getItem('sgh_doctor_appointment_id');
}

export function DoctorAttendAppointment({ navigate }) {
  const [appointment, setAppointment] = useState(null);
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');
  const appointmentId = getStoredAppointmentId();

  async function loadAppointment() {
    if (!appointmentId) {
      setError('Selecciona una cita para atenderla.');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError('');
      const response = await getMyDoctorAppointmentById(appointmentId);
      const data = unwrapData(response);
      setAppointment(data);

      if (!canAttend(data.estado)) {
        setError('Solo se pueden atender citas confirmadas.');
      }
    } catch (requestError) {
      setError(getErrorMessage(requestError, 'No se pudo cargar la cita.'));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAppointment();
  }, []);

  async function handleSave(event) {
    event.preventDefault();
    if (!appointment) return;

    if (!form.observaciones.trim()) {
      setError('Las observaciones son obligatorias.');
      return;
    }

    try {
      setSaving(true);
      setError('');
      await attendAppointment(appointment.id, {
        observaciones: form.observaciones.trim(),
        diagnostico_inicial: form.diagnostico_inicial.trim() || null,
        recomendaciones: form.recomendaciones.trim() || null,
      });
      setSaved(true);
    } catch (requestError) {
      setError(getErrorMessage(requestError, 'No se pudo atender la cita.'));
    } finally {
      setSaving(false);
    }
  }

  if (saved) {
    return (
      <Card className="success-card">
        <CheckCircle2 size={46} />
        <h1>La cita fue marcada como atendida correctamente.</h1>
        <p>Las observaciones de consulta han sido registradas.</p>
        <Button onClick={() => navigate('/doctor/citas')}>Volver a mis citas</Button>
      </Card>
    );
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
        <PatientInfoCard appointment={appointment} />
        <AppointmentInfoCard appointment={appointment} />
      </section>
      <MedicalAttentionForm
        form={form}
        onChange={setForm}
        onSave={handleSave}
        onCancel={() => navigate('/doctor/citas')}
        saving={saving}
      />
    </div>
  );
}
