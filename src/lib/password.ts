export const passwordRules = [
  { id: 'length', label: 'At least 6 characters', test: (value: string) => value.length >= 6 },
  { id: 'number', label: 'At least 1 number', test: (value: string) => /\d/.test(value) },
  { id: 'uppercase', label: 'At least 1 capital letter', test: (value: string) => /[A-Z]/.test(value) },
] as const

export function passwordProblems(value: string) {
  return passwordRules.filter((rule) => !rule.test(value)).map((rule) => rule.label)
}

export function isValidPassword(value: string) {
  return passwordProblems(value).length === 0
}
