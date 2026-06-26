export const FEATURES = {
  CIRCLES_ENABLED: false,
  MOSQUE_FINDER: true,
} as const

export type FeatureName = keyof typeof FEATURES

export function isFeatureEnabled(name: FeatureName): boolean {
  return FEATURES[name] === true
}
