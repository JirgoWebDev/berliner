'use server';

import prisma from '@/lib/prisma';

export async function submitFeedback(rating: number, comment: string | null) {
  if (rating < 1 || rating > 5) return { success: false, error: 'Invalid rating' };

  try {
    await prisma.feedback.create({
      data: {
        rating,
        comment: comment?.trim() || null,
      },
    });
    return { success: true };
  } catch (error) {
    return { success: false, error: 'Failed to submit feedback' };
  }
}
