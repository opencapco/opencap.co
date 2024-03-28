import { PdfCanvas } from "@/components/template/pdf-canvas";
import { SigningFields } from "@/components/template/signing-fields";
import { TemplateSigningFieldProvider } from "@/providers/template-signing-field-provider";
import { getServerAuthSession } from "@/server/auth";
import { api } from "@/trpc/server";

interface SigningPageProps {
  params: {
    token: string;
  };
}

export default async function SigningPage(props: SigningPageProps) {
  const { token } = props.params;

  const { fields, url, group, recipientId, templateId } =
    await api.template.getSigningFields.query({
      token,
    });

  const session = await getServerAuthSession();
  const companyPublicId = session?.user.companyPublicId;

  return (
    <TemplateSigningFieldProvider fields={fields}>
      <div className="flex min-h-screen bg-gray-50">
        <div className="flex h-full flex-grow flex-col">
          <div className="mx-auto min-h-full w-full px-5 py-10 lg:px-8 2xl:max-w-screen-xl">
            <div className="grid grid-cols-12">
              <PdfCanvas mode="readonly" url={url} />
            </div>
          </div>
        </div>
        <div className="sticky top-0 flex min-h-full w-80 flex-col lg:border-l">
          <SigningFields
            group={group}
            recipientId={recipientId}
            templateId={templateId}
            fields={fields}
            companyPublicId={companyPublicId}
          />
        </div>
      </div>
    </TemplateSigningFieldProvider>
  );
}
