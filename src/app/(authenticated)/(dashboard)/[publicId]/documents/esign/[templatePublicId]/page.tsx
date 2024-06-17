import { CanvasToolbar } from "@/components/template/canavs-toolbar";
import { PdfCanvas } from "@/components/template/pdf-canvas";
import { TemplateFieldForm } from "@/components/template/template-field-form";
import { Badge } from "@/components/ui/badge";
import { TemplateFieldProvider } from "@/providers/template-field-provider";
import { withServerSession } from "@/server/auth";
import { api } from "@/trpc/server";

const EsignTemplateDetailPage = async ({
  params: { templatePublicId },
}: {
  params: { templatePublicId: string };
}) => {
  const session = await withServerSession();

  const { name, status, url, fields, recipients, templateId, orderedDelivery } =
    await api.template.get.query({
      publicId: templatePublicId,
      isDraftOnly: true,
    });

  return (
    <TemplateFieldProvider recipients={recipients} fields={fields}>
      <TemplateFieldForm
        companyPublicId={session.user.companyPublicId}
        templatePublicId={templatePublicId}
      >
        <div className="grid grid-cols-12">
          <div className="col-span-12 flex align-middle">
            <Badge
              variant={status === "DRAFT" ? "warning" : "success"}
              className="h-7 align-middle"
            >
              {status}
            </Badge>
            <span className="ml-2 align-middle text-xl font-semibold">
              {name}
            </span>
          </div>
          <CanvasToolbar
            orderedDelivery={orderedDelivery}
            templateId={templateId}
            recipients={recipients}
          />
          <PdfCanvas mode="edit" recipients={recipients} url={url} />
        </div>
      </TemplateFieldForm>
    </TemplateFieldProvider>
  );
};

export default EsignTemplateDetailPage;
