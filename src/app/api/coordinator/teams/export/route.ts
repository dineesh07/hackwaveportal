import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import ExcelJS from 'exceljs';

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id || !['COORDINATOR', 'ADMIN'].includes(session.user.role || '')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get valid users to prune any orphaned teams (consistent with coordinator teams page)
    const allUsers = await prisma.user.findMany({ select: { id: true, rollNo: true } });
    const userIds = new Set(allUsers.map((u) => u.id));
    const userRollNos = new Set(allUsers.map((u) => u.rollNo));

    const teams = await prisma.team.findMany({
      where: {
        status: 'ACTIVE',
        registrationStatus: { not: 'REJECTED' },
      },
      orderBy: { createdAt: 'asc' },
      include: {
        members: true,
        mentorAssignments: {
          where: { phase: 1 },
          include: {
            mentor: {
              select: { name: true },
            },
          },
        },
        projects: {
          where: { phase: 1 },
          select: {
            problemStatementId: true,
            projectTitle: true,
          },
        },
      },
    });

    // Filter out orphaned teams where the user was deleted
    const validTeams = teams.filter((t) => {
      if (t.userId && !userIds.has(t.userId)) return false;
      if (t.leaderRollNo && !userRollNos.has(t.leaderRollNo)) return false;
      return true;
    });

    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'Hackwave Portal';
    workbook.created = new Date();

    const worksheet = workbook.addWorksheet('Teams List', {
      views: [{ state: 'frozen', ySplit: 1 }],
    });

    // Define columns in exact required order
    worksheet.columns = [
      { header: 'S.No', key: 'sno', width: 8 },
      { header: 'Team ID', key: 'teamId', width: 16 },
      { header: 'Team Name', key: 'teamName', width: 28 },
      { header: 'PS ID', key: 'psId', width: 14 },
      { header: 'Team Member Roll No', key: 'memberRollNo', width: 22 },
      { header: 'Team Member Name', key: 'memberName', width: 26 },
      { header: 'Mentor', key: 'mentor', width: 24 },
    ];

    // Style the Header Row
    const headerRow = worksheet.getRow(1);
    headerRow.height = 28;
    headerRow.eachCell((cell) => {
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF1E293B' }, // Dark slate navy
      };
      cell.font = {
        name: 'Segoe UI',
        size: 11,
        bold: true,
        color: { argb: 'FFFFFFFF' },
      };
      cell.alignment = {
        vertical: 'middle',
        horizontal: 'center',
        wrapText: true,
      };
      cell.border = {
        top: { style: 'thin', color: { argb: 'FF334155' } },
        left: { style: 'thin', color: { argb: 'FF334155' } },
        bottom: { style: 'medium', color: { argb: 'FF0F172A' } },
        right: { style: 'thin', color: { argb: 'FF334155' } },
      };
    });

    const thinBorder: Partial<ExcelJS.Borders> = {
      top: { style: 'thin', color: { argb: 'FFCBD5E1' } },
      left: { style: 'thin', color: { argb: 'FFCBD5E1' } },
      bottom: { style: 'thin', color: { argb: 'FFCBD5E1' } },
      right: { style: 'thin', color: { argb: 'FFCBD5E1' } },
    };

    let currentRow = 2;

    validTeams.forEach((team, teamIndex) => {
      const project = team.projects[0];
      const psId = project?.problemStatementId || 'N/A';
      const mentorName = team.mentorAssignments[0]?.mentor?.name || 'Unassigned';
      const teamIdVal = team.teamCode || team.id;
      const sNo = teamIndex + 1;

      // Compile members: Leader first, followed by additional members
      const leaderRollClean = (team.leaderRollNo || '').trim().toLowerCase();
      const leaderNameClean = (team.leaderName || '').trim().toLowerCase();

      const additionalMembers = (team.members || []).filter((m) => {
        const mRoll = (m.rollNo || '').trim().toLowerCase();
        const mName = (m.name || '').trim().toLowerCase();
        if (leaderRollClean && mRoll === leaderRollClean) return false;
        if (leaderNameClean && mName === leaderNameClean) return false;
        return true;
      });

      const memberList = [
        { name: team.leaderName, rollNo: team.leaderRollNo },
        ...additionalMembers.map((m) => ({ name: m.name, rollNo: m.rollNo || 'N/A' })),
      ];

      // Ensure at least one member row exists
      if (memberList.length === 0) {
        memberList.push({ name: team.leaderName || 'N/A', rollNo: team.leaderRollNo || 'N/A' });
      }

      const blockStartRow = currentRow;
      const blockEndRow = currentRow + memberList.length - 1;
      const isEvenTeam = teamIndex % 2 === 0;
      const blockBgColor = isEvenTeam ? 'FFFFFFFF' : 'FFF8FAFC'; // Alternating team block fill

      memberList.forEach((member, memberIdx) => {
        const rowNum = blockStartRow + memberIdx;
        const row = worksheet.getRow(rowNum);
        row.height = 22;

        // Set cells for the row
        // On first row of the block, set team-level values
        if (memberIdx === 0) {
          row.getCell(1).value = sNo;
          row.getCell(2).value = teamIdVal;
          row.getCell(3).value = team.teamName;
          row.getCell(4).value = psId;
          row.getCell(7).value = mentorName;
        }

        // Set member specific values on every row
        row.getCell(5).value = member.rollNo;
        row.getCell(6).value = member.name;

        // Style all 7 cells for this row
        for (let col = 1; col <= 7; col++) {
          const cell = row.getCell(col);
          cell.border = thinBorder;
          cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: blockBgColor },
          };
          cell.font = {
            name: 'Segoe UI',
            size: 10,
            color: { argb: 'FF1E293B' },
          };

          // Alignment based on column type
          if (col === 1 || col === 2 || col === 4 || col === 5) {
            cell.alignment = { vertical: 'middle', horizontal: 'center' };
          } else {
            cell.alignment = { vertical: 'middle', horizontal: 'left' };
          }
        }
      });

      // Merge team-level cells vertically if team has more than 1 member
      if (memberList.length > 1) {
        // Col 1: S.No
        worksheet.mergeCells(blockStartRow, 1, blockEndRow, 1);
        // Col 2: Team ID
        worksheet.mergeCells(blockStartRow, 2, blockEndRow, 2);
        // Col 3: Team Name
        worksheet.mergeCells(blockStartRow, 3, blockEndRow, 3);
        // Col 4: PS ID
        worksheet.mergeCells(blockStartRow, 4, blockEndRow, 4);
        // Col 7: Mentor
        worksheet.mergeCells(blockStartRow, 7, blockEndRow, 7);

        // Ensure merged cells keep their borders and alignments properly in ExcelJS
        for (let r = blockStartRow; r <= blockEndRow; r++) {
          const row = worksheet.getRow(r);
          for (let col = 1; col <= 7; col++) {
            row.getCell(col).border = thinBorder;
          }
        }
      }

      currentRow = blockEndRow + 1;
    });

    // Auto-fit / auto-adjust column widths based on content
    worksheet.columns.forEach((column) => {
      let maxLen = column.header ? column.header.toString().length : 12;
      column.eachCell?.({ includeEmpty: false }, (cell) => {
        const valStr = cell.value ? cell.value.toString() : '';
        if (valStr.length > maxLen) {
          maxLen = valStr.length;
        }
      });
      column.width = Math.max(maxLen + 4, 12);
    });

    const buffer = await workbook.xlsx.writeBuffer();

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': 'attachment; filename="Teams_List.xlsx"',
      },
    });
  } catch (error) {
    console.error('Error generating Teams Excel export:', error);
    return NextResponse.json({ error: 'Failed to generate Excel export' }, { status: 500 });
  }
}
