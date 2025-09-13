import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../../users/user.entity';
import { UserRole } from '../../users/user-role.enum';
import { Client } from '../../clients/client.entity';
import { Service } from '../../services/service.entity';
import { Vendor } from '../../vendors/vendor.entity';
import { VendorService } from '../../vendors/vendor-service.entity';
import { VendorCountry } from '../../vendors/vendor-country.entity';

export async function seedInitialData(dataSource: DataSource) {
  const userRepository = dataSource.getRepository(User);
  const clientRepository = dataSource.getRepository(Client);
  const serviceRepository = dataSource.getRepository(Service);
  const vendorRepository = dataSource.getRepository(Vendor);
  const vendorServiceRepository = dataSource.getRepository(VendorService);
  const vendorCountryRepository = dataSource.getRepository(VendorCountry);

  // Create admin user
  const adminPasswordHash = await bcrypt.hash('admin123', 10);
  const adminUser = userRepository.create({
    email: 'admin@expanders360.com',
    passwordHash: adminPasswordHash,
    role: UserRole.Admin,
  });
  await userRepository.save(adminUser);

  // Create client user
  const clientPasswordHash = await bcrypt.hash('client123', 10);
  const clientUser = userRepository.create({
    email: 'client@example.com',
    passwordHash: clientPasswordHash,
    role: UserRole.Client,
  });
  await userRepository.save(clientUser);

  // Create client company
  const client = clientRepository.create({
    companyName: 'Example Corp',
    contactEmail: 'contact@example.com',
    ownerUserId: clientUser.id,
  });
  await clientRepository.save(client);

  // Create services
  const services = [
    'Legal Services',
    'Accounting Services',
    'HR Services',
    'IT Services',
    'Marketing Services',
    'Financial Services',
  ];

  const savedServices: Service[] = [];
  for (const serviceName of services) {
    const service = serviceRepository.create({ name: serviceName });
    const savedService = await serviceRepository.save(service);
    savedServices.push(savedService);
  }

  // Create vendors
  const vendors = [
    {
      name: 'Legal Solutions Ltd',
      rating: 4.5,
      responseSlaHours: 24,
      services: ['Legal Services'],
      countries: ['US', 'UK', 'CA'],
    },
    {
      name: 'Global Accounting Partners',
      rating: 4.2,
      responseSlaHours: 48,
      services: ['Accounting Services', 'Financial Services'],
      countries: ['US', 'UK', 'DE', 'FR'],
    },
    {
      name: 'Tech Innovators Inc',
      rating: 4.8,
      responseSlaHours: 12,
      services: ['IT Services'],
      countries: ['US', 'IN', 'SG'],
    },
    {
      name: 'HR Excellence Group',
      rating: 4.0,
      responseSlaHours: 36,
      services: ['HR Services'],
      countries: ['US', 'UK', 'AU'],
    },
  ];

  for (const vendorData of vendors) {
    const vendor = vendorRepository.create({
      name: vendorData.name,
      rating: vendorData.rating,
      responseSlaHours: vendorData.responseSlaHours,
    });
    const savedVendor = await vendorRepository.save(vendor);

    // Add vendor services
    for (const serviceName of vendorData.services) {
      const service = savedServices.find(s => s.name === serviceName);
      if (service) {
        const vendorService = vendorServiceRepository.create({
          vendorId: savedVendor.id,
          serviceId: service.id,
        });
        await vendorServiceRepository.save(vendorService);
      }
    }

    // Add vendor countries
    for (const country of vendorData.countries) {
      const vendorCountry = vendorCountryRepository.create({
        vendorId: savedVendor.id,
        country,
      });
      await vendorCountryRepository.save(vendorCountry);
    }
  }

  console.log('✅ Initial seed data created successfully!');
  console.log('📧 Admin login: admin@expanders360.com / admin123');
  console.log('📧 Client login: client@example.com / client123');
}
