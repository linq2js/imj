declare module "imj" {
  export enum CloneMode {
    None = 0,
    Unknown = 1,
    Object = 2,
    Array = 3
  }

  interface IDateDuration {
    days?: number;
    months?: number;
    years?: number;
    hours?: number;
    minutes?: number;
    seconds?: number;
    milliseconds?: number;
  }

  export interface IContext {
    value: any;
    push(...values: any[]): IContext;
    pop(): IContext;
    shift(): IContext;
    unshift(...values): IContext;
    reverse(): IContext;
    sort(comparer?: Function): IContext;
    filter(predicate: Function): IContext;
    slice(from?: number, to?: number): IContext;
    remove(...keys: any[]): IContext;
    keep(...keys: any[]): IContext;
    splice(index: number, count?: number, ...items: any[]): IContext;
    result(): any;
    unset(...props: any[]): IContext;
    mutate(
      cloneMode: CloneMode,
      checker: Function,
      modifier: Function,
      selector?: Function
    );
    push(...values): IContext;
    assign(...props): IContext;
    map(mapper: Function): IContext;
    swap(prop1: any, prop2: any): IContext;
    toggle(): IContext;
    add(value: IDateDuration): IContext;
    add(value: number): IContext;
    current(): any;
  }

  interface ISpecs {
    $args?: string | any[];
    $if?: [(context: IContext) => any, ISpecs, ISpecs?];
    $when?: [any, any, ISpecs];
    $extend?: (context: IContext) => any;
    $var?: any;
    [key: string]: any[] | ISpecs | Function | string;
  }

  function imj(state: any, specs: ISpecs, ...args: any[]): any;
  function imj(specs: ISpecs): Function;

  export default imj;
}
