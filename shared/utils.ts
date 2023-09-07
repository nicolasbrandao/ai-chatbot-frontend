export const dateFormatter = (dateTimeString: string) => {
  const date = new Date(dateTimeString);

  // Determine user's locale for formatting
  const userLocale = navigator.language || "en-US";

  // Options for formatting time
  const timeOptions: Intl.DateTimeFormatOptions = {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true, // Use 12-hour format with AM/PM
  };

  // Create a DateTimeFormat instance with the user's locale and time options
  const dateTimeFormatter = new Intl.DateTimeFormat(userLocale, timeOptions);

  // Format the date and time
  const formattedTime = dateTimeFormatter.format(date);

  return formattedTime;
};
