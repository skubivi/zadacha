import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import App from './App'

describe('experience flow', () => {
  it('moves from the problem into rectangle setup', async () => {
    render(<App />)
    fireEvent.click(screen.getByRole('button', { name: 'Исследовать' }))
    expect(await screen.findByRole('slider', { name: 'Сторона a' })).toHaveValue('1')
    expect(screen.getByRole('slider', { name: 'Сторона b' })).toHaveValue('1')
  })

  it('updates a rectangle dimension with the slider', async () => {
    render(<App />)
    fireEvent.click(screen.getByRole('button', { name: 'Исследовать' }))
    fireEvent.change(await screen.findByRole('slider', { name: 'Сторона a' }), { target: { value: '2.4' } })
    expect(screen.getByText('2.4')).toBeInTheDocument()
  })
})
