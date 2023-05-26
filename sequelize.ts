require('dotenv').config({ path: 'dati.env' });
import { Sequelize } from "sequelize";

export class SingletonDB { 
    private static instance: SingletonDB;
    private singleConnection: Sequelize; 

    private constructor() { 
        const db: string = process.env.PGDATABASE as string;
        const username: string = process.env.PGUSER as string;
        const password: string = process.env.PGPASSWORD as string;
        const host: string = process.env.PGHOST as string;
        const port: number = Number(process.env.PGPORT);
        this.singleConnection = new Sequelize(db, username, password, {
            host: host,
            port: port,
            dialect: 'postgres',
            dialectOptions: {

            },  
            logging:false});
            
    }

    public static getInstance(): SingletonDB {
        if (!SingletonDB.instance) {
            SingletonDB.instance = new SingletonDB();
        }

        return SingletonDB.instance;
    }

    public getConnection() {
        return this.singleConnection;        
    }

    public async syncModels() {
        try {
            await this.singleConnection.sync();
        } catch (error) {
        }
    }
}
const singletonDB = SingletonDB.getInstance();
singletonDB.syncModels();

