import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Match } from './match.entity';
import { Project } from '../projects/project.entity';
import { Client } from '../clients/client.entity';
import { MailService } from '../notifications/mail.service';
import { Logger } from '@nestjs/common';
@Injectable()
export class MatchesService {
  private readonly logger = new Logger(MatchesService.name);

  constructor(
    @InjectRepository(Match)
    private readonly matchesRepo: Repository<Match>,
    @InjectRepository(Project)
    private readonly projectsRepo: Repository<Project>,
    @InjectRepository(Client)
    private readonly clientRepo: Repository<Client>,
    private readonly dataSource: DataSource,
    private readonly mailService: MailService,
  ) {}

  async rebuildMatchesForProject(projectId: number) {
    const project = await this.projectsRepo.findOne({ where: { id: projectId } });
    if (!project) throw new Error('Project not found');

    const client = await this.clientRepo.findOne({ where: { id: project.clientId } });
    if (!client) throw new Error('Client not found for project');

    const matches = await this.dataSource.query(
      `
      SELECT
        v.id as vendorId,
        COUNT(DISTINCT vs.service_id) as services_overlap,
        v.rating,
        v.response_sla_hours,
        (COUNT(DISTINCT vs.service_id) * 2 + v.rating +
          CASE
            WHEN v.response_sla_hours <= 24 THEN 2
            WHEN v.response_sla_hours <= 72 THEN 1
            ELSE 0
          END
        ) as score
      FROM vendors v
      INNER JOIN vendor_countries vc ON vc.vendor_id = v.id
      INNER JOIN vendor_services vs ON vs.vendor_id = v.id
      INNER JOIN project_services ps ON ps.service_id = vs.service_id
      WHERE vc.country = ? AND ps.project_id = ?
      GROUP BY v.id
      HAVING services_overlap > 0
      `,
      [project.country, projectId],
    );

    for (const m of matches) {
      const existing = await this.matchesRepo.findOne({
        where: { projectId, vendorId: m.vendorId },
      });

      await this.matchesRepo
        .createQueryBuilder()
        .insert()
        .into(Match)
        .values({
          projectId,
          vendorId: m.vendorId,
          score: m.score,
        })
        .orUpdate(['score', 'updated_at'], ['project_id', 'vendor_id'])
        .execute();

      if (!existing) {
        this.logger.log(
          `📧 New match found – sending email to ${client.contactEmail} (vendor ${m.vendorId}, score ${m.score})`,
        );
        try {
          const info = await this.mailService.sendMatchNotification(
            client.contactEmail,
            projectId,
            m.vendorId,
            m.score,
          );
          this.logger.log(`✅ Email sent: ${info.messageId}`);
        } catch (err) {
          this.logger.error(
            `❌ Failed to send email to ${client.contactEmail}: ${err.message}`,
            err.stack,
          );
        }
      } else {
        this.logger.log(
          `ℹ️ Match already exists for vendor ${m.vendorId} – updated score to ${m.score}`,
        );
      }
    }

    return this.matchesRepo.find({ where: { projectId } });
  }
}