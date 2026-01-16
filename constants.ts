import { ArisanGroup, ArisanStatus, User } from './types';

export const MOCK_USERS: User[] = [
  {
    id: 'u1',
    walletAddress: '0x123...abc',
    username: 'Siti Bakery',
    avatarUrl: 'https://picsum.photos/seed/siti/200',
    reputationScore: 98,
  },
  {
    id: 'u2',
    walletAddress: '0x456...def',
    username: 'Budi Tech',
    avatarUrl: 'https://picsum.photos/seed/budi/200',
    reputationScore: 85,
  },
  {
    id: 'u3',
    walletAddress: '0x789...ghi',
    username: 'Wati Fashion',
    avatarUrl: 'https://picsum.photos/seed/wati/200',
    reputationScore: 92,
  },
  {
    id: 'u4',
    walletAddress: '0xabc...jkl',
    username: 'Joko Crypto',
    avatarUrl: 'https://picsum.photos/seed/joko/200',
    reputationScore: 70,
  },
];

export const MOCK_GROUPS: ArisanGroup[] = [
  {
    id: 'g1',
    name: 'UMKM Jakarta Community',
    description: 'Rotating savings for small business owners in South Jakarta.',
    amountPerCycle: 50,
    currency: 'USDT',
    cyclePeriod: 'Monthly',
    maxParticipants: 10,
    currentCycle: 2,
    status: ArisanStatus.ACTIVE,
    poolBalance: 500,
    entryFeeWei: '500000000000000000',
    winners: ['0x123...abc'],
    createdAt: '2023-10-01',
    participants: [
      { user: MOCK_USERS[0], hasPaid: true, hasWon: true, joinedAt: '2023-10-01' },
      { user: MOCK_USERS[1], hasPaid: true, hasWon: false, joinedAt: '2023-10-02' },
      { user: MOCK_USERS[2], hasPaid: false, hasWon: false, joinedAt: '2023-10-02' },
      { user: MOCK_USERS[3], hasPaid: true, hasWon: false, joinedAt: '2023-10-05' },
    ]
  },
  {
    id: 'g2',
    name: 'Lisk Builders Fund',
    description: 'Community funding for Lisk ecosystem developers.',
    amountPerCycle: 100,
    currency: 'LSK',
    cyclePeriod: 'Weekly',
    maxParticipants: 5,
    currentCycle: 1,
    status: ArisanStatus.OPEN,
    poolBalance: 200,
    entryFeeWei: '100000000000000000',
    winners: [],
    createdAt: '2023-11-15',
    participants: [
      { user: MOCK_USERS[3], hasPaid: true, hasWon: false, joinedAt: '2023-11-15' },
      { user: MOCK_USERS[1], hasPaid: true, hasWon: false, joinedAt: '2023-11-16' },
    ]
  }
];
