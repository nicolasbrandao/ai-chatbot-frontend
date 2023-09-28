export const dateFormatter = (dateTimeString: string) => {
  const date = new Date(dateTimeString);

  const formattedDate = date.toLocaleString(undefined, {
    year: "numeric",
    month: "numeric",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
  });

  return formattedDate;
};

// Used to filter chat histories by date TODO: we need to improve this, maybe create a class
const today = new Date();
const yesterday = new Date();
yesterday.setDate(yesterday.getDate() - 1);
const previousWeek = new Date();
previousWeek.setDate(previousWeek.getDate() - 7);

export const isToday = (date: Date) => {
  const chatDate = new Date(date);
  return (
    chatDate.getDate() === today.getDate() &&
    chatDate.getMonth() === today.getMonth() &&
    chatDate.getFullYear() === today.getFullYear()
  );
};

export const isYesterday = (date: Date) => {
  const chatDate = new Date(date);
  return (
    chatDate.getDate() === yesterday.getDate() &&
    chatDate.getMonth() === yesterday.getMonth() &&
    chatDate.getFullYear() === yesterday.getFullYear()
  );
};

export const isPreviousWeek = (date: Date) => {
  const chatDate = new Date(date);
  return chatDate < yesterday && chatDate >= previousWeek;
};

export const isPreviousMonth = (date: Date) => {
  const chatDate = new Date(date);
  return chatDate < previousWeek;
};
