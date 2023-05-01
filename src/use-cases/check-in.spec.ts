import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { Decimal } from '@prisma/client/runtime/library'

import { InMemoryCheckInsRepository } from '@/repositories/in-memory/in-memory-check-ins-repository'
import { InMemoryGymsRepository } from '@/repositories/in-memory/in-memory-gyms-repositry'

import { CheckInUseCase } from './check-in'

let checkInsRepository: InMemoryCheckInsRepository
let gymsRepository: InMemoryGymsRepository
let sut: CheckInUseCase

describe('Check-in Use Case', () => {
  beforeEach(() => {
    checkInsRepository = new InMemoryCheckInsRepository()
    gymsRepository = new InMemoryGymsRepository()
    sut = new CheckInUseCase(checkInsRepository, gymsRepository)

    gymsRepository.items.push({
      id: 'gym-01',
      title: 'JS Gym',
      description: '',
      phone: '',
      latitude: new Decimal(-22.1010886),
      longitude: new Decimal(-43.1673162),
    })

    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('should be able to check in', async () => {
    const { checkIn } = await sut.execute({
      gymId: 'gym-01',
      userId: 'user-01',
      userLatitude: -22.1010886,
      userLongitude: -43.1673162,
    })

    expect(checkIn.id).toEqual(expect.any(String))
  })

  it('should not be able to check in twice in the same day', async () => {
    vi.setSystemTime(new Date(2022, 0, 20, 8, 0, 0))

    await sut.execute({
      gymId: 'gym-01',
      userId: 'user-01',
      userLatitude: -22.1010886,
      userLongitude: -43.1673162,
    })

    await expect(
      sut.execute({
        gymId: 'gym-01',
        userId: 'user-01',
        userLatitude: -22.1010886,
        userLongitude: -43.1673162,
      }),
    ).rejects.toBeInstanceOf(Error)
  })

  it('should be able to check in twice but in different days', async () => {
    vi.setSystemTime(new Date(2022, 0, 20, 8, 0, 0))

    await sut.execute({
      gymId: 'gym-01',
      userId: 'user-01',
      userLatitude: -22.1010886,
      userLongitude: -43.1673162,
    })

    vi.setSystemTime(new Date(2022, 0, 21, 8, 0, 0))

    const { checkIn } = await sut.execute({
      gymId: 'gym-01',
      userId: 'user-01',
      userLatitude: -22.1010886,
      userLongitude: -43.1673162,
    })

    expect(checkIn.id).toEqual(expect.any(String))
  })

  it('should not be able to check in on distant gym', async () => {
    gymsRepository.items.push({
      id: 'gym-02',
      title: 'Node Gym',
      description: '',
      phone: '',
      latitude: new Decimal(-21.8588887),
      longitude: new Decimal(-42.6740718),
    })

    await expect(() =>
      sut.execute({
        gymId: 'gym-02',
        userId: 'user-01',
        userLatitude: -22.1010886,
        userLongitude: -43.1673162,
      }),
    ).rejects.toBeInstanceOf(Error)
  })
})
