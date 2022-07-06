const SECONDS_PER_HOUR = 3600;
const MILLISECOND_PER_SECOND = 1000;

export const getHourDifference = (dateOne, dateTwo) => {
  const firstDate = new Date(dateOne);
  const secondDate = new Date(dateTwo);
  let difference = (secondDate.getTime() - firstDate.getTime()) / MILLISECOND_PER_SECOND;
  difference /= SECONDS_PER_HOUR;
  return Math.abs(Math.round(difference))
}

export const prettyPrint = (label, data) => {
  console.log(label, JSON.stringify(data, null, 2));
}
