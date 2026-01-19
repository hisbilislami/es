import { LoaderFunctionArgs } from "@remix-run/node";
import { data } from "@remix-run/react";

import { requireUserId } from "~/utils/auth.server";
import { prisma } from "~/utils/db.server";
import { pathKeyToUrl } from "~/utils/file-uploads.server";
import {
  getUserSession,
  USER_CRED,
  UserCredential,
} from "~/utils/session.server";

export const loaderHandler = async ({ request }: LoaderFunctionArgs) => {
  try {
    const userId = await requireUserId(request);
    const session = await getUserSession(request);
    const userCredential = (await session.get(USER_CRED)) as UserCredential;

    const [profile, user] = await prisma.$transaction([
      prisma.person.findUnique({
        where: {
          id: userCredential.personId,
        },
        include: {
          sign_files: {
            select: {
              key: true,
              origin_name: true,
            },
          },
        },
      }),
      prisma.user.findUnique({
        select: {
          email: true,
          sync_with_peruri: true,
          role_id: true,
          profile_photo: {
            select: {
              key: true,
            },
          },
          role: {
            select: {
              name: true,
            },
          },
        },
        where: { id: +userId },
      }),
    ]);

    const signatureFileKey = profile?.sign_files?.key;
    let signatureFileUrl: string = "";
    if (signatureFileKey) {
      signatureFileUrl = await pathKeyToUrl(signatureFileKey, 60 * 30);
    }

    let profilePhotoUrl = "";
    if (user?.profile_photo?.key) {
      profilePhotoUrl = await pathKeyToUrl(user?.profile_photo?.key, 60 * 60);
    }

    return data({
      data: {
        ...profile,
        role_id: user?.role_id,
        role_name: user?.role?.name,
        signature_file_url: signatureFileUrl,
        profile_photo_url: profilePhotoUrl,
        email: user?.email,
        sync_with_peruri: user?.sync_with_peruri,
      },
    });
  } catch (error) {
    console.error(error);
    return data({
      data: null,
    });
  }
};
