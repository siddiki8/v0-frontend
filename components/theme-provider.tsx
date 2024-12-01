"use client"

import * as React from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"
import { type ThemeProviderProps } from "next-themes"
import { useTheme } from "next-themes"

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return (
    <NextThemesProvider {...props}>
      {children}
    </NextThemesProvider>
  )
}

// Add this new component
export function ThemeWatcher() {
  const { theme } = useTheme()

  React.useEffect(() => {
    document.documentElement.className = theme || ''
  }, [theme])

  return null
}

