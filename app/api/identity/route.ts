// Identidade visual: biblioteca de logos (quantas quiser) + uma "ativa" (padrão da sidebar e dos cards).
import { promises as fs } from "fs";
import path from "path";
import sharp from "sharp";

export const runtime = "nodejs";
export const maxDuration = 30;

const DIR = () => path.join(process.cwd(), "public", "logo");
const MANIFEST = () => path.join(DIR(), "_logos.json");
const mainPath = () => path.join(DIR(), "cn-logo.png");
const rid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 6);

async function exists(p: string) { try { await fs.access(p); return true; } catch { return false; } }
type Manifest = { logos: string[]; active: string | null }; // logos = nomes de arquivo
async function readManifest(): Promise<Manifest> { try { return JSON.parse(await fs.readFile(MANIFEST(), "utf8")); } catch { return { logos: [], active: null }; } }
async function writeManifest(m: Manifest) { await fs.writeFile(MANIFEST(), JSON.stringify(m, null, 2)); }

const PALETTE = [
  { name: "Rosa", hex: "#EF476F" },
  { name: "Azul-marinho", hex: "#14213D" },
  { name: "Branco", hex: "#FFFFFF" },
  { name: "Cinza claro", hex: "#F5F5F5" },
];
const FONTS = { primaria: "Anton", secundaria: "Inter", apoio: "Montserrat" };

async function ensureMigrated(): Promise<Manifest> {
  await fs.mkdir(DIR(), { recursive: true });
  let m = await readManifest();
  if (m.logos.length) return m;
  // migra: pega todos os arquivos cn-logo-*.png como logos
  let files: string[] = [];
  try { files = (await fs.readdir(DIR())).filter((f) => /^cn-logo-.*\.png$/i.test(f)); } catch {}
  files.sort();
  let active: string | null = files[0] || null;
  try { const a = JSON.parse(await fs.readFile(path.join(DIR(), "_active.json"), "utf8")).active; if (a && files.includes(`cn-logo-${a}.png`)) active = `cn-logo-${a}.png`; } catch {}
  m = { logos: files, active };
  if (m.logos.length) await writeManifest(m);
  return m;
}

export async function GET() {
  const m = await ensureMigrated();
  return Response.json({
    logos: m.logos.map((f) => ({ file: f, url: `/logo/${f}` })),
    active: m.active ? `/logo/${m.active}` : null,
    palette: PALETTE, fonts: FONTS,
  });
}

export async function POST(req: Request) {
  await fs.mkdir(DIR(), { recursive: true });
  const ct = req.headers.get("content-type") || "";

  // upload de uma logo nova
  if (ct.includes("multipart/form-data")) {
    const form = await req.formData();
    const files = form.getAll("file").filter((f): f is File => f instanceof File);
    if (!files.length) return Response.json({ error: "sem arquivo" }, { status: 400 });
    const m = await ensureMigrated();
    for (const file of files) {
      const raw = Buffer.from(await file.arrayBuffer());
      const name = `cn-logo-${rid()}.png`;
      try { await sharp(raw).rotate().resize({ width: 700, height: 700, fit: "inside", withoutEnlargement: true }).png().toFile(path.join(DIR(), name)); }
      catch { await fs.writeFile(path.join(DIR(), name), raw); }
      m.logos.push(name);
      if (!m.active) { m.active = name; await fs.copyFile(path.join(DIR(), name), mainPath()); }
    }
    await writeManifest(m);
    return Response.json({ ok: true });
  }

  const body = (await req.json().catch(() => ({}))) as { action?: string; url?: string };
  const fileFromUrl = (u?: string) => (u || "").split("/").pop() || "";

  // definir a logo ativa (padrão da sidebar/cards)
  if (body.action === "select" && body.url) {
    const f = fileFromUrl(body.url);
    const m = await ensureMigrated();
    if (!m.logos.includes(f) || !(await exists(path.join(DIR(), f)))) return Response.json({ error: "logo não encontrada" }, { status: 400 });
    m.active = f; await writeManifest(m);
    await fs.copyFile(path.join(DIR(), f), mainPath());
    return Response.json({ ok: true, active: `/logo/${f}` });
  }
  // apagar uma logo
  if (body.action === "delete" && body.url) {
    const f = fileFromUrl(body.url);
    const m = await ensureMigrated();
    m.logos = m.logos.filter((x) => x !== f);
    try { await fs.unlink(path.join(DIR(), f)); } catch {}
    if (m.active === f) {
      m.active = m.logos[0] || null;
      if (m.active) await fs.copyFile(path.join(DIR(), m.active), mainPath());
      else { try { await fs.unlink(mainPath()); } catch {} }
    }
    await writeManifest(m);
    return Response.json({ ok: true });
  }
  return Response.json({ error: "ação inválida" }, { status: 400 });
}
