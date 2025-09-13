import { MigrationInterface, QueryRunner } from "typeorm";

export class AddRefreshTokenHashToUser1755963230669 implements MigrationInterface {
    name = 'AddRefreshTokenHashToUser1755963230669'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`vendor_countries\` DROP FOREIGN KEY \`FK_vendor_countries_vendor\``);
        await queryRunner.query(`ALTER TABLE \`matches\` DROP FOREIGN KEY \`FK_matches_project\``);
        await queryRunner.query(`ALTER TABLE \`matches\` DROP FOREIGN KEY \`FK_matches_vendor\``);
        await queryRunner.query(`ALTER TABLE \`vendor_services\` DROP FOREIGN KEY \`FK_vendor_services_service\``);
        await queryRunner.query(`ALTER TABLE \`vendor_services\` DROP FOREIGN KEY \`FK_vendor_services_vendor\``);
        await queryRunner.query(`ALTER TABLE \`project_services\` DROP FOREIGN KEY \`FK_project_services_project\``);
        await queryRunner.query(`ALTER TABLE \`project_services\` DROP FOREIGN KEY \`FK_project_services_service\``);
        await queryRunner.query(`ALTER TABLE \`projects\` DROP FOREIGN KEY \`FK_projects_client\``);
        await queryRunner.query(`ALTER TABLE \`clients\` DROP FOREIGN KEY \`FK_clients_owner_user\``);
        await queryRunner.query(`DROP INDEX \`UQ_matches_project_vendor\` ON \`matches\``);
        await queryRunner.query(`DROP INDEX \`UQ_services_name\` ON \`services\``);
        await queryRunner.query(`DROP INDEX \`UQ_97672ac88f789774dd47f7c8be3\` ON \`users\``);
        await queryRunner.query(`ALTER TABLE \`users\` ADD \`refresh_token_hash\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`matches\` DROP COLUMN \`created_at\``);
        await queryRunner.query(`ALTER TABLE \`matches\` ADD \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6)`);
        await queryRunner.query(`ALTER TABLE \`matches\` DROP COLUMN \`updated_at\``);
        await queryRunner.query(`ALTER TABLE \`matches\` ADD \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6)`);
        await queryRunner.query(`ALTER TABLE \`vendors\` DROP COLUMN \`created_at\``);
        await queryRunner.query(`ALTER TABLE \`vendors\` ADD \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6)`);
        await queryRunner.query(`ALTER TABLE \`vendors\` DROP COLUMN \`updated_at\``);
        await queryRunner.query(`ALTER TABLE \`vendors\` ADD \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6)`);
        await queryRunner.query(`ALTER TABLE \`services\` ADD UNIQUE INDEX \`IDX_019d74f7abcdcb5a0113010cb0\` (\`name\`)`);
        await queryRunner.query(`ALTER TABLE \`projects\` DROP COLUMN \`created_at\``);
        await queryRunner.query(`ALTER TABLE \`projects\` ADD \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6)`);
        await queryRunner.query(`ALTER TABLE \`projects\` DROP COLUMN \`updated_at\``);
        await queryRunner.query(`ALTER TABLE \`projects\` ADD \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6)`);
        await queryRunner.query(`ALTER TABLE \`clients\` DROP COLUMN \`created_at\``);
        await queryRunner.query(`ALTER TABLE \`clients\` ADD \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6)`);
        await queryRunner.query(`ALTER TABLE \`clients\` DROP COLUMN \`updated_at\``);
        await queryRunner.query(`ALTER TABLE \`clients\` ADD \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6)`);
        await queryRunner.query(`ALTER TABLE \`users\` ADD UNIQUE INDEX \`IDX_97672ac88f789774dd47f7c8be\` (\`email\`)`);
        await queryRunner.query(`ALTER TABLE \`users\` DROP COLUMN \`created_at\``);
        await queryRunner.query(`ALTER TABLE \`users\` ADD \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6)`);
        await queryRunner.query(`ALTER TABLE \`users\` DROP COLUMN \`updated_at\``);
        await queryRunner.query(`ALTER TABLE \`users\` ADD \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6)`);
        await queryRunner.query(`CREATE UNIQUE INDEX \`IDX_2c6d7b72a690822ed888d830ee\` ON \`matches\` (\`project_id\`, \`vendor_id\`)`);
        await queryRunner.query(`ALTER TABLE \`vendor_countries\` ADD CONSTRAINT \`FK_d8905ab2eb26dcbfab5908b0fda\` FOREIGN KEY (\`vendor_id\`) REFERENCES \`vendors\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`matches\` ADD CONSTRAINT \`FK_416d7b6f94de26244a7be38d87a\` FOREIGN KEY (\`project_id\`) REFERENCES \`projects\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`matches\` ADD CONSTRAINT \`FK_dfb298e37d26ca75c3b1b1c8010\` FOREIGN KEY (\`vendor_id\`) REFERENCES \`vendors\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`vendor_services\` ADD CONSTRAINT \`FK_f747f5b7342cafe68c55fc15cae\` FOREIGN KEY (\`vendor_id\`) REFERENCES \`vendors\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`vendor_services\` ADD CONSTRAINT \`FK_f939652374270ae1eedea0ccd90\` FOREIGN KEY (\`service_id\`) REFERENCES \`services\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`project_services\` ADD CONSTRAINT \`FK_ed6d4efd05c4874e848ea93b603\` FOREIGN KEY (\`project_id\`) REFERENCES \`projects\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`project_services\` ADD CONSTRAINT \`FK_c8c7f6ad9c09772cfa926da2d78\` FOREIGN KEY (\`service_id\`) REFERENCES \`services\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`projects\` ADD CONSTRAINT \`FK_ca29f959102228649e714827478\` FOREIGN KEY (\`client_id\`) REFERENCES \`clients\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`clients\` ADD CONSTRAINT \`FK_6a58aa554994437afe9d4dc4343\` FOREIGN KEY (\`owner_user_id\`) REFERENCES \`users\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`clients\` DROP FOREIGN KEY \`FK_6a58aa554994437afe9d4dc4343\``);
        await queryRunner.query(`ALTER TABLE \`projects\` DROP FOREIGN KEY \`FK_ca29f959102228649e714827478\``);
        await queryRunner.query(`ALTER TABLE \`project_services\` DROP FOREIGN KEY \`FK_c8c7f6ad9c09772cfa926da2d78\``);
        await queryRunner.query(`ALTER TABLE \`project_services\` DROP FOREIGN KEY \`FK_ed6d4efd05c4874e848ea93b603\``);
        await queryRunner.query(`ALTER TABLE \`vendor_services\` DROP FOREIGN KEY \`FK_f939652374270ae1eedea0ccd90\``);
        await queryRunner.query(`ALTER TABLE \`vendor_services\` DROP FOREIGN KEY \`FK_f747f5b7342cafe68c55fc15cae\``);
        await queryRunner.query(`ALTER TABLE \`matches\` DROP FOREIGN KEY \`FK_dfb298e37d26ca75c3b1b1c8010\``);
        await queryRunner.query(`ALTER TABLE \`matches\` DROP FOREIGN KEY \`FK_416d7b6f94de26244a7be38d87a\``);
        await queryRunner.query(`ALTER TABLE \`vendor_countries\` DROP FOREIGN KEY \`FK_d8905ab2eb26dcbfab5908b0fda\``);
        await queryRunner.query(`DROP INDEX \`IDX_2c6d7b72a690822ed888d830ee\` ON \`matches\``);
        await queryRunner.query(`ALTER TABLE \`users\` DROP COLUMN \`updated_at\``);
        await queryRunner.query(`ALTER TABLE \`users\` ADD \`updated_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6)`);
        await queryRunner.query(`ALTER TABLE \`users\` DROP COLUMN \`created_at\``);
        await queryRunner.query(`ALTER TABLE \`users\` ADD \`created_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6)`);
        await queryRunner.query(`ALTER TABLE \`users\` DROP INDEX \`IDX_97672ac88f789774dd47f7c8be\``);
        await queryRunner.query(`ALTER TABLE \`clients\` DROP COLUMN \`updated_at\``);
        await queryRunner.query(`ALTER TABLE \`clients\` ADD \`updated_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6)`);
        await queryRunner.query(`ALTER TABLE \`clients\` DROP COLUMN \`created_at\``);
        await queryRunner.query(`ALTER TABLE \`clients\` ADD \`created_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6)`);
        await queryRunner.query(`ALTER TABLE \`projects\` DROP COLUMN \`updated_at\``);
        await queryRunner.query(`ALTER TABLE \`projects\` ADD \`updated_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6)`);
        await queryRunner.query(`ALTER TABLE \`projects\` DROP COLUMN \`created_at\``);
        await queryRunner.query(`ALTER TABLE \`projects\` ADD \`created_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6)`);
        await queryRunner.query(`ALTER TABLE \`services\` DROP INDEX \`IDX_019d74f7abcdcb5a0113010cb0\``);
        await queryRunner.query(`ALTER TABLE \`vendors\` DROP COLUMN \`updated_at\``);
        await queryRunner.query(`ALTER TABLE \`vendors\` ADD \`updated_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6)`);
        await queryRunner.query(`ALTER TABLE \`vendors\` DROP COLUMN \`created_at\``);
        await queryRunner.query(`ALTER TABLE \`vendors\` ADD \`created_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6)`);
        await queryRunner.query(`ALTER TABLE \`matches\` DROP COLUMN \`updated_at\``);
        await queryRunner.query(`ALTER TABLE \`matches\` ADD \`updated_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6)`);
        await queryRunner.query(`ALTER TABLE \`matches\` DROP COLUMN \`created_at\``);
        await queryRunner.query(`ALTER TABLE \`matches\` ADD \`created_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6)`);
        await queryRunner.query(`ALTER TABLE \`users\` DROP COLUMN \`refresh_token_hash\``);
        await queryRunner.query(`CREATE UNIQUE INDEX \`UQ_97672ac88f789774dd47f7c8be3\` ON \`users\` (\`email\`)`);
        await queryRunner.query(`CREATE UNIQUE INDEX \`UQ_services_name\` ON \`services\` (\`name\`)`);
        await queryRunner.query(`CREATE UNIQUE INDEX \`UQ_matches_project_vendor\` ON \`matches\` (\`project_id\`, \`vendor_id\`)`);
        await queryRunner.query(`ALTER TABLE \`clients\` ADD CONSTRAINT \`FK_clients_owner_user\` FOREIGN KEY (\`owner_user_id\`) REFERENCES \`users\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`projects\` ADD CONSTRAINT \`FK_projects_client\` FOREIGN KEY (\`client_id\`) REFERENCES \`clients\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`project_services\` ADD CONSTRAINT \`FK_project_services_service\` FOREIGN KEY (\`service_id\`) REFERENCES \`services\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`project_services\` ADD CONSTRAINT \`FK_project_services_project\` FOREIGN KEY (\`project_id\`) REFERENCES \`projects\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`vendor_services\` ADD CONSTRAINT \`FK_vendor_services_vendor\` FOREIGN KEY (\`vendor_id\`) REFERENCES \`vendors\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`vendor_services\` ADD CONSTRAINT \`FK_vendor_services_service\` FOREIGN KEY (\`service_id\`) REFERENCES \`services\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`matches\` ADD CONSTRAINT \`FK_matches_vendor\` FOREIGN KEY (\`vendor_id\`) REFERENCES \`vendors\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`matches\` ADD CONSTRAINT \`FK_matches_project\` FOREIGN KEY (\`project_id\`) REFERENCES \`projects\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`vendor_countries\` ADD CONSTRAINT \`FK_vendor_countries_vendor\` FOREIGN KEY (\`vendor_id\`) REFERENCES \`vendors\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
