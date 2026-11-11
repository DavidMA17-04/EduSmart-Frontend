import { describe, expect, it } from 'vitest';
import { inboxNextStep, railState, resolveCaseStage, stepPhase } from './caseStage';

describe('resolveCaseStage', () => {
  it('en investigación con communicate pone el paso 3 como CTA principal', () => {
    const stage = resolveCaseStage({
      status: 'INVESTIGATING',
      track: 'DUE_PROCESS',
      actions: ['observe', 'requestInformation', 'communicate', 'archive', 'requestCounsel', 'followUp'],
    });
    expect(stage.reacStep).toBe(3);
    expect(stage.primaryAction).toBe('open_communicate');
    expect(stage.openCommunicateByDefault).toBe(true);
    expect(stage.secondaryActions).not.toContain('communicate');
    expect(stage.secondaryActions).not.toContain('followUp');
  });

  it('en reportada prioriza iniciar investigación', () => {
    const stage = resolveCaseStage({
      status: 'REPORTED',
      track: 'DUE_PROCESS',
      actions: ['investigate', 'requestCounsel', 'followUp'],
    });
    expect(stage.reacStep).toBe(1);
    expect(stage.primaryAction).toBe('investigate');
  });

  it('marca el riel hecho/actual/próximo', () => {
    expect(railState(1, 3)).toBe('done');
    expect(railState(3, 3)).toBe('current');
    expect(railState(5, 3)).toBe('upcoming');
  });

  it('resume qué toca en la bandeja', () => {
    expect(inboxNextStep({ status: 'INVESTIGATING', track: 'DUE_PROCESS' }).label).toBe(
      'Comunicar el cargo',
    );
    expect(inboxNextStep({ status: 'REPORTED', track: 'DUE_PROCESS' }).label).toBe(
      'Iniciar investigación',
    );
  });

  it('clasifica pasos como pasado, actual o futuro', () => {
    expect(stepPhase(2, 4)).toBe('past');
    expect(stepPhase(4, 4)).toBe('current');
    expect(stepPhase(5, 4)).toBe('future');
  });
});
