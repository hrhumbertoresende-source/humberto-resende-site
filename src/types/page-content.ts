/** Paragraph/title strings across this file may contain `**bold**` markers, rendered via <RichText>. */

export interface SobreBioColumn {
  paragraphs: string[];
}

export interface SobreTimelineEntry {
  year: string;
  items: string[];
}

export interface SobreContent {
  tagline: string;
  profileImage: string;
  bioColumns: SobreBioColumn[];
  timelineColumns: SobreTimelineEntry[][];
}

export interface TrajetoriaSection {
  title: string;
  paragraphs: string[];
}

export interface TrajetoriaTimelineItem {
  periodo: string;
  cargo: string;
  local: string;
  texto: string;
}

export interface TrajetoriaContent {
  heroTitle: string;
  sections: TrajetoriaSection[];
  formacao: string[];
  ferramentas: string;
  idiomas: string[];
  linhaDoTempo: TrajetoriaTimelineItem[];
  clientes: string[];
}
