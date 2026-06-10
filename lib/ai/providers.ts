import { customProvider } from "ai";
import { createOpencode } from "ai-sdk-provider-opencode-sdk";
import { isTestEnvironment } from "../constants";
import { titleModel } from "./models";

const opencodeBaseUrl = new URL(
  process.env.OPENCODE_BASE_URL ?? "http://127.0.0.1:4096"
);

const opencode = createOpencode({
  hostname: opencodeBaseUrl.hostname,
  port: Number(opencodeBaseUrl.port) || 4096,
  // The server is managed externally (e.g. `opencode serve`), so don't spawn one.
  autoStartServer: false,
});

export const myProvider = isTestEnvironment
  ? (() => {
      const { chatModel, titleModel: mockTitleModel } = require("./models.mock");
      return customProvider({
        languageModels: {
          "chat-model": chatModel,
          "title-model": mockTitleModel,
        },
      });
    })()
  : null;

export function getLanguageModel(modelId: string) {
  if (isTestEnvironment && myProvider) {
    return myProvider.languageModel(modelId);
  }

  return opencode(modelId);
}

export function getTitleModel() {
  if (isTestEnvironment && myProvider) {
    return myProvider.languageModel("title-model");
  }
  return opencode(titleModel.id);
}
