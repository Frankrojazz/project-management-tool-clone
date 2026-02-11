import { Goal, InboxItem, Project, Task, User } from './types';

export const users: User[] = [
  { id: 'u1', name: 'Sarah Chen', avatar: 'SC', color: '#8B5CF6', type: 'human', email: 'sarah@projectify.io' },
  { id: 'u2', name: 'Alex Rivera', avatar: 'AR', color: '#3B82F6', type: 'human', email: 'alex@projectify.io' },
  { id: 'u3', name: 'Jordan Lee', avatar: 'JL', color: '#10B981', type: 'human', email: 'jordan@projectify.io' },
  { id: 'u4', name: 'Morgan Kim', avatar: 'MK', color: '#F59E0B', type: 'human', email: 'morgan@projectify.io' },
  { id: 'u5', name: 'Taylor Swift', avatar: 'TS', color: '#EF4444', type: 'human', email: 'taylor@projectify.io' },

  // GPT Collaborators (virtual, no login)
  {
    id: 'gpt-pm',
    name: 'PM GPT',
    avatar: 'PM',
    color: '#7C3AED',
    type: 'gpt',
    responsibilities:
      'Plan sprints, write user stories, clarify requirements, create acceptance criteria, and keep tasks aligned to goals.',
    promptTemplate:
      'You are PM GPT for Projectify. Provide a clear plan with scope, milestones, risks, and acceptance criteria. Output in Markdown with headings and checklists.',
    links: [
      { label: 'Product Brief', url: 'https://example.com/product-brief' },
      { label: 'Roadmap', url: 'https://example.com/roadmap' },
    ],
  },
  {
    id: 'gpt-qa',
    name: 'QA GPT',
    avatar: 'QA',
    color: '#0EA5E9',
    type: 'gpt',
    responsibilities:
      'Create test plans, edge cases, regression suites, and checklists. Summarize bugs with repro steps and expected/actual results.',
    promptTemplate:
      'You are QA GPT. Generate a concise test plan with scenarios, test data, and edge cases. Include a regression checklist.',
    links: [{ label: 'QA Checklist', url: 'https://example.com/qa-checklist' }],
  },
  {
    id: 'gpt-dev',
    name: 'Dev GPT',
    avatar: 'DV',
    color: '#10B981',
    type: 'gpt',
    responsibilities:
      'Propose implementation steps, code structure, and review pull requests. Provide pseudocode and code snippets when needed.',
    promptTemplate:
      'You are Dev GPT. Propose an implementation plan, data model changes, and code-level steps. Be specific and concise.',
    links: [{ label: 'Architecture Notes', url: 'https://example.com/architecture' }],
  },
];

export const projects: Project[] = [
  {
    id: 'p1',
    name: 'Website Redesign',
    color: '#8B5CF6',
    icon: '🎨',
    description: 'Complete overhaul of the company website with modern design',
    isFavorite: true,
  },
  {
    id: 'p2',
    name: 'Mobile App',
    color: '#3B82F6',
    icon: '📱',
    description: 'Native mobile application for iOS and Android',
    isFavorite: true,
  },
  {
    id: 'p3',
    name: 'Marketing Campaign',
    color: '#10B981',
    icon: '📢',
    description: 'Q4 marketing campaign planning and execution',
    isFavorite: false,
  },
  {
    id: 'p4',
    name: 'API Integration',
    color: '#F59E0B',
    icon: '🔗',
    description: 'Third-party API integrations and microservices',
    isFavorite: false,
  },
];

let idCounter = 100;
const genId = () => `task-${idCounter++}`;

