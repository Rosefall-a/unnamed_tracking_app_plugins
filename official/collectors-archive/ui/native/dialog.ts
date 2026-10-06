import { host } from "./host";
export const useConfirm = () => (options: Record<string, unknown>) => host().confirm(options);
export const usePrompt = () => (options: Record<string, unknown>) => host().prompt(options);
