/* eslint-disable consistent-return */
import { isEmpty } from 'lodash';

export const delay = async (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const onCycle = () => {
  const seen = new WeakSet();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  return (key: unknown, value: unknown) => {
    if (typeof value === 'object' && value !== null) {
      if (seen.has(value)) {
        return;
      }
      seen.add(value);
    }
    return value;
  };
};
export const getJSON = (obj?: any, indent?: number) => JSON.stringify(obj, onCycle(), indent);

// export const scheduleFileName = (date: Date) => `Расписание ${ date.toLocaleString() }, 3 курс.xls`

export const checked = <T>(src: T, expr: (v: T) => any, error: any): T => {
  const isTruth = expr(src);
  if (!isTruth || isEmpty(isTruth)) {
    throw error;
  }
  return src;
};
