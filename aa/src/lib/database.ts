import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { Calculation } from '@/entities/Calculation';
import path from 'path';
import fs from 'fs';

const dbPath = process.env.DATABASE_PATH || './data/calculator.sqlite';
const resolvedDbPath = path.resolve(process.cwd(), dbPath);
const dbDir = path.dirname(resolvedDbPath);

if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

let dataSource: DataSource | null = null;

export async function getDataSource(): Promise<DataSource> {
  if (dataSource && dataSource.isInitialized) {
    return dataSource;
  }

  dataSource = new DataSource({
    type: 'better-sqlite3',
    database: resolvedDbPath,
    synchronize: true,
    logging: false,
    entities: [Calculation],
  });

  await dataSource.initialize();
  return dataSource;
}
