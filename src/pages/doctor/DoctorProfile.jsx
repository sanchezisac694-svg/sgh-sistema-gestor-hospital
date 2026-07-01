import { useEffect, useState } from 'react';
import { Button } from '../../components/Button.jsx';
import { Card } from '../../components/Card.jsx';
import { StatusBadge } from '../../components/StatusBadge.jsx';
import { getMyDoctorProfile } from '../../services/doctor-panel.service.js';
import { fullName, getErrorMessage, initialsFromName, unwrapData } from '../../utils/doctorPanelFormat.js';

export function DoctorProfile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function loadProfile() {
    try {
      setLoading(true);
      setError('');
      const response = await getMyDoctorProfile();
      setProfile(unwrapData(response));
    } catch (requestError) {
      setError(getErrorMessage(requestError, 'No se pudo cargar el perfil.'));
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

  const doctorName = fullName(profile?.usuario);

  return (
    <div className="dashboard-stack">
      <Card className="doctor-profile-panel">
        <div className="doctor-avatar doctor-avatar-large">{initialsFromName(doctorName)}</div>
        <div>
          <StatusBadge status={profile?.estado ? 'Activo' : 'Inactivo'} />
          <h2>{doctorName}</h2>
          <div className="info-list">
            <span>Correo: {profile?.usuario?.correo || 'Sin correo'}</span>
            <span>Telefono: {profile?.usuario?.telefono || 'Sin telefono'}</span>
            <span>Especialidad: {profile?.especialidad?.nombre || 'Sin especialidad'}</span>
            <span>Cedula profesional: {profile?.cedulaProfesional || 'Sin cedula'}</span>
            <span>Consultorio: {profile?.consultorio || 'Sin consultorio'}</span>
          </div>
        </div>
      </Card>
      <Card title="Biografia profesional">
        <p className="muted-copy">{profile?.biografia || 'Sin biografia registrada.'}</p>
      </Card>
      {profile?.fotoUrl && (
        <Card title="Foto profesional">
          <img className="doctor-profile-photo" src={profile.fotoUrl} alt={doctorName} />
        </Card>
      )}
      <Card title="Aviso">
        <p className="muted-copy">La edicion del perfil profesional debe ser realizada por administracion.</p>
      </Card>
    </div>
  );
}
