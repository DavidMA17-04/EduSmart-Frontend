import { Download, Edit3, Plus, Trash2 } from 'lucide-react';
import { Alert, Button, Card, Pagination, Table } from '@/shared/ui';
import { SpecialtyTableRow } from '@/entities/specialty';
import { SpecialtyFilters, SpecialtyFormPanel } from '@/features/manage-specialty';
import { useSpecialtiesPanel } from '../model/useSpecialtiesPanel';
import styles from './SpecialtiesPanel.module.css';

export const SpecialtiesPanel = () => {
  const model = useSpecialtiesPanel();
  const formTitle = model.formMode === 'create' ? 'Nueva especialidad' : 'Detalle de la especialidad';

  return <section className={styles.layout}>
    <div className={styles.mainColumn}>
      <Card className={styles.tableCard}>
        <div className={styles.toolbar}>
          <SpecialtyFilters area={model.area} areas={model.areas} onAreaChange={model.setArea} onSearchChange={model.setSearch} onStatusChange={model.setStatus} search={model.search} status={model.status} />
          <div className={styles.toolbarActions}>
            <Button disabled type="button" variant="secondary"><Download size={15} /> Exportar</Button>
            <Button onClick={model.createSpecialty} type="button"><Plus size={15} /> Nueva especialidad</Button>
          </div>
        </div>
        {model.error && <Alert>{model.error}</Alert>}
        {model.mutationError && <Alert>{model.mutationError}</Alert>}
        {model.isLoading ? <p className={styles.muted}>Cargando especialidades…</p> : <Table><thead><tr><th>Código</th><th>Especialidad</th><th>Área</th><th>Descripción</th><th>Duración</th><th>Estado</th><th>Acciones</th></tr></thead><tbody>{model.specialties.map((specialty) => <SpecialtyTableRow actions={<span className={styles.rowActions}><Button aria-label={`Editar ${specialty.name}`} onClick={() => model.selectSpecialty(specialty.id)} type="button" variant="secondary"><Edit3 size={14} /></Button><Button aria-label={`Inactivar ${specialty.name}`} onClick={() => void model.deactivateSpecialty(specialty)} type="button" variant="danger"><Trash2 size={14} /></Button></span>} isSelected={specialty.id === model.selectedSpecialtyId} key={specialty.id} onSelect={model.selectSpecialty} specialty={specialty} />)}{model.specialties.length === 0 && <tr><td className={styles.empty} colSpan={7}>No se encontraron especialidades.</td></tr>}</tbody></Table>}
        <Pagination currentPage={model.currentPage} onPageChange={model.setCurrentPage} totalPages={model.totalPages} />
      </Card>
      <Alert>Las especialidades inactivas no estarán disponibles para la asignación en períodos académicos.</Alert>
    </div>
    <div className={styles.sidePanel}>
      <SpecialtyFormPanel areaOptions={model.areaOptions} isSubmitting={model.isSubmitting} onCancel={model.createSpecialty} onChange={model.specialtyForm.setField} onSubmit={model.specialtyForm.submit} title={formTitle} values={model.specialtyForm.values} />
    </div>
  </section>;
};
