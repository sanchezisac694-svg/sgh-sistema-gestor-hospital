import { useMemo, useState } from 'react';
import { CheckCircle2 } from 'lucide-react';
import { Button } from '../Button.jsx';
import { Card } from '../Card.jsx';
import { Input, Select, Textarea } from '../FormControls.jsx';
import { StatusBadge } from '../StatusBadge.jsx';
import { DoctorCard } from './DoctorCard.jsx';
import { doctores, especialidades, horariosDisponibles, horariosOcupados } from '../../data/mockData.js';

const steps = ['Especialidad', 'Doctor', 'Fecha', 'Hora', 'Motivo', 'Confirmación'];

export function TimeSlotButton({ time, selected, occupied, onClick }) {
  return (
    <button
      className={`time-slot ${selected ? 'is-selected' : ''} ${occupied ? 'is-disabled' : ''}`.trim()}
      type="button"
      disabled={occupied}
      onClick={() => onClick(time)}
    >
      {time}
      {occupied && <span>ocupado</span>}
    </button>
  );
}

export function AppointmentSummary({ values }) {
  return (
    <Card className="appointment-summary">
      <h3>Resumen de cita</h3>
      <dl>
        <div><dt>Especialidad</dt><dd>{values.especialidad}</dd></div>
        <div><dt>Doctor</dt><dd>{values.doctor?.nombre}</dd></div>
        <div><dt>Fecha</dt><dd>{values.fecha || '15/07/2026'}</dd></div>
        <div><dt>Hora</dt><dd>{values.hora || '10:30'} AM</dd></div>
        <div><dt>Consultorio</dt><dd>{values.doctor?.consultorio}</dd></div>
        <div><dt>Estado inicial</dt><dd><StatusBadge status="pendiente" /></dd></div>
        <div><dt>Motivo</dt><dd>{values.motivo || 'Dolor o molestia general'}</dd></div>
      </dl>
    </Card>
  );
}

export function AppointmentStepper({ initialDoctor }) {
  const [step, setStep] = useState(0);
  const [confirmed, setConfirmed] = useState(false);
  const [values, setValues] = useState({
    especialidad: initialDoctor?.especialidad || 'Cardiología',
    doctor: initialDoctor || doctores[0],
    fecha: '2026-07-15',
    hora: '10:30',
    motivo: 'Dolor o molestia general',
    notas: '',
  });

  const minDate = useMemo(() => new Date().toISOString().split('T')[0], []);
  const doctorsBySpecialty = doctores.filter((doctor) => doctor.especialidad === values.especialidad);

  function next() {
    setStep((current) => Math.min(current + 1, steps.length - 1));
  }

  function back() {
    setStep((current) => Math.max(current - 1, 0));
  }

  if (confirmed) {
    return (
      <Card className="success-card">
        <CheckCircle2 size={46} />
        <h1>Tu cita ha sido solicitada correctamente.</h1>
        <StatusBadge status="pendiente" />
        <p>Recibirás confirmación del hospital.</p>
      </Card>
    );
  }

  return (
    <section className="stepper-shell">
      <div className="stepper-track">
        {steps.map((label, index) => (
          <div key={label} className={`step-item ${index === step ? 'is-current' : ''} ${index < step ? 'is-done' : ''}`}>
            <span>{index + 1}</span>
            <p>{label}</p>
          </div>
        ))}
      </div>

      <Card className="step-card">
        {step === 0 && (
          <div className="step-content">
            <h2>Seleccionar especialidad</h2>
            <Select
              label="Especialidad médica"
              options={especialidades}
              value={values.especialidad}
              onChange={(event) => setValues({ ...values, especialidad: event.target.value })}
            />
            <div className="step-actions"><Button onClick={next}>Siguiente</Button></div>
          </div>
        )}

        {step === 1 && (
          <div className="step-content">
            <h2>Seleccionar doctor</h2>
            <div className="doctor-grid compact-grid">
              {(doctorsBySpecialty.length ? doctorsBySpecialty : doctores).map((doctor) => (
                <DoctorCard
                  key={doctor.id}
                  doctor={doctor}
                  compact
                  onProfile={() => setValues({ ...values, doctor })}
                  onSchedule={() => setValues({ ...values, doctor })}
                />
              ))}
            </div>
            <div className="step-actions">
              <Button variant="ghost" onClick={back}>Regresar</Button>
              <Button onClick={next}>Siguiente</Button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="step-content">
            <h2>Seleccionar fecha</h2>
            <Input
              label="Fecha disponible"
              type="date"
              min={minDate}
              value={values.fecha}
              onChange={(event) => setValues({ ...values, fecha: event.target.value })}
              helperText="Selecciona una fecha disponible para continuar."
            />
            <div className="step-actions">
              <Button variant="ghost" onClick={back}>Regresar</Button>
              <Button onClick={next}>Siguiente</Button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="step-content">
            <h2>Seleccionar hora disponible</h2>
            <div className="time-grid">
              {horariosDisponibles.map((time) => (
                <TimeSlotButton
                  key={time}
                  time={time}
                  selected={values.hora === time}
                  occupied={horariosOcupados.includes(time)}
                  onClick={(hora) => setValues({ ...values, hora })}
                />
              ))}
            </div>
            <div className="step-actions">
              <Button variant="ghost" onClick={back}>Regresar</Button>
              <Button onClick={next}>Siguiente</Button>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="step-content">
            <h2>Motivo de consulta</h2>
            <Textarea
              label="Motivo de consulta"
              placeholder="Describe brevemente el motivo de tu consulta."
              value={values.motivo}
              onChange={(event) => setValues({ ...values, motivo: event.target.value })}
            />
            <Textarea
              label="Notas adicionales opcionales"
              placeholder="Agrega información relevante para el doctor."
              value={values.notas}
              onChange={(event) => setValues({ ...values, notas: event.target.value })}
            />
            <div className="step-actions">
              <Button variant="ghost" onClick={back}>Regresar</Button>
              <Button onClick={next}>Siguiente</Button>
            </div>
          </div>
        )}

        {step === 5 && (
          <div className="step-content">
            <h2>Confirmación de cita</h2>
            <AppointmentSummary values={values} />
            <div className="step-actions">
              <Button variant="ghost" onClick={back}>Regresar</Button>
              <Button onClick={() => setConfirmed(true)}>Confirmar cita</Button>
            </div>
          </div>
        )}
      </Card>
    </section>
  );
}
