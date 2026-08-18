import { ChevronDown } from 'lucide-react';
import { Card } from '@/shared/ui';
import { formatStudentCount } from '@/entities/group';
import type { SectionsGroupsPanelModel } from '../model/useSectionsGroupsPanel';
import styles from './SectionGroupsAccordion.module.css';

interface SectionGroupsAccordionProps {
  model: SectionsGroupsPanelModel;
}

export const SectionGroupsAccordion = ({ model }: SectionGroupsAccordionProps) => (
  <Card className={styles.sectionGroupsAccordion}>
    <div className={styles.header}>
      <h3>Grupos por nivel</h3>
      <p>Expanda un nivel para ver el detalle de sus grupos.</p>
    </div>
    {model.sections.map((section) => {
      const groups = section.groups ?? [];
      const isExpanded = model.expandedSectionIds.has(section.id);

      return (
        <article className={styles.item} key={section.id}>
          <button
            aria-expanded={isExpanded}
            className={styles.trigger}
            onClick={() => model.toggleSectionExpanded(section.id)}
            type="button"
          >
            <span className={styles.triggerLeft}>
              <ChevronDown className={`${styles.chevron} ${isExpanded ? styles.expanded : ''}`} size={16} />
              <strong>{section.code} - {section.name}</strong>
            </span>
            <span className={styles.badge}>{groups.length} {groups.length === 1 ? 'grupo' : 'grupos'}</span>
          </button>
          {isExpanded && (
            <div className={styles.content}>
              {groups.length === 0 ? (
                <p className={styles.empty}>Este nivel no tiene grupos registrados.</p>
              ) : (
                <ul className={styles.groupList}>
                  {groups.map((group) => (
                    <li className={styles.groupItem} key={group.id}>
                      <span><strong>{group.name}</strong></span>
                      <span className={styles.groupMeta}>
                        {formatStudentCount(group.studentCount)} · {group.guideTeacher?.name || 'Sin docente'}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </article>
      );
    })}
    {model.sections.length === 0 && !model.isLoading && (
      <p className={styles.empty}>No hay niveles académicos registrados.</p>
    )}
  </Card>
);
