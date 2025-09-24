import AuthLayout from "@/components/AuthLayout"

export default function ChatLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <AuthLayout>{children}</AuthLayout>
}
