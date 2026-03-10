import { type SchemaTypeDefinition } from 'sanity'

import { customerType } from './customerType'
import { productType } from './productType'
import { orderType } from './orderType'
import { categoryType } from './categoryType'

export const schema: { types: SchemaTypeDefinition[] } = {
  types: [
    customerType,
    productType,
    orderType,
    categoryType,
  ],
}
