import { describe, it, expect } from 'vitest'
import { estEndpointCloisonne, appliquerScopingAtelier, type ScopableRequestConfig } from './api'

describe('estEndpointCloisonne', () => {
  it('reconnaît les 4 endpoints cloisonnés', () => {
    expect(estEndpointCloisonne('/api/clientes')).toBe(true)
    expect(estEndpointCloisonne('/api/commandes')).toBe(true)
    expect(estEndpointCloisonne('/api/stock')).toBe(true)
    expect(estEndpointCloisonne('/api/catalogue')).toBe(true)
    expect(estEndpointCloisonne('/api/clientes/abc-123')).toBe(true)
    expect(estEndpointCloisonne('/api/commandes?statut=livre')).toBe(true)
  })

  it("ignore les endpoints non concernés", () => {
    expect(estEndpointCloisonne('/api/paiements')).toBe(false)
    expect(estEndpointCloisonne('/api/auth/login')).toBe(false)
    expect(estEndpointCloisonne(undefined)).toBe(false)
  })
})

describe('appliquerScopingAtelier', () => {
  it('ajoute atelier_id en query param sur un GET', () => {
    const config = appliquerScopingAtelier({ url: '/api/clientes', method: 'get' } as ScopableRequestConfig, 'atelier-1')
    expect(config.params).toEqual({ atelier_id: 'atelier-1' })
  })

  it("laisse atelier_id absent (undefined) pour l'espace principal", () => {
    const config = appliquerScopingAtelier({ url: '/api/clientes', method: 'get' } as ScopableRequestConfig, null)
    expect(config.params).toEqual({ atelier_id: undefined })
  })

  it('ajoute atelierId dans le body sur un POST', () => {
    const config = appliquerScopingAtelier(
      { url: '/api/clientes', method: 'post', data: { nom: 'Aïcha' } },
      'atelier-1'
    )
    expect(config.data).toEqual({ nom: 'Aïcha', atelierId: 'atelier-1' })
  })

  it("ne touche pas au PUT (modification) — n'y injecte jamais atelierId", () => {
    const config = appliquerScopingAtelier(
      { url: '/api/clientes/abc', method: 'put', data: { nom: 'Aïcha modifiée' } },
      'atelier-1'
    )
    expect(config.data).toEqual({ nom: 'Aïcha modifiée' })
  })

  it("ne touche pas aux endpoints non cloisonnés (ex: paiements)", () => {
    const config = appliquerScopingAtelier({ url: '/api/paiements', method: 'get' } as ScopableRequestConfig, 'atelier-1')
    expect(config.params).toBeUndefined()
  })

  it('ne touche pas un FormData (upload)', () => {
    const fd = new FormData()
    const config = appliquerScopingAtelier({ url: '/api/clientes', method: 'post', data: fd }, 'atelier-1')
    expect(config.data).toBe(fd)
  })

  it("ne casse pas si atelierId est déjà fourni explicitement", () => {
    const config = appliquerScopingAtelier(
      { url: '/api/clientes', method: 'post', data: { nom: 'X', atelierId: 'autre-atelier' } },
      'atelier-1'
    )
    expect(config.data).toEqual({ nom: 'X', atelierId: 'autre-atelier' })
  })
})
