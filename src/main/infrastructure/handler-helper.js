export function requireArgParams(wrapped, params) {
  if (Array.isArray(params)) {
    return function (...args) {
      let hasRequired = true;
      for (let i = 0; i < params.length; i++) {
        if (args[1][params[i]] === undefined) {
          hasRequired = false;
        }
      }
      if (hasRequired) {
        return wrapped.apply(this, args);
      } else {
        return undefined;
      }
    };
  } else {
    return function (...args) {
      return wrapped.apply(this, args);
    };
  }
}