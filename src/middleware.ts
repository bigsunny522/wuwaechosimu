import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// 旧ドメイン→新ドメインへの301リダイレクト。Google検索結果の重複解消・評価引き継ぎ用。
const OLD_HOSTS = ['wuwaechosimu.xyzack271.com'];
const CANONICAL_HOST = 'wuwaechotools.com';

export function middleware(request: NextRequest) {
  const host = request.headers.get('host') ?? '';
  if (OLD_HOSTS.includes(host)) {
    const url = new URL(request.url);
    url.protocol = 'https';
    url.host = CANONICAL_HOST;
    url.port = '';
    return NextResponse.redirect(url, 301);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image).*)'],
};
