import ms from 'ms';
import { formatDuration, intervalToDuration } from 'date-fns';
import { ru } from 'date-fns/locale';
import {
  compact, flatten, isNaN, isNumber,
} from 'lodash';
import { WeekDayEnum } from '@prisma/client';

export const ruToMs = (input: string): number | null => {
  // Убираем первое слово, если оно "каждые"
  let parsing = input.replace(/^(?=кажд)\S+\s*/i, '');
  // Убираем все " и "
  parsing = parsing.replace(/\s+и+\s+|\s*,+\s*/ig, ' ');
  // Убираем все пробелы справа от чисел
  parsing = parsing.replace(/(?<=\d)\s+/ig, '');
  // Домножим на 1 всё что не имеет числа
  parsing = parsing.replace(/(?<![\dа-яё])([а-яё]+)/ig, '1$1');
  // Замена приставки "пол" на 0.5
  parsing = parsing.replace(/(\d+)(пол)(?=[а-яё]+)/ig, (_, p1) => `${Number(p1) * 0.5}`);
  // Замена всех единиц времени
  parsing = parsing.replace(/нед(ел(я|и|ю|ей|ь|ями)?)?/ig, 'week'); // Неделя
  parsing = parsing.replace(/сек(унд(а|ы|у|е|ой|ами)?)?/ig, 'second'); // Секунда
  parsing = parsing.replace(/мин(ут(а|ы|у|е|ой|ами)?)?/ig, 'minute'); // Минута
  parsing = parsing.replace(/час(а|у|ы|е|ов|ами)?/ig, 'hour'); // Час
  parsing = parsing.replace(/д(н|ень|ня|ню|ни|ней|ням|нями)/ig, 'day'); // День
  parsing = parsing.replace(/мес(яц(а|у|е|ы|ев|ами)?)?/ig, 'month'); // Месяц
  parsing = parsing.replace(/год(а|у|ы|е|ов|ами)?/ig, 'year'); // Год
  // Заменяем месяцы на дни, каждый по 30 дней
  parsing = parsing.replace(/(\d+)month/ig, (_, p1) => `${Number(p1) * 30.4375}day`);
  // Применяем vercel/ms и суммируем
  const milliseconds = parsing.split(/\s+/).map((part) => ms(part)).reduce((a, b) => a + b);
  // Возвращаем результат, если он корректен, иначе null
  return isNumber(milliseconds) && !isNaN(milliseconds) ? milliseconds : null;
};

export const msToRu = (milliseconds: number) => formatDuration(intervalToDuration({ start: 0, end: milliseconds }), { locale: ru });

export const ruToWeekDayEnums = (input: string): Set<WeekDayEnum> | null => {
  const result: Set<WeekDayEnum> = new Set(compact(flatten([
    /будн/ig.test(input) && [WeekDayEnum.Monday, WeekDayEnum.Tuesday, WeekDayEnum.Wednesday, WeekDayEnum.Thursday, WeekDayEnum.Friday],
    /выходн/ig.test(input) && [WeekDayEnum.Saturday, WeekDayEnum.Sunday],
    /понедельник|(?<![а-яё])пн(?![а-яё])/i.test(input) && WeekDayEnum.Monday,
    /вторник|(?<![а-яё])вт(?![а-яё])/i.test(input) && WeekDayEnum.Tuesday,
    /сред|(?<![а-яё])ср(?![а-яё])/i.test(input) && WeekDayEnum.Wednesday,
    /четверг|(?<![а-яё])чт(?![а-яё])/i.test(input) && WeekDayEnum.Thursday,
    /пятниц|(?<![а-яё])пт(?![а-яё])/i.test(input) && WeekDayEnum.Friday,
    /суббот|(?<![а-яё])сб(?![а-яё])/i.test(input) && WeekDayEnum.Saturday,
    /воскресень|(?<![а-яё])вс(?![а-яё])/i.test(input) && WeekDayEnum.Sunday,
  ])));
  return result.size ? result : null;
};

