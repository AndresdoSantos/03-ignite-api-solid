import { hash } from 'bcryptjs'

import { prisma } from '@/lib/prisma'

import { PrismaUsersRepository } from '@/repositories/prisma-users-repository'

interface IRegisterUseCaseRequest {
  name: string
  email: string
  password: string
}

export async function registerUseCase({
  email,
  name,
  password,
}: IRegisterUseCaseRequest) {
  const passwordHash = await hash(password, 6)

  const userWithSameEmail = await prisma.user.findUnique({
    where: {
      email,
    },
  })

  if (userWithSameEmail) {
    throw new Error('Email already exists.')
  }

  const prismaUsersRepository = new PrismaUsersRepository()

  await prismaUsersRepository.create({
    email,
    name,
    passwordHash,
  })
}
