import { prisma } from '@/db'
import { authFnMiddleware } from '@/middlewares/auth.middleware'
import { importJsonSchema } from '@/schemas/import'
import { createServerFn } from '@tanstack/react-start'

export const importJsonFn = createServerFn({
  method: 'POST',
})
  .middleware([authFnMiddleware])
  .inputValidator(importJsonSchema)
  .handler(async ({ data, context }) => {
    const jsonData = await JSON.parse(data.json)

    const { primaryProducts } = jsonData
    const { response } = primaryProducts
    const { docs } = response

    await Promise.all(
      docs.map(
        async (doc: {
          id: string
          name: string
          price: number
          imageUrl: string
        }) => {
          await prisma.product.create({
            data: {
              name: doc.name,
              productId: doc.id,
              price: doc.price,
              imageUrl: doc.imageUrl,
              link: `${data.url}.${doc.id}.html`,
              userId: context.user.id,
            },
          })
        },
      ),
    )
    return { success: true }
  })

export const getImportedJsonFn = createServerFn({
  method: 'GET',
})
  .middleware([authFnMiddleware])
  .handler(async ({ context }) => {
    const products = await prisma.product.findMany({
      where: {
        userId: context.user.id,
      },
      select: {
        id: true,
        name: true,
        price: true,
        imageUrl: true,
        link: true,
      },
    })

    return {
      products: products.map((product) => ({
        ...product,
        price: Number(product.price).toFixed(2),
      })),
    }
  })

export const deleteImportedJsonFn = createServerFn({
  method: 'POST',
})
  .middleware([authFnMiddleware])
  .handler(async ({ context }) => {
    await prisma.product.deleteMany({
      where: {
        userId: context.user.id,
      },
    })
    return { success: true }
  })
