import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateInitialSchema1700000000000 implements MigrationInterface {
  name = 'CreateInitialSchema1700000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create users table
    await queryRunner.query(`
      CREATE TABLE \`users\` (
        \`id\` bigint NOT NULL AUTO_INCREMENT,
        \`email\` varchar(255) NOT NULL,
        \`password_hash\` varchar(255) NOT NULL,
        \`role\` enum('admin','client') NOT NULL,
        \`created_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        \`updated_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
        UNIQUE KEY \`UQ_97672ac88f789774dd47f7c8be3\` (\`email\`),
        PRIMARY KEY (\`id\`)
      ) ENGINE=InnoDB
    `);

    // Create clients table
    await queryRunner.query(`
      CREATE TABLE \`clients\` (
        \`id\` bigint NOT NULL AUTO_INCREMENT,
        \`company_name\` varchar(255) NOT NULL,
        \`contact_email\` varchar(255) NOT NULL,
        \`owner_user_id\` bigint NOT NULL,
        \`created_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        \`updated_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
        PRIMARY KEY (\`id\`),
        KEY \`FK_clients_owner_user\` (\`owner_user_id\`),
        CONSTRAINT \`FK_clients_owner_user\` FOREIGN KEY (\`owner_user_id\`) REFERENCES \`users\` (\`id\`)
      ) ENGINE=InnoDB
    `);

    // Create projects table
    await queryRunner.query(`
      CREATE TABLE \`projects\` (
        \`id\` bigint NOT NULL AUTO_INCREMENT,
        \`client_id\` bigint NOT NULL,
        \`country\` char(2) NOT NULL,
        \`budget\` decimal(12,2) NOT NULL,
        \`status\` enum('draft','active','on_hold','completed','archived') NOT NULL DEFAULT 'draft',
        \`created_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        \`updated_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
        PRIMARY KEY (\`id\`),
        KEY \`FK_projects_client\` (\`client_id\`),
        CONSTRAINT \`FK_projects_client\` FOREIGN KEY (\`client_id\`) REFERENCES \`clients\` (\`id\`)
      ) ENGINE=InnoDB
    `);

    // Create services table
    await queryRunner.query(`
      CREATE TABLE \`services\` (
        \`id\` bigint NOT NULL AUTO_INCREMENT,
        \`name\` varchar(100) NOT NULL,
        UNIQUE KEY \`UQ_services_name\` (\`name\`),
        PRIMARY KEY (\`id\`)
      ) ENGINE=InnoDB
    `);

    // Create project_services junction table
    await queryRunner.query(`
      CREATE TABLE \`project_services\` (
        \`project_id\` bigint NOT NULL,
        \`service_id\` bigint NOT NULL,
        PRIMARY KEY (\`project_id\`, \`service_id\`),
        KEY \`FK_project_services_service\` (\`service_id\`),
        CONSTRAINT \`FK_project_services_project\` FOREIGN KEY (\`project_id\`) REFERENCES \`projects\` (\`id\`),
        CONSTRAINT \`FK_project_services_service\` FOREIGN KEY (\`service_id\`) REFERENCES \`services\` (\`id\`)
      ) ENGINE=InnoDB
    `);

    // Create vendors table
    await queryRunner.query(`
      CREATE TABLE \`vendors\` (
        \`id\` bigint NOT NULL AUTO_INCREMENT,
        \`name\` varchar(255) NOT NULL,
        \`rating\` decimal(3,2) NOT NULL DEFAULT '0.00',
        \`response_sla_hours\` int NOT NULL,
        \`created_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        \`updated_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
        PRIMARY KEY (\`id\`)
      ) ENGINE=InnoDB
    `);

    // Create vendor_services junction table
    await queryRunner.query(`
      CREATE TABLE \`vendor_services\` (
        \`vendor_id\` bigint NOT NULL,
        \`service_id\` bigint NOT NULL,
        PRIMARY KEY (\`vendor_id\`, \`service_id\`),
        KEY \`FK_vendor_services_service\` (\`service_id\`),
        CONSTRAINT \`FK_vendor_services_vendor\` FOREIGN KEY (\`vendor_id\`) REFERENCES \`vendors\` (\`id\`),
        CONSTRAINT \`FK_vendor_services_service\` FOREIGN KEY (\`service_id\`) REFERENCES \`services\` (\`id\`)
      ) ENGINE=InnoDB
    `);

    // Create vendor_countries junction table
    await queryRunner.query(`
      CREATE TABLE \`vendor_countries\` (
        \`vendor_id\` bigint NOT NULL,
        \`country\` char(2) NOT NULL,
        PRIMARY KEY (\`vendor_id\`, \`country\`),
        CONSTRAINT \`FK_vendor_countries_vendor\` FOREIGN KEY (\`vendor_id\`) REFERENCES \`vendors\` (\`id\`)
      ) ENGINE=InnoDB
    `);

    // Create matches table
    await queryRunner.query(`
      CREATE TABLE \`matches\` (
        \`id\` bigint NOT NULL AUTO_INCREMENT,
        \`project_id\` bigint NOT NULL,
        \`vendor_id\` bigint NOT NULL,
        \`score\` decimal(5,2) NOT NULL,
        \`created_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        \`updated_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
        UNIQUE KEY \`UQ_matches_project_vendor\` (\`project_id\`, \`vendor_id\`),
        PRIMARY KEY (\`id\`),
        KEY \`FK_matches_vendor\` (\`vendor_id\`),
        CONSTRAINT \`FK_matches_project\` FOREIGN KEY (\`project_id\`) REFERENCES \`projects\` (\`id\`),
        CONSTRAINT \`FK_matches_vendor\` FOREIGN KEY (\`vendor_id\`) REFERENCES \`vendors\` (\`id\`)
      ) ENGINE=InnoDB
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE \`matches\``);
    await queryRunner.query(`DROP TABLE \`vendor_countries\``);
    await queryRunner.query(`DROP TABLE \`vendor_services\``);
    await queryRunner.query(`DROP TABLE \`vendors\``);
    await queryRunner.query(`DROP TABLE \`project_services\``);
    await queryRunner.query(`DROP TABLE \`services\``);
    await queryRunner.query(`DROP TABLE \`projects\``);
    await queryRunner.query(`DROP TABLE \`clients\``);
    await queryRunner.query(`DROP TABLE \`users\``);
  }
}
