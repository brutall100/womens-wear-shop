import type { Metadata } from "next";
import { asset } from "./routes";

export const siteMetadata: Metadata = {
  title: { default: "MOT – moteriški drabužiai", template: "%s · MOT" },
  description: "Moteriškų drabužių parduotuvė Lietuvai: aiškios kainos, lietuviški aprašymai ir mokėjimas per SEB.",
  icons: { icon: asset("/favicon.svg") },
};
