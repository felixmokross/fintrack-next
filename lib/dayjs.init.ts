import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import localeData from "dayjs/plugin/localeData";
import weekday from "dayjs/plugin/weekday";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";
// import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
import customParseFormat from "dayjs/plugin/customParseFormat";
// import quarterOfYear from "dayjs/plugin/quarterOfYear";
// import advancedFormat from "dayjs/plugin/advancedFormat";
// import "dayjs/locale/de-ch";

dayjs.extend(utc);
dayjs.extend(localeData);
dayjs.extend(weekday);
dayjs.extend(isSameOrAfter);
// dayjs.extend(isSameOrBefore);
dayjs.extend(customParseFormat);
// dayjs.extend(quarterOfYear);
// dayjs.extend(advancedFormat);
