import { Bell, CalendarCheck, Eye, Search, Stethoscope, UserX } from 'lucide-react';
import { Button } from '../Button.jsx';
import { Card } from '../Card.jsx';
import { Select, Textarea } from '../FormControls.jsx';
import { StatusBadge } from '../StatusBadge.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import {
  canAttend,
  canMarkNoShow,
  fullName,
  initialsFromName,
} from '../../utils/doctorPanelFormat.js';

export function DoctorHeader({ title, subtitle }) {
  const { user } = useAuth();
  const doctorName = fullName(user);
  const specialtyName = user?.doctor?.especialidad?.nombre || 'Doctor';
  const today = new Intl.DateTimeFormat('es-MX', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date());

  return (
    <header className="panel-header doctor-header">
      <div>
        <p>Panel medico</p>
        <h1>{title}</h1>
        {subtitle && <span>{subtitle}</span>}
      </div>
      <div className="admin-header-tools">
        <span className="doctor-date">{today}</span>
        <label className="admin-search">
          <Search size={18} />
          <input placeholder="Buscar cita..." />
        </label>
        <button className="icon-btn" type="button" aria-label="Notificaciones">
          <Bell size={19} />
        </button>
        <div className="panel-user">
          <div>
            <strong>{doctorName}</strong>
            <span>{specialtyName}</span>
          </div>
          <div className="avatar" aria-hidden="true">{initialsFromName(doctorName)}</div>
        </div>
      </div>
    </header>
  );
}

export function DoctorActions({ row, onDetail, onAttend, onNoShow }) {
  return (
    <div className="doctor-table-actions">
      <Button size="sm" variant="secondary" onClick={() => onDetail?.(row)}>
        <Eye size={16} />
        Ver
      </Button>
      {canAttend(row.estado) && (
        <Button size="sm" onClick={() => onAttend?.(row)}>
          <Stethoscope size={16} />
          Atender
        </Button>
      )}
      {canMarkNoShow(row.estado) && (
        <Button size="sm" variant="ghost" onClick={() => onNoShow?.(row)}>
          <UserX size={16} />
          No asistio
        </Button>
      )}
    </div>
  );
}

export function PatientInfoCard({ appointment }) {
  const patient = appointment?.paciente?.usuario;

  return (
    <Card title="Informacion del paciente">
      <div className="info-list">
        <span>Paciente: {fullName(patient)}</span>
        <span>Telefono: {patient?.telefono || 'Sin telefono'}</span>
        <span>Correo: {patient?.correo || 'Sin correo'}</span>
      </div>
    </Card>
  );
}

export function AppointmentInfoCard({ appointment }) {
  return (
    <Card title="Informacion de cita">
      <div className="info-list">
        <span>Folio: {appointment?.folio || 'Sin folio'}</span>
        <span>Fecha: {appointment?.fecha || 'Sin fecha'}</span>
        <span>Hora inicio: {appointment?.horaInicio || 'Sin hora'}</span>
        <span>Hora fin: {appointment?.horaFin || 'Sin hora'}</span>
        <span>Especialidad: {appointment?.especialidad?.nombre || 'Sin especialidad'}</span>
        <span>Motivo: {appointment?.motivoConsulta || 'Sin motivo'}</span>
        <span>Estado actual: <StatusBadge status={appointment?.estado} /></span>
      </div>
    </Card>
  );
}

export function MedicalAttentionForm({ form, onChange, onSave, onCancel, saving = false }) {
  return (
    <Card title="Formulario de atencion medica">
      <form className="form-stack" onSubmit={onSave}>
        <Textarea
          label="Observaciones de la consulta *"
          placeholder="Describe los hallazgos principales de la consulta."
          value={form.observaciones}
          onChange={(event) => onChange({ ...form, observaciones: event.target.value })}
          required
        />
        <Textarea
          label="Diagnostico inicial"
          placeholder="Escribe un diagnostico inicial si aplica."
          value={form.diagnostico_inicial}
          onChange={(event) => onChange({ ...form, diagnostico_inicial: event.target.value })}
        />
        <Textarea
          label="Recomendaciones"
          placeholder="Indica recomendaciones, seguimiento o estudios sugeridos."
          value={form.recomendaciones}
          onChange={(event) => onChange({ ...form, recomendaciones: event.target.value })}
        />
        <Select label="Estado final" options={['ATENDIDA']} value="ATENDIDA" disabled />
        <div className="step-actions">
          <Button type="submit" disabled={saving}>
            <CalendarCheck size={17} />
            {saving ? 'Guardando...' : 'Guardar como atendida'}
          </Button>
          <Button type="button" variant="ghost" onClick={onCancel}>Cancelar</Button>
        </div>
      </form>
    </Card>
  );
}
