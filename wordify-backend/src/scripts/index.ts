import { seedOxfordDataset } from "./seedOxfordDataset";

async function main() {
  try {
    await seedOxfordDataset();
    console.log("Seed completed successfully!");
  } catch (e) {
    console.error("Seed failed:", e);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}
