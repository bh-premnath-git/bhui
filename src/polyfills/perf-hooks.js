// Browser polyfill for node:perf_hooks
export const performance = window.performance;

export const PerformanceObserver = 
  typeof window !== 'undefined' && window.PerformanceObserver 
    ? window.PerformanceObserver 
    : class MockPerformanceObserver {
        constructor() {
          this.observe = () => {};
          this.disconnect = () => {};
        }
      };
