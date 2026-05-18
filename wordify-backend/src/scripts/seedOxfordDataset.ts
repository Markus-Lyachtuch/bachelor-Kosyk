import * as fs from "fs";
import * as path from "path";
import { PrismaClient } from "@prisma/client";

interface OxfordWord {
  id: number;
  value: {
    word: string;
    href: string;
    type: string;
    level: string;
    us?: {
      mp3?: string;
      ogg?: string;
    };
    uk?: {
      mp3?: string;
      ogg?: string;
    };
    phonetics: {
      us: string;
      uk: string;
    };
    examples: string[];
  };
}

const prisma = new PrismaClient();

export async function seedOxfordDataset() {
  try {
    const dataPath = path.join(process.cwd(), "data", "oxford-5000.json");
    const rawData = fs.readFileSync(dataPath, "utf-8");
    const oxfordWords: OxfordWord[] = JSON.parse(rawData);

    console.log(`Found ${oxfordWords.length} words to process`);

    let successCount = 0;
    let skipCount = 0;
    let errorCount = 0;

    const existingWordsCount = await prisma.word.count();

    if (existingWordsCount > 0) {
      console.log(
        `Database already contains ${existingWordsCount} words. Skipping seeding to avoid duplicates.`
      );
      return;
    }

    const language = await prisma.language.create({
      data: {
        code: "en",
        name: "English",
      },
    });

    for (const oxfordWord of oxfordWords) {
      try {
        const {
          word: wordText,
          level,
          type,
          phonetics,
          examples,
          us,
          uk,
        } = oxfordWord.value;

        const normalizedWord = wordText.toLowerCase().trim();

        const word = await prisma.word.upsert({
          where: { word: normalizedWord },
          update: {},

          create: {
            word: normalizedWord,
            source: "oxford",
            language: { connect: { id: language?.id } },
            level: level
              ? {
                  connectOrCreate: {
                    where: { level: level },
                    create: { level: level },
                  },
                }
              : undefined,
          },
        });

        await prisma.meaning.upsert({
          where: {
            wordId_partOfSpeech_source: {
              wordId: word.id,
              partOfSpeech: type,
              source: "oxford",
            },
          },
          update: {},
          create: {
            wordId: word.id,
            partOfSpeech: type,
            source: "oxford",
          },
        });

        if (phonetics?.us) {
          await prisma.phonetic.upsert({
            where: {
              wordId_variant_source: {
                wordId: word.id,
                variant: "us",
                source: "oxford",
              },
            },
            update: {},
            create: {
              wordId: word.id,
              text: phonetics.us,
              variant: "us",
              audioUrl: us?.mp3 || null,
              source: "oxford",
            },
          });
        }

        if (phonetics?.uk) {
          await prisma.phonetic.upsert({
            where: {
              wordId_variant_source: {
                wordId: word.id,
                variant: "uk",
                source: "oxford",
              },
            },
            update: {},
            create: {
              wordId: word.id,
              text: phonetics.uk,
              variant: "uk",
              audioUrl: uk?.mp3 || null,
              source: "oxford",
            },
          });
        }

        if (examples && examples.length > 0) {
          for (const example of examples) {
            const existingExample = await prisma.example.findFirst({
              where: {
                wordId: word.id,
                text: example,
                source: "oxford",
              },
            });

            if (!existingExample) {
              await prisma.example.create({
                data: {
                  wordId: word.id,
                  text: example,
                  source: "oxford",
                },
              });
            }
          }
        }

        successCount++;
        if (successCount % 100 === 0) {
          console.log(`Processed ${successCount} words...`);
        }
      } catch (error) {
        errorCount++;
        console.error(
          `Error processing word "${oxfordWord.value.word}":`,
          error
        );
      }
    }

    console.log(`
    Dataset seeding completed!
    Results:
       - Successfully processed: ${successCount}
       - Errors: ${errorCount}
       - Skipped: ${skipCount}
    `);
  } catch (error) {
    console.error("Fatal error:", error);
    process.exit(1);
  }
}
