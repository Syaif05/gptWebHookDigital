import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import Template from "@/models/Template";
import { DEFAULT_BODIES, SUBJECT_DEFAULT } from "@/lib/templating";
import { getServerSession } from "next-auth";
import { isAllowed } from "@/lib/auth";

async function ensureAuth() {
  const session = await getServerSession();
  if (!session?.user?.email || !isAllowed(session.user.email)) {
    return {
      ok: false,
      res: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }
  return { ok: true };
}

export async function GET() {
  await dbConnect();
  const list = await Template.find().sort({ type: 1 }).lean();
  return NextResponse.json({
    templates: list.map((t) => ({
      _id: String(t._id),
      type: t.type,
      name: t.name,
      subject: t.subject,
      body: t.body,
    })),
  });
}

export async function PUT(req) {
  const auth = await ensureAuth();
  if (!auth.ok) return auth.res;
  await dbConnect();

  const { type, subject, body } = await req.json();
  if (!["Link", "Akun", "Akses"].includes(type)) {
    return NextResponse.json(
      { error: "type harus Link/Akun/Akses" },
      { status: 400 }
    );
  }
  const update = {};
  if (subject) update.subject = subject;
  if (body) update.body = body;

  const doc = await Template.findOneAndUpdate(
    { type },
    { $set: update },
    { new: true }
  );
  return NextResponse.json({ ok: true, template: doc });
}

export async function POST(req) {
  // reset ke default
  const auth = await ensureAuth();
  if (!auth.ok) return auth.res;
  await dbConnect();

  const { type, action } = await req.json();
  if (action !== "reset")
    return NextResponse.json({ error: "Unsupported action" }, { status: 400 });
  if (!["Link", "Akun", "Akses"].includes(type)) {
    return NextResponse.json(
      { error: "type harus Link/Akun/Akses" },
      { status: 400 }
    );
  }
  const doc = await Template.findOneAndUpdate(
    { type },
    { $set: { subject: SUBJECT_DEFAULT, body: DEFAULT_BODIES[type] } },
    { new: true }
  );
  return NextResponse.json({ ok: true, template: doc });
}
