export function formatZar(value: number): string {
  return `R${new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
    .format(value)}`;
}
