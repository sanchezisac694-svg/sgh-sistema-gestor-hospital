import { CalendarPlus, FileBadge, MapPin } from 'lucide-react';
import { Button } from '../Button.jsx';
import { Card } from '../Card.jsx';
import { StatusBadge } from '../StatusBadge.jsx';

export function DoctorCard({ doctor, onProfile, onSchedule, compact = false }) {
  return (
    <Card className={`doctor-card ${compact ? 'doctor-card-compact' : ''}`.trim()}>
      <div className="doctor-card-top">
        <div className="doctor-avatar">{doctor.iniciales}</div>
        <div>
          <h3>{doctor.nombre}</h3>
          <p>{doctor.especialidad}</p>
        </div>
      </div>
      <div className="doctor-meta">
        <span>
          <FileBadge size={16} />
          Cédula {doctor.cedula}
        </span>
        <span>
          <MapPin size={16} />
          Consultorio {doctor.consultorio}
        </span>
        <span>
          <CalendarPlus size={16} />
          Disponible {doctor.disponibilidad}
        </span>
      </div>
      <StatusBadge status={doctor.estado} />
      <div className="doctor-actions">
        <Button variant="secondary" size="sm" onClick={() => onProfile?.(doctor)}>
          Ver perfil
        </Button>
        <Button size="sm" onClick={() => onSchedule?.(doctor)}>
          {compact ? 'Seleccionar' : 'Agendar cita'}
        </Button>
      </div>
    </Card>
  );
}
