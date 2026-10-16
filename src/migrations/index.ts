import * as migration_20261016_001343_initial from './20261016_001343_initial';

export const migrations = [
  {
    up: migration_20261016_001343_initial.up,
    down: migration_20261016_001343_initial.down,
    name: '20261016_001343_initial'
  },
];
