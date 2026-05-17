import { Persona, Jurisdiction } from './types';
// Note: RISK_ORDER lives in lib/config.ts — import from there

/** LexGuard brand gold — used in charts, accents, PDF export */
export const BRAND_GOLD = '#C9A84C';

export const PERSONAS: { value: Persona; label: string; icon: string; description: string }[] = [
  { value: 'employee', label: 'Employee', icon: '🧑‍💼', description: 'Employment & offer letters' },
  { value: 'freelancer', label: 'Freelancer', icon: '🧑‍🎨', description: 'Freelance & service contracts' },
  { value: 'consumer', label: 'Consumer', icon: '👤', description: 'Terms of service & subscriptions' },
  { value: 'tenant', label: 'Tenant', icon: '🏠', description: 'Rental & lease agreements' },
  { value: 'startup', label: 'Startup / Vendor', icon: '🏢', description: 'Vendor & partnership agreements' },
];

export const JURISDICTIONS: { value: Jurisdiction; label: string }[] = [
  { value: 'india', label: 'India' },
  { value: 'california', label: 'California, USA' },
  { value: 'new_york', label: 'New York, USA' },
  { value: 'uk', label: 'United Kingdom' },
  { value: 'eu', label: 'European Union' },
  { value: 'australia', label: 'Australia' },
  { value: 'canada', label: 'Canada' },
  { value: 'other', label: 'Other / Not Sure' },
];

export const DEMO_CONTRACTS = [
  {
    id: 'internship_trap',
    title: '⚠️ Internship Trap',
    subtitle: 'Tech startup internship agreement',
    text: `INTERNSHIP AGREEMENT

This Internship Agreement ("Agreement") is entered into between TechCorp Innovations Pvt. Ltd. ("Company") and the Intern.

1. INTELLECTUAL PROPERTY ASSIGNMENT
The Intern hereby irrevocably assigns to the Company all right, title, and interest in and to any and all inventions, innovations, improvements, developments, methods, designs, analyses, drawings, reports, and all similar or related information (whether patentable or not) which relate to the Company's actual or anticipated business, research and development or existing or future products or services and which are conceived, developed or made by the Intern during the period of the internship or at any time thereafter if such work relates to the Intern's activities during the internship. This assignment includes all work created during personal time, on personal devices, or outside of office hours.

2. NON-DISCLOSURE AND NON-COMPETE
The Intern agrees not to, for a period of 36 months following termination of this Agreement, engage in any business activity, whether as an employee, consultant, or otherwise, that competes directly or indirectly with the Company's current or future business lines, in any geography where the Company operates or intends to operate.

3. COMPENSATION
This internship is unpaid. The Intern acknowledges that the experience and training provided constitute sufficient consideration.

4. TERMINATION
The Company may terminate this Agreement at any time, for any reason, without notice and without any compensation or severance. The Intern must provide 60 days written notice to terminate.

5. MANDATORY ARBITRATION
Any dispute arising out of or relating to this Agreement shall be resolved exclusively through binding arbitration. The Intern waives all rights to bring claims in court, participate in class actions, or seek jury trial.

6. DATA COLLECTION
The Company reserves the right to monitor all communications, devices, and activities of the Intern during the internship period including personal email and social media accounts if accessed on company premises.

7. MODIFICATION
The Company reserves the right to modify the terms of this Agreement at any time without notice to the Intern. Continued participation in the internship constitutes acceptance of the modified terms.`
  },
  {
    id: 'freelancer_ip_heist',
    title: '💸 Freelancer IP Heist',
    subtitle: 'Creative agency project contract',
    text: `FREELANCE SERVICE AGREEMENT

This agreement is between Creative Agency LLC ("Client") and the Freelancer.

1. SERVICES AND DELIVERABLES
Freelancer will provide design services as directed by Client. Client may modify the scope of work at any time without additional compensation.

2. PAYMENT TERMS
Client will pay Freelancer within 90 days of invoice submission. Client reserves the right to withhold payment if deliverables do not meet subjective satisfaction standards as determined solely by Client. No kill fee or partial payment shall be owed if Client chooses to discontinue the project for any reason.

3. INTELLECTUAL PROPERTY
All work product, designs, concepts, drafts, and ideas shared during discussions (whether or not ultimately used) are the exclusive property of Client upon creation. Freelancer waives all moral rights. Freelancer may not display work in portfolio without written permission.

4. REVISIONS
Client may request unlimited revisions at no additional cost. Failure to complete revisions within 48 hours constitutes a breach of this agreement.

5. LIABILITY
Freelancer shall indemnify and hold harmless Client from any and all claims, damages, losses, costs, and expenses (including legal fees) arising out of Freelancer's performance under this Agreement.

6. EXCLUSIVITY
Freelancer agrees not to work with any other clients in the same industry vertical as Client for the duration of this project and 12 months thereafter.

7. CONFIDENTIALITY
Freelancer shall not disclose any information about this agreement, the work performed, or the compensation received to any third party, including other freelancers, professional networks, or rate databases.`
  },
  {
    id: 'app_privacy_horror',
    title: '📱 App Privacy Horror',
    subtitle: 'Consumer mobile app terms of service',
    text: `TERMS OF SERVICE AND PRIVACY POLICY

By downloading or using this application, you agree to these Terms.

1. DATA COLLECTION
We collect all information you provide plus: precise GPS location (always-on), microphone audio for "enhanced features", contacts list, browsing history, device identifiers, biometric data if available, and behavioral analytics including keystrokes. We may access your camera in the background.

2. DATA SHARING
We share your personal data with our partners, advertisers, data brokers, affiliated companies, and any third party we determine has a legitimate business interest. We are not responsible for how third parties use your data.

3. SUBSCRIPTION AND AUTO-RENEWAL
Your subscription automatically renews each month. You must cancel at least 7 days before the renewal date or you will be charged for the next period. No refunds are provided for partial periods. Prices may be increased at any time with 24 hours notice sent via in-app notification only.

4. CLASS ACTION WAIVER
You waive your right to participate in any class action lawsuit against us. All disputes must be resolved through individual binding arbitration in our home jurisdiction.

5. LIMITATION OF LIABILITY
Our total liability to you for any claim shall not exceed $1. This limitation applies regardless of the form of action and regardless of whether we have been advised of the possibility of damages.

6. CONTENT LICENSE
By posting any content, you grant us a perpetual, irrevocable, worldwide, royalty-free license to use, reproduce, modify, adapt, publish, translate, distribute, and display your content in any media.

7. CHANGES TO TERMS
We may change these terms at any time. Your continued use of the app constitutes acceptance. We are not required to notify you of changes.`
  }
];

export const RISK_COLORS: Record<string, string> = {
  CRITICAL: '#E63946',
  HIGH: '#FF6B35',
  MEDIUM: '#FF9F1C',
  LOW: '#FFD166',
  SAFE: '#2DC653',
};

/** Trust Grade palette (A = green → F = danger red) */
export const GRADE_COLOR: Record<string, string> = {
  A: '#2DC653',
  B: '#4361EE',
  C: '#FF9F1C',
  D: '#FF6B35',
  F: '#E63946',
};

export const RISK_BG: Record<string, string> = {
  CRITICAL: 'rgba(230,57,70,0.12)',
  HIGH: 'rgba(255,107,53,0.12)',
  MEDIUM: 'rgba(255,159,28,0.12)',
  LOW: 'rgba(255,209,102,0.1)',
  SAFE: 'rgba(45,198,83,0.1)',
};
