import { Button } from '../Button.jsx';
import { Card } from '../Card.jsx';
import { Input, Select } from '../FormControls.jsx';

export function LoginForm({
  correo,
  password,
  error,
  loading,
  onCorreoChange,
  onPasswordChange,
  onSubmit,
  onRegister,
}) {
  return (
    <Card className="auth-card">
      <div className="auth-brand">
        <strong>SGH</strong>
        <span>Sistema Gestor de Hospital</span>
      </div>
      <h1>Iniciar sesion</h1>
      <p>Accede a tu cuenta para consultar y gestionar tus citas.</p>
      <form className="form-stack" onSubmit={onSubmit}>
        <Input
          label="Correo electronico"
          type="email"
          placeholder="paciente@correo.com"
          value={correo}
          onChange={(event) => onCorreoChange(event.target.value)}
          autoComplete="email"
          required
        />
        <Input
          label="Contrasena"
          type="password"
          placeholder="Ingresa tu contrasena"
          value={password}
          onChange={(event) => onPasswordChange(event.target.value)}
          autoComplete="current-password"
          required
        />
        {error && (
          <div className="auth-error" role="alert">
            {error}
          </div>
        )}
        <Button className="full-width" type="submit" disabled={loading}>
          {loading ? 'Validando...' : 'Iniciar sesion'}
        </Button>
        <Button className="full-width" type="button" variant="secondary" onClick={onRegister}>
          Crear cuenta
        </Button>
      </form>
      <div className="auth-links">
        <a href="#recuperar">Olvide mi contrasena</a>
        <button type="button" onClick={onRegister}>No tengo cuenta, registrarme</button>
      </div>
    </Card>
  );
}

export function RegisterPatientForm({ form, error, loading, onChange, onSubmit, onLogin }) {
  return (
    <Card className="register-card">
      <div className="auth-brand">
        <strong>SGH</strong>
        <span>Registro de paciente</span>
      </div>
      <h1>Crear cuenta</h1>
      <p>Completa tus datos para preparar tu expediente de paciente.</p>
      <form className="form-stack" onSubmit={onSubmit}>
        <div className="register-grid">
          <Input label="Nombre *" placeholder="Nombre" value={form.nombre} onChange={(event) => onChange('nombre', event.target.value)} required />
          <Input label="Apellido paterno *" placeholder="Apellido paterno" value={form.apellido_paterno} onChange={(event) => onChange('apellido_paterno', event.target.value)} required />
          <Input label="Apellido materno" placeholder="Apellido materno" value={form.apellido_materno} onChange={(event) => onChange('apellido_materno', event.target.value)} />
          <Input label="Correo electronico *" type="email" placeholder="correo@ejemplo.com" value={form.correo} onChange={(event) => onChange('correo', event.target.value)} required />
          <Input label="Telefono" placeholder="55 0000 0000" value={form.telefono} onChange={(event) => onChange('telefono', event.target.value)} />
          <Input label="Fecha de nacimiento" type="date" value={form.fecha_nacimiento} onChange={(event) => onChange('fecha_nacimiento', event.target.value)} />
          <Select
            label="Sexo"
            options={[
              { label: 'Femenino', value: 'FEMENINO' },
              { label: 'Masculino', value: 'MASCULINO' },
              { label: 'Otro', value: 'OTRO' },
              { label: 'Prefiero no especificar', value: 'NO_ESPECIFICADO' },
            ]}
            value={form.sexo}
            onChange={(event) => onChange('sexo', event.target.value)}
          />
          <Input label="Direccion" placeholder="Calle, numero, colonia" value={form.direccion} onChange={(event) => onChange('direccion', event.target.value)} />
          <Input label="Contrasena *" type="password" placeholder="Crea una contrasena" value={form.password} onChange={(event) => onChange('password', event.target.value)} required />
          <Input label="Confirmar contrasena *" type="password" placeholder="Confirma tu contrasena" value={form.confirmPassword} onChange={(event) => onChange('confirmPassword', event.target.value)} required />
        </div>
        {error && <div className="auth-error" role="alert">{error}</div>}
        <div className="auth-actions">
          <Button type="submit" disabled={loading}>{loading ? 'Creando...' : 'Crear cuenta'}</Button>
          <Button type="button" variant="secondary" onClick={onLogin}>Ya tengo cuenta</Button>
        </div>
      </form>
    </Card>
  );
}
