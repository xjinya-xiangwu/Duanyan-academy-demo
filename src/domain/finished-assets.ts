import raw from "./high-quality-trajectories.jsonl?raw";
import type { TrajectoryAsset } from "./trajectory";
export const HIGH_QUALITY_JSONL = raw;
export const HIGH_QUALITY_ASSETS = raw.trim().split("\n").map((line) => JSON.parse(line) as TrajectoryAsset);
