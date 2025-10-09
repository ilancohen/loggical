/* eslint-disable unicorn/prevent-abbreviations */
import createLibConfig from './vite.lib';

export default createLibConfig({
  name: 'logger',
  external: ['pretty-format'],
});
