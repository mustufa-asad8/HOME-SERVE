import { format, parseISO } from 'date-fns';

export const money = (value: number) => new Intl.NumberFormat('en-PK', {
  style: 'currency',
  currency: 'PKR',
  maximumFractionDigits: 0,
}).format(value);

export const prettyDate = (date: string) => format(parseISO(date), 'EEE, d MMM yyyy');

export const statusLabel = (status: string) => status.replaceAll('_', ' ').replace(/\b\w/g, (letter) => letter.toUpperCase());
