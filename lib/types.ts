export type FunComponent = ((el: HTMLElement) => Record<string, unknown>) & {
  selector: string;
};
