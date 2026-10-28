export interface LegacyInput {
  id: string;
  learnerId: string;
  courseVersionId: string;
  issuedAt: Date;
  label: string;
  statement: string;
  completionPublicId: string;
  migratedToId: string | null;
}

export interface ExistingCompletion {
  id: string;
  publicId: string;
  legacyCertificateId: string | null;
}

export interface PlannedCompletion {
  legacyId: string;
  learnerId: string;
  courseVersionId: string;
  completedAt: Date;
  legacyLabel: string;
  publicId: string;
  source: "historical_import";
}

export interface MigrationPlan {
  toCreate: PlannedCompletion[];
  toLink: { legacyId: string; completionId: string }[];
  skippedIds: string[];
}

export function planHistoricalMigration(
  legacyRows: LegacyInput[],
  completions: ExistingCompletion[],
): MigrationPlan {
  const toCreate: PlannedCompletion[] = [];
  const toLink: { legacyId: string; completionId: string }[] = [];
  const skippedIds: string[] = [];

  for (const row of legacyRows) {
    if (row.migratedToId) {
      skippedIds.push(row.id);
      continue;
    }
    const already = completions.find((item) => item.legacyCertificateId === row.id);
    if (already) {
      toLink.push({ legacyId: row.id, completionId: already.id });
      continue;
    }
    const publicIdTaken = completions.some((item) => item.publicId === row.completionPublicId);
    if (publicIdTaken) {
      throw new Error(
        `Historical migration cannot reuse completion id ${row.completionPublicId}.`,
      );
    }
    toCreate.push({
      legacyId: row.id,
      learnerId: row.learnerId,
      courseVersionId: row.courseVersionId,
      completedAt: row.issuedAt,
      legacyLabel: row.label,
      publicId: row.completionPublicId,
      source: "historical_import",
    });
  }

  return { toCreate, toLink, skippedIds };
}
