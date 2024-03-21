export function bytesToMegabytes(bytes) {
  return (bytes / (1024 * 1024)).toFixed(2); // Convert bytes to megabytes and round to 2 decimal places
}