export const initialTasks: Task[] = [
  // Website Redesign tasks
{
  id: genId(), title: 'Design new homepage layout', description: 'Create wireframes and mockups for the new homepage design including hero section, features, and testimonials.',
  status: 'in_progress', priority: 'high', assigneeId: 'u1', projectId: 'p1',
  dueDate: '2025-07-15', startDate: '2025-07-01', tags: ['design', 'homepage'], completed: false, createdAt: '2025-06-10',
  goalId: 'g1',
  keyResultId: 'kr1',
  subtasks: [
    { id: 's1', title: 'Research competitor sites', completed: true },
    { id: 's2', title: 'Create wireframes', completed: true },
    { id: 's3', title: 'Design high-fidelity mockup', completed: false },
  ],
},
{
  id: genId(), title: 'Achieve 90+ Lighthouse score', description: 'Optimize performance to reach 90+ Lighthouse score across all devices.',
  status: 'todo', priority: 'high', assigneeId: 'u3', projectId: 'p1',
  dueDate: '2025-07-25', startDate: '2025-07-10', tags: ['performance', 'optimization'], completed: false, createdAt: '2025-06-20',
  goalId: 'g1',
  keyResultId: 'kr2',
  subtasks: [],
},
  {
    id: genId(), title: 'Implement responsive navigation', description: 'Build a mobile-friendly navigation component with hamburger menu.',
    status: 'todo', priority: 'medium', assigneeId: 'u2', projectId: 'p1',
    dueDate: '2025-07-20', startDate: '2025-07-10', tags: ['frontend', 'navigation'], completed: false, createdAt: '2025-06-11',
    subtasks: [],
  },
  {
    id: genId(), title: 'Set up design system tokens', description: 'Define color palette, typography, spacing, and other design tokens.',
    status: 'done', priority: 'high', assigneeId: 'u1', projectId: 'p1',
    dueDate: '2025-06-30', startDate: '2025-06-20', tags: ['design-system'], completed: true, createdAt: '2025-06-05',
    subtasks: [],
  },
  {
    id: genId(), title: 'Create footer component', description: 'Design and implement the footer with links, social icons, and newsletter signup.',
    status: 'todo', priority: 'low', assigneeId: null, projectId: 'p1',
    dueDate: '2025-08-01', startDate: '2025-07-25', tags: ['frontend'], completed: false, createdAt: '2025-06-12',
    subtasks: [],
  },
  {
    id: genId(), title: 'Optimize images and assets', description: 'Compress and convert images to WebP, set up lazy loading.',
    status: 'in_review', priority: 'medium', assigneeId: 'u3', projectId: 'p1',
    dueDate: '2025-07-18', startDate: '2025-07-08', tags: ['performance'], completed: false, createdAt: '2025-06-14',
    subtasks: [],
  },
  {
    id: genId(), title: 'Accessibility audit', description: 'Run WCAG 2.1 compliance checks and fix identified issues.',
    status: 'todo', priority: 'high', assigneeId: 'u2', projectId: 'p1',
    dueDate: '2025-07-25', startDate: '2025-07-15', tags: ['a11y'], completed: false, createdAt: '2025-06-15',
    subtasks: [],
  },

  // Mobile App tasks
  {
    id: genId(), title: 'Set up React Native project', description: 'Initialize the React Native project with TypeScript and essential dependencies.',
    status: 'done', priority: 'high', assigneeId: 'u2', projectId: 'p2',
    dueDate: '2025-06-20', startDate: '2025-06-15', tags: ['setup'], completed: true, createdAt: '2025-06-08',
    subtasks: [],
  },
  {
    id: genId(), title: 'Design login & signup screens', description: 'Create UI designs for authentication flow.',
    status: 'in_progress', priority: 'high', assigneeId: 'u1', projectId: 'p2',
    dueDate: '2025-07-10', startDate: '2025-07-01', tags: ['design', 'auth'], completed: false, createdAt: '2025-06-10',
    subtasks: [
      { id: 's4', title: 'Login screen design', completed: true },
      { id: 's5', title: 'Signup screen design', completed: false },
      { id: 's6', title: 'Password reset flow', completed: false },
    ],
  },
  {
    id: genId(), title: 'Implement push notifications', description: 'Set up Firebase Cloud Messaging for push notifications.',
    status: 'todo', priority: 'medium', assigneeId: 'u3', projectId: 'p2',
    dueDate: '2025-08-05', startDate: '2025-07-28', tags: ['backend', 'notifications'], completed: false, createdAt: '2025-06-12',
    subtasks: [],
  },
  {
    id: genId(), title: 'Build user profile screen', description: 'Create profile screen with avatar, settings, and preferences.',
    status: 'in_review', priority: 'medium', assigneeId: 'u4', projectId: 'p2',
    dueDate: '2025-07-22', startDate: '2025-07-12', tags: ['frontend', 'profile'], completed: false, createdAt: '2025-06-14',
    subtasks: [],
  },
  {
    id: genId(), title: 'API client setup', description: 'Configure axios/fetch client with auth interceptors and error handling.',
    status: 'done', priority: 'high', assigneeId: 'u2', projectId: 'p2',
    dueDate: '2025-06-25', startDate: '2025-06-18', tags: ['api'], completed: true, createdAt: '2025-06-09',
    subtasks: [],
  },

  // Marketing Campaign tasks
  {
    id: genId(), title: 'Define target audience personas', description: 'Research and document target audience segments and personas.',
    status: 'done', priority: 'high', assigneeId: 'u4', projectId: 'p3',
    dueDate: '2025-06-25', startDate: '2025-06-18', tags: ['research'], completed: true, createdAt: '2025-06-05',
    subtasks: [],
  },
  {
    id: genId(), title: 'Create social media content calendar', description: 'Plan 3 months of social media posts across all platforms.',
    status: 'in_progress', priority: 'high', assigneeId: 'u4', projectId: 'p3',
    dueDate: '2025-07-14', startDate: '2025-07-01', tags: ['social-media', 'content'], completed: false, createdAt: '2025-06-10',
    subtasks: [
      { id: 's7', title: 'Instagram content plan', completed: true },
      { id: 's8', title: 'Twitter content plan', completed: true },
      { id: 's9', title: 'LinkedIn content plan', completed: false },
    ],
  },
  {
    id: genId(), title: 'Design email templates', description: 'Create responsive email templates for newsletter and promotional campaigns.',
    status: 'todo', priority: 'medium', assigneeId: 'u1', projectId: 'p3',
    dueDate: '2025-07-28', startDate: '2025-07-18', tags: ['design', 'email'], completed: false, createdAt: '2025-06-12',
    subtasks: [],
  },
  {
    id: genId(), title: 'Set up analytics tracking', description: 'Implement UTM tracking and conversion pixels.',
    status: 'todo', priority: 'medium', assigneeId: 'u3', projectId: 'p3',
    dueDate: '2025-07-20', startDate: '2025-07-12', tags: ['analytics'], completed: false, createdAt: '2025-06-14',
    subtasks: [],
  },
  {
    id: genId(), title: 'Launch landing page A/B test', description: 'Create two versions of the landing page and run A/B test.',
    status: 'todo', priority: 'high', assigneeId: 'u1', projectId: 'p3',
    dueDate: '2025-07-30', startDate: '2025-07-20', tags: ['testing', 'landing-page'], completed: false, createdAt: '2025-06-16',
    subtasks: [],
  },

  // API Integration tasks
  {
    id: genId(), title: 'Payment gateway integration', description: 'Integrate Stripe for payment processing including subscriptions.',
    status: 'in_progress', priority: 'urgent', assigneeId: 'u2', projectId: 'p4',
    dueDate: '2025-07-10', startDate: '2025-06-28', tags: ['payments', 'stripe'], completed: false, createdAt: '2025-06-08',
    subtasks: [
      { id: 's10', title: 'Setup Stripe SDK', completed: true },
      { id: 's11', title: 'Implement checkout flow', completed: false },
      { id: 's12', title: 'Handle webhooks', completed: false },
    ],
  },
  {
    id: genId(), title: 'OAuth 2.0 implementation', description: 'Add Google and GitHub OAuth login support.',
    status: 'todo', priority: 'high', assigneeId: 'u3', projectId: 'p4',
    dueDate: '2025-07-25', startDate: '2025-07-15', tags: ['auth', 'oauth'], completed: false, createdAt: '2025-06-10',
    subtasks: [],
  },
  {
    id: genId(), title: 'Email service integration', description: 'Set up SendGrid for transactional and marketing emails.',
    status: 'in_review', priority: 'medium', assigneeId: 'u5', projectId: 'p4',
    dueDate: '2025-07-15', startDate: '2025-07-05', tags: ['email', 'sendgrid'], completed: false, createdAt: '2025-06-12',
    subtasks: [],
  },
  {
    id: genId(), title: 'Rate limiting middleware', description: 'Implement API rate limiting to prevent abuse.',
    status: 'todo', priority: 'medium', assigneeId: null, projectId: 'p4',
    dueDate: '2025-08-01', startDate: '2025-07-22', tags: ['security', 'api'], completed: false, createdAt: '2025-06-14',
    subtasks: [],
  },
  {
    id: genId(), title: 'Webhook system architecture', description: 'Design and implement a webhook delivery system for external integrations.',
    status: 'todo', priority: 'high', assigneeId: 'u5', projectId: 'p4',
    dueDate: '2025-07-30', startDate: '2025-07-20', tags: ['architecture', 'webhooks'], completed: false, createdAt: '2025-06-15',
    subtasks: [],
  },
];

