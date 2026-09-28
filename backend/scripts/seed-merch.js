/**
 * Upserts only the product-photo merchandise supplied for the storefront.
 * Unlike the full demo seeder, this script never deletes or rewrites unrelated
 * content, so it is safe to use when refreshing the shop on an existing DB.
 */
import mongoose from "mongoose";

import { connectToDatabase } from "../src/lib/db.js";
import { slugify } from "../src/lib/utils.js";
import { FaqEntry, MerchandiseItem } from "../src/models/index.js";
import { MERCH_SEED } from "./data/merch-events.js";

async function main() {
  await connectToDatabase();
  const suppliedProducts = MERCH_SEED.filter((item) =>
    item.imageUrl?.startsWith("/merch/"),
  );

  for (const [index, item] of suppliedProducts.entries()) {
    const slug = slugify(item.name);
    await MerchandiseItem.findOneAndUpdate(
      { slug },
      {
        $set: {
          name: item.name,
          slug,
          category: item.category,
          description: item.description,
          priceCents: item.priceCents ?? 0,
          imageUrl: item.imageUrl,
          gallery: item.gallery ?? [],
          tag: item.tag,
          isUpcoming: item.isUpcoming,
          releaseDate: new Date(Date.now() + item.releaseOffset * 86_400_000),
          popularityScore: 90 - index,
        },
        $setOnInsert: { viewCount: 0 },
      },
      { upsert: true },
    );
  }

  await MerchandiseItem.updateMany(
    { $or: [{ priceCents: { $exists: false } }, { priceCents: { $lte: 0 } }] },
    { $set: { priceCents: 2499 } },
  );

  await FaqEntry.updateOne(
    { question: "Can I buy the merchandise?" },
    {
      $set: {
        answer:
          "Yes. Add items from the merch catalogue to your cart and continue through checkout. The current academic build uses a demo checkout, so it never charges a real payment method or creates a shipment.",
      },
    },
  );

  console.log(
    `Upserted ${suppliedProducts.length} storefront merchandise items and refreshed shop pricing.`,
  );
  await mongoose.disconnect();
}

main().catch(async (error) => {
  console.error(error);
  await mongoose.disconnect();
  process.exitCode = 1;
});
