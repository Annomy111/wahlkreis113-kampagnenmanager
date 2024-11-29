export const mockTasks = [
  {
    _id: '1',
    title: 'Flyer verteilen',
    description: 'Flyer in der Innenstadt verteilen',
    type: 'door_to_door',
    status: 'pending',
    priority: 'high',
    points: 20,
  },
  {
    _id: '2',
    title: 'Social Media Post',
    description: 'Facebook Post erstellen',
    type: 'social_media',
    status: 'in_progress',
    priority: 'medium',
    points: 10,
  },
];

export const mockEvents = [
  {
    _id: '1',
    title: 'Wahlkampfauftakt',
    description: 'Startveranstaltung für den Wahlkampf',
    type: 'event',
    date: '2024-03-15T10:00:00Z',
    location: 'Marktplatz',
    maxParticipants: 100,
    participants: ['1', '2'],
  },
  {
    _id: '2',
    title: 'Tür-zu-Tür-Aktion',
    description: 'Gemeinsame Tür-zu-Tür-Aktion',
    type: 'door_to_door',
    date: '2024-03-16T14:00:00Z',
    location: 'Treffpunkt: Rathaus',
    maxParticipants: 20,
    participants: ['1'],
  },
];

export const mockDistricts = [
  {
    _id: '1',
    name: 'Wahlbezirk Nord',
    households: [
      {
        _id: '1',
        street: 'Hauptstraße',
        houseNumber: '1',
        postalCode: '12345',
        city: 'Musterstadt',
        status: 'not_visited',
      },
      {
        _id: '2',
        street: 'Nebenstraße',
        houseNumber: '2',
        postalCode: '12345',
        city: 'Musterstadt',
        status: 'completed',
      },
    ],
  },
  {
    _id: '2',
    name: 'Wahlbezirk Süd',
    households: [],
  },
];

export const mockChatRooms = [
  {
    _id: '1',
    name: 'Allgemeiner Chat',
    type: 'group',
    participants: ['1', '2', '3'],
    unreadCount: 0,
  },
  {
    _id: '2',
    name: 'Tür-zu-Tür-Team',
    type: 'group',
    participants: ['1', '2'],
    unreadCount: 2,
  },
];

export const mockMessages = [
  {
    _id: '1',
    roomId: '1',
    sender: {
      _id: '1',
      name: 'Test User',
    },
    content: 'Hallo zusammen!',
    createdAt: '2024-03-14T10:00:00Z',
  },
  {
    _id: '2',
    roomId: '1',
    sender: {
      _id: '2',
      name: 'Other User',
    },
    content: 'Hi!',
    createdAt: '2024-03-14T10:01:00Z',
  },
];
