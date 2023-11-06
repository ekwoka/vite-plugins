import type { Plugin } from 'vite';

import { getPkgDeps } from './getPkgDeps';

const pkgDeps = getPkgDeps();
const isDep = async (id: string) => {
  const allDeps = await pkgDeps;
  return (
    allDeps.has(id) ||
    allDeps.has(
      id.startsWith('@')
        ? id.split('/').slice(0, 2).join('/')
        : id.split('/')[0],
    )
  );
};
export const ExternalDeps = (): Plugin => ({
  name: 'vite-plugin-external-deps',
  apply: 'build',
  enforce: 'pre',
  resolveId(id) {
    if (id.startsWith('.') || id.startsWith('/')) return null;
    if (id.startsWith('node:')) return { id, external: true };
    if (isDep(id)) return { id, external: true };
    try {
      if (import.meta.resolve?.(id).includes('node_modules'))
        return { id, external: true };
    } catch (e) {
      return null;
    }
    return null;
  },
});

export default ExternalDeps;
