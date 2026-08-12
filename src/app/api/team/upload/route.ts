import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import { getSupabaseAdmin, STORAGE_BUCKET } from '@/lib/supabase';
import { writeAuditLog } from '@/lib/audit';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

const ALLOWED_TYPES: Record<string, string[]> = {
  'image/png': ['.png'],
  'image/jpeg': ['.jpg', '.jpeg'],
  'image/webp': ['.webp'],
  'application/pdf': ['.pdf'],
  'application/msword': ['.doc'],
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
  'application/vnd.ms-powerpoint': ['.ppt'],
  'application/vnd.openxmlformats-officedocument.presentationml.presentation': ['.pptx'],
  'application/vnd.ms-excel': ['.xls'],
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
  'application/zip': ['.zip'],
};

function extFromName(name: string): string {
  const dot = name.lastIndexOf('.');
  return dot === -1 ? '' : name.slice(dot).toLowerCase();
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id || session.user.role !== 'TEAM') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const team = await prisma.team.findFirst({
      where: {
        OR: [
          { userId: session.user.id },
          { members: { some: { rollNo: session.user.rollNo } } }
        ]
      }
    });
    if (!team) return NextResponse.json({ error: 'Team not found' }, { status: 404 });

    const formData = await req.formData();
    const file = formData.get('file');
    const fieldName = formData.get('field') || 'architecture';

    if (!(file instanceof File)) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: 'File exceeds the 10 MB limit' }, { status: 413 });
    }

    if (!file.type || !ALLOWED_TYPES[file.type]) {
      return NextResponse.json({ error: 'File type not allowed. Use PDF, image, or Office documents.' }, { status: 415 });
    }

    const ext = extFromName(file.name);
    const validExts = ALLOWED_TYPES[file.type];
    if (!validExts.includes(ext)) {
      return NextResponse.json({ error: 'File extension does not match its content type.' }, { status: 415 });
    }

    const safeTeam = team.teamName.replace(/[^a-zA-Z0-9-_]/g, '-').toLowerCase();
    const fileName = `${fieldName}-${Date.now()}-${crypto.randomUUID()}${ext}`;
    const filePath = `submissions/${safeTeam}-${team.id.slice(0, 8)}/${fileName}`;

    const arrayBuffer = await file.arrayBuffer();
    const supabaseAdmin = getSupabaseAdmin();
    const { data, error } = await supabaseAdmin.storage
      .from(STORAGE_BUCKET)
      .upload(filePath, arrayBuffer, { contentType: file.type, upsert: false });

    if (error) {
      console.error('Supabase upload error:', error.message);
      return NextResponse.json({ error: 'Upload failed. Please try again.' }, { status: 500 });
    }

    const { data: publicUrl } = supabaseAdmin.storage
      .from(STORAGE_BUCKET)
      .getPublicUrl(data.path);
    await writeAuditLog({
      actorId: session.user.id,
      action: 'FILE_UPLOAD',
      targetType: 'Team',
      targetId: team.id,
      metadata: { field: String(fieldName), size: file.size, type: file.type, path: data.path },
    });

    return NextResponse.json({ success: true, url: publicUrl.publicUrl });
  } catch (error) {
    console.error('Upload Error:', error);
    return NextResponse.json({ error: 'Internal server error', details: error instanceof Error ? error.message : String(error) }, { status: 500 });
  }
}
