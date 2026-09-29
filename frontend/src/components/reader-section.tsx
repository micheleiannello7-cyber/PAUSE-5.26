// PAUSE — una sezione (capitolo) della lettura verticale continua: il testo
// vive direttamente sul fondo, senza card. Numero del capitolo grande e quasi
// trasparente come elemento grafico, occhiello "CAPITOLO X" nel colore del
// tema, titolo, corpo in paragrafi brevi. Nessun contenuto extra.
import { useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

import { Chapter, Story } from "@/src/api";
import { makeStyles, useTheme, spacing, typography, withAlpha } from "@/src/theme";
import { HighlightedTitle } from "@/src/components/highlighted-title";

// Larghezza di lettura controllata: su tablet il testo non si allarga oltre
// una riga confortevole, su telefono usa tutta la larghezza meno i margini.
export const READER_MAX_W = 640;
const LONG_PARAGRAPH = 520;
// Geometria della sezione (deve coincidere con gli stili qui sotto) e spazio
// riservato in fondo all'anticipazione del capitolo seguente (divisore + numero + titolo su due righe).
const SECTION_PAD_TOP = spacing.xxl + spacing.md;
const SECTION_PAD_BOTTOM = spacing.xl;
const PREVIEW_RESERVE = 170;

// Solo presentazione: il testo resta identico, ma un capitolo molto lungo
// viene mostrato in due paragrafi spezzati alla fine di una frase.
export function splitParagraphs(body: string): string[] {
  const lines = body.split(/\n+/).map((s) => s.trim()).filter(Boolean);
  if (lines.length > 1) return lines;
  const text = lines[0] ?? "";
  if (text.length <= LONG_PARAGRAPH) return [text];
  const mid = text.length / 2;
  let cut = -1;
  const re = /[.!?»"”]\s+/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text))) {
    const end = m.index + m[0].length;
    if (cut < 0 || Math.abs(end - mid) < Math.abs(cut - mid)) cut = end;
  }
  if (cut <= 0 || cut >= text.length - 40) return [text];
  return [text.slice(0, cut).trim(), text.slice(cut).trim()];
}

export function SectionDivider({ color }: { color?: string }) {
  const styles = useStyles();
  const { colors } = useTheme();
  const tint = color ?? colors.cyan;
  return (
    <View style={styles.divider} pointerEvents="none">
      <LinearGradient
        colors={[withAlpha(tint, 0), withAlpha(tint, 0.55), withAlpha(tint, 0)]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.dividerLine}
      />
    </View>
  );
}

// Solo presentazione: le mini lezioni numerano i passi nel titolo
// ("Passo 3 — Osserva"): nel lettore il numero non serve, resta il titolo.
export function stripStepPrefix(title: string): string {
  return title.replace(/^\s*(passo|step)\s*\d+\s*[—–\-:·]\s*/i, "").trim() || title;
}

// Un capitolo occupa una schermata: in alto numero, occhiello, titolo e testo;
// in fondo — se c'è un capitolo dopo — solo il suo numero e il titolo intero,
// attenuati: un'anticipazione, mai il testo. Il capitolo successivo vero inizia
// alla schermata seguente (la lettura avanza a capitoli, non a scorrimento).
export function ChapterSection({ chapter, story, eyebrow, next, minHeight, pageOverlap = 0 }: {
  chapter: Chapter; story: Story; eyebrow: string;
  /** Capitolo seguente (anticipazione in fondo alla schermata). */
  next?: Chapter | null;
  /** Altezza della schermata di lettura: il capitolo la riempie e l'anticipazione poggia sul fondo. */
  minHeight?: number;
  /** Capitoli su più schermate: di quanto la schermata seguente riprende la precedente (barra + una riga), così nessuna riga resta nascosta. */
  pageOverlap?: number;
}) {
  const styles = useStyles();
  const { colors } = useTheme();
  // Un solo colore per tutti i capitoli di tutte le storie: l'accento del tema
  // corrente dell'app (base = cyan), mai la categoria della storia.
  const tint = colors.brand;
  const number = String(chapter.number).padStart(2, "0");
  // Testo più alto di una schermata (caratteri grandi, telefoni bassi): il
  // capitolo occupa un numero intero di schermate, così l'anticipazione resta
  // in fondo all'ultima e il capitolo seguente inizia sempre su una schermata
  // nuova — mai la stessa intestazione due volte di seguito.
  const [contentH, setContentH] = useState(0);
  const total = SECTION_PAD_TOP + contentH + (next ? PREVIEW_RESERVE : 0) + SECTION_PAD_BOTTOM;
  const pages = minHeight && contentH > 0 ? Math.max(1, Math.ceil((total - pageOverlap) / (minHeight - pageOverlap))) : 1;
  const sectionH = minHeight ? pages * minHeight - (pages - 1) * pageOverlap : undefined;
  return (
    <View style={[styles.section, sectionH ? { minHeight: sectionH } : null]} testID={`deep-dive-chapter-${chapter.number}`}>
      <View style={styles.content} onLayout={(e) => { const h = Math.ceil(e.nativeEvent.layout.height); if (h !== contentH) setContentH(h); }}>
      <View>
        {/* Numero grande e quasi trasparente: elemento grafico, non informazione. */}
        <Text style={[styles.bigNumber, { color: withAlpha(tint, 0.13) }]} pointerEvents="none" testID={`reader-chapter-number-${chapter.number}`}>{number}</Text>
        <Text style={[styles.eyebrow, { color: tint }]} testID={`reader-chapter-eyebrow-${chapter.number}`}>{eyebrow.toUpperCase()}</Text>
        <HighlightedTitle
          title={stripStepPrefix(chapter.title)}
          highlight={story.highlight_words}
          highlightColor={tint}
          style={styles.title}
        />
      </View>
      <View style={styles.body}>
        {splitParagraphs(chapter.body).map((p, i) => (
          <Text key={i} style={styles.paragraph}>{p}</Text>
        ))}
      </View>
      </View>
      {next ? (
        <View style={styles.preview} testID={`reader-chapter-preview-${next.number}`}>
          <SectionDivider color={tint} />
          <View style={styles.previewHead}>
            <Text style={[styles.previewNumber, { color: withAlpha(tint, 0.1) }]} pointerEvents="none">{String(next.number).padStart(2, "0")}</Text>
            <Text style={[styles.eyebrow, styles.previewEyebrow, { color: withAlpha(tint, 0.55) }]}>{eyebrow.toUpperCase()}</Text>
            <HighlightedTitle
              title={stripStepPrefix(next.title)}
              highlight={story.highlight_words}
              highlightColor={withAlpha(tint, 0.55)}
              style={[styles.title, styles.previewTitle]}
            />
          </View>
        </View>
      ) : null}
    </View>
  );
}

const useStyles = makeStyles((colors) => ({
  section: {
    width: "100%", maxWidth: READER_MAX_W, alignSelf: "center",
    paddingHorizontal: spacing.xl, paddingTop: spacing.xxl + spacing.md, paddingBottom: spacing.xl,
    gap: spacing.sm + 2,
  },
  bigNumber: {
    position: "absolute", top: -spacing.lg, left: -4,
    fontFamily: typography.displayBold, fontSize: 96, lineHeight: 100, letterSpacing: -4,
  },
  divider: { alignItems: "center", marginBottom: spacing.lg },
  dividerLine: { width: "62%", height: 1, borderRadius: 1 },
  eyebrow: { fontFamily: typography.bodyBold, fontSize: 12, letterSpacing: 3, paddingTop: spacing.xxl, marginBottom: spacing.sm + 2 },
  title: {
    color: colors.textWarm, fontFamily: typography.displayBold, fontSize: 31, lineHeight: 37, letterSpacing: -0.7,
  },
  content: { gap: spacing.sm + 2 },
  body: { gap: spacing.md + 2, marginTop: spacing.sm },
  // Anticipazione del capitolo seguente: sul fondo della schermata, attenuata.
  preview: { marginTop: "auto", paddingTop: spacing.xl },
  previewHead: { paddingTop: spacing.md },
  previewNumber: {
    position: "absolute", top: -spacing.md, left: -3,
    fontFamily: typography.displayBold, fontSize: 72, lineHeight: 76, letterSpacing: -3,
  },
  previewEyebrow: { paddingTop: spacing.lg, marginBottom: spacing.xs },
  previewTitle: { fontSize: 26, lineHeight: 31, opacity: 0.5 },
  paragraph: { color: colors.textWarmSecondary, fontFamily: typography.body, fontSize: 17.5, lineHeight: 31, letterSpacing: 0.1 },
}));
