'use server'

import { auth, unstable_update } from '@/auth'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function updateProfileName(newName: string) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { error: 'Unauthorized.' };
    }

    if (!newName || newName.trim().length < 2) {
      return { error: 'Name must be at least 2 characters long.' };
    }

    await prisma.user.update({
      where: { id: session.user.id },
      data: { name: newName.trim() }
    });

    // Update the NextAuth JWT token
    await unstable_update({ user: { name: newName.trim() } });

    revalidatePath('/', 'layout');
    
    return { success: true };
  } catch (error) {
    console.error('Error updating profile name:', error);
    return { error: 'Failed to update profile name. Please try again.' };
  }
}
