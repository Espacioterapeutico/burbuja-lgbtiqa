import type { CommunityPost } from '../types';

export interface FeedPostWithScore extends CommunityPost {
  calculatedScore?: number;
  feedCategory?: 'top_engagement' | 'fresh_discovery';
}

/**
 * ALGORITMO DE DISTRIBUCIÓN 75/25 (Exploitation vs Exploration)
 * 
 * 75% -> Contenido de Alto Engagement:
 *   - 45% Tiempo de permanencia / retención (Watch time / Dwell time)
 *   - 35% Comentarios (Conversación comunitaria activa)
 *   - 20% Likes (Reacción rápida)
 * 
 * 25% -> Contenido Nuevo / Descubrimiento Fresco:
 *   - Publicaciones recientes para resolver el problema de arranque en frío (Cold-Start)
 *   - Garantiza que nuevos miembros tengan alcance garantizado.
 */

export function calculateEngagementScore(post: CommunityPost): number {
  // 1. Tiempo de permanencia (Dwell Time / Watch Time) - Factor Rey
  const watchSeconds = post.avgWatchTimeSeconds || 5;
  const retentionMultiplier = (post.retentionRate || 0.6) * 100;
  const retentionScore = watchSeconds * 2.5 + retentionMultiplier * 1.5;

  // 2. Comentarios (Conversación profunda comunitaria)
  const commentsScore = (post.commentsCount || 0) * 8;

  // 3. Likes (Aprobación rápida)
  const likesScore = (post.likes || 0) * 2;

  // Fórmula ponderada
  return retentionScore * 0.45 + commentsScore * 0.35 + likesScore * 0.20;
}

export function build7525Feed(posts: CommunityPost[]): FeedPostWithScore[] {
  if (posts.length <= 1) return posts;

  // Clona para no mutar el original
  const pool = [...posts];

  // Ordenar para clasificar
  // 1. Candidatos de Alto Engagement (Mayor puntaje de permanencia, comentarios y likes)
  const engagementRanked = [...pool]
    .map(p => ({
      ...p,
      calculatedScore: calculateEngagementScore(p),
      feedCategory: 'top_engagement' as const
    }))
    .sort((a, b) => (b.calculatedScore || 0) - (a.calculatedScore || 0));

  // 2. Candidatos Frescos (Nuevos)
  const freshRanked = [...pool]
    .map(p => ({
      ...p,
      feedCategory: 'fresh_discovery' as const
    }))
    .sort((a, b) => {
      const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return timeB - timeA;
    });

  const result: FeedPostWithScore[] = [];
  const usedIds = new Set<string>();

  // Índices para cada pool
  let engIdx = 0;
  let freshIdx = 0;

  // Patrón de Ranuras (Slotting Pattern 3:1):
  // Cada bloque de 4 puestos = [ Top, Top, ✨ Nuevo, Top ]
  while (usedIds.size < pool.length) {
    // Ranura 1: Top Engagement
    while (engIdx < engagementRanked.length && usedIds.has(engagementRanked[engIdx].id)) {
      engIdx++;
    }
    if (engIdx < engagementRanked.length) {
      const p = engagementRanked[engIdx];
      result.push(p);
      usedIds.add(p.id);
      engIdx++;
    }

    // Ranura 2: Top Engagement
    while (engIdx < engagementRanked.length && usedIds.has(engagementRanked[engIdx].id)) {
      engIdx++;
    }
    if (engIdx < engagementRanked.length && usedIds.size < pool.length) {
      const p = engagementRanked[engIdx];
      result.push(p);
      usedIds.add(p.id);
      engIdx++;
    }

    // Ranura 3: ✨ Nuevo / Descubrimiento Fresco (25%)
    while (freshIdx < freshRanked.length && usedIds.has(freshRanked[freshIdx].id)) {
      freshIdx++;
    }
    if (freshIdx < freshRanked.length && usedIds.size < pool.length) {
      const p = freshRanked[freshIdx];
      result.push(p);
      usedIds.add(p.id);
      freshIdx++;
    } else {
      // Si ya se mostraron los frescos, rellena con engagement
      while (engIdx < engagementRanked.length && usedIds.has(engagementRanked[engIdx].id)) {
        engIdx++;
      }
      if (engIdx < engagementRanked.length && usedIds.size < pool.length) {
        const p = engagementRanked[engIdx];
        result.push(p);
        usedIds.add(p.id);
        engIdx++;
      }
    }

    // Ranura 4: Top Engagement
    while (engIdx < engagementRanked.length && usedIds.has(engagementRanked[engIdx].id)) {
      engIdx++;
    }
    if (engIdx < engagementRanked.length && usedIds.size < pool.length) {
      const p = engagementRanked[engIdx];
      result.push(p);
      usedIds.add(p.id);
      engIdx++;
    }

    // Salvaguarda
    if (engIdx >= engagementRanked.length && freshIdx >= freshRanked.length) {
      break;
    }
  }

  return result;
}
