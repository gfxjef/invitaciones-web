/**
 * Short URL Redirect Page
 *
 * WHY: Handles personalized short URLs like /w3d/Carlos&Maria
 *      and redirects to the actual invitation page
 *
 * ROUTE: /[code]/[names] (e.g., /fdg/Ss, /w3d/Carlos&Maria)
 *
 * FLOW:
 *   User visits: localhost:3000/fdg/Ss
 *   → This page receives params: { code: 'fdg', names: 'Ss' }
 *   → Redirects to: /invitacion/{url_slug}
 */

import { redirect } from 'next/navigation';
import { headers } from 'next/headers';

interface PageProps {
  params: {
    code: string;
    names: string;
  };
}

/**
 * Server-side function to fetch invitation by short URL
 */
async function getInvitationByShortUrl(code: string, names: string) {
  try {
    // Call backend API to get invitation by short_code and custom_names
    // NEXT_PUBLIC_API_URL already includes /api, so don't add it again
    const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

    // Backend endpoint expects query like:
    // SELECT * FROM invitations WHERE short_code='fdg' AND custom_names='Ss'
    // NOTE: Next.js already decodes params, so DON'T encode again!
    // Browser: /kkd/1111%26333 → Next.js params: { names: "1111&333" } ✅
    const response = await fetch(
      `${apiBaseUrl}/short-url/redirect?code=${code}&names=${encodeURIComponent(names)}`,
      {
        cache: 'no-store', // Always fetch fresh data
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      console.error(`Short URL not found: ${code}/${names}`);
      return null;
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching short URL:', error);
    return null;
  }
}

/**
 * Page component that handles the redirect
 * This runs on the server, so it's SEO-friendly
 */
export default async function ShortUrlRedirectPage({ params }: PageProps) {
  const { code, names } = params;

  console.log(`[Short URL] Received request: /${code}/${names}`);

  // Fetch invitation data from backend
  const invitationData = await getInvitationByShortUrl(code, names);

  if (!invitationData || !invitationData.url_slug) {
    console.error(`[Short URL] No invitation found for: ${code}/${names}`);
    // Redirect to 404 or home page
    redirect('/');
  }

  // Redirect to the actual invitation page
  const invitationUrl = `/invitacion/${invitationData.url_slug}`;
  console.log(`[Short URL] Redirecting to: ${invitationUrl}`);

  redirect(invitationUrl);
}

/**
 * Metadata for SEO (optional but recommended)
 */
export async function generateMetadata({ params }: PageProps) {
  const { code, names } = params;

  return {
    title: `Invitación: ${decodeURIComponent(names)}`,
    description: `Invitación digital personalizada`,
    robots: 'noindex, nofollow', // Don't index short URLs, only the real invitation
  };
}
