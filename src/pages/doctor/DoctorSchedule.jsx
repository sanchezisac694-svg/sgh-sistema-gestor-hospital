import { useEffect, useMemo, useState } from 'react';
import { Button } from '../../components/Button.jsx';
import { Card } from '../../components/Card.jsx';
import { DataTable } from '../../components/DataTable.jsx';
import { StatusBadge } from '../../components/StatusBadge.jsx';
import { getMyDoctorSchedule } from '../../services/doctor-panel.service.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { getErrorMessage, scheduleToRow, unwrapData } from '../../utils/doctorPanelFormat.js';

export function DoctorSchedule() {
  const { user } = useAuth();
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const rows = useMemo(
    () => schedules.map((schedule) => scheduleToRow(schedule, user?.doctor?.consultorio)),
    [schedules, user]
  );

  async function loadSchedule() {
    try {
      setLoading(true);
      setError('');
      const response = await getMyDoctorSchedule();
      setSchedules(unwrapData(response) || []);
    } catch (requestError) {
      setError(getErrorMessage(requestError, 'No se pudo cargar el horario.'));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadSchedule();
  }, []);

  const columns = [
    { key: 'dia', label: 'Dia' },
    { key: 'horaInicio', label: 'Hora inicio' },
    { key: 'horaFin', label: 'Hora fin' },
    { key: 'duracionCita', label: 'Duracion cita' },
    { key: 'consultorio', label: 'Consultorio' },
    { key: 'estado', label: 'Estado', render: (row) => <StatusBadge status={row.estado ? 'Activo' : 'Inactivo'} /> },
  ];

  return (
    <div className="dashboard-stack">
      {error && (
        <Card className="dashboard-state-card dashboard-error-card">
          <strong>{error}</strong>
          <Button size="sm" variant="secondary" onClick={loadSchedule}>Reintentar</Button>
        </Card>
      )}

      <Card title="Mi horario" subtitle="Este horario es asignado por administracion. Para solicitar cambios, contacte al administrador del hospital.">
        {loading ? (
          <p className="muted-copy">Cargando informacion...</p>
        ) : (
          <DataTable columns={columns} rows={rows} emptyText="No tienes horarios asignados." />
        )}
      </Card>
    </div>
  );
}
