import { Coordinates, Qibla } from 'adhan';

/** Great-circle bearing from the location to the Kaaba, in degrees clockwise from true north (0–360). */
export function qiblaBearing(latitude: number, longitude: number): number {
  const deg = Qibla(new Coordinates(latitude, longitude));
  return ((deg % 360) + 360) % 360;
}
