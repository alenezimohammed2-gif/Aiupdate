export interface AppSettings {
  id: string;
  selected_model: ModelOption;
  selected_image_model: ImageModelOption;
  keywords: string[];
  custom_instructions_include: string;
  custom_instructions_exclude: string;
  updated_at: string;
}

export type ModelOption =
  | "google/gemini-3-flash-preview"
  | "google/gemini-3.1-pro-preview"
  | "anthropic/claude-sonnet-4.6";

export type ImageModelOption =
  | "google/gemini-3.1-flash-image-preview"
  | "google/gemini-3.1-pro-image-preview";

export const MODEL_OPTIONS: {
  id: ModelOption;
  name: string;
  provider: string;
}[] = [
  {
    id: "google/gemini-3-flash-preview",
    name: "Gemini 3.0 Flash",
    provider: "Google",
  },
  {
    id: "google/gemini-3.1-pro-preview",
    name: "Gemini 3.1 Pro",
    provider: "Google",
  },
  {
    id: "anthropic/claude-sonnet-4.6",
    name: "Claude Sonnet 4.6",
    provider: "Anthropic",
  },
];

export const IMAGE_MODEL_OPTIONS: {
  id: ImageModelOption;
  name: string;
  provider: string;
}[] = [
  {
    id: "google/gemini-3.1-flash-image-preview",
    name: "Nano Banana Pro",
    provider: "Google",
  },
  {
    id: "google/gemini-3.1-pro-image-preview",
    name: "Nano Banana 2",
    provider: "Google",
  },
];

export const DEFAULT_SETTINGS: Omit<AppSettings, "id" | "updated_at"> = {
  selected_model: "google/gemini-3-flash-preview",
  selected_image_model: "google/gemini-3.1-flash-image-preview",
  keywords: [],
  custom_instructions_include: "",
  custom_instructions_exclude: "",
};
