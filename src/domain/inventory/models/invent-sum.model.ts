import { UnitOfMeasure } from "@prisma/client";

export class InventSumModel {
   constructor(
    public id: number,
    public unitOfMeasure: UnitOfMeasure,
    public quantity: number
   ) {
   } 
}