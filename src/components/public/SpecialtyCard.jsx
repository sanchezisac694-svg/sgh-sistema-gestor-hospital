import { Stethoscope } from 'lucide-react';
import { Button } from '../Button.jsx';
import { Card } from '../Card.jsx';

export function SpecialtyCard({ name, description, onDoctors }) {
  return (
    <Card className="specialty-card">
      <div className="feature-icon">
        <Stethoscope size={24} />
      </div>
      <h3>{name}</h3>
      <p>{description}</p>
      <Button variant="secondary" size="sm" onClick={onDoctors}>
        Ver doctores
      </Button>
    </Card>
  );
}
