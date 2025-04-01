import { Verrou } from "@verrou/core"
   import { config } from "../config.ts"
   import { memoryStore } from '@verrou/core/drivers/memory'

   export const verrou = new Verrou({
       default: config.LOCK_STORE,
       stores: {
           memory: { driver: memoryStore() }
       }
   })