import { useState } from 'react';
import { Button } from "@/components/ui/button"
import { useTheme } from "next-themes"
import { LogOut, Moon, Sun, Trash2 } from 'lucide-react'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { useDeleteAccount } from '@/hooks/use-delete-account'
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/stores/auth-store';

export function SidebarOptions() {
  const { theme, setTheme } = useTheme()
  const signOut = useAuthStore((state) => state.signOut)
  const router = useRouter()
  const { toast } = useToast()
  const deleteAccount = useDeleteAccount();

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
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button 
            variant="ghost" 
            size="icon"
            className="text-destructive hover:text-destructive hover:bg-destructive/10"
            disabled={deleteAccount.isPending}
          >
            {deleteAccount.isPending ? (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-destructive border-t-transparent" />
            ) : (
              <Trash2 className="h-[1.2rem] w-[1.2rem]" />
            )}
            <span className="sr-only">Delete Account</span>
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Account</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete your account? This action cannot be undone and all your data will be permanently deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteAccount.mutate()}
              className="bg-destructive hover:bg-destructive/90"
            >
              Delete Account
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

