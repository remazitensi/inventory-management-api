import { Transform } from 'class-transformer';

export function TransformDate() {
  return Transform(({ value }) => (value ? new Date(value) : value));
}
