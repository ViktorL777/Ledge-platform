import { redirect } from 'next/navigation';

// The standalone 360° app now lives at ledge360.online and is
// listed under /measurement. Old /360 links redirect to the hub.
export default function Redirect360() {
  redirect('/measurement');
}