export const initialGoals: Goal[] = [
  {
    id: 'g1',
    title: 'Launch new website by Q3',
    description: 'Complete the full website redesign and deploy to production before the end of Q3 2025.',
    status: 'on_track',
    progress: 45,
    owner: 'u1',
    dueDate: '2025-09-30',
    projectIds: ['p1'],
    parentGoalId: null,
    keyResults: [
      { id: 'kr1', title: 'Complete all page designs', current: 4, target: 8, unit: 'pages' },
      { id: 'kr2', title: 'Achieve 90+ Lighthouse score', current: 72, target: 90, unit: 'score' },
      { id: 'kr3', title: 'Zero critical accessibility issues', current: 3, target: 0, unit: 'issues' },
    ],
  },
  {
    id: 'g2',
    title: 'Ship mobile app v1.0',
    description: 'Release the first version of the mobile application on both iOS and Android app stores.',
    status: 'at_risk',
    progress: 30,
    owner: 'u2',
    dueDate: '2025-10-15',
    projectIds: ['p2'],
    parentGoalId: null,
    keyResults: [
      { id: 'kr4', title: 'Core features implemented', current: 3, target: 10, unit: 'features' },
      { id: 'kr5', title: 'Beta testers onboarded', current: 15, target: 50, unit: 'users' },
      { id: 'kr6', title: 'Crash-free rate', current: 94, target: 99, unit: '%' },
    ],
  },
  {
    id: 'g3',
    title: 'Increase brand awareness by 40%',
    description: 'Drive brand visibility through social media, content marketing, and paid campaigns.',
    status: 'on_track',
    progress: 60,
    owner: 'u4',
    dueDate: '2025-12-31',
    projectIds: ['p3'],
    parentGoalId: null,
    keyResults: [
      { id: 'kr7', title: 'Social media followers', current: 12000, target: 20000, unit: 'followers' },
      { id: 'kr8', title: 'Monthly website visitors', current: 35000, target: 50000, unit: 'visitors' },
      { id: 'kr9', title: 'Email subscribers', current: 4500, target: 8000, unit: 'subscribers' },
    ],
  },
  {
    id: 'g4',
    title: 'Complete all API integrations',
    description: 'Integrate all third-party APIs and ensure stable microservice architecture.',
    status: 'off_track',
    progress: 20,
    owner: 'u3',
    dueDate: '2025-08-31',
    projectIds: ['p4'],
    parentGoalId: null,
    keyResults: [
      { id: 'kr10', title: 'APIs integrated', current: 2, target: 6, unit: 'integrations' },
      { id: 'kr11', title: 'API uptime', current: 97, target: 99.9, unit: '%' },
      { id: 'kr12', title: 'Average response time', current: 450, target: 200, unit: 'ms' },
    ],
  },
  {
    id: 'g5',
    title: 'Achieve 95% customer satisfaction',
    description: 'Improve overall customer satisfaction score through better products and support.',
    status: 'achieved',
    progress: 100,
    owner: 'u1',
    dueDate: '2025-06-30',
    projectIds: ['p1', 'p2'],
    parentGoalId: null,
    keyResults: [
      { id: 'kr13', title: 'NPS Score', current: 72, target: 70, unit: 'score' },
      { id: 'kr14', title: 'Support ticket resolution', current: 98, target: 95, unit: '%' },
    ],
  },
];

