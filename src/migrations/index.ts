import * as migration_20260722_015831 from './20260722_015831';
import * as migration_20260911_233852_buyer_fields from './20260911_233852_buyer_fields';

export const migrations = [
  {
    up: migration_20260722_015831.up,
    down: migration_20260722_015831.down,
    name: '20260722_015831',
  },
  {
    up: migration_20260911_233852_buyer_fields.up,
    down: migration_20260911_233852_buyer_fields.down,
    name: '20260911_233852_buyer_fields'
  },
];
