import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';
import { User } from '../users/user.entity';
import { Client } from '../clients/client.entity';
import { Project } from '../projects/project.entity';
import { ProjectService } from '../projects/project-service.entity';
import { Service } from '../services/service.entity';
import { Vendor } from '../vendors/vendor.entity';
import { VendorService } from '../vendors/vendor-service.entity';
import { VendorCountry } from '../vendors/vendor-country.entity';
import { Match } from '../matches/match.entity';

// Load .env manually (because Nest ConfigModule is not running here)
dotenv.config();

export const AppDataSource = new DataSource({
  type: 'mysql',
  host: process.env.MYSQL_HOST,
  port: parseInt(process.env.MYSQL_PORT || '3306', 10),
  username: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DB,
  entities: [
    User,
    Client,
    Project,
    ProjectService,
    Service,
    Vendor,
    VendorService,
    VendorCountry,
    Match,
  ],
  migrations: [__dirname + '/migrations/*.ts'],
  synchronize: false,
});
