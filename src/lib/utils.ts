import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Hardcoded admin user id for development purposes
export const ADMIN_USER_ID = "ea55fc94-ba42-47fc-bc46-e75664a8b2ba";
