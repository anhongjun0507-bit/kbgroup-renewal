/**
 * 조건부 className 머지 유틸.
 * 거짓값(false/null/undefined)은 제거하고 공백으로 join.
 *
 * @example
 *   cn('px-4', isActive && 'bg-primary', className)
 */
export function cn(
  ...classes: Array<string | false | null | undefined>
): string {
  return classes.filter(Boolean).join(" ");
}
