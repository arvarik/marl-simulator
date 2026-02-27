import { describe, it, expect } from 'vitest';
import { cn } from '../utils';

describe('cn utility', () => {
    it('should merge class names correctly', () => {
        expect(cn('c-1', 'c-2')).toBe('c-1 c-2');
    });

    it('should handle conditional class names', () => {
        expect(cn('c-1', true && 'c-2', false && 'c-3')).toBe('c-1 c-2');
    });

    it('should handle null, undefined, and boolean inputs', () => {
        expect(cn('c-1', null, undefined, false, 'c-2')).toBe('c-1 c-2');
    });

    it('should merge tailwind classes', () => {
        expect(cn('p-4', 'p-2')).toBe('p-2');
        expect(cn('px-2 py-1', 'p-4')).toBe('p-4');
        expect(cn('bg-red-500', 'bg-blue-500')).toBe('bg-blue-500');
    });

    it('should handle complex combinations', () => {
        expect(cn('text-red-500', true && 'text-blue-500', 'bg-black')).toBe('text-blue-500 bg-black');
    });

    it('should handle arrays and objects', () => {
        expect(cn(['c-1', 'c-2'], { 'c-3': true, 'c-4': false })).toBe('c-1 c-2 c-3');
    });

    it('should handle empty inputs', () => {
        expect(cn()).toBe('');
    });
});
