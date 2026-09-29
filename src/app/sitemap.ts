import type { MetadataRoute } from "next";
import { book } from "@/data/book";
import { passages } from "@/data/content";
import { SITE_URL } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes = ["", "/ueberblick", "/lesen", "/fragen", "/ueben", "/ueben/quiz", "/ueben/karten", "/ueben/zitate", "/ueben/pruefung", "/ueben/aussprache", "/lernplan", "/suche"];
  return [
    ...staticRoutes.map((path) => ({ url: `${SITE_URL}${path}`, priority: path === "" ? 1 : 0.8 })),
    ...passages.map((p) => ({ url: `${SITE_URL}/lesen/${p.slug}`, priority: 0.7 })),
    ...book.pages.map((p) => ({ url: `${SITE_URL}/buch/${p.page}`, priority: 0.4 })),
  ];
}
