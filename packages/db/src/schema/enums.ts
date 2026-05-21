import { pgEnum } from 'drizzle-orm/pg-core'

// Mirrors @dk/schemas/enums. When you change one, change the other.

export const campaignTypeEnum = pgEnum('campaign_type', ['weekly-carousel', 'newsletter', 'ad-variant'])

export const campaignStatusEnum = pgEnum('campaign_status', [
	'draft',
	'in_progress',
	'in_review',
	'approved',
	'published',
	'archived',
])

export const deliverableStatusEnum = pgEnum('deliverable_status', [
	'pending_generation',
	'variants_ready',
	'approved',
	'exported',
	'rejected',
])

export const complianceStatusEnum = pgEnum('compliance_status', [
	'pending',
	'passed',
	'flagged',
	'overridden',
	'rejected',
])

export const imageGeneratorEnum = pgEnum('image_generator', ['gpt-image-1', 'flux-1.1-pro'])

export const constraintCheckEnum = pgEnum('constraint_check', ['vision_model', 'text_classifier', 'text_presence'])

export const constraintSeverityEnum = pgEnum('constraint_severity', ['blocking', 'warning', 'info'])

export const profileStatusEnum = pgEnum('profile_status', ['draft', 'in_review', 'approved', 'deprecated'])

export const actorTypeEnum = pgEnum('actor_type', ['user', 'agent', 'system'])

export const roleNameEnum = pgEnum('role_name', [
	'designer',
	'compliance_reviewer',
	'profile_approver',
	'admin',
	'viewer',
])

export const decisionSubjectEnum = pgEnum('decision_subject', ['variant', 'deliverable', 'compliance_check', 'profile'])

export const decisionActionEnum = pgEnum('decision_action', ['approve', 'reject', 'override'])
