export type Offsets = [number, number];

export type Listener = {
  element: HTMLElement;
  setIsVisible: React.Dispatch<React.SetStateAction<boolean>>;
  offsets: Offsets;
  once: boolean;
};
