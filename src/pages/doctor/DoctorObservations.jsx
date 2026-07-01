import { useEffect, useMemo, useState } from 'react';
import { Button } from '../../components/Button.jsx';
import { Card } from '../../components/Card.jsx';
import { DataTable } from '../../components/DataTable.jsx';
import { Modal } from '../../components/Modal.jsx';
import { getMyDoctorObservations } from '../../services/observations.service.js';
import { fullName, getErrorMessage, unwrapData } from '../../utils/doctorPanelFormat.js';

export function DoctorObservations() {
  const [observations, setObservations] = useState([]);
  const [selectedObservation, setSelectedObservation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function loadObservations() {
    try {
      setLoading(true);
      setError('');
      const response = await getMyDoctorObservations();
      setObservations(unwrapData(response) || []);
    } catch (requestError) {
      setError(getErrorMessage(requestError, 'No se pudieron cargar las observaciones.'));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadObservations();
  }, []);

  const rows = useMemo(() => observations.map((observation) => ({
    ...observation,
    fecha: observation.cita?.fecha ? new Date(observation.cita.fecha).toLocaleDateString('es-MX') : 'Sin fecha',
    paciente: fullName(observation.paciente?.usuario),
    cita: observation.cita?.folio || 'Sin folio',
    diagnostico: observation.diagnosticoInicial || 'Sin diagnostico',
  })), [observations]);

  const columns = [
    { key: 'fecha', label: 'Fecha' },
    { key: 'paciente', label: 'Paciente' },
    { key: 'cita', label: 'Cita' },
    { key: 'diagnostico', label: 'Diagnostico inicial' },
    { key: 'acciones', label: 'Acciones', render: (row) => <Button size="sm" variant="secondary" onClick={() => setSelectedObservation(row)}>Ver</Button> },
  ];

  return (
    <div className="dashboard-stack">
      {error && (
        <Card className="dashboard-state-card dashboard-error-card">
          <strong>{error}</strong>
          <Button size="sm" variant="secondary" onClick={loadObservations}>Reintentar</Button>
        </Card>
      )}

      <Card title="Observaciones registradas" subtitle="Notas clinicas creadas desde citas atendidas.">
        {loading ? (
          <p className="muted-copy">Cargando informacion...</p>
        ) : (
          <DataTable columns={columns} rows={rows} emptyText="No tienes observaciones registradas." />
        )}
      </Card>

      <Modal open={Boolean(selectedObservation)} title="Detalle de observacion" onClose={() => setSelectedObservation(null)}>
        {selectedObservation && (
          <div className="info-list">
            <span>Paciente: {selectedObservation.paciente}</span>
            <span>Cita: {selectedObservation.cita}</span>
            <span>Observaciones: {selectedObservation.observaciones}</span>
            <span>Diagnostico inicial: {selectedObservation.diagnosticoInicial || 'Sin diagnostico'}</span>
            <span>Recomendaciones: {selectedObservation.recomendaciones || 'Sin recomendaciones'}</span>
          </div>
        )}
      </Modal>
    </div>
  );
}
