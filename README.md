# nodejs require-override

Helper functions to override the require logic of nodejs.

## How to use

### Override

With this function you can override the load logic with a custom logic. The method needs to return the loaded module. To revert back to the previous logic use the current function.

```ts
/**
 * Override the current load logic.
 *
 * @param isOverride A condition used to check whether to override Module._load.
 * @param resolveOverride A function used to override Module._load result.
 * @returns A restore to previous state method.
 */
function override(
  isOverride: (request: string, parent: ParentType) => boolean,
  resolveOverride: (request: string, parent: ParentType, current: () => unknown) => unknown
): () => void;
```

### Log

With this function you can log out the loaded packages. The filter regexp is used to filter out the names of the logged packages.

```ts
/**
 * Logs resolve requests for given packages.
 *
 * @param filter Filter for package requests.
 * @returns A restore to previous state method.
 */
function log(filter: RegExp): () => void;
```

### Cache

With this function you can cache and return the packages. The filter regexp is used to filter out the names of the cached packages.
If a package is not cached, the previous logic is used, if it was cached it will return the cached package.

Already cached packages will ignore the node_modules structure.

This is useful to make sure that packages loaded by any package will be the same version, this way static variables, decorators will be working across loaded instances.

```ts
/**
 * Cache resolve results for given packages.
 *
 * @param filter Filter for package requests.
 * @returns A restore to previous state method.
 */
function cache(filter: RegExp): () => void;
```
