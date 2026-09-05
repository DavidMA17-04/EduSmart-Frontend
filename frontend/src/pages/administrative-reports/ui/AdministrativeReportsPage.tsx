import type { FormEvent } from 'react';
import { FileBarChart, FileSpreadsheet, FileText, Search } from 'lucide-react';
import {
  formatOptionalText,
  formatReportCalendarDate,
  formatReportDateTime,
  formatReportStatusLabel,
  reportStatusTone,
  useAdministrativeReports,
} from '@/features/administrative-reports';
import type {
  AcademicPeriodReportFilterDraft,
  AcademicPeriodReportRow,
  AcademicStructureReportFilterDraft,
  AcademicStructureReportRow,
  AdministrativeReportType,
  UserReportFilterDraft,
  UserReportRow,
} from '@/features/administrative-reports';
import { Alert, Badge, Button, Card, Input, Select, Table, Tabs } from '@/shared/ui';
import styles from './AdministrativeReportsPage.module.css';

const REPORT_TABS: Array<{ id: AdministrativeReportType; label: string }> = [
  { id: 'users', label: 'Usuarios' },
  { id: 'academic-structure', label: 'Estructura académica' },
  { id: 'academic-periods', label: 'Períodos académicos' },
];

function UsersFilters({
  draft,
  roles,
  onChange,
}: {
  draft: UserReportFilterDraft;
  roles: Array<{ id: number; name: string }>;
  onChange: <K extends keyof UserReportFilterDraft>(field: K, value: UserReportFilterDraft[K]) => void;
}) {
  return (
    <div className={styles.filters}>
      <label className={styles.search}>
        <Search aria-hidden="true" size={16} />
        <Input
          aria-label="Buscar usuarios"
          onChange={(event) => onChange('search', event.target.value)}
          placeholder="Buscar por nombre, cédula o correo…"
          value={draft.search}
        />
      </label>
      <Select
        aria-label="Filtrar por rol"
        className={styles.filterControl}
        onChange={(event) => onChange('roleId', event.target.value)}
        value={draft.roleId}
      >
        <option value="">Rol: Todos</option>
        {roles.map((role) => (
          <option key={role.id} value={role.id}>{role.name}</option>
        ))}
      </Select>
      <Select
        aria-label="Filtrar por estado de usuario"
        className={styles.filterControl}
        onChange={(event) => onChange('status', event.target.value)}
        value={draft.status}
      >
        <option value="">Estado: Todos</option>
        <option value="ACTIVE">Activas</option>
        <option value="INACTIVE">Inactivas</option>
        <option value="BLOCKED">Bloqueadas</option>
        <option value="PENDING">Pendientes</option>
      </Select>
    </div>
  );
}

function StructureFilters({
  draft,
  academicPeriods,
  specialties,
  gradeLevels,
  onChange,
}: {
  draft: AcademicStructureReportFilterDraft;
  academicPeriods: Array<{ id: string | number; name: string }>;
  specialties: Array<{ id: number; name: string }>;
  gradeLevels: number[];
  onChange: <K extends keyof AcademicStructureReportFilterDraft>(
    field: K,
    value: AcademicStructureReportFilterDraft[K],
  ) => void;
}) {
  return (
    <div className={styles.filters}>
      <Select
        aria-label="Filtrar por período académico"
        className={styles.filterControl}
        onChange={(event) => onChange('academicPeriodId', event.target.value)}
        value={draft.academicPeriodId}
      >
        <option value="">Período: Todos</option>
        {academicPeriods.map((period) => (
          <option key={period.id} value={String(period.id)}>{period.name}</option>
        ))}
      </Select>
      <Select
        aria-label="Filtrar por nivel"
        className={styles.filterControl}
        onChange={(event) => onChange('gradeLevel', event.target.value)}
        value={draft.gradeLevel}
      >
        <option value="">Nivel: Todos</option>
        {gradeLevels.map((level) => (
          <option key={level} value={level}>{level}</option>
        ))}
      </Select>
      <Select
        aria-label="Filtrar por especialidad"
        className={styles.filterControl}
        onChange={(event) => onChange('specialtyId', event.target.value)}
        value={draft.specialtyId}
      >
        <option value="">Especialidad: Todas</option>
        {specialties.map((specialty) => (
          <option key={specialty.id} value={specialty.id}>{specialty.name}</option>
        ))}
      </Select>
      <Select
        aria-label="Filtrar por estado de estructura académica"
        className={styles.filterControl}
        onChange={(event) => onChange('status', event.target.value)}
        value={draft.status}
      >
        <option value="">Estado: Todos</option>
        <option value="ACTIVE">Activos</option>
        <option value="INACTIVE">Inactivos</option>
      </Select>
    </div>
  );
}

