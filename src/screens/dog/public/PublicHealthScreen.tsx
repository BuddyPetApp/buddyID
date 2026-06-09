import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { colors, font, fontSize, spacing } from '../../../tokens';
import { apiClient } from '../../../api/client';
import { DOG_COLORS, DOG_RADIUS, DOG_SHADOW, DogScreenShell } from '../_shared';

function isoToDisplay(iso?: string | null): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '';
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  return `${dd}/${mm}/${d.getFullYear()}`;
}

export default function PublicHealthScreen({ id }: { id?: string }) {
  const { t } = useTranslation();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [health, setHealth] = useState<any>({});

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    apiClient.get<any>(`/dogs/${id}/public`)
      .then((data: any) => {
        if (data && data.healthJson) {
          try {
            setHealth(JSON.parse(data.healthJson));
          } catch {}
        }
      })
      .catch((err: any) => {
        console.error('Error fetching health:', err);
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <DogScreenShell title={t('tutor.editHealthScreen.healthAndVets', 'Saúde e Veterinário')} onBack={() => router.replace(`/buddyid/public/${id}` as any)}>
        <View style={styles.loadingWrap}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </DogScreenShell>
    );
  }

  const { chipNumber, vaccines, deworming, allergies, medication, vet } = health;

  const hasVaccines = vaccines && vaccines.length > 0;
  const sortedVaccines = useMemo(
    () => (hasVaccines ? [...vaccines].sort((a, b) => b.date.localeCompare(a.date)) : []),
    [vaccines, hasVaccines]
  );

  const hasDeworming = deworming && (deworming.internal || deworming.external);
  const hasAllergies = allergies && ((allergies.tags && allergies.tags.length > 0) || allergies.other);
  const hasMedication = !!medication;
  const hasVet = vet && (vet.name || vet.clinic || vet.phone);

  return (
    <DogScreenShell
      title={t('tutor.editHealthScreen.healthAndVets', 'Saúde e Veterinário')}
      contentBackground={colors.canvas}
      onBack={() => router.replace(`/buddyid/public/${id}` as any)}
    >
      <ScrollView contentContainerStyle={styles.scroll}>

        {chipNumber && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>{t('tutor.editHealth.identification', 'Identificação')}</Text>
            <InfoRow label={t('tutor.editHealth.chipNumber', 'Número do Microchip')} value={chipNumber} />
          </View>
        )}

        {hasVaccines && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>{t('tutor.editHealth.vaccines', 'Vacinas')}</Text>
            <View style={styles.cardContent}>
              {sortedVaccines.map((v, i) => (
                <View key={i} style={[styles.vaccineRow, i > 0 && styles.rowDivider]}>
                  <Text style={styles.vaccineName}>{v.name}</Text>
                  <Text style={styles.vaccineDate}>{isoToDisplay(v.date)}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {hasDeworming && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>{t('tutor.editHealth.deworming', 'Desparasitação')}</Text>
            <View style={styles.cardContent}>
              {deworming.internal && (
                <InfoRow 
                  label={t('tutor.editHealth.internalDeworming', 'Desparasitação Interna')} 
                  value={`${isoToDisplay(deworming.internal.lastDate)} ${deworming.internal.product ? `(${deworming.internal.product})` : ''}`} 
                />
              )}
              {deworming.external && (
                <InfoRow 
                  label={t('tutor.editHealth.externalDeworming', 'Desparasitação Externa')} 
                  value={`${isoToDisplay(deworming.external.lastDate)} ${deworming.external.product ? `(${deworming.external.product})` : ''}`} 
                />
              )}
            </View>
          </View>
        )}

        {hasAllergies && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>{t('tutor.editHealth.allergies', 'Alergias')}</Text>
            <View style={styles.cardContent}>
              {allergies.tags && allergies.tags.length > 0 && (
                <InfoTags tags={allergies.tags.map((tKey: string) => t(tKey, tKey))} variant="danger" />
              )}
              {allergies.other && (
                <Text style={styles.blockText}>{allergies.other}</Text>
              )}
            </View>
          </View>
        )}

        {hasMedication && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>{t('tutor.editHealth.currentMedication', 'Medicação Atual')}</Text>
            <Text style={styles.blockText}>{medication}</Text>
          </View>
        )}

        {hasVet && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>{t('tutor.editHealth.vet', 'Veterinário Habitual')}</Text>
            <View style={styles.cardContent}>
              {vet.name && <InfoRow label="Nome" value={vet.name} />}
              {vet.clinic && <InfoRow label="Clínica" value={vet.clinic} />}
              {vet.phone && <InfoRow label="Telefone" value={vet.phone} />}
            </View>
          </View>
        )}

        {!chipNumber && !hasVaccines && !hasDeworming && !hasAllergies && !hasMedication && !hasVet && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>Não existe informação de saúde registada para este cão.</Text>
          </View>
        )}

      </ScrollView>
    </DogScreenShell>
  );
}

function InfoRow({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null;
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value}</Text>
    </View>
  );
}

function InfoTags({ tags, variant = 'normal' }: { tags: string[], variant?: 'normal' | 'danger' }) {
  if (!tags || tags.length === 0) return null;
  return (
    <View style={styles.tagsContainer}>
      {tags.map((tag) => (
        <View key={tag} style={[styles.tagBadge, variant === 'danger' && styles.tagBadgeDanger]}>
          <Text style={[styles.tagText, variant === 'danger' && styles.tagTextDanger]}>{tag}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  loadingWrap: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  scroll: { padding: spacing[4], paddingBottom: 60, gap: spacing[4] },
  card: {
    backgroundColor: DOG_COLORS.white,
    borderRadius: DOG_RADIUS.card,
    padding: spacing[5],
    ...DOG_SHADOW,
  },
  cardTitle: {
    fontFamily: font.bold,
    fontSize: fontSize.lg,
    color: colors.text,
    marginBottom: spacing[4],
  },
  cardContent: {
    gap: spacing[4],
  },
  row: {
    flexDirection: 'column',
    gap: spacing[1],
  },
  rowDivider: {
    borderTopWidth: 1,
    borderTopColor: colors.borderSoft,
    paddingTop: spacing[3],
    marginTop: spacing[1],
  },
  rowLabel: {
    fontFamily: font.medium,
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  rowValue: {
    fontFamily: font.semiBold,
    fontSize: fontSize.base,
    color: colors.text,
  },
  vaccineRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  vaccineName: {
    fontFamily: font.semiBold,
    fontSize: fontSize.base,
    color: colors.text,
  },
  vaccineDate: {
    fontFamily: font.medium,
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  blockText: {
    fontFamily: font.regular,
    fontSize: fontSize.base,
    color: colors.text,
    lineHeight: 22,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing[2],
  },
  tagBadge: {
    backgroundColor: colors.primarySurface,
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[2],
    borderRadius: DOG_RADIUS.pill,
  },
  tagBadgeDanger: {
    backgroundColor: '#FFE5E5',
  },
  tagText: {
    fontFamily: font.medium,
    fontSize: fontSize.sm,
    color: colors.primary,
  },
  tagTextDanger: {
    color: '#D32F2F',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: spacing[10],
  },
  emptyText: {
    fontFamily: font.medium,
    fontSize: fontSize.base,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});
