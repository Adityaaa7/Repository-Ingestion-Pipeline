//responsibilities: 
// 1.create one prisma client
// 2.Export it
// 3.Let other files use it 

// so instead of exporting prisma client at every service do it once and import whenever needed


import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default prisma;