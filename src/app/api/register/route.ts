import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { teamName, leaderName, leaderRollNo, leaderPhone, leaderEmail, department, members } = body;

    const tName = (teamName || '').trim();
    const lName = (leaderName || '').trim();
    const lRoll = (leaderRollNo || '').trim();
    const lPhone = (leaderPhone || '').trim();
    const lEmail = (leaderEmail || '').trim();

    if (!tName || !lName || !lRoll || !lPhone) {
      return NextResponse.json({ error: 'Missing required leader details (Team Name, Leader Name, Roll Number, and Phone).' }, { status: 400 });
    }

    const cleanMembers = (members || [])
      .map((m: { name?: string; rollNo?: string; phone?: string; email?: string }) => ({
        name: (m.name || '').trim(),
        rollNo: (m.rollNo || '').trim(),
        phone: (m.phone || '').trim(),
        email: (m.email || '').trim()
      }))
      .filter((m: { name: string; rollNo: string; phone: string; email: string }) => m.name || m.rollNo || m.phone);

    const totalMembers = 1 + cleanMembers.length;
    if (totalMembers < 2 || totalMembers > 4) {
      return NextResponse.json({ error: 'A team must have between 2 and 4 members (including the leader).' }, { status: 400 });
    }

    // All participants in this registration attempt
    const allParticipants = [
      { name: lName, rollNo: lRoll, phone: lPhone, email: lEmail, isLeader: true },
      ...cleanMembers.map((m: { name: string; rollNo: string; phone: string; email: string }) => ({ ...m, isLeader: false }))
    ];


    // 1. Check for internal duplicates within the submitted team
    const seenRolls = new Map<string, string>();
    const seenPhones = new Map<string, string>();
    const seenEmails = new Map<string, string>();

    for (const p of allParticipants) {
      if (p.rollNo) {
        const rollKey = p.rollNo.toLowerCase();
        if (seenRolls.has(rollKey)) {
          return NextResponse.json({
            error: `Registration failed: Roll Number "${p.rollNo}" is duplicated between "${seenRolls.get(rollKey)}" and "${p.name}". Each team member must be unique.`
          }, { status: 400 });
        }
        seenRolls.set(rollKey, p.name);
      }

      if (p.phone) {
        if (seenPhones.has(p.phone)) {
          return NextResponse.json({
            error: `Registration failed: Phone Number "${p.phone}" is duplicated between "${seenPhones.get(p.phone)}" and "${p.name}".`
          }, { status: 400 });
        }
        seenPhones.set(p.phone, p.name);
      }

      if (p.email) {
        const emailKey = p.email.toLowerCase();
        if (seenEmails.has(emailKey)) {
          return NextResponse.json({
            error: `Registration failed: Email "${p.email}" is duplicated between "${seenEmails.get(emailKey)}" and "${p.name}".`
          }, { status: 400 });
        }
        seenEmails.set(emailKey, p.name);
      }
    }

    // 2. Check if Team Name is already registered
    const existingTeamName = await prisma.team.findFirst({
      where: { teamName: { equals: tName, mode: 'insensitive' } },
      select: { teamName: true }
    });
    if (existingTeamName) {
      return NextResponse.json({
        error: `Team name "${tName}" is already registered. Please choose a different team name.`
      }, { status: 400 });
    }

    // 3. Check if any participant (leader or member) is already registered in another team
    for (const p of allParticipants) {
      const participantRole = p.isLeader ? `Team Leader (${p.name})` : `Team Member "${p.name}"`;

      // A. Check Roll Number across existing Leaders and TeamMembers
      if (p.rollNo) {
        const leaderConflict = await prisma.team.findFirst({
          where: { leaderRollNo: { equals: p.rollNo, mode: 'insensitive' } },
          select: { teamName: true, leaderName: true }
        });
        if (leaderConflict) {
          return NextResponse.json({
            error: `Registration failed: ${participantRole} with Roll Number "${p.rollNo}" is already registered as Leader of team "${leaderConflict.teamName}". A student cannot belong to multiple teams.`
          }, { status: 400 });
        }

        const memberConflict = await prisma.teamMember.findFirst({
          where: { rollNo: { equals: p.rollNo, mode: 'insensitive' } },
          include: { team: { select: { teamName: true } } }
        });
        if (memberConflict) {
          return NextResponse.json({
            error: `Registration failed: ${participantRole} with Roll Number "${p.rollNo}" is already registered in team "${memberConflict.team.teamName}". A student cannot belong to multiple teams.`
          }, { status: 400 });
        }

        const userConflict = await prisma.user.findFirst({
          where: { rollNo: { equals: p.rollNo, mode: 'insensitive' } },
          select: { name: true, role: true }
        });
        if (userConflict) {
          return NextResponse.json({
            error: `Registration failed: ${participantRole} with Roll Number "${p.rollNo}" is already registered with an existing account in the system.`
          }, { status: 400 });
        }
      }

      // B. Check Phone Number across existing Leaders and TeamMembers
      if (p.phone) {
        const phoneLeaderConflict = await prisma.team.findFirst({
          where: { leaderPhone: p.phone },
          select: { teamName: true }
        });
        if (phoneLeaderConflict) {
          return NextResponse.json({
            error: `Registration failed: ${participantRole} with Phone "${p.phone}" is already registered in team "${phoneLeaderConflict.teamName}".`
          }, { status: 400 });
        }

        const phoneMemberConflict = await prisma.teamMember.findFirst({
          where: { phone: p.phone },
          include: { team: { select: { teamName: true } } }
        });
        if (phoneMemberConflict) {
          return NextResponse.json({
            error: `Registration failed: ${participantRole} with Phone "${p.phone}" is already registered in team "${phoneMemberConflict.team.teamName}".`
          }, { status: 400 });
        }
      }

      // C. Check Email across existing Leaders and TeamMembers (if provided)
      if (p.email) {
        const emailLeaderConflict = await prisma.team.findFirst({
          where: { leaderEmail: { equals: p.email, mode: 'insensitive' } },
          select: { teamName: true }
        });
        if (emailLeaderConflict) {
          return NextResponse.json({
            error: `Registration failed: ${participantRole} with Email "${p.email}" is already registered in team "${emailLeaderConflict.teamName}".`
          }, { status: 400 });
        }

        const emailMemberConflict = await prisma.teamMember.findFirst({
          where: { email: { equals: p.email, mode: 'insensitive' } },
          include: { team: { select: { teamName: true } } }
        });
        if (emailMemberConflict) {
          return NextResponse.json({
            error: `Registration failed: ${participantRole} with Email "${p.email}" is already registered in team "${emailMemberConflict.team.teamName}".`
          }, { status: 400 });
        }
      }
    }

    // Generate a unique teamCode (e.g. TEAM-001)
    let nextNum = 1;
    const latestTeam = await prisma.team.findFirst({
      orderBy: { createdAt: 'desc' },
      select: { teamCode: true }
    });
    if (latestTeam?.teamCode && latestTeam.teamCode.startsWith('TEAM-')) {
      const parsed = parseInt(latestTeam.teamCode.replace('TEAM-', ''), 10);
      if (!isNaN(parsed)) nextNum = parsed + 1;
    }
    
    let teamCode = `TEAM-${String(nextNum).padStart(3, '0')}`;
    let isUnique = false;
    while (!isUnique) {
      const exists = await prisma.team.findUnique({ where: { teamCode } });
      if (exists) {
        nextNum++;
        teamCode = `TEAM-${String(nextNum).padStart(3, '0')}`;
      } else {
        isUnique = true;
      }
    }

    // Create the Team and TeamMembers in a transaction
    const newTeam = await prisma.$transaction(async (tx) => {
      const team = await tx.team.create({
        data: {
          teamCode,
          teamName: tName,
          leaderName: lName,
          leaderRollNo: lRoll,
          leaderPhone: lPhone,
          leaderEmail: lEmail || null,
          institution: department || null,
          registrationStatus: 'PENDING_VERIFICATION',
          members: {
            create: cleanMembers.map((m: { name: string; rollNo: string; phone: string; email: string }) => ({
              name: m.name,
              rollNo: m.rollNo || null,
              phone: m.phone,
              email: m.email || null,
            }))
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

