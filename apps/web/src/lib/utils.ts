import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * Tailwind-aware className combiner. Used by shadcn components and any
 * dk molecule/organism that needs conditional class merging.
 */
export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs))
}
