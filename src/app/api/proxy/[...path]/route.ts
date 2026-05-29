import { NextRequest, NextResponse } from "next/server";

const RAW_BACKEND_URL =
  process.env.BACKEND_API_URL?.trim() ||
  process.env.NEXT_PUBLIC_API_URL?.trim();

function buildBackendUrl(pathSegments: string[], search: string) {
  if (!RAW_BACKEND_URL) {
    throw new Error("Missing backend API URL for proxy route.");
  }

  const normalizedBase = RAW_BACKEND_URL.replace(/\/+$/, "");
  const normalizedPath = pathSegments.map(encodeURIComponent).join("/");
  return `${normalizedBase}/${normalizedPath}${search}`;
}

async function proxyRequest(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> },
) {
  const { path } = await context.params;
  const targetUrl = buildBackendUrl(path, request.nextUrl.search);

  const headers = new Headers();
  const authorization = request.headers.get("authorization");
  const contentType = request.headers.get("content-type");
  const accept = request.headers.get("accept");

  if (authorization) {
    headers.set("authorization", authorization);
  }
  if (contentType) {
    headers.set("content-type", contentType);
  }
  if (accept) {
    headers.set("accept", accept);
  }

  const init: RequestInit = {
    method: request.method,
    headers,
    cache: "no-store",
  };

  if (request.method !== "GET" && request.method !== "HEAD") {
    init.body = await request.arrayBuffer();
  }

  try {
    const response = await fetch(targetUrl, init);
    const responseHeaders = new Headers();
    const passthroughHeaders = [
      "content-type",
      "content-disposition",
      "cache-control",
    ];

    for (const header of passthroughHeaders) {
      const value = response.headers.get(header);
      if (value) {
        responseHeaders.set(header, value);
      }
    }

    const body = await response.arrayBuffer();

    return new NextResponse(body, {
      status: response.status,
      statusText: response.statusText,
      headers: responseHeaders,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to reach backend API.";

    return NextResponse.json(
      {
        message,
      },
      { status: 503 },
    );
  }
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> },
) {
  return proxyRequest(request, context);
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> },
) {
  return proxyRequest(request, context);
}

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> },
) {
  return proxyRequest(request, context);
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> },
) {
  return proxyRequest(request, context);
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> },
) {
  return proxyRequest(request, context);
}