function PeriodFilters({
  draft,
  onChange,
}: {
  draft: AcademicPeriodReportFilterDraft;
  onChange: <K extends keyof AcademicPeriodReportFilterDraft>(
    field: K,
    value: AcademicPeriodReportFilterDraft[K],
  ) => void;
}) {
  return (
    <div className={styles.filters}>
      <Select
        aria-label="Filtrar por estado de período"
        className={styles.filterControl}
        onChange={(event) => onChange('status', event.target.value)}
        value={draft.status}
      >
        <option value="">Estado: Todos</option>
        <option value="PLANNED">Planificados</option>
        <option value="ACTIVE">Activos</option>
        <option value="CLOSED">Cerrados</option>
      </Select>
      <label className={styles.filterField}>
        Fecha de inicio
        <Input
          aria-label="Fecha de inicio"
          onChange={(event) => onChange('startDate', event.target.value)}
          type="date"
          value={draft.startDate}
        />
      </label>
      <label className={styles.filterField}>
        Fecha de fin
        <Input
          aria-label="Fecha de fin"
          min={draft.startDate || undefined}
          onChange={(event) => onChange('endDate', event.target.value)}
          type="date"
          value={draft.endDate}
        />
      </label>
    </div>
  );
}

function UsersTable({ rows }: { rows: UserReportRow[] }) {
  return (
    <Table>
      <thead>
        <tr>
          <th>Identificación</th>
          <th>Nombre completo</th>
          <th>Correo</th>
          <th>Teléfono</th>
          <th>Roles</th>
          <th>Estado</th>
          <th>Fecha de registro</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <tr key={row.id}>
            <td>{formatOptionalText(row.nationalId)}</td>
            <td>{formatOptionalText(row.fullName)}</td>
            <td>{formatOptionalText(row.email)}</td>
            <td>{formatOptionalText(row.phone)}</td>
            <td>{row.roles.length > 0 ? row.roles.join(', ') : '—'}</td>
            <td>
              <Badge tone={reportStatusTone(row.status)}>
                {formatReportStatusLabel(row.status, 'user')}
              </Badge>
            </td>
            <td>{formatReportDateTime(row.createdAt)}</td>
          </tr>
        ))}
        {rows.length === 0 && (
          <tr>
            <td className={styles.empty} colSpan={7}>
              No se encontraron usuarios para los filtros seleccionados.
            </td>
          </tr>
        )}
      </tbody>
    </Table>
  );
}

function StructureTable({ rows }: { rows: AcademicStructureReportRow[] }) {
  return (
    <Table>
      <thead>
        <tr>
          <th>Grupo</th>
          <th>Sección</th>
          <th>Nivel</th>
          <th>Especialidad</th>
          <th>Cantidad de estudiantes</th>
          <th>Período académico</th>
          <th>Docente guía</th>
          <th>Estado</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <tr key={row.groupId}>
            <td>{formatOptionalText(row.groupName)}</td>
            <td>{formatOptionalText(row.sectionName)}</td>
            <td>{row.gradeLevel}</td>
            <td>{formatOptionalText(row.specialty)}</td>
            <td>{row.studentCount}</td>
            <td>{formatOptionalText(row.academicPeriod)}</td>
            <td>{formatOptionalText(row.guideTeacher)}</td>
            <td>
              <Badge tone={reportStatusTone(row.status)}>
                {formatReportStatusLabel(row.status)}
              </Badge>
            </td>
          </tr>
        ))}
        {rows.length === 0 && (
          <tr>
            <td className={styles.empty} colSpan={8}>
              No se encontraron registros de estructura académica para los filtros seleccionados.
            </td>
          </tr>
        )}
      </tbody>
    </Table>
  );
}

