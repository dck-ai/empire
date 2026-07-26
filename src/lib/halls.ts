

export interface Hall {
  name: string;
  capacity: number;
}

export interface HallGroup {
  id: string;
  label: string;
  halls: Hall[];
}

export const HALL_GROUPS: HallGroup[] = [
  {
    id: "banquet",
    label: "宴会厅 Banquet halls",
    halls: [
      { name: "迎宾楼 1", capacity: 350 },
      { name: "迎宾楼 2", capacity: 500 },
    ],
  },
  {
    id: "vip",
    label: "贵宾房 VIP rooms",
    halls: [
      { name: "VVIP 8", capacity: 20 },
      { name: "V1", capacity: 10 },
      { name: "V2", capacity: 60 },
      { name: "V3", capacity: 30 },
      { name: "V5", capacity: 30 },
      { name: "V6", capacity: 10 },
      { name: "V7", capacity: 10 },
      { name: "V9", capacity: 60 },
    ],
  },
  {
    id: "main-hall",
    label: "大厅 Main hall",
    halls: [{ name: "大厅", capacity: 350 }],
  },
  {
    id: "tables",
    label: "散台 Tables",
    halls: [
      { name: "T1", capacity: 12 },
      { name: "T2", capacity: 12 },
      { name: "T3", capacity: 12 },
      { name: "T12", capacity: 4 },
      { name: "T13", capacity: 4 },
      { name: "T15", capacity: 4 },
      { name: "T22", capacity: 10 },
      { name: "T23", capacity: 10 },
      { name: "T25", capacity: 10 },
      { name: "T26", capacity: 10 },
      { name: "T31", capacity: 12 },
      { name: "T32", capacity: 10 },
      { name: "T33", capacity: 10 },
      { name: "T35", capacity: 10 },
      { name: "T36", capacity: 10 },
      { name: "T51", capacity: 12 },
      { name: "T52", capacity: 10 },
      { name: "T53", capacity: 10 },
    ],
  },
];

export const TOTAL_HALLS = HALL_GROUPS.reduce(
  (sum, group) => sum + group.halls.length,
  0
);

export const MIN_WAITING_SLOTS = 4;

export function hallKey(raw: string): string {
  return raw.replace(/\s+/g, "").toLowerCase();
}

const HALL_INDEX = new Map<string, Hall>(
  HALL_GROUPS.flatMap((group) =>
    group.halls.map((hall) => [hallKey(hall.name), hall])
  )
);

export function findHall(raw: string): Hall | undefined {
  return HALL_INDEX.get(hallKey(raw));
}

export function capacityForHall(raw: string): number | null {
  return findHall(raw)?.capacity ?? null;
}
