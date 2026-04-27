export interface IElectronAPI {
  minimize: () => void;
  maximize: () => void;
  close: () => void;
  openExternal: (url: string) => void;
  onMaximizedStatus: (callback: (value: boolean) => void) => void;
}

declare global {
  interface Window {
    electronAPI: IElectronAPI;
  }
}
