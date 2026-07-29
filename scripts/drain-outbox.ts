import { PrismaClient, MailOutboxType, type Prisma } from '@prisma/client';
import { sendContactNotificationMail } from '../src/lib/contact/mail';
import {
  sendAdminNotificationMail,
  sendBookingReceivedMail,
} from '../src/lib/booking/mail';

const prisma = new PrismaClient();
const BATCH_SIZE = 50;
const MAX_BACKOFF_MS = 60 * 60 * 1000;

type OutboxWithRelations = Prisma.MailOutboxGetPayload<{
  include: {
    booking: { include: { package: true } };
    contactRequest: true;
  };
}>;

function errorText(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

function nextAttemptAt(attemptCount: number): Date {
  const wait = Math.min(
    2 ** Math.max(0, attemptCount - 1) * 60_000,
    MAX_BACKOFF_MS
  );
  return new Date(Date.now() + wait);
}

async function send(outbox: OutboxWithRelations) {
  if (outbox.type === MailOutboxType.CONTACT_ADMIN) {
    if (!outbox.contactRequest) throw new Error('Contact request not found');
    return sendContactNotificationMail(outbox.contactRequest);
  }

  if (!outbox.booking) throw new Error('Booking not found');
  if (outbox.type === MailOutboxType.BOOKING_CUSTOMER) {
    if (!outbox.recipient) throw new Error('Customer e-mail address not found');
    return sendBookingReceivedMail(
      outbox.recipient,
      outbox.booking,
      outbox.booking.package
    );
  }
  return sendAdminNotificationMail(outbox.booking, outbox.booking.package);
}

async function main() {
  let processed = 0;
  const now = new Date();
  const queue = await prisma.mailOutbox.findMany({
    where: { sentAt: null, nextAttemptAt: { lte: now } },
    orderBy: { createdAt: 'asc' },
    take: BATCH_SIZE,
    include: {
      booking: { include: { package: true } },
      contactRequest: true,
    },
  });

  for (const outbox of queue) {
    try {
      const result = await send(outbox);
      if (!result.sent) throw new Error(result.error ?? 'Could not send the e-mail');
      await prisma.mailOutbox.update({
        where: { id: outbox.id },
        data: { sentAt: new Date(), lastError: null },
      });
      processed += 1;
    } catch (error) {
      const attemptCount = outbox.attemptCount + 1;
      await prisma.mailOutbox.update({
        where: { id: outbox.id },
        data: {
          attemptCount,
          nextAttemptAt: nextAttemptAt(attemptCount),
          lastError: errorText(error).slice(0, 1000),
        },
      });
      console.error(`[mail-outbox] ${outbox.id} failed:`, errorText(error));
    }
  }

  console.log(`[mail-outbox] ${processed}/${queue.length} sent.`);
}

main()
  .catch((error) => {
    console.error('[mail-outbox] Worker error:', errorText(error));
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
