/** Seed categories — mirrored in the Convex seed (convex/seed.ts). */
export const CATEGORY_SEED: ReadonlyArray<{
  name: string;
  description: string;
}> = [
  { name: "Roads", description: "Damaged roads, potholes and worn surfaces" },
  { name: "Potholes", description: "Holes and craters on roads and pathways" },
  {
    name: "Street Lighting",
    description: "Broken, flickering or missing street lights",
  },
  {
    name: "Garbage/Waste",
    description: "Overflowing bins, illegal dumping and missed collection",
  },
  { name: "Water", description: "Leaks, shortages and contaminated supply" },
  {
    name: "Drainage",
    description: "Blocked drains, sewage overflow and flooding risks",
  },
  {
    name: "Public Facilities",
    description: "Parks, markets, schools and other public assets",
  },
  { name: "Traffic", description: "Signs, signals and road markings" },
  {
    name: "Environment",
    description: "Pollution, tree hazards and environmental concerns",
  },
  { name: "Safety", description: "Hazards that put the community at risk" },
  { name: "Other", description: "Anything else affecting your community" },
];
