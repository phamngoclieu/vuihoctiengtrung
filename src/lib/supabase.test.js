import { describe, expect, it } from 'vitest'
import { getAuthRedirectUrl, publicAppUrl } from './supabase.js'

describe('Supabase auth redirects', () => {
  it('uses the public website instead of localhost for email confirmation', () => {
    expect(publicAppUrl).toBe('https://phamngoclieu.github.io/vuihoctiengtrung/')
    expect(getAuthRedirectUrl('confirmed')).toBe('https://phamngoclieu.github.io/vuihoctiengtrung/?auth=confirmed')
  })

  it('sends password recovery back to the public website', () => {
    expect(getAuthRedirectUrl('recovery')).toBe('https://phamngoclieu.github.io/vuihoctiengtrung/?auth=recovery')
  })
})
