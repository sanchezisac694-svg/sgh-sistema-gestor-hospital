import { useMemo, useState } from 'react';
import { Button } from '../../components/Button.jsx';
import { DataTable } from '../../components/DataTable.jsx';
import { Modal } from '../../components/Modal.jsx';
import { StatusBadge } from '../../components/StatusBadge.jsx';
import { FilterBar, FormSection, Pagination, TableActions } from '../../components/admin/AdminUi.jsx';
import { adminResources } from '../../data/adminData.js';

function isStatusColumn(label) {
  return ['Estado'].includes(label);
}

export function AdminResourcePage({ resourceKey }) {
  const [modal, setModal] = useState(null);
  const resource = adminResources[resourceKey] || adminResources.usuarios;

  const columns = useMemo(
    () =>
      resource.columns.map((label, index) => ({
        key: String(index),
        label,
        render: (row) => {
          if (label === 'Acciones') {
            return (
              <TableActions
                variant={resourceKey === 'citas' ? 'appointment' : resourceKey === 'pacientes' ? 'patient' : 'default'}
                onDetail={() => setModal(resourceKey === 'citas' ? 'detail' : 'form')}
              />
            );
          }
          if (isStatusColumn(label)) return <StatusBadge status={row[index]} />;
          return row[index];
        },
      })),
    [resource.columns, resourceKey]
  );

  const rows = resource.rows.map((row, rowIndex) => {
    const values = { id: `${resourceKey}-${rowIndex}` };
    row.forEach((value, index) => {
      values[index] = value;
    });
    values[resource.columns.length - 1] = 'actions';
    return values;
  });

  return (
    <div className="dashboard-stack">
      <FilterBar filters={resource.filters} actionLabel={resource.newLabel} onAction={() => setModal('form')} />
      <DataTable columns={columns} rows={rows} />
      <Pagination />

      <Modal
        open={modal === 'form'}
        title={resource.newLabel}
        onClose={() => setModal(null)}
        footer={
          <>
            <Button variant="ghost" onClick={() => setModal(null)}>Cancelar</Button>
            <Button onClick={() => setModal(null)}>Guardar</Button>
          </>
        }
      >
        <FormSection fields={resource.fields} />
      </Modal>

      <Modal
        open={modal === 'detail'}
        title="Detalle de cita"
        onClose={() => setModal(null)}
        footer={
          <>
            <Button variant="secondary">Confirmar cita</Button>
            <Button variant="ghost">Reprogramar cita</Button>
            <Button variant="danger">Cancelar cita</Button>
            <Button onClick={() => setModal(null)}>Cerrar</Button>
          </>
        }
      >
        <div className="detail-list">
          {resource.detail &&
            Object.entries(resource.detail).map(([key, value]) => (
              <div key={key}>
                <span>{key}</span>
                <strong>{value}</strong>
              </div>
            ))}
        </div>
      </Modal>
    </div>
  );
}