export const initialInbox: InboxItem[] = [
  {
    id: 'in1', type: 'assignment', message: 'Alex Rivera assigned you "Design email templates"',
    taskId: null, projectId: 'p3', timestamp: '2025-07-06T10:30:00', read: false,
    recipientId: 'u1', actorId: 'u2',
  },
  {
    id: 'in2', type: 'completion', message: 'Jordan Lee completed "Optimize images and assets"',
    taskId: null, projectId: 'p1', timestamp: '2025-07-06T09:15:00', read: false,
    recipientId: 'u1', actorId: 'u3',
  },
  {
    id: 'in3', type: 'due_soon', message: '"Payment gateway integration" is due tomorrow',
    taskId: null, projectId: 'p4', timestamp: '2025-07-06T08:00:00', read: false,
    recipientId: 'u2', actorId: 'system',
  },
  {
    id: 'in4', type: 'comment', message: 'Morgan Kim commented on "Create social media content calendar"',
    taskId: null, projectId: 'p3', timestamp: '2025-07-05T16:45:00', read: true,
    recipientId: 'u4', actorId: 'u5',
  },
  {
    id: 'in5', type: 'mention', message: 'You were mentioned in "API client setup"',
    taskId: null, projectId: 'p2', timestamp: '2025-07-05T14:20:00', read: true,
    recipientId: 'u3', actorId: 'u2',
  },
  {
    id: 'in6', type: 'assignment', message: 'New task "Accessibility audit" assigned to you',
    taskId: null, projectId: 'p1', timestamp: '2025-07-05T11:00:00', read: true,
    recipientId: 'u2', actorId: 'u1',
  },
  {
    id: 'in7', type: 'completion', message: 'Team completed 5 tasks in "Website Redesign"',
    taskId: null, projectId: 'p1', timestamp: '2025-07-04T17:30:00', read: true,
    recipientId: 'gpt-pm', actorId: 'system',
  },
  {
    id: 'in8', type: 'assignment', message: 'PM GPT assigned to "Design new homepage layout" for planning',
    taskId: 'task-100', projectId: 'p1', timestamp: '2025-07-06T11:45:00', read: false,
    recipientId: 'gpt-pm', actorId: 'u1',
  },
  {
    id: 'in9', type: 'completion', message: 'QA GPT completed test plan for "Implement push notifications"',
    taskId: null, projectId: 'p2', timestamp: '2025-07-06T10:20:00', read: false,
    recipientId: 'gpt-qa', actorId: 'u3',
  },
  {
    id: 'in10', type: 'comment', message: 'Dev GPT provided implementation steps for "OAuth 2.0 implementation"',
    taskId: null, projectId: 'p4', timestamp: '2025-07-05T15:30:00', read: true,
    recipientId: 'gpt-dev', actorId: 'u2',
  },
];
