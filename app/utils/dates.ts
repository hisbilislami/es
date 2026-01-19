import dayjs from "dayjs";
import "dayjs/locale/id";

dayjs.locale("id");

export const formatDate = (
  date: Date | string,
  format: string = "YYYY-MM-DD",
) => {
  if (!date) return "";

  return dayjs(date).format(format);
};
