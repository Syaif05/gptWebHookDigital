// scripts/seed.js
import "dotenv/config";
import { dbConnect } from "../src/lib/db.js";
import Template from "../src/models/Template.js";
import { DEFAULT_BODIES, SUBJECT_DEFAULT } from "../src/lib/templating.js";

await dbConnect();
for (const type of ["Link", "Akun", "Akses"]) {
  const exists = await Template.findOne({ type });
  if (!exists) {
    await Template.create({
      type,
      name: `Default ${type}`,
      subject: SUBJECT_DEFAULT,
      body: DEFAULT_BODIES[type],
    });
    console.log("Seeded", type);
  }
}
process.exit(0);
