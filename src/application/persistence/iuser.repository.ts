import { User } from "generated/prisma";

interface IUserRepository {
    createUser(): User; 
}