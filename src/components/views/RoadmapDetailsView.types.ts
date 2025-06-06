import type { RoadmapItemDto } from "@/types";

/**
 * Rozszerza standardowy DTO elementu roadmapy o zagnieżdżoną listę
 * dzieci tego samego typu, aby umożliwić rekurencyjne renderowanie
 * struktury drzewa.
 */
export interface RoadmapItemViewModel extends RoadmapItemDto {
  children: RoadmapItemViewModel[];
}
