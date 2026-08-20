import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hash } from 'bcryptjs';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { teamName, leaderName, leaderRollNo, leaderPhone, leaderEmail, department, members } = body;

    if (!teamName || !leaderName || !leaderRollNo || !leaderPhone) {
      return NextResponse.json({ error: 'Missing required leader details' }, { status: 400 });
    }

    // Check if team name already exists
    const existingTeamName = await prisma.team.findFirst({
      where: { teamName: { equals: teamName, mode: 'insensitive' } }
    });
    if (existingTeamName) {
      return NextResponse.json({ error: 'Team name is already taken' }, { status: 400 });
    }

    // Check if leader roll number is already registered in another team
    const existingLeader = await prisma.team.findFirst({
      where: { leaderRollNo: { equals: leaderRollNo, mode: 'insensitive' } }
    });
    if (existingLeader) {
      return NextResponse.json({ error: 'Leader roll number is already registered' }, { status: 400 });
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { rollNo: leaderRollNo }
    });
    if (existingUser) {
      return NextResponse.json({ error: 'User with this roll number already exists' }, { status: 400 });
    }

    // Hash default password
    const hashedPassword = await hash('12345', 10);

    // Create the Team, User, and TeamMembers in a transaction
    const newTeam = await prisma.$transaction(async (tx) => {
      // 1. Create User
      const user = await tx.user.create({
        data: {
          name: leaderName,
          rollNo: leaderRollNo,
          email: leaderEmail || null,
          phone: leaderPhone || null,
          passwordHash: hashedPassword,
          mustChangePassword: true,
          role: 'TEAM',
          status: 'ACTIVE',
        }
      });

      // 2. Create Team linked to User
      const team = await tx.team.create({
        data: {
          teamName,
          leaderName,
          leaderRollNo,
          leaderPhone,
          leaderEmail,
          institution: department, // Storing department in institution field
          registrationStatus: 'ACCOUNT_CREATED', // Mark as account created
          userId: user.id, // Link the user
          members: {
            create: [
              // Add leader as a member
              {
                name: leaderName,
                rollNo: leaderRollNo,
                phone: leaderPhone,
                email: leaderEmail,
              },
              // Add other members
              ...(members || []).map((m: { name: string; rollNo: string; phone: string; email?: string }) => ({
                name: m.name,
                rollNo: m.rollNo,
                phone: m.phone,
                email: m.email,
              }))
            ]
          }
        },
        include: { members: true }
      });
      return team;
    });

    return NextResponse.json({ success: true, team: newTeam }, { status: 201 });
  } catch (error) {
    console.error('Registration Error:', error);
    return NextResponse.json({ error: 'Internal server error', details: error instanceof Error ? error.message : String(error) }, { status: 500 });
  }
}
