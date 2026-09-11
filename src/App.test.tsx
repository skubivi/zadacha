import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import App from './App'

describe('experience flow', () => {
  it('opens with only the typographic experiment title', () => {
    render(<App />)
    expect(screen.getByRole('heading', { name: 'Мысленный эксперимент' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Исследовать' })).not.toBeInTheDocument()
    expect(screen.queryByText(/Выберем две случайные точки/)).not.toBeInTheDocument()
  })

  it('moves from the problem into rectangle setup', async () => {
    render(<App />)
    fireEvent.click(await screen.findByRole('button', { name: 'Исследовать' }, { timeout: 5000 }))
    expect(await screen.findByRole('heading', { name: 'Задайте параметры' })).toBeInTheDocument()
    expect(await screen.findByRole('slider', { name: 'Сторона a' }, { timeout: 5000 })).toHaveValue('1')
    expect(screen.getByRole('slider', { name: 'Сторона b' })).toHaveValue('1')
  }, 10_000)
})
