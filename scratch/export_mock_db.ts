import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

import {
  currentUserMock,
  contactsMock,
  communitiesMock,
  communityPostsMock,
  chatMessagesMock,
  mockReports,
  bubbleRequestsMock,
  radarUsersMock,
  managedUsersMock,
  globalBroadcastsMock
} from '../src/mockData.ts';

const fullDatabase = {
  metadata: {
    description: 'Base de datos simulada de prueba y práctica para Burbuja LGBTIQA+',
    exportedAt: new Date().toISOString(),
    version: '1.0.0',
    totalUsers: managedUsersMock.length,
    totalCommunities: communitiesMock.length,
    totalPosts: Object.values(communityPostsMock).reduce((acc, p) => acc + p.length, 0),
    totalReports: mockReports.length
  },
  currentUserMock,
  managedUsers: managedUsersMock,
  contacts: contactsMock,
  communities: communitiesMock,
  communityPosts: communityPostsMock,
  chatMessages: chatMessagesMock,
  reports: mockReports,
  bubbleRequests: bubbleRequestsMock,
  radarUsers: radarUsersMock,
  globalBroadcasts: globalBroadcastsMock
};

const publicDownloadsDir = path.resolve('public', 'downloads');
fs.mkdirSync(publicDownloadsDir, { recursive: true });
const targetPublicPath = path.join(publicDownloadsDir, 'base_de_datos_pruebas.json');
fs.writeFileSync(targetPublicPath, JSON.stringify(fullDatabase, null, 2), 'utf-8');

const srcDataDir = path.resolve('src', 'data');
fs.mkdirSync(srcDataDir, { recursive: true });
const targetSrcPath = path.join(srcDataDir, 'mockDatabase.json');
fs.writeFileSync(targetSrcPath, JSON.stringify(fullDatabase, null, 2), 'utf-8');

console.log('Base de datos de pruebas exportada exitosamente a:');
console.log('1.', targetPublicPath);
console.log('2.', targetSrcPath);
