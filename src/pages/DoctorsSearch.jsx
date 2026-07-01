import { useEffect, useMemo, useState } from 'react';
import { Search, SlidersHorizontal } from 'lucide-react';
import { Button } from '../components/Button.jsx';
import { Card } from '../components/Card.jsx';
import { Input, Select } from '../components/FormControls.jsx';
import { DoctorCard } from '../components/public/DoctorCard.jsx';
import { getDoctorsBySpecialty, getPublicDoctors } from '../services/doctors.service.js';
import { getPublicSpecialties } from '../services/specialties.service.js';
import { doctorToCard, getErrorMessage, unwrapData } from '../utils/publicFormat.js';

export function DoctorsSearch({ navigate }) {
  const [doctores, setDoctores] = useState([]);
  const [especialidades, setEspecialidades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [especialidadId, setEspecialidadId] = useState('');
  const doctorCards = useMemo(() => doctores.map(doctorToCard), [doctores]);

  async function loadSpecialties() {
    try {
      const response = await getPublicSpecialties({ estado: true });
      setEspecialidades(unwrapData(response) || []);
    } catch {
      setError('No se pudieron cargar las especialidades.');
    }
  }

  async function loadDoctors(overrides = {}) {
    const nextSearch = Object.prototype.hasOwnProperty.call(overrides, 'search') ? overrides.search : search;
    const nextSpecialty = Object.prototype.hasOwnProperty.call(overrides, 'especialidadId') ? overrides.especialidadId : especialidadId;

    try {
      setLoading(true);
      setError('');
      const response = nextSpecialty
        ? await getDoctorsBySpecialty(nextSpecialty)
        : await getPublicDoctors({ estado: true, search: nextSearch || undefined });
      let data = unwrapData(response) || [];

      if (nextSearch) {
        const needle = nextSearch.toLowerCase();
        data = data.filter((doctor) => {
          const card = doctorToCard(doctor);
          return `${card.nombre} ${card.especialidad} ${card.cedula}`.toLowerCase().includes(needle);
        });
      }

      setDoctores(data);
    } catch (requestError) {
      setError(getErrorMessage(requestError, 'No se pudieron cargar los doctores.'));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const specialtyParam = params.get('especialidad') || '';
    setEspecialidadId(specialtyParam);
    loadSpecialties();
    loadDoctors({ especialidadId: specialtyParam });
  }, []);

  function clearFilters() {
    setSearch('');
    setEspecialidadId('');
    window.history.replaceState({}, '', '/doctores');
    loadDoctors({ search: '', especialidadId: '' });
  }

  function submitFilters() {
    const query = especialidadId ? `?especialidad=${especialidadId}` : '';
    window.history.replaceState({}, '', `/doctores${query}`);
    loadDoctors();
  }

  return (
    <main className="public-main page-stack">
      <section className="page-heading">
        <span>Doctores</span>
        <h1>Buscar doctores</h1>
        <p>Encuentra especialistas disponibles y agenda tu cita.</p>
      </section>

      <Card className="filter-card">
        <div className="filter-title">
          <SlidersHorizontal size={20} />
          <h2>Filtros</h2>
        </div>
        <div className="filter-grid">
          <Select
            label="Especialidad"
            options={especialidades.map((item) => ({ label: item.nombre, value: item.id }))}
            value={especialidadId}
            onChange={(event) => setEspecialidadId(event.target.value)}
          />
          <Input label="Nombre del doctor" placeholder="Buscar por nombre" value={search} onChange={(event) => setSearch(event.target.value)} />
          <Button onClick={submitFilters}>
            <Search size={18} />
            Buscar
          </Button>
          <Button variant="ghost" onClick={clearFilters}>Limpiar filtros</Button>
        </div>
      </Card>

      {error && (
        <Card className="dashboard-state-card dashboard-error-card">
          <strong>{error}</strong>
          <Button size="sm" variant="secondary" onClick={() => loadDoctors()}>Reintentar</Button>
        </Card>
      )}

      {loading ? (
        <Card><p className="muted-copy">Cargando informacion...</p></Card>
      ) : (
        <section className="doctor-grid">
          {doctorCards.length === 0 ? (
            <Card><p className="muted-copy">No se encontraron doctores con esa especialidad.</p></Card>
          ) : (
            doctorCards.map((doctor) => (
              <DoctorCard
                key={doctor.id}
                doctor={doctor}
                onProfile={() => navigate(`/doctores/detalle/${doctor.id}`)}
                onSchedule={() => navigate(`/agendar-cita?doctor=${doctor.id}&especialidad=${doctor.especialidadId}`)}
              />
            ))
          )}
        </section>
      )}
    </main>
  );
}
