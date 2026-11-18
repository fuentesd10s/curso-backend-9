// Carga servicios de ejemplo para probar la API y las vistas: npm run seed
// Solo inserta si la colección de servicios está vacía, para no duplicar ni pisar datos.
import mongoose from 'mongoose';
import { connectDB } from '../config/db.config.js';
import { servicesService } from '../services/services.service.js';
import { servicesRepository } from '../repositories/services.repository.js';
import { createServiceSchema } from '../validations/services.validation.js';

const SAMPLE_SERVICES = [
  {
    name: 'Corte de cabello',
    description: 'Corte de cabello clásico con lavado incluido',
    duration: 30,
    price: 5000,
    category: 'peluquería',
    available: true,
  },
  {
    name: 'Manicura',
    description: 'Manicura completa con esmaltado semipermanente',
    duration: 45,
    price: 6500,
    category: 'estética',
    available: true,
  },
  {
    name: 'Masaje descontracturante',
    description: 'Masaje terapéutico de espalda y cuello',
    duration: 60,
    price: 9000,
    category: 'bienestar',
    available: false,
  },
  {
    name: 'Depilación',
    description: 'Depilación con cera',
    duration: 20,
    price: 4000,
    category: 'estética',
    available: true,
  },
];

try {
  await connectDB();

  const existing = await servicesRepository.getAll();
  if (existing.length > 0) {
    console.log(`ℹ️  Ya hay ${existing.length} servicios cargados: no se insertó nada.`);
  } else {
    for (const data of SAMPLE_SERVICES) {
      // Se validan con el mismo esquema de Zod que usa la API.
      const service = await servicesService.createService(createServiceSchema.parse(data));
      console.log(`✅ ${service.name} (${service.id})`);
    }
    console.log(`🌱 Se cargaron ${SAMPLE_SERVICES.length} servicios de ejemplo.`);
  }
} catch (error) {
  console.error(`❌ No se pudo cargar los datos de ejemplo: ${error.message}`);
  process.exitCode = 1;
} finally {
  await mongoose.disconnect();
}
