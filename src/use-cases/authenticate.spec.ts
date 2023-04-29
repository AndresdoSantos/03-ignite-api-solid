import { beforeEach, describe, expect, it } from 'vitest'
import { hash } from 'bcryptjs'

import { AuthenticateUseCase } from './authenticate'

import { InMemoryUsersRepository } from '@/repositories/in-memory/in-memory-users-repository'

import { InvalidCredentialsError } from './errors/invalid-credentials-error'

let usersRepository: InMemoryUsersRepository
let sut: AuthenticateUseCase

describe('Authenticate Use Case', () => {
  beforeEach(() => {
    usersRepository = new InMemoryUsersRepository()
    sut = new AuthenticateUseCase(usersRepository)
  })

  it('should be able to authenticate', async () => {
    await usersRepository.create({
      email: 'johndoe@example.com',
      passwordHash: await hash('123456', 6),
      name: 'John Doe',
    })

    const { user } = await sut.execute({
      email: 'johndoe@example.com',
      password: '123456',
    })

    expect(user.id).toEqual(expect.any(String))
  })

  it('should not be able to authenticate with wrong email', async () => {
    expect(() =>
      sut.execute({
        email: 'johndoe@example.com',
        password: '123456',
      }),
    ).rejects.toBeInstanceOf(InvalidCredentialsError)
  })

  it('should not be able to authenticate with wrong password', async () => {
    await usersRepository.create({
      email: 'johndoe@example.com',
      passwordHash: await hash('123456', 6),
      name: 'John Doe',
    })

    expect(() =>
      sut.execute({
        email: 'johndoe@example.com',
        password: '654321',
      }),
    ).rejects.toBeInstanceOf(InvalidCredentialsError)
  })
})
