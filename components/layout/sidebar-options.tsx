import { Button } from "@/components/ui/button"
import { useTheme } from "next-themes"
import { LogOut, Moon, Sun } from 'lucide-react'
import { useAuthStore } from "@/lib/stores/auth-store"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"

export function SidebarOptions() {
  const { theme, setTheme } = useTheme()
  const signOut = useAuthStore((state) => state.signOut)
  const router = useRouter()
  const { toast } = useToast()

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark")
  }

  const handleSignOut = async () => {
    try {
      await signOut()
      router.push('/login')
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to sign out. Please try again.",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="h-14 border-b flex justify-between items-center px-4">
      <Button variant="ghost" size="icon" onClick={toggleTheme}>
        {theme === "dark" ? (
          <Sun className="h-[1.2rem] w-[1.2rem]" />
        ) : (
          <Moon className="h-[1.2rem] w-[1.2rem]" />
        )}
        <span className="sr-only">Toggle theme</span>
      </Button>
      <Button variant="ghost" size="icon" onClick={handleSignOut}>
        <LogOut className="h-[1.2rem] w-[1.2rem]" />
        <span className="sr-only">Sign out</span>
      </Button>
    </div>
  )
}

