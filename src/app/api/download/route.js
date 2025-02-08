import { NextResponse } from 'next/server';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const videoUrl = searchParams.get('videoUrl');
  const filename = searchParams.get('filename');

  if (!videoUrl) {
    return NextResponse.json(
      { error: "Missing videoUrl parameter" },
      { status: 400 }
    );
  }

  try {
    const response = await fetch(videoUrl);
    if (!response.ok) {
      return NextResponse.json(
        { error: "Error fetching video file" },
        { status: response.status }
      );
    }

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Create response with appropriate headers for file download
    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Disposition': `attachment; filename="${filename || 'video.mp4'}"`,
        'Content-Type': response.headers.get('Content-Type') || 'application/octet-stream'
      }
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error", message: error.message },
      { status: 500 }
    );
  }
} 