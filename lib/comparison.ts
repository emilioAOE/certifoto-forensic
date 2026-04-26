/**
 * Comparacion entre dos actas (tipicamente entrega vs devolucion) de la
 * misma propiedad.
 *
 * Devuelve un diff por ambiente: para cada ambiente que existe en ambas
 * actas, parea fotos similares usando pHash distance y reporta los cambios
 * detectables.
 */

import type { Acta, PhotoEvidence, Room } from "./acta-types";
import {
  classifyChange,
  hammingDistance,
  type ChangeLevel,
} from "./phash-distance";

export interface PhotoPair {
  before: PhotoEvidence;
  after: PhotoEvidence | null;
  distance: number;
  changeLevel: ChangeLevel;
}

export interface RoomComparison {
  roomName: string;
  roomTypeBefore: Room["type"];
  roomTypeAfter: Room["type"] | null;
  beforeRoomId: string;
  afterRoomId: string | null;
  pairs: PhotoPair[];
  unmatchedAfter: PhotoEvidence[]; // fotos que estan en after pero no se parearon a ninguna de before
  conditionBefore: Room["generalCondition"];
  conditionAfter: Room["generalCondition"] | null;
  observationsBefore: string | null;
  observationsAfter: string | null;
  worstChange: ChangeLevel;
}

export interface ActaComparison {
  before: Acta;
  after: Acta;
  rooms: RoomComparison[];
  /** Ambientes que estan en `before` pero no en `after` */
  removedRooms: Room[];
  /** Ambientes que estan en `after` pero no en `before` */
  addedRooms: Room[];
  summary: {
    totalRooms: number;
    roomsWithChanges: number;
    photosCompared: number;
    photosOnlyInAfter: number;
    photosOnlyInBefore: number;
    worstChange: ChangeLevel;
  };
}

const PAIRING_DISTANCE_THRESHOLD = 28; // sobre 64 bits, mas que esto se considera no pareable

/**
 * Compara dos actas. Asume que `before` es la entrega y `after` la devolucion.
 */
export function compareActas(before: Acta, after: Acta): ActaComparison {
  const beforeRoomsByType = groupRoomsByType(before.rooms);
  const afterRoomsByType = groupRoomsByType(after.rooms);

  const allTypes = new Set([
    ...Object.keys(beforeRoomsByType),
    ...Object.keys(afterRoomsByType),
  ]);

  const rooms: RoomComparison[] = [];
  const removedRooms: Room[] = [];
  const addedRooms: Room[] = [];

  for (const type of allTypes) {
    const beforeList = beforeRoomsByType[type] ?? [];
    const afterList = afterRoomsByType[type] ?? [];

    if (beforeList.length === 0) {
      // Solo en after
      addedRooms.push(...afterList);
      continue;
    }
    if (afterList.length === 0) {
      // Solo en before
      removedRooms.push(...beforeList);
      continue;
    }

    // Pareamos 1-a-1 por orden (no es perfecto pero es predecible)
    const pairCount = Math.max(beforeList.length, afterList.length);
    for (let i = 0; i < pairCount; i++) {
      const beforeRoom = beforeList[i];
      const afterRoom = afterList[i];

      if (beforeRoom && !afterRoom) {
        removedRooms.push(beforeRoom);
        continue;
      }
      if (!beforeRoom && afterRoom) {
        addedRooms.push(afterRoom);
        continue;
      }
      if (!beforeRoom || !afterRoom) continue;

      const beforePhotos = before.photos.filter(
        (p) => p.roomId === beforeRoom.id
      );
      const afterPhotos = after.photos.filter((p) => p.roomId === afterRoom.id);

      const { pairs, unmatchedAfter } = pairPhotos(beforePhotos, afterPhotos);

      const worstChange = computeWorstChange(pairs);

      rooms.push({
        roomName: beforeRoom.name,
        roomTypeBefore: beforeRoom.type,
        roomTypeAfter: afterRoom.type,
        beforeRoomId: beforeRoom.id,
        afterRoomId: afterRoom.id,
        pairs,
        unmatchedAfter,
        conditionBefore: beforeRoom.generalCondition,
        conditionAfter: afterRoom.generalCondition,
        observationsBefore: beforeRoom.manualObservations,
        observationsAfter: afterRoom.manualObservations,
        worstChange,
      });
    }
  }

  // Ordenar por gravedad de cambio (los con mayor cambio primero)
  rooms.sort((a, b) => severityIndex(b.worstChange) - severityIndex(a.worstChange));

  // Resumen
  const photosCompared = rooms.reduce((sum, r) => sum + r.pairs.length, 0);
  const photosOnlyInAfter = rooms.reduce(
    (sum, r) => sum + r.unmatchedAfter.length,
    0
  );
  const photosOnlyInBefore = rooms.reduce(
    (sum, r) => sum + r.pairs.filter((p) => p.after === null).length,
    0
  );
  const roomsWithChanges = rooms.filter(
    (r) => r.worstChange === "moderate" || r.worstChange === "major"
  ).length;
  const worstChange = computeWorstChange(rooms.flatMap((r) => r.pairs));

  return {
    before,
    after,
    rooms,
    removedRooms,
    addedRooms,
    summary: {
      totalRooms: rooms.length,
      roomsWithChanges,
      photosCompared,
      photosOnlyInAfter,
      photosOnlyInBefore,
      worstChange,
    },
  };
}

function groupRoomsByType(rooms: Room[]): Record<string, Room[]> {
  const out: Record<string, Room[]> = {};
  for (const r of rooms) {
    if (!out[r.type]) out[r.type] = [];
    out[r.type].push(r);
  }
  return out;
}

/**
 * Parea fotos del before con las del after usando distancia de Hamming
 * sobre el pHash. Greedy matching: para cada foto de before, busca la foto
 * de after mas similar (no usada aun) y emparejas.
 */
function pairPhotos(
  beforePhotos: PhotoEvidence[],
  afterPhotos: PhotoEvidence[]
): { pairs: PhotoPair[]; unmatchedAfter: PhotoEvidence[] } {
  const pairs: PhotoPair[] = [];
  const usedAfter = new Set<string>();

  for (const before of beforePhotos) {
    let bestAfter: PhotoEvidence | null = null;
    let bestDistance = Infinity;

    for (const after of afterPhotos) {
      if (usedAfter.has(after.id)) continue;
      const d = hammingDistance(
        before.forensic?.file.phash ?? null,
        after.forensic?.file.phash ?? null
      );
      if (d < bestDistance) {
        bestDistance = d;
        bestAfter = after;
      }
    }

    if (bestAfter && bestDistance <= PAIRING_DISTANCE_THRESHOLD) {
      usedAfter.add(bestAfter.id);
      pairs.push({
        before,
        after: bestAfter,
        distance: bestDistance,
        changeLevel: classifyChange(bestDistance),
      });
    } else {
      pairs.push({
        before,
        after: null,
        distance: Infinity,
        changeLevel: "unknown",
      });
    }
  }

  const unmatchedAfter = afterPhotos.filter((p) => !usedAfter.has(p.id));
  return { pairs, unmatchedAfter };
}

function computeWorstChange(pairs: PhotoPair[]): ChangeLevel {
  let worst: ChangeLevel = "identical";
  for (const p of pairs) {
    if (severityIndex(p.changeLevel) > severityIndex(worst)) {
      worst = p.changeLevel;
    }
  }
  return worst;
}

function severityIndex(level: ChangeLevel): number {
  switch (level) {
    case "identical":
      return 0;
    case "unknown":
      return 1;
    case "minor":
      return 2;
    case "moderate":
      return 3;
    case "major":
      return 4;
  }
}
