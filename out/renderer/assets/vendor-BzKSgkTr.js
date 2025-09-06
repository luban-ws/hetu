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
function isFunction(x) {
  return typeof x === "function";
}
var _enable_super_gross_mode_that_will_cause_bad_things = false;
var config = {
  set useDeprecatedSynchronousErrorHandling(value) {
    if (value) {
      var error = /* @__PURE__ */ new Error();
      /* @__PURE__ */ console.warn("DEPRECATED! RxJS was set to use deprecated synchronous error handling behavior by code at: \n" + error.stack);
    }
    _enable_super_gross_mode_that_will_cause_bad_things = value;
  },
  get useDeprecatedSynchronousErrorHandling() {
    return _enable_super_gross_mode_that_will_cause_bad_things;
  }
};
function hostReportError(err) {
  setTimeout(function() {
    throw err;
  }, 0);
}
var empty$1 = {
  closed: true,
  next: function(value) {
  },
  error: function(err) {
    if (config.useDeprecatedSynchronousErrorHandling) {
      throw err;
    } else {
      hostReportError(err);
    }
  },
  complete: function() {
  }
};
var isArray = /* @__PURE__ */ (function() {
  return Array.isArray || (function(x) {
    return x && typeof x.length === "number";
  });
})();
function isObject(x) {
  return x !== null && typeof x === "object";
}
var UnsubscriptionErrorImpl = /* @__PURE__ */ (function() {
  function UnsubscriptionErrorImpl2(errors) {
    Error.call(this);
    this.message = errors ? errors.length + " errors occurred during unsubscription:\n" + errors.map(function(err, i) {
      return i + 1 + ") " + err.toString();
    }).join("\n  ") : "";
    this.name = "UnsubscriptionError";
    this.errors = errors;
    return this;
  }
  UnsubscriptionErrorImpl2.prototype = /* @__PURE__ */ Object.create(Error.prototype);
  return UnsubscriptionErrorImpl2;
})();
var UnsubscriptionError = UnsubscriptionErrorImpl;
var Subscription = /* @__PURE__ */ (function() {
  function Subscription2(unsubscribe) {
    this.closed = false;
    this._parentOrParents = null;
    this._subscriptions = null;
    if (unsubscribe) {
      this._ctorUnsubscribe = true;
      this._unsubscribe = unsubscribe;
    }
  }
  Subscription2.prototype.unsubscribe = function() {
    var errors;
    if (this.closed) {
      return;
    }
    var _a = this, _parentOrParents = _a._parentOrParents, _ctorUnsubscribe = _a._ctorUnsubscribe, _unsubscribe = _a._unsubscribe, _subscriptions = _a._subscriptions;
    this.closed = true;
    this._parentOrParents = null;
    this._subscriptions = null;
    if (_parentOrParents instanceof Subscription2) {
      _parentOrParents.remove(this);
    } else if (_parentOrParents !== null) {
      for (var index = 0; index < _parentOrParents.length; ++index) {
        var parent_1 = _parentOrParents[index];
        parent_1.remove(this);
      }
    }
    if (isFunction(_unsubscribe)) {
      if (_ctorUnsubscribe) {
        this._unsubscribe = void 0;
      }
      try {
        _unsubscribe.call(this);
      } catch (e) {
        errors = e instanceof UnsubscriptionError ? flattenUnsubscriptionErrors(e.errors) : [e];
      }
    }
    if (isArray(_subscriptions)) {
      var index = -1;
      var len = _subscriptions.length;
      while (++index < len) {
        var sub = _subscriptions[index];
        if (isObject(sub)) {
          try {
            sub.unsubscribe();
          } catch (e) {
            errors = errors || [];
            if (e instanceof UnsubscriptionError) {
              errors = errors.concat(flattenUnsubscriptionErrors(e.errors));
            } else {
              errors.push(e);
            }
          }
        }
      }
    }
    if (errors) {
      throw new UnsubscriptionError(errors);
    }
  };
  Subscription2.prototype.add = function(teardown) {
    var subscription = teardown;
    if (!teardown) {
      return Subscription2.EMPTY;
    }
    switch (typeof teardown) {
      case "function":
        subscription = new Subscription2(teardown);
      case "object":
        if (subscription === this || subscription.closed || typeof subscription.unsubscribe !== "function") {
          return subscription;
        } else if (this.closed) {
          subscription.unsubscribe();
          return subscription;
        } else if (!(subscription instanceof Subscription2)) {
          var tmp = subscription;
          subscription = new Subscription2();
          subscription._subscriptions = [tmp];
        }
        break;
      default: {
        throw new Error("unrecognized teardown " + teardown + " added to Subscription.");
      }
    }
    var _parentOrParents = subscription._parentOrParents;
    if (_parentOrParents === null) {
      subscription._parentOrParents = this;
    } else if (_parentOrParents instanceof Subscription2) {
      if (_parentOrParents === this) {
        return subscription;
      }
      subscription._parentOrParents = [_parentOrParents, this];
    } else if (_parentOrParents.indexOf(this) === -1) {
      _parentOrParents.push(this);
    } else {
      return subscription;
    }
    var subscriptions = this._subscriptions;
    if (subscriptions === null) {
      this._subscriptions = [subscription];
    } else {
      subscriptions.push(subscription);
    }
    return subscription;
  };
  Subscription2.prototype.remove = function(subscription) {
    var subscriptions = this._subscriptions;
    if (subscriptions) {
      var subscriptionIndex = subscriptions.indexOf(subscription);
      if (subscriptionIndex !== -1) {
        subscriptions.splice(subscriptionIndex, 1);
      }
    }
  };
  Subscription2.EMPTY = (function(empty2) {
    empty2.closed = true;
    return empty2;
  })(new Subscription2());
  return Subscription2;
})();
function flattenUnsubscriptionErrors(errors) {
  return errors.reduce(function(errs, err) {
    return errs.concat(err instanceof UnsubscriptionError ? err.errors : err);
  }, []);
}
var rxSubscriber = /* @__PURE__ */ (function() {
  return typeof Symbol === "function" ? /* @__PURE__ */ Symbol("rxSubscriber") : "@@rxSubscriber_" + /* @__PURE__ */ Math.random();
})();
var Subscriber = /* @__PURE__ */ (function(_super) {
  __extends(Subscriber2, _super);
  function Subscriber2(destinationOrNext, error, complete) {
    var _this = _super.call(this) || this;
    _this.syncErrorValue = null;
    _this.syncErrorThrown = false;
    _this.syncErrorThrowable = false;
    _this.isStopped = false;
    switch (arguments.length) {
      case 0:
        _this.destination = empty$1;
        break;
      case 1:
        if (!destinationOrNext) {
          _this.destination = empty$1;
          break;
        }
        if (typeof destinationOrNext === "object") {
          if (destinationOrNext instanceof Subscriber2) {
            _this.syncErrorThrowable = destinationOrNext.syncErrorThrowable;
            _this.destination = destinationOrNext;
            destinationOrNext.add(_this);
          } else {
            _this.syncErrorThrowable = true;
            _this.destination = new SafeSubscriber(_this, destinationOrNext);
          }
          break;
        }
      default:
        _this.syncErrorThrowable = true;
        _this.destination = new SafeSubscriber(_this, destinationOrNext, error, complete);
        break;
    }
    return _this;
  }
  Subscriber2.prototype[rxSubscriber] = function() {
    return this;
  };
  Subscriber2.create = function(next, error, complete) {
    var subscriber = new Subscriber2(next, error, complete);
    subscriber.syncErrorThrowable = false;
    return subscriber;
  };
  Subscriber2.prototype.next = function(value) {
    if (!this.isStopped) {
      this._next(value);
    }
  };
  Subscriber2.prototype.error = function(err) {
    if (!this.isStopped) {
      this.isStopped = true;
      this._error(err);
    }
  };
  Subscriber2.prototype.complete = function() {
    if (!this.isStopped) {
      this.isStopped = true;
      this._complete();
    }
  };
  Subscriber2.prototype.unsubscribe = function() {
    if (this.closed) {
      return;
    }
    this.isStopped = true;
    _super.prototype.unsubscribe.call(this);
  };
  Subscriber2.prototype._next = function(value) {
    this.destination.next(value);
  };
  Subscriber2.prototype._error = function(err) {
    this.destination.error(err);
    this.unsubscribe();
  };
  Subscriber2.prototype._complete = function() {
    this.destination.complete();
    this.unsubscribe();
  };
  Subscriber2.prototype._unsubscribeAndRecycle = function() {
    var _parentOrParents = this._parentOrParents;
    this._parentOrParents = null;
    this.unsubscribe();
    this.closed = false;
    this.isStopped = false;
    this._parentOrParents = _parentOrParents;
    return this;
  };
  return Subscriber2;
})(Subscription);
var SafeSubscriber = /* @__PURE__ */ (function(_super) {
  __extends(SafeSubscriber2, _super);
  function SafeSubscriber2(_parentSubscriber, observerOrNext, error, complete) {
    var _this = _super.call(this) || this;
    _this._parentSubscriber = _parentSubscriber;
    var next;
    var context = _this;
    if (isFunction(observerOrNext)) {
      next = observerOrNext;
    } else if (observerOrNext) {
      next = observerOrNext.next;
      error = observerOrNext.error;
      complete = observerOrNext.complete;
      if (observerOrNext !== empty$1) {
        context = Object.create(observerOrNext);
        if (isFunction(context.unsubscribe)) {
          _this.add(context.unsubscribe.bind(context));
        }
        context.unsubscribe = _this.unsubscribe.bind(_this);
      }
    }
    _this._context = context;
    _this._next = next;
    _this._error = error;
    _this._complete = complete;
    return _this;
  }
  SafeSubscriber2.prototype.next = function(value) {
    if (!this.isStopped && this._next) {
      var _parentSubscriber = this._parentSubscriber;
      if (!config.useDeprecatedSynchronousErrorHandling || !_parentSubscriber.syncErrorThrowable) {
        this.__tryOrUnsub(this._next, value);
      } else if (this.__tryOrSetError(_parentSubscriber, this._next, value)) {
        this.unsubscribe();
      }
    }
  };
  SafeSubscriber2.prototype.error = function(err) {
    if (!this.isStopped) {
      var _parentSubscriber = this._parentSubscriber;
      var useDeprecatedSynchronousErrorHandling = config.useDeprecatedSynchronousErrorHandling;
      if (this._error) {
        if (!useDeprecatedSynchronousErrorHandling || !_parentSubscriber.syncErrorThrowable) {
          this.__tryOrUnsub(this._error, err);
          this.unsubscribe();
        } else {
          this.__tryOrSetError(_parentSubscriber, this._error, err);
          this.unsubscribe();
        }
      } else if (!_parentSubscriber.syncErrorThrowable) {
        this.unsubscribe();
        if (useDeprecatedSynchronousErrorHandling) {
          throw err;
        }
        hostReportError(err);
      } else {
        if (useDeprecatedSynchronousErrorHandling) {
          _parentSubscriber.syncErrorValue = err;
          _parentSubscriber.syncErrorThrown = true;
        } else {
          hostReportError(err);
        }
        this.unsubscribe();
      }
    }
  };
  SafeSubscriber2.prototype.complete = function() {
    var _this = this;
    if (!this.isStopped) {
      var _parentSubscriber = this._parentSubscriber;
      if (this._complete) {
        var wrappedComplete = function() {
          return _this._complete.call(_this._context);
        };
        if (!config.useDeprecatedSynchronousErrorHandling || !_parentSubscriber.syncErrorThrowable) {
          this.__tryOrUnsub(wrappedComplete);
          this.unsubscribe();
        } else {
          this.__tryOrSetError(_parentSubscriber, wrappedComplete);
          this.unsubscribe();
        }
      } else {
        this.unsubscribe();
      }
    }
  };
  SafeSubscriber2.prototype.__tryOrUnsub = function(fn, value) {
    try {
      fn.call(this._context, value);
    } catch (err) {
      this.unsubscribe();
      if (config.useDeprecatedSynchronousErrorHandling) {
        throw err;
      } else {
        hostReportError(err);
      }
    }
  };
  SafeSubscriber2.prototype.__tryOrSetError = function(parent, fn, value) {
    if (!config.useDeprecatedSynchronousErrorHandling) {
      throw new Error("bad call");
    }
    try {
      fn.call(this._context, value);
    } catch (err) {
      if (config.useDeprecatedSynchronousErrorHandling) {
        parent.syncErrorValue = err;
        parent.syncErrorThrown = true;
        return true;
      } else {
        hostReportError(err);
        return true;
      }
    }
    return false;
  };
  SafeSubscriber2.prototype._unsubscribe = function() {
    var _parentSubscriber = this._parentSubscriber;
    this._context = null;
    this._parentSubscriber = null;
    _parentSubscriber.unsubscribe();
  };
  return SafeSubscriber2;
})(Subscriber);
function canReportError(observer) {
  while (observer) {
    var _a = observer, closed_1 = _a.closed, destination = _a.destination, isStopped = _a.isStopped;
    if (closed_1 || isStopped) {
      return false;
    } else if (destination && destination instanceof Subscriber) {
      observer = destination;
    } else {
      observer = null;
    }
  }
  return true;
}
function toSubscriber(nextOrObserver, error, complete) {
  if (nextOrObserver) {
    if (nextOrObserver instanceof Subscriber) {
      return nextOrObserver;
    }
    if (nextOrObserver[rxSubscriber]) {
      return nextOrObserver[rxSubscriber]();
    }
  }
  if (!nextOrObserver && !error && !complete) {
    return new Subscriber(empty$1);
  }
  return new Subscriber(nextOrObserver, error, complete);
}
var observable = /* @__PURE__ */ (function() {
  return typeof Symbol === "function" && Symbol.observable || "@@observable";
})();
function identity(x) {
  return x;
}
function pipeFromArray(fns) {
  if (fns.length === 0) {
    return identity;
  }
  if (fns.length === 1) {
    return fns[0];
  }
  return function piped(input) {
    return fns.reduce(function(prev, fn) {
      return fn(prev);
    }, input);
  };
}
var Observable = /* @__PURE__ */ (function() {
  function Observable2(subscribe) {
    this._isScalar = false;
    if (subscribe) {
      this._subscribe = subscribe;
    }
  }
  Observable2.prototype.lift = function(operator) {
    var observable2 = new Observable2();
    observable2.source = this;
    observable2.operator = operator;
    return observable2;
  };
  Observable2.prototype.subscribe = function(observerOrNext, error, complete) {
    var operator = this.operator;
    var sink = toSubscriber(observerOrNext, error, complete);
    if (operator) {
      sink.add(operator.call(sink, this.source));
    } else {
      sink.add(this.source || config.useDeprecatedSynchronousErrorHandling && !sink.syncErrorThrowable ? this._subscribe(sink) : this._trySubscribe(sink));
    }
    if (config.useDeprecatedSynchronousErrorHandling) {
      if (sink.syncErrorThrowable) {
        sink.syncErrorThrowable = false;
        if (sink.syncErrorThrown) {
          throw sink.syncErrorValue;
        }
      }
    }
    return sink;
  };
  Observable2.prototype._trySubscribe = function(sink) {
    try {
      return this._subscribe(sink);
    } catch (err) {
      if (config.useDeprecatedSynchronousErrorHandling) {
        sink.syncErrorThrown = true;
        sink.syncErrorValue = err;
      }
      if (canReportError(sink)) {
        sink.error(err);
      } else {
        console.warn(err);
      }
    }
  };
  Observable2.prototype.forEach = function(next, promiseCtor) {
    var _this = this;
    promiseCtor = getPromiseCtor(promiseCtor);
    return new promiseCtor(function(resolve, reject) {
      var subscription;
      subscription = _this.subscribe(function(value) {
        try {
          next(value);
        } catch (err) {
          reject(err);
          if (subscription) {
            subscription.unsubscribe();
          }
        }
      }, reject, resolve);
    });
  };
  Observable2.prototype._subscribe = function(subscriber) {
    var source = this.source;
    return source && source.subscribe(subscriber);
  };
  Observable2.prototype[observable] = function() {
    return this;
  };
  Observable2.prototype.pipe = function() {
    var operations = [];
    for (var _i = 0; _i < arguments.length; _i++) {
      operations[_i] = arguments[_i];
    }
    if (operations.length === 0) {
      return this;
    }
    return pipeFromArray(operations)(this);
  };
  Observable2.prototype.toPromise = function(promiseCtor) {
    var _this = this;
    promiseCtor = getPromiseCtor(promiseCtor);
    return new promiseCtor(function(resolve, reject) {
      var value;
      _this.subscribe(function(x) {
        return value = x;
      }, function(err) {
        return reject(err);
      }, function() {
        return resolve(value);
      });
    });
  };
  Observable2.create = function(subscribe) {
    return new Observable2(subscribe);
  };
  return Observable2;
})();
function getPromiseCtor(promiseCtor) {
  if (!promiseCtor) {
    promiseCtor = Promise;
  }
  if (!promiseCtor) {
    throw new Error("no Promise impl found");
  }
  return promiseCtor;
}
var ObjectUnsubscribedErrorImpl = /* @__PURE__ */ (function() {
  function ObjectUnsubscribedErrorImpl2() {
    Error.call(this);
    this.message = "object unsubscribed";
    this.name = "ObjectUnsubscribedError";
    return this;
  }
  ObjectUnsubscribedErrorImpl2.prototype = /* @__PURE__ */ Object.create(Error.prototype);
  return ObjectUnsubscribedErrorImpl2;
})();
var ObjectUnsubscribedError = ObjectUnsubscribedErrorImpl;
var SubjectSubscription = /* @__PURE__ */ (function(_super) {
  __extends(SubjectSubscription2, _super);
  function SubjectSubscription2(subject, subscriber) {
    var _this = _super.call(this) || this;
    _this.subject = subject;
    _this.subscriber = subscriber;
    _this.closed = false;
    return _this;
  }
  SubjectSubscription2.prototype.unsubscribe = function() {
    if (this.closed) {
      return;
    }
    this.closed = true;
    var subject = this.subject;
    var observers = subject.observers;
    this.subject = null;
    if (!observers || observers.length === 0 || subject.isStopped || subject.closed) {
      return;
    }
    var subscriberIndex = observers.indexOf(this.subscriber);
    if (subscriberIndex !== -1) {
      observers.splice(subscriberIndex, 1);
    }
  };
  return SubjectSubscription2;
})(Subscription);
var SubjectSubscriber = /* @__PURE__ */ (function(_super) {
  __extends(SubjectSubscriber2, _super);
  function SubjectSubscriber2(destination) {
    var _this = _super.call(this, destination) || this;
    _this.destination = destination;
    return _this;
  }
  return SubjectSubscriber2;
})(Subscriber);
var Subject = /* @__PURE__ */ (function(_super) {
  __extends(Subject2, _super);
  function Subject2() {
    var _this = _super.call(this) || this;
    _this.observers = [];
    _this.closed = false;
    _this.isStopped = false;
    _this.hasError = false;
    _this.thrownError = null;
    return _this;
  }
  Subject2.prototype[rxSubscriber] = function() {
    return new SubjectSubscriber(this);
  };
  Subject2.prototype.lift = function(operator) {
    var subject = new AnonymousSubject(this, this);
    subject.operator = operator;
    return subject;
  };
  Subject2.prototype.next = function(value) {
    if (this.closed) {
      throw new ObjectUnsubscribedError();
    }
    if (!this.isStopped) {
      var observers = this.observers;
      var len = observers.length;
      var copy = observers.slice();
      for (var i = 0; i < len; i++) {
        copy[i].next(value);
      }
    }
  };
  Subject2.prototype.error = function(err) {
    if (this.closed) {
      throw new ObjectUnsubscribedError();
    }
    this.hasError = true;
    this.thrownError = err;
    this.isStopped = true;
    var observers = this.observers;
    var len = observers.length;
    var copy = observers.slice();
    for (var i = 0; i < len; i++) {
      copy[i].error(err);
    }
    this.observers.length = 0;
  };
  Subject2.prototype.complete = function() {
    if (this.closed) {
      throw new ObjectUnsubscribedError();
    }
    this.isStopped = true;
    var observers = this.observers;
    var len = observers.length;
    var copy = observers.slice();
    for (var i = 0; i < len; i++) {
      copy[i].complete();
    }
    this.observers.length = 0;
  };
  Subject2.prototype.unsubscribe = function() {
    this.isStopped = true;
    this.closed = true;
    this.observers = null;
  };
  Subject2.prototype._trySubscribe = function(subscriber) {
    if (this.closed) {
      throw new ObjectUnsubscribedError();
    } else {
      return _super.prototype._trySubscribe.call(this, subscriber);
    }
  };
  Subject2.prototype._subscribe = function(subscriber) {
    if (this.closed) {
      throw new ObjectUnsubscribedError();
    } else if (this.hasError) {
      subscriber.error(this.thrownError);
      return Subscription.EMPTY;
    } else if (this.isStopped) {
      subscriber.complete();
      return Subscription.EMPTY;
    } else {
      this.observers.push(subscriber);
      return new SubjectSubscription(this, subscriber);
    }
  };
  Subject2.prototype.asObservable = function() {
    var observable2 = new Observable();
    observable2.source = this;
    return observable2;
  };
  Subject2.create = function(destination, source) {
    return new AnonymousSubject(destination, source);
  };
  return Subject2;
})(Observable);
var AnonymousSubject = /* @__PURE__ */ (function(_super) {
  __extends(AnonymousSubject2, _super);
  function AnonymousSubject2(destination, source) {
    var _this = _super.call(this) || this;
    _this.destination = destination;
    _this.source = source;
    return _this;
  }
  AnonymousSubject2.prototype.next = function(value) {
    var destination = this.destination;
    if (destination && destination.next) {
      destination.next(value);
    }
  };
  AnonymousSubject2.prototype.error = function(err) {
    var destination = this.destination;
    if (destination && destination.error) {
      this.destination.error(err);
    }
  };
  AnonymousSubject2.prototype.complete = function() {
    var destination = this.destination;
    if (destination && destination.complete) {
      this.destination.complete();
    }
  };
  AnonymousSubject2.prototype._subscribe = function(subscriber) {
    var source = this.source;
    if (source) {
      return this.source.subscribe(subscriber);
    } else {
      return Subscription.EMPTY;
    }
  };
  return AnonymousSubject2;
})(Subject);
function refCount() {
  return function refCountOperatorFunction(source) {
    return source.lift(new RefCountOperator(source));
  };
}
var RefCountOperator = /* @__PURE__ */ (function() {
  function RefCountOperator2(connectable) {
    this.connectable = connectable;
  }
  RefCountOperator2.prototype.call = function(subscriber, source) {
    var connectable = this.connectable;
    connectable._refCount++;
    var refCounter = new RefCountSubscriber(subscriber, connectable);
    var subscription = source.subscribe(refCounter);
    if (!refCounter.closed) {
      refCounter.connection = connectable.connect();
    }
    return subscription;
  };
  return RefCountOperator2;
})();
var RefCountSubscriber = /* @__PURE__ */ (function(_super) {
  __extends(RefCountSubscriber2, _super);
  function RefCountSubscriber2(destination, connectable) {
    var _this = _super.call(this, destination) || this;
    _this.connectable = connectable;
    return _this;
  }
  RefCountSubscriber2.prototype._unsubscribe = function() {
    var connectable = this.connectable;
    if (!connectable) {
      this.connection = null;
      return;
    }
    this.connectable = null;
    var refCount2 = connectable._refCount;
    if (refCount2 <= 0) {
      this.connection = null;
      return;
    }
    connectable._refCount = refCount2 - 1;
    if (refCount2 > 1) {
      this.connection = null;
      return;
    }
    var connection = this.connection;
    var sharedConnection = connectable._connection;
    this.connection = null;
    if (sharedConnection && (!connection || sharedConnection === connection)) {
      sharedConnection.unsubscribe();
    }
  };
  return RefCountSubscriber2;
})(Subscriber);
var ConnectableObservable = /* @__PURE__ */ (function(_super) {
  __extends(ConnectableObservable2, _super);
  function ConnectableObservable2(source, subjectFactory) {
    var _this = _super.call(this) || this;
    _this.source = source;
    _this.subjectFactory = subjectFactory;
    _this._refCount = 0;
    _this._isComplete = false;
    return _this;
  }
  ConnectableObservable2.prototype._subscribe = function(subscriber) {
    return this.getSubject().subscribe(subscriber);
  };
  ConnectableObservable2.prototype.getSubject = function() {
    var subject = this._subject;
    if (!subject || subject.isStopped) {
      this._subject = this.subjectFactory();
    }
    return this._subject;
  };
  ConnectableObservable2.prototype.connect = function() {
    var connection = this._connection;
    if (!connection) {
      this._isComplete = false;
      connection = this._connection = new Subscription();
      connection.add(this.source.subscribe(new ConnectableSubscriber(this.getSubject(), this)));
      if (connection.closed) {
        this._connection = null;
        connection = Subscription.EMPTY;
      }
    }
    return connection;
  };
  ConnectableObservable2.prototype.refCount = function() {
    return refCount()(this);
  };
  return ConnectableObservable2;
})(Observable);
var connectableObservableDescriptor = /* @__PURE__ */ (function() {
  var connectableProto = ConnectableObservable.prototype;
  return {
    operator: { value: null },
    _refCount: { value: 0, writable: true },
    _subject: { value: null, writable: true },
    _connection: { value: null, writable: true },
    _subscribe: { value: connectableProto._subscribe },
    _isComplete: { value: connectableProto._isComplete, writable: true },
    getSubject: { value: connectableProto.getSubject },
    connect: { value: connectableProto.connect },
    refCount: { value: connectableProto.refCount }
  };
})();
var ConnectableSubscriber = /* @__PURE__ */ (function(_super) {
  __extends(ConnectableSubscriber2, _super);
  function ConnectableSubscriber2(destination, connectable) {
    var _this = _super.call(this, destination) || this;
    _this.connectable = connectable;
    return _this;
  }
  ConnectableSubscriber2.prototype._error = function(err) {
    this._unsubscribe();
    _super.prototype._error.call(this, err);
  };
  ConnectableSubscriber2.prototype._complete = function() {
    this.connectable._isComplete = true;
    this._unsubscribe();
    _super.prototype._complete.call(this);
  };
  ConnectableSubscriber2.prototype._unsubscribe = function() {
    var connectable = this.connectable;
    if (connectable) {
      this.connectable = null;
      var connection = connectable._connection;
      connectable._refCount = 0;
      connectable._subject = null;
      connectable._connection = null;
      if (connection) {
        connection.unsubscribe();
      }
    }
  };
  return ConnectableSubscriber2;
})(SubjectSubscriber);
var BehaviorSubject = /* @__PURE__ */ (function(_super) {
  __extends(BehaviorSubject2, _super);
  function BehaviorSubject2(_value) {
    var _this = _super.call(this) || this;
    _this._value = _value;
    return _this;
  }
  Object.defineProperty(BehaviorSubject2.prototype, "value", {
    get: function() {
      return this.getValue();
    },
    enumerable: true,
    configurable: true
  });
  BehaviorSubject2.prototype._subscribe = function(subscriber) {
    var subscription = _super.prototype._subscribe.call(this, subscriber);
    if (subscription && !subscription.closed) {
      subscriber.next(this._value);
    }
    return subscription;
  };
  BehaviorSubject2.prototype.getValue = function() {
    if (this.hasError) {
      throw this.thrownError;
    } else if (this.closed) {
      throw new ObjectUnsubscribedError();
    } else {
      return this._value;
    }
  };
  BehaviorSubject2.prototype.next = function(value) {
    _super.prototype.next.call(this, this._value = value);
  };
  return BehaviorSubject2;
})(Subject);
var Action = /* @__PURE__ */ (function(_super) {
  __extends(Action2, _super);
  function Action2(scheduler, work) {
    return _super.call(this) || this;
  }
  Action2.prototype.schedule = function(state, delay2) {
    return this;
  };
  return Action2;
})(Subscription);
var AsyncAction = /* @__PURE__ */ (function(_super) {
  __extends(AsyncAction2, _super);
  function AsyncAction2(scheduler, work) {
    var _this = _super.call(this, scheduler, work) || this;
    _this.scheduler = scheduler;
    _this.work = work;
    _this.pending = false;
    return _this;
  }
  AsyncAction2.prototype.schedule = function(state, delay2) {
    if (delay2 === void 0) {
      delay2 = 0;
    }
    if (this.closed) {
      return this;
    }
    this.state = state;
    var id = this.id;
    var scheduler = this.scheduler;
    if (id != null) {
      this.id = this.recycleAsyncId(scheduler, id, delay2);
    }
    this.pending = true;
    this.delay = delay2;
    this.id = this.id || this.requestAsyncId(scheduler, this.id, delay2);
    return this;
  };
  AsyncAction2.prototype.requestAsyncId = function(scheduler, id, delay2) {
    if (delay2 === void 0) {
      delay2 = 0;
    }
    return setInterval(scheduler.flush.bind(scheduler, this), delay2);
  };
  AsyncAction2.prototype.recycleAsyncId = function(scheduler, id, delay2) {
    if (delay2 === void 0) {
      delay2 = 0;
    }
    if (delay2 !== null && this.delay === delay2 && this.pending === false) {
      return id;
    }
    clearInterval(id);
    return void 0;
  };
  AsyncAction2.prototype.execute = function(state, delay2) {
    if (this.closed) {
      return new Error("executing a cancelled action");
    }
    this.pending = false;
    var error = this._execute(state, delay2);
    if (error) {
      return error;
    } else if (this.pending === false && this.id != null) {
      this.id = this.recycleAsyncId(this.scheduler, this.id, null);
    }
  };
  AsyncAction2.prototype._execute = function(state, delay2) {
    var errored = false;
    var errorValue = void 0;
    try {
      this.work(state);
    } catch (e) {
      errored = true;
      errorValue = !!e && e || new Error(e);
    }
    if (errored) {
      this.unsubscribe();
      return errorValue;
    }
  };
  AsyncAction2.prototype._unsubscribe = function() {
    var id = this.id;
    var scheduler = this.scheduler;
    var actions = scheduler.actions;
    var index = actions.indexOf(this);
    this.work = null;
    this.state = null;
    this.pending = false;
    this.scheduler = null;
    if (index !== -1) {
      actions.splice(index, 1);
    }
    if (id != null) {
      this.id = this.recycleAsyncId(scheduler, id, null);
    }
    this.delay = null;
  };
  return AsyncAction2;
})(Action);
var QueueAction = /* @__PURE__ */ (function(_super) {
  __extends(QueueAction2, _super);
  function QueueAction2(scheduler, work) {
    var _this = _super.call(this, scheduler, work) || this;
    _this.scheduler = scheduler;
    _this.work = work;
    return _this;
  }
  QueueAction2.prototype.schedule = function(state, delay2) {
    if (delay2 === void 0) {
      delay2 = 0;
    }
    if (delay2 > 0) {
      return _super.prototype.schedule.call(this, state, delay2);
    }
    this.delay = delay2;
    this.state = state;
    this.scheduler.flush(this);
    return this;
  };
  QueueAction2.prototype.execute = function(state, delay2) {
    return delay2 > 0 || this.closed ? _super.prototype.execute.call(this, state, delay2) : this._execute(state, delay2);
  };
  QueueAction2.prototype.requestAsyncId = function(scheduler, id, delay2) {
    if (delay2 === void 0) {
      delay2 = 0;
    }
    if (delay2 !== null && delay2 > 0 || delay2 === null && this.delay > 0) {
      return _super.prototype.requestAsyncId.call(this, scheduler, id, delay2);
    }
    return scheduler.flush(this);
  };
  return QueueAction2;
})(AsyncAction);
var Scheduler = /* @__PURE__ */ (function() {
  function Scheduler2(SchedulerAction, now) {
    if (now === void 0) {
      now = Scheduler2.now;
    }
    this.SchedulerAction = SchedulerAction;
    this.now = now;
  }
  Scheduler2.prototype.schedule = function(work, delay2, state) {
    if (delay2 === void 0) {
      delay2 = 0;
    }
    return new this.SchedulerAction(this, work).schedule(state, delay2);
  };
  Scheduler2.now = function() {
    return Date.now();
  };
  return Scheduler2;
})();
var AsyncScheduler = /* @__PURE__ */ (function(_super) {
  __extends(AsyncScheduler2, _super);
  function AsyncScheduler2(SchedulerAction, now) {
    if (now === void 0) {
      now = Scheduler.now;
    }
    var _this = _super.call(this, SchedulerAction, function() {
      if (AsyncScheduler2.delegate && AsyncScheduler2.delegate !== _this) {
        return AsyncScheduler2.delegate.now();
      } else {
        return now();
      }
    }) || this;
    _this.actions = [];
    _this.active = false;
    _this.scheduled = void 0;
    return _this;
  }
  AsyncScheduler2.prototype.schedule = function(work, delay2, state) {
    if (delay2 === void 0) {
      delay2 = 0;
    }
    if (AsyncScheduler2.delegate && AsyncScheduler2.delegate !== this) {
      return AsyncScheduler2.delegate.schedule(work, delay2, state);
    } else {
      return _super.prototype.schedule.call(this, work, delay2, state);
    }
  };
  AsyncScheduler2.prototype.flush = function(action) {
    var actions = this.actions;
    if (this.active) {
      actions.push(action);
      return;
    }
    var error;
    this.active = true;
    do {
      if (error = action.execute(action.state, action.delay)) {
        break;
      }
    } while (action = actions.shift());
    this.active = false;
    if (error) {
      while (action = actions.shift()) {
        action.unsubscribe();
      }
      throw error;
    }
  };
  return AsyncScheduler2;
})(Scheduler);
var QueueScheduler = /* @__PURE__ */ (function(_super) {
  __extends(QueueScheduler2, _super);
  function QueueScheduler2() {
    return _super !== null && _super.apply(this, arguments) || this;
  }
  return QueueScheduler2;
})(AsyncScheduler);
var queueScheduler = /* @__PURE__ */ new QueueScheduler(QueueAction);
var queue = queueScheduler;
var EMPTY = /* @__PURE__ */ new Observable(function(subscriber) {
  return subscriber.complete();
});
function empty(scheduler) {
  return scheduler ? emptyScheduled(scheduler) : EMPTY;
}
function emptyScheduled(scheduler) {
  return new Observable(function(subscriber) {
    return scheduler.schedule(function() {
      return subscriber.complete();
    });
  });
}
function isScheduler(value) {
  return value && typeof value.schedule === "function";
}
var subscribeToArray = function(array) {
  return function(subscriber) {
    for (var i = 0, len = array.length; i < len && !subscriber.closed; i++) {
      subscriber.next(array[i]);
    }
    subscriber.complete();
  };
};
function scheduleArray(input, scheduler) {
  return new Observable(function(subscriber) {
    var sub = new Subscription();
    var i = 0;
    sub.add(scheduler.schedule(function() {
      if (i === input.length) {
        subscriber.complete();
        return;
      }
      subscriber.next(input[i++]);
      if (!subscriber.closed) {
        sub.add(this.schedule());
      }
    }));
    return sub;
  });
}
function fromArray(input, scheduler) {
  if (!scheduler) {
    return new Observable(subscribeToArray(input));
  } else {
    return scheduleArray(input, scheduler);
  }
}
function of() {
  var args = [];
  for (var _i = 0; _i < arguments.length; _i++) {
    args[_i] = arguments[_i];
  }
  var scheduler = args[args.length - 1];
  if (isScheduler(scheduler)) {
    args.pop();
    return scheduleArray(args, scheduler);
  } else {
    return fromArray(args);
  }
}
function throwError$1(error, scheduler) {
  {
    return new Observable(function(subscriber) {
      return subscriber.error(error);
    });
  }
}
var Notification = /* @__PURE__ */ (function() {
  function Notification2(kind, value, error) {
    this.kind = kind;
    this.value = value;
    this.error = error;
    this.hasValue = kind === "N";
  }
  Notification2.prototype.observe = function(observer) {
    switch (this.kind) {
      case "N":
        return observer.next && observer.next(this.value);
      case "E":
        return observer.error && observer.error(this.error);
      case "C":
        return observer.complete && observer.complete();
    }
  };
  Notification2.prototype.do = function(next, error, complete) {
    var kind = this.kind;
    switch (kind) {
      case "N":
        return next && next(this.value);
      case "E":
        return error && error(this.error);
      case "C":
        return complete && complete();
    }
  };
  Notification2.prototype.accept = function(nextOrObserver, error, complete) {
    if (nextOrObserver && typeof nextOrObserver.next === "function") {
      return this.observe(nextOrObserver);
    } else {
      return this.do(nextOrObserver, error, complete);
    }
  };
  Notification2.prototype.toObservable = function() {
    var kind = this.kind;
    switch (kind) {
      case "N":
        return of(this.value);
      case "E":
        return throwError$1(this.error);
      case "C":
        return empty();
    }
    throw new Error("unexpected notification kind value");
  };
  Notification2.createNext = function(value) {
    if (typeof value !== "undefined") {
      return new Notification2("N", value);
    }
    return Notification2.undefinedValueNotification;
  };
  Notification2.createError = function(err) {
    return new Notification2("E", void 0, err);
  };
  Notification2.createComplete = function() {
    return Notification2.completeNotification;
  };
  Notification2.completeNotification = new Notification2("C");
  Notification2.undefinedValueNotification = new Notification2("N", void 0);
  return Notification2;
})();
var ObserveOnSubscriber = /* @__PURE__ */ (function(_super) {
  __extends(ObserveOnSubscriber2, _super);
  function ObserveOnSubscriber2(destination, scheduler, delay2) {
    if (delay2 === void 0) {
      delay2 = 0;
    }
    var _this = _super.call(this, destination) || this;
    _this.scheduler = scheduler;
    _this.delay = delay2;
    return _this;
  }
  ObserveOnSubscriber2.dispatch = function(arg) {
    var notification = arg.notification, destination = arg.destination;
    notification.observe(destination);
    this.unsubscribe();
  };
  ObserveOnSubscriber2.prototype.scheduleMessage = function(notification) {
    var destination = this.destination;
    destination.add(this.scheduler.schedule(ObserveOnSubscriber2.dispatch, this.delay, new ObserveOnMessage(notification, this.destination)));
  };
  ObserveOnSubscriber2.prototype._next = function(value) {
    this.scheduleMessage(Notification.createNext(value));
  };
  ObserveOnSubscriber2.prototype._error = function(err) {
    this.scheduleMessage(Notification.createError(err));
    this.unsubscribe();
  };
  ObserveOnSubscriber2.prototype._complete = function() {
    this.scheduleMessage(Notification.createComplete());
    this.unsubscribe();
  };
  return ObserveOnSubscriber2;
})(Subscriber);
var ObserveOnMessage = /* @__PURE__ */ (function() {
  function ObserveOnMessage2(notification, destination) {
    this.notification = notification;
    this.destination = destination;
  }
  return ObserveOnMessage2;
})();
var ReplaySubject = /* @__PURE__ */ (function(_super) {
  __extends(ReplaySubject2, _super);
  function ReplaySubject2(bufferSize, windowTime, scheduler) {
    if (bufferSize === void 0) {
      bufferSize = Number.POSITIVE_INFINITY;
    }
    if (windowTime === void 0) {
      windowTime = Number.POSITIVE_INFINITY;
    }
    var _this = _super.call(this) || this;
    _this.scheduler = scheduler;
    _this._events = [];
    _this._infiniteTimeWindow = false;
    _this._bufferSize = bufferSize < 1 ? 1 : bufferSize;
    _this._windowTime = windowTime < 1 ? 1 : windowTime;
    if (windowTime === Number.POSITIVE_INFINITY) {
      _this._infiniteTimeWindow = true;
      _this.next = _this.nextInfiniteTimeWindow;
    } else {
      _this.next = _this.nextTimeWindow;
    }
    return _this;
  }
  ReplaySubject2.prototype.nextInfiniteTimeWindow = function(value) {
    if (!this.isStopped) {
      var _events = this._events;
      _events.push(value);
      if (_events.length > this._bufferSize) {
        _events.shift();
      }
    }
    _super.prototype.next.call(this, value);
  };
  ReplaySubject2.prototype.nextTimeWindow = function(value) {
    if (!this.isStopped) {
      this._events.push(new ReplayEvent(this._getNow(), value));
      this._trimBufferThenGetEvents();
    }
    _super.prototype.next.call(this, value);
  };
  ReplaySubject2.prototype._subscribe = function(subscriber) {
    var _infiniteTimeWindow = this._infiniteTimeWindow;
    var _events = _infiniteTimeWindow ? this._events : this._trimBufferThenGetEvents();
    var scheduler = this.scheduler;
    var len = _events.length;
    var subscription;
    if (this.closed) {
      throw new ObjectUnsubscribedError();
    } else if (this.isStopped || this.hasError) {
      subscription = Subscription.EMPTY;
    } else {
      this.observers.push(subscriber);
      subscription = new SubjectSubscription(this, subscriber);
    }
    if (scheduler) {
      subscriber.add(subscriber = new ObserveOnSubscriber(subscriber, scheduler));
    }
    if (_infiniteTimeWindow) {
      for (var i = 0; i < len && !subscriber.closed; i++) {
        subscriber.next(_events[i]);
      }
    } else {
      for (var i = 0; i < len && !subscriber.closed; i++) {
        subscriber.next(_events[i].value);
      }
    }
    if (this.hasError) {
      subscriber.error(this.thrownError);
    } else if (this.isStopped) {
      subscriber.complete();
    }
    return subscription;
  };
  ReplaySubject2.prototype._getNow = function() {
    return (this.scheduler || queue).now();
  };
  ReplaySubject2.prototype._trimBufferThenGetEvents = function() {
    var now = this._getNow();
    var _bufferSize = this._bufferSize;
    var _windowTime = this._windowTime;
    var _events = this._events;
    var eventsCount = _events.length;
    var spliceCount = 0;
    while (spliceCount < eventsCount) {
      if (now - _events[spliceCount].time < _windowTime) {
        break;
      }
      spliceCount++;
    }
    if (eventsCount > _bufferSize) {
      spliceCount = Math.max(spliceCount, eventsCount - _bufferSize);
    }
    if (spliceCount > 0) {
      _events.splice(0, spliceCount);
    }
    return _events;
  };
  return ReplaySubject2;
})(Subject);
var ReplayEvent = /* @__PURE__ */ (function() {
  function ReplayEvent2(time, value) {
    this.time = time;
    this.value = value;
  }
  return ReplayEvent2;
})();
var nextHandle = 1;
var RESOLVED = /* @__PURE__ */ (function() {
  return /* @__PURE__ */ Promise.resolve();
})();
var activeHandles = {};
function findAndClearHandle(handle) {
  if (handle in activeHandles) {
    delete activeHandles[handle];
    return true;
  }
  return false;
}
var Immediate = {
  setImmediate: function(cb) {
    var handle = nextHandle++;
    activeHandles[handle] = true;
    RESOLVED.then(function() {
      return findAndClearHandle(handle) && cb();
    });
    return handle;
  },
  clearImmediate: function(handle) {
    findAndClearHandle(handle);
  }
};
var AsapAction = /* @__PURE__ */ (function(_super) {
  __extends(AsapAction2, _super);
  function AsapAction2(scheduler, work) {
    var _this = _super.call(this, scheduler, work) || this;
    _this.scheduler = scheduler;
    _this.work = work;
    return _this;
  }
  AsapAction2.prototype.requestAsyncId = function(scheduler, id, delay2) {
    if (delay2 === void 0) {
      delay2 = 0;
    }
    if (delay2 !== null && delay2 > 0) {
      return _super.prototype.requestAsyncId.call(this, scheduler, id, delay2);
    }
    scheduler.actions.push(this);
    return scheduler.scheduled || (scheduler.scheduled = Immediate.setImmediate(scheduler.flush.bind(scheduler, null)));
  };
  AsapAction2.prototype.recycleAsyncId = function(scheduler, id, delay2) {
    if (delay2 === void 0) {
      delay2 = 0;
    }
    if (delay2 !== null && delay2 > 0 || delay2 === null && this.delay > 0) {
      return _super.prototype.recycleAsyncId.call(this, scheduler, id, delay2);
    }
    if (scheduler.actions.length === 0) {
      Immediate.clearImmediate(id);
      scheduler.scheduled = void 0;
    }
    return void 0;
  };
  return AsapAction2;
})(AsyncAction);
var AsapScheduler = /* @__PURE__ */ (function(_super) {
  __extends(AsapScheduler2, _super);
  function AsapScheduler2() {
    return _super !== null && _super.apply(this, arguments) || this;
  }
  AsapScheduler2.prototype.flush = function(action) {
    this.active = true;
    this.scheduled = void 0;
    var actions = this.actions;
    var error;
    var index = -1;
    var count = actions.length;
    action = action || actions.shift();
    do {
      if (error = action.execute(action.state, action.delay)) {
        break;
      }
    } while (++index < count && (action = actions.shift()));
    this.active = false;
    if (error) {
      while (++index < count && (action = actions.shift())) {
        action.unsubscribe();
      }
      throw error;
    }
  };
  return AsapScheduler2;
})(AsyncScheduler);
var asapScheduler = /* @__PURE__ */ new AsapScheduler(AsapAction);
var asyncScheduler = /* @__PURE__ */ new AsyncScheduler(AsyncAction);
var async = asyncScheduler;
function noop$1() {
}
var ArgumentOutOfRangeErrorImpl = /* @__PURE__ */ (function() {
  function ArgumentOutOfRangeErrorImpl2() {
    Error.call(this);
    this.message = "argument out of range";
    this.name = "ArgumentOutOfRangeError";
    return this;
  }
  ArgumentOutOfRangeErrorImpl2.prototype = /* @__PURE__ */ Object.create(Error.prototype);
  return ArgumentOutOfRangeErrorImpl2;
})();
var ArgumentOutOfRangeError = ArgumentOutOfRangeErrorImpl;
var EmptyErrorImpl = /* @__PURE__ */ (function() {
  function EmptyErrorImpl2() {
    Error.call(this);
    this.message = "no elements in sequence";
    this.name = "EmptyError";
    return this;
  }
  EmptyErrorImpl2.prototype = /* @__PURE__ */ Object.create(Error.prototype);
  return EmptyErrorImpl2;
})();
var EmptyError = EmptyErrorImpl;
function map(project, thisArg) {
  return function mapOperation(source) {
    if (typeof project !== "function") {
      throw new TypeError("argument is not a function. Are you looking for `mapTo()`?");
    }
    return source.lift(new MapOperator(project, thisArg));
  };
}
var MapOperator = /* @__PURE__ */ (function() {
  function MapOperator2(project, thisArg) {
    this.project = project;
    this.thisArg = thisArg;
  }
  MapOperator2.prototype.call = function(subscriber, source) {
    return source.subscribe(new MapSubscriber(subscriber, this.project, this.thisArg));
  };
  return MapOperator2;
})();
var MapSubscriber = /* @__PURE__ */ (function(_super) {
  __extends(MapSubscriber2, _super);
  function MapSubscriber2(destination, project, thisArg) {
    var _this = _super.call(this, destination) || this;
    _this.project = project;
    _this.count = 0;
    _this.thisArg = thisArg || _this;
    return _this;
  }
  MapSubscriber2.prototype._next = function(value) {
    var result;
    try {
      result = this.project.call(this.thisArg, value, this.count++);
    } catch (err) {
      this.destination.error(err);
      return;
    }
    this.destination.next(result);
  };
  return MapSubscriber2;
})(Subscriber);
var OuterSubscriber = /* @__PURE__ */ (function(_super) {
  __extends(OuterSubscriber2, _super);
  function OuterSubscriber2() {
    return _super !== null && _super.apply(this, arguments) || this;
  }
  OuterSubscriber2.prototype.notifyNext = function(outerValue, innerValue, outerIndex, innerIndex, innerSub) {
    this.destination.next(innerValue);
  };
  OuterSubscriber2.prototype.notifyError = function(error, innerSub) {
    this.destination.error(error);
  };
  OuterSubscriber2.prototype.notifyComplete = function(innerSub) {
    this.destination.complete();
  };
  return OuterSubscriber2;
})(Subscriber);
var InnerSubscriber = /* @__PURE__ */ (function(_super) {
  __extends(InnerSubscriber2, _super);
  function InnerSubscriber2(parent, outerValue, outerIndex) {
    var _this = _super.call(this) || this;
    _this.parent = parent;
    _this.outerValue = outerValue;
    _this.outerIndex = outerIndex;
    _this.index = 0;
    return _this;
  }
  InnerSubscriber2.prototype._next = function(value) {
    this.parent.notifyNext(this.outerValue, value, this.outerIndex, this.index++, this);
  };
  InnerSubscriber2.prototype._error = function(error) {
    this.parent.notifyError(error, this);
    this.unsubscribe();
  };
  InnerSubscriber2.prototype._complete = function() {
    this.parent.notifyComplete(this);
    this.unsubscribe();
  };
  return InnerSubscriber2;
})(Subscriber);
var subscribeToPromise = function(promise2) {
  return function(subscriber) {
    promise2.then(function(value) {
      if (!subscriber.closed) {
        subscriber.next(value);
        subscriber.complete();
      }
    }, function(err) {
      return subscriber.error(err);
    }).then(null, hostReportError);
    return subscriber;
  };
};
function getSymbolIterator$1() {
  if (typeof Symbol !== "function" || !Symbol.iterator) {
    return "@@iterator";
  }
  return Symbol.iterator;
}
var iterator = /* @__PURE__ */ getSymbolIterator$1();
var subscribeToIterable = function(iterable) {
  return function(subscriber) {
    var iterator$1 = iterable[iterator]();
    do {
      var item = void 0;
      try {
        item = iterator$1.next();
      } catch (err) {
        subscriber.error(err);
        return subscriber;
      }
      if (item.done) {
        subscriber.complete();
        break;
      }
      subscriber.next(item.value);
      if (subscriber.closed) {
        break;
      }
    } while (true);
    if (typeof iterator$1.return === "function") {
      subscriber.add(function() {
        if (iterator$1.return) {
          iterator$1.return();
        }
      });
    }
    return subscriber;
  };
};
var subscribeToObservable = function(obj) {
  return function(subscriber) {
    var obs = obj[observable]();
    if (typeof obs.subscribe !== "function") {
      throw new TypeError("Provided object does not correctly implement Symbol.observable");
    } else {
      return obs.subscribe(subscriber);
    }
  };
};
var isArrayLike = (function(x) {
  return x && typeof x.length === "number" && typeof x !== "function";
});
function isPromise$1(value) {
  return !!value && typeof value.subscribe !== "function" && typeof value.then === "function";
}
var subscribeTo = function(result) {
  if (!!result && typeof result[observable] === "function") {
    return subscribeToObservable(result);
  } else if (isArrayLike(result)) {
    return subscribeToArray(result);
  } else if (isPromise$1(result)) {
    return subscribeToPromise(result);
  } else if (!!result && typeof result[iterator] === "function") {
    return subscribeToIterable(result);
  } else {
    var value = isObject(result) ? "an invalid object" : "'" + result + "'";
    var msg = "You provided " + value + " where a stream was expected. You can provide an Observable, Promise, Array, or Iterable.";
    throw new TypeError(msg);
  }
};
function subscribeToResult(outerSubscriber, result, outerValue, outerIndex, innerSubscriber) {
  if (innerSubscriber === void 0) {
    innerSubscriber = new InnerSubscriber(outerSubscriber, outerValue, outerIndex);
  }
  if (innerSubscriber.closed) {
    return void 0;
  }
  if (result instanceof Observable) {
    return result.subscribe(innerSubscriber);
  }
  return subscribeTo(result)(innerSubscriber);
}
var NONE = {};
function combineLatest() {
  var observables = [];
  for (var _i = 0; _i < arguments.length; _i++) {
    observables[_i] = arguments[_i];
  }
  var resultSelector = void 0;
  var scheduler = void 0;
  if (isScheduler(observables[observables.length - 1])) {
    scheduler = observables.pop();
  }
  if (typeof observables[observables.length - 1] === "function") {
    resultSelector = observables.pop();
  }
  if (observables.length === 1 && isArray(observables[0])) {
    observables = observables[0];
  }
  return fromArray(observables, scheduler).lift(new CombineLatestOperator(resultSelector));
}
var CombineLatestOperator = /* @__PURE__ */ (function() {
  function CombineLatestOperator2(resultSelector) {
    this.resultSelector = resultSelector;
  }
  CombineLatestOperator2.prototype.call = function(subscriber, source) {
    return source.subscribe(new CombineLatestSubscriber(subscriber, this.resultSelector));
  };
  return CombineLatestOperator2;
})();
var CombineLatestSubscriber = /* @__PURE__ */ (function(_super) {
  __extends(CombineLatestSubscriber2, _super);
  function CombineLatestSubscriber2(destination, resultSelector) {
    var _this = _super.call(this, destination) || this;
    _this.resultSelector = resultSelector;
    _this.active = 0;
    _this.values = [];
    _this.observables = [];
    return _this;
  }
  CombineLatestSubscriber2.prototype._next = function(observable2) {
    this.values.push(NONE);
    this.observables.push(observable2);
  };
  CombineLatestSubscriber2.prototype._complete = function() {
    var observables = this.observables;
    var len = observables.length;
    if (len === 0) {
      this.destination.complete();
    } else {
      this.active = len;
      this.toRespond = len;
      for (var i = 0; i < len; i++) {
        var observable2 = observables[i];
        this.add(subscribeToResult(this, observable2, void 0, i));
      }
    }
  };
  CombineLatestSubscriber2.prototype.notifyComplete = function(unused) {
    if ((this.active -= 1) === 0) {
      this.destination.complete();
    }
  };
  CombineLatestSubscriber2.prototype.notifyNext = function(_outerValue, innerValue, outerIndex) {
    var values = this.values;
    var oldVal = values[outerIndex];
    var toRespond = !this.toRespond ? 0 : oldVal === NONE ? --this.toRespond : this.toRespond;
    values[outerIndex] = innerValue;
    if (toRespond === 0) {
      if (this.resultSelector) {
        this._tryResultSelector(values);
      } else {
        this.destination.next(values.slice());
      }
    }
  };
  CombineLatestSubscriber2.prototype._tryResultSelector = function(values) {
    var result;
    try {
      result = this.resultSelector.apply(this, values);
    } catch (err) {
      this.destination.error(err);
      return;
    }
    this.destination.next(result);
  };
  return CombineLatestSubscriber2;
})(OuterSubscriber);
function from(input, scheduler) {
  {
    if (input instanceof Observable) {
      return input;
    }
    return new Observable(subscribeTo(input));
  }
}
var SimpleInnerSubscriber = /* @__PURE__ */ (function(_super) {
  __extends(SimpleInnerSubscriber2, _super);
  function SimpleInnerSubscriber2(parent) {
    var _this = _super.call(this) || this;
    _this.parent = parent;
    return _this;
  }
  SimpleInnerSubscriber2.prototype._next = function(value) {
    this.parent.notifyNext(value);
  };
  SimpleInnerSubscriber2.prototype._error = function(error) {
    this.parent.notifyError(error);
    this.unsubscribe();
  };
  SimpleInnerSubscriber2.prototype._complete = function() {
    this.parent.notifyComplete();
    this.unsubscribe();
  };
  return SimpleInnerSubscriber2;
})(Subscriber);
var SimpleOuterSubscriber = /* @__PURE__ */ (function(_super) {
  __extends(SimpleOuterSubscriber2, _super);
  function SimpleOuterSubscriber2() {
    return _super !== null && _super.apply(this, arguments) || this;
  }
  SimpleOuterSubscriber2.prototype.notifyNext = function(innerValue) {
    this.destination.next(innerValue);
  };
  SimpleOuterSubscriber2.prototype.notifyError = function(err) {
    this.destination.error(err);
  };
  SimpleOuterSubscriber2.prototype.notifyComplete = function() {
    this.destination.complete();
  };
  return SimpleOuterSubscriber2;
})(Subscriber);
function innerSubscribe(result, innerSubscriber) {
  if (innerSubscriber.closed) {
    return void 0;
  }
  if (result instanceof Observable) {
    return result.subscribe(innerSubscriber);
  }
  var subscription;
  try {
    subscription = subscribeTo(result)(innerSubscriber);
  } catch (error) {
    innerSubscriber.error(error);
  }
  return subscription;
}
function mergeMap(project, resultSelector, concurrent) {
  if (concurrent === void 0) {
    concurrent = Number.POSITIVE_INFINITY;
  }
  if (typeof resultSelector === "function") {
    return function(source) {
      return source.pipe(mergeMap(function(a, i) {
        return from(project(a, i)).pipe(map(function(b, ii) {
          return resultSelector(a, b, i, ii);
        }));
      }, concurrent));
    };
  } else if (typeof resultSelector === "number") {
    concurrent = resultSelector;
  }
  return function(source) {
    return source.lift(new MergeMapOperator(project, concurrent));
  };
}
var MergeMapOperator = /* @__PURE__ */ (function() {
  function MergeMapOperator2(project, concurrent) {
    if (concurrent === void 0) {
      concurrent = Number.POSITIVE_INFINITY;
    }
    this.project = project;
    this.concurrent = concurrent;
  }
  MergeMapOperator2.prototype.call = function(observer, source) {
    return source.subscribe(new MergeMapSubscriber(observer, this.project, this.concurrent));
  };
  return MergeMapOperator2;
})();
var MergeMapSubscriber = /* @__PURE__ */ (function(_super) {
  __extends(MergeMapSubscriber2, _super);
  function MergeMapSubscriber2(destination, project, concurrent) {
    if (concurrent === void 0) {
      concurrent = Number.POSITIVE_INFINITY;
    }
    var _this = _super.call(this, destination) || this;
    _this.project = project;
    _this.concurrent = concurrent;
    _this.hasCompleted = false;
    _this.buffer = [];
    _this.active = 0;
    _this.index = 0;
    return _this;
  }
  MergeMapSubscriber2.prototype._next = function(value) {
    if (this.active < this.concurrent) {
      this._tryNext(value);
    } else {
      this.buffer.push(value);
    }
  };
  MergeMapSubscriber2.prototype._tryNext = function(value) {
    var result;
    var index = this.index++;
    try {
      result = this.project(value, index);
    } catch (err) {
      this.destination.error(err);
      return;
    }
    this.active++;
    this._innerSub(result);
  };
  MergeMapSubscriber2.prototype._innerSub = function(ish) {
    var innerSubscriber = new SimpleInnerSubscriber(this);
    var destination = this.destination;
    destination.add(innerSubscriber);
    var innerSubscription = innerSubscribe(ish, innerSubscriber);
    if (innerSubscription !== innerSubscriber) {
      destination.add(innerSubscription);
    }
  };
  MergeMapSubscriber2.prototype._complete = function() {
    this.hasCompleted = true;
    if (this.active === 0 && this.buffer.length === 0) {
      this.destination.complete();
    }
    this.unsubscribe();
  };
  MergeMapSubscriber2.prototype.notifyNext = function(innerValue) {
    this.destination.next(innerValue);
  };
  MergeMapSubscriber2.prototype.notifyComplete = function() {
    var buffer = this.buffer;
    this.active--;
    if (buffer.length > 0) {
      this._next(buffer.shift());
    } else if (this.active === 0 && this.hasCompleted) {
      this.destination.complete();
    }
  };
  return MergeMapSubscriber2;
})(SimpleOuterSubscriber);
function mergeAll(concurrent) {
  if (concurrent === void 0) {
    concurrent = Number.POSITIVE_INFINITY;
  }
  return mergeMap(identity, concurrent);
}
function concatAll() {
  return mergeAll(1);
}
function concat() {
  var observables = [];
  for (var _i = 0; _i < arguments.length; _i++) {
    observables[_i] = arguments[_i];
  }
  return concatAll()(of.apply(void 0, observables));
}
function defer(observableFactory) {
  return new Observable(function(subscriber) {
    var input;
    try {
      input = observableFactory();
    } catch (err) {
      subscriber.error(err);
      return void 0;
    }
    var source = input ? from(input) : empty();
    return source.subscribe(subscriber);
  });
}
function isNumeric(val) {
  return !isArray(val) && val - parseFloat(val) + 1 >= 0;
}
function merge$1() {
  var observables = [];
  for (var _i = 0; _i < arguments.length; _i++) {
    observables[_i] = arguments[_i];
  }
  var concurrent = Number.POSITIVE_INFINITY;
  var scheduler = null;
  var last2 = observables[observables.length - 1];
  if (isScheduler(last2)) {
    scheduler = observables.pop();
    if (observables.length > 1 && typeof observables[observables.length - 1] === "number") {
      concurrent = observables.pop();
    }
  } else if (typeof last2 === "number") {
    concurrent = observables.pop();
  }
  if (scheduler === null && observables.length === 1 && observables[0] instanceof Observable) {
    return observables[0];
  }
  return mergeAll(concurrent)(fromArray(observables, scheduler));
}
function filter(predicate, thisArg) {
  return function filterOperatorFunction(source) {
    return source.lift(new FilterOperator(predicate, thisArg));
  };
}
var FilterOperator = /* @__PURE__ */ (function() {
  function FilterOperator2(predicate, thisArg) {
    this.predicate = predicate;
    this.thisArg = thisArg;
  }
  FilterOperator2.prototype.call = function(subscriber, source) {
    return source.subscribe(new FilterSubscriber(subscriber, this.predicate, this.thisArg));
  };
  return FilterOperator2;
})();
var FilterSubscriber = /* @__PURE__ */ (function(_super) {
  __extends(FilterSubscriber2, _super);
  function FilterSubscriber2(destination, predicate, thisArg) {
    var _this = _super.call(this, destination) || this;
    _this.predicate = predicate;
    _this.thisArg = thisArg;
    _this.count = 0;
    return _this;
  }
  FilterSubscriber2.prototype._next = function(value) {
    var result;
    try {
      result = this.predicate.call(this.thisArg, value, this.count++);
    } catch (err) {
      this.destination.error(err);
      return;
    }
    if (result) {
      this.destination.next(value);
    }
  };
  return FilterSubscriber2;
})(Subscriber);
function race() {
  var observables = [];
  for (var _i = 0; _i < arguments.length; _i++) {
    observables[_i] = arguments[_i];
  }
  if (observables.length === 1) {
    if (isArray(observables[0])) {
      observables = observables[0];
    } else {
      return observables[0];
    }
  }
  return fromArray(observables, void 0).lift(new RaceOperator());
}
var RaceOperator = /* @__PURE__ */ (function() {
  function RaceOperator2() {
  }
  RaceOperator2.prototype.call = function(subscriber, source) {
    return source.subscribe(new RaceSubscriber(subscriber));
  };
  return RaceOperator2;
})();
var RaceSubscriber = /* @__PURE__ */ (function(_super) {
  __extends(RaceSubscriber2, _super);
  function RaceSubscriber2(destination) {
    var _this = _super.call(this, destination) || this;
    _this.hasFirst = false;
    _this.observables = [];
    _this.subscriptions = [];
    return _this;
  }
  RaceSubscriber2.prototype._next = function(observable2) {
    this.observables.push(observable2);
  };
  RaceSubscriber2.prototype._complete = function() {
    var observables = this.observables;
    var len = observables.length;
    if (len === 0) {
      this.destination.complete();
    } else {
      for (var i = 0; i < len && !this.hasFirst; i++) {
        var observable2 = observables[i];
        var subscription = subscribeToResult(this, observable2, void 0, i);
        if (this.subscriptions) {
          this.subscriptions.push(subscription);
        }
        this.add(subscription);
      }
      this.observables = null;
    }
  };
  RaceSubscriber2.prototype.notifyNext = function(_outerValue, innerValue, outerIndex) {
    if (!this.hasFirst) {
      this.hasFirst = true;
      for (var i = 0; i < this.subscriptions.length; i++) {
        if (i !== outerIndex) {
          var subscription = this.subscriptions[i];
          subscription.unsubscribe();
          this.remove(subscription);
        }
      }
      this.subscriptions = null;
    }
    this.destination.next(innerValue);
  };
  return RaceSubscriber2;
})(OuterSubscriber);
function timer(dueTime, periodOrScheduler, scheduler) {
  if (dueTime === void 0) {
    dueTime = 0;
  }
  var period = -1;
  if (isNumeric(periodOrScheduler)) {
    period = Number(periodOrScheduler) < 1 && 1 || Number(periodOrScheduler);
  } else if (isScheduler(periodOrScheduler)) {
    scheduler = periodOrScheduler;
  }
  if (!isScheduler(scheduler)) {
    scheduler = async;
  }
  return new Observable(function(subscriber) {
    var due = isNumeric(dueTime) ? dueTime : +dueTime - scheduler.now();
    return scheduler.schedule(dispatch, due, {
      index: 0,
      period,
      subscriber
    });
  });
}
function dispatch(state) {
  var index = state.index, period = state.period, subscriber = state.subscriber;
  subscriber.next(index);
  if (subscriber.closed) {
    return;
  } else if (period === -1) {
    return subscriber.complete();
  }
  state.index = index + 1;
  this.schedule(state, period);
}
function zip() {
  var observables = [];
  for (var _i = 0; _i < arguments.length; _i++) {
    observables[_i] = arguments[_i];
  }
  var resultSelector = observables[observables.length - 1];
  if (typeof resultSelector === "function") {
    observables.pop();
  }
  return fromArray(observables, void 0).lift(new ZipOperator(resultSelector));
}
var ZipOperator = /* @__PURE__ */ (function() {
  function ZipOperator2(resultSelector) {
    this.resultSelector = resultSelector;
  }
  ZipOperator2.prototype.call = function(subscriber, source) {
    return source.subscribe(new ZipSubscriber(subscriber, this.resultSelector));
  };
  return ZipOperator2;
})();
var ZipSubscriber = /* @__PURE__ */ (function(_super) {
  __extends(ZipSubscriber2, _super);
  function ZipSubscriber2(destination, resultSelector, values) {
    var _this = _super.call(this, destination) || this;
    _this.resultSelector = resultSelector;
    _this.iterators = [];
    _this.active = 0;
    _this.resultSelector = typeof resultSelector === "function" ? resultSelector : void 0;
    return _this;
  }
  ZipSubscriber2.prototype._next = function(value) {
    var iterators = this.iterators;
    if (isArray(value)) {
      iterators.push(new StaticArrayIterator(value));
    } else if (typeof value[iterator] === "function") {
      iterators.push(new StaticIterator(value[iterator]()));
    } else {
      iterators.push(new ZipBufferIterator(this.destination, this, value));
    }
  };
  ZipSubscriber2.prototype._complete = function() {
    var iterators = this.iterators;
    var len = iterators.length;
    this.unsubscribe();
    if (len === 0) {
      this.destination.complete();
      return;
    }
    this.active = len;
    for (var i = 0; i < len; i++) {
      var iterator2 = iterators[i];
      if (iterator2.stillUnsubscribed) {
        var destination = this.destination;
        destination.add(iterator2.subscribe());
      } else {
        this.active--;
      }
    }
  };
  ZipSubscriber2.prototype.notifyInactive = function() {
    this.active--;
    if (this.active === 0) {
      this.destination.complete();
    }
  };
  ZipSubscriber2.prototype.checkIterators = function() {
    var iterators = this.iterators;
    var len = iterators.length;
    var destination = this.destination;
    for (var i = 0; i < len; i++) {
      var iterator2 = iterators[i];
      if (typeof iterator2.hasValue === "function" && !iterator2.hasValue()) {
        return;
      }
    }
    var shouldComplete = false;
    var args = [];
    for (var i = 0; i < len; i++) {
      var iterator2 = iterators[i];
      var result = iterator2.next();
      if (iterator2.hasCompleted()) {
        shouldComplete = true;
      }
      if (result.done) {
        destination.complete();
        return;
      }
      args.push(result.value);
    }
    if (this.resultSelector) {
      this._tryresultSelector(args);
    } else {
      destination.next(args);
    }
    if (shouldComplete) {
      destination.complete();
    }
  };
  ZipSubscriber2.prototype._tryresultSelector = function(args) {
    var result;
    try {
      result = this.resultSelector.apply(this, args);
    } catch (err) {
      this.destination.error(err);
      return;
    }
    this.destination.next(result);
  };
  return ZipSubscriber2;
})(Subscriber);
var StaticIterator = /* @__PURE__ */ (function() {
  function StaticIterator2(iterator2) {
    this.iterator = iterator2;
    this.nextResult = iterator2.next();
  }
  StaticIterator2.prototype.hasValue = function() {
    return true;
  };
  StaticIterator2.prototype.next = function() {
    var result = this.nextResult;
    this.nextResult = this.iterator.next();
    return result;
  };
  StaticIterator2.prototype.hasCompleted = function() {
    var nextResult = this.nextResult;
    return Boolean(nextResult && nextResult.done);
  };
  return StaticIterator2;
})();
var StaticArrayIterator = /* @__PURE__ */ (function() {
  function StaticArrayIterator2(array) {
    this.array = array;
    this.index = 0;
    this.length = 0;
    this.length = array.length;
  }
  StaticArrayIterator2.prototype[iterator] = function() {
    return this;
  };
  StaticArrayIterator2.prototype.next = function(value) {
    var i = this.index++;
    var array = this.array;
    return i < this.length ? { value: array[i], done: false } : { value: null, done: true };
  };
  StaticArrayIterator2.prototype.hasValue = function() {
    return this.array.length > this.index;
  };
  StaticArrayIterator2.prototype.hasCompleted = function() {
    return this.array.length === this.index;
  };
  return StaticArrayIterator2;
})();
var ZipBufferIterator = /* @__PURE__ */ (function(_super) {
  __extends(ZipBufferIterator2, _super);
  function ZipBufferIterator2(destination, parent, observable2) {
    var _this = _super.call(this, destination) || this;
    _this.parent = parent;
    _this.observable = observable2;
    _this.stillUnsubscribed = true;
    _this.buffer = [];
    _this.isComplete = false;
    return _this;
  }
  ZipBufferIterator2.prototype[iterator] = function() {
    return this;
  };
  ZipBufferIterator2.prototype.next = function() {
    var buffer = this.buffer;
    if (buffer.length === 0 && this.isComplete) {
      return { value: null, done: true };
    } else {
      return { value: buffer.shift(), done: false };
    }
  };
  ZipBufferIterator2.prototype.hasValue = function() {
    return this.buffer.length > 0;
  };
  ZipBufferIterator2.prototype.hasCompleted = function() {
    return this.buffer.length === 0 && this.isComplete;
  };
  ZipBufferIterator2.prototype.notifyComplete = function() {
    if (this.buffer.length > 0) {
      this.isComplete = true;
      this.parent.notifyInactive();
    } else {
      this.destination.complete();
    }
  };
  ZipBufferIterator2.prototype.notifyNext = function(innerValue) {
    this.buffer.push(innerValue);
    this.parent.checkIterators();
  };
  ZipBufferIterator2.prototype.subscribe = function() {
    return innerSubscribe(this.observable, new SimpleInnerSubscriber(this));
  };
  return ZipBufferIterator2;
})(SimpleOuterSubscriber);
function audit(durationSelector) {
  return function auditOperatorFunction(source) {
    return source.lift(new AuditOperator(durationSelector));
  };
}
var AuditOperator = /* @__PURE__ */ (function() {
  function AuditOperator2(durationSelector) {
    this.durationSelector = durationSelector;
  }
  AuditOperator2.prototype.call = function(subscriber, source) {
    return source.subscribe(new AuditSubscriber(subscriber, this.durationSelector));
  };
  return AuditOperator2;
})();
var AuditSubscriber = /* @__PURE__ */ (function(_super) {
  __extends(AuditSubscriber2, _super);
  function AuditSubscriber2(destination, durationSelector) {
    var _this = _super.call(this, destination) || this;
    _this.durationSelector = durationSelector;
    _this.hasValue = false;
    return _this;
  }
  AuditSubscriber2.prototype._next = function(value) {
    this.value = value;
    this.hasValue = true;
    if (!this.throttled) {
      var duration = void 0;
      try {
        var durationSelector = this.durationSelector;
        duration = durationSelector(value);
      } catch (err) {
        return this.destination.error(err);
      }
      var innerSubscription = innerSubscribe(duration, new SimpleInnerSubscriber(this));
      if (!innerSubscription || innerSubscription.closed) {
        this.clearThrottle();
      } else {
        this.add(this.throttled = innerSubscription);
      }
    }
  };
  AuditSubscriber2.prototype.clearThrottle = function() {
    var _a = this, value = _a.value, hasValue = _a.hasValue, throttled = _a.throttled;
    if (throttled) {
      this.remove(throttled);
      this.throttled = void 0;
      throttled.unsubscribe();
    }
    if (hasValue) {
      this.value = void 0;
      this.hasValue = false;
      this.destination.next(value);
    }
  };
  AuditSubscriber2.prototype.notifyNext = function() {
    this.clearThrottle();
  };
  AuditSubscriber2.prototype.notifyComplete = function() {
    this.clearThrottle();
  };
  return AuditSubscriber2;
})(SimpleOuterSubscriber);
function auditTime(duration, scheduler) {
  if (scheduler === void 0) {
    scheduler = async;
  }
  return audit(function() {
    return timer(duration, scheduler);
  });
}
function catchError(selector) {
  return function catchErrorOperatorFunction(source) {
    var operator = new CatchOperator(selector);
    var caught = source.lift(operator);
    return operator.caught = caught;
  };
}
var CatchOperator = /* @__PURE__ */ (function() {
  function CatchOperator2(selector) {
    this.selector = selector;
  }
  CatchOperator2.prototype.call = function(subscriber, source) {
    return source.subscribe(new CatchSubscriber(subscriber, this.selector, this.caught));
  };
  return CatchOperator2;
})();
var CatchSubscriber = /* @__PURE__ */ (function(_super) {
  __extends(CatchSubscriber2, _super);
  function CatchSubscriber2(destination, selector, caught) {
    var _this = _super.call(this, destination) || this;
    _this.selector = selector;
    _this.caught = caught;
    return _this;
  }
  CatchSubscriber2.prototype.error = function(err) {
    if (!this.isStopped) {
      var result = void 0;
      try {
        result = this.selector(err, this.caught);
      } catch (err2) {
        _super.prototype.error.call(this, err2);
        return;
      }
      this._unsubscribeAndRecycle();
      var innerSubscriber = new SimpleInnerSubscriber(this);
      this.add(innerSubscriber);
      var innerSubscription = innerSubscribe(result, innerSubscriber);
      if (innerSubscription !== innerSubscriber) {
        this.add(innerSubscription);
      }
    }
  };
  return CatchSubscriber2;
})(SimpleOuterSubscriber);
function concatMap(project, resultSelector) {
  return mergeMap(project, resultSelector, 1);
}
function debounceTime(dueTime, scheduler) {
  if (scheduler === void 0) {
    scheduler = async;
  }
  return function(source) {
    return source.lift(new DebounceTimeOperator(dueTime, scheduler));
  };
}
var DebounceTimeOperator = /* @__PURE__ */ (function() {
  function DebounceTimeOperator2(dueTime, scheduler) {
    this.dueTime = dueTime;
    this.scheduler = scheduler;
  }
  DebounceTimeOperator2.prototype.call = function(subscriber, source) {
    return source.subscribe(new DebounceTimeSubscriber(subscriber, this.dueTime, this.scheduler));
  };
  return DebounceTimeOperator2;
})();
var DebounceTimeSubscriber = /* @__PURE__ */ (function(_super) {
  __extends(DebounceTimeSubscriber2, _super);
  function DebounceTimeSubscriber2(destination, dueTime, scheduler) {
    var _this = _super.call(this, destination) || this;
    _this.dueTime = dueTime;
    _this.scheduler = scheduler;
    _this.debouncedSubscription = null;
    _this.lastValue = null;
    _this.hasValue = false;
    return _this;
  }
  DebounceTimeSubscriber2.prototype._next = function(value) {
    this.clearDebounce();
    this.lastValue = value;
    this.hasValue = true;
    this.add(this.debouncedSubscription = this.scheduler.schedule(dispatchNext, this.dueTime, this));
  };
  DebounceTimeSubscriber2.prototype._complete = function() {
    this.debouncedNext();
    this.destination.complete();
  };
  DebounceTimeSubscriber2.prototype.debouncedNext = function() {
    this.clearDebounce();
    if (this.hasValue) {
      var lastValue = this.lastValue;
      this.lastValue = null;
      this.hasValue = false;
      this.destination.next(lastValue);
    }
  };
  DebounceTimeSubscriber2.prototype.clearDebounce = function() {
    var debouncedSubscription = this.debouncedSubscription;
    if (debouncedSubscription !== null) {
      this.remove(debouncedSubscription);
      debouncedSubscription.unsubscribe();
      this.debouncedSubscription = null;
    }
  };
  return DebounceTimeSubscriber2;
})(Subscriber);
function dispatchNext(subscriber) {
  subscriber.debouncedNext();
}
function defaultIfEmpty(defaultValue) {
  if (defaultValue === void 0) {
    defaultValue = null;
  }
  return function(source) {
    return source.lift(new DefaultIfEmptyOperator(defaultValue));
  };
}
var DefaultIfEmptyOperator = /* @__PURE__ */ (function() {
  function DefaultIfEmptyOperator2(defaultValue) {
    this.defaultValue = defaultValue;
  }
  DefaultIfEmptyOperator2.prototype.call = function(subscriber, source) {
    return source.subscribe(new DefaultIfEmptySubscriber(subscriber, this.defaultValue));
  };
  return DefaultIfEmptyOperator2;
})();
var DefaultIfEmptySubscriber = /* @__PURE__ */ (function(_super) {
  __extends(DefaultIfEmptySubscriber2, _super);
  function DefaultIfEmptySubscriber2(destination, defaultValue) {
    var _this = _super.call(this, destination) || this;
    _this.defaultValue = defaultValue;
    _this.isEmpty = true;
    return _this;
  }
  DefaultIfEmptySubscriber2.prototype._next = function(value) {
    this.isEmpty = false;
    this.destination.next(value);
  };
  DefaultIfEmptySubscriber2.prototype._complete = function() {
    if (this.isEmpty) {
      this.destination.next(this.defaultValue);
    }
    this.destination.complete();
  };
  return DefaultIfEmptySubscriber2;
})(Subscriber);
function isDate$1(value) {
  return value instanceof Date && !isNaN(+value);
}
function delay(delay2, scheduler) {
  if (scheduler === void 0) {
    scheduler = async;
  }
  var absoluteDelay = isDate$1(delay2);
  var delayFor = absoluteDelay ? +delay2 - scheduler.now() : Math.abs(delay2);
  return function(source) {
    return source.lift(new DelayOperator(delayFor, scheduler));
  };
}
var DelayOperator = /* @__PURE__ */ (function() {
  function DelayOperator2(delay2, scheduler) {
    this.delay = delay2;
    this.scheduler = scheduler;
  }
  DelayOperator2.prototype.call = function(subscriber, source) {
    return source.subscribe(new DelaySubscriber(subscriber, this.delay, this.scheduler));
  };
  return DelayOperator2;
})();
var DelaySubscriber = /* @__PURE__ */ (function(_super) {
  __extends(DelaySubscriber2, _super);
  function DelaySubscriber2(destination, delay2, scheduler) {
    var _this = _super.call(this, destination) || this;
    _this.delay = delay2;
    _this.scheduler = scheduler;
    _this.queue = [];
    _this.active = false;
    _this.errored = false;
    return _this;
  }
  DelaySubscriber2.dispatch = function(state) {
    var source = state.source;
    var queue2 = source.queue;
    var scheduler = state.scheduler;
    var destination = state.destination;
    while (queue2.length > 0 && queue2[0].time - scheduler.now() <= 0) {
      queue2.shift().notification.observe(destination);
    }
    if (queue2.length > 0) {
      var delay_1 = Math.max(0, queue2[0].time - scheduler.now());
      this.schedule(state, delay_1);
    } else {
      this.unsubscribe();
      source.active = false;
    }
  };
  DelaySubscriber2.prototype._schedule = function(scheduler) {
    this.active = true;
    var destination = this.destination;
    destination.add(scheduler.schedule(DelaySubscriber2.dispatch, this.delay, {
      source: this,
      destination: this.destination,
      scheduler
    }));
  };
  DelaySubscriber2.prototype.scheduleNotification = function(notification) {
    if (this.errored === true) {
      return;
    }
    var scheduler = this.scheduler;
    var message = new DelayMessage(scheduler.now() + this.delay, notification);
    this.queue.push(message);
    if (this.active === false) {
      this._schedule(scheduler);
    }
  };
  DelaySubscriber2.prototype._next = function(value) {
    this.scheduleNotification(Notification.createNext(value));
  };
  DelaySubscriber2.prototype._error = function(err) {
    this.errored = true;
    this.queue = [];
    this.destination.error(err);
    this.unsubscribe();
  };
  DelaySubscriber2.prototype._complete = function() {
    this.scheduleNotification(Notification.createComplete());
    this.unsubscribe();
  };
  return DelaySubscriber2;
})(Subscriber);
var DelayMessage = /* @__PURE__ */ (function() {
  function DelayMessage2(time, notification) {
    this.time = time;
    this.notification = notification;
  }
  return DelayMessage2;
})();
function distinctUntilChanged(compare, keySelector) {
  return function(source) {
    return source.lift(new DistinctUntilChangedOperator(compare, keySelector));
  };
}
var DistinctUntilChangedOperator = /* @__PURE__ */ (function() {
  function DistinctUntilChangedOperator2(compare, keySelector) {
    this.compare = compare;
    this.keySelector = keySelector;
  }
  DistinctUntilChangedOperator2.prototype.call = function(subscriber, source) {
    return source.subscribe(new DistinctUntilChangedSubscriber(subscriber, this.compare, this.keySelector));
  };
  return DistinctUntilChangedOperator2;
})();
var DistinctUntilChangedSubscriber = /* @__PURE__ */ (function(_super) {
  __extends(DistinctUntilChangedSubscriber2, _super);
  function DistinctUntilChangedSubscriber2(destination, compare, keySelector) {
    var _this = _super.call(this, destination) || this;
    _this.keySelector = keySelector;
    _this.hasKey = false;
    if (typeof compare === "function") {
      _this.compare = compare;
    }
    return _this;
  }
  DistinctUntilChangedSubscriber2.prototype.compare = function(x, y) {
    return x === y;
  };
  DistinctUntilChangedSubscriber2.prototype._next = function(value) {
    var key;
    try {
      var keySelector = this.keySelector;
      key = keySelector ? keySelector(value) : value;
    } catch (err) {
      return this.destination.error(err);
    }
    var result = false;
    if (this.hasKey) {
      try {
        var compare = this.compare;
        result = compare(this.key, key);
      } catch (err) {
        return this.destination.error(err);
      }
    } else {
      this.hasKey = true;
    }
    if (!result) {
      this.key = key;
      this.destination.next(value);
    }
  };
  return DistinctUntilChangedSubscriber2;
})(Subscriber);
function throwIfEmpty(errorFactory) {
  if (errorFactory === void 0) {
    errorFactory = defaultErrorFactory;
  }
  return function(source) {
    return source.lift(new ThrowIfEmptyOperator(errorFactory));
  };
}
var ThrowIfEmptyOperator = /* @__PURE__ */ (function() {
  function ThrowIfEmptyOperator2(errorFactory) {
    this.errorFactory = errorFactory;
  }
  ThrowIfEmptyOperator2.prototype.call = function(subscriber, source) {
    return source.subscribe(new ThrowIfEmptySubscriber(subscriber, this.errorFactory));
  };
  return ThrowIfEmptyOperator2;
})();
var ThrowIfEmptySubscriber = /* @__PURE__ */ (function(_super) {
  __extends(ThrowIfEmptySubscriber2, _super);
  function ThrowIfEmptySubscriber2(destination, errorFactory) {
    var _this = _super.call(this, destination) || this;
    _this.errorFactory = errorFactory;
    _this.hasValue = false;
    return _this;
  }
  ThrowIfEmptySubscriber2.prototype._next = function(value) {
    this.hasValue = true;
    this.destination.next(value);
  };
  ThrowIfEmptySubscriber2.prototype._complete = function() {
    if (!this.hasValue) {
      var err = void 0;
      try {
        err = this.errorFactory();
      } catch (e) {
        err = e;
      }
      this.destination.error(err);
    } else {
      return this.destination.complete();
    }
  };
  return ThrowIfEmptySubscriber2;
})(Subscriber);
function defaultErrorFactory() {
  return new EmptyError();
}
function take(count) {
  return function(source) {
    {
      return source.lift(new TakeOperator(count));
    }
  };
}
var TakeOperator = /* @__PURE__ */ (function() {
  function TakeOperator2(total) {
    this.total = total;
    if (this.total < 0) {
      throw new ArgumentOutOfRangeError();
    }
  }
  TakeOperator2.prototype.call = function(subscriber, source) {
    return source.subscribe(new TakeSubscriber(subscriber, this.total));
  };
  return TakeOperator2;
})();
var TakeSubscriber = /* @__PURE__ */ (function(_super) {
  __extends(TakeSubscriber2, _super);
  function TakeSubscriber2(destination, total) {
    var _this = _super.call(this, destination) || this;
    _this.total = total;
    _this.count = 0;
    return _this;
  }
  TakeSubscriber2.prototype._next = function(value) {
    var total = this.total;
    var count = ++this.count;
    if (count <= total) {
      this.destination.next(value);
      if (count === total) {
        this.destination.complete();
        this.unsubscribe();
      }
    }
  };
  return TakeSubscriber2;
})(Subscriber);
function endWith() {
  var array = [];
  for (var _i = 0; _i < arguments.length; _i++) {
    array[_i] = arguments[_i];
  }
  return function(source) {
    return concat(source, of.apply(void 0, array));
  };
}
function finalize(callback) {
  return function(source) {
    return source.lift(new FinallyOperator(callback));
  };
}
var FinallyOperator = /* @__PURE__ */ (function() {
  function FinallyOperator2(callback) {
    this.callback = callback;
  }
  FinallyOperator2.prototype.call = function(subscriber, source) {
    return source.subscribe(new FinallySubscriber(subscriber, this.callback));
  };
  return FinallyOperator2;
})();
var FinallySubscriber = /* @__PURE__ */ (function(_super) {
  __extends(FinallySubscriber2, _super);
  function FinallySubscriber2(destination, callback) {
    var _this = _super.call(this, destination) || this;
    _this.add(new Subscription(callback));
    return _this;
  }
  return FinallySubscriber2;
})(Subscriber);
function first(predicate, defaultValue) {
  var hasDefaultValue = arguments.length >= 2;
  return function(source) {
    return source.pipe(predicate ? filter(function(v, i) {
      return predicate(v, i, source);
    }) : identity, take(1), hasDefaultValue ? defaultIfEmpty(defaultValue) : throwIfEmpty(function() {
      return new EmptyError();
    }));
  };
}
function takeLast(count) {
  return function takeLastOperatorFunction(source) {
    {
      return source.lift(new TakeLastOperator(count));
    }
  };
}
var TakeLastOperator = /* @__PURE__ */ (function() {
  function TakeLastOperator2(total) {
    this.total = total;
    if (this.total < 0) {
      throw new ArgumentOutOfRangeError();
    }
  }
  TakeLastOperator2.prototype.call = function(subscriber, source) {
    return source.subscribe(new TakeLastSubscriber(subscriber, this.total));
  };
  return TakeLastOperator2;
})();
var TakeLastSubscriber = /* @__PURE__ */ (function(_super) {
  __extends(TakeLastSubscriber2, _super);
  function TakeLastSubscriber2(destination, total) {
    var _this = _super.call(this, destination) || this;
    _this.total = total;
    _this.ring = new Array();
    _this.count = 0;
    return _this;
  }
  TakeLastSubscriber2.prototype._next = function(value) {
    var ring = this.ring;
    var total = this.total;
    var count = this.count++;
    if (ring.length < total) {
      ring.push(value);
    } else {
      var index = count % total;
      ring[index] = value;
    }
  };
  TakeLastSubscriber2.prototype._complete = function() {
    var destination = this.destination;
    var count = this.count;
    if (count > 0) {
      var total = this.count >= this.total ? this.total : this.count;
      var ring = this.ring;
      for (var i = 0; i < total; i++) {
        var idx = count++ % total;
        destination.next(ring[idx]);
      }
    }
    destination.complete();
  };
  return TakeLastSubscriber2;
})(Subscriber);
function last(predicate, defaultValue) {
  var hasDefaultValue = arguments.length >= 2;
  return function(source) {
    return source.pipe(identity, takeLast(1), hasDefaultValue ? defaultIfEmpty(defaultValue) : throwIfEmpty(function() {
      return new EmptyError();
    }));
  };
}
function scan(accumulator, seed) {
  var hasSeed = false;
  if (arguments.length >= 2) {
    hasSeed = true;
  }
  return function scanOperatorFunction(source) {
    return source.lift(new ScanOperator(accumulator, seed, hasSeed));
  };
}
var ScanOperator = /* @__PURE__ */ (function() {
  function ScanOperator2(accumulator, seed, hasSeed) {
    if (hasSeed === void 0) {
      hasSeed = false;
    }
    this.accumulator = accumulator;
    this.seed = seed;
    this.hasSeed = hasSeed;
  }
  ScanOperator2.prototype.call = function(subscriber, source) {
    return source.subscribe(new ScanSubscriber(subscriber, this.accumulator, this.seed, this.hasSeed));
  };
  return ScanOperator2;
})();
var ScanSubscriber = /* @__PURE__ */ (function(_super) {
  __extends(ScanSubscriber2, _super);
  function ScanSubscriber2(destination, accumulator, _seed, hasSeed) {
    var _this = _super.call(this, destination) || this;
    _this.accumulator = accumulator;
    _this._seed = _seed;
    _this.hasSeed = hasSeed;
    _this.index = 0;
    return _this;
  }
  Object.defineProperty(ScanSubscriber2.prototype, "seed", {
    get: function() {
      return this._seed;
    },
    set: function(value) {
      this.hasSeed = true;
      this._seed = value;
    },
    enumerable: true,
    configurable: true
  });
  ScanSubscriber2.prototype._next = function(value) {
    if (!this.hasSeed) {
      this.seed = value;
      this.destination.next(value);
    } else {
      return this._tryNext(value);
    }
  };
  ScanSubscriber2.prototype._tryNext = function(value) {
    var index = this.index++;
    var result;
    try {
      result = this.accumulator(this.seed, value, index);
    } catch (err) {
      this.destination.error(err);
    }
    this.seed = result;
    this.destination.next(result);
  };
  return ScanSubscriber2;
})(Subscriber);
function multicast(subjectOrSubjectFactory, selector) {
  return function multicastOperatorFunction(source) {
    var subjectFactory;
    if (typeof subjectOrSubjectFactory === "function") {
      subjectFactory = subjectOrSubjectFactory;
    } else {
      subjectFactory = function subjectFactory2() {
        return subjectOrSubjectFactory;
      };
    }
    var connectable = Object.create(source, connectableObservableDescriptor);
    connectable.source = source;
    connectable.subjectFactory = subjectFactory;
    return connectable;
  };
}
function pairwise() {
  return function(source) {
    return source.lift(new PairwiseOperator());
  };
}
var PairwiseOperator = /* @__PURE__ */ (function() {
  function PairwiseOperator2() {
  }
  PairwiseOperator2.prototype.call = function(subscriber, source) {
    return source.subscribe(new PairwiseSubscriber(subscriber));
  };
  return PairwiseOperator2;
})();
var PairwiseSubscriber = /* @__PURE__ */ (function(_super) {
  __extends(PairwiseSubscriber2, _super);
  function PairwiseSubscriber2(destination) {
    var _this = _super.call(this, destination) || this;
    _this.hasPrev = false;
    return _this;
  }
  PairwiseSubscriber2.prototype._next = function(value) {
    var pair;
    if (this.hasPrev) {
      pair = [this.prev, value];
    } else {
      this.hasPrev = true;
    }
    this.prev = value;
    if (pair) {
      this.destination.next(pair);
    }
  };
  return PairwiseSubscriber2;
})(Subscriber);
function shareSubjectFactory() {
  return new Subject();
}
function share() {
  return function(source) {
    return refCount()(multicast(shareSubjectFactory)(source));
  };
}
function shareReplay(configOrBufferSize, windowTime, scheduler) {
  var config2;
  {
    config2 = {
      bufferSize: configOrBufferSize,
      windowTime,
      refCount: false,
      scheduler
    };
  }
  return function(source) {
    return source.lift(shareReplayOperator(config2));
  };
}
function shareReplayOperator(_a) {
  var _b = _a.bufferSize, bufferSize = _b === void 0 ? Number.POSITIVE_INFINITY : _b, _c = _a.windowTime, windowTime = _c === void 0 ? Number.POSITIVE_INFINITY : _c, useRefCount = _a.refCount, scheduler = _a.scheduler;
  var subject;
  var refCount2 = 0;
  var subscription;
  var hasError = false;
  var isComplete = false;
  return function shareReplayOperation(source) {
    refCount2++;
    var innerSub;
    if (!subject || hasError) {
      hasError = false;
      subject = new ReplaySubject(bufferSize, windowTime, scheduler);
      innerSub = subject.subscribe(this);
      subscription = source.subscribe({
        next: function(value) {
          subject.next(value);
        },
        error: function(err) {
          hasError = true;
          subject.error(err);
        },
        complete: function() {
          isComplete = true;
          subscription = void 0;
          subject.complete();
        }
      });
      if (isComplete) {
        subscription = void 0;
      }
    } else {
      innerSub = subject.subscribe(this);
    }
    this.add(function() {
      refCount2--;
      innerSub.unsubscribe();
      innerSub = void 0;
      if (subscription && !isComplete && useRefCount && refCount2 === 0) {
        subscription.unsubscribe();
        subscription = void 0;
        subject = void 0;
      }
    });
  };
}
function skip(count) {
  return function(source) {
    return source.lift(new SkipOperator(count));
  };
}
var SkipOperator = /* @__PURE__ */ (function() {
  function SkipOperator2(total) {
    this.total = total;
  }
  SkipOperator2.prototype.call = function(subscriber, source) {
    return source.subscribe(new SkipSubscriber(subscriber, this.total));
  };
  return SkipOperator2;
})();
var SkipSubscriber = /* @__PURE__ */ (function(_super) {
  __extends(SkipSubscriber2, _super);
  function SkipSubscriber2(destination, total) {
    var _this = _super.call(this, destination) || this;
    _this.total = total;
    _this.count = 0;
    return _this;
  }
  SkipSubscriber2.prototype._next = function(x) {
    if (++this.count > this.total) {
      this.destination.next(x);
    }
  };
  return SkipSubscriber2;
})(Subscriber);
function startWith() {
  var array = [];
  for (var _i = 0; _i < arguments.length; _i++) {
    array[_i] = arguments[_i];
  }
  var scheduler = array[array.length - 1];
  if (isScheduler(scheduler)) {
    array.pop();
    return function(source) {
      return concat(array, source, scheduler);
    };
  } else {
    return function(source) {
      return concat(array, source);
    };
  }
}
function switchMap(project, resultSelector) {
  return function(source) {
    return source.lift(new SwitchMapOperator(project));
  };
}
var SwitchMapOperator = /* @__PURE__ */ (function() {
  function SwitchMapOperator2(project) {
    this.project = project;
  }
  SwitchMapOperator2.prototype.call = function(subscriber, source) {
    return source.subscribe(new SwitchMapSubscriber(subscriber, this.project));
  };
  return SwitchMapOperator2;
})();
var SwitchMapSubscriber = /* @__PURE__ */ (function(_super) {
  __extends(SwitchMapSubscriber2, _super);
  function SwitchMapSubscriber2(destination, project) {
    var _this = _super.call(this, destination) || this;
    _this.project = project;
    _this.index = 0;
    return _this;
  }
  SwitchMapSubscriber2.prototype._next = function(value) {
    var result;
    var index = this.index++;
    try {
      result = this.project(value, index);
    } catch (error) {
      this.destination.error(error);
      return;
    }
    this._innerSub(result);
  };
  SwitchMapSubscriber2.prototype._innerSub = function(result) {
    var innerSubscription = this.innerSubscription;
    if (innerSubscription) {
      innerSubscription.unsubscribe();
    }
    var innerSubscriber = new SimpleInnerSubscriber(this);
    var destination = this.destination;
    destination.add(innerSubscriber);
    this.innerSubscription = innerSubscribe(result, innerSubscriber);
    if (this.innerSubscription !== innerSubscriber) {
      destination.add(this.innerSubscription);
    }
  };
  SwitchMapSubscriber2.prototype._complete = function() {
    var innerSubscription = this.innerSubscription;
    if (!innerSubscription || innerSubscription.closed) {
      _super.prototype._complete.call(this);
    }
    this.unsubscribe();
  };
  SwitchMapSubscriber2.prototype._unsubscribe = function() {
    this.innerSubscription = void 0;
  };
  SwitchMapSubscriber2.prototype.notifyComplete = function() {
    this.innerSubscription = void 0;
    if (this.isStopped) {
      _super.prototype._complete.call(this);
    }
  };
  SwitchMapSubscriber2.prototype.notifyNext = function(innerValue) {
    this.destination.next(innerValue);
  };
  return SwitchMapSubscriber2;
})(SimpleOuterSubscriber);
function takeUntil(notifier) {
  return function(source) {
    return source.lift(new TakeUntilOperator(notifier));
  };
}
var TakeUntilOperator = /* @__PURE__ */ (function() {
  function TakeUntilOperator2(notifier) {
    this.notifier = notifier;
  }
  TakeUntilOperator2.prototype.call = function(subscriber, source) {
    var takeUntilSubscriber = new TakeUntilSubscriber(subscriber);
    var notifierSubscription = innerSubscribe(this.notifier, new SimpleInnerSubscriber(takeUntilSubscriber));
    if (notifierSubscription && !takeUntilSubscriber.seenValue) {
      takeUntilSubscriber.add(notifierSubscription);
      return source.subscribe(takeUntilSubscriber);
    }
    return takeUntilSubscriber;
  };
  return TakeUntilOperator2;
})();
var TakeUntilSubscriber = /* @__PURE__ */ (function(_super) {
  __extends(TakeUntilSubscriber2, _super);
  function TakeUntilSubscriber2(destination) {
    var _this = _super.call(this, destination) || this;
    _this.seenValue = false;
    return _this;
  }
  TakeUntilSubscriber2.prototype.notifyNext = function() {
    this.seenValue = true;
    this.complete();
  };
  TakeUntilSubscriber2.prototype.notifyComplete = function() {
  };
  return TakeUntilSubscriber2;
})(SimpleOuterSubscriber);
function tap(nextOrObserver, error, complete) {
  return function tapOperatorFunction(source) {
    return source.lift(new DoOperator(nextOrObserver, error, complete));
  };
}
var DoOperator = /* @__PURE__ */ (function() {
  function DoOperator2(nextOrObserver, error, complete) {
    this.nextOrObserver = nextOrObserver;
    this.error = error;
    this.complete = complete;
  }
  DoOperator2.prototype.call = function(subscriber, source) {
    return source.subscribe(new TapSubscriber(subscriber, this.nextOrObserver, this.error, this.complete));
  };
  return DoOperator2;
})();
var TapSubscriber = /* @__PURE__ */ (function(_super) {
  __extends(TapSubscriber2, _super);
  function TapSubscriber2(destination, observerOrNext, error, complete) {
    var _this = _super.call(this, destination) || this;
    _this._tapNext = noop$1;
    _this._tapError = noop$1;
    _this._tapComplete = noop$1;
    _this._tapError = error || noop$1;
    _this._tapComplete = complete || noop$1;
    if (isFunction(observerOrNext)) {
      _this._context = _this;
      _this._tapNext = observerOrNext;
    } else if (observerOrNext) {
      _this._context = observerOrNext;
      _this._tapNext = observerOrNext.next || noop$1;
      _this._tapError = observerOrNext.error || noop$1;
      _this._tapComplete = observerOrNext.complete || noop$1;
    }
    return _this;
  }
  TapSubscriber2.prototype._next = function(value) {
    try {
      this._tapNext.call(this._context, value);
    } catch (err) {
      this.destination.error(err);
      return;
    }
    this.destination.next(value);
  };
  TapSubscriber2.prototype._error = function(err) {
    try {
      this._tapError.call(this._context, err);
    } catch (err2) {
      this.destination.error(err2);
      return;
    }
    this.destination.error(err);
  };
  TapSubscriber2.prototype._complete = function() {
    try {
      this._tapComplete.call(this._context);
    } catch (err) {
      this.destination.error(err);
      return;
    }
    return this.destination.complete();
  };
  return TapSubscriber2;
})(Subscriber);
function withLatestFrom() {
  var args = [];
  for (var _i = 0; _i < arguments.length; _i++) {
    args[_i] = arguments[_i];
  }
  return function(source) {
    var project;
    if (typeof args[args.length - 1] === "function") {
      project = args.pop();
    }
    var observables = args;
    return source.lift(new WithLatestFromOperator(observables, project));
  };
}
var WithLatestFromOperator = /* @__PURE__ */ (function() {
  function WithLatestFromOperator2(observables, project) {
    this.observables = observables;
    this.project = project;
  }
  WithLatestFromOperator2.prototype.call = function(subscriber, source) {
    return source.subscribe(new WithLatestFromSubscriber(subscriber, this.observables, this.project));
  };
  return WithLatestFromOperator2;
})();
var WithLatestFromSubscriber = /* @__PURE__ */ (function(_super) {
  __extends(WithLatestFromSubscriber2, _super);
  function WithLatestFromSubscriber2(destination, observables, project) {
    var _this = _super.call(this, destination) || this;
    _this.observables = observables;
    _this.project = project;
    _this.toRespond = [];
    var len = observables.length;
    _this.values = new Array(len);
    for (var i = 0; i < len; i++) {
      _this.toRespond.push(i);
    }
    for (var i = 0; i < len; i++) {
      var observable2 = observables[i];
      _this.add(subscribeToResult(_this, observable2, void 0, i));
    }
    return _this;
  }
  WithLatestFromSubscriber2.prototype.notifyNext = function(_outerValue, innerValue, outerIndex) {
    this.values[outerIndex] = innerValue;
    var toRespond = this.toRespond;
    if (toRespond.length > 0) {
      var found = toRespond.indexOf(outerIndex);
      if (found !== -1) {
        toRespond.splice(found, 1);
      }
    }
  };
  WithLatestFromSubscriber2.prototype.notifyComplete = function() {
  };
  WithLatestFromSubscriber2.prototype._next = function(value) {
    if (this.toRespond.length === 0) {
      var args = [value].concat(this.values);
      if (this.project) {
        this._tryProject(args);
      } else {
        this.destination.next(args);
      }
    }
  };
  WithLatestFromSubscriber2.prototype._tryProject = function(args) {
    var result;
    try {
      result = this.project.apply(this, args);
    } catch (err) {
      this.destination.error(err);
      return;
    }
    this.destination.next(result);
  };
  return WithLatestFromSubscriber2;
})(OuterSubscriber);
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
function getClosureSafeProperty(objWithPropertyToExtract) {
  for (let key in objWithPropertyToExtract) {
    if (objWithPropertyToExtract[key] === getClosureSafeProperty) {
      return key;
    }
  }
  throw Error("Could not find renamed property on target object.");
}
function fillProperties(target, source) {
  for (const key in source) {
    if (source.hasOwnProperty(key) && !target.hasOwnProperty(key)) {
      target[key] = source[key];
    }
  }
}
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
function stringify(token) {
  if (typeof token === "string") {
    return token;
  }
  if (Array.isArray(token)) {
    return "[" + token.map(stringify).join(", ") + "]";
  }
  if (token == null) {
    return "" + token;
  }
  if (token.overriddenName) {
    return `${token.overriddenName}`;
  }
  if (token.name) {
    return `${token.name}`;
  }
  const res = token.toString();
  if (res == null) {
    return "" + res;
  }
  const newLineIndex = res.indexOf("\n");
  return newLineIndex === -1 ? res : res.substring(0, newLineIndex);
}
function concatStringsWithSpace(before, after) {
  return before == null || before === "" ? after === null ? "" : after : after == null || after === "" ? before : before + " " + after;
}
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
const __forward_ref__ = getClosureSafeProperty({ __forward_ref__: getClosureSafeProperty });
function forwardRef(forwardRefFn) {
  forwardRefFn.__forward_ref__ = forwardRef;
  forwardRefFn.toString = function() {
    return stringify(this());
  };
  return forwardRefFn;
}
function resolveForwardRef(type) {
  return isForwardRef(type) ? type() : type;
}
function isForwardRef(fn) {
  return typeof fn === "function" && fn.hasOwnProperty(__forward_ref__) && fn.__forward_ref__ === forwardRef;
}
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
const ERROR_DETAILS_PAGE_BASE_URL = "https://angular.io/errors";
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
class RuntimeError extends Error {
  constructor(code, message) {
    super(formatRuntimeError(code, message));
    this.code = code;
  }
}
function formatRuntimeError(code, message) {
  const fullCode = `NG0${Math.abs(code)}`;
  let errorMessage = `${fullCode}${message ? ": " + message : ""}`;
  if (ngDevMode && code < 0) {
    errorMessage = `${errorMessage}. Find more at ${ERROR_DETAILS_PAGE_BASE_URL}/${fullCode}`;
  }
  return errorMessage;
}
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
function renderStringify(value) {
  if (typeof value === "string")
    return value;
  if (value == null)
    return "";
  return String(value);
}
function stringifyForError(value) {
  if (typeof value === "function")
    return value.name || value.toString();
  if (typeof value === "object" && value != null && typeof value.type === "function") {
    return value.type.name || value.type.toString();
  }
  return renderStringify(value);
}
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
function throwCyclicDependencyError(token, path) {
  const depPath = path ? `. Dependency path: ${path.join(" > ")} > ${token}` : "";
  throw new RuntimeError(-200, `Circular dependency in DI detected for ${token}${depPath}`);
}
function throwMixedMultiProviderError() {
  throw new Error(`Cannot mix multi providers and regular providers`);
}
function throwInvalidProviderError(ngModuleType, providers, provider) {
  let ngModuleDetail = "";
  if (ngModuleType && providers) {
    const providerDetail = providers.map((v) => v == provider ? "?" + provider + "?" : "...");
    ngModuleDetail = ` - only instances of Provider and Type are allowed, got: [${providerDetail.join(", ")}]`;
  }
  throw new Error(`Invalid provider for the NgModule '${stringify(ngModuleType)}'` + ngModuleDetail);
}
function throwProviderNotFoundError(token, injectorName) {
  const injectorDetails = injectorName ? ` in ${injectorName}` : "";
  throw new RuntimeError(-201, `No provider for ${stringifyForError(token)} found${injectorDetails}`);
}
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
function assertNumber(actual, msg) {
  if (!(typeof actual === "number")) {
    throwError(msg, typeof actual, "number", "===");
  }
}
function assertNumberInRange(actual, minInclusive, maxInclusive) {
  assertNumber(actual, "Expected a number");
  assertLessThanOrEqual(actual, maxInclusive, "Expected number to be less than or equal to");
  assertGreaterThanOrEqual(actual, minInclusive, "Expected number to be greater than or equal to");
}
function assertString(actual, msg) {
  if (!(typeof actual === "string")) {
    throwError(msg, actual === null ? "null" : typeof actual, "string", "===");
  }
}
function assertFunction(actual, msg) {
  if (!(typeof actual === "function")) {
    throwError(msg, actual === null ? "null" : typeof actual, "function", "===");
  }
}
function assertEqual(actual, expected, msg) {
  if (!(actual == expected)) {
    throwError(msg, actual, expected, "==");
  }
}
function assertNotEqual(actual, expected, msg) {
  if (!(actual != expected)) {
    throwError(msg, actual, expected, "!=");
  }
}
function assertSame(actual, expected, msg) {
  if (!(actual === expected)) {
    throwError(msg, actual, expected, "===");
  }
}
function assertNotSame(actual, expected, msg) {
  if (!(actual !== expected)) {
    throwError(msg, actual, expected, "!==");
  }
}
function assertLessThan(actual, expected, msg) {
  if (!(actual < expected)) {
    throwError(msg, actual, expected, "<");
  }
}
function assertLessThanOrEqual(actual, expected, msg) {
  if (!(actual <= expected)) {
    throwError(msg, actual, expected, "<=");
  }
}
function assertGreaterThan(actual, expected, msg) {
  if (!(actual > expected)) {
    throwError(msg, actual, expected, ">");
  }
}
function assertGreaterThanOrEqual(actual, expected, msg) {
  if (!(actual >= expected)) {
    throwError(msg, actual, expected, ">=");
  }
}
function assertDefined(actual, msg) {
  if (actual == null) {
    throwError(msg, actual, null, "!=");
  }
}
function throwError(msg, actual, expected, comparison) {
  throw new Error(`ASSERTION ERROR: ${msg}` + (comparison == null ? "" : ` [Expected=> ${expected} ${comparison} ${actual} <=Actual]`));
}
function assertDomNode(node) {
  if (!(typeof Node !== "undefined" && node instanceof Node) && !(typeof node === "object" && node != null && node.constructor.name === "WebWorkerRenderNode")) {
    throwError(`The provided value must be an instance of a DOM Node but got ${stringify(node)}`);
  }
}
function assertIndexInRange(arr, index) {
  assertDefined(arr, "Array must be defined.");
  const maxLen = arr.length;
  if (index < 0 || index >= maxLen) {
    throwError(`Index expected to be less than ${maxLen} but got ${index}`);
  }
}
function assertOneOf(value, ...validValues) {
  if (validValues.indexOf(value) !== -1)
    return true;
  throwError(`Expected value to be one of ${JSON.stringify(validValues)} but was ${JSON.stringify(value)}.`);
}
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
function ɵɵdefineInjectable(opts) {
  return {
    token: opts.token,
    providedIn: opts.providedIn || null,
    factory: opts.factory,
    value: void 0
  };
}
const defineInjectable = ɵɵdefineInjectable;
function ɵɵdefineInjector(options) {
  return { providers: options.providers || [], imports: options.imports || [] };
}
function getInjectableDef(type) {
  return getOwnDefinition(type, NG_PROV_DEF) || getOwnDefinition(type, NG_INJECTABLE_DEF);
}
function getOwnDefinition(type, field) {
  return type.hasOwnProperty(field) ? type[field] : null;
}
function getInheritedInjectableDef(type) {
  const def = type && (type[NG_PROV_DEF] || type[NG_INJECTABLE_DEF]);
  if (def) {
    const typeName = getTypeName$1(type);
    console.warn(`DEPRECATED: DI is instantiating a token "${typeName}" that inherits its @Injectable decorator but does not provide one itself.
This will become an error in a future version of Angular. Please add @Injectable() to the "${typeName}" class.`);
    return def;
  } else {
    return null;
  }
}
function getTypeName$1(type) {
  if (type.hasOwnProperty("name")) {
    return type.name;
  }
  const match = ("" + type).match(/^function\s*([^\s(]+)/);
  return match === null ? "" : match[1];
}
function getInjectorDef(type) {
  return type && (type.hasOwnProperty(NG_INJ_DEF) || type.hasOwnProperty(NG_INJECTOR_DEF)) ? type[NG_INJ_DEF] : null;
}
const NG_PROV_DEF = getClosureSafeProperty({ ɵprov: getClosureSafeProperty });
const NG_INJ_DEF = getClosureSafeProperty({ ɵinj: getClosureSafeProperty });
const NG_INJECTABLE_DEF = getClosureSafeProperty({ ngInjectableDef: getClosureSafeProperty });
const NG_INJECTOR_DEF = getClosureSafeProperty({ ngInjectorDef: getClosureSafeProperty });
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
var InjectFlags;
(function(InjectFlags2) {
  InjectFlags2[InjectFlags2["Default"] = 0] = "Default";
  InjectFlags2[InjectFlags2["Host"] = 1] = "Host";
  InjectFlags2[InjectFlags2["Self"] = 2] = "Self";
  InjectFlags2[InjectFlags2["SkipSelf"] = 4] = "SkipSelf";
  InjectFlags2[InjectFlags2["Optional"] = 8] = "Optional";
})(InjectFlags || (InjectFlags = {}));
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
let _injectImplementation;
function getInjectImplementation() {
  return _injectImplementation;
}
function setInjectImplementation(impl) {
  const previous = _injectImplementation;
  _injectImplementation = impl;
  return previous;
}
function injectRootLimpMode(token, notFoundValue, flags) {
  const injectableDef = getInjectableDef(token);
  if (injectableDef && injectableDef.providedIn == "root") {
    return injectableDef.value === void 0 ? injectableDef.value = injectableDef.factory() : injectableDef.value;
  }
  if (flags & InjectFlags.Optional)
    return null;
  if (notFoundValue !== void 0)
    return notFoundValue;
  throwProviderNotFoundError(stringify(token), "Injector");
}
function assertInjectImplementationNotEqual(fn) {
  ngDevMode && assertNotEqual(_injectImplementation, fn, "Calling ɵɵinject would cause infinite recursion");
}
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
function noSideEffects(fn) {
  return { toString: fn }.toString();
}
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
var ChangeDetectionStrategy;
(function(ChangeDetectionStrategy2) {
  ChangeDetectionStrategy2[ChangeDetectionStrategy2["OnPush"] = 0] = "OnPush";
  ChangeDetectionStrategy2[ChangeDetectionStrategy2["Default"] = 1] = "Default";
})(ChangeDetectionStrategy || (ChangeDetectionStrategy = {}));
var ChangeDetectorStatus;
(function(ChangeDetectorStatus2) {
  ChangeDetectorStatus2[ChangeDetectorStatus2["CheckOnce"] = 0] = "CheckOnce";
  ChangeDetectorStatus2[ChangeDetectorStatus2["Checked"] = 1] = "Checked";
  ChangeDetectorStatus2[ChangeDetectorStatus2["CheckAlways"] = 2] = "CheckAlways";
  ChangeDetectorStatus2[ChangeDetectorStatus2["Detached"] = 3] = "Detached";
  ChangeDetectorStatus2[ChangeDetectorStatus2["Errored"] = 4] = "Errored";
  ChangeDetectorStatus2[ChangeDetectorStatus2["Destroyed"] = 5] = "Destroyed";
})(ChangeDetectorStatus || (ChangeDetectorStatus = {}));
function isDefaultChangeDetectionStrategy(changeDetectionStrategy) {
  return changeDetectionStrategy == null || changeDetectionStrategy === ChangeDetectionStrategy.Default;
}
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
var ViewEncapsulation$1;
(function(ViewEncapsulation2) {
  ViewEncapsulation2[ViewEncapsulation2["Emulated"] = 0] = "Emulated";
  ViewEncapsulation2[ViewEncapsulation2["None"] = 2] = "None";
  ViewEncapsulation2[ViewEncapsulation2["ShadowDom"] = 3] = "ShadowDom";
})(ViewEncapsulation$1 || (ViewEncapsulation$1 = {}));
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
const __globalThis = typeof globalThis !== "undefined" && globalThis;
const __window = typeof window !== "undefined" && window;
const __self = typeof self !== "undefined" && typeof WorkerGlobalScope !== "undefined" && self instanceof WorkerGlobalScope && self;
const __global = typeof global !== "undefined" && global;
const _global = __globalThis || __global || __window || __self;
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
function ngDevModeResetPerfCounters() {
  const locationString = typeof location !== "undefined" ? location.toString() : "";
  const newCounters = {
    namedConstructors: locationString.indexOf("ngDevMode=namedConstructors") != -1,
    firstCreatePass: 0,
    tNode: 0,
    tView: 0,
    rendererCreateTextNode: 0,
    rendererSetText: 0,
    rendererCreateElement: 0,
    rendererAddEventListener: 0,
    rendererSetAttribute: 0,
    rendererRemoveAttribute: 0,
    rendererSetProperty: 0,
    rendererSetClassName: 0,
    rendererAddClass: 0,
    rendererRemoveClass: 0,
    rendererSetStyle: 0,
    rendererRemoveStyle: 0,
    rendererDestroy: 0,
    rendererDestroyNode: 0,
    rendererMoveNode: 0,
    rendererRemoveNode: 0,
    rendererAppendChild: 0,
    rendererInsertBefore: 0,
    rendererCreateComment: 0
  };
  const allowNgDevModeTrue = locationString.indexOf("ngDevMode=false") === -1;
  _global["ngDevMode"] = allowNgDevModeTrue && newCounters;
  return newCounters;
}
function initNgDevMode() {
  if (typeof ngDevMode === "undefined" || ngDevMode) {
    if (typeof ngDevMode !== "object") {
      ngDevModeResetPerfCounters();
    }
    return typeof ngDevMode !== "undefined" && !!ngDevMode;
  }
  return false;
}
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
const EMPTY_OBJ = {};
const EMPTY_ARRAY = [];
if ((typeof ngDevMode === "undefined" || ngDevMode) && initNgDevMode()) {
  Object.freeze(EMPTY_OBJ);
  Object.freeze(EMPTY_ARRAY);
}
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
const NG_COMP_DEF = getClosureSafeProperty({ ɵcmp: getClosureSafeProperty });
const NG_DIR_DEF = getClosureSafeProperty({ ɵdir: getClosureSafeProperty });
const NG_PIPE_DEF = getClosureSafeProperty({ ɵpipe: getClosureSafeProperty });
const NG_MOD_DEF = getClosureSafeProperty({ ɵmod: getClosureSafeProperty });
const NG_FACTORY_DEF = getClosureSafeProperty({ ɵfac: getClosureSafeProperty });
const NG_ELEMENT_ID = getClosureSafeProperty({ __NG_ELEMENT_ID__: getClosureSafeProperty });
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
let _renderCompCount = 0;
function ɵɵdefineComponent(componentDefinition) {
  return noSideEffects(() => {
    (typeof ngDevMode === "undefined" || ngDevMode) && initNgDevMode();
    const type = componentDefinition.type;
    const declaredInputs = {};
    const def = {
      type,
      providersResolver: null,
      decls: componentDefinition.decls,
      vars: componentDefinition.vars,
      factory: null,
      template: componentDefinition.template || null,
      consts: componentDefinition.consts || null,
      ngContentSelectors: componentDefinition.ngContentSelectors,
      hostBindings: componentDefinition.hostBindings || null,
      hostVars: componentDefinition.hostVars || 0,
      hostAttrs: componentDefinition.hostAttrs || null,
      contentQueries: componentDefinition.contentQueries || null,
      declaredInputs,
      inputs: null,
      outputs: null,
      exportAs: componentDefinition.exportAs || null,
      onPush: componentDefinition.changeDetection === ChangeDetectionStrategy.OnPush,
      directiveDefs: null,
      pipeDefs: null,
      selectors: componentDefinition.selectors || EMPTY_ARRAY,
      viewQuery: componentDefinition.viewQuery || null,
      features: componentDefinition.features || null,
      data: componentDefinition.data || {},
      encapsulation: componentDefinition.encapsulation || ViewEncapsulation$1.Emulated,
      id: "c",
      styles: componentDefinition.styles || EMPTY_ARRAY,
      _: null,
      setInput: null,
      schemas: componentDefinition.schemas || null,
      tView: null
    };
    const directiveTypes = componentDefinition.directives;
    const feature = componentDefinition.features;
    const pipeTypes = componentDefinition.pipes;
    def.id += _renderCompCount++;
    def.inputs = invertObject(componentDefinition.inputs, declaredInputs), def.outputs = invertObject(componentDefinition.outputs), feature && feature.forEach((fn) => fn(def));
    def.directiveDefs = directiveTypes ? () => (typeof directiveTypes === "function" ? directiveTypes() : directiveTypes).map(extractDirectiveDef) : null;
    def.pipeDefs = pipeTypes ? () => (typeof pipeTypes === "function" ? pipeTypes() : pipeTypes).map(extractPipeDef) : null;
    return def;
  });
}
function ɵɵsetComponentScope(type, directives, pipes) {
  const def = type.ɵcmp;
  def.directiveDefs = () => directives.map(extractDirectiveDef);
  def.pipeDefs = () => pipes.map(extractPipeDef);
}
function extractDirectiveDef(type) {
  const def = getComponentDef(type) || getDirectiveDef(type);
  if (ngDevMode && !def) {
    throw new Error(`'${type.name}' is neither 'ComponentType' or 'DirectiveType'.`);
  }
  return def;
}
function extractPipeDef(type) {
  const def = getPipeDef$1(type);
  if (ngDevMode && !def) {
    throw new Error(`'${type.name}' is not a 'PipeType'.`);
  }
  return def;
}
const autoRegisterModuleById = {};
function ɵɵdefineNgModule(def) {
  return noSideEffects(() => {
    const res = {
      type: def.type,
      bootstrap: def.bootstrap || EMPTY_ARRAY,
      declarations: def.declarations || EMPTY_ARRAY,
      imports: def.imports || EMPTY_ARRAY,
      exports: def.exports || EMPTY_ARRAY,
      transitiveCompileScopes: null,
      schemas: def.schemas || null,
      id: def.id || null
    };
    if (def.id != null) {
      autoRegisterModuleById[def.id] = def.type;
    }
    return res;
  });
}
function ɵɵsetNgModuleScope(type, scope) {
  return noSideEffects(() => {
    const ngModuleDef = getNgModuleDef(type, true);
    ngModuleDef.declarations = scope.declarations || EMPTY_ARRAY;
    ngModuleDef.imports = scope.imports || EMPTY_ARRAY;
    ngModuleDef.exports = scope.exports || EMPTY_ARRAY;
  });
}
function invertObject(obj, secondary) {
  if (obj == null)
    return EMPTY_OBJ;
  const newLookup = {};
  for (const minifiedKey in obj) {
    if (obj.hasOwnProperty(minifiedKey)) {
      let publicName = obj[minifiedKey];
      let declaredName = publicName;
      if (Array.isArray(publicName)) {
        declaredName = publicName[1];
        publicName = publicName[0];
      }
      newLookup[publicName] = minifiedKey;
      if (secondary) {
        secondary[publicName] = declaredName;
      }
    }
  }
  return newLookup;
}
const ɵɵdefineDirective = ɵɵdefineComponent;
function ɵɵdefinePipe(pipeDef) {
  return {
    type: pipeDef.type,
    name: pipeDef.name,
    factory: null,
    pure: pipeDef.pure !== false,
    onDestroy: pipeDef.type.prototype.ngOnDestroy || null
  };
}
function getComponentDef(type) {
  return type[NG_COMP_DEF] || null;
}
function getDirectiveDef(type) {
  return type[NG_DIR_DEF] || null;
}
function getPipeDef$1(type) {
  return type[NG_PIPE_DEF] || null;
}
function getNgModuleDef(type, throwNotFound) {
  const ngModuleDef = type[NG_MOD_DEF] || null;
  if (!ngModuleDef && throwNotFound === true) {
    throw new Error(`Type ${stringify(type)} does not have 'ɵmod' property.`);
  }
  return ngModuleDef;
}
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
const HOST = 0;
const TVIEW = 1;
const FLAGS = 2;
const PARENT = 3;
const NEXT = 4;
const TRANSPLANTED_VIEWS_TO_REFRESH = 5;
const T_HOST = 6;
const CLEANUP = 7;
const CONTEXT = 8;
const INJECTOR$1 = 9;
const RENDERER_FACTORY = 10;
const RENDERER = 11;
const SANITIZER = 12;
const CHILD_HEAD = 13;
const CHILD_TAIL = 14;
const DECLARATION_VIEW = 15;
const DECLARATION_COMPONENT_VIEW = 16;
const DECLARATION_LCONTAINER = 17;
const PREORDER_HOOK_FLAGS = 18;
const QUERIES = 19;
const HEADER_OFFSET = 20;
const TViewTypeAsString = [
  "Root",
  "Component",
  "Embedded"
  // 2
];
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
const TYPE = 1;
const HAS_TRANSPLANTED_VIEWS = 2;
const NATIVE = 7;
const VIEW_REFS = 8;
const MOVED_VIEWS = 9;
const CONTAINER_HEADER_OFFSET = 10;
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
function isLView(value) {
  return Array.isArray(value) && typeof value[TYPE] === "object";
}
function isLContainer(value) {
  return Array.isArray(value) && value[TYPE] === true;
}
function isContentQueryHost(tNode) {
  return (tNode.flags & 8) !== 0;
}
function isComponentHost(tNode) {
  return (tNode.flags & 2) === 2;
}
function isDirectiveHost(tNode) {
  return (tNode.flags & 1) === 1;
}
function isComponentDef(def) {
  return def.template !== null;
}
function isRootView(target) {
  return (target[FLAGS] & 512) !== 0;
}
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
function assertTNodeForLView(tNode, lView) {
  assertTNodeForTView(tNode, lView[TVIEW]);
}
function assertTNodeForTView(tNode, tView) {
  assertTNode(tNode);
  tNode.hasOwnProperty("tView_") && assertEqual(tNode.tView_, tView, "This TNode does not belong to this TView.");
}
function assertTNode(tNode) {
  assertDefined(tNode, "TNode must be defined");
  if (!(tNode && typeof tNode === "object" && tNode.hasOwnProperty("directiveStylingLast"))) {
    throwError("Not of type TNode, got: " + tNode);
  }
}
function assertTIcu(tIcu) {
  assertDefined(tIcu, "Expected TIcu to be defined");
  if (!(typeof tIcu.currentCaseLViewIndex === "number")) {
    throwError("Object is not of TIcu type.");
  }
}
function assertComponentType(actual, msg = "Type passed in is not ComponentType, it does not have 'ɵcmp' property.") {
  if (!getComponentDef(actual)) {
    throwError(msg);
  }
}
function assertNgModuleType(actual, msg = "Type passed in is not NgModuleType, it does not have 'ɵmod' property.") {
  if (!getNgModuleDef(actual)) {
    throwError(msg);
  }
}
function assertHasParent(tNode) {
  assertDefined(tNode, "currentTNode should exist!");
  assertDefined(tNode.parent, "currentTNode should have a parent");
}
function assertLContainer(value) {
  assertDefined(value, "LContainer must be defined");
  assertEqual(isLContainer(value), true, "Expecting LContainer");
}
function assertLViewOrUndefined(value) {
  value && assertEqual(isLView(value), true, "Expecting LView or undefined or null");
}
function assertLView(value) {
  assertDefined(value, "LView must be defined");
  assertEqual(isLView(value), true, "Expecting LView");
}
function assertFirstCreatePass(tView, errMessage) {
  assertEqual(tView.firstCreatePass, true, errMessage || "Should only be called in first create pass.");
}
function assertFirstUpdatePass(tView, errMessage) {
  assertEqual(tView.firstUpdatePass, true, "Should only be called in first update pass.");
}
function assertDirectiveDef(obj) {
  if (obj.type === void 0 || obj.selectors == void 0 || obj.inputs === void 0) {
    throwError(`Expected a DirectiveDef/ComponentDef and this object does not seem to have the expected shape.`);
  }
}
function assertIndexInDeclRange(lView, index) {
  const tView = lView[1];
  assertBetween(HEADER_OFFSET, tView.bindingStartIndex, index);
}
function assertIndexInExpandoRange(lView, index) {
  const tView = lView[1];
  assertBetween(tView.expandoStartIndex, lView.length, index);
}
function assertBetween(lower, upper, index) {
  if (!(lower <= index && index < upper)) {
    throwError(`Index out of range (expecting ${lower} <= ${index} < ${upper})`);
  }
}
function assertProjectionSlots(lView, errMessage) {
  assertDefined(lView[DECLARATION_COMPONENT_VIEW], "Component views should exist.");
  assertDefined(lView[DECLARATION_COMPONENT_VIEW][T_HOST].projection, "Components with projection nodes (<ng-content>) must have projection slots defined.");
}
function assertParentView(lView, errMessage) {
  assertDefined(lView, "Component views should always have a parent view (component's host view)");
}
function assertNodeInjector(lView, injectorIndex) {
  assertIndexInExpandoRange(lView, injectorIndex);
  assertIndexInExpandoRange(
    lView,
    injectorIndex + 8
    /* PARENT */
  );
  assertNumber(lView[injectorIndex + 0], "injectorIndex should point to a bloom filter");
  assertNumber(lView[injectorIndex + 1], "injectorIndex should point to a bloom filter");
  assertNumber(lView[injectorIndex + 2], "injectorIndex should point to a bloom filter");
  assertNumber(lView[injectorIndex + 3], "injectorIndex should point to a bloom filter");
  assertNumber(lView[injectorIndex + 4], "injectorIndex should point to a bloom filter");
  assertNumber(lView[injectorIndex + 5], "injectorIndex should point to a bloom filter");
  assertNumber(lView[injectorIndex + 6], "injectorIndex should point to a bloom filter");
  assertNumber(lView[injectorIndex + 7], "injectorIndex should point to a bloom filter");
  assertNumber(lView[
    injectorIndex + 8
    /* PARENT */
  ], "injectorIndex should point to parent injector");
}
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
function getFactoryDef(type, throwNotFound) {
  const hasFactoryDef = type.hasOwnProperty(NG_FACTORY_DEF);
  if (!hasFactoryDef && throwNotFound === true && ngDevMode) {
    throw new Error(`Type ${stringify(type)} does not have 'ɵfac' property.`);
  }
  return hasFactoryDef ? type[NG_FACTORY_DEF] : null;
}
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
class SimpleChange {
  constructor(previousValue, currentValue, firstChange) {
    this.previousValue = previousValue;
    this.currentValue = currentValue;
    this.firstChange = firstChange;
  }
  /**
   * Check whether the new value is the first value assigned.
   */
  isFirstChange() {
    return this.firstChange;
  }
}
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
function ɵɵNgOnChangesFeature() {
  return NgOnChangesFeatureImpl;
}
function NgOnChangesFeatureImpl(definition) {
  if (definition.type.prototype.ngOnChanges) {
    definition.setInput = ngOnChangesSetInput;
  }
  return rememberChangeHistoryAndInvokeOnChangesHook;
}
ɵɵNgOnChangesFeature.ngInherit = true;
function rememberChangeHistoryAndInvokeOnChangesHook() {
  const simpleChangesStore = getSimpleChangesStore(this);
  const current = simpleChangesStore?.current;
  if (current) {
    const previous = simpleChangesStore.previous;
    if (previous === EMPTY_OBJ) {
      simpleChangesStore.previous = current;
    } else {
      for (let key in current) {
        previous[key] = current[key];
      }
    }
    simpleChangesStore.current = null;
    this.ngOnChanges(current);
  }
}
function ngOnChangesSetInput(instance, value, publicName, privateName) {
  const simpleChangesStore = getSimpleChangesStore(instance) || setSimpleChangesStore(instance, { previous: EMPTY_OBJ, current: null });
  const current = simpleChangesStore.current || (simpleChangesStore.current = {});
  const previous = simpleChangesStore.previous;
  const declaredName = this.declaredInputs[publicName];
  const previousChange = previous[declaredName];
  current[declaredName] = new SimpleChange(previousChange && previousChange.currentValue, value, previous === EMPTY_OBJ);
  instance[privateName] = value;
}
const SIMPLE_CHANGES_STORE = "__ngSimpleChanges__";
function getSimpleChangesStore(instance) {
  return instance[SIMPLE_CHANGES_STORE] || null;
}
function setSimpleChangesStore(instance, store2) {
  return instance[SIMPLE_CHANGES_STORE] = store2;
}
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
let profilerCallback = null;
const setProfiler = (profiler2) => {
  profilerCallback = profiler2;
};
const profiler = function(event, instance, hookOrListener) {
  if (profilerCallback != null) {
    profilerCallback(event, instance, hookOrListener);
  }
};
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
const SVG_NAMESPACE = "svg";
const SVG_NAMESPACE_URI = "http://www.w3.org/2000/svg";
const MATH_ML_NAMESPACE = "math";
const MATH_ML_NAMESPACE_URI = "http://www.w3.org/1998/MathML/";
function getNamespaceUri(namespace) {
  const name = namespace.toLowerCase();
  return name === SVG_NAMESPACE ? SVG_NAMESPACE_URI : name === MATH_ML_NAMESPACE ? MATH_ML_NAMESPACE_URI : null;
}
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
let DOCUMENT$1 = void 0;
function setDocument(document2) {
  DOCUMENT$1 = document2;
}
function getDocument() {
  if (DOCUMENT$1 !== void 0) {
    return DOCUMENT$1;
  } else if (typeof document !== "undefined") {
    return document;
  }
  return void 0;
}
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
var RendererStyleFlags3;
(function(RendererStyleFlags32) {
  RendererStyleFlags32[RendererStyleFlags32["Important"] = 1] = "Important";
  RendererStyleFlags32[RendererStyleFlags32["DashCase"] = 2] = "DashCase";
})(RendererStyleFlags3 || (RendererStyleFlags3 = {}));
function isProceduralRenderer(renderer) {
  return !!renderer.listen;
}
const domRendererFactory3 = {
  createRenderer: (hostElement, rendererType) => {
    return getDocument();
  }
};
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
function unwrapRNode(value) {
  while (Array.isArray(value)) {
    value = value[HOST];
  }
  return value;
}
function unwrapLView(value) {
  while (Array.isArray(value)) {
    if (typeof value[TYPE] === "object")
      return value;
    value = value[HOST];
  }
  return null;
}
function getNativeByIndex(index, lView) {
  ngDevMode && assertIndexInRange(lView, index);
  ngDevMode && assertGreaterThanOrEqual(index, HEADER_OFFSET, "Expected to be past HEADER_OFFSET");
  return unwrapRNode(lView[index]);
}
function getNativeByTNode(tNode, lView) {
  ngDevMode && assertTNodeForLView(tNode, lView);
  ngDevMode && assertIndexInRange(lView, tNode.index);
  const node = unwrapRNode(lView[tNode.index]);
  ngDevMode && !isProceduralRenderer(lView[RENDERER]) && assertDomNode(node);
  return node;
}
function getNativeByTNodeOrNull(tNode, lView) {
  const index = tNode === null ? -1 : tNode.index;
  if (index !== -1) {
    ngDevMode && assertTNodeForLView(tNode, lView);
    const node = unwrapRNode(lView[index]);
    ngDevMode && node !== null && !isProceduralRenderer(lView[RENDERER]) && assertDomNode(node);
    return node;
  }
  return null;
}
function getTNode(tView, index) {
  ngDevMode && assertGreaterThan(index, -1, "wrong index for TNode");
  ngDevMode && assertLessThan(index, tView.data.length, "wrong index for TNode");
  const tNode = tView.data[index];
  ngDevMode && tNode !== null && assertTNode(tNode);
  return tNode;
}
function load(view, index) {
  ngDevMode && assertIndexInRange(view, index);
  return view[index];
}
function getComponentLViewByIndex(nodeIndex, hostView) {
  ngDevMode && assertIndexInRange(hostView, nodeIndex);
  const slotValue = hostView[nodeIndex];
  const lView = isLView(slotValue) ? slotValue : slotValue[HOST];
  return lView;
}
function isCreationMode(view) {
  return (view[FLAGS] & 4) === 4;
}
function viewAttachedToChangeDetector(view) {
  return (view[FLAGS] & 128) === 128;
}
function viewAttachedToContainer(view) {
  return isLContainer(view[PARENT]);
}
function getConstant(consts, index) {
  if (index === null || index === void 0)
    return null;
  ngDevMode && assertIndexInRange(consts, index);
  return consts[index];
}
function resetPreOrderHookFlags(lView) {
  lView[PREORDER_HOOK_FLAGS] = 0;
}
function updateTransplantedViewCount(lContainer, amount) {
  lContainer[TRANSPLANTED_VIEWS_TO_REFRESH] += amount;
  let viewOrContainer = lContainer;
  let parent = lContainer[PARENT];
  while (parent !== null && (amount === 1 && viewOrContainer[TRANSPLANTED_VIEWS_TO_REFRESH] === 1 || amount === -1 && viewOrContainer[TRANSPLANTED_VIEWS_TO_REFRESH] === 0)) {
    parent[TRANSPLANTED_VIEWS_TO_REFRESH] += amount;
    viewOrContainer = parent;
    parent = parent[PARENT];
  }
}
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
const instructionState = {
  lFrame: createLFrame(null),
  bindingsEnabled: true
};
let _isInCheckNoChangesMode = false;
function getElementDepthCount() {
  return instructionState.lFrame.elementDepthCount;
}
function increaseElementDepthCount() {
  instructionState.lFrame.elementDepthCount++;
}
function decreaseElementDepthCount() {
  instructionState.lFrame.elementDepthCount--;
}
function getBindingsEnabled() {
  return instructionState.bindingsEnabled;
}
function ɵɵenableBindings() {
  instructionState.bindingsEnabled = true;
}
function ɵɵdisableBindings() {
  instructionState.bindingsEnabled = false;
}
function getLView() {
  return instructionState.lFrame.lView;
}
function getTView() {
  return instructionState.lFrame.tView;
}
function ɵɵrestoreView(viewToRestore) {
  instructionState.lFrame.contextLView = viewToRestore;
  return viewToRestore[CONTEXT];
}
function getCurrentTNode() {
  let currentTNode = getCurrentTNodePlaceholderOk();
  while (currentTNode !== null && currentTNode.type === 64) {
    currentTNode = currentTNode.parent;
  }
  return currentTNode;
}
function getCurrentTNodePlaceholderOk() {
  return instructionState.lFrame.currentTNode;
}
function getCurrentParentTNode() {
  const lFrame = instructionState.lFrame;
  const currentTNode = lFrame.currentTNode;
  return lFrame.isParent ? currentTNode : currentTNode.parent;
}
function setCurrentTNode(tNode, isParent) {
  ngDevMode && tNode && assertTNodeForTView(tNode, instructionState.lFrame.tView);
  const lFrame = instructionState.lFrame;
  lFrame.currentTNode = tNode;
  lFrame.isParent = isParent;
}
function isCurrentTNodeParent() {
  return instructionState.lFrame.isParent;
}
function setCurrentTNodeAsNotParent() {
  instructionState.lFrame.isParent = false;
}
function getContextLView() {
  return instructionState.lFrame.contextLView;
}
function isInCheckNoChangesMode() {
  !ngDevMode && throwError("Must never be called in production mode");
  return _isInCheckNoChangesMode;
}
function setIsInCheckNoChangesMode(mode) {
  !ngDevMode && throwError("Must never be called in production mode");
  _isInCheckNoChangesMode = mode;
}
function getBindingRoot() {
  const lFrame = instructionState.lFrame;
  let index = lFrame.bindingRootIndex;
  if (index === -1) {
    index = lFrame.bindingRootIndex = lFrame.tView.bindingStartIndex;
  }
  return index;
}
function getBindingIndex() {
  return instructionState.lFrame.bindingIndex;
}
function setBindingIndex(value) {
  return instructionState.lFrame.bindingIndex = value;
}
function nextBindingIndex() {
  return instructionState.lFrame.bindingIndex++;
}
function incrementBindingIndex(count) {
  const lFrame = instructionState.lFrame;
  const index = lFrame.bindingIndex;
  lFrame.bindingIndex = lFrame.bindingIndex + count;
  return index;
}
function isInI18nBlock() {
  return instructionState.lFrame.inI18n;
}
function setInI18nBlock(isInI18nBlock2) {
  instructionState.lFrame.inI18n = isInI18nBlock2;
}
function setBindingRootForHostBindings(bindingRootIndex, currentDirectiveIndex) {
  const lFrame = instructionState.lFrame;
  lFrame.bindingIndex = lFrame.bindingRootIndex = bindingRootIndex;
  setCurrentDirectiveIndex(currentDirectiveIndex);
}
function getCurrentDirectiveIndex() {
  return instructionState.lFrame.currentDirectiveIndex;
}
function setCurrentDirectiveIndex(currentDirectiveIndex) {
  instructionState.lFrame.currentDirectiveIndex = currentDirectiveIndex;
}
function getCurrentDirectiveDef(tData) {
  const currentDirectiveIndex = instructionState.lFrame.currentDirectiveIndex;
  return currentDirectiveIndex === -1 ? null : tData[currentDirectiveIndex];
}
function getCurrentQueryIndex() {
  return instructionState.lFrame.currentQueryIndex;
}
function setCurrentQueryIndex(value) {
  instructionState.lFrame.currentQueryIndex = value;
}
function getDeclarationTNode(lView) {
  const tView = lView[TVIEW];
  if (tView.type === 2) {
    ngDevMode && assertDefined(tView.declTNode, "Embedded TNodes should have declaration parents.");
    return tView.declTNode;
  }
  if (tView.type === 1) {
    return lView[T_HOST];
  }
  return null;
}
function enterDI(lView, tNode, flags) {
  ngDevMode && assertLViewOrUndefined(lView);
  if (flags & InjectFlags.SkipSelf) {
    ngDevMode && assertTNodeForTView(tNode, lView[TVIEW]);
    let parentTNode = tNode;
    let parentLView = lView;
    while (true) {
      ngDevMode && assertDefined(parentTNode, "Parent TNode should be defined");
      parentTNode = parentTNode.parent;
      if (parentTNode === null && !(flags & InjectFlags.Host)) {
        parentTNode = getDeclarationTNode(parentLView);
        if (parentTNode === null)
          break;
        ngDevMode && assertDefined(parentLView, "Parent LView should be defined");
        parentLView = parentLView[DECLARATION_VIEW];
        if (parentTNode.type & (2 | 8)) {
          break;
        }
      } else {
        break;
      }
    }
    if (parentTNode === null) {
      return false;
    } else {
      tNode = parentTNode;
      lView = parentLView;
    }
  }
  ngDevMode && assertTNodeForLView(tNode, lView);
  const lFrame = instructionState.lFrame = allocLFrame();
  lFrame.currentTNode = tNode;
  lFrame.lView = lView;
  return true;
}
function enterView(newView) {
  ngDevMode && assertNotEqual(newView[0], newView[1], "????");
  ngDevMode && assertLViewOrUndefined(newView);
  const newLFrame = allocLFrame();
  if (ngDevMode) {
    assertEqual(newLFrame.isParent, true, "Expected clean LFrame");
    assertEqual(newLFrame.lView, null, "Expected clean LFrame");
    assertEqual(newLFrame.tView, null, "Expected clean LFrame");
    assertEqual(newLFrame.selectedIndex, -1, "Expected clean LFrame");
    assertEqual(newLFrame.elementDepthCount, 0, "Expected clean LFrame");
    assertEqual(newLFrame.currentDirectiveIndex, -1, "Expected clean LFrame");
    assertEqual(newLFrame.currentNamespace, null, "Expected clean LFrame");
    assertEqual(newLFrame.bindingRootIndex, -1, "Expected clean LFrame");
    assertEqual(newLFrame.currentQueryIndex, 0, "Expected clean LFrame");
  }
  const tView = newView[TVIEW];
  instructionState.lFrame = newLFrame;
  ngDevMode && tView.firstChild && assertTNodeForTView(tView.firstChild, tView);
  newLFrame.currentTNode = tView.firstChild;
  newLFrame.lView = newView;
  newLFrame.tView = tView;
  newLFrame.contextLView = newView;
  newLFrame.bindingIndex = tView.bindingStartIndex;
  newLFrame.inI18n = false;
}
function allocLFrame() {
  const currentLFrame = instructionState.lFrame;
  const childLFrame = currentLFrame === null ? null : currentLFrame.child;
  const newLFrame = childLFrame === null ? createLFrame(currentLFrame) : childLFrame;
  return newLFrame;
}
function createLFrame(parent) {
  const lFrame = {
    currentTNode: null,
    isParent: true,
    lView: null,
    tView: null,
    selectedIndex: -1,
    contextLView: null,
    elementDepthCount: 0,
    currentNamespace: null,
    currentDirectiveIndex: -1,
    bindingRootIndex: -1,
    bindingIndex: -1,
    currentQueryIndex: 0,
    parent,
    child: null,
    inI18n: false
  };
  parent !== null && (parent.child = lFrame);
  return lFrame;
}
function leaveViewLight() {
  const oldLFrame = instructionState.lFrame;
  instructionState.lFrame = oldLFrame.parent;
  oldLFrame.currentTNode = null;
  oldLFrame.lView = null;
  return oldLFrame;
}
const leaveDI = leaveViewLight;
function leaveView() {
  const oldLFrame = leaveViewLight();
  oldLFrame.isParent = true;
  oldLFrame.tView = null;
  oldLFrame.selectedIndex = -1;
  oldLFrame.contextLView = null;
  oldLFrame.elementDepthCount = 0;
  oldLFrame.currentDirectiveIndex = -1;
  oldLFrame.currentNamespace = null;
  oldLFrame.bindingRootIndex = -1;
  oldLFrame.bindingIndex = -1;
  oldLFrame.currentQueryIndex = 0;
}
function nextContextImpl(level) {
  const contextLView = instructionState.lFrame.contextLView = walkUpViews(level, instructionState.lFrame.contextLView);
  return contextLView[CONTEXT];
}
function walkUpViews(nestingLevel, currentView) {
  while (nestingLevel > 0) {
    ngDevMode && assertDefined(currentView[DECLARATION_VIEW], "Declaration view should be defined if nesting level is greater than 0.");
    currentView = currentView[DECLARATION_VIEW];
    nestingLevel--;
  }
  return currentView;
}
function getSelectedIndex() {
  return instructionState.lFrame.selectedIndex;
}
function setSelectedIndex(index) {
  ngDevMode && index !== -1 && assertGreaterThanOrEqual(index, HEADER_OFFSET, "Index must be past HEADER_OFFSET (or -1).");
  ngDevMode && assertLessThan(index, instructionState.lFrame.lView.length, "Can't set index passed end of LView");
  instructionState.lFrame.selectedIndex = index;
}
function getSelectedTNode() {
  const lFrame = instructionState.lFrame;
  return getTNode(lFrame.tView, lFrame.selectedIndex);
}
function ɵɵnamespaceSVG() {
  instructionState.lFrame.currentNamespace = SVG_NAMESPACE;
}
function ɵɵnamespaceMathML() {
  instructionState.lFrame.currentNamespace = MATH_ML_NAMESPACE;
}
function ɵɵnamespaceHTML() {
  namespaceHTMLInternal();
}
function namespaceHTMLInternal() {
  instructionState.lFrame.currentNamespace = null;
}
function getNamespace$1() {
  return instructionState.lFrame.currentNamespace;
}
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
function registerPreOrderHooks(directiveIndex, directiveDef, tView) {
  ngDevMode && assertFirstCreatePass(tView);
  const { ngOnChanges, ngOnInit, ngDoCheck } = directiveDef.type.prototype;
  if (ngOnChanges) {
    const wrappedOnChanges = NgOnChangesFeatureImpl(directiveDef);
    (tView.preOrderHooks || (tView.preOrderHooks = [])).push(directiveIndex, wrappedOnChanges);
    (tView.preOrderCheckHooks || (tView.preOrderCheckHooks = [])).push(directiveIndex, wrappedOnChanges);
  }
  if (ngOnInit) {
    (tView.preOrderHooks || (tView.preOrderHooks = [])).push(0 - directiveIndex, ngOnInit);
  }
  if (ngDoCheck) {
    (tView.preOrderHooks || (tView.preOrderHooks = [])).push(directiveIndex, ngDoCheck);
    (tView.preOrderCheckHooks || (tView.preOrderCheckHooks = [])).push(directiveIndex, ngDoCheck);
  }
}
function registerPostOrderHooks(tView, tNode) {
  ngDevMode && assertFirstCreatePass(tView);
  for (let i = tNode.directiveStart, end = tNode.directiveEnd; i < end; i++) {
    const directiveDef = tView.data[i];
    ngDevMode && assertDefined(directiveDef, "Expecting DirectiveDef");
    const lifecycleHooks = directiveDef.type.prototype;
    const { ngAfterContentInit, ngAfterContentChecked, ngAfterViewInit, ngAfterViewChecked, ngOnDestroy } = lifecycleHooks;
    if (ngAfterContentInit) {
      (tView.contentHooks || (tView.contentHooks = [])).push(-i, ngAfterContentInit);
    }
    if (ngAfterContentChecked) {
      (tView.contentHooks || (tView.contentHooks = [])).push(i, ngAfterContentChecked);
      (tView.contentCheckHooks || (tView.contentCheckHooks = [])).push(i, ngAfterContentChecked);
    }
    if (ngAfterViewInit) {
      (tView.viewHooks || (tView.viewHooks = [])).push(-i, ngAfterViewInit);
    }
    if (ngAfterViewChecked) {
      (tView.viewHooks || (tView.viewHooks = [])).push(i, ngAfterViewChecked);
      (tView.viewCheckHooks || (tView.viewCheckHooks = [])).push(i, ngAfterViewChecked);
    }
    if (ngOnDestroy != null) {
      (tView.destroyHooks || (tView.destroyHooks = [])).push(i, ngOnDestroy);
    }
  }
}
function executeCheckHooks(lView, hooks, nodeIndex) {
  callHooks(lView, hooks, 3, nodeIndex);
}
function executeInitAndCheckHooks(lView, hooks, initPhase, nodeIndex) {
  ngDevMode && assertNotEqual(initPhase, 3, "Init pre-order hooks should not be called more than once");
  if ((lView[FLAGS] & 3) === initPhase) {
    callHooks(lView, hooks, initPhase, nodeIndex);
  }
}
function incrementInitPhaseFlags(lView, initPhase) {
  ngDevMode && assertNotEqual(initPhase, 3, "Init hooks phase should not be incremented after all init hooks have been run.");
  let flags = lView[FLAGS];
  if ((flags & 3) === initPhase) {
    flags &= 2047;
    flags += 1;
    lView[FLAGS] = flags;
  }
}
function callHooks(currentView, arr, initPhase, currentNodeIndex) {
  ngDevMode && assertEqual(isInCheckNoChangesMode(), false, "Hooks should never be run when in check no changes mode.");
  const startIndex = currentNodeIndex !== void 0 ? currentView[PREORDER_HOOK_FLAGS] & 65535 : 0;
  const nodeIndexLimit = currentNodeIndex != null ? currentNodeIndex : -1;
  const max = arr.length - 1;
  let lastNodeIndexFound = 0;
  for (let i = startIndex; i < max; i++) {
    const hook = arr[i + 1];
    if (typeof hook === "number") {
      lastNodeIndexFound = arr[i];
      if (currentNodeIndex != null && lastNodeIndexFound >= currentNodeIndex) {
        break;
      }
    } else {
      const isInitHook = arr[i] < 0;
      if (isInitHook)
        currentView[PREORDER_HOOK_FLAGS] += 65536;
      if (lastNodeIndexFound < nodeIndexLimit || nodeIndexLimit == -1) {
        callHook(currentView, initPhase, arr, i);
        currentView[PREORDER_HOOK_FLAGS] = (currentView[PREORDER_HOOK_FLAGS] & 4294901760) + i + 2;
      }
      i++;
    }
  }
}
function callHook(currentView, initPhase, arr, i) {
  const isInitHook = arr[i] < 0;
  const hook = arr[i + 1];
  const directiveIndex = isInitHook ? -arr[i] : arr[i];
  const directive = currentView[directiveIndex];
  if (isInitHook) {
    const indexWithintInitPhase = currentView[FLAGS] >> 11;
    if (indexWithintInitPhase < currentView[PREORDER_HOOK_FLAGS] >> 16 && (currentView[FLAGS] & 3) === initPhase) {
      currentView[FLAGS] += 2048;
      profiler(4, directive, hook);
      try {
        hook.call(directive);
      } finally {
        profiler(5, directive, hook);
      }
    }
  } else {
    profiler(4, directive, hook);
    try {
      hook.call(directive);
    } finally {
      profiler(5, directive, hook);
    }
  }
}
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
const NO_PARENT_INJECTOR = -1;
class NodeInjectorFactory {
  constructor(factory, isViewProvider, injectImplementation) {
    this.factory = factory;
    this.resolving = false;
    ngDevMode && assertDefined(factory, "Factory not specified");
    ngDevMode && assertEqual(typeof factory, "function", "Expected factory function.");
    this.canSeeViewProviders = isViewProvider;
    this.injectImpl = injectImplementation;
  }
}
function isFactory(obj) {
  return obj instanceof NodeInjectorFactory;
}
function toTNodeTypeAsString(tNodeType) {
  let text = "";
  tNodeType & 1 && (text += "|Text");
  tNodeType & 2 && (text += "|Element");
  tNodeType & 4 && (text += "|Container");
  tNodeType & 8 && (text += "|ElementContainer");
  tNodeType & 16 && (text += "|Projection");
  tNodeType & 32 && (text += "|IcuContainer");
  tNodeType & 64 && (text += "|Placeholder");
  return text.length > 0 ? text.substring(1) : text;
}
function hasClassInput(tNode) {
  return (tNode.flags & 16) !== 0;
}
function hasStyleInput(tNode) {
  return (tNode.flags & 32) !== 0;
}
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
function assertTNodeType(tNode, expectedTypes, message) {
  assertDefined(tNode, "should be called with a TNode");
  if ((tNode.type & expectedTypes) === 0) {
    throwError(message || `Expected [${toTNodeTypeAsString(expectedTypes)}] but got ${toTNodeTypeAsString(tNode.type)}.`);
  }
}
function assertPureTNodeType(type) {
  if (!(type === 2 || //
  type === 1 || //
  type === 4 || //
  type === 8 || //
  type === 32 || //
  type === 16 || //
  type === 64)) {
    throwError(`Expected TNodeType to have only a single type selected, but got ${toTNodeTypeAsString(type)}.`);
  }
}
function setUpAttributes(renderer, native, attrs) {
  const isProc = isProceduralRenderer(renderer);
  let i = 0;
  while (i < attrs.length) {
    const value = attrs[i];
    if (typeof value === "number") {
      if (value !== 0) {
        break;
      }
      i++;
      const namespaceURI = attrs[i++];
      const attrName = attrs[i++];
      const attrVal = attrs[i++];
      ngDevMode && ngDevMode.rendererSetAttribute++;
      isProc ? renderer.setAttribute(native, attrName, attrVal, namespaceURI) : native.setAttributeNS(namespaceURI, attrName, attrVal);
    } else {
      const attrName = value;
      const attrVal = attrs[++i];
      ngDevMode && ngDevMode.rendererSetAttribute++;
      if (isAnimationProp(attrName)) {
        if (isProc) {
          renderer.setProperty(native, attrName, attrVal);
        }
      } else {
        isProc ? renderer.setAttribute(native, attrName, attrVal) : native.setAttribute(attrName, attrVal);
      }
      i++;
    }
  }
  return i;
}
function isNameOnlyAttributeMarker(marker) {
  return marker === 3 || marker === 4 || marker === 6;
}
function isAnimationProp(name) {
  return name.charCodeAt(0) === 64;
}
function mergeHostAttrs(dst, src) {
  if (src === null || src.length === 0) ;
  else if (dst === null || dst.length === 0) {
    dst = src.slice();
  } else {
    let srcMarker = -1;
    for (let i = 0; i < src.length; i++) {
      const item = src[i];
      if (typeof item === "number") {
        srcMarker = item;
      } else {
        if (srcMarker === 0) ;
        else if (srcMarker === -1 || srcMarker === 2) {
          mergeHostAttribute(dst, srcMarker, item, null, src[++i]);
        } else {
          mergeHostAttribute(dst, srcMarker, item, null, null);
        }
      }
    }
  }
  return dst;
}
function mergeHostAttribute(dst, marker, key1, key2, value) {
  let i = 0;
  let markerInsertPosition = dst.length;
  if (marker === -1) {
    markerInsertPosition = -1;
  } else {
    while (i < dst.length) {
      const dstValue = dst[i++];
      if (typeof dstValue === "number") {
        if (dstValue === marker) {
          markerInsertPosition = -1;
          break;
        } else if (dstValue > marker) {
          markerInsertPosition = i - 1;
          break;
        }
      }
    }
  }
  while (i < dst.length) {
    const item = dst[i];
    if (typeof item === "number") {
      break;
    } else if (item === key1) {
      {
        if (value !== null) {
          dst[i + 1] = value;
        }
        return;
      }
    }
    i++;
    if (value !== null)
      i++;
  }
  if (markerInsertPosition !== -1) {
    dst.splice(markerInsertPosition, 0, marker);
    i = markerInsertPosition + 1;
  }
  dst.splice(i++, 0, key1);
  if (value !== null) {
    dst.splice(i++, 0, value);
  }
}
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
function hasParentInjector(parentLocation) {
  return parentLocation !== NO_PARENT_INJECTOR;
}
function getParentInjectorIndex(parentLocation) {
  ngDevMode && assertNumber(parentLocation, "Number expected");
  ngDevMode && assertNotEqual(parentLocation, -1, "Not a valid state.");
  const parentInjectorIndex = parentLocation & 32767;
  ngDevMode && assertGreaterThan(parentInjectorIndex, HEADER_OFFSET, "Parent injector must be pointing past HEADER_OFFSET.");
  return parentLocation & 32767;
}
function getParentInjectorViewOffset(parentLocation) {
  return parentLocation >> 16;
}
function getParentInjectorView(location2, startView) {
  let viewOffset = getParentInjectorViewOffset(location2);
  let parentView = startView;
  while (viewOffset > 0) {
    parentView = parentView[DECLARATION_VIEW];
    viewOffset--;
  }
  return parentView;
}
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
let includeViewProviders = true;
function setIncludeViewProviders(v) {
  const oldValue = includeViewProviders;
  includeViewProviders = v;
  return oldValue;
}
const BLOOM_SIZE = 256;
const BLOOM_MASK = BLOOM_SIZE - 1;
const BLOOM_BUCKET_BITS = 5;
let nextNgElementId = 0;
function bloomAdd(injectorIndex, tView, type) {
  ngDevMode && assertEqual(tView.firstCreatePass, true, "expected firstCreatePass to be true");
  let id;
  if (typeof type === "string") {
    id = type.charCodeAt(0) || 0;
  } else if (type.hasOwnProperty(NG_ELEMENT_ID)) {
    id = type[NG_ELEMENT_ID];
  }
  if (id == null) {
    id = type[NG_ELEMENT_ID] = nextNgElementId++;
  }
  const bloomHash = id & BLOOM_MASK;
  const mask = 1 << bloomHash;
  tView.data[injectorIndex + (bloomHash >> BLOOM_BUCKET_BITS)] |= mask;
}
function getOrCreateNodeInjectorForNode(tNode, lView) {
  const existingInjectorIndex = getInjectorIndex(tNode, lView);
  if (existingInjectorIndex !== -1) {
    return existingInjectorIndex;
  }
  const tView = lView[TVIEW];
  if (tView.firstCreatePass) {
    tNode.injectorIndex = lView.length;
    insertBloom(tView.data, tNode);
    insertBloom(lView, null);
    insertBloom(tView.blueprint, null);
  }
  const parentLoc = getParentInjectorLocation(tNode, lView);
  const injectorIndex = tNode.injectorIndex;
  if (hasParentInjector(parentLoc)) {
    const parentIndex = getParentInjectorIndex(parentLoc);
    const parentLView = getParentInjectorView(parentLoc, lView);
    const parentData = parentLView[TVIEW].data;
    for (let i = 0; i < 8; i++) {
      lView[injectorIndex + i] = parentLView[parentIndex + i] | parentData[parentIndex + i];
    }
  }
  lView[
    injectorIndex + 8
    /* PARENT */
  ] = parentLoc;
  return injectorIndex;
}
function insertBloom(arr, footer) {
  arr.push(0, 0, 0, 0, 0, 0, 0, 0, footer);
}
function getInjectorIndex(tNode, lView) {
  if (tNode.injectorIndex === -1 || // If the injector index is the same as its parent's injector index, then the index has been
  // copied down from the parent node. No injector has been created yet on this node.
  tNode.parent && tNode.parent.injectorIndex === tNode.injectorIndex || // After the first template pass, the injector index might exist but the parent values
  // might not have been calculated yet for this instance
  lView[
    tNode.injectorIndex + 8
    /* PARENT */
  ] === null) {
    return -1;
  } else {
    ngDevMode && assertIndexInRange(lView, tNode.injectorIndex);
    return tNode.injectorIndex;
  }
}
function getParentInjectorLocation(tNode, lView) {
  if (tNode.parent && tNode.parent.injectorIndex !== -1) {
    return tNode.parent.injectorIndex;
  }
  let declarationViewOffset = 0;
  let parentTNode = null;
  let lViewCursor = lView;
  while (lViewCursor !== null) {
    const tView = lViewCursor[TVIEW];
    const tViewType = tView.type;
    if (tViewType === 2) {
      ngDevMode && assertDefined(tView.declTNode, "Embedded TNodes should have declaration parents.");
      parentTNode = tView.declTNode;
    } else if (tViewType === 1) {
      parentTNode = lViewCursor[T_HOST];
    } else {
      ngDevMode && assertEqual(tView.type, 0, "Root type expected");
      parentTNode = null;
    }
    if (parentTNode === null) {
      return NO_PARENT_INJECTOR;
    }
    ngDevMode && parentTNode && assertTNodeForLView(parentTNode, lViewCursor[DECLARATION_VIEW]);
    declarationViewOffset++;
    lViewCursor = lViewCursor[DECLARATION_VIEW];
    if (parentTNode.injectorIndex !== -1) {
      return parentTNode.injectorIndex | declarationViewOffset << 16;
    }
  }
  return NO_PARENT_INJECTOR;
}
function diPublicInInjector(injectorIndex, tView, token) {
  bloomAdd(injectorIndex, tView, token);
}
function injectAttributeImpl(tNode, attrNameToInject) {
  ngDevMode && assertTNodeType(
    tNode,
    12 | 3
    /* AnyRNode */
  );
  ngDevMode && assertDefined(tNode, "expecting tNode");
  if (attrNameToInject === "class") {
    return tNode.classes;
  }
  if (attrNameToInject === "style") {
    return tNode.styles;
  }
  const attrs = tNode.attrs;
  if (attrs) {
    const attrsLength = attrs.length;
    let i = 0;
    while (i < attrsLength) {
      const value = attrs[i];
      if (isNameOnlyAttributeMarker(value))
        break;
      if (value === 0) {
        i = i + 2;
      } else if (typeof value === "number") {
        i++;
        while (i < attrsLength && typeof attrs[i] === "string") {
          i++;
        }
      } else if (value === attrNameToInject) {
        return attrs[i + 1];
      } else {
        i = i + 2;
      }
    }
  }
  return null;
}
function notFoundValueOrThrow(notFoundValue, token, flags) {
  if (flags & InjectFlags.Optional) {
    return notFoundValue;
  } else {
    throwProviderNotFoundError(token, "NodeInjector");
  }
}
function lookupTokenUsingModuleInjector(lView, token, flags, notFoundValue) {
  if (flags & InjectFlags.Optional && notFoundValue === void 0) {
    notFoundValue = null;
  }
  if ((flags & (InjectFlags.Self | InjectFlags.Host)) === 0) {
    const moduleInjector = lView[INJECTOR$1];
    const previousInjectImplementation = setInjectImplementation(void 0);
    try {
      if (moduleInjector) {
        return moduleInjector.get(token, notFoundValue, flags & InjectFlags.Optional);
      } else {
        return injectRootLimpMode(token, notFoundValue, flags & InjectFlags.Optional);
      }
    } finally {
      setInjectImplementation(previousInjectImplementation);
    }
  }
  return notFoundValueOrThrow(notFoundValue, token, flags);
}
function getOrCreateInjectable(tNode, lView, token, flags = InjectFlags.Default, notFoundValue) {
  if (tNode !== null) {
    const bloomHash = bloomHashBitOrFactory(token);
    if (typeof bloomHash === "function") {
      if (!enterDI(lView, tNode, flags)) {
        return flags & InjectFlags.Host ? notFoundValueOrThrow(notFoundValue, token, flags) : lookupTokenUsingModuleInjector(lView, token, flags, notFoundValue);
      }
      try {
        const value = bloomHash(flags);
        if (value == null && !(flags & InjectFlags.Optional)) {
          throwProviderNotFoundError(token);
        } else {
          return value;
        }
      } finally {
        leaveDI();
      }
    } else if (typeof bloomHash === "number") {
      let previousTView = null;
      let injectorIndex = getInjectorIndex(tNode, lView);
      let parentLocation = NO_PARENT_INJECTOR;
      let hostTElementNode = flags & InjectFlags.Host ? lView[DECLARATION_COMPONENT_VIEW][T_HOST] : null;
      if (injectorIndex === -1 || flags & InjectFlags.SkipSelf) {
        parentLocation = injectorIndex === -1 ? getParentInjectorLocation(tNode, lView) : lView[
          injectorIndex + 8
          /* PARENT */
        ];
        if (parentLocation === NO_PARENT_INJECTOR || !shouldSearchParent(flags, false)) {
          injectorIndex = -1;
        } else {
          previousTView = lView[TVIEW];
          injectorIndex = getParentInjectorIndex(parentLocation);
          lView = getParentInjectorView(parentLocation, lView);
        }
      }
      while (injectorIndex !== -1) {
        ngDevMode && assertNodeInjector(lView, injectorIndex);
        const tView = lView[TVIEW];
        ngDevMode && assertTNodeForLView(tView.data[
          injectorIndex + 8
          /* TNODE */
        ], lView);
        if (bloomHasToken(bloomHash, injectorIndex, tView.data)) {
          const instance = searchTokensOnInjector(injectorIndex, lView, token, previousTView, flags, hostTElementNode);
          if (instance !== NOT_FOUND) {
            return instance;
          }
        }
        parentLocation = lView[
          injectorIndex + 8
          /* PARENT */
        ];
        if (parentLocation !== NO_PARENT_INJECTOR && shouldSearchParent(flags, lView[TVIEW].data[
          injectorIndex + 8
          /* TNODE */
        ] === hostTElementNode) && bloomHasToken(bloomHash, injectorIndex, lView)) {
          previousTView = tView;
          injectorIndex = getParentInjectorIndex(parentLocation);
          lView = getParentInjectorView(parentLocation, lView);
        } else {
          injectorIndex = -1;
        }
      }
    }
  }
  return lookupTokenUsingModuleInjector(lView, token, flags, notFoundValue);
}
const NOT_FOUND = {};
function createNodeInjector() {
  return new NodeInjector(getCurrentTNode(), getLView());
}
function searchTokensOnInjector(injectorIndex, lView, token, previousTView, flags, hostTElementNode) {
  const currentTView = lView[TVIEW];
  const tNode = currentTView.data[
    injectorIndex + 8
    /* TNODE */
  ];
  const canAccessViewProviders = previousTView == null ? (
    // 1) This is the first invocation `previousTView == null` which means that we are at the
    // `TNode` of where injector is starting to look. In such a case the only time we are allowed
    // to look into the ViewProviders is if:
    // - we are on a component
    // - AND the injector set `includeViewProviders` to true (implying that the token can see
    // ViewProviders because it is the Component or a Service which itself was declared in
    // ViewProviders)
    isComponentHost(tNode) && includeViewProviders
  ) : (
    // 2) `previousTView != null` which means that we are now walking across the parent nodes.
    // In such a case we are only allowed to look into the ViewProviders if:
    // - We just crossed from child View to Parent View `previousTView != currentTView`
    // - AND the parent TNode is an Element.
    // This means that we just came from the Component's View and therefore are allowed to see
    // into the ViewProviders.
    previousTView != currentTView && (tNode.type & 3) !== 0
  );
  const isHostSpecialCase = flags & InjectFlags.Host && hostTElementNode === tNode;
  const injectableIdx = locateDirectiveOrProvider(tNode, currentTView, token, canAccessViewProviders, isHostSpecialCase);
  if (injectableIdx !== null) {
    return getNodeInjectable(lView, currentTView, injectableIdx, tNode);
  } else {
    return NOT_FOUND;
  }
}
function locateDirectiveOrProvider(tNode, tView, token, canAccessViewProviders, isHostSpecialCase) {
  const nodeProviderIndexes = tNode.providerIndexes;
  const tInjectables = tView.data;
  const injectablesStart = nodeProviderIndexes & 1048575;
  const directivesStart = tNode.directiveStart;
  const directiveEnd = tNode.directiveEnd;
  const cptViewProvidersCount = nodeProviderIndexes >> 20;
  const startingIndex = canAccessViewProviders ? injectablesStart : injectablesStart + cptViewProvidersCount;
  const endIndex = isHostSpecialCase ? injectablesStart + cptViewProvidersCount : directiveEnd;
  for (let i = startingIndex; i < endIndex; i++) {
    const providerTokenOrDef = tInjectables[i];
    if (i < directivesStart && token === providerTokenOrDef || i >= directivesStart && providerTokenOrDef.type === token) {
      return i;
    }
  }
  if (isHostSpecialCase) {
    const dirDef = tInjectables[directivesStart];
    if (dirDef && isComponentDef(dirDef) && dirDef.type === token) {
      return directivesStart;
    }
  }
  return null;
}
function getNodeInjectable(lView, tView, index, tNode) {
  let value = lView[index];
  const tData = tView.data;
  if (isFactory(value)) {
    const factory = value;
    if (factory.resolving) {
      throwCyclicDependencyError(stringifyForError(tData[index]));
    }
    const previousIncludeViewProviders = setIncludeViewProviders(factory.canSeeViewProviders);
    factory.resolving = true;
    const previousInjectImplementation = factory.injectImpl ? setInjectImplementation(factory.injectImpl) : null;
    const success = enterDI(lView, tNode, InjectFlags.Default);
    ngDevMode && assertEqual(success, true, "Because flags do not contain `SkipSelf' we expect this to always succeed.");
    try {
      value = lView[index] = factory.factory(void 0, tData, lView, tNode);
      if (tView.firstCreatePass && index >= tNode.directiveStart) {
        ngDevMode && assertDirectiveDef(tData[index]);
        registerPreOrderHooks(index, tData[index], tView);
      }
    } finally {
      previousInjectImplementation !== null && setInjectImplementation(previousInjectImplementation);
      setIncludeViewProviders(previousIncludeViewProviders);
      factory.resolving = false;
      leaveDI();
    }
  }
  return value;
}
function bloomHashBitOrFactory(token) {
  ngDevMode && assertDefined(token, "token must be defined");
  if (typeof token === "string") {
    return token.charCodeAt(0) || 0;
  }
  const tokenId = (
    // First check with `hasOwnProperty` so we don't get an inherited ID.
    token.hasOwnProperty(NG_ELEMENT_ID) ? token[NG_ELEMENT_ID] : void 0
  );
  if (typeof tokenId === "number") {
    if (tokenId >= 0) {
      return tokenId & BLOOM_MASK;
    } else {
      ngDevMode && assertEqual(tokenId, -1, "Expecting to get Special Injector Id");
      return createNodeInjector;
    }
  } else {
    return tokenId;
  }
}
function bloomHasToken(bloomHash, injectorIndex, injectorView) {
  const mask = 1 << bloomHash;
  const value = injectorView[injectorIndex + (bloomHash >> BLOOM_BUCKET_BITS)];
  return !!(value & mask);
}
function shouldSearchParent(flags, isFirstHostTNode) {
  return !(flags & InjectFlags.Self) && !(flags & InjectFlags.Host && isFirstHostTNode);
}
class NodeInjector {
  constructor(_tNode, _lView) {
    this._tNode = _tNode;
    this._lView = _lView;
  }
  get(token, notFoundValue, flags) {
    return getOrCreateInjectable(this._tNode, this._lView, token, flags, notFoundValue);
  }
}
function ɵɵgetInheritedFactory(type) {
  return noSideEffects(() => {
    const ownConstructor = type.prototype.constructor;
    const ownFactory = ownConstructor[NG_FACTORY_DEF] || getFactoryOf(ownConstructor);
    const objectPrototype = Object.prototype;
    let parent = Object.getPrototypeOf(type.prototype).constructor;
    while (parent && parent !== objectPrototype) {
      const factory = parent[NG_FACTORY_DEF] || getFactoryOf(parent);
      if (factory && factory !== ownFactory) {
        return factory;
      }
      parent = Object.getPrototypeOf(parent);
    }
    return (t) => new t();
  });
}
function getFactoryOf(type) {
  if (isForwardRef(type)) {
    return () => {
      const factory = getFactoryOf(resolveForwardRef(type));
      return factory && factory();
    };
  }
  return getFactoryDef(type);
}
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
function ɵɵinjectAttribute(attrNameToInject) {
  return injectAttributeImpl(getCurrentTNode(), attrNameToInject);
}
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
const ANNOTATIONS = "__annotations__";
const PARAMETERS = "__parameters__";
const PROP_METADATA = "__prop__metadata__";
function makeDecorator(name, props, parentClass, additionalProcessing, typeFn) {
  return noSideEffects(() => {
    const metaCtor = makeMetadataCtor(props);
    function DecoratorFactory(...args) {
      if (this instanceof DecoratorFactory) {
        metaCtor.call(this, ...args);
        return this;
      }
      const annotationInstance = new DecoratorFactory(...args);
      return function TypeDecorator(cls) {
        if (typeFn)
          typeFn(cls, ...args);
        const annotations = cls.hasOwnProperty(ANNOTATIONS) ? cls[ANNOTATIONS] : Object.defineProperty(cls, ANNOTATIONS, { value: [] })[ANNOTATIONS];
        annotations.push(annotationInstance);
        if (additionalProcessing)
          additionalProcessing(cls);
        return cls;
      };
    }
    if (parentClass) {
      DecoratorFactory.prototype = Object.create(parentClass.prototype);
    }
    DecoratorFactory.prototype.ngMetadataName = name;
    DecoratorFactory.annotationCls = DecoratorFactory;
    return DecoratorFactory;
  });
}
function makeMetadataCtor(props) {
  return function ctor(...args) {
    if (props) {
      const values = props(...args);
      for (const propName in values) {
        this[propName] = values[propName];
      }
    }
  };
}
function makeParamDecorator(name, props, parentClass) {
  return noSideEffects(() => {
    const metaCtor = makeMetadataCtor(props);
    function ParamDecoratorFactory(...args) {
      if (this instanceof ParamDecoratorFactory) {
        metaCtor.apply(this, args);
        return this;
      }
      const annotationInstance = new ParamDecoratorFactory(...args);
      ParamDecorator.annotation = annotationInstance;
      return ParamDecorator;
      function ParamDecorator(cls, unusedKey, index) {
        const parameters = cls.hasOwnProperty(PARAMETERS) ? cls[PARAMETERS] : Object.defineProperty(cls, PARAMETERS, { value: [] })[PARAMETERS];
        while (parameters.length <= index) {
          parameters.push(null);
        }
        (parameters[index] = parameters[index] || []).push(annotationInstance);
        return cls;
      }
    }
    ParamDecoratorFactory.prototype.ngMetadataName = name;
    ParamDecoratorFactory.annotationCls = ParamDecoratorFactory;
    return ParamDecoratorFactory;
  });
}
function makePropDecorator(name, props, parentClass, additionalProcessing) {
  return noSideEffects(() => {
    const metaCtor = makeMetadataCtor(props);
    function PropDecoratorFactory(...args) {
      if (this instanceof PropDecoratorFactory) {
        metaCtor.apply(this, args);
        return this;
      }
      const decoratorInstance = new PropDecoratorFactory(...args);
      function PropDecorator(target, name2) {
        const constructor = target.constructor;
        const meta = constructor.hasOwnProperty(PROP_METADATA) ? constructor[PROP_METADATA] : Object.defineProperty(constructor, PROP_METADATA, { value: {} })[PROP_METADATA];
        meta[name2] = meta.hasOwnProperty(name2) && meta[name2] || [];
        meta[name2].unshift(decoratorInstance);
      }
      return PropDecorator;
    }
    if (parentClass) {
      PropDecoratorFactory.prototype = Object.create(parentClass.prototype);
    }
    PropDecoratorFactory.prototype.ngMetadataName = name;
    PropDecoratorFactory.annotationCls = PropDecoratorFactory;
    return PropDecoratorFactory;
  });
}
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
const Attribute = makeParamDecorator("Attribute", (attributeName) => ({ attributeName, __NG_ELEMENT_ID__: () => ɵɵinjectAttribute(attributeName) }));
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
class InjectionToken {
  /**
   * @param _desc   Description for the token,
   *                used only for debugging purposes,
   *                it should but does not need to be unique
   * @param options Options for the token's usage, as described above
   */
  constructor(_desc, options) {
    this._desc = _desc;
    this.ngMetadataName = "InjectionToken";
    this.ɵprov = void 0;
    if (typeof options == "number") {
      (typeof ngDevMode === "undefined" || ngDevMode) && assertLessThan(options, 0, "Only negative numbers are supported here");
      this.__NG_ELEMENT_ID__ = options;
    } else if (options !== void 0) {
      this.ɵprov = ɵɵdefineInjectable({
        token: this,
        providedIn: options.providedIn || "root",
        factory: options.factory
      });
    }
  }
  toString() {
    return `InjectionToken ${this._desc}`;
  }
}
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
const ANALYZE_FOR_ENTRY_COMPONENTS = new InjectionToken("AnalyzeForEntryComponents");
const emitDistinctChangesOnlyDefaultValue = true;
class Query {
}
const ContentChildren = makePropDecorator("ContentChildren", (selector, data = {}) => ({
  selector,
  first: false,
  isViewQuery: false,
  descendants: false,
  emitDistinctChangesOnly: emitDistinctChangesOnlyDefaultValue,
  ...data
}), Query);
const ContentChild = makePropDecorator("ContentChild", (selector, data = {}) => ({ selector, first: true, isViewQuery: false, descendants: true, ...data }), Query);
const ViewChildren = makePropDecorator("ViewChildren", (selector, data = {}) => ({
  selector,
  first: false,
  isViewQuery: true,
  descendants: true,
  emitDistinctChangesOnly: emitDistinctChangesOnlyDefaultValue,
  ...data
}), Query);
const ViewChild = makePropDecorator("ViewChild", (selector, data) => ({ selector, first: true, isViewQuery: true, descendants: true, ...data }), Query);
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
var FactoryTarget;
(function(FactoryTarget2) {
  FactoryTarget2[FactoryTarget2["Directive"] = 0] = "Directive";
  FactoryTarget2[FactoryTarget2["Component"] = 1] = "Component";
  FactoryTarget2[FactoryTarget2["Injectable"] = 2] = "Injectable";
  FactoryTarget2[FactoryTarget2["Pipe"] = 3] = "Pipe";
  FactoryTarget2[FactoryTarget2["NgModule"] = 4] = "NgModule";
})(FactoryTarget || (FactoryTarget = {}));
var ViewEncapsulation;
(function(ViewEncapsulation2) {
  ViewEncapsulation2[ViewEncapsulation2["Emulated"] = 0] = "Emulated";
  ViewEncapsulation2[ViewEncapsulation2["None"] = 2] = "None";
  ViewEncapsulation2[ViewEncapsulation2["ShadowDom"] = 3] = "ShadowDom";
})(ViewEncapsulation || (ViewEncapsulation = {}));
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
function getCompilerFacade(request) {
  const globalNg = _global["ng"];
  if (globalNg && globalNg.ɵcompilerFacade) {
    return globalNg.ɵcompilerFacade;
  }
  if (typeof ngDevMode === "undefined" || ngDevMode) {
    console.error(`JIT compilation failed for ${request.kind}`, request.type);
    let message = `The ${request.kind} '${request.type.name}' needs to be compiled using the JIT compiler, but '@angular/compiler' is not available.

`;
    if (request.usage === 1) {
      message += `The ${request.kind} is part of a library that has been partially compiled.
`;
      message += `However, the Angular Linker has not processed the library such that JIT compilation is used as fallback.
`;
      message += "\n";
      message += `Ideally, the library is processed using the Angular Linker to become fully AOT compiled.
`;
    } else {
      message += `JIT compilation is discouraged for production use-cases! Consider using AOT mode instead.
`;
    }
    message += `Alternatively, the JIT compiler should be loaded by bootstrapping using '@angular/platform-browser-dynamic' or '@angular/platform-server',
`;
    message += `or manually provide the compiler with 'import "@angular/compiler";' before bootstrapping.`;
    throw new Error(message);
  } else {
    throw new Error("JIT compiler unavailable");
  }
}
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
const Type = Function;
function isType(v) {
  return typeof v === "function";
}
function arrayEquals(a, b, identityAccessor) {
  if (a.length !== b.length)
    return false;
  for (let i = 0; i < a.length; i++) {
    let valueA = a[i];
    let valueB = b[i];
    if (identityAccessor) {
      valueA = identityAccessor(valueA);
      valueB = identityAccessor(valueB);
    }
    if (valueB !== valueA) {
      return false;
    }
  }
  return true;
}
function flatten(list, dst) {
  if (dst === void 0)
    dst = list;
  for (let i = 0; i < list.length; i++) {
    let item = list[i];
    if (Array.isArray(item)) {
      if (dst === list) {
        dst = list.slice(0, i);
      }
      flatten(item, dst);
    } else if (dst !== list) {
      dst.push(item);
    }
  }
  return dst;
}
function deepForEach$1(input, fn) {
  input.forEach((value) => Array.isArray(value) ? deepForEach$1(value, fn) : fn(value));
}
function addToArray(arr, index, value) {
  if (index >= arr.length) {
    arr.push(value);
  } else {
    arr.splice(index, 0, value);
  }
}
function removeFromArray(arr, index) {
  if (index >= arr.length - 1) {
    return arr.pop();
  } else {
    return arr.splice(index, 1)[0];
  }
}
function newArray(size, value) {
  const list = [];
  for (let i = 0; i < size; i++) {
    list.push(value);
  }
  return list;
}
function arrayInsert2(array, index, value1, value2) {
  ngDevMode && assertLessThanOrEqual(index, array.length, "Can't insert past array end.");
  let end = array.length;
  if (end == index) {
    array.push(value1, value2);
  } else if (end === 1) {
    array.push(value2, array[0]);
    array[0] = value1;
  } else {
    end--;
    array.push(array[end - 1], array[end]);
    while (end > index) {
      const previousEnd = end - 2;
      array[end] = array[previousEnd];
      end--;
    }
    array[index] = value1;
    array[index + 1] = value2;
  }
}
function keyValueArraySet(keyValueArray, key, value) {
  let index = keyValueArrayIndexOf(keyValueArray, key);
  if (index >= 0) {
    keyValueArray[index | 1] = value;
  } else {
    index = ~index;
    arrayInsert2(keyValueArray, index, key, value);
  }
  return index;
}
function keyValueArrayGet(keyValueArray, key) {
  const index = keyValueArrayIndexOf(keyValueArray, key);
  if (index >= 0) {
    return keyValueArray[index | 1];
  }
  return void 0;
}
function keyValueArrayIndexOf(keyValueArray, key) {
  return _arrayIndexOfSorted(keyValueArray, key, 1);
}
function _arrayIndexOfSorted(array, value, shift) {
  ngDevMode && assertEqual(Array.isArray(array), true, "Expecting an array");
  let start = 0;
  let end = array.length >> shift;
  while (end !== start) {
    const middle = start + (end - start >> 1);
    const current = array[middle << shift];
    if (value === current) {
      return middle << shift;
    } else if (current > value) {
      end = middle;
    } else {
      start = middle + 1;
    }
  }
  return ~(end << shift);
}
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
const ES5_DELEGATE_CTOR = /^function\s+\S+\(\)\s*{[\s\S]+\.apply\(this,\s*(arguments|(?:[^()]+\(\[\],)?[^()]+\(arguments\).*)\)/;
const ES2015_INHERITED_CLASS = /^class\s+[A-Za-z\d$_]*\s*extends\s+[^{]+{/;
const ES2015_INHERITED_CLASS_WITH_CTOR = /^class\s+[A-Za-z\d$_]*\s*extends\s+[^{]+{[\s\S]*constructor\s*\(/;
const ES2015_INHERITED_CLASS_WITH_DELEGATE_CTOR = /^class\s+[A-Za-z\d$_]*\s*extends\s+[^{]+{[\s\S]*constructor\s*\(\)\s*{[^}]*super\(\.\.\.arguments\)/;
function isDelegateCtor(typeStr) {
  return ES5_DELEGATE_CTOR.test(typeStr) || ES2015_INHERITED_CLASS_WITH_DELEGATE_CTOR.test(typeStr) || ES2015_INHERITED_CLASS.test(typeStr) && !ES2015_INHERITED_CLASS_WITH_CTOR.test(typeStr);
}
class ReflectionCapabilities {
  constructor(reflect) {
    this._reflect = reflect || _global["Reflect"];
  }
  isReflectionEnabled() {
    return true;
  }
  factory(t) {
    return (...args) => new t(...args);
  }
  /** @internal */
  _zipTypesAndAnnotations(paramTypes, paramAnnotations) {
    let result;
    if (typeof paramTypes === "undefined") {
      result = newArray(paramAnnotations.length);
    } else {
      result = newArray(paramTypes.length);
    }
    for (let i = 0; i < result.length; i++) {
      if (typeof paramTypes === "undefined") {
        result[i] = [];
      } else if (paramTypes[i] && paramTypes[i] != Object) {
        result[i] = [paramTypes[i]];
      } else {
        result[i] = [];
      }
      if (paramAnnotations && paramAnnotations[i] != null) {
        result[i] = result[i].concat(paramAnnotations[i]);
      }
    }
    return result;
  }
  _ownParameters(type, parentCtor) {
    const typeStr = type.toString();
    if (isDelegateCtor(typeStr)) {
      return null;
    }
    if (type.parameters && type.parameters !== parentCtor.parameters) {
      return type.parameters;
    }
    const tsickleCtorParams = type.ctorParameters;
    if (tsickleCtorParams && tsickleCtorParams !== parentCtor.ctorParameters) {
      const ctorParameters = typeof tsickleCtorParams === "function" ? tsickleCtorParams() : tsickleCtorParams;
      const paramTypes2 = ctorParameters.map((ctorParam) => ctorParam && ctorParam.type);
      const paramAnnotations2 = ctorParameters.map((ctorParam) => ctorParam && convertTsickleDecoratorIntoMetadata(ctorParam.decorators));
      return this._zipTypesAndAnnotations(paramTypes2, paramAnnotations2);
    }
    const paramAnnotations = type.hasOwnProperty(PARAMETERS) && type[PARAMETERS];
    const paramTypes = this._reflect && this._reflect.getOwnMetadata && this._reflect.getOwnMetadata("design:paramtypes", type);
    if (paramTypes || paramAnnotations) {
      return this._zipTypesAndAnnotations(paramTypes, paramAnnotations);
    }
    return newArray(type.length);
  }
  parameters(type) {
    if (!isType(type)) {
      return [];
    }
    const parentCtor = getParentCtor(type);
    let parameters = this._ownParameters(type, parentCtor);
    if (!parameters && parentCtor !== Object) {
      parameters = this.parameters(parentCtor);
    }
    return parameters || [];
  }
  _ownAnnotations(typeOrFunc, parentCtor) {
    if (typeOrFunc.annotations && typeOrFunc.annotations !== parentCtor.annotations) {
      let annotations = typeOrFunc.annotations;
      if (typeof annotations === "function" && annotations.annotations) {
        annotations = annotations.annotations;
      }
      return annotations;
    }
    if (typeOrFunc.decorators && typeOrFunc.decorators !== parentCtor.decorators) {
      return convertTsickleDecoratorIntoMetadata(typeOrFunc.decorators);
    }
    if (typeOrFunc.hasOwnProperty(ANNOTATIONS)) {
      return typeOrFunc[ANNOTATIONS];
    }
    return null;
  }
  annotations(typeOrFunc) {
    if (!isType(typeOrFunc)) {
      return [];
    }
    const parentCtor = getParentCtor(typeOrFunc);
    const ownAnnotations = this._ownAnnotations(typeOrFunc, parentCtor) || [];
    const parentAnnotations = parentCtor !== Object ? this.annotations(parentCtor) : [];
    return parentAnnotations.concat(ownAnnotations);
  }
  _ownPropMetadata(typeOrFunc, parentCtor) {
    if (typeOrFunc.propMetadata && typeOrFunc.propMetadata !== parentCtor.propMetadata) {
      let propMetadata = typeOrFunc.propMetadata;
      if (typeof propMetadata === "function" && propMetadata.propMetadata) {
        propMetadata = propMetadata.propMetadata;
      }
      return propMetadata;
    }
    if (typeOrFunc.propDecorators && typeOrFunc.propDecorators !== parentCtor.propDecorators) {
      const propDecorators = typeOrFunc.propDecorators;
      const propMetadata = {};
      Object.keys(propDecorators).forEach((prop) => {
        propMetadata[prop] = convertTsickleDecoratorIntoMetadata(propDecorators[prop]);
      });
      return propMetadata;
    }
    if (typeOrFunc.hasOwnProperty(PROP_METADATA)) {
      return typeOrFunc[PROP_METADATA];
    }
    return null;
  }
  propMetadata(typeOrFunc) {
    if (!isType(typeOrFunc)) {
      return {};
    }
    const parentCtor = getParentCtor(typeOrFunc);
    const propMetadata = {};
    if (parentCtor !== Object) {
      const parentPropMetadata = this.propMetadata(parentCtor);
      Object.keys(parentPropMetadata).forEach((propName) => {
        propMetadata[propName] = parentPropMetadata[propName];
      });
    }
    const ownPropMetadata = this._ownPropMetadata(typeOrFunc, parentCtor);
    if (ownPropMetadata) {
      Object.keys(ownPropMetadata).forEach((propName) => {
        const decorators = [];
        if (propMetadata.hasOwnProperty(propName)) {
          decorators.push(...propMetadata[propName]);
        }
        decorators.push(...ownPropMetadata[propName]);
        propMetadata[propName] = decorators;
      });
    }
    return propMetadata;
  }
  ownPropMetadata(typeOrFunc) {
    if (!isType(typeOrFunc)) {
      return {};
    }
    return this._ownPropMetadata(typeOrFunc, getParentCtor(typeOrFunc)) || {};
  }
  hasLifecycleHook(type, lcProperty) {
    return type instanceof Type && lcProperty in type.prototype;
  }
  guards(type) {
    return {};
  }
  getter(name) {
    return new Function("o", "return o." + name + ";");
  }
  setter(name) {
    return new Function("o", "v", "return o." + name + " = v;");
  }
  method(name) {
    const functionBody = `if (!o.${name}) throw new Error('"${name}" is undefined');
        return o.${name}.apply(o, args);`;
    return new Function("o", "args", functionBody);
  }
  // There is not a concept of import uri in Js, but this is useful in developing Dart applications.
  importUri(type) {
    if (typeof type === "object" && type["filePath"]) {
      return type["filePath"];
    }
    return `./${stringify(type)}`;
  }
  resourceUri(type) {
    return `./${stringify(type)}`;
  }
  resolveIdentifier(name, moduleUrl, members, runtime) {
    return runtime;
  }
  resolveEnum(enumIdentifier, name) {
    return enumIdentifier[name];
  }
}
function convertTsickleDecoratorIntoMetadata(decoratorInvocations) {
  if (!decoratorInvocations) {
    return [];
  }
  return decoratorInvocations.map((decoratorInvocation) => {
    const decoratorType = decoratorInvocation.type;
    const annotationCls = decoratorType.annotationCls;
    const annotationArgs = decoratorInvocation.args ? decoratorInvocation.args : [];
    return new annotationCls(...annotationArgs);
  });
}
function getParentCtor(ctor) {
  const parentProto = ctor.prototype ? Object.getPrototypeOf(ctor.prototype) : null;
  const parentCtor = parentProto ? parentProto.constructor : null;
  return parentCtor || Object;
}
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
const _THROW_IF_NOT_FOUND = {};
const THROW_IF_NOT_FOUND = _THROW_IF_NOT_FOUND;
const DI_DECORATOR_FLAG = "__NG_DI_FLAG__";
const NG_TEMP_TOKEN_PATH = "ngTempTokenPath";
const NG_TOKEN_PATH = "ngTokenPath";
const NEW_LINE = /\n/gm;
const NO_NEW_LINE = "ɵ";
const SOURCE = "__source";
const USE_VALUE$1 = getClosureSafeProperty({ provide: String, useValue: getClosureSafeProperty });
let _currentInjector = void 0;
function setCurrentInjector(injector) {
  const former = _currentInjector;
  _currentInjector = injector;
  return former;
}
function injectInjectorOnly(token, flags = InjectFlags.Default) {
  if (_currentInjector === void 0) {
    const errorMessage = typeof ngDevMode === "undefined" || ngDevMode ? `inject() must be called from an injection context` : "";
    throw new RuntimeError(203, errorMessage);
  } else if (_currentInjector === null) {
    return injectRootLimpMode(token, void 0, flags);
  } else {
    return _currentInjector.get(token, flags & InjectFlags.Optional ? null : void 0, flags);
  }
}
function ɵɵinject(token, flags = InjectFlags.Default) {
  return (getInjectImplementation() || injectInjectorOnly)(resolveForwardRef(token), flags);
}
function ɵɵinvalidFactoryDep(index) {
  const msg = ngDevMode ? `This constructor is not compatible with Angular Dependency Injection because its dependency at index ${index} of the parameter list is invalid.
This can happen if the dependency type is a primitive like a string or if an ancestor of this class is missing an Angular decorator.

Please check that 1) the type for the parameter at index ${index} is correct and 2) the correct Angular decorators are defined for this class and its ancestors.` : "invalid";
  throw new Error(msg);
}
const inject = ɵɵinject;
function injectArgs(types) {
  const args = [];
  for (let i = 0; i < types.length; i++) {
    const arg = resolveForwardRef(types[i]);
    if (Array.isArray(arg)) {
      if (arg.length === 0) {
        const errorMessage = typeof ngDevMode === "undefined" || ngDevMode ? "Arguments array must have arguments." : "";
        throw new RuntimeError(900, errorMessage);
      }
      let type = void 0;
      let flags = InjectFlags.Default;
      for (let j = 0; j < arg.length; j++) {
        const meta = arg[j];
        const flag = getInjectFlag(meta);
        if (typeof flag === "number") {
          if (flag === -1) {
            type = meta.token;
          } else {
            flags |= flag;
          }
        } else {
          type = meta;
        }
      }
      args.push(ɵɵinject(type, flags));
    } else {
      args.push(ɵɵinject(arg));
    }
  }
  return args;
}
function attachInjectFlag(decorator, flag) {
  decorator[DI_DECORATOR_FLAG] = flag;
  decorator.prototype[DI_DECORATOR_FLAG] = flag;
  return decorator;
}
function getInjectFlag(token) {
  return token[DI_DECORATOR_FLAG];
}
function catchInjectorError(e, token, injectorErrorName, source) {
  const tokenPath = e[NG_TEMP_TOKEN_PATH];
  if (token[SOURCE]) {
    tokenPath.unshift(token[SOURCE]);
  }
  e.message = formatError("\n" + e.message, tokenPath, injectorErrorName, source);
  e[NG_TOKEN_PATH] = tokenPath;
  e[NG_TEMP_TOKEN_PATH] = null;
  throw e;
}
function formatError(text, obj, injectorErrorName, source = null) {
  text = text && text.charAt(0) === "\n" && text.charAt(1) == NO_NEW_LINE ? text.substr(2) : text;
  let context = stringify(obj);
  if (Array.isArray(obj)) {
    context = obj.map(stringify).join(" -> ");
  } else if (typeof obj === "object") {
    let parts = [];
    for (let key in obj) {
      if (obj.hasOwnProperty(key)) {
        let value = obj[key];
        parts.push(key + ":" + (typeof value === "string" ? JSON.stringify(value) : stringify(value)));
      }
    }
    context = `{${parts.join(", ")}}`;
  }
  return `${injectorErrorName}${source ? "(" + source + ")" : ""}[${context}]: ${text.replace(NEW_LINE, "\n  ")}`;
}
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
const Inject = attachInjectFlag(
  // Disable tslint because `DecoratorFlags` is a const enum which gets inlined.
  // tslint:disable-next-line: no-toplevel-property-access
  makeParamDecorator("Inject", (token) => ({ token })),
  -1
  /* Inject */
);
const Optional = (
  // Disable tslint because `InternalInjectFlags` is a const enum which gets inlined.
  // tslint:disable-next-line: no-toplevel-property-access
  attachInjectFlag(
    makeParamDecorator("Optional"),
    8
    /* Optional */
  )
);
const Self = (
  // Disable tslint because `InternalInjectFlags` is a const enum which gets inlined.
  // tslint:disable-next-line: no-toplevel-property-access
  attachInjectFlag(
    makeParamDecorator("Self"),
    2
    /* Self */
  )
);
const SkipSelf = (
  // Disable tslint because `InternalInjectFlags` is a const enum which gets inlined.
  // tslint:disable-next-line: no-toplevel-property-access
  attachInjectFlag(
    makeParamDecorator("SkipSelf"),
    4
    /* SkipSelf */
  )
);
const Host = (
  // Disable tslint because `InternalInjectFlags` is a const enum which gets inlined.
  // tslint:disable-next-line: no-toplevel-property-access
  attachInjectFlag(
    makeParamDecorator("Host"),
    1
    /* Host */
  )
);
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
let _reflect = null;
function getReflect() {
  return _reflect = _reflect || new ReflectionCapabilities();
}
function reflectDependencies(type) {
  return convertDependencies(getReflect().parameters(type));
}
function convertDependencies(deps) {
  return deps.map((dep) => reflectDependency(dep));
}
function reflectDependency(dep) {
  const meta = {
    token: null,
    attribute: null,
    host: false,
    optional: false,
    self: false,
    skipSelf: false
  };
  if (Array.isArray(dep) && dep.length > 0) {
    for (let j = 0; j < dep.length; j++) {
      const param = dep[j];
      if (param === void 0) {
        continue;
      }
      const proto = Object.getPrototypeOf(param);
      if (param instanceof Optional || proto.ngMetadataName === "Optional") {
        meta.optional = true;
      } else if (param instanceof SkipSelf || proto.ngMetadataName === "SkipSelf") {
        meta.skipSelf = true;
      } else if (param instanceof Self || proto.ngMetadataName === "Self") {
        meta.self = true;
      } else if (param instanceof Host || proto.ngMetadataName === "Host") {
        meta.host = true;
      } else if (param instanceof Inject) {
        meta.token = param.token;
      } else if (param instanceof Attribute) {
        if (param.attributeName === void 0) {
          throw new Error(`Attribute name must be defined.`);
        }
        meta.attribute = param.attributeName;
      } else {
        meta.token = param;
      }
    }
  } else if (dep === void 0 || Array.isArray(dep) && dep.length === 0) {
    meta.token = null;
  } else {
    meta.token = dep;
  }
  return meta;
}
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
function resolveComponentResources(resourceResolver) {
  const componentResolved = [];
  const urlMap = /* @__PURE__ */ new Map();
  function cachedResourceResolve(url) {
    let promise2 = urlMap.get(url);
    if (!promise2) {
      const resp = resourceResolver(url);
      urlMap.set(url, promise2 = resp.then(unwrapResponse));
    }
    return promise2;
  }
  componentResourceResolutionQueue.forEach((component, type) => {
    const promises = [];
    if (component.templateUrl) {
      promises.push(cachedResourceResolve(component.templateUrl).then((template) => {
        component.template = template;
      }));
    }
    const styleUrls = component.styleUrls;
    const styles = component.styles || (component.styles = []);
    const styleOffset = component.styles.length;
    styleUrls && styleUrls.forEach((styleUrl, index) => {
      styles.push("");
      promises.push(cachedResourceResolve(styleUrl).then((style) => {
        styles[styleOffset + index] = style;
        styleUrls.splice(styleUrls.indexOf(styleUrl), 1);
        if (styleUrls.length == 0) {
          component.styleUrls = void 0;
        }
      }));
    });
    const fullyResolved = Promise.all(promises).then(() => componentDefResolved(type));
    componentResolved.push(fullyResolved);
  });
  clearResolutionOfComponentResourcesQueue();
  return Promise.all(componentResolved).then(() => void 0);
}
let componentResourceResolutionQueue = /* @__PURE__ */ new Map();
const componentDefPendingResolution = /* @__PURE__ */ new Set();
function maybeQueueResolutionOfComponentResources(type, metadata) {
  if (componentNeedsResolution(metadata)) {
    componentResourceResolutionQueue.set(type, metadata);
    componentDefPendingResolution.add(type);
  }
}
function componentNeedsResolution(component) {
  return !!(component.templateUrl && !component.hasOwnProperty("template") || component.styleUrls && component.styleUrls.length);
}
function clearResolutionOfComponentResourcesQueue() {
  const old = componentResourceResolutionQueue;
  componentResourceResolutionQueue = /* @__PURE__ */ new Map();
  return old;
}
function isComponentResourceResolutionQueueEmpty() {
  return componentResourceResolutionQueue.size === 0;
}
function unwrapResponse(response) {
  return typeof response == "string" ? response : response.text();
}
function componentDefResolved(type) {
  componentDefPendingResolution.delete(type);
}
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
function getDeclarationComponentDef(lView) {
  !ngDevMode && throwError("Must never be called in production mode");
  const declarationLView = lView[DECLARATION_COMPONENT_VIEW];
  const context = declarationLView[CONTEXT];
  if (!context)
    return null;
  return context.constructor ? getComponentDef(context.constructor) : null;
}
function getTemplateLocationDetails(lView) {
  !ngDevMode && throwError("Must never be called in production mode");
  const hostComponentDef = getDeclarationComponentDef(lView);
  const componentClassName = hostComponentDef?.type?.name;
  return componentClassName ? ` (used in the '${componentClassName}' component template)` : "";
}
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
var RendererStyleFlags2;
(function(RendererStyleFlags22) {
  RendererStyleFlags22[RendererStyleFlags22["Important"] = 1] = "Important";
  RendererStyleFlags22[RendererStyleFlags22["DashCase"] = 2] = "DashCase";
})(RendererStyleFlags2 || (RendererStyleFlags2 = {}));
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
const COMMENT_DISALLOWED = /^>|^->|<!--|-->|--!>|<!-$/g;
const COMMENT_DELIMITER = /(<|>)/;
const COMMENT_DELIMITER_ESCAPED = "​$1​";
function escapeCommentText(value) {
  return value.replace(COMMENT_DISALLOWED, (text) => text.replace(COMMENT_DELIMITER, COMMENT_DELIMITER_ESCAPED));
}
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
function getLContext(target) {
  let mpValue = readPatchedData(target);
  if (mpValue) {
    if (Array.isArray(mpValue)) {
      const lView = mpValue;
      let nodeIndex;
      let component = void 0;
      let directives = void 0;
      if (isComponentInstance(target)) {
        nodeIndex = findViaComponent(lView, target);
        if (nodeIndex == -1) {
          throw new Error("The provided component was not found in the application");
        }
        component = target;
      } else if (isDirectiveInstance(target)) {
        nodeIndex = findViaDirective(lView, target);
        if (nodeIndex == -1) {
          throw new Error("The provided directive was not found in the application");
        }
        directives = getDirectivesAtNodeIndex(nodeIndex, lView);
      } else {
        nodeIndex = findViaNativeElement(lView, target);
        if (nodeIndex == -1) {
          return null;
        }
      }
      const native = unwrapRNode(lView[nodeIndex]);
      const existingCtx = readPatchedData(native);
      const context = existingCtx && !Array.isArray(existingCtx) ? existingCtx : createLContext(lView, nodeIndex, native);
      if (component && context.component === void 0) {
        context.component = component;
        attachPatchData(context.component, context);
      }
      if (directives && context.directives === void 0) {
        context.directives = directives;
        for (let i = 0; i < directives.length; i++) {
          attachPatchData(directives[i], context);
        }
      }
      attachPatchData(context.native, context);
      mpValue = context;
    }
  } else {
    const rElement = target;
    ngDevMode && assertDomNode(rElement);
    let parent = rElement;
    while (parent = parent.parentNode) {
      const parentContext = readPatchedData(parent);
      if (parentContext) {
        let lView;
        if (Array.isArray(parentContext)) {
          lView = parentContext;
        } else {
          lView = parentContext.lView;
        }
        if (!lView) {
          return null;
        }
        const index = findViaNativeElement(lView, rElement);
        if (index >= 0) {
          const native = unwrapRNode(lView[index]);
          const context = createLContext(lView, index, native);
          attachPatchData(native, context);
          mpValue = context;
          break;
        }
      }
    }
  }
  return mpValue || null;
}
function createLContext(lView, nodeIndex, native) {
  return {
    lView,
    nodeIndex,
    native,
    component: void 0,
    directives: void 0,
    localRefs: void 0
  };
}
function getComponentViewByInstance(componentInstance) {
  let lView = readPatchedData(componentInstance);
  let view;
  if (Array.isArray(lView)) {
    const nodeIndex = findViaComponent(lView, componentInstance);
    view = getComponentLViewByIndex(nodeIndex, lView);
    const context = createLContext(lView, nodeIndex, view[HOST]);
    context.component = componentInstance;
    attachPatchData(componentInstance, context);
    attachPatchData(context.native, context);
  } else {
    const context = lView;
    view = getComponentLViewByIndex(context.nodeIndex, context.lView);
  }
  return view;
}
const MONKEY_PATCH_KEY_NAME = "__ngContext__";
function attachPatchData(target, data) {
  ngDevMode && assertDefined(target, "Target expected");
  target[MONKEY_PATCH_KEY_NAME] = data;
}
function readPatchedData(target) {
  ngDevMode && assertDefined(target, "Target expected");
  return target[MONKEY_PATCH_KEY_NAME] || null;
}
function readPatchedLView(target) {
  const value = readPatchedData(target);
  if (value) {
    return Array.isArray(value) ? value : value.lView;
  }
  return null;
}
function isComponentInstance(instance) {
  return instance && instance.constructor && instance.constructor.ɵcmp;
}
function isDirectiveInstance(instance) {
  return instance && instance.constructor && instance.constructor.ɵdir;
}
function findViaNativeElement(lView, target) {
  const tView = lView[TVIEW];
  for (let i = HEADER_OFFSET; i < tView.bindingStartIndex; i++) {
    if (unwrapRNode(lView[i]) === target) {
      return i;
    }
  }
  return -1;
}
function traverseNextElement(tNode) {
  if (tNode.child) {
    return tNode.child;
  } else if (tNode.next) {
    return tNode.next;
  } else {
    while (tNode.parent && !tNode.parent.next) {
      tNode = tNode.parent;
    }
    return tNode.parent && tNode.parent.next;
  }
}
function findViaComponent(lView, componentInstance) {
  const componentIndices = lView[TVIEW].components;
  if (componentIndices) {
    for (let i = 0; i < componentIndices.length; i++) {
      const elementComponentIndex = componentIndices[i];
      const componentView = getComponentLViewByIndex(elementComponentIndex, lView);
      if (componentView[CONTEXT] === componentInstance) {
        return elementComponentIndex;
      }
    }
  } else {
    const rootComponentView = getComponentLViewByIndex(HEADER_OFFSET, lView);
    const rootComponent = rootComponentView[CONTEXT];
    if (rootComponent === componentInstance) {
      return HEADER_OFFSET;
    }
  }
  return -1;
}
function findViaDirective(lView, directiveInstance) {
  let tNode = lView[TVIEW].firstChild;
  while (tNode) {
    const directiveIndexStart = tNode.directiveStart;
    const directiveIndexEnd = tNode.directiveEnd;
    for (let i = directiveIndexStart; i < directiveIndexEnd; i++) {
      if (lView[i] === directiveInstance) {
        return tNode.index;
      }
    }
    tNode = traverseNextElement(tNode);
  }
  return -1;
}
function getDirectivesAtNodeIndex(nodeIndex, lView, includeComponents) {
  const tNode = lView[TVIEW].data[nodeIndex];
  let directiveStartIndex = tNode.directiveStart;
  if (directiveStartIndex == 0)
    return EMPTY_ARRAY;
  const directiveEndIndex = tNode.directiveEnd;
  if (tNode.flags & 2)
    directiveStartIndex++;
  return lView.slice(directiveStartIndex, directiveEndIndex);
}
function getComponentAtNodeIndex(nodeIndex, lView) {
  const tNode = lView[TVIEW].data[nodeIndex];
  let directiveStartIndex = tNode.directiveStart;
  return tNode.flags & 2 ? lView[directiveStartIndex] : null;
}
function discoverLocalRefs(lView, nodeIndex) {
  const tNode = lView[TVIEW].data[nodeIndex];
  if (tNode && tNode.localNames) {
    const result = {};
    let localIndex = tNode.index + 1;
    for (let i = 0; i < tNode.localNames.length; i += 2) {
      result[tNode.localNames[i]] = lView[localIndex];
      localIndex++;
    }
    return result;
  }
  return null;
}
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
let _icuContainerIterate;
function icuContainerIterate(tIcuContainerNode, lView) {
  return _icuContainerIterate(tIcuContainerNode, lView);
}
function ensureIcuContainerVisitorLoaded(loader) {
  if (_icuContainerIterate === void 0) {
    _icuContainerIterate = loader();
  }
}
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
function getLViewParent(lView) {
  ngDevMode && assertLView(lView);
  const parent = lView[PARENT];
  return isLContainer(parent) ? parent[PARENT] : parent;
}
function getRootView(componentOrLView) {
  ngDevMode && assertDefined(componentOrLView, "component");
  let lView = isLView(componentOrLView) ? componentOrLView : readPatchedLView(componentOrLView);
  while (lView && !(lView[FLAGS] & 512)) {
    lView = getLViewParent(lView);
  }
  ngDevMode && assertLView(lView);
  return lView;
}
function getRootContext(viewOrComponent) {
  const rootView = getRootView(viewOrComponent);
  ngDevMode && assertDefined(rootView[CONTEXT], "RootView has no context. Perhaps it is disconnected?");
  return rootView[CONTEXT];
}
function getFirstLContainer(lView) {
  return getNearestLContainer(lView[CHILD_HEAD]);
}
function getNextLContainer(container) {
  return getNearestLContainer(container[NEXT]);
}
function getNearestLContainer(viewOrContainer) {
  while (viewOrContainer !== null && !isLContainer(viewOrContainer)) {
    viewOrContainer = viewOrContainer[NEXT];
  }
  return viewOrContainer;
}
function applyToElementOrContainer(action, renderer, parent, lNodeToHandle, beforeNode) {
  if (lNodeToHandle != null) {
    let lContainer;
    let isComponent = false;
    if (isLContainer(lNodeToHandle)) {
      lContainer = lNodeToHandle;
    } else if (isLView(lNodeToHandle)) {
      isComponent = true;
      ngDevMode && assertDefined(lNodeToHandle[HOST], "HOST must be defined for a component LView");
      lNodeToHandle = lNodeToHandle[HOST];
    }
    const rNode = unwrapRNode(lNodeToHandle);
    ngDevMode && !isProceduralRenderer(renderer) && assertDomNode(rNode);
    if (action === 0 && parent !== null) {
      if (beforeNode == null) {
        nativeAppendChild(renderer, parent, rNode);
      } else {
        nativeInsertBefore(renderer, parent, rNode, beforeNode || null, true);
      }
    } else if (action === 1 && parent !== null) {
      nativeInsertBefore(renderer, parent, rNode, beforeNode || null, true);
    } else if (action === 2) {
      nativeRemoveNode(renderer, rNode, isComponent);
    } else if (action === 3) {
      ngDevMode && ngDevMode.rendererDestroyNode++;
      renderer.destroyNode(rNode);
    }
    if (lContainer != null) {
      applyContainer(renderer, action, lContainer, parent, beforeNode);
    }
  }
}
function createTextNode(renderer, value) {
  ngDevMode && ngDevMode.rendererCreateTextNode++;
  ngDevMode && ngDevMode.rendererSetText++;
  return isProceduralRenderer(renderer) ? renderer.createText(value) : renderer.createTextNode(value);
}
function updateTextNode(renderer, rNode, value) {
  ngDevMode && ngDevMode.rendererSetText++;
  isProceduralRenderer(renderer) ? renderer.setValue(rNode, value) : rNode.textContent = value;
}
function createCommentNode(renderer, value) {
  ngDevMode && ngDevMode.rendererCreateComment++;
  return renderer.createComment(escapeCommentText(value));
}
function createElementNode(renderer, name, namespace) {
  ngDevMode && ngDevMode.rendererCreateElement++;
  if (isProceduralRenderer(renderer)) {
    return renderer.createElement(name, namespace);
  } else {
    const namespaceUri = namespace !== null ? getNamespaceUri(namespace) : null;
    return namespaceUri === null ? renderer.createElement(name) : renderer.createElementNS(namespaceUri, name);
  }
}
function removeViewFromContainer(tView, lView) {
  const renderer = lView[RENDERER];
  applyView(tView, lView, renderer, 2, null, null);
  lView[HOST] = null;
  lView[T_HOST] = null;
}
function addViewToContainer(tView, parentTNode, renderer, lView, parentNativeNode, beforeNode) {
  lView[HOST] = parentNativeNode;
  lView[T_HOST] = parentTNode;
  applyView(tView, lView, renderer, 1, parentNativeNode, beforeNode);
}
function renderDetachView(tView, lView) {
  applyView(tView, lView, lView[RENDERER], 2, null, null);
}
function destroyViewTree(rootView) {
  let lViewOrLContainer = rootView[CHILD_HEAD];
  if (!lViewOrLContainer) {
    return cleanUpView(rootView[TVIEW], rootView);
  }
  while (lViewOrLContainer) {
    let next = null;
    if (isLView(lViewOrLContainer)) {
      next = lViewOrLContainer[CHILD_HEAD];
    } else {
      ngDevMode && assertLContainer(lViewOrLContainer);
      const firstView = lViewOrLContainer[CONTAINER_HEADER_OFFSET];
      if (firstView)
        next = firstView;
    }
    if (!next) {
      while (lViewOrLContainer && !lViewOrLContainer[NEXT] && lViewOrLContainer !== rootView) {
        if (isLView(lViewOrLContainer)) {
          cleanUpView(lViewOrLContainer[TVIEW], lViewOrLContainer);
        }
        lViewOrLContainer = lViewOrLContainer[PARENT];
      }
      if (lViewOrLContainer === null)
        lViewOrLContainer = rootView;
      if (isLView(lViewOrLContainer)) {
        cleanUpView(lViewOrLContainer[TVIEW], lViewOrLContainer);
      }
      next = lViewOrLContainer && lViewOrLContainer[NEXT];
    }
    lViewOrLContainer = next;
  }
}
function insertView(tView, lView, lContainer, index) {
  ngDevMode && assertLView(lView);
  ngDevMode && assertLContainer(lContainer);
  const indexInContainer = CONTAINER_HEADER_OFFSET + index;
  const containerLength = lContainer.length;
  if (index > 0) {
    lContainer[indexInContainer - 1][NEXT] = lView;
  }
  if (index < containerLength - CONTAINER_HEADER_OFFSET) {
    lView[NEXT] = lContainer[indexInContainer];
    addToArray(lContainer, CONTAINER_HEADER_OFFSET + index, lView);
  } else {
    lContainer.push(lView);
    lView[NEXT] = null;
  }
  lView[PARENT] = lContainer;
  const declarationLContainer = lView[DECLARATION_LCONTAINER];
  if (declarationLContainer !== null && lContainer !== declarationLContainer) {
    trackMovedView(declarationLContainer, lView);
  }
  const lQueries = lView[QUERIES];
  if (lQueries !== null) {
    lQueries.insertView(tView);
  }
  lView[FLAGS] |= 128;
}
function trackMovedView(declarationContainer, lView) {
  ngDevMode && assertDefined(lView, "LView required");
  ngDevMode && assertLContainer(declarationContainer);
  const movedViews = declarationContainer[MOVED_VIEWS];
  const insertedLContainer = lView[PARENT];
  ngDevMode && assertLContainer(insertedLContainer);
  const insertedComponentLView = insertedLContainer[PARENT][DECLARATION_COMPONENT_VIEW];
  ngDevMode && assertDefined(insertedComponentLView, "Missing insertedComponentLView");
  const declaredComponentLView = lView[DECLARATION_COMPONENT_VIEW];
  ngDevMode && assertDefined(declaredComponentLView, "Missing declaredComponentLView");
  if (declaredComponentLView !== insertedComponentLView) {
    declarationContainer[HAS_TRANSPLANTED_VIEWS] = true;
  }
  if (movedViews === null) {
    declarationContainer[MOVED_VIEWS] = [lView];
  } else {
    movedViews.push(lView);
  }
}
function detachMovedView(declarationContainer, lView) {
  ngDevMode && assertLContainer(declarationContainer);
  ngDevMode && assertDefined(declarationContainer[MOVED_VIEWS], "A projected view should belong to a non-empty projected views collection");
  const movedViews = declarationContainer[MOVED_VIEWS];
  const declarationViewIndex = movedViews.indexOf(lView);
  const insertionLContainer = lView[PARENT];
  ngDevMode && assertLContainer(insertionLContainer);
  if (lView[FLAGS] & 1024) {
    lView[FLAGS] &= -1025;
    updateTransplantedViewCount(insertionLContainer, -1);
  }
  movedViews.splice(declarationViewIndex, 1);
}
function detachView(lContainer, removeIndex) {
  if (lContainer.length <= CONTAINER_HEADER_OFFSET)
    return;
  const indexInContainer = CONTAINER_HEADER_OFFSET + removeIndex;
  const viewToDetach = lContainer[indexInContainer];
  if (viewToDetach) {
    const declarationLContainer = viewToDetach[DECLARATION_LCONTAINER];
    if (declarationLContainer !== null && declarationLContainer !== lContainer) {
      detachMovedView(declarationLContainer, viewToDetach);
    }
    if (removeIndex > 0) {
      lContainer[indexInContainer - 1][NEXT] = viewToDetach[NEXT];
    }
    const removedLView = removeFromArray(lContainer, CONTAINER_HEADER_OFFSET + removeIndex);
    removeViewFromContainer(viewToDetach[TVIEW], viewToDetach);
    const lQueries = removedLView[QUERIES];
    if (lQueries !== null) {
      lQueries.detachView(removedLView[TVIEW]);
    }
    viewToDetach[PARENT] = null;
    viewToDetach[NEXT] = null;
    viewToDetach[FLAGS] &= -129;
  }
  return viewToDetach;
}
function destroyLView(tView, lView) {
  if (!(lView[FLAGS] & 256)) {
    const renderer = lView[RENDERER];
    if (isProceduralRenderer(renderer) && renderer.destroyNode) {
      applyView(tView, lView, renderer, 3, null, null);
    }
    destroyViewTree(lView);
  }
}
function cleanUpView(tView, lView) {
  if (!(lView[FLAGS] & 256)) {
    lView[FLAGS] &= -129;
    lView[FLAGS] |= 256;
    executeOnDestroys(tView, lView);
    processCleanups(tView, lView);
    if (lView[TVIEW].type === 1 && isProceduralRenderer(lView[RENDERER])) {
      ngDevMode && ngDevMode.rendererDestroy++;
      lView[RENDERER].destroy();
    }
    const declarationContainer = lView[DECLARATION_LCONTAINER];
    if (declarationContainer !== null && isLContainer(lView[PARENT])) {
      if (declarationContainer !== lView[PARENT]) {
        detachMovedView(declarationContainer, lView);
      }
      const lQueries = lView[QUERIES];
      if (lQueries !== null) {
        lQueries.detachView(tView);
      }
    }
  }
}
function processCleanups(tView, lView) {
  const tCleanup = tView.cleanup;
  const lCleanup = lView[CLEANUP];
  let lastLCleanupIndex = -1;
  if (tCleanup !== null) {
    for (let i = 0; i < tCleanup.length - 1; i += 2) {
      if (typeof tCleanup[i] === "string") {
        const idxOrTargetGetter = tCleanup[i + 1];
        const target = typeof idxOrTargetGetter === "function" ? idxOrTargetGetter(lView) : unwrapRNode(lView[idxOrTargetGetter]);
        const listener = lCleanup[lastLCleanupIndex = tCleanup[i + 2]];
        const useCaptureOrSubIdx = tCleanup[i + 3];
        if (typeof useCaptureOrSubIdx === "boolean") {
          target.removeEventListener(tCleanup[i], listener, useCaptureOrSubIdx);
        } else {
          if (useCaptureOrSubIdx >= 0) {
            lCleanup[lastLCleanupIndex = useCaptureOrSubIdx]();
          } else {
            lCleanup[lastLCleanupIndex = -useCaptureOrSubIdx].unsubscribe();
          }
        }
        i += 2;
      } else {
        const context = lCleanup[lastLCleanupIndex = tCleanup[i + 1]];
        tCleanup[i].call(context);
      }
    }
  }
  if (lCleanup !== null) {
    for (let i = lastLCleanupIndex + 1; i < lCleanup.length; i++) {
      const instanceCleanupFn = lCleanup[i];
      ngDevMode && assertFunction(instanceCleanupFn, "Expecting instance cleanup function.");
      instanceCleanupFn();
    }
    lView[CLEANUP] = null;
  }
}
function executeOnDestroys(tView, lView) {
  let destroyHooks;
  if (tView != null && (destroyHooks = tView.destroyHooks) != null) {
    for (let i = 0; i < destroyHooks.length; i += 2) {
      const context = lView[destroyHooks[i]];
      if (!(context instanceof NodeInjectorFactory)) {
        const toCall = destroyHooks[i + 1];
        if (Array.isArray(toCall)) {
          for (let j = 0; j < toCall.length; j += 2) {
            const callContext = context[toCall[j]];
            const hook = toCall[j + 1];
            profiler(4, callContext, hook);
            try {
              hook.call(callContext);
            } finally {
              profiler(5, callContext, hook);
            }
          }
        } else {
          profiler(4, context, toCall);
          try {
            toCall.call(context);
          } finally {
            profiler(5, context, toCall);
          }
        }
      }
    }
  }
}
function getParentRElement(tView, tNode, lView) {
  return getClosestRElement(tView, tNode.parent, lView);
}
function getClosestRElement(tView, tNode, lView) {
  let parentTNode = tNode;
  while (parentTNode !== null && parentTNode.type & (8 | 32)) {
    tNode = parentTNode;
    parentTNode = tNode.parent;
  }
  if (parentTNode === null) {
    return lView[HOST];
  } else {
    ngDevMode && assertTNodeType(
      parentTNode,
      3 | 4
      /* Container */
    );
    if (parentTNode.flags & 2) {
      ngDevMode && assertTNodeForLView(parentTNode, lView);
      const encapsulation = tView.data[parentTNode.directiveStart].encapsulation;
      if (encapsulation === ViewEncapsulation$1.None || encapsulation === ViewEncapsulation$1.Emulated) {
        return null;
      }
    }
    return getNativeByTNode(parentTNode, lView);
  }
}
function nativeInsertBefore(renderer, parent, child, beforeNode, isMove) {
  ngDevMode && ngDevMode.rendererInsertBefore++;
  if (isProceduralRenderer(renderer)) {
    renderer.insertBefore(parent, child, beforeNode, isMove);
  } else {
    parent.insertBefore(child, beforeNode, isMove);
  }
}
function nativeAppendChild(renderer, parent, child) {
  ngDevMode && ngDevMode.rendererAppendChild++;
  ngDevMode && assertDefined(parent, "parent node must be defined");
  if (isProceduralRenderer(renderer)) {
    renderer.appendChild(parent, child);
  } else {
    parent.appendChild(child);
  }
}
function nativeAppendOrInsertBefore(renderer, parent, child, beforeNode, isMove) {
  if (beforeNode !== null) {
    nativeInsertBefore(renderer, parent, child, beforeNode, isMove);
  } else {
    nativeAppendChild(renderer, parent, child);
  }
}
function nativeRemoveChild(renderer, parent, child, isHostElement) {
  if (isProceduralRenderer(renderer)) {
    renderer.removeChild(parent, child, isHostElement);
  } else {
    parent.removeChild(child);
  }
}
function nativeParentNode(renderer, node) {
  return isProceduralRenderer(renderer) ? renderer.parentNode(node) : node.parentNode;
}
function nativeNextSibling(renderer, node) {
  return isProceduralRenderer(renderer) ? renderer.nextSibling(node) : node.nextSibling;
}
function getInsertInFrontOfRNode(parentTNode, currentTNode, lView) {
  return _getInsertInFrontOfRNodeWithI18n(parentTNode, currentTNode, lView);
}
function getInsertInFrontOfRNodeWithNoI18n(parentTNode, currentTNode, lView) {
  if (parentTNode.type & (8 | 32)) {
    return getNativeByTNode(parentTNode, lView);
  }
  return null;
}
let _getInsertInFrontOfRNodeWithI18n = getInsertInFrontOfRNodeWithNoI18n;
let _processI18nInsertBefore;
function setI18nHandling(getInsertInFrontOfRNodeWithI18n2, processI18nInsertBefore2) {
  _getInsertInFrontOfRNodeWithI18n = getInsertInFrontOfRNodeWithI18n2;
  _processI18nInsertBefore = processI18nInsertBefore2;
}
function appendChild(tView, lView, childRNode, childTNode) {
  const parentRNode = getParentRElement(tView, childTNode, lView);
  const renderer = lView[RENDERER];
  const parentTNode = childTNode.parent || lView[T_HOST];
  const anchorNode = getInsertInFrontOfRNode(parentTNode, childTNode, lView);
  if (parentRNode != null) {
    if (Array.isArray(childRNode)) {
      for (let i = 0; i < childRNode.length; i++) {
        nativeAppendOrInsertBefore(renderer, parentRNode, childRNode[i], anchorNode, false);
      }
    } else {
      nativeAppendOrInsertBefore(renderer, parentRNode, childRNode, anchorNode, false);
    }
  }
  _processI18nInsertBefore !== void 0 && _processI18nInsertBefore(renderer, childTNode, lView, childRNode, parentRNode);
}
function getFirstNativeNode(lView, tNode) {
  if (tNode !== null) {
    ngDevMode && assertTNodeType(
      tNode,
      3 | 12 | 32 | 16
      /* Projection */
    );
    const tNodeType = tNode.type;
    if (tNodeType & 3) {
      return getNativeByTNode(tNode, lView);
    } else if (tNodeType & 4) {
      return getBeforeNodeForView(-1, lView[tNode.index]);
    } else if (tNodeType & 8) {
      const elIcuContainerChild = tNode.child;
      if (elIcuContainerChild !== null) {
        return getFirstNativeNode(lView, elIcuContainerChild);
      } else {
        const rNodeOrLContainer = lView[tNode.index];
        if (isLContainer(rNodeOrLContainer)) {
          return getBeforeNodeForView(-1, rNodeOrLContainer);
        } else {
          return unwrapRNode(rNodeOrLContainer);
        }
      }
    } else if (tNodeType & 32) {
      let nextRNode = icuContainerIterate(tNode, lView);
      let rNode = nextRNode();
      return rNode || unwrapRNode(lView[tNode.index]);
    } else {
      const projectionNodes = getProjectionNodes(lView, tNode);
      if (projectionNodes !== null) {
        if (Array.isArray(projectionNodes)) {
          return projectionNodes[0];
        }
        const parentView = getLViewParent(lView[DECLARATION_COMPONENT_VIEW]);
        ngDevMode && assertParentView(parentView);
        return getFirstNativeNode(parentView, projectionNodes);
      } else {
        return getFirstNativeNode(lView, tNode.next);
      }
    }
  }
  return null;
}
function getProjectionNodes(lView, tNode) {
  if (tNode !== null) {
    const componentView = lView[DECLARATION_COMPONENT_VIEW];
    const componentHost = componentView[T_HOST];
    const slotIdx = tNode.projection;
    ngDevMode && assertProjectionSlots(lView);
    return componentHost.projection[slotIdx];
  }
  return null;
}
function getBeforeNodeForView(viewIndexInContainer, lContainer) {
  const nextViewIndex = CONTAINER_HEADER_OFFSET + viewIndexInContainer + 1;
  if (nextViewIndex < lContainer.length) {
    const lView = lContainer[nextViewIndex];
    const firstTNodeOfView = lView[TVIEW].firstChild;
    if (firstTNodeOfView !== null) {
      return getFirstNativeNode(lView, firstTNodeOfView);
    }
  }
  return lContainer[NATIVE];
}
function nativeRemoveNode(renderer, rNode, isHostElement) {
  ngDevMode && ngDevMode.rendererRemoveNode++;
  const nativeParent = nativeParentNode(renderer, rNode);
  if (nativeParent) {
    nativeRemoveChild(renderer, nativeParent, rNode, isHostElement);
  }
}
function applyNodes(renderer, action, tNode, lView, parentRElement, beforeNode, isProjection) {
  while (tNode != null) {
    ngDevMode && assertTNodeForLView(tNode, lView);
    ngDevMode && assertTNodeType(
      tNode,
      3 | 12 | 16 | 32
      /* Icu */
    );
    const rawSlotValue = lView[tNode.index];
    const tNodeType = tNode.type;
    if (isProjection) {
      if (action === 0) {
        rawSlotValue && attachPatchData(unwrapRNode(rawSlotValue), lView);
        tNode.flags |= 4;
      }
    }
    if ((tNode.flags & 64) !== 64) {
      if (tNodeType & 8) {
        applyNodes(renderer, action, tNode.child, lView, parentRElement, beforeNode, false);
        applyToElementOrContainer(action, renderer, parentRElement, rawSlotValue, beforeNode);
      } else if (tNodeType & 32) {
        const nextRNode = icuContainerIterate(tNode, lView);
        let rNode;
        while (rNode = nextRNode()) {
          applyToElementOrContainer(action, renderer, parentRElement, rNode, beforeNode);
        }
        applyToElementOrContainer(action, renderer, parentRElement, rawSlotValue, beforeNode);
      } else if (tNodeType & 16) {
        applyProjectionRecursive(renderer, action, lView, tNode, parentRElement, beforeNode);
      } else {
        ngDevMode && assertTNodeType(
          tNode,
          3 | 4
          /* Container */
        );
        applyToElementOrContainer(action, renderer, parentRElement, rawSlotValue, beforeNode);
      }
    }
    tNode = isProjection ? tNode.projectionNext : tNode.next;
  }
}
function applyView(tView, lView, renderer, action, parentRElement, beforeNode) {
  applyNodes(renderer, action, tView.firstChild, lView, parentRElement, beforeNode, false);
}
function applyProjection(tView, lView, tProjectionNode) {
  const renderer = lView[RENDERER];
  const parentRNode = getParentRElement(tView, tProjectionNode, lView);
  const parentTNode = tProjectionNode.parent || lView[T_HOST];
  let beforeNode = getInsertInFrontOfRNode(parentTNode, tProjectionNode, lView);
  applyProjectionRecursive(renderer, 0, lView, tProjectionNode, parentRNode, beforeNode);
}
function applyProjectionRecursive(renderer, action, lView, tProjectionNode, parentRElement, beforeNode) {
  const componentLView = lView[DECLARATION_COMPONENT_VIEW];
  const componentNode = componentLView[T_HOST];
  ngDevMode && assertEqual(typeof tProjectionNode.projection, "number", "expecting projection index");
  const nodeToProjectOrRNodes = componentNode.projection[tProjectionNode.projection];
  if (Array.isArray(nodeToProjectOrRNodes)) {
    for (let i = 0; i < nodeToProjectOrRNodes.length; i++) {
      const rNode = nodeToProjectOrRNodes[i];
      applyToElementOrContainer(action, renderer, parentRElement, rNode, beforeNode);
    }
  } else {
    let nodeToProject = nodeToProjectOrRNodes;
    const projectedComponentLView = componentLView[PARENT];
    applyNodes(renderer, action, nodeToProject, projectedComponentLView, parentRElement, beforeNode, true);
  }
}
function applyContainer(renderer, action, lContainer, parentRElement, beforeNode) {
  ngDevMode && assertLContainer(lContainer);
  const anchor = lContainer[NATIVE];
  const native = unwrapRNode(lContainer);
  if (anchor !== native) {
    applyToElementOrContainer(action, renderer, parentRElement, anchor, beforeNode);
  }
  for (let i = CONTAINER_HEADER_OFFSET; i < lContainer.length; i++) {
    const lView = lContainer[i];
    applyView(lView[TVIEW], lView, renderer, action, parentRElement, anchor);
  }
}
function applyStyling(renderer, isClassBased, rNode, prop, value) {
  const isProcedural = isProceduralRenderer(renderer);
  if (isClassBased) {
    if (!value) {
      ngDevMode && ngDevMode.rendererRemoveClass++;
      if (isProcedural) {
        renderer.removeClass(rNode, prop);
      } else {
        rNode.classList.remove(prop);
      }
    } else {
      ngDevMode && ngDevMode.rendererAddClass++;
      if (isProcedural) {
        renderer.addClass(rNode, prop);
      } else {
        ngDevMode && assertDefined(rNode.classList, "HTMLElement expected");
        rNode.classList.add(prop);
      }
    }
  } else {
    let flags = prop.indexOf("-") === -1 ? void 0 : RendererStyleFlags2.DashCase;
    if (value == null) {
      ngDevMode && ngDevMode.rendererRemoveStyle++;
      if (isProcedural) {
        renderer.removeStyle(rNode, prop, flags);
      } else {
        rNode.style.removeProperty(prop);
      }
    } else {
      const isImportant = typeof value === "string" ? value.endsWith("!important") : false;
      if (isImportant) {
        value = value.slice(0, -10);
        flags |= RendererStyleFlags2.Important;
      }
      ngDevMode && ngDevMode.rendererSetStyle++;
      if (isProcedural) {
        renderer.setStyle(rNode, prop, value, flags);
      } else {
        ngDevMode && assertDefined(rNode.style, "HTMLElement expected");
        rNode.style.setProperty(prop, value, isImportant ? "important" : "");
      }
    }
  }
}
function writeDirectStyle(renderer, element, newValue) {
  ngDevMode && assertString(newValue, "'newValue' should be a string");
  if (isProceduralRenderer(renderer)) {
    renderer.setAttribute(element, "style", newValue);
  } else {
    element.style.cssText = newValue;
  }
  ngDevMode && ngDevMode.rendererSetStyle++;
}
function writeDirectClass(renderer, element, newValue) {
  ngDevMode && assertString(newValue, "'newValue' should be a string");
  if (isProceduralRenderer(renderer)) {
    if (newValue === "") {
      renderer.removeAttribute(element, "class");
    } else {
      renderer.setAttribute(element, "class", newValue);
    }
  } else {
    element.className = newValue;
  }
  ngDevMode && ngDevMode.rendererSetClassName++;
}
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
let policy$1;
function getPolicy$1() {
  if (policy$1 === void 0) {
    policy$1 = null;
    if (_global.trustedTypes) {
      try {
        policy$1 = _global.trustedTypes.createPolicy("angular", {
          createHTML: (s) => s,
          createScript: (s) => s,
          createScriptURL: (s) => s
        });
      } catch {
      }
    }
  }
  return policy$1;
}
function trustedHTMLFromString(html) {
  return getPolicy$1()?.createHTML(html) || html;
}
function trustedScriptFromString(script) {
  return getPolicy$1()?.createScript(script) || script;
}
function trustedScriptURLFromString(url) {
  return getPolicy$1()?.createScriptURL(url) || url;
}
function newTrustedFunctionForDev(...args) {
  if (typeof ngDevMode === "undefined") {
    throw new Error("newTrustedFunctionForDev should never be called in production");
  }
  if (!_global.trustedTypes) {
    return new Function(...args);
  }
  const fnArgs = args.slice(0, -1).join(",");
  const fnBody = args[args.length - 1];
  const body = `(function anonymous(${fnArgs}
) { ${fnBody}
})`;
  const fn = _global["eval"](trustedScriptFromString(body));
  if (fn.bind === void 0) {
    return new Function(...args);
  }
  fn.toString = () => body;
  return fn.bind(_global);
}
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
function ɵɵvalidateIframeAttribute(attrValue, tagName, attrName) {
  const lView = getLView();
  const tNode = getSelectedTNode();
  const element = getNativeByTNode(tNode, lView);
  if (tNode.type === 2 && tagName.toLowerCase() === "iframe") {
    const iframe = element;
    iframe.src = "";
    iframe.srcdoc = trustedHTMLFromString("");
    nativeRemoveNode(lView[RENDERER], iframe);
    const errorMessage = ngDevMode && `Angular has detected that the \`${attrName}\` was applied as a binding to an <iframe>${getTemplateLocationDetails(lView)}. For security reasons, the \`${attrName}\` can be set on an <iframe> as a static attribute only. 
To fix this, switch the \`${attrName}\` binding to a static attribute in a template or in host bindings section.`;
    throw new RuntimeError(-910, errorMessage);
  }
  return attrValue;
}
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
let policy;
function getPolicy() {
  if (policy === void 0) {
    policy = null;
    if (_global.trustedTypes) {
      try {
        policy = _global.trustedTypes.createPolicy("angular#unsafe-bypass", {
          createHTML: (s) => s,
          createScript: (s) => s,
          createScriptURL: (s) => s
        });
      } catch {
      }
    }
  }
  return policy;
}
function trustedHTMLFromStringBypass(html) {
  return getPolicy()?.createHTML(html) || html;
}
function trustedScriptFromStringBypass(script) {
  return getPolicy()?.createScript(script) || script;
}
function trustedScriptURLFromStringBypass(url) {
  return getPolicy()?.createScriptURL(url) || url;
}
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
class SafeValueImpl {
  constructor(changingThisBreaksApplicationSecurity) {
    this.changingThisBreaksApplicationSecurity = changingThisBreaksApplicationSecurity;
  }
  toString() {
    return `SafeValue must use [property]=binding: ${this.changingThisBreaksApplicationSecurity} (see https://g.co/ng/security#xss)`;
  }
}
class SafeHtmlImpl extends SafeValueImpl {
  getTypeName() {
    return "HTML";
  }
}
class SafeStyleImpl extends SafeValueImpl {
  getTypeName() {
    return "Style";
  }
}
class SafeScriptImpl extends SafeValueImpl {
  getTypeName() {
    return "Script";
  }
}
class SafeUrlImpl extends SafeValueImpl {
  getTypeName() {
    return "URL";
  }
}
class SafeResourceUrlImpl extends SafeValueImpl {
  getTypeName() {
    return "ResourceURL";
  }
}
function unwrapSafeValue(value) {
  return value instanceof SafeValueImpl ? value.changingThisBreaksApplicationSecurity : value;
}
function allowSanitizationBypassAndThrow(value, type) {
  const actualType = getSanitizationBypassType(value);
  if (actualType != null && actualType !== type) {
    if (actualType === "ResourceURL" && type === "URL")
      return true;
    throw new Error(`Required a safe ${type}, got a ${actualType} (see https://g.co/ng/security#xss)`);
  }
  return actualType === type;
}
function getSanitizationBypassType(value) {
  return value instanceof SafeValueImpl && value.getTypeName() || null;
}
function bypassSanitizationTrustHtml(trustedHtml) {
  return new SafeHtmlImpl(trustedHtml);
}
function bypassSanitizationTrustStyle(trustedStyle) {
  return new SafeStyleImpl(trustedStyle);
}
function bypassSanitizationTrustScript(trustedScript) {
  return new SafeScriptImpl(trustedScript);
}
function bypassSanitizationTrustUrl(trustedUrl) {
  return new SafeUrlImpl(trustedUrl);
}
function bypassSanitizationTrustResourceUrl(trustedResourceUrl) {
  return new SafeResourceUrlImpl(trustedResourceUrl);
}
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
function getInertBodyHelper(defaultDoc) {
  const inertDocumentHelper = new InertDocumentHelper(defaultDoc);
  return isDOMParserAvailable() ? new DOMParserHelper(inertDocumentHelper) : inertDocumentHelper;
}
class DOMParserHelper {
  constructor(inertDocumentHelper) {
    this.inertDocumentHelper = inertDocumentHelper;
  }
  getInertBodyElement(html) {
    html = "<body><remove></remove>" + html;
    try {
      const body = new window.DOMParser().parseFromString(trustedHTMLFromString(html), "text/html").body;
      if (body === null) {
        return this.inertDocumentHelper.getInertBodyElement(html);
      }
      body.removeChild(body.firstChild);
      return body;
    } catch {
      return null;
    }
  }
}
class InertDocumentHelper {
  constructor(defaultDoc) {
    this.defaultDoc = defaultDoc;
    this.inertDocument = this.defaultDoc.implementation.createHTMLDocument("sanitization-inert");
    if (this.inertDocument.body == null) {
      const inertHtml = this.inertDocument.createElement("html");
      this.inertDocument.appendChild(inertHtml);
      const inertBodyElement = this.inertDocument.createElement("body");
      inertHtml.appendChild(inertBodyElement);
    }
  }
  getInertBodyElement(html) {
    const templateEl = this.inertDocument.createElement("template");
    if ("content" in templateEl) {
      templateEl.innerHTML = trustedHTMLFromString(html);
      return templateEl;
    }
    const inertBody = this.inertDocument.createElement("body");
    inertBody.innerHTML = trustedHTMLFromString(html);
    if (this.defaultDoc.documentMode) {
      this.stripCustomNsAttrs(inertBody);
    }
    return inertBody;
  }
  /**
   * When IE11 comes across an unknown namespaced attribute e.g. 'xlink:foo' it adds 'xmlns:ns1'
   * attribute to declare ns1 namespace and prefixes the attribute with 'ns1' (e.g.
   * 'ns1:xlink:foo').
   *
   * This is undesirable since we don't want to allow any of these custom attributes. This method
   * strips them all.
   */
  stripCustomNsAttrs(el) {
    const elAttrs = el.attributes;
    for (let i = elAttrs.length - 1; 0 < i; i--) {
      const attrib = elAttrs.item(i);
      const attrName = attrib.name;
      if (attrName === "xmlns:ns1" || attrName.indexOf("ns1:") === 0) {
        el.removeAttribute(attrName);
      }
    }
    let childNode = el.firstChild;
    while (childNode) {
      if (childNode.nodeType === Node.ELEMENT_NODE)
        this.stripCustomNsAttrs(childNode);
      childNode = childNode.nextSibling;
    }
  }
}
function isDOMParserAvailable() {
  try {
    return !!new window.DOMParser().parseFromString(trustedHTMLFromString(""), "text/html");
  } catch {
    return false;
  }
}
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
const SAFE_URL_PATTERN = /^(?:(?:https?|mailto|ftp|tel|file|sms):|[^&:/?#]*(?:[/?#]|$))/gi;
const DATA_URL_PATTERN = /^data:(?:image\/(?:bmp|gif|jpeg|jpg|png|tiff|webp)|video\/(?:mpeg|mp4|ogg|webm)|audio\/(?:mp3|oga|ogg|opus));base64,[a-z0-9+\/]+=*$/i;
function _sanitizeUrl(url) {
  url = String(url);
  if (url.match(SAFE_URL_PATTERN) || url.match(DATA_URL_PATTERN))
    return url;
  if (typeof ngDevMode === "undefined" || ngDevMode) {
    console.warn(`WARNING: sanitizing unsafe URL value ${url} (see https://g.co/ng/security#xss)`);
  }
  return "unsafe:" + url;
}
function sanitizeSrcset(srcset) {
  srcset = String(srcset);
  return srcset.split(",").map((srcset2) => _sanitizeUrl(srcset2.trim())).join(", ");
}
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
function tagSet(tags) {
  const res = {};
  for (const t of tags.split(","))
    res[t] = true;
  return res;
}
function merge(...sets) {
  const res = {};
  for (const s of sets) {
    for (const v in s) {
      if (s.hasOwnProperty(v))
        res[v] = true;
    }
  }
  return res;
}
const VOID_ELEMENTS = tagSet("area,br,col,hr,img,wbr");
const OPTIONAL_END_TAG_BLOCK_ELEMENTS = tagSet("colgroup,dd,dt,li,p,tbody,td,tfoot,th,thead,tr");
const OPTIONAL_END_TAG_INLINE_ELEMENTS = tagSet("rp,rt");
const OPTIONAL_END_TAG_ELEMENTS = merge(OPTIONAL_END_TAG_INLINE_ELEMENTS, OPTIONAL_END_TAG_BLOCK_ELEMENTS);
const BLOCK_ELEMENTS = merge(OPTIONAL_END_TAG_BLOCK_ELEMENTS, tagSet("address,article,aside,blockquote,caption,center,del,details,dialog,dir,div,dl,figure,figcaption,footer,h1,h2,h3,h4,h5,h6,header,hgroup,hr,ins,main,map,menu,nav,ol,pre,section,summary,table,ul"));
const INLINE_ELEMENTS = merge(OPTIONAL_END_TAG_INLINE_ELEMENTS, tagSet("a,abbr,acronym,audio,b,bdi,bdo,big,br,cite,code,del,dfn,em,font,i,img,ins,kbd,label,map,mark,picture,q,ruby,rp,rt,s,samp,small,source,span,strike,strong,sub,sup,time,track,tt,u,var,video"));
const VALID_ELEMENTS = merge(VOID_ELEMENTS, BLOCK_ELEMENTS, INLINE_ELEMENTS, OPTIONAL_END_TAG_ELEMENTS);
const URI_ATTRS = tagSet("background,cite,href,itemtype,longdesc,poster,src,xlink:href");
const SRCSET_ATTRS = tagSet("srcset");
const HTML_ATTRS = tagSet("abbr,accesskey,align,alt,autoplay,axis,bgcolor,border,cellpadding,cellspacing,class,clear,color,cols,colspan,compact,controls,coords,datetime,default,dir,download,face,headers,height,hidden,hreflang,hspace,ismap,itemscope,itemprop,kind,label,lang,language,loop,media,muted,nohref,nowrap,open,preload,rel,rev,role,rows,rowspan,rules,scope,scrolling,shape,size,sizes,span,srclang,start,summary,tabindex,target,title,translate,type,usemap,valign,value,vspace,width");
const ARIA_ATTRS = tagSet("aria-activedescendant,aria-atomic,aria-autocomplete,aria-busy,aria-checked,aria-colcount,aria-colindex,aria-colspan,aria-controls,aria-current,aria-describedby,aria-details,aria-disabled,aria-dropeffect,aria-errormessage,aria-expanded,aria-flowto,aria-grabbed,aria-haspopup,aria-hidden,aria-invalid,aria-keyshortcuts,aria-label,aria-labelledby,aria-level,aria-live,aria-modal,aria-multiline,aria-multiselectable,aria-orientation,aria-owns,aria-placeholder,aria-posinset,aria-pressed,aria-readonly,aria-relevant,aria-required,aria-roledescription,aria-rowcount,aria-rowindex,aria-rowspan,aria-selected,aria-setsize,aria-sort,aria-valuemax,aria-valuemin,aria-valuenow,aria-valuetext");
const VALID_ATTRS = merge(URI_ATTRS, SRCSET_ATTRS, HTML_ATTRS, ARIA_ATTRS);
const SKIP_TRAVERSING_CONTENT_IF_INVALID_ELEMENTS = tagSet("script,style,template");
class SanitizingHtmlSerializer {
  constructor() {
    this.sanitizedSomething = false;
    this.buf = [];
  }
  sanitizeChildren(el) {
    let current = el.firstChild;
    let traverseContent = true;
    while (current) {
      if (current.nodeType === Node.ELEMENT_NODE) {
        traverseContent = this.startElement(current);
      } else if (current.nodeType === Node.TEXT_NODE) {
        this.chars(current.nodeValue);
      } else {
        this.sanitizedSomething = true;
      }
      if (traverseContent && current.firstChild) {
        current = current.firstChild;
        continue;
      }
      while (current) {
        if (current.nodeType === Node.ELEMENT_NODE) {
          this.endElement(current);
        }
        let next = this.checkClobberedElement(current, current.nextSibling);
        if (next) {
          current = next;
          break;
        }
        current = this.checkClobberedElement(current, current.parentNode);
      }
    }
    return this.buf.join("");
  }
  /**
   * Sanitizes an opening element tag (if valid) and returns whether the element's contents should
   * be traversed. Element content must always be traversed (even if the element itself is not
   * valid/safe), unless the element is one of `SKIP_TRAVERSING_CONTENT_IF_INVALID_ELEMENTS`.
   *
   * @param element The element to sanitize.
   * @return True if the element's contents should be traversed.
   */
  startElement(element) {
    const tagName = element.nodeName.toLowerCase();
    if (!VALID_ELEMENTS.hasOwnProperty(tagName)) {
      this.sanitizedSomething = true;
      return !SKIP_TRAVERSING_CONTENT_IF_INVALID_ELEMENTS.hasOwnProperty(tagName);
    }
    this.buf.push("<");
    this.buf.push(tagName);
    const elAttrs = element.attributes;
    for (let i = 0; i < elAttrs.length; i++) {
      const elAttr = elAttrs.item(i);
      const attrName = elAttr.name;
      const lower = attrName.toLowerCase();
      if (!VALID_ATTRS.hasOwnProperty(lower)) {
        this.sanitizedSomething = true;
        continue;
      }
      let value = elAttr.value;
      if (URI_ATTRS[lower])
        value = _sanitizeUrl(value);
      if (SRCSET_ATTRS[lower])
        value = sanitizeSrcset(value);
      this.buf.push(" ", attrName, '="', encodeEntities(value), '"');
    }
    this.buf.push(">");
    return true;
  }
  endElement(current) {
    const tagName = current.nodeName.toLowerCase();
    if (VALID_ELEMENTS.hasOwnProperty(tagName) && !VOID_ELEMENTS.hasOwnProperty(tagName)) {
      this.buf.push("</");
      this.buf.push(tagName);
      this.buf.push(">");
    }
  }
  chars(chars) {
    this.buf.push(encodeEntities(chars));
  }
  checkClobberedElement(node, nextNode) {
    if (nextNode && (node.compareDocumentPosition(nextNode) & Node.DOCUMENT_POSITION_CONTAINED_BY) === Node.DOCUMENT_POSITION_CONTAINED_BY) {
      throw new Error(`Failed to sanitize html because the element is clobbered: ${node.outerHTML}`);
    }
    return nextNode;
  }
}
const SURROGATE_PAIR_REGEXP = /[\uD800-\uDBFF][\uDC00-\uDFFF]/g;
const NON_ALPHANUMERIC_REGEXP = /([^\#-~ |!])/g;
function encodeEntities(value) {
  return value.replace(/&/g, "&amp;").replace(SURROGATE_PAIR_REGEXP, function(match) {
    const hi = match.charCodeAt(0);
    const low = match.charCodeAt(1);
    return "&#" + ((hi - 55296) * 1024 + (low - 56320) + 65536) + ";";
  }).replace(NON_ALPHANUMERIC_REGEXP, function(match) {
    return "&#" + match.charCodeAt(0) + ";";
  }).replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
let inertBodyHelper;
function _sanitizeHtml(defaultDoc, unsafeHtmlInput) {
  let inertBodyElement = null;
  try {
    inertBodyHelper = inertBodyHelper || getInertBodyHelper(defaultDoc);
    let unsafeHtml = unsafeHtmlInput ? String(unsafeHtmlInput) : "";
    inertBodyElement = inertBodyHelper.getInertBodyElement(unsafeHtml);
    let mXSSAttempts = 5;
    let parsedHtml = unsafeHtml;
    do {
      if (mXSSAttempts === 0) {
        throw new Error("Failed to sanitize html because the input is unstable");
      }
      mXSSAttempts--;
      unsafeHtml = parsedHtml;
      parsedHtml = inertBodyElement.innerHTML;
      inertBodyElement = inertBodyHelper.getInertBodyElement(unsafeHtml);
    } while (unsafeHtml !== parsedHtml);
    const sanitizer = new SanitizingHtmlSerializer();
    const safeHtml = sanitizer.sanitizeChildren(getTemplateContent(inertBodyElement) || inertBodyElement);
    if ((typeof ngDevMode === "undefined" || ngDevMode) && sanitizer.sanitizedSomething) {
      console.warn("WARNING: sanitizing HTML stripped some content, see https://g.co/ng/security#xss");
    }
    return trustedHTMLFromString(safeHtml);
  } finally {
    if (inertBodyElement) {
      const parent = getTemplateContent(inertBodyElement) || inertBodyElement;
      while (parent.firstChild) {
        parent.removeChild(parent.firstChild);
      }
    }
  }
}
function getTemplateContent(el) {
  return "content" in el && isTemplateElement(el) ? el.content : null;
}
function isTemplateElement(el) {
  return el.nodeType === Node.ELEMENT_NODE && el.nodeName === "TEMPLATE";
}
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
var SecurityContext;
(function(SecurityContext2) {
  SecurityContext2[SecurityContext2["NONE"] = 0] = "NONE";
  SecurityContext2[SecurityContext2["HTML"] = 1] = "HTML";
  SecurityContext2[SecurityContext2["STYLE"] = 2] = "STYLE";
  SecurityContext2[SecurityContext2["SCRIPT"] = 3] = "SCRIPT";
  SecurityContext2[SecurityContext2["URL"] = 4] = "URL";
  SecurityContext2[SecurityContext2["RESOURCE_URL"] = 5] = "RESOURCE_URL";
})(SecurityContext || (SecurityContext = {}));
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
function ɵɵsanitizeHtml(unsafeHtml) {
  const sanitizer = getSanitizer();
  if (sanitizer) {
    return trustedHTMLFromStringBypass(sanitizer.sanitize(SecurityContext.HTML, unsafeHtml) || "");
  }
  if (allowSanitizationBypassAndThrow(
    unsafeHtml,
    "HTML"
    /* Html */
  )) {
    return trustedHTMLFromStringBypass(unwrapSafeValue(unsafeHtml));
  }
  return _sanitizeHtml(getDocument(), renderStringify(unsafeHtml));
}
function ɵɵsanitizeStyle(unsafeStyle) {
  const sanitizer = getSanitizer();
  if (sanitizer) {
    return sanitizer.sanitize(SecurityContext.STYLE, unsafeStyle) || "";
  }
  if (allowSanitizationBypassAndThrow(
    unsafeStyle,
    "Style"
    /* Style */
  )) {
    return unwrapSafeValue(unsafeStyle);
  }
  return renderStringify(unsafeStyle);
}
function ɵɵsanitizeUrl(unsafeUrl) {
  const sanitizer = getSanitizer();
  if (sanitizer) {
    return sanitizer.sanitize(SecurityContext.URL, unsafeUrl) || "";
  }
  if (allowSanitizationBypassAndThrow(
    unsafeUrl,
    "URL"
    /* Url */
  )) {
    return unwrapSafeValue(unsafeUrl);
  }
  return _sanitizeUrl(renderStringify(unsafeUrl));
}
function ɵɵsanitizeResourceUrl(unsafeResourceUrl) {
  const sanitizer = getSanitizer();
  if (sanitizer) {
    return trustedScriptURLFromStringBypass(sanitizer.sanitize(SecurityContext.RESOURCE_URL, unsafeResourceUrl) || "");
  }
  if (allowSanitizationBypassAndThrow(
    unsafeResourceUrl,
    "ResourceURL"
    /* ResourceUrl */
  )) {
    return trustedScriptURLFromStringBypass(unwrapSafeValue(unsafeResourceUrl));
  }
  const errorMessage = typeof ngDevMode === "undefined" || ngDevMode ? "unsafe value used in a resource URL context (see https://g.co/ng/security#xss)" : "";
  throw new RuntimeError(904, errorMessage);
}
function ɵɵsanitizeScript(unsafeScript) {
  const sanitizer = getSanitizer();
  if (sanitizer) {
    return trustedScriptFromStringBypass(sanitizer.sanitize(SecurityContext.SCRIPT, unsafeScript) || "");
  }
  if (allowSanitizationBypassAndThrow(
    unsafeScript,
    "Script"
    /* Script */
  )) {
    return trustedScriptFromStringBypass(unwrapSafeValue(unsafeScript));
  }
  const errorMessage = typeof ngDevMode === "undefined" || ngDevMode ? "unsafe value used in a script context" : "";
  throw new RuntimeError(905, errorMessage);
}
function ɵɵtrustConstantHtml(html) {
  if (ngDevMode && (!Array.isArray(html) || !Array.isArray(html.raw) || html.length !== 1)) {
    throw new Error(`Unexpected interpolation in trusted HTML constant: ${html.join("?")}`);
  }
  return trustedHTMLFromString(html[0]);
}
function ɵɵtrustConstantResourceUrl(url) {
  if (ngDevMode && (!Array.isArray(url) || !Array.isArray(url.raw) || url.length !== 1)) {
    throw new Error(`Unexpected interpolation in trusted URL constant: ${url.join("?")}`);
  }
  return trustedScriptURLFromString(url[0]);
}
function getUrlSanitizer(tag, prop) {
  if (prop === "src" && (tag === "embed" || tag === "frame" || tag === "iframe" || tag === "media" || tag === "script") || prop === "href" && (tag === "base" || tag === "link")) {
    return ɵɵsanitizeResourceUrl;
  }
  return ɵɵsanitizeUrl;
}
function ɵɵsanitizeUrlOrResourceUrl(unsafeUrl, tag, prop) {
  return getUrlSanitizer(tag, prop)(unsafeUrl);
}
function validateAgainstEventProperties(name) {
  if (name.toLowerCase().startsWith("on")) {
    const errorMessage = `Binding to event property '${name}' is disallowed for security reasons, please use (${name.slice(2)})=...
If '${name}' is a directive input, make sure the directive is imported by the current module.`;
    throw new RuntimeError(306, errorMessage);
  }
}
function validateAgainstEventAttributes(name) {
  if (name.toLowerCase().startsWith("on")) {
    const errorMessage = `Binding to event attribute '${name}' is disallowed for security reasons, please use (${name.slice(2)})=...`;
    throw new RuntimeError(306, errorMessage);
  }
}
function getSanitizer() {
  const lView = getLView();
  return lView && lView[SANITIZER];
}
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
const ERROR_ORIGINAL_ERROR = "ngOriginalError";
const ERROR_LOGGER = "ngErrorLogger";
function wrappedError(message, originalError) {
  const msg = `${message} caused by: ${originalError instanceof Error ? originalError.message : originalError}`;
  const error = Error(msg);
  error[ERROR_ORIGINAL_ERROR] = originalError;
  return error;
}
function getOriginalError(error) {
  return error[ERROR_ORIGINAL_ERROR];
}
function getErrorLogger(error) {
  return error && error[ERROR_LOGGER] || defaultErrorLogger;
}
function defaultErrorLogger(console2, ...values) {
  console2.error(...values);
}
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
class ErrorHandler {
  constructor() {
    this._console = console;
  }
  handleError(error) {
    const originalError = this._findOriginalError(error);
    const errorLogger = getErrorLogger(error);
    errorLogger(this._console, `ERROR`, error);
    if (originalError) {
      errorLogger(this._console, `ORIGINAL ERROR`, originalError);
    }
  }
  /** @internal */
  _findOriginalError(error) {
    let e = error && getOriginalError(error);
    while (e && getOriginalError(e)) {
      e = getOriginalError(e);
    }
    return e || null;
  }
}
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
const CUSTOM_ELEMENTS_SCHEMA = {
  name: "custom-elements"
};
const NO_ERRORS_SCHEMA = {
  name: "no-errors-schema"
};
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
function normalizeDebugBindingName(name) {
  name = camelCaseToDashCase(name.replace(/[$@]/g, "_"));
  return `ng-reflect-${name}`;
}
const CAMEL_CASE_REGEXP = /([A-Z])/g;
function camelCaseToDashCase(input) {
  return input.replace(CAMEL_CASE_REGEXP, (...m) => "-" + m[1].toLowerCase());
}
function normalizeDebugBindingValue(value) {
  try {
    return value != null ? value.toString().slice(0, 30) : value;
  } catch (e) {
    return "[ERROR] Exception while trying to serialize the value";
  }
}
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
const defaultScheduler = (() => (typeof requestAnimationFrame !== "undefined" && requestAnimationFrame || // browser only
setTimeout).bind(_global))();
function ɵɵresolveWindow(element) {
  return element.ownerDocument.defaultView;
}
function ɵɵresolveDocument(element) {
  return element.ownerDocument;
}
function ɵɵresolveBody(element) {
  return element.ownerDocument.body;
}
const INTERPOLATION_DELIMITER = `�`;
function maybeUnwrapFn(value) {
  if (value instanceof Function) {
    return value();
  } else {
    return value;
  }
}
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
function throwMultipleComponentError(tNode, first2, second) {
  throw new RuntimeError(-300, `Multiple components match node with tagname ${tNode.value}: ${stringifyForError(first2)} and ${stringifyForError(second)}`);
}
function throwErrorIfNoChangesMode(creationMode, oldValue, currValue, propName) {
  const field = propName ? ` for '${propName}'` : "";
  let msg = `ExpressionChangedAfterItHasBeenCheckedError: Expression has changed after it was checked. Previous value${field}: '${oldValue}'. Current value: '${currValue}'.`;
  if (creationMode) {
    msg += ` It seems like the view has been created after its parent and its children have been dirty checked. Has it been created in a change detection hook?`;
  }
  throw new RuntimeError(-100, msg);
}
function constructDetailsForInterpolation(lView, rootIndex, expressionIndex, meta, changedValue) {
  const [propName, prefix, ...chunks] = meta.split(INTERPOLATION_DELIMITER);
  let oldValue = prefix, newValue = prefix;
  for (let i = 0; i < chunks.length; i++) {
    const slotIdx = rootIndex + i;
    oldValue += `${lView[slotIdx]}${chunks[i]}`;
    newValue += `${slotIdx === expressionIndex ? changedValue : lView[slotIdx]}${chunks[i]}`;
  }
  return { propName, oldValue, newValue };
}
function getExpressionChangedErrorDetails(lView, bindingIndex, oldValue, newValue) {
  const tData = lView[TVIEW].data;
  const metadata = tData[bindingIndex];
  if (typeof metadata === "string") {
    if (metadata.indexOf(INTERPOLATION_DELIMITER) > -1) {
      return constructDetailsForInterpolation(lView, bindingIndex, bindingIndex, metadata, newValue);
    }
    return { propName: metadata, oldValue, newValue };
  }
  if (metadata === null) {
    let idx = bindingIndex - 1;
    while (typeof tData[idx] !== "string" && tData[idx + 1] === null) {
      idx--;
    }
    const meta = tData[idx];
    if (typeof meta === "string") {
      const matches = meta.match(new RegExp(INTERPOLATION_DELIMITER, "g"));
      if (matches && matches.length - 1 > bindingIndex - idx) {
        return constructDetailsForInterpolation(lView, idx, bindingIndex, meta, newValue);
      }
    }
  }
  return { propName: void 0, oldValue, newValue };
}
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
function classIndexOf(className, classToSearch, startingIndex) {
  ngDevMode && assertNotEqual(classToSearch, "", 'can not look for "" string.');
  let end = className.length;
  while (true) {
    const foundIndex = className.indexOf(classToSearch, startingIndex);
    if (foundIndex === -1)
      return foundIndex;
    if (foundIndex === 0 || className.charCodeAt(foundIndex - 1) <= 32) {
      const length = classToSearch.length;
      if (foundIndex + length === end || className.charCodeAt(foundIndex + length) <= 32) {
        return foundIndex;
      }
    }
    startingIndex = foundIndex + 1;
  }
}
const NG_TEMPLATE_SELECTOR = "ng-template";
function isCssClassMatching(attrs, cssClassToMatch, isProjectionMode) {
  ngDevMode && assertEqual(cssClassToMatch, cssClassToMatch.toLowerCase(), "Class name expected to be lowercase.");
  let i = 0;
  while (i < attrs.length) {
    let item = attrs[i++];
    if (isProjectionMode && item === "class") {
      item = attrs[i];
      if (classIndexOf(item.toLowerCase(), cssClassToMatch, 0) !== -1) {
        return true;
      }
    } else if (item === 1) {
      while (i < attrs.length && typeof (item = attrs[i++]) == "string") {
        if (item.toLowerCase() === cssClassToMatch)
          return true;
      }
      return false;
    }
  }
  return false;
}
function isInlineTemplate(tNode) {
  return tNode.type === 4 && tNode.value !== NG_TEMPLATE_SELECTOR;
}
function hasTagAndTypeMatch(tNode, currentSelector, isProjectionMode) {
  const tagNameToCompare = tNode.type === 4 && !isProjectionMode ? NG_TEMPLATE_SELECTOR : tNode.value;
  return currentSelector === tagNameToCompare;
}
function isNodeMatchingSelector(tNode, selector, isProjectionMode) {
  ngDevMode && assertDefined(selector[0], "Selector should have a tag name");
  let mode = 4;
  const nodeAttrs = tNode.attrs || [];
  const nameOnlyMarkerIdx = getNameOnlyMarkerIndex(nodeAttrs);
  let skipToNextSelector = false;
  for (let i = 0; i < selector.length; i++) {
    const current = selector[i];
    if (typeof current === "number") {
      if (!skipToNextSelector && !isPositive(mode) && !isPositive(current)) {
        return false;
      }
      if (skipToNextSelector && isPositive(current))
        continue;
      skipToNextSelector = false;
      mode = current | mode & 1;
      continue;
    }
    if (skipToNextSelector)
      continue;
    if (mode & 4) {
      mode = 2 | mode & 1;
      if (current !== "" && !hasTagAndTypeMatch(tNode, current, isProjectionMode) || current === "" && selector.length === 1) {
        if (isPositive(mode))
          return false;
        skipToNextSelector = true;
      }
    } else {
      const selectorAttrValue = mode & 8 ? current : selector[++i];
      if (mode & 8 && tNode.attrs !== null) {
        if (!isCssClassMatching(tNode.attrs, selectorAttrValue, isProjectionMode)) {
          if (isPositive(mode))
            return false;
          skipToNextSelector = true;
        }
        continue;
      }
      const attrName = mode & 8 ? "class" : current;
      const attrIndexInNode = findAttrIndexInNode(attrName, nodeAttrs, isInlineTemplate(tNode), isProjectionMode);
      if (attrIndexInNode === -1) {
        if (isPositive(mode))
          return false;
        skipToNextSelector = true;
        continue;
      }
      if (selectorAttrValue !== "") {
        let nodeAttrValue;
        if (attrIndexInNode > nameOnlyMarkerIdx) {
          nodeAttrValue = "";
        } else {
          ngDevMode && assertNotEqual(nodeAttrs[attrIndexInNode], 0, "We do not match directives on namespaced attributes");
          nodeAttrValue = nodeAttrs[attrIndexInNode + 1].toLowerCase();
        }
        const compareAgainstClassName = mode & 8 ? nodeAttrValue : null;
        if (compareAgainstClassName && classIndexOf(compareAgainstClassName, selectorAttrValue, 0) !== -1 || mode & 2 && selectorAttrValue !== nodeAttrValue) {
          if (isPositive(mode))
            return false;
          skipToNextSelector = true;
        }
      }
    }
  }
  return isPositive(mode) || skipToNextSelector;
}
function isPositive(mode) {
  return (mode & 1) === 0;
}
function findAttrIndexInNode(name, attrs, isInlineTemplate2, isProjectionMode) {
  if (attrs === null)
    return -1;
  let i = 0;
  if (isProjectionMode || !isInlineTemplate2) {
    let bindingsMode = false;
    while (i < attrs.length) {
      const maybeAttrName = attrs[i];
      if (maybeAttrName === name) {
        return i;
      } else if (maybeAttrName === 3 || maybeAttrName === 6) {
        bindingsMode = true;
      } else if (maybeAttrName === 1 || maybeAttrName === 2) {
        let value = attrs[++i];
        while (typeof value === "string") {
          value = attrs[++i];
        }
        continue;
      } else if (maybeAttrName === 4) {
        break;
      } else if (maybeAttrName === 0) {
        i += 4;
        continue;
      }
      i += bindingsMode ? 1 : 2;
    }
    return -1;
  } else {
    return matchTemplateAttribute(attrs, name);
  }
}
function isNodeMatchingSelectorList(tNode, selector, isProjectionMode = false) {
  for (let i = 0; i < selector.length; i++) {
    if (isNodeMatchingSelector(tNode, selector[i], isProjectionMode)) {
      return true;
    }
  }
  return false;
}
function getProjectAsAttrValue(tNode) {
  const nodeAttrs = tNode.attrs;
  if (nodeAttrs != null) {
    const ngProjectAsAttrIdx = nodeAttrs.indexOf(
      5
      /* ProjectAs */
    );
    if ((ngProjectAsAttrIdx & 1) === 0) {
      return nodeAttrs[ngProjectAsAttrIdx + 1];
    }
  }
  return null;
}
function getNameOnlyMarkerIndex(nodeAttrs) {
  for (let i = 0; i < nodeAttrs.length; i++) {
    const nodeAttr = nodeAttrs[i];
    if (isNameOnlyAttributeMarker(nodeAttr)) {
      return i;
    }
  }
  return nodeAttrs.length;
}
function matchTemplateAttribute(attrs, name) {
  let i = attrs.indexOf(
    4
    /* Template */
  );
  if (i > -1) {
    i++;
    while (i < attrs.length) {
      const attr = attrs[i];
      if (typeof attr === "number")
        return -1;
      if (attr === name)
        return i;
      i++;
    }
  }
  return -1;
}
function isSelectorInSelectorList(selector, list) {
  selectorListLoop: for (let i = 0; i < list.length; i++) {
    const currentSelectorInList = list[i];
    if (selector.length !== currentSelectorInList.length) {
      continue;
    }
    for (let j = 0; j < selector.length; j++) {
      if (selector[j] !== currentSelectorInList[j]) {
        continue selectorListLoop;
      }
    }
    return true;
  }
  return false;
}
function maybeWrapInNotSelector(isNegativeMode, chunk) {
  return isNegativeMode ? ":not(" + chunk.trim() + ")" : chunk;
}
function stringifyCSSSelector(selector) {
  let result = selector[0];
  let i = 1;
  let mode = 2;
  let currentChunk = "";
  let isNegativeMode = false;
  while (i < selector.length) {
    let valueOrMarker = selector[i];
    if (typeof valueOrMarker === "string") {
      if (mode & 2) {
        const attrValue = selector[++i];
        currentChunk += "[" + valueOrMarker + (attrValue.length > 0 ? '="' + attrValue + '"' : "") + "]";
      } else if (mode & 8) {
        currentChunk += "." + valueOrMarker;
      } else if (mode & 4) {
        currentChunk += " " + valueOrMarker;
      }
    } else {
      if (currentChunk !== "" && !isPositive(valueOrMarker)) {
        result += maybeWrapInNotSelector(isNegativeMode, currentChunk);
        currentChunk = "";
      }
      mode = valueOrMarker;
      isNegativeMode = isNegativeMode || !isPositive(mode);
    }
    i++;
  }
  if (currentChunk !== "") {
    result += maybeWrapInNotSelector(isNegativeMode, currentChunk);
  }
  return result;
}
function stringifyCSSSelectorList(selectorList) {
  return selectorList.map(stringifyCSSSelector).join(",");
}
function extractAttrsAndClassesFromSelector(selector) {
  const attrs = [];
  const classes = [];
  let i = 1;
  let mode = 2;
  while (i < selector.length) {
    let valueOrMarker = selector[i];
    if (typeof valueOrMarker === "string") {
      if (mode === 2) {
        if (valueOrMarker !== "") {
          attrs.push(valueOrMarker, selector[++i]);
        }
      } else if (mode === 8) {
        classes.push(valueOrMarker);
      }
    } else {
      if (!isPositive(mode))
        break;
      mode = valueOrMarker;
    }
    i++;
  }
  return { attrs, classes };
}
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
const NO_CHANGE = typeof ngDevMode === "undefined" || ngDevMode ? { __brand__: "NO_CHANGE" } : {};
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
function ɵɵadvance(delta) {
  ngDevMode && assertGreaterThan(delta, 0, "Can only advance forward");
  selectIndexInternal(getTView(), getLView(), getSelectedIndex() + delta, !!ngDevMode && isInCheckNoChangesMode());
}
function selectIndexInternal(tView, lView, index, checkNoChangesMode) {
  ngDevMode && assertIndexInDeclRange(lView, index);
  if (!checkNoChangesMode) {
    const hooksInitPhaseCompleted = (lView[FLAGS] & 3) === 3;
    if (hooksInitPhaseCompleted) {
      const preOrderCheckHooks = tView.preOrderCheckHooks;
      if (preOrderCheckHooks !== null) {
        executeCheckHooks(lView, preOrderCheckHooks, index);
      }
    } else {
      const preOrderHooks = tView.preOrderHooks;
      if (preOrderHooks !== null) {
        executeInitAndCheckHooks(lView, preOrderHooks, 0, index);
      }
    }
  }
  setSelectedIndex(index);
}
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
function createNamedArrayType(name) {
  if (ngDevMode) {
    try {
      return newTrustedFunctionForDev("Array", `return class ${name} extends Array{}`)(Array);
    } catch (e) {
      return Array;
    }
  } else {
    throw new Error("Looks like we are in 'prod mode', but we are creating a named Array type, which is wrong! Check your code");
  }
}
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
function toTStylingRange(prev, next) {
  ngDevMode && assertNumberInRange(
    prev,
    0,
    32767
    /* UNSIGNED_MASK */
  );
  ngDevMode && assertNumberInRange(
    next,
    0,
    32767
    /* UNSIGNED_MASK */
  );
  return prev << 17 | next << 2;
}
function getTStylingRangePrev(tStylingRange) {
  ngDevMode && assertNumber(tStylingRange, "expected number");
  return tStylingRange >> 17 & 32767;
}
function getTStylingRangePrevDuplicate(tStylingRange) {
  ngDevMode && assertNumber(tStylingRange, "expected number");
  return (tStylingRange & 2) == 2;
}
function setTStylingRangePrev(tStylingRange, previous) {
  ngDevMode && assertNumber(tStylingRange, "expected number");
  ngDevMode && assertNumberInRange(
    previous,
    0,
    32767
    /* UNSIGNED_MASK */
  );
  return tStylingRange & 131071 | previous << 17;
}
function setTStylingRangePrevDuplicate(tStylingRange) {
  ngDevMode && assertNumber(tStylingRange, "expected number");
  return tStylingRange | 2;
}
function getTStylingRangeNext(tStylingRange) {
  ngDevMode && assertNumber(tStylingRange, "expected number");
  return (tStylingRange & 131068) >> 2;
}
function setTStylingRangeNext(tStylingRange, next) {
  ngDevMode && assertNumber(tStylingRange, "expected number");
  ngDevMode && assertNumberInRange(
    next,
    0,
    32767
    /* UNSIGNED_MASK */
  );
  return tStylingRange & -131069 | //
  next << 2;
}
function getTStylingRangeNextDuplicate(tStylingRange) {
  ngDevMode && assertNumber(tStylingRange, "expected number");
  return (tStylingRange & 1) === 1;
}
function setTStylingRangeNextDuplicate(tStylingRange) {
  ngDevMode && assertNumber(tStylingRange, "expected number");
  return tStylingRange | 1;
}
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
function attachDebugObject(obj, debug) {
  if (ngDevMode) {
    Object.defineProperty(obj, "debug", { value: debug, enumerable: false });
  } else {
    throw new Error("This method should be guarded with `ngDevMode` so that it can be tree shaken in production!");
  }
}
function attachDebugGetter(obj, debugGetter) {
  if (ngDevMode) {
    Object.defineProperty(obj, "debug", { get: debugGetter, enumerable: false });
  } else {
    throw new Error("This method should be guarded with `ngDevMode` so that it can be tree shaken in production!");
  }
}
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
let LVIEW_COMPONENT_CACHE;
let LVIEW_EMBEDDED_CACHE;
let LVIEW_ROOT;
let LVIEW_COMPONENT;
let LVIEW_EMBEDDED;
function cloneToLViewFromTViewBlueprint(tView) {
  const debugTView = tView;
  const lView = getLViewToClone(debugTView.type, tView.template && tView.template.name);
  return lView.concat(tView.blueprint);
}
class LRootView extends Array {
}
class LComponentView extends Array {
}
class LEmbeddedView extends Array {
}
function getLViewToClone(type, name) {
  switch (type) {
    case 0:
      if (LVIEW_ROOT === void 0)
        LVIEW_ROOT = new LRootView();
      return LVIEW_ROOT;
    case 1:
      if (!ngDevMode || !ngDevMode.namedConstructors) {
        if (LVIEW_COMPONENT === void 0)
          LVIEW_COMPONENT = new LComponentView();
        return LVIEW_COMPONENT;
      }
      if (LVIEW_COMPONENT_CACHE === void 0)
        LVIEW_COMPONENT_CACHE = /* @__PURE__ */ new Map();
      let componentArray = LVIEW_COMPONENT_CACHE.get(name);
      if (componentArray === void 0) {
        componentArray = new (createNamedArrayType("LComponentView" + nameSuffix(name)))();
        LVIEW_COMPONENT_CACHE.set(name, componentArray);
      }
      return componentArray;
    case 2:
      if (!ngDevMode || !ngDevMode.namedConstructors) {
        if (LVIEW_EMBEDDED === void 0)
          LVIEW_EMBEDDED = new LEmbeddedView();
        return LVIEW_EMBEDDED;
      }
      if (LVIEW_EMBEDDED_CACHE === void 0)
        LVIEW_EMBEDDED_CACHE = /* @__PURE__ */ new Map();
      let embeddedArray = LVIEW_EMBEDDED_CACHE.get(name);
      if (embeddedArray === void 0) {
        embeddedArray = new (createNamedArrayType("LEmbeddedView" + nameSuffix(name)))();
        LVIEW_EMBEDDED_CACHE.set(name, embeddedArray);
      }
      return embeddedArray;
  }
}
function nameSuffix(text) {
  if (text == null)
    return "";
  const index = text.lastIndexOf("_Template");
  return "_" + (index === -1 ? text : text.substr(0, index));
}
const TViewConstructor = class TView {
  constructor(type, blueprint, template, queries, viewQuery, declTNode, data, bindingStartIndex, expandoStartIndex, hostBindingOpCodes, firstCreatePass, firstUpdatePass, staticViewQueries, staticContentQueries, preOrderHooks, preOrderCheckHooks, contentHooks, contentCheckHooks, viewHooks, viewCheckHooks, destroyHooks, cleanup, contentQueries, components, directiveRegistry, pipeRegistry, firstChild, schemas, consts, incompleteFirstPass, _decls, _vars) {
    this.type = type;
    this.blueprint = blueprint;
    this.template = template;
    this.queries = queries;
    this.viewQuery = viewQuery;
    this.declTNode = declTNode;
    this.data = data;
    this.bindingStartIndex = bindingStartIndex;
    this.expandoStartIndex = expandoStartIndex;
    this.hostBindingOpCodes = hostBindingOpCodes;
    this.firstCreatePass = firstCreatePass;
    this.firstUpdatePass = firstUpdatePass;
    this.staticViewQueries = staticViewQueries;
    this.staticContentQueries = staticContentQueries;
    this.preOrderHooks = preOrderHooks;
    this.preOrderCheckHooks = preOrderCheckHooks;
    this.contentHooks = contentHooks;
    this.contentCheckHooks = contentCheckHooks;
    this.viewHooks = viewHooks;
    this.viewCheckHooks = viewCheckHooks;
    this.destroyHooks = destroyHooks;
    this.cleanup = cleanup;
    this.contentQueries = contentQueries;
    this.components = components;
    this.directiveRegistry = directiveRegistry;
    this.pipeRegistry = pipeRegistry;
    this.firstChild = firstChild;
    this.schemas = schemas;
    this.consts = consts;
    this.incompleteFirstPass = incompleteFirstPass;
    this._decls = _decls;
    this._vars = _vars;
  }
  get template_() {
    const buf = [];
    processTNodeChildren(this.firstChild, buf);
    return buf.join("");
  }
  get type_() {
    return TViewTypeAsString[this.type] || `TViewType.?${this.type}?`;
  }
};
class TNode {
  constructor(tView_, type, index, insertBeforeIndex, injectorIndex, directiveStart, directiveEnd, directiveStylingLast, propertyBindings, flags, providerIndexes, value, attrs, mergedAttrs, localNames, initialInputs, inputs, outputs, tViews, next, projectionNext, child, parent, projection, styles, stylesWithoutHost, residualStyles, classes, classesWithoutHost, residualClasses, classBindings, styleBindings) {
    this.tView_ = tView_;
    this.type = type;
    this.index = index;
    this.insertBeforeIndex = insertBeforeIndex;
    this.injectorIndex = injectorIndex;
    this.directiveStart = directiveStart;
    this.directiveEnd = directiveEnd;
    this.directiveStylingLast = directiveStylingLast;
    this.propertyBindings = propertyBindings;
    this.flags = flags;
    this.providerIndexes = providerIndexes;
    this.value = value;
    this.attrs = attrs;
    this.mergedAttrs = mergedAttrs;
    this.localNames = localNames;
    this.initialInputs = initialInputs;
    this.inputs = inputs;
    this.outputs = outputs;
    this.tViews = tViews;
    this.next = next;
    this.projectionNext = projectionNext;
    this.child = child;
    this.parent = parent;
    this.projection = projection;
    this.styles = styles;
    this.stylesWithoutHost = stylesWithoutHost;
    this.residualStyles = residualStyles;
    this.classes = classes;
    this.classesWithoutHost = classesWithoutHost;
    this.residualClasses = residualClasses;
    this.classBindings = classBindings;
    this.styleBindings = styleBindings;
  }
  /**
   * Return a human debug version of the set of `NodeInjector`s which will be consulted when
   * resolving tokens from this `TNode`.
   *
   * When debugging applications, it is often difficult to determine which `NodeInjector`s will be
   * consulted. This method shows a list of `DebugNode`s representing the `TNode`s which will be
   * consulted in order when resolving a token starting at this `TNode`.
   *
   * The original data is stored in `LView` and `TView` with a lot of offset indexes, and so it is
   * difficult to reason about.
   *
   * @param lView The `LView` instance for this `TNode`.
   */
  debugNodeInjectorPath(lView) {
    const path = [];
    let injectorIndex = getInjectorIndex(this, lView);
    if (injectorIndex === -1) {
      const parentLocation = getParentInjectorLocation(this, lView);
      if (parentLocation !== NO_PARENT_INJECTOR) {
        injectorIndex = getParentInjectorIndex(parentLocation);
        lView = getParentInjectorView(parentLocation, lView);
      }
    }
    while (injectorIndex !== -1) {
      ngDevMode && assertNodeInjector(lView, injectorIndex);
      const tNode = lView[TVIEW].data[
        injectorIndex + 8
        /* TNODE */
      ];
      path.push(buildDebugNode(tNode, lView));
      const parentLocation = lView[
        injectorIndex + 8
        /* PARENT */
      ];
      if (parentLocation === NO_PARENT_INJECTOR) {
        injectorIndex = -1;
      } else {
        injectorIndex = getParentInjectorIndex(parentLocation);
        lView = getParentInjectorView(parentLocation, lView);
      }
    }
    return path;
  }
  get type_() {
    return toTNodeTypeAsString(this.type) || `TNodeType.?${this.type}?`;
  }
  get flags_() {
    const flags = [];
    if (this.flags & 16)
      flags.push("TNodeFlags.hasClassInput");
    if (this.flags & 8)
      flags.push("TNodeFlags.hasContentQuery");
    if (this.flags & 32)
      flags.push("TNodeFlags.hasStyleInput");
    if (this.flags & 128)
      flags.push("TNodeFlags.hasHostBindings");
    if (this.flags & 2)
      flags.push("TNodeFlags.isComponentHost");
    if (this.flags & 1)
      flags.push("TNodeFlags.isDirectiveHost");
    if (this.flags & 64)
      flags.push("TNodeFlags.isDetached");
    if (this.flags & 4)
      flags.push("TNodeFlags.isProjected");
    return flags.join("|");
  }
  get template_() {
    if (this.type & 1)
      return this.value;
    const buf = [];
    const tagName = typeof this.value === "string" && this.value || this.type_;
    buf.push("<", tagName);
    if (this.flags) {
      buf.push(" ", this.flags_);
    }
    if (this.attrs) {
      for (let i = 0; i < this.attrs.length; ) {
        const attrName = this.attrs[i++];
        if (typeof attrName == "number") {
          break;
        }
        const attrValue = this.attrs[i++];
        buf.push(" ", attrName, '="', attrValue, '"');
      }
    }
    buf.push(">");
    processTNodeChildren(this.child, buf);
    buf.push("</", tagName, ">");
    return buf.join("");
  }
  get styleBindings_() {
    return toDebugStyleBinding(this, false);
  }
  get classBindings_() {
    return toDebugStyleBinding(this, true);
  }
  get providerIndexStart_() {
    return this.providerIndexes & 1048575;
  }
  get providerIndexEnd_() {
    return this.providerIndexStart_ + (this.providerIndexes >>> 20);
  }
}
const TNodeDebug = TNode;
function toDebugStyleBinding(tNode, isClassBased) {
  const tData = tNode.tView_.data;
  const bindings = [];
  const range = isClassBased ? tNode.classBindings : tNode.styleBindings;
  const prev = getTStylingRangePrev(range);
  const next = getTStylingRangeNext(range);
  let isTemplate = next !== 0;
  let cursor = isTemplate ? next : prev;
  while (cursor !== 0) {
    const itemKey = tData[cursor];
    const itemRange = tData[cursor + 1];
    bindings.unshift({
      key: itemKey,
      index: cursor,
      isTemplate,
      prevDuplicate: getTStylingRangePrevDuplicate(itemRange),
      nextDuplicate: getTStylingRangeNextDuplicate(itemRange),
      nextIndex: getTStylingRangeNext(itemRange),
      prevIndex: getTStylingRangePrev(itemRange)
    });
    if (cursor === prev)
      isTemplate = false;
    cursor = getTStylingRangePrev(itemRange);
  }
  bindings.push((isClassBased ? tNode.residualClasses : tNode.residualStyles) || null);
  return bindings;
}
function processTNodeChildren(tNode, buf) {
  while (tNode) {
    buf.push(tNode.template_);
    tNode = tNode.next;
  }
}
class TViewData extends Array {
}
let TVIEWDATA_EMPTY;
function cloneToTViewData(list) {
  if (TVIEWDATA_EMPTY === void 0)
    TVIEWDATA_EMPTY = new TViewData();
  return TVIEWDATA_EMPTY.concat(list);
}
class LViewBlueprint extends Array {
}
class MatchesArray extends Array {
}
class TViewComponents extends Array {
}
class TNodeLocalNames extends Array {
}
class TNodeInitialInputs extends Array {
}
class LCleanup extends Array {
}
class TCleanup extends Array {
}
function attachLViewDebug(lView) {
  attachDebugObject(lView, new LViewDebug(lView));
}
function attachLContainerDebug(lContainer) {
  attachDebugObject(lContainer, new LContainerDebug(lContainer));
}
function toDebug(obj) {
  if (obj) {
    const debug = obj.debug;
    assertDefined(debug, "Object does not have a debug representation.");
    return debug;
  } else {
    return obj;
  }
}
function toHtml(value, includeChildren = false) {
  const node = unwrapRNode(value);
  if (node) {
    switch (node.nodeType) {
      case Node.TEXT_NODE:
        return node.textContent;
      case Node.COMMENT_NODE:
        return `<!--${node.textContent}-->`;
      case Node.ELEMENT_NODE:
        const outerHTML = node.outerHTML;
        if (includeChildren) {
          return outerHTML;
        } else {
          const innerHTML = ">" + node.innerHTML + "<";
          return outerHTML.split(innerHTML)[0] + ">";
        }
    }
  }
  return null;
}
class LViewDebug {
  constructor(_raw_lView) {
    this._raw_lView = _raw_lView;
  }
  /**
   * Flags associated with the `LView` unpacked into a more readable state.
   */
  get flags() {
    const flags = this._raw_lView[FLAGS];
    return {
      __raw__flags__: flags,
      initPhaseState: flags & 3,
      creationMode: !!(flags & 4),
      firstViewPass: !!(flags & 8),
      checkAlways: !!(flags & 16),
      dirty: !!(flags & 64),
      attached: !!(flags & 128),
      destroyed: !!(flags & 256),
      isRoot: !!(flags & 512),
      indexWithinInitPhase: flags >> 11
    };
  }
  get parent() {
    return toDebug(this._raw_lView[PARENT]);
  }
  get hostHTML() {
    return toHtml(this._raw_lView[HOST], true);
  }
  get html() {
    return (this.nodes || []).map(mapToHTML).join("");
  }
  get context() {
    return this._raw_lView[CONTEXT];
  }
  /**
   * The tree of nodes associated with the current `LView`. The nodes have been normalized into
   * a tree structure with relevant details pulled out for readability.
   */
  get nodes() {
    const lView = this._raw_lView;
    const tNode = lView[TVIEW].firstChild;
    return toDebugNodes(tNode, lView);
  }
  get template() {
    return this.tView.template_;
  }
  get tView() {
    return this._raw_lView[TVIEW];
  }
  get cleanup() {
    return this._raw_lView[CLEANUP];
  }
  get injector() {
    return this._raw_lView[INJECTOR$1];
  }
  get rendererFactory() {
    return this._raw_lView[RENDERER_FACTORY];
  }
  get renderer() {
    return this._raw_lView[RENDERER];
  }
  get sanitizer() {
    return this._raw_lView[SANITIZER];
  }
  get childHead() {
    return toDebug(this._raw_lView[CHILD_HEAD]);
  }
  get next() {
    return toDebug(this._raw_lView[NEXT]);
  }
  get childTail() {
    return toDebug(this._raw_lView[CHILD_TAIL]);
  }
  get declarationView() {
    return toDebug(this._raw_lView[DECLARATION_VIEW]);
  }
  get queries() {
    return this._raw_lView[QUERIES];
  }
  get tHost() {
    return this._raw_lView[T_HOST];
  }
  get decls() {
    return toLViewRange(this.tView, this._raw_lView, HEADER_OFFSET, this.tView.bindingStartIndex);
  }
  get vars() {
    return toLViewRange(this.tView, this._raw_lView, this.tView.bindingStartIndex, this.tView.expandoStartIndex);
  }
  get expando() {
    return toLViewRange(this.tView, this._raw_lView, this.tView.expandoStartIndex, this._raw_lView.length);
  }
  /**
   * Normalized view of child views (and containers) attached at this location.
   */
  get childViews() {
    const childViews = [];
    let child = this.childHead;
    while (child) {
      childViews.push(child);
      child = child.next;
    }
    return childViews;
  }
}
function mapToHTML(node) {
  if (node.type === "ElementContainer") {
    return (node.children || []).map(mapToHTML).join("");
  } else if (node.type === "IcuContainer") {
    throw new Error("Not implemented");
  } else {
    return toHtml(node.native, true) || "";
  }
}
function toLViewRange(tView, lView, start, end) {
  let content = [];
  for (let index = start; index < end; index++) {
    content.push({ index, t: tView.data[index], l: lView[index] });
  }
  return { start, end, length: end - start, content };
}
function toDebugNodes(tNode, lView) {
  if (tNode) {
    const debugNodes = [];
    let tNodeCursor = tNode;
    while (tNodeCursor) {
      debugNodes.push(buildDebugNode(tNodeCursor, lView));
      tNodeCursor = tNodeCursor.next;
    }
    return debugNodes;
  } else {
    return [];
  }
}
function buildDebugNode(tNode, lView) {
  const rawValue = lView[tNode.index];
  const native = unwrapRNode(rawValue);
  const factories = [];
  const instances = [];
  const tView = lView[TVIEW];
  for (let i = tNode.directiveStart; i < tNode.directiveEnd; i++) {
    const def = tView.data[i];
    factories.push(def.type);
    instances.push(lView[i]);
  }
  return {
    html: toHtml(native),
    type: toTNodeTypeAsString(tNode.type),
    tNode,
    native,
    children: toDebugNodes(tNode.child, lView),
    factories,
    instances,
    injector: buildNodeInjectorDebug(tNode, tView, lView),
    get injectorResolutionPath() {
      return tNode.debugNodeInjectorPath(lView);
    }
  };
}
function buildNodeInjectorDebug(tNode, tView, lView) {
  const viewProviders = [];
  for (let i = tNode.providerIndexStart_; i < tNode.providerIndexEnd_; i++) {
    viewProviders.push(tView.data[i]);
  }
  const providers = [];
  for (let i = tNode.providerIndexEnd_; i < tNode.directiveEnd; i++) {
    providers.push(tView.data[i]);
  }
  const nodeInjectorDebug = {
    bloom: toBloom(lView, tNode.injectorIndex),
    cumulativeBloom: toBloom(tView.data, tNode.injectorIndex),
    providers,
    viewProviders,
    parentInjectorIndex: lView[tNode.providerIndexStart_ - 1]
  };
  return nodeInjectorDebug;
}
function binary(array, idx) {
  const value = array[idx];
  if (typeof value !== "number")
    return "????????";
  const text = "00000000" + value.toString(2);
  return text.substring(text.length - 8);
}
function toBloom(array, idx) {
  if (idx < 0) {
    return "NO_NODE_INJECTOR";
  }
  return `${binary(array, idx + 7)}_${binary(array, idx + 6)}_${binary(array, idx + 5)}_${binary(array, idx + 4)}_${binary(array, idx + 3)}_${binary(array, idx + 2)}_${binary(array, idx + 1)}_${binary(array, idx + 0)}`;
}
class LContainerDebug {
  constructor(_raw_lContainer) {
    this._raw_lContainer = _raw_lContainer;
  }
  get hasTransplantedViews() {
    return this._raw_lContainer[HAS_TRANSPLANTED_VIEWS];
  }
  get views() {
    return this._raw_lContainer.slice(CONTAINER_HEADER_OFFSET).map(toDebug);
  }
  get parent() {
    return toDebug(this._raw_lContainer[PARENT]);
  }
  get movedViews() {
    return this._raw_lContainer[MOVED_VIEWS];
  }
  get host() {
    return this._raw_lContainer[HOST];
  }
  get native() {
    return this._raw_lContainer[NATIVE];
  }
  get next() {
    return toDebug(this._raw_lContainer[NEXT]);
  }
}
const _CLEAN_PROMISE = (() => Promise.resolve(null))();
function processHostBindingOpCodes(tView, lView) {
  const hostBindingOpCodes = tView.hostBindingOpCodes;
  if (hostBindingOpCodes === null)
    return;
  try {
    for (let i = 0; i < hostBindingOpCodes.length; i++) {
      const opCode = hostBindingOpCodes[i];
      if (opCode < 0) {
        setSelectedIndex(~opCode);
      } else {
        const directiveIdx = opCode;
        const bindingRootIndx = hostBindingOpCodes[++i];
        const hostBindingFn = hostBindingOpCodes[++i];
        setBindingRootForHostBindings(bindingRootIndx, directiveIdx);
        const context = lView[directiveIdx];
        hostBindingFn(2, context);
      }
    }
  } finally {
    setSelectedIndex(-1);
  }
}
function refreshContentQueries(tView, lView) {
  const contentQueries = tView.contentQueries;
  if (contentQueries !== null) {
    for (let i = 0; i < contentQueries.length; i += 2) {
      const queryStartIdx = contentQueries[i];
      const directiveDefIdx = contentQueries[i + 1];
      if (directiveDefIdx !== -1) {
        const directiveDef = tView.data[directiveDefIdx];
        ngDevMode && assertDefined(directiveDef, "DirectiveDef not found.");
        ngDevMode && assertDefined(directiveDef.contentQueries, "contentQueries function should be defined");
        setCurrentQueryIndex(queryStartIdx);
        directiveDef.contentQueries(2, lView[directiveDefIdx], directiveDefIdx);
      }
    }
  }
}
function refreshChildComponents(hostLView, components) {
  for (let i = 0; i < components.length; i++) {
    refreshComponent(hostLView, components[i]);
  }
}
function renderChildComponents(hostLView, components) {
  for (let i = 0; i < components.length; i++) {
    renderComponent$1(hostLView, components[i]);
  }
}
function createLView(parentLView, tView, context, flags, host, tHostNode, rendererFactory, renderer, sanitizer, injector) {
  const lView = ngDevMode ? cloneToLViewFromTViewBlueprint(tView) : tView.blueprint.slice();
  lView[HOST] = host;
  lView[FLAGS] = flags | 4 | 128 | 8;
  resetPreOrderHookFlags(lView);
  ngDevMode && tView.declTNode && parentLView && assertTNodeForLView(tView.declTNode, parentLView);
  lView[PARENT] = lView[DECLARATION_VIEW] = parentLView;
  lView[CONTEXT] = context;
  lView[RENDERER_FACTORY] = rendererFactory || parentLView && parentLView[RENDERER_FACTORY];
  ngDevMode && assertDefined(lView[RENDERER_FACTORY], "RendererFactory is required");
  lView[RENDERER] = renderer || parentLView && parentLView[RENDERER];
  ngDevMode && assertDefined(lView[RENDERER], "Renderer is required");
  lView[SANITIZER] = sanitizer || parentLView && parentLView[SANITIZER] || null;
  lView[INJECTOR$1] = injector || parentLView && parentLView[INJECTOR$1] || null;
  lView[T_HOST] = tHostNode;
  ngDevMode && assertEqual(tView.type == 2 ? parentLView !== null : true, true, "Embedded views must have parentLView");
  lView[DECLARATION_COMPONENT_VIEW] = tView.type == 2 ? parentLView[DECLARATION_COMPONENT_VIEW] : lView;
  ngDevMode && attachLViewDebug(lView);
  return lView;
}
function getOrCreateTNode(tView, index, type, name, attrs) {
  ngDevMode && index !== 0 && // 0 are bogus nodes and they are OK. See `createContainerRef` in
  // `view_engine_compatibility` for additional context.
  assertGreaterThanOrEqual(index, HEADER_OFFSET, "TNodes can't be in the LView header.");
  ngDevMode && assertPureTNodeType(type);
  let tNode = tView.data[index];
  if (tNode === null) {
    tNode = createTNodeAtIndex(tView, index, type, name, attrs);
    if (isInI18nBlock()) {
      tNode.flags |= 64;
    }
  } else if (tNode.type & 64) {
    tNode.type = type;
    tNode.value = name;
    tNode.attrs = attrs;
    const parent = getCurrentParentTNode();
    tNode.injectorIndex = parent === null ? -1 : parent.injectorIndex;
    ngDevMode && assertTNodeForTView(tNode, tView);
    ngDevMode && assertEqual(index, tNode.index, "Expecting same index");
  }
  setCurrentTNode(tNode, true);
  return tNode;
}
function createTNodeAtIndex(tView, index, type, name, attrs) {
  const currentTNode = getCurrentTNodePlaceholderOk();
  const isParent = isCurrentTNodeParent();
  const parent = isParent ? currentTNode : currentTNode && currentTNode.parent;
  const tNode = tView.data[index] = createTNode(tView, parent, type, index, name, attrs);
  if (tView.firstChild === null) {
    tView.firstChild = tNode;
  }
  if (currentTNode !== null) {
    if (isParent) {
      if (currentTNode.child == null && tNode.parent !== null) {
        currentTNode.child = tNode;
      }
    } else {
      if (currentTNode.next === null) {
        currentTNode.next = tNode;
      }
    }
  }
  return tNode;
}
function allocExpando(tView, lView, numSlotsToAlloc, initialValue) {
  if (numSlotsToAlloc === 0)
    return -1;
  if (ngDevMode) {
    assertFirstCreatePass(tView);
    assertSame(tView, lView[TVIEW], "`LView` must be associated with `TView`!");
    assertEqual(tView.data.length, lView.length, "Expecting LView to be same size as TView");
    assertEqual(tView.data.length, tView.blueprint.length, "Expecting Blueprint to be same size as TView");
    assertFirstUpdatePass(tView);
  }
  const allocIdx = lView.length;
  for (let i = 0; i < numSlotsToAlloc; i++) {
    lView.push(initialValue);
    tView.blueprint.push(initialValue);
    tView.data.push(null);
  }
  return allocIdx;
}
function renderView(tView, lView, context) {
  ngDevMode && assertEqual(isCreationMode(lView), true, "Should be run in creation mode");
  enterView(lView);
  try {
    const viewQuery = tView.viewQuery;
    if (viewQuery !== null) {
      executeViewQueryFn(1, viewQuery, context);
    }
    const templateFn = tView.template;
    if (templateFn !== null) {
      executeTemplate(tView, lView, templateFn, 1, context);
    }
    if (tView.firstCreatePass) {
      tView.firstCreatePass = false;
    }
    if (tView.staticContentQueries) {
      refreshContentQueries(tView, lView);
    }
    if (tView.staticViewQueries) {
      executeViewQueryFn(2, tView.viewQuery, context);
    }
    const components = tView.components;
    if (components !== null) {
      renderChildComponents(lView, components);
    }
  } catch (error) {
    if (tView.firstCreatePass) {
      tView.incompleteFirstPass = true;
      tView.firstCreatePass = false;
    }
    throw error;
  } finally {
    lView[FLAGS] &= -5;
    leaveView();
  }
}
function refreshView(tView, lView, templateFn, context) {
  ngDevMode && assertEqual(isCreationMode(lView), false, "Should be run in update mode");
  const flags = lView[FLAGS];
  if ((flags & 256) === 256)
    return;
  enterView(lView);
  const isInCheckNoChangesPass = ngDevMode && isInCheckNoChangesMode();
  try {
    resetPreOrderHookFlags(lView);
    setBindingIndex(tView.bindingStartIndex);
    if (templateFn !== null) {
      executeTemplate(tView, lView, templateFn, 2, context);
    }
    const hooksInitPhaseCompleted = (flags & 3) === 3;
    if (!isInCheckNoChangesPass) {
      if (hooksInitPhaseCompleted) {
        const preOrderCheckHooks = tView.preOrderCheckHooks;
        if (preOrderCheckHooks !== null) {
          executeCheckHooks(lView, preOrderCheckHooks, null);
        }
      } else {
        const preOrderHooks = tView.preOrderHooks;
        if (preOrderHooks !== null) {
          executeInitAndCheckHooks(lView, preOrderHooks, 0, null);
        }
        incrementInitPhaseFlags(
          lView,
          0
          /* OnInitHooksToBeRun */
        );
      }
    }
    markTransplantedViewsForRefresh(lView);
    refreshEmbeddedViews(lView);
    if (tView.contentQueries !== null) {
      refreshContentQueries(tView, lView);
    }
    if (!isInCheckNoChangesPass) {
      if (hooksInitPhaseCompleted) {
        const contentCheckHooks = tView.contentCheckHooks;
        if (contentCheckHooks !== null) {
          executeCheckHooks(lView, contentCheckHooks);
        }
      } else {
        const contentHooks = tView.contentHooks;
        if (contentHooks !== null) {
          executeInitAndCheckHooks(
            lView,
            contentHooks,
            1
            /* AfterContentInitHooksToBeRun */
          );
        }
        incrementInitPhaseFlags(
          lView,
          1
          /* AfterContentInitHooksToBeRun */
        );
      }
    }
    processHostBindingOpCodes(tView, lView);
    const components = tView.components;
    if (components !== null) {
      refreshChildComponents(lView, components);
    }
    const viewQuery = tView.viewQuery;
    if (viewQuery !== null) {
      executeViewQueryFn(2, viewQuery, context);
    }
    if (!isInCheckNoChangesPass) {
      if (hooksInitPhaseCompleted) {
        const viewCheckHooks = tView.viewCheckHooks;
        if (viewCheckHooks !== null) {
          executeCheckHooks(lView, viewCheckHooks);
        }
      } else {
        const viewHooks = tView.viewHooks;
        if (viewHooks !== null) {
          executeInitAndCheckHooks(
            lView,
            viewHooks,
            2
            /* AfterViewInitHooksToBeRun */
          );
        }
        incrementInitPhaseFlags(
          lView,
          2
          /* AfterViewInitHooksToBeRun */
        );
      }
    }
    if (tView.firstUpdatePass === true) {
      tView.firstUpdatePass = false;
    }
    if (!isInCheckNoChangesPass) {
      lView[FLAGS] &= ~(64 | 8);
    }
    if (lView[FLAGS] & 1024) {
      lView[FLAGS] &= ~1024;
      updateTransplantedViewCount(lView[PARENT], -1);
    }
  } finally {
    leaveView();
  }
}
function renderComponentOrTemplate(tView, lView, templateFn, context) {
  const rendererFactory = lView[RENDERER_FACTORY];
  const checkNoChangesMode = !!ngDevMode && isInCheckNoChangesMode();
  const creationModeIsActive = isCreationMode(lView);
  try {
    if (!checkNoChangesMode && !creationModeIsActive && rendererFactory.begin) {
      rendererFactory.begin();
    }
    if (creationModeIsActive) {
      renderView(tView, lView, context);
    }
    refreshView(tView, lView, templateFn, context);
  } finally {
    if (!checkNoChangesMode && !creationModeIsActive && rendererFactory.end) {
      rendererFactory.end();
    }
  }
}
function executeTemplate(tView, lView, templateFn, rf, context) {
  const prevSelectedIndex = getSelectedIndex();
  const isUpdatePhase = rf & 2;
  try {
    setSelectedIndex(-1);
    if (isUpdatePhase && lView.length > HEADER_OFFSET) {
      selectIndexInternal(tView, lView, HEADER_OFFSET, !!ngDevMode && isInCheckNoChangesMode());
    }
    const preHookType = isUpdatePhase ? 2 : 0;
    profiler(preHookType, context);
    templateFn(rf, context);
  } finally {
    setSelectedIndex(prevSelectedIndex);
    const postHookType = isUpdatePhase ? 3 : 1;
    profiler(postHookType, context);
  }
}
function executeContentQueries(tView, tNode, lView) {
  if (isContentQueryHost(tNode)) {
    const start = tNode.directiveStart;
    const end = tNode.directiveEnd;
    for (let directiveIndex = start; directiveIndex < end; directiveIndex++) {
      const def = tView.data[directiveIndex];
      if (def.contentQueries) {
        def.contentQueries(1, lView[directiveIndex], directiveIndex);
      }
    }
  }
}
function createDirectivesInstances(tView, lView, tNode) {
  if (!getBindingsEnabled())
    return;
  instantiateAllDirectives(tView, lView, tNode, getNativeByTNode(tNode, lView));
  if ((tNode.flags & 128) === 128) {
    invokeDirectivesHostBindings(tView, lView, tNode);
  }
}
function saveResolvedLocalsInData(viewData, tNode, localRefExtractor = getNativeByTNode) {
  const localNames = tNode.localNames;
  if (localNames !== null) {
    let localIndex = tNode.index + 1;
    for (let i = 0; i < localNames.length; i += 2) {
      const index = localNames[i + 1];
      const value = index === -1 ? localRefExtractor(tNode, viewData) : viewData[index];
      viewData[localIndex++] = value;
    }
  }
}
function getOrCreateTComponentView(def) {
  const tView = def.tView;
  if (tView === null || tView.incompleteFirstPass) {
    const declTNode = null;
    return def.tView = createTView(1, declTNode, def.template, def.decls, def.vars, def.directiveDefs, def.pipeDefs, def.viewQuery, def.schemas, def.consts);
  }
  return tView;
}
function createTView(type, declTNode, templateFn, decls, vars, directives, pipes, viewQuery, schemas, constsOrFactory) {
  ngDevMode && ngDevMode.tView++;
  const bindingStartIndex = HEADER_OFFSET + decls;
  const initialViewLength = bindingStartIndex + vars;
  const blueprint = createViewBlueprint(bindingStartIndex, initialViewLength);
  const consts = typeof constsOrFactory === "function" ? constsOrFactory() : constsOrFactory;
  const tView = blueprint[TVIEW] = ngDevMode ? new TViewConstructor(
    type,
    // type: TViewType,
    blueprint,
    // blueprint: LView,
    templateFn,
    // template: ComponentTemplate<{}>|null,
    null,
    // queries: TQueries|null
    viewQuery,
    // viewQuery: ViewQueriesFunction<{}>|null,
    declTNode,
    // declTNode: TNode|null,
    cloneToTViewData(blueprint).fill(null, bindingStartIndex),
    // data: TData,
    bindingStartIndex,
    // bindingStartIndex: number,
    initialViewLength,
    // expandoStartIndex: number,
    null,
    // hostBindingOpCodes: HostBindingOpCodes,
    true,
    // firstCreatePass: boolean,
    true,
    // firstUpdatePass: boolean,
    false,
    // staticViewQueries: boolean,
    false,
    // staticContentQueries: boolean,
    null,
    // preOrderHooks: HookData|null,
    null,
    // preOrderCheckHooks: HookData|null,
    null,
    // contentHooks: HookData|null,
    null,
    // contentCheckHooks: HookData|null,
    null,
    // viewHooks: HookData|null,
    null,
    // viewCheckHooks: HookData|null,
    null,
    // destroyHooks: DestroyHookData|null,
    null,
    // cleanup: any[]|null,
    null,
    // contentQueries: number[]|null,
    null,
    // components: number[]|null,
    typeof directives === "function" ? (
      //
      directives()
    ) : (
      //
      directives
    ),
    // directiveRegistry: DirectiveDefList|null,
    typeof pipes === "function" ? pipes() : pipes,
    // pipeRegistry: PipeDefList|null,
    null,
    // firstChild: TNode|null,
    schemas,
    // schemas: SchemaMetadata[]|null,
    consts,
    // consts: TConstants|null
    false,
    // incompleteFirstPass: boolean
    decls,
    // ngDevMode only: decls
    vars
  ) : {
    type,
    blueprint,
    template: templateFn,
    queries: null,
    viewQuery,
    declTNode,
    data: blueprint.slice().fill(null, bindingStartIndex),
    bindingStartIndex,
    expandoStartIndex: initialViewLength,
    hostBindingOpCodes: null,
    firstCreatePass: true,
    firstUpdatePass: true,
    staticViewQueries: false,
    staticContentQueries: false,
    preOrderHooks: null,
    preOrderCheckHooks: null,
    contentHooks: null,
    contentCheckHooks: null,
    viewHooks: null,
    viewCheckHooks: null,
    destroyHooks: null,
    cleanup: null,
    contentQueries: null,
    components: null,
    directiveRegistry: typeof directives === "function" ? directives() : directives,
    pipeRegistry: typeof pipes === "function" ? pipes() : pipes,
    firstChild: null,
    schemas,
    consts,
    incompleteFirstPass: false
  };
  if (ngDevMode) {
    Object.seal(tView);
  }
  return tView;
}
function createViewBlueprint(bindingStartIndex, initialViewLength) {
  const blueprint = ngDevMode ? new LViewBlueprint() : [];
  for (let i = 0; i < initialViewLength; i++) {
    blueprint.push(i < bindingStartIndex ? null : NO_CHANGE);
  }
  return blueprint;
}
function createError(text, token) {
  return new Error(`Renderer: ${text} [${stringifyForError(token)}]`);
}
function assertHostNodeExists(rElement, elementOrSelector) {
  if (!rElement) {
    if (typeof elementOrSelector === "string") {
      throw createError("Host node with selector not found:", elementOrSelector);
    } else {
      throw createError("Host node is required:", elementOrSelector);
    }
  }
}
function locateHostElement(renderer, elementOrSelector, encapsulation) {
  if (isProceduralRenderer(renderer)) {
    const preserveContent = encapsulation === ViewEncapsulation$1.ShadowDom;
    return renderer.selectRootElement(elementOrSelector, preserveContent);
  }
  let rElement = typeof elementOrSelector === "string" ? renderer.querySelector(elementOrSelector) : elementOrSelector;
  ngDevMode && assertHostNodeExists(rElement, elementOrSelector);
  rElement.textContent = "";
  return rElement;
}
function storeCleanupWithContext(tView, lView, context, cleanupFn) {
  const lCleanup = getOrCreateLViewCleanup(lView);
  if (context === null) {
    if (ngDevMode) {
      Object.freeze(getOrCreateTViewCleanup(tView));
    }
    lCleanup.push(cleanupFn);
  } else {
    lCleanup.push(context);
    if (tView.firstCreatePass) {
      getOrCreateTViewCleanup(tView).push(cleanupFn, lCleanup.length - 1);
    }
  }
}
function createTNode(tView, tParent, type, index, value, attrs) {
  ngDevMode && index !== 0 && // 0 are bogus nodes and they are OK. See `createContainerRef` in
  // `view_engine_compatibility` for additional context.
  assertGreaterThanOrEqual(index, HEADER_OFFSET, "TNodes can't be in the LView header.");
  ngDevMode && assertNotSame(attrs, void 0, "'undefined' is not valid value for 'attrs'");
  ngDevMode && ngDevMode.tNode++;
  ngDevMode && tParent && assertTNodeForTView(tParent, tView);
  let injectorIndex = tParent ? tParent.injectorIndex : -1;
  const tNode = ngDevMode ? new TNodeDebug(
    tView,
    // tView_: TView
    type,
    // type: TNodeType
    index,
    // index: number
    null,
    // insertBeforeIndex: null|-1|number|number[]
    injectorIndex,
    // injectorIndex: number
    -1,
    // directiveStart: number
    -1,
    // directiveEnd: number
    -1,
    // directiveStylingLast: number
    null,
    // propertyBindings: number[]|null
    0,
    // flags: TNodeFlags
    0,
    // providerIndexes: TNodeProviderIndexes
    value,
    // value: string|null
    attrs,
    // attrs: (string|AttributeMarker|(string|SelectorFlags)[])[]|null
    null,
    // mergedAttrs
    null,
    // localNames: (string|number)[]|null
    void 0,
    // initialInputs: (string[]|null)[]|null|undefined
    null,
    // inputs: PropertyAliases|null
    null,
    // outputs: PropertyAliases|null
    null,
    // tViews: ITView|ITView[]|null
    null,
    // next: ITNode|null
    null,
    // projectionNext: ITNode|null
    null,
    // child: ITNode|null
    tParent,
    // parent: TElementNode|TContainerNode|null
    null,
    // projection: number|(ITNode|RNode[])[]|null
    null,
    // styles: string|null
    null,
    // stylesWithoutHost: string|null
    void 0,
    // residualStyles: string|null
    null,
    // classes: string|null
    null,
    // classesWithoutHost: string|null
    void 0,
    // residualClasses: string|null
    0,
    // classBindings: TStylingRange;
    0
  ) : {
    type,
    index,
    insertBeforeIndex: null,
    injectorIndex,
    directiveStart: -1,
    directiveEnd: -1,
    directiveStylingLast: -1,
    propertyBindings: null,
    flags: 0,
    providerIndexes: 0,
    value,
    attrs,
    mergedAttrs: null,
    localNames: null,
    initialInputs: void 0,
    inputs: null,
    outputs: null,
    tViews: null,
    next: null,
    projectionNext: null,
    child: null,
    parent: tParent,
    projection: null,
    styles: null,
    stylesWithoutHost: null,
    residualStyles: void 0,
    classes: null,
    classesWithoutHost: null,
    residualClasses: void 0,
    classBindings: 0,
    styleBindings: 0
  };
  if (ngDevMode) {
    Object.seal(tNode);
  }
  return tNode;
}
function generatePropertyAliases(inputAliasMap, directiveDefIdx, propStore) {
  for (let publicName in inputAliasMap) {
    if (inputAliasMap.hasOwnProperty(publicName)) {
      propStore = propStore === null ? {} : propStore;
      const internalName = inputAliasMap[publicName];
      if (propStore.hasOwnProperty(publicName)) {
        propStore[publicName].push(directiveDefIdx, internalName);
      } else {
        propStore[publicName] = [directiveDefIdx, internalName];
      }
    }
  }
  return propStore;
}
function initializeInputAndOutputAliases(tView, tNode) {
  ngDevMode && assertFirstCreatePass(tView);
  const start = tNode.directiveStart;
  const end = tNode.directiveEnd;
  const tViewData = tView.data;
  const tNodeAttrs = tNode.attrs;
  const inputsFromAttrs = ngDevMode ? new TNodeInitialInputs() : [];
  let inputsStore = null;
  let outputsStore = null;
  for (let i = start; i < end; i++) {
    const directiveDef = tViewData[i];
    const directiveInputs = directiveDef.inputs;
    const initialInputs = tNodeAttrs !== null && !isInlineTemplate(tNode) ? generateInitialInputs(directiveInputs, tNodeAttrs) : null;
    inputsFromAttrs.push(initialInputs);
    inputsStore = generatePropertyAliases(directiveInputs, i, inputsStore);
    outputsStore = generatePropertyAliases(directiveDef.outputs, i, outputsStore);
  }
  if (inputsStore !== null) {
    if (inputsStore.hasOwnProperty("class")) {
      tNode.flags |= 16;
    }
    if (inputsStore.hasOwnProperty("style")) {
      tNode.flags |= 32;
    }
  }
  tNode.initialInputs = inputsFromAttrs;
  tNode.inputs = inputsStore;
  tNode.outputs = outputsStore;
}
function mapPropName(name) {
  if (name === "class")
    return "className";
  if (name === "for")
    return "htmlFor";
  if (name === "formaction")
    return "formAction";
  if (name === "innerHtml")
    return "innerHTML";
  if (name === "readonly")
    return "readOnly";
  if (name === "tabindex")
    return "tabIndex";
  return name;
}
function elementPropertyInternal(tView, tNode, lView, propName, value, renderer, sanitizer, nativeOnly) {
  ngDevMode && assertNotSame(value, NO_CHANGE, "Incoming value should never be NO_CHANGE.");
  const element = getNativeByTNode(tNode, lView);
  let inputData = tNode.inputs;
  let dataValue;
  if (!nativeOnly && inputData != null && (dataValue = inputData[propName])) {
    setInputsForProperty(tView, lView, dataValue, propName, value);
    if (isComponentHost(tNode))
      markDirtyIfOnPush(lView, tNode.index);
    if (ngDevMode) {
      setNgReflectProperties(lView, element, tNode.type, dataValue, value);
    }
  } else if (tNode.type & 3) {
    propName = mapPropName(propName);
    if (ngDevMode) {
      validateAgainstEventProperties(propName);
      if (!validateProperty(element, tNode.value, propName, tView.schemas)) {
        logUnknownPropertyError(propName, tNode.value);
        return;
      }
      ngDevMode.rendererSetProperty++;
    }
    value = sanitizer != null ? sanitizer(value, tNode.value || "", propName) : value;
    if (isProceduralRenderer(renderer)) {
      renderer.setProperty(element, propName, value);
    } else if (!isAnimationProp(propName)) {
      element.setProperty ? element.setProperty(propName, value) : element[propName] = value;
    }
  } else if (tNode.type & 12) {
    if (ngDevMode && !matchingSchemas(tView.schemas, tNode.value)) {
      logUnknownPropertyError(propName, tNode.value);
    }
  }
}
function markDirtyIfOnPush(lView, viewIndex) {
  ngDevMode && assertLView(lView);
  const childComponentLView = getComponentLViewByIndex(viewIndex, lView);
  if (!(childComponentLView[FLAGS] & 16)) {
    childComponentLView[FLAGS] |= 64;
  }
}
function setNgReflectProperty(lView, element, type, attrName, value) {
  const renderer = lView[RENDERER];
  attrName = normalizeDebugBindingName(attrName);
  const debugValue = normalizeDebugBindingValue(value);
  if (type & 3) {
    if (value == null) {
      isProceduralRenderer(renderer) ? renderer.removeAttribute(element, attrName) : element.removeAttribute(attrName);
    } else {
      isProceduralRenderer(renderer) ? renderer.setAttribute(element, attrName, debugValue) : element.setAttribute(attrName, debugValue);
    }
  } else {
    const textContent = escapeCommentText(`bindings=${JSON.stringify({ [attrName]: debugValue }, null, 2)}`);
    if (isProceduralRenderer(renderer)) {
      renderer.setValue(element, textContent);
    } else {
      element.textContent = textContent;
    }
  }
}
function setNgReflectProperties(lView, element, type, dataValue, value) {
  if (type & (3 | 4)) {
    for (let i = 0; i < dataValue.length; i += 2) {
      setNgReflectProperty(lView, element, type, dataValue[i + 1], value);
    }
  }
}
function validateProperty(element, tagName, propName, schemas) {
  if (schemas === null)
    return true;
  if (matchingSchemas(schemas, tagName) || propName in element || isAnimationProp(propName)) {
    return true;
  }
  return typeof Node === "undefined" || Node === null || !(element instanceof Node);
}
function matchingSchemas(schemas, tagName) {
  if (schemas !== null) {
    for (let i = 0; i < schemas.length; i++) {
      const schema = schemas[i];
      if (schema === NO_ERRORS_SCHEMA || schema === CUSTOM_ELEMENTS_SCHEMA && tagName && tagName.indexOf("-") > -1) {
        return true;
      }
    }
  }
  return false;
}
function logUnknownPropertyError(propName, tagName) {
  const message = `Can't bind to '${propName}' since it isn't a known property of '${tagName}'.`;
  console.error(formatRuntimeError(303, message));
}
function instantiateRootComponent(tView, lView, def) {
  const rootTNode = getCurrentTNode();
  if (tView.firstCreatePass) {
    if (def.providersResolver)
      def.providersResolver(def);
    const directiveIndex = allocExpando(tView, lView, 1, null);
    ngDevMode && assertEqual(directiveIndex, rootTNode.directiveStart, "Because this is a root component the allocated expando should match the TNode component.");
    configureViewWithDirective(tView, rootTNode, lView, directiveIndex, def);
  }
  const directive = getNodeInjectable(lView, tView, rootTNode.directiveStart, rootTNode);
  attachPatchData(directive, lView);
  const native = getNativeByTNode(rootTNode, lView);
  if (native) {
    attachPatchData(native, lView);
  }
  return directive;
}
function resolveDirectives(tView, lView, tNode, localRefs) {
  ngDevMode && assertFirstCreatePass(tView);
  let hasDirectives = false;
  if (getBindingsEnabled()) {
    const directiveDefs = findDirectiveDefMatches(tView, lView, tNode);
    const exportsMap = localRefs === null ? null : { "": -1 };
    if (directiveDefs !== null) {
      hasDirectives = true;
      initTNodeFlags(tNode, tView.data.length, directiveDefs.length);
      for (let i = 0; i < directiveDefs.length; i++) {
        const def = directiveDefs[i];
        if (def.providersResolver)
          def.providersResolver(def);
      }
      let preOrderHooksFound = false;
      let preOrderCheckHooksFound = false;
      let directiveIdx = allocExpando(tView, lView, directiveDefs.length, null);
      ngDevMode && assertSame(directiveIdx, tNode.directiveStart, "TNode.directiveStart should point to just allocated space");
      for (let i = 0; i < directiveDefs.length; i++) {
        const def = directiveDefs[i];
        tNode.mergedAttrs = mergeHostAttrs(tNode.mergedAttrs, def.hostAttrs);
        configureViewWithDirective(tView, tNode, lView, directiveIdx, def);
        saveNameToExportMap(directiveIdx, def, exportsMap);
        if (def.contentQueries !== null)
          tNode.flags |= 8;
        if (def.hostBindings !== null || def.hostAttrs !== null || def.hostVars !== 0)
          tNode.flags |= 128;
        const lifeCycleHooks = def.type.prototype;
        if (!preOrderHooksFound && (lifeCycleHooks.ngOnChanges || lifeCycleHooks.ngOnInit || lifeCycleHooks.ngDoCheck)) {
          (tView.preOrderHooks || (tView.preOrderHooks = [])).push(tNode.index);
          preOrderHooksFound = true;
        }
        if (!preOrderCheckHooksFound && (lifeCycleHooks.ngOnChanges || lifeCycleHooks.ngDoCheck)) {
          (tView.preOrderCheckHooks || (tView.preOrderCheckHooks = [])).push(tNode.index);
          preOrderCheckHooksFound = true;
        }
        directiveIdx++;
      }
      initializeInputAndOutputAliases(tView, tNode);
    }
    if (exportsMap)
      cacheMatchingLocalNames(tNode, localRefs, exportsMap);
  }
  tNode.mergedAttrs = mergeHostAttrs(tNode.mergedAttrs, tNode.attrs);
  return hasDirectives;
}
function registerHostBindingOpCodes(tView, tNode, lView, directiveIdx, directiveVarsIdx, def) {
  ngDevMode && assertFirstCreatePass(tView);
  const hostBindings = def.hostBindings;
  if (hostBindings) {
    let hostBindingOpCodes = tView.hostBindingOpCodes;
    if (hostBindingOpCodes === null) {
      hostBindingOpCodes = tView.hostBindingOpCodes = [];
    }
    const elementIndx = ~tNode.index;
    if (lastSelectedElementIdx(hostBindingOpCodes) != elementIndx) {
      hostBindingOpCodes.push(elementIndx);
    }
    hostBindingOpCodes.push(directiveIdx, directiveVarsIdx, hostBindings);
  }
}
function lastSelectedElementIdx(hostBindingOpCodes) {
  let i = hostBindingOpCodes.length;
  while (i > 0) {
    const value = hostBindingOpCodes[--i];
    if (typeof value === "number" && value < 0) {
      return value;
    }
  }
  return 0;
}
function instantiateAllDirectives(tView, lView, tNode, native) {
  const start = tNode.directiveStart;
  const end = tNode.directiveEnd;
  if (!tView.firstCreatePass) {
    getOrCreateNodeInjectorForNode(tNode, lView);
  }
  attachPatchData(native, lView);
  const initialInputs = tNode.initialInputs;
  for (let i = start; i < end; i++) {
    const def = tView.data[i];
    const isComponent = isComponentDef(def);
    if (isComponent) {
      ngDevMode && assertTNodeType(
        tNode,
        3
        /* AnyRNode */
      );
      addComponentLogic(lView, tNode, def);
    }
    const directive = getNodeInjectable(lView, tView, i, tNode);
    attachPatchData(directive, lView);
    if (initialInputs !== null) {
      setInputsFromAttrs(lView, i - start, directive, def, tNode, initialInputs);
    }
    if (isComponent) {
      const componentView = getComponentLViewByIndex(tNode.index, lView);
      componentView[CONTEXT] = directive;
    }
  }
}
function invokeDirectivesHostBindings(tView, lView, tNode) {
  const start = tNode.directiveStart;
  const end = tNode.directiveEnd;
  tView.firstCreatePass;
  const elementIndex = tNode.index;
  const currentDirectiveIndex = getCurrentDirectiveIndex();
  try {
    setSelectedIndex(elementIndex);
    for (let dirIndex = start; dirIndex < end; dirIndex++) {
      const def = tView.data[dirIndex];
      const directive = lView[dirIndex];
      setCurrentDirectiveIndex(dirIndex);
      if (def.hostBindings !== null || def.hostVars !== 0 || def.hostAttrs !== null) {
        invokeHostBindingsInCreationMode(def, directive);
      }
    }
  } finally {
    setSelectedIndex(-1);
    setCurrentDirectiveIndex(currentDirectiveIndex);
  }
}
function invokeHostBindingsInCreationMode(def, directive) {
  if (def.hostBindings !== null) {
    def.hostBindings(1, directive);
  }
}
function findDirectiveDefMatches(tView, viewData, tNode) {
  ngDevMode && assertFirstCreatePass(tView);
  ngDevMode && assertTNodeType(
    tNode,
    3 | 12
    /* AnyContainer */
  );
  const registry = tView.directiveRegistry;
  let matches = null;
  if (registry) {
    for (let i = 0; i < registry.length; i++) {
      const def = registry[i];
      if (isNodeMatchingSelectorList(
        tNode,
        def.selectors,
        /* isProjectionMode */
        false
      )) {
        matches || (matches = ngDevMode ? new MatchesArray() : []);
        diPublicInInjector(getOrCreateNodeInjectorForNode(tNode, viewData), tView, def.type);
        if (isComponentDef(def)) {
          if (ngDevMode) {
            assertTNodeType(tNode, 2, `"${tNode.value}" tags cannot be used as component hosts. Please use a different tag to activate the ${stringify(def.type)} component.`);
            if (tNode.flags & 2) {
              throwMultipleComponentError(tNode, matches[0].type, def.type);
            }
          }
          markAsComponentHost(tView, tNode);
          matches.unshift(def);
        } else {
          matches.push(def);
        }
      }
    }
  }
  return matches;
}
function markAsComponentHost(tView, hostTNode) {
  ngDevMode && assertFirstCreatePass(tView);
  hostTNode.flags |= 2;
  (tView.components || (tView.components = ngDevMode ? new TViewComponents() : [])).push(hostTNode.index);
}
function cacheMatchingLocalNames(tNode, localRefs, exportsMap) {
  if (localRefs) {
    const localNames = tNode.localNames = ngDevMode ? new TNodeLocalNames() : [];
    for (let i = 0; i < localRefs.length; i += 2) {
      const index = exportsMap[localRefs[i + 1]];
      if (index == null)
        throw new RuntimeError(-301, ngDevMode && `Export of name '${localRefs[i + 1]}' not found!`);
      localNames.push(localRefs[i], index);
    }
  }
}
function saveNameToExportMap(directiveIdx, def, exportsMap) {
  if (exportsMap) {
    if (def.exportAs) {
      for (let i = 0; i < def.exportAs.length; i++) {
        exportsMap[def.exportAs[i]] = directiveIdx;
      }
    }
    if (isComponentDef(def))
      exportsMap[""] = directiveIdx;
  }
}
function initTNodeFlags(tNode, index, numberOfDirectives) {
  ngDevMode && assertNotEqual(numberOfDirectives, tNode.directiveEnd - tNode.directiveStart, "Reached the max number of directives");
  tNode.flags |= 1;
  tNode.directiveStart = index;
  tNode.directiveEnd = index + numberOfDirectives;
  tNode.providerIndexes = index;
}
function configureViewWithDirective(tView, tNode, lView, directiveIndex, def) {
  ngDevMode && assertGreaterThanOrEqual(directiveIndex, HEADER_OFFSET, "Must be in Expando section");
  tView.data[directiveIndex] = def;
  const directiveFactory = def.factory || (def.factory = getFactoryDef(def.type, true));
  const nodeInjectorFactory = new NodeInjectorFactory(directiveFactory, isComponentDef(def), null);
  tView.blueprint[directiveIndex] = nodeInjectorFactory;
  lView[directiveIndex] = nodeInjectorFactory;
  registerHostBindingOpCodes(tView, tNode, lView, directiveIndex, allocExpando(tView, lView, def.hostVars, NO_CHANGE), def);
}
function addComponentLogic(lView, hostTNode, def) {
  const native = getNativeByTNode(hostTNode, lView);
  const tView = getOrCreateTComponentView(def);
  const rendererFactory = lView[RENDERER_FACTORY];
  const componentView = addToViewTree(lView, createLView(lView, tView, null, def.onPush ? 64 : 16, native, hostTNode, rendererFactory, rendererFactory.createRenderer(native, def), null, null));
  lView[hostTNode.index] = componentView;
}
function elementAttributeInternal(tNode, lView, name, value, sanitizer, namespace) {
  if (ngDevMode) {
    assertNotSame(value, NO_CHANGE, "Incoming value should never be NO_CHANGE.");
    validateAgainstEventAttributes(name);
    assertTNodeType(tNode, 2, `Attempted to set attribute \`${name}\` on a container node. Host bindings are not valid on ng-container or ng-template.`);
  }
  const element = getNativeByTNode(tNode, lView);
  setElementAttribute(lView[RENDERER], element, namespace, tNode.value, name, value, sanitizer);
}
function setElementAttribute(renderer, element, namespace, tagName, name, value, sanitizer) {
  if (value == null) {
    ngDevMode && ngDevMode.rendererRemoveAttribute++;
    isProceduralRenderer(renderer) ? renderer.removeAttribute(element, name, namespace) : element.removeAttribute(name);
  } else {
    ngDevMode && ngDevMode.rendererSetAttribute++;
    const strValue = sanitizer == null ? renderStringify(value) : sanitizer(value, tagName || "", name);
    if (isProceduralRenderer(renderer)) {
      renderer.setAttribute(element, name, strValue, namespace);
    } else {
      namespace ? element.setAttributeNS(namespace, name, strValue) : element.setAttribute(name, strValue);
    }
  }
}
function setInputsFromAttrs(lView, directiveIndex, instance, def, tNode, initialInputData) {
  const initialInputs = initialInputData[directiveIndex];
  if (initialInputs !== null) {
    const setInput = def.setInput;
    for (let i = 0; i < initialInputs.length; ) {
      const publicName = initialInputs[i++];
      const privateName = initialInputs[i++];
      const value = initialInputs[i++];
      if (setInput !== null) {
        def.setInput(instance, value, publicName, privateName);
      } else {
        instance[privateName] = value;
      }
      if (ngDevMode) {
        const nativeElement = getNativeByTNode(tNode, lView);
        setNgReflectProperty(lView, nativeElement, tNode.type, privateName, value);
      }
    }
  }
}
function generateInitialInputs(inputs, attrs) {
  let inputsToStore = null;
  let i = 0;
  while (i < attrs.length) {
    const attrName = attrs[i];
    if (attrName === 0) {
      i += 4;
      continue;
    } else if (attrName === 5) {
      i += 2;
      continue;
    }
    if (typeof attrName === "number")
      break;
    if (inputs.hasOwnProperty(attrName)) {
      if (inputsToStore === null)
        inputsToStore = [];
      inputsToStore.push(attrName, inputs[attrName], attrs[i + 1]);
    }
    i += 2;
  }
  return inputsToStore;
}
const LContainerArray = class LContainer extends Array {
};
function createLContainer(hostNative, currentView, native, tNode) {
  ngDevMode && assertLView(currentView);
  ngDevMode && !isProceduralRenderer(currentView[RENDERER]) && assertDomNode(native);
  const lContainer = new (ngDevMode ? LContainerArray : Array)(
    hostNative,
    // host native
    true,
    // Boolean `true` in this position signifies that this is an `LContainer`
    false,
    // has transplanted views
    currentView,
    // parent
    null,
    // next
    0,
    // transplanted views to refresh count
    tNode,
    // t_host
    native,
    // native,
    null,
    // view refs
    null
  );
  ngDevMode && assertEqual(lContainer.length, CONTAINER_HEADER_OFFSET, "Should allocate correct number of slots for LContainer header.");
  ngDevMode && attachLContainerDebug(lContainer);
  return lContainer;
}
function refreshEmbeddedViews(lView) {
  for (let lContainer = getFirstLContainer(lView); lContainer !== null; lContainer = getNextLContainer(lContainer)) {
    for (let i = CONTAINER_HEADER_OFFSET; i < lContainer.length; i++) {
      const embeddedLView = lContainer[i];
      const embeddedTView = embeddedLView[TVIEW];
      ngDevMode && assertDefined(embeddedTView, "TView must be allocated");
      if (viewAttachedToChangeDetector(embeddedLView)) {
        refreshView(embeddedTView, embeddedLView, embeddedTView.template, embeddedLView[CONTEXT]);
      }
    }
  }
}
function markTransplantedViewsForRefresh(lView) {
  for (let lContainer = getFirstLContainer(lView); lContainer !== null; lContainer = getNextLContainer(lContainer)) {
    if (!lContainer[HAS_TRANSPLANTED_VIEWS])
      continue;
    const movedViews = lContainer[MOVED_VIEWS];
    ngDevMode && assertDefined(movedViews, "Transplanted View flags set but missing MOVED_VIEWS");
    for (let i = 0; i < movedViews.length; i++) {
      const movedLView = movedViews[i];
      const insertionLContainer = movedLView[PARENT];
      ngDevMode && assertLContainer(insertionLContainer);
      if ((movedLView[FLAGS] & 1024) === 0) {
        updateTransplantedViewCount(insertionLContainer, 1);
      }
      movedLView[FLAGS] |= 1024;
    }
  }
}
function refreshComponent(hostLView, componentHostIdx) {
  ngDevMode && assertEqual(isCreationMode(hostLView), false, "Should be run in update mode");
  const componentView = getComponentLViewByIndex(componentHostIdx, hostLView);
  if (viewAttachedToChangeDetector(componentView)) {
    const tView = componentView[TVIEW];
    if (componentView[FLAGS] & (16 | 64)) {
      refreshView(tView, componentView, tView.template, componentView[CONTEXT]);
    } else if (componentView[TRANSPLANTED_VIEWS_TO_REFRESH] > 0) {
      refreshContainsDirtyView(componentView);
    }
  }
}
function refreshContainsDirtyView(lView) {
  for (let lContainer = getFirstLContainer(lView); lContainer !== null; lContainer = getNextLContainer(lContainer)) {
    for (let i = CONTAINER_HEADER_OFFSET; i < lContainer.length; i++) {
      const embeddedLView = lContainer[i];
      if (embeddedLView[FLAGS] & 1024) {
        const embeddedTView = embeddedLView[TVIEW];
        ngDevMode && assertDefined(embeddedTView, "TView must be allocated");
        refreshView(embeddedTView, embeddedLView, embeddedTView.template, embeddedLView[CONTEXT]);
      } else if (embeddedLView[TRANSPLANTED_VIEWS_TO_REFRESH] > 0) {
        refreshContainsDirtyView(embeddedLView);
      }
    }
  }
  const tView = lView[TVIEW];
  const components = tView.components;
  if (components !== null) {
    for (let i = 0; i < components.length; i++) {
      const componentView = getComponentLViewByIndex(components[i], lView);
      if (viewAttachedToChangeDetector(componentView) && componentView[TRANSPLANTED_VIEWS_TO_REFRESH] > 0) {
        refreshContainsDirtyView(componentView);
      }
    }
  }
}
function renderComponent$1(hostLView, componentHostIdx) {
  ngDevMode && assertEqual(isCreationMode(hostLView), true, "Should be run in creation mode");
  const componentView = getComponentLViewByIndex(componentHostIdx, hostLView);
  const componentTView = componentView[TVIEW];
  syncViewWithBlueprint(componentTView, componentView);
  renderView(componentTView, componentView, componentView[CONTEXT]);
}
function syncViewWithBlueprint(tView, lView) {
  for (let i = lView.length; i < tView.blueprint.length; i++) {
    lView.push(tView.blueprint[i]);
  }
}
function addToViewTree(lView, lViewOrLContainer) {
  if (lView[CHILD_HEAD]) {
    lView[CHILD_TAIL][NEXT] = lViewOrLContainer;
  } else {
    lView[CHILD_HEAD] = lViewOrLContainer;
  }
  lView[CHILD_TAIL] = lViewOrLContainer;
  return lViewOrLContainer;
}
function markViewDirty(lView) {
  while (lView) {
    lView[FLAGS] |= 64;
    const parent = getLViewParent(lView);
    if (isRootView(lView) && !parent) {
      return lView;
    }
    lView = parent;
  }
  return null;
}
function scheduleTick(rootContext, flags) {
  const nothingScheduled = rootContext.flags === 0;
  if (nothingScheduled && rootContext.clean == _CLEAN_PROMISE) {
    rootContext.flags |= flags;
    let res;
    rootContext.clean = new Promise((r) => res = r);
    rootContext.scheduler(() => {
      if (rootContext.flags & 1) {
        rootContext.flags &= -2;
        tickRootContext(rootContext);
      }
      if (rootContext.flags & 2) {
        rootContext.flags &= -3;
        const playerHandler = rootContext.playerHandler;
        if (playerHandler) {
          playerHandler.flushPlayers();
        }
      }
      rootContext.clean = _CLEAN_PROMISE;
      res(null);
    });
  }
}
function tickRootContext(rootContext) {
  for (let i = 0; i < rootContext.components.length; i++) {
    const rootComponent = rootContext.components[i];
    const lView = readPatchedLView(rootComponent);
    const tView = lView[TVIEW];
    renderComponentOrTemplate(tView, lView, tView.template, rootComponent);
  }
}
function detectChangesInternal(tView, lView, context) {
  const rendererFactory = lView[RENDERER_FACTORY];
  if (rendererFactory.begin)
    rendererFactory.begin();
  try {
    refreshView(tView, lView, tView.template, context);
  } catch (error) {
    handleError(lView, error);
    throw error;
  } finally {
    if (rendererFactory.end)
      rendererFactory.end();
  }
}
function detectChangesInRootView(lView) {
  tickRootContext(lView[CONTEXT]);
}
function checkNoChangesInternal(tView, view, context) {
  setIsInCheckNoChangesMode(true);
  try {
    detectChangesInternal(tView, view, context);
  } finally {
    setIsInCheckNoChangesMode(false);
  }
}
function checkNoChangesInRootView(lView) {
  setIsInCheckNoChangesMode(true);
  try {
    detectChangesInRootView(lView);
  } finally {
    setIsInCheckNoChangesMode(false);
  }
}
function executeViewQueryFn(flags, viewQueryFn, component) {
  ngDevMode && assertDefined(viewQueryFn, "View queries function to execute must be defined.");
  setCurrentQueryIndex(0);
  viewQueryFn(flags, component);
}
function storePropertyBindingMetadata(tData, tNode, propertyName, bindingIndex, ...interpolationParts) {
  if (tData[bindingIndex] === null) {
    if (tNode.inputs == null || !tNode.inputs[propertyName]) {
      const propBindingIdxs = tNode.propertyBindings || (tNode.propertyBindings = []);
      propBindingIdxs.push(bindingIndex);
      let bindingMetadata = propertyName;
      if (interpolationParts.length > 0) {
        bindingMetadata += INTERPOLATION_DELIMITER + interpolationParts.join(INTERPOLATION_DELIMITER);
      }
      tData[bindingIndex] = bindingMetadata;
    }
  }
}
const CLEAN_PROMISE = _CLEAN_PROMISE;
function getOrCreateLViewCleanup(view) {
  return view[CLEANUP] || (view[CLEANUP] = ngDevMode ? new LCleanup() : []);
}
function getOrCreateTViewCleanup(tView) {
  return tView.cleanup || (tView.cleanup = ngDevMode ? new TCleanup() : []);
}
function loadComponentRenderer(currentDef, tNode, lView) {
  if (currentDef === null || isComponentDef(currentDef)) {
    lView = unwrapLView(lView[tNode.index]);
  }
  return lView[RENDERER];
}
function handleError(lView, error) {
  const injector = lView[INJECTOR$1];
  const errorHandler2 = injector ? injector.get(ErrorHandler, null) : null;
  errorHandler2 && errorHandler2.handleError(error);
}
function setInputsForProperty(tView, lView, inputs, publicName, value) {
  for (let i = 0; i < inputs.length; ) {
    const index = inputs[i++];
    const privateName = inputs[i++];
    const instance = lView[index];
    ngDevMode && assertIndexInRange(lView, index);
    const def = tView.data[index];
    if (def.setInput !== null) {
      def.setInput(instance, value, publicName, privateName);
    } else {
      instance[privateName] = value;
    }
  }
}
function textBindingInternal(lView, index, value) {
  ngDevMode && assertString(value, "Value should be a string");
  ngDevMode && assertNotSame(value, NO_CHANGE, "value should not be NO_CHANGE");
  ngDevMode && assertIndexInRange(lView, index);
  const element = getNativeByIndex(index, lView);
  ngDevMode && assertDefined(element, "native element should exist");
  updateTextNode(lView[RENDERER], element, value);
}
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
function computeStaticStyling(tNode, attrs, writeToHost) {
  ngDevMode && assertFirstCreatePass(getTView(), "Expecting to be called in first template pass only");
  let styles = writeToHost ? tNode.styles : null;
  let classes = writeToHost ? tNode.classes : null;
  let mode = 0;
  if (attrs !== null) {
    for (let i = 0; i < attrs.length; i++) {
      const value = attrs[i];
      if (typeof value === "number") {
        mode = value;
      } else if (mode == 1) {
        classes = concatStringsWithSpace(classes, value);
      } else if (mode == 2) {
        const style = value;
        const styleValue = attrs[++i];
        styles = concatStringsWithSpace(styles, style + ": " + styleValue + ";");
      }
    }
  }
  writeToHost ? tNode.styles = styles : tNode.stylesWithoutHost = styles;
  writeToHost ? tNode.classes = classes : tNode.classesWithoutHost = classes;
}
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
function detectChanges(component) {
  const view = getComponentViewByInstance(component);
  detectChangesInternal(view[TVIEW], view, component);
}
function markDirty(component) {
  ngDevMode && assertDefined(component, "component");
  const rootView = markViewDirty(getComponentViewByInstance(component));
  ngDevMode && assertDefined(rootView[CONTEXT], "rootContext should be defined");
  scheduleTick(
    rootView[CONTEXT],
    1
    /* DetectChanges */
  );
}
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
const INJECTOR = new InjectionToken(
  "INJECTOR",
  // Dissable tslint because this is const enum which gets inlined not top level prop access.
  // tslint:disable-next-line: no-toplevel-property-access
  -1
  /* Injector */
);
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
class NullInjector {
  get(token, notFoundValue = THROW_IF_NOT_FOUND) {
    if (notFoundValue === THROW_IF_NOT_FOUND) {
      const error = new Error(`NullInjectorError: No provider for ${stringify(token)}!`);
      error.name = "NullInjectorError";
      throw error;
    }
    return notFoundValue;
  }
}
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
const INJECTOR_SCOPE = new InjectionToken("Set Injector scope.");
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
const NOT_YET = {};
const CIRCULAR = {};
let NULL_INJECTOR$1 = void 0;
function getNullInjector() {
  if (NULL_INJECTOR$1 === void 0) {
    NULL_INJECTOR$1 = new NullInjector();
  }
  return NULL_INJECTOR$1;
}
function createInjector(defType, parent = null, additionalProviders = null, name) {
  const injector = createInjectorWithoutInjectorInstances(defType, parent, additionalProviders, name);
  injector._resolveInjectorDefTypes();
  return injector;
}
function createInjectorWithoutInjectorInstances(defType, parent = null, additionalProviders = null, name) {
  return new R3Injector(defType, additionalProviders, parent || getNullInjector(), name);
}
class R3Injector {
  constructor(def, additionalProviders, parent, source = null) {
    this.parent = parent;
    this.records = /* @__PURE__ */ new Map();
    this.injectorDefTypes = /* @__PURE__ */ new Set();
    this.onDestroy = /* @__PURE__ */ new Set();
    this._destroyed = false;
    const dedupStack = [];
    additionalProviders && deepForEach$1(additionalProviders, (provider) => this.processProvider(provider, def, additionalProviders));
    deepForEach$1([def], (injectorDef) => this.processInjectorType(injectorDef, [], dedupStack));
    this.records.set(INJECTOR, makeRecord(void 0, this));
    const record = this.records.get(INJECTOR_SCOPE);
    this.scope = record != null ? record.value : null;
    this.source = source || (typeof def === "object" ? null : stringify(def));
  }
  /**
   * Flag indicating that this injector was previously destroyed.
   */
  get destroyed() {
    return this._destroyed;
  }
  /**
   * Destroy the injector and release references to every instance or provider associated with it.
   *
   * Also calls the `OnDestroy` lifecycle hooks of every instance that was created for which a
   * hook was found.
   */
  destroy() {
    this.assertNotDestroyed();
    this._destroyed = true;
    try {
      this.onDestroy.forEach((service) => service.ngOnDestroy());
    } finally {
      this.records.clear();
      this.onDestroy.clear();
      this.injectorDefTypes.clear();
    }
  }
  get(token, notFoundValue = THROW_IF_NOT_FOUND, flags = InjectFlags.Default) {
    this.assertNotDestroyed();
    const previousInjector = setCurrentInjector(this);
    const previousInjectImplementation = setInjectImplementation(void 0);
    try {
      if (!(flags & InjectFlags.SkipSelf)) {
        let record = this.records.get(token);
        if (record === void 0) {
          const def = couldBeInjectableType(token) && getInjectableDef(token);
          if (def && this.injectableDefInScope(def)) {
            record = makeRecord(injectableDefOrInjectorDefFactory(token), NOT_YET);
          } else {
            record = null;
          }
          this.records.set(token, record);
        }
        if (record != null) {
          return this.hydrate(token, record);
        }
      }
      const nextInjector = !(flags & InjectFlags.Self) ? this.parent : getNullInjector();
      notFoundValue = flags & InjectFlags.Optional && notFoundValue === THROW_IF_NOT_FOUND ? null : notFoundValue;
      return nextInjector.get(token, notFoundValue);
    } catch (e) {
      if (e.name === "NullInjectorError") {
        const path = e[NG_TEMP_TOKEN_PATH] = e[NG_TEMP_TOKEN_PATH] || [];
        path.unshift(stringify(token));
        if (previousInjector) {
          throw e;
        } else {
          return catchInjectorError(e, token, "R3InjectorError", this.source);
        }
      } else {
        throw e;
      }
    } finally {
      setInjectImplementation(previousInjectImplementation);
      setCurrentInjector(previousInjector);
    }
  }
  /** @internal */
  _resolveInjectorDefTypes() {
    this.injectorDefTypes.forEach((defType) => this.get(defType));
  }
  toString() {
    const tokens = [], records = this.records;
    records.forEach((v, token) => tokens.push(stringify(token)));
    return `R3Injector[${tokens.join(", ")}]`;
  }
  assertNotDestroyed() {
    if (this._destroyed) {
      throw new RuntimeError(205, ngDevMode && "Injector has already been destroyed.");
    }
  }
  /**
   * Add an `InjectorType` or `InjectorTypeWithProviders` and all of its transitive providers
   * to this injector.
   *
   * If an `InjectorTypeWithProviders` that declares providers besides the type is specified,
   * the function will return "true" to indicate that the providers of the type definition need
   * to be processed. This allows us to process providers of injector types after all imports of
   * an injector definition are processed. (following View Engine semantics: see FW-1349)
   */
  processInjectorType(defOrWrappedDef, parents, dedupStack) {
    defOrWrappedDef = resolveForwardRef(defOrWrappedDef);
    if (!defOrWrappedDef)
      return false;
    let def = getInjectorDef(defOrWrappedDef);
    const ngModule = def == null && defOrWrappedDef.ngModule || void 0;
    const defType = ngModule === void 0 ? defOrWrappedDef : ngModule;
    if (ngDevMode && parents.indexOf(defType) !== -1) {
      const defName = stringify(defType);
      const path = parents.map(stringify);
      throwCyclicDependencyError(defName, path);
    }
    const isDuplicate = dedupStack.indexOf(defType) !== -1;
    if (ngModule !== void 0) {
      def = getInjectorDef(ngModule);
    }
    if (def == null) {
      return false;
    }
    if (def.imports != null && !isDuplicate) {
      ngDevMode && parents.push(defType);
      dedupStack.push(defType);
      let importTypesWithProviders;
      try {
        deepForEach$1(def.imports, (imported) => {
          if (this.processInjectorType(imported, parents, dedupStack)) {
            if (importTypesWithProviders === void 0)
              importTypesWithProviders = [];
            importTypesWithProviders.push(imported);
          }
        });
      } finally {
        ngDevMode && parents.pop();
      }
      if (importTypesWithProviders !== void 0) {
        for (let i = 0; i < importTypesWithProviders.length; i++) {
          const { ngModule: ngModule2, providers } = importTypesWithProviders[i];
          deepForEach$1(providers, (provider) => this.processProvider(provider, ngModule2, providers || EMPTY_ARRAY));
        }
      }
    }
    this.injectorDefTypes.add(defType);
    const factory = getFactoryDef(defType) || (() => new defType());
    this.records.set(defType, makeRecord(factory, NOT_YET));
    const defProviders = def.providers;
    if (defProviders != null && !isDuplicate) {
      const injectorType = defOrWrappedDef;
      deepForEach$1(defProviders, (provider) => this.processProvider(provider, injectorType, defProviders));
    }
    return ngModule !== void 0 && defOrWrappedDef.providers !== void 0;
  }
  /**
   * Process a `SingleProvider` and add it.
   */
  processProvider(provider, ngModuleType, providers) {
    provider = resolveForwardRef(provider);
    let token = isTypeProvider(provider) ? provider : resolveForwardRef(provider && provider.provide);
    const record = providerToRecord(provider, ngModuleType, providers);
    if (!isTypeProvider(provider) && provider.multi === true) {
      let multiRecord = this.records.get(token);
      if (multiRecord) {
        if (ngDevMode && multiRecord.multi === void 0) {
          throwMixedMultiProviderError();
        }
      } else {
        multiRecord = makeRecord(void 0, NOT_YET, true);
        multiRecord.factory = () => injectArgs(multiRecord.multi);
        this.records.set(token, multiRecord);
      }
      token = provider;
      multiRecord.multi.push(provider);
    } else {
      const existing = this.records.get(token);
      if (ngDevMode && existing && existing.multi !== void 0) {
        throwMixedMultiProviderError();
      }
    }
    this.records.set(token, record);
  }
  hydrate(token, record) {
    if (ngDevMode && record.value === CIRCULAR) {
      throwCyclicDependencyError(stringify(token));
    } else if (record.value === NOT_YET) {
      record.value = CIRCULAR;
      record.value = record.factory();
    }
    if (typeof record.value === "object" && record.value && hasOnDestroy(record.value)) {
      this.onDestroy.add(record.value);
    }
    return record.value;
  }
  injectableDefInScope(def) {
    if (!def.providedIn) {
      return false;
    }
    const providedIn = resolveForwardRef(def.providedIn);
    if (typeof providedIn === "string") {
      return providedIn === "any" || providedIn === this.scope;
    } else {
      return this.injectorDefTypes.has(providedIn);
    }
  }
}
function injectableDefOrInjectorDefFactory(token) {
  const injectableDef = getInjectableDef(token);
  const factory = injectableDef !== null ? injectableDef.factory : getFactoryDef(token);
  if (factory !== null) {
    return factory;
  }
  if (token instanceof InjectionToken) {
    throw new RuntimeError(204, ngDevMode && `Token ${stringify(token)} is missing a ɵprov definition.`);
  }
  if (token instanceof Function) {
    return getUndecoratedInjectableFactory(token);
  }
  throw new RuntimeError(204, ngDevMode && "unreachable");
}
function getUndecoratedInjectableFactory(token) {
  const paramLength = token.length;
  if (paramLength > 0) {
    const args = newArray(paramLength, "?");
    throw new RuntimeError(204, ngDevMode && `Can't resolve all parameters for ${stringify(token)}: (${args.join(", ")}).`);
  }
  const inheritedInjectableDef = getInheritedInjectableDef(token);
  if (inheritedInjectableDef !== null) {
    return () => inheritedInjectableDef.factory(token);
  } else {
    return () => new token();
  }
}
function providerToRecord(provider, ngModuleType, providers) {
  if (isValueProvider(provider)) {
    return makeRecord(void 0, provider.useValue);
  } else {
    const factory = providerToFactory(provider, ngModuleType, providers);
    return makeRecord(factory, NOT_YET);
  }
}
function providerToFactory(provider, ngModuleType, providers) {
  let factory = void 0;
  if (isTypeProvider(provider)) {
    const unwrappedProvider = resolveForwardRef(provider);
    return getFactoryDef(unwrappedProvider) || injectableDefOrInjectorDefFactory(unwrappedProvider);
  } else {
    if (isValueProvider(provider)) {
      factory = () => resolveForwardRef(provider.useValue);
    } else if (isFactoryProvider(provider)) {
      factory = () => provider.useFactory(...injectArgs(provider.deps || []));
    } else if (isExistingProvider(provider)) {
      factory = () => ɵɵinject(resolveForwardRef(provider.useExisting));
    } else {
      const classRef = resolveForwardRef(provider && (provider.useClass || provider.provide));
      if (ngDevMode && !classRef) {
        throwInvalidProviderError(ngModuleType, providers, provider);
      }
      if (hasDeps(provider)) {
        factory = () => new classRef(...injectArgs(provider.deps));
      } else {
        return getFactoryDef(classRef) || injectableDefOrInjectorDefFactory(classRef);
      }
    }
  }
  return factory;
}
function makeRecord(factory, value, multi = false) {
  return {
    factory,
    value,
    multi: multi ? [] : void 0
  };
}
function isValueProvider(value) {
  return value !== null && typeof value == "object" && USE_VALUE$1 in value;
}
function isExistingProvider(value) {
  return !!(value && value.useExisting);
}
function isFactoryProvider(value) {
  return !!(value && value.useFactory);
}
function isTypeProvider(value) {
  return typeof value === "function";
}
function isClassProvider(value) {
  return !!value.useClass;
}
function hasDeps(value) {
  return !!value.deps;
}
function hasOnDestroy(value) {
  return value !== null && typeof value === "object" && typeof value.ngOnDestroy === "function";
}
function couldBeInjectableType(value) {
  return typeof value === "function" || typeof value === "object" && value instanceof InjectionToken;
}
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
class Injector {
  static create(options, parent) {
    if (Array.isArray(options)) {
      return createInjector({ name: "" }, parent, options, "");
    } else {
      const name = options.name ?? "";
      return createInjector({ name }, options.parent, options.providers, name);
    }
  }
}
Injector.THROW_IF_NOT_FOUND = THROW_IF_NOT_FOUND;
Injector.NULL = /* @__PURE__ */ new NullInjector();
Injector.ɵprov = ɵɵdefineInjectable({
  token: Injector,
  providedIn: "any",
  factory: () => ɵɵinject(INJECTOR)
});
Injector.__NG_ELEMENT_ID__ = -1;
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
function getComponent$1(element) {
  assertDomElement(element);
  const context = getLContext(element);
  if (context === null)
    return null;
  if (context.component === void 0) {
    context.component = getComponentAtNodeIndex(context.nodeIndex, context.lView);
  }
  return context.component;
}
function getContext(element) {
  assertDomElement(element);
  const context = getLContext(element);
  return context === null ? null : context.lView[CONTEXT];
}
function getOwningComponent(elementOrDir) {
  const context = getLContext(elementOrDir);
  if (context === null)
    return null;
  let lView = context.lView;
  let parent;
  ngDevMode && assertLView(lView);
  while (lView[TVIEW].type === 2 && (parent = getLViewParent(lView))) {
    lView = parent;
  }
  return lView[FLAGS] & 512 ? null : lView[CONTEXT];
}
function getRootComponents(elementOrDir) {
  return [...getRootContext(elementOrDir).components];
}
function getInjector(elementOrDir) {
  const context = getLContext(elementOrDir);
  if (context === null)
    return Injector.NULL;
  const tNode = context.lView[TVIEW].data[context.nodeIndex];
  return new NodeInjector(tNode, context.lView);
}
function getInjectionTokens(element) {
  const context = getLContext(element);
  if (context === null)
    return [];
  const lView = context.lView;
  const tView = lView[TVIEW];
  const tNode = tView.data[context.nodeIndex];
  const providerTokens = [];
  const startIndex = tNode.providerIndexes & 1048575;
  const endIndex = tNode.directiveEnd;
  for (let i = startIndex; i < endIndex; i++) {
    let value = tView.data[i];
    if (isDirectiveDefHack(value)) {
      value = value.type;
    }
    providerTokens.push(value);
  }
  return providerTokens;
}
function getDirectives(node) {
  if (node instanceof Text) {
    return [];
  }
  const context = getLContext(node);
  if (context === null) {
    return [];
  }
  const lView = context.lView;
  const tView = lView[TVIEW];
  const nodeIndex = context.nodeIndex;
  if (!tView?.data[nodeIndex]) {
    return [];
  }
  if (context.directives === void 0) {
    context.directives = getDirectivesAtNodeIndex(nodeIndex, lView);
  }
  return context.directives === null ? [] : [...context.directives];
}
function getDirectiveMetadata$1(directiveOrComponentInstance) {
  const { constructor } = directiveOrComponentInstance;
  if (!constructor) {
    throw new Error("Unable to find the instance constructor");
  }
  const componentDef = getComponentDef(constructor);
  if (componentDef) {
    return {
      inputs: componentDef.inputs,
      outputs: componentDef.outputs,
      encapsulation: componentDef.encapsulation,
      changeDetection: componentDef.onPush ? ChangeDetectionStrategy.OnPush : ChangeDetectionStrategy.Default
    };
  }
  const directiveDef = getDirectiveDef(constructor);
  if (directiveDef) {
    return { inputs: directiveDef.inputs, outputs: directiveDef.outputs };
  }
  return null;
}
function getLocalRefs(target) {
  const context = getLContext(target);
  if (context === null)
    return {};
  if (context.localRefs === void 0) {
    context.localRefs = discoverLocalRefs(context.lView, context.nodeIndex);
  }
  return context.localRefs || {};
}
function getHostElement(componentOrDirective) {
  return getLContext(componentOrDirective).native;
}
function getListeners(element) {
  assertDomElement(element);
  const lContext = getLContext(element);
  if (lContext === null)
    return [];
  const lView = lContext.lView;
  const tView = lView[TVIEW];
  const lCleanup = lView[CLEANUP];
  const tCleanup = tView.cleanup;
  const listeners = [];
  if (tCleanup && lCleanup) {
    for (let i = 0; i < tCleanup.length; ) {
      const firstParam = tCleanup[i++];
      const secondParam = tCleanup[i++];
      if (typeof firstParam === "string") {
        const name = firstParam;
        const listenerElement = unwrapRNode(lView[secondParam]);
        const callback = lCleanup[tCleanup[i++]];
        const useCaptureOrIndx = tCleanup[i++];
        const type = typeof useCaptureOrIndx === "boolean" || useCaptureOrIndx >= 0 ? "dom" : "output";
        const useCapture = typeof useCaptureOrIndx === "boolean" ? useCaptureOrIndx : false;
        if (element == listenerElement) {
          listeners.push({ element, name, callback, useCapture, type });
        }
      }
    }
  }
  listeners.sort(sortListeners);
  return listeners;
}
function sortListeners(a, b) {
  if (a.name == b.name)
    return 0;
  return a.name < b.name ? -1 : 1;
}
function isDirectiveDefHack(obj) {
  return obj.type !== void 0 && obj.template !== void 0 && obj.declaredInputs !== void 0;
}
function assertDomElement(value) {
  if (typeof Element !== "undefined" && !(value instanceof Element)) {
    throw new Error("Expecting instance of DOM Element");
  }
}
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
function applyChanges(component) {
  markDirty(component);
  getRootComponents(component).forEach((rootComponent) => detectChanges(rootComponent));
}
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
const GLOBAL_PUBLISH_EXPANDO_KEY = "ng";
let _published = false;
function publishDefaultGlobalUtils$1() {
  if (!_published) {
    _published = true;
    publishGlobalUtil("ɵsetProfiler", setProfiler);
    publishGlobalUtil("getDirectiveMetadata", getDirectiveMetadata$1);
    publishGlobalUtil("getComponent", getComponent$1);
    publishGlobalUtil("getContext", getContext);
    publishGlobalUtil("getListeners", getListeners);
    publishGlobalUtil("getOwningComponent", getOwningComponent);
    publishGlobalUtil("getHostElement", getHostElement);
    publishGlobalUtil("getInjector", getInjector);
    publishGlobalUtil("getRootComponents", getRootComponents);
    publishGlobalUtil("getDirectives", getDirectives);
    publishGlobalUtil("applyChanges", applyChanges);
  }
}
function publishGlobalUtil(name, fn) {
  if (typeof COMPILED === "undefined" || !COMPILED) {
    const w = _global;
    ngDevMode && assertDefined(fn, "function not defined");
    if (w) {
      let container = w[GLOBAL_PUBLISH_EXPANDO_KEY];
      if (!container) {
        container = w[GLOBAL_PUBLISH_EXPANDO_KEY] = {};
      }
      container[name] = fn;
    }
  }
}
function renderComponent(componentType, opts = {}) {
  ngDevMode && publishDefaultGlobalUtils$1();
  ngDevMode && assertComponentType(componentType);
  const rendererFactory = opts.rendererFactory || domRendererFactory3;
  const sanitizer = opts.sanitizer || null;
  const componentDef = getComponentDef(componentType);
  if (componentDef.type != componentType)
    componentDef.type = componentType;
  const componentTag = componentDef.selectors[0][0];
  const hostRenderer = rendererFactory.createRenderer(null, null);
  const hostRNode = locateHostElement(hostRenderer, opts.host || componentTag, componentDef.encapsulation);
  const rootFlags = componentDef.onPush ? 64 | 512 : 16 | 512;
  const rootContext = createRootContext(opts.scheduler, opts.playerHandler);
  const renderer = rendererFactory.createRenderer(hostRNode, componentDef);
  const rootTView = createTView(0, null, null, 1, 0, null, null, null, null, null);
  const rootView = createLView(null, rootTView, rootContext, rootFlags, null, null, rendererFactory, renderer, null, opts.injector || null);
  enterView(rootView);
  let component;
  try {
    if (rendererFactory.begin)
      rendererFactory.begin();
    const componentView = createRootComponentView(hostRNode, componentDef, rootView, rendererFactory, renderer, sanitizer);
    component = createRootComponent(componentView, componentDef, rootView, rootContext, opts.hostFeatures || null);
    renderView(rootTView, rootView, null);
    refreshView(rootTView, rootView, null, null);
  } finally {
    leaveView();
    if (rendererFactory.end)
      rendererFactory.end();
  }
  return component;
}
function createRootComponentView(rNode, def, rootView, rendererFactory, hostRenderer, sanitizer) {
  const tView = rootView[TVIEW];
  const index = HEADER_OFFSET;
  ngDevMode && assertIndexInRange(rootView, index);
  rootView[index] = rNode;
  const tNode = getOrCreateTNode(tView, index, 2, "#host", null);
  const mergedAttrs = tNode.mergedAttrs = def.hostAttrs;
  if (mergedAttrs !== null) {
    computeStaticStyling(tNode, mergedAttrs, true);
    if (rNode !== null) {
      setUpAttributes(hostRenderer, rNode, mergedAttrs);
      if (tNode.classes !== null) {
        writeDirectClass(hostRenderer, rNode, tNode.classes);
      }
      if (tNode.styles !== null) {
        writeDirectStyle(hostRenderer, rNode, tNode.styles);
      }
    }
  }
  const viewRenderer = rendererFactory.createRenderer(rNode, def);
  const componentView = createLView(rootView, getOrCreateTComponentView(def), null, def.onPush ? 64 : 16, rootView[index], tNode, rendererFactory, viewRenderer, sanitizer || null, null);
  if (tView.firstCreatePass) {
    diPublicInInjector(getOrCreateNodeInjectorForNode(tNode, rootView), tView, def.type);
    markAsComponentHost(tView, tNode);
    initTNodeFlags(tNode, rootView.length, 1);
  }
  addToViewTree(rootView, componentView);
  return rootView[index] = componentView;
}
function createRootComponent(componentView, componentDef, rootLView, rootContext, hostFeatures) {
  const tView = rootLView[TVIEW];
  const component = instantiateRootComponent(tView, rootLView, componentDef);
  rootContext.components.push(component);
  componentView[CONTEXT] = component;
  hostFeatures && hostFeatures.forEach((feature) => feature(component, componentDef));
  if (componentDef.contentQueries) {
    const tNode = getCurrentTNode();
    ngDevMode && assertDefined(tNode, "TNode expected");
    componentDef.contentQueries(1, component, tNode.directiveStart);
  }
  const rootTNode = getCurrentTNode();
  ngDevMode && assertDefined(rootTNode, "tNode should have been already created");
  if (tView.firstCreatePass && (componentDef.hostBindings !== null || componentDef.hostAttrs !== null)) {
    setSelectedIndex(rootTNode.index);
    const rootTView = rootLView[TVIEW];
    registerHostBindingOpCodes(rootTView, rootTNode, rootLView, rootTNode.directiveStart, rootTNode.directiveEnd, componentDef);
    invokeHostBindingsInCreationMode(componentDef, component);
  }
  return component;
}
function createRootContext(scheduler, playerHandler) {
  return {
    components: [],
    scheduler: scheduler || defaultScheduler,
    clean: CLEAN_PROMISE,
    playerHandler: playerHandler || null,
    flags: 0
    /* Empty */
  };
}
function LifecycleHooksFeature(component, def) {
  const lView = readPatchedLView(component);
  ngDevMode && assertDefined(lView, "LView is required");
  const tView = lView[TVIEW];
  const tNode = getCurrentTNode();
  ngDevMode && assertDefined(tNode, "TNode is required");
  registerPostOrderHooks(tView, tNode);
}
function whenRendered(component) {
  return getRootContext(component).clean;
}
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
function getSuperType(type) {
  return Object.getPrototypeOf(type.prototype).constructor;
}
function ɵɵInheritDefinitionFeature(definition) {
  let superType = getSuperType(definition.type);
  let shouldInheritFields = true;
  const inheritanceChain = [definition];
  while (superType) {
    let superDef = void 0;
    if (isComponentDef(definition)) {
      superDef = superType.ɵcmp || superType.ɵdir;
    } else {
      if (superType.ɵcmp) {
        const errorMessage = typeof ngDevMode === "undefined" || ngDevMode ? `Directives cannot inherit Components. Directive ${stringifyForError(definition.type)} is attempting to extend component ${stringifyForError(superType)}` : "";
        throw new RuntimeError(903, errorMessage);
      }
      superDef = superType.ɵdir;
    }
    if (superDef) {
      if (shouldInheritFields) {
        inheritanceChain.push(superDef);
        const writeableDef = definition;
        writeableDef.inputs = maybeUnwrapEmpty(definition.inputs);
        writeableDef.declaredInputs = maybeUnwrapEmpty(definition.declaredInputs);
        writeableDef.outputs = maybeUnwrapEmpty(definition.outputs);
        const superHostBindings = superDef.hostBindings;
        superHostBindings && inheritHostBindings(definition, superHostBindings);
        const superViewQuery = superDef.viewQuery;
        const superContentQueries = superDef.contentQueries;
        superViewQuery && inheritViewQuery(definition, superViewQuery);
        superContentQueries && inheritContentQueries(definition, superContentQueries);
        fillProperties(definition.inputs, superDef.inputs);
        fillProperties(definition.declaredInputs, superDef.declaredInputs);
        fillProperties(definition.outputs, superDef.outputs);
        if (isComponentDef(superDef) && superDef.data.animation) {
          const defData = definition.data;
          defData.animation = (defData.animation || []).concat(superDef.data.animation);
        }
      }
      const features = superDef.features;
      if (features) {
        for (let i = 0; i < features.length; i++) {
          const feature = features[i];
          if (feature && feature.ngInherit) {
            feature(definition);
          }
          if (feature === ɵɵInheritDefinitionFeature) {
            shouldInheritFields = false;
          }
        }
      }
    }
    superType = Object.getPrototypeOf(superType);
  }
  mergeHostAttrsAcrossInheritance(inheritanceChain);
}
function mergeHostAttrsAcrossInheritance(inheritanceChain) {
  let hostVars = 0;
  let hostAttrs = null;
  for (let i = inheritanceChain.length - 1; i >= 0; i--) {
    const def = inheritanceChain[i];
    def.hostVars = hostVars += def.hostVars;
    def.hostAttrs = mergeHostAttrs(def.hostAttrs, hostAttrs = mergeHostAttrs(hostAttrs, def.hostAttrs));
  }
}
function maybeUnwrapEmpty(value) {
  if (value === EMPTY_OBJ) {
    return {};
  } else if (value === EMPTY_ARRAY) {
    return [];
  } else {
    return value;
  }
}
function inheritViewQuery(definition, superViewQuery) {
  const prevViewQuery = definition.viewQuery;
  if (prevViewQuery) {
    definition.viewQuery = (rf, ctx) => {
      superViewQuery(rf, ctx);
      prevViewQuery(rf, ctx);
    };
  } else {
    definition.viewQuery = superViewQuery;
  }
}
function inheritContentQueries(definition, superContentQueries) {
  const prevContentQueries = definition.contentQueries;
  if (prevContentQueries) {
    definition.contentQueries = (rf, ctx, directiveIndex) => {
      superContentQueries(rf, ctx, directiveIndex);
      prevContentQueries(rf, ctx, directiveIndex);
    };
  } else {
    definition.contentQueries = superContentQueries;
  }
}
function inheritHostBindings(definition, superHostBindings) {
  const prevHostBindings = definition.hostBindings;
  if (prevHostBindings) {
    definition.hostBindings = (rf, ctx) => {
      superHostBindings(rf, ctx);
      prevHostBindings(rf, ctx);
    };
  } else {
    definition.hostBindings = superHostBindings;
  }
}
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
const COPY_DIRECTIVE_FIELDS = [
  // The child class should use the providers of its parent.
  "providersResolver"
  // Not listed here are any fields which are handled by the `ɵɵInheritDefinitionFeature`, such
  // as inputs, outputs, and host binding functions.
];
const COPY_COMPONENT_FIELDS = [
  // The child class should use the template function of its parent, including all template
  // semantics.
  "template",
  "decls",
  "consts",
  "vars",
  "onPush",
  "ngContentSelectors",
  // The child class should use the CSS styles of its parent, including all styling semantics.
  "styles",
  "encapsulation",
  // The child class should be checked by the runtime in the same way as its parent.
  "schemas"
];
function ɵɵCopyDefinitionFeature(definition) {
  let superType = getSuperType(definition.type);
  let superDef = void 0;
  if (isComponentDef(definition)) {
    superDef = superType.ɵcmp;
  } else {
    superDef = superType.ɵdir;
  }
  const defAny = definition;
  for (const field of COPY_DIRECTIVE_FIELDS) {
    defAny[field] = superDef[field];
  }
  if (isComponentDef(superDef)) {
    for (const field of COPY_COMPONENT_FIELDS) {
      defAny[field] = superDef[field];
    }
  }
}
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
let _symbolIterator = null;
function getSymbolIterator() {
  if (!_symbolIterator) {
    const Symbol2 = _global["Symbol"];
    if (Symbol2 && Symbol2.iterator) {
      _symbolIterator = Symbol2.iterator;
    } else {
      const keys = Object.getOwnPropertyNames(Map.prototype);
      for (let i = 0; i < keys.length; ++i) {
        const key = keys[i];
        if (key !== "entries" && key !== "size" && Map.prototype[key] === Map.prototype["entries"]) {
          _symbolIterator = key;
        }
      }
    }
  }
  return _symbolIterator;
}
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
function devModeEqual(a, b) {
  const isListLikeIterableA = isListLikeIterable(a);
  const isListLikeIterableB = isListLikeIterable(b);
  if (isListLikeIterableA && isListLikeIterableB) {
    return areIterablesEqual(a, b, devModeEqual);
  } else {
    const isAObject = a && (typeof a === "object" || typeof a === "function");
    const isBObject = b && (typeof b === "object" || typeof b === "function");
    if (!isListLikeIterableA && isAObject && !isListLikeIterableB && isBObject) {
      return true;
    } else {
      return Object.is(a, b);
    }
  }
}
function isListLikeIterable(obj) {
  if (!isJsObject(obj))
    return false;
  return Array.isArray(obj) || !(obj instanceof Map) && // JS Map are iterables but return entries as [k, v]
  getSymbolIterator() in obj;
}
function areIterablesEqual(a, b, comparator) {
  const iterator1 = a[getSymbolIterator()]();
  const iterator2 = b[getSymbolIterator()]();
  while (true) {
    const item1 = iterator1.next();
    const item2 = iterator2.next();
    if (item1.done && item2.done)
      return true;
    if (item1.done || item2.done)
      return false;
    if (!comparator(item1.value, item2.value))
      return false;
  }
}
function iterateListLike(obj, fn) {
  if (Array.isArray(obj)) {
    for (let i = 0; i < obj.length; i++) {
      fn(obj[i]);
    }
  } else {
    const iterator2 = obj[getSymbolIterator()]();
    let item;
    while (!(item = iterator2.next()).done) {
      fn(item.value);
    }
  }
}
function isJsObject(o) {
  return o !== null && (typeof o === "function" || typeof o === "object");
}
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
function updateBinding(lView, bindingIndex, value) {
  return lView[bindingIndex] = value;
}
function getBinding(lView, bindingIndex) {
  ngDevMode && assertIndexInRange(lView, bindingIndex);
  ngDevMode && assertNotSame(lView[bindingIndex], NO_CHANGE, "Stored value should never be NO_CHANGE.");
  return lView[bindingIndex];
}
function bindingUpdated(lView, bindingIndex, value) {
  ngDevMode && assertNotSame(value, NO_CHANGE, "Incoming value should never be NO_CHANGE.");
  ngDevMode && assertLessThan(bindingIndex, lView.length, `Slot should have been initialized to NO_CHANGE`);
  const oldValue = lView[bindingIndex];
  if (Object.is(oldValue, value)) {
    return false;
  } else {
    if (ngDevMode && isInCheckNoChangesMode()) {
      const oldValueToCompare = oldValue !== NO_CHANGE ? oldValue : void 0;
      if (!devModeEqual(oldValueToCompare, value)) {
        const details = getExpressionChangedErrorDetails(lView, bindingIndex, oldValueToCompare, value);
        throwErrorIfNoChangesMode(oldValue === NO_CHANGE, details.oldValue, details.newValue, details.propName);
      }
      return false;
    }
    lView[bindingIndex] = value;
    return true;
  }
}
function bindingUpdated2(lView, bindingIndex, exp1, exp2) {
  const different = bindingUpdated(lView, bindingIndex, exp1);
  return bindingUpdated(lView, bindingIndex + 1, exp2) || different;
}
function bindingUpdated3(lView, bindingIndex, exp1, exp2, exp3) {
  const different = bindingUpdated2(lView, bindingIndex, exp1, exp2);
  return bindingUpdated(lView, bindingIndex + 2, exp3) || different;
}
function bindingUpdated4(lView, bindingIndex, exp1, exp2, exp3, exp4) {
  const different = bindingUpdated2(lView, bindingIndex, exp1, exp2);
  return bindingUpdated2(lView, bindingIndex + 2, exp3, exp4) || different;
}
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
function ɵɵattribute(name, value, sanitizer, namespace) {
  const lView = getLView();
  const bindingIndex = nextBindingIndex();
  if (bindingUpdated(lView, bindingIndex, value)) {
    const tView = getTView();
    const tNode = getSelectedTNode();
    elementAttributeInternal(tNode, lView, name, value, sanitizer, namespace);
    ngDevMode && storePropertyBindingMetadata(tView.data, tNode, "attr." + name, bindingIndex);
  }
  return ɵɵattribute;
}
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
function interpolationV(lView, values) {
  ngDevMode && assertLessThan(2, values.length, "should have at least 3 values");
  ngDevMode && assertEqual(values.length % 2, 1, "should have an odd number of values");
  let isBindingUpdated = false;
  let bindingIndex = getBindingIndex();
  for (let i = 1; i < values.length; i += 2) {
    isBindingUpdated = bindingUpdated(lView, bindingIndex++, values[i]) || isBindingUpdated;
  }
  setBindingIndex(bindingIndex);
  if (!isBindingUpdated) {
    return NO_CHANGE;
  }
  let content = values[0];
  for (let i = 1; i < values.length; i += 2) {
    content += renderStringify(values[i]) + values[i + 1];
  }
  return content;
}
function interpolation1(lView, prefix, v0, suffix) {
  const different = bindingUpdated(lView, nextBindingIndex(), v0);
  return different ? prefix + renderStringify(v0) + suffix : NO_CHANGE;
}
function interpolation2(lView, prefix, v0, i02, v1, suffix) {
  const bindingIndex = getBindingIndex();
  const different = bindingUpdated2(lView, bindingIndex, v0, v1);
  incrementBindingIndex(2);
  return different ? prefix + renderStringify(v0) + i02 + renderStringify(v1) + suffix : NO_CHANGE;
}
function interpolation3(lView, prefix, v0, i02, v1, i1, v2, suffix) {
  const bindingIndex = getBindingIndex();
  const different = bindingUpdated3(lView, bindingIndex, v0, v1, v2);
  incrementBindingIndex(3);
  return different ? prefix + renderStringify(v0) + i02 + renderStringify(v1) + i1 + renderStringify(v2) + suffix : NO_CHANGE;
}
function interpolation4(lView, prefix, v0, i02, v1, i1, v2, i2, v3, suffix) {
  const bindingIndex = getBindingIndex();
  const different = bindingUpdated4(lView, bindingIndex, v0, v1, v2, v3);
  incrementBindingIndex(4);
  return different ? prefix + renderStringify(v0) + i02 + renderStringify(v1) + i1 + renderStringify(v2) + i2 + renderStringify(v3) + suffix : NO_CHANGE;
}
function interpolation5(lView, prefix, v0, i02, v1, i1, v2, i2, v3, i3, v4, suffix) {
  const bindingIndex = getBindingIndex();
  let different = bindingUpdated4(lView, bindingIndex, v0, v1, v2, v3);
  different = bindingUpdated(lView, bindingIndex + 4, v4) || different;
  incrementBindingIndex(5);
  return different ? prefix + renderStringify(v0) + i02 + renderStringify(v1) + i1 + renderStringify(v2) + i2 + renderStringify(v3) + i3 + renderStringify(v4) + suffix : NO_CHANGE;
}
function interpolation6(lView, prefix, v0, i02, v1, i1, v2, i2, v3, i3, v4, i4, v5, suffix) {
  const bindingIndex = getBindingIndex();
  let different = bindingUpdated4(lView, bindingIndex, v0, v1, v2, v3);
  different = bindingUpdated2(lView, bindingIndex + 4, v4, v5) || different;
  incrementBindingIndex(6);
  return different ? prefix + renderStringify(v0) + i02 + renderStringify(v1) + i1 + renderStringify(v2) + i2 + renderStringify(v3) + i3 + renderStringify(v4) + i4 + renderStringify(v5) + suffix : NO_CHANGE;
}
function interpolation7(lView, prefix, v0, i02, v1, i1, v2, i2, v3, i3, v4, i4, v5, i5, v6, suffix) {
  const bindingIndex = getBindingIndex();
  let different = bindingUpdated4(lView, bindingIndex, v0, v1, v2, v3);
  different = bindingUpdated3(lView, bindingIndex + 4, v4, v5, v6) || different;
  incrementBindingIndex(7);
  return different ? prefix + renderStringify(v0) + i02 + renderStringify(v1) + i1 + renderStringify(v2) + i2 + renderStringify(v3) + i3 + renderStringify(v4) + i4 + renderStringify(v5) + i5 + renderStringify(v6) + suffix : NO_CHANGE;
}
function interpolation8(lView, prefix, v0, i02, v1, i1, v2, i2, v3, i3, v4, i4, v5, i5, v6, i6, v7, suffix) {
  const bindingIndex = getBindingIndex();
  let different = bindingUpdated4(lView, bindingIndex, v0, v1, v2, v3);
  different = bindingUpdated4(lView, bindingIndex + 4, v4, v5, v6, v7) || different;
  incrementBindingIndex(8);
  return different ? prefix + renderStringify(v0) + i02 + renderStringify(v1) + i1 + renderStringify(v2) + i2 + renderStringify(v3) + i3 + renderStringify(v4) + i4 + renderStringify(v5) + i5 + renderStringify(v6) + i6 + renderStringify(v7) + suffix : NO_CHANGE;
}
function ɵɵattributeInterpolate1(attrName, prefix, v0, suffix, sanitizer, namespace) {
  const lView = getLView();
  const interpolatedValue = interpolation1(lView, prefix, v0, suffix);
  if (interpolatedValue !== NO_CHANGE) {
    const tNode = getSelectedTNode();
    elementAttributeInternal(tNode, lView, attrName, interpolatedValue, sanitizer, namespace);
    ngDevMode && storePropertyBindingMetadata(getTView().data, tNode, "attr." + attrName, getBindingIndex() - 1, prefix, suffix);
  }
  return ɵɵattributeInterpolate1;
}
function ɵɵattributeInterpolate2(attrName, prefix, v0, i02, v1, suffix, sanitizer, namespace) {
  const lView = getLView();
  const interpolatedValue = interpolation2(lView, prefix, v0, i02, v1, suffix);
  if (interpolatedValue !== NO_CHANGE) {
    const tNode = getSelectedTNode();
    elementAttributeInternal(tNode, lView, attrName, interpolatedValue, sanitizer, namespace);
    ngDevMode && storePropertyBindingMetadata(getTView().data, tNode, "attr." + attrName, getBindingIndex() - 2, prefix, i02, suffix);
  }
  return ɵɵattributeInterpolate2;
}
function ɵɵattributeInterpolate3(attrName, prefix, v0, i02, v1, i1, v2, suffix, sanitizer, namespace) {
  const lView = getLView();
  const interpolatedValue = interpolation3(lView, prefix, v0, i02, v1, i1, v2, suffix);
  if (interpolatedValue !== NO_CHANGE) {
    const tNode = getSelectedTNode();
    elementAttributeInternal(tNode, lView, attrName, interpolatedValue, sanitizer, namespace);
    ngDevMode && storePropertyBindingMetadata(getTView().data, tNode, "attr." + attrName, getBindingIndex() - 3, prefix, i02, i1, suffix);
  }
  return ɵɵattributeInterpolate3;
}
function ɵɵattributeInterpolate4(attrName, prefix, v0, i02, v1, i1, v2, i2, v3, suffix, sanitizer, namespace) {
  const lView = getLView();
  const interpolatedValue = interpolation4(lView, prefix, v0, i02, v1, i1, v2, i2, v3, suffix);
  if (interpolatedValue !== NO_CHANGE) {
    const tNode = getSelectedTNode();
    elementAttributeInternal(tNode, lView, attrName, interpolatedValue, sanitizer, namespace);
    ngDevMode && storePropertyBindingMetadata(getTView().data, tNode, "attr." + attrName, getBindingIndex() - 4, prefix, i02, i1, i2, suffix);
  }
  return ɵɵattributeInterpolate4;
}
function ɵɵattributeInterpolate5(attrName, prefix, v0, i02, v1, i1, v2, i2, v3, i3, v4, suffix, sanitizer, namespace) {
  const lView = getLView();
  const interpolatedValue = interpolation5(lView, prefix, v0, i02, v1, i1, v2, i2, v3, i3, v4, suffix);
  if (interpolatedValue !== NO_CHANGE) {
    const tNode = getSelectedTNode();
    elementAttributeInternal(tNode, lView, attrName, interpolatedValue, sanitizer, namespace);
    ngDevMode && storePropertyBindingMetadata(getTView().data, tNode, "attr." + attrName, getBindingIndex() - 5, prefix, i02, i1, i2, i3, suffix);
  }
  return ɵɵattributeInterpolate5;
}
function ɵɵattributeInterpolate6(attrName, prefix, v0, i02, v1, i1, v2, i2, v3, i3, v4, i4, v5, suffix, sanitizer, namespace) {
  const lView = getLView();
  const interpolatedValue = interpolation6(lView, prefix, v0, i02, v1, i1, v2, i2, v3, i3, v4, i4, v5, suffix);
  if (interpolatedValue !== NO_CHANGE) {
    const tNode = getSelectedTNode();
    elementAttributeInternal(tNode, lView, attrName, interpolatedValue, sanitizer, namespace);
    ngDevMode && storePropertyBindingMetadata(getTView().data, tNode, "attr." + attrName, getBindingIndex() - 6, prefix, i02, i1, i2, i3, i4, suffix);
  }
  return ɵɵattributeInterpolate6;
}
function ɵɵattributeInterpolate7(attrName, prefix, v0, i02, v1, i1, v2, i2, v3, i3, v4, i4, v5, i5, v6, suffix, sanitizer, namespace) {
  const lView = getLView();
  const interpolatedValue = interpolation7(lView, prefix, v0, i02, v1, i1, v2, i2, v3, i3, v4, i4, v5, i5, v6, suffix);
  if (interpolatedValue !== NO_CHANGE) {
    const tNode = getSelectedTNode();
    elementAttributeInternal(tNode, lView, attrName, interpolatedValue, sanitizer, namespace);
    ngDevMode && storePropertyBindingMetadata(getTView().data, tNode, "attr." + attrName, getBindingIndex() - 7, prefix, i02, i1, i2, i3, i4, i5, suffix);
  }
  return ɵɵattributeInterpolate7;
}
function ɵɵattributeInterpolate8(attrName, prefix, v0, i02, v1, i1, v2, i2, v3, i3, v4, i4, v5, i5, v6, i6, v7, suffix, sanitizer, namespace) {
  const lView = getLView();
  const interpolatedValue = interpolation8(lView, prefix, v0, i02, v1, i1, v2, i2, v3, i3, v4, i4, v5, i5, v6, i6, v7, suffix);
  if (interpolatedValue !== NO_CHANGE) {
    const tNode = getSelectedTNode();
    elementAttributeInternal(tNode, lView, attrName, interpolatedValue, sanitizer, namespace);
    ngDevMode && storePropertyBindingMetadata(getTView().data, tNode, "attr." + attrName, getBindingIndex() - 8, prefix, i02, i1, i2, i3, i4, i5, i6, suffix);
  }
  return ɵɵattributeInterpolate8;
}
function ɵɵattributeInterpolateV(attrName, values, sanitizer, namespace) {
  const lView = getLView();
  const interpolated = interpolationV(lView, values);
  if (interpolated !== NO_CHANGE) {
    const tNode = getSelectedTNode();
    elementAttributeInternal(tNode, lView, attrName, interpolated, sanitizer, namespace);
    if (ngDevMode) {
      const interpolationInBetween = [values[0]];
      for (let i = 2; i < values.length; i += 2) {
        interpolationInBetween.push(values[i]);
      }
      storePropertyBindingMetadata(getTView().data, tNode, "attr." + attrName, getBindingIndex() - interpolationInBetween.length + 1, ...interpolationInBetween);
    }
  }
  return ɵɵattributeInterpolateV;
}
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
function templateFirstCreatePass(index, tView, lView, templateFn, decls, vars, tagName, attrsIndex, localRefsIndex) {
  ngDevMode && assertFirstCreatePass(tView);
  ngDevMode && ngDevMode.firstCreatePass++;
  const tViewConsts = tView.consts;
  const tNode = getOrCreateTNode(tView, index, 4, tagName || null, getConstant(tViewConsts, attrsIndex));
  resolveDirectives(tView, lView, tNode, getConstant(tViewConsts, localRefsIndex));
  registerPostOrderHooks(tView, tNode);
  const embeddedTView = tNode.tViews = createTView(2, tNode, templateFn, decls, vars, tView.directiveRegistry, tView.pipeRegistry, null, tView.schemas, tViewConsts);
  if (tView.queries !== null) {
    tView.queries.template(tView, tNode);
    embeddedTView.queries = tView.queries.embeddedTView(tNode);
  }
  return tNode;
}
function ɵɵtemplate(index, templateFn, decls, vars, tagName, attrsIndex, localRefsIndex, localRefExtractor) {
  const lView = getLView();
  const tView = getTView();
  const adjustedIndex = index + HEADER_OFFSET;
  const tNode = tView.firstCreatePass ? templateFirstCreatePass(adjustedIndex, tView, lView, templateFn, decls, vars, tagName, attrsIndex, localRefsIndex) : tView.data[adjustedIndex];
  setCurrentTNode(tNode, false);
  const comment = lView[RENDERER].createComment(ngDevMode ? "container" : "");
  appendChild(tView, lView, comment, tNode);
  attachPatchData(comment, lView);
  addToViewTree(lView, lView[adjustedIndex] = createLContainer(comment, lView, comment, tNode));
  if (isDirectiveHost(tNode)) {
    createDirectivesInstances(tView, lView, tNode);
  }
  if (localRefsIndex != null) {
    saveResolvedLocalsInData(lView, tNode, localRefExtractor);
  }
}
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
function store(tView, lView, index, value) {
  if (index >= tView.data.length) {
    tView.data[index] = null;
    tView.blueprint[index] = null;
  }
  lView[index] = value;
}
function ɵɵreference(index) {
  const contextLView = getContextLView();
  return load(contextLView, HEADER_OFFSET + index);
}
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
const angularCoreDiEnv = {
  "ɵɵdefineInjectable": ɵɵdefineInjectable,
  "ɵɵdefineInjector": ɵɵdefineInjector,
  "ɵɵinject": ɵɵinject,
  "ɵɵinvalidFactoryDep": ɵɵinvalidFactoryDep,
  "resolveForwardRef": resolveForwardRef
};
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
function compileInjectable(type, meta) {
  let ngInjectableDef = null;
  let ngFactoryDef = null;
  if (!type.hasOwnProperty(NG_PROV_DEF)) {
    Object.defineProperty(type, NG_PROV_DEF, {
      get: () => {
        if (ngInjectableDef === null) {
          const compiler = getCompilerFacade({ usage: 0, kind: "injectable", type });
          ngInjectableDef = compiler.compileInjectable(angularCoreDiEnv, `ng:///${type.name}/ɵprov.js`, getInjectableMetadata(type, meta));
        }
        return ngInjectableDef;
      }
    });
  }
  if (!type.hasOwnProperty(NG_FACTORY_DEF)) {
    Object.defineProperty(type, NG_FACTORY_DEF, {
      get: () => {
        if (ngFactoryDef === null) {
          const compiler = getCompilerFacade({ usage: 0, kind: "injectable", type });
          ngFactoryDef = compiler.compileFactory(angularCoreDiEnv, `ng:///${type.name}/ɵfac.js`, {
            name: type.name,
            type,
            typeArgumentCount: 0,
            deps: reflectDependencies(type),
            target: compiler.FactoryTarget.Injectable
          });
        }
        return ngFactoryDef;
      },
      // Leave this configurable so that the factories from directives or pipes can take precedence.
      configurable: true
    });
  }
}
const USE_VALUE = getClosureSafeProperty({ provide: String, useValue: getClosureSafeProperty });
function isUseClassProvider(meta) {
  return meta.useClass !== void 0;
}
function isUseValueProvider(meta) {
  return USE_VALUE in meta;
}
function isUseFactoryProvider(meta) {
  return meta.useFactory !== void 0;
}
function isUseExistingProvider(meta) {
  return meta.useExisting !== void 0;
}
function getInjectableMetadata(type, srcMeta) {
  const meta = srcMeta || { providedIn: null };
  const compilerMeta = {
    name: type.name,
    type,
    typeArgumentCount: 0,
    providedIn: meta.providedIn
  };
  if ((isUseClassProvider(meta) || isUseFactoryProvider(meta)) && meta.deps !== void 0) {
    compilerMeta.deps = convertDependencies(meta.deps);
  }
  if (isUseClassProvider(meta)) {
    compilerMeta.useClass = meta.useClass;
  } else if (isUseValueProvider(meta)) {
    compilerMeta.useValue = meta.useValue;
  } else if (isUseFactoryProvider(meta)) {
    compilerMeta.useFactory = meta.useFactory;
  } else if (isUseExistingProvider(meta)) {
    compilerMeta.useExisting = meta.useExisting;
  }
  return compilerMeta;
}
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
const Injectable = makeDecorator("Injectable", void 0, void 0, void 0, (type, meta) => compileInjectable(type, meta));
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
function findFirstClosedCycle(keys) {
  const res = [];
  for (let i = 0; i < keys.length; ++i) {
    if (res.indexOf(keys[i]) > -1) {
      res.push(keys[i]);
      return res;
    }
    res.push(keys[i]);
  }
  return res;
}
function constructResolvingPath(keys) {
  if (keys.length > 1) {
    const reversed = findFirstClosedCycle(keys.slice().reverse());
    const tokenStrs = reversed.map((k) => stringify(k.token));
    return " (" + tokenStrs.join(" -> ") + ")";
  }
  return "";
}
function injectionError(injector, key, constructResolvingMessage, originalError) {
  const keys = [key];
  const errMsg = constructResolvingMessage(keys);
  const error = originalError ? wrappedError(errMsg, originalError) : Error(errMsg);
  error.addKey = addKey;
  error.keys = keys;
  error.injectors = [injector];
  error.constructResolvingMessage = constructResolvingMessage;
  error[ERROR_ORIGINAL_ERROR] = originalError;
  return error;
}
function addKey(injector, key) {
  this.injectors.push(injector);
  this.keys.push(key);
  this.message = this.constructResolvingMessage(this.keys);
}
function noProviderError(injector, key) {
  return injectionError(injector, key, function(keys) {
    const first2 = stringify(keys[0].token);
    return `No provider for ${first2}!${constructResolvingPath(keys)}`;
  });
}
function cyclicDependencyError(injector, key) {
  return injectionError(injector, key, function(keys) {
    return `Cannot instantiate cyclic dependency!${constructResolvingPath(keys)}`;
  });
}
function instantiationError(injector, originalException, originalStack, key) {
  return injectionError(injector, key, function(keys) {
    const first2 = stringify(keys[0].token);
    return `${originalException.message}: Error during instantiation of ${first2}!${constructResolvingPath(keys)}.`;
  }, originalException);
}
function invalidProviderError(provider) {
  return Error(`Invalid provider - only instances of Provider and Type are allowed, got: ${provider}`);
}
function noAnnotationError(typeOrFunc, params) {
  const signature = [];
  for (let i = 0, ii = params.length; i < ii; i++) {
    const parameter = params[i];
    if (!parameter || parameter.length == 0) {
      signature.push("?");
    } else {
      signature.push(parameter.map(stringify).join(" "));
    }
  }
  return Error("Cannot resolve all parameters for '" + stringify(typeOrFunc) + "'(" + signature.join(", ") + "). Make sure that all the parameters are decorated with Inject or have valid type annotations and that '" + stringify(typeOrFunc) + "' is decorated with Injectable.");
}
function outOfBoundsError(index) {
  return Error(`Index ${index} is out-of-bounds.`);
}
function mixingMultiProvidersWithRegularProvidersError(provider1, provider2) {
  return Error(`Cannot mix multi providers and regular providers, got: ${provider1} ${provider2}`);
}
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
class ReflectiveKey {
  /**
   * Private
   */
  constructor(token, id) {
    this.token = token;
    this.id = id;
    if (!token) {
      throw new Error("Token must be defined!");
    }
    this.displayName = stringify(this.token);
  }
  /**
   * Retrieves a `Key` for a token.
   */
  static get(token) {
    return _globalKeyRegistry.get(resolveForwardRef(token));
  }
  /**
   * @returns the number of keys registered in the system.
   */
  static get numberOfKeys() {
    return _globalKeyRegistry.numberOfKeys;
  }
}
class KeyRegistry {
  constructor() {
    this._allKeys = /* @__PURE__ */ new Map();
  }
  get(token) {
    if (token instanceof ReflectiveKey)
      return token;
    if (this._allKeys.has(token)) {
      return this._allKeys.get(token);
    }
    const newKey = new ReflectiveKey(token, ReflectiveKey.numberOfKeys);
    this._allKeys.set(token, newKey);
    return newKey;
  }
  get numberOfKeys() {
    return this._allKeys.size;
  }
}
const _globalKeyRegistry = new KeyRegistry();
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
class Reflector {
  constructor(reflectionCapabilities) {
    this.reflectionCapabilities = reflectionCapabilities;
  }
  updateCapabilities(caps) {
    this.reflectionCapabilities = caps;
  }
  factory(type) {
    return this.reflectionCapabilities.factory(type);
  }
  parameters(typeOrFunc) {
    return this.reflectionCapabilities.parameters(typeOrFunc);
  }
  annotations(typeOrFunc) {
    return this.reflectionCapabilities.annotations(typeOrFunc);
  }
  propMetadata(typeOrFunc) {
    return this.reflectionCapabilities.propMetadata(typeOrFunc);
  }
  hasLifecycleHook(type, lcProperty) {
    return this.reflectionCapabilities.hasLifecycleHook(type, lcProperty);
  }
  getter(name) {
    return this.reflectionCapabilities.getter(name);
  }
  setter(name) {
    return this.reflectionCapabilities.setter(name);
  }
  method(name) {
    return this.reflectionCapabilities.method(name);
  }
  importUri(type) {
    return this.reflectionCapabilities.importUri(type);
  }
  resourceUri(type) {
    return this.reflectionCapabilities.resourceUri(type);
  }
  resolveIdentifier(name, moduleUrl, members, runtime) {
    return this.reflectionCapabilities.resolveIdentifier(name, moduleUrl, members, runtime);
  }
  resolveEnum(identifier, name) {
    return this.reflectionCapabilities.resolveEnum(identifier, name);
  }
}
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
const reflector = new Reflector(new ReflectionCapabilities());
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
class ReflectiveDependency {
  constructor(key, optional, visibility) {
    this.key = key;
    this.optional = optional;
    this.visibility = visibility;
  }
  static fromKey(key) {
    return new ReflectiveDependency(key, false, null);
  }
}
const _EMPTY_LIST = [];
class ResolvedReflectiveProvider_ {
  constructor(key, resolvedFactories, multiProvider) {
    this.key = key;
    this.resolvedFactories = resolvedFactories;
    this.multiProvider = multiProvider;
    this.resolvedFactory = this.resolvedFactories[0];
  }
}
class ResolvedReflectiveFactory {
  constructor(factory, dependencies) {
    this.factory = factory;
    this.dependencies = dependencies;
  }
}
function resolveReflectiveFactory(provider) {
  let factoryFn;
  let resolvedDeps;
  if (provider.useClass) {
    const useClass = resolveForwardRef(provider.useClass);
    factoryFn = reflector.factory(useClass);
    resolvedDeps = _dependenciesFor(useClass);
  } else if (provider.useExisting) {
    factoryFn = (aliasInstance) => aliasInstance;
    resolvedDeps = [ReflectiveDependency.fromKey(ReflectiveKey.get(provider.useExisting))];
  } else if (provider.useFactory) {
    factoryFn = provider.useFactory;
    resolvedDeps = constructDependencies(provider.useFactory, provider.deps);
  } else {
    factoryFn = () => provider.useValue;
    resolvedDeps = _EMPTY_LIST;
  }
  return new ResolvedReflectiveFactory(factoryFn, resolvedDeps);
}
function resolveReflectiveProvider(provider) {
  return new ResolvedReflectiveProvider_(ReflectiveKey.get(provider.provide), [resolveReflectiveFactory(provider)], provider.multi || false);
}
function resolveReflectiveProviders(providers) {
  const normalized = _normalizeProviders(providers, []);
  const resolved = normalized.map(resolveReflectiveProvider);
  const resolvedProviderMap = mergeResolvedReflectiveProviders(resolved, /* @__PURE__ */ new Map());
  return Array.from(resolvedProviderMap.values());
}
function mergeResolvedReflectiveProviders(providers, normalizedProvidersMap) {
  for (let i = 0; i < providers.length; i++) {
    const provider = providers[i];
    const existing = normalizedProvidersMap.get(provider.key.id);
    if (existing) {
      if (provider.multiProvider !== existing.multiProvider) {
        throw mixingMultiProvidersWithRegularProvidersError(existing, provider);
      }
      if (provider.multiProvider) {
        for (let j = 0; j < provider.resolvedFactories.length; j++) {
          existing.resolvedFactories.push(provider.resolvedFactories[j]);
        }
      } else {
        normalizedProvidersMap.set(provider.key.id, provider);
      }
    } else {
      let resolvedProvider;
      if (provider.multiProvider) {
        resolvedProvider = new ResolvedReflectiveProvider_(provider.key, provider.resolvedFactories.slice(), provider.multiProvider);
      } else {
        resolvedProvider = provider;
      }
      normalizedProvidersMap.set(provider.key.id, resolvedProvider);
    }
  }
  return normalizedProvidersMap;
}
function _normalizeProviders(providers, res) {
  providers.forEach((b) => {
    if (b instanceof Type) {
      res.push({ provide: b, useClass: b });
    } else if (b && typeof b == "object" && b.provide !== void 0) {
      res.push(b);
    } else if (Array.isArray(b)) {
      _normalizeProviders(b, res);
    } else {
      throw invalidProviderError(b);
    }
  });
  return res;
}
function constructDependencies(typeOrFunc, dependencies) {
  if (!dependencies) {
    return _dependenciesFor(typeOrFunc);
  } else {
    const params = dependencies.map((t) => [t]);
    return dependencies.map((t) => _extractToken(typeOrFunc, t, params));
  }
}
function _dependenciesFor(typeOrFunc) {
  const params = reflector.parameters(typeOrFunc);
  if (!params)
    return [];
  if (params.some((p) => p == null)) {
    throw noAnnotationError(typeOrFunc, params);
  }
  return params.map((p) => _extractToken(typeOrFunc, p, params));
}
function _extractToken(typeOrFunc, metadata, params) {
  let token = null;
  let optional = false;
  if (!Array.isArray(metadata)) {
    if (metadata instanceof Inject) {
      return _createDependency(metadata.token, optional, null);
    } else {
      return _createDependency(metadata, optional, null);
    }
  }
  let visibility = null;
  for (let i = 0; i < metadata.length; ++i) {
    const paramMetadata = metadata[i];
    if (paramMetadata instanceof Type) {
      token = paramMetadata;
    } else if (paramMetadata instanceof Inject) {
      token = paramMetadata.token;
    } else if (paramMetadata instanceof Optional) {
      optional = true;
    } else if (paramMetadata instanceof Self || paramMetadata instanceof SkipSelf) {
      visibility = paramMetadata;
    } else if (paramMetadata instanceof InjectionToken) {
      token = paramMetadata;
    }
  }
  token = resolveForwardRef(token);
  if (token != null) {
    return _createDependency(token, optional, visibility);
  } else {
    throw noAnnotationError(typeOrFunc, params);
  }
}
function _createDependency(token, optional, visibility) {
  return new ReflectiveDependency(ReflectiveKey.get(token), optional, visibility);
}
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
const UNDEFINED = {};
class ReflectiveInjector {
  /**
   * Turns an array of provider definitions into an array of resolved providers.
   *
   * A resolution is a process of flattening multiple nested arrays and converting individual
   * providers into an array of `ResolvedReflectiveProvider`s.
   *
   * @usageNotes
   * ### Example
   *
   * ```typescript
   * @Injectable()
   * class Engine {
   * }
   *
   * @Injectable()
   * class Car {
   *   constructor(public engine:Engine) {}
   * }
   *
   * var providers = ReflectiveInjector.resolve([Car, [[Engine]]]);
   *
   * expect(providers.length).toEqual(2);
   *
   * expect(providers[0] instanceof ResolvedReflectiveProvider).toBe(true);
   * expect(providers[0].key.displayName).toBe("Car");
   * expect(providers[0].dependencies.length).toEqual(1);
   * expect(providers[0].factory).toBeDefined();
   *
   * expect(providers[1].key.displayName).toBe("Engine");
   * });
   * ```
   *
   */
  static resolve(providers) {
    return resolveReflectiveProviders(providers);
  }
  /**
   * Resolves an array of providers and creates an injector from those providers.
   *
   * The passed-in providers can be an array of `Type`, `Provider`,
   * or a recursive array of more providers.
   *
   * @usageNotes
   * ### Example
   *
   * ```typescript
   * @Injectable()
   * class Engine {
   * }
   *
   * @Injectable()
   * class Car {
   *   constructor(public engine:Engine) {}
   * }
   *
   * var injector = ReflectiveInjector.resolveAndCreate([Car, Engine]);
   * expect(injector.get(Car) instanceof Car).toBe(true);
   * ```
   */
  static resolveAndCreate(providers, parent) {
    const ResolvedReflectiveProviders = ReflectiveInjector.resolve(providers);
    return ReflectiveInjector.fromResolvedProviders(ResolvedReflectiveProviders, parent);
  }
  /**
   * Creates an injector from previously resolved providers.
   *
   * This API is the recommended way to construct injectors in performance-sensitive parts.
   *
   * @usageNotes
   * ### Example
   *
   * ```typescript
   * @Injectable()
   * class Engine {
   * }
   *
   * @Injectable()
   * class Car {
   *   constructor(public engine:Engine) {}
   * }
   *
   * var providers = ReflectiveInjector.resolve([Car, Engine]);
   * var injector = ReflectiveInjector.fromResolvedProviders(providers);
   * expect(injector.get(Car) instanceof Car).toBe(true);
   * ```
   */
  static fromResolvedProviders(providers, parent) {
    return new ReflectiveInjector_(providers, parent);
  }
}
class ReflectiveInjector_ {
  /**
   * Private
   */
  constructor(_providers, _parent) {
    this._constructionCounter = 0;
    this._providers = _providers;
    this.parent = _parent || null;
    const len = _providers.length;
    this.keyIds = [];
    this.objs = [];
    for (let i = 0; i < len; i++) {
      this.keyIds[i] = _providers[i].key.id;
      this.objs[i] = UNDEFINED;
    }
  }
  get(token, notFoundValue = THROW_IF_NOT_FOUND) {
    return this._getByKey(ReflectiveKey.get(token), null, notFoundValue);
  }
  resolveAndCreateChild(providers) {
    const ResolvedReflectiveProviders = ReflectiveInjector.resolve(providers);
    return this.createChildFromResolved(ResolvedReflectiveProviders);
  }
  createChildFromResolved(providers) {
    const inj = new ReflectiveInjector_(providers);
    inj.parent = this;
    return inj;
  }
  resolveAndInstantiate(provider) {
    return this.instantiateResolved(ReflectiveInjector.resolve([provider])[0]);
  }
  instantiateResolved(provider) {
    return this._instantiateProvider(provider);
  }
  getProviderAtIndex(index) {
    if (index < 0 || index >= this._providers.length) {
      throw outOfBoundsError(index);
    }
    return this._providers[index];
  }
  /** @internal */
  _new(provider) {
    if (this._constructionCounter++ > this._getMaxNumberOfObjects()) {
      throw cyclicDependencyError(this, provider.key);
    }
    return this._instantiateProvider(provider);
  }
  _getMaxNumberOfObjects() {
    return this.objs.length;
  }
  _instantiateProvider(provider) {
    if (provider.multiProvider) {
      const res = [];
      for (let i = 0; i < provider.resolvedFactories.length; ++i) {
        res[i] = this._instantiate(provider, provider.resolvedFactories[i]);
      }
      return res;
    } else {
      return this._instantiate(provider, provider.resolvedFactories[0]);
    }
  }
  _instantiate(provider, ResolvedReflectiveFactory2) {
    const factory = ResolvedReflectiveFactory2.factory;
    let deps;
    try {
      deps = ResolvedReflectiveFactory2.dependencies.map((dep) => this._getByReflectiveDependency(dep));
    } catch (e) {
      if (e.addKey) {
        e.addKey(this, provider.key);
      }
      throw e;
    }
    let obj;
    try {
      obj = factory(...deps);
    } catch (e) {
      throw instantiationError(this, e, e.stack, provider.key);
    }
    return obj;
  }
  _getByReflectiveDependency(dep) {
    return this._getByKey(dep.key, dep.visibility, dep.optional ? null : THROW_IF_NOT_FOUND);
  }
  _getByKey(key, visibility, notFoundValue) {
    if (key === ReflectiveInjector_.INJECTOR_KEY) {
      return this;
    }
    if (visibility instanceof Self) {
      return this._getByKeySelf(key, notFoundValue);
    } else {
      return this._getByKeyDefault(key, notFoundValue, visibility);
    }
  }
  _getObjByKeyId(keyId) {
    for (let i = 0; i < this.keyIds.length; i++) {
      if (this.keyIds[i] === keyId) {
        if (this.objs[i] === UNDEFINED) {
          this.objs[i] = this._new(this._providers[i]);
        }
        return this.objs[i];
      }
    }
    return UNDEFINED;
  }
  /** @internal */
  _throwOrNull(key, notFoundValue) {
    if (notFoundValue !== THROW_IF_NOT_FOUND) {
      return notFoundValue;
    } else {
      throw noProviderError(this, key);
    }
  }
  /** @internal */
  _getByKeySelf(key, notFoundValue) {
    const obj = this._getObjByKeyId(key.id);
    return obj !== UNDEFINED ? obj : this._throwOrNull(key, notFoundValue);
  }
  /** @internal */
  _getByKeyDefault(key, notFoundValue, visibility) {
    let inj;
    if (visibility instanceof SkipSelf) {
      inj = this.parent;
    } else {
      inj = this;
    }
    while (inj instanceof ReflectiveInjector_) {
      const inj_ = inj;
      const obj = inj_._getObjByKeyId(key.id);
      if (obj !== UNDEFINED)
        return obj;
      inj = inj_.parent;
    }
    if (inj !== null) {
      return inj.get(key.token, notFoundValue);
    } else {
      return this._throwOrNull(key, notFoundValue);
    }
  }
  get displayName() {
    const providers = _mapProviders(this, (b) => ' "' + b.key.displayName + '" ').join(", ");
    return `ReflectiveInjector(providers: [${providers}])`;
  }
  toString() {
    return this.displayName;
  }
}
ReflectiveInjector_.INJECTOR_KEY = /* @__PURE__ */ ReflectiveKey.get(Injector);
function _mapProviders(injector, fn) {
  const res = [];
  for (let i = 0; i < injector._providers.length; ++i) {
    res[i] = fn(injector.getProviderAtIndex(i));
  }
  return res;
}
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
function ɵɵdirectiveInject(token, flags = InjectFlags.Default) {
  const lView = getLView();
  if (lView === null) {
    ngDevMode && assertInjectImplementationNotEqual(ɵɵdirectiveInject);
    return ɵɵinject(token, flags);
  }
  const tNode = getCurrentTNode();
  return getOrCreateInjectable(tNode, lView, resolveForwardRef(token), flags);
}
function ɵɵinvalidFactory() {
  const msg = ngDevMode ? `This constructor was not compatible with Dependency Injection.` : "invalid";
  throw new Error(msg);
}
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
function ɵɵproperty(propName, value, sanitizer) {
  const lView = getLView();
  const bindingIndex = nextBindingIndex();
  if (bindingUpdated(lView, bindingIndex, value)) {
    const tView = getTView();
    const tNode = getSelectedTNode();
    elementPropertyInternal(tView, tNode, lView, propName, value, lView[RENDERER], sanitizer, false);
    ngDevMode && storePropertyBindingMetadata(tView.data, tNode, propName, bindingIndex);
  }
  return ɵɵproperty;
}
function setDirectiveInputsWhichShadowsStyling(tView, tNode, lView, value, isClassBased) {
  const inputs = tNode.inputs;
  const property = isClassBased ? "class" : "style";
  setInputsForProperty(tView, lView, inputs[property], property, value);
}
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
function elementStartFirstCreatePass(index, tView, lView, native, name, attrsIndex, localRefsIndex) {
  ngDevMode && assertFirstCreatePass(tView);
  ngDevMode && ngDevMode.firstCreatePass++;
  const tViewConsts = tView.consts;
  const attrs = getConstant(tViewConsts, attrsIndex);
  const tNode = getOrCreateTNode(tView, index, 2, name, attrs);
  const hasDirectives = resolveDirectives(tView, lView, tNode, getConstant(tViewConsts, localRefsIndex));
  ngDevMode && validateElementIsKnown(native, tNode.value, tView.schemas, hasDirectives);
  if (tNode.attrs !== null) {
    computeStaticStyling(tNode, tNode.attrs, false);
  }
  if (tNode.mergedAttrs !== null) {
    computeStaticStyling(tNode, tNode.mergedAttrs, true);
  }
  if (tView.queries !== null) {
    tView.queries.elementStart(tView, tNode);
  }
  return tNode;
}
function ɵɵelementStart(index, name, attrsIndex, localRefsIndex) {
  const lView = getLView();
  const tView = getTView();
  const adjustedIndex = HEADER_OFFSET + index;
  ngDevMode && assertEqual(getBindingIndex(), tView.bindingStartIndex, "elements should be created before any bindings");
  ngDevMode && assertIndexInRange(lView, adjustedIndex);
  const renderer = lView[RENDERER];
  const native = lView[adjustedIndex] = createElementNode(renderer, name, getNamespace$1());
  const tNode = tView.firstCreatePass ? elementStartFirstCreatePass(adjustedIndex, tView, lView, native, name, attrsIndex, localRefsIndex) : tView.data[adjustedIndex];
  setCurrentTNode(tNode, true);
  const mergedAttrs = tNode.mergedAttrs;
  if (mergedAttrs !== null) {
    setUpAttributes(renderer, native, mergedAttrs);
  }
  const classes = tNode.classes;
  if (classes !== null) {
    writeDirectClass(renderer, native, classes);
  }
  const styles = tNode.styles;
  if (styles !== null) {
    writeDirectStyle(renderer, native, styles);
  }
  if ((tNode.flags & 64) !== 64) {
    appendChild(tView, lView, native, tNode);
  }
  if (getElementDepthCount() === 0) {
    attachPatchData(native, lView);
  }
  increaseElementDepthCount();
  if (isDirectiveHost(tNode)) {
    createDirectivesInstances(tView, lView, tNode);
    executeContentQueries(tView, tNode, lView);
  }
  if (localRefsIndex !== null) {
    saveResolvedLocalsInData(lView, tNode);
  }
  return ɵɵelementStart;
}
function ɵɵelementEnd() {
  let currentTNode = getCurrentTNode();
  ngDevMode && assertDefined(currentTNode, "No parent node to close.");
  if (isCurrentTNodeParent()) {
    setCurrentTNodeAsNotParent();
  } else {
    ngDevMode && assertHasParent(getCurrentTNode());
    currentTNode = currentTNode.parent;
    setCurrentTNode(currentTNode, false);
  }
  const tNode = currentTNode;
  ngDevMode && assertTNodeType(
    tNode,
    3
    /* AnyRNode */
  );
  decreaseElementDepthCount();
  const tView = getTView();
  if (tView.firstCreatePass) {
    registerPostOrderHooks(tView, currentTNode);
    if (isContentQueryHost(currentTNode)) {
      tView.queries.elementEnd(currentTNode);
    }
  }
  if (tNode.classesWithoutHost != null && hasClassInput(tNode)) {
    setDirectiveInputsWhichShadowsStyling(tView, tNode, getLView(), tNode.classesWithoutHost, true);
  }
  if (tNode.stylesWithoutHost != null && hasStyleInput(tNode)) {
    setDirectiveInputsWhichShadowsStyling(tView, tNode, getLView(), tNode.stylesWithoutHost, false);
  }
  return ɵɵelementEnd;
}
function ɵɵelement(index, name, attrsIndex, localRefsIndex) {
  ɵɵelementStart(index, name, attrsIndex, localRefsIndex);
  ɵɵelementEnd();
  return ɵɵelement;
}
function validateElementIsKnown(element, tagName, schemas, hasDirectives) {
  if (schemas === null)
    return;
  if (!hasDirectives && tagName !== null) {
    const isUnknown = (
      // Note that we can't check for `typeof HTMLUnknownElement === 'function'`,
      // because while most browsers return 'function', IE returns 'object'.
      typeof HTMLUnknownElement !== "undefined" && HTMLUnknownElement && element instanceof HTMLUnknownElement || typeof customElements !== "undefined" && tagName.indexOf("-") > -1 && !customElements.get(tagName)
    );
    if (isUnknown && !matchingSchemas(schemas, tagName)) {
      let message = `'${tagName}' is not a known element:
`;
      message += `1. If '${tagName}' is an Angular component, then verify that it is part of this module.
`;
      if (tagName && tagName.indexOf("-") > -1) {
        message += `2. If '${tagName}' is a Web Component then add 'CUSTOM_ELEMENTS_SCHEMA' to the '@NgModule.schemas' of this component to suppress this message.`;
      } else {
        message += `2. To allow any element add 'NO_ERRORS_SCHEMA' to the '@NgModule.schemas' of this component.`;
      }
      console.error(formatRuntimeError(304, message));
    }
  }
}
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
function elementContainerStartFirstCreatePass(index, tView, lView, attrsIndex, localRefsIndex) {
  ngDevMode && ngDevMode.firstCreatePass++;
  const tViewConsts = tView.consts;
  const attrs = getConstant(tViewConsts, attrsIndex);
  const tNode = getOrCreateTNode(tView, index, 8, "ng-container", attrs);
  if (attrs !== null) {
    computeStaticStyling(tNode, attrs, true);
  }
  const localRefs = getConstant(tViewConsts, localRefsIndex);
  resolveDirectives(tView, lView, tNode, localRefs);
  if (tView.queries !== null) {
    tView.queries.elementStart(tView, tNode);
  }
  return tNode;
}
function ɵɵelementContainerStart(index, attrsIndex, localRefsIndex) {
  const lView = getLView();
  const tView = getTView();
  const adjustedIndex = index + HEADER_OFFSET;
  ngDevMode && assertIndexInRange(lView, adjustedIndex);
  ngDevMode && assertEqual(getBindingIndex(), tView.bindingStartIndex, "element containers should be created before any bindings");
  const tNode = tView.firstCreatePass ? elementContainerStartFirstCreatePass(adjustedIndex, tView, lView, attrsIndex, localRefsIndex) : tView.data[adjustedIndex];
  setCurrentTNode(tNode, true);
  ngDevMode && ngDevMode.rendererCreateComment++;
  const native = lView[adjustedIndex] = lView[RENDERER].createComment(ngDevMode ? "ng-container" : "");
  appendChild(tView, lView, native, tNode);
  attachPatchData(native, lView);
  if (isDirectiveHost(tNode)) {
    createDirectivesInstances(tView, lView, tNode);
    executeContentQueries(tView, tNode, lView);
  }
  if (localRefsIndex != null) {
    saveResolvedLocalsInData(lView, tNode);
  }
  return ɵɵelementContainerStart;
}
function ɵɵelementContainerEnd() {
  let currentTNode = getCurrentTNode();
  const tView = getTView();
  if (isCurrentTNodeParent()) {
    setCurrentTNodeAsNotParent();
  } else {
    ngDevMode && assertHasParent(currentTNode);
    currentTNode = currentTNode.parent;
    setCurrentTNode(currentTNode, false);
  }
  ngDevMode && assertTNodeType(
    currentTNode,
    8
    /* ElementContainer */
  );
  if (tView.firstCreatePass) {
    registerPostOrderHooks(tView, currentTNode);
    if (isContentQueryHost(currentTNode)) {
      tView.queries.elementEnd(currentTNode);
    }
  }
  return ɵɵelementContainerEnd;
}
function ɵɵelementContainer(index, attrsIndex, localRefsIndex) {
  ɵɵelementContainerStart(index, attrsIndex, localRefsIndex);
  ɵɵelementContainerEnd();
  return ɵɵelementContainer;
}
function ɵɵgetCurrentView() {
  return getLView();
}
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
function isPromise(obj) {
  return !!obj && typeof obj.then === "function";
}
function isSubscribable(obj) {
  return !!obj && typeof obj.subscribe === "function";
}
const isObservable = isSubscribable;
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
function ɵɵlistener(eventName, listenerFn, useCapture, eventTargetResolver) {
  const lView = getLView();
  const tView = getTView();
  const tNode = getCurrentTNode();
  listenerInternal(tView, lView, lView[RENDERER], tNode, eventName, listenerFn, !!useCapture, eventTargetResolver);
  return ɵɵlistener;
}
function ɵɵsyntheticHostListener(eventName, listenerFn) {
  const tNode = getCurrentTNode();
  const lView = getLView();
  const tView = getTView();
  const currentDef = getCurrentDirectiveDef(tView.data);
  const renderer = loadComponentRenderer(currentDef, tNode, lView);
  listenerInternal(tView, lView, renderer, tNode, eventName, listenerFn, false);
  return ɵɵsyntheticHostListener;
}
function findExistingListener(tView, lView, eventName, tNodeIdx) {
  const tCleanup = tView.cleanup;
  if (tCleanup != null) {
    for (let i = 0; i < tCleanup.length - 1; i += 2) {
      const cleanupEventName = tCleanup[i];
      if (cleanupEventName === eventName && tCleanup[i + 1] === tNodeIdx) {
        const lCleanup = lView[CLEANUP];
        const listenerIdxInLCleanup = tCleanup[i + 2];
        return lCleanup.length > listenerIdxInLCleanup ? lCleanup[listenerIdxInLCleanup] : null;
      }
      if (typeof cleanupEventName === "string") {
        i += 2;
      }
    }
  }
  return null;
}
function listenerInternal(tView, lView, renderer, tNode, eventName, listenerFn, useCapture, eventTargetResolver) {
  const isTNodeDirectiveHost = isDirectiveHost(tNode);
  const firstCreatePass = tView.firstCreatePass;
  const tCleanup = firstCreatePass && getOrCreateTViewCleanup(tView);
  const context = lView[CONTEXT];
  const lCleanup = getOrCreateLViewCleanup(lView);
  ngDevMode && assertTNodeType(
    tNode,
    3 | 12
    /* AnyContainer */
  );
  let processOutputs = true;
  if (tNode.type & 3 || eventTargetResolver) {
    const native = getNativeByTNode(tNode, lView);
    const target = eventTargetResolver ? eventTargetResolver(native) : native;
    const lCleanupIndex = lCleanup.length;
    const idxOrTargetGetter = eventTargetResolver ? (_lView) => eventTargetResolver(unwrapRNode(_lView[tNode.index])) : tNode.index;
    if (isProceduralRenderer(renderer)) {
      let existingListener = null;
      if (!eventTargetResolver && isTNodeDirectiveHost) {
        existingListener = findExistingListener(tView, lView, eventName, tNode.index);
      }
      if (existingListener !== null) {
        const lastListenerFn = existingListener.__ngLastListenerFn__ || existingListener;
        lastListenerFn.__ngNextListenerFn__ = listenerFn;
        existingListener.__ngLastListenerFn__ = listenerFn;
        processOutputs = false;
      } else {
        listenerFn = wrapListener(
          tNode,
          lView,
          context,
          listenerFn,
          false
          /** preventDefault */
        );
        const cleanupFn = renderer.listen(target, eventName, listenerFn);
        ngDevMode && ngDevMode.rendererAddEventListener++;
        lCleanup.push(listenerFn, cleanupFn);
        tCleanup && tCleanup.push(eventName, idxOrTargetGetter, lCleanupIndex, lCleanupIndex + 1);
      }
    } else {
      listenerFn = wrapListener(
        tNode,
        lView,
        context,
        listenerFn,
        true
        /** preventDefault */
      );
      target.addEventListener(eventName, listenerFn, useCapture);
      ngDevMode && ngDevMode.rendererAddEventListener++;
      lCleanup.push(listenerFn);
      tCleanup && tCleanup.push(eventName, idxOrTargetGetter, lCleanupIndex, useCapture);
    }
  } else {
    listenerFn = wrapListener(
      tNode,
      lView,
      context,
      listenerFn,
      false
      /** preventDefault */
    );
  }
  const outputs = tNode.outputs;
  let props;
  if (processOutputs && outputs !== null && (props = outputs[eventName])) {
    const propsLength = props.length;
    if (propsLength) {
      for (let i = 0; i < propsLength; i += 2) {
        const index = props[i];
        ngDevMode && assertIndexInRange(lView, index);
        const minifiedName = props[i + 1];
        const directiveInstance = lView[index];
        const output = directiveInstance[minifiedName];
        if (ngDevMode && !isObservable(output)) {
          throw new Error(`@Output ${minifiedName} not initialized in '${directiveInstance.constructor.name}'.`);
        }
        const subscription = output.subscribe(listenerFn);
        const idx = lCleanup.length;
        lCleanup.push(listenerFn, subscription);
        tCleanup && tCleanup.push(eventName, tNode.index, idx, -(idx + 1));
      }
    }
  }
}
function executeListenerWithErrorHandling(lView, context, listenerFn, e) {
  try {
    profiler(6, context, listenerFn);
    return listenerFn(e) !== false;
  } catch (error) {
    handleError(lView, error);
    return false;
  } finally {
    profiler(7, context, listenerFn);
  }
}
function wrapListener(tNode, lView, context, listenerFn, wrapWithPreventDefault) {
  return function wrapListenerIn_markDirtyAndPreventDefault(e) {
    if (e === Function) {
      return listenerFn;
    }
    const startView = tNode.flags & 2 ? getComponentLViewByIndex(tNode.index, lView) : lView;
    if ((lView[FLAGS] & 32) === 0) {
      markViewDirty(startView);
    }
    let result = executeListenerWithErrorHandling(lView, context, listenerFn, e);
    let nextListenerFn = wrapListenerIn_markDirtyAndPreventDefault.__ngNextListenerFn__;
    while (nextListenerFn) {
      result = executeListenerWithErrorHandling(lView, context, nextListenerFn, e) && result;
      nextListenerFn = nextListenerFn.__ngNextListenerFn__;
    }
    if (wrapWithPreventDefault && result === false) {
      e.preventDefault();
      e.returnValue = false;
    }
    return result;
  };
}
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
function ɵɵnextContext(level = 1) {
  return nextContextImpl(level);
}
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
function matchingProjectionSlotIndex(tNode, projectionSlots) {
  let wildcardNgContentIndex = null;
  const ngProjectAsAttrVal = getProjectAsAttrValue(tNode);
  for (let i = 0; i < projectionSlots.length; i++) {
    const slotValue = projectionSlots[i];
    if (slotValue === "*") {
      wildcardNgContentIndex = i;
      continue;
    }
    if (ngProjectAsAttrVal === null ? isNodeMatchingSelectorList(
      tNode,
      slotValue,
      /* isProjectionMode */
      true
    ) : isSelectorInSelectorList(ngProjectAsAttrVal, slotValue)) {
      return i;
    }
  }
  return wildcardNgContentIndex;
}
function ɵɵprojectionDef(projectionSlots) {
  const componentNode = getLView()[DECLARATION_COMPONENT_VIEW][T_HOST];
  if (!componentNode.projection) {
    const numProjectionSlots = projectionSlots ? projectionSlots.length : 1;
    const projectionHeads = componentNode.projection = newArray(numProjectionSlots, null);
    const tails = projectionHeads.slice();
    let componentChild = componentNode.child;
    while (componentChild !== null) {
      const slotIndex = projectionSlots ? matchingProjectionSlotIndex(componentChild, projectionSlots) : 0;
      if (slotIndex !== null) {
        if (tails[slotIndex]) {
          tails[slotIndex].projectionNext = componentChild;
        } else {
          projectionHeads[slotIndex] = componentChild;
        }
        tails[slotIndex] = componentChild;
      }
      componentChild = componentChild.next;
    }
  }
}
function ɵɵprojection(nodeIndex, selectorIndex = 0, attrs) {
  const lView = getLView();
  const tView = getTView();
  const tProjectionNode = getOrCreateTNode(tView, HEADER_OFFSET + nodeIndex, 16, null, attrs || null);
  if (tProjectionNode.projection === null)
    tProjectionNode.projection = selectorIndex;
  setCurrentTNodeAsNotParent();
  if ((tProjectionNode.flags & 64) !== 64) {
    applyProjection(tView, lView, tProjectionNode);
  }
}
function ɵɵpropertyInterpolate(propName, v0, sanitizer) {
  ɵɵpropertyInterpolate1(propName, "", v0, "", sanitizer);
  return ɵɵpropertyInterpolate;
}
function ɵɵpropertyInterpolate1(propName, prefix, v0, suffix, sanitizer) {
  const lView = getLView();
  const interpolatedValue = interpolation1(lView, prefix, v0, suffix);
  if (interpolatedValue !== NO_CHANGE) {
    const tView = getTView();
    const tNode = getSelectedTNode();
    elementPropertyInternal(tView, tNode, lView, propName, interpolatedValue, lView[RENDERER], sanitizer, false);
    ngDevMode && storePropertyBindingMetadata(tView.data, tNode, propName, getBindingIndex() - 1, prefix, suffix);
  }
  return ɵɵpropertyInterpolate1;
}
function ɵɵpropertyInterpolate2(propName, prefix, v0, i02, v1, suffix, sanitizer) {
  const lView = getLView();
  const interpolatedValue = interpolation2(lView, prefix, v0, i02, v1, suffix);
  if (interpolatedValue !== NO_CHANGE) {
    const tView = getTView();
    const tNode = getSelectedTNode();
    elementPropertyInternal(tView, tNode, lView, propName, interpolatedValue, lView[RENDERER], sanitizer, false);
    ngDevMode && storePropertyBindingMetadata(tView.data, tNode, propName, getBindingIndex() - 2, prefix, i02, suffix);
  }
  return ɵɵpropertyInterpolate2;
}
function ɵɵpropertyInterpolate3(propName, prefix, v0, i02, v1, i1, v2, suffix, sanitizer) {
  const lView = getLView();
  const interpolatedValue = interpolation3(lView, prefix, v0, i02, v1, i1, v2, suffix);
  if (interpolatedValue !== NO_CHANGE) {
    const tView = getTView();
    const tNode = getSelectedTNode();
    elementPropertyInternal(tView, tNode, lView, propName, interpolatedValue, lView[RENDERER], sanitizer, false);
    ngDevMode && storePropertyBindingMetadata(tView.data, tNode, propName, getBindingIndex() - 3, prefix, i02, i1, suffix);
  }
  return ɵɵpropertyInterpolate3;
}
function ɵɵpropertyInterpolate4(propName, prefix, v0, i02, v1, i1, v2, i2, v3, suffix, sanitizer) {
  const lView = getLView();
  const interpolatedValue = interpolation4(lView, prefix, v0, i02, v1, i1, v2, i2, v3, suffix);
  if (interpolatedValue !== NO_CHANGE) {
    const tView = getTView();
    const tNode = getSelectedTNode();
    elementPropertyInternal(tView, tNode, lView, propName, interpolatedValue, lView[RENDERER], sanitizer, false);
    ngDevMode && storePropertyBindingMetadata(tView.data, tNode, propName, getBindingIndex() - 4, prefix, i02, i1, i2, suffix);
  }
  return ɵɵpropertyInterpolate4;
}
function ɵɵpropertyInterpolate5(propName, prefix, v0, i02, v1, i1, v2, i2, v3, i3, v4, suffix, sanitizer) {
  const lView = getLView();
  const interpolatedValue = interpolation5(lView, prefix, v0, i02, v1, i1, v2, i2, v3, i3, v4, suffix);
  if (interpolatedValue !== NO_CHANGE) {
    const tView = getTView();
    const tNode = getSelectedTNode();
    elementPropertyInternal(tView, tNode, lView, propName, interpolatedValue, lView[RENDERER], sanitizer, false);
    ngDevMode && storePropertyBindingMetadata(tView.data, tNode, propName, getBindingIndex() - 5, prefix, i02, i1, i2, i3, suffix);
  }
  return ɵɵpropertyInterpolate5;
}
function ɵɵpropertyInterpolate6(propName, prefix, v0, i02, v1, i1, v2, i2, v3, i3, v4, i4, v5, suffix, sanitizer) {
  const lView = getLView();
  const interpolatedValue = interpolation6(lView, prefix, v0, i02, v1, i1, v2, i2, v3, i3, v4, i4, v5, suffix);
  if (interpolatedValue !== NO_CHANGE) {
    const tView = getTView();
    const tNode = getSelectedTNode();
    elementPropertyInternal(tView, tNode, lView, propName, interpolatedValue, lView[RENDERER], sanitizer, false);
    ngDevMode && storePropertyBindingMetadata(tView.data, tNode, propName, getBindingIndex() - 6, prefix, i02, i1, i2, i3, i4, suffix);
  }
  return ɵɵpropertyInterpolate6;
}
function ɵɵpropertyInterpolate7(propName, prefix, v0, i02, v1, i1, v2, i2, v3, i3, v4, i4, v5, i5, v6, suffix, sanitizer) {
  const lView = getLView();
  const interpolatedValue = interpolation7(lView, prefix, v0, i02, v1, i1, v2, i2, v3, i3, v4, i4, v5, i5, v6, suffix);
  if (interpolatedValue !== NO_CHANGE) {
    const tView = getTView();
    const tNode = getSelectedTNode();
    elementPropertyInternal(tView, tNode, lView, propName, interpolatedValue, lView[RENDERER], sanitizer, false);
    ngDevMode && storePropertyBindingMetadata(tView.data, tNode, propName, getBindingIndex() - 7, prefix, i02, i1, i2, i3, i4, i5, suffix);
  }
  return ɵɵpropertyInterpolate7;
}
function ɵɵpropertyInterpolate8(propName, prefix, v0, i02, v1, i1, v2, i2, v3, i3, v4, i4, v5, i5, v6, i6, v7, suffix, sanitizer) {
  const lView = getLView();
  const interpolatedValue = interpolation8(lView, prefix, v0, i02, v1, i1, v2, i2, v3, i3, v4, i4, v5, i5, v6, i6, v7, suffix);
  if (interpolatedValue !== NO_CHANGE) {
    const tView = getTView();
    const tNode = getSelectedTNode();
    elementPropertyInternal(tView, tNode, lView, propName, interpolatedValue, lView[RENDERER], sanitizer, false);
    ngDevMode && storePropertyBindingMetadata(tView.data, tNode, propName, getBindingIndex() - 8, prefix, i02, i1, i2, i3, i4, i5, i6, suffix);
  }
  return ɵɵpropertyInterpolate8;
}
function ɵɵpropertyInterpolateV(propName, values, sanitizer) {
  const lView = getLView();
  const interpolatedValue = interpolationV(lView, values);
  if (interpolatedValue !== NO_CHANGE) {
    const tView = getTView();
    const tNode = getSelectedTNode();
    elementPropertyInternal(tView, tNode, lView, propName, interpolatedValue, lView[RENDERER], sanitizer, false);
    if (ngDevMode) {
      const interpolationInBetween = [values[0]];
      for (let i = 2; i < values.length; i += 2) {
        interpolationInBetween.push(values[i]);
      }
      storePropertyBindingMetadata(tView.data, tNode, propName, getBindingIndex() - interpolationInBetween.length + 1, ...interpolationInBetween);
    }
  }
  return ɵɵpropertyInterpolateV;
}
function insertTStylingBinding(tData, tNode, tStylingKeyWithStatic, index, isHostBinding, isClassBinding) {
  ngDevMode && assertFirstUpdatePass(getTView());
  let tBindings = isClassBinding ? tNode.classBindings : tNode.styleBindings;
  let tmplHead = getTStylingRangePrev(tBindings);
  let tmplTail = getTStylingRangeNext(tBindings);
  tData[index] = tStylingKeyWithStatic;
  let isKeyDuplicateOfStatic = false;
  let tStylingKey;
  if (Array.isArray(tStylingKeyWithStatic)) {
    const staticKeyValueArray = tStylingKeyWithStatic;
    tStylingKey = staticKeyValueArray[1];
    if (tStylingKey === null || keyValueArrayIndexOf(staticKeyValueArray, tStylingKey) > 0) {
      isKeyDuplicateOfStatic = true;
    }
  } else {
    tStylingKey = tStylingKeyWithStatic;
  }
  if (isHostBinding) {
    const hasTemplateBindings = tmplTail !== 0;
    if (hasTemplateBindings) {
      const previousNode = getTStylingRangePrev(tData[tmplHead + 1]);
      tData[index + 1] = toTStylingRange(previousNode, tmplHead);
      if (previousNode !== 0) {
        tData[previousNode + 1] = setTStylingRangeNext(tData[previousNode + 1], index);
      }
      tData[tmplHead + 1] = setTStylingRangePrev(tData[tmplHead + 1], index);
    } else {
      tData[index + 1] = toTStylingRange(tmplHead, 0);
      if (tmplHead !== 0) {
        tData[tmplHead + 1] = setTStylingRangeNext(tData[tmplHead + 1], index);
      }
      tmplHead = index;
    }
  } else {
    tData[index + 1] = toTStylingRange(tmplTail, 0);
    ngDevMode && assertEqual(tmplHead !== 0 && tmplTail === 0, false, "Adding template bindings after hostBindings is not allowed.");
    if (tmplHead === 0) {
      tmplHead = index;
    } else {
      tData[tmplTail + 1] = setTStylingRangeNext(tData[tmplTail + 1], index);
    }
    tmplTail = index;
  }
  if (isKeyDuplicateOfStatic) {
    tData[index + 1] = setTStylingRangePrevDuplicate(tData[index + 1]);
  }
  markDuplicates(tData, tStylingKey, index, true);
  markDuplicates(tData, tStylingKey, index, false);
  markDuplicateOfResidualStyling(tNode, tStylingKey, tData, index, isClassBinding);
  tBindings = toTStylingRange(tmplHead, tmplTail);
  if (isClassBinding) {
    tNode.classBindings = tBindings;
  } else {
    tNode.styleBindings = tBindings;
  }
}
function markDuplicateOfResidualStyling(tNode, tStylingKey, tData, index, isClassBinding) {
  const residual = isClassBinding ? tNode.residualClasses : tNode.residualStyles;
  if (residual != null && typeof tStylingKey == "string" && keyValueArrayIndexOf(residual, tStylingKey) >= 0) {
    tData[index + 1] = setTStylingRangeNextDuplicate(tData[index + 1]);
  }
}
function markDuplicates(tData, tStylingKey, index, isPrevDir, isClassBinding) {
  const tStylingAtIndex = tData[index + 1];
  const isMap = tStylingKey === null;
  let cursor = isPrevDir ? getTStylingRangePrev(tStylingAtIndex) : getTStylingRangeNext(tStylingAtIndex);
  let foundDuplicate = false;
  while (cursor !== 0 && (foundDuplicate === false || isMap)) {
    ngDevMode && assertIndexInRange(tData, cursor);
    const tStylingValueAtCursor = tData[cursor];
    const tStyleRangeAtCursor = tData[cursor + 1];
    if (isStylingMatch(tStylingValueAtCursor, tStylingKey)) {
      foundDuplicate = true;
      tData[cursor + 1] = isPrevDir ? setTStylingRangeNextDuplicate(tStyleRangeAtCursor) : setTStylingRangePrevDuplicate(tStyleRangeAtCursor);
    }
    cursor = isPrevDir ? getTStylingRangePrev(tStyleRangeAtCursor) : getTStylingRangeNext(tStyleRangeAtCursor);
  }
  if (foundDuplicate) {
    tData[index + 1] = isPrevDir ? setTStylingRangePrevDuplicate(tStylingAtIndex) : setTStylingRangeNextDuplicate(tStylingAtIndex);
  }
}
function isStylingMatch(tStylingKeyCursor, tStylingKey) {
  ngDevMode && assertNotEqual(Array.isArray(tStylingKey), true, "Expected that 'tStylingKey' has been unwrapped");
  if (tStylingKeyCursor === null || // If the cursor is `null` it means that we have map at that
  // location so we must assume that we have a match.
  tStylingKey == null || // If `tStylingKey` is `null` then it is a map therefor assume that it
  // contains a match.
  (Array.isArray(tStylingKeyCursor) ? tStylingKeyCursor[1] : tStylingKeyCursor) === tStylingKey) {
    return true;
  } else if (Array.isArray(tStylingKeyCursor) && typeof tStylingKey === "string") {
    return keyValueArrayIndexOf(tStylingKeyCursor, tStylingKey) >= 0;
  }
  return false;
}
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
const parserState = {
  textEnd: 0,
  key: 0,
  keyEnd: 0,
  value: 0,
  valueEnd: 0
};
function getLastParsedKey(text) {
  return text.substring(parserState.key, parserState.keyEnd);
}
function getLastParsedValue(text) {
  return text.substring(parserState.value, parserState.valueEnd);
}
function parseClassName(text) {
  resetParserState(text);
  return parseClassNameNext(text, consumeWhitespace(text, 0, parserState.textEnd));
}
function parseClassNameNext(text, index) {
  const end = parserState.textEnd;
  if (end === index) {
    return -1;
  }
  index = parserState.keyEnd = consumeClassToken(text, parserState.key = index, end);
  return consumeWhitespace(text, index, end);
}
function parseStyle(text) {
  resetParserState(text);
  return parseStyleNext(text, consumeWhitespace(text, 0, parserState.textEnd));
}
function parseStyleNext(text, startIndex) {
  const end = parserState.textEnd;
  let index = parserState.key = consumeWhitespace(text, startIndex, end);
  if (end === index) {
    return -1;
  }
  index = parserState.keyEnd = consumeStyleKey(text, index, end);
  index = consumeSeparator(
    text,
    index,
    end,
    58
    /* COLON */
  );
  index = parserState.value = consumeWhitespace(text, index, end);
  index = parserState.valueEnd = consumeStyleValue(text, index, end);
  return consumeSeparator(
    text,
    index,
    end,
    59
    /* SEMI_COLON */
  );
}
function resetParserState(text) {
  parserState.key = 0;
  parserState.keyEnd = 0;
  parserState.value = 0;
  parserState.valueEnd = 0;
  parserState.textEnd = text.length;
}
function consumeWhitespace(text, startIndex, endIndex) {
  while (startIndex < endIndex && text.charCodeAt(startIndex) <= 32) {
    startIndex++;
  }
  return startIndex;
}
function consumeClassToken(text, startIndex, endIndex) {
  while (startIndex < endIndex && text.charCodeAt(startIndex) > 32) {
    startIndex++;
  }
  return startIndex;
}
function consumeStyleKey(text, startIndex, endIndex) {
  let ch;
  while (startIndex < endIndex && ((ch = text.charCodeAt(startIndex)) === 45 || ch === 95 || (ch & -33) >= 65 && (ch & -33) <= 90 || ch >= 48 && ch <= 57)) {
    startIndex++;
  }
  return startIndex;
}
function consumeSeparator(text, startIndex, endIndex, separator) {
  startIndex = consumeWhitespace(text, startIndex, endIndex);
  if (startIndex < endIndex) {
    if (ngDevMode && text.charCodeAt(startIndex) !== separator) {
      malformedStyleError(text, String.fromCharCode(separator), startIndex);
    }
    startIndex++;
  }
  return startIndex;
}
function consumeStyleValue(text, startIndex, endIndex) {
  let ch1 = -1;
  let ch2 = -1;
  let ch3 = -1;
  let i = startIndex;
  let lastChIndex = i;
  while (i < endIndex) {
    const ch = text.charCodeAt(i++);
    if (ch === 59) {
      return lastChIndex;
    } else if (ch === 34 || ch === 39) {
      lastChIndex = i = consumeQuotedText(text, ch, i, endIndex);
    } else if (startIndex === i - 4 && // We have seen only 4 characters so far "URL(" (Ignore "foo_URL()")
    ch3 === 85 && ch2 === 82 && ch1 === 76 && ch === 40) {
      lastChIndex = i = consumeQuotedText(text, 41, i, endIndex);
    } else if (ch > 32) {
      lastChIndex = i;
    }
    ch3 = ch2;
    ch2 = ch1;
    ch1 = ch & -33;
  }
  return lastChIndex;
}
function consumeQuotedText(text, quoteCharCode, startIndex, endIndex) {
  let ch1 = -1;
  let index = startIndex;
  while (index < endIndex) {
    const ch = text.charCodeAt(index++);
    if (ch == quoteCharCode && ch1 !== 92) {
      return index;
    }
    if (ch == 92 && ch1 === 92) {
      ch1 = 0;
    } else {
      ch1 = ch;
    }
  }
  throw ngDevMode ? malformedStyleError(text, String.fromCharCode(quoteCharCode), endIndex) : new Error();
}
function malformedStyleError(text, expecting, index) {
  ngDevMode && assertEqual(typeof text === "string", true, "String expected here");
  throw throwError(`Malformed style at location ${index} in string '` + text.substring(0, index) + "[>>" + text.substring(index, index + 1) + "<<]" + text.substr(index + 1) + `'. Expecting '${expecting}'.`);
}
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
function ɵɵstyleProp(prop, value, suffix) {
  checkStylingProperty(prop, value, suffix, false);
  return ɵɵstyleProp;
}
function ɵɵclassProp(className, value) {
  checkStylingProperty(className, value, null, true);
  return ɵɵclassProp;
}
function ɵɵstyleMap(styles) {
  checkStylingMap(styleKeyValueArraySet, styleStringParser, styles, false);
}
function styleStringParser(keyValueArray, text) {
  for (let i = parseStyle(text); i >= 0; i = parseStyleNext(text, i)) {
    styleKeyValueArraySet(keyValueArray, getLastParsedKey(text), getLastParsedValue(text));
  }
}
function ɵɵclassMap(classes) {
  checkStylingMap(keyValueArraySet, classStringParser, classes, true);
}
function classStringParser(keyValueArray, text) {
  for (let i = parseClassName(text); i >= 0; i = parseClassNameNext(text, i)) {
    keyValueArraySet(keyValueArray, getLastParsedKey(text), true);
  }
}
function checkStylingProperty(prop, value, suffix, isClassBased) {
  const lView = getLView();
  const tView = getTView();
  const bindingIndex = incrementBindingIndex(2);
  if (tView.firstUpdatePass) {
    stylingFirstUpdatePass(tView, prop, bindingIndex, isClassBased);
  }
  if (value !== NO_CHANGE && bindingUpdated(lView, bindingIndex, value)) {
    const tNode = tView.data[getSelectedIndex()];
    updateStyling(tView, tNode, lView, lView[RENDERER], prop, lView[bindingIndex + 1] = normalizeSuffix(value, suffix), isClassBased, bindingIndex);
  }
}
function checkStylingMap(keyValueArraySet2, stringParser, value, isClassBased) {
  const tView = getTView();
  const bindingIndex = incrementBindingIndex(2);
  if (tView.firstUpdatePass) {
    stylingFirstUpdatePass(tView, null, bindingIndex, isClassBased);
  }
  const lView = getLView();
  if (value !== NO_CHANGE && bindingUpdated(lView, bindingIndex, value)) {
    const tNode = tView.data[getSelectedIndex()];
    if (hasStylingInputShadow(tNode, isClassBased) && !isInHostBindings(tView, bindingIndex)) {
      if (ngDevMode) {
        const tStylingKey = tView.data[bindingIndex];
        assertEqual(Array.isArray(tStylingKey) ? tStylingKey[1] : tStylingKey, false, "Styling linked list shadow input should be marked as 'false'");
      }
      let staticPrefix = isClassBased ? tNode.classesWithoutHost : tNode.stylesWithoutHost;
      ngDevMode && isClassBased === false && staticPrefix !== null && assertEqual(staticPrefix.endsWith(";"), true, "Expecting static portion to end with ';'");
      if (staticPrefix !== null) {
        value = concatStringsWithSpace(staticPrefix, value ? value : "");
      }
      setDirectiveInputsWhichShadowsStyling(tView, tNode, lView, value, isClassBased);
    } else {
      updateStylingMap(tView, tNode, lView, lView[RENDERER], lView[bindingIndex + 1], lView[bindingIndex + 1] = toStylingKeyValueArray(keyValueArraySet2, stringParser, value), isClassBased, bindingIndex);
    }
  }
}
function isInHostBindings(tView, bindingIndex) {
  return bindingIndex >= tView.expandoStartIndex;
}
function stylingFirstUpdatePass(tView, tStylingKey, bindingIndex, isClassBased) {
  ngDevMode && assertFirstUpdatePass(tView);
  const tData = tView.data;
  if (tData[bindingIndex + 1] === null) {
    const tNode = tData[getSelectedIndex()];
    ngDevMode && assertDefined(tNode, "TNode expected");
    const isHostBindings = isInHostBindings(tView, bindingIndex);
    if (hasStylingInputShadow(tNode, isClassBased) && tStylingKey === null && !isHostBindings) {
      tStylingKey = false;
    }
    tStylingKey = wrapInStaticStylingKey(tData, tNode, tStylingKey, isClassBased);
    insertTStylingBinding(tData, tNode, tStylingKey, bindingIndex, isHostBindings, isClassBased);
  }
}
function wrapInStaticStylingKey(tData, tNode, stylingKey, isClassBased) {
  const hostDirectiveDef = getCurrentDirectiveDef(tData);
  let residual = isClassBased ? tNode.residualClasses : tNode.residualStyles;
  if (hostDirectiveDef === null) {
    const isFirstStylingInstructionInTemplate = (isClassBased ? tNode.classBindings : tNode.styleBindings) === 0;
    if (isFirstStylingInstructionInTemplate) {
      stylingKey = collectStylingFromDirectives(null, tData, tNode, stylingKey, isClassBased);
      stylingKey = collectStylingFromTAttrs(stylingKey, tNode.attrs, isClassBased);
      residual = null;
    }
  } else {
    const directiveStylingLast = tNode.directiveStylingLast;
    const isFirstStylingInstructionInHostBinding = directiveStylingLast === -1 || tData[directiveStylingLast] !== hostDirectiveDef;
    if (isFirstStylingInstructionInHostBinding) {
      stylingKey = collectStylingFromDirectives(hostDirectiveDef, tData, tNode, stylingKey, isClassBased);
      if (residual === null) {
        let templateStylingKey = getTemplateHeadTStylingKey(tData, tNode, isClassBased);
        if (templateStylingKey !== void 0 && Array.isArray(templateStylingKey)) {
          templateStylingKey = collectStylingFromDirectives(null, tData, tNode, templateStylingKey[1], isClassBased);
          templateStylingKey = collectStylingFromTAttrs(templateStylingKey, tNode.attrs, isClassBased);
          setTemplateHeadTStylingKey(tData, tNode, isClassBased, templateStylingKey);
        }
      } else {
        residual = collectResidual(tData, tNode, isClassBased);
      }
    }
  }
  if (residual !== void 0) {
    isClassBased ? tNode.residualClasses = residual : tNode.residualStyles = residual;
  }
  return stylingKey;
}
function getTemplateHeadTStylingKey(tData, tNode, isClassBased) {
  const bindings = isClassBased ? tNode.classBindings : tNode.styleBindings;
  if (getTStylingRangeNext(bindings) === 0) {
    return void 0;
  }
  return tData[getTStylingRangePrev(bindings)];
}
function setTemplateHeadTStylingKey(tData, tNode, isClassBased, tStylingKey) {
  const bindings = isClassBased ? tNode.classBindings : tNode.styleBindings;
  ngDevMode && assertNotEqual(getTStylingRangeNext(bindings), 0, "Expecting to have at least one template styling binding.");
  tData[getTStylingRangePrev(bindings)] = tStylingKey;
}
function collectResidual(tData, tNode, isClassBased) {
  let residual = void 0;
  const directiveEnd = tNode.directiveEnd;
  ngDevMode && assertNotEqual(tNode.directiveStylingLast, -1, "By the time this function gets called at least one hostBindings-node styling instruction must have executed.");
  for (let i = 1 + tNode.directiveStylingLast; i < directiveEnd; i++) {
    const attrs = tData[i].hostAttrs;
    residual = collectStylingFromTAttrs(residual, attrs, isClassBased);
  }
  return collectStylingFromTAttrs(residual, tNode.attrs, isClassBased);
}
function collectStylingFromDirectives(hostDirectiveDef, tData, tNode, stylingKey, isClassBased) {
  let currentDirective = null;
  const directiveEnd = tNode.directiveEnd;
  let directiveStylingLast = tNode.directiveStylingLast;
  if (directiveStylingLast === -1) {
    directiveStylingLast = tNode.directiveStart;
  } else {
    directiveStylingLast++;
  }
  while (directiveStylingLast < directiveEnd) {
    currentDirective = tData[directiveStylingLast];
    ngDevMode && assertDefined(currentDirective, "expected to be defined");
    stylingKey = collectStylingFromTAttrs(stylingKey, currentDirective.hostAttrs, isClassBased);
    if (currentDirective === hostDirectiveDef)
      break;
    directiveStylingLast++;
  }
  if (hostDirectiveDef !== null) {
    tNode.directiveStylingLast = directiveStylingLast;
  }
  return stylingKey;
}
function collectStylingFromTAttrs(stylingKey, attrs, isClassBased) {
  const desiredMarker = isClassBased ? 1 : 2;
  let currentMarker = -1;
  if (attrs !== null) {
    for (let i = 0; i < attrs.length; i++) {
      const item = attrs[i];
      if (typeof item === "number") {
        currentMarker = item;
      } else {
        if (currentMarker === desiredMarker) {
          if (!Array.isArray(stylingKey)) {
            stylingKey = stylingKey === void 0 ? [] : ["", stylingKey];
          }
          keyValueArraySet(stylingKey, item, isClassBased ? true : attrs[++i]);
        }
      }
    }
  }
  return stylingKey === void 0 ? null : stylingKey;
}
function toStylingKeyValueArray(keyValueArraySet2, stringParser, value) {
  if (value == null || value === "")
    return EMPTY_ARRAY;
  const styleKeyValueArray = [];
  const unwrappedValue = unwrapSafeValue(value);
  if (Array.isArray(unwrappedValue)) {
    for (let i = 0; i < unwrappedValue.length; i++) {
      keyValueArraySet2(styleKeyValueArray, unwrappedValue[i], true);
    }
  } else if (typeof unwrappedValue === "object") {
    for (const key in unwrappedValue) {
      if (unwrappedValue.hasOwnProperty(key)) {
        keyValueArraySet2(styleKeyValueArray, key, unwrappedValue[key]);
      }
    }
  } else if (typeof unwrappedValue === "string") {
    stringParser(styleKeyValueArray, unwrappedValue);
  } else {
    ngDevMode && throwError("Unsupported styling type " + typeof unwrappedValue + ": " + unwrappedValue);
  }
  return styleKeyValueArray;
}
function styleKeyValueArraySet(keyValueArray, key, value) {
  keyValueArraySet(keyValueArray, key, unwrapSafeValue(value));
}
function updateStylingMap(tView, tNode, lView, renderer, oldKeyValueArray, newKeyValueArray, isClassBased, bindingIndex) {
  if (oldKeyValueArray === NO_CHANGE) {
    oldKeyValueArray = EMPTY_ARRAY;
  }
  let oldIndex = 0;
  let newIndex = 0;
  let oldKey = 0 < oldKeyValueArray.length ? oldKeyValueArray[0] : null;
  let newKey = 0 < newKeyValueArray.length ? newKeyValueArray[0] : null;
  while (oldKey !== null || newKey !== null) {
    ngDevMode && assertLessThan(oldIndex, 999, "Are we stuck in infinite loop?");
    ngDevMode && assertLessThan(newIndex, 999, "Are we stuck in infinite loop?");
    const oldValue = oldIndex < oldKeyValueArray.length ? oldKeyValueArray[oldIndex + 1] : void 0;
    const newValue = newIndex < newKeyValueArray.length ? newKeyValueArray[newIndex + 1] : void 0;
    let setKey = null;
    let setValue = void 0;
    if (oldKey === newKey) {
      oldIndex += 2;
      newIndex += 2;
      if (oldValue !== newValue) {
        setKey = newKey;
        setValue = newValue;
      }
    } else if (newKey === null || oldKey !== null && oldKey < newKey) {
      oldIndex += 2;
      setKey = oldKey;
    } else {
      ngDevMode && assertDefined(newKey, "Expecting to have a valid key");
      newIndex += 2;
      setKey = newKey;
      setValue = newValue;
    }
    if (setKey !== null) {
      updateStyling(tView, tNode, lView, renderer, setKey, setValue, isClassBased, bindingIndex);
    }
    oldKey = oldIndex < oldKeyValueArray.length ? oldKeyValueArray[oldIndex] : null;
    newKey = newIndex < newKeyValueArray.length ? newKeyValueArray[newIndex] : null;
  }
}
function updateStyling(tView, tNode, lView, renderer, prop, value, isClassBased, bindingIndex) {
  if (!(tNode.type & 3)) {
    return;
  }
  const tData = tView.data;
  const tRange = tData[bindingIndex + 1];
  const higherPriorityValue = getTStylingRangeNextDuplicate(tRange) ? findStylingValue(tData, tNode, lView, prop, getTStylingRangeNext(tRange), isClassBased) : void 0;
  if (!isStylingValuePresent(higherPriorityValue)) {
    if (!isStylingValuePresent(value)) {
      if (getTStylingRangePrevDuplicate(tRange)) {
        value = findStylingValue(tData, null, lView, prop, bindingIndex, isClassBased);
      }
    }
    const rNode = getNativeByIndex(getSelectedIndex(), lView);
    applyStyling(renderer, isClassBased, rNode, prop, value);
  }
}
function findStylingValue(tData, tNode, lView, prop, index, isClassBased) {
  const isPrevDirection = tNode === null;
  let value = void 0;
  while (index > 0) {
    const rawKey = tData[index];
    const containsStatics = Array.isArray(rawKey);
    const key = containsStatics ? rawKey[1] : rawKey;
    const isStylingMap = key === null;
    let valueAtLViewIndex = lView[index + 1];
    if (valueAtLViewIndex === NO_CHANGE) {
      valueAtLViewIndex = isStylingMap ? EMPTY_ARRAY : void 0;
    }
    let currentValue = isStylingMap ? keyValueArrayGet(valueAtLViewIndex, prop) : key === prop ? valueAtLViewIndex : void 0;
    if (containsStatics && !isStylingValuePresent(currentValue)) {
      currentValue = keyValueArrayGet(rawKey, prop);
    }
    if (isStylingValuePresent(currentValue)) {
      value = currentValue;
      if (isPrevDirection) {
        return value;
      }
    }
    const tRange = tData[index + 1];
    index = isPrevDirection ? getTStylingRangePrev(tRange) : getTStylingRangeNext(tRange);
  }
  if (tNode !== null) {
    let residual = isClassBased ? tNode.residualClasses : tNode.residualStyles;
    if (residual != null) {
      value = keyValueArrayGet(residual, prop);
    }
  }
  return value;
}
function isStylingValuePresent(value) {
  return value !== void 0;
}
function normalizeSuffix(value, suffix) {
  if (value == null) ;
  else if (typeof suffix === "string") {
    value = value + suffix;
  } else if (typeof value === "object") {
    value = stringify(unwrapSafeValue(value));
  }
  return value;
}
function hasStylingInputShadow(tNode, isClassBased) {
  return (tNode.flags & (isClassBased ? 16 : 32)) !== 0;
}
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
function ɵɵtext(index, value = "") {
  const lView = getLView();
  const tView = getTView();
  const adjustedIndex = index + HEADER_OFFSET;
  ngDevMode && assertEqual(getBindingIndex(), tView.bindingStartIndex, "text nodes should be created before any bindings");
  ngDevMode && assertIndexInRange(lView, adjustedIndex);
  const tNode = tView.firstCreatePass ? getOrCreateTNode(tView, adjustedIndex, 1, value, null) : tView.data[adjustedIndex];
  const textNative = lView[adjustedIndex] = createTextNode(lView[RENDERER], value);
  appendChild(tView, lView, textNative, tNode);
  setCurrentTNode(tNode, false);
}
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
function ɵɵtextInterpolate(v0) {
  ɵɵtextInterpolate1("", v0, "");
  return ɵɵtextInterpolate;
}
function ɵɵtextInterpolate1(prefix, v0, suffix) {
  const lView = getLView();
  const interpolated = interpolation1(lView, prefix, v0, suffix);
  if (interpolated !== NO_CHANGE) {
    textBindingInternal(lView, getSelectedIndex(), interpolated);
  }
  return ɵɵtextInterpolate1;
}
function ɵɵtextInterpolate2(prefix, v0, i02, v1, suffix) {
  const lView = getLView();
  const interpolated = interpolation2(lView, prefix, v0, i02, v1, suffix);
  if (interpolated !== NO_CHANGE) {
    textBindingInternal(lView, getSelectedIndex(), interpolated);
  }
  return ɵɵtextInterpolate2;
}
function ɵɵtextInterpolate3(prefix, v0, i02, v1, i1, v2, suffix) {
  const lView = getLView();
  const interpolated = interpolation3(lView, prefix, v0, i02, v1, i1, v2, suffix);
  if (interpolated !== NO_CHANGE) {
    textBindingInternal(lView, getSelectedIndex(), interpolated);
  }
  return ɵɵtextInterpolate3;
}
function ɵɵtextInterpolate4(prefix, v0, i02, v1, i1, v2, i2, v3, suffix) {
  const lView = getLView();
  const interpolated = interpolation4(lView, prefix, v0, i02, v1, i1, v2, i2, v3, suffix);
  if (interpolated !== NO_CHANGE) {
    textBindingInternal(lView, getSelectedIndex(), interpolated);
  }
  return ɵɵtextInterpolate4;
}
function ɵɵtextInterpolate5(prefix, v0, i02, v1, i1, v2, i2, v3, i3, v4, suffix) {
  const lView = getLView();
  const interpolated = interpolation5(lView, prefix, v0, i02, v1, i1, v2, i2, v3, i3, v4, suffix);
  if (interpolated !== NO_CHANGE) {
    textBindingInternal(lView, getSelectedIndex(), interpolated);
  }
  return ɵɵtextInterpolate5;
}
function ɵɵtextInterpolate6(prefix, v0, i02, v1, i1, v2, i2, v3, i3, v4, i4, v5, suffix) {
  const lView = getLView();
  const interpolated = interpolation6(lView, prefix, v0, i02, v1, i1, v2, i2, v3, i3, v4, i4, v5, suffix);
  if (interpolated !== NO_CHANGE) {
    textBindingInternal(lView, getSelectedIndex(), interpolated);
  }
  return ɵɵtextInterpolate6;
}
function ɵɵtextInterpolate7(prefix, v0, i02, v1, i1, v2, i2, v3, i3, v4, i4, v5, i5, v6, suffix) {
  const lView = getLView();
  const interpolated = interpolation7(lView, prefix, v0, i02, v1, i1, v2, i2, v3, i3, v4, i4, v5, i5, v6, suffix);
  if (interpolated !== NO_CHANGE) {
    textBindingInternal(lView, getSelectedIndex(), interpolated);
  }
  return ɵɵtextInterpolate7;
}
function ɵɵtextInterpolate8(prefix, v0, i02, v1, i1, v2, i2, v3, i3, v4, i4, v5, i5, v6, i6, v7, suffix) {
  const lView = getLView();
  const interpolated = interpolation8(lView, prefix, v0, i02, v1, i1, v2, i2, v3, i3, v4, i4, v5, i5, v6, i6, v7, suffix);
  if (interpolated !== NO_CHANGE) {
    textBindingInternal(lView, getSelectedIndex(), interpolated);
  }
  return ɵɵtextInterpolate8;
}
function ɵɵtextInterpolateV(values) {
  const lView = getLView();
  const interpolated = interpolationV(lView, values);
  if (interpolated !== NO_CHANGE) {
    textBindingInternal(lView, getSelectedIndex(), interpolated);
  }
  return ɵɵtextInterpolateV;
}
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
function ɵɵclassMapInterpolate1(prefix, v0, suffix) {
  const lView = getLView();
  const interpolatedValue = interpolation1(lView, prefix, v0, suffix);
  checkStylingMap(keyValueArraySet, classStringParser, interpolatedValue, true);
}
function ɵɵclassMapInterpolate2(prefix, v0, i02, v1, suffix) {
  const lView = getLView();
  const interpolatedValue = interpolation2(lView, prefix, v0, i02, v1, suffix);
  checkStylingMap(keyValueArraySet, classStringParser, interpolatedValue, true);
}
function ɵɵclassMapInterpolate3(prefix, v0, i02, v1, i1, v2, suffix) {
  const lView = getLView();
  const interpolatedValue = interpolation3(lView, prefix, v0, i02, v1, i1, v2, suffix);
  checkStylingMap(keyValueArraySet, classStringParser, interpolatedValue, true);
}
function ɵɵclassMapInterpolate4(prefix, v0, i02, v1, i1, v2, i2, v3, suffix) {
  const lView = getLView();
  const interpolatedValue = interpolation4(lView, prefix, v0, i02, v1, i1, v2, i2, v3, suffix);
  checkStylingMap(keyValueArraySet, classStringParser, interpolatedValue, true);
}
function ɵɵclassMapInterpolate5(prefix, v0, i02, v1, i1, v2, i2, v3, i3, v4, suffix) {
  const lView = getLView();
  const interpolatedValue = interpolation5(lView, prefix, v0, i02, v1, i1, v2, i2, v3, i3, v4, suffix);
  checkStylingMap(keyValueArraySet, classStringParser, interpolatedValue, true);
}
function ɵɵclassMapInterpolate6(prefix, v0, i02, v1, i1, v2, i2, v3, i3, v4, i4, v5, suffix) {
  const lView = getLView();
  const interpolatedValue = interpolation6(lView, prefix, v0, i02, v1, i1, v2, i2, v3, i3, v4, i4, v5, suffix);
  checkStylingMap(keyValueArraySet, classStringParser, interpolatedValue, true);
}
function ɵɵclassMapInterpolate7(prefix, v0, i02, v1, i1, v2, i2, v3, i3, v4, i4, v5, i5, v6, suffix) {
  const lView = getLView();
  const interpolatedValue = interpolation7(lView, prefix, v0, i02, v1, i1, v2, i2, v3, i3, v4, i4, v5, i5, v6, suffix);
  checkStylingMap(keyValueArraySet, classStringParser, interpolatedValue, true);
}
function ɵɵclassMapInterpolate8(prefix, v0, i02, v1, i1, v2, i2, v3, i3, v4, i4, v5, i5, v6, i6, v7, suffix) {
  const lView = getLView();
  const interpolatedValue = interpolation8(lView, prefix, v0, i02, v1, i1, v2, i2, v3, i3, v4, i4, v5, i5, v6, i6, v7, suffix);
  checkStylingMap(keyValueArraySet, classStringParser, interpolatedValue, true);
}
function ɵɵclassMapInterpolateV(values) {
  const lView = getLView();
  const interpolatedValue = interpolationV(lView, values);
  checkStylingMap(keyValueArraySet, classStringParser, interpolatedValue, true);
}
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
function ɵɵstyleMapInterpolate1(prefix, v0, suffix) {
  const lView = getLView();
  const interpolatedValue = interpolation1(lView, prefix, v0, suffix);
  ɵɵstyleMap(interpolatedValue);
}
function ɵɵstyleMapInterpolate2(prefix, v0, i02, v1, suffix) {
  const lView = getLView();
  const interpolatedValue = interpolation2(lView, prefix, v0, i02, v1, suffix);
  ɵɵstyleMap(interpolatedValue);
}
function ɵɵstyleMapInterpolate3(prefix, v0, i02, v1, i1, v2, suffix) {
  const lView = getLView();
  const interpolatedValue = interpolation3(lView, prefix, v0, i02, v1, i1, v2, suffix);
  ɵɵstyleMap(interpolatedValue);
}
function ɵɵstyleMapInterpolate4(prefix, v0, i02, v1, i1, v2, i2, v3, suffix) {
  const lView = getLView();
  const interpolatedValue = interpolation4(lView, prefix, v0, i02, v1, i1, v2, i2, v3, suffix);
  ɵɵstyleMap(interpolatedValue);
}
function ɵɵstyleMapInterpolate5(prefix, v0, i02, v1, i1, v2, i2, v3, i3, v4, suffix) {
  const lView = getLView();
  const interpolatedValue = interpolation5(lView, prefix, v0, i02, v1, i1, v2, i2, v3, i3, v4, suffix);
  ɵɵstyleMap(interpolatedValue);
}
function ɵɵstyleMapInterpolate6(prefix, v0, i02, v1, i1, v2, i2, v3, i3, v4, i4, v5, suffix) {
  const lView = getLView();
  const interpolatedValue = interpolation6(lView, prefix, v0, i02, v1, i1, v2, i2, v3, i3, v4, i4, v5, suffix);
  ɵɵstyleMap(interpolatedValue);
}
function ɵɵstyleMapInterpolate7(prefix, v0, i02, v1, i1, v2, i2, v3, i3, v4, i4, v5, i5, v6, suffix) {
  const lView = getLView();
  const interpolatedValue = interpolation7(lView, prefix, v0, i02, v1, i1, v2, i2, v3, i3, v4, i4, v5, i5, v6, suffix);
  ɵɵstyleMap(interpolatedValue);
}
function ɵɵstyleMapInterpolate8(prefix, v0, i02, v1, i1, v2, i2, v3, i3, v4, i4, v5, i5, v6, i6, v7, suffix) {
  const lView = getLView();
  const interpolatedValue = interpolation8(lView, prefix, v0, i02, v1, i1, v2, i2, v3, i3, v4, i4, v5, i5, v6, i6, v7, suffix);
  ɵɵstyleMap(interpolatedValue);
}
function ɵɵstyleMapInterpolateV(values) {
  const lView = getLView();
  const interpolatedValue = interpolationV(lView, values);
  ɵɵstyleMap(interpolatedValue);
}
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
function ɵɵstylePropInterpolate1(prop, prefix, v0, suffix, valueSuffix) {
  const lView = getLView();
  const interpolatedValue = interpolation1(lView, prefix, v0, suffix);
  checkStylingProperty(prop, interpolatedValue, valueSuffix, false);
  return ɵɵstylePropInterpolate1;
}
function ɵɵstylePropInterpolate2(prop, prefix, v0, i02, v1, suffix, valueSuffix) {
  const lView = getLView();
  const interpolatedValue = interpolation2(lView, prefix, v0, i02, v1, suffix);
  checkStylingProperty(prop, interpolatedValue, valueSuffix, false);
  return ɵɵstylePropInterpolate2;
}
function ɵɵstylePropInterpolate3(prop, prefix, v0, i02, v1, i1, v2, suffix, valueSuffix) {
  const lView = getLView();
  const interpolatedValue = interpolation3(lView, prefix, v0, i02, v1, i1, v2, suffix);
  checkStylingProperty(prop, interpolatedValue, valueSuffix, false);
  return ɵɵstylePropInterpolate3;
}
function ɵɵstylePropInterpolate4(prop, prefix, v0, i02, v1, i1, v2, i2, v3, suffix, valueSuffix) {
  const lView = getLView();
  const interpolatedValue = interpolation4(lView, prefix, v0, i02, v1, i1, v2, i2, v3, suffix);
  checkStylingProperty(prop, interpolatedValue, valueSuffix, false);
  return ɵɵstylePropInterpolate4;
}
function ɵɵstylePropInterpolate5(prop, prefix, v0, i02, v1, i1, v2, i2, v3, i3, v4, suffix, valueSuffix) {
  const lView = getLView();
  const interpolatedValue = interpolation5(lView, prefix, v0, i02, v1, i1, v2, i2, v3, i3, v4, suffix);
  checkStylingProperty(prop, interpolatedValue, valueSuffix, false);
  return ɵɵstylePropInterpolate5;
}
function ɵɵstylePropInterpolate6(prop, prefix, v0, i02, v1, i1, v2, i2, v3, i3, v4, i4, v5, suffix, valueSuffix) {
  const lView = getLView();
  const interpolatedValue = interpolation6(lView, prefix, v0, i02, v1, i1, v2, i2, v3, i3, v4, i4, v5, suffix);
  checkStylingProperty(prop, interpolatedValue, valueSuffix, false);
  return ɵɵstylePropInterpolate6;
}
function ɵɵstylePropInterpolate7(prop, prefix, v0, i02, v1, i1, v2, i2, v3, i3, v4, i4, v5, i5, v6, suffix, valueSuffix) {
  const lView = getLView();
  const interpolatedValue = interpolation7(lView, prefix, v0, i02, v1, i1, v2, i2, v3, i3, v4, i4, v5, i5, v6, suffix);
  checkStylingProperty(prop, interpolatedValue, valueSuffix, false);
  return ɵɵstylePropInterpolate7;
}
function ɵɵstylePropInterpolate8(prop, prefix, v0, i02, v1, i1, v2, i2, v3, i3, v4, i4, v5, i5, v6, i6, v7, suffix, valueSuffix) {
  const lView = getLView();
  const interpolatedValue = interpolation8(lView, prefix, v0, i02, v1, i1, v2, i2, v3, i3, v4, i4, v5, i5, v6, i6, v7, suffix);
  checkStylingProperty(prop, interpolatedValue, valueSuffix, false);
  return ɵɵstylePropInterpolate8;
}
function ɵɵstylePropInterpolateV(prop, values, valueSuffix) {
  const lView = getLView();
  const interpolatedValue = interpolationV(lView, values);
  checkStylingProperty(prop, interpolatedValue, valueSuffix, false);
  return ɵɵstylePropInterpolateV;
}
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
function ɵɵhostProperty(propName, value, sanitizer) {
  const lView = getLView();
  const bindingIndex = nextBindingIndex();
  if (bindingUpdated(lView, bindingIndex, value)) {
    const tView = getTView();
    const tNode = getSelectedTNode();
    elementPropertyInternal(tView, tNode, lView, propName, value, lView[RENDERER], sanitizer, true);
    ngDevMode && storePropertyBindingMetadata(tView.data, tNode, propName, bindingIndex);
  }
  return ɵɵhostProperty;
}
function ɵɵsyntheticHostProperty(propName, value, sanitizer) {
  const lView = getLView();
  const bindingIndex = nextBindingIndex();
  if (bindingUpdated(lView, bindingIndex, value)) {
    const tView = getTView();
    const tNode = getSelectedTNode();
    const currentDef = getCurrentDirectiveDef(tView.data);
    const renderer = loadComponentRenderer(currentDef, tNode, lView);
    elementPropertyInternal(tView, tNode, lView, propName, value, renderer, sanitizer, true);
    ngDevMode && storePropertyBindingMetadata(tView.data, tNode, propName, bindingIndex);
  }
  return ɵɵsyntheticHostProperty;
}
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
if (typeof ngI18nClosureMode === "undefined") {
  (function() {
    _global["ngI18nClosureMode"] = // TODO(FW-1250): validate that this actually, you know, works.
    // tslint:disable-next-line:no-toplevel-property-access
    typeof goog !== "undefined" && typeof goog.getMsg === "function";
  })();
}
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
const u = void 0;
function plural(val) {
  const i = Math.floor(Math.abs(val)), v = val.toString().replace(/^[^.]*\.?/, "").length;
  if (i === 1 && v === 0)
    return 1;
  return 5;
}
var localeEn = ["en", [["a", "p"], ["AM", "PM"], u], [["AM", "PM"], u, u], [["S", "M", "T", "W", "T", "F", "S"], ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"], ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"], ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"]], u, [["J", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D"], ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"], ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]], u, [["B", "A"], ["BC", "AD"], ["Before Christ", "Anno Domini"]], 0, [6, 0], ["M/d/yy", "MMM d, y", "MMMM d, y", "EEEE, MMMM d, y"], ["h:mm a", "h:mm:ss a", "h:mm:ss a z", "h:mm:ss a zzzz"], ["{1}, {0}", u, "{1} 'at' {0}", u], [".", ",", ";", "%", "+", "-", "E", "×", "‰", "∞", "NaN", ":"], ["#,##0.###", "#,##0%", "¤#,##0.00", "#E0"], "USD", "$", "US Dollar", {}, "ltr", plural];
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
let LOCALE_DATA = {};
function registerLocaleData(data, localeId, extraData) {
  if (typeof localeId !== "string") {
    extraData = localeId;
    localeId = data[LocaleDataIndex.LocaleId];
  }
  localeId = localeId.toLowerCase().replace(/_/g, "-");
  LOCALE_DATA[localeId] = data;
  if (extraData) {
    LOCALE_DATA[localeId][LocaleDataIndex.ExtraData] = extraData;
  }
}
function findLocaleData(locale) {
  const normalizedLocale = normalizeLocale(locale);
  let match = getLocaleData(normalizedLocale);
  if (match) {
    return match;
  }
  const parentLocale = normalizedLocale.split("-")[0];
  match = getLocaleData(parentLocale);
  if (match) {
    return match;
  }
  if (parentLocale === "en") {
    return localeEn;
  }
  throw new Error(`Missing locale data for the locale "${locale}".`);
}
function getLocaleCurrencyCode(locale) {
  const data = findLocaleData(locale);
  return data[LocaleDataIndex.CurrencyCode] || null;
}
function getLocalePluralCase$1(locale) {
  const data = findLocaleData(locale);
  return data[LocaleDataIndex.PluralCase];
}
function getLocaleData(normalizedLocale) {
  if (!(normalizedLocale in LOCALE_DATA)) {
    LOCALE_DATA[normalizedLocale] = _global.ng && _global.ng.common && _global.ng.common.locales && _global.ng.common.locales[normalizedLocale];
  }
  return LOCALE_DATA[normalizedLocale];
}
function unregisterAllLocaleData() {
  LOCALE_DATA = {};
}
var LocaleDataIndex;
(function(LocaleDataIndex2) {
  LocaleDataIndex2[LocaleDataIndex2["LocaleId"] = 0] = "LocaleId";
  LocaleDataIndex2[LocaleDataIndex2["DayPeriodsFormat"] = 1] = "DayPeriodsFormat";
  LocaleDataIndex2[LocaleDataIndex2["DayPeriodsStandalone"] = 2] = "DayPeriodsStandalone";
  LocaleDataIndex2[LocaleDataIndex2["DaysFormat"] = 3] = "DaysFormat";
  LocaleDataIndex2[LocaleDataIndex2["DaysStandalone"] = 4] = "DaysStandalone";
  LocaleDataIndex2[LocaleDataIndex2["MonthsFormat"] = 5] = "MonthsFormat";
  LocaleDataIndex2[LocaleDataIndex2["MonthsStandalone"] = 6] = "MonthsStandalone";
  LocaleDataIndex2[LocaleDataIndex2["Eras"] = 7] = "Eras";
  LocaleDataIndex2[LocaleDataIndex2["FirstDayOfWeek"] = 8] = "FirstDayOfWeek";
  LocaleDataIndex2[LocaleDataIndex2["WeekendRange"] = 9] = "WeekendRange";
  LocaleDataIndex2[LocaleDataIndex2["DateFormat"] = 10] = "DateFormat";
  LocaleDataIndex2[LocaleDataIndex2["TimeFormat"] = 11] = "TimeFormat";
  LocaleDataIndex2[LocaleDataIndex2["DateTimeFormat"] = 12] = "DateTimeFormat";
  LocaleDataIndex2[LocaleDataIndex2["NumberSymbols"] = 13] = "NumberSymbols";
  LocaleDataIndex2[LocaleDataIndex2["NumberFormats"] = 14] = "NumberFormats";
  LocaleDataIndex2[LocaleDataIndex2["CurrencyCode"] = 15] = "CurrencyCode";
  LocaleDataIndex2[LocaleDataIndex2["CurrencySymbol"] = 16] = "CurrencySymbol";
  LocaleDataIndex2[LocaleDataIndex2["CurrencyName"] = 17] = "CurrencyName";
  LocaleDataIndex2[LocaleDataIndex2["Currencies"] = 18] = "Currencies";
  LocaleDataIndex2[LocaleDataIndex2["Directionality"] = 19] = "Directionality";
  LocaleDataIndex2[LocaleDataIndex2["PluralCase"] = 20] = "PluralCase";
  LocaleDataIndex2[LocaleDataIndex2["ExtraData"] = 21] = "ExtraData";
})(LocaleDataIndex || (LocaleDataIndex = {}));
function normalizeLocale(locale) {
  return locale.toLowerCase().replace(/_/g, "-");
}
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
const pluralMapping = ["zero", "one", "two", "few", "many"];
function getPluralCase(value, locale) {
  const plural2 = getLocalePluralCase$1(locale)(parseInt(value, 10));
  const result = pluralMapping[plural2];
  return result !== void 0 ? result : "other";
}
const DEFAULT_LOCALE_ID = "en-US";
const USD_CURRENCY_CODE = "USD";
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
const ELEMENT_MARKER = {
  marker: "element"
};
const ICU_MARKER = {
  marker: "ICU"
};
var I18nCreateOpCode;
(function(I18nCreateOpCode2) {
  I18nCreateOpCode2[I18nCreateOpCode2["SHIFT"] = 2] = "SHIFT";
  I18nCreateOpCode2[I18nCreateOpCode2["APPEND_EAGERLY"] = 1] = "APPEND_EAGERLY";
  I18nCreateOpCode2[I18nCreateOpCode2["COMMENT"] = 2] = "COMMENT";
})(I18nCreateOpCode || (I18nCreateOpCode = {}));
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
let LOCALE_ID$1 = DEFAULT_LOCALE_ID;
function setLocaleId(localeId) {
  assertDefined(localeId, `Expected localeId to be defined`);
  if (typeof localeId === "string") {
    LOCALE_ID$1 = localeId.toLowerCase().replace(/_/g, "-");
  }
}
function getLocaleId$1() {
  return LOCALE_ID$1;
}
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
function getInsertInFrontOfRNodeWithI18n(parentTNode, currentTNode, lView) {
  const tNodeInsertBeforeIndex = currentTNode.insertBeforeIndex;
  const insertBeforeIndex = Array.isArray(tNodeInsertBeforeIndex) ? tNodeInsertBeforeIndex[0] : tNodeInsertBeforeIndex;
  if (insertBeforeIndex === null) {
    return getInsertInFrontOfRNodeWithNoI18n(parentTNode, currentTNode, lView);
  } else {
    ngDevMode && assertIndexInRange(lView, insertBeforeIndex);
    return unwrapRNode(lView[insertBeforeIndex]);
  }
}
function processI18nInsertBefore(renderer, childTNode, lView, childRNode, parentRElement) {
  const tNodeInsertBeforeIndex = childTNode.insertBeforeIndex;
  if (Array.isArray(tNodeInsertBeforeIndex)) {
    ngDevMode && assertDomNode(childRNode);
    let i18nParent = childRNode;
    let anchorRNode = null;
    if (!(childTNode.type & 3)) {
      anchorRNode = i18nParent;
      i18nParent = parentRElement;
    }
    if (i18nParent !== null && (childTNode.flags & 2) === 0) {
      for (let i = 1; i < tNodeInsertBeforeIndex.length; i++) {
        const i18nChild = lView[tNodeInsertBeforeIndex[i]];
        nativeInsertBefore(renderer, i18nParent, i18nChild, anchorRNode, false);
      }
    }
  }
}
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
function addTNodeAndUpdateInsertBeforeIndex(previousTNodes, newTNode) {
  ngDevMode && assertEqual(newTNode.insertBeforeIndex, null, "We expect that insertBeforeIndex is not set");
  previousTNodes.push(newTNode);
  if (previousTNodes.length > 1) {
    for (let i = previousTNodes.length - 2; i >= 0; i--) {
      const existingTNode = previousTNodes[i];
      if (!isI18nText(existingTNode)) {
        if (isNewTNodeCreatedBefore(existingTNode, newTNode) && getInsertBeforeIndex(existingTNode) === null) {
          setInsertBeforeIndex(existingTNode, newTNode.index);
        }
      }
    }
  }
}
function isI18nText(tNode) {
  return !(tNode.type & 64);
}
function isNewTNodeCreatedBefore(existingTNode, newTNode) {
  return isI18nText(newTNode) || existingTNode.index > newTNode.index;
}
function getInsertBeforeIndex(tNode) {
  const index = tNode.insertBeforeIndex;
  return Array.isArray(index) ? index[0] : index;
}
function setInsertBeforeIndex(tNode, value) {
  const index = tNode.insertBeforeIndex;
  if (Array.isArray(index)) {
    index[0] = value;
  } else {
    setI18nHandling(getInsertInFrontOfRNodeWithI18n, processI18nInsertBefore);
    tNode.insertBeforeIndex = value;
  }
}
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
function getTIcu(tView, index) {
  const value = tView.data[index];
  if (value === null || typeof value === "string")
    return null;
  if (ngDevMode && !(value.hasOwnProperty("tViews") || value.hasOwnProperty("currentCaseLViewIndex"))) {
    throwError("We expect to get 'null'|'TIcu'|'TIcuContainer', but got: " + value);
  }
  const tIcu = value.hasOwnProperty("currentCaseLViewIndex") ? value : value.value;
  ngDevMode && assertTIcu(tIcu);
  return tIcu;
}
function setTIcu(tView, index, tIcu) {
  const tNode = tView.data[index];
  ngDevMode && assertEqual(tNode === null || tNode.hasOwnProperty("tViews"), true, "We expect to get 'null'|'TIcuContainer'");
  if (tNode === null) {
    tView.data[index] = tIcu;
  } else {
    ngDevMode && assertTNodeType(
      tNode,
      32
      /* Icu */
    );
    tNode.value = tIcu;
  }
}
function setTNodeInsertBeforeIndex(tNode, index) {
  ngDevMode && assertTNode(tNode);
  let insertBeforeIndex = tNode.insertBeforeIndex;
  if (insertBeforeIndex === null) {
    setI18nHandling(getInsertInFrontOfRNodeWithI18n, processI18nInsertBefore);
    insertBeforeIndex = tNode.insertBeforeIndex = [null, index];
  } else {
    assertEqual(Array.isArray(insertBeforeIndex), true, "Expecting array here");
    insertBeforeIndex.push(index);
  }
}
function createTNodePlaceholder(tView, previousTNodes, index) {
  const tNode = createTNodeAtIndex(tView, index, 64, null, null);
  addTNodeAndUpdateInsertBeforeIndex(previousTNodes, tNode);
  return tNode;
}
function getCurrentICUCaseIndex(tIcu, lView) {
  const currentCase = lView[tIcu.currentCaseLViewIndex];
  return currentCase === null ? currentCase : currentCase < 0 ? ~currentCase : currentCase;
}
function getParentFromIcuCreateOpCode(mergedCode) {
  return mergedCode >>> 17;
}
function getRefFromIcuCreateOpCode(mergedCode) {
  return (mergedCode & 131070) >>> 1;
}
function getInstructionFromIcuCreateOpCode(mergedCode) {
  return mergedCode & 1;
}
function icuCreateOpCode(opCode, parentIdx, refIdx) {
  ngDevMode && assertGreaterThanOrEqual(parentIdx, 0, "Missing parent index");
  ngDevMode && assertGreaterThan(refIdx, 0, "Missing ref index");
  return opCode | parentIdx << 17 | refIdx << 1;
}
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
let changeMask = 0;
let changeMaskCounter = 0;
function setMaskBit(hasChange) {
  if (hasChange) {
    changeMask = changeMask | 1 << Math.min(changeMaskCounter, 31);
  }
  changeMaskCounter++;
}
function applyI18n(tView, lView, index) {
  if (changeMaskCounter > 0) {
    ngDevMode && assertDefined(tView, `tView should be defined`);
    const tI18n = tView.data[index];
    const updateOpCodes = Array.isArray(tI18n) ? tI18n : tI18n.update;
    const bindingsStartIndex = getBindingIndex() - changeMaskCounter - 1;
    applyUpdateOpCodes(tView, lView, updateOpCodes, bindingsStartIndex, changeMask);
  }
  changeMask = 0;
  changeMaskCounter = 0;
}
function applyCreateOpCodes(lView, createOpCodes, parentRNode, insertInFrontOf) {
  const renderer = lView[RENDERER];
  for (let i = 0; i < createOpCodes.length; i++) {
    const opCode = createOpCodes[i++];
    const text = createOpCodes[i];
    const isComment = (opCode & I18nCreateOpCode.COMMENT) === I18nCreateOpCode.COMMENT;
    const appendNow = (opCode & I18nCreateOpCode.APPEND_EAGERLY) === I18nCreateOpCode.APPEND_EAGERLY;
    const index = opCode >>> I18nCreateOpCode.SHIFT;
    let rNode = lView[index];
    if (rNode === null) {
      rNode = lView[index] = isComment ? renderer.createComment(text) : createTextNode(renderer, text);
    }
    if (appendNow && parentRNode !== null) {
      nativeInsertBefore(renderer, parentRNode, rNode, insertInFrontOf, false);
    }
  }
}
function applyMutableOpCodes(tView, mutableOpCodes, lView, anchorRNode) {
  ngDevMode && assertDomNode(anchorRNode);
  const renderer = lView[RENDERER];
  let rootIdx = null;
  let rootRNode;
  for (let i = 0; i < mutableOpCodes.length; i++) {
    const opCode = mutableOpCodes[i];
    if (typeof opCode == "string") {
      const textNodeIndex = mutableOpCodes[++i];
      if (lView[textNodeIndex] === null) {
        ngDevMode && ngDevMode.rendererCreateTextNode++;
        ngDevMode && assertIndexInRange(lView, textNodeIndex);
        lView[textNodeIndex] = createTextNode(renderer, opCode);
      }
    } else if (typeof opCode == "number") {
      switch (opCode & 1) {
        case 0:
          const parentIdx = getParentFromIcuCreateOpCode(opCode);
          if (rootIdx === null) {
            rootIdx = parentIdx;
            rootRNode = nativeParentNode(renderer, anchorRNode);
          }
          let insertInFrontOf;
          let parentRNode;
          if (parentIdx === rootIdx) {
            insertInFrontOf = anchorRNode;
            parentRNode = rootRNode;
          } else {
            insertInFrontOf = null;
            parentRNode = unwrapRNode(lView[parentIdx]);
          }
          if (parentRNode !== null) {
            ngDevMode && assertDomNode(parentRNode);
            const refIdx = getRefFromIcuCreateOpCode(opCode);
            ngDevMode && assertGreaterThan(refIdx, HEADER_OFFSET, "Missing ref");
            const child = lView[refIdx];
            ngDevMode && assertDomNode(child);
            nativeInsertBefore(renderer, parentRNode, child, insertInFrontOf, false);
            const tIcu = getTIcu(tView, refIdx);
            if (tIcu !== null && typeof tIcu === "object") {
              ngDevMode && assertTIcu(tIcu);
              const caseIndex = getCurrentICUCaseIndex(tIcu, lView);
              if (caseIndex !== null) {
                applyMutableOpCodes(tView, tIcu.create[caseIndex], lView, lView[tIcu.anchorIdx]);
              }
            }
          }
          break;
        case 1:
          const elementNodeIndex = opCode >>> 1;
          const attrName = mutableOpCodes[++i];
          const attrValue = mutableOpCodes[++i];
          setElementAttribute(renderer, getNativeByIndex(elementNodeIndex, lView), null, null, attrName, attrValue, null);
          break;
        default:
          if (ngDevMode) {
            throw new RuntimeError(700, `Unable to determine the type of mutate operation for "${opCode}"`);
          }
      }
    } else {
      switch (opCode) {
        case ICU_MARKER:
          const commentValue = mutableOpCodes[++i];
          const commentNodeIndex = mutableOpCodes[++i];
          if (lView[commentNodeIndex] === null) {
            ngDevMode && assertEqual(typeof commentValue, "string", `Expected "${commentValue}" to be a comment node value`);
            ngDevMode && ngDevMode.rendererCreateComment++;
            ngDevMode && assertIndexInExpandoRange(lView, commentNodeIndex);
            const commentRNode = lView[commentNodeIndex] = createCommentNode(renderer, commentValue);
            attachPatchData(commentRNode, lView);
          }
          break;
        case ELEMENT_MARKER:
          const tagName = mutableOpCodes[++i];
          const elementNodeIndex = mutableOpCodes[++i];
          if (lView[elementNodeIndex] === null) {
            ngDevMode && assertEqual(typeof tagName, "string", `Expected "${tagName}" to be an element node tag name`);
            ngDevMode && ngDevMode.rendererCreateElement++;
            ngDevMode && assertIndexInExpandoRange(lView, elementNodeIndex);
            const elementRNode = lView[elementNodeIndex] = createElementNode(renderer, tagName, null);
            attachPatchData(elementRNode, lView);
          }
          break;
        default:
          ngDevMode && throwError(`Unable to determine the type of mutate operation for "${opCode}"`);
      }
    }
  }
}
function applyUpdateOpCodes(tView, lView, updateOpCodes, bindingsStartIndex, changeMask2) {
  for (let i = 0; i < updateOpCodes.length; i++) {
    const checkBit = updateOpCodes[i];
    const skipCodes = updateOpCodes[++i];
    if (checkBit & changeMask2) {
      let value = "";
      for (let j = i + 1; j <= i + skipCodes; j++) {
        const opCode = updateOpCodes[j];
        if (typeof opCode == "string") {
          value += opCode;
        } else if (typeof opCode == "number") {
          if (opCode < 0) {
            value += renderStringify(lView[bindingsStartIndex - opCode]);
          } else {
            const nodeIndex = opCode >>> 2;
            switch (opCode & 3) {
              case 1:
                const propName = updateOpCodes[++j];
                const sanitizeFn = updateOpCodes[++j];
                const tNodeOrTagName = tView.data[nodeIndex];
                ngDevMode && assertDefined(tNodeOrTagName, "Experting TNode or string");
                if (typeof tNodeOrTagName === "string") {
                  setElementAttribute(lView[RENDERER], lView[nodeIndex], null, tNodeOrTagName, propName, value, sanitizeFn);
                } else {
                  elementPropertyInternal(tView, tNodeOrTagName, lView, propName, value, lView[RENDERER], sanitizeFn, false);
                }
                break;
              case 0:
                const rText = lView[nodeIndex];
                rText !== null && updateTextNode(lView[RENDERER], rText, value);
                break;
              case 2:
                applyIcuSwitchCase(tView, getTIcu(tView, nodeIndex), lView, value);
                break;
              case 3:
                applyIcuUpdateCase(tView, getTIcu(tView, nodeIndex), bindingsStartIndex, lView);
                break;
            }
          }
        }
      }
    } else {
      const opCode = updateOpCodes[i + 1];
      if (opCode > 0 && (opCode & 3) === 3) {
        const nodeIndex = opCode >>> 2;
        const tIcu = getTIcu(tView, nodeIndex);
        const currentIndex = lView[tIcu.currentCaseLViewIndex];
        if (currentIndex < 0) {
          applyIcuUpdateCase(tView, tIcu, bindingsStartIndex, lView);
        }
      }
    }
    i += skipCodes;
  }
}
function applyIcuUpdateCase(tView, tIcu, bindingsStartIndex, lView) {
  ngDevMode && assertIndexInRange(lView, tIcu.currentCaseLViewIndex);
  let activeCaseIndex = lView[tIcu.currentCaseLViewIndex];
  if (activeCaseIndex !== null) {
    let mask = changeMask;
    if (activeCaseIndex < 0) {
      activeCaseIndex = lView[tIcu.currentCaseLViewIndex] = ~activeCaseIndex;
      mask = -1;
    }
    applyUpdateOpCodes(tView, lView, tIcu.update[activeCaseIndex], bindingsStartIndex, mask);
  }
}
function applyIcuSwitchCase(tView, tIcu, lView, value) {
  const caseIndex = getCaseIndex(tIcu, value);
  let activeCaseIndex = getCurrentICUCaseIndex(tIcu, lView);
  if (activeCaseIndex !== caseIndex) {
    applyIcuSwitchCaseRemove(tView, tIcu, lView);
    lView[tIcu.currentCaseLViewIndex] = caseIndex === null ? null : ~caseIndex;
    if (caseIndex !== null) {
      const anchorRNode = lView[tIcu.anchorIdx];
      if (anchorRNode) {
        ngDevMode && assertDomNode(anchorRNode);
        applyMutableOpCodes(tView, tIcu.create[caseIndex], lView, anchorRNode);
      }
    }
  }
}
function applyIcuSwitchCaseRemove(tView, tIcu, lView) {
  let activeCaseIndex = getCurrentICUCaseIndex(tIcu, lView);
  if (activeCaseIndex !== null) {
    const removeCodes = tIcu.remove[activeCaseIndex];
    for (let i = 0; i < removeCodes.length; i++) {
      const nodeOrIcuIndex = removeCodes[i];
      if (nodeOrIcuIndex > 0) {
        const rNode = getNativeByIndex(nodeOrIcuIndex, lView);
        rNode !== null && nativeRemoveNode(lView[RENDERER], rNode);
      } else {
        applyIcuSwitchCaseRemove(tView, getTIcu(tView, ~nodeOrIcuIndex), lView);
      }
    }
  }
}
function getCaseIndex(icuExpression, bindingValue) {
  let index = icuExpression.cases.indexOf(bindingValue);
  if (index === -1) {
    switch (icuExpression.type) {
      case 1: {
        const resolvedCase = getPluralCase(bindingValue, getLocaleId$1());
        index = icuExpression.cases.indexOf(resolvedCase);
        if (index === -1 && resolvedCase !== "other") {
          index = icuExpression.cases.indexOf("other");
        }
        break;
      }
      case 0: {
        index = icuExpression.cases.indexOf("other");
        break;
      }
    }
  }
  return index === -1 ? null : index;
}
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
function loadIcuContainerVisitor() {
  const _stack = [];
  let _index = -1;
  let _lView;
  let _removes;
  function icuContainerIteratorStart(tIcuContainerNode, lView) {
    _lView = lView;
    while (_stack.length)
      _stack.pop();
    ngDevMode && assertTNodeForLView(tIcuContainerNode, lView);
    enterIcu(tIcuContainerNode.value, lView);
    return icuContainerIteratorNext;
  }
  function enterIcu(tIcu, lView) {
    _index = 0;
    const currentCase = getCurrentICUCaseIndex(tIcu, lView);
    if (currentCase !== null) {
      ngDevMode && assertNumberInRange(currentCase, 0, tIcu.cases.length - 1);
      _removes = tIcu.remove[currentCase];
    } else {
      _removes = EMPTY_ARRAY;
    }
  }
  function icuContainerIteratorNext() {
    if (_index < _removes.length) {
      const removeOpCode = _removes[_index++];
      ngDevMode && assertNumber(removeOpCode, "Expecting OpCode number");
      if (removeOpCode > 0) {
        const rNode = _lView[removeOpCode];
        ngDevMode && assertDomNode(rNode);
        return rNode;
      } else {
        _stack.push(_index, _removes);
        const tIcuIndex = ~removeOpCode;
        const tIcu = _lView[TVIEW].data[tIcuIndex];
        ngDevMode && assertTIcu(tIcu);
        enterIcu(tIcu, _lView);
        return icuContainerIteratorNext();
      }
    } else {
      if (_stack.length === 0) {
        return null;
      } else {
        _removes = _stack.pop();
        _index = _stack.pop();
        return icuContainerIteratorNext();
      }
    }
  }
  return icuContainerIteratorStart;
}
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
function i18nCreateOpCodesToString(opcodes) {
  const createOpCodes = opcodes || (Array.isArray(this) ? this : []);
  let lines = [];
  for (let i = 0; i < createOpCodes.length; i++) {
    const opCode = createOpCodes[i++];
    const text = createOpCodes[i];
    const isComment = (opCode & I18nCreateOpCode.COMMENT) === I18nCreateOpCode.COMMENT;
    const appendNow = (opCode & I18nCreateOpCode.APPEND_EAGERLY) === I18nCreateOpCode.APPEND_EAGERLY;
    const index = opCode >>> I18nCreateOpCode.SHIFT;
    lines.push(`lView[${index}] = document.${isComment ? "createComment" : "createText"}(${JSON.stringify(text)});`);
    if (appendNow) {
      lines.push(`parent.appendChild(lView[${index}]);`);
    }
  }
  return lines;
}
function i18nUpdateOpCodesToString(opcodes) {
  const parser = new OpCodeParser(opcodes || (Array.isArray(this) ? this : []));
  let lines = [];
  function consumeOpCode(value) {
    const ref = value >>> 2;
    const opCode = value & 3;
    switch (opCode) {
      case 0:
        return `(lView[${ref}] as Text).textContent = $$$`;
      case 1:
        const attrName = parser.consumeString();
        const sanitizationFn = parser.consumeFunction();
        const value2 = sanitizationFn ? `(${sanitizationFn})($$$)` : "$$$";
        return `(lView[${ref}] as Element).setAttribute('${attrName}', ${value2})`;
      case 2:
        return `icuSwitchCase(${ref}, $$$)`;
      case 3:
        return `icuUpdateCase(${ref})`;
    }
    throw new Error("unexpected OpCode");
  }
  while (parser.hasMore()) {
    let mask = parser.consumeNumber();
    let size = parser.consumeNumber();
    const end = parser.i + size;
    const statements = [];
    let statement = "";
    while (parser.i < end) {
      let value = parser.consumeNumberOrString();
      if (typeof value === "string") {
        statement += value;
      } else if (value < 0) {
        statement += "${lView[i" + value + "]}";
      } else {
        const opCodeText = consumeOpCode(value);
        statements.push(opCodeText.replace("$$$", "`" + statement + "`") + ";");
        statement = "";
      }
    }
    lines.push(`if (mask & 0b${mask.toString(2)}) { ${statements.join(" ")} }`);
  }
  return lines;
}
function icuCreateOpCodesToString(opcodes) {
  const parser = new OpCodeParser(opcodes || (Array.isArray(this) ? this : []));
  let lines = [];
  function consumeOpCode(opCode) {
    const parent = getParentFromIcuCreateOpCode(opCode);
    const ref = getRefFromIcuCreateOpCode(opCode);
    switch (getInstructionFromIcuCreateOpCode(opCode)) {
      case 0:
        return `(lView[${parent}] as Element).appendChild(lView[${lastRef}])`;
      case 1:
        return `(lView[${ref}] as Element).setAttribute("${parser.consumeString()}", "${parser.consumeString()}")`;
    }
    throw new Error("Unexpected OpCode: " + getInstructionFromIcuCreateOpCode(opCode));
  }
  let lastRef = -1;
  while (parser.hasMore()) {
    let value = parser.consumeNumberStringOrMarker();
    if (value === ICU_MARKER) {
      const text = parser.consumeString();
      lastRef = parser.consumeNumber();
      lines.push(`lView[${lastRef}] = document.createComment("${text}")`);
    } else if (value === ELEMENT_MARKER) {
      const text = parser.consumeString();
      lastRef = parser.consumeNumber();
      lines.push(`lView[${lastRef}] = document.createElement("${text}")`);
    } else if (typeof value === "string") {
      lastRef = parser.consumeNumber();
      lines.push(`lView[${lastRef}] = document.createTextNode("${value}")`);
    } else if (typeof value === "number") {
      const line = consumeOpCode(value);
      line && lines.push(line);
    } else {
      throw new Error("Unexpected value");
    }
  }
  return lines;
}
function i18nRemoveOpCodesToString(opcodes) {
  const removeCodes = opcodes || (Array.isArray(this) ? this : []);
  let lines = [];
  for (let i = 0; i < removeCodes.length; i++) {
    const nodeOrIcuIndex = removeCodes[i];
    if (nodeOrIcuIndex > 0) {
      lines.push(`remove(lView[${nodeOrIcuIndex}])`);
    } else {
      lines.push(`removeNestedICU(${~nodeOrIcuIndex})`);
    }
  }
  return lines;
}
class OpCodeParser {
  constructor(codes) {
    this.i = 0;
    this.codes = codes;
  }
  hasMore() {
    return this.i < this.codes.length;
  }
  consumeNumber() {
    let value = this.codes[this.i++];
    assertNumber(value, "expecting number in OpCode");
    return value;
  }
  consumeString() {
    let value = this.codes[this.i++];
    assertString(value, "expecting string in OpCode");
    return value;
  }
  consumeFunction() {
    let value = this.codes[this.i++];
    if (value === null || typeof value === "function") {
      return value;
    }
    throw new Error("expecting function in OpCode");
  }
  consumeNumberOrString() {
    let value = this.codes[this.i++];
    if (typeof value === "string") {
      return value;
    }
    assertNumber(value, "expecting number or string in OpCode");
    return value;
  }
  consumeNumberStringOrMarker() {
    let value = this.codes[this.i++];
    if (typeof value === "string" || typeof value === "number" || value == ICU_MARKER || value == ELEMENT_MARKER) {
      return value;
    }
    assertNumber(value, "expecting number, string, ICU_MARKER or ELEMENT_MARKER in OpCode");
    return value;
  }
}
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
const BINDING_REGEXP = /�(\d+):?\d*�/gi;
const ICU_REGEXP = /({\s*�\d+:?\d*�\s*,\s*\S{6}\s*,[\s\S]*})/gi;
const NESTED_ICU = /�(\d+)�/;
const ICU_BLOCK_REGEXP = /^\s*(�\d+:?\d*�)\s*,\s*(select|plural)\s*,/;
const MARKER = `�`;
const SUBTEMPLATE_REGEXP = /�\/?\*(\d+:\d+)�/gi;
const PH_REGEXP = /�(\/?[#*]\d+):?\d*�/gi;
const NGSP_UNICODE_REGEXP = /\uE500/g;
function replaceNgsp(value) {
  return value.replace(NGSP_UNICODE_REGEXP, " ");
}
function i18nStartFirstCreatePass(tView, parentTNodeIndex, lView, index, message, subTemplateIndex) {
  const rootTNode = getCurrentParentTNode();
  const createOpCodes = [];
  const updateOpCodes = [];
  const existingTNodeStack = [[]];
  if (ngDevMode) {
    attachDebugGetter(createOpCodes, i18nCreateOpCodesToString);
    attachDebugGetter(updateOpCodes, i18nUpdateOpCodesToString);
  }
  message = getTranslationForTemplate(message, subTemplateIndex);
  const msgParts = replaceNgsp(message).split(PH_REGEXP);
  for (let i = 0; i < msgParts.length; i++) {
    let value = msgParts[i];
    if ((i & 1) === 0) {
      const parts = i18nParseTextIntoPartsAndICU(value);
      for (let j = 0; j < parts.length; j++) {
        let part = parts[j];
        if ((j & 1) === 0) {
          const text = part;
          ngDevMode && assertString(text, "Parsed ICU part should be string");
          if (text !== "") {
            i18nStartFirstCreatePassProcessTextNode(tView, rootTNode, existingTNodeStack[0], createOpCodes, updateOpCodes, lView, text);
          }
        } else {
          const icuExpression = part;
          if (typeof icuExpression !== "object") {
            throw new Error(`Unable to parse ICU expression in "${message}" message.`);
          }
          const icuContainerTNode = createTNodeAndAddOpCode(tView, rootTNode, existingTNodeStack[0], lView, createOpCodes, ngDevMode ? `ICU ${index}:${icuExpression.mainBinding}` : "", true);
          const icuNodeIndex = icuContainerTNode.index;
          ngDevMode && assertGreaterThanOrEqual(icuNodeIndex, HEADER_OFFSET, "Index must be in absolute LView offset");
          icuStart(tView, lView, updateOpCodes, parentTNodeIndex, icuExpression, icuNodeIndex);
        }
      }
    } else {
      const isClosing = value.charCodeAt(0) === 47;
      const type = value.charCodeAt(isClosing ? 1 : 0);
      ngDevMode && assertOneOf(
        type,
        42,
        35
        /* HASH */
      );
      const index2 = HEADER_OFFSET + Number.parseInt(value.substring(isClosing ? 2 : 1));
      if (isClosing) {
        existingTNodeStack.shift();
        setCurrentTNode(getCurrentParentTNode(), false);
      } else {
        const tNode = createTNodePlaceholder(tView, existingTNodeStack[0], index2);
        existingTNodeStack.unshift([]);
        setCurrentTNode(tNode, true);
      }
    }
  }
  tView.data[index] = {
    create: createOpCodes,
    update: updateOpCodes
  };
}
function createTNodeAndAddOpCode(tView, rootTNode, existingTNodes, lView, createOpCodes, text, isICU) {
  const i18nNodeIdx = allocExpando(tView, lView, 1, null);
  let opCode = i18nNodeIdx << I18nCreateOpCode.SHIFT;
  let parentTNode = getCurrentParentTNode();
  if (rootTNode === parentTNode) {
    parentTNode = null;
  }
  if (parentTNode === null) {
    opCode |= I18nCreateOpCode.APPEND_EAGERLY;
  }
  if (isICU) {
    opCode |= I18nCreateOpCode.COMMENT;
    ensureIcuContainerVisitorLoaded(loadIcuContainerVisitor);
  }
  createOpCodes.push(opCode, text === null ? "" : text);
  const tNode = createTNodeAtIndex(tView, i18nNodeIdx, isICU ? 32 : 1, text === null ? ngDevMode ? "{{?}}" : "" : text, null);
  addTNodeAndUpdateInsertBeforeIndex(existingTNodes, tNode);
  const tNodeIdx = tNode.index;
  setCurrentTNode(
    tNode,
    false
    /* Text nodes are self closing */
  );
  if (parentTNode !== null && rootTNode !== parentTNode) {
    setTNodeInsertBeforeIndex(parentTNode, tNodeIdx);
  }
  return tNode;
}
function i18nStartFirstCreatePassProcessTextNode(tView, rootTNode, existingTNodes, createOpCodes, updateOpCodes, lView, text) {
  const hasBinding = text.match(BINDING_REGEXP);
  const tNode = createTNodeAndAddOpCode(tView, rootTNode, existingTNodes, lView, createOpCodes, hasBinding ? null : text, false);
  if (hasBinding) {
    generateBindingUpdateOpCodes(updateOpCodes, text, tNode.index, null, 0, null);
  }
}
function i18nAttributesFirstPass(tView, index, values) {
  const previousElement = getCurrentTNode();
  const previousElementIndex = previousElement.index;
  const updateOpCodes = [];
  if (ngDevMode) {
    attachDebugGetter(updateOpCodes, i18nUpdateOpCodesToString);
  }
  if (tView.firstCreatePass && tView.data[index] === null) {
    for (let i = 0; i < values.length; i += 2) {
      const attrName = values[i];
      const message = values[i + 1];
      if (message !== "") {
        if (ICU_REGEXP.test(message)) {
          throw new Error(`ICU expressions are not supported in attributes. Message: "${message}".`);
        }
        generateBindingUpdateOpCodes(updateOpCodes, message, previousElementIndex, attrName, countBindings(updateOpCodes), null);
      }
    }
    tView.data[index] = updateOpCodes;
  }
}
function generateBindingUpdateOpCodes(updateOpCodes, str, destinationNode, attrName, bindingStart, sanitizeFn) {
  ngDevMode && assertGreaterThanOrEqual(destinationNode, HEADER_OFFSET, "Index must be in absolute LView offset");
  const maskIndex = updateOpCodes.length;
  const sizeIndex = maskIndex + 1;
  updateOpCodes.push(null, null);
  const startIndex = maskIndex + 2;
  if (ngDevMode) {
    attachDebugGetter(updateOpCodes, i18nUpdateOpCodesToString);
  }
  const textParts = str.split(BINDING_REGEXP);
  let mask = 0;
  for (let j = 0; j < textParts.length; j++) {
    const textValue = textParts[j];
    if (j & 1) {
      const bindingIndex = bindingStart + parseInt(textValue, 10);
      updateOpCodes.push(-1 - bindingIndex);
      mask = mask | toMaskBit(bindingIndex);
    } else if (textValue !== "") {
      updateOpCodes.push(textValue);
    }
  }
  updateOpCodes.push(destinationNode << 2 | (attrName ? 1 : 0));
  if (attrName) {
    updateOpCodes.push(attrName, sanitizeFn);
  }
  updateOpCodes[maskIndex] = mask;
  updateOpCodes[sizeIndex] = updateOpCodes.length - startIndex;
  return mask;
}
function countBindings(opCodes) {
  let count = 0;
  for (let i = 0; i < opCodes.length; i++) {
    const opCode = opCodes[i];
    if (typeof opCode === "number" && opCode < 0) {
      count++;
    }
  }
  return count;
}
function toMaskBit(bindingIndex) {
  return 1 << Math.min(bindingIndex, 31);
}
function isRootTemplateMessage(subTemplateIndex) {
  return subTemplateIndex === -1;
}
function removeInnerTemplateTranslation(message) {
  let match;
  let res = "";
  let index = 0;
  let inTemplate = false;
  let tagMatched;
  while ((match = SUBTEMPLATE_REGEXP.exec(message)) !== null) {
    if (!inTemplate) {
      res += message.substring(index, match.index + match[0].length);
      tagMatched = match[1];
      inTemplate = true;
    } else {
      if (match[0] === `${MARKER}/*${tagMatched}${MARKER}`) {
        index = match.index;
        inTemplate = false;
      }
    }
  }
  ngDevMode && assertEqual(inTemplate, false, `Tag mismatch: unable to find the end of the sub-template in the translation "${message}"`);
  res += message.substr(index);
  return res;
}
function getTranslationForTemplate(message, subTemplateIndex) {
  if (isRootTemplateMessage(subTemplateIndex)) {
    return removeInnerTemplateTranslation(message);
  } else {
    const start = message.indexOf(`:${subTemplateIndex}${MARKER}`) + 2 + subTemplateIndex.toString().length;
    const end = message.search(new RegExp(`${MARKER}\\/\\*\\d+:${subTemplateIndex}${MARKER}`));
    return removeInnerTemplateTranslation(message.substring(start, end));
  }
}
function icuStart(tView, lView, updateOpCodes, parentIdx, icuExpression, anchorIdx) {
  ngDevMode && assertDefined(icuExpression, "ICU expression must be defined");
  let bindingMask = 0;
  const tIcu = {
    type: icuExpression.type,
    currentCaseLViewIndex: allocExpando(tView, lView, 1, null),
    anchorIdx,
    cases: [],
    create: [],
    remove: [],
    update: []
  };
  addUpdateIcuSwitch(updateOpCodes, icuExpression, anchorIdx);
  setTIcu(tView, anchorIdx, tIcu);
  const values = icuExpression.values;
  for (let i = 0; i < values.length; i++) {
    const valueArr = values[i];
    const nestedIcus = [];
    for (let j = 0; j < valueArr.length; j++) {
      const value = valueArr[j];
      if (typeof value !== "string") {
        const icuIndex = nestedIcus.push(value) - 1;
        valueArr[j] = `<!--�${icuIndex}�-->`;
      }
    }
    bindingMask = parseIcuCase(tView, tIcu, lView, updateOpCodes, parentIdx, icuExpression.cases[i], valueArr.join(""), nestedIcus) | bindingMask;
  }
  if (bindingMask) {
    addUpdateIcuUpdate(updateOpCodes, bindingMask, anchorIdx);
  }
}
function parseICUBlock(pattern) {
  const cases = [];
  const values = [];
  let icuType = 1;
  let mainBinding = 0;
  pattern = pattern.replace(ICU_BLOCK_REGEXP, function(str, binding, type) {
    if (type === "select") {
      icuType = 0;
    } else {
      icuType = 1;
    }
    mainBinding = parseInt(binding.substr(1), 10);
    return "";
  });
  const parts = i18nParseTextIntoPartsAndICU(pattern);
  for (let pos = 0; pos < parts.length; ) {
    let key = parts[pos++].trim();
    if (icuType === 1) {
      key = key.replace(/\s*(?:=)?(\w+)\s*/, "$1");
    }
    if (key.length) {
      cases.push(key);
    }
    const blocks = i18nParseTextIntoPartsAndICU(parts[pos++]);
    if (cases.length > values.length) {
      values.push(blocks);
    }
  }
  return { type: icuType, mainBinding, cases, values };
}
function i18nParseTextIntoPartsAndICU(pattern) {
  if (!pattern) {
    return [];
  }
  let prevPos = 0;
  const braceStack = [];
  const results = [];
  const braces = /[{}]/g;
  braces.lastIndex = 0;
  let match;
  while (match = braces.exec(pattern)) {
    const pos = match.index;
    if (match[0] == "}") {
      braceStack.pop();
      if (braceStack.length == 0) {
        const block = pattern.substring(prevPos, pos);
        if (ICU_BLOCK_REGEXP.test(block)) {
          results.push(parseICUBlock(block));
        } else {
          results.push(block);
        }
        prevPos = pos + 1;
      }
    } else {
      if (braceStack.length == 0) {
        const substring2 = pattern.substring(prevPos, pos);
        results.push(substring2);
        prevPos = pos + 1;
      }
      braceStack.push("{");
    }
  }
  const substring = pattern.substring(prevPos);
  results.push(substring);
  return results;
}
function parseIcuCase(tView, tIcu, lView, updateOpCodes, parentIdx, caseName, unsafeCaseHtml, nestedIcus) {
  const create = [];
  const remove2 = [];
  const update = [];
  if (ngDevMode) {
    attachDebugGetter(create, icuCreateOpCodesToString);
    attachDebugGetter(remove2, i18nRemoveOpCodesToString);
    attachDebugGetter(update, i18nUpdateOpCodesToString);
  }
  tIcu.cases.push(caseName);
  tIcu.create.push(create);
  tIcu.remove.push(remove2);
  tIcu.update.push(update);
  const inertBodyHelper2 = getInertBodyHelper(getDocument());
  const inertBodyElement = inertBodyHelper2.getInertBodyElement(unsafeCaseHtml);
  ngDevMode && assertDefined(inertBodyElement, "Unable to generate inert body element");
  const inertRootNode = getTemplateContent(inertBodyElement) || inertBodyElement;
  if (inertRootNode) {
    return walkIcuTree(tView, tIcu, lView, updateOpCodes, create, remove2, update, inertRootNode, parentIdx, nestedIcus, 0);
  } else {
    return 0;
  }
}
function walkIcuTree(tView, tIcu, lView, sharedUpdateOpCodes, create, remove2, update, parentNode, parentIdx, nestedIcus, depth) {
  let bindingMask = 0;
  let currentNode = parentNode.firstChild;
  while (currentNode) {
    const newIndex = allocExpando(tView, lView, 1, null);
    switch (currentNode.nodeType) {
      case Node.ELEMENT_NODE:
        const element = currentNode;
        const tagName = element.tagName.toLowerCase();
        if (VALID_ELEMENTS.hasOwnProperty(tagName)) {
          addCreateNodeAndAppend(create, ELEMENT_MARKER, tagName, parentIdx, newIndex);
          tView.data[newIndex] = tagName;
          const elAttrs = element.attributes;
          for (let i = 0; i < elAttrs.length; i++) {
            const attr = elAttrs.item(i);
            const lowerAttrName = attr.name.toLowerCase();
            const hasBinding2 = !!attr.value.match(BINDING_REGEXP);
            if (hasBinding2) {
              if (VALID_ATTRS.hasOwnProperty(lowerAttrName)) {
                if (URI_ATTRS[lowerAttrName]) {
                  generateBindingUpdateOpCodes(update, attr.value, newIndex, attr.name, 0, _sanitizeUrl);
                } else if (SRCSET_ATTRS[lowerAttrName]) {
                  generateBindingUpdateOpCodes(update, attr.value, newIndex, attr.name, 0, sanitizeSrcset);
                } else {
                  generateBindingUpdateOpCodes(update, attr.value, newIndex, attr.name, 0, null);
                }
              } else {
                ngDevMode && console.warn(`WARNING: ignoring unsafe attribute value ${lowerAttrName} on element ${tagName} (see https://g.co/ng/security#xss)`);
              }
            } else {
              addCreateAttribute(create, newIndex, attr);
            }
          }
          bindingMask = walkIcuTree(tView, tIcu, lView, sharedUpdateOpCodes, create, remove2, update, currentNode, newIndex, nestedIcus, depth + 1) | bindingMask;
          addRemoveNode(remove2, newIndex, depth);
        }
        break;
      case Node.TEXT_NODE:
        const value = currentNode.textContent || "";
        const hasBinding = value.match(BINDING_REGEXP);
        addCreateNodeAndAppend(create, null, hasBinding ? "" : value, parentIdx, newIndex);
        addRemoveNode(remove2, newIndex, depth);
        if (hasBinding) {
          bindingMask = generateBindingUpdateOpCodes(update, value, newIndex, null, 0, null) | bindingMask;
        }
        break;
      case Node.COMMENT_NODE:
        const isNestedIcu = NESTED_ICU.exec(currentNode.textContent || "");
        if (isNestedIcu) {
          const nestedIcuIndex = parseInt(isNestedIcu[1], 10);
          const icuExpression = nestedIcus[nestedIcuIndex];
          addCreateNodeAndAppend(create, ICU_MARKER, ngDevMode ? `nested ICU ${nestedIcuIndex}` : "", parentIdx, newIndex);
          icuStart(tView, lView, sharedUpdateOpCodes, parentIdx, icuExpression, newIndex);
          addRemoveNestedIcu(remove2, newIndex, depth);
        }
        break;
    }
    currentNode = currentNode.nextSibling;
  }
  return bindingMask;
}
function addRemoveNode(remove2, index, depth) {
  if (depth === 0) {
    remove2.push(index);
  }
}
function addRemoveNestedIcu(remove2, index, depth) {
  if (depth === 0) {
    remove2.push(~index);
    remove2.push(index);
  }
}
function addUpdateIcuSwitch(update, icuExpression, index) {
  update.push(
    toMaskBit(icuExpression.mainBinding),
    2,
    -1 - icuExpression.mainBinding,
    index << 2 | 2
    /* IcuSwitch */
  );
}
function addUpdateIcuUpdate(update, bindingMask, index) {
  update.push(
    bindingMask,
    1,
    index << 2 | 3
    /* IcuUpdate */
  );
}
function addCreateNodeAndAppend(create, marker, text, appendToParentIdx, createAtIdx) {
  if (marker !== null) {
    create.push(marker);
  }
  create.push(text, createAtIdx, icuCreateOpCode(0, appendToParentIdx, createAtIdx));
}
function addCreateAttribute(create, newIndex, attr) {
  create.push(newIndex << 1 | 1, attr.name, attr.value);
}
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
const ROOT_TEMPLATE_ID = 0;
const PP_MULTI_VALUE_PLACEHOLDERS_REGEXP = /\[(�.+?�?)\]/;
const PP_PLACEHOLDERS_REGEXP = /\[(�.+?�?)\]|(�\/?\*\d+:\d+�)/g;
const PP_ICU_VARS_REGEXP = /({\s*)(VAR_(PLURAL|SELECT)(_\d+)?)(\s*,)/g;
const PP_ICU_PLACEHOLDERS_REGEXP = /{([A-Z0-9_]+)}/g;
const PP_ICUS_REGEXP = /�I18N_EXP_(ICU(_\d+)?)�/g;
const PP_CLOSE_TEMPLATE_REGEXP = /\/\*/;
const PP_TEMPLATE_ID_REGEXP = /\d+\:(\d+)/;
function i18nPostprocess(message, replacements = {}) {
  let result = message;
  if (PP_MULTI_VALUE_PLACEHOLDERS_REGEXP.test(message)) {
    const matches = {};
    const templateIdsStack = [ROOT_TEMPLATE_ID];
    result = result.replace(PP_PLACEHOLDERS_REGEXP, (m, phs, tmpl) => {
      const content = phs || tmpl;
      const placeholders = matches[content] || [];
      if (!placeholders.length) {
        content.split("|").forEach((placeholder2) => {
          const match = placeholder2.match(PP_TEMPLATE_ID_REGEXP);
          const templateId2 = match ? parseInt(match[1], 10) : ROOT_TEMPLATE_ID;
          const isCloseTemplateTag2 = PP_CLOSE_TEMPLATE_REGEXP.test(placeholder2);
          placeholders.push([templateId2, isCloseTemplateTag2, placeholder2]);
        });
        matches[content] = placeholders;
      }
      if (!placeholders.length) {
        throw new Error(`i18n postprocess: unmatched placeholder - ${content}`);
      }
      const currentTemplateId = templateIdsStack[templateIdsStack.length - 1];
      let idx = 0;
      for (let i = 0; i < placeholders.length; i++) {
        if (placeholders[i][0] === currentTemplateId) {
          idx = i;
          break;
        }
      }
      const [templateId, isCloseTemplateTag, placeholder] = placeholders[idx];
      if (isCloseTemplateTag) {
        templateIdsStack.pop();
      } else if (currentTemplateId !== templateId) {
        templateIdsStack.push(templateId);
      }
      placeholders.splice(idx, 1);
      return placeholder;
    });
  }
  if (!Object.keys(replacements).length) {
    return result;
  }
  result = result.replace(PP_ICU_VARS_REGEXP, (match, start, key, _type, _idx, end) => {
    return replacements.hasOwnProperty(key) ? `${start}${replacements[key]}${end}` : match;
  });
  result = result.replace(PP_ICU_PLACEHOLDERS_REGEXP, (match, key) => {
    return replacements.hasOwnProperty(key) ? replacements[key] : match;
  });
  result = result.replace(PP_ICUS_REGEXP, (match, key) => {
    if (replacements.hasOwnProperty(key)) {
      const list = replacements[key];
      if (!list.length) {
        throw new Error(`i18n postprocess: unmatched ICU - ${match} with key: ${key}`);
      }
      return list.shift();
    }
    return match;
  });
  return result;
}
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
function ɵɵi18nStart(index, messageIndex, subTemplateIndex = -1) {
  const tView = getTView();
  const lView = getLView();
  const adjustedIndex = HEADER_OFFSET + index;
  ngDevMode && assertDefined(tView, `tView should be defined`);
  const message = getConstant(tView.consts, messageIndex);
  const parentTNode = getCurrentParentTNode();
  if (tView.firstCreatePass) {
    i18nStartFirstCreatePass(tView, parentTNode === null ? 0 : parentTNode.index, lView, adjustedIndex, message, subTemplateIndex);
  }
  const tI18n = tView.data[adjustedIndex];
  const sameViewParentTNode = parentTNode === lView[T_HOST] ? null : parentTNode;
  const parentRNode = getClosestRElement(tView, sameViewParentTNode, lView);
  const insertInFrontOf = parentTNode && parentTNode.type & 8 ? lView[parentTNode.index] : null;
  applyCreateOpCodes(lView, tI18n.create, parentRNode, insertInFrontOf);
  setInI18nBlock(true);
}
function ɵɵi18nEnd() {
  setInI18nBlock(false);
}
function ɵɵi18n(index, messageIndex, subTemplateIndex) {
  ɵɵi18nStart(index, messageIndex, subTemplateIndex);
  ɵɵi18nEnd();
}
function ɵɵi18nAttributes(index, attrsIndex) {
  const tView = getTView();
  ngDevMode && assertDefined(tView, `tView should be defined`);
  const attrs = getConstant(tView.consts, attrsIndex);
  i18nAttributesFirstPass(tView, index + HEADER_OFFSET, attrs);
}
function ɵɵi18nExp(value) {
  const lView = getLView();
  setMaskBit(bindingUpdated(lView, nextBindingIndex(), value));
  return ɵɵi18nExp;
}
function ɵɵi18nApply(index) {
  applyI18n(getTView(), getLView(), index + HEADER_OFFSET);
}
function ɵɵi18nPostprocess(message, replacements = {}) {
  return i18nPostprocess(message, replacements);
}
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
function providersResolver(def, providers, viewProviders) {
  const tView = getTView();
  if (tView.firstCreatePass) {
    const isComponent = isComponentDef(def);
    resolveProvider(viewProviders, tView.data, tView.blueprint, isComponent, true);
    resolveProvider(providers, tView.data, tView.blueprint, isComponent, false);
  }
}
function resolveProvider(provider, tInjectables, lInjectablesBlueprint, isComponent, isViewProvider) {
  provider = resolveForwardRef(provider);
  if (Array.isArray(provider)) {
    for (let i = 0; i < provider.length; i++) {
      resolveProvider(provider[i], tInjectables, lInjectablesBlueprint, isComponent, isViewProvider);
    }
  } else {
    const tView = getTView();
    const lView = getLView();
    let token = isTypeProvider(provider) ? provider : resolveForwardRef(provider.provide);
    let providerFactory = providerToFactory(provider);
    const tNode = getCurrentTNode();
    const beginIndex = tNode.providerIndexes & 1048575;
    const endIndex = tNode.directiveStart;
    const cptViewProvidersCount = tNode.providerIndexes >> 20;
    if (isTypeProvider(provider) || !provider.multi) {
      const factory = new NodeInjectorFactory(providerFactory, isViewProvider, ɵɵdirectiveInject);
      const existingFactoryIndex = indexOf(token, tInjectables, isViewProvider ? beginIndex : beginIndex + cptViewProvidersCount, endIndex);
      if (existingFactoryIndex === -1) {
        diPublicInInjector(getOrCreateNodeInjectorForNode(tNode, lView), tView, token);
        registerDestroyHooksIfSupported(tView, provider, tInjectables.length);
        tInjectables.push(token);
        tNode.directiveStart++;
        tNode.directiveEnd++;
        if (isViewProvider) {
          tNode.providerIndexes += 1048576;
        }
        lInjectablesBlueprint.push(factory);
        lView.push(factory);
      } else {
        lInjectablesBlueprint[existingFactoryIndex] = factory;
        lView[existingFactoryIndex] = factory;
      }
    } else {
      const existingProvidersFactoryIndex = indexOf(token, tInjectables, beginIndex + cptViewProvidersCount, endIndex);
      const existingViewProvidersFactoryIndex = indexOf(token, tInjectables, beginIndex, beginIndex + cptViewProvidersCount);
      const doesProvidersFactoryExist = existingProvidersFactoryIndex >= 0 && lInjectablesBlueprint[existingProvidersFactoryIndex];
      const doesViewProvidersFactoryExist = existingViewProvidersFactoryIndex >= 0 && lInjectablesBlueprint[existingViewProvidersFactoryIndex];
      if (isViewProvider && !doesViewProvidersFactoryExist || !isViewProvider && !doesProvidersFactoryExist) {
        diPublicInInjector(getOrCreateNodeInjectorForNode(tNode, lView), tView, token);
        const factory = multiFactory(isViewProvider ? multiViewProvidersFactoryResolver : multiProvidersFactoryResolver, lInjectablesBlueprint.length, isViewProvider, isComponent, providerFactory);
        if (!isViewProvider && doesViewProvidersFactoryExist) {
          lInjectablesBlueprint[existingViewProvidersFactoryIndex].providerFactory = factory;
        }
        registerDestroyHooksIfSupported(tView, provider, tInjectables.length, 0);
        tInjectables.push(token);
        tNode.directiveStart++;
        tNode.directiveEnd++;
        if (isViewProvider) {
          tNode.providerIndexes += 1048576;
        }
        lInjectablesBlueprint.push(factory);
        lView.push(factory);
      } else {
        const indexInFactory = multiFactoryAdd(lInjectablesBlueprint[isViewProvider ? existingViewProvidersFactoryIndex : existingProvidersFactoryIndex], providerFactory, !isViewProvider && isComponent);
        registerDestroyHooksIfSupported(tView, provider, existingProvidersFactoryIndex > -1 ? existingProvidersFactoryIndex : existingViewProvidersFactoryIndex, indexInFactory);
      }
      if (!isViewProvider && isComponent && doesViewProvidersFactoryExist) {
        lInjectablesBlueprint[existingViewProvidersFactoryIndex].componentProviders++;
      }
    }
  }
}
function registerDestroyHooksIfSupported(tView, provider, contextIndex, indexInFactory) {
  const providerIsTypeProvider = isTypeProvider(provider);
  const providerIsClassProvider = isClassProvider(provider);
  if (providerIsTypeProvider || providerIsClassProvider) {
    const classToken = providerIsClassProvider ? resolveForwardRef(provider.useClass) : provider;
    const prototype = classToken.prototype;
    const ngOnDestroy = prototype.ngOnDestroy;
    if (ngOnDestroy) {
      const hooks = tView.destroyHooks || (tView.destroyHooks = []);
      if (!providerIsTypeProvider && provider.multi) {
        ngDevMode && assertDefined(indexInFactory, "indexInFactory when registering multi factory destroy hook");
        const existingCallbacksIndex = hooks.indexOf(contextIndex);
        if (existingCallbacksIndex === -1) {
          hooks.push(contextIndex, [indexInFactory, ngOnDestroy]);
        } else {
          hooks[existingCallbacksIndex + 1].push(indexInFactory, ngOnDestroy);
        }
      } else {
        hooks.push(contextIndex, ngOnDestroy);
      }
    }
  }
}
function multiFactoryAdd(multiFactory2, factory, isComponentProvider) {
  if (isComponentProvider) {
    multiFactory2.componentProviders++;
  }
  return multiFactory2.multi.push(factory) - 1;
}
function indexOf(item, arr, begin, end) {
  for (let i = begin; i < end; i++) {
    if (arr[i] === item)
      return i;
  }
  return -1;
}
function multiProvidersFactoryResolver(_, tData, lData, tNode) {
  return multiResolve(this.multi, []);
}
function multiViewProvidersFactoryResolver(_, tData, lView, tNode) {
  const factories = this.multi;
  let result;
  if (this.providerFactory) {
    const componentCount = this.providerFactory.componentProviders;
    const multiProviders = getNodeInjectable(lView, lView[TVIEW], this.providerFactory.index, tNode);
    result = multiProviders.slice(0, componentCount);
    multiResolve(factories, result);
    for (let i = componentCount; i < multiProviders.length; i++) {
      result.push(multiProviders[i]);
    }
  } else {
    result = [];
    multiResolve(factories, result);
  }
  return result;
}
function multiResolve(factories, result) {
  for (let i = 0; i < factories.length; i++) {
    const factory = factories[i];
    result.push(factory());
  }
  return result;
}
function multiFactory(factoryFn, index, isViewProvider, isComponent, f) {
  const factory = new NodeInjectorFactory(factoryFn, isViewProvider, ɵɵdirectiveInject);
  factory.multi = [];
  factory.index = index;
  factory.componentProviders = 0;
  multiFactoryAdd(factory, f, isComponent && !isViewProvider);
  return factory;
}
function ɵɵProvidersFeature(providers, viewProviders = []) {
  return (definition) => {
    definition.providersResolver = (def, processProvidersFn) => {
      return providersResolver(
        def,
        //
        processProvidersFn ? processProvidersFn(providers) : providers,
        //
        viewProviders
      );
    };
  };
}
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
class ComponentRef$1 {
}
class ComponentFactory$1 {
}
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
function noComponentFactoryError(component) {
  const error = Error(`No component factory found for ${stringify(component)}. Did you add it to @NgModule.entryComponents?`);
  error[ERROR_COMPONENT] = component;
  return error;
}
const ERROR_COMPONENT = "ngComponent";
class _NullComponentFactoryResolver {
  resolveComponentFactory(component) {
    throw noComponentFactoryError(component);
  }
}
class ComponentFactoryResolver$1 {
}
ComponentFactoryResolver$1.NULL = /* @__PURE__ */ new _NullComponentFactoryResolver();
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
function injectElementRef() {
  return createElementRef(getCurrentTNode(), getLView());
}
function createElementRef(tNode, lView) {
  return new ElementRef(getNativeByTNode(tNode, lView));
}
class ElementRef {
  constructor(nativeElement) {
    this.nativeElement = nativeElement;
  }
}
ElementRef.__NG_ELEMENT_ID__ = injectElementRef;
function unwrapElementRef(value) {
  return value instanceof ElementRef ? value.nativeElement : value;
}
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
new InjectionToken("Renderer2Interceptor");
class RendererFactory2 {
}
class Renderer2 {
}
Renderer2.__NG_ELEMENT_ID__ = () => injectRenderer2();
function getOrCreateRenderer2(lView) {
  const renderer = lView[RENDERER];
  if (ngDevMode && !isProceduralRenderer(renderer)) {
    throw new Error("Cannot inject Renderer2 when the application uses Renderer3!");
  }
  return renderer;
}
function injectRenderer2() {
  const lView = getLView();
  const tNode = getCurrentTNode();
  const nodeAtIndex = getComponentLViewByIndex(tNode.index, lView);
  return getOrCreateRenderer2(isLView(nodeAtIndex) ? nodeAtIndex : lView);
}
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
class Sanitizer {
}
Sanitizer.ɵprov = ɵɵdefineInjectable({
  token: Sanitizer,
  providedIn: "root",
  factory: () => null
});
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
class Version {
  constructor(full) {
    this.full = full;
    this.major = full.split(".")[0];
    this.minor = full.split(".")[1];
    this.patch = full.split(".").slice(2).join(".");
  }
}
const VERSION = new Version("13.4.0");
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
const NOT_FOUND_CHECK_ONLY_ELEMENT_INJECTOR = {};
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
function collectNativeNodes(tView, lView, tNode, result, isProjection = false) {
  while (tNode !== null) {
    ngDevMode && assertTNodeType(
      tNode,
      3 | 12 | 16 | 32
      /* Icu */
    );
    const lNode = lView[tNode.index];
    if (lNode !== null) {
      result.push(unwrapRNode(lNode));
    }
    if (isLContainer(lNode)) {
      for (let i = CONTAINER_HEADER_OFFSET; i < lNode.length; i++) {
        const lViewInAContainer = lNode[i];
        const lViewFirstChildTNode = lViewInAContainer[TVIEW].firstChild;
        if (lViewFirstChildTNode !== null) {
          collectNativeNodes(lViewInAContainer[TVIEW], lViewInAContainer, lViewFirstChildTNode, result);
        }
      }
    }
    const tNodeType = tNode.type;
    if (tNodeType & 8) {
      collectNativeNodes(tView, lView, tNode.child, result);
    } else if (tNodeType & 32) {
      const nextRNode = icuContainerIterate(tNode, lView);
      let rNode;
      while (rNode = nextRNode()) {
        result.push(rNode);
      }
    } else if (tNodeType & 16) {
      const nodesInSlot = getProjectionNodes(lView, tNode);
      if (Array.isArray(nodesInSlot)) {
        result.push(...nodesInSlot);
      } else {
        const parentView = getLViewParent(lView[DECLARATION_COMPONENT_VIEW]);
        ngDevMode && assertParentView(parentView);
        collectNativeNodes(parentView[TVIEW], parentView, nodesInSlot, result, true);
      }
    }
    tNode = isProjection ? tNode.projectionNext : tNode.next;
  }
  return result;
}
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
class ViewRef$1 {
  constructor(_lView, _cdRefInjectingView) {
    this._lView = _lView;
    this._cdRefInjectingView = _cdRefInjectingView;
    this._appRef = null;
    this._attachedToViewContainer = false;
  }
  get rootNodes() {
    const lView = this._lView;
    const tView = lView[TVIEW];
    return collectNativeNodes(tView, lView, tView.firstChild, []);
  }
  get context() {
    return this._lView[CONTEXT];
  }
  set context(value) {
    this._lView[CONTEXT] = value;
  }
  get destroyed() {
    return (this._lView[FLAGS] & 256) === 256;
  }
  destroy() {
    if (this._appRef) {
      this._appRef.detachView(this);
    } else if (this._attachedToViewContainer) {
      const parent = this._lView[PARENT];
      if (isLContainer(parent)) {
        const viewRefs = parent[VIEW_REFS];
        const index = viewRefs ? viewRefs.indexOf(this) : -1;
        if (index > -1) {
          ngDevMode && assertEqual(index, parent.indexOf(this._lView) - CONTAINER_HEADER_OFFSET, "An attached view should be in the same position within its container as its ViewRef in the VIEW_REFS array.");
          detachView(parent, index);
          removeFromArray(viewRefs, index);
        }
      }
      this._attachedToViewContainer = false;
    }
    destroyLView(this._lView[TVIEW], this._lView);
  }
  onDestroy(callback) {
    storeCleanupWithContext(this._lView[TVIEW], this._lView, null, callback);
  }
  /**
   * Marks a view and all of its ancestors dirty.
   *
   * This can be used to ensure an {@link ChangeDetectionStrategy#OnPush OnPush} component is
   * checked when it needs to be re-rendered but the two normal triggers haven't marked it
   * dirty (i.e. inputs haven't changed and events haven't fired in the view).
   *
   * <!-- TODO: Add a link to a chapter on OnPush components -->
   *
   * @usageNotes
   * ### Example
   *
   * ```typescript
   * @Component({
   *   selector: 'app-root',
   *   template: `Number of ticks: {{numberOfTicks}}`
   *   changeDetection: ChangeDetectionStrategy.OnPush,
   * })
   * class AppComponent {
   *   numberOfTicks = 0;
   *
   *   constructor(private ref: ChangeDetectorRef) {
   *     setInterval(() => {
   *       this.numberOfTicks++;
   *       // the following is required, otherwise the view will not be updated
   *       this.ref.markForCheck();
   *     }, 1000);
   *   }
   * }
   * ```
   */
  markForCheck() {
    markViewDirty(this._cdRefInjectingView || this._lView);
  }
  /**
   * Detaches the view from the change detection tree.
   *
   * Detached views will not be checked during change detection runs until they are
   * re-attached, even if they are dirty. `detach` can be used in combination with
   * {@link ChangeDetectorRef#detectChanges detectChanges} to implement local change
   * detection checks.
   *
   * <!-- TODO: Add a link to a chapter on detach/reattach/local digest -->
   * <!-- TODO: Add a live demo once ref.detectChanges is merged into master -->
   *
   * @usageNotes
   * ### Example
   *
   * The following example defines a component with a large list of readonly data.
   * Imagine the data changes constantly, many times per second. For performance reasons,
   * we want to check and update the list every five seconds. We can do that by detaching
   * the component's change detector and doing a local check every five seconds.
   *
   * ```typescript
   * class DataProvider {
   *   // in a real application the returned data will be different every time
   *   get data() {
   *     return [1,2,3,4,5];
   *   }
   * }
   *
   * @Component({
   *   selector: 'giant-list',
   *   template: `
   *     <li *ngFor="let d of dataProvider.data">Data {{d}}</li>
   *   `,
   * })
   * class GiantList {
   *   constructor(private ref: ChangeDetectorRef, private dataProvider: DataProvider) {
   *     ref.detach();
   *     setInterval(() => {
   *       this.ref.detectChanges();
   *     }, 5000);
   *   }
   * }
   *
   * @Component({
   *   selector: 'app',
   *   providers: [DataProvider],
   *   template: `
   *     <giant-list><giant-list>
   *   `,
   * })
   * class App {
   * }
   * ```
   */
  detach() {
    this._lView[FLAGS] &= -129;
  }
  /**
   * Re-attaches a view to the change detection tree.
   *
   * This can be used to re-attach views that were previously detached from the tree
   * using {@link ChangeDetectorRef#detach detach}. Views are attached to the tree by default.
   *
   * <!-- TODO: Add a link to a chapter on detach/reattach/local digest -->
   *
   * @usageNotes
   * ### Example
   *
   * The following example creates a component displaying `live` data. The component will detach
   * its change detector from the main change detector tree when the component's live property
   * is set to false.
   *
   * ```typescript
   * class DataProvider {
   *   data = 1;
   *
   *   constructor() {
   *     setInterval(() => {
   *       this.data = this.data * 2;
   *     }, 500);
   *   }
   * }
   *
   * @Component({
   *   selector: 'live-data',
   *   inputs: ['live'],
   *   template: 'Data: {{dataProvider.data}}'
   * })
   * class LiveData {
   *   constructor(private ref: ChangeDetectorRef, private dataProvider: DataProvider) {}
   *
   *   set live(value) {
   *     if (value) {
   *       this.ref.reattach();
   *     } else {
   *       this.ref.detach();
   *     }
   *   }
   * }
   *
   * @Component({
   *   selector: 'app-root',
   *   providers: [DataProvider],
   *   template: `
   *     Live Update: <input type="checkbox" [(ngModel)]="live">
   *     <live-data [live]="live"><live-data>
   *   `,
   * })
   * class AppComponent {
   *   live = true;
   * }
   * ```
   */
  reattach() {
    this._lView[FLAGS] |= 128;
  }
  /**
   * Checks the view and its children.
   *
   * This can also be used in combination with {@link ChangeDetectorRef#detach detach} to implement
   * local change detection checks.
   *
   * <!-- TODO: Add a link to a chapter on detach/reattach/local digest -->
   * <!-- TODO: Add a live demo once ref.detectChanges is merged into master -->
   *
   * @usageNotes
   * ### Example
   *
   * The following example defines a component with a large list of readonly data.
   * Imagine, the data changes constantly, many times per second. For performance reasons,
   * we want to check and update the list every five seconds.
   *
   * We can do that by detaching the component's change detector and doing a local change detection
   * check every five seconds.
   *
   * See {@link ChangeDetectorRef#detach detach} for more information.
   */
  detectChanges() {
    detectChangesInternal(this._lView[TVIEW], this._lView, this.context);
  }
  /**
   * Checks the change detector and its children, and throws if any changes are detected.
   *
   * This is used in development mode to verify that running change detection doesn't
   * introduce other changes.
   */
  checkNoChanges() {
    if (ngDevMode) {
      checkNoChangesInternal(this._lView[TVIEW], this._lView, this.context);
    }
  }
  attachToViewContainerRef() {
    if (this._appRef) {
      const errorMessage = ngDevMode ? "This view is already attached directly to the ApplicationRef!" : "";
      throw new RuntimeError(902, errorMessage);
    }
    this._attachedToViewContainer = true;
  }
  detachFromAppRef() {
    this._appRef = null;
    renderDetachView(this._lView[TVIEW], this._lView);
  }
  attachToAppRef(appRef) {
    if (this._attachedToViewContainer) {
      const errorMessage = ngDevMode ? "This view is already attached to a ViewContainer!" : "";
      throw new RuntimeError(902, errorMessage);
    }
    this._appRef = appRef;
  }
}
class RootViewRef extends ViewRef$1 {
  constructor(_view) {
    super(_view);
    this._view = _view;
  }
  detectChanges() {
    detectChangesInRootView(this._view);
  }
  checkNoChanges() {
    if (ngDevMode) {
      checkNoChangesInRootView(this._view);
    }
  }
  get context() {
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
class ComponentFactoryResolver extends ComponentFactoryResolver$1 {
  /**
   * @param ngModule The NgModuleRef to which all resolved factories are bound.
   */
  constructor(ngModule) {
    super();
    this.ngModule = ngModule;
  }
  resolveComponentFactory(component) {
    ngDevMode && assertComponentType(component);
    const componentDef = getComponentDef(component);
    return new ComponentFactory(componentDef, this.ngModule);
  }
}
function toRefArray(map2) {
  const array = [];
  for (let nonMinified in map2) {
    if (map2.hasOwnProperty(nonMinified)) {
      const minified = map2[nonMinified];
      array.push({ propName: minified, templateName: nonMinified });
    }
  }
  return array;
}
function getNamespace(elementName) {
  const name = elementName.toLowerCase();
  return name === "svg" ? SVG_NAMESPACE : name === "math" ? MATH_ML_NAMESPACE : null;
}
function createChainedInjector(rootViewInjector, moduleInjector) {
  return {
    get: (token, notFoundValue, flags) => {
      const value = rootViewInjector.get(token, NOT_FOUND_CHECK_ONLY_ELEMENT_INJECTOR, flags);
      if (value !== NOT_FOUND_CHECK_ONLY_ELEMENT_INJECTOR || notFoundValue === NOT_FOUND_CHECK_ONLY_ELEMENT_INJECTOR) {
        return value;
      }
      return moduleInjector.get(token, notFoundValue, flags);
    }
  };
}
class ComponentFactory extends ComponentFactory$1 {
  /**
   * @param componentDef The component definition.
   * @param ngModule The NgModuleRef to which the factory is bound.
   */
  constructor(componentDef, ngModule) {
    super();
    this.componentDef = componentDef;
    this.ngModule = ngModule;
    this.componentType = componentDef.type;
    this.selector = stringifyCSSSelectorList(componentDef.selectors);
    this.ngContentSelectors = componentDef.ngContentSelectors ? componentDef.ngContentSelectors : [];
    this.isBoundToModule = !!ngModule;
  }
  get inputs() {
    return toRefArray(this.componentDef.inputs);
  }
  get outputs() {
    return toRefArray(this.componentDef.outputs);
  }
  create(injector, projectableNodes, rootSelectorOrNode, ngModule) {
    ngModule = ngModule || this.ngModule;
    const rootViewInjector = ngModule ? createChainedInjector(injector, ngModule.injector) : injector;
    const rendererFactory = rootViewInjector.get(RendererFactory2, domRendererFactory3);
    const sanitizer = rootViewInjector.get(Sanitizer, null);
    const hostRenderer = rendererFactory.createRenderer(null, this.componentDef);
    const elementName = this.componentDef.selectors[0][0] || "div";
    const hostRNode = rootSelectorOrNode ? locateHostElement(hostRenderer, rootSelectorOrNode, this.componentDef.encapsulation) : createElementNode(rendererFactory.createRenderer(null, this.componentDef), elementName, getNamespace(elementName));
    const rootFlags = this.componentDef.onPush ? 64 | 512 : 16 | 512;
    const rootContext = createRootContext();
    const rootTView = createTView(0, null, null, 1, 0, null, null, null, null, null);
    const rootLView = createLView(null, rootTView, rootContext, rootFlags, null, null, rendererFactory, hostRenderer, sanitizer, rootViewInjector);
    enterView(rootLView);
    let component;
    let tElementNode;
    try {
      const componentView = createRootComponentView(hostRNode, this.componentDef, rootLView, rendererFactory, hostRenderer);
      if (hostRNode) {
        if (rootSelectorOrNode) {
          setUpAttributes(hostRenderer, hostRNode, ["ng-version", VERSION.full]);
        } else {
          const { attrs, classes } = extractAttrsAndClassesFromSelector(this.componentDef.selectors[0]);
          if (attrs) {
            setUpAttributes(hostRenderer, hostRNode, attrs);
          }
          if (classes && classes.length > 0) {
            writeDirectClass(hostRenderer, hostRNode, classes.join(" "));
          }
        }
      }
      tElementNode = getTNode(rootTView, HEADER_OFFSET);
      if (projectableNodes !== void 0) {
        const projection = tElementNode.projection = [];
        for (let i = 0; i < this.ngContentSelectors.length; i++) {
          const nodesforSlot = projectableNodes[i];
          projection.push(nodesforSlot != null ? Array.from(nodesforSlot) : null);
        }
      }
      component = createRootComponent(componentView, this.componentDef, rootLView, rootContext, [LifecycleHooksFeature]);
      renderView(rootTView, rootLView, null);
    } finally {
      leaveView();
    }
    return new ComponentRef(this.componentType, component, createElementRef(tElementNode, rootLView), rootLView, tElementNode);
  }
}
new ComponentFactoryResolver();
class ComponentRef extends ComponentRef$1 {
  constructor(componentType, instance, location2, _rootLView, _tNode) {
    super();
    this.location = location2;
    this._rootLView = _rootLView;
    this._tNode = _tNode;
    this.instance = instance;
    this.hostView = this.changeDetectorRef = new RootViewRef(_rootLView);
    this.componentType = componentType;
  }
  get injector() {
    return new NodeInjector(this._tNode, this._rootLView);
  }
  destroy() {
    this.hostView.destroy();
  }
  onDestroy(callback) {
    this.hostView.onDestroy(callback);
  }
}
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
function setClassMetadata(type, decorators, ctorParameters, propDecorators) {
  return noSideEffects(() => {
    const clazz = type;
    if (decorators !== null) {
      if (clazz.hasOwnProperty("decorators") && clazz.decorators !== void 0) {
        clazz.decorators.push(...decorators);
      } else {
        clazz.decorators = decorators;
      }
    }
    if (ctorParameters !== null) {
      clazz.ctorParameters = ctorParameters;
    }
    if (propDecorators !== null) {
      if (clazz.hasOwnProperty("propDecorators") && clazz.propDecorators !== void 0) {
        clazz.propDecorators = { ...clazz.propDecorators, ...propDecorators };
      } else {
        clazz.propDecorators = propDecorators;
      }
    }
  });
}
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
class NgModuleRef$1 {
}
class NgModuleFactory$1 {
}
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
const modules = /* @__PURE__ */ new Map();
function assertSameOrNotExisting(id, type, incoming) {
  if (type && type !== incoming) {
    throw new Error(`Duplicate module registered for ${id} - ${stringify(type)} vs ${stringify(type.name)}`);
  }
}
function registerNgModuleType(ngModuleType) {
  const visited = /* @__PURE__ */ new Set();
  recurse(ngModuleType);
  function recurse(ngModuleType2) {
    const def = getNgModuleDef(
      ngModuleType2,
      /* throwNotFound */
      true
    );
    const id = def.id;
    if (id !== null) {
      const existing = modules.get(id);
      assertSameOrNotExisting(id, existing, ngModuleType2);
      modules.set(id, ngModuleType2);
    }
    const imports = maybeUnwrapFn(def.imports);
    for (const i of imports) {
      if (!visited.has(i)) {
        visited.add(i);
        recurse(i);
      }
    }
  }
}
function getRegisteredNgModuleType(id) {
  return modules.get(id) || autoRegisterModuleById[id];
}
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
function createNgModuleRef(ngModule, parentInjector) {
  return new NgModuleRef(ngModule, parentInjector ?? null);
}
class NgModuleRef extends NgModuleRef$1 {
  constructor(ngModuleType, _parent) {
    super();
    this._parent = _parent;
    this._bootstrapComponents = [];
    this.injector = this;
    this.destroyCbs = [];
    this.componentFactoryResolver = new ComponentFactoryResolver(this);
    const ngModuleDef = getNgModuleDef(ngModuleType);
    ngDevMode && assertDefined(ngModuleDef, `NgModule '${stringify(ngModuleType)}' is not a subtype of 'NgModuleType'.`);
    this._bootstrapComponents = maybeUnwrapFn(ngModuleDef.bootstrap);
    this._r3Injector = createInjectorWithoutInjectorInstances(ngModuleType, _parent, [
      { provide: NgModuleRef$1, useValue: this },
      {
        provide: ComponentFactoryResolver$1,
        useValue: this.componentFactoryResolver
      }
    ], stringify(ngModuleType));
    this._r3Injector._resolveInjectorDefTypes();
    this.instance = this.get(ngModuleType);
  }
  get(token, notFoundValue = Injector.THROW_IF_NOT_FOUND, injectFlags = InjectFlags.Default) {
    if (token === Injector || token === NgModuleRef$1 || token === INJECTOR) {
      return this;
    }
    return this._r3Injector.get(token, notFoundValue, injectFlags);
  }
  destroy() {
    ngDevMode && assertDefined(this.destroyCbs, "NgModule already destroyed");
    const injector = this._r3Injector;
    !injector.destroyed && injector.destroy();
    this.destroyCbs.forEach((fn) => fn());
    this.destroyCbs = null;
  }
  onDestroy(callback) {
    ngDevMode && assertDefined(this.destroyCbs, "NgModule already destroyed");
    this.destroyCbs.push(callback);
  }
}
class NgModuleFactory extends NgModuleFactory$1 {
  constructor(moduleType) {
    super();
    this.moduleType = moduleType;
    const ngModuleDef = getNgModuleDef(moduleType);
    if (ngModuleDef !== null) {
      registerNgModuleType(moduleType);
    }
  }
  create(parentInjector) {
    return new NgModuleRef(this.moduleType, parentInjector);
  }
}
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
function ɵɵpureFunction0(slotOffset, pureFn, thisArg) {
  const bindingIndex = getBindingRoot() + slotOffset;
  const lView = getLView();
  return lView[bindingIndex] === NO_CHANGE ? updateBinding(lView, bindingIndex, thisArg ? pureFn.call(thisArg) : pureFn()) : getBinding(lView, bindingIndex);
}
function ɵɵpureFunction1(slotOffset, pureFn, exp, thisArg) {
  return pureFunction1Internal(getLView(), getBindingRoot(), slotOffset, pureFn, exp, thisArg);
}
function ɵɵpureFunction2(slotOffset, pureFn, exp1, exp2, thisArg) {
  return pureFunction2Internal(getLView(), getBindingRoot(), slotOffset, pureFn, exp1, exp2, thisArg);
}
function ɵɵpureFunction3(slotOffset, pureFn, exp1, exp2, exp3, thisArg) {
  return pureFunction3Internal(getLView(), getBindingRoot(), slotOffset, pureFn, exp1, exp2, exp3, thisArg);
}
function ɵɵpureFunction4(slotOffset, pureFn, exp1, exp2, exp3, exp4, thisArg) {
  return pureFunction4Internal(getLView(), getBindingRoot(), slotOffset, pureFn, exp1, exp2, exp3, exp4, thisArg);
}
function ɵɵpureFunction5(slotOffset, pureFn, exp1, exp2, exp3, exp4, exp5, thisArg) {
  const bindingIndex = getBindingRoot() + slotOffset;
  const lView = getLView();
  const different = bindingUpdated4(lView, bindingIndex, exp1, exp2, exp3, exp4);
  return bindingUpdated(lView, bindingIndex + 4, exp5) || different ? updateBinding(lView, bindingIndex + 5, thisArg ? pureFn.call(thisArg, exp1, exp2, exp3, exp4, exp5) : pureFn(exp1, exp2, exp3, exp4, exp5)) : getBinding(lView, bindingIndex + 5);
}
function ɵɵpureFunction6(slotOffset, pureFn, exp1, exp2, exp3, exp4, exp5, exp6, thisArg) {
  const bindingIndex = getBindingRoot() + slotOffset;
  const lView = getLView();
  const different = bindingUpdated4(lView, bindingIndex, exp1, exp2, exp3, exp4);
  return bindingUpdated2(lView, bindingIndex + 4, exp5, exp6) || different ? updateBinding(lView, bindingIndex + 6, thisArg ? pureFn.call(thisArg, exp1, exp2, exp3, exp4, exp5, exp6) : pureFn(exp1, exp2, exp3, exp4, exp5, exp6)) : getBinding(lView, bindingIndex + 6);
}
function ɵɵpureFunction7(slotOffset, pureFn, exp1, exp2, exp3, exp4, exp5, exp6, exp7, thisArg) {
  const bindingIndex = getBindingRoot() + slotOffset;
  const lView = getLView();
  let different = bindingUpdated4(lView, bindingIndex, exp1, exp2, exp3, exp4);
  return bindingUpdated3(lView, bindingIndex + 4, exp5, exp6, exp7) || different ? updateBinding(lView, bindingIndex + 7, thisArg ? pureFn.call(thisArg, exp1, exp2, exp3, exp4, exp5, exp6, exp7) : pureFn(exp1, exp2, exp3, exp4, exp5, exp6, exp7)) : getBinding(lView, bindingIndex + 7);
}
function ɵɵpureFunction8(slotOffset, pureFn, exp1, exp2, exp3, exp4, exp5, exp6, exp7, exp8, thisArg) {
  const bindingIndex = getBindingRoot() + slotOffset;
  const lView = getLView();
  const different = bindingUpdated4(lView, bindingIndex, exp1, exp2, exp3, exp4);
  return bindingUpdated4(lView, bindingIndex + 4, exp5, exp6, exp7, exp8) || different ? updateBinding(lView, bindingIndex + 8, thisArg ? pureFn.call(thisArg, exp1, exp2, exp3, exp4, exp5, exp6, exp7, exp8) : pureFn(exp1, exp2, exp3, exp4, exp5, exp6, exp7, exp8)) : getBinding(lView, bindingIndex + 8);
}
function ɵɵpureFunctionV(slotOffset, pureFn, exps, thisArg) {
  return pureFunctionVInternal(getLView(), getBindingRoot(), slotOffset, pureFn, exps, thisArg);
}
function getPureFunctionReturnValue(lView, returnValueIndex) {
  ngDevMode && assertIndexInRange(lView, returnValueIndex);
  const lastReturnValue = lView[returnValueIndex];
  return lastReturnValue === NO_CHANGE ? void 0 : lastReturnValue;
}
function pureFunction1Internal(lView, bindingRoot, slotOffset, pureFn, exp, thisArg) {
  const bindingIndex = bindingRoot + slotOffset;
  return bindingUpdated(lView, bindingIndex, exp) ? updateBinding(lView, bindingIndex + 1, thisArg ? pureFn.call(thisArg, exp) : pureFn(exp)) : getPureFunctionReturnValue(lView, bindingIndex + 1);
}
function pureFunction2Internal(lView, bindingRoot, slotOffset, pureFn, exp1, exp2, thisArg) {
  const bindingIndex = bindingRoot + slotOffset;
  return bindingUpdated2(lView, bindingIndex, exp1, exp2) ? updateBinding(lView, bindingIndex + 2, thisArg ? pureFn.call(thisArg, exp1, exp2) : pureFn(exp1, exp2)) : getPureFunctionReturnValue(lView, bindingIndex + 2);
}
function pureFunction3Internal(lView, bindingRoot, slotOffset, pureFn, exp1, exp2, exp3, thisArg) {
  const bindingIndex = bindingRoot + slotOffset;
  return bindingUpdated3(lView, bindingIndex, exp1, exp2, exp3) ? updateBinding(lView, bindingIndex + 3, thisArg ? pureFn.call(thisArg, exp1, exp2, exp3) : pureFn(exp1, exp2, exp3)) : getPureFunctionReturnValue(lView, bindingIndex + 3);
}
function pureFunction4Internal(lView, bindingRoot, slotOffset, pureFn, exp1, exp2, exp3, exp4, thisArg) {
  const bindingIndex = bindingRoot + slotOffset;
  return bindingUpdated4(lView, bindingIndex, exp1, exp2, exp3, exp4) ? updateBinding(lView, bindingIndex + 4, thisArg ? pureFn.call(thisArg, exp1, exp2, exp3, exp4) : pureFn(exp1, exp2, exp3, exp4)) : getPureFunctionReturnValue(lView, bindingIndex + 4);
}
function pureFunctionVInternal(lView, bindingRoot, slotOffset, pureFn, exps, thisArg) {
  let bindingIndex = bindingRoot + slotOffset;
  let different = false;
  for (let i = 0; i < exps.length; i++) {
    bindingUpdated(lView, bindingIndex++, exps[i]) && (different = true);
  }
  return different ? updateBinding(lView, bindingIndex, pureFn.apply(thisArg, exps)) : getPureFunctionReturnValue(lView, bindingIndex);
}
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
function ɵɵpipe(index, pipeName) {
  const tView = getTView();
  let pipeDef;
  const adjustedIndex = index + HEADER_OFFSET;
  if (tView.firstCreatePass) {
    pipeDef = getPipeDef(pipeName, tView.pipeRegistry);
    tView.data[adjustedIndex] = pipeDef;
    if (pipeDef.onDestroy) {
      (tView.destroyHooks || (tView.destroyHooks = [])).push(adjustedIndex, pipeDef.onDestroy);
    }
  } else {
    pipeDef = tView.data[adjustedIndex];
  }
  const pipeFactory = pipeDef.factory || (pipeDef.factory = getFactoryDef(pipeDef.type, true));
  const previousInjectImplementation = setInjectImplementation(ɵɵdirectiveInject);
  try {
    const previousIncludeViewProviders = setIncludeViewProviders(false);
    const pipeInstance = pipeFactory();
    setIncludeViewProviders(previousIncludeViewProviders);
    store(tView, getLView(), adjustedIndex, pipeInstance);
    return pipeInstance;
  } finally {
    setInjectImplementation(previousInjectImplementation);
  }
}
function getPipeDef(name, registry) {
  if (registry) {
    for (let i = registry.length - 1; i >= 0; i--) {
      const pipeDef = registry[i];
      if (name === pipeDef.name) {
        return pipeDef;
      }
    }
  }
  if (ngDevMode) {
    const lView = getLView();
    const declarationLView = lView[DECLARATION_COMPONENT_VIEW];
    const context = declarationLView[CONTEXT];
    const component = context ? ` in the '${context.constructor.name}' component` : "";
    throw new RuntimeError(-302, `The pipe '${name}' could not be found${component}!`);
  }
}
function ɵɵpipeBind1(index, slotOffset, v1) {
  const adjustedIndex = index + HEADER_OFFSET;
  const lView = getLView();
  const pipeInstance = load(lView, adjustedIndex);
  return isPure(lView, adjustedIndex) ? pureFunction1Internal(lView, getBindingRoot(), slotOffset, pipeInstance.transform, v1, pipeInstance) : pipeInstance.transform(v1);
}
function ɵɵpipeBind2(index, slotOffset, v1, v2) {
  const adjustedIndex = index + HEADER_OFFSET;
  const lView = getLView();
  const pipeInstance = load(lView, adjustedIndex);
  return isPure(lView, adjustedIndex) ? pureFunction2Internal(lView, getBindingRoot(), slotOffset, pipeInstance.transform, v1, v2, pipeInstance) : pipeInstance.transform(v1, v2);
}
function ɵɵpipeBind3(index, slotOffset, v1, v2, v3) {
  const adjustedIndex = index + HEADER_OFFSET;
  const lView = getLView();
  const pipeInstance = load(lView, adjustedIndex);
  return isPure(lView, adjustedIndex) ? pureFunction3Internal(lView, getBindingRoot(), slotOffset, pipeInstance.transform, v1, v2, v3, pipeInstance) : pipeInstance.transform(v1, v2, v3);
}
function ɵɵpipeBind4(index, slotOffset, v1, v2, v3, v4) {
  const adjustedIndex = index + HEADER_OFFSET;
  const lView = getLView();
  const pipeInstance = load(lView, adjustedIndex);
  return isPure(lView, adjustedIndex) ? pureFunction4Internal(lView, getBindingRoot(), slotOffset, pipeInstance.transform, v1, v2, v3, v4, pipeInstance) : pipeInstance.transform(v1, v2, v3, v4);
}
function ɵɵpipeBindV(index, slotOffset, values) {
  const adjustedIndex = index + HEADER_OFFSET;
  const lView = getLView();
  const pipeInstance = load(lView, adjustedIndex);
  return isPure(lView, adjustedIndex) ? pureFunctionVInternal(lView, getBindingRoot(), slotOffset, pipeInstance.transform, values, pipeInstance) : pipeInstance.transform.apply(pipeInstance, values);
}
function isPure(lView, index) {
  return lView[TVIEW].data[index].pure;
}
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
class EventEmitter_ extends Subject {
  constructor(isAsync = false) {
    super();
    this.__isAsync = isAsync;
  }
  emit(value) {
    super.next(value);
  }
  subscribe(observerOrNext, error, complete) {
    let nextFn = observerOrNext;
    let errorFn = error || (() => null);
    let completeFn = complete;
    if (observerOrNext && typeof observerOrNext === "object") {
      const observer = observerOrNext;
      nextFn = observer.next?.bind(observer);
      errorFn = observer.error?.bind(observer);
      completeFn = observer.complete?.bind(observer);
    }
    if (this.__isAsync) {
      errorFn = _wrapInTimeout(errorFn);
      if (nextFn) {
        nextFn = _wrapInTimeout(nextFn);
      }
      if (completeFn) {
        completeFn = _wrapInTimeout(completeFn);
      }
    }
    const sink = super.subscribe({ next: nextFn, error: errorFn, complete: completeFn });
    if (observerOrNext instanceof Subscription) {
      observerOrNext.add(sink);
    }
    return sink;
  }
}
function _wrapInTimeout(fn) {
  return (value) => {
    setTimeout(fn, void 0, value);
  };
}
const EventEmitter = EventEmitter_;
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
function symbolIterator() {
  return this._results[getSymbolIterator()]();
}
class QueryList {
  /**
   * @param emitDistinctChangesOnly Whether `QueryList.changes` should fire only when actual change
   *     has occurred. Or if it should fire when query is recomputed. (recomputing could resolve in
   *     the same result)
   */
  constructor(_emitDistinctChangesOnly = false) {
    this._emitDistinctChangesOnly = _emitDistinctChangesOnly;
    this.dirty = true;
    this._results = [];
    this._changesDetected = false;
    this._changes = null;
    this.length = 0;
    this.first = void 0;
    this.last = void 0;
    const symbol = getSymbolIterator();
    const proto = QueryList.prototype;
    if (!proto[symbol])
      proto[symbol] = symbolIterator;
  }
  /**
   * Returns `Observable` of `QueryList` notifying the subscriber of changes.
   */
  get changes() {
    return this._changes || (this._changes = new EventEmitter());
  }
  /**
   * Returns the QueryList entry at `index`.
   */
  get(index) {
    return this._results[index];
  }
  /**
   * See
   * [Array.map](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/map)
   */
  map(fn) {
    return this._results.map(fn);
  }
  /**
   * See
   * [Array.filter](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/filter)
   */
  filter(fn) {
    return this._results.filter(fn);
  }
  /**
   * See
   * [Array.find](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/find)
   */
  find(fn) {
    return this._results.find(fn);
  }
  /**
   * See
   * [Array.reduce](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/reduce)
   */
  reduce(fn, init) {
    return this._results.reduce(fn, init);
  }
  /**
   * See
   * [Array.forEach](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/forEach)
   */
  forEach(fn) {
    this._results.forEach(fn);
  }
  /**
   * See
   * [Array.some](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/some)
   */
  some(fn) {
    return this._results.some(fn);
  }
  /**
   * Returns a copy of the internal results list as an Array.
   */
  toArray() {
    return this._results.slice();
  }
  toString() {
    return this._results.toString();
  }
  /**
   * Updates the stored data of the query list, and resets the `dirty` flag to `false`, so that
   * on change detection, it will not notify of changes to the queries, unless a new change
   * occurs.
   *
   * @param resultsTree The query results to store
   * @param identityAccessor Optional function for extracting stable object identity from a value
   *    in the array. This function is executed for each element of the query result list while
   *    comparing current query list with the new one (provided as a first argument of the `reset`
   *    function) to detect if the lists are different. If the function is not provided, elements
   *    are compared as is (without any pre-processing).
   */
  reset(resultsTree, identityAccessor) {
    const self2 = this;
    self2.dirty = false;
    const newResultFlat = flatten(resultsTree);
    if (this._changesDetected = !arrayEquals(self2._results, newResultFlat, identityAccessor)) {
      self2._results = newResultFlat;
      self2.length = newResultFlat.length;
      self2.last = newResultFlat[this.length - 1];
      self2.first = newResultFlat[0];
    }
  }
  /**
   * Triggers a change event by emitting on the `changes` {@link EventEmitter}.
   */
  notifyOnChanges() {
    if (this._changes && (this._changesDetected || !this._emitDistinctChangesOnly))
      this._changes.emit(this);
  }
  /** internal */
  setDirty() {
    this.dirty = true;
  }
  /** internal */
  destroy() {
    this.changes.complete();
    this.changes.unsubscribe();
  }
}
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
class TemplateRef {
}
TemplateRef.__NG_ELEMENT_ID__ = injectTemplateRef;
const ViewEngineTemplateRef = TemplateRef;
const R3TemplateRef = class TemplateRef2 extends ViewEngineTemplateRef {
  constructor(_declarationLView, _declarationTContainer, elementRef) {
    super();
    this._declarationLView = _declarationLView;
    this._declarationTContainer = _declarationTContainer;
    this.elementRef = elementRef;
  }
  createEmbeddedView(context) {
    const embeddedTView = this._declarationTContainer.tViews;
    const embeddedLView = createLView(this._declarationLView, embeddedTView, context, 16, null, embeddedTView.declTNode, null, null, null, null);
    const declarationLContainer = this._declarationLView[this._declarationTContainer.index];
    ngDevMode && assertLContainer(declarationLContainer);
    embeddedLView[DECLARATION_LCONTAINER] = declarationLContainer;
    const declarationViewLQueries = this._declarationLView[QUERIES];
    if (declarationViewLQueries !== null) {
      embeddedLView[QUERIES] = declarationViewLQueries.createEmbeddedView(embeddedTView);
    }
    renderView(embeddedTView, embeddedLView, context);
    return new ViewRef$1(embeddedLView);
  }
};
function injectTemplateRef() {
  return createTemplateRef(getCurrentTNode(), getLView());
}
function createTemplateRef(hostTNode, hostLView) {
  if (hostTNode.type & 4) {
    ngDevMode && assertDefined(hostTNode.tViews, "TView must be allocated");
    return new R3TemplateRef(hostLView, hostTNode, createElementRef(hostTNode, hostLView));
  }
  return null;
}
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
class ViewContainerRef {
}
ViewContainerRef.__NG_ELEMENT_ID__ = injectViewContainerRef;
function injectViewContainerRef() {
  const previousTNode = getCurrentTNode();
  return createContainerRef(previousTNode, getLView());
}
const VE_ViewContainerRef = ViewContainerRef;
const R3ViewContainerRef = class ViewContainerRef2 extends VE_ViewContainerRef {
  constructor(_lContainer, _hostTNode, _hostLView) {
    super();
    this._lContainer = _lContainer;
    this._hostTNode = _hostTNode;
    this._hostLView = _hostLView;
  }
  get element() {
    return createElementRef(this._hostTNode, this._hostLView);
  }
  get injector() {
    return new NodeInjector(this._hostTNode, this._hostLView);
  }
  /** @deprecated No replacement */
  get parentInjector() {
    const parentLocation = getParentInjectorLocation(this._hostTNode, this._hostLView);
    if (hasParentInjector(parentLocation)) {
      const parentView = getParentInjectorView(parentLocation, this._hostLView);
      const injectorIndex = getParentInjectorIndex(parentLocation);
      ngDevMode && assertNodeInjector(parentView, injectorIndex);
      const parentTNode = parentView[TVIEW].data[
        injectorIndex + 8
        /* TNODE */
      ];
      return new NodeInjector(parentTNode, parentView);
    } else {
      return new NodeInjector(null, this._hostLView);
    }
  }
  clear() {
    while (this.length > 0) {
      this.remove(this.length - 1);
    }
  }
  get(index) {
    const viewRefs = getViewRefs(this._lContainer);
    return viewRefs !== null && viewRefs[index] || null;
  }
  get length() {
    return this._lContainer.length - CONTAINER_HEADER_OFFSET;
  }
  createEmbeddedView(templateRef, context, index) {
    const viewRef = templateRef.createEmbeddedView(context || {});
    this.insert(viewRef, index);
    return viewRef;
  }
  createComponent(componentFactoryOrType, indexOrOptions, injector, projectableNodes, ngModuleRef) {
    const isComponentFactory = componentFactoryOrType && !isType(componentFactoryOrType);
    let index;
    if (isComponentFactory) {
      if (ngDevMode) {
        assertEqual(typeof indexOrOptions !== "object", true, "It looks like Component factory was provided as the first argument and an options object as the second argument. This combination of arguments is incompatible. You can either change the first argument to provide Component type or change the second argument to be a number (representing an index at which to insert the new component's host view into this container)");
      }
      index = indexOrOptions;
    } else {
      if (ngDevMode) {
        assertDefined(getComponentDef(componentFactoryOrType), `Provided Component class doesn't contain Component definition. Please check whether provided class has @Component decorator.`);
        assertEqual(typeof indexOrOptions !== "number", true, "It looks like Component type was provided as the first argument and a number (representing an index at which to insert the new component's host view into this container as the second argument. This combination of arguments is incompatible. Please use an object as the second argument instead.");
      }
      const options = indexOrOptions || {};
      index = options.index;
      injector = options.injector;
      projectableNodes = options.projectableNodes;
      ngModuleRef = options.ngModuleRef;
    }
    const componentFactory = isComponentFactory ? componentFactoryOrType : new ComponentFactory(getComponentDef(componentFactoryOrType));
    const contextInjector = injector || this.parentInjector;
    if (!ngModuleRef && componentFactory.ngModule == null) {
      const _injector = isComponentFactory ? contextInjector : this.parentInjector;
      const result = _injector.get(NgModuleRef$1, null);
      if (result) {
        ngModuleRef = result;
      }
    }
    const componentRef = componentFactory.create(contextInjector, projectableNodes, void 0, ngModuleRef);
    this.insert(componentRef.hostView, index);
    return componentRef;
  }
  insert(viewRef, index) {
    const lView = viewRef._lView;
    const tView = lView[TVIEW];
    if (ngDevMode && viewRef.destroyed) {
      throw new Error("Cannot insert a destroyed View in a ViewContainer!");
    }
    if (viewAttachedToContainer(lView)) {
      const prevIdx = this.indexOf(viewRef);
      if (prevIdx !== -1) {
        this.detach(prevIdx);
      } else {
        const prevLContainer = lView[PARENT];
        ngDevMode && assertEqual(isLContainer(prevLContainer), true, "An attached view should have its PARENT point to a container.");
        const prevVCRef = new R3ViewContainerRef(prevLContainer, prevLContainer[T_HOST], prevLContainer[PARENT]);
        prevVCRef.detach(prevVCRef.indexOf(viewRef));
      }
    }
    const adjustedIdx = this._adjustIndex(index);
    const lContainer = this._lContainer;
    insertView(tView, lView, lContainer, adjustedIdx);
    const beforeNode = getBeforeNodeForView(adjustedIdx, lContainer);
    const renderer = lView[RENDERER];
    const parentRNode = nativeParentNode(renderer, lContainer[NATIVE]);
    if (parentRNode !== null) {
      addViewToContainer(tView, lContainer[T_HOST], renderer, lView, parentRNode, beforeNode);
    }
    viewRef.attachToViewContainerRef();
    addToArray(getOrCreateViewRefs(lContainer), adjustedIdx, viewRef);
    return viewRef;
  }
  move(viewRef, newIndex) {
    if (ngDevMode && viewRef.destroyed) {
      throw new Error("Cannot move a destroyed View in a ViewContainer!");
    }
    return this.insert(viewRef, newIndex);
  }
  indexOf(viewRef) {
    const viewRefsArr = getViewRefs(this._lContainer);
    return viewRefsArr !== null ? viewRefsArr.indexOf(viewRef) : -1;
  }
  remove(index) {
    const adjustedIdx = this._adjustIndex(index, -1);
    const detachedView = detachView(this._lContainer, adjustedIdx);
    if (detachedView) {
      removeFromArray(getOrCreateViewRefs(this._lContainer), adjustedIdx);
      destroyLView(detachedView[TVIEW], detachedView);
    }
  }
  detach(index) {
    const adjustedIdx = this._adjustIndex(index, -1);
    const view = detachView(this._lContainer, adjustedIdx);
    const wasDetached = view && removeFromArray(getOrCreateViewRefs(this._lContainer), adjustedIdx) != null;
    return wasDetached ? new ViewRef$1(view) : null;
  }
  _adjustIndex(index, shift = 0) {
    if (index == null) {
      return this.length + shift;
    }
    if (ngDevMode) {
      assertGreaterThan(index, -1, `ViewRef index must be positive, got ${index}`);
      assertLessThan(index, this.length + 1 + shift, "index");
    }
    return index;
  }
};
function getViewRefs(lContainer) {
  return lContainer[VIEW_REFS];
}
function getOrCreateViewRefs(lContainer) {
  return lContainer[VIEW_REFS] || (lContainer[VIEW_REFS] = []);
}
function createContainerRef(hostTNode, hostLView) {
  ngDevMode && assertTNodeType(
    hostTNode,
    12 | 3
    /* AnyRNode */
  );
  let lContainer;
  const slotValue = hostLView[hostTNode.index];
  if (isLContainer(slotValue)) {
    lContainer = slotValue;
  } else {
    let commentNode;
    if (hostTNode.type & 8) {
      commentNode = unwrapRNode(slotValue);
    } else {
      const renderer = hostLView[RENDERER];
      ngDevMode && ngDevMode.rendererCreateComment++;
      commentNode = renderer.createComment(ngDevMode ? "container" : "");
      const hostNative = getNativeByTNode(hostTNode, hostLView);
      const parentOfHostNative = nativeParentNode(renderer, hostNative);
      nativeInsertBefore(renderer, parentOfHostNative, commentNode, nativeNextSibling(renderer, hostNative), false);
    }
    hostLView[hostTNode.index] = lContainer = createLContainer(slotValue, hostLView, commentNode, hostTNode);
    addToViewTree(hostLView, lContainer);
  }
  return new R3ViewContainerRef(lContainer, hostTNode, hostLView);
}
class LQuery_ {
  constructor(queryList) {
    this.queryList = queryList;
    this.matches = null;
  }
  clone() {
    return new LQuery_(this.queryList);
  }
  setDirty() {
    this.queryList.setDirty();
  }
}
class LQueries_ {
  constructor(queries = []) {
    this.queries = queries;
  }
  createEmbeddedView(tView) {
    const tQueries = tView.queries;
    if (tQueries !== null) {
      const noOfInheritedQueries = tView.contentQueries !== null ? tView.contentQueries[0] : tQueries.length;
      const viewLQueries = [];
      for (let i = 0; i < noOfInheritedQueries; i++) {
        const tQuery = tQueries.getByIndex(i);
        const parentLQuery = this.queries[tQuery.indexInDeclarationView];
        viewLQueries.push(parentLQuery.clone());
      }
      return new LQueries_(viewLQueries);
    }
    return null;
  }
  insertView(tView) {
    this.dirtyQueriesWithMatches(tView);
  }
  detachView(tView) {
    this.dirtyQueriesWithMatches(tView);
  }
  dirtyQueriesWithMatches(tView) {
    for (let i = 0; i < this.queries.length; i++) {
      if (getTQuery(tView, i).matches !== null) {
        this.queries[i].setDirty();
      }
    }
  }
}
class TQueryMetadata_ {
  constructor(predicate, flags, read = null) {
    this.predicate = predicate;
    this.flags = flags;
    this.read = read;
  }
}
class TQueries_ {
  constructor(queries = []) {
    this.queries = queries;
  }
  elementStart(tView, tNode) {
    ngDevMode && assertFirstCreatePass(tView, "Queries should collect results on the first template pass only");
    for (let i = 0; i < this.queries.length; i++) {
      this.queries[i].elementStart(tView, tNode);
    }
  }
  elementEnd(tNode) {
    for (let i = 0; i < this.queries.length; i++) {
      this.queries[i].elementEnd(tNode);
    }
  }
  embeddedTView(tNode) {
    let queriesForTemplateRef = null;
    for (let i = 0; i < this.length; i++) {
      const childQueryIndex = queriesForTemplateRef !== null ? queriesForTemplateRef.length : 0;
      const tqueryClone = this.getByIndex(i).embeddedTView(tNode, childQueryIndex);
      if (tqueryClone) {
        tqueryClone.indexInDeclarationView = i;
        if (queriesForTemplateRef !== null) {
          queriesForTemplateRef.push(tqueryClone);
        } else {
          queriesForTemplateRef = [tqueryClone];
        }
      }
    }
    return queriesForTemplateRef !== null ? new TQueries_(queriesForTemplateRef) : null;
  }
  template(tView, tNode) {
    ngDevMode && assertFirstCreatePass(tView, "Queries should collect results on the first template pass only");
    for (let i = 0; i < this.queries.length; i++) {
      this.queries[i].template(tView, tNode);
    }
  }
  getByIndex(index) {
    ngDevMode && assertIndexInRange(this.queries, index);
    return this.queries[index];
  }
  get length() {
    return this.queries.length;
  }
  track(tquery) {
    this.queries.push(tquery);
  }
}
class TQuery_ {
  constructor(metadata, nodeIndex = -1) {
    this.metadata = metadata;
    this.matches = null;
    this.indexInDeclarationView = -1;
    this.crossesNgTemplate = false;
    this._appliesToNextNode = true;
    this._declarationNodeIndex = nodeIndex;
  }
  elementStart(tView, tNode) {
    if (this.isApplyingToNode(tNode)) {
      this.matchTNode(tView, tNode);
    }
  }
  elementEnd(tNode) {
    if (this._declarationNodeIndex === tNode.index) {
      this._appliesToNextNode = false;
    }
  }
  template(tView, tNode) {
    this.elementStart(tView, tNode);
  }
  embeddedTView(tNode, childQueryIndex) {
    if (this.isApplyingToNode(tNode)) {
      this.crossesNgTemplate = true;
      this.addMatch(-tNode.index, childQueryIndex);
      return new TQuery_(this.metadata);
    }
    return null;
  }
  isApplyingToNode(tNode) {
    if (this._appliesToNextNode && (this.metadata.flags & 1) !== 1) {
      const declarationNodeIdx = this._declarationNodeIndex;
      let parent = tNode.parent;
      while (parent !== null && parent.type & 8 && parent.index !== declarationNodeIdx) {
        parent = parent.parent;
      }
      return declarationNodeIdx === (parent !== null ? parent.index : -1);
    }
    return this._appliesToNextNode;
  }
  matchTNode(tView, tNode) {
    const predicate = this.metadata.predicate;
    if (Array.isArray(predicate)) {
      for (let i = 0; i < predicate.length; i++) {
        const name = predicate[i];
        this.matchTNodeWithReadOption(tView, tNode, getIdxOfMatchingSelector(tNode, name));
        this.matchTNodeWithReadOption(tView, tNode, locateDirectiveOrProvider(tNode, tView, name, false, false));
      }
    } else {
      if (predicate === TemplateRef) {
        if (tNode.type & 4) {
          this.matchTNodeWithReadOption(tView, tNode, -1);
        }
      } else {
        this.matchTNodeWithReadOption(tView, tNode, locateDirectiveOrProvider(tNode, tView, predicate, false, false));
      }
    }
  }
  matchTNodeWithReadOption(tView, tNode, nodeMatchIdx) {
    if (nodeMatchIdx !== null) {
      const read = this.metadata.read;
      if (read !== null) {
        if (read === ElementRef || read === ViewContainerRef || read === TemplateRef && tNode.type & 4) {
          this.addMatch(tNode.index, -2);
        } else {
          const directiveOrProviderIdx = locateDirectiveOrProvider(tNode, tView, read, false, false);
          if (directiveOrProviderIdx !== null) {
            this.addMatch(tNode.index, directiveOrProviderIdx);
          }
        }
      } else {
        this.addMatch(tNode.index, nodeMatchIdx);
      }
    }
  }
  addMatch(tNodeIdx, matchIdx) {
    if (this.matches === null) {
      this.matches = [tNodeIdx, matchIdx];
    } else {
      this.matches.push(tNodeIdx, matchIdx);
    }
  }
}
function getIdxOfMatchingSelector(tNode, selector) {
  const localNames = tNode.localNames;
  if (localNames !== null) {
    for (let i = 0; i < localNames.length; i += 2) {
      if (localNames[i] === selector) {
        return localNames[i + 1];
      }
    }
  }
  return null;
}
function createResultByTNodeType(tNode, currentView) {
  if (tNode.type & (3 | 8)) {
    return createElementRef(tNode, currentView);
  } else if (tNode.type & 4) {
    return createTemplateRef(tNode, currentView);
  }
  return null;
}
function createResultForNode(lView, tNode, matchingIdx, read) {
  if (matchingIdx === -1) {
    return createResultByTNodeType(tNode, lView);
  } else if (matchingIdx === -2) {
    return createSpecialToken(lView, tNode, read);
  } else {
    return getNodeInjectable(lView, lView[TVIEW], matchingIdx, tNode);
  }
}
function createSpecialToken(lView, tNode, read) {
  if (read === ElementRef) {
    return createElementRef(tNode, lView);
  } else if (read === TemplateRef) {
    return createTemplateRef(tNode, lView);
  } else if (read === ViewContainerRef) {
    ngDevMode && assertTNodeType(
      tNode,
      3 | 12
      /* AnyContainer */
    );
    return createContainerRef(tNode, lView);
  } else {
    ngDevMode && throwError(`Special token to read should be one of ElementRef, TemplateRef or ViewContainerRef but got ${stringify(read)}.`);
  }
}
function materializeViewResults(tView, lView, tQuery, queryIndex) {
  const lQuery = lView[QUERIES].queries[queryIndex];
  if (lQuery.matches === null) {
    const tViewData = tView.data;
    const tQueryMatches = tQuery.matches;
    const result = [];
    for (let i = 0; i < tQueryMatches.length; i += 2) {
      const matchedNodeIdx = tQueryMatches[i];
      if (matchedNodeIdx < 0) {
        result.push(null);
      } else {
        ngDevMode && assertIndexInRange(tViewData, matchedNodeIdx);
        const tNode = tViewData[matchedNodeIdx];
        result.push(createResultForNode(lView, tNode, tQueryMatches[i + 1], tQuery.metadata.read));
      }
    }
    lQuery.matches = result;
  }
  return lQuery.matches;
}
function collectQueryResults(tView, lView, queryIndex, result) {
  const tQuery = tView.queries.getByIndex(queryIndex);
  const tQueryMatches = tQuery.matches;
  if (tQueryMatches !== null) {
    const lViewResults = materializeViewResults(tView, lView, tQuery, queryIndex);
    for (let i = 0; i < tQueryMatches.length; i += 2) {
      const tNodeIdx = tQueryMatches[i];
      if (tNodeIdx > 0) {
        result.push(lViewResults[i / 2]);
      } else {
        const childQueryIndex = tQueryMatches[i + 1];
        const declarationLContainer = lView[-tNodeIdx];
        ngDevMode && assertLContainer(declarationLContainer);
        for (let i2 = CONTAINER_HEADER_OFFSET; i2 < declarationLContainer.length; i2++) {
          const embeddedLView = declarationLContainer[i2];
          if (embeddedLView[DECLARATION_LCONTAINER] === embeddedLView[PARENT]) {
            collectQueryResults(embeddedLView[TVIEW], embeddedLView, childQueryIndex, result);
          }
        }
        if (declarationLContainer[MOVED_VIEWS] !== null) {
          const embeddedLViews = declarationLContainer[MOVED_VIEWS];
          for (let i2 = 0; i2 < embeddedLViews.length; i2++) {
            const embeddedLView = embeddedLViews[i2];
            collectQueryResults(embeddedLView[TVIEW], embeddedLView, childQueryIndex, result);
          }
        }
      }
    }
  }
  return result;
}
function ɵɵqueryRefresh(queryList) {
  const lView = getLView();
  const tView = getTView();
  const queryIndex = getCurrentQueryIndex();
  setCurrentQueryIndex(queryIndex + 1);
  const tQuery = getTQuery(tView, queryIndex);
  if (queryList.dirty && isCreationMode(lView) === ((tQuery.metadata.flags & 2) === 2)) {
    if (tQuery.matches === null) {
      queryList.reset([]);
    } else {
      const result = tQuery.crossesNgTemplate ? collectQueryResults(tView, lView, queryIndex, []) : materializeViewResults(tView, lView, tQuery, queryIndex);
      queryList.reset(result, unwrapElementRef);
      queryList.notifyOnChanges();
    }
    return true;
  }
  return false;
}
function ɵɵviewQuery(predicate, flags, read) {
  ngDevMode && assertNumber(flags, "Expecting flags");
  const tView = getTView();
  if (tView.firstCreatePass) {
    createTQuery(tView, new TQueryMetadata_(predicate, flags, read), -1);
    if ((flags & 2) === 2) {
      tView.staticViewQueries = true;
    }
  }
  createLQuery(tView, getLView(), flags);
}
function ɵɵcontentQuery(directiveIndex, predicate, flags, read) {
  ngDevMode && assertNumber(flags, "Expecting flags");
  const tView = getTView();
  if (tView.firstCreatePass) {
    const tNode = getCurrentTNode();
    createTQuery(tView, new TQueryMetadata_(predicate, flags, read), tNode.index);
    saveContentQueryAndDirectiveIndex(tView, directiveIndex);
    if ((flags & 2) === 2) {
      tView.staticContentQueries = true;
    }
  }
  createLQuery(tView, getLView(), flags);
}
function ɵɵloadQuery() {
  return loadQueryInternal(getLView(), getCurrentQueryIndex());
}
function loadQueryInternal(lView, queryIndex) {
  ngDevMode && assertDefined(lView[QUERIES], "LQueries should be defined when trying to load a query");
  ngDevMode && assertIndexInRange(lView[QUERIES].queries, queryIndex);
  return lView[QUERIES].queries[queryIndex].queryList;
}
function createLQuery(tView, lView, flags) {
  const queryList = new QueryList(
    (flags & 4) === 4
    /* emitDistinctChangesOnly */
  );
  storeCleanupWithContext(tView, lView, queryList, queryList.destroy);
  if (lView[QUERIES] === null)
    lView[QUERIES] = new LQueries_();
  lView[QUERIES].queries.push(new LQuery_(queryList));
}
function createTQuery(tView, metadata, nodeIndex) {
  if (tView.queries === null)
    tView.queries = new TQueries_();
  tView.queries.track(new TQuery_(metadata, nodeIndex));
}
function saveContentQueryAndDirectiveIndex(tView, directiveIndex) {
  const tViewContentQueries = tView.contentQueries || (tView.contentQueries = []);
  const lastSavedDirectiveIndex = tViewContentQueries.length ? tViewContentQueries[tViewContentQueries.length - 1] : -1;
  if (directiveIndex !== lastSavedDirectiveIndex) {
    tViewContentQueries.push(tView.queries.length - 1, directiveIndex);
  }
}
function getTQuery(tView, index) {
  ngDevMode && assertDefined(tView.queries, "TQueries must be defined to retrieve a TQuery");
  return tView.queries.getByIndex(index);
}
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
function ɵɵtemplateRefExtractor(tNode, lView) {
  return createTemplateRef(tNode, lView);
}
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
const angularCoreEnv = /* @__PURE__ */ (() => ({
  "ɵɵattribute": ɵɵattribute,
  "ɵɵattributeInterpolate1": ɵɵattributeInterpolate1,
  "ɵɵattributeInterpolate2": ɵɵattributeInterpolate2,
  "ɵɵattributeInterpolate3": ɵɵattributeInterpolate3,
  "ɵɵattributeInterpolate4": ɵɵattributeInterpolate4,
  "ɵɵattributeInterpolate5": ɵɵattributeInterpolate5,
  "ɵɵattributeInterpolate6": ɵɵattributeInterpolate6,
  "ɵɵattributeInterpolate7": ɵɵattributeInterpolate7,
  "ɵɵattributeInterpolate8": ɵɵattributeInterpolate8,
  "ɵɵattributeInterpolateV": ɵɵattributeInterpolateV,
  "ɵɵdefineComponent": ɵɵdefineComponent,
  "ɵɵdefineDirective": ɵɵdefineDirective,
  "ɵɵdefineInjectable": ɵɵdefineInjectable,
  "ɵɵdefineInjector": ɵɵdefineInjector,
  "ɵɵdefineNgModule": ɵɵdefineNgModule,
  "ɵɵdefinePipe": ɵɵdefinePipe,
  "ɵɵdirectiveInject": ɵɵdirectiveInject,
  "ɵɵgetInheritedFactory": ɵɵgetInheritedFactory,
  "ɵɵinject": ɵɵinject,
  "ɵɵinjectAttribute": ɵɵinjectAttribute,
  "ɵɵinvalidFactory": ɵɵinvalidFactory,
  "ɵɵinvalidFactoryDep": ɵɵinvalidFactoryDep,
  "ɵɵtemplateRefExtractor": ɵɵtemplateRefExtractor,
  "ɵɵNgOnChangesFeature": ɵɵNgOnChangesFeature,
  "ɵɵProvidersFeature": ɵɵProvidersFeature,
  "ɵɵCopyDefinitionFeature": ɵɵCopyDefinitionFeature,
  "ɵɵInheritDefinitionFeature": ɵɵInheritDefinitionFeature,
  "ɵɵnextContext": ɵɵnextContext,
  "ɵɵnamespaceHTML": ɵɵnamespaceHTML,
  "ɵɵnamespaceMathML": ɵɵnamespaceMathML,
  "ɵɵnamespaceSVG": ɵɵnamespaceSVG,
  "ɵɵenableBindings": ɵɵenableBindings,
  "ɵɵdisableBindings": ɵɵdisableBindings,
  "ɵɵelementStart": ɵɵelementStart,
  "ɵɵelementEnd": ɵɵelementEnd,
  "ɵɵelement": ɵɵelement,
  "ɵɵelementContainerStart": ɵɵelementContainerStart,
  "ɵɵelementContainerEnd": ɵɵelementContainerEnd,
  "ɵɵelementContainer": ɵɵelementContainer,
  "ɵɵpureFunction0": ɵɵpureFunction0,
  "ɵɵpureFunction1": ɵɵpureFunction1,
  "ɵɵpureFunction2": ɵɵpureFunction2,
  "ɵɵpureFunction3": ɵɵpureFunction3,
  "ɵɵpureFunction4": ɵɵpureFunction4,
  "ɵɵpureFunction5": ɵɵpureFunction5,
  "ɵɵpureFunction6": ɵɵpureFunction6,
  "ɵɵpureFunction7": ɵɵpureFunction7,
  "ɵɵpureFunction8": ɵɵpureFunction8,
  "ɵɵpureFunctionV": ɵɵpureFunctionV,
  "ɵɵgetCurrentView": ɵɵgetCurrentView,
  "ɵɵrestoreView": ɵɵrestoreView,
  "ɵɵlistener": ɵɵlistener,
  "ɵɵprojection": ɵɵprojection,
  "ɵɵsyntheticHostProperty": ɵɵsyntheticHostProperty,
  "ɵɵsyntheticHostListener": ɵɵsyntheticHostListener,
  "ɵɵpipeBind1": ɵɵpipeBind1,
  "ɵɵpipeBind2": ɵɵpipeBind2,
  "ɵɵpipeBind3": ɵɵpipeBind3,
  "ɵɵpipeBind4": ɵɵpipeBind4,
  "ɵɵpipeBindV": ɵɵpipeBindV,
  "ɵɵprojectionDef": ɵɵprojectionDef,
  "ɵɵhostProperty": ɵɵhostProperty,
  "ɵɵproperty": ɵɵproperty,
  "ɵɵpropertyInterpolate": ɵɵpropertyInterpolate,
  "ɵɵpropertyInterpolate1": ɵɵpropertyInterpolate1,
  "ɵɵpropertyInterpolate2": ɵɵpropertyInterpolate2,
  "ɵɵpropertyInterpolate3": ɵɵpropertyInterpolate3,
  "ɵɵpropertyInterpolate4": ɵɵpropertyInterpolate4,
  "ɵɵpropertyInterpolate5": ɵɵpropertyInterpolate5,
  "ɵɵpropertyInterpolate6": ɵɵpropertyInterpolate6,
  "ɵɵpropertyInterpolate7": ɵɵpropertyInterpolate7,
  "ɵɵpropertyInterpolate8": ɵɵpropertyInterpolate8,
  "ɵɵpropertyInterpolateV": ɵɵpropertyInterpolateV,
  "ɵɵpipe": ɵɵpipe,
  "ɵɵqueryRefresh": ɵɵqueryRefresh,
  "ɵɵviewQuery": ɵɵviewQuery,
  "ɵɵloadQuery": ɵɵloadQuery,
  "ɵɵcontentQuery": ɵɵcontentQuery,
  "ɵɵreference": ɵɵreference,
  "ɵɵclassMap": ɵɵclassMap,
  "ɵɵclassMapInterpolate1": ɵɵclassMapInterpolate1,
  "ɵɵclassMapInterpolate2": ɵɵclassMapInterpolate2,
  "ɵɵclassMapInterpolate3": ɵɵclassMapInterpolate3,
  "ɵɵclassMapInterpolate4": ɵɵclassMapInterpolate4,
  "ɵɵclassMapInterpolate5": ɵɵclassMapInterpolate5,
  "ɵɵclassMapInterpolate6": ɵɵclassMapInterpolate6,
  "ɵɵclassMapInterpolate7": ɵɵclassMapInterpolate7,
  "ɵɵclassMapInterpolate8": ɵɵclassMapInterpolate8,
  "ɵɵclassMapInterpolateV": ɵɵclassMapInterpolateV,
  "ɵɵstyleMap": ɵɵstyleMap,
  "ɵɵstyleMapInterpolate1": ɵɵstyleMapInterpolate1,
  "ɵɵstyleMapInterpolate2": ɵɵstyleMapInterpolate2,
  "ɵɵstyleMapInterpolate3": ɵɵstyleMapInterpolate3,
  "ɵɵstyleMapInterpolate4": ɵɵstyleMapInterpolate4,
  "ɵɵstyleMapInterpolate5": ɵɵstyleMapInterpolate5,
  "ɵɵstyleMapInterpolate6": ɵɵstyleMapInterpolate6,
  "ɵɵstyleMapInterpolate7": ɵɵstyleMapInterpolate7,
  "ɵɵstyleMapInterpolate8": ɵɵstyleMapInterpolate8,
  "ɵɵstyleMapInterpolateV": ɵɵstyleMapInterpolateV,
  "ɵɵstyleProp": ɵɵstyleProp,
  "ɵɵstylePropInterpolate1": ɵɵstylePropInterpolate1,
  "ɵɵstylePropInterpolate2": ɵɵstylePropInterpolate2,
  "ɵɵstylePropInterpolate3": ɵɵstylePropInterpolate3,
  "ɵɵstylePropInterpolate4": ɵɵstylePropInterpolate4,
  "ɵɵstylePropInterpolate5": ɵɵstylePropInterpolate5,
  "ɵɵstylePropInterpolate6": ɵɵstylePropInterpolate6,
  "ɵɵstylePropInterpolate7": ɵɵstylePropInterpolate7,
  "ɵɵstylePropInterpolate8": ɵɵstylePropInterpolate8,
  "ɵɵstylePropInterpolateV": ɵɵstylePropInterpolateV,
  "ɵɵclassProp": ɵɵclassProp,
  "ɵɵadvance": ɵɵadvance,
  "ɵɵtemplate": ɵɵtemplate,
  "ɵɵtext": ɵɵtext,
  "ɵɵtextInterpolate": ɵɵtextInterpolate,
  "ɵɵtextInterpolate1": ɵɵtextInterpolate1,
  "ɵɵtextInterpolate2": ɵɵtextInterpolate2,
  "ɵɵtextInterpolate3": ɵɵtextInterpolate3,
  "ɵɵtextInterpolate4": ɵɵtextInterpolate4,
  "ɵɵtextInterpolate5": ɵɵtextInterpolate5,
  "ɵɵtextInterpolate6": ɵɵtextInterpolate6,
  "ɵɵtextInterpolate7": ɵɵtextInterpolate7,
  "ɵɵtextInterpolate8": ɵɵtextInterpolate8,
  "ɵɵtextInterpolateV": ɵɵtextInterpolateV,
  "ɵɵi18n": ɵɵi18n,
  "ɵɵi18nAttributes": ɵɵi18nAttributes,
  "ɵɵi18nExp": ɵɵi18nExp,
  "ɵɵi18nStart": ɵɵi18nStart,
  "ɵɵi18nEnd": ɵɵi18nEnd,
  "ɵɵi18nApply": ɵɵi18nApply,
  "ɵɵi18nPostprocess": ɵɵi18nPostprocess,
  "ɵɵresolveWindow": ɵɵresolveWindow,
  "ɵɵresolveDocument": ɵɵresolveDocument,
  "ɵɵresolveBody": ɵɵresolveBody,
  "ɵɵsetComponentScope": ɵɵsetComponentScope,
  "ɵɵsetNgModuleScope": ɵɵsetNgModuleScope,
  "ɵɵsanitizeHtml": ɵɵsanitizeHtml,
  "ɵɵsanitizeStyle": ɵɵsanitizeStyle,
  "ɵɵsanitizeResourceUrl": ɵɵsanitizeResourceUrl,
  "ɵɵsanitizeScript": ɵɵsanitizeScript,
  "ɵɵsanitizeUrl": ɵɵsanitizeUrl,
  "ɵɵsanitizeUrlOrResourceUrl": ɵɵsanitizeUrlOrResourceUrl,
  "ɵɵtrustConstantHtml": ɵɵtrustConstantHtml,
  "ɵɵtrustConstantResourceUrl": ɵɵtrustConstantResourceUrl,
  "ɵɵvalidateIframeAttribute": ɵɵvalidateIframeAttribute,
  "forwardRef": forwardRef,
  "resolveForwardRef": resolveForwardRef
}))();
let jitOptions = null;
function setJitOptions(options) {
  if (jitOptions !== null) {
    if (options.defaultEncapsulation !== jitOptions.defaultEncapsulation) {
      ngDevMode && console.error("Provided value for `defaultEncapsulation` can not be changed once it has been set.");
      return;
    }
    if (options.preserveWhitespaces !== jitOptions.preserveWhitespaces) {
      ngDevMode && console.error("Provided value for `preserveWhitespaces` can not be changed once it has been set.");
      return;
    }
  }
  jitOptions = options;
}
function getJitOptions() {
  return jitOptions;
}
function resetJitOptions() {
  jitOptions = null;
}
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
const moduleQueue = [];
function enqueueModuleForDelayedScoping(moduleType, ngModule) {
  moduleQueue.push({ moduleType, ngModule });
}
let flushingModuleQueue = false;
function flushModuleScopingQueueAsMuchAsPossible() {
  if (!flushingModuleQueue) {
    flushingModuleQueue = true;
    try {
      for (let i = moduleQueue.length - 1; i >= 0; i--) {
        const { moduleType, ngModule } = moduleQueue[i];
        if (ngModule.declarations && ngModule.declarations.every(isResolvedDeclaration)) {
          moduleQueue.splice(i, 1);
          setScopeOnDeclaredComponents(moduleType, ngModule);
        }
      }
    } finally {
      flushingModuleQueue = false;
    }
  }
}
function isResolvedDeclaration(declaration) {
  if (Array.isArray(declaration)) {
    return declaration.every(isResolvedDeclaration);
  }
  return !!resolveForwardRef(declaration);
}
function compileNgModule(moduleType, ngModule = {}) {
  compileNgModuleDefs(moduleType, ngModule);
  enqueueModuleForDelayedScoping(moduleType, ngModule);
}
function compileNgModuleDefs(moduleType, ngModule, allowDuplicateDeclarationsInRoot = false) {
  ngDevMode && assertDefined(moduleType, "Required value moduleType");
  ngDevMode && assertDefined(ngModule, "Required value ngModule");
  const declarations = flatten(ngModule.declarations || EMPTY_ARRAY);
  let ngModuleDef = null;
  Object.defineProperty(moduleType, NG_MOD_DEF, {
    configurable: true,
    get: () => {
      if (ngModuleDef === null) {
        if (ngDevMode && ngModule.imports && ngModule.imports.indexOf(moduleType) > -1) {
          throw new Error(`'${stringifyForError(moduleType)}' module can't import itself`);
        }
        const compiler = getCompilerFacade({ usage: 0, kind: "NgModule", type: moduleType });
        ngModuleDef = compiler.compileNgModule(angularCoreEnv, `ng:///${moduleType.name}/ɵmod.js`, {
          type: moduleType,
          bootstrap: flatten(ngModule.bootstrap || EMPTY_ARRAY).map(resolveForwardRef),
          declarations: declarations.map(resolveForwardRef),
          imports: flatten(ngModule.imports || EMPTY_ARRAY).map(resolveForwardRef).map(expandModuleWithProviders),
          exports: flatten(ngModule.exports || EMPTY_ARRAY).map(resolveForwardRef).map(expandModuleWithProviders),
          schemas: ngModule.schemas ? flatten(ngModule.schemas) : null,
          id: ngModule.id || null
        });
        if (!ngModuleDef.schemas) {
          ngModuleDef.schemas = [];
        }
      }
      return ngModuleDef;
    }
  });
  let ngFactoryDef = null;
  Object.defineProperty(moduleType, NG_FACTORY_DEF, {
    get: () => {
      if (ngFactoryDef === null) {
        const compiler = getCompilerFacade({ usage: 0, kind: "NgModule", type: moduleType });
        ngFactoryDef = compiler.compileFactory(angularCoreEnv, `ng:///${moduleType.name}/ɵfac.js`, {
          name: moduleType.name,
          type: moduleType,
          deps: reflectDependencies(moduleType),
          target: compiler.FactoryTarget.NgModule,
          typeArgumentCount: 0
        });
      }
      return ngFactoryDef;
    },
    // Make the property configurable in dev mode to allow overriding in tests
    configurable: !!ngDevMode
  });
  let ngInjectorDef = null;
  Object.defineProperty(moduleType, NG_INJ_DEF, {
    get: () => {
      if (ngInjectorDef === null) {
        ngDevMode && verifySemanticsOfNgModuleDef(moduleType, allowDuplicateDeclarationsInRoot);
        const meta = {
          name: moduleType.name,
          type: moduleType,
          providers: ngModule.providers || EMPTY_ARRAY,
          imports: [
            (ngModule.imports || EMPTY_ARRAY).map(resolveForwardRef),
            (ngModule.exports || EMPTY_ARRAY).map(resolveForwardRef)
          ]
        };
        const compiler = getCompilerFacade({ usage: 0, kind: "NgModule", type: moduleType });
        ngInjectorDef = compiler.compileInjector(angularCoreEnv, `ng:///${moduleType.name}/ɵinj.js`, meta);
      }
      return ngInjectorDef;
    },
    // Make the property configurable in dev mode to allow overriding in tests
    configurable: !!ngDevMode
  });
}
function verifySemanticsOfNgModuleDef(moduleType, allowDuplicateDeclarationsInRoot, importingModule) {
  if (verifiedNgModule.get(moduleType))
    return;
  verifiedNgModule.set(moduleType, true);
  moduleType = resolveForwardRef(moduleType);
  let ngModuleDef;
  if (importingModule) {
    ngModuleDef = getNgModuleDef(moduleType);
    if (!ngModuleDef) {
      throw new Error(`Unexpected value '${moduleType.name}' imported by the module '${importingModule.name}'. Please add an @NgModule annotation.`);
    }
  } else {
    ngModuleDef = getNgModuleDef(moduleType, true);
  }
  const errors = [];
  const declarations = maybeUnwrapFn(ngModuleDef.declarations);
  const imports = maybeUnwrapFn(ngModuleDef.imports);
  flatten(imports).map(unwrapModuleWithProvidersImports).forEach((mod) => {
    verifySemanticsOfNgModuleImport(mod, moduleType);
    verifySemanticsOfNgModuleDef(mod, false, moduleType);
  });
  const exports = maybeUnwrapFn(ngModuleDef.exports);
  declarations.forEach(verifyDeclarationsHaveDefinitions);
  declarations.forEach(verifyDirectivesHaveSelector);
  const combinedDeclarations = [
    ...declarations.map(resolveForwardRef),
    ...flatten(imports.map(computeCombinedExports)).map(resolveForwardRef)
  ];
  exports.forEach(verifyExportsAreDeclaredOrReExported);
  declarations.forEach((decl) => verifyDeclarationIsUnique(decl, allowDuplicateDeclarationsInRoot));
  declarations.forEach(verifyComponentEntryComponentsIsPartOfNgModule);
  const ngModule = getAnnotation(moduleType, "NgModule");
  if (ngModule) {
    ngModule.imports && flatten(ngModule.imports).map(unwrapModuleWithProvidersImports).forEach((mod) => {
      verifySemanticsOfNgModuleImport(mod, moduleType);
      verifySemanticsOfNgModuleDef(mod, false, moduleType);
    });
    ngModule.bootstrap && deepForEach$1(ngModule.bootstrap, verifyCorrectBootstrapType);
    ngModule.bootstrap && deepForEach$1(ngModule.bootstrap, verifyComponentIsPartOfNgModule);
    ngModule.entryComponents && deepForEach$1(ngModule.entryComponents, verifyComponentIsPartOfNgModule);
  }
  if (errors.length) {
    throw new Error(errors.join("\n"));
  }
  function verifyDeclarationsHaveDefinitions(type) {
    type = resolveForwardRef(type);
    const def = getComponentDef(type) || getDirectiveDef(type) || getPipeDef$1(type);
    if (!def) {
      errors.push(`Unexpected value '${stringifyForError(type)}' declared by the module '${stringifyForError(moduleType)}'. Please add a @Pipe/@Directive/@Component annotation.`);
    }
  }
  function verifyDirectivesHaveSelector(type) {
    type = resolveForwardRef(type);
    const def = getDirectiveDef(type);
    if (!getComponentDef(type) && def && def.selectors.length == 0) {
      errors.push(`Directive ${stringifyForError(type)} has no selector, please add it!`);
    }
  }
  function verifyExportsAreDeclaredOrReExported(type) {
    type = resolveForwardRef(type);
    const kind = getComponentDef(type) && "component" || getDirectiveDef(type) && "directive" || getPipeDef$1(type) && "pipe";
    if (kind) {
      if (combinedDeclarations.lastIndexOf(type) === -1) {
        errors.push(`Can't export ${kind} ${stringifyForError(type)} from ${stringifyForError(moduleType)} as it was neither declared nor imported!`);
      }
    }
  }
  function verifyDeclarationIsUnique(type, suppressErrors) {
    type = resolveForwardRef(type);
    const existingModule = ownerNgModule.get(type);
    if (existingModule && existingModule !== moduleType) {
      if (!suppressErrors) {
        const modules2 = [existingModule, moduleType].map(stringifyForError).sort();
        errors.push(`Type ${stringifyForError(type)} is part of the declarations of 2 modules: ${modules2[0]} and ${modules2[1]}! Please consider moving ${stringifyForError(type)} to a higher module that imports ${modules2[0]} and ${modules2[1]}. You can also create a new NgModule that exports and includes ${stringifyForError(type)} then import that NgModule in ${modules2[0]} and ${modules2[1]}.`);
      }
    } else {
      ownerNgModule.set(type, moduleType);
    }
  }
  function verifyComponentIsPartOfNgModule(type) {
    type = resolveForwardRef(type);
    const existingModule = ownerNgModule.get(type);
    if (!existingModule) {
      errors.push(`Component ${stringifyForError(type)} is not part of any NgModule or the module has not been imported into your module.`);
    }
  }
  function verifyCorrectBootstrapType(type) {
    type = resolveForwardRef(type);
    if (!getComponentDef(type)) {
      errors.push(`${stringifyForError(type)} cannot be used as an entry component.`);
    }
  }
  function verifyComponentEntryComponentsIsPartOfNgModule(type) {
    type = resolveForwardRef(type);
    if (getComponentDef(type)) {
      const component = getAnnotation(type, "Component");
      if (component && component.entryComponents) {
        deepForEach$1(component.entryComponents, verifyComponentIsPartOfNgModule);
      }
    }
  }
  function verifySemanticsOfNgModuleImport(type, importingModule2) {
    type = resolveForwardRef(type);
    if (getComponentDef(type) || getDirectiveDef(type)) {
      throw new Error(`Unexpected directive '${type.name}' imported by the module '${importingModule2.name}'. Please add an @NgModule annotation.`);
    }
    if (getPipeDef$1(type)) {
      throw new Error(`Unexpected pipe '${type.name}' imported by the module '${importingModule2.name}'. Please add an @NgModule annotation.`);
    }
  }
}
function unwrapModuleWithProvidersImports(typeOrWithProviders) {
  typeOrWithProviders = resolveForwardRef(typeOrWithProviders);
  return typeOrWithProviders.ngModule || typeOrWithProviders;
}
function getAnnotation(type, name) {
  let annotation = null;
  collect(type.__annotations__);
  collect(type.decorators);
  return annotation;
  function collect(annotations) {
    if (annotations) {
      annotations.forEach(readAnnotation);
    }
  }
  function readAnnotation(decorator) {
    if (!annotation) {
      const proto = Object.getPrototypeOf(decorator);
      if (proto.ngMetadataName == name) {
        annotation = decorator;
      } else if (decorator.type) {
        const proto2 = Object.getPrototypeOf(decorator.type);
        if (proto2.ngMetadataName == name) {
          annotation = decorator.args[0];
        }
      }
    }
  }
}
let ownerNgModule = /* @__PURE__ */ new WeakMap();
let verifiedNgModule = /* @__PURE__ */ new WeakMap();
function resetCompiledComponents() {
  ownerNgModule = /* @__PURE__ */ new WeakMap();
  verifiedNgModule = /* @__PURE__ */ new WeakMap();
  moduleQueue.length = 0;
}
function computeCombinedExports(type) {
  type = resolveForwardRef(type);
  const ngModuleDef = getNgModuleDef(type, true);
  return [...flatten(maybeUnwrapFn(ngModuleDef.exports).map((type2) => {
    const ngModuleDef2 = getNgModuleDef(type2);
    if (ngModuleDef2) {
      verifySemanticsOfNgModuleDef(type2, false);
      return computeCombinedExports(type2);
    } else {
      return type2;
    }
  }))];
}
function setScopeOnDeclaredComponents(moduleType, ngModule) {
  const declarations = flatten(ngModule.declarations || EMPTY_ARRAY);
  const transitiveScopes = transitiveScopesFor(moduleType);
  declarations.forEach((declaration) => {
    if (declaration.hasOwnProperty(NG_COMP_DEF)) {
      const component = declaration;
      const componentDef = getComponentDef(component);
      patchComponentDefWithScope(componentDef, transitiveScopes);
    } else if (!declaration.hasOwnProperty(NG_DIR_DEF) && !declaration.hasOwnProperty(NG_PIPE_DEF)) {
      declaration.ngSelectorScope = moduleType;
    }
  });
}
function patchComponentDefWithScope(componentDef, transitiveScopes) {
  componentDef.directiveDefs = () => Array.from(transitiveScopes.compilation.directives).map((dir) => dir.hasOwnProperty(NG_COMP_DEF) ? getComponentDef(dir) : getDirectiveDef(dir)).filter((def) => !!def);
  componentDef.pipeDefs = () => Array.from(transitiveScopes.compilation.pipes).map((pipe) => getPipeDef$1(pipe));
  componentDef.schemas = transitiveScopes.schemas;
  componentDef.tView = null;
}
function transitiveScopesFor(moduleType) {
  if (!isNgModule(moduleType)) {
    throw new Error(`${moduleType.name} does not have a module def (ɵmod property)`);
  }
  const def = getNgModuleDef(moduleType);
  if (def.transitiveCompileScopes !== null) {
    return def.transitiveCompileScopes;
  }
  const scopes = {
    schemas: def.schemas || null,
    compilation: {
      directives: /* @__PURE__ */ new Set(),
      pipes: /* @__PURE__ */ new Set()
    },
    exported: {
      directives: /* @__PURE__ */ new Set(),
      pipes: /* @__PURE__ */ new Set()
    }
  };
  maybeUnwrapFn(def.imports).forEach((imported) => {
    const importedType = imported;
    if (!isNgModule(importedType)) {
      throw new Error(`Importing ${importedType.name} which does not have a ɵmod property`);
    }
    const importedScope = transitiveScopesFor(importedType);
    importedScope.exported.directives.forEach((entry) => scopes.compilation.directives.add(entry));
    importedScope.exported.pipes.forEach((entry) => scopes.compilation.pipes.add(entry));
  });
  maybeUnwrapFn(def.declarations).forEach((declared) => {
    const declaredWithDefs = declared;
    if (getPipeDef$1(declaredWithDefs)) {
      scopes.compilation.pipes.add(declared);
    } else {
      scopes.compilation.directives.add(declared);
    }
  });
  maybeUnwrapFn(def.exports).forEach((exported) => {
    const exportedType = exported;
    if (isNgModule(exportedType)) {
      const exportedScope = transitiveScopesFor(exportedType);
      exportedScope.exported.directives.forEach((entry) => {
        scopes.compilation.directives.add(entry);
        scopes.exported.directives.add(entry);
      });
      exportedScope.exported.pipes.forEach((entry) => {
        scopes.compilation.pipes.add(entry);
        scopes.exported.pipes.add(entry);
      });
    } else if (getPipeDef$1(exportedType)) {
      scopes.exported.pipes.add(exportedType);
    } else {
      scopes.exported.directives.add(exportedType);
    }
  });
  def.transitiveCompileScopes = scopes;
  return scopes;
}
function expandModuleWithProviders(value) {
  if (isModuleWithProviders(value)) {
    return value.ngModule;
  }
  return value;
}
function isModuleWithProviders(value) {
  return value.ngModule !== void 0;
}
function isNgModule(value) {
  return !!getNgModuleDef(value);
}
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
let compilationDepth = 0;
function compileComponent(type, metadata) {
  (typeof ngDevMode === "undefined" || ngDevMode) && initNgDevMode();
  let ngComponentDef = null;
  maybeQueueResolutionOfComponentResources(type, metadata);
  addDirectiveFactoryDef(type, metadata);
  Object.defineProperty(type, NG_COMP_DEF, {
    get: () => {
      if (ngComponentDef === null) {
        const compiler = getCompilerFacade({ usage: 0, kind: "component", type });
        if (componentNeedsResolution(metadata)) {
          const error = [`Component '${type.name}' is not resolved:`];
          if (metadata.templateUrl) {
            error.push(` - templateUrl: ${metadata.templateUrl}`);
          }
          if (metadata.styleUrls && metadata.styleUrls.length) {
            error.push(` - styleUrls: ${JSON.stringify(metadata.styleUrls)}`);
          }
          error.push(`Did you run and wait for 'resolveComponentResources()'?`);
          throw new Error(error.join("\n"));
        }
        const options = getJitOptions();
        let preserveWhitespaces = metadata.preserveWhitespaces;
        if (preserveWhitespaces === void 0) {
          if (options !== null && options.preserveWhitespaces !== void 0) {
            preserveWhitespaces = options.preserveWhitespaces;
          } else {
            preserveWhitespaces = false;
          }
        }
        let encapsulation = metadata.encapsulation;
        if (encapsulation === void 0) {
          if (options !== null && options.defaultEncapsulation !== void 0) {
            encapsulation = options.defaultEncapsulation;
          } else {
            encapsulation = ViewEncapsulation$1.Emulated;
          }
        }
        const templateUrl = metadata.templateUrl || `ng:///${type.name}/template.html`;
        const meta = {
          ...directiveMetadata(type, metadata),
          typeSourceSpan: compiler.createParseSourceSpan("Component", type.name, templateUrl),
          template: metadata.template || "",
          preserveWhitespaces,
          styles: metadata.styles || EMPTY_ARRAY,
          animations: metadata.animations,
          directives: [],
          changeDetection: metadata.changeDetection,
          pipes: /* @__PURE__ */ new Map(),
          encapsulation,
          interpolation: metadata.interpolation,
          viewProviders: metadata.viewProviders || null
        };
        compilationDepth++;
        try {
          if (meta.usesInheritance) {
            addDirectiveDefToUndecoratedParents(type);
          }
          ngComponentDef = compiler.compileComponent(angularCoreEnv, templateUrl, meta);
        } finally {
          compilationDepth--;
        }
        if (compilationDepth === 0) {
          flushModuleScopingQueueAsMuchAsPossible();
        }
        if (hasSelectorScope(type)) {
          const scopes = transitiveScopesFor(type.ngSelectorScope);
          patchComponentDefWithScope(ngComponentDef, scopes);
        }
      }
      return ngComponentDef;
    },
    // Make the property configurable in dev mode to allow overriding in tests
    configurable: !!ngDevMode
  });
}
function hasSelectorScope(component) {
  return component.ngSelectorScope !== void 0;
}
function compileDirective(type, directive) {
  let ngDirectiveDef = null;
  addDirectiveFactoryDef(type, directive || {});
  Object.defineProperty(type, NG_DIR_DEF, {
    get: () => {
      if (ngDirectiveDef === null) {
        const meta = getDirectiveMetadata(type, directive || {});
        const compiler = getCompilerFacade({ usage: 0, kind: "directive", type });
        ngDirectiveDef = compiler.compileDirective(angularCoreEnv, meta.sourceMapUrl, meta.metadata);
      }
      return ngDirectiveDef;
    },
    // Make the property configurable in dev mode to allow overriding in tests
    configurable: !!ngDevMode
  });
}
function getDirectiveMetadata(type, metadata) {
  const name = type && type.name;
  const sourceMapUrl = `ng:///${name}/ɵdir.js`;
  const compiler = getCompilerFacade({ usage: 0, kind: "directive", type });
  const facade = directiveMetadata(type, metadata);
  facade.typeSourceSpan = compiler.createParseSourceSpan("Directive", name, sourceMapUrl);
  if (facade.usesInheritance) {
    addDirectiveDefToUndecoratedParents(type);
  }
  return { metadata: facade, sourceMapUrl };
}
function addDirectiveFactoryDef(type, metadata) {
  let ngFactoryDef = null;
  Object.defineProperty(type, NG_FACTORY_DEF, {
    get: () => {
      if (ngFactoryDef === null) {
        const meta = getDirectiveMetadata(type, metadata);
        const compiler = getCompilerFacade({ usage: 0, kind: "directive", type });
        ngFactoryDef = compiler.compileFactory(angularCoreEnv, `ng:///${type.name}/ɵfac.js`, {
          name: meta.metadata.name,
          type: meta.metadata.type,
          typeArgumentCount: 0,
          deps: reflectDependencies(type),
          target: compiler.FactoryTarget.Directive
        });
      }
      return ngFactoryDef;
    },
    // Make the property configurable in dev mode to allow overriding in tests
    configurable: !!ngDevMode
  });
}
function extendsDirectlyFromObject(type) {
  return Object.getPrototypeOf(type.prototype) === Object.prototype;
}
function directiveMetadata(type, metadata) {
  const reflect = getReflect();
  const propMetadata = reflect.ownPropMetadata(type);
  return {
    name: type.name,
    type,
    selector: metadata.selector !== void 0 ? metadata.selector : null,
    host: metadata.host || EMPTY_OBJ,
    propMetadata,
    inputs: metadata.inputs || EMPTY_ARRAY,
    outputs: metadata.outputs || EMPTY_ARRAY,
    queries: extractQueriesMetadata(type, propMetadata, isContentQuery),
    lifecycle: { usesOnChanges: reflect.hasLifecycleHook(type, "ngOnChanges") },
    typeSourceSpan: null,
    usesInheritance: !extendsDirectlyFromObject(type),
    exportAs: extractExportAs(metadata.exportAs),
    providers: metadata.providers || null,
    viewQueries: extractQueriesMetadata(type, propMetadata, isViewQuery)
  };
}
function addDirectiveDefToUndecoratedParents(type) {
  const objPrototype = Object.prototype;
  let parent = Object.getPrototypeOf(type.prototype).constructor;
  while (parent && parent !== objPrototype) {
    if (!getDirectiveDef(parent) && !getComponentDef(parent) && shouldAddAbstractDirective(parent)) {
      compileDirective(parent, null);
    }
    parent = Object.getPrototypeOf(parent);
  }
}
function convertToR3QueryPredicate(selector) {
  return typeof selector === "string" ? splitByComma(selector) : resolveForwardRef(selector);
}
function convertToR3QueryMetadata(propertyName, ann) {
  return {
    propertyName,
    predicate: convertToR3QueryPredicate(ann.selector),
    descendants: ann.descendants,
    first: ann.first,
    read: ann.read ? ann.read : null,
    static: !!ann.static,
    emitDistinctChangesOnly: !!ann.emitDistinctChangesOnly
  };
}
function extractQueriesMetadata(type, propMetadata, isQueryAnn) {
  const queriesMeta = [];
  for (const field in propMetadata) {
    if (propMetadata.hasOwnProperty(field)) {
      const annotations = propMetadata[field];
      annotations.forEach((ann) => {
        if (isQueryAnn(ann)) {
          if (!ann.selector) {
            throw new Error(`Can't construct a query for the property "${field}" of "${stringifyForError(type)}" since the query selector wasn't defined.`);
          }
          if (annotations.some(isInputAnnotation)) {
            throw new Error(`Cannot combine @Input decorators with query decorators`);
          }
          queriesMeta.push(convertToR3QueryMetadata(field, ann));
        }
      });
    }
  }
  return queriesMeta;
}
function extractExportAs(exportAs) {
  return exportAs === void 0 ? null : splitByComma(exportAs);
}
function isContentQuery(value) {
  const name = value.ngMetadataName;
  return name === "ContentChild" || name === "ContentChildren";
}
function isViewQuery(value) {
  const name = value.ngMetadataName;
  return name === "ViewChild" || name === "ViewChildren";
}
function isInputAnnotation(value) {
  return value.ngMetadataName === "Input";
}
function splitByComma(value) {
  return value.split(",").map((piece) => piece.trim());
}
const LIFECYCLE_HOOKS = [
  "ngOnChanges",
  "ngOnInit",
  "ngOnDestroy",
  "ngDoCheck",
  "ngAfterViewInit",
  "ngAfterViewChecked",
  "ngAfterContentInit",
  "ngAfterContentChecked"
];
function shouldAddAbstractDirective(type) {
  const reflect = getReflect();
  if (LIFECYCLE_HOOKS.some((hookName) => reflect.hasLifecycleHook(type, hookName))) {
    return true;
  }
  const propMetadata = reflect.propMetadata(type);
  for (const field in propMetadata) {
    const annotations = propMetadata[field];
    for (let i = 0; i < annotations.length; i++) {
      const current = annotations[i];
      const metadataName = current.ngMetadataName;
      if (isInputAnnotation(current) || isContentQuery(current) || isViewQuery(current) || metadataName === "Output" || metadataName === "HostBinding" || metadataName === "HostListener") {
        return true;
      }
    }
  }
  return false;
}
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
function compilePipe(type, meta) {
  let ngPipeDef = null;
  let ngFactoryDef = null;
  Object.defineProperty(type, NG_FACTORY_DEF, {
    get: () => {
      if (ngFactoryDef === null) {
        const metadata = getPipeMetadata(type, meta);
        const compiler = getCompilerFacade({ usage: 0, kind: "pipe", type: metadata.type });
        ngFactoryDef = compiler.compileFactory(angularCoreEnv, `ng:///${metadata.name}/ɵfac.js`, {
          name: metadata.name,
          type: metadata.type,
          typeArgumentCount: 0,
          deps: reflectDependencies(type),
          target: compiler.FactoryTarget.Pipe
        });
      }
      return ngFactoryDef;
    },
    // Make the property configurable in dev mode to allow overriding in tests
    configurable: !!ngDevMode
  });
  Object.defineProperty(type, NG_PIPE_DEF, {
    get: () => {
      if (ngPipeDef === null) {
        const metadata = getPipeMetadata(type, meta);
        const compiler = getCompilerFacade({ usage: 0, kind: "pipe", type: metadata.type });
        ngPipeDef = compiler.compilePipe(angularCoreEnv, `ng:///${metadata.name}/ɵpipe.js`, metadata);
      }
      return ngPipeDef;
    },
    // Make the property configurable in dev mode to allow overriding in tests
    configurable: !!ngDevMode
  });
}
function getPipeMetadata(type, meta) {
  return {
    type,
    name: type.name,
    pipeName: meta.name,
    pure: meta.pure !== void 0 ? meta.pure : true
  };
}
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
const Directive = makeDecorator("Directive", (dir = {}) => dir, void 0, void 0, (type, meta) => compileDirective(type, meta));
const Component = makeDecorator("Component", (c = {}) => ({ changeDetection: ChangeDetectionStrategy.Default, ...c }), Directive, void 0, (type, meta) => compileComponent(type, meta));
const Pipe = makeDecorator("Pipe", (p) => ({ pure: true, ...p }), void 0, void 0, (type, meta) => compilePipe(type, meta));
const Input = makePropDecorator("Input", (bindingPropertyName) => ({ bindingPropertyName }));
const Output = makePropDecorator("Output", (bindingPropertyName) => ({ bindingPropertyName }));
const HostBinding = makePropDecorator("HostBinding", (hostPropertyName) => ({ hostPropertyName }));
const HostListener = makePropDecorator("HostListener", (eventName, args) => ({ eventName, args }));
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
const NgModule = makeDecorator(
  "NgModule",
  (ngModule) => ngModule,
  void 0,
  void 0,
  /**
   * Decorator that marks the following class as an NgModule, and supplies
   * configuration metadata for it.
   *
   * * The `declarations` and `entryComponents` options configure the compiler
   * with information about what belongs to the NgModule.
   * * The `providers` options configures the NgModule's injector to provide
   * dependencies the NgModule members.
   * * The `imports` and `exports` options bring in members from other modules, and make
   * this module's members available to others.
   */
  (type, meta) => compileNgModule(type, meta)
);
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
function noop(...args) {
}
const APP_INITIALIZER = new InjectionToken("Application Initializer");
class ApplicationInitStatus {
  constructor(appInits) {
    this.appInits = appInits;
    this.resolve = noop;
    this.reject = noop;
    this.initialized = false;
    this.done = false;
    this.donePromise = new Promise((res, rej) => {
      this.resolve = res;
      this.reject = rej;
    });
  }
  /** @internal */
  runInitializers() {
    if (this.initialized) {
      return;
    }
    const asyncInitPromises = [];
    const complete = () => {
      this.done = true;
      this.resolve();
    };
    if (this.appInits) {
      for (let i = 0; i < this.appInits.length; i++) {
        const initResult = this.appInits[i]();
        if (isPromise(initResult)) {
          asyncInitPromises.push(initResult);
        } else if (isObservable(initResult)) {
          const observableAsPromise = new Promise((resolve, reject) => {
            initResult.subscribe({ complete: resolve, error: reject });
          });
          asyncInitPromises.push(observableAsPromise);
        }
      }
    }
    Promise.all(asyncInitPromises).then(() => {
      complete();
    }).catch((e) => {
      this.reject(e);
    });
    if (asyncInitPromises.length === 0) {
      complete();
    }
    this.initialized = true;
  }
}
ApplicationInitStatus.ɵfac = function ApplicationInitStatus_Factory(t) {
  return new (t || ApplicationInitStatus)(ɵɵinject(APP_INITIALIZER, 8));
};
ApplicationInitStatus.ɵprov = /* @__PURE__ */ ɵɵdefineInjectable({ token: ApplicationInitStatus, factory: ApplicationInitStatus.ɵfac, providedIn: "root" });
(function() {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(ApplicationInitStatus, [{
    type: Injectable,
    args: [{ providedIn: "root" }]
  }], function() {
    return [{ type: void 0, decorators: [{
      type: Inject,
      args: [APP_INITIALIZER]
    }, {
      type: Optional
    }] }];
  }, null);
})();
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
const APP_ID = new InjectionToken("AppId", {
  providedIn: "root",
  factory: _appIdRandomProviderFactory
});
function _appIdRandomProviderFactory() {
  return `${_randomChar()}${_randomChar()}${_randomChar()}`;
}
const APP_ID_RANDOM_PROVIDER = {
  provide: APP_ID,
  useFactory: _appIdRandomProviderFactory,
  deps: []
};
function _randomChar() {
  return String.fromCharCode(97 + Math.floor(Math.random() * 25));
}
const PLATFORM_INITIALIZER = new InjectionToken("Platform Initializer");
const PLATFORM_ID = new InjectionToken("Platform ID", {
  providedIn: "platform",
  factory: () => "unknown"
  // set a default platform name, when none set explicitly
});
const APP_BOOTSTRAP_LISTENER = new InjectionToken("appBootstrapListener");
const PACKAGE_ROOT_URL = new InjectionToken("Application Packages Root URL");
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
class Console {
  log(message) {
    console.log(message);
  }
  // Note: for reporting errors use `DOM.logError()` as it is platform specific
  warn(message) {
    console.warn(message);
  }
}
Console.ɵfac = function Console_Factory(t) {
  return new (t || Console)();
};
Console.ɵprov = /* @__PURE__ */ ɵɵdefineInjectable({ token: Console, factory: Console.ɵfac, providedIn: "platform" });
(function() {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(Console, [{
    type: Injectable,
    args: [{ providedIn: "platform" }]
  }], null, null);
})();
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
function getGlobalLocale() {
  if (typeof ngI18nClosureMode !== "undefined" && ngI18nClosureMode && typeof goog !== "undefined" && goog.LOCALE !== "en") {
    return goog.LOCALE;
  } else {
    return typeof $localize !== "undefined" && $localize.locale || DEFAULT_LOCALE_ID;
  }
}
const LOCALE_ID = new InjectionToken("LocaleId", {
  providedIn: "root",
  factory: () => inject(LOCALE_ID, InjectFlags.Optional | InjectFlags.SkipSelf) || getGlobalLocale()
});
const DEFAULT_CURRENCY_CODE = new InjectionToken("DefaultCurrencyCode", {
  providedIn: "root",
  factory: () => USD_CURRENCY_CODE
});
const TRANSLATIONS = new InjectionToken("Translations");
const TRANSLATIONS_FORMAT = new InjectionToken("TranslationsFormat");
var MissingTranslationStrategy;
(function(MissingTranslationStrategy2) {
  MissingTranslationStrategy2[MissingTranslationStrategy2["Error"] = 0] = "Error";
  MissingTranslationStrategy2[MissingTranslationStrategy2["Warning"] = 1] = "Warning";
  MissingTranslationStrategy2[MissingTranslationStrategy2["Ignore"] = 2] = "Ignore";
})(MissingTranslationStrategy || (MissingTranslationStrategy = {}));
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
class ModuleWithComponentFactories {
  constructor(ngModuleFactory, componentFactories) {
    this.ngModuleFactory = ngModuleFactory;
    this.componentFactories = componentFactories;
  }
}
class Compiler {
  /**
   * Compiles the given NgModule and all of its components. All templates of the components listed
   * in `entryComponents` have to be inlined.
   */
  compileModuleSync(moduleType) {
    return new NgModuleFactory(moduleType);
  }
  /**
   * Compiles the given NgModule and all of its components
   */
  compileModuleAsync(moduleType) {
    return Promise.resolve(this.compileModuleSync(moduleType));
  }
  /**
   * Same as {@link #compileModuleSync} but also creates ComponentFactories for all components.
   */
  compileModuleAndAllComponentsSync(moduleType) {
    const ngModuleFactory = this.compileModuleSync(moduleType);
    const moduleDef = getNgModuleDef(moduleType);
    const componentFactories = maybeUnwrapFn(moduleDef.declarations).reduce((factories, declaration) => {
      const componentDef = getComponentDef(declaration);
      componentDef && factories.push(new ComponentFactory(componentDef));
      return factories;
    }, []);
    return new ModuleWithComponentFactories(ngModuleFactory, componentFactories);
  }
  /**
   * Same as {@link #compileModuleAsync} but also creates ComponentFactories for all components.
   */
  compileModuleAndAllComponentsAsync(moduleType) {
    return Promise.resolve(this.compileModuleAndAllComponentsSync(moduleType));
  }
  /**
   * Clears all caches.
   */
  clearCache() {
  }
  /**
   * Clears the cache for the given component/ngModule.
   */
  clearCacheFor(type) {
  }
  /**
   * Returns the id for a given NgModule, if one is defined and known to the compiler.
   */
  getModuleId(moduleType) {
    return void 0;
  }
}
Compiler.ɵfac = function Compiler_Factory(t) {
  return new (t || Compiler)();
};
Compiler.ɵprov = /* @__PURE__ */ ɵɵdefineInjectable({ token: Compiler, factory: Compiler.ɵfac, providedIn: "root" });
(function() {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(Compiler, [{
    type: Injectable,
    args: [{ providedIn: "root" }]
  }], null, null);
})();
const COMPILER_OPTIONS = new InjectionToken("compilerOptions");
class CompilerFactory {
}
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
const promise = (() => Promise.resolve(0))();
function scheduleMicroTask(fn) {
  if (typeof Zone === "undefined") {
    promise.then(() => {
      fn && fn.apply(null, null);
    });
  } else {
    Zone.current.scheduleMicroTask("scheduleMicrotask", fn);
  }
}
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
function getNativeRequestAnimationFrame() {
  let nativeRequestAnimationFrame = _global["requestAnimationFrame"];
  let nativeCancelAnimationFrame = _global["cancelAnimationFrame"];
  if (typeof Zone !== "undefined" && nativeRequestAnimationFrame && nativeCancelAnimationFrame) {
    const unpatchedRequestAnimationFrame = nativeRequestAnimationFrame[Zone.__symbol__("OriginalDelegate")];
    if (unpatchedRequestAnimationFrame) {
      nativeRequestAnimationFrame = unpatchedRequestAnimationFrame;
    }
    const unpatchedCancelAnimationFrame = nativeCancelAnimationFrame[Zone.__symbol__("OriginalDelegate")];
    if (unpatchedCancelAnimationFrame) {
      nativeCancelAnimationFrame = unpatchedCancelAnimationFrame;
    }
  }
  return { nativeRequestAnimationFrame, nativeCancelAnimationFrame };
}
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
class NgZone {
  constructor({ enableLongStackTrace = false, shouldCoalesceEventChangeDetection = false, shouldCoalesceRunChangeDetection = false }) {
    this.hasPendingMacrotasks = false;
    this.hasPendingMicrotasks = false;
    this.isStable = true;
    this.onUnstable = new EventEmitter(false);
    this.onMicrotaskEmpty = new EventEmitter(false);
    this.onStable = new EventEmitter(false);
    this.onError = new EventEmitter(false);
    if (typeof Zone == "undefined") {
      throw new Error(`In this configuration Angular requires Zone.js`);
    }
    Zone.assertZonePatched();
    const self2 = this;
    self2._nesting = 0;
    self2._outer = self2._inner = Zone.current;
    if (Zone["TaskTrackingZoneSpec"]) {
      self2._inner = self2._inner.fork(new Zone["TaskTrackingZoneSpec"]());
    }
    if (enableLongStackTrace && Zone["longStackTraceZoneSpec"]) {
      self2._inner = self2._inner.fork(Zone["longStackTraceZoneSpec"]);
    }
    self2.shouldCoalesceEventChangeDetection = !shouldCoalesceRunChangeDetection && shouldCoalesceEventChangeDetection;
    self2.shouldCoalesceRunChangeDetection = shouldCoalesceRunChangeDetection;
    self2.lastRequestAnimationFrameId = -1;
    self2.nativeRequestAnimationFrame = getNativeRequestAnimationFrame().nativeRequestAnimationFrame;
    forkInnerZoneWithAngularBehavior(self2);
  }
  static isInAngularZone() {
    return typeof Zone !== "undefined" && Zone.current.get("isAngularZone") === true;
  }
  static assertInAngularZone() {
    if (!NgZone.isInAngularZone()) {
      throw new Error("Expected to be in Angular Zone, but it is not!");
    }
  }
  static assertNotInAngularZone() {
    if (NgZone.isInAngularZone()) {
      throw new Error("Expected to not be in Angular Zone, but it is!");
    }
  }
  /**
   * Executes the `fn` function synchronously within the Angular zone and returns value returned by
   * the function.
   *
   * Running functions via `run` allows you to reenter Angular zone from a task that was executed
   * outside of the Angular zone (typically started via {@link #runOutsideAngular}).
   *
   * Any future tasks or microtasks scheduled from within this function will continue executing from
   * within the Angular zone.
   *
   * If a synchronous error happens it will be rethrown and not reported via `onError`.
   */
  run(fn, applyThis, applyArgs) {
    return this._inner.run(fn, applyThis, applyArgs);
  }
  /**
   * Executes the `fn` function synchronously within the Angular zone as a task and returns value
   * returned by the function.
   *
   * Running functions via `run` allows you to reenter Angular zone from a task that was executed
   * outside of the Angular zone (typically started via {@link #runOutsideAngular}).
   *
   * Any future tasks or microtasks scheduled from within this function will continue executing from
   * within the Angular zone.
   *
   * If a synchronous error happens it will be rethrown and not reported via `onError`.
   */
  runTask(fn, applyThis, applyArgs, name) {
    const zone = this._inner;
    const task = zone.scheduleEventTask("NgZoneEvent: " + name, fn, EMPTY_PAYLOAD, noop, noop);
    try {
      return zone.runTask(task, applyThis, applyArgs);
    } finally {
      zone.cancelTask(task);
    }
  }
  /**
   * Same as `run`, except that synchronous errors are caught and forwarded via `onError` and not
   * rethrown.
   */
  runGuarded(fn, applyThis, applyArgs) {
    return this._inner.runGuarded(fn, applyThis, applyArgs);
  }
  /**
   * Executes the `fn` function synchronously in Angular's parent zone and returns value returned by
   * the function.
   *
   * Running functions via {@link #runOutsideAngular} allows you to escape Angular's zone and do
   * work that
   * doesn't trigger Angular change-detection or is subject to Angular's error handling.
   *
   * Any future tasks or microtasks scheduled from within this function will continue executing from
   * outside of the Angular zone.
   *
   * Use {@link #run} to reenter the Angular zone and do work that updates the application model.
   */
  runOutsideAngular(fn) {
    return this._outer.run(fn);
  }
}
const EMPTY_PAYLOAD = {};
function checkStable(zone) {
  if (zone._nesting == 0 && !zone.hasPendingMicrotasks && !zone.isStable) {
    try {
      zone._nesting++;
      zone.onMicrotaskEmpty.emit(null);
    } finally {
      zone._nesting--;
      if (!zone.hasPendingMicrotasks) {
        try {
          zone.runOutsideAngular(() => zone.onStable.emit(null));
        } finally {
          zone.isStable = true;
        }
      }
    }
  }
}
function delayChangeDetectionForEvents(zone) {
  if (zone.isCheckStableRunning || zone.lastRequestAnimationFrameId !== -1) {
    return;
  }
  zone.lastRequestAnimationFrameId = zone.nativeRequestAnimationFrame.call(_global, () => {
    if (!zone.fakeTopEventTask) {
      zone.fakeTopEventTask = Zone.root.scheduleEventTask("fakeTopEventTask", () => {
        zone.lastRequestAnimationFrameId = -1;
        updateMicroTaskStatus(zone);
        zone.isCheckStableRunning = true;
        checkStable(zone);
        zone.isCheckStableRunning = false;
      }, void 0, () => {
      }, () => {
      });
    }
    zone.fakeTopEventTask.invoke();
  });
  updateMicroTaskStatus(zone);
}
function forkInnerZoneWithAngularBehavior(zone) {
  const delayChangeDetectionForEventsDelegate = () => {
    delayChangeDetectionForEvents(zone);
  };
  zone._inner = zone._inner.fork({
    name: "angular",
    properties: { "isAngularZone": true },
    onInvokeTask: (delegate, current, target, task, applyThis, applyArgs) => {
      try {
        onEnter(zone);
        return delegate.invokeTask(target, task, applyThis, applyArgs);
      } finally {
        if (zone.shouldCoalesceEventChangeDetection && task.type === "eventTask" || zone.shouldCoalesceRunChangeDetection) {
          delayChangeDetectionForEventsDelegate();
        }
        onLeave(zone);
      }
    },
    onInvoke: (delegate, current, target, callback, applyThis, applyArgs, source) => {
      try {
        onEnter(zone);
        return delegate.invoke(target, callback, applyThis, applyArgs, source);
      } finally {
        if (zone.shouldCoalesceRunChangeDetection) {
          delayChangeDetectionForEventsDelegate();
        }
        onLeave(zone);
      }
    },
    onHasTask: (delegate, current, target, hasTaskState) => {
      delegate.hasTask(target, hasTaskState);
      if (current === target) {
        if (hasTaskState.change == "microTask") {
          zone._hasPendingMicrotasks = hasTaskState.microTask;
          updateMicroTaskStatus(zone);
          checkStable(zone);
        } else if (hasTaskState.change == "macroTask") {
          zone.hasPendingMacrotasks = hasTaskState.macroTask;
        }
      }
    },
    onHandleError: (delegate, current, target, error) => {
      delegate.handleError(target, error);
      zone.runOutsideAngular(() => zone.onError.emit(error));
      return false;
    }
  });
}
function updateMicroTaskStatus(zone) {
  if (zone._hasPendingMicrotasks || (zone.shouldCoalesceEventChangeDetection || zone.shouldCoalesceRunChangeDetection) && zone.lastRequestAnimationFrameId !== -1) {
    zone.hasPendingMicrotasks = true;
  } else {
    zone.hasPendingMicrotasks = false;
  }
}
function onEnter(zone) {
  zone._nesting++;
  if (zone.isStable) {
    zone.isStable = false;
    zone.onUnstable.emit(null);
  }
}
function onLeave(zone) {
  zone._nesting--;
  checkStable(zone);
}
class NoopNgZone {
  constructor() {
    this.hasPendingMicrotasks = false;
    this.hasPendingMacrotasks = false;
    this.isStable = true;
    this.onUnstable = new EventEmitter();
    this.onMicrotaskEmpty = new EventEmitter();
    this.onStable = new EventEmitter();
    this.onError = new EventEmitter();
  }
  run(fn, applyThis, applyArgs) {
    return fn.apply(applyThis, applyArgs);
  }
  runGuarded(fn, applyThis, applyArgs) {
    return fn.apply(applyThis, applyArgs);
  }
  runOutsideAngular(fn) {
    return fn();
  }
  runTask(fn, applyThis, applyArgs, name) {
    return fn.apply(applyThis, applyArgs);
  }
}
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
class Testability {
  constructor(_ngZone) {
    this._ngZone = _ngZone;
    this._pendingCount = 0;
    this._isZoneStable = true;
    this._didWork = false;
    this._callbacks = [];
    this.taskTrackingZone = null;
    this._watchAngularEvents();
    _ngZone.run(() => {
      this.taskTrackingZone = typeof Zone == "undefined" ? null : Zone.current.get("TaskTrackingZone");
    });
  }
  _watchAngularEvents() {
    this._ngZone.onUnstable.subscribe({
      next: () => {
        this._didWork = true;
        this._isZoneStable = false;
      }
    });
    this._ngZone.runOutsideAngular(() => {
      this._ngZone.onStable.subscribe({
        next: () => {
          NgZone.assertNotInAngularZone();
          scheduleMicroTask(() => {
            this._isZoneStable = true;
            this._runCallbacksIfReady();
          });
        }
      });
    });
  }
  /**
   * Increases the number of pending request
   * @deprecated pending requests are now tracked with zones.
   */
  increasePendingRequestCount() {
    this._pendingCount += 1;
    this._didWork = true;
    return this._pendingCount;
  }
  /**
   * Decreases the number of pending request
   * @deprecated pending requests are now tracked with zones
   */
  decreasePendingRequestCount() {
    this._pendingCount -= 1;
    if (this._pendingCount < 0) {
      throw new Error("pending async requests below zero");
    }
    this._runCallbacksIfReady();
    return this._pendingCount;
  }
  /**
   * Whether an associated application is stable
   */
  isStable() {
    return this._isZoneStable && this._pendingCount === 0 && !this._ngZone.hasPendingMacrotasks;
  }
  _runCallbacksIfReady() {
    if (this.isStable()) {
      scheduleMicroTask(() => {
        while (this._callbacks.length !== 0) {
          let cb = this._callbacks.pop();
          clearTimeout(cb.timeoutId);
          cb.doneCb(this._didWork);
        }
        this._didWork = false;
      });
    } else {
      let pending = this.getPendingTasks();
      this._callbacks = this._callbacks.filter((cb) => {
        if (cb.updateCb && cb.updateCb(pending)) {
          clearTimeout(cb.timeoutId);
          return false;
        }
        return true;
      });
      this._didWork = true;
    }
  }
  getPendingTasks() {
    if (!this.taskTrackingZone) {
      return [];
    }
    return this.taskTrackingZone.macroTasks.map((t) => {
      return {
        source: t.source,
        // From TaskTrackingZone:
        // https://github.com/angular/zone.js/blob/master/lib/zone-spec/task-tracking.ts#L40
        creationLocation: t.creationLocation,
        data: t.data
      };
    });
  }
  addCallback(cb, timeout, updateCb) {
    let timeoutId = -1;
    if (timeout && timeout > 0) {
      timeoutId = setTimeout(() => {
        this._callbacks = this._callbacks.filter((cb2) => cb2.timeoutId !== timeoutId);
        cb(this._didWork, this.getPendingTasks());
      }, timeout);
    }
    this._callbacks.push({ doneCb: cb, timeoutId, updateCb });
  }
  /**
   * Wait for the application to be stable with a timeout. If the timeout is reached before that
   * happens, the callback receives a list of the macro tasks that were pending, otherwise null.
   *
   * @param doneCb The callback to invoke when Angular is stable or the timeout expires
   *    whichever comes first.
   * @param timeout Optional. The maximum time to wait for Angular to become stable. If not
   *    specified, whenStable() will wait forever.
   * @param updateCb Optional. If specified, this callback will be invoked whenever the set of
   *    pending macrotasks changes. If this callback returns true doneCb will not be invoked
   *    and no further updates will be issued.
   */
  whenStable(doneCb, timeout, updateCb) {
    if (updateCb && !this.taskTrackingZone) {
      throw new Error('Task tracking zone is required when passing an update callback to whenStable(). Is "zone.js/plugins/task-tracking" loaded?');
    }
    this.addCallback(doneCb, timeout, updateCb);
    this._runCallbacksIfReady();
  }
  /**
   * Get the number of pending requests
   * @deprecated pending requests are now tracked with zones
   */
  getPendingRequestCount() {
    return this._pendingCount;
  }
  /**
   * Find providers by name
   * @param using The root element to search from
   * @param provider The name of binding variable
   * @param exactMatch Whether using exactMatch
   */
  findProviders(using, provider, exactMatch) {
    return [];
  }
}
Testability.ɵfac = function Testability_Factory(t) {
  return new (t || Testability)(ɵɵinject(NgZone));
};
Testability.ɵprov = /* @__PURE__ */ ɵɵdefineInjectable({ token: Testability, factory: Testability.ɵfac });
(function() {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(Testability, [{
    type: Injectable
  }], function() {
    return [{ type: NgZone }];
  }, null);
})();
class TestabilityRegistry {
  constructor() {
    this._applications = /* @__PURE__ */ new Map();
    _testabilityGetter.addToWindow(this);
  }
  /**
   * Registers an application with a testability hook so that it can be tracked
   * @param token token of application, root element
   * @param testability Testability hook
   */
  registerApplication(token, testability) {
    this._applications.set(token, testability);
  }
  /**
   * Unregisters an application.
   * @param token token of application, root element
   */
  unregisterApplication(token) {
    this._applications.delete(token);
  }
  /**
   * Unregisters all applications
   */
  unregisterAllApplications() {
    this._applications.clear();
  }
  /**
   * Get a testability hook associated with the application
   * @param elem root element
   */
  getTestability(elem) {
    return this._applications.get(elem) || null;
  }
  /**
   * Get all registered testabilities
   */
  getAllTestabilities() {
    return Array.from(this._applications.values());
  }
  /**
   * Get all registered applications(root elements)
   */
  getAllRootElements() {
    return Array.from(this._applications.keys());
  }
  /**
   * Find testability of a node in the Tree
   * @param elem node
   * @param findInAncestors whether finding testability in ancestors if testability was not found in
   * current node
   */
  findTestabilityInTree(elem, findInAncestors = true) {
    return _testabilityGetter.findTestabilityInTree(this, elem, findInAncestors);
  }
}
TestabilityRegistry.ɵfac = function TestabilityRegistry_Factory(t) {
  return new (t || TestabilityRegistry)();
};
TestabilityRegistry.ɵprov = /* @__PURE__ */ ɵɵdefineInjectable({ token: TestabilityRegistry, factory: TestabilityRegistry.ɵfac, providedIn: "platform" });
(function() {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(TestabilityRegistry, [{
    type: Injectable,
    args: [{ providedIn: "platform" }]
  }], function() {
    return [];
  }, null);
})();
class _NoopGetTestability {
  addToWindow(registry) {
  }
  findTestabilityInTree(registry, elem, findInAncestors) {
    return null;
  }
}
function setTestabilityGetter(getter) {
  _testabilityGetter = getter;
}
let _testabilityGetter = new _NoopGetTestability();
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
let _platformInjector = null;
const ALLOW_MULTIPLE_PLATFORMS = new InjectionToken("AllowMultipleToken");
const PLATFORM_ON_DESTROY = new InjectionToken("PlatformOnDestroy");
function compileNgModuleFactory(injector, options, moduleType) {
  ngDevMode && assertNgModuleType(moduleType);
  const moduleFactory = new NgModuleFactory(moduleType);
  if (typeof ngJitMode !== "undefined" && !ngJitMode) {
    return Promise.resolve(moduleFactory);
  }
  const compilerOptions = injector.get(COMPILER_OPTIONS, []).concat(options);
  setJitOptions({
    defaultEncapsulation: _lastDefined(compilerOptions.map((opts) => opts.defaultEncapsulation)),
    preserveWhitespaces: _lastDefined(compilerOptions.map((opts) => opts.preserveWhitespaces))
  });
  if (isComponentResourceResolutionQueueEmpty()) {
    return Promise.resolve(moduleFactory);
  }
  const compilerProviders = _mergeArrays(compilerOptions.map((o) => o.providers));
  if (compilerProviders.length === 0) {
    return Promise.resolve(moduleFactory);
  }
  const compiler = getCompilerFacade({
    usage: 0,
    kind: "NgModule",
    type: moduleType
  });
  const compilerInjector = Injector.create({ providers: compilerProviders });
  const resourceLoader = compilerInjector.get(compiler.ResourceLoader);
  return resolveComponentResources((url) => Promise.resolve(resourceLoader.get(url))).then(() => moduleFactory);
}
function publishDefaultGlobalUtils() {
  ngDevMode && publishDefaultGlobalUtils$1();
}
function isBoundToModule(cf) {
  return cf.isBoundToModule;
}
class NgProbeToken {
  constructor(name, token) {
    this.name = name;
    this.token = token;
  }
}
function createPlatform(injector) {
  if (_platformInjector && !_platformInjector.get(ALLOW_MULTIPLE_PLATFORMS, false)) {
    const errorMessage = typeof ngDevMode === "undefined" || ngDevMode ? "There can be only one platform. Destroy the previous one to create a new one." : "";
    throw new RuntimeError(400, errorMessage);
  }
  publishDefaultGlobalUtils();
  _platformInjector = injector;
  const platform = injector.get(PlatformRef);
  const inits = injector.get(PLATFORM_INITIALIZER, null);
  if (inits)
    inits.forEach((initFn) => initFn());
  return platform;
}
function createPlatformFactory(parentPlatformFactory, name, providers = []) {
  const desc = `Platform: ${name}`;
  const marker = new InjectionToken(desc);
  return (extraProviders = []) => {
    let platform = getPlatform();
    if (!platform || platform.injector.get(ALLOW_MULTIPLE_PLATFORMS, false)) {
      const platformProviders = [
        ...providers,
        ...extraProviders,
        { provide: marker, useValue: true }
      ];
      if (parentPlatformFactory) {
        parentPlatformFactory(platformProviders);
      } else {
        createPlatform(createPlatformInjector(platformProviders, desc));
      }
    }
    return assertPlatform(marker);
  };
}
function assertPlatform(requiredToken) {
  const platform = getPlatform();
  if (!platform) {
    const errorMessage = typeof ngDevMode === "undefined" || ngDevMode ? "No platform exists!" : "";
    throw new RuntimeError(401, errorMessage);
  }
  if ((typeof ngDevMode === "undefined" || ngDevMode) && !platform.injector.get(requiredToken, null)) {
    throw new RuntimeError(400, "A platform with a different configuration has been created. Please destroy it first.");
  }
  return platform;
}
function createPlatformInjector(providers = [], name) {
  return Injector.create({
    name,
    providers: [
      { provide: INJECTOR_SCOPE, useValue: "platform" },
      { provide: PLATFORM_ON_DESTROY, useValue: () => _platformInjector = null },
      ...providers
    ]
  });
}
function destroyPlatform() {
  getPlatform()?.destroy();
}
function getPlatform() {
  return _platformInjector?.get(PlatformRef) ?? null;
}
class PlatformRef {
  /** @internal */
  constructor(_injector) {
    this._injector = _injector;
    this._modules = [];
    this._destroyListeners = [];
    this._destroyed = false;
  }
  /**
   * Creates an instance of an `@NgModule` for the given platform.
   *
   * @deprecated Passing NgModule factories as the `PlatformRef.bootstrapModuleFactory` function
   *     argument is deprecated. Use the `PlatformRef.bootstrapModule` API instead.
   */
  bootstrapModuleFactory(moduleFactory, options) {
    const ngZoneOption = options ? options.ngZone : void 0;
    const ngZoneEventCoalescing = options && options.ngZoneEventCoalescing || false;
    const ngZoneRunCoalescing = options && options.ngZoneRunCoalescing || false;
    const ngZone = getNgZone(ngZoneOption, { ngZoneEventCoalescing, ngZoneRunCoalescing });
    const providers = [{ provide: NgZone, useValue: ngZone }];
    return ngZone.run(() => {
      const ngZoneInjector = Injector.create({ providers, parent: this.injector, name: moduleFactory.moduleType.name });
      const moduleRef = moduleFactory.create(ngZoneInjector);
      const exceptionHandler = moduleRef.injector.get(ErrorHandler, null);
      if (!exceptionHandler) {
        const errorMessage = typeof ngDevMode === "undefined" || ngDevMode ? "No ErrorHandler. Is platform module (BrowserModule) included?" : "";
        throw new RuntimeError(402, errorMessage);
      }
      ngZone.runOutsideAngular(() => {
        const subscription = ngZone.onError.subscribe({
          next: (error) => {
            exceptionHandler.handleError(error);
          }
        });
        moduleRef.onDestroy(() => {
          remove(this._modules, moduleRef);
          subscription.unsubscribe();
        });
      });
      return _callAndReportToErrorHandler(exceptionHandler, ngZone, () => {
        const initStatus = moduleRef.injector.get(ApplicationInitStatus);
        initStatus.runInitializers();
        return initStatus.donePromise.then(() => {
          const localeId = moduleRef.injector.get(LOCALE_ID, DEFAULT_LOCALE_ID);
          setLocaleId(localeId || DEFAULT_LOCALE_ID);
          this._moduleDoBootstrap(moduleRef);
          return moduleRef;
        });
      });
    });
  }
  /**
   * Creates an instance of an `@NgModule` for a given platform.
   *
   * @usageNotes
   * ### Simple Example
   *
   * ```typescript
   * @NgModule({
   *   imports: [BrowserModule]
   * })
   * class MyModule {}
   *
   * let moduleRef = platformBrowser().bootstrapModule(MyModule);
   * ```
   *
   */
  bootstrapModule(moduleType, compilerOptions = []) {
    const options = optionsReducer({}, compilerOptions);
    return compileNgModuleFactory(this.injector, options, moduleType).then((moduleFactory) => this.bootstrapModuleFactory(moduleFactory, options));
  }
  _moduleDoBootstrap(moduleRef) {
    const appRef = moduleRef.injector.get(ApplicationRef);
    if (moduleRef._bootstrapComponents.length > 0) {
      moduleRef._bootstrapComponents.forEach((f) => appRef.bootstrap(f));
    } else if (moduleRef.instance.ngDoBootstrap) {
      moduleRef.instance.ngDoBootstrap(appRef);
    } else {
      const errorMessage = typeof ngDevMode === "undefined" || ngDevMode ? `The module ${stringify(moduleRef.instance.constructor)} was bootstrapped, but it does not declare "@NgModule.bootstrap" components nor a "ngDoBootstrap" method. Please define one of these.` : "";
      throw new RuntimeError(403, errorMessage);
    }
    this._modules.push(moduleRef);
  }
  /**
   * Registers a listener to be called when the platform is destroyed.
   */
  onDestroy(callback) {
    this._destroyListeners.push(callback);
  }
  /**
   * Retrieves the platform {@link Injector}, which is the parent injector for
   * every Angular application on the page and provides singleton providers.
   */
  get injector() {
    return this._injector;
  }
  /**
   * Destroys the current Angular platform and all Angular applications on the page.
   * Destroys all modules and listeners registered with the platform.
   */
  destroy() {
    if (this._destroyed) {
      const errorMessage = typeof ngDevMode === "undefined" || ngDevMode ? "The platform has already been destroyed!" : "";
      throw new RuntimeError(404, errorMessage);
    }
    this._modules.slice().forEach((module) => module.destroy());
    this._destroyListeners.forEach((listener) => listener());
    const destroyListener = this._injector.get(PLATFORM_ON_DESTROY, null);
    destroyListener?.();
    this._destroyed = true;
  }
  get destroyed() {
    return this._destroyed;
  }
}
PlatformRef.ɵfac = function PlatformRef_Factory(t) {
  return new (t || PlatformRef)(ɵɵinject(Injector));
};
PlatformRef.ɵprov = /* @__PURE__ */ ɵɵdefineInjectable({ token: PlatformRef, factory: PlatformRef.ɵfac, providedIn: "platform" });
(function() {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(PlatformRef, [{
    type: Injectable,
    args: [{ providedIn: "platform" }]
  }], function() {
    return [{ type: Injector }];
  }, null);
})();
function getNgZone(ngZoneOption, extra) {
  let ngZone;
  if (ngZoneOption === "noop") {
    ngZone = new NoopNgZone();
  } else {
    ngZone = (ngZoneOption === "zone.js" ? void 0 : ngZoneOption) || new NgZone({
      enableLongStackTrace: typeof ngDevMode === "undefined" ? false : !!ngDevMode,
      shouldCoalesceEventChangeDetection: !!extra?.ngZoneEventCoalescing,
      shouldCoalesceRunChangeDetection: !!extra?.ngZoneRunCoalescing
    });
  }
  return ngZone;
}
function _callAndReportToErrorHandler(errorHandler2, ngZone, callback) {
  try {
    const result = callback();
    if (isPromise(result)) {
      return result.catch((e) => {
        ngZone.runOutsideAngular(() => errorHandler2.handleError(e));
        throw e;
      });
    }
    return result;
  } catch (e) {
    ngZone.runOutsideAngular(() => errorHandler2.handleError(e));
    throw e;
  }
}
function optionsReducer(dst, objs) {
  if (Array.isArray(objs)) {
    dst = objs.reduce(optionsReducer, dst);
  } else {
    dst = { ...dst, ...objs };
  }
  return dst;
}
class ApplicationRef {
  /** @internal */
  constructor(_zone, _injector, _exceptionHandler, _initStatus) {
    this._zone = _zone;
    this._injector = _injector;
    this._exceptionHandler = _exceptionHandler;
    this._initStatus = _initStatus;
    this._bootstrapListeners = [];
    this._views = [];
    this._runningTick = false;
    this._stable = true;
    this.componentTypes = [];
    this.components = [];
    this._onMicrotaskEmptySubscription = this._zone.onMicrotaskEmpty.subscribe({
      next: () => {
        this._zone.run(() => {
          this.tick();
        });
      }
    });
    const isCurrentlyStable = new Observable((observer) => {
      this._stable = this._zone.isStable && !this._zone.hasPendingMacrotasks && !this._zone.hasPendingMicrotasks;
      this._zone.runOutsideAngular(() => {
        observer.next(this._stable);
        observer.complete();
      });
    });
    const isStable = new Observable((observer) => {
      let stableSub;
      this._zone.runOutsideAngular(() => {
        stableSub = this._zone.onStable.subscribe(() => {
          NgZone.assertNotInAngularZone();
          scheduleMicroTask(() => {
            if (!this._stable && !this._zone.hasPendingMacrotasks && !this._zone.hasPendingMicrotasks) {
              this._stable = true;
              observer.next(true);
            }
          });
        });
      });
      const unstableSub = this._zone.onUnstable.subscribe(() => {
        NgZone.assertInAngularZone();
        if (this._stable) {
          this._stable = false;
          this._zone.runOutsideAngular(() => {
            observer.next(false);
          });
        }
      });
      return () => {
        stableSub.unsubscribe();
        unstableSub.unsubscribe();
      };
    });
    this.isStable = merge$1(isCurrentlyStable, isStable.pipe(share()));
  }
  /**
   * Bootstrap a component onto the element identified by its selector or, optionally, to a
   * specified element.
   *
   * @usageNotes
   * ### Bootstrap process
   *
   * When bootstrapping a component, Angular mounts it onto a target DOM element
   * and kicks off automatic change detection. The target DOM element can be
   * provided using the `rootSelectorOrNode` argument.
   *
   * If the target DOM element is not provided, Angular tries to find one on a page
   * using the `selector` of the component that is being bootstrapped
   * (first matched element is used).
   *
   * ### Example
   *
   * Generally, we define the component to bootstrap in the `bootstrap` array of `NgModule`,
   * but it requires us to know the component while writing the application code.
   *
   * Imagine a situation where we have to wait for an API call to decide about the component to
   * bootstrap. We can use the `ngDoBootstrap` hook of the `NgModule` and call this method to
   * dynamically bootstrap a component.
   *
   * {@example core/ts/platform/platform.ts region='componentSelector'}
   *
   * Optionally, a component can be mounted onto a DOM element that does not match the
   * selector of the bootstrapped component.
   *
   * In the following example, we are providing a CSS selector to match the target element.
   *
   * {@example core/ts/platform/platform.ts region='cssSelector'}
   *
   * While in this example, we are providing reference to a DOM node.
   *
   * {@example core/ts/platform/platform.ts region='domNode'}
   */
  bootstrap(componentOrFactory, rootSelectorOrNode) {
    if (!this._initStatus.done) {
      const errorMessage = typeof ngDevMode === "undefined" || ngDevMode ? "Cannot bootstrap as there are still asynchronous initializers running. Bootstrap components in the `ngDoBootstrap` method of the root module." : "";
      throw new RuntimeError(405, errorMessage);
    }
    let componentFactory;
    if (componentOrFactory instanceof ComponentFactory$1) {
      componentFactory = componentOrFactory;
    } else {
      const resolver = this._injector.get(ComponentFactoryResolver$1);
      componentFactory = resolver.resolveComponentFactory(componentOrFactory);
    }
    this.componentTypes.push(componentFactory.componentType);
    const ngModule = isBoundToModule(componentFactory) ? void 0 : this._injector.get(NgModuleRef$1);
    const selectorOrNode = rootSelectorOrNode || componentFactory.selector;
    const compRef = componentFactory.create(Injector.NULL, [], selectorOrNode, ngModule);
    const nativeElement = compRef.location.nativeElement;
    const testability = compRef.injector.get(Testability, null);
    const testabilityRegistry = testability && compRef.injector.get(TestabilityRegistry);
    if (testability && testabilityRegistry) {
      testabilityRegistry.registerApplication(nativeElement, testability);
    }
    compRef.onDestroy(() => {
      this.detachView(compRef.hostView);
      remove(this.components, compRef);
      if (testabilityRegistry) {
        testabilityRegistry.unregisterApplication(nativeElement);
      }
    });
    this._loadComponent(compRef);
    if (typeof ngDevMode === "undefined" || ngDevMode) {
      const _console = this._injector.get(Console);
      _console.log(`Angular is running in development mode. Call enableProdMode() to enable production mode.`);
    }
    return compRef;
  }
  /**
   * Invoke this method to explicitly process change detection and its side-effects.
   *
   * In development mode, `tick()` also performs a second change detection cycle to ensure that no
   * further changes are detected. If additional changes are picked up during this second cycle,
   * bindings in the app have side-effects that cannot be resolved in a single change detection
   * pass.
   * In this case, Angular throws an error, since an Angular application can only have one change
   * detection pass during which all change detection must complete.
   */
  tick() {
    if (this._runningTick) {
      const errorMessage = typeof ngDevMode === "undefined" || ngDevMode ? "ApplicationRef.tick is called recursively" : "";
      throw new RuntimeError(101, errorMessage);
    }
    try {
      this._runningTick = true;
      for (let view of this._views) {
        view.detectChanges();
      }
      if (typeof ngDevMode === "undefined" || ngDevMode) {
        for (let view of this._views) {
          view.checkNoChanges();
        }
      }
    } catch (e) {
      this._zone.runOutsideAngular(() => this._exceptionHandler.handleError(e));
    } finally {
      this._runningTick = false;
    }
  }
  /**
   * Attaches a view so that it will be dirty checked.
   * The view will be automatically detached when it is destroyed.
   * This will throw if the view is already attached to a ViewContainer.
   */
  attachView(viewRef) {
    const view = viewRef;
    this._views.push(view);
    view.attachToAppRef(this);
  }
  /**
   * Detaches a view from dirty checking again.
   */
  detachView(viewRef) {
    const view = viewRef;
    remove(this._views, view);
    view.detachFromAppRef();
  }
  _loadComponent(componentRef) {
    this.attachView(componentRef.hostView);
    this.tick();
    this.components.push(componentRef);
    const listeners = this._injector.get(APP_BOOTSTRAP_LISTENER, []).concat(this._bootstrapListeners);
    listeners.forEach((listener) => listener(componentRef));
  }
  /** @internal */
  ngOnDestroy() {
    this._views.slice().forEach((view) => view.destroy());
    this._onMicrotaskEmptySubscription.unsubscribe();
  }
  /**
   * Returns the number of attached views.
   */
  get viewCount() {
    return this._views.length;
  }
}
ApplicationRef.ɵfac = function ApplicationRef_Factory(t) {
  return new (t || ApplicationRef)(ɵɵinject(NgZone), ɵɵinject(Injector), ɵɵinject(ErrorHandler), ɵɵinject(ApplicationInitStatus));
};
ApplicationRef.ɵprov = /* @__PURE__ */ ɵɵdefineInjectable({ token: ApplicationRef, factory: ApplicationRef.ɵfac, providedIn: "root" });
(function() {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(ApplicationRef, [{
    type: Injectable,
    args: [{ providedIn: "root" }]
  }], function() {
    return [{ type: NgZone }, { type: Injector }, { type: ErrorHandler }, { type: ApplicationInitStatus }];
  }, null);
})();
function remove(list, el) {
  const index = list.indexOf(el);
  if (index > -1) {
    list.splice(index, 1);
  }
}
function _lastDefined(args) {
  for (let i = args.length - 1; i >= 0; i--) {
    if (args[i] !== void 0) {
      return args[i];
    }
  }
  return void 0;
}
function _mergeArrays(parts) {
  const result = [];
  parts.forEach((part) => part && result.push(...part));
  return result;
}
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
let _devMode = true;
let _runModeLocked = false;
function isDevMode() {
  _runModeLocked = true;
  return _devMode;
}
function enableProdMode() {
  if (_runModeLocked) {
    throw new Error("Cannot enable prod mode after platform setup.");
  }
  if (typeof ngDevMode === void 0 || !!ngDevMode) {
    _global["ngDevMode"] = false;
  }
  _devMode = false;
}
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
function getModuleFactory(id) {
  const type = getRegisteredNgModuleType(id);
  if (!type)
    throw noModuleError(id);
  return new NgModuleFactory(type);
}
function getNgModuleById(id) {
  const type = getRegisteredNgModuleType(id);
  if (!type)
    throw noModuleError(id);
  return type;
}
function noModuleError(id) {
  return new Error(`No module with ID ${id} loaded`);
}
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
class ChangeDetectorRef {
}
ChangeDetectorRef.__NG_ELEMENT_ID__ = injectChangeDetectorRef;
function injectChangeDetectorRef(flags) {
  return createViewRef(
    getCurrentTNode(),
    getLView(),
    (flags & 16) === 16
    /* ForPipe */
  );
}
function createViewRef(tNode, lView, isPipe) {
  if (isComponentHost(tNode) && !isPipe) {
    const componentView = getComponentLViewByIndex(tNode.index, lView);
    return new ViewRef$1(componentView, componentView);
  } else if (tNode.type & (3 | 12 | 32)) {
    const hostComponentView = lView[DECLARATION_COMPONENT_VIEW];
    return new ViewRef$1(hostComponentView, lView);
  }
  return null;
}
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
class ViewRef extends ChangeDetectorRef {
}
class EmbeddedViewRef extends ViewRef {
}
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
class DebugEventListener {
  constructor(name, callback) {
    this.name = name;
    this.callback = callback;
  }
}
function asNativeElements(debugEls) {
  return debugEls.map((el) => el.nativeElement);
}
class DebugNode {
  constructor(nativeNode) {
    this.nativeNode = nativeNode;
  }
  /**
   * The `DebugElement` parent. Will be `null` if this is the root element.
   */
  get parent() {
    const parent = this.nativeNode.parentNode;
    return parent ? new DebugElement(parent) : null;
  }
  /**
   * The host dependency injector. For example, the root element's component instance injector.
   */
  get injector() {
    return getInjector(this.nativeNode);
  }
  /**
   * The element's own component instance, if it has one.
   */
  get componentInstance() {
    const nativeElement = this.nativeNode;
    return nativeElement && (getComponent$1(nativeElement) || getOwningComponent(nativeElement));
  }
  /**
   * An object that provides parent context for this element. Often an ancestor component instance
   * that governs this element.
   *
   * When an element is repeated within *ngFor, the context is an `NgForOf` whose `$implicit`
   * property is the value of the row instance value. For example, the `hero` in `*ngFor="let hero
   * of heroes"`.
   */
  get context() {
    return getComponent$1(this.nativeNode) || getContext(this.nativeNode);
  }
  /**
   * The callbacks attached to the component's @Output properties and/or the element's event
   * properties.
   */
  get listeners() {
    return getListeners(this.nativeNode).filter((listener) => listener.type === "dom");
  }
  /**
   * Dictionary of objects associated with template local variables (e.g. #foo), keyed by the local
   * variable name.
   */
  get references() {
    return getLocalRefs(this.nativeNode);
  }
  /**
   * This component's injector lookup tokens. Includes the component itself plus the tokens that the
   * component lists in its providers metadata.
   */
  get providerTokens() {
    return getInjectionTokens(this.nativeNode);
  }
}
class DebugElement extends DebugNode {
  constructor(nativeNode) {
    ngDevMode && assertDomNode(nativeNode);
    super(nativeNode);
  }
  /**
   * The underlying DOM element at the root of the component.
   */
  get nativeElement() {
    return this.nativeNode.nodeType == Node.ELEMENT_NODE ? this.nativeNode : null;
  }
  /**
   * The element tag name, if it is an element.
   */
  get name() {
    const context = getLContext(this.nativeNode);
    if (context !== null) {
      const lView = context.lView;
      const tData = lView[TVIEW].data;
      const tNode = tData[context.nodeIndex];
      return tNode.value;
    } else {
      return this.nativeNode.nodeName;
    }
  }
  /**
   *  Gets a map of property names to property values for an element.
   *
   *  This map includes:
   *  - Regular property bindings (e.g. `[id]="id"`)
   *  - Host property bindings (e.g. `host: { '[id]': "id" }`)
   *  - Interpolated property bindings (e.g. `id="{{ value }}")
   *
   *  It does not include:
   *  - input property bindings (e.g. `[myCustomInput]="value"`)
   *  - attribute bindings (e.g. `[attr.role]="menu"`)
   */
  get properties() {
    const context = getLContext(this.nativeNode);
    if (context === null) {
      return {};
    }
    const lView = context.lView;
    const tData = lView[TVIEW].data;
    const tNode = tData[context.nodeIndex];
    const properties = {};
    copyDomProperties(this.nativeElement, properties);
    collectPropertyBindings(properties, tNode, lView, tData);
    return properties;
  }
  /**
   *  A map of attribute names to attribute values for an element.
   */
  get attributes() {
    const attributes = {};
    const element = this.nativeElement;
    if (!element) {
      return attributes;
    }
    const context = getLContext(element);
    if (context === null) {
      return {};
    }
    const lView = context.lView;
    const tNodeAttrs = lView[TVIEW].data[context.nodeIndex].attrs;
    const lowercaseTNodeAttrs = [];
    if (tNodeAttrs) {
      let i = 0;
      while (i < tNodeAttrs.length) {
        const attrName = tNodeAttrs[i];
        if (typeof attrName !== "string")
          break;
        const attrValue = tNodeAttrs[i + 1];
        attributes[attrName] = attrValue;
        lowercaseTNodeAttrs.push(attrName.toLowerCase());
        i += 2;
      }
    }
    const eAttrs = element.attributes;
    for (let i = 0; i < eAttrs.length; i++) {
      const attr = eAttrs[i];
      const lowercaseName = attr.name.toLowerCase();
      if (lowercaseTNodeAttrs.indexOf(lowercaseName) === -1) {
        attributes[lowercaseName] = attr.value;
      }
    }
    return attributes;
  }
  /**
   * The inline styles of the DOM element.
   *
   * Will be `null` if there is no `style` property on the underlying DOM element.
   *
   * @see [ElementCSSInlineStyle](https://developer.mozilla.org/en-US/docs/Web/API/ElementCSSInlineStyle/style)
   */
  get styles() {
    if (this.nativeElement && this.nativeElement.style) {
      return this.nativeElement.style;
    }
    return {};
  }
  /**
   * A map containing the class names on the element as keys.
   *
   * This map is derived from the `className` property of the DOM element.
   *
   * Note: The values of this object will always be `true`. The class key will not appear in the KV
   * object if it does not exist on the element.
   *
   * @see [Element.className](https://developer.mozilla.org/en-US/docs/Web/API/Element/className)
   */
  get classes() {
    const result = {};
    const element = this.nativeElement;
    const className = element.className;
    const classes = typeof className !== "string" ? className.baseVal.split(" ") : className.split(" ");
    classes.forEach((value) => result[value] = true);
    return result;
  }
  /**
   * The `childNodes` of the DOM element as a `DebugNode` array.
   *
   * @see [Node.childNodes](https://developer.mozilla.org/en-US/docs/Web/API/Node/childNodes)
   */
  get childNodes() {
    const childNodes = this.nativeNode.childNodes;
    const children = [];
    for (let i = 0; i < childNodes.length; i++) {
      const element = childNodes[i];
      children.push(getDebugNode(element));
    }
    return children;
  }
  /**
   * The immediate `DebugElement` children. Walk the tree by descending through `children`.
   */
  get children() {
    const nativeElement = this.nativeElement;
    if (!nativeElement)
      return [];
    const childNodes = nativeElement.children;
    const children = [];
    for (let i = 0; i < childNodes.length; i++) {
      const element = childNodes[i];
      children.push(getDebugNode(element));
    }
    return children;
  }
  /**
   * @returns the first `DebugElement` that matches the predicate at any depth in the subtree.
   */
  query(predicate) {
    const results = this.queryAll(predicate);
    return results[0] || null;
  }
  /**
   * @returns All `DebugElement` matches for the predicate at any depth in the subtree.
   */
  queryAll(predicate) {
    const matches = [];
    _queryAll(this, predicate, matches, true);
    return matches;
  }
  /**
   * @returns All `DebugNode` matches for the predicate at any depth in the subtree.
   */
  queryAllNodes(predicate) {
    const matches = [];
    _queryAll(this, predicate, matches, false);
    return matches;
  }
  /**
   * Triggers the event by its name if there is a corresponding listener in the element's
   * `listeners` collection.
   *
   * If the event lacks a listener or there's some other problem, consider
   * calling `nativeElement.dispatchEvent(eventObject)`.
   *
   * @param eventName The name of the event to trigger
   * @param eventObj The _event object_ expected by the handler
   *
   * @see [Testing components scenarios](guide/testing-components-scenarios#trigger-event-handler)
   */
  triggerEventHandler(eventName, eventObj) {
    const node = this.nativeNode;
    const invokedListeners = [];
    this.listeners.forEach((listener) => {
      if (listener.name === eventName) {
        const callback = listener.callback;
        callback.call(node, eventObj);
        invokedListeners.push(callback);
      }
    });
    if (typeof node.eventListeners === "function") {
      node.eventListeners(eventName).forEach((listener) => {
        if (listener.toString().indexOf("__ngUnwrap__") !== -1) {
          const unwrappedListener = listener("__ngUnwrap__");
          return invokedListeners.indexOf(unwrappedListener) === -1 && unwrappedListener.call(node, eventObj);
        }
      });
    }
  }
}
function copyDomProperties(element, properties) {
  if (element) {
    let obj = Object.getPrototypeOf(element);
    const NodePrototype = Node.prototype;
    while (obj !== null && obj !== NodePrototype) {
      const descriptors = Object.getOwnPropertyDescriptors(obj);
      for (let key in descriptors) {
        if (!key.startsWith("__") && !key.startsWith("on")) {
          const value = element[key];
          if (isPrimitiveValue(value)) {
            properties[key] = value;
          }
        }
      }
      obj = Object.getPrototypeOf(obj);
    }
  }
}
function isPrimitiveValue(value) {
  return typeof value === "string" || typeof value === "boolean" || typeof value === "number" || value === null;
}
function _queryAll(parentElement, predicate, matches, elementsOnly) {
  const context = getLContext(parentElement.nativeNode);
  if (context !== null) {
    const parentTNode = context.lView[TVIEW].data[context.nodeIndex];
    _queryNodeChildren(parentTNode, context.lView, predicate, matches, elementsOnly, parentElement.nativeNode);
  } else {
    _queryNativeNodeDescendants(parentElement.nativeNode, predicate, matches, elementsOnly);
  }
}
function _queryNodeChildren(tNode, lView, predicate, matches, elementsOnly, rootNativeNode) {
  ngDevMode && assertTNodeForLView(tNode, lView);
  const nativeNode = getNativeByTNodeOrNull(tNode, lView);
  if (tNode.type & (3 | 8)) {
    _addQueryMatch(nativeNode, predicate, matches, elementsOnly, rootNativeNode);
    if (isComponentHost(tNode)) {
      const componentView = getComponentLViewByIndex(tNode.index, lView);
      if (componentView && componentView[TVIEW].firstChild) {
        _queryNodeChildren(componentView[TVIEW].firstChild, componentView, predicate, matches, elementsOnly, rootNativeNode);
      }
    } else {
      if (tNode.child) {
        _queryNodeChildren(tNode.child, lView, predicate, matches, elementsOnly, rootNativeNode);
      }
      nativeNode && _queryNativeNodeDescendants(nativeNode, predicate, matches, elementsOnly);
    }
    const nodeOrContainer = lView[tNode.index];
    if (isLContainer(nodeOrContainer)) {
      _queryNodeChildrenInContainer(nodeOrContainer, predicate, matches, elementsOnly, rootNativeNode);
    }
  } else if (tNode.type & 4) {
    const lContainer = lView[tNode.index];
    _addQueryMatch(lContainer[NATIVE], predicate, matches, elementsOnly, rootNativeNode);
    _queryNodeChildrenInContainer(lContainer, predicate, matches, elementsOnly, rootNativeNode);
  } else if (tNode.type & 16) {
    const componentView = lView[DECLARATION_COMPONENT_VIEW];
    const componentHost = componentView[T_HOST];
    const head = componentHost.projection[tNode.projection];
    if (Array.isArray(head)) {
      for (let nativeNode2 of head) {
        _addQueryMatch(nativeNode2, predicate, matches, elementsOnly, rootNativeNode);
      }
    } else if (head) {
      const nextLView = componentView[PARENT];
      const nextTNode = nextLView[TVIEW].data[head.index];
      _queryNodeChildren(nextTNode, nextLView, predicate, matches, elementsOnly, rootNativeNode);
    }
  } else if (tNode.child) {
    _queryNodeChildren(tNode.child, lView, predicate, matches, elementsOnly, rootNativeNode);
  }
  if (rootNativeNode !== nativeNode) {
    const nextTNode = tNode.flags & 4 ? tNode.projectionNext : tNode.next;
    if (nextTNode) {
      _queryNodeChildren(nextTNode, lView, predicate, matches, elementsOnly, rootNativeNode);
    }
  }
}
function _queryNodeChildrenInContainer(lContainer, predicate, matches, elementsOnly, rootNativeNode) {
  for (let i = CONTAINER_HEADER_OFFSET; i < lContainer.length; i++) {
    const childView = lContainer[i];
    const firstChild = childView[TVIEW].firstChild;
    if (firstChild) {
      _queryNodeChildren(firstChild, childView, predicate, matches, elementsOnly, rootNativeNode);
    }
  }
}
function _addQueryMatch(nativeNode, predicate, matches, elementsOnly, rootNativeNode) {
  if (rootNativeNode !== nativeNode) {
    const debugNode = getDebugNode(nativeNode);
    if (!debugNode) {
      return;
    }
    if (elementsOnly && debugNode instanceof DebugElement && predicate(debugNode) && matches.indexOf(debugNode) === -1) {
      matches.push(debugNode);
    } else if (!elementsOnly && predicate(debugNode) && matches.indexOf(debugNode) === -1) {
      matches.push(debugNode);
    }
  }
}
function _queryNativeNodeDescendants(parentNode, predicate, matches, elementsOnly) {
  const nodes = parentNode.childNodes;
  const length = nodes.length;
  for (let i = 0; i < length; i++) {
    const node = nodes[i];
    const debugNode = getDebugNode(node);
    if (debugNode) {
      if (elementsOnly && debugNode instanceof DebugElement && predicate(debugNode) && matches.indexOf(debugNode) === -1) {
        matches.push(debugNode);
      } else if (!elementsOnly && predicate(debugNode) && matches.indexOf(debugNode) === -1) {
        matches.push(debugNode);
      }
      _queryNativeNodeDescendants(node, predicate, matches, elementsOnly);
    }
  }
}
function collectPropertyBindings(properties, tNode, lView, tData) {
  let bindingIndexes = tNode.propertyBindings;
  if (bindingIndexes !== null) {
    for (let i = 0; i < bindingIndexes.length; i++) {
      const bindingIndex = bindingIndexes[i];
      const propMetadata = tData[bindingIndex];
      const metadataParts = propMetadata.split(INTERPOLATION_DELIMITER);
      const propertyName = metadataParts[0];
      if (metadataParts.length > 1) {
        let value = metadataParts[1];
        for (let j = 1; j < metadataParts.length - 1; j++) {
          value += renderStringify(lView[bindingIndex + j - 1]) + metadataParts[j + 1];
        }
        properties[propertyName] = value;
      } else {
        properties[propertyName] = lView[bindingIndex];
      }
    }
  }
}
const NG_DEBUG_PROPERTY = "__ng_debug__";
function getDebugNode(nativeNode) {
  if (nativeNode instanceof Node) {
    if (!nativeNode.hasOwnProperty(NG_DEBUG_PROPERTY)) {
      nativeNode[NG_DEBUG_PROPERTY] = nativeNode.nodeType == Node.ELEMENT_NODE ? new DebugElement(nativeNode) : new DebugNode(nativeNode);
    }
    return nativeNode[NG_DEBUG_PROPERTY];
  }
  return null;
}
function getDebugNodeR2(_nativeNode) {
  return null;
}
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
class DefaultIterableDifferFactory {
  constructor() {
  }
  supports(obj) {
    return isListLikeIterable(obj);
  }
  create(trackByFn) {
    return new DefaultIterableDiffer(trackByFn);
  }
}
const trackByIdentity = (index, item) => item;
class DefaultIterableDiffer {
  constructor(trackByFn) {
    this.length = 0;
    this._linkedRecords = null;
    this._unlinkedRecords = null;
    this._previousItHead = null;
    this._itHead = null;
    this._itTail = null;
    this._additionsHead = null;
    this._additionsTail = null;
    this._movesHead = null;
    this._movesTail = null;
    this._removalsHead = null;
    this._removalsTail = null;
    this._identityChangesHead = null;
    this._identityChangesTail = null;
    this._trackByFn = trackByFn || trackByIdentity;
  }
  forEachItem(fn) {
    let record;
    for (record = this._itHead; record !== null; record = record._next) {
      fn(record);
    }
  }
  forEachOperation(fn) {
    let nextIt = this._itHead;
    let nextRemove = this._removalsHead;
    let addRemoveOffset = 0;
    let moveOffsets = null;
    while (nextIt || nextRemove) {
      const record = !nextRemove || nextIt && nextIt.currentIndex < getPreviousIndex(nextRemove, addRemoveOffset, moveOffsets) ? nextIt : nextRemove;
      const adjPreviousIndex = getPreviousIndex(record, addRemoveOffset, moveOffsets);
      const currentIndex = record.currentIndex;
      if (record === nextRemove) {
        addRemoveOffset--;
        nextRemove = nextRemove._nextRemoved;
      } else {
        nextIt = nextIt._next;
        if (record.previousIndex == null) {
          addRemoveOffset++;
        } else {
          if (!moveOffsets)
            moveOffsets = [];
          const localMovePreviousIndex = adjPreviousIndex - addRemoveOffset;
          const localCurrentIndex = currentIndex - addRemoveOffset;
          if (localMovePreviousIndex != localCurrentIndex) {
            for (let i = 0; i < localMovePreviousIndex; i++) {
              const offset = i < moveOffsets.length ? moveOffsets[i] : moveOffsets[i] = 0;
              const index = offset + i;
              if (localCurrentIndex <= index && index < localMovePreviousIndex) {
                moveOffsets[i] = offset + 1;
              }
            }
            const previousIndex = record.previousIndex;
            moveOffsets[previousIndex] = localCurrentIndex - localMovePreviousIndex;
          }
        }
      }
      if (adjPreviousIndex !== currentIndex) {
        fn(record, adjPreviousIndex, currentIndex);
      }
    }
  }
  forEachPreviousItem(fn) {
    let record;
    for (record = this._previousItHead; record !== null; record = record._nextPrevious) {
      fn(record);
    }
  }
  forEachAddedItem(fn) {
    let record;
    for (record = this._additionsHead; record !== null; record = record._nextAdded) {
      fn(record);
    }
  }
  forEachMovedItem(fn) {
    let record;
    for (record = this._movesHead; record !== null; record = record._nextMoved) {
      fn(record);
    }
  }
  forEachRemovedItem(fn) {
    let record;
    for (record = this._removalsHead; record !== null; record = record._nextRemoved) {
      fn(record);
    }
  }
  forEachIdentityChange(fn) {
    let record;
    for (record = this._identityChangesHead; record !== null; record = record._nextIdentityChange) {
      fn(record);
    }
  }
  diff(collection) {
    if (collection == null)
      collection = [];
    if (!isListLikeIterable(collection)) {
      const errorMessage = typeof ngDevMode === "undefined" || ngDevMode ? `Error trying to diff '${stringify(collection)}'. Only arrays and iterables are allowed` : "";
      throw new RuntimeError(900, errorMessage);
    }
    if (this.check(collection)) {
      return this;
    } else {
      return null;
    }
  }
  onDestroy() {
  }
  check(collection) {
    this._reset();
    let record = this._itHead;
    let mayBeDirty = false;
    let index;
    let item;
    let itemTrackBy;
    if (Array.isArray(collection)) {
      this.length = collection.length;
      for (let index2 = 0; index2 < this.length; index2++) {
        item = collection[index2];
        itemTrackBy = this._trackByFn(index2, item);
        if (record === null || !Object.is(record.trackById, itemTrackBy)) {
          record = this._mismatch(record, item, itemTrackBy, index2);
          mayBeDirty = true;
        } else {
          if (mayBeDirty) {
            record = this._verifyReinsertion(record, item, itemTrackBy, index2);
          }
          if (!Object.is(record.item, item))
            this._addIdentityChange(record, item);
        }
        record = record._next;
      }
    } else {
      index = 0;
      iterateListLike(collection, (item2) => {
        itemTrackBy = this._trackByFn(index, item2);
        if (record === null || !Object.is(record.trackById, itemTrackBy)) {
          record = this._mismatch(record, item2, itemTrackBy, index);
          mayBeDirty = true;
        } else {
          if (mayBeDirty) {
            record = this._verifyReinsertion(record, item2, itemTrackBy, index);
          }
          if (!Object.is(record.item, item2))
            this._addIdentityChange(record, item2);
        }
        record = record._next;
        index++;
      });
      this.length = index;
    }
    this._truncate(record);
    this.collection = collection;
    return this.isDirty;
  }
  /* CollectionChanges is considered dirty if it has any additions, moves, removals, or identity
   * changes.
   */
  get isDirty() {
    return this._additionsHead !== null || this._movesHead !== null || this._removalsHead !== null || this._identityChangesHead !== null;
  }
  /**
   * Reset the state of the change objects to show no changes. This means set previousKey to
   * currentKey, and clear all of the queues (additions, moves, removals).
   * Set the previousIndexes of moved and added items to their currentIndexes
   * Reset the list of additions, moves and removals
   *
   * @internal
   */
  _reset() {
    if (this.isDirty) {
      let record;
      for (record = this._previousItHead = this._itHead; record !== null; record = record._next) {
        record._nextPrevious = record._next;
      }
      for (record = this._additionsHead; record !== null; record = record._nextAdded) {
        record.previousIndex = record.currentIndex;
      }
      this._additionsHead = this._additionsTail = null;
      for (record = this._movesHead; record !== null; record = record._nextMoved) {
        record.previousIndex = record.currentIndex;
      }
      this._movesHead = this._movesTail = null;
      this._removalsHead = this._removalsTail = null;
      this._identityChangesHead = this._identityChangesTail = null;
    }
  }
  /**
   * This is the core function which handles differences between collections.
   *
   * - `record` is the record which we saw at this position last time. If null then it is a new
   *   item.
   * - `item` is the current item in the collection
   * - `index` is the position of the item in the collection
   *
   * @internal
   */
  _mismatch(record, item, itemTrackBy, index) {
    let previousRecord;
    if (record === null) {
      previousRecord = this._itTail;
    } else {
      previousRecord = record._prev;
      this._remove(record);
    }
    record = this._unlinkedRecords === null ? null : this._unlinkedRecords.get(itemTrackBy, null);
    if (record !== null) {
      if (!Object.is(record.item, item))
        this._addIdentityChange(record, item);
      this._reinsertAfter(record, previousRecord, index);
    } else {
      record = this._linkedRecords === null ? null : this._linkedRecords.get(itemTrackBy, index);
      if (record !== null) {
        if (!Object.is(record.item, item))
          this._addIdentityChange(record, item);
        this._moveAfter(record, previousRecord, index);
      } else {
        record = this._addAfter(new IterableChangeRecord_(item, itemTrackBy), previousRecord, index);
      }
    }
    return record;
  }
  /**
   * This check is only needed if an array contains duplicates. (Short circuit of nothing dirty)
   *
   * Use case: `[a, a]` => `[b, a, a]`
   *
   * If we did not have this check then the insertion of `b` would:
   *   1) evict first `a`
   *   2) insert `b` at `0` index.
   *   3) leave `a` at index `1` as is. <-- this is wrong!
   *   3) reinsert `a` at index 2. <-- this is wrong!
   *
   * The correct behavior is:
   *   1) evict first `a`
   *   2) insert `b` at `0` index.
   *   3) reinsert `a` at index 1.
   *   3) move `a` at from `1` to `2`.
   *
   *
   * Double check that we have not evicted a duplicate item. We need to check if the item type may
   * have already been removed:
   * The insertion of b will evict the first 'a'. If we don't reinsert it now it will be reinserted
   * at the end. Which will show up as the two 'a's switching position. This is incorrect, since a
   * better way to think of it is as insert of 'b' rather then switch 'a' with 'b' and then add 'a'
   * at the end.
   *
   * @internal
   */
  _verifyReinsertion(record, item, itemTrackBy, index) {
    let reinsertRecord = this._unlinkedRecords === null ? null : this._unlinkedRecords.get(itemTrackBy, null);
    if (reinsertRecord !== null) {
      record = this._reinsertAfter(reinsertRecord, record._prev, index);
    } else if (record.currentIndex != index) {
      record.currentIndex = index;
      this._addToMoves(record, index);
    }
    return record;
  }
  /**
   * Get rid of any excess {@link IterableChangeRecord_}s from the previous collection
   *
   * - `record` The first excess {@link IterableChangeRecord_}.
   *
   * @internal
   */
  _truncate(record) {
    while (record !== null) {
      const nextRecord = record._next;
      this._addToRemovals(this._unlink(record));
      record = nextRecord;
    }
    if (this._unlinkedRecords !== null) {
      this._unlinkedRecords.clear();
    }
    if (this._additionsTail !== null) {
      this._additionsTail._nextAdded = null;
    }
    if (this._movesTail !== null) {
      this._movesTail._nextMoved = null;
    }
    if (this._itTail !== null) {
      this._itTail._next = null;
    }
    if (this._removalsTail !== null) {
      this._removalsTail._nextRemoved = null;
    }
    if (this._identityChangesTail !== null) {
      this._identityChangesTail._nextIdentityChange = null;
    }
  }
  /** @internal */
  _reinsertAfter(record, prevRecord, index) {
    if (this._unlinkedRecords !== null) {
      this._unlinkedRecords.remove(record);
    }
    const prev = record._prevRemoved;
    const next = record._nextRemoved;
    if (prev === null) {
      this._removalsHead = next;
    } else {
      prev._nextRemoved = next;
    }
    if (next === null) {
      this._removalsTail = prev;
    } else {
      next._prevRemoved = prev;
    }
    this._insertAfter(record, prevRecord, index);
    this._addToMoves(record, index);
    return record;
  }
  /** @internal */
  _moveAfter(record, prevRecord, index) {
    this._unlink(record);
    this._insertAfter(record, prevRecord, index);
    this._addToMoves(record, index);
    return record;
  }
  /** @internal */
  _addAfter(record, prevRecord, index) {
    this._insertAfter(record, prevRecord, index);
    if (this._additionsTail === null) {
      this._additionsTail = this._additionsHead = record;
    } else {
      this._additionsTail = this._additionsTail._nextAdded = record;
    }
    return record;
  }
  /** @internal */
  _insertAfter(record, prevRecord, index) {
    const next = prevRecord === null ? this._itHead : prevRecord._next;
    record._next = next;
    record._prev = prevRecord;
    if (next === null) {
      this._itTail = record;
    } else {
      next._prev = record;
    }
    if (prevRecord === null) {
      this._itHead = record;
    } else {
      prevRecord._next = record;
    }
    if (this._linkedRecords === null) {
      this._linkedRecords = new _DuplicateMap();
    }
    this._linkedRecords.put(record);
    record.currentIndex = index;
    return record;
  }
  /** @internal */
  _remove(record) {
    return this._addToRemovals(this._unlink(record));
  }
  /** @internal */
  _unlink(record) {
    if (this._linkedRecords !== null) {
      this._linkedRecords.remove(record);
    }
    const prev = record._prev;
    const next = record._next;
    if (prev === null) {
      this._itHead = next;
    } else {
      prev._next = next;
    }
    if (next === null) {
      this._itTail = prev;
    } else {
      next._prev = prev;
    }
    return record;
  }
  /** @internal */
  _addToMoves(record, toIndex) {
    if (record.previousIndex === toIndex) {
      return record;
    }
    if (this._movesTail === null) {
      this._movesTail = this._movesHead = record;
    } else {
      this._movesTail = this._movesTail._nextMoved = record;
    }
    return record;
  }
  _addToRemovals(record) {
    if (this._unlinkedRecords === null) {
      this._unlinkedRecords = new _DuplicateMap();
    }
    this._unlinkedRecords.put(record);
    record.currentIndex = null;
    record._nextRemoved = null;
    if (this._removalsTail === null) {
      this._removalsTail = this._removalsHead = record;
      record._prevRemoved = null;
    } else {
      record._prevRemoved = this._removalsTail;
      this._removalsTail = this._removalsTail._nextRemoved = record;
    }
    return record;
  }
  /** @internal */
  _addIdentityChange(record, item) {
    record.item = item;
    if (this._identityChangesTail === null) {
      this._identityChangesTail = this._identityChangesHead = record;
    } else {
      this._identityChangesTail = this._identityChangesTail._nextIdentityChange = record;
    }
    return record;
  }
}
class IterableChangeRecord_ {
  constructor(item, trackById) {
    this.item = item;
    this.trackById = trackById;
    this.currentIndex = null;
    this.previousIndex = null;
    this._nextPrevious = null;
    this._prev = null;
    this._next = null;
    this._prevDup = null;
    this._nextDup = null;
    this._prevRemoved = null;
    this._nextRemoved = null;
    this._nextAdded = null;
    this._nextMoved = null;
    this._nextIdentityChange = null;
  }
}
class _DuplicateItemRecordList {
  constructor() {
    this._head = null;
    this._tail = null;
  }
  /**
   * Append the record to the list of duplicates.
   *
   * Note: by design all records in the list of duplicates hold the same value in record.item.
   */
  add(record) {
    if (this._head === null) {
      this._head = this._tail = record;
      record._nextDup = null;
      record._prevDup = null;
    } else {
      this._tail._nextDup = record;
      record._prevDup = this._tail;
      record._nextDup = null;
      this._tail = record;
    }
  }
  // Returns a IterableChangeRecord_ having IterableChangeRecord_.trackById == trackById and
  // IterableChangeRecord_.currentIndex >= atOrAfterIndex
  get(trackById, atOrAfterIndex) {
    let record;
    for (record = this._head; record !== null; record = record._nextDup) {
      if ((atOrAfterIndex === null || atOrAfterIndex <= record.currentIndex) && Object.is(record.trackById, trackById)) {
        return record;
      }
    }
    return null;
  }
  /**
   * Remove one {@link IterableChangeRecord_} from the list of duplicates.
   *
   * Returns whether the list of duplicates is empty.
   */
  remove(record) {
    const prev = record._prevDup;
    const next = record._nextDup;
    if (prev === null) {
      this._head = next;
    } else {
      prev._nextDup = next;
    }
    if (next === null) {
      this._tail = prev;
    } else {
      next._prevDup = prev;
    }
    return this._head === null;
  }
}
class _DuplicateMap {
  constructor() {
    this.map = /* @__PURE__ */ new Map();
  }
  put(record) {
    const key = record.trackById;
    let duplicates = this.map.get(key);
    if (!duplicates) {
      duplicates = new _DuplicateItemRecordList();
      this.map.set(key, duplicates);
    }
    duplicates.add(record);
  }
  /**
   * Retrieve the `value` using key. Because the IterableChangeRecord_ value may be one which we
   * have already iterated over, we use the `atOrAfterIndex` to pretend it is not there.
   *
   * Use case: `[a, b, c, a, a]` if we are at index `3` which is the second `a` then asking if we
   * have any more `a`s needs to return the second `a`.
   */
  get(trackById, atOrAfterIndex) {
    const key = trackById;
    const recordList = this.map.get(key);
    return recordList ? recordList.get(trackById, atOrAfterIndex) : null;
  }
  /**
   * Removes a {@link IterableChangeRecord_} from the list of duplicates.
   *
   * The list of duplicates also is removed from the map if it gets empty.
   */
  remove(record) {
    const key = record.trackById;
    const recordList = this.map.get(key);
    if (recordList.remove(record)) {
      this.map.delete(key);
    }
    return record;
  }
  get isEmpty() {
    return this.map.size === 0;
  }
  clear() {
    this.map.clear();
  }
}
function getPreviousIndex(item, addRemoveOffset, moveOffsets) {
  const previousIndex = item.previousIndex;
  if (previousIndex === null)
    return previousIndex;
  let moveOffset = 0;
  if (moveOffsets && previousIndex < moveOffsets.length) {
    moveOffset = moveOffsets[previousIndex];
  }
  return previousIndex + addRemoveOffset + moveOffset;
}
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
class DefaultKeyValueDifferFactory {
  constructor() {
  }
  supports(obj) {
    return obj instanceof Map || isJsObject(obj);
  }
  create() {
    return new DefaultKeyValueDiffer();
  }
}
class DefaultKeyValueDiffer {
  constructor() {
    this._records = /* @__PURE__ */ new Map();
    this._mapHead = null;
    this._appendAfter = null;
    this._previousMapHead = null;
    this._changesHead = null;
    this._changesTail = null;
    this._additionsHead = null;
    this._additionsTail = null;
    this._removalsHead = null;
    this._removalsTail = null;
  }
  get isDirty() {
    return this._additionsHead !== null || this._changesHead !== null || this._removalsHead !== null;
  }
  forEachItem(fn) {
    let record;
    for (record = this._mapHead; record !== null; record = record._next) {
      fn(record);
    }
  }
  forEachPreviousItem(fn) {
    let record;
    for (record = this._previousMapHead; record !== null; record = record._nextPrevious) {
      fn(record);
    }
  }
  forEachChangedItem(fn) {
    let record;
    for (record = this._changesHead; record !== null; record = record._nextChanged) {
      fn(record);
    }
  }
  forEachAddedItem(fn) {
    let record;
    for (record = this._additionsHead; record !== null; record = record._nextAdded) {
      fn(record);
    }
  }
  forEachRemovedItem(fn) {
    let record;
    for (record = this._removalsHead; record !== null; record = record._nextRemoved) {
      fn(record);
    }
  }
  diff(map2) {
    if (!map2) {
      map2 = /* @__PURE__ */ new Map();
    } else if (!(map2 instanceof Map || isJsObject(map2))) {
      const errorMessage = typeof ngDevMode === "undefined" || ngDevMode ? `Error trying to diff '${stringify(map2)}'. Only maps and objects are allowed` : "";
      throw new RuntimeError(900, errorMessage);
    }
    return this.check(map2) ? this : null;
  }
  onDestroy() {
  }
  /**
   * Check the current state of the map vs the previous.
   * The algorithm is optimised for when the keys do no change.
   */
  check(map2) {
    this._reset();
    let insertBefore = this._mapHead;
    this._appendAfter = null;
    this._forEach(map2, (value, key) => {
      if (insertBefore && insertBefore.key === key) {
        this._maybeAddToChanges(insertBefore, value);
        this._appendAfter = insertBefore;
        insertBefore = insertBefore._next;
      } else {
        const record = this._getOrCreateRecordForKey(key, value);
        insertBefore = this._insertBeforeOrAppend(insertBefore, record);
      }
    });
    if (insertBefore) {
      if (insertBefore._prev) {
        insertBefore._prev._next = null;
      }
      this._removalsHead = insertBefore;
      for (let record = insertBefore; record !== null; record = record._nextRemoved) {
        if (record === this._mapHead) {
          this._mapHead = null;
        }
        this._records.delete(record.key);
        record._nextRemoved = record._next;
        record.previousValue = record.currentValue;
        record.currentValue = null;
        record._prev = null;
        record._next = null;
      }
    }
    if (this._changesTail)
      this._changesTail._nextChanged = null;
    if (this._additionsTail)
      this._additionsTail._nextAdded = null;
    return this.isDirty;
  }
  /**
   * Inserts a record before `before` or append at the end of the list when `before` is null.
   *
   * Notes:
   * - This method appends at `this._appendAfter`,
   * - This method updates `this._appendAfter`,
   * - The return value is the new value for the insertion pointer.
   */
  _insertBeforeOrAppend(before, record) {
    if (before) {
      const prev = before._prev;
      record._next = before;
      record._prev = prev;
      before._prev = record;
      if (prev) {
        prev._next = record;
      }
      if (before === this._mapHead) {
        this._mapHead = record;
      }
      this._appendAfter = before;
      return before;
    }
    if (this._appendAfter) {
      this._appendAfter._next = record;
      record._prev = this._appendAfter;
    } else {
      this._mapHead = record;
    }
    this._appendAfter = record;
    return null;
  }
  _getOrCreateRecordForKey(key, value) {
    if (this._records.has(key)) {
      const record2 = this._records.get(key);
      this._maybeAddToChanges(record2, value);
      const prev = record2._prev;
      const next = record2._next;
      if (prev) {
        prev._next = next;
      }
      if (next) {
        next._prev = prev;
      }
      record2._next = null;
      record2._prev = null;
      return record2;
    }
    const record = new KeyValueChangeRecord_(key);
    this._records.set(key, record);
    record.currentValue = value;
    this._addToAdditions(record);
    return record;
  }
  /** @internal */
  _reset() {
    if (this.isDirty) {
      let record;
      this._previousMapHead = this._mapHead;
      for (record = this._previousMapHead; record !== null; record = record._next) {
        record._nextPrevious = record._next;
      }
      for (record = this._changesHead; record !== null; record = record._nextChanged) {
        record.previousValue = record.currentValue;
      }
      for (record = this._additionsHead; record != null; record = record._nextAdded) {
        record.previousValue = record.currentValue;
      }
      this._changesHead = this._changesTail = null;
      this._additionsHead = this._additionsTail = null;
      this._removalsHead = null;
    }
  }
  // Add the record or a given key to the list of changes only when the value has actually changed
  _maybeAddToChanges(record, newValue) {
    if (!Object.is(newValue, record.currentValue)) {
      record.previousValue = record.currentValue;
      record.currentValue = newValue;
      this._addToChanges(record);
    }
  }
  _addToAdditions(record) {
    if (this._additionsHead === null) {
      this._additionsHead = this._additionsTail = record;
    } else {
      this._additionsTail._nextAdded = record;
      this._additionsTail = record;
    }
  }
  _addToChanges(record) {
    if (this._changesHead === null) {
      this._changesHead = this._changesTail = record;
    } else {
      this._changesTail._nextChanged = record;
      this._changesTail = record;
    }
  }
  /** @internal */
  _forEach(obj, fn) {
    if (obj instanceof Map) {
      obj.forEach(fn);
    } else {
      Object.keys(obj).forEach((k) => fn(obj[k], k));
    }
  }
}
class KeyValueChangeRecord_ {
  constructor(key) {
    this.key = key;
    this.previousValue = null;
    this.currentValue = null;
    this._nextPrevious = null;
    this._next = null;
    this._prev = null;
    this._nextAdded = null;
    this._nextRemoved = null;
    this._nextChanged = null;
  }
}
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
function defaultIterableDiffersFactory() {
  return new IterableDiffers([new DefaultIterableDifferFactory()]);
}
class IterableDiffers {
  constructor(factories) {
    this.factories = factories;
  }
  static create(factories, parent) {
    if (parent != null) {
      const copied = parent.factories.slice();
      factories = factories.concat(copied);
    }
    return new IterableDiffers(factories);
  }
  /**
   * Takes an array of {@link IterableDifferFactory} and returns a provider used to extend the
   * inherited {@link IterableDiffers} instance with the provided factories and return a new
   * {@link IterableDiffers} instance.
   *
   * @usageNotes
   * ### Example
   *
   * The following example shows how to extend an existing list of factories,
   * which will only be applied to the injector for this component and its children.
   * This step is all that's required to make a new {@link IterableDiffer} available.
   *
   * ```
   * @Component({
   *   viewProviders: [
   *     IterableDiffers.extend([new ImmutableListDiffer()])
   *   ]
   * })
   * ```
   */
  static extend(factories) {
    return {
      provide: IterableDiffers,
      useFactory: (parent) => {
        return IterableDiffers.create(factories, parent || defaultIterableDiffersFactory());
      },
      // Dependency technically isn't optional, but we can provide a better error message this way.
      deps: [[IterableDiffers, new SkipSelf(), new Optional()]]
    };
  }
  find(iterable) {
    const factory = this.factories.find((f) => f.supports(iterable));
    if (factory != null) {
      return factory;
    } else {
      const errorMessage = typeof ngDevMode === "undefined" || ngDevMode ? `Cannot find a differ supporting object '${iterable}' of type '${getTypeNameForDebugging(iterable)}'` : "";
      throw new RuntimeError(901, errorMessage);
    }
  }
}
IterableDiffers.ɵprov = ɵɵdefineInjectable({ token: IterableDiffers, providedIn: "root", factory: defaultIterableDiffersFactory });
function getTypeNameForDebugging(type) {
  return type["name"] || typeof type;
}
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
function defaultKeyValueDiffersFactory() {
  return new KeyValueDiffers([new DefaultKeyValueDifferFactory()]);
}
class KeyValueDiffers {
  constructor(factories) {
    this.factories = factories;
  }
  static create(factories, parent) {
    if (parent) {
      const copied = parent.factories.slice();
      factories = factories.concat(copied);
    }
    return new KeyValueDiffers(factories);
  }
  /**
   * Takes an array of {@link KeyValueDifferFactory} and returns a provider used to extend the
   * inherited {@link KeyValueDiffers} instance with the provided factories and return a new
   * {@link KeyValueDiffers} instance.
   *
   * @usageNotes
   * ### Example
   *
   * The following example shows how to extend an existing list of factories,
   * which will only be applied to the injector for this component and its children.
   * This step is all that's required to make a new {@link KeyValueDiffer} available.
   *
   * ```
   * @Component({
   *   viewProviders: [
   *     KeyValueDiffers.extend([new ImmutableMapDiffer()])
   *   ]
   * })
   * ```
   */
  static extend(factories) {
    return {
      provide: KeyValueDiffers,
      useFactory: (parent) => {
        return KeyValueDiffers.create(factories, parent || defaultKeyValueDiffersFactory());
      },
      // Dependency technically isn't optional, but we can provide a better error message this way.
      deps: [[KeyValueDiffers, new SkipSelf(), new Optional()]]
    };
  }
  find(kv) {
    const factory = this.factories.find((f) => f.supports(kv));
    if (factory) {
      return factory;
    }
    const errorMessage = typeof ngDevMode === "undefined" || ngDevMode ? `Cannot find a differ supporting object '${kv}'` : "";
    throw new RuntimeError(901, errorMessage);
  }
}
KeyValueDiffers.ɵprov = ɵɵdefineInjectable({ token: KeyValueDiffers, providedIn: "root", factory: defaultKeyValueDiffersFactory });
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
const keyValDiff = [new DefaultKeyValueDifferFactory()];
const iterableDiff = [new DefaultIterableDifferFactory()];
const defaultIterableDiffers = new IterableDiffers(iterableDiff);
const defaultKeyValueDiffers = new KeyValueDiffers(keyValDiff);
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
const platformCore = createPlatformFactory(null, "core", []);
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
class ApplicationModule {
  // Inject ApplicationRef to make it eager...
  constructor(appRef) {
  }
}
ApplicationModule.ɵfac = function ApplicationModule_Factory(t) {
  return new (t || ApplicationModule)(ɵɵinject(ApplicationRef));
};
ApplicationModule.ɵmod = /* @__PURE__ */ ɵɵdefineNgModule({ type: ApplicationModule });
ApplicationModule.ɵinj = /* @__PURE__ */ ɵɵdefineInjector({});
(function() {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(ApplicationModule, [{
    type: NgModule
  }], function() {
    return [{ type: ApplicationRef }];
  }, null);
})();
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
const ɵivyEnabled = true;
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
function ɵɵngDeclareDirective(decl) {
  const compiler = getCompilerFacade({ usage: 1, kind: "directive", type: decl.type });
  return compiler.compileDirectiveDeclaration(angularCoreEnv, `ng:///${decl.type.name}/ɵfac.js`, decl);
}
function ɵɵngDeclareClassMetadata(decl) {
  setClassMetadata(decl.type, decl.decorators, decl.ctorParameters ?? null, decl.propDecorators ?? null);
}
function ɵɵngDeclareComponent(decl) {
  const compiler = getCompilerFacade({ usage: 1, kind: "component", type: decl.type });
  return compiler.compileComponentDeclaration(angularCoreEnv, `ng:///${decl.type.name}/ɵcmp.js`, decl);
}
function ɵɵngDeclareFactory(decl) {
  const compiler = getCompilerFacade({
    usage: 1,
    kind: getFactoryKind(decl.target),
    type: decl.type
  });
  return compiler.compileFactoryDeclaration(angularCoreEnv, `ng:///${decl.type.name}/ɵfac.js`, decl);
}
function getFactoryKind(target) {
  switch (target) {
    case FactoryTarget.Directive:
      return "directive";
    case FactoryTarget.Component:
      return "component";
    case FactoryTarget.Injectable:
      return "injectable";
    case FactoryTarget.Pipe:
      return "pipe";
    case FactoryTarget.NgModule:
      return "NgModule";
  }
}
function ɵɵngDeclareInjectable(decl) {
  const compiler = getCompilerFacade({ usage: 1, kind: "injectable", type: decl.type });
  return compiler.compileInjectableDeclaration(angularCoreEnv, `ng:///${decl.type.name}/ɵprov.js`, decl);
}
function ɵɵngDeclareInjector(decl) {
  const compiler = getCompilerFacade({ usage: 1, kind: "NgModule", type: decl.type });
  return compiler.compileInjectorDeclaration(angularCoreEnv, `ng:///${decl.type.name}/ɵinj.js`, decl);
}
function ɵɵngDeclareNgModule(decl) {
  const compiler = getCompilerFacade({ usage: 1, kind: "NgModule", type: decl.type });
  return compiler.compileNgModuleDeclaration(angularCoreEnv, `ng:///${decl.type.name}/ɵmod.js`, decl);
}
function ɵɵngDeclarePipe(decl) {
  const compiler = getCompilerFacade({ usage: 1, kind: "pipe", type: decl.type });
  return compiler.compilePipeDeclaration(angularCoreEnv, `ng:///${decl.type.name}/ɵpipe.js`, decl);
}
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
if (typeof ngDevMode !== "undefined" && ngDevMode) {
  _global.$localize = _global.$localize || function() {
    throw new Error("It looks like your application or one of its dependencies is using i18n.\nAngular 9 introduced a global `$localize()` function that needs to be loaded.\nPlease run `ng add @angular/localize` from the Angular CLI.\n(For non-CLI projects, add `import '@angular/localize/init';` to your `polyfills.ts` file.\nFor server-side rendering applications add the import to your `main.server.ts` file.)");
  };
}
const i0 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  ANALYZE_FOR_ENTRY_COMPONENTS,
  APP_BOOTSTRAP_LISTENER,
  APP_ID,
  APP_INITIALIZER,
  ApplicationInitStatus,
  ApplicationModule,
  ApplicationRef,
  Attribute,
  COMPILER_OPTIONS,
  CUSTOM_ELEMENTS_SCHEMA,
  get ChangeDetectionStrategy() {
    return ChangeDetectionStrategy;
  },
  ChangeDetectorRef,
  Compiler,
  CompilerFactory,
  Component,
  ComponentFactory: ComponentFactory$1,
  ComponentFactoryResolver: ComponentFactoryResolver$1,
  ComponentRef: ComponentRef$1,
  ContentChild,
  ContentChildren,
  DEFAULT_CURRENCY_CODE,
  DebugElement,
  DebugEventListener,
  DebugNode,
  DefaultIterableDiffer,
  Directive,
  ElementRef,
  EmbeddedViewRef,
  ErrorHandler,
  EventEmitter,
  Host,
  HostBinding,
  HostListener,
  INJECTOR,
  Inject,
  get InjectFlags() {
    return InjectFlags;
  },
  Injectable,
  InjectionToken,
  Injector,
  Input,
  IterableDiffers,
  KeyValueDiffers,
  LOCALE_ID,
  get MissingTranslationStrategy() {
    return MissingTranslationStrategy;
  },
  ModuleWithComponentFactories,
  NO_ERRORS_SCHEMA,
  NgModule,
  NgModuleFactory: NgModuleFactory$1,
  NgModuleRef: NgModuleRef$1,
  NgProbeToken,
  NgZone,
  Optional,
  Output,
  PACKAGE_ROOT_URL,
  PLATFORM_ID,
  PLATFORM_INITIALIZER,
  Pipe,
  PlatformRef,
  Query,
  QueryList,
  ReflectiveInjector,
  ReflectiveKey,
  Renderer2,
  RendererFactory2,
  get RendererStyleFlags2() {
    return RendererStyleFlags2;
  },
  ResolvedReflectiveFactory,
  Sanitizer,
  get SecurityContext() {
    return SecurityContext;
  },
  Self,
  SimpleChange,
  SkipSelf,
  TRANSLATIONS,
  TRANSLATIONS_FORMAT,
  TemplateRef,
  Testability,
  TestabilityRegistry,
  Type,
  VERSION,
  Version,
  ViewChild,
  ViewChildren,
  ViewContainerRef,
  get ViewEncapsulation() {
    return ViewEncapsulation$1;
  },
  ViewRef,
  asNativeElements,
  assertPlatform,
  createNgModuleRef,
  createPlatform,
  createPlatformFactory,
  defineInjectable,
  destroyPlatform,
  enableProdMode,
  forwardRef,
  getDebugNode,
  getModuleFactory,
  getNgModuleById,
  getPlatform,
  inject,
  isDevMode,
  platformCore,
  resolveForwardRef,
  setTestabilityGetter,
  ɵALLOW_MULTIPLE_PLATFORMS: ALLOW_MULTIPLE_PLATFORMS,
  ɵAPP_ID_RANDOM_PROVIDER: APP_ID_RANDOM_PROVIDER,
  get ɵChangeDetectorStatus() {
    return ChangeDetectorStatus;
  },
  ɵComponentFactory: ComponentFactory$1,
  ɵConsole: Console,
  ɵDEFAULT_LOCALE_ID: DEFAULT_LOCALE_ID,
  ɵINJECTOR_SCOPE: INJECTOR_SCOPE,
  ɵLifecycleHooksFeature: LifecycleHooksFeature,
  get ɵLocaleDataIndex() {
    return LocaleDataIndex;
  },
  ɵNG_COMP_DEF: NG_COMP_DEF,
  ɵNG_DIR_DEF: NG_DIR_DEF,
  ɵNG_ELEMENT_ID: NG_ELEMENT_ID,
  ɵNG_INJ_DEF: NG_INJ_DEF,
  ɵNG_MOD_DEF: NG_MOD_DEF,
  ɵNG_PIPE_DEF: NG_PIPE_DEF,
  ɵNG_PROV_DEF: NG_PROV_DEF,
  ɵNOT_FOUND_CHECK_ONLY_ELEMENT_INJECTOR: NOT_FOUND_CHECK_ONLY_ELEMENT_INJECTOR,
  ɵNO_CHANGE: NO_CHANGE,
  ɵNgModuleFactory: NgModuleFactory,
  ɵNoopNgZone: NoopNgZone,
  ɵReflectionCapabilities: ReflectionCapabilities,
  ɵRender3ComponentFactory: ComponentFactory,
  ɵRender3ComponentRef: ComponentRef,
  ɵRender3NgModuleRef: NgModuleRef,
  ɵRuntimeError: RuntimeError,
  ɵViewRef: ViewRef$1,
  ɵ_sanitizeHtml: _sanitizeHtml,
  ɵ_sanitizeUrl: _sanitizeUrl,
  ɵallowSanitizationBypassAndThrow: allowSanitizationBypassAndThrow,
  ɵbypassSanitizationTrustHtml: bypassSanitizationTrustHtml,
  ɵbypassSanitizationTrustResourceUrl: bypassSanitizationTrustResourceUrl,
  ɵbypassSanitizationTrustScript: bypassSanitizationTrustScript,
  ɵbypassSanitizationTrustStyle: bypassSanitizationTrustStyle,
  ɵbypassSanitizationTrustUrl: bypassSanitizationTrustUrl,
  ɵclearResolutionOfComponentResourcesQueue: clearResolutionOfComponentResourcesQueue,
  ɵcompileComponent: compileComponent,
  ɵcompileDirective: compileDirective,
  ɵcompileNgModule: compileNgModule,
  ɵcompileNgModuleDefs: compileNgModuleDefs,
  ɵcompileNgModuleFactory: compileNgModuleFactory,
  ɵcompilePipe: compilePipe,
  ɵcreateInjector: createInjector,
  ɵdefaultIterableDiffers: defaultIterableDiffers,
  ɵdefaultKeyValueDiffers: defaultKeyValueDiffers,
  ɵdetectChanges: detectChanges,
  ɵdevModeEqual: devModeEqual,
  ɵfindLocaleData: findLocaleData,
  ɵflushModuleScopingQueueAsMuchAsPossible: flushModuleScopingQueueAsMuchAsPossible,
  ɵformatRuntimeError: formatRuntimeError,
  ɵgetDebugNode: getDebugNode,
  ɵgetDebugNodeR2: getDebugNodeR2,
  ɵgetDirectives: getDirectives,
  ɵgetHostElement: getHostElement,
  ɵgetInjectableDef: getInjectableDef,
  ɵgetLContext: getLContext,
  ɵgetLocaleCurrencyCode: getLocaleCurrencyCode,
  ɵgetLocalePluralCase: getLocalePluralCase$1,
  ɵgetSanitizationBypassType: getSanitizationBypassType,
  ɵglobal: _global,
  ɵinjectChangeDetectorRef: injectChangeDetectorRef,
  ɵisBoundToModule: isBoundToModule,
  ɵisDefaultChangeDetectionStrategy: isDefaultChangeDetectionStrategy,
  ɵisListLikeIterable: isListLikeIterable,
  ɵisObservable: isObservable,
  ɵisPromise: isPromise,
  ɵisSubscribable: isSubscribable,
  ɵivyEnabled,
  ɵmakeDecorator: makeDecorator,
  ɵmarkDirty: markDirty,
  ɵnoSideEffects: noSideEffects,
  ɵpatchComponentDefWithScope: patchComponentDefWithScope,
  ɵpublishDefaultGlobalUtils: publishDefaultGlobalUtils$1,
  ɵpublishGlobalUtil: publishGlobalUtil,
  ɵregisterLocaleData: registerLocaleData,
  ɵregisterNgModuleType: registerNgModuleType,
  ɵrenderComponent: renderComponent,
  ɵresetCompiledComponents: resetCompiledComponents,
  ɵresetJitOptions: resetJitOptions,
  ɵresolveComponentResources: resolveComponentResources,
  ɵsetClassMetadata: setClassMetadata,
  ɵsetCurrentInjector: setCurrentInjector,
  ɵsetDocument: setDocument,
  ɵsetLocaleId: setLocaleId,
  ɵstore: store,
  ɵstringify: stringify,
  ɵtransitiveScopesFor: transitiveScopesFor,
  ɵunregisterLocaleData: unregisterAllLocaleData,
  ɵunwrapSafeValue: unwrapSafeValue,
  ɵwhenRendered: whenRendered,
  ɵɵCopyDefinitionFeature,
  get ɵɵFactoryTarget() {
    return FactoryTarget;
  },
  ɵɵInheritDefinitionFeature,
  ɵɵNgOnChangesFeature,
  ɵɵProvidersFeature,
  ɵɵadvance,
  ɵɵattribute,
  ɵɵattributeInterpolate1,
  ɵɵattributeInterpolate2,
  ɵɵattributeInterpolate3,
  ɵɵattributeInterpolate4,
  ɵɵattributeInterpolate5,
  ɵɵattributeInterpolate6,
  ɵɵattributeInterpolate7,
  ɵɵattributeInterpolate8,
  ɵɵattributeInterpolateV,
  ɵɵclassMap,
  ɵɵclassMapInterpolate1,
  ɵɵclassMapInterpolate2,
  ɵɵclassMapInterpolate3,
  ɵɵclassMapInterpolate4,
  ɵɵclassMapInterpolate5,
  ɵɵclassMapInterpolate6,
  ɵɵclassMapInterpolate7,
  ɵɵclassMapInterpolate8,
  ɵɵclassMapInterpolateV,
  ɵɵclassProp,
  ɵɵcontentQuery,
  ɵɵdefineComponent,
  ɵɵdefineDirective,
  ɵɵdefineInjectable,
  ɵɵdefineInjector,
  ɵɵdefineNgModule,
  ɵɵdefinePipe,
  ɵɵdirectiveInject,
  ɵɵdisableBindings,
  ɵɵelement,
  ɵɵelementContainer,
  ɵɵelementContainerEnd,
  ɵɵelementContainerStart,
  ɵɵelementEnd,
  ɵɵelementStart,
  ɵɵenableBindings,
  ɵɵgetCurrentView,
  ɵɵgetInheritedFactory,
  ɵɵhostProperty,
  ɵɵi18n,
  ɵɵi18nApply,
  ɵɵi18nAttributes,
  ɵɵi18nEnd,
  ɵɵi18nExp,
  ɵɵi18nPostprocess,
  ɵɵi18nStart,
  ɵɵinject,
  ɵɵinjectAttribute,
  ɵɵinvalidFactory,
  ɵɵinvalidFactoryDep,
  ɵɵlistener,
  ɵɵloadQuery,
  ɵɵnamespaceHTML,
  ɵɵnamespaceMathML,
  ɵɵnamespaceSVG,
  ɵɵnextContext,
  ɵɵngDeclareClassMetadata,
  ɵɵngDeclareComponent,
  ɵɵngDeclareDirective,
  ɵɵngDeclareFactory,
  ɵɵngDeclareInjectable,
  ɵɵngDeclareInjector,
  ɵɵngDeclareNgModule,
  ɵɵngDeclarePipe,
  ɵɵpipe,
  ɵɵpipeBind1,
  ɵɵpipeBind2,
  ɵɵpipeBind3,
  ɵɵpipeBind4,
  ɵɵpipeBindV,
  ɵɵprojection,
  ɵɵprojectionDef,
  ɵɵproperty,
  ɵɵpropertyInterpolate,
  ɵɵpropertyInterpolate1,
  ɵɵpropertyInterpolate2,
  ɵɵpropertyInterpolate3,
  ɵɵpropertyInterpolate4,
  ɵɵpropertyInterpolate5,
  ɵɵpropertyInterpolate6,
  ɵɵpropertyInterpolate7,
  ɵɵpropertyInterpolate8,
  ɵɵpropertyInterpolateV,
  ɵɵpureFunction0,
  ɵɵpureFunction1,
  ɵɵpureFunction2,
  ɵɵpureFunction3,
  ɵɵpureFunction4,
  ɵɵpureFunction5,
  ɵɵpureFunction6,
  ɵɵpureFunction7,
  ɵɵpureFunction8,
  ɵɵpureFunctionV,
  ɵɵqueryRefresh,
  ɵɵreference,
  ɵɵresolveBody,
  ɵɵresolveDocument,
  ɵɵresolveWindow,
  ɵɵrestoreView,
  ɵɵsanitizeHtml,
  ɵɵsanitizeResourceUrl,
  ɵɵsanitizeScript,
  ɵɵsanitizeStyle,
  ɵɵsanitizeUrl,
  ɵɵsanitizeUrlOrResourceUrl,
  ɵɵsetComponentScope,
  ɵɵsetNgModuleScope,
  ɵɵstyleMap,
  ɵɵstyleMapInterpolate1,
  ɵɵstyleMapInterpolate2,
  ɵɵstyleMapInterpolate3,
  ɵɵstyleMapInterpolate4,
  ɵɵstyleMapInterpolate5,
  ɵɵstyleMapInterpolate6,
  ɵɵstyleMapInterpolate7,
  ɵɵstyleMapInterpolate8,
  ɵɵstyleMapInterpolateV,
  ɵɵstyleProp,
  ɵɵstylePropInterpolate1,
  ɵɵstylePropInterpolate2,
  ɵɵstylePropInterpolate3,
  ɵɵstylePropInterpolate4,
  ɵɵstylePropInterpolate5,
  ɵɵstylePropInterpolate6,
  ɵɵstylePropInterpolate7,
  ɵɵstylePropInterpolate8,
  ɵɵstylePropInterpolateV,
  ɵɵsyntheticHostListener,
  ɵɵsyntheticHostProperty,
  ɵɵtemplate,
  ɵɵtemplateRefExtractor,
  ɵɵtext,
  ɵɵtextInterpolate,
  ɵɵtextInterpolate1,
  ɵɵtextInterpolate2,
  ɵɵtextInterpolate3,
  ɵɵtextInterpolate4,
  ɵɵtextInterpolate5,
  ɵɵtextInterpolate6,
  ɵɵtextInterpolate7,
  ɵɵtextInterpolate8,
  ɵɵtextInterpolateV,
  ɵɵtrustConstantHtml,
  ɵɵtrustConstantResourceUrl,
  ɵɵvalidateIframeAttribute,
  ɵɵviewQuery
}, Symbol.toStringTag, { value: "Module" }));
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
let _DOM = null;
function getDOM() {
  return _DOM;
}
function setRootDomAdapter(adapter) {
  if (!_DOM) {
    _DOM = adapter;
  }
}
class DomAdapter {
}
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
const DOCUMENT = new InjectionToken("DocumentToken");
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
class PlatformLocation {
  historyGo(relativePosition) {
    throw new Error("Not implemented");
  }
}
PlatformLocation.ɵfac = ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "13.4.0", ngImport: i0, type: PlatformLocation, deps: [], target: FactoryTarget.Injectable });
PlatformLocation.ɵprov = ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "13.4.0", ngImport: i0, type: PlatformLocation, providedIn: "platform", useFactory: useBrowserPlatformLocation });
ɵɵngDeclareClassMetadata({ type: PlatformLocation, decorators: [{
  type: Injectable,
  args: [{
    providedIn: "platform",
    // See #23917
    useFactory: useBrowserPlatformLocation
  }]
}] });
function useBrowserPlatformLocation() {
  return ɵɵinject(BrowserPlatformLocation);
}
const LOCATION_INITIALIZED = new InjectionToken("Location Initialized");
class BrowserPlatformLocation extends PlatformLocation {
  constructor(_doc) {
    super();
    this._doc = _doc;
    this._init();
  }
  // This is moved to its own method so that `MockPlatformLocationStrategy` can overwrite it
  /** @internal */
  _init() {
    this.location = window.location;
    this._history = window.history;
  }
  getBaseHrefFromDOM() {
    return getDOM().getBaseHref(this._doc);
  }
  onPopState(fn) {
    const window2 = getDOM().getGlobalEventTarget(this._doc, "window");
    window2.addEventListener("popstate", fn, false);
    return () => window2.removeEventListener("popstate", fn);
  }
  onHashChange(fn) {
    const window2 = getDOM().getGlobalEventTarget(this._doc, "window");
    window2.addEventListener("hashchange", fn, false);
    return () => window2.removeEventListener("hashchange", fn);
  }
  get href() {
    return this.location.href;
  }
  get protocol() {
    return this.location.protocol;
  }
  get hostname() {
    return this.location.hostname;
  }
  get port() {
    return this.location.port;
  }
  get pathname() {
    return this.location.pathname;
  }
  get search() {
    return this.location.search;
  }
  get hash() {
    return this.location.hash;
  }
  set pathname(newPath) {
    this.location.pathname = newPath;
  }
  pushState(state, title, url) {
    if (supportsState()) {
      this._history.pushState(state, title, url);
    } else {
      this.location.hash = url;
    }
  }
  replaceState(state, title, url) {
    if (supportsState()) {
      this._history.replaceState(state, title, url);
    } else {
      this.location.hash = url;
    }
  }
  forward() {
    this._history.forward();
  }
  back() {
    this._history.back();
  }
  historyGo(relativePosition = 0) {
    this._history.go(relativePosition);
  }
  getState() {
    return this._history.state;
  }
}
BrowserPlatformLocation.ɵfac = ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "13.4.0", ngImport: i0, type: BrowserPlatformLocation, deps: [{ token: DOCUMENT }], target: FactoryTarget.Injectable });
BrowserPlatformLocation.ɵprov = ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "13.4.0", ngImport: i0, type: BrowserPlatformLocation, providedIn: "platform", useFactory: createBrowserPlatformLocation });
ɵɵngDeclareClassMetadata({ type: BrowserPlatformLocation, decorators: [{
  type: Injectable,
  args: [{
    providedIn: "platform",
    // See #23917
    useFactory: createBrowserPlatformLocation
  }]
}], ctorParameters: function() {
  return [{ type: void 0, decorators: [{
    type: Inject,
    args: [DOCUMENT]
  }] }];
} });
function supportsState() {
  return !!window.history.pushState;
}
function createBrowserPlatformLocation() {
  return new BrowserPlatformLocation(ɵɵinject(DOCUMENT));
}
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
function joinWithSlash(start, end) {
  if (start.length == 0) {
    return end;
  }
  if (end.length == 0) {
    return start;
  }
  let slashes = 0;
  if (start.endsWith("/")) {
    slashes++;
  }
  if (end.startsWith("/")) {
    slashes++;
  }
  if (slashes == 2) {
    return start + end.substring(1);
  }
  if (slashes == 1) {
    return start + end;
  }
  return start + "/" + end;
}
function stripTrailingSlash(url) {
  const match = url.match(/#|\?|$/);
  const pathEndIdx = match && match.index || url.length;
  const droppedSlashIdx = pathEndIdx - (url[pathEndIdx - 1] === "/" ? 1 : 0);
  return url.slice(0, droppedSlashIdx) + url.slice(pathEndIdx);
}
function normalizeQueryParams(params) {
  return params && params[0] !== "?" ? "?" + params : params;
}
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
class LocationStrategy {
  historyGo(relativePosition) {
    throw new Error("Not implemented");
  }
}
LocationStrategy.ɵfac = ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "13.4.0", ngImport: i0, type: LocationStrategy, deps: [], target: FactoryTarget.Injectable });
LocationStrategy.ɵprov = ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "13.4.0", ngImport: i0, type: LocationStrategy, providedIn: "root", useFactory: provideLocationStrategy });
ɵɵngDeclareClassMetadata({ type: LocationStrategy, decorators: [{
  type: Injectable,
  args: [{ providedIn: "root", useFactory: provideLocationStrategy }]
}] });
function provideLocationStrategy(platformLocation) {
  const location2 = ɵɵinject(DOCUMENT).location;
  return new PathLocationStrategy(ɵɵinject(PlatformLocation), location2 && location2.origin || "");
}
const APP_BASE_HREF = new InjectionToken("appBaseHref");
class PathLocationStrategy extends LocationStrategy {
  constructor(_platformLocation, href) {
    super();
    this._platformLocation = _platformLocation;
    this._removeListenerFns = [];
    if (href == null) {
      href = this._platformLocation.getBaseHrefFromDOM();
    }
    if (href == null) {
      throw new Error(`No base href set. Please provide a value for the APP_BASE_HREF token or add a base element to the document.`);
    }
    this._baseHref = href;
  }
  /** @nodoc */
  ngOnDestroy() {
    while (this._removeListenerFns.length) {
      this._removeListenerFns.pop()();
    }
  }
  onPopState(fn) {
    this._removeListenerFns.push(this._platformLocation.onPopState(fn), this._platformLocation.onHashChange(fn));
  }
  getBaseHref() {
    return this._baseHref;
  }
  prepareExternalUrl(internal) {
    return joinWithSlash(this._baseHref, internal);
  }
  path(includeHash = false) {
    const pathname = this._platformLocation.pathname + normalizeQueryParams(this._platformLocation.search);
    const hash = this._platformLocation.hash;
    return hash && includeHash ? `${pathname}${hash}` : pathname;
  }
  pushState(state, title, url, queryParams) {
    const externalUrl = this.prepareExternalUrl(url + normalizeQueryParams(queryParams));
    this._platformLocation.pushState(state, title, externalUrl);
  }
  replaceState(state, title, url, queryParams) {
    const externalUrl = this.prepareExternalUrl(url + normalizeQueryParams(queryParams));
    this._platformLocation.replaceState(state, title, externalUrl);
  }
  forward() {
    this._platformLocation.forward();
  }
  back() {
    this._platformLocation.back();
  }
  historyGo(relativePosition = 0) {
    this._platformLocation.historyGo?.(relativePosition);
  }
}
PathLocationStrategy.ɵfac = ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "13.4.0", ngImport: i0, type: PathLocationStrategy, deps: [{ token: PlatformLocation }, { token: APP_BASE_HREF, optional: true }], target: FactoryTarget.Injectable });
PathLocationStrategy.ɵprov = ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "13.4.0", ngImport: i0, type: PathLocationStrategy });
ɵɵngDeclareClassMetadata({ type: PathLocationStrategy, decorators: [{
  type: Injectable
}], ctorParameters: function() {
  return [{ type: PlatformLocation }, { type: void 0, decorators: [{
    type: Optional
  }, {
    type: Inject,
    args: [APP_BASE_HREF]
  }] }];
} });
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
class HashLocationStrategy extends LocationStrategy {
  constructor(_platformLocation, _baseHref) {
    super();
    this._platformLocation = _platformLocation;
    this._baseHref = "";
    this._removeListenerFns = [];
    if (_baseHref != null) {
      this._baseHref = _baseHref;
    }
  }
  /** @nodoc */
  ngOnDestroy() {
    while (this._removeListenerFns.length) {
      this._removeListenerFns.pop()();
    }
  }
  onPopState(fn) {
    this._removeListenerFns.push(this._platformLocation.onPopState(fn), this._platformLocation.onHashChange(fn));
  }
  getBaseHref() {
    return this._baseHref;
  }
  path(includeHash = false) {
    let path = this._platformLocation.hash;
    if (path == null)
      path = "#";
    return path.length > 0 ? path.substring(1) : path;
  }
  prepareExternalUrl(internal) {
    const url = joinWithSlash(this._baseHref, internal);
    return url.length > 0 ? "#" + url : url;
  }
  pushState(state, title, path, queryParams) {
    let url = this.prepareExternalUrl(path + normalizeQueryParams(queryParams));
    if (url.length == 0) {
      url = this._platformLocation.pathname;
    }
    this._platformLocation.pushState(state, title, url);
  }
  replaceState(state, title, path, queryParams) {
    let url = this.prepareExternalUrl(path + normalizeQueryParams(queryParams));
    if (url.length == 0) {
      url = this._platformLocation.pathname;
    }
    this._platformLocation.replaceState(state, title, url);
  }
  forward() {
    this._platformLocation.forward();
  }
  back() {
    this._platformLocation.back();
  }
  historyGo(relativePosition = 0) {
    this._platformLocation.historyGo?.(relativePosition);
  }
}
HashLocationStrategy.ɵfac = ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "13.4.0", ngImport: i0, type: HashLocationStrategy, deps: [{ token: PlatformLocation }, { token: APP_BASE_HREF, optional: true }], target: FactoryTarget.Injectable });
HashLocationStrategy.ɵprov = ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "13.4.0", ngImport: i0, type: HashLocationStrategy });
ɵɵngDeclareClassMetadata({ type: HashLocationStrategy, decorators: [{
  type: Injectable
}], ctorParameters: function() {
  return [{ type: PlatformLocation }, { type: void 0, decorators: [{
    type: Optional
  }, {
    type: Inject,
    args: [APP_BASE_HREF]
  }] }];
} });
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
class Location {
  constructor(platformStrategy, platformLocation) {
    this._subject = new EventEmitter();
    this._urlChangeListeners = [];
    this._platformStrategy = platformStrategy;
    const browserBaseHref = this._platformStrategy.getBaseHref();
    this._platformLocation = platformLocation;
    this._baseHref = stripTrailingSlash(_stripIndexHtml(browserBaseHref));
    this._platformStrategy.onPopState((ev) => {
      this._subject.emit({
        "url": this.path(true),
        "pop": true,
        "state": ev.state,
        "type": ev.type
      });
    });
  }
  /**
   * Normalizes the URL path for this location.
   *
   * @param includeHash True to include an anchor fragment in the path.
   *
   * @returns The normalized URL path.
   */
  // TODO: vsavkin. Remove the boolean flag and always include hash once the deprecated router is
  // removed.
  path(includeHash = false) {
    return this.normalize(this._platformStrategy.path(includeHash));
  }
  /**
   * Reports the current state of the location history.
   * @returns The current value of the `history.state` object.
   */
  getState() {
    return this._platformLocation.getState();
  }
  /**
   * Normalizes the given path and compares to the current normalized path.
   *
   * @param path The given URL path.
   * @param query Query parameters.
   *
   * @returns True if the given URL path is equal to the current normalized path, false
   * otherwise.
   */
  isCurrentPathEqualTo(path, query = "") {
    return this.path() == this.normalize(path + normalizeQueryParams(query));
  }
  /**
   * Normalizes a URL path by stripping any trailing slashes.
   *
   * @param url String representing a URL.
   *
   * @returns The normalized URL string.
   */
  normalize(url) {
    return Location.stripTrailingSlash(_stripBaseHref(this._baseHref, _stripIndexHtml(url)));
  }
  /**
   * Normalizes an external URL path.
   * If the given URL doesn't begin with a leading slash (`'/'`), adds one
   * before normalizing. Adds a hash if `HashLocationStrategy` is
   * in use, or the `APP_BASE_HREF` if the `PathLocationStrategy` is in use.
   *
   * @param url String representing a URL.
   *
   * @returns  A normalized platform-specific URL.
   */
  prepareExternalUrl(url) {
    if (url && url[0] !== "/") {
      url = "/" + url;
    }
    return this._platformStrategy.prepareExternalUrl(url);
  }
  // TODO: rename this method to pushState
  /**
   * Changes the browser's URL to a normalized version of a given URL, and pushes a
   * new item onto the platform's history.
   *
   * @param path  URL path to normalize.
   * @param query Query parameters.
   * @param state Location history state.
   *
   */
  go(path, query = "", state = null) {
    this._platformStrategy.pushState(state, "", path, query);
    this._notifyUrlChangeListeners(this.prepareExternalUrl(path + normalizeQueryParams(query)), state);
  }
  /**
   * Changes the browser's URL to a normalized version of the given URL, and replaces
   * the top item on the platform's history stack.
   *
   * @param path  URL path to normalize.
   * @param query Query parameters.
   * @param state Location history state.
   */
  replaceState(path, query = "", state = null) {
    this._platformStrategy.replaceState(state, "", path, query);
    this._notifyUrlChangeListeners(this.prepareExternalUrl(path + normalizeQueryParams(query)), state);
  }
  /**
   * Navigates forward in the platform's history.
   */
  forward() {
    this._platformStrategy.forward();
  }
  /**
   * Navigates back in the platform's history.
   */
  back() {
    this._platformStrategy.back();
  }
  /**
   * Navigate to a specific page from session history, identified by its relative position to the
   * current page.
   *
   * @param relativePosition  Position of the target page in the history relative to the current
   *     page.
   * A negative value moves backwards, a positive value moves forwards, e.g. `location.historyGo(2)`
   * moves forward two pages and `location.historyGo(-2)` moves back two pages. When we try to go
   * beyond what's stored in the history session, we stay in the current page. Same behaviour occurs
   * when `relativePosition` equals 0.
   * @see https://developer.mozilla.org/en-US/docs/Web/API/History_API#Moving_to_a_specific_point_in_history
   */
  historyGo(relativePosition = 0) {
    this._platformStrategy.historyGo?.(relativePosition);
  }
  /**
   * Registers a URL change listener. Use to catch updates performed by the Angular
   * framework that are not detectible through "popstate" or "hashchange" events.
   *
   * @param fn The change handler function, which take a URL and a location history state.
   */
  onUrlChange(fn) {
    this._urlChangeListeners.push(fn);
    if (!this._urlChangeSubscription) {
      this._urlChangeSubscription = this.subscribe((v) => {
        this._notifyUrlChangeListeners(v.url, v.state);
      });
    }
  }
  /** @internal */
  _notifyUrlChangeListeners(url = "", state) {
    this._urlChangeListeners.forEach((fn) => fn(url, state));
  }
  /**
   * Subscribes to the platform's `popState` events.
   *
   * Note: `Location.go()` does not trigger the `popState` event in the browser. Use
   * `Location.onUrlChange()` to subscribe to URL changes instead.
   *
   * @param value Event that is triggered when the state history changes.
   * @param exception The exception to throw.
   *
   * @see [onpopstate](https://developer.mozilla.org/en-US/docs/Web/API/WindowEventHandlers/onpopstate)
   *
   * @returns Subscribed events.
   */
  subscribe(onNext, onThrow, onReturn) {
    return this._subject.subscribe({ next: onNext, error: onThrow, complete: onReturn });
  }
}
Location.normalizeQueryParams = normalizeQueryParams;
Location.joinWithSlash = joinWithSlash;
Location.stripTrailingSlash = stripTrailingSlash;
Location.ɵfac = ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "13.4.0", ngImport: i0, type: Location, deps: [{ token: LocationStrategy }, { token: PlatformLocation }], target: FactoryTarget.Injectable });
Location.ɵprov = ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "13.4.0", ngImport: i0, type: Location, providedIn: "root", useFactory: createLocation });
ɵɵngDeclareClassMetadata({ type: Location, decorators: [{
  type: Injectable,
  args: [{
    providedIn: "root",
    // See #23917
    useFactory: createLocation
  }]
}], ctorParameters: function() {
  return [{ type: LocationStrategy }, { type: PlatformLocation }];
} });
function createLocation() {
  return new Location(ɵɵinject(LocationStrategy), ɵɵinject(PlatformLocation));
}
function _stripBaseHref(baseHref, url) {
  return baseHref && url.startsWith(baseHref) ? url.substring(baseHref.length) : url;
}
function _stripIndexHtml(url) {
  return url.replace(/\/index.html$/, "");
}
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
const CURRENCIES_EN = { "ADP": [void 0, void 0, 0], "AFN": [void 0, "؋", 0], "ALL": [void 0, void 0, 0], "AMD": [void 0, "֏", 2], "AOA": [void 0, "Kz"], "ARS": [void 0, "$"], "AUD": ["A$", "$"], "AZN": [void 0, "₼"], "BAM": [void 0, "KM"], "BBD": [void 0, "$"], "BDT": [void 0, "৳"], "BHD": [void 0, void 0, 3], "BIF": [void 0, void 0, 0], "BMD": [void 0, "$"], "BND": [void 0, "$"], "BOB": [void 0, "Bs"], "BRL": ["R$"], "BSD": [void 0, "$"], "BWP": [void 0, "P"], "BYN": [void 0, "р.", 2], "BYR": [void 0, void 0, 0], "BZD": [void 0, "$"], "CAD": ["CA$", "$", 2], "CHF": [void 0, void 0, 2], "CLF": [void 0, void 0, 4], "CLP": [void 0, "$", 0], "CNY": ["CN¥", "¥"], "COP": [void 0, "$", 2], "CRC": [void 0, "₡", 2], "CUC": [void 0, "$"], "CUP": [void 0, "$"], "CZK": [void 0, "Kč", 2], "DJF": [void 0, void 0, 0], "DKK": [void 0, "kr", 2], "DOP": [void 0, "$"], "EGP": [void 0, "E£"], "ESP": [void 0, "₧", 0], "EUR": ["€"], "FJD": [void 0, "$"], "FKP": [void 0, "£"], "GBP": ["£"], "GEL": [void 0, "₾"], "GHS": [void 0, "GH₵"], "GIP": [void 0, "£"], "GNF": [void 0, "FG", 0], "GTQ": [void 0, "Q"], "GYD": [void 0, "$", 2], "HKD": ["HK$", "$"], "HNL": [void 0, "L"], "HRK": [void 0, "kn"], "HUF": [void 0, "Ft", 2], "IDR": [void 0, "Rp", 2], "ILS": ["₪"], "INR": ["₹"], "IQD": [void 0, void 0, 0], "IRR": [void 0, void 0, 0], "ISK": [void 0, "kr", 0], "ITL": [void 0, void 0, 0], "JMD": [void 0, "$"], "JOD": [void 0, void 0, 3], "JPY": ["¥", void 0, 0], "KHR": [void 0, "៛"], "KMF": [void 0, "CF", 0], "KPW": [void 0, "₩", 0], "KRW": ["₩", void 0, 0], "KWD": [void 0, void 0, 3], "KYD": [void 0, "$"], "KZT": [void 0, "₸"], "LAK": [void 0, "₭", 0], "LBP": [void 0, "L£", 0], "LKR": [void 0, "Rs"], "LRD": [void 0, "$"], "LTL": [void 0, "Lt"], "LUF": [void 0, void 0, 0], "LVL": [void 0, "Ls"], "LYD": [void 0, void 0, 3], "MGA": [void 0, "Ar", 0], "MGF": [void 0, void 0, 0], "MMK": [void 0, "K", 0], "MNT": [void 0, "₮", 2], "MRO": [void 0, void 0, 0], "MUR": [void 0, "Rs", 2], "MXN": ["MX$", "$"], "MYR": [void 0, "RM"], "NAD": [void 0, "$"], "NGN": [void 0, "₦"], "NIO": [void 0, "C$"], "NOK": [void 0, "kr", 2], "NPR": [void 0, "Rs"], "NZD": ["NZ$", "$"], "OMR": [void 0, void 0, 3], "PHP": ["₱"], "PKR": [void 0, "Rs", 2], "PLN": [void 0, "zł"], "PYG": [void 0, "₲", 0], "RON": [void 0, "lei"], "RSD": [void 0, void 0, 0], "RUB": [void 0, "₽"], "RUR": [void 0, "р."], "RWF": [void 0, "RF", 0], "SBD": [void 0, "$"], "SEK": [void 0, "kr", 2], "SGD": [void 0, "$"], "SHP": [void 0, "£"], "SLL": [void 0, void 0, 0], "SOS": [void 0, void 0, 0], "SRD": [void 0, "$"], "SSP": [void 0, "£"], "STD": [void 0, void 0, 0], "STN": [void 0, "Db"], "SYP": [void 0, "£", 0], "THB": [void 0, "฿"], "TMM": [void 0, void 0, 0], "TND": [void 0, void 0, 3], "TOP": [void 0, "T$"], "TRL": [void 0, void 0, 0], "TRY": [void 0, "₺"], "TTD": [void 0, "$"], "TWD": ["NT$", "$", 2], "TZS": [void 0, void 0, 2], "UAH": [void 0, "₴"], "UGX": [void 0, void 0, 0], "USD": ["$"], "UYI": [void 0, void 0, 0], "UYU": [void 0, "$"], "UYW": [void 0, void 0, 4], "UZS": [void 0, void 0, 2], "VEF": [void 0, "Bs", 2], "VND": ["₫", void 0, 0], "VUV": [void 0, void 0, 0], "XAF": ["FCFA", void 0, 0], "XCD": ["EC$", "$"], "XOF": ["F CFA", void 0, 0], "XPF": ["CFPF", void 0, 0], "XXX": ["¤"], "YER": [void 0, void 0, 0], "ZAR": [void 0, "R"], "ZMK": [void 0, void 0, 0], "ZMW": [void 0, "ZK"], "ZWD": [void 0, void 0, 0] };
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
var NumberFormatStyle;
(function(NumberFormatStyle2) {
  NumberFormatStyle2[NumberFormatStyle2["Decimal"] = 0] = "Decimal";
  NumberFormatStyle2[NumberFormatStyle2["Percent"] = 1] = "Percent";
  NumberFormatStyle2[NumberFormatStyle2["Currency"] = 2] = "Currency";
  NumberFormatStyle2[NumberFormatStyle2["Scientific"] = 3] = "Scientific";
})(NumberFormatStyle || (NumberFormatStyle = {}));
var Plural;
(function(Plural2) {
  Plural2[Plural2["Zero"] = 0] = "Zero";
  Plural2[Plural2["One"] = 1] = "One";
  Plural2[Plural2["Two"] = 2] = "Two";
  Plural2[Plural2["Few"] = 3] = "Few";
  Plural2[Plural2["Many"] = 4] = "Many";
  Plural2[Plural2["Other"] = 5] = "Other";
})(Plural || (Plural = {}));
var FormStyle;
(function(FormStyle2) {
  FormStyle2[FormStyle2["Format"] = 0] = "Format";
  FormStyle2[FormStyle2["Standalone"] = 1] = "Standalone";
})(FormStyle || (FormStyle = {}));
var TranslationWidth;
(function(TranslationWidth2) {
  TranslationWidth2[TranslationWidth2["Narrow"] = 0] = "Narrow";
  TranslationWidth2[TranslationWidth2["Abbreviated"] = 1] = "Abbreviated";
  TranslationWidth2[TranslationWidth2["Wide"] = 2] = "Wide";
  TranslationWidth2[TranslationWidth2["Short"] = 3] = "Short";
})(TranslationWidth || (TranslationWidth = {}));
var FormatWidth;
(function(FormatWidth2) {
  FormatWidth2[FormatWidth2["Short"] = 0] = "Short";
  FormatWidth2[FormatWidth2["Medium"] = 1] = "Medium";
  FormatWidth2[FormatWidth2["Long"] = 2] = "Long";
  FormatWidth2[FormatWidth2["Full"] = 3] = "Full";
})(FormatWidth || (FormatWidth = {}));
var NumberSymbol;
(function(NumberSymbol2) {
  NumberSymbol2[NumberSymbol2["Decimal"] = 0] = "Decimal";
  NumberSymbol2[NumberSymbol2["Group"] = 1] = "Group";
  NumberSymbol2[NumberSymbol2["List"] = 2] = "List";
  NumberSymbol2[NumberSymbol2["PercentSign"] = 3] = "PercentSign";
  NumberSymbol2[NumberSymbol2["PlusSign"] = 4] = "PlusSign";
  NumberSymbol2[NumberSymbol2["MinusSign"] = 5] = "MinusSign";
  NumberSymbol2[NumberSymbol2["Exponential"] = 6] = "Exponential";
  NumberSymbol2[NumberSymbol2["SuperscriptingExponent"] = 7] = "SuperscriptingExponent";
  NumberSymbol2[NumberSymbol2["PerMille"] = 8] = "PerMille";
  NumberSymbol2[NumberSymbol2["Infinity"] = 9] = "Infinity";
  NumberSymbol2[NumberSymbol2["NaN"] = 10] = "NaN";
  NumberSymbol2[NumberSymbol2["TimeSeparator"] = 11] = "TimeSeparator";
  NumberSymbol2[NumberSymbol2["CurrencyDecimal"] = 12] = "CurrencyDecimal";
  NumberSymbol2[NumberSymbol2["CurrencyGroup"] = 13] = "CurrencyGroup";
})(NumberSymbol || (NumberSymbol = {}));
var WeekDay;
(function(WeekDay2) {
  WeekDay2[WeekDay2["Sunday"] = 0] = "Sunday";
  WeekDay2[WeekDay2["Monday"] = 1] = "Monday";
  WeekDay2[WeekDay2["Tuesday"] = 2] = "Tuesday";
  WeekDay2[WeekDay2["Wednesday"] = 3] = "Wednesday";
  WeekDay2[WeekDay2["Thursday"] = 4] = "Thursday";
  WeekDay2[WeekDay2["Friday"] = 5] = "Friday";
  WeekDay2[WeekDay2["Saturday"] = 6] = "Saturday";
})(WeekDay || (WeekDay = {}));
function getLocaleId(locale) {
  return findLocaleData(locale)[LocaleDataIndex.LocaleId];
}
function getLocaleDayPeriods(locale, formStyle, width) {
  const data = findLocaleData(locale);
  const amPmData = [
    data[LocaleDataIndex.DayPeriodsFormat],
    data[LocaleDataIndex.DayPeriodsStandalone]
  ];
  const amPm = getLastDefinedValue(amPmData, formStyle);
  return getLastDefinedValue(amPm, width);
}
function getLocaleDayNames(locale, formStyle, width) {
  const data = findLocaleData(locale);
  const daysData = [data[LocaleDataIndex.DaysFormat], data[LocaleDataIndex.DaysStandalone]];
  const days = getLastDefinedValue(daysData, formStyle);
  return getLastDefinedValue(days, width);
}
function getLocaleMonthNames(locale, formStyle, width) {
  const data = findLocaleData(locale);
  const monthsData = [data[LocaleDataIndex.MonthsFormat], data[LocaleDataIndex.MonthsStandalone]];
  const months = getLastDefinedValue(monthsData, formStyle);
  return getLastDefinedValue(months, width);
}
function getLocaleEraNames(locale, width) {
  const data = findLocaleData(locale);
  const erasData = data[LocaleDataIndex.Eras];
  return getLastDefinedValue(erasData, width);
}
function getLocaleDateFormat(locale, width) {
  const data = findLocaleData(locale);
  return getLastDefinedValue(data[LocaleDataIndex.DateFormat], width);
}
function getLocaleTimeFormat(locale, width) {
  const data = findLocaleData(locale);
  return getLastDefinedValue(data[LocaleDataIndex.TimeFormat], width);
}
function getLocaleDateTimeFormat(locale, width) {
  const data = findLocaleData(locale);
  const dateTimeFormatData = data[LocaleDataIndex.DateTimeFormat];
  return getLastDefinedValue(dateTimeFormatData, width);
}
function getLocaleNumberSymbol(locale, symbol) {
  const data = findLocaleData(locale);
  const res = data[LocaleDataIndex.NumberSymbols][symbol];
  if (typeof res === "undefined") {
    if (symbol === NumberSymbol.CurrencyDecimal) {
      return data[LocaleDataIndex.NumberSymbols][NumberSymbol.Decimal];
    } else if (symbol === NumberSymbol.CurrencyGroup) {
      return data[LocaleDataIndex.NumberSymbols][NumberSymbol.Group];
    }
  }
  return res;
}
function getLocaleNumberFormat(locale, type) {
  const data = findLocaleData(locale);
  return data[LocaleDataIndex.NumberFormats][type];
}
function getLocaleCurrencies(locale) {
  const data = findLocaleData(locale);
  return data[LocaleDataIndex.Currencies];
}
const getLocalePluralCase = getLocalePluralCase$1;
function checkFullData(data) {
  if (!data[LocaleDataIndex.ExtraData]) {
    throw new Error(`Missing extra locale data for the locale "${data[LocaleDataIndex.LocaleId]}". Use "registerLocaleData" to load new data. See the "I18n guide" on angular.io to know more.`);
  }
}
function getLocaleExtraDayPeriodRules(locale) {
  const data = findLocaleData(locale);
  checkFullData(data);
  const rules = data[LocaleDataIndex.ExtraData][
    2
    /* ExtraDayPeriodsRules */
  ] || [];
  return rules.map((rule) => {
    if (typeof rule === "string") {
      return extractTime(rule);
    }
    return [extractTime(rule[0]), extractTime(rule[1])];
  });
}
function getLocaleExtraDayPeriods(locale, formStyle, width) {
  const data = findLocaleData(locale);
  checkFullData(data);
  const dayPeriodsData = [
    data[LocaleDataIndex.ExtraData][
      0
      /* ExtraDayPeriodFormats */
    ],
    data[LocaleDataIndex.ExtraData][
      1
      /* ExtraDayPeriodStandalone */
    ]
  ];
  const dayPeriods = getLastDefinedValue(dayPeriodsData, formStyle) || [];
  return getLastDefinedValue(dayPeriods, width) || [];
}
function getLastDefinedValue(data, index) {
  for (let i = index; i > -1; i--) {
    if (typeof data[i] !== "undefined") {
      return data[i];
    }
  }
  throw new Error("Locale data API: locale data undefined");
}
function extractTime(time) {
  const [h, m] = time.split(":");
  return { hours: +h, minutes: +m };
}
function getCurrencySymbol(code, format, locale = "en") {
  const currency = getLocaleCurrencies(locale)[code] || CURRENCIES_EN[code] || [];
  const symbolNarrow = currency[
    1
    /* SymbolNarrow */
  ];
  if (format === "narrow" && typeof symbolNarrow === "string") {
    return symbolNarrow;
  }
  return currency[
    0
    /* Symbol */
  ] || code;
}
const DEFAULT_NB_OF_CURRENCY_DIGITS = 2;
function getNumberOfCurrencyDigits(code) {
  let digits;
  const currency = CURRENCIES_EN[code];
  if (currency) {
    digits = currency[
      2
      /* NbOfDigits */
    ];
  }
  return typeof digits === "number" ? digits : DEFAULT_NB_OF_CURRENCY_DIGITS;
}
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
const ISO8601_DATE_REGEX = /^(\d{4})-?(\d\d)-?(\d\d)(?:T(\d\d)(?::?(\d\d)(?::?(\d\d)(?:\.(\d+))?)?)?(Z|([+-])(\d\d):?(\d\d))?)?$/;
const NAMED_FORMATS = {};
const DATE_FORMATS_SPLIT = /((?:[^BEGHLMOSWYZabcdhmswyz']+)|(?:'(?:[^']|'')*')|(?:G{1,5}|y{1,4}|Y{1,4}|M{1,5}|L{1,5}|w{1,2}|W{1}|d{1,2}|E{1,6}|c{1,6}|a{1,5}|b{1,5}|B{1,5}|h{1,2}|H{1,2}|m{1,2}|s{1,2}|S{1,3}|z{1,4}|Z{1,5}|O{1,4}))([\s\S]*)/;
var ZoneWidth;
(function(ZoneWidth2) {
  ZoneWidth2[ZoneWidth2["Short"] = 0] = "Short";
  ZoneWidth2[ZoneWidth2["ShortGMT"] = 1] = "ShortGMT";
  ZoneWidth2[ZoneWidth2["Long"] = 2] = "Long";
  ZoneWidth2[ZoneWidth2["Extended"] = 3] = "Extended";
})(ZoneWidth || (ZoneWidth = {}));
var DateType;
(function(DateType2) {
  DateType2[DateType2["FullYear"] = 0] = "FullYear";
  DateType2[DateType2["Month"] = 1] = "Month";
  DateType2[DateType2["Date"] = 2] = "Date";
  DateType2[DateType2["Hours"] = 3] = "Hours";
  DateType2[DateType2["Minutes"] = 4] = "Minutes";
  DateType2[DateType2["Seconds"] = 5] = "Seconds";
  DateType2[DateType2["FractionalSeconds"] = 6] = "FractionalSeconds";
  DateType2[DateType2["Day"] = 7] = "Day";
})(DateType || (DateType = {}));
var TranslationType;
(function(TranslationType2) {
  TranslationType2[TranslationType2["DayPeriods"] = 0] = "DayPeriods";
  TranslationType2[TranslationType2["Days"] = 1] = "Days";
  TranslationType2[TranslationType2["Months"] = 2] = "Months";
  TranslationType2[TranslationType2["Eras"] = 3] = "Eras";
})(TranslationType || (TranslationType = {}));
function formatDate(value, format, locale, timezone) {
  let date = toDate(value);
  const namedFormat = getNamedFormat(locale, format);
  format = namedFormat || format;
  let parts = [];
  let match;
  while (format) {
    match = DATE_FORMATS_SPLIT.exec(format);
    if (match) {
      parts = parts.concat(match.slice(1));
      const part = parts.pop();
      if (!part) {
        break;
      }
      format = part;
    } else {
      parts.push(format);
      break;
    }
  }
  let dateTimezoneOffset = date.getTimezoneOffset();
  if (timezone) {
    dateTimezoneOffset = timezoneToOffset(timezone, dateTimezoneOffset);
    date = convertTimezoneToLocal(date, timezone);
  }
  let text = "";
  parts.forEach((value2) => {
    const dateFormatter = getDateFormatter(value2);
    text += dateFormatter ? dateFormatter(date, locale, dateTimezoneOffset) : value2 === "''" ? "'" : value2.replace(/(^'|'$)/g, "").replace(/''/g, "'");
  });
  return text;
}
function createDate(year, month, date) {
  const newDate = /* @__PURE__ */ new Date(0);
  newDate.setFullYear(year, month, date);
  newDate.setHours(0, 0, 0);
  return newDate;
}
function getNamedFormat(locale, format) {
  const localeId = getLocaleId(locale);
  NAMED_FORMATS[localeId] = NAMED_FORMATS[localeId] || {};
  if (NAMED_FORMATS[localeId][format]) {
    return NAMED_FORMATS[localeId][format];
  }
  let formatValue = "";
  switch (format) {
    case "shortDate":
      formatValue = getLocaleDateFormat(locale, FormatWidth.Short);
      break;
    case "mediumDate":
      formatValue = getLocaleDateFormat(locale, FormatWidth.Medium);
      break;
    case "longDate":
      formatValue = getLocaleDateFormat(locale, FormatWidth.Long);
      break;
    case "fullDate":
      formatValue = getLocaleDateFormat(locale, FormatWidth.Full);
      break;
    case "shortTime":
      formatValue = getLocaleTimeFormat(locale, FormatWidth.Short);
      break;
    case "mediumTime":
      formatValue = getLocaleTimeFormat(locale, FormatWidth.Medium);
      break;
    case "longTime":
      formatValue = getLocaleTimeFormat(locale, FormatWidth.Long);
      break;
    case "fullTime":
      formatValue = getLocaleTimeFormat(locale, FormatWidth.Full);
      break;
    case "short":
      const shortTime = getNamedFormat(locale, "shortTime");
      const shortDate = getNamedFormat(locale, "shortDate");
      formatValue = formatDateTime(getLocaleDateTimeFormat(locale, FormatWidth.Short), [shortTime, shortDate]);
      break;
    case "medium":
      const mediumTime = getNamedFormat(locale, "mediumTime");
      const mediumDate = getNamedFormat(locale, "mediumDate");
      formatValue = formatDateTime(getLocaleDateTimeFormat(locale, FormatWidth.Medium), [mediumTime, mediumDate]);
      break;
    case "long":
      const longTime = getNamedFormat(locale, "longTime");
      const longDate = getNamedFormat(locale, "longDate");
      formatValue = formatDateTime(getLocaleDateTimeFormat(locale, FormatWidth.Long), [longTime, longDate]);
      break;
    case "full":
      const fullTime = getNamedFormat(locale, "fullTime");
      const fullDate = getNamedFormat(locale, "fullDate");
      formatValue = formatDateTime(getLocaleDateTimeFormat(locale, FormatWidth.Full), [fullTime, fullDate]);
      break;
  }
  if (formatValue) {
    NAMED_FORMATS[localeId][format] = formatValue;
  }
  return formatValue;
}
function formatDateTime(str, opt_values) {
  if (opt_values) {
    str = str.replace(/\{([^}]+)}/g, function(match, key) {
      return opt_values != null && key in opt_values ? opt_values[key] : match;
    });
  }
  return str;
}
function padNumber(num, digits, minusSign = "-", trim, negWrap) {
  let neg = "";
  if (num < 0 || negWrap && num <= 0) {
    if (negWrap) {
      num = -num + 1;
    } else {
      num = -num;
      neg = minusSign;
    }
  }
  let strNum = String(num);
  while (strNum.length < digits) {
    strNum = "0" + strNum;
  }
  if (trim) {
    strNum = strNum.substr(strNum.length - digits);
  }
  return neg + strNum;
}
function formatFractionalSeconds(milliseconds, digits) {
  const strMs = padNumber(milliseconds, 3);
  return strMs.substr(0, digits);
}
function dateGetter(name, size, offset = 0, trim = false, negWrap = false) {
  return function(date, locale) {
    let part = getDatePart(name, date);
    if (offset > 0 || part > -offset) {
      part += offset;
    }
    if (name === DateType.Hours) {
      if (part === 0 && offset === -12) {
        part = 12;
      }
    } else if (name === DateType.FractionalSeconds) {
      return formatFractionalSeconds(part, size);
    }
    const localeMinus = getLocaleNumberSymbol(locale, NumberSymbol.MinusSign);
    return padNumber(part, size, localeMinus, trim, negWrap);
  };
}
function getDatePart(part, date) {
  switch (part) {
    case DateType.FullYear:
      return date.getFullYear();
    case DateType.Month:
      return date.getMonth();
    case DateType.Date:
      return date.getDate();
    case DateType.Hours:
      return date.getHours();
    case DateType.Minutes:
      return date.getMinutes();
    case DateType.Seconds:
      return date.getSeconds();
    case DateType.FractionalSeconds:
      return date.getMilliseconds();
    case DateType.Day:
      return date.getDay();
    default:
      throw new Error(`Unknown DateType value "${part}".`);
  }
}
function dateStrGetter(name, width, form = FormStyle.Format, extended = false) {
  return function(date, locale) {
    return getDateTranslation(date, locale, name, width, form, extended);
  };
}
function getDateTranslation(date, locale, name, width, form, extended) {
  switch (name) {
    case TranslationType.Months:
      return getLocaleMonthNames(locale, form, width)[date.getMonth()];
    case TranslationType.Days:
      return getLocaleDayNames(locale, form, width)[date.getDay()];
    case TranslationType.DayPeriods:
      const currentHours = date.getHours();
      const currentMinutes = date.getMinutes();
      if (extended) {
        const rules = getLocaleExtraDayPeriodRules(locale);
        const dayPeriods = getLocaleExtraDayPeriods(locale, form, width);
        const index = rules.findIndex((rule) => {
          if (Array.isArray(rule)) {
            const [from2, to] = rule;
            const afterFrom = currentHours >= from2.hours && currentMinutes >= from2.minutes;
            const beforeTo = currentHours < to.hours || currentHours === to.hours && currentMinutes < to.minutes;
            if (from2.hours < to.hours) {
              if (afterFrom && beforeTo) {
                return true;
              }
            } else if (afterFrom || beforeTo) {
              return true;
            }
          } else {
            if (rule.hours === currentHours && rule.minutes === currentMinutes) {
              return true;
            }
          }
          return false;
        });
        if (index !== -1) {
          return dayPeriods[index];
        }
      }
      return getLocaleDayPeriods(locale, form, width)[currentHours < 12 ? 0 : 1];
    case TranslationType.Eras:
      return getLocaleEraNames(locale, width)[date.getFullYear() <= 0 ? 0 : 1];
    default:
      const unexpected = name;
      throw new Error(`unexpected translation type ${unexpected}`);
  }
}
function timeZoneGetter(width) {
  return function(date, locale, offset) {
    const zone = -1 * offset;
    const minusSign = getLocaleNumberSymbol(locale, NumberSymbol.MinusSign);
    const hours = zone > 0 ? Math.floor(zone / 60) : Math.ceil(zone / 60);
    switch (width) {
      case ZoneWidth.Short:
        return (zone >= 0 ? "+" : "") + padNumber(hours, 2, minusSign) + padNumber(Math.abs(zone % 60), 2, minusSign);
      case ZoneWidth.ShortGMT:
        return "GMT" + (zone >= 0 ? "+" : "") + padNumber(hours, 1, minusSign);
      case ZoneWidth.Long:
        return "GMT" + (zone >= 0 ? "+" : "") + padNumber(hours, 2, minusSign) + ":" + padNumber(Math.abs(zone % 60), 2, minusSign);
      case ZoneWidth.Extended:
        if (offset === 0) {
          return "Z";
        } else {
          return (zone >= 0 ? "+" : "") + padNumber(hours, 2, minusSign) + ":" + padNumber(Math.abs(zone % 60), 2, minusSign);
        }
      default:
        throw new Error(`Unknown zone width "${width}"`);
    }
  };
}
const JANUARY = 0;
const THURSDAY = 4;
function getFirstThursdayOfYear(year) {
  const firstDayOfYear = createDate(year, JANUARY, 1).getDay();
  return createDate(year, 0, 1 + (firstDayOfYear <= THURSDAY ? THURSDAY : THURSDAY + 7) - firstDayOfYear);
}
function getThursdayThisWeek(datetime) {
  return createDate(datetime.getFullYear(), datetime.getMonth(), datetime.getDate() + (THURSDAY - datetime.getDay()));
}
function weekGetter(size, monthBased = false) {
  return function(date, locale) {
    let result;
    if (monthBased) {
      const nbDaysBefore1stDayOfMonth = new Date(date.getFullYear(), date.getMonth(), 1).getDay() - 1;
      const today = date.getDate();
      result = 1 + Math.floor((today + nbDaysBefore1stDayOfMonth) / 7);
    } else {
      const thisThurs = getThursdayThisWeek(date);
      const firstThurs = getFirstThursdayOfYear(thisThurs.getFullYear());
      const diff = thisThurs.getTime() - firstThurs.getTime();
      result = 1 + Math.round(diff / 6048e5);
    }
    return padNumber(result, size, getLocaleNumberSymbol(locale, NumberSymbol.MinusSign));
  };
}
function weekNumberingYearGetter(size, trim = false) {
  return function(date, locale) {
    const thisThurs = getThursdayThisWeek(date);
    const weekNumberingYear = thisThurs.getFullYear();
    return padNumber(weekNumberingYear, size, getLocaleNumberSymbol(locale, NumberSymbol.MinusSign), trim);
  };
}
const DATE_FORMATS = {};
function getDateFormatter(format) {
  if (DATE_FORMATS[format]) {
    return DATE_FORMATS[format];
  }
  let formatter;
  switch (format) {
    // Era name (AD/BC)
    case "G":
    case "GG":
    case "GGG":
      formatter = dateStrGetter(TranslationType.Eras, TranslationWidth.Abbreviated);
      break;
    case "GGGG":
      formatter = dateStrGetter(TranslationType.Eras, TranslationWidth.Wide);
      break;
    case "GGGGG":
      formatter = dateStrGetter(TranslationType.Eras, TranslationWidth.Narrow);
      break;
    // 1 digit representation of the year, e.g. (AD 1 => 1, AD 199 => 199)
    case "y":
      formatter = dateGetter(DateType.FullYear, 1, 0, false, true);
      break;
    // 2 digit representation of the year, padded (00-99). (e.g. AD 2001 => 01, AD 2010 => 10)
    case "yy":
      formatter = dateGetter(DateType.FullYear, 2, 0, true, true);
      break;
    // 3 digit representation of the year, padded (000-999). (e.g. AD 2001 => 01, AD 2010 => 10)
    case "yyy":
      formatter = dateGetter(DateType.FullYear, 3, 0, false, true);
      break;
    // 4 digit representation of the year (e.g. AD 1 => 0001, AD 2010 => 2010)
    case "yyyy":
      formatter = dateGetter(DateType.FullYear, 4, 0, false, true);
      break;
    // 1 digit representation of the week-numbering year, e.g. (AD 1 => 1, AD 199 => 199)
    case "Y":
      formatter = weekNumberingYearGetter(1);
      break;
    // 2 digit representation of the week-numbering year, padded (00-99). (e.g. AD 2001 => 01, AD
    // 2010 => 10)
    case "YY":
      formatter = weekNumberingYearGetter(2, true);
      break;
    // 3 digit representation of the week-numbering year, padded (000-999). (e.g. AD 1 => 001, AD
    // 2010 => 2010)
    case "YYY":
      formatter = weekNumberingYearGetter(3);
      break;
    // 4 digit representation of the week-numbering year (e.g. AD 1 => 0001, AD 2010 => 2010)
    case "YYYY":
      formatter = weekNumberingYearGetter(4);
      break;
    // Month of the year (1-12), numeric
    case "M":
    case "L":
      formatter = dateGetter(DateType.Month, 1, 1);
      break;
    case "MM":
    case "LL":
      formatter = dateGetter(DateType.Month, 2, 1);
      break;
    // Month of the year (January, ...), string, format
    case "MMM":
      formatter = dateStrGetter(TranslationType.Months, TranslationWidth.Abbreviated);
      break;
    case "MMMM":
      formatter = dateStrGetter(TranslationType.Months, TranslationWidth.Wide);
      break;
    case "MMMMM":
      formatter = dateStrGetter(TranslationType.Months, TranslationWidth.Narrow);
      break;
    // Month of the year (January, ...), string, standalone
    case "LLL":
      formatter = dateStrGetter(TranslationType.Months, TranslationWidth.Abbreviated, FormStyle.Standalone);
      break;
    case "LLLL":
      formatter = dateStrGetter(TranslationType.Months, TranslationWidth.Wide, FormStyle.Standalone);
      break;
    case "LLLLL":
      formatter = dateStrGetter(TranslationType.Months, TranslationWidth.Narrow, FormStyle.Standalone);
      break;
    // Week of the year (1, ... 52)
    case "w":
      formatter = weekGetter(1);
      break;
    case "ww":
      formatter = weekGetter(2);
      break;
    // Week of the month (1, ...)
    case "W":
      formatter = weekGetter(1, true);
      break;
    // Day of the month (1-31)
    case "d":
      formatter = dateGetter(DateType.Date, 1);
      break;
    case "dd":
      formatter = dateGetter(DateType.Date, 2);
      break;
    // Day of the Week StandAlone (1, 1, Mon, Monday, M, Mo)
    case "c":
    case "cc":
      formatter = dateGetter(DateType.Day, 1);
      break;
    case "ccc":
      formatter = dateStrGetter(TranslationType.Days, TranslationWidth.Abbreviated, FormStyle.Standalone);
      break;
    case "cccc":
      formatter = dateStrGetter(TranslationType.Days, TranslationWidth.Wide, FormStyle.Standalone);
      break;
    case "ccccc":
      formatter = dateStrGetter(TranslationType.Days, TranslationWidth.Narrow, FormStyle.Standalone);
      break;
    case "cccccc":
      formatter = dateStrGetter(TranslationType.Days, TranslationWidth.Short, FormStyle.Standalone);
      break;
    // Day of the Week
    case "E":
    case "EE":
    case "EEE":
      formatter = dateStrGetter(TranslationType.Days, TranslationWidth.Abbreviated);
      break;
    case "EEEE":
      formatter = dateStrGetter(TranslationType.Days, TranslationWidth.Wide);
      break;
    case "EEEEE":
      formatter = dateStrGetter(TranslationType.Days, TranslationWidth.Narrow);
      break;
    case "EEEEEE":
      formatter = dateStrGetter(TranslationType.Days, TranslationWidth.Short);
      break;
    // Generic period of the day (am-pm)
    case "a":
    case "aa":
    case "aaa":
      formatter = dateStrGetter(TranslationType.DayPeriods, TranslationWidth.Abbreviated);
      break;
    case "aaaa":
      formatter = dateStrGetter(TranslationType.DayPeriods, TranslationWidth.Wide);
      break;
    case "aaaaa":
      formatter = dateStrGetter(TranslationType.DayPeriods, TranslationWidth.Narrow);
      break;
    // Extended period of the day (midnight, at night, ...), standalone
    case "b":
    case "bb":
    case "bbb":
      formatter = dateStrGetter(TranslationType.DayPeriods, TranslationWidth.Abbreviated, FormStyle.Standalone, true);
      break;
    case "bbbb":
      formatter = dateStrGetter(TranslationType.DayPeriods, TranslationWidth.Wide, FormStyle.Standalone, true);
      break;
    case "bbbbb":
      formatter = dateStrGetter(TranslationType.DayPeriods, TranslationWidth.Narrow, FormStyle.Standalone, true);
      break;
    // Extended period of the day (midnight, night, ...), standalone
    case "B":
    case "BB":
    case "BBB":
      formatter = dateStrGetter(TranslationType.DayPeriods, TranslationWidth.Abbreviated, FormStyle.Format, true);
      break;
    case "BBBB":
      formatter = dateStrGetter(TranslationType.DayPeriods, TranslationWidth.Wide, FormStyle.Format, true);
      break;
    case "BBBBB":
      formatter = dateStrGetter(TranslationType.DayPeriods, TranslationWidth.Narrow, FormStyle.Format, true);
      break;
    // Hour in AM/PM, (1-12)
    case "h":
      formatter = dateGetter(DateType.Hours, 1, -12);
      break;
    case "hh":
      formatter = dateGetter(DateType.Hours, 2, -12);
      break;
    // Hour of the day (0-23)
    case "H":
      formatter = dateGetter(DateType.Hours, 1);
      break;
    // Hour in day, padded (00-23)
    case "HH":
      formatter = dateGetter(DateType.Hours, 2);
      break;
    // Minute of the hour (0-59)
    case "m":
      formatter = dateGetter(DateType.Minutes, 1);
      break;
    case "mm":
      formatter = dateGetter(DateType.Minutes, 2);
      break;
    // Second of the minute (0-59)
    case "s":
      formatter = dateGetter(DateType.Seconds, 1);
      break;
    case "ss":
      formatter = dateGetter(DateType.Seconds, 2);
      break;
    // Fractional second
    case "S":
      formatter = dateGetter(DateType.FractionalSeconds, 1);
      break;
    case "SS":
      formatter = dateGetter(DateType.FractionalSeconds, 2);
      break;
    case "SSS":
      formatter = dateGetter(DateType.FractionalSeconds, 3);
      break;
    // Timezone ISO8601 short format (-0430)
    case "Z":
    case "ZZ":
    case "ZZZ":
      formatter = timeZoneGetter(ZoneWidth.Short);
      break;
    // Timezone ISO8601 extended format (-04:30)
    case "ZZZZZ":
      formatter = timeZoneGetter(ZoneWidth.Extended);
      break;
    // Timezone GMT short format (GMT+4)
    case "O":
    case "OO":
    case "OOO":
    // Should be location, but fallback to format O instead because we don't have the data yet
    case "z":
    case "zz":
    case "zzz":
      formatter = timeZoneGetter(ZoneWidth.ShortGMT);
      break;
    // Timezone GMT long format (GMT+0430)
    case "OOOO":
    case "ZZZZ":
    // Should be location, but fallback to format O instead because we don't have the data yet
    case "zzzz":
      formatter = timeZoneGetter(ZoneWidth.Long);
      break;
    default:
      return null;
  }
  DATE_FORMATS[format] = formatter;
  return formatter;
}
function timezoneToOffset(timezone, fallback) {
  timezone = timezone.replace(/:/g, "");
  const requestedTimezoneOffset = Date.parse("Jan 01, 1970 00:00:00 " + timezone) / 6e4;
  return isNaN(requestedTimezoneOffset) ? fallback : requestedTimezoneOffset;
}
function addDateMinutes(date, minutes) {
  date = new Date(date.getTime());
  date.setMinutes(date.getMinutes() + minutes);
  return date;
}
function convertTimezoneToLocal(date, timezone, reverse) {
  const reverseValue = -1;
  const dateTimezoneOffset = date.getTimezoneOffset();
  const timezoneOffset = timezoneToOffset(timezone, dateTimezoneOffset);
  return addDateMinutes(date, reverseValue * (timezoneOffset - dateTimezoneOffset));
}
function toDate(value) {
  if (isDate(value)) {
    return value;
  }
  if (typeof value === "number" && !isNaN(value)) {
    return new Date(value);
  }
  if (typeof value === "string") {
    value = value.trim();
    if (/^(\d{4}(-\d{1,2}(-\d{1,2})?)?)$/.test(value)) {
      const [y, m = 1, d = 1] = value.split("-").map((val) => +val);
      return createDate(y, m - 1, d);
    }
    const parsedNb = parseFloat(value);
    if (!isNaN(value - parsedNb)) {
      return new Date(parsedNb);
    }
    let match;
    if (match = value.match(ISO8601_DATE_REGEX)) {
      return isoStringToDate(match);
    }
  }
  const date = new Date(value);
  if (!isDate(date)) {
    throw new Error(`Unable to convert "${value}" into a date`);
  }
  return date;
}
function isoStringToDate(match) {
  const date = /* @__PURE__ */ new Date(0);
  let tzHour = 0;
  let tzMin = 0;
  const dateSetter = match[8] ? date.setUTCFullYear : date.setFullYear;
  const timeSetter = match[8] ? date.setUTCHours : date.setHours;
  if (match[9]) {
    tzHour = Number(match[9] + match[10]);
    tzMin = Number(match[9] + match[11]);
  }
  dateSetter.call(date, Number(match[1]), Number(match[2]) - 1, Number(match[3]));
  const h = Number(match[4] || 0) - tzHour;
  const m = Number(match[5] || 0) - tzMin;
  const s = Number(match[6] || 0);
  const ms = Math.floor(parseFloat("0." + (match[7] || 0)) * 1e3);
  timeSetter.call(date, h, m, s, ms);
  return date;
}
function isDate(value) {
  return value instanceof Date && !isNaN(value.valueOf());
}
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
const NUMBER_FORMAT_REGEXP = /^(\d+)?\.((\d+)(-(\d+))?)?$/;
const MAX_DIGITS = 22;
const DECIMAL_SEP = ".";
const ZERO_CHAR = "0";
const PATTERN_SEP = ";";
const GROUP_SEP = ",";
const DIGIT_CHAR = "#";
const CURRENCY_CHAR = "¤";
const PERCENT_CHAR = "%";
function formatNumberToLocaleString(value, pattern, locale, groupSymbol, decimalSymbol, digitsInfo, isPercent = false) {
  let formattedText = "";
  let isZero = false;
  if (!isFinite(value)) {
    formattedText = getLocaleNumberSymbol(locale, NumberSymbol.Infinity);
  } else {
    let parsedNumber = parseNumber(value);
    if (isPercent) {
      parsedNumber = toPercent(parsedNumber);
    }
    let minInt = pattern.minInt;
    let minFraction = pattern.minFrac;
    let maxFraction = pattern.maxFrac;
    if (digitsInfo) {
      const parts = digitsInfo.match(NUMBER_FORMAT_REGEXP);
      if (parts === null) {
        throw new Error(`${digitsInfo} is not a valid digit info`);
      }
      const minIntPart = parts[1];
      const minFractionPart = parts[3];
      const maxFractionPart = parts[5];
      if (minIntPart != null) {
        minInt = parseIntAutoRadix(minIntPart);
      }
      if (minFractionPart != null) {
        minFraction = parseIntAutoRadix(minFractionPart);
      }
      if (maxFractionPart != null) {
        maxFraction = parseIntAutoRadix(maxFractionPart);
      } else if (minFractionPart != null && minFraction > maxFraction) {
        maxFraction = minFraction;
      }
    }
    roundNumber(parsedNumber, minFraction, maxFraction);
    let digits = parsedNumber.digits;
    let integerLen = parsedNumber.integerLen;
    const exponent = parsedNumber.exponent;
    let decimals = [];
    isZero = digits.every((d) => !d);
    for (; integerLen < minInt; integerLen++) {
      digits.unshift(0);
    }
    for (; integerLen < 0; integerLen++) {
      digits.unshift(0);
    }
    if (integerLen > 0) {
      decimals = digits.splice(integerLen, digits.length);
    } else {
      decimals = digits;
      digits = [0];
    }
    const groups = [];
    if (digits.length >= pattern.lgSize) {
      groups.unshift(digits.splice(-pattern.lgSize, digits.length).join(""));
    }
    while (digits.length > pattern.gSize) {
      groups.unshift(digits.splice(-pattern.gSize, digits.length).join(""));
    }
    if (digits.length) {
      groups.unshift(digits.join(""));
    }
    formattedText = groups.join(getLocaleNumberSymbol(locale, groupSymbol));
    if (decimals.length) {
      formattedText += getLocaleNumberSymbol(locale, decimalSymbol) + decimals.join("");
    }
    if (exponent) {
      formattedText += getLocaleNumberSymbol(locale, NumberSymbol.Exponential) + "+" + exponent;
    }
  }
  if (value < 0 && !isZero) {
    formattedText = pattern.negPre + formattedText + pattern.negSuf;
  } else {
    formattedText = pattern.posPre + formattedText + pattern.posSuf;
  }
  return formattedText;
}
function formatCurrency(value, locale, currency, currencyCode, digitsInfo) {
  const format = getLocaleNumberFormat(locale, NumberFormatStyle.Currency);
  const pattern = parseNumberFormat(format, getLocaleNumberSymbol(locale, NumberSymbol.MinusSign));
  pattern.minFrac = getNumberOfCurrencyDigits(currencyCode);
  pattern.maxFrac = pattern.minFrac;
  const res = formatNumberToLocaleString(value, pattern, locale, NumberSymbol.CurrencyGroup, NumberSymbol.CurrencyDecimal, digitsInfo);
  return res.replace(CURRENCY_CHAR, currency).replace(CURRENCY_CHAR, "").trim();
}
function formatPercent(value, locale, digitsInfo) {
  const format = getLocaleNumberFormat(locale, NumberFormatStyle.Percent);
  const pattern = parseNumberFormat(format, getLocaleNumberSymbol(locale, NumberSymbol.MinusSign));
  const res = formatNumberToLocaleString(value, pattern, locale, NumberSymbol.Group, NumberSymbol.Decimal, digitsInfo, true);
  return res.replace(new RegExp(PERCENT_CHAR, "g"), getLocaleNumberSymbol(locale, NumberSymbol.PercentSign));
}
function formatNumber(value, locale, digitsInfo) {
  const format = getLocaleNumberFormat(locale, NumberFormatStyle.Decimal);
  const pattern = parseNumberFormat(format, getLocaleNumberSymbol(locale, NumberSymbol.MinusSign));
  return formatNumberToLocaleString(value, pattern, locale, NumberSymbol.Group, NumberSymbol.Decimal, digitsInfo);
}
function parseNumberFormat(format, minusSign = "-") {
  const p = {
    minInt: 1,
    minFrac: 0,
    maxFrac: 0,
    posPre: "",
    posSuf: "",
    negPre: "",
    negSuf: "",
    gSize: 0,
    lgSize: 0
  };
  const patternParts = format.split(PATTERN_SEP);
  const positive = patternParts[0];
  const negative = patternParts[1];
  const positiveParts = positive.indexOf(DECIMAL_SEP) !== -1 ? positive.split(DECIMAL_SEP) : [
    positive.substring(0, positive.lastIndexOf(ZERO_CHAR) + 1),
    positive.substring(positive.lastIndexOf(ZERO_CHAR) + 1)
  ], integer = positiveParts[0], fraction = positiveParts[1] || "";
  p.posPre = integer.substr(0, integer.indexOf(DIGIT_CHAR));
  for (let i = 0; i < fraction.length; i++) {
    const ch = fraction.charAt(i);
    if (ch === ZERO_CHAR) {
      p.minFrac = p.maxFrac = i + 1;
    } else if (ch === DIGIT_CHAR) {
      p.maxFrac = i + 1;
    } else {
      p.posSuf += ch;
    }
  }
  const groups = integer.split(GROUP_SEP);
  p.gSize = groups[1] ? groups[1].length : 0;
  p.lgSize = groups[2] || groups[1] ? (groups[2] || groups[1]).length : 0;
  if (negative) {
    const trunkLen = positive.length - p.posPre.length - p.posSuf.length, pos = negative.indexOf(DIGIT_CHAR);
    p.negPre = negative.substr(0, pos).replace(/'/g, "");
    p.negSuf = negative.substr(pos + trunkLen).replace(/'/g, "");
  } else {
    p.negPre = minusSign + p.posPre;
    p.negSuf = p.posSuf;
  }
  return p;
}
function toPercent(parsedNumber) {
  if (parsedNumber.digits[0] === 0) {
    return parsedNumber;
  }
  const fractionLen = parsedNumber.digits.length - parsedNumber.integerLen;
  if (parsedNumber.exponent) {
    parsedNumber.exponent += 2;
  } else {
    if (fractionLen === 0) {
      parsedNumber.digits.push(0, 0);
    } else if (fractionLen === 1) {
      parsedNumber.digits.push(0);
    }
    parsedNumber.integerLen += 2;
  }
  return parsedNumber;
}
function parseNumber(num) {
  let numStr = Math.abs(num) + "";
  let exponent = 0, digits, integerLen;
  let i, j, zeros;
  if ((integerLen = numStr.indexOf(DECIMAL_SEP)) > -1) {
    numStr = numStr.replace(DECIMAL_SEP, "");
  }
  if ((i = numStr.search(/e/i)) > 0) {
    if (integerLen < 0)
      integerLen = i;
    integerLen += +numStr.slice(i + 1);
    numStr = numStr.substring(0, i);
  } else if (integerLen < 0) {
    integerLen = numStr.length;
  }
  for (i = 0; numStr.charAt(i) === ZERO_CHAR; i++) {
  }
  if (i === (zeros = numStr.length)) {
    digits = [0];
    integerLen = 1;
  } else {
    zeros--;
    while (numStr.charAt(zeros) === ZERO_CHAR)
      zeros--;
    integerLen -= i;
    digits = [];
    for (j = 0; i <= zeros; i++, j++) {
      digits[j] = Number(numStr.charAt(i));
    }
  }
  if (integerLen > MAX_DIGITS) {
    digits = digits.splice(0, MAX_DIGITS - 1);
    exponent = integerLen - 1;
    integerLen = 1;
  }
  return { digits, exponent, integerLen };
}
function roundNumber(parsedNumber, minFrac, maxFrac) {
  if (minFrac > maxFrac) {
    throw new Error(`The minimum number of digits after fraction (${minFrac}) is higher than the maximum (${maxFrac}).`);
  }
  let digits = parsedNumber.digits;
  let fractionLen = digits.length - parsedNumber.integerLen;
  const fractionSize = Math.min(Math.max(minFrac, fractionLen), maxFrac);
  let roundAt = fractionSize + parsedNumber.integerLen;
  let digit = digits[roundAt];
  if (roundAt > 0) {
    digits.splice(Math.max(parsedNumber.integerLen, roundAt));
    for (let j = roundAt; j < digits.length; j++) {
      digits[j] = 0;
    }
  } else {
    fractionLen = Math.max(0, fractionLen);
    parsedNumber.integerLen = 1;
    digits.length = Math.max(1, roundAt = fractionSize + 1);
    digits[0] = 0;
    for (let i = 1; i < roundAt; i++)
      digits[i] = 0;
  }
  if (digit >= 5) {
    if (roundAt - 1 < 0) {
      for (let k = 0; k > roundAt; k--) {
        digits.unshift(0);
        parsedNumber.integerLen++;
      }
      digits.unshift(1);
      parsedNumber.integerLen++;
    } else {
      digits[roundAt - 1]++;
    }
  }
  for (; fractionLen < Math.max(0, fractionSize); fractionLen++)
    digits.push(0);
  let dropTrailingZeros = fractionSize !== 0;
  const minLen = minFrac + parsedNumber.integerLen;
  const carry = digits.reduceRight(function(carry2, d, i, digits2) {
    d = d + carry2;
    digits2[i] = d < 10 ? d : d - 10;
    if (dropTrailingZeros) {
      if (digits2[i] === 0 && i >= minLen) {
        digits2.pop();
      } else {
        dropTrailingZeros = false;
      }
    }
    return d >= 10 ? 1 : 0;
  }, 0);
  if (carry) {
    digits.unshift(carry);
    parsedNumber.integerLen++;
  }
}
function parseIntAutoRadix(text) {
  const result = parseInt(text);
  if (isNaN(result)) {
    throw new Error("Invalid integer literal when parsing " + text);
  }
  return result;
}
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
class NgLocalization {
}
NgLocalization.ɵfac = ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "13.4.0", ngImport: i0, type: NgLocalization, deps: [], target: FactoryTarget.Injectable });
NgLocalization.ɵprov = ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "13.4.0", ngImport: i0, type: NgLocalization, providedIn: "root", useFactory: (locale) => new NgLocaleLocalization(locale), deps: [{ token: LOCALE_ID }] });
ɵɵngDeclareClassMetadata({ type: NgLocalization, decorators: [{
  type: Injectable,
  args: [{
    providedIn: "root",
    useFactory: (locale) => new NgLocaleLocalization(locale),
    deps: [LOCALE_ID]
  }]
}] });
function getPluralCategory(value, cases, ngLocalization, locale) {
  let key = `=${value}`;
  if (cases.indexOf(key) > -1) {
    return key;
  }
  key = ngLocalization.getPluralCategory(value, locale);
  if (cases.indexOf(key) > -1) {
    return key;
  }
  if (cases.indexOf("other") > -1) {
    return "other";
  }
  throw new Error(`No plural message found for value "${value}"`);
}
class NgLocaleLocalization extends NgLocalization {
  constructor(locale) {
    super();
    this.locale = locale;
  }
  getPluralCategory(value, locale) {
    const plural2 = getLocalePluralCase(locale || this.locale)(value);
    switch (plural2) {
      case Plural.Zero:
        return "zero";
      case Plural.One:
        return "one";
      case Plural.Two:
        return "two";
      case Plural.Few:
        return "few";
      case Plural.Many:
        return "many";
      default:
        return "other";
    }
  }
}
NgLocaleLocalization.ɵfac = ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "13.4.0", ngImport: i0, type: NgLocaleLocalization, deps: [{ token: LOCALE_ID }], target: FactoryTarget.Injectable });
NgLocaleLocalization.ɵprov = ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "13.4.0", ngImport: i0, type: NgLocaleLocalization });
ɵɵngDeclareClassMetadata({ type: NgLocaleLocalization, decorators: [{
  type: Injectable
}], ctorParameters: function() {
  return [{ type: void 0, decorators: [{
    type: Inject,
    args: [LOCALE_ID]
  }] }];
} });
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
function parseCookieValue(cookieStr, name) {
  name = encodeURIComponent(name);
  for (const cookie of cookieStr.split(";")) {
    const eqIndex = cookie.indexOf("=");
    const [cookieName, cookieValue] = eqIndex == -1 ? [cookie, ""] : [cookie.slice(0, eqIndex), cookie.slice(eqIndex + 1)];
    if (cookieName.trim() === name) {
      return decodeURIComponent(cookieValue);
    }
  }
  return null;
}
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
class NgClass {
  constructor(_iterableDiffers, _keyValueDiffers, _ngEl, _renderer) {
    this._iterableDiffers = _iterableDiffers;
    this._keyValueDiffers = _keyValueDiffers;
    this._ngEl = _ngEl;
    this._renderer = _renderer;
    this._iterableDiffer = null;
    this._keyValueDiffer = null;
    this._initialClasses = [];
    this._rawClass = null;
  }
  set klass(value) {
    this._removeClasses(this._initialClasses);
    this._initialClasses = typeof value === "string" ? value.split(/\s+/) : [];
    this._applyClasses(this._initialClasses);
    this._applyClasses(this._rawClass);
  }
  set ngClass(value) {
    this._removeClasses(this._rawClass);
    this._applyClasses(this._initialClasses);
    this._iterableDiffer = null;
    this._keyValueDiffer = null;
    this._rawClass = typeof value === "string" ? value.split(/\s+/) : value;
    if (this._rawClass) {
      if (isListLikeIterable(this._rawClass)) {
        this._iterableDiffer = this._iterableDiffers.find(this._rawClass).create();
      } else {
        this._keyValueDiffer = this._keyValueDiffers.find(this._rawClass).create();
      }
    }
  }
  ngDoCheck() {
    if (this._iterableDiffer) {
      const iterableChanges = this._iterableDiffer.diff(this._rawClass);
      if (iterableChanges) {
        this._applyIterableChanges(iterableChanges);
      }
    } else if (this._keyValueDiffer) {
      const keyValueChanges = this._keyValueDiffer.diff(this._rawClass);
      if (keyValueChanges) {
        this._applyKeyValueChanges(keyValueChanges);
      }
    }
  }
  _applyKeyValueChanges(changes) {
    changes.forEachAddedItem((record) => this._toggleClass(record.key, record.currentValue));
    changes.forEachChangedItem((record) => this._toggleClass(record.key, record.currentValue));
    changes.forEachRemovedItem((record) => {
      if (record.previousValue) {
        this._toggleClass(record.key, false);
      }
    });
  }
  _applyIterableChanges(changes) {
    changes.forEachAddedItem((record) => {
      if (typeof record.item === "string") {
        this._toggleClass(record.item, true);
      } else {
        throw new Error(`NgClass can only toggle CSS classes expressed as strings, got ${stringify(record.item)}`);
      }
    });
    changes.forEachRemovedItem((record) => this._toggleClass(record.item, false));
  }
  /**
   * Applies a collection of CSS classes to the DOM element.
   *
   * For argument of type Set and Array CSS class names contained in those collections are always
   * added.
   * For argument of type Map CSS class name in the map's key is toggled based on the value (added
   * for truthy and removed for falsy).
   */
  _applyClasses(rawClassVal) {
    if (rawClassVal) {
      if (Array.isArray(rawClassVal) || rawClassVal instanceof Set) {
        rawClassVal.forEach((klass) => this._toggleClass(klass, true));
      } else {
        Object.keys(rawClassVal).forEach((klass) => this._toggleClass(klass, !!rawClassVal[klass]));
      }
    }
  }
  /**
   * Removes a collection of CSS classes from the DOM element. This is mostly useful for cleanup
   * purposes.
   */
  _removeClasses(rawClassVal) {
    if (rawClassVal) {
      if (Array.isArray(rawClassVal) || rawClassVal instanceof Set) {
        rawClassVal.forEach((klass) => this._toggleClass(klass, false));
      } else {
        Object.keys(rawClassVal).forEach((klass) => this._toggleClass(klass, false));
      }
    }
  }
  _toggleClass(klass, enabled) {
    klass = klass.trim();
    if (klass) {
      klass.split(/\s+/g).forEach((klass2) => {
        if (enabled) {
          this._renderer.addClass(this._ngEl.nativeElement, klass2);
        } else {
          this._renderer.removeClass(this._ngEl.nativeElement, klass2);
        }
      });
    }
  }
}
NgClass.ɵfac = ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "13.4.0", ngImport: i0, type: NgClass, deps: [{ token: IterableDiffers }, { token: KeyValueDiffers }, { token: ElementRef }, { token: Renderer2 }], target: FactoryTarget.Directive });
NgClass.ɵdir = ɵɵngDeclareDirective({ minVersion: "12.0.0", version: "13.4.0", type: NgClass, selector: "[ngClass]", inputs: { klass: ["class", "klass"], ngClass: "ngClass" }, ngImport: i0 });
ɵɵngDeclareClassMetadata({ type: NgClass, decorators: [{
  type: Directive,
  args: [{ selector: "[ngClass]" }]
}], ctorParameters: function() {
  return [{ type: IterableDiffers }, { type: KeyValueDiffers }, { type: ElementRef }, { type: Renderer2 }];
}, propDecorators: { klass: [{
  type: Input,
  args: ["class"]
}], ngClass: [{
  type: Input,
  args: ["ngClass"]
}] } });
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
class NgComponentOutlet {
  constructor(_viewContainerRef) {
    this._viewContainerRef = _viewContainerRef;
    this._componentRef = null;
    this._moduleRef = null;
  }
  /** @nodoc */
  ngOnChanges(changes) {
    this._viewContainerRef.clear();
    this._componentRef = null;
    if (this.ngComponentOutlet) {
      const elInjector = this.ngComponentOutletInjector || this._viewContainerRef.parentInjector;
      if (changes["ngComponentOutletNgModuleFactory"]) {
        if (this._moduleRef)
          this._moduleRef.destroy();
        if (this.ngComponentOutletNgModuleFactory) {
          const parentModule = elInjector.get(NgModuleRef$1);
          this._moduleRef = this.ngComponentOutletNgModuleFactory.create(parentModule.injector);
        } else {
          this._moduleRef = null;
        }
      }
      const componentFactoryResolver = this._moduleRef ? this._moduleRef.componentFactoryResolver : elInjector.get(ComponentFactoryResolver$1);
      const componentFactory = componentFactoryResolver.resolveComponentFactory(this.ngComponentOutlet);
      this._componentRef = this._viewContainerRef.createComponent(componentFactory, this._viewContainerRef.length, elInjector, this.ngComponentOutletContent);
    }
  }
  /** @nodoc */
  ngOnDestroy() {
    if (this._moduleRef)
      this._moduleRef.destroy();
  }
}
NgComponentOutlet.ɵfac = ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "13.4.0", ngImport: i0, type: NgComponentOutlet, deps: [{ token: ViewContainerRef }], target: FactoryTarget.Directive });
NgComponentOutlet.ɵdir = ɵɵngDeclareDirective({ minVersion: "12.0.0", version: "13.4.0", type: NgComponentOutlet, selector: "[ngComponentOutlet]", inputs: { ngComponentOutlet: "ngComponentOutlet", ngComponentOutletInjector: "ngComponentOutletInjector", ngComponentOutletContent: "ngComponentOutletContent", ngComponentOutletNgModuleFactory: "ngComponentOutletNgModuleFactory" }, usesOnChanges: true, ngImport: i0 });
ɵɵngDeclareClassMetadata({ type: NgComponentOutlet, decorators: [{
  type: Directive,
  args: [{ selector: "[ngComponentOutlet]" }]
}], ctorParameters: function() {
  return [{ type: ViewContainerRef }];
}, propDecorators: { ngComponentOutlet: [{
  type: Input
}], ngComponentOutletInjector: [{
  type: Input
}], ngComponentOutletContent: [{
  type: Input
}], ngComponentOutletNgModuleFactory: [{
  type: Input
}] } });
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
class NgForOfContext {
  constructor($implicit, ngForOf, index, count) {
    this.$implicit = $implicit;
    this.ngForOf = ngForOf;
    this.index = index;
    this.count = count;
  }
  get first() {
    return this.index === 0;
  }
  get last() {
    return this.index === this.count - 1;
  }
  get even() {
    return this.index % 2 === 0;
  }
  get odd() {
    return !this.even;
  }
}
class NgForOf {
  constructor(_viewContainer, _template, _differs) {
    this._viewContainer = _viewContainer;
    this._template = _template;
    this._differs = _differs;
    this._ngForOf = null;
    this._ngForOfDirty = true;
    this._differ = null;
  }
  /**
   * The value of the iterable expression, which can be used as a
   * [template input variable](guide/structural-directives#shorthand).
   */
  set ngForOf(ngForOf) {
    this._ngForOf = ngForOf;
    this._ngForOfDirty = true;
  }
  /**
   * Specifies a custom `TrackByFunction` to compute the identity of items in an iterable.
   *
   * If a custom `TrackByFunction` is not provided, `NgForOf` will use the item's [object
   * identity](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/is)
   * as the key.
   *
   * `NgForOf` uses the computed key to associate items in an iterable with DOM elements
   * it produces for these items.
   *
   * A custom `TrackByFunction` is useful to provide good user experience in cases when items in an
   * iterable rendered using `NgForOf` have a natural identifier (for example, custom ID or a
   * primary key), and this iterable could be updated with new object instances that still
   * represent the same underlying entity (for example, when data is re-fetched from the server,
   * and the iterable is recreated and re-rendered, but most of the data is still the same).
   *
   * @see `TrackByFunction`
   */
  set ngForTrackBy(fn) {
    if ((typeof ngDevMode === "undefined" || ngDevMode) && fn != null && typeof fn !== "function") {
      if (console && console.warn) {
        console.warn(`trackBy must be a function, but received ${JSON.stringify(fn)}. See https://angular.io/api/common/NgForOf#change-propagation for more information.`);
      }
    }
    this._trackByFn = fn;
  }
  get ngForTrackBy() {
    return this._trackByFn;
  }
  /**
   * A reference to the template that is stamped out for each item in the iterable.
   * @see [template reference variable](guide/template-reference-variables)
   */
  set ngForTemplate(value) {
    if (value) {
      this._template = value;
    }
  }
  /**
   * Applies the changes when needed.
   * @nodoc
   */
  ngDoCheck() {
    if (this._ngForOfDirty) {
      this._ngForOfDirty = false;
      const value = this._ngForOf;
      if (!this._differ && value) {
        if (typeof ngDevMode === "undefined" || ngDevMode) {
          try {
            this._differ = this._differs.find(value).create(this.ngForTrackBy);
          } catch {
            throw new Error(`Cannot find a differ supporting object '${value}' of type '${getTypeName(value)}'. NgFor only supports binding to Iterables such as Arrays.`);
          }
        } else {
          this._differ = this._differs.find(value).create(this.ngForTrackBy);
        }
      }
    }
    if (this._differ) {
      const changes = this._differ.diff(this._ngForOf);
      if (changes)
        this._applyChanges(changes);
    }
  }
  _applyChanges(changes) {
    const viewContainer = this._viewContainer;
    changes.forEachOperation((item, adjustedPreviousIndex, currentIndex) => {
      if (item.previousIndex == null) {
        viewContainer.createEmbeddedView(this._template, new NgForOfContext(item.item, this._ngForOf, -1, -1), currentIndex === null ? void 0 : currentIndex);
      } else if (currentIndex == null) {
        viewContainer.remove(adjustedPreviousIndex === null ? void 0 : adjustedPreviousIndex);
      } else if (adjustedPreviousIndex !== null) {
        const view = viewContainer.get(adjustedPreviousIndex);
        viewContainer.move(view, currentIndex);
        applyViewChange(view, item);
      }
    });
    for (let i = 0, ilen = viewContainer.length; i < ilen; i++) {
      const viewRef = viewContainer.get(i);
      const context = viewRef.context;
      context.index = i;
      context.count = ilen;
      context.ngForOf = this._ngForOf;
    }
    changes.forEachIdentityChange((record) => {
      const viewRef = viewContainer.get(record.currentIndex);
      applyViewChange(viewRef, record);
    });
  }
  /**
   * Asserts the correct type of the context for the template that `NgForOf` will render.
   *
   * The presence of this method is a signal to the Ivy template type-check compiler that the
   * `NgForOf` structural directive renders its template with a specific context type.
   */
  static ngTemplateContextGuard(dir, ctx) {
    return true;
  }
}
NgForOf.ɵfac = ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "13.4.0", ngImport: i0, type: NgForOf, deps: [{ token: ViewContainerRef }, { token: TemplateRef }, { token: IterableDiffers }], target: FactoryTarget.Directive });
NgForOf.ɵdir = ɵɵngDeclareDirective({ minVersion: "12.0.0", version: "13.4.0", type: NgForOf, selector: "[ngFor][ngForOf]", inputs: { ngForOf: "ngForOf", ngForTrackBy: "ngForTrackBy", ngForTemplate: "ngForTemplate" }, ngImport: i0 });
ɵɵngDeclareClassMetadata({ type: NgForOf, decorators: [{
  type: Directive,
  args: [{ selector: "[ngFor][ngForOf]" }]
}], ctorParameters: function() {
  return [{ type: ViewContainerRef }, { type: TemplateRef }, { type: IterableDiffers }];
}, propDecorators: { ngForOf: [{
  type: Input
}], ngForTrackBy: [{
  type: Input
}], ngForTemplate: [{
  type: Input
}] } });
function applyViewChange(view, record) {
  view.context.$implicit = record.item;
}
function getTypeName(type) {
  return type["name"] || typeof type;
}
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
class NgIf {
  constructor(_viewContainer, templateRef) {
    this._viewContainer = _viewContainer;
    this._context = new NgIfContext();
    this._thenTemplateRef = null;
    this._elseTemplateRef = null;
    this._thenViewRef = null;
    this._elseViewRef = null;
    this._thenTemplateRef = templateRef;
  }
  /**
   * The Boolean expression to evaluate as the condition for showing a template.
   */
  set ngIf(condition) {
    this._context.$implicit = this._context.ngIf = condition;
    this._updateView();
  }
  /**
   * A template to show if the condition expression evaluates to true.
   */
  set ngIfThen(templateRef) {
    assertTemplate("ngIfThen", templateRef);
    this._thenTemplateRef = templateRef;
    this._thenViewRef = null;
    this._updateView();
  }
  /**
   * A template to show if the condition expression evaluates to false.
   */
  set ngIfElse(templateRef) {
    assertTemplate("ngIfElse", templateRef);
    this._elseTemplateRef = templateRef;
    this._elseViewRef = null;
    this._updateView();
  }
  _updateView() {
    if (this._context.$implicit) {
      if (!this._thenViewRef) {
        this._viewContainer.clear();
        this._elseViewRef = null;
        if (this._thenTemplateRef) {
          this._thenViewRef = this._viewContainer.createEmbeddedView(this._thenTemplateRef, this._context);
        }
      }
    } else {
      if (!this._elseViewRef) {
        this._viewContainer.clear();
        this._thenViewRef = null;
        if (this._elseTemplateRef) {
          this._elseViewRef = this._viewContainer.createEmbeddedView(this._elseTemplateRef, this._context);
        }
      }
    }
  }
  /**
   * Asserts the correct type of the context for the template that `NgIf` will render.
   *
   * The presence of this method is a signal to the Ivy template type-check compiler that the
   * `NgIf` structural directive renders its template with a specific context type.
   */
  static ngTemplateContextGuard(dir, ctx) {
    return true;
  }
}
NgIf.ɵfac = ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "13.4.0", ngImport: i0, type: NgIf, deps: [{ token: ViewContainerRef }, { token: TemplateRef }], target: FactoryTarget.Directive });
NgIf.ɵdir = ɵɵngDeclareDirective({ minVersion: "12.0.0", version: "13.4.0", type: NgIf, selector: "[ngIf]", inputs: { ngIf: "ngIf", ngIfThen: "ngIfThen", ngIfElse: "ngIfElse" }, ngImport: i0 });
ɵɵngDeclareClassMetadata({ type: NgIf, decorators: [{
  type: Directive,
  args: [{ selector: "[ngIf]" }]
}], ctorParameters: function() {
  return [{ type: ViewContainerRef }, { type: TemplateRef }];
}, propDecorators: { ngIf: [{
  type: Input
}], ngIfThen: [{
  type: Input
}], ngIfElse: [{
  type: Input
}] } });
class NgIfContext {
  constructor() {
    this.$implicit = null;
    this.ngIf = null;
  }
}
function assertTemplate(property, templateRef) {
  const isTemplateRefOrNull = !!(!templateRef || templateRef.createEmbeddedView);
  if (!isTemplateRefOrNull) {
    throw new Error(`${property} must be a TemplateRef, but received '${stringify(templateRef)}'.`);
  }
}
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
const PLATFORM_BROWSER_ID = "browser";
const PLATFORM_SERVER_ID = "server";
function isPlatformBrowser(platformId) {
  return platformId === PLATFORM_BROWSER_ID;
}
function isPlatformServer(platformId) {
  return platformId === PLATFORM_SERVER_ID;
}
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
function imgDirectiveDetails(ngSrc, includeNgSrc = true) {
  const ngSrcInfo = includeNgSrc ? `(activated on an <img> element with the \`ngSrc="${ngSrc}"\`) ` : "";
  return `The NgOptimizedImage directive ${ngSrcInfo}has detected that`;
}
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
function getUrl(src, win) {
  return isAbsoluteUrl(src) ? new URL(src) : new URL(src, win.location.href);
}
function isAbsoluteUrl(src) {
  return /^https?:\/\//.test(src);
}
function extractHostname(url) {
  return isAbsoluteUrl(url) ? new URL(url).hostname : url;
}
function isValidPath(path) {
  const isString = typeof path === "string";
  if (!isString || path.trim() === "") {
    return false;
  }
  try {
    const url = new URL(path);
    return true;
  } catch {
    return false;
  }
}
function normalizePath(path) {
  return path.endsWith("/") ? path.slice(0, -1) : path;
}
function normalizeSrc(src) {
  return src.startsWith("/") ? src.slice(1) : src;
}
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
const noopImageLoader = (config2) => config2.src;
const IMAGE_LOADER = new InjectionToken("ImageLoader", {
  providedIn: "root",
  factory: () => noopImageLoader
});
function createImageLoader(buildUrlFn, exampleUrls) {
  return function provideImageLoader(path) {
    if (!isValidPath(path)) {
      throwInvalidPathError(path, exampleUrls || []);
    }
    path = normalizePath(path);
    const loaderFn = (config2) => {
      if (isAbsoluteUrl(config2.src)) {
        throwUnexpectedAbsoluteUrlError(path, config2.src);
      }
      return buildUrlFn(path, { ...config2, src: normalizeSrc(config2.src) });
    };
    const providers = [{ provide: IMAGE_LOADER, useValue: loaderFn }];
    return providers;
  };
}
function throwInvalidPathError(path, exampleUrls) {
  throw new RuntimeError(2959, ngDevMode && `Image loader has detected an invalid path (\`${path}\`). To fix this, supply a path using one of the following formats: ${exampleUrls.join(" or ")}`);
}
function throwUnexpectedAbsoluteUrlError(path, url) {
  throw new RuntimeError(2959, ngDevMode && `Image loader has detected a \`<img>\` tag with an invalid \`ngSrc\` attribute: ${url}. This image loader expects \`ngSrc\` to be a relative URL - however the provided value is an absolute URL. To fix this, provide \`ngSrc\` as a path relative to the base URL configured for this loader (\`${path}\`).`);
}
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
const cloudinaryLoaderInfo = {
  name: "Cloudinary",
  testUrl: isCloudinaryUrl
};
const CLOUDINARY_LOADER_REGEX = /https?\:\/\/[^\/]+\.cloudinary\.com\/.+/;
function isCloudinaryUrl(url) {
  return CLOUDINARY_LOADER_REGEX.test(url);
}
createImageLoader(createCloudinaryUrl, ngDevMode ? [
  "https://res.cloudinary.com/mysite",
  "https://mysite.cloudinary.com",
  "https://subdomain.mysite.com"
] : void 0);
function createCloudinaryUrl(path, config2) {
  let params = `f_auto,q_auto`;
  if (config2.width) {
    params += `,w_${config2.width}`;
  }
  return `${path}/image/upload/${params}/${config2.src}`;
}
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
const imageKitLoaderInfo = {
  name: "ImageKit",
  testUrl: isImageKitUrl
};
const IMAGE_KIT_LOADER_REGEX = /https?\:\/\/[^\/]+\.imagekit\.io\/.+/;
function isImageKitUrl(url) {
  return IMAGE_KIT_LOADER_REGEX.test(url);
}
createImageLoader(createImagekitUrl, ngDevMode ? ["https://ik.imagekit.io/mysite", "https://subdomain.mysite.com"] : void 0);
function createImagekitUrl(path, config2) {
  let params = `tr:q-auto`;
  if (config2.width) {
    params += `,w-${config2.width}`;
  }
  return `${path}/${params}/${config2.src}`;
}
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
const imgixLoaderInfo = {
  name: "Imgix",
  testUrl: isImgixUrl
};
const IMGIX_LOADER_REGEX = /https?\:\/\/[^\/]+\.imgix\.net\/.+/;
function isImgixUrl(url) {
  return IMGIX_LOADER_REGEX.test(url);
}
createImageLoader(createImgixUrl, ngDevMode ? ["https://somepath.imgix.net/"] : void 0);
function createImgixUrl(path, config2) {
  const url = new URL(`${path}/${config2.src}`);
  url.searchParams.set("auto", "format");
  if (config2.width) {
    url.searchParams.set("w", config2.width.toString());
  }
  return url.href;
}
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
function assertDevMode(checkName) {
  if (!ngDevMode) {
    throw new RuntimeError(2958, `Unexpected invocation of the ${checkName} in the prod mode. Please make sure that the prod mode is enabled for production builds.`);
  }
}
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
class LCPImageObserver {
  constructor() {
    this.images = /* @__PURE__ */ new Map();
    this.alreadyWarned = /* @__PURE__ */ new Set();
    this.window = null;
    this.observer = null;
    assertDevMode("LCP checker");
    const win = inject(DOCUMENT).defaultView;
    if (typeof win !== "undefined" && typeof PerformanceObserver !== "undefined") {
      this.window = win;
      this.observer = this.initPerformanceObserver();
    }
  }
  /**
   * Inits PerformanceObserver and subscribes to LCP events.
   * Based on https://web.dev/lcp/#measure-lcp-in-javascript
   */
  initPerformanceObserver() {
    const observer = new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries();
      if (entries.length === 0)
        return;
      const lcpElement = entries[entries.length - 1];
      const imgSrc = lcpElement.element?.src ?? "";
      if (imgSrc.startsWith("data:") || imgSrc.startsWith("blob:"))
        return;
      const imgNgSrc = this.images.get(imgSrc);
      if (imgNgSrc && !this.alreadyWarned.has(imgSrc)) {
        this.alreadyWarned.add(imgSrc);
        logMissingPriorityWarning(imgSrc);
      }
    });
    observer.observe({ type: "largest-contentful-paint", buffered: true });
    return observer;
  }
  registerImage(rewrittenSrc, originalNgSrc) {
    if (!this.observer)
      return;
    this.images.set(getUrl(rewrittenSrc, this.window).href, originalNgSrc);
  }
  unregisterImage(rewrittenSrc) {
    if (!this.observer)
      return;
    this.images.delete(getUrl(rewrittenSrc, this.window).href);
  }
  ngOnDestroy() {
    if (!this.observer)
      return;
    this.observer.disconnect();
    this.images.clear();
    this.alreadyWarned.clear();
  }
}
LCPImageObserver.ɵfac = ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "13.4.0", ngImport: i0, type: LCPImageObserver, deps: [], target: FactoryTarget.Injectable });
LCPImageObserver.ɵprov = ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "13.4.0", ngImport: i0, type: LCPImageObserver, providedIn: "root" });
ɵɵngDeclareClassMetadata({ type: LCPImageObserver, decorators: [{
  type: Injectable,
  args: [{ providedIn: "root" }]
}], ctorParameters: function() {
  return [];
} });
function logMissingPriorityWarning(ngSrc) {
  const directiveDetails = imgDirectiveDetails(ngSrc);
  console.warn(formatRuntimeError(2955, `${directiveDetails} this image is the Largest Contentful Paint (LCP) element but was not marked "priority". This image should be marked "priority" in order to prioritize its loading. To fix this, add the "priority" attribute.`));
}
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
const INTERNAL_PRECONNECT_CHECK_BLOCKLIST = /* @__PURE__ */ new Set(["localhost", "127.0.0.1", "0.0.0.0"]);
const PRECONNECT_CHECK_BLOCKLIST = new InjectionToken("PRECONNECT_CHECK_BLOCKLIST");
class PreconnectLinkChecker {
  constructor() {
    this.preconnectLinks = null;
    this.alreadySeen = /* @__PURE__ */ new Set();
    this.window = null;
    this.blocklist = new Set(INTERNAL_PRECONNECT_CHECK_BLOCKLIST);
    this.document = inject(DOCUMENT);
    assertDevMode("preconnect link checker");
    const win = this.document.defaultView;
    if (typeof win !== "undefined") {
      this.window = win;
    }
    const blocklist = inject(PRECONNECT_CHECK_BLOCKLIST, InjectFlags.Optional);
    if (blocklist) {
      this.populateBlocklist(blocklist);
    }
  }
  populateBlocklist(origins) {
    if (Array.isArray(origins)) {
      deepForEach(origins, (origin) => {
        this.blocklist.add(extractHostname(origin));
      });
    } else {
      this.blocklist.add(extractHostname(origins));
    }
  }
  /**
   * Checks that a preconnect resource hint exists in the head for the
   * given src.
   *
   * @param rewrittenSrc src formatted with loader
   * @param originalNgSrc ngSrc value
   */
  assertPreconnect(rewrittenSrc, originalNgSrc) {
    if (!this.window)
      return;
    const imgUrl = getUrl(rewrittenSrc, this.window);
    if (this.blocklist.has(imgUrl.hostname) || this.alreadySeen.has(imgUrl.origin))
      return;
    this.alreadySeen.add(imgUrl.origin);
    if (!this.preconnectLinks) {
      this.preconnectLinks = this.queryPreconnectLinks();
    }
    if (!this.preconnectLinks.has(imgUrl.origin)) {
      console.warn(formatRuntimeError(2956, `${imgDirectiveDetails(originalNgSrc)} there is no preconnect tag present for this image. Preconnecting to the origin(s) that serve priority images ensures that these images are delivered as soon as possible. To fix this, please add the following element into the <head> of the document:
  <link rel="preconnect" href="${imgUrl.origin}">`));
    }
  }
  queryPreconnectLinks() {
    const preconnectUrls = /* @__PURE__ */ new Set();
    const selector = "link[rel=preconnect]";
    const links = Array.from(this.document.querySelectorAll(selector));
    for (let link of links) {
      const url = getUrl(link.href, this.window);
      preconnectUrls.add(url.origin);
    }
    return preconnectUrls;
  }
  ngOnDestroy() {
    this.preconnectLinks?.clear();
    this.alreadySeen.clear();
  }
}
PreconnectLinkChecker.ɵfac = ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "13.4.0", ngImport: i0, type: PreconnectLinkChecker, deps: [], target: FactoryTarget.Injectable });
PreconnectLinkChecker.ɵprov = ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "13.4.0", ngImport: i0, type: PreconnectLinkChecker, providedIn: "root" });
ɵɵngDeclareClassMetadata({ type: PreconnectLinkChecker, decorators: [{
  type: Injectable,
  args: [{ providedIn: "root" }]
}], ctorParameters: function() {
  return [];
} });
function deepForEach(input, fn) {
  for (let value of input) {
    Array.isArray(value) ? deepForEach(value, fn) : fn(value);
  }
}
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
const DEFAULT_PRELOADED_IMAGES_LIMIT = 5;
const PRELOADED_IMAGES = new InjectionToken("NG_OPTIMIZED_PRELOADED_IMAGES", { providedIn: "root", factory: () => /* @__PURE__ */ new Set() });
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
class PreloadLinkCreator {
  constructor() {
    this.preloadedImages = inject(PRELOADED_IMAGES);
    this.document = inject(DOCUMENT);
  }
  /**
   * @description Add a preload `<link>` to the `<head>` of the `index.html` that is served from the
   * server while using Angular Universal and SSR to kick off image loads for high priority images.
   *
   * The `sizes` (passed in from the user) and `srcset` (parsed and formatted from `ngSrcset`)
   * properties used to set the corresponding attributes, `imagesizes` and `imagesrcset`
   * respectively, on the preload `<link>` tag so that the correctly sized image is preloaded from
   * the CDN.
   *
   * {@link https://web.dev/preload-responsive-images/#imagesrcset-and-imagesizes}
   *
   * @param renderer The `Renderer2` passed in from the directive
   * @param src The original src of the image that is set on the `ngSrc` input.
   * @param srcset The parsed and formatted srcset created from the `ngSrcset` input
   * @param sizes The value of the `sizes` attribute passed in to the `<img>` tag
   */
  createPreloadLinkTag(renderer, src, srcset, sizes) {
    if (ngDevMode) {
      if (this.preloadedImages.size >= DEFAULT_PRELOADED_IMAGES_LIMIT) {
        throw new RuntimeError(2961, ngDevMode && `The \`NgOptimizedImage\` directive has detected that more than ${DEFAULT_PRELOADED_IMAGES_LIMIT} images were marked as priority. This might negatively affect an overall performance of the page. To fix this, remove the "priority" attribute from images with less priority.`);
      }
    }
    if (this.preloadedImages.has(src)) {
      return;
    }
    this.preloadedImages.add(src);
    const preload = renderer.createElement("link");
    renderer.setAttribute(preload, "as", "image");
    renderer.setAttribute(preload, "href", src);
    renderer.setAttribute(preload, "rel", "preload");
    renderer.setAttribute(preload, "fetchpriority", "high");
    if (sizes) {
      renderer.setAttribute(preload, "imageSizes", sizes);
    }
    if (srcset) {
      renderer.setAttribute(preload, "imageSrcset", srcset);
    }
    renderer.appendChild(this.document.head, preload);
  }
}
PreloadLinkCreator.ɵfac = ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "13.4.0", ngImport: i0, type: PreloadLinkCreator, deps: [], target: FactoryTarget.Injectable });
PreloadLinkCreator.ɵprov = ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "13.4.0", ngImport: i0, type: PreloadLinkCreator, providedIn: "root" });
ɵɵngDeclareClassMetadata({ type: PreloadLinkCreator, decorators: [{
  type: Injectable,
  args: [{ providedIn: "root" }]
}], ctorParameters: function() {
  return [];
} });
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
const BASE64_IMG_MAX_LENGTH_IN_ERROR = 50;
const VALID_WIDTH_DESCRIPTOR_SRCSET = /^((\s*\d+w\s*(,|$)){1,})$/;
const VALID_DENSITY_DESCRIPTOR_SRCSET = /^((\s*\d+(\.\d+)?x\s*(,|$)){1,})$/;
const ABSOLUTE_SRCSET_DENSITY_CAP = 3;
const RECOMMENDED_SRCSET_DENSITY_CAP = 2;
const DENSITY_SRCSET_MULTIPLIERS = [1, 2];
const VIEWPORT_BREAKPOINT_CUTOFF = 640;
const ASPECT_RATIO_TOLERANCE = 0.1;
const OVERSIZED_IMAGE_TOLERANCE = 1e3;
const FIXED_SRCSET_WIDTH_LIMIT = 1920;
const FIXED_SRCSET_HEIGHT_LIMIT = 1080;
const BUILT_IN_LOADERS = [imgixLoaderInfo, imageKitLoaderInfo, cloudinaryLoaderInfo];
const defaultConfig = {
  breakpoints: [16, 32, 48, 64, 96, 128, 256, 384, 640, 750, 828, 1080, 1200, 1920, 2048, 3840]
};
const IMAGE_CONFIG = new InjectionToken("ImageConfig", { providedIn: "root", factory: () => defaultConfig });
class NgOptimizedImage {
  constructor(imageLoader, config2, renderer, elementRef, injector, platformId, preloadLinkChecker) {
    this.imageLoader = imageLoader;
    this.config = config2;
    this.renderer = renderer;
    this.elementRef = elementRef;
    this.injector = injector;
    this.platformId = platformId;
    this.preloadLinkChecker = preloadLinkChecker;
    this._renderedSrc = null;
    this._priority = false;
    this._disableOptimizedSrcset = false;
    this._fill = false;
    this.config = processConfig(this.config);
    this.imgElement = this.elementRef.nativeElement;
    this.lcpObserver = ngDevMode ? this.injector.get(LCPImageObserver) : null;
  }
  /**
   * For responsive images: the intrinsic width of the image in pixels.
   * For fixed size images: the desired rendered width of the image in pixels.
   */
  set width(value) {
    ngDevMode && assertGreaterThanZero(this, value, "width");
    this._width = inputToInteger(value);
  }
  get width() {
    return this._width;
  }
  /**
   * For responsive images: the intrinsic height of the image in pixels.
   * For fixed size images: the desired rendered height of the image in pixels.* The intrinsic
   * height of the image in pixels.
   */
  set height(value) {
    ngDevMode && assertGreaterThanZero(this, value, "height");
    this._height = inputToInteger(value);
  }
  get height() {
    return this._height;
  }
  /**
   * Indicates whether this image should have a high priority.
   */
  set priority(value) {
    this._priority = inputToBoolean(value);
  }
  get priority() {
    return this._priority;
  }
  /**
   * Disables automatic srcset generation for this image.
   */
  set disableOptimizedSrcset(value) {
    this._disableOptimizedSrcset = inputToBoolean(value);
  }
  get disableOptimizedSrcset() {
    return this._disableOptimizedSrcset;
  }
  /**
   * Sets the image to "fill mode", which eliminates the height/width requirement and adds
   * styles such that the image fills its containing element.
   */
  set fill(value) {
    this._fill = inputToBoolean(value);
  }
  get fill() {
    return this._fill;
  }
  /** @nodoc */
  ngOnInit() {
    if (ngDevMode) {
      assertNonEmptyInput(this, "ngSrc", this.ngSrc);
      assertValidNgSrcset(this, this.ngSrcset);
      assertNoConflictingSrc(this);
      if (this.ngSrcset) {
        assertNoConflictingSrcset(this);
      }
      assertNotBase64Image(this);
      assertNotBlobUrl(this);
      if (this.fill) {
        assertEmptyWidthAndHeight(this);
        assertNonZeroRenderedHeight(this, this.imgElement, this.renderer);
      } else {
        assertNonEmptyWidthAndHeight(this);
        assertNoImageDistortion(this, this.imgElement, this.renderer);
      }
      assertValidLoadingInput(this);
      if (!this.ngSrcset) {
        assertNoComplexSizes(this);
      }
      assertNotMissingBuiltInLoader(this.ngSrc, this.imageLoader);
      assertNoNgSrcsetWithoutLoader(this, this.imageLoader);
      assertNoLoaderParamsWithoutLoader(this, this.imageLoader);
      if (this.priority) {
        const checker = this.injector.get(PreconnectLinkChecker);
        checker.assertPreconnect(this.getRewrittenSrc(), this.ngSrc);
      } else {
        if (this.lcpObserver !== null) {
          const ngZone = this.injector.get(NgZone);
          ngZone.runOutsideAngular(() => {
            this.lcpObserver.registerImage(this.getRewrittenSrc(), this.ngSrc);
          });
        }
      }
    }
    this.setHostAttributes();
  }
  setHostAttributes() {
    if (this.fill) {
      if (!this.sizes) {
        this.sizes = "100vw";
      }
      this.renderer.setStyle(this.imgElement, "position", "absolute");
      this.renderer.setStyle(this.imgElement, "width", "100%");
      this.renderer.setStyle(this.imgElement, "height", "100%");
      this.renderer.setStyle(this.imgElement, "inset", "0px");
    } else {
      this.setHostAttribute("width", this.width.toString());
      this.setHostAttribute("height", this.height.toString());
    }
    this.setHostAttribute("loading", this.getLoadingBehavior());
    this.setHostAttribute("fetchpriority", this.getFetchPriority());
    this.setHostAttribute("ng-img", "true");
    const rewrittenSrc = this.getRewrittenSrc();
    this.setHostAttribute("src", rewrittenSrc);
    let rewrittenSrcset = void 0;
    if (this.sizes) {
      this.setHostAttribute("sizes", this.sizes);
    }
    if (this.ngSrcset) {
      rewrittenSrcset = this.getRewrittenSrcset();
    } else if (this.shouldGenerateAutomaticSrcset()) {
      rewrittenSrcset = this.getAutomaticSrcset();
    }
    if (rewrittenSrcset) {
      this.setHostAttribute("srcset", rewrittenSrcset);
    }
    if (isPlatformServer(this.platformId) && this.priority) {
      this.preloadLinkChecker.createPreloadLinkTag(this.renderer, rewrittenSrc, rewrittenSrcset, this.sizes);
    }
  }
  /** @nodoc */
  ngOnChanges(changes) {
    if (ngDevMode) {
      assertNoPostInitInputChange(this, changes, [
        "ngSrc",
        "ngSrcset",
        "width",
        "height",
        "priority",
        "fill",
        "loading",
        "sizes",
        "loaderParams",
        "disableOptimizedSrcset"
      ]);
    }
  }
  callImageLoader(configWithoutCustomParams) {
    let augmentedConfig = configWithoutCustomParams;
    if (this.loaderParams) {
      augmentedConfig.loaderParams = this.loaderParams;
    }
    return this.imageLoader(augmentedConfig);
  }
  getLoadingBehavior() {
    if (!this.priority && this.loading !== void 0) {
      return this.loading;
    }
    return this.priority ? "eager" : "lazy";
  }
  getFetchPriority() {
    return this.priority ? "high" : "auto";
  }
  getRewrittenSrc() {
    if (!this._renderedSrc) {
      const imgConfig = { src: this.ngSrc };
      this._renderedSrc = this.callImageLoader(imgConfig);
    }
    return this._renderedSrc;
  }
  getRewrittenSrcset() {
    const widthSrcSet = VALID_WIDTH_DESCRIPTOR_SRCSET.test(this.ngSrcset);
    const finalSrcs = this.ngSrcset.split(",").filter((src) => src !== "").map((srcStr) => {
      srcStr = srcStr.trim();
      const width = widthSrcSet ? parseFloat(srcStr) : parseFloat(srcStr) * this.width;
      return `${this.callImageLoader({ src: this.ngSrc, width })} ${srcStr}`;
    });
    return finalSrcs.join(", ");
  }
  getAutomaticSrcset() {
    if (this.sizes) {
      return this.getResponsiveSrcset();
    } else {
      return this.getFixedSrcset();
    }
  }
  getResponsiveSrcset() {
    const { breakpoints } = this.config;
    let filteredBreakpoints = breakpoints;
    if (this.sizes?.trim() === "100vw") {
      filteredBreakpoints = breakpoints.filter((bp) => bp >= VIEWPORT_BREAKPOINT_CUTOFF);
    }
    const finalSrcs = filteredBreakpoints.map((bp) => `${this.callImageLoader({ src: this.ngSrc, width: bp })} ${bp}w`);
    return finalSrcs.join(", ");
  }
  getFixedSrcset() {
    const finalSrcs = DENSITY_SRCSET_MULTIPLIERS.map((multiplier) => {
      const imgUrl = this.callImageLoader({ src: this.ngSrc, width: this.width * multiplier });
      return `${imgUrl} ${multiplier}x`;
    });
    return finalSrcs.join(", ");
  }
  shouldGenerateAutomaticSrcset() {
    return !this._disableOptimizedSrcset && !this.srcset && this.imageLoader !== noopImageLoader && !(this.width > FIXED_SRCSET_WIDTH_LIMIT || this.height > FIXED_SRCSET_HEIGHT_LIMIT);
  }
  /** @nodoc */
  ngOnDestroy() {
    if (ngDevMode) {
      if (!this.priority && this._renderedSrc !== null && this.lcpObserver !== null) {
        this.lcpObserver.unregisterImage(this._renderedSrc);
      }
    }
  }
  setHostAttribute(name, value) {
    this.renderer.setAttribute(this.imgElement, name, value);
  }
}
NgOptimizedImage.ɵfac = ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "13.4.0", ngImport: i0, type: NgOptimizedImage, deps: [{ token: IMAGE_LOADER }, { token: IMAGE_CONFIG }, { token: Renderer2 }, { token: ElementRef }, { token: Injector }, { token: PLATFORM_ID }, { token: PreloadLinkCreator }], target: FactoryTarget.Directive });
NgOptimizedImage.ɵdir = ɵɵngDeclareDirective({ minVersion: "12.0.0", version: "13.4.0", type: NgOptimizedImage, selector: "img[ngSrc]", inputs: { ngSrc: "ngSrc", ngSrcset: "ngSrcset", sizes: "sizes", width: "width", height: "height", loading: "loading", priority: "priority", loaderParams: "loaderParams", disableOptimizedSrcset: "disableOptimizedSrcset", fill: "fill", src: "src", srcset: "srcset" }, usesOnChanges: true, ngImport: i0 });
ɵɵngDeclareClassMetadata({ type: NgOptimizedImage, decorators: [{
  type: Directive,
  args: [{ selector: "img[ngSrc]" }]
}], ctorParameters: function() {
  return [{ type: void 0, decorators: [{
    type: Inject,
    args: [IMAGE_LOADER]
  }] }, { type: void 0, decorators: [{
    type: Inject,
    args: [IMAGE_CONFIG]
  }] }, { type: Renderer2, decorators: [{
    type: Inject,
    args: [Renderer2]
  }] }, { type: ElementRef, decorators: [{
    type: Inject,
    args: [ElementRef]
  }] }, { type: Injector, decorators: [{
    type: Inject,
    args: [Injector]
  }] }, { type: void 0, decorators: [{
    type: Inject,
    args: [PLATFORM_ID]
  }] }, { type: PreloadLinkCreator, decorators: [{
    type: Inject,
    args: [PreloadLinkCreator]
  }] }];
}, propDecorators: { ngSrc: [{
  type: Input
}], ngSrcset: [{
  type: Input
}], sizes: [{
  type: Input
}], width: [{
  type: Input
}], height: [{
  type: Input
}], loading: [{
  type: Input
}], priority: [{
  type: Input
}], loaderParams: [{
  type: Input
}], disableOptimizedSrcset: [{
  type: Input
}], fill: [{
  type: Input
}], src: [{
  type: Input
}], srcset: [{
  type: Input
}] } });
function inputToInteger(value) {
  return typeof value === "string" ? parseInt(value, 10) : value;
}
function inputToBoolean(value) {
  return value != null && `${value}` !== "false";
}
function processConfig(config2) {
  let sortedBreakpoints = {};
  if (config2.breakpoints) {
    sortedBreakpoints.breakpoints = config2.breakpoints.sort((a, b) => a - b);
  }
  return Object.assign({}, defaultConfig, config2, sortedBreakpoints);
}
function assertNoConflictingSrc(dir) {
  if (dir.src) {
    throw new RuntimeError(2950, `${imgDirectiveDetails(dir.ngSrc)} both \`src\` and \`ngSrc\` have been set. Supplying both of these attributes breaks lazy loading. The NgOptimizedImage directive sets \`src\` itself based on the value of \`ngSrc\`. To fix this, please remove the \`src\` attribute.`);
  }
}
function assertNoConflictingSrcset(dir) {
  if (dir.srcset) {
    throw new RuntimeError(2951, `${imgDirectiveDetails(dir.ngSrc)} both \`srcset\` and \`ngSrcset\` have been set. Supplying both of these attributes breaks lazy loading. The NgOptimizedImage directive sets \`srcset\` itself based on the value of \`ngSrcset\`. To fix this, please remove the \`srcset\` attribute.`);
  }
}
function assertNotBase64Image(dir) {
  let ngSrc = dir.ngSrc.trim();
  if (ngSrc.startsWith("data:")) {
    if (ngSrc.length > BASE64_IMG_MAX_LENGTH_IN_ERROR) {
      ngSrc = ngSrc.substring(0, BASE64_IMG_MAX_LENGTH_IN_ERROR) + "...";
    }
    throw new RuntimeError(2952, `${imgDirectiveDetails(dir.ngSrc, false)} \`ngSrc\` is a Base64-encoded string (${ngSrc}). NgOptimizedImage does not support Base64-encoded strings. To fix this, disable the NgOptimizedImage directive for this element by removing \`ngSrc\` and using a standard \`src\` attribute instead.`);
  }
}
function assertNoComplexSizes(dir) {
  let sizes = dir.sizes;
  if (sizes?.match(/((\)|,)\s|^)\d+px/)) {
    throw new RuntimeError(2952, `${imgDirectiveDetails(dir.ngSrc, false)} \`sizes\` was set to a string including pixel values. For automatic \`srcset\` generation, \`sizes\` must only include responsive values, such as \`sizes="50vw"\` or \`sizes="(min-width: 768px) 50vw, 100vw"\`. To fix this, modify the \`sizes\` attribute, or provide your own \`ngSrcset\` value directly.`);
  }
}
function assertNotBlobUrl(dir) {
  const ngSrc = dir.ngSrc.trim();
  if (ngSrc.startsWith("blob:")) {
    throw new RuntimeError(2952, `${imgDirectiveDetails(dir.ngSrc)} \`ngSrc\` was set to a blob URL (${ngSrc}). Blob URLs are not supported by the NgOptimizedImage directive. To fix this, disable the NgOptimizedImage directive for this element by removing \`ngSrc\` and using a regular \`src\` attribute instead.`);
  }
}
function assertNonEmptyInput(dir, name, value) {
  const isString = typeof value === "string";
  const isEmptyString = isString && value.trim() === "";
  if (!isString || isEmptyString) {
    throw new RuntimeError(2952, `${imgDirectiveDetails(dir.ngSrc)} \`${name}\` has an invalid value (\`${value}\`). To fix this, change the value to a non-empty string.`);
  }
}
function assertValidNgSrcset(dir, value) {
  if (value == null)
    return;
  assertNonEmptyInput(dir, "ngSrcset", value);
  const stringVal = value;
  const isValidWidthDescriptor = VALID_WIDTH_DESCRIPTOR_SRCSET.test(stringVal);
  const isValidDensityDescriptor = VALID_DENSITY_DESCRIPTOR_SRCSET.test(stringVal);
  if (isValidDensityDescriptor) {
    assertUnderDensityCap(dir, stringVal);
  }
  const isValidSrcset = isValidWidthDescriptor || isValidDensityDescriptor;
  if (!isValidSrcset) {
    throw new RuntimeError(2952, `${imgDirectiveDetails(dir.ngSrc)} \`ngSrcset\` has an invalid value (\`${value}\`). To fix this, supply \`ngSrcset\` using a comma-separated list of one or more width descriptors (e.g. "100w, 200w") or density descriptors (e.g. "1x, 2x").`);
  }
}
function assertUnderDensityCap(dir, value) {
  const underDensityCap = value.split(",").every((num) => num === "" || parseFloat(num) <= ABSOLUTE_SRCSET_DENSITY_CAP);
  if (!underDensityCap) {
    throw new RuntimeError(2952, `${imgDirectiveDetails(dir.ngSrc)} the \`ngSrcset\` contains an unsupported image density:\`${value}\`. NgOptimizedImage generally recommends a max image density of ${RECOMMENDED_SRCSET_DENSITY_CAP}x but supports image densities up to ${ABSOLUTE_SRCSET_DENSITY_CAP}x. The human eye cannot distinguish between image densities greater than ${RECOMMENDED_SRCSET_DENSITY_CAP}x - which makes them unnecessary for most use cases. Images that will be pinch-zoomed are typically the primary use case for ${ABSOLUTE_SRCSET_DENSITY_CAP}x images. Please remove the high density descriptor and try again.`);
  }
}
function postInitInputChangeError(dir, inputName) {
  let reason;
  if (inputName === "width" || inputName === "height") {
    reason = `Changing \`${inputName}\` may result in different attribute value applied to the underlying image element and cause layout shifts on a page.`;
  } else {
    reason = `Changing the \`${inputName}\` would have no effect on the underlying image element, because the resource loading has already occurred.`;
  }
  return new RuntimeError(2953, `${imgDirectiveDetails(dir.ngSrc)} \`${inputName}\` was updated after initialization. The NgOptimizedImage directive will not react to this input change. ${reason} To fix this, either switch \`${inputName}\` to a static value or wrap the image element in an *ngIf that is gated on the necessary value.`);
}
function assertNoPostInitInputChange(dir, changes, inputs) {
  inputs.forEach((input) => {
    const isUpdated = changes.hasOwnProperty(input);
    if (isUpdated && !changes[input].isFirstChange()) {
      if (input === "ngSrc") {
        dir = { ngSrc: changes[input].previousValue };
      }
      throw postInitInputChangeError(dir, input);
    }
  });
}
function assertGreaterThanZero(dir, inputValue, inputName) {
  const validNumber = typeof inputValue === "number" && inputValue > 0;
  const validString = typeof inputValue === "string" && /^\d+$/.test(inputValue.trim()) && parseInt(inputValue) > 0;
  if (!validNumber && !validString) {
    throw new RuntimeError(2952, `${imgDirectiveDetails(dir.ngSrc)} \`${inputName}\` has an invalid value (\`${inputValue}\`). To fix this, provide \`${inputName}\` as a number greater than 0.`);
  }
}
function assertNoImageDistortion(dir, img, renderer) {
  const removeListenerFn = renderer.listen(img, "load", () => {
    removeListenerFn();
    const renderedWidth = img.clientWidth;
    const renderedHeight = img.clientHeight;
    const renderedAspectRatio = renderedWidth / renderedHeight;
    const nonZeroRenderedDimensions = renderedWidth !== 0 && renderedHeight !== 0;
    const intrinsicWidth = img.naturalWidth;
    const intrinsicHeight = img.naturalHeight;
    const intrinsicAspectRatio = intrinsicWidth / intrinsicHeight;
    const suppliedWidth = dir.width;
    const suppliedHeight = dir.height;
    const suppliedAspectRatio = suppliedWidth / suppliedHeight;
    const inaccurateDimensions = Math.abs(suppliedAspectRatio - intrinsicAspectRatio) > ASPECT_RATIO_TOLERANCE;
    const stylingDistortion = nonZeroRenderedDimensions && Math.abs(intrinsicAspectRatio - renderedAspectRatio) > ASPECT_RATIO_TOLERANCE;
    if (inaccurateDimensions) {
      console.warn(formatRuntimeError(2952, `${imgDirectiveDetails(dir.ngSrc)} the aspect ratio of the image does not match the aspect ratio indicated by the width and height attributes. 
Intrinsic image size: ${intrinsicWidth}w x ${intrinsicHeight}h (aspect-ratio: ${intrinsicAspectRatio}). 
Supplied width and height attributes: ${suppliedWidth}w x ${suppliedHeight}h (aspect-ratio: ${suppliedAspectRatio}). 
To fix this, update the width and height attributes.`));
    } else if (stylingDistortion) {
      console.warn(formatRuntimeError(2952, `${imgDirectiveDetails(dir.ngSrc)} the aspect ratio of the rendered image does not match the image's intrinsic aspect ratio. 
Intrinsic image size: ${intrinsicWidth}w x ${intrinsicHeight}h (aspect-ratio: ${intrinsicAspectRatio}). 
Rendered image size: ${renderedWidth}w x ${renderedHeight}h (aspect-ratio: ${renderedAspectRatio}). 
This issue can occur if "width" and "height" attributes are added to an image without updating the corresponding image styling. To fix this, adjust image styling. In most cases, adding "height: auto" or "width: auto" to the image styling will fix this issue.`));
    } else if (!dir.ngSrcset && nonZeroRenderedDimensions) {
      const recommendedWidth = RECOMMENDED_SRCSET_DENSITY_CAP * renderedWidth;
      const recommendedHeight = RECOMMENDED_SRCSET_DENSITY_CAP * renderedHeight;
      const oversizedWidth = intrinsicWidth - recommendedWidth >= OVERSIZED_IMAGE_TOLERANCE;
      const oversizedHeight = intrinsicHeight - recommendedHeight >= OVERSIZED_IMAGE_TOLERANCE;
      if (oversizedWidth || oversizedHeight) {
        console.warn(formatRuntimeError(2960, `${imgDirectiveDetails(dir.ngSrc)} the intrinsic image is significantly larger than necessary. 
Rendered image size: ${renderedWidth}w x ${renderedHeight}h. 
Intrinsic image size: ${intrinsicWidth}w x ${intrinsicHeight}h. 
Recommended intrinsic image size: ${recommendedWidth}w x ${recommendedHeight}h. 
Note: Recommended intrinsic image size is calculated assuming a maximum DPR of ${RECOMMENDED_SRCSET_DENSITY_CAP}. To improve loading time, resize the image or consider using the "ngSrcset" and "sizes" attributes.`));
      }
    }
  });
}
function assertNonEmptyWidthAndHeight(dir) {
  let missingAttributes = [];
  if (dir.width === void 0)
    missingAttributes.push("width");
  if (dir.height === void 0)
    missingAttributes.push("height");
  if (missingAttributes.length > 0) {
    throw new RuntimeError(2954, `${imgDirectiveDetails(dir.ngSrc)} these required attributes are missing: ${missingAttributes.map((attr) => `"${attr}"`).join(", ")}. Including "width" and "height" attributes will prevent image-related layout shifts. To fix this, include "width" and "height" attributes on the image tag or turn on "fill" mode with the \`fill\` attribute.`);
  }
}
function assertEmptyWidthAndHeight(dir) {
  if (dir.width || dir.height) {
    throw new RuntimeError(2952, `${imgDirectiveDetails(dir.ngSrc)} the attributes \`height\` and/or \`width\` are present along with the \`fill\` attribute. Because \`fill\` mode causes an image to fill its containing element, the size attributes have no effect and should be removed.`);
  }
}
function assertNonZeroRenderedHeight(dir, img, renderer) {
  const removeListenerFn = renderer.listen(img, "load", () => {
    removeListenerFn();
    const renderedHeight = img.clientHeight;
    if (dir.fill && renderedHeight === 0) {
      console.warn(formatRuntimeError(2952, `${imgDirectiveDetails(dir.ngSrc)} the height of the fill-mode image is zero. This is likely because the containing element does not have the CSS 'position' property set to one of the following: "relative", "fixed", or "absolute". To fix this problem, make sure the container element has the CSS 'position' property defined and the height of the element is not zero.`));
    }
  });
}
function assertValidLoadingInput(dir) {
  if (dir.loading && dir.priority) {
    throw new RuntimeError(2952, `${imgDirectiveDetails(dir.ngSrc)} the \`loading\` attribute was used on an image that was marked "priority". Setting \`loading\` on priority images is not allowed because these images will always be eagerly loaded. To fix this, remove the “loading” attribute from the priority image.`);
  }
  const validInputs = ["auto", "eager", "lazy"];
  if (typeof dir.loading === "string" && !validInputs.includes(dir.loading)) {
    throw new RuntimeError(2952, `${imgDirectiveDetails(dir.ngSrc)} the \`loading\` attribute has an invalid value (\`${dir.loading}\`). To fix this, provide a valid value ("lazy", "eager", or "auto").`);
  }
}
function assertNotMissingBuiltInLoader(ngSrc, imageLoader) {
  if (imageLoader === noopImageLoader) {
    let builtInLoaderName = "";
    for (const loader of BUILT_IN_LOADERS) {
      if (loader.testUrl(ngSrc)) {
        builtInLoaderName = loader.name;
        break;
      }
    }
    if (builtInLoaderName) {
      console.warn(formatRuntimeError(2962, `NgOptimizedImage: It looks like your images may be hosted on the ${builtInLoaderName} CDN, but your app is not using Angular's built-in loader for that CDN. We recommend switching to use the built-in by calling \`provide${builtInLoaderName}Loader()\` in your \`providers\` and passing it your instance's base URL. If you don't want to use the built-in loader, define a custom loader function using IMAGE_LOADER to silence this warning.`));
    }
  }
}
function assertNoNgSrcsetWithoutLoader(dir, imageLoader) {
  if (dir.ngSrcset && imageLoader === noopImageLoader) {
    console.warn(formatRuntimeError(2963, `${imgDirectiveDetails(dir.ngSrc)} the \`ngSrcset\` attribute is present but no image loader is configured (i.e. the default one is being used), which would result in the same image being used for all configured sizes. To fix this, provide a loader or remove the \`ngSrcset\` attribute from the image.`));
  }
}
function assertNoLoaderParamsWithoutLoader(dir, imageLoader) {
  if (dir.loaderParams && imageLoader === noopImageLoader) {
    console.warn(formatRuntimeError(2963, `${imgDirectiveDetails(dir.ngSrc)} the \`loaderParams\` attribute is present but no image loader is configured (i.e. the default one is being used), which means that the loaderParams data will not be consumed and will not affect the URL. To fix this, provide a custom loader or remove the \`loaderParams\` attribute from the image.`));
  }
}
class NgOptimizedImageModule {
}
NgOptimizedImageModule.ɵfac = ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "13.4.0", ngImport: i0, type: NgOptimizedImageModule, deps: [], target: FactoryTarget.NgModule });
NgOptimizedImageModule.ɵmod = ɵɵngDeclareNgModule({ minVersion: "12.0.0", version: "13.4.0", ngImport: i0, type: NgOptimizedImageModule, declarations: [NgOptimizedImage], exports: [NgOptimizedImage] });
NgOptimizedImageModule.ɵinj = ɵɵngDeclareInjector({ minVersion: "12.0.0", version: "13.4.0", ngImport: i0, type: NgOptimizedImageModule });
ɵɵngDeclareClassMetadata({ type: NgOptimizedImageModule, decorators: [{
  type: NgModule,
  args: [{
    declarations: [NgOptimizedImage],
    exports: [NgOptimizedImage]
  }]
}] });
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
class SwitchView {
  constructor(_viewContainerRef, _templateRef) {
    this._viewContainerRef = _viewContainerRef;
    this._templateRef = _templateRef;
    this._created = false;
  }
  create() {
    this._created = true;
    this._viewContainerRef.createEmbeddedView(this._templateRef);
  }
  destroy() {
    this._created = false;
    this._viewContainerRef.clear();
  }
  enforceState(created) {
    if (created && !this._created) {
      this.create();
    } else if (!created && this._created) {
      this.destroy();
    }
  }
}
class NgSwitch {
  constructor() {
    this._defaultUsed = false;
    this._caseCount = 0;
    this._lastCaseCheckIndex = 0;
    this._lastCasesMatched = false;
  }
  set ngSwitch(newValue) {
    this._ngSwitch = newValue;
    if (this._caseCount === 0) {
      this._updateDefaultCases(true);
    }
  }
  /** @internal */
  _addCase() {
    return this._caseCount++;
  }
  /** @internal */
  _addDefault(view) {
    if (!this._defaultViews) {
      this._defaultViews = [];
    }
    this._defaultViews.push(view);
  }
  /** @internal */
  _matchCase(value) {
    const matched = value == this._ngSwitch;
    this._lastCasesMatched = this._lastCasesMatched || matched;
    this._lastCaseCheckIndex++;
    if (this._lastCaseCheckIndex === this._caseCount) {
      this._updateDefaultCases(!this._lastCasesMatched);
      this._lastCaseCheckIndex = 0;
      this._lastCasesMatched = false;
    }
    return matched;
  }
  _updateDefaultCases(useDefault) {
    if (this._defaultViews && useDefault !== this._defaultUsed) {
      this._defaultUsed = useDefault;
      for (let i = 0; i < this._defaultViews.length; i++) {
        const defaultView = this._defaultViews[i];
        defaultView.enforceState(useDefault);
      }
    }
  }
}
NgSwitch.ɵfac = ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "13.4.0", ngImport: i0, type: NgSwitch, deps: [], target: FactoryTarget.Directive });
NgSwitch.ɵdir = ɵɵngDeclareDirective({ minVersion: "12.0.0", version: "13.4.0", type: NgSwitch, selector: "[ngSwitch]", inputs: { ngSwitch: "ngSwitch" }, ngImport: i0 });
ɵɵngDeclareClassMetadata({ type: NgSwitch, decorators: [{
  type: Directive,
  args: [{ selector: "[ngSwitch]" }]
}], propDecorators: { ngSwitch: [{
  type: Input
}] } });
class NgSwitchCase {
  constructor(viewContainer, templateRef, ngSwitch) {
    this.ngSwitch = ngSwitch;
    if ((typeof ngDevMode === "undefined" || ngDevMode) && !ngSwitch) {
      throwNgSwitchProviderNotFoundError("ngSwitchCase", "NgSwitchCase");
    }
    ngSwitch._addCase();
    this._view = new SwitchView(viewContainer, templateRef);
  }
  /**
   * Performs case matching. For internal use only.
   * @nodoc
   */
  ngDoCheck() {
    this._view.enforceState(this.ngSwitch._matchCase(this.ngSwitchCase));
  }
}
NgSwitchCase.ɵfac = ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "13.4.0", ngImport: i0, type: NgSwitchCase, deps: [{ token: ViewContainerRef }, { token: TemplateRef }, { token: NgSwitch, host: true, optional: true }], target: FactoryTarget.Directive });
NgSwitchCase.ɵdir = ɵɵngDeclareDirective({ minVersion: "12.0.0", version: "13.4.0", type: NgSwitchCase, selector: "[ngSwitchCase]", inputs: { ngSwitchCase: "ngSwitchCase" }, ngImport: i0 });
ɵɵngDeclareClassMetadata({ type: NgSwitchCase, decorators: [{
  type: Directive,
  args: [{ selector: "[ngSwitchCase]" }]
}], ctorParameters: function() {
  return [{ type: ViewContainerRef }, { type: TemplateRef }, { type: NgSwitch, decorators: [{
    type: Optional
  }, {
    type: Host
  }] }];
}, propDecorators: { ngSwitchCase: [{
  type: Input
}] } });
class NgSwitchDefault {
  constructor(viewContainer, templateRef, ngSwitch) {
    if ((typeof ngDevMode === "undefined" || ngDevMode) && !ngSwitch) {
      throwNgSwitchProviderNotFoundError("ngSwitchDefault", "NgSwitchDefault");
    }
    ngSwitch._addDefault(new SwitchView(viewContainer, templateRef));
  }
}
NgSwitchDefault.ɵfac = ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "13.4.0", ngImport: i0, type: NgSwitchDefault, deps: [{ token: ViewContainerRef }, { token: TemplateRef }, { token: NgSwitch, host: true, optional: true }], target: FactoryTarget.Directive });
NgSwitchDefault.ɵdir = ɵɵngDeclareDirective({ minVersion: "12.0.0", version: "13.4.0", type: NgSwitchDefault, selector: "[ngSwitchDefault]", ngImport: i0 });
ɵɵngDeclareClassMetadata({ type: NgSwitchDefault, decorators: [{
  type: Directive,
  args: [{ selector: "[ngSwitchDefault]" }]
}], ctorParameters: function() {
  return [{ type: ViewContainerRef }, { type: TemplateRef }, { type: NgSwitch, decorators: [{
    type: Optional
  }, {
    type: Host
  }] }];
} });
function throwNgSwitchProviderNotFoundError(attrName, directiveName) {
  throw new RuntimeError(2e3, `An element with the "${attrName}" attribute (matching the "${directiveName}" directive) must be located inside an element with the "ngSwitch" attribute (matching "NgSwitch" directive)`);
}
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
class NgPlural {
  constructor(_localization) {
    this._localization = _localization;
    this._caseViews = {};
  }
  set ngPlural(value) {
    this._switchValue = value;
    this._updateView();
  }
  addCase(value, switchView) {
    this._caseViews[value] = switchView;
  }
  _updateView() {
    this._clearViews();
    const cases = Object.keys(this._caseViews);
    const key = getPluralCategory(this._switchValue, cases, this._localization);
    this._activateView(this._caseViews[key]);
  }
  _clearViews() {
    if (this._activeView)
      this._activeView.destroy();
  }
  _activateView(view) {
    if (view) {
      this._activeView = view;
      this._activeView.create();
    }
  }
}
NgPlural.ɵfac = ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "13.4.0", ngImport: i0, type: NgPlural, deps: [{ token: NgLocalization }], target: FactoryTarget.Directive });
NgPlural.ɵdir = ɵɵngDeclareDirective({ minVersion: "12.0.0", version: "13.4.0", type: NgPlural, selector: "[ngPlural]", inputs: { ngPlural: "ngPlural" }, ngImport: i0 });
ɵɵngDeclareClassMetadata({ type: NgPlural, decorators: [{
  type: Directive,
  args: [{ selector: "[ngPlural]" }]
}], ctorParameters: function() {
  return [{ type: NgLocalization }];
}, propDecorators: { ngPlural: [{
  type: Input
}] } });
class NgPluralCase {
  constructor(value, template, viewContainer, ngPlural) {
    this.value = value;
    const isANumber = !isNaN(Number(value));
    ngPlural.addCase(isANumber ? `=${value}` : value, new SwitchView(viewContainer, template));
  }
}
NgPluralCase.ɵfac = ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "13.4.0", ngImport: i0, type: NgPluralCase, deps: [{ token: "ngPluralCase", attribute: true }, { token: TemplateRef }, { token: ViewContainerRef }, { token: NgPlural, host: true }], target: FactoryTarget.Directive });
NgPluralCase.ɵdir = ɵɵngDeclareDirective({ minVersion: "12.0.0", version: "13.4.0", type: NgPluralCase, selector: "[ngPluralCase]", ngImport: i0 });
ɵɵngDeclareClassMetadata({ type: NgPluralCase, decorators: [{
  type: Directive,
  args: [{ selector: "[ngPluralCase]" }]
}], ctorParameters: function() {
  return [{ type: void 0, decorators: [{
    type: Attribute,
    args: ["ngPluralCase"]
  }] }, { type: TemplateRef }, { type: ViewContainerRef }, { type: NgPlural, decorators: [{
    type: Host
  }] }];
} });
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
class NgStyle {
  constructor(_ngEl, _differs, _renderer) {
    this._ngEl = _ngEl;
    this._differs = _differs;
    this._renderer = _renderer;
    this._ngStyle = null;
    this._differ = null;
  }
  set ngStyle(values) {
    this._ngStyle = values;
    if (!this._differ && values) {
      this._differ = this._differs.find(values).create();
    }
  }
  ngDoCheck() {
    if (this._differ) {
      const changes = this._differ.diff(this._ngStyle);
      if (changes) {
        this._applyChanges(changes);
      }
    }
  }
  _setStyle(nameAndUnit, value) {
    const [name, unit] = nameAndUnit.split(".");
    value = value != null && unit ? `${value}${unit}` : value;
    if (value != null) {
      this._renderer.setStyle(this._ngEl.nativeElement, name, value);
    } else {
      this._renderer.removeStyle(this._ngEl.nativeElement, name);
    }
  }
  _applyChanges(changes) {
    changes.forEachRemovedItem((record) => this._setStyle(record.key, null));
    changes.forEachAddedItem((record) => this._setStyle(record.key, record.currentValue));
    changes.forEachChangedItem((record) => this._setStyle(record.key, record.currentValue));
  }
}
NgStyle.ɵfac = ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "13.4.0", ngImport: i0, type: NgStyle, deps: [{ token: ElementRef }, { token: KeyValueDiffers }, { token: Renderer2 }], target: FactoryTarget.Directive });
NgStyle.ɵdir = ɵɵngDeclareDirective({ minVersion: "12.0.0", version: "13.4.0", type: NgStyle, selector: "[ngStyle]", inputs: { ngStyle: "ngStyle" }, ngImport: i0 });
ɵɵngDeclareClassMetadata({ type: NgStyle, decorators: [{
  type: Directive,
  args: [{ selector: "[ngStyle]" }]
}], ctorParameters: function() {
  return [{ type: ElementRef }, { type: KeyValueDiffers }, { type: Renderer2 }];
}, propDecorators: { ngStyle: [{
  type: Input,
  args: ["ngStyle"]
}] } });
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
class NgTemplateOutlet {
  constructor(_viewContainerRef) {
    this._viewContainerRef = _viewContainerRef;
    this._viewRef = null;
    this.ngTemplateOutletContext = null;
    this.ngTemplateOutlet = null;
  }
  /** @nodoc */
  ngOnChanges(changes) {
    if (changes["ngTemplateOutlet"]) {
      const viewContainerRef = this._viewContainerRef;
      if (this._viewRef) {
        viewContainerRef.remove(viewContainerRef.indexOf(this._viewRef));
      }
      this._viewRef = this.ngTemplateOutlet ? viewContainerRef.createEmbeddedView(this.ngTemplateOutlet, this.ngTemplateOutletContext) : null;
    } else if (this._viewRef && changes["ngTemplateOutletContext"] && this.ngTemplateOutletContext) {
      this._viewRef.context = this.ngTemplateOutletContext;
    }
  }
}
NgTemplateOutlet.ɵfac = ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "13.4.0", ngImport: i0, type: NgTemplateOutlet, deps: [{ token: ViewContainerRef }], target: FactoryTarget.Directive });
NgTemplateOutlet.ɵdir = ɵɵngDeclareDirective({ minVersion: "12.0.0", version: "13.4.0", type: NgTemplateOutlet, selector: "[ngTemplateOutlet]", inputs: { ngTemplateOutletContext: "ngTemplateOutletContext", ngTemplateOutlet: "ngTemplateOutlet" }, usesOnChanges: true, ngImport: i0 });
ɵɵngDeclareClassMetadata({ type: NgTemplateOutlet, decorators: [{
  type: Directive,
  args: [{ selector: "[ngTemplateOutlet]" }]
}], ctorParameters: function() {
  return [{ type: ViewContainerRef }];
}, propDecorators: { ngTemplateOutletContext: [{
  type: Input
}], ngTemplateOutlet: [{
  type: Input
}] } });
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
const COMMON_DIRECTIVES = [
  NgClass,
  NgComponentOutlet,
  NgForOf,
  NgIf,
  NgTemplateOutlet,
  NgStyle,
  NgSwitch,
  NgSwitchCase,
  NgSwitchDefault,
  NgPlural,
  NgPluralCase
];
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
function invalidPipeArgumentError(type, value) {
  const errorMessage = typeof ngDevMode === "undefined" || ngDevMode ? `InvalidPipeArgument: '${value}' for pipe '${stringify(type)}'` : "";
  return new RuntimeError(2100, errorMessage);
}
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
class SubscribableStrategy {
  createSubscription(async2, updateLatestValue) {
    return async2.subscribe({
      next: updateLatestValue,
      error: (e) => {
        throw e;
      }
    });
  }
  dispose(subscription) {
    subscription.unsubscribe();
  }
  onDestroy(subscription) {
    subscription.unsubscribe();
  }
}
class PromiseStrategy {
  createSubscription(async2, updateLatestValue) {
    return async2.then(updateLatestValue, (e) => {
      throw e;
    });
  }
  dispose(subscription) {
  }
  onDestroy(subscription) {
  }
}
const _promiseStrategy = new PromiseStrategy();
const _subscribableStrategy = new SubscribableStrategy();
class AsyncPipe {
  constructor(_ref) {
    this._ref = _ref;
    this._latestValue = null;
    this._subscription = null;
    this._obj = null;
    this._strategy = null;
  }
  ngOnDestroy() {
    if (this._subscription) {
      this._dispose();
    }
  }
  transform(obj) {
    if (!this._obj) {
      if (obj) {
        this._subscribe(obj);
      }
      return this._latestValue;
    }
    if (obj !== this._obj) {
      this._dispose();
      return this.transform(obj);
    }
    return this._latestValue;
  }
  _subscribe(obj) {
    this._obj = obj;
    this._strategy = this._selectStrategy(obj);
    this._subscription = this._strategy.createSubscription(obj, (value) => this._updateLatestValue(obj, value));
  }
  _selectStrategy(obj) {
    if (isPromise(obj)) {
      return _promiseStrategy;
    }
    if (isSubscribable(obj)) {
      return _subscribableStrategy;
    }
    throw invalidPipeArgumentError(AsyncPipe, obj);
  }
  _dispose() {
    this._strategy.dispose(this._subscription);
    this._latestValue = null;
    this._subscription = null;
    this._obj = null;
  }
  _updateLatestValue(async2, value) {
    if (async2 === this._obj) {
      this._latestValue = value;
      this._ref.markForCheck();
    }
  }
}
AsyncPipe.ɵfac = ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "13.4.0", ngImport: i0, type: AsyncPipe, deps: [{ token: ChangeDetectorRef }], target: FactoryTarget.Pipe });
AsyncPipe.ɵpipe = ɵɵngDeclarePipe({ minVersion: "12.0.0", version: "13.4.0", ngImport: i0, type: AsyncPipe, name: "async", pure: false });
ɵɵngDeclareClassMetadata({ type: AsyncPipe, decorators: [{
  type: Pipe,
  args: [{ name: "async", pure: false }]
}], ctorParameters: function() {
  return [{ type: ChangeDetectorRef }];
} });
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
class LowerCasePipe {
  transform(value) {
    if (value == null)
      return null;
    if (typeof value !== "string") {
      throw invalidPipeArgumentError(LowerCasePipe, value);
    }
    return value.toLowerCase();
  }
}
LowerCasePipe.ɵfac = ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "13.4.0", ngImport: i0, type: LowerCasePipe, deps: [], target: FactoryTarget.Pipe });
LowerCasePipe.ɵpipe = ɵɵngDeclarePipe({ minVersion: "12.0.0", version: "13.4.0", ngImport: i0, type: LowerCasePipe, name: "lowercase" });
ɵɵngDeclareClassMetadata({ type: LowerCasePipe, decorators: [{
  type: Pipe,
  args: [{ name: "lowercase" }]
}] });
const unicodeWordMatch = /(?:[0-9A-Za-z\xAA\xB5\xBA\xC0-\xD6\xD8-\xF6\xF8-\u02C1\u02C6-\u02D1\u02E0-\u02E4\u02EC\u02EE\u0370-\u0374\u0376\u0377\u037A-\u037D\u037F\u0386\u0388-\u038A\u038C\u038E-\u03A1\u03A3-\u03F5\u03F7-\u0481\u048A-\u052F\u0531-\u0556\u0559\u0560-\u0588\u05D0-\u05EA\u05EF-\u05F2\u0620-\u064A\u066E\u066F\u0671-\u06D3\u06D5\u06E5\u06E6\u06EE\u06EF\u06FA-\u06FC\u06FF\u0710\u0712-\u072F\u074D-\u07A5\u07B1\u07CA-\u07EA\u07F4\u07F5\u07FA\u0800-\u0815\u081A\u0824\u0828\u0840-\u0858\u0860-\u086A\u0870-\u0887\u0889-\u088E\u08A0-\u08C9\u0904-\u0939\u093D\u0950\u0958-\u0961\u0971-\u0980\u0985-\u098C\u098F\u0990\u0993-\u09A8\u09AA-\u09B0\u09B2\u09B6-\u09B9\u09BD\u09CE\u09DC\u09DD\u09DF-\u09E1\u09F0\u09F1\u09FC\u0A05-\u0A0A\u0A0F\u0A10\u0A13-\u0A28\u0A2A-\u0A30\u0A32\u0A33\u0A35\u0A36\u0A38\u0A39\u0A59-\u0A5C\u0A5E\u0A72-\u0A74\u0A85-\u0A8D\u0A8F-\u0A91\u0A93-\u0AA8\u0AAA-\u0AB0\u0AB2\u0AB3\u0AB5-\u0AB9\u0ABD\u0AD0\u0AE0\u0AE1\u0AF9\u0B05-\u0B0C\u0B0F\u0B10\u0B13-\u0B28\u0B2A-\u0B30\u0B32\u0B33\u0B35-\u0B39\u0B3D\u0B5C\u0B5D\u0B5F-\u0B61\u0B71\u0B83\u0B85-\u0B8A\u0B8E-\u0B90\u0B92-\u0B95\u0B99\u0B9A\u0B9C\u0B9E\u0B9F\u0BA3\u0BA4\u0BA8-\u0BAA\u0BAE-\u0BB9\u0BD0\u0C05-\u0C0C\u0C0E-\u0C10\u0C12-\u0C28\u0C2A-\u0C39\u0C3D\u0C58-\u0C5A\u0C5D\u0C60\u0C61\u0C80\u0C85-\u0C8C\u0C8E-\u0C90\u0C92-\u0CA8\u0CAA-\u0CB3\u0CB5-\u0CB9\u0CBD\u0CDD\u0CDE\u0CE0\u0CE1\u0CF1\u0CF2\u0D04-\u0D0C\u0D0E-\u0D10\u0D12-\u0D3A\u0D3D\u0D4E\u0D54-\u0D56\u0D5F-\u0D61\u0D7A-\u0D7F\u0D85-\u0D96\u0D9A-\u0DB1\u0DB3-\u0DBB\u0DBD\u0DC0-\u0DC6\u0E01-\u0E30\u0E32\u0E33\u0E40-\u0E46\u0E81\u0E82\u0E84\u0E86-\u0E8A\u0E8C-\u0EA3\u0EA5\u0EA7-\u0EB0\u0EB2\u0EB3\u0EBD\u0EC0-\u0EC4\u0EC6\u0EDC-\u0EDF\u0F00\u0F40-\u0F47\u0F49-\u0F6C\u0F88-\u0F8C\u1000-\u102A\u103F\u1050-\u1055\u105A-\u105D\u1061\u1065\u1066\u106E-\u1070\u1075-\u1081\u108E\u10A0-\u10C5\u10C7\u10CD\u10D0-\u10FA\u10FC-\u1248\u124A-\u124D\u1250-\u1256\u1258\u125A-\u125D\u1260-\u1288\u128A-\u128D\u1290-\u12B0\u12B2-\u12B5\u12B8-\u12BE\u12C0\u12C2-\u12C5\u12C8-\u12D6\u12D8-\u1310\u1312-\u1315\u1318-\u135A\u1380-\u138F\u13A0-\u13F5\u13F8-\u13FD\u1401-\u166C\u166F-\u167F\u1681-\u169A\u16A0-\u16EA\u16F1-\u16F8\u1700-\u1711\u171F-\u1731\u1740-\u1751\u1760-\u176C\u176E-\u1770\u1780-\u17B3\u17D7\u17DC\u1820-\u1878\u1880-\u1884\u1887-\u18A8\u18AA\u18B0-\u18F5\u1900-\u191E\u1950-\u196D\u1970-\u1974\u1980-\u19AB\u19B0-\u19C9\u1A00-\u1A16\u1A20-\u1A54\u1AA7\u1B05-\u1B33\u1B45-\u1B4C\u1B83-\u1BA0\u1BAE\u1BAF\u1BBA-\u1BE5\u1C00-\u1C23\u1C4D-\u1C4F\u1C5A-\u1C7D\u1C80-\u1C88\u1C90-\u1CBA\u1CBD-\u1CBF\u1CE9-\u1CEC\u1CEE-\u1CF3\u1CF5\u1CF6\u1CFA\u1D00-\u1DBF\u1E00-\u1F15\u1F18-\u1F1D\u1F20-\u1F45\u1F48-\u1F4D\u1F50-\u1F57\u1F59\u1F5B\u1F5D\u1F5F-\u1F7D\u1F80-\u1FB4\u1FB6-\u1FBC\u1FBE\u1FC2-\u1FC4\u1FC6-\u1FCC\u1FD0-\u1FD3\u1FD6-\u1FDB\u1FE0-\u1FEC\u1FF2-\u1FF4\u1FF6-\u1FFC\u2071\u207F\u2090-\u209C\u2102\u2107\u210A-\u2113\u2115\u2119-\u211D\u2124\u2126\u2128\u212A-\u212D\u212F-\u2139\u213C-\u213F\u2145-\u2149\u214E\u2183\u2184\u2C00-\u2CE4\u2CEB-\u2CEE\u2CF2\u2CF3\u2D00-\u2D25\u2D27\u2D2D\u2D30-\u2D67\u2D6F\u2D80-\u2D96\u2DA0-\u2DA6\u2DA8-\u2DAE\u2DB0-\u2DB6\u2DB8-\u2DBE\u2DC0-\u2DC6\u2DC8-\u2DCE\u2DD0-\u2DD6\u2DD8-\u2DDE\u2E2F\u3005\u3006\u3031-\u3035\u303B\u303C\u3041-\u3096\u309D-\u309F\u30A1-\u30FA\u30FC-\u30FF\u3105-\u312F\u3131-\u318E\u31A0-\u31BF\u31F0-\u31FF\u3400-\u4DBF\u4E00-\uA48C\uA4D0-\uA4FD\uA500-\uA60C\uA610-\uA61F\uA62A\uA62B\uA640-\uA66E\uA67F-\uA69D\uA6A0-\uA6E5\uA717-\uA71F\uA722-\uA788\uA78B-\uA7CA\uA7D0\uA7D1\uA7D3\uA7D5-\uA7D9\uA7F2-\uA801\uA803-\uA805\uA807-\uA80A\uA80C-\uA822\uA840-\uA873\uA882-\uA8B3\uA8F2-\uA8F7\uA8FB\uA8FD\uA8FE\uA90A-\uA925\uA930-\uA946\uA960-\uA97C\uA984-\uA9B2\uA9CF\uA9E0-\uA9E4\uA9E6-\uA9EF\uA9FA-\uA9FE\uAA00-\uAA28\uAA40-\uAA42\uAA44-\uAA4B\uAA60-\uAA76\uAA7A\uAA7E-\uAAAF\uAAB1\uAAB5\uAAB6\uAAB9-\uAABD\uAAC0\uAAC2\uAADB-\uAADD\uAAE0-\uAAEA\uAAF2-\uAAF4\uAB01-\uAB06\uAB09-\uAB0E\uAB11-\uAB16\uAB20-\uAB26\uAB28-\uAB2E\uAB30-\uAB5A\uAB5C-\uAB69\uAB70-\uABE2\uAC00-\uD7A3\uD7B0-\uD7C6\uD7CB-\uD7FB\uF900-\uFA6D\uFA70-\uFAD9\uFB00-\uFB06\uFB13-\uFB17\uFB1D\uFB1F-\uFB28\uFB2A-\uFB36\uFB38-\uFB3C\uFB3E\uFB40\uFB41\uFB43\uFB44\uFB46-\uFBB1\uFBD3-\uFD3D\uFD50-\uFD8F\uFD92-\uFDC7\uFDF0-\uFDFB\uFE70-\uFE74\uFE76-\uFEFC\uFF21-\uFF3A\uFF41-\uFF5A\uFF66-\uFFBE\uFFC2-\uFFC7\uFFCA-\uFFCF\uFFD2-\uFFD7\uFFDA-\uFFDC]|\uD800[\uDC00-\uDC0B\uDC0D-\uDC26\uDC28-\uDC3A\uDC3C\uDC3D\uDC3F-\uDC4D\uDC50-\uDC5D\uDC80-\uDCFA\uDE80-\uDE9C\uDEA0-\uDED0\uDF00-\uDF1F\uDF2D-\uDF40\uDF42-\uDF49\uDF50-\uDF75\uDF80-\uDF9D\uDFA0-\uDFC3\uDFC8-\uDFCF]|\uD801[\uDC00-\uDC9D\uDCB0-\uDCD3\uDCD8-\uDCFB\uDD00-\uDD27\uDD30-\uDD63\uDD70-\uDD7A\uDD7C-\uDD8A\uDD8C-\uDD92\uDD94\uDD95\uDD97-\uDDA1\uDDA3-\uDDB1\uDDB3-\uDDB9\uDDBB\uDDBC\uDE00-\uDF36\uDF40-\uDF55\uDF60-\uDF67\uDF80-\uDF85\uDF87-\uDFB0\uDFB2-\uDFBA]|\uD802[\uDC00-\uDC05\uDC08\uDC0A-\uDC35\uDC37\uDC38\uDC3C\uDC3F-\uDC55\uDC60-\uDC76\uDC80-\uDC9E\uDCE0-\uDCF2\uDCF4\uDCF5\uDD00-\uDD15\uDD20-\uDD39\uDD80-\uDDB7\uDDBE\uDDBF\uDE00\uDE10-\uDE13\uDE15-\uDE17\uDE19-\uDE35\uDE60-\uDE7C\uDE80-\uDE9C\uDEC0-\uDEC7\uDEC9-\uDEE4\uDF00-\uDF35\uDF40-\uDF55\uDF60-\uDF72\uDF80-\uDF91]|\uD803[\uDC00-\uDC48\uDC80-\uDCB2\uDCC0-\uDCF2\uDD00-\uDD23\uDE80-\uDEA9\uDEB0\uDEB1\uDF00-\uDF1C\uDF27\uDF30-\uDF45\uDF70-\uDF81\uDFB0-\uDFC4\uDFE0-\uDFF6]|\uD804[\uDC03-\uDC37\uDC71\uDC72\uDC75\uDC83-\uDCAF\uDCD0-\uDCE8\uDD03-\uDD26\uDD44\uDD47\uDD50-\uDD72\uDD76\uDD83-\uDDB2\uDDC1-\uDDC4\uDDDA\uDDDC\uDE00-\uDE11\uDE13-\uDE2B\uDE80-\uDE86\uDE88\uDE8A-\uDE8D\uDE8F-\uDE9D\uDE9F-\uDEA8\uDEB0-\uDEDE\uDF05-\uDF0C\uDF0F\uDF10\uDF13-\uDF28\uDF2A-\uDF30\uDF32\uDF33\uDF35-\uDF39\uDF3D\uDF50\uDF5D-\uDF61]|\uD805[\uDC00-\uDC34\uDC47-\uDC4A\uDC5F-\uDC61\uDC80-\uDCAF\uDCC4\uDCC5\uDCC7\uDD80-\uDDAE\uDDD8-\uDDDB\uDE00-\uDE2F\uDE44\uDE80-\uDEAA\uDEB8\uDF00-\uDF1A\uDF40-\uDF46]|\uD806[\uDC00-\uDC2B\uDCA0-\uDCDF\uDCFF-\uDD06\uDD09\uDD0C-\uDD13\uDD15\uDD16\uDD18-\uDD2F\uDD3F\uDD41\uDDA0-\uDDA7\uDDAA-\uDDD0\uDDE1\uDDE3\uDE00\uDE0B-\uDE32\uDE3A\uDE50\uDE5C-\uDE89\uDE9D\uDEB0-\uDEF8]|\uD807[\uDC00-\uDC08\uDC0A-\uDC2E\uDC40\uDC72-\uDC8F\uDD00-\uDD06\uDD08\uDD09\uDD0B-\uDD30\uDD46\uDD60-\uDD65\uDD67\uDD68\uDD6A-\uDD89\uDD98\uDEE0-\uDEF2\uDFB0]|\uD808[\uDC00-\uDF99]|\uD809[\uDC80-\uDD43]|\uD80B[\uDF90-\uDFF0]|[\uD80C\uD81C-\uD820\uD822\uD840-\uD868\uD86A-\uD86C\uD86F-\uD872\uD874-\uD879\uD880-\uD883][\uDC00-\uDFFF]|\uD80D[\uDC00-\uDC2E]|\uD811[\uDC00-\uDE46]|\uD81A[\uDC00-\uDE38\uDE40-\uDE5E\uDE70-\uDEBE\uDED0-\uDEED\uDF00-\uDF2F\uDF40-\uDF43\uDF63-\uDF77\uDF7D-\uDF8F]|\uD81B[\uDE40-\uDE7F\uDF00-\uDF4A\uDF50\uDF93-\uDF9F\uDFE0\uDFE1\uDFE3]|\uD821[\uDC00-\uDFF7]|\uD823[\uDC00-\uDCD5\uDD00-\uDD08]|\uD82B[\uDFF0-\uDFF3\uDFF5-\uDFFB\uDFFD\uDFFE]|\uD82C[\uDC00-\uDD22\uDD50-\uDD52\uDD64-\uDD67\uDD70-\uDEFB]|\uD82F[\uDC00-\uDC6A\uDC70-\uDC7C\uDC80-\uDC88\uDC90-\uDC99]|\uD835[\uDC00-\uDC54\uDC56-\uDC9C\uDC9E\uDC9F\uDCA2\uDCA5\uDCA6\uDCA9-\uDCAC\uDCAE-\uDCB9\uDCBB\uDCBD-\uDCC3\uDCC5-\uDD05\uDD07-\uDD0A\uDD0D-\uDD14\uDD16-\uDD1C\uDD1E-\uDD39\uDD3B-\uDD3E\uDD40-\uDD44\uDD46\uDD4A-\uDD50\uDD52-\uDEA5\uDEA8-\uDEC0\uDEC2-\uDEDA\uDEDC-\uDEFA\uDEFC-\uDF14\uDF16-\uDF34\uDF36-\uDF4E\uDF50-\uDF6E\uDF70-\uDF88\uDF8A-\uDFA8\uDFAA-\uDFC2\uDFC4-\uDFCB]|\uD837[\uDF00-\uDF1E]|\uD838[\uDD00-\uDD2C\uDD37-\uDD3D\uDD4E\uDE90-\uDEAD\uDEC0-\uDEEB]|\uD839[\uDFE0-\uDFE6\uDFE8-\uDFEB\uDFED\uDFEE\uDFF0-\uDFFE]|\uD83A[\uDC00-\uDCC4\uDD00-\uDD43\uDD4B]|\uD83B[\uDE00-\uDE03\uDE05-\uDE1F\uDE21\uDE22\uDE24\uDE27\uDE29-\uDE32\uDE34-\uDE37\uDE39\uDE3B\uDE42\uDE47\uDE49\uDE4B\uDE4D-\uDE4F\uDE51\uDE52\uDE54\uDE57\uDE59\uDE5B\uDE5D\uDE5F\uDE61\uDE62\uDE64\uDE67-\uDE6A\uDE6C-\uDE72\uDE74-\uDE77\uDE79-\uDE7C\uDE7E\uDE80-\uDE89\uDE8B-\uDE9B\uDEA1-\uDEA3\uDEA5-\uDEA9\uDEAB-\uDEBB]|\uD869[\uDC00-\uDEDF\uDF00-\uDFFF]|\uD86D[\uDC00-\uDF38\uDF40-\uDFFF]|\uD86E[\uDC00-\uDC1D\uDC20-\uDFFF]|\uD873[\uDC00-\uDEA1\uDEB0-\uDFFF]|\uD87A[\uDC00-\uDFE0]|\uD87E[\uDC00-\uDE1D]|\uD884[\uDC00-\uDF4A])\S*/g;
class TitleCasePipe {
  transform(value) {
    if (value == null)
      return null;
    if (typeof value !== "string") {
      throw invalidPipeArgumentError(TitleCasePipe, value);
    }
    return value.replace(unicodeWordMatch, ((txt) => txt[0].toUpperCase() + txt.substr(1).toLowerCase()));
  }
}
TitleCasePipe.ɵfac = ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "13.4.0", ngImport: i0, type: TitleCasePipe, deps: [], target: FactoryTarget.Pipe });
TitleCasePipe.ɵpipe = ɵɵngDeclarePipe({ minVersion: "12.0.0", version: "13.4.0", ngImport: i0, type: TitleCasePipe, name: "titlecase" });
ɵɵngDeclareClassMetadata({ type: TitleCasePipe, decorators: [{
  type: Pipe,
  args: [{ name: "titlecase" }]
}] });
class UpperCasePipe {
  transform(value) {
    if (value == null)
      return null;
    if (typeof value !== "string") {
      throw invalidPipeArgumentError(UpperCasePipe, value);
    }
    return value.toUpperCase();
  }
}
UpperCasePipe.ɵfac = ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "13.4.0", ngImport: i0, type: UpperCasePipe, deps: [], target: FactoryTarget.Pipe });
UpperCasePipe.ɵpipe = ɵɵngDeclarePipe({ minVersion: "12.0.0", version: "13.4.0", ngImport: i0, type: UpperCasePipe, name: "uppercase" });
ɵɵngDeclareClassMetadata({ type: UpperCasePipe, decorators: [{
  type: Pipe,
  args: [{ name: "uppercase" }]
}] });
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
const DATE_PIPE_DEFAULT_TIMEZONE = new InjectionToken("DATE_PIPE_DEFAULT_TIMEZONE");
class DatePipe {
  constructor(locale, defaultTimezone) {
    this.locale = locale;
    this.defaultTimezone = defaultTimezone;
  }
  transform(value, format = "mediumDate", timezone, locale) {
    if (value == null || value === "" || value !== value)
      return null;
    try {
      return formatDate(value, format, locale || this.locale, timezone ?? this.defaultTimezone ?? void 0);
    } catch (error) {
      throw invalidPipeArgumentError(DatePipe, error.message);
    }
  }
}
DatePipe.ɵfac = ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "13.4.0", ngImport: i0, type: DatePipe, deps: [{ token: LOCALE_ID }, { token: DATE_PIPE_DEFAULT_TIMEZONE, optional: true }], target: FactoryTarget.Pipe });
DatePipe.ɵpipe = ɵɵngDeclarePipe({ minVersion: "12.0.0", version: "13.4.0", ngImport: i0, type: DatePipe, name: "date" });
ɵɵngDeclareClassMetadata({ type: DatePipe, decorators: [{
  type: Pipe,
  args: [{ name: "date", pure: true }]
}], ctorParameters: function() {
  return [{ type: void 0, decorators: [{
    type: Inject,
    args: [LOCALE_ID]
  }] }, { type: void 0, decorators: [{
    type: Inject,
    args: [DATE_PIPE_DEFAULT_TIMEZONE]
  }, {
    type: Optional
  }] }];
} });
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
const _INTERPOLATION_REGEXP = /#/g;
class I18nPluralPipe {
  constructor(_localization) {
    this._localization = _localization;
  }
  /**
   * @param value the number to be formatted
   * @param pluralMap an object that mimics the ICU format, see
   * http://userguide.icu-project.org/formatparse/messages.
   * @param locale a `string` defining the locale to use (uses the current {@link LOCALE_ID} by
   * default).
   */
  transform(value, pluralMap, locale) {
    if (value == null)
      return "";
    if (typeof pluralMap !== "object" || pluralMap === null) {
      throw invalidPipeArgumentError(I18nPluralPipe, pluralMap);
    }
    const key = getPluralCategory(value, Object.keys(pluralMap), this._localization, locale);
    return pluralMap[key].replace(_INTERPOLATION_REGEXP, value.toString());
  }
}
I18nPluralPipe.ɵfac = ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "13.4.0", ngImport: i0, type: I18nPluralPipe, deps: [{ token: NgLocalization }], target: FactoryTarget.Pipe });
I18nPluralPipe.ɵpipe = ɵɵngDeclarePipe({ minVersion: "12.0.0", version: "13.4.0", ngImport: i0, type: I18nPluralPipe, name: "i18nPlural" });
ɵɵngDeclareClassMetadata({ type: I18nPluralPipe, decorators: [{
  type: Pipe,
  args: [{ name: "i18nPlural", pure: true }]
}], ctorParameters: function() {
  return [{ type: NgLocalization }];
} });
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
class I18nSelectPipe {
  /**
   * @param value a string to be internationalized.
   * @param mapping an object that indicates the text that should be displayed
   * for different values of the provided `value`.
   */
  transform(value, mapping) {
    if (value == null)
      return "";
    if (typeof mapping !== "object" || typeof value !== "string") {
      throw invalidPipeArgumentError(I18nSelectPipe, mapping);
    }
    if (mapping.hasOwnProperty(value)) {
      return mapping[value];
    }
    if (mapping.hasOwnProperty("other")) {
      return mapping["other"];
    }
    return "";
  }
}
I18nSelectPipe.ɵfac = ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "13.4.0", ngImport: i0, type: I18nSelectPipe, deps: [], target: FactoryTarget.Pipe });
I18nSelectPipe.ɵpipe = ɵɵngDeclarePipe({ minVersion: "12.0.0", version: "13.4.0", ngImport: i0, type: I18nSelectPipe, name: "i18nSelect" });
ɵɵngDeclareClassMetadata({ type: I18nSelectPipe, decorators: [{
  type: Pipe,
  args: [{ name: "i18nSelect", pure: true }]
}] });
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
class JsonPipe {
  /**
   * @param value A value of any type to convert into a JSON-format string.
   */
  transform(value) {
    return JSON.stringify(value, null, 2);
  }
}
JsonPipe.ɵfac = ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "13.4.0", ngImport: i0, type: JsonPipe, deps: [], target: FactoryTarget.Pipe });
JsonPipe.ɵpipe = ɵɵngDeclarePipe({ minVersion: "12.0.0", version: "13.4.0", ngImport: i0, type: JsonPipe, name: "json", pure: false });
ɵɵngDeclareClassMetadata({ type: JsonPipe, decorators: [{
  type: Pipe,
  args: [{ name: "json", pure: false }]
}] });
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
function makeKeyValuePair(key, value) {
  return { key, value };
}
class KeyValuePipe {
  constructor(differs) {
    this.differs = differs;
    this.keyValues = [];
    this.compareFn = defaultComparator;
  }
  transform(input, compareFn = defaultComparator) {
    if (!input || !(input instanceof Map) && typeof input !== "object") {
      return null;
    }
    if (!this.differ) {
      this.differ = this.differs.find(input).create();
    }
    const differChanges = this.differ.diff(input);
    const compareFnChanged = compareFn !== this.compareFn;
    if (differChanges) {
      this.keyValues = [];
      differChanges.forEachItem((r) => {
        this.keyValues.push(makeKeyValuePair(r.key, r.currentValue));
      });
    }
    if (differChanges || compareFnChanged) {
      this.keyValues.sort(compareFn);
      this.compareFn = compareFn;
    }
    return this.keyValues;
  }
}
KeyValuePipe.ɵfac = ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "13.4.0", ngImport: i0, type: KeyValuePipe, deps: [{ token: KeyValueDiffers }], target: FactoryTarget.Pipe });
KeyValuePipe.ɵpipe = ɵɵngDeclarePipe({ minVersion: "12.0.0", version: "13.4.0", ngImport: i0, type: KeyValuePipe, name: "keyvalue", pure: false });
ɵɵngDeclareClassMetadata({ type: KeyValuePipe, decorators: [{
  type: Pipe,
  args: [{ name: "keyvalue", pure: false }]
}], ctorParameters: function() {
  return [{ type: KeyValueDiffers }];
} });
function defaultComparator(keyValueA, keyValueB) {
  const a = keyValueA.key;
  const b = keyValueB.key;
  if (a === b)
    return 0;
  if (a === void 0)
    return 1;
  if (b === void 0)
    return -1;
  if (a === null)
    return 1;
  if (b === null)
    return -1;
  if (typeof a == "string" && typeof b == "string") {
    return a < b ? -1 : 1;
  }
  if (typeof a == "number" && typeof b == "number") {
    return a - b;
  }
  if (typeof a == "boolean" && typeof b == "boolean") {
    return a < b ? -1 : 1;
  }
  const aString = String(a);
  const bString = String(b);
  return aString == bString ? 0 : aString < bString ? -1 : 1;
}
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
class DecimalPipe {
  constructor(_locale) {
    this._locale = _locale;
  }
  /**
   * @param value The value to be formatted.
   * @param digitsInfo Sets digit and decimal representation.
   * [See more](#digitsinfo).
   * @param locale Specifies what locale format rules to use.
   * [See more](#locale).
   */
  transform(value, digitsInfo, locale) {
    if (!isValue(value))
      return null;
    locale = locale || this._locale;
    try {
      const num = strToNumber(value);
      return formatNumber(num, locale, digitsInfo);
    } catch (error) {
      throw invalidPipeArgumentError(DecimalPipe, error.message);
    }
  }
}
DecimalPipe.ɵfac = ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "13.4.0", ngImport: i0, type: DecimalPipe, deps: [{ token: LOCALE_ID }], target: FactoryTarget.Pipe });
DecimalPipe.ɵpipe = ɵɵngDeclarePipe({ minVersion: "12.0.0", version: "13.4.0", ngImport: i0, type: DecimalPipe, name: "number" });
ɵɵngDeclareClassMetadata({ type: DecimalPipe, decorators: [{
  type: Pipe,
  args: [{ name: "number" }]
}], ctorParameters: function() {
  return [{ type: void 0, decorators: [{
    type: Inject,
    args: [LOCALE_ID]
  }] }];
} });
class PercentPipe {
  constructor(_locale) {
    this._locale = _locale;
  }
  /**
   *
   * @param value The number to be formatted as a percentage.
   * @param digitsInfo Decimal representation options, specified by a string
   * in the following format:<br>
   * <code>{minIntegerDigits}.{minFractionDigits}-{maxFractionDigits}</code>.
   *   - `minIntegerDigits`: The minimum number of integer digits before the decimal point.
   * Default is `1`.
   *   - `minFractionDigits`: The minimum number of digits after the decimal point.
   * Default is `0`.
   *   - `maxFractionDigits`: The maximum number of digits after the decimal point.
   * Default is `0`.
   * @param locale A locale code for the locale format rules to use.
   * When not supplied, uses the value of `LOCALE_ID`, which is `en-US` by default.
   * See [Setting your app locale](guide/i18n-common-locale-id).
   */
  transform(value, digitsInfo, locale) {
    if (!isValue(value))
      return null;
    locale = locale || this._locale;
    try {
      const num = strToNumber(value);
      return formatPercent(num, locale, digitsInfo);
    } catch (error) {
      throw invalidPipeArgumentError(PercentPipe, error.message);
    }
  }
}
PercentPipe.ɵfac = ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "13.4.0", ngImport: i0, type: PercentPipe, deps: [{ token: LOCALE_ID }], target: FactoryTarget.Pipe });
PercentPipe.ɵpipe = ɵɵngDeclarePipe({ minVersion: "12.0.0", version: "13.4.0", ngImport: i0, type: PercentPipe, name: "percent" });
ɵɵngDeclareClassMetadata({ type: PercentPipe, decorators: [{
  type: Pipe,
  args: [{ name: "percent" }]
}], ctorParameters: function() {
  return [{ type: void 0, decorators: [{
    type: Inject,
    args: [LOCALE_ID]
  }] }];
} });
class CurrencyPipe {
  constructor(_locale, _defaultCurrencyCode = "USD") {
    this._locale = _locale;
    this._defaultCurrencyCode = _defaultCurrencyCode;
  }
  /**
   *
   * @param value The number to be formatted as currency.
   * @param currencyCode The [ISO 4217](https://en.wikipedia.org/wiki/ISO_4217) currency code,
   * such as `USD` for the US dollar and `EUR` for the euro. The default currency code can be
   * configured using the `DEFAULT_CURRENCY_CODE` injection token.
   * @param display The format for the currency indicator. One of the following:
   *   - `code`: Show the code (such as `USD`).
   *   - `symbol`(default): Show the symbol (such as `$`).
   *   - `symbol-narrow`: Use the narrow symbol for locales that have two symbols for their
   * currency.
   * For example, the Canadian dollar CAD has the symbol `CA$` and the symbol-narrow `$`. If the
   * locale has no narrow symbol, uses the standard symbol for the locale.
   *   - String: Use the given string value instead of a code or a symbol.
   * For example, an empty string will suppress the currency & symbol.
   *   - Boolean (marked deprecated in v5): `true` for symbol and false for `code`.
   *
   * @param digitsInfo Decimal representation options, specified by a string
   * in the following format:<br>
   * <code>{minIntegerDigits}.{minFractionDigits}-{maxFractionDigits}</code>.
   *   - `minIntegerDigits`: The minimum number of integer digits before the decimal point.
   * Default is `1`.
   *   - `minFractionDigits`: The minimum number of digits after the decimal point.
   * Default is `2`.
   *   - `maxFractionDigits`: The maximum number of digits after the decimal point.
   * Default is `2`.
   * If not provided, the number will be formatted with the proper amount of digits,
   * depending on what the [ISO 4217](https://en.wikipedia.org/wiki/ISO_4217) specifies.
   * For example, the Canadian dollar has 2 digits, whereas the Chilean peso has none.
   * @param locale A locale code for the locale format rules to use.
   * When not supplied, uses the value of `LOCALE_ID`, which is `en-US` by default.
   * See [Setting your app locale](guide/i18n-common-locale-id).
   */
  transform(value, currencyCode = this._defaultCurrencyCode, display = "symbol", digitsInfo, locale) {
    if (!isValue(value))
      return null;
    locale = locale || this._locale;
    if (typeof display === "boolean") {
      if ((typeof ngDevMode === "undefined" || ngDevMode) && console && console.warn) {
        console.warn(`Warning: the currency pipe has been changed in Angular v5. The symbolDisplay option (third parameter) is now a string instead of a boolean. The accepted values are "code", "symbol" or "symbol-narrow".`);
      }
      display = display ? "symbol" : "code";
    }
    let currency = currencyCode || this._defaultCurrencyCode;
    if (display !== "code") {
      if (display === "symbol" || display === "symbol-narrow") {
        currency = getCurrencySymbol(currency, display === "symbol" ? "wide" : "narrow", locale);
      } else {
        currency = display;
      }
    }
    try {
      const num = strToNumber(value);
      return formatCurrency(num, locale, currency, currencyCode, digitsInfo);
    } catch (error) {
      throw invalidPipeArgumentError(CurrencyPipe, error.message);
    }
  }
}
CurrencyPipe.ɵfac = ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "13.4.0", ngImport: i0, type: CurrencyPipe, deps: [{ token: LOCALE_ID }, { token: DEFAULT_CURRENCY_CODE }], target: FactoryTarget.Pipe });
CurrencyPipe.ɵpipe = ɵɵngDeclarePipe({ minVersion: "12.0.0", version: "13.4.0", ngImport: i0, type: CurrencyPipe, name: "currency" });
ɵɵngDeclareClassMetadata({ type: CurrencyPipe, decorators: [{
  type: Pipe,
  args: [{ name: "currency" }]
}], ctorParameters: function() {
  return [{ type: void 0, decorators: [{
    type: Inject,
    args: [LOCALE_ID]
  }] }, { type: void 0, decorators: [{
    type: Inject,
    args: [DEFAULT_CURRENCY_CODE]
  }] }];
} });
function isValue(value) {
  return !(value == null || value === "" || value !== value);
}
function strToNumber(value) {
  if (typeof value === "string" && !isNaN(Number(value) - parseFloat(value))) {
    return Number(value);
  }
  if (typeof value !== "number") {
    throw new Error(`${value} is not a number`);
  }
  return value;
}
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
class SlicePipe {
  transform(value, start, end) {
    if (value == null)
      return null;
    if (!this.supports(value)) {
      throw invalidPipeArgumentError(SlicePipe, value);
    }
    return value.slice(start, end);
  }
  supports(obj) {
    return typeof obj === "string" || Array.isArray(obj);
  }
}
SlicePipe.ɵfac = ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "13.4.0", ngImport: i0, type: SlicePipe, deps: [], target: FactoryTarget.Pipe });
SlicePipe.ɵpipe = ɵɵngDeclarePipe({ minVersion: "12.0.0", version: "13.4.0", ngImport: i0, type: SlicePipe, name: "slice", pure: false });
ɵɵngDeclareClassMetadata({ type: SlicePipe, decorators: [{
  type: Pipe,
  args: [{ name: "slice", pure: false }]
}] });
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
const COMMON_PIPES = [
  AsyncPipe,
  UpperCasePipe,
  LowerCasePipe,
  JsonPipe,
  SlicePipe,
  DecimalPipe,
  PercentPipe,
  TitleCasePipe,
  CurrencyPipe,
  DatePipe,
  I18nPluralPipe,
  I18nSelectPipe,
  KeyValuePipe
];
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
class CommonModule {
}
CommonModule.ɵfac = ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "13.4.0", ngImport: i0, type: CommonModule, deps: [], target: FactoryTarget.NgModule });
CommonModule.ɵmod = ɵɵngDeclareNgModule({ minVersion: "12.0.0", version: "13.4.0", ngImport: i0, type: CommonModule, declarations: [NgClass, NgComponentOutlet, NgForOf, NgIf, NgTemplateOutlet, NgStyle, NgSwitch, NgSwitchCase, NgSwitchDefault, NgPlural, NgPluralCase, AsyncPipe, UpperCasePipe, LowerCasePipe, JsonPipe, SlicePipe, DecimalPipe, PercentPipe, TitleCasePipe, CurrencyPipe, DatePipe, I18nPluralPipe, I18nSelectPipe, KeyValuePipe], exports: [NgClass, NgComponentOutlet, NgForOf, NgIf, NgTemplateOutlet, NgStyle, NgSwitch, NgSwitchCase, NgSwitchDefault, NgPlural, NgPluralCase, AsyncPipe, UpperCasePipe, LowerCasePipe, JsonPipe, SlicePipe, DecimalPipe, PercentPipe, TitleCasePipe, CurrencyPipe, DatePipe, I18nPluralPipe, I18nSelectPipe, KeyValuePipe] });
CommonModule.ɵinj = ɵɵngDeclareInjector({ minVersion: "12.0.0", version: "13.4.0", ngImport: i0, type: CommonModule });
ɵɵngDeclareClassMetadata({ type: CommonModule, decorators: [{
  type: NgModule,
  args: [{
    declarations: [COMMON_DIRECTIVES, COMMON_PIPES],
    exports: [COMMON_DIRECTIVES, COMMON_PIPES]
  }]
}] });
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
new Version("13.4.0");
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
class ViewportScroller {
}
ViewportScroller.ɵprov = ɵɵdefineInjectable({
  token: ViewportScroller,
  providedIn: "root",
  factory: () => new BrowserViewportScroller(ɵɵinject(DOCUMENT), window)
});
class BrowserViewportScroller {
  constructor(document2, window2) {
    this.document = document2;
    this.window = window2;
    this.offset = () => [0, 0];
  }
  /**
   * Configures the top offset used when scrolling to an anchor.
   * @param offset A position in screen coordinates (a tuple with x and y values)
   * or a function that returns the top offset position.
   *
   */
  setOffset(offset) {
    if (Array.isArray(offset)) {
      this.offset = () => offset;
    } else {
      this.offset = offset;
    }
  }
  /**
   * Retrieves the current scroll position.
   * @returns The position in screen coordinates.
   */
  getScrollPosition() {
    if (this.supportsScrolling()) {
      return [this.window.pageXOffset, this.window.pageYOffset];
    } else {
      return [0, 0];
    }
  }
  /**
   * Sets the scroll position.
   * @param position The new position in screen coordinates.
   */
  scrollToPosition(position) {
    if (this.supportsScrolling()) {
      this.window.scrollTo(position[0], position[1]);
    }
  }
  /**
   * Scrolls to an element and attempts to focus the element.
   *
   * Note that the function name here is misleading in that the target string may be an ID for a
   * non-anchor element.
   *
   * @param target The ID of an element or name of the anchor.
   *
   * @see https://html.spec.whatwg.org/#the-indicated-part-of-the-document
   * @see https://html.spec.whatwg.org/#scroll-to-fragid
   */
  scrollToAnchor(target) {
    if (!this.supportsScrolling()) {
      return;
    }
    const elSelected = findAnchorFromDocument(this.document, target);
    if (elSelected) {
      this.scrollToElement(elSelected);
      elSelected.focus();
    }
  }
  /**
   * Disables automatic scroll restoration provided by the browser.
   */
  setHistoryScrollRestoration(scrollRestoration) {
    if (this.supportScrollRestoration()) {
      const history = this.window.history;
      if (history && history.scrollRestoration) {
        history.scrollRestoration = scrollRestoration;
      }
    }
  }
  /**
   * Scrolls to an element using the native offset and the specified offset set on this scroller.
   *
   * The offset can be used when we know that there is a floating header and scrolling naively to an
   * element (ex: `scrollIntoView`) leaves the element hidden behind the floating header.
   */
  scrollToElement(el) {
    const rect = el.getBoundingClientRect();
    const left = rect.left + this.window.pageXOffset;
    const top = rect.top + this.window.pageYOffset;
    const offset = this.offset();
    this.window.scrollTo(left - offset[0], top - offset[1]);
  }
  /**
   * We only support scroll restoration when we can get a hold of window.
   * This means that we do not support this behavior when running in a web worker.
   *
   * Lifting this restriction right now would require more changes in the dom adapter.
   * Since webworkers aren't widely used, we will lift it once RouterScroller is
   * battle-tested.
   */
  supportScrollRestoration() {
    try {
      if (!this.supportsScrolling()) {
        return false;
      }
      const scrollRestorationDescriptor = getScrollRestorationProperty(this.window.history) || getScrollRestorationProperty(Object.getPrototypeOf(this.window.history));
      return !!scrollRestorationDescriptor && !!(scrollRestorationDescriptor.writable || scrollRestorationDescriptor.set);
    } catch {
      return false;
    }
  }
  supportsScrolling() {
    try {
      return !!this.window && !!this.window.scrollTo && "pageXOffset" in this.window;
    } catch {
      return false;
    }
  }
}
function getScrollRestorationProperty(obj) {
  return Object.getOwnPropertyDescriptor(obj, "scrollRestoration");
}
function findAnchorFromDocument(document2, target) {
  const documentResult = document2.getElementById(target) || document2.getElementsByName(target)[0];
  if (documentResult) {
    return documentResult;
  }
  if (typeof document2.createTreeWalker === "function" && document2.body && (document2.body.createShadowRoot || document2.body.attachShadow)) {
    const treeWalker = document2.createTreeWalker(document2.body, NodeFilter.SHOW_ELEMENT);
    let currentNode = treeWalker.currentNode;
    while (currentNode) {
      const shadowRoot = currentNode.shadowRoot;
      if (shadowRoot) {
        const result = shadowRoot.getElementById(target) || shadowRoot.querySelector(`[name="${target}"]`);
        if (result) {
          return result;
        }
      }
      currentNode = treeWalker.nextNode();
    }
  }
  return null;
}
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
class XhrFactory {
}
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
createImageLoader(createCloudflareUrl, ngDevMode ? ["https://<ZONE>/cdn-cgi/image/<OPTIONS>/<SOURCE-IMAGE>"] : void 0);
function createCloudflareUrl(path, config2) {
  let params = `format=auto`;
  if (config2.width) {
    params += `,width=${config2.width}`;
  }
  return `${path}/cdn-cgi/image/${params}/${config2.src}`;
}
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
class GenericBrowserDomAdapter extends DomAdapter {
  constructor() {
    super(...arguments);
    this.supportsDOMEvents = true;
  }
}
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
class BrowserDomAdapter extends GenericBrowserDomAdapter {
  static makeCurrent() {
    setRootDomAdapter(new BrowserDomAdapter());
  }
  onAndCancel(el, evt, listener) {
    el.addEventListener(evt, listener, false);
    return () => {
      el.removeEventListener(evt, listener, false);
    };
  }
  dispatchEvent(el, evt) {
    el.dispatchEvent(evt);
  }
  remove(node) {
    if (node.parentNode) {
      node.parentNode.removeChild(node);
    }
  }
  createElement(tagName, doc) {
    doc = doc || this.getDefaultDocument();
    return doc.createElement(tagName);
  }
  createHtmlDocument() {
    return document.implementation.createHTMLDocument("fakeTitle");
  }
  getDefaultDocument() {
    return document;
  }
  isElementNode(node) {
    return node.nodeType === Node.ELEMENT_NODE;
  }
  isShadowRoot(node) {
    return node instanceof DocumentFragment;
  }
  /** @deprecated No longer being used in Ivy code. To be removed in version 14. */
  getGlobalEventTarget(doc, target) {
    if (target === "window") {
      return window;
    }
    if (target === "document") {
      return doc;
    }
    if (target === "body") {
      return doc.body;
    }
    return null;
  }
  getBaseHref(doc) {
    const href = getBaseElementHref();
    return href == null ? null : relativePath(href);
  }
  resetBaseElement() {
    baseElement = null;
  }
  getUserAgent() {
    return window.navigator.userAgent;
  }
  getCookie(name) {
    return parseCookieValue(document.cookie, name);
  }
}
let baseElement = null;
function getBaseElementHref() {
  baseElement = baseElement || document.querySelector("base");
  return baseElement ? baseElement.getAttribute("href") : null;
}
let urlParsingNode;
function relativePath(url) {
  urlParsingNode = urlParsingNode || document.createElement("a");
  urlParsingNode.setAttribute("href", url);
  const pathName = urlParsingNode.pathname;
  return pathName.charAt(0) === "/" ? pathName : `/${pathName}`;
}
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
const TRANSITION_ID = new InjectionToken("TRANSITION_ID");
function appInitializerFactory(transitionId, document2, injector) {
  return () => {
    injector.get(ApplicationInitStatus).donePromise.then(() => {
      const dom = getDOM();
      const styles = document2.querySelectorAll(`style[ng-transition="${transitionId}"]`);
      for (let i = 0; i < styles.length; i++) {
        dom.remove(styles[i]);
      }
    });
  };
}
const SERVER_TRANSITION_PROVIDERS = [
  {
    provide: APP_INITIALIZER,
    useFactory: appInitializerFactory,
    deps: [TRANSITION_ID, DOCUMENT, Injector],
    multi: true
  }
];
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
class BrowserGetTestability {
  static init() {
    setTestabilityGetter(new BrowserGetTestability());
  }
  addToWindow(registry) {
    _global["getAngularTestability"] = (elem, findInAncestors = true) => {
      const testability = registry.findTestabilityInTree(elem, findInAncestors);
      if (testability == null) {
        throw new Error("Could not find testability for element.");
      }
      return testability;
    };
    _global["getAllAngularTestabilities"] = () => registry.getAllTestabilities();
    _global["getAllAngularRootElements"] = () => registry.getAllRootElements();
    const whenAllStable = (callback) => {
      const testabilities = _global["getAllAngularTestabilities"]();
      let count = testabilities.length;
      let didWork = false;
      const decrement = function(didWork_) {
        didWork = didWork || didWork_;
        count--;
        if (count == 0) {
          callback(didWork);
        }
      };
      testabilities.forEach(function(testability) {
        testability.whenStable(decrement);
      });
    };
    if (!_global["frameworkStabilizers"]) {
      _global["frameworkStabilizers"] = [];
    }
    _global["frameworkStabilizers"].push(whenAllStable);
  }
  findTestabilityInTree(registry, elem, findInAncestors) {
    if (elem == null) {
      return null;
    }
    const t = registry.getTestability(elem);
    if (t != null) {
      return t;
    } else if (!findInAncestors) {
      return null;
    }
    if (getDOM().isShadowRoot(elem)) {
      return this.findTestabilityInTree(registry, elem.host, true);
    }
    return this.findTestabilityInTree(registry, elem.parentElement, true);
  }
}
class BrowserXhr {
  build() {
    return new XMLHttpRequest();
  }
}
BrowserXhr.ɵfac = ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "13.4.0", ngImport: i0, type: BrowserXhr, deps: [], target: FactoryTarget.Injectable });
BrowserXhr.ɵprov = ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "13.4.0", ngImport: i0, type: BrowserXhr });
ɵɵngDeclareClassMetadata({ type: BrowserXhr, decorators: [{
  type: Injectable
}] });
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
const EVENT_MANAGER_PLUGINS = new InjectionToken("EventManagerPlugins");
class EventManager {
  /**
   * Initializes an instance of the event-manager service.
   */
  constructor(plugins, _zone) {
    this._zone = _zone;
    this._eventNameToPlugin = /* @__PURE__ */ new Map();
    plugins.forEach((p) => p.manager = this);
    this._plugins = plugins.slice().reverse();
  }
  /**
   * Registers a handler for a specific element and event.
   *
   * @param element The HTML element to receive event notifications.
   * @param eventName The name of the event to listen for.
   * @param handler A function to call when the notification occurs. Receives the
   * event object as an argument.
   * @returns  A callback function that can be used to remove the handler.
   */
  addEventListener(element, eventName, handler) {
    const plugin = this._findPluginFor(eventName);
    return plugin.addEventListener(element, eventName, handler);
  }
  /**
   * Registers a global handler for an event in a target view.
   *
   * @param target A target for global event notifications. One of "window", "document", or "body".
   * @param eventName The name of the event to listen for.
   * @param handler A function to call when the notification occurs. Receives the
   * event object as an argument.
   * @returns A callback function that can be used to remove the handler.
   * @deprecated No longer being used in Ivy code. To be removed in version 14.
   */
  addGlobalEventListener(target, eventName, handler) {
    const plugin = this._findPluginFor(eventName);
    return plugin.addGlobalEventListener(target, eventName, handler);
  }
  /**
   * Retrieves the compilation zone in which event listeners are registered.
   */
  getZone() {
    return this._zone;
  }
  /** @internal */
  _findPluginFor(eventName) {
    const plugin = this._eventNameToPlugin.get(eventName);
    if (plugin) {
      return plugin;
    }
    const plugins = this._plugins;
    for (let i = 0; i < plugins.length; i++) {
      const plugin2 = plugins[i];
      if (plugin2.supports(eventName)) {
        this._eventNameToPlugin.set(eventName, plugin2);
        return plugin2;
      }
    }
    throw new Error(`No event manager plugin found for event ${eventName}`);
  }
}
EventManager.ɵfac = ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "13.4.0", ngImport: i0, type: EventManager, deps: [{ token: EVENT_MANAGER_PLUGINS }, { token: NgZone }], target: FactoryTarget.Injectable });
EventManager.ɵprov = ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "13.4.0", ngImport: i0, type: EventManager });
ɵɵngDeclareClassMetadata({ type: EventManager, decorators: [{
  type: Injectable
}], ctorParameters: function() {
  return [{ type: void 0, decorators: [{
    type: Inject,
    args: [EVENT_MANAGER_PLUGINS]
  }] }, { type: NgZone }];
} });
class EventManagerPlugin {
  constructor(_doc) {
    this._doc = _doc;
  }
  addGlobalEventListener(element, eventName, handler) {
    const target = getDOM().getGlobalEventTarget(this._doc, element);
    if (!target) {
      throw new Error(`Unsupported event target ${target} for event ${eventName}`);
    }
    return this.addEventListener(target, eventName, handler);
  }
}
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
class SharedStylesHost {
  constructor() {
    this._stylesSet = /* @__PURE__ */ new Set();
  }
  addStyles(styles) {
    const additions = /* @__PURE__ */ new Set();
    styles.forEach((style) => {
      if (!this._stylesSet.has(style)) {
        this._stylesSet.add(style);
        additions.add(style);
      }
    });
    this.onStylesAdded(additions);
  }
  onStylesAdded(additions) {
  }
  getAllStyles() {
    return Array.from(this._stylesSet);
  }
}
SharedStylesHost.ɵfac = ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "13.4.0", ngImport: i0, type: SharedStylesHost, deps: [], target: FactoryTarget.Injectable });
SharedStylesHost.ɵprov = ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "13.4.0", ngImport: i0, type: SharedStylesHost });
ɵɵngDeclareClassMetadata({ type: SharedStylesHost, decorators: [{
  type: Injectable
}] });
class DomSharedStylesHost extends SharedStylesHost {
  constructor(_doc) {
    super();
    this._doc = _doc;
    this._hostNodes = /* @__PURE__ */ new Map();
    this._hostNodes.set(_doc.head, []);
  }
  _addStylesToHost(styles, host, styleNodes) {
    styles.forEach((style) => {
      const styleEl = this._doc.createElement("style");
      styleEl.textContent = style;
      styleNodes.push(host.appendChild(styleEl));
    });
  }
  addHost(hostNode) {
    const styleNodes = [];
    this._addStylesToHost(this._stylesSet, hostNode, styleNodes);
    this._hostNodes.set(hostNode, styleNodes);
  }
  removeHost(hostNode) {
    const styleNodes = this._hostNodes.get(hostNode);
    if (styleNodes) {
      styleNodes.forEach(removeStyle);
    }
    this._hostNodes.delete(hostNode);
  }
  onStylesAdded(additions) {
    this._hostNodes.forEach((styleNodes, hostNode) => {
      this._addStylesToHost(additions, hostNode, styleNodes);
    });
  }
  ngOnDestroy() {
    this._hostNodes.forEach((styleNodes) => styleNodes.forEach(removeStyle));
  }
}
DomSharedStylesHost.ɵfac = ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "13.4.0", ngImport: i0, type: DomSharedStylesHost, deps: [{ token: DOCUMENT }], target: FactoryTarget.Injectable });
DomSharedStylesHost.ɵprov = ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "13.4.0", ngImport: i0, type: DomSharedStylesHost });
ɵɵngDeclareClassMetadata({ type: DomSharedStylesHost, decorators: [{
  type: Injectable
}], ctorParameters: function() {
  return [{ type: void 0, decorators: [{
    type: Inject,
    args: [DOCUMENT]
  }] }];
} });
function removeStyle(styleNode) {
  getDOM().remove(styleNode);
}
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
const NAMESPACE_URIS = {
  "svg": "http://www.w3.org/2000/svg",
  "xhtml": "http://www.w3.org/1999/xhtml",
  "xlink": "http://www.w3.org/1999/xlink",
  "xml": "http://www.w3.org/XML/1998/namespace",
  "xmlns": "http://www.w3.org/2000/xmlns/",
  "math": "http://www.w3.org/1998/MathML/"
};
const COMPONENT_REGEX = /%COMP%/g;
const NG_DEV_MODE = typeof ngDevMode === "undefined" || !!ngDevMode;
const COMPONENT_VARIABLE = "%COMP%";
const HOST_ATTR = `_nghost-${COMPONENT_VARIABLE}`;
const CONTENT_ATTR = `_ngcontent-${COMPONENT_VARIABLE}`;
function shimContentAttribute(componentShortId) {
  return CONTENT_ATTR.replace(COMPONENT_REGEX, componentShortId);
}
function shimHostAttribute(componentShortId) {
  return HOST_ATTR.replace(COMPONENT_REGEX, componentShortId);
}
function flattenStyles(compId, styles, target) {
  for (let i = 0; i < styles.length; i++) {
    let style = styles[i];
    if (Array.isArray(style)) {
      flattenStyles(compId, style, target);
    } else {
      style = style.replace(COMPONENT_REGEX, compId);
      target.push(style);
    }
  }
  return target;
}
function decoratePreventDefault(eventHandler) {
  return (event) => {
    if (event === "__ngUnwrap__") {
      return eventHandler;
    }
    const allowDefaultBehavior = eventHandler(event);
    if (allowDefaultBehavior === false) {
      event.preventDefault();
      event.returnValue = false;
    }
    return void 0;
  };
}
let hasLoggedNativeEncapsulationWarning = false;
class DomRendererFactory2 {
  constructor(eventManager, sharedStylesHost, appId) {
    this.eventManager = eventManager;
    this.sharedStylesHost = sharedStylesHost;
    this.appId = appId;
    this.rendererByCompId = /* @__PURE__ */ new Map();
    this.defaultRenderer = new DefaultDomRenderer2(eventManager);
  }
  createRenderer(element, type) {
    if (!element || !type) {
      return this.defaultRenderer;
    }
    switch (type.encapsulation) {
      case ViewEncapsulation$1.Emulated: {
        let renderer = this.rendererByCompId.get(type.id);
        if (!renderer) {
          renderer = new EmulatedEncapsulationDomRenderer2(this.eventManager, this.sharedStylesHost, type, this.appId);
          this.rendererByCompId.set(type.id, renderer);
        }
        renderer.applyToHost(element);
        return renderer;
      }
      // @ts-ignore TODO: Remove as part of FW-2290. TS complains about us dealing with an enum
      // value that is not known (but previously was the value for ViewEncapsulation.Native)
      case 1:
      case ViewEncapsulation$1.ShadowDom:
        if ((typeof ngDevMode === "undefined" || ngDevMode) && // @ts-ignore TODO: Remove as part of FW-2290. TS complains about us dealing with an
        // enum value that is not known (but previously was the value for
        // ViewEncapsulation.Native)
        !hasLoggedNativeEncapsulationWarning && type.encapsulation === 1) {
          hasLoggedNativeEncapsulationWarning = true;
          console.warn("ViewEncapsulation.Native is no longer supported. Falling back to ViewEncapsulation.ShadowDom. The fallback will be removed in v12.");
        }
        return new ShadowDomRenderer(this.eventManager, this.sharedStylesHost, element, type);
      default: {
        if (!this.rendererByCompId.has(type.id)) {
          const styles = flattenStyles(type.id, type.styles, []);
          this.sharedStylesHost.addStyles(styles);
          this.rendererByCompId.set(type.id, this.defaultRenderer);
        }
        return this.defaultRenderer;
      }
    }
  }
  begin() {
  }
  end() {
  }
}
DomRendererFactory2.ɵfac = ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "13.4.0", ngImport: i0, type: DomRendererFactory2, deps: [{ token: EventManager }, { token: DomSharedStylesHost }, { token: APP_ID }], target: FactoryTarget.Injectable });
DomRendererFactory2.ɵprov = ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "13.4.0", ngImport: i0, type: DomRendererFactory2 });
ɵɵngDeclareClassMetadata({ type: DomRendererFactory2, decorators: [{
  type: Injectable
}], ctorParameters: function() {
  return [{ type: EventManager }, { type: DomSharedStylesHost }, { type: void 0, decorators: [{
    type: Inject,
    args: [APP_ID]
  }] }];
} });
class DefaultDomRenderer2 {
  constructor(eventManager) {
    this.eventManager = eventManager;
    this.data = /* @__PURE__ */ Object.create(null);
    this.destroyNode = null;
  }
  destroy() {
  }
  createElement(name, namespace) {
    if (namespace) {
      return document.createElementNS(NAMESPACE_URIS[namespace] || namespace, name);
    }
    return document.createElement(name);
  }
  createComment(value) {
    return document.createComment(value);
  }
  createText(value) {
    return document.createTextNode(value);
  }
  appendChild(parent, newChild) {
    parent.appendChild(newChild);
  }
  insertBefore(parent, newChild, refChild) {
    if (parent) {
      parent.insertBefore(newChild, refChild);
    }
  }
  removeChild(parent, oldChild) {
    if (parent) {
      parent.removeChild(oldChild);
    }
  }
  selectRootElement(selectorOrNode, preserveContent) {
    let el = typeof selectorOrNode === "string" ? document.querySelector(selectorOrNode) : selectorOrNode;
    if (!el) {
      throw new Error(`The selector "${selectorOrNode}" did not match any elements`);
    }
    if (!preserveContent) {
      el.textContent = "";
    }
    return el;
  }
  parentNode(node) {
    return node.parentNode;
  }
  nextSibling(node) {
    return node.nextSibling;
  }
  setAttribute(el, name, value, namespace) {
    if (namespace) {
      name = namespace + ":" + name;
      const namespaceUri = NAMESPACE_URIS[namespace];
      if (namespaceUri) {
        el.setAttributeNS(namespaceUri, name, value);
      } else {
        el.setAttribute(name, value);
      }
    } else {
      el.setAttribute(name, value);
    }
  }
  removeAttribute(el, name, namespace) {
    if (namespace) {
      const namespaceUri = NAMESPACE_URIS[namespace];
      if (namespaceUri) {
        el.removeAttributeNS(namespaceUri, name);
      } else {
        el.removeAttribute(`${namespace}:${name}`);
      }
    } else {
      el.removeAttribute(name);
    }
  }
  addClass(el, name) {
    el.classList.add(name);
  }
  removeClass(el, name) {
    el.classList.remove(name);
  }
  setStyle(el, style, value, flags) {
    if (flags & (RendererStyleFlags2.DashCase | RendererStyleFlags2.Important)) {
      el.style.setProperty(style, value, flags & RendererStyleFlags2.Important ? "important" : "");
    } else {
      el.style[style] = value;
    }
  }
  removeStyle(el, style, flags) {
    if (flags & RendererStyleFlags2.DashCase) {
      el.style.removeProperty(style);
    } else {
      el.style[style] = "";
    }
  }
  setProperty(el, name, value) {
    NG_DEV_MODE && checkNoSyntheticProp(name, "property");
    el[name] = value;
  }
  setValue(node, value) {
    node.nodeValue = value;
  }
  listen(target, event, callback) {
    NG_DEV_MODE && checkNoSyntheticProp(event, "listener");
    if (typeof target === "string") {
      return this.eventManager.addGlobalEventListener(target, event, decoratePreventDefault(callback));
    }
    return this.eventManager.addEventListener(target, event, decoratePreventDefault(callback));
  }
}
const AT_CHARCODE = (() => "@".charCodeAt(0))();
function checkNoSyntheticProp(name, nameKind) {
  if (name.charCodeAt(0) === AT_CHARCODE) {
    throw new Error(`Unexpected synthetic ${nameKind} ${name} found. Please make sure that:
  - Either \`BrowserAnimationsModule\` or \`NoopAnimationsModule\` are imported in your application.
  - There is corresponding configuration for the animation named \`${name}\` defined in the \`animations\` field of the \`@Component\` decorator (see https://angular.io/api/core/Component#animations).`);
  }
}
class EmulatedEncapsulationDomRenderer2 extends DefaultDomRenderer2 {
  constructor(eventManager, sharedStylesHost, component, appId) {
    super(eventManager);
    this.component = component;
    const styles = flattenStyles(appId + "-" + component.id, component.styles, []);
    sharedStylesHost.addStyles(styles);
    this.contentAttr = shimContentAttribute(appId + "-" + component.id);
    this.hostAttr = shimHostAttribute(appId + "-" + component.id);
  }
  applyToHost(element) {
    super.setAttribute(element, this.hostAttr, "");
  }
  createElement(parent, name) {
    const el = super.createElement(parent, name);
    super.setAttribute(el, this.contentAttr, "");
    return el;
  }
}
class ShadowDomRenderer extends DefaultDomRenderer2 {
  constructor(eventManager, sharedStylesHost, hostEl, component) {
    super(eventManager);
    this.sharedStylesHost = sharedStylesHost;
    this.hostEl = hostEl;
    this.shadowRoot = hostEl.attachShadow({ mode: "open" });
    this.sharedStylesHost.addHost(this.shadowRoot);
    const styles = flattenStyles(component.id, component.styles, []);
    for (let i = 0; i < styles.length; i++) {
      const styleEl = document.createElement("style");
      styleEl.textContent = styles[i];
      this.shadowRoot.appendChild(styleEl);
    }
  }
  nodeOrShadowRoot(node) {
    return node === this.hostEl ? this.shadowRoot : node;
  }
  destroy() {
    this.sharedStylesHost.removeHost(this.shadowRoot);
  }
  appendChild(parent, newChild) {
    return super.appendChild(this.nodeOrShadowRoot(parent), newChild);
  }
  insertBefore(parent, newChild, refChild) {
    return super.insertBefore(this.nodeOrShadowRoot(parent), newChild, refChild);
  }
  removeChild(parent, oldChild) {
    return super.removeChild(this.nodeOrShadowRoot(parent), oldChild);
  }
  parentNode(node) {
    return this.nodeOrShadowRoot(super.parentNode(this.nodeOrShadowRoot(node)));
  }
}
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
class DomEventsPlugin extends EventManagerPlugin {
  constructor(doc) {
    super(doc);
  }
  // This plugin should come last in the list of plugins, because it accepts all
  // events.
  supports(eventName) {
    return true;
  }
  addEventListener(element, eventName, handler) {
    element.addEventListener(eventName, handler, false);
    return () => this.removeEventListener(element, eventName, handler);
  }
  removeEventListener(target, eventName, callback) {
    return target.removeEventListener(eventName, callback);
  }
}
DomEventsPlugin.ɵfac = ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "13.4.0", ngImport: i0, type: DomEventsPlugin, deps: [{ token: DOCUMENT }], target: FactoryTarget.Injectable });
DomEventsPlugin.ɵprov = ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "13.4.0", ngImport: i0, type: DomEventsPlugin });
ɵɵngDeclareClassMetadata({ type: DomEventsPlugin, decorators: [{
  type: Injectable
}], ctorParameters: function() {
  return [{ type: void 0, decorators: [{
    type: Inject,
    args: [DOCUMENT]
  }] }];
} });
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
const MODIFIER_KEYS = ["alt", "control", "meta", "shift"];
const DOM_KEY_LOCATION_NUMPAD = 3;
const _keyMap = {
  // The following values are here for cross-browser compatibility and to match the W3C standard
  // cf https://www.w3.org/TR/DOM-Level-3-Events-key/
  "\b": "Backspace",
  "	": "Tab",
  "": "Delete",
  "\x1B": "Escape",
  "Del": "Delete",
  "Esc": "Escape",
  "Left": "ArrowLeft",
  "Right": "ArrowRight",
  "Up": "ArrowUp",
  "Down": "ArrowDown",
  "Menu": "ContextMenu",
  "Scroll": "ScrollLock",
  "Win": "OS"
};
const _chromeNumKeyPadMap = {
  "A": "1",
  "B": "2",
  "C": "3",
  "D": "4",
  "E": "5",
  "F": "6",
  "G": "7",
  "H": "8",
  "I": "9",
  "J": "*",
  "K": "+",
  "M": "-",
  "N": ".",
  "O": "/",
  "`": "0",
  "": "NumLock"
};
const MODIFIER_KEY_GETTERS = {
  "alt": (event) => event.altKey,
  "control": (event) => event.ctrlKey,
  "meta": (event) => event.metaKey,
  "shift": (event) => event.shiftKey
};
class KeyEventsPlugin extends EventManagerPlugin {
  /**
   * Initializes an instance of the browser plug-in.
   * @param doc The document in which key events will be detected.
   */
  constructor(doc) {
    super(doc);
  }
  /**
   * Reports whether a named key event is supported.
   * @param eventName The event name to query.
   * @return True if the named key event is supported.
   */
  supports(eventName) {
    return KeyEventsPlugin.parseEventName(eventName) != null;
  }
  /**
   * Registers a handler for a specific element and key event.
   * @param element The HTML element to receive event notifications.
   * @param eventName The name of the key event to listen for.
   * @param handler A function to call when the notification occurs. Receives the
   * event object as an argument.
   * @returns The key event that was registered.
   */
  addEventListener(element, eventName, handler) {
    const parsedEvent = KeyEventsPlugin.parseEventName(eventName);
    const outsideHandler = KeyEventsPlugin.eventCallback(parsedEvent["fullKey"], handler, this.manager.getZone());
    return this.manager.getZone().runOutsideAngular(() => {
      return getDOM().onAndCancel(element, parsedEvent["domEventName"], outsideHandler);
    });
  }
  static parseEventName(eventName) {
    const parts = eventName.toLowerCase().split(".");
    const domEventName = parts.shift();
    if (parts.length === 0 || !(domEventName === "keydown" || domEventName === "keyup")) {
      return null;
    }
    const key = KeyEventsPlugin._normalizeKey(parts.pop());
    let fullKey = "";
    MODIFIER_KEYS.forEach((modifierName) => {
      const index = parts.indexOf(modifierName);
      if (index > -1) {
        parts.splice(index, 1);
        fullKey += modifierName + ".";
      }
    });
    fullKey += key;
    if (parts.length != 0 || key.length === 0) {
      return null;
    }
    const result = {};
    result["domEventName"] = domEventName;
    result["fullKey"] = fullKey;
    return result;
  }
  static getEventFullKey(event) {
    let fullKey = "";
    let key = getEventKey(event);
    key = key.toLowerCase();
    if (key === " ") {
      key = "space";
    } else if (key === ".") {
      key = "dot";
    }
    MODIFIER_KEYS.forEach((modifierName) => {
      if (modifierName != key) {
        const modifierGetter = MODIFIER_KEY_GETTERS[modifierName];
        if (modifierGetter(event)) {
          fullKey += modifierName + ".";
        }
      }
    });
    fullKey += key;
    return fullKey;
  }
  /**
   * Configures a handler callback for a key event.
   * @param fullKey The event name that combines all simultaneous keystrokes.
   * @param handler The function that responds to the key event.
   * @param zone The zone in which the event occurred.
   * @returns A callback function.
   */
  static eventCallback(fullKey, handler, zone) {
    return (event) => {
      if (KeyEventsPlugin.getEventFullKey(event) === fullKey) {
        zone.runGuarded(() => handler(event));
      }
    };
  }
  /** @internal */
  static _normalizeKey(keyName) {
    switch (keyName) {
      case "esc":
        return "escape";
      default:
        return keyName;
    }
  }
}
KeyEventsPlugin.ɵfac = ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "13.4.0", ngImport: i0, type: KeyEventsPlugin, deps: [{ token: DOCUMENT }], target: FactoryTarget.Injectable });
KeyEventsPlugin.ɵprov = ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "13.4.0", ngImport: i0, type: KeyEventsPlugin });
ɵɵngDeclareClassMetadata({ type: KeyEventsPlugin, decorators: [{
  type: Injectable
}], ctorParameters: function() {
  return [{ type: void 0, decorators: [{
    type: Inject,
    args: [DOCUMENT]
  }] }];
} });
function getEventKey(event) {
  let key = event.key;
  if (key == null) {
    key = event.keyIdentifier;
    if (key == null) {
      return "Unidentified";
    }
    if (key.startsWith("U+")) {
      key = String.fromCharCode(parseInt(key.substring(2), 16));
      if (event.location === DOM_KEY_LOCATION_NUMPAD && _chromeNumKeyPadMap.hasOwnProperty(key)) {
        key = _chromeNumKeyPadMap[key];
      }
    }
  }
  return _keyMap[key] || key;
}
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
function initDomAdapter() {
  BrowserDomAdapter.makeCurrent();
  BrowserGetTestability.init();
}
function errorHandler() {
  return new ErrorHandler();
}
function _document() {
  setDocument(document);
  return document;
}
const INTERNAL_BROWSER_PLATFORM_PROVIDERS = [
  { provide: PLATFORM_ID, useValue: PLATFORM_BROWSER_ID },
  { provide: PLATFORM_INITIALIZER, useValue: initDomAdapter, multi: true },
  { provide: DOCUMENT, useFactory: _document, deps: [] }
];
createPlatformFactory(platformCore, "browser", INTERNAL_BROWSER_PLATFORM_PROVIDERS);
const BROWSER_MODULE_PROVIDERS = [
  { provide: INJECTOR_SCOPE, useValue: "root" },
  { provide: ErrorHandler, useFactory: errorHandler, deps: [] },
  {
    provide: EVENT_MANAGER_PLUGINS,
    useClass: DomEventsPlugin,
    multi: true,
    deps: [DOCUMENT, NgZone, PLATFORM_ID]
  },
  { provide: EVENT_MANAGER_PLUGINS, useClass: KeyEventsPlugin, multi: true, deps: [DOCUMENT] },
  {
    provide: DomRendererFactory2,
    useClass: DomRendererFactory2,
    deps: [EventManager, DomSharedStylesHost, APP_ID]
  },
  { provide: RendererFactory2, useExisting: DomRendererFactory2 },
  { provide: SharedStylesHost, useExisting: DomSharedStylesHost },
  { provide: DomSharedStylesHost, useClass: DomSharedStylesHost, deps: [DOCUMENT] },
  { provide: Testability, useClass: Testability, deps: [NgZone] },
  { provide: EventManager, useClass: EventManager, deps: [EVENT_MANAGER_PLUGINS, NgZone] },
  { provide: XhrFactory, useClass: BrowserXhr, deps: [] }
];
class BrowserModule {
  constructor(parentModule) {
    if (parentModule) {
      throw new Error(`BrowserModule has already been loaded. If you need access to common directives such as NgIf and NgFor from a lazy loaded module, import CommonModule instead.`);
    }
  }
  /**
   * Configures a browser-based app to transition from a server-rendered app, if
   * one is present on the page.
   *
   * @param params An object containing an identifier for the app to transition.
   * The ID must match between the client and server versions of the app.
   * @returns The reconfigured `BrowserModule` to import into the app's root `AppModule`.
   */
  static withServerTransition(params) {
    return {
      ngModule: BrowserModule,
      providers: [
        { provide: APP_ID, useValue: params.appId },
        { provide: TRANSITION_ID, useExisting: APP_ID },
        SERVER_TRANSITION_PROVIDERS
      ]
    };
  }
}
BrowserModule.ɵfac = ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "13.4.0", ngImport: i0, type: BrowserModule, deps: [{ token: BrowserModule, optional: true, skipSelf: true }], target: FactoryTarget.NgModule });
BrowserModule.ɵmod = ɵɵngDeclareNgModule({ minVersion: "12.0.0", version: "13.4.0", ngImport: i0, type: BrowserModule, exports: [CommonModule, ApplicationModule] });
BrowserModule.ɵinj = ɵɵngDeclareInjector({ minVersion: "12.0.0", version: "13.4.0", ngImport: i0, type: BrowserModule, providers: BROWSER_MODULE_PROVIDERS, imports: [CommonModule, ApplicationModule] });
ɵɵngDeclareClassMetadata({ type: BrowserModule, decorators: [{
  type: NgModule,
  args: [{ providers: BROWSER_MODULE_PROVIDERS, exports: [CommonModule, ApplicationModule] }]
}], ctorParameters: function() {
  return [{ type: BrowserModule, decorators: [{
    type: Optional
  }, {
    type: SkipSelf
  }, {
    type: Inject,
    args: [BrowserModule]
  }] }];
} });
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
function createMeta() {
  return new Meta(ɵɵinject(DOCUMENT));
}
class Meta {
  constructor(_doc) {
    this._doc = _doc;
    this._dom = getDOM();
  }
  /**
   * Retrieves or creates a specific `<meta>` tag element in the current HTML document.
   * In searching for an existing tag, Angular attempts to match the `name` or `property` attribute
   * values in the provided tag definition, and verifies that all other attribute values are equal.
   * If an existing element is found, it is returned and is not modified in any way.
   * @param tag The definition of a `<meta>` element to match or create.
   * @param forceCreation True to create a new element without checking whether one already exists.
   * @returns The existing element with the same attributes and values if found,
   * the new element if no match is found, or `null` if the tag parameter is not defined.
   */
  addTag(tag, forceCreation = false) {
    if (!tag)
      return null;
    return this._getOrCreateElement(tag, forceCreation);
  }
  /**
   * Retrieves or creates a set of `<meta>` tag elements in the current HTML document.
   * In searching for an existing tag, Angular attempts to match the `name` or `property` attribute
   * values in the provided tag definition, and verifies that all other attribute values are equal.
   * @param tags An array of tag definitions to match or create.
   * @param forceCreation True to create new elements without checking whether they already exist.
   * @returns The matching elements if found, or the new elements.
   */
  addTags(tags, forceCreation = false) {
    if (!tags)
      return [];
    return tags.reduce((result, tag) => {
      if (tag) {
        result.push(this._getOrCreateElement(tag, forceCreation));
      }
      return result;
    }, []);
  }
  /**
   * Retrieves a `<meta>` tag element in the current HTML document.
   * @param attrSelector The tag attribute and value to match against, in the format
   * `"tag_attribute='value string'"`.
   * @returns The matching element, if any.
   */
  getTag(attrSelector) {
    if (!attrSelector)
      return null;
    return this._doc.querySelector(`meta[${attrSelector}]`) || null;
  }
  /**
   * Retrieves a set of `<meta>` tag elements in the current HTML document.
   * @param attrSelector The tag attribute and value to match against, in the format
   * `"tag_attribute='value string'"`.
   * @returns The matching elements, if any.
   */
  getTags(attrSelector) {
    if (!attrSelector)
      return [];
    const list = this._doc.querySelectorAll(`meta[${attrSelector}]`);
    return list ? [].slice.call(list) : [];
  }
  /**
   * Modifies an existing `<meta>` tag element in the current HTML document.
   * @param tag The tag description with which to replace the existing tag content.
   * @param selector A tag attribute and value to match against, to identify
   * an existing tag. A string in the format `"tag_attribute=`value string`"`.
   * If not supplied, matches a tag with the same `name` or `property` attribute value as the
   * replacement tag.
   * @return The modified element.
   */
  updateTag(tag, selector) {
    if (!tag)
      return null;
    selector = selector || this._parseSelector(tag);
    const meta = this.getTag(selector);
    if (meta) {
      return this._setMetaElementAttributes(tag, meta);
    }
    return this._getOrCreateElement(tag, true);
  }
  /**
   * Removes an existing `<meta>` tag element from the current HTML document.
   * @param attrSelector A tag attribute and value to match against, to identify
   * an existing tag. A string in the format `"tag_attribute=`value string`"`.
   */
  removeTag(attrSelector) {
    this.removeTagElement(this.getTag(attrSelector));
  }
  /**
   * Removes an existing `<meta>` tag element from the current HTML document.
   * @param meta The tag definition to match against to identify an existing tag.
   */
  removeTagElement(meta) {
    if (meta) {
      this._dom.remove(meta);
    }
  }
  _getOrCreateElement(meta, forceCreation = false) {
    if (!forceCreation) {
      const selector = this._parseSelector(meta);
      const elem = this.getTags(selector).filter((elem2) => this._containsAttributes(meta, elem2))[0];
      if (elem !== void 0)
        return elem;
    }
    const element = this._dom.createElement("meta");
    this._setMetaElementAttributes(meta, element);
    const head = this._doc.getElementsByTagName("head")[0];
    head.appendChild(element);
    return element;
  }
  _setMetaElementAttributes(tag, el) {
    Object.keys(tag).forEach((prop) => el.setAttribute(this._getMetaKeyMap(prop), tag[prop]));
    return el;
  }
  _parseSelector(tag) {
    const attr = tag.name ? "name" : "property";
    return `${attr}="${tag[attr]}"`;
  }
  _containsAttributes(tag, elem) {
    return Object.keys(tag).every((key) => elem.getAttribute(this._getMetaKeyMap(key)) === tag[key]);
  }
  _getMetaKeyMap(prop) {
    return META_KEYS_MAP[prop] || prop;
  }
}
Meta.ɵfac = ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "13.4.0", ngImport: i0, type: Meta, deps: [{ token: DOCUMENT }], target: FactoryTarget.Injectable });
Meta.ɵprov = ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "13.4.0", ngImport: i0, type: Meta, providedIn: "root", useFactory: createMeta, deps: [] });
ɵɵngDeclareClassMetadata({ type: Meta, decorators: [{
  type: Injectable,
  args: [{ providedIn: "root", useFactory: createMeta, deps: [] }]
}], ctorParameters: function() {
  return [{ type: void 0, decorators: [{
    type: Inject,
    args: [DOCUMENT]
  }] }];
} });
const META_KEYS_MAP = {
  httpEquiv: "http-equiv"
};
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
function createTitle() {
  return new Title(ɵɵinject(DOCUMENT));
}
class Title {
  constructor(_doc) {
    this._doc = _doc;
  }
  /**
   * Get the title of the current HTML document.
   */
  getTitle() {
    return this._doc.title;
  }
  /**
   * Set the title of the current HTML document.
   * @param newTitle
   */
  setTitle(newTitle) {
    this._doc.title = newTitle || "";
  }
}
Title.ɵfac = ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "13.4.0", ngImport: i0, type: Title, deps: [{ token: DOCUMENT }], target: FactoryTarget.Injectable });
Title.ɵprov = ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "13.4.0", ngImport: i0, type: Title, providedIn: "root", useFactory: createTitle, deps: [] });
ɵɵngDeclareClassMetadata({ type: Title, decorators: [{
  type: Injectable,
  args: [{ providedIn: "root", useFactory: createTitle, deps: [] }]
}], ctorParameters: function() {
  return [{ type: void 0, decorators: [{
    type: Inject,
    args: [DOCUMENT]
  }] }];
} });
function unescapeHtml(text) {
  const unescapedText = {
    "&a;": "&",
    "&q;": '"',
    "&s;": "'",
    "&l;": "<",
    "&g;": ">"
  };
  return text.replace(/&[^;]+;/g, (s) => unescapedText[s]);
}
class TransferState {
  constructor() {
    this.store = {};
    this.onSerializeCallbacks = {};
  }
  /** @internal */
  static init(initState) {
    const transferState = new TransferState();
    transferState.store = initState;
    return transferState;
  }
  /**
   * Get the value corresponding to a key. Return `defaultValue` if key is not found.
   */
  get(key, defaultValue) {
    return this.store[key] !== void 0 ? this.store[key] : defaultValue;
  }
  /**
   * Set the value corresponding to a key.
   */
  set(key, value) {
    this.store[key] = value;
  }
  /**
   * Remove a key from the store.
   */
  remove(key) {
    delete this.store[key];
  }
  /**
   * Test whether a key exists in the store.
   */
  hasKey(key) {
    return this.store.hasOwnProperty(key);
  }
  /**
   * Register a callback to provide the value for a key when `toJson` is called.
   */
  onSerialize(key, callback) {
    this.onSerializeCallbacks[key] = callback;
  }
  /**
   * Serialize the current state of the store to JSON.
   */
  toJson() {
    for (const key in this.onSerializeCallbacks) {
      if (this.onSerializeCallbacks.hasOwnProperty(key)) {
        try {
          this.store[key] = this.onSerializeCallbacks[key]();
        } catch (e) {
          console.warn("Exception in onSerialize callback: ", e);
        }
      }
    }
    return JSON.stringify(this.store);
  }
}
TransferState.ɵfac = ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "13.4.0", ngImport: i0, type: TransferState, deps: [], target: FactoryTarget.Injectable });
TransferState.ɵprov = ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "13.4.0", ngImport: i0, type: TransferState });
ɵɵngDeclareClassMetadata({ type: TransferState, decorators: [{
  type: Injectable
}] });
function initTransferState(doc, appId) {
  const script = doc.getElementById(appId + "-state");
  let initialState = {};
  if (script && script.textContent) {
    try {
      initialState = JSON.parse(unescapeHtml(script.textContent));
    } catch (e) {
      console.warn("Exception while restoring TransferState for app " + appId, e);
    }
  }
  return TransferState.init(initialState);
}
class BrowserTransferStateModule {
}
BrowserTransferStateModule.ɵfac = ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "13.4.0", ngImport: i0, type: BrowserTransferStateModule, deps: [], target: FactoryTarget.NgModule });
BrowserTransferStateModule.ɵmod = ɵɵngDeclareNgModule({ minVersion: "12.0.0", version: "13.4.0", ngImport: i0, type: BrowserTransferStateModule });
BrowserTransferStateModule.ɵinj = ɵɵngDeclareInjector({ minVersion: "12.0.0", version: "13.4.0", ngImport: i0, type: BrowserTransferStateModule, providers: [{ provide: TransferState, useFactory: initTransferState, deps: [DOCUMENT, APP_ID] }] });
ɵɵngDeclareClassMetadata({ type: BrowserTransferStateModule, decorators: [{
  type: NgModule,
  args: [{
    providers: [{ provide: TransferState, useFactory: initTransferState, deps: [DOCUMENT, APP_ID] }]
  }]
}] });
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
const EVENT_NAMES = {
  // pan
  "pan": true,
  "panstart": true,
  "panmove": true,
  "panend": true,
  "pancancel": true,
  "panleft": true,
  "panright": true,
  "panup": true,
  "pandown": true,
  // pinch
  "pinch": true,
  "pinchstart": true,
  "pinchmove": true,
  "pinchend": true,
  "pinchcancel": true,
  "pinchin": true,
  "pinchout": true,
  // press
  "press": true,
  "pressup": true,
  // rotate
  "rotate": true,
  "rotatestart": true,
  "rotatemove": true,
  "rotateend": true,
  "rotatecancel": true,
  // swipe
  "swipe": true,
  "swipeleft": true,
  "swiperight": true,
  "swipeup": true,
  "swipedown": true,
  // tap
  "tap": true,
  "doubletap": true
};
const HAMMER_GESTURE_CONFIG = new InjectionToken("HammerGestureConfig");
const HAMMER_LOADER = new InjectionToken("HammerLoader");
class HammerGestureConfig {
  constructor() {
    this.events = [];
    this.overrides = {};
  }
  /**
   * Creates a [HammerJS Manager](https://hammerjs.github.io/api/#hammermanager)
   * and attaches it to a given HTML element.
   * @param element The element that will recognize gestures.
   * @returns A HammerJS event-manager object.
   */
  buildHammer(element) {
    const mc = new Hammer(element, this.options);
    mc.get("pinch").set({ enable: true });
    mc.get("rotate").set({ enable: true });
    for (const eventName in this.overrides) {
      mc.get(eventName).set(this.overrides[eventName]);
    }
    return mc;
  }
}
HammerGestureConfig.ɵfac = ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "13.4.0", ngImport: i0, type: HammerGestureConfig, deps: [], target: FactoryTarget.Injectable });
HammerGestureConfig.ɵprov = ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "13.4.0", ngImport: i0, type: HammerGestureConfig });
ɵɵngDeclareClassMetadata({ type: HammerGestureConfig, decorators: [{
  type: Injectable
}] });
class HammerGesturesPlugin extends EventManagerPlugin {
  constructor(doc, _config, console2, loader) {
    super(doc);
    this._config = _config;
    this.console = console2;
    this.loader = loader;
    this._loaderPromise = null;
  }
  supports(eventName) {
    if (!EVENT_NAMES.hasOwnProperty(eventName.toLowerCase()) && !this.isCustomEvent(eventName)) {
      return false;
    }
    if (!window.Hammer && !this.loader) {
      if (typeof ngDevMode === "undefined" || ngDevMode) {
        this.console.warn(`The "${eventName}" event cannot be bound because Hammer.JS is not loaded and no custom loader has been specified.`);
      }
      return false;
    }
    return true;
  }
  addEventListener(element, eventName, handler) {
    const zone = this.manager.getZone();
    eventName = eventName.toLowerCase();
    if (!window.Hammer && this.loader) {
      this._loaderPromise = this._loaderPromise || this.loader();
      let cancelRegistration = false;
      let deregister = () => {
        cancelRegistration = true;
      };
      this._loaderPromise.then(() => {
        if (!window.Hammer) {
          if (typeof ngDevMode === "undefined" || ngDevMode) {
            this.console.warn(`The custom HAMMER_LOADER completed, but Hammer.JS is not present.`);
          }
          deregister = () => {
          };
          return;
        }
        if (!cancelRegistration) {
          deregister = this.addEventListener(element, eventName, handler);
        }
      }).catch(() => {
        if (typeof ngDevMode === "undefined" || ngDevMode) {
          this.console.warn(`The "${eventName}" event cannot be bound because the custom Hammer.JS loader failed.`);
        }
        deregister = () => {
        };
      });
      return () => {
        deregister();
      };
    }
    return zone.runOutsideAngular(() => {
      const mc = this._config.buildHammer(element);
      const callback = function(eventObj) {
        zone.runGuarded(function() {
          handler(eventObj);
        });
      };
      mc.on(eventName, callback);
      return () => {
        mc.off(eventName, callback);
        if (typeof mc.destroy === "function") {
          mc.destroy();
        }
      };
    });
  }
  isCustomEvent(eventName) {
    return this._config.events.indexOf(eventName) > -1;
  }
}
HammerGesturesPlugin.ɵfac = ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "13.4.0", ngImport: i0, type: HammerGesturesPlugin, deps: [{ token: DOCUMENT }, { token: HAMMER_GESTURE_CONFIG }, { token: Console }, { token: HAMMER_LOADER, optional: true }], target: FactoryTarget.Injectable });
HammerGesturesPlugin.ɵprov = ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "13.4.0", ngImport: i0, type: HammerGesturesPlugin });
ɵɵngDeclareClassMetadata({ type: HammerGesturesPlugin, decorators: [{
  type: Injectable
}], ctorParameters: function() {
  return [{ type: void 0, decorators: [{
    type: Inject,
    args: [DOCUMENT]
  }] }, { type: HammerGestureConfig, decorators: [{
    type: Inject,
    args: [HAMMER_GESTURE_CONFIG]
  }] }, { type: Console }, { type: void 0, decorators: [{
    type: Optional
  }, {
    type: Inject,
    args: [HAMMER_LOADER]
  }] }];
} });
class HammerModule {
}
HammerModule.ɵfac = ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "13.4.0", ngImport: i0, type: HammerModule, deps: [], target: FactoryTarget.NgModule });
HammerModule.ɵmod = ɵɵngDeclareNgModule({ minVersion: "12.0.0", version: "13.4.0", ngImport: i0, type: HammerModule });
HammerModule.ɵinj = ɵɵngDeclareInjector({ minVersion: "12.0.0", version: "13.4.0", ngImport: i0, type: HammerModule, providers: [
  {
    provide: EVENT_MANAGER_PLUGINS,
    useClass: HammerGesturesPlugin,
    multi: true,
    deps: [DOCUMENT, HAMMER_GESTURE_CONFIG, Console, [new Optional(), HAMMER_LOADER]]
  },
  { provide: HAMMER_GESTURE_CONFIG, useClass: HammerGestureConfig, deps: [] }
] });
ɵɵngDeclareClassMetadata({ type: HammerModule, decorators: [{
  type: NgModule,
  args: [{
    providers: [
      {
        provide: EVENT_MANAGER_PLUGINS,
        useClass: HammerGesturesPlugin,
        multi: true,
        deps: [DOCUMENT, HAMMER_GESTURE_CONFIG, Console, [new Optional(), HAMMER_LOADER]]
      },
      { provide: HAMMER_GESTURE_CONFIG, useClass: HammerGestureConfig, deps: [] }
    ]
  }]
}] });
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
class DomSanitizer {
}
DomSanitizer.ɵfac = ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "13.4.0", ngImport: i0, type: DomSanitizer, deps: [], target: FactoryTarget.Injectable });
DomSanitizer.ɵprov = ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "13.4.0", ngImport: i0, type: DomSanitizer, providedIn: "root", useExisting: forwardRef(function() {
  return DomSanitizerImpl;
}) });
ɵɵngDeclareClassMetadata({ type: DomSanitizer, decorators: [{
  type: Injectable,
  args: [{ providedIn: "root", useExisting: forwardRef(() => DomSanitizerImpl) }]
}] });
function domSanitizerImplFactory(injector) {
  return new DomSanitizerImpl(injector.get(DOCUMENT));
}
class DomSanitizerImpl extends DomSanitizer {
  constructor(_doc) {
    super();
    this._doc = _doc;
  }
  sanitize(ctx, value) {
    if (value == null)
      return null;
    switch (ctx) {
      case SecurityContext.NONE:
        return value;
      case SecurityContext.HTML:
        if (allowSanitizationBypassAndThrow(
          value,
          "HTML"
          /* Html */
        )) {
          return unwrapSafeValue(value);
        }
        return _sanitizeHtml(this._doc, String(value)).toString();
      case SecurityContext.STYLE:
        if (allowSanitizationBypassAndThrow(
          value,
          "Style"
          /* Style */
        )) {
          return unwrapSafeValue(value);
        }
        return value;
      case SecurityContext.SCRIPT:
        if (allowSanitizationBypassAndThrow(
          value,
          "Script"
          /* Script */
        )) {
          return unwrapSafeValue(value);
        }
        throw new Error("unsafe value used in a script context");
      case SecurityContext.URL:
        getSanitizationBypassType(value);
        if (allowSanitizationBypassAndThrow(
          value,
          "URL"
          /* Url */
        )) {
          return unwrapSafeValue(value);
        }
        return _sanitizeUrl(String(value));
      case SecurityContext.RESOURCE_URL:
        if (allowSanitizationBypassAndThrow(
          value,
          "ResourceURL"
          /* ResourceUrl */
        )) {
          return unwrapSafeValue(value);
        }
        throw new Error("unsafe value used in a resource URL context (see https://g.co/ng/security#xss)");
      default:
        throw new Error(`Unexpected SecurityContext ${ctx} (see https://g.co/ng/security#xss)`);
    }
  }
  bypassSecurityTrustHtml(value) {
    return bypassSanitizationTrustHtml(value);
  }
  bypassSecurityTrustStyle(value) {
    return bypassSanitizationTrustStyle(value);
  }
  bypassSecurityTrustScript(value) {
    return bypassSanitizationTrustScript(value);
  }
  bypassSecurityTrustUrl(value) {
    return bypassSanitizationTrustUrl(value);
  }
  bypassSecurityTrustResourceUrl(value) {
    return bypassSanitizationTrustResourceUrl(value);
  }
}
DomSanitizerImpl.ɵfac = ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "13.4.0", ngImport: i0, type: DomSanitizerImpl, deps: [{ token: DOCUMENT }], target: FactoryTarget.Injectable });
DomSanitizerImpl.ɵprov = ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "13.4.0", ngImport: i0, type: DomSanitizerImpl, providedIn: "root", useFactory: domSanitizerImplFactory, deps: [{ token: Injector }] });
ɵɵngDeclareClassMetadata({ type: DomSanitizerImpl, decorators: [{
  type: Injectable,
  args: [{ providedIn: "root", useFactory: domSanitizerImplFactory, deps: [Injector] }]
}], ctorParameters: function() {
  return [{ type: void 0, decorators: [{
    type: Inject,
    args: [DOCUMENT]
  }] }];
} });
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
new Version("13.4.0");
export {
  PercentPipe as $,
  Component as A,
  CommonModule as B,
  ChangeDetectorRef as C,
  Directive as D,
  ElementRef as E,
  FactoryTarget as F,
  ChangeDetectionStrategy as G,
  Host as H,
  InjectionToken as I,
  ViewContainerRef as J,
  DOCUMENT as K,
  LOCALE_ID as L,
  Subject as M,
  NgModule as N,
  Optional as O,
  PLATFORM_ID as P,
  take as Q,
  Renderer2 as R,
  Self as S,
  TemplateRef as T,
  ApplicationRef as U,
  Version as V,
  RendererFactory2 as W,
  ComponentFactoryResolver$1 as X,
  takeUntil as Y,
  ContentChildren as Z,
  Attribute as _,
  ɵɵngDeclareDirective as a,
  DomRendererFactory2 as a$,
  BehaviorSubject as a0,
  isPlatformBrowser as a1,
  combineLatest as a2,
  startWith as a3,
  distinctUntilChanged as a4,
  switchMap as a5,
  timer as a6,
  zip as a7,
  getLocaleMonthNames as a8,
  TranslationWidth as a9,
  pairwise as aA,
  shareReplay as aB,
  asapScheduler as aC,
  Location as aD,
  Subscription as aE,
  debounceTime as aF,
  QueryList as aG,
  isDevMode as aH,
  HostListener as aI,
  first as aJ,
  DomSanitizer as aK,
  SecurityContext as aL,
  __extends as aM,
  AsyncAction as aN,
  AsyncScheduler as aO,
  isArray as aP,
  isObject as aQ,
  isFunction as aR,
  noop$1 as aS,
  MissingTranslationStrategy as aT,
  Compiler as aU,
  createPlatformFactory as aV,
  COMPILER_OPTIONS as aW,
  CompilerFactory as aX,
  platformCore as aY,
  INTERNAL_BROWSER_PLATFORM_PROVIDERS as aZ,
  PLATFORM_BROWSER_ID as a_,
  FormStyle as aa,
  getLocaleDayNames as ab,
  formatDate as ac,
  filter as ad,
  merge$1 as ae,
  tap as af,
  withLatestFrom as ag,
  delay as ah,
  race as ai,
  skip as aj,
  getLocaleDayPeriods as ak,
  of as al,
  finalize as am,
  EMPTY as an,
  endWith as ao,
  mergeMap as ap,
  Observable as aq,
  share as ar,
  ViewChild as as,
  ContentChild as at,
  ViewChildren as au,
  HostBinding as av,
  defineInjectable as aw,
  inject as ax,
  auditTime as ay,
  IterableDiffers as az,
  ɵɵngDeclareClassMetadata as b,
  BrowserModule as b0,
  PlatformLocation as b1,
  LocationStrategy as b2,
  ViewportScroller as b3,
  NgProbeToken as b4,
  APP_BASE_HREF as b5,
  NgModuleRef$1 as b6,
  Console as b7,
  concatMap as b8,
  mergeAll as b9,
  catchError as ba,
  ANALYZE_FOR_ENTRY_COMPONENTS as bb,
  HashLocationStrategy as bc,
  PathLocationStrategy as bd,
  APP_INITIALIZER as be,
  APP_BOOTSTRAP_LISTENER as bf,
  ConnectableObservable as bg,
  refCount as bh,
  LOCATION_INITIALIZED as bi,
  InjectFlags as bj,
  NgModuleFactory$1 as bk,
  Type as bl,
  concat as bm,
  scan as bn,
  last as bo,
  EmptyError as bp,
  defer as bq,
  throwError$1 as br,
  takeLast as bs,
  ɵɵdefineInjectable as bt,
  ɵɵinject as bu,
  Pipe as bv,
  Inject as c,
  EventEmitter as d,
  SkipSelf as e,
  forwardRef as f,
  ɵɵngDeclareNgModule as g,
  ɵɵngDeclareInjector as h,
  i0 as i,
  ɵɵngDeclareInjectable as j,
  Injectable as k,
  Injector as l,
  getDOM as m,
  RuntimeError as n,
  map as o,
  isPromise as p,
  from as q,
  isObservable as r,
  Input as s,
  Output as t,
  NgZone as u,
  ɵɵngDeclareComponent as v,
  ViewEncapsulation$1 as w,
  NgTemplateOutlet as x,
  NgForOf as y,
  NgIf as z,
  ɵɵngDeclareFactory as ɵ
};
