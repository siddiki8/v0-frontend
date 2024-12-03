export default function ChatLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="overflow-hidden h-screen">
      {children}
    </div>
  )
} 