import { WorkspaceSourceOptions } from '.';
import { getPkgDeps } from './getPkgDeps';

export const isWorkspaceDep = async () => {
  const pkgDeps = await getPkgDeps();
  return (id: string) => {
    const allDeps = pkgDeps;
    const depInfo =
      allDeps.get(id) ??
      allDeps.get(
        id.startsWith('@')
          ? id.split('/').slice(0, 2).join('/')
          : id.split('/')[0],
      );
    if (depInfo) return depInfo.startsWith('workspace:');
    return false;
  };
};

const hasPrefix = (prefix: string) => (id: string) => id.startsWith(prefix);

export const isNodeModules = (id: string) =>
  id.startsWith('node:') || import.meta.resolve(id).includes('node_modules');

const isInRoot = (rootDir: string) => (id: string) =>
  import.meta.resolve(id).includes(`/${rootDir}/`);

const isInThisDir = () => {
  const thisDir = process.cwd();
  return (id: string) =>
    import.meta.resolve(id).startsWith(`file://${thisDir}/`);
};

const checkBuilders: Record<
  keyof Required<WorkspaceSourceOptions>,
  (info: string) => (id: string) => boolean
> = {
  prefix: hasPrefix,
  rootDir: (id) => isInRoot(id),
  isRoot: (is) => (is ? isInThisDir() : () => false),
};

export const createChecks = async (
  opts: WorkspaceSourceOptions,
): Promise<((id: string) => boolean)[]> => {
  return [
    await isWorkspaceDep(),
    ...Object.entries(opts).map(
      ([key, value]: [keyof WorkspaceSourceOptions, string]) =>
        checkBuilders[key](value),
    ),
  ];
};

if (import.meta.vitest) {
  describe('createChecks', () => {
    it('identifies NodeModules', () => {
      expect(isNodeModules('node:fs/promises')).toBe(true);
      expect(isNodeModules('vite')).toBe(true);
      expect(isNodeModules('vite-plugin-external-deps')).toBe(false);
    });
    it('identifies workspace deps', async () => {
      const isInWorkspace = await isWorkspaceDep();
      expect(isInWorkspace('vite-plugin-external-deps')).toBe(true);
      expect(isInWorkspace('vite')).toBe(false);
    });
    it('identifies modules in this dir', () => {
      expect(isInThisDir()('vite-plugin-access-workspace-source')).toBe(true);
      if (process.cwd().endsWith('vite-plugins'))
        expect(isInThisDir()('vite')).toBe(true);
      else expect(isInThisDir()('vite')).toBe(false);
    });
    it('isInRoot', () => {
      expect(
        isInRoot('vite-plugins')('vite-plugin-access-workspace-source'),
      ).toBe(true);
      expect(isInRoot('vite-plugins/packages')('vite')).toBe(false);
    });
    it('hasPrefix', () => {
      expect(hasPrefix('@ekwoka')('vite')).toBe(false);
      expect(
        hasPrefix('@ekwoka')('@ekwoka/vite-plugin-access-workspace-source'),
      ).toBe(true);
    });
    it('creates checks', async () => {
      const checks = await createChecks({
        prefix: '@ekwoka',
        rootDir: 'vite-plugins/packages',
      });
      expect(checks.some((check) => check('vite'))).toEqual(false);
      expect(checks.some((check) => check('vite-plugin-external-deps'))).toBe(
        true,
      );
      expect(
        checks.some((check) =>
          check('@ekwoka/vite-plugin-access-workspace-source'),
        ),
      ).toBe(true);
    });
  });
}