export const weekDayEnumsToRu = (weekDays: WeekDayEnum[]) => compact([
  weekDays.includes(WeekDayEnum.Monday) && 'Пн',
  weekDays.includes(WeekDayEnum.Tuesday) && 'Вт',
  weekDays.includes(WeekDayEnum.Wednesday) && 'Ср',
  weekDays.includes(WeekDayEnum.Thursday) && 'Чт',
  weekDays.includes(WeekDayEnum.Friday) && 'Пт',
  weekDays.includes(WeekDayEnum.Saturday) && 'Сб',
  weekDays.includes(WeekDayEnum.Sunday) && 'Вс',
]).join(', ');

export const weekDayNumberToEnum = (weekDayNum: number): WeekDayEnum => {
  switch (weekDayNum) {
    case 0: return WeekDayEnum.Monday;
    case 1: return WeekDayEnum.Tuesday;
    case 2: return WeekDayEnum.Wednesday;
    case 3: return WeekDayEnum.Thursday;
    case 4: return WeekDayEnum.Friday;
    case 5: return WeekDayEnum.Saturday;
    case 6: return WeekDayEnum.Sunday;
    default:
      throw new Error(`weekDayNumberToEnum: weekDayNum must be in range [0, 6], but got ${weekDayNum}`);
  }
};

export const weekDayEnumToNumber = (weekDayEnum: WeekDayEnum): number => {
  switch (weekDayEnum) {
    case WeekDayEnum.Monday: return 0;
    case WeekDayEnum.Tuesday: return 1;
    case WeekDayEnum.Wednesday: return 2;
    case WeekDayEnum.Thursday: return 3;
    case WeekDayEnum.Friday: return 4;
    case WeekDayEnum.Saturday: return 5;
    case WeekDayEnum.Sunday: return 6;
    default:
      throw new Error(`weekDayEnumToNumber: weekDayEnum must be in range [0, 6], but got ${weekDayEnum satisfies never}`);
  }
};

export const getWeekDay = () => (new Date().getDay() + 6) % 7;

// const testParseRussianTimeInterval = () => {
//   const phrases = [
//     ['непонятно чё', null],
//     ['непонятно чё и 2 часа', null],
//     ['каждые полсекунды', ms('0.5s')],
//     ['каждые 30 секунд', ms('30s')],
//     ['каждые 2.5 дня', ms('2.5d')],
//     ['каждые полчаса', ms('0.5h')],
//     ['каждые полгода', ms('0.5y')],
//     ['каждый час', ms('1h')],
//     ['каждые полдня', ms('0.5d')],
//     ['каждые 2 часа', ms('2h')],
//     ['каждый день', ms('1d')],
//     ['каждые 3 недели', ms('3w')],
//     ['каждый месяц', ms(`${30.4375}days`)],
//     ['каждые 2 часа и 3 минуты', ms('2h') + ms('3m')],
//     ['3 года, 2 месяца', ms('3y') + ms(`${2 * 30.4375}day`)],
//   ] as const;
//   for (const test of phrases) {
//     const [phrase, expected] = test;
//     const parsed = ruToMs(phrase);
//     const humanDateFns = parsed ? msToRu(parsed) : null;
//     console.log(`${parsed === expected}; ${phrase}; ${parsed}; ${expected}; через ${humanDateFns}`);
//   }
//   process.exit(0);
// };
// export const testRuToWeekDays = () => {
//   const inputs = [
//     ['непонятно чё', null],
//     ['Понедельник, вт среда чт', new Set([WeekDayEnum.Monday, WeekDayEnum.Tuesday, WeekDayEnum.Wednesday, WeekDayEnum.Thursday])],
//     ['понедельник, вт, среда, пт', new Set([WeekDayEnum.Monday, WeekDayEnum.Tuesday, WeekDayEnum.Wednesday, WeekDayEnum.Friday])],
//   ] as const;
//   for (const input of inputs) {
//     const [phrase, expected] = input;
//     const parsed = ruToWeekDayEnums(phrase);
//     console.log(`${isEqual(parsed, expected)}; ${phrase}`);
//   }
//   process.exit(0);
// };
