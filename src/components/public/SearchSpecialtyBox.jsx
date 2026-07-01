import { Search } from 'lucide-react';
import { Button } from '../Button.jsx';
import { Input, Select } from '../FormControls.jsx';

export function SearchSpecialtyBox({ specialties, value = '', onChange, onSearch }) {
  return (
    <section className="search-box">
      <div>
        <h2>Que especialista necesitas?</h2>
        <p>Busca por especialidad medica o nombre del doctor.</p>
      </div>
      <div className="search-fields">
        <Select
          label="Especialidad medica"
          options={specialties}
          value={value}
          onChange={(event) => onChange?.(event.target.value)}
        />
        <Input label="Nombre del doctor" placeholder="Ej. Juan Perez" />
        <Button onClick={onSearch}>
          <Search size={18} />
          Buscar
        </Button>
      </div>
    </section>
  );
}
