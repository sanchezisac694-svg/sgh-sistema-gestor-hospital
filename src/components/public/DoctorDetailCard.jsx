import { Award, FileBadge, Globe2, MapPin, Stethoscope } from 'lucide-react';
import { Button } from '../Button.jsx';
import { Card } from '../Card.jsx';
import { DataTable } from '../DataTable.jsx';
import { StatusBadge } from '../StatusBadge.jsx';
import { horariosDoctor } from '../../data/mockData.js';

export function DoctorDetailCard({ doctor, onSchedule }) {
  const columns = [
    { key: 'dia', label: 'Día' },
    { key: 'horario', label: 'Horario de atención' },
  ];

  return (
    <div className="doctor-detail-grid">
      <Card className="doctor-profile-card">
        <div className="doctor-profile-main">
          <div className="doctor-avatar doctor-avatar-large">{doctor.iniciales}</div>
          <div>
            <StatusBadge status="Disponible hoy" />
            <h1>{doctor.nombre}</h1>
            <p>{doctor.especialidad}</p>
            <div className="doctor-meta inline">
              <span><FileBadge size={16} /> Cédula {doctor.cedula}</span>
              <span><MapPin size={16} /> Consultorio {doctor.consultorio}</span>
            </div>
          </div>
        </div>
        <Button onClick={() => onSchedule?.(doctor)}>Agendar cita</Button>
      </Card>

      <Card title="Biografía profesional">
        <p className="muted-copy">
          Profesional médico con experiencia en atención, diagnóstico y seguimiento de pacientes. Brinda atención
          personalizada y seguimiento oportuno de acuerdo con las necesidades de cada paciente.
        </p>
      </Card>

      <Card title="Horario de atención">
        <DataTable columns={columns} rows={horariosDoctor} />
      </Card>

      <Card title="Información adicional">
        <div className="info-list">
          <span><Stethoscope size={17} /> Especialidad médica: {doctor.especialidad}</span>
          <span><MapPin size={17} /> Consultorio: {doctor.consultorio}</span>
          <span><FileBadge size={17} /> Cédula profesional: {doctor.cedula}</span>
          <span><Award size={17} /> Experiencia: {doctor.experiencia}</span>
          <span><Globe2 size={17} /> Idiomas: {doctor.idiomas}</span>
        </div>
      </Card>
    </div>
  );
}
