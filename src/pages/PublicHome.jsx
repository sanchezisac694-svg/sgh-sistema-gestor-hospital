import { useEffect, useMemo, useState } from 'react';
import { CalendarPlus, Clock3, Search, ShieldCheck, UserCheck } from 'lucide-react';
import { Button } from '../components/Button.jsx';
import { Card } from '../components/Card.jsx';
import { DoctorCard } from '../components/public/DoctorCard.jsx';
import { SearchSpecialtyBox } from '../components/public/SearchSpecialtyBox.jsx';
import { SpecialtyCard } from '../components/public/SpecialtyCard.jsx';
import { getPublicDoctors } from '../services/doctors.service.js';
import { getPublicSpecialties } from '../services/specialties.service.js';
import { doctorToCard, getErrorMessage, unwrapData } from '../utils/publicFormat.js';

const benefits = [
  { title: 'Agenda rapida', text: 'Selecciona especialidad, doctor, fecha y hora en pocos pasos.', icon: CalendarPlus },
  { title: 'Doctores verificados', text: 'Consulta informacion profesional, especialidad y consultorio.', icon: UserCheck },
  { title: 'Horarios disponibles', text: 'Visualiza unicamente espacios libres para agendar.', icon: Clock3 },
  { title: 'Gestion segura', text: 'Consulta y administra tus citas desde tu cuenta.', icon: ShieldCheck },
];

export function PublicHome({ navigate }) {
  const [especialidades, setEspecialidades] = useState([]);
  const [doctores, setDoctores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchEspecialidad, setSearchEspecialidad] = useState('');
  const doctorCards = useMemo(() => doctores.slice(0, 4).map(doctorToCard), [doctores]);

  async function loadHomeData() {
    try {
      setLoading(true);
      setError('');
      const [specialtiesResponse, doctorsResponse] = await Promise.all([
        getPublicSpecialties({ estado: true }),
        getPublicDoctors({ estado: true }),
      ]);
      setEspecialidades(unwrapData(specialtiesResponse) || []);
      setDoctores(unwrapData(doctorsResponse) || []);
    } catch (requestError) {
      setError(getErrorMessage(requestError, 'No se pudo cargar la informacion.'));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadHomeData();
  }, []);

  function goToDoctors(especialidadId = searchEspecialidad) {
    navigate(especialidadId ? `/doctores?especialidad=${especialidadId}` : '/doctores');
  }

  return (
    <main className="public-main page-stack">
      <section className="home-hero">
        <div className="hero-copy-light">
          <span className="eyebrow-light">Atencion medica organizada</span>
          <h1>Agenda tu cita medica de forma rapida y segura</h1>
          <p>Encuentra especialistas disponibles, consulta horarios y agenda tu cita en pocos pasos.</p>
          <div className="hero-actions">
            <Button onClick={() => navigate('/doctores')}>
              <Search size={18} />
              Buscar doctor
            </Button>
            <Button variant="secondary" onClick={() => navigate('/agendar-cita')}>
              <CalendarPlus size={18} />
              Agendar cita
            </Button>
          </div>
        </div>
        <div className="medical-visual" aria-label="Resumen visual de atencion medica">
          <div className="visual-card visual-card-main">
            <span>Especialidades activas</span>
            <strong>{especialidades.length}</strong>
            <p>Disponibles para consulta</p>
          </div>
          <div className="visual-card">
            <span>Doctores activos</span>
            <strong>{doctores.length}</strong>
          </div>
          <div className="visual-card">
            <span>Agenda</span>
            <strong>En linea</strong>
          </div>
        </div>
      </section>

      {error && (
        <Card className="dashboard-state-card dashboard-error-card">
          <strong>{error}</strong>
          <Button size="sm" variant="secondary" onClick={loadHomeData}>Reintentar</Button>
        </Card>
      )}

      <SearchSpecialtyBox
        specialties={especialidades.map((item) => ({ label: item.nombre, value: item.id }))}
        value={searchEspecialidad}
        onChange={setSearchEspecialidad}
        onSearch={() => goToDoctors()}
      />

      {loading ? (
        <Card><p className="muted-copy">Cargando informacion...</p></Card>
      ) : (
        <>
          <section className="content-section">
            <div className="section-heading">
              <span>Especialidades</span>
              <h2>Especialidades destacadas</h2>
            </div>
            <div className="specialty-grid">
              {especialidades.slice(0, 8).map((especialidad) => (
                <SpecialtyCard
                  key={especialidad.id}
                  name={especialidad.nombre}
                  description={especialidad.descripcion || 'Especialidad disponible para consulta medica.'}
                  onDoctors={() => goToDoctors(especialidad.id)}
                />
              ))}
            </div>
          </section>

          <section className="content-section">
            <div className="section-heading">
              <span>Equipo medico</span>
              <h2>Doctores destacados</h2>
            </div>
            <div className="doctor-grid">
              {doctorCards.map((doctor) => (
                <DoctorCard
                  key={doctor.id}
                  doctor={doctor}
                  onProfile={() => navigate(`/doctores/detalle/${doctor.id}`)}
                  onSchedule={() => navigate(`/agendar-cita?doctor=${doctor.id}&especialidad=${doctor.especialidadId}`)}
                />
              ))}
            </div>
          </section>
        </>
      )}

      <section className="benefit-grid">
        {benefits.map(({ title, text, icon: Icon }) => (
          <Card key={title} className="benefit-card">
            <div className="feature-icon"><Icon size={24} /></div>
            <h3>{title}</h3>
            <p>{text}</p>
          </Card>
        ))}
      </section>
    </main>
  );
}
