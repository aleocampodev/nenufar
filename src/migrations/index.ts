import * as migration_20260722_015831 from './20260722_015831';
import * as migration_20260825_214319 from './20260825_214319';

export const migrations = [
  {
    up: migration_20260722_015831.up,
    down: migration_20260722_015831.down,
    name: '20260722_015831',
  },
  {
    up: migration_20260825_214319.up,
    down: migration_20260825_214319.down,
    name: '20260825_214319'
  },
];
