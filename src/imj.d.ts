declare enum CloneMode {
  None = 0,
  Unknown = 1,
  Object = 2,
  Array = 3
}

declare interface IDateDuration {
  days?: number;
  months?: number;
  years?: number;
  hours?: number;
  minutes?: number;
  seconds?: number;
  milliseconds?: number;
}

declare interface IContext {
  value: any;
  push(...values: any[]): IContext;
  pop(): IContext;
  shift(): IContext;
  unshift(...values): IContext;
  reverse(): IContext;
  sort(comparer?: Function): IContext;
  filter(predicate: Function): IContext;
  slice(from?: number, to?: number): IContext;
  /**
   * remove specified items / props
   * @param keys
   */
  remove(...keys: any[]): IContext;
  /**
   * remove all props except specified prop names
   * @param keys
   */
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

  /**
   * mutate date value with specified duration
   * @param duration
   */
  add(duration: IDateDuration): IContext;

  /**
   * mutate number by adding specified value
   * @param value
   */
  add(value: number): IContext;
  current(): any;
  replace(findWhat: any, replaceWith: any): IContext;
  [key: string]: any;
}

declare interface ISpecs {
  $return?: boolean;
  /**
   * map input arguments to specified context props
   *
   * imj({
   *     $args: 'arg1 arg2',
   *     propToUpdate: context => context.arg1 + context.arg2
   * })
   */
  $args?: string | any[];
  /**
   * conditional update
   *
   * imj({
   *     $if: [
   *         context => context.value.somthing === true,
   *         thenSpecs,
   *         elseSpecs
   *     ],
   *     $if_with_label1: [],
   *     $if_with_label2: [],
   *     $if_with_label3: []
   * })
   */
  $if?: [(context: IContext) => any, ISpecs, ISpecs?];
  /**
   * conditional update
   *
   * imj({
   *     $when: ['pathOfProperty', valueToCompare, specs],
   *     $when_label2: ['pathOfProperty', valueToCompare, specs],
   *     $when_label3: ['pathOfProperty', valueToCompare, specs]
   * })
   */
  $when?: [any, any, ISpecs];
  /**
   * conditional update
   *
   * imj({
   *     $extend(context) {
   *         if (context.value === value1) return specs1;
   *         if (context.value === value2) return specs2;
   *         return defaultSpecs
   *     }
   * })
   * @param context
   */
  $extend?: (context: IContext) => ISpecs;
  /**
   * map specified state value to specified variable
   *
   * imj({
   *     $var: {
   *         var1: 'propLevel1.propLevel2.propLevel3',
   *         var2: 'propLevel1.propLevel2'
   *     },
   *     resultProp: context => context.var1 + context.var2
   * })
   */
  $var?: any;
  /**
   * update first item in array that matched criteria
   *
   * imj({
   *     array: {
   *         $one(context) {
   *             if (context.value === something && context.index === 2) {
   *                 // modify 2nd item with specs
   *                 return modifySpecs;
   *             }
   *             // do nothing
   *             return undefined;
   *         }
   *     }
   * })
   * @param context
   */
  $one?: (context: IContext) => ISpecs;
  /**
   * update multiple item in array that matched criteria
   *
   * imj({
   *     array: {
   *         $many(context) {
   *             if (context.value === something) {
   *                 // modify 2nd item with specs
   *                 return modifySpecs;
   *             }
   *             // do nothing
   *             return undefined;
   *         }
   *     }
   * })
   * @param context
   */
  $many?: (context: IContext) => ISpecs;
  $self?: (context: IContext) => any;
  [key: string]:
    | any[]
    | ISpecs
    | ((context: IContext) => any)
    | string
    | boolean;
}

declare function imj(state: any, specs: ISpecs, ...args: any[]): any;
declare function imj(specs: ISpecs): Function;

export default imj;
