import { Button } from '../../components/Button.jsx';
import { Card } from '../../components/Card.jsx';
import { Input, Select, Textarea } from '../../components/FormControls.jsx';

export function AdminSettings() {
  return (
    <div className="settings-grid">
      <Card title="Datos generales del hospital">
        <div className="admin-form-grid">
          <Input label="Nombre del hospital" defaultValue="SGH Hospital" />
          <Input label="Teléfono" defaultValue="55 1234 5678" />
          <Input label="Correo" defaultValue="contacto@sgh-hospital.mx" />
          <Input label="Horario general" defaultValue="Lun - Vie 08:00 - 18:00" />
          <Textarea label="Dirección" defaultValue="Av. Salud 120, Col. Centro Médico" className="span-2" />
        </div>
      </Card>

      <Card title="Configuración de citas">
        <div className="admin-form-grid">
          <Select label="Duración predeterminada de cita" options={['15 min', '20 min', '30 min', '45 min', '60 min']} />
          <Select label="Tiempo mínimo para cancelar cita" options={['2 horas', '6 horas', '12 horas', '24 horas']} />
          <Select label="Permitir citas pendientes automáticamente" options={['Sí', 'No']} />
          <Textarea label="Mensaje de confirmación" defaultValue="Tu cita ha sido solicitada correctamente." className="span-2" />
        </div>
      </Card>

      <Card title="Apariencia">
        <div className="admin-form-grid">
          <Input label="Logo del sistema" placeholder="logo-sgh.png" />
          <Input label="Color principal" defaultValue="#1E5AA8" />
          <Input label="Nombre visible del sistema" defaultValue="SGH - Sistema Gestor de Hospital" className="span-2" />
        </div>
      </Card>

      <div className="settings-actions">
        <Button>Guardar configuración</Button>
        <Button variant="ghost">Restablecer</Button>
      </div>
    </div>
  );
}
