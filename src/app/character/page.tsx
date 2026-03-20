import { redirect } from 'next/navigation';

/**
 * /character → redirects to homepage #characters section
 * Character showcase is consolidated into the homepage as section 2
 */
export default function CharacterRedirect() {
  redirect('/#characters');
}
