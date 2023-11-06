import type { PluginOption } from 'vite';

import { createChecks, isNodeModules } from './createChecks';

export const WorkspaceSource = (opts: WorkspaceSourceOptions = {}) => {
  const checks = createChecks(opts);
  return {
    name: 'access-own-package-sources',
    enforce: 'pre' as const,
    apply: 'serve', // Runs only for tests and in dev
    async resolveId(id: string) {
      if (id.startsWith('.') || id.startsWith('/')) return null; // relative paths
      if (isNodeModules(id)) return null; // workspace deps don't resolve to node_modules
      if ((await checks).some((check) => check(id))) return `${id}/src`; // add /src to the end of the id to access the source files
      return null;
    },
  } satisfies PluginOption;
};

export default WorkspaceSource;

export type WorkspaceSourceOptions = Partial<{
  isRoot: boolean;
  rootDir: string;
  prefix: string;
}>;
