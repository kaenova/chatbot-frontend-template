import AuthLayout from "@/components/AuthLayout"

export default function ResourceManagementLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <AuthLayout>{children}</AuthLayout>
}