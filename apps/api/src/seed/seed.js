const mongoose = require('mongoose');
const config = require('../config/env');
const User = require('../models/User');
const Organization = require('../models/Organization');
const Event = require('../models/Event');
const Room = require('../models/Room');
const Session = require('../models/Session');
const Speaker = require('../models/Speaker');
const Volunteer = require('../models/Volunteer');
const Task = require('../models/Task');
const Registration = require('../models/Registration');
const Announcement = require('../models/Announcement');
const CheckIn = require('../models/CheckIn');
const Feedback = require('../models/Feedback');
const Scenario = require('../models/Scenario');
const AuditLog = require('../models/AuditLog');
const EventTwinEngine = require('../modules/event-twin/engine');

const seedData = async () => {
  try {
    console.log('[Seed] Connecting to MongoDB:', config.mongoUri);
    await mongoose.connect(config.mongoUri);
    console.log('[Seed] Connected. Clearing previous seed collections...');

    await Promise.all([
      User.deleteMany({}),
      Organization.deleteMany({}),
      Event.deleteMany({}),
      Room.deleteMany({}),
      Session.deleteMany({}),
      Speaker.deleteMany({}),
      Volunteer.deleteMany({}),
      Task.deleteMany({}),
      Registration.deleteMany({}),
      Announcement.deleteMany({}),
      CheckIn.deleteMany({}),
      Feedback.deleteMany({}),
      Scenario.deleteMany({}),
      AuditLog.deleteMany({}),
    ]);

    console.log('[Seed] Creating demo accounts...');
    const defaultPasswordHash = await User.hashPassword('DemoPass123!');

    const [organizer, volunteerUser, attendeeUser, speakerUser, adminUser] = await Promise.all([
      User.create({
        name: 'Jordan Miller (Organizer)',
        email: 'organizer@eventforge.demo',
        passwordHash: defaultPasswordHash,
        roles: ['organizer'],
        title: 'Lead Operations Director',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80',
      }),
      User.create({
        name: 'Alex Chen (Volunteer)',
        email: 'volunteer@eventforge.demo',
        passwordHash: defaultPasswordHash,
        roles: ['volunteer'],
        title: 'Lead Registration Coordinator',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=250&q=80',
      }),
      User.create({
        name: 'Maya Lin (Attendee)',
        email: 'attendee@eventforge.demo',
        passwordHash: defaultPasswordHash,
        roles: ['attendee'],
        title: 'Senior Software Engineer',
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=250&q=80',
      }),
      User.create({
        name: 'Dr. Elena Vance (Speaker)',
        email: 'speaker@eventforge.demo',
        passwordHash: defaultPasswordHash,
        roles: ['speaker'],
        title: 'VP of AI Research, DeepScale Labs',
        avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=250&q=80',
      }),
      User.create({
        name: 'Sarah Connor (Admin)',
        email: 'admin@eventforge.demo',
        passwordHash: defaultPasswordHash,
        roles: ['admin', 'organizer'],
        title: 'Platform Super Administrator',
        avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=250&q=80',
      }),
    ]);

    // Organization
    const organization = await Organization.create({
      name: 'EventForge Community & Tech Guild',
      slug: 'eventforge-guild',
      description: 'Host of technical summits, collegiate hackathons, and design operations workshops.',
      ownerId: organizer._id,
      members: [
        { userId: organizer._id, role: 'owner' },
        { userId: adminUser._id, role: 'admin' },
      ],
    });

    console.log('[Seed] Creating flagship event: EventForge Summit 2026...');
    const now = new Date();
    const eventStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 2, 8, 30);
    const eventEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 3, 18, 0);

    const event = await Event.create({
      title: 'EventForge Summit 2026',
      slug: 'eventforge-summit-2026',
      description: 'The premier annual summit on modern event operations, distributed architecture, and human-centric software engineering.',
      shortDescription: 'Two days of keynotes, architecture deep-dives, and hands-on workshops for operational excellence.',
      type: 'conference',
      status: 'published',
      isPublished: true,
      dates: { start: eventStart, end: eventEnd },
      venue: {
        name: 'Metropolis Convention & Tech Center',
        address: '450 Innovation Parkway, Suite 100',
        city: 'San Francisco, CA',
        mapUrl: 'https://maps.google.com/?q=Metropolis+Center',
      },
      capacity: 500,
      expectedAttendance: 500,
      organizerId: organizer._id,
      organizationId: organization._id,
      settings: {
        registrationOpen: true,
        allowWaitlist: true,
        requireApproval: false,
        ticketPrice: 0,
        currency: 'USD',
      },
      readinessScore: 82,
    });

    // Rooms
    console.log('[Seed] Creating venue rooms...');
    const [hallA, hallB, roomC, workshopRoom] = await Promise.all([
      Room.create({
        eventId: event._id,
        name: 'Hall A (Main Stage)',
        capacity: 400,
        equipment: ['4K Projector', 'Lavalier Microphones', 'Livestream Deck', 'Stage Lighting'],
        location: 'Level 1 - East Wing',
      }),
      Room.create({
        eventId: event._id,
        name: 'Hall B (Breakout Track)',
        capacity: 150,
        equipment: ['Dual Projectors', 'Wireless Microphones', 'Sound Reinforcement'],
        location: 'Level 1 - West Wing',
      }),
      Room.create({
        eventId: event._id,
        name: 'Room C (Seminar & Demos)',
        capacity: 80,
        equipment: ['Digital Display', 'Whiteboards', 'Surround Audio'],
        location: 'Level 2 - North Corridor',
      }),
      Room.create({
        eventId: event._id,
        name: 'Workshop Room (Hands-on Lab)',
        capacity: 60,
        equipment: ['High-Density Power Outlets', 'Dedicated Gigabit Wi-Fi', 'Dual Displays'],
        location: 'Level 2 - South Wing',
      }),
    ]);

    // Speakers
    console.log('[Seed] Creating speakers...');
    const [speaker1, speaker2, speaker3, speaker4] = await Promise.all([
      Speaker.create({
        eventId: event._id,
        userId: speakerUser._id,
        name: 'Dr. Elena Vance',
        title: 'VP of AI Research',
        company: 'DeepScale Labs',
        bio: 'Pioneering researcher in distributed agentic workflows and human-aligned decision models.',
        avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=250&q=80',
        email: 'speaker@eventforge.demo',
      }),
      Speaker.create({
        eventId: event._id,
        name: 'Marcus Sterling',
        title: 'Chief Security Architect',
        company: 'Sentinel Cloud',
        bio: 'Specialist in zero-trust perimeter defense and resilient mission-critical infrastructure.',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=250&q=80',
        email: 'marcus@sentinelcloud.demo',
      }),
      Speaker.create({
        eventId: event._id,
        name: 'Priya Sharma',
        title: 'Head of Systems Reliability',
        company: 'Atlas Infrastructure',
        bio: 'Leading site reliability engineer focused on real-time event telemetry and failover strategies.',
        avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=250&q=80',
        email: 'priya@atlas.demo',
      }),
      Speaker.create({
        eventId: event._id,
        name: 'David Kim',
        title: 'Principal Design Director',
        company: 'HumanInterface Studio',
        bio: 'Design strategist championing calm technology, editorial layouts, and purposeful interfaces.',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=250&q=80',
        email: 'david@humaninterface.demo',
      }),
    ]);

    // Sessions
    console.log('[Seed] Creating sessions...');
    const d1 = new Date(eventStart);
    const sessions = await Promise.all([
      Session.create({
        eventId: event._id,
        title: 'Opening Keynote: The Future of Autonomous Event Systems',
        description: 'How modern operational intelligence is replacing fragmented spreadsheets and messaging groups with calm, unified platforms.',
        speakerIds: [speaker1._id],
        roomId: hallA._id,
        startAt: new Date(d1.getFullYear(), d1.getMonth(), d1.getDate(), 9, 0),
        endAt: new Date(d1.getFullYear(), d1.getMonth(), d1.getDate(), 10, 0),
        capacity: 400,
        expectedAttendees: 380,
        track: 'Keynote',
        type: 'keynote',
      }),
      Session.create({
        eventId: event._id,
        title: 'Workshop: Building Multi-Agent Production Workflows',
        description: 'Interactive coding workshop on deploying resilient subagent teams with shared state and deterministic verification.',
        speakerIds: [speaker1._id],
        roomId: workshopRoom._id,
        startAt: new Date(d1.getFullYear(), d1.getMonth(), d1.getDate(), 10, 15),
        endAt: new Date(d1.getFullYear(), d1.getMonth(), d1.getDate(), 11, 45),
        capacity: 60,
        expectedAttendees: 85, // Deliberate capacity pressure for Event Twin!
        track: 'Engineering',
        type: 'workshop',
      }),
      Session.create({
        eventId: event._id,
        title: 'Talk: Zero-Trust Security in Distributed Systems',
        description: 'Hardening modern REST APIs, cookie authentication, and perimeter isolation against credential stuffing and CSRF.',
        speakerIds: [speaker2._id],
        roomId: hallB._id,
        startAt: new Date(d1.getFullYear(), d1.getMonth(), d1.getDate(), 10, 15),
        endAt: new Date(d1.getFullYear(), d1.getMonth(), d1.getDate(), 11, 15),
        capacity: 150,
        expectedAttendees: 130,
        track: 'Security',
        type: 'talk',
      }),
      Session.create({
        eventId: event._id,
        title: 'Panel: Scaling Engineering Teams from 10 to 100',
        description: 'Uncensored lessons on engineering management, async communications, and psychological safety in high-growth companies.',
        speakerIds: [speaker2._id, speaker3._id],
        roomId: hallA._id,
        startAt: new Date(d1.getFullYear(), d1.getMonth(), d1.getDate(), 11, 30),
        endAt: new Date(d1.getFullYear(), d1.getMonth(), d1.getDate(), 12, 30),
        capacity: 400,
        expectedAttendees: 260,
        track: 'Leadership',
        type: 'panel',
      }),
      Session.create({
        eventId: event._id,
        title: 'Deep Dive: Real-time Event Operations & Incident Response',
        description: 'Live walkthrough of real-time telemetry, QR scanner throughput metrics, and dynamic venue rerouting.',
        speakerIds: [speaker3._id],
        roomId: hallB._id,
        startAt: new Date(d1.getFullYear(), d1.getMonth(), d1.getDate(), 13, 30),
        endAt: new Date(d1.getFullYear(), d1.getMonth(), d1.getDate(), 14, 45),
        capacity: 150,
        expectedAttendees: 110,
        track: 'Operations',
        type: 'talk',
      }),
      Session.create({
        eventId: event._id,
        title: 'Closing Keynote: Designing Human-Centric Software',
        description: 'Why the best enterprise and operations tools feel calm, trustworthy, and editorial rather than noisy and cybernetic.',
        speakerIds: [speaker4._id],
        roomId: hallA._id,
        startAt: new Date(d1.getFullYear(), d1.getMonth(), d1.getDate(), 15, 0),
        endAt: new Date(d1.getFullYear(), d1.getMonth(), d1.getDate(), 16, 15),
        capacity: 400,
        expectedAttendees: 360,
        track: 'Design',
        type: 'keynote',
      }),
      Session.create({
        eventId: event._id,
        title: 'Networking & Community Showcase',
        description: 'Mingle with speakers, sponsors, and fellow organizers over refreshments in the central concourse.',
        speakerIds: [],
        roomId: hallA._id,
        startAt: new Date(d1.getFullYear(), d1.getMonth(), d1.getDate(), 16, 30),
        endAt: new Date(d1.getFullYear(), d1.getMonth(), d1.getDate(), 18, 0),
        capacity: 400,
        expectedAttendees: 300,
        track: 'Community',
        type: 'networking',
      }),
    ]);

    // Volunteers (8 volunteers)
    console.log('[Seed] Creating volunteers...');
    const volunteers = await Promise.all([
      Volunteer.create({
        eventId: event._id,
        userId: volunteerUser._id,
        name: 'Alex Chen',
        email: 'volunteer@eventforge.demo',
        phone: '+1 (555) 234-5678',
        role: 'Registration',
        assignedLocation: 'Main Foyer - Desk 1',
        status: 'Available',
      }),
      Volunteer.create({
        eventId: event._id,
        name: 'Sarah Jenkins',
        email: 'sarah.j@eventforge.demo',
        phone: '+1 (555) 345-6789',
        role: 'Registration',
        assignedLocation: 'Main Foyer - Desk 2',
        status: 'Available',
      }),
      Volunteer.create({
        eventId: event._id,
        name: 'Carlos Ortiz',
        email: 'carlos.o@eventforge.demo',
        phone: '+1 (555) 456-7890',
        role: 'Stage',
        assignedLocation: 'Hall A (Main Stage)',
        status: 'On Shift',
      }),
      Volunteer.create({
        eventId: event._id,
        name: 'Maya Patel',
        email: 'maya.p@eventforge.demo',
        phone: '+1 (555) 567-8901',
        role: 'Technical',
        assignedLocation: 'Hall B AV Booth',
        status: 'Available',
      }),
      Volunteer.create({
        eventId: event._id,
        name: 'Liam Brooks',
        email: 'liam.b@eventforge.demo',
        phone: '+1 (555) 678-9012',
        role: 'Technical',
        assignedLocation: 'Workshop Room Lab',
        status: 'Available',
      }),
      Volunteer.create({
        eventId: event._id,
        name: 'Emily Zhao',
        email: 'emily.z@eventforge.demo',
        phone: '+1 (555) 789-0123',
        role: 'Hospitality',
        assignedLocation: 'Metropolis Green Room',
        status: 'Available',
      }),
      Volunteer.create({
        eventId: event._id,
        name: 'Noah Taylor',
        email: 'noah.t@eventforge.demo',
        phone: '+1 (555) 890-1234',
        role: 'Crowd Management',
        assignedLocation: 'Central Concourse Crossway',
        status: 'Available',
      }),
      Volunteer.create({
        eventId: event._id,
        name: 'Chloe Bennett',
        email: 'chloe.b@eventforge.demo',
        phone: '+1 (555) 901-2345',
        role: 'Help Desk',
        assignedLocation: 'Info & Badge Help Counter',
        status: 'Available',
      }),
    ]);

    // Tasks (16 tasks with owners, priorities, and statuses)
    console.log('[Seed] Creating operational tasks...');
    const tasks = await Promise.all([
      Task.create({
        eventId: event._id,
        title: 'Sound check & lapel microphones in Hall A',
        description: 'Verify wireless frequency bands and test live feedback levels for keynote speaker.',
        dueAt: new Date(d1.getFullYear(), d1.getMonth(), d1.getDate(), 8, 0),
        status: 'Completed',
        priority: 'Critical',
        location: 'Hall A (Main Stage)',
        category: 'Stage',
        volunteerId: volunteers[2]._id, // Carlos
      }),
      Task.create({
        eventId: event._id,
        title: 'Verify badge printer paper and QR scanner terminals',
        description: 'Check connectivity of all 4 scanner iPads to local Wi-Fi and verify thermal badge rolls.',
        dueAt: new Date(d1.getFullYear(), d1.getMonth(), d1.getDate(), 8, 15),
        status: 'Completed',
        priority: 'Critical',
        location: 'Main Foyer',
        category: 'Registration',
        volunteerId: volunteers[0]._id, // Alex
      }),
      Task.create({
        eventId: event._id,
        title: 'Setup live stream encoder and camera feeds for keynote',
        description: 'Connect SDI inputs to Blackmagic switcher and test stream broadcast to remote attendees.',
        dueAt: new Date(d1.getFullYear(), d1.getMonth(), d1.getDate(), 8, 30),
        status: 'In Progress',
        priority: 'Critical',
        location: 'Hall A AV Deck',
        category: 'Technical',
        volunteerId: volunteers[2]._id,
      }),
      Task.create({
        eventId: event._id,
        title: 'Stage speaker green room coffee, water, and AV clickers',
        description: 'Ensure bottled water and presentation remote clickers with fresh AAA batteries are set.',
        dueAt: new Date(d1.getFullYear(), d1.getMonth(), d1.getDate(), 8, 15),
        status: 'Completed',
        priority: 'Medium',
        location: 'Metropolis Green Room',
        category: 'Hospitality',
        volunteerId: volunteers[5]._id, // Emily
      }),
      Task.create({
        eventId: event._id,
        title: 'Inspect emergency fire exits and first-aid kits',
        description: 'Confirm all illuminated exit corridors are clear of vendor boxes and medical kit is stocked.',
        dueAt: new Date(d1.getFullYear(), d1.getMonth(), d1.getDate(), 8, 0),
        status: 'Completed',
        priority: 'Critical',
        location: 'Facility Perimeter',
        category: 'Safety',
        ownerId: organizer._id,
      }),
      Task.create({
        eventId: event._id,
        title: 'Configure high-density Wi-Fi router in Workshop Room',
        description: 'Allocate dedicated 5GHz channel for hands-on agent workshop code downloads.',
        dueAt: new Date(d1.getFullYear(), d1.getMonth(), d1.getDate(), 9, 30),
        status: 'In Progress',
        priority: 'High',
        location: 'Workshop Room',
        category: 'Technical',
        volunteerId: volunteers[4]._id, // Liam
      }),
      Task.create({
        eventId: event._id,
        title: 'Directional floor signage between Hall A and Hall B',
        description: 'Place stanchions and arrow boards directing crowd flow toward breakout halls.',
        dueAt: new Date(d1.getFullYear(), d1.getMonth(), d1.getDate(), 8, 45),
        status: 'In Progress',
        priority: 'Medium',
        location: 'Central Concourse',
        category: 'Operations',
        volunteerId: volunteers[6]._id, // Noah
      }),
      Task.create({
        eventId: event._id,
        title: 'Catering delivery confirmation for lunch buffet',
        description: 'Verify vegetarian, vegan, and gluten-free dietary labels with Metropolis Bistro.',
        dueAt: new Date(d1.getFullYear(), d1.getMonth(), d1.getDate(), 10, 0),
        status: 'Completed',
        priority: 'High',
        location: 'Dining Hall',
        category: 'Hospitality',
        volunteerId: volunteers[5]._id,
      }),
      Task.create({
        eventId: event._id,
        title: 'Test backup handheld microphones for audience Q&A',
        description: 'Ensure 2 wireless handheld mics are stationed at center aisle for panel session.',
        dueAt: new Date(d1.getFullYear(), d1.getMonth(), d1.getDate(), 10, 45),
        status: 'Not Started',
        priority: 'Critical',
        location: 'Hall A',
        category: 'Stage',
        volunteerId: volunteers[2]._id,
      }),
      Task.create({
        eventId: event._id,
        title: 'Distribute attendee feedback QR cards to session room tables',
        description: 'Leave feedback table-tents in Hall B and Workshop Room.',
        dueAt: new Date(d1.getFullYear(), d1.getMonth(), d1.getDate(), 12, 0),
        status: 'Not Started',
        priority: 'Low',
        location: 'Breakout Rooms',
        category: 'Marketing',
        volunteerId: volunteers[1]._id, // Sarah
      }),
      Task.create({
        eventId: event._id,
        title: 'VIP speaker escort for Dr. Elena Vance',
        description: 'Meet keynote speaker at VIP arrival portico and guide to Green Room.',
        dueAt: new Date(d1.getFullYear(), d1.getMonth(), d1.getDate(), 8, 20),
        status: 'Not Started',
        priority: 'High',
        location: 'VIP Entrance',
        category: 'Speakers',
        // Deliberately unassigned for Event Twin risk detection!
        ownerId: null,
        volunteerId: null,
      }),
      Task.create({
        eventId: event._id,
        title: 'Setup overflow seating in Room C if workshop hits capacity',
        description: 'Prepare 30 folding chairs and configure relay screen if needed.',
        dueAt: new Date(d1.getFullYear(), d1.getMonth(), d1.getDate(), 9, 45),
        status: 'Completed',
        priority: 'Medium',
        location: 'Room C',
        category: 'Operations',
        volunteerId: volunteers[6]._id,
      }),
      Task.create({
        eventId: event._id,
        title: 'Evening networking beverages & glassware staging',
        description: 'Coordinate with beverage vendor for 4:30 PM delivery at central lounge.',
        dueAt: new Date(d1.getFullYear(), d1.getMonth(), d1.getDate(), 15, 30),
        status: 'Not Started',
        priority: 'Low',
        location: 'Central Concourse',
        category: 'Hospitality',
        volunteerId: volunteers[5]._id,
      }),
      Task.create({
        eventId: event._id,
        title: 'Slide deck collection from afternoon speakers',
        description: 'Gather final presentation PDF/PPTs from Marcus and Priya onto master drive.',
        dueAt: new Date(d1.getFullYear(), d1.getMonth(), d1.getDate(), 13, 0),
        status: 'Not Started',
        priority: 'Medium',
        location: 'Hall B',
        category: 'Stage',
        volunteerId: volunteers[3]._id, // Maya
      }),
      Task.create({
        eventId: event._id,
        title: 'Lost & Found logging box setup at Help Desk',
        description: 'Set out secure box and QR logging sheet for items misplaced during sessions.',
        dueAt: new Date(d1.getFullYear(), d1.getMonth(), d1.getDate(), 8, 30),
        status: 'Completed',
        priority: 'Low',
        location: 'Info Counter',
        category: 'Operations',
        volunteerId: volunteers[7]._id, // Chloe
      }),
      Task.create({
        eventId: event._id,
        title: 'Post-event survey email preparation in dashboard',
        description: 'Draft recap announcement with link to slide repository.',
        dueAt: new Date(d1.getFullYear(), d1.getMonth(), d1.getDate(), 17, 0),
        status: 'Not Started',
        priority: 'Medium',
        location: 'Organizer Suite',
        category: 'Communications',
        ownerId: organizer._id,
      }),
    ]);

    // Announcements
    console.log('[Seed] Creating announcements...');
    await Promise.all([
      Announcement.create({
        eventId: event._id,
        title: 'Welcome to EventForge Summit 2026!',
        body: 'Registration desks are now open at the Main Entrance. High-speed guest Wi-Fi network is Metropolis_Guest (No password required). Opening remarks start promptly at 9:00 AM in Hall A.',
        audience: 'Everyone',
        isUrgent: false,
        authorId: organizer._id,
        sentAt: new Date(d1.getFullYear(), d1.getMonth(), d1.getDate(), 8, 0),
      }),
      Announcement.create({
        eventId: event._id,
        title: 'Notice: Workshop Room seating density alert',
        body: 'The 10:15 AM Agent Workshop has reached capacity in Workshop Room. Overflow audio & live-screen view is available right next door in Room C.',
        audience: 'Attendees',
        isUrgent: true,
        authorId: organizer._id,
        sentAt: new Date(d1.getFullYear(), d1.getMonth(), d1.getDate(), 10, 10),
      }),
      Announcement.create({
        eventId: event._id,
        title: 'Morning Operations Crew Briefing at 08:15 AM',
        body: 'All volunteers please assemble by the Main Entrance Info Counter for a 10-minute briefing and radio assignment.',
        audience: 'Volunteers',
        isUrgent: false,
        authorId: organizer._id,
        sentAt: new Date(d1.getFullYear(), d1.getMonth(), d1.getDate(), 7, 45),
      }),
    ]);

    // Registrations (26 realistic attendees: 12 checked in, 14 pending)
    console.log('[Seed] Creating realistic attendee registrations and check-ins...');
    const sampleAttendees = [
      { name: 'Maya Lin', email: 'attendee@eventforge.demo', company: 'DeepScale Labs', checkedIn: true },
      { name: 'Lucas Scott', email: 'lucas.s@techinnovate.io', company: 'Tech Innovate', checkedIn: true },
      { name: 'Amara Okafor', email: 'amara.o@cloudcore.com', company: 'CloudCore Systems', checkedIn: true },
      { name: 'Devin Larson', email: 'devin@larsonlabs.dev', company: 'Larson Labs', checkedIn: true },
      { name: 'Sofia Rodriguez', email: 'sofia.r@vectorai.tech', company: 'Vector AI', checkedIn: true },
      { name: 'Nikhil Rao', email: 'nrao@quantumanalytics.org', company: 'Quantum Analytics', checkedIn: true },
      { name: 'Claire Dubois', email: 'claire.d@hexagonal.fr', company: 'Hexagonal Dev', checkedIn: true },
      { name: 'Tariq Al-Mansoor', email: 'tariq@vertexcloud.ae', company: 'Vertex Cloud', checkedIn: true },
      { name: 'Hannah Wright', email: 'hwright@strataworks.co', company: 'StrataWorks', checkedIn: true },
      { name: 'Ethan Zhao', email: 'ethan.zhao@nextfrontier.com', company: 'NextFrontier', checkedIn: true },
      { name: 'Jessica Vance', email: 'jvance@biotechforward.org', company: 'BioTech Forward', checkedIn: true },
      { name: 'Aaron Patel', email: 'aaron.p@hyperioneng.io', company: 'Hyperion Engineering', checkedIn: true },
      // Not yet checked in:
      { name: 'Rachel Green', email: 'rgreen@centralperk.demo', company: 'Green Global', checkedIn: false },
      { name: 'Ross Geller', email: 'rgeller@museumny.demo', company: 'NY Sciences', checkedIn: false },
      { name: 'Chandler Bing', email: 'cbing@dataanalytics.demo', company: 'Statistical Analysis', checkedIn: false },
      { name: 'Monica Geller', email: 'mgeller@culinarypro.demo', company: 'Metropolis Bistro', checkedIn: false },
      { name: 'Joey Tribbiani', email: 'jtribbiani@actingtalent.demo', company: 'Tribbiani Media', checkedIn: false },
      { name: 'Phoebe Buffay', email: 'pbuffay@musicwellness.demo', company: 'Harmonic Sounds', checkedIn: false },
      { name: 'Grace Hopper', email: 'grace.h@computingpioneer.org', company: 'Naval Computing', checkedIn: false },
      { name: 'Alan Turing', email: 'alan.t@enigmasec.uk', company: 'Bletchley Labs', checkedIn: false },
      { name: 'Ada Lovelace', email: 'ada.l@analyticalengine.org', company: 'Algorithmic Guild', checkedIn: false },
      { name: 'Claude Shannon', email: 'shannon@belllabs.demo', company: 'Information Theory Inst.', checkedIn: false },
      { name: 'Margaret Hamilton', email: 'mhamilton@apolloflight.gov', company: 'Apollo Software Org', checkedIn: false },
      { name: 'Tim Berners-Lee', email: 'timbl@worldwideweb.org', company: 'W3C Foundation', checkedIn: false },
      { name: 'Linus Torvalds', email: 'torvalds@kernelworks.org', company: 'OpenSource OS Guild', checkedIn: false },
      { name: 'Donald Knuth', email: 'knuth@algorithmica.edu', company: 'Stanford CS', checkedIn: false },
    ];

    const createdRegistrations = [];
    for (let i = 0; i < sampleAttendees.length; i++) {
      const att = sampleAttendees[i];
      const ticketCode = `EF-2026-${String(1001 + i)}`;
      const qrPayload = JSON.stringify({
        t: ticketCode,
        e: event._id.toString(),
        n: att.name,
        m: att.email,
      });

      const checkInTime = att.checkedIn
        ? new Date(d1.getFullYear(), d1.getMonth(), d1.getDate(), 8, 10 + i * 2)
        : null;

      const reg = await Registration.create({
        eventId: event._id,
        userId: att.email === 'attendee@eventforge.demo' ? attendeeUser._id : null,
        attendeeName: att.name,
        attendeeEmail: att.email,
        company: att.company,
        ticketCode,
        status: 'confirmed',
        checkInAt: checkInTime,
        checkedInBy: att.checkedIn ? organizer._id : null,
        qrPayload,
      });

      createdRegistrations.push(reg);

      if (att.checkedIn) {
        await CheckIn.create({
          eventId: event._id,
          registrationId: reg._id,
          ticketCode,
          scannedAt: checkInTime,
          scannerUserId: organizer._id,
          status: 'success',
          method: 'qr',
        });
      }
    }

    // Feedback entries
    console.log('[Seed] Creating feedback ratings...');
    await Promise.all([
      Feedback.create({
        eventId: event._id,
        registrationId: createdRegistrations[0]._id,
        ratings: { overall: 5, session: 5, venue: 5, organization: 5 },
        comment: 'Superbly managed event. Registration was instant with the QR code and the session timeline was crisp and readable.',
        submittedAt: new Date(d1.getFullYear(), d1.getMonth(), d1.getDate(), 12, 30),
      }),
      Feedback.create({
        eventId: event._id,
        registrationId: createdRegistrations[1]._id,
        ratings: { overall: 5, session: 4, venue: 5, organization: 5 },
        comment: 'Great acoustics in Hall A. The live updates on my phone kept me aware of room changes without digging through emails.',
        submittedAt: new Date(d1.getFullYear(), d1.getMonth(), d1.getDate(), 13, 0),
      }),
      Feedback.create({
        eventId: event._id,
        registrationId: createdRegistrations[2]._id,
        ratings: { overall: 4, session: 5, venue: 4, organization: 5 },
        comment: 'The agent workshop in Workshop Room was packed! Really glad they set up the overflow screen in Room C.',
        submittedAt: new Date(d1.getFullYear(), d1.getMonth(), d1.getDate(), 14, 0),
      }),
    ]);

    // Pre-calculate Event Twin Scenarios so Organizer Dashboard has live simulation data immediately
    console.log('[Seed] Generating initial Event Twin simulations...');
    // 1. Attendance Spike +30%
    const spikeResult = EventTwinEngine.simulate({
      event,
      rooms: [hallA, hallB, roomC, workshopRoom],
      sessions,
      volunteers,
      tasks,
      registrations: createdRegistrations,
      inputs: { attendanceMultiplier: 1.3 },
    });

    await Scenario.create({
      eventId: event._id,
      name: 'Attendance increases by 30%',
      scenarioType: 'attendance_spike',
      inputs: { attendanceMultiplier: 1.3 },
      assumptions: spikeResult.assumptions,
      results: {
        overallRiskScore: spikeResult.overallRiskScore,
        status: spikeResult.status,
        summary: spikeResult.summary,
        warnings: spikeResult.warnings,
      },
      createdBy: organizer._id,
    });

    // 2. Room Unavailable (Workshop Room offline)
    const outageResult = EventTwinEngine.simulate({
      event,
      rooms: [hallA, hallB, roomC, workshopRoom],
      sessions,
      volunteers,
      tasks,
      registrations: createdRegistrations,
      inputs: { unavailableRoomId: workshopRoom._id },
    });

    await Scenario.create({
      eventId: event._id,
      name: 'Room becomes unavailable (Workshop Room)',
      scenarioType: 'room_unavailable',
      inputs: { unavailableRoomId: workshopRoom._id },
      assumptions: outageResult.assumptions,
      results: {
        overallRiskScore: outageResult.overallRiskScore,
        status: outageResult.status,
        summary: outageResult.summary,
        warnings: outageResult.warnings,
      },
      createdBy: organizer._id,
    });

    // 3. Two volunteers unavailable
    const volunteerShortageResult = EventTwinEngine.simulate({
      event,
      rooms: [hallA, hallB, roomC, workshopRoom],
      sessions,
      volunteers,
      tasks,
      registrations: createdRegistrations,
      inputs: { unavailableVolunteersCount: 2 },
    });

    await Scenario.create({
      eventId: event._id,
      name: 'Two volunteers unavailable',
      scenarioType: 'volunteer_shortage',
      inputs: { unavailableVolunteersCount: 2 },
      assumptions: volunteerShortageResult.assumptions,
      results: {
        overallRiskScore: volunteerShortageResult.overallRiskScore,
        status: volunteerShortageResult.status,
        summary: volunteerShortageResult.summary,
        warnings: volunteerShortageResult.warnings,
      },
      createdBy: organizer._id,
    });

    console.log('[Seed] Seeding completed successfully!');
    console.log('----------------------------------------------------');
    console.log('DEMO ACCOUNTS READY (Password: DemoPass123!):');
    console.log('• Organizer:  organizer@eventforge.demo');
    console.log('• Volunteer:  volunteer@eventforge.demo');
    console.log('• Attendee:   attendee@eventforge.demo');
    console.log('• Speaker:    speaker@eventforge.demo');
    console.log('• Admin:      admin@eventforge.demo');
    console.log('----------------------------------------------------');
    console.log(`Event Created: ${event.title} (ID: ${event._id}, Slug: ${event.slug})`);
    console.log(`Sessions: ${sessions.length} | Rooms: 4 | Volunteers: ${volunteers.length} | Attendees: ${createdRegistrations.length}`);
    console.log('----------------------------------------------------');

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('[Seed] Error during database seeding:', error);
    process.exit(1);
  }
};

seedData();
