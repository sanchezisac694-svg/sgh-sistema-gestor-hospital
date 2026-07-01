import { useState } from 'react';
import { RegisterPatientForm } from '../components/public/AuthForms.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { getReturnUrl, safeReturnUrl } from '../utils/publicFormat.js';

const initialForm = {
  nombre: '',
  apellido_paterno: '',
  apellido_materno: '',
  correo: '',
  telefono: '',
  fecha_nacimiento: '',
  sexo: 'NO_ESPECIFICADO',
  direccion: '',
  password: '',
  confirmPassword: '',
};

export function RegisterPage({ navigate }) {
  const { registerPatient } = useAuth();
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const returnUrl = safeReturnUrl(getReturnUrl());

  function updateForm(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function validateForm() {
    if (!form.nombre.trim()) return 'El nombre es obligatorio.';
    if (!form.apellido_paterno.trim()) return 'El apellido paterno es obligatorio.';
    if (!form.correo.trim()) return 'El correo es obligatorio.';
    if (form.password.length < 8) return 'La contrasena debe tener al menos 8 caracteres.';
    if (form.password !== form.confirmPassword) return 'Las contrasenas no coinciden.';
    return '';
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const validationError = validateForm();

    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setSubmitting(true);
      setError('');
      await registerPatient({
        nombre: form.nombre.trim(),
        apellido_paterno: form.apellido_paterno.trim(),
        apellido_materno: form.apellido_materno.trim() || null,
        correo: form.correo.trim(),
        password: form.password,
        telefono: form.telefono.trim() || null,
        fecha_nacimiento: form.fecha_nacimiento || null,
        sexo: form.sexo || 'NO_ESPECIFICADO',
        direccion: form.direccion.trim() || null,
      });
      navigate(returnUrl || '/paciente/inicio');
    } catch (requestError) {
      setError(requestError.message || 'No fue posible crear la cuenta.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="auth-page register-page">
      <RegisterPatientForm
        form={form}
        error={error}
        loading={submitting}
        onChange={updateForm}
        onSubmit={handleSubmit}
        onLogin={() => navigate(returnUrl ? `/login?returnUrl=${encodeURIComponent(returnUrl)}` : '/login')}
      />
    </main>
  );
}
