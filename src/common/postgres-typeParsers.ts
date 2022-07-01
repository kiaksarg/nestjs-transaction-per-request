/* eslint-disable @typescript-eslint/no-var-requires */
export function fixPostgresTimezone() {
  if (process.env.DB === 'postgres') {
    // tslint:disable-next-line:no-var-requires
    const pg = require('pg');
    pg.types.setTypeParser(1114, (stringValue: string) => new Date(`${stringValue}+0000`));
  }
}

export function setBigNumberPostgresTypeParser() {
  if (process.env.DB === 'postgres') {
    // tslint:disable-next-line:no-var-requires
    const pg = require('pg');
    pg.types.setTypeParser(20, function (val) {
      return parseInt(val);
    });
  }
}
