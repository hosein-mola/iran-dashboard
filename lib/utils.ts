import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const useOrigin = () => {
  if (typeof window !== 'undefined') {
    // This block will only run on the client side
    return `${window.location.protocol}//${window.location.host}`;
  }

  // Return an empty string or a default value if on the server side
  return '';
};
