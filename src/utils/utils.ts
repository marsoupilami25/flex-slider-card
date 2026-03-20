export function debuglog(message: unknown): void {
  const debug: boolean = true; // set to true to enable debug logging
  
  if (debug) {
    console.log(message);
  }
}

export function minutesToTime(minutes: number): string {
  const hours: string = Math.floor(minutes / 60)
    .toString()
    .padStart(2, "0");
  const mins: string = (minutes % 60)
    .toString()
    .padStart(2, "0");
  return `${hours}:${mins}`;
}

export function timeToMinutes(time: string): number {
  const [hours, minutes]: number [] = time.split(":").map(Number);
  return hours * 60 + minutes;
}