function PeriodsTable({ rows }: { rows: AcademicPeriodReportRow[] }) {
  return (
    <Table>
      <thead>
        <tr>
          <th>Nombre</th>
          <th>Fecha inicio</th>
          <th>Fecha fin</th>
          <th>Estado</th>
          <th>Fecha de creación</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <tr key={row.id}>
            <td>{formatOptionalText(row.name)}</td>
            <td>{formatReportCalendarDate(row.startDate)}</td>
            <td>{formatReportCalendarDate(row.endDate)}</td>
            <td>
              <Badge tone={reportStatusTone(row.status)}>
                {formatReportStatusLabel(row.status)}
              </Badge>
            </td>
            <td>{formatReportDateTime(row.createdAt)}</td>
          </tr>
        ))}
        {rows.length === 0 && (
          <tr>
            <td className={styles.empty} colSpan={5}>
              No se encontraron períodos académicos para los filtros seleccionados.
            </td>
          </tr>
        )}
      </tbody>
    </Table>
  );
}

function loadingMessage(reportType: AdministrativeReportType): string {
  if (reportType === 'users') return 'Cargando reporte de usuarios…';
  if (reportType === 'academic-structure') return 'Cargando reporte de estructura académica…';
  return 'Cargando reporte de períodos académicos…';
}

function formatRecordCount(count: number): string {
  return count === 1 ? '1 registro encontrado' : `${count} registros encontrados`;
}

export const AdministrativeReportsPage = () => {
  const model = useAdministrativeReports();
  const currentRows =
    model.reportType === 'users'
      ? model.users
      : model.reportType === 'academic-structure'
        ? model.structureRows
        : model.periods;

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    model.applyFilters();
  };

  return (
    <section className={styles.page}>
      <p className={styles.breadcrumb}>
        Administrativo <span>›</span> Reportes administrativos
      </p>
      <header className={styles.header}>
        <span className={styles.icon}>
          <FileBarChart size={22} />
        </span>
        <div>
          <h1>Reportes Administrativos</h1>
          <p>Consulta, filtra y exporta información administrativa del sistema.</p>
        </div>
      </header>

      <Tabs items={REPORT_TABS} onChange={model.setReportType} value={model.reportType} />

      <Card className={styles.tableCard}>
        <form className={styles.toolbar} onSubmit={onSubmit}>
          {model.reportType === 'users' && (
            <UsersFilters
              draft={model.userDraft}
              onChange={(field, value) => model.setUserDraft((current) => ({ ...current, [field]: value }))}
              roles={model.roles}
            />
          )}
          {model.reportType === 'academic-structure' && (
            <StructureFilters
              academicPeriods={model.academicPeriods}
              draft={model.structureDraft}
              gradeLevels={model.gradeLevels}
              onChange={(field, value) => model.setStructureDraft((current) => ({ ...current, [field]: value }))}
              specialties={model.specialties}
            />
          )}
          {model.reportType === 'academic-periods' && (
            <PeriodFilters
              draft={model.periodDraft}
              onChange={(field, value) => model.setPeriodDraft((current) => ({ ...current, [field]: value }))}
            />
          )}

          <div className={styles.actionRow}>
            <div className={styles.filterActions}>
              <Button type="submit">Aplicar filtros</Button>
              <Button onClick={model.clearFilters} type="button" variant="secondary">
                Limpiar filtros
              </Button>
            </div>
            <div className={styles.exportActions}>
              <Button
                disabled={model.exportingFormat !== null}
                onClick={() => void model.exportReport('pdf')}
                type="button"
                variant="secondary"
              >
                <FileText size={16} />
                {model.exportingFormat === 'pdf' ? 'Exportando PDF…' : 'Exportar PDF'}
              </Button>
              <Button
                disabled={model.exportingFormat !== null}
                onClick={() => void model.exportReport('excel')}
                type="button"
                variant="secondary"
              >
                <FileSpreadsheet size={16} />
                {model.exportingFormat === 'excel' ? 'Exportando Excel…' : 'Exportar Excel'}
              </Button>
            </div>
          </div>
        </form>

        {model.filterError && <Alert>{model.filterError}</Alert>}
        {model.error && <Alert>{model.error}</Alert>}
        {model.exportError && <Alert>{model.exportError}</Alert>}

        {model.isLoading ? (
          <p className={styles.muted}>{loadingMessage(model.reportType)}</p>
        ) : (
          <>
            {!model.error && (
              <p className={styles.resultCount}>{formatRecordCount(currentRows.length)}</p>
            )}
            {model.reportType === 'users' && <UsersTable rows={model.users} />}
            {model.reportType === 'academic-structure' && <StructureTable rows={model.structureRows} />}
            {model.reportType === 'academic-periods' && <PeriodsTable rows={model.periods} />}
          </>
        )}
      </Card>
    </section>
  );
};
