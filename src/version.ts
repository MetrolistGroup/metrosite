type BuildVersion = 'current' | 'kmp'

export const build: BuildVersion = (process.env.BUILD as BuildVersion) ?? 'current'
