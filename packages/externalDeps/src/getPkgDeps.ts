import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

export const getPkgDeps = async () => {
  const pkg = await getPkg();

  const allDeps = new Map<string, string>();
  for (const key in pkg)
    if (key.endsWith('ependencies'))
      for (const dep in pkg[key]) allDeps.set(dep, pkg[key][dep]);
  return allDeps;
};

const getPkg = async () => {
  try {
    const path = resolve('package.json');
    const pkg = JSON.parse((await readFile(path)).toString());
    return pkg;
  } catch (e) {
    return {};
  }
};
