import { ɵ as __ngDeclareFactory, F as FactoryTarget, R as Renderer2, E as ElementRef, i as i0, a as __ngDeclareDirective, b as __ngDeclareClassMetadata, D as Directive, I as InjectionToken, f as forwardRef, O as Optional, c as Inject, S as Self, d as EventEmitter, H as Host, e as SkipSelf, C as ChangeDetectorRef, g as __ngDeclareNgModule, h as __ngDeclareInjector, N as NgModule, j as __ngDeclareInjectable, k as Injectable, l as Injector, V as Version, m as getDOM, n as RuntimeError, o as map, p as isPromise$1, q as from, r as isObservable, s as Input, t as Output, T as TemplateRef, u as NgZone, v as __ngDeclareComponent, w as ViewEncapsulation$1, x as NgTemplateOutlet, y as NgForOf, z as NgIf, A as Component, B as CommonModule, G as ChangeDetectionStrategy, P as PLATFORM_ID, L as LOCALE_ID, J as ViewContainerRef, K as DOCUMENT, M as Subject, Q as take, U as ApplicationRef, W as RendererFactory2, X as ComponentFactoryResolver$1, Y as takeUntil, Z as ContentChildren, _ as Attribute, $ as PercentPipe, a0 as BehaviorSubject, a1 as isPlatformBrowser, a2 as combineLatest, a3 as startWith, a4 as distinctUntilChanged, a5 as switchMap, a6 as timer, a7 as zip, a8 as getLocaleMonthNames, a9 as TranslationWidth, aa as FormStyle, ab as getLocaleDayNames, ac as formatDate, ad as filter, ae as merge, af as tap, ag as withLatestFrom, ah as delay, ai as race, aj as skip, ak as getLocaleDayPeriods, al as of, am as finalize, an as EMPTY, ao as endWith, ap as mergeMap, aq as Observable, ar as share, as as ViewChild, at as ContentChild, au as ViewChildren, av as HostBinding, aw as defineInjectable, ax as inject, ay as auditTime, az as IterableDiffers, aA as pairwise, aB as shareReplay, aC as asapScheduler, aD as Location, aE as Subscription, aF as debounceTime, aG as QueryList, aH as isDevMode, aI as HostListener, aJ as first, aK as DomSanitizer, aL as SecurityContext } from "./vendor-BzKSgkTr.js";
import { f as forkJoin, a as fromEvent, N as NEVER, b as animationFrameScheduler } from "./utils-DZbCVmck.js";
/**
 * @license Angular v13.4.0
 * (c) 2010-2022 Google LLC. https://angular.io/
 * License: MIT
 */
class AnimationBuilder {
}
class AnimationFactory {
}
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
const AUTO_STYLE = "*";
function trigger(name, definitions) {
  return { type: 7, name, definitions, options: {} };
}
function animate(timings, styles = null) {
  return { type: 4, styles, timings };
}
function sequence(steps, options = null) {
  return { type: 2, steps, options };
}
function style(tokens) {
  return { type: 6, styles: tokens, offset: null };
}
function state(name, styles, options) {
  return { type: 0, name, styles, options };
}
function transition(stateChangeExpr, steps, options = null) {
  return { type: 1, expr: stateChangeExpr, animation: steps, options };
}
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
function scheduleMicroTask(cb) {
  Promise.resolve(null).then(cb);
}
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
class NoopAnimationPlayer {
  constructor(duration = 0, delay2 = 0) {
    this._onDoneFns = [];
    this._onStartFns = [];
    this._onDestroyFns = [];
    this._started = false;
    this._destroyed = false;
    this._finished = false;
    this._position = 0;
    this.parentPlayer = null;
    this.totalTime = duration + delay2;
  }
  _onFinish() {
    if (!this._finished) {
      this._finished = true;
      this._onDoneFns.forEach((fn2) => fn2());
      this._onDoneFns = [];
    }
  }
  onStart(fn2) {
    this._onStartFns.push(fn2);
  }
  onDone(fn2) {
    this._onDoneFns.push(fn2);
  }
  onDestroy(fn2) {
    this._onDestroyFns.push(fn2);
  }
  hasStarted() {
    return this._started;
  }
  init() {
  }
  play() {
    if (!this.hasStarted()) {
      this._onStart();
      this.triggerMicrotask();
    }
    this._started = true;
  }
  /** @internal */
  triggerMicrotask() {
    scheduleMicroTask(() => this._onFinish());
  }
  _onStart() {
    this._onStartFns.forEach((fn2) => fn2());
    this._onStartFns = [];
  }
  pause() {
  }
  restart() {
  }
  finish() {
    this._onFinish();
  }
  destroy() {
    if (!this._destroyed) {
      this._destroyed = true;
      if (!this.hasStarted()) {
        this._onStart();
      }
      this.finish();
      this._onDestroyFns.forEach((fn2) => fn2());
      this._onDestroyFns = [];
    }
  }
  reset() {
    this._started = false;
  }
  setPosition(position) {
    this._position = this.totalTime ? position * this.totalTime : 1;
  }
  getPosition() {
    return this.totalTime ? this._position / this.totalTime : 1;
  }
  /** @internal */
  triggerCallback(phaseName) {
    const methods = phaseName == "start" ? this._onStartFns : this._onDoneFns;
    methods.forEach((fn2) => fn2());
    methods.length = 0;
  }
}
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
class AnimationGroupPlayer {
  constructor(_players) {
    this._onDoneFns = [];
    this._onStartFns = [];
    this._finished = false;
    this._started = false;
    this._destroyed = false;
    this._onDestroyFns = [];
    this.parentPlayer = null;
    this.totalTime = 0;
    this.players = _players;
    let doneCount = 0;
    let destroyCount = 0;
    let startCount = 0;
    const total = this.players.length;
    if (total == 0) {
      scheduleMicroTask(() => this._onFinish());
    } else {
      this.players.forEach((player) => {
        player.onDone(() => {
          if (++doneCount == total) {
            this._onFinish();
          }
        });
        player.onDestroy(() => {
          if (++destroyCount == total) {
            this._onDestroy();
          }
        });
        player.onStart(() => {
          if (++startCount == total) {
            this._onStart();
          }
        });
      });
    }
    this.totalTime = this.players.reduce((time, player) => Math.max(time, player.totalTime), 0);
  }
  _onFinish() {
    if (!this._finished) {
      this._finished = true;
      this._onDoneFns.forEach((fn2) => fn2());
      this._onDoneFns = [];
    }
  }
  init() {
    this.players.forEach((player) => player.init());
  }
  onStart(fn2) {
    this._onStartFns.push(fn2);
  }
  _onStart() {
    if (!this.hasStarted()) {
      this._started = true;
      this._onStartFns.forEach((fn2) => fn2());
      this._onStartFns = [];
    }
  }
  onDone(fn2) {
    this._onDoneFns.push(fn2);
  }
  onDestroy(fn2) {
    this._onDestroyFns.push(fn2);
  }
  hasStarted() {
    return this._started;
  }
  play() {
    if (!this.parentPlayer) {
      this.init();
    }
    this._onStart();
    this.players.forEach((player) => player.play());
  }
  pause() {
    this.players.forEach((player) => player.pause());
  }
  restart() {
    this.players.forEach((player) => player.restart());
  }
  finish() {
    this._onFinish();
    this.players.forEach((player) => player.finish());
  }
  destroy() {
    this._onDestroy();
  }
  _onDestroy() {
    if (!this._destroyed) {
      this._destroyed = true;
      this._onFinish();
      this.players.forEach((player) => player.destroy());
      this._onDestroyFns.forEach((fn2) => fn2());
      this._onDestroyFns = [];
    }
  }
  reset() {
    this.players.forEach((player) => player.reset());
    this._destroyed = false;
    this._finished = false;
    this._started = false;
  }
  setPosition(p) {
    const timeAtPosition = p * this.totalTime;
    this.players.forEach((player) => {
      const position = player.totalTime ? Math.min(1, timeAtPosition / player.totalTime) : 1;
      player.setPosition(position);
    });
  }
  getPosition() {
    const longestPlayer = this.players.reduce((longestSoFar, player) => {
      const newPlayerIsLongest = longestSoFar === null || player.totalTime > longestSoFar.totalTime;
      return newPlayerIsLongest ? player : longestSoFar;
    }, null);
    return longestPlayer != null ? longestPlayer.getPosition() : 0;
  }
  beforeDestroy() {
    this.players.forEach((player) => {
      if (player.beforeDestroy) {
        player.beforeDestroy();
      }
    });
  }
  /** @internal */
  triggerCallback(phaseName) {
    const methods = phaseName == "start" ? this._onStartFns : this._onDoneFns;
    methods.forEach((fn2) => fn2());
    methods.length = 0;
  }
}
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
const ɵPRE_STYLE = "!";
/**
 * @license Angular v13.4.0
 * (c) 2010-2022 Google LLC. https://angular.io/
 * License: MIT
 */
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
class BaseControlValueAccessor {
  constructor(_renderer, _elementRef) {
    this._renderer = _renderer;
    this._elementRef = _elementRef;
    this.onChange = (_) => {
    };
    this.onTouched = () => {
    };
  }
  /**
   * Helper method that sets a property on a target element using the current Renderer
   * implementation.
   * @nodoc
   */
  setProperty(key, value) {
    this._renderer.setProperty(this._elementRef.nativeElement, key, value);
  }
  /**
   * Registers a function called when the control is touched.
   * @nodoc
   */
  registerOnTouched(fn2) {
    this.onTouched = fn2;
  }
  /**
   * Registers a function called when the control value changes.
   * @nodoc
   */
  registerOnChange(fn2) {
    this.onChange = fn2;
  }
  /**
   * Sets the "disabled" property on the range input element.
   * @nodoc
   */
  setDisabledState(isDisabled) {
    this.setProperty("disabled", isDisabled);
  }
}
BaseControlValueAccessor.ɵfac = __ngDeclareFactory({ minVersion: "12.0.0", version: "13.4.0", ngImport: i0, type: BaseControlValueAccessor, deps: [{ token: Renderer2 }, { token: ElementRef }], target: FactoryTarget.Directive });
BaseControlValueAccessor.ɵdir = __ngDeclareDirective({ minVersion: "12.0.0", version: "13.4.0", type: BaseControlValueAccessor, ngImport: i0 });
__ngDeclareClassMetadata({ type: BaseControlValueAccessor, decorators: [{
  type: Directive
}], ctorParameters: function() {
  return [{ type: Renderer2 }, { type: ElementRef }];
} });
class BuiltInControlValueAccessor extends BaseControlValueAccessor {
}
BuiltInControlValueAccessor.ɵfac = __ngDeclareFactory({ minVersion: "12.0.0", version: "13.4.0", ngImport: i0, type: BuiltInControlValueAccessor, deps: null, target: FactoryTarget.Directive });
BuiltInControlValueAccessor.ɵdir = __ngDeclareDirective({ minVersion: "12.0.0", version: "13.4.0", type: BuiltInControlValueAccessor, usesInheritance: true, ngImport: i0 });
__ngDeclareClassMetadata({ type: BuiltInControlValueAccessor, decorators: [{
  type: Directive
}] });
const NG_VALUE_ACCESSOR = new InjectionToken("NgValueAccessor");
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
const CHECKBOX_VALUE_ACCESSOR = {
  provide: NG_VALUE_ACCESSOR,
  useExisting: forwardRef(() => CheckboxControlValueAccessor),
  multi: true
};
class CheckboxControlValueAccessor extends BuiltInControlValueAccessor {
  /**
   * Sets the "checked" property on the input element.
   * @nodoc
   */
  writeValue(value) {
    this.setProperty("checked", value);
  }
}
CheckboxControlValueAccessor.ɵfac = __ngDeclareFactory({ minVersion: "12.0.0", version: "13.4.0", ngImport: i0, type: CheckboxControlValueAccessor, deps: null, target: FactoryTarget.Directive });
CheckboxControlValueAccessor.ɵdir = __ngDeclareDirective({ minVersion: "12.0.0", version: "13.4.0", type: CheckboxControlValueAccessor, selector: "input[type=checkbox][formControlName],input[type=checkbox][formControl],input[type=checkbox][ngModel]", host: { listeners: { "change": "onChange($event.target.checked)", "blur": "onTouched()" } }, providers: [CHECKBOX_VALUE_ACCESSOR], usesInheritance: true, ngImport: i0 });
__ngDeclareClassMetadata({ type: CheckboxControlValueAccessor, decorators: [{
  type: Directive,
  args: [{
    selector: "input[type=checkbox][formControlName],input[type=checkbox][formControl],input[type=checkbox][ngModel]",
    host: { "(change)": "onChange($event.target.checked)", "(blur)": "onTouched()" },
    providers: [CHECKBOX_VALUE_ACCESSOR]
  }]
}] });
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
const DEFAULT_VALUE_ACCESSOR = {
  provide: NG_VALUE_ACCESSOR,
  useExisting: forwardRef(() => DefaultValueAccessor),
  multi: true
};
function _isAndroid() {
  const userAgent = getDOM() ? getDOM().getUserAgent() : "";
  return /android (\d+)/.test(userAgent.toLowerCase());
}
const COMPOSITION_BUFFER_MODE = new InjectionToken("CompositionEventMode");
class DefaultValueAccessor extends BaseControlValueAccessor {
  constructor(renderer, elementRef, _compositionMode) {
    super(renderer, elementRef);
    this._compositionMode = _compositionMode;
    this._composing = false;
    if (this._compositionMode == null) {
      this._compositionMode = !_isAndroid();
    }
  }
  /**
   * Sets the "value" property on the input element.
   * @nodoc
   */
  writeValue(value) {
    const normalizedValue = value == null ? "" : value;
    this.setProperty("value", normalizedValue);
  }
  /** @internal */
  _handleInput(value) {
    if (!this._compositionMode || this._compositionMode && !this._composing) {
      this.onChange(value);
    }
  }
  /** @internal */
  _compositionStart() {
    this._composing = true;
  }
  /** @internal */
  _compositionEnd(value) {
    this._composing = false;
    this._compositionMode && this.onChange(value);
  }
}
DefaultValueAccessor.ɵfac = __ngDeclareFactory({ minVersion: "12.0.0", version: "13.4.0", ngImport: i0, type: DefaultValueAccessor, deps: [{ token: Renderer2 }, { token: ElementRef }, { token: COMPOSITION_BUFFER_MODE, optional: true }], target: FactoryTarget.Directive });
DefaultValueAccessor.ɵdir = __ngDeclareDirective({ minVersion: "12.0.0", version: "13.4.0", type: DefaultValueAccessor, selector: "input:not([type=checkbox])[formControlName],textarea[formControlName],input:not([type=checkbox])[formControl],textarea[formControl],input:not([type=checkbox])[ngModel],textarea[ngModel],[ngDefaultControl]", host: { listeners: { "input": "$any(this)._handleInput($event.target.value)", "blur": "onTouched()", "compositionstart": "$any(this)._compositionStart()", "compositionend": "$any(this)._compositionEnd($event.target.value)" } }, providers: [DEFAULT_VALUE_ACCESSOR], usesInheritance: true, ngImport: i0 });
__ngDeclareClassMetadata({ type: DefaultValueAccessor, decorators: [{
  type: Directive,
  args: [{
    selector: "input:not([type=checkbox])[formControlName],textarea[formControlName],input:not([type=checkbox])[formControl],textarea[formControl],input:not([type=checkbox])[ngModel],textarea[ngModel],[ngDefaultControl]",
    // TODO: vsavkin replace the above selector with the one below it once
    // https://github.com/angular/angular/issues/3011 is implemented
    // selector: '[ngModel],[formControl],[formControlName]',
    host: {
      "(input)": "$any(this)._handleInput($event.target.value)",
      "(blur)": "onTouched()",
      "(compositionstart)": "$any(this)._compositionStart()",
      "(compositionend)": "$any(this)._compositionEnd($event.target.value)"
    },
    providers: [DEFAULT_VALUE_ACCESSOR]
  }]
}], ctorParameters: function() {
  return [{ type: Renderer2 }, { type: ElementRef }, { type: void 0, decorators: [{
    type: Optional
  }, {
    type: Inject,
    args: [COMPOSITION_BUFFER_MODE]
  }] }];
} });
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
function isEmptyInputValue(value) {
  return value == null || value.length === 0;
}
function hasValidLength(value) {
  return value != null && typeof value.length === "number";
}
const NG_VALIDATORS = new InjectionToken("NgValidators");
const NG_ASYNC_VALIDATORS = new InjectionToken("NgAsyncValidators");
const EMAIL_REGEXP = /^(?=.{1,254}$)(?=.{1,64}@)[a-zA-Z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-zA-Z0-9!#$%&'*+/=?^_`{|}~-]+)*@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
function minValidator(min2) {
  return (control) => {
    if (isEmptyInputValue(control.value) || isEmptyInputValue(min2)) {
      return null;
    }
    const value = parseFloat(control.value);
    return !isNaN(value) && value < min2 ? { "min": { "min": min2, "actual": control.value } } : null;
  };
}
function maxValidator(max2) {
  return (control) => {
    if (isEmptyInputValue(control.value) || isEmptyInputValue(max2)) {
      return null;
    }
    const value = parseFloat(control.value);
    return !isNaN(value) && value > max2 ? { "max": { "max": max2, "actual": control.value } } : null;
  };
}
function requiredValidator(control) {
  return isEmptyInputValue(control.value) ? { "required": true } : null;
}
function requiredTrueValidator(control) {
  return control.value === true ? null : { "required": true };
}
function emailValidator(control) {
  if (isEmptyInputValue(control.value)) {
    return null;
  }
  return EMAIL_REGEXP.test(control.value) ? null : { "email": true };
}
function minLengthValidator(minLength) {
  return (control) => {
    if (isEmptyInputValue(control.value) || !hasValidLength(control.value)) {
      return null;
    }
    return control.value.length < minLength ? { "minlength": { "requiredLength": minLength, "actualLength": control.value.length } } : null;
  };
}
function maxLengthValidator(maxLength) {
  return (control) => {
    return hasValidLength(control.value) && control.value.length > maxLength ? { "maxlength": { "requiredLength": maxLength, "actualLength": control.value.length } } : null;
  };
}
function patternValidator(pattern) {
  if (!pattern)
    return nullValidator;
  let regex;
  let regexStr;
  if (typeof pattern === "string") {
    regexStr = "";
    if (pattern.charAt(0) !== "^")
      regexStr += "^";
    regexStr += pattern;
    if (pattern.charAt(pattern.length - 1) !== "$")
      regexStr += "$";
    regex = new RegExp(regexStr);
  } else {
    regexStr = pattern.toString();
    regex = pattern;
  }
  return (control) => {
    if (isEmptyInputValue(control.value)) {
      return null;
    }
    const value = control.value;
    return regex.test(value) ? null : { "pattern": { "requiredPattern": regexStr, "actualValue": value } };
  };
}
function nullValidator(control) {
  return null;
}
function isPresent(o) {
  return o != null;
}
function toObservable(r) {
  const obs = isPromise$1(r) ? from(r) : r;
  if (!isObservable(obs) && (typeof ngDevMode === "undefined" || ngDevMode)) {
    throw new Error(`Expected validator to return Promise or Observable.`);
  }
  return obs;
}
function mergeErrors(arrayOfErrors) {
  let res = {};
  arrayOfErrors.forEach((errors) => {
    res = errors != null ? { ...res, ...errors } : res;
  });
  return Object.keys(res).length === 0 ? null : res;
}
function executeValidators(control, validators) {
  return validators.map((validator) => validator(control));
}
function isValidatorFn(validator) {
  return !validator.validate;
}
function normalizeValidators(validators) {
  return validators.map((validator) => {
    return isValidatorFn(validator) ? validator : ((c) => validator.validate(c));
  });
}
function compose(validators) {
  if (!validators)
    return null;
  const presentValidators = validators.filter(isPresent);
  if (presentValidators.length == 0)
    return null;
  return function(control) {
    return mergeErrors(executeValidators(control, presentValidators));
  };
}
function composeValidators(validators) {
  return validators != null ? compose(normalizeValidators(validators)) : null;
}
function composeAsync(validators) {
  if (!validators)
    return null;
  const presentValidators = validators.filter(isPresent);
  if (presentValidators.length == 0)
    return null;
  return function(control) {
    const observables = executeValidators(control, presentValidators).map(toObservable);
    return forkJoin(observables).pipe(map(mergeErrors));
  };
}
function composeAsyncValidators(validators) {
  return validators != null ? composeAsync(normalizeValidators(validators)) : null;
}
function mergeValidators(controlValidators, dirValidator) {
  if (controlValidators === null)
    return [dirValidator];
  return Array.isArray(controlValidators) ? [...controlValidators, dirValidator] : [controlValidators, dirValidator];
}
function getControlValidators(control) {
  return control._rawValidators;
}
function getControlAsyncValidators(control) {
  return control._rawAsyncValidators;
}
function makeValidatorsArray(validators) {
  if (!validators)
    return [];
  return Array.isArray(validators) ? validators : [validators];
}
function hasValidator(validators, validator) {
  return Array.isArray(validators) ? validators.includes(validator) : validators === validator;
}
function addValidators(validators, currentValidators) {
  const current = makeValidatorsArray(currentValidators);
  const validatorsToAdd = makeValidatorsArray(validators);
  validatorsToAdd.forEach((v) => {
    if (!hasValidator(current, v)) {
      current.push(v);
    }
  });
  return current;
}
function removeValidators(validators, currentValidators) {
  return makeValidatorsArray(currentValidators).filter((v) => !hasValidator(validators, v));
}
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
class AbstractControlDirective {
  constructor() {
    this._rawValidators = [];
    this._rawAsyncValidators = [];
    this._onDestroyCallbacks = [];
  }
  /**
   * @description
   * Reports the value of the control if it is present, otherwise null.
   */
  get value() {
    return this.control ? this.control.value : null;
  }
  /**
   * @description
   * Reports whether the control is valid. A control is considered valid if no
   * validation errors exist with the current value.
   * If the control is not present, null is returned.
   */
  get valid() {
    return this.control ? this.control.valid : null;
  }
  /**
   * @description
   * Reports whether the control is invalid, meaning that an error exists in the input value.
   * If the control is not present, null is returned.
   */
  get invalid() {
    return this.control ? this.control.invalid : null;
  }
  /**
   * @description
   * Reports whether a control is pending, meaning that that async validation is occurring and
   * errors are not yet available for the input value. If the control is not present, null is
   * returned.
   */
  get pending() {
    return this.control ? this.control.pending : null;
  }
  /**
   * @description
   * Reports whether the control is disabled, meaning that the control is disabled
   * in the UI and is exempt from validation checks and excluded from aggregate
   * values of ancestor controls. If the control is not present, null is returned.
   */
  get disabled() {
    return this.control ? this.control.disabled : null;
  }
  /**
   * @description
   * Reports whether the control is enabled, meaning that the control is included in ancestor
   * calculations of validity or value. If the control is not present, null is returned.
   */
  get enabled() {
    return this.control ? this.control.enabled : null;
  }
  /**
   * @description
   * Reports the control's validation errors. If the control is not present, null is returned.
   */
  get errors() {
    return this.control ? this.control.errors : null;
  }
  /**
   * @description
   * Reports whether the control is pristine, meaning that the user has not yet changed
   * the value in the UI. If the control is not present, null is returned.
   */
  get pristine() {
    return this.control ? this.control.pristine : null;
  }
  /**
   * @description
   * Reports whether the control is dirty, meaning that the user has changed
   * the value in the UI. If the control is not present, null is returned.
   */
  get dirty() {
    return this.control ? this.control.dirty : null;
  }
  /**
   * @description
   * Reports whether the control is touched, meaning that the user has triggered
   * a `blur` event on it. If the control is not present, null is returned.
   */
  get touched() {
    return this.control ? this.control.touched : null;
  }
  /**
   * @description
   * Reports the validation status of the control. Possible values include:
   * 'VALID', 'INVALID', 'DISABLED', and 'PENDING'.
   * If the control is not present, null is returned.
   */
  get status() {
    return this.control ? this.control.status : null;
  }
  /**
   * @description
   * Reports whether the control is untouched, meaning that the user has not yet triggered
   * a `blur` event on it. If the control is not present, null is returned.
   */
  get untouched() {
    return this.control ? this.control.untouched : null;
  }
  /**
   * @description
   * Returns a multicasting observable that emits a validation status whenever it is
   * calculated for the control. If the control is not present, null is returned.
   */
  get statusChanges() {
    return this.control ? this.control.statusChanges : null;
  }
  /**
   * @description
   * Returns a multicasting observable of value changes for the control that emits every time the
   * value of the control changes in the UI or programmatically.
   * If the control is not present, null is returned.
   */
  get valueChanges() {
    return this.control ? this.control.valueChanges : null;
  }
  /**
   * @description
   * Returns an array that represents the path from the top-level form to this control.
   * Each index is the string name of the control on that level.
   */
  get path() {
    return null;
  }
  /**
   * Sets synchronous validators for this directive.
   * @internal
   */
  _setValidators(validators) {
    this._rawValidators = validators || [];
    this._composedValidatorFn = composeValidators(this._rawValidators);
  }
  /**
   * Sets asynchronous validators for this directive.
   * @internal
   */
  _setAsyncValidators(validators) {
    this._rawAsyncValidators = validators || [];
    this._composedAsyncValidatorFn = composeAsyncValidators(this._rawAsyncValidators);
  }
  /**
   * @description
   * Synchronous validator function composed of all the synchronous validators registered with this
   * directive.
   */
  get validator() {
    return this._composedValidatorFn || null;
  }
  /**
   * @description
   * Asynchronous validator function composed of all the asynchronous validators registered with
   * this directive.
   */
  get asyncValidator() {
    return this._composedAsyncValidatorFn || null;
  }
  /**
   * Internal function to register callbacks that should be invoked
   * when directive instance is being destroyed.
   * @internal
   */
  _registerOnDestroy(fn2) {
    this._onDestroyCallbacks.push(fn2);
  }
  /**
   * Internal function to invoke all registered "on destroy" callbacks.
   * Note: calling this function also clears the list of callbacks.
   * @internal
   */
  _invokeOnDestroyCallbacks() {
    this._onDestroyCallbacks.forEach((fn2) => fn2());
    this._onDestroyCallbacks = [];
  }
  /**
   * @description
   * Resets the control with the provided value if the control is present.
   */
  reset(value = void 0) {
    if (this.control)
      this.control.reset(value);
  }
  /**
   * @description
   * Reports whether the control with the given path has the error specified.
   *
   * @param errorCode The code of the error to check
   * @param path A list of control names that designates how to move from the current control
   * to the control that should be queried for errors.
   *
   * @usageNotes
   * For example, for the following `FormGroup`:
   *
   * ```
   * form = new FormGroup({
   *   address: new FormGroup({ street: new FormControl() })
   * });
   * ```
   *
   * The path to the 'street' control from the root form would be 'address' -> 'street'.
   *
   * It can be provided to this method in one of two formats:
   *
   * 1. An array of string control names, e.g. `['address', 'street']`
   * 1. A period-delimited list of control names in one string, e.g. `'address.street'`
   *
   * If no path is given, this method checks for the error on the current control.
   *
   * @returns whether the given error is present in the control at the given path.
   *
   * If the control is not present, false is returned.
   */
  hasError(errorCode, path) {
    return this.control ? this.control.hasError(errorCode, path) : false;
  }
  /**
   * @description
   * Reports error data for the control with the given path.
   *
   * @param errorCode The code of the error to check
   * @param path A list of control names that designates how to move from the current control
   * to the control that should be queried for errors.
   *
   * @usageNotes
   * For example, for the following `FormGroup`:
   *
   * ```
   * form = new FormGroup({
   *   address: new FormGroup({ street: new FormControl() })
   * });
   * ```
   *
   * The path to the 'street' control from the root form would be 'address' -> 'street'.
   *
   * It can be provided to this method in one of two formats:
   *
   * 1. An array of string control names, e.g. `['address', 'street']`
   * 1. A period-delimited list of control names in one string, e.g. `'address.street'`
   *
   * @returns error data for that particular error. If the control or error is not present,
   * null is returned.
   */
  getError(errorCode, path) {
    return this.control ? this.control.getError(errorCode, path) : null;
  }
}
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
class ControlContainer extends AbstractControlDirective {
  /**
   * @description
   * The top-level form directive for the control.
   */
  get formDirective() {
    return null;
  }
  /**
   * @description
   * The path to this group.
   */
  get path() {
    return null;
  }
}
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
class NgControl extends AbstractControlDirective {
  constructor() {
    super(...arguments);
    this._parent = null;
    this.name = null;
    this.valueAccessor = null;
  }
}
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
class AbstractControlStatus {
  constructor(cd) {
    this._cd = cd;
  }
  is(status) {
    if (status === "submitted") {
      return !!this._cd?.submitted;
    }
    return !!this._cd?.control?.[status];
  }
}
const ngControlStatusHost = {
  "[class.ng-untouched]": 'is("untouched")',
  "[class.ng-touched]": 'is("touched")',
  "[class.ng-pristine]": 'is("pristine")',
  "[class.ng-dirty]": 'is("dirty")',
  "[class.ng-valid]": 'is("valid")',
  "[class.ng-invalid]": 'is("invalid")',
  "[class.ng-pending]": 'is("pending")'
};
const ngGroupStatusHost = {
  "[class.ng-untouched]": 'is("untouched")',
  "[class.ng-touched]": 'is("touched")',
  "[class.ng-pristine]": 'is("pristine")',
  "[class.ng-dirty]": 'is("dirty")',
  "[class.ng-valid]": 'is("valid")',
  "[class.ng-invalid]": 'is("invalid")',
  "[class.ng-pending]": 'is("pending")',
  "[class.ng-submitted]": 'is("submitted")'
};
class NgControlStatus extends AbstractControlStatus {
  constructor(cd) {
    super(cd);
  }
}
NgControlStatus.ɵfac = __ngDeclareFactory({ minVersion: "12.0.0", version: "13.4.0", ngImport: i0, type: NgControlStatus, deps: [{ token: NgControl, self: true }], target: FactoryTarget.Directive });
NgControlStatus.ɵdir = __ngDeclareDirective({ minVersion: "12.0.0", version: "13.4.0", type: NgControlStatus, selector: "[formControlName],[ngModel],[formControl]", host: { properties: { "class.ng-untouched": 'is("untouched")', "class.ng-touched": 'is("touched")', "class.ng-pristine": 'is("pristine")', "class.ng-dirty": 'is("dirty")', "class.ng-valid": 'is("valid")', "class.ng-invalid": 'is("invalid")', "class.ng-pending": 'is("pending")' } }, usesInheritance: true, ngImport: i0 });
__ngDeclareClassMetadata({ type: NgControlStatus, decorators: [{
  type: Directive,
  args: [{ selector: "[formControlName],[ngModel],[formControl]", host: ngControlStatusHost }]
}], ctorParameters: function() {
  return [{ type: NgControl, decorators: [{
    type: Self
  }] }];
} });
class NgControlStatusGroup extends AbstractControlStatus {
  constructor(cd) {
    super(cd);
  }
}
NgControlStatusGroup.ɵfac = __ngDeclareFactory({ minVersion: "12.0.0", version: "13.4.0", ngImport: i0, type: NgControlStatusGroup, deps: [{ token: ControlContainer, optional: true, self: true }], target: FactoryTarget.Directive });
NgControlStatusGroup.ɵdir = __ngDeclareDirective({ minVersion: "12.0.0", version: "13.4.0", type: NgControlStatusGroup, selector: "[formGroupName],[formArrayName],[ngModelGroup],[formGroup],form:not([ngNoForm]),[ngForm]", host: { properties: { "class.ng-untouched": 'is("untouched")', "class.ng-touched": 'is("touched")', "class.ng-pristine": 'is("pristine")', "class.ng-dirty": 'is("dirty")', "class.ng-valid": 'is("valid")', "class.ng-invalid": 'is("invalid")', "class.ng-pending": 'is("pending")', "class.ng-submitted": 'is("submitted")' } }, usesInheritance: true, ngImport: i0 });
__ngDeclareClassMetadata({ type: NgControlStatusGroup, decorators: [{
  type: Directive,
  args: [{
    selector: "[formGroupName],[formArrayName],[ngModelGroup],[formGroup],form:not([ngNoForm]),[ngForm]",
    host: ngGroupStatusHost
  }]
}], ctorParameters: function() {
  return [{ type: ControlContainer, decorators: [{
    type: Optional
  }, {
    type: Self
  }] }];
} });
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
const formControlNameExample = `
  <div [formGroup]="myGroup">
    <input formControlName="firstName">
  </div>

  In your class:

  this.myGroup = new FormGroup({
      firstName: new FormControl()
  });`;
const formGroupNameExample = `
  <div [formGroup]="myGroup">
      <div formGroupName="person">
        <input formControlName="firstName">
      </div>
  </div>

  In your class:

  this.myGroup = new FormGroup({
      person: new FormGroup({ firstName: new FormControl() })
  });`;
const formArrayNameExample = `
  <div [formGroup]="myGroup">
    <div formArrayName="cities">
      <div *ngFor="let city of cityArray.controls; index as i">
        <input [formControlName]="i">
      </div>
    </div>
  </div>

  In your class:

  this.cityArray = new FormArray([new FormControl('SF')]);
  this.myGroup = new FormGroup({
    cities: this.cityArray
  });`;
const ngModelGroupExample = `
  <form>
      <div ngModelGroup="person">
        <input [(ngModel)]="person.name" name="firstName">
      </div>
  </form>`;
const ngModelWithFormGroupExample = `
  <div [formGroup]="myGroup">
      <input formControlName="firstName">
      <input [(ngModel)]="showMoreControls" [ngModelOptions]="{standalone: true}">
  </div>
`;
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
function controlParentException() {
  return new Error(`formControlName must be used with a parent formGroup directive.  You'll want to add a formGroup
      directive and pass it an existing FormGroup instance (you can create one in your class).

    Example:

    ${formControlNameExample}`);
}
function ngModelGroupException() {
  return new Error(`formControlName cannot be used with an ngModelGroup parent. It is only compatible with parents
      that also have a "form" prefix: formGroupName, formArrayName, or formGroup.

      Option 1:  Update the parent to be formGroupName (reactive form strategy)

      ${formGroupNameExample}

      Option 2: Use ngModel instead of formControlName (template-driven strategy)

      ${ngModelGroupExample}`);
}
function missingFormException() {
  return new Error(`formGroup expects a FormGroup instance. Please pass one in.

      Example:

      ${formControlNameExample}`);
}
function groupParentException() {
  return new Error(`formGroupName must be used with a parent formGroup directive.  You'll want to add a formGroup
    directive and pass it an existing FormGroup instance (you can create one in your class).

    Example:

    ${formGroupNameExample}`);
}
function arrayParentException() {
  return new Error(`formArrayName must be used with a parent formGroup directive.  You'll want to add a formGroup
      directive and pass it an existing FormGroup instance (you can create one in your class).

      Example:

      ${formArrayNameExample}`);
}
const disabledAttrWarning = `
  It looks like you're using the disabled attribute with a reactive form directive. If you set disabled to true
  when you set up this control in your component class, the disabled attribute will actually be set in the DOM for
  you. We recommend using this approach to avoid 'changed after checked' errors.

  Example:
  form = new FormGroup({
    first: new FormControl({value: 'Nancy', disabled: true}, Validators.required),
    last: new FormControl('Drew', Validators.required)
  });
`;
function ngModelWarning(directiveName) {
  return `
  It looks like you're using ngModel on the same form field as ${directiveName}.
  Support for using the ngModel input property and ngModelChange event with
  reactive form directives has been deprecated in Angular v6 and will be removed
  in a future version of Angular.

  For more information on this, see our API docs here:
  https://angular.io/api/forms/${directiveName === "formControl" ? "FormControlDirective" : "FormControlName"}#use-with-ngmodel
  `;
}
function describeKey(isFormGroup2, key) {
  return isFormGroup2 ? `with name: '${key}'` : `at index: ${key}`;
}
function noControlsError(isFormGroup2) {
  return `
    There are no form controls registered with this ${isFormGroup2 ? "group" : "array"} yet. If you're using ngModel,
    you may want to check next tick (e.g. use setTimeout).
  `;
}
function missingControlError(isFormGroup2, key) {
  return `Cannot find form control ${describeKey(isFormGroup2, key)}`;
}
function missingControlValueError(isFormGroup2, key) {
  return `Must supply a value for form control ${describeKey(isFormGroup2, key)}`;
}
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
function controlPath(name, parent) {
  return [...parent.path, name];
}
function setUpControl(control, dir) {
  if (typeof ngDevMode === "undefined" || ngDevMode) {
    if (!control)
      _throwError(dir, "Cannot find control with");
    if (!dir.valueAccessor)
      _throwError(dir, "No value accessor for form control with");
  }
  setUpValidators(control, dir);
  dir.valueAccessor.writeValue(control.value);
  setUpViewChangePipeline(control, dir);
  setUpModelChangePipeline(control, dir);
  setUpBlurPipeline(control, dir);
  setUpDisabledChangeHandler(control, dir);
}
function cleanUpControl(control, dir, validateControlPresenceOnChange = true) {
  const noop2 = () => {
    if (validateControlPresenceOnChange && (typeof ngDevMode === "undefined" || ngDevMode)) {
      _noControlError(dir);
    }
  };
  if (dir.valueAccessor) {
    dir.valueAccessor.registerOnChange(noop2);
    dir.valueAccessor.registerOnTouched(noop2);
  }
  cleanUpValidators(control, dir);
  if (control) {
    dir._invokeOnDestroyCallbacks();
    control._registerOnCollectionChange(() => {
    });
  }
}
function registerOnValidatorChange(validators, onChange) {
  validators.forEach((validator) => {
    if (validator.registerOnValidatorChange)
      validator.registerOnValidatorChange(onChange);
  });
}
function setUpDisabledChangeHandler(control, dir) {
  if (dir.valueAccessor.setDisabledState) {
    const onDisabledChange = (isDisabled) => {
      dir.valueAccessor.setDisabledState(isDisabled);
    };
    control.registerOnDisabledChange(onDisabledChange);
    dir._registerOnDestroy(() => {
      control._unregisterOnDisabledChange(onDisabledChange);
    });
  }
}
function setUpValidators(control, dir) {
  const validators = getControlValidators(control);
  if (dir.validator !== null) {
    control.setValidators(mergeValidators(validators, dir.validator));
  } else if (typeof validators === "function") {
    control.setValidators([validators]);
  }
  const asyncValidators = getControlAsyncValidators(control);
  if (dir.asyncValidator !== null) {
    control.setAsyncValidators(mergeValidators(asyncValidators, dir.asyncValidator));
  } else if (typeof asyncValidators === "function") {
    control.setAsyncValidators([asyncValidators]);
  }
  const onValidatorChange = () => control.updateValueAndValidity();
  registerOnValidatorChange(dir._rawValidators, onValidatorChange);
  registerOnValidatorChange(dir._rawAsyncValidators, onValidatorChange);
}
function cleanUpValidators(control, dir) {
  let isControlUpdated = false;
  if (control !== null) {
    if (dir.validator !== null) {
      const validators = getControlValidators(control);
      if (Array.isArray(validators) && validators.length > 0) {
        const updatedValidators = validators.filter((validator) => validator !== dir.validator);
        if (updatedValidators.length !== validators.length) {
          isControlUpdated = true;
          control.setValidators(updatedValidators);
        }
      }
    }
    if (dir.asyncValidator !== null) {
      const asyncValidators = getControlAsyncValidators(control);
      if (Array.isArray(asyncValidators) && asyncValidators.length > 0) {
        const updatedAsyncValidators = asyncValidators.filter((asyncValidator) => asyncValidator !== dir.asyncValidator);
        if (updatedAsyncValidators.length !== asyncValidators.length) {
          isControlUpdated = true;
          control.setAsyncValidators(updatedAsyncValidators);
        }
      }
    }
  }
  const noop2 = () => {
  };
  registerOnValidatorChange(dir._rawValidators, noop2);
  registerOnValidatorChange(dir._rawAsyncValidators, noop2);
  return isControlUpdated;
}
function setUpViewChangePipeline(control, dir) {
  dir.valueAccessor.registerOnChange((newValue) => {
    control._pendingValue = newValue;
    control._pendingChange = true;
    control._pendingDirty = true;
    if (control.updateOn === "change")
      updateControl(control, dir);
  });
}
function setUpBlurPipeline(control, dir) {
  dir.valueAccessor.registerOnTouched(() => {
    control._pendingTouched = true;
    if (control.updateOn === "blur" && control._pendingChange)
      updateControl(control, dir);
    if (control.updateOn !== "submit")
      control.markAsTouched();
  });
}
function updateControl(control, dir) {
  if (control._pendingDirty)
    control.markAsDirty();
  control.setValue(control._pendingValue, { emitModelToViewChange: false });
  dir.viewToModelUpdate(control._pendingValue);
  control._pendingChange = false;
}
function setUpModelChangePipeline(control, dir) {
  const onChange = (newValue, emitModelEvent) => {
    dir.valueAccessor.writeValue(newValue);
    if (emitModelEvent)
      dir.viewToModelUpdate(newValue);
  };
  control.registerOnChange(onChange);
  dir._registerOnDestroy(() => {
    control._unregisterOnChange(onChange);
  });
}
function setUpFormContainer(control, dir) {
  if (control == null && (typeof ngDevMode === "undefined" || ngDevMode))
    _throwError(dir, "Cannot find control with");
  setUpValidators(control, dir);
}
function cleanUpFormContainer(control, dir) {
  return cleanUpValidators(control, dir);
}
function _noControlError(dir) {
  return _throwError(dir, "There is no FormControl instance attached to form control element with");
}
function _throwError(dir, message) {
  const messageEnd = _describeControlLocation(dir);
  throw new Error(`${message} ${messageEnd}`);
}
function _describeControlLocation(dir) {
  const path = dir.path;
  if (path && path.length > 1)
    return `path: '${path.join(" -> ")}'`;
  if (path?.[0])
    return `name: '${path}'`;
  return "unspecified name attribute";
}
function _throwInvalidValueAccessorError(dir) {
  const loc = _describeControlLocation(dir);
  throw new Error(`Value accessor was not provided as an array for form control with ${loc}. Check that the \`NG_VALUE_ACCESSOR\` token is configured as a \`multi: true\` provider.`);
}
function isPropertyUpdated(changes, viewModel) {
  if (!changes.hasOwnProperty("model"))
    return false;
  const change = changes["model"];
  if (change.isFirstChange())
    return true;
  return !Object.is(viewModel, change.currentValue);
}
function isBuiltInAccessor(valueAccessor) {
  return Object.getPrototypeOf(valueAccessor.constructor) === BuiltInControlValueAccessor;
}
function syncPendingControls(form, directives) {
  form._syncPendingControls();
  directives.forEach((dir) => {
    const control = dir.control;
    if (control.updateOn === "submit" && control._pendingChange) {
      dir.viewToModelUpdate(control._pendingValue);
      control._pendingChange = false;
    }
  });
}
function selectValueAccessor(dir, valueAccessors) {
  if (!valueAccessors)
    return null;
  if (!Array.isArray(valueAccessors) && (typeof ngDevMode === "undefined" || ngDevMode))
    _throwInvalidValueAccessorError(dir);
  let defaultAccessor = void 0;
  let builtinAccessor = void 0;
  let customAccessor = void 0;
  valueAccessors.forEach((v) => {
    if (v.constructor === DefaultValueAccessor) {
      defaultAccessor = v;
    } else if (isBuiltInAccessor(v)) {
      if (builtinAccessor && (typeof ngDevMode === "undefined" || ngDevMode))
        _throwError(dir, "More than one built-in value accessor matches form control with");
      builtinAccessor = v;
    } else {
      if (customAccessor && (typeof ngDevMode === "undefined" || ngDevMode))
        _throwError(dir, "More than one custom value accessor matches form control with");
      customAccessor = v;
    }
  });
  if (customAccessor)
    return customAccessor;
  if (builtinAccessor)
    return builtinAccessor;
  if (defaultAccessor)
    return defaultAccessor;
  if (typeof ngDevMode === "undefined" || ngDevMode) {
    _throwError(dir, "No valid value accessor for form control with");
  }
  return null;
}
function removeListItem(list, el) {
  const index = list.indexOf(el);
  if (index > -1)
    list.splice(index, 1);
}
function _ngModelWarning(name, type, instance, warningConfig) {
  if (warningConfig === "never")
    return;
  if ((warningConfig === null || warningConfig === "once") && !type._ngModelWarningSentOnce || warningConfig === "always" && !instance._ngModelWarningSent) {
    console.warn(ngModelWarning(name));
    type._ngModelWarningSentOnce = true;
    instance._ngModelWarningSent = true;
  }
}
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
const NG_DEV_MODE = typeof ngDevMode === "undefined" || !!ngDevMode;
const VALID = "VALID";
const INVALID = "INVALID";
const PENDING = "PENDING";
const DISABLED = "DISABLED";
function _find(control, path, delimiter) {
  if (path == null)
    return null;
  if (!Array.isArray(path)) {
    path = path.split(delimiter);
  }
  if (Array.isArray(path) && path.length === 0)
    return null;
  let controlToFind = control;
  path.forEach((name) => {
    if (isFormGroup(controlToFind)) {
      controlToFind = controlToFind.controls.hasOwnProperty(name) ? controlToFind.controls[name] : null;
    } else if (isFormArray(controlToFind)) {
      controlToFind = controlToFind.at(name) || null;
    } else {
      controlToFind = null;
    }
  });
  return controlToFind;
}
function pickValidators(validatorOrOpts) {
  return (isOptionsObj(validatorOrOpts) ? validatorOrOpts.validators : validatorOrOpts) || null;
}
function coerceToValidator(validator) {
  return Array.isArray(validator) ? composeValidators(validator) : validator || null;
}
function pickAsyncValidators(asyncValidator, validatorOrOpts) {
  return (isOptionsObj(validatorOrOpts) ? validatorOrOpts.asyncValidators : asyncValidator) || null;
}
function coerceToAsyncValidator(asyncValidator) {
  return Array.isArray(asyncValidator) ? composeAsyncValidators(asyncValidator) : asyncValidator || null;
}
function isOptionsObj(validatorOrOpts) {
  return validatorOrOpts != null && !Array.isArray(validatorOrOpts) && typeof validatorOrOpts === "object";
}
const isFormControl = (control) => control instanceof FormControl;
const isFormGroup = (control) => control instanceof FormGroup;
const isFormArray = (control) => control instanceof FormArray;
function getRawValue(control) {
  return isFormControl(control) ? control.value : control.getRawValue();
}
function assertControlPresent(parent, key) {
  const isGroup = isFormGroup(parent);
  const controls = parent.controls;
  const collection = isGroup ? Object.keys(controls) : controls;
  if (!collection.length) {
    throw new RuntimeError(1e3, NG_DEV_MODE ? noControlsError(isGroup) : "");
  }
  if (!controls[key]) {
    throw new RuntimeError(1001, NG_DEV_MODE ? missingControlError(isGroup, key) : "");
  }
}
function assertAllValuesPresent(control, value) {
  const isGroup = isFormGroup(control);
  control._forEachChild((_, key) => {
    if (value[key] === void 0) {
      throw new RuntimeError(1002, NG_DEV_MODE ? missingControlValueError(isGroup, key) : "");
    }
  });
}
class AbstractControl {
  /**
   * Initialize the AbstractControl instance.
   *
   * @param validators The function or array of functions that is used to determine the validity of
   *     this control synchronously.
   * @param asyncValidators The function or array of functions that is used to determine validity of
   *     this control asynchronously.
   */
  constructor(validators, asyncValidators) {
    this._pendingDirty = false;
    this._hasOwnPendingAsyncValidator = false;
    this._pendingTouched = false;
    this._onCollectionChange = () => {
    };
    this._parent = null;
    this.pristine = true;
    this.touched = false;
    this._onDisabledChange = [];
    this._rawValidators = validators;
    this._rawAsyncValidators = asyncValidators;
    this._composedValidatorFn = coerceToValidator(this._rawValidators);
    this._composedAsyncValidatorFn = coerceToAsyncValidator(this._rawAsyncValidators);
  }
  /**
   * Returns the function that is used to determine the validity of this control synchronously.
   * If multiple validators have been added, this will be a single composed function.
   * See `Validators.compose()` for additional information.
   */
  get validator() {
    return this._composedValidatorFn;
  }
  set validator(validatorFn) {
    this._rawValidators = this._composedValidatorFn = validatorFn;
  }
  /**
   * Returns the function that is used to determine the validity of this control asynchronously.
   * If multiple validators have been added, this will be a single composed function.
   * See `Validators.compose()` for additional information.
   */
  get asyncValidator() {
    return this._composedAsyncValidatorFn;
  }
  set asyncValidator(asyncValidatorFn) {
    this._rawAsyncValidators = this._composedAsyncValidatorFn = asyncValidatorFn;
  }
  /**
   * The parent control.
   */
  get parent() {
    return this._parent;
  }
  /**
   * A control is `valid` when its `status` is `VALID`.
   *
   * @see {@link AbstractControl.status}
   *
   * @returns True if the control has passed all of its validation tests,
   * false otherwise.
   */
  get valid() {
    return this.status === VALID;
  }
  /**
   * A control is `invalid` when its `status` is `INVALID`.
   *
   * @see {@link AbstractControl.status}
   *
   * @returns True if this control has failed one or more of its validation checks,
   * false otherwise.
   */
  get invalid() {
    return this.status === INVALID;
  }
  /**
   * A control is `pending` when its `status` is `PENDING`.
   *
   * @see {@link AbstractControl.status}
   *
   * @returns True if this control is in the process of conducting a validation check,
   * false otherwise.
   */
  get pending() {
    return this.status == PENDING;
  }
  /**
   * A control is `disabled` when its `status` is `DISABLED`.
   *
   * Disabled controls are exempt from validation checks and
   * are not included in the aggregate value of their ancestor
   * controls.
   *
   * @see {@link AbstractControl.status}
   *
   * @returns True if the control is disabled, false otherwise.
   */
  get disabled() {
    return this.status === DISABLED;
  }
  /**
   * A control is `enabled` as long as its `status` is not `DISABLED`.
   *
   * @returns True if the control has any status other than 'DISABLED',
   * false if the status is 'DISABLED'.
   *
   * @see {@link AbstractControl.status}
   *
   */
  get enabled() {
    return this.status !== DISABLED;
  }
  /**
   * A control is `dirty` if the user has changed the value
   * in the UI.
   *
   * @returns True if the user has changed the value of this control in the UI; compare `pristine`.
   * Programmatic changes to a control's value do not mark it dirty.
   */
  get dirty() {
    return !this.pristine;
  }
  /**
   * True if the control has not been marked as touched
   *
   * A control is `untouched` if the user has not yet triggered
   * a `blur` event on it.
   */
  get untouched() {
    return !this.touched;
  }
  /**
   * Reports the update strategy of the `AbstractControl` (meaning
   * the event on which the control updates itself).
   * Possible values: `'change'` | `'blur'` | `'submit'`
   * Default value: `'change'`
   */
  get updateOn() {
    return this._updateOn ? this._updateOn : this.parent ? this.parent.updateOn : "change";
  }
  /**
   * Sets the synchronous validators that are active on this control.  Calling
   * this overwrites any existing synchronous validators.
   *
   * When you add or remove a validator at run time, you must call
   * `updateValueAndValidity()` for the new validation to take effect.
   *
   * If you want to add a new validator without affecting existing ones, consider
   * using `addValidators()` method instead.
   */
  setValidators(validators) {
    this._rawValidators = validators;
    this._composedValidatorFn = coerceToValidator(validators);
  }
  /**
   * Sets the asynchronous validators that are active on this control. Calling this
   * overwrites any existing asynchronous validators.
   *
   * When you add or remove a validator at run time, you must call
   * `updateValueAndValidity()` for the new validation to take effect.
   *
   * If you want to add a new validator without affecting existing ones, consider
   * using `addAsyncValidators()` method instead.
   */
  setAsyncValidators(validators) {
    this._rawAsyncValidators = validators;
    this._composedAsyncValidatorFn = coerceToAsyncValidator(validators);
  }
  /**
   * Add a synchronous validator or validators to this control, without affecting other validators.
   *
   * When you add or remove a validator at run time, you must call
   * `updateValueAndValidity()` for the new validation to take effect.
   *
   * Adding a validator that already exists will have no effect. If duplicate validator functions
   * are present in the `validators` array, only the first instance would be added to a form
   * control.
   *
   * @param validators The new validator function or functions to add to this control.
   */
  addValidators(validators) {
    this.setValidators(addValidators(validators, this._rawValidators));
  }
  /**
   * Add an asynchronous validator or validators to this control, without affecting other
   * validators.
   *
   * When you add or remove a validator at run time, you must call
   * `updateValueAndValidity()` for the new validation to take effect.
   *
   * Adding a validator that already exists will have no effect.
   *
   * @param validators The new asynchronous validator function or functions to add to this control.
   */
  addAsyncValidators(validators) {
    this.setAsyncValidators(addValidators(validators, this._rawAsyncValidators));
  }
  /**
   * Remove a synchronous validator from this control, without affecting other validators.
   * Validators are compared by function reference; you must pass a reference to the exact same
   * validator function as the one that was originally set. If a provided validator is not found,
   * it is ignored.
   *
   * When you add or remove a validator at run time, you must call
   * `updateValueAndValidity()` for the new validation to take effect.
   *
   * @param validators The validator or validators to remove.
   */
  removeValidators(validators) {
    this.setValidators(removeValidators(validators, this._rawValidators));
  }
  /**
   * Remove an asynchronous validator from this control, without affecting other validators.
   * Validators are compared by function reference; you must pass a reference to the exact same
   * validator function as the one that was originally set. If a provided validator is not found, it
   * is ignored.
   *
   * When you add or remove a validator at run time, you must call
   * `updateValueAndValidity()` for the new validation to take effect.
   *
   * @param validators The asynchronous validator or validators to remove.
   */
  removeAsyncValidators(validators) {
    this.setAsyncValidators(removeValidators(validators, this._rawAsyncValidators));
  }
  /**
   * Check whether a synchronous validator function is present on this control. The provided
   * validator must be a reference to the exact same function that was provided.
   *
   * @param validator The validator to check for presence. Compared by function reference.
   * @returns Whether the provided validator was found on this control.
   */
  hasValidator(validator) {
    return hasValidator(this._rawValidators, validator);
  }
  /**
   * Check whether an asynchronous validator function is present on this control. The provided
   * validator must be a reference to the exact same function that was provided.
   *
   * @param validator The asynchronous validator to check for presence. Compared by function
   *     reference.
   * @returns Whether the provided asynchronous validator was found on this control.
   */
  hasAsyncValidator(validator) {
    return hasValidator(this._rawAsyncValidators, validator);
  }
  /**
   * Empties out the synchronous validator list.
   *
   * When you add or remove a validator at run time, you must call
   * `updateValueAndValidity()` for the new validation to take effect.
   *
   */
  clearValidators() {
    this.validator = null;
  }
  /**
   * Empties out the async validator list.
   *
   * When you add or remove a validator at run time, you must call
   * `updateValueAndValidity()` for the new validation to take effect.
   *
   */
  clearAsyncValidators() {
    this.asyncValidator = null;
  }
  /**
   * Marks the control as `touched`. A control is touched by focus and
   * blur events that do not change the value.
   *
   * @see `markAsUntouched()`
   * @see `markAsDirty()`
   * @see `markAsPristine()`
   *
   * @param opts Configuration options that determine how the control propagates changes
   * and emits events after marking is applied.
   * * `onlySelf`: When true, mark only this control. When false or not supplied,
   * marks all direct ancestors. Default is false.
   */
  markAsTouched(opts = {}) {
    this.touched = true;
    if (this._parent && !opts.onlySelf) {
      this._parent.markAsTouched(opts);
    }
  }
  /**
   * Marks the control and all its descendant controls as `touched`.
   * @see `markAsTouched()`
   */
  markAllAsTouched() {
    this.markAsTouched({ onlySelf: true });
    this._forEachChild((control) => control.markAllAsTouched());
  }
  /**
   * Marks the control as `untouched`.
   *
   * If the control has any children, also marks all children as `untouched`
   * and recalculates the `touched` status of all parent controls.
   *
   * @see `markAsTouched()`
   * @see `markAsDirty()`
   * @see `markAsPristine()`
   *
   * @param opts Configuration options that determine how the control propagates changes
   * and emits events after the marking is applied.
   * * `onlySelf`: When true, mark only this control. When false or not supplied,
   * marks all direct ancestors. Default is false.
   */
  markAsUntouched(opts = {}) {
    this.touched = false;
    this._pendingTouched = false;
    this._forEachChild((control) => {
      control.markAsUntouched({ onlySelf: true });
    });
    if (this._parent && !opts.onlySelf) {
      this._parent._updateTouched(opts);
    }
  }
  /**
   * Marks the control as `dirty`. A control becomes dirty when
   * the control's value is changed through the UI; compare `markAsTouched`.
   *
   * @see `markAsTouched()`
   * @see `markAsUntouched()`
   * @see `markAsPristine()`
   *
   * @param opts Configuration options that determine how the control propagates changes
   * and emits events after marking is applied.
   * * `onlySelf`: When true, mark only this control. When false or not supplied,
   * marks all direct ancestors. Default is false.
   */
  markAsDirty(opts = {}) {
    this.pristine = false;
    if (this._parent && !opts.onlySelf) {
      this._parent.markAsDirty(opts);
    }
  }
  /**
   * Marks the control as `pristine`.
   *
   * If the control has any children, marks all children as `pristine`,
   * and recalculates the `pristine` status of all parent
   * controls.
   *
   * @see `markAsTouched()`
   * @see `markAsUntouched()`
   * @see `markAsDirty()`
   *
   * @param opts Configuration options that determine how the control emits events after
   * marking is applied.
   * * `onlySelf`: When true, mark only this control. When false or not supplied,
   * marks all direct ancestors. Default is false.
   */
  markAsPristine(opts = {}) {
    this.pristine = true;
    this._pendingDirty = false;
    this._forEachChild((control) => {
      control.markAsPristine({ onlySelf: true });
    });
    if (this._parent && !opts.onlySelf) {
      this._parent._updatePristine(opts);
    }
  }
  /**
   * Marks the control as `pending`.
   *
   * A control is pending while the control performs async validation.
   *
   * @see {@link AbstractControl.status}
   *
   * @param opts Configuration options that determine how the control propagates changes and
   * emits events after marking is applied.
   * * `onlySelf`: When true, mark only this control. When false or not supplied,
   * marks all direct ancestors. Default is false.
   * * `emitEvent`: When true or not supplied (the default), the `statusChanges`
   * observable emits an event with the latest status the control is marked pending.
   * When false, no events are emitted.
   *
   */
  markAsPending(opts = {}) {
    this.status = PENDING;
    if (opts.emitEvent !== false) {
      this.statusChanges.emit(this.status);
    }
    if (this._parent && !opts.onlySelf) {
      this._parent.markAsPending(opts);
    }
  }
  /**
   * Disables the control. This means the control is exempt from validation checks and
   * excluded from the aggregate value of any parent. Its status is `DISABLED`.
   *
   * If the control has children, all children are also disabled.
   *
   * @see {@link AbstractControl.status}
   *
   * @param opts Configuration options that determine how the control propagates
   * changes and emits events after the control is disabled.
   * * `onlySelf`: When true, mark only this control. When false or not supplied,
   * marks all direct ancestors. Default is false.
   * * `emitEvent`: When true or not supplied (the default), both the `statusChanges` and
   * `valueChanges`
   * observables emit events with the latest status and value when the control is disabled.
   * When false, no events are emitted.
   */
  disable(opts = {}) {
    const skipPristineCheck = this._parentMarkedDirty(opts.onlySelf);
    this.status = DISABLED;
    this.errors = null;
    this._forEachChild((control) => {
      control.disable({ ...opts, onlySelf: true });
    });
    this._updateValue();
    if (opts.emitEvent !== false) {
      this.valueChanges.emit(this.value);
      this.statusChanges.emit(this.status);
    }
    this._updateAncestors({ ...opts, skipPristineCheck });
    this._onDisabledChange.forEach((changeFn) => changeFn(true));
  }
  /**
   * Enables the control. This means the control is included in validation checks and
   * the aggregate value of its parent. Its status recalculates based on its value and
   * its validators.
   *
   * By default, if the control has children, all children are enabled.
   *
   * @see {@link AbstractControl.status}
   *
   * @param opts Configure options that control how the control propagates changes and
   * emits events when marked as untouched
   * * `onlySelf`: When true, mark only this control. When false or not supplied,
   * marks all direct ancestors. Default is false.
   * * `emitEvent`: When true or not supplied (the default), both the `statusChanges` and
   * `valueChanges`
   * observables emit events with the latest status and value when the control is enabled.
   * When false, no events are emitted.
   */
  enable(opts = {}) {
    const skipPristineCheck = this._parentMarkedDirty(opts.onlySelf);
    this.status = VALID;
    this._forEachChild((control) => {
      control.enable({ ...opts, onlySelf: true });
    });
    this.updateValueAndValidity({ onlySelf: true, emitEvent: opts.emitEvent });
    this._updateAncestors({ ...opts, skipPristineCheck });
    this._onDisabledChange.forEach((changeFn) => changeFn(false));
  }
  _updateAncestors(opts) {
    if (this._parent && !opts.onlySelf) {
      this._parent.updateValueAndValidity(opts);
      if (!opts.skipPristineCheck) {
        this._parent._updatePristine();
      }
      this._parent._updateTouched();
    }
  }
  /**
   * @param parent Sets the parent of the control
   */
  setParent(parent) {
    this._parent = parent;
  }
  /**
   * Recalculates the value and validation status of the control.
   *
   * By default, it also updates the value and validity of its ancestors.
   *
   * @param opts Configuration options determine how the control propagates changes and emits events
   * after updates and validity checks are applied.
   * * `onlySelf`: When true, only update this control. When false or not supplied,
   * update all direct ancestors. Default is false.
   * * `emitEvent`: When true or not supplied (the default), both the `statusChanges` and
   * `valueChanges`
   * observables emit events with the latest status and value when the control is updated.
   * When false, no events are emitted.
   */
  updateValueAndValidity(opts = {}) {
    this._setInitialStatus();
    this._updateValue();
    if (this.enabled) {
      this._cancelExistingSubscription();
      this.errors = this._runValidator();
      this.status = this._calculateStatus();
      if (this.status === VALID || this.status === PENDING) {
        this._runAsyncValidator(opts.emitEvent);
      }
    }
    if (opts.emitEvent !== false) {
      this.valueChanges.emit(this.value);
      this.statusChanges.emit(this.status);
    }
    if (this._parent && !opts.onlySelf) {
      this._parent.updateValueAndValidity(opts);
    }
  }
  /** @internal */
  _updateTreeValidity(opts = { emitEvent: true }) {
    this._forEachChild((ctrl) => ctrl._updateTreeValidity(opts));
    this.updateValueAndValidity({ onlySelf: true, emitEvent: opts.emitEvent });
  }
  _setInitialStatus() {
    this.status = this._allControlsDisabled() ? DISABLED : VALID;
  }
  _runValidator() {
    return this.validator ? this.validator(this) : null;
  }
  _runAsyncValidator(emitEvent) {
    if (this.asyncValidator) {
      this.status = PENDING;
      this._hasOwnPendingAsyncValidator = true;
      const obs = toObservable(this.asyncValidator(this));
      this._asyncValidationSubscription = obs.subscribe((errors) => {
        this._hasOwnPendingAsyncValidator = false;
        this.setErrors(errors, { emitEvent });
      });
    }
  }
  _cancelExistingSubscription() {
    if (this._asyncValidationSubscription) {
      this._asyncValidationSubscription.unsubscribe();
      this._hasOwnPendingAsyncValidator = false;
    }
  }
  /**
   * Sets errors on a form control when running validations manually, rather than automatically.
   *
   * Calling `setErrors` also updates the validity of the parent control.
   *
   * @usageNotes
   *
   * ### Manually set the errors for a control
   *
   * ```
   * const login = new FormControl('someLogin');
   * login.setErrors({
   *   notUnique: true
   * });
   *
   * expect(login.valid).toEqual(false);
   * expect(login.errors).toEqual({ notUnique: true });
   *
   * login.setValue('someOtherLogin');
   *
   * expect(login.valid).toEqual(true);
   * ```
   */
  setErrors(errors, opts = {}) {
    this.errors = errors;
    this._updateControlsErrors(opts.emitEvent !== false);
  }
  /**
   * Retrieves a child control given the control's name or path.
   *
   * @param path A dot-delimited string or array of string/number values that define the path to the
   * control.
   *
   * @usageNotes
   * ### Retrieve a nested control
   *
   * For example, to get a `name` control nested within a `person` sub-group:
   *
   * * `this.form.get('person.name');`
   *
   * -OR-
   *
   * * `this.form.get(['person', 'name']);`
   *
   * ### Retrieve a control in a FormArray
   *
   * When accessing an element inside a FormArray, you can use an element index.
   * For example, to get a `price` control from the first element in an `items` array you can use:
   *
   * * `this.form.get('items.0.price');`
   *
   * -OR-
   *
   * * `this.form.get(['items', 0, 'price']);`
   */
  get(path) {
    return _find(this, path, ".");
  }
  /**
   * @description
   * Reports error data for the control with the given path.
   *
   * @param errorCode The code of the error to check
   * @param path A list of control names that designates how to move from the current control
   * to the control that should be queried for errors.
   *
   * @usageNotes
   * For example, for the following `FormGroup`:
   *
   * ```
   * form = new FormGroup({
   *   address: new FormGroup({ street: new FormControl() })
   * });
   * ```
   *
   * The path to the 'street' control from the root form would be 'address' -> 'street'.
   *
   * It can be provided to this method in one of two formats:
   *
   * 1. An array of string control names, e.g. `['address', 'street']`
   * 1. A period-delimited list of control names in one string, e.g. `'address.street'`
   *
   * @returns error data for that particular error. If the control or error is not present,
   * null is returned.
   */
  getError(errorCode, path) {
    const control = path ? this.get(path) : this;
    return control && control.errors ? control.errors[errorCode] : null;
  }
  /**
   * @description
   * Reports whether the control with the given path has the error specified.
   *
   * @param errorCode The code of the error to check
   * @param path A list of control names that designates how to move from the current control
   * to the control that should be queried for errors.
   *
   * @usageNotes
   * For example, for the following `FormGroup`:
   *
   * ```
   * form = new FormGroup({
   *   address: new FormGroup({ street: new FormControl() })
   * });
   * ```
   *
   * The path to the 'street' control from the root form would be 'address' -> 'street'.
   *
   * It can be provided to this method in one of two formats:
   *
   * 1. An array of string control names, e.g. `['address', 'street']`
   * 1. A period-delimited list of control names in one string, e.g. `'address.street'`
   *
   * If no path is given, this method checks for the error on the current control.
   *
   * @returns whether the given error is present in the control at the given path.
   *
   * If the control is not present, false is returned.
   */
  hasError(errorCode, path) {
    return !!this.getError(errorCode, path);
  }
  /**
   * Retrieves the top-level ancestor of this control.
   */
  get root() {
    let x = this;
    while (x._parent) {
      x = x._parent;
    }
    return x;
  }
  /** @internal */
  _updateControlsErrors(emitEvent) {
    this.status = this._calculateStatus();
    if (emitEvent) {
      this.statusChanges.emit(this.status);
    }
    if (this._parent) {
      this._parent._updateControlsErrors(emitEvent);
    }
  }
  /** @internal */
  _initObservables() {
    this.valueChanges = new EventEmitter();
    this.statusChanges = new EventEmitter();
  }
  _calculateStatus() {
    if (this._allControlsDisabled())
      return DISABLED;
    if (this.errors)
      return INVALID;
    if (this._hasOwnPendingAsyncValidator || this._anyControlsHaveStatus(PENDING))
      return PENDING;
    if (this._anyControlsHaveStatus(INVALID))
      return INVALID;
    return VALID;
  }
  /** @internal */
  _anyControlsHaveStatus(status) {
    return this._anyControls((control) => control.status === status);
  }
  /** @internal */
  _anyControlsDirty() {
    return this._anyControls((control) => control.dirty);
  }
  /** @internal */
  _anyControlsTouched() {
    return this._anyControls((control) => control.touched);
  }
  /** @internal */
  _updatePristine(opts = {}) {
    this.pristine = !this._anyControlsDirty();
    if (this._parent && !opts.onlySelf) {
      this._parent._updatePristine(opts);
    }
  }
  /** @internal */
  _updateTouched(opts = {}) {
    this.touched = this._anyControlsTouched();
    if (this._parent && !opts.onlySelf) {
      this._parent._updateTouched(opts);
    }
  }
  /** @internal */
  _isBoxedValue(formState) {
    return typeof formState === "object" && formState !== null && Object.keys(formState).length === 2 && "value" in formState && "disabled" in formState;
  }
  /** @internal */
  _registerOnCollectionChange(fn2) {
    this._onCollectionChange = fn2;
  }
  /** @internal */
  _setUpdateStrategy(opts) {
    if (isOptionsObj(opts) && opts.updateOn != null) {
      this._updateOn = opts.updateOn;
    }
  }
  /**
   * Check to see if parent has been marked artificially dirty.
   *
   * @internal
   */
  _parentMarkedDirty(onlySelf) {
    const parentDirty = this._parent && this._parent.dirty;
    return !onlySelf && !!parentDirty && !this._parent._anyControlsDirty();
  }
}
class FormControl extends AbstractControl {
  /**
   * Creates a new `FormControl` instance.
   *
   * @param formState Initializes the control with an initial value,
   * or an object that defines the initial value and disabled state.
   *
   * @param validatorOrOpts A synchronous validator function, or an array of
   * such functions, or an `AbstractControlOptions` object that contains validation functions
   * and a validation trigger.
   *
   * @param asyncValidator A single async validator or array of async validator functions
   *
   */
  constructor(formState = null, validatorOrOpts, asyncValidator) {
    super(pickValidators(validatorOrOpts), pickAsyncValidators(asyncValidator, validatorOrOpts));
    this.defaultValue = null;
    this._onChange = [];
    this._pendingChange = false;
    this._applyFormState(formState);
    this._setUpdateStrategy(validatorOrOpts);
    this._initObservables();
    this.updateValueAndValidity({
      onlySelf: true,
      // If `asyncValidator` is present, it will trigger control status change from `PENDING` to
      // `VALID` or `INVALID`.
      // The status should be broadcasted via the `statusChanges` observable, so we set `emitEvent`
      // to `true` to allow that during the control creation process.
      emitEvent: !!this.asyncValidator
    });
    if (isOptionsObj(validatorOrOpts) && validatorOrOpts.initialValueIsDefault) {
      if (this._isBoxedValue(formState)) {
        this.defaultValue = formState.value;
      } else {
        this.defaultValue = formState;
      }
    }
  }
  /**
   * Sets a new value for the form control.
   *
   * @param value The new value for the control.
   * @param options Configuration options that determine how the control propagates changes
   * and emits events when the value changes.
   * The configuration options are passed to the {@link AbstractControl#updateValueAndValidity
   * updateValueAndValidity} method.
   *
   * * `onlySelf`: When true, each change only affects this control, and not its parent. Default is
   * false.
   * * `emitEvent`: When true or not supplied (the default), both the `statusChanges` and
   * `valueChanges`
   * observables emit events with the latest status and value when the control value is updated.
   * When false, no events are emitted.
   * * `emitModelToViewChange`: When true or not supplied  (the default), each change triggers an
   * `onChange` event to
   * update the view.
   * * `emitViewToModelChange`: When true or not supplied (the default), each change triggers an
   * `ngModelChange`
   * event to update the model.
   *
   */
  setValue(value, options = {}) {
    this.value = this._pendingValue = value;
    if (this._onChange.length && options.emitModelToViewChange !== false) {
      this._onChange.forEach((changeFn) => changeFn(this.value, options.emitViewToModelChange !== false));
    }
    this.updateValueAndValidity(options);
  }
  /**
   * Patches the value of a control.
   *
   * This function is functionally the same as {@link FormControl#setValue setValue} at this level.
   * It exists for symmetry with {@link FormGroup#patchValue patchValue} on `FormGroups` and
   * `FormArrays`, where it does behave differently.
   *
   * @see `setValue` for options
   */
  patchValue(value, options = {}) {
    this.setValue(value, options);
  }
  /**
   * Resets the form control, marking it `pristine` and `untouched`, and resetting
   * the value. The new value will be the provided value (if passed), `null`, or the initial value
   * if `initialValueIsDefault` was set in the constructor via {@link FormControlOptions}.
   *
   * ```ts
   * // By default, the control will reset to null.
   * const dog = new FormControl('spot');
   * dog.reset(); // dog.value is null
   *
   * // If this flag is set, the control will instead reset to the initial value.
   * const cat = new FormControl('tabby', {initialValueIsDefault: true});
   * cat.reset(); // cat.value is "tabby"
   *
   * // A value passed to reset always takes precedence.
   * const fish = new FormControl('finn', {initialValueIsDefault: true});
   * fish.reset('bubble'); // fish.value is "bubble"
   * ```
   *
   * @param formState Resets the control with an initial value,
   * or an object that defines the initial value and disabled state.
   *
   * @param options Configuration options that determine how the control propagates changes
   * and emits events after the value changes.
   *
   * * `onlySelf`: When true, each change only affects this control, and not its parent. Default is
   * false.
   * * `emitEvent`: When true or not supplied (the default), both the `statusChanges` and
   * `valueChanges`
   * observables emit events with the latest status and value when the control is reset.
   * When false, no events are emitted.
   *
   */
  reset(formState = this.defaultValue, options = {}) {
    this._applyFormState(formState);
    this.markAsPristine(options);
    this.markAsUntouched(options);
    this.setValue(this.value, options);
    this._pendingChange = false;
  }
  /**
   * @internal
   */
  _updateValue() {
  }
  /**
   * @internal
   */
  _anyControls(condition) {
    return false;
  }
  /**
   * @internal
   */
  _allControlsDisabled() {
    return this.disabled;
  }
  /**
   * Register a listener for change events.
   *
   * @param fn The method that is called when the value changes
   */
  registerOnChange(fn2) {
    this._onChange.push(fn2);
  }
  /**
   * Internal function to unregister a change events listener.
   * @internal
   */
  _unregisterOnChange(fn2) {
    removeListItem(this._onChange, fn2);
  }
  /**
   * Register a listener for disabled events.
   *
   * @param fn The method that is called when the disabled status changes.
   */
  registerOnDisabledChange(fn2) {
    this._onDisabledChange.push(fn2);
  }
  /**
   * Internal function to unregister a disabled event listener.
   * @internal
   */
  _unregisterOnDisabledChange(fn2) {
    removeListItem(this._onDisabledChange, fn2);
  }
  /**
   * @internal
   */
  _forEachChild(cb) {
  }
  /** @internal */
  _syncPendingControls() {
    if (this.updateOn === "submit") {
      if (this._pendingDirty)
        this.markAsDirty();
      if (this._pendingTouched)
        this.markAsTouched();
      if (this._pendingChange) {
        this.setValue(this._pendingValue, { onlySelf: true, emitModelToViewChange: false });
        return true;
      }
    }
    return false;
  }
  _applyFormState(formState) {
    if (this._isBoxedValue(formState)) {
      this.value = this._pendingValue = formState.value;
      formState.disabled ? this.disable({ onlySelf: true, emitEvent: false }) : this.enable({ onlySelf: true, emitEvent: false });
    } else {
      this.value = this._pendingValue = formState;
    }
  }
}
class FormGroup extends AbstractControl {
  /**
   * Creates a new `FormGroup` instance.
   *
   * @param controls A collection of child controls. The key for each child is the name
   * under which it is registered.
   *
   * @param validatorOrOpts A synchronous validator function, or an array of
   * such functions, or an `AbstractControlOptions` object that contains validation functions
   * and a validation trigger.
   *
   * @param asyncValidator A single async validator or array of async validator functions
   *
   */
  constructor(controls, validatorOrOpts, asyncValidator) {
    super(pickValidators(validatorOrOpts), pickAsyncValidators(asyncValidator, validatorOrOpts));
    this.controls = controls;
    this._initObservables();
    this._setUpdateStrategy(validatorOrOpts);
    this._setUpControls();
    this.updateValueAndValidity({
      onlySelf: true,
      // If `asyncValidator` is present, it will trigger control status change from `PENDING` to
      // `VALID` or `INVALID`. The status should be broadcasted via the `statusChanges` observable,
      // so we set `emitEvent` to `true` to allow that during the control creation process.
      emitEvent: !!this.asyncValidator
    });
  }
  /**
   * Registers a control with the group's list of controls.
   *
   * This method does not update the value or validity of the control.
   * Use {@link FormGroup#addControl addControl} instead.
   *
   * @param name The control name to register in the collection
   * @param control Provides the control for the given name
   */
  registerControl(name, control) {
    if (this.controls[name])
      return this.controls[name];
    this.controls[name] = control;
    control.setParent(this);
    control._registerOnCollectionChange(this._onCollectionChange);
    return control;
  }
  /**
   * Add a control to this group.
   *
   * If a control with a given name already exists, it would *not* be replaced with a new one.
   * If you want to replace an existing control, use the {@link FormGroup#setControl setControl}
   * method instead. This method also updates the value and validity of the control.
   *
   * @param name The control name to add to the collection
   * @param control Provides the control for the given name
   * @param options Specifies whether this FormGroup instance should emit events after a new
   *     control is added.
   * * `emitEvent`: When true or not supplied (the default), both the `statusChanges` and
   * `valueChanges` observables emit events with the latest status and value when the control is
   * added. When false, no events are emitted.
   */
  addControl(name, control, options = {}) {
    this.registerControl(name, control);
    this.updateValueAndValidity({ emitEvent: options.emitEvent });
    this._onCollectionChange();
  }
  /**
   * Remove a control from this group.
   *
   * This method also updates the value and validity of the control.
   *
   * @param name The control name to remove from the collection
   * @param options Specifies whether this FormGroup instance should emit events after a
   *     control is removed.
   * * `emitEvent`: When true or not supplied (the default), both the `statusChanges` and
   * `valueChanges` observables emit events with the latest status and value when the control is
   * removed. When false, no events are emitted.
   */
  removeControl(name, options = {}) {
    if (this.controls[name])
      this.controls[name]._registerOnCollectionChange(() => {
      });
    delete this.controls[name];
    this.updateValueAndValidity({ emitEvent: options.emitEvent });
    this._onCollectionChange();
  }
  /**
   * Replace an existing control.
   *
   * If a control with a given name does not exist in this `FormGroup`, it will be added.
   *
   * @param name The control name to replace in the collection
   * @param control Provides the control for the given name
   * @param options Specifies whether this FormGroup instance should emit events after an
   *     existing control is replaced.
   * * `emitEvent`: When true or not supplied (the default), both the `statusChanges` and
   * `valueChanges` observables emit events with the latest status and value when the control is
   * replaced with a new one. When false, no events are emitted.
   */
  setControl(name, control, options = {}) {
    if (this.controls[name])
      this.controls[name]._registerOnCollectionChange(() => {
      });
    delete this.controls[name];
    if (control)
      this.registerControl(name, control);
    this.updateValueAndValidity({ emitEvent: options.emitEvent });
    this._onCollectionChange();
  }
  /**
   * Check whether there is an enabled control with the given name in the group.
   *
   * Reports false for disabled controls. If you'd like to check for existence in the group
   * only, use {@link AbstractControl#get get} instead.
   *
   * @param controlName The control name to check for existence in the collection
   *
   * @returns false for disabled controls, true otherwise.
   */
  contains(controlName) {
    return this.controls.hasOwnProperty(controlName) && this.controls[controlName].enabled;
  }
  /**
   * Sets the value of the `FormGroup`. It accepts an object that matches
   * the structure of the group, with control names as keys.
   *
   * @usageNotes
   * ### Set the complete value for the form group
   *
   * ```
   * const form = new FormGroup({
   *   first: new FormControl(),
   *   last: new FormControl()
   * });
   *
   * console.log(form.value);   // {first: null, last: null}
   *
   * form.setValue({first: 'Nancy', last: 'Drew'});
   * console.log(form.value);   // {first: 'Nancy', last: 'Drew'}
   * ```
   *
   * @throws When strict checks fail, such as setting the value of a control
   * that doesn't exist or if you exclude a value of a control that does exist.
   *
   * @param value The new value for the control that matches the structure of the group.
   * @param options Configuration options that determine how the control propagates changes
   * and emits events after the value changes.
   * The configuration options are passed to the {@link AbstractControl#updateValueAndValidity
   * updateValueAndValidity} method.
   *
   * * `onlySelf`: When true, each change only affects this control, and not its parent. Default is
   * false.
   * * `emitEvent`: When true or not supplied (the default), both the `statusChanges` and
   * `valueChanges`
   * observables emit events with the latest status and value when the control value is updated.
   * When false, no events are emitted.
   */
  setValue(value, options = {}) {
    assertAllValuesPresent(this, value);
    Object.keys(value).forEach((name) => {
      assertControlPresent(this, name);
      this.controls[name].setValue(value[name], { onlySelf: true, emitEvent: options.emitEvent });
    });
    this.updateValueAndValidity(options);
  }
  /**
   * Patches the value of the `FormGroup`. It accepts an object with control
   * names as keys, and does its best to match the values to the correct controls
   * in the group.
   *
   * It accepts both super-sets and sub-sets of the group without throwing an error.
   *
   * @usageNotes
   * ### Patch the value for a form group
   *
   * ```
   * const form = new FormGroup({
   *    first: new FormControl(),
   *    last: new FormControl()
   * });
   * console.log(form.value);   // {first: null, last: null}
   *
   * form.patchValue({first: 'Nancy'});
   * console.log(form.value);   // {first: 'Nancy', last: null}
   * ```
   *
   * @param value The object that matches the structure of the group.
   * @param options Configuration options that determine how the control propagates changes and
   * emits events after the value is patched.
   * * `onlySelf`: When true, each change only affects this control and not its parent. Default is
   * true.
   * * `emitEvent`: When true or not supplied (the default), both the `statusChanges` and
   * `valueChanges` observables emit events with the latest status and value when the control value
   * is updated. When false, no events are emitted. The configuration options are passed to
   * the {@link AbstractControl#updateValueAndValidity updateValueAndValidity} method.
   */
  patchValue(value, options = {}) {
    if (value == null)
      return;
    Object.keys(value).forEach((name) => {
      if (this.controls[name]) {
        this.controls[name].patchValue(value[name], { onlySelf: true, emitEvent: options.emitEvent });
      }
    });
    this.updateValueAndValidity(options);
  }
  /**
   * Resets the `FormGroup`, marks all descendants `pristine` and `untouched` and sets
   * the value of all descendants to null.
   *
   * You reset to a specific form state by passing in a map of states
   * that matches the structure of your form, with control names as keys. The state
   * is a standalone value or a form state object with both a value and a disabled
   * status.
   *
   * @param value Resets the control with an initial value,
   * or an object that defines the initial value and disabled state.
   *
   * @param options Configuration options that determine how the control propagates changes
   * and emits events when the group is reset.
   * * `onlySelf`: When true, each change only affects this control, and not its parent. Default is
   * false.
   * * `emitEvent`: When true or not supplied (the default), both the `statusChanges` and
   * `valueChanges`
   * observables emit events with the latest status and value when the control is reset.
   * When false, no events are emitted.
   * The configuration options are passed to the {@link AbstractControl#updateValueAndValidity
   * updateValueAndValidity} method.
   *
   * @usageNotes
   *
   * ### Reset the form group values
   *
   * ```ts
   * const form = new FormGroup({
   *   first: new FormControl('first name'),
   *   last: new FormControl('last name')
   * });
   *
   * console.log(form.value);  // {first: 'first name', last: 'last name'}
   *
   * form.reset({ first: 'name', last: 'last name' });
   *
   * console.log(form.value);  // {first: 'name', last: 'last name'}
   * ```
   *
   * ### Reset the form group values and disabled status
   *
   * ```
   * const form = new FormGroup({
   *   first: new FormControl('first name'),
   *   last: new FormControl('last name')
   * });
   *
   * form.reset({
   *   first: {value: 'name', disabled: true},
   *   last: 'last'
   * });
   *
   * console.log(form.value);  // {last: 'last'}
   * console.log(form.get('first').status);  // 'DISABLED'
   * ```
   */
  reset(value = {}, options = {}) {
    this._forEachChild((control, name) => {
      control.reset(value[name], { onlySelf: true, emitEvent: options.emitEvent });
    });
    this._updatePristine(options);
    this._updateTouched(options);
    this.updateValueAndValidity(options);
  }
  /**
   * The aggregate value of the `FormGroup`, including any disabled controls.
   *
   * Retrieves all values regardless of disabled status.
   * The `value` property is the best way to get the value of the group, because
   * it excludes disabled controls in the `FormGroup`.
   */
  getRawValue() {
    return this._reduceChildren({}, (acc, control, name) => {
      acc[name] = getRawValue(control);
      return acc;
    });
  }
  /** @internal */
  _syncPendingControls() {
    let subtreeUpdated = this._reduceChildren(false, (updated, child) => {
      return child._syncPendingControls() ? true : updated;
    });
    if (subtreeUpdated)
      this.updateValueAndValidity({ onlySelf: true });
    return subtreeUpdated;
  }
  /** @internal */
  _forEachChild(cb) {
    Object.keys(this.controls).forEach((key) => {
      const control = this.controls[key];
      control && cb(control, key);
    });
  }
  /** @internal */
  _setUpControls() {
    this._forEachChild((control) => {
      control.setParent(this);
      control._registerOnCollectionChange(this._onCollectionChange);
    });
  }
  /** @internal */
  _updateValue() {
    this.value = this._reduceValue();
  }
  /** @internal */
  _anyControls(condition) {
    for (const controlName of Object.keys(this.controls)) {
      const control = this.controls[controlName];
      if (this.contains(controlName) && condition(control)) {
        return true;
      }
    }
    return false;
  }
  /** @internal */
  _reduceValue() {
    return this._reduceChildren({}, (acc, control, name) => {
      if (control.enabled || this.disabled) {
        acc[name] = control.value;
      }
      return acc;
    });
  }
  /** @internal */
  _reduceChildren(initValue, fn2) {
    let res = initValue;
    this._forEachChild((control, name) => {
      res = fn2(res, control, name);
    });
    return res;
  }
  /** @internal */
  _allControlsDisabled() {
    for (const controlName of Object.keys(this.controls)) {
      if (this.controls[controlName].enabled) {
        return false;
      }
    }
    return Object.keys(this.controls).length > 0 || this.disabled;
  }
}
class FormArray extends AbstractControl {
  /**
   * Creates a new `FormArray` instance.
   *
   * @param controls An array of child controls. Each child control is given an index
   * where it is registered.
   *
   * @param validatorOrOpts A synchronous validator function, or an array of
   * such functions, or an `AbstractControlOptions` object that contains validation functions
   * and a validation trigger.
   *
   * @param asyncValidator A single async validator or array of async validator functions
   *
   */
  constructor(controls, validatorOrOpts, asyncValidator) {
    super(pickValidators(validatorOrOpts), pickAsyncValidators(asyncValidator, validatorOrOpts));
    this.controls = controls;
    this._initObservables();
    this._setUpdateStrategy(validatorOrOpts);
    this._setUpControls();
    this.updateValueAndValidity({
      onlySelf: true,
      // If `asyncValidator` is present, it will trigger control status change from `PENDING` to
      // `VALID` or `INVALID`.
      // The status should be broadcasted via the `statusChanges` observable, so we set `emitEvent`
      // to `true` to allow that during the control creation process.
      emitEvent: !!this.asyncValidator
    });
  }
  /**
   * Get the `AbstractControl` at the given `index` in the array.
   *
   * @param index Index in the array to retrieve the control
   */
  at(index) {
    return this.controls[index];
  }
  /**
   * Insert a new `AbstractControl` at the end of the array.
   *
   * @param control Form control to be inserted
   * @param options Specifies whether this FormArray instance should emit events after a new
   *     control is added.
   * * `emitEvent`: When true or not supplied (the default), both the `statusChanges` and
   * `valueChanges` observables emit events with the latest status and value when the control is
   * inserted. When false, no events are emitted.
   */
  push(control, options = {}) {
    this.controls.push(control);
    this._registerControl(control);
    this.updateValueAndValidity({ emitEvent: options.emitEvent });
    this._onCollectionChange();
  }
  /**
   * Insert a new `AbstractControl` at the given `index` in the array.
   *
   * @param index Index in the array to insert the control
   * @param control Form control to be inserted
   * @param options Specifies whether this FormArray instance should emit events after a new
   *     control is inserted.
   * * `emitEvent`: When true or not supplied (the default), both the `statusChanges` and
   * `valueChanges` observables emit events with the latest status and value when the control is
   * inserted. When false, no events are emitted.
   */
  insert(index, control, options = {}) {
    this.controls.splice(index, 0, control);
    this._registerControl(control);
    this.updateValueAndValidity({ emitEvent: options.emitEvent });
  }
  /**
   * Remove the control at the given `index` in the array.
   *
   * @param index Index in the array to remove the control
   * @param options Specifies whether this FormArray instance should emit events after a
   *     control is removed.
   * * `emitEvent`: When true or not supplied (the default), both the `statusChanges` and
   * `valueChanges` observables emit events with the latest status and value when the control is
   * removed. When false, no events are emitted.
   */
  removeAt(index, options = {}) {
    if (this.controls[index])
      this.controls[index]._registerOnCollectionChange(() => {
      });
    this.controls.splice(index, 1);
    this.updateValueAndValidity({ emitEvent: options.emitEvent });
  }
  /**
   * Replace an existing control.
   *
   * @param index Index in the array to replace the control
   * @param control The `AbstractControl` control to replace the existing control
   * @param options Specifies whether this FormArray instance should emit events after an
   *     existing control is replaced with a new one.
   * * `emitEvent`: When true or not supplied (the default), both the `statusChanges` and
   * `valueChanges` observables emit events with the latest status and value when the control is
   * replaced with a new one. When false, no events are emitted.
   */
  setControl(index, control, options = {}) {
    if (this.controls[index])
      this.controls[index]._registerOnCollectionChange(() => {
      });
    this.controls.splice(index, 1);
    if (control) {
      this.controls.splice(index, 0, control);
      this._registerControl(control);
    }
    this.updateValueAndValidity({ emitEvent: options.emitEvent });
    this._onCollectionChange();
  }
  /**
   * Length of the control array.
   */
  get length() {
    return this.controls.length;
  }
  /**
   * Sets the value of the `FormArray`. It accepts an array that matches
   * the structure of the control.
   *
   * This method performs strict checks, and throws an error if you try
   * to set the value of a control that doesn't exist or if you exclude the
   * value of a control.
   *
   * @usageNotes
   * ### Set the values for the controls in the form array
   *
   * ```
   * const arr = new FormArray([
   *   new FormControl(),
   *   new FormControl()
   * ]);
   * console.log(arr.value);   // [null, null]
   *
   * arr.setValue(['Nancy', 'Drew']);
   * console.log(arr.value);   // ['Nancy', 'Drew']
   * ```
   *
   * @param value Array of values for the controls
   * @param options Configure options that determine how the control propagates changes and
   * emits events after the value changes
   *
   * * `onlySelf`: When true, each change only affects this control, and not its parent. Default
   * is false.
   * * `emitEvent`: When true or not supplied (the default), both the `statusChanges` and
   * `valueChanges`
   * observables emit events with the latest status and value when the control value is updated.
   * When false, no events are emitted.
   * The configuration options are passed to the {@link AbstractControl#updateValueAndValidity
   * updateValueAndValidity} method.
   */
  setValue(value, options = {}) {
    assertAllValuesPresent(this, value);
    value.forEach((newValue, index) => {
      assertControlPresent(this, index);
      this.at(index).setValue(newValue, { onlySelf: true, emitEvent: options.emitEvent });
    });
    this.updateValueAndValidity(options);
  }
  /**
   * Patches the value of the `FormArray`. It accepts an array that matches the
   * structure of the control, and does its best to match the values to the correct
   * controls in the group.
   *
   * It accepts both super-sets and sub-sets of the array without throwing an error.
   *
   * @usageNotes
   * ### Patch the values for controls in a form array
   *
   * ```
   * const arr = new FormArray([
   *    new FormControl(),
   *    new FormControl()
   * ]);
   * console.log(arr.value);   // [null, null]
   *
   * arr.patchValue(['Nancy']);
   * console.log(arr.value);   // ['Nancy', null]
   * ```
   *
   * @param value Array of latest values for the controls
   * @param options Configure options that determine how the control propagates changes and
   * emits events after the value changes
   *
   * * `onlySelf`: When true, each change only affects this control, and not its parent. Default
   * is false.
   * * `emitEvent`: When true or not supplied (the default), both the `statusChanges` and
   * `valueChanges` observables emit events with the latest status and value when the control value
   * is updated. When false, no events are emitted. The configuration options are passed to
   * the {@link AbstractControl#updateValueAndValidity updateValueAndValidity} method.
   */
  patchValue(value, options = {}) {
    if (value == null)
      return;
    value.forEach((newValue, index) => {
      if (this.at(index)) {
        this.at(index).patchValue(newValue, { onlySelf: true, emitEvent: options.emitEvent });
      }
    });
    this.updateValueAndValidity(options);
  }
  /**
   * Resets the `FormArray` and all descendants are marked `pristine` and `untouched`, and the
   * value of all descendants to null or null maps.
   *
   * You reset to a specific form state by passing in an array of states
   * that matches the structure of the control. The state is a standalone value
   * or a form state object with both a value and a disabled status.
   *
   * @usageNotes
   * ### Reset the values in a form array
   *
   * ```ts
   * const arr = new FormArray([
   *    new FormControl(),
   *    new FormControl()
   * ]);
   * arr.reset(['name', 'last name']);
   *
   * console.log(arr.value);  // ['name', 'last name']
   * ```
   *
   * ### Reset the values in a form array and the disabled status for the first control
   *
   * ```
   * arr.reset([
   *   {value: 'name', disabled: true},
   *   'last'
   * ]);
   *
   * console.log(arr.value);  // ['last']
   * console.log(arr.at(0).status);  // 'DISABLED'
   * ```
   *
   * @param value Array of values for the controls
   * @param options Configure options that determine how the control propagates changes and
   * emits events after the value changes
   *
   * * `onlySelf`: When true, each change only affects this control, and not its parent. Default
   * is false.
   * * `emitEvent`: When true or not supplied (the default), both the `statusChanges` and
   * `valueChanges`
   * observables emit events with the latest status and value when the control is reset.
   * When false, no events are emitted.
   * The configuration options are passed to the {@link AbstractControl#updateValueAndValidity
   * updateValueAndValidity} method.
   */
  reset(value = [], options = {}) {
    this._forEachChild((control, index) => {
      control.reset(value[index], { onlySelf: true, emitEvent: options.emitEvent });
    });
    this._updatePristine(options);
    this._updateTouched(options);
    this.updateValueAndValidity(options);
  }
  /**
   * The aggregate value of the array, including any disabled controls.
   *
   * Reports all values regardless of disabled status.
   * For enabled controls only, the `value` property is the best way to get the value of the array.
   */
  getRawValue() {
    return this.controls.map((control) => getRawValue(control));
  }
  /**
   * Remove all controls in the `FormArray`.
   *
   * @param options Specifies whether this FormArray instance should emit events after all
   *     controls are removed.
   * * `emitEvent`: When true or not supplied (the default), both the `statusChanges` and
   * `valueChanges` observables emit events with the latest status and value when all controls
   * in this FormArray instance are removed. When false, no events are emitted.
   *
   * @usageNotes
   * ### Remove all elements from a FormArray
   *
   * ```ts
   * const arr = new FormArray([
   *    new FormControl(),
   *    new FormControl()
   * ]);
   * console.log(arr.length);  // 2
   *
   * arr.clear();
   * console.log(arr.length);  // 0
   * ```
   *
   * It's a simpler and more efficient alternative to removing all elements one by one:
   *
   * ```ts
   * const arr = new FormArray([
   *    new FormControl(),
   *    new FormControl()
   * ]);
   *
   * while (arr.length) {
   *    arr.removeAt(0);
   * }
   * ```
   */
  clear(options = {}) {
    if (this.controls.length < 1)
      return;
    this._forEachChild((control) => control._registerOnCollectionChange(() => {
    }));
    this.controls.splice(0);
    this.updateValueAndValidity({ emitEvent: options.emitEvent });
  }
  /** @internal */
  _syncPendingControls() {
    let subtreeUpdated = this.controls.reduce((updated, child) => {
      return child._syncPendingControls() ? true : updated;
    }, false);
    if (subtreeUpdated)
      this.updateValueAndValidity({ onlySelf: true });
    return subtreeUpdated;
  }
  /** @internal */
  _forEachChild(cb) {
    this.controls.forEach((control, index) => {
      cb(control, index);
    });
  }
  /** @internal */
  _updateValue() {
    this.value = this.controls.filter((control) => control.enabled || this.disabled).map((control) => control.value);
  }
  /** @internal */
  _anyControls(condition) {
    return this.controls.some((control) => control.enabled && condition(control));
  }
  /** @internal */
  _setUpControls() {
    this._forEachChild((control) => this._registerControl(control));
  }
  /** @internal */
  _allControlsDisabled() {
    for (const control of this.controls) {
      if (control.enabled)
        return false;
    }
    return this.controls.length > 0 || this.disabled;
  }
  _registerControl(control) {
    control.setParent(this);
    control._registerOnCollectionChange(this._onCollectionChange);
  }
}
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
const formDirectiveProvider$1 = {
  provide: ControlContainer,
  useExisting: forwardRef(() => NgForm)
};
const resolvedPromise$1 = (() => Promise.resolve(null))();
class NgForm extends ControlContainer {
  constructor(validators, asyncValidators) {
    super();
    this.submitted = false;
    this._directives = /* @__PURE__ */ new Set();
    this.ngSubmit = new EventEmitter();
    this.form = new FormGroup({}, composeValidators(validators), composeAsyncValidators(asyncValidators));
  }
  /** @nodoc */
  ngAfterViewInit() {
    this._setUpdateStrategy();
  }
  /**
   * @description
   * The directive instance.
   */
  get formDirective() {
    return this;
  }
  /**
   * @description
   * The internal `FormGroup` instance.
   */
  get control() {
    return this.form;
  }
  /**
   * @description
   * Returns an array representing the path to this group. Because this directive
   * always lives at the top level of a form, it is always an empty array.
   */
  get path() {
    return [];
  }
  /**
   * @description
   * Returns a map of the controls in this group.
   */
  get controls() {
    return this.form.controls;
  }
  /**
   * @description
   * Method that sets up the control directive in this group, re-calculates its value
   * and validity, and adds the instance to the internal list of directives.
   *
   * @param dir The `NgModel` directive instance.
   */
  addControl(dir) {
    resolvedPromise$1.then(() => {
      const container = this._findContainer(dir.path);
      dir.control = container.registerControl(dir.name, dir.control);
      setUpControl(dir.control, dir);
      dir.control.updateValueAndValidity({ emitEvent: false });
      this._directives.add(dir);
    });
  }
  /**
   * @description
   * Retrieves the `FormControl` instance from the provided `NgModel` directive.
   *
   * @param dir The `NgModel` directive instance.
   */
  getControl(dir) {
    return this.form.get(dir.path);
  }
  /**
   * @description
   * Removes the `NgModel` instance from the internal list of directives
   *
   * @param dir The `NgModel` directive instance.
   */
  removeControl(dir) {
    resolvedPromise$1.then(() => {
      const container = this._findContainer(dir.path);
      if (container) {
        container.removeControl(dir.name);
      }
      this._directives.delete(dir);
    });
  }
  /**
   * @description
   * Adds a new `NgModelGroup` directive instance to the form.
   *
   * @param dir The `NgModelGroup` directive instance.
   */
  addFormGroup(dir) {
    resolvedPromise$1.then(() => {
      const container = this._findContainer(dir.path);
      const group = new FormGroup({});
      setUpFormContainer(group, dir);
      container.registerControl(dir.name, group);
      group.updateValueAndValidity({ emitEvent: false });
    });
  }
  /**
   * @description
   * Removes the `NgModelGroup` directive instance from the form.
   *
   * @param dir The `NgModelGroup` directive instance.
   */
  removeFormGroup(dir) {
    resolvedPromise$1.then(() => {
      const container = this._findContainer(dir.path);
      if (container) {
        container.removeControl(dir.name);
      }
    });
  }
  /**
   * @description
   * Retrieves the `FormGroup` for a provided `NgModelGroup` directive instance
   *
   * @param dir The `NgModelGroup` directive instance.
   */
  getFormGroup(dir) {
    return this.form.get(dir.path);
  }
  /**
   * Sets the new value for the provided `NgControl` directive.
   *
   * @param dir The `NgControl` directive instance.
   * @param value The new value for the directive's control.
   */
  updateModel(dir, value) {
    resolvedPromise$1.then(() => {
      const ctrl = this.form.get(dir.path);
      ctrl.setValue(value);
    });
  }
  /**
   * @description
   * Sets the value for this `FormGroup`.
   *
   * @param value The new value
   */
  setValue(value) {
    this.control.setValue(value);
  }
  /**
   * @description
   * Method called when the "submit" event is triggered on the form.
   * Triggers the `ngSubmit` emitter to emit the "submit" event as its payload.
   *
   * @param $event The "submit" event object
   */
  onSubmit($event) {
    this.submitted = true;
    syncPendingControls(this.form, this._directives);
    this.ngSubmit.emit($event);
    return false;
  }
  /**
   * @description
   * Method called when the "reset" event is triggered on the form.
   */
  onReset() {
    this.resetForm();
  }
  /**
   * @description
   * Resets the form to an initial value and resets its submitted status.
   *
   * @param value The new value for the form.
   */
  resetForm(value = void 0) {
    this.form.reset(value);
    this.submitted = false;
  }
  _setUpdateStrategy() {
    if (this.options && this.options.updateOn != null) {
      this.form._updateOn = this.options.updateOn;
    }
  }
  _findContainer(path) {
    path.pop();
    return path.length ? this.form.get(path) : this.form;
  }
}
NgForm.ɵfac = __ngDeclareFactory({ minVersion: "12.0.0", version: "13.4.0", ngImport: i0, type: NgForm, deps: [{ token: NG_VALIDATORS, optional: true, self: true }, { token: NG_ASYNC_VALIDATORS, optional: true, self: true }], target: FactoryTarget.Directive });
NgForm.ɵdir = __ngDeclareDirective({ minVersion: "12.0.0", version: "13.4.0", type: NgForm, selector: "form:not([ngNoForm]):not([formGroup]),ng-form,[ngForm]", inputs: { options: ["ngFormOptions", "options"] }, outputs: { ngSubmit: "ngSubmit" }, host: { listeners: { "submit": "onSubmit($event)", "reset": "onReset()" } }, providers: [formDirectiveProvider$1], exportAs: ["ngForm"], usesInheritance: true, ngImport: i0 });
__ngDeclareClassMetadata({ type: NgForm, decorators: [{
  type: Directive,
  args: [{
    selector: "form:not([ngNoForm]):not([formGroup]),ng-form,[ngForm]",
    providers: [formDirectiveProvider$1],
    host: { "(submit)": "onSubmit($event)", "(reset)": "onReset()" },
    outputs: ["ngSubmit"],
    exportAs: "ngForm"
  }]
}], ctorParameters: function() {
  return [{ type: void 0, decorators: [{
    type: Optional
  }, {
    type: Self
  }, {
    type: Inject,
    args: [NG_VALIDATORS]
  }] }, { type: void 0, decorators: [{
    type: Optional
  }, {
    type: Self
  }, {
    type: Inject,
    args: [NG_ASYNC_VALIDATORS]
  }] }];
}, propDecorators: { options: [{
  type: Input,
  args: ["ngFormOptions"]
}] } });
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
class AbstractFormGroupDirective extends ControlContainer {
  /** @nodoc */
  ngOnInit() {
    this._checkParentType();
    this.formDirective.addFormGroup(this);
  }
  /** @nodoc */
  ngOnDestroy() {
    if (this.formDirective) {
      this.formDirective.removeFormGroup(this);
    }
  }
  /**
   * @description
   * The `FormGroup` bound to this directive.
   */
  get control() {
    return this.formDirective.getFormGroup(this);
  }
  /**
   * @description
   * The path to this group from the top-level directive.
   */
  get path() {
    return controlPath(this.name == null ? this.name : this.name.toString(), this._parent);
  }
  /**
   * @description
   * The top-level directive for this group if present, otherwise null.
   */
  get formDirective() {
    return this._parent ? this._parent.formDirective : null;
  }
  /** @internal */
  _checkParentType() {
  }
}
AbstractFormGroupDirective.ɵfac = __ngDeclareFactory({ minVersion: "12.0.0", version: "13.4.0", ngImport: i0, type: AbstractFormGroupDirective, deps: null, target: FactoryTarget.Directive });
AbstractFormGroupDirective.ɵdir = __ngDeclareDirective({ minVersion: "12.0.0", version: "13.4.0", type: AbstractFormGroupDirective, usesInheritance: true, ngImport: i0 });
__ngDeclareClassMetadata({ type: AbstractFormGroupDirective, decorators: [{
  type: Directive
}] });
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
function modelParentException() {
  return new Error(`
    ngModel cannot be used to register form controls with a parent formGroup directive.  Try using
    formGroup's partner directive "formControlName" instead.  Example:

    ${formControlNameExample}

    Or, if you'd like to avoid registering this form control, indicate that it's standalone in ngModelOptions:

    Example:

    ${ngModelWithFormGroupExample}`);
}
function formGroupNameException() {
  return new Error(`
    ngModel cannot be used to register form controls with a parent formGroupName or formArrayName directive.

    Option 1: Use formControlName instead of ngModel (reactive strategy):

    ${formGroupNameExample}

    Option 2:  Update ngModel's parent be ngModelGroup (template-driven strategy):

    ${ngModelGroupExample}`);
}
function missingNameException() {
  return new Error(`If ngModel is used within a form tag, either the name attribute must be set or the form
    control must be defined as 'standalone' in ngModelOptions.

    Example 1: <input [(ngModel)]="person.firstName" name="first">
    Example 2: <input [(ngModel)]="person.firstName" [ngModelOptions]="{standalone: true}">`);
}
function modelGroupParentException() {
  return new Error(`
    ngModelGroup cannot be used with a parent formGroup directive.

    Option 1: Use formGroupName instead of ngModelGroup (reactive strategy):

    ${formGroupNameExample}

    Option 2:  Use a regular form tag instead of the formGroup directive (template-driven strategy):

    ${ngModelGroupExample}`);
}
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
const modelGroupProvider = {
  provide: ControlContainer,
  useExisting: forwardRef(() => NgModelGroup)
};
class NgModelGroup extends AbstractFormGroupDirective {
  constructor(parent, validators, asyncValidators) {
    super();
    this._parent = parent;
    this._setValidators(validators);
    this._setAsyncValidators(asyncValidators);
  }
  /** @internal */
  _checkParentType() {
    if (!(this._parent instanceof NgModelGroup) && !(this._parent instanceof NgForm) && (typeof ngDevMode === "undefined" || ngDevMode)) {
      throw modelGroupParentException();
    }
  }
}
NgModelGroup.ɵfac = __ngDeclareFactory({ minVersion: "12.0.0", version: "13.4.0", ngImport: i0, type: NgModelGroup, deps: [{ token: ControlContainer, host: true, skipSelf: true }, { token: NG_VALIDATORS, optional: true, self: true }, { token: NG_ASYNC_VALIDATORS, optional: true, self: true }], target: FactoryTarget.Directive });
NgModelGroup.ɵdir = __ngDeclareDirective({ minVersion: "12.0.0", version: "13.4.0", type: NgModelGroup, selector: "[ngModelGroup]", inputs: { name: ["ngModelGroup", "name"] }, providers: [modelGroupProvider], exportAs: ["ngModelGroup"], usesInheritance: true, ngImport: i0 });
__ngDeclareClassMetadata({ type: NgModelGroup, decorators: [{
  type: Directive,
  args: [{ selector: "[ngModelGroup]", providers: [modelGroupProvider], exportAs: "ngModelGroup" }]
}], ctorParameters: function() {
  return [{ type: ControlContainer, decorators: [{
    type: Host
  }, {
    type: SkipSelf
  }] }, { type: void 0, decorators: [{
    type: Optional
  }, {
    type: Self
  }, {
    type: Inject,
    args: [NG_VALIDATORS]
  }] }, { type: void 0, decorators: [{
    type: Optional
  }, {
    type: Self
  }, {
    type: Inject,
    args: [NG_ASYNC_VALIDATORS]
  }] }];
}, propDecorators: { name: [{
  type: Input,
  args: ["ngModelGroup"]
}] } });
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
const formControlBinding$1 = {
  provide: NgControl,
  useExisting: forwardRef(() => NgModel)
};
const resolvedPromise = (() => Promise.resolve(null))();
class NgModel extends NgControl {
  constructor(parent, validators, asyncValidators, valueAccessors, _changeDetectorRef) {
    super();
    this._changeDetectorRef = _changeDetectorRef;
    this.control = new FormControl();
    this._registered = false;
    this.update = new EventEmitter();
    this._parent = parent;
    this._setValidators(validators);
    this._setAsyncValidators(asyncValidators);
    this.valueAccessor = selectValueAccessor(this, valueAccessors);
  }
  /** @nodoc */
  ngOnChanges(changes) {
    this._checkForErrors();
    if (!this._registered || "name" in changes) {
      if (this._registered) {
        this._checkName();
        if (this.formDirective) {
          const oldName = changes["name"].previousValue;
          this.formDirective.removeControl({ name: oldName, path: this._getPath(oldName) });
        }
      }
      this._setUpControl();
    }
    if ("isDisabled" in changes) {
      this._updateDisabled(changes);
    }
    if (isPropertyUpdated(changes, this.viewModel)) {
      this._updateValue(this.model);
      this.viewModel = this.model;
    }
  }
  /** @nodoc */
  ngOnDestroy() {
    this.formDirective && this.formDirective.removeControl(this);
  }
  /**
   * @description
   * Returns an array that represents the path from the top-level form to this control.
   * Each index is the string name of the control on that level.
   */
  get path() {
    return this._getPath(this.name);
  }
  /**
   * @description
   * The top-level directive for this control if present, otherwise null.
   */
  get formDirective() {
    return this._parent ? this._parent.formDirective : null;
  }
  /**
   * @description
   * Sets the new value for the view model and emits an `ngModelChange` event.
   *
   * @param newValue The new value emitted by `ngModelChange`.
   */
  viewToModelUpdate(newValue) {
    this.viewModel = newValue;
    this.update.emit(newValue);
  }
  _setUpControl() {
    this._setUpdateStrategy();
    this._isStandalone() ? this._setUpStandalone() : this.formDirective.addControl(this);
    this._registered = true;
  }
  _setUpdateStrategy() {
    if (this.options && this.options.updateOn != null) {
      this.control._updateOn = this.options.updateOn;
    }
  }
  _isStandalone() {
    return !this._parent || !!(this.options && this.options.standalone);
  }
  _setUpStandalone() {
    setUpControl(this.control, this);
    this.control.updateValueAndValidity({ emitEvent: false });
  }
  _checkForErrors() {
    if (!this._isStandalone()) {
      this._checkParentType();
    }
    this._checkName();
  }
  _checkParentType() {
    if (typeof ngDevMode === "undefined" || ngDevMode) {
      if (!(this._parent instanceof NgModelGroup) && this._parent instanceof AbstractFormGroupDirective) {
        throw formGroupNameException();
      } else if (!(this._parent instanceof NgModelGroup) && !(this._parent instanceof NgForm)) {
        throw modelParentException();
      }
    }
  }
  _checkName() {
    if (this.options && this.options.name)
      this.name = this.options.name;
    if (!this._isStandalone() && !this.name && (typeof ngDevMode === "undefined" || ngDevMode)) {
      throw missingNameException();
    }
  }
  _updateValue(value) {
    resolvedPromise.then(() => {
      this.control.setValue(value, { emitViewToModelChange: false });
      this._changeDetectorRef?.markForCheck();
    });
  }
  _updateDisabled(changes) {
    const disabledValue = changes["isDisabled"].currentValue;
    const isDisabled = disabledValue === "" || disabledValue && disabledValue !== "false";
    resolvedPromise.then(() => {
      if (isDisabled && !this.control.disabled) {
        this.control.disable();
      } else if (!isDisabled && this.control.disabled) {
        this.control.enable();
      }
      this._changeDetectorRef?.markForCheck();
    });
  }
  _getPath(controlName) {
    return this._parent ? controlPath(controlName, this._parent) : [controlName];
  }
}
NgModel.ɵfac = __ngDeclareFactory({ minVersion: "12.0.0", version: "13.4.0", ngImport: i0, type: NgModel, deps: [{ token: ControlContainer, host: true, optional: true }, { token: NG_VALIDATORS, optional: true, self: true }, { token: NG_ASYNC_VALIDATORS, optional: true, self: true }, { token: NG_VALUE_ACCESSOR, optional: true, self: true }, { token: ChangeDetectorRef, optional: true }], target: FactoryTarget.Directive });
NgModel.ɵdir = __ngDeclareDirective({ minVersion: "12.0.0", version: "13.4.0", type: NgModel, selector: "[ngModel]:not([formControlName]):not([formControl])", inputs: { name: "name", isDisabled: ["disabled", "isDisabled"], model: ["ngModel", "model"], options: ["ngModelOptions", "options"] }, outputs: { update: "ngModelChange" }, providers: [formControlBinding$1], exportAs: ["ngModel"], usesInheritance: true, usesOnChanges: true, ngImport: i0 });
__ngDeclareClassMetadata({ type: NgModel, decorators: [{
  type: Directive,
  args: [{
    selector: "[ngModel]:not([formControlName]):not([formControl])",
    providers: [formControlBinding$1],
    exportAs: "ngModel"
  }]
}], ctorParameters: function() {
  return [{ type: ControlContainer, decorators: [{
    type: Optional
  }, {
    type: Host
  }] }, { type: void 0, decorators: [{
    type: Optional
  }, {
    type: Self
  }, {
    type: Inject,
    args: [NG_VALIDATORS]
  }] }, { type: void 0, decorators: [{
    type: Optional
  }, {
    type: Self
  }, {
    type: Inject,
    args: [NG_ASYNC_VALIDATORS]
  }] }, { type: void 0, decorators: [{
    type: Optional
  }, {
    type: Self
  }, {
    type: Inject,
    args: [NG_VALUE_ACCESSOR]
  }] }, { type: ChangeDetectorRef, decorators: [{
    type: Optional
  }, {
    type: Inject,
    args: [ChangeDetectorRef]
  }] }];
}, propDecorators: { name: [{
  type: Input
}], isDisabled: [{
  type: Input,
  args: ["disabled"]
}], model: [{
  type: Input,
  args: ["ngModel"]
}], options: [{
  type: Input,
  args: ["ngModelOptions"]
}], update: [{
  type: Output,
  args: ["ngModelChange"]
}] } });
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
class ɵNgNoValidate {
}
ɵNgNoValidate.ɵfac = __ngDeclareFactory({ minVersion: "12.0.0", version: "13.4.0", ngImport: i0, type: ɵNgNoValidate, deps: [], target: FactoryTarget.Directive });
ɵNgNoValidate.ɵdir = __ngDeclareDirective({ minVersion: "12.0.0", version: "13.4.0", type: ɵNgNoValidate, selector: "form:not([ngNoForm]):not([ngNativeValidate])", host: { attributes: { "novalidate": "" } }, ngImport: i0 });
__ngDeclareClassMetadata({ type: ɵNgNoValidate, decorators: [{
  type: Directive,
  args: [{
    selector: "form:not([ngNoForm]):not([ngNativeValidate])",
    host: { "novalidate": "" }
  }]
}] });
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
const NUMBER_VALUE_ACCESSOR = {
  provide: NG_VALUE_ACCESSOR,
  useExisting: forwardRef(() => NumberValueAccessor),
  multi: true
};
class NumberValueAccessor extends BuiltInControlValueAccessor {
  /**
   * Sets the "value" property on the input element.
   * @nodoc
   */
  writeValue(value) {
    const normalizedValue = value == null ? "" : value;
    this.setProperty("value", normalizedValue);
  }
  /**
   * Registers a function called when the control value changes.
   * @nodoc
   */
  registerOnChange(fn2) {
    this.onChange = (value) => {
      fn2(value == "" ? null : parseFloat(value));
    };
  }
}
NumberValueAccessor.ɵfac = __ngDeclareFactory({ minVersion: "12.0.0", version: "13.4.0", ngImport: i0, type: NumberValueAccessor, deps: null, target: FactoryTarget.Directive });
NumberValueAccessor.ɵdir = __ngDeclareDirective({ minVersion: "12.0.0", version: "13.4.0", type: NumberValueAccessor, selector: "input[type=number][formControlName],input[type=number][formControl],input[type=number][ngModel]", host: { listeners: { "input": "onChange($event.target.value)", "blur": "onTouched()" } }, providers: [NUMBER_VALUE_ACCESSOR], usesInheritance: true, ngImport: i0 });
__ngDeclareClassMetadata({ type: NumberValueAccessor, decorators: [{
  type: Directive,
  args: [{
    selector: "input[type=number][formControlName],input[type=number][formControl],input[type=number][ngModel]",
    host: { "(input)": "onChange($event.target.value)", "(blur)": "onTouched()" },
    providers: [NUMBER_VALUE_ACCESSOR]
  }]
}] });
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
const RADIO_VALUE_ACCESSOR = {
  provide: NG_VALUE_ACCESSOR,
  useExisting: forwardRef(() => RadioControlValueAccessor),
  multi: true
};
function throwNameError() {
  throw new Error(`
      If you define both a name and a formControlName attribute on your radio button, their values
      must match. Ex: <input type="radio" formControlName="food" name="food">
    `);
}
class RadioControlRegistryModule {
}
RadioControlRegistryModule.ɵfac = __ngDeclareFactory({ minVersion: "12.0.0", version: "13.4.0", ngImport: i0, type: RadioControlRegistryModule, deps: [], target: FactoryTarget.NgModule });
RadioControlRegistryModule.ɵmod = __ngDeclareNgModule({ minVersion: "12.0.0", version: "13.4.0", ngImport: i0, type: RadioControlRegistryModule });
RadioControlRegistryModule.ɵinj = __ngDeclareInjector({ minVersion: "12.0.0", version: "13.4.0", ngImport: i0, type: RadioControlRegistryModule });
__ngDeclareClassMetadata({ type: RadioControlRegistryModule, decorators: [{
  type: NgModule
}] });
class RadioControlRegistry {
  constructor() {
    this._accessors = [];
  }
  /**
   * @description
   * Adds a control to the internal registry. For internal use only.
   */
  add(control, accessor) {
    this._accessors.push([control, accessor]);
  }
  /**
   * @description
   * Removes a control from the internal registry. For internal use only.
   */
  remove(accessor) {
    for (let i = this._accessors.length - 1; i >= 0; --i) {
      if (this._accessors[i][1] === accessor) {
        this._accessors.splice(i, 1);
        return;
      }
    }
  }
  /**
   * @description
   * Selects a radio button. For internal use only.
   */
  select(accessor) {
    this._accessors.forEach((c) => {
      if (this._isSameGroup(c, accessor) && c[1] !== accessor) {
        c[1].fireUncheck(accessor.value);
      }
    });
  }
  _isSameGroup(controlPair, accessor) {
    if (!controlPair[0].control)
      return false;
    return controlPair[0]._parent === accessor._control._parent && controlPair[1].name === accessor.name;
  }
}
RadioControlRegistry.ɵfac = __ngDeclareFactory({ minVersion: "12.0.0", version: "13.4.0", ngImport: i0, type: RadioControlRegistry, deps: [], target: FactoryTarget.Injectable });
RadioControlRegistry.ɵprov = __ngDeclareInjectable({ minVersion: "12.0.0", version: "13.4.0", ngImport: i0, type: RadioControlRegistry, providedIn: RadioControlRegistryModule });
__ngDeclareClassMetadata({ type: RadioControlRegistry, decorators: [{
  type: Injectable,
  args: [{ providedIn: RadioControlRegistryModule }]
}] });
class RadioControlValueAccessor extends BuiltInControlValueAccessor {
  constructor(renderer, elementRef, _registry, _injector) {
    super(renderer, elementRef);
    this._registry = _registry;
    this._injector = _injector;
    this.onChange = () => {
    };
  }
  /** @nodoc */
  ngOnInit() {
    this._control = this._injector.get(NgControl);
    this._checkName();
    this._registry.add(this._control, this);
  }
  /** @nodoc */
  ngOnDestroy() {
    this._registry.remove(this);
  }
  /**
   * Sets the "checked" property value on the radio input element.
   * @nodoc
   */
  writeValue(value) {
    this._state = value === this.value;
    this.setProperty("checked", this._state);
  }
  /**
   * Registers a function called when the control value changes.
   * @nodoc
   */
  registerOnChange(fn2) {
    this._fn = fn2;
    this.onChange = () => {
      fn2(this.value);
      this._registry.select(this);
    };
  }
  /**
   * Sets the "value" on the radio input element and unchecks it.
   *
   * @param value
   */
  fireUncheck(value) {
    this.writeValue(value);
  }
  _checkName() {
    if (this.name && this.formControlName && this.name !== this.formControlName && (typeof ngDevMode === "undefined" || ngDevMode)) {
      throwNameError();
    }
    if (!this.name && this.formControlName)
      this.name = this.formControlName;
  }
}
RadioControlValueAccessor.ɵfac = __ngDeclareFactory({ minVersion: "12.0.0", version: "13.4.0", ngImport: i0, type: RadioControlValueAccessor, deps: [{ token: Renderer2 }, { token: ElementRef }, { token: RadioControlRegistry }, { token: Injector }], target: FactoryTarget.Directive });
RadioControlValueAccessor.ɵdir = __ngDeclareDirective({ minVersion: "12.0.0", version: "13.4.0", type: RadioControlValueAccessor, selector: "input[type=radio][formControlName],input[type=radio][formControl],input[type=radio][ngModel]", inputs: { name: "name", formControlName: "formControlName", value: "value" }, host: { listeners: { "change": "onChange()", "blur": "onTouched()" } }, providers: [RADIO_VALUE_ACCESSOR], usesInheritance: true, ngImport: i0 });
__ngDeclareClassMetadata({ type: RadioControlValueAccessor, decorators: [{
  type: Directive,
  args: [{
    selector: "input[type=radio][formControlName],input[type=radio][formControl],input[type=radio][ngModel]",
    host: { "(change)": "onChange()", "(blur)": "onTouched()" },
    providers: [RADIO_VALUE_ACCESSOR]
  }]
}], ctorParameters: function() {
  return [{ type: Renderer2 }, { type: ElementRef }, { type: RadioControlRegistry }, { type: Injector }];
}, propDecorators: { name: [{
  type: Input
}], formControlName: [{
  type: Input
}], value: [{
  type: Input
}] } });
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
const RANGE_VALUE_ACCESSOR = {
  provide: NG_VALUE_ACCESSOR,
  useExisting: forwardRef(() => RangeValueAccessor),
  multi: true
};
class RangeValueAccessor extends BuiltInControlValueAccessor {
  /**
   * Sets the "value" property on the input element.
   * @nodoc
   */
  writeValue(value) {
    this.setProperty("value", parseFloat(value));
  }
  /**
   * Registers a function called when the control value changes.
   * @nodoc
   */
  registerOnChange(fn2) {
    this.onChange = (value) => {
      fn2(value == "" ? null : parseFloat(value));
    };
  }
}
RangeValueAccessor.ɵfac = __ngDeclareFactory({ minVersion: "12.0.0", version: "13.4.0", ngImport: i0, type: RangeValueAccessor, deps: null, target: FactoryTarget.Directive });
RangeValueAccessor.ɵdir = __ngDeclareDirective({ minVersion: "12.0.0", version: "13.4.0", type: RangeValueAccessor, selector: "input[type=range][formControlName],input[type=range][formControl],input[type=range][ngModel]", host: { listeners: { "change": "onChange($event.target.value)", "input": "onChange($event.target.value)", "blur": "onTouched()" } }, providers: [RANGE_VALUE_ACCESSOR], usesInheritance: true, ngImport: i0 });
__ngDeclareClassMetadata({ type: RangeValueAccessor, decorators: [{
  type: Directive,
  args: [{
    selector: "input[type=range][formControlName],input[type=range][formControl],input[type=range][ngModel]",
    host: {
      "(change)": "onChange($event.target.value)",
      "(input)": "onChange($event.target.value)",
      "(blur)": "onTouched()"
    },
    providers: [RANGE_VALUE_ACCESSOR]
  }]
}] });
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
const NG_MODEL_WITH_FORM_CONTROL_WARNING = new InjectionToken("NgModelWithFormControlWarning");
const formControlBinding = {
  provide: NgControl,
  useExisting: forwardRef(() => FormControlDirective)
};
class FormControlDirective extends NgControl {
  constructor(validators, asyncValidators, valueAccessors, _ngModelWarningConfig) {
    super();
    this._ngModelWarningConfig = _ngModelWarningConfig;
    this.update = new EventEmitter();
    this._ngModelWarningSent = false;
    this._setValidators(validators);
    this._setAsyncValidators(asyncValidators);
    this.valueAccessor = selectValueAccessor(this, valueAccessors);
  }
  /**
   * @description
   * Triggers a warning in dev mode that this input should not be used with reactive forms.
   */
  set isDisabled(isDisabled) {
    if (typeof ngDevMode === "undefined" || ngDevMode) {
      console.warn(disabledAttrWarning);
    }
  }
  /** @nodoc */
  ngOnChanges(changes) {
    if (this._isControlChanged(changes)) {
      const previousForm = changes["form"].previousValue;
      if (previousForm) {
        cleanUpControl(
          previousForm,
          this,
          /* validateControlPresenceOnChange */
          false
        );
      }
      setUpControl(this.form, this);
      if (this.control.disabled && this.valueAccessor.setDisabledState) {
        this.valueAccessor.setDisabledState(true);
      }
      this.form.updateValueAndValidity({ emitEvent: false });
    }
    if (isPropertyUpdated(changes, this.viewModel)) {
      if (typeof ngDevMode === "undefined" || ngDevMode) {
        _ngModelWarning("formControl", FormControlDirective, this, this._ngModelWarningConfig);
      }
      this.form.setValue(this.model);
      this.viewModel = this.model;
    }
  }
  /** @nodoc */
  ngOnDestroy() {
    if (this.form) {
      cleanUpControl(
        this.form,
        this,
        /* validateControlPresenceOnChange */
        false
      );
    }
  }
  /**
   * @description
   * Returns an array that represents the path from the top-level form to this control.
   * Each index is the string name of the control on that level.
   */
  get path() {
    return [];
  }
  /**
   * @description
   * The `FormControl` bound to this directive.
   */
  get control() {
    return this.form;
  }
  /**
   * @description
   * Sets the new value for the view model and emits an `ngModelChange` event.
   *
   * @param newValue The new value for the view model.
   */
  viewToModelUpdate(newValue) {
    this.viewModel = newValue;
    this.update.emit(newValue);
  }
  _isControlChanged(changes) {
    return changes.hasOwnProperty("form");
  }
}
FormControlDirective._ngModelWarningSentOnce = false;
FormControlDirective.ɵfac = __ngDeclareFactory({ minVersion: "12.0.0", version: "13.4.0", ngImport: i0, type: FormControlDirective, deps: [{ token: NG_VALIDATORS, optional: true, self: true }, { token: NG_ASYNC_VALIDATORS, optional: true, self: true }, { token: NG_VALUE_ACCESSOR, optional: true, self: true }, { token: NG_MODEL_WITH_FORM_CONTROL_WARNING, optional: true }], target: FactoryTarget.Directive });
FormControlDirective.ɵdir = __ngDeclareDirective({ minVersion: "12.0.0", version: "13.4.0", type: FormControlDirective, selector: "[formControl]", inputs: { form: ["formControl", "form"], isDisabled: ["disabled", "isDisabled"], model: ["ngModel", "model"] }, outputs: { update: "ngModelChange" }, providers: [formControlBinding], exportAs: ["ngForm"], usesInheritance: true, usesOnChanges: true, ngImport: i0 });
__ngDeclareClassMetadata({ type: FormControlDirective, decorators: [{
  type: Directive,
  args: [{ selector: "[formControl]", providers: [formControlBinding], exportAs: "ngForm" }]
}], ctorParameters: function() {
  return [{ type: void 0, decorators: [{
    type: Optional
  }, {
    type: Self
  }, {
    type: Inject,
    args: [NG_VALIDATORS]
  }] }, { type: void 0, decorators: [{
    type: Optional
  }, {
    type: Self
  }, {
    type: Inject,
    args: [NG_ASYNC_VALIDATORS]
  }] }, { type: void 0, decorators: [{
    type: Optional
  }, {
    type: Self
  }, {
    type: Inject,
    args: [NG_VALUE_ACCESSOR]
  }] }, { type: void 0, decorators: [{
    type: Optional
  }, {
    type: Inject,
    args: [NG_MODEL_WITH_FORM_CONTROL_WARNING]
  }] }];
}, propDecorators: { form: [{
  type: Input,
  args: ["formControl"]
}], isDisabled: [{
  type: Input,
  args: ["disabled"]
}], model: [{
  type: Input,
  args: ["ngModel"]
}], update: [{
  type: Output,
  args: ["ngModelChange"]
}] } });
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
const formDirectiveProvider = {
  provide: ControlContainer,
  useExisting: forwardRef(() => FormGroupDirective)
};
class FormGroupDirective extends ControlContainer {
  constructor(validators, asyncValidators) {
    super();
    this.validators = validators;
    this.asyncValidators = asyncValidators;
    this.submitted = false;
    this._onCollectionChange = () => this._updateDomValue();
    this.directives = [];
    this.form = null;
    this.ngSubmit = new EventEmitter();
    this._setValidators(validators);
    this._setAsyncValidators(asyncValidators);
  }
  /** @nodoc */
  ngOnChanges(changes) {
    this._checkFormPresent();
    if (changes.hasOwnProperty("form")) {
      this._updateValidators();
      this._updateDomValue();
      this._updateRegistrations();
      this._oldForm = this.form;
    }
  }
  /** @nodoc */
  ngOnDestroy() {
    if (this.form) {
      cleanUpValidators(this.form, this);
      if (this.form._onCollectionChange === this._onCollectionChange) {
        this.form._registerOnCollectionChange(() => {
        });
      }
    }
  }
  /**
   * @description
   * Returns this directive's instance.
   */
  get formDirective() {
    return this;
  }
  /**
   * @description
   * Returns the `FormGroup` bound to this directive.
   */
  get control() {
    return this.form;
  }
  /**
   * @description
   * Returns an array representing the path to this group. Because this directive
   * always lives at the top level of a form, it always an empty array.
   */
  get path() {
    return [];
  }
  /**
   * @description
   * Method that sets up the control directive in this group, re-calculates its value
   * and validity, and adds the instance to the internal list of directives.
   *
   * @param dir The `FormControlName` directive instance.
   */
  addControl(dir) {
    const ctrl = this.form.get(dir.path);
    setUpControl(ctrl, dir);
    ctrl.updateValueAndValidity({ emitEvent: false });
    this.directives.push(dir);
    return ctrl;
  }
  /**
   * @description
   * Retrieves the `FormControl` instance from the provided `FormControlName` directive
   *
   * @param dir The `FormControlName` directive instance.
   */
  getControl(dir) {
    return this.form.get(dir.path);
  }
  /**
   * @description
   * Removes the `FormControlName` instance from the internal list of directives
   *
   * @param dir The `FormControlName` directive instance.
   */
  removeControl(dir) {
    cleanUpControl(
      dir.control || null,
      dir,
      /* validateControlPresenceOnChange */
      false
    );
    removeListItem(this.directives, dir);
  }
  /**
   * Adds a new `FormGroupName` directive instance to the form.
   *
   * @param dir The `FormGroupName` directive instance.
   */
  addFormGroup(dir) {
    this._setUpFormContainer(dir);
  }
  /**
   * Performs the necessary cleanup when a `FormGroupName` directive instance is removed from the
   * view.
   *
   * @param dir The `FormGroupName` directive instance.
   */
  removeFormGroup(dir) {
    this._cleanUpFormContainer(dir);
  }
  /**
   * @description
   * Retrieves the `FormGroup` for a provided `FormGroupName` directive instance
   *
   * @param dir The `FormGroupName` directive instance.
   */
  getFormGroup(dir) {
    return this.form.get(dir.path);
  }
  /**
   * Performs the necessary setup when a `FormArrayName` directive instance is added to the view.
   *
   * @param dir The `FormArrayName` directive instance.
   */
  addFormArray(dir) {
    this._setUpFormContainer(dir);
  }
  /**
   * Performs the necessary cleanup when a `FormArrayName` directive instance is removed from the
   * view.
   *
   * @param dir The `FormArrayName` directive instance.
   */
  removeFormArray(dir) {
    this._cleanUpFormContainer(dir);
  }
  /**
   * @description
   * Retrieves the `FormArray` for a provided `FormArrayName` directive instance.
   *
   * @param dir The `FormArrayName` directive instance.
   */
  getFormArray(dir) {
    return this.form.get(dir.path);
  }
  /**
   * Sets the new value for the provided `FormControlName` directive.
   *
   * @param dir The `FormControlName` directive instance.
   * @param value The new value for the directive's control.
   */
  updateModel(dir, value) {
    const ctrl = this.form.get(dir.path);
    ctrl.setValue(value);
  }
  /**
   * @description
   * Method called with the "submit" event is triggered on the form.
   * Triggers the `ngSubmit` emitter to emit the "submit" event as its payload.
   *
   * @param $event The "submit" event object
   */
  onSubmit($event) {
    this.submitted = true;
    syncPendingControls(this.form, this.directives);
    this.ngSubmit.emit($event);
    return false;
  }
  /**
   * @description
   * Method called when the "reset" event is triggered on the form.
   */
  onReset() {
    this.resetForm();
  }
  /**
   * @description
   * Resets the form to an initial value and resets its submitted status.
   *
   * @param value The new value for the form.
   */
  resetForm(value = void 0) {
    this.form.reset(value);
    this.submitted = false;
  }
  /** @internal */
  _updateDomValue() {
    this.directives.forEach((dir) => {
      const oldCtrl = dir.control;
      const newCtrl = this.form.get(dir.path);
      if (oldCtrl !== newCtrl) {
        cleanUpControl(oldCtrl || null, dir);
        if (isFormControl(newCtrl)) {
          setUpControl(newCtrl, dir);
          dir.control = newCtrl;
        }
      }
    });
    this.form._updateTreeValidity({ emitEvent: false });
  }
  _setUpFormContainer(dir) {
    const ctrl = this.form.get(dir.path);
    setUpFormContainer(ctrl, dir);
    ctrl.updateValueAndValidity({ emitEvent: false });
  }
  _cleanUpFormContainer(dir) {
    if (this.form) {
      const ctrl = this.form.get(dir.path);
      if (ctrl) {
        const isControlUpdated = cleanUpFormContainer(ctrl, dir);
        if (isControlUpdated) {
          ctrl.updateValueAndValidity({ emitEvent: false });
        }
      }
    }
  }
  _updateRegistrations() {
    this.form._registerOnCollectionChange(this._onCollectionChange);
    if (this._oldForm) {
      this._oldForm._registerOnCollectionChange(() => {
      });
    }
  }
  _updateValidators() {
    setUpValidators(this.form, this);
    if (this._oldForm) {
      cleanUpValidators(this._oldForm, this);
    }
  }
  _checkFormPresent() {
    if (!this.form && (typeof ngDevMode === "undefined" || ngDevMode)) {
      throw missingFormException();
    }
  }
}
FormGroupDirective.ɵfac = __ngDeclareFactory({ minVersion: "12.0.0", version: "13.4.0", ngImport: i0, type: FormGroupDirective, deps: [{ token: NG_VALIDATORS, optional: true, self: true }, { token: NG_ASYNC_VALIDATORS, optional: true, self: true }], target: FactoryTarget.Directive });
FormGroupDirective.ɵdir = __ngDeclareDirective({ minVersion: "12.0.0", version: "13.4.0", type: FormGroupDirective, selector: "[formGroup]", inputs: { form: ["formGroup", "form"] }, outputs: { ngSubmit: "ngSubmit" }, host: { listeners: { "submit": "onSubmit($event)", "reset": "onReset()" } }, providers: [formDirectiveProvider], exportAs: ["ngForm"], usesInheritance: true, usesOnChanges: true, ngImport: i0 });
__ngDeclareClassMetadata({ type: FormGroupDirective, decorators: [{
  type: Directive,
  args: [{
    selector: "[formGroup]",
    providers: [formDirectiveProvider],
    host: { "(submit)": "onSubmit($event)", "(reset)": "onReset()" },
    exportAs: "ngForm"
  }]
}], ctorParameters: function() {
  return [{ type: void 0, decorators: [{
    type: Optional
  }, {
    type: Self
  }, {
    type: Inject,
    args: [NG_VALIDATORS]
  }] }, { type: void 0, decorators: [{
    type: Optional
  }, {
    type: Self
  }, {
    type: Inject,
    args: [NG_ASYNC_VALIDATORS]
  }] }];
}, propDecorators: { form: [{
  type: Input,
  args: ["formGroup"]
}], ngSubmit: [{
  type: Output
}] } });
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
const formGroupNameProvider = {
  provide: ControlContainer,
  useExisting: forwardRef(() => FormGroupName)
};
class FormGroupName extends AbstractFormGroupDirective {
  constructor(parent, validators, asyncValidators) {
    super();
    this._parent = parent;
    this._setValidators(validators);
    this._setAsyncValidators(asyncValidators);
  }
  /** @internal */
  _checkParentType() {
    if (_hasInvalidParent(this._parent) && (typeof ngDevMode === "undefined" || ngDevMode)) {
      throw groupParentException();
    }
  }
}
FormGroupName.ɵfac = __ngDeclareFactory({ minVersion: "12.0.0", version: "13.4.0", ngImport: i0, type: FormGroupName, deps: [{ token: ControlContainer, host: true, optional: true, skipSelf: true }, { token: NG_VALIDATORS, optional: true, self: true }, { token: NG_ASYNC_VALIDATORS, optional: true, self: true }], target: FactoryTarget.Directive });
FormGroupName.ɵdir = __ngDeclareDirective({ minVersion: "12.0.0", version: "13.4.0", type: FormGroupName, selector: "[formGroupName]", inputs: { name: ["formGroupName", "name"] }, providers: [formGroupNameProvider], usesInheritance: true, ngImport: i0 });
__ngDeclareClassMetadata({ type: FormGroupName, decorators: [{
  type: Directive,
  args: [{ selector: "[formGroupName]", providers: [formGroupNameProvider] }]
}], ctorParameters: function() {
  return [{ type: ControlContainer, decorators: [{
    type: Optional
  }, {
    type: Host
  }, {
    type: SkipSelf
  }] }, { type: void 0, decorators: [{
    type: Optional
  }, {
    type: Self
  }, {
    type: Inject,
    args: [NG_VALIDATORS]
  }] }, { type: void 0, decorators: [{
    type: Optional
  }, {
    type: Self
  }, {
    type: Inject,
    args: [NG_ASYNC_VALIDATORS]
  }] }];
}, propDecorators: { name: [{
  type: Input,
  args: ["formGroupName"]
}] } });
const formArrayNameProvider = {
  provide: ControlContainer,
  useExisting: forwardRef(() => FormArrayName)
};
class FormArrayName extends ControlContainer {
  constructor(parent, validators, asyncValidators) {
    super();
    this._parent = parent;
    this._setValidators(validators);
    this._setAsyncValidators(asyncValidators);
  }
  /**
   * A lifecycle method called when the directive's inputs are initialized. For internal use only.
   * @throws If the directive does not have a valid parent.
   * @nodoc
   */
  ngOnInit() {
    this._checkParentType();
    this.formDirective.addFormArray(this);
  }
  /**
   * A lifecycle method called before the directive's instance is destroyed. For internal use only.
   * @nodoc
   */
  ngOnDestroy() {
    if (this.formDirective) {
      this.formDirective.removeFormArray(this);
    }
  }
  /**
   * @description
   * The `FormArray` bound to this directive.
   */
  get control() {
    return this.formDirective.getFormArray(this);
  }
  /**
   * @description
   * The top-level directive for this group if present, otherwise null.
   */
  get formDirective() {
    return this._parent ? this._parent.formDirective : null;
  }
  /**
   * @description
   * Returns an array that represents the path from the top-level form to this control.
   * Each index is the string name of the control on that level.
   */
  get path() {
    return controlPath(this.name == null ? this.name : this.name.toString(), this._parent);
  }
  _checkParentType() {
    if (_hasInvalidParent(this._parent) && (typeof ngDevMode === "undefined" || ngDevMode)) {
      throw arrayParentException();
    }
  }
}
FormArrayName.ɵfac = __ngDeclareFactory({ minVersion: "12.0.0", version: "13.4.0", ngImport: i0, type: FormArrayName, deps: [{ token: ControlContainer, host: true, optional: true, skipSelf: true }, { token: NG_VALIDATORS, optional: true, self: true }, { token: NG_ASYNC_VALIDATORS, optional: true, self: true }], target: FactoryTarget.Directive });
FormArrayName.ɵdir = __ngDeclareDirective({ minVersion: "12.0.0", version: "13.4.0", type: FormArrayName, selector: "[formArrayName]", inputs: { name: ["formArrayName", "name"] }, providers: [formArrayNameProvider], usesInheritance: true, ngImport: i0 });
__ngDeclareClassMetadata({ type: FormArrayName, decorators: [{
  type: Directive,
  args: [{ selector: "[formArrayName]", providers: [formArrayNameProvider] }]
}], ctorParameters: function() {
  return [{ type: ControlContainer, decorators: [{
    type: Optional
  }, {
    type: Host
  }, {
    type: SkipSelf
  }] }, { type: void 0, decorators: [{
    type: Optional
  }, {
    type: Self
  }, {
    type: Inject,
    args: [NG_VALIDATORS]
  }] }, { type: void 0, decorators: [{
    type: Optional
  }, {
    type: Self
  }, {
    type: Inject,
    args: [NG_ASYNC_VALIDATORS]
  }] }];
}, propDecorators: { name: [{
  type: Input,
  args: ["formArrayName"]
}] } });
function _hasInvalidParent(parent) {
  return !(parent instanceof FormGroupName) && !(parent instanceof FormGroupDirective) && !(parent instanceof FormArrayName);
}
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
const controlNameBinding = {
  provide: NgControl,
  useExisting: forwardRef(() => FormControlName)
};
class FormControlName extends NgControl {
  constructor(parent, validators, asyncValidators, valueAccessors, _ngModelWarningConfig) {
    super();
    this._ngModelWarningConfig = _ngModelWarningConfig;
    this._added = false;
    this.update = new EventEmitter();
    this._ngModelWarningSent = false;
    this._parent = parent;
    this._setValidators(validators);
    this._setAsyncValidators(asyncValidators);
    this.valueAccessor = selectValueAccessor(this, valueAccessors);
  }
  /**
   * @description
   * Triggers a warning in dev mode that this input should not be used with reactive forms.
   */
  set isDisabled(isDisabled) {
    if (typeof ngDevMode === "undefined" || ngDevMode) {
      console.warn(disabledAttrWarning);
    }
  }
  /** @nodoc */
  ngOnChanges(changes) {
    if (!this._added)
      this._setUpControl();
    if (isPropertyUpdated(changes, this.viewModel)) {
      if (typeof ngDevMode === "undefined" || ngDevMode) {
        _ngModelWarning("formControlName", FormControlName, this, this._ngModelWarningConfig);
      }
      this.viewModel = this.model;
      this.formDirective.updateModel(this, this.model);
    }
  }
  /** @nodoc */
  ngOnDestroy() {
    if (this.formDirective) {
      this.formDirective.removeControl(this);
    }
  }
  /**
   * @description
   * Sets the new value for the view model and emits an `ngModelChange` event.
   *
   * @param newValue The new value for the view model.
   */
  viewToModelUpdate(newValue) {
    this.viewModel = newValue;
    this.update.emit(newValue);
  }
  /**
   * @description
   * Returns an array that represents the path from the top-level form to this control.
   * Each index is the string name of the control on that level.
   */
  get path() {
    return controlPath(this.name == null ? this.name : this.name.toString(), this._parent);
  }
  /**
   * @description
   * The top-level directive for this group if present, otherwise null.
   */
  get formDirective() {
    return this._parent ? this._parent.formDirective : null;
  }
  _checkParentType() {
    if (typeof ngDevMode === "undefined" || ngDevMode) {
      if (!(this._parent instanceof FormGroupName) && this._parent instanceof AbstractFormGroupDirective) {
        throw ngModelGroupException();
      } else if (!(this._parent instanceof FormGroupName) && !(this._parent instanceof FormGroupDirective) && !(this._parent instanceof FormArrayName)) {
        throw controlParentException();
      }
    }
  }
  _setUpControl() {
    this._checkParentType();
    this.control = this.formDirective.addControl(this);
    if (this.control.disabled && this.valueAccessor.setDisabledState) {
      this.valueAccessor.setDisabledState(true);
    }
    this._added = true;
  }
}
FormControlName._ngModelWarningSentOnce = false;
FormControlName.ɵfac = __ngDeclareFactory({ minVersion: "12.0.0", version: "13.4.0", ngImport: i0, type: FormControlName, deps: [{ token: ControlContainer, host: true, optional: true, skipSelf: true }, { token: NG_VALIDATORS, optional: true, self: true }, { token: NG_ASYNC_VALIDATORS, optional: true, self: true }, { token: NG_VALUE_ACCESSOR, optional: true, self: true }, { token: NG_MODEL_WITH_FORM_CONTROL_WARNING, optional: true }], target: FactoryTarget.Directive });
FormControlName.ɵdir = __ngDeclareDirective({ minVersion: "12.0.0", version: "13.4.0", type: FormControlName, selector: "[formControlName]", inputs: { name: ["formControlName", "name"], isDisabled: ["disabled", "isDisabled"], model: ["ngModel", "model"] }, outputs: { update: "ngModelChange" }, providers: [controlNameBinding], usesInheritance: true, usesOnChanges: true, ngImport: i0 });
__ngDeclareClassMetadata({ type: FormControlName, decorators: [{
  type: Directive,
  args: [{ selector: "[formControlName]", providers: [controlNameBinding] }]
}], ctorParameters: function() {
  return [{ type: ControlContainer, decorators: [{
    type: Optional
  }, {
    type: Host
  }, {
    type: SkipSelf
  }] }, { type: void 0, decorators: [{
    type: Optional
  }, {
    type: Self
  }, {
    type: Inject,
    args: [NG_VALIDATORS]
  }] }, { type: void 0, decorators: [{
    type: Optional
  }, {
    type: Self
  }, {
    type: Inject,
    args: [NG_ASYNC_VALIDATORS]
  }] }, { type: void 0, decorators: [{
    type: Optional
  }, {
    type: Self
  }, {
    type: Inject,
    args: [NG_VALUE_ACCESSOR]
  }] }, { type: void 0, decorators: [{
    type: Optional
  }, {
    type: Inject,
    args: [NG_MODEL_WITH_FORM_CONTROL_WARNING]
  }] }];
}, propDecorators: { name: [{
  type: Input,
  args: ["formControlName"]
}], isDisabled: [{
  type: Input,
  args: ["disabled"]
}], model: [{
  type: Input,
  args: ["ngModel"]
}], update: [{
  type: Output,
  args: ["ngModelChange"]
}] } });
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
const SELECT_VALUE_ACCESSOR = {
  provide: NG_VALUE_ACCESSOR,
  useExisting: forwardRef(() => SelectControlValueAccessor),
  multi: true
};
function _buildValueString$1(id, value) {
  if (id == null)
    return `${value}`;
  if (value && typeof value === "object")
    value = "Object";
  return `${id}: ${value}`.slice(0, 50);
}
function _extractId$1(valueString) {
  return valueString.split(":")[0];
}
class SelectControlValueAccessor extends BuiltInControlValueAccessor {
  constructor() {
    super(...arguments);
    this._optionMap = /* @__PURE__ */ new Map();
    this._idCounter = 0;
    this._compareWith = Object.is;
  }
  /**
   * @description
   * Tracks the option comparison algorithm for tracking identities when
   * checking for changes.
   */
  set compareWith(fn2) {
    if (typeof fn2 !== "function" && (typeof ngDevMode === "undefined" || ngDevMode)) {
      throw new Error(`compareWith must be a function, but received ${JSON.stringify(fn2)}`);
    }
    this._compareWith = fn2;
  }
  /**
   * Sets the "value" property on the select element.
   * @nodoc
   */
  writeValue(value) {
    this.value = value;
    const id = this._getOptionId(value);
    const valueString = _buildValueString$1(id, value);
    this.setProperty("value", valueString);
  }
  /**
   * Registers a function called when the control value changes.
   * @nodoc
   */
  registerOnChange(fn2) {
    this.onChange = (valueString) => {
      this.value = this._getOptionValue(valueString);
      fn2(this.value);
    };
  }
  /** @internal */
  _registerOption() {
    return (this._idCounter++).toString();
  }
  /** @internal */
  _getOptionId(value) {
    for (const id of Array.from(this._optionMap.keys())) {
      if (this._compareWith(this._optionMap.get(id), value))
        return id;
    }
    return null;
  }
  /** @internal */
  _getOptionValue(valueString) {
    const id = _extractId$1(valueString);
    return this._optionMap.has(id) ? this._optionMap.get(id) : valueString;
  }
}
SelectControlValueAccessor.ɵfac = __ngDeclareFactory({ minVersion: "12.0.0", version: "13.4.0", ngImport: i0, type: SelectControlValueAccessor, deps: null, target: FactoryTarget.Directive });
SelectControlValueAccessor.ɵdir = __ngDeclareDirective({ minVersion: "12.0.0", version: "13.4.0", type: SelectControlValueAccessor, selector: "select:not([multiple])[formControlName],select:not([multiple])[formControl],select:not([multiple])[ngModel]", inputs: { compareWith: "compareWith" }, host: { listeners: { "change": "onChange($event.target.value)", "blur": "onTouched()" } }, providers: [SELECT_VALUE_ACCESSOR], usesInheritance: true, ngImport: i0 });
__ngDeclareClassMetadata({ type: SelectControlValueAccessor, decorators: [{
  type: Directive,
  args: [{
    selector: "select:not([multiple])[formControlName],select:not([multiple])[formControl],select:not([multiple])[ngModel]",
    host: { "(change)": "onChange($event.target.value)", "(blur)": "onTouched()" },
    providers: [SELECT_VALUE_ACCESSOR]
  }]
}], propDecorators: { compareWith: [{
  type: Input
}] } });
class NgSelectOption {
  constructor(_element, _renderer, _select) {
    this._element = _element;
    this._renderer = _renderer;
    this._select = _select;
    if (this._select)
      this.id = this._select._registerOption();
  }
  /**
   * @description
   * Tracks the value bound to the option element. Unlike the value binding,
   * ngValue supports binding to objects.
   */
  set ngValue(value) {
    if (this._select == null)
      return;
    this._select._optionMap.set(this.id, value);
    this._setElementValue(_buildValueString$1(this.id, value));
    this._select.writeValue(this._select.value);
  }
  /**
   * @description
   * Tracks simple string values bound to the option element.
   * For objects, use the `ngValue` input binding.
   */
  set value(value) {
    this._setElementValue(value);
    if (this._select)
      this._select.writeValue(this._select.value);
  }
  /** @internal */
  _setElementValue(value) {
    this._renderer.setProperty(this._element.nativeElement, "value", value);
  }
  /** @nodoc */
  ngOnDestroy() {
    if (this._select) {
      this._select._optionMap.delete(this.id);
      this._select.writeValue(this._select.value);
    }
  }
}
NgSelectOption.ɵfac = __ngDeclareFactory({ minVersion: "12.0.0", version: "13.4.0", ngImport: i0, type: NgSelectOption, deps: [{ token: ElementRef }, { token: Renderer2 }, { token: SelectControlValueAccessor, host: true, optional: true }], target: FactoryTarget.Directive });
NgSelectOption.ɵdir = __ngDeclareDirective({ minVersion: "12.0.0", version: "13.4.0", type: NgSelectOption, selector: "option", inputs: { ngValue: "ngValue", value: "value" }, ngImport: i0 });
__ngDeclareClassMetadata({ type: NgSelectOption, decorators: [{
  type: Directive,
  args: [{ selector: "option" }]
}], ctorParameters: function() {
  return [{ type: ElementRef }, { type: Renderer2 }, { type: SelectControlValueAccessor, decorators: [{
    type: Optional
  }, {
    type: Host
  }] }];
}, propDecorators: { ngValue: [{
  type: Input,
  args: ["ngValue"]
}], value: [{
  type: Input,
  args: ["value"]
}] } });
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
const SELECT_MULTIPLE_VALUE_ACCESSOR = {
  provide: NG_VALUE_ACCESSOR,
  useExisting: forwardRef(() => SelectMultipleControlValueAccessor),
  multi: true
};
function _buildValueString(id, value) {
  if (id == null)
    return `${value}`;
  if (typeof value === "string")
    value = `'${value}'`;
  if (value && typeof value === "object")
    value = "Object";
  return `${id}: ${value}`.slice(0, 50);
}
function _extractId(valueString) {
  return valueString.split(":")[0];
}
class SelectMultipleControlValueAccessor extends BuiltInControlValueAccessor {
  constructor() {
    super(...arguments);
    this._optionMap = /* @__PURE__ */ new Map();
    this._idCounter = 0;
    this._compareWith = Object.is;
  }
  /**
   * @description
   * Tracks the option comparison algorithm for tracking identities when
   * checking for changes.
   */
  set compareWith(fn2) {
    if (typeof fn2 !== "function" && (typeof ngDevMode === "undefined" || ngDevMode)) {
      throw new Error(`compareWith must be a function, but received ${JSON.stringify(fn2)}`);
    }
    this._compareWith = fn2;
  }
  /**
   * Sets the "value" property on one or of more of the select's options.
   * @nodoc
   */
  writeValue(value) {
    this.value = value;
    let optionSelectedStateSetter;
    if (Array.isArray(value)) {
      const ids = value.map((v) => this._getOptionId(v));
      optionSelectedStateSetter = (opt, o) => {
        opt._setSelected(ids.indexOf(o.toString()) > -1);
      };
    } else {
      optionSelectedStateSetter = (opt, o) => {
        opt._setSelected(false);
      };
    }
    this._optionMap.forEach(optionSelectedStateSetter);
  }
  /**
   * Registers a function called when the control value changes
   * and writes an array of the selected options.
   * @nodoc
   */
  registerOnChange(fn2) {
    this.onChange = (element) => {
      const selected = [];
      const selectedOptions = element.selectedOptions;
      if (selectedOptions !== void 0) {
        const options = selectedOptions;
        for (let i = 0; i < options.length; i++) {
          const opt = options[i];
          const val = this._getOptionValue(opt.value);
          selected.push(val);
        }
      } else {
        const options = element.options;
        for (let i = 0; i < options.length; i++) {
          const opt = options[i];
          if (opt.selected) {
            const val = this._getOptionValue(opt.value);
            selected.push(val);
          }
        }
      }
      this.value = selected;
      fn2(selected);
    };
  }
  /** @internal */
  _registerOption(value) {
    const id = (this._idCounter++).toString();
    this._optionMap.set(id, value);
    return id;
  }
  /** @internal */
  _getOptionId(value) {
    for (const id of Array.from(this._optionMap.keys())) {
      if (this._compareWith(this._optionMap.get(id)._value, value))
        return id;
    }
    return null;
  }
  /** @internal */
  _getOptionValue(valueString) {
    const id = _extractId(valueString);
    return this._optionMap.has(id) ? this._optionMap.get(id)._value : valueString;
  }
}
SelectMultipleControlValueAccessor.ɵfac = __ngDeclareFactory({ minVersion: "12.0.0", version: "13.4.0", ngImport: i0, type: SelectMultipleControlValueAccessor, deps: null, target: FactoryTarget.Directive });
SelectMultipleControlValueAccessor.ɵdir = __ngDeclareDirective({ minVersion: "12.0.0", version: "13.4.0", type: SelectMultipleControlValueAccessor, selector: "select[multiple][formControlName],select[multiple][formControl],select[multiple][ngModel]", inputs: { compareWith: "compareWith" }, host: { listeners: { "change": "onChange($event.target)", "blur": "onTouched()" } }, providers: [SELECT_MULTIPLE_VALUE_ACCESSOR], usesInheritance: true, ngImport: i0 });
__ngDeclareClassMetadata({ type: SelectMultipleControlValueAccessor, decorators: [{
  type: Directive,
  args: [{
    selector: "select[multiple][formControlName],select[multiple][formControl],select[multiple][ngModel]",
    host: { "(change)": "onChange($event.target)", "(blur)": "onTouched()" },
    providers: [SELECT_MULTIPLE_VALUE_ACCESSOR]
  }]
}], propDecorators: { compareWith: [{
  type: Input
}] } });
class ɵNgSelectMultipleOption {
  constructor(_element, _renderer, _select) {
    this._element = _element;
    this._renderer = _renderer;
    this._select = _select;
    if (this._select) {
      this.id = this._select._registerOption(this);
    }
  }
  /**
   * @description
   * Tracks the value bound to the option element. Unlike the value binding,
   * ngValue supports binding to objects.
   */
  set ngValue(value) {
    if (this._select == null)
      return;
    this._value = value;
    this._setElementValue(_buildValueString(this.id, value));
    this._select.writeValue(this._select.value);
  }
  /**
   * @description
   * Tracks simple string values bound to the option element.
   * For objects, use the `ngValue` input binding.
   */
  set value(value) {
    if (this._select) {
      this._value = value;
      this._setElementValue(_buildValueString(this.id, value));
      this._select.writeValue(this._select.value);
    } else {
      this._setElementValue(value);
    }
  }
  /** @internal */
  _setElementValue(value) {
    this._renderer.setProperty(this._element.nativeElement, "value", value);
  }
  /** @internal */
  _setSelected(selected) {
    this._renderer.setProperty(this._element.nativeElement, "selected", selected);
  }
  /** @nodoc */
  ngOnDestroy() {
    if (this._select) {
      this._select._optionMap.delete(this.id);
      this._select.writeValue(this._select.value);
    }
  }
}
ɵNgSelectMultipleOption.ɵfac = __ngDeclareFactory({ minVersion: "12.0.0", version: "13.4.0", ngImport: i0, type: ɵNgSelectMultipleOption, deps: [{ token: ElementRef }, { token: Renderer2 }, { token: SelectMultipleControlValueAccessor, host: true, optional: true }], target: FactoryTarget.Directive });
ɵNgSelectMultipleOption.ɵdir = __ngDeclareDirective({ minVersion: "12.0.0", version: "13.4.0", type: ɵNgSelectMultipleOption, selector: "option", inputs: { ngValue: "ngValue", value: "value" }, ngImport: i0 });
__ngDeclareClassMetadata({ type: ɵNgSelectMultipleOption, decorators: [{
  type: Directive,
  args: [{ selector: "option" }]
}], ctorParameters: function() {
  return [{ type: ElementRef }, { type: Renderer2 }, { type: SelectMultipleControlValueAccessor, decorators: [{
    type: Optional
  }, {
    type: Host
  }] }];
}, propDecorators: { ngValue: [{
  type: Input,
  args: ["ngValue"]
}], value: [{
  type: Input,
  args: ["value"]
}] } });
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
function toInteger$1(value) {
  return typeof value === "number" ? value : parseInt(value, 10);
}
function toBoolean(input) {
  return input != null && input !== false && `${input}` !== "false";
}
function toFloat(value) {
  return typeof value === "number" ? value : parseFloat(value);
}
class AbstractValidatorDirective {
  constructor() {
    this._validator = nullValidator;
  }
  /** @nodoc */
  ngOnChanges(changes) {
    if (this.inputName in changes) {
      const input = this.normalizeInput(changes[this.inputName].currentValue);
      this._enabled = this.enabled(input);
      this._validator = this._enabled ? this.createValidator(input) : nullValidator;
      if (this._onChange) {
        this._onChange();
      }
    }
  }
  /** @nodoc */
  validate(control) {
    return this._validator(control);
  }
  /** @nodoc */
  registerOnValidatorChange(fn2) {
    this._onChange = fn2;
  }
  /**
   * @description
   * Determines whether this validator should be active or not based on an input.
   * Base class implementation checks whether an input is defined (if the value is different from
   * `null` and `undefined`). Validator classes that extend this base class can override this
   * function with the logic specific to a particular validator directive.
   */
  enabled(input) {
    return input != null;
  }
}
AbstractValidatorDirective.ɵfac = __ngDeclareFactory({ minVersion: "12.0.0", version: "13.4.0", ngImport: i0, type: AbstractValidatorDirective, deps: [], target: FactoryTarget.Directive });
AbstractValidatorDirective.ɵdir = __ngDeclareDirective({ minVersion: "12.0.0", version: "13.4.0", type: AbstractValidatorDirective, usesOnChanges: true, ngImport: i0 });
__ngDeclareClassMetadata({ type: AbstractValidatorDirective, decorators: [{
  type: Directive
}] });
const MAX_VALIDATOR = {
  provide: NG_VALIDATORS,
  useExisting: forwardRef(() => MaxValidator),
  multi: true
};
class MaxValidator extends AbstractValidatorDirective {
  constructor() {
    super(...arguments);
    this.inputName = "max";
    this.normalizeInput = (input) => toFloat(input);
    this.createValidator = (max2) => maxValidator(max2);
  }
}
MaxValidator.ɵfac = __ngDeclareFactory({ minVersion: "12.0.0", version: "13.4.0", ngImport: i0, type: MaxValidator, deps: null, target: FactoryTarget.Directive });
MaxValidator.ɵdir = __ngDeclareDirective({ minVersion: "12.0.0", version: "13.4.0", type: MaxValidator, selector: "input[type=number][max][formControlName],input[type=number][max][formControl],input[type=number][max][ngModel]", inputs: { max: "max" }, host: { properties: { "attr.max": "_enabled ? max : null" } }, providers: [MAX_VALIDATOR], usesInheritance: true, ngImport: i0 });
__ngDeclareClassMetadata({ type: MaxValidator, decorators: [{
  type: Directive,
  args: [{
    selector: "input[type=number][max][formControlName],input[type=number][max][formControl],input[type=number][max][ngModel]",
    providers: [MAX_VALIDATOR],
    host: { "[attr.max]": "_enabled ? max : null" }
  }]
}], propDecorators: { max: [{
  type: Input
}] } });
const MIN_VALIDATOR = {
  provide: NG_VALIDATORS,
  useExisting: forwardRef(() => MinValidator),
  multi: true
};
class MinValidator extends AbstractValidatorDirective {
  constructor() {
    super(...arguments);
    this.inputName = "min";
    this.normalizeInput = (input) => toFloat(input);
    this.createValidator = (min2) => minValidator(min2);
  }
}
MinValidator.ɵfac = __ngDeclareFactory({ minVersion: "12.0.0", version: "13.4.0", ngImport: i0, type: MinValidator, deps: null, target: FactoryTarget.Directive });
MinValidator.ɵdir = __ngDeclareDirective({ minVersion: "12.0.0", version: "13.4.0", type: MinValidator, selector: "input[type=number][min][formControlName],input[type=number][min][formControl],input[type=number][min][ngModel]", inputs: { min: "min" }, host: { properties: { "attr.min": "_enabled ? min : null" } }, providers: [MIN_VALIDATOR], usesInheritance: true, ngImport: i0 });
__ngDeclareClassMetadata({ type: MinValidator, decorators: [{
  type: Directive,
  args: [{
    selector: "input[type=number][min][formControlName],input[type=number][min][formControl],input[type=number][min][ngModel]",
    providers: [MIN_VALIDATOR],
    host: { "[attr.min]": "_enabled ? min : null" }
  }]
}], propDecorators: { min: [{
  type: Input
}] } });
const REQUIRED_VALIDATOR = {
  provide: NG_VALIDATORS,
  useExisting: forwardRef(() => RequiredValidator),
  multi: true
};
const CHECKBOX_REQUIRED_VALIDATOR = {
  provide: NG_VALIDATORS,
  useExisting: forwardRef(() => CheckboxRequiredValidator),
  multi: true
};
class RequiredValidator extends AbstractValidatorDirective {
  constructor() {
    super(...arguments);
    this.inputName = "required";
    this.normalizeInput = (input) => toBoolean(input);
    this.createValidator = (input) => requiredValidator;
  }
  /** @nodoc */
  enabled(input) {
    return input;
  }
}
RequiredValidator.ɵfac = __ngDeclareFactory({ minVersion: "12.0.0", version: "13.4.0", ngImport: i0, type: RequiredValidator, deps: null, target: FactoryTarget.Directive });
RequiredValidator.ɵdir = __ngDeclareDirective({ minVersion: "12.0.0", version: "13.4.0", type: RequiredValidator, selector: ":not([type=checkbox])[required][formControlName],:not([type=checkbox])[required][formControl],:not([type=checkbox])[required][ngModel]", inputs: { required: "required" }, host: { properties: { "attr.required": '_enabled ? "" : null' } }, providers: [REQUIRED_VALIDATOR], usesInheritance: true, ngImport: i0 });
__ngDeclareClassMetadata({ type: RequiredValidator, decorators: [{
  type: Directive,
  args: [{
    selector: ":not([type=checkbox])[required][formControlName],:not([type=checkbox])[required][formControl],:not([type=checkbox])[required][ngModel]",
    providers: [REQUIRED_VALIDATOR],
    host: { "[attr.required]": '_enabled ? "" : null' }
  }]
}], propDecorators: { required: [{
  type: Input
}] } });
class CheckboxRequiredValidator extends RequiredValidator {
  constructor() {
    super(...arguments);
    this.createValidator = (input) => requiredTrueValidator;
  }
}
CheckboxRequiredValidator.ɵfac = __ngDeclareFactory({ minVersion: "12.0.0", version: "13.4.0", ngImport: i0, type: CheckboxRequiredValidator, deps: null, target: FactoryTarget.Directive });
CheckboxRequiredValidator.ɵdir = __ngDeclareDirective({ minVersion: "12.0.0", version: "13.4.0", type: CheckboxRequiredValidator, selector: "input[type=checkbox][required][formControlName],input[type=checkbox][required][formControl],input[type=checkbox][required][ngModel]", host: { properties: { "attr.required": '_enabled ? "" : null' } }, providers: [CHECKBOX_REQUIRED_VALIDATOR], usesInheritance: true, ngImport: i0 });
__ngDeclareClassMetadata({ type: CheckboxRequiredValidator, decorators: [{
  type: Directive,
  args: [{
    selector: "input[type=checkbox][required][formControlName],input[type=checkbox][required][formControl],input[type=checkbox][required][ngModel]",
    providers: [CHECKBOX_REQUIRED_VALIDATOR],
    host: { "[attr.required]": '_enabled ? "" : null' }
  }]
}] });
const EMAIL_VALIDATOR = {
  provide: NG_VALIDATORS,
  useExisting: forwardRef(() => EmailValidator),
  multi: true
};
class EmailValidator extends AbstractValidatorDirective {
  constructor() {
    super(...arguments);
    this.inputName = "email";
    this.normalizeInput = (input) => (
      // Avoid TSLint requirement to omit semicolon, see
      // https://github.com/palantir/tslint/issues/1476
      // tslint:disable-next-line:semicolon
      input === "" || input === true || input === "true"
    );
    this.createValidator = (input) => emailValidator;
  }
  /** @nodoc */
  enabled(input) {
    return input;
  }
}
EmailValidator.ɵfac = __ngDeclareFactory({ minVersion: "12.0.0", version: "13.4.0", ngImport: i0, type: EmailValidator, deps: null, target: FactoryTarget.Directive });
EmailValidator.ɵdir = __ngDeclareDirective({ minVersion: "12.0.0", version: "13.4.0", type: EmailValidator, selector: "[email][formControlName],[email][formControl],[email][ngModel]", inputs: { email: "email" }, providers: [EMAIL_VALIDATOR], usesInheritance: true, ngImport: i0 });
__ngDeclareClassMetadata({ type: EmailValidator, decorators: [{
  type: Directive,
  args: [{
    selector: "[email][formControlName],[email][formControl],[email][ngModel]",
    providers: [EMAIL_VALIDATOR]
  }]
}], propDecorators: { email: [{
  type: Input
}] } });
const MIN_LENGTH_VALIDATOR = {
  provide: NG_VALIDATORS,
  useExisting: forwardRef(() => MinLengthValidator),
  multi: true
};
class MinLengthValidator extends AbstractValidatorDirective {
  constructor() {
    super(...arguments);
    this.inputName = "minlength";
    this.normalizeInput = (input) => toInteger$1(input);
    this.createValidator = (minlength) => minLengthValidator(minlength);
  }
}
MinLengthValidator.ɵfac = __ngDeclareFactory({ minVersion: "12.0.0", version: "13.4.0", ngImport: i0, type: MinLengthValidator, deps: null, target: FactoryTarget.Directive });
MinLengthValidator.ɵdir = __ngDeclareDirective({ minVersion: "12.0.0", version: "13.4.0", type: MinLengthValidator, selector: "[minlength][formControlName],[minlength][formControl],[minlength][ngModel]", inputs: { minlength: "minlength" }, host: { properties: { "attr.minlength": "_enabled ? minlength : null" } }, providers: [MIN_LENGTH_VALIDATOR], usesInheritance: true, ngImport: i0 });
__ngDeclareClassMetadata({ type: MinLengthValidator, decorators: [{
  type: Directive,
  args: [{
    selector: "[minlength][formControlName],[minlength][formControl],[minlength][ngModel]",
    providers: [MIN_LENGTH_VALIDATOR],
    host: { "[attr.minlength]": "_enabled ? minlength : null" }
  }]
}], propDecorators: { minlength: [{
  type: Input
}] } });
const MAX_LENGTH_VALIDATOR = {
  provide: NG_VALIDATORS,
  useExisting: forwardRef(() => MaxLengthValidator),
  multi: true
};
class MaxLengthValidator extends AbstractValidatorDirective {
  constructor() {
    super(...arguments);
    this.inputName = "maxlength";
    this.normalizeInput = (input) => toInteger$1(input);
    this.createValidator = (maxlength) => maxLengthValidator(maxlength);
  }
}
MaxLengthValidator.ɵfac = __ngDeclareFactory({ minVersion: "12.0.0", version: "13.4.0", ngImport: i0, type: MaxLengthValidator, deps: null, target: FactoryTarget.Directive });
MaxLengthValidator.ɵdir = __ngDeclareDirective({ minVersion: "12.0.0", version: "13.4.0", type: MaxLengthValidator, selector: "[maxlength][formControlName],[maxlength][formControl],[maxlength][ngModel]", inputs: { maxlength: "maxlength" }, host: { properties: { "attr.maxlength": "_enabled ? maxlength : null" } }, providers: [MAX_LENGTH_VALIDATOR], usesInheritance: true, ngImport: i0 });
__ngDeclareClassMetadata({ type: MaxLengthValidator, decorators: [{
  type: Directive,
  args: [{
    selector: "[maxlength][formControlName],[maxlength][formControl],[maxlength][ngModel]",
    providers: [MAX_LENGTH_VALIDATOR],
    host: { "[attr.maxlength]": "_enabled ? maxlength : null" }
  }]
}], propDecorators: { maxlength: [{
  type: Input
}] } });
const PATTERN_VALIDATOR = {
  provide: NG_VALIDATORS,
  useExisting: forwardRef(() => PatternValidator),
  multi: true
};
class PatternValidator extends AbstractValidatorDirective {
  constructor() {
    super(...arguments);
    this.inputName = "pattern";
    this.normalizeInput = (input) => input;
    this.createValidator = (input) => patternValidator(input);
  }
}
PatternValidator.ɵfac = __ngDeclareFactory({ minVersion: "12.0.0", version: "13.4.0", ngImport: i0, type: PatternValidator, deps: null, target: FactoryTarget.Directive });
PatternValidator.ɵdir = __ngDeclareDirective({ minVersion: "12.0.0", version: "13.4.0", type: PatternValidator, selector: "[pattern][formControlName],[pattern][formControl],[pattern][ngModel]", inputs: { pattern: "pattern" }, host: { properties: { "attr.pattern": "_enabled ? pattern : null" } }, providers: [PATTERN_VALIDATOR], usesInheritance: true, ngImport: i0 });
__ngDeclareClassMetadata({ type: PatternValidator, decorators: [{
  type: Directive,
  args: [{
    selector: "[pattern][formControlName],[pattern][formControl],[pattern][ngModel]",
    providers: [PATTERN_VALIDATOR],
    host: { "[attr.pattern]": "_enabled ? pattern : null" }
  }]
}], propDecorators: { pattern: [{
  type: Input
}] } });
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
const SHARED_FORM_DIRECTIVES = [
  ɵNgNoValidate,
  NgSelectOption,
  ɵNgSelectMultipleOption,
  DefaultValueAccessor,
  NumberValueAccessor,
  RangeValueAccessor,
  CheckboxControlValueAccessor,
  SelectControlValueAccessor,
  SelectMultipleControlValueAccessor,
  RadioControlValueAccessor,
  NgControlStatus,
  NgControlStatusGroup,
  RequiredValidator,
  MinLengthValidator,
  MaxLengthValidator,
  PatternValidator,
  CheckboxRequiredValidator,
  EmailValidator,
  MinValidator,
  MaxValidator
];
const TEMPLATE_DRIVEN_DIRECTIVES = [NgModel, NgModelGroup, NgForm];
const REACTIVE_DRIVEN_DIRECTIVES = [FormControlDirective, FormGroupDirective, FormControlName, FormGroupName, FormArrayName];
class ɵInternalFormsSharedModule {
}
ɵInternalFormsSharedModule.ɵfac = __ngDeclareFactory({ minVersion: "12.0.0", version: "13.4.0", ngImport: i0, type: ɵInternalFormsSharedModule, deps: [], target: FactoryTarget.NgModule });
ɵInternalFormsSharedModule.ɵmod = __ngDeclareNgModule({ minVersion: "12.0.0", version: "13.4.0", ngImport: i0, type: ɵInternalFormsSharedModule, declarations: [
  ɵNgNoValidate,
  NgSelectOption,
  ɵNgSelectMultipleOption,
  DefaultValueAccessor,
  NumberValueAccessor,
  RangeValueAccessor,
  CheckboxControlValueAccessor,
  SelectControlValueAccessor,
  SelectMultipleControlValueAccessor,
  RadioControlValueAccessor,
  NgControlStatus,
  NgControlStatusGroup,
  RequiredValidator,
  MinLengthValidator,
  MaxLengthValidator,
  PatternValidator,
  CheckboxRequiredValidator,
  EmailValidator,
  MinValidator,
  MaxValidator
], imports: [RadioControlRegistryModule], exports: [
  ɵNgNoValidate,
  NgSelectOption,
  ɵNgSelectMultipleOption,
  DefaultValueAccessor,
  NumberValueAccessor,
  RangeValueAccessor,
  CheckboxControlValueAccessor,
  SelectControlValueAccessor,
  SelectMultipleControlValueAccessor,
  RadioControlValueAccessor,
  NgControlStatus,
  NgControlStatusGroup,
  RequiredValidator,
  MinLengthValidator,
  MaxLengthValidator,
  PatternValidator,
  CheckboxRequiredValidator,
  EmailValidator,
  MinValidator,
  MaxValidator
] });
ɵInternalFormsSharedModule.ɵinj = __ngDeclareInjector({ minVersion: "12.0.0", version: "13.4.0", ngImport: i0, type: ɵInternalFormsSharedModule, imports: [[RadioControlRegistryModule]] });
__ngDeclareClassMetadata({ type: ɵInternalFormsSharedModule, decorators: [{
  type: NgModule,
  args: [{
    declarations: SHARED_FORM_DIRECTIVES,
    imports: [RadioControlRegistryModule],
    exports: SHARED_FORM_DIRECTIVES
  }]
}] });
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
class FormsModule {
}
FormsModule.ɵfac = __ngDeclareFactory({ minVersion: "12.0.0", version: "13.4.0", ngImport: i0, type: FormsModule, deps: [], target: FactoryTarget.NgModule });
FormsModule.ɵmod = __ngDeclareNgModule({ minVersion: "12.0.0", version: "13.4.0", ngImport: i0, type: FormsModule, declarations: [NgModel, NgModelGroup, NgForm], exports: [ɵInternalFormsSharedModule, NgModel, NgModelGroup, NgForm] });
FormsModule.ɵinj = __ngDeclareInjector({ minVersion: "12.0.0", version: "13.4.0", ngImport: i0, type: FormsModule, imports: [ɵInternalFormsSharedModule] });
__ngDeclareClassMetadata({ type: FormsModule, decorators: [{
  type: NgModule,
  args: [{
    declarations: TEMPLATE_DRIVEN_DIRECTIVES,
    exports: [ɵInternalFormsSharedModule, TEMPLATE_DRIVEN_DIRECTIVES]
  }]
}] });
class ReactiveFormsModule {
  /**
   * @description
   * Provides options for configuring the reactive forms module.
   *
   * @param opts An object of configuration options
   * * `warnOnNgModelWithFormControl` Configures when to emit a warning when an `ngModel`
   * binding is used with reactive form directives.
   */
  static withConfig(opts) {
    return {
      ngModule: ReactiveFormsModule,
      providers: [
        { provide: NG_MODEL_WITH_FORM_CONTROL_WARNING, useValue: opts.warnOnNgModelWithFormControl }
      ]
    };
  }
}
ReactiveFormsModule.ɵfac = __ngDeclareFactory({ minVersion: "12.0.0", version: "13.4.0", ngImport: i0, type: ReactiveFormsModule, deps: [], target: FactoryTarget.NgModule });
ReactiveFormsModule.ɵmod = __ngDeclareNgModule({ minVersion: "12.0.0", version: "13.4.0", ngImport: i0, type: ReactiveFormsModule, declarations: [FormControlDirective, FormGroupDirective, FormControlName, FormGroupName, FormArrayName], exports: [ɵInternalFormsSharedModule, FormControlDirective, FormGroupDirective, FormControlName, FormGroupName, FormArrayName] });
ReactiveFormsModule.ɵinj = __ngDeclareInjector({ minVersion: "12.0.0", version: "13.4.0", ngImport: i0, type: ReactiveFormsModule, imports: [ɵInternalFormsSharedModule] });
__ngDeclareClassMetadata({ type: ReactiveFormsModule, decorators: [{
  type: NgModule,
  args: [{
    declarations: [REACTIVE_DRIVEN_DIRECTIVES],
    exports: [ɵInternalFormsSharedModule, REACTIVE_DRIVEN_DIRECTIVES]
  }]
}] });
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
function isAbstractControlOptions(options) {
  return options.asyncValidators !== void 0 || options.validators !== void 0 || options.updateOn !== void 0;
}
class FormBuilder {
  group(controlsConfig, options = null) {
    const controls = this._reduceControls(controlsConfig);
    let validators = null;
    let asyncValidators = null;
    let updateOn = void 0;
    if (options != null) {
      if (isAbstractControlOptions(options)) {
        validators = options.validators != null ? options.validators : null;
        asyncValidators = options.asyncValidators != null ? options.asyncValidators : null;
        updateOn = options.updateOn != null ? options.updateOn : void 0;
      } else {
        validators = options["validator"] != null ? options["validator"] : null;
        asyncValidators = options["asyncValidator"] != null ? options["asyncValidator"] : null;
      }
    }
    return new FormGroup(controls, { asyncValidators, updateOn, validators });
  }
  /**
   * @description
   * Construct a new `FormControl` with the given state, validators and options.
   *
   * @param formState Initializes the control with an initial state value, or
   * with an object that contains both a value and a disabled status.
   *
   * @param validatorOrOpts A synchronous validator function, or an array of
   * such functions, or an `AbstractControlOptions` object that contains
   * validation functions and a validation trigger.
   *
   * @param asyncValidator A single async validator or array of async validator
   * functions.
   *
   * @usageNotes
   *
   * ### Initialize a control as disabled
   *
   * The following example returns a control with an initial value in a disabled state.
   *
   * <code-example path="forms/ts/formBuilder/form_builder_example.ts" region="disabled-control">
   * </code-example>
   */
  control(formState, validatorOrOpts, asyncValidator) {
    return new FormControl(formState, validatorOrOpts, asyncValidator);
  }
  /**
   * Constructs a new `FormArray` from the given array of configurations,
   * validators and options.
   *
   * @param controlsConfig An array of child controls or control configs. Each
   * child control is given an index when it is registered.
   *
   * @param validatorOrOpts A synchronous validator function, or an array of
   * such functions, or an `AbstractControlOptions` object that contains
   * validation functions and a validation trigger.
   *
   * @param asyncValidator A single async validator or array of async validator
   * functions.
   */
  array(controlsConfig, validatorOrOpts, asyncValidator) {
    const controls = controlsConfig.map((c) => this._createControl(c));
    return new FormArray(controls, validatorOrOpts, asyncValidator);
  }
  /** @internal */
  _reduceControls(controlsConfig) {
    const controls = {};
    Object.keys(controlsConfig).forEach((controlName) => {
      controls[controlName] = this._createControl(controlsConfig[controlName]);
    });
    return controls;
  }
  /** @internal */
  _createControl(controlConfig) {
    if (isFormControl(controlConfig) || isFormGroup(controlConfig) || isFormArray(controlConfig)) {
      return controlConfig;
    } else if (Array.isArray(controlConfig)) {
      const value = controlConfig[0];
      const validator = controlConfig.length > 1 ? controlConfig[1] : null;
      const asyncValidator = controlConfig.length > 2 ? controlConfig[2] : null;
      return this.control(value, validator, asyncValidator);
    } else {
      return this.control(controlConfig);
    }
  }
}
FormBuilder.ɵfac = __ngDeclareFactory({ minVersion: "12.0.0", version: "13.4.0", ngImport: i0, type: FormBuilder, deps: [], target: FactoryTarget.Injectable });
FormBuilder.ɵprov = __ngDeclareInjectable({ minVersion: "12.0.0", version: "13.4.0", ngImport: i0, type: FormBuilder, providedIn: ReactiveFormsModule });
__ngDeclareClassMetadata({ type: FormBuilder, decorators: [{
  type: Injectable,
  args: [{ providedIn: ReactiveFormsModule }]
}] });
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
new Version("13.4.0");
var top = "top";
var bottom = "bottom";
var right = "right";
var left = "left";
var auto = "auto";
var basePlacements = [top, bottom, right, left];
var start = "start";
var end = "end";
var clippingParents = "clippingParents";
var viewport = "viewport";
var popper = "popper";
var reference = "reference";
var variationPlacements = /* @__PURE__ */ basePlacements.reduce(function(acc, placement) {
  return acc.concat([placement + "-" + start, placement + "-" + end]);
}, []);
var placements = /* @__PURE__ */ [].concat(basePlacements, [auto]).reduce(function(acc, placement) {
  return acc.concat([placement, placement + "-" + start, placement + "-" + end]);
}, []);
var beforeRead = "beforeRead";
var read = "read";
var afterRead = "afterRead";
var beforeMain = "beforeMain";
var main = "main";
var afterMain = "afterMain";
var beforeWrite = "beforeWrite";
var write = "write";
var afterWrite = "afterWrite";
var modifierPhases = [beforeRead, read, afterRead, beforeMain, main, afterMain, beforeWrite, write, afterWrite];
function getNodeName(element) {
  return element ? (element.nodeName || "").toLowerCase() : null;
}
function getWindow$1(node) {
  if (node == null) {
    return window;
  }
  if (node.toString() !== "[object Window]") {
    var ownerDocument = node.ownerDocument;
    return ownerDocument ? ownerDocument.defaultView || window : window;
  }
  return node;
}
function isElement(node) {
  var OwnElement = getWindow$1(node).Element;
  return node instanceof OwnElement || node instanceof Element;
}
function isHTMLElement(node) {
  var OwnElement = getWindow$1(node).HTMLElement;
  return node instanceof OwnElement || node instanceof HTMLElement;
}
function isShadowRoot(node) {
  if (typeof ShadowRoot === "undefined") {
    return false;
  }
  var OwnElement = getWindow$1(node).ShadowRoot;
  return node instanceof OwnElement || node instanceof ShadowRoot;
}
function applyStyles(_ref) {
  var state2 = _ref.state;
  Object.keys(state2.elements).forEach(function(name) {
    var style2 = state2.styles[name] || {};
    var attributes = state2.attributes[name] || {};
    var element = state2.elements[name];
    if (!isHTMLElement(element) || !getNodeName(element)) {
      return;
    }
    Object.assign(element.style, style2);
    Object.keys(attributes).forEach(function(name2) {
      var value = attributes[name2];
      if (value === false) {
        element.removeAttribute(name2);
      } else {
        element.setAttribute(name2, value === true ? "" : value);
      }
    });
  });
}
function effect$2(_ref2) {
  var state2 = _ref2.state;
  var initialStyles = {
    popper: {
      position: state2.options.strategy,
      left: "0",
      top: "0",
      margin: "0"
    },
    arrow: {
      position: "absolute"
    },
    reference: {}
  };
  Object.assign(state2.elements.popper.style, initialStyles.popper);
  state2.styles = initialStyles;
  if (state2.elements.arrow) {
    Object.assign(state2.elements.arrow.style, initialStyles.arrow);
  }
  return function() {
    Object.keys(state2.elements).forEach(function(name) {
      var element = state2.elements[name];
      var attributes = state2.attributes[name] || {};
      var styleProperties = Object.keys(state2.styles.hasOwnProperty(name) ? state2.styles[name] : initialStyles[name]);
      var style2 = styleProperties.reduce(function(style3, property) {
        style3[property] = "";
        return style3;
      }, {});
      if (!isHTMLElement(element) || !getNodeName(element)) {
        return;
      }
      Object.assign(element.style, style2);
      Object.keys(attributes).forEach(function(attribute) {
        element.removeAttribute(attribute);
      });
    });
  };
}
const applyStyles$1 = {
  name: "applyStyles",
  enabled: true,
  phase: "write",
  fn: applyStyles,
  effect: effect$2,
  requires: ["computeStyles"]
};
function getBasePlacement(placement) {
  return placement.split("-")[0];
}
var max = Math.max;
var min = Math.min;
var round = Math.round;
function getUAString() {
  var uaData = navigator.userAgentData;
  if (uaData != null && uaData.brands && Array.isArray(uaData.brands)) {
    return uaData.brands.map(function(item) {
      return item.brand + "/" + item.version;
    }).join(" ");
  }
  return navigator.userAgent;
}
function isLayoutViewport() {
  return !/^((?!chrome|android).)*safari/i.test(getUAString());
}
function getBoundingClientRect(element, includeScale, isFixedStrategy) {
  if (includeScale === void 0) {
    includeScale = false;
  }
  if (isFixedStrategy === void 0) {
    isFixedStrategy = false;
  }
  var clientRect = element.getBoundingClientRect();
  var scaleX = 1;
  var scaleY = 1;
  if (includeScale && isHTMLElement(element)) {
    scaleX = element.offsetWidth > 0 ? round(clientRect.width) / element.offsetWidth || 1 : 1;
    scaleY = element.offsetHeight > 0 ? round(clientRect.height) / element.offsetHeight || 1 : 1;
  }
  var _ref = isElement(element) ? getWindow$1(element) : window, visualViewport = _ref.visualViewport;
  var addVisualOffsets = !isLayoutViewport() && isFixedStrategy;
  var x = (clientRect.left + (addVisualOffsets && visualViewport ? visualViewport.offsetLeft : 0)) / scaleX;
  var y = (clientRect.top + (addVisualOffsets && visualViewport ? visualViewport.offsetTop : 0)) / scaleY;
  var width = clientRect.width / scaleX;
  var height = clientRect.height / scaleY;
  return {
    width,
    height,
    top: y,
    right: x + width,
    bottom: y + height,
    left: x,
    x,
    y
  };
}
function getLayoutRect(element) {
  var clientRect = getBoundingClientRect(element);
  var width = element.offsetWidth;
  var height = element.offsetHeight;
  if (Math.abs(clientRect.width - width) <= 1) {
    width = clientRect.width;
  }
  if (Math.abs(clientRect.height - height) <= 1) {
    height = clientRect.height;
  }
  return {
    x: element.offsetLeft,
    y: element.offsetTop,
    width,
    height
  };
}
function contains(parent, child) {
  var rootNode = child.getRootNode && child.getRootNode();
  if (parent.contains(child)) {
    return true;
  } else if (rootNode && isShadowRoot(rootNode)) {
    var next = child;
    do {
      if (next && parent.isSameNode(next)) {
        return true;
      }
      next = next.parentNode || next.host;
    } while (next);
  }
  return false;
}
function getComputedStyle$1(element) {
  return getWindow$1(element).getComputedStyle(element);
}
function isTableElement(element) {
  return ["table", "td", "th"].indexOf(getNodeName(element)) >= 0;
}
function getDocumentElement(element) {
  return ((isElement(element) ? element.ownerDocument : (
    // $FlowFixMe[prop-missing]
    element.document
  )) || window.document).documentElement;
}
function getParentNode(element) {
  if (getNodeName(element) === "html") {
    return element;
  }
  return (
    // this is a quicker (but less type safe) way to save quite some bytes from the bundle
    // $FlowFixMe[incompatible-return]
    // $FlowFixMe[prop-missing]
    element.assignedSlot || // step into the shadow DOM of the parent of a slotted node
    element.parentNode || // DOM Element detected
    (isShadowRoot(element) ? element.host : null) || // ShadowRoot detected
    // $FlowFixMe[incompatible-call]: HTMLElement is a Node
    getDocumentElement(element)
  );
}
function getTrueOffsetParent(element) {
  if (!isHTMLElement(element) || // https://github.com/popperjs/popper-core/issues/837
  getComputedStyle$1(element).position === "fixed") {
    return null;
  }
  return element.offsetParent;
}
function getContainingBlock(element) {
  var isFirefox = /firefox/i.test(getUAString());
  var isIE = /Trident/i.test(getUAString());
  if (isIE && isHTMLElement(element)) {
    var elementCss = getComputedStyle$1(element);
    if (elementCss.position === "fixed") {
      return null;
    }
  }
  var currentNode = getParentNode(element);
  if (isShadowRoot(currentNode)) {
    currentNode = currentNode.host;
  }
  while (isHTMLElement(currentNode) && ["html", "body"].indexOf(getNodeName(currentNode)) < 0) {
    var css = getComputedStyle$1(currentNode);
    if (css.transform !== "none" || css.perspective !== "none" || css.contain === "paint" || ["transform", "perspective"].indexOf(css.willChange) !== -1 || isFirefox && css.willChange === "filter" || isFirefox && css.filter && css.filter !== "none") {
      return currentNode;
    } else {
      currentNode = currentNode.parentNode;
    }
  }
  return null;
}
function getOffsetParent(element) {
  var window2 = getWindow$1(element);
  var offsetParent = getTrueOffsetParent(element);
  while (offsetParent && isTableElement(offsetParent) && getComputedStyle$1(offsetParent).position === "static") {
    offsetParent = getTrueOffsetParent(offsetParent);
  }
  if (offsetParent && (getNodeName(offsetParent) === "html" || getNodeName(offsetParent) === "body" && getComputedStyle$1(offsetParent).position === "static")) {
    return window2;
  }
  return offsetParent || getContainingBlock(element) || window2;
}
function getMainAxisFromPlacement(placement) {
  return ["top", "bottom"].indexOf(placement) >= 0 ? "x" : "y";
}
function within(min$1, value, max$1) {
  return max(min$1, min(value, max$1));
}
function withinMaxClamp(min2, value, max2) {
  var v = within(min2, value, max2);
  return v > max2 ? max2 : v;
}
function getFreshSideObject() {
  return {
    top: 0,
    right: 0,
    bottom: 0,
    left: 0
  };
}
function mergePaddingObject(paddingObject) {
  return Object.assign({}, getFreshSideObject(), paddingObject);
}
function expandToHashMap(value, keys) {
  return keys.reduce(function(hashMap, key) {
    hashMap[key] = value;
    return hashMap;
  }, {});
}
var toPaddingObject = function toPaddingObject2(padding, state2) {
  padding = typeof padding === "function" ? padding(Object.assign({}, state2.rects, {
    placement: state2.placement
  })) : padding;
  return mergePaddingObject(typeof padding !== "number" ? padding : expandToHashMap(padding, basePlacements));
};
function arrow(_ref) {
  var _state$modifiersData$;
  var state2 = _ref.state, name = _ref.name, options = _ref.options;
  var arrowElement = state2.elements.arrow;
  var popperOffsets2 = state2.modifiersData.popperOffsets;
  var basePlacement = getBasePlacement(state2.placement);
  var axis = getMainAxisFromPlacement(basePlacement);
  var isVertical = [left, right].indexOf(basePlacement) >= 0;
  var len = isVertical ? "height" : "width";
  if (!arrowElement || !popperOffsets2) {
    return;
  }
  var paddingObject = toPaddingObject(options.padding, state2);
  var arrowRect = getLayoutRect(arrowElement);
  var minProp = axis === "y" ? top : left;
  var maxProp = axis === "y" ? bottom : right;
  var endDiff = state2.rects.reference[len] + state2.rects.reference[axis] - popperOffsets2[axis] - state2.rects.popper[len];
  var startDiff = popperOffsets2[axis] - state2.rects.reference[axis];
  var arrowOffsetParent = getOffsetParent(arrowElement);
  var clientSize = arrowOffsetParent ? axis === "y" ? arrowOffsetParent.clientHeight || 0 : arrowOffsetParent.clientWidth || 0 : 0;
  var centerToReference = endDiff / 2 - startDiff / 2;
  var min2 = paddingObject[minProp];
  var max2 = clientSize - arrowRect[len] - paddingObject[maxProp];
  var center = clientSize / 2 - arrowRect[len] / 2 + centerToReference;
  var offset2 = within(min2, center, max2);
  var axisProp = axis;
  state2.modifiersData[name] = (_state$modifiersData$ = {}, _state$modifiersData$[axisProp] = offset2, _state$modifiersData$.centerOffset = offset2 - center, _state$modifiersData$);
}
function effect$1(_ref2) {
  var state2 = _ref2.state, options = _ref2.options;
  var _options$element = options.element, arrowElement = _options$element === void 0 ? "[data-popper-arrow]" : _options$element;
  if (arrowElement == null) {
    return;
  }
  if (typeof arrowElement === "string") {
    arrowElement = state2.elements.popper.querySelector(arrowElement);
    if (!arrowElement) {
      return;
    }
  }
  if (!contains(state2.elements.popper, arrowElement)) {
    return;
  }
  state2.elements.arrow = arrowElement;
}
const arrow$1 = {
  name: "arrow",
  enabled: true,
  phase: "main",
  fn: arrow,
  effect: effect$1,
  requires: ["popperOffsets"],
  requiresIfExists: ["preventOverflow"]
};
function getVariation(placement) {
  return placement.split("-")[1];
}
var unsetSides = {
  top: "auto",
  right: "auto",
  bottom: "auto",
  left: "auto"
};
function roundOffsetsByDPR(_ref, win) {
  var x = _ref.x, y = _ref.y;
  var dpr = win.devicePixelRatio || 1;
  return {
    x: round(x * dpr) / dpr || 0,
    y: round(y * dpr) / dpr || 0
  };
}
function mapToStyles(_ref2) {
  var _Object$assign2;
  var popper2 = _ref2.popper, popperRect = _ref2.popperRect, placement = _ref2.placement, variation = _ref2.variation, offsets = _ref2.offsets, position = _ref2.position, gpuAcceleration = _ref2.gpuAcceleration, adaptive = _ref2.adaptive, roundOffsets = _ref2.roundOffsets, isFixed = _ref2.isFixed;
  var _offsets$x = offsets.x, x = _offsets$x === void 0 ? 0 : _offsets$x, _offsets$y = offsets.y, y = _offsets$y === void 0 ? 0 : _offsets$y;
  var _ref3 = typeof roundOffsets === "function" ? roundOffsets({
    x,
    y
  }) : {
    x,
    y
  };
  x = _ref3.x;
  y = _ref3.y;
  var hasX = offsets.hasOwnProperty("x");
  var hasY = offsets.hasOwnProperty("y");
  var sideX = left;
  var sideY = top;
  var win = window;
  if (adaptive) {
    var offsetParent = getOffsetParent(popper2);
    var heightProp = "clientHeight";
    var widthProp = "clientWidth";
    if (offsetParent === getWindow$1(popper2)) {
      offsetParent = getDocumentElement(popper2);
      if (getComputedStyle$1(offsetParent).position !== "static" && position === "absolute") {
        heightProp = "scrollHeight";
        widthProp = "scrollWidth";
      }
    }
    offsetParent = offsetParent;
    if (placement === top || (placement === left || placement === right) && variation === end) {
      sideY = bottom;
      var offsetY = isFixed && offsetParent === win && win.visualViewport ? win.visualViewport.height : (
        // $FlowFixMe[prop-missing]
        offsetParent[heightProp]
      );
      y -= offsetY - popperRect.height;
      y *= gpuAcceleration ? 1 : -1;
    }
    if (placement === left || (placement === top || placement === bottom) && variation === end) {
      sideX = right;
      var offsetX = isFixed && offsetParent === win && win.visualViewport ? win.visualViewport.width : (
        // $FlowFixMe[prop-missing]
        offsetParent[widthProp]
      );
      x -= offsetX - popperRect.width;
      x *= gpuAcceleration ? 1 : -1;
    }
  }
  var commonStyles = Object.assign({
    position
  }, adaptive && unsetSides);
  var _ref4 = roundOffsets === true ? roundOffsetsByDPR({
    x,
    y
  }, getWindow$1(popper2)) : {
    x,
    y
  };
  x = _ref4.x;
  y = _ref4.y;
  if (gpuAcceleration) {
    var _Object$assign;
    return Object.assign({}, commonStyles, (_Object$assign = {}, _Object$assign[sideY] = hasY ? "0" : "", _Object$assign[sideX] = hasX ? "0" : "", _Object$assign.transform = (win.devicePixelRatio || 1) <= 1 ? "translate(" + x + "px, " + y + "px)" : "translate3d(" + x + "px, " + y + "px, 0)", _Object$assign));
  }
  return Object.assign({}, commonStyles, (_Object$assign2 = {}, _Object$assign2[sideY] = hasY ? y + "px" : "", _Object$assign2[sideX] = hasX ? x + "px" : "", _Object$assign2.transform = "", _Object$assign2));
}
function computeStyles(_ref5) {
  var state2 = _ref5.state, options = _ref5.options;
  var _options$gpuAccelerat = options.gpuAcceleration, gpuAcceleration = _options$gpuAccelerat === void 0 ? true : _options$gpuAccelerat, _options$adaptive = options.adaptive, adaptive = _options$adaptive === void 0 ? true : _options$adaptive, _options$roundOffsets = options.roundOffsets, roundOffsets = _options$roundOffsets === void 0 ? true : _options$roundOffsets;
  var commonStyles = {
    placement: getBasePlacement(state2.placement),
    variation: getVariation(state2.placement),
    popper: state2.elements.popper,
    popperRect: state2.rects.popper,
    gpuAcceleration,
    isFixed: state2.options.strategy === "fixed"
  };
  if (state2.modifiersData.popperOffsets != null) {
    state2.styles.popper = Object.assign({}, state2.styles.popper, mapToStyles(Object.assign({}, commonStyles, {
      offsets: state2.modifiersData.popperOffsets,
      position: state2.options.strategy,
      adaptive,
      roundOffsets
    })));
  }
  if (state2.modifiersData.arrow != null) {
    state2.styles.arrow = Object.assign({}, state2.styles.arrow, mapToStyles(Object.assign({}, commonStyles, {
      offsets: state2.modifiersData.arrow,
      position: "absolute",
      adaptive: false,
      roundOffsets
    })));
  }
  state2.attributes.popper = Object.assign({}, state2.attributes.popper, {
    "data-popper-placement": state2.placement
  });
}
const computeStyles$1 = {
  name: "computeStyles",
  enabled: true,
  phase: "beforeWrite",
  fn: computeStyles,
  data: {}
};
var passive = {
  passive: true
};
function effect(_ref) {
  var state2 = _ref.state, instance = _ref.instance, options = _ref.options;
  var _options$scroll = options.scroll, scroll = _options$scroll === void 0 ? true : _options$scroll, _options$resize = options.resize, resize = _options$resize === void 0 ? true : _options$resize;
  var window2 = getWindow$1(state2.elements.popper);
  var scrollParents = [].concat(state2.scrollParents.reference, state2.scrollParents.popper);
  if (scroll) {
    scrollParents.forEach(function(scrollParent) {
      scrollParent.addEventListener("scroll", instance.update, passive);
    });
  }
  if (resize) {
    window2.addEventListener("resize", instance.update, passive);
  }
  return function() {
    if (scroll) {
      scrollParents.forEach(function(scrollParent) {
        scrollParent.removeEventListener("scroll", instance.update, passive);
      });
    }
    if (resize) {
      window2.removeEventListener("resize", instance.update, passive);
    }
  };
}
const eventListeners = {
  name: "eventListeners",
  enabled: true,
  phase: "write",
  fn: function fn() {
  },
  effect,
  data: {}
};
var hash$1 = {
  left: "right",
  right: "left",
  bottom: "top",
  top: "bottom"
};
function getOppositePlacement(placement) {
  return placement.replace(/left|right|bottom|top/g, function(matched) {
    return hash$1[matched];
  });
}
var hash = {
  start: "end",
  end: "start"
};
function getOppositeVariationPlacement(placement) {
  return placement.replace(/start|end/g, function(matched) {
    return hash[matched];
  });
}
function getWindowScroll(node) {
  var win = getWindow$1(node);
  var scrollLeft = win.pageXOffset;
  var scrollTop = win.pageYOffset;
  return {
    scrollLeft,
    scrollTop
  };
}
function getWindowScrollBarX(element) {
  return getBoundingClientRect(getDocumentElement(element)).left + getWindowScroll(element).scrollLeft;
}
function getViewportRect(element, strategy) {
  var win = getWindow$1(element);
  var html = getDocumentElement(element);
  var visualViewport = win.visualViewport;
  var width = html.clientWidth;
  var height = html.clientHeight;
  var x = 0;
  var y = 0;
  if (visualViewport) {
    width = visualViewport.width;
    height = visualViewport.height;
    var layoutViewport = isLayoutViewport();
    if (layoutViewport || !layoutViewport && strategy === "fixed") {
      x = visualViewport.offsetLeft;
      y = visualViewport.offsetTop;
    }
  }
  return {
    width,
    height,
    x: x + getWindowScrollBarX(element),
    y
  };
}
function getDocumentRect(element) {
  var _element$ownerDocumen;
  var html = getDocumentElement(element);
  var winScroll = getWindowScroll(element);
  var body = (_element$ownerDocumen = element.ownerDocument) == null ? void 0 : _element$ownerDocumen.body;
  var width = max(html.scrollWidth, html.clientWidth, body ? body.scrollWidth : 0, body ? body.clientWidth : 0);
  var height = max(html.scrollHeight, html.clientHeight, body ? body.scrollHeight : 0, body ? body.clientHeight : 0);
  var x = -winScroll.scrollLeft + getWindowScrollBarX(element);
  var y = -winScroll.scrollTop;
  if (getComputedStyle$1(body || html).direction === "rtl") {
    x += max(html.clientWidth, body ? body.clientWidth : 0) - width;
  }
  return {
    width,
    height,
    x,
    y
  };
}
function isScrollParent(element) {
  var _getComputedStyle = getComputedStyle$1(element), overflow = _getComputedStyle.overflow, overflowX = _getComputedStyle.overflowX, overflowY = _getComputedStyle.overflowY;
  return /auto|scroll|overlay|hidden/.test(overflow + overflowY + overflowX);
}
function getScrollParent(node) {
  if (["html", "body", "#document"].indexOf(getNodeName(node)) >= 0) {
    return node.ownerDocument.body;
  }
  if (isHTMLElement(node) && isScrollParent(node)) {
    return node;
  }
  return getScrollParent(getParentNode(node));
}
function listScrollParents(element, list) {
  var _element$ownerDocumen;
  if (list === void 0) {
    list = [];
  }
  var scrollParent = getScrollParent(element);
  var isBody = scrollParent === ((_element$ownerDocumen = element.ownerDocument) == null ? void 0 : _element$ownerDocumen.body);
  var win = getWindow$1(scrollParent);
  var target = isBody ? [win].concat(win.visualViewport || [], isScrollParent(scrollParent) ? scrollParent : []) : scrollParent;
  var updatedList = list.concat(target);
  return isBody ? updatedList : (
    // $FlowFixMe[incompatible-call]: isBody tells us target will be an HTMLElement here
    updatedList.concat(listScrollParents(getParentNode(target)))
  );
}
function rectToClientRect(rect) {
  return Object.assign({}, rect, {
    left: rect.x,
    top: rect.y,
    right: rect.x + rect.width,
    bottom: rect.y + rect.height
  });
}
function getInnerBoundingClientRect(element, strategy) {
  var rect = getBoundingClientRect(element, false, strategy === "fixed");
  rect.top = rect.top + element.clientTop;
  rect.left = rect.left + element.clientLeft;
  rect.bottom = rect.top + element.clientHeight;
  rect.right = rect.left + element.clientWidth;
  rect.width = element.clientWidth;
  rect.height = element.clientHeight;
  rect.x = rect.left;
  rect.y = rect.top;
  return rect;
}
function getClientRectFromMixedType(element, clippingParent, strategy) {
  return clippingParent === viewport ? rectToClientRect(getViewportRect(element, strategy)) : isElement(clippingParent) ? getInnerBoundingClientRect(clippingParent, strategy) : rectToClientRect(getDocumentRect(getDocumentElement(element)));
}
function getClippingParents(element) {
  var clippingParents2 = listScrollParents(getParentNode(element));
  var canEscapeClipping = ["absolute", "fixed"].indexOf(getComputedStyle$1(element).position) >= 0;
  var clipperElement = canEscapeClipping && isHTMLElement(element) ? getOffsetParent(element) : element;
  if (!isElement(clipperElement)) {
    return [];
  }
  return clippingParents2.filter(function(clippingParent) {
    return isElement(clippingParent) && contains(clippingParent, clipperElement) && getNodeName(clippingParent) !== "body";
  });
}
function getClippingRect(element, boundary, rootBoundary, strategy) {
  var mainClippingParents = boundary === "clippingParents" ? getClippingParents(element) : [].concat(boundary);
  var clippingParents2 = [].concat(mainClippingParents, [rootBoundary]);
  var firstClippingParent = clippingParents2[0];
  var clippingRect = clippingParents2.reduce(function(accRect, clippingParent) {
    var rect = getClientRectFromMixedType(element, clippingParent, strategy);
    accRect.top = max(rect.top, accRect.top);
    accRect.right = min(rect.right, accRect.right);
    accRect.bottom = min(rect.bottom, accRect.bottom);
    accRect.left = max(rect.left, accRect.left);
    return accRect;
  }, getClientRectFromMixedType(element, firstClippingParent, strategy));
  clippingRect.width = clippingRect.right - clippingRect.left;
  clippingRect.height = clippingRect.bottom - clippingRect.top;
  clippingRect.x = clippingRect.left;
  clippingRect.y = clippingRect.top;
  return clippingRect;
}
function computeOffsets(_ref) {
  var reference2 = _ref.reference, element = _ref.element, placement = _ref.placement;
  var basePlacement = placement ? getBasePlacement(placement) : null;
  var variation = placement ? getVariation(placement) : null;
  var commonX = reference2.x + reference2.width / 2 - element.width / 2;
  var commonY = reference2.y + reference2.height / 2 - element.height / 2;
  var offsets;
  switch (basePlacement) {
    case top:
      offsets = {
        x: commonX,
        y: reference2.y - element.height
      };
      break;
    case bottom:
      offsets = {
        x: commonX,
        y: reference2.y + reference2.height
      };
      break;
    case right:
      offsets = {
        x: reference2.x + reference2.width,
        y: commonY
      };
      break;
    case left:
      offsets = {
        x: reference2.x - element.width,
        y: commonY
      };
      break;
    default:
      offsets = {
        x: reference2.x,
        y: reference2.y
      };
  }
  var mainAxis = basePlacement ? getMainAxisFromPlacement(basePlacement) : null;
  if (mainAxis != null) {
    var len = mainAxis === "y" ? "height" : "width";
    switch (variation) {
      case start:
        offsets[mainAxis] = offsets[mainAxis] - (reference2[len] / 2 - element[len] / 2);
        break;
      case end:
        offsets[mainAxis] = offsets[mainAxis] + (reference2[len] / 2 - element[len] / 2);
        break;
    }
  }
  return offsets;
}
function detectOverflow(state2, options) {
  if (options === void 0) {
    options = {};
  }
  var _options = options, _options$placement = _options.placement, placement = _options$placement === void 0 ? state2.placement : _options$placement, _options$strategy = _options.strategy, strategy = _options$strategy === void 0 ? state2.strategy : _options$strategy, _options$boundary = _options.boundary, boundary = _options$boundary === void 0 ? clippingParents : _options$boundary, _options$rootBoundary = _options.rootBoundary, rootBoundary = _options$rootBoundary === void 0 ? viewport : _options$rootBoundary, _options$elementConte = _options.elementContext, elementContext = _options$elementConte === void 0 ? popper : _options$elementConte, _options$altBoundary = _options.altBoundary, altBoundary = _options$altBoundary === void 0 ? false : _options$altBoundary, _options$padding = _options.padding, padding = _options$padding === void 0 ? 0 : _options$padding;
  var paddingObject = mergePaddingObject(typeof padding !== "number" ? padding : expandToHashMap(padding, basePlacements));
  var altContext = elementContext === popper ? reference : popper;
  var popperRect = state2.rects.popper;
  var element = state2.elements[altBoundary ? altContext : elementContext];
  var clippingClientRect = getClippingRect(isElement(element) ? element : element.contextElement || getDocumentElement(state2.elements.popper), boundary, rootBoundary, strategy);
  var referenceClientRect = getBoundingClientRect(state2.elements.reference);
  var popperOffsets2 = computeOffsets({
    reference: referenceClientRect,
    element: popperRect,
    placement
  });
  var popperClientRect = rectToClientRect(Object.assign({}, popperRect, popperOffsets2));
  var elementClientRect = elementContext === popper ? popperClientRect : referenceClientRect;
  var overflowOffsets = {
    top: clippingClientRect.top - elementClientRect.top + paddingObject.top,
    bottom: elementClientRect.bottom - clippingClientRect.bottom + paddingObject.bottom,
    left: clippingClientRect.left - elementClientRect.left + paddingObject.left,
    right: elementClientRect.right - clippingClientRect.right + paddingObject.right
  };
  var offsetData = state2.modifiersData.offset;
  if (elementContext === popper && offsetData) {
    var offset2 = offsetData[placement];
    Object.keys(overflowOffsets).forEach(function(key) {
      var multiply = [right, bottom].indexOf(key) >= 0 ? 1 : -1;
      var axis = [top, bottom].indexOf(key) >= 0 ? "y" : "x";
      overflowOffsets[key] += offset2[axis] * multiply;
    });
  }
  return overflowOffsets;
}
function computeAutoPlacement(state2, options) {
  if (options === void 0) {
    options = {};
  }
  var _options = options, placement = _options.placement, boundary = _options.boundary, rootBoundary = _options.rootBoundary, padding = _options.padding, flipVariations = _options.flipVariations, _options$allowedAutoP = _options.allowedAutoPlacements, allowedAutoPlacements = _options$allowedAutoP === void 0 ? placements : _options$allowedAutoP;
  var variation = getVariation(placement);
  var placements$1 = variation ? flipVariations ? variationPlacements : variationPlacements.filter(function(placement2) {
    return getVariation(placement2) === variation;
  }) : basePlacements;
  var allowedPlacements = placements$1.filter(function(placement2) {
    return allowedAutoPlacements.indexOf(placement2) >= 0;
  });
  if (allowedPlacements.length === 0) {
    allowedPlacements = placements$1;
  }
  var overflows = allowedPlacements.reduce(function(acc, placement2) {
    acc[placement2] = detectOverflow(state2, {
      placement: placement2,
      boundary,
      rootBoundary,
      padding
    })[getBasePlacement(placement2)];
    return acc;
  }, {});
  return Object.keys(overflows).sort(function(a, b) {
    return overflows[a] - overflows[b];
  });
}
function getExpandedFallbackPlacements(placement) {
  if (getBasePlacement(placement) === auto) {
    return [];
  }
  var oppositePlacement = getOppositePlacement(placement);
  return [getOppositeVariationPlacement(placement), oppositePlacement, getOppositeVariationPlacement(oppositePlacement)];
}
function flip(_ref) {
  var state2 = _ref.state, options = _ref.options, name = _ref.name;
  if (state2.modifiersData[name]._skip) {
    return;
  }
  var _options$mainAxis = options.mainAxis, checkMainAxis = _options$mainAxis === void 0 ? true : _options$mainAxis, _options$altAxis = options.altAxis, checkAltAxis = _options$altAxis === void 0 ? true : _options$altAxis, specifiedFallbackPlacements = options.fallbackPlacements, padding = options.padding, boundary = options.boundary, rootBoundary = options.rootBoundary, altBoundary = options.altBoundary, _options$flipVariatio = options.flipVariations, flipVariations = _options$flipVariatio === void 0 ? true : _options$flipVariatio, allowedAutoPlacements = options.allowedAutoPlacements;
  var preferredPlacement = state2.options.placement;
  var basePlacement = getBasePlacement(preferredPlacement);
  var isBasePlacement = basePlacement === preferredPlacement;
  var fallbackPlacements = specifiedFallbackPlacements || (isBasePlacement || !flipVariations ? [getOppositePlacement(preferredPlacement)] : getExpandedFallbackPlacements(preferredPlacement));
  var placements2 = [preferredPlacement].concat(fallbackPlacements).reduce(function(acc, placement2) {
    return acc.concat(getBasePlacement(placement2) === auto ? computeAutoPlacement(state2, {
      placement: placement2,
      boundary,
      rootBoundary,
      padding,
      flipVariations,
      allowedAutoPlacements
    }) : placement2);
  }, []);
  var referenceRect = state2.rects.reference;
  var popperRect = state2.rects.popper;
  var checksMap = /* @__PURE__ */ new Map();
  var makeFallbackChecks = true;
  var firstFittingPlacement = placements2[0];
  for (var i = 0; i < placements2.length; i++) {
    var placement = placements2[i];
    var _basePlacement = getBasePlacement(placement);
    var isStartVariation = getVariation(placement) === start;
    var isVertical = [top, bottom].indexOf(_basePlacement) >= 0;
    var len = isVertical ? "width" : "height";
    var overflow = detectOverflow(state2, {
      placement,
      boundary,
      rootBoundary,
      altBoundary,
      padding
    });
    var mainVariationSide = isVertical ? isStartVariation ? right : left : isStartVariation ? bottom : top;
    if (referenceRect[len] > popperRect[len]) {
      mainVariationSide = getOppositePlacement(mainVariationSide);
    }
    var altVariationSide = getOppositePlacement(mainVariationSide);
    var checks = [];
    if (checkMainAxis) {
      checks.push(overflow[_basePlacement] <= 0);
    }
    if (checkAltAxis) {
      checks.push(overflow[mainVariationSide] <= 0, overflow[altVariationSide] <= 0);
    }
    if (checks.every(function(check) {
      return check;
    })) {
      firstFittingPlacement = placement;
      makeFallbackChecks = false;
      break;
    }
    checksMap.set(placement, checks);
  }
  if (makeFallbackChecks) {
    var numberOfChecks = flipVariations ? 3 : 1;
    var _loop = function _loop2(_i2) {
      var fittingPlacement = placements2.find(function(placement2) {
        var checks2 = checksMap.get(placement2);
        if (checks2) {
          return checks2.slice(0, _i2).every(function(check) {
            return check;
          });
        }
      });
      if (fittingPlacement) {
        firstFittingPlacement = fittingPlacement;
        return "break";
      }
    };
    for (var _i = numberOfChecks; _i > 0; _i--) {
      var _ret = _loop(_i);
      if (_ret === "break") break;
    }
  }
  if (state2.placement !== firstFittingPlacement) {
    state2.modifiersData[name]._skip = true;
    state2.placement = firstFittingPlacement;
    state2.reset = true;
  }
}
const flip$1 = {
  name: "flip",
  enabled: true,
  phase: "main",
  fn: flip,
  requiresIfExists: ["offset"],
  data: {
    _skip: false
  }
};
function distanceAndSkiddingToXY(placement, rects, offset2) {
  var basePlacement = getBasePlacement(placement);
  var invertDistance = [left, top].indexOf(basePlacement) >= 0 ? -1 : 1;
  var _ref = typeof offset2 === "function" ? offset2(Object.assign({}, rects, {
    placement
  })) : offset2, skidding = _ref[0], distance = _ref[1];
  skidding = skidding || 0;
  distance = (distance || 0) * invertDistance;
  return [left, right].indexOf(basePlacement) >= 0 ? {
    x: distance,
    y: skidding
  } : {
    x: skidding,
    y: distance
  };
}
function offset(_ref2) {
  var state2 = _ref2.state, options = _ref2.options, name = _ref2.name;
  var _options$offset = options.offset, offset2 = _options$offset === void 0 ? [0, 0] : _options$offset;
  var data = placements.reduce(function(acc, placement) {
    acc[placement] = distanceAndSkiddingToXY(placement, state2.rects, offset2);
    return acc;
  }, {});
  var _data$state$placement = data[state2.placement], x = _data$state$placement.x, y = _data$state$placement.y;
  if (state2.modifiersData.popperOffsets != null) {
    state2.modifiersData.popperOffsets.x += x;
    state2.modifiersData.popperOffsets.y += y;
  }
  state2.modifiersData[name] = data;
}
const offset$1 = {
  name: "offset",
  enabled: true,
  phase: "main",
  requires: ["popperOffsets"],
  fn: offset
};
function popperOffsets(_ref) {
  var state2 = _ref.state, name = _ref.name;
  state2.modifiersData[name] = computeOffsets({
    reference: state2.rects.reference,
    element: state2.rects.popper,
    placement: state2.placement
  });
}
const popperOffsets$1 = {
  name: "popperOffsets",
  enabled: true,
  phase: "read",
  fn: popperOffsets,
  data: {}
};
function getAltAxis(axis) {
  return axis === "x" ? "y" : "x";
}
function preventOverflow(_ref) {
  var state2 = _ref.state, options = _ref.options, name = _ref.name;
  var _options$mainAxis = options.mainAxis, checkMainAxis = _options$mainAxis === void 0 ? true : _options$mainAxis, _options$altAxis = options.altAxis, checkAltAxis = _options$altAxis === void 0 ? false : _options$altAxis, boundary = options.boundary, rootBoundary = options.rootBoundary, altBoundary = options.altBoundary, padding = options.padding, _options$tether = options.tether, tether = _options$tether === void 0 ? true : _options$tether, _options$tetherOffset = options.tetherOffset, tetherOffset = _options$tetherOffset === void 0 ? 0 : _options$tetherOffset;
  var overflow = detectOverflow(state2, {
    boundary,
    rootBoundary,
    padding,
    altBoundary
  });
  var basePlacement = getBasePlacement(state2.placement);
  var variation = getVariation(state2.placement);
  var isBasePlacement = !variation;
  var mainAxis = getMainAxisFromPlacement(basePlacement);
  var altAxis = getAltAxis(mainAxis);
  var popperOffsets2 = state2.modifiersData.popperOffsets;
  var referenceRect = state2.rects.reference;
  var popperRect = state2.rects.popper;
  var tetherOffsetValue = typeof tetherOffset === "function" ? tetherOffset(Object.assign({}, state2.rects, {
    placement: state2.placement
  })) : tetherOffset;
  var normalizedTetherOffsetValue = typeof tetherOffsetValue === "number" ? {
    mainAxis: tetherOffsetValue,
    altAxis: tetherOffsetValue
  } : Object.assign({
    mainAxis: 0,
    altAxis: 0
  }, tetherOffsetValue);
  var offsetModifierState = state2.modifiersData.offset ? state2.modifiersData.offset[state2.placement] : null;
  var data = {
    x: 0,
    y: 0
  };
  if (!popperOffsets2) {
    return;
  }
  if (checkMainAxis) {
    var _offsetModifierState$;
    var mainSide = mainAxis === "y" ? top : left;
    var altSide = mainAxis === "y" ? bottom : right;
    var len = mainAxis === "y" ? "height" : "width";
    var offset2 = popperOffsets2[mainAxis];
    var min$1 = offset2 + overflow[mainSide];
    var max$1 = offset2 - overflow[altSide];
    var additive = tether ? -popperRect[len] / 2 : 0;
    var minLen = variation === start ? referenceRect[len] : popperRect[len];
    var maxLen = variation === start ? -popperRect[len] : -referenceRect[len];
    var arrowElement = state2.elements.arrow;
    var arrowRect = tether && arrowElement ? getLayoutRect(arrowElement) : {
      width: 0,
      height: 0
    };
    var arrowPaddingObject = state2.modifiersData["arrow#persistent"] ? state2.modifiersData["arrow#persistent"].padding : getFreshSideObject();
    var arrowPaddingMin = arrowPaddingObject[mainSide];
    var arrowPaddingMax = arrowPaddingObject[altSide];
    var arrowLen = within(0, referenceRect[len], arrowRect[len]);
    var minOffset = isBasePlacement ? referenceRect[len] / 2 - additive - arrowLen - arrowPaddingMin - normalizedTetherOffsetValue.mainAxis : minLen - arrowLen - arrowPaddingMin - normalizedTetherOffsetValue.mainAxis;
    var maxOffset = isBasePlacement ? -referenceRect[len] / 2 + additive + arrowLen + arrowPaddingMax + normalizedTetherOffsetValue.mainAxis : maxLen + arrowLen + arrowPaddingMax + normalizedTetherOffsetValue.mainAxis;
    var arrowOffsetParent = state2.elements.arrow && getOffsetParent(state2.elements.arrow);
    var clientOffset = arrowOffsetParent ? mainAxis === "y" ? arrowOffsetParent.clientTop || 0 : arrowOffsetParent.clientLeft || 0 : 0;
    var offsetModifierValue = (_offsetModifierState$ = offsetModifierState == null ? void 0 : offsetModifierState[mainAxis]) != null ? _offsetModifierState$ : 0;
    var tetherMin = offset2 + minOffset - offsetModifierValue - clientOffset;
    var tetherMax = offset2 + maxOffset - offsetModifierValue;
    var preventedOffset = within(tether ? min(min$1, tetherMin) : min$1, offset2, tether ? max(max$1, tetherMax) : max$1);
    popperOffsets2[mainAxis] = preventedOffset;
    data[mainAxis] = preventedOffset - offset2;
  }
  if (checkAltAxis) {
    var _offsetModifierState$2;
    var _mainSide = mainAxis === "x" ? top : left;
    var _altSide = mainAxis === "x" ? bottom : right;
    var _offset = popperOffsets2[altAxis];
    var _len = altAxis === "y" ? "height" : "width";
    var _min = _offset + overflow[_mainSide];
    var _max = _offset - overflow[_altSide];
    var isOriginSide = [top, left].indexOf(basePlacement) !== -1;
    var _offsetModifierValue = (_offsetModifierState$2 = offsetModifierState == null ? void 0 : offsetModifierState[altAxis]) != null ? _offsetModifierState$2 : 0;
    var _tetherMin = isOriginSide ? _min : _offset - referenceRect[_len] - popperRect[_len] - _offsetModifierValue + normalizedTetherOffsetValue.altAxis;
    var _tetherMax = isOriginSide ? _offset + referenceRect[_len] + popperRect[_len] - _offsetModifierValue - normalizedTetherOffsetValue.altAxis : _max;
    var _preventedOffset = tether && isOriginSide ? withinMaxClamp(_tetherMin, _offset, _tetherMax) : within(tether ? _tetherMin : _min, _offset, tether ? _tetherMax : _max);
    popperOffsets2[altAxis] = _preventedOffset;
    data[altAxis] = _preventedOffset - _offset;
  }
  state2.modifiersData[name] = data;
}
const preventOverflow$1 = {
  name: "preventOverflow",
  enabled: true,
  phase: "main",
  fn: preventOverflow,
  requiresIfExists: ["offset"]
};
function getHTMLElementScroll(element) {
  return {
    scrollLeft: element.scrollLeft,
    scrollTop: element.scrollTop
  };
}
function getNodeScroll(node) {
  if (node === getWindow$1(node) || !isHTMLElement(node)) {
    return getWindowScroll(node);
  } else {
    return getHTMLElementScroll(node);
  }
}
function isElementScaled(element) {
  var rect = element.getBoundingClientRect();
  var scaleX = round(rect.width) / element.offsetWidth || 1;
  var scaleY = round(rect.height) / element.offsetHeight || 1;
  return scaleX !== 1 || scaleY !== 1;
}
function getCompositeRect(elementOrVirtualElement, offsetParent, isFixed) {
  if (isFixed === void 0) {
    isFixed = false;
  }
  var isOffsetParentAnElement = isHTMLElement(offsetParent);
  var offsetParentIsScaled = isHTMLElement(offsetParent) && isElementScaled(offsetParent);
  var documentElement = getDocumentElement(offsetParent);
  var rect = getBoundingClientRect(elementOrVirtualElement, offsetParentIsScaled, isFixed);
  var scroll = {
    scrollLeft: 0,
    scrollTop: 0
  };
  var offsets = {
    x: 0,
    y: 0
  };
  if (isOffsetParentAnElement || !isOffsetParentAnElement && !isFixed) {
    if (getNodeName(offsetParent) !== "body" || // https://github.com/popperjs/popper-core/issues/1078
    isScrollParent(documentElement)) {
      scroll = getNodeScroll(offsetParent);
    }
    if (isHTMLElement(offsetParent)) {
      offsets = getBoundingClientRect(offsetParent, true);
      offsets.x += offsetParent.clientLeft;
      offsets.y += offsetParent.clientTop;
    } else if (documentElement) {
      offsets.x = getWindowScrollBarX(documentElement);
    }
  }
  return {
    x: rect.left + scroll.scrollLeft - offsets.x,
    y: rect.top + scroll.scrollTop - offsets.y,
    width: rect.width,
    height: rect.height
  };
}
function order(modifiers) {
  var map2 = /* @__PURE__ */ new Map();
  var visited = /* @__PURE__ */ new Set();
  var result = [];
  modifiers.forEach(function(modifier) {
    map2.set(modifier.name, modifier);
  });
  function sort(modifier) {
    visited.add(modifier.name);
    var requires = [].concat(modifier.requires || [], modifier.requiresIfExists || []);
    requires.forEach(function(dep) {
      if (!visited.has(dep)) {
        var depModifier = map2.get(dep);
        if (depModifier) {
          sort(depModifier);
        }
      }
    });
    result.push(modifier);
  }
  modifiers.forEach(function(modifier) {
    if (!visited.has(modifier.name)) {
      sort(modifier);
    }
  });
  return result;
}
function orderModifiers(modifiers) {
  var orderedModifiers = order(modifiers);
  return modifierPhases.reduce(function(acc, phase) {
    return acc.concat(orderedModifiers.filter(function(modifier) {
      return modifier.phase === phase;
    }));
  }, []);
}
function debounce(fn2) {
  var pending;
  return function() {
    if (!pending) {
      pending = new Promise(function(resolve) {
        Promise.resolve().then(function() {
          pending = void 0;
          resolve(fn2());
        });
      });
    }
    return pending;
  };
}
function mergeByName(modifiers) {
  var merged = modifiers.reduce(function(merged2, current) {
    var existing = merged2[current.name];
    merged2[current.name] = existing ? Object.assign({}, existing, current, {
      options: Object.assign({}, existing.options, current.options),
      data: Object.assign({}, existing.data, current.data)
    }) : current;
    return merged2;
  }, {});
  return Object.keys(merged).map(function(key) {
    return merged[key];
  });
}
var DEFAULT_OPTIONS = {
  placement: "bottom",
  modifiers: [],
  strategy: "absolute"
};
function areValidElements() {
  for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
    args[_key] = arguments[_key];
  }
  return !args.some(function(element) {
    return !(element && typeof element.getBoundingClientRect === "function");
  });
}
function popperGenerator(generatorOptions) {
  if (generatorOptions === void 0) {
    generatorOptions = {};
  }
  var _generatorOptions = generatorOptions, _generatorOptions$def = _generatorOptions.defaultModifiers, defaultModifiers2 = _generatorOptions$def === void 0 ? [] : _generatorOptions$def, _generatorOptions$def2 = _generatorOptions.defaultOptions, defaultOptions = _generatorOptions$def2 === void 0 ? DEFAULT_OPTIONS : _generatorOptions$def2;
  return function createPopper2(reference2, popper2, options) {
    if (options === void 0) {
      options = defaultOptions;
    }
    var state2 = {
      placement: "bottom",
      orderedModifiers: [],
      options: Object.assign({}, DEFAULT_OPTIONS, defaultOptions),
      modifiersData: {},
      elements: {
        reference: reference2,
        popper: popper2
      },
      attributes: {},
      styles: {}
    };
    var effectCleanupFns = [];
    var isDestroyed = false;
    var instance = {
      state: state2,
      setOptions: function setOptions(setOptionsAction) {
        var options2 = typeof setOptionsAction === "function" ? setOptionsAction(state2.options) : setOptionsAction;
        cleanupModifierEffects();
        state2.options = Object.assign({}, defaultOptions, state2.options, options2);
        state2.scrollParents = {
          reference: isElement(reference2) ? listScrollParents(reference2) : reference2.contextElement ? listScrollParents(reference2.contextElement) : [],
          popper: listScrollParents(popper2)
        };
        var orderedModifiers = orderModifiers(mergeByName([].concat(defaultModifiers2, state2.options.modifiers)));
        state2.orderedModifiers = orderedModifiers.filter(function(m) {
          return m.enabled;
        });
        runModifierEffects();
        return instance.update();
      },
      // Sync update – it will always be executed, even if not necessary. This
      // is useful for low frequency updates where sync behavior simplifies the
      // logic.
      // For high frequency updates (e.g. `resize` and `scroll` events), always
      // prefer the async Popper#update method
      forceUpdate: function forceUpdate() {
        if (isDestroyed) {
          return;
        }
        var _state$elements = state2.elements, reference3 = _state$elements.reference, popper3 = _state$elements.popper;
        if (!areValidElements(reference3, popper3)) {
          return;
        }
        state2.rects = {
          reference: getCompositeRect(reference3, getOffsetParent(popper3), state2.options.strategy === "fixed"),
          popper: getLayoutRect(popper3)
        };
        state2.reset = false;
        state2.placement = state2.options.placement;
        state2.orderedModifiers.forEach(function(modifier) {
          return state2.modifiersData[modifier.name] = Object.assign({}, modifier.data);
        });
        for (var index = 0; index < state2.orderedModifiers.length; index++) {
          if (state2.reset === true) {
            state2.reset = false;
            index = -1;
            continue;
          }
          var _state$orderedModifie = state2.orderedModifiers[index], fn2 = _state$orderedModifie.fn, _state$orderedModifie2 = _state$orderedModifie.options, _options = _state$orderedModifie2 === void 0 ? {} : _state$orderedModifie2, name = _state$orderedModifie.name;
          if (typeof fn2 === "function") {
            state2 = fn2({
              state: state2,
              options: _options,
              name,
              instance
            }) || state2;
          }
        }
      },
      // Async and optimistically optimized update – it will not be executed if
      // not necessary (debounced to run at most once-per-tick)
      update: debounce(function() {
        return new Promise(function(resolve) {
          instance.forceUpdate();
          resolve(state2);
        });
      }),
      destroy: function destroy() {
        cleanupModifierEffects();
        isDestroyed = true;
      }
    };
    if (!areValidElements(reference2, popper2)) {
      return instance;
    }
    instance.setOptions(options).then(function(state3) {
      if (!isDestroyed && options.onFirstUpdate) {
        options.onFirstUpdate(state3);
      }
    });
    function runModifierEffects() {
      state2.orderedModifiers.forEach(function(_ref) {
        var name = _ref.name, _ref$options = _ref.options, options2 = _ref$options === void 0 ? {} : _ref$options, effect2 = _ref.effect;
        if (typeof effect2 === "function") {
          var cleanupFn = effect2({
            state: state2,
            name,
            instance,
            options: options2
          });
          var noopFn2 = function noopFn3() {
          };
          effectCleanupFns.push(cleanupFn || noopFn2);
        }
      });
    }
    function cleanupModifierEffects() {
      effectCleanupFns.forEach(function(fn2) {
        return fn2();
      });
      effectCleanupFns = [];
    }
    return instance;
  };
}
var defaultModifiers = [eventListeners, popperOffsets$1, computeStyles$1, applyStyles$1];
var createPopper = /* @__PURE__ */ popperGenerator({
  defaultModifiers
});
function toInteger(value) {
  return parseInt(`${value}`, 10);
}
function toString(value) {
  return value !== void 0 && value !== null ? `${value}` : "";
}
function getValueInRange(value, max2, min2 = 0) {
  return Math.max(Math.min(value, max2), min2);
}
function isString(value) {
  return typeof value === "string";
}
function isNumber(value) {
  return !isNaN(toInteger(value));
}
function isInteger(value) {
  return typeof value === "number" && isFinite(value) && Math.floor(value) === value;
}
function isDefined(value) {
  return value !== void 0 && value !== null;
}
function isPromise(v) {
  return v && v.then;
}
function padNumber(value) {
  if (isNumber(value)) {
    return `0${value}`.slice(-2);
  } else {
    return "";
  }
}
function regExpEscape(text) {
  return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
}
function hasClassName(element, className) {
  return element && element.className && element.className.split && element.className.split(/\s+/).indexOf(className) >= 0;
}
function closest(element, selector) {
  if (!selector) {
    return null;
  }
  if (typeof element.closest === "undefined") {
    return null;
  }
  return element.closest(selector);
}
function reflow(element) {
  return (element || document.body).getBoundingClientRect();
}
function runInZone(zone) {
  return (source) => {
    return new Observable((observer) => {
      const next = (value) => zone.run(() => observer.next(value));
      const error = (e) => zone.run(() => observer.error(e));
      const complete = () => zone.run(() => observer.complete());
      return source.subscribe({ next, error, complete });
    });
  };
}
function removeAccents(str) {
  return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}
function getTransitionDurationMs(element) {
  const { transitionDelay, transitionDuration } = window.getComputedStyle(element);
  const transitionDelaySec = parseFloat(transitionDelay);
  const transitionDurationSec = parseFloat(transitionDuration);
  return (transitionDelaySec + transitionDurationSec) * 1e3;
}
const environment = {
  animation: true,
  transitionTimerDelayMs: 5
};
const noopFn = () => {
};
const { transitionTimerDelayMs } = environment;
const runningTransitions = /* @__PURE__ */ new Map();
const ngbRunTransition = (zone, element, startFn, options) => {
  let context = options.context || {};
  const running = runningTransitions.get(element);
  if (running) {
    switch (options.runningTransition) {
      // If there is one running and we want for it to 'continue' to run, we have to cancel the new one.
      // We're not emitting any values, but simply completing the observable (EMPTY).
      case "continue":
        return EMPTY;
      // If there is one running and we want for it to 'stop', we have to complete the running one.
      // We're simply completing the running one and not emitting any values and merging newly provided context
      // with the one coming from currently running transition.
      case "stop":
        zone.run(() => running.transition$.complete());
        context = Object.assign(running.context, context);
        runningTransitions.delete(element);
    }
  }
  const endFn = startFn(element, options.animation, context) || noopFn;
  if (!options.animation || window.getComputedStyle(element).transitionProperty === "none") {
    zone.run(() => endFn());
    return of(void 0).pipe(runInZone(zone));
  }
  const transition$ = new Subject();
  const finishTransition$ = new Subject();
  const stop$ = transition$.pipe(endWith(true));
  runningTransitions.set(element, {
    transition$,
    complete: () => {
      finishTransition$.next();
      finishTransition$.complete();
    },
    context
  });
  const transitionDurationMs = getTransitionDurationMs(element);
  zone.runOutsideAngular(() => {
    const transitionEnd$ = fromEvent(element, "transitionend").pipe(takeUntil(stop$), filter(({ target }) => target === element));
    const timer$ = timer(transitionDurationMs + transitionTimerDelayMs).pipe(takeUntil(stop$));
    race(timer$, transitionEnd$, finishTransition$).pipe(takeUntil(stop$)).subscribe(() => {
      runningTransitions.delete(element);
      zone.run(() => {
        endFn();
        transition$.next();
        transition$.complete();
      });
    });
  });
  return transition$.asObservable();
};
const ngbCompleteTransition = (element) => {
  runningTransitions.get(element)?.complete();
};
function measureCollapsingElementHeightPx(element) {
  if (typeof navigator === "undefined") {
    return "0px";
  }
  const { classList } = element;
  const hasShownClass = classList.contains("show");
  if (!hasShownClass) {
    classList.add("show");
  }
  element.style.height = "";
  const height = element.getBoundingClientRect().height + "px";
  if (!hasShownClass) {
    classList.remove("show");
  }
  return height;
}
const ngbCollapsingTransition = (element, animation, context) => {
  let { direction, maxHeight } = context;
  const { classList } = element;
  function setInitialClasses() {
    classList.add("collapse");
    if (direction === "show") {
      classList.add("show");
    } else {
      classList.remove("show");
    }
  }
  if (!animation) {
    setInitialClasses();
    return;
  }
  if (!maxHeight) {
    maxHeight = measureCollapsingElementHeightPx(element);
    context.maxHeight = maxHeight;
    element.style.height = direction !== "show" ? maxHeight : "0px";
    classList.remove("collapse");
    classList.remove("collapsing");
    classList.remove("show");
    reflow(element);
    classList.add("collapsing");
  }
  element.style.height = direction === "show" ? maxHeight : "0px";
  return () => {
    setInitialClasses();
    classList.remove("collapsing");
    element.style.height = "";
  };
};
class NgbConfig {
  constructor() {
    this.animation = environment.animation;
  }
}
NgbConfig.ɵfac = __ngDeclareFactory({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: NgbConfig, deps: [], target: FactoryTarget.Injectable });
NgbConfig.ɵprov = __ngDeclareInjectable({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: NgbConfig, providedIn: "root" });
__ngDeclareClassMetadata({ type: NgbConfig, decorators: [{
  type: Injectable,
  args: [{ providedIn: "root" }]
}] });
class NgbAccordionConfig {
  constructor(_ngbConfig) {
    this._ngbConfig = _ngbConfig;
    this.closeOthers = false;
  }
  get animation() {
    return this._animation === void 0 ? this._ngbConfig.animation : this._animation;
  }
  set animation(animation) {
    this._animation = animation;
  }
}
NgbAccordionConfig.ɵfac = __ngDeclareFactory({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: NgbAccordionConfig, deps: [{ token: NgbConfig }], target: FactoryTarget.Injectable });
NgbAccordionConfig.ɵprov = __ngDeclareInjectable({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: NgbAccordionConfig, providedIn: "root" });
__ngDeclareClassMetadata({ type: NgbAccordionConfig, decorators: [{
  type: Injectable,
  args: [{ providedIn: "root" }]
}], ctorParameters: function() {
  return [{ type: NgbConfig }];
} });
let nextId$4 = 0;
class NgbPanelHeader {
  constructor(templateRef) {
    this.templateRef = templateRef;
  }
}
NgbPanelHeader.ɵfac = __ngDeclareFactory({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: NgbPanelHeader, deps: [{ token: TemplateRef }], target: FactoryTarget.Directive });
NgbPanelHeader.ɵdir = __ngDeclareDirective({ minVersion: "12.0.0", version: "13.0.3", type: NgbPanelHeader, selector: "ng-template[ngbPanelHeader]", ngImport: i0 });
__ngDeclareClassMetadata({ type: NgbPanelHeader, decorators: [{
  type: Directive,
  args: [{ selector: "ng-template[ngbPanelHeader]" }]
}], ctorParameters: function() {
  return [{ type: TemplateRef }];
} });
class NgbPanelTitle {
  constructor(templateRef) {
    this.templateRef = templateRef;
  }
}
NgbPanelTitle.ɵfac = __ngDeclareFactory({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: NgbPanelTitle, deps: [{ token: TemplateRef }], target: FactoryTarget.Directive });
NgbPanelTitle.ɵdir = __ngDeclareDirective({ minVersion: "12.0.0", version: "13.0.3", type: NgbPanelTitle, selector: "ng-template[ngbPanelTitle]", ngImport: i0 });
__ngDeclareClassMetadata({ type: NgbPanelTitle, decorators: [{
  type: Directive,
  args: [{ selector: "ng-template[ngbPanelTitle]" }]
}], ctorParameters: function() {
  return [{ type: TemplateRef }];
} });
class NgbPanelContent {
  constructor(templateRef) {
    this.templateRef = templateRef;
  }
}
NgbPanelContent.ɵfac = __ngDeclareFactory({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: NgbPanelContent, deps: [{ token: TemplateRef }], target: FactoryTarget.Directive });
NgbPanelContent.ɵdir = __ngDeclareDirective({ minVersion: "12.0.0", version: "13.0.3", type: NgbPanelContent, selector: "ng-template[ngbPanelContent]", ngImport: i0 });
__ngDeclareClassMetadata({ type: NgbPanelContent, decorators: [{
  type: Directive,
  args: [{ selector: "ng-template[ngbPanelContent]" }]
}], ctorParameters: function() {
  return [{ type: TemplateRef }];
} });
class NgbPanel {
  constructor() {
    this.disabled = false;
    this.id = `ngb-panel-${nextId$4++}`;
    this.isOpen = false;
    this.initClassDone = false;
    this.transitionRunning = false;
    this.shown = new EventEmitter();
    this.hidden = new EventEmitter();
  }
  ngAfterContentChecked() {
    this.titleTpl = this.titleTpls.first;
    this.headerTpl = this.headerTpls.first;
    this.contentTpl = this.contentTpls.first;
  }
}
NgbPanel.ɵfac = __ngDeclareFactory({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: NgbPanel, deps: [], target: FactoryTarget.Directive });
NgbPanel.ɵdir = __ngDeclareDirective({ minVersion: "12.0.0", version: "13.0.3", type: NgbPanel, selector: "ngb-panel", inputs: { disabled: "disabled", id: "id", title: "title", type: "type", cardClass: "cardClass" }, outputs: { shown: "shown", hidden: "hidden" }, queries: [{ propertyName: "titleTpls", predicate: NgbPanelTitle }, { propertyName: "headerTpls", predicate: NgbPanelHeader }, { propertyName: "contentTpls", predicate: NgbPanelContent }], ngImport: i0 });
__ngDeclareClassMetadata({ type: NgbPanel, decorators: [{
  type: Directive,
  args: [{ selector: "ngb-panel" }]
}], propDecorators: { disabled: [{
  type: Input
}], id: [{
  type: Input
}], title: [{
  type: Input
}], type: [{
  type: Input
}], cardClass: [{
  type: Input
}], shown: [{
  type: Output
}], hidden: [{
  type: Output
}], titleTpls: [{
  type: ContentChildren,
  args: [NgbPanelTitle, { descendants: false }]
}], headerTpls: [{
  type: ContentChildren,
  args: [NgbPanelHeader, { descendants: false }]
}], contentTpls: [{
  type: ContentChildren,
  args: [NgbPanelContent, { descendants: false }]
}] } });
class NgbRefDirective {
  constructor(_El) {
    this._El = _El;
    this.ngbRef = new EventEmitter();
  }
  ngOnInit() {
    this.ngbRef.emit(this._El.nativeElement);
  }
  ngOnDestroy() {
    this.ngbRef.emit(null);
  }
}
NgbRefDirective.ɵfac = __ngDeclareFactory({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: NgbRefDirective, deps: [{ token: ElementRef }], target: FactoryTarget.Directive });
NgbRefDirective.ɵdir = __ngDeclareDirective({ minVersion: "12.0.0", version: "13.0.3", type: NgbRefDirective, selector: "[ngbRef]", outputs: { ngbRef: "ngbRef" }, ngImport: i0 });
__ngDeclareClassMetadata({ type: NgbRefDirective, decorators: [{
  type: Directive,
  args: [{ selector: "[ngbRef]" }]
}], ctorParameters: function() {
  return [{ type: ElementRef }];
}, propDecorators: { ngbRef: [{
  type: Output
}] } });
class NgbAccordion {
  constructor(config, _ngZone, _changeDetector) {
    this._ngZone = _ngZone;
    this._changeDetector = _changeDetector;
    this.activeIds = [];
    this.destroyOnHide = true;
    this.panelChange = new EventEmitter();
    this.shown = new EventEmitter();
    this.hidden = new EventEmitter();
    this.animation = config.animation;
    this.type = config.type;
    this.closeOtherPanels = config.closeOthers;
  }
  /**
   * Checks if a panel with a given id is expanded.
   */
  isExpanded(panelId) {
    return this.activeIds.indexOf(panelId) > -1;
  }
  /**
   * Expands a panel with a given id.
   *
   * Has no effect if the panel is already expanded or disabled.
   */
  expand(panelId) {
    this._changeOpenState(this._findPanelById(panelId), true);
  }
  /**
   * Expands all panels, if `[closeOthers]` is `false`.
   *
   * If `[closeOthers]` is `true`, it will expand the first panel, unless there is already a panel opened.
   */
  expandAll() {
    if (this.closeOtherPanels) {
      if (this.activeIds.length === 0 && this.panels.length) {
        this._changeOpenState(this.panels.first, true);
      }
    } else {
      this.panels.forEach((panel) => this._changeOpenState(panel, true));
    }
  }
  /**
   * Collapses a panel with the given id.
   *
   * Has no effect if the panel is already collapsed or disabled.
   */
  collapse(panelId) {
    this._changeOpenState(this._findPanelById(panelId), false);
  }
  /**
   * Collapses all opened panels.
   */
  collapseAll() {
    this.panels.forEach((panel) => {
      this._changeOpenState(panel, false);
    });
  }
  /**
   * Toggles a panel with the given id.
   *
   * Has no effect if the panel is disabled.
   */
  toggle(panelId) {
    const panel = this._findPanelById(panelId);
    if (panel) {
      this._changeOpenState(panel, !panel.isOpen);
    }
  }
  ngAfterContentChecked() {
    if (isString(this.activeIds)) {
      this.activeIds = this.activeIds.split(/\s*,\s*/);
    }
    this.panels.forEach((panel) => {
      panel.isOpen = !panel.disabled && this.activeIds.indexOf(panel.id) > -1;
    });
    if (this.activeIds.length > 1 && this.closeOtherPanels) {
      this._closeOthers(this.activeIds[0], false);
      this._updateActiveIds();
    }
    this._ngZone.onStable.pipe(take(1)).subscribe(() => {
      this.panels.forEach((panel) => {
        const panelElement = panel.panelDiv;
        if (panelElement) {
          if (!panel.initClassDone) {
            panel.initClassDone = true;
            ngbRunTransition(this._ngZone, panelElement, ngbCollapsingTransition, {
              animation: false,
              runningTransition: "continue",
              context: { direction: panel.isOpen ? "show" : "hide" }
            });
          }
        } else {
          panel.initClassDone = false;
        }
      });
    });
  }
  _changeOpenState(panel, nextState) {
    if (panel != null && !panel.disabled && panel.isOpen !== nextState) {
      let defaultPrevented = false;
      this.panelChange.emit({ panelId: panel.id, nextState, preventDefault: () => {
        defaultPrevented = true;
      } });
      if (!defaultPrevented) {
        panel.isOpen = nextState;
        panel.transitionRunning = true;
        if (nextState && this.closeOtherPanels) {
          this._closeOthers(panel.id);
        }
        this._updateActiveIds();
        this._runTransitions(this.animation);
      }
    }
  }
  _closeOthers(panelId, enableTransition = true) {
    this.panels.forEach((panel) => {
      if (panel.id !== panelId && panel.isOpen) {
        panel.isOpen = false;
        panel.transitionRunning = enableTransition;
      }
    });
  }
  _findPanelById(panelId) {
    return this.panels.find((p) => p.id === panelId) || null;
  }
  _updateActiveIds() {
    this.activeIds = this.panels.filter((panel) => panel.isOpen && !panel.disabled).map((panel) => panel.id);
  }
  _runTransitions(animation) {
    this._changeDetector.detectChanges();
    this.panels.forEach((panel) => {
      if (panel.transitionRunning) {
        const panelElement = panel.panelDiv;
        ngbRunTransition(this._ngZone, panelElement, ngbCollapsingTransition, {
          animation,
          runningTransition: "stop",
          context: { direction: panel.isOpen ? "show" : "hide" }
        }).subscribe(() => {
          panel.transitionRunning = false;
          const { id } = panel;
          if (panel.isOpen) {
            panel.shown.emit();
            this.shown.emit(id);
          } else {
            panel.hidden.emit();
            this.hidden.emit(id);
          }
        });
      }
    });
  }
}
NgbAccordion.ɵfac = __ngDeclareFactory({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: NgbAccordion, deps: [{ token: NgbAccordionConfig }, { token: NgZone }, { token: ChangeDetectorRef }], target: FactoryTarget.Component });
NgbAccordion.ɵcmp = __ngDeclareComponent({ minVersion: "12.0.0", version: "13.0.3", type: NgbAccordion, selector: "ngb-accordion", inputs: { animation: "animation", activeIds: "activeIds", closeOtherPanels: ["closeOthers", "closeOtherPanels"], destroyOnHide: "destroyOnHide", type: "type" }, outputs: { panelChange: "panelChange", shown: "shown", hidden: "hidden" }, host: { attributes: { "role": "tablist" }, properties: { "attr.aria-multiselectable": "!closeOtherPanels" }, classAttribute: "accordion" }, queries: [{ propertyName: "panels", predicate: NgbPanel }], exportAs: ["ngbAccordion"], ngImport: i0, template: `
    <ng-template #t ngbPanelHeader let-panel>
      <button class="accordion-button" [ngbPanelToggle]="panel">
        {{panel.title}}<ng-template [ngTemplateOutlet]="panel.titleTpl?.templateRef"></ng-template>
      </button>
    </ng-template>
    <ng-template ngFor let-panel [ngForOf]="panels">
      <div [class]="'accordion-item ' + (panel.cardClass || '')">
        <div role="tab" id="{{panel.id}}-header" [class]="'accordion-header ' + (panel.type ? 'bg-'+panel.type: type ? 'bg-'+type : '')">
          <ng-template [ngTemplateOutlet]="panel.headerTpl?.templateRef || t"
                       [ngTemplateOutletContext]="{$implicit: panel, opened: panel.isOpen}"></ng-template>
        </div>
        <div id="{{panel.id}}" (ngbRef)="panel.panelDiv = $event" role="tabpanel" [attr.aria-labelledby]="panel.id + '-header'"
             *ngIf="!destroyOnHide || panel.isOpen || panel.transitionRunning">
          <div class="accordion-body">
            <ng-template [ngTemplateOutlet]="panel.contentTpl?.templateRef || null"></ng-template>
          </div>
        </div>
      </div>
    </ng-template>
  `, isInline: true, directives: [{ type: forwardRef(function() {
  return NgbPanelHeader;
}), selector: "ng-template[ngbPanelHeader]" }, { type: forwardRef(function() {
  return NgbPanelToggle;
}), selector: "button[ngbPanelToggle]", inputs: ["ngbPanelToggle"] }, { type: forwardRef(function() {
  return NgTemplateOutlet;
}), selector: "[ngTemplateOutlet]", inputs: ["ngTemplateOutletContext", "ngTemplateOutlet"] }, { type: forwardRef(function() {
  return NgForOf;
}), selector: "[ngFor][ngForOf]", inputs: ["ngForOf", "ngForTrackBy", "ngForTemplate"] }, { type: forwardRef(function() {
  return NgIf;
}), selector: "[ngIf]", inputs: ["ngIf", "ngIfThen", "ngIfElse"] }, { type: forwardRef(function() {
  return NgbRefDirective;
}), selector: "[ngbRef]", outputs: ["ngbRef"] }], encapsulation: ViewEncapsulation$1.None });
__ngDeclareClassMetadata({ type: NgbAccordion, decorators: [{
  type: Component,
  args: [{
    selector: "ngb-accordion",
    exportAs: "ngbAccordion",
    encapsulation: ViewEncapsulation$1.None,
    host: { "class": "accordion", "role": "tablist", "[attr.aria-multiselectable]": "!closeOtherPanels" },
    template: `
    <ng-template #t ngbPanelHeader let-panel>
      <button class="accordion-button" [ngbPanelToggle]="panel">
        {{panel.title}}<ng-template [ngTemplateOutlet]="panel.titleTpl?.templateRef"></ng-template>
      </button>
    </ng-template>
    <ng-template ngFor let-panel [ngForOf]="panels">
      <div [class]="'accordion-item ' + (panel.cardClass || '')">
        <div role="tab" id="{{panel.id}}-header" [class]="'accordion-header ' + (panel.type ? 'bg-'+panel.type: type ? 'bg-'+type : '')">
          <ng-template [ngTemplateOutlet]="panel.headerTpl?.templateRef || t"
                       [ngTemplateOutletContext]="{$implicit: panel, opened: panel.isOpen}"></ng-template>
        </div>
        <div id="{{panel.id}}" (ngbRef)="panel.panelDiv = $event" role="tabpanel" [attr.aria-labelledby]="panel.id + '-header'"
             *ngIf="!destroyOnHide || panel.isOpen || panel.transitionRunning">
          <div class="accordion-body">
            <ng-template [ngTemplateOutlet]="panel.contentTpl?.templateRef || null"></ng-template>
          </div>
        </div>
      </div>
    </ng-template>
  `
  }]
}], ctorParameters: function() {
  return [{ type: NgbAccordionConfig }, { type: NgZone }, { type: ChangeDetectorRef }];
}, propDecorators: { panels: [{
  type: ContentChildren,
  args: [NgbPanel]
}], animation: [{
  type: Input
}], activeIds: [{
  type: Input
}], closeOtherPanels: [{
  type: Input,
  args: ["closeOthers"]
}], destroyOnHide: [{
  type: Input
}], type: [{
  type: Input
}], panelChange: [{
  type: Output
}], shown: [{
  type: Output
}], hidden: [{
  type: Output
}] } });
class NgbPanelToggle {
  constructor(accordion, panel) {
    this.accordion = accordion;
    this.panel = panel;
  }
  set ngbPanelToggle(panel) {
    if (panel) {
      this.panel = panel;
    }
  }
}
NgbPanelToggle.ɵfac = __ngDeclareFactory({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: NgbPanelToggle, deps: [{ token: NgbAccordion }, { token: NgbPanel, host: true, optional: true }], target: FactoryTarget.Directive });
NgbPanelToggle.ɵdir = __ngDeclareDirective({ minVersion: "12.0.0", version: "13.0.3", type: NgbPanelToggle, selector: "button[ngbPanelToggle]", inputs: { ngbPanelToggle: "ngbPanelToggle" }, host: { attributes: { "type": "button" }, listeners: { "click": "accordion.toggle(panel.id)" }, properties: { "disabled": "panel.disabled", "class.collapsed": "!panel.isOpen", "attr.aria-expanded": "panel.isOpen", "attr.aria-controls": "panel.id" } }, ngImport: i0 });
__ngDeclareClassMetadata({ type: NgbPanelToggle, decorators: [{
  type: Directive,
  args: [{
    selector: "button[ngbPanelToggle]",
    host: {
      "type": "button",
      "[disabled]": "panel.disabled",
      "[class.collapsed]": "!panel.isOpen",
      "[attr.aria-expanded]": "panel.isOpen",
      "[attr.aria-controls]": "panel.id",
      "(click)": "accordion.toggle(panel.id)"
    }
  }]
}], ctorParameters: function() {
  return [{ type: NgbAccordion }, { type: NgbPanel, decorators: [{
    type: Optional
  }, {
    type: Host
  }] }];
}, propDecorators: { ngbPanelToggle: [{
  type: Input
}] } });
const NGB_ACCORDION_DIRECTIVES = [NgbAccordion, NgbPanel, NgbPanelTitle, NgbPanelContent, NgbPanelHeader, NgbPanelToggle];
class NgbAccordionModule {
}
NgbAccordionModule.ɵfac = __ngDeclareFactory({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: NgbAccordionModule, deps: [], target: FactoryTarget.NgModule });
NgbAccordionModule.ɵmod = __ngDeclareNgModule({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: NgbAccordionModule, declarations: [NgbRefDirective, NgbAccordion, NgbPanel, NgbPanelTitle, NgbPanelContent, NgbPanelHeader, NgbPanelToggle], imports: [CommonModule], exports: [NgbAccordion, NgbPanel, NgbPanelTitle, NgbPanelContent, NgbPanelHeader, NgbPanelToggle] });
NgbAccordionModule.ɵinj = __ngDeclareInjector({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: NgbAccordionModule, imports: [[CommonModule]] });
__ngDeclareClassMetadata({ type: NgbAccordionModule, decorators: [{
  type: NgModule,
  args: [{
    declarations: [NgbRefDirective, ...NGB_ACCORDION_DIRECTIVES],
    exports: NGB_ACCORDION_DIRECTIVES,
    imports: [CommonModule]
  }]
}] });
const ngbAlertFadingTransition = ({ classList }) => {
  classList.remove("show");
};
class NgbAlertConfig {
  constructor(_ngbConfig) {
    this._ngbConfig = _ngbConfig;
    this.dismissible = true;
    this.type = "warning";
  }
  get animation() {
    return this._animation === void 0 ? this._ngbConfig.animation : this._animation;
  }
  set animation(animation) {
    this._animation = animation;
  }
}
NgbAlertConfig.ɵfac = __ngDeclareFactory({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: NgbAlertConfig, deps: [{ token: NgbConfig }], target: FactoryTarget.Injectable });
NgbAlertConfig.ɵprov = __ngDeclareInjectable({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: NgbAlertConfig, providedIn: "root" });
__ngDeclareClassMetadata({ type: NgbAlertConfig, decorators: [{
  type: Injectable,
  args: [{ providedIn: "root" }]
}], ctorParameters: function() {
  return [{ type: NgbConfig }];
} });
class NgbAlert {
  constructor(config, _renderer, _element, _zone) {
    this._renderer = _renderer;
    this._element = _element;
    this._zone = _zone;
    this.closed = new EventEmitter();
    this.dismissible = config.dismissible;
    this.type = config.type;
    this.animation = config.animation;
  }
  /**
   * Triggers alert closing programmatically (same as clicking on the close button (×)).
   *
   * The returned observable will emit and be completed once the closing transition has finished.
   * If the animations are turned off this happens synchronously.
   *
   * Alternatively you could listen or subscribe to the `(closed)` output
   *
   * @since 8.0.0
   */
  close() {
    const transition2 = ngbRunTransition(this._zone, this._element.nativeElement, ngbAlertFadingTransition, { animation: this.animation, runningTransition: "continue" });
    transition2.subscribe(() => this.closed.emit());
    return transition2;
  }
  ngOnChanges(changes) {
    const typeChange = changes["type"];
    if (typeChange && !typeChange.firstChange) {
      this._renderer.removeClass(this._element.nativeElement, `alert-${typeChange.previousValue}`);
      this._renderer.addClass(this._element.nativeElement, `alert-${typeChange.currentValue}`);
    }
  }
  ngOnInit() {
    this._renderer.addClass(this._element.nativeElement, `alert-${this.type}`);
  }
}
NgbAlert.ɵfac = __ngDeclareFactory({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: NgbAlert, deps: [{ token: NgbAlertConfig }, { token: Renderer2 }, { token: ElementRef }, { token: NgZone }], target: FactoryTarget.Component });
NgbAlert.ɵcmp = __ngDeclareComponent({ minVersion: "12.0.0", version: "13.0.3", type: NgbAlert, selector: "ngb-alert", inputs: { animation: "animation", dismissible: "dismissible", type: "type" }, outputs: { closed: "closed" }, host: { attributes: { "role": "alert" }, properties: { "class.fade": "animation", "class.alert-dismissible": "dismissible" }, classAttribute: "alert show" }, exportAs: ["ngbAlert"], usesOnChanges: true, ngImport: i0, template: `
    <ng-content></ng-content>
    <button *ngIf="dismissible" type="button" class="btn-close" aria-label="Close" i18n-aria-label="@@ngb.alert.close"
      (click)="close()">
    </button>
    `, isInline: true, styles: ["ngb-alert{display:block}\n"], directives: [{ type: NgIf, selector: "[ngIf]", inputs: ["ngIf", "ngIfThen", "ngIfElse"] }], changeDetection: ChangeDetectionStrategy.OnPush, encapsulation: ViewEncapsulation$1.None });
__ngDeclareClassMetadata({ type: NgbAlert, decorators: [{
  type: Component,
  args: [{ selector: "ngb-alert", exportAs: "ngbAlert", changeDetection: ChangeDetectionStrategy.OnPush, encapsulation: ViewEncapsulation$1.None, host: { "role": "alert", "class": "alert show", "[class.fade]": "animation", "[class.alert-dismissible]": "dismissible" }, template: `
    <ng-content></ng-content>
    <button *ngIf="dismissible" type="button" class="btn-close" aria-label="Close" i18n-aria-label="@@ngb.alert.close"
      (click)="close()">
    </button>
    `, styles: ["ngb-alert{display:block}\n"] }]
}], ctorParameters: function() {
  return [{ type: NgbAlertConfig }, { type: Renderer2 }, { type: ElementRef }, { type: NgZone }];
}, propDecorators: { animation: [{
  type: Input
}], dismissible: [{
  type: Input
}], type: [{
  type: Input
}], closed: [{
  type: Output
}] } });
class NgbAlertModule {
}
NgbAlertModule.ɵfac = __ngDeclareFactory({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: NgbAlertModule, deps: [], target: FactoryTarget.NgModule });
NgbAlertModule.ɵmod = __ngDeclareNgModule({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: NgbAlertModule, declarations: [NgbAlert], imports: [CommonModule], exports: [NgbAlert] });
NgbAlertModule.ɵinj = __ngDeclareInjector({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: NgbAlertModule, imports: [[CommonModule]] });
__ngDeclareClassMetadata({ type: NgbAlertModule, decorators: [{
  type: NgModule,
  args: [{ declarations: [NgbAlert], exports: [NgbAlert], imports: [CommonModule] }]
}] });
class NgbButtonLabel {
}
NgbButtonLabel.ɵfac = __ngDeclareFactory({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: NgbButtonLabel, deps: [], target: FactoryTarget.Directive });
NgbButtonLabel.ɵdir = __ngDeclareDirective({ minVersion: "12.0.0", version: "13.0.3", type: NgbButtonLabel, selector: "[ngbButtonLabel]", host: { properties: { "class.btn": "true", "class.active": "active", "class.disabled": "disabled", "class.focus": "focused" } }, ngImport: i0 });
__ngDeclareClassMetadata({ type: NgbButtonLabel, decorators: [{
  type: Directive,
  args: [{
    selector: "[ngbButtonLabel]",
    host: { "[class.btn]": "true", "[class.active]": "active", "[class.disabled]": "disabled", "[class.focus]": "focused" }
  }]
}] });
class NgbCheckBox {
  constructor(_label, _cd) {
    this._label = _label;
    this._cd = _cd;
    this.disabled = false;
    this.valueChecked = true;
    this.valueUnChecked = false;
    this.onChange = (_) => {
    };
    this.onTouched = () => {
    };
  }
  set focused(isFocused) {
    this._label.focused = isFocused;
    if (!isFocused) {
      this.onTouched();
    }
  }
  onInputChange($event) {
    const modelToPropagate = $event.target.checked ? this.valueChecked : this.valueUnChecked;
    this.onChange(modelToPropagate);
    this.onTouched();
    this.writeValue(modelToPropagate);
  }
  registerOnChange(fn2) {
    this.onChange = fn2;
  }
  registerOnTouched(fn2) {
    this.onTouched = fn2;
  }
  setDisabledState(isDisabled) {
    this.disabled = isDisabled;
    this._label.disabled = isDisabled;
  }
  writeValue(value) {
    this.checked = value === this.valueChecked;
    this._label.active = this.checked;
    this._cd.markForCheck();
  }
}
NgbCheckBox.ɵfac = __ngDeclareFactory({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: NgbCheckBox, deps: [{ token: NgbButtonLabel }, { token: ChangeDetectorRef }], target: FactoryTarget.Directive });
NgbCheckBox.ɵdir = __ngDeclareDirective({ minVersion: "12.0.0", version: "13.0.3", type: NgbCheckBox, selector: "[ngbButton][type=checkbox]", inputs: { disabled: "disabled", valueChecked: "valueChecked", valueUnChecked: "valueUnChecked" }, host: { listeners: { "change": "onInputChange($event)", "focus": "focused = true", "blur": "focused = false" }, properties: { "checked": "checked", "disabled": "disabled" } }, providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => NgbCheckBox), multi: true }], ngImport: i0 });
__ngDeclareClassMetadata({ type: NgbCheckBox, decorators: [{
  type: Directive,
  args: [{
    selector: "[ngbButton][type=checkbox]",
    host: {
      "[checked]": "checked",
      "[disabled]": "disabled",
      "(change)": "onInputChange($event)",
      "(focus)": "focused = true",
      "(blur)": "focused = false"
    },
    providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => NgbCheckBox), multi: true }]
  }]
}], ctorParameters: function() {
  return [{ type: NgbButtonLabel }, { type: ChangeDetectorRef }];
}, propDecorators: { disabled: [{
  type: Input
}], valueChecked: [{
  type: Input
}], valueUnChecked: [{
  type: Input
}] } });
let nextId$3 = 0;
class NgbRadioGroup {
  constructor() {
    this._radios = /* @__PURE__ */ new Set();
    this._value = null;
    this.name = `ngb-radio-${nextId$3++}`;
    this.onChange = (_) => {
    };
    this.onTouched = () => {
    };
  }
  get disabled() {
    return this._disabled;
  }
  set disabled(isDisabled) {
    this.setDisabledState(isDisabled);
  }
  onRadioChange(radio) {
    this.writeValue(radio.value);
    this.onChange(radio.value);
  }
  onRadioValueUpdate() {
    this._updateRadiosValue();
  }
  register(radio) {
    this._radios.add(radio);
  }
  registerOnChange(fn2) {
    this.onChange = fn2;
  }
  registerOnTouched(fn2) {
    this.onTouched = fn2;
  }
  setDisabledState(isDisabled) {
    this._disabled = isDisabled;
    this._updateRadiosDisabled();
  }
  unregister(radio) {
    this._radios.delete(radio);
  }
  writeValue(value) {
    this._value = value;
    this._updateRadiosValue();
  }
  _updateRadiosValue() {
    this._radios.forEach((radio) => radio.updateValue(this._value));
  }
  _updateRadiosDisabled() {
    this._radios.forEach((radio) => radio.updateDisabled());
  }
}
NgbRadioGroup.ɵfac = __ngDeclareFactory({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: NgbRadioGroup, deps: [], target: FactoryTarget.Directive });
NgbRadioGroup.ɵdir = __ngDeclareDirective({ minVersion: "12.0.0", version: "13.0.3", type: NgbRadioGroup, selector: "[ngbRadioGroup]", inputs: { name: "name" }, host: { attributes: { "role": "radiogroup" } }, providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => NgbRadioGroup), multi: true }], ngImport: i0 });
__ngDeclareClassMetadata({ type: NgbRadioGroup, decorators: [{
  type: Directive,
  args: [{
    selector: "[ngbRadioGroup]",
    host: { "role": "radiogroup" },
    providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => NgbRadioGroup), multi: true }]
  }]
}], propDecorators: { name: [{
  type: Input
}] } });
class NgbRadio {
  constructor(_group, _label, _renderer, _element, _cd) {
    this._group = _group;
    this._label = _label;
    this._renderer = _renderer;
    this._element = _element;
    this._cd = _cd;
    this._value = null;
    this._group.register(this);
    this.updateDisabled();
  }
  /**
   * The form control value when current radio button is checked.
   */
  set value(value) {
    this._value = value;
    const stringValue = value ? value.toString() : "";
    this._renderer.setProperty(this._element.nativeElement, "value", stringValue);
    this._group.onRadioValueUpdate();
  }
  /**
   * If `true`, current radio button will be disabled.
   */
  set disabled(isDisabled) {
    this._disabled = isDisabled !== false;
    this.updateDisabled();
  }
  set focused(isFocused) {
    if (this._label) {
      this._label.focused = isFocused;
    }
    if (!isFocused) {
      this._group.onTouched();
    }
  }
  get checked() {
    return this._checked;
  }
  get disabled() {
    return this._group.disabled || this._disabled;
  }
  get value() {
    return this._value;
  }
  get nameAttr() {
    return this.name || this._group.name;
  }
  ngOnDestroy() {
    this._group.unregister(this);
  }
  onChange() {
    this._group.onRadioChange(this);
  }
  updateValue(value) {
    if (this.value !== value) {
      this._cd.markForCheck();
    }
    this._checked = this.value === value;
    this._label.active = this._checked;
  }
  updateDisabled() {
    this._label.disabled = this.disabled;
  }
}
NgbRadio.ɵfac = __ngDeclareFactory({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: NgbRadio, deps: [{ token: NgbRadioGroup }, { token: NgbButtonLabel }, { token: Renderer2 }, { token: ElementRef }, { token: ChangeDetectorRef }], target: FactoryTarget.Directive });
NgbRadio.ɵdir = __ngDeclareDirective({ minVersion: "12.0.0", version: "13.0.3", type: NgbRadio, selector: "[ngbButton][type=radio]", inputs: { name: "name", value: "value", disabled: "disabled" }, host: { listeners: { "change": "onChange()", "focus": "focused = true", "blur": "focused = false" }, properties: { "checked": "checked", "disabled": "disabled", "name": "nameAttr" } }, ngImport: i0 });
__ngDeclareClassMetadata({ type: NgbRadio, decorators: [{
  type: Directive,
  args: [{
    selector: "[ngbButton][type=radio]",
    host: {
      "[checked]": "checked",
      "[disabled]": "disabled",
      "[name]": "nameAttr",
      "(change)": "onChange()",
      "(focus)": "focused = true",
      "(blur)": "focused = false"
    }
  }]
}], ctorParameters: function() {
  return [{ type: NgbRadioGroup }, { type: NgbButtonLabel }, { type: Renderer2 }, { type: ElementRef }, { type: ChangeDetectorRef }];
}, propDecorators: { name: [{
  type: Input
}], value: [{
  type: Input
}], disabled: [{
  type: Input
}] } });
const NGB_BUTTON_DIRECTIVES = [NgbButtonLabel, NgbCheckBox, NgbRadioGroup, NgbRadio];
class NgbButtonsModule {
}
NgbButtonsModule.ɵfac = __ngDeclareFactory({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: NgbButtonsModule, deps: [], target: FactoryTarget.NgModule });
NgbButtonsModule.ɵmod = __ngDeclareNgModule({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: NgbButtonsModule, declarations: [NgbButtonLabel, NgbCheckBox, NgbRadioGroup, NgbRadio], exports: [NgbButtonLabel, NgbCheckBox, NgbRadioGroup, NgbRadio] });
NgbButtonsModule.ɵinj = __ngDeclareInjector({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: NgbButtonsModule });
__ngDeclareClassMetadata({ type: NgbButtonsModule, decorators: [{
  type: NgModule,
  args: [{ declarations: NGB_BUTTON_DIRECTIVES, exports: NGB_BUTTON_DIRECTIVES }]
}] });
var NgbSlideEventDirection;
(function(NgbSlideEventDirection2) {
  NgbSlideEventDirection2["START"] = "start";
  NgbSlideEventDirection2["END"] = "end";
})(NgbSlideEventDirection || (NgbSlideEventDirection = {}));
const isBeingAnimated = ({ classList }) => {
  return classList.contains("carousel-item-start") || classList.contains("carousel-item-end");
};
const removeDirectionClasses = (classList) => {
  classList.remove("carousel-item-start");
  classList.remove("carousel-item-end");
};
const removeClasses = (classList) => {
  removeDirectionClasses(classList);
  classList.remove("carousel-item-prev");
  classList.remove("carousel-item-next");
};
const ngbCarouselTransitionIn = (element, animation, { direction }) => {
  const { classList } = element;
  if (!animation) {
    removeDirectionClasses(classList);
    removeClasses(classList);
    classList.add("active");
    return;
  }
  if (isBeingAnimated(element)) {
    removeDirectionClasses(classList);
  } else {
    classList.add("carousel-item-" + (direction === NgbSlideEventDirection.START ? "next" : "prev"));
    reflow(element);
    classList.add("carousel-item-" + direction);
  }
  return () => {
    removeClasses(classList);
    classList.add("active");
  };
};
const ngbCarouselTransitionOut = (element, animation, { direction }) => {
  const { classList } = element;
  if (!animation) {
    removeDirectionClasses(classList);
    removeClasses(classList);
    classList.remove("active");
    return;
  }
  if (isBeingAnimated(element)) {
    removeDirectionClasses(classList);
  } else {
    classList.add("carousel-item-" + direction);
  }
  return () => {
    removeClasses(classList);
    classList.remove("active");
  };
};
class NgbCarouselConfig {
  constructor(_ngbConfig) {
    this._ngbConfig = _ngbConfig;
    this.interval = 5e3;
    this.wrap = true;
    this.keyboard = true;
    this.pauseOnHover = true;
    this.pauseOnFocus = true;
    this.showNavigationArrows = true;
    this.showNavigationIndicators = true;
  }
  get animation() {
    return this._animation === void 0 ? this._ngbConfig.animation : this._animation;
  }
  set animation(animation) {
    this._animation = animation;
  }
}
NgbCarouselConfig.ɵfac = __ngDeclareFactory({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: NgbCarouselConfig, deps: [{ token: NgbConfig }], target: FactoryTarget.Injectable });
NgbCarouselConfig.ɵprov = __ngDeclareInjectable({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: NgbCarouselConfig, providedIn: "root" });
__ngDeclareClassMetadata({ type: NgbCarouselConfig, decorators: [{
  type: Injectable,
  args: [{ providedIn: "root" }]
}], ctorParameters: function() {
  return [{ type: NgbConfig }];
} });
let nextId$2 = 0;
class NgbSlide {
  constructor(tplRef) {
    this.tplRef = tplRef;
    this.id = `ngb-slide-${nextId$2++}`;
    this.slid = new EventEmitter();
  }
}
NgbSlide.ɵfac = __ngDeclareFactory({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: NgbSlide, deps: [{ token: TemplateRef }], target: FactoryTarget.Directive });
NgbSlide.ɵdir = __ngDeclareDirective({ minVersion: "12.0.0", version: "13.0.3", type: NgbSlide, selector: "ng-template[ngbSlide]", inputs: { id: "id" }, outputs: { slid: "slid" }, ngImport: i0 });
__ngDeclareClassMetadata({ type: NgbSlide, decorators: [{
  type: Directive,
  args: [{ selector: "ng-template[ngbSlide]" }]
}], ctorParameters: function() {
  return [{ type: TemplateRef }];
}, propDecorators: { id: [{
  type: Input
}], slid: [{
  type: Output
}] } });
class NgbCarousel {
  constructor(config, _platformId, _ngZone, _cd, _container) {
    this._platformId = _platformId;
    this._ngZone = _ngZone;
    this._cd = _cd;
    this._container = _container;
    this.NgbSlideEventSource = NgbSlideEventSource;
    this._destroy$ = new Subject();
    this._interval$ = new BehaviorSubject(0);
    this._mouseHover$ = new BehaviorSubject(false);
    this._focused$ = new BehaviorSubject(false);
    this._pauseOnHover$ = new BehaviorSubject(false);
    this._pauseOnFocus$ = new BehaviorSubject(false);
    this._pause$ = new BehaviorSubject(false);
    this._wrap$ = new BehaviorSubject(false);
    this.slide = new EventEmitter();
    this.slid = new EventEmitter();
    this._transitionIds = null;
    this.animation = config.animation;
    this.interval = config.interval;
    this.wrap = config.wrap;
    this.keyboard = config.keyboard;
    this.pauseOnHover = config.pauseOnHover;
    this.pauseOnFocus = config.pauseOnFocus;
    this.showNavigationArrows = config.showNavigationArrows;
    this.showNavigationIndicators = config.showNavigationIndicators;
  }
  /**
   * Time in milliseconds before the next slide is shown.
   */
  set interval(value) {
    this._interval$.next(value);
  }
  get interval() {
    return this._interval$.value;
  }
  /**
   * If `true`, will 'wrap' the carousel by switching from the last slide back to the first.
   */
  set wrap(value) {
    this._wrap$.next(value);
  }
  get wrap() {
    return this._wrap$.value;
  }
  /**
   * If `true`, will pause slide switching when mouse cursor hovers the slide.
   *
   * @since 2.2.0
   */
  set pauseOnHover(value) {
    this._pauseOnHover$.next(value);
  }
  get pauseOnHover() {
    return this._pauseOnHover$.value;
  }
  /**
   * If `true`, will pause slide switching when the focus is inside the carousel.
   */
  set pauseOnFocus(value) {
    this._pauseOnFocus$.next(value);
  }
  get pauseOnFocus() {
    return this._pauseOnFocus$.value;
  }
  set mouseHover(value) {
    this._mouseHover$.next(value);
  }
  get mouseHover() {
    return this._mouseHover$.value;
  }
  set focused(value) {
    this._focused$.next(value);
  }
  get focused() {
    return this._focused$.value;
  }
  arrowLeft() {
    this.focus();
    this.prev(NgbSlideEventSource.ARROW_LEFT);
  }
  arrowRight() {
    this.focus();
    this.next(NgbSlideEventSource.ARROW_RIGHT);
  }
  ngAfterContentInit() {
    if (isPlatformBrowser(this._platformId)) {
      this._ngZone.runOutsideAngular(() => {
        const hasNextSlide$ = combineLatest([
          this.slide.pipe(map((slideEvent) => slideEvent.current), startWith(this.activeId)),
          this._wrap$,
          this.slides.changes.pipe(startWith(null))
        ]).pipe(map(([currentSlideId, wrap]) => {
          const slideArr = this.slides.toArray();
          const currentSlideIdx = this._getSlideIdxById(currentSlideId);
          return wrap ? slideArr.length > 1 : currentSlideIdx < slideArr.length - 1;
        }), distinctUntilChanged());
        combineLatest([
          this._pause$,
          this._pauseOnHover$,
          this._mouseHover$,
          this._pauseOnFocus$,
          this._focused$,
          this._interval$,
          hasNextSlide$
        ]).pipe(map(([pause, pauseOnHover, mouseHover, pauseOnFocus, focused, interval, hasNextSlide]) => pause || pauseOnHover && mouseHover || pauseOnFocus && focused || !hasNextSlide ? 0 : interval), distinctUntilChanged(), switchMap((interval) => interval > 0 ? timer(interval, interval) : NEVER), takeUntil(this._destroy$)).subscribe(() => this._ngZone.run(() => this.next(NgbSlideEventSource.TIMER)));
      });
    }
    this.slides.changes.pipe(takeUntil(this._destroy$)).subscribe(() => {
      this._transitionIds?.forEach((id) => ngbCompleteTransition(this._getSlideElement(id)));
      this._transitionIds = null;
      this._cd.markForCheck();
      this._ngZone.onStable.pipe(take(1)).subscribe(() => {
        for (const { id } of this.slides) {
          const element = this._getSlideElement(id);
          if (id === this.activeId) {
            element.classList.add("active");
          } else {
            element.classList.remove("active");
          }
        }
      });
    });
  }
  ngAfterContentChecked() {
    let activeSlide = this._getSlideById(this.activeId);
    this.activeId = activeSlide ? activeSlide.id : this.slides.length ? this.slides.first.id : "";
  }
  ngAfterViewInit() {
    if (this.activeId) {
      const element = this._getSlideElement(this.activeId);
      if (element) {
        element.classList.add("active");
      }
    }
  }
  ngOnDestroy() {
    this._destroy$.next();
  }
  /**
   * Navigates to a slide with the specified identifier.
   */
  select(slideId, source) {
    this._cycleToSelected(slideId, this._getSlideEventDirection(this.activeId, slideId), source);
  }
  /**
   * Navigates to the previous slide.
   */
  prev(source) {
    this._cycleToSelected(this._getPrevSlide(this.activeId), NgbSlideEventDirection.END, source);
  }
  /**
   * Navigates to the next slide.
   */
  next(source) {
    this._cycleToSelected(this._getNextSlide(this.activeId), NgbSlideEventDirection.START, source);
  }
  /**
   * Pauses cycling through the slides.
   */
  pause() {
    this._pause$.next(true);
  }
  /**
   * Restarts cycling through the slides from start to end.
   */
  cycle() {
    this._pause$.next(false);
  }
  /**
   * Set the focus on the carousel.
   */
  focus() {
    this._container.nativeElement.focus();
  }
  _cycleToSelected(slideIdx, direction, source) {
    const transitionIds = this._transitionIds;
    if (transitionIds && (transitionIds[0] !== slideIdx || transitionIds[1] !== this.activeId)) {
      return;
    }
    let selectedSlide = this._getSlideById(slideIdx);
    if (selectedSlide && selectedSlide.id !== this.activeId) {
      this._transitionIds = [this.activeId, slideIdx];
      this.slide.emit({ prev: this.activeId, current: selectedSlide.id, direction, paused: this._pause$.value, source });
      const options = {
        animation: this.animation,
        runningTransition: "stop",
        context: { direction }
      };
      const transitions = [];
      const activeSlide = this._getSlideById(this.activeId);
      if (activeSlide) {
        const activeSlideTransition = ngbRunTransition(this._ngZone, this._getSlideElement(activeSlide.id), ngbCarouselTransitionOut, options);
        activeSlideTransition.subscribe(() => {
          activeSlide.slid.emit({ isShown: false, direction, source });
        });
        transitions.push(activeSlideTransition);
      }
      const previousId = this.activeId;
      this.activeId = selectedSlide.id;
      const nextSlide = this._getSlideById(this.activeId);
      const transition2 = ngbRunTransition(this._ngZone, this._getSlideElement(selectedSlide.id), ngbCarouselTransitionIn, options);
      transition2.subscribe(() => {
        nextSlide?.slid.emit({ isShown: true, direction, source });
      });
      transitions.push(transition2);
      zip(...transitions).pipe(take(1)).subscribe(() => {
        this._transitionIds = null;
        this.slid.emit({ prev: previousId, current: selectedSlide.id, direction, paused: this._pause$.value, source });
      });
    }
    this._cd.markForCheck();
  }
  _getSlideEventDirection(currentActiveSlideId, nextActiveSlideId) {
    const currentActiveSlideIdx = this._getSlideIdxById(currentActiveSlideId);
    const nextActiveSlideIdx = this._getSlideIdxById(nextActiveSlideId);
    return currentActiveSlideIdx > nextActiveSlideIdx ? NgbSlideEventDirection.END : NgbSlideEventDirection.START;
  }
  _getSlideById(slideId) {
    return this.slides.find((slide) => slide.id === slideId) || null;
  }
  _getSlideIdxById(slideId) {
    const slide = this._getSlideById(slideId);
    return slide != null ? this.slides.toArray().indexOf(slide) : -1;
  }
  _getNextSlide(currentSlideId) {
    const slideArr = this.slides.toArray();
    const currentSlideIdx = this._getSlideIdxById(currentSlideId);
    const isLastSlide = currentSlideIdx === slideArr.length - 1;
    return isLastSlide ? this.wrap ? slideArr[0].id : slideArr[slideArr.length - 1].id : slideArr[currentSlideIdx + 1].id;
  }
  _getPrevSlide(currentSlideId) {
    const slideArr = this.slides.toArray();
    const currentSlideIdx = this._getSlideIdxById(currentSlideId);
    const isFirstSlide = currentSlideIdx === 0;
    return isFirstSlide ? this.wrap ? slideArr[slideArr.length - 1].id : slideArr[0].id : slideArr[currentSlideIdx - 1].id;
  }
  _getSlideElement(slideId) {
    return this._container.nativeElement.querySelector(`#slide-${slideId}`);
  }
}
NgbCarousel.ɵfac = __ngDeclareFactory({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: NgbCarousel, deps: [{ token: NgbCarouselConfig }, { token: PLATFORM_ID }, { token: NgZone }, { token: ChangeDetectorRef }, { token: ElementRef }], target: FactoryTarget.Component });
NgbCarousel.ɵcmp = __ngDeclareComponent({ minVersion: "12.0.0", version: "13.0.3", type: NgbCarousel, selector: "ngb-carousel", inputs: { animation: "animation", activeId: "activeId", interval: "interval", wrap: "wrap", keyboard: "keyboard", pauseOnHover: "pauseOnHover", pauseOnFocus: "pauseOnFocus", showNavigationArrows: "showNavigationArrows", showNavigationIndicators: "showNavigationIndicators" }, outputs: { slide: "slide", slid: "slid" }, host: { attributes: { "tabIndex": "0" }, listeners: { "keydown.arrowLeft": "keyboard && arrowLeft()", "keydown.arrowRight": "keyboard && arrowRight()", "mouseenter": "mouseHover = true", "mouseleave": "mouseHover = false", "focusin": "focused = true", "focusout": "focused = false" }, properties: { "style.display": '"block"', "attr.aria-activedescendant": "'slide-' + activeId" }, classAttribute: "carousel slide" }, queries: [{ propertyName: "slides", predicate: NgbSlide }], exportAs: ["ngbCarousel"], ngImport: i0, template: `
    <div class="carousel-indicators" [class.visually-hidden]="!showNavigationIndicators" role="tablist">
      <button type="button" data-bs-target *ngFor="let slide of slides" [class.active]="slide.id === activeId"
          role="tab" [attr.aria-labelledby]="'slide-' + slide.id" [attr.aria-controls]="'slide-' + slide.id"
          [attr.aria-selected]="slide.id === activeId"
          (click)="focus();select(slide.id, NgbSlideEventSource.INDICATOR);"></button>
    </div>
    <div class="carousel-inner">
      <div *ngFor="let slide of slides; index as i; count as c" class="carousel-item" [id]="'slide-' + slide.id" role="tabpanel">
        <span class="visually-hidden" i18n="Currently selected slide number read by screen reader@@ngb.carousel.slide-number">
          Slide {{i + 1}} of {{c}}
        </span>
        <ng-template [ngTemplateOutlet]="slide.tplRef"></ng-template>
      </div>
    </div>
    <button class="carousel-control-prev" type="button" (click)="arrowLeft()" *ngIf="showNavigationArrows">
      <span class="carousel-control-prev-icon" aria-hidden="true"></span>
      <span class="visually-hidden" i18n="@@ngb.carousel.previous">Previous</span>
    </button>
    <button class="carousel-control-next" type="button" (click)="arrowRight()" *ngIf="showNavigationArrows">
      <span class="carousel-control-next-icon" aria-hidden="true"></span>
      <span class="visually-hidden" i18n="@@ngb.carousel.next">Next</span>
    </button>
  `, isInline: true, directives: [{ type: NgForOf, selector: "[ngFor][ngForOf]", inputs: ["ngForOf", "ngForTrackBy", "ngForTemplate"] }, { type: NgTemplateOutlet, selector: "[ngTemplateOutlet]", inputs: ["ngTemplateOutletContext", "ngTemplateOutlet"] }, { type: NgIf, selector: "[ngIf]", inputs: ["ngIf", "ngIfThen", "ngIfElse"] }], changeDetection: ChangeDetectionStrategy.OnPush, encapsulation: ViewEncapsulation$1.None });
__ngDeclareClassMetadata({ type: NgbCarousel, decorators: [{
  type: Component,
  args: [{
    selector: "ngb-carousel",
    exportAs: "ngbCarousel",
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation$1.None,
    host: {
      "class": "carousel slide",
      "[style.display]": '"block"',
      "tabIndex": "0",
      "(keydown.arrowLeft)": "keyboard && arrowLeft()",
      "(keydown.arrowRight)": "keyboard && arrowRight()",
      "(mouseenter)": "mouseHover = true",
      "(mouseleave)": "mouseHover = false",
      "(focusin)": "focused = true",
      "(focusout)": "focused = false",
      "[attr.aria-activedescendant]": `'slide-' + activeId`
    },
    template: `
    <div class="carousel-indicators" [class.visually-hidden]="!showNavigationIndicators" role="tablist">
      <button type="button" data-bs-target *ngFor="let slide of slides" [class.active]="slide.id === activeId"
          role="tab" [attr.aria-labelledby]="'slide-' + slide.id" [attr.aria-controls]="'slide-' + slide.id"
          [attr.aria-selected]="slide.id === activeId"
          (click)="focus();select(slide.id, NgbSlideEventSource.INDICATOR);"></button>
    </div>
    <div class="carousel-inner">
      <div *ngFor="let slide of slides; index as i; count as c" class="carousel-item" [id]="'slide-' + slide.id" role="tabpanel">
        <span class="visually-hidden" i18n="Currently selected slide number read by screen reader@@ngb.carousel.slide-number">
          Slide {{i + 1}} of {{c}}
        </span>
        <ng-template [ngTemplateOutlet]="slide.tplRef"></ng-template>
      </div>
    </div>
    <button class="carousel-control-prev" type="button" (click)="arrowLeft()" *ngIf="showNavigationArrows">
      <span class="carousel-control-prev-icon" aria-hidden="true"></span>
      <span class="visually-hidden" i18n="@@ngb.carousel.previous">Previous</span>
    </button>
    <button class="carousel-control-next" type="button" (click)="arrowRight()" *ngIf="showNavigationArrows">
      <span class="carousel-control-next-icon" aria-hidden="true"></span>
      <span class="visually-hidden" i18n="@@ngb.carousel.next">Next</span>
    </button>
  `
  }]
}], ctorParameters: function() {
  return [{ type: NgbCarouselConfig }, { type: void 0, decorators: [{
    type: Inject,
    args: [PLATFORM_ID]
  }] }, { type: NgZone }, { type: ChangeDetectorRef }, { type: ElementRef }];
}, propDecorators: { slides: [{
  type: ContentChildren,
  args: [NgbSlide]
}], animation: [{
  type: Input
}], activeId: [{
  type: Input
}], interval: [{
  type: Input
}], wrap: [{
  type: Input
}], keyboard: [{
  type: Input
}], pauseOnHover: [{
  type: Input
}], pauseOnFocus: [{
  type: Input
}], showNavigationArrows: [{
  type: Input
}], showNavigationIndicators: [{
  type: Input
}], slide: [{
  type: Output
}], slid: [{
  type: Output
}] } });
var NgbSlideEventSource;
(function(NgbSlideEventSource2) {
  NgbSlideEventSource2["TIMER"] = "timer";
  NgbSlideEventSource2["ARROW_LEFT"] = "arrowLeft";
  NgbSlideEventSource2["ARROW_RIGHT"] = "arrowRight";
  NgbSlideEventSource2["INDICATOR"] = "indicator";
})(NgbSlideEventSource || (NgbSlideEventSource = {}));
const NGB_CAROUSEL_DIRECTIVES = [NgbCarousel, NgbSlide];
class NgbCarouselModule {
}
NgbCarouselModule.ɵfac = __ngDeclareFactory({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: NgbCarouselModule, deps: [], target: FactoryTarget.NgModule });
NgbCarouselModule.ɵmod = __ngDeclareNgModule({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: NgbCarouselModule, declarations: [NgbCarousel, NgbSlide], imports: [CommonModule], exports: [NgbCarousel, NgbSlide] });
NgbCarouselModule.ɵinj = __ngDeclareInjector({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: NgbCarouselModule, imports: [[CommonModule]] });
__ngDeclareClassMetadata({ type: NgbCarouselModule, decorators: [{
  type: NgModule,
  args: [{ declarations: NGB_CAROUSEL_DIRECTIVES, exports: NGB_CAROUSEL_DIRECTIVES, imports: [CommonModule] }]
}] });
class NgbCollapseConfig {
  constructor(_ngbConfig) {
    this._ngbConfig = _ngbConfig;
  }
  get animation() {
    return this._animation === void 0 ? this._ngbConfig.animation : this._animation;
  }
  set animation(animation) {
    this._animation = animation;
  }
}
NgbCollapseConfig.ɵfac = __ngDeclareFactory({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: NgbCollapseConfig, deps: [{ token: NgbConfig }], target: FactoryTarget.Injectable });
NgbCollapseConfig.ɵprov = __ngDeclareInjectable({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: NgbCollapseConfig, providedIn: "root" });
__ngDeclareClassMetadata({ type: NgbCollapseConfig, decorators: [{
  type: Injectable,
  args: [{ providedIn: "root" }]
}], ctorParameters: function() {
  return [{ type: NgbConfig }];
} });
class NgbCollapse {
  constructor(_element, config, _zone) {
    this._element = _element;
    this._zone = _zone;
    this.collapsed = false;
    this.ngbCollapseChange = new EventEmitter();
    this.shown = new EventEmitter();
    this.hidden = new EventEmitter();
    this.animation = config.animation;
  }
  ngOnInit() {
    this._runTransition(this.collapsed, false);
  }
  ngOnChanges({ collapsed }) {
    if (!collapsed.firstChange) {
      this._runTransitionWithEvents(this.collapsed, this.animation);
    }
  }
  /**
   * Triggers collapsing programmatically.
   *
   * If there is a collapsing transition running already, it will be reversed.
   * If the animations are turned off this happens synchronously.
   *
   * @since 8.0.0
   */
  toggle(open = this.collapsed) {
    this.collapsed = !open;
    this.ngbCollapseChange.next(this.collapsed);
    this._runTransitionWithEvents(this.collapsed, this.animation);
  }
  _runTransition(collapsed, animation) {
    return ngbRunTransition(this._zone, this._element.nativeElement, ngbCollapsingTransition, { animation, runningTransition: "stop", context: { direction: collapsed ? "hide" : "show" } });
  }
  _runTransitionWithEvents(collapsed, animation) {
    this._runTransition(collapsed, animation).subscribe(() => {
      if (collapsed) {
        this.hidden.emit();
      } else {
        this.shown.emit();
      }
    });
  }
}
NgbCollapse.ɵfac = __ngDeclareFactory({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: NgbCollapse, deps: [{ token: ElementRef }, { token: NgbCollapseConfig }, { token: NgZone }], target: FactoryTarget.Directive });
NgbCollapse.ɵdir = __ngDeclareDirective({ minVersion: "12.0.0", version: "13.0.3", type: NgbCollapse, selector: "[ngbCollapse]", inputs: { animation: "animation", collapsed: ["ngbCollapse", "collapsed"] }, outputs: { ngbCollapseChange: "ngbCollapseChange", shown: "shown", hidden: "hidden" }, exportAs: ["ngbCollapse"], usesOnChanges: true, ngImport: i0 });
__ngDeclareClassMetadata({ type: NgbCollapse, decorators: [{
  type: Directive,
  args: [{ selector: "[ngbCollapse]", exportAs: "ngbCollapse" }]
}], ctorParameters: function() {
  return [{ type: ElementRef }, { type: NgbCollapseConfig }, { type: NgZone }];
}, propDecorators: { animation: [{
  type: Input
}], collapsed: [{
  type: Input,
  args: ["ngbCollapse"]
}], ngbCollapseChange: [{
  type: Output
}], shown: [{
  type: Output
}], hidden: [{
  type: Output
}] } });
class NgbCollapseModule {
}
NgbCollapseModule.ɵfac = __ngDeclareFactory({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: NgbCollapseModule, deps: [], target: FactoryTarget.NgModule });
NgbCollapseModule.ɵmod = __ngDeclareNgModule({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: NgbCollapseModule, declarations: [NgbCollapse], exports: [NgbCollapse] });
NgbCollapseModule.ɵinj = __ngDeclareInjector({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: NgbCollapseModule });
__ngDeclareClassMetadata({ type: NgbCollapseModule, decorators: [{
  type: NgModule,
  args: [{ declarations: [NgbCollapse], exports: [NgbCollapse] }]
}] });
class NgbDate {
  constructor(year, month, day) {
    this.year = isInteger(year) ? year : null;
    this.month = isInteger(month) ? month : null;
    this.day = isInteger(day) ? day : null;
  }
  /**
   * A **static method** that creates a new date object from the `NgbDateStruct`,
   *
   * ex. `NgbDate.from({year: 2000, month: 5, day: 1})`.
   *
   * If the `date` is already of `NgbDate` type, the method will return the same object.
   */
  static from(date) {
    if (date instanceof NgbDate) {
      return date;
    }
    return date ? new NgbDate(date.year, date.month, date.day) : null;
  }
  /**
   * Checks if the current date is equal to another date.
   */
  equals(other) {
    return other != null && this.year === other.year && this.month === other.month && this.day === other.day;
  }
  /**
   * Checks if the current date is before another date.
   */
  before(other) {
    if (!other) {
      return false;
    }
    if (this.year === other.year) {
      if (this.month === other.month) {
        return this.day === other.day ? false : this.day < other.day;
      } else {
        return this.month < other.month;
      }
    } else {
      return this.year < other.year;
    }
  }
  /**
   * Checks if the current date is after another date.
   */
  after(other) {
    if (!other) {
      return false;
    }
    if (this.year === other.year) {
      if (this.month === other.month) {
        return this.day === other.day ? false : this.day > other.day;
      } else {
        return this.month > other.month;
      }
    } else {
      return this.year > other.year;
    }
  }
}
function isChangedDate(prev, next) {
  return !dateComparator(prev, next);
}
function isChangedMonth(prev, next) {
  return !prev && !next ? false : !prev || !next ? true : prev.year !== next.year || prev.month !== next.month;
}
function dateComparator(prev, next) {
  return !prev && !next || !!prev && !!next && prev.equals(next);
}
function checkMinBeforeMax(minDate, maxDate) {
  if (maxDate && minDate && maxDate.before(minDate)) {
    throw new Error(`'maxDate' ${maxDate} should be greater than 'minDate' ${minDate}`);
  }
}
function checkDateInRange(date, minDate, maxDate) {
  if (date && minDate && date.before(minDate)) {
    return minDate;
  }
  if (date && maxDate && date.after(maxDate)) {
    return maxDate;
  }
  return date || null;
}
function isDateSelectable(date, state2) {
  const { minDate, maxDate, disabled, markDisabled } = state2;
  return !(date === null || date === void 0 || disabled || markDisabled && markDisabled(date, { year: date.year, month: date.month }) || minDate && date.before(minDate) || maxDate && date.after(maxDate));
}
function generateSelectBoxMonths(calendar, date, minDate, maxDate) {
  if (!date) {
    return [];
  }
  let months = calendar.getMonths(date.year);
  if (minDate && date.year === minDate.year) {
    const index = months.findIndex((month) => month === minDate.month);
    months = months.slice(index);
  }
  if (maxDate && date.year === maxDate.year) {
    const index = months.findIndex((month) => month === maxDate.month);
    months = months.slice(0, index + 1);
  }
  return months;
}
function generateSelectBoxYears(date, minDate, maxDate) {
  if (!date) {
    return [];
  }
  const start2 = minDate ? Math.max(minDate.year, date.year - 500) : date.year - 10;
  const end2 = maxDate ? Math.min(maxDate.year, date.year + 500) : date.year + 10;
  const length = end2 - start2 + 1;
  const numbers = Array(length);
  for (let i = 0; i < length; i++) {
    numbers[i] = start2 + i;
  }
  return numbers;
}
function nextMonthDisabled(calendar, date, maxDate) {
  const nextDate = Object.assign(calendar.getNext(date, "m"), { day: 1 });
  return maxDate != null && nextDate.after(maxDate);
}
function prevMonthDisabled(calendar, date, minDate) {
  const prevDate = Object.assign(calendar.getPrev(date, "m"), { day: 1 });
  return minDate != null && (prevDate.year === minDate.year && prevDate.month < minDate.month || prevDate.year < minDate.year && minDate.month === 1);
}
function buildMonths(calendar, date, state2, i18n, force) {
  const { displayMonths, months } = state2;
  const monthsToReuse = months.splice(0, months.length);
  const firstDates = Array.from({ length: displayMonths }, (_, i) => {
    const firstDate = Object.assign(calendar.getNext(date, "m", i), { day: 1 });
    months[i] = null;
    if (!force) {
      const reusedIndex = monthsToReuse.findIndex((month) => month.firstDate.equals(firstDate));
      if (reusedIndex !== -1) {
        months[i] = monthsToReuse.splice(reusedIndex, 1)[0];
      }
    }
    return firstDate;
  });
  firstDates.forEach((firstDate, i) => {
    if (months[i] === null) {
      months[i] = buildMonth(calendar, firstDate, state2, i18n, monthsToReuse.shift() || {});
    }
  });
  return months;
}
function buildMonth(calendar, date, state2, i18n, month = {}) {
  const { dayTemplateData, minDate, maxDate, firstDayOfWeek, markDisabled, outsideDays, weekdayWidth, weekdaysVisible } = state2;
  const calendarToday = calendar.getToday();
  month.firstDate = null;
  month.lastDate = null;
  month.number = date.month;
  month.year = date.year;
  month.weeks = month.weeks || [];
  month.weekdays = month.weekdays || [];
  date = getFirstViewDate(calendar, date, firstDayOfWeek);
  if (!weekdaysVisible) {
    month.weekdays.length = 0;
  }
  for (let week = 0; week < calendar.getWeeksPerMonth(); week++) {
    let weekObject = month.weeks[week];
    if (!weekObject) {
      weekObject = month.weeks[week] = { number: 0, days: [], collapsed: true };
    }
    const days = weekObject.days;
    for (let day = 0; day < calendar.getDaysPerWeek(); day++) {
      if (week === 0 && weekdaysVisible) {
        month.weekdays[day] = i18n.getWeekdayLabel(calendar.getWeekday(date), weekdayWidth);
      }
      const newDate = new NgbDate(date.year, date.month, date.day);
      const nextDate = calendar.getNext(newDate);
      const ariaLabel = i18n.getDayAriaLabel(newDate);
      let disabled = !!(minDate && newDate.before(minDate) || maxDate && newDate.after(maxDate));
      if (!disabled && markDisabled) {
        disabled = markDisabled(newDate, { month: month.number, year: month.year });
      }
      let today = newDate.equals(calendarToday);
      let contextUserData = dayTemplateData ? dayTemplateData(newDate, { month: month.number, year: month.year }) : void 0;
      if (month.firstDate === null && newDate.month === month.number) {
        month.firstDate = newDate;
      }
      if (newDate.month === month.number && nextDate.month !== month.number) {
        month.lastDate = newDate;
      }
      let dayObject = days[day];
      if (!dayObject) {
        dayObject = days[day] = {};
      }
      dayObject.date = newDate;
      dayObject.context = Object.assign(dayObject.context || {}, {
        $implicit: newDate,
        date: newDate,
        data: contextUserData,
        currentMonth: month.number,
        currentYear: month.year,
        disabled,
        focused: false,
        selected: false,
        today
      });
      dayObject.tabindex = -1;
      dayObject.ariaLabel = ariaLabel;
      dayObject.hidden = false;
      date = nextDate;
    }
    weekObject.number = calendar.getWeekNumber(days.map((day) => day.date), firstDayOfWeek);
    weekObject.collapsed = outsideDays === "collapsed" && days[0].date.month !== month.number && days[days.length - 1].date.month !== month.number;
  }
  return month;
}
function getFirstViewDate(calendar, date, firstDayOfWeek) {
  const daysPerWeek = calendar.getDaysPerWeek();
  const firstMonthDate = new NgbDate(date.year, date.month, 1);
  const dayOfWeek = calendar.getWeekday(firstMonthDate) % daysPerWeek;
  return calendar.getPrev(firstMonthDate, "d", (daysPerWeek + dayOfWeek - firstDayOfWeek) % daysPerWeek);
}
function fromJSDate(jsDate) {
  return new NgbDate(jsDate.getFullYear(), jsDate.getMonth() + 1, jsDate.getDate());
}
function toJSDate(date) {
  const jsDate = new Date(date.year, date.month - 1, date.day, 12);
  if (!isNaN(jsDate.getTime())) {
    jsDate.setFullYear(date.year);
  }
  return jsDate;
}
function NGB_DATEPICKER_CALENDAR_FACTORY() {
  return new NgbCalendarGregorian();
}
class NgbCalendar {
}
NgbCalendar.ɵfac = __ngDeclareFactory({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: NgbCalendar, deps: [], target: FactoryTarget.Injectable });
NgbCalendar.ɵprov = __ngDeclareInjectable({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: NgbCalendar, providedIn: "root", useFactory: NGB_DATEPICKER_CALENDAR_FACTORY });
__ngDeclareClassMetadata({ type: NgbCalendar, decorators: [{
  type: Injectable,
  args: [{ providedIn: "root", useFactory: NGB_DATEPICKER_CALENDAR_FACTORY }]
}] });
class NgbCalendarGregorian extends NgbCalendar {
  getDaysPerWeek() {
    return 7;
  }
  getMonths() {
    return [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
  }
  getWeeksPerMonth() {
    return 6;
  }
  getNext(date, period = "d", number = 1) {
    let jsDate = toJSDate(date);
    let checkMonth = true;
    let expectedMonth = jsDate.getMonth();
    switch (period) {
      case "y":
        jsDate.setFullYear(jsDate.getFullYear() + number);
        break;
      case "m":
        expectedMonth += number;
        jsDate.setMonth(expectedMonth);
        expectedMonth = expectedMonth % 12;
        if (expectedMonth < 0) {
          expectedMonth = expectedMonth + 12;
        }
        break;
      case "d":
        jsDate.setDate(jsDate.getDate() + number);
        checkMonth = false;
        break;
      default:
        return date;
    }
    if (checkMonth && jsDate.getMonth() !== expectedMonth) {
      jsDate.setDate(0);
    }
    return fromJSDate(jsDate);
  }
  getPrev(date, period = "d", number = 1) {
    return this.getNext(date, period, -number);
  }
  getWeekday(date) {
    let jsDate = toJSDate(date);
    let day = jsDate.getDay();
    return day === 0 ? 7 : day;
  }
  getWeekNumber(week, firstDayOfWeek) {
    if (firstDayOfWeek === 7) {
      firstDayOfWeek = 0;
    }
    const thursdayIndex = (4 + 7 - firstDayOfWeek) % 7;
    let date = week[thursdayIndex];
    const jsDate = toJSDate(date);
    jsDate.setDate(jsDate.getDate() + 4 - (jsDate.getDay() || 7));
    const time = jsDate.getTime();
    jsDate.setMonth(0);
    jsDate.setDate(1);
    return Math.floor(Math.round((time - jsDate.getTime()) / 864e5) / 7) + 1;
  }
  getToday() {
    return fromJSDate(/* @__PURE__ */ new Date());
  }
  isValid(date) {
    if (!date || !isInteger(date.year) || !isInteger(date.month) || !isInteger(date.day)) {
      return false;
    }
    if (date.year === 0) {
      return false;
    }
    const jsDate = toJSDate(date);
    return !isNaN(jsDate.getTime()) && jsDate.getFullYear() === date.year && jsDate.getMonth() + 1 === date.month && jsDate.getDate() === date.day;
  }
}
NgbCalendarGregorian.ɵfac = __ngDeclareFactory({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: NgbCalendarGregorian, deps: null, target: FactoryTarget.Injectable });
NgbCalendarGregorian.ɵprov = __ngDeclareInjectable({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: NgbCalendarGregorian });
__ngDeclareClassMetadata({ type: NgbCalendarGregorian, decorators: [{
  type: Injectable
}] });
function NGB_DATEPICKER_18N_FACTORY(locale) {
  return new NgbDatepickerI18nDefault(locale);
}
class NgbDatepickerI18n {
  /**
   * Returns the text label to display above the day view.
   *
   * @since 9.1.0
   */
  getMonthLabel(date) {
    return `${this.getMonthFullName(date.month, date.year)} ${this.getYearNumerals(date.year)}`;
  }
  /**
   * Returns the textual representation of a day that is rendered in a day cell.
   *
   * @since 3.0.0
   */
  getDayNumerals(date) {
    return `${date.day}`;
  }
  /**
   * Returns the textual representation of a week number rendered by datepicker.
   *
   * @since 3.0.0
   */
  getWeekNumerals(weekNumber) {
    return `${weekNumber}`;
  }
  /**
   * Returns the textual representation of a year that is rendered in the datepicker year select box.
   *
   * @since 3.0.0
   */
  getYearNumerals(year) {
    return `${year}`;
  }
  /**
   * Returns the week label to display in the heading of the month view.
   *
   * @since 9.1.0
   */
  getWeekLabel() {
    return "";
  }
}
NgbDatepickerI18n.ɵfac = __ngDeclareFactory({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: NgbDatepickerI18n, deps: [], target: FactoryTarget.Injectable });
NgbDatepickerI18n.ɵprov = __ngDeclareInjectable({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: NgbDatepickerI18n, providedIn: "root", useFactory: NGB_DATEPICKER_18N_FACTORY, deps: [{ token: LOCALE_ID }] });
__ngDeclareClassMetadata({ type: NgbDatepickerI18n, decorators: [{
  type: Injectable,
  args: [{ providedIn: "root", useFactory: NGB_DATEPICKER_18N_FACTORY, deps: [LOCALE_ID] }]
}] });
class NgbDatepickerI18nDefault extends NgbDatepickerI18n {
  constructor(_locale) {
    super();
    this._locale = _locale;
    this._monthsShort = getLocaleMonthNames(_locale, FormStyle.Standalone, TranslationWidth.Abbreviated);
    this._monthsFull = getLocaleMonthNames(_locale, FormStyle.Standalone, TranslationWidth.Wide);
  }
  getWeekdayLabel(weekday, width) {
    const weekdaysStartingOnSunday = getLocaleDayNames(this._locale, FormStyle.Standalone, width === void 0 ? TranslationWidth.Short : width);
    const weekdays = weekdaysStartingOnSunday.map((day, index) => weekdaysStartingOnSunday[(index + 1) % 7]);
    return weekdays[weekday - 1] || "";
  }
  getMonthShortName(month) {
    return this._monthsShort[month - 1] || "";
  }
  getMonthFullName(month) {
    return this._monthsFull[month - 1] || "";
  }
  getDayAriaLabel(date) {
    const jsDate = new Date(date.year, date.month - 1, date.day);
    return formatDate(jsDate, "fullDate", this._locale);
  }
}
NgbDatepickerI18nDefault.ɵfac = __ngDeclareFactory({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: NgbDatepickerI18nDefault, deps: [{ token: LOCALE_ID }], target: FactoryTarget.Injectable });
NgbDatepickerI18nDefault.ɵprov = __ngDeclareInjectable({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: NgbDatepickerI18nDefault });
__ngDeclareClassMetadata({ type: NgbDatepickerI18nDefault, decorators: [{
  type: Injectable
}], ctorParameters: function() {
  return [{ type: void 0, decorators: [{
    type: Inject,
    args: [LOCALE_ID]
  }] }];
} });
class NgbDatepickerService {
  constructor(_calendar, _i18n) {
    this._calendar = _calendar;
    this._i18n = _i18n;
    this._VALIDATORS = {
      dayTemplateData: (dayTemplateData) => {
        if (this._state.dayTemplateData !== dayTemplateData) {
          return { dayTemplateData };
        }
      },
      displayMonths: (displayMonths) => {
        displayMonths = toInteger(displayMonths);
        if (isInteger(displayMonths) && displayMonths > 0 && this._state.displayMonths !== displayMonths) {
          return { displayMonths };
        }
      },
      disabled: (disabled) => {
        if (this._state.disabled !== disabled) {
          return { disabled };
        }
      },
      firstDayOfWeek: (firstDayOfWeek) => {
        firstDayOfWeek = toInteger(firstDayOfWeek);
        if (isInteger(firstDayOfWeek) && firstDayOfWeek >= 0 && this._state.firstDayOfWeek !== firstDayOfWeek) {
          return { firstDayOfWeek };
        }
      },
      focusVisible: (focusVisible) => {
        if (this._state.focusVisible !== focusVisible && !this._state.disabled) {
          return { focusVisible };
        }
      },
      markDisabled: (markDisabled) => {
        if (this._state.markDisabled !== markDisabled) {
          return { markDisabled };
        }
      },
      maxDate: (date) => {
        const maxDate = this.toValidDate(date, null);
        if (isChangedDate(this._state.maxDate, maxDate)) {
          return { maxDate };
        }
      },
      minDate: (date) => {
        const minDate = this.toValidDate(date, null);
        if (isChangedDate(this._state.minDate, minDate)) {
          return { minDate };
        }
      },
      navigation: (navigation) => {
        if (this._state.navigation !== navigation) {
          return { navigation };
        }
      },
      outsideDays: (outsideDays) => {
        if (this._state.outsideDays !== outsideDays) {
          return { outsideDays };
        }
      },
      weekdays: (weekdays) => {
        const weekdayWidth = weekdays === true || weekdays === false ? TranslationWidth.Short : weekdays;
        const weekdaysVisible = weekdays === true || weekdays === false ? weekdays : true;
        if (this._state.weekdayWidth !== weekdayWidth || this._state.weekdaysVisible !== weekdaysVisible) {
          return { weekdayWidth, weekdaysVisible };
        }
      }
    };
    this._model$ = new Subject();
    this._dateSelect$ = new Subject();
    this._state = {
      dayTemplateData: null,
      markDisabled: null,
      maxDate: null,
      minDate: null,
      disabled: false,
      displayMonths: 1,
      firstDate: null,
      firstDayOfWeek: 1,
      lastDate: null,
      focusDate: null,
      focusVisible: false,
      months: [],
      navigation: "select",
      outsideDays: "visible",
      prevDisabled: false,
      nextDisabled: false,
      selectedDate: null,
      selectBoxes: { years: [], months: [] },
      weekdayWidth: TranslationWidth.Short,
      weekdaysVisible: true
    };
  }
  get model$() {
    return this._model$.pipe(filter((model) => model.months.length > 0));
  }
  get dateSelect$() {
    return this._dateSelect$.pipe(filter((date) => date !== null));
  }
  set(options) {
    let patch = Object.keys(options).map((key) => this._VALIDATORS[key](options[key])).reduce((obj, part) => ({ ...obj, ...part }), {});
    if (Object.keys(patch).length > 0) {
      this._nextState(patch);
    }
  }
  focus(date) {
    const focusedDate = this.toValidDate(date, null);
    if (focusedDate != null && !this._state.disabled && isChangedDate(this._state.focusDate, focusedDate)) {
      this._nextState({ focusDate: date });
    }
  }
  focusSelect() {
    if (isDateSelectable(this._state.focusDate, this._state)) {
      this.select(this._state.focusDate, { emitEvent: true });
    }
  }
  open(date) {
    const firstDate = this.toValidDate(date, this._calendar.getToday());
    if (firstDate != null && !this._state.disabled && (!this._state.firstDate || isChangedMonth(this._state.firstDate, firstDate))) {
      this._nextState({ firstDate });
    }
  }
  select(date, options = {}) {
    const selectedDate = this.toValidDate(date, null);
    if (selectedDate != null && !this._state.disabled) {
      if (isChangedDate(this._state.selectedDate, selectedDate)) {
        this._nextState({ selectedDate });
      }
      if (options.emitEvent && isDateSelectable(selectedDate, this._state)) {
        this._dateSelect$.next(selectedDate);
      }
    }
  }
  toValidDate(date, defaultValue) {
    const ngbDate = NgbDate.from(date);
    if (defaultValue === void 0) {
      defaultValue = this._calendar.getToday();
    }
    return this._calendar.isValid(ngbDate) ? ngbDate : defaultValue;
  }
  getMonth(struct) {
    for (let month of this._state.months) {
      if (struct.month === month.number && struct.year === month.year) {
        return month;
      }
    }
    throw new Error(`month ${struct.month} of year ${struct.year} not found`);
  }
  _nextState(patch) {
    const newState = this._updateState(patch);
    this._patchContexts(newState);
    this._state = newState;
    this._model$.next(this._state);
  }
  _patchContexts(state2) {
    const { months, displayMonths, selectedDate, focusDate, focusVisible, disabled, outsideDays } = state2;
    state2.months.forEach((month) => {
      month.weeks.forEach((week) => {
        week.days.forEach((day) => {
          if (focusDate) {
            day.context.focused = focusDate.equals(day.date) && focusVisible;
          }
          day.tabindex = !disabled && focusDate && day.date.equals(focusDate) && focusDate.month === month.number ? 0 : -1;
          if (disabled === true) {
            day.context.disabled = true;
          }
          if (selectedDate !== void 0) {
            day.context.selected = selectedDate !== null && selectedDate.equals(day.date);
          }
          if (month.number !== day.date.month) {
            day.hidden = outsideDays === "hidden" || outsideDays === "collapsed" || displayMonths > 1 && day.date.after(months[0].firstDate) && day.date.before(months[displayMonths - 1].lastDate);
          }
        });
      });
    });
  }
  _updateState(patch) {
    const state2 = Object.assign({}, this._state, patch);
    let startDate = state2.firstDate;
    if ("minDate" in patch || "maxDate" in patch) {
      checkMinBeforeMax(state2.minDate, state2.maxDate);
      state2.focusDate = checkDateInRange(state2.focusDate, state2.minDate, state2.maxDate);
      state2.firstDate = checkDateInRange(state2.firstDate, state2.minDate, state2.maxDate);
      startDate = state2.focusDate;
    }
    if ("disabled" in patch) {
      state2.focusVisible = false;
    }
    if ("selectedDate" in patch && this._state.months.length === 0) {
      startDate = state2.selectedDate;
    }
    if ("focusVisible" in patch) {
      return state2;
    }
    if ("focusDate" in patch) {
      state2.focusDate = checkDateInRange(state2.focusDate, state2.minDate, state2.maxDate);
      startDate = state2.focusDate;
      if (state2.months.length !== 0 && state2.focusDate && !state2.focusDate.before(state2.firstDate) && !state2.focusDate.after(state2.lastDate)) {
        return state2;
      }
    }
    if ("firstDate" in patch) {
      state2.firstDate = checkDateInRange(state2.firstDate, state2.minDate, state2.maxDate);
      startDate = state2.firstDate;
    }
    if (startDate) {
      const forceRebuild = "dayTemplateData" in patch || "firstDayOfWeek" in patch || "markDisabled" in patch || "minDate" in patch || "maxDate" in patch || "disabled" in patch || "outsideDays" in patch || "weekdaysVisible" in patch;
      const months = buildMonths(this._calendar, startDate, state2, this._i18n, forceRebuild);
      state2.months = months;
      state2.firstDate = months[0].firstDate;
      state2.lastDate = months[months.length - 1].lastDate;
      if ("selectedDate" in patch && !isDateSelectable(state2.selectedDate, state2)) {
        state2.selectedDate = null;
      }
      if ("firstDate" in patch) {
        if (!state2.focusDate || state2.focusDate.before(state2.firstDate) || state2.focusDate.after(state2.lastDate)) {
          state2.focusDate = startDate;
        }
      }
      const yearChanged = !this._state.firstDate || this._state.firstDate.year !== state2.firstDate.year;
      const monthChanged = !this._state.firstDate || this._state.firstDate.month !== state2.firstDate.month;
      if (state2.navigation === "select") {
        if ("minDate" in patch || "maxDate" in patch || state2.selectBoxes.years.length === 0 || yearChanged) {
          state2.selectBoxes.years = generateSelectBoxYears(state2.firstDate, state2.minDate, state2.maxDate);
        }
        if ("minDate" in patch || "maxDate" in patch || state2.selectBoxes.months.length === 0 || yearChanged) {
          state2.selectBoxes.months = generateSelectBoxMonths(this._calendar, state2.firstDate, state2.minDate, state2.maxDate);
        }
      } else {
        state2.selectBoxes = { years: [], months: [] };
      }
      if ((state2.navigation === "arrows" || state2.navigation === "select") && (monthChanged || yearChanged || "minDate" in patch || "maxDate" in patch || "disabled" in patch)) {
        state2.prevDisabled = state2.disabled || prevMonthDisabled(this._calendar, state2.firstDate, state2.minDate);
        state2.nextDisabled = state2.disabled || nextMonthDisabled(this._calendar, state2.lastDate, state2.maxDate);
      }
    }
    return state2;
  }
}
NgbDatepickerService.ɵfac = __ngDeclareFactory({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: NgbDatepickerService, deps: [{ token: NgbCalendar }, { token: NgbDatepickerI18n }], target: FactoryTarget.Injectable });
NgbDatepickerService.ɵprov = __ngDeclareInjectable({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: NgbDatepickerService });
__ngDeclareClassMetadata({ type: NgbDatepickerService, decorators: [{
  type: Injectable
}], ctorParameters: function() {
  return [{ type: NgbCalendar }, { type: NgbDatepickerI18n }];
} });
var NavigationEvent;
(function(NavigationEvent2) {
  NavigationEvent2[NavigationEvent2["PREV"] = 0] = "PREV";
  NavigationEvent2[NavigationEvent2["NEXT"] = 1] = "NEXT";
})(NavigationEvent || (NavigationEvent = {}));
class NgbDatepickerConfig {
  constructor() {
    this.displayMonths = 1;
    this.firstDayOfWeek = 1;
    this.navigation = "select";
    this.outsideDays = "visible";
    this.showWeekNumbers = false;
    this.weekdays = TranslationWidth.Short;
  }
}
NgbDatepickerConfig.ɵfac = __ngDeclareFactory({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: NgbDatepickerConfig, deps: [], target: FactoryTarget.Injectable });
NgbDatepickerConfig.ɵprov = __ngDeclareInjectable({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: NgbDatepickerConfig, providedIn: "root" });
__ngDeclareClassMetadata({ type: NgbDatepickerConfig, decorators: [{
  type: Injectable,
  args: [{ providedIn: "root" }]
}] });
function NGB_DATEPICKER_DATE_ADAPTER_FACTORY() {
  return new NgbDateStructAdapter();
}
class NgbDateAdapter {
}
NgbDateAdapter.ɵfac = __ngDeclareFactory({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: NgbDateAdapter, deps: [], target: FactoryTarget.Injectable });
NgbDateAdapter.ɵprov = __ngDeclareInjectable({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: NgbDateAdapter, providedIn: "root", useFactory: NGB_DATEPICKER_DATE_ADAPTER_FACTORY });
__ngDeclareClassMetadata({ type: NgbDateAdapter, decorators: [{
  type: Injectable,
  args: [{ providedIn: "root", useFactory: NGB_DATEPICKER_DATE_ADAPTER_FACTORY }]
}] });
class NgbDateStructAdapter extends NgbDateAdapter {
  /**
   * Converts a NgbDateStruct value into NgbDateStruct value
   */
  fromModel(date) {
    return date && isInteger(date.year) && isInteger(date.month) && isInteger(date.day) ? { year: date.year, month: date.month, day: date.day } : null;
  }
  /**
   * Converts a NgbDateStruct value into NgbDateStruct value
   */
  toModel(date) {
    return date && isInteger(date.year) && isInteger(date.month) && isInteger(date.day) ? { year: date.year, month: date.month, day: date.day } : null;
  }
}
NgbDateStructAdapter.ɵfac = __ngDeclareFactory({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: NgbDateStructAdapter, deps: null, target: FactoryTarget.Injectable });
NgbDateStructAdapter.ɵprov = __ngDeclareInjectable({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: NgbDateStructAdapter });
__ngDeclareClassMetadata({ type: NgbDateStructAdapter, decorators: [{
  type: Injectable
}] });
class NgbDatepickerDayView {
  constructor(i18n) {
    this.i18n = i18n;
  }
  isMuted() {
    return !this.selected && (this.date.month !== this.currentMonth || this.disabled);
  }
}
NgbDatepickerDayView.ɵfac = __ngDeclareFactory({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: NgbDatepickerDayView, deps: [{ token: NgbDatepickerI18n }], target: FactoryTarget.Component });
NgbDatepickerDayView.ɵcmp = __ngDeclareComponent({ minVersion: "12.0.0", version: "13.0.3", type: NgbDatepickerDayView, selector: "[ngbDatepickerDayView]", inputs: { currentMonth: "currentMonth", date: "date", disabled: "disabled", focused: "focused", selected: "selected" }, host: { properties: { "class.bg-primary": "selected", "class.text-white": "selected", "class.text-muted": "isMuted()", "class.outside": "isMuted()", "class.active": "focused" }, classAttribute: "btn-light" }, ngImport: i0, template: `{{ i18n.getDayNumerals(date) }}`, isInline: true, styles: ["[ngbDatepickerDayView]{text-align:center;width:2rem;height:2rem;line-height:2rem;border-radius:.25rem;background:transparent}[ngbDatepickerDayView].outside{opacity:.5}\n"], changeDetection: ChangeDetectionStrategy.OnPush, encapsulation: ViewEncapsulation$1.None });
__ngDeclareClassMetadata({ type: NgbDatepickerDayView, decorators: [{
  type: Component,
  args: [{ selector: "[ngbDatepickerDayView]", changeDetection: ChangeDetectionStrategy.OnPush, encapsulation: ViewEncapsulation$1.None, host: {
    "class": "btn-light",
    "[class.bg-primary]": "selected",
    "[class.text-white]": "selected",
    "[class.text-muted]": "isMuted()",
    "[class.outside]": "isMuted()",
    "[class.active]": "focused"
  }, template: `{{ i18n.getDayNumerals(date) }}`, styles: ["[ngbDatepickerDayView]{text-align:center;width:2rem;height:2rem;line-height:2rem;border-radius:.25rem;background:transparent}[ngbDatepickerDayView].outside{opacity:.5}\n"] }]
}], ctorParameters: function() {
  return [{ type: NgbDatepickerI18n }];
}, propDecorators: { currentMonth: [{
  type: Input
}], date: [{
  type: Input
}], disabled: [{
  type: Input
}], focused: [{
  type: Input
}], selected: [{
  type: Input
}] } });
class NgbDatepickerNavigationSelect {
  constructor(i18n, _renderer) {
    this.i18n = i18n;
    this._renderer = _renderer;
    this.select = new EventEmitter();
    this._month = -1;
    this._year = -1;
  }
  changeMonth(month) {
    this.select.emit(new NgbDate(this.date.year, toInteger(month), 1));
  }
  changeYear(year) {
    this.select.emit(new NgbDate(toInteger(year), this.date.month, 1));
  }
  ngAfterViewChecked() {
    if (this.date) {
      if (this.date.month !== this._month) {
        this._month = this.date.month;
        this._renderer.setProperty(this.monthSelect.nativeElement, "value", this._month);
      }
      if (this.date.year !== this._year) {
        this._year = this.date.year;
        this._renderer.setProperty(this.yearSelect.nativeElement, "value", this._year);
      }
    }
  }
}
NgbDatepickerNavigationSelect.ɵfac = __ngDeclareFactory({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: NgbDatepickerNavigationSelect, deps: [{ token: NgbDatepickerI18n }, { token: Renderer2 }], target: FactoryTarget.Component });
NgbDatepickerNavigationSelect.ɵcmp = __ngDeclareComponent({ minVersion: "12.0.0", version: "13.0.3", type: NgbDatepickerNavigationSelect, selector: "ngb-datepicker-navigation-select", inputs: { date: "date", disabled: "disabled", months: "months", years: "years" }, outputs: { select: "select" }, viewQueries: [{ propertyName: "monthSelect", first: true, predicate: ["month"], descendants: true, read: ElementRef, static: true }, { propertyName: "yearSelect", first: true, predicate: ["year"], descendants: true, read: ElementRef, static: true }], ngImport: i0, template: `
    <select #month
      [disabled]="disabled"
      class="form-select"
      i18n-aria-label="@@ngb.datepicker.select-month" aria-label="Select month"
      i18n-title="@@ngb.datepicker.select-month" title="Select month"
      (change)="changeMonth($any($event).target.value)">
        <option *ngFor="let m of months" [attr.aria-label]="i18n.getMonthFullName(m, date?.year)"
                [value]="m">{{ i18n.getMonthShortName(m, date?.year) }}</option>
    </select><select #year
      [disabled]="disabled"
      class="form-select"
      i18n-aria-label="@@ngb.datepicker.select-year" aria-label="Select year"
      i18n-title="@@ngb.datepicker.select-year" title="Select year"
      (change)="changeYear($any($event).target.value)">
        <option *ngFor="let y of years" [value]="y">{{ i18n.getYearNumerals(y) }}</option>
    </select>
  `, isInline: true, styles: ["ngb-datepicker-navigation-select>.form-select{flex:1 1 auto;padding:0 .5rem;font-size:.875rem;height:1.85rem}ngb-datepicker-navigation-select>.form-select:focus{z-index:1}ngb-datepicker-navigation-select>.form-select::-ms-value{background-color:transparent!important}\n"], directives: [{ type: NgForOf, selector: "[ngFor][ngForOf]", inputs: ["ngForOf", "ngForTrackBy", "ngForTemplate"] }, { type: NgSelectOption, selector: "option", inputs: ["ngValue", "value"] }, { type: ɵNgSelectMultipleOption, selector: "option", inputs: ["ngValue", "value"] }], changeDetection: ChangeDetectionStrategy.OnPush, encapsulation: ViewEncapsulation$1.None });
__ngDeclareClassMetadata({ type: NgbDatepickerNavigationSelect, decorators: [{
  type: Component,
  args: [{ selector: "ngb-datepicker-navigation-select", changeDetection: ChangeDetectionStrategy.OnPush, encapsulation: ViewEncapsulation$1.None, template: `
    <select #month
      [disabled]="disabled"
      class="form-select"
      i18n-aria-label="@@ngb.datepicker.select-month" aria-label="Select month"
      i18n-title="@@ngb.datepicker.select-month" title="Select month"
      (change)="changeMonth($any($event).target.value)">
        <option *ngFor="let m of months" [attr.aria-label]="i18n.getMonthFullName(m, date?.year)"
                [value]="m">{{ i18n.getMonthShortName(m, date?.year) }}</option>
    </select><select #year
      [disabled]="disabled"
      class="form-select"
      i18n-aria-label="@@ngb.datepicker.select-year" aria-label="Select year"
      i18n-title="@@ngb.datepicker.select-year" title="Select year"
      (change)="changeYear($any($event).target.value)">
        <option *ngFor="let y of years" [value]="y">{{ i18n.getYearNumerals(y) }}</option>
    </select>
  `, styles: ["ngb-datepicker-navigation-select>.form-select{flex:1 1 auto;padding:0 .5rem;font-size:.875rem;height:1.85rem}ngb-datepicker-navigation-select>.form-select:focus{z-index:1}ngb-datepicker-navigation-select>.form-select::-ms-value{background-color:transparent!important}\n"] }]
}], ctorParameters: function() {
  return [{ type: NgbDatepickerI18n }, { type: Renderer2 }];
}, propDecorators: { date: [{
  type: Input
}], disabled: [{
  type: Input
}], months: [{
  type: Input
}], years: [{
  type: Input
}], select: [{
  type: Output
}], monthSelect: [{
  type: ViewChild,
  args: ["month", { static: true, read: ElementRef }]
}], yearSelect: [{
  type: ViewChild,
  args: ["year", { static: true, read: ElementRef }]
}] } });
class NgbDatepickerNavigation {
  constructor(i18n) {
    this.i18n = i18n;
    this.navigation = NavigationEvent;
    this.months = [];
    this.navigate = new EventEmitter();
    this.select = new EventEmitter();
  }
  onClickPrev(event) {
    event.currentTarget.focus();
    this.navigate.emit(this.navigation.PREV);
  }
  onClickNext(event) {
    event.currentTarget.focus();
    this.navigate.emit(this.navigation.NEXT);
  }
}
NgbDatepickerNavigation.ɵfac = __ngDeclareFactory({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: NgbDatepickerNavigation, deps: [{ token: NgbDatepickerI18n }], target: FactoryTarget.Component });
NgbDatepickerNavigation.ɵcmp = __ngDeclareComponent({ minVersion: "12.0.0", version: "13.0.3", type: NgbDatepickerNavigation, selector: "ngb-datepicker-navigation", inputs: { date: "date", disabled: "disabled", months: "months", showSelect: "showSelect", prevDisabled: "prevDisabled", nextDisabled: "nextDisabled", selectBoxes: "selectBoxes" }, outputs: { navigate: "navigate", select: "select" }, ngImport: i0, template: `
    <div class="ngb-dp-arrow">
      <button type="button" class="btn btn-link ngb-dp-arrow-btn" (click)="onClickPrev($event)" [disabled]="prevDisabled"
              i18n-aria-label="@@ngb.datepicker.previous-month" aria-label="Previous month"
              i18n-title="@@ngb.datepicker.previous-month" title="Previous month">
        <span class="ngb-dp-navigation-chevron"></span>
      </button>
    </div>
    <ngb-datepicker-navigation-select *ngIf="showSelect" class="ngb-dp-navigation-select"
      [date]="date"
      [disabled] = "disabled"
      [months]="selectBoxes.months"
      [years]="selectBoxes.years"
      (select)="select.emit($event)">
    </ngb-datepicker-navigation-select>

    <ng-template *ngIf="!showSelect" ngFor let-month [ngForOf]="months" let-i="index">
      <div class="ngb-dp-arrow" *ngIf="i > 0"></div>
      <div class="ngb-dp-month-name">
        {{ i18n.getMonthLabel(month.firstDate) }}
      </div>
      <div class="ngb-dp-arrow" *ngIf="i !== months.length - 1"></div>
    </ng-template>
    <div class="ngb-dp-arrow right">
      <button type="button" class="btn btn-link ngb-dp-arrow-btn" (click)="onClickNext($event)" [disabled]="nextDisabled"
              i18n-aria-label="@@ngb.datepicker.next-month" aria-label="Next month"
              i18n-title="@@ngb.datepicker.next-month" title="Next month">
        <span class="ngb-dp-navigation-chevron"></span>
      </button>
    </div>
    `, isInline: true, styles: ["ngb-datepicker-navigation{display:flex;align-items:center}.ngb-dp-navigation-chevron{border-style:solid;border-width:.2em .2em 0 0;display:inline-block;width:.75em;height:.75em;margin-left:.25em;margin-right:.15em;transform:rotate(-135deg)}.ngb-dp-arrow{display:flex;flex:1 1 auto;padding-right:0;padding-left:0;margin:0;width:2rem;height:2rem}.ngb-dp-arrow.right{justify-content:flex-end}.ngb-dp-arrow.right .ngb-dp-navigation-chevron{transform:rotate(45deg);margin-left:.15em;margin-right:.25em}.ngb-dp-arrow-btn{padding:0 .25rem;margin:0 .5rem;border:none;background-color:transparent;z-index:1}.ngb-dp-arrow-btn:focus{outline-width:1px;outline-style:auto}@media all and (-ms-high-contrast: none),(-ms-high-contrast: active){.ngb-dp-arrow-btn:focus{outline-style:solid}}.ngb-dp-month-name{font-size:larger;height:2rem;line-height:2rem;text-align:center}.ngb-dp-navigation-select{display:flex;flex:1 1 9rem}\n"], components: [{ type: NgbDatepickerNavigationSelect, selector: "ngb-datepicker-navigation-select", inputs: ["date", "disabled", "months", "years"], outputs: ["select"] }], directives: [{ type: NgIf, selector: "[ngIf]", inputs: ["ngIf", "ngIfThen", "ngIfElse"] }, { type: NgForOf, selector: "[ngFor][ngForOf]", inputs: ["ngForOf", "ngForTrackBy", "ngForTemplate"] }], changeDetection: ChangeDetectionStrategy.OnPush, encapsulation: ViewEncapsulation$1.None });
__ngDeclareClassMetadata({ type: NgbDatepickerNavigation, decorators: [{
  type: Component,
  args: [{ selector: "ngb-datepicker-navigation", changeDetection: ChangeDetectionStrategy.OnPush, encapsulation: ViewEncapsulation$1.None, template: `
    <div class="ngb-dp-arrow">
      <button type="button" class="btn btn-link ngb-dp-arrow-btn" (click)="onClickPrev($event)" [disabled]="prevDisabled"
              i18n-aria-label="@@ngb.datepicker.previous-month" aria-label="Previous month"
              i18n-title="@@ngb.datepicker.previous-month" title="Previous month">
        <span class="ngb-dp-navigation-chevron"></span>
      </button>
    </div>
    <ngb-datepicker-navigation-select *ngIf="showSelect" class="ngb-dp-navigation-select"
      [date]="date"
      [disabled] = "disabled"
      [months]="selectBoxes.months"
      [years]="selectBoxes.years"
      (select)="select.emit($event)">
    </ngb-datepicker-navigation-select>

    <ng-template *ngIf="!showSelect" ngFor let-month [ngForOf]="months" let-i="index">
      <div class="ngb-dp-arrow" *ngIf="i > 0"></div>
      <div class="ngb-dp-month-name">
        {{ i18n.getMonthLabel(month.firstDate) }}
      </div>
      <div class="ngb-dp-arrow" *ngIf="i !== months.length - 1"></div>
    </ng-template>
    <div class="ngb-dp-arrow right">
      <button type="button" class="btn btn-link ngb-dp-arrow-btn" (click)="onClickNext($event)" [disabled]="nextDisabled"
              i18n-aria-label="@@ngb.datepicker.next-month" aria-label="Next month"
              i18n-title="@@ngb.datepicker.next-month" title="Next month">
        <span class="ngb-dp-navigation-chevron"></span>
      </button>
    </div>
    `, styles: ["ngb-datepicker-navigation{display:flex;align-items:center}.ngb-dp-navigation-chevron{border-style:solid;border-width:.2em .2em 0 0;display:inline-block;width:.75em;height:.75em;margin-left:.25em;margin-right:.15em;transform:rotate(-135deg)}.ngb-dp-arrow{display:flex;flex:1 1 auto;padding-right:0;padding-left:0;margin:0;width:2rem;height:2rem}.ngb-dp-arrow.right{justify-content:flex-end}.ngb-dp-arrow.right .ngb-dp-navigation-chevron{transform:rotate(45deg);margin-left:.15em;margin-right:.25em}.ngb-dp-arrow-btn{padding:0 .25rem;margin:0 .5rem;border:none;background-color:transparent;z-index:1}.ngb-dp-arrow-btn:focus{outline-width:1px;outline-style:auto}@media all and (-ms-high-contrast: none),(-ms-high-contrast: active){.ngb-dp-arrow-btn:focus{outline-style:solid}}.ngb-dp-month-name{font-size:larger;height:2rem;line-height:2rem;text-align:center}.ngb-dp-navigation-select{display:flex;flex:1 1 9rem}\n"] }]
}], ctorParameters: function() {
  return [{ type: NgbDatepickerI18n }];
}, propDecorators: { date: [{
  type: Input
}], disabled: [{
  type: Input
}], months: [{
  type: Input
}], showSelect: [{
  type: Input
}], prevDisabled: [{
  type: Input
}], nextDisabled: [{
  type: Input
}], selectBoxes: [{
  type: Input
}], navigate: [{
  type: Output
}], select: [{
  type: Output
}] } });
var Key;
(function(Key2) {
  Key2[Key2["Tab"] = 9] = "Tab";
  Key2[Key2["Enter"] = 13] = "Enter";
  Key2[Key2["Escape"] = 27] = "Escape";
  Key2[Key2["Space"] = 32] = "Space";
  Key2[Key2["PageUp"] = 33] = "PageUp";
  Key2[Key2["PageDown"] = 34] = "PageDown";
  Key2[Key2["End"] = 35] = "End";
  Key2[Key2["Home"] = 36] = "Home";
  Key2[Key2["ArrowLeft"] = 37] = "ArrowLeft";
  Key2[Key2["ArrowUp"] = 38] = "ArrowUp";
  Key2[Key2["ArrowRight"] = 39] = "ArrowRight";
  Key2[Key2["ArrowDown"] = 40] = "ArrowDown";
})(Key || (Key = {}));
class NgbDatepickerKeyboardService {
  /**
   * Processes a keyboard event.
   */
  processKey(event, datepicker) {
    const { state: state2, calendar } = datepicker;
    switch (event.which) {
      case Key.PageUp:
        datepicker.focusDate(calendar.getPrev(state2.focusedDate, event.shiftKey ? "y" : "m", 1));
        break;
      case Key.PageDown:
        datepicker.focusDate(calendar.getNext(state2.focusedDate, event.shiftKey ? "y" : "m", 1));
        break;
      case Key.End:
        datepicker.focusDate(event.shiftKey ? state2.maxDate : state2.lastDate);
        break;
      case Key.Home:
        datepicker.focusDate(event.shiftKey ? state2.minDate : state2.firstDate);
        break;
      case Key.ArrowLeft:
        datepicker.focusDate(calendar.getPrev(state2.focusedDate, "d", 1));
        break;
      case Key.ArrowUp:
        datepicker.focusDate(calendar.getPrev(state2.focusedDate, "d", calendar.getDaysPerWeek()));
        break;
      case Key.ArrowRight:
        datepicker.focusDate(calendar.getNext(state2.focusedDate, "d", 1));
        break;
      case Key.ArrowDown:
        datepicker.focusDate(calendar.getNext(state2.focusedDate, "d", calendar.getDaysPerWeek()));
        break;
      case Key.Enter:
      case Key.Space:
        datepicker.focusSelect();
        break;
      default:
        return;
    }
    event.preventDefault();
    event.stopPropagation();
  }
}
NgbDatepickerKeyboardService.ɵfac = __ngDeclareFactory({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: NgbDatepickerKeyboardService, deps: [], target: FactoryTarget.Injectable });
NgbDatepickerKeyboardService.ɵprov = __ngDeclareInjectable({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: NgbDatepickerKeyboardService, providedIn: "root" });
__ngDeclareClassMetadata({ type: NgbDatepickerKeyboardService, decorators: [{
  type: Injectable,
  args: [{ providedIn: "root" }]
}] });
class NgbDatepickerContent {
  constructor(templateRef) {
    this.templateRef = templateRef;
  }
}
NgbDatepickerContent.ɵfac = __ngDeclareFactory({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: NgbDatepickerContent, deps: [{ token: TemplateRef }], target: FactoryTarget.Directive });
NgbDatepickerContent.ɵdir = __ngDeclareDirective({ minVersion: "12.0.0", version: "13.0.3", type: NgbDatepickerContent, selector: "ng-template[ngbDatepickerContent]", ngImport: i0 });
__ngDeclareClassMetadata({ type: NgbDatepickerContent, decorators: [{
  type: Directive,
  args: [{ selector: "ng-template[ngbDatepickerContent]" }]
}], ctorParameters: function() {
  return [{ type: TemplateRef }];
} });
class NgbDatepicker {
  constructor(_service, _calendar, i18n, config, cd, _elementRef, _ngbDateAdapter, _ngZone) {
    this._service = _service;
    this._calendar = _calendar;
    this.i18n = i18n;
    this._elementRef = _elementRef;
    this._ngbDateAdapter = _ngbDateAdapter;
    this._ngZone = _ngZone;
    this._controlValue = null;
    this._destroyed$ = new Subject();
    this._publicState = {};
    this.navigate = new EventEmitter();
    this.dateSelect = new EventEmitter();
    this.onChange = (_) => {
    };
    this.onTouched = () => {
    };
    [
      "dayTemplate",
      "dayTemplateData",
      "displayMonths",
      "firstDayOfWeek",
      "footerTemplate",
      "markDisabled",
      "minDate",
      "maxDate",
      "navigation",
      "outsideDays",
      "showWeekNumbers",
      "startDate",
      "weekdays"
    ].forEach((input) => this[input] = config[input]);
    _service.dateSelect$.pipe(takeUntil(this._destroyed$)).subscribe((date) => {
      this.dateSelect.emit(date);
    });
    _service.model$.pipe(takeUntil(this._destroyed$)).subscribe((model) => {
      const newDate = model.firstDate;
      const oldDate = this.model ? this.model.firstDate : null;
      this._publicState = {
        maxDate: model.maxDate,
        minDate: model.minDate,
        firstDate: model.firstDate,
        lastDate: model.lastDate,
        focusedDate: model.focusDate,
        months: model.months.map((viewModel) => viewModel.firstDate)
      };
      let navigationPrevented = false;
      if (!newDate.equals(oldDate)) {
        this.navigate.emit({
          current: oldDate ? { year: oldDate.year, month: oldDate.month } : null,
          next: { year: newDate.year, month: newDate.month },
          preventDefault: () => navigationPrevented = true
        });
        if (navigationPrevented && oldDate !== null) {
          this._service.open(oldDate);
          return;
        }
      }
      const newSelectedDate = model.selectedDate;
      const newFocusedDate = model.focusDate;
      const oldFocusedDate = this.model ? this.model.focusDate : null;
      this.model = model;
      if (isChangedDate(newSelectedDate, this._controlValue)) {
        this._controlValue = newSelectedDate;
        this.onTouched();
        this.onChange(this._ngbDateAdapter.toModel(newSelectedDate));
      }
      if (isChangedDate(newFocusedDate, oldFocusedDate) && oldFocusedDate && model.focusVisible) {
        this.focus();
      }
      cd.markForCheck();
    });
  }
  /**
   *  Returns the readonly public state of the datepicker
   *
   * @since 5.2.0
   */
  get state() {
    return this._publicState;
  }
  /**
   *  Returns the calendar service used in the specific datepicker instance.
   *
   *  @since 5.3.0
   */
  get calendar() {
    return this._calendar;
  }
  /**
   *  Focuses on given date.
   */
  focusDate(date) {
    this._service.focus(NgbDate.from(date));
  }
  /**
   *  Selects focused date.
   */
  focusSelect() {
    this._service.focusSelect();
  }
  focus() {
    this._ngZone.onStable.asObservable().pipe(take(1)).subscribe(() => {
      const elementToFocus = this._elementRef.nativeElement.querySelector('div.ngb-dp-day[tabindex="0"]');
      if (elementToFocus) {
        elementToFocus.focus();
      }
    });
  }
  /**
   * Navigates to the provided date.
   *
   * With the default calendar we use ISO 8601: 'month' is 1=Jan ... 12=Dec.
   * If nothing or invalid date provided calendar will open current month.
   *
   * Use the `[startDate]` input as an alternative.
   */
  navigateTo(date) {
    this._service.open(NgbDate.from(date ? date.day ? date : { ...date, day: 1 } : null));
  }
  ngAfterViewInit() {
    this._ngZone.runOutsideAngular(() => {
      const focusIns$ = fromEvent(this._contentEl.nativeElement, "focusin");
      const focusOuts$ = fromEvent(this._contentEl.nativeElement, "focusout");
      const { nativeElement } = this._elementRef;
      merge(focusIns$, focusOuts$).pipe(filter(({ target, relatedTarget }) => !(hasClassName(target, "ngb-dp-day") && hasClassName(relatedTarget, "ngb-dp-day") && nativeElement.contains(target) && nativeElement.contains(relatedTarget))), takeUntil(this._destroyed$)).subscribe(({ type }) => this._ngZone.run(() => this._service.set({ focusVisible: type === "focusin" })));
    });
  }
  ngOnDestroy() {
    this._destroyed$.next();
  }
  ngOnInit() {
    if (this.model === void 0) {
      const inputs = {};
      [
        "dayTemplateData",
        "displayMonths",
        "markDisabled",
        "firstDayOfWeek",
        "navigation",
        "minDate",
        "maxDate",
        "outsideDays",
        "weekdays"
      ].forEach((name) => inputs[name] = this[name]);
      this._service.set(inputs);
      this.navigateTo(this.startDate);
    }
    if (!this.dayTemplate) {
      this.dayTemplate = this._defaultDayTemplate;
    }
  }
  ngOnChanges(changes) {
    const inputs = {};
    [
      "dayTemplateData",
      "displayMonths",
      "markDisabled",
      "firstDayOfWeek",
      "navigation",
      "minDate",
      "maxDate",
      "outsideDays",
      "weekdays"
    ].filter((name) => name in changes).forEach((name) => inputs[name] = this[name]);
    this._service.set(inputs);
    if ("startDate" in changes) {
      const { currentValue, previousValue } = changes.startDate;
      if (isChangedMonth(previousValue, currentValue)) {
        this.navigateTo(this.startDate);
      }
    }
  }
  onDateSelect(date) {
    this._service.focus(date);
    this._service.select(date, { emitEvent: true });
  }
  onNavigateDateSelect(date) {
    this._service.open(date);
  }
  onNavigateEvent(event) {
    switch (event) {
      case NavigationEvent.PREV:
        this._service.open(this._calendar.getPrev(this.model.firstDate, "m", 1));
        break;
      case NavigationEvent.NEXT:
        this._service.open(this._calendar.getNext(this.model.firstDate, "m", 1));
        break;
    }
  }
  registerOnChange(fn2) {
    this.onChange = fn2;
  }
  registerOnTouched(fn2) {
    this.onTouched = fn2;
  }
  setDisabledState(disabled) {
    this._service.set({ disabled });
  }
  writeValue(value) {
    this._controlValue = NgbDate.from(this._ngbDateAdapter.fromModel(value));
    this._service.select(this._controlValue);
  }
}
NgbDatepicker.ɵfac = __ngDeclareFactory({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: NgbDatepicker, deps: [{ token: NgbDatepickerService }, { token: NgbCalendar }, { token: NgbDatepickerI18n }, { token: NgbDatepickerConfig }, { token: ChangeDetectorRef }, { token: ElementRef }, { token: NgbDateAdapter }, { token: NgZone }], target: FactoryTarget.Component });
NgbDatepicker.ɵcmp = __ngDeclareComponent({ minVersion: "12.0.0", version: "13.0.3", type: NgbDatepicker, selector: "ngb-datepicker", inputs: { dayTemplate: "dayTemplate", dayTemplateData: "dayTemplateData", displayMonths: "displayMonths", firstDayOfWeek: "firstDayOfWeek", footerTemplate: "footerTemplate", markDisabled: "markDisabled", maxDate: "maxDate", minDate: "minDate", navigation: "navigation", outsideDays: "outsideDays", showWeekNumbers: "showWeekNumbers", startDate: "startDate", weekdays: "weekdays" }, outputs: { navigate: "navigate", dateSelect: "dateSelect" }, providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => NgbDatepicker), multi: true }, NgbDatepickerService], queries: [{ propertyName: "contentTemplate", first: true, predicate: NgbDatepickerContent, descendants: true, static: true }], viewQueries: [{ propertyName: "_defaultDayTemplate", first: true, predicate: ["defaultDayTemplate"], descendants: true, static: true }, { propertyName: "_contentEl", first: true, predicate: ["content"], descendants: true, static: true }], exportAs: ["ngbDatepicker"], usesOnChanges: true, ngImport: i0, template: `
    <ng-template #defaultDayTemplate let-date="date" let-currentMonth="currentMonth" let-selected="selected"
                 let-disabled="disabled" let-focused="focused">
      <div ngbDatepickerDayView
        [date]="date"
        [currentMonth]="currentMonth"
        [selected]="selected"
        [disabled]="disabled"
        [focused]="focused">
      </div>
    </ng-template>

    <ng-template #defaultContentTemplate>
      <div *ngFor="let month of model.months; let i = index;" class="ngb-dp-month">
        <div *ngIf="navigation === 'none' || (displayMonths > 1 && navigation === 'select')" class="ngb-dp-month-name">
          {{ i18n.getMonthLabel(month.firstDate) }}
        </div>
        <ngb-datepicker-month [month]="month.firstDate"></ngb-datepicker-month>
      </div>
    </ng-template>

    <div class="ngb-dp-header">
      <ngb-datepicker-navigation *ngIf="navigation !== 'none'"
        [date]="model.firstDate!"
        [months]="model.months"
        [disabled]="model.disabled"
        [showSelect]="model.navigation === 'select'"
        [prevDisabled]="model.prevDisabled"
        [nextDisabled]="model.nextDisabled"
        [selectBoxes]="model.selectBoxes"
        (navigate)="onNavigateEvent($event)"
        (select)="onNavigateDateSelect($event)">
      </ngb-datepicker-navigation>
    </div>

    <div class="ngb-dp-content" [class.ngb-dp-months]="!contentTemplate" #content>
      <ng-template [ngTemplateOutlet]="contentTemplate?.templateRef || defaultContentTemplate"></ng-template>
    </div>

    <ng-template [ngTemplateOutlet]="footerTemplate"></ng-template>
  `, isInline: true, styles: ["ngb-datepicker{border:1px solid #dfdfdf;border-radius:.25rem;display:inline-block}ngb-datepicker-month{pointer-events:auto}ngb-datepicker.dropdown-menu{padding:0}.ngb-dp-body{z-index:1055}.ngb-dp-header{border-bottom:0;border-radius:.25rem .25rem 0 0;padding-top:.25rem;background-color:#f8f9fa;background-color:var(--bs-light)}.ngb-dp-months{display:flex}.ngb-dp-month{pointer-events:none}.ngb-dp-month-name{font-size:larger;height:2rem;line-height:2rem;text-align:center;background-color:#f8f9fa;background-color:var(--bs-light)}.ngb-dp-month+.ngb-dp-month .ngb-dp-month-name,.ngb-dp-month+.ngb-dp-month .ngb-dp-week{padding-left:1rem}.ngb-dp-month:last-child .ngb-dp-week{padding-right:.25rem}.ngb-dp-month:first-child .ngb-dp-week{padding-left:.25rem}.ngb-dp-month .ngb-dp-week:last-child{padding-bottom:.25rem}\n"], components: [{ type: forwardRef(function() {
  return NgbDatepickerDayView;
}), selector: "[ngbDatepickerDayView]", inputs: ["currentMonth", "date", "disabled", "focused", "selected"] }, { type: forwardRef(function() {
  return NgbDatepickerMonth;
}), selector: "ngb-datepicker-month", inputs: ["month"] }, { type: forwardRef(function() {
  return NgbDatepickerNavigation;
}), selector: "ngb-datepicker-navigation", inputs: ["date", "disabled", "months", "showSelect", "prevDisabled", "nextDisabled", "selectBoxes"], outputs: ["navigate", "select"] }], directives: [{ type: forwardRef(function() {
  return NgForOf;
}), selector: "[ngFor][ngForOf]", inputs: ["ngForOf", "ngForTrackBy", "ngForTemplate"] }, { type: forwardRef(function() {
  return NgIf;
}), selector: "[ngIf]", inputs: ["ngIf", "ngIfThen", "ngIfElse"] }, { type: forwardRef(function() {
  return NgTemplateOutlet;
}), selector: "[ngTemplateOutlet]", inputs: ["ngTemplateOutletContext", "ngTemplateOutlet"] }], changeDetection: ChangeDetectionStrategy.OnPush, encapsulation: ViewEncapsulation$1.None });
__ngDeclareClassMetadata({ type: NgbDatepicker, decorators: [{
  type: Component,
  args: [{ exportAs: "ngbDatepicker", selector: "ngb-datepicker", changeDetection: ChangeDetectionStrategy.OnPush, encapsulation: ViewEncapsulation$1.None, template: `
    <ng-template #defaultDayTemplate let-date="date" let-currentMonth="currentMonth" let-selected="selected"
                 let-disabled="disabled" let-focused="focused">
      <div ngbDatepickerDayView
        [date]="date"
        [currentMonth]="currentMonth"
        [selected]="selected"
        [disabled]="disabled"
        [focused]="focused">
      </div>
    </ng-template>

    <ng-template #defaultContentTemplate>
      <div *ngFor="let month of model.months; let i = index;" class="ngb-dp-month">
        <div *ngIf="navigation === 'none' || (displayMonths > 1 && navigation === 'select')" class="ngb-dp-month-name">
          {{ i18n.getMonthLabel(month.firstDate) }}
        </div>
        <ngb-datepicker-month [month]="month.firstDate"></ngb-datepicker-month>
      </div>
    </ng-template>

    <div class="ngb-dp-header">
      <ngb-datepicker-navigation *ngIf="navigation !== 'none'"
        [date]="model.firstDate!"
        [months]="model.months"
        [disabled]="model.disabled"
        [showSelect]="model.navigation === 'select'"
        [prevDisabled]="model.prevDisabled"
        [nextDisabled]="model.nextDisabled"
        [selectBoxes]="model.selectBoxes"
        (navigate)="onNavigateEvent($event)"
        (select)="onNavigateDateSelect($event)">
      </ngb-datepicker-navigation>
    </div>

    <div class="ngb-dp-content" [class.ngb-dp-months]="!contentTemplate" #content>
      <ng-template [ngTemplateOutlet]="contentTemplate?.templateRef || defaultContentTemplate"></ng-template>
    </div>

    <ng-template [ngTemplateOutlet]="footerTemplate"></ng-template>
  `, providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => NgbDatepicker), multi: true }, NgbDatepickerService], styles: ["ngb-datepicker{border:1px solid #dfdfdf;border-radius:.25rem;display:inline-block}ngb-datepicker-month{pointer-events:auto}ngb-datepicker.dropdown-menu{padding:0}.ngb-dp-body{z-index:1055}.ngb-dp-header{border-bottom:0;border-radius:.25rem .25rem 0 0;padding-top:.25rem;background-color:#f8f9fa;background-color:var(--bs-light)}.ngb-dp-months{display:flex}.ngb-dp-month{pointer-events:none}.ngb-dp-month-name{font-size:larger;height:2rem;line-height:2rem;text-align:center;background-color:#f8f9fa;background-color:var(--bs-light)}.ngb-dp-month+.ngb-dp-month .ngb-dp-month-name,.ngb-dp-month+.ngb-dp-month .ngb-dp-week{padding-left:1rem}.ngb-dp-month:last-child .ngb-dp-week{padding-right:.25rem}.ngb-dp-month:first-child .ngb-dp-week{padding-left:.25rem}.ngb-dp-month .ngb-dp-week:last-child{padding-bottom:.25rem}\n"] }]
}], ctorParameters: function() {
  return [{ type: NgbDatepickerService }, { type: NgbCalendar }, { type: NgbDatepickerI18n }, { type: NgbDatepickerConfig }, { type: ChangeDetectorRef }, { type: ElementRef }, { type: NgbDateAdapter }, { type: NgZone }];
}, propDecorators: { _defaultDayTemplate: [{
  type: ViewChild,
  args: ["defaultDayTemplate", { static: true }]
}], _contentEl: [{
  type: ViewChild,
  args: ["content", { static: true }]
}], contentTemplate: [{
  type: ContentChild,
  args: [NgbDatepickerContent, { static: true }]
}], dayTemplate: [{
  type: Input
}], dayTemplateData: [{
  type: Input
}], displayMonths: [{
  type: Input
}], firstDayOfWeek: [{
  type: Input
}], footerTemplate: [{
  type: Input
}], markDisabled: [{
  type: Input
}], maxDate: [{
  type: Input
}], minDate: [{
  type: Input
}], navigation: [{
  type: Input
}], outsideDays: [{
  type: Input
}], showWeekNumbers: [{
  type: Input
}], startDate: [{
  type: Input
}], weekdays: [{
  type: Input
}], navigate: [{
  type: Output
}], dateSelect: [{
  type: Output
}] } });
class NgbDatepickerMonth {
  constructor(i18n, datepicker, _keyboardService, _service) {
    this.i18n = i18n;
    this.datepicker = datepicker;
    this._keyboardService = _keyboardService;
    this._service = _service;
  }
  /**
   * The first date of month to be rendered.
   *
   * This month must one of the months present in the
   * [datepicker state](#/components/datepicker/api#NgbDatepickerState).
   */
  set month(month) {
    this.viewModel = this._service.getMonth(month);
  }
  onKeyDown(event) {
    this._keyboardService.processKey(event, this.datepicker);
  }
  doSelect(day) {
    if (!day.context.disabled && !day.hidden) {
      this.datepicker.onDateSelect(day.date);
    }
  }
}
NgbDatepickerMonth.ɵfac = __ngDeclareFactory({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: NgbDatepickerMonth, deps: [{ token: NgbDatepickerI18n }, { token: NgbDatepicker }, { token: NgbDatepickerKeyboardService }, { token: NgbDatepickerService }], target: FactoryTarget.Component });
NgbDatepickerMonth.ɵcmp = __ngDeclareComponent({ minVersion: "12.0.0", version: "13.0.3", type: NgbDatepickerMonth, selector: "ngb-datepicker-month", inputs: { month: "month" }, host: { attributes: { "role": "grid" }, listeners: { "keydown": "onKeyDown($event)" } }, ngImport: i0, template: `
    <div *ngIf="viewModel.weekdays.length > 0" class="ngb-dp-week ngb-dp-weekdays" role="row">
      <div *ngIf="datepicker.showWeekNumbers" class="ngb-dp-weekday ngb-dp-showweek small">{{ i18n.getWeekLabel() }}</div>
      <div *ngFor="let weekday of viewModel.weekdays" class="ngb-dp-weekday small" role="columnheader">{{ weekday }}</div>
    </div>
    <ng-template ngFor let-week [ngForOf]="viewModel.weeks">
      <div *ngIf="!week.collapsed" class="ngb-dp-week" role="row">
        <div *ngIf="datepicker.showWeekNumbers" class="ngb-dp-week-number small text-muted">{{ i18n.getWeekNumerals(week.number) }}</div>
        <div *ngFor="let day of week.days" (click)="doSelect(day); $event.preventDefault()" class="ngb-dp-day" role="gridcell"
             [class.disabled]="day.context.disabled"
             [tabindex]="day.tabindex"
             [class.hidden]="day.hidden"
             [class.ngb-dp-today]="day.context.today"
             [attr.aria-label]="day.ariaLabel">
          <ng-template [ngIf]="!day.hidden">
            <ng-template [ngTemplateOutlet]="datepicker.dayTemplate" [ngTemplateOutletContext]="day.context"></ng-template>
          </ng-template>
        </div>
      </div>
    </ng-template>
  `, isInline: true, styles: ['ngb-datepicker-month{display:block}.ngb-dp-weekday,.ngb-dp-week-number{line-height:2rem;text-align:center;font-style:italic}.ngb-dp-weekday{color:#0dcaf0;color:var(--bs-info)}.ngb-dp-week{border-radius:.25rem;display:flex}.ngb-dp-weekdays{border-bottom:1px solid rgba(0,0,0,.125);border-radius:0;background-color:#f8f9fa;background-color:var(--bs-light)}.ngb-dp-day,.ngb-dp-weekday,.ngb-dp-week-number{width:2rem;height:2rem}.ngb-dp-day{cursor:pointer}.ngb-dp-day.disabled,.ngb-dp-day.hidden{cursor:default;pointer-events:none}.ngb-dp-day[tabindex="0"]{z-index:1}\n'], directives: [{ type: NgIf, selector: "[ngIf]", inputs: ["ngIf", "ngIfThen", "ngIfElse"] }, { type: NgForOf, selector: "[ngFor][ngForOf]", inputs: ["ngForOf", "ngForTrackBy", "ngForTemplate"] }, { type: NgTemplateOutlet, selector: "[ngTemplateOutlet]", inputs: ["ngTemplateOutletContext", "ngTemplateOutlet"] }], encapsulation: ViewEncapsulation$1.None });
__ngDeclareClassMetadata({ type: NgbDatepickerMonth, decorators: [{
  type: Component,
  args: [{ selector: "ngb-datepicker-month", host: { "role": "grid", "(keydown)": "onKeyDown($event)" }, encapsulation: ViewEncapsulation$1.None, template: `
    <div *ngIf="viewModel.weekdays.length > 0" class="ngb-dp-week ngb-dp-weekdays" role="row">
      <div *ngIf="datepicker.showWeekNumbers" class="ngb-dp-weekday ngb-dp-showweek small">{{ i18n.getWeekLabel() }}</div>
      <div *ngFor="let weekday of viewModel.weekdays" class="ngb-dp-weekday small" role="columnheader">{{ weekday }}</div>
    </div>
    <ng-template ngFor let-week [ngForOf]="viewModel.weeks">
      <div *ngIf="!week.collapsed" class="ngb-dp-week" role="row">
        <div *ngIf="datepicker.showWeekNumbers" class="ngb-dp-week-number small text-muted">{{ i18n.getWeekNumerals(week.number) }}</div>
        <div *ngFor="let day of week.days" (click)="doSelect(day); $event.preventDefault()" class="ngb-dp-day" role="gridcell"
             [class.disabled]="day.context.disabled"
             [tabindex]="day.tabindex"
             [class.hidden]="day.hidden"
             [class.ngb-dp-today]="day.context.today"
             [attr.aria-label]="day.ariaLabel">
          <ng-template [ngIf]="!day.hidden">
            <ng-template [ngTemplateOutlet]="datepicker.dayTemplate" [ngTemplateOutletContext]="day.context"></ng-template>
          </ng-template>
        </div>
      </div>
    </ng-template>
  `, styles: ['ngb-datepicker-month{display:block}.ngb-dp-weekday,.ngb-dp-week-number{line-height:2rem;text-align:center;font-style:italic}.ngb-dp-weekday{color:#0dcaf0;color:var(--bs-info)}.ngb-dp-week{border-radius:.25rem;display:flex}.ngb-dp-weekdays{border-bottom:1px solid rgba(0,0,0,.125);border-radius:0;background-color:#f8f9fa;background-color:var(--bs-light)}.ngb-dp-day,.ngb-dp-weekday,.ngb-dp-week-number{width:2rem;height:2rem}.ngb-dp-day{cursor:pointer}.ngb-dp-day.disabled,.ngb-dp-day.hidden{cursor:default;pointer-events:none}.ngb-dp-day[tabindex="0"]{z-index:1}\n'] }]
}], ctorParameters: function() {
  return [{ type: NgbDatepickerI18n }, { type: NgbDatepicker }, { type: NgbDatepickerKeyboardService }, { type: NgbDatepickerService }];
}, propDecorators: { month: [{
  type: Input
}] } });
const isContainedIn = (element, array) => array ? array.some((item) => item.contains(element)) : false;
const matchesSelectorIfAny = (element, selector) => !selector || closest(element, selector) != null;
const isMobile = (() => {
  const isIOS = () => /iPad|iPhone|iPod/.test(navigator.userAgent) || /Macintosh/.test(navigator.userAgent) && navigator.maxTouchPoints && navigator.maxTouchPoints > 2;
  const isAndroid = () => /Android/.test(navigator.userAgent);
  return typeof navigator !== "undefined" ? !!navigator.userAgent && (isIOS() || isAndroid()) : false;
})();
const wrapAsyncForMobile = (fn2) => isMobile ? () => setTimeout(() => fn2(), 100) : fn2;
function ngbAutoClose(zone, document2, type, close, closed$, insideElements, ignoreElements, insideSelector) {
  if (type) {
    zone.runOutsideAngular(wrapAsyncForMobile(() => {
      const shouldCloseOnClick = (event) => {
        const element = event.target;
        if (event.button === 2 || isContainedIn(element, ignoreElements)) {
          return false;
        }
        if (type === "inside") {
          return isContainedIn(element, insideElements) && matchesSelectorIfAny(element, insideSelector);
        } else if (type === "outside") {
          return !isContainedIn(element, insideElements);
        } else {
          return matchesSelectorIfAny(element, insideSelector) || !isContainedIn(element, insideElements);
        }
      };
      const escapes$ = fromEvent(document2, "keydown").pipe(
        takeUntil(closed$),
        /* eslint-disable-next-line deprecation/deprecation */
        filter((e) => e.which === Key.Escape),
        tap((e) => e.preventDefault())
      );
      const mouseDowns$ = fromEvent(document2, "mousedown").pipe(map(shouldCloseOnClick), takeUntil(closed$));
      const closeableClicks$ = fromEvent(document2, "mouseup").pipe(withLatestFrom(mouseDowns$), filter(([_, shouldClose]) => shouldClose), delay(0), takeUntil(closed$));
      race([
        escapes$.pipe(map(
          (_) => 0
          /* ESCAPE */
        )),
        closeableClicks$.pipe(map(
          (_) => 1
          /* CLICK */
        ))
      ]).subscribe((source) => zone.run(() => close(source)));
    }));
  }
}
const FOCUSABLE_ELEMENTS_SELECTOR = [
  "a[href]",
  "button:not([disabled])",
  'input:not([disabled]):not([type="hidden"])',
  "select:not([disabled])",
  "textarea:not([disabled])",
  "[contenteditable]",
  '[tabindex]:not([tabindex="-1"])'
].join(", ");
function getFocusableBoundaryElements(element) {
  const list = Array.from(element.querySelectorAll(FOCUSABLE_ELEMENTS_SELECTOR)).filter((el) => el.tabIndex !== -1);
  return [list[0], list[list.length - 1]];
}
const ngbFocusTrap = (zone, element, stopFocusTrap$, refocusOnClick = false) => {
  zone.runOutsideAngular(() => {
    const lastFocusedElement$ = fromEvent(element, "focusin").pipe(takeUntil(stopFocusTrap$), map((e) => e.target));
    fromEvent(element, "keydown").pipe(
      takeUntil(stopFocusTrap$),
      /* eslint-disable-next-line deprecation/deprecation */
      filter((e) => e.which === Key.Tab),
      withLatestFrom(lastFocusedElement$)
    ).subscribe(([tabEvent, focusedElement]) => {
      const [first2, last] = getFocusableBoundaryElements(element);
      if ((focusedElement === first2 || focusedElement === element) && tabEvent.shiftKey) {
        last.focus();
        tabEvent.preventDefault();
      }
      if (focusedElement === last && !tabEvent.shiftKey) {
        first2.focus();
        tabEvent.preventDefault();
      }
    });
    if (refocusOnClick) {
      fromEvent(element, "click").pipe(takeUntil(stopFocusTrap$), withLatestFrom(lastFocusedElement$), map((arr) => arr[1])).subscribe((lastFocusedElement) => lastFocusedElement.focus());
    }
  });
};
const placementSeparator = /\s+/;
const spacesRegExp = /  +/gi;
const startPrimaryPlacement = /^start/;
const endPrimaryPlacement = /^end/;
const startSecondaryPlacement = /-(top|left)$/;
const endSecondaryPlacement = /-(bottom|right)$/;
function getPopperClassPlacement(placement) {
  const newPlacement = placement.replace(startPrimaryPlacement, "left").replace(endPrimaryPlacement, "right").replace(startSecondaryPlacement, "-start").replace(endSecondaryPlacement, "-end");
  return newPlacement;
}
const popperStartPrimaryPlacement = /^left/;
const popperEndPrimaryPlacement = /^right/;
const popperStartSecondaryPlacement = /^start/;
const popperEndSecondaryPlacement = /^end/;
function getBootstrapBaseClassPlacement(baseClass, placement) {
  let [primary, secondary] = placement.split("-");
  const newPrimary = primary.replace(popperStartPrimaryPlacement, "start").replace(popperEndPrimaryPlacement, "end");
  let classnames = [newPrimary];
  if (secondary) {
    let newSecondary = secondary;
    if (primary === "left" || primary === "right") {
      newSecondary = newSecondary.replace(popperStartSecondaryPlacement, "top").replace(popperEndSecondaryPlacement, "bottom");
    }
    classnames.push(`${newPrimary}-${newSecondary}`);
  }
  if (baseClass) {
    classnames = classnames.map((classname) => `${baseClass}-${classname}`);
  }
  return classnames.join(" ");
}
function getPopperOptions({ placement, baseClass }) {
  let placementVals = Array.isArray(placement) ? placement : placement.split(placementSeparator);
  const allowedPlacements = [
    "top",
    "bottom",
    "start",
    "end",
    "top-start",
    "top-end",
    "bottom-start",
    "bottom-end",
    "start-top",
    "start-bottom",
    "end-top",
    "end-bottom"
  ];
  let hasAuto = placementVals.findIndex((val) => val === "auto");
  if (hasAuto >= 0) {
    allowedPlacements.forEach(function(obj) {
      if (placementVals.find((val) => val.search("^" + obj) !== -1) == null) {
        placementVals.splice(hasAuto++, 1, obj);
      }
    });
  }
  const popperPlacements = placementVals.map((_placement) => {
    return getPopperClassPlacement(_placement);
  });
  let mainPlacement = popperPlacements.shift();
  const bsModifier = {
    name: "bootstrapClasses",
    enabled: !!baseClass,
    phase: "write",
    fn({ state: state2 }) {
      const bsClassRegExp = new RegExp(baseClass + "(-[a-z]+)*", "gi");
      const popperElement = state2.elements.popper;
      const popperPlacement = state2.placement;
      let className = popperElement.className;
      className = className.replace(bsClassRegExp, "");
      className += ` ${getBootstrapBaseClassPlacement(baseClass, popperPlacement)}`;
      className = className.trim().replace(spacesRegExp, " ");
      popperElement.className = className;
    }
  };
  return {
    placement: mainPlacement,
    modifiers: [
      bsModifier,
      flip$1,
      preventOverflow$1,
      arrow$1,
      {
        enabled: true,
        name: "flip",
        options: {
          fallbackPlacements: popperPlacements
        }
      },
      {
        enabled: true,
        name: "preventOverflow",
        phase: "main",
        fn: function() {
        }
      }
    ]
  };
}
function noop(arg) {
  return arg;
}
function ngbPositioning() {
  let popperInstance = null;
  return {
    createPopper(positioningOption) {
      if (!popperInstance) {
        const updatePopperOptions = positioningOption.updatePopperOptions || noop;
        let popperOptions = updatePopperOptions(getPopperOptions(positioningOption));
        popperInstance = createPopper(positioningOption.hostElement, positioningOption.targetElement, popperOptions);
      }
    },
    update() {
      if (popperInstance) {
        popperInstance.update();
      }
    },
    setOptions(positioningOption) {
      if (popperInstance) {
        const updatePopperOptions = positioningOption.updatePopperOptions || noop;
        let popperOptions = updatePopperOptions(getPopperOptions(positioningOption));
        popperInstance.setOptions(popperOptions);
      }
    },
    destroy() {
      if (popperInstance) {
        popperInstance.destroy();
        popperInstance = null;
      }
    }
  };
}
class NgbInputDatepickerConfig extends NgbDatepickerConfig {
  constructor() {
    super(...arguments);
    this.autoClose = true;
    this.placement = ["bottom-start", "bottom-end", "top-start", "top-end"];
    this.restoreFocus = true;
  }
}
NgbInputDatepickerConfig.ɵfac = __ngDeclareFactory({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: NgbInputDatepickerConfig, deps: null, target: FactoryTarget.Injectable });
NgbInputDatepickerConfig.ɵprov = __ngDeclareInjectable({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: NgbInputDatepickerConfig, providedIn: "root" });
__ngDeclareClassMetadata({ type: NgbInputDatepickerConfig, decorators: [{
  type: Injectable,
  args: [{ providedIn: "root" }]
}] });
function addPopperOffset(offset$1$1) {
  return (options) => {
    options.modifiers.push(offset$1, {
      name: "offset",
      options: {
        offset: () => offset$1$1
      }
    });
    return options;
  };
}
function NGB_DATEPICKER_PARSER_FORMATTER_FACTORY() {
  return new NgbDateISOParserFormatter();
}
class NgbDateParserFormatter {
}
NgbDateParserFormatter.ɵfac = __ngDeclareFactory({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: NgbDateParserFormatter, deps: [], target: FactoryTarget.Injectable });
NgbDateParserFormatter.ɵprov = __ngDeclareInjectable({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: NgbDateParserFormatter, providedIn: "root", useFactory: NGB_DATEPICKER_PARSER_FORMATTER_FACTORY });
__ngDeclareClassMetadata({ type: NgbDateParserFormatter, decorators: [{
  type: Injectable,
  args: [{ providedIn: "root", useFactory: NGB_DATEPICKER_PARSER_FORMATTER_FACTORY }]
}] });
class NgbDateISOParserFormatter extends NgbDateParserFormatter {
  parse(value) {
    if (value != null) {
      const dateParts = value.trim().split("-");
      if (dateParts.length === 1 && isNumber(dateParts[0])) {
        return { year: toInteger(dateParts[0]), month: null, day: null };
      } else if (dateParts.length === 2 && isNumber(dateParts[0]) && isNumber(dateParts[1])) {
        return { year: toInteger(dateParts[0]), month: toInteger(dateParts[1]), day: null };
      } else if (dateParts.length === 3 && isNumber(dateParts[0]) && isNumber(dateParts[1]) && isNumber(dateParts[2])) {
        return { year: toInteger(dateParts[0]), month: toInteger(dateParts[1]), day: toInteger(dateParts[2]) };
      }
    }
    return null;
  }
  format(date) {
    return date ? `${date.year}-${isNumber(date.month) ? padNumber(date.month) : ""}-${isNumber(date.day) ? padNumber(date.day) : ""}` : "";
  }
}
NgbDateISOParserFormatter.ɵfac = __ngDeclareFactory({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: NgbDateISOParserFormatter, deps: null, target: FactoryTarget.Injectable });
NgbDateISOParserFormatter.ɵprov = __ngDeclareInjectable({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: NgbDateISOParserFormatter });
__ngDeclareClassMetadata({ type: NgbDateISOParserFormatter, decorators: [{
  type: Injectable
}] });
class NgbInputDatepicker {
  constructor(_parserFormatter, _elRef, _vcRef, _renderer, _ngZone, _calendar, _dateAdapter, _document, _changeDetector, config) {
    this._parserFormatter = _parserFormatter;
    this._elRef = _elRef;
    this._vcRef = _vcRef;
    this._renderer = _renderer;
    this._ngZone = _ngZone;
    this._calendar = _calendar;
    this._dateAdapter = _dateAdapter;
    this._document = _document;
    this._changeDetector = _changeDetector;
    this._cRef = null;
    this._disabled = false;
    this._elWithFocus = null;
    this._model = null;
    this._positioning = ngbPositioning();
    this._destroyCloseHandlers$ = new Subject();
    this.dateSelect = new EventEmitter();
    this.navigate = new EventEmitter();
    this.closed = new EventEmitter();
    this._onChange = (_) => {
    };
    this._onTouched = () => {
    };
    this._validatorChange = () => {
    };
    ["autoClose", "container", "positionTarget", "placement"].forEach((input) => this[input] = config[input]);
  }
  get disabled() {
    return this._disabled;
  }
  set disabled(value) {
    this._disabled = value === "" || value && value !== "false";
    if (this.isOpen()) {
      this._cRef.instance.setDisabledState(this._disabled);
    }
  }
  registerOnChange(fn2) {
    this._onChange = fn2;
  }
  registerOnTouched(fn2) {
    this._onTouched = fn2;
  }
  registerOnValidatorChange(fn2) {
    this._validatorChange = fn2;
  }
  setDisabledState(isDisabled) {
    this.disabled = isDisabled;
  }
  validate(c) {
    const { value } = c;
    if (value != null) {
      const ngbDate = this._fromDateStruct(this._dateAdapter.fromModel(value));
      if (!ngbDate) {
        return { "ngbDate": { invalid: value } };
      }
      if (this.minDate && ngbDate.before(NgbDate.from(this.minDate))) {
        return { "ngbDate": { minDate: { minDate: this.minDate, actual: value } } };
      }
      if (this.maxDate && ngbDate.after(NgbDate.from(this.maxDate))) {
        return { "ngbDate": { maxDate: { maxDate: this.maxDate, actual: value } } };
      }
    }
    return null;
  }
  writeValue(value) {
    this._model = this._fromDateStruct(this._dateAdapter.fromModel(value));
    this._writeModelValue(this._model);
  }
  manualDateChange(value, updateView = false) {
    const inputValueChanged = value !== this._inputValue;
    if (inputValueChanged) {
      this._inputValue = value;
      this._model = this._fromDateStruct(this._parserFormatter.parse(value));
    }
    if (inputValueChanged || !updateView) {
      this._onChange(this._model ? this._dateAdapter.toModel(this._model) : value === "" ? null : value);
    }
    if (updateView && this._model) {
      this._writeModelValue(this._model);
    }
  }
  isOpen() {
    return !!this._cRef;
  }
  /**
   * Opens the datepicker popup.
   *
   * If the related form control contains a valid date, the corresponding month will be opened.
   */
  open() {
    if (!this.isOpen()) {
      this._cRef = this._vcRef.createComponent(NgbDatepicker);
      this._applyPopupStyling(this._cRef.location.nativeElement);
      this._applyDatepickerInputs(this._cRef.instance);
      this._subscribeForDatepickerOutputs(this._cRef.instance);
      this._cRef.instance.ngOnInit();
      this._cRef.instance.writeValue(this._dateAdapter.toModel(this._model));
      this._cRef.instance.registerOnChange((selectedDate) => {
        this.writeValue(selectedDate);
        this._onChange(selectedDate);
        this._onTouched();
      });
      this._cRef.changeDetectorRef.detectChanges();
      this._cRef.instance.setDisabledState(this.disabled);
      if (this.container === "body") {
        this._document.querySelector(this.container).appendChild(this._cRef.location.nativeElement);
      }
      this._elWithFocus = this._document.activeElement;
      ngbFocusTrap(this._ngZone, this._cRef.location.nativeElement, this.closed, true);
      setTimeout(() => this._cRef?.instance.focus());
      let hostElement;
      if (isString(this.positionTarget)) {
        hostElement = this._document.querySelector(this.positionTarget);
      } else if (this.positionTarget instanceof HTMLElement) {
        hostElement = this.positionTarget;
      } else {
        hostElement = this._elRef.nativeElement;
      }
      this._ngZone.runOutsideAngular(() => {
        if (this._cRef) {
          this._positioning.createPopper({
            hostElement,
            targetElement: this._cRef.location.nativeElement,
            placement: this.placement,
            appendToBody: this.container === "body",
            updatePopperOptions: addPopperOffset([0, 2])
          });
          this._zoneSubscription = this._ngZone.onStable.subscribe(() => this._positioning.update());
        }
      });
      if (this.positionTarget && !hostElement) {
        throw new Error("ngbDatepicker could not find element declared in [positionTarget] to position against.");
      }
      this._setCloseHandlers();
    }
  }
  /**
   * Closes the datepicker popup.
   */
  close() {
    if (this.isOpen()) {
      this._vcRef.remove(this._vcRef.indexOf(this._cRef.hostView));
      this._cRef = null;
      this._positioning.destroy();
      this._zoneSubscription?.unsubscribe();
      this._destroyCloseHandlers$.next();
      this.closed.emit();
      this._changeDetector.markForCheck();
      let elementToFocus = this._elWithFocus;
      if (isString(this.restoreFocus)) {
        elementToFocus = this._document.querySelector(this.restoreFocus);
      } else if (this.restoreFocus !== void 0) {
        elementToFocus = this.restoreFocus;
      }
      if (elementToFocus && elementToFocus["focus"]) {
        elementToFocus.focus();
      } else {
        this._document.body.focus();
      }
    }
  }
  /**
   * Toggles the datepicker popup.
   */
  toggle() {
    if (this.isOpen()) {
      this.close();
    } else {
      this.open();
    }
  }
  /**
   * Navigates to the provided date.
   *
   * With the default calendar we use ISO 8601: 'month' is 1=Jan ... 12=Dec.
   * If nothing or invalid date provided calendar will open current month.
   *
   * Use the `[startDate]` input as an alternative.
   */
  navigateTo(date) {
    if (this.isOpen()) {
      this._cRef.instance.navigateTo(date);
    }
  }
  onBlur() {
    this._onTouched();
  }
  onFocus() {
    this._elWithFocus = this._elRef.nativeElement;
  }
  ngOnChanges(changes) {
    if (changes["minDate"] || changes["maxDate"]) {
      this._validatorChange();
      if (this.isOpen()) {
        if (changes["minDate"]) {
          this._cRef.instance.minDate = this.minDate;
        }
        if (changes["maxDate"]) {
          this._cRef.instance.maxDate = this.maxDate;
        }
        this._cRef.instance.ngOnChanges(changes);
      }
    }
    if (changes["datepickerClass"]) {
      const { currentValue, previousValue } = changes["datepickerClass"];
      this._applyPopupClass(currentValue, previousValue);
    }
    if (changes["autoClose"] && this.isOpen()) {
      this._setCloseHandlers();
    }
  }
  ngOnDestroy() {
    this.close();
  }
  _applyDatepickerInputs(datepickerInstance) {
    [
      "dayTemplate",
      "dayTemplateData",
      "displayMonths",
      "firstDayOfWeek",
      "footerTemplate",
      "markDisabled",
      "minDate",
      "maxDate",
      "navigation",
      "outsideDays",
      "showNavigation",
      "showWeekNumbers",
      "weekdays"
    ].forEach((optionName) => {
      if (this[optionName] !== void 0) {
        datepickerInstance[optionName] = this[optionName];
      }
    });
    datepickerInstance.startDate = this.startDate || this._model;
  }
  _applyPopupClass(newClass, oldClass) {
    const popupEl = this._cRef?.location.nativeElement;
    if (popupEl) {
      if (newClass) {
        this._renderer.addClass(popupEl, newClass);
      }
      if (oldClass) {
        this._renderer.removeClass(popupEl, oldClass);
      }
    }
  }
  _applyPopupStyling(nativeElement) {
    this._renderer.addClass(nativeElement, "dropdown-menu");
    this._renderer.addClass(nativeElement, "show");
    if (this.container === "body") {
      this._renderer.addClass(nativeElement, "ngb-dp-body");
    }
    this._applyPopupClass(this.datepickerClass);
  }
  _subscribeForDatepickerOutputs(datepickerInstance) {
    datepickerInstance.navigate.subscribe((navigateEvent) => this.navigate.emit(navigateEvent));
    datepickerInstance.dateSelect.subscribe((date) => {
      this.dateSelect.emit(date);
      if (this.autoClose === true || this.autoClose === "inside") {
        this.close();
      }
    });
  }
  _writeModelValue(model) {
    const value = this._parserFormatter.format(model);
    this._inputValue = value;
    this._renderer.setProperty(this._elRef.nativeElement, "value", value);
    if (this.isOpen()) {
      this._cRef.instance.writeValue(this._dateAdapter.toModel(model));
      this._onTouched();
    }
  }
  _fromDateStruct(date) {
    const ngbDate = date ? new NgbDate(date.year, date.month, date.day) : null;
    return this._calendar.isValid(ngbDate) ? ngbDate : null;
  }
  _setCloseHandlers() {
    this._destroyCloseHandlers$.next();
    ngbAutoClose(this._ngZone, this._document, this.autoClose, () => this.close(), this._destroyCloseHandlers$, [], [this._elRef.nativeElement, this._cRef.location.nativeElement]);
  }
}
NgbInputDatepicker.ɵfac = __ngDeclareFactory({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: NgbInputDatepicker, deps: [{ token: NgbDateParserFormatter }, { token: ElementRef }, { token: ViewContainerRef }, { token: Renderer2 }, { token: NgZone }, { token: NgbCalendar }, { token: NgbDateAdapter }, { token: DOCUMENT }, { token: ChangeDetectorRef }, { token: NgbInputDatepickerConfig }], target: FactoryTarget.Directive });
NgbInputDatepicker.ɵdir = __ngDeclareDirective({ minVersion: "12.0.0", version: "13.0.3", type: NgbInputDatepicker, selector: "input[ngbDatepicker]", inputs: { autoClose: "autoClose", datepickerClass: "datepickerClass", dayTemplate: "dayTemplate", dayTemplateData: "dayTemplateData", displayMonths: "displayMonths", firstDayOfWeek: "firstDayOfWeek", footerTemplate: "footerTemplate", markDisabled: "markDisabled", minDate: "minDate", maxDate: "maxDate", navigation: "navigation", outsideDays: "outsideDays", placement: "placement", restoreFocus: "restoreFocus", showWeekNumbers: "showWeekNumbers", startDate: "startDate", container: "container", positionTarget: "positionTarget", weekdays: "weekdays", disabled: "disabled" }, outputs: { dateSelect: "dateSelect", navigate: "navigate", closed: "closed" }, host: { listeners: { "input": "manualDateChange($event.target.value)", "change": "manualDateChange($event.target.value, true)", "focus": "onFocus()", "blur": "onBlur()" }, properties: { "disabled": "disabled" } }, providers: [
  { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => NgbInputDatepicker), multi: true },
  { provide: NG_VALIDATORS, useExisting: forwardRef(() => NgbInputDatepicker), multi: true },
  { provide: NgbDatepickerConfig, useExisting: NgbInputDatepickerConfig }
], exportAs: ["ngbDatepicker"], usesOnChanges: true, ngImport: i0 });
__ngDeclareClassMetadata({ type: NgbInputDatepicker, decorators: [{
  type: Directive,
  args: [{
    selector: "input[ngbDatepicker]",
    exportAs: "ngbDatepicker",
    host: {
      "(input)": "manualDateChange($event.target.value)",
      "(change)": "manualDateChange($event.target.value, true)",
      "(focus)": "onFocus()",
      "(blur)": "onBlur()",
      "[disabled]": "disabled"
    },
    providers: [
      { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => NgbInputDatepicker), multi: true },
      { provide: NG_VALIDATORS, useExisting: forwardRef(() => NgbInputDatepicker), multi: true },
      { provide: NgbDatepickerConfig, useExisting: NgbInputDatepickerConfig }
    ]
  }]
}], ctorParameters: function() {
  return [{ type: NgbDateParserFormatter }, { type: ElementRef }, { type: ViewContainerRef }, { type: Renderer2 }, { type: NgZone }, { type: NgbCalendar }, { type: NgbDateAdapter }, { type: void 0, decorators: [{
    type: Inject,
    args: [DOCUMENT]
  }] }, { type: ChangeDetectorRef }, { type: NgbInputDatepickerConfig }];
}, propDecorators: { autoClose: [{
  type: Input
}], datepickerClass: [{
  type: Input
}], dayTemplate: [{
  type: Input
}], dayTemplateData: [{
  type: Input
}], displayMonths: [{
  type: Input
}], firstDayOfWeek: [{
  type: Input
}], footerTemplate: [{
  type: Input
}], markDisabled: [{
  type: Input
}], minDate: [{
  type: Input
}], maxDate: [{
  type: Input
}], navigation: [{
  type: Input
}], outsideDays: [{
  type: Input
}], placement: [{
  type: Input
}], restoreFocus: [{
  type: Input
}], showWeekNumbers: [{
  type: Input
}], startDate: [{
  type: Input
}], container: [{
  type: Input
}], positionTarget: [{
  type: Input
}], weekdays: [{
  type: Input
}], dateSelect: [{
  type: Output
}], navigate: [{
  type: Output
}], closed: [{
  type: Output
}], disabled: [{
  type: Input
}] } });
class NgbCalendarHijri extends NgbCalendar {
  getDaysPerWeek() {
    return 7;
  }
  getMonths() {
    return [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
  }
  getWeeksPerMonth() {
    return 6;
  }
  getNext(date, period = "d", number = 1) {
    date = new NgbDate(date.year, date.month, date.day);
    switch (period) {
      case "y":
        date = this._setYear(date, date.year + number);
        date.month = 1;
        date.day = 1;
        return date;
      case "m":
        date = this._setMonth(date, date.month + number);
        date.day = 1;
        return date;
      case "d":
        return this._setDay(date, date.day + number);
      default:
        return date;
    }
  }
  getPrev(date, period = "d", number = 1) {
    return this.getNext(date, period, -number);
  }
  getWeekday(date) {
    const day = this.toGregorian(date).getDay();
    return day === 0 ? 7 : day;
  }
  getWeekNumber(week, firstDayOfWeek) {
    if (firstDayOfWeek === 7) {
      firstDayOfWeek = 0;
    }
    const thursdayIndex = (4 + 7 - firstDayOfWeek) % 7;
    const date = week[thursdayIndex];
    const jsDate = this.toGregorian(date);
    jsDate.setDate(jsDate.getDate() + 4 - (jsDate.getDay() || 7));
    const time = jsDate.getTime();
    const MuhDate = this.toGregorian(new NgbDate(date.year, 1, 1));
    return Math.floor(Math.round((time - MuhDate.getTime()) / 864e5) / 7) + 1;
  }
  getToday() {
    return this.fromGregorian(/* @__PURE__ */ new Date());
  }
  isValid(date) {
    return date != null && isNumber(date.year) && isNumber(date.month) && isNumber(date.day) && !isNaN(this.toGregorian(date).getTime());
  }
  _setDay(date, day) {
    day = +day;
    let mDays = this.getDaysPerMonth(date.month, date.year);
    if (day <= 0) {
      while (day <= 0) {
        date = this._setMonth(date, date.month - 1);
        mDays = this.getDaysPerMonth(date.month, date.year);
        day += mDays;
      }
    } else if (day > mDays) {
      while (day > mDays) {
        day -= mDays;
        date = this._setMonth(date, date.month + 1);
        mDays = this.getDaysPerMonth(date.month, date.year);
      }
    }
    date.day = day;
    return date;
  }
  _setMonth(date, month) {
    month = +month;
    date.year = date.year + Math.floor((month - 1) / 12);
    date.month = Math.floor(((month - 1) % 12 + 12) % 12) + 1;
    return date;
  }
  _setYear(date, year) {
    date.year = +year;
    return date;
  }
}
NgbCalendarHijri.ɵfac = __ngDeclareFactory({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: NgbCalendarHijri, deps: null, target: FactoryTarget.Injectable });
NgbCalendarHijri.ɵprov = __ngDeclareInjectable({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: NgbCalendarHijri });
__ngDeclareClassMetadata({ type: NgbCalendarHijri, decorators: [{
  type: Injectable
}] });
function isIslamicLeapYear(hYear) {
  return (14 + 11 * hYear) % 30 < 11;
}
function isGregorianLeapYear$1(gDate) {
  const year = gDate.getFullYear();
  return year % 4 === 0 && year % 100 !== 0 || year % 400 === 0;
}
function getIslamicMonthStart(hYear, hMonth) {
  return Math.ceil(29.5 * hMonth) + (hYear - 1) * 354 + Math.floor((3 + 11 * hYear) / 30);
}
function getIslamicYearStart(year) {
  return (year - 1) * 354 + Math.floor((3 + 11 * year) / 30);
}
function mod$1(a, b) {
  return a - b * Math.floor(a / b);
}
const GREGORIAN_EPOCH$1 = 17214255e-1;
const ISLAMIC_EPOCH = 19484395e-1;
class NgbCalendarIslamicCivil extends NgbCalendarHijri {
  /**
   * Returns the equivalent islamic(civil) date value for a give input Gregorian date.
   * `gDate` is a JS Date to be converted to Hijri.
   */
  fromGregorian(gDate) {
    const gYear = gDate.getFullYear(), gMonth = gDate.getMonth(), gDay = gDate.getDate();
    let julianDay = GREGORIAN_EPOCH$1 - 1 + 365 * (gYear - 1) + Math.floor((gYear - 1) / 4) + -Math.floor((gYear - 1) / 100) + Math.floor((gYear - 1) / 400) + Math.floor((367 * (gMonth + 1) - 362) / 12 + (gMonth + 1 <= 2 ? 0 : isGregorianLeapYear$1(gDate) ? -1 : -2) + gDay);
    julianDay = Math.floor(julianDay) + 0.5;
    const days = julianDay - ISLAMIC_EPOCH;
    const hYear = Math.floor((30 * days + 10646) / 10631);
    let hMonth = Math.ceil((days - 29 - getIslamicYearStart(hYear)) / 29.5);
    hMonth = Math.min(hMonth, 11);
    const hDay = Math.ceil(days - getIslamicMonthStart(hYear, hMonth)) + 1;
    return new NgbDate(hYear, hMonth + 1, hDay);
  }
  /**
   * Returns the equivalent JS date value for a give input islamic(civil) date.
   * `hDate` is an islamic(civil) date to be converted to Gregorian.
   */
  toGregorian(hDate) {
    const hYear = hDate.year;
    const hMonth = hDate.month - 1;
    const hDay = hDate.day;
    const julianDay = hDay + Math.ceil(29.5 * hMonth) + (hYear - 1) * 354 + Math.floor((3 + 11 * hYear) / 30) + ISLAMIC_EPOCH - 1;
    const wjd = Math.floor(julianDay - 0.5) + 0.5, depoch = wjd - GREGORIAN_EPOCH$1, quadricent = Math.floor(depoch / 146097), dqc = mod$1(depoch, 146097), cent = Math.floor(dqc / 36524), dcent = mod$1(dqc, 36524), quad = Math.floor(dcent / 1461), dquad = mod$1(dcent, 1461), yindex = Math.floor(dquad / 365);
    let year = quadricent * 400 + cent * 100 + quad * 4 + yindex;
    if (!(cent === 4 || yindex === 4)) {
      year++;
    }
    const gYearStart = GREGORIAN_EPOCH$1 + 365 * (year - 1) + Math.floor((year - 1) / 4) - Math.floor((year - 1) / 100) + Math.floor((year - 1) / 400);
    const yearday = wjd - gYearStart;
    const tjd = GREGORIAN_EPOCH$1 - 1 + 365 * (year - 1) + Math.floor((year - 1) / 4) - Math.floor((year - 1) / 100) + Math.floor((year - 1) / 400) + Math.floor(739 / 12 + (isGregorianLeapYear$1(new Date(year, 3, 1)) ? -1 : -2) + 1);
    const leapadj = wjd < tjd ? 0 : isGregorianLeapYear$1(new Date(year, 3, 1)) ? 1 : 2;
    const month = Math.floor(((yearday + leapadj) * 12 + 373) / 367);
    const tjd2 = GREGORIAN_EPOCH$1 - 1 + 365 * (year - 1) + Math.floor((year - 1) / 4) - Math.floor((year - 1) / 100) + Math.floor((year - 1) / 400) + Math.floor((367 * month - 362) / 12 + (month <= 2 ? 0 : isGregorianLeapYear$1(new Date(year, month - 1, 1)) ? -1 : -2) + 1);
    const day = wjd - tjd2 + 1;
    return new Date(year, month - 1, day);
  }
  /**
   * Returns the number of days in a specific Hijri month.
   * `month` is 1 for Muharram, 2 for Safar, etc.
   * `year` is any Hijri year.
   */
  getDaysPerMonth(month, year) {
    year = year + Math.floor(month / 13);
    month = (month - 1) % 12 + 1;
    let length = 29 + month % 2;
    if (month === 12 && isIslamicLeapYear(year)) {
      length++;
    }
    return length;
  }
}
NgbCalendarIslamicCivil.ɵfac = __ngDeclareFactory({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: NgbCalendarIslamicCivil, deps: null, target: FactoryTarget.Injectable });
NgbCalendarIslamicCivil.ɵprov = __ngDeclareInjectable({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: NgbCalendarIslamicCivil });
__ngDeclareClassMetadata({ type: NgbCalendarIslamicCivil, decorators: [{
  type: Injectable
}] });
const GREGORIAN_FIRST_DATE = new Date(1882, 10, 12);
const GREGORIAN_LAST_DATE = new Date(2174, 10, 25);
const HIJRI_BEGIN = 1300;
const HIJRI_END = 1600;
const ONE_DAY = 1e3 * 60 * 60 * 24;
const MONTH_LENGTH = [
  // 1300-1304
  "101010101010",
  "110101010100",
  "111011001001",
  "011011010100",
  "011011101010",
  // 1305-1309
  "001101101100",
  "101010101101",
  "010101010101",
  "011010101001",
  "011110010010",
  // 1310-1314
  "101110101001",
  "010111010100",
  "101011011010",
  "010101011100",
  "110100101101",
  // 1315-1319
  "011010010101",
  "011101001010",
  "101101010100",
  "101101101010",
  "010110101101",
  // 1320-1324
  "010010101110",
  "101001001111",
  "010100010111",
  "011010001011",
  "011010100101",
  // 1325-1329
  "101011010101",
  "001011010110",
  "100101011011",
  "010010011101",
  "101001001101",
  // 1330-1334
  "110100100110",
  "110110010101",
  "010110101100",
  "100110110110",
  "001010111010",
  // 1335-1339
  "101001011011",
  "010100101011",
  "101010010101",
  "011011001010",
  "101011101001",
  // 1340-1344
  "001011110100",
  "100101110110",
  "001010110110",
  "100101010110",
  "101011001010",
  // 1345-1349
  "101110100100",
  "101111010010",
  "010111011001",
  "001011011100",
  "100101101101",
  // 1350-1354
  "010101001101",
  "101010100101",
  "101101010010",
  "101110100101",
  "010110110100",
  // 1355-1359
  "100110110110",
  "010101010111",
  "001010010111",
  "010101001011",
  "011010100011",
  // 1360-1364
  "011101010010",
  "101101100101",
  "010101101010",
  "101010101011",
  "010100101011",
  // 1365-1369
  "110010010101",
  "110101001010",
  "110110100101",
  "010111001010",
  "101011010110",
  // 1370-1374
  "100101010111",
  "010010101011",
  "100101001011",
  "101010100101",
  "101101010010",
  // 1375-1379
  "101101101010",
  "010101110101",
  "001001110110",
  "100010110111",
  "010001011011",
  // 1380-1384
  "010101010101",
  "010110101001",
  "010110110100",
  "100111011010",
  "010011011101",
  // 1385-1389
  "001001101110",
  "100100110110",
  "101010101010",
  "110101010100",
  "110110110010",
  // 1390-1394
  "010111010101",
  "001011011010",
  "100101011011",
  "010010101011",
  "101001010101",
  // 1395-1399
  "101101001001",
  "101101100100",
  "101101110001",
  "010110110100",
  "101010110101",
  // 1400-1404
  "101001010101",
  "110100100101",
  "111010010010",
  "111011001001",
  "011011010100",
  // 1405-1409
  "101011101001",
  "100101101011",
  "010010101011",
  "101010010011",
  "110101001001",
  // 1410-1414
  "110110100100",
  "110110110010",
  "101010111001",
  "010010111010",
  "101001011011",
  // 1415-1419
  "010100101011",
  "101010010101",
  "101100101010",
  "101101010101",
  "010101011100",
  // 1420-1424
  "010010111101",
  "001000111101",
  "100100011101",
  "101010010101",
  "101101001010",
  // 1425-1429
  "101101011010",
  "010101101101",
  "001010110110",
  "100100111011",
  "010010011011",
  // 1430-1434
  "011001010101",
  "011010101001",
  "011101010100",
  "101101101010",
  "010101101100",
  // 1435-1439
  "101010101101",
  "010101010101",
  "101100101001",
  "101110010010",
  "101110101001",
  // 1440-1444
  "010111010100",
  "101011011010",
  "010101011010",
  "101010101011",
  "010110010101",
  // 1445-1449
  "011101001001",
  "011101100100",
  "101110101010",
  "010110110101",
  "001010110110",
  // 1450-1454
  "101001010110",
  "111001001101",
  "101100100101",
  "101101010010",
  "101101101010",
  // 1455-1459
  "010110101101",
  "001010101110",
  "100100101111",
  "010010010111",
  "011001001011",
  // 1460-1464
  "011010100101",
  "011010101100",
  "101011010110",
  "010101011101",
  "010010011101",
  // 1465-1469
  "101001001101",
  "110100010110",
  "110110010101",
  "010110101010",
  "010110110101",
  // 1470-1474
  "001011011010",
  "100101011011",
  "010010101101",
  "010110010101",
  "011011001010",
  // 1475-1479
  "011011100100",
  "101011101010",
  "010011110101",
  "001010110110",
  "100101010110",
  // 1480-1484
  "101010101010",
  "101101010100",
  "101111010010",
  "010111011001",
  "001011101010",
  // 1485-1489
  "100101101101",
  "010010101101",
  "101010010101",
  "101101001010",
  "101110100101",
  // 1490-1494
  "010110110010",
  "100110110101",
  "010011010110",
  "101010010111",
  "010101000111",
  // 1495-1499
  "011010010011",
  "011101001001",
  "101101010101",
  "010101101010",
  "101001101011",
  // 1500-1504
  "010100101011",
  "101010001011",
  "110101000110",
  "110110100011",
  "010111001010",
  // 1505-1509
  "101011010110",
  "010011011011",
  "001001101011",
  "100101001011",
  "101010100101",
  // 1510-1514
  "101101010010",
  "101101101001",
  "010101110101",
  "000101110110",
  "100010110111",
  // 1515-1519
  "001001011011",
  "010100101011",
  "010101100101",
  "010110110100",
  "100111011010",
  // 1520-1524
  "010011101101",
  "000101101101",
  "100010110110",
  "101010100110",
  "110101010010",
  // 1525-1529
  "110110101001",
  "010111010100",
  "101011011010",
  "100101011011",
  "010010101011",
  // 1530-1534
  "011001010011",
  "011100101001",
  "011101100010",
  "101110101001",
  "010110110010",
  // 1535-1539
  "101010110101",
  "010101010101",
  "101100100101",
  "110110010010",
  "111011001001",
  // 1540-1544
  "011011010010",
  "101011101001",
  "010101101011",
  "010010101011",
  "101001010101",
  // 1545-1549
  "110100101001",
  "110101010100",
  "110110101010",
  "100110110101",
  "010010111010",
  // 1550-1554
  "101000111011",
  "010010011011",
  "101001001101",
  "101010101010",
  "101011010101",
  // 1555-1559
  "001011011010",
  "100101011101",
  "010001011110",
  "101000101110",
  "110010011010",
  // 1560-1564
  "110101010101",
  "011010110010",
  "011010111001",
  "010010111010",
  "101001011101",
  // 1565-1569
  "010100101101",
  "101010010101",
  "101101010010",
  "101110101000",
  "101110110100",
  // 1570-1574
  "010110111001",
  "001011011010",
  "100101011010",
  "101101001010",
  "110110100100",
  // 1575-1579
  "111011010001",
  "011011101000",
  "101101101010",
  "010101101101",
  "010100110101",
  // 1580-1584
  "011010010101",
  "110101001010",
  "110110101000",
  "110111010100",
  "011011011010",
  // 1585-1589
  "010101011011",
  "001010011101",
  "011000101011",
  "101100010101",
  "101101001010",
  // 1590-1594
  "101110010101",
  "010110101010",
  "101010101110",
  "100100101110",
  "110010001111",
  // 1595-1599
  "010100100111",
  "011010010101",
  "011010101010",
  "101011010110",
  "010101011101",
  // 1600
  "001010011101"
];
function getDaysDiff(date1, date2) {
  const time1 = Date.UTC(date1.getFullYear(), date1.getMonth(), date1.getDate());
  const time2 = Date.UTC(date2.getFullYear(), date2.getMonth(), date2.getDate());
  const diff = Math.abs(time1 - time2);
  return Math.round(diff / ONE_DAY);
}
class NgbCalendarIslamicUmalqura extends NgbCalendarIslamicCivil {
  /**
  * Returns the equivalent islamic(Umalqura) date value for a give input Gregorian date.
  * `gdate` is s JS Date to be converted to Hijri.
  */
  fromGregorian(gDate) {
    let hDay = 1, hMonth = 0, hYear = 1300;
    let daysDiff = getDaysDiff(gDate, GREGORIAN_FIRST_DATE);
    if (gDate.getTime() - GREGORIAN_FIRST_DATE.getTime() >= 0 && gDate.getTime() - GREGORIAN_LAST_DATE.getTime() <= 0) {
      let year = 1300;
      for (let i = 0; i < MONTH_LENGTH.length; i++, year++) {
        for (let j = 0; j < 12; j++) {
          let numOfDays = +MONTH_LENGTH[i][j] + 29;
          if (daysDiff <= numOfDays) {
            hDay = daysDiff + 1;
            if (hDay > numOfDays) {
              hDay = 1;
              j++;
            }
            if (j > 11) {
              j = 0;
              year++;
            }
            hMonth = j;
            hYear = year;
            return new NgbDate(hYear, hMonth + 1, hDay);
          }
          daysDiff = daysDiff - numOfDays;
        }
      }
      return null;
    } else {
      return super.fromGregorian(gDate);
    }
  }
  /**
  * Converts the current Hijri date to Gregorian.
  */
  toGregorian(hDate) {
    const hYear = hDate.year;
    const hMonth = hDate.month - 1;
    const hDay = hDate.day;
    let gDate = new Date(GREGORIAN_FIRST_DATE);
    let dayDiff = hDay - 1;
    if (hYear >= HIJRI_BEGIN && hYear <= HIJRI_END) {
      for (let y = 0; y < hYear - HIJRI_BEGIN; y++) {
        for (let m = 0; m < 12; m++) {
          dayDiff += +MONTH_LENGTH[y][m] + 29;
        }
      }
      for (let m = 0; m < hMonth; m++) {
        dayDiff += +MONTH_LENGTH[hYear - HIJRI_BEGIN][m] + 29;
      }
      gDate.setDate(GREGORIAN_FIRST_DATE.getDate() + dayDiff);
    } else {
      gDate = super.toGregorian(hDate);
    }
    return gDate;
  }
  /**
  * Returns the number of days in a specific Hijri hMonth.
  * `hMonth` is 1 for Muharram, 2 for Safar, etc.
  * `hYear` is any Hijri hYear.
  */
  getDaysPerMonth(hMonth, hYear) {
    if (hYear >= HIJRI_BEGIN && hYear <= HIJRI_END) {
      const pos = hYear - HIJRI_BEGIN;
      return +MONTH_LENGTH[pos][hMonth - 1] + 29;
    }
    return super.getDaysPerMonth(hMonth, hYear);
  }
}
NgbCalendarIslamicUmalqura.ɵfac = __ngDeclareFactory({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: NgbCalendarIslamicUmalqura, deps: null, target: FactoryTarget.Injectable });
NgbCalendarIslamicUmalqura.ɵprov = __ngDeclareInjectable({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: NgbCalendarIslamicUmalqura });
__ngDeclareClassMetadata({ type: NgbCalendarIslamicUmalqura, decorators: [{
  type: Injectable
}] });
function toGregorian$2(jalaliDate) {
  let jdn = jalaliToJulian(jalaliDate.year, jalaliDate.month, jalaliDate.day);
  let date = julianToGregorian(jdn);
  date.setHours(6, 30, 3, 200);
  return date;
}
function fromGregorian$2(gdate) {
  let g2d = gregorianToJulian(gdate.getFullYear(), gdate.getMonth() + 1, gdate.getDate());
  return julianToJalali(g2d);
}
function setJalaliYear(date, yearValue) {
  date.year = +yearValue;
  return date;
}
function setJalaliMonth(date, month) {
  month = +month;
  date.year = date.year + Math.floor((month - 1) / 12);
  date.month = Math.floor(((month - 1) % 12 + 12) % 12) + 1;
  return date;
}
function setJalaliDay(date, day) {
  let mDays = getDaysPerMonth(date.month, date.year);
  if (day <= 0) {
    while (day <= 0) {
      date = setJalaliMonth(date, date.month - 1);
      mDays = getDaysPerMonth(date.month, date.year);
      day += mDays;
    }
  } else if (day > mDays) {
    while (day > mDays) {
      day -= mDays;
      date = setJalaliMonth(date, date.month + 1);
      mDays = getDaysPerMonth(date.month, date.year);
    }
  }
  date.day = day;
  return date;
}
function mod(a, b) {
  return a - b * Math.floor(a / b);
}
function div(a, b) {
  return Math.trunc(a / b);
}
function jalCal(jalaliYear) {
  let breaks = [-61, 9, 38, 199, 426, 686, 756, 818, 1111, 1181, 1210, 1635, 2060, 2097, 2192, 2262, 2324, 2394, 2456, 3178];
  const breaksLength = breaks.length;
  const gYear = jalaliYear + 621;
  let leapJ = -14;
  let jp = breaks[0];
  if (jalaliYear < jp || jalaliYear >= breaks[breaksLength - 1]) {
    throw new Error("Invalid Jalali year " + jalaliYear);
  }
  let jump;
  for (let i = 1; i < breaksLength; i += 1) {
    const jm = breaks[i];
    jump = jm - jp;
    if (jalaliYear < jm) {
      break;
    }
    leapJ = leapJ + div(jump, 33) * 8 + div(mod(jump, 33), 4);
    jp = jm;
  }
  let n = jalaliYear - jp;
  leapJ = leapJ + div(n, 33) * 8 + div(mod(n, 33) + 3, 4);
  if (mod(jump, 33) === 4 && jump - n === 4) {
    leapJ += 1;
  }
  const leapG = div(gYear, 4) - div((div(gYear, 100) + 1) * 3, 4) - 150;
  const march = 20 + leapJ - leapG;
  if (jump - n < 6) {
    n = n - jump + div(jump + 4, 33) * 33;
  }
  let leap = mod(mod(n + 1, 33) - 1, 4);
  if (leap === -1) {
    leap = 4;
  }
  return { leap, gy: gYear, march };
}
function julianToGregorian(julianDayNumber) {
  let j = 4 * julianDayNumber + 139361631;
  j = j + div(div(4 * julianDayNumber + 183187720, 146097) * 3, 4) * 4 - 3908;
  const i = div(mod(j, 1461), 4) * 5 + 308;
  const gDay = div(mod(i, 153), 5) + 1;
  const gMonth = mod(div(i, 153), 12) + 1;
  const gYear = div(j, 1461) - 100100 + div(8 - gMonth, 6);
  return new Date(gYear, gMonth - 1, gDay);
}
function gregorianToJulian(gy, gm, gd) {
  let d = div((gy + div(gm - 8, 6) + 100100) * 1461, 4) + div(153 * mod(gm + 9, 12) + 2, 5) + gd - 34840408;
  d = d - div(div(gy + 100100 + div(gm - 8, 6), 100) * 3, 4) + 752;
  return d;
}
function julianToJalali(julianDayNumber) {
  let gy = julianToGregorian(julianDayNumber).getFullYear(), jalaliYear = gy - 621, r = jalCal(jalaliYear), gregorianDay = gregorianToJulian(gy, 3, r.march), jalaliDay, jalaliMonth, numberOfDays;
  numberOfDays = julianDayNumber - gregorianDay;
  if (numberOfDays >= 0) {
    if (numberOfDays <= 185) {
      jalaliMonth = 1 + div(numberOfDays, 31);
      jalaliDay = mod(numberOfDays, 31) + 1;
      return new NgbDate(jalaliYear, jalaliMonth, jalaliDay);
    } else {
      numberOfDays -= 186;
    }
  } else {
    jalaliYear -= 1;
    numberOfDays += 179;
    if (r.leap === 1) {
      numberOfDays += 1;
    }
  }
  jalaliMonth = 7 + div(numberOfDays, 30);
  jalaliDay = mod(numberOfDays, 30) + 1;
  return new NgbDate(jalaliYear, jalaliMonth, jalaliDay);
}
function jalaliToJulian(jYear, jMonth, jDay) {
  let r = jalCal(jYear);
  return gregorianToJulian(r.gy, 3, r.march) + (jMonth - 1) * 31 - div(jMonth, 7) * (jMonth - 7) + jDay - 1;
}
function getDaysPerMonth(month, year) {
  if (month <= 6) {
    return 31;
  }
  if (month <= 11) {
    return 30;
  }
  if (jalCal(year).leap === 0) {
    return 30;
  }
  return 29;
}
class NgbCalendarPersian extends NgbCalendar {
  getDaysPerWeek() {
    return 7;
  }
  getMonths() {
    return [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
  }
  getWeeksPerMonth() {
    return 6;
  }
  getNext(date, period = "d", number = 1) {
    date = new NgbDate(date.year, date.month, date.day);
    switch (period) {
      case "y":
        date = setJalaliYear(date, date.year + number);
        date.month = 1;
        date.day = 1;
        return date;
      case "m":
        date = setJalaliMonth(date, date.month + number);
        date.day = 1;
        return date;
      case "d":
        return setJalaliDay(date, date.day + number);
      default:
        return date;
    }
  }
  getPrev(date, period = "d", number = 1) {
    return this.getNext(date, period, -number);
  }
  getWeekday(date) {
    const day = toGregorian$2(date).getDay();
    return day === 0 ? 7 : day;
  }
  getWeekNumber(week, firstDayOfWeek) {
    if (firstDayOfWeek === 7) {
      firstDayOfWeek = 0;
    }
    const thursdayIndex = (4 + 7 - firstDayOfWeek) % 7;
    const date = week[thursdayIndex];
    const jsDate = toGregorian$2(date);
    jsDate.setDate(jsDate.getDate() + 4 - (jsDate.getDay() || 7));
    const time = jsDate.getTime();
    const startDate = toGregorian$2(new NgbDate(date.year, 1, 1));
    return Math.floor(Math.round((time - startDate.getTime()) / 864e5) / 7) + 1;
  }
  getToday() {
    return fromGregorian$2(/* @__PURE__ */ new Date());
  }
  isValid(date) {
    return date != null && isInteger(date.year) && isInteger(date.month) && isInteger(date.day) && !isNaN(toGregorian$2(date).getTime());
  }
}
NgbCalendarPersian.ɵfac = __ngDeclareFactory({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: NgbCalendarPersian, deps: null, target: FactoryTarget.Injectable });
NgbCalendarPersian.ɵprov = __ngDeclareInjectable({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: NgbCalendarPersian });
__ngDeclareClassMetadata({ type: NgbCalendarPersian, decorators: [{
  type: Injectable
}] });
const PARTS_PER_HOUR = 1080;
const PARTS_PER_DAY = 24 * PARTS_PER_HOUR;
const PARTS_FRACTIONAL_MONTH = 12 * PARTS_PER_HOUR + 793;
const PARTS_PER_MONTH = 29 * PARTS_PER_DAY + PARTS_FRACTIONAL_MONTH;
const BAHARAD = 11 * PARTS_PER_HOUR + 204;
const HEBREW_DAY_ON_JAN_1_1970 = 2092591;
const GREGORIAN_EPOCH = 17214255e-1;
function isGregorianLeapYear(year) {
  return year % 4 === 0 && year % 100 !== 0 || year % 400 === 0;
}
function numberOfFirstDayInYear(year) {
  let monthsBeforeYear = Math.floor((235 * year - 234) / 19);
  let fractionalMonthsBeforeYear = monthsBeforeYear * PARTS_FRACTIONAL_MONTH + BAHARAD;
  let dayNumber = monthsBeforeYear * 29 + Math.floor(fractionalMonthsBeforeYear / PARTS_PER_DAY);
  let timeOfDay = fractionalMonthsBeforeYear % PARTS_PER_DAY;
  let dayOfWeek = dayNumber % 7;
  if (dayOfWeek === 2 || dayOfWeek === 4 || dayOfWeek === 6) {
    dayNumber++;
    dayOfWeek = dayNumber % 7;
  }
  if (dayOfWeek === 1 && timeOfDay > 15 * PARTS_PER_HOUR + 204 && !isHebrewLeapYear(year)) {
    dayNumber += 2;
  } else if (dayOfWeek === 0 && timeOfDay > 21 * PARTS_PER_HOUR + 589 && isHebrewLeapYear(year - 1)) {
    dayNumber++;
  }
  return dayNumber;
}
function getDaysInGregorianMonth(month, year) {
  let days = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  if (isGregorianLeapYear(year)) {
    days[1]++;
  }
  return days[month - 1];
}
function getHebrewMonths(year) {
  return isHebrewLeapYear(year) ? 13 : 12;
}
function getDaysInHebrewYear(year) {
  return numberOfFirstDayInYear(year + 1) - numberOfFirstDayInYear(year);
}
function isHebrewLeapYear(year) {
  if (year != null) {
    let b = (year * 12 + 17) % 19;
    return b >= (b < 0 ? -7 : 12);
  }
  return false;
}
function getDaysInHebrewMonth(month, year) {
  let yearLength = numberOfFirstDayInYear(year + 1) - numberOfFirstDayInYear(year);
  let yearType = (yearLength <= 380 ? yearLength : yearLength - 30) - 353;
  let leapYear = isHebrewLeapYear(year);
  let daysInMonth = leapYear ? [30, 29, 29, 29, 30, 30, 29, 30, 29, 30, 29, 30, 29] : [30, 29, 29, 29, 30, 29, 30, 29, 30, 29, 30, 29];
  if (yearType > 0) {
    daysInMonth[2]++;
  }
  if (yearType > 1) {
    daysInMonth[1]++;
  }
  return daysInMonth[month - 1];
}
function getDayNumberInHebrewYear(date) {
  let numberOfDay = 0;
  for (let i = 1; i < date.month; i++) {
    numberOfDay += getDaysInHebrewMonth(i, date.year);
  }
  return numberOfDay + date.day;
}
function setHebrewMonth(date, val) {
  let after = val >= 0;
  if (!after) {
    val = -val;
  }
  while (val > 0) {
    if (after) {
      if (val > getHebrewMonths(date.year) - date.month) {
        val -= getHebrewMonths(date.year) - date.month + 1;
        date.year++;
        date.month = 1;
      } else {
        date.month += val;
        val = 0;
      }
    } else {
      if (val >= date.month) {
        date.year--;
        val -= date.month;
        date.month = getHebrewMonths(date.year);
      } else {
        date.month -= val;
        val = 0;
      }
    }
  }
  return date;
}
function setHebrewDay(date, val) {
  let after = val >= 0;
  if (!after) {
    val = -val;
  }
  while (val > 0) {
    if (after) {
      if (val > getDaysInHebrewYear(date.year) - getDayNumberInHebrewYear(date)) {
        val -= getDaysInHebrewYear(date.year) - getDayNumberInHebrewYear(date) + 1;
        date.year++;
        date.month = 1;
        date.day = 1;
      } else if (val > getDaysInHebrewMonth(date.month, date.year) - date.day) {
        val -= getDaysInHebrewMonth(date.month, date.year) - date.day + 1;
        date.month++;
        date.day = 1;
      } else {
        date.day += val;
        val = 0;
      }
    } else {
      if (val >= date.day) {
        val -= date.day;
        date.month--;
        if (date.month === 0) {
          date.year--;
          date.month = getHebrewMonths(date.year);
        }
        date.day = getDaysInHebrewMonth(date.month, date.year);
      } else {
        date.day -= val;
        val = 0;
      }
    }
  }
  return date;
}
function fromGregorian$1(gdate) {
  const date = new Date(gdate);
  const gYear = date.getFullYear(), gMonth = date.getMonth(), gDay = date.getDate();
  let julianDay = GREGORIAN_EPOCH - 1 + 365 * (gYear - 1) + Math.floor((gYear - 1) / 4) - Math.floor((gYear - 1) / 100) + Math.floor((gYear - 1) / 400) + Math.floor((367 * (gMonth + 1) - 362) / 12 + (gMonth + 1 <= 2 ? 0 : isGregorianLeapYear(gYear) ? -1 : -2) + gDay);
  julianDay = Math.floor(julianDay + 0.5);
  let daysSinceHebEpoch = julianDay - 347997;
  let monthsSinceHebEpoch = Math.floor(daysSinceHebEpoch * PARTS_PER_DAY / PARTS_PER_MONTH);
  let hYear = Math.floor((monthsSinceHebEpoch * 19 + 234) / 235) + 1;
  let firstDayOfThisYear = numberOfFirstDayInYear(hYear);
  let dayOfYear = daysSinceHebEpoch - firstDayOfThisYear;
  while (dayOfYear < 1) {
    hYear--;
    firstDayOfThisYear = numberOfFirstDayInYear(hYear);
    dayOfYear = daysSinceHebEpoch - firstDayOfThisYear;
  }
  let hMonth = 1;
  let hDay = dayOfYear;
  while (hDay > getDaysInHebrewMonth(hMonth, hYear)) {
    hDay -= getDaysInHebrewMonth(hMonth, hYear);
    hMonth++;
  }
  return new NgbDate(hYear, hMonth, hDay);
}
function toGregorian$1(hebrewDate) {
  const hYear = hebrewDate.year;
  const hMonth = hebrewDate.month;
  const hDay = hebrewDate.day;
  let days = numberOfFirstDayInYear(hYear);
  for (let i = 1; i < hMonth; i++) {
    days += getDaysInHebrewMonth(i, hYear);
  }
  days += hDay;
  let diffDays = days - HEBREW_DAY_ON_JAN_1_1970;
  let after = diffDays >= 0;
  if (!after) {
    diffDays = -diffDays;
  }
  let gYear = 1970;
  let gMonth = 1;
  let gDay = 1;
  while (diffDays > 0) {
    if (after) {
      if (diffDays >= (isGregorianLeapYear(gYear) ? 366 : 365)) {
        diffDays -= isGregorianLeapYear(gYear) ? 366 : 365;
        gYear++;
      } else if (diffDays >= getDaysInGregorianMonth(gMonth, gYear)) {
        diffDays -= getDaysInGregorianMonth(gMonth, gYear);
        gMonth++;
      } else {
        gDay += diffDays;
        diffDays = 0;
      }
    } else {
      if (diffDays >= (isGregorianLeapYear(gYear - 1) ? 366 : 365)) {
        diffDays -= isGregorianLeapYear(gYear - 1) ? 366 : 365;
        gYear--;
      } else {
        if (gMonth > 1) {
          gMonth--;
        } else {
          gMonth = 12;
          gYear--;
        }
        if (diffDays >= getDaysInGregorianMonth(gMonth, gYear)) {
          diffDays -= getDaysInGregorianMonth(gMonth, gYear);
        } else {
          gDay = getDaysInGregorianMonth(gMonth, gYear) - diffDays + 1;
          diffDays = 0;
        }
      }
    }
  }
  return new Date(gYear, gMonth - 1, gDay);
}
function hebrewNumerals(numerals) {
  if (!numerals) {
    return "";
  }
  const hArray0_9 = ["", "א", "ב", "ג", "ד", "ה", "ו", "ז", "ח", "ט"];
  const hArray10_19 = [
    "י",
    "יא",
    "יב",
    "יג",
    "יד",
    "טו",
    "טז",
    "יז",
    "יח",
    "יט"
  ];
  const hArray20_90 = ["", "", "כ", "ל", "מ", "נ", "ס", "ע", "פ", "צ"];
  const hArray100_900 = [
    "",
    "ק",
    "ר",
    "ש",
    "ת",
    "תק",
    "תר",
    "תש",
    "תת",
    "תתק"
  ];
  const hArray1000_9000 = [
    "",
    "א",
    "ב",
    "בא",
    "בב",
    "ה",
    "הא",
    "הב",
    "הבא",
    "הבב"
  ];
  const geresh = "׳", gershaim = "״";
  let mem = 0;
  let result = [];
  let step = 0;
  while (numerals > 0) {
    let m = numerals % 10;
    if (step === 0) {
      mem = m;
    } else if (step === 1) {
      if (m !== 1) {
        result.unshift(hArray20_90[m], hArray0_9[mem]);
      } else {
        result.unshift(hArray10_19[mem]);
      }
    } else if (step === 2) {
      result.unshift(hArray100_900[m]);
    } else {
      if (m !== 5) {
        result.unshift(hArray1000_9000[m], geresh, " ");
      }
      break;
    }
    numerals = Math.floor(numerals / 10);
    if (step === 0 && numerals === 0) {
      result.unshift(hArray0_9[m]);
    }
    step++;
  }
  result = result.join("").split("");
  if (result.length === 1) {
    result.push(geresh);
  } else if (result.length > 1) {
    result.splice(result.length - 1, 0, gershaim);
  }
  return result.join("");
}
class NgbCalendarHebrew extends NgbCalendar {
  getDaysPerWeek() {
    return 7;
  }
  getMonths(year) {
    if (year && isHebrewLeapYear(year)) {
      return [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13];
    } else {
      return [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
    }
  }
  getWeeksPerMonth() {
    return 6;
  }
  isValid(date) {
    if (date != null) {
      let b = isNumber(date.year) && isNumber(date.month) && isNumber(date.day);
      b = b && date.month > 0 && date.month <= (isHebrewLeapYear(date.year) ? 13 : 12);
      b = b && date.day > 0 && date.day <= getDaysInHebrewMonth(date.month, date.year);
      return b && !isNaN(toGregorian$1(date).getTime());
    }
    return false;
  }
  getNext(date, period = "d", number = 1) {
    date = new NgbDate(date.year, date.month, date.day);
    switch (period) {
      case "y":
        date.year += number;
        date.month = 1;
        date.day = 1;
        return date;
      case "m":
        date = setHebrewMonth(date, number);
        date.day = 1;
        return date;
      case "d":
        return setHebrewDay(date, number);
      default:
        return date;
    }
  }
  getPrev(date, period = "d", number = 1) {
    return this.getNext(date, period, -number);
  }
  getWeekday(date) {
    const day = toGregorian$1(date).getDay();
    return day === 0 ? 7 : day;
  }
  getWeekNumber(week, firstDayOfWeek) {
    const date = week[week.length - 1];
    return Math.ceil(getDayNumberInHebrewYear(date) / 7);
  }
  getToday() {
    return fromGregorian$1(/* @__PURE__ */ new Date());
  }
  /**
   * @since 3.4.0
   */
  toGregorian(date) {
    return fromJSDate(toGregorian$1(date));
  }
  /**
   * @since 3.4.0
   */
  fromGregorian(date) {
    return fromGregorian$1(toJSDate(date));
  }
}
NgbCalendarHebrew.ɵfac = __ngDeclareFactory({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: NgbCalendarHebrew, deps: null, target: FactoryTarget.Injectable });
NgbCalendarHebrew.ɵprov = __ngDeclareInjectable({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: NgbCalendarHebrew });
__ngDeclareClassMetadata({ type: NgbCalendarHebrew, decorators: [{
  type: Injectable
}] });
const WEEKDAYS = ["שני", "שלישי", "רביעי", "חמישי", "שישי", "שבת", "ראשון"];
const MONTHS = ["תשרי", "חשון", "כסלו", "טבת", "שבט", "אדר", "ניסן", "אייר", "סיון", "תמוז", "אב", "אלול"];
const MONTHS_LEAP = ["תשרי", "חשון", "כסלו", "טבת", "שבט", "אדר א׳", "אדר ב׳", "ניסן", "אייר", "סיון", "תמוז", "אב", "אלול"];
class NgbDatepickerI18nHebrew extends NgbDatepickerI18n {
  getMonthShortName(month, year) {
    return this.getMonthFullName(month, year);
  }
  getMonthFullName(month, year) {
    return isHebrewLeapYear(year) ? MONTHS_LEAP[month - 1] || "" : MONTHS[month - 1] || "";
  }
  getWeekdayLabel(weekday, width) {
    return WEEKDAYS[weekday - 1] || "";
  }
  getDayAriaLabel(date) {
    return `${hebrewNumerals(date.day)} ${this.getMonthFullName(date.month, date.year)} ${hebrewNumerals(date.year)}`;
  }
  getDayNumerals(date) {
    return hebrewNumerals(date.day);
  }
  getWeekNumerals(weekNumber) {
    return hebrewNumerals(weekNumber);
  }
  getYearNumerals(year) {
    return hebrewNumerals(year);
  }
}
NgbDatepickerI18nHebrew.ɵfac = __ngDeclareFactory({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: NgbDatepickerI18nHebrew, deps: null, target: FactoryTarget.Injectable });
NgbDatepickerI18nHebrew.ɵprov = __ngDeclareInjectable({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: NgbDatepickerI18nHebrew });
__ngDeclareClassMetadata({ type: NgbDatepickerI18nHebrew, decorators: [{
  type: Injectable
}] });
function toGregorian(date) {
  return new Date(date.year - 543, date.month - 1, date.day);
}
function fromGregorian(gdate) {
  return new NgbDate(gdate.getFullYear() + 543, gdate.getMonth() + 1, gdate.getDate());
}
class NgbCalendarBuddhist extends NgbCalendarGregorian {
  getToday() {
    return fromGregorian(/* @__PURE__ */ new Date());
  }
  getNext(date, period = "d", number = 1) {
    let jsDate = toGregorian(date);
    let checkMonth = true;
    let expectedMonth = jsDate.getMonth();
    switch (period) {
      case "y":
        jsDate.setFullYear(jsDate.getFullYear() + number);
        break;
      case "m":
        expectedMonth += number;
        jsDate.setMonth(expectedMonth);
        expectedMonth = expectedMonth % 12;
        if (expectedMonth < 0) {
          expectedMonth = expectedMonth + 12;
        }
        break;
      case "d":
        jsDate.setDate(jsDate.getDate() + number);
        checkMonth = false;
        break;
      default:
        return date;
    }
    if (checkMonth && jsDate.getMonth() !== expectedMonth) {
      jsDate.setDate(0);
    }
    return fromGregorian(jsDate);
  }
  getPrev(date, period = "d", number = 1) {
    return this.getNext(date, period, -number);
  }
  getWeekday(date) {
    let jsDate = toGregorian(date);
    let day = jsDate.getDay();
    return day === 0 ? 7 : day;
  }
  getWeekNumber(week, firstDayOfWeek) {
    if (firstDayOfWeek === 7) {
      firstDayOfWeek = 0;
    }
    const thursdayIndex = (4 + 7 - firstDayOfWeek) % 7;
    let date = week[thursdayIndex];
    const jsDate = toGregorian(date);
    jsDate.setDate(jsDate.getDate() + 4 - (jsDate.getDay() || 7));
    const time = jsDate.getTime();
    jsDate.setMonth(0);
    jsDate.setDate(1);
    return Math.floor(Math.round((time - jsDate.getTime()) / 864e5) / 7) + 1;
  }
  isValid(date) {
    if (!date || !isInteger(date.year) || !isInteger(date.month) || !isInteger(date.day)) {
      return false;
    }
    if (date.year === 0) {
      return false;
    }
    const jsDate = toGregorian(date);
    return !isNaN(jsDate.getTime()) && jsDate.getFullYear() === date.year - 543 && jsDate.getMonth() + 1 === date.month && jsDate.getDate() === date.day;
  }
}
NgbCalendarBuddhist.ɵfac = __ngDeclareFactory({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: NgbCalendarBuddhist, deps: null, target: FactoryTarget.Injectable });
NgbCalendarBuddhist.ɵprov = __ngDeclareInjectable({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: NgbCalendarBuddhist });
__ngDeclareClassMetadata({ type: NgbCalendarBuddhist, decorators: [{
  type: Injectable
}] });
class NgbDateNativeAdapter extends NgbDateAdapter {
  /**
   * Converts a native `Date` to a `NgbDateStruct`.
   */
  fromModel(date) {
    return date instanceof Date && !isNaN(date.getTime()) ? this._fromNativeDate(date) : null;
  }
  /**
   * Converts a `NgbDateStruct` to a native `Date`.
   */
  toModel(date) {
    return date && isInteger(date.year) && isInteger(date.month) && isInteger(date.day) ? this._toNativeDate(date) : null;
  }
  _fromNativeDate(date) {
    return { year: date.getFullYear(), month: date.getMonth() + 1, day: date.getDate() };
  }
  _toNativeDate(date) {
    const jsDate = new Date(date.year, date.month - 1, date.day, 12);
    jsDate.setFullYear(date.year);
    return jsDate;
  }
}
NgbDateNativeAdapter.ɵfac = __ngDeclareFactory({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: NgbDateNativeAdapter, deps: null, target: FactoryTarget.Injectable });
NgbDateNativeAdapter.ɵprov = __ngDeclareInjectable({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: NgbDateNativeAdapter });
__ngDeclareClassMetadata({ type: NgbDateNativeAdapter, decorators: [{
  type: Injectable
}] });
class NgbDateNativeUTCAdapter extends NgbDateNativeAdapter {
  _fromNativeDate(date) {
    return { year: date.getUTCFullYear(), month: date.getUTCMonth() + 1, day: date.getUTCDate() };
  }
  _toNativeDate(date) {
    const jsDate = new Date(Date.UTC(date.year, date.month - 1, date.day));
    jsDate.setUTCFullYear(date.year);
    return jsDate;
  }
}
NgbDateNativeUTCAdapter.ɵfac = __ngDeclareFactory({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: NgbDateNativeUTCAdapter, deps: null, target: FactoryTarget.Injectable });
NgbDateNativeUTCAdapter.ɵprov = __ngDeclareInjectable({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: NgbDateNativeUTCAdapter });
__ngDeclareClassMetadata({ type: NgbDateNativeUTCAdapter, decorators: [{
  type: Injectable
}] });
class NgbDatepickerModule {
}
NgbDatepickerModule.ɵfac = __ngDeclareFactory({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: NgbDatepickerModule, deps: [], target: FactoryTarget.NgModule });
NgbDatepickerModule.ɵmod = __ngDeclareNgModule({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: NgbDatepickerModule, declarations: [
  NgbDatepicker,
  NgbDatepickerContent,
  NgbDatepickerMonth,
  NgbDatepickerNavigation,
  NgbDatepickerNavigationSelect,
  NgbDatepickerDayView,
  NgbInputDatepicker
], imports: [CommonModule, FormsModule], exports: [NgbDatepicker, NgbDatepickerContent, NgbInputDatepicker, NgbDatepickerMonth] });
NgbDatepickerModule.ɵinj = __ngDeclareInjector({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: NgbDatepickerModule, imports: [[CommonModule, FormsModule]] });
__ngDeclareClassMetadata({ type: NgbDatepickerModule, decorators: [{
  type: NgModule,
  args: [{
    declarations: [
      NgbDatepicker,
      NgbDatepickerContent,
      NgbDatepickerMonth,
      NgbDatepickerNavigation,
      NgbDatepickerNavigationSelect,
      NgbDatepickerDayView,
      NgbInputDatepicker
    ],
    exports: [NgbDatepicker, NgbDatepickerContent, NgbInputDatepicker, NgbDatepickerMonth],
    imports: [CommonModule, FormsModule]
  }]
}] });
class NgbDropdownConfig {
  constructor() {
    this.autoClose = true;
    this.placement = ["bottom-start", "bottom-end", "top-start", "top-end"];
  }
}
NgbDropdownConfig.ɵfac = __ngDeclareFactory({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: NgbDropdownConfig, deps: [], target: FactoryTarget.Injectable });
NgbDropdownConfig.ɵprov = __ngDeclareInjectable({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: NgbDropdownConfig, providedIn: "root" });
__ngDeclareClassMetadata({ type: NgbDropdownConfig, decorators: [{
  type: Injectable,
  args: [{ providedIn: "root" }]
}] });
class NgbNavbar {
}
NgbNavbar.ɵfac = __ngDeclareFactory({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: NgbNavbar, deps: [], target: FactoryTarget.Directive });
NgbNavbar.ɵdir = __ngDeclareDirective({ minVersion: "12.0.0", version: "13.0.3", type: NgbNavbar, selector: ".navbar", ngImport: i0 });
__ngDeclareClassMetadata({ type: NgbNavbar, decorators: [{
  type: Directive,
  args: [{ selector: ".navbar" }]
}] });
class NgbDropdownItem {
  constructor(elementRef, _renderer) {
    this.elementRef = elementRef;
    this._renderer = _renderer;
    this._disabled = false;
  }
  set disabled(value) {
    this._disabled = value === "" || value === true;
    this._renderer.setProperty(this.elementRef.nativeElement, "disabled", this._disabled);
  }
  get disabled() {
    return this._disabled;
  }
}
NgbDropdownItem.ɵfac = __ngDeclareFactory({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: NgbDropdownItem, deps: [{ token: ElementRef }, { token: Renderer2 }], target: FactoryTarget.Directive });
NgbDropdownItem.ɵdir = __ngDeclareDirective({ minVersion: "12.0.0", version: "13.0.3", type: NgbDropdownItem, selector: "[ngbDropdownItem]", inputs: { disabled: "disabled" }, host: { properties: { "class.disabled": "disabled", "tabIndex": "disabled ? -1 : 0" }, classAttribute: "dropdown-item" }, ngImport: i0 });
__ngDeclareClassMetadata({ type: NgbDropdownItem, decorators: [{
  type: Directive,
  args: [{
    selector: "[ngbDropdownItem]",
    host: { "class": "dropdown-item", "[class.disabled]": "disabled", "[tabIndex]": "disabled ? -1 : 0" }
  }]
}], ctorParameters: function() {
  return [{ type: ElementRef }, { type: Renderer2 }];
}, propDecorators: { disabled: [{
  type: Input
}] } });
class NgbDropdownMenu {
  constructor(dropdown, _elementRef) {
    this.dropdown = dropdown;
    this.placement = "bottom";
    this.isOpen = false;
    this.nativeElement = _elementRef.nativeElement;
  }
}
NgbDropdownMenu.ɵfac = __ngDeclareFactory({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: NgbDropdownMenu, deps: [{ token: forwardRef(() => NgbDropdown) }, { token: ElementRef }], target: FactoryTarget.Directive });
NgbDropdownMenu.ɵdir = __ngDeclareDirective({ minVersion: "12.0.0", version: "13.0.3", type: NgbDropdownMenu, selector: "[ngbDropdownMenu]", host: { listeners: { "keydown.ArrowUp": "dropdown.onKeyDown($event)", "keydown.ArrowDown": "dropdown.onKeyDown($event)", "keydown.Home": "dropdown.onKeyDown($event)", "keydown.End": "dropdown.onKeyDown($event)", "keydown.Enter": "dropdown.onKeyDown($event)", "keydown.Space": "dropdown.onKeyDown($event)", "keydown.Tab": "dropdown.onKeyDown($event)", "keydown.Shift.Tab": "dropdown.onKeyDown($event)" }, properties: { "class.dropdown-menu": "true", "class.show": "dropdown.isOpen()" } }, queries: [{ propertyName: "menuItems", predicate: NgbDropdownItem }], ngImport: i0 });
__ngDeclareClassMetadata({ type: NgbDropdownMenu, decorators: [{
  type: Directive,
  args: [{
    selector: "[ngbDropdownMenu]",
    host: {
      "[class.dropdown-menu]": "true",
      "[class.show]": "dropdown.isOpen()",
      "(keydown.ArrowUp)": "dropdown.onKeyDown($event)",
      "(keydown.ArrowDown)": "dropdown.onKeyDown($event)",
      "(keydown.Home)": "dropdown.onKeyDown($event)",
      "(keydown.End)": "dropdown.onKeyDown($event)",
      "(keydown.Enter)": "dropdown.onKeyDown($event)",
      "(keydown.Space)": "dropdown.onKeyDown($event)",
      "(keydown.Tab)": "dropdown.onKeyDown($event)",
      "(keydown.Shift.Tab)": "dropdown.onKeyDown($event)"
    }
  }]
}], ctorParameters: function() {
  return [{ type: void 0, decorators: [{
    type: Inject,
    args: [forwardRef(() => NgbDropdown)]
  }] }, { type: ElementRef }];
}, propDecorators: { menuItems: [{
  type: ContentChildren,
  args: [NgbDropdownItem]
}] } });
class NgbDropdownAnchor {
  constructor(dropdown, _elementRef) {
    this.dropdown = dropdown;
    this.nativeElement = _elementRef.nativeElement;
  }
}
NgbDropdownAnchor.ɵfac = __ngDeclareFactory({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: NgbDropdownAnchor, deps: [{ token: forwardRef(() => NgbDropdown) }, { token: ElementRef }], target: FactoryTarget.Directive });
NgbDropdownAnchor.ɵdir = __ngDeclareDirective({ minVersion: "12.0.0", version: "13.0.3", type: NgbDropdownAnchor, selector: "[ngbDropdownAnchor]", host: { properties: { "attr.aria-expanded": "dropdown.isOpen()" }, classAttribute: "dropdown-toggle" }, ngImport: i0 });
__ngDeclareClassMetadata({ type: NgbDropdownAnchor, decorators: [{
  type: Directive,
  args: [{ selector: "[ngbDropdownAnchor]", host: { "class": "dropdown-toggle", "[attr.aria-expanded]": "dropdown.isOpen()" } }]
}], ctorParameters: function() {
  return [{ type: void 0, decorators: [{
    type: Inject,
    args: [forwardRef(() => NgbDropdown)]
  }] }, { type: ElementRef }];
} });
class NgbDropdownToggle extends NgbDropdownAnchor {
  constructor(dropdown, elementRef) {
    super(dropdown, elementRef);
  }
}
NgbDropdownToggle.ɵfac = __ngDeclareFactory({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: NgbDropdownToggle, deps: [{ token: forwardRef(() => NgbDropdown) }, { token: ElementRef }], target: FactoryTarget.Directive });
NgbDropdownToggle.ɵdir = __ngDeclareDirective({ minVersion: "12.0.0", version: "13.0.3", type: NgbDropdownToggle, selector: "[ngbDropdownToggle]", host: { listeners: { "click": "dropdown.toggle()", "keydown.ArrowUp": "dropdown.onKeyDown($event)", "keydown.ArrowDown": "dropdown.onKeyDown($event)", "keydown.Home": "dropdown.onKeyDown($event)", "keydown.End": "dropdown.onKeyDown($event)", "keydown.Tab": "dropdown.onKeyDown($event)", "keydown.Shift.Tab": "dropdown.onKeyDown($event)" }, properties: { "attr.aria-expanded": "dropdown.isOpen()" }, classAttribute: "dropdown-toggle" }, providers: [{ provide: NgbDropdownAnchor, useExisting: forwardRef(() => NgbDropdownToggle) }], usesInheritance: true, ngImport: i0 });
__ngDeclareClassMetadata({ type: NgbDropdownToggle, decorators: [{
  type: Directive,
  args: [{
    selector: "[ngbDropdownToggle]",
    host: {
      "class": "dropdown-toggle",
      "[attr.aria-expanded]": "dropdown.isOpen()",
      "(click)": "dropdown.toggle()",
      "(keydown.ArrowUp)": "dropdown.onKeyDown($event)",
      "(keydown.ArrowDown)": "dropdown.onKeyDown($event)",
      "(keydown.Home)": "dropdown.onKeyDown($event)",
      "(keydown.End)": "dropdown.onKeyDown($event)",
      "(keydown.Tab)": "dropdown.onKeyDown($event)",
      "(keydown.Shift.Tab)": "dropdown.onKeyDown($event)"
    },
    providers: [{ provide: NgbDropdownAnchor, useExisting: forwardRef(() => NgbDropdownToggle) }]
  }]
}], ctorParameters: function() {
  return [{ type: void 0, decorators: [{
    type: Inject,
    args: [forwardRef(() => NgbDropdown)]
  }] }, { type: ElementRef }];
} });
class NgbDropdown {
  constructor(_changeDetector, config, _document, _ngZone, _elementRef, _renderer, ngbNavbar) {
    this._changeDetector = _changeDetector;
    this._document = _document;
    this._ngZone = _ngZone;
    this._elementRef = _elementRef;
    this._renderer = _renderer;
    this._destroyCloseHandlers$ = new Subject();
    this._bodyContainer = null;
    this._positioning = ngbPositioning();
    this._open = false;
    this.openChange = new EventEmitter();
    this.placement = config.placement;
    this.container = config.container;
    this.autoClose = config.autoClose;
    this.display = ngbNavbar ? "static" : "dynamic";
  }
  ngAfterContentInit() {
    this._ngZone.onStable.pipe(take(1)).subscribe(() => {
      this._applyPlacementClasses();
      if (this._open) {
        this._setCloseHandlers();
      }
    });
  }
  ngOnChanges(changes) {
    if (changes.container && this._open) {
      this._applyContainer(this.container);
    }
    if (changes.placement && !changes.placement.firstChange) {
      this._positioning.setOptions({
        hostElement: this._anchor.nativeElement,
        targetElement: this._bodyContainer || this._menu.nativeElement,
        placement: this.placement,
        appendToBody: this.container === "body"
      });
      this._applyPlacementClasses();
    }
    if (changes.dropdownClass) {
      const { currentValue, previousValue } = changes.dropdownClass;
      this._applyCustomDropdownClass(currentValue, previousValue);
    }
    if (changes.autoClose && this._open) {
      this.autoClose = changes.autoClose.currentValue;
      this._setCloseHandlers();
    }
  }
  /**
   * Checks if the dropdown menu is open.
   */
  isOpen() {
    return this._open;
  }
  /**
   * Opens the dropdown menu.
   */
  open() {
    if (!this._open) {
      this._open = true;
      this._applyContainer(this.container);
      this.openChange.emit(true);
      this._setCloseHandlers();
      if (this._anchor) {
        this._anchor.nativeElement.focus();
        if (this.display === "dynamic") {
          this._ngZone.runOutsideAngular(() => {
            this._positioning.createPopper({
              hostElement: this._anchor.nativeElement,
              targetElement: this._bodyContainer || this._menu.nativeElement,
              placement: this.placement,
              appendToBody: this.container === "body",
              updatePopperOptions: addPopperOffset([0, 2])
            });
            this._applyPlacementClasses();
            this._zoneSubscription = this._ngZone.onStable.subscribe(() => this._positionMenu());
          });
        }
      }
    }
  }
  _setCloseHandlers() {
    this._destroyCloseHandlers$.next();
    ngbAutoClose(this._ngZone, this._document, this.autoClose, (source) => {
      this.close();
      if (source === 0) {
        this._anchor.nativeElement.focus();
      }
    }, this._destroyCloseHandlers$, this._menu ? [this._menu.nativeElement] : [], this._anchor ? [this._anchor.nativeElement] : [], ".dropdown-item,.dropdown-divider");
  }
  /**
   * Closes the dropdown menu.
   */
  close() {
    if (this._open) {
      this._open = false;
      this._resetContainer();
      this._positioning.destroy();
      this._zoneSubscription?.unsubscribe();
      this._destroyCloseHandlers$.next();
      this.openChange.emit(false);
      this._changeDetector.markForCheck();
    }
  }
  /**
   * Toggles the dropdown menu.
   */
  toggle() {
    if (this.isOpen()) {
      this.close();
    } else {
      this.open();
    }
  }
  ngOnDestroy() {
    this.close();
  }
  onKeyDown(event) {
    const key = event.which;
    const itemElements = this._getMenuElements();
    let position = -1;
    let itemElement = null;
    const isEventFromToggle = this._isEventFromToggle(event);
    if (!isEventFromToggle && itemElements.length) {
      itemElements.forEach((item, index) => {
        if (item.contains(event.target)) {
          itemElement = item;
        }
        if (item === this._document.activeElement) {
          position = index;
        }
      });
    }
    if (key === Key.Space || key === Key.Enter) {
      if (itemElement && (this.autoClose === true || this.autoClose === "inside")) {
        fromEvent(itemElement, "click").pipe(take(1)).subscribe(() => this.close());
      }
      return;
    }
    if (key === Key.Tab) {
      if (event.target && this.isOpen() && this.autoClose) {
        if (this._anchor.nativeElement === event.target) {
          if (this.container === "body" && !event.shiftKey) {
            this._renderer.setAttribute(this._menu.nativeElement, "tabindex", "0");
            this._menu.nativeElement.focus();
            this._renderer.removeAttribute(this._menu.nativeElement, "tabindex");
          } else if (event.shiftKey) {
            this.close();
          }
          return;
        } else if (this.container === "body") {
          const focusableElements = this._menu.nativeElement.querySelectorAll(FOCUSABLE_ELEMENTS_SELECTOR);
          if (event.shiftKey && event.target === focusableElements[0]) {
            this._anchor.nativeElement.focus();
            event.preventDefault();
          } else if (!event.shiftKey && event.target === focusableElements[focusableElements.length - 1]) {
            this._anchor.nativeElement.focus();
            this.close();
          }
        } else {
          fromEvent(event.target, "focusout").pipe(take(1)).subscribe(({ relatedTarget }) => {
            if (!this._elementRef.nativeElement.contains(relatedTarget)) {
              this.close();
            }
          });
        }
      }
      return;
    }
    if (isEventFromToggle || itemElement) {
      this.open();
      if (itemElements.length) {
        switch (key) {
          case Key.ArrowDown:
            position = Math.min(position + 1, itemElements.length - 1);
            break;
          case Key.ArrowUp:
            if (this._isDropup() && position === -1) {
              position = itemElements.length - 1;
              break;
            }
            position = Math.max(position - 1, 0);
            break;
          case Key.Home:
            position = 0;
            break;
          case Key.End:
            position = itemElements.length - 1;
            break;
        }
        itemElements[position].focus();
      }
      event.preventDefault();
    }
  }
  _isDropup() {
    return this._elementRef.nativeElement.classList.contains("dropup");
  }
  _isEventFromToggle(event) {
    return this._anchor.nativeElement.contains(event.target);
  }
  _getMenuElements() {
    const menu = this._menu;
    if (menu == null) {
      return [];
    }
    return menu.menuItems.filter((item) => !item.disabled).map((item) => item.elementRef.nativeElement);
  }
  _positionMenu() {
    const menu = this._menu;
    if (this.isOpen() && menu) {
      if (this.display === "dynamic") {
        this._positioning.update();
        this._applyPlacementClasses();
      } else {
        this._applyPlacementClasses(this._getFirstPlacement(this.placement));
      }
    }
  }
  _getFirstPlacement(placement) {
    return Array.isArray(placement) ? placement[0] : placement.split(" ")[0];
  }
  _resetContainer() {
    const renderer = this._renderer;
    if (this._menu) {
      const dropdownElement = this._elementRef.nativeElement;
      const dropdownMenuElement = this._menu.nativeElement;
      renderer.appendChild(dropdownElement, dropdownMenuElement);
    }
    if (this._bodyContainer) {
      renderer.removeChild(this._document.body, this._bodyContainer);
      this._bodyContainer = null;
    }
  }
  _applyContainer(container = null) {
    this._resetContainer();
    if (container === "body") {
      const renderer = this._renderer;
      const dropdownMenuElement = this._menu.nativeElement;
      const bodyContainer = this._bodyContainer = this._bodyContainer || renderer.createElement("div");
      renderer.setStyle(bodyContainer, "position", "absolute");
      renderer.setStyle(dropdownMenuElement, "position", "static");
      renderer.setStyle(bodyContainer, "z-index", "1055");
      renderer.appendChild(bodyContainer, dropdownMenuElement);
      renderer.appendChild(this._document.body, bodyContainer);
    }
    this._applyCustomDropdownClass(this.dropdownClass);
  }
  _applyCustomDropdownClass(newClass, oldClass) {
    const targetElement = this.container === "body" ? this._bodyContainer : this._elementRef.nativeElement;
    if (targetElement) {
      if (oldClass) {
        this._renderer.removeClass(targetElement, oldClass);
      }
      if (newClass) {
        this._renderer.addClass(targetElement, newClass);
      }
    }
  }
  _applyPlacementClasses(placement) {
    const menu = this._menu;
    if (menu) {
      if (!placement) {
        placement = this._getFirstPlacement(this.placement);
      }
      const renderer = this._renderer;
      const dropdownElement = this._elementRef.nativeElement;
      renderer.removeClass(dropdownElement, "dropup");
      renderer.removeClass(dropdownElement, "dropdown");
      const { nativeElement } = menu;
      if (this.display === "static") {
        menu.placement = null;
        renderer.setAttribute(nativeElement, "data-bs-popper", "static");
      } else {
        menu.placement = placement;
        renderer.removeAttribute(nativeElement, "data-bs-popper");
      }
      const dropdownClass = placement.search("^top") !== -1 ? "dropup" : "dropdown";
      renderer.addClass(dropdownElement, dropdownClass);
      const bodyContainer = this._bodyContainer;
      if (bodyContainer) {
        renderer.removeClass(bodyContainer, "dropup");
        renderer.removeClass(bodyContainer, "dropdown");
        renderer.addClass(bodyContainer, dropdownClass);
      }
    }
  }
}
NgbDropdown.ɵfac = __ngDeclareFactory({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: NgbDropdown, deps: [{ token: ChangeDetectorRef }, { token: NgbDropdownConfig }, { token: DOCUMENT }, { token: NgZone }, { token: ElementRef }, { token: Renderer2 }, { token: NgbNavbar, optional: true }], target: FactoryTarget.Directive });
NgbDropdown.ɵdir = __ngDeclareDirective({ minVersion: "12.0.0", version: "13.0.3", type: NgbDropdown, selector: "[ngbDropdown]", inputs: { autoClose: "autoClose", dropdownClass: "dropdownClass", _open: ["open", "_open"], placement: "placement", container: "container", display: "display" }, outputs: { openChange: "openChange" }, host: { properties: { "class.show": "isOpen()" } }, queries: [{ propertyName: "_menu", first: true, predicate: NgbDropdownMenu, descendants: true }, { propertyName: "_anchor", first: true, predicate: NgbDropdownAnchor, descendants: true }], exportAs: ["ngbDropdown"], usesOnChanges: true, ngImport: i0 });
__ngDeclareClassMetadata({ type: NgbDropdown, decorators: [{
  type: Directive,
  args: [{ selector: "[ngbDropdown]", exportAs: "ngbDropdown", host: { "[class.show]": "isOpen()" } }]
}], ctorParameters: function() {
  return [{ type: ChangeDetectorRef }, { type: NgbDropdownConfig }, { type: void 0, decorators: [{
    type: Inject,
    args: [DOCUMENT]
  }] }, { type: NgZone }, { type: ElementRef }, { type: Renderer2 }, { type: NgbNavbar, decorators: [{
    type: Optional
  }] }];
}, propDecorators: { _menu: [{
  type: ContentChild,
  args: [NgbDropdownMenu, { static: false }]
}], _anchor: [{
  type: ContentChild,
  args: [NgbDropdownAnchor, { static: false }]
}], autoClose: [{
  type: Input
}], dropdownClass: [{
  type: Input
}], _open: [{
  type: Input,
  args: ["open"]
}], placement: [{
  type: Input
}], container: [{
  type: Input
}], display: [{
  type: Input
}], openChange: [{
  type: Output
}] } });
const NGB_DROPDOWN_DIRECTIVES = [NgbDropdown, NgbDropdownAnchor, NgbDropdownToggle, NgbDropdownMenu, NgbDropdownItem, NgbNavbar];
class NgbDropdownModule {
}
NgbDropdownModule.ɵfac = __ngDeclareFactory({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: NgbDropdownModule, deps: [], target: FactoryTarget.NgModule });
NgbDropdownModule.ɵmod = __ngDeclareNgModule({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: NgbDropdownModule, declarations: [NgbDropdown, NgbDropdownAnchor, NgbDropdownToggle, NgbDropdownMenu, NgbDropdownItem, NgbNavbar], exports: [NgbDropdown, NgbDropdownAnchor, NgbDropdownToggle, NgbDropdownMenu, NgbDropdownItem, NgbNavbar] });
NgbDropdownModule.ɵinj = __ngDeclareInjector({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: NgbDropdownModule });
__ngDeclareClassMetadata({ type: NgbDropdownModule, decorators: [{
  type: NgModule,
  args: [{ declarations: NGB_DROPDOWN_DIRECTIVES, exports: NGB_DROPDOWN_DIRECTIVES }]
}] });
class ContentRef {
  constructor(nodes, viewRef, componentRef) {
    this.nodes = nodes;
    this.viewRef = viewRef;
    this.componentRef = componentRef;
  }
}
class PopupService {
  constructor(_type, _injector, _viewContainerRef, _renderer, _ngZone, _applicationRef) {
    this._type = _type;
    this._injector = _injector;
    this._viewContainerRef = _viewContainerRef;
    this._renderer = _renderer;
    this._ngZone = _ngZone;
    this._applicationRef = _applicationRef;
    this._windowRef = null;
    this._contentRef = null;
  }
  open(content, context, animation = false) {
    if (!this._windowRef) {
      this._contentRef = this._getContentRef(content, context);
      this._windowRef = this._viewContainerRef.createComponent(this._type, { index: this._viewContainerRef.length, injector: this._injector, projectableNodes: this._contentRef.nodes });
    }
    const { nativeElement } = this._windowRef.location;
    const transition$ = this._ngZone.onStable.pipe(take(1), mergeMap(() => ngbRunTransition(this._ngZone, nativeElement, ({ classList }) => classList.add("show"), { animation, runningTransition: "continue" })));
    return { windowRef: this._windowRef, transition$ };
  }
  close(animation = false) {
    if (!this._windowRef) {
      return of(void 0);
    }
    return ngbRunTransition(this._ngZone, this._windowRef.location.nativeElement, ({ classList }) => classList.remove("show"), { animation, runningTransition: "stop" }).pipe(tap(() => {
      if (this._windowRef) {
        this._viewContainerRef.remove(this._viewContainerRef.indexOf(this._windowRef.hostView));
        this._windowRef = null;
      }
      if (this._contentRef?.viewRef) {
        this._applicationRef.detachView(this._contentRef.viewRef);
        this._contentRef.viewRef.destroy();
        this._contentRef = null;
      }
    }));
  }
  _getContentRef(content, context) {
    if (!content) {
      return new ContentRef([]);
    } else if (content instanceof TemplateRef) {
      const viewRef = content.createEmbeddedView(context);
      this._applicationRef.attachView(viewRef);
      return new ContentRef([viewRef.rootNodes], viewRef);
    } else {
      return new ContentRef([[this._renderer.createText(`${content}`)]]);
    }
  }
}
class NgbModalBackdrop {
  constructor(_el, _zone) {
    this._el = _el;
    this._zone = _zone;
  }
  ngOnInit() {
    this._zone.onStable.asObservable().pipe(take(1)).subscribe(() => {
      ngbRunTransition(this._zone, this._el.nativeElement, (element, animation) => {
        if (animation) {
          reflow(element);
        }
        element.classList.add("show");
      }, { animation: this.animation, runningTransition: "continue" });
    });
  }
  hide() {
    return ngbRunTransition(this._zone, this._el.nativeElement, ({ classList }) => classList.remove("show"), { animation: this.animation, runningTransition: "stop" });
  }
}
NgbModalBackdrop.ɵfac = __ngDeclareFactory({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: NgbModalBackdrop, deps: [{ token: ElementRef }, { token: NgZone }], target: FactoryTarget.Component });
NgbModalBackdrop.ɵcmp = __ngDeclareComponent({ minVersion: "12.0.0", version: "13.0.3", type: NgbModalBackdrop, selector: "ngb-modal-backdrop", inputs: { animation: "animation", backdropClass: "backdropClass" }, host: { properties: { "class": '"modal-backdrop" + (backdropClass ? " " + backdropClass : "")', "class.show": "!animation", "class.fade": "animation" }, styleAttribute: "z-index: 1055" }, ngImport: i0, template: "", isInline: true, encapsulation: ViewEncapsulation$1.None });
__ngDeclareClassMetadata({ type: NgbModalBackdrop, decorators: [{
  type: Component,
  args: [{
    selector: "ngb-modal-backdrop",
    encapsulation: ViewEncapsulation$1.None,
    template: "",
    host: {
      "[class]": '"modal-backdrop" + (backdropClass ? " " + backdropClass : "")',
      "[class.show]": "!animation",
      "[class.fade]": "animation",
      "style": "z-index: 1055"
    }
  }]
}], ctorParameters: function() {
  return [{ type: ElementRef }, { type: NgZone }];
}, propDecorators: { animation: [{
  type: Input
}], backdropClass: [{
  type: Input
}] } });
class NgbActiveModal {
  /**
   * Closes the modal with an optional `result` value.
   *
   * The `NgbModalRef.result` promise will be resolved with the provided value.
   */
  close(result) {
  }
  /**
   * Dismisses the modal with an optional `reason` value.
   *
   * The `NgbModalRef.result` promise will be rejected with the provided value.
   */
  dismiss(reason) {
  }
}
class NgbModalRef {
  constructor(_windowCmptRef, _contentRef, _backdropCmptRef, _beforeDismiss) {
    this._windowCmptRef = _windowCmptRef;
    this._contentRef = _contentRef;
    this._backdropCmptRef = _backdropCmptRef;
    this._beforeDismiss = _beforeDismiss;
    this._closed = new Subject();
    this._dismissed = new Subject();
    this._hidden = new Subject();
    _windowCmptRef.instance.dismissEvent.subscribe((reason) => {
      this.dismiss(reason);
    });
    this.result = new Promise((resolve, reject) => {
      this._resolve = resolve;
      this._reject = reject;
    });
    this.result.then(null, () => {
    });
  }
  /**
   * The instance of a component used for the modal content.
   *
   * When a `TemplateRef` is used as the content or when the modal is closed, will return `undefined`.
   */
  get componentInstance() {
    if (this._contentRef && this._contentRef.componentRef) {
      return this._contentRef.componentRef.instance;
    }
  }
  /**
   * The observable that emits when the modal is closed via the `.close()` method.
   *
   * It will emit the result passed to the `.close()` method.
   *
   * @since 8.0.0
   */
  get closed() {
    return this._closed.asObservable().pipe(takeUntil(this._hidden));
  }
  /**
   * The observable that emits when the modal is dismissed via the `.dismiss()` method.
   *
   * It will emit the reason passed to the `.dismissed()` method by the user, or one of the internal
   * reasons like backdrop click or ESC key press.
   *
   * @since 8.0.0
   */
  get dismissed() {
    return this._dismissed.asObservable().pipe(takeUntil(this._hidden));
  }
  /**
   * The observable that emits when both modal window and backdrop are closed and animations were finished.
   * At this point modal and backdrop elements will be removed from the DOM tree.
   *
   * This observable will be completed after emitting.
   *
   * @since 8.0.0
   */
  get hidden() {
    return this._hidden.asObservable();
  }
  /**
   * The observable that emits when modal is fully visible and animation was finished.
   * Modal DOM element is always available synchronously after calling 'modal.open()' service.
   *
   * This observable will be completed after emitting.
   * It will not emit, if modal is closed before open animation is finished.
   *
   * @since 8.0.0
   */
  get shown() {
    return this._windowCmptRef.instance.shown.asObservable();
  }
  /**
   * Closes the modal with an optional `result` value.
   *
   * The `NgbMobalRef.result` promise will be resolved with the provided value.
   */
  close(result) {
    if (this._windowCmptRef) {
      this._closed.next(result);
      this._resolve(result);
      this._removeModalElements();
    }
  }
  _dismiss(reason) {
    this._dismissed.next(reason);
    this._reject(reason);
    this._removeModalElements();
  }
  /**
   * Dismisses the modal with an optional `reason` value.
   *
   * The `NgbModalRef.result` promise will be rejected with the provided value.
   */
  dismiss(reason) {
    if (this._windowCmptRef) {
      if (!this._beforeDismiss) {
        this._dismiss(reason);
      } else {
        const dismiss = this._beforeDismiss();
        if (isPromise(dismiss)) {
          dismiss.then((result) => {
            if (result !== false) {
              this._dismiss(reason);
            }
          }, () => {
          });
        } else if (dismiss !== false) {
          this._dismiss(reason);
        }
      }
    }
  }
  _removeModalElements() {
    const windowTransition$ = this._windowCmptRef.instance.hide();
    const backdropTransition$ = this._backdropCmptRef ? this._backdropCmptRef.instance.hide() : of(void 0);
    windowTransition$.subscribe(() => {
      const { nativeElement } = this._windowCmptRef.location;
      nativeElement.parentNode.removeChild(nativeElement);
      this._windowCmptRef.destroy();
      if (this._contentRef && this._contentRef.viewRef) {
        this._contentRef.viewRef.destroy();
      }
      this._windowCmptRef = null;
      this._contentRef = null;
    });
    backdropTransition$.subscribe(() => {
      if (this._backdropCmptRef) {
        const { nativeElement } = this._backdropCmptRef.location;
        nativeElement.parentNode.removeChild(nativeElement);
        this._backdropCmptRef.destroy();
        this._backdropCmptRef = null;
      }
    });
    zip(windowTransition$, backdropTransition$).subscribe(() => {
      this._hidden.next();
      this._hidden.complete();
    });
  }
}
var ModalDismissReasons;
(function(ModalDismissReasons2) {
  ModalDismissReasons2[ModalDismissReasons2["BACKDROP_CLICK"] = 0] = "BACKDROP_CLICK";
  ModalDismissReasons2[ModalDismissReasons2["ESC"] = 1] = "ESC";
})(ModalDismissReasons || (ModalDismissReasons = {}));
class NgbModalWindow {
  constructor(_document, _elRef, _zone) {
    this._document = _document;
    this._elRef = _elRef;
    this._zone = _zone;
    this._closed$ = new Subject();
    this._elWithFocus = null;
    this.backdrop = true;
    this.keyboard = true;
    this.dismissEvent = new EventEmitter();
    this.shown = new Subject();
    this.hidden = new Subject();
  }
  get fullscreenClass() {
    return this.fullscreen === true ? " modal-fullscreen" : isString(this.fullscreen) ? ` modal-fullscreen-${this.fullscreen}-down` : "";
  }
  dismiss(reason) {
    this.dismissEvent.emit(reason);
  }
  ngOnInit() {
    this._elWithFocus = this._document.activeElement;
    this._zone.onStable.asObservable().pipe(take(1)).subscribe(() => {
      this._show();
    });
  }
  ngOnDestroy() {
    this._disableEventHandling();
  }
  hide() {
    const { nativeElement } = this._elRef;
    const context = { animation: this.animation, runningTransition: "stop" };
    const windowTransition$ = ngbRunTransition(this._zone, nativeElement, () => nativeElement.classList.remove("show"), context);
    const dialogTransition$ = ngbRunTransition(this._zone, this._dialogEl.nativeElement, () => {
    }, context);
    const transitions$ = zip(windowTransition$, dialogTransition$);
    transitions$.subscribe(() => {
      this.hidden.next();
      this.hidden.complete();
    });
    this._disableEventHandling();
    this._restoreFocus();
    return transitions$;
  }
  _show() {
    const context = { animation: this.animation, runningTransition: "continue" };
    const windowTransition$ = ngbRunTransition(this._zone, this._elRef.nativeElement, (element, animation) => {
      if (animation) {
        reflow(element);
      }
      element.classList.add("show");
    }, context);
    const dialogTransition$ = ngbRunTransition(this._zone, this._dialogEl.nativeElement, () => {
    }, context);
    zip(windowTransition$, dialogTransition$).subscribe(() => {
      this.shown.next();
      this.shown.complete();
    });
    this._enableEventHandling();
    this._setFocus();
  }
  _enableEventHandling() {
    const { nativeElement } = this._elRef;
    this._zone.runOutsideAngular(() => {
      fromEvent(nativeElement, "keydown").pipe(
        takeUntil(this._closed$),
        /* eslint-disable-next-line deprecation/deprecation */
        filter((e) => e.which === Key.Escape)
      ).subscribe((event) => {
        if (this.keyboard) {
          requestAnimationFrame(() => {
            if (!event.defaultPrevented) {
              this._zone.run(() => this.dismiss(ModalDismissReasons.ESC));
            }
          });
        } else if (this.backdrop === "static") {
          this._bumpBackdrop();
        }
      });
      let preventClose = false;
      fromEvent(this._dialogEl.nativeElement, "mousedown").pipe(takeUntil(this._closed$), tap(() => preventClose = false), switchMap(() => fromEvent(nativeElement, "mouseup").pipe(takeUntil(this._closed$), take(1))), filter(({ target }) => nativeElement === target)).subscribe(() => {
        preventClose = true;
      });
      fromEvent(nativeElement, "click").pipe(takeUntil(this._closed$)).subscribe(({ target }) => {
        if (nativeElement === target) {
          if (this.backdrop === "static") {
            this._bumpBackdrop();
          } else if (this.backdrop === true && !preventClose) {
            this._zone.run(() => this.dismiss(ModalDismissReasons.BACKDROP_CLICK));
          }
        }
        preventClose = false;
      });
    });
  }
  _disableEventHandling() {
    this._closed$.next();
  }
  _setFocus() {
    const { nativeElement } = this._elRef;
    if (!nativeElement.contains(document.activeElement)) {
      const autoFocusable = nativeElement.querySelector(`[ngbAutofocus]`);
      const firstFocusable = getFocusableBoundaryElements(nativeElement)[0];
      const elementToFocus = autoFocusable || firstFocusable || nativeElement;
      elementToFocus.focus();
    }
  }
  _restoreFocus() {
    const body = this._document.body;
    const elWithFocus = this._elWithFocus;
    let elementToFocus;
    if (elWithFocus && elWithFocus["focus"] && body.contains(elWithFocus)) {
      elementToFocus = elWithFocus;
    } else {
      elementToFocus = body;
    }
    this._zone.runOutsideAngular(() => {
      setTimeout(() => elementToFocus.focus());
      this._elWithFocus = null;
    });
  }
  _bumpBackdrop() {
    if (this.backdrop === "static") {
      ngbRunTransition(this._zone, this._elRef.nativeElement, ({ classList }) => {
        classList.add("modal-static");
        return () => classList.remove("modal-static");
      }, { animation: this.animation, runningTransition: "continue" });
    }
  }
}
NgbModalWindow.ɵfac = __ngDeclareFactory({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: NgbModalWindow, deps: [{ token: DOCUMENT }, { token: ElementRef }, { token: NgZone }], target: FactoryTarget.Component });
NgbModalWindow.ɵcmp = __ngDeclareComponent({ minVersion: "12.0.0", version: "13.0.3", type: NgbModalWindow, selector: "ngb-modal-window", inputs: { animation: "animation", ariaLabelledBy: "ariaLabelledBy", ariaDescribedBy: "ariaDescribedBy", backdrop: "backdrop", centered: "centered", fullscreen: "fullscreen", keyboard: "keyboard", scrollable: "scrollable", size: "size", windowClass: "windowClass", modalDialogClass: "modalDialogClass" }, outputs: { dismissEvent: "dismiss" }, host: { attributes: { "role": "dialog", "tabindex": "-1" }, properties: { "class": '"modal d-block" + (windowClass ? " " + windowClass : "")', "class.fade": "animation", "attr.aria-modal": "true", "attr.aria-labelledby": "ariaLabelledBy", "attr.aria-describedby": "ariaDescribedBy" } }, viewQueries: [{ propertyName: "_dialogEl", first: true, predicate: ["dialog"], descendants: true, static: true }], ngImport: i0, template: `
    <div #dialog [class]="'modal-dialog' + (size ? ' modal-' + size : '') + (centered ? ' modal-dialog-centered' : '') +
     fullscreenClass + (scrollable ? ' modal-dialog-scrollable' : '') + (modalDialogClass ? ' ' + modalDialogClass : '')" role="document">
        <div class="modal-content"><ng-content></ng-content></div>
    </div>
    `, isInline: true, styles: ["ngb-modal-window .component-host-scrollable{display:flex;flex-direction:column;overflow:hidden}\n"], encapsulation: ViewEncapsulation$1.None });
__ngDeclareClassMetadata({ type: NgbModalWindow, decorators: [{
  type: Component,
  args: [{ selector: "ngb-modal-window", host: {
    "[class]": '"modal d-block" + (windowClass ? " " + windowClass : "")',
    "[class.fade]": "animation",
    "role": "dialog",
    "tabindex": "-1",
    "[attr.aria-modal]": "true",
    "[attr.aria-labelledby]": "ariaLabelledBy",
    "[attr.aria-describedby]": "ariaDescribedBy"
  }, template: `
    <div #dialog [class]="'modal-dialog' + (size ? ' modal-' + size : '') + (centered ? ' modal-dialog-centered' : '') +
     fullscreenClass + (scrollable ? ' modal-dialog-scrollable' : '') + (modalDialogClass ? ' ' + modalDialogClass : '')" role="document">
        <div class="modal-content"><ng-content></ng-content></div>
    </div>
    `, encapsulation: ViewEncapsulation$1.None, styles: ["ngb-modal-window .component-host-scrollable{display:flex;flex-direction:column;overflow:hidden}\n"] }]
}], ctorParameters: function() {
  return [{ type: void 0, decorators: [{
    type: Inject,
    args: [DOCUMENT]
  }] }, { type: ElementRef }, { type: NgZone }];
}, propDecorators: { _dialogEl: [{
  type: ViewChild,
  args: ["dialog", { static: true }]
}], animation: [{
  type: Input
}], ariaLabelledBy: [{
  type: Input
}], ariaDescribedBy: [{
  type: Input
}], backdrop: [{
  type: Input
}], centered: [{
  type: Input
}], fullscreen: [{
  type: Input
}], keyboard: [{
  type: Input
}], scrollable: [{
  type: Input
}], size: [{
  type: Input
}], windowClass: [{
  type: Input
}], modalDialogClass: [{
  type: Input
}], dismissEvent: [{
  type: Output,
  args: ["dismiss"]
}] } });
class ScrollBar {
  constructor(_document) {
    this._document = _document;
  }
  /**
   * To be called to hide a potential vertical scrollbar:
   * - if a scrollbar is there and has a width greater than 0, adds some compensation
   * padding to the body to keep the same layout as when the scrollbar is there
   * - adds overflow: hidden
   *
   * @return a callback used to revert the change
   */
  hide() {
    const scrollbarWidth = Math.abs(window.innerWidth - this._document.documentElement.clientWidth);
    const body = this._document.body;
    const bodyStyle = body.style;
    const { overflow, paddingRight } = bodyStyle;
    if (scrollbarWidth > 0) {
      const actualPadding = parseFloat(window.getComputedStyle(body).paddingRight);
      bodyStyle.paddingRight = `${actualPadding + scrollbarWidth}px`;
    }
    bodyStyle.overflow = "hidden";
    return () => {
      if (scrollbarWidth > 0) {
        bodyStyle.paddingRight = paddingRight;
      }
      bodyStyle.overflow = overflow;
    };
  }
}
ScrollBar.ɵfac = __ngDeclareFactory({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: ScrollBar, deps: [{ token: DOCUMENT }], target: FactoryTarget.Injectable });
ScrollBar.ɵprov = __ngDeclareInjectable({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: ScrollBar, providedIn: "root" });
__ngDeclareClassMetadata({ type: ScrollBar, decorators: [{
  type: Injectable,
  args: [{ providedIn: "root" }]
}], ctorParameters: function() {
  return [{ type: void 0, decorators: [{
    type: Inject,
    args: [DOCUMENT]
  }] }];
} });
class NgbModalStack {
  constructor(_applicationRef, _injector, _document, _scrollBar, _rendererFactory, _ngZone) {
    this._applicationRef = _applicationRef;
    this._injector = _injector;
    this._document = _document;
    this._scrollBar = _scrollBar;
    this._rendererFactory = _rendererFactory;
    this._ngZone = _ngZone;
    this._activeWindowCmptHasChanged = new Subject();
    this._ariaHiddenValues = /* @__PURE__ */ new Map();
    this._scrollBarRestoreFn = null;
    this._backdropAttributes = ["animation", "backdropClass"];
    this._modalRefs = [];
    this._windowAttributes = [
      "animation",
      "ariaLabelledBy",
      "ariaDescribedBy",
      "backdrop",
      "centered",
      "fullscreen",
      "keyboard",
      "scrollable",
      "size",
      "windowClass",
      "modalDialogClass"
    ];
    this._windowCmpts = [];
    this._activeInstances = new EventEmitter();
    this._activeWindowCmptHasChanged.subscribe(() => {
      if (this._windowCmpts.length) {
        const activeWindowCmpt = this._windowCmpts[this._windowCmpts.length - 1];
        ngbFocusTrap(this._ngZone, activeWindowCmpt.location.nativeElement, this._activeWindowCmptHasChanged);
        this._revertAriaHidden();
        this._setAriaHidden(activeWindowCmpt.location.nativeElement);
      }
    });
  }
  _restoreScrollBar() {
    const scrollBarRestoreFn = this._scrollBarRestoreFn;
    if (scrollBarRestoreFn) {
      this._scrollBarRestoreFn = null;
      scrollBarRestoreFn();
    }
  }
  _hideScrollBar() {
    if (!this._scrollBarRestoreFn) {
      this._scrollBarRestoreFn = this._scrollBar.hide();
    }
  }
  open(moduleCFR, contentInjector, content, options) {
    const containerEl = options.container instanceof HTMLElement ? options.container : isDefined(options.container) ? this._document.querySelector(options.container) : this._document.body;
    const renderer = this._rendererFactory.createRenderer(null, null);
    if (!containerEl) {
      throw new Error(`The specified modal container "${options.container || "body"}" was not found in the DOM.`);
    }
    this._hideScrollBar();
    const activeModal = new NgbActiveModal();
    const contentRef = this._getContentRef(moduleCFR, options.injector || contentInjector, content, activeModal, options);
    let backdropCmptRef = options.backdrop !== false ? this._attachBackdrop(moduleCFR, containerEl) : void 0;
    let windowCmptRef = this._attachWindowComponent(moduleCFR, containerEl, contentRef);
    let ngbModalRef = new NgbModalRef(windowCmptRef, contentRef, backdropCmptRef, options.beforeDismiss);
    this._registerModalRef(ngbModalRef);
    this._registerWindowCmpt(windowCmptRef);
    ngbModalRef.hidden.pipe(take(1)).subscribe(() => Promise.resolve(true).then(() => {
      if (!this._modalRefs.length) {
        renderer.removeClass(this._document.body, "modal-open");
        this._restoreScrollBar();
        this._revertAriaHidden();
      }
    }));
    activeModal.close = (result) => {
      ngbModalRef.close(result);
    };
    activeModal.dismiss = (reason) => {
      ngbModalRef.dismiss(reason);
    };
    this._applyWindowOptions(windowCmptRef.instance, options);
    if (this._modalRefs.length === 1) {
      renderer.addClass(this._document.body, "modal-open");
    }
    if (backdropCmptRef && backdropCmptRef.instance) {
      this._applyBackdropOptions(backdropCmptRef.instance, options);
      backdropCmptRef.changeDetectorRef.detectChanges();
    }
    windowCmptRef.changeDetectorRef.detectChanges();
    return ngbModalRef;
  }
  get activeInstances() {
    return this._activeInstances;
  }
  dismissAll(reason) {
    this._modalRefs.forEach((ngbModalRef) => ngbModalRef.dismiss(reason));
  }
  hasOpenModals() {
    return this._modalRefs.length > 0;
  }
  _attachBackdrop(moduleCFR, containerEl) {
    let backdropFactory = moduleCFR.resolveComponentFactory(NgbModalBackdrop);
    let backdropCmptRef = backdropFactory.create(this._injector);
    this._applicationRef.attachView(backdropCmptRef.hostView);
    containerEl.appendChild(backdropCmptRef.location.nativeElement);
    return backdropCmptRef;
  }
  _attachWindowComponent(moduleCFR, containerEl, contentRef) {
    let windowFactory = moduleCFR.resolveComponentFactory(NgbModalWindow);
    let windowCmptRef = windowFactory.create(this._injector, contentRef.nodes);
    this._applicationRef.attachView(windowCmptRef.hostView);
    containerEl.appendChild(windowCmptRef.location.nativeElement);
    return windowCmptRef;
  }
  _applyWindowOptions(windowInstance, options) {
    this._windowAttributes.forEach((optionName) => {
      if (isDefined(options[optionName])) {
        windowInstance[optionName] = options[optionName];
      }
    });
  }
  _applyBackdropOptions(backdropInstance, options) {
    this._backdropAttributes.forEach((optionName) => {
      if (isDefined(options[optionName])) {
        backdropInstance[optionName] = options[optionName];
      }
    });
  }
  _getContentRef(moduleCFR, contentInjector, content, activeModal, options) {
    if (!content) {
      return new ContentRef([]);
    } else if (content instanceof TemplateRef) {
      return this._createFromTemplateRef(content, activeModal);
    } else if (isString(content)) {
      return this._createFromString(content);
    } else {
      return this._createFromComponent(moduleCFR, contentInjector, content, activeModal, options);
    }
  }
  _createFromTemplateRef(content, activeModal) {
    const context = {
      $implicit: activeModal,
      close(result) {
        activeModal.close(result);
      },
      dismiss(reason) {
        activeModal.dismiss(reason);
      }
    };
    const viewRef = content.createEmbeddedView(context);
    this._applicationRef.attachView(viewRef);
    return new ContentRef([viewRef.rootNodes], viewRef);
  }
  _createFromString(content) {
    const component = this._document.createTextNode(`${content}`);
    return new ContentRef([[component]]);
  }
  _createFromComponent(moduleCFR, contentInjector, content, context, options) {
    const contentCmptFactory = moduleCFR.resolveComponentFactory(content);
    const modalContentInjector = Injector.create({ providers: [{ provide: NgbActiveModal, useValue: context }], parent: contentInjector });
    const componentRef = contentCmptFactory.create(modalContentInjector);
    const componentNativeEl = componentRef.location.nativeElement;
    if (options.scrollable) {
      componentNativeEl.classList.add("component-host-scrollable");
    }
    this._applicationRef.attachView(componentRef.hostView);
    return new ContentRef([[componentNativeEl]], componentRef.hostView, componentRef);
  }
  _setAriaHidden(element) {
    const parent = element.parentElement;
    if (parent && element !== this._document.body) {
      Array.from(parent.children).forEach((sibling) => {
        if (sibling !== element && sibling.nodeName !== "SCRIPT") {
          this._ariaHiddenValues.set(sibling, sibling.getAttribute("aria-hidden"));
          sibling.setAttribute("aria-hidden", "true");
        }
      });
      this._setAriaHidden(parent);
    }
  }
  _revertAriaHidden() {
    this._ariaHiddenValues.forEach((value, element) => {
      if (value) {
        element.setAttribute("aria-hidden", value);
      } else {
        element.removeAttribute("aria-hidden");
      }
    });
    this._ariaHiddenValues.clear();
  }
  _registerModalRef(ngbModalRef) {
    const unregisterModalRef = () => {
      const index = this._modalRefs.indexOf(ngbModalRef);
      if (index > -1) {
        this._modalRefs.splice(index, 1);
        this._activeInstances.emit(this._modalRefs);
      }
    };
    this._modalRefs.push(ngbModalRef);
    this._activeInstances.emit(this._modalRefs);
    ngbModalRef.result.then(unregisterModalRef, unregisterModalRef);
  }
  _registerWindowCmpt(ngbWindowCmpt) {
    this._windowCmpts.push(ngbWindowCmpt);
    this._activeWindowCmptHasChanged.next();
    ngbWindowCmpt.onDestroy(() => {
      const index = this._windowCmpts.indexOf(ngbWindowCmpt);
      if (index > -1) {
        this._windowCmpts.splice(index, 1);
        this._activeWindowCmptHasChanged.next();
      }
    });
  }
}
NgbModalStack.ɵfac = __ngDeclareFactory({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: NgbModalStack, deps: [{ token: ApplicationRef }, { token: Injector }, { token: DOCUMENT }, { token: ScrollBar }, { token: RendererFactory2 }, { token: NgZone }], target: FactoryTarget.Injectable });
NgbModalStack.ɵprov = __ngDeclareInjectable({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: NgbModalStack, providedIn: "root" });
__ngDeclareClassMetadata({ type: NgbModalStack, decorators: [{
  type: Injectable,
  args: [{ providedIn: "root" }]
}], ctorParameters: function() {
  return [{ type: ApplicationRef }, { type: Injector }, { type: void 0, decorators: [{
    type: Inject,
    args: [DOCUMENT]
  }] }, { type: ScrollBar }, { type: RendererFactory2 }, { type: NgZone }];
} });
class NgbModalConfig {
  constructor(_ngbConfig) {
    this._ngbConfig = _ngbConfig;
    this.backdrop = true;
    this.fullscreen = false;
    this.keyboard = true;
  }
  get animation() {
    return this._animation === void 0 ? this._ngbConfig.animation : this._animation;
  }
  set animation(animation) {
    this._animation = animation;
  }
}
NgbModalConfig.ɵfac = __ngDeclareFactory({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: NgbModalConfig, deps: [{ token: NgbConfig }], target: FactoryTarget.Injectable });
NgbModalConfig.ɵprov = __ngDeclareInjectable({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: NgbModalConfig, providedIn: "root" });
__ngDeclareClassMetadata({ type: NgbModalConfig, decorators: [{
  type: Injectable,
  args: [{ providedIn: "root" }]
}], ctorParameters: function() {
  return [{ type: NgbConfig }];
} });
class NgbModal {
  constructor(_moduleCFR, _injector, _modalStack, _config) {
    this._moduleCFR = _moduleCFR;
    this._injector = _injector;
    this._modalStack = _modalStack;
    this._config = _config;
  }
  /**
   * Opens a new modal window with the specified content and supplied options.
   *
   * Content can be provided as a `TemplateRef` or a component type. If you pass a component type as content,
   * then instances of those components can be injected with an instance of the `NgbActiveModal` class. You can then
   * use `NgbActiveModal` methods to close / dismiss modals from "inside" of your component.
   *
   * Also see the [`NgbModalOptions`](#/components/modal/api#NgbModalOptions) for the list of supported options.
   */
  open(content, options = {}) {
    const combinedOptions = { ...this._config, animation: this._config.animation, ...options };
    return this._modalStack.open(this._moduleCFR, this._injector, content, combinedOptions);
  }
  /**
   * Returns an observable that holds the active modal instances.
   */
  get activeInstances() {
    return this._modalStack.activeInstances;
  }
  /**
   * Dismisses all currently displayed modal windows with the supplied reason.
   *
   * @since 3.1.0
   */
  dismissAll(reason) {
    this._modalStack.dismissAll(reason);
  }
  /**
   * Indicates if there are currently any open modal windows in the application.
   *
   * @since 3.3.0
   */
  hasOpenModals() {
    return this._modalStack.hasOpenModals();
  }
}
NgbModal.ɵfac = __ngDeclareFactory({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: NgbModal, deps: [{ token: ComponentFactoryResolver$1 }, { token: Injector }, { token: NgbModalStack }, { token: NgbModalConfig }], target: FactoryTarget.Injectable });
NgbModal.ɵprov = __ngDeclareInjectable({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: NgbModal, providedIn: "root" });
__ngDeclareClassMetadata({ type: NgbModal, decorators: [{
  type: Injectable,
  args: [{ providedIn: "root" }]
}], ctorParameters: function() {
  return [{ type: ComponentFactoryResolver$1 }, { type: Injector }, { type: NgbModalStack }, { type: NgbModalConfig }];
} });
class NgbModalModule {
}
NgbModalModule.ɵfac = __ngDeclareFactory({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: NgbModalModule, deps: [], target: FactoryTarget.NgModule });
NgbModalModule.ɵmod = __ngDeclareNgModule({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: NgbModalModule, declarations: [NgbModalBackdrop, NgbModalWindow] });
NgbModalModule.ɵinj = __ngDeclareInjector({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: NgbModalModule, providers: [NgbModal] });
__ngDeclareClassMetadata({ type: NgbModalModule, decorators: [{
  type: NgModule,
  args: [{ declarations: [NgbModalBackdrop, NgbModalWindow], providers: [NgbModal] }]
}] });
class NgbNavConfig {
  constructor(_ngbConfig) {
    this._ngbConfig = _ngbConfig;
    this.destroyOnHide = true;
    this.orientation = "horizontal";
    this.roles = "tablist";
    this.keyboard = false;
  }
  get animation() {
    return this._animation === void 0 ? this._ngbConfig.animation : this._animation;
  }
  set animation(animation) {
    this._animation = animation;
  }
}
NgbNavConfig.ɵfac = __ngDeclareFactory({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: NgbNavConfig, deps: [{ token: NgbConfig }], target: FactoryTarget.Injectable });
NgbNavConfig.ɵprov = __ngDeclareInjectable({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: NgbNavConfig, providedIn: "root" });
__ngDeclareClassMetadata({ type: NgbNavConfig, decorators: [{
  type: Injectable,
  args: [{ providedIn: "root" }]
}], ctorParameters: function() {
  return [{ type: NgbConfig }];
} });
const isValidNavId = (id) => isDefined(id) && id !== "";
let navCounter = 0;
class NgbNavContent {
  constructor(templateRef) {
    this.templateRef = templateRef;
  }
}
NgbNavContent.ɵfac = __ngDeclareFactory({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: NgbNavContent, deps: [{ token: TemplateRef }], target: FactoryTarget.Directive });
NgbNavContent.ɵdir = __ngDeclareDirective({ minVersion: "12.0.0", version: "13.0.3", type: NgbNavContent, selector: "ng-template[ngbNavContent]", ngImport: i0 });
__ngDeclareClassMetadata({ type: NgbNavContent, decorators: [{
  type: Directive,
  args: [{ selector: "ng-template[ngbNavContent]" }]
}], ctorParameters: function() {
  return [{ type: TemplateRef }];
} });
class NgbNavItem {
  constructor(nav, elementRef) {
    this.elementRef = elementRef;
    this.disabled = false;
    this.shown = new EventEmitter();
    this.hidden = new EventEmitter();
    this._nav = nav;
  }
  ngAfterContentChecked() {
    this.contentTpl = this.contentTpls.first;
  }
  ngOnInit() {
    if (!isDefined(this.domId)) {
      this.domId = `ngb-nav-${navCounter++}`;
    }
  }
  get active() {
    return this._nav.activeId === this.id;
  }
  get id() {
    return isValidNavId(this._id) ? this._id : this.domId;
  }
  get panelDomId() {
    return `${this.domId}-panel`;
  }
  isPanelInDom() {
    return (isDefined(this.destroyOnHide) ? !this.destroyOnHide : !this._nav.destroyOnHide) || this.active;
  }
}
NgbNavItem.ɵfac = __ngDeclareFactory({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: NgbNavItem, deps: [{ token: forwardRef(() => NgbNav) }, { token: ElementRef }], target: FactoryTarget.Directive });
NgbNavItem.ɵdir = __ngDeclareDirective({ minVersion: "12.0.0", version: "13.0.3", type: NgbNavItem, selector: "[ngbNavItem]", inputs: { destroyOnHide: "destroyOnHide", disabled: "disabled", domId: "domId", _id: ["ngbNavItem", "_id"] }, outputs: { shown: "shown", hidden: "hidden" }, host: { properties: { "class.nav-item": "true" } }, queries: [{ propertyName: "contentTpls", predicate: NgbNavContent }], exportAs: ["ngbNavItem"], ngImport: i0 });
__ngDeclareClassMetadata({ type: NgbNavItem, decorators: [{
  type: Directive,
  args: [{ selector: "[ngbNavItem]", exportAs: "ngbNavItem", host: { "[class.nav-item]": "true" } }]
}], ctorParameters: function() {
  return [{ type: void 0, decorators: [{
    type: Inject,
    args: [forwardRef(() => NgbNav)]
  }] }, { type: ElementRef }];
}, propDecorators: { destroyOnHide: [{
  type: Input
}], disabled: [{
  type: Input
}], domId: [{
  type: Input
}], _id: [{
  type: Input,
  args: ["ngbNavItem"]
}], shown: [{
  type: Output
}], hidden: [{
  type: Output
}], contentTpls: [{
  type: ContentChildren,
  args: [NgbNavContent, { descendants: false }]
}] } });
class NgbNav {
  constructor(role, config, _cd, _document) {
    this.role = role;
    this._cd = _cd;
    this._document = _document;
    this.activeIdChange = new EventEmitter();
    this.shown = new EventEmitter();
    this.hidden = new EventEmitter();
    this.destroy$ = new Subject();
    this.navItemChange$ = new Subject();
    this.navChange = new EventEmitter();
    this.animation = config.animation;
    this.destroyOnHide = config.destroyOnHide;
    this.orientation = config.orientation;
    this.roles = config.roles;
    this.keyboard = config.keyboard;
  }
  click(item) {
    if (!item.disabled) {
      this._updateActiveId(item.id);
    }
  }
  onKeyDown(event) {
    if (this.roles !== "tablist" || !this.keyboard) {
      return;
    }
    const key = event.which;
    const enabledLinks = this.links.filter((link) => !link.navItem.disabled);
    const { length } = enabledLinks;
    let position = -1;
    enabledLinks.forEach((link, index) => {
      if (link.elRef.nativeElement === this._document.activeElement) {
        position = index;
      }
    });
    if (length) {
      switch (key) {
        case Key.ArrowLeft:
          if (this.orientation === "vertical") {
            return;
          }
          position = (position - 1 + length) % length;
          break;
        case Key.ArrowRight:
          if (this.orientation === "vertical") {
            return;
          }
          position = (position + 1) % length;
          break;
        case Key.ArrowDown:
          if (this.orientation === "horizontal") {
            return;
          }
          position = (position + 1) % length;
          break;
        case Key.ArrowUp:
          if (this.orientation === "horizontal") {
            return;
          }
          position = (position - 1 + length) % length;
          break;
        case Key.Home:
          position = 0;
          break;
        case Key.End:
          position = length - 1;
          break;
      }
      if (this.keyboard === "changeWithArrows") {
        this.select(enabledLinks[position].navItem.id);
      }
      enabledLinks[position].elRef.nativeElement.focus();
      event.preventDefault();
    }
  }
  /**
   * Selects the nav with the given id and shows its associated pane.
   * Any other nav that was previously selected becomes unselected and its associated pane is hidden.
   */
  select(id) {
    this._updateActiveId(id, false);
  }
  ngAfterContentInit() {
    if (!isDefined(this.activeId)) {
      const nextId2 = this.items.first ? this.items.first.id : null;
      if (isValidNavId(nextId2)) {
        this._updateActiveId(nextId2, false);
        this._cd.detectChanges();
      }
    }
    this.items.changes.pipe(takeUntil(this.destroy$)).subscribe(() => this._notifyItemChanged(this.activeId));
  }
  ngOnChanges({ activeId }) {
    if (activeId && !activeId.firstChange) {
      this._notifyItemChanged(activeId.currentValue);
    }
  }
  ngOnDestroy() {
    this.destroy$.next();
  }
  _updateActiveId(nextId2, emitNavChange = true) {
    if (this.activeId !== nextId2) {
      let defaultPrevented = false;
      if (emitNavChange) {
        this.navChange.emit({ activeId: this.activeId, nextId: nextId2, preventDefault: () => {
          defaultPrevented = true;
        } });
      }
      if (!defaultPrevented) {
        this.activeId = nextId2;
        this.activeIdChange.emit(nextId2);
        this._notifyItemChanged(nextId2);
      }
    }
  }
  _notifyItemChanged(nextItemId) {
    this.navItemChange$.next(this._getItemById(nextItemId));
  }
  _getItemById(itemId) {
    return this.items && this.items.find((item) => item.id === itemId) || null;
  }
}
NgbNav.ɵfac = __ngDeclareFactory({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: NgbNav, deps: [{ token: "role", attribute: true }, { token: NgbNavConfig }, { token: ChangeDetectorRef }, { token: DOCUMENT }], target: FactoryTarget.Directive });
NgbNav.ɵdir = __ngDeclareDirective({ minVersion: "12.0.0", version: "13.0.3", type: NgbNav, selector: "[ngbNav]", inputs: { activeId: "activeId", animation: "animation", destroyOnHide: "destroyOnHide", orientation: "orientation", roles: "roles", keyboard: "keyboard" }, outputs: { activeIdChange: "activeIdChange", shown: "shown", hidden: "hidden", navChange: "navChange" }, host: { listeners: { "keydown.arrowLeft": "onKeyDown($event)", "keydown.arrowRight": "onKeyDown($event)", "keydown.arrowDown": "onKeyDown($event)", "keydown.arrowUp": "onKeyDown($event)", "keydown.Home": "onKeyDown($event)", "keydown.End": "onKeyDown($event)" }, properties: { "class.nav": "true", "class.flex-column": "orientation === 'vertical'", "attr.aria-orientation": "orientation === 'vertical' && roles === 'tablist' ? 'vertical' : undefined", "attr.role": "role ? role : roles ? 'tablist' : undefined" } }, queries: [{ propertyName: "items", predicate: NgbNavItem }, { propertyName: "links", predicate: forwardRef(function() {
  return NgbNavLink;
}), descendants: true }], exportAs: ["ngbNav"], usesOnChanges: true, ngImport: i0 });
__ngDeclareClassMetadata({ type: NgbNav, decorators: [{
  type: Directive,
  args: [{
    selector: "[ngbNav]",
    exportAs: "ngbNav",
    host: {
      "[class.nav]": "true",
      "[class.flex-column]": `orientation === 'vertical'`,
      "[attr.aria-orientation]": `orientation === 'vertical' && roles === 'tablist' ? 'vertical' : undefined`,
      "[attr.role]": `role ? role : roles ? 'tablist' : undefined`,
      "(keydown.arrowLeft)": "onKeyDown($event)",
      "(keydown.arrowRight)": "onKeyDown($event)",
      "(keydown.arrowDown)": "onKeyDown($event)",
      "(keydown.arrowUp)": "onKeyDown($event)",
      "(keydown.Home)": "onKeyDown($event)",
      "(keydown.End)": "onKeyDown($event)"
    }
  }]
}], ctorParameters: function() {
  return [{ type: void 0, decorators: [{
    type: Attribute,
    args: ["role"]
  }] }, { type: NgbNavConfig }, { type: ChangeDetectorRef }, { type: void 0, decorators: [{
    type: Inject,
    args: [DOCUMENT]
  }] }];
}, propDecorators: { activeId: [{
  type: Input
}], activeIdChange: [{
  type: Output
}], animation: [{
  type: Input
}], destroyOnHide: [{
  type: Input
}], orientation: [{
  type: Input
}], roles: [{
  type: Input
}], keyboard: [{
  type: Input
}], shown: [{
  type: Output
}], hidden: [{
  type: Output
}], items: [{
  type: ContentChildren,
  args: [NgbNavItem]
}], links: [{
  type: ContentChildren,
  args: [forwardRef(() => NgbNavLink), { descendants: true }]
}], navChange: [{
  type: Output
}] } });
class NgbNavLink {
  constructor(role, navItem, nav, elRef) {
    this.role = role;
    this.navItem = navItem;
    this.nav = nav;
    this.elRef = elRef;
  }
  hasNavItemClass() {
    return this.navItem.elementRef.nativeElement.nodeType === Node.COMMENT_NODE;
  }
}
NgbNavLink.ɵfac = __ngDeclareFactory({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: NgbNavLink, deps: [{ token: "role", attribute: true }, { token: NgbNavItem }, { token: NgbNav }, { token: ElementRef }], target: FactoryTarget.Directive });
NgbNavLink.ɵdir = __ngDeclareDirective({ minVersion: "12.0.0", version: "13.0.3", type: NgbNavLink, selector: "a[ngbNavLink]", host: { attributes: { "href": "" }, listeners: { "click": "nav.click(navItem); $event.preventDefault()" }, properties: { "id": "navItem.domId", "class.nav-link": "true", "class.nav-item": "hasNavItemClass()", "attr.role": "role ? role : nav.roles ? 'tab' : undefined", "class.active": "navItem.active", "class.disabled": "navItem.disabled", "attr.tabindex": "navItem.disabled ? -1 : undefined", "attr.aria-controls": "navItem.isPanelInDom() ? navItem.panelDomId : null", "attr.aria-selected": "navItem.active", "attr.aria-disabled": "navItem.disabled" } }, ngImport: i0 });
__ngDeclareClassMetadata({ type: NgbNavLink, decorators: [{
  type: Directive,
  args: [{
    selector: "a[ngbNavLink]",
    host: {
      "[id]": "navItem.domId",
      "[class.nav-link]": "true",
      "[class.nav-item]": "hasNavItemClass()",
      "[attr.role]": `role ? role : nav.roles ? 'tab' : undefined`,
      "href": "",
      "[class.active]": "navItem.active",
      "[class.disabled]": "navItem.disabled",
      "[attr.tabindex]": "navItem.disabled ? -1 : undefined",
      "[attr.aria-controls]": "navItem.isPanelInDom() ? navItem.panelDomId : null",
      "[attr.aria-selected]": "navItem.active",
      "[attr.aria-disabled]": "navItem.disabled",
      "(click)": "nav.click(navItem); $event.preventDefault()"
    }
  }]
}], ctorParameters: function() {
  return [{ type: void 0, decorators: [{
    type: Attribute,
    args: ["role"]
  }] }, { type: NgbNavItem }, { type: NgbNav }, { type: ElementRef }];
} });
const ngbNavFadeOutTransition = ({ classList }) => {
  classList.remove("show");
  return () => classList.remove("active");
};
const ngbNavFadeInTransition = (element, animation) => {
  if (animation) {
    reflow(element);
  }
  element.classList.add("show");
};
class NgbNavPane {
  constructor(elRef) {
    this.elRef = elRef;
  }
}
NgbNavPane.ɵfac = __ngDeclareFactory({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: NgbNavPane, deps: [{ token: ElementRef }], target: FactoryTarget.Directive });
NgbNavPane.ɵdir = __ngDeclareDirective({ minVersion: "12.0.0", version: "13.0.3", type: NgbNavPane, selector: "[ngbNavPane]", inputs: { item: "item", nav: "nav", role: "role" }, host: { properties: { "id": "item.panelDomId", "class.fade": "nav.animation", "attr.role": 'role ? role : nav.roles ? "tabpanel" : undefined', "attr.aria-labelledby": "item.domId" }, classAttribute: "tab-pane" }, ngImport: i0 });
__ngDeclareClassMetadata({ type: NgbNavPane, decorators: [{
  type: Directive,
  args: [{
    selector: "[ngbNavPane]",
    host: {
      "[id]": "item.panelDomId",
      "class": "tab-pane",
      "[class.fade]": "nav.animation",
      "[attr.role]": 'role ? role : nav.roles ? "tabpanel" : undefined',
      "[attr.aria-labelledby]": "item.domId"
    }
  }]
}], ctorParameters: function() {
  return [{ type: ElementRef }];
}, propDecorators: { item: [{
  type: Input
}], nav: [{
  type: Input
}], role: [{
  type: Input
}] } });
class NgbNavOutlet {
  constructor(_cd, _ngZone) {
    this._cd = _cd;
    this._ngZone = _ngZone;
    this._activePane = null;
  }
  isPanelTransitioning(item) {
    return this._activePane?.item === item;
  }
  ngAfterViewInit() {
    this._updateActivePane();
    this.nav.navItemChange$.pipe(takeUntil(this.nav.destroy$), startWith(this._activePane?.item || null), distinctUntilChanged(), skip(1)).subscribe((nextItem) => {
      const options = { animation: this.nav.animation, runningTransition: "stop" };
      this._cd.detectChanges();
      if (this._activePane) {
        ngbRunTransition(this._ngZone, this._activePane.elRef.nativeElement, ngbNavFadeOutTransition, options).subscribe(() => {
          const activeItem = this._activePane?.item;
          this._activePane = this._getPaneForItem(nextItem);
          this._cd.markForCheck();
          if (this._activePane) {
            this._activePane.elRef.nativeElement.classList.add("active");
            ngbRunTransition(this._ngZone, this._activePane.elRef.nativeElement, ngbNavFadeInTransition, options).subscribe(() => {
              if (nextItem) {
                nextItem.shown.emit();
                this.nav.shown.emit(nextItem.id);
              }
            });
          }
          if (activeItem) {
            activeItem.hidden.emit();
            this.nav.hidden.emit(activeItem.id);
          }
        });
      } else {
        this._updateActivePane();
      }
    });
  }
  _updateActivePane() {
    this._activePane = this._getActivePane();
    this._activePane?.elRef.nativeElement.classList.add("show");
    this._activePane?.elRef.nativeElement.classList.add("active");
  }
  _getPaneForItem(item) {
    return this._panes && this._panes.find((pane) => pane.item === item) || null;
  }
  _getActivePane() {
    return this._panes && this._panes.find((pane) => pane.item.active) || null;
  }
}
NgbNavOutlet.ɵfac = __ngDeclareFactory({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: NgbNavOutlet, deps: [{ token: ChangeDetectorRef }, { token: NgZone }], target: FactoryTarget.Component });
NgbNavOutlet.ɵcmp = __ngDeclareComponent({ minVersion: "12.0.0", version: "13.0.3", type: NgbNavOutlet, selector: "[ngbNavOutlet]", inputs: { paneRole: "paneRole", nav: ["ngbNavOutlet", "nav"] }, host: { properties: { "class.tab-content": "true" } }, viewQueries: [{ propertyName: "_panes", predicate: NgbNavPane, descendants: true }], ngImport: i0, template: `
    <ng-template ngFor let-item [ngForOf]="nav.items">
      <div ngbNavPane *ngIf="item.isPanelInDom() || isPanelTransitioning(item)" [item]="item" [nav]="nav" [role]="paneRole">
        <ng-template [ngTemplateOutlet]="item.contentTpl?.templateRef || null"
                     [ngTemplateOutletContext]="{$implicit: item.active || isPanelTransitioning(item)}"></ng-template>
      </div>
    </ng-template>
  `, isInline: true, directives: [{ type: NgForOf, selector: "[ngFor][ngForOf]", inputs: ["ngForOf", "ngForTrackBy", "ngForTemplate"] }, { type: NgIf, selector: "[ngIf]", inputs: ["ngIf", "ngIfThen", "ngIfElse"] }, { type: NgbNavPane, selector: "[ngbNavPane]", inputs: ["item", "nav", "role"] }, { type: NgTemplateOutlet, selector: "[ngTemplateOutlet]", inputs: ["ngTemplateOutletContext", "ngTemplateOutlet"] }], changeDetection: ChangeDetectionStrategy.OnPush, encapsulation: ViewEncapsulation$1.None });
__ngDeclareClassMetadata({ type: NgbNavOutlet, decorators: [{
  type: Component,
  args: [{
    selector: "[ngbNavOutlet]",
    host: { "[class.tab-content]": "true" },
    encapsulation: ViewEncapsulation$1.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
    <ng-template ngFor let-item [ngForOf]="nav.items">
      <div ngbNavPane *ngIf="item.isPanelInDom() || isPanelTransitioning(item)" [item]="item" [nav]="nav" [role]="paneRole">
        <ng-template [ngTemplateOutlet]="item.contentTpl?.templateRef || null"
                     [ngTemplateOutletContext]="{$implicit: item.active || isPanelTransitioning(item)}"></ng-template>
      </div>
    </ng-template>
  `
  }]
}], ctorParameters: function() {
  return [{ type: ChangeDetectorRef }, { type: NgZone }];
}, propDecorators: { _panes: [{
  type: ViewChildren,
  args: [NgbNavPane]
}], paneRole: [{
  type: Input
}], nav: [{
  type: Input,
  args: ["ngbNavOutlet"]
}] } });
const NGB_NAV_DIRECTIVES = [NgbNavContent, NgbNav, NgbNavItem, NgbNavLink, NgbNavOutlet, NgbNavPane];
class NgbNavModule {
}
NgbNavModule.ɵfac = __ngDeclareFactory({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: NgbNavModule, deps: [], target: FactoryTarget.NgModule });
NgbNavModule.ɵmod = __ngDeclareNgModule({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: NgbNavModule, declarations: [NgbNavContent, NgbNav, NgbNavItem, NgbNavLink, NgbNavOutlet, NgbNavPane], imports: [CommonModule], exports: [NgbNavContent, NgbNav, NgbNavItem, NgbNavLink, NgbNavOutlet, NgbNavPane] });
NgbNavModule.ɵinj = __ngDeclareInjector({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: NgbNavModule, imports: [[CommonModule]] });
__ngDeclareClassMetadata({ type: NgbNavModule, decorators: [{
  type: NgModule,
  args: [{ declarations: NGB_NAV_DIRECTIVES, exports: NGB_NAV_DIRECTIVES, imports: [CommonModule] }]
}] });
class NgbPaginationConfig {
  constructor() {
    this.disabled = false;
    this.boundaryLinks = false;
    this.directionLinks = true;
    this.ellipses = true;
    this.maxSize = 0;
    this.pageSize = 10;
    this.rotate = false;
  }
}
NgbPaginationConfig.ɵfac = __ngDeclareFactory({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: NgbPaginationConfig, deps: [], target: FactoryTarget.Injectable });
NgbPaginationConfig.ɵprov = __ngDeclareInjectable({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: NgbPaginationConfig, providedIn: "root" });
__ngDeclareClassMetadata({ type: NgbPaginationConfig, decorators: [{
  type: Injectable,
  args: [{ providedIn: "root" }]
}] });
class NgbPaginationEllipsis {
  constructor(templateRef) {
    this.templateRef = templateRef;
  }
}
NgbPaginationEllipsis.ɵfac = __ngDeclareFactory({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: NgbPaginationEllipsis, deps: [{ token: TemplateRef }], target: FactoryTarget.Directive });
NgbPaginationEllipsis.ɵdir = __ngDeclareDirective({ minVersion: "12.0.0", version: "13.0.3", type: NgbPaginationEllipsis, selector: "ng-template[ngbPaginationEllipsis]", ngImport: i0 });
__ngDeclareClassMetadata({ type: NgbPaginationEllipsis, decorators: [{
  type: Directive,
  args: [{ selector: "ng-template[ngbPaginationEllipsis]" }]
}], ctorParameters: function() {
  return [{ type: TemplateRef }];
} });
class NgbPaginationFirst {
  constructor(templateRef) {
    this.templateRef = templateRef;
  }
}
NgbPaginationFirst.ɵfac = __ngDeclareFactory({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: NgbPaginationFirst, deps: [{ token: TemplateRef }], target: FactoryTarget.Directive });
NgbPaginationFirst.ɵdir = __ngDeclareDirective({ minVersion: "12.0.0", version: "13.0.3", type: NgbPaginationFirst, selector: "ng-template[ngbPaginationFirst]", ngImport: i0 });
__ngDeclareClassMetadata({ type: NgbPaginationFirst, decorators: [{
  type: Directive,
  args: [{ selector: "ng-template[ngbPaginationFirst]" }]
}], ctorParameters: function() {
  return [{ type: TemplateRef }];
} });
class NgbPaginationLast {
  constructor(templateRef) {
    this.templateRef = templateRef;
  }
}
NgbPaginationLast.ɵfac = __ngDeclareFactory({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: NgbPaginationLast, deps: [{ token: TemplateRef }], target: FactoryTarget.Directive });
NgbPaginationLast.ɵdir = __ngDeclareDirective({ minVersion: "12.0.0", version: "13.0.3", type: NgbPaginationLast, selector: "ng-template[ngbPaginationLast]", ngImport: i0 });
__ngDeclareClassMetadata({ type: NgbPaginationLast, decorators: [{
  type: Directive,
  args: [{ selector: "ng-template[ngbPaginationLast]" }]
}], ctorParameters: function() {
  return [{ type: TemplateRef }];
} });
class NgbPaginationNext {
  constructor(templateRef) {
    this.templateRef = templateRef;
  }
}
NgbPaginationNext.ɵfac = __ngDeclareFactory({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: NgbPaginationNext, deps: [{ token: TemplateRef }], target: FactoryTarget.Directive });
NgbPaginationNext.ɵdir = __ngDeclareDirective({ minVersion: "12.0.0", version: "13.0.3", type: NgbPaginationNext, selector: "ng-template[ngbPaginationNext]", ngImport: i0 });
__ngDeclareClassMetadata({ type: NgbPaginationNext, decorators: [{
  type: Directive,
  args: [{ selector: "ng-template[ngbPaginationNext]" }]
}], ctorParameters: function() {
  return [{ type: TemplateRef }];
} });
class NgbPaginationNumber {
  constructor(templateRef) {
    this.templateRef = templateRef;
  }
}
NgbPaginationNumber.ɵfac = __ngDeclareFactory({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: NgbPaginationNumber, deps: [{ token: TemplateRef }], target: FactoryTarget.Directive });
NgbPaginationNumber.ɵdir = __ngDeclareDirective({ minVersion: "12.0.0", version: "13.0.3", type: NgbPaginationNumber, selector: "ng-template[ngbPaginationNumber]", ngImport: i0 });
__ngDeclareClassMetadata({ type: NgbPaginationNumber, decorators: [{
  type: Directive,
  args: [{ selector: "ng-template[ngbPaginationNumber]" }]
}], ctorParameters: function() {
  return [{ type: TemplateRef }];
} });
class NgbPaginationPrevious {
  constructor(templateRef) {
    this.templateRef = templateRef;
  }
}
NgbPaginationPrevious.ɵfac = __ngDeclareFactory({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: NgbPaginationPrevious, deps: [{ token: TemplateRef }], target: FactoryTarget.Directive });
NgbPaginationPrevious.ɵdir = __ngDeclareDirective({ minVersion: "12.0.0", version: "13.0.3", type: NgbPaginationPrevious, selector: "ng-template[ngbPaginationPrevious]", ngImport: i0 });
__ngDeclareClassMetadata({ type: NgbPaginationPrevious, decorators: [{
  type: Directive,
  args: [{ selector: "ng-template[ngbPaginationPrevious]" }]
}], ctorParameters: function() {
  return [{ type: TemplateRef }];
} });
class NgbPaginationPages {
  constructor(templateRef) {
    this.templateRef = templateRef;
  }
}
NgbPaginationPages.ɵfac = __ngDeclareFactory({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: NgbPaginationPages, deps: [{ token: TemplateRef }], target: FactoryTarget.Directive });
NgbPaginationPages.ɵdir = __ngDeclareDirective({ minVersion: "12.0.0", version: "13.0.3", type: NgbPaginationPages, selector: "ng-template[ngbPaginationPages]", ngImport: i0 });
__ngDeclareClassMetadata({ type: NgbPaginationPages, decorators: [{
  type: Directive,
  args: [{ selector: "ng-template[ngbPaginationPages]" }]
}], ctorParameters: function() {
  return [{ type: TemplateRef }];
} });
class NgbPagination {
  constructor(config) {
    this.pageCount = 0;
    this.pages = [];
    this.page = 1;
    this.pageChange = new EventEmitter(true);
    this.disabled = config.disabled;
    this.boundaryLinks = config.boundaryLinks;
    this.directionLinks = config.directionLinks;
    this.ellipses = config.ellipses;
    this.maxSize = config.maxSize;
    this.pageSize = config.pageSize;
    this.rotate = config.rotate;
    this.size = config.size;
  }
  hasPrevious() {
    return this.page > 1;
  }
  hasNext() {
    return this.page < this.pageCount;
  }
  nextDisabled() {
    return !this.hasNext() || this.disabled;
  }
  previousDisabled() {
    return !this.hasPrevious() || this.disabled;
  }
  selectPage(pageNumber) {
    this._updatePages(pageNumber);
  }
  ngOnChanges(changes) {
    this._updatePages(this.page);
  }
  isEllipsis(pageNumber) {
    return pageNumber === -1;
  }
  /**
   * Appends ellipses and first/last page number to the displayed pages
   */
  _applyEllipses(start2, end2) {
    if (this.ellipses) {
      if (start2 > 0) {
        if (start2 > 2) {
          this.pages.unshift(-1);
        } else if (start2 === 2) {
          this.pages.unshift(2);
        }
        this.pages.unshift(1);
      }
      if (end2 < this.pageCount) {
        if (end2 < this.pageCount - 2) {
          this.pages.push(-1);
        } else if (end2 === this.pageCount - 2) {
          this.pages.push(this.pageCount - 1);
        }
        this.pages.push(this.pageCount);
      }
    }
  }
  /**
   * Rotates page numbers based on maxSize items visible.
   * Currently selected page stays in the middle:
   *
   * Ex. for selected page = 6:
   * [5,*6*,7] for maxSize = 3
   * [4,5,*6*,7] for maxSize = 4
   */
  _applyRotation() {
    let start2 = 0;
    let end2 = this.pageCount;
    let leftOffset = Math.floor(this.maxSize / 2);
    let rightOffset = this.maxSize % 2 === 0 ? leftOffset - 1 : leftOffset;
    if (this.page <= leftOffset) {
      end2 = this.maxSize;
    } else if (this.pageCount - this.page < leftOffset) {
      start2 = this.pageCount - this.maxSize;
    } else {
      start2 = this.page - leftOffset - 1;
      end2 = this.page + rightOffset;
    }
    return [start2, end2];
  }
  /**
   * Paginates page numbers based on maxSize items per page.
   */
  _applyPagination() {
    let page = Math.ceil(this.page / this.maxSize) - 1;
    let start2 = page * this.maxSize;
    let end2 = start2 + this.maxSize;
    return [start2, end2];
  }
  _setPageInRange(newPageNo) {
    const prevPageNo = this.page;
    this.page = getValueInRange(newPageNo, this.pageCount, 1);
    if (this.page !== prevPageNo && isNumber(this.collectionSize)) {
      this.pageChange.emit(this.page);
    }
  }
  _updatePages(newPage) {
    this.pageCount = Math.ceil(this.collectionSize / this.pageSize);
    if (!isNumber(this.pageCount)) {
      this.pageCount = 0;
    }
    this.pages.length = 0;
    for (let i = 1; i <= this.pageCount; i++) {
      this.pages.push(i);
    }
    this._setPageInRange(newPage);
    if (this.maxSize > 0 && this.pageCount > this.maxSize) {
      let start2 = 0;
      let end2 = this.pageCount;
      if (this.rotate) {
        [start2, end2] = this._applyRotation();
      } else {
        [start2, end2] = this._applyPagination();
      }
      this.pages = this.pages.slice(start2, end2);
      this._applyEllipses(start2, end2);
    }
  }
}
NgbPagination.ɵfac = __ngDeclareFactory({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: NgbPagination, deps: [{ token: NgbPaginationConfig }], target: FactoryTarget.Component });
NgbPagination.ɵcmp = __ngDeclareComponent({ minVersion: "12.0.0", version: "13.0.3", type: NgbPagination, selector: "ngb-pagination", inputs: { disabled: "disabled", boundaryLinks: "boundaryLinks", directionLinks: "directionLinks", ellipses: "ellipses", rotate: "rotate", collectionSize: "collectionSize", maxSize: "maxSize", page: "page", pageSize: "pageSize", size: "size" }, outputs: { pageChange: "pageChange" }, host: { attributes: { "role": "navigation" } }, queries: [{ propertyName: "tplEllipsis", first: true, predicate: NgbPaginationEllipsis, descendants: true }, { propertyName: "tplFirst", first: true, predicate: NgbPaginationFirst, descendants: true }, { propertyName: "tplLast", first: true, predicate: NgbPaginationLast, descendants: true }, { propertyName: "tplNext", first: true, predicate: NgbPaginationNext, descendants: true }, { propertyName: "tplNumber", first: true, predicate: NgbPaginationNumber, descendants: true }, { propertyName: "tplPrevious", first: true, predicate: NgbPaginationPrevious, descendants: true }, { propertyName: "tplPages", first: true, predicate: NgbPaginationPages, descendants: true }], usesOnChanges: true, ngImport: i0, template: `
    <ng-template #first><span aria-hidden="true" i18n="@@ngb.pagination.first">&laquo;&laquo;</span></ng-template>
    <ng-template #previous><span aria-hidden="true" i18n="@@ngb.pagination.previous">&laquo;</span></ng-template>
    <ng-template #next><span aria-hidden="true" i18n="@@ngb.pagination.next">&raquo;</span></ng-template>
    <ng-template #last><span aria-hidden="true" i18n="@@ngb.pagination.last">&raquo;&raquo;</span></ng-template>
    <ng-template #ellipsis>...</ng-template>
    <ng-template #defaultNumber let-page let-currentPage="currentPage">
      {{ page }}
      <span *ngIf="page === currentPage" class="visually-hidden">(current)</span>
    </ng-template>
    <ng-template #defaultPages let-page let-pages="pages" let-disabled="disabled">
      <li *ngFor="let pageNumber of pages" class="page-item" [class.active]="pageNumber === page"
        [class.disabled]="isEllipsis(pageNumber) || disabled" [attr.aria-current]="(pageNumber === page ? 'page' : null)">
        <a *ngIf="isEllipsis(pageNumber)" class="page-link" tabindex="-1" aria-disabled="true">
          <ng-template [ngTemplateOutlet]="tplEllipsis?.templateRef || ellipsis"
                      [ngTemplateOutletContext]="{disabled: true, currentPage: page}"></ng-template>
        </a>
        <a *ngIf="!isEllipsis(pageNumber)" class="page-link" href (click)="selectPage(pageNumber); $event.preventDefault()"
          [attr.tabindex]="disabled ? '-1' : null" [attr.aria-disabled]="disabled ? 'true' : null">
          <ng-template [ngTemplateOutlet]="tplNumber?.templateRef || defaultNumber"
                      [ngTemplateOutletContext]="{disabled: disabled, $implicit: pageNumber, currentPage: page}"></ng-template>
        </a>
      </li>
    </ng-template>
    <ul [class]="'pagination' + (size ? ' pagination-' + size : '')">
      <li *ngIf="boundaryLinks" class="page-item"
        [class.disabled]="previousDisabled()">
        <a aria-label="First" i18n-aria-label="@@ngb.pagination.first-aria" class="page-link" href
          (click)="selectPage(1); $event.preventDefault()" [attr.tabindex]="previousDisabled() ? '-1' : null"
          [attr.aria-disabled]="previousDisabled() ? 'true' : null">
          <ng-template [ngTemplateOutlet]="tplFirst?.templateRef || first"
                       [ngTemplateOutletContext]="{disabled: previousDisabled(), currentPage: page}"></ng-template>
        </a>
      </li>

      <li *ngIf="directionLinks" class="page-item"
        [class.disabled]="previousDisabled()">
        <a aria-label="Previous" i18n-aria-label="@@ngb.pagination.previous-aria" class="page-link" href
          (click)="selectPage(page-1); $event.preventDefault()" [attr.tabindex]="previousDisabled() ? '-1' : null"
          [attr.aria-disabled]="previousDisabled() ? 'true' : null">
          <ng-template [ngTemplateOutlet]="tplPrevious?.templateRef || previous"
                       [ngTemplateOutletContext]="{disabled: previousDisabled()}"></ng-template>
        </a>
      </li>
      <ng-template
        [ngTemplateOutlet]="tplPages?.templateRef || defaultPages"
        [ngTemplateOutletContext]="{ $implicit: page, pages: pages, disabled: disabled }"
      >
      </ng-template>
      <li *ngIf="directionLinks" class="page-item" [class.disabled]="nextDisabled()">
        <a aria-label="Next" i18n-aria-label="@@ngb.pagination.next-aria" class="page-link" href
          (click)="selectPage(page+1); $event.preventDefault()" [attr.tabindex]="nextDisabled() ? '-1' : null"
          [attr.aria-disabled]="nextDisabled() ? 'true' : null">
          <ng-template [ngTemplateOutlet]="tplNext?.templateRef || next"
                       [ngTemplateOutletContext]="{disabled: nextDisabled(), currentPage: page}"></ng-template>
        </a>
      </li>

      <li *ngIf="boundaryLinks" class="page-item" [class.disabled]="nextDisabled()">
        <a aria-label="Last" i18n-aria-label="@@ngb.pagination.last-aria" class="page-link" href
          (click)="selectPage(pageCount); $event.preventDefault()" [attr.tabindex]="nextDisabled() ? '-1' : null"
          [attr.aria-disabled]="nextDisabled() ? 'true' : null">
          <ng-template [ngTemplateOutlet]="tplLast?.templateRef || last"
                       [ngTemplateOutletContext]="{disabled: nextDisabled(), currentPage: page}"></ng-template>
        </a>
      </li>
    </ul>
  `, isInline: true, directives: [{ type: NgIf, selector: "[ngIf]", inputs: ["ngIf", "ngIfThen", "ngIfElse"] }, { type: NgForOf, selector: "[ngFor][ngForOf]", inputs: ["ngForOf", "ngForTrackBy", "ngForTemplate"] }, { type: NgTemplateOutlet, selector: "[ngTemplateOutlet]", inputs: ["ngTemplateOutletContext", "ngTemplateOutlet"] }], changeDetection: ChangeDetectionStrategy.OnPush });
__ngDeclareClassMetadata({ type: NgbPagination, decorators: [{
  type: Component,
  args: [{
    selector: "ngb-pagination",
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: { "role": "navigation" },
    template: `
    <ng-template #first><span aria-hidden="true" i18n="@@ngb.pagination.first">&laquo;&laquo;</span></ng-template>
    <ng-template #previous><span aria-hidden="true" i18n="@@ngb.pagination.previous">&laquo;</span></ng-template>
    <ng-template #next><span aria-hidden="true" i18n="@@ngb.pagination.next">&raquo;</span></ng-template>
    <ng-template #last><span aria-hidden="true" i18n="@@ngb.pagination.last">&raquo;&raquo;</span></ng-template>
    <ng-template #ellipsis>...</ng-template>
    <ng-template #defaultNumber let-page let-currentPage="currentPage">
      {{ page }}
      <span *ngIf="page === currentPage" class="visually-hidden">(current)</span>
    </ng-template>
    <ng-template #defaultPages let-page let-pages="pages" let-disabled="disabled">
      <li *ngFor="let pageNumber of pages" class="page-item" [class.active]="pageNumber === page"
        [class.disabled]="isEllipsis(pageNumber) || disabled" [attr.aria-current]="(pageNumber === page ? 'page' : null)">
        <a *ngIf="isEllipsis(pageNumber)" class="page-link" tabindex="-1" aria-disabled="true">
          <ng-template [ngTemplateOutlet]="tplEllipsis?.templateRef || ellipsis"
                      [ngTemplateOutletContext]="{disabled: true, currentPage: page}"></ng-template>
        </a>
        <a *ngIf="!isEllipsis(pageNumber)" class="page-link" href (click)="selectPage(pageNumber); $event.preventDefault()"
          [attr.tabindex]="disabled ? '-1' : null" [attr.aria-disabled]="disabled ? 'true' : null">
          <ng-template [ngTemplateOutlet]="tplNumber?.templateRef || defaultNumber"
                      [ngTemplateOutletContext]="{disabled: disabled, $implicit: pageNumber, currentPage: page}"></ng-template>
        </a>
      </li>
    </ng-template>
    <ul [class]="'pagination' + (size ? ' pagination-' + size : '')">
      <li *ngIf="boundaryLinks" class="page-item"
        [class.disabled]="previousDisabled()">
        <a aria-label="First" i18n-aria-label="@@ngb.pagination.first-aria" class="page-link" href
          (click)="selectPage(1); $event.preventDefault()" [attr.tabindex]="previousDisabled() ? '-1' : null"
          [attr.aria-disabled]="previousDisabled() ? 'true' : null">
          <ng-template [ngTemplateOutlet]="tplFirst?.templateRef || first"
                       [ngTemplateOutletContext]="{disabled: previousDisabled(), currentPage: page}"></ng-template>
        </a>
      </li>

      <li *ngIf="directionLinks" class="page-item"
        [class.disabled]="previousDisabled()">
        <a aria-label="Previous" i18n-aria-label="@@ngb.pagination.previous-aria" class="page-link" href
          (click)="selectPage(page-1); $event.preventDefault()" [attr.tabindex]="previousDisabled() ? '-1' : null"
          [attr.aria-disabled]="previousDisabled() ? 'true' : null">
          <ng-template [ngTemplateOutlet]="tplPrevious?.templateRef || previous"
                       [ngTemplateOutletContext]="{disabled: previousDisabled()}"></ng-template>
        </a>
      </li>
      <ng-template
        [ngTemplateOutlet]="tplPages?.templateRef || defaultPages"
        [ngTemplateOutletContext]="{ $implicit: page, pages: pages, disabled: disabled }"
      >
      </ng-template>
      <li *ngIf="directionLinks" class="page-item" [class.disabled]="nextDisabled()">
        <a aria-label="Next" i18n-aria-label="@@ngb.pagination.next-aria" class="page-link" href
          (click)="selectPage(page+1); $event.preventDefault()" [attr.tabindex]="nextDisabled() ? '-1' : null"
          [attr.aria-disabled]="nextDisabled() ? 'true' : null">
          <ng-template [ngTemplateOutlet]="tplNext?.templateRef || next"
                       [ngTemplateOutletContext]="{disabled: nextDisabled(), currentPage: page}"></ng-template>
        </a>
      </li>

      <li *ngIf="boundaryLinks" class="page-item" [class.disabled]="nextDisabled()">
        <a aria-label="Last" i18n-aria-label="@@ngb.pagination.last-aria" class="page-link" href
          (click)="selectPage(pageCount); $event.preventDefault()" [attr.tabindex]="nextDisabled() ? '-1' : null"
          [attr.aria-disabled]="nextDisabled() ? 'true' : null">
          <ng-template [ngTemplateOutlet]="tplLast?.templateRef || last"
                       [ngTemplateOutletContext]="{disabled: nextDisabled(), currentPage: page}"></ng-template>
        </a>
      </li>
    </ul>
  `
  }]
}], ctorParameters: function() {
  return [{ type: NgbPaginationConfig }];
}, propDecorators: { tplEllipsis: [{
  type: ContentChild,
  args: [NgbPaginationEllipsis, { static: false }]
}], tplFirst: [{
  type: ContentChild,
  args: [NgbPaginationFirst, { static: false }]
}], tplLast: [{
  type: ContentChild,
  args: [NgbPaginationLast, { static: false }]
}], tplNext: [{
  type: ContentChild,
  args: [NgbPaginationNext, { static: false }]
}], tplNumber: [{
  type: ContentChild,
  args: [NgbPaginationNumber, { static: false }]
}], tplPrevious: [{
  type: ContentChild,
  args: [NgbPaginationPrevious, { static: false }]
}], tplPages: [{
  type: ContentChild,
  args: [NgbPaginationPages, { static: false }]
}], disabled: [{
  type: Input
}], boundaryLinks: [{
  type: Input
}], directionLinks: [{
  type: Input
}], ellipses: [{
  type: Input
}], rotate: [{
  type: Input
}], collectionSize: [{
  type: Input
}], maxSize: [{
  type: Input
}], page: [{
  type: Input
}], pageSize: [{
  type: Input
}], pageChange: [{
  type: Output
}], size: [{
  type: Input
}] } });
const DIRECTIVES = [
  NgbPagination,
  NgbPaginationEllipsis,
  NgbPaginationFirst,
  NgbPaginationLast,
  NgbPaginationNext,
  NgbPaginationNumber,
  NgbPaginationPrevious,
  NgbPaginationPages
];
class NgbPaginationModule {
}
NgbPaginationModule.ɵfac = __ngDeclareFactory({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: NgbPaginationModule, deps: [], target: FactoryTarget.NgModule });
NgbPaginationModule.ɵmod = __ngDeclareNgModule({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: NgbPaginationModule, declarations: [
  NgbPagination,
  NgbPaginationEllipsis,
  NgbPaginationFirst,
  NgbPaginationLast,
  NgbPaginationNext,
  NgbPaginationNumber,
  NgbPaginationPrevious,
  NgbPaginationPages
], imports: [CommonModule], exports: [
  NgbPagination,
  NgbPaginationEllipsis,
  NgbPaginationFirst,
  NgbPaginationLast,
  NgbPaginationNext,
  NgbPaginationNumber,
  NgbPaginationPrevious,
  NgbPaginationPages
] });
NgbPaginationModule.ɵinj = __ngDeclareInjector({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: NgbPaginationModule, imports: [[CommonModule]] });
__ngDeclareClassMetadata({ type: NgbPaginationModule, decorators: [{
  type: NgModule,
  args: [{ declarations: DIRECTIVES, exports: DIRECTIVES, imports: [CommonModule] }]
}] });
class Trigger {
  constructor(open, close) {
    this.open = open;
    this.close = close;
    if (!close) {
      this.close = open;
    }
  }
  isManual() {
    return this.open === "manual" || this.close === "manual";
  }
}
const DEFAULT_ALIASES = {
  "hover": ["mouseenter", "mouseleave"],
  "focus": ["focusin", "focusout"]
};
function parseTriggers(triggers, aliases = DEFAULT_ALIASES) {
  const trimmedTriggers = (triggers || "").trim();
  if (trimmedTriggers.length === 0) {
    return [];
  }
  const parsedTriggers = trimmedTriggers.split(/\s+/).map((trigger2) => trigger2.split(":")).map((triggerPair) => {
    let alias = aliases[triggerPair[0]] || triggerPair;
    return new Trigger(alias[0], alias[1]);
  });
  const manualTriggers = parsedTriggers.filter((triggerPair) => triggerPair.isManual());
  if (manualTriggers.length > 1) {
    throw "Triggers parse error: only one manual trigger is allowed";
  }
  if (manualTriggers.length === 1 && parsedTriggers.length > 1) {
    throw "Triggers parse error: manual trigger can't be mixed with other triggers";
  }
  return parsedTriggers;
}
function observeTriggers(renderer, nativeElement, triggers, isOpenedFn) {
  return new Observable((subscriber) => {
    const listeners = [];
    const openFn = () => subscriber.next(true);
    const closeFn = () => subscriber.next(false);
    const toggleFn = () => subscriber.next(!isOpenedFn());
    triggers.forEach((trigger2) => {
      if (trigger2.open === trigger2.close) {
        listeners.push(renderer.listen(nativeElement, trigger2.open, toggleFn));
      } else {
        listeners.push(renderer.listen(nativeElement, trigger2.open, openFn), renderer.listen(nativeElement, trigger2.close, closeFn));
      }
    });
    return () => {
      listeners.forEach((unsubscribeFn) => unsubscribeFn());
    };
  });
}
const delayOrNoop = (time) => time > 0 ? delay(time) : (a) => a;
function triggerDelay(openDelay, closeDelay, isOpenedFn) {
  return (input$) => {
    let pending = null;
    const filteredInput$ = input$.pipe(map((open) => ({ open })), filter((event) => {
      const currentlyOpen = isOpenedFn();
      if (currentlyOpen !== event.open && (!pending || pending.open === currentlyOpen)) {
        pending = event;
        return true;
      }
      if (pending && pending.open !== event.open) {
        pending = null;
      }
      return false;
    }), share());
    const delayedOpen$ = filteredInput$.pipe(filter((event) => event.open), delayOrNoop(openDelay));
    const delayedClose$ = filteredInput$.pipe(filter((event) => !event.open), delayOrNoop(closeDelay));
    return merge(delayedOpen$, delayedClose$).pipe(filter((event) => {
      if (event === pending) {
        pending = null;
        return event.open !== isOpenedFn();
      }
      return false;
    }), map((event) => event.open));
  };
}
function listenToTriggers(renderer, nativeElement, triggers, isOpenedFn, openFn, closeFn, openDelay = 0, closeDelay = 0) {
  const parsedTriggers = parseTriggers(triggers);
  if (parsedTriggers.length === 1 && parsedTriggers[0].isManual()) {
    return () => {
    };
  }
  const subscription = observeTriggers(renderer, nativeElement, parsedTriggers, isOpenedFn).pipe(triggerDelay(openDelay, closeDelay, isOpenedFn)).subscribe((open) => open ? openFn() : closeFn());
  return () => subscription.unsubscribe();
}
class NgbPopoverConfig {
  constructor(_ngbConfig) {
    this._ngbConfig = _ngbConfig;
    this.autoClose = true;
    this.placement = "auto";
    this.triggers = "click";
    this.disablePopover = false;
    this.openDelay = 0;
    this.closeDelay = 0;
  }
  get animation() {
    return this._animation === void 0 ? this._ngbConfig.animation : this._animation;
  }
  set animation(animation) {
    this._animation = animation;
  }
}
NgbPopoverConfig.ɵfac = __ngDeclareFactory({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: NgbPopoverConfig, deps: [{ token: NgbConfig }], target: FactoryTarget.Injectable });
NgbPopoverConfig.ɵprov = __ngDeclareInjectable({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: NgbPopoverConfig, providedIn: "root" });
__ngDeclareClassMetadata({ type: NgbPopoverConfig, decorators: [{
  type: Injectable,
  args: [{ providedIn: "root" }]
}], ctorParameters: function() {
  return [{ type: NgbConfig }];
} });
let nextId$1 = 0;
class NgbPopoverWindow {
  isTitleTemplate() {
    return this.title instanceof TemplateRef;
  }
}
NgbPopoverWindow.ɵfac = __ngDeclareFactory({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: NgbPopoverWindow, deps: [], target: FactoryTarget.Component });
NgbPopoverWindow.ɵcmp = __ngDeclareComponent({ minVersion: "12.0.0", version: "13.0.3", type: NgbPopoverWindow, selector: "ngb-popover-window", inputs: { animation: "animation", title: "title", id: "id", popoverClass: "popoverClass", context: "context" }, host: { attributes: { "role": "tooltip" }, properties: { "class": '"popover" + (popoverClass ? " " + popoverClass : "")', "class.fade": "animation", "id": "id" } }, ngImport: i0, template: `
    <div class="popover-arrow" data-popper-arrow></div>
    <h3 class="popover-header" *ngIf="title">
      <ng-template #simpleTitle>{{title}}</ng-template>
      <ng-template [ngTemplateOutlet]="isTitleTemplate() ? $any(title) : simpleTitle" [ngTemplateOutletContext]="context"></ng-template>
    </h3>
    <div class="popover-body"><ng-content></ng-content></div>`, isInline: true, directives: [{ type: NgIf, selector: "[ngIf]", inputs: ["ngIf", "ngIfThen", "ngIfElse"] }, { type: NgTemplateOutlet, selector: "[ngTemplateOutlet]", inputs: ["ngTemplateOutletContext", "ngTemplateOutlet"] }], changeDetection: ChangeDetectionStrategy.OnPush, encapsulation: ViewEncapsulation$1.None });
__ngDeclareClassMetadata({ type: NgbPopoverWindow, decorators: [{
  type: Component,
  args: [{
    selector: "ngb-popover-window",
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation$1.None,
    host: {
      "[class]": '"popover" + (popoverClass ? " " + popoverClass : "")',
      "[class.fade]": "animation",
      "role": "tooltip",
      "[id]": "id"
    },
    template: `
    <div class="popover-arrow" data-popper-arrow></div>
    <h3 class="popover-header" *ngIf="title">
      <ng-template #simpleTitle>{{title}}</ng-template>
      <ng-template [ngTemplateOutlet]="isTitleTemplate() ? $any(title) : simpleTitle" [ngTemplateOutletContext]="context"></ng-template>
    </h3>
    <div class="popover-body"><ng-content></ng-content></div>`
  }]
}], propDecorators: { animation: [{
  type: Input
}], title: [{
  type: Input
}], id: [{
  type: Input
}], popoverClass: [{
  type: Input
}], context: [{
  type: Input
}] } });
class NgbPopover {
  constructor(_elementRef, _renderer, injector, viewContainerRef, config, _ngZone, _document, _changeDetector, applicationRef) {
    this._elementRef = _elementRef;
    this._renderer = _renderer;
    this._ngZone = _ngZone;
    this._document = _document;
    this._changeDetector = _changeDetector;
    this.shown = new EventEmitter();
    this.hidden = new EventEmitter();
    this._ngbPopoverWindowId = `ngb-popover-${nextId$1++}`;
    this._windowRef = null;
    this._positioning = ngbPositioning();
    this.animation = config.animation;
    this.autoClose = config.autoClose;
    this.placement = config.placement;
    this.triggers = config.triggers;
    this.container = config.container;
    this.disablePopover = config.disablePopover;
    this.popoverClass = config.popoverClass;
    this.openDelay = config.openDelay;
    this.closeDelay = config.closeDelay;
    this._popupService = new PopupService(NgbPopoverWindow, injector, viewContainerRef, _renderer, this._ngZone, applicationRef);
  }
  _isDisabled() {
    if (this.disablePopover) {
      return true;
    }
    if (!this.ngbPopover && !this.popoverTitle) {
      return true;
    }
    return false;
  }
  /**
   * Opens the popover.
   *
   * This is considered to be a "manual" triggering.
   * The `context` is an optional value to be injected into the popover template when it is created.
   */
  open(context) {
    if (!this._windowRef && !this._isDisabled()) {
      const { windowRef, transition$ } = this._popupService.open(this.ngbPopover, context, this.animation);
      this._windowRef = windowRef;
      this._windowRef.instance.animation = this.animation;
      this._windowRef.instance.title = this.popoverTitle;
      this._windowRef.instance.context = context;
      this._windowRef.instance.popoverClass = this.popoverClass;
      this._windowRef.instance.id = this._ngbPopoverWindowId;
      this._renderer.setAttribute(this._elementRef.nativeElement, "aria-describedby", this._ngbPopoverWindowId);
      if (this.container === "body") {
        this._document.querySelector(this.container).appendChild(this._windowRef.location.nativeElement);
      }
      this._windowRef.changeDetectorRef.detectChanges();
      this._windowRef.changeDetectorRef.markForCheck();
      this._ngZone.runOutsideAngular(() => {
        this._positioning.createPopper({
          hostElement: this._elementRef.nativeElement,
          targetElement: this._windowRef.location.nativeElement,
          placement: this.placement,
          appendToBody: this.container === "body",
          baseClass: "bs-popover",
          updatePopperOptions: addPopperOffset([0, 8])
        });
        Promise.resolve().then(() => {
          this._positioning.update();
          this._zoneSubscription = this._ngZone.onStable.subscribe(() => this._positioning.update());
        });
      });
      ngbAutoClose(this._ngZone, this._document, this.autoClose, () => this.close(), this.hidden, [this._windowRef.location.nativeElement]);
      transition$.subscribe(() => this.shown.emit());
    }
  }
  /**
   * Closes the popover.
   *
   * This is considered to be a "manual" triggering of the popover.
   */
  close(animation = this.animation) {
    if (this._windowRef) {
      this._renderer.removeAttribute(this._elementRef.nativeElement, "aria-describedby");
      this._popupService.close(animation).subscribe(() => {
        this._windowRef = null;
        this._positioning.destroy();
        this._zoneSubscription?.unsubscribe();
        this.hidden.emit();
        this._changeDetector.markForCheck();
      });
    }
  }
  /**
   * Toggles the popover.
   *
   * This is considered to be a "manual" triggering of the popover.
   */
  toggle() {
    if (this._windowRef) {
      this.close();
    } else {
      this.open();
    }
  }
  /**
   * Returns `true`, if the popover is currently shown.
   */
  isOpen() {
    return this._windowRef != null;
  }
  ngOnInit() {
    this._unregisterListenersFn = listenToTriggers(this._renderer, this._elementRef.nativeElement, this.triggers, this.isOpen.bind(this), this.open.bind(this), this.close.bind(this), +this.openDelay, +this.closeDelay);
  }
  ngOnChanges({ ngbPopover, popoverTitle, disablePopover, popoverClass }) {
    if (popoverClass && this.isOpen()) {
      this._windowRef.instance.popoverClass = popoverClass.currentValue;
    }
    if ((ngbPopover || popoverTitle || disablePopover) && this._isDisabled()) {
      this.close();
    }
  }
  ngOnDestroy() {
    this.close(false);
    this._unregisterListenersFn?.();
  }
}
NgbPopover.ɵfac = __ngDeclareFactory({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: NgbPopover, deps: [{ token: ElementRef }, { token: Renderer2 }, { token: Injector }, { token: ViewContainerRef }, { token: NgbPopoverConfig }, { token: NgZone }, { token: DOCUMENT }, { token: ChangeDetectorRef }, { token: ApplicationRef }], target: FactoryTarget.Directive });
NgbPopover.ɵdir = __ngDeclareDirective({ minVersion: "12.0.0", version: "13.0.3", type: NgbPopover, selector: "[ngbPopover]", inputs: { animation: "animation", autoClose: "autoClose", ngbPopover: "ngbPopover", popoverTitle: "popoverTitle", placement: "placement", triggers: "triggers", container: "container", disablePopover: "disablePopover", popoverClass: "popoverClass", openDelay: "openDelay", closeDelay: "closeDelay" }, outputs: { shown: "shown", hidden: "hidden" }, exportAs: ["ngbPopover"], usesOnChanges: true, ngImport: i0 });
__ngDeclareClassMetadata({ type: NgbPopover, decorators: [{
  type: Directive,
  args: [{ selector: "[ngbPopover]", exportAs: "ngbPopover" }]
}], ctorParameters: function() {
  return [{ type: ElementRef }, { type: Renderer2 }, { type: Injector }, { type: ViewContainerRef }, { type: NgbPopoverConfig }, { type: NgZone }, { type: void 0, decorators: [{
    type: Inject,
    args: [DOCUMENT]
  }] }, { type: ChangeDetectorRef }, { type: ApplicationRef }];
}, propDecorators: { animation: [{
  type: Input
}], autoClose: [{
  type: Input
}], ngbPopover: [{
  type: Input
}], popoverTitle: [{
  type: Input
}], placement: [{
  type: Input
}], triggers: [{
  type: Input
}], container: [{
  type: Input
}], disablePopover: [{
  type: Input
}], popoverClass: [{
  type: Input
}], openDelay: [{
  type: Input
}], closeDelay: [{
  type: Input
}], shown: [{
  type: Output
}], hidden: [{
  type: Output
}] } });
class NgbPopoverModule {
}
NgbPopoverModule.ɵfac = __ngDeclareFactory({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: NgbPopoverModule, deps: [], target: FactoryTarget.NgModule });
NgbPopoverModule.ɵmod = __ngDeclareNgModule({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: NgbPopoverModule, declarations: [NgbPopover, NgbPopoverWindow], imports: [CommonModule], exports: [NgbPopover] });
NgbPopoverModule.ɵinj = __ngDeclareInjector({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: NgbPopoverModule, imports: [[CommonModule]] });
__ngDeclareClassMetadata({ type: NgbPopoverModule, decorators: [{
  type: NgModule,
  args: [{ declarations: [NgbPopover, NgbPopoverWindow], exports: [NgbPopover], imports: [CommonModule] }]
}] });
class NgbProgressbarConfig {
  constructor() {
    this.max = 100;
    this.animated = false;
    this.striped = false;
    this.showValue = false;
  }
}
NgbProgressbarConfig.ɵfac = __ngDeclareFactory({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: NgbProgressbarConfig, deps: [], target: FactoryTarget.Injectable });
NgbProgressbarConfig.ɵprov = __ngDeclareInjectable({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: NgbProgressbarConfig, providedIn: "root" });
__ngDeclareClassMetadata({ type: NgbProgressbarConfig, decorators: [{
  type: Injectable,
  args: [{ providedIn: "root" }]
}] });
class NgbProgressbar {
  constructor(config) {
    this.value = 0;
    this.max = config.max;
    this.animated = config.animated;
    this.striped = config.striped;
    this.textType = config.textType;
    this.type = config.type;
    this.showValue = config.showValue;
    this.height = config.height;
  }
  /**
   * The maximal value to be displayed in the progress bar.
   *
   * Should be a positive number. Will default to 100 otherwise.
   */
  set max(max2) {
    this._max = !isNumber(max2) || max2 <= 0 ? 100 : max2;
  }
  get max() {
    return this._max;
  }
  getValue() {
    return getValueInRange(this.value, this.max);
  }
  getPercentValue() {
    return 100 * this.getValue() / this.max;
  }
}
NgbProgressbar.ɵfac = __ngDeclareFactory({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: NgbProgressbar, deps: [{ token: NgbProgressbarConfig }], target: FactoryTarget.Component });
NgbProgressbar.ɵcmp = __ngDeclareComponent({ minVersion: "12.0.0", version: "13.0.3", type: NgbProgressbar, selector: "ngb-progressbar", inputs: { max: "max", animated: "animated", striped: "striped", showValue: "showValue", textType: "textType", type: "type", value: "value", height: "height" }, host: { properties: { "style.height": "this.height" }, classAttribute: "progress" }, ngImport: i0, template: `
    <div class="progress-bar{{type ? ' bg-' + type : ''}}{{textType ? ' text-' + textType : ''}}
    {{animated ? ' progress-bar-animated' : ''}}{{striped ? ' progress-bar-striped' : ''}}"
    role="progressbar" [style.width.%]="getPercentValue()"
    [attr.aria-valuenow]="getValue()" aria-valuemin="0" [attr.aria-valuemax]="max">
      <span *ngIf="showValue" i18n="@@ngb.progressbar.value">{{getValue() / max | percent}}</span><ng-content></ng-content>
    </div>
  `, isInline: true, directives: [{ type: NgIf, selector: "[ngIf]", inputs: ["ngIf", "ngIfThen", "ngIfElse"] }], pipes: { "percent": PercentPipe }, changeDetection: ChangeDetectionStrategy.OnPush, encapsulation: ViewEncapsulation$1.None });
__ngDeclareClassMetadata({ type: NgbProgressbar, decorators: [{
  type: Component,
  args: [{
    selector: "ngb-progressbar",
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation$1.None,
    host: { class: "progress" },
    template: `
    <div class="progress-bar{{type ? ' bg-' + type : ''}}{{textType ? ' text-' + textType : ''}}
    {{animated ? ' progress-bar-animated' : ''}}{{striped ? ' progress-bar-striped' : ''}}"
    role="progressbar" [style.width.%]="getPercentValue()"
    [attr.aria-valuenow]="getValue()" aria-valuemin="0" [attr.aria-valuemax]="max">
      <span *ngIf="showValue" i18n="@@ngb.progressbar.value">{{getValue() / max | percent}}</span><ng-content></ng-content>
    </div>
  `
  }]
}], ctorParameters: function() {
  return [{ type: NgbProgressbarConfig }];
}, propDecorators: { max: [{
  type: Input
}], animated: [{
  type: Input
}], striped: [{
  type: Input
}], showValue: [{
  type: Input
}], textType: [{
  type: Input
}], type: [{
  type: Input
}], value: [{
  type: Input
}], height: [{
  type: Input
}, {
  type: HostBinding,
  args: ["style.height"]
}] } });
class NgbProgressbarModule {
}
NgbProgressbarModule.ɵfac = __ngDeclareFactory({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: NgbProgressbarModule, deps: [], target: FactoryTarget.NgModule });
NgbProgressbarModule.ɵmod = __ngDeclareNgModule({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: NgbProgressbarModule, declarations: [NgbProgressbar], imports: [CommonModule], exports: [NgbProgressbar] });
NgbProgressbarModule.ɵinj = __ngDeclareInjector({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: NgbProgressbarModule, imports: [[CommonModule]] });
__ngDeclareClassMetadata({ type: NgbProgressbarModule, decorators: [{
  type: NgModule,
  args: [{ declarations: [NgbProgressbar], exports: [NgbProgressbar], imports: [CommonModule] }]
}] });
class NgbRatingConfig {
  constructor() {
    this.max = 10;
    this.readonly = false;
    this.resettable = false;
  }
}
NgbRatingConfig.ɵfac = __ngDeclareFactory({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: NgbRatingConfig, deps: [], target: FactoryTarget.Injectable });
NgbRatingConfig.ɵprov = __ngDeclareInjectable({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: NgbRatingConfig, providedIn: "root" });
__ngDeclareClassMetadata({ type: NgbRatingConfig, decorators: [{
  type: Injectable,
  args: [{ providedIn: "root" }]
}] });
class NgbRating {
  constructor(config, _changeDetectorRef) {
    this._changeDetectorRef = _changeDetectorRef;
    this.contexts = [];
    this.disabled = false;
    this.hover = new EventEmitter();
    this.leave = new EventEmitter();
    this.rateChange = new EventEmitter(true);
    this.onChange = (_) => {
    };
    this.onTouched = () => {
    };
    this.max = config.max;
    this.readonly = config.readonly;
  }
  ariaValueText() {
    return `${this.nextRate} out of ${this.max}`;
  }
  isInteractive() {
    return !this.readonly && !this.disabled;
  }
  enter(value) {
    if (this.isInteractive()) {
      this._updateState(value);
    }
    this.hover.emit(value);
  }
  handleBlur() {
    this.onTouched();
  }
  handleClick(value) {
    if (this.isInteractive()) {
      this.update(this.resettable && this.rate === value ? 0 : value);
    }
  }
  handleKeyDown(event) {
    switch (event.which) {
      case Key.ArrowDown:
      case Key.ArrowLeft:
        this.update(this.rate - 1);
        break;
      case Key.ArrowUp:
      case Key.ArrowRight:
        this.update(this.rate + 1);
        break;
      case Key.Home:
        this.update(0);
        break;
      case Key.End:
        this.update(this.max);
        break;
      default:
        return;
    }
    event.preventDefault();
  }
  ngOnChanges(changes) {
    if (changes["rate"]) {
      this.update(this.rate);
    }
    if (changes["max"]) {
      this._updateMax();
    }
  }
  ngOnInit() {
    this._setupContexts();
    this._updateState(this.rate);
  }
  registerOnChange(fn2) {
    this.onChange = fn2;
  }
  registerOnTouched(fn2) {
    this.onTouched = fn2;
  }
  reset() {
    this.leave.emit(this.nextRate);
    this._updateState(this.rate);
  }
  setDisabledState(isDisabled) {
    this.disabled = isDisabled;
  }
  update(value, internalChange = true) {
    const newRate = getValueInRange(value, this.max, 0);
    if (this.isInteractive() && this.rate !== newRate) {
      this.rate = newRate;
      this.rateChange.emit(this.rate);
    }
    if (internalChange) {
      this.onChange(this.rate);
      this.onTouched();
    }
    this._updateState(this.rate);
  }
  writeValue(value) {
    this.update(value, false);
    this._changeDetectorRef.markForCheck();
  }
  _updateState(nextValue) {
    this.nextRate = nextValue;
    this.contexts.forEach((context, index) => context.fill = Math.round(getValueInRange(nextValue - index, 1, 0) * 100));
  }
  _updateMax() {
    if (this.max > 0) {
      this._setupContexts();
      this.update(this.rate);
    }
  }
  _setupContexts() {
    this.contexts = Array.from({ length: this.max }, (v, k) => ({ fill: 0, index: k }));
  }
}
NgbRating.ɵfac = __ngDeclareFactory({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: NgbRating, deps: [{ token: NgbRatingConfig }, { token: ChangeDetectorRef }], target: FactoryTarget.Component });
NgbRating.ɵcmp = __ngDeclareComponent({ minVersion: "12.0.0", version: "13.0.3", type: NgbRating, selector: "ngb-rating", inputs: { max: "max", rate: "rate", readonly: "readonly", resettable: "resettable", starTemplate: "starTemplate" }, outputs: { hover: "hover", leave: "leave", rateChange: "rateChange" }, host: { attributes: { "role": "slider", "aria-valuemin": "0" }, listeners: { "blur": "handleBlur()", "keydown": "handleKeyDown($event)", "mouseleave": "reset()" }, properties: { "tabindex": "disabled ? -1 : 0", "attr.aria-valuemax": "max", "attr.aria-valuenow": "nextRate", "attr.aria-valuetext": "ariaValueText()", "attr.aria-disabled": "readonly ? true : null" }, classAttribute: "d-inline-flex" }, providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => NgbRating), multi: true }], queries: [{ propertyName: "starTemplateFromContent", first: true, predicate: TemplateRef, descendants: true }], usesOnChanges: true, ngImport: i0, template: `
    <ng-template #t let-fill="fill">{{ fill === 100 ? '&#9733;' : '&#9734;' }}</ng-template>
    <ng-template ngFor [ngForOf]="contexts" let-index="index">
      <span class="visually-hidden">({{ index < nextRate ? '*' : ' ' }})</span>
      <span (mouseenter)="enter(index + 1)" (click)="handleClick(index + 1)" [style.cursor]="isInteractive() ? 'pointer' : 'default'">
        <ng-template [ngTemplateOutlet]="starTemplate || starTemplateFromContent || t" [ngTemplateOutletContext]="contexts[index]">
        </ng-template>
      </span>
    </ng-template>
  `, isInline: true, directives: [{ type: NgForOf, selector: "[ngFor][ngForOf]", inputs: ["ngForOf", "ngForTrackBy", "ngForTemplate"] }, { type: NgTemplateOutlet, selector: "[ngTemplateOutlet]", inputs: ["ngTemplateOutletContext", "ngTemplateOutlet"] }], changeDetection: ChangeDetectionStrategy.OnPush, encapsulation: ViewEncapsulation$1.None });
__ngDeclareClassMetadata({ type: NgbRating, decorators: [{
  type: Component,
  args: [{
    selector: "ngb-rating",
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation$1.None,
    host: {
      "class": "d-inline-flex",
      "[tabindex]": "disabled ? -1 : 0",
      "role": "slider",
      "aria-valuemin": "0",
      "[attr.aria-valuemax]": "max",
      "[attr.aria-valuenow]": "nextRate",
      "[attr.aria-valuetext]": "ariaValueText()",
      "[attr.aria-disabled]": "readonly ? true : null",
      "(blur)": "handleBlur()",
      "(keydown)": "handleKeyDown($event)",
      "(mouseleave)": "reset()"
    },
    template: `
    <ng-template #t let-fill="fill">{{ fill === 100 ? '&#9733;' : '&#9734;' }}</ng-template>
    <ng-template ngFor [ngForOf]="contexts" let-index="index">
      <span class="visually-hidden">({{ index < nextRate ? '*' : ' ' }})</span>
      <span (mouseenter)="enter(index + 1)" (click)="handleClick(index + 1)" [style.cursor]="isInteractive() ? 'pointer' : 'default'">
        <ng-template [ngTemplateOutlet]="starTemplate || starTemplateFromContent || t" [ngTemplateOutletContext]="contexts[index]">
        </ng-template>
      </span>
    </ng-template>
  `,
    providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => NgbRating), multi: true }]
  }]
}], ctorParameters: function() {
  return [{ type: NgbRatingConfig }, { type: ChangeDetectorRef }];
}, propDecorators: { max: [{
  type: Input
}], rate: [{
  type: Input
}], readonly: [{
  type: Input
}], resettable: [{
  type: Input
}], starTemplate: [{
  type: Input
}], starTemplateFromContent: [{
  type: ContentChild,
  args: [TemplateRef, { static: false }]
}], hover: [{
  type: Output
}], leave: [{
  type: Output
}], rateChange: [{
  type: Output
}] } });
class NgbRatingModule {
}
NgbRatingModule.ɵfac = __ngDeclareFactory({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: NgbRatingModule, deps: [], target: FactoryTarget.NgModule });
NgbRatingModule.ɵmod = __ngDeclareNgModule({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: NgbRatingModule, declarations: [NgbRating], imports: [CommonModule], exports: [NgbRating] });
NgbRatingModule.ɵinj = __ngDeclareInjector({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: NgbRatingModule, imports: [[CommonModule]] });
__ngDeclareClassMetadata({ type: NgbRatingModule, decorators: [{
  type: NgModule,
  args: [{ declarations: [NgbRating], exports: [NgbRating], imports: [CommonModule] }]
}] });
class NgbTime {
  constructor(hour, minute, second) {
    this.hour = toInteger(hour);
    this.minute = toInteger(minute);
    this.second = toInteger(second);
  }
  changeHour(step = 1) {
    this.updateHour((isNaN(this.hour) ? 0 : this.hour) + step);
  }
  updateHour(hour) {
    if (isNumber(hour)) {
      this.hour = (hour < 0 ? 24 + hour : hour) % 24;
    } else {
      this.hour = NaN;
    }
  }
  changeMinute(step = 1) {
    this.updateMinute((isNaN(this.minute) ? 0 : this.minute) + step);
  }
  updateMinute(minute) {
    if (isNumber(minute)) {
      this.minute = minute % 60 < 0 ? 60 + minute % 60 : minute % 60;
      this.changeHour(Math.floor(minute / 60));
    } else {
      this.minute = NaN;
    }
  }
  changeSecond(step = 1) {
    this.updateSecond((isNaN(this.second) ? 0 : this.second) + step);
  }
  updateSecond(second) {
    if (isNumber(second)) {
      this.second = second < 0 ? 60 + second % 60 : second % 60;
      this.changeMinute(Math.floor(second / 60));
    } else {
      this.second = NaN;
    }
  }
  isValid(checkSecs = true) {
    return isNumber(this.hour) && isNumber(this.minute) && (checkSecs ? isNumber(this.second) : true);
  }
  toString() {
    return `${this.hour || 0}:${this.minute || 0}:${this.second || 0}`;
  }
}
class NgbTimepickerConfig {
  constructor() {
    this.meridian = false;
    this.spinners = true;
    this.seconds = false;
    this.hourStep = 1;
    this.minuteStep = 1;
    this.secondStep = 1;
    this.disabled = false;
    this.readonlyInputs = false;
    this.size = "medium";
  }
}
NgbTimepickerConfig.ɵfac = __ngDeclareFactory({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: NgbTimepickerConfig, deps: [], target: FactoryTarget.Injectable });
NgbTimepickerConfig.ɵprov = __ngDeclareInjectable({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: NgbTimepickerConfig, providedIn: "root" });
__ngDeclareClassMetadata({ type: NgbTimepickerConfig, decorators: [{
  type: Injectable,
  args: [{ providedIn: "root" }]
}] });
function NGB_DATEPICKER_TIME_ADAPTER_FACTORY() {
  return new NgbTimeStructAdapter();
}
class NgbTimeAdapter {
}
NgbTimeAdapter.ɵfac = __ngDeclareFactory({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: NgbTimeAdapter, deps: [], target: FactoryTarget.Injectable });
NgbTimeAdapter.ɵprov = __ngDeclareInjectable({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: NgbTimeAdapter, providedIn: "root", useFactory: NGB_DATEPICKER_TIME_ADAPTER_FACTORY });
__ngDeclareClassMetadata({ type: NgbTimeAdapter, decorators: [{
  type: Injectable,
  args: [{ providedIn: "root", useFactory: NGB_DATEPICKER_TIME_ADAPTER_FACTORY }]
}] });
class NgbTimeStructAdapter extends NgbTimeAdapter {
  /**
   * Converts a NgbTimeStruct value into NgbTimeStruct value
   */
  fromModel(time) {
    return time && isInteger(time.hour) && isInteger(time.minute) ? { hour: time.hour, minute: time.minute, second: isInteger(time.second) ? time.second : null } : null;
  }
  /**
   * Converts a NgbTimeStruct value into NgbTimeStruct value
   */
  toModel(time) {
    return time && isInteger(time.hour) && isInteger(time.minute) ? { hour: time.hour, minute: time.minute, second: isInteger(time.second) ? time.second : null } : null;
  }
}
NgbTimeStructAdapter.ɵfac = __ngDeclareFactory({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: NgbTimeStructAdapter, deps: null, target: FactoryTarget.Injectable });
NgbTimeStructAdapter.ɵprov = __ngDeclareInjectable({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: NgbTimeStructAdapter });
__ngDeclareClassMetadata({ type: NgbTimeStructAdapter, decorators: [{
  type: Injectable
}] });
function NGB_TIMEPICKER_I18N_FACTORY(locale) {
  return new NgbTimepickerI18nDefault(locale);
}
class NgbTimepickerI18n {
}
NgbTimepickerI18n.ɵfac = __ngDeclareFactory({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: NgbTimepickerI18n, deps: [], target: FactoryTarget.Injectable });
NgbTimepickerI18n.ɵprov = __ngDeclareInjectable({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: NgbTimepickerI18n, providedIn: "root", useFactory: NGB_TIMEPICKER_I18N_FACTORY, deps: [{ token: LOCALE_ID }] });
__ngDeclareClassMetadata({ type: NgbTimepickerI18n, decorators: [{
  type: Injectable,
  args: [{ providedIn: "root", useFactory: NGB_TIMEPICKER_I18N_FACTORY, deps: [LOCALE_ID] }]
}] });
class NgbTimepickerI18nDefault extends NgbTimepickerI18n {
  constructor(locale) {
    super();
    this._periods = getLocaleDayPeriods(locale, FormStyle.Standalone, TranslationWidth.Narrow);
  }
  getMorningPeriod() {
    return this._periods[0];
  }
  getAfternoonPeriod() {
    return this._periods[1];
  }
}
NgbTimepickerI18nDefault.ɵfac = __ngDeclareFactory({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: NgbTimepickerI18nDefault, deps: [{ token: LOCALE_ID }], target: FactoryTarget.Injectable });
NgbTimepickerI18nDefault.ɵprov = __ngDeclareInjectable({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: NgbTimepickerI18nDefault });
__ngDeclareClassMetadata({ type: NgbTimepickerI18nDefault, decorators: [{
  type: Injectable
}], ctorParameters: function() {
  return [{ type: void 0, decorators: [{
    type: Inject,
    args: [LOCALE_ID]
  }] }];
} });
const FILTER_REGEX = /[^0-9]/g;
class NgbTimepicker {
  constructor(_config, _ngbTimeAdapter, _cd, i18n) {
    this._config = _config;
    this._ngbTimeAdapter = _ngbTimeAdapter;
    this._cd = _cd;
    this.i18n = i18n;
    this.onChange = (_) => {
    };
    this.onTouched = () => {
    };
    this.meridian = _config.meridian;
    this.spinners = _config.spinners;
    this.seconds = _config.seconds;
    this.hourStep = _config.hourStep;
    this.minuteStep = _config.minuteStep;
    this.secondStep = _config.secondStep;
    this.disabled = _config.disabled;
    this.readonlyInputs = _config.readonlyInputs;
    this.size = _config.size;
  }
  /**
   * The number of hours to add/subtract when clicking hour spinners.
   */
  set hourStep(step) {
    this._hourStep = isInteger(step) ? step : this._config.hourStep;
  }
  get hourStep() {
    return this._hourStep;
  }
  /**
   * The number of minutes to add/subtract when clicking minute spinners.
   */
  set minuteStep(step) {
    this._minuteStep = isInteger(step) ? step : this._config.minuteStep;
  }
  get minuteStep() {
    return this._minuteStep;
  }
  /**
   * The number of seconds to add/subtract when clicking second spinners.
   */
  set secondStep(step) {
    this._secondStep = isInteger(step) ? step : this._config.secondStep;
  }
  get secondStep() {
    return this._secondStep;
  }
  writeValue(value) {
    const structValue = this._ngbTimeAdapter.fromModel(value);
    this.model = structValue ? new NgbTime(structValue.hour, structValue.minute, structValue.second) : new NgbTime();
    if (!this.seconds && (!structValue || !isNumber(structValue.second))) {
      this.model.second = 0;
    }
    this._cd.markForCheck();
  }
  registerOnChange(fn2) {
    this.onChange = fn2;
  }
  registerOnTouched(fn2) {
    this.onTouched = fn2;
  }
  setDisabledState(isDisabled) {
    this.disabled = isDisabled;
  }
  changeHour(step) {
    this.model.changeHour(step);
    this.propagateModelChange();
  }
  changeMinute(step) {
    this.model.changeMinute(step);
    this.propagateModelChange();
  }
  changeSecond(step) {
    this.model.changeSecond(step);
    this.propagateModelChange();
  }
  updateHour(newVal) {
    const isPM = this.model.hour >= 12;
    const enteredHour = toInteger(newVal);
    if (this.meridian && (isPM && enteredHour < 12 || !isPM && enteredHour === 12)) {
      this.model.updateHour(enteredHour + 12);
    } else {
      this.model.updateHour(enteredHour);
    }
    this.propagateModelChange();
  }
  updateMinute(newVal) {
    this.model.updateMinute(toInteger(newVal));
    this.propagateModelChange();
  }
  updateSecond(newVal) {
    this.model.updateSecond(toInteger(newVal));
    this.propagateModelChange();
  }
  toggleMeridian() {
    if (this.meridian) {
      this.changeHour(12);
    }
  }
  formatInput(input) {
    input.value = input.value.replace(FILTER_REGEX, "");
  }
  formatHour(value) {
    if (isNumber(value)) {
      if (this.meridian) {
        return padNumber(value % 12 === 0 ? 12 : value % 12);
      } else {
        return padNumber(value % 24);
      }
    } else {
      return padNumber(NaN);
    }
  }
  formatMinSec(value) {
    return padNumber(isNumber(value) ? value : NaN);
  }
  handleBlur() {
    this.onTouched();
  }
  get isSmallSize() {
    return this.size === "small";
  }
  get isLargeSize() {
    return this.size === "large";
  }
  ngOnChanges(changes) {
    if (changes["seconds"] && !this.seconds && this.model && !isNumber(this.model.second)) {
      this.model.second = 0;
      this.propagateModelChange(false);
    }
  }
  propagateModelChange(touched = true) {
    if (touched) {
      this.onTouched();
    }
    if (this.model.isValid(this.seconds)) {
      this.onChange(this._ngbTimeAdapter.toModel({ hour: this.model.hour, minute: this.model.minute, second: this.model.second }));
    } else {
      this.onChange(this._ngbTimeAdapter.toModel(null));
    }
  }
}
NgbTimepicker.ɵfac = __ngDeclareFactory({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: NgbTimepicker, deps: [{ token: NgbTimepickerConfig }, { token: NgbTimeAdapter }, { token: ChangeDetectorRef }, { token: NgbTimepickerI18n }], target: FactoryTarget.Component });
NgbTimepicker.ɵcmp = __ngDeclareComponent({ minVersion: "12.0.0", version: "13.0.3", type: NgbTimepicker, selector: "ngb-timepicker", inputs: { meridian: "meridian", spinners: "spinners", seconds: "seconds", hourStep: "hourStep", minuteStep: "minuteStep", secondStep: "secondStep", readonlyInputs: "readonlyInputs", size: "size" }, providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => NgbTimepicker), multi: true }], usesOnChanges: true, ngImport: i0, template: `
    <fieldset [disabled]="disabled" [class.disabled]="disabled">
      <div class="ngb-tp">
        <div class="ngb-tp-input-container ngb-tp-hour">
          <button *ngIf="spinners" tabindex="-1" type="button" (click)="changeHour(hourStep)"
            class="btn btn-link" [class.btn-sm]="isSmallSize" [class.btn-lg]="isLargeSize" [class.disabled]="disabled"
            [disabled]="disabled">
            <span class="chevron ngb-tp-chevron"></span>
            <span class="visually-hidden" i18n="@@ngb.timepicker.increment-hours">Increment hours</span>
          </button>
          <input type="text" class="ngb-tp-input form-control" [class.form-control-sm]="isSmallSize"
            [class.form-control-lg]="isLargeSize"
            maxlength="2" inputmode="numeric" placeholder="HH" i18n-placeholder="@@ngb.timepicker.HH"
            [value]="formatHour(model?.hour)" (change)="updateHour($any($event).target.value)"
            [readOnly]="readonlyInputs" [disabled]="disabled" aria-label="Hours" i18n-aria-label="@@ngb.timepicker.hours"
            (blur)="handleBlur()"
            (input)="formatInput($any($event).target)"
            (keydown.ArrowUp)="changeHour(hourStep); $event.preventDefault()"
            (keydown.ArrowDown)="changeHour(-hourStep); $event.preventDefault()">
          <button *ngIf="spinners" tabindex="-1" type="button" (click)="changeHour(-hourStep)"
            class="btn btn-link" [class.btn-sm]="isSmallSize" [class.btn-lg]="isLargeSize" [class.disabled]="disabled"
            [disabled]="disabled">
            <span class="chevron ngb-tp-chevron bottom"></span>
            <span class="visually-hidden" i18n="@@ngb.timepicker.decrement-hours">Decrement hours</span>
          </button>
        </div>
        <div class="ngb-tp-spacer">:</div>
        <div class="ngb-tp-input-container ngb-tp-minute">
          <button *ngIf="spinners" tabindex="-1" type="button" (click)="changeMinute(minuteStep)"
            class="btn btn-link" [class.btn-sm]="isSmallSize" [class.btn-lg]="isLargeSize" [class.disabled]="disabled"
            [disabled]="disabled">
            <span class="chevron ngb-tp-chevron"></span>
            <span class="visually-hidden" i18n="@@ngb.timepicker.increment-minutes">Increment minutes</span>
          </button>
          <input type="text" class="ngb-tp-input form-control" [class.form-control-sm]="isSmallSize" [class.form-control-lg]="isLargeSize"
            maxlength="2" inputmode="numeric" placeholder="MM" i18n-placeholder="@@ngb.timepicker.MM"
            [value]="formatMinSec(model?.minute)" (change)="updateMinute($any($event).target.value)"
            [readOnly]="readonlyInputs" [disabled]="disabled" aria-label="Minutes" i18n-aria-label="@@ngb.timepicker.minutes"
            (blur)="handleBlur()"
            (input)="formatInput($any($event).target)"
            (keydown.ArrowUp)="changeMinute(minuteStep); $event.preventDefault()"
            (keydown.ArrowDown)="changeMinute(-minuteStep); $event.preventDefault()">
          <button *ngIf="spinners" tabindex="-1" type="button" (click)="changeMinute(-minuteStep)"
            class="btn btn-link" [class.btn-sm]="isSmallSize" [class.btn-lg]="isLargeSize"  [class.disabled]="disabled"
            [disabled]="disabled">
            <span class="chevron ngb-tp-chevron bottom"></span>
            <span class="visually-hidden"  i18n="@@ngb.timepicker.decrement-minutes">Decrement minutes</span>
          </button>
        </div>
        <div *ngIf="seconds" class="ngb-tp-spacer">:</div>
        <div *ngIf="seconds" class="ngb-tp-input-container ngb-tp-second">
          <button *ngIf="spinners" tabindex="-1" type="button" (click)="changeSecond(secondStep)"
            class="btn btn-link" [class.btn-sm]="isSmallSize" [class.btn-lg]="isLargeSize" [class.disabled]="disabled"
            [disabled]="disabled">
            <span class="chevron ngb-tp-chevron"></span>
            <span class="visually-hidden" i18n="@@ngb.timepicker.increment-seconds">Increment seconds</span>
          </button>
          <input type="text" class="ngb-tp-input form-control" [class.form-control-sm]="isSmallSize" [class.form-control-lg]="isLargeSize"
            maxlength="2" inputmode="numeric" placeholder="SS" i18n-placeholder="@@ngb.timepicker.SS"
            [value]="formatMinSec(model?.second)" (change)="updateSecond($any($event).target.value)"
            [readOnly]="readonlyInputs" [disabled]="disabled" aria-label="Seconds" i18n-aria-label="@@ngb.timepicker.seconds"
            (blur)="handleBlur()"
            (input)="formatInput($any($event).target)"
            (keydown.ArrowUp)="changeSecond(secondStep); $event.preventDefault()"
            (keydown.ArrowDown)="changeSecond(-secondStep); $event.preventDefault()">
          <button *ngIf="spinners" tabindex="-1" type="button" (click)="changeSecond(-secondStep)"
            class="btn btn-link" [class.btn-sm]="isSmallSize" [class.btn-lg]="isLargeSize"  [class.disabled]="disabled"
            [disabled]="disabled">
            <span class="chevron ngb-tp-chevron bottom"></span>
            <span class="visually-hidden" i18n="@@ngb.timepicker.decrement-seconds">Decrement seconds</span>
          </button>
        </div>
        <div *ngIf="meridian" class="ngb-tp-spacer"></div>
        <div *ngIf="meridian" class="ngb-tp-meridian">
          <button type="button" class="btn btn-outline-primary" [class.btn-sm]="isSmallSize" [class.btn-lg]="isLargeSize"
            [disabled]="disabled" [class.disabled]="disabled"
                  (click)="toggleMeridian()">
            <ng-container *ngIf="model && model.hour >= 12; else am"
                          i18n="@@ngb.timepicker.PM">{{ i18n.getAfternoonPeriod() }}</ng-container>
            <ng-template #am i18n="@@ngb.timepicker.AM">{{ i18n.getMorningPeriod() }}</ng-template>
          </button>
        </div>
      </div>
    </fieldset>
  `, isInline: true, styles: ['ngb-timepicker{font-size:1rem}.ngb-tp{display:flex;align-items:center}.ngb-tp-input-container{width:4em}.ngb-tp-chevron:before{border-style:solid;border-width:.29em .29em 0 0;content:"";display:inline-block;height:.69em;left:.05em;position:relative;top:.15em;transform:rotate(-45deg);vertical-align:middle;width:.69em}.ngb-tp-chevron.bottom:before{top:-.3em;transform:rotate(135deg)}.ngb-tp-input{text-align:center}.ngb-tp-hour,.ngb-tp-minute,.ngb-tp-second,.ngb-tp-meridian{display:flex;flex-direction:column;align-items:center;justify-content:space-around}.ngb-tp-spacer{width:1em;text-align:center}\n'], directives: [{ type: NgIf, selector: "[ngIf]", inputs: ["ngIf", "ngIfThen", "ngIfElse"] }], encapsulation: ViewEncapsulation$1.None });
__ngDeclareClassMetadata({ type: NgbTimepicker, decorators: [{
  type: Component,
  args: [{ selector: "ngb-timepicker", encapsulation: ViewEncapsulation$1.None, template: `
    <fieldset [disabled]="disabled" [class.disabled]="disabled">
      <div class="ngb-tp">
        <div class="ngb-tp-input-container ngb-tp-hour">
          <button *ngIf="spinners" tabindex="-1" type="button" (click)="changeHour(hourStep)"
            class="btn btn-link" [class.btn-sm]="isSmallSize" [class.btn-lg]="isLargeSize" [class.disabled]="disabled"
            [disabled]="disabled">
            <span class="chevron ngb-tp-chevron"></span>
            <span class="visually-hidden" i18n="@@ngb.timepicker.increment-hours">Increment hours</span>
          </button>
          <input type="text" class="ngb-tp-input form-control" [class.form-control-sm]="isSmallSize"
            [class.form-control-lg]="isLargeSize"
            maxlength="2" inputmode="numeric" placeholder="HH" i18n-placeholder="@@ngb.timepicker.HH"
            [value]="formatHour(model?.hour)" (change)="updateHour($any($event).target.value)"
            [readOnly]="readonlyInputs" [disabled]="disabled" aria-label="Hours" i18n-aria-label="@@ngb.timepicker.hours"
            (blur)="handleBlur()"
            (input)="formatInput($any($event).target)"
            (keydown.ArrowUp)="changeHour(hourStep); $event.preventDefault()"
            (keydown.ArrowDown)="changeHour(-hourStep); $event.preventDefault()">
          <button *ngIf="spinners" tabindex="-1" type="button" (click)="changeHour(-hourStep)"
            class="btn btn-link" [class.btn-sm]="isSmallSize" [class.btn-lg]="isLargeSize" [class.disabled]="disabled"
            [disabled]="disabled">
            <span class="chevron ngb-tp-chevron bottom"></span>
            <span class="visually-hidden" i18n="@@ngb.timepicker.decrement-hours">Decrement hours</span>
          </button>
        </div>
        <div class="ngb-tp-spacer">:</div>
        <div class="ngb-tp-input-container ngb-tp-minute">
          <button *ngIf="spinners" tabindex="-1" type="button" (click)="changeMinute(minuteStep)"
            class="btn btn-link" [class.btn-sm]="isSmallSize" [class.btn-lg]="isLargeSize" [class.disabled]="disabled"
            [disabled]="disabled">
            <span class="chevron ngb-tp-chevron"></span>
            <span class="visually-hidden" i18n="@@ngb.timepicker.increment-minutes">Increment minutes</span>
          </button>
          <input type="text" class="ngb-tp-input form-control" [class.form-control-sm]="isSmallSize" [class.form-control-lg]="isLargeSize"
            maxlength="2" inputmode="numeric" placeholder="MM" i18n-placeholder="@@ngb.timepicker.MM"
            [value]="formatMinSec(model?.minute)" (change)="updateMinute($any($event).target.value)"
            [readOnly]="readonlyInputs" [disabled]="disabled" aria-label="Minutes" i18n-aria-label="@@ngb.timepicker.minutes"
            (blur)="handleBlur()"
            (input)="formatInput($any($event).target)"
            (keydown.ArrowUp)="changeMinute(minuteStep); $event.preventDefault()"
            (keydown.ArrowDown)="changeMinute(-minuteStep); $event.preventDefault()">
          <button *ngIf="spinners" tabindex="-1" type="button" (click)="changeMinute(-minuteStep)"
            class="btn btn-link" [class.btn-sm]="isSmallSize" [class.btn-lg]="isLargeSize"  [class.disabled]="disabled"
            [disabled]="disabled">
            <span class="chevron ngb-tp-chevron bottom"></span>
            <span class="visually-hidden"  i18n="@@ngb.timepicker.decrement-minutes">Decrement minutes</span>
          </button>
        </div>
        <div *ngIf="seconds" class="ngb-tp-spacer">:</div>
        <div *ngIf="seconds" class="ngb-tp-input-container ngb-tp-second">
          <button *ngIf="spinners" tabindex="-1" type="button" (click)="changeSecond(secondStep)"
            class="btn btn-link" [class.btn-sm]="isSmallSize" [class.btn-lg]="isLargeSize" [class.disabled]="disabled"
            [disabled]="disabled">
            <span class="chevron ngb-tp-chevron"></span>
            <span class="visually-hidden" i18n="@@ngb.timepicker.increment-seconds">Increment seconds</span>
          </button>
          <input type="text" class="ngb-tp-input form-control" [class.form-control-sm]="isSmallSize" [class.form-control-lg]="isLargeSize"
            maxlength="2" inputmode="numeric" placeholder="SS" i18n-placeholder="@@ngb.timepicker.SS"
            [value]="formatMinSec(model?.second)" (change)="updateSecond($any($event).target.value)"
            [readOnly]="readonlyInputs" [disabled]="disabled" aria-label="Seconds" i18n-aria-label="@@ngb.timepicker.seconds"
            (blur)="handleBlur()"
            (input)="formatInput($any($event).target)"
            (keydown.ArrowUp)="changeSecond(secondStep); $event.preventDefault()"
            (keydown.ArrowDown)="changeSecond(-secondStep); $event.preventDefault()">
          <button *ngIf="spinners" tabindex="-1" type="button" (click)="changeSecond(-secondStep)"
            class="btn btn-link" [class.btn-sm]="isSmallSize" [class.btn-lg]="isLargeSize"  [class.disabled]="disabled"
            [disabled]="disabled">
            <span class="chevron ngb-tp-chevron bottom"></span>
            <span class="visually-hidden" i18n="@@ngb.timepicker.decrement-seconds">Decrement seconds</span>
          </button>
        </div>
        <div *ngIf="meridian" class="ngb-tp-spacer"></div>
        <div *ngIf="meridian" class="ngb-tp-meridian">
          <button type="button" class="btn btn-outline-primary" [class.btn-sm]="isSmallSize" [class.btn-lg]="isLargeSize"
            [disabled]="disabled" [class.disabled]="disabled"
                  (click)="toggleMeridian()">
            <ng-container *ngIf="model && model.hour >= 12; else am"
                          i18n="@@ngb.timepicker.PM">{{ i18n.getAfternoonPeriod() }}</ng-container>
            <ng-template #am i18n="@@ngb.timepicker.AM">{{ i18n.getMorningPeriod() }}</ng-template>
          </button>
        </div>
      </div>
    </fieldset>
  `, providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => NgbTimepicker), multi: true }], styles: ['ngb-timepicker{font-size:1rem}.ngb-tp{display:flex;align-items:center}.ngb-tp-input-container{width:4em}.ngb-tp-chevron:before{border-style:solid;border-width:.29em .29em 0 0;content:"";display:inline-block;height:.69em;left:.05em;position:relative;top:.15em;transform:rotate(-45deg);vertical-align:middle;width:.69em}.ngb-tp-chevron.bottom:before{top:-.3em;transform:rotate(135deg)}.ngb-tp-input{text-align:center}.ngb-tp-hour,.ngb-tp-minute,.ngb-tp-second,.ngb-tp-meridian{display:flex;flex-direction:column;align-items:center;justify-content:space-around}.ngb-tp-spacer{width:1em;text-align:center}\n'] }]
}], ctorParameters: function() {
  return [{ type: NgbTimepickerConfig }, { type: NgbTimeAdapter }, { type: ChangeDetectorRef }, { type: NgbTimepickerI18n }];
}, propDecorators: { meridian: [{
  type: Input
}], spinners: [{
  type: Input
}], seconds: [{
  type: Input
}], hourStep: [{
  type: Input
}], minuteStep: [{
  type: Input
}], secondStep: [{
  type: Input
}], readonlyInputs: [{
  type: Input
}], size: [{
  type: Input
}] } });
class NgbTimepickerModule {
}
NgbTimepickerModule.ɵfac = __ngDeclareFactory({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: NgbTimepickerModule, deps: [], target: FactoryTarget.NgModule });
NgbTimepickerModule.ɵmod = __ngDeclareNgModule({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: NgbTimepickerModule, declarations: [NgbTimepicker], imports: [CommonModule], exports: [NgbTimepicker] });
NgbTimepickerModule.ɵinj = __ngDeclareInjector({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: NgbTimepickerModule, imports: [[CommonModule]] });
__ngDeclareClassMetadata({ type: NgbTimepickerModule, decorators: [{
  type: NgModule,
  args: [{ declarations: [NgbTimepicker], exports: [NgbTimepicker], imports: [CommonModule] }]
}] });
const ngbToastFadeInTransition = (element, animation) => {
  const { classList } = element;
  if (!animation) {
    classList.add("show");
    return;
  }
  classList.remove("hide");
  reflow(element);
  classList.add("showing");
  return () => {
    classList.remove("showing");
    classList.add("show");
  };
};
const ngbToastFadeOutTransition = ({ classList }) => {
  classList.remove("show");
  return () => {
    classList.add("hide");
  };
};
class NgbToastConfig {
  constructor(_ngbConfig) {
    this._ngbConfig = _ngbConfig;
    this.autohide = true;
    this.delay = 5e3;
    this.ariaLive = "polite";
  }
  get animation() {
    return this._animation === void 0 ? this._ngbConfig.animation : this._animation;
  }
  set animation(animation) {
    this._animation = animation;
  }
}
NgbToastConfig.ɵfac = __ngDeclareFactory({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: NgbToastConfig, deps: [{ token: NgbConfig }], target: FactoryTarget.Injectable });
NgbToastConfig.ɵprov = __ngDeclareInjectable({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: NgbToastConfig, providedIn: "root" });
__ngDeclareClassMetadata({ type: NgbToastConfig, decorators: [{
  type: Injectable,
  args: [{ providedIn: "root" }]
}], ctorParameters: function() {
  return [{ type: NgbConfig }];
} });
class NgbToastHeader {
}
NgbToastHeader.ɵfac = __ngDeclareFactory({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: NgbToastHeader, deps: [], target: FactoryTarget.Directive });
NgbToastHeader.ɵdir = __ngDeclareDirective({ minVersion: "12.0.0", version: "13.0.3", type: NgbToastHeader, selector: "[ngbToastHeader]", ngImport: i0 });
__ngDeclareClassMetadata({ type: NgbToastHeader, decorators: [{
  type: Directive,
  args: [{ selector: "[ngbToastHeader]" }]
}] });
class NgbToast {
  constructor(ariaLive, config, _zone, _element) {
    this.ariaLive = ariaLive;
    this._zone = _zone;
    this._element = _element;
    this.contentHeaderTpl = null;
    this.shown = new EventEmitter();
    this.hidden = new EventEmitter();
    if (this.ariaLive == null) {
      this.ariaLive = config.ariaLive;
    }
    this.delay = config.delay;
    this.autohide = config.autohide;
    this.animation = config.animation;
  }
  ngAfterContentInit() {
    this._zone.onStable.asObservable().pipe(take(1)).subscribe(() => {
      this._init();
      this.show();
    });
  }
  ngOnChanges(changes) {
    if ("autohide" in changes) {
      this._clearTimeout();
      this._init();
    }
  }
  /**
   * Triggers toast closing programmatically.
   *
   * The returned observable will emit and be completed once the closing transition has finished.
   * If the animations are turned off this happens synchronously.
   *
   * Alternatively you could listen or subscribe to the `(hidden)` output
   *
   * @since 8.0.0
   */
  hide() {
    this._clearTimeout();
    const transition2 = ngbRunTransition(this._zone, this._element.nativeElement, ngbToastFadeOutTransition, { animation: this.animation, runningTransition: "stop" });
    transition2.subscribe(() => {
      this.hidden.emit();
    });
    return transition2;
  }
  /**
   * Triggers toast opening programmatically.
   *
   * The returned observable will emit and be completed once the opening transition has finished.
   * If the animations are turned off this happens synchronously.
   *
   * Alternatively you could listen or subscribe to the `(shown)` output
   *
   * @since 8.0.0
   */
  show() {
    const transition2 = ngbRunTransition(this._zone, this._element.nativeElement, ngbToastFadeInTransition, {
      animation: this.animation,
      runningTransition: "continue"
    });
    transition2.subscribe(() => {
      this.shown.emit();
    });
    return transition2;
  }
  _init() {
    if (this.autohide && !this._timeoutID) {
      this._timeoutID = setTimeout(() => this.hide(), this.delay);
    }
  }
  _clearTimeout() {
    if (this._timeoutID) {
      clearTimeout(this._timeoutID);
      this._timeoutID = null;
    }
  }
}
NgbToast.ɵfac = __ngDeclareFactory({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: NgbToast, deps: [{ token: "aria-live", attribute: true }, { token: NgbToastConfig }, { token: NgZone }, { token: ElementRef }], target: FactoryTarget.Component });
NgbToast.ɵcmp = __ngDeclareComponent({ minVersion: "12.0.0", version: "13.0.3", type: NgbToast, selector: "ngb-toast", inputs: { animation: "animation", delay: "delay", autohide: "autohide", header: "header" }, outputs: { shown: "shown", hidden: "hidden" }, host: { attributes: { "role": "alert", "aria-atomic": "true" }, properties: { "attr.aria-live": "ariaLive", "class.fade": "animation" }, classAttribute: "toast" }, queries: [{ propertyName: "contentHeaderTpl", first: true, predicate: NgbToastHeader, descendants: true, read: TemplateRef, static: true }], exportAs: ["ngbToast"], usesOnChanges: true, ngImport: i0, template: `
    <ng-template #headerTpl>
      <strong class="me-auto">{{header}}</strong>
    </ng-template>
    <ng-template [ngIf]="contentHeaderTpl || header">
      <div class="toast-header">
        <ng-template [ngTemplateOutlet]="contentHeaderTpl || headerTpl"></ng-template>
        <button type="button" class="btn-close" aria-label="Close" i18n-aria-label="@@ngb.toast.close-aria" (click)="hide()">
        </button>
      </div>
    </ng-template>
    <div class="toast-body">
      <ng-content></ng-content>
    </div>
  `, isInline: true, styles: ["ngb-toast{display:block}ngb-toast .toast-header .close{margin-left:auto;margin-bottom:.25rem}\n"], directives: [{ type: NgIf, selector: "[ngIf]", inputs: ["ngIf", "ngIfThen", "ngIfElse"] }, { type: NgTemplateOutlet, selector: "[ngTemplateOutlet]", inputs: ["ngTemplateOutletContext", "ngTemplateOutlet"] }], encapsulation: ViewEncapsulation$1.None });
__ngDeclareClassMetadata({ type: NgbToast, decorators: [{
  type: Component,
  args: [{ selector: "ngb-toast", exportAs: "ngbToast", encapsulation: ViewEncapsulation$1.None, host: {
    "role": "alert",
    "[attr.aria-live]": "ariaLive",
    "aria-atomic": "true",
    "class": "toast",
    "[class.fade]": "animation"
  }, template: `
    <ng-template #headerTpl>
      <strong class="me-auto">{{header}}</strong>
    </ng-template>
    <ng-template [ngIf]="contentHeaderTpl || header">
      <div class="toast-header">
        <ng-template [ngTemplateOutlet]="contentHeaderTpl || headerTpl"></ng-template>
        <button type="button" class="btn-close" aria-label="Close" i18n-aria-label="@@ngb.toast.close-aria" (click)="hide()">
        </button>
      </div>
    </ng-template>
    <div class="toast-body">
      <ng-content></ng-content>
    </div>
  `, styles: ["ngb-toast{display:block}ngb-toast .toast-header .close{margin-left:auto;margin-bottom:.25rem}\n"] }]
}], ctorParameters: function() {
  return [{ type: void 0, decorators: [{
    type: Attribute,
    args: ["aria-live"]
  }] }, { type: NgbToastConfig }, { type: NgZone }, { type: ElementRef }];
}, propDecorators: { animation: [{
  type: Input
}], delay: [{
  type: Input
}], autohide: [{
  type: Input
}], header: [{
  type: Input
}], contentHeaderTpl: [{
  type: ContentChild,
  args: [NgbToastHeader, { read: TemplateRef, static: true }]
}], shown: [{
  type: Output
}], hidden: [{
  type: Output
}] } });
class NgbToastModule {
}
NgbToastModule.ɵfac = __ngDeclareFactory({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: NgbToastModule, deps: [], target: FactoryTarget.NgModule });
NgbToastModule.ɵmod = __ngDeclareNgModule({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: NgbToastModule, declarations: [NgbToast, NgbToastHeader], imports: [CommonModule], exports: [NgbToast, NgbToastHeader] });
NgbToastModule.ɵinj = __ngDeclareInjector({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: NgbToastModule, imports: [[CommonModule]] });
__ngDeclareClassMetadata({ type: NgbToastModule, decorators: [{
  type: NgModule,
  args: [{ declarations: [NgbToast, NgbToastHeader], imports: [CommonModule], exports: [NgbToast, NgbToastHeader] }]
}] });
class NgbTooltipConfig {
  constructor(_ngbConfig) {
    this._ngbConfig = _ngbConfig;
    this.autoClose = true;
    this.placement = "auto";
    this.triggers = "hover focus";
    this.disableTooltip = false;
    this.openDelay = 0;
    this.closeDelay = 0;
  }
  get animation() {
    return this._animation === void 0 ? this._ngbConfig.animation : this._animation;
  }
  set animation(animation) {
    this._animation = animation;
  }
}
NgbTooltipConfig.ɵfac = __ngDeclareFactory({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: NgbTooltipConfig, deps: [{ token: NgbConfig }], target: FactoryTarget.Injectable });
NgbTooltipConfig.ɵprov = __ngDeclareInjectable({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: NgbTooltipConfig, providedIn: "root" });
__ngDeclareClassMetadata({ type: NgbTooltipConfig, decorators: [{
  type: Injectable,
  args: [{ providedIn: "root" }]
}], ctorParameters: function() {
  return [{ type: NgbConfig }];
} });
let nextId$5 = 0;
class NgbTooltipWindow {
}
NgbTooltipWindow.ɵfac = __ngDeclareFactory({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: NgbTooltipWindow, deps: [], target: FactoryTarget.Component });
NgbTooltipWindow.ɵcmp = __ngDeclareComponent({ minVersion: "12.0.0", version: "13.0.3", type: NgbTooltipWindow, selector: "ngb-tooltip-window", inputs: { animation: "animation", id: "id", tooltipClass: "tooltipClass" }, host: { attributes: { "role": "tooltip" }, properties: { "class": '"tooltip" + (tooltipClass ? " " + tooltipClass : "")', "class.fade": "animation", "id": "id" } }, ngImport: i0, template: `<div class="tooltip-arrow" data-popper-arrow></div><div class="tooltip-inner"><ng-content></ng-content></div>`, isInline: true, changeDetection: ChangeDetectionStrategy.OnPush, encapsulation: ViewEncapsulation$1.None });
__ngDeclareClassMetadata({ type: NgbTooltipWindow, decorators: [{
  type: Component,
  args: [{
    selector: "ngb-tooltip-window",
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation$1.None,
    host: {
      "[class]": '"tooltip" + (tooltipClass ? " " + tooltipClass : "")',
      "[class.fade]": "animation",
      "role": "tooltip",
      "[id]": "id"
    },
    template: `<div class="tooltip-arrow" data-popper-arrow></div><div class="tooltip-inner"><ng-content></ng-content></div>`
  }]
}], propDecorators: { animation: [{
  type: Input
}], id: [{
  type: Input
}], tooltipClass: [{
  type: Input
}] } });
class NgbTooltip {
  constructor(_elementRef, _renderer, injector, viewContainerRef, config, _ngZone, _document, _changeDetector, applicationRef) {
    this._elementRef = _elementRef;
    this._renderer = _renderer;
    this._ngZone = _ngZone;
    this._document = _document;
    this._changeDetector = _changeDetector;
    this.shown = new EventEmitter();
    this.hidden = new EventEmitter();
    this._ngbTooltipWindowId = `ngb-tooltip-${nextId$5++}`;
    this._windowRef = null;
    this._positioning = ngbPositioning();
    this.animation = config.animation;
    this.autoClose = config.autoClose;
    this.placement = config.placement;
    this.triggers = config.triggers;
    this.container = config.container;
    this.disableTooltip = config.disableTooltip;
    this.tooltipClass = config.tooltipClass;
    this.openDelay = config.openDelay;
    this.closeDelay = config.closeDelay;
    this._popupService = new PopupService(NgbTooltipWindow, injector, viewContainerRef, _renderer, this._ngZone, applicationRef);
  }
  /**
   * The string content or a `TemplateRef` for the content to be displayed in the tooltip.
   *
   * If the content if falsy, the tooltip won't open.
   */
  set ngbTooltip(value) {
    this._ngbTooltip = value;
    if (!value && this._windowRef) {
      this.close();
    }
  }
  get ngbTooltip() {
    return this._ngbTooltip;
  }
  /**
   * Opens the tooltip.
   *
   * This is considered to be a "manual" triggering.
   * The `context` is an optional value to be injected into the tooltip template when it is created.
   */
  open(context) {
    if (!this._windowRef && this._ngbTooltip && !this.disableTooltip) {
      const { windowRef, transition$ } = this._popupService.open(this._ngbTooltip, context, this.animation);
      this._windowRef = windowRef;
      this._windowRef.instance.animation = this.animation;
      this._windowRef.instance.tooltipClass = this.tooltipClass;
      this._windowRef.instance.id = this._ngbTooltipWindowId;
      this._renderer.setAttribute(this._elementRef.nativeElement, "aria-describedby", this._ngbTooltipWindowId);
      if (this.container === "body") {
        this._document.querySelector(this.container).appendChild(this._windowRef.location.nativeElement);
      }
      this._windowRef.changeDetectorRef.detectChanges();
      this._windowRef.changeDetectorRef.markForCheck();
      this._ngZone.runOutsideAngular(() => {
        this._positioning.createPopper({
          hostElement: this._elementRef.nativeElement,
          targetElement: this._windowRef.location.nativeElement,
          placement: this.placement,
          appendToBody: this.container === "body",
          baseClass: "bs-tooltip"
        });
        Promise.resolve().then(() => {
          this._positioning.update();
          this._zoneSubscription = this._ngZone.onStable.subscribe(() => this._positioning.update());
        });
      });
      ngbAutoClose(this._ngZone, this._document, this.autoClose, () => this.close(), this.hidden, [this._windowRef.location.nativeElement]);
      transition$.subscribe(() => this.shown.emit());
    }
  }
  /**
   * Closes the tooltip.
   *
   * This is considered to be a "manual" triggering of the tooltip.
   */
  close(animation = this.animation) {
    if (this._windowRef != null) {
      this._renderer.removeAttribute(this._elementRef.nativeElement, "aria-describedby");
      this._popupService.close(animation).subscribe(() => {
        this._windowRef = null;
        this._positioning.destroy();
        this._zoneSubscription?.unsubscribe();
        this.hidden.emit();
        this._changeDetector.markForCheck();
      });
    }
  }
  /**
   * Toggles the tooltip.
   *
   * This is considered to be a "manual" triggering of the tooltip.
   */
  toggle() {
    if (this._windowRef) {
      this.close();
    } else {
      this.open();
    }
  }
  /**
   * Returns `true`, if the popover is currently shown.
   */
  isOpen() {
    return this._windowRef != null;
  }
  ngOnInit() {
    this._unregisterListenersFn = listenToTriggers(this._renderer, this._elementRef.nativeElement, this.triggers, this.isOpen.bind(this), this.open.bind(this), this.close.bind(this), +this.openDelay, +this.closeDelay);
  }
  ngOnChanges({ tooltipClass }) {
    if (tooltipClass && this.isOpen()) {
      this._windowRef.instance.tooltipClass = tooltipClass.currentValue;
    }
  }
  ngOnDestroy() {
    this.close(false);
    this._unregisterListenersFn?.();
  }
}
NgbTooltip.ɵfac = __ngDeclareFactory({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: NgbTooltip, deps: [{ token: ElementRef }, { token: Renderer2 }, { token: Injector }, { token: ViewContainerRef }, { token: NgbTooltipConfig }, { token: NgZone }, { token: DOCUMENT }, { token: ChangeDetectorRef }, { token: ApplicationRef }], target: FactoryTarget.Directive });
NgbTooltip.ɵdir = __ngDeclareDirective({ minVersion: "12.0.0", version: "13.0.3", type: NgbTooltip, selector: "[ngbTooltip]", inputs: { animation: "animation", autoClose: "autoClose", placement: "placement", triggers: "triggers", container: "container", disableTooltip: "disableTooltip", tooltipClass: "tooltipClass", openDelay: "openDelay", closeDelay: "closeDelay", ngbTooltip: "ngbTooltip" }, outputs: { shown: "shown", hidden: "hidden" }, exportAs: ["ngbTooltip"], usesOnChanges: true, ngImport: i0 });
__ngDeclareClassMetadata({ type: NgbTooltip, decorators: [{
  type: Directive,
  args: [{ selector: "[ngbTooltip]", exportAs: "ngbTooltip" }]
}], ctorParameters: function() {
  return [{ type: ElementRef }, { type: Renderer2 }, { type: Injector }, { type: ViewContainerRef }, { type: NgbTooltipConfig }, { type: NgZone }, { type: void 0, decorators: [{
    type: Inject,
    args: [DOCUMENT]
  }] }, { type: ChangeDetectorRef }, { type: ApplicationRef }];
}, propDecorators: { animation: [{
  type: Input
}], autoClose: [{
  type: Input
}], placement: [{
  type: Input
}], triggers: [{
  type: Input
}], container: [{
  type: Input
}], disableTooltip: [{
  type: Input
}], tooltipClass: [{
  type: Input
}], openDelay: [{
  type: Input
}], closeDelay: [{
  type: Input
}], shown: [{
  type: Output
}], hidden: [{
  type: Output
}], ngbTooltip: [{
  type: Input
}] } });
class NgbTooltipModule {
}
NgbTooltipModule.ɵfac = __ngDeclareFactory({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: NgbTooltipModule, deps: [], target: FactoryTarget.NgModule });
NgbTooltipModule.ɵmod = __ngDeclareNgModule({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: NgbTooltipModule, declarations: [NgbTooltip, NgbTooltipWindow], exports: [NgbTooltip] });
NgbTooltipModule.ɵinj = __ngDeclareInjector({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: NgbTooltipModule });
__ngDeclareClassMetadata({ type: NgbTooltipModule, decorators: [{
  type: NgModule,
  args: [{ declarations: [NgbTooltip, NgbTooltipWindow], exports: [NgbTooltip] }]
}] });
class NgbHighlight {
  constructor() {
    this.highlightClass = "ngb-highlight";
    this.accentSensitive = true;
  }
  ngOnChanges(changes) {
    if (!this.accentSensitive && !String.prototype.normalize) {
      console.warn("The `accentSensitive` input in `ngb-highlight` cannot be set to `false` in a browser that does not implement the `String.normalize` function. You will have to include a polyfill in your application to use this feature in the current browser.");
      this.accentSensitive = true;
    }
    const result = toString(this.result);
    const terms = Array.isArray(this.term) ? this.term : [this.term];
    const prepareTerm = (term) => this.accentSensitive ? term : removeAccents(term);
    const escapedTerms = terms.map((term) => regExpEscape(prepareTerm(toString(term)))).filter((term) => term);
    const toSplit = this.accentSensitive ? result : removeAccents(result);
    const parts = escapedTerms.length ? toSplit.split(new RegExp(`(${escapedTerms.join("|")})`, "gmi")) : [result];
    if (this.accentSensitive) {
      this.parts = parts;
    } else {
      let offset2 = 0;
      this.parts = parts.map((part) => result.substring(offset2, offset2 += part.length));
    }
  }
}
NgbHighlight.ɵfac = __ngDeclareFactory({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: NgbHighlight, deps: [], target: FactoryTarget.Component });
NgbHighlight.ɵcmp = __ngDeclareComponent({ minVersion: "12.0.0", version: "13.0.3", type: NgbHighlight, selector: "ngb-highlight", inputs: { highlightClass: "highlightClass", result: "result", term: "term", accentSensitive: "accentSensitive" }, usesOnChanges: true, ngImport: i0, template: '<ng-template ngFor [ngForOf]="parts" let-part let-isOdd="odd"><span *ngIf="isOdd; else even" [class]="highlightClass">{{part}}</span><ng-template #even>{{part}}</ng-template></ng-template>', isInline: true, styles: [".ngb-highlight{font-weight:700}\n"], directives: [{ type: NgForOf, selector: "[ngFor][ngForOf]", inputs: ["ngForOf", "ngForTrackBy", "ngForTemplate"] }, { type: NgIf, selector: "[ngIf]", inputs: ["ngIf", "ngIfThen", "ngIfElse"] }], changeDetection: ChangeDetectionStrategy.OnPush, encapsulation: ViewEncapsulation$1.None });
__ngDeclareClassMetadata({ type: NgbHighlight, decorators: [{
  type: Component,
  args: [{ selector: "ngb-highlight", changeDetection: ChangeDetectionStrategy.OnPush, encapsulation: ViewEncapsulation$1.None, template: `<ng-template ngFor [ngForOf]="parts" let-part let-isOdd="odd"><span *ngIf="isOdd; else even" [class]="highlightClass">{{part}}</span><ng-template #even>{{part}}</ng-template></ng-template>`, styles: [".ngb-highlight{font-weight:700}\n"] }]
}], propDecorators: { highlightClass: [{
  type: Input
}], result: [{
  type: Input
}], term: [{
  type: Input
}], accentSensitive: [{
  type: Input
}] } });
class NgbTypeaheadWindow {
  constructor() {
    this.activeIdx = 0;
    this.focusFirst = true;
    this.formatter = toString;
    this.selectEvent = new EventEmitter();
    this.activeChangeEvent = new EventEmitter();
  }
  hasActive() {
    return this.activeIdx > -1 && this.activeIdx < this.results.length;
  }
  getActive() {
    return this.results[this.activeIdx];
  }
  markActive(activeIdx) {
    this.activeIdx = activeIdx;
    this._activeChanged();
  }
  next() {
    if (this.activeIdx === this.results.length - 1) {
      this.activeIdx = this.focusFirst ? (this.activeIdx + 1) % this.results.length : -1;
    } else {
      this.activeIdx++;
    }
    this._activeChanged();
  }
  prev() {
    if (this.activeIdx < 0) {
      this.activeIdx = this.results.length - 1;
    } else if (this.activeIdx === 0) {
      this.activeIdx = this.focusFirst ? this.results.length - 1 : -1;
    } else {
      this.activeIdx--;
    }
    this._activeChanged();
  }
  resetActive() {
    this.activeIdx = this.focusFirst ? 0 : -1;
    this._activeChanged();
  }
  select(item) {
    this.selectEvent.emit(item);
  }
  ngOnInit() {
    this.resetActive();
  }
  _activeChanged() {
    this.activeChangeEvent.emit(this.activeIdx >= 0 ? this.id + "-" + this.activeIdx : void 0);
  }
}
NgbTypeaheadWindow.ɵfac = __ngDeclareFactory({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: NgbTypeaheadWindow, deps: [], target: FactoryTarget.Component });
NgbTypeaheadWindow.ɵcmp = __ngDeclareComponent({ minVersion: "12.0.0", version: "13.0.3", type: NgbTypeaheadWindow, selector: "ngb-typeahead-window", inputs: { id: "id", focusFirst: "focusFirst", results: "results", term: "term", formatter: "formatter", resultTemplate: "resultTemplate", popupClass: "popupClass" }, outputs: { selectEvent: "select", activeChangeEvent: "activeChange" }, host: { attributes: { "role": "listbox" }, listeners: { "mousedown": "$event.preventDefault()" }, properties: { "class": '"dropdown-menu show" + (popupClass ? " " + popupClass : "")', "id": "id" } }, exportAs: ["ngbTypeaheadWindow"], ngImport: i0, template: `
    <ng-template #rt let-result="result" let-term="term" let-formatter="formatter">
      <ngb-highlight [result]="formatter(result)" [term]="term"></ngb-highlight>
    </ng-template>
    <ng-template ngFor [ngForOf]="results" let-result let-idx="index">
      <button type="button" class="dropdown-item" role="option"
        [id]="id + '-' + idx"
        [class.active]="idx === activeIdx"
        (mouseenter)="markActive(idx)"
        (click)="select(result)">
          <ng-template [ngTemplateOutlet]="resultTemplate || rt"
          [ngTemplateOutletContext]="{result: result, term: term, formatter: formatter}"></ng-template>
      </button>
    </ng-template>
  `, isInline: true, components: [{ type: NgbHighlight, selector: "ngb-highlight", inputs: ["highlightClass", "result", "term", "accentSensitive"] }], directives: [{ type: NgForOf, selector: "[ngFor][ngForOf]", inputs: ["ngForOf", "ngForTrackBy", "ngForTemplate"] }, { type: NgTemplateOutlet, selector: "[ngTemplateOutlet]", inputs: ["ngTemplateOutletContext", "ngTemplateOutlet"] }], encapsulation: ViewEncapsulation$1.None });
__ngDeclareClassMetadata({ type: NgbTypeaheadWindow, decorators: [{
  type: Component,
  args: [{
    selector: "ngb-typeahead-window",
    exportAs: "ngbTypeaheadWindow",
    encapsulation: ViewEncapsulation$1.None,
    host: {
      "(mousedown)": "$event.preventDefault()",
      "[class]": '"dropdown-menu show" + (popupClass ? " " + popupClass : "")',
      "role": "listbox",
      "[id]": "id"
    },
    template: `
    <ng-template #rt let-result="result" let-term="term" let-formatter="formatter">
      <ngb-highlight [result]="formatter(result)" [term]="term"></ngb-highlight>
    </ng-template>
    <ng-template ngFor [ngForOf]="results" let-result let-idx="index">
      <button type="button" class="dropdown-item" role="option"
        [id]="id + '-' + idx"
        [class.active]="idx === activeIdx"
        (mouseenter)="markActive(idx)"
        (click)="select(result)">
          <ng-template [ngTemplateOutlet]="resultTemplate || rt"
          [ngTemplateOutletContext]="{result: result, term: term, formatter: formatter}"></ng-template>
      </button>
    </ng-template>
  `
  }]
}], propDecorators: { id: [{
  type: Input
}], focusFirst: [{
  type: Input
}], results: [{
  type: Input
}], term: [{
  type: Input
}], formatter: [{
  type: Input
}], resultTemplate: [{
  type: Input
}], popupClass: [{
  type: Input
}], selectEvent: [{
  type: Output,
  args: ["select"]
}], activeChangeEvent: [{
  type: Output,
  args: ["activeChange"]
}] } });
class NgbTypeaheadConfig {
  constructor() {
    this.editable = true;
    this.focusFirst = true;
    this.showHint = false;
    this.placement = ["bottom-start", "bottom-end", "top-start", "top-end"];
  }
}
NgbTypeaheadConfig.ɵfac = __ngDeclareFactory({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: NgbTypeaheadConfig, deps: [], target: FactoryTarget.Injectable });
NgbTypeaheadConfig.ɵprov = __ngDeclareInjectable({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: NgbTypeaheadConfig, providedIn: "root" });
__ngDeclareClassMetadata({ type: NgbTypeaheadConfig, decorators: [{
  type: Injectable,
  args: [{ providedIn: "root" }]
}] });
const ARIA_LIVE_DELAY = new InjectionToken("live announcer delay", { providedIn: "root", factory: ARIA_LIVE_DELAY_FACTORY });
function ARIA_LIVE_DELAY_FACTORY() {
  return 100;
}
function getLiveElement(document2, lazyCreate = false) {
  let element = document2.body.querySelector("#ngb-live");
  if (element == null && lazyCreate) {
    element = document2.createElement("div");
    element.setAttribute("id", "ngb-live");
    element.setAttribute("aria-live", "polite");
    element.setAttribute("aria-atomic", "true");
    element.classList.add("visually-hidden");
    document2.body.appendChild(element);
  }
  return element;
}
class Live {
  constructor(_document, _delay) {
    this._document = _document;
    this._delay = _delay;
  }
  ngOnDestroy() {
    const element = getLiveElement(this._document);
    if (element) {
      element.parentElement.removeChild(element);
    }
  }
  say(message) {
    const element = getLiveElement(this._document, true);
    const delay2 = this._delay;
    if (element != null) {
      element.textContent = "";
      const setText = () => element.textContent = message;
      if (delay2 === null) {
        setText();
      } else {
        setTimeout(setText, delay2);
      }
    }
  }
}
Live.ɵfac = __ngDeclareFactory({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: Live, deps: [{ token: DOCUMENT }, { token: ARIA_LIVE_DELAY }], target: FactoryTarget.Injectable });
Live.ɵprov = __ngDeclareInjectable({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: Live, providedIn: "root" });
__ngDeclareClassMetadata({ type: Live, decorators: [{
  type: Injectable,
  args: [{ providedIn: "root" }]
}], ctorParameters: function() {
  return [{ type: void 0, decorators: [{
    type: Inject,
    args: [DOCUMENT]
  }] }, { type: void 0, decorators: [{
    type: Inject,
    args: [ARIA_LIVE_DELAY]
  }] }];
} });
let nextWindowId = 0;
class NgbTypeahead {
  constructor(_elementRef, viewContainerRef, _renderer, injector, config, ngZone, _live, _document, _ngZone, _changeDetector, applicationRef) {
    this._elementRef = _elementRef;
    this._renderer = _renderer;
    this._live = _live;
    this._document = _document;
    this._ngZone = _ngZone;
    this._changeDetector = _changeDetector;
    this._subscription = null;
    this._closed$ = new Subject();
    this._inputValueBackup = null;
    this._windowRef = null;
    this._positioning = ngbPositioning();
    this.autocomplete = "off";
    this.placement = "bottom-start";
    this.selectItem = new EventEmitter();
    this.activeDescendant = null;
    this.popupId = `ngb-typeahead-${nextWindowId++}`;
    this._onTouched = () => {
    };
    this._onChange = (_) => {
    };
    this.container = config.container;
    this.editable = config.editable;
    this.focusFirst = config.focusFirst;
    this.showHint = config.showHint;
    this.placement = config.placement;
    this._valueChanges = fromEvent(_elementRef.nativeElement, "input").pipe(map(($event) => $event.target.value));
    this._resubscribeTypeahead = new BehaviorSubject(null);
    this._popupService = new PopupService(NgbTypeaheadWindow, injector, viewContainerRef, _renderer, this._ngZone, applicationRef);
  }
  ngOnInit() {
    this._subscribeToUserInput();
  }
  ngOnChanges({ ngbTypeahead }) {
    if (ngbTypeahead && !ngbTypeahead.firstChange) {
      this._unsubscribeFromUserInput();
      this._subscribeToUserInput();
    }
  }
  ngOnDestroy() {
    this._closePopup();
    this._unsubscribeFromUserInput();
  }
  registerOnChange(fn2) {
    this._onChange = fn2;
  }
  registerOnTouched(fn2) {
    this._onTouched = fn2;
  }
  writeValue(value) {
    this._writeInputValue(this._formatItemForInput(value));
    if (this.showHint) {
      this._inputValueBackup = value;
    }
  }
  setDisabledState(isDisabled) {
    this._renderer.setProperty(this._elementRef.nativeElement, "disabled", isDisabled);
  }
  /**
   * Dismisses typeahead popup window
   */
  dismissPopup() {
    if (this.isPopupOpen()) {
      this._resubscribeTypeahead.next(null);
      this._closePopup();
      if (this.showHint && this._inputValueBackup !== null) {
        this._writeInputValue(this._inputValueBackup);
      }
      this._changeDetector.markForCheck();
    }
  }
  /**
   * Returns true if the typeahead popup window is displayed
   */
  isPopupOpen() {
    return this._windowRef != null;
  }
  handleBlur() {
    this._resubscribeTypeahead.next(null);
    this._onTouched();
  }
  handleKeyDown(event) {
    if (!this.isPopupOpen()) {
      return;
    }
    switch (event.which) {
      case Key.ArrowDown:
        event.preventDefault();
        this._windowRef.instance.next();
        this._showHint();
        break;
      case Key.ArrowUp:
        event.preventDefault();
        this._windowRef.instance.prev();
        this._showHint();
        break;
      case Key.Enter:
      case Key.Tab: {
        const result = this._windowRef.instance.getActive();
        if (isDefined(result)) {
          event.preventDefault();
          event.stopPropagation();
          this._selectResult(result);
        }
        this._closePopup();
        break;
      }
    }
  }
  _openPopup() {
    if (!this.isPopupOpen()) {
      this._inputValueBackup = this._elementRef.nativeElement.value;
      const { windowRef } = this._popupService.open();
      this._windowRef = windowRef;
      this._windowRef.instance.id = this.popupId;
      this._windowRef.instance.selectEvent.subscribe((result) => this._selectResultClosePopup(result));
      this._windowRef.instance.activeChangeEvent.subscribe((activeId) => this.activeDescendant = activeId);
      this._windowRef.instance.popupClass = this.popupClass;
      if (this.container === "body") {
        this._renderer.setStyle(this._windowRef.location.nativeElement, "z-index", "1055");
        this._document.querySelector(this.container).appendChild(this._windowRef.location.nativeElement);
      }
      this._changeDetector.markForCheck();
      this._ngZone.runOutsideAngular(() => {
        if (this._windowRef) {
          this._positioning.createPopper({
            hostElement: this._elementRef.nativeElement,
            targetElement: this._windowRef.location.nativeElement,
            placement: this.placement,
            appendToBody: this.container === "body",
            updatePopperOptions: addPopperOffset([0, 2])
          });
          this._zoneSubscription = this._ngZone.onStable.subscribe(() => this._positioning.update());
        }
      });
      ngbAutoClose(this._ngZone, this._document, "outside", () => this.dismissPopup(), this._closed$, [this._elementRef.nativeElement, this._windowRef.location.nativeElement]);
    }
  }
  _closePopup() {
    this._popupService.close().subscribe(() => {
      this._positioning.destroy();
      this._zoneSubscription?.unsubscribe();
      this._closed$.next();
      this._windowRef = null;
      this.activeDescendant = null;
    });
  }
  _selectResult(result) {
    let defaultPrevented = false;
    this.selectItem.emit({ item: result, preventDefault: () => {
      defaultPrevented = true;
    } });
    this._resubscribeTypeahead.next(null);
    if (!defaultPrevented) {
      this.writeValue(result);
      this._onChange(result);
    }
  }
  _selectResultClosePopup(result) {
    this._selectResult(result);
    this._closePopup();
  }
  _showHint() {
    if (this.showHint && this._windowRef?.instance.hasActive() && this._inputValueBackup != null) {
      const userInputLowerCase = this._inputValueBackup.toLowerCase();
      const formattedVal = this._formatItemForInput(this._windowRef.instance.getActive());
      if (userInputLowerCase === formattedVal.substr(0, this._inputValueBackup.length).toLowerCase()) {
        this._writeInputValue(this._inputValueBackup + formattedVal.substr(this._inputValueBackup.length));
        this._elementRef.nativeElement["setSelectionRange"].apply(this._elementRef.nativeElement, [this._inputValueBackup.length, formattedVal.length]);
      } else {
        this._writeInputValue(formattedVal);
      }
    }
  }
  _formatItemForInput(item) {
    return item != null && this.inputFormatter ? this.inputFormatter(item) : toString(item);
  }
  _writeInputValue(value) {
    this._renderer.setProperty(this._elementRef.nativeElement, "value", toString(value));
  }
  _subscribeToUserInput() {
    const results$ = this._valueChanges.pipe(tap((value) => {
      this._inputValueBackup = this.showHint ? value : null;
      this._onChange(this.editable ? value : void 0);
    }), this.ngbTypeahead ? this.ngbTypeahead : () => of([]));
    this._subscription = this._resubscribeTypeahead.pipe(switchMap(() => results$)).subscribe((results) => {
      if (!results || results.length === 0) {
        this._closePopup();
      } else {
        this._openPopup();
        this._windowRef.instance.focusFirst = this.focusFirst;
        this._windowRef.instance.results = results;
        this._windowRef.instance.term = this._elementRef.nativeElement.value;
        if (this.resultFormatter) {
          this._windowRef.instance.formatter = this.resultFormatter;
        }
        if (this.resultTemplate) {
          this._windowRef.instance.resultTemplate = this.resultTemplate;
        }
        this._windowRef.instance.resetActive();
        this._windowRef.changeDetectorRef.detectChanges();
        this._showHint();
      }
      const count = results ? results.length : 0;
      this._live.say(count === 0 ? "No results available" : `${count} result${count === 1 ? "" : "s"} available`);
    });
  }
  _unsubscribeFromUserInput() {
    if (this._subscription) {
      this._subscription.unsubscribe();
    }
    this._subscription = null;
  }
}
NgbTypeahead.ɵfac = __ngDeclareFactory({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: NgbTypeahead, deps: [{ token: ElementRef }, { token: ViewContainerRef }, { token: Renderer2 }, { token: Injector }, { token: NgbTypeaheadConfig }, { token: NgZone }, { token: Live }, { token: DOCUMENT }, { token: NgZone }, { token: ChangeDetectorRef }, { token: ApplicationRef }], target: FactoryTarget.Directive });
NgbTypeahead.ɵdir = __ngDeclareDirective({ minVersion: "12.0.0", version: "13.0.3", type: NgbTypeahead, selector: "input[ngbTypeahead]", inputs: { autocomplete: "autocomplete", container: "container", editable: "editable", focusFirst: "focusFirst", inputFormatter: "inputFormatter", ngbTypeahead: "ngbTypeahead", resultFormatter: "resultFormatter", resultTemplate: "resultTemplate", showHint: "showHint", placement: "placement", popupClass: "popupClass" }, outputs: { selectItem: "selectItem" }, host: { attributes: { "autocapitalize": "off", "autocorrect": "off", "role": "combobox", "aria-multiline": "false" }, listeners: { "blur": "handleBlur()", "keydown": "handleKeyDown($event)" }, properties: { "class.open": "isPopupOpen()", "autocomplete": "autocomplete", "attr.aria-autocomplete": 'showHint ? "both" : "list"', "attr.aria-activedescendant": "activeDescendant", "attr.aria-owns": "isPopupOpen() ? popupId : null", "attr.aria-expanded": "isPopupOpen()" } }, providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => NgbTypeahead), multi: true }], exportAs: ["ngbTypeahead"], usesOnChanges: true, ngImport: i0 });
__ngDeclareClassMetadata({ type: NgbTypeahead, decorators: [{
  type: Directive,
  args: [{
    selector: "input[ngbTypeahead]",
    exportAs: "ngbTypeahead",
    host: {
      "(blur)": "handleBlur()",
      "[class.open]": "isPopupOpen()",
      "(keydown)": "handleKeyDown($event)",
      "[autocomplete]": "autocomplete",
      "autocapitalize": "off",
      "autocorrect": "off",
      "role": "combobox",
      "aria-multiline": "false",
      "[attr.aria-autocomplete]": 'showHint ? "both" : "list"',
      "[attr.aria-activedescendant]": "activeDescendant",
      "[attr.aria-owns]": "isPopupOpen() ? popupId : null",
      "[attr.aria-expanded]": "isPopupOpen()"
    },
    providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => NgbTypeahead), multi: true }]
  }]
}], ctorParameters: function() {
  return [{ type: ElementRef }, { type: ViewContainerRef }, { type: Renderer2 }, { type: Injector }, { type: NgbTypeaheadConfig }, { type: NgZone }, { type: Live }, { type: void 0, decorators: [{
    type: Inject,
    args: [DOCUMENT]
  }] }, { type: NgZone }, { type: ChangeDetectorRef }, { type: ApplicationRef }];
}, propDecorators: { autocomplete: [{
  type: Input
}], container: [{
  type: Input
}], editable: [{
  type: Input
}], focusFirst: [{
  type: Input
}], inputFormatter: [{
  type: Input
}], ngbTypeahead: [{
  type: Input
}], resultFormatter: [{
  type: Input
}], resultTemplate: [{
  type: Input
}], showHint: [{
  type: Input
}], placement: [{
  type: Input
}], popupClass: [{
  type: Input
}], selectItem: [{
  type: Output
}] } });
class NgbTypeaheadModule {
}
NgbTypeaheadModule.ɵfac = __ngDeclareFactory({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: NgbTypeaheadModule, deps: [], target: FactoryTarget.NgModule });
NgbTypeaheadModule.ɵmod = __ngDeclareNgModule({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: NgbTypeaheadModule, declarations: [NgbTypeahead, NgbHighlight, NgbTypeaheadWindow], imports: [CommonModule], exports: [NgbTypeahead, NgbHighlight] });
NgbTypeaheadModule.ɵinj = __ngDeclareInjector({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: NgbTypeaheadModule, imports: [[CommonModule]] });
__ngDeclareClassMetadata({ type: NgbTypeaheadModule, decorators: [{
  type: NgModule,
  args: [{
    declarations: [NgbTypeahead, NgbHighlight, NgbTypeaheadWindow],
    exports: [NgbTypeahead, NgbHighlight],
    imports: [CommonModule]
  }]
}] });
var OffcanvasDismissReasons;
(function(OffcanvasDismissReasons2) {
  OffcanvasDismissReasons2[OffcanvasDismissReasons2["BACKDROP_CLICK"] = 0] = "BACKDROP_CLICK";
  OffcanvasDismissReasons2[OffcanvasDismissReasons2["ESC"] = 1] = "ESC";
})(OffcanvasDismissReasons || (OffcanvasDismissReasons = {}));
class NgbOffcanvasBackdrop {
  constructor(_el, _zone) {
    this._el = _el;
    this._zone = _zone;
    this.dismissEvent = new EventEmitter();
  }
  ngOnInit() {
    this._zone.onStable.asObservable().pipe(take(1)).subscribe(() => {
      ngbRunTransition(this._zone, this._el.nativeElement, (element, animation) => {
        if (animation) {
          reflow(element);
        }
        element.classList.add("show");
      }, { animation: this.animation, runningTransition: "continue" });
    });
  }
  hide() {
    return ngbRunTransition(this._zone, this._el.nativeElement, ({ classList }) => classList.remove("show"), { animation: this.animation, runningTransition: "stop" });
  }
  dismiss() {
    this.dismissEvent.emit(OffcanvasDismissReasons.BACKDROP_CLICK);
  }
}
NgbOffcanvasBackdrop.ɵfac = __ngDeclareFactory({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: NgbOffcanvasBackdrop, deps: [{ token: ElementRef }, { token: NgZone }], target: FactoryTarget.Component });
NgbOffcanvasBackdrop.ɵcmp = __ngDeclareComponent({ minVersion: "12.0.0", version: "13.0.3", type: NgbOffcanvasBackdrop, selector: "ngb-offcanvas-backdrop", inputs: { animation: "animation", backdropClass: "backdropClass" }, outputs: { dismissEvent: "dismiss" }, host: { listeners: { "mousedown": "dismiss()" }, properties: { "class": '"offcanvas-backdrop" + (backdropClass ? " " + backdropClass : "")', "class.show": "!animation", "class.fade": "animation" } }, ngImport: i0, template: "", isInline: true, encapsulation: ViewEncapsulation$1.None });
__ngDeclareClassMetadata({ type: NgbOffcanvasBackdrop, decorators: [{
  type: Component,
  args: [{
    selector: "ngb-offcanvas-backdrop",
    encapsulation: ViewEncapsulation$1.None,
    template: "",
    host: {
      "[class]": '"offcanvas-backdrop" + (backdropClass ? " " + backdropClass : "")',
      "[class.show]": "!animation",
      "[class.fade]": "animation",
      "(mousedown)": "dismiss()"
    }
  }]
}], ctorParameters: function() {
  return [{ type: ElementRef }, { type: NgZone }];
}, propDecorators: { animation: [{
  type: Input
}], backdropClass: [{
  type: Input
}], dismissEvent: [{
  type: Output,
  args: ["dismiss"]
}] } });
class NgbOffcanvasPanel {
  constructor(_document, _elRef, _zone) {
    this._document = _document;
    this._elRef = _elRef;
    this._zone = _zone;
    this._closed$ = new Subject();
    this._elWithFocus = null;
    this.keyboard = true;
    this.position = "start";
    this.dismissEvent = new EventEmitter();
    this.shown = new Subject();
    this.hidden = new Subject();
  }
  dismiss(reason) {
    this.dismissEvent.emit(reason);
  }
  ngOnInit() {
    this._elWithFocus = this._document.activeElement;
    this._zone.onStable.asObservable().pipe(take(1)).subscribe(() => {
      this._show();
    });
  }
  ngOnDestroy() {
    this._disableEventHandling();
  }
  hide() {
    const { nativeElement } = this._elRef;
    const context = { animation: this.animation, runningTransition: "stop" };
    const offcanvasTransition$ = ngbRunTransition(this._zone, this._elRef.nativeElement, (element) => {
      nativeElement.classList.remove("show");
      return () => element.style.visibility = "hidden";
    }, context);
    offcanvasTransition$.subscribe(() => {
      this.hidden.next();
      this.hidden.complete();
    });
    this._disableEventHandling();
    this._restoreFocus();
    return offcanvasTransition$;
  }
  _show() {
    const context = { animation: this.animation, runningTransition: "continue" };
    const offcanvasTransition$ = ngbRunTransition(this._zone, this._elRef.nativeElement, (element, animation) => {
      if (animation) {
        reflow(element);
      }
      element.classList.add("show");
      element.style.visibility = "visible";
    }, context);
    offcanvasTransition$.subscribe(() => {
      this.shown.next();
      this.shown.complete();
    });
    this._enableEventHandling();
    this._setFocus();
  }
  _enableEventHandling() {
    const { nativeElement } = this._elRef;
    this._zone.runOutsideAngular(() => {
      fromEvent(nativeElement, "keydown").pipe(
        takeUntil(this._closed$),
        /* eslint-disable-next-line deprecation/deprecation */
        filter((e) => e.which === Key.Escape)
      ).subscribe((event) => {
        if (this.keyboard) {
          requestAnimationFrame(() => {
            if (!event.defaultPrevented) {
              this._zone.run(() => this.dismiss(OffcanvasDismissReasons.ESC));
            }
          });
        }
      });
    });
  }
  _disableEventHandling() {
    this._closed$.next();
  }
  _setFocus() {
    const { nativeElement } = this._elRef;
    if (!nativeElement.contains(document.activeElement)) {
      const autoFocusable = nativeElement.querySelector(`[ngbAutofocus]`);
      const firstFocusable = getFocusableBoundaryElements(nativeElement)[0];
      const elementToFocus = autoFocusable || firstFocusable || nativeElement;
      elementToFocus.focus();
    }
  }
  _restoreFocus() {
    const body = this._document.body;
    const elWithFocus = this._elWithFocus;
    let elementToFocus;
    if (elWithFocus && elWithFocus["focus"] && body.contains(elWithFocus)) {
      elementToFocus = elWithFocus;
    } else {
      elementToFocus = body;
    }
    this._zone.runOutsideAngular(() => {
      setTimeout(() => elementToFocus.focus());
      this._elWithFocus = null;
    });
  }
}
NgbOffcanvasPanel.ɵfac = __ngDeclareFactory({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: NgbOffcanvasPanel, deps: [{ token: DOCUMENT }, { token: ElementRef }, { token: NgZone }], target: FactoryTarget.Component });
NgbOffcanvasPanel.ɵcmp = __ngDeclareComponent({ minVersion: "12.0.0", version: "13.0.3", type: NgbOffcanvasPanel, selector: "ngb-offcanvas-panel", inputs: { animation: "animation", ariaLabelledBy: "ariaLabelledBy", ariaDescribedBy: "ariaDescribedBy", keyboard: "keyboard", panelClass: "panelClass", position: "position" }, outputs: { dismissEvent: "dismiss" }, host: { attributes: { "role": "dialog", "tabindex": "-1" }, properties: { "class": '"offcanvas offcanvas-" + position  + (panelClass ? " " + panelClass : "")', "attr.aria-modal": "true", "attr.aria-labelledby": "ariaLabelledBy", "attr.aria-describedby": "ariaDescribedBy" } }, ngImport: i0, template: "<ng-content></ng-content>", isInline: true, encapsulation: ViewEncapsulation$1.None });
__ngDeclareClassMetadata({ type: NgbOffcanvasPanel, decorators: [{
  type: Component,
  args: [{ selector: "ngb-offcanvas-panel", template: "<ng-content></ng-content>", encapsulation: ViewEncapsulation$1.None, host: {
    "[class]": '"offcanvas offcanvas-" + position  + (panelClass ? " " + panelClass : "")',
    "role": "dialog",
    "tabindex": "-1",
    "[attr.aria-modal]": "true",
    "[attr.aria-labelledby]": "ariaLabelledBy",
    "[attr.aria-describedby]": "ariaDescribedBy"
  }, styles: [] }]
}], ctorParameters: function() {
  return [{ type: void 0, decorators: [{
    type: Inject,
    args: [DOCUMENT]
  }] }, { type: ElementRef }, { type: NgZone }];
}, propDecorators: { animation: [{
  type: Input
}], ariaLabelledBy: [{
  type: Input
}], ariaDescribedBy: [{
  type: Input
}], keyboard: [{
  type: Input
}], panelClass: [{
  type: Input
}], position: [{
  type: Input
}], dismissEvent: [{
  type: Output,
  args: ["dismiss"]
}] } });
class NgbActiveOffcanvas {
  /**
   * Closes the offcanvas with an optional `result` value.
   *
   * The `NgbOffcanvasRef.result` promise will be resolved with the provided value.
   */
  close(result) {
  }
  /**
   * Dismisses the offcanvas with an optional `reason` value.
   *
   * The `NgbOffcanvasRef.result` promise will be rejected with the provided value.
   */
  dismiss(reason) {
  }
}
class NgbOffcanvasRef {
  constructor(_panelCmptRef, _contentRef, _backdropCmptRef, _beforeDismiss) {
    this._panelCmptRef = _panelCmptRef;
    this._contentRef = _contentRef;
    this._backdropCmptRef = _backdropCmptRef;
    this._beforeDismiss = _beforeDismiss;
    this._closed = new Subject();
    this._dismissed = new Subject();
    this._hidden = new Subject();
    _panelCmptRef.instance.dismissEvent.subscribe((reason) => {
      this.dismiss(reason);
    });
    if (_backdropCmptRef) {
      _backdropCmptRef.instance.dismissEvent.subscribe((reason) => {
        this.dismiss(reason);
      });
    }
    this.result = new Promise((resolve, reject) => {
      this._resolve = resolve;
      this._reject = reject;
    });
    this.result.then(null, () => {
    });
  }
  /**
   * The instance of a component used for the offcanvas content.
   *
   * When a `TemplateRef` is used as the content or when the offcanvas is closed, will return `undefined`.
   */
  get componentInstance() {
    if (this._contentRef && this._contentRef.componentRef) {
      return this._contentRef.componentRef.instance;
    }
  }
  /**
   * The observable that emits when the offcanvas is closed via the `.close()` method.
   *
   * It will emit the result passed to the `.close()` method.
   */
  get closed() {
    return this._closed.asObservable().pipe(takeUntil(this._hidden));
  }
  /**
   * The observable that emits when the offcanvas is dismissed via the `.dismiss()` method.
   *
   * It will emit the reason passed to the `.dismissed()` method by the user, or one of the internal
   * reasons like backdrop click or ESC key press.
   */
  get dismissed() {
    return this._dismissed.asObservable().pipe(takeUntil(this._hidden));
  }
  /**
   * The observable that emits when both offcanvas window and backdrop are closed and animations were finished.
   * At this point offcanvas and backdrop elements will be removed from the DOM tree.
   *
   * This observable will be completed after emitting.
   */
  get hidden() {
    return this._hidden.asObservable();
  }
  /**
   * The observable that emits when offcanvas is fully visible and animation was finished.
   * The offcanvas DOM element is always available synchronously after calling 'offcanvas.open()' service.
   *
   * This observable will be completed after emitting.
   * It will not emit, if offcanvas is closed before open animation is finished.
   */
  get shown() {
    return this._panelCmptRef.instance.shown.asObservable();
  }
  /**
   * Closes the offcanvas with an optional `result` value.
   *
   * The `NgbMobalRef.result` promise will be resolved with the provided value.
   */
  close(result) {
    if (this._panelCmptRef) {
      this._closed.next(result);
      this._resolve(result);
      this._removeOffcanvasElements();
    }
  }
  _dismiss(reason) {
    this._dismissed.next(reason);
    this._reject(reason);
    this._removeOffcanvasElements();
  }
  /**
   * Dismisses the offcanvas with an optional `reason` value.
   *
   * The `NgbOffcanvasRef.result` promise will be rejected with the provided value.
   */
  dismiss(reason) {
    if (this._panelCmptRef) {
      if (!this._beforeDismiss) {
        this._dismiss(reason);
      } else {
        const dismiss = this._beforeDismiss();
        if (isPromise(dismiss)) {
          dismiss.then((result) => {
            if (result !== false) {
              this._dismiss(reason);
            }
          }, () => {
          });
        } else if (dismiss !== false) {
          this._dismiss(reason);
        }
      }
    }
  }
  _removeOffcanvasElements() {
    const panelTransition$ = this._panelCmptRef.instance.hide();
    const backdropTransition$ = this._backdropCmptRef ? this._backdropCmptRef.instance.hide() : of(void 0);
    panelTransition$.subscribe(() => {
      const { nativeElement } = this._panelCmptRef.location;
      nativeElement.parentNode.removeChild(nativeElement);
      this._panelCmptRef.destroy();
      if (this._contentRef && this._contentRef.viewRef) {
        this._contentRef.viewRef.destroy();
      }
      this._panelCmptRef = null;
      this._contentRef = null;
    });
    backdropTransition$.subscribe(() => {
      if (this._backdropCmptRef) {
        const { nativeElement } = this._backdropCmptRef.location;
        nativeElement.parentNode.removeChild(nativeElement);
        this._backdropCmptRef.destroy();
        this._backdropCmptRef = null;
      }
    });
    zip(panelTransition$, backdropTransition$).subscribe(() => {
      this._hidden.next();
      this._hidden.complete();
    });
  }
}
class NgbOffcanvasStack {
  constructor(_applicationRef, _injector, _document, _scrollBar, _ngZone) {
    this._applicationRef = _applicationRef;
    this._injector = _injector;
    this._document = _document;
    this._scrollBar = _scrollBar;
    this._ngZone = _ngZone;
    this._activePanelCmptHasChanged = new Subject();
    this._scrollBarRestoreFn = null;
    this._backdropAttributes = ["animation", "backdropClass"];
    this._panelAttributes = ["animation", "ariaDescribedBy", "ariaLabelledBy", "keyboard", "panelClass", "position"];
    this._activeInstance = new EventEmitter();
    this._activePanelCmptHasChanged.subscribe(() => {
      if (this._panelCmpt) {
        ngbFocusTrap(this._ngZone, this._panelCmpt.location.nativeElement, this._activePanelCmptHasChanged);
      }
    });
  }
  _restoreScrollBar() {
    const scrollBarRestoreFn = this._scrollBarRestoreFn;
    if (scrollBarRestoreFn) {
      this._scrollBarRestoreFn = null;
      scrollBarRestoreFn();
    }
  }
  _hideScrollBar() {
    if (!this._scrollBarRestoreFn) {
      this._scrollBarRestoreFn = this._scrollBar.hide();
    }
  }
  open(moduleCFR, contentInjector, content, options) {
    const containerEl = options.container instanceof HTMLElement ? options.container : isDefined(options.container) ? this._document.querySelector(options.container) : this._document.body;
    if (!containerEl) {
      throw new Error(`The specified offcanvas container "${options.container || "body"}" was not found in the DOM.`);
    }
    if (!options.scroll) {
      this._hideScrollBar();
    }
    const activeOffcanvas = new NgbActiveOffcanvas();
    const contentRef = this._getContentRef(moduleCFR, options.injector || contentInjector, content, activeOffcanvas);
    let backdropCmptRef = options.backdrop !== false ? this._attachBackdrop(moduleCFR, containerEl) : void 0;
    let panelCmptRef = this._attachWindowComponent(moduleCFR, containerEl, contentRef);
    let ngbOffcanvasRef = new NgbOffcanvasRef(panelCmptRef, contentRef, backdropCmptRef, options.beforeDismiss);
    this._registerOffcanvasRef(ngbOffcanvasRef);
    this._registerPanelCmpt(panelCmptRef);
    ngbOffcanvasRef.hidden.pipe(finalize(() => this._restoreScrollBar())).subscribe();
    activeOffcanvas.close = (result) => {
      ngbOffcanvasRef.close(result);
    };
    activeOffcanvas.dismiss = (reason) => {
      ngbOffcanvasRef.dismiss(reason);
    };
    this._applyPanelOptions(panelCmptRef.instance, options);
    if (backdropCmptRef && backdropCmptRef.instance) {
      this._applyBackdropOptions(backdropCmptRef.instance, options);
      backdropCmptRef.changeDetectorRef.detectChanges();
    }
    panelCmptRef.changeDetectorRef.detectChanges();
    return ngbOffcanvasRef;
  }
  get activeInstance() {
    return this._activeInstance;
  }
  dismiss(reason) {
    this._offcanvasRef?.dismiss(reason);
  }
  hasOpenOffcanvas() {
    return !!this._offcanvasRef;
  }
  _attachBackdrop(moduleCFR, containerEl) {
    let backdropFactory = moduleCFR.resolveComponentFactory(NgbOffcanvasBackdrop);
    let backdropCmptRef = backdropFactory.create(this._injector);
    this._applicationRef.attachView(backdropCmptRef.hostView);
    containerEl.appendChild(backdropCmptRef.location.nativeElement);
    return backdropCmptRef;
  }
  _attachWindowComponent(moduleCFR, containerEl, contentRef) {
    let panelFactory = moduleCFR.resolveComponentFactory(NgbOffcanvasPanel);
    let panelCmptRef = panelFactory.create(this._injector, contentRef.nodes);
    this._applicationRef.attachView(panelCmptRef.hostView);
    containerEl.appendChild(panelCmptRef.location.nativeElement);
    return panelCmptRef;
  }
  _applyPanelOptions(windowInstance, options) {
    this._panelAttributes.forEach((optionName) => {
      if (isDefined(options[optionName])) {
        windowInstance[optionName] = options[optionName];
      }
    });
  }
  _applyBackdropOptions(backdropInstance, options) {
    this._backdropAttributes.forEach((optionName) => {
      if (isDefined(options[optionName])) {
        backdropInstance[optionName] = options[optionName];
      }
    });
  }
  _getContentRef(moduleCFR, contentInjector, content, activeOffcanvas) {
    if (!content) {
      return new ContentRef([]);
    } else if (content instanceof TemplateRef) {
      return this._createFromTemplateRef(content, activeOffcanvas);
    } else if (isString(content)) {
      return this._createFromString(content);
    } else {
      return this._createFromComponent(moduleCFR, contentInjector, content, activeOffcanvas);
    }
  }
  _createFromTemplateRef(content, activeOffcanvas) {
    const context = {
      $implicit: activeOffcanvas,
      close(result) {
        activeOffcanvas.close(result);
      },
      dismiss(reason) {
        activeOffcanvas.dismiss(reason);
      }
    };
    const viewRef = content.createEmbeddedView(context);
    this._applicationRef.attachView(viewRef);
    return new ContentRef([viewRef.rootNodes], viewRef);
  }
  _createFromString(content) {
    const component = this._document.createTextNode(`${content}`);
    return new ContentRef([[component]]);
  }
  _createFromComponent(moduleCFR, contentInjector, content, context) {
    const contentCmptFactory = moduleCFR.resolveComponentFactory(content);
    const offcanvasContentInjector = Injector.create({ providers: [{ provide: NgbActiveOffcanvas, useValue: context }], parent: contentInjector });
    const componentRef = contentCmptFactory.create(offcanvasContentInjector);
    const componentNativeEl = componentRef.location.nativeElement;
    this._applicationRef.attachView(componentRef.hostView);
    return new ContentRef([[componentNativeEl]], componentRef.hostView, componentRef);
  }
  _registerOffcanvasRef(ngbOffcanvasRef) {
    const unregisterOffcanvasRef = () => {
      this._offcanvasRef = void 0;
      this._activeInstance.emit(this._offcanvasRef);
    };
    this._offcanvasRef = ngbOffcanvasRef;
    this._activeInstance.emit(this._offcanvasRef);
    ngbOffcanvasRef.result.then(unregisterOffcanvasRef, unregisterOffcanvasRef);
  }
  _registerPanelCmpt(ngbPanelCmpt) {
    this._panelCmpt = ngbPanelCmpt;
    this._activePanelCmptHasChanged.next();
    ngbPanelCmpt.onDestroy(() => {
      this._panelCmpt = void 0;
      this._activePanelCmptHasChanged.next();
    });
  }
}
NgbOffcanvasStack.ɵfac = __ngDeclareFactory({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: NgbOffcanvasStack, deps: [{ token: ApplicationRef }, { token: Injector }, { token: DOCUMENT }, { token: ScrollBar }, { token: NgZone }], target: FactoryTarget.Injectable });
NgbOffcanvasStack.ɵprov = __ngDeclareInjectable({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: NgbOffcanvasStack, providedIn: "root" });
__ngDeclareClassMetadata({ type: NgbOffcanvasStack, decorators: [{
  type: Injectable,
  args: [{ providedIn: "root" }]
}], ctorParameters: function() {
  return [{ type: ApplicationRef }, { type: Injector }, { type: void 0, decorators: [{
    type: Inject,
    args: [DOCUMENT]
  }] }, { type: ScrollBar }, { type: NgZone }];
} });
class NgbOffcanvasConfig {
  constructor(_ngbConfig) {
    this._ngbConfig = _ngbConfig;
    this.backdrop = true;
    this.keyboard = true;
    this.position = "start";
    this.scroll = false;
  }
  get animation() {
    return this._animation === void 0 ? this._ngbConfig.animation : this._animation;
  }
  set animation(animation) {
    this._animation = animation;
  }
}
NgbOffcanvasConfig.ɵfac = __ngDeclareFactory({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: NgbOffcanvasConfig, deps: [{ token: NgbConfig }], target: FactoryTarget.Injectable });
NgbOffcanvasConfig.ɵprov = __ngDeclareInjectable({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: NgbOffcanvasConfig, providedIn: "root" });
__ngDeclareClassMetadata({ type: NgbOffcanvasConfig, decorators: [{
  type: Injectable,
  args: [{ providedIn: "root" }]
}], ctorParameters: function() {
  return [{ type: NgbConfig }];
} });
class NgbOffcanvas {
  constructor(_moduleCFR, _injector, _offcanvasStack, _config) {
    this._moduleCFR = _moduleCFR;
    this._injector = _injector;
    this._offcanvasStack = _offcanvasStack;
    this._config = _config;
  }
  /**
   * Opens a new offcanvas panel with the specified content and supplied options.
   *
   * Content can be provided as a `TemplateRef` or a component type. If you pass a component type as content,
   * then instances of those components can be injected with an instance of the `NgbActiveOffcanvas` class. You can then
   * use `NgbActiveOffcanvas` methods to close / dismiss offcanvas from "inside" of your component.
   *
   * Also see the [`NgbOffcanvasOptions`](#/components/offcanvas/api#NgbOffcanvasOptions) for the list of supported
   * options.
   */
  open(content, options = {}) {
    const combinedOptions = { ...this._config, animation: this._config.animation, ...options };
    return this._offcanvasStack.open(this._moduleCFR, this._injector, content, combinedOptions);
  }
  /**
   * Returns an observable that holds the active offcanvas instance.
   */
  get activeInstance() {
    return this._offcanvasStack.activeInstance;
  }
  /**
   * Dismisses the currently displayed offcanvas with the supplied reason.
   */
  dismiss(reason) {
    this._offcanvasStack.dismiss(reason);
  }
  /**
   * Indicates if there is currently an open offcanvas in the application.
   */
  hasOpenOffcanvas() {
    return this._offcanvasStack.hasOpenOffcanvas();
  }
}
NgbOffcanvas.ɵfac = __ngDeclareFactory({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: NgbOffcanvas, deps: [{ token: ComponentFactoryResolver$1 }, { token: Injector }, { token: NgbOffcanvasStack }, { token: NgbOffcanvasConfig }], target: FactoryTarget.Injectable });
NgbOffcanvas.ɵprov = __ngDeclareInjectable({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: NgbOffcanvas, providedIn: "root" });
__ngDeclareClassMetadata({ type: NgbOffcanvas, decorators: [{
  type: Injectable,
  args: [{ providedIn: "root" }]
}], ctorParameters: function() {
  return [{ type: ComponentFactoryResolver$1 }, { type: Injector }, { type: NgbOffcanvasStack }, { type: NgbOffcanvasConfig }];
} });
class NgbOffcanvasModule {
}
NgbOffcanvasModule.ɵfac = __ngDeclareFactory({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: NgbOffcanvasModule, deps: [], target: FactoryTarget.NgModule });
NgbOffcanvasModule.ɵmod = __ngDeclareNgModule({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: NgbOffcanvasModule, declarations: [NgbOffcanvasPanel, NgbOffcanvasBackdrop] });
NgbOffcanvasModule.ɵinj = __ngDeclareInjector({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: NgbOffcanvasModule });
__ngDeclareClassMetadata({ type: NgbOffcanvasModule, decorators: [{
  type: NgModule,
  args: [{ declarations: [NgbOffcanvasPanel, NgbOffcanvasBackdrop] }]
}] });
const NGB_MODULES = [
  /* eslint-disable-next-line deprecation/deprecation */
  NgbAccordionModule,
  NgbAlertModule,
  NgbButtonsModule,
  NgbCarouselModule,
  NgbCollapseModule,
  NgbDatepickerModule,
  NgbDropdownModule,
  NgbModalModule,
  NgbNavModule,
  NgbOffcanvasModule,
  NgbPaginationModule,
  NgbPopoverModule,
  NgbProgressbarModule,
  NgbRatingModule,
  NgbTimepickerModule,
  NgbToastModule,
  NgbTooltipModule,
  NgbTypeaheadModule
];
class NgbModule {
}
NgbModule.ɵfac = __ngDeclareFactory({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: NgbModule, deps: [], target: FactoryTarget.NgModule });
NgbModule.ɵmod = __ngDeclareNgModule({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: NgbModule, imports: [
  /* eslint-disable-next-line deprecation/deprecation */
  NgbAccordionModule,
  NgbAlertModule,
  NgbButtonsModule,
  NgbCarouselModule,
  NgbCollapseModule,
  NgbDatepickerModule,
  NgbDropdownModule,
  NgbModalModule,
  NgbNavModule,
  NgbOffcanvasModule,
  NgbPaginationModule,
  NgbPopoverModule,
  NgbProgressbarModule,
  NgbRatingModule,
  NgbTimepickerModule,
  NgbToastModule,
  NgbTooltipModule,
  NgbTypeaheadModule
], exports: [
  /* eslint-disable-next-line deprecation/deprecation */
  NgbAccordionModule,
  NgbAlertModule,
  NgbButtonsModule,
  NgbCarouselModule,
  NgbCollapseModule,
  NgbDatepickerModule,
  NgbDropdownModule,
  NgbModalModule,
  NgbNavModule,
  NgbOffcanvasModule,
  NgbPaginationModule,
  NgbPopoverModule,
  NgbProgressbarModule,
  NgbRatingModule,
  NgbTimepickerModule,
  NgbToastModule,
  NgbTooltipModule,
  NgbTypeaheadModule
] });
NgbModule.ɵinj = __ngDeclareInjector({ minVersion: "12.0.0", version: "13.0.3", ngImport: i0, type: NgbModule, imports: [
  NGB_MODULES,
  /* eslint-disable-next-line deprecation/deprecation */
  NgbAccordionModule,
  NgbAlertModule,
  NgbButtonsModule,
  NgbCarouselModule,
  NgbCollapseModule,
  NgbDatepickerModule,
  NgbDropdownModule,
  NgbModalModule,
  NgbNavModule,
  NgbOffcanvasModule,
  NgbPaginationModule,
  NgbPopoverModule,
  NgbProgressbarModule,
  NgbRatingModule,
  NgbTimepickerModule,
  NgbToastModule,
  NgbTooltipModule,
  NgbTypeaheadModule
] });
__ngDeclareClassMetadata({ type: NgbModule, decorators: [{
  type: NgModule,
  args: [{ imports: NGB_MODULES, exports: NGB_MODULES }]
}] });
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
function coerceBooleanProperty(value) {
  return value != null && "" + value !== "false";
}
function coerceNumberProperty(value, fallbackValue) {
  if (fallbackValue === void 0) {
    fallbackValue = 0;
  }
  return _isNumberValue(value) ? Number(value) : fallbackValue;
}
function _isNumberValue(value) {
  return !isNaN(parseFloat(
    /** @type {?} */
    value
  )) && !isNaN(Number(value));
}
function coerceArray(value) {
  return Array.isArray(value) ? value : [value];
}
function coerceCssPixelValue(value) {
  if (value == null) {
    return "";
  }
  return typeof value === "string" ? value : value + "px";
}
function coerceElement(elementOrRef) {
  return elementOrRef instanceof ElementRef ? elementOrRef.nativeElement : elementOrRef;
}
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
var hasV8BreakIterator;
try {
  hasV8BreakIterator = typeof Intl !== "undefined" && /** @type {?} */
  Intl.v8BreakIterator;
} catch (_a) {
  hasV8BreakIterator = false;
}
var Platform = (
  /** @class */
  (function() {
    function Platform2(_platformId) {
      this._platformId = _platformId;
      this.isBrowser = this._platformId ? isPlatformBrowser(this._platformId) : typeof document === "object" && !!document;
      this.EDGE = this.isBrowser && /(edge)/i.test(navigator.userAgent);
      this.TRIDENT = this.isBrowser && /(msie|trident)/i.test(navigator.userAgent);
      this.BLINK = this.isBrowser && (!!/** @type {?} */
      (window.chrome || hasV8BreakIterator) && typeof CSS !== "undefined" && !this.EDGE && !this.TRIDENT);
      this.WEBKIT = this.isBrowser && /AppleWebKit/i.test(navigator.userAgent) && !this.BLINK && !this.EDGE && !this.TRIDENT;
      this.IOS = this.isBrowser && /iPad|iPhone|iPod/.test(navigator.userAgent) && !("MSStream" in window);
      this.FIREFOX = this.isBrowser && /(firefox|minefield)/i.test(navigator.userAgent);
      this.ANDROID = this.isBrowser && /android/i.test(navigator.userAgent) && !this.TRIDENT;
      this.SAFARI = this.isBrowser && /safari/i.test(navigator.userAgent) && this.WEBKIT;
    }
    Platform2.decorators = [
      { type: Injectable, args: [{ providedIn: "root" }] }
    ];
    Platform2.ctorParameters = function() {
      return [
        { type: Object, decorators: [{ type: Optional }, { type: Inject, args: [PLATFORM_ID] }] }
      ];
    };
    Platform2.ngInjectableDef = defineInjectable({ factory: function Platform_Factory() {
      return new Platform2(inject(PLATFORM_ID, 8));
    }, token: Platform2, providedIn: "root" });
    return Platform2;
  })()
);
var PlatformModule = (
  /** @class */
  (function() {
    function PlatformModule2() {
    }
    PlatformModule2.decorators = [
      { type: NgModule, args: [{}] }
    ];
    return PlatformModule2;
  })()
);
var supportsPassiveEvents;
function supportsPassiveEventListeners() {
  if (supportsPassiveEvents == null && typeof window !== "undefined") {
    try {
      window.addEventListener(
        "test",
        /** @type {?} */
        null,
        Object.defineProperty({}, "passive", {
          get: function() {
            return supportsPassiveEvents = true;
          }
        })
      );
    } finally {
      supportsPassiveEvents = supportsPassiveEvents || false;
    }
  }
  return supportsPassiveEvents;
}
function normalizePassiveListenerOptions(options) {
  return supportsPassiveEventListeners() ? options : !!options.capture;
}
var RtlScrollAxisType = {
  /**
   * scrollLeft is 0 when scrolled all the way left and (scrollWidth - clientWidth) when scrolled
   * all the way right.
   */
  NORMAL: 0,
  /**
   * scrollLeft is -(scrollWidth - clientWidth) when scrolled all the way left and 0 when scrolled
   * all the way right.
   */
  NEGATED: 1,
  /**
   * scrollLeft is (scrollWidth - clientWidth) when scrolled all the way left and 0 when scrolled
   * all the way right.
   */
  INVERTED: 2
};
RtlScrollAxisType[RtlScrollAxisType.NORMAL] = "NORMAL";
RtlScrollAxisType[RtlScrollAxisType.NEGATED] = "NEGATED";
RtlScrollAxisType[RtlScrollAxisType.INVERTED] = "INVERTED";
var rtlScrollAxisType;
function supportsScrollBehavior() {
  return !!(typeof document == "object" && "scrollBehavior" in /** @type {?} */
  document.documentElement.style);
}
function getRtlScrollAxisType() {
  if (typeof document !== "object" || !document) {
    return RtlScrollAxisType.NORMAL;
  }
  if (!rtlScrollAxisType) {
    var scrollContainer = document.createElement("div");
    var containerStyle = scrollContainer.style;
    scrollContainer.dir = "rtl";
    containerStyle.height = "1px";
    containerStyle.width = "1px";
    containerStyle.overflow = "auto";
    containerStyle.visibility = "hidden";
    containerStyle.pointerEvents = "none";
    containerStyle.position = "absolute";
    var content = document.createElement("div");
    var contentStyle = content.style;
    contentStyle.width = "2px";
    contentStyle.height = "1px";
    scrollContainer.appendChild(content);
    document.body.appendChild(scrollContainer);
    rtlScrollAxisType = RtlScrollAxisType.NORMAL;
    if (scrollContainer.scrollLeft === 0) {
      scrollContainer.scrollLeft = 1;
      rtlScrollAxisType = scrollContainer.scrollLeft === 0 ? RtlScrollAxisType.NEGATED : RtlScrollAxisType.INVERTED;
    }
    /** @type {?} */
    scrollContainer.parentNode.removeChild(scrollContainer);
  }
  return rtlScrollAxisType;
}
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
var DIR_DOCUMENT = new InjectionToken("cdk-dir-doc", {
  providedIn: "root",
  factory: DIR_DOCUMENT_FACTORY
});
function DIR_DOCUMENT_FACTORY() {
  return inject(DOCUMENT);
}
var Directionality = (
  /** @class */
  (function() {
    function Directionality2(_document) {
      this.value = "ltr";
      this.change = new EventEmitter();
      if (_document) {
        var bodyDir = _document.body ? _document.body.dir : null;
        var htmlDir = _document.documentElement ? _document.documentElement.dir : null;
        var value = bodyDir || htmlDir;
        this.value = value === "ltr" || value === "rtl" ? value : "ltr";
      }
    }
    Directionality2.prototype.ngOnDestroy = /**
    * @return {?}
    */
    function() {
      this.change.complete();
    };
    Directionality2.decorators = [
      { type: Injectable, args: [{ providedIn: "root" }] }
    ];
    Directionality2.ctorParameters = function() {
      return [
        { type: void 0, decorators: [{ type: Optional }, { type: Inject, args: [DIR_DOCUMENT] }] }
      ];
    };
    Directionality2.ngInjectableDef = defineInjectable({ factory: function Directionality_Factory() {
      return new Directionality2(inject(DIR_DOCUMENT, 8));
    }, token: Directionality2, providedIn: "root" });
    return Directionality2;
  })()
);
var Dir = (
  /** @class */
  (function() {
    function Dir2() {
      this._dir = "ltr";
      this._isInitialized = false;
      this.change = new EventEmitter();
    }
    Object.defineProperty(Dir2.prototype, "dir", {
      /** @docs-private */
      get: (
        /**
        * \@docs-private
        * @return {?}
        */
        function() {
          return this._dir;
        }
      ),
      set: (
        /**
        * @param {?} value
        * @return {?}
        */
        function(value) {
          var old = this._dir;
          var normalizedValue = value ? value.toLowerCase() : value;
          this._rawDir = value;
          this._dir = normalizedValue === "ltr" || normalizedValue === "rtl" ? normalizedValue : "ltr";
          if (old !== this._dir && this._isInitialized) {
            this.change.emit(this._dir);
          }
        }
      ),
      enumerable: true,
      configurable: true
    });
    Object.defineProperty(Dir2.prototype, "value", {
      /** Current layout direction of the element. */
      get: (
        /**
        * Current layout direction of the element.
        * @return {?}
        */
        function() {
          return this.dir;
        }
      ),
      enumerable: true,
      configurable: true
    });
    Dir2.prototype.ngAfterContentInit = /**
    * Initialize once default value has been set.
    * @return {?}
    */
    function() {
      this._isInitialized = true;
    };
    Dir2.prototype.ngOnDestroy = /**
    * @return {?}
    */
    function() {
      this.change.complete();
    };
    Dir2.decorators = [
      { type: Directive, args: [{
        selector: "[dir]",
        providers: [{ provide: Directionality, useExisting: Dir2 }],
        host: { "[attr.dir]": "_rawDir" },
        exportAs: "dir"
      }] }
    ];
    Dir2.propDecorators = {
      change: [{ type: Output, args: ["dirChange"] }],
      dir: [{ type: Input }]
    };
    return Dir2;
  })()
);
var BidiModule = (
  /** @class */
  (function() {
    function BidiModule2() {
    }
    BidiModule2.decorators = [
      { type: NgModule, args: [{
        exports: [Dir],
        declarations: [Dir]
      }] }
    ];
    return BidiModule2;
  })()
);
/*! *****************************************************************************
Copyright (c) Microsoft Corporation.

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
***************************************************************************** */
var extendStatics = function(d, b) {
  extendStatics = Object.setPrototypeOf || { __proto__: [] } instanceof Array && function(d2, b2) {
    d2.__proto__ = b2;
  } || function(d2, b2) {
    for (var p in b2) if (b2.hasOwnProperty(p)) d2[p] = b2[p];
  };
  return extendStatics(d, b);
};
function __extends(d, b) {
  extendStatics(d, b);
  function __() {
    this.constructor = d;
  }
  d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
}
var __assign$1 = function() {
  __assign$1 = Object.assign || function __assign2(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
      s = arguments[i];
      for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
    }
    return t;
  };
  return __assign$1.apply(this, arguments);
};
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
var DataSource = (
  /** @class */
  /* @__PURE__ */ (function() {
    function DataSource2() {
    }
    return DataSource2;
  })()
);
function isDataSource(value) {
  return value && typeof value.connect === "function";
}
var ArrayDataSource = (
  /** @class */
  (function(_super) {
    __extends(ArrayDataSource2, _super);
    function ArrayDataSource2(_data) {
      var _this = _super.call(this) || this;
      _this._data = _data;
      return _this;
    }
    ArrayDataSource2.prototype.connect = /**
    * @return {?}
    */
    function() {
      return this._data instanceof Observable ? this._data : of(this._data);
    };
    ArrayDataSource2.prototype.disconnect = /**
    * @return {?}
    */
    function() {
    };
    return ArrayDataSource2;
  })(DataSource)
);
(function() {
  function SelectionModel(_multiple, initiallySelectedValues, _emitChanges) {
    if (_multiple === void 0) {
      _multiple = false;
    }
    if (_emitChanges === void 0) {
      _emitChanges = true;
    }
    var _this = this;
    this._multiple = _multiple;
    this._emitChanges = _emitChanges;
    this._selection = /* @__PURE__ */ new Set();
    this._deselectedToEmit = [];
    this._selectedToEmit = [];
    this.changed = new Subject();
    this.onChange = this.changed;
    if (initiallySelectedValues && initiallySelectedValues.length) {
      if (_multiple) {
        initiallySelectedValues.forEach(function(value) {
          return _this._markSelected(value);
        });
      } else {
        this._markSelected(initiallySelectedValues[0]);
      }
      this._selectedToEmit.length = 0;
    }
  }
  Object.defineProperty(SelectionModel.prototype, "selected", {
    /** Selected values. */
    get: (
      /**
      * Selected values.
      * @return {?}
      */
      function() {
        if (!this._selected) {
          this._selected = Array.from(this._selection.values());
        }
        return this._selected;
      }
    ),
    enumerable: true,
    configurable: true
  });
  SelectionModel.prototype.select = /**
  * Selects a value or an array of values.
  * @param {...?} values
  * @return {?}
  */
  function() {
    var _this = this;
    var values = [];
    for (var _i = 0; _i < arguments.length; _i++) {
      values[_i] = arguments[_i];
    }
    this._verifyValueAssignment(values);
    values.forEach(function(value) {
      return _this._markSelected(value);
    });
    this._emitChangeEvent();
  };
  SelectionModel.prototype.deselect = /**
  * Deselects a value or an array of values.
  * @param {...?} values
  * @return {?}
  */
  function() {
    var _this = this;
    var values = [];
    for (var _i = 0; _i < arguments.length; _i++) {
      values[_i] = arguments[_i];
    }
    this._verifyValueAssignment(values);
    values.forEach(function(value) {
      return _this._unmarkSelected(value);
    });
    this._emitChangeEvent();
  };
  SelectionModel.prototype.toggle = /**
  * Toggles a value between selected and deselected.
  * @param {?} value
  * @return {?}
  */
  function(value) {
    this.isSelected(value) ? this.deselect(value) : this.select(value);
  };
  SelectionModel.prototype.clear = /**
  * Clears all of the selected values.
  * @return {?}
  */
  function() {
    this._unmarkAll();
    this._emitChangeEvent();
  };
  SelectionModel.prototype.isSelected = /**
  * Determines whether a value is selected.
  * @param {?} value
  * @return {?}
  */
  function(value) {
    return this._selection.has(value);
  };
  SelectionModel.prototype.isEmpty = /**
  * Determines whether the model does not have a value.
  * @return {?}
  */
  function() {
    return this._selection.size === 0;
  };
  SelectionModel.prototype.hasValue = /**
  * Determines whether the model has a value.
  * @return {?}
  */
  function() {
    return !this.isEmpty();
  };
  SelectionModel.prototype.sort = /**
  * Sorts the selected values based on a predicate function.
  * @param {?=} predicate
  * @return {?}
  */
  function(predicate) {
    if (this._multiple && this.selected) {
      /** @type {?} */
      this._selected.sort(predicate);
    }
  };
  SelectionModel.prototype.isMultipleSelection = /**
  * Gets whether multiple values can be selected.
  * @return {?}
  */
  function() {
    return this._multiple;
  };
  SelectionModel.prototype._emitChangeEvent = /**
  * Emits a change event and clears the records of selected and deselected values.
  * @private
  * @return {?}
  */
  function() {
    this._selected = null;
    if (this._selectedToEmit.length || this._deselectedToEmit.length) {
      this.changed.next({
        source: this,
        added: this._selectedToEmit,
        removed: this._deselectedToEmit
      });
      this._deselectedToEmit = [];
      this._selectedToEmit = [];
    }
  };
  SelectionModel.prototype._markSelected = /**
  * Selects a value.
  * @private
  * @param {?} value
  * @return {?}
  */
  function(value) {
    if (!this.isSelected(value)) {
      if (!this._multiple) {
        this._unmarkAll();
      }
      this._selection.add(value);
      if (this._emitChanges) {
        this._selectedToEmit.push(value);
      }
    }
  };
  SelectionModel.prototype._unmarkSelected = /**
  * Deselects a value.
  * @private
  * @param {?} value
  * @return {?}
  */
  function(value) {
    if (this.isSelected(value)) {
      this._selection.delete(value);
      if (this._emitChanges) {
        this._deselectedToEmit.push(value);
      }
    }
  };
  SelectionModel.prototype._unmarkAll = /**
  * Clears out the selected values.
  * @private
  * @return {?}
  */
  function() {
    var _this = this;
    if (!this.isEmpty()) {
      this._selection.forEach(function(value) {
        return _this._unmarkSelected(value);
      });
    }
  };
  SelectionModel.prototype._verifyValueAssignment = /**
  * Verifies the value assignment and throws an error if the specified value array is
  * including multiple values while the selection model is not supporting multiple values.
  * @private
  * @param {?} values
  * @return {?}
  */
  function(values) {
    if (values.length > 1 && !this._multiple) {
      throw getMultipleValuesInSingleSelectionError();
    }
  };
  return SelectionModel;
})();
function getMultipleValuesInSingleSelectionError() {
  return Error("Cannot pass multiple values into SelectionModel with single-value mode.");
}
(function() {
  function UniqueSelectionDispatcher() {
    this._listeners = [];
  }
  UniqueSelectionDispatcher.prototype.notify = /**
  * Notify other items that selection for the given name has been set.
  * @param {?} id ID of the item.
  * @param {?} name Name of the item.
  * @return {?}
  */
  function(id, name) {
    for (var _i = 0, _a = this._listeners; _i < _a.length; _i++) {
      var listener = _a[_i];
      listener(id, name);
    }
  };
  UniqueSelectionDispatcher.prototype.listen = /**
  * Listen for future changes to item selection.
  * @param {?} listener
  * @return {?} Function used to deregister listener
  */
  function(listener) {
    var _this = this;
    this._listeners.push(listener);
    return function() {
      _this._listeners = _this._listeners.filter(function(registered) {
        return listener !== registered;
      });
    };
  };
  UniqueSelectionDispatcher.prototype.ngOnDestroy = /**
  * @return {?}
  */
  function() {
    this._listeners = [];
  };
  UniqueSelectionDispatcher.decorators = [
    { type: Injectable, args: [{ providedIn: "root" }] }
  ];
  UniqueSelectionDispatcher.ngInjectableDef = defineInjectable({ factory: function UniqueSelectionDispatcher_Factory() {
    return new UniqueSelectionDispatcher();
  }, token: UniqueSelectionDispatcher, providedIn: "root" });
  return UniqueSelectionDispatcher;
})();
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
var VIRTUAL_SCROLL_STRATEGY = new InjectionToken("VIRTUAL_SCROLL_STRATEGY");
var FixedSizeVirtualScrollStrategy = (
  /** @class */
  (function() {
    function FixedSizeVirtualScrollStrategy2(itemSize, minBufferPx, maxBufferPx) {
      this._scrolledIndexChange = new Subject();
      this.scrolledIndexChange = this._scrolledIndexChange.pipe(distinctUntilChanged());
      this._viewport = null;
      this._itemSize = itemSize;
      this._minBufferPx = minBufferPx;
      this._maxBufferPx = maxBufferPx;
    }
    FixedSizeVirtualScrollStrategy2.prototype.attach = /**
    * Attaches this scroll strategy to a viewport.
    * @param {?} viewport The viewport to attach this strategy to.
    * @return {?}
    */
    function(viewport2) {
      this._viewport = viewport2;
      this._updateTotalContentSize();
      this._updateRenderedRange();
    };
    FixedSizeVirtualScrollStrategy2.prototype.detach = /**
    * Detaches this scroll strategy from the currently attached viewport.
    * @return {?}
    */
    function() {
      this._scrolledIndexChange.complete();
      this._viewport = null;
    };
    FixedSizeVirtualScrollStrategy2.prototype.updateItemAndBufferSize = /**
    * Update the item size and buffer size.
    * @param {?} itemSize The size of the items in the virtually scrolling list.
    * @param {?} minBufferPx The minimum amount of buffer (in pixels) before needing to render more
    * @param {?} maxBufferPx The amount of buffer (in pixels) to render when rendering more.
    * @return {?}
    */
    function(itemSize, minBufferPx, maxBufferPx) {
      if (maxBufferPx < minBufferPx) {
        throw Error("CDK virtual scroll: maxBufferPx must be greater than or equal to minBufferPx");
      }
      this._itemSize = itemSize;
      this._minBufferPx = minBufferPx;
      this._maxBufferPx = maxBufferPx;
      this._updateTotalContentSize();
      this._updateRenderedRange();
    };
    FixedSizeVirtualScrollStrategy2.prototype.onContentScrolled = /**
    * \@docs-private Implemented as part of VirtualScrollStrategy.
    * @return {?}
    */
    function() {
      this._updateRenderedRange();
    };
    FixedSizeVirtualScrollStrategy2.prototype.onDataLengthChanged = /**
    * \@docs-private Implemented as part of VirtualScrollStrategy.
    * @return {?}
    */
    function() {
      this._updateTotalContentSize();
      this._updateRenderedRange();
    };
    FixedSizeVirtualScrollStrategy2.prototype.onContentRendered = /**
    * \@docs-private Implemented as part of VirtualScrollStrategy.
    * @return {?}
    */
    function() {
    };
    FixedSizeVirtualScrollStrategy2.prototype.onRenderedOffsetChanged = /**
    * \@docs-private Implemented as part of VirtualScrollStrategy.
    * @return {?}
    */
    function() {
    };
    FixedSizeVirtualScrollStrategy2.prototype.scrollToIndex = /**
    * Scroll to the offset for the given index.
    * @param {?} index The index of the element to scroll to.
    * @param {?} behavior The ScrollBehavior to use when scrolling.
    * @return {?}
    */
    function(index, behavior) {
      if (this._viewport) {
        this._viewport.scrollToOffset(index * this._itemSize, behavior);
      }
    };
    FixedSizeVirtualScrollStrategy2.prototype._updateTotalContentSize = /**
    * Update the viewport's total content size.
    * @private
    * @return {?}
    */
    function() {
      if (!this._viewport) {
        return;
      }
      this._viewport.setTotalContentSize(this._viewport.getDataLength() * this._itemSize);
    };
    FixedSizeVirtualScrollStrategy2.prototype._updateRenderedRange = /**
    * Update the viewport's rendered range.
    * @private
    * @return {?}
    */
    function() {
      if (!this._viewport) {
        return;
      }
      var scrollOffset = this._viewport.measureScrollOffset();
      var firstVisibleIndex = scrollOffset / this._itemSize;
      var renderedRange = this._viewport.getRenderedRange();
      var newRange = { start: renderedRange.start, end: renderedRange.end };
      var viewportSize = this._viewport.getViewportSize();
      var dataLength = this._viewport.getDataLength();
      var startBuffer = scrollOffset - newRange.start * this._itemSize;
      if (startBuffer < this._minBufferPx && newRange.start != 0) {
        var expandStart = Math.ceil((this._maxBufferPx - startBuffer) / this._itemSize);
        newRange.start = Math.max(0, newRange.start - expandStart);
        newRange.end = Math.min(dataLength, Math.ceil(firstVisibleIndex + (viewportSize + this._minBufferPx) / this._itemSize));
      } else {
        var endBuffer = newRange.end * this._itemSize - (scrollOffset + viewportSize);
        if (endBuffer < this._minBufferPx && newRange.end != dataLength) {
          var expandEnd = Math.ceil((this._maxBufferPx - endBuffer) / this._itemSize);
          if (expandEnd > 0) {
            newRange.end = Math.min(dataLength, newRange.end + expandEnd);
            newRange.start = Math.max(0, Math.floor(firstVisibleIndex - this._minBufferPx / this._itemSize));
          }
        }
      }
      this._viewport.setRenderedRange(newRange);
      this._viewport.setRenderedContentOffset(this._itemSize * newRange.start);
      this._scrolledIndexChange.next(Math.floor(firstVisibleIndex));
    };
    return FixedSizeVirtualScrollStrategy2;
  })()
);
function _fixedSizeVirtualScrollStrategyFactory(fixedSizeDir) {
  return fixedSizeDir._scrollStrategy;
}
var CdkFixedSizeVirtualScroll = (
  /** @class */
  (function() {
    function CdkFixedSizeVirtualScroll2() {
      this._itemSize = 20;
      this._minBufferPx = 100;
      this._maxBufferPx = 200;
      this._scrollStrategy = new FixedSizeVirtualScrollStrategy(this.itemSize, this.minBufferPx, this.maxBufferPx);
    }
    Object.defineProperty(CdkFixedSizeVirtualScroll2.prototype, "itemSize", {
      /** The size of the items in the list (in pixels). */
      get: (
        /**
        * The size of the items in the list (in pixels).
        * @return {?}
        */
        function() {
          return this._itemSize;
        }
      ),
      set: (
        /**
        * @param {?} value
        * @return {?}
        */
        function(value) {
          this._itemSize = coerceNumberProperty(value);
        }
      ),
      enumerable: true,
      configurable: true
    });
    Object.defineProperty(CdkFixedSizeVirtualScroll2.prototype, "minBufferPx", {
      /**
       * The minimum amount of buffer rendered beyond the viewport (in pixels).
       * If the amount of buffer dips below this number, more items will be rendered. Defaults to 100px.
       */
      get: (
        /**
        * The minimum amount of buffer rendered beyond the viewport (in pixels).
        * If the amount of buffer dips below this number, more items will be rendered. Defaults to 100px.
        * @return {?}
        */
        function() {
          return this._minBufferPx;
        }
      ),
      set: (
        /**
        * @param {?} value
        * @return {?}
        */
        function(value) {
          this._minBufferPx = coerceNumberProperty(value);
        }
      ),
      enumerable: true,
      configurable: true
    });
    Object.defineProperty(CdkFixedSizeVirtualScroll2.prototype, "maxBufferPx", {
      /**
       * The number of pixels worth of buffer to render for when rendering new items. Defaults to 200px.
       */
      get: (
        /**
        * The number of pixels worth of buffer to render for when rendering new items. Defaults to 200px.
        * @return {?}
        */
        function() {
          return this._maxBufferPx;
        }
      ),
      set: (
        /**
        * @param {?} value
        * @return {?}
        */
        function(value) {
          this._maxBufferPx = coerceNumberProperty(value);
        }
      ),
      enumerable: true,
      configurable: true
    });
    CdkFixedSizeVirtualScroll2.prototype.ngOnChanges = /**
    * @return {?}
    */
    function() {
      this._scrollStrategy.updateItemAndBufferSize(this.itemSize, this.minBufferPx, this.maxBufferPx);
    };
    CdkFixedSizeVirtualScroll2.decorators = [
      { type: Directive, args: [{
        selector: "cdk-virtual-scroll-viewport[itemSize]",
        providers: [{
          provide: VIRTUAL_SCROLL_STRATEGY,
          useFactory: _fixedSizeVirtualScrollStrategyFactory,
          deps: [forwardRef(function() {
            return CdkFixedSizeVirtualScroll2;
          })]
        }]
      }] }
    ];
    CdkFixedSizeVirtualScroll2.propDecorators = {
      itemSize: [{ type: Input }],
      minBufferPx: [{ type: Input }],
      maxBufferPx: [{ type: Input }]
    };
    return CdkFixedSizeVirtualScroll2;
  })()
);
var DEFAULT_SCROLL_TIME = 20;
var ScrollDispatcher = (
  /** @class */
  (function() {
    function ScrollDispatcher2(_ngZone, _platform) {
      this._ngZone = _ngZone;
      this._platform = _platform;
      this._scrolled = new Subject();
      this._globalSubscription = null;
      this._scrolledCount = 0;
      this.scrollContainers = /* @__PURE__ */ new Map();
    }
    ScrollDispatcher2.prototype.register = /**
    * Registers a scrollable instance with the service and listens for its scrolled events. When the
    * scrollable is scrolled, the service emits the event to its scrolled observable.
    * @param {?} scrollable Scrollable instance to be registered.
    * @return {?}
    */
    function(scrollable) {
      var _this = this;
      if (!this.scrollContainers.has(scrollable)) {
        this.scrollContainers.set(scrollable, scrollable.elementScrolled().subscribe(function() {
          return _this._scrolled.next(scrollable);
        }));
      }
    };
    ScrollDispatcher2.prototype.deregister = /**
    * Deregisters a Scrollable reference and unsubscribes from its scroll event observable.
    * @param {?} scrollable Scrollable instance to be deregistered.
    * @return {?}
    */
    function(scrollable) {
      var scrollableReference = this.scrollContainers.get(scrollable);
      if (scrollableReference) {
        scrollableReference.unsubscribe();
        this.scrollContainers.delete(scrollable);
      }
    };
    ScrollDispatcher2.prototype.scrolled = /**
    * Returns an observable that emits an event whenever any of the registered Scrollable
    * references (or window, document, or body) fire a scrolled event. Can provide a time in ms
    * to override the default "throttle" time.
    *
    * **Note:** in order to avoid hitting change detection for every scroll event,
    * all of the events emitted from this stream will be run outside the Angular zone.
    * If you need to update any data bindings as a result of a scroll event, you have
    * to run the callback using `NgZone.run`.
    * @param {?=} auditTimeInMs
    * @return {?}
    */
    function(auditTimeInMs) {
      var _this = this;
      if (auditTimeInMs === void 0) {
        auditTimeInMs = DEFAULT_SCROLL_TIME;
      }
      if (!this._platform.isBrowser) {
        return of();
      }
      return new Observable(function(observer) {
        if (!_this._globalSubscription) {
          _this._addGlobalListener();
        }
        var subscription = auditTimeInMs > 0 ? _this._scrolled.pipe(auditTime(auditTimeInMs)).subscribe(observer) : _this._scrolled.subscribe(observer);
        _this._scrolledCount++;
        return function() {
          subscription.unsubscribe();
          _this._scrolledCount--;
          if (!_this._scrolledCount) {
            _this._removeGlobalListener();
          }
        };
      });
    };
    ScrollDispatcher2.prototype.ngOnDestroy = /**
    * @return {?}
    */
    function() {
      var _this = this;
      this._removeGlobalListener();
      this.scrollContainers.forEach(function(_, container) {
        return _this.deregister(container);
      });
      this._scrolled.complete();
    };
    ScrollDispatcher2.prototype.ancestorScrolled = /**
    * Returns an observable that emits whenever any of the
    * scrollable ancestors of an element are scrolled.
    * @param {?} elementRef Element whose ancestors to listen for.
    * @param {?=} auditTimeInMs Time to throttle the scroll events.
    * @return {?}
    */
    function(elementRef, auditTimeInMs) {
      var ancestors = this.getAncestorScrollContainers(elementRef);
      return this.scrolled(auditTimeInMs).pipe(filter(function(target) {
        return !target || ancestors.indexOf(target) > -1;
      }));
    };
    ScrollDispatcher2.prototype.getAncestorScrollContainers = /**
    * Returns all registered Scrollables that contain the provided element.
    * @param {?} elementRef
    * @return {?}
    */
    function(elementRef) {
      var _this = this;
      var scrollingContainers = [];
      this.scrollContainers.forEach(function(_subscription, scrollable) {
        if (_this._scrollableContainsElement(scrollable, elementRef)) {
          scrollingContainers.push(scrollable);
        }
      });
      return scrollingContainers;
    };
    ScrollDispatcher2.prototype._scrollableContainsElement = /**
    * Returns true if the element is contained within the provided Scrollable.
    * @private
    * @param {?} scrollable
    * @param {?} elementRef
    * @return {?}
    */
    function(scrollable, elementRef) {
      var element = elementRef.nativeElement;
      var scrollableElement = scrollable.getElementRef().nativeElement;
      do {
        if (element == scrollableElement) {
          return true;
        }
      } while (element = /** @type {?} */
      element.parentElement);
      return false;
    };
    ScrollDispatcher2.prototype._addGlobalListener = /**
    * Sets up the global scroll listeners.
    * @private
    * @return {?}
    */
    function() {
      var _this = this;
      this._globalSubscription = this._ngZone.runOutsideAngular(function() {
        return fromEvent(window.document, "scroll").subscribe(function() {
          return _this._scrolled.next();
        });
      });
    };
    ScrollDispatcher2.prototype._removeGlobalListener = /**
    * Cleans up the global scroll listener.
    * @private
    * @return {?}
    */
    function() {
      if (this._globalSubscription) {
        this._globalSubscription.unsubscribe();
        this._globalSubscription = null;
      }
    };
    ScrollDispatcher2.decorators = [
      { type: Injectable, args: [{ providedIn: "root" }] }
    ];
    ScrollDispatcher2.ctorParameters = function() {
      return [
        { type: NgZone },
        { type: Platform }
      ];
    };
    ScrollDispatcher2.ngInjectableDef = defineInjectable({ factory: function ScrollDispatcher_Factory() {
      return new ScrollDispatcher2(inject(NgZone), inject(Platform));
    }, token: ScrollDispatcher2, providedIn: "root" });
    return ScrollDispatcher2;
  })()
);
({
  deps: [[new Optional(), new SkipSelf(), ScrollDispatcher], NgZone, Platform]
});
var CdkScrollable = (
  /** @class */
  (function() {
    function CdkScrollable2(elementRef, scrollDispatcher, ngZone, dir) {
      var _this = this;
      this.elementRef = elementRef;
      this.scrollDispatcher = scrollDispatcher;
      this.ngZone = ngZone;
      this.dir = dir;
      this._destroyed = new Subject();
      this._elementScrolled = new Observable(function(observer) {
        return _this.ngZone.runOutsideAngular(function() {
          return fromEvent(_this.elementRef.nativeElement, "scroll").pipe(takeUntil(_this._destroyed)).subscribe(observer);
        });
      });
    }
    CdkScrollable2.prototype.ngOnInit = /**
    * @return {?}
    */
    function() {
      this.scrollDispatcher.register(this);
    };
    CdkScrollable2.prototype.ngOnDestroy = /**
    * @return {?}
    */
    function() {
      this.scrollDispatcher.deregister(this);
      this._destroyed.next();
      this._destroyed.complete();
    };
    CdkScrollable2.prototype.elementScrolled = /**
    * Returns observable that emits when a scroll event is fired on the host element.
    * @return {?}
    */
    function() {
      return this._elementScrolled;
    };
    CdkScrollable2.prototype.getElementRef = /**
    * Gets the ElementRef for the viewport.
    * @return {?}
    */
    function() {
      return this.elementRef;
    };
    CdkScrollable2.prototype.scrollTo = /**
    * Scrolls to the specified offsets. This is a normalized version of the browser's native scrollTo
    * method, since browsers are not consistent about what scrollLeft means in RTL. For this method
    * left and right always refer to the left and right side of the scrolling container irrespective
    * of the layout direction. start and end refer to left and right in an LTR context and vice-versa
    * in an RTL context.
    * @param {?} options specified the offsets to scroll to.
    * @return {?}
    */
    function(options) {
      var el = this.elementRef.nativeElement;
      var isRtl = this.dir && this.dir.value == "rtl";
      options.left = options.left == null ? isRtl ? options.end : options.start : options.left;
      options.right = options.right == null ? isRtl ? options.start : options.end : options.right;
      if (options.bottom != null) {
        /** @type {?} */
        options.top = el.scrollHeight - el.clientHeight - options.bottom;
      }
      if (isRtl && getRtlScrollAxisType() != RtlScrollAxisType.NORMAL) {
        if (options.left != null) {
          /** @type {?} */
          options.right = el.scrollWidth - el.clientWidth - options.left;
        }
        if (getRtlScrollAxisType() == RtlScrollAxisType.INVERTED) {
          options.left = options.right;
        } else if (getRtlScrollAxisType() == RtlScrollAxisType.NEGATED) {
          options.left = options.right ? -options.right : options.right;
        }
      } else {
        if (options.right != null) {
          /** @type {?} */
          options.left = el.scrollWidth - el.clientWidth - options.right;
        }
      }
      this._applyScrollToOptions(options);
    };
    CdkScrollable2.prototype._applyScrollToOptions = /**
    * @private
    * @param {?} options
    * @return {?}
    */
    function(options) {
      var el = this.elementRef.nativeElement;
      if (supportsScrollBehavior()) {
        el.scrollTo(options);
      } else {
        if (options.top != null) {
          el.scrollTop = options.top;
        }
        if (options.left != null) {
          el.scrollLeft = options.left;
        }
      }
    };
    CdkScrollable2.prototype.measureScrollOffset = /**
    * Measures the scroll offset relative to the specified edge of the viewport. This method can be
    * used instead of directly checking scrollLeft or scrollTop, since browsers are not consistent
    * about what scrollLeft means in RTL. The values returned by this method are normalized such that
    * left and right always refer to the left and right side of the scrolling container irrespective
    * of the layout direction. start and end refer to left and right in an LTR context and vice-versa
    * in an RTL context.
    * @param {?} from The edge to measure from.
    * @return {?}
    */
    function(from2) {
      var LEFT = "left";
      var RIGHT = "right";
      var el = this.elementRef.nativeElement;
      if (from2 == "top") {
        return el.scrollTop;
      }
      if (from2 == "bottom") {
        return el.scrollHeight - el.clientHeight - el.scrollTop;
      }
      var isRtl = this.dir && this.dir.value == "rtl";
      if (from2 == "start") {
        from2 = isRtl ? RIGHT : LEFT;
      } else if (from2 == "end") {
        from2 = isRtl ? LEFT : RIGHT;
      }
      if (isRtl && getRtlScrollAxisType() == RtlScrollAxisType.INVERTED) {
        if (from2 == LEFT) {
          return el.scrollWidth - el.clientWidth - el.scrollLeft;
        } else {
          return el.scrollLeft;
        }
      } else if (isRtl && getRtlScrollAxisType() == RtlScrollAxisType.NEGATED) {
        if (from2 == LEFT) {
          return el.scrollLeft + el.scrollWidth - el.clientWidth;
        } else {
          return -el.scrollLeft;
        }
      } else {
        if (from2 == LEFT) {
          return el.scrollLeft;
        } else {
          return el.scrollWidth - el.clientWidth - el.scrollLeft;
        }
      }
    };
    CdkScrollable2.decorators = [
      { type: Directive, args: [{
        selector: "[cdk-scrollable], [cdkScrollable]"
      }] }
    ];
    CdkScrollable2.ctorParameters = function() {
      return [
        { type: ElementRef },
        { type: ScrollDispatcher },
        { type: NgZone },
        { type: Directionality, decorators: [{ type: Optional }] }
      ];
    };
    return CdkScrollable2;
  })()
);
function rangesEqual(r1, r2) {
  return r1.start == r2.start && r1.end == r2.end;
}
var SCROLL_SCHEDULER = typeof requestAnimationFrame !== "undefined" ? animationFrameScheduler : asapScheduler;
var CdkVirtualScrollViewport = (
  /** @class */
  (function(_super) {
    __extends(CdkVirtualScrollViewport2, _super);
    function CdkVirtualScrollViewport2(elementRef, _changeDetectorRef, ngZone, _scrollStrategy, dir, scrollDispatcher) {
      var _this = _super.call(this, elementRef, scrollDispatcher, ngZone, dir) || this;
      _this.elementRef = elementRef;
      _this._changeDetectorRef = _changeDetectorRef;
      _this._scrollStrategy = _scrollStrategy;
      _this._detachedSubject = new Subject();
      _this._renderedRangeSubject = new Subject();
      _this.orientation = "vertical";
      _this.scrolledIndexChange = new Observable(function(observer) {
        return _this._scrollStrategy.scrolledIndexChange.subscribe(function(index) {
          return Promise.resolve().then(function() {
            return _this.ngZone.run(function() {
              return observer.next(index);
            });
          });
        });
      });
      _this.renderedRangeStream = _this._renderedRangeSubject.asObservable();
      _this._totalContentSizeTransform = "";
      _this._totalContentSize = 0;
      _this._renderedRange = { start: 0, end: 0 };
      _this._dataLength = 0;
      _this._viewportSize = 0;
      _this._renderedContentOffset = 0;
      _this._renderedContentOffsetNeedsRewrite = false;
      _this._isChangeDetectionPending = false;
      _this._runAfterChangeDetection = [];
      if (!_scrollStrategy) {
        throw Error('Error: cdk-virtual-scroll-viewport requires the "itemSize" property to be set.');
      }
      return _this;
    }
    CdkVirtualScrollViewport2.prototype.ngOnInit = /**
    * @return {?}
    */
    function() {
      var _this = this;
      _super.prototype.ngOnInit.call(this);
      this.ngZone.runOutsideAngular(function() {
        return Promise.resolve().then(function() {
          _this._measureViewportSize();
          _this._scrollStrategy.attach(_this);
          _this.elementScrolled().pipe(
            // Start off with a fake scroll event so we properly detect our initial position.
            startWith(
              /** @type {?} */
              null
            ),
            // Collect multiple events into one until the next animation frame. This way if
            // there are multiple scroll events in the same frame we only need to recheck
            // our layout once.
            auditTime(0, SCROLL_SCHEDULER)
          ).subscribe(function() {
            return _this._scrollStrategy.onContentScrolled();
          });
          _this._markChangeDetectionNeeded();
        });
      });
    };
    CdkVirtualScrollViewport2.prototype.ngOnDestroy = /**
    * @return {?}
    */
    function() {
      this.detach();
      this._scrollStrategy.detach();
      this._renderedRangeSubject.complete();
      this._detachedSubject.complete();
      _super.prototype.ngOnDestroy.call(this);
    };
    CdkVirtualScrollViewport2.prototype.attach = /**
    * Attaches a `CdkVirtualForOf` to this viewport.
    * @param {?} forOf
    * @return {?}
    */
    function(forOf) {
      var _this = this;
      if (this._forOf) {
        throw Error("CdkVirtualScrollViewport is already attached.");
      }
      this.ngZone.runOutsideAngular(function() {
        _this._forOf = forOf;
        _this._forOf.dataStream.pipe(takeUntil(_this._detachedSubject)).subscribe(function(data) {
          var newLength = data.length;
          if (newLength !== _this._dataLength) {
            _this._dataLength = newLength;
            _this._scrollStrategy.onDataLengthChanged();
          }
          _this._doChangeDetection();
        });
      });
    };
    CdkVirtualScrollViewport2.prototype.detach = /**
    * Detaches the current `CdkVirtualForOf`.
    * @return {?}
    */
    function() {
      this._forOf = null;
      this._detachedSubject.next();
    };
    CdkVirtualScrollViewport2.prototype.getDataLength = /**
    * Gets the length of the data bound to this viewport (in number of items).
    * @return {?}
    */
    function() {
      return this._dataLength;
    };
    CdkVirtualScrollViewport2.prototype.getViewportSize = /**
    * Gets the size of the viewport (in pixels).
    * @return {?}
    */
    function() {
      return this._viewportSize;
    };
    CdkVirtualScrollViewport2.prototype.getRenderedRange = // TODO(mmalerba): This is technically out of sync with what's really rendered until a render
    // cycle happens. I'm being careful to only call it after the render cycle is complete and before
    // setting it to something else, but its error prone and should probably be split into
    // `pendingRange` and `renderedRange`, the latter reflecting whats actually in the DOM.
    /**
     * Get the current rendered range of items.
     * @return {?}
     */
    function() {
      return this._renderedRange;
    };
    CdkVirtualScrollViewport2.prototype.setTotalContentSize = /**
    * Sets the total size of all content (in pixels), including content that is not currently
    * rendered.
    * @param {?} size
    * @return {?}
    */
    function(size) {
      if (this._totalContentSize !== size) {
        this._totalContentSize = size;
        var axis = this.orientation == "horizontal" ? "X" : "Y";
        this._totalContentSizeTransform = "scale" + axis + "(" + this._totalContentSize + ")";
        this._markChangeDetectionNeeded();
      }
    };
    CdkVirtualScrollViewport2.prototype.setRenderedRange = /**
    * Sets the currently rendered range of indices.
    * @param {?} range
    * @return {?}
    */
    function(range) {
      var _this = this;
      if (!rangesEqual(this._renderedRange, range)) {
        this._renderedRangeSubject.next(this._renderedRange = range);
        this._markChangeDetectionNeeded(function() {
          return _this._scrollStrategy.onContentRendered();
        });
      }
    };
    CdkVirtualScrollViewport2.prototype.getOffsetToRenderedContentStart = /**
    * Gets the offset from the start of the viewport to the start of the rendered data (in pixels).
    * @return {?}
    */
    function() {
      return this._renderedContentOffsetNeedsRewrite ? null : this._renderedContentOffset;
    };
    CdkVirtualScrollViewport2.prototype.setRenderedContentOffset = /**
    * Sets the offset from the start of the viewport to either the start or end of the rendered data
    * (in pixels).
    * @param {?} offset
    * @param {?=} to
    * @return {?}
    */
    function(offset2, to) {
      var _this = this;
      if (to === void 0) {
        to = "to-start";
      }
      var isRtl = this.dir && this.dir.value == "rtl";
      var isHorizontal = this.orientation == "horizontal";
      var axis = isHorizontal ? "X" : "Y";
      var axisDirection = isHorizontal && isRtl ? -1 : 1;
      var transform = "translate" + axis + "(" + Number(axisDirection * offset2) + "px)";
      this._renderedContentOffset = offset2;
      if (to === "to-end") {
        transform += " translate" + axis + "(-100%)";
        this._renderedContentOffsetNeedsRewrite = true;
      }
      if (this._renderedContentTransform != transform) {
        this._renderedContentTransform = transform;
        this._markChangeDetectionNeeded(function() {
          if (_this._renderedContentOffsetNeedsRewrite) {
            _this._renderedContentOffset -= _this.measureRenderedContentSize();
            _this._renderedContentOffsetNeedsRewrite = false;
            _this.setRenderedContentOffset(_this._renderedContentOffset);
          } else {
            _this._scrollStrategy.onRenderedOffsetChanged();
          }
        });
      }
    };
    CdkVirtualScrollViewport2.prototype.scrollToOffset = /**
    * Scrolls to the given offset from the start of the viewport. Please note that this is not always
    * the same as setting `scrollTop` or `scrollLeft`. In a horizontal viewport with right-to-left
    * direction, this would be the equivalent of setting a fictional `scrollRight` property.
    * @param {?} offset The offset to scroll to.
    * @param {?=} behavior The ScrollBehavior to use when scrolling. Default is behavior is `auto`.
    * @return {?}
    */
    function(offset2, behavior) {
      if (behavior === void 0) {
        behavior = "auto";
      }
      var options = { behavior };
      if (this.orientation === "horizontal") {
        options.start = offset2;
      } else {
        options.top = offset2;
      }
      this.scrollTo(options);
    };
    CdkVirtualScrollViewport2.prototype.scrollToIndex = /**
    * Scrolls to the offset for the given index.
    * @param {?} index The index of the element to scroll to.
    * @param {?=} behavior The ScrollBehavior to use when scrolling. Default is behavior is `auto`.
    * @return {?}
    */
    function(index, behavior) {
      if (behavior === void 0) {
        behavior = "auto";
      }
      this._scrollStrategy.scrollToIndex(index, behavior);
    };
    CdkVirtualScrollViewport2.prototype.measureScrollOffset = /**
    * Gets the current scroll offset from the start of the viewport (in pixels).
    * @param {?=} from The edge to measure the offset from. Defaults to 'top' in vertical mode and 'start'
    *     in horizontal mode.
    * @return {?}
    */
    function(from2) {
      return _super.prototype.measureScrollOffset.call(this, from2 ? from2 : this.orientation === "horizontal" ? "start" : "top");
    };
    CdkVirtualScrollViewport2.prototype.measureRenderedContentSize = /**
    * Measure the combined size of all of the rendered items.
    * @return {?}
    */
    function() {
      var contentEl = this._contentWrapper.nativeElement;
      return this.orientation === "horizontal" ? contentEl.offsetWidth : contentEl.offsetHeight;
    };
    CdkVirtualScrollViewport2.prototype.measureRangeSize = /**
    * Measure the total combined size of the given range. Throws if the range includes items that are
    * not rendered.
    * @param {?} range
    * @return {?}
    */
    function(range) {
      if (!this._forOf) {
        return 0;
      }
      return this._forOf.measureRangeSize(range, this.orientation);
    };
    CdkVirtualScrollViewport2.prototype.checkViewportSize = /**
    * Update the viewport dimensions and re-render.
    * @return {?}
    */
    function() {
      this._measureViewportSize();
      this._scrollStrategy.onDataLengthChanged();
    };
    CdkVirtualScrollViewport2.prototype._measureViewportSize = /**
    * Measure the viewport size.
    * @private
    * @return {?}
    */
    function() {
      var viewportEl = this.elementRef.nativeElement;
      this._viewportSize = this.orientation === "horizontal" ? viewportEl.clientWidth : viewportEl.clientHeight;
    };
    CdkVirtualScrollViewport2.prototype._markChangeDetectionNeeded = /**
    * Queue up change detection to run.
    * @private
    * @param {?=} runAfter
    * @return {?}
    */
    function(runAfter) {
      var _this = this;
      if (runAfter) {
        this._runAfterChangeDetection.push(runAfter);
      }
      if (!this._isChangeDetectionPending) {
        this._isChangeDetectionPending = true;
        this.ngZone.runOutsideAngular(function() {
          return Promise.resolve().then(function() {
            _this._doChangeDetection();
          });
        });
      }
    };
    CdkVirtualScrollViewport2.prototype._doChangeDetection = /**
    * Run change detection.
    * @private
    * @return {?}
    */
    function() {
      var _this = this;
      this._isChangeDetectionPending = false;
      this.ngZone.run(function() {
        return _this._changeDetectorRef.markForCheck();
      });
      this._contentWrapper.nativeElement.style.transform = this._renderedContentTransform;
      var runAfterChangeDetection = this._runAfterChangeDetection;
      this._runAfterChangeDetection = [];
      for (var _i = 0, runAfterChangeDetection_1 = runAfterChangeDetection; _i < runAfterChangeDetection_1.length; _i++) {
        var fn2 = runAfterChangeDetection_1[_i];
        fn2();
      }
    };
    CdkVirtualScrollViewport2.decorators = [
      { type: Component, args: [{
        selector: "cdk-virtual-scroll-viewport",
        template: '<div #contentWrapper class="cdk-virtual-scroll-content-wrapper"><ng-content></ng-content></div><div class="cdk-virtual-scroll-spacer" [style.transform]="_totalContentSizeTransform"></div>',
        styles: ["cdk-virtual-scroll-viewport{display:block;position:relative;overflow:auto;contain:strict;transform:translateZ(0);will-change:scroll-position;-webkit-overflow-scrolling:touch}.cdk-virtual-scroll-content-wrapper{position:absolute;top:0;left:0;contain:content}[dir=rtl] .cdk-virtual-scroll-content-wrapper{right:0;left:auto}.cdk-virtual-scroll-orientation-horizontal .cdk-virtual-scroll-content-wrapper{min-height:100%}.cdk-virtual-scroll-orientation-horizontal .cdk-virtual-scroll-content-wrapper>dl:not([cdkVirtualFor]),.cdk-virtual-scroll-orientation-horizontal .cdk-virtual-scroll-content-wrapper>ol:not([cdkVirtualFor]),.cdk-virtual-scroll-orientation-horizontal .cdk-virtual-scroll-content-wrapper>table:not([cdkVirtualFor]),.cdk-virtual-scroll-orientation-horizontal .cdk-virtual-scroll-content-wrapper>ul:not([cdkVirtualFor]){padding-left:0;padding-right:0;margin-left:0;margin-right:0;border-left-width:0;border-right-width:0;outline:0}.cdk-virtual-scroll-orientation-vertical .cdk-virtual-scroll-content-wrapper{min-width:100%}.cdk-virtual-scroll-orientation-vertical .cdk-virtual-scroll-content-wrapper>dl:not([cdkVirtualFor]),.cdk-virtual-scroll-orientation-vertical .cdk-virtual-scroll-content-wrapper>ol:not([cdkVirtualFor]),.cdk-virtual-scroll-orientation-vertical .cdk-virtual-scroll-content-wrapper>table:not([cdkVirtualFor]),.cdk-virtual-scroll-orientation-vertical .cdk-virtual-scroll-content-wrapper>ul:not([cdkVirtualFor]){padding-top:0;padding-bottom:0;margin-top:0;margin-bottom:0;border-top-width:0;border-bottom-width:0;outline:0}.cdk-virtual-scroll-spacer{position:absolute;top:0;left:0;height:1px;width:1px;transform-origin:0 0}[dir=rtl] .cdk-virtual-scroll-spacer{right:0;left:auto;transform-origin:100% 0}"],
        host: {
          "class": "cdk-virtual-scroll-viewport",
          "[class.cdk-virtual-scroll-orientation-horizontal]": 'orientation === "horizontal"',
          "[class.cdk-virtual-scroll-orientation-vertical]": 'orientation !== "horizontal"'
        },
        encapsulation: ViewEncapsulation$1.None,
        changeDetection: ChangeDetectionStrategy.OnPush,
        providers: [{
          provide: CdkScrollable,
          useExisting: CdkVirtualScrollViewport2
        }]
      }] }
    ];
    CdkVirtualScrollViewport2.ctorParameters = function() {
      return [
        { type: ElementRef },
        { type: ChangeDetectorRef },
        { type: NgZone },
        { type: void 0, decorators: [{ type: Optional }, { type: Inject, args: [VIRTUAL_SCROLL_STRATEGY] }] },
        { type: Directionality, decorators: [{ type: Optional }] },
        { type: ScrollDispatcher }
      ];
    };
    CdkVirtualScrollViewport2.propDecorators = {
      orientation: [{ type: Input }],
      scrolledIndexChange: [{ type: Output }],
      _contentWrapper: [{ type: ViewChild, args: ["contentWrapper"] }]
    };
    return CdkVirtualScrollViewport2;
  })(CdkScrollable)
);
function getSize(orientation, node) {
  var el = (
    /** @type {?} */
    node
  );
  if (!el.getBoundingClientRect) {
    return 0;
  }
  var rect = el.getBoundingClientRect();
  return orientation == "horizontal" ? rect.width : rect.height;
}
var CdkVirtualForOf = (
  /** @class */
  (function() {
    function CdkVirtualForOf2(_viewContainerRef, _template, _differs, _viewport, ngZone) {
      var _this = this;
      this._viewContainerRef = _viewContainerRef;
      this._template = _template;
      this._differs = _differs;
      this._viewport = _viewport;
      this.viewChange = new Subject();
      this._dataSourceChanges = new Subject();
      this.cdkVirtualForTemplateCacheSize = 20;
      this.dataStream = this._dataSourceChanges.pipe(
        // Start off with null `DataSource`.
        startWith(
          /** @type {?} */
          null
        ),
        // Bundle up the previous and current data sources so we can work with both.
        pairwise(),
        // Use `_changeDataSource` to disconnect from the previous data source and connect to the
        // new one, passing back a stream of data changes which we run through `switchMap` to give
        // us a data stream that emits the latest data from whatever the current `DataSource` is.
        switchMap(function(_a) {
          var prev = _a[0], cur = _a[1];
          return _this._changeDataSource(prev, cur);
        }),
        // Replay the last emitted data when someone subscribes.
        shareReplay(1)
      );
      this._differ = null;
      this._templateCache = [];
      this._needsUpdate = false;
      this._destroyed = new Subject();
      this.dataStream.subscribe(function(data) {
        _this._data = data;
        _this._onRenderedDataChange();
      });
      this._viewport.renderedRangeStream.pipe(takeUntil(this._destroyed)).subscribe(function(range) {
        _this._renderedRange = range;
        ngZone.run(function() {
          return _this.viewChange.next(_this._renderedRange);
        });
        _this._onRenderedDataChange();
      });
      this._viewport.attach(this);
    }
    Object.defineProperty(CdkVirtualForOf2.prototype, "cdkVirtualForOf", {
      /** The DataSource to display. */
      get: (
        /**
        * The DataSource to display.
        * @return {?}
        */
        function() {
          return this._cdkVirtualForOf;
        }
      ),
      set: (
        /**
        * @param {?} value
        * @return {?}
        */
        function(value) {
          this._cdkVirtualForOf = value;
          var ds = isDataSource(value) ? value : (
            // Slice the value if its an NgIterable to ensure we're working with an array.
            new ArrayDataSource(value instanceof Observable ? value : Array.prototype.slice.call(value || []))
          );
          this._dataSourceChanges.next(ds);
        }
      ),
      enumerable: true,
      configurable: true
    });
    Object.defineProperty(CdkVirtualForOf2.prototype, "cdkVirtualForTrackBy", {
      /**
       * The `TrackByFunction` to use for tracking changes. The `TrackByFunction` takes the index and
       * the item and produces a value to be used as the item's identity when tracking changes.
       */
      get: (
        /**
        * The `TrackByFunction` to use for tracking changes. The `TrackByFunction` takes the index and
        * the item and produces a value to be used as the item's identity when tracking changes.
        * @return {?}
        */
        function() {
          return this._cdkVirtualForTrackBy;
        }
      ),
      set: (
        /**
        * @param {?} fn
        * @return {?}
        */
        function(fn2) {
          var _this = this;
          this._needsUpdate = true;
          this._cdkVirtualForTrackBy = fn2 ? function(index, item) {
            return fn2(index + (_this._renderedRange ? _this._renderedRange.start : 0), item);
          } : void 0;
        }
      ),
      enumerable: true,
      configurable: true
    });
    Object.defineProperty(CdkVirtualForOf2.prototype, "cdkVirtualForTemplate", {
      /** The template used to stamp out new elements. */
      set: (
        /**
        * The template used to stamp out new elements.
        * @param {?} value
        * @return {?}
        */
        function(value) {
          if (value) {
            this._needsUpdate = true;
            this._template = value;
          }
        }
      ),
      enumerable: true,
      configurable: true
    });
    CdkVirtualForOf2.prototype.measureRangeSize = /**
    * Measures the combined size (width for horizontal orientation, height for vertical) of all items
    * in the specified range. Throws an error if the range includes items that are not currently
    * rendered.
    * @param {?} range
    * @param {?} orientation
    * @return {?}
    */
    function(range, orientation) {
      if (range.start >= range.end) {
        return 0;
      }
      if (range.start < this._renderedRange.start || range.end > this._renderedRange.end) {
        throw Error("Error: attempted to measure an item that isn't rendered.");
      }
      var renderedStartIndex = range.start - this._renderedRange.start;
      var rangeLen = range.end - range.start;
      var totalSize = 0;
      var i = rangeLen;
      while (i--) {
        var view = (
          /** @type {?} */
          this._viewContainerRef.get(i + renderedStartIndex)
        );
        var j = view ? view.rootNodes.length : 0;
        while (j--) {
          totalSize += getSize(
            orientation,
            /** @type {?} */
            view.rootNodes[j]
          );
        }
      }
      return totalSize;
    };
    CdkVirtualForOf2.prototype.ngDoCheck = /**
    * @return {?}
    */
    function() {
      if (this._differ && this._needsUpdate) {
        var changes = this._differ.diff(this._renderedItems);
        if (!changes) {
          this._updateContext();
        } else {
          this._applyChanges(changes);
        }
        this._needsUpdate = false;
      }
    };
    CdkVirtualForOf2.prototype.ngOnDestroy = /**
    * @return {?}
    */
    function() {
      this._viewport.detach();
      this._dataSourceChanges.complete();
      this.viewChange.complete();
      this._destroyed.next();
      this._destroyed.complete();
      for (var _i = 0, _a = this._templateCache; _i < _a.length; _i++) {
        var view = _a[_i];
        view.destroy();
      }
    };
    CdkVirtualForOf2.prototype._onRenderedDataChange = /**
    * React to scroll state changes in the viewport.
    * @private
    * @return {?}
    */
    function() {
      if (!this._renderedRange) {
        return;
      }
      this._renderedItems = this._data.slice(this._renderedRange.start, this._renderedRange.end);
      if (!this._differ) {
        this._differ = this._differs.find(this._renderedItems).create(this.cdkVirtualForTrackBy);
      }
      this._needsUpdate = true;
    };
    CdkVirtualForOf2.prototype._changeDataSource = /**
    * Swap out one `DataSource` for another.
    * @private
    * @param {?} oldDs
    * @param {?} newDs
    * @return {?}
    */
    function(oldDs, newDs) {
      if (oldDs) {
        oldDs.disconnect(this);
      }
      this._needsUpdate = true;
      return newDs.connect(this);
    };
    CdkVirtualForOf2.prototype._updateContext = /**
    * Update the `CdkVirtualForOfContext` for all views.
    * @private
    * @return {?}
    */
    function() {
      var count = this._data.length;
      var i = this._viewContainerRef.length;
      while (i--) {
        var view = (
          /** @type {?} */
          this._viewContainerRef.get(i)
        );
        view.context.index = this._renderedRange.start + i;
        view.context.count = count;
        this._updateComputedContextProperties(view.context);
        view.detectChanges();
      }
    };
    CdkVirtualForOf2.prototype._applyChanges = /**
    * Apply changes to the DOM.
    * @private
    * @param {?} changes
    * @return {?}
    */
    function(changes) {
      var _this = this;
      changes.forEachOperation(function(record, adjustedPreviousIndex, currentIndex) {
        if (record.previousIndex == null) {
          var view2 = _this._insertViewForNewItem(
            /** @type {?} */
            currentIndex
          );
          view2.context.$implicit = record.item;
        } else if (currentIndex == null) {
          _this._cacheView(_this._detachView(
            /** @type {?} */
            adjustedPreviousIndex
          ));
        } else {
          var view2 = (
            /** @type {?} */
            _this._viewContainerRef.get(
              /** @type {?} */
              adjustedPreviousIndex
            )
          );
          _this._viewContainerRef.move(view2, currentIndex);
          view2.context.$implicit = record.item;
        }
      });
      changes.forEachIdentityChange(function(record) {
        var view2 = (
          /** @type {?} */
          _this._viewContainerRef.get(
            /** @type {?} */
            record.currentIndex
          )
        );
        view2.context.$implicit = record.item;
      });
      var count = this._data.length;
      var i = this._viewContainerRef.length;
      while (i--) {
        var view = (
          /** @type {?} */
          this._viewContainerRef.get(i)
        );
        view.context.index = this._renderedRange.start + i;
        view.context.count = count;
        this._updateComputedContextProperties(view.context);
      }
    };
    CdkVirtualForOf2.prototype._cacheView = /**
    * Cache the given detached view.
    * @private
    * @param {?} view
    * @return {?}
    */
    function(view) {
      if (this._templateCache.length < this.cdkVirtualForTemplateCacheSize) {
        this._templateCache.push(view);
      } else {
        var index = this._viewContainerRef.indexOf(view);
        if (index === -1) {
          view.destroy();
        } else {
          this._viewContainerRef.remove(index);
        }
      }
    };
    CdkVirtualForOf2.prototype._insertViewForNewItem = /**
    * Inserts a view for a new item, either from the cache or by creating a new one.
    * @private
    * @param {?} index
    * @return {?}
    */
    function(index) {
      return this._insertViewFromCache(index) || this._createEmbeddedViewAt(index);
    };
    CdkVirtualForOf2.prototype._updateComputedContextProperties = /**
    * Update the computed properties on the `CdkVirtualForOfContext`.
    * @private
    * @param {?} context
    * @return {?}
    */
    function(context) {
      context.first = context.index === 0;
      context.last = context.index === context.count - 1;
      context.even = context.index % 2 === 0;
      context.odd = !context.even;
    };
    CdkVirtualForOf2.prototype._createEmbeddedViewAt = /**
    * Creates a new embedded view and moves it to the given index
    * @private
    * @param {?} index
    * @return {?}
    */
    function(index) {
      var view = this._viewContainerRef.createEmbeddedView(this._template, {
        $implicit: (
          /** @type {?} */
          null
        ),
        cdkVirtualForOf: this._cdkVirtualForOf,
        index: -1,
        count: -1,
        first: false,
        last: false,
        odd: false,
        even: false
      });
      if (index < this._viewContainerRef.length) {
        this._viewContainerRef.move(view, index);
      }
      return view;
    };
    CdkVirtualForOf2.prototype._insertViewFromCache = /**
    * Inserts a recycled view from the cache at the given index.
    * @private
    * @param {?} index
    * @return {?}
    */
    function(index) {
      var cachedView = this._templateCache.pop();
      if (cachedView) {
        this._viewContainerRef.insert(cachedView, index);
      }
      return cachedView || null;
    };
    CdkVirtualForOf2.prototype._detachView = /**
    * Detaches the embedded view at the given index.
    * @private
    * @param {?} index
    * @return {?}
    */
    function(index) {
      return (
        /** @type {?} */
        this._viewContainerRef.detach(index)
      );
    };
    CdkVirtualForOf2.decorators = [
      { type: Directive, args: [{
        selector: "[cdkVirtualFor][cdkVirtualForOf]"
      }] }
    ];
    CdkVirtualForOf2.ctorParameters = function() {
      return [
        { type: ViewContainerRef },
        { type: TemplateRef },
        { type: IterableDiffers },
        { type: CdkVirtualScrollViewport, decorators: [{ type: SkipSelf }] },
        { type: NgZone }
      ];
    };
    CdkVirtualForOf2.propDecorators = {
      cdkVirtualForOf: [{ type: Input }],
      cdkVirtualForTrackBy: [{ type: Input }],
      cdkVirtualForTemplate: [{ type: Input }],
      cdkVirtualForTemplateCacheSize: [{ type: Input }]
    };
    return CdkVirtualForOf2;
  })()
);
var ScrollingModule = (
  /** @class */
  (function() {
    function ScrollingModule2() {
    }
    ScrollingModule2.decorators = [
      { type: NgModule, args: [{
        imports: [BidiModule, PlatformModule],
        exports: [
          BidiModule,
          CdkFixedSizeVirtualScroll,
          CdkScrollable,
          CdkVirtualForOf,
          CdkVirtualScrollViewport
        ],
        declarations: [
          CdkFixedSizeVirtualScroll,
          CdkScrollable,
          CdkVirtualForOf,
          CdkVirtualScrollViewport
        ]
      }] }
    ];
    return ScrollingModule2;
  })()
);
var DEFAULT_RESIZE_TIME = 20;
var ViewportRuler = (
  /** @class */
  (function() {
    function ViewportRuler2(_platform, ngZone) {
      var _this = this;
      this._platform = _platform;
      ngZone.runOutsideAngular(function() {
        _this._change = _platform.isBrowser ? merge(fromEvent(window, "resize"), fromEvent(window, "orientationchange")) : of();
        _this._invalidateCache = _this.change().subscribe(function() {
          return _this._updateViewportSize();
        });
      });
    }
    ViewportRuler2.prototype.ngOnDestroy = /**
    * @return {?}
    */
    function() {
      this._invalidateCache.unsubscribe();
    };
    ViewportRuler2.prototype.getViewportSize = /**
    * Returns the viewport's width and height.
    * @return {?}
    */
    function() {
      if (!this._viewportSize) {
        this._updateViewportSize();
      }
      var output = { width: this._viewportSize.width, height: this._viewportSize.height };
      if (!this._platform.isBrowser) {
        this._viewportSize = /** @type {?} */
        null;
      }
      return output;
    };
    ViewportRuler2.prototype.getViewportRect = /**
    * Gets a ClientRect for the viewport's bounds.
    * @return {?}
    */
    function() {
      var scrollPosition = this.getViewportScrollPosition();
      var _a = this.getViewportSize(), width = _a.width, height = _a.height;
      return {
        top: scrollPosition.top,
        left: scrollPosition.left,
        bottom: scrollPosition.top + height,
        right: scrollPosition.left + width,
        height,
        width
      };
    };
    ViewportRuler2.prototype.getViewportScrollPosition = /**
    * Gets the (top, left) scroll position of the viewport.
    * @return {?}
    */
    function() {
      if (!this._platform.isBrowser) {
        return { top: 0, left: 0 };
      }
      var documentElement = (
        /** @type {?} */
        document.documentElement
      );
      var documentRect = documentElement.getBoundingClientRect();
      var top2 = -documentRect.top || document.body.scrollTop || window.scrollY || documentElement.scrollTop || 0;
      var left2 = -documentRect.left || document.body.scrollLeft || window.scrollX || documentElement.scrollLeft || 0;
      return { top: top2, left: left2 };
    };
    ViewportRuler2.prototype.change = /**
    * Returns a stream that emits whenever the size of the viewport changes.
    * @param {?=} throttleTime Time in milliseconds to throttle the stream.
    * @return {?}
    */
    function(throttleTime) {
      if (throttleTime === void 0) {
        throttleTime = DEFAULT_RESIZE_TIME;
      }
      return throttleTime > 0 ? this._change.pipe(auditTime(throttleTime)) : this._change;
    };
    ViewportRuler2.prototype._updateViewportSize = /**
    * Updates the cached viewport size.
    * @private
    * @return {?}
    */
    function() {
      this._viewportSize = this._platform.isBrowser ? { width: window.innerWidth, height: window.innerHeight } : { width: 0, height: 0 };
    };
    ViewportRuler2.decorators = [
      { type: Injectable, args: [{ providedIn: "root" }] }
    ];
    ViewportRuler2.ctorParameters = function() {
      return [
        { type: Platform },
        { type: NgZone }
      ];
    };
    ViewportRuler2.ngInjectableDef = defineInjectable({ factory: function ViewportRuler_Factory() {
      return new ViewportRuler2(inject(Platform), inject(NgZone));
    }, token: ViewportRuler2, providedIn: "root" });
    return ViewportRuler2;
  })()
);
({
  deps: [[new Optional(), new SkipSelf(), ViewportRuler], Platform, NgZone]
});
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
function throwNullPortalError() {
  throw Error("Must provide a portal to attach");
}
function throwPortalAlreadyAttachedError() {
  throw Error("Host already has a portal attached");
}
function throwPortalOutletAlreadyDisposedError() {
  throw Error("This PortalOutlet has already been disposed");
}
function throwUnknownPortalTypeError() {
  throw Error("Attempting to attach an unknown Portal type. BasePortalOutlet accepts either a ComponentPortal or a TemplatePortal.");
}
function throwNullPortalOutletError() {
  throw Error("Attempting to attach a portal to a null PortalOutlet");
}
function throwNoPortalAttachedError() {
  throw Error("Attempting to detach a portal that is not attached to a host");
}
var Portal = (
  /** @class */
  (function() {
    function Portal2() {
    }
    Portal2.prototype.attach = /**
    * Attach this portal to a host.
    * @param {?} host
    * @return {?}
    */
    function(host) {
      if (host == null) {
        throwNullPortalOutletError();
      }
      if (host.hasAttached()) {
        throwPortalAlreadyAttachedError();
      }
      this._attachedHost = host;
      return (
        /** @type {?} */
        host.attach(this)
      );
    };
    Portal2.prototype.detach = /**
    * Detach this portal from its host
    * @return {?}
    */
    function() {
      var host = this._attachedHost;
      if (host == null) {
        throwNoPortalAttachedError();
      } else {
        this._attachedHost = null;
        host.detach();
      }
    };
    Object.defineProperty(Portal2.prototype, "isAttached", {
      /** Whether this portal is attached to a host. */
      get: (
        /**
        * Whether this portal is attached to a host.
        * @return {?}
        */
        function() {
          return this._attachedHost != null;
        }
      ),
      enumerable: true,
      configurable: true
    });
    Portal2.prototype.setAttachedHost = /**
    * Sets the PortalOutlet reference without performing `attach()`. This is used directly by
    * the PortalOutlet when it is performing an `attach()` or `detach()`.
    * @param {?} host
    * @return {?}
    */
    function(host) {
      this._attachedHost = host;
    };
    return Portal2;
  })()
);
var ComponentPortal$1 = (
  /** @class */
  (function(_super) {
    __extends(ComponentPortal2, _super);
    function ComponentPortal2(component, viewContainerRef, injector, componentFactoryResolver) {
      var _this = _super.call(this) || this;
      _this.component = component;
      _this.viewContainerRef = viewContainerRef;
      _this.injector = injector;
      _this.componentFactoryResolver = componentFactoryResolver;
      return _this;
    }
    return ComponentPortal2;
  })(Portal)
);
var TemplatePortal = (
  /** @class */
  (function(_super) {
    __extends(TemplatePortal2, _super);
    function TemplatePortal2(template, viewContainerRef, context) {
      var _this = _super.call(this) || this;
      _this.templateRef = template;
      _this.viewContainerRef = viewContainerRef;
      _this.context = context;
      return _this;
    }
    Object.defineProperty(TemplatePortal2.prototype, "origin", {
      get: (
        /**
        * @return {?}
        */
        function() {
          return this.templateRef.elementRef;
        }
      ),
      enumerable: true,
      configurable: true
    });
    TemplatePortal2.prototype.attach = /**
    * Attach the portal to the provided `PortalOutlet`.
    * When a context is provided it will override the `context` property of the `TemplatePortal`
    * instance.
    * @param {?} host
    * @param {?=} context
    * @return {?}
    */
    function(host, context) {
      if (context === void 0) {
        context = this.context;
      }
      this.context = context;
      return _super.prototype.attach.call(this, host);
    };
    TemplatePortal2.prototype.detach = /**
    * @return {?}
    */
    function() {
      this.context = void 0;
      return _super.prototype.detach.call(this);
    };
    return TemplatePortal2;
  })(Portal)
);
var BasePortalOutlet = (
  /** @class */
  (function() {
    function BasePortalOutlet2() {
      this._isDisposed = false;
    }
    BasePortalOutlet2.prototype.hasAttached = /**
    * Whether this host has an attached portal.
    * @return {?}
    */
    function() {
      return !!this._attachedPortal;
    };
    BasePortalOutlet2.prototype.attach = /**
    * Attaches a portal.
    * @param {?} portal
    * @return {?}
    */
    function(portal) {
      if (!portal) {
        throwNullPortalError();
      }
      if (this.hasAttached()) {
        throwPortalAlreadyAttachedError();
      }
      if (this._isDisposed) {
        throwPortalOutletAlreadyDisposedError();
      }
      if (portal instanceof ComponentPortal$1) {
        this._attachedPortal = portal;
        return this.attachComponentPortal(portal);
      } else if (portal instanceof TemplatePortal) {
        this._attachedPortal = portal;
        return this.attachTemplatePortal(portal);
      }
      throwUnknownPortalTypeError();
    };
    BasePortalOutlet2.prototype.detach = /**
    * Detaches a previously attached portal.
    * @return {?}
    */
    function() {
      if (this._attachedPortal) {
        this._attachedPortal.setAttachedHost(null);
        this._attachedPortal = null;
      }
      this._invokeDisposeFn();
    };
    BasePortalOutlet2.prototype.dispose = /**
    * Permanently dispose of this portal host.
    * @return {?}
    */
    function() {
      if (this.hasAttached()) {
        this.detach();
      }
      this._invokeDisposeFn();
      this._isDisposed = true;
    };
    BasePortalOutlet2.prototype.setDisposeFn = /**
    * \@docs-private
    * @param {?} fn
    * @return {?}
    */
    function(fn2) {
      this._disposeFn = fn2;
    };
    BasePortalOutlet2.prototype._invokeDisposeFn = /**
    * @private
    * @return {?}
    */
    function() {
      if (this._disposeFn) {
        this._disposeFn();
        this._disposeFn = null;
      }
    };
    return BasePortalOutlet2;
  })()
);
var DomPortalOutlet = (
  /** @class */
  (function(_super) {
    __extends(DomPortalOutlet2, _super);
    function DomPortalOutlet2(outletElement, _componentFactoryResolver, _appRef, _defaultInjector) {
      var _this = _super.call(this) || this;
      _this.outletElement = outletElement;
      _this._componentFactoryResolver = _componentFactoryResolver;
      _this._appRef = _appRef;
      _this._defaultInjector = _defaultInjector;
      return _this;
    }
    DomPortalOutlet2.prototype.attachComponentPortal = /**
    * Attach the given ComponentPortal to DOM element using the ComponentFactoryResolver.
    * @template T
    * @param {?} portal Portal to be attached
    * @return {?} Reference to the created component.
    */
    function(portal) {
      var _this = this;
      var resolver = portal.componentFactoryResolver || this._componentFactoryResolver;
      var componentFactory = resolver.resolveComponentFactory(portal.component);
      var componentRef;
      if (portal.viewContainerRef) {
        componentRef = portal.viewContainerRef.createComponent(componentFactory, portal.viewContainerRef.length, portal.injector || portal.viewContainerRef.injector);
        this.setDisposeFn(function() {
          return componentRef.destroy();
        });
      } else {
        componentRef = componentFactory.create(portal.injector || this._defaultInjector);
        this._appRef.attachView(componentRef.hostView);
        this.setDisposeFn(function() {
          _this._appRef.detachView(componentRef.hostView);
          componentRef.destroy();
        });
      }
      this.outletElement.appendChild(this._getComponentRootNode(componentRef));
      return componentRef;
    };
    DomPortalOutlet2.prototype.attachTemplatePortal = /**
    * Attaches a template portal to the DOM as an embedded view.
    * @template C
    * @param {?} portal Portal to be attached.
    * @return {?} Reference to the created embedded view.
    */
    function(portal) {
      var _this = this;
      var viewContainer = portal.viewContainerRef;
      var viewRef = viewContainer.createEmbeddedView(portal.templateRef, portal.context);
      viewRef.detectChanges();
      viewRef.rootNodes.forEach(function(rootNode) {
        return _this.outletElement.appendChild(rootNode);
      });
      this.setDisposeFn((function() {
        var index = viewContainer.indexOf(viewRef);
        if (index !== -1) {
          viewContainer.remove(index);
        }
      }));
      return viewRef;
    };
    DomPortalOutlet2.prototype.dispose = /**
    * Clears out a portal from the DOM.
    * @return {?}
    */
    function() {
      _super.prototype.dispose.call(this);
      if (this.outletElement.parentNode != null) {
        this.outletElement.parentNode.removeChild(this.outletElement);
      }
    };
    DomPortalOutlet2.prototype._getComponentRootNode = /**
    * Gets the root HTMLElement for an instantiated component.
    * @private
    * @param {?} componentRef
    * @return {?}
    */
    function(componentRef) {
      return (
        /** @type {?} */
        /** @type {?} */
        componentRef.hostView.rootNodes[0]
      );
    };
    return DomPortalOutlet2;
  })(BasePortalOutlet)
);
var CdkPortal = (
  /** @class */
  (function(_super) {
    __extends(CdkPortal2, _super);
    function CdkPortal2(templateRef, viewContainerRef) {
      return _super.call(this, templateRef, viewContainerRef) || this;
    }
    CdkPortal2.decorators = [
      { type: Directive, args: [{
        selector: "[cdk-portal], [cdkPortal], [portal]",
        exportAs: "cdkPortal"
      }] }
    ];
    CdkPortal2.ctorParameters = function() {
      return [
        { type: TemplateRef },
        { type: ViewContainerRef }
      ];
    };
    return CdkPortal2;
  })(TemplatePortal)
);
var CdkPortalOutlet = (
  /** @class */
  (function(_super) {
    __extends(CdkPortalOutlet2, _super);
    function CdkPortalOutlet2(_componentFactoryResolver, _viewContainerRef) {
      var _this = _super.call(this) || this;
      _this._componentFactoryResolver = _componentFactoryResolver;
      _this._viewContainerRef = _viewContainerRef;
      _this._isInitialized = false;
      _this.attached = new EventEmitter();
      return _this;
    }
    Object.defineProperty(CdkPortalOutlet2.prototype, "portal", {
      /** Portal associated with the Portal outlet. */
      get: (
        /**
        * Portal associated with the Portal outlet.
        * @return {?}
        */
        function() {
          return this._attachedPortal;
        }
      ),
      set: (
        /**
        * @param {?} portal
        * @return {?}
        */
        function(portal) {
          if (this.hasAttached() && !portal && !this._isInitialized) {
            return;
          }
          if (this.hasAttached()) {
            _super.prototype.detach.call(this);
          }
          if (portal) {
            _super.prototype.attach.call(this, portal);
          }
          this._attachedPortal = portal;
        }
      ),
      enumerable: true,
      configurable: true
    });
    Object.defineProperty(CdkPortalOutlet2.prototype, "attachedRef", {
      /** Component or view reference that is attached to the portal. */
      get: (
        /**
        * Component or view reference that is attached to the portal.
        * @return {?}
        */
        function() {
          return this._attachedRef;
        }
      ),
      enumerable: true,
      configurable: true
    });
    CdkPortalOutlet2.prototype.ngOnInit = /**
    * @return {?}
    */
    function() {
      this._isInitialized = true;
    };
    CdkPortalOutlet2.prototype.ngOnDestroy = /**
    * @return {?}
    */
    function() {
      _super.prototype.dispose.call(this);
      this._attachedPortal = null;
      this._attachedRef = null;
    };
    CdkPortalOutlet2.prototype.attachComponentPortal = /**
    * Attach the given ComponentPortal to this PortalOutlet using the ComponentFactoryResolver.
    *
    * @template T
    * @param {?} portal Portal to be attached to the portal outlet.
    * @return {?} Reference to the created component.
    */
    function(portal) {
      portal.setAttachedHost(this);
      var viewContainerRef = portal.viewContainerRef != null ? portal.viewContainerRef : this._viewContainerRef;
      var resolver = portal.componentFactoryResolver || this._componentFactoryResolver;
      var componentFactory = resolver.resolveComponentFactory(portal.component);
      var ref = viewContainerRef.createComponent(componentFactory, viewContainerRef.length, portal.injector || viewContainerRef.injector);
      _super.prototype.setDisposeFn.call(this, function() {
        return ref.destroy();
      });
      this._attachedPortal = portal;
      this._attachedRef = ref;
      this.attached.emit(ref);
      return ref;
    };
    CdkPortalOutlet2.prototype.attachTemplatePortal = /**
    * Attach the given TemplatePortal to this PortlHost as an embedded View.
    * @template C
    * @param {?} portal Portal to be attached.
    * @return {?} Reference to the created embedded view.
    */
    function(portal) {
      var _this = this;
      portal.setAttachedHost(this);
      var viewRef = this._viewContainerRef.createEmbeddedView(portal.templateRef, portal.context);
      _super.prototype.setDisposeFn.call(this, function() {
        return _this._viewContainerRef.clear();
      });
      this._attachedPortal = portal;
      this._attachedRef = viewRef;
      this.attached.emit(viewRef);
      return viewRef;
    };
    CdkPortalOutlet2.decorators = [
      { type: Directive, args: [{
        selector: "[cdkPortalOutlet], [cdkPortalHost], [portalHost]",
        exportAs: "cdkPortalOutlet, cdkPortalHost",
        inputs: ["portal: cdkPortalOutlet"]
      }] }
    ];
    CdkPortalOutlet2.ctorParameters = function() {
      return [
        { type: ComponentFactoryResolver$1 },
        { type: ViewContainerRef }
      ];
    };
    CdkPortalOutlet2.propDecorators = {
      attached: [{ type: Output }]
    };
    return CdkPortalOutlet2;
  })(BasePortalOutlet)
);
var PortalModule = (
  /** @class */
  (function() {
    function PortalModule2() {
    }
    PortalModule2.decorators = [
      { type: NgModule, args: [{
        exports: [CdkPortal, CdkPortalOutlet],
        declarations: [CdkPortal, CdkPortalOutlet]
      }] }
    ];
    return PortalModule2;
  })()
);
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
var TAB = 9;
var ESCAPE = 27;
var LEFT_ARROW = 37;
var UP_ARROW = 38;
var RIGHT_ARROW = 39;
var DOWN_ARROW = 40;
var ZERO = 48;
var NINE = 57;
var A = 65;
var Z = 90;
function hasModifierKey(event) {
  var modifiers = [];
  for (var _i = 1; _i < arguments.length; _i++) {
    modifiers[_i - 1] = arguments[_i];
  }
  if (modifiers.length) {
    return modifiers.some(function(modifier) {
      return event[modifier];
    });
  }
  return event.altKey || event.shiftKey || event.ctrlKey || event.metaKey;
}
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
var BlockScrollStrategy = (
  /** @class */
  (function() {
    function BlockScrollStrategy2(_viewportRuler, document2) {
      this._viewportRuler = _viewportRuler;
      this._previousHTMLStyles = { top: "", left: "" };
      this._isEnabled = false;
      this._document = document2;
    }
    BlockScrollStrategy2.prototype.attach = /**
    * Attaches this scroll strategy to an overlay.
    * @return {?}
    */
    function() {
    };
    BlockScrollStrategy2.prototype.enable = /**
    * Blocks page-level scroll while the attached overlay is open.
    * @return {?}
    */
    function() {
      if (this._canBeEnabled()) {
        var root = (
          /** @type {?} */
          this._document.documentElement
        );
        this._previousScrollPosition = this._viewportRuler.getViewportScrollPosition();
        this._previousHTMLStyles.left = root.style.left || "";
        this._previousHTMLStyles.top = root.style.top || "";
        root.style.left = coerceCssPixelValue(-this._previousScrollPosition.left);
        root.style.top = coerceCssPixelValue(-this._previousScrollPosition.top);
        root.classList.add("cdk-global-scrollblock");
        this._isEnabled = true;
      }
    };
    BlockScrollStrategy2.prototype.disable = /**
    * Unblocks page-level scroll while the attached overlay is open.
    * @return {?}
    */
    function() {
      if (this._isEnabled) {
        var html = (
          /** @type {?} */
          this._document.documentElement
        );
        var body = (
          /** @type {?} */
          this._document.body
        );
        var htmlStyle = (
          /** @type {?} */
          html.style
        );
        var bodyStyle = (
          /** @type {?} */
          body.style
        );
        var previousHtmlScrollBehavior = htmlStyle.scrollBehavior || "";
        var previousBodyScrollBehavior = bodyStyle.scrollBehavior || "";
        this._isEnabled = false;
        htmlStyle.left = this._previousHTMLStyles.left;
        htmlStyle.top = this._previousHTMLStyles.top;
        html.classList.remove("cdk-global-scrollblock");
        htmlStyle.scrollBehavior = bodyStyle.scrollBehavior = "auto";
        window.scroll(this._previousScrollPosition.left, this._previousScrollPosition.top);
        htmlStyle.scrollBehavior = previousHtmlScrollBehavior;
        bodyStyle.scrollBehavior = previousBodyScrollBehavior;
      }
    };
    BlockScrollStrategy2.prototype._canBeEnabled = /**
    * @private
    * @return {?}
    */
    function() {
      var html = (
        /** @type {?} */
        this._document.documentElement
      );
      if (html.classList.contains("cdk-global-scrollblock") || this._isEnabled) {
        return false;
      }
      var body = this._document.body;
      var viewport2 = this._viewportRuler.getViewportSize();
      return body.scrollHeight > viewport2.height || body.scrollWidth > viewport2.width;
    };
    return BlockScrollStrategy2;
  })()
);
function getMatScrollStrategyAlreadyAttachedError() {
  return Error("Scroll strategy has already been attached.");
}
var CloseScrollStrategy = (
  /** @class */
  (function() {
    function CloseScrollStrategy2(_scrollDispatcher, _ngZone, _viewportRuler, _config) {
      var _this = this;
      this._scrollDispatcher = _scrollDispatcher;
      this._ngZone = _ngZone;
      this._viewportRuler = _viewportRuler;
      this._config = _config;
      this._scrollSubscription = null;
      this._detach = function() {
        _this.disable();
        if (_this._overlayRef.hasAttached()) {
          _this._ngZone.run(function() {
            return _this._overlayRef.detach();
          });
        }
      };
    }
    CloseScrollStrategy2.prototype.attach = /**
    * Attaches this scroll strategy to an overlay.
    * @param {?} overlayRef
    * @return {?}
    */
    function(overlayRef) {
      if (this._overlayRef) {
        throw getMatScrollStrategyAlreadyAttachedError();
      }
      this._overlayRef = overlayRef;
    };
    CloseScrollStrategy2.prototype.enable = /**
    * Enables the closing of the attached overlay on scroll.
    * @return {?}
    */
    function() {
      var _this = this;
      if (this._scrollSubscription) {
        return;
      }
      var stream = this._scrollDispatcher.scrolled(0);
      if (this._config && this._config.threshold && this._config.threshold > 1) {
        this._initialScrollPosition = this._viewportRuler.getViewportScrollPosition().top;
        this._scrollSubscription = stream.subscribe(function() {
          var scrollPosition = _this._viewportRuler.getViewportScrollPosition().top;
          if (Math.abs(scrollPosition - _this._initialScrollPosition) > /** @type {?} */
          /** @type {?} */
          _this._config.threshold) {
            _this._detach();
          } else {
            _this._overlayRef.updatePosition();
          }
        });
      } else {
        this._scrollSubscription = stream.subscribe(this._detach);
      }
    };
    CloseScrollStrategy2.prototype.disable = /**
    * Disables the closing the attached overlay on scroll.
    * @return {?}
    */
    function() {
      if (this._scrollSubscription) {
        this._scrollSubscription.unsubscribe();
        this._scrollSubscription = null;
      }
    };
    return CloseScrollStrategy2;
  })()
);
var NoopScrollStrategy = (
  /** @class */
  (function() {
    function NoopScrollStrategy2() {
    }
    NoopScrollStrategy2.prototype.enable = /**
    * Does nothing, as this scroll strategy is a no-op.
    * @return {?}
    */
    function() {
    };
    NoopScrollStrategy2.prototype.disable = /**
    * Does nothing, as this scroll strategy is a no-op.
    * @return {?}
    */
    function() {
    };
    NoopScrollStrategy2.prototype.attach = /**
    * Does nothing, as this scroll strategy is a no-op.
    * @return {?}
    */
    function() {
    };
    return NoopScrollStrategy2;
  })()
);
function isElementScrolledOutsideView(element, scrollContainers) {
  return scrollContainers.some(function(containerBounds) {
    var outsideAbove = element.bottom < containerBounds.top;
    var outsideBelow = element.top > containerBounds.bottom;
    var outsideLeft = element.right < containerBounds.left;
    var outsideRight = element.left > containerBounds.right;
    return outsideAbove || outsideBelow || outsideLeft || outsideRight;
  });
}
function isElementClippedByScrolling(element, scrollContainers) {
  return scrollContainers.some(function(scrollContainerRect) {
    var clippedAbove = element.top < scrollContainerRect.top;
    var clippedBelow = element.bottom > scrollContainerRect.bottom;
    var clippedLeft = element.left < scrollContainerRect.left;
    var clippedRight = element.right > scrollContainerRect.right;
    return clippedAbove || clippedBelow || clippedLeft || clippedRight;
  });
}
var RepositionScrollStrategy = (
  /** @class */
  (function() {
    function RepositionScrollStrategy2(_scrollDispatcher, _viewportRuler, _ngZone, _config) {
      this._scrollDispatcher = _scrollDispatcher;
      this._viewportRuler = _viewportRuler;
      this._ngZone = _ngZone;
      this._config = _config;
      this._scrollSubscription = null;
    }
    RepositionScrollStrategy2.prototype.attach = /**
    * Attaches this scroll strategy to an overlay.
    * @param {?} overlayRef
    * @return {?}
    */
    function(overlayRef) {
      if (this._overlayRef) {
        throw getMatScrollStrategyAlreadyAttachedError();
      }
      this._overlayRef = overlayRef;
    };
    RepositionScrollStrategy2.prototype.enable = /**
    * Enables repositioning of the attached overlay on scroll.
    * @return {?}
    */
    function() {
      var _this = this;
      if (!this._scrollSubscription) {
        var throttle = this._config ? this._config.scrollThrottle : 0;
        this._scrollSubscription = this._scrollDispatcher.scrolled(throttle).subscribe(function() {
          _this._overlayRef.updatePosition();
          if (_this._config && _this._config.autoClose) {
            var overlayRect = _this._overlayRef.overlayElement.getBoundingClientRect();
            var _a = _this._viewportRuler.getViewportSize(), width = _a.width, height = _a.height;
            var parentRects = [{ width, height, bottom: height, right: width, top: 0, left: 0 }];
            if (isElementScrolledOutsideView(overlayRect, parentRects)) {
              _this.disable();
              _this._ngZone.run(function() {
                return _this._overlayRef.detach();
              });
            }
          }
        });
      }
    };
    RepositionScrollStrategy2.prototype.disable = /**
    * Disables repositioning of the attached overlay on scroll.
    * @return {?}
    */
    function() {
      if (this._scrollSubscription) {
        this._scrollSubscription.unsubscribe();
        this._scrollSubscription = null;
      }
    };
    return RepositionScrollStrategy2;
  })()
);
var ScrollStrategyOptions = (
  /** @class */
  (function() {
    function ScrollStrategyOptions2(_scrollDispatcher, _viewportRuler, _ngZone, document2) {
      var _this = this;
      this._scrollDispatcher = _scrollDispatcher;
      this._viewportRuler = _viewportRuler;
      this._ngZone = _ngZone;
      this.noop = function() {
        return new NoopScrollStrategy();
      };
      this.close = function(config) {
        return new CloseScrollStrategy(_this._scrollDispatcher, _this._ngZone, _this._viewportRuler, config);
      };
      this.block = function() {
        return new BlockScrollStrategy(_this._viewportRuler, _this._document);
      };
      this.reposition = function(config) {
        return new RepositionScrollStrategy(_this._scrollDispatcher, _this._viewportRuler, _this._ngZone, config);
      };
      this._document = document2;
    }
    ScrollStrategyOptions2.decorators = [
      { type: Injectable, args: [{ providedIn: "root" }] }
    ];
    ScrollStrategyOptions2.ctorParameters = function() {
      return [
        { type: ScrollDispatcher },
        { type: ViewportRuler },
        { type: NgZone },
        { type: void 0, decorators: [{ type: Inject, args: [DOCUMENT] }] }
      ];
    };
    ScrollStrategyOptions2.ngInjectableDef = defineInjectable({ factory: function ScrollStrategyOptions_Factory() {
      return new ScrollStrategyOptions2(inject(ScrollDispatcher), inject(ViewportRuler), inject(NgZone), inject(DOCUMENT));
    }, token: ScrollStrategyOptions2, providedIn: "root" });
    return ScrollStrategyOptions2;
  })()
);
var OverlayConfig = (
  /** @class */
  /* @__PURE__ */ (function() {
    function OverlayConfig2(config) {
      var _this = this;
      this.scrollStrategy = new NoopScrollStrategy();
      this.panelClass = "";
      this.hasBackdrop = false;
      this.backdropClass = "cdk-overlay-dark-backdrop";
      this.disposeOnNavigation = false;
      if (config) {
        Object.keys(config).forEach(function(k) {
          var key = (
            /** @type {?} */
            k
          );
          if (typeof config[key] !== "undefined") {
            _this[key] = config[key];
          }
        });
      }
    }
    return OverlayConfig2;
  })()
);
var ConnectionPositionPair = (
  /** @class */
  /* @__PURE__ */ (function() {
    function ConnectionPositionPair2(origin, overlay, offsetX, offsetY, panelClass) {
      this.offsetX = offsetX;
      this.offsetY = offsetY;
      this.panelClass = panelClass;
      this.originX = origin.originX;
      this.originY = origin.originY;
      this.overlayX = overlay.overlayX;
      this.overlayY = overlay.overlayY;
    }
    return ConnectionPositionPair2;
  })()
);
var ScrollingVisibility = (
  /** @class */
  /* @__PURE__ */ (function() {
    function ScrollingVisibility2() {
    }
    return ScrollingVisibility2;
  })()
);
var ConnectedOverlayPositionChange = (
  /** @class */
  (function() {
    function ConnectedOverlayPositionChange2(connectionPair, scrollableViewProperties) {
      this.connectionPair = connectionPair;
      this.scrollableViewProperties = scrollableViewProperties;
    }
    ConnectedOverlayPositionChange2.ctorParameters = function() {
      return [
        { type: ConnectionPositionPair },
        { type: ScrollingVisibility, decorators: [{ type: Optional }] }
      ];
    };
    return ConnectedOverlayPositionChange2;
  })()
);
function validateVerticalPosition(property, value) {
  if (value !== "top" && value !== "bottom" && value !== "center") {
    throw Error("ConnectedPosition: Invalid " + property + ' "' + value + '". Expected "top", "bottom" or "center".');
  }
}
function validateHorizontalPosition(property, value) {
  if (value !== "start" && value !== "end" && value !== "center") {
    throw Error("ConnectedPosition: Invalid " + property + ' "' + value + '". Expected "start", "end" or "center".');
  }
}
var OverlayKeyboardDispatcher = (
  /** @class */
  (function() {
    function OverlayKeyboardDispatcher2(document2) {
      var _this = this;
      this._attachedOverlays = [];
      this._keydownListener = function(event) {
        var overlays = _this._attachedOverlays;
        for (var i = overlays.length - 1; i > -1; i--) {
          if (overlays[i]._keydownEventSubscriptions > 0) {
            overlays[i]._keydownEvents.next(event);
            break;
          }
        }
      };
      this._document = document2;
    }
    OverlayKeyboardDispatcher2.prototype.ngOnDestroy = /**
    * @return {?}
    */
    function() {
      this._detach();
    };
    OverlayKeyboardDispatcher2.prototype.add = /**
    * Add a new overlay to the list of attached overlay refs.
    * @param {?} overlayRef
    * @return {?}
    */
    function(overlayRef) {
      this.remove(overlayRef);
      if (!this._isAttached) {
        this._document.body.addEventListener("keydown", this._keydownListener, true);
        this._isAttached = true;
      }
      this._attachedOverlays.push(overlayRef);
    };
    OverlayKeyboardDispatcher2.prototype.remove = /**
    * Remove an overlay from the list of attached overlay refs.
    * @param {?} overlayRef
    * @return {?}
    */
    function(overlayRef) {
      var index = this._attachedOverlays.indexOf(overlayRef);
      if (index > -1) {
        this._attachedOverlays.splice(index, 1);
      }
      if (this._attachedOverlays.length === 0) {
        this._detach();
      }
    };
    OverlayKeyboardDispatcher2.prototype._detach = /**
    * Detaches the global keyboard event listener.
    * @private
    * @return {?}
    */
    function() {
      if (this._isAttached) {
        this._document.body.removeEventListener("keydown", this._keydownListener, true);
        this._isAttached = false;
      }
    };
    OverlayKeyboardDispatcher2.decorators = [
      { type: Injectable, args: [{ providedIn: "root" }] }
    ];
    OverlayKeyboardDispatcher2.ctorParameters = function() {
      return [
        { type: void 0, decorators: [{ type: Inject, args: [DOCUMENT] }] }
      ];
    };
    OverlayKeyboardDispatcher2.ngInjectableDef = defineInjectable({ factory: function OverlayKeyboardDispatcher_Factory() {
      return new OverlayKeyboardDispatcher2(inject(DOCUMENT));
    }, token: OverlayKeyboardDispatcher2, providedIn: "root" });
    return OverlayKeyboardDispatcher2;
  })()
);
({
  deps: [
    [new Optional(), new SkipSelf(), OverlayKeyboardDispatcher],
    /** @type {?} */
    // Coerce to `InjectionToken` so that the `deps` match the "shape"
    // of the type expected by Angular
    DOCUMENT
  ]
});
var OverlayContainer$1 = (
  /** @class */
  (function() {
    function OverlayContainer2(_document) {
      this._document = _document;
    }
    OverlayContainer2.prototype.ngOnDestroy = /**
    * @return {?}
    */
    function() {
      if (this._containerElement && this._containerElement.parentNode) {
        this._containerElement.parentNode.removeChild(this._containerElement);
      }
    };
    OverlayContainer2.prototype.getContainerElement = /**
    * This method returns the overlay container element. It will lazily
    * create the element the first time  it is called to facilitate using
    * the container in non-browser environments.
    * @return {?} the container element
    */
    function() {
      if (!this._containerElement) {
        this._createContainer();
      }
      return this._containerElement;
    };
    OverlayContainer2.prototype._createContainer = /**
    * Create the overlay container element, which is simply a div
    * with the 'cdk-overlay-container' class on the document body.
    * @protected
    * @return {?}
    */
    function() {
      var container = this._document.createElement("div");
      container.classList.add("cdk-overlay-container");
      this._document.body.appendChild(container);
      this._containerElement = container;
    };
    OverlayContainer2.decorators = [
      { type: Injectable, args: [{ providedIn: "root" }] }
    ];
    OverlayContainer2.ctorParameters = function() {
      return [
        { type: void 0, decorators: [{ type: Inject, args: [DOCUMENT] }] }
      ];
    };
    OverlayContainer2.ngInjectableDef = defineInjectable({ factory: function OverlayContainer_Factory() {
      return new OverlayContainer2(inject(DOCUMENT));
    }, token: OverlayContainer2, providedIn: "root" });
    return OverlayContainer2;
  })()
);
({
  deps: [
    [new Optional(), new SkipSelf(), OverlayContainer$1],
    /** @type {?} */
    DOCUMENT
  ]
});
var OverlayRef$1 = (
  /** @class */
  (function() {
    function OverlayRef2(_portalOutlet, _host, _pane, _config, _ngZone, _keyboardDispatcher, _document, _location) {
      var _this = this;
      this._portalOutlet = _portalOutlet;
      this._host = _host;
      this._pane = _pane;
      this._config = _config;
      this._ngZone = _ngZone;
      this._keyboardDispatcher = _keyboardDispatcher;
      this._document = _document;
      this._location = _location;
      this._backdropElement = null;
      this._backdropClick = new Subject();
      this._attachments = new Subject();
      this._detachments = new Subject();
      this._locationChanges = Subscription.EMPTY;
      this._keydownEventsObservable = new Observable(function(observer) {
        var subscription = _this._keydownEvents.subscribe(observer);
        _this._keydownEventSubscriptions++;
        return function() {
          subscription.unsubscribe();
          _this._keydownEventSubscriptions--;
        };
      });
      this._keydownEvents = new Subject();
      this._keydownEventSubscriptions = 0;
      if (_config.scrollStrategy) {
        _config.scrollStrategy.attach(this);
      }
      this._positionStrategy = _config.positionStrategy;
    }
    Object.defineProperty(OverlayRef2.prototype, "overlayElement", {
      /** The overlay's HTML element */
      get: (
        /**
        * The overlay's HTML element
        * @return {?}
        */
        function() {
          return this._pane;
        }
      ),
      enumerable: true,
      configurable: true
    });
    Object.defineProperty(OverlayRef2.prototype, "backdropElement", {
      /** The overlay's backdrop HTML element. */
      get: (
        /**
        * The overlay's backdrop HTML element.
        * @return {?}
        */
        function() {
          return this._backdropElement;
        }
      ),
      enumerable: true,
      configurable: true
    });
    Object.defineProperty(OverlayRef2.prototype, "hostElement", {
      /**
       * Wrapper around the panel element. Can be used for advanced
       * positioning where a wrapper with specific styling is
       * required around the overlay pane.
       */
      get: (
        /**
        * Wrapper around the panel element. Can be used for advanced
        * positioning where a wrapper with specific styling is
        * required around the overlay pane.
        * @return {?}
        */
        function() {
          return this._host;
        }
      ),
      enumerable: true,
      configurable: true
    });
    OverlayRef2.prototype.attach = /**
    * Attaches content, given via a Portal, to the overlay.
    * If the overlay is configured to have a backdrop, it will be created.
    *
    * @param {?} portal Portal instance to which to attach the overlay.
    * @return {?} The portal attachment result.
    */
    function(portal) {
      var _this = this;
      var attachResult = this._portalOutlet.attach(portal);
      if (this._positionStrategy) {
        this._positionStrategy.attach(this);
      }
      if (!this._host.parentElement && this._previousHostParent) {
        this._previousHostParent.appendChild(this._host);
      }
      this._updateStackingOrder();
      this._updateElementSize();
      this._updateElementDirection();
      if (this._config.scrollStrategy) {
        this._config.scrollStrategy.enable();
      }
      this._ngZone.onStable.asObservable().pipe(take(1)).subscribe(function() {
        if (_this.hasAttached()) {
          _this.updatePosition();
        }
      });
      this._togglePointerEvents(true);
      if (this._config.hasBackdrop) {
        this._attachBackdrop();
      }
      if (this._config.panelClass) {
        this._toggleClasses(this._pane, this._config.panelClass, true);
      }
      this._attachments.next();
      this._keyboardDispatcher.add(this);
      if (this._config.disposeOnNavigation && this._location) {
        this._locationChanges = this._location.subscribe(function() {
          return _this.dispose();
        });
      }
      return attachResult;
    };
    OverlayRef2.prototype.detach = /**
    * Detaches an overlay from a portal.
    * @return {?} The portal detachment result.
    */
    function() {
      if (!this.hasAttached()) {
        return;
      }
      this.detachBackdrop();
      this._togglePointerEvents(false);
      if (this._positionStrategy && this._positionStrategy.detach) {
        this._positionStrategy.detach();
      }
      if (this._config.scrollStrategy) {
        this._config.scrollStrategy.disable();
      }
      var detachmentResult = this._portalOutlet.detach();
      this._detachments.next();
      this._keyboardDispatcher.remove(this);
      this._detachContentWhenStable();
      this._locationChanges.unsubscribe();
      return detachmentResult;
    };
    OverlayRef2.prototype.dispose = /**
    * Cleans up the overlay from the DOM.
    * @return {?}
    */
    function() {
      var isAttached = this.hasAttached();
      if (this._positionStrategy) {
        this._positionStrategy.dispose();
      }
      if (this._config.scrollStrategy) {
        this._config.scrollStrategy.disable();
      }
      this.detachBackdrop();
      this._locationChanges.unsubscribe();
      this._keyboardDispatcher.remove(this);
      this._portalOutlet.dispose();
      this._attachments.complete();
      this._backdropClick.complete();
      this._keydownEvents.complete();
      if (this._host && this._host.parentNode) {
        this._host.parentNode.removeChild(this._host);
        this._host = /** @type {?} */
        null;
      }
      this._previousHostParent = this._pane = /** @type {?} */
      null;
      if (isAttached) {
        this._detachments.next();
      }
      this._detachments.complete();
    };
    OverlayRef2.prototype.hasAttached = /**
    * Whether the overlay has attached content.
    * @return {?}
    */
    function() {
      return this._portalOutlet.hasAttached();
    };
    OverlayRef2.prototype.backdropClick = /**
    * Gets an observable that emits when the backdrop has been clicked.
    * @return {?}
    */
    function() {
      return this._backdropClick.asObservable();
    };
    OverlayRef2.prototype.attachments = /**
    * Gets an observable that emits when the overlay has been attached.
    * @return {?}
    */
    function() {
      return this._attachments.asObservable();
    };
    OverlayRef2.prototype.detachments = /**
    * Gets an observable that emits when the overlay has been detached.
    * @return {?}
    */
    function() {
      return this._detachments.asObservable();
    };
    OverlayRef2.prototype.keydownEvents = /**
    * Gets an observable of keydown events targeted to this overlay.
    * @return {?}
    */
    function() {
      return this._keydownEventsObservable;
    };
    OverlayRef2.prototype.getConfig = /**
    * Gets the current overlay configuration, which is immutable.
    * @return {?}
    */
    function() {
      return this._config;
    };
    OverlayRef2.prototype.updatePosition = /**
    * Updates the position of the overlay based on the position strategy.
    * @return {?}
    */
    function() {
      if (this._positionStrategy) {
        this._positionStrategy.apply();
      }
    };
    OverlayRef2.prototype.updatePositionStrategy = /**
    * Switches to a new position strategy and updates the overlay position.
    * @param {?} strategy
    * @return {?}
    */
    function(strategy) {
      if (strategy === this._positionStrategy) {
        return;
      }
      if (this._positionStrategy) {
        this._positionStrategy.dispose();
      }
      this._positionStrategy = strategy;
      if (this.hasAttached()) {
        strategy.attach(this);
        this.updatePosition();
      }
    };
    OverlayRef2.prototype.updateSize = /**
    * Update the size properties of the overlay.
    * @param {?} sizeConfig
    * @return {?}
    */
    function(sizeConfig) {
      this._config = __assign$1({}, this._config, sizeConfig);
      this._updateElementSize();
    };
    OverlayRef2.prototype.setDirection = /**
    * Sets the LTR/RTL direction for the overlay.
    * @param {?} dir
    * @return {?}
    */
    function(dir) {
      this._config = __assign$1({}, this._config, { direction: dir });
      this._updateElementDirection();
    };
    OverlayRef2.prototype.addPanelClass = /**
    * Add a CSS class or an array of classes to the overlay pane.
    * @param {?} classes
    * @return {?}
    */
    function(classes) {
      if (this._pane) {
        this._toggleClasses(this._pane, classes, true);
      }
    };
    OverlayRef2.prototype.removePanelClass = /**
    * Remove a CSS class or an array of classes from the overlay pane.
    * @param {?} classes
    * @return {?}
    */
    function(classes) {
      if (this._pane) {
        this._toggleClasses(this._pane, classes, false);
      }
    };
    OverlayRef2.prototype.getDirection = /**
    * Returns the layout direction of the overlay panel.
    * @return {?}
    */
    function() {
      var direction = this._config.direction;
      if (!direction) {
        return "ltr";
      }
      return typeof direction === "string" ? direction : direction.value;
    };
    OverlayRef2.prototype._updateElementDirection = /**
    * Updates the text direction of the overlay panel.
    * @private
    * @return {?}
    */
    function() {
      this._host.setAttribute("dir", this.getDirection());
    };
    OverlayRef2.prototype._updateElementSize = /**
    * Updates the size of the overlay element based on the overlay config.
    * @private
    * @return {?}
    */
    function() {
      var style2 = this._pane.style;
      style2.width = coerceCssPixelValue(this._config.width);
      style2.height = coerceCssPixelValue(this._config.height);
      style2.minWidth = coerceCssPixelValue(this._config.minWidth);
      style2.minHeight = coerceCssPixelValue(this._config.minHeight);
      style2.maxWidth = coerceCssPixelValue(this._config.maxWidth);
      style2.maxHeight = coerceCssPixelValue(this._config.maxHeight);
    };
    OverlayRef2.prototype._togglePointerEvents = /**
    * Toggles the pointer events for the overlay pane element.
    * @private
    * @param {?} enablePointer
    * @return {?}
    */
    function(enablePointer) {
      this._pane.style.pointerEvents = enablePointer ? "auto" : "none";
    };
    OverlayRef2.prototype._attachBackdrop = /**
    * Attaches a backdrop for this overlay.
    * @private
    * @return {?}
    */
    function() {
      var _this = this;
      var showingClass = "cdk-overlay-backdrop-showing";
      this._backdropElement = this._document.createElement("div");
      this._backdropElement.classList.add("cdk-overlay-backdrop");
      if (this._config.backdropClass) {
        this._toggleClasses(this._backdropElement, this._config.backdropClass, true);
      }
      /** @type {?} */
      this._host.parentElement.insertBefore(this._backdropElement, this._host);
      this._backdropElement.addEventListener("click", function(event) {
        return _this._backdropClick.next(event);
      });
      if (typeof requestAnimationFrame !== "undefined") {
        this._ngZone.runOutsideAngular(function() {
          requestAnimationFrame(function() {
            if (_this._backdropElement) {
              _this._backdropElement.classList.add(showingClass);
            }
          });
        });
      } else {
        this._backdropElement.classList.add(showingClass);
      }
    };
    OverlayRef2.prototype._updateStackingOrder = /**
    * Updates the stacking order of the element, moving it to the top if necessary.
    * This is required in cases where one overlay was detached, while another one,
    * that should be behind it, was destroyed. The next time both of them are opened,
    * the stacking will be wrong, because the detached element's pane will still be
    * in its original DOM position.
    * @private
    * @return {?}
    */
    function() {
      if (this._host.nextSibling) {
        /** @type {?} */
        this._host.parentNode.appendChild(this._host);
      }
    };
    OverlayRef2.prototype.detachBackdrop = /**
    * Detaches the backdrop (if any) associated with the overlay.
    * @return {?}
    */
    function() {
      var _this = this;
      var backdropToDetach = this._backdropElement;
      if (!backdropToDetach) {
        return;
      }
      var timeoutId;
      var finishDetach = function() {
        if (backdropToDetach && backdropToDetach.parentNode) {
          backdropToDetach.parentNode.removeChild(backdropToDetach);
        }
        if (_this._backdropElement == backdropToDetach) {
          _this._backdropElement = null;
        }
        if (_this._config.backdropClass) {
          _this._toggleClasses(
            /** @type {?} */
            backdropToDetach,
            _this._config.backdropClass,
            false
          );
        }
        clearTimeout(timeoutId);
      };
      backdropToDetach.classList.remove("cdk-overlay-backdrop-showing");
      this._ngZone.runOutsideAngular(function() {
        /** @type {?} */
        backdropToDetach.addEventListener("transitionend", finishDetach);
      });
      backdropToDetach.style.pointerEvents = "none";
      timeoutId = this._ngZone.runOutsideAngular(function() {
        return setTimeout(finishDetach, 500);
      });
    };
    OverlayRef2.prototype._toggleClasses = /**
    * Toggles a single CSS class or an array of classes on an element.
    * @private
    * @param {?} element
    * @param {?} cssClasses
    * @param {?} isAdd
    * @return {?}
    */
    function(element, cssClasses, isAdd) {
      var classList = element.classList;
      coerceArray(cssClasses).forEach(function(cssClass) {
        isAdd ? classList.add(cssClass) : classList.remove(cssClass);
      });
    };
    OverlayRef2.prototype._detachContentWhenStable = /**
    * Detaches the overlay content next time the zone stabilizes.
    * @private
    * @return {?}
    */
    function() {
      var _this = this;
      this._ngZone.runOutsideAngular(function() {
        var subscription = _this._ngZone.onStable.asObservable().pipe(takeUntil(merge(_this._attachments, _this._detachments))).subscribe(function() {
          if (!_this._pane || !_this._host || _this._pane.children.length === 0) {
            if (_this._pane && _this._config.panelClass) {
              _this._toggleClasses(_this._pane, _this._config.panelClass, false);
            }
            if (_this._host && _this._host.parentElement) {
              _this._previousHostParent = _this._host.parentElement;
              _this._previousHostParent.removeChild(_this._host);
            }
            subscription.unsubscribe();
          }
        });
      });
    };
    return OverlayRef2;
  })()
);
var boundingBoxClass = "cdk-overlay-connected-position-bounding-box";
var FlexibleConnectedPositionStrategy = (
  /** @class */
  (function() {
    function FlexibleConnectedPositionStrategy2(connectedTo, _viewportRuler, _document, _platform, _overlayContainer) {
      var _this = this;
      this._viewportRuler = _viewportRuler;
      this._document = _document;
      this._platform = _platform;
      this._overlayContainer = _overlayContainer;
      this._lastBoundingBoxSize = { width: 0, height: 0 };
      this._isPushed = false;
      this._canPush = true;
      this._growAfterOpen = false;
      this._hasFlexibleDimensions = true;
      this._positionLocked = false;
      this._viewportMargin = 0;
      this.scrollables = [];
      this._preferredPositions = [];
      this._positionChanges = new Subject();
      this._resizeSubscription = Subscription.EMPTY;
      this._offsetX = 0;
      this._offsetY = 0;
      this._positionChangeSubscriptions = 0;
      this._appliedPanelClasses = [];
      this.positionChanges = new Observable(function(observer) {
        var subscription = _this._positionChanges.subscribe(observer);
        _this._positionChangeSubscriptions++;
        return function() {
          subscription.unsubscribe();
          _this._positionChangeSubscriptions--;
        };
      });
      this.setOrigin(connectedTo);
    }
    Object.defineProperty(FlexibleConnectedPositionStrategy2.prototype, "positions", {
      /** Ordered list of preferred positions, from most to least desirable. */
      get: (
        /**
        * Ordered list of preferred positions, from most to least desirable.
        * @return {?}
        */
        function() {
          return this._preferredPositions;
        }
      ),
      enumerable: true,
      configurable: true
    });
    FlexibleConnectedPositionStrategy2.prototype.attach = /**
    * Attaches this position strategy to an overlay.
    * @param {?} overlayRef
    * @return {?}
    */
    function(overlayRef) {
      var _this = this;
      if (this._overlayRef && overlayRef !== this._overlayRef) {
        throw Error("This position strategy is already attached to an overlay");
      }
      this._validatePositions();
      overlayRef.hostElement.classList.add(boundingBoxClass);
      this._overlayRef = overlayRef;
      this._boundingBox = overlayRef.hostElement;
      this._pane = overlayRef.overlayElement;
      this._isDisposed = false;
      this._isInitialRender = true;
      this._lastPosition = null;
      this._resizeSubscription.unsubscribe();
      this._resizeSubscription = this._viewportRuler.change().subscribe(function() {
        _this._isInitialRender = true;
        _this.apply();
      });
    };
    FlexibleConnectedPositionStrategy2.prototype.apply = /**
    * Updates the position of the overlay element, using whichever preferred position relative
    * to the origin best fits on-screen.
    *
    * The selection of a position goes as follows:
    *  - If any positions fit completely within the viewport as-is,
    *      choose the first position that does so.
    *  - If flexible dimensions are enabled and at least one satifies the given minimum width/height,
    *      choose the position with the greatest available size modified by the positions' weight.
    *  - If pushing is enabled, take the position that went off-screen the least and push it
    *      on-screen.
    *  - If none of the previous criteria were met, use the position that goes off-screen the least.
    * \@docs-private
    * @return {?}
    */
    function() {
      if (this._isDisposed || this._platform && !this._platform.isBrowser) {
        return;
      }
      if (!this._isInitialRender && this._positionLocked && this._lastPosition) {
        this.reapplyLastPosition();
        return;
      }
      this._clearPanelClasses();
      this._resetOverlayElementStyles();
      this._resetBoundingBoxStyles();
      this._viewportRect = this._getNarrowedViewportRect();
      this._originRect = this._getOriginRect();
      this._overlayRect = this._pane.getBoundingClientRect();
      var originRect = this._originRect;
      var overlayRect = this._overlayRect;
      var viewportRect = this._viewportRect;
      var flexibleFits = [];
      var fallback;
      for (var _i = 0, _a = this._preferredPositions; _i < _a.length; _i++) {
        var pos = _a[_i];
        var originPoint = this._getOriginPoint(originRect, pos);
        var overlayPoint = this._getOverlayPoint(originPoint, overlayRect, pos);
        var overlayFit = this._getOverlayFit(overlayPoint, overlayRect, viewportRect, pos);
        if (overlayFit.isCompletelyWithinViewport) {
          this._isPushed = false;
          this._applyPosition(pos, originPoint);
          return;
        }
        if (this._canFitWithFlexibleDimensions(overlayFit, overlayPoint, viewportRect)) {
          flexibleFits.push({
            position: pos,
            origin: originPoint,
            overlayRect,
            boundingBoxRect: this._calculateBoundingBoxRect(originPoint, pos)
          });
          continue;
        }
        if (!fallback || fallback.overlayFit.visibleArea < overlayFit.visibleArea) {
          fallback = { overlayFit, overlayPoint, originPoint, position: pos, overlayRect };
        }
      }
      if (flexibleFits.length) {
        var bestFit = null;
        var bestScore = -1;
        for (var _b = 0, flexibleFits_1 = flexibleFits; _b < flexibleFits_1.length; _b++) {
          var fit = flexibleFits_1[_b];
          var score = fit.boundingBoxRect.width * fit.boundingBoxRect.height * (fit.position.weight || 1);
          if (score > bestScore) {
            bestScore = score;
            bestFit = fit;
          }
        }
        this._isPushed = false;
        this._applyPosition(
          /** @type {?} */
          bestFit.position,
          /** @type {?} */
          bestFit.origin
        );
        return;
      }
      if (this._canPush) {
        this._isPushed = true;
        this._applyPosition(
          /** @type {?} */
          fallback.position,
          /** @type {?} */
          fallback.originPoint
        );
        return;
      }
      this._applyPosition(
        /** @type {?} */
        fallback.position,
        /** @type {?} */
        fallback.originPoint
      );
    };
    FlexibleConnectedPositionStrategy2.prototype.detach = /**
    * @return {?}
    */
    function() {
      this._clearPanelClasses();
      this._lastPosition = null;
      this._previousPushAmount = null;
      this._resizeSubscription.unsubscribe();
    };
    FlexibleConnectedPositionStrategy2.prototype.dispose = /**
    * Cleanup after the element gets destroyed.
    * @return {?}
    */
    function() {
      if (this._isDisposed) {
        return;
      }
      if (this._boundingBox) {
        extendStyles(
          this._boundingBox.style,
          /** @type {?} */
          {
            top: "",
            left: "",
            right: "",
            bottom: "",
            height: "",
            width: "",
            alignItems: "",
            justifyContent: ""
          }
        );
      }
      if (this._pane) {
        this._resetOverlayElementStyles();
      }
      if (this._overlayRef) {
        this._overlayRef.hostElement.classList.remove(boundingBoxClass);
      }
      this.detach();
      this._positionChanges.complete();
      this._overlayRef = this._boundingBox = /** @type {?} */
      null;
      this._isDisposed = true;
    };
    FlexibleConnectedPositionStrategy2.prototype.reapplyLastPosition = /**
    * This re-aligns the overlay element with the trigger in its last calculated position,
    * even if a position higher in the "preferred positions" list would now fit. This
    * allows one to re-align the panel without changing the orientation of the panel.
    * @return {?}
    */
    function() {
      if (!this._isDisposed && (!this._platform || this._platform.isBrowser)) {
        this._originRect = this._getOriginRect();
        this._overlayRect = this._pane.getBoundingClientRect();
        this._viewportRect = this._getNarrowedViewportRect();
        var lastPosition = this._lastPosition || this._preferredPositions[0];
        var originPoint = this._getOriginPoint(this._originRect, lastPosition);
        this._applyPosition(lastPosition, originPoint);
      }
    };
    FlexibleConnectedPositionStrategy2.prototype.withScrollableContainers = /**
    * Sets the list of Scrollable containers that host the origin element so that
    * on reposition we can evaluate if it or the overlay has been clipped or outside view. Every
    * Scrollable must be an ancestor element of the strategy's origin element.
    * @template THIS
    * @this {THIS}
    * @param {?} scrollables
    * @return {THIS}
    */
    function(scrollables) {
      /** @type {?} */
      this.scrollables = scrollables;
      return (
        /** @type {?} */
        this
      );
    };
    FlexibleConnectedPositionStrategy2.prototype.withPositions = /**
    * Adds new preferred positions.
    * @template THIS
    * @this {THIS}
    * @param {?} positions List of positions options for this overlay.
    * @return {THIS}
    */
    function(positions) {
      /** @type {?} */
      this._preferredPositions = positions;
      if (positions.indexOf(
        /** @type {?} */
        /** @type {?} */
        this._lastPosition
      ) === -1) {
        /** @type {?} */
        this._lastPosition = null;
      }
      /** @type {?} */
      this._validatePositions();
      return (
        /** @type {?} */
        this
      );
    };
    FlexibleConnectedPositionStrategy2.prototype.withViewportMargin = /**
    * Sets a minimum distance the overlay may be positioned to the edge of the viewport.
    * @template THIS
    * @this {THIS}
    * @param {?} margin Required margin between the overlay and the viewport edge in pixels.
    * @return {THIS}
    */
    function(margin) {
      /** @type {?} */
      this._viewportMargin = margin;
      return (
        /** @type {?} */
        this
      );
    };
    FlexibleConnectedPositionStrategy2.prototype.withFlexibleDimensions = /**
    * Sets whether the overlay's width and height can be constrained to fit within the viewport.
    * @template THIS
    * @this {THIS}
    * @param {?=} flexibleDimensions
    * @return {THIS}
    */
    function(flexibleDimensions) {
      if (flexibleDimensions === void 0) {
        flexibleDimensions = true;
      }
      /** @type {?} */
      this._hasFlexibleDimensions = flexibleDimensions;
      return (
        /** @type {?} */
        this
      );
    };
    FlexibleConnectedPositionStrategy2.prototype.withGrowAfterOpen = /**
    * Sets whether the overlay can grow after the initial open via flexible width/height.
    * @template THIS
    * @this {THIS}
    * @param {?=} growAfterOpen
    * @return {THIS}
    */
    function(growAfterOpen) {
      if (growAfterOpen === void 0) {
        growAfterOpen = true;
      }
      /** @type {?} */
      this._growAfterOpen = growAfterOpen;
      return (
        /** @type {?} */
        this
      );
    };
    FlexibleConnectedPositionStrategy2.prototype.withPush = /**
    * Sets whether the overlay can be pushed on-screen if none of the provided positions fit.
    * @template THIS
    * @this {THIS}
    * @param {?=} canPush
    * @return {THIS}
    */
    function(canPush) {
      if (canPush === void 0) {
        canPush = true;
      }
      /** @type {?} */
      this._canPush = canPush;
      return (
        /** @type {?} */
        this
      );
    };
    FlexibleConnectedPositionStrategy2.prototype.withLockedPosition = /**
    * Sets whether the overlay's position should be locked in after it is positioned
    * initially. When an overlay is locked in, it won't attempt to reposition itself
    * when the position is re-applied (e.g. when the user scrolls away).
    * @template THIS
    * @this {THIS}
    * @param {?=} isLocked Whether the overlay should locked in.
    * @return {THIS}
    */
    function(isLocked) {
      if (isLocked === void 0) {
        isLocked = true;
      }
      /** @type {?} */
      this._positionLocked = isLocked;
      return (
        /** @type {?} */
        this
      );
    };
    FlexibleConnectedPositionStrategy2.prototype.setOrigin = /**
    * Sets the origin, relative to which to position the overlay.
    * Using an element origin is useful for building components that need to be positioned
    * relatively to a trigger (e.g. dropdown menus or tooltips), whereas using a point can be
    * used for cases like contextual menus which open relative to the user's pointer.
    * @template THIS
    * @this {THIS}
    * @param {?} origin Reference to the new origin.
    * @return {THIS}
    */
    function(origin) {
      /** @type {?} */
      this._origin = origin;
      return (
        /** @type {?} */
        this
      );
    };
    FlexibleConnectedPositionStrategy2.prototype.withDefaultOffsetX = /**
    * Sets the default offset for the overlay's connection point on the x-axis.
    * @template THIS
    * @this {THIS}
    * @param {?} offset New offset in the X axis.
    * @return {THIS}
    */
    function(offset2) {
      /** @type {?} */
      this._offsetX = offset2;
      return (
        /** @type {?} */
        this
      );
    };
    FlexibleConnectedPositionStrategy2.prototype.withDefaultOffsetY = /**
    * Sets the default offset for the overlay's connection point on the y-axis.
    * @template THIS
    * @this {THIS}
    * @param {?} offset New offset in the Y axis.
    * @return {THIS}
    */
    function(offset2) {
      /** @type {?} */
      this._offsetY = offset2;
      return (
        /** @type {?} */
        this
      );
    };
    FlexibleConnectedPositionStrategy2.prototype.withTransformOriginOn = /**
    * Configures that the position strategy should set a `transform-origin` on some elements
    * inside the overlay, depending on the current position that is being applied. This is
    * useful for the cases where the origin of an animation can change depending on the
    * alignment of the overlay.
    * @template THIS
    * @this {THIS}
    * @param {?} selector CSS selector that will be used to find the target
    *    elements onto which to set the transform origin.
    * @return {THIS}
    */
    function(selector) {
      /** @type {?} */
      this._transformOriginSelector = selector;
      return (
        /** @type {?} */
        this
      );
    };
    FlexibleConnectedPositionStrategy2.prototype._getOriginPoint = /**
    * Gets the (x, y) coordinate of a connection point on the origin based on a relative position.
    * @private
    * @param {?} originRect
    * @param {?} pos
    * @return {?}
    */
    function(originRect, pos) {
      var x;
      if (pos.originX == "center") {
        x = originRect.left + originRect.width / 2;
      } else {
        var startX = this._isRtl() ? originRect.right : originRect.left;
        var endX = this._isRtl() ? originRect.left : originRect.right;
        x = pos.originX == "start" ? startX : endX;
      }
      var y;
      if (pos.originY == "center") {
        y = originRect.top + originRect.height / 2;
      } else {
        y = pos.originY == "top" ? originRect.top : originRect.bottom;
      }
      return { x, y };
    };
    FlexibleConnectedPositionStrategy2.prototype._getOverlayPoint = /**
    * Gets the (x, y) coordinate of the top-left corner of the overlay given a given position and
    * origin point to which the overlay should be connected.
    * @private
    * @param {?} originPoint
    * @param {?} overlayRect
    * @param {?} pos
    * @return {?}
    */
    function(originPoint, overlayRect, pos) {
      var overlayStartX;
      if (pos.overlayX == "center") {
        overlayStartX = -overlayRect.width / 2;
      } else if (pos.overlayX === "start") {
        overlayStartX = this._isRtl() ? -overlayRect.width : 0;
      } else {
        overlayStartX = this._isRtl() ? 0 : -overlayRect.width;
      }
      var overlayStartY;
      if (pos.overlayY == "center") {
        overlayStartY = -overlayRect.height / 2;
      } else {
        overlayStartY = pos.overlayY == "top" ? 0 : -overlayRect.height;
      }
      return {
        x: originPoint.x + overlayStartX,
        y: originPoint.y + overlayStartY
      };
    };
    FlexibleConnectedPositionStrategy2.prototype._getOverlayFit = /**
    * Gets how well an overlay at the given point will fit within the viewport.
    * @private
    * @param {?} point
    * @param {?} overlay
    * @param {?} viewport
    * @param {?} position
    * @return {?}
    */
    function(point, overlay, viewport2, position) {
      var x = point.x, y = point.y;
      var offsetX = this._getOffset(position, "x");
      var offsetY = this._getOffset(position, "y");
      if (offsetX) {
        x += offsetX;
      }
      if (offsetY) {
        y += offsetY;
      }
      var leftOverflow = 0 - x;
      var rightOverflow = x + overlay.width - viewport2.width;
      var topOverflow = 0 - y;
      var bottomOverflow = y + overlay.height - viewport2.height;
      var visibleWidth = this._subtractOverflows(overlay.width, leftOverflow, rightOverflow);
      var visibleHeight = this._subtractOverflows(overlay.height, topOverflow, bottomOverflow);
      var visibleArea = visibleWidth * visibleHeight;
      return {
        visibleArea,
        isCompletelyWithinViewport: overlay.width * overlay.height === visibleArea,
        fitsInViewportVertically: visibleHeight === overlay.height,
        fitsInViewportHorizontally: visibleWidth == overlay.width
      };
    };
    FlexibleConnectedPositionStrategy2.prototype._canFitWithFlexibleDimensions = /**
    * Whether the overlay can fit within the viewport when it may resize either its width or height.
    * @private
    * @param {?} fit How well the overlay fits in the viewport at some position.
    * @param {?} point The (x, y) coordinates of the overlat at some position.
    * @param {?} viewport The geometry of the viewport.
    * @return {?}
    */
    function(fit, point, viewport2) {
      if (this._hasFlexibleDimensions) {
        var availableHeight = viewport2.bottom - point.y;
        var availableWidth = viewport2.right - point.x;
        var minHeight = this._overlayRef.getConfig().minHeight;
        var minWidth = this._overlayRef.getConfig().minWidth;
        var verticalFit = fit.fitsInViewportVertically || minHeight != null && minHeight <= availableHeight;
        var horizontalFit = fit.fitsInViewportHorizontally || minWidth != null && minWidth <= availableWidth;
        return verticalFit && horizontalFit;
      }
    };
    FlexibleConnectedPositionStrategy2.prototype._pushOverlayOnScreen = /**
    * Gets the point at which the overlay can be "pushed" on-screen. If the overlay is larger than
    * the viewport, the top-left corner will be pushed on-screen (with overflow occuring on the
    * right and bottom).
    *
    * @private
    * @param {?} start Starting point from which the overlay is pushed.
    * @param {?} overlay Dimensions of the overlay.
    * @param {?} scrollPosition Current viewport scroll position.
    * @return {?} The point at which to position the overlay after pushing. This is effectively a new
    *     originPoint.
    */
    function(start2, overlay, scrollPosition) {
      if (this._previousPushAmount && this._positionLocked) {
        return {
          x: start2.x + this._previousPushAmount.x,
          y: start2.y + this._previousPushAmount.y
        };
      }
      var viewport2 = this._viewportRect;
      var overflowRight = Math.max(start2.x + overlay.width - viewport2.right, 0);
      var overflowBottom = Math.max(start2.y + overlay.height - viewport2.bottom, 0);
      var overflowTop = Math.max(viewport2.top - scrollPosition.top - start2.y, 0);
      var overflowLeft = Math.max(viewport2.left - scrollPosition.left - start2.x, 0);
      var pushX = 0;
      var pushY = 0;
      if (overlay.width <= viewport2.width) {
        pushX = overflowLeft || -overflowRight;
      } else {
        pushX = start2.x < this._viewportMargin ? viewport2.left - scrollPosition.left - start2.x : 0;
      }
      if (overlay.height <= viewport2.height) {
        pushY = overflowTop || -overflowBottom;
      } else {
        pushY = start2.y < this._viewportMargin ? viewport2.top - scrollPosition.top - start2.y : 0;
      }
      this._previousPushAmount = { x: pushX, y: pushY };
      return {
        x: start2.x + pushX,
        y: start2.y + pushY
      };
    };
    FlexibleConnectedPositionStrategy2.prototype._applyPosition = /**
    * Applies a computed position to the overlay and emits a position change.
    * @private
    * @param {?} position The position preference
    * @param {?} originPoint The point on the origin element where the overlay is connected.
    * @return {?}
    */
    function(position, originPoint) {
      this._setTransformOrigin(position);
      this._setOverlayElementStyles(originPoint, position);
      this._setBoundingBoxStyles(originPoint, position);
      if (position.panelClass) {
        this._addPanelClasses(position.panelClass);
      }
      this._lastPosition = position;
      if (this._positionChangeSubscriptions > 0) {
        var scrollableViewProperties = this._getScrollVisibility();
        var changeEvent = new ConnectedOverlayPositionChange(position, scrollableViewProperties);
        this._positionChanges.next(changeEvent);
      }
      this._isInitialRender = false;
    };
    FlexibleConnectedPositionStrategy2.prototype._setTransformOrigin = /**
    * Sets the transform origin based on the configured selector and the passed-in position.
    * @private
    * @param {?} position
    * @return {?}
    */
    function(position) {
      if (!this._transformOriginSelector) {
        return;
      }
      var elements = (
        /** @type {?} */
        this._boundingBox.querySelectorAll(this._transformOriginSelector)
      );
      var xOrigin;
      var yOrigin = position.overlayY;
      if (position.overlayX === "center") {
        xOrigin = "center";
      } else if (this._isRtl()) {
        xOrigin = position.overlayX === "start" ? "right" : "left";
      } else {
        xOrigin = position.overlayX === "start" ? "left" : "right";
      }
      for (var i = 0; i < elements.length; i++) {
        elements[i].style.transformOrigin = xOrigin + " " + yOrigin;
      }
    };
    FlexibleConnectedPositionStrategy2.prototype._calculateBoundingBoxRect = /**
    * Gets the position and size of the overlay's sizing container.
    *
    * This method does no measuring and applies no styles so that we can cheaply compute the
    * bounds for all positions and choose the best fit based on these results.
    * @private
    * @param {?} origin
    * @param {?} position
    * @return {?}
    */
    function(origin, position) {
      var viewport2 = this._viewportRect;
      var isRtl = this._isRtl();
      var height;
      var top2;
      var bottom2;
      if (position.overlayY === "top") {
        top2 = origin.y;
        height = viewport2.height - top2 + this._viewportMargin;
      } else if (position.overlayY === "bottom") {
        bottom2 = viewport2.height - origin.y + this._viewportMargin * 2;
        height = viewport2.height - bottom2 + this._viewportMargin;
      } else {
        var smallestDistanceToViewportEdge = Math.min(viewport2.bottom - origin.y + viewport2.top, origin.y);
        var previousHeight = this._lastBoundingBoxSize.height;
        height = smallestDistanceToViewportEdge * 2;
        top2 = origin.y - smallestDistanceToViewportEdge;
        if (height > previousHeight && !this._isInitialRender && !this._growAfterOpen) {
          top2 = origin.y - previousHeight / 2;
        }
      }
      var isBoundedByRightViewportEdge = position.overlayX === "start" && !isRtl || position.overlayX === "end" && isRtl;
      var isBoundedByLeftViewportEdge = position.overlayX === "end" && !isRtl || position.overlayX === "start" && isRtl;
      var width;
      var left2;
      var right2;
      if (isBoundedByLeftViewportEdge) {
        right2 = viewport2.right - origin.x + this._viewportMargin;
        width = origin.x - viewport2.left;
      } else if (isBoundedByRightViewportEdge) {
        left2 = origin.x;
        width = viewport2.right - origin.x;
      } else {
        var smallestDistanceToViewportEdge = Math.min(viewport2.right - origin.x + viewport2.left, origin.x);
        var previousWidth = this._lastBoundingBoxSize.width;
        width = smallestDistanceToViewportEdge * 2;
        left2 = origin.x - smallestDistanceToViewportEdge;
        if (width > previousWidth && !this._isInitialRender && !this._growAfterOpen) {
          left2 = origin.x - previousWidth / 2;
        }
      }
      return { top: (
        /** @type {?} */
        top2
      ), left: (
        /** @type {?} */
        left2
      ), bottom: (
        /** @type {?} */
        bottom2
      ), right: (
        /** @type {?} */
        right2
      ), width, height };
    };
    FlexibleConnectedPositionStrategy2.prototype._setBoundingBoxStyles = /**
    * Sets the position and size of the overlay's sizing wrapper. The wrapper is positioned on the
    * origin's connection point and stetches to the bounds of the viewport.
    *
    * @private
    * @param {?} origin The point on the origin element where the overlay is connected.
    * @param {?} position The position preference
    * @return {?}
    */
    function(origin, position) {
      var boundingBoxRect = this._calculateBoundingBoxRect(origin, position);
      if (!this._isInitialRender && !this._growAfterOpen) {
        boundingBoxRect.height = Math.min(boundingBoxRect.height, this._lastBoundingBoxSize.height);
        boundingBoxRect.width = Math.min(boundingBoxRect.width, this._lastBoundingBoxSize.width);
      }
      var styles = (
        /** @type {?} */
        {}
      );
      if (this._hasExactPosition()) {
        styles.top = styles.left = "0";
        styles.bottom = styles.right = "";
        styles.width = styles.height = "100%";
      } else {
        var maxHeight = this._overlayRef.getConfig().maxHeight;
        var maxWidth = this._overlayRef.getConfig().maxWidth;
        styles.height = coerceCssPixelValue(boundingBoxRect.height);
        styles.top = coerceCssPixelValue(boundingBoxRect.top);
        styles.bottom = coerceCssPixelValue(boundingBoxRect.bottom);
        styles.width = coerceCssPixelValue(boundingBoxRect.width);
        styles.left = coerceCssPixelValue(boundingBoxRect.left);
        styles.right = coerceCssPixelValue(boundingBoxRect.right);
        if (position.overlayX === "center") {
          styles.alignItems = "center";
        } else {
          styles.alignItems = position.overlayX === "end" ? "flex-end" : "flex-start";
        }
        if (position.overlayY === "center") {
          styles.justifyContent = "center";
        } else {
          styles.justifyContent = position.overlayY === "bottom" ? "flex-end" : "flex-start";
        }
        if (maxHeight) {
          styles.maxHeight = coerceCssPixelValue(maxHeight);
        }
        if (maxWidth) {
          styles.maxWidth = coerceCssPixelValue(maxWidth);
        }
      }
      this._lastBoundingBoxSize = boundingBoxRect;
      extendStyles(
        /** @type {?} */
        this._boundingBox.style,
        styles
      );
    };
    FlexibleConnectedPositionStrategy2.prototype._resetBoundingBoxStyles = /**
    * Resets the styles for the bounding box so that a new positioning can be computed.
    * @private
    * @return {?}
    */
    function() {
      extendStyles(
        /** @type {?} */
        this._boundingBox.style,
        /** @type {?} */
        {
          top: "0",
          left: "0",
          right: "0",
          bottom: "0",
          height: "",
          width: "",
          alignItems: "",
          justifyContent: ""
        }
      );
    };
    FlexibleConnectedPositionStrategy2.prototype._resetOverlayElementStyles = /**
    * Resets the styles for the overlay pane so that a new positioning can be computed.
    * @private
    * @return {?}
    */
    function() {
      extendStyles(
        this._pane.style,
        /** @type {?} */
        {
          top: "",
          left: "",
          bottom: "",
          right: "",
          position: "",
          transform: ""
        }
      );
    };
    FlexibleConnectedPositionStrategy2.prototype._setOverlayElementStyles = /**
    * Sets positioning styles to the overlay element.
    * @private
    * @param {?} originPoint
    * @param {?} position
    * @return {?}
    */
    function(originPoint, position) {
      var styles = (
        /** @type {?} */
        {}
      );
      if (this._hasExactPosition()) {
        var scrollPosition = this._viewportRuler.getViewportScrollPosition();
        extendStyles(styles, this._getExactOverlayY(position, originPoint, scrollPosition));
        extendStyles(styles, this._getExactOverlayX(position, originPoint, scrollPosition));
      } else {
        styles.position = "static";
      }
      var transformString = "";
      var offsetX = this._getOffset(position, "x");
      var offsetY = this._getOffset(position, "y");
      if (offsetX) {
        transformString += "translateX(" + offsetX + "px) ";
      }
      if (offsetY) {
        transformString += "translateY(" + offsetY + "px)";
      }
      styles.transform = transformString.trim();
      if (this._hasFlexibleDimensions && this._overlayRef.getConfig().maxHeight) {
        styles.maxHeight = "";
      }
      if (this._hasFlexibleDimensions && this._overlayRef.getConfig().maxWidth) {
        styles.maxWidth = "";
      }
      extendStyles(this._pane.style, styles);
    };
    FlexibleConnectedPositionStrategy2.prototype._getExactOverlayY = /**
    * Gets the exact top/bottom for the overlay when not using flexible sizing or when pushing.
    * @private
    * @param {?} position
    * @param {?} originPoint
    * @param {?} scrollPosition
    * @return {?}
    */
    function(position, originPoint, scrollPosition) {
      var styles = (
        /** @type {?} */
        { top: null, bottom: null }
      );
      var overlayPoint = this._getOverlayPoint(originPoint, this._overlayRect, position);
      if (this._isPushed) {
        overlayPoint = this._pushOverlayOnScreen(overlayPoint, this._overlayRect, scrollPosition);
      }
      var virtualKeyboardOffset = this._overlayContainer ? this._overlayContainer.getContainerElement().getBoundingClientRect().top : 0;
      overlayPoint.y -= virtualKeyboardOffset;
      if (position.overlayY === "bottom") {
        var documentHeight = (
          /** @type {?} */
          this._document.documentElement.clientHeight
        );
        styles.bottom = documentHeight - (overlayPoint.y + this._overlayRect.height) + "px";
      } else {
        styles.top = coerceCssPixelValue(overlayPoint.y);
      }
      return styles;
    };
    FlexibleConnectedPositionStrategy2.prototype._getExactOverlayX = /**
    * Gets the exact left/right for the overlay when not using flexible sizing or when pushing.
    * @private
    * @param {?} position
    * @param {?} originPoint
    * @param {?} scrollPosition
    * @return {?}
    */
    function(position, originPoint, scrollPosition) {
      var styles = (
        /** @type {?} */
        { left: null, right: null }
      );
      var overlayPoint = this._getOverlayPoint(originPoint, this._overlayRect, position);
      if (this._isPushed) {
        overlayPoint = this._pushOverlayOnScreen(overlayPoint, this._overlayRect, scrollPosition);
      }
      var horizontalStyleProperty;
      if (this._isRtl()) {
        horizontalStyleProperty = position.overlayX === "end" ? "left" : "right";
      } else {
        horizontalStyleProperty = position.overlayX === "end" ? "right" : "left";
      }
      if (horizontalStyleProperty === "right") {
        var documentWidth = (
          /** @type {?} */
          this._document.documentElement.clientWidth
        );
        styles.right = documentWidth - (overlayPoint.x + this._overlayRect.width) + "px";
      } else {
        styles.left = coerceCssPixelValue(overlayPoint.x);
      }
      return styles;
    };
    FlexibleConnectedPositionStrategy2.prototype._getScrollVisibility = /**
    * Gets the view properties of the trigger and overlay, including whether they are clipped
    * or completely outside the view of any of the strategy's scrollables.
    * @private
    * @return {?}
    */
    function() {
      var originBounds = this._getOriginRect();
      var overlayBounds = this._pane.getBoundingClientRect();
      var scrollContainerBounds = this.scrollables.map(function(scrollable) {
        return scrollable.getElementRef().nativeElement.getBoundingClientRect();
      });
      return {
        isOriginClipped: isElementClippedByScrolling(originBounds, scrollContainerBounds),
        isOriginOutsideView: isElementScrolledOutsideView(originBounds, scrollContainerBounds),
        isOverlayClipped: isElementClippedByScrolling(overlayBounds, scrollContainerBounds),
        isOverlayOutsideView: isElementScrolledOutsideView(overlayBounds, scrollContainerBounds)
      };
    };
    FlexibleConnectedPositionStrategy2.prototype._subtractOverflows = /**
    * Subtracts the amount that an element is overflowing on an axis from it's length.
    * @private
    * @param {?} length
    * @param {...?} overflows
    * @return {?}
    */
    function(length) {
      var overflows = [];
      for (var _i = 1; _i < arguments.length; _i++) {
        overflows[_i - 1] = arguments[_i];
      }
      return overflows.reduce(function(currentValue, currentOverflow) {
        return currentValue - Math.max(currentOverflow, 0);
      }, length);
    };
    FlexibleConnectedPositionStrategy2.prototype._getNarrowedViewportRect = /**
    * Narrows the given viewport rect by the current _viewportMargin.
    * @private
    * @return {?}
    */
    function() {
      var width = (
        /** @type {?} */
        this._document.documentElement.clientWidth
      );
      var height = (
        /** @type {?} */
        this._document.documentElement.clientHeight
      );
      var scrollPosition = this._viewportRuler.getViewportScrollPosition();
      return {
        top: scrollPosition.top + this._viewportMargin,
        left: scrollPosition.left + this._viewportMargin,
        right: scrollPosition.left + width - this._viewportMargin,
        bottom: scrollPosition.top + height - this._viewportMargin,
        width: width - 2 * this._viewportMargin,
        height: height - 2 * this._viewportMargin
      };
    };
    FlexibleConnectedPositionStrategy2.prototype._isRtl = /**
    * Whether the we're dealing with an RTL context
    * @private
    * @return {?}
    */
    function() {
      return this._overlayRef.getDirection() === "rtl";
    };
    FlexibleConnectedPositionStrategy2.prototype._hasExactPosition = /**
    * Determines whether the overlay uses exact or flexible positioning.
    * @private
    * @return {?}
    */
    function() {
      return !this._hasFlexibleDimensions || this._isPushed;
    };
    FlexibleConnectedPositionStrategy2.prototype._getOffset = /**
    * Retrieves the offset of a position along the x or y axis.
    * @private
    * @param {?} position
    * @param {?} axis
    * @return {?}
    */
    function(position, axis) {
      if (axis === "x") {
        return position.offsetX == null ? this._offsetX : position.offsetX;
      }
      return position.offsetY == null ? this._offsetY : position.offsetY;
    };
    FlexibleConnectedPositionStrategy2.prototype._validatePositions = /**
    * Validates that the current position match the expected values.
    * @private
    * @return {?}
    */
    function() {
      if (!this._preferredPositions.length) {
        throw Error("FlexibleConnectedPositionStrategy: At least one position is required.");
      }
      this._preferredPositions.forEach(function(pair) {
        validateHorizontalPosition("originX", pair.originX);
        validateVerticalPosition("originY", pair.originY);
        validateHorizontalPosition("overlayX", pair.overlayX);
        validateVerticalPosition("overlayY", pair.overlayY);
      });
    };
    FlexibleConnectedPositionStrategy2.prototype._addPanelClasses = /**
    * Adds a single CSS class or an array of classes on the overlay panel.
    * @private
    * @param {?} cssClasses
    * @return {?}
    */
    function(cssClasses) {
      var _this = this;
      if (this._pane) {
        coerceArray(cssClasses).forEach(function(cssClass) {
          if (_this._appliedPanelClasses.indexOf(cssClass) === -1) {
            _this._appliedPanelClasses.push(cssClass);
            _this._pane.classList.add(cssClass);
          }
        });
      }
    };
    FlexibleConnectedPositionStrategy2.prototype._clearPanelClasses = /**
    * Clears the classes that the position strategy has applied from the overlay panel.
    * @private
    * @return {?}
    */
    function() {
      var _this = this;
      if (this._pane) {
        this._appliedPanelClasses.forEach(function(cssClass) {
          return _this._pane.classList.remove(cssClass);
        });
        this._appliedPanelClasses = [];
      }
    };
    FlexibleConnectedPositionStrategy2.prototype._getOriginRect = /**
    * Returns the ClientRect of the current origin.
    * @private
    * @return {?}
    */
    function() {
      var origin = this._origin;
      if (origin instanceof ElementRef) {
        return origin.nativeElement.getBoundingClientRect();
      }
      if (origin instanceof HTMLElement) {
        return origin.getBoundingClientRect();
      }
      return {
        top: origin.y,
        bottom: origin.y,
        left: origin.x,
        right: origin.x,
        height: 0,
        width: 0
      };
    };
    return FlexibleConnectedPositionStrategy2;
  })()
);
function extendStyles(dest, source) {
  for (var key in source) {
    if (source.hasOwnProperty(key)) {
      dest[key] = source[key];
    }
  }
  return dest;
}
var ConnectedPositionStrategy = (
  /** @class */
  (function() {
    function ConnectedPositionStrategy2(originPos, overlayPos, connectedTo, viewportRuler, document2, platform) {
      this._preferredPositions = [];
      this._positionStrategy = new FlexibleConnectedPositionStrategy(connectedTo, viewportRuler, document2, platform).withFlexibleDimensions(false).withPush(false).withViewportMargin(0);
      this.withFallbackPosition(originPos, overlayPos);
    }
    Object.defineProperty(ConnectedPositionStrategy2.prototype, "_isRtl", {
      /** Whether the we're dealing with an RTL context */
      get: (
        /**
        * Whether the we're dealing with an RTL context
        * @return {?}
        */
        function() {
          return this._overlayRef.getDirection() === "rtl";
        }
      ),
      enumerable: true,
      configurable: true
    });
    Object.defineProperty(ConnectedPositionStrategy2.prototype, "onPositionChange", {
      /** Emits an event when the connection point changes. */
      get: (
        /**
        * Emits an event when the connection point changes.
        * @return {?}
        */
        function() {
          return this._positionStrategy.positionChanges;
        }
      ),
      enumerable: true,
      configurable: true
    });
    Object.defineProperty(ConnectedPositionStrategy2.prototype, "positions", {
      /** Ordered list of preferred positions, from most to least desirable. */
      get: (
        /**
        * Ordered list of preferred positions, from most to least desirable.
        * @return {?}
        */
        function() {
          return this._preferredPositions;
        }
      ),
      enumerable: true,
      configurable: true
    });
    ConnectedPositionStrategy2.prototype.attach = /**
    * Attach this position strategy to an overlay.
    * @param {?} overlayRef
    * @return {?}
    */
    function(overlayRef) {
      this._overlayRef = overlayRef;
      this._positionStrategy.attach(overlayRef);
      if (this._direction) {
        overlayRef.setDirection(this._direction);
        this._direction = null;
      }
    };
    ConnectedPositionStrategy2.prototype.dispose = /**
    * Disposes all resources used by the position strategy.
    * @return {?}
    */
    function() {
      this._positionStrategy.dispose();
    };
    ConnectedPositionStrategy2.prototype.detach = /**
    * \@docs-private
    * @return {?}
    */
    function() {
      this._positionStrategy.detach();
    };
    ConnectedPositionStrategy2.prototype.apply = /**
    * Updates the position of the overlay element, using whichever preferred position relative
    * to the origin fits on-screen.
    * \@docs-private
    * @return {?}
    */
    function() {
      this._positionStrategy.apply();
    };
    ConnectedPositionStrategy2.prototype.recalculateLastPosition = /**
    * Re-positions the overlay element with the trigger in its last calculated position,
    * even if a position higher in the "preferred positions" list would now fit. This
    * allows one to re-align the panel without changing the orientation of the panel.
    * @return {?}
    */
    function() {
      this._positionStrategy.reapplyLastPosition();
    };
    ConnectedPositionStrategy2.prototype.withScrollableContainers = /**
    * Sets the list of Scrollable containers that host the origin element so that
    * on reposition we can evaluate if it or the overlay has been clipped or outside view. Every
    * Scrollable must be an ancestor element of the strategy's origin element.
    * @param {?} scrollables
    * @return {?}
    */
    function(scrollables) {
      this._positionStrategy.withScrollableContainers(scrollables);
    };
    ConnectedPositionStrategy2.prototype.withFallbackPosition = /**
    * Adds a new preferred fallback position.
    * @template THIS
    * @this {THIS}
    * @param {?} originPos
    * @param {?} overlayPos
    * @param {?=} offsetX
    * @param {?=} offsetY
    * @return {THIS}
    */
    function(originPos, overlayPos, offsetX, offsetY) {
      var position = new ConnectionPositionPair(originPos, overlayPos, offsetX, offsetY);
      /** @type {?} */
      this._preferredPositions.push(position);
      /** @type {?} */
      this._positionStrategy.withPositions(
        /** @type {?} */
        this._preferredPositions
      );
      return (
        /** @type {?} */
        this
      );
    };
    ConnectedPositionStrategy2.prototype.withDirection = /**
    * Sets the layout direction so the overlay's position can be adjusted to match.
    * @template THIS
    * @this {THIS}
    * @param {?} dir New layout direction.
    * @return {THIS}
    */
    function(dir) {
      if (
        /** @type {?} */
        this._overlayRef
      ) {
        /** @type {?} */
        this._overlayRef.setDirection(dir);
      } else {
        /** @type {?} */
        this._direction = dir;
      }
      return (
        /** @type {?} */
        this
      );
    };
    ConnectedPositionStrategy2.prototype.withOffsetX = /**
    * Sets an offset for the overlay's connection point on the x-axis
    * @template THIS
    * @this {THIS}
    * @param {?} offset New offset in the X axis.
    * @return {THIS}
    */
    function(offset2) {
      /** @type {?} */
      this._positionStrategy.withDefaultOffsetX(offset2);
      return (
        /** @type {?} */
        this
      );
    };
    ConnectedPositionStrategy2.prototype.withOffsetY = /**
    * Sets an offset for the overlay's connection point on the y-axis
    * @template THIS
    * @this {THIS}
    * @param {?} offset New offset in the Y axis.
    * @return {THIS}
    */
    function(offset2) {
      /** @type {?} */
      this._positionStrategy.withDefaultOffsetY(offset2);
      return (
        /** @type {?} */
        this
      );
    };
    ConnectedPositionStrategy2.prototype.withLockedPosition = /**
    * Sets whether the overlay's position should be locked in after it is positioned
    * initially. When an overlay is locked in, it won't attempt to reposition itself
    * when the position is re-applied (e.g. when the user scrolls away).
    * @template THIS
    * @this {THIS}
    * @param {?} isLocked Whether the overlay should locked in.
    * @return {THIS}
    */
    function(isLocked) {
      /** @type {?} */
      this._positionStrategy.withLockedPosition(isLocked);
      return (
        /** @type {?} */
        this
      );
    };
    ConnectedPositionStrategy2.prototype.withPositions = /**
    * Overwrites the current set of positions with an array of new ones.
    * @template THIS
    * @this {THIS}
    * @param {?} positions Position pairs to be set on the strategy.
    * @return {THIS}
    */
    function(positions) {
      /** @type {?} */
      this._preferredPositions = positions.slice();
      /** @type {?} */
      this._positionStrategy.withPositions(
        /** @type {?} */
        this._preferredPositions
      );
      return (
        /** @type {?} */
        this
      );
    };
    ConnectedPositionStrategy2.prototype.setOrigin = /**
    * Sets the origin element, relative to which to position the overlay.
    * @template THIS
    * @this {THIS}
    * @param {?} origin Reference to the new origin element.
    * @return {THIS}
    */
    function(origin) {
      /** @type {?} */
      this._positionStrategy.setOrigin(origin);
      return (
        /** @type {?} */
        this
      );
    };
    return ConnectedPositionStrategy2;
  })()
);
var wrapperClass = "cdk-global-overlay-wrapper";
var GlobalPositionStrategy = (
  /** @class */
  (function() {
    function GlobalPositionStrategy2() {
      this._cssPosition = "static";
      this._topOffset = "";
      this._bottomOffset = "";
      this._leftOffset = "";
      this._rightOffset = "";
      this._alignItems = "";
      this._justifyContent = "";
      this._width = "";
      this._height = "";
    }
    GlobalPositionStrategy2.prototype.attach = /**
    * @param {?} overlayRef
    * @return {?}
    */
    function(overlayRef) {
      var config = overlayRef.getConfig();
      this._overlayRef = overlayRef;
      if (this._width && !config.width) {
        overlayRef.updateSize({ width: this._width });
      }
      if (this._height && !config.height) {
        overlayRef.updateSize({ height: this._height });
      }
      overlayRef.hostElement.classList.add(wrapperClass);
      this._isDisposed = false;
    };
    GlobalPositionStrategy2.prototype.top = /**
    * Sets the top position of the overlay. Clears any previously set vertical position.
    * @template THIS
    * @this {THIS}
    * @param {?=} value New top offset.
    * @return {THIS}
    */
    function(value) {
      if (value === void 0) {
        value = "";
      }
      /** @type {?} */
      this._bottomOffset = "";
      /** @type {?} */
      this._topOffset = value;
      /** @type {?} */
      this._alignItems = "flex-start";
      return (
        /** @type {?} */
        this
      );
    };
    GlobalPositionStrategy2.prototype.left = /**
    * Sets the left position of the overlay. Clears any previously set horizontal position.
    * @template THIS
    * @this {THIS}
    * @param {?=} value New left offset.
    * @return {THIS}
    */
    function(value) {
      if (value === void 0) {
        value = "";
      }
      /** @type {?} */
      this._rightOffset = "";
      /** @type {?} */
      this._leftOffset = value;
      /** @type {?} */
      this._justifyContent = "flex-start";
      return (
        /** @type {?} */
        this
      );
    };
    GlobalPositionStrategy2.prototype.bottom = /**
    * Sets the bottom position of the overlay. Clears any previously set vertical position.
    * @template THIS
    * @this {THIS}
    * @param {?=} value New bottom offset.
    * @return {THIS}
    */
    function(value) {
      if (value === void 0) {
        value = "";
      }
      /** @type {?} */
      this._topOffset = "";
      /** @type {?} */
      this._bottomOffset = value;
      /** @type {?} */
      this._alignItems = "flex-end";
      return (
        /** @type {?} */
        this
      );
    };
    GlobalPositionStrategy2.prototype.right = /**
    * Sets the right position of the overlay. Clears any previously set horizontal position.
    * @template THIS
    * @this {THIS}
    * @param {?=} value New right offset.
    * @return {THIS}
    */
    function(value) {
      if (value === void 0) {
        value = "";
      }
      /** @type {?} */
      this._leftOffset = "";
      /** @type {?} */
      this._rightOffset = value;
      /** @type {?} */
      this._justifyContent = "flex-end";
      return (
        /** @type {?} */
        this
      );
    };
    GlobalPositionStrategy2.prototype.width = /**
    * Sets the overlay width and clears any previously set width.
    * @deprecated Pass the `width` through the `OverlayConfig`.
    * \@breaking-change 8.0.0
    * @template THIS
    * @this {THIS}
    * @param {?=} value New width for the overlay
    * @return {THIS}
    */
    function(value) {
      if (value === void 0) {
        value = "";
      }
      if (
        /** @type {?} */
        this._overlayRef
      ) {
        /** @type {?} */
        this._overlayRef.updateSize({ width: value });
      } else {
        /** @type {?} */
        this._width = value;
      }
      return (
        /** @type {?} */
        this
      );
    };
    GlobalPositionStrategy2.prototype.height = /**
    * Sets the overlay height and clears any previously set height.
    * @deprecated Pass the `height` through the `OverlayConfig`.
    * \@breaking-change 8.0.0
    * @template THIS
    * @this {THIS}
    * @param {?=} value New height for the overlay
    * @return {THIS}
    */
    function(value) {
      if (value === void 0) {
        value = "";
      }
      if (
        /** @type {?} */
        this._overlayRef
      ) {
        /** @type {?} */
        this._overlayRef.updateSize({ height: value });
      } else {
        /** @type {?} */
        this._height = value;
      }
      return (
        /** @type {?} */
        this
      );
    };
    GlobalPositionStrategy2.prototype.centerHorizontally = /**
    * Centers the overlay horizontally with an optional offset.
    * Clears any previously set horizontal position.
    *
    * @template THIS
    * @this {THIS}
    * @param {?=} offset Overlay offset from the horizontal center.
    * @return {THIS}
    */
    function(offset2) {
      if (offset2 === void 0) {
        offset2 = "";
      }
      /** @type {?} */
      this.left(offset2);
      /** @type {?} */
      this._justifyContent = "center";
      return (
        /** @type {?} */
        this
      );
    };
    GlobalPositionStrategy2.prototype.centerVertically = /**
    * Centers the overlay vertically with an optional offset.
    * Clears any previously set vertical position.
    *
    * @template THIS
    * @this {THIS}
    * @param {?=} offset Overlay offset from the vertical center.
    * @return {THIS}
    */
    function(offset2) {
      if (offset2 === void 0) {
        offset2 = "";
      }
      /** @type {?} */
      this.top(offset2);
      /** @type {?} */
      this._alignItems = "center";
      return (
        /** @type {?} */
        this
      );
    };
    GlobalPositionStrategy2.prototype.apply = /**
    * Apply the position to the element.
    * \@docs-private
    * @return {?}
    */
    function() {
      if (!this._overlayRef || !this._overlayRef.hasAttached()) {
        return;
      }
      var styles = this._overlayRef.overlayElement.style;
      var parentStyles = this._overlayRef.hostElement.style;
      var config = this._overlayRef.getConfig();
      styles.position = this._cssPosition;
      styles.marginLeft = config.width === "100%" ? "0" : this._leftOffset;
      styles.marginTop = config.height === "100%" ? "0" : this._topOffset;
      styles.marginBottom = this._bottomOffset;
      styles.marginRight = this._rightOffset;
      if (config.width === "100%") {
        parentStyles.justifyContent = "flex-start";
      } else if (this._justifyContent === "center") {
        parentStyles.justifyContent = "center";
      } else if (this._overlayRef.getConfig().direction === "rtl") {
        if (this._justifyContent === "flex-start") {
          parentStyles.justifyContent = "flex-end";
        } else if (this._justifyContent === "flex-end") {
          parentStyles.justifyContent = "flex-start";
        }
      } else {
        parentStyles.justifyContent = this._justifyContent;
      }
      parentStyles.alignItems = config.height === "100%" ? "flex-start" : this._alignItems;
    };
    GlobalPositionStrategy2.prototype.dispose = /**
    * Cleans up the DOM changes from the position strategy.
    * \@docs-private
    * @return {?}
    */
    function() {
      if (this._isDisposed || !this._overlayRef) {
        return;
      }
      var styles = this._overlayRef.overlayElement.style;
      var parent = this._overlayRef.hostElement;
      var parentStyles = parent.style;
      parent.classList.remove(wrapperClass);
      parentStyles.justifyContent = parentStyles.alignItems = styles.marginTop = styles.marginBottom = styles.marginLeft = styles.marginRight = styles.position = "";
      this._overlayRef = /** @type {?} */
      null;
      this._isDisposed = true;
    };
    return GlobalPositionStrategy2;
  })()
);
var OverlayPositionBuilder = (
  /** @class */
  (function() {
    function OverlayPositionBuilder2(_viewportRuler, _document, _platform, _overlayContainer) {
      this._viewportRuler = _viewportRuler;
      this._document = _document;
      this._platform = _platform;
      this._overlayContainer = _overlayContainer;
    }
    OverlayPositionBuilder2.prototype.global = /**
    * Creates a global position strategy.
    * @return {?}
    */
    function() {
      return new GlobalPositionStrategy();
    };
    OverlayPositionBuilder2.prototype.connectedTo = /**
    * Creates a relative position strategy.
    * @deprecated Use `flexibleConnectedTo` instead.
    * \@breaking-change 8.0.0
    * @param {?} elementRef
    * @param {?} originPos
    * @param {?} overlayPos
    * @return {?}
    */
    function(elementRef, originPos, overlayPos) {
      return new ConnectedPositionStrategy(originPos, overlayPos, elementRef, this._viewportRuler, this._document);
    };
    OverlayPositionBuilder2.prototype.flexibleConnectedTo = /**
    * Creates a flexible position strategy.
    * @param {?} origin Origin relative to which to position the overlay.
    * @return {?}
    */
    function(origin) {
      return new FlexibleConnectedPositionStrategy(origin, this._viewportRuler, this._document, this._platform, this._overlayContainer);
    };
    OverlayPositionBuilder2.decorators = [
      { type: Injectable, args: [{ providedIn: "root" }] }
    ];
    OverlayPositionBuilder2.ctorParameters = function() {
      return [
        { type: ViewportRuler },
        { type: void 0, decorators: [{ type: Inject, args: [DOCUMENT] }] },
        { type: Platform, decorators: [{ type: Optional }] },
        { type: OverlayContainer$1, decorators: [{ type: Optional }] }
      ];
    };
    OverlayPositionBuilder2.ngInjectableDef = defineInjectable({ factory: function OverlayPositionBuilder_Factory() {
      return new OverlayPositionBuilder2(inject(ViewportRuler), inject(DOCUMENT), inject(Platform, 8), inject(OverlayContainer$1, 8));
    }, token: OverlayPositionBuilder2, providedIn: "root" });
    return OverlayPositionBuilder2;
  })()
);
var nextUniqueId = 0;
var Overlay$1 = (
  /** @class */
  (function() {
    function Overlay2(scrollStrategies, _overlayContainer, _componentFactoryResolver, _positionBuilder, _keyboardDispatcher, _injector, _ngZone, _document, _directionality, _location) {
      this.scrollStrategies = scrollStrategies;
      this._overlayContainer = _overlayContainer;
      this._componentFactoryResolver = _componentFactoryResolver;
      this._positionBuilder = _positionBuilder;
      this._keyboardDispatcher = _keyboardDispatcher;
      this._injector = _injector;
      this._ngZone = _ngZone;
      this._document = _document;
      this._directionality = _directionality;
      this._location = _location;
    }
    Overlay2.prototype.create = /**
    * Creates an overlay.
    * @param {?=} config Configuration applied to the overlay.
    * @return {?} Reference to the created overlay.
    */
    function(config) {
      var host = this._createHostElement();
      var pane = this._createPaneElement(host);
      var portalOutlet = this._createPortalOutlet(pane);
      var overlayConfig = new OverlayConfig(config);
      overlayConfig.direction = overlayConfig.direction || this._directionality.value;
      return new OverlayRef$1(portalOutlet, host, pane, overlayConfig, this._ngZone, this._keyboardDispatcher, this._document, this._location);
    };
    Overlay2.prototype.position = /**
    * Gets a position builder that can be used, via fluent API,
    * to construct and configure a position strategy.
    * @return {?} An overlay position builder.
    */
    function() {
      return this._positionBuilder;
    };
    Overlay2.prototype._createPaneElement = /**
    * Creates the DOM element for an overlay and appends it to the overlay container.
    * @private
    * @param {?} host
    * @return {?} Newly-created pane element
    */
    function(host) {
      var pane = this._document.createElement("div");
      pane.id = "cdk-overlay-" + nextUniqueId++;
      pane.classList.add("cdk-overlay-pane");
      host.appendChild(pane);
      return pane;
    };
    Overlay2.prototype._createHostElement = /**
    * Creates the host element that wraps around an overlay
    * and can be used for advanced positioning.
    * @private
    * @return {?} Newly-create host element.
    */
    function() {
      var host = this._document.createElement("div");
      this._overlayContainer.getContainerElement().appendChild(host);
      return host;
    };
    Overlay2.prototype._createPortalOutlet = /**
    * Create a DomPortalOutlet into which the overlay content can be loaded.
    * @private
    * @param {?} pane The DOM element to turn into a portal outlet.
    * @return {?} A portal outlet for the given DOM element.
    */
    function(pane) {
      if (!this._appRef) {
        this._appRef = this._injector.get(ApplicationRef);
      }
      return new DomPortalOutlet(pane, this._componentFactoryResolver, this._appRef, this._injector);
    };
    Overlay2.decorators = [
      { type: Injectable }
    ];
    Overlay2.ctorParameters = function() {
      return [
        { type: ScrollStrategyOptions },
        { type: OverlayContainer$1 },
        { type: ComponentFactoryResolver$1 },
        { type: OverlayPositionBuilder },
        { type: OverlayKeyboardDispatcher },
        { type: Injector },
        { type: NgZone },
        { type: void 0, decorators: [{ type: Inject, args: [DOCUMENT] }] },
        { type: Directionality },
        { type: Location, decorators: [{ type: Optional }] }
      ];
    };
    return Overlay2;
  })()
);
var defaultPositionList = [
  {
    originX: "start",
    originY: "bottom",
    overlayX: "start",
    overlayY: "top"
  },
  {
    originX: "start",
    originY: "top",
    overlayX: "start",
    overlayY: "bottom"
  },
  {
    originX: "end",
    originY: "top",
    overlayX: "end",
    overlayY: "bottom"
  },
  {
    originX: "end",
    originY: "bottom",
    overlayX: "end",
    overlayY: "top"
  }
];
var CDK_CONNECTED_OVERLAY_SCROLL_STRATEGY = new InjectionToken("cdk-connected-overlay-scroll-strategy");
var CdkOverlayOrigin = (
  /** @class */
  (function() {
    function CdkOverlayOrigin2(elementRef) {
      this.elementRef = elementRef;
    }
    CdkOverlayOrigin2.decorators = [
      { type: Directive, args: [{
        selector: "[cdk-overlay-origin], [overlay-origin], [cdkOverlayOrigin]",
        exportAs: "cdkOverlayOrigin"
      }] }
    ];
    CdkOverlayOrigin2.ctorParameters = function() {
      return [
        { type: ElementRef }
      ];
    };
    return CdkOverlayOrigin2;
  })()
);
var CdkConnectedOverlay = (
  /** @class */
  (function() {
    function CdkConnectedOverlay2(_overlay, templateRef, viewContainerRef, scrollStrategyFactory, _dir) {
      this._overlay = _overlay;
      this._dir = _dir;
      this._hasBackdrop = false;
      this._lockPosition = false;
      this._growAfterOpen = false;
      this._flexibleDimensions = false;
      this._push = false;
      this._backdropSubscription = Subscription.EMPTY;
      this.viewportMargin = 0;
      this.open = false;
      this.backdropClick = new EventEmitter();
      this.positionChange = new EventEmitter();
      this.attach = new EventEmitter();
      this.detach = new EventEmitter();
      this.overlayKeydown = new EventEmitter();
      this._templatePortal = new TemplatePortal(templateRef, viewContainerRef);
      this._scrollStrategyFactory = scrollStrategyFactory;
      this.scrollStrategy = this._scrollStrategyFactory();
    }
    Object.defineProperty(CdkConnectedOverlay2.prototype, "offsetX", {
      /** The offset in pixels for the overlay connection point on the x-axis */
      get: (
        /**
        * The offset in pixels for the overlay connection point on the x-axis
        * @return {?}
        */
        function() {
          return this._offsetX;
        }
      ),
      set: (
        /**
        * @param {?} offsetX
        * @return {?}
        */
        function(offsetX) {
          this._offsetX = offsetX;
          if (this._position) {
            this._updatePositionStrategy(this._position);
          }
        }
      ),
      enumerable: true,
      configurable: true
    });
    Object.defineProperty(CdkConnectedOverlay2.prototype, "offsetY", {
      /** The offset in pixels for the overlay connection point on the y-axis */
      get: (
        /**
        * The offset in pixels for the overlay connection point on the y-axis
        * @return {?}
        */
        function() {
          return this._offsetY;
        }
      ),
      set: (
        /**
        * @param {?} offsetY
        * @return {?}
        */
        function(offsetY) {
          this._offsetY = offsetY;
          if (this._position) {
            this._updatePositionStrategy(this._position);
          }
        }
      ),
      enumerable: true,
      configurable: true
    });
    Object.defineProperty(CdkConnectedOverlay2.prototype, "hasBackdrop", {
      /** Whether or not the overlay should attach a backdrop. */
      get: (
        /**
        * Whether or not the overlay should attach a backdrop.
        * @return {?}
        */
        function() {
          return this._hasBackdrop;
        }
      ),
      set: (
        /**
        * @param {?} value
        * @return {?}
        */
        function(value) {
          this._hasBackdrop = coerceBooleanProperty(value);
        }
      ),
      enumerable: true,
      configurable: true
    });
    Object.defineProperty(CdkConnectedOverlay2.prototype, "lockPosition", {
      /** Whether or not the overlay should be locked when scrolling. */
      get: (
        /**
        * Whether or not the overlay should be locked when scrolling.
        * @return {?}
        */
        function() {
          return this._lockPosition;
        }
      ),
      set: (
        /**
        * @param {?} value
        * @return {?}
        */
        function(value) {
          this._lockPosition = coerceBooleanProperty(value);
        }
      ),
      enumerable: true,
      configurable: true
    });
    Object.defineProperty(CdkConnectedOverlay2.prototype, "flexibleDimensions", {
      /** Whether the overlay's width and height can be constrained to fit within the viewport. */
      get: (
        /**
        * Whether the overlay's width and height can be constrained to fit within the viewport.
        * @return {?}
        */
        function() {
          return this._flexibleDimensions;
        }
      ),
      set: (
        /**
        * @param {?} value
        * @return {?}
        */
        function(value) {
          this._flexibleDimensions = coerceBooleanProperty(value);
        }
      ),
      enumerable: true,
      configurable: true
    });
    Object.defineProperty(CdkConnectedOverlay2.prototype, "growAfterOpen", {
      /** Whether the overlay can grow after the initial open when flexible positioning is turned on. */
      get: (
        /**
        * Whether the overlay can grow after the initial open when flexible positioning is turned on.
        * @return {?}
        */
        function() {
          return this._growAfterOpen;
        }
      ),
      set: (
        /**
        * @param {?} value
        * @return {?}
        */
        function(value) {
          this._growAfterOpen = coerceBooleanProperty(value);
        }
      ),
      enumerable: true,
      configurable: true
    });
    Object.defineProperty(CdkConnectedOverlay2.prototype, "push", {
      /** Whether the overlay can be pushed on-screen if none of the provided positions fit. */
      get: (
        /**
        * Whether the overlay can be pushed on-screen if none of the provided positions fit.
        * @return {?}
        */
        function() {
          return this._push;
        }
      ),
      set: (
        /**
        * @param {?} value
        * @return {?}
        */
        function(value) {
          this._push = coerceBooleanProperty(value);
        }
      ),
      enumerable: true,
      configurable: true
    });
    Object.defineProperty(CdkConnectedOverlay2.prototype, "overlayRef", {
      /** The associated overlay reference. */
      get: (
        /**
        * The associated overlay reference.
        * @return {?}
        */
        function() {
          return this._overlayRef;
        }
      ),
      enumerable: true,
      configurable: true
    });
    Object.defineProperty(CdkConnectedOverlay2.prototype, "dir", {
      /** The element's layout direction. */
      get: (
        /**
        * The element's layout direction.
        * @return {?}
        */
        function() {
          return this._dir ? this._dir.value : "ltr";
        }
      ),
      enumerable: true,
      configurable: true
    });
    CdkConnectedOverlay2.prototype.ngOnDestroy = /**
    * @return {?}
    */
    function() {
      if (this._overlayRef) {
        this._overlayRef.dispose();
      }
      this._backdropSubscription.unsubscribe();
    };
    CdkConnectedOverlay2.prototype.ngOnChanges = /**
    * @param {?} changes
    * @return {?}
    */
    function(changes) {
      if (this._position) {
        this._updatePositionStrategy(this._position);
        this._overlayRef.updateSize({
          width: this.width,
          minWidth: this.minWidth,
          height: this.height,
          minHeight: this.minHeight
        });
        if (changes["origin"] && this.open) {
          this._position.apply();
        }
      }
      if (changes["open"]) {
        this.open ? this._attachOverlay() : this._detachOverlay();
      }
    };
    CdkConnectedOverlay2.prototype._createOverlay = /**
    * Creates an overlay
    * @private
    * @return {?}
    */
    function() {
      var _this = this;
      if (!this.positions || !this.positions.length) {
        this.positions = defaultPositionList;
      }
      this._overlayRef = this._overlay.create(this._buildConfig());
      this._overlayRef.keydownEvents().subscribe(function(event) {
        _this.overlayKeydown.next(event);
        if (event.keyCode === ESCAPE) {
          _this._detachOverlay();
        }
      });
    };
    CdkConnectedOverlay2.prototype._buildConfig = /**
    * Builds the overlay config based on the directive's inputs
    * @private
    * @return {?}
    */
    function() {
      var positionStrategy = this._position = this._createPositionStrategy();
      var overlayConfig = new OverlayConfig({
        direction: this._dir,
        positionStrategy,
        scrollStrategy: this.scrollStrategy,
        hasBackdrop: this.hasBackdrop
      });
      if (this.width || this.width === 0) {
        overlayConfig.width = this.width;
      }
      if (this.height || this.height === 0) {
        overlayConfig.height = this.height;
      }
      if (this.minWidth || this.minWidth === 0) {
        overlayConfig.minWidth = this.minWidth;
      }
      if (this.minHeight || this.minHeight === 0) {
        overlayConfig.minHeight = this.minHeight;
      }
      if (this.backdropClass) {
        overlayConfig.backdropClass = this.backdropClass;
      }
      if (this.panelClass) {
        overlayConfig.panelClass = this.panelClass;
      }
      return overlayConfig;
    };
    CdkConnectedOverlay2.prototype._updatePositionStrategy = /**
    * Updates the state of a position strategy, based on the values of the directive inputs.
    * @private
    * @param {?} positionStrategy
    * @return {?}
    */
    function(positionStrategy) {
      var _this = this;
      var positions = this.positions.map(function(currentPosition) {
        return {
          originX: currentPosition.originX,
          originY: currentPosition.originY,
          overlayX: currentPosition.overlayX,
          overlayY: currentPosition.overlayY,
          offsetX: currentPosition.offsetX || _this.offsetX,
          offsetY: currentPosition.offsetY || _this.offsetY
        };
      });
      return positionStrategy.setOrigin(this.origin.elementRef).withPositions(positions).withFlexibleDimensions(this.flexibleDimensions).withPush(this.push).withGrowAfterOpen(this.growAfterOpen).withViewportMargin(this.viewportMargin).withLockedPosition(this.lockPosition);
    };
    CdkConnectedOverlay2.prototype._createPositionStrategy = /**
    * Returns the position strategy of the overlay to be set on the overlay config
    * @private
    * @return {?}
    */
    function() {
      var _this = this;
      var strategy = this._overlay.position().flexibleConnectedTo(this.origin.elementRef);
      this._updatePositionStrategy(strategy);
      strategy.positionChanges.subscribe(function(p) {
        return _this.positionChange.emit(p);
      });
      return strategy;
    };
    CdkConnectedOverlay2.prototype._attachOverlay = /**
    * Attaches the overlay and subscribes to backdrop clicks if backdrop exists
    * @private
    * @return {?}
    */
    function() {
      var _this = this;
      if (!this._overlayRef) {
        this._createOverlay();
      } else {
        this._overlayRef.getConfig().hasBackdrop = this.hasBackdrop;
      }
      if (!this._overlayRef.hasAttached()) {
        this._overlayRef.attach(this._templatePortal);
        this.attach.emit();
      }
      if (this.hasBackdrop) {
        this._backdropSubscription = this._overlayRef.backdropClick().subscribe(function(event) {
          _this.backdropClick.emit(event);
        });
      } else {
        this._backdropSubscription.unsubscribe();
      }
    };
    CdkConnectedOverlay2.prototype._detachOverlay = /**
    * Detaches the overlay and unsubscribes to backdrop clicks if backdrop exists
    * @private
    * @return {?}
    */
    function() {
      if (this._overlayRef) {
        this._overlayRef.detach();
        this.detach.emit();
      }
      this._backdropSubscription.unsubscribe();
    };
    CdkConnectedOverlay2.decorators = [
      { type: Directive, args: [{
        selector: "[cdk-connected-overlay], [connected-overlay], [cdkConnectedOverlay]",
        exportAs: "cdkConnectedOverlay"
      }] }
    ];
    CdkConnectedOverlay2.ctorParameters = function() {
      return [
        { type: Overlay$1 },
        { type: TemplateRef },
        { type: ViewContainerRef },
        { type: void 0, decorators: [{ type: Inject, args: [CDK_CONNECTED_OVERLAY_SCROLL_STRATEGY] }] },
        { type: Directionality, decorators: [{ type: Optional }] }
      ];
    };
    CdkConnectedOverlay2.propDecorators = {
      origin: [{ type: Input, args: ["cdkConnectedOverlayOrigin"] }],
      positions: [{ type: Input, args: ["cdkConnectedOverlayPositions"] }],
      offsetX: [{ type: Input, args: ["cdkConnectedOverlayOffsetX"] }],
      offsetY: [{ type: Input, args: ["cdkConnectedOverlayOffsetY"] }],
      width: [{ type: Input, args: ["cdkConnectedOverlayWidth"] }],
      height: [{ type: Input, args: ["cdkConnectedOverlayHeight"] }],
      minWidth: [{ type: Input, args: ["cdkConnectedOverlayMinWidth"] }],
      minHeight: [{ type: Input, args: ["cdkConnectedOverlayMinHeight"] }],
      backdropClass: [{ type: Input, args: ["cdkConnectedOverlayBackdropClass"] }],
      panelClass: [{ type: Input, args: ["cdkConnectedOverlayPanelClass"] }],
      viewportMargin: [{ type: Input, args: ["cdkConnectedOverlayViewportMargin"] }],
      scrollStrategy: [{ type: Input, args: ["cdkConnectedOverlayScrollStrategy"] }],
      open: [{ type: Input, args: ["cdkConnectedOverlayOpen"] }],
      hasBackdrop: [{ type: Input, args: ["cdkConnectedOverlayHasBackdrop"] }],
      lockPosition: [{ type: Input, args: ["cdkConnectedOverlayLockPosition"] }],
      flexibleDimensions: [{ type: Input, args: ["cdkConnectedOverlayFlexibleDimensions"] }],
      growAfterOpen: [{ type: Input, args: ["cdkConnectedOverlayGrowAfterOpen"] }],
      push: [{ type: Input, args: ["cdkConnectedOverlayPush"] }],
      backdropClick: [{ type: Output }],
      positionChange: [{ type: Output }],
      attach: [{ type: Output }],
      detach: [{ type: Output }],
      overlayKeydown: [{ type: Output }]
    };
    return CdkConnectedOverlay2;
  })()
);
function CDK_CONNECTED_OVERLAY_SCROLL_STRATEGY_PROVIDER_FACTORY(overlay) {
  return function() {
    return overlay.scrollStrategies.reposition();
  };
}
var CDK_CONNECTED_OVERLAY_SCROLL_STRATEGY_PROVIDER = {
  provide: CDK_CONNECTED_OVERLAY_SCROLL_STRATEGY,
  deps: [Overlay$1],
  useFactory: CDK_CONNECTED_OVERLAY_SCROLL_STRATEGY_PROVIDER_FACTORY
};
var OverlayModule = (
  /** @class */
  (function() {
    function OverlayModule2() {
    }
    OverlayModule2.decorators = [
      { type: NgModule, args: [{
        imports: [BidiModule, PortalModule, ScrollingModule],
        exports: [CdkConnectedOverlay, CdkOverlayOrigin, ScrollingModule],
        declarations: [CdkConnectedOverlay, CdkOverlayOrigin],
        providers: [
          Overlay$1,
          CDK_CONNECTED_OVERLAY_SCROLL_STRATEGY_PROVIDER
        ]
      }] }
    ];
    return OverlayModule2;
  })()
);
var FullscreenOverlayContainer = (
  /** @class */
  (function(_super) {
    __extends(FullscreenOverlayContainer2, _super);
    function FullscreenOverlayContainer2(_document) {
      return _super.call(this, _document) || this;
    }
    FullscreenOverlayContainer2.prototype.ngOnDestroy = /**
    * @return {?}
    */
    function() {
      _super.prototype.ngOnDestroy.call(this);
      if (this._fullScreenEventName && this._fullScreenListener) {
        this._document.removeEventListener(this._fullScreenEventName, this._fullScreenListener);
      }
    };
    FullscreenOverlayContainer2.prototype._createContainer = /**
    * @protected
    * @return {?}
    */
    function() {
      var _this = this;
      _super.prototype._createContainer.call(this);
      this._adjustParentForFullscreenChange();
      this._addFullscreenChangeListener(function() {
        return _this._adjustParentForFullscreenChange();
      });
    };
    FullscreenOverlayContainer2.prototype._adjustParentForFullscreenChange = /**
    * @private
    * @return {?}
    */
    function() {
      if (!this._containerElement) {
        return;
      }
      var fullscreenElement = this.getFullscreenElement();
      var parent = fullscreenElement || this._document.body;
      parent.appendChild(this._containerElement);
    };
    FullscreenOverlayContainer2.prototype._addFullscreenChangeListener = /**
    * @private
    * @param {?} fn
    * @return {?}
    */
    function(fn2) {
      var eventName = this._getEventName();
      if (eventName) {
        if (this._fullScreenListener) {
          this._document.removeEventListener(eventName, this._fullScreenListener);
        }
        this._document.addEventListener(eventName, fn2);
        this._fullScreenListener = fn2;
      }
    };
    FullscreenOverlayContainer2.prototype._getEventName = /**
    * @private
    * @return {?}
    */
    function() {
      if (!this._fullScreenEventName) {
        if (this._document.fullscreenEnabled) {
          this._fullScreenEventName = "fullscreenchange";
        } else if (this._document.webkitFullscreenEnabled) {
          this._fullScreenEventName = "webkitfullscreenchange";
        } else if (
          /** @type {?} */
          this._document.mozFullScreenEnabled
        ) {
          this._fullScreenEventName = "mozfullscreenchange";
        } else if (
          /** @type {?} */
          this._document.msFullscreenEnabled
        ) {
          this._fullScreenEventName = "MSFullscreenChange";
        }
      }
      return this._fullScreenEventName;
    };
    FullscreenOverlayContainer2.prototype.getFullscreenElement = /**
    * When the page is put into fullscreen mode, a specific element is specified.
    * Only that element and its children are visible when in fullscreen mode.
    * @return {?}
    */
    function() {
      return this._document.fullscreenElement || this._document.webkitFullscreenElement || /** @type {?} */
      this._document.mozFullScreenElement || /** @type {?} */
      this._document.msFullscreenElement || null;
    };
    FullscreenOverlayContainer2.decorators = [
      { type: Injectable, args: [{ providedIn: "root" }] }
    ];
    FullscreenOverlayContainer2.ctorParameters = function() {
      return [
        { type: void 0, decorators: [{ type: Inject, args: [DOCUMENT] }] }
      ];
    };
    FullscreenOverlayContainer2.ngInjectableDef = defineInjectable({ factory: function FullscreenOverlayContainer_Factory() {
      return new FullscreenOverlayContainer2(inject(DOCUMENT));
    }, token: FullscreenOverlayContainer2, providedIn: "root" });
    return FullscreenOverlayContainer2;
  })(OverlayContainer$1)
);
/*! *****************************************************************************
Copyright (c) Microsoft Corporation.

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
***************************************************************************** */
var __assign = function() {
  __assign = Object.assign || function __assign2(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
      s = arguments[i];
      for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
    }
    return t;
  };
  return __assign.apply(this, arguments);
};
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
var MutationObserverFactory = (
  /** @class */
  (function() {
    function MutationObserverFactory2() {
    }
    MutationObserverFactory2.prototype.create = /**
    * @param {?} callback
    * @return {?}
    */
    function(callback) {
      return typeof MutationObserver === "undefined" ? null : new MutationObserver(callback);
    };
    MutationObserverFactory2.decorators = [
      { type: Injectable, args: [{ providedIn: "root" }] }
    ];
    MutationObserverFactory2.ngInjectableDef = defineInjectable({ factory: function MutationObserverFactory_Factory() {
      return new MutationObserverFactory2();
    }, token: MutationObserverFactory2, providedIn: "root" });
    return MutationObserverFactory2;
  })()
);
var ContentObserver = (
  /** @class */
  (function() {
    function ContentObserver2(_mutationObserverFactory) {
      this._mutationObserverFactory = _mutationObserverFactory;
      this._observedElements = /* @__PURE__ */ new Map();
    }
    ContentObserver2.prototype.ngOnDestroy = /**
    * @return {?}
    */
    function() {
      var _this = this;
      this._observedElements.forEach(function(_, element) {
        return _this._cleanupObserver(element);
      });
    };
    ContentObserver2.prototype.observe = /**
    * @param {?} elementOrRef
    * @return {?}
    */
    function(elementOrRef) {
      var _this = this;
      var element = coerceElement(elementOrRef);
      return new Observable(function(observer) {
        var stream = _this._observeElement(element);
        var subscription = stream.subscribe(observer);
        return function() {
          subscription.unsubscribe();
          _this._unobserveElement(element);
        };
      });
    };
    ContentObserver2.prototype._observeElement = /**
    * Observes the given element by using the existing MutationObserver if available, or creating a
    * new one if not.
    * @private
    * @param {?} element
    * @return {?}
    */
    function(element) {
      if (!this._observedElements.has(element)) {
        var stream_1 = new Subject();
        var observer = this._mutationObserverFactory.create(function(mutations) {
          return stream_1.next(mutations);
        });
        if (observer) {
          observer.observe(element, {
            characterData: true,
            childList: true,
            subtree: true
          });
        }
        this._observedElements.set(element, { observer, stream: stream_1, count: 1 });
      } else {
        /** @type {?} */
        this._observedElements.get(element).count++;
      }
      return (
        /** @type {?} */
        this._observedElements.get(element).stream
      );
    };
    ContentObserver2.prototype._unobserveElement = /**
    * Un-observes the given element and cleans up the underlying MutationObserver if nobody else is
    * observing this element.
    * @private
    * @param {?} element
    * @return {?}
    */
    function(element) {
      if (this._observedElements.has(element)) {
        /** @type {?} */
        this._observedElements.get(element).count--;
        if (!/** @type {?} */
        this._observedElements.get(element).count) {
          this._cleanupObserver(element);
        }
      }
    };
    ContentObserver2.prototype._cleanupObserver = /**
    * Clean up the underlying MutationObserver for the specified element.
    * @private
    * @param {?} element
    * @return {?}
    */
    function(element) {
      if (this._observedElements.has(element)) {
        var _a = (
          /** @type {?} */
          this._observedElements.get(element)
        ), observer = _a.observer, stream = _a.stream;
        if (observer) {
          observer.disconnect();
        }
        stream.complete();
        this._observedElements.delete(element);
      }
    };
    ContentObserver2.decorators = [
      { type: Injectable, args: [{ providedIn: "root" }] }
    ];
    ContentObserver2.ctorParameters = function() {
      return [
        { type: MutationObserverFactory }
      ];
    };
    ContentObserver2.ngInjectableDef = defineInjectable({ factory: function ContentObserver_Factory() {
      return new ContentObserver2(inject(MutationObserverFactory));
    }, token: ContentObserver2, providedIn: "root" });
    return ContentObserver2;
  })()
);
var CdkObserveContent = (
  /** @class */
  (function() {
    function CdkObserveContent2(_contentObserver, _elementRef, _ngZone) {
      this._contentObserver = _contentObserver;
      this._elementRef = _elementRef;
      this._ngZone = _ngZone;
      this.event = new EventEmitter();
      this._disabled = false;
      this._currentSubscription = null;
    }
    Object.defineProperty(CdkObserveContent2.prototype, "disabled", {
      /**
       * Whether observing content is disabled. This option can be used
       * to disconnect the underlying MutationObserver until it is needed.
       */
      get: (
        /**
        * Whether observing content is disabled. This option can be used
        * to disconnect the underlying MutationObserver until it is needed.
        * @return {?}
        */
        function() {
          return this._disabled;
        }
      ),
      set: (
        /**
        * @param {?} value
        * @return {?}
        */
        function(value) {
          this._disabled = coerceBooleanProperty(value);
          this._disabled ? this._unsubscribe() : this._subscribe();
        }
      ),
      enumerable: true,
      configurable: true
    });
    Object.defineProperty(CdkObserveContent2.prototype, "debounce", {
      /** Debounce interval for emitting the changes. */
      get: (
        /**
        * Debounce interval for emitting the changes.
        * @return {?}
        */
        function() {
          return this._debounce;
        }
      ),
      set: (
        /**
        * @param {?} value
        * @return {?}
        */
        function(value) {
          this._debounce = coerceNumberProperty(value);
          this._subscribe();
        }
      ),
      enumerable: true,
      configurable: true
    });
    CdkObserveContent2.prototype.ngAfterContentInit = /**
    * @return {?}
    */
    function() {
      if (!this._currentSubscription && !this.disabled) {
        this._subscribe();
      }
    };
    CdkObserveContent2.prototype.ngOnDestroy = /**
    * @return {?}
    */
    function() {
      this._unsubscribe();
    };
    CdkObserveContent2.prototype._subscribe = /**
    * @private
    * @return {?}
    */
    function() {
      var _this = this;
      this._unsubscribe();
      var stream = this._contentObserver.observe(this._elementRef);
      this._ngZone.runOutsideAngular(function() {
        _this._currentSubscription = (_this.debounce ? stream.pipe(debounceTime(_this.debounce)) : stream).subscribe(_this.event);
      });
    };
    CdkObserveContent2.prototype._unsubscribe = /**
    * @private
    * @return {?}
    */
    function() {
      if (this._currentSubscription) {
        this._currentSubscription.unsubscribe();
      }
    };
    CdkObserveContent2.decorators = [
      { type: Directive, args: [{
        selector: "[cdkObserveContent]",
        exportAs: "cdkObserveContent"
      }] }
    ];
    CdkObserveContent2.ctorParameters = function() {
      return [
        { type: ContentObserver },
        { type: ElementRef },
        { type: NgZone }
      ];
    };
    CdkObserveContent2.propDecorators = {
      event: [{ type: Output, args: ["cdkObserveContent"] }],
      disabled: [{ type: Input, args: ["cdkObserveContentDisabled"] }],
      debounce: [{ type: Input }]
    };
    return CdkObserveContent2;
  })()
);
(function() {
  function ObserversModule() {
  }
  ObserversModule.decorators = [
    { type: NgModule, args: [{
      exports: [CdkObserveContent],
      declarations: [CdkObserveContent],
      providers: [MutationObserverFactory]
    }] }
  ];
  return ObserversModule;
})();
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
var ID_DELIMINATOR = " ";
function addAriaReferencedId(el, attr, id) {
  var ids = getAriaReferenceIds(el, attr);
  if (ids.some(function(existingId) {
    return existingId.trim() == id.trim();
  })) {
    return;
  }
  ids.push(id.trim());
  el.setAttribute(attr, ids.join(ID_DELIMINATOR));
}
function removeAriaReferencedId(el, attr, id) {
  var ids = getAriaReferenceIds(el, attr);
  var filteredIds = ids.filter(function(val) {
    return val != id.trim();
  });
  el.setAttribute(attr, filteredIds.join(ID_DELIMINATOR));
}
function getAriaReferenceIds(el, attr) {
  return (el.getAttribute(attr) || "").match(/\S+/g) || [];
}
var MESSAGES_CONTAINER_ID = "cdk-describedby-message-container";
var CDK_DESCRIBEDBY_ID_PREFIX = "cdk-describedby-message";
var CDK_DESCRIBEDBY_HOST_ATTRIBUTE = "cdk-describedby-host";
var nextId = 0;
var messageRegistry = /* @__PURE__ */ new Map();
var messagesContainer = null;
var AriaDescriber = (
  /** @class */
  (function() {
    function AriaDescriber2(_document) {
      this._document = _document;
    }
    AriaDescriber2.prototype.describe = /**
    * Adds to the host element an aria-describedby reference to a hidden element that contains
    * the message. If the same message has already been registered, then it will reuse the created
    * message element.
    * @param {?} hostElement
    * @param {?} message
    * @return {?}
    */
    function(hostElement, message) {
      if (!this._canBeDescribed(hostElement, message)) {
        return;
      }
      if (!messageRegistry.has(message)) {
        this._createMessageElement(message);
      }
      if (!this._isElementDescribedByMessage(hostElement, message)) {
        this._addMessageReference(hostElement, message);
      }
    };
    AriaDescriber2.prototype.removeDescription = /**
    * Removes the host element's aria-describedby reference to the message element.
    * @param {?} hostElement
    * @param {?} message
    * @return {?}
    */
    function(hostElement, message) {
      if (!this._canBeDescribed(hostElement, message)) {
        return;
      }
      if (this._isElementDescribedByMessage(hostElement, message)) {
        this._removeMessageReference(hostElement, message);
      }
      var registeredMessage = messageRegistry.get(message);
      if (registeredMessage && registeredMessage.referenceCount === 0) {
        this._deleteMessageElement(message);
      }
      if (messagesContainer && messagesContainer.childNodes.length === 0) {
        this._deleteMessagesContainer();
      }
    };
    AriaDescriber2.prototype.ngOnDestroy = /**
    * Unregisters all created message elements and removes the message container.
    * @return {?}
    */
    function() {
      var describedElements = this._document.querySelectorAll("[" + CDK_DESCRIBEDBY_HOST_ATTRIBUTE + "]");
      for (var i = 0; i < describedElements.length; i++) {
        this._removeCdkDescribedByReferenceIds(describedElements[i]);
        describedElements[i].removeAttribute(CDK_DESCRIBEDBY_HOST_ATTRIBUTE);
      }
      if (messagesContainer) {
        this._deleteMessagesContainer();
      }
      messageRegistry.clear();
    };
    AriaDescriber2.prototype._createMessageElement = /**
    * Creates a new element in the visually hidden message container element with the message
    * as its content and adds it to the message registry.
    * @private
    * @param {?} message
    * @return {?}
    */
    function(message) {
      var messageElement = this._document.createElement("div");
      messageElement.setAttribute("id", CDK_DESCRIBEDBY_ID_PREFIX + "-" + nextId++);
      messageElement.appendChild(
        /** @type {?} */
        this._document.createTextNode(message)
      );
      this._createMessagesContainer();
      /** @type {?} */
      messagesContainer.appendChild(messageElement);
      messageRegistry.set(message, { messageElement, referenceCount: 0 });
    };
    AriaDescriber2.prototype._deleteMessageElement = /**
    * Deletes the message element from the global messages container.
    * @private
    * @param {?} message
    * @return {?}
    */
    function(message) {
      var registeredMessage = messageRegistry.get(message);
      var messageElement = registeredMessage && registeredMessage.messageElement;
      if (messagesContainer && messageElement) {
        messagesContainer.removeChild(messageElement);
      }
      messageRegistry.delete(message);
    };
    AriaDescriber2.prototype._createMessagesContainer = /**
    * Creates the global container for all aria-describedby messages.
    * @private
    * @return {?}
    */
    function() {
      if (!messagesContainer) {
        var preExistingContainer = this._document.getElementById(MESSAGES_CONTAINER_ID);
        if (preExistingContainer) {
          /** @type {?} */
          preExistingContainer.parentNode.removeChild(preExistingContainer);
        }
        messagesContainer = this._document.createElement("div");
        messagesContainer.id = MESSAGES_CONTAINER_ID;
        messagesContainer.setAttribute("aria-hidden", "true");
        messagesContainer.style.display = "none";
        this._document.body.appendChild(messagesContainer);
      }
    };
    AriaDescriber2.prototype._deleteMessagesContainer = /**
    * Deletes the global messages container.
    * @private
    * @return {?}
    */
    function() {
      if (messagesContainer && messagesContainer.parentNode) {
        messagesContainer.parentNode.removeChild(messagesContainer);
        messagesContainer = null;
      }
    };
    AriaDescriber2.prototype._removeCdkDescribedByReferenceIds = /**
    * Removes all cdk-describedby messages that are hosted through the element.
    * @private
    * @param {?} element
    * @return {?}
    */
    function(element) {
      var originalReferenceIds = getAriaReferenceIds(element, "aria-describedby").filter(function(id) {
        return id.indexOf(CDK_DESCRIBEDBY_ID_PREFIX) != 0;
      });
      element.setAttribute("aria-describedby", originalReferenceIds.join(" "));
    };
    AriaDescriber2.prototype._addMessageReference = /**
    * Adds a message reference to the element using aria-describedby and increments the registered
    * message's reference count.
    * @private
    * @param {?} element
    * @param {?} message
    * @return {?}
    */
    function(element, message) {
      var registeredMessage = (
        /** @type {?} */
        messageRegistry.get(message)
      );
      addAriaReferencedId(element, "aria-describedby", registeredMessage.messageElement.id);
      element.setAttribute(CDK_DESCRIBEDBY_HOST_ATTRIBUTE, "");
      registeredMessage.referenceCount++;
    };
    AriaDescriber2.prototype._removeMessageReference = /**
    * Removes a message reference from the element using aria-describedby
    * and decrements the registered message's reference count.
    * @private
    * @param {?} element
    * @param {?} message
    * @return {?}
    */
    function(element, message) {
      var registeredMessage = (
        /** @type {?} */
        messageRegistry.get(message)
      );
      registeredMessage.referenceCount--;
      removeAriaReferencedId(element, "aria-describedby", registeredMessage.messageElement.id);
      element.removeAttribute(CDK_DESCRIBEDBY_HOST_ATTRIBUTE);
    };
    AriaDescriber2.prototype._isElementDescribedByMessage = /**
    * Returns true if the element has been described by the provided message ID.
    * @private
    * @param {?} element
    * @param {?} message
    * @return {?}
    */
    function(element, message) {
      var referenceIds = getAriaReferenceIds(element, "aria-describedby");
      var registeredMessage = messageRegistry.get(message);
      var messageId = registeredMessage && registeredMessage.messageElement.id;
      return !!messageId && referenceIds.indexOf(messageId) != -1;
    };
    AriaDescriber2.prototype._canBeDescribed = /**
    * Determines whether a message can be described on a particular element.
    * @private
    * @param {?} element
    * @param {?} message
    * @return {?}
    */
    function(element, message) {
      return element.nodeType === this._document.ELEMENT_NODE && message != null && !!("" + message).trim();
    };
    AriaDescriber2.decorators = [
      { type: Injectable, args: [{ providedIn: "root" }] }
    ];
    AriaDescriber2.ctorParameters = function() {
      return [
        { type: void 0, decorators: [{ type: Inject, args: [DOCUMENT] }] }
      ];
    };
    AriaDescriber2.ngInjectableDef = defineInjectable({ factory: function AriaDescriber_Factory() {
      return new AriaDescriber2(inject(DOCUMENT));
    }, token: AriaDescriber2, providedIn: "root" });
    return AriaDescriber2;
  })()
);
({
  deps: [
    [new Optional(), new SkipSelf(), AriaDescriber],
    /** @type {?} */
    DOCUMENT
  ]
});
var ListKeyManager = (
  /** @class */
  (function() {
    function ListKeyManager2(_items) {
      var _this = this;
      this._items = _items;
      this._activeItemIndex = -1;
      this._activeItem = null;
      this._wrap = false;
      this._letterKeyStream = new Subject();
      this._typeaheadSubscription = Subscription.EMPTY;
      this._vertical = true;
      this._allowedModifierKeys = [];
      this._skipPredicateFn = function(item) {
        return item.disabled;
      };
      this._pressedLetters = [];
      this.tabOut = new Subject();
      this.change = new Subject();
      if (_items instanceof QueryList) {
        _items.changes.subscribe(function(newItems) {
          if (_this._activeItem) {
            var itemArray = newItems.toArray();
            var newIndex = itemArray.indexOf(_this._activeItem);
            if (newIndex > -1 && newIndex !== _this._activeItemIndex) {
              _this._activeItemIndex = newIndex;
            }
          }
        });
      }
    }
    ListKeyManager2.prototype.skipPredicate = /**
    * Sets the predicate function that determines which items should be skipped by the
    * list key manager.
    * @template THIS
    * @this {THIS}
    * @param {?} predicate Function that determines whether the given item should be skipped.
    * @return {THIS}
    */
    function(predicate) {
      /** @type {?} */
      this._skipPredicateFn = predicate;
      return (
        /** @type {?} */
        this
      );
    };
    ListKeyManager2.prototype.withWrap = /**
    * Configures wrapping mode, which determines whether the active item will wrap to
    * the other end of list when there are no more items in the given direction.
    * @template THIS
    * @this {THIS}
    * @param {?=} shouldWrap Whether the list should wrap when reaching the end.
    * @return {THIS}
    */
    function(shouldWrap) {
      if (shouldWrap === void 0) {
        shouldWrap = true;
      }
      /** @type {?} */
      this._wrap = shouldWrap;
      return (
        /** @type {?} */
        this
      );
    };
    ListKeyManager2.prototype.withVerticalOrientation = /**
    * Configures whether the key manager should be able to move the selection vertically.
    * @template THIS
    * @this {THIS}
    * @param {?=} enabled Whether vertical selection should be enabled.
    * @return {THIS}
    */
    function(enabled) {
      if (enabled === void 0) {
        enabled = true;
      }
      /** @type {?} */
      this._vertical = enabled;
      return (
        /** @type {?} */
        this
      );
    };
    ListKeyManager2.prototype.withHorizontalOrientation = /**
    * Configures the key manager to move the selection horizontally.
    * Passing in `null` will disable horizontal movement.
    * @template THIS
    * @this {THIS}
    * @param {?} direction Direction in which the selection can be moved.
    * @return {THIS}
    */
    function(direction) {
      /** @type {?} */
      this._horizontal = direction;
      return (
        /** @type {?} */
        this
      );
    };
    ListKeyManager2.prototype.withAllowedModifierKeys = /**
    * Modifier keys which are allowed to be held down and whose default actions will be prevented
    * as the user is pressing the arrow keys. Defaults to not allowing any modifier keys.
    * @template THIS
    * @this {THIS}
    * @param {?} keys
    * @return {THIS}
    */
    function(keys) {
      /** @type {?} */
      this._allowedModifierKeys = keys;
      return (
        /** @type {?} */
        this
      );
    };
    ListKeyManager2.prototype.withTypeAhead = /**
    * Turns on typeahead mode which allows users to set the active item by typing.
    * @template THIS
    * @this {THIS}
    * @param {?=} debounceInterval Time to wait after the last keystroke before setting the active item.
    * @return {THIS}
    */
    function(debounceInterval) {
      var _this = this;
      if (debounceInterval === void 0) {
        debounceInterval = 200;
      }
      if (
        /** @type {?} */
        this._items.length && /** @type {?} */
        this._items.some(function(item) {
          return typeof item.getLabel !== "function";
        })
      ) {
        throw Error("ListKeyManager items in typeahead mode must implement the `getLabel` method.");
      }
      /** @type {?} */
      this._typeaheadSubscription.unsubscribe();
      /** @type {?} */
      this._typeaheadSubscription = /** @type {?} */
      this._letterKeyStream.pipe(tap(function(keyCode) {
        return (
          /** @type {?} */
          _this._pressedLetters.push(keyCode)
        );
      }), debounceTime(debounceInterval), filter(function() {
        return (
          /** @type {?} */
          _this._pressedLetters.length > 0
        );
      }), map(function() {
        return (
          /** @type {?} */
          _this._pressedLetters.join("")
        );
      })).subscribe(function(inputString) {
        var items = (
          /** @type {?} */
          _this._getItemsArray()
        );
        for (var i = 1; i < items.length + 1; i++) {
          var index = (
            /** @type {?} */
            (_this._activeItemIndex + i) % items.length
          );
          var item = items[index];
          if (!/** @type {?} */
          _this._skipPredicateFn(item) && /** @type {?} */
          item.getLabel().toUpperCase().trim().indexOf(inputString) === 0) {
            /** @type {?} */
            _this.setActiveItem(index);
            break;
          }
        }
        /** @type {?} */
        _this._pressedLetters = [];
      });
      return (
        /** @type {?} */
        this
      );
    };
    ListKeyManager2.prototype.setActiveItem = /**
    * @param {?} item
    * @return {?}
    */
    function(item) {
      var previousIndex = this._activeItemIndex;
      this.updateActiveItem(item);
      if (this._activeItemIndex !== previousIndex) {
        this.change.next(this._activeItemIndex);
      }
    };
    ListKeyManager2.prototype.onKeydown = /**
    * Sets the active item depending on the key event passed in.
    * @param {?} event Keyboard event to be used for determining which element should be active.
    * @return {?}
    */
    function(event) {
      var _this = this;
      var keyCode = event.keyCode;
      var modifiers = ["altKey", "ctrlKey", "metaKey", "shiftKey"];
      var isModifierAllowed = modifiers.every(function(modifier) {
        return !event[modifier] || _this._allowedModifierKeys.indexOf(modifier) > -1;
      });
      switch (keyCode) {
        case TAB:
          this.tabOut.next();
          return;
        case DOWN_ARROW:
          if (this._vertical && isModifierAllowed) {
            this.setNextItemActive();
            break;
          } else {
            return;
          }
        case UP_ARROW:
          if (this._vertical && isModifierAllowed) {
            this.setPreviousItemActive();
            break;
          } else {
            return;
          }
        case RIGHT_ARROW:
          if (this._horizontal && isModifierAllowed) {
            this._horizontal === "rtl" ? this.setPreviousItemActive() : this.setNextItemActive();
            break;
          } else {
            return;
          }
        case LEFT_ARROW:
          if (this._horizontal && isModifierAllowed) {
            this._horizontal === "rtl" ? this.setNextItemActive() : this.setPreviousItemActive();
            break;
          } else {
            return;
          }
        default:
          if (isModifierAllowed || hasModifierKey(event, "shiftKey")) {
            if (event.key && event.key.length === 1) {
              this._letterKeyStream.next(event.key.toLocaleUpperCase());
            } else if (keyCode >= A && keyCode <= Z || keyCode >= ZERO && keyCode <= NINE) {
              this._letterKeyStream.next(String.fromCharCode(keyCode));
            }
          }
          return;
      }
      this._pressedLetters = [];
      event.preventDefault();
    };
    Object.defineProperty(ListKeyManager2.prototype, "activeItemIndex", {
      /** Index of the currently active item. */
      get: (
        /**
        * Index of the currently active item.
        * @return {?}
        */
        function() {
          return this._activeItemIndex;
        }
      ),
      enumerable: true,
      configurable: true
    });
    Object.defineProperty(ListKeyManager2.prototype, "activeItem", {
      /** The active item. */
      get: (
        /**
        * The active item.
        * @return {?}
        */
        function() {
          return this._activeItem;
        }
      ),
      enumerable: true,
      configurable: true
    });
    ListKeyManager2.prototype.setFirstItemActive = /**
    * Sets the active item to the first enabled item in the list.
    * @return {?}
    */
    function() {
      this._setActiveItemByIndex(0, 1);
    };
    ListKeyManager2.prototype.setLastItemActive = /**
    * Sets the active item to the last enabled item in the list.
    * @return {?}
    */
    function() {
      this._setActiveItemByIndex(this._items.length - 1, -1);
    };
    ListKeyManager2.prototype.setNextItemActive = /**
    * Sets the active item to the next enabled item in the list.
    * @return {?}
    */
    function() {
      this._activeItemIndex < 0 ? this.setFirstItemActive() : this._setActiveItemByDelta(1);
    };
    ListKeyManager2.prototype.setPreviousItemActive = /**
    * Sets the active item to a previous enabled item in the list.
    * @return {?}
    */
    function() {
      this._activeItemIndex < 0 && this._wrap ? this.setLastItemActive() : this._setActiveItemByDelta(-1);
    };
    ListKeyManager2.prototype.updateActiveItem = /**
    * @param {?} item
    * @return {?}
    */
    function(item) {
      var itemArray = this._getItemsArray();
      var index = typeof item === "number" ? item : itemArray.indexOf(item);
      var activeItem = itemArray[index];
      this._activeItem = activeItem == null ? null : activeItem;
      this._activeItemIndex = index;
    };
    ListKeyManager2.prototype.updateActiveItemIndex = /**
    * Allows setting of the activeItemIndex without any other effects.
    * @deprecated Use `updateActiveItem` instead.
    * \@breaking-change 8.0.0
    * @param {?} index The new activeItemIndex.
    * @return {?}
    */
    function(index) {
      this.updateActiveItem(index);
    };
    ListKeyManager2.prototype._setActiveItemByDelta = /**
    * This method sets the active item, given a list of items and the delta between the
    * currently active item and the new active item. It will calculate differently
    * depending on whether wrap mode is turned on.
    * @private
    * @param {?} delta
    * @return {?}
    */
    function(delta) {
      this._wrap ? this._setActiveInWrapMode(delta) : this._setActiveInDefaultMode(delta);
    };
    ListKeyManager2.prototype._setActiveInWrapMode = /**
    * Sets the active item properly given "wrap" mode. In other words, it will continue to move
    * down the list until it finds an item that is not disabled, and it will wrap if it
    * encounters either end of the list.
    * @private
    * @param {?} delta
    * @return {?}
    */
    function(delta) {
      var items = this._getItemsArray();
      for (var i = 1; i <= items.length; i++) {
        var index = (this._activeItemIndex + delta * i + items.length) % items.length;
        var item = items[index];
        if (!this._skipPredicateFn(item)) {
          this.setActiveItem(index);
          return;
        }
      }
    };
    ListKeyManager2.prototype._setActiveInDefaultMode = /**
    * Sets the active item properly given the default mode. In other words, it will
    * continue to move down the list until it finds an item that is not disabled. If
    * it encounters either end of the list, it will stop and not wrap.
    * @private
    * @param {?} delta
    * @return {?}
    */
    function(delta) {
      this._setActiveItemByIndex(this._activeItemIndex + delta, delta);
    };
    ListKeyManager2.prototype._setActiveItemByIndex = /**
    * Sets the active item to the first enabled item starting at the index specified. If the
    * item is disabled, it will move in the fallbackDelta direction until it either
    * finds an enabled item or encounters the end of the list.
    * @private
    * @param {?} index
    * @param {?} fallbackDelta
    * @return {?}
    */
    function(index, fallbackDelta) {
      var items = this._getItemsArray();
      if (!items[index]) {
        return;
      }
      while (this._skipPredicateFn(items[index])) {
        index += fallbackDelta;
        if (!items[index]) {
          return;
        }
      }
      this.setActiveItem(index);
    };
    ListKeyManager2.prototype._getItemsArray = /**
    * Returns the items as an array.
    * @private
    * @return {?}
    */
    function() {
      return this._items instanceof QueryList ? this._items.toArray() : this._items;
    };
    return ListKeyManager2;
  })()
);
var ActiveDescendantKeyManager = (
  /** @class */
  (function(_super) {
    __extends(ActiveDescendantKeyManager2, _super);
    function ActiveDescendantKeyManager2() {
      return _super !== null && _super.apply(this, arguments) || this;
    }
    ActiveDescendantKeyManager2.prototype.setActiveItem = /**
    * @param {?} index
    * @return {?}
    */
    function(index) {
      if (this.activeItem) {
        this.activeItem.setInactiveStyles();
      }
      _super.prototype.setActiveItem.call(this, index);
      if (this.activeItem) {
        this.activeItem.setActiveStyles();
      }
    };
    return ActiveDescendantKeyManager2;
  })(ListKeyManager)
);
(function(_super) {
  __extends(FocusKeyManager, _super);
  function FocusKeyManager() {
    var _this = _super !== null && _super.apply(this, arguments) || this;
    _this._origin = "program";
    return _this;
  }
  FocusKeyManager.prototype.setFocusOrigin = /**
  * Sets the focus origin that will be passed in to the items for any subsequent `focus` calls.
  * @template THIS
  * @this {THIS}
  * @param {?} origin Focus origin to be used when focusing items.
  * @return {THIS}
  */
  function(origin) {
    /** @type {?} */
    this._origin = origin;
    return (
      /** @type {?} */
      this
    );
  };
  FocusKeyManager.prototype.setActiveItem = /**
  * @param {?} item
  * @return {?}
  */
  function(item) {
    _super.prototype.setActiveItem.call(this, item);
    if (this.activeItem) {
      this.activeItem.focus(this._origin);
    }
  };
  return FocusKeyManager;
})(ListKeyManager);
var InteractivityChecker = (
  /** @class */
  (function() {
    function InteractivityChecker2(_platform) {
      this._platform = _platform;
    }
    InteractivityChecker2.prototype.isDisabled = /**
    * Gets whether an element is disabled.
    *
    * @param {?} element Element to be checked.
    * @return {?} Whether the element is disabled.
    */
    function(element) {
      return element.hasAttribute("disabled");
    };
    InteractivityChecker2.prototype.isVisible = /**
    * Gets whether an element is visible for the purposes of interactivity.
    *
    * This will capture states like `display: none` and `visibility: hidden`, but not things like
    * being clipped by an `overflow: hidden` parent or being outside the viewport.
    *
    * @param {?} element
    * @return {?} Whether the element is visible.
    */
    function(element) {
      return hasGeometry(element) && getComputedStyle(element).visibility === "visible";
    };
    InteractivityChecker2.prototype.isTabbable = /**
    * Gets whether an element can be reached via Tab key.
    * Assumes that the element has already been checked with isFocusable.
    *
    * @param {?} element Element to be checked.
    * @return {?} Whether the element is tabbable.
    */
    function(element) {
      if (!this._platform.isBrowser) {
        return false;
      }
      var frameElement = getFrameElement(getWindow(element));
      if (frameElement) {
        var frameType = frameElement && frameElement.nodeName.toLowerCase();
        if (getTabIndexValue(frameElement) === -1) {
          return false;
        }
        if ((this._platform.BLINK || this._platform.WEBKIT) && frameType === "object") {
          return false;
        }
        if ((this._platform.BLINK || this._platform.WEBKIT) && !this.isVisible(frameElement)) {
          return false;
        }
      }
      var nodeName = element.nodeName.toLowerCase();
      var tabIndexValue = getTabIndexValue(element);
      if (element.hasAttribute("contenteditable")) {
        return tabIndexValue !== -1;
      }
      if (nodeName === "iframe") {
        return false;
      }
      if (nodeName === "audio") {
        if (!element.hasAttribute("controls")) {
          return false;
        } else if (this._platform.BLINK) {
          return true;
        }
      }
      if (nodeName === "video") {
        if (!element.hasAttribute("controls") && this._platform.TRIDENT) {
          return false;
        } else if (this._platform.BLINK || this._platform.FIREFOX) {
          return true;
        }
      }
      if (nodeName === "object" && (this._platform.BLINK || this._platform.WEBKIT)) {
        return false;
      }
      if (this._platform.WEBKIT && this._platform.IOS && !isPotentiallyTabbableIOS(element)) {
        return false;
      }
      return element.tabIndex >= 0;
    };
    InteractivityChecker2.prototype.isFocusable = /**
    * Gets whether an element can be focused by the user.
    *
    * @param {?} element Element to be checked.
    * @return {?} Whether the element is focusable.
    */
    function(element) {
      return isPotentiallyFocusable(element) && !this.isDisabled(element) && this.isVisible(element);
    };
    InteractivityChecker2.decorators = [
      { type: Injectable, args: [{ providedIn: "root" }] }
    ];
    InteractivityChecker2.ctorParameters = function() {
      return [
        { type: Platform }
      ];
    };
    InteractivityChecker2.ngInjectableDef = defineInjectable({ factory: function InteractivityChecker_Factory() {
      return new InteractivityChecker2(inject(Platform));
    }, token: InteractivityChecker2, providedIn: "root" });
    return InteractivityChecker2;
  })()
);
function getFrameElement(window2) {
  try {
    return (
      /** @type {?} */
      window2.frameElement
    );
  } catch (_a) {
    return null;
  }
}
function hasGeometry(element) {
  return !!(element.offsetWidth || element.offsetHeight || typeof element.getClientRects === "function" && element.getClientRects().length);
}
function isNativeFormElement(element) {
  var nodeName = element.nodeName.toLowerCase();
  return nodeName === "input" || nodeName === "select" || nodeName === "button" || nodeName === "textarea";
}
function isHiddenInput(element) {
  return isInputElement(element) && element.type == "hidden";
}
function isAnchorWithHref(element) {
  return isAnchorElement(element) && element.hasAttribute("href");
}
function isInputElement(element) {
  return element.nodeName.toLowerCase() == "input";
}
function isAnchorElement(element) {
  return element.nodeName.toLowerCase() == "a";
}
function hasValidTabIndex(element) {
  if (!element.hasAttribute("tabindex") || element.tabIndex === void 0) {
    return false;
  }
  var tabIndex = element.getAttribute("tabindex");
  if (tabIndex == "-32768") {
    return false;
  }
  return !!(tabIndex && !isNaN(parseInt(tabIndex, 10)));
}
function getTabIndexValue(element) {
  if (!hasValidTabIndex(element)) {
    return null;
  }
  var tabIndex = parseInt(element.getAttribute("tabindex") || "", 10);
  return isNaN(tabIndex) ? -1 : tabIndex;
}
function isPotentiallyTabbableIOS(element) {
  var nodeName = element.nodeName.toLowerCase();
  var inputType = nodeName === "input" && /** @type {?} */
  element.type;
  return inputType === "text" || inputType === "password" || nodeName === "select" || nodeName === "textarea";
}
function isPotentiallyFocusable(element) {
  if (isHiddenInput(element)) {
    return false;
  }
  return isNativeFormElement(element) || isAnchorWithHref(element) || element.hasAttribute("contenteditable") || hasValidTabIndex(element);
}
function getWindow(node) {
  return node.ownerDocument && node.ownerDocument.defaultView || window;
}
var FocusTrap = (
  /** @class */
  (function() {
    function FocusTrap2(_element, _checker, _ngZone, _document, deferAnchors) {
      if (deferAnchors === void 0) {
        deferAnchors = false;
      }
      var _this = this;
      this._element = _element;
      this._checker = _checker;
      this._ngZone = _ngZone;
      this._document = _document;
      this._hasAttached = false;
      this._startAnchorListener = function() {
        return _this.focusLastTabbableElement();
      };
      this._endAnchorListener = function() {
        return _this.focusFirstTabbableElement();
      };
      this._enabled = true;
      if (!deferAnchors) {
        this.attachAnchors();
      }
    }
    Object.defineProperty(FocusTrap2.prototype, "enabled", {
      /** Whether the focus trap is active. */
      get: (
        /**
        * Whether the focus trap is active.
        * @return {?}
        */
        function() {
          return this._enabled;
        }
      ),
      set: (
        /**
        * @param {?} value
        * @return {?}
        */
        function(value) {
          this._enabled = value;
          if (this._startAnchor && this._endAnchor) {
            this._toggleAnchorTabIndex(value, this._startAnchor);
            this._toggleAnchorTabIndex(value, this._endAnchor);
          }
        }
      ),
      enumerable: true,
      configurable: true
    });
    FocusTrap2.prototype.destroy = /**
    * Destroys the focus trap by cleaning up the anchors.
    * @return {?}
    */
    function() {
      var startAnchor = this._startAnchor;
      var endAnchor = this._endAnchor;
      if (startAnchor) {
        startAnchor.removeEventListener("focus", this._startAnchorListener);
        if (startAnchor.parentNode) {
          startAnchor.parentNode.removeChild(startAnchor);
        }
      }
      if (endAnchor) {
        endAnchor.removeEventListener("focus", this._endAnchorListener);
        if (endAnchor.parentNode) {
          endAnchor.parentNode.removeChild(endAnchor);
        }
      }
      this._startAnchor = this._endAnchor = null;
    };
    FocusTrap2.prototype.attachAnchors = /**
    * Inserts the anchors into the DOM. This is usually done automatically
    * in the constructor, but can be deferred for cases like directives with `*ngIf`.
    * @return {?} Whether the focus trap managed to attach successfuly. This may not be the case
    * if the target element isn't currently in the DOM.
    */
    function() {
      var _this = this;
      if (this._hasAttached) {
        return true;
      }
      this._ngZone.runOutsideAngular(function() {
        if (!_this._startAnchor) {
          _this._startAnchor = _this._createAnchor();
          /** @type {?} */
          _this._startAnchor.addEventListener("focus", _this._startAnchorListener);
        }
        if (!_this._endAnchor) {
          _this._endAnchor = _this._createAnchor();
          /** @type {?} */
          _this._endAnchor.addEventListener("focus", _this._endAnchorListener);
        }
      });
      if (this._element.parentNode) {
        this._element.parentNode.insertBefore(
          /** @type {?} */
          this._startAnchor,
          this._element
        );
        this._element.parentNode.insertBefore(
          /** @type {?} */
          this._endAnchor,
          this._element.nextSibling
        );
        this._hasAttached = true;
      }
      return this._hasAttached;
    };
    FocusTrap2.prototype.focusInitialElementWhenReady = /**
    * Waits for the zone to stabilize, then either focuses the first element that the
    * user specified, or the first tabbable element.
    * @return {?} Returns a promise that resolves with a boolean, depending
    * on whether focus was moved successfuly.
    */
    function() {
      var _this = this;
      return new Promise(function(resolve) {
        _this._executeOnStable(function() {
          return resolve(_this.focusInitialElement());
        });
      });
    };
    FocusTrap2.prototype.focusFirstTabbableElementWhenReady = /**
    * Waits for the zone to stabilize, then focuses
    * the first tabbable element within the focus trap region.
    * @return {?} Returns a promise that resolves with a boolean, depending
    * on whether focus was moved successfuly.
    */
    function() {
      var _this = this;
      return new Promise(function(resolve) {
        _this._executeOnStable(function() {
          return resolve(_this.focusFirstTabbableElement());
        });
      });
    };
    FocusTrap2.prototype.focusLastTabbableElementWhenReady = /**
    * Waits for the zone to stabilize, then focuses
    * the last tabbable element within the focus trap region.
    * @return {?} Returns a promise that resolves with a boolean, depending
    * on whether focus was moved successfuly.
    */
    function() {
      var _this = this;
      return new Promise(function(resolve) {
        _this._executeOnStable(function() {
          return resolve(_this.focusLastTabbableElement());
        });
      });
    };
    FocusTrap2.prototype._getRegionBoundary = /**
    * Get the specified boundary element of the trapped region.
    * @private
    * @param {?} bound The boundary to get (start or end of trapped region).
    * @return {?} The boundary element.
    */
    function(bound) {
      var markers = (
        /** @type {?} */
        this._element.querySelectorAll("[cdk-focus-region-" + bound + "], " + ("[cdkFocusRegion" + bound + "], ") + ("[cdk-focus-" + bound + "]"))
      );
      for (var i = 0; i < markers.length; i++) {
        if (markers[i].hasAttribute("cdk-focus-" + bound)) {
          console.warn("Found use of deprecated attribute 'cdk-focus-" + bound + "', " + ("use 'cdkFocusRegion" + bound + "' instead. The deprecated ") + "attribute will be removed in 8.0.0.", markers[i]);
        } else if (markers[i].hasAttribute("cdk-focus-region-" + bound)) {
          console.warn("Found use of deprecated attribute 'cdk-focus-region-" + bound + "', " + ("use 'cdkFocusRegion" + bound + "' instead. The deprecated attribute ") + "will be removed in 8.0.0.", markers[i]);
        }
      }
      if (bound == "start") {
        return markers.length ? markers[0] : this._getFirstTabbableElement(this._element);
      }
      return markers.length ? markers[markers.length - 1] : this._getLastTabbableElement(this._element);
    };
    FocusTrap2.prototype.focusInitialElement = /**
    * Focuses the element that should be focused when the focus trap is initialized.
    * @return {?} Whether focus was moved successfuly.
    */
    function() {
      var redirectToElement = (
        /** @type {?} */
        this._element.querySelector("[cdk-focus-initial], [cdkFocusInitial]")
      );
      if (redirectToElement) {
        if (redirectToElement.hasAttribute("cdk-focus-initial")) {
          console.warn("Found use of deprecated attribute 'cdk-focus-initial', use 'cdkFocusInitial' instead. The deprecated attribute will be removed in 8.0.0", redirectToElement);
        }
        if (isDevMode() && !this._checker.isFocusable(redirectToElement)) {
          console.warn("Element matching '[cdkFocusInitial]' is not focusable.", redirectToElement);
        }
        redirectToElement.focus();
        return true;
      }
      return this.focusFirstTabbableElement();
    };
    FocusTrap2.prototype.focusFirstTabbableElement = /**
    * Focuses the first tabbable element within the focus trap region.
    * @return {?} Whether focus was moved successfuly.
    */
    function() {
      var redirectToElement = this._getRegionBoundary("start");
      if (redirectToElement) {
        redirectToElement.focus();
      }
      return !!redirectToElement;
    };
    FocusTrap2.prototype.focusLastTabbableElement = /**
    * Focuses the last tabbable element within the focus trap region.
    * @return {?} Whether focus was moved successfuly.
    */
    function() {
      var redirectToElement = this._getRegionBoundary("end");
      if (redirectToElement) {
        redirectToElement.focus();
      }
      return !!redirectToElement;
    };
    FocusTrap2.prototype.hasAttached = /**
    * Checks whether the focus trap has successfuly been attached.
    * @return {?}
    */
    function() {
      return this._hasAttached;
    };
    FocusTrap2.prototype._getFirstTabbableElement = /**
    * Get the first tabbable element from a DOM subtree (inclusive).
    * @private
    * @param {?} root
    * @return {?}
    */
    function(root) {
      if (this._checker.isFocusable(root) && this._checker.isTabbable(root)) {
        return root;
      }
      var children = root.children || root.childNodes;
      for (var i = 0; i < children.length; i++) {
        var tabbableChild = children[i].nodeType === this._document.ELEMENT_NODE ? this._getFirstTabbableElement(
          /** @type {?} */
          children[i]
        ) : null;
        if (tabbableChild) {
          return tabbableChild;
        }
      }
      return null;
    };
    FocusTrap2.prototype._getLastTabbableElement = /**
    * Get the last tabbable element from a DOM subtree (inclusive).
    * @private
    * @param {?} root
    * @return {?}
    */
    function(root) {
      if (this._checker.isFocusable(root) && this._checker.isTabbable(root)) {
        return root;
      }
      var children = root.children || root.childNodes;
      for (var i = children.length - 1; i >= 0; i--) {
        var tabbableChild = children[i].nodeType === this._document.ELEMENT_NODE ? this._getLastTabbableElement(
          /** @type {?} */
          children[i]
        ) : null;
        if (tabbableChild) {
          return tabbableChild;
        }
      }
      return null;
    };
    FocusTrap2.prototype._createAnchor = /**
    * Creates an anchor element.
    * @private
    * @return {?}
    */
    function() {
      var anchor = this._document.createElement("div");
      this._toggleAnchorTabIndex(this._enabled, anchor);
      anchor.classList.add("cdk-visually-hidden");
      anchor.classList.add("cdk-focus-trap-anchor");
      anchor.setAttribute("aria-hidden", "true");
      return anchor;
    };
    FocusTrap2.prototype._toggleAnchorTabIndex = /**
    * Toggles the `tabindex` of an anchor, based on the enabled state of the focus trap.
    * @private
    * @param {?} isEnabled Whether the focus trap is enabled.
    * @param {?} anchor Anchor on which to toggle the tabindex.
    * @return {?}
    */
    function(isEnabled, anchor) {
      isEnabled ? anchor.setAttribute("tabindex", "0") : anchor.removeAttribute("tabindex");
    };
    FocusTrap2.prototype._executeOnStable = /**
    * Executes a function when the zone is stable.
    * @private
    * @param {?} fn
    * @return {?}
    */
    function(fn2) {
      if (this._ngZone.isStable) {
        fn2();
      } else {
        this._ngZone.onStable.asObservable().pipe(take(1)).subscribe(fn2);
      }
    };
    return FocusTrap2;
  })()
);
var FocusTrapFactory = (
  /** @class */
  (function() {
    function FocusTrapFactory2(_checker, _ngZone, _document) {
      this._checker = _checker;
      this._ngZone = _ngZone;
      this._document = _document;
    }
    FocusTrapFactory2.prototype.create = /**
    * Creates a focus-trapped region around the given element.
    * @param {?} element The element around which focus will be trapped.
    * @param {?=} deferCaptureElements Defers the creation of focus-capturing elements to be done
    *     manually by the user.
    * @return {?} The created focus trap instance.
    */
    function(element, deferCaptureElements) {
      if (deferCaptureElements === void 0) {
        deferCaptureElements = false;
      }
      return new FocusTrap(element, this._checker, this._ngZone, this._document, deferCaptureElements);
    };
    FocusTrapFactory2.decorators = [
      { type: Injectable, args: [{ providedIn: "root" }] }
    ];
    FocusTrapFactory2.ctorParameters = function() {
      return [
        { type: InteractivityChecker },
        { type: NgZone },
        { type: void 0, decorators: [{ type: Inject, args: [DOCUMENT] }] }
      ];
    };
    FocusTrapFactory2.ngInjectableDef = defineInjectable({ factory: function FocusTrapFactory_Factory() {
      return new FocusTrapFactory2(inject(InteractivityChecker), inject(NgZone), inject(DOCUMENT));
    }, token: FocusTrapFactory2, providedIn: "root" });
    return FocusTrapFactory2;
  })()
);
(function() {
  function CdkTrapFocus(_elementRef, _focusTrapFactory, _document) {
    this._elementRef = _elementRef;
    this._focusTrapFactory = _focusTrapFactory;
    this._previouslyFocusedElement = null;
    this._document = _document;
    this.focusTrap = this._focusTrapFactory.create(this._elementRef.nativeElement, true);
  }
  Object.defineProperty(CdkTrapFocus.prototype, "enabled", {
    /** Whether the focus trap is active. */
    get: (
      /**
      * Whether the focus trap is active.
      * @return {?}
      */
      function() {
        return this.focusTrap.enabled;
      }
    ),
    set: (
      /**
      * @param {?} value
      * @return {?}
      */
      function(value) {
        this.focusTrap.enabled = coerceBooleanProperty(value);
      }
    ),
    enumerable: true,
    configurable: true
  });
  Object.defineProperty(CdkTrapFocus.prototype, "autoCapture", {
    /**
     * Whether the directive should automatially move focus into the trapped region upon
     * initialization and return focus to the previous activeElement upon destruction.
     */
    get: (
      /**
      * Whether the directive should automatially move focus into the trapped region upon
      * initialization and return focus to the previous activeElement upon destruction.
      * @return {?}
      */
      function() {
        return this._autoCapture;
      }
    ),
    set: (
      /**
      * @param {?} value
      * @return {?}
      */
      function(value) {
        this._autoCapture = coerceBooleanProperty(value);
      }
    ),
    enumerable: true,
    configurable: true
  });
  CdkTrapFocus.prototype.ngOnDestroy = /**
  * @return {?}
  */
  function() {
    this.focusTrap.destroy();
    if (this._previouslyFocusedElement) {
      this._previouslyFocusedElement.focus();
      this._previouslyFocusedElement = null;
    }
  };
  CdkTrapFocus.prototype.ngAfterContentInit = /**
  * @return {?}
  */
  function() {
    this.focusTrap.attachAnchors();
    if (this.autoCapture) {
      this._previouslyFocusedElement = /** @type {?} */
      this._document.activeElement;
      this.focusTrap.focusInitialElementWhenReady();
    }
  };
  CdkTrapFocus.prototype.ngDoCheck = /**
  * @return {?}
  */
  function() {
    if (!this.focusTrap.hasAttached()) {
      this.focusTrap.attachAnchors();
    }
  };
  CdkTrapFocus.decorators = [
    { type: Directive, args: [{
      selector: "[cdkTrapFocus]",
      exportAs: "cdkTrapFocus"
    }] }
  ];
  CdkTrapFocus.ctorParameters = function() {
    return [
      { type: ElementRef },
      { type: FocusTrapFactory },
      { type: void 0, decorators: [{ type: Inject, args: [DOCUMENT] }] }
    ];
  };
  CdkTrapFocus.propDecorators = {
    enabled: [{ type: Input, args: ["cdkTrapFocus"] }],
    autoCapture: [{ type: Input, args: ["cdkTrapFocusAutoCapture"] }]
  };
  return CdkTrapFocus;
})();
var LIVE_ANNOUNCER_ELEMENT_TOKEN = new InjectionToken("liveAnnouncerElement", {
  providedIn: "root",
  factory: LIVE_ANNOUNCER_ELEMENT_TOKEN_FACTORY
});
function LIVE_ANNOUNCER_ELEMENT_TOKEN_FACTORY() {
  return null;
}
var LiveAnnouncer = (
  /** @class */
  (function() {
    function LiveAnnouncer2(elementToken, _ngZone, _document) {
      this._ngZone = _ngZone;
      this._document = _document;
      this._liveElement = elementToken || this._createLiveElement();
    }
    LiveAnnouncer2.prototype.announce = /**
    * @param {?} message
    * @param {...?} args
    * @return {?}
    */
    function(message) {
      var _this = this;
      var args = [];
      for (var _i = 1; _i < arguments.length; _i++) {
        args[_i - 1] = arguments[_i];
      }
      var politeness;
      var duration;
      if (args.length === 1 && typeof args[0] === "number") {
        duration = args[0];
      } else {
        politeness = args[0], duration = args[1];
      }
      this.clear();
      clearTimeout(this._previousTimeout);
      this._liveElement.setAttribute(
        "aria-live",
        /** @type {?} */
        politeness || "polite"
      );
      return this._ngZone.runOutsideAngular(function() {
        return new Promise(function(resolve) {
          clearTimeout(_this._previousTimeout);
          _this._previousTimeout = setTimeout(function() {
            _this._liveElement.textContent = message;
            resolve();
            if (typeof duration === "number") {
              _this._previousTimeout = setTimeout(function() {
                return _this.clear();
              }, duration);
            }
          }, 100);
        });
      });
    };
    LiveAnnouncer2.prototype.clear = /**
    * Clears the current text from the announcer element. Can be used to prevent
    * screen readers from reading the text out again while the user is going
    * through the page landmarks.
    * @return {?}
    */
    function() {
      if (this._liveElement) {
        this._liveElement.textContent = "";
      }
    };
    LiveAnnouncer2.prototype.ngOnDestroy = /**
    * @return {?}
    */
    function() {
      clearTimeout(this._previousTimeout);
      if (this._liveElement && this._liveElement.parentNode) {
        this._liveElement.parentNode.removeChild(this._liveElement);
        this._liveElement = /** @type {?} */
        null;
      }
    };
    LiveAnnouncer2.prototype._createLiveElement = /**
    * @private
    * @return {?}
    */
    function() {
      var elementClass = "cdk-live-announcer-element";
      var previousElements = this._document.getElementsByClassName(elementClass);
      var liveEl = this._document.createElement("div");
      for (var i = 0; i < previousElements.length; i++) {
        /** @type {?} */
        previousElements[i].parentNode.removeChild(previousElements[i]);
      }
      liveEl.classList.add(elementClass);
      liveEl.classList.add("cdk-visually-hidden");
      liveEl.setAttribute("aria-atomic", "true");
      liveEl.setAttribute("aria-live", "polite");
      this._document.body.appendChild(liveEl);
      return liveEl;
    };
    LiveAnnouncer2.decorators = [
      { type: Injectable, args: [{ providedIn: "root" }] }
    ];
    LiveAnnouncer2.ctorParameters = function() {
      return [
        { type: void 0, decorators: [{ type: Optional }, { type: Inject, args: [LIVE_ANNOUNCER_ELEMENT_TOKEN] }] },
        { type: NgZone },
        { type: void 0, decorators: [{ type: Inject, args: [DOCUMENT] }] }
      ];
    };
    LiveAnnouncer2.ngInjectableDef = defineInjectable({ factory: function LiveAnnouncer_Factory() {
      return new LiveAnnouncer2(inject(LIVE_ANNOUNCER_ELEMENT_TOKEN, 8), inject(NgZone), inject(DOCUMENT));
    }, token: LiveAnnouncer2, providedIn: "root" });
    return LiveAnnouncer2;
  })()
);
(function() {
  function CdkAriaLive(_elementRef, _liveAnnouncer, _contentObserver, _ngZone) {
    this._elementRef = _elementRef;
    this._liveAnnouncer = _liveAnnouncer;
    this._contentObserver = _contentObserver;
    this._ngZone = _ngZone;
    this._politeness = "off";
  }
  Object.defineProperty(CdkAriaLive.prototype, "politeness", {
    /** The aria-live politeness level to use when announcing messages. */
    get: (
      /**
      * The aria-live politeness level to use when announcing messages.
      * @return {?}
      */
      function() {
        return this._politeness;
      }
    ),
    set: (
      /**
      * @param {?} value
      * @return {?}
      */
      function(value) {
        var _this = this;
        this._politeness = value === "polite" || value === "assertive" ? value : "off";
        if (this._politeness === "off") {
          if (this._subscription) {
            this._subscription.unsubscribe();
            this._subscription = null;
          }
        } else if (!this._subscription) {
          this._subscription = this._ngZone.runOutsideAngular(function() {
            return _this._contentObserver.observe(_this._elementRef).subscribe(function() {
              var elementText = _this._elementRef.nativeElement.textContent;
              if (elementText !== _this._previousAnnouncedText) {
                _this._liveAnnouncer.announce(elementText, _this._politeness);
                _this._previousAnnouncedText = elementText;
              }
            });
          });
        }
      }
    ),
    enumerable: true,
    configurable: true
  });
  CdkAriaLive.prototype.ngOnDestroy = /**
  * @return {?}
  */
  function() {
    if (this._subscription) {
      this._subscription.unsubscribe();
    }
  };
  CdkAriaLive.decorators = [
    { type: Directive, args: [{
      selector: "[cdkAriaLive]",
      exportAs: "cdkAriaLive"
    }] }
  ];
  CdkAriaLive.ctorParameters = function() {
    return [
      { type: ElementRef },
      { type: LiveAnnouncer },
      { type: ContentObserver },
      { type: NgZone }
    ];
  };
  CdkAriaLive.propDecorators = {
    politeness: [{ type: Input, args: ["cdkAriaLive"] }]
  };
  return CdkAriaLive;
})();
({
  deps: [
    [new Optional(), new SkipSelf(), LiveAnnouncer],
    [new Optional(), new Inject(LIVE_ANNOUNCER_ELEMENT_TOKEN)],
    DOCUMENT,
    NgZone
  ]
});
var TOUCH_BUFFER_MS = 650;
var captureEventListenerOptions = normalizePassiveListenerOptions({
  passive: true,
  capture: true
});
var FocusMonitor = (
  /** @class */
  (function() {
    function FocusMonitor2(_ngZone, _platform) {
      var _this = this;
      this._ngZone = _ngZone;
      this._platform = _platform;
      this._origin = null;
      this._windowFocused = false;
      this._elementInfo = /* @__PURE__ */ new Map();
      this._monitoredElementCount = 0;
      this._documentKeydownListener = function() {
        _this._lastTouchTarget = null;
        _this._setOriginForCurrentEventQueue("keyboard");
      };
      this._documentMousedownListener = function() {
        if (!_this._lastTouchTarget) {
          _this._setOriginForCurrentEventQueue("mouse");
        }
      };
      this._documentTouchstartListener = function(event) {
        if (_this._touchTimeoutId != null) {
          clearTimeout(_this._touchTimeoutId);
        }
        _this._lastTouchTarget = event.target;
        _this._touchTimeoutId = setTimeout(function() {
          return _this._lastTouchTarget = null;
        }, TOUCH_BUFFER_MS);
      };
      this._windowFocusListener = function() {
        _this._windowFocused = true;
        _this._windowFocusTimeoutId = setTimeout(function() {
          return _this._windowFocused = false;
        });
      };
    }
    FocusMonitor2.prototype.monitor = /**
    * @param {?} element
    * @param {?=} checkChildren
    * @return {?}
    */
    function(element, checkChildren) {
      var _this = this;
      if (checkChildren === void 0) {
        checkChildren = false;
      }
      if (!this._platform.isBrowser) {
        return of(null);
      }
      var nativeElement = coerceElement(element);
      if (this._elementInfo.has(nativeElement)) {
        var cachedInfo = this._elementInfo.get(nativeElement);
        /** @type {?} */
        cachedInfo.checkChildren = checkChildren;
        return (
          /** @type {?} */
          cachedInfo.subject.asObservable()
        );
      }
      var info = {
        unlisten: function() {
        },
        checkChildren,
        subject: new Subject()
      };
      this._elementInfo.set(nativeElement, info);
      this._incrementMonitoredElementCount();
      var focusListener = function(event) {
        return _this._onFocus(event, nativeElement);
      };
      var blurListener = function(event) {
        return _this._onBlur(event, nativeElement);
      };
      this._ngZone.runOutsideAngular(function() {
        nativeElement.addEventListener("focus", focusListener, true);
        nativeElement.addEventListener("blur", blurListener, true);
      });
      info.unlisten = function() {
        nativeElement.removeEventListener("focus", focusListener, true);
        nativeElement.removeEventListener("blur", blurListener, true);
      };
      return info.subject.asObservable();
    };
    FocusMonitor2.prototype.stopMonitoring = /**
    * @param {?} element
    * @return {?}
    */
    function(element) {
      var nativeElement = coerceElement(element);
      var elementInfo = this._elementInfo.get(nativeElement);
      if (elementInfo) {
        elementInfo.unlisten();
        elementInfo.subject.complete();
        this._setClasses(nativeElement);
        this._elementInfo.delete(nativeElement);
        this._decrementMonitoredElementCount();
      }
    };
    FocusMonitor2.prototype.focusVia = /**
    * @param {?} element
    * @param {?} origin
    * @param {?=} options
    * @return {?}
    */
    function(element, origin, options) {
      var nativeElement = coerceElement(element);
      this._setOriginForCurrentEventQueue(origin);
      if (typeof nativeElement.focus === "function") {
        /** @type {?} */
        nativeElement.focus(options);
      }
    };
    FocusMonitor2.prototype.ngOnDestroy = /**
    * @return {?}
    */
    function() {
      var _this = this;
      this._elementInfo.forEach(function(_info, element) {
        return _this.stopMonitoring(element);
      });
    };
    FocusMonitor2.prototype._toggleClass = /**
    * @private
    * @param {?} element
    * @param {?} className
    * @param {?} shouldSet
    * @return {?}
    */
    function(element, className, shouldSet) {
      if (shouldSet) {
        element.classList.add(className);
      } else {
        element.classList.remove(className);
      }
    };
    FocusMonitor2.prototype._setClasses = /**
    * Sets the focus classes on the element based on the given focus origin.
    * @private
    * @param {?} element The element to update the classes on.
    * @param {?=} origin The focus origin.
    * @return {?}
    */
    function(element, origin) {
      var elementInfo = this._elementInfo.get(element);
      if (elementInfo) {
        this._toggleClass(element, "cdk-focused", !!origin);
        this._toggleClass(element, "cdk-touch-focused", origin === "touch");
        this._toggleClass(element, "cdk-keyboard-focused", origin === "keyboard");
        this._toggleClass(element, "cdk-mouse-focused", origin === "mouse");
        this._toggleClass(element, "cdk-program-focused", origin === "program");
      }
    };
    FocusMonitor2.prototype._setOriginForCurrentEventQueue = /**
    * Sets the origin and schedules an async function to clear it at the end of the event queue.
    * @private
    * @param {?} origin The origin to set.
    * @return {?}
    */
    function(origin) {
      var _this = this;
      this._ngZone.runOutsideAngular(function() {
        _this._origin = origin;
        _this._originTimeoutId = setTimeout(function() {
          return _this._origin = null;
        }, 1);
      });
    };
    FocusMonitor2.prototype._wasCausedByTouch = /**
    * Checks whether the given focus event was caused by a touchstart event.
    * @private
    * @param {?} event The focus event to check.
    * @return {?} Whether the event was caused by a touch.
    */
    function(event) {
      var focusTarget = event.target;
      return this._lastTouchTarget instanceof Node && focusTarget instanceof Node && (focusTarget === this._lastTouchTarget || focusTarget.contains(this._lastTouchTarget));
    };
    FocusMonitor2.prototype._onFocus = /**
    * Handles focus events on a registered element.
    * @private
    * @param {?} event The focus event.
    * @param {?} element The monitored element.
    * @return {?}
    */
    function(event, element) {
      var elementInfo = this._elementInfo.get(element);
      if (!elementInfo || !elementInfo.checkChildren && element !== event.target) {
        return;
      }
      var origin = this._origin;
      if (!origin) {
        if (this._windowFocused && this._lastFocusOrigin) {
          origin = this._lastFocusOrigin;
        } else if (this._wasCausedByTouch(event)) {
          origin = "touch";
        } else {
          origin = "program";
        }
      }
      this._setClasses(element, origin);
      this._emitOrigin(elementInfo.subject, origin);
      this._lastFocusOrigin = origin;
    };
    FocusMonitor2.prototype._onBlur = /**
    * Handles blur events on a registered element.
    * @param {?} event The blur event.
    * @param {?} element The monitored element.
    * @return {?}
    */
    function(event, element) {
      var elementInfo = this._elementInfo.get(element);
      if (!elementInfo || elementInfo.checkChildren && event.relatedTarget instanceof Node && element.contains(event.relatedTarget)) {
        return;
      }
      this._setClasses(element);
      this._emitOrigin(elementInfo.subject, null);
    };
    FocusMonitor2.prototype._emitOrigin = /**
    * @private
    * @param {?} subject
    * @param {?} origin
    * @return {?}
    */
    function(subject, origin) {
      this._ngZone.run(function() {
        return subject.next(origin);
      });
    };
    FocusMonitor2.prototype._incrementMonitoredElementCount = /**
    * @private
    * @return {?}
    */
    function() {
      var _this = this;
      if (++this._monitoredElementCount == 1 && this._platform.isBrowser) {
        this._ngZone.runOutsideAngular(function() {
          document.addEventListener("keydown", _this._documentKeydownListener, captureEventListenerOptions);
          document.addEventListener("mousedown", _this._documentMousedownListener, captureEventListenerOptions);
          document.addEventListener("touchstart", _this._documentTouchstartListener, captureEventListenerOptions);
          window.addEventListener("focus", _this._windowFocusListener);
        });
      }
    };
    FocusMonitor2.prototype._decrementMonitoredElementCount = /**
    * @private
    * @return {?}
    */
    function() {
      if (!--this._monitoredElementCount) {
        document.removeEventListener("keydown", this._documentKeydownListener, captureEventListenerOptions);
        document.removeEventListener("mousedown", this._documentMousedownListener, captureEventListenerOptions);
        document.removeEventListener("touchstart", this._documentTouchstartListener, captureEventListenerOptions);
        window.removeEventListener("focus", this._windowFocusListener);
        clearTimeout(this._windowFocusTimeoutId);
        clearTimeout(this._touchTimeoutId);
        clearTimeout(this._originTimeoutId);
      }
    };
    FocusMonitor2.decorators = [
      { type: Injectable, args: [{ providedIn: "root" }] }
    ];
    FocusMonitor2.ctorParameters = function() {
      return [
        { type: NgZone },
        { type: Platform }
      ];
    };
    FocusMonitor2.ngInjectableDef = defineInjectable({ factory: function FocusMonitor_Factory() {
      return new FocusMonitor2(inject(NgZone), inject(Platform));
    }, token: FocusMonitor2, providedIn: "root" });
    return FocusMonitor2;
  })()
);
(function() {
  function CdkMonitorFocus(_elementRef, _focusMonitor) {
    var _this = this;
    this._elementRef = _elementRef;
    this._focusMonitor = _focusMonitor;
    this.cdkFocusChange = new EventEmitter();
    this._monitorSubscription = this._focusMonitor.monitor(this._elementRef, this._elementRef.nativeElement.hasAttribute("cdkMonitorSubtreeFocus")).subscribe(function(origin) {
      return _this.cdkFocusChange.emit(origin);
    });
  }
  CdkMonitorFocus.prototype.ngOnDestroy = /**
  * @return {?}
  */
  function() {
    this._focusMonitor.stopMonitoring(this._elementRef);
    this._monitorSubscription.unsubscribe();
  };
  CdkMonitorFocus.decorators = [
    { type: Directive, args: [{
      selector: "[cdkMonitorElementFocus], [cdkMonitorSubtreeFocus]"
    }] }
  ];
  CdkMonitorFocus.ctorParameters = function() {
    return [
      { type: ElementRef },
      { type: FocusMonitor }
    ];
  };
  CdkMonitorFocus.propDecorators = {
    cdkFocusChange: [{ type: Output }]
  };
  return CdkMonitorFocus;
})();
({
  deps: [[new Optional(), new SkipSelf(), FocusMonitor], NgZone, Platform]
});
var ContextMenuItemDirective = (
  /** @class */
  (function() {
    function ContextMenuItemDirective2(template, elementRef) {
      this.template = template;
      this.elementRef = elementRef;
      this.divider = false;
      this.enabled = true;
      this.passive = false;
      this.visible = true;
      this.execute = new EventEmitter();
      this.isActive = false;
    }
    Object.defineProperty(ContextMenuItemDirective2.prototype, "disabled", {
      get: (
        /**
        * @return {?}
        */
        function() {
          return this.passive || this.divider || !this.evaluateIfFunction(this.enabled, this.currentItem);
        }
      ),
      enumerable: true,
      configurable: true
    });
    ContextMenuItemDirective2.prototype.evaluateIfFunction = /**
    * @param {?} value
    * @param {?} item
    * @return {?}
    */
    function(value, item) {
      if (value instanceof Function) {
        return value(item);
      }
      return value;
    };
    ContextMenuItemDirective2.prototype.setActiveStyles = /**
    * @return {?}
    */
    function() {
      this.isActive = true;
    };
    ContextMenuItemDirective2.prototype.setInactiveStyles = /**
    * @return {?}
    */
    function() {
      this.isActive = false;
    };
    ContextMenuItemDirective2.prototype.triggerExecute = /**
    * @param {?} item
    * @param {?=} $event
    * @return {?}
    */
    function(item, $event) {
      if (!this.evaluateIfFunction(this.enabled, item)) {
        return;
      }
      this.execute.emit({ event: $event, item });
    };
    ContextMenuItemDirective2.decorators = [
      { type: Directive, args: [{
        /* tslint:disable:directive-selector-type */
        selector: "[contextMenuItem]"
      }] }
    ];
    ContextMenuItemDirective2.ctorParameters = function() {
      return [
        { type: TemplateRef },
        { type: ElementRef }
      ];
    };
    ContextMenuItemDirective2.propDecorators = {
      subMenu: [{ type: Input }],
      divider: [{ type: Input }],
      enabled: [{ type: Input }],
      passive: [{ type: Input }],
      visible: [{ type: Input }],
      execute: [{ type: Output }]
    };
    return ContextMenuItemDirective2;
  })()
);
var CONTEXT_MENU_OPTIONS = new InjectionToken("CONTEXT_MENU_OPTIONS");
var ARROW_LEFT_KEYCODE = 37;
var ContextMenuContentComponent = (
  /** @class */
  (function() {
    function ContextMenuContentComponent2(changeDetector, elementRef, options) {
      this.changeDetector = changeDetector;
      this.elementRef = elementRef;
      this.options = options;
      this.menuItems = [];
      this.isLeaf = false;
      this.execute = new EventEmitter();
      this.openSubMenu = new EventEmitter();
      this.closeLeafMenu = new EventEmitter();
      this.closeAllMenus = new EventEmitter();
      this.autoFocus = false;
      this.useBootstrap4 = false;
      this.subscription = new Subscription();
      if (options) {
        this.autoFocus = options.autoFocus;
        this.useBootstrap4 = options.useBootstrap4;
      }
    }
    ContextMenuContentComponent2.prototype.ngOnInit = /**
    * @return {?}
    */
    function() {
      var _this = this;
      this.menuItems.forEach(
        /**
        * @param {?} menuItem
        * @return {?}
        */
        (function(menuItem) {
          menuItem.currentItem = _this.item;
          _this.subscription.add(menuItem.execute.subscribe(
            /**
            * @param {?} event
            * @return {?}
            */
            (function(event) {
              return _this.execute.emit(__assign({}, event, { menuItem }));
            })
          ));
        })
      );
      var queryList = new QueryList();
      queryList.reset(this.menuItems);
      this._keyManager = new ActiveDescendantKeyManager(queryList).withWrap();
    };
    ContextMenuContentComponent2.prototype.ngAfterViewInit = /**
    * @return {?}
    */
    function() {
      var _this = this;
      if (this.autoFocus) {
        setTimeout(
          /**
          * @return {?}
          */
          (function() {
            return _this.focus();
          })
        );
      }
      this.overlay.updatePosition();
    };
    ContextMenuContentComponent2.prototype.ngOnDestroy = /**
    * @return {?}
    */
    function() {
      this.subscription.unsubscribe();
    };
    ContextMenuContentComponent2.prototype.focus = /**
    * @return {?}
    */
    function() {
      if (this.autoFocus) {
        this.menuElement.nativeElement.focus();
      }
    };
    ContextMenuContentComponent2.prototype.stopEvent = /**
    * @param {?} $event
    * @return {?}
    */
    function($event) {
      $event.stopPropagation();
    };
    ContextMenuContentComponent2.prototype.isMenuItemEnabled = /**
    * @param {?} menuItem
    * @return {?}
    */
    function(menuItem) {
      return this.evaluateIfFunction(menuItem && menuItem.enabled);
    };
    ContextMenuContentComponent2.prototype.isMenuItemVisible = /**
    * @param {?} menuItem
    * @return {?}
    */
    function(menuItem) {
      return this.evaluateIfFunction(menuItem && menuItem.visible);
    };
    ContextMenuContentComponent2.prototype.evaluateIfFunction = /**
    * @param {?} value
    * @return {?}
    */
    function(value) {
      if (value instanceof Function) {
        return value(this.item);
      }
      return value;
    };
    ContextMenuContentComponent2.prototype.isDisabled = /**
    * @param {?} link
    * @return {?}
    */
    function(link) {
      return link.enabled && !link.enabled(this.item);
    };
    ContextMenuContentComponent2.prototype.onKeyEvent = /**
    * @param {?} event
    * @return {?}
    */
    function(event) {
      if (!this.isLeaf) {
        return;
      }
      this._keyManager.onKeydown(event);
    };
    ContextMenuContentComponent2.prototype.keyboardOpenSubMenu = /**
    * @param {?=} event
    * @return {?}
    */
    function(event) {
      if (!this.isLeaf) {
        return;
      }
      this.cancelEvent(event);
      var menuItem = this.menuItems[this._keyManager.activeItemIndex];
      if (menuItem) {
        this.onOpenSubMenu(menuItem);
      }
    };
    ContextMenuContentComponent2.prototype.keyboardMenuItemSelect = /**
    * @param {?=} event
    * @return {?}
    */
    function(event) {
      if (!this.isLeaf) {
        return;
      }
      this.cancelEvent(event);
      var menuItem = this.menuItems[this._keyManager.activeItemIndex];
      if (menuItem) {
        this.onMenuItemSelect(menuItem, event);
      }
    };
    ContextMenuContentComponent2.prototype.onCloseLeafMenu = /**
    * @param {?} event
    * @return {?}
    */
    function(event) {
      if (!this.isLeaf) {
        return;
      }
      this.cancelEvent(event);
      this.closeLeafMenu.emit({
        exceptRootMenu: event.keyCode === ARROW_LEFT_KEYCODE,
        event
      });
    };
    ContextMenuContentComponent2.prototype.closeMenu = /**
    * @param {?} event
    * @return {?}
    */
    function(event) {
      if (event.type === "click" && event.button === 2) {
        return;
      }
      this.closeAllMenus.emit({ event });
    };
    ContextMenuContentComponent2.prototype.onOpenSubMenu = /**
    * @param {?} menuItem
    * @param {?=} event
    * @return {?}
    */
    function(menuItem, event) {
      var anchorElementRef = this.menuItemElements.toArray()[this._keyManager.activeItemIndex];
      var anchorElement = anchorElementRef && anchorElementRef.nativeElement;
      this.openSubMenu.emit({
        anchorElement,
        contextMenu: menuItem.subMenu,
        event,
        item: this.item,
        parentContextMenu: this
      });
    };
    ContextMenuContentComponent2.prototype.onMenuItemSelect = /**
    * @param {?} menuItem
    * @param {?} event
    * @return {?}
    */
    function(menuItem, event) {
      event.preventDefault();
      event.stopPropagation();
      this.onOpenSubMenu(menuItem, event);
      if (!menuItem.subMenu) {
        menuItem.triggerExecute(this.item, event);
      }
    };
    ContextMenuContentComponent2.prototype.cancelEvent = /**
    * @private
    * @param {?} event
    * @return {?}
    */
    function(event) {
      if (!event) {
        return;
      }
      var target = event.target;
      if (["INPUT", "TEXTAREA", "SELECT"].indexOf(target.tagName) > -1 || target.isContentEditable) {
        return;
      }
      event.preventDefault();
      event.stopPropagation();
    };
    ContextMenuContentComponent2.decorators = [
      { type: Component, args: [{
        selector: "context-menu-content",
        template: `
    <div
      class="dropdown open show ngx-contextmenu"
      [ngClass]="menuClass"
      tabindex="0"
    >
      <ul
        #menu
        class="dropdown-menu show"
        style="position: static; float: none;"
        tabindex="0"
      >
        <li
          #li
          *ngFor="let menuItem of menuItems; let i = index"
          [class.disabled]="!isMenuItemEnabled(menuItem)"
          [class.divider]="menuItem.divider"
          [class.dropdown-divider]="useBootstrap4 && menuItem.divider"
          [class.active]="menuItem.isActive && isMenuItemEnabled(menuItem)"
          [attr.role]="menuItem.divider ? 'separator' : undefined"
        >
          <a
            *ngIf="!menuItem.divider && !menuItem.passive"
            href
            [class.dropdown-item]="useBootstrap4"
            [class.active]="menuItem.isActive && isMenuItemEnabled(menuItem)"
            [class.disabled]="useBootstrap4 && !isMenuItemEnabled(menuItem)"
            [class.hasSubMenu]="!!menuItem.subMenu"
            (click)="onMenuItemSelect(menuItem, $event)"
            (mouseenter)="onOpenSubMenu(menuItem, $event)"
          >
            <ng-template
              [ngTemplateOutlet]="menuItem.template"
              [ngTemplateOutletContext]="{ $implicit: item }"
            ></ng-template>
          </a>

          <span
            (click)="stopEvent($event)"
            (contextmenu)="stopEvent($event)"
            class="passive"
            *ngIf="!menuItem.divider && menuItem.passive"
            [class.dropdown-item]="useBootstrap4"
            [class.disabled]="useBootstrap4 && !isMenuItemEnabled(menuItem)"
          >
            <ng-template
              [ngTemplateOutlet]="menuItem.template"
              [ngTemplateOutletContext]="{ $implicit: item }"
            ></ng-template>
          </span>
        </li>
      </ul>
    </div>
  `,
        styles: ["\n      .passive {\n        display: block;\n        padding: 3px 20px;\n        clear: both;\n        font-weight: normal;\n        line-height: @line-height-base;\n        white-space: nowrap;\n      }\n      .hasSubMenu:before {\n        content: '▶';\n        float: right;\n      }\n    "]
      }] }
    ];
    ContextMenuContentComponent2.ctorParameters = function() {
      return [
        { type: ChangeDetectorRef },
        { type: ElementRef },
        { type: void 0, decorators: [{ type: Optional }, { type: Inject, args: [CONTEXT_MENU_OPTIONS] }] }
      ];
    };
    ContextMenuContentComponent2.propDecorators = {
      menuItems: [{ type: Input }],
      item: [{ type: Input }],
      event: [{ type: Input }],
      parentContextMenu: [{ type: Input }],
      menuClass: [{ type: Input }],
      overlay: [{ type: Input }],
      isLeaf: [{ type: Input }],
      execute: [{ type: Output }],
      openSubMenu: [{ type: Output }],
      closeLeafMenu: [{ type: Output }],
      closeAllMenus: [{ type: Output }],
      menuElement: [{ type: ViewChild, args: ["menu", { static: true }] }],
      menuItemElements: [{ type: ViewChildren, args: ["li"] }],
      onKeyEvent: [{ type: HostListener, args: ["window:keydown.ArrowDown", ["$event"]] }, { type: HostListener, args: ["window:keydown.ArrowUp", ["$event"]] }],
      keyboardOpenSubMenu: [{ type: HostListener, args: ["window:keydown.ArrowRight", ["$event"]] }],
      keyboardMenuItemSelect: [{ type: HostListener, args: ["window:keydown.Enter", ["$event"]] }, { type: HostListener, args: ["window:keydown.Space", ["$event"]] }],
      onCloseLeafMenu: [{ type: HostListener, args: ["window:keydown.Escape", ["$event"]] }, { type: HostListener, args: ["window:keydown.ArrowLeft", ["$event"]] }],
      closeMenu: [{ type: HostListener, args: ["document:click", ["$event"]] }, { type: HostListener, args: ["document:contextmenu", ["$event"]] }]
    };
    return ContextMenuContentComponent2;
  })()
);
var ContextMenuService = (
  /** @class */
  (function() {
    function ContextMenuService2(overlay, scrollStrategy) {
      this.overlay = overlay;
      this.scrollStrategy = scrollStrategy;
      this.isDestroyingLeafMenu = false;
      this.show = new Subject();
      this.triggerClose = new Subject();
      this.close = new Subject();
      this.overlays = [];
      this.fakeElement = {
        getBoundingClientRect: (
          /**
          * @return {?}
          */
          (function() {
            return {
              bottom: 0,
              height: 0,
              left: 0,
              right: 0,
              top: 0,
              width: 0
            };
          })
        )
      };
    }
    ContextMenuService2.prototype.openContextMenu = /**
    * @param {?} context
    * @return {?}
    */
    function(context) {
      var anchorElement = context.anchorElement, event = context.event, parentContextMenu = context.parentContextMenu;
      if (!parentContextMenu) {
        var mouseEvent_1 = (
          /** @type {?} */
          event
        );
        this.fakeElement.getBoundingClientRect = /**
        * @return {?}
        */
        (function() {
          return {
            bottom: mouseEvent_1.clientY,
            height: 0,
            left: mouseEvent_1.clientX,
            right: mouseEvent_1.clientX,
            top: mouseEvent_1.clientY,
            width: 0
          };
        });
        this.closeAllContextMenus({ eventType: "cancel", event });
        var positionStrategy = this.overlay.position().connectedTo(new ElementRef(anchorElement || this.fakeElement), { originX: "start", originY: "bottom" }, { overlayX: "start", overlayY: "top" }).withFallbackPosition({ originX: "start", originY: "top" }, { overlayX: "start", overlayY: "bottom" }).withFallbackPosition({ originX: "end", originY: "top" }, { overlayX: "start", overlayY: "top" }).withFallbackPosition({ originX: "start", originY: "top" }, { overlayX: "end", overlayY: "top" }).withFallbackPosition({ originX: "end", originY: "center" }, { overlayX: "start", overlayY: "center" }).withFallbackPosition({ originX: "start", originY: "center" }, { overlayX: "end", overlayY: "center" });
        this.overlays = [this.overlay.create({
          positionStrategy,
          panelClass: "ngx-contextmenu",
          scrollStrategy: this.scrollStrategy.close()
        })];
        this.attachContextMenu(this.overlays[0], context);
      } else {
        var positionStrategy = this.overlay.position().connectedTo(new ElementRef(event ? event.target : anchorElement), { originX: "end", originY: "top" }, { overlayX: "start", overlayY: "top" }).withFallbackPosition({ originX: "start", originY: "top" }, { overlayX: "end", overlayY: "top" }).withFallbackPosition({ originX: "end", originY: "bottom" }, { overlayX: "start", overlayY: "bottom" }).withFallbackPosition({ originX: "start", originY: "bottom" }, { overlayX: "end", overlayY: "bottom" });
        var newOverlay = this.overlay.create({
          positionStrategy,
          panelClass: "ngx-contextmenu",
          scrollStrategy: this.scrollStrategy.close()
        });
        this.destroySubMenus(parentContextMenu);
        this.overlays = this.overlays.concat(newOverlay);
        this.attachContextMenu(newOverlay, context);
      }
    };
    ContextMenuService2.prototype.attachContextMenu = /**
    * @param {?} overlay
    * @param {?} context
    * @return {?}
    */
    function(overlay, context) {
      var _this = this;
      var event = context.event, item = context.item, menuItems = context.menuItems, menuClass = context.menuClass;
      var contextMenuContent = overlay.attach(new ComponentPortal$1(ContextMenuContentComponent));
      contextMenuContent.instance.event = event;
      contextMenuContent.instance.item = item;
      contextMenuContent.instance.menuItems = menuItems;
      contextMenuContent.instance.overlay = overlay;
      contextMenuContent.instance.isLeaf = true;
      contextMenuContent.instance.menuClass = menuClass;
      /** @type {?} */
      overlay.contextMenu = contextMenuContent.instance;
      var subscriptions = new Subscription();
      subscriptions.add(contextMenuContent.instance.execute.asObservable().subscribe(
        /**
        * @param {?} executeEvent
        * @return {?}
        */
        (function(executeEvent) {
          return _this.closeAllContextMenus(__assign({ eventType: "execute" }, executeEvent));
        })
      ));
      subscriptions.add(contextMenuContent.instance.closeAllMenus.asObservable().subscribe(
        /**
        * @param {?} closeAllEvent
        * @return {?}
        */
        (function(closeAllEvent) {
          return _this.closeAllContextMenus(__assign({ eventType: "cancel" }, closeAllEvent));
        })
      ));
      subscriptions.add(contextMenuContent.instance.closeLeafMenu.asObservable().subscribe(
        /**
        * @param {?} closeLeafMenuEvent
        * @return {?}
        */
        (function(closeLeafMenuEvent) {
          return _this.destroyLeafMenu(closeLeafMenuEvent);
        })
      ));
      subscriptions.add(contextMenuContent.instance.openSubMenu.asObservable().subscribe(
        /**
        * @param {?} subMenuEvent
        * @return {?}
        */
        (function(subMenuEvent) {
          _this.destroySubMenus(contextMenuContent.instance);
          if (!subMenuEvent.contextMenu) {
            contextMenuContent.instance.isLeaf = true;
            return;
          }
          contextMenuContent.instance.isLeaf = false;
          _this.show.next(subMenuEvent);
        })
      ));
      contextMenuContent.onDestroy(
        /**
        * @return {?}
        */
        (function() {
          menuItems.forEach(
            /**
            * @param {?} menuItem
            * @return {?}
            */
            (function(menuItem) {
              return menuItem.isActive = false;
            })
          );
          subscriptions.unsubscribe();
        })
      );
      contextMenuContent.changeDetectorRef.detectChanges();
    };
    ContextMenuService2.prototype.closeAllContextMenus = /**
    * @param {?} closeEvent
    * @return {?}
    */
    function(closeEvent) {
      if (this.overlays) {
        this.close.next(closeEvent);
        this.overlays.forEach(
          /**
          * @param {?} overlay
          * @param {?} index
          * @return {?}
          */
          (function(overlay, index) {
            overlay.detach();
            overlay.dispose();
          })
        );
      }
      this.overlays = [];
    };
    ContextMenuService2.prototype.getLastAttachedOverlay = /**
    * @return {?}
    */
    function() {
      var overlay = this.overlays[this.overlays.length - 1];
      while (this.overlays.length > 1 && overlay && !overlay.hasAttached()) {
        overlay.detach();
        overlay.dispose();
        this.overlays = this.overlays.slice(0, -1);
        overlay = this.overlays[this.overlays.length - 1];
      }
      return overlay;
    };
    ContextMenuService2.prototype.destroyLeafMenu = /**
    * @param {?=} __0
    * @return {?}
    */
    function(_a) {
      var _this = this;
      var _b = _a === void 0 ? {} : _a, exceptRootMenu = _b.exceptRootMenu, event = _b.event;
      if (this.isDestroyingLeafMenu) {
        return;
      }
      this.isDestroyingLeafMenu = true;
      setTimeout(
        /**
        * @return {?}
        */
        (function() {
          var overlay = _this.getLastAttachedOverlay();
          if (_this.overlays.length > 1 && overlay) {
            overlay.detach();
            overlay.dispose();
          }
          if (!exceptRootMenu && _this.overlays.length > 0 && overlay) {
            _this.close.next({ eventType: "cancel", event });
            overlay.detach();
            overlay.dispose();
          }
          var newLeaf = _this.getLastAttachedOverlay();
          if (newLeaf) {
            newLeaf.contextMenu.isLeaf = true;
          }
          _this.isDestroyingLeafMenu = false;
        })
      );
    };
    ContextMenuService2.prototype.destroySubMenus = /**
    * @param {?} contextMenu
    * @return {?}
    */
    function(contextMenu) {
      var overlay = contextMenu.overlay;
      var index = this.overlays.indexOf(overlay);
      this.overlays.slice(index + 1).forEach(
        /**
        * @param {?} subMenuOverlay
        * @return {?}
        */
        (function(subMenuOverlay) {
          subMenuOverlay.detach();
          subMenuOverlay.dispose();
        })
      );
    };
    ContextMenuService2.prototype.isLeafMenu = /**
    * @param {?} contextMenuContent
    * @return {?}
    */
    function(contextMenuContent) {
      var overlay = this.getLastAttachedOverlay();
      return contextMenuContent.overlay === overlay;
    };
    ContextMenuService2.decorators = [
      { type: Injectable }
    ];
    ContextMenuService2.ctorParameters = function() {
      return [
        { type: Overlay$1 },
        { type: ScrollStrategyOptions }
      ];
    };
    return ContextMenuService2;
  })()
);
var ContextMenuComponent = (
  /** @class */
  (function() {
    function ContextMenuComponent2(_contextMenuService, changeDetector, elementRef, options) {
      var _this = this;
      this._contextMenuService = _contextMenuService;
      this.changeDetector = changeDetector;
      this.elementRef = elementRef;
      this.options = options;
      this.menuClass = "";
      this.autoFocus = false;
      this.useBootstrap4 = false;
      this.disabled = false;
      this.close = new EventEmitter();
      this.open = new EventEmitter();
      this.visibleMenuItems = [];
      this.links = [];
      this.subscription = new Subscription();
      if (options) {
        this.autoFocus = options.autoFocus;
        this.useBootstrap4 = options.useBootstrap4;
      }
      this.subscription.add(_contextMenuService.show.subscribe(
        /**
        * @param {?} menuEvent
        * @return {?}
        */
        (function(menuEvent) {
          _this.onMenuEvent(menuEvent);
        })
      ));
    }
    ContextMenuComponent2.prototype.ngOnDestroy = /**
    * @return {?}
    */
    function() {
      this.subscription.unsubscribe();
    };
    ContextMenuComponent2.prototype.onMenuEvent = /**
    * @param {?} menuEvent
    * @return {?}
    */
    function(menuEvent) {
      var _this = this;
      if (this.disabled) {
        return;
      }
      var contextMenu = menuEvent.contextMenu, event = menuEvent.event, item = menuEvent.item;
      if (contextMenu && contextMenu !== this) {
        return;
      }
      this.event = event;
      this.item = item;
      this.setVisibleMenuItems();
      this._contextMenuService.openContextMenu(__assign({}, menuEvent, { menuItems: this.visibleMenuItems, menuClass: this.menuClass }));
      this._contextMenuService.close.asObservable().pipe(first()).subscribe(
        /**
        * @param {?} closeEvent
        * @return {?}
        */
        (function(closeEvent) {
          return _this.close.emit(closeEvent);
        })
      );
      this.open.next(menuEvent);
    };
    ContextMenuComponent2.prototype.isMenuItemVisible = /**
    * @param {?} menuItem
    * @return {?}
    */
    function(menuItem) {
      return this.evaluateIfFunction(menuItem.visible);
    };
    ContextMenuComponent2.prototype.setVisibleMenuItems = /**
    * @return {?}
    */
    function() {
      var _this = this;
      this.visibleMenuItems = this.menuItems.filter(
        /**
        * @param {?} menuItem
        * @return {?}
        */
        (function(menuItem) {
          return _this.isMenuItemVisible(menuItem);
        })
      );
    };
    ContextMenuComponent2.prototype.evaluateIfFunction = /**
    * @param {?} value
    * @return {?}
    */
    function(value) {
      if (value instanceof Function) {
        return value(this.item);
      }
      return value;
    };
    ContextMenuComponent2.decorators = [
      { type: Component, args: [{
        encapsulation: ViewEncapsulation$1.None,
        selector: "context-menu",
        template: " ",
        styles: ["\n    .cdk-overlay-container {\n      position: fixed;\n      z-index: 1000;\n      pointer-events: none;\n      top: 0;\n      left: 0;\n      width: 100%;\n      height: 100%;\n    }\n    .ngx-contextmenu.cdk-overlay-pane {\n      position: absolute;\n      pointer-events: auto;\n      box-sizing: border-box;\n    }\n  "]
      }] }
    ];
    ContextMenuComponent2.ctorParameters = function() {
      return [
        { type: ContextMenuService },
        { type: ChangeDetectorRef },
        { type: ElementRef },
        { type: void 0, decorators: [{ type: Optional }, { type: Inject, args: [CONTEXT_MENU_OPTIONS] }] }
      ];
    };
    ContextMenuComponent2.propDecorators = {
      menuClass: [{ type: Input }],
      autoFocus: [{ type: Input }],
      useBootstrap4: [{ type: Input }],
      disabled: [{ type: Input }],
      close: [{ type: Output }],
      open: [{ type: Output }],
      menuItems: [{ type: ContentChildren, args: [ContextMenuItemDirective] }],
      menuElement: [{ type: ViewChild, args: ["menu", { static: false }] }]
    };
    return ContextMenuComponent2;
  })()
);
var ContextMenuAttachDirective = (
  /** @class */
  (function() {
    function ContextMenuAttachDirective2(contextMenuService) {
      this.contextMenuService = contextMenuService;
    }
    ContextMenuAttachDirective2.prototype.onContextMenu = /**
    * @param {?} event
    * @return {?}
    */
    function(event) {
      if (!this.contextMenu.disabled) {
        this.contextMenuService.show.next({
          contextMenu: this.contextMenu,
          event,
          item: this.contextMenuSubject
        });
        event.preventDefault();
        event.stopPropagation();
      }
    };
    ContextMenuAttachDirective2.decorators = [
      { type: Directive, args: [{
        selector: "[contextMenu]"
      }] }
    ];
    ContextMenuAttachDirective2.ctorParameters = function() {
      return [
        { type: ContextMenuService }
      ];
    };
    ContextMenuAttachDirective2.propDecorators = {
      contextMenuSubject: [{ type: Input }],
      contextMenu: [{ type: Input }],
      onContextMenu: [{ type: HostListener, args: ["contextmenu", ["$event"]] }]
    };
    return ContextMenuAttachDirective2;
  })()
);
var ContextMenuModule = (
  /** @class */
  (function() {
    function ContextMenuModule2() {
    }
    ContextMenuModule2.forRoot = /**
    * @param {?=} options
    * @return {?}
    */
    function(options) {
      return {
        ngModule: ContextMenuModule2,
        providers: [
          ContextMenuService,
          {
            provide: CONTEXT_MENU_OPTIONS,
            useValue: options
          },
          { provide: OverlayContainer$1, useClass: FullscreenOverlayContainer }
        ]
      };
    };
    ContextMenuModule2.decorators = [
      { type: NgModule, args: [{
        declarations: [
          ContextMenuAttachDirective,
          ContextMenuComponent,
          ContextMenuContentComponent,
          ContextMenuItemDirective
        ],
        entryComponents: [
          ContextMenuContentComponent
        ],
        exports: [
          ContextMenuAttachDirective,
          ContextMenuComponent,
          ContextMenuItemDirective
        ],
        imports: [
          CommonModule,
          OverlayModule
        ]
      }] }
    ];
    return ContextMenuModule2;
  })()
);
class ToastContainerDirective {
  constructor(el) {
    this.el = el;
  }
  getContainerElement() {
    return this.el.nativeElement;
  }
}
ToastContainerDirective.ɵfac = __ngDeclareFactory({ minVersion: "12.0.0", version: "13.3.2", ngImport: i0, type: ToastContainerDirective, deps: [{ token: ElementRef }], target: FactoryTarget.Directive });
ToastContainerDirective.ɵdir = __ngDeclareDirective({ minVersion: "12.0.0", version: "13.3.2", type: ToastContainerDirective, selector: "[toastContainer]", exportAs: ["toastContainer"], ngImport: i0 });
__ngDeclareClassMetadata({ type: ToastContainerDirective, decorators: [{
  type: Directive,
  args: [{
    selector: "[toastContainer]",
    exportAs: "toastContainer"
  }]
}], ctorParameters: function() {
  return [{ type: ElementRef }];
} });
class ToastContainerModule {
}
ToastContainerModule.ɵfac = __ngDeclareFactory({ minVersion: "12.0.0", version: "13.3.2", ngImport: i0, type: ToastContainerModule, deps: [], target: FactoryTarget.NgModule });
ToastContainerModule.ɵmod = __ngDeclareNgModule({ minVersion: "12.0.0", version: "13.3.2", ngImport: i0, type: ToastContainerModule, declarations: [ToastContainerDirective], exports: [ToastContainerDirective] });
ToastContainerModule.ɵinj = __ngDeclareInjector({ minVersion: "12.0.0", version: "13.3.2", ngImport: i0, type: ToastContainerModule });
__ngDeclareClassMetadata({ type: ToastContainerModule, decorators: [{
  type: NgModule,
  args: [{
    declarations: [ToastContainerDirective],
    exports: [ToastContainerDirective]
  }]
}] });
class ComponentPortal {
  constructor(component, injector) {
    this.component = component;
    this.injector = injector;
  }
  /** Attach this portal to a host. */
  attach(host, newestOnTop) {
    this._attachedHost = host;
    return host.attach(this, newestOnTop);
  }
  /** Detach this portal from its host */
  detach() {
    const host = this._attachedHost;
    if (host) {
      this._attachedHost = void 0;
      return host.detach();
    }
  }
  /** Whether this portal is attached to a host. */
  get isAttached() {
    return this._attachedHost != null;
  }
  /**
   * Sets the PortalHost reference without performing `attach()`. This is used directly by
   * the PortalHost when it is performing an `attach()` or `detach()`.
   */
  setAttachedHost(host) {
    this._attachedHost = host;
  }
}
class BasePortalHost {
  attach(portal, newestOnTop) {
    this._attachedPortal = portal;
    return this.attachComponentPortal(portal, newestOnTop);
  }
  detach() {
    if (this._attachedPortal) {
      this._attachedPortal.setAttachedHost();
    }
    this._attachedPortal = void 0;
    if (this._disposeFn) {
      this._disposeFn();
      this._disposeFn = void 0;
    }
  }
  setDisposeFn(fn2) {
    this._disposeFn = fn2;
  }
}
class ToastPackage {
  constructor(toastId, config, message, title, toastType, toastRef) {
    this.toastId = toastId;
    this.config = config;
    this.message = message;
    this.title = title;
    this.toastType = toastType;
    this.toastRef = toastRef;
    this._onTap = new Subject();
    this._onAction = new Subject();
    this.toastRef.afterClosed().subscribe(() => {
      this._onAction.complete();
      this._onTap.complete();
    });
  }
  /** Fired on click */
  triggerTap() {
    this._onTap.next();
    if (this.config.tapToDismiss) {
      this._onTap.complete();
    }
  }
  onTap() {
    return this._onTap.asObservable();
  }
  /** available for use in custom toast */
  triggerAction(action) {
    this._onAction.next(action);
  }
  onAction() {
    return this._onAction.asObservable();
  }
}
const DefaultNoComponentGlobalConfig = {
  maxOpened: 0,
  autoDismiss: false,
  newestOnTop: true,
  preventDuplicates: false,
  countDuplicates: false,
  resetTimeoutOnDuplicate: false,
  includeTitleDuplicates: false,
  iconClasses: {
    error: "toast-error",
    info: "toast-info",
    success: "toast-success",
    warning: "toast-warning"
  },
  // Individual
  closeButton: false,
  disableTimeOut: false,
  timeOut: 5e3,
  extendedTimeOut: 1e3,
  enableHtml: false,
  progressBar: false,
  toastClass: "ngx-toastr",
  positionClass: "toast-top-right",
  titleClass: "toast-title",
  messageClass: "toast-message",
  easing: "ease-in",
  easeTime: 300,
  tapToDismiss: true,
  onActivateTick: false,
  progressAnimation: "decreasing",
  payload: null
};
const TOAST_CONFIG = new InjectionToken("ToastConfig");
class ToastRef {
  constructor(_overlayRef) {
    this._overlayRef = _overlayRef;
    this.duplicatesCount = 0;
    this._afterClosed = new Subject();
    this._activate = new Subject();
    this._manualClose = new Subject();
    this._resetTimeout = new Subject();
    this._countDuplicate = new Subject();
  }
  manualClose() {
    this._manualClose.next();
    this._manualClose.complete();
  }
  manualClosed() {
    return this._manualClose.asObservable();
  }
  timeoutReset() {
    return this._resetTimeout.asObservable();
  }
  countDuplicate() {
    return this._countDuplicate.asObservable();
  }
  /**
   * Close the toast.
   */
  close() {
    this._overlayRef.detach();
    this._afterClosed.next();
    this._manualClose.next();
    this._afterClosed.complete();
    this._manualClose.complete();
    this._activate.complete();
    this._resetTimeout.complete();
    this._countDuplicate.complete();
  }
  /** Gets an observable that is notified when the toast is finished closing. */
  afterClosed() {
    return this._afterClosed.asObservable();
  }
  isInactive() {
    return this._activate.isStopped;
  }
  activate() {
    this._activate.next();
    this._activate.complete();
  }
  /** Gets an observable that is notified when the toast has started opening. */
  afterActivate() {
    return this._activate.asObservable();
  }
  /** Reset the toast timouts and count duplicates */
  onDuplicate(resetTimeout, countDuplicate) {
    if (resetTimeout) {
      this._resetTimeout.next();
    }
    if (countDuplicate) {
      this._countDuplicate.next(++this.duplicatesCount);
    }
  }
}
class ToastInjector {
  constructor(_toastPackage, _parentInjector) {
    this._toastPackage = _toastPackage;
    this._parentInjector = _parentInjector;
  }
  get(token, notFoundValue, flags) {
    if (token === ToastPackage) {
      return this._toastPackage;
    }
    return this._parentInjector.get(token, notFoundValue, flags);
  }
}
class DomPortalHost extends BasePortalHost {
  constructor(_hostDomElement, _componentFactoryResolver, _appRef) {
    super();
    this._hostDomElement = _hostDomElement;
    this._componentFactoryResolver = _componentFactoryResolver;
    this._appRef = _appRef;
  }
  /**
   * Attach the given ComponentPortal to DOM element using the ComponentFactoryResolver.
   * @param portal Portal to be attached
   */
  attachComponentPortal(portal, newestOnTop) {
    const componentFactory = this._componentFactoryResolver.resolveComponentFactory(portal.component);
    let componentRef;
    componentRef = componentFactory.create(portal.injector);
    this._appRef.attachView(componentRef.hostView);
    this.setDisposeFn(() => {
      this._appRef.detachView(componentRef.hostView);
      componentRef.destroy();
    });
    if (newestOnTop) {
      this._hostDomElement.insertBefore(this._getComponentRootNode(componentRef), this._hostDomElement.firstChild);
    } else {
      this._hostDomElement.appendChild(this._getComponentRootNode(componentRef));
    }
    return componentRef;
  }
  /** Gets the root HTMLElement for an instantiated component. */
  _getComponentRootNode(componentRef) {
    return componentRef.hostView.rootNodes[0];
  }
}
class OverlayRef {
  constructor(_portalHost) {
    this._portalHost = _portalHost;
  }
  attach(portal, newestOnTop = true) {
    return this._portalHost.attach(portal, newestOnTop);
  }
  /**
   * Detaches an overlay from a portal.
   * @returns Resolves when the overlay has been detached.
   */
  detach() {
    return this._portalHost.detach();
  }
}
class OverlayContainer {
  constructor(_document) {
    this._document = _document;
  }
  ngOnDestroy() {
    if (this._containerElement && this._containerElement.parentNode) {
      this._containerElement.parentNode.removeChild(this._containerElement);
    }
  }
  /**
   * This method returns the overlay container element. It will lazily
   * create the element the first time  it is called to facilitate using
   * the container in non-browser environments.
   * @returns the container element
   */
  getContainerElement() {
    if (!this._containerElement) {
      this._createContainer();
    }
    return this._containerElement;
  }
  /**
   * Create the overlay container element, which is simply a div
   * with the 'cdk-overlay-container' class on the document body
   * and 'aria-live="polite"'
   */
  _createContainer() {
    const container = this._document.createElement("div");
    container.classList.add("overlay-container");
    container.setAttribute("aria-live", "polite");
    this._document.body.appendChild(container);
    this._containerElement = container;
  }
}
OverlayContainer.ɵfac = __ngDeclareFactory({ minVersion: "12.0.0", version: "13.3.2", ngImport: i0, type: OverlayContainer, deps: [{ token: DOCUMENT }], target: FactoryTarget.Injectable });
OverlayContainer.ɵprov = __ngDeclareInjectable({ minVersion: "12.0.0", version: "13.3.2", ngImport: i0, type: OverlayContainer, providedIn: "root" });
__ngDeclareClassMetadata({ type: OverlayContainer, decorators: [{
  type: Injectable,
  args: [{ providedIn: "root" }]
}], ctorParameters: function() {
  return [{ type: void 0, decorators: [{
    type: Inject,
    args: [DOCUMENT]
  }] }];
} });
class Overlay {
  constructor(_overlayContainer, _componentFactoryResolver, _appRef, _document) {
    this._overlayContainer = _overlayContainer;
    this._componentFactoryResolver = _componentFactoryResolver;
    this._appRef = _appRef;
    this._document = _document;
    this._paneElements = /* @__PURE__ */ new Map();
  }
  /**
   * Creates an overlay.
   * @returns A reference to the created overlay.
   */
  create(positionClass, overlayContainer) {
    return this._createOverlayRef(this.getPaneElement(positionClass, overlayContainer));
  }
  getPaneElement(positionClass = "", overlayContainer) {
    if (!this._paneElements.get(overlayContainer)) {
      this._paneElements.set(overlayContainer, {});
    }
    if (!this._paneElements.get(overlayContainer)[positionClass]) {
      this._paneElements.get(overlayContainer)[positionClass] = this._createPaneElement(positionClass, overlayContainer);
    }
    return this._paneElements.get(overlayContainer)[positionClass];
  }
  /**
   * Creates the DOM element for an overlay and appends it to the overlay container.
   * @returns Newly-created pane element
   */
  _createPaneElement(positionClass, overlayContainer) {
    const pane = this._document.createElement("div");
    pane.id = "toast-container";
    pane.classList.add(positionClass);
    pane.classList.add("toast-container");
    if (!overlayContainer) {
      this._overlayContainer.getContainerElement().appendChild(pane);
    } else {
      overlayContainer.getContainerElement().appendChild(pane);
    }
    return pane;
  }
  /**
   * Create a DomPortalHost into which the overlay content can be loaded.
   * @param pane The DOM element to turn into a portal host.
   * @returns A portal host for the given DOM element.
   */
  _createPortalHost(pane) {
    return new DomPortalHost(pane, this._componentFactoryResolver, this._appRef);
  }
  /**
   * Creates an OverlayRef for an overlay in the given DOM element.
   * @param pane DOM element for the overlay
   */
  _createOverlayRef(pane) {
    return new OverlayRef(this._createPortalHost(pane));
  }
}
Overlay.ɵfac = __ngDeclareFactory({ minVersion: "12.0.0", version: "13.3.2", ngImport: i0, type: Overlay, deps: [{ token: OverlayContainer }, { token: ComponentFactoryResolver$1 }, { token: ApplicationRef }, { token: DOCUMENT }], target: FactoryTarget.Injectable });
Overlay.ɵprov = __ngDeclareInjectable({ minVersion: "12.0.0", version: "13.3.2", ngImport: i0, type: Overlay, providedIn: "root" });
__ngDeclareClassMetadata({ type: Overlay, decorators: [{
  type: Injectable,
  args: [{ providedIn: "root" }]
}], ctorParameters: function() {
  return [{ type: OverlayContainer }, { type: ComponentFactoryResolver$1 }, { type: ApplicationRef }, { type: void 0, decorators: [{
    type: Inject,
    args: [DOCUMENT]
  }] }];
} });
class ToastrService {
  constructor(token, overlay, _injector, sanitizer, ngZone) {
    this.overlay = overlay;
    this._injector = _injector;
    this.sanitizer = sanitizer;
    this.ngZone = ngZone;
    this.currentlyActive = 0;
    this.toasts = [];
    this.index = 0;
    this.toastrConfig = {
      ...token.default,
      ...token.config
    };
    if (token.config.iconClasses) {
      this.toastrConfig.iconClasses = {
        ...token.default.iconClasses,
        ...token.config.iconClasses
      };
    }
  }
  /** show toast */
  show(message, title, override = {}, type = "") {
    return this._preBuildNotification(type, message, title, this.applyConfig(override));
  }
  /** show successful toast */
  success(message, title, override = {}) {
    const type = this.toastrConfig.iconClasses.success || "";
    return this._preBuildNotification(type, message, title, this.applyConfig(override));
  }
  /** show error toast */
  error(message, title, override = {}) {
    const type = this.toastrConfig.iconClasses.error || "";
    return this._preBuildNotification(type, message, title, this.applyConfig(override));
  }
  /** show info toast */
  info(message, title, override = {}) {
    const type = this.toastrConfig.iconClasses.info || "";
    return this._preBuildNotification(type, message, title, this.applyConfig(override));
  }
  /** show warning toast */
  warning(message, title, override = {}) {
    const type = this.toastrConfig.iconClasses.warning || "";
    return this._preBuildNotification(type, message, title, this.applyConfig(override));
  }
  /**
   * Remove all or a single toast by id
   */
  clear(toastId) {
    for (const toast of this.toasts) {
      if (toastId !== void 0) {
        if (toast.toastId === toastId) {
          toast.toastRef.manualClose();
          return;
        }
      } else {
        toast.toastRef.manualClose();
      }
    }
  }
  /**
   * Remove and destroy a single toast by id
   */
  remove(toastId) {
    const found = this._findToast(toastId);
    if (!found) {
      return false;
    }
    found.activeToast.toastRef.close();
    this.toasts.splice(found.index, 1);
    this.currentlyActive = this.currentlyActive - 1;
    if (!this.toastrConfig.maxOpened || !this.toasts.length) {
      return false;
    }
    if (this.currentlyActive < this.toastrConfig.maxOpened && this.toasts[this.currentlyActive]) {
      const p = this.toasts[this.currentlyActive].toastRef;
      if (!p.isInactive()) {
        this.currentlyActive = this.currentlyActive + 1;
        p.activate();
      }
    }
    return true;
  }
  /**
   * Determines if toast message is already shown
   */
  findDuplicate(title = "", message = "", resetOnDuplicate, countDuplicates) {
    const { includeTitleDuplicates } = this.toastrConfig;
    for (const toast of this.toasts) {
      const hasDuplicateTitle = includeTitleDuplicates && toast.title === title;
      if ((!includeTitleDuplicates || hasDuplicateTitle) && toast.message === message) {
        toast.toastRef.onDuplicate(resetOnDuplicate, countDuplicates);
        return toast;
      }
    }
    return null;
  }
  /** create a clone of global config and apply individual settings */
  applyConfig(override = {}) {
    return { ...this.toastrConfig, ...override };
  }
  /**
   * Find toast object by id
   */
  _findToast(toastId) {
    for (let i = 0; i < this.toasts.length; i++) {
      if (this.toasts[i].toastId === toastId) {
        return { index: i, activeToast: this.toasts[i] };
      }
    }
    return null;
  }
  /**
   * Determines the need to run inside angular's zone then builds the toast
   */
  _preBuildNotification(toastType, message, title, config) {
    if (config.onActivateTick) {
      return this.ngZone.run(() => this._buildNotification(toastType, message, title, config));
    }
    return this._buildNotification(toastType, message, title, config);
  }
  /**
   * Creates and attaches toast data to component
   * returns the active toast, or in case preventDuplicates is enabled the original/non-duplicate active toast.
   */
  _buildNotification(toastType, message, title, config) {
    if (!config.toastComponent) {
      throw new Error("toastComponent required");
    }
    const duplicate = this.findDuplicate(title, message, this.toastrConfig.resetTimeoutOnDuplicate && config.timeOut > 0, this.toastrConfig.countDuplicates);
    if ((this.toastrConfig.includeTitleDuplicates && title || message) && this.toastrConfig.preventDuplicates && duplicate !== null) {
      return duplicate;
    }
    this.previousToastMessage = message;
    let keepInactive = false;
    if (this.toastrConfig.maxOpened && this.currentlyActive >= this.toastrConfig.maxOpened) {
      keepInactive = true;
      if (this.toastrConfig.autoDismiss) {
        this.clear(this.toasts[0].toastId);
      }
    }
    const overlayRef = this.overlay.create(config.positionClass, this.overlayContainer);
    this.index = this.index + 1;
    let sanitizedMessage = message;
    if (message && config.enableHtml) {
      sanitizedMessage = this.sanitizer.sanitize(SecurityContext.HTML, message);
    }
    const toastRef = new ToastRef(overlayRef);
    const toastPackage = new ToastPackage(this.index, config, sanitizedMessage, title, toastType, toastRef);
    const toastInjector = new ToastInjector(toastPackage, this._injector);
    const component = new ComponentPortal(config.toastComponent, toastInjector);
    const portal = overlayRef.attach(component, this.toastrConfig.newestOnTop);
    toastRef.componentInstance = portal.instance;
    const ins = {
      toastId: this.index,
      title: title || "",
      message: message || "",
      toastRef,
      onShown: toastRef.afterActivate(),
      onHidden: toastRef.afterClosed(),
      onTap: toastPackage.onTap(),
      onAction: toastPackage.onAction(),
      portal
    };
    if (!keepInactive) {
      this.currentlyActive = this.currentlyActive + 1;
      setTimeout(() => {
        ins.toastRef.activate();
      });
    }
    this.toasts.push(ins);
    return ins;
  }
}
ToastrService.ɵfac = __ngDeclareFactory({ minVersion: "12.0.0", version: "13.3.2", ngImport: i0, type: ToastrService, deps: [{ token: TOAST_CONFIG }, { token: Overlay }, { token: Injector }, { token: DomSanitizer }, { token: NgZone }], target: FactoryTarget.Injectable });
ToastrService.ɵprov = __ngDeclareInjectable({ minVersion: "12.0.0", version: "13.3.2", ngImport: i0, type: ToastrService, providedIn: "root" });
__ngDeclareClassMetadata({ type: ToastrService, decorators: [{
  type: Injectable,
  args: [{ providedIn: "root" }]
}], ctorParameters: function() {
  return [{ type: void 0, decorators: [{
    type: Inject,
    args: [TOAST_CONFIG]
  }] }, { type: Overlay }, { type: Injector }, { type: DomSanitizer }, { type: NgZone }];
} });
class Toast {
  constructor(toastrService, toastPackage, ngZone) {
    this.toastrService = toastrService;
    this.toastPackage = toastPackage;
    this.ngZone = ngZone;
    this.width = -1;
    this.toastClasses = "";
    this.state = {
      value: "inactive",
      params: {
        easeTime: this.toastPackage.config.easeTime,
        easing: "ease-in"
      }
    };
    this.message = toastPackage.message;
    this.title = toastPackage.title;
    this.options = toastPackage.config;
    this.originalTimeout = toastPackage.config.timeOut;
    this.toastClasses = `${toastPackage.toastType} ${toastPackage.config.toastClass}`;
    this.sub = toastPackage.toastRef.afterActivate().subscribe(() => {
      this.activateToast();
    });
    this.sub1 = toastPackage.toastRef.manualClosed().subscribe(() => {
      this.remove();
    });
    this.sub2 = toastPackage.toastRef.timeoutReset().subscribe(() => {
      this.resetTimeout();
    });
    this.sub3 = toastPackage.toastRef.countDuplicate().subscribe((count) => {
      this.duplicatesCount = count;
    });
  }
  /** hides component when waiting to be displayed */
  get displayStyle() {
    if (this.state.value === "inactive") {
      return "none";
    }
    return;
  }
  ngOnDestroy() {
    this.sub.unsubscribe();
    this.sub1.unsubscribe();
    this.sub2.unsubscribe();
    this.sub3.unsubscribe();
    clearInterval(this.intervalId);
    clearTimeout(this.timeout);
  }
  /**
   * activates toast and sets timeout
   */
  activateToast() {
    this.state = { ...this.state, value: "active" };
    if (!(this.options.disableTimeOut === true || this.options.disableTimeOut === "timeOut") && this.options.timeOut) {
      this.outsideTimeout(() => this.remove(), this.options.timeOut);
      this.hideTime = (/* @__PURE__ */ new Date()).getTime() + this.options.timeOut;
      if (this.options.progressBar) {
        this.outsideInterval(() => this.updateProgress(), 10);
      }
    }
  }
  /**
   * updates progress bar width
   */
  updateProgress() {
    if (this.width === 0 || this.width === 100 || !this.options.timeOut) {
      return;
    }
    const now = (/* @__PURE__ */ new Date()).getTime();
    const remaining = this.hideTime - now;
    this.width = remaining / this.options.timeOut * 100;
    if (this.options.progressAnimation === "increasing") {
      this.width = 100 - this.width;
    }
    if (this.width <= 0) {
      this.width = 0;
    }
    if (this.width >= 100) {
      this.width = 100;
    }
  }
  resetTimeout() {
    clearTimeout(this.timeout);
    clearInterval(this.intervalId);
    this.state = { ...this.state, value: "active" };
    this.outsideTimeout(() => this.remove(), this.originalTimeout);
    this.options.timeOut = this.originalTimeout;
    this.hideTime = (/* @__PURE__ */ new Date()).getTime() + (this.options.timeOut || 0);
    this.width = -1;
    if (this.options.progressBar) {
      this.outsideInterval(() => this.updateProgress(), 10);
    }
  }
  /**
   * tells toastrService to remove this toast after animation time
   */
  remove() {
    if (this.state.value === "removed") {
      return;
    }
    clearTimeout(this.timeout);
    this.state = { ...this.state, value: "removed" };
    this.outsideTimeout(() => this.toastrService.remove(this.toastPackage.toastId), +this.toastPackage.config.easeTime);
  }
  tapToast() {
    if (this.state.value === "removed") {
      return;
    }
    this.toastPackage.triggerTap();
    if (this.options.tapToDismiss) {
      this.remove();
    }
  }
  stickAround() {
    if (this.state.value === "removed") {
      return;
    }
    clearTimeout(this.timeout);
    this.options.timeOut = 0;
    this.hideTime = 0;
    clearInterval(this.intervalId);
    this.width = 0;
  }
  delayedHideToast() {
    if (this.options.disableTimeOut === true || this.options.disableTimeOut === "extendedTimeOut" || this.options.extendedTimeOut === 0 || this.state.value === "removed") {
      return;
    }
    this.outsideTimeout(() => this.remove(), this.options.extendedTimeOut);
    this.options.timeOut = this.options.extendedTimeOut;
    this.hideTime = (/* @__PURE__ */ new Date()).getTime() + (this.options.timeOut || 0);
    this.width = -1;
    if (this.options.progressBar) {
      this.outsideInterval(() => this.updateProgress(), 10);
    }
  }
  outsideTimeout(func, timeout) {
    if (this.ngZone) {
      this.ngZone.runOutsideAngular(() => this.timeout = setTimeout(() => this.runInsideAngular(func), timeout));
    } else {
      this.timeout = setTimeout(() => func(), timeout);
    }
  }
  outsideInterval(func, timeout) {
    if (this.ngZone) {
      this.ngZone.runOutsideAngular(() => this.intervalId = setInterval(() => this.runInsideAngular(func), timeout));
    } else {
      this.intervalId = setInterval(() => func(), timeout);
    }
  }
  runInsideAngular(func) {
    if (this.ngZone) {
      this.ngZone.run(() => func());
    } else {
      func();
    }
  }
}
Toast.ɵfac = __ngDeclareFactory({ minVersion: "12.0.0", version: "13.3.2", ngImport: i0, type: Toast, deps: [{ token: ToastrService }, { token: ToastPackage }, { token: NgZone }], target: FactoryTarget.Component });
Toast.ɵcmp = __ngDeclareComponent({ minVersion: "12.0.0", version: "13.3.2", type: Toast, selector: "[toast-component]", host: { listeners: { "click": "tapToast()", "mouseenter": "stickAround()", "mouseleave": "delayedHideToast()" }, properties: { "class": "this.toastClasses", "@flyInOut": "this.state", "style.display": "this.displayStyle" } }, ngImport: i0, template: `
  <button *ngIf="options.closeButton" (click)="remove()" type="button" class="toast-close-button" aria-label="Close">
    <span aria-hidden="true">&times;</span>
  </button>
  <div *ngIf="title" [class]="options.titleClass" [attr.aria-label]="title">
    {{ title }} <ng-container *ngIf="duplicatesCount">[{{ duplicatesCount + 1 }}]</ng-container>
  </div>
  <div *ngIf="message && options.enableHtml" role="alert"
    [class]="options.messageClass" [innerHTML]="message">
  </div>
  <div *ngIf="message && !options.enableHtml" role="alert"
    [class]="options.messageClass" [attr.aria-label]="message">
    {{ message }}
  </div>
  <div *ngIf="options.progressBar">
    <div class="toast-progress" [style.width]="width + '%'"></div>
  </div>
  `, isInline: true, directives: [{ type: NgIf, selector: "[ngIf]", inputs: ["ngIf", "ngIfThen", "ngIfElse"] }], animations: [
  trigger("flyInOut", [
    state("inactive", style({ opacity: 0 })),
    state("active", style({ opacity: 1 })),
    state("removed", style({ opacity: 0 })),
    transition("inactive => active", animate("{{ easeTime }}ms {{ easing }}")),
    transition("active => removed", animate("{{ easeTime }}ms {{ easing }}"))
  ])
] });
__ngDeclareClassMetadata({ type: Toast, decorators: [{
  type: Component,
  args: [{
    selector: "[toast-component]",
    template: `
  <button *ngIf="options.closeButton" (click)="remove()" type="button" class="toast-close-button" aria-label="Close">
    <span aria-hidden="true">&times;</span>
  </button>
  <div *ngIf="title" [class]="options.titleClass" [attr.aria-label]="title">
    {{ title }} <ng-container *ngIf="duplicatesCount">[{{ duplicatesCount + 1 }}]</ng-container>
  </div>
  <div *ngIf="message && options.enableHtml" role="alert"
    [class]="options.messageClass" [innerHTML]="message">
  </div>
  <div *ngIf="message && !options.enableHtml" role="alert"
    [class]="options.messageClass" [attr.aria-label]="message">
    {{ message }}
  </div>
  <div *ngIf="options.progressBar">
    <div class="toast-progress" [style.width]="width + '%'"></div>
  </div>
  `,
    animations: [
      trigger("flyInOut", [
        state("inactive", style({ opacity: 0 })),
        state("active", style({ opacity: 1 })),
        state("removed", style({ opacity: 0 })),
        transition("inactive => active", animate("{{ easeTime }}ms {{ easing }}")),
        transition("active => removed", animate("{{ easeTime }}ms {{ easing }}"))
      ])
    ],
    preserveWhitespaces: false
  }]
}], ctorParameters: function() {
  return [{ type: ToastrService }, { type: ToastPackage }, { type: NgZone }];
}, propDecorators: { toastClasses: [{
  type: HostBinding,
  args: ["class"]
}], state: [{
  type: HostBinding,
  args: ["@flyInOut"]
}], displayStyle: [{
  type: HostBinding,
  args: ["style.display"]
}], tapToast: [{
  type: HostListener,
  args: ["click"]
}], stickAround: [{
  type: HostListener,
  args: ["mouseenter"]
}], delayedHideToast: [{
  type: HostListener,
  args: ["mouseleave"]
}] } });
const DefaultGlobalConfig = {
  ...DefaultNoComponentGlobalConfig,
  toastComponent: Toast
};
class ToastrModule {
  static forRoot(config = {}) {
    return {
      ngModule: ToastrModule,
      providers: [
        {
          provide: TOAST_CONFIG,
          useValue: {
            default: DefaultGlobalConfig,
            config
          }
        }
      ]
    };
  }
}
ToastrModule.ɵfac = __ngDeclareFactory({ minVersion: "12.0.0", version: "13.3.2", ngImport: i0, type: ToastrModule, deps: [], target: FactoryTarget.NgModule });
ToastrModule.ɵmod = __ngDeclareNgModule({ minVersion: "12.0.0", version: "13.3.2", ngImport: i0, type: ToastrModule, declarations: [Toast], imports: [CommonModule], exports: [Toast] });
ToastrModule.ɵinj = __ngDeclareInjector({ minVersion: "12.0.0", version: "13.3.2", ngImport: i0, type: ToastrModule, imports: [[CommonModule]] });
__ngDeclareClassMetadata({ type: ToastrModule, decorators: [{
  type: NgModule,
  args: [{
    imports: [CommonModule],
    declarations: [Toast],
    exports: [Toast],
    entryComponents: [Toast]
  }]
}] });
class ToastrComponentlessModule {
  static forRoot(config = {}) {
    return {
      ngModule: ToastrModule,
      providers: [
        {
          provide: TOAST_CONFIG,
          useValue: {
            default: DefaultNoComponentGlobalConfig,
            config
          }
        }
      ]
    };
  }
}
ToastrComponentlessModule.ɵfac = __ngDeclareFactory({ minVersion: "12.0.0", version: "13.3.2", ngImport: i0, type: ToastrComponentlessModule, deps: [], target: FactoryTarget.NgModule });
ToastrComponentlessModule.ɵmod = __ngDeclareNgModule({ minVersion: "12.0.0", version: "13.3.2", ngImport: i0, type: ToastrComponentlessModule, imports: [CommonModule] });
ToastrComponentlessModule.ɵinj = __ngDeclareInjector({ minVersion: "12.0.0", version: "13.3.2", ngImport: i0, type: ToastrComponentlessModule, imports: [[CommonModule]] });
__ngDeclareClassMetadata({ type: ToastrComponentlessModule, decorators: [{
  type: NgModule,
  args: [{
    imports: [CommonModule]
  }]
}] });
class ToastNoAnimation {
  constructor(toastrService, toastPackage, appRef) {
    this.toastrService = toastrService;
    this.toastPackage = toastPackage;
    this.appRef = appRef;
    this.width = -1;
    this.toastClasses = "";
    this.state = "inactive";
    this.message = toastPackage.message;
    this.title = toastPackage.title;
    this.options = toastPackage.config;
    this.originalTimeout = toastPackage.config.timeOut;
    this.toastClasses = `${toastPackage.toastType} ${toastPackage.config.toastClass}`;
    this.sub = toastPackage.toastRef.afterActivate().subscribe(() => {
      this.activateToast();
    });
    this.sub1 = toastPackage.toastRef.manualClosed().subscribe(() => {
      this.remove();
    });
    this.sub2 = toastPackage.toastRef.timeoutReset().subscribe(() => {
      this.resetTimeout();
    });
    this.sub3 = toastPackage.toastRef.countDuplicate().subscribe((count) => {
      this.duplicatesCount = count;
    });
  }
  /** hides component when waiting to be displayed */
  get displayStyle() {
    if (this.state === "inactive") {
      return "none";
    }
  }
  ngOnDestroy() {
    this.sub.unsubscribe();
    this.sub1.unsubscribe();
    this.sub2.unsubscribe();
    this.sub3.unsubscribe();
    clearInterval(this.intervalId);
    clearTimeout(this.timeout);
  }
  /**
   * activates toast and sets timeout
   */
  activateToast() {
    this.state = "active";
    if (!(this.options.disableTimeOut === true || this.options.disableTimeOut === "timeOut") && this.options.timeOut) {
      this.timeout = setTimeout(() => {
        this.remove();
      }, this.options.timeOut);
      this.hideTime = (/* @__PURE__ */ new Date()).getTime() + this.options.timeOut;
      if (this.options.progressBar) {
        this.intervalId = setInterval(() => this.updateProgress(), 10);
      }
    }
    if (this.options.onActivateTick) {
      this.appRef.tick();
    }
  }
  /**
   * updates progress bar width
   */
  updateProgress() {
    if (this.width === 0 || this.width === 100 || !this.options.timeOut) {
      return;
    }
    const now = (/* @__PURE__ */ new Date()).getTime();
    const remaining = this.hideTime - now;
    this.width = remaining / this.options.timeOut * 100;
    if (this.options.progressAnimation === "increasing") {
      this.width = 100 - this.width;
    }
    if (this.width <= 0) {
      this.width = 0;
    }
    if (this.width >= 100) {
      this.width = 100;
    }
  }
  resetTimeout() {
    clearTimeout(this.timeout);
    clearInterval(this.intervalId);
    this.state = "active";
    this.options.timeOut = this.originalTimeout;
    this.timeout = setTimeout(() => this.remove(), this.originalTimeout);
    this.hideTime = (/* @__PURE__ */ new Date()).getTime() + (this.originalTimeout || 0);
    this.width = -1;
    if (this.options.progressBar) {
      this.intervalId = setInterval(() => this.updateProgress(), 10);
    }
  }
  /**
   * tells toastrService to remove this toast after animation time
   */
  remove() {
    if (this.state === "removed") {
      return;
    }
    clearTimeout(this.timeout);
    this.state = "removed";
    this.timeout = setTimeout(() => this.toastrService.remove(this.toastPackage.toastId));
  }
  tapToast() {
    if (this.state === "removed") {
      return;
    }
    this.toastPackage.triggerTap();
    if (this.options.tapToDismiss) {
      this.remove();
    }
  }
  stickAround() {
    if (this.state === "removed") {
      return;
    }
    clearTimeout(this.timeout);
    this.options.timeOut = 0;
    this.hideTime = 0;
    clearInterval(this.intervalId);
    this.width = 0;
  }
  delayedHideToast() {
    if (this.options.disableTimeOut === true || this.options.disableTimeOut === "extendedTimeOut" || this.options.extendedTimeOut === 0 || this.state === "removed") {
      return;
    }
    this.timeout = setTimeout(() => this.remove(), this.options.extendedTimeOut);
    this.options.timeOut = this.options.extendedTimeOut;
    this.hideTime = (/* @__PURE__ */ new Date()).getTime() + (this.options.timeOut || 0);
    this.width = -1;
    if (this.options.progressBar) {
      this.intervalId = setInterval(() => this.updateProgress(), 10);
    }
  }
}
ToastNoAnimation.ɵfac = __ngDeclareFactory({ minVersion: "12.0.0", version: "13.3.2", ngImport: i0, type: ToastNoAnimation, deps: [{ token: ToastrService }, { token: ToastPackage }, { token: ApplicationRef }], target: FactoryTarget.Component });
ToastNoAnimation.ɵcmp = __ngDeclareComponent({ minVersion: "12.0.0", version: "13.3.2", type: ToastNoAnimation, selector: "[toast-component]", host: { listeners: { "click": "tapToast()", "mouseenter": "stickAround()", "mouseleave": "delayedHideToast()" }, properties: { "class": "this.toastClasses", "style.display": "this.displayStyle" } }, ngImport: i0, template: `
  <button *ngIf="options.closeButton" (click)="remove()" type="button" class="toast-close-button" aria-label="Close">
    <span aria-hidden="true">&times;</span>
  </button>
  <div *ngIf="title" [class]="options.titleClass" [attr.aria-label]="title">
    {{ title }} <ng-container *ngIf="duplicatesCount">[{{ duplicatesCount + 1 }}]</ng-container>
  </div>
  <div *ngIf="message && options.enableHtml" role="alert"
    [class]="options.messageClass" [innerHTML]="message">
  </div>
  <div *ngIf="message && !options.enableHtml" role="alert"
    [class]="options.messageClass" [attr.aria-label]="message">
    {{ message }}
  </div>
  <div *ngIf="options.progressBar">
    <div class="toast-progress" [style.width]="width + '%'"></div>
  </div>
  `, isInline: true, directives: [{ type: NgIf, selector: "[ngIf]", inputs: ["ngIf", "ngIfThen", "ngIfElse"] }] });
__ngDeclareClassMetadata({ type: ToastNoAnimation, decorators: [{
  type: Component,
  args: [{
    selector: "[toast-component]",
    template: `
  <button *ngIf="options.closeButton" (click)="remove()" type="button" class="toast-close-button" aria-label="Close">
    <span aria-hidden="true">&times;</span>
  </button>
  <div *ngIf="title" [class]="options.titleClass" [attr.aria-label]="title">
    {{ title }} <ng-container *ngIf="duplicatesCount">[{{ duplicatesCount + 1 }}]</ng-container>
  </div>
  <div *ngIf="message && options.enableHtml" role="alert"
    [class]="options.messageClass" [innerHTML]="message">
  </div>
  <div *ngIf="message && !options.enableHtml" role="alert"
    [class]="options.messageClass" [attr.aria-label]="message">
    {{ message }}
  </div>
  <div *ngIf="options.progressBar">
    <div class="toast-progress" [style.width]="width + '%'"></div>
  </div>
  `
  }]
}], ctorParameters: function() {
  return [{ type: ToastrService }, { type: ToastPackage }, { type: ApplicationRef }];
}, propDecorators: { toastClasses: [{
  type: HostBinding,
  args: ["class"]
}], displayStyle: [{
  type: HostBinding,
  args: ["style.display"]
}], tapToast: [{
  type: HostListener,
  args: ["click"]
}], stickAround: [{
  type: HostListener,
  args: ["mouseenter"]
}], delayedHideToast: [{
  type: HostListener,
  args: ["mouseleave"]
}] } });
const DefaultNoAnimationsGlobalConfig = {
  ...DefaultNoComponentGlobalConfig,
  toastComponent: ToastNoAnimation
};
class ToastNoAnimationModule {
  static forRoot(config = {}) {
    return {
      ngModule: ToastNoAnimationModule,
      providers: [
        {
          provide: TOAST_CONFIG,
          useValue: {
            default: DefaultNoAnimationsGlobalConfig,
            config
          }
        }
      ]
    };
  }
}
ToastNoAnimationModule.ɵfac = __ngDeclareFactory({ minVersion: "12.0.0", version: "13.3.2", ngImport: i0, type: ToastNoAnimationModule, deps: [], target: FactoryTarget.NgModule });
ToastNoAnimationModule.ɵmod = __ngDeclareNgModule({ minVersion: "12.0.0", version: "13.3.2", ngImport: i0, type: ToastNoAnimationModule, declarations: [ToastNoAnimation], imports: [CommonModule], exports: [ToastNoAnimation] });
ToastNoAnimationModule.ɵinj = __ngDeclareInjector({ minVersion: "12.0.0", version: "13.3.2", ngImport: i0, type: ToastNoAnimationModule, imports: [[CommonModule]] });
__ngDeclareClassMetadata({ type: ToastNoAnimationModule, decorators: [{
  type: NgModule,
  args: [{
    imports: [CommonModule],
    declarations: [ToastNoAnimation],
    exports: [ToastNoAnimation],
    entryComponents: [ToastNoAnimation]
  }]
}] });
export {
  AUTO_STYLE as A,
  ContextMenuModule as C,
  FormsModule as F,
  NoopAnimationPlayer as N,
  ToastrModule as T,
  AnimationGroupPlayer as a,
  sequence as b,
  AnimationBuilder as c,
  AnimationFactory as d,
  NgbModule as e,
  NgbNavModule as f,
  style as s,
  ɵPRE_STYLE as ɵ
};
