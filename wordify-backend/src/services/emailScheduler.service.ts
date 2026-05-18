import { Resend } from "resend";
import { prisma } from "../server";
import config from "../config/index";
import { Set, User } from "@prisma/client";
import { ApiError } from "../utils/apiError";

const resend = new Resend(config.resendApiKey);

interface IScheduleDirectEmail {
  user: User;
  set: Set;
  nextTimeReviewDate: Date;
  currentStage: number;
}

export const getUserSetProgressBySetId = async ({ id }: Set) => {
  return await prisma.userSetProgress.findUnique({ where: { setId: id } });
}

export const scheduleDirectEmail = async ({
  user: { email, name },
  set: { folderId, id, name: setName },
  nextTimeReviewDate,
  currentStage,
}: IScheduleDirectEmail) => {
  const targetDate = nextTimeReviewDate.toISOString();

  const { error } = await resend.emails.send({
    from: config.emailForSendingNotifications,
    to: [email],
    subject: `Review your set ${setName}`,
    html: `
     Yoyyy, ${name}, it is time to repeat your set. Log in to review your set by <a href="${config.frontendUrl}/home/folders/${folderId}/sets/${id}" target="_blank">url</a> 
    `,
    scheduledAt: targetDate,
  });

  await prisma.userSetProgress.update({
    where: { setId: id },
    data: { nextReviewDate: targetDate, currentStage },
  });

  if (error) {
    throw new ApiError(500, `An error with email service occurred`);
  }
};
