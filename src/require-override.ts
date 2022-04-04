/**
 * Overrides nodejs require logic.
 * Helper functions for different tasks.
 *
 * @packageDocumentation
 */

import { Module } from 'module';

/* eslint-disable */
// Undocumented internal node type
type ParentType = {
  children: Array<unknown>;
  exports: unknown;
  filename: string;
  id: string;
  loaded: boolean;
  parent: unknown;
  paths: Array<string>;
};
/* eslint-enable */

type IsOverrideType = (request: string, parent: ParentType) => boolean;
type ResolverType = (request: string, parent: ParentType) => unknown;
type ResolverOverrideType = (
  request: string,
  parent: ParentType,
  current: () => unknown
) => unknown;
type OverrideRequireType = (...rest: Array<void>) => void;

/**
 * Allow access to nodejs internal _load method.
 */
interface HasLoad {
  /**
   * The load method.
   */
  _load: ResolverType;
}

/**
 * Override the current load logic.
 *
 * @param isOverride A condition used to check whether to override Module._load.
 * @param resolveOverride A function used to override Module._load result.
 * @returns A restore to previous state method.
 */
export function override(
  isOverride: IsOverrideType,
  resolveOverride: ResolverOverrideType
): OverrideRequireType {
  const originalLoad = (<HasLoad>(<unknown>Module))._load;

  (<HasLoad>(<unknown>Module))._load = function (
    request: string,
    parent: ParentType
  ): unknown {
    if (isOverride(request, parent)) {
      return resolveOverride(request, parent, () =>
        // eslint-disable-next-line @typescript-eslint/no-explicit-any, prefer-rest-params
        originalLoad.apply(this, <any>arguments)
      );
    } else {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any, prefer-rest-params
      return originalLoad.apply(this, <any>arguments);
    }
  };

  return () => {
    (<HasLoad>(<unknown>Module))._load = originalLoad;
  };
}

/**
 * Logs resolve requests for given packages.
 *
 * @param filter Filter for package requests.
 * @returns A restore to previous state method.
 */
export function log(filter: RegExp): OverrideRequireType {
  return override(
    (request) => filter.test(request),
    function (request, parent, current) {
      console.log(`Resolve package: ${request}`);
      // eslint-disable-next-line prefer-rest-params
      return current();
    }
  );
}

/**
 * Cache resolve results for given packages.
 *
 * @param filter Filter for package requests.
 * @returns A restore to previous state method.
 */
export function cache(filter: RegExp): OverrideRequireType {
  const cache: { [key: string]: unknown } = {};

  return override(
    (request) => filter.test(request),
    function (request, parent, current) {
      if (cache[request]) return cache[request];
      console.log(`Require cached: ${request}`);
      // eslint-disable-next-line prefer-rest-params
      return (cache[request] = current());
    }
  );
}
