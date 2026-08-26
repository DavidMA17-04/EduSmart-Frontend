import { useEffect, useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserPlus } from 'lucide-react';
import { roleApi } from '@/features/manage-role';
import { UserForm, emptyUserForm, toCreatePayload, useUserForm, userApi } from '@/features/manage-user';
import type { Role } from '@/entities/role';
import type { AdministrativeUser } from '@/entities/user';
import { Button, Card } from '@/shared/ui';
import { HttpError } from '@/shared/api';
import styles from './UserPages.module.css';

export const UserCreatePage = () => {
  const navigate = useNavigate();
  const form = useUserForm();
  const [roles, setRoles] = useState<Role[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [createdUser, setCreatedUser] = useState<AdministrativeUser | null>(null);

  useEffect(() => {
    let active = true;
    roleApi.list()
      .then((items) => { if (active) setRoles(items); })
      .catch(() => { if (active) setRoles([]); });
    return () => { active = false; };
  }, []);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError(null);
    if (!form.validate()) return;

    setIsSubmitting(true);
    try {
      const user = await userApi.create(toCreatePayload(form.values));
      setCreatedUser(user);
    } catch (error) {
      setFormError(error instanceof HttpError ? error.message : 'No se pudo crear el usuario.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (createdUser) {
    return (
      <section className={styles.page}>
        <p className={styles.breadcrumb}>Administrativo <span>›</span> Usuarios <span>›</span> Registro</p>
        <Card className={styles.confirmation}>
          <h1>Usuario registrado</h1>
          <p>El registro de {createdUser.name ?? createdUser.email} se completó correctamente.</p>
          <div className={styles.actions}>
            <Button type="button" variant="secondary" onClick={() => { setCreatedUser(null); form.setValues(emptyUserForm); }}>
              Registrar otro
            </Button>
            <Button type="button" onClick={() => navigate(`/administrative/users/${createdUser.id}`)}>
              Ver ficha
            </Button>
          </div>
        </Card>
      </section>
    );
  }

  return (
    <section className={styles.page}>
      <p className={styles.breadcrumb}>Administrativo <span>›</span> Usuarios <span>›</span> Registro manual</p>
      <header className={styles.header}>
        <span className={styles.icon}><UserPlus size={22} /></span>
        <div>
          <h1>Registro manual de usuario</h1>
          <p>Complete los datos institucionales. El sistema valida cédula, correo y duplicados.</p>
        </div>
      </header>
      <Card>
        <UserForm
          values={form.values}
          errors={form.errors}
          roles={roles}
          isSubmitting={isSubmitting}
          submitLabel="Crear usuario"
          formError={formError}
          onChange={form.onChange}
          onSubmit={onSubmit}
          onCancel={() => navigate('/onboarding')}
        />
      </Card>
      <Link className={styles.backLink} to="/onboarding">Volver a incorporación</Link>
    </section>
  );
};
