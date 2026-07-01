import { useEffect, useState } from 'react';
import { Button } from '../../components/Button.jsx';
import { Card } from '../../components/Card.jsx';
import { StatusBadge } from '../../components/StatusBadge.jsx';
import { getMyPatientProfile } from '../../services/patient-panel.service.js';
import { fullName, getErrorMessage, unwrapData } from '../../utils/patientPanelFormat.js';

function formatDate(value) {
  if (!value) return 'Sin fecha';
  return String(value).slice(0, 10);
}

export function PatientProfile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function loadProfile() {
    try {
      setLoading(true);
      setError('');
      const response = await getMyPatientProfile();
      setProfile(unwrapData(response));
    } catch (requestError) {
      setError(getErrorMessage(requestError, 'No se pudo cargar tu perfil.'));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadProfile();
  }, []);

  if (loading) {
    return <Card><p className="muted-copy">Cargando informacion...</p></Card>;
  }

  if (error) {
    return (
      <Card className="dashboard-state-card dashboard-error-card">
        <strong>{error}</strong>
        <Button size="sm" variant="secondary" onClick={loadProfile}>Reintentar</Button>
      </Card>
    );
  }

  const user = profile?.usuario;

  return (
    <div className="patient-page">
      <section className="page-heading patient-heading">
        <div>
          <span className="eyebrow-light">Portal paciente</span>
          <h1>Mi perfil</h1>
          <p>Informacion personal registrada en SGH.</p>
        </div>
        <StatusBadge status={profile?.estado ? 'Activo' : 'Inactivo'} />
      </section>

      <Card title="Datos del paciente">
        <div className="info-list">
          <span>Nombre completo: {fullName(user)}</span>
          <span>Correo: {user?.correo || 'Sin correo'}</span>
          <span>Telefono: {user?.telefono || 'Sin telefono'}</span>
          <span>Fecha de nacimiento: {formatDate(profile?.fechaNacimiento)}</span>
          <span>Sexo: {profile?.sexo || 'No especificado'}</span>
          <span>Direccion: {profile?.direccion || 'Sin direccion'}</span>
          <span>Contacto de emergencia: {profile?.contactoEmergencia || 'Sin contacto'}</span>
          <span>Telefono de emergencia: {profile?.telefonoEmergencia || 'Sin telefono'}</span>
        </div>
      </Card>
    </div>
  );
}
