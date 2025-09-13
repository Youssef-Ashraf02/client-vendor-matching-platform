import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Match } from './match.entity';
import { MatchesService } from './matches.service';
import { Project } from '../projects/project.entity';
import { ProjectService } from '../projects/project-service.entity';
import { Vendor } from '../vendors/vendor.entity';
import { VendorService } from '../vendors/vendor-service.entity';
import { VendorCountry } from '../vendors/vendor-country.entity';
import { NotificationsModule } from '../notifications/notifications.module';
import { Client } from '../clients/client.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Match,
      Project,
      ProjectService,
      Vendor,
      VendorService,
      VendorCountry,
      Client,
    ]),
    NotificationsModule
  ],
  providers: [MatchesService],
  exports: [MatchesService, TypeOrmModule],
})
export class MatchesModule {}