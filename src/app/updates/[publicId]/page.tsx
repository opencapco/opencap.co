"use server";

import { dayjsExt } from "@/common/dayjs";
import { SharePageLayout } from "@/components/share/page-layout";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import UpdateRenderer from "@/components/update/renderer";
import { db } from "@/server/db";
import { render } from "jsx-email";
import { notFound } from "next/navigation";
import { Fragment } from "react";

const PublicUpdatePage = async ({
  params: { publicId },
}: {
  params: { publicId: string };
}) => {
  const update = await db.update.findFirst({
    where: {
      publicId,
    },

    include: {
      company: {
        select: {
          name: true,
          logo: true,
        },
      },

      author: {
        select: {
          title: true,
          user: {
            select: {
              name: true,
              email: true,
              image: true,
            },
          },
        },
      },
    },
  });

  if (!update) {
    return notFound();
  }

  const company = update?.company;
  const author = update?.author;
  const html = await render(<UpdateRenderer html={update.html} />);

  return (
    <SharePageLayout
      medium="updates"
      company={{
        name: company.name,
        logo: company.logo,
      }}
      title={
        <Fragment>
          <h1 className="text-2xl font-semibold tracking-tight">
            {update.title}
          </h1>
          <p className="text-sm text-muted-foreground">
            Last updated {dayjsExt().to(update.updatedAt)}
          </p>
        </Fragment>
      }
    >
      <Fragment>
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10 rounded-full">
            <AvatarImage src={author.user.image || "/placeholders/user.svg"} />
          </Avatar>

          <div>
            <p className="text-lg font-semibold">{author.user.name}</p>
            <p className="text-sm text-muted-foreground">{author.title}</p>
          </div>
        </div>

        <div className="mt-5">
          <article
            className="prose"
            dangerouslySetInnerHTML={{ __html: html }}
          />
        </div>
      </Fragment>
    </SharePageLayout>
  );
};

export default PublicUpdatePage;
