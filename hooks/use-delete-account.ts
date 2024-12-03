import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { useAuthStore } from '@/lib/stores/auth-store';
import chatAPI from '@/lib/api-client';

export function useDeleteAccount() {
  const router = useRouter();
  const { toast } = useToast();
  const signOut = useAuthStore((state) => state.signOut);

  return useMutation({
    mutationFn: () => chatAPI.deleteAccount(),
    onSuccess: async () => {
      await signOut();
      toast({
        title: "Account Deleted",
        description: "Your account has been successfully deleted.",
      });
      router.push('/login');
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete account",
        variant: "destructive",
      });
    }
  });
} 