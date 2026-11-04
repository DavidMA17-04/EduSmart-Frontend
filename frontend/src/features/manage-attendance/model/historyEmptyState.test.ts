import { describe, expect, it } from 'vitest';
import { HISTORY_EMPTY_COPY, resolveHistoryEmptyKind } from './historyEmptyState';

describe('resolveHistoryEmptyKind', () => {
  it('reports no links for a guardian without represented students', () => {
    expect(
      resolveHistoryEmptyKind({ isGuardianView: true, represented: [], errorStatus: null }),
    ).toBe('no-links');
  });

  it('reports no records for a guardian with represented students', () => {
    expect(
      resolveHistoryEmptyKind({
        isGuardianView: true,
        represented: [{ id: 1 }],
        errorStatus: null,
      }),
    ).toBe('no-records');
  });

  it('does not claim missing links before the guardian response arrives', () => {
    expect(
      resolveHistoryEmptyKind({
        isGuardianView: true,
        represented: undefined,
        errorStatus: null,
      }),
    ).toBe('no-records');
  });

  it('reports forbidden on 403 regardless of role', () => {
    expect(
      resolveHistoryEmptyKind({ isGuardianView: false, represented: undefined, errorStatus: 403 }),
    ).toBe('forbidden');
  });

  it('uses distinct copy for each cause', () => {
    const titles = new Set(Object.values(HISTORY_EMPTY_COPY).map((c) => c.title));
    expect(titles.size).toBe(3);
  });
});
