import { type NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('query');
    const start = searchParams.get('start') || '0';
    const limit = searchParams.get('limit') || '100'; 
    if (!query) {
      return NextResponse.json(
        { error: 'Query parameter is required' },
        { status: 400 }
      );
    }

    const response = await fetch(
      `https://api.proxynova.com/comb?query=${encodeURIComponent(query)}&start=${start}&limit=${limit}`,
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Your query is too short. Minimum 4 characters required.' },
        { status: response.status }
      );
    }

    const data = await response.json();

    if (!data.lines || !data.count) {
      return NextResponse.json(
        {
          error: 'Nothing Found',
          details: 'The API response did not contain the expected fields.'
        },
        { status: 500 }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
