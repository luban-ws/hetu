/* SystemJS module definition */
declare var module: NodeModule;
interface NodeModule {
  id: string;
}

/* Mousetrap type definition for angular2-hotkeys */
declare interface MousetrapInstance {
  bind(keys: string | string[], callback: (e: Event, combo?: string) => any, action?: string): void;
  unbind(keys: string | string[], action?: string): void;
  trigger(keys: string, action?: string): void;
  reset(): void;
}



