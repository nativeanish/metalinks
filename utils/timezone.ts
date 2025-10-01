export default function numberToOffsetString(offset: number): string {
  console.log(offset);
  const sign = offset >= 0 ? "+" : "-";
  const abs = Math.abs(offset);

  const hours = Math.floor(abs);
  const minutes = Math.round((abs - hours) * 60);

  // pad with leading zeros
  const hh = String(hours).padStart(2, "0");
  const mm = String(minutes).padStart(2, "0");

  return `UTC${sign}${hh}:${mm}`;
}
