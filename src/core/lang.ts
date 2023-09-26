export const REMINDER_FIND_NOT_FOUND_ERROR = '❌ Напоминание не найдено. Возможно, напоминание было удалено.';
export const REMINDER_UPDATE_NOT_FOUND_ERROR = '❌ Ошибка сохранения напоминания. Возможно, напоминание было удалено.';
export const REMINDER_ID_FROM_CTX_ACTION_ERROR = '❌ Не удалось получить ID напоминания. Попробуйте другое действие 😉.';

export const REMINDER_DATE_PARSE_ERROR = '⚠️ Неверный формат даты и времени.\nПопробуйте еще раз 😉.';
export const REMINDER_DATE_IN_PAST_ERROR = '⚠️ Напоминание не может быть в прошлом.\nПопробуйте еще раз 😉.';
export const REMINDER_DATE_LESS10SEC_ERROR = '⚠️ Напоминание должно быть позднее чем через 10 секунд.\nПопробуйте еще раз 😉.';
export const REMINDER_PERIOD_PARSE_ERROR = '⚠️ Не удалось распознать периодичность напоминания. Попробуйте еще раз 😉.';
export const REMINDER_INTERVAL_LESS10SEC_ERROR = '⚠️ Интервал повтора не может быть меньше 10 секунд. Попробуйте еще раз 😉.';

export const REMINDER_INPUT_DATE = `
📅 Введите дату и время напоминания. Например:
<i>завтра</i>; <i>во вторник</i>; <i>вечером</i>; <i>23 февраля в 11 00</i>; <i>2024-05-23 23:59</i>
`.trim();
