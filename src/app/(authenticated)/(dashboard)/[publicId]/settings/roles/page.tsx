import { PageLayout } from "@/components/dashboard/page-layout";
import { Allow } from "@/components/rbac/allow";
import { CreateRbacModal } from "@/components/rbac/create-rbac-modal";
import { RoleTable } from "@/components/rbac/role-table";
import { Card } from "@/components/ui/card";
import { api } from "@/trpc/server";

export default async function RolesPage() {
  const data = await api.rbac.listRoles.query();
  return (
    <div className="flex flex-col gap-y-3">
      <PageLayout
        title="Roles"
        description="Manage your roles."
        action={
          <Allow action="create" subject="roles">
            <CreateRbacModal />
          </Allow>
        }
      />

      <Card className="mt-3">
        <div className="p-6">
          <RoleTable roles={data.rolesList} />
        </div>
      </Card>
    </div>
  );
}
