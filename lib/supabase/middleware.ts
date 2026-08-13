import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function updateSession(request: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return NextResponse.next({ request });
  }

  let supabaseResponse = NextResponse.next({ request });

  try {
    const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    });

    // Refresh auth token
    const { data: { user } } = await supabase.auth.getUser();

    const url = request.nextUrl.clone();

    // Protect all /dashboard routes
    if (url.pathname.startsWith('/dashboard')) {
      if (!user) {
        url.pathname = '/login';
        return NextResponse.redirect(url);
      }

      // Hard check for admin route
      if (url.pathname.startsWith('/dashboard/admin')) {
        if (user.email !== 'gdscsxhaakee123@gmail.com') {
          url.pathname = '/dashboard';
          return NextResponse.redirect(url);
        }
      }
    }

    // Redirect authenticated users away from auth pages to dashboard
    if (url.pathname.startsWith('/login') || url.pathname.startsWith('/signup')) {
      if (user) {
        url.pathname = '/dashboard';
        return NextResponse.redirect(url);
      }
    }

    return supabaseResponse;
  } catch {
    return NextResponse.next({ request });
  }
}
