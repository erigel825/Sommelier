import { supabase } from "@/integrations/supabase/client";
import type { Preferences, CellarEntry } from "./preferences";
import type { Recommendation } from "@/components/WineCard";

export type SommelierResponse = {
  recommendations: Recommendation[];
  summary?: string;
  error?: string;
};

export async function callSommelier(input: {
  mode: "scan" | "pair";
  imageDataUrl?: string;
  wineListText?: string;
  food?: string;
  preferences: Preferences;
  cellar: CellarEntry[];
}): Promise<SommelierResponse> {
  const { data, error } = await supabase.functions.invoke("recommend-wines", {
    body: {
      ...input,
      cellar: input.cellar.map((c) => ({
        name: c.name,
        rating: c.rating,
        varietal: c.varietal,
        region: c.region,
      })),
    },
  });
  if (error) return { recommendations: [], error: error.message };
  return data as SommelierResponse;
}

export function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
